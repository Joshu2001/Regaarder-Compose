import React, { useState, useEffect, useRef } from 'react';
import {
  BrowserBackIcon,
  BrowserForwardIcon,
  BrowserReloadIcon,
  BrowserHomeIcon,
  BrowserLockIcon,
  BrowserInsecureIcon,
  BrowserExternalIcon,
  BrowserBookmarkIcon,
  BrowserCloseIcon,
  BrowserFlowIcon,
  BrowserRecordIcon
} from './RegaarderBrowserIcons';
import {
  AgentsIcon,
  MemoryIcon,
  ComposeIcon,
  SheetIcon,
  WhiteboardIcon,
  AssistIcon
} from '../RegaarderProductIcons';

/**
 * BrowserToolbar: Regaarder Research Executive Navigation Toolbar
 * Implements deterministic action architecture for every visible control:
 * - Back / Forward / Reload / Home (Direct Class A Actions)
 * - Address Bar with Intelligent Intent Routing (URL vs Research vs Search)
 * - Open Externally (Direct Class A Action)
 * - Bookmark / Save (Direct Class A Toggle with active 'outline' visual state & toast with Undo)
 * - Send to Sheets & Send to Compose (Class B Contextual Popovers)
 * - Research AI (Class B Contextual Sidebar)
 */
export const BrowserToolbar = ({
  currentUrl = '',
  isLoading = false,
  canGoBack = false,
  canGoForward = false,
  isSecure = true,
  isBookmarked = false,
  isSidePanelOpen = false,
  isFlowRecording = false,
  onNavigate,
  onGoBack,
  onGoForward,
  onReload,
  onStop,
  onHome,
  onOpenExternal,
  onToggleBookmark,
  onToggleSidePanel,
  onOpenSendToSheetsPopover,
  onOpenSendToComposePopover,
  onOpenFlowsPopover,
  onSendWhiteboardChip,
  onSaveMemoryChip,
  onSummarizeChip
}) => {
  const [inputValue, setInputValue] = useState(currentUrl);
  const [isEditing, setIsEditing] = useState(false);

  // Button anchor refs for contextual popovers
  const sheetsBtnRef = useRef(null);
  const composeBtnRef = useRef(null);
  const flowsBtnRef = useRef(null);

  useEffect(() => {
    if (!isEditing) {
      setInputValue(currentUrl === 'regaarder://research' ? '' : (currentUrl === 'regaarder://saved' ? 'regaarder://saved' : currentUrl));
    }
  }, [currentUrl, isEditing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsEditing(false);
    let target = inputValue.trim();
    if (!target) return;

    // Check intent: URL vs Natural Language Research Request vs Search Engine
    const hasProtocol = /^https?:\/\//i.test(target);
    const looksLikeDomain = /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(target);
    const isResearchPhrasing = /^(compare|research|analyze|synthesize|find competitors|financial health|vs)\b/i.test(target);

    if (hasProtocol) {
      onNavigate(target);
    } else if (looksLikeDomain) {
      onNavigate('https://' + target);
    } else if (isResearchPhrasing) {
      // Intelligent Intent Router: route natural language research phrasing into AI research
      onNavigate(`https://duckduckgo.com/?q=${encodeURIComponent(target)}`);
      onToggleSidePanel(true);
    } else {
      // Standard search query
      onNavigate(`https://duckduckgo.com/?q=${encodeURIComponent(target)}`);
    }
  };

  const isResearchHome = currentUrl === 'regaarder://research' || currentUrl === 'regaarder://saved';

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white/95 dark:bg-[#18181b]/95 border-b border-slate-200/80 dark:border-zinc-800/80 shrink-0 shadow-2xs font-sans select-none z-20">
      {/* Back / Forward / Reload / Home Controls */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            if (canGoBack) onGoBack();
          }}
          disabled={!canGoBack}
          className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
          title="Back"
        >
          <BrowserBackIcon size={16} />
        </button>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            if (canGoForward) onGoForward();
          }}
          disabled={!canGoForward}
          className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
          title="Forward"
        >
          <BrowserForwardIcon size={16} />
        </button>

        {/* Reload (spinning state on icon, zero dropdown) */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            isLoading ? onStop() : onReload();
          }}
          className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title={isLoading ? 'Stop loading' : 'Reload page'}
        >
          {isLoading ? (
            <BrowserReloadIcon size={16} className="animate-spin text-violet-500" />
          ) : (
            <BrowserReloadIcon size={16} />
          )}
        </button>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onHome();
          }}
          className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Go to Research Home"
        >
          <BrowserHomeIcon size={16} />
        </button>
      </div>

      {/* Smart Address Bar Container with Action Chips */}
      <form onSubmit={handleSubmit} className="flex-1 min-w-[240px] flex items-center">
        <div className="group flex items-center gap-2 px-3 py-1.5 w-full rounded-xl bg-slate-100/90 dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700/60 focus-within:border-violet-500/80 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all">
          {/* Security / Search Icon */}
          <div className="shrink-0 flex items-center text-slate-400 dark:text-zinc-400">
            {isResearchHome ? (
              <AgentsIcon size={14} className="text-violet-500" />
            ) : isSecure ? (
              <BrowserLockIcon size={14} className="text-emerald-600 dark:text-emerald-400" title="Secure connection (HTTPS)" />
            ) : (
              <BrowserInsecureIcon size={14} className="text-amber-500" title="Insecure connection (HTTP)" />
            )}
          </div>

          {/* URL Input */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            placeholder="Search web, ask AI, or enter URL..."
            className="w-full bg-transparent text-xs text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-hidden font-mono tracking-tight"
          />

          {/* URL Bar Knowledge Action Chips */}
          {!isResearchHome && (
            <div className="hidden md:flex items-center gap-1 shrink-0 pl-1 border-l border-slate-200 dark:border-zinc-700">
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onSummarizeChip();
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-300 transition-colors border border-violet-500/20 cursor-pointer"
                title="Summarize page with AI"
              >
                <AssistIcon size={12} className="text-violet-500" />
                <span>Summarize</span>
              </button>

              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onSaveMemoryChip();
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-300 transition-colors border border-sky-500/20 cursor-pointer"
                title="Save page into Regaarder Memory"
              >
                <MemoryIcon size={12} className="text-sky-500" />
                <span>Save to Memory</span>
              </button>

              <button
                ref={composeBtnRef}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  if (composeBtnRef.current) {
                    onOpenSendToComposePopover(composeBtnRef.current.getBoundingClientRect());
                  }
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 transition-colors border border-emerald-500/20 cursor-pointer"
                title="Send page text to Compose document"
              >
                <ComposeIcon size={12} className="text-emerald-500" />
                <span>Send to Compose</span>
              </button>
            </div>
          )}

          {/* Clear Button */}
          {inputValue && (
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setInputValue('');
              }}
              className="p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors shrink-0"
            >
              <BrowserCloseIcon size={12} />
            </button>
          )}
        </div>
      </form>

      {/* External Browser Action */}
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          onOpenExternal();
        }}
        className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors shrink-0 cursor-pointer"
        title="Open in external web browser"
      >
        <BrowserExternalIcon size={16} />
      </button>

      <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800 mx-1 shrink-0" />

      {/* Top Right Action Bar */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Regaarder Flows Control Button */}
        <button
          ref={flowsBtnRef}
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            if (flowsBtnRef.current && onOpenFlowsPopover) {
              onOpenFlowsPopover(flowsBtnRef.current.getBoundingClientRect());
            }
          }}
          className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 font-mono text-xs ${
            isFlowRecording
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 outline-rose-500/60 ring-2 ring-rose-500/30 animate-pulse'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-violet-500'
          }`}
          title={isFlowRecording ? 'Recording Flow (Click for options)' : 'Regaarder Flows (Teach Once, Reuse Forever)'}
        >
          {isFlowRecording ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400">
              <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>● ✦</span>
            </span>
          ) : (
            <BrowserFlowIcon size={16} />
          )}
        </button>

        {/* Bookmark Direct Toggle Button (Active outline state per design system rule) */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onToggleBookmark();
          }}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isBookmarked
              ? 'bg-amber-500/15 border border-amber-500/40 text-amber-500 outline-amber-500/50 ring-1 ring-amber-500/30'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-amber-500'
          }`}
          title={isBookmarked ? 'Remove from Saved Research' : 'Save to Research'}
        >
          <BrowserBookmarkIcon size={16} className={isBookmarked ? 'fill-amber-500' : ''} />
        </button>

        {/* Send to Sheets Button Trigger */}
        <button
          ref={sheetsBtnRef}
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            if (sheetsBtnRef.current) {
              onOpenSendToSheetsPopover(sheetsBtnRef.current.getBoundingClientRect());
            }
          }}
          className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-emerald-500 transition-colors cursor-pointer"
          title="Send table to Sheets"
        >
          <SheetIcon size={16} />
        </button>

        {/* Send to Whiteboard Button Trigger */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onSendWhiteboardChip();
          }}
          className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-amber-500 transition-colors cursor-pointer"
          title="Send visual clip to Whiteboard"
        >
          <WhiteboardIcon size={16} />
        </button>

        {/* AI Research Assistant Toggle Button */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onToggleSidePanel();
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
            isSidePanelOpen
              ? 'bg-violet-600 text-white border-violet-500 shadow-md ring-2 ring-violet-500/30 outline-violet-500/60'
              : 'bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 hover:bg-violet-500/20 dark:hover:bg-violet-500/30 border-violet-500/30'
          }`}
          title="Toggle Regaarder Research Assistant Side Panel"
        >
          <AgentsIcon size={15} className={isSidePanelOpen ? 'text-white' : 'text-violet-500'} />
          <span className="hidden sm:inline">Research AI</span>
        </button>
      </div>
    </div>
  );
};

export default BrowserToolbar;
