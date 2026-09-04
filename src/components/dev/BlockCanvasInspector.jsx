/**
 * BlockCanvasInspector.jsx
 * 
 * Pillar 4: The Canvas (Block-Level State IDs & Surgical Patch Inspector)
 * 
 * Provides an Apple-tier executive interface to inspect, explore, and
 * surgically mutate the active document's Abstract Syntax Tree (AST).
 * 
 * Allows human directors and engineers to verify that each document node
 * possesses a permanent unique block_id and can be patched with zero re-streaming latency.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Layers, Copy, Check, Terminal, Edit3, Plus, Trash2, ArrowUpDown, 
  Code, Quote, Table, HelpCircle, Sparkles, CheckCircle2, ChevronRight,
  Hash, RefreshCw, FileText, ArrowRight, CornerDownRight, MoveUp, MoveDown
} from 'lucide-react';
import { 
  getActiveBlockTree, 
  subscribeToBlockTree, 
  patchBlock, 
  insertBlock, 
  deleteBlock,
  blockTreeToHtml,
  blockTreeToMarkdown 
} from '../../services/blockCanvasEngine';
import * as docsCommandApi from '../../services/docsCommandApi';

const BLOCK_TYPE_CONFIG = {
  h1: { label: 'Heading 1', icon: Hash, color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50 border-violet-200 dark:border-violet-800' },
  h2: { label: 'Heading 2', icon: Hash, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800' },
  h3: { label: 'Heading 3', icon: Hash, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800' },
  paragraph: { label: 'Paragraph', icon: FileText, color: 'text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700' },
  callout: { label: 'Callout', icon: HelpCircle, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800' },
  quote: { label: 'Quote', icon: Quote, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800' },
  code: { label: 'Code Block', icon: Code, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800' },
  table: { label: 'Table', icon: Table, color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200 dark:border-cyan-800' },
  divider: { label: 'Divider', icon: ArrowUpDown, color: 'text-slate-500 dark:text-zinc-500 bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700' },
  bullet_list: { label: 'Bullet List', icon: ChevronRight, color: 'text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700' },
  numbered_list: { label: 'Numbered List', icon: ChevronRight, color: 'text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700' }
};

export default function BlockCanvasInspector({ onClose }) {
  const [treeState, setTreeState] = useState(() => {
    try {
      return docsCommandApi.getBlockTreeSnapshot();
    } catch (_e) {
      return getActiveBlockTree();
    }
  });

  const [viewMode, setViewMode] = useState('visual'); // 'visual' | 'json' | 'markdown'
  const [copiedId, setCopiedId] = useState(null);
  const [activeEditingBlockId, setActiveEditingBlockId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editType, setEditType] = useState('paragraph');
  const [stageInPr, setStageInPr] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // New Block Creation State
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [newBlockType, setNewBlockType] = useState('paragraph');
  const [newBlockContent, setNewBlockContent] = useState('');

  // Subscribe to live block tree changes
  useEffect(() => {
    const unsub = subscribeToBlockTree((newTree) => {
      if (newTree) setTreeState({ ...newTree });
    });
    return unsub;
  }, []);

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartEdit = (block) => {
    setActiveEditingBlockId(block.id);
    setEditContent(block.content || '');
    setEditType(block.type || 'paragraph');
    setStatusMessage(null);
  };

  const handleSavePatch = () => {
    if (!activeEditingBlockId) return;

    try {
      const res = docsCommandApi.patchBlockById({
        blockId: activeEditingBlockId,
        content: editContent,
        type: editType,
        agentId: 'human_director'
      });

      if (res.success) {
        setStatusMessage(`Surgically patched block [${activeEditingBlockId}] (v${res.updatedBlock?.version || 1})`);
        setActiveEditingBlockId(null);
        setTreeState(docsCommandApi.getBlockTreeSnapshot());
      } else {
        setStatusMessage(`Patch failed: ${res.error || 'Unknown error'}`);
      }
    } catch (err) {
      setStatusMessage(`Error: ${err.message}`);
    }
  };

  const handleInsertNewBlock = () => {
    if (!newBlockContent.trim()) return;

    try {
      const res = docsCommandApi.insertBlockAdjacent({
        targetBlockId: treeState?.blocks?.[treeState.blocks.length - 1]?.id,
        position: 'after',
        block: {
          type: newBlockType,
          content: newBlockContent
        },
        agentId: 'human_director'
      });

      if (res.success) {
        setStatusMessage(`Inserted new ${newBlockType} block [${res.newBlock?.id}]`);
        setIsAddingBlock(false);
        setNewBlockContent('');
        setTreeState(docsCommandApi.getBlockTreeSnapshot());
      }
    } catch (err) {
      setStatusMessage(`Error: ${err.message}`);
    }
  };

  const handleDeleteBlock = (blockId) => {
    try {
      const res = docsCommandApi.deleteBlockById({ blockId, agentId: 'human_director' });
      if (res.success) {
        setStatusMessage(`Deleted block [${blockId}] from AST`);
        setTreeState(docsCommandApi.getBlockTreeSnapshot());
      }
    } catch (err) {
      setStatusMessage(`Error: ${err.message}`);
    }
  };

  const blocks = treeState?.blocks || [];

  return (
    <div className="space-y-4">
      {/* ── Executive Header Banner ── */}
      <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Layers size={17} strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Block-Level State Canvas (AST)
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/50">
                  Pillar 4 Substrate
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Document AST with persistent node IDs for zero-latency surgical agent patches.
              </p>
            </div>
          </div>

          {/* View Mode Controls (Apple-style rounded rectangles) */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/80">
            <button
              type="button"
              onClick={() => setViewMode('visual')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
                viewMode === 'visual'
                  ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-2xs border border-black/[0.04]'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              Visual Blocks
            </button>
            <button
              type="button"
              onClick={() => setViewMode('json')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
                viewMode === 'json'
                  ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-2xs border border-black/[0.04]'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              JSON AST
            </button>
            <button
              type="button"
              onClick={() => setViewMode('markdown')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
                viewMode === 'markdown'
                  ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-2xs border border-black/[0.04]'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              Token Feed
            </button>
          </div>
        </div>

        {/* Status Metrics Strip */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
            <span className="font-semibold text-slate-900 dark:text-zinc-200">{blocks.length}</span> Blocks
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-700" />
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
            AST Version: <span className="font-mono font-semibold text-violet-600 dark:text-violet-400">v{treeState?.version || 1}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-700" />
          <div className="flex items-center gap-1 text-slate-500 dark:text-zinc-500 font-mono text-[11px]">
            Doc ID: {treeState?.documentId || 'doc_active'}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTreeState(docsCommandApi.getBlockTreeSnapshot())}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 transition-colors cursor-pointer"
            >
              <RefreshCw size={11} />
              <span>Resync AST</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAddingBlock(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-violet-600 hover:bg-violet-700 text-white transition-colors cursor-pointer shadow-2xs"
            >
              <Plus size={12} />
              <span>Insert Block</span>
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
              <span>{statusMessage}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-emerald-600 hover:text-emerald-800 text-xs cursor-pointer">✕</button>
          </div>
        )}
      </div>

      {/* ── Add Block Form ── */}
      {isAddingBlock && (
        <div className="p-4 rounded-xl bg-violet-50/60 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-violet-900 dark:text-violet-200">
              Insert New Block into Canvas AST
            </span>
            <button onClick={() => setIsAddingBlock(false)} className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer">Cancel</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 block mb-1">Block Type</label>
              <select
                value={newBlockType}
                onChange={(e) => setNewBlockType(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 outline-none"
              >
                {Object.keys(BLOCK_TYPE_CONFIG).map(typeKey => (
                  <option key={typeKey} value={typeKey}>{BLOCK_TYPE_CONFIG[typeKey].label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 block mb-1">Content</label>
            <textarea
              value={newBlockContent}
              onChange={(e) => setNewBlockContent(e.target.value)}
              placeholder="Enter block text content..."
              rows={3}
              className="w-full text-xs p-2.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 outline-none resize-none font-sans"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingBlock(false)}
              className="px-3 py-1.5 text-xs text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleInsertNewBlock}
              className="px-3 py-1.5 text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-lg cursor-pointer shadow-2xs"
            >
              Append Block
            </button>
          </div>
        </div>
      )}

      {/* ── View Mode: Visual Blocks ── */}
      {viewMode === 'visual' && (
        <div className="space-y-2.5">
          {blocks.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-500 text-xs">
              No canvas blocks found. Type in Compose Docs or click "Resync AST".
            </div>
          ) : (
            blocks.map((block, idx) => {
              const cfg = BLOCK_TYPE_CONFIG[block.type] || BLOCK_TYPE_CONFIG.paragraph;
              const TypeIcon = cfg.icon;
              const isEditing = activeEditingBlockId === block.id;

              return (
                <div 
                  key={block.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isEditing 
                      ? 'bg-violet-50/70 dark:bg-violet-950/40 border-violet-400 dark:border-violet-600 shadow-sm'
                      : 'bg-white dark:bg-zinc-900 border-slate-200/90 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 shadow-2xs'
                  }`}
                >
                  {/* Block Header Metadata */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 shrink-0">
                        #{idx + 1}
                      </span>

                      {/* Type Badge */}
                      <span className={`inline-flex items-center gap-1 text-[10.5px] font-semibold px-2 py-0.5 rounded border shrink-0 ${cfg.color}`}>
                        <TypeIcon size={11} strokeWidth={2.2} />
                        <span>{cfg.label}</span>
                      </span>

                      {/* Unique Block ID Pill */}
                      <div className="flex items-center gap-1 group/id">
                        <span className="text-[10.5px] font-mono font-bold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-200/80 dark:border-zinc-700">
                          {block.id}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyId(block.id)}
                          title="Copy Block ID"
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                        >
                          {copiedId === block.id ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
                      <span className="font-mono text-[10px] text-slate-400">v{block.version || 1}</span>
                      <span className="mx-1">•</span>
                      <span>{block.content ? `${block.content.length} chars` : 'empty'}</span>
                      <span className="mx-1">•</span>
                      <button
                        type="button"
                        onClick={() => isEditing ? setActiveEditingBlockId(null) : handleStartEdit(block)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded text-slate-500 hover:text-violet-600 transition-colors cursor-pointer"
                        title="Surgically Patch Block"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBlock(block.id)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Delete Block"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Block Content Display or Inline Editor */}
                  {isEditing ? (
                    <div className="mt-2 space-y-2 pt-2 border-t border-violet-200/60 dark:border-violet-900/60">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-violet-700 dark:text-violet-300">
                          Surgical Patch Editor
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Only this block will be mutated in the DOM and AST.
                        </span>
                      </div>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                        className="w-full text-xs p-2.5 rounded-lg bg-white dark:bg-zinc-800 border border-violet-300 dark:border-violet-700 outline-none resize-none font-sans shadow-2xs"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <select
                            value={editType}
                            onChange={(e) => setEditType(e.target.value)}
                            className="text-[11px] px-2 py-1 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700"
                          >
                            {Object.keys(BLOCK_TYPE_CONFIG).map(typeKey => (
                              <option key={typeKey} value={typeKey}>{BLOCK_TYPE_CONFIG[typeKey].label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveEditingBlockId(null)}
                            className="px-2.5 py-1 text-xs text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSavePatch}
                            className="px-3 py-1 text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded cursor-pointer shadow-2xs"
                          >
                            Apply Surgical Patch
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-700 dark:text-zinc-200 leading-relaxed font-sans pl-1">
                      {block.content ? (
                        block.type === 'code' ? (
                          <pre className="p-2 rounded bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto">
                            <code>{block.content}</code>
                          </pre>
                        ) : block.type === 'quote' ? (
                          <blockquote className="border-l-2 border-violet-500 pl-2 italic text-slate-600 dark:text-zinc-400">
                            {block.content}
                          </blockquote>
                        ) : (
                          <span>{block.content}</span>
                        )
                      ) : (
                        <span className="text-slate-400 italic">(Empty block)</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── View Mode: JSON AST ── */}
      {viewMode === 'json' && (
        <div className="p-4 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 font-mono text-xs overflow-x-auto max-h-[500px] shadow-2xs">
          <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
            <span>Canonical BlockTree AST JSON</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(treeState, null, 2));
                setStatusMessage('Copied JSON AST to clipboard');
              }}
              className="hover:text-white cursor-pointer"
            >
              Copy JSON
            </button>
          </div>
          <pre>
            <code>{JSON.stringify(treeState, null, 2)}</code>
          </pre>
        </div>
      )}

      {/* ── View Mode: Markdown Token Feed ── */}
      {viewMode === 'markdown' && (
        <div className="p-4 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 font-mono text-xs overflow-x-auto max-h-[500px] shadow-2xs">
          <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
            <span>Token-Dense Markdown AST Feed with Embedded Block IDs</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(blockTreeToMarkdown(treeState));
                setStatusMessage('Copied Markdown feed to clipboard');
              }}
              className="hover:text-white cursor-pointer"
            >
              Copy Markdown
            </button>
          </div>
          <pre>
            <code>{blockTreeToMarkdown(treeState)}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
