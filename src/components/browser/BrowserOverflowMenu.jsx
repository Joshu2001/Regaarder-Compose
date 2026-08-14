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
          ? 'relative z-[100000] w-full max-w-sm border border-slate-200/80 dark:border-zinc-800/80 shadow-2xl p-2'
          : 'fixed z-[100000] w-[280px] max-h-[365px] border border-slate-200/80 dark:border-zinc-800/80 backdrop-blur-2xl shadow-[0_12px_32px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.04)] p-2 animate-in fade-in zoom-in-95 duration-100 flex flex-col'
      } bg-white/95 dark:bg-[#1c1c1e]/95 rounded-2xl font-sans select-none text-slate-800 dark:text-zinc-100 overflow-hidden`}
    >
      {/* Fixed Search Field Header */}
      <div className="px-1 pt-0.5 pb-2 border-b border-slate-100 dark:border-zinc-800/60 shrink-0">
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-2.5 text-slate-400 dark:text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search options..."
            className="w-full pl-8 pr-6 py-1.5 rounded-xl bg-slate-100/80 dark:bg-zinc-800/70 text-xs font-sans text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 outline-none border border-transparent focus:border-violet-500/40 transition-all"
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-0.5 cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Options Scroll Container */}
      <div className="flex-1 overflow-y-auto thin-scrollbar pt-1.5 space-y-2">
        {/* SECTION 1: WORKSPACE & TABS */}
        {hasSection1 && (
          <div className="px-1">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block px-2.5 py-0.5 mb-0.5">
              Workspace & Tabs
            </span>

            <div className="space-y-0.5">
              {matchesSearch('New Tab') && (
                <button
                  type="button"
                  onPointerDown={(e) => handleAction(onNewTab, e)}
                  className="w-full flex items-center justify-start gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100/90 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer group"
                >
                  <Plus size={16} className="text-slate-500 dark:text-zinc-400 shrink-0" />
                  <span className="truncate">New Tab</span>
                </button>
              )}

              {matchesSearch('Hard Reload Page') && (
                <button
                  type="button"
                  onPointerDown={(e) => handleAction(onReloadHard, e)}
                  className="w-full flex items-center justify-start gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100/90 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer group"
                >
                  <RotateCcw size={16} className="text-slate-500 dark:text-zinc-400 shrink-0" />
                  <span className="truncate">Hard Reload Page</span>
                </button>
              )}

              {matchesSearch('Reset Tabs Workspace') && (
                <button
                  type="button"
                  onPointerDown={(e) => handleAction(onResetWorkspace, e)}
                  className="w-full flex items-center justify-start gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100/90 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer group"
                >
                  <Layers size={16} className="text-slate-500 dark:text-zinc-400 shrink-0" />
                  <span className="truncate">Reset Tabs Workspace</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* SECTION 2: PREFERENCES & DISPLAY */}
        {hasSection2 && (
          <div className="px-1">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block px-2.5 py-0.5 mb-0.5">
              Preferences & Display
            </span>

            <div className="space-y-0.5">
              {matchesSearch('Display & Theme Controls') && (
                <button
                  type="button"
                  onPointerDown={(e) => handleAction(onOpenAppearance, e)}
                  className="w-full flex items-center justify-start gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100/90 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer group"
                >
                  <Settings size={16} className="text-slate-500 dark:text-zinc-400 shrink-0" />
                  <span className="truncate">Display & Theme Controls</span>
                </button>
              )}

              {matchesSearch('Preferences') && (
                <button
                  type="button"
                  onPointerDown={(e) => handleAction(onOpenSettings, e)}
                  className="w-full flex items-center justify-start gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100/90 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer group"
                >
                  <SlidersHorizontal size={16} className="text-slate-500 dark:text-zinc-400 shrink-0" />
                  <span className="truncate">Preferences...</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* SECTION 3: SYSTEM & HELP */}
        {hasSection3 && (
          <div className="px-1">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block px-2.5 py-0.5 mb-0.5">
              System & Help
            </span>

            <div className="space-y-0.5">
              {matchesSearch('Keyboard Shortcuts') && (
                <button
                  type="button"
                  onPointerDown={(e) => handleAction(onOpenShortcuts, e)}
                  className="w-full flex items-center justify-start gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100/90 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer group"
                >
                  <Keyboard size={16} className="text-slate-500 dark:text-zinc-400 shrink-0" />
                  <span className="truncate">Keyboard Shortcuts</span>
                </button>
              )}

              {matchesSearch('Help & Documentation') && (
                <button
                  type="button"
                  onPointerDown={(e) => handleAction(onOpenHelp, e)}
                  className="w-full flex items-center justify-start gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100/90 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer group"
                >
                  <HelpCircle size={16} className="text-slate-500 dark:text-zinc-400 shrink-0" />
                  <span className="truncate">Help & Documentation</span>
                </button>
              )}

              {matchesSearch('About Regaarder Research') && (
                <button
                  type="button"
                  onPointerDown={(e) => handleAction(onAbout, e)}
                  className="w-full flex items-center justify-start gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100/90 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer group"
                >
                  <Info size={16} className="text-slate-500 dark:text-zinc-400 shrink-0" />
                  <span className="truncate">About Regaarder Research</span>
                </button>
              )}
            </div>
          </div>
        )}

        {!hasSection1 && !hasSection2 && !hasSection3 && (
          <div className="px-3 py-4 text-center text-xs text-slate-400 dark:text-zinc-500">
            No matching options found
          </div>
        )}
      </div>
    </div>
  );

  if (isStandalone) return menuContent;

  const targetNode = document.fullscreenElement ?? document.body;
  return createPortal(menuContent, targetNode);
};

export default BrowserOverflowMenu;

