import { ExplicitTaskState, SemanticDOMTarget } from './runtimeTypes';

export interface ObservationSnapshot {
  url: string;
  focusedInput?: SemanticDOMTarget;
  semanticTargets: SemanticDOMTarget[];
  pageType: 'search_home' | 'search_results' | 'content_page' | 'incompatible_surface';
}

export class SemanticVerificationLoop {
  /**
   * Deterministically detects URL/surface mismatches (e.g. Google Images vs Web Search)
   */
  public static detectIncompatibleSurface(url: string, goal: string): { incompatible: boolean; remedyUrl?: string } {
    const isDocSearch = goal.toLowerCase().includes('doc') || goal.toLowerCase().includes('search');
    if (url.includes('google.com/imghp') && isDocSearch) {
      return {
        incompatible: true,
        remedyUrl: 'https://www.google.com',
      };
    }
    return { incompatible: false };
  }

  /**
   * Verified Action Pipeline: OBSERVE -> PLAN -> EXECUTE -> VERIFY
   */
  public static verifyActionEffect(
    actionName: string,
    params: any,
    before: ObservationSnapshot,
    after: ObservationSnapshot
  ): { verified: boolean; errorReason?: string } {
    switch (actionName) {
      case 'fill_input': {
        const target = after.semanticTargets.find(
          (t) => t.selector === params.selector || (params.role && t.role === params.role)
        );
        const verified = target?.value === params.text;
        return {
          verified,
          errorReason: verified
            ? undefined
            : `Verification failed: input value is "${target?.value}" instead of "${params.text}"`,
        };
      }

      case 'press_key': {
        if (params.key.toUpperCase() === 'ENTER') {
          const urlShifted = after.url !== before.url;
          const enteredResults = after.pageType === 'search_results';
          const verified = urlShifted || enteredResults;
          return {
            verified,
            errorReason: verified
              ? undefined
              : 'Verification failed: ENTER key did not trigger search results or URL transition',
          };
        }
        return { verified: true };
      }

      case 'click_element': {
        const urlChanged = after.url !== before.url;
        const stateMutated = after.semanticTargets.length !== before.semanticTargets.length;
        const verified = urlChanged || stateMutated;
        return {
          verified,
          errorReason: verified ? undefined : 'Verification failed: click did not cause state or URL change',
        };
      }

      case 'navigate': {
        const verified = after.url.includes(params.url) || params.url.includes(after.url);
        return {
          verified,
          errorReason: verified ? undefined : `Verification failed: expected URL "${params.url}", got "${after.url}"`,
        };
      }

      default:
        return { verified: true };
    }
  }

  /**
   * Generates strict, explicit prompt state to lock the LLM into its boundary
   */
  public static formatExplicitTaskPrompt(state: ExplicitTaskState): string {
    return `
[EXPLICIT TASK STATE]
Goal: ${state.goal}
Current Site: ${state.currentSite}
Page Type: ${state.currentPageType}
Input Value: ${state.currentInputText || '(none)'}
Search Submitted: ${state.searchSubmitted ? 'YES' : 'NO'}

[COMPLETED ACTIONS]
${state.completedSteps.length > 0 ? state.completedSteps.map((s) => `✓ ${s}`).join('\n') : '(None yet)'}

[NEXT MANDATORY OBJECTIVE]
${state.nextObjective}

[STRICTLY FORBIDDEN ACTIONS]
${state.forbiddenActions.map((f) => `✗ ${f}`).join('\n')}
`.trim();
  }
}
