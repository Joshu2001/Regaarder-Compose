import { ModelTierConfig } from './types';

/**
 * Model Capability Registry and Configuration Mapping.
 */
export const MODEL_REGISTRY: Record<string, ModelTierConfig> = {
  // Frontier models: full autonomy, multimodal, native self-correction
  'claude-3-5-sonnet': {
    tier: 'frontier',
    allowMultiStepAction: true,
    useExternalVerifier: false,
    contextStrategy: 'full_multimodal_history',
    promptTemplate: 'autonomous_agent',
    enforceStructuredOutput: false,
  },
  'gpt-4o': {
    tier: 'frontier',
    allowMultiStepAction: true,
    useExternalVerifier: false,
    contextStrategy: 'full_multimodal_history',
    promptTemplate: 'autonomous_agent',
    enforceStructuredOutput: false,
  },
  'gemini-2.0-flash': {
    tier: 'frontier',
    allowMultiStepAction: true,
    useExternalVerifier: false,
    contextStrategy: 'full_multimodal_history',
    promptTemplate: 'autonomous_agent',
    enforceStructuredOutput: false,
  },
  // Lightweight models: single-action schema, spatial priors, external verifiers, sliding memory
  'llama-3.2-3b': {
    tier: 'lightweight',
    allowMultiStepAction: false,
    useExternalVerifier: true,
    contextStrategy: 'sliding_dom_window',
    promptTemplate: 'constrained_single_action_with_recovery',
    enforceStructuredOutput: true,
  },
  'qwen2.5-coder-7b': {
    tier: 'lightweight',
    allowMultiStepAction: false,
    useExternalVerifier: true,
    contextStrategy: 'sliding_dom_window',
    promptTemplate: 'constrained_single_action_with_recovery',
    enforceStructuredOutput: true,
  },
  'default-small': {
    tier: 'lightweight',
    allowMultiStepAction: false,
    useExternalVerifier: true,
    contextStrategy: 'sliding_dom_window',
    promptTemplate: 'constrained_single_action_with_recovery',
    enforceStructuredOutput: true,
  },
};

export function getModelConfig(modelName: string): ModelTierConfig {
  const normalized = modelName.toLowerCase().trim();
  for (const [key, config] of Object.entries(MODEL_REGISTRY)) {
    if (normalized.includes(key)) {
      return config;
    }
  }
  // Default to standard/lightweight safety if unknown
  return MODEL_REGISTRY['default-small'];
}
