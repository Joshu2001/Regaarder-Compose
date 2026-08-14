import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  RotateCcw,
  Settings,
  HelpCircle,
  Keyboard,
  Info,
  Layers,
  SlidersHorizontal,
  Search,
  X
} from 'lucide-react';

/**
 * BrowserOverflowMenu: Browser & System Options Popover (More Menu)
 * Triggered via the `⋯` control in the toolbar.
 * Houses general browser-level system settings, workspace management, preferences, and documentation.
 * Strictly separates browser/system controls from Regaarder intelligence actions.
 */
export const BrowserOverflowMenu = ({
  anchorRect,
  isStandalone = false,
  onClose,
  onNewTab,
  onReloadHard,
  onResetWorkspace,
  onOpenAppearance,
  onOpenSettings,
  onOpenShortcuts,
  onOpenHelp,
  onAbout
}) => {
  const menuRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!anchorRect && !isStandalone) return null;

  const MENU_HEIGHT_ESTIMATE = 320;
  const spaceBelow = anchorRect ? window.innerHeight - (anchorRect.bottom + 6) : 999;
  const top = anchorRect
    ? spaceBelow >= MENU_HEIGHT_ESTIMATE
      ? Math.max(46, anchorRect.bottom + 6)
      : Math.max(8, anchorRect.top - MENU_HEIGHT_ESTIMATE - 6)
    : 46;
  const right = anchorRect ? Math.max(16, window.innerWidth - anchorRect.right) : 16;

  const handleAction = (callback, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!callback) return;
    callback(anchorRect);
    requestAnimationFrame(() => {
      onClose?.();
    });
  };

  const matchesSearch = (text) => {
    if (!searchQuery.trim()) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase().trim());
  };

  const hasSection1 = matchesSearch('New Tab') || matchesSearch('Hard Reload Page') || matchesSearch('Reset Tabs Workspace');
  const hasSection2 = matchesSearch('Display & Theme Controls') || matchesSearch('Preferences');
  const hasSection3 = matchesSearch('Keyboard Shortcuts') || matchesSearch('Help & Documentation') || matchesSearch('About Regaarder Research');

  const menuContent = (
    <div
      ref={menuRef}
      data-popover
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={isStandalone ? {} : { top: `${top}px`, right: `${Math.max(12, right)}px` }}
      className={`${
        isStandalone
          ? 'relative z-[100000] w-full max-w-sm border border-slate-200/80 dark:border-zinc-800/80 shadow-2xl p-2 max-h-[365px] overflow-y-auto thin-scrollbar'
          : 'fixed z-[100000] w-64 border border-slate-200/80 dark:border-zinc-800/80 backdrop-blur-2xl shadow-[0_12px_32px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.04)] p-2 max-h-[365px] overflow-y-auto thin-scrollbar animate-in zoom-in-95 fade-in duration-100 flex flex-col'
      } bg-white/95 dark:bg-[#1c1c1e]/95 rounded-2xl font-sans select-none text-slate-800 dark:text-zinc-100 flex flex-col`}
    >
      {/* Integrated Search Field */}
      <div className="px-1 pt-0.5 pb-2 mb-1 border-b border-slate-100 dark:border-zinc-800/60 shrink-0">
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-100/80 dark:bg-zinc-800/70 rounded-xl border border-transparent focus-within:border-violet-500/40 transition-colors">
          <Search size={14} className="text-slate-400 dark:text-zinc-500 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search options..."
            className="w-full bg-transparent text-xs text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none"
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* SECTION 1: WORKSPACE & TABS */}
      {hasSection1 && (
        <div className="px-1 py-1 space-y-0.5">
          <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block px-2.5 py-0.5 mb-0.5">
            Workspace & Tabs
          </span>

          {matchesSearch('New Tab') && (
            <button
              type="button"
              onPointerDown={(e) => handleAction(onNewTab, e)}
              className="w-full flex items-center justify-start gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100/90 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
            >
              <Plus size={16} className="text-slate-500 dark:text-zinc-400 shrink-0" />
              <span>New Tab</span>
            </button>
          )}

          {matchesSearch('Hard Reload Page') && (
            <button
              type="button"
              onPointerDown={(e) => handleAction(onReloadHard, e)}
              className="w-full flex items-center justify-start gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100/90 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
            >
              <RotateCcw size={16} className="text-slate-500 dark:text-zinc-400 shrink-0" />
              <span>Hard Reload Page</span>
            </button>
          )}

          {matchesSearch('Reset Tabs Workspace') && (
            <button
              type="button"
              onPointerDown={(e) => handleAction(onResetWorkspace, e)}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100/90 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
            >
              <Layers size={16} className="text-slate-500 dark:text-zinc-400 shrink-0" />
              <span>Reset Tabs Workspace</span>
            </button>
          )}
        </div>
      )}

      {/* SECTION 2: PREFERENCES & DISPLAY */}
      {hasSection2 && (
        <div className="px-1 py-1 space-y-0.5 mt-1">
          <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block px-2.5 py-0.5 mb-0.5">
            Preferences & Display
          </span>

          {matchesSearch('Display & Theme Controls') && (
            <button
              type="button"
              onPointerDown={(e) => handleAction(onOpenAppearance, e)}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100/90 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
            >
              <Settings size={16} className="text-slate-500 dark:text-zinc-400 shrink-0" />
              <span>Display & Theme Controls</span>
            </button>
          )}

          {matchesSearch('Preferences') && (
            <button
              type="button"
              onPointerDown={(e) => handleAction(onOpenSettings, e)}
              className="w-full flex items-center justify-start gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100/90 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
            >
              <SlidersHorizontal size={16} className="text-slate-500 dark:text-zinc-400 shrink-0" />
              <span>Preferences...</span>
            </button>
          )}
        </div>
      )}

      {/* SECTION 3: SYSTEM & HELP */}
      {hasSection3 && (
        <div className="px-1 py-1 space-y-0.5 mt-1">
          <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block px-2.5 py-0.5 mb-0.5">
            System & Help
          </span>

          {matchesSearch('Keyboard Shortcuts') && (
            <button
              type="button"
              onPointerDown={(e) => handleAction(onOpenShortcuts, e)}
              className="w-full flex items-center justify-start gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100/90 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
            >
              <Keyboard size={16} className="text-slate-500 dark:text-zinc-400 shrink-0" />
              <span>Keyboard Shortcuts</span>
            </button>
          )}

          {matchesSearch('Help & Documentation') && (
            <button
              type="button"
              onPointerDown={(e) => handleAction(onOpenHelp, e)}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100/90 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
            >
              <HelpCircle size={16} className="text-slate-500 dark:text-zinc-400 shrink-0" />
              <span>Help & Documentation</span>
            </button>
          )}

          {matchesSearch('About Regaarder Research') && (
            <button
              type="button"
              onPointerDown={(e) => handleAction(onAbout, e)}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100/90 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
            >
              <Info size={16} className="text-slate-500 dark:text-zinc-400 shrink-0" />
              <span>About Regaarder Research</span>
            </button>
          )}
        </div>
      )}

      {!hasSection1 && !hasSection2 && !hasSection3 && (
        <div className="px-3 py-4 text-center text-xs text-slate-400 dark:text-zinc-500">
          No matching options found
        </div>
      )}
    </div>
  );

  if (isStandalone) return menuContent;

  const targetNode = document.fullscreenElement ?? document.body;
  return createPortal(menuContent, targetNode);
};

export default BrowserOverflowMenu;

