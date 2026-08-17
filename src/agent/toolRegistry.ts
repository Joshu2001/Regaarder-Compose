import { ActiveMode, SurfaceContext, ToolDefinition } from './runtimeTypes';

export class RuntimeToolRegistry {
  private static allTools: ToolDefinition[] = [
    // Browser Execution Tools (ONLY active in browser_agent mode on web_page surface)
    {
      name: 'fill_input',
      description: 'Fills a text input or combobox semantically by selector or role/name.',
      parametersSchema: { selector: 'string', text: 'string' },
      allowedModes: ['browser_agent'],
      allowedSurfaces: ['web_page'],
    },
    {
      name: 'press_key',
      description: 'Sends keyboard key event (e.g. ENTER, TAB, ESCAPE) to an element or page.',
      parametersSchema: { key: 'string', targetSelector: 'string' },
      allowedModes: ['browser_agent'],
      allowedSurfaces: ['web_page'],
    },
    {
      name: 'click_element',
      description: 'Clicks a semantic DOM element (link, button, combobox).',
      parametersSchema: { selector: 'string', role: 'string', name: 'string' },
      allowedModes: ['browser_agent'],
      allowedSurfaces: ['web_page'],
    },
    {
      name: 'navigate',
      description: 'Navigates the browser to an explicit URL.',
      parametersSchema: { url: 'string' },
      allowedModes: ['browser_agent'],
      allowedSurfaces: ['web_page'],
    },
    {
      name: 'scroll_page',
      description: 'Scrolls the viewport vertically or horizontally.',
      parametersSchema: { direction: 'string', amount: 'number' },
      allowedModes: ['browser_agent'],
      allowedSurfaces: ['web_page'],
    },

    // Video Tutorial / Recording Tools (ONLY in video_tutorial mode)
    {
      name: 'record_step_narration',
      description: 'Records a spoken or overlay narration for the current tutorial step.',
      parametersSchema: { stepTitle: 'string', explanation: 'string' },
      allowedModes: ['video_tutorial'],
      allowedSurfaces: ['web_page', 'editor_canvas', 'spreadsheet'],
    },
    {
      name: 'highlight_spotlight_area',
      description: 'Places an instructional visual spotlight over an element.',
      parametersSchema: { selector: 'string', label: 'string' },
      allowedModes: ['video_tutorial'],
      allowedSurfaces: ['web_page', 'editor_canvas'],
    },

    // Workspace & Sheet Tools (STRICTLY FORBIDDEN on browser web_page tasks)
    {
      name: 'workspace_create_sheet',
      description: 'Creates a new spreadsheet in the workspace.',
      parametersSchema: { title: 'string', columns: 'array' },
      allowedModes: ['workspace_doc'],
      allowedSurfaces: ['spreadsheet', 'editor_canvas'],
    },
    {
      name: 'workspace_create_document',
      description: 'Creates a new markdown document.',
      parametersSchema: { title: 'string', content: 'string' },
      allowedModes: ['workspace_doc'],
      allowedSurfaces: ['editor_canvas'],
    },
  ];

  /**
   * Runtime Guardian: Filters available tools strictly by mode, surface, and intent.
   * If a model hallucinates a forbidden tool name, the runtime rejects it before execution.
   */
  public static getPermittedTools(mode: ActiveMode, surface: SurfaceContext): ToolDefinition[] {
    return this.allTools.filter(
      (tool) =>
        tool.allowedModes.includes(mode) && tool.allowedSurfaces.includes(surface)
    );
  }

  public static isToolPermitted(
    toolName: string,
    mode: ActiveMode,
    surface: SurfaceContext
  ): boolean {
    const permitted = this.getPermittedTools(mode, surface);
    return permitted.some((t) => t.name === toolName);
  }
}
