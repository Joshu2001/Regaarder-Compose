/**
 * useHighlights.js
 *
 * Manages Apple-style inline highlights within the contentEditable
 * Compose editor. Highlights are non-destructive <mark> spans that
 * support hover-preview, one-click apply, and silent ignore.
 *
 * Uses the DOM TreeWalker API to locate text nodes precisely,
 * avoiding fragile innerHTML string-replacement approaches.
 */
import { useCallback, useRef } from 'react';

const BASE_CLASS = 'ai-highlight';

/** Wrap an excerpt in a <mark> element inside the editor. Returns true on success. */
const insertHighlight = (editorEl, excerpt, suggestionId, category) => {
  if (!editorEl || !excerpt || excerpt.length < 3) return false;

  const walker = document.createTreeWalker(editorEl, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const idx = node.nodeValue.indexOf(excerpt);
    if (idx === -1) continue;
    try {
      const range = document.createRange();
      range.setStart(node, idx);
      range.setEnd(node, idx + excerpt.length);
      const mark = document.createElement('mark');
      mark.className = `${BASE_CLASS} ${BASE_CLASS}--${category}`;
      mark.dataset.suggestionId = suggestionId;
      range.surroundContents(mark);
      return true;
    } catch {
      // surroundContents fails when the range crosses element boundaries — skip silently
      return false;
    }
  }
  return false;
};

/** Unwrap a <mark> cleanly, restoring its text children to the parent. */
const unwrapMark = (mark) => {
  if (!mark?.parentNode) return;
  const frag = document.createDocumentFragment();
  while (mark.firstChild) frag.appendChild(mark.firstChild);
  mark.parentNode.replaceChild(frag, mark);
};

export const useHighlights = (editorRef) => {
  // Maps suggestionId → original text before a preview swap
  const previewBackup = useRef(new Map());

  const addHighlight = useCallback((excerpt, suggestionId, category = 'editor') => {
    return insertHighlight(editorRef?.current, excerpt, suggestionId, category);
  }, [editorRef]);

  const removeHighlight = useCallback((suggestionId) => {
    const mark = editorRef?.current?.querySelector(`[data-suggestion-id="${suggestionId}"]`);
    if (!mark) return;
    unwrapMark(mark);
    previewBackup.current.delete(suggestionId);
  }, [editorRef]);

  /** Temporarily swap the highlighted text to show the suggested fix on hover. */
  const previewHighlight = useCallback((suggestionId, newText) => {
    if (!newText) return;
    const mark = editorRef?.current?.querySelector(`[data-suggestion-id="${suggestionId}"]`);
    if (!mark || previewBackup.current.has(suggestionId)) return;
    previewBackup.current.set(suggestionId, mark.textContent);
    mark.textContent = newText;
    mark.classList.add(`${BASE_CLASS}--preview`);
  }, [editorRef]);

  /** Restore the original text after preview hover ends. */
  const cancelPreview = useCallback((suggestionId) => {
    const mark = editorRef?.current?.querySelector(`[data-suggestion-id="${suggestionId}"]`);
    const original = previewBackup.current.get(suggestionId);
    if (!mark || original === undefined) return;
    mark.textContent = original;
    mark.classList.remove(`${BASE_CLASS}--preview`);
    previewBackup.current.delete(suggestionId);
  }, [editorRef]);

  /** Permanently replace the highlighted text with the suggested fix. */
  const applyHighlight = useCallback((suggestionId, newText) => {
    const mark = editorRef?.current?.querySelector(`[data-suggestion-id="${suggestionId}"]`);
    if (!mark) return;
    previewBackup.current.delete(suggestionId);
    mark.parentNode?.replaceChild(document.createTextNode(newText), mark);
  }, [editorRef]);

  /** Remove every AI highlight from the editor without modifying text. */
  const clearAllHighlights = useCallback(() => {
    editorRef?.current?.querySelectorAll(`.${BASE_CLASS}`).forEach(unwrapMark);
    previewBackup.current.clear();
  }, [editorRef]);

  return { addHighlight, removeHighlight, previewHighlight, cancelPreview, applyHighlight, clearAllHighlights };
};
