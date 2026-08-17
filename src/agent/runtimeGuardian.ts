import { RuntimeToolRegistry } from './toolRegistry';
import { ObservationSnapshot, SemanticVerificationLoop } from './semanticVerifier';
import { ActiveMode, ExplicitTaskState, SurfaceContext } from './runtimeTypes';

export class RobustBrowserRuntimeGuardian {
  private mode: ActiveMode = 'browser_agent';
  private surface: SurfaceContext = 'web_page';
  private taskState: ExplicitTaskState;

  constructor(goal: string, initialUrl: string) {
    this.taskState = {
      goal,
      currentSite: this.extractHostname(initialUrl),
      currentPageType: initialUrl.includes('google.com/search') ? 'search_results' : 'search_home',
      completedSteps: [],
      searchSubmitted: false,
      nextObjective: 'Fill search query into the search combobox',
      forbiddenActions: [
        'workspace_create_sheet',
        'workspace_create_document',
        'calendar_create_event',
        'click arbitrary top navigation links',
      ],
    };
  }

  public setMode(mode: ActiveMode, surface: SurfaceContext) {
    this.mode = mode;
    this.surface = surface;
  }

  /**
   * Safe execution entry point: guarantees the model cannot execute illegal tools
   */
  public executeModelAction(
    toolName: string,
    params: any,
    currentObservation: ObservationSnapshot,
    simulateExecution: (tool: string, p: any) => ObservationSnapshot
  ): { success: boolean; message: string; newState?: ObservationSnapshot } {
    // 1. Tool Permission Gating
    if (!RuntimeToolRegistry.isToolPermitted(toolName, this.mode, this.surface)) {
      return {
        success: false,
        message: `RUNTIME REJECTED: Tool "${toolName}" is not permitted in mode "${this.mode}" on surface "${this.surface}".`,
      };
    }

    // 2. Incompatible Surface Check
    const surfaceCheck = SemanticVerificationLoop.detectIncompatibleSurface(
      currentObservation.url,
      this.taskState.goal
    );
    if (surfaceCheck.incompatible && toolName !== 'navigate') {
      return {
        success: false,
        message: `RUNTIME REDIRECT: Current page is Google Images (/imghp), incompatible with web documentation search. Navigating to ${surfaceCheck.remedyUrl}.`,
      };
    }

    // 3. Execution
    const afterObservation = simulateExecution(toolName, params);

    // 4. Semantic Verification Loop
    const verification = SemanticVerificationLoop.verifyActionEffect(
      toolName,
      params,
      currentObservation,
      afterObservation
    );

    if (!verification.verified) {
      return {
        success: false,
        message: verification.errorReason || 'Action verification failed',
      };
    }

    // 5. Update Explicit Task State
    this.updateTaskState(toolName, params, afterObservation);

    return {
      success: true,
      message: `Verified and executed ${toolName}`,
      newState: afterObservation,
    };
  }

  private updateTaskState(tool: string, params: any, observation: ObservationSnapshot) {
    if (tool === 'fill_input') {
      this.taskState.currentInputText = params.text;
      this.taskState.completedSteps.push(`Filled query: "${params.text}"`);
      this.taskState.nextObjective = 'Press ENTER to submit search query';
    } else if (tool === 'press_key' && params.key.toUpperCase() === 'ENTER') {
      this.taskState.searchSubmitted = true;
      this.taskState.completedSteps.push('Submitted search query');
      this.taskState.currentPageType = 'search_results';
      this.taskState.nextObjective = 'Click the authoritative documentation result';
    } else if (tool === 'click_element') {
      this.taskState.completedSteps.push(`Clicked link: "${params.name || params.selector}"`);
      this.taskState.nextObjective = 'Verify final destination documentation page';
    }
  }

  public getTaskStatePrompt(): string {
    return SemanticVerificationLoop.formatExplicitTaskPrompt(this.taskState);
  }

  private extractHostname(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return 'google.com';
    }
  }
}
