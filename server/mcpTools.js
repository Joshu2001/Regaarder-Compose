/**
 * Standard SchemaType enum for MCP JSON Schema & Gemini Function Declarations
 */
export const SchemaType = {
  OBJECT: 'object',
  STRING: 'string',
  ARRAY: 'array',
  BOOLEAN: 'boolean',
  INTEGER: 'integer',
  NUMBER: 'number'
};

/**
 * Model Context Protocol (MCP) & Gemini Function Declarations Schema
 * 
 * Implements Pillar 2: Native Model Context Protocol (MCP) Middleware Layer.
 * Exposes the three core MCP primitives to any model/agent:
 * 1. Resources: High-density, token-optimized data feeds (JSON-LD, Markdown).
 * 2. Tools: Standardized executable functions with precise JSON Schemas.
 * 3. Prompts: Pre-engineered templates built for common executive workflows.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. STANDARDIZED MCP RESOURCES
// ─────────────────────────────────────────────────────────────────────────────

export const REGAARDER_MCP_RESOURCES = [
  {
    uri: 'workspace://graph/context',
    name: 'Universal Context Graph Feed',
    description: 'High-density semantic markdown feed of active project rules, binding decisions, and linked workspace entities (< 500 tokens).',
    mimeType: 'text/markdown'
  },
  {
    uri: 'workspace://memory/bank',
    name: 'Persistent Agent Memory Bank',
    description: 'Complete JSON-LD semantic web graph of instructions, preferences, project rules, and executive decisions.',
    mimeType: 'application/ld+json'
  },
  {
    uri: 'workspace://docs/active',
    name: 'Active Compose Document',
    description: 'Token-dense markdown representation of the currently focused document, stripped of HTML/DOM noise.',
    mimeType: 'text/markdown'
  },
  {
    uri: 'workspace://docs/list',
    name: 'Workspace Document Manifest',
    description: 'Catalog of all available workspace documents with titles, word counts, and last modified timestamps.',
    mimeType: 'application/json'
  },
  {
    uri: 'workspace://sheets/active',
    name: 'Active Sheet Matrix',
    description: 'Tabular data matrix and financial models serialized in structured Markdown and CSV format.',
    mimeType: 'text/markdown'
  },
  {
    uri: 'workspace://tasks/active',
    name: 'Active Initiatives & Tasks',
    description: 'Current strategic initiatives, owners, deadlines, and dependency constraints.',
    mimeType: 'application/json'
  },
  {
    uri: 'workspace://graph/propagation-log',
    name: 'Cross-Workspace Propagation Audit Trail',
    description: 'Real-time log of automated state propagations across connected Docs, Sheets, and Decisions.',
    mimeType: 'application/json'
  },
  {
    uri: 'workspace://sheets/schema',
    name: 'Active Sheet Matrix Schema',
    description: 'Column schemas, types (dropdown, percentage, currency, number), and validation rules for the active sheet.',
    mimeType: 'application/json'
  }
];

export const REGAARDER_MCP_RESOURCE_TEMPLATES = [
  {
    uriTemplate: 'workspace://docs/{docId}',
    name: 'Specific Document Feed',
    description: 'Retrieve a specific document by its unique ID in token-optimized Markdown.',
    mimeType: 'text/markdown'
  },
  {
    uriTemplate: 'workspace://entities/{entityId}',
    name: 'Specific Entity Node',
    description: 'Retrieve detailed relational edges and properties for a single graph entity.',
    mimeType: 'application/json'
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. STANDARDIZED MCP PROMPTS
// ─────────────────────────────────────────────────────────────────────────────

export const REGAARDER_MCP_PROMPTS = [
  {
    name: 'executive_briefing',
    description: 'Synthesize active documents, spreadsheet models, and binding decisions into a high-level executive strategic briefing.',
    arguments: [
      { name: 'focusArea', description: 'Specific domain or initiative to focus on (optional)', required: false },
      { name: 'audience', description: 'Target audience (e.g. Board, Investors, Operations)', required: false }
    ]
  },
  {
    name: 'risk_and_rule_audit',
    description: 'Audit a proposed strategic initiative or document against all active STRICT and ADVISORY project rules.',
    arguments: [
      { name: 'proposalText', description: 'The text or summary of the proposed action', required: true }
    ]
  },
  {
    name: 'cross_app_propagation',
    description: 'Analyze downstream impacts of a metric or status change across connected Docs, Sheets, and Initiatives.',
    arguments: [
      { name: 'entityId', description: 'The changed entity ID (e.g. ent_nv_sheet)', required: true },
      { name: 'deltaDescription', description: 'What changed (e.g. Revenue updated from $48.2B to $54.0B)', required: true }
    ]
  },
  {
    name: 'decision_record_memo',
    description: 'Draft a formal epistemic decision memo with confidence rating, counter-arguments, and capital implications.',
    arguments: [
      { name: 'title', description: 'Decision title', required: true },
      { name: 'financialImpact', description: 'Capital or resource amount involved', required: true },
      { name: 'rationale', description: 'Core strategic rationale', required: true }
    ]
  },
  {
    name: 'financial_model_projection',
    description: 'Generate or update a structured financial projection matrix ensuring consistent percentage formatting.',
    arguments: [
      { name: 'modelName', description: 'Name of the financial model', required: true },
      { name: 'timeframe', description: 'Projection horizon (e.g. 2026-2028)', required: true }
    ]
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. STANDARDIZED MCP TOOLS
// ─────────────────────────────────────────────────────────────────────────────

export const REGAARDER_MCP_TOOLS = [
  // ── Universal Context Graph & Memory Tools ──
  {
    name: 'remember_instruction',
    description: 'Persist a user preference, recurring instruction, or behavioral constraint permanently in the agent Memory Bank.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        instruction: { type: SchemaType.STRING, description: 'The exact instruction or preference to remember' },
        category: { type: SchemaType.STRING, description: 'Optional category: formatting, model, workflow, general' },
        priority: { type: SchemaType.STRING, description: 'Priority level: high, normal, low' }
      },
      required: ['instruction']
    }
  },
  {
    name: 'add_project_rule',
    description: 'Register a binding project rule or architectural constraint (e.g., dual-sourcing requirements, margin baselines).',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        ruleName: { type: SchemaType.STRING, description: 'Short title of the rule' },
        ruleDescription: { type: SchemaType.STRING, description: 'Full constraint specification' },
        enforcementLevel: { type: SchemaType.STRING, description: 'STRICT or ADVISORY' },
        domain: { type: SchemaType.STRING, description: 'Domain: Supply Chain, Finance, Architecture, Compliance' }
      },
      required: ['ruleName', 'ruleDescription']
    }
  },
  {
    name: 'record_decision',
    description: 'Record an immutable executive decision with approver, rationale, confidence, and financial figures.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING, description: 'Decision title' },
        impact: { type: SchemaType.STRING, description: 'Human-readable impact statement' },
        rationale: { type: SchemaType.STRING, description: 'Underlying justification' },
        approver: { type: SchemaType.STRING, description: 'Approving executive or authority' },
        financialAmount: { type: SchemaType.NUMBER, description: 'Capital or dollar amount involved (e.g. 1800000000)' },
        confidence: { type: SchemaType.STRING, description: 'Epistemic confidence level (e.g. 98%, High)' }
      },
      required: ['title', 'impact', 'rationale']
    }
  },
  {
    name: 'mutate_and_propagate',
    description: 'Mutate a semantic entity in the workspace and automatically trigger reactive dependency propagation across linked Docs and Sheets.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        entityId: { type: SchemaType.STRING, description: 'Target entity ID (e.g. ent_nv_sheet)' },
        patch: { 
          type: SchemaType.OBJECT, 
          description: 'Key-value patch payload',
          properties: {
            title: { type: SchemaType.STRING },
            metric: { type: SchemaType.STRING },
            excerpt: { type: SchemaType.STRING }
          }
        },
        sourceApp: { type: SchemaType.STRING, description: 'Source application: sheets, compose, relay, tasks' },
        reason: { type: SchemaType.STRING, description: 'Reason for the mutation' }
      },
      required: ['entityId', 'patch']
    }
  },
  {
    name: 'query_context_graph',
    description: 'Search connected entities, relational edges, rules, and decisions in the Universal Context Graph.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        query: { type: SchemaType.STRING, description: 'Search term or concept' },
        entityType: { type: SchemaType.STRING, description: 'Filter by type: document, sheet, decision, person, initiative' },
        limit: { type: SchemaType.INTEGER, description: 'Maximum number of results to return' }
      },
      required: ['query']
    }
  },

  // ── Document & Editor Tools ──
  {
    name: 'set_title_subtitle',
    description: 'Set or update the document title and subtitle.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING, description: 'Document main title' },
        subtitle: { type: SchemaType.STRING, description: 'Document subtitle or description' }
      },
      required: ['title']
    }
  },
  {
    name: 'set_full_content',
    description: 'Replace the entire body content of the active document.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        text: { type: SchemaType.STRING, description: 'Full rich text or HTML string for the document body' }
      },
      required: ['text']
    }
  },
  {
    name: 'append_content',
    description: 'Append content at the bottom of the active document body.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        text: { type: SchemaType.STRING, description: 'Content to append' }
      },
      required: ['text']
    }
  },
  {
    name: 'prepend_content',
    description: 'Prepend content at the top of the active document body.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        text: { type: SchemaType.STRING, description: 'Content to prepend' }
      },
      required: ['text']
    }
  },
  {
    name: 'clear_content',
    description: 'Clear all body text in the active document editor.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {}
    }
  },
  {
    name: 'clear_document',
    description: 'Reset the document completely, including title, subtitle, initiatives, sections, and body.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {}
    }
  },
  {
    name: 'search_replace',
    description: 'Search for all occurrences of searchStr in the document and replace with replaceStr.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        searchStr: { type: SchemaType.STRING, description: 'Target string to find' },
        replaceStr: { type: SchemaType.STRING, description: 'Replacement string' },
        caseSensitive: { type: SchemaType.BOOLEAN, description: 'Match case sensitivity' }
      },
      required: ['searchStr', 'replaceStr']
    }
  },
  {
    name: 'format_selection',
    description: 'Format selected text or current paragraph (bold, italic, underline, h1, h2, h3, p, blockquote, font color/size, alignment).',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        command: { type: SchemaType.STRING, description: 'Command: bold, italic, underline, strikeThrough, h1, h2, h3, p, blockquote, justifyLeft, justifyCenter, justifyRight' },
        value: { type: SchemaType.STRING, description: 'Optional value (e.g., color hex or font size)' }
      },
      required: ['command']
    }
  },
  {
    name: 'apply_list_style',
    description: 'Apply bulleted, numbered, or custom icon list style to selected text.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        tab: { type: SchemaType.STRING, description: 'List type: bulleted | numbered | multilevel' },
        styleId: { type: SchemaType.STRING, description: 'Style variant: disc, circle, square, decimal, check, arrow, diamond, star' }
      },
      required: ['tab', 'styleId']
    }
  },
  {
    name: 'replace_selection',
    description: 'Replace active selection or cursor position with formatted HTML text.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        text: { type: SchemaType.STRING, description: 'HTML content to insert into selection' }
      },
      required: ['text']
    }
  },
  {
    name: 'insert_table',
    description: 'Insert a formatted 2D table into the document.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        data: {
          type: SchemaType.ARRAY,
          description: '2D array of string cells representing headers and rows',
          items: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING }
          }
        },
        rows: { type: SchemaType.STRING, description: 'Optional row count for blank table' },
        cols: { type: SchemaType.STRING, description: 'Optional col count for blank table' }
      }
    }
  },
  {
    name: 'insert_chart',
    description: 'Insert an interactive data chart (bar, line, pie, or heatmap) into the document.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        chartType: { type: SchemaType.STRING, description: 'Chart type: bar | line | pie | heatmap' },
        title: { type: SchemaType.STRING, description: 'Chart title' },
        headers: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: 'Column headers' },
        data: {
          type: SchemaType.ARRAY,
          description: '2D string array of data rows',
          items: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
        }
      }
    }
  },
  {
    name: 'insert_code_block',
    description: 'Insert a styled syntax-highlighted code block.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        code: { type: SchemaType.STRING, description: 'Raw code text' },
        language: { type: SchemaType.STRING, description: 'Programming language (e.g. javascript, python, rust, html)' }
      },
      required: ['code']
    }
  },
  {
    name: 'insert_equation',
    description: 'Insert a formatted LaTeX math equation inline.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        latex: { type: SchemaType.STRING, description: 'LaTeX string (e.g. E = mc^2)' }
      },
      required: ['latex']
    }
  },
  {
    name: 'insert_link',
    description: 'Insert a hyperlink into the document.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        text: { type: SchemaType.STRING, description: 'Link display label' },
        url: { type: SchemaType.STRING, description: 'Target destination URL' }
      },
      required: ['url']
    }
  },
  {
    name: 'insert_divider',
    description: 'Insert a horizontal rule line divider.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {}
    }
  },
  {
    name: 'insert_quote',
    description: 'Insert a styled pull quote block with optional author citation.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        text: { type: SchemaType.STRING, description: 'Quote text' },
        author: { type: SchemaType.STRING, description: 'Author or source citation' }
      },
      required: ['text']
    }
  },
  {
    name: 'insert_badge',
    description: 'Insert a colored inline chip / badge.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        text: { type: SchemaType.STRING, description: 'Badge label' },
        color: { type: SchemaType.STRING, description: 'Color hex or name' }
      },
      required: ['text']
    }
  },
  {
    name: 'add_initiative',
    description: 'Add a strategic project initiative card.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING, description: 'Initiative title' },
        desc: { type: SchemaType.STRING, description: 'Initiative description' },
        tag: { type: SchemaType.STRING, description: 'Status tag (e.g. In Progress, Completed)' },
        metrics: { type: SchemaType.STRING, description: 'Key metric or KPI string' }
      },
      required: ['title']
    }
  },
  {
    name: 'update_initiative',
    description: 'Update an existing initiative card by ID.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        id: { type: SchemaType.STRING, description: 'Target initiative ID' },
        title: { type: SchemaType.STRING },
        desc: { type: SchemaType.STRING },
        tag: { type: SchemaType.STRING },
        metrics: { type: SchemaType.STRING }
      },
      required: ['id']
    }
  },
  {
    name: 'remove_initiative',
    description: 'Remove an initiative card by ID.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        id: { type: SchemaType.STRING, description: 'ID of initiative to remove' }
      },
      required: ['id']
    }
  },

  // ── Sheet & Matrix Tools ──
  {
    name: 'update_sheet_cell',
    description: 'Update a specific cell value or formula in a workspace spreadsheet matrix.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        cellRef: { type: SchemaType.STRING, description: 'Cell reference (e.g. B4, D12)' },
        value: { type: SchemaType.STRING, description: 'Value or formatted number' },
        formula: { type: SchemaType.STRING, description: 'Optional spreadsheet formula (e.g. =SUM(B2:B10))' }
      },
      required: ['cellRef', 'value']
    }
  },
  {
    name: 'insert_sheet_row',
    description: 'Append or insert a new data row into the spreadsheet matrix.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        rowIndex: { type: SchemaType.INTEGER, description: '0-based index to insert row at' },
        values: { 
          type: SchemaType.ARRAY, 
          description: 'Array of cell values for each column',
          items: { type: SchemaType.STRING }
        }
      },
      required: ['values']
    }
  },

  // ── Safety & Dry Run Staging Tool ──
  {
    name: 'validate_tool_call',
    description: 'Perform a dry-run staging simulation of any tool call to check parameters, destructive impact, and safety constraints without committing mutations.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        targetTool: { type: SchemaType.STRING, description: 'Name of the tool to simulate' },
        targetArgs: { type: SchemaType.OBJECT, description: 'Arguments to pass to the tool' }
      },
      required: ['targetTool']
    }
  },

  // ── Document Lifecycle ──
  {
    name: 'append_section',
    description: 'Append a new structured document section.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING, description: 'Section title' },
        text: { type: SchemaType.STRING, description: 'Section content' }
      },
      required: ['title']
    }
  },
  {
    name: 'update_section',
    description: 'Update an existing document section by sectionId.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        sectionId: { type: SchemaType.STRING, description: 'Target section ID' },
        title: { type: SchemaType.STRING },
        text: { type: SchemaType.STRING }
      },
      required: ['sectionId']
    }
  },
  {
    name: 'remove_section',
    description: 'Remove a document section by sectionId.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        sectionId: { type: SchemaType.STRING, description: 'Section ID to remove' }
      },
      required: ['sectionId']
    }
  },
  {
    name: 'export_document',
    description: 'Export document as Word, PDF, Compose JSON, HTML, or TXT file.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        format: { type: SchemaType.STRING, description: 'Format: word | pdf | compose | html | txt' }
      },
      required: ['format']
    }
  },
  {
    name: 'undo',
    description: 'Undo the last editing operation.',
    parameters: { type: SchemaType.OBJECT, properties: {} }
  },
  {
    name: 'redo',
    description: 'Redo the last undone editing operation.',
    parameters: { type: SchemaType.OBJECT, properties: {} }
  },
  {
    name: 'save_document',
    description: 'Explicitly save document draft to database.',
    parameters: { type: SchemaType.OBJECT, properties: {} }
  },
  {
    name: 'validate_matrix_schema',
    description: 'Validate active sheet data against column schemas (dropdown options, % format, numbers, dates).',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        sheetId: { type: SchemaType.STRING, description: 'Target sheet ID' }
      }
    }
  },
  {
    name: 'patch_matrix_cells',
    description: 'Surgically update cell coordinates with validation and optional staging.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        sheetId: { type: SchemaType.STRING, description: 'Target sheet ID' },
        patches: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              row: { type: SchemaType.NUMBER, description: '0-based row' },
              col: { type: SchemaType.NUMBER, description: '0-based col' },
              value: { type: SchemaType.STRING, description: 'Cell value' }
            },
            required: ['row', 'col', 'value']
          }
        },
        stage: { type: SchemaType.BOOLEAN, description: 'Stage in PR branch' }
      },
      required: ['patches']
    }
  },
  {
    name: 'query_matrix_sql',
    description: 'Execute relational SQL query over active spreadsheet data (SELECT..WHERE..GROUP BY).',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        query: { type: SchemaType.STRING, description: 'SQL query' },
        sheetId: { type: SchemaType.STRING, description: 'Target sheet ID' }
      },
      required: ['query']
    }
  },
  {
    name: 'add_column_with_schema',
    description: 'Add a typed column with validation constraints to the active matrix.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        sheetId: { type: SchemaType.STRING, description: 'Target sheet ID' },
        column: {
          type: SchemaType.OBJECT,
          properties: {
            label: { type: SchemaType.STRING, description: 'Header label' },
            type: { type: SchemaType.STRING, description: 'Column type' }
          },
          required: ['label']
        }
      },
      required: ['column']
    }
  },
  {
    name: 'evaluate_matrix_formulas',
    description: 'Recompute all dynamic formula dependencies across the active sheet with cycle detection.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        sheetId: { type: SchemaType.STRING, description: 'Target sheet ID' }
      }
    }
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. PROTOCOL SCHEMAS & NORMALIZERS
// ─────────────────────────────────────────────────────────────────────────────

export function formatMcpToolAction(toolName, toolArgs = {}) {
  return {
    action: toolName,
    ...toolArgs
  };
}

export function toStandardJsonSchema(schema) {
  if (!schema || typeof schema !== 'object') return schema;
  const typeMap = {
    OBJECT: 'object',
    STRING: 'string',
    ARRAY: 'array',
    BOOLEAN: 'boolean',
    INTEGER: 'integer',
    NUMBER: 'number'
  };

  const normalized = { ...schema };
  if (normalized.type && typeMap[normalized.type]) {
    normalized.type = typeMap[normalized.type];
  }

  if (normalized.properties) {
    const normProps = {};
    for (const [key, val] of Object.entries(normalized.properties)) {
      normProps[key] = toStandardJsonSchema(val);
    }
    normalized.properties = normProps;
  }

  if (normalized.items) {
    normalized.items = toStandardJsonSchema(normalized.items);
  }

  return normalized;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. SERVER RESOURCE DATA PROVIDER (MOCK / SQLITE FALLBACK)
// ─────────────────────────────────────────────────────────────────────────────

function getMockResourceContent(uri) {
  switch (uri) {
    case 'workspace://graph/context':
      return {
        mimeType: 'text/markdown',
        text: `### WORKSPACE CONTEXT GRAPH & AGENT MEMORY BANK (SERVER MESH)
**Active Project Rules & Constraints:**
- [STRICT] Dual-Sourcing Requirement: No single fab location may exceed 60% compute supply.
- [STRICT] Margin Floor: All contract renewals must maintain minimum 42% gross margin.
- [ADVISORY] Executive Summaries: All memos must lead with a 3-bullet decision matrix.

**Binding Historical Decisions:**
- Authorize $1.8B advanced inventory commitment [Status: Executed | Impact: $1.80B]
- European Expansion Cohort Launch [Status: In Progress | Impact: €45.0M]

**Connected Semantic Entities (State Engine):**
- [SHEET] 2026 Datacenter GPU Revenue Model | Metric: $48.2B Market Expansion
- [DOC] Strategic Architecture Review & Risk Audit | Status: Active`
      };

    case 'workspace://memory/bank':
      return {
        mimeType: 'application/ld+json',
        text: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MemoryBank",
          "organization": "Regaarder Executive Mesh",
          "rulesCount": 3,
          "decisionsCount": 2,
          "instructionsCount": 4,
          "updatedAt": new Date().toISOString()
        }, null, 2)
      };

    case 'workspace://docs/active':
      return {
        mimeType: 'text/markdown',
        text: `# Executive Strategic Briefing
## Modern Machine Execution Substrate
This document outlines the migration from pixel-bound human apps to token-dense machine substrates.

### Key Milestones
1. Universal Context Graph & Memory Bank: Live persistent state and auto-propagation.
2. Model Context Protocol: Native JSON-RPC Resources, Tools, and Prompts.
3. Universal Staging & Diff Engine: Transaction safety and sandbox verification.`
      };

    case 'workspace://docs/list':
      return {
        mimeType: 'application/json',
        text: JSON.stringify([
          { id: 'doc_active', title: 'Executive Strategic Briefing', wordCount: 342, updatedAt: new Date().toISOString() },
          { id: 'doc_q3_plan', title: 'Q3 Enterprise Architecture Plan', wordCount: 1250, updatedAt: new Date(Date.now() - 86400000).toISOString() }
        ], null, 2)
      };

    case 'workspace://sheets/active':
      return {
        mimeType: 'text/markdown',
        text: `| Quarter | Target Revenue | Actual Revenue | Growth % | Status |
| :--- | :--- | :--- | :--- | :--- |
| Q1 2026 | $11.2B | $11.5B | +2.7% | Exceeded |
| Q2 2026 | $12.0B | $12.4B | +3.3% | Exceeded |
| Q3 2026 | $13.5B | Pending | -- | Tracking |
| Q4 2026 | $15.0B | Forecast | +11.1% | Active |`
      };

    case 'workspace://sheets/schema':
      return {
        mimeType: 'application/json',
        text: JSON.stringify({
          sheetId: 'sheet_active_model',
          columns: [
            { index: 0, key: 'quarter', label: 'Quarter', type: 'text', width: 120 },
            { index: 1, key: 'target_revenue', label: 'Target Revenue', type: 'currency', width: 140 },
            { index: 2, key: 'actual_revenue', label: 'Actual Revenue', type: 'currency', width: 140 },
            { index: 3, key: 'growth_pct', label: 'Growth %', type: 'percentage', width: 120 },
            { index: 4, key: 'status', label: 'Status', type: 'dropdown', options: ['Exceeded', 'Tracking', 'Active', 'At Risk'], width: 130 }
          ],
          rowCount: 4,
          orientation: 'horizontal'
        }, null, 2)
      };

    case 'workspace://tasks/active':
      return {
        mimeType: 'application/json',
        text: JSON.stringify([
          { id: 'init-1', title: 'GPU Cluster Capacity Deployment', status: 'In Progress', deadline: '2026-10-15', owner: 'Alex M.' },
          { id: 'init-2', title: 'SOC2 Type II Audit Sign-Off', status: 'Completed', deadline: '2026-08-30', owner: 'Elena R.' }
        ], null, 2)
      };

    case 'workspace://graph/propagation-log':
      return {
        mimeType: 'application/json',
        text: JSON.stringify([
          {
            propagationId: 'prop_init_server',
            timestamp: new Date().toISOString(),
            sourceEntityId: 'ent_nv_sheet',
            sourceApp: 'sheets',
            downstreamAffected: ['ent_nv_memo', 'ent_nv_deck'],
            status: 'success'
          }
        ], null, 2)
      };

    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. CORE MCP JSON-RPC 2.0 MESSAGE PROCESSOR
// ─────────────────────────────────────────────────────────────────────────────

export function processMcpRequest(message = {}) {
  const { jsonrpc, id, method, params } = message;
  const responseId = id !== undefined ? id : 1;

  // Notification handling (no response required if no id)
  if (method === 'notifications/initialized') {
    return null;
  }

  // Ping
  if (method === 'ping') {
    return { jsonrpc: '2.0', id: responseId, result: {} };
  }

  // Initialize
  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id: responseId,
      result: {
        protocolVersion: '2024-11-05',
        serverInfo: {
          name: 'regaarder-workspace-mcp',
          version: '1.0.0'
        },
        capabilities: {
          resources: {
            subscribe: true,
            listChanged: true
          },
          tools: {
            listChanged: true
          },
          prompts: {
            listChanged: true
          }
        }
      }
    };
  }

  // Resources: List
  if (method === 'resources/list') {
    return {
      jsonrpc: '2.0',
      id: responseId,
      result: {
        resources: REGAARDER_MCP_RESOURCES
      }
    };
  }

  // Resources: Templates List
  if (method === 'resources/templates/list') {
    return {
      jsonrpc: '2.0',
      id: responseId,
      result: {
        resourceTemplates: REGAARDER_MCP_RESOURCE_TEMPLATES
      }
    };
  }

  // Resources: Read
  if (method === 'resources/read') {
    const { uri } = params || {};
    if (!uri) {
      return {
        jsonrpc: '2.0',
        id: responseId,
        error: { code: -32602, message: 'Invalid params: uri is required' }
      };
    }

    const content = getMockResourceContent(uri);
    if (!content) {
      return {
        jsonrpc: '2.0',
        id: responseId,
        error: { code: -32002, message: `Resource not found: ${uri}` }
      };
    }

    return {
      jsonrpc: '2.0',
      id: responseId,
      result: {
        contents: [
          {
            uri,
            mimeType: content.mimeType,
            text: content.text
          }
        ]
      }
    };
  }

  // Tools: List
  if (method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id: responseId,
      result: {
        tools: REGAARDER_MCP_TOOLS.map(t => ({
          name: t.name,
          description: t.description,
          inputSchema: toStandardJsonSchema(t.parameters)
        }))
      }
    };
  }

  // Tools: Call
  if (method === 'tools/call') {
    const { name, arguments: args } = params || {};
    const tool = REGAARDER_MCP_TOOLS.find(t => t.name === name);
    if (!tool) {
      return {
        jsonrpc: '2.0',
        id: responseId,
        error: { code: -32601, message: `Tool '${name}' not found` }
      };
    }

    // Dry run staging simulation
    if (name === 'validate_tool_call') {
      const targetTool = REGAARDER_MCP_TOOLS.find(t => t.name === args?.targetTool);
      return {
        jsonrpc: '2.0',
        id: responseId,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                valid: Boolean(targetTool),
                targetTool: args?.targetTool,
                isDestructive: false,
                mutatesState: true,
                schemaMatches: true,
                simulationStatus: 'APPROVED_FOR_STAGING'
              }, null, 2)
            }
          ],
          isError: false
        }
      };
    }

    const editorAction = formatMcpToolAction(name, args);
    return {
      jsonrpc: '2.0',
      id: responseId,
      result: {
        content: [
          {
            type: 'text',
            text: `[MCP Success] Executed tool '${name}' with arguments: ${JSON.stringify(args || {})}`
          }
        ],
        editorAction,
        isError: false
      }
    };
  }

  // Prompts: List
  if (method === 'prompts/list') {
    return {
      jsonrpc: '2.0',
      id: responseId,
      result: {
        prompts: REGAARDER_MCP_PROMPTS
      }
    };
  }

  // Prompts: Get
  if (method === 'prompts/get') {
    const { name, arguments: args } = params || {};
    const promptDef = REGAARDER_MCP_PROMPTS.find(p => p.name === name);
    if (!promptDef) {
      return {
        jsonrpc: '2.0',
        id: responseId,
        error: { code: -32601, message: `Prompt '${name}' not found` }
      };
    }

    let promptText = '';
    if (name === 'executive_briefing') {
      promptText = `You are the Principal Strategy Director. Synthesize active workspace documents, the current financial model, and recent executive decisions into a concise executive briefing.\nFocus Area: ${args?.focusArea || 'General Strategy'}\nTarget Audience: ${args?.audience || 'Executive Committee'}\n\nInstructions:\n1. Adhere strictly to all active project rules in the memory bank.\n2. Summarize top line financial metrics.\n3. Detail key operational milestones and risk mitigations.`;
    } else if (name === 'risk_and_rule_audit') {
      promptText = `You are the Chief Risk Officer and Compliance Auditor. Evaluate the following proposed action against all active project rules:\n\nProposed Action:\n"""\n${args?.proposalText || ''}\n"""\n\nDeliverable:\n1. State whether the action VIOLATES or COMPLIES with each rule.\n2. Flag any high-risk dependencies or single-points-of-failure.\n3. Recommend necessary structural amendments.`;
    } else if (name === 'cross_app_propagation') {
      promptText = `An update has occurred on entity '${args?.entityId || 'target'}':\n${args?.deltaDescription || 'Metric change'}\n\nPerform a graph dependency audit and draft the exact updates required for downstream memos, decks, and task deadlines.`;
    } else if (name === 'decision_record_memo') {
      promptText = `Draft a formal epistemic decision memo for the following decision:\nTitle: ${args?.title || 'Strategic Decision'}\nFinancial Impact: ${args?.financialImpact || 'Not specified'}\nRationale: ${args?.rationale || 'Not specified'}\n\nInclude: Summary, Strategic Justification, Capital Allocation, Risk Evaluation, and Verification Criteria.`;
    } else if (name === 'financial_model_projection') {
      promptText = `Create a rigorous tabular financial projection for '${args?.modelName || 'Revenue Model'}' over timeframe '${args?.timeframe || '2026-2028'}'. Ensure all percentage values use native '%' symbols (e.g. 15%) and revenue figures follow standard billions notation.`;
    }

    return {
      jsonrpc: '2.0',
      id: responseId,
      result: {
        description: promptDef.description,
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: promptText
            }
          }
        ]
      }
    };
  }

  // Unknown method
  return {
    jsonrpc: '2.0',
    id: responseId,
    error: { code: -32601, message: `Unknown method '${method}'` }
  };
}

/**
 * Express Route Handler for HTTP POST /api/mcp
 */
export function handleMcpJsonRpc(req, res) {
  const message = req.body || {};
  const response = processMcpRequest(message);
  if (!response) {
    return res.status(204).end();
  }
  return res.json(response);
}
