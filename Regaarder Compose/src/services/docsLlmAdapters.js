/**
 * docsLlmAdapters.js
 * 
 * Layer 4: Provider-Specific Universal LLM Adapters
 * 
 * Converts canonical tool definitions into provider-compliant tool schemas for:
 * - OpenAI Function Calling / Ollama Tool Calling
 * - Google Gemini Function Declarations
 * - Anthropic Claude Tools API
 * 
 * Also generates human & LLM readable teaching documentation.
 */

import { CANONICAL_DOCS_TOOLS } from './docsToolRegistry.js';

/**
 * Returns raw canonical tool schemas
 */
export const getCanonicalToolSchemas = (tools = CANONICAL_DOCS_TOOLS) => {
  return tools.map(t => ({
    name: t.name,
    label: t.label,
    category: t.category,
    description: t.description,
    safety: {
      mutatesDocument: t.mutatesDocument,
      destructive: t.destructive,
      undoable: t.undoable,
      requiresSelection: t.requiresSelection,
      requiresConfirmation: t.requiresConfirmation
    },
    parameters: t.parameters
  }));
};

/**
 * Converts Canonical Registry into OpenAI / Ollama Tools Format
 */
export const toOpenAITools = (tools = CANONICAL_DOCS_TOOLS) => {
  return tools.map(t => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters
    }
  }));
};

/**
 * Converts Canonical Registry into Google Gemini Function Declarations Format
 */
export const toGeminiTools = (tools = CANONICAL_DOCS_TOOLS) => {
  return {
    functionDeclarations: tools.map(t => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters
    }))
  };
};

/**
 * Converts Canonical Registry into Anthropic Claude Tools Format
 */
export const toAnthropicTools = (tools = CANONICAL_DOCS_TOOLS) => {
  return tools.map(t => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters
  }));
};

/**
 * Generates comprehensive System Prompt Teaching Documentation for LLMs
 */
export const getUniversalToolSystemPrompt = (tools = CANONICAL_DOCS_TOOLS) => {
  let prompt = `# Regaarder Operating System — Universal AI Agent Tools Catalog\n\n`;
  prompt += `You are an embedded AI Specialist inside Regaarder Compose (controlling Docs, Presentation Decks & Slides, and Spreadsheet Matrices).\n`;
  prompt += `You interact with the workspace state strictly through the structured semantic tools below. Do not attempt direct DOM manipulation; emit valid tool calls by name.\n\n`;

  tools.forEach(t => {
    prompt += `### Tool: \`${t.name}\` (${t.label})\n`;
    prompt += `- **Category**: ${t.category}\n`;
    prompt += `- **Description**: ${t.description}\n`;
    prompt += `- **Safety Metadata**: Mutates State: \`${t.mutatesDocument}\` | Destructive: \`${t.destructive}\` | Undoable: \`${t.undoable}\`\n`;
    prompt += `- **Parameters Schema**:\n\`\`\`json\n${JSON.stringify(t.parameters, null, 2)}\n\`\`\`\n\n`;
  });

  return prompt;
};

export const getDocsToolSystemPrompt = getUniversalToolSystemPrompt;
