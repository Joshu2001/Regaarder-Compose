import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ComposeIcon } from '../RegaarderProductIcons';
import { BrowserCloseIcon, BrowserCheckIcon } from './RegaarderBrowserIcons';

/**
 * SendToComposePopover: Contextual Action popover for document capture & clipping into Regaarder Compose.
 * Follows Design Directive: ONE OBVIOUS ACTION → INTELLIGENT CONTEXT DETECTION → MINIMAL NECESSARY CHOICE → IMMEDIATE VISIBLE RESULT
 */
export const SendToComposePopover = ({
  anchorRect,
  activeTab,
  activeDocTitle = 'Untitled Document',
  initialContent = '',
  isStandalone = false,
  onClose,
  onExecuteExport,
  showToast
}) => {
  const [hasSelection, setHasSelection] = useState(false);
  const [selectionWordCount, setSelectionWordCount] = useState(0);
  const [selectedSnippet, setSelectedSnippet] = useState(initialContent || '');

  // Mode & Capture options
  const [textFormatMode, setTextFormatMode] = useState('text'); // 'text', 'quote', 'summarize'
  const [noSelectionMode, setNoSelectionMode] = useState('main'); // 'main', 'article', 'table', 'page'
  const [destinationDoc, setDestinationDoc] = useState(
    activeDocTitle || `Research Notes — ${activeTab?.title || 'Webpage'}`
  );

  useEffect(() => {
    const sel = window.getSelection()?.toString().trim();
    if (sel && sel.length > 0) {
      setHasSelection(true);
      setSelectionWordCount(sel.split(/\s+/).length);
      setSelectedSnippet(sel.slice(0, 500));
    } else if (initialContent) {
      setHasSelection(true);
      setSelectionWordCount(initialContent.split(/\s+/).length);
      setSelectedSnippet(initialContent.slice(0, 500));
    }
  }, [initialContent]);

  const handleExecute = () => {
    let fullText = selectedSnippet || initialContent;
    if (!fullText) {
      if (activeTab?.summary) {
        fullText = activeTab.summary;
      } else if (activeTab?.extractedText) {
        fullText = activeTab.extractedText;
      } else {
        fullText = `Summary and insights captured from ${activeTab?.title || 'Web Research'}.\n\nSource URL: ${activeTab?.url || ''}`;
      }
    }
    const capturedPayload = {
      hasSelection,
      snippet: fullText,
      content: fullText,
      formatMode: hasSelection ? textFormatMode : noSelectionMode,
      destinationDoc,
      sourceUrl: activeTab?.url,
      sourceTitle: activeTab?.title
    };

    if (onExecuteExport) {
      onExecuteExport(capturedPayload);
    }
    onClose();
  };

  const topPos = anchorRect
    ? (anchorRect.top !== undefined && anchorRect.bottom !== undefined && anchorRect.bottom < 200
        ? Math.max(86, anchorRect.bottom + 6)
        : anchorRect.top !== undefined
          ? Math.max(86, anchorRect.top)
          : Math.max(86, (anchorRect.bottom || 80) + 6))
    : 86;
  const rightPos = anchorRect
    ? (anchorRect.right !== undefined && anchorRect.right < 500
        ? anchorRect.right
        : Math.max(16, window.innerWidth - (anchorRect.right || 380)))
    : 24;

  const content = (
    <div
      data-popover
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={isStandalone ? {} : { top: `${topPos}px`, right: `${rightPos}px` }}
      className={`${
        isStandalone
          ? 'relative z-[100000] w-full max-w-md border border-white/10 shadow-2xl'
          : 'fixed z-[100000] w-[380px] border border-white/10 shadow-2xl animate-in fade-in zoom-in-[0.98] duration-100 ease-out'
      } bg-[#161822]/95 backdrop-blur-2xl rounded-2xl overflow-hidden font-sans text-slate-100 select-none`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-white/[0.03] border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <ComposeIcon size={16} />
          </div>
          <div>
            <h3 className="text-xs font-medium tracking-tight text-slate-100">Send to Compose</h3>
            <p className="text-[10px] text-slate-400">Context-aware document clipping</p>
          </div>
        </div>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onClose();
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-colors cursor-pointer"
        >
          <BrowserCloseIcon size={14} />
        </button>
      </div>

      {/* Body Content */}
      <div className="p-4 space-y-4 text-xs font-sans">
        {/* Selection / Context Summary Chip */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
          <span className="p-1 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 shrink-0 mt-0.5">
            <BrowserCheckIcon size={14} />
          </span>
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-slate-200 block mb-0.5">
              {hasSelection ? `${selectionWordCount} words selected` : 'Full Article Detected'}
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed truncate">
              {hasSelection ? `"${selectedSnippet}"` : (activeTab?.title || activeTab?.url || 'Current page view')}
            </p>
          </div>
        </div>

        {/* Capture Mode Toggle */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Format Mode
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
            {hasSelection ? (
              <>
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setTextFormatMode('text');
                  }}
                  className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center cursor-pointer ${
                    textFormatMode === 'text' ? 'bg-violet-600 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Raw Text
                </button>
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setTextFormatMode('quote');
                  }}
                  className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center cursor-pointer ${
                    textFormatMode === 'quote' ? 'bg-violet-600 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Blockquote
                </button>
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setTextFormatMode('summarize');
                  }}
                  className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center cursor-pointer ${
                    textFormatMode === 'summarize' ? 'bg-violet-600 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  AI Summary
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setNoSelectionMode('main');
                  }}
                  className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center cursor-pointer ${
                    noSelectionMode === 'main' ? 'bg-violet-600 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Main Article
                </button>
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setNoSelectionMode('table');
                  }}
                  className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center cursor-pointer ${
                    noSelectionMode === 'table' ? 'bg-violet-600 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All Tables
                </button>
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setNoSelectionMode('page');
                  }}
                  className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center cursor-pointer ${
                    noSelectionMode === 'page' ? 'bg-violet-600 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Full Page
                </button>
              </>
            )}
          </div>
        </div>

        {/* Destination Document */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Target Document
            </label>
            <div className="flex items-center gap-1 text-[10px]">
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  setDestinationDoc(`New Doc — ${activeTab?.title || 'Web Clipping'}`);
                }}
                className="text-violet-400 hover:underline cursor-pointer"
              >
                + New Document
              </button>
            </div>
          </div>
          <input
            type="text"
            value={destinationDoc}
            onChange={(e) => setDestinationDoc(e.target.value)}
            className="w-full h-8 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-violet-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Footer Controls */}
      <div className="px-4 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onClose();
          }}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            handleExecute();
          }}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
        >
          <ComposeIcon size={14} />
          <span>Send to Compose</span>
        </button>
      </div>
    </div>
  );

  if (isStandalone) return content;

  const targetNode = document.fullscreenElement ?? document.body;
  return createPortal(content, targetNode);
};

export default SendToComposePopover;
