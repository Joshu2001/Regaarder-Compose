import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  X,
  Home,
  Lock,
  ShieldAlert,
  Search,
  ExternalLink,
  Sparkles,
  FileText,
  Table,
  Bookmark
} from 'lucide-react';

/**
 * BrowserToolbar: Regaarder Executive Navigation Toolbar
 * Contains back, forward, reload, URL/Search field, security badge, and AI integration capability triggers.
 */
export const BrowserToolbar = ({
  currentUrl = '',
  isLoading = false,
  canGoBack = false,
  canGoForward = false,
  isSecure = true,
  onNavigate,
  onGoBack,
  onGoForward,
  onReload,
  onStop,
  onHome,
  onOpenExternal,
  onExtractAIContent
}) => {
  const [inputValue, setInputValue] = useState(currentUrl);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setInputValue(currentUrl);
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

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white/90 dark:bg-[#18181b]/90 border-b border-slate-200/80 dark:border-zinc-800/80 shrink-0 shadow-2xs font-sans">
      {/* Back / Forward / Reload Controls */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onGoBack}
          disabled={!canGoBack}
          className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
          title="Back"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onGoForward}
          disabled={!canGoForward}
          className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
          title="Forward"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={isLoading ? onStop : onReload}
          className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title={isLoading ? 'Stop loading' : 'Reload page'}
        >
          {isLoading ? (
            <X className="w-4 h-4 text-rose-500" />
          ) : (
            <RotateCw className="w-4 h-4" />
          )}
        </button>

        <button
          type="button"
          onClick={onHome}
          className="p-1.5 rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Go to Home"
        >
          <Home className="w-4 h-4" />
        </button>
      </div>

      {/* Smart URL / Search Bar Container */}
      <form onSubmit={handleSubmit} className="flex-1 min-w-[200px] flex items-center">
        <div className="group flex items-center gap-2 px-3 py-1.5 w-full rounded-xl bg-slate-100/90 dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700/60 focus-within:border-violet-500/80 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all">
          {/* Security / Search Icon */}
          <div className="shrink-0 flex items-center text-slate-400 dark:text-zinc-400">
            {isSecure ? (
              <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" title="Secure connection (HTTPS)" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" title="Insecure connection (HTTP)" />
            )}
          </div>

          {/* URL Input */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            placeholder="Search web or enter URL (https://...)"
            className="w-full bg-transparent text-xs text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-hidden font-mono tracking-tight"
          />

          {/* Clear / Search Action */}
          {inputValue && (
            <button
              type="button"
              onClick={() => setInputValue('')}
              className="p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </form>

      {/* Open External Action */}
      <button
        type="button"
        onClick={onOpenExternal}
        className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors shrink-0 cursor-pointer"
        title="Open in external web browser"
      >
        <ExternalLink className="w-4 h-4" />
      </button>

      {/* Reserved Future Regaarder AI Capability Actions */}
      <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800 mx-1 shrink-0" />

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => onExtractAIContent && onExtractAIContent('summarize')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 hover:bg-violet-500/20 dark:hover:bg-violet-500/30 transition-all border border-violet-500/20 cursor-pointer"
          title="Extract & summarize page content with Regaarder AI"
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
          <span className="hidden sm:inline">AI Summarize</span>
        </button>
      </div>
    </div>
  );
};

export default BrowserToolbar;
