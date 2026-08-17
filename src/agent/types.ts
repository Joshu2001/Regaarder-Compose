/**
 * Types and interfaces for Adaptive Browser Agent architecture.
 */

export type ModelTier = 'frontier' | 'standard' | 'lightweight';

export interface ModelTierConfig {
  tier: ModelTier;
  allowMultiStepAction: boolean;
  useExternalVerifier: boolean;
  contextStrategy: 'full_multimodal_history' | 'sliding_dom_window';
  promptTemplate: 'autonomous_agent' | 'constrained_single_action_with_recovery';
  enforceStructuredOutput: boolean;
}

export type BrowserActionType =
  | 'click'
  | 'type'
  | 'scroll'
  | 'open_url'
  | 'wait'
  | 'dismiss_modal'
  | 'ask_user'
  | 'finish';

export interface BrowserAction {
  thought: string;
  action: BrowserActionType;
  target_id?: number | string;
  selector?: string;
  value?: string;
  press_enter?: boolean;
  direction?: 'up' | 'down' | 'left' | 'right';
  amount?: number;
  url?: string;
  duration_ms?: number;
  question?: string;
  options?: string[];
  final_answer?: string;
}

export interface DOMElementNode {
  id: number | string;
  tag: string;
  role?: string;
  text?: string;
  placeholder?: string;
  ariaLabel?: string;
  visible: boolean;
  rect?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isInViewport?: boolean;
}

export interface BrowserState {
  url: string;
  title: string;
  visibleElements: DOMElementNode[];
  hasModalOpen: boolean;
  screenshotBase64?: string;
}

export interface VerificationResult {
  success: boolean;
  reason?: string;
  suggestedFallback?: BrowserActionType;
}

export interface TrajectoryStep {
  stepIndex: number;
  action: BrowserAction;
  stateBefore: {
    url: string;
    targetSelector?: string;
    targetText?: string;
  };
  stateAfter: {
    url: string;
  };
}

export interface CachedTrajectory {
  intent: string;
  domain: string;
  steps: TrajectoryStep[];
  success: boolean;
  timestamp: number;
  userCorrectionsCount: number;
}
