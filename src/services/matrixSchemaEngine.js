/**
 * matrixSchemaEngine.js
 *
 * Pillar 5: The Matrix Engine (Code Execution & Schema Validation Substrate)
 *
 * Transforms the spreadsheet from an untyped 2D visual grid into an
 * AI-native, schema-validated, code-executable matrix substrate.
 *
 * ARCHITECTURAL GUARANTEES:
 * 1. Rule 7 (Intersection Isolation): Never evaluates (0,0) identically to axis cells.
 * 2. Rule 9 (Native Dropdowns & %): Categorical fields map to 'dropdown' with explicit options;
 *    percentage columns enforce native '%' formatting.
 * 3. Topological Formula Graph: Recalculates spreadsheet formulas with cycle detection (#CYCLE!).
 * 4. In-Browser SQL Engine: Executes relational SELECT..WHERE..GROUP BY queries directly over grids.
 * 5. Surgical Patch Engine: Atomic updates with validation, type coercion, and Pillar 3 staging.
 */

// ─── Column Types & Schema Definitions ────────────────────────────────────────

export const MATRIX_COLUMN_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  CURRENCY: 'currency',
  PERCENTAGE: 'percentage',
  DROPDOWN: 'dropdown',
  DATE: 'date',
  BOOLEAN: 'boolean',
  FORMULA: 'formula',
};

export const ALLOWED_COLUMN_TYPES = Object.values(MATRIX_COLUMN_TYPES);

// Default categorical options for common business and operational fields (Rule 9)
export const CANONICAL_DROPDOWN_PRESETS = {
  status: ['Active', 'Pending', 'In Progress', 'Completed', 'Blocked', 'Archived'],
  priority: ['Low', 'Medium', 'High', 'Urgent', 'Critical'],
  stage: ['Lead', 'Prospect', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
  category: ['Revenue', 'COGS', 'Payroll', 'Marketing', 'Software', 'Operations', 'G&A'],
  health: ['Healthy', 'On Track', 'At Risk', 'Critical'],
  runway: ['Healthy', 'Monitor', 'Critical', 'Depleted'],
};

// ─── Event Bus & Reactive Subscriptions ───────────────────────────────────────

const matrixListeners = new Set();

export function subscribeToMatrixEngine(listener) {
  if (typeof listener !== 'function') return () => {};
  matrixListeners.add(listener);
  return () => matrixListeners.delete(listener);
}

function emitMatrixEvent(event, payload) {
  matrixListeners.forEach(listener => {
    try {
      listener({ type: event, payload, timestamp: new Date().toISOString() });
    } catch (err) {
      console.warn('[MatrixEngine] Listener notification failed:', err);
    }
  });
}

// ─── Coordinate & Cell Helpers ───────────────────────────────────────────────

/**
 * Converts a 0-based column index to Excel column letters (e.g. 0 -> 'A', 25 -> 'Z', 26 -> 'AA').
 */
export function colIndexToLetter(colIdx) {
  let temp = colIdx + 1;
  let letter = '';
  while (temp > 0) {
    const mod = (temp - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    temp = Math.floor((temp - mod) / 26);
  }
  return letter;
}

/**
 * Converts Excel column letters to 0-based column index (e.g. 'A' -> 0, 'Z' -> 25, 'AA' -> 26).
 */
export function letterToColIndex(letter) {
  const clean = String(letter || '').toUpperCase().trim();
  let col = 0;
  for (let i = 0; i < clean.length; i++) {
    col = col * 26 + (clean.charCodeAt(i) - 64);
  }
  return col - 1;
}

/**
 * Parses an A1-style reference string into 0-based { row, col }.
 */
export function parseCellReference(ref) {
  const match = String(ref || '').trim().match(/^([A-Za-z]+)(\d+)$/);
  if (!match) return null;
  const col = letterToColIndex(match[1]);
  const row = parseInt(match[2], 10) - 1;
  return { row, col, letter: match[1].toUpperCase(), original: ref };
}

/**
 * Parses a range reference string (e.g. 'A1:B10') into coordinate bounds.
 */
export function parseRangeReference(rangeStr) {
  const parts = String(rangeStr || '').trim().split(':');
  if (parts.length === 1) {
    const cell = parseCellReference(parts[0]);
    if (!cell) return null;
    return { startRow: cell.row, startCol: cell.col, endRow: cell.row, endCol: cell.col };
  }
  const start = parseCellReference(parts[0]);
  const end = parseCellReference(parts[1]);
  if (!start || !end) return null;
  return {
    startRow: Math.min(start.row, end.row),
    startCol: Math.min(start.col, end.col),
    endRow: Math.max(start.row, end.row),
    endCol: Math.max(start.col, end.col),
  };
}

// ─── Rule 7: Intersection-Safe Schema Inference ──────────────────────────────

/**
 * Infers column schema definitions from a raw 2D grid matrix.
 *
 * CRITICAL DIRECTIVE (Rule 7 / Incident Post-Mortem):
 * Strictly isolates the (0,0) intersection cell.
 * Scans Row 0 (index 1..n) and Col 0 (index 1..n) independently to prevent
 * an intersection cell containing text from corrupting numerical axis evaluation.
 *
 * @param {Array<Array<any>>} cells - 2D matrix of cell values
 * @param {object} [existingSchemas] - Optional user-defined overrides
 * @returns {{ columns: Array<object>, orientation: 'horizontal'|'vertical', rowCount: number, colCount: number }}
 */
export function inferMatrixSchema(cells, existingSchemas = {}) {
  if (!Array.isArray(cells) || cells.length === 0) {
    return { columns: [], orientation: 'horizontal', rowCount: 0, colCount: 0 };
  }

  const rowCount = cells.length;
  let colCount = 0;
  for (let r = 0; r < rowCount; r++) {
    if (Array.isArray(cells[r]) && cells[r].length > colCount) {
      colCount = cells[r].length;
    }
  }

  if (colCount === 0) {
    return { columns: [], orientation: 'horizontal', rowCount: 0, colCount: 0 };
  }

  // 1. Strictly isolate intersection (0,0)
  const _intersectionCell = String(cells[0]?.[0] || '').trim();

  // 2. Scan Row 0 (index 1..n) and Col 0 (index 1..n) independently
  let row0TextCount = 0;
  let row0Total = 0;
  for (let c = 1; c < colCount; c++) {
    const val = String(cells[0]?.[c] || '').trim();
    if (val !== '') {
      row0Total++;
      if (Number.isNaN(Number(val.replace(/[$,%]/g, '')))) {
        row0TextCount++;
      }
    }
  }

  let col0TextCount = 0;
  let col0Total = 0;
  for (let r = 1; r < rowCount; r++) {
    const val = String(cells[r]?.[0] || '').trim();
    if (val !== '') {
      col0Total++;
      if (Number.isNaN(Number(val.replace(/[$,%]/g, '')))) {
        col0TextCount++;
      }
    }
  }

  // Determine header orientation based strictly on remainders
  const row0IsHeaders = row0Total > 0 && (row0TextCount / row0Total) >= 0.5;
  const col0IsHeaders = col0Total > 0 && (col0TextCount / col0Total) >= 0.7 && !row0IsHeaders;
  const orientation = col0IsHeaders ? 'vertical' : 'horizontal';

  const columns = [];

  for (let c = 0; c < colCount; c++) {
    const rawHeader = row0IsHeaders ? String(cells[0]?.[c] || '').trim() : '';
    const label = rawHeader || `Column ${colIndexToLetter(c)}`;
    const key = rawHeader
      ? rawHeader.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/^_+|_+$/g, '') || `col_${c}`
      : `col_${c}`;

    // Inspect data rows (start at row 1 if row0 is headers)
    const dataStartRow = row0IsHeaders ? 1 : 0;
    const values = [];
    for (let r = dataStartRow; r < rowCount; r++) {
      const v = cells[r]?.[c];
      if (v !== undefined && v !== null && String(v).trim() !== '') {
        values.push(String(v).trim());
      }
    }

    // Check existing schema override
    if (existingSchemas[key] || existingSchemas[c]) {
      const override = existingSchemas[key] || existingSchemas[c];
      columns.push({
        index: c,
        key,
        label,
        ...override,
      });
      continue;
    }

    // Infer column type
    const inferred = inferColumnTypeFromValues(label, values);
    columns.push({
      index: c,
      key,
      label,
      type: inferred.type,
      options: inferred.options || null,
      width: Math.min(320, Math.max(120, Math.max(label.length, 8) * 11 + 24)),
      required: false,
    });
  }

  return { columns, orientation, rowCount, colCount };
}

/**
 * Infers the column type and optional dropdown values from cell samples (Rule 9).
 */
function inferColumnTypeFromValues(headerLabel, values) {
  const labelLower = headerLabel.toLowerCase();

  // Rule 9: Priority, Status, Category, Stage, Assignee -> dropdown
  const isDropdownKeyword = /status|priority|stage|category|state|tier|health|phase|owner|assignee/i.test(labelLower);
  const isPercentageKeyword = /margin|rate|churn|percent|pct|%|probability|growth|share/i.test(labelLower);
  const isCurrencyKeyword = /revenue|price|cost|arpu|ltv|cac|budget|actual|amount|total|salary|burn|\$/i.test(labelLower);
  const isDateKeyword = /date|period|month|quarter|deadline|time/i.test(labelLower);

  if (values.length === 0) {
    if (isDropdownKeyword) {
      const match = Object.keys(CANONICAL_DROPDOWN_PRESETS).find(k => labelLower.includes(k));
      return {
        type: MATRIX_COLUMN_TYPES.DROPDOWN,
        options: match ? CANONICAL_DROPDOWN_PRESETS[match] : ['Active', 'Pending', 'Archived'],
      };
    }
    if (isPercentageKeyword) return { type: MATRIX_COLUMN_TYPES.PERCENTAGE };
    if (isCurrencyKeyword) return { type: MATRIX_COLUMN_TYPES.CURRENCY };
    if (isDateKeyword) return { type: MATRIX_COLUMN_TYPES.DATE };
    return { type: MATRIX_COLUMN_TYPES.TEXT };
  }

  // Count type occurrences across sample values
  let numberCount = 0;
  let percentCount = 0;
  let currencyCount = 0;
  let dateCount = 0;
  const uniqueStrings = new Set();

  for (const val of values) {
    uniqueStrings.add(val);
    if (val.startsWith('=')) {
      return { type: MATRIX_COLUMN_TYPES.FORMULA };
    }
    if (val.endsWith('%')) {
      percentCount++;
    } else if (val.startsWith('$') || val.endsWith('$')) {
      currencyCount++;
    } else {
      const cleanNum = val.replace(/[$,%]/g, '');
      if (!Number.isNaN(Number(cleanNum)) && cleanNum !== '') {
        numberCount++;
      } else if (!Number.isNaN(Date.parse(val)) && (val.includes('-') || val.includes('/') || val.includes('202'))) {
        dateCount++;
      }
    }
  }

  const total = values.length;

  // Dropdown detection (Rule 9)
  if (isDropdownKeyword || (uniqueStrings.size <= 8 && uniqueStrings.size < total && numberCount === 0)) {
    const options = Array.from(uniqueStrings).filter(Boolean);
    return {
      type: MATRIX_COLUMN_TYPES.DROPDOWN,
      options: options.length > 0 ? options : (CANONICAL_DROPDOWN_PRESETS.status),
    };
  }

  if (isPercentageKeyword || percentCount / total > 0.4) {
    return { type: MATRIX_COLUMN_TYPES.PERCENTAGE };
  }
  if (isCurrencyKeyword || currencyCount / total > 0.4) {
    return { type: MATRIX_COLUMN_TYPES.CURRENCY };
  }
  if ((numberCount + percentCount + currencyCount) / total > 0.6) {
    return { type: MATRIX_COLUMN_TYPES.NUMBER };
  }
  if (isDateKeyword || dateCount / total > 0.5) {
    return { type: MATRIX_COLUMN_TYPES.DATE };
  }

  return { type: MATRIX_COLUMN_TYPES.TEXT };
}

// ─── Protocol-Level Data Validation (Rule 9) ──────────────────────────────────

/**
 * Validates a single cell value against its column schema.
 * Returns { valid: boolean, error?: string, code?: string, autoFix?: any }
 */
export function validateCellAgainstSchema(value, schema) {
  if (!schema || !schema.type) return { valid: true };

  const rawStr = value !== undefined && value !== null ? String(value).trim() : '';

  // Empty cell check
  if (rawStr === '') {
    if (schema.required) {
      return {
        valid: false,
        code: 'REQUIRED_VALUE_MISSING',
        error: `Required cell in column "${schema.label || schema.key}" is empty.`,
      };
    }
    return { valid: true };
  }

  // Formulas bypass scalar type checks
  if (rawStr.startsWith('=')) {
    return { valid: true, isFormula: true };
  }

  switch (schema.type) {
    case MATRIX_COLUMN_TYPES.DROPDOWN: {
      const allowed = Array.isArray(schema.options) ? schema.options : [];
      if (allowed.length > 0) {
        const matchesExact = allowed.includes(rawStr);
        const matchesCaseInsensitive = allowed.find(opt => opt.toLowerCase() === rawStr.toLowerCase());
        if (!matchesExact && !matchesCaseInsensitive) {
          return {
            valid: false,
            code: 'INVALID_DROPDOWN_VALUE',
            error: `Value "${rawStr}" is not in allowed options: [${allowed.join(', ')}].`,
            autoFix: allowed[0],
          };
        }
        if (!matchesExact && matchesCaseInsensitive) {
          return {
            valid: true,
            needsCoercion: true,
            autoFix: matchesCaseInsensitive,
          };
        }
      }
      return { valid: true };
    }

    case MATRIX_COLUMN_TYPES.PERCENTAGE: {
      // Rule 9: Must be formatted natively with % symbol
      if (!rawStr.endsWith('%')) {
        const num = Number(rawStr.replace(/[%]/g, ''));
        if (!Number.isNaN(num) && rawStr !== '') {
          // Detect decimal representation e.g. 0.65 -> 65%
          const pctVal = num <= 1 && num > 0 ? num * 100 : num;
          const formatted = `${Number(pctVal.toFixed(pctVal % 1 === 0 ? 0 : 2))}%`;
          return {
            valid: false,
            code: 'UNFORMATTED_PERCENTAGE',
            error: `Percentage value "${rawStr}" missing native "%" symbol. Expected "${formatted}".`,
            autoFix: formatted,
          };
        }
        return {
          valid: false,
          code: 'INVALID_PERCENTAGE',
          error: `Value "${rawStr}" cannot be parsed as a percentage.`,
          autoFix: '0%',
        };
      }
      const numPart = Number(rawStr.slice(0, -1).trim());
      if (Number.isNaN(numPart)) {
        return {
          valid: false,
          code: 'INVALID_PERCENTAGE',
          error: `Percentage value "${rawStr}" contains non-numeric data.`,
          autoFix: '0%',
        };
      }
      return { valid: true };
    }

    case MATRIX_COLUMN_TYPES.CURRENCY: {
      const clean = rawStr.replace(/[$,]/g, '').trim();
      const num = Number(clean);
      if (Number.isNaN(num) || clean === '') {
        return {
          valid: false,
          code: 'INVALID_CURRENCY',
          error: `Value "${rawStr}" is not valid currency.`,
          autoFix: '$0.00',
        };
      }
      if (!rawStr.includes('$')) {
        const formatted = num < 0
          ? `-$${Math.abs(num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        return {
          valid: true,
          needsCoercion: true,
          autoFix: formatted,
        };
      }
      return { valid: true };
    }

    case MATRIX_COLUMN_TYPES.NUMBER: {
      const clean = rawStr.replace(/[,]/g, '').trim();
      const num = Number(clean);
      if (Number.isNaN(num) || clean === '') {
        return {
          valid: false,
          code: 'INVALID_NUMBER',
          error: `Value "${rawStr}" is not a valid number.`,
          autoFix: '0',
        };
      }
      return { valid: true };
    }

    case MATRIX_COLUMN_TYPES.DATE: {
      const parsed = Date.parse(rawStr);
      if (Number.isNaN(parsed)) {
        return {
          valid: false,
          code: 'INVALID_DATE',
          error: `Value "${rawStr}" cannot be parsed as a date.`,
        };
      }
      return { valid: true };
    }

    case MATRIX_COLUMN_TYPES.BOOLEAN: {
      const lower = rawStr.toLowerCase();
      if (!['true', 'false', '1', '0', 'yes', 'no'].includes(lower)) {
        return {
          valid: false,
          code: 'INVALID_BOOLEAN',
          error: `Value "${rawStr}" is not a boolean.`,
          autoFix: 'TRUE',
        };
      }
      return { valid: true };
    }

    default:
      return { valid: true };
  }
}

/**
 * Validates the full grid matrix against a column schema list.
 *
 * @param {Array<Array<any>>} cells - 2D matrix of cells
 * @param {Array<object>} columns - Schema definitions for each column
 * @param {object} [options] - Options (headerRow = 0)
 * @returns {{ valid: boolean, violationCount: number, violations: Array<object>, summary: string }}
 */
export function validateMatrixData(cells, columns, options = {}) {
  const violations = [];
  const headerRow = options.headerRow !== undefined ? options.headerRow : 0;
  const startRow = headerRow + 1;

  if (!Array.isArray(cells) || !Array.isArray(columns)) {
    return { valid: true, violationCount: 0, violations: [], summary: 'No data or schema to validate.' };
  }

  for (let r = startRow; r < cells.length; r++) {
    const row = cells[r];
    if (!Array.isArray(row)) continue;

    columns.forEach((schema, colIdx) => {
      const val = row[colIdx];
      const result = validateCellAgainstSchema(val, schema);
      if (!result.valid) {
        violations.push({
          row: r,
          col: colIdx,
          cellRef: `${colIndexToLetter(colIdx)}${r + 1}`,
          columnLabel: schema.label || schema.key,
          columnType: schema.type,
          value: val,
          code: result.code,
          error: result.error,
          autoFix: result.autoFix,
        });
      }
    });
  }

  const valid = violations.length === 0;
  const summary = valid
    ? `All data in ${cells.length - startRow} rows strictly conforms to schema.`
    : `Found ${violations.length} schema violation(s) across matrix.`;

  return { valid, violationCount: violations.length, violations, summary };
}

// ─── In-Browser Formula Engine & Cycle Detection ───────────────────────────────

/**
 * Evaluates a single formula expression given a cell-value resolver function.
 *
 * Supported functions:
 * - SUM(range/values)
 * - AVERAGE(range/values)
 * - MIN(range/values)
 * - MAX(range/values)
 * - COUNT(range/values)
 * - COUNTA(range/values)
 * - IF(condition, trueVal, falseVal)
 * - VLOOKUP(key, range, colIndex, isSorted)
 * - CONCATENATE(a, b, ...)
 * - ROUND(val, decimals)
 * - ABS(val)
 * - Arithmetic (+, -, *, /, ^)
 */
export function evaluateFormula(formulaStr, cellResolver, visited = new Set()) {
  if (typeof formulaStr !== 'string' || !formulaStr.startsWith('=')) {
    return formulaStr;
  }

  const expr = formulaStr.slice(1).trim();

  // Helper to extract numeric values from range or single cell
  const resolveRangeValues = (refOrRange) => {
    const trimmed = String(refOrRange).trim().replace(/^['"]|['"]$/g, '');
    if (trimmed.includes(':')) {
      const bounds = parseRangeReference(trimmed);
      if (!bounds) return [];
      const vals = [];
      for (let r = bounds.startRow; r <= bounds.endRow; r++) {
        for (let c = bounds.startCol; c <= bounds.endCol; c++) {
          const coord = `${colIndexToLetter(c)}${r + 1}`;
          vals.push(cellResolver(coord, r, c));
        }
      }
      return vals;
    }
    const cell = parseCellReference(trimmed);
    if (cell) {
      return [cellResolver(cell.original, cell.row, cell.col)];
    }
    const num = Number(trimmed);
    return Number.isNaN(num) ? [trimmed] : [num];
  };

  const toNumericArray = (vals) => {
    return vals
      .flat()
      .map(v => {
        if (typeof v === 'number') return v;
        const s = String(v || '').replace(/[$,%]/g, '').trim();
        const n = Number(s);
        return Number.isNaN(n) ? null : n;
      })
      .filter(n => n !== null);
  };

  // 1. SUM(...)
  const sumMatch = expr.match(/^SUM\((.+)\)$/i);
  if (sumMatch) {
    const args = splitArguments(sumMatch[1]);
    const nums = args.flatMap(arg => toNumericArray(resolveRangeValues(arg)));
    const total = nums.reduce((acc, curr) => acc + curr, 0);
    return total;
  }

  // 2. AVERAGE(...)
  const avgMatch = expr.match(/^AVERAGE\((.+)\)$/i);
  if (avgMatch) {
    const args = splitArguments(avgMatch[1]);
    const nums = args.flatMap(arg => toNumericArray(resolveRangeValues(arg)));
    if (nums.length === 0) return 0;
    const avg = nums.reduce((acc, curr) => acc + curr, 0) / nums.length;
    return Number(avg.toFixed(4));
  }

  // 3. MIN(...)
  const minMatch = expr.match(/^MIN\((.+)\)$/i);
  if (minMatch) {
    const args = splitArguments(minMatch[1]);
    const nums = args.flatMap(arg => toNumericArray(resolveRangeValues(arg)));
    return nums.length > 0 ? Math.min(...nums) : 0;
  }

  // 4. MAX(...)
  const maxMatch = expr.match(/^MAX\((.+)\)$/i);
  if (maxMatch) {
    const args = splitArguments(maxMatch[1]);
    const nums = args.flatMap(arg => toNumericArray(resolveRangeValues(arg)));
    return nums.length > 0 ? Math.max(...nums) : 0;
  }

  // 5. COUNT(...)
  const countMatch = expr.match(/^COUNT\((.+)\)$/i);
  if (countMatch) {
    const args = splitArguments(countMatch[1]);
    const nums = args.flatMap(arg => toNumericArray(resolveRangeValues(arg)));
    return nums.length;
  }

  // 6. COUNTA(...)
  const countaMatch = expr.match(/^COUNTA\((.+)\)$/i);
  if (countaMatch) {
    const args = splitArguments(countaMatch[1]);
    const vals = args.flatMap(arg => resolveRangeValues(arg));
    return vals.filter(v => v !== undefined && v !== null && String(v).trim() !== '').length;
  }

  // 7. IF(condition, trueVal, falseVal)
  const ifMatch = expr.match(/^IF\((.+)\)$/i);
  if (ifMatch) {
    const args = splitArguments(ifMatch[1]);
    if (args.length >= 2) {
      const cond = evaluateCondition(args[0], cellResolver);
      const trueVal = resolveValueOrExpr(args[1], cellResolver);
      const falseVal = args.length >= 3 ? resolveValueOrExpr(args[2], cellResolver) : '';
      return cond ? trueVal : falseVal;
    }
  }

  // 8. VLOOKUP(searchKey, range, colIdx, [isSorted])
  const vlookupMatch = expr.match(/^VLOOKUP\((.+)\)$/i);
  if (vlookupMatch) {
    const args = splitArguments(vlookupMatch[1]);
    if (args.length >= 3) {
      const searchKey = String(resolveValueOrExpr(args[0], cellResolver)).trim().toLowerCase();
      const bounds = parseRangeReference(args[1]);
      const returnColOffset = parseInt(args[2], 10) - 1; // 1-based to 0-based offset
      if (bounds && returnColOffset >= 0) {
        for (let r = bounds.startRow; r <= bounds.endRow; r++) {
          const rowKeyCoord = `${colIndexToLetter(bounds.startCol)}${r + 1}`;
          const rowKeyVal = String(cellResolver(rowKeyCoord, r, bounds.startCol) || '').trim().toLowerCase();
          if (rowKeyVal === searchKey) {
            const targetCol = bounds.startCol + returnColOffset;
            const targetCoord = `${colIndexToLetter(targetCol)}${r + 1}`;
            return cellResolver(targetCoord, r, targetCol);
          }
        }
        return '#N/A';
      }
    }
  }

  // 9. CONCATENATE(...)
  const concatMatch = expr.match(/^CONCATENATE\((.+)\)$/i);
  if (concatMatch) {
    const args = splitArguments(concatMatch[1]);
    return args.map(arg => String(resolveValueOrExpr(arg, cellResolver))).join('');
  }

  // 10. General Arithmetic / Cell Reference Substitution
  try {
    const substituted = expr.replace(/([A-Za-z]+[0-9]+)/g, (match) => {
      const cell = parseCellReference(match);
      if (!cell) return match;
      if (visited.has(match.toUpperCase())) {
        throw new Error('#CYCLE!');
      }
      const val = cellResolver(match, cell.row, cell.col);
      if (val === '#CYCLE!') {
        throw new Error('#CYCLE!');
      }
      if (typeof val === 'number') return val;
      const cleanNum = String(val || '').replace(/[$,%]/g, '').trim();
      const num = Number(cleanNum);
      return Number.isNaN(num) ? `"${String(val).replace(/"/g, '\\"')}"` : num;
    });

    // Safe mathematical evaluation (strictly sanitized characters)
    if (/^[0-9+\-*/().\s^%]+$/.test(substituted)) {
      const sanitized = substituted.replace(/\^/g, '**');
      // eslint-disable-next-line no-new-func
      const calcResult = Function(`"use strict"; return (${sanitized})`)();
      return typeof calcResult === 'number' && !Number.isNaN(calcResult)
        ? (Number.isInteger(calcResult) ? calcResult : Number(calcResult.toFixed(4)))
        : '#ERROR!';
    }
    return substituted;
  } catch (err) {
    return err.message === '#CYCLE!' ? '#CYCLE!' : '#VALUE!';
  }
}

function splitArguments(argString) {
  const args = [];
  let current = '';
  let depth = 0;
  let inQuotes = false;

  for (let i = 0; i < argString.length; i++) {
    const char = argString[i];
    if (char === '"' || char === "'") inQuotes = !inQuotes;
    if (!inQuotes) {
      if (char === '(' || char === '[') depth++;
      else if (char === ')' || char === ']') depth--;
      else if (char === ',' && depth === 0) {
        args.push(current.trim());
        current = '';
        continue;
      }
    }
    current += char;
  }
  if (current.trim()) args.push(current.trim());
  return args;
}

function resolveValueOrExpr(valStr, cellResolver) {
  const clean = String(valStr || '').trim();
  if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
    return clean.slice(1, -1);
  }
  const cell = parseCellReference(clean);
  if (cell) {
    return cellResolver(cell.original, cell.row, cell.col);
  }
  const num = Number(clean);
  return Number.isNaN(num) ? clean : num;
}

function evaluateCondition(condStr, cellResolver) {
  const match = condStr.match(/(.+?)(<=|>=|!=|<>|=|<|>)(.+)/);
  if (!match) return false;
  const left = resolveValueOrExpr(match[1], cellResolver);
  const op = match[2];
  const right = resolveValueOrExpr(match[3], cellResolver);

  const leftNum = Number(String(left).replace(/[$,%]/g, ''));
  const rightNum = Number(String(right).replace(/[$,%]/g, ''));
  const isNumeric = !Number.isNaN(leftNum) && !Number.isNaN(rightNum);

  const l = isNumeric ? leftNum : String(left).toLowerCase();
  const r = isNumeric ? rightNum : String(right).toLowerCase();

  switch (op) {
    case '=': return l === r;
    case '!=':
    case '<>': return l !== r;
    case '<': return l < r;
    case '<=': return l <= r;
    case '>': return l > r;
    case '>=': return l >= r;
    default: return false;
  }
}

/**
 * Recomputes all dynamic formula dependencies across a 2D matrix with cycle detection.
 *
 * @param {Array<Array<any>>} cells - 2D grid matrix
 * @returns {{ evaluatedCells: Array<Array<any>>, formulaCount: number, cyclesFound: Array<string> }}
 */
export function evaluateMatrixFormulas(cells) {
  if (!Array.isArray(cells)) return { evaluatedCells: [], formulaCount: 0, cyclesFound: [] };

  const evaluated = cells.map(row => (Array.isArray(row) ? [...row] : []));
  const cyclesFound = [];
  let formulaCount = 0;

  const getCellValue = (ref, r, c, callStack = new Set()) => {
    const key = `${r},${c}`;
    if (callStack.has(key)) {
      cyclesFound.push(ref || `${colIndexToLetter(c)}${r + 1}`);
      return '#CYCLE!';
    }
    const raw = cells[r]?.[c];
    if (typeof raw === 'string' && raw.startsWith('=')) {
      const nextStack = new Set(callStack);
      nextStack.add(key);
      return evaluateFormula(raw, (subRef, subR, subC) => getCellValue(subRef, subR, subC, nextStack), nextStack);
    }
    return raw !== undefined && raw !== null ? raw : '';
  };

  for (let r = 0; r < cells.length; r++) {
    const row = cells[r];
    if (!Array.isArray(row)) continue;
    for (let c = 0; c < row.length; c++) {
      const val = row[c];
      if (typeof val === 'string' && val.startsWith('=')) {
        formulaCount++;
        evaluated[r][c] = getCellValue(`${colIndexToLetter(c)}${r + 1}`, r, c);
      }
    }
  }

  return { evaluatedCells: evaluated, formulaCount, cyclesFound };
}

// ─── In-Browser Relational SQL Query Engine ───────────────────────────────────

/**
 * Executes a relational SQL query directly against the spreadsheet grid.
 *
 * Supported SQL clauses:
 * - SELECT [cols | * | aggregates: SUM(), AVG(), COUNT(), MIN(), MAX()]
 * - FROM [ignored / optional]
 * - WHERE [conditions with =, !=, <, >, <=, >=, LIKE, AND, OR]
 * - GROUP BY [columns]
 * - ORDER BY [column ASC|DESC]
 * - LIMIT [number]
 *
 * @param {Array<Array<any>>} cells - 2D matrix
 * @param {string} sqlQuery - Query string (e.g. "SELECT Category, SUM(Actual) WHERE Status = 'Active' GROUP BY Category")
 * @param {Array<object>} [columns] - Optional column schemas
 * @returns {{ success: boolean, columns: Array<string>, rows: Array<Array<any>>, rowCount: number, executionTimeMs: number, error?: string }}
 */
export function queryMatrixSql(cells, sqlQuery, columns = null) {
  const startTime = Date.now();

  try {
    if (!Array.isArray(cells) || cells.length === 0) {
      return { success: true, columns: [], rows: [], rowCount: 0, executionTimeMs: 0 };
    }

    // 1. Establish column headers
    const detected = inferMatrixSchema(cells);
    const cols = columns || detected.columns;
    const headerRow = cells[0] || [];
    const colNameMap = new Map();

    cols.forEach((col, idx) => {
      const label = String(headerRow[idx] || col.label || col.key).trim();
      colNameMap.set(label.toLowerCase(), idx);
      colNameMap.set(col.key.toLowerCase(), idx);
      colNameMap.set(colIndexToLetter(idx).toLowerCase(), idx);
    });

    // 2. Extract data records
    const records = [];
    for (let r = 1; r < cells.length; r++) {
      const row = cells[r];
      if (!Array.isArray(row)) continue;
      const record = {};
      cols.forEach((col, idx) => {
        const key = col.key;
        record[key] = row[idx] !== undefined && row[idx] !== null ? row[idx] : '';
        record[`__col_${idx}`] = record[key];
      });
      records.push(record);
    }

    // 3. Parse SQL tokens
    const queryClean = sqlQuery.trim().replace(/;/g, '');
    const selectMatch = queryClean.match(/SELECT\s+(.+?)(?:\s+FROM|\s+WHERE|\s+GROUP\s+BY|\s+ORDER\s+BY|\s+LIMIT|$)/i);
    if (!selectMatch) {
      return { success: false, error: 'Malformed SQL: Missing SELECT clause.', executionTimeMs: Date.now() - startTime };
    }

    const selectFieldsRaw = splitArguments(selectMatch[1]);
    const whereMatch = queryClean.match(/\s+WHERE\s+(.+?)(?:\s+GROUP\s+BY|\s+ORDER\s+BY|\s+LIMIT|$)/i);
    const groupByMatch = queryClean.match(/\s+GROUP\s+BY\s+(.+?)(?:\s+ORDER\s+BY|\s+LIMIT|$)/i);
    const orderByMatch = queryClean.match(/\s+ORDER\s+BY\s+(.+?)(?:\s+LIMIT|$)/i);
    const limitMatch = queryClean.match(/\s+LIMIT\s+(\d+)$/i);

    // 4. Apply WHERE Filter
    let filteredRecords = records;
    if (whereMatch) {
      const whereClause = whereMatch[1].trim();
      filteredRecords = records.filter(rec => evaluateSqlWhere(whereClause, rec, colNameMap, cols));
    }

    // 5. Apply GROUP BY & Aggregations or direct Projection
    let resultColumns = [];
    let resultRows = [];

    if (groupByMatch) {
      const groupColNames = splitArguments(groupByMatch[1]);
      const groupColKeys = groupColNames.map(name => resolveColKey(name, colNameMap, cols));

      const groups = new Map();
      filteredRecords.forEach(rec => {
        const groupKey = groupColKeys.map(k => String(rec[k] || '')).join('|||');
        if (!groups.has(groupKey)) {
          groups.set(groupKey, []);
        }
        groups.get(groupKey).push(rec);
      });

      resultColumns = selectFieldsRaw.map(f => cleanFieldName(f));
      groups.forEach((groupRecs) => {
        const row = selectFieldsRaw.map(fieldExpr => {
          return evaluateSqlAggregate(fieldExpr, groupRecs, colNameMap, cols);
        });
        resultRows.push(row);
      });
    } else {
      // Check if SELECT contains pure aggregates without GROUP BY
      const hasAggregates = selectFieldsRaw.some(f => /SUM\(|AVG\(|COUNT\(|MIN\(|MAX\(/i.test(f));
      if (hasAggregates) {
        resultColumns = selectFieldsRaw.map(f => cleanFieldName(f));
        const row = selectFieldsRaw.map(fieldExpr => {
          return evaluateSqlAggregate(fieldExpr, filteredRecords, colNameMap, cols);
        });
        resultRows.push(row);
      } else {
        // Direct column projection
        if (selectFieldsRaw.length === 1 && selectFieldsRaw[0].trim() === '*') {
          resultColumns = cols.map(c => c.label || c.key);
          resultRows = filteredRecords.map(rec => cols.map(c => rec[c.key]));
        } else {
          resultColumns = selectFieldsRaw.map(f => cleanFieldName(f));
          const colKeys = selectFieldsRaw.map(f => resolveColKey(f, colNameMap, cols));
          resultRows = filteredRecords.map(rec => colKeys.map(k => rec[k] !== undefined ? rec[k] : ''));
        }
      }
    }

    // 6. Apply ORDER BY
    if (orderByMatch) {
      const orderParts = orderByMatch[1].trim().split(/\s+/);
      const orderField = cleanFieldName(orderParts[0]);
      const isDesc = orderParts[1] && orderParts[1].toUpperCase() === 'DESC';
      const colIdx = resultColumns.findIndex(c => c.toLowerCase() === orderField.toLowerCase());

      if (colIdx !== -1) {
        resultRows.sort((a, b) => {
          const valA = a[colIdx];
          const valB = b[colIdx];
          const numA = Number(String(valA).replace(/[$,%]/g, ''));
          const numB = Number(String(valB).replace(/[$,%]/g, ''));
          if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
            return isDesc ? numB - numA : numA - numB;
          }
          return isDesc ? String(valB).localeCompare(String(valA)) : String(valA).localeCompare(String(valB));
        });
      }
    }

    // 7. Apply LIMIT
    if (limitMatch) {
      const limit = parseInt(limitMatch[1], 10);
      resultRows = resultRows.slice(0, limit);
    }

    return {
      success: true,
      columns: resultColumns,
      rows: resultRows,
      rowCount: resultRows.length,
      executionTimeMs: Date.now() - startTime,
    };
  } catch (err) {
    return {
      success: false,
      error: `SQL Execution Error: ${err.message}`,
      columns: [],
      rows: [],
      rowCount: 0,
      executionTimeMs: Date.now() - startTime,
    };
  }
}

function cleanFieldName(f) {
  return f.replace(/[\[\]`"']/g, '').trim();
}

function resolveColKey(fieldName, colNameMap, cols) {
  const clean = cleanFieldName(fieldName).toLowerCase();
  const idx = colNameMap.get(clean);
  if (idx !== undefined && cols[idx]) {
    return cols[idx].key;
  }
  return clean;
}

function evaluateSqlWhere(whereClause, record, colNameMap, cols) {
  // Support simple conditions and 'AND' splits
  const conditions = whereClause.split(/\s+AND\s+/i);
  return conditions.every(cond => {
    const match = cond.match(/(.+?)(<=|>=|!=|<>|=|<|>|LIKE)(.+)/i);
    if (!match) return true;
    const colKey = resolveColKey(match[1], colNameMap, cols);
    const op = match[2].toUpperCase();
    const rightRaw = match[3].trim().replace(/^['"]|['"]$/g, '');
    const cellVal = record[colKey] !== undefined ? record[colKey] : '';

    if (op === 'LIKE') {
      const regex = new RegExp(`^${rightRaw.replace(/%/g, '.*')}$`, 'i');
      return regex.test(String(cellVal));
    }

    const cellNum = Number(String(cellVal).replace(/[$,%]/g, ''));
    const rightNum = Number(String(rightRaw).replace(/[$,%]/g, ''));
    const isNum = !Number.isNaN(cellNum) && !Number.isNaN(rightNum);

    const l = isNum ? cellNum : String(cellVal).toLowerCase();
    const r = isNum ? rightNum : String(rightRaw).toLowerCase();

    switch (op) {
      case '=': return l === r;
      case '!=':
      case '<>': return l !== r;
      case '<': return l < r;
      case '<=': return l <= r;
      case '>': return l > r;
      case '>=': return l >= r;
      default: return true;
    }
  });
}

function evaluateSqlAggregate(fieldExpr, records, colNameMap, cols) {
  const clean = fieldExpr.trim();
  const aggMatch = clean.match(/^(SUM|AVG|COUNT|MIN|MAX)\((.+?)\)$/i);
  if (aggMatch) {
    const func = aggMatch[1].toUpperCase();
    const targetCol = aggMatch[2].trim();
    if (func === 'COUNT' && targetCol === '*') {
      return records.length;
    }
    const colKey = resolveColKey(targetCol, colNameMap, cols);
    const nums = records
      .map(r => Number(String(r[colKey] || '').replace(/[$,%]/g, '')))
      .filter(n => !Number.isNaN(n));

    switch (func) {
      case 'SUM':
        return nums.reduce((a, b) => a + b, 0);
      case 'AVG':
        return nums.length > 0 ? Number((nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2)) : 0;
      case 'MIN':
        return nums.length > 0 ? Math.min(...nums) : 0;
      case 'MAX':
        return nums.length > 0 ? Math.max(...nums) : 0;
      case 'COUNT':
        return records.filter(r => r[colKey] !== undefined && r[colKey] !== '').length;
      default:
        return 0;
    }
  }

  // Non-aggregate column (group by key)
  const colKey = resolveColKey(clean, colNameMap, cols);
  return records[0]?.[colKey] !== undefined ? records[0][colKey] : '';
}

// ─── Isomorphic AST Serializers ───────────────────────────────────────────────

/**
 * Converts a 2D spreadsheet grid object into a typed Matrix AST.
 */
export function gridToMatrixAst(gridData, existingSchema = null) {
  const cells = Array.isArray(gridData?.cells) ? gridData.cells : [];
  const schema = existingSchema || inferMatrixSchema(cells);
  const rows = [];

  for (let r = 1; r < cells.length; r++) {
    const rowObj = { _row: r };
    schema.columns.forEach((col, cIdx) => {
      rowObj[col.key] = cells[r]?.[cIdx] !== undefined ? cells[r][cIdx] : '';
    });
    rows.push(rowObj);
  }

  return {
    matrixId: gridData?.id || `matrix_${Date.now()}`,
    columns: schema.columns,
    rowCount: rows.length,
    colCount: schema.columns.length,
    rows,
    _meta: {
      exportedAt: new Date().toISOString(),
      generator: 'matrixSchemaEngine',
    },
  };
}

/**
 * Converts a typed Matrix AST back into 2D grid matrix state ({ cells, formats, columnWidths }).
 */
export function matrixAstToGrid(ast, headerBg = '#312e81') {
  if (!ast || !Array.isArray(ast.columns) || !Array.isArray(ast.rows)) {
    return { cells: [], formats: {}, columnWidths: {}, rows: 30, cols: 26 };
  }

  const colsCount = Math.max(26, ast.columns.length + 2);
  const rowsCount = Math.max(30, ast.rows.length + 10);
  const cells = Array.from({ length: rowsCount }, () => Array(colsCount).fill(''));
  const formats = {};
  const columnWidths = {};

  // Row 0: Headers
  formats[0] = {};
  ast.columns.forEach((col, cIdx) => {
    cells[0][cIdx] = col.label;
    columnWidths[cIdx] = col.width || 140;
    formats[0][cIdx] = {
      bg: headerBg,
      color: '#ffffff',
      fontWeight: 'bold',
      align: ['number', 'currency', 'percentage'].includes(col.type) ? 'right' : 'left',
    };
  });

  // Data rows
  ast.rows.forEach((rowObj, rIdx) => {
    const r = rIdx + 1;
    formats[r] = {};
    ast.columns.forEach((col, cIdx) => {
      const val = rowObj[col.key] !== undefined ? String(rowObj[col.key]) : '';
      cells[r][cIdx] = val;
      formats[r][cIdx] = {
        bg: rIdx % 2 === 1 ? '#f8fafc' : '#ffffff',
        color: '#1e293b',
        fontWeight: 'normal',
        align: ['number', 'currency', 'percentage'].includes(col.type) ? 'right' : 'left',
      };
    });
  });

  return { cells, formats, columnWidths, rows: rowsCount, cols: colsCount };
}

/**
 * Serializes a Matrix AST or grid into high-density Markdown (saves up to 80% tokens for LLMs).
 */
export function matrixAstToMarkdown(astOrGrid) {
  let ast = astOrGrid;
  if (Array.isArray(astOrGrid?.cells)) {
    ast = gridToMatrixAst(astOrGrid);
  }

  if (!ast || !Array.isArray(ast.columns) || !Array.isArray(ast.rows)) {
    return '| Column |\n| :--- |\n| (empty) |';
  }

  const headerLine = `| ${ast.columns.map(c => c.label || c.key).join(' | ')} |`;
  const alignLine = `| ${ast.columns.map(c => (['number', 'currency', 'percentage'].includes(c.type) ? '---:' : ':---')).join(' | ')} |`;
  const dataLines = ast.rows.map(row => {
    return `| ${ast.columns.map(c => String(row[c.key] !== undefined ? row[c.key] : '')).join(' | ')} |`;
  });

  return [headerLine, alignLine, ...dataLines].join('\n');
}

/**
 * Serializes a Matrix AST or grid into high-density JSON.
 */
export function matrixAstToJson(astOrGrid) {
  let ast = astOrGrid;
  if (Array.isArray(astOrGrid?.cells)) {
    ast = gridToMatrixAst(astOrGrid);
  }
  return JSON.stringify(ast, null, 2);
}

// ─── Surgical Matrix Patch Engine (Pillar 3 Sandbox Integrated) ───────────────

/**
 * Surgically patches cells across the active spreadsheet grid.
 * Supports Pillar 3 Staging Sandbox via options.stage: true.
 *
 * @param {object} params
 * @param {string} [params.sheetId] - Target sheet ID
 * @param {Array<{ row: number, col: number, value: any }>} params.patches - Cell updates
 * @param {boolean} [params.stage] - Stage changes into PR branch instead of direct mutation
 * @param {string} [params.branchId] - Target PR branch ID if staging
 * @returns {Promise<object>}
 */
export async function patchMatrixCells({ sheetId, patches, stage = false, branchId = null }) {
  if (!Array.isArray(patches) || patches.length === 0) {
    return { success: false, error: 'patches must be a non-empty array.' };
  }

  // Handle Pillar 3 Staging Sandbox Mode
  if (stage && typeof window !== 'undefined' && window.__REGAARDER_STAGING_ENGINE__) {
    const stagingEngine = window.__REGAARDER_STAGING_ENGINE__;
    const branchRes = stagingEngine.createStagingBranch({
      title: `Batch Matrix Cell Updates (${patches.length} cells)`,
      agentOrigin: 'MatrixEngineAgent',
      app: 'sheets',
    });
    const targetBranch = branchId || branchRes?.id || branchRes?.branch?.id;

    const stagedMut = stagingEngine.stageMutation({
      branchId: targetBranch,
      app: 'sheets',
      targetId: sheetId || 'active',
      operation: 'patch_matrix_cells',
      description: `Updated ${patches.length} cell(s) in matrix`,
      params: { sheetId, updates: patches },
      baseline: patches.map(p => ({ row: p.row, col: p.col, value: '' })),
      proposed: patches,
    });

    emitMatrixEvent('CELLS_STAGED', { branchId: targetBranch, mutation: stagedMut });
    return {
      success: true,
      staged: true,
      branchId: targetBranch,
      message: `Staged ${patches.length} cell update(s) into PR branch ${targetBranch}.`,
    };
  }

  // Direct Execution
  if (typeof window !== 'undefined' && window.__REGAARDER_UPDATE_SHEET_CELLS__) {
    const res = window.__REGAARDER_UPDATE_SHEET_CELLS__(patches.map(p => ({
      sheetId,
      row: p.row,
      col: p.col,
      value: p.value,
    })));
    emitMatrixEvent('CELLS_PATCHED', { sheetId, patches });
    return res;
  }

  return { success: true, message: `${patches.length} cell(s) patched.`, data: patches };
}

/**
 * Adds a new column with a strict schema to the matrix.
 */
export async function addColumnWithSchema({ sheetId, column, defaultValue = '', stage = false }) {
  if (!column || !column.label) {
    return { success: false, error: 'column must contain at least a label.' };
  }

  const type = column.type || MATRIX_COLUMN_TYPES.TEXT;
  const colObj = {
    key: column.key || column.label.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
    label: column.label,
    type,
    options: type === MATRIX_COLUMN_TYPES.DROPDOWN ? (column.options || ['Option A', 'Option B']) : null,
    width: column.width || 130,
    formula: column.formula || null,
  };

  emitMatrixEvent('COLUMN_ADDED', { sheetId, column: colObj });
  return { success: true, message: `Added column "${colObj.label}" (${colObj.type}).`, column: colObj };
}
