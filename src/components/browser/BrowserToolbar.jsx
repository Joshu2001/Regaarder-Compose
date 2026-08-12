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
  BrowserRecordIcon,
  BrowserEllipsisIcon
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
 * - Ellipsis Menu (...) for Isolated Browser Font & Size Customization
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
  isFontPopoverOpen = false,
  isOverflowMenuOpen = false,
  browserFont = 'System Default',
  browserFontSize = 100,
  onNavigate,
  onGoBack,
  onGoForward,
  onReload,
  onStop,
  onHome,
  onToggleBookmark,
  onToggleSidePanel,
  onOpenFlowsPopover,
  onOpenOverflowMenu,
  onSummarizeChip,
  onSaveMemoryChip,
  onOpenSendToComposePopover
}) => {
  const [inputValue, setInputValue] = useState(currentUrl);
  const [isEditing, setIsEditing] = useState(false);

  // Button anchor refs for popovers
  const flowsBtnRef = useRef(null);
  const overflowBtnRef = useRef(null);
  const composeBtnRef = useRef(null);

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
      onNavigate(`https://duckduckgo.com/?q=${encodeURIComponent(target)}`);
      onToggleSidePanel(true);
    } else {
      onNavigate(`https://duckduckgo.com/?q=${encodeURIComponent(target)}`);
    }
  };

  const isResearchHome = currentUrl === 'regaarder://research' || currentUrl === 'regaarder://saved';

  const getFontFamilyStack = (fontName) => {
    const map = {
      'System Default': '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
      'Inter': 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      'SF Pro Display': '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      'JetBrains Mono': '"JetBrains Mono", "IBM Plex Mono", "Fira Code", monospace',
      'IBM Plex Mono': '"IBM Plex Mono", "JetBrains Mono", "Fira Code", monospace',
      'Fira Code': '"Fira Code", "JetBrains Mono", monospace',
      'Manrope': 'Manrope, sans-serif',
      'DM Sans': '"DM Sans", sans-serif',
      'Plus Jakarta Sans': '"Plus Jakarta Sans", sans-serif',
      'Public Sans': '"Public Sans", sans-serif',
      'Satoshi': 'Satoshi, sans-serif',
      'General Sans': '"General Sans", sans-serif',
      'Outfit': 'Outfit, sans-serif',
      'Space Grotesk': '"Space Grotesk", sans-serif'
    };
    return map[fontName] || fontName || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  };

  const currentInputFontSize = Math.max(11, Math.round(13 * ((browserFontSize || 100) / 100)));

  return (
    <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white/95 dark:bg-[#18181b]/95 border-b border-slate-200/80 dark:border-zinc-800/80 shrink-0 shadow-2xs font-sans select-none z-20">
      {/* Visually Grouped Left Navigation Controls (6-10px gap, 32px hit areas, ~17px optical icons) */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            if (canGoBack) onGoBack();
          }}
          disabled={!canGoBack}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
          title="Back"
        >
          <BrowserBackIcon size={17} />
        </button>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            if (canGoForward) onGoForward();
          }}
          disabled={!canGoForward}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
          title="Forward"
        >
          <BrowserForwardIcon size={17} />
        </button>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            isLoading ? onStop() : onReload();
          }}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title={isLoading ? 'Stop loading' : 'Reload page'}
        >
          {isLoading ? (
            <BrowserReloadIcon size={17} className="animate-spin text-violet-500" />
          ) : (
            <BrowserReloadIcon size={17} />
          )}
        </button>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onHome();
          }}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Go to Research Home"
        >
          <BrowserHomeIcon size={17} />
        </button>
      </div>

      {/* Dominant Smart URL / Search Omnibox */}
      <form onSubmit={handleSubmit} className="flex-1 min-w-[240px] max-w-3xl flex items-center">
        <div className="group flex items-center gap-2 px-3.5 py-1.5 w-full rounded-xl bg-slate-100/90 dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700/60 focus-within:border-violet-500/80 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all">
          {/* Security / Search Icon */}
          <div className="shrink-0 flex items-center text-slate-400 dark:text-zinc-400">
            {isResearchHome ? (
              <AgentsIcon size={16} className="text-violet-500" />
            ) : isSecure ? (
              <BrowserLockIcon size={16} className="text-emerald-600 dark:text-emerald-400" title="Secure connection (HTTPS)" />
            ) : (
              <BrowserInsecureIcon size={16} className="text-amber-500" title="Insecure connection (HTTP)" />
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
            style={{
              fontFamily: getFontFamilyStack(browserFont),
              fontSize: `${currentInputFontSize}px`
            }}
            className="w-full bg-transparent text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 border-none outline-none focus:outline-none focus:ring-0 focus:border-transparent focus-visible:outline-none focus-visible:ring-0 select-text tracking-tight"
          />

          {/* Contextual Knowledge Action Chips */}
          {!isResearchHome && (
            <div className="hidden lg:flex items-center gap-1.5 shrink-0 pl-1.5 border-l border-slate-200 dark:border-zinc-700">
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onSummarizeChip?.();
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-300 transition-colors border border-violet-500/20 cursor-pointer"
                title="Summarize page with AI"
              >
                <AssistIcon size={13} className="text-violet-500" />
                <span>Summarize</span>
              </button>

              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onSaveMemoryChip?.();
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-300 transition-colors border border-sky-500/20 cursor-pointer"
                title="Save page into Regaarder Memory"
              >
                <MemoryIcon size={13} className="text-sky-500" />
                <span>Save Memory</span>
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
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors shrink-0 cursor-pointer"
            >
              <BrowserCloseIcon size={14} />
            </button>
          )}
        </div>
      </form>

      {/* Right-Side Primary Hierarchy: Bookmark -> Flow -> Regaarder AI -> Overflow */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* 1. BOOKMARK: Standard icon, neutral styling normally, Regaarder purple when active */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onToggleBookmark();
          }}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
            isBookmarked
              ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-500/30 ring-1 ring-violet-500/20'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-violet-600 dark:hover:text-violet-400 border border-transparent'
          }`}
          title={isBookmarked ? 'Remove from Saved Research' : 'Save to Research'}
        >
          <BrowserBookmarkIcon size={17} className={isBookmarked ? 'fill-violet-600 dark:fill-violet-400' : ''} />
        </button>

        {/* Subtle Divider */}
        <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800 mx-0.5 shrink-0" />

        {/* 2. FLOW: Custom Regaarder glyph (connected nodes + directional path) */}
        <button
          ref={flowsBtnRef}
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            if (flowsBtnRef.current && onOpenFlowsPopover) {
              onOpenFlowsPopover(flowsBtnRef.current.getBoundingClientRect());
            }
          }}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
            isFlowRecording
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 ring-2 ring-rose-500/30 animate-pulse'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-violet-600 dark:hover:text-violet-400 border border-transparent'
          }`}
          title={isFlowRecording ? 'Recording Flow (Click for options)' : 'Regaarder Flows (Action → Action → Replayable Workflow)'}
        >
          <BrowserFlowIcon size={17} mode={isFlowRecording ? 'recording' : 'idle'} />
        </button>

        {/* 3. REGAARDER AI: Core capability with slightly higher visual prominence */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onToggleSidePanel();
          }}
          className={`flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
            isSidePanelOpen
              ? 'bg-violet-600 text-white border-violet-500 shadow-md ring-2 ring-violet-500/30'
              : 'bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 hover:bg-violet-500/20 border-violet-500/30'
          }`}
          title="Toggle Regaarder Research AI Assistant"
        >
          <AgentsIcon size={16} className={isSidePanelOpen ? 'text-white' : 'text-violet-500'} />
          <span className="hidden sm:inline">Research AI</span>
        </button>

        {/* Subtle Divider */}
        <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800 mx-0.5 shrink-0" />

        {/* 4. OVERFLOW MENU (⋯): Single entry for Display & Appearance, Export, & Page Tools */}
        <button
          ref={overflowBtnRef}
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            if (overflowBtnRef.current && onOpenOverflowMenu) {
              onOpenOverflowMenu(overflowBtnRef.current.getBoundingClientRect());
            }
          }}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
            isOverflowMenuOpen || isFontPopoverOpen
              ? 'bg-violet-500/20 text-violet-600 dark:text-violet-300 border border-violet-500/40'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100 border border-transparent'
          }`}
          title="More options & Display & Appearance"
        >
          <BrowserEllipsisIcon size={17} />
        </button>
      </div>
    </div>
  );
};

export default BrowserToolbar;

