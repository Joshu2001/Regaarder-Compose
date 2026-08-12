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
  onClose,
  onNewTab,
  onReloadHard,
  onResetWorkspace,
  onOpenSettings,
  onOpenShortcuts,
  onOpenHelp,
  onAbout
}) => {
  const menuRef = useRef(null);

  useEffect(() => {
    let handleOutsideClick;
    const timer = setTimeout(() => {
      handleOutsideClick = (e) => {
        if (menuRef.current && !menuRef.current.contains(e.target)) {
          onClose?.();
        }
      };
      document.addEventListener('pointerdown', handleOutsideClick);
    }, 60);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      if (handleOutsideClick) {
        document.removeEventListener('pointerdown', handleOutsideClick);
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!anchorRect) return null;

  const top = Math.max(86, anchorRect.bottom + 6);
  const right = Math.max(16, window.innerWidth - anchorRect.right);

  const handleAction = (callback, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    onClose?.();
    if (callback) {
      setTimeout(() => callback(anchorRect), 10);
    }
  };

  const menuContent = (
    <div
      ref={menuRef}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{ top: `${top}px`, right: `${right}px` }}
      className="fixed z-[100000] w-[240px] bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-zinc-700/80 shadow-2xl rounded-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150 font-sans select-none text-slate-800 dark:text-zinc-100 overflow-hidden"
    >
      {/* SECTION 1: WORKSPACE & NAVIGATION */}
      <div className="px-1 py-1 space-y-0.5">
        <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block px-2.5 py-0.5">
          Workspace & Tabs
        </span>

        <button
          type="button"
          onPointerDown={(e) => handleAction(onNewTab, e)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Plus size={15} className="text-slate-500 dark:text-zinc-400 shrink-0" />
            <span>New Tab</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">⌘T</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => handleAction(onReloadHard, e)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <RotateCcw size={15} className="text-slate-500 dark:text-zinc-400 shrink-0" />
            <span>Hard Reload Page</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">⌘R</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => handleAction(onResetWorkspace, e)}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
        >
          <Layers size={15} className="text-slate-500 dark:text-zinc-400 shrink-0" />
          <span>Reset Tabs Workspace</span>
        </button>
      </div>

      <div className="h-px bg-slate-200/60 dark:bg-zinc-800/80 my-1" />

      {/* SECTION 2: SYSTEM PREFERENCES & HELP */}
      <div className="px-1 py-1 space-y-0.5">
        <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block px-2.5 py-0.5">
          System & Preferences
        </span>

        <button
          type="button"
          onPointerDown={(e) => handleAction(onOpenSettings, e)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Settings size={15} className="text-slate-500 dark:text-zinc-400 shrink-0" />
            <span>Preferences...</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">⌘,</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => handleAction(onOpenShortcuts, e)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Keyboard size={15} className="text-slate-500 dark:text-zinc-400 shrink-0" />
            <span>Keyboard Shortcuts</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">⌘/</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => handleAction(onOpenHelp, e)}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
        >
          <HelpCircle size={15} className="text-slate-500 dark:text-zinc-400 shrink-0" />
          <span>Help & Documentation</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => handleAction(onAbout, e)}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
        >
          <Sparkles size={15} className="text-violet-500 shrink-0" />
          <span>About Regaarder Research</span>
        </button>
      </div>
    </div>
  );

  const targetNode = document.fullscreenElement ?? document.body;
  return createPortal(menuContent, targetNode);
};

export default BrowserOverflowMenu;
