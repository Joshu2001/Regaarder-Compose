/**
 * SheetEngineService.js
 *
 * WHY THIS EXISTS:
 * The AI should never write directly to the sheet canvas. Instead, it outputs
 * a structured Sheet Specification (JSON/DSL), which this service validates
 * before the Rendering Engine ever touches the UI. This makes the backend the
 * single source of truth for correctness, permissions, undo-stack entries, and
 * error recovery — identical in spirit to how a type-system prevents runtime
 * crashes before they reach the user.
 *
 * PIPELINE:
 *   User Prompt
 *     → callGemini (structured schema mode)
 *     → AI outputs SheetSpec JSON
 *     → createSheet(spec)          ← this file
 *         → validateSheetSpec()    returns { ok: true } | { ok: false, errors[] }
 *         → if ok: push to undo stack, return { success: true, validatedSpec }
 *         → if !ok: return { success: false, error }
 *     → SheetRenderingEngine receives validatedSpec
 *     → AI receives tool result and relays outcome to User
 */

// ─── Allowed Value Sets (The Grammar / Protocol) ──────────────────────────────
// These constants define the "presentation language" for sheets. The AI can
// only select from values declared here; anything outside is rejected by the
// validator, preventing layout chaos and brand inconsistencies.

// ─── Allowed Value Sets (The Grammar / Protocol) ──────────────────────────────
// These constants define the "presentation language" for sheets. The AI can
// only select from values declared here; anything outside is rejected by the
// validator, preventing layout chaos and brand inconsistencies.

export const ALLOWED_LAYOUTS = [
  'budgeting', 'cash_flow', 'sales_tracking', 'inventory',
  'runway_calculator', 'revenue_forecast', 'pricing_simulator', 'ltv_cac',
  'payroll_hiring', 'cap_table', 'financial_projection', 'investment_return',
  'monte_carlo', 'breakeven_analysis', 'market_sizing', 'swot_matrix',
  'risk_matrix', 'sensitivity_analysis', 'scenario_planning', 'hiring_tradeoff'
];

export const ALLOWED_PALETTES = ['slate-dark', 'emerald-glow', 'aurora-indigo', 'amber-warm'];

export const ALLOWED_TYPOGRAPHY = ['modern', 'compact', 'executive'];

export const COLUMN_TYPES = ['text', 'currency', 'number', 'percentage', 'date', 'status', 'progress'];

// ─── Gemini JSON Schema for Structured Output ─────────────────────────────────
// Passed directly to callGemini({ schema: SHEET_SPEC_GEMINI_SCHEMA }) so that
// Gemini's API enforces the shape at the model level before we even parse.

export const SHEET_SPEC_GEMINI_SCHEMA = {
  type: 'OBJECT',
  properties: {
    layout: {
      type: 'STRING',
      description: `One of: ${ALLOWED_LAYOUTS.join(', ')}`,
    },
    palette: {
      type: 'STRING',
      description: `One of: ${ALLOWED_PALETTES.join(', ')}`,
    },
    typography: {
      type: 'STRING',
      description: `One of: ${ALLOWED_TYPOGRAPHY.join(', ')}`,
    },
    title: {
      type: 'STRING',
      description: 'Human-readable title for the generated sheet, max 60 chars.',
    },
    summaryCards: {
      type: 'BOOLEAN',
      description: 'Whether to render KPI summary cards above the data table.',
    },
    charts: {
      type: 'BOOLEAN',
      description: 'Whether to request chart visualizations alongside the table.',
    },
    columns: {
      type: 'ARRAY',
      description: 'Ordered column definitions for the grid.',
      items: {
        type: 'OBJECT',
        properties: {
          key: { type: 'STRING', description: 'Unique camelCase identifier.' },
          label: { type: 'STRING', description: 'Display header label.' },
          type: { type: 'STRING', description: `One of: ${COLUMN_TYPES.join(', ')}` },
          width: { type: 'NUMBER', description: 'Pixel width hint, 60–400.' },
          formula: { type: 'STRING', description: 'Optional. Expression referencing other column keys, e.g. "actual - budgeted".' },
        },
        required: ['key', 'label', 'type'],
      },
    },
    rows: {
      type: 'ARRAY',
      description: 'Data rows. Each row is a flat object keyed by column.key values.',
      items: {
        type: 'OBJECT',
        properties: {},
      },
    },
  },
  required: ['layout', 'palette', 'typography', 'title', 'summaryCards', 'columns', 'rows'],
};

// ─── System Prompt Sent to Gemini ─────────────────────────────────────────────
export const SHEET_ENGINE_SYSTEM_PROMPT = `You are the Regaarder Sheets AI Agent for Startups & Founders.
Your role is to PROPOSE a complete structured Sheet Specification JSON for financial models, scenario planning, and business analytics.

STRICT GRAMMAR RULES:
1. layout must be exactly one of: ${ALLOWED_LAYOUTS.join(', ')}
2. palette must be exactly one of: ${ALLOWED_PALETTES.join(', ')}
3. typography must be exactly one of: ${ALLOWED_TYPOGRAPHY.join(', ')}
4. Every column must have a unique key (camelCase), a label, and a valid type from: ${COLUMN_TYPES.join(', ')}
5. Column widths must be integers between 60 and 400.
6. Generate 6–15 realistic, coherent, high-executive value data rows with authentic formulas.
7. Return ONLY valid JSON matching the schema. No prose, no markdown fences.

MAP USER INTENTS TO LAYOUTS:
- "out of cash", "runway", "zero cash date", "cash depletion" → runway_calculator
- "hiring engineer vs marketing", "compare hiring", "headcount tradeoff" → hiring_tradeoff
- "cap table", "equity", "dilution", "investor ownership" → cap_table
- "LTV", "CAC", "unit economics", "payback period" → ltv_cac
- "pricing", "tier simulation", "ARPU", "monetization" → pricing_simulator
- "scenario", "bull case", "bear case", "base case" → scenario_planning
- "sensitivity analysis", "elasticity matrix" → sensitivity_analysis
- "breakeven", "fixed vs variable cost" → breakeven_analysis
- "monte carlo", "probability simulation" → monte_carlo
- "swot", "strategic matrix" → swot_matrix
- "risk matrix", "impact severity" → risk_matrix
- "payroll", "hiring costs", "comp plan" → payroll_hiring
- "revenue forecast", "ARR model" → revenue_forecast`;

// ─── Core Tool: validateSheetSpec ─────────────────────────────────────────────
/**
 * Validates a raw AI-proposed SheetSpec against the grammar rules.
 *
 * Returns { ok: true } when the spec is structurally valid and safe to render.
 * Returns { ok: false, errors: string[] } when one or more rules are violated.
 *
 * The renderer MUST NOT be called unless this function returns ok: true.
 *
 * @param {object} spec - The parsed JSON object from Gemini's response.
 * @returns {{ ok: boolean, errors?: string[] }}
 */
export function validateSheetSpec(spec) {
  const errors = [];

  if (!spec || typeof spec !== 'object') {
    return { ok: false, errors: ['Spec must be a non-null object.'] };
  }

  // Rule 1: layout
  if (!ALLOWED_LAYOUTS.includes(spec.layout)) {
    errors.push(`Invalid layout "${spec.layout}". Allowed: ${ALLOWED_LAYOUTS.join(', ')}`);
  }

  // Rule 2: palette
  if (!ALLOWED_PALETTES.includes(spec.palette)) {
    errors.push(`Invalid palette "${spec.palette}". Allowed: ${ALLOWED_PALETTES.join(', ')}`);
  }

  // Rule 3: typography
  if (!ALLOWED_TYPOGRAPHY.includes(spec.typography)) {
    errors.push(`Invalid typography "${spec.typography}". Allowed: ${ALLOWED_TYPOGRAPHY.join(', ')}`);
  }

  // Rule 4: title
  if (typeof spec.title !== 'string' || !spec.title.trim()) {
    errors.push('title must be a non-empty string.');
  } else if (spec.title.length > 60) {
    errors.push('title must be 60 characters or fewer.');
  }

  // Rule 5: columns
  if (!Array.isArray(spec.columns) || spec.columns.length < 2) {
    errors.push('columns must be an array with at least 2 entries.');
  } else {
    const seenKeys = new Set();
    spec.columns.forEach((col, i) => {
      if (!col.key || typeof col.key !== 'string') {
        errors.push(`Column[${i}]: missing or invalid key.`);
      } else if (seenKeys.has(col.key)) {
        errors.push(`Column[${i}]: duplicate key "${col.key}".`);
      } else {
        seenKeys.add(col.key);
      }
      if (!col.label || typeof col.label !== 'string') {
        errors.push(`Column[${i}] ("${col.key || i}"): missing or invalid label.`);
      }
      if (!COLUMN_TYPES.includes(col.type)) {
        errors.push(`Column[${i}] ("${col.key || i}"): invalid type "${col.type}". Allowed: ${COLUMN_TYPES.join(', ')}`);
      }
      if (col.width !== undefined) {
        const w = Number(col.width);
        if (!Number.isInteger(w) || w < 60 || w > 400) {
          errors.push(`Column[${i}] ("${col.key || i}"): width must be an integer between 60 and 400.`);
        }
      }
    });
  }

  // Rule 6: rows
  if (!Array.isArray(spec.rows) || spec.rows.length < 1) {
    errors.push('rows must be a non-empty array.');
  } else if (spec.rows.length > 200) {
    errors.push('rows must not exceed 200 entries.');
  } else if (Array.isArray(spec.columns)) {
    const validKeys = new Set(spec.columns.map((c) => c.key));
    spec.rows.forEach((row, i) => {
      if (typeof row !== 'object' || row === null) {
        errors.push(`Row[${i}]: must be a non-null object.`);
        return;
      }
      Object.keys(row).forEach((k) => {
        if (!validKeys.has(k)) {
          errors.push(`Row[${i}]: unknown key "${k}" not declared in columns.`);
        }
      });
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return { ok: true };
}

// ─── Core Tool: createSheet ────────────────────────────────────────────────────
/**
 * The AI-callable tool. The AI proposes a spec; this function is the gatekeeper.
 *
 * Returns { success: true, validatedSpec } when the spec passes validation.
 * Returns { success: false, error, validationErrors } when it does not.
 *
 * The caller (App.jsx) is responsible for:
 *   - Pushing a snapshot to the undo stack BEFORE applying the spec.
 *   - Passing validatedSpec to SheetRenderingEngine only on success: true.
 *   - Surfacing the error message back through the AI chat on success: false.
 *
 * @param {object} rawSpec - The parsed JSON from Gemini.
 * @param {{ undoStack?: object[], onUndoPush?: function }} options
 * @returns {{ success: boolean, validatedSpec?: object, error?: string, validationErrors?: string[] }}
 */
export function createSheet(rawSpec, options = {}) {
  const { ok, errors } = validateSheetSpec(rawSpec);

  if (!ok) {
    return {
      success: false,
      error: `Sheet specification failed validation with ${errors.length} error(s).`,
      validationErrors: errors,
    };
  }

  // Backend is the source of truth — normalise the spec before handing it
  // to the renderer to guarantee consistent rendering regardless of what
  // Gemini sent.
  const validatedSpec = {
    layout: rawSpec.layout,
    palette: rawSpec.palette,
    typography: rawSpec.typography,
    title: String(rawSpec.title).trim().slice(0, 60),
    summaryCards: rawSpec.summaryCards !== false, // default true
    charts: rawSpec.charts === true,
    columns: rawSpec.columns.map((col) => ({
      key: col.key,
      label: col.label,
      type: col.type,
      width: col.width ? Math.min(400, Math.max(60, Number(col.width))) : 120,
      formula: col.formula || null,
    })),
    rows: rawSpec.rows,
    _meta: {
      generatedAt: new Date().toISOString(),
      source: 'gemini-tool-call',
    },
  };

  // Optionally record an undo snapshot before the canvas is mutated.
  if (typeof options.onUndoPush === 'function') {
    options.onUndoPush(validatedSpec);
  }

  return { success: true, validatedSpec };
}

// ─── Gemini Call Helper (Client-Side Orchestrator) ────────────────────────────
/**
 * Orchestrates the full AI → tool-call → renderer pipeline.
 *
 * Steps:
 *   1. Build a structured Gemini call with the Sheet grammar system prompt.
 *   2. Receive AI JSON output.
 *   3. Call createSheet() — the backend validator.
 *   4. Return a normalised result the caller can act on immediately.
 *
 * @param {string} userPrompt - Natural language request from the user.
 * @param {function} callGemini - The callGemini function from App.jsx.
 * @returns {Promise<{ success: boolean, validatedSpec?: object, error?: string, validationErrors?: string[], aiText?: string }>}
 */
export async function invokeSheetEngineTool(userPrompt, callGemini) {
  const res = await callGemini({
    userPrompt,
    systemPrompt: SHEET_ENGINE_SYSTEM_PROMPT,
    schema: SHEET_SPEC_GEMINI_SCHEMA,
  });

  // If Gemini itself failed (network error, bad API key, empty response)
  if (res.error) {
    return { success: false, error: `AI call failed: ${res.error}` };
  }

  const rawSpec = res.parsed;
  if (!rawSpec) {
    return { success: false, error: 'AI returned a response but it could not be parsed as JSON.' };
  }

  // createSheet() is the gatekeeper — AI proposed, backend decides.
  const toolResult = createSheet(rawSpec);

  return {
    ...toolResult,
    aiText: res.text,
  };
}

// ─── AI Sheet Context & Data Diagnosis Engine ────────────────────────────────
/**
 * Diagnoses active sheet grid context against user intent / selected AI Action.
 * Returns standardized state enums: EMPTY | PARTIAL | READY | AMBIGUOUS | UNSUPPORTED.
 *
 * Includes confidence score calculation for automatic 1-click execution.
 *
 * @param {object} gridData - Raw sheet grid data object ({ cells, rows, cols, ... })
 * @param {string} layoutKey - Target layout key ('budgeting', 'cash_flow', etc.)
 * @param {string} userPrompt - User's natural language input or click context
 * @returns {{ status: 'EMPTY'|'PARTIAL'|'READY'|'AMBIGUOUS'|'UNSUPPORTED', confidence: number, title: string, message: string, actions: Array<{ id: string, label: string, actionType: string, payload?: any }> }}
 */
export function diagnoseSheetContext(gridData, layoutKey, userPrompt = '') {
  const cells = Array.isArray(gridData?.cells) ? gridData.cells : [];
  let nonZeroCount = 0;
  const textTokens = [];

  for (let r = 0; r < cells.length; r++) {
    const row = cells[r];
    if (!Array.isArray(row)) continue;
    for (let c = 0; c < row.length; c++) {
      const val = String(row[c] || '').trim();
      if (val) {
        nonZeroCount++;
        textTokens.push(val.toLowerCase());
      }
    }
  }

  const promptLower = userPrompt.toLowerCase();
  const joinedText = textTokens.join(' ');

  // 1. EMPTY SHEET GRID
  if (nonZeroCount === 0) {
    const layoutNames = {
      budgeting: 'budget',
      cash_flow: 'cash flow model',
      sales_tracking: 'sales tracking pipeline',
      inventory: 'inventory tracker',
    };
    const targetName = layoutNames[layoutKey] || 'financial sheet';

    return {
      status: 'EMPTY',
      confidence: 100,
      title: `Build ${targetName.charAt(0).toUpperCase() + targetName.slice(1)}`,
      message: `I can help you build a ${targetName}. Since this sheet is empty, I'll ask a few questions or generate an excellent first draft tailored to your needs. What kind of ${targetName} would you like?`,
      actions: [
        {
          id: 'sub_startup',
          label: '🏢 Startup Operating Budget',
          actionType: 'GENERATE_DRAFT',
          payload: { layoutKey, subType: 'Startup Operating Budget', prompt: 'Create a startup operating budget with Monthly Revenue, COGS, Payroll, Marketing, and Net Margin.' },
        },
        {
          id: 'sub_personal',
          label: '👤 Personal Budget',
          actionType: 'GENERATE_DRAFT',
          payload: { layoutKey, subType: 'Personal Budget', prompt: 'Create a personal budget with Monthly Income, Rent, Utilities, Savings, and Discretionary expenses.' },
        },
        {
          id: 'sub_project',
          label: '📁 Project Budget',
          actionType: 'GENERATE_DRAFT',
          payload: { layoutKey, subType: 'Project Budget', payload: 'Create a project milestone budget tracking deliverables, estimated cost, actual cost, and variance.' },
        },
        {
          id: 'sub_department',
          label: '📈 Department Budget',
          actionType: 'GENERATE_DRAFT',
          payload: { layoutKey, subType: 'Department Budget', prompt: 'Create a corporate department budget with headcount allocation, software, travel, and quarterly variance.' },
        },
      ],
    };
  }

  // 2. DETECT EXISTING FINANCIAL / GRID DATA & CONFIDENCE SCORING
  const hasExpenseKeywords = /expense|cost|cogs|rent|salary|marketing|bill|payroll|vendor/i.test(joinedText);
  const hasRevenueKeywords = /revenue|income|sales|inflow|earning|deal|mrr|arr/i.test(joinedText);
  const hasPeriodKeywords = /jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|q1|q2|q3|q4|month|2026|2025/i.test(joinedText);

  let confidenceScore = 0;
  if (hasExpenseKeywords) confidenceScore += 35;
  if (hasRevenueKeywords) confidenceScore += 35;
  if (hasPeriodKeywords) confidenceScore += 26;
  if (nonZeroCount > 10) confidenceScore += 4;
  confidenceScore = Math.min(99, confidenceScore);

  // High confidence financial data found → READY state
  if (confidenceScore >= 70) {
    return {
      status: 'READY',
      confidence: confidenceScore,
      title: 'Financial Context Detected',
      message: `I'm ${confidenceScore}% confident this sheet contains existing financial data. I can convert this into a complete budget with variance analysis in 1 click.`,
      actions: [
        {
          id: 'generate_immediate',
          label: '✨ Create Budget from Data',
          actionType: 'GENERATE_IMMEDIATE',
          payload: { layoutKey, mode: 'from_existing_data' },
        },
        {
          id: 'ask_customization',
          label: '💬 Ask Follow-up Questions',
          actionType: 'TRIGGER_CUSTOMIZATION',
        },
      ],
    };
  }

  // Partial data detected (expenses without revenue) → PARTIAL state
  if (hasExpenseKeywords && !hasRevenueKeywords) {
    return {
      status: 'PARTIAL',
      confidence: 60,
      title: 'Partial Data: Missing Revenue Inputs',
      message: `I found expense records ($${nonZeroCount} entries) but no revenue data. Would you like me to create an expense budget only, or enter expected revenue assumptions?`,
      actions: [
        {
          id: 'expense_only',
          label: '📊 Expense-Only Budget',
          actionType: 'GENERATE_PARTIAL',
          payload: { layoutKey: 'budgeting', mode: 'expense_only' },
        },
        {
          id: 'estimate_revenue',
          label: '✨ Estimate Revenue Benchmarks',
          actionType: 'GENERATE_DRAFT',
          payload: { layoutKey: 'budgeting', prompt: 'Generate budget with expense records and estimated revenue streams.' },
        },
      ],
    };
  }

  // Ambiguous context → AMBIGUOUS state
  return {
    status: 'AMBIGUOUS',
    confidence: 45,
    title: 'Select Model Goal',
    message: 'What specific financial layout would best fit your current sheet objective?',
    actions: [
      {
        id: 'opt_operating',
        label: '🏢 Operating Budget',
        actionType: 'GENERATE_DRAFT',
        payload: { layoutKey: 'budgeting' },
      },
      {
        id: 'opt_cashflow',
        label: '💸 Cash Flow Model',
        actionType: 'GENERATE_DRAFT',
        payload: { layoutKey: 'cash_flow' },
      },
    ],
  };
}

// ─── Post-Render AI Analyst Review Engine ─────────────────────────────────────
/**
 * Inspects a generated or populated sheet grid and produces intelligent financial
 * analyst observations (anomalies, high cost ratios, variance alerts) and proactive follow-ups.
 *
 * @param {object} spec - Validated SheetSpec or native grid matrix
 * @returns {{ summary: string, anomaly: string|null, suggestions: Array<string> }}
 */
export function analyzeRenderedSheet(spec) {
  if (!spec || !Array.isArray(spec.rows)) {
    return {
      summary: 'Sheet created successfully with formulas and formatting.',
      anomaly: null,
      suggestions: ['Run variance analysis', 'Export to PDF'],
    };
  }

  let totalBudgeted = 0;
  let totalActual = 0;
  let marketingActual = 0;
  let payrollActual = 0;

  spec.rows.forEach(r => {
    const cat = String(r.category || r.key || r.label || '').toLowerCase();
    const budgeted = Number(r.budgeted || r.inflow || 0);
    const actual = Number(r.actual || r.outflow || 0);

    totalBudgeted += budgeted;
    totalActual += actual;

    if (cat.includes('marketing') || cat.includes('ads')) {
      marketingActual += actual;
    }
    if (cat.includes('salary') || cat.includes('payroll') || cat.includes('wages')) {
      payrollActual += actual;
    }
  });

  let anomaly = null;
  if (totalActual > 0 && marketingActual > 0) {
    const mktRatio = Math.round((marketingActual / totalActual) * 100);
    if (mktRatio > 20) {
      anomaly = `I noticed Marketing expenses ($${marketingActual.toLocaleString()}) represent ${mktRatio}% of total operating costs, which is unusually high. Would you like me to analyze cost optimization options?`;
    }
  }

  return {
    summary: `${spec.title || 'Sheet'} created successfully.`,
    anomaly,
    suggestions: [
      '📊 Run Variance Analysis',
      '⚙️ Customize Assumptions (Payroll / Growth / Currency)',
      '📥 Export Sheet Report',
    ],
  };
}

// ─── Native Grid Matrix Transformer ───────────────────────────────────────────
/**
 * Converts a backend-validated SheetSpec (headers, rows, palette, types)
 * into a native spreadsheet grid state object ({ cells, formats, rows, cols }).
 *
 * This writes directly into the actual interactive spreadsheet cells as if a human
 * entered the data, with styled headers, zebra striping, aligned numbers, and status badges.
 *
 * @param {object} spec - Validated SheetSpec object from createSheet()
 * @returns {{ cells: Array<Array<string>>, formats: object, rows: number, cols: number }}
 */
export function specToNativeGrid(spec) {
  if (!spec) return null;

  // Handle static presets where columns are array of strings and rows are array of objects with string/camelCase keys
  let normalizedCols = [];
  if (Array.isArray(spec.columns)) {
    normalizedCols = spec.columns.map((col, idx) => {
      if (typeof col === 'string') {
        // Derive key from string label (e.g. "Budgeted ($)" -> "budgeted")
        const key = col.toLowerCase().replace(/[^a-z0-9]/g, '');
        return { key, label: col, type: 'text' };
      }
      return col;
    });
  }

  if (normalizedCols.length === 0 || !Array.isArray(spec.rows)) return null;

  const totalCols = Math.max(26, normalizedCols.length);
  const totalRows = Math.max(30, spec.rows.length + 5);

  // Initialize empty grid matrix
  const cells = Array.from({ length: totalRows }, () => Array(totalCols).fill(''));
  const formats = {};

  // Header palette styles
  const headerBgs = {
    'slate-dark': '#1e293b',
    'emerald-glow': '#064e3b',
    'aurora-indigo': '#312e81',
    'amber-warm': '#78350f',
    'indigo': '#312e81',
    'emerald': '#064e3b',
  };
  const headerBg = headerBgs[spec.palette] || '#312e81';

  // Row 0: Column Headers
  formats[0] = {};
  normalizedCols.forEach((col, cIdx) => {
    cells[0][cIdx] = col.label;
    formats[0][cIdx] = {
      bg: headerBg,
      color: '#ffffff',
      fontWeight: 'bold',
      align: col.type === 'currency' || col.type === 'number' || col.type === 'percentage' ? 'right' : 'left',
    };
  });

  // Rows 1..N: Data Rows
  spec.rows.forEach((rowObj, rIdx) => {
    const gridRowIdx = rIdx + 1;
    formats[gridRowIdx] = {};

    normalizedCols.forEach((col, cIdx) => {
      // Find value either by exact key, normalized key, or object keys matching prefix
      let rawVal = rowObj[col.key];
      if (rawVal === undefined && typeof rowObj === 'object' && rowObj !== null) {
        const rowKeys = Object.keys(rowObj);
        const matchedKey = rowKeys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === col.key);
        if (matchedKey) rawVal = rowObj[matchedKey];
      }

      let displayVal = rawVal;
      let align = 'left';
      let fontColor = '#1e293b';
      let cellBg = (rIdx % 2 === 1) ? '#f8fafc' : '#ffffff';
      let fontWeight = 'normal';

      if (typeof rawVal === 'number') {
        if (col.type === 'currency' || col.label.includes('$')) {
          displayVal = rawVal < 0 ? `-$${Math.abs(rawVal).toLocaleString()}` : `$${rawVal.toLocaleString()}`;
          align = 'right';
          if (rawVal < 0) fontColor = '#dc2626';
        } else if (col.type === 'percentage' || col.label.includes('%')) {
          displayVal = `${rawVal}%`;
          align = 'right';
        } else {
          fontColor = '#4338ca';
          cellBg = '#eef2ff';
        }
      }

      cells[gridRowIdx][cIdx] = displayVal !== undefined && displayVal !== null ? String(displayVal) : '';
      formats[gridRowIdx][cIdx] = { bg: cellBg, color: fontColor, fontWeight, align };
    });
  });

  return { cells, formats, rows: totalRows, cols: totalCols };
}

// ─── Auto-Format Matrix & Grid Importer ───────────────────────────────────────
/**
 * Takes a raw 2D string/primitive matrix from a CSV/XLSX file import and produces
 * a polished, styled spreadsheet grid with formatted headers, auto-detected currency/percentages,
 * right-aligned numbers, and comfortable column widths.
 *
 * @param {Array<Array<any>>} matrix - Raw 2D row/col array
 * @returns {{ cells: Array<Array<string>>, formats: object, columnWidths: object, rows: number, cols: number }}
 */
export function autoFormatMatrixAndGrid(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    return { cells: [], formats: {}, columnWidths: {}, rows: 30, cols: 26 };
  }

  const dataRowsCount = matrix.length;
  let maxCols = 1;
  matrix.forEach(r => { if (Array.isArray(r) && r.length > maxCols) maxCols = r.length; });

  const reqRows = Math.max(dataRowsCount + 20, 100);
  const reqCols = Math.max(maxCols + 5, 26);

  const cells = Array.from({ length: reqRows }, () => Array(reqCols).fill(''));
  const formats = {};
  const columnWidths = {};

  // Detect column formatting heuristics by inspecting data rows
  const colFormats = [];
  for (let c = 0; c < maxCols; c++) {
    let headerText = String(matrix[0]?.[c] || '').trim();
    let isCurrencyCol = /revenue|price|cost|arpu|ltv|cac|budget|actual|amount|total|\$/i.test(headerText);
    let isPercentageCol = /margin|rate|churn|percent|pct|%|probability|growth/i.test(headerText);
    colFormats.push({ isCurrencyCol, isPercentageCol, maxCharLen: Math.max(headerText.length, 10) });
  }

  // Row 0: Dark Executive Styled Headers
  formats[0] = {};
  for (let c = 0; c < reqCols; c++) {
    const rawVal = matrix[0]?.[c] !== undefined && matrix[0]?.[c] !== null ? String(matrix[0][c]).trim() : '';
    cells[0][c] = rawVal;
    if (c < maxCols) {
      formats[0][c] = {
        bg: '#312e81',
        color: '#ffffff',
        fontWeight: 'bold',
        align: colFormats[c]?.isCurrencyCol || colFormats[c]?.isPercentageCol ? 'right' : 'left',
      };
    }
  }

  // Rows 1..N: Formatted Data Cells
  for (let r = 1; r < reqRows; r++) {
    formats[r] = {};
    const rawRow = r < matrix.length && Array.isArray(matrix[r]) ? matrix[r] : [];

    for (let c = 0; c < reqCols; c++) {
      const rawVal = rawRow[c] !== undefined && rawRow[c] !== null ? String(rawRow[c]).trim() : '';
      const cellBg = (r % 2 === 1) ? '#f8fafc' : '#ffffff';
      let fontColor = '#1e293b';
      let align = 'left';
      let formattedStr = rawVal;

      if (c < maxCols && rawVal !== '') {
        colFormats[c].maxCharLen = Math.max(colFormats[c].maxCharLen, rawVal.length);
        const num = Number(rawVal);
        const isNum = !Number.isNaN(num);

        if (isNum) {
          align = 'right';
          if (colFormats[c].isCurrencyCol || rawVal.includes('$')) {
            formattedStr = num < 0 ? `-$${Math.abs(num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          } else if (colFormats[c].isPercentageCol || rawVal.includes('%')) {
            // Handle decimal representation (e.g., 0.75 -> 75.0%, 0.0417 -> 4.17%)
            const pctVal = num <= 1 && num > 0 && !rawVal.includes('%') ? num * 100 : num;
            formattedStr = `${pctVal.toFixed(pctVal % 1 === 0 ? 1 : 2)}%`;
          } else {
            formattedStr = num.toLocaleString();
          }
        } else if (rawVal.toLowerCase().includes('month')) {
          align = 'center';
        }
      }

      cells[r][c] = formattedStr;
      formats[r][c] = { bg: cellBg, color: fontColor, fontWeight: 'normal', align };
    }
  }

  // Calculate pixel column widths so header text is never cut off
  colFormats.forEach((cf, cIdx) => {
    columnWidths[cIdx] = Math.min(320, Math.max(140, cf.maxCharLen * 11 + 24));
  });

  return { cells, formats, columnWidths, rows: reqRows, cols: reqCols };
}
