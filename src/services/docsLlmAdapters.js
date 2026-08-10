/**
 * docsLlmAdapters.js
 * 
 * Layer 4: Provider-Specific LLM Adapters
 * 
 * Converts canonical tool definitions into provider-compliant tool schemas for:
 * - OpenAI Function Calling
 * - Google Gemini Function Declarations
 * - Anthropic Claude Tools API
 * 
 * Also generates human & LLM readable teaching documentation.
 */

import { CANONICAL_DOCS_TOOLS } from './docsToolRegistry.js';

/**
 * Returns raw canonical tool schemas
 */
export const getCanonicalToolSchemas = () => {
  return CANONICAL_DOCS_TOOLS.map(t => ({
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
 * Converts Canonical Registry into OpenAI Tools Format
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
export const getDocsToolSystemPrompt = (tools = CANONICAL_DOCS_TOOLS) => {
  let prompt = `# Regaarder Compose Docs — Semantic Document Tools Catalog\n\n`;
  prompt += `You are an AI Document Agent embedded inside Regaarder Compose Docs. You control the document state using the following semantic tools. Never attempt direct UI manipulation; invoke the appropriate tool by name.\n\n`;

  tools.forEach(t => {
    prompt += `### Tool: \`${t.name}\` (${t.label})\n`;
    prompt += `- **Category**: ${t.category}\n`;
    prompt += `- **Description**: ${t.description}\n`;
    prompt += `- **Safety Metadata**: Mutates Document: \`${t.mutatesDocument}\` | Destructive: \`${t.destructive}\` | Undoable: \`${t.undoable}\` | Requires Selection: \`${t.requiresSelection}\`\n`;
    prompt += `- **Parameters Schema**:\n\`\`\`json\n${JSON.stringify(t.parameters, null, 2)}\n\`\`\`\n\n`;
  });

  return prompt;
};
