/**
 * docsCommandApi.js
 * 
 * Layer 1: Document Command API
 * 
 * Pure document command abstraction layer for Regaarder Compose Docs.
 * Executes semantic operations against the document model state.
 * Direct DOM manipulations or editor instances are isolated here.
 */

// Global registry of active editor instance bindings
let activeEditorBinding = null;

/**
 * Register active document editor instance and state getters/setters.
 * Call this from App.jsx or document container component on mount.
 */
export const registerDocumentEditorBinding = (binding) => {
  activeEditorBinding = binding;
  console.log('[DocsCommandAPI] Active editor binding registered:', !!binding);
};

/**
 * Get active editor element or container
 */
const getActiveEditable = () => {
  if (activeEditorBinding?.getEditable) {
    const el = activeEditorBinding.getEditable();
    if (el) return el;
  }
  if (typeof document !== 'undefined') {
    return document.querySelector('[contenteditable="true"]');
  }
  return null;
};

/**
 * Helper to ensure focus on active editable area
 */
const ensureFocus = () => {
  const ed = getActiveEditable();
  if (ed && typeof document !== 'undefined' && document.activeElement !== ed) {
    ed.focus();
  }
  return ed;
};

/**
 * 1. Get Document Snapshot
 * Returns document text, HTML content, selection state, and metadata.
 */
export const getDocumentSnapshot = () => {
  const ed = getActiveEditable();
  const rawText = ed ? ed.innerText || ed.textContent || '' : '';
  const rawHtml = ed ? ed.innerHTML || '' : '';
  
  const selection = typeof window !== 'undefined' && window.getSelection ? window.getSelection() : null;
  const selectedText = selection ? selection.toString() : '';
  
  return {
    text: rawText,
    html: rawHtml,
    characterCount: rawText.length,
    wordCount: rawText.trim() ? rawText.trim().split(/\s+/).length : 0,
    selectedText: selectedText,
    hasSelection: Boolean(selectedText && selectedText.length > 0),
    timestamp: new Date().toISOString()
  };
};

/**
 * 2. Get Document Stats
 * Computes deep reading & readability metrics.
 */
export const getDocumentStats = () => {
  const snapshot = getDocumentSnapshot();
  const text = snapshot.text;
  const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean) : [];
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean);
  
  const readingTimeMinutes = Math.ceil(words.length / 200);

  return {
    wordCount: words.length,
    characterCount: text.length,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    readingTimeMinutes: readingTimeMinutes,
    avgWordLength: words.length ? (text.length / words.length).toFixed(1) : 0,
    avgSentenceLength: sentences.length ? (words.length / sentences.length).toFixed(1) : 0
  };
};

/**
 * 3. Insert Content (Text or HTML)
 */
export const insertContent = ({ text = '', html = '', position = 'cursor' }) => {
  const ed = ensureFocus();
  if (!ed) return { success: false, reason: 'No active editor found' };

  if (activeEditorBinding?.insertHTML && html) {
    activeEditorBinding.insertHTML(html);
    return { success: true, mode: 'binding_html' };
  }
  if (activeEditorBinding?.insertText && text) {
    activeEditorBinding.insertText(text);
    return { success: true, mode: 'binding_text' };
  }

  if (position === 'end') {
    if (html) {
      ed.innerHTML += html;
    } else {
      ed.innerText += text;
    }
  } else {
    // Insert at cursor
    if (html) {
      document.execCommand('insertHTML', false, html);
    } else if (text) {
      document.execCommand('insertText', false, text);
    }
  }

  return { success: true, mode: 'execCommand' };
};

/**
 * 4. Replace Range / Target Text
 */
export const replaceRange = ({ targetText = '', replacementText = '', replaceAll = false }) => {
  const ed = ensureFocus();
  if (!ed) return { success: false, reason: 'No active editor found' };

  const snapshot = getDocumentSnapshot();
  
  // If targetText specified, replace targetText in innerHTML/innerText
  if (targetText && snapshot.text.includes(targetText)) {
    if (replaceAll) {
      const regex = new RegExp(targetText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      ed.innerHTML = ed.innerHTML.replace(regex, replacementText);
    } else {
      ed.innerHTML = ed.innerHTML.replace(targetText, replacementText);
    }
    return { success: true, replacedCount: replaceAll ? 'all' : 1 };
  }

  // If selection exists, replace active selection
  if (snapshot.hasSelection) {
    document.execCommand('insertText', false, replacementText);
    return { success: true, replacedCount: 1, mode: 'selection' };
  }

  return { success: false, reason: 'Target text not found and no selection active' };
};

/**
 * 5. Apply Text Formatting
 */
export const applyTextStyle = ({ style = {} }) => {
  ensureFocus();
  
  const { bold, italic, underline, strike, fontFamily, fontSize, color, highlight } = style;

  if (bold !== undefined) document.execCommand('bold', false, null);
  if (italic !== undefined) document.execCommand('italic', false, null);
  if (underline !== undefined) document.execCommand('underline', false, null);
  if (strike !== undefined) document.execCommand('strikeThrough', false, null);
  if (fontFamily) document.execCommand('fontName', false, fontFamily);
  if (fontSize) document.execCommand('fontSize', false, fontSize);
  if (color) document.execCommand('foreColor', false, color);
  if (highlight) document.execCommand('hiliteColor', false, highlight);

  return { success: true, appliedStyles: style };
};

/**
 * 6. Apply Block Formatting
 */
export const applyBlockFormat = ({ blockType = 'p' }) => {
  ensureFocus();

  switch (blockType) {
    case 'h1':
      document.execCommand('formatBlock', false, 'H1');
      break;
    case 'h2':
      document.execCommand('formatBlock', false, 'H2');
      break;
    case 'h3':
      document.execCommand('formatBlock', false, 'H3');
      break;
    case 'blockquote':
      document.execCommand('insertHTML', false, '<blockquote style="border-left:4px solid #8b5cf6;padding:8px 12px;background:#faf5ff;border-radius:0 6px 6px 0;margin:12px 0;color:#4c1d95;font-style:italic;">&nbsp;</blockquote>');
      break;
    case 'code':
      document.execCommand('insertHTML', false, '<pre style="background:#1e293b;border-radius:8px;padding:12px 16px;font-family:monospace;font-size:13px;color:#e2e8f0;white-space:pre-wrap;overflow-x:auto;"><code>// Code block</code></pre><p><br></p>');
      break;
    case 'ul':
      document.execCommand('insertUnorderedList', false, null);
      break;
    case 'ol':
      document.execCommand('insertOrderedList', false, null);
      break;
    case 'hr':
      document.execCommand('insertHTML', false, '<hr style="border:none;border-top:2px solid #e2e8f0;margin:16px 0;" /><p><br></p>');
      break;
    case 'p':
    default:
      document.execCommand('formatBlock', false, 'p');
      break;
  }

  return { success: true, blockType };
};

/**
 * 7. Insert Table Structure
 */
export const insertTableStructure = ({ rows = 3, cols = 3, stylePreset = 'modern' }) => {
  ensureFocus();

  let ths = '';
  for (let c = 0; c < cols; c++) {
    ths += `<th contenteditable="true" style="border:1px solid #e2e8f0;padding:10px 14px;background:#f8fafc;font-weight:600;text-align:left;color:#334155;outline:none;">Header ${c + 1}</th>`;
  }
  let bodyRows = '';
  for (let r = 0; r < rows; r++) {
    let tds = '';
    for (let c = 0; c < cols; c++) {
      tds += `<td contenteditable="true" style="border:1px solid #e2e8f0;padding:10px 14px;outline:none;">Cell ${r + 1},${c + 1}</td>`;
    }
    bodyRows += `<tr>${tds}</tr>`;
  }

  const tableHtml = `<div class="table-block" data-block-type="table" contenteditable="false" style="margin:16px 0; position:relative; border-radius:8px; overflow:hidden;"><table style="border-collapse:collapse;width:100%;font-size:13px;"><thead><tr>${ths}</tr></thead><tbody>${bodyRows}</tbody></table></div><p><br></p>`;

  return insertContent({ html: tableHtml });
};

/**
 * 8. Insert Citation Element
 */
export const insertCitationElement = ({ citationId = `cit_${Date.now()}`, title = '', authors = '', year = '', sourceUrl = '' }) => {
  ensureFocus();
  const citationHtml = `<sup class="compose-citation" data-cit-id="${citationId}" data-cit-title="${title}" data-cit-authors="${authors}" data-cit-year="${year}" data-cit-url="${sourceUrl}" contenteditable="false" style="color:#7c3aed;font-weight:700;cursor:pointer;padding:0 2px;">[${title || 'Citation'}]</sup>`;
  return insertContent({ html: citationHtml });
};

/**
 * 9. Insert Callout Box
 */
export const insertCalloutBlock = ({ title = 'Note', body = 'Enter callout text...', theme = 'info' }) => {
  ensureFocus();
  const themeColors = {
    info: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' },
    warning: { bg: '#fffbebeb', border: '#f59e0b', text: '#92400e' },
    success: { bg: '#f0fdf4', border: '#22c55e', text: '#166534' },
    danger: { bg: '#fef2f2', border: '#ef4444', text: '#991b1b' },
  };
  const c = themeColors[theme] || themeColors.info;

  const calloutHtml = `<div class="callout-block" data-theme="${theme}" contenteditable="false" style="background:${c.bg};border-left:4px solid ${c.border};border-radius:0 8px 8px 0;padding:12px 16px;margin:16px 0;color:${c.text};"><strong style="display:block;margin-bottom:4px;">${title}</strong><div contenteditable="true" style="outline:none;">${body}</div></div><p><br></p>`;

  return insertContent({ html: calloutHtml });
};

/**
 * 10. Delete Range / Clear Content
 */
export const deleteRange = ({ targetText = '', deleteEntireDocument = false }) => {
  const ed = ensureFocus();
  if (!ed) return { success: false, reason: 'No active editor found' };

  if (deleteEntireDocument) {
    ed.innerHTML = '<p><br></p>';
    return { success: true, deleted: 'all' };
  }

  if (targetText) {
    return replaceRange({ targetText, replacementText: '' });
  }

  document.execCommand('delete', false, null);
  return { success: true, deleted: 'selection' };
};
