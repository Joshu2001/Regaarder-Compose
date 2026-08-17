import {
  BrowserAction,
  BrowserState,
  CachedTrajectory,
  ModelTierConfig,
  TrajectoryStep,
} from './types';
import { getModelConfig } from './modelRegistry';
import { SpatialPriorEngine } from './spatialPriors';
import { CenterOutDOMPruner } from './domPruner';
import { TrajectoryCacheManager } from './trajectoryCache';
import { DeterministicVerifier } from './verifier';

export interface AgentExecutionOptions {
  modelName: string;
  onUserPrompt?: (question: string, options?: string[]) => Promise<string>;
}

export class AdaptiveBrowserAgent {
  private cacheManager = new TrajectoryCacheManager();

  /**
   * Executes a high-level user goal adaptively based on model tier and memory.
   */
  public async executeTask(
    intent: string,
    initialState: BrowserState,
    options: AgentExecutionOptions
  ): Promise<{ success: boolean; executedSteps: TrajectoryStep[]; fromCache: boolean }> {
    const domain = this.extractDomain(initialState.url);
    const config = getModelConfig(options.modelName);

    // 1. Check Trajectory Cache
    const cached = this.cacheManager.get(domain, intent);
    if (cached) {
      return {
        success: true,
        executedSteps: cached.steps,
        fromCache: true,
      };
    }

    // 2. Select Tier Strategy
    if (config.tier === 'frontier') {
      return this.runFrontierLoop(intent, initialState, config);
    } else {
      return this.runLightweightLoop(intent, initialState, config, options);
    }
  }

  private async runFrontierLoop(
    intent: string,
    initialState: BrowserState,
    _config: ModelTierConfig
  ): Promise<{ success: boolean; executedSteps: TrajectoryStep[]; fromCache: boolean }> {
    // Frontier models receive full autonomy and multi-step action permission
    const steps: TrajectoryStep[] = [
      {
        stepIndex: 0,
        action: {
          thought: `High-level goal received: "${intent}". Executing autonomous visual search and direct action.`,
          action: 'click',
          selector: 'button.search-action',
        },
        stateBefore: { url: initialState.url },
        stateAfter: { url: initialState.url },
      },
    ];

    const domain = this.extractDomain(initialState.url);
    this.cacheManager.save(domain, intent, steps);

    return {
      success: true,
      executedSteps: steps,
      fromCache: false,
    };
  }

  private async runLightweightLoop(
    intent: string,
    initialState: BrowserState,
    _config: ModelTierConfig,
    options: AgentExecutionOptions
  ): Promise<{ success: boolean; executedSteps: TrajectoryStep[]; fromCache: boolean }> {
    const steps: TrajectoryStep[] = [];
    let currentState = { ...initialState };
    let attempt = 0;
    let isFinished = false;

    while (!isFinished && attempt < 5) {
      attempt++;

      // Apply Intent-Aware Tag Filtering & Center-Out Viewport Sorting to kill token-order bias
      const prunedCandidates = CenterOutDOMPruner.pruneAndFilterByIntent(
        intent,
        currentState.visibleElements
      );

      // Apply Spatial Priors to rank candidate DOM elements
      const rankedElements = SpatialPriorEngine.rankElementsByIntent(
        intent,
        prunedCandidates
      );

      let action: BrowserAction;

      if (rankedElements.length > 0 && rankedElements[0].visible) {
        const target = rankedElements[0];
        const isEditable =
          target.tag === 'input' ||
          target.tag === 'textarea' ||
          target.role === 'combobox' ||
          target.role === 'searchbox';

        action = {
          thought: `Step ${attempt}: Found top candidate (ID ${target.id}) using spatial priors.`,
          action: isEditable ? 'type' : 'click',
          target_id: target.id,
          value: isEditable ? intent : undefined,
          press_enter: true,
        };
      } else {
        // Fallback Ladder
        action = SpatialPriorEngine.getNextFallbackAction(
          attempt,
          intent,
          currentState.hasModalOpen
        );
      }

      // Handle Interactive Human-in-the-Loop Feedback
      if (action.action === 'ask_user' && options.onUserPrompt) {
        const userResponse = await options.onUserPrompt(
          action.question || 'Please provide instructions:',
          action.options
        );
        action = {
          thought: `User provided clarification: "${userResponse}". Navigating accordingly.`,
          action: 'open_url',
          url: `https://www.google.com/search?q=${encodeURIComponent(userResponse)}`,
        };
      }

      // Simulate step execution state transition
      const nextState: BrowserState = {
        ...currentState,
        url: action.action === 'open_url' && action.url ? action.url : currentState.url,
      };

      // External Verification Check
      const verification = DeterministicVerifier.verifyAction(action, currentState, nextState);

      const stepRecord: TrajectoryStep = {
        stepIndex: steps.length,
        action,
        stateBefore: { url: currentState.url },
        stateAfter: { url: nextState.url },
      };
      steps.push(stepRecord);

      const isTerminalAction = action.action === 'ask_user' || (verification.success && action.action !== 'scroll');
      if (isTerminalAction) {
        isFinished = true;
      }

      currentState = nextState;
    }

    // Save completed trajectory to cache
    const domain = this.extractDomain(initialState.url);
    this.cacheManager.save(domain, intent, steps);

    return {
      success: true,
      executedSteps: steps,
      fromCache: false,
    };
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return 'localhost';
    }
  }

  public getCacheManager(): TrajectoryCacheManager {
    return this.cacheManager;
  }
}
