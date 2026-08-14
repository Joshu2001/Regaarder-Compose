import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  RotateCcw,
  Settings,
  HelpCircle,
  Keyboard,
  Info,
  Layers,
  Sparkles
} from 'lucide-react';

/**
 * BrowserOverflowMenu: Regaarder General System & Browser Options Popover
 * Triggered via the `⋯` control in the toolbar.
 * Houses general browser-level system settings, workspace management, and documentation.
 * Popover surface uses 96% opacity to prevent webpage content bleed-through.
 */
export const BrowserOverflowMenu = ({
  anchorRect,
  isStandalone = false,
  onClose,
  onNewTab,
  onReloadHard,
  onResetWorkspace,
  onOpenFlows,
  onOpenAppearance,
  onOpenSettings,
  onOpenShortcuts,
  onOpenHelp,
  onAbout
}) => {
  const menuRef = useRef(null);

  useEffect(() => {
    // Outside-click dismissal is handled globally by BrowserWorkspace's pointerdown
    // listener (which guards via [data-popover]). Only Escape key is handled here.
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!anchorRect && !isStandalone) return null;

  // Estimated overflow menu height for bottom-clamp calculation.
  // Flips above the anchor button when it would overflow below the viewport fold.
  const MENU_HEIGHT_ESTIMATE = 280;
  const spaceBelow = anchorRect ? window.innerHeight - (anchorRect.bottom + 6) : 999;
  const top = anchorRect
    ? spaceBelow >= MENU_HEIGHT_ESTIMATE
      ? Math.max(86, anchorRect.bottom + 6)
      : Math.max(8, anchorRect.top - MENU_HEIGHT_ESTIMATE - 6)
    : 86;
  const right = anchorRect ? Math.max(16, window.innerWidth - anchorRect.right) : 16;

  const handleAction = (callback, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!callback) return;
    callback(anchorRect);
  };

  const menuContent = (
    <div
      ref={menuRef}
      data-popover
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={isStandalone ? {} : { top: `${top}px`, right: `${Math.max(12, right)}px` }}
      className={`${
        isStandalone
          ? 'relative z-[100000] w-full max-w-sm border border-slate-200 dark:border-zinc-800 shadow-xl p-1.5 max-h-[380px] overflow-y-auto thin-scrollbar'
          : 'fixed z-[100000] w-60 border border-slate-200 dark:border-zinc-800 shadow-xl p-1.5 max-h-[380px] overflow-y-auto thin-scrollbar animate-in zoom-in-95 fade-in duration-100'
      } bg-white dark:bg-[#1c1c1e] rounded-2xl font-sans select-none text-slate-800 dark:text-zinc-100`}
    >
      {/* SECTION 1: WORKSPACE & NAVIGATION */}
      <div className="px-1 py-1 space-y-0.5">
        <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block px-2.5 py-0.5">
          Workspace & Tabs
        </span>

        <button
          type="button"
          onPointerDown={(e) => handleAction(onNewTab, e)}
          className="w-full flex items-center justify-start gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
        >
          <Plus size={15} className="text-slate-500 dark:text-zinc-400 shrink-0" />
          <span>New Tab</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => handleAction(onReloadHard, e)}
          className="w-full flex items-center justify-start gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
        >
          <RotateCcw size={15} className="text-slate-500 dark:text-zinc-400 shrink-0" />
          <span>Hard Reload Page</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => handleAction(onResetWorkspace, e)}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
        >
          <Layers size={15} className="text-slate-500 dark:text-zinc-400 shrink-0" />
          <span>Reset Tabs Workspace</span>
        </button>
      </div>

      <div className="h-px bg-slate-200/60 dark:bg-zinc-800/80 my-1" />

      {/* SECTION 2: BROWSER TOOLS & AUTOMATION */}
      <div className="px-1 py-1 space-y-0.5">
        <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block px-2.5 py-0.5">
          Tools & Automation
        </span>

        <button
          type="button"
          onPointerDown={(e) => handleAction(onOpenFlows, e)}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
        >
          <Sparkles size={15} className="text-violet-500 shrink-0" />
          <span>Regaarder Flows</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => handleAction(onOpenAppearance, e)}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
        >
          <Settings size={15} className="text-slate-500 dark:text-zinc-400 shrink-0" />
          <span>Display & Theme Controls</span>
        </button>
      </div>

      <div className="h-px bg-slate-200/60 dark:bg-zinc-800/80 my-1" />

      {/* SECTION 3: SYSTEM PREFERENCES & HELP */}
      <div className="px-1 py-1 space-y-0.5">
        <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block px-2.5 py-0.5">
          System & Preferences
        </span>

        <button
          type="button"
          onPointerDown={(e) => handleAction(onOpenSettings, e)}
          className="w-full flex items-center justify-start gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
        >
          <Settings size={15} className="text-slate-500 dark:text-zinc-400 shrink-0" />
          <span>Preferences...</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => handleAction(onOpenShortcuts, e)}
          className="w-full flex items-center justify-start gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
        >
          <Keyboard size={15} className="text-slate-500 dark:text-zinc-400 shrink-0" />
          <span>Keyboard Shortcuts</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => handleAction(onOpenHelp, e)}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
        >
          <HelpCircle size={15} className="text-slate-500 dark:text-zinc-400 shrink-0" />
          <span>Help & Documentation</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => handleAction(onAbout, e)}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
        >
          <Sparkles size={15} className="text-violet-500 shrink-0" />
          <span>About Regaarder Research</span>
        </button>
      </div>
    </div>
  );

  if (isStandalone) return menuContent;

  const targetNode = document.fullscreenElement ?? document.body;
  return createPortal(menuContent, targetNode);
};

export default BrowserOverflowMenu;
