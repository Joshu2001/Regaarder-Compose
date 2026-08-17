import { DOMElementNode } from './types';

export class CenterOutDOMPruner {
  /**
   * 1. Filters elements strictly by action intent (e.g. typing vs clicking).
   * 2. Sorts candidates by distance to the viewport center (eliminating top-left header / token-order bias).
   */
  public static pruneAndFilterByIntent(
    intent: string,
    elements: DOMElementNode[],
    viewportWidth = 1280,
    viewportHeight = 800
  ): DOMElementNode[] {
    const isTypingIntent = this.isTypingIntent(intent);

    let candidates = elements.filter((el) => el.visible);

    // Hard constraint: If user intent is typing/searching, reject non-input elements (links, static spans, nav buttons)
    if (isTypingIntent) {
      candidates = candidates.filter((el) => {
        const tag = el.tag.toLowerCase();
        const role = el.role?.toLowerCase() || '';
        return (
          tag === 'input' ||
          tag === 'textarea' ||
          role === 'searchbox' ||
          role === 'textbox' ||
          role === 'combobox'
        );
      });
    }

    // Viewport Center Coordinate
    const centerX = viewportWidth / 2;
    const centerY = viewportHeight / 2;

    // Center-out Euclidean distance sorting
    return candidates.sort((a, b) => {
      const distA = this.calculateDistanceToCenter(a, centerX, centerY);
      const distB = this.calculateDistanceToCenter(b, centerX, centerY);
      return distA - distB;
    });
  }

  private static isTypingIntent(intent: string): boolean {
    const lower = intent.toLowerCase();
    return (
      lower.includes('type') ||
      lower.includes('search') ||
      lower.includes('write') ||
      lower.includes('enter') ||
      lower.includes('input') ||
      lower.includes('fill')
    );
  }

  private static calculateDistanceToCenter(
    node: DOMElementNode,
    centerX: number,
    centerY: number
  ): number {
    if (!node.rect) return 99999;
    const nodeCenterX = node.rect.x + node.rect.width / 2;
    const nodeCenterY = node.rect.y + node.rect.height / 2;

    const dx = nodeCenterX - centerX;
    const dy = nodeCenterY - centerY;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
