import { BrowserAction, DOMElementNode } from './types';

export class SpatialPriorEngine {
  /**
   * Scores and ranks DOM elements based on spatial conventions (priors) for common tasks.
   */
  public static rankElementsByIntent(
    intent: string,
    elements: DOMElementNode[]
  ): DOMElementNode[] {
    const lowerIntent = intent.toLowerCase();

    if (lowerIntent.includes('search') || lowerIntent.includes('find') || lowerIntent.includes('google')) {
      return this.rankForSearch(elements);
    }

    if (lowerIntent.includes('close') || lowerIntent.includes('dismiss') || lowerIntent.includes('exit')) {
      return this.rankForCloseOrDismiss(elements);
    }

    if (lowerIntent.includes('menu') || lowerIntent.includes('nav') || lowerIntent.includes('tab')) {
      return this.rankForNavigation(elements);
    }

    // Default: visible and in-viewport first
    return [...elements].sort((a, b) => (b.isInViewport ? 1 : 0) - (a.isInViewport ? 1 : 0));
  }

  private static rankForSearch(elements: DOMElementNode[]): DOMElementNode[] {
    return [...elements].sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Inputs with search placeholder or tag
      if (a.tag === 'input' || a.role === 'searchbox') scoreA += 10;
      if (b.tag === 'input' || b.role === 'searchbox') scoreB += 10;

      // Spatial Prior: Search bars are typically top-center / top-right (y < 200)
      if (a.rect && a.rect.y < 200) scoreA += 5;
      if (b.rect && b.rect.y < 200) scoreB += 5;

      return scoreB - scoreA;
    });
  }

  private static rankForCloseOrDismiss(elements: DOMElementNode[]): DOMElementNode[] {
    return [...elements].sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      const isCloseTextA = a.text?.toLowerCase().includes('close') || a.ariaLabel?.toLowerCase().includes('close') || a.text === '×';
      const isCloseTextB = b.text?.toLowerCase().includes('close') || b.ariaLabel?.toLowerCase().includes('close') || b.text === '×';

      if (isCloseTextA) scoreA += 10;
      if (isCloseTextB) scoreB += 10;

      // Spatial Prior: Modals close buttons are top-right
      if (a.rect && a.rect.y < 300 && a.rect.x > 400) scoreA += 5;
      if (b.rect && b.rect.y < 300 && b.rect.x > 400) scoreB += 5;

      return scoreB - scoreA;
    });
  }

  private static rankForNavigation(elements: DOMElementNode[]): DOMElementNode[] {
    return [...elements].sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      if (a.role === 'navigation' || a.tag === 'nav' || a.tag === 'a') scoreA += 5;
      if (b.role === 'navigation' || b.tag === 'nav' || b.tag === 'a') scoreB += 5;

      // Spatial Prior: Navigation is left sidebar (x < 250) or header (y < 120)
      if (a.rect && (a.rect.x < 250 || a.rect.y < 120)) scoreA += 5;
      if (b.rect && (b.rect.x < 250 || b.rect.y < 120)) scoreB += 5;

      return scoreB - scoreA;
    });
  }

  /**
   * Generates a deterministic fallback action when the current attempt fails.
   */
  public static getNextFallbackAction(
    currentAttempt: number,
    intent: string,
    hasModal: boolean
  ): BrowserAction {
    if (hasModal && currentAttempt === 1) {
      return {
        thought: 'A modal dialog might be blocking interaction. Attempting to dismiss modal first.',
        action: 'dismiss_modal',
      };
    }

    switch (currentAttempt) {
      case 1:
        return {
          thought: 'Target element not found at expected location. Scrolling down to reveal more content.',
          action: 'scroll',
          direction: 'down',
          amount: 500,
        };
      case 2:
        return {
          thought: 'Element still not in direct view. Searching page for a menu or dropdown to expand.',
          action: 'scroll',
          direction: 'up',
          amount: 500,
        };
      case 3:
        return {
          thought: 'Required information/action not found on this page. Navigating to Google Search to look up direct destination.',
          action: 'open_url',
          url: `https://www.google.com/search?q=${encodeURIComponent(intent)}`,
        };
      default:
        return {
          thought: 'Automatic exploration exhausted without confidence. Requesting user guidance.',
          action: 'ask_user',
          question: `I could not locate the element for "${intent}". Would you like me to try another search or navigate to a specific URL?`,
          options: ['Search Google', 'Enter custom URL', 'Cancel task'],
        };
    }
  }
}
