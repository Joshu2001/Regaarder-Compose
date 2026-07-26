import { SchemaType } from '@google/generative-ai';

/**
 * Model Context Protocol (MCP) & Gemini Function Declarations Schema
 * Declarative Tool Definitions for all RegaarderDocAPI methods.
 */

export const REGAARDER_MCP_TOOLS = [
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
    description: 'Replace the entire body HTML content of the active document.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        text: { type: SchemaType.STRING, description: 'Full HTML string for the document body' }
      },
      required: ['text']
    }
  },
  {
    name: 'append_content',
    description: 'Append HTML content at the bottom of the active document body.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        text: { type: SchemaType.STRING, description: 'HTML content to append' }
      },
      required: ['text']
    }
  },
  {
    name: 'prepend_content',
    description: 'Prepend HTML content at the top of the active document body.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        text: { type: SchemaType.STRING, description: 'HTML content to prepend' }
      },
      required: ['text']
    }
  },
  {
    name: 'clear_content',
    description: 'Clear all body text and HTML in the document editor.',
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
      },
      required: ['chartType', 'data']
    }
  },
  {
    name: 'insert_image',
    description: 'Insert an image figure with alt text and caption.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        src: { type: SchemaType.STRING, description: 'Image URL or data URI' },
        alt: { type: SchemaType.STRING, description: 'Alt description' },
        caption: { type: SchemaType.STRING, description: 'Visible caption under image' }
      },
      required: ['src']
    }
  },
  {
    name: 'insert_callout',
    description: 'Insert a visual callout banner box (info, warning, success, error).',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        calloutType: { type: SchemaType.STRING, description: 'Callout theme: info | warning | success | error' },
        text: { type: SchemaType.STRING, description: 'Callout content text/HTML' },
        icon: { type: SchemaType.STRING, description: 'Optional emoji icon' }
      },
      required: ['text']
    }
  },
  {
    name: 'insert_code',
    description: 'Insert a syntax-highlighted code block.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        code: { type: SchemaType.STRING, description: 'Raw code snippet' },
        language: { type: SchemaType.STRING, description: 'Programming language (e.g. javascript, python, html)' }
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
  {
    name: 'append_section',
    description: 'Append a new structured document section.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING, description: 'Section title' },
        text: { type: SchemaType.STRING, description: 'Section HTML content' }
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
  }
];

/**
 * Formats an incoming MCP tool call into a standard EditorAction payload for the client socket.
 */
export function formatMcpToolAction(toolName, toolArgs = {}) {
  return {
    action: toolName,
    ...toolArgs
  };
}

/**
 * Normalizes Gemini SchemaType enum objects into standard JSON Schema format for pure MCP clients.
 */
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

/**
 * Handle Model Context Protocol (MCP) JSON-RPC standard endpoints.
 */
export function handleMcpJsonRpc(req, res) {
  const { method, params, id } = req.body || {};

  if (method === 'tools/list' || method === 'initialize') {
    return res.json({
      jsonrpc: '2.0',
      id: id || 1,
      result: {
        tools: REGAARDER_MCP_TOOLS.map(t => ({
          name: t.name,
          description: t.description,
          inputSchema: toStandardJsonSchema(t.parameters)
        }))
      }
    });
  }

  if (method === 'tools/call') {
    const { name, arguments: args } = params || {};
    const tool = REGAARDER_MCP_TOOLS.find(t => t.name === name);
    if (!tool) {
      return res.json({
        jsonrpc: '2.0',
        id: id || 1,
        error: { code: -32601, message: `Tool '${name}' not found` }
      });
    }

    const editorAction = formatMcpToolAction(name, args);
    return res.json({
      jsonrpc: '2.0',
      id: id || 1,
      result: {
        content: [
          {
            type: 'text',
            text: `Generated EditorAction for ${name}: ${JSON.stringify(editorAction)}`
          }
        ],
        editorAction,
        isError: false
      }
    });
  }

  return res.status(400).json({
    jsonrpc: '2.0',
    id: id || null,
    error: { code: -32601, message: `Unknown method '${method}'` }
  });
}
