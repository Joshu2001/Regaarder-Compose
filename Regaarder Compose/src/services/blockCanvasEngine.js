/**
 * blockCanvasEngine.js
 * 
 * Pillar 4: The Canvas (Block-Level State IDs & Surgical Patch Engine)
 * 
 * Implements a structured Abstract Syntax Tree (AST) Document Model.
 * Every heading, paragraph, callout, table, quote, or list item possesses
 * a permanent, unique block ID (`block_id: "blk_..."`).
 * 
 * This enables autonomous agents to execute surgical PATCH operations
 * targeting individual blocks with zero re-stream latency and zero document corruption.
 */

import { notifyDocumentMutated } from './universalContextGraph.js';
import { stageMutation } from './workspaceStagingEngine.js';

// Global cache and listeners for active document block tree state
let activeBlockTree = null;
const blockTreeListeners = new Set();
let blockSequenceCounter = 1;

/**
 * Generate a deterministic or randomized unique Block ID.
 * @param {string} prefix 
 */
export function generateBlockId(prefix = 'blk') {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 7);
  const seq = (blockSequenceCounter++).toString(36);
  return `${prefix}_${ts}_${seq}${rand}`;
}

/**
 * Clean and normalize text strings.
 */
function cleanText(str = '') {
  return String(str || '').trim();
}

/**
 * Strip internal HTML tags to extract raw text content while preserving line breaks.
 */
function stripHtml(html = '') {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. ISOMORPHIC SERIALIZERS: HTML <-> BLOCK TREE AST
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ingests an HTML string or DOM node and parses it into a canonical BlockTreeState.
 * Automatically discovers existing `data-block-id` attributes or tags new IDs.
 * 
 * @param {string} html 
 * @param {object} options 
 * @returns {object} BlockTreeState
 */
export function htmlToBlockTree(html = '', options = {}) {
  const documentId = options.documentId || 'doc_active';
  const title = options.title || 'Active Document';

  if (!html || typeof html !== 'string' || !html.trim()) {
    return {
      documentId,
      title,
      version: 1,
      updatedAt: new Date().toISOString(),
      blocks: [
        {
          id: generateBlockId('blk_p'),
          type: 'paragraph',
          content: '',
          properties: {},
          version: 1,
          updatedAt: new Date().toISOString()
        }
      ]
    };
  }

  // Parse HTML blocks using DOMParser in browser or regex/token fallback in Node
  const blocks = [];

  if (typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const bodyChildren = Array.from(doc.body.children);

    if (bodyChildren.length === 0 && doc.body.textContent.trim()) {
      blocks.push({
        id: generateBlockId('blk_p'),
        type: 'paragraph',
        content: doc.body.textContent.trim(),
        properties: {},
        version: 1,
        updatedAt: new Date().toISOString()
      });
    } else {
      bodyChildren.forEach((el, index) => {
        const block = domElementToBlock(el, index);
        if (block) blocks.push(block);
      });
    }
  } else {
    // Node.js isomorphic regex-based block tokenizer
    const blockRegex = /<(h[1-6]|p|blockquote|pre|table|div|ul|ol)\b([^>]*)>([\s\S]*?)<\/\1>|<(hr)\b([^>]*)\/?>/gi;
    let match;
    let index = 0;

    while ((match = blockRegex.exec(html)) !== null) {
      const tag = (match[1] || match[4] || 'p').toLowerCase();
      const rawAttrs = match[2] || match[5] || '';
      const innerContent = match[3] || '';

      // Extract existing data-block-id if available
      const idMatch = /data-block-id=["']([^"']+)["']/i.exec(rawAttrs);
      const existingId = idMatch ? idMatch[1] : null;

      let type = 'paragraph';
      const properties = {};

      if (tag === 'h1') type = 'h1';
      else if (tag === 'h2') type = 'h2';
      else if (tag === 'h3') type = 'h3';
      else if (tag === 'blockquote') type = 'quote';
      else if (tag === 'pre') {
        type = 'code';
        const langMatch = /class=["'][^"']*language-([^"'\s]+)/i.exec(rawAttrs);
        if (langMatch) properties.language = langMatch[1];
      } else if (tag === 'table') {
        type = 'table';
      } else if (tag === 'ul') {
        type = 'bullet_list';
      } else if (tag === 'ol') {
        type = 'numbered_list';
      } else if (tag === 'hr') {
        type = 'divider';
      } else if (tag === 'div') {
        if (/callout-block/i.test(rawAttrs)) {
          type = 'callout';
          const themeMatch = /data-theme=["']([^"']+)["']/i.exec(rawAttrs);
          if (themeMatch) properties.theme = themeMatch[1];
        }
      }

      blocks.push({
        id: existingId || generateBlockId(`blk_${type}`),
        type,
        content: stripHtml(innerContent),
        properties,
        version: 1,
        updatedAt: new Date().toISOString()
      });
      index++;
    }

    if (blocks.length === 0 && html.trim()) {
      blocks.push({
        id: generateBlockId('blk_p'),
        type: 'paragraph',
        content: stripHtml(html),
        properties: {},
        version: 1,
        updatedAt: new Date().toISOString()
      });
    }
  }

  const blockTree = {
    documentId,
    title,
    version: 1,
    updatedAt: new Date().toISOString(),
    blocks: blocks.length > 0 ? blocks : [
      {
        id: generateBlockId('blk_p'),
        type: 'paragraph',
        content: '',
        properties: {},
        version: 1,
        updatedAt: new Date().toISOString()
      }
    ]
  };

  activeBlockTree = blockTree;
  return blockTree;
}

/**
 * Convert a single browser DOM element into a typed CanvasBlock.
 */
function domElementToBlock(el, index) {
  const tagName = el.tagName.toLowerCase();
  const existingId = el.getAttribute('data-block-id');
  const properties = {};
  let type = 'paragraph';

  if (tagName === 'h1') type = 'h1';
  else if (tagName === 'h2') type = 'h2';
  else if (tagName === 'h3') type = 'h3';
  else if (tagName === 'blockquote') type = 'quote';
  else if (tagName === 'pre') {
    type = 'code';
    const codeEl = el.querySelector('code');
    properties.language = codeEl?.className?.replace('language-', '') || 'javascript';
  } else if (tagName === 'table' || el.classList.contains('table-block')) {
    type = 'table';
    const table = tagName === 'table' ? el : el.querySelector('table');
    if (table) {
      const headerCells = Array.from(table.querySelectorAll('thead th, thead td')).map(c => c.textContent.trim());
      const rows = Array.from(table.querySelectorAll('tbody tr')).map(tr => 
        Array.from(tr.querySelectorAll('td, th')).map(td => td.textContent.trim())
      );
      properties.headers = headerCells;
      properties.rows = rows;
    }
  } else if (el.classList.contains('callout-block') || el.getAttribute('data-theme')) {
    type = 'callout';
    properties.theme = el.getAttribute('data-theme') || 'info';
  } else if (tagName === 'ul') {
    type = 'bullet_list';
  } else if (tagName === 'ol') {
    type = 'numbered_list';
  } else if (tagName === 'hr') {
    type = 'divider';
  }

  return {
    id: existingId || generateBlockId(`blk_${type}`),
    type,
    content: stripHtml(el.innerHTML),
    properties,
    version: 1,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Converts a canonical BlockTreeState back into clean, production-ready HTML
 * where every block is strictly tagged with `data-block-id` and `data-block-type`.
 * 
 * @param {object} blockTree 
 * @returns {string} HTML string
 */
export function blockTreeToHtml(blockTree) {
  if (!blockTree || !Array.isArray(blockTree.blocks)) {
    return '<p data-block-id="blk_default" data-block-type="paragraph"><br></p>';
  }

  return blockTree.blocks.map(block => {
    const { id, type, content = '', properties = {} } = block;
    const safeContent = content ? content.replace(/\n/g, '<br>') : '<br>';

    switch (type) {
      case 'h1':
        return `<h1 data-block-id="${id}" data-block-type="h1">${safeContent}</h1>`;
      case 'h2':
        return `<h2 data-block-id="${id}" data-block-type="h2">${safeContent}</h2>`;
      case 'h3':
        return `<h3 data-block-id="${id}" data-block-type="h3">${safeContent}</h3>`;
      case 'quote':
        return `<blockquote data-block-id="${id}" data-block-type="quote" style="border-left:4px solid #8b5cf6;padding:8px 12px;background:#faf5ff;border-radius:0 6px 6px 0;margin:12px 0;color:#4c1d95;font-style:italic;">${safeContent}</blockquote>`;
      case 'code':
        return `<pre data-block-id="${id}" data-block-type="code" style="background:#1e293b;border-radius:8px;padding:12px 16px;font-family:monospace;font-size:13px;color:#e2e8f0;white-space:pre-wrap;overflow-x:auto;"><code class="language-${properties.language || 'text'}">${content || '// Code'}</code></pre>`;
      case 'callout': {
        const theme = properties.theme || 'info';
        const colors = {
          info: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' },
          warning: { bg: '#fffbebeb', border: '#f59e0b', text: '#92400e' },
          success: { bg: '#f0fdf4', border: '#22c55e', text: '#166534' },
          danger: { bg: '#fef2f2', border: '#ef4444', text: '#991b1b' }
        };
        const c = colors[theme] || colors.info;
        return `<div class="callout-block" data-block-id="${id}" data-block-type="callout" data-theme="${theme}" style="background:${c.bg};border-left:4px solid ${c.border};border-radius:0 8px 8px 0;padding:12px 16px;margin:16px 0;color:${c.text};">${safeContent}</div>`;
      }
      case 'table': {
        const headers = properties.headers || ['Column 1', 'Column 2'];
        const rows = properties.rows || [['Data 1', 'Data 2']];
        const ths = headers.map(h => `<th style="border:1px solid #e2e8f0;padding:8px 12px;background:#f8fafc;font-weight:600;text-align:left;">${h}</th>`).join('');
        const trs = rows.map(r => `<tr>${r.map(cell => `<td style="border:1px solid #e2e8f0;padding:8px 12px;">${cell}</td>`).join('')}</tr>`).join('');
        return `<div class="table-block" data-block-id="${id}" data-block-type="table" style="margin:16px 0;overflow-x:auto;"><table style="border-collapse:collapse;width:100%;font-size:13px;"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></div>`;
      }
      case 'divider':
        return `<hr data-block-id="${id}" data-block-type="divider" style="border:none;border-top:2px solid #e2e8f0;margin:16px 0;" />`;
      case 'bullet_list_item':
        return `<li data-block-id="${id}" data-block-type="bullet_list_item">${safeContent}</li>`;
      case 'numbered_list_item':
        return `<li data-block-id="${id}" data-block-type="numbered_list_item">${safeContent}</li>`;
      case 'paragraph':
      default:
        return `<p data-block-id="${id}" data-block-type="paragraph">${safeContent}</p>`;
    }
  }).join('\n');
}

/**
 * Converts a BlockTreeState into token-dense markdown format.
 */
export function blockTreeToMarkdown(blockTree) {
  if (!blockTree || !Array.isArray(blockTree.blocks)) return '';

  return blockTree.blocks.map(b => {
    switch (b.type) {
      case 'h1': return `# ${b.content} <!-- id:${b.id} -->`;
      case 'h2': return `## ${b.content} <!-- id:${b.id} -->`;
      case 'h3': return `### ${b.content} <!-- id:${b.id} -->`;
      case 'quote': return `> ${b.content} <!-- id:${b.id} -->`;
      case 'code': return `\`\`\`${b.properties?.language || ''}\n${b.content}\n\`\`\` <!-- id:${b.id} -->`;
      case 'callout': return `> [!${(b.properties?.theme || 'NOTE').toUpperCase()}]\n> ${b.content} <!-- id:${b.id} -->`;
      case 'divider': return `--- <!-- id:${b.id} -->`;
      case 'bullet_list_item': return `- ${b.content} <!-- id:${b.id} -->`;
      case 'numbered_list_item': return `1. ${b.content} <!-- id:${b.id} -->`;
      case 'paragraph':
      default:
        return `${b.content} <!-- id:${b.id} -->`;
    }
  }).join('\n\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. SURGICAL AST PATCH ENGINE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retrieve a specific block by its unique ID.
 * 
 * @param {object} blockTree 
 * @param {string} blockId 
 * @returns {object|null}
 */
export function getBlock(blockTree, blockId) {
  const tree = blockTree || activeBlockTree;
  if (!tree || !Array.isArray(tree.blocks)) return null;
  return tree.blocks.find(b => b.id === blockId) || null;
}

/**
 * Surgically patch an individual block without touching or re-streaming any other blocks.
 * 
 * @param {object} blockTree 
 * @param {object} patch
 * @param {string} patch.blockId - Target block ID.
 * @param {string} [patch.content] - New content for the block.
 * @param {object} [patch.properties] - Properties to merge.
 * @param {string} [patch.type] - Optional new block type.
 * @param {string} [patch.agentId] - Originating agent or 'human'.
 * @param {object} [options] - { stage: boolean, branchId: string }
 * @returns {object} { success: boolean, updatedBlock: object, beforeBlock: object }
 */
export function patchBlock(blockTree, patch = {}, options = {}) {
  const tree = blockTree || activeBlockTree;
  if (!tree) throw new Error('No active block tree available.');

  const { blockId, content, properties, type, agentId = 'relay_agent' } = patch;
  if (!blockId) throw new Error('Missing target blockId for patch operation.');

  const blockIndex = tree.blocks.findIndex(b => b.id === blockId);
  if (blockIndex === -1) {
    throw new Error(`Target block ID '${blockId}' not found in canvas AST.`);
  }

  const beforeBlock = { ...tree.blocks[blockIndex] };

  // Pillar 3 Staging Sandbox Support
  if (options.stage) {
    const afterContent = content !== undefined ? content : beforeBlock.content;
    const stagedResult = stageMutation({
      branchId: options.branchId,
      targetApp: 'compose',
      entityId: tree.documentId,
      targetTitle: `${tree.title} [Block ${blockId}]`,
      toolName: 'patch_block',
      params: patch,
      beforeText: beforeBlock.content || '',
      afterText: afterContent,
      metadata: { blockId, blockType: beforeBlock.type }
    });

    return {
      success: true,
      isStaged: true,
      branchId: stagedResult.branchId,
      mutationId: stagedResult.mutationId,
      prNumber: stagedResult.prNumber,
      beforeBlock,
      message: `Staged patch for block ${blockId} into PR #${stagedResult.prNumber}.`
    };
  }

  // Surgical in-place AST update
  const updatedBlock = {
    ...beforeBlock,
    content: content !== undefined ? cleanText(content) : beforeBlock.content,
    properties: properties ? { ...beforeBlock.properties, ...properties } : beforeBlock.properties,
    type: type || beforeBlock.type,
    version: (beforeBlock.version || 1) + 1,
    updatedAt: new Date().toISOString(),
    lastModifiedBy: agentId
  };

  tree.blocks[blockIndex] = updatedBlock;
  tree.version = (tree.version || 1) + 1;
  tree.updatedAt = new Date().toISOString();

  notifyBlockTreeChange(tree, {
    action: 'patch',
    blockId,
    updatedBlock,
    beforeBlock
  });

  return {
    success: true,
    blockId,
    updatedBlock,
    beforeBlock
  };
}

/**
 * Inserts a new block adjacent to a target block ('before' or 'after').
 */
export function insertBlock(blockTree, insertion = {}, options = {}) {
  const tree = blockTree || activeBlockTree;
  if (!tree) throw new Error('No active block tree available.');

  const {
    targetBlockId,
    position = 'after',
    block = {},
    agentId = 'relay_agent'
  } = insertion;

  const targetIndex = targetBlockId ? tree.blocks.findIndex(b => b.id === targetBlockId) : -1;
  const insertIndex = targetIndex === -1 
    ? (position === 'before' ? 0 : tree.blocks.length)
    : (position === 'before' ? targetIndex : targetIndex + 1);

  const newBlock = {
    id: block.id || generateBlockId(`blk_${block.type || 'p'}`),
    type: block.type || 'paragraph',
    content: cleanText(block.content || ''),
    properties: block.properties || {},
    version: 1,
    updatedAt: new Date().toISOString(),
    lastModifiedBy: agentId
  };

  // Pillar 3 Staging Sandbox Support
  if (options.stage) {
    const stagedResult = stageMutation({
      branchId: options.branchId,
      targetApp: 'compose',
      entityId: tree.documentId,
      targetTitle: `${tree.title} [New Block ${newBlock.type}]`,
      toolName: 'insert_block',
      params: insertion,
      beforeText: '',
      afterText: newBlock.content,
      metadata: { newBlockId: newBlock.id, position, targetBlockId }
    });

    return {
      success: true,
      isStaged: true,
      branchId: stagedResult.branchId,
      mutationId: stagedResult.mutationId,
      prNumber: stagedResult.prNumber,
      newBlock,
      message: `Staged insertion of block ${newBlock.id} into PR #${stagedResult.prNumber}.`
    };
  }

  tree.blocks.splice(insertIndex, 0, newBlock);
  tree.version = (tree.version || 1) + 1;
  tree.updatedAt = new Date().toISOString();

  notifyBlockTreeChange(tree, {
    action: 'insert',
    blockId: newBlock.id,
    newBlock,
    index: insertIndex
  });

  return {
    success: true,
    blockId: newBlock.id,
    index: insertIndex,
    newBlock
  };
}

/**
 * Removes a specific block from the document AST.
 */
export function deleteBlock(blockTree, deletion = {}, options = {}) {
  const tree = blockTree || activeBlockTree;
  if (!tree) throw new Error('No active block tree available.');

  const { blockId, agentId = 'relay_agent' } = deletion;
  if (!blockId) throw new Error('Missing blockId to delete.');

  const targetIndex = tree.blocks.findIndex(b => b.id === blockId);
  if (targetIndex === -1) {
    throw new Error(`Target block ID '${blockId}' not found.`);
  }

  const deletedBlock = tree.blocks[targetIndex];

  // Pillar 3 Staging Sandbox Support
  if (options.stage) {
    const stagedResult = stageMutation({
      branchId: options.branchId,
      targetApp: 'compose',
      entityId: tree.documentId,
      targetTitle: `${tree.title} [Delete Block ${blockId}]`,
      toolName: 'delete_block',
      params: deletion,
      beforeText: deletedBlock.content,
      afterText: '',
      metadata: { blockId }
    });

    return {
      success: true,
      isStaged: true,
      branchId: stagedResult.branchId,
      mutationId: stagedResult.mutationId,
      prNumber: stagedResult.prNumber,
      deletedBlock,
      message: `Staged deletion of block ${blockId} into PR #${stagedResult.prNumber}.`
    };
  }

  tree.blocks.splice(targetIndex, 1);
  tree.version = (tree.version || 1) + 1;
  tree.updatedAt = new Date().toISOString();

  notifyBlockTreeChange(tree, {
    action: 'delete',
    blockId,
    deletedBlock
  });

  return {
    success: true,
    blockId,
    deletedBlock
  };
}

/**
 * Re-orders a block relative to another block.
 */
export function moveBlock(blockTree, moveParams = {}) {
  const tree = blockTree || activeBlockTree;
  if (!tree) throw new Error('No active block tree available.');

  const { blockId, targetBlockId, position = 'after' } = moveParams;
  const sourceIndex = tree.blocks.findIndex(b => b.id === blockId);
  if (sourceIndex === -1) throw new Error(`Source block ID '${blockId}' not found.`);

  const blockToMove = tree.blocks.splice(sourceIndex, 1)[0];
  const targetIndex = tree.blocks.findIndex(b => b.id === targetBlockId);

  const insertIndex = targetIndex === -1
    ? (position === 'before' ? 0 : tree.blocks.length)
    : (position === 'before' ? targetIndex : targetIndex + 1);

  tree.blocks.splice(insertIndex, 0, blockToMove);
  tree.version = (tree.version || 1) + 1;
  tree.updatedAt = new Date().toISOString();

  notifyBlockTreeChange(tree, {
    action: 'move',
    blockId,
    fromIndex: sourceIndex,
    toIndex: insertIndex
  });

  return {
    success: true,
    blockId,
    newIndex: insertIndex
  };
}

/**
 * Atomically execute multiple block patch operations in a single pass.
 */
export function batchPatchBlocks(blockTree, patches = [], agentId = 'relay_agent') {
  const tree = blockTree || activeBlockTree;
  if (!tree) throw new Error('No active block tree available.');

  const results = [];

  for (const patch of patches) {
    if (patch.op === 'patch') {
      results.push(patchBlock(tree, { ...patch, agentId }));
    } else if (patch.op === 'insert') {
      results.push(insertBlock(tree, { ...patch, agentId }));
    } else if (patch.op === 'delete') {
      results.push(deleteBlock(tree, { ...patch, agentId }));
    }
  }

  return {
    success: true,
    appliedCount: results.filter(r => r.success).length,
    results
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. REACTIVE SYNCHRONIZATION BUS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Subscribe to block tree mutations.
 */
export function subscribeToBlockTree(listener) {
  blockTreeListeners.add(listener);
  if (activeBlockTree) listener(activeBlockTree, { action: 'initial' });
  return () => blockTreeListeners.delete(listener);
}

/**
 * Notify all listeners and update context graph.
 */
function notifyBlockTreeChange(tree, changeDetails) {
  blockTreeListeners.forEach(fn => {
    try {
      fn(tree, changeDetails);
    } catch (e) {
      console.error('[BlockCanvasEngine] Listener error:', e);
    }
  });

  // Keep Universal Context Graph synchronized
  try {
    const rawText = tree.blocks.map(b => b.content).filter(Boolean).join('\n\n');
    notifyDocumentMutated({
      docId: tree.documentId,
      title: tree.title,
      text: rawText,
      characterCount: rawText.length,
      wordCount: rawText.split(/\s+/).filter(Boolean).length
    });
  } catch (err) {
    console.warn('[BlockCanvasEngine] Failed to propagate to Context Graph:', err);
  }
}

/**
 * Set active block tree (used on document switch or load).
 */
export function setActiveBlockTree(tree) {
  activeBlockTree = tree;
  notifyBlockTreeChange(tree, { action: 'set_active' });
}

/**
 * Get the currently active in-memory block tree.
 */
export function getActiveBlockTree() {
  return activeBlockTree;
}

/**
 * Reset block tree state for testing.
 */
export function resetBlockTreeForTesting() {
  activeBlockTree = null;
  blockSequenceCounter = 1;
}
