/**
 * Strict Runtime Tool Definition & Gating Types
 */

export type ActiveMode = 'browser_agent' | 'video_tutorial' | 'workspace_doc' | 'summarize';

export type SurfaceContext = 'web_page' | 'editor_canvas' | 'spreadsheet' | 'general_chat';

export interface ToolDefinition {
  name: string;
  description: string;
  parametersSchema: Record<string, any>;
  allowedModes: ActiveMode[];
  allowedSurfaces: SurfaceContext[];
}

export interface ExplicitTaskState {
  goal: string;
  currentSite: string;
  currentPageType: 'search_home' | 'search_results' | 'content_page' | 'incompatible_surface';
  completedSteps: string[];
  currentInputText?: string;
  searchSubmitted: boolean;
  nextObjective: string;
  forbiddenActions: string[];
}

export interface SemanticDOMTarget {
  role: 'textbox' | 'combobox' | 'link' | 'button' | 'checkbox' | 'menuitem' | 'heading';
  name?: string;
  selector: string;
  value?: string;
  isFocused?: boolean;
  isVisible: boolean;
}
