import { BrowserAction, BrowserState, VerificationResult } from './types';

export class DeterministicVerifier {
  /**
   * Evaluates if an action achieved its intended state change without calling LLMs.
   */
  public static verifyAction(
    action: BrowserAction,
    stateBefore: BrowserState,
    stateAfter: BrowserState
  ): VerificationResult {
    switch (action.action) {
      case 'open_url': {
        const urlChanged = stateAfter.url !== stateBefore.url;
        return {
          success: urlChanged,
          reason: urlChanged ? 'URL navigation succeeded' : 'URL did not change after navigation command',
          suggestedFallback: urlChanged ? undefined : 'wait',
        };
      }

      case 'click': {
        const urlChanged = stateAfter.url !== stateBefore.url;
        const modalToggled = stateAfter.hasModalOpen !== stateBefore.hasModalOpen;
        const elementsChanged =
          stateAfter.visibleElements.length !== stateBefore.visibleElements.length;

        const actionEffective = urlChanged || modalToggled || elementsChanged;
        return {
          success: actionEffective,
          reason: actionEffective
            ? 'State change detected after click'
            : 'No DOM or URL mutation observed after click',
          suggestedFallback: actionEffective ? undefined : 'scroll',
        };
      }

      case 'dismiss_modal': {
        const modalClosed = stateBefore.hasModalOpen && !stateAfter.hasModalOpen;
        return {
          success: modalClosed,
          reason: modalClosed ? 'Modal successfully closed' : 'Modal remained open after dismissal attempt',
          suggestedFallback: modalClosed ? undefined : 'click',
        };
      }

      case 'type': {
        // Assume typing succeeded if action was fired; DOM input values update directly
        return {
          success: true,
          reason: 'Typing input executed',
        };
      }

      default:
        return {
          success: true,
          reason: 'Default action completed',
        };
    }
  }
}
