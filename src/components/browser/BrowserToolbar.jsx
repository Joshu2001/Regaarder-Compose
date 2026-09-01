import React, { useState, useEffect, useRef } from 'react';
import { SlidersHorizontal, LayoutGrid } from 'lucide-react';
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
  BrowserEllipsisIcon,
  BrowserUtilitiesIcon
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
 * Visible Hierarchy: Back, Forward, Reload, Home, URL/Search, Bookmark, Flow, Regaarder AI, Utilities, Overflow
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
  isFlowsPopoverOpen = false,
  isFontPopoverOpen = false,
  isUtilitiesPopoverOpen = false,
  isOverflowMenuOpen = false,
  isWorkspaceSwitcherOpen = false,
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
  onOpenFontPopover,
  onOpenFlowsPopover,
  onOpenUtilitiesPopover,
  onOpenOverflowMenu,
  onOpenWorkspaceSwitcher,
  onSummarizeChip,
  onSaveMemoryChip
}) => {
  const [inputValue, setInputValue] = useState(currentUrl);
  const [isEditing, setIsEditing] = useState(false);

  // Button anchor refs for popovers
  const fontBtnRef = useRef(null);
  const flowsBtnRef = useRef(null);
  const utilitiesBtnRef = useRef(null);
  const overflowBtnRef = useRef(null);
  const workspaceSwitcherBtnRef = useRef(null);

  useEffect(() => {
    if (!isEditing) {
      setInputValue(currentUrl === 'regaarder://research' ? '' : (currentUrl === 'regaarder://saved' ? 'regaarder://saved' : currentUrl));
    }
  }, [currentUrl, isEditing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsEditing(false);
    const target = inputValue.trim();
    if (!target) return;

    // Detect research-intent phrasing to automatically open the AI side panel.
    // All URL normalization (protocol prefixing, search routing) is the sole
    // responsibility of BrowserWorkspace.handleNavigate — single source of truth.
    const isResearchPhrasing = /^(compare|research|analyze|synthesize|find competitors|financial health|vs)\b/i.test(target);
    if (isResearchPhrasing) {
      onToggleSidePanel(true);
    }

    onNavigate(target);
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
    <div className="flex items-center gap-3 px-4 py-2 bg-slate-100/90 dark:bg-[#16171B] border-b border-slate-200/80 dark:border-white/[0.06] shrink-0 shadow-2xs font-sans select-none z-20 backdrop-blur-md">
      {/* 1. NAVIGATION CONTROLS (← → ↻ ⌂) */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            if (canGoBack) onGoBack();
          }}
          disabled={!canGoBack}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-200/80 dark:hover:bg-white/[0.08] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
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
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-200/80 dark:hover:bg-white/[0.08] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
          title="Forward"
        >
          <BrowserForwardIcon size={16} />
        </button>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            isLoading ? onStop() : onReload();
          }}
          disabled={isResearchHome}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-200/80 dark:hover:bg-white/[0.08] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer"
          title={isLoading ? 'Stop loading' : 'Reload page'}
        >
          {isLoading ? (
            <BrowserCloseIcon size={14} className="text-rose-500" />
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
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-200/80 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
          title="Go to Research Home"
        >
          <BrowserHomeIcon size={16} />
        </button>
      </div>

      {/* 2. REFINED OMNIBOX (36px Height, 10px Radius) */}
      <form onSubmit={handleSubmit} className="flex-1 min-w-[220px] max-w-2xl flex items-center">
        <div className="group flex items-center gap-2 px-3.5 py-1 h-9 w-full rounded-lg bg-white/90 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 focus-within:bg-white dark:focus-within:bg-white/[0.08] focus-within:border-violet-500/60 focus-within:ring-1 focus-within:ring-violet-500/30 shadow-2xs transition-all duration-150">
          {/* Security / Search Icon */}
          <div className="shrink-0 flex items-center text-slate-400 dark:text-zinc-400">
            {isResearchHome ? (
              <AgentsIcon size={15} className="text-violet-500" />
            ) : isSecure ? (
              <BrowserLockIcon size={15} className="text-emerald-600 dark:text-emerald-400" title="Secure connection (HTTPS)" />
            ) : (
              <BrowserInsecureIcon size={15} className="text-amber-500" title="Insecure connection (HTTP)" />
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
            className="w-full bg-transparent text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 border-none outline-none focus:outline-none focus:ring-0 focus:border-transparent focus-visible:outline-none focus-visible:ring-0 select-text tracking-tight font-medium"
          />

          {/* Contextual Knowledge Action Chips */}
          {!isResearchHome && (
            <div className="hidden lg:flex items-center gap-1 shrink-0 pl-1.5 border-l border-slate-200 dark:border-zinc-700">
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onSummarizeChip?.();
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-300 transition-colors border border-violet-500/20 cursor-pointer"
                title="Summarize page with AI"
              >
                <AssistIcon size={12} className="text-violet-500" />
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
                <MemoryIcon size={12} className="text-sky-500" />
                <span>Save</span>
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
              className="p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors shrink-0 cursor-pointer"
            >
              <BrowserCloseIcon size={13} />
            </button>
          )}
        </div>
      </form>

      {/* 3. DECLUTTERED APPLE PRIMARY CONTROLS (3 ESSENTIAL ITEMS: Bookmark, Regaarder AI, Overflow) */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Bookmark */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleBookmark();
          }}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
            isBookmarked
              ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-500/30 ring-1 ring-violet-500/20'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/80 dark:hover:bg-white/[0.08] hover:text-violet-600 dark:hover:text-violet-400 border border-transparent'
          }`}
          title={isBookmarked ? 'Remove from Saved Research' : 'Save to Research'}
        >
          <BrowserBookmarkIcon size={16} filled={isBookmarked} />
        </button>

        {/* Regaarder AI & Commands Button (Outline active state, decoupled from side panel) */}
        <button
          ref={utilitiesBtnRef}
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (utilitiesBtnRef.current && onOpenUtilitiesPopover) {
              onOpenUtilitiesPopover(utilitiesBtnRef.current.getBoundingClientRect());
            } else {
              onToggleSidePanel?.();
            }
          }}
          className={`flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
            isUtilitiesPopoverOpen
              ? 'bg-violet-600/15 text-violet-700 dark:text-violet-300 border-violet-500/50 shadow-xs ring-1 ring-violet-500/30'
              : isLoading
              ? 'animate-pulse bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30'
              : 'bg-white/60 dark:bg-white/[0.05] text-slate-700 dark:text-zinc-300 hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-300 border-slate-200 dark:border-white/10 hover:border-violet-500/30'
          }`}
          title="Regaarder Commands & Intelligence"
        >
          <AgentsIcon size={15} className={isUtilitiesPopoverOpen ? 'text-violet-600 dark:text-violet-400' : 'text-slate-500 dark:text-zinc-400'} />
          <span className="hidden sm:inline font-semibold">Commands</span>
        </button>

        {/* Overflow Menu (··· Primary Browser & System Options) */}
        <button
          ref={overflowBtnRef}
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (overflowBtnRef.current && onOpenOverflowMenu) {
              onOpenOverflowMenu(overflowBtnRef.current.getBoundingClientRect());
            }
          }}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
            isOverflowMenuOpen
              ? 'bg-slate-200/90 dark:bg-white/15 text-slate-900 dark:text-zinc-100 border border-slate-300/60 dark:border-white/20'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/80 dark:hover:bg-white/[0.08] hover:text-slate-900 dark:hover:text-zinc-100 border border-transparent'
          }`}
          title="More options (Browser & System Settings)"
        >
          <BrowserEllipsisIcon size={16} />
        </button>

        {/* Switch Workspace App */}
        <button
          ref={workspaceSwitcherBtnRef}
          type="button"
          data-workspace-switcher="true"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const rect = workspaceSwitcherBtnRef.current?.getBoundingClientRect();
            onOpenWorkspaceSwitcher?.(rect);
          }}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
            isWorkspaceSwitcherOpen
              ? 'bg-slate-200/90 dark:bg-white/15 text-slate-900 dark:text-zinc-100 border border-slate-300/60 dark:border-white/20'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/80 dark:hover:bg-white/[0.08] hover:text-slate-900 dark:hover:text-zinc-100 border border-transparent'
          }`}
          title="Switch Workspace App"
        >
          <LayoutGrid size={16} />
        </button>

        {/* Apple-Tier Regaarder AI Assistant Button (Top-Right Nav) */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleSidePanel?.();
          }}
          className={`flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
            isSidePanelOpen
              ? 'bg-violet-600/15 text-violet-700 dark:text-violet-300 border-violet-500/50 shadow-xs ring-1 ring-violet-500/30'
              : 'bg-white/60 dark:bg-white/[0.05] text-slate-700 dark:text-zinc-200 hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-300 border-slate-200 dark:border-white/10 hover:border-violet-500/40'
          }`}
          title={isSidePanelOpen ? "Close AI Assistant" : "Open AI Assistant (Automate web tasks & scan history)"}
        >
          <AssistIcon size={14} className="text-violet-600 dark:text-violet-400" />
          <span className="tracking-tight font-semibold">Assistant</span>
        </button>
      </div>
    </div>
  );
};

export default BrowserToolbar;
