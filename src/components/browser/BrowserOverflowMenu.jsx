import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { SlidersHorizontal, Search, History, Download, ExternalLink } from 'lucide-react';
import { SheetIcon, ComposeIcon, WhiteboardIcon, MemoryIcon } from '../RegaarderProductIcons';

/**
 * BrowserOverflowMenu: Regaarder Browser Executive Overflow Popover Menu
 * Houses lower-frequency actions (Display & Appearance, Export utilities, Page Tools)
 * keeping the primary toolbar clean, uncluttered, and focused on core capabilities.
 */
export const BrowserOverflowMenu = ({
  anchorRect,
  onClose,
  onOpenFontPopover,
  onOpenExternal,
  onOpenSendToSheets,
  onOpenSendToCompose,
  onSendWhiteboard,
  onSaveMemory,
  onFindInPage,
  onOpenHistory,
  onOpenDownloads
}) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose?.();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('pointerdown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
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
      // Small timeout to allow popover state transition cleanly
      setTimeout(() => callback(anchorRect), 10);
    }
  };

  const menuContent = (
    <div
      ref={menuRef}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{ top: `${top}px`, right: `${right}px` }}
      className="fixed z-[100000] w-[240px] bg-white/95 dark:bg-[#1c1c1e]/95 border border-slate-200/80 dark:border-zinc-800/80 shadow-xl rounded-2xl p-1.5 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 font-sans select-none text-slate-800 dark:text-zinc-100 overflow-hidden"
    >
      {/* SECTION 1: CUSTOMIZATION & VIEW */}
      <div className="px-1 py-1">
        <button
          type="button"
          onPointerDown={(e) => handleAction(onOpenFontPopover, e)}
          className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-zinc-100 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-600 dark:hover:text-violet-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
              <SlidersHorizontal size={14} />
            </div>
            <span>Display & Appearance</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 opacity-70 group-hover:opacity-100">⌘,</span>
        </button>
      </div>

      <div className="h-px bg-slate-100 dark:bg-zinc-800/80 my-1" />

      {/* SECTION 2: REGAARDER EXPORT & KNOWLEDGE UTILITIES */}
      <div className="px-1 py-1 space-y-0.5">
        <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block px-2 py-0.5">
          Export & Ingestion
        </span>

        <button
          type="button"
          onPointerDown={(e) => handleAction(onOpenSendToSheets, e)}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <SheetIcon size={15} className="text-emerald-500" />
          <span>Send to Sheets</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => handleAction(onOpenSendToCompose, e)}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <ComposeIcon size={15} className="text-sky-500" />
          <span>Send to Compose</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => handleAction(onSendWhiteboard, e)}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <WhiteboardIcon size={15} className="text-amber-500" />
          <span>Send to Whiteboard</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => handleAction(onSaveMemory, e)}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <MemoryIcon size={15} className="text-violet-500" />
          <span>Save to Regaarder Memory</span>
        </button>
      </div>

      <div className="h-px bg-slate-100 dark:bg-zinc-800/80 my-1" />

      {/* SECTION 3: BROWSER PAGE UTILITIES */}
      <div className="px-1 py-1 space-y-0.5">
        <button
          type="button"
          onPointerDown={(e) => handleAction(onOpenExternal, e)}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <ExternalLink size={15} className="text-slate-400 dark:text-zinc-400" />
          <span>Open in External Browser</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => handleAction(onFindInPage, e)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Search size={15} className="text-slate-400 dark:text-zinc-400" />
            <span>Find in Page</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">⌘F</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => handleAction(onOpenHistory, e)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <History size={15} className="text-slate-400 dark:text-zinc-400" />
            <span>Saved Research & History</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">⌘H</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => handleAction(onOpenDownloads, e)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Download size={15} className="text-slate-400 dark:text-zinc-400" />
            <span>Downloads</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">⌘J</span>
        </button>
      </div>
    </div>
  );

  const targetNode = document.fullscreenElement ?? document.body;
  return createPortal(menuContent, targetNode);
};

export default BrowserOverflowMenu;
