import React, { useState, useEffect } from 'react';
import {
  BrowserBackIcon,
  BrowserForwardIcon,
  BrowserReloadIcon,
  BrowserHomeIcon,
  BrowserLockIcon,
  BrowserInsecureIcon,
  BrowserExternalIcon,
  BrowserBookmarkIcon,
  BrowserCloseIcon
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
 * Incorporates URL bar action chips, non-red loading controls, knowledge ingestion triggers, and AI side panel toggle.
 * Uses the proprietary Regaarder Browser Icon System (1.6px optical stroke weight).
 */
export const BrowserToolbar = ({
  currentUrl = '',
  isLoading = false,
  canGoBack = false,
  canGoForward = false,
  isSecure = true,
  isSidePanelOpen = false,
  onNavigate,
  onGoBack,
  onGoForward,
  onReload,
  onStop,
  onHome,
  onOpenExternal,
  onToggleSidePanel,
  onSummarizeChip,
  onSaveMemoryChip,
  onSendComposeChip,
  onSendSheetsChip,
  onSendWhiteboardChip,
  onBookmarkPage
}) => {
  const [inputValue, setInputValue] = useState(currentUrl);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setInputValue(currentUrl === 'regaarder://research' ? '' : currentUrl);
    }
  }, [currentUrl, isEditing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsEditing(false);
    let target = inputValue.trim();
    if (!target) return;

    // Check if valid URL or search term
    const hasProtocol = /^https?:\/\//i.test(target);
    const looksLikeDomain = /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(target);

    if (hasProtocol) {
      onNavigate(target);
    } else if (looksLikeDomain) {
      onNavigate('https://' + target);
    } else {
      // Treat as search query
      onNavigate(`https://duckduckgo.com/?q=${encodeURIComponent(target)}`);
    }
  };

  const isResearchHome = currentUrl === 'regaarder://research';

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white/95 dark:bg-[#18181b]/95 border-b border-slate-200/80 dark:border-zinc-800/80 shrink-0 shadow-2xs font-sans select-none">
      {/* Back / Forward / Reload / Home Controls */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onGoBack}
          disabled={!canGoBack}
          className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
          title="Back"
        >
          <BrowserBackIcon size={16} />
        </button>

        <button
          type="button"
          onClick={onGoForward}
          disabled={!canGoForward}
          className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
          title="Forward"
        >
          <BrowserForwardIcon size={16} />
        </button>

        {/* Reload / Stop Loading (NEVER RED per UX directive) */}
        <button
          type="button"
          onClick={isLoading ? onStop : onReload}
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
          onClick={onHome}
          className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Go to Research Home"
        >
          <BrowserHomeIcon size={16} />
        </button>
      </div>

      {/* Smart URL / Search Bar Container with Action Chips */}
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

          {/* URL Bar Knowledge Action Chips (Summarize, Save, Compose) */}
          {!isResearchHome && (
            <div className="hidden md:flex items-center gap-1 shrink-0 pl-1 border-l border-slate-200 dark:border-zinc-700">
              <button
                type="button"
                onClick={onSummarizeChip}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-300 transition-colors border border-violet-500/20 cursor-pointer"
                title="Summarize page with AI"
              >
                <AssistIcon size={12} className="text-violet-500" />
                <span>Summarize</span>
              </button>

              <button
                type="button"
                onClick={onSaveMemoryChip}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-300 transition-colors border border-sky-500/20 cursor-pointer"
                title="Save page into Regaarder Memory"
              >
                <MemoryIcon size={12} className="text-sky-500" />
                <span>Save to Memory</span>
              </button>

              <button
                type="button"
                onClick={onSendComposeChip}
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
              onClick={() => setInputValue('')}
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
        onClick={onOpenExternal}
        className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors shrink-0 cursor-pointer"
        title="Open in external web browser"
      >
        <BrowserExternalIcon size={16} />
      </button>

      <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800 mx-1 shrink-0" />

      {/* Top Right Knowledge Ingestion Action Bar */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onBookmarkPage}
          className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-amber-500 transition-colors cursor-pointer"
          title="Save Page Bookmark"
        >
          <BrowserBookmarkIcon size={16} />
        </button>

        <button
          type="button"
          onClick={onSendSheetsChip}
          className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-emerald-500 transition-colors cursor-pointer"
          title="Send table to Sheets"
        >
          <SheetIcon size={16} />
        </button>

        <button
          type="button"
          onClick={onSendWhiteboardChip}
          className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-amber-500 transition-colors cursor-pointer"
          title="Send visual clip to Whiteboard"
        >
          <WhiteboardIcon size={16} />
        </button>

        {/* AI Research Assistant Toggle Button (Official Regaarder Agent Symbol) */}
        <button
          type="button"
          onClick={onToggleSidePanel}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
            isSidePanelOpen
              ? 'bg-violet-600 text-white border-violet-500 shadow-md ring-2 ring-violet-500/30'
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
