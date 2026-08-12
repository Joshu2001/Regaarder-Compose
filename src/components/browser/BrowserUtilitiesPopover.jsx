import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  SlidersHorizontal,
  Search,
  History,
  Download,
  ExternalLink,
  Bookmark,
  Printer
} from 'lucide-react';
import { SheetIcon, ComposeIcon, WhiteboardIcon, MemoryIcon } from '../RegaarderProductIcons';

/**
 * BrowserUtilitiesPopover: Regaarder Dedicated Browser Utilities & Tools Popover
 * Houses secondary browser actions (Export, Ingestion, Page Tools, Bookmarks, Print, Display & Appearance)
 * Surfaces use ~96% opacity to prevent webpage content bleed-through while retaining glass blur.
 */
export const BrowserUtilitiesPopover = ({
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
  onOpenDownloads,
  onOpenBookmarks,
  onPrintPage
}) => {
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
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
      setTimeout(() => callback(anchorRect), 10);
    }
  };

  const content = (
    <div
      ref={popoverRef}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{ top: `${top}px`, right: `${right}px` }}
      className="fixed z-[100000] w-[256px] bg-white dark:bg-[#1c1c1e] border border-slate-200 dark:border-zinc-700/80 shadow-2xl rounded-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150 font-sans select-none text-slate-800 dark:text-zinc-100 overflow-hidden"
    >
      {/* SECTION 1: PAGE CUSTOMIZATION */}
      <div className="px-1 py-1">
        <button
          type="button"
          onPointerDown={(e) => handleAction(onOpenFontPopover, e)}
          className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-900 dark:text-zinc-50 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-600 dark:hover:text-violet-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 border border-violet-500/20">
              <SlidersHorizontal size={13} />
            </div>
            <span>Display & Appearance</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 opacity-70 group-hover:opacity-100">⌘,</span>
        </button>
      </div>

      <div className="h-px bg-slate-200/60 dark:bg-zinc-800/80 my-1" />

      {/* SECTION 2: INGESTION & EXPORT UTILITIES */}
      <div className="px-1 py-1 space-y-0.5">
        <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block px-2.5 py-0.5">
          Export & Ingestion
        </span>

        <button
          type="button"
          onPointerDown={(e) => handleAction(onOpenSendToSheets, e)}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
        >
          <SheetIcon size={15} className="text-emerald-500 shrink-0" />
          <span>Send to Sheets</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => handleAction(onOpenSendToCompose, e)}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
        >
          <ComposeIcon size={15} className="text-sky-500 shrink-0" />
          <span>Send to Compose</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => handleAction(onSendWhiteboard, e)}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
        >
          <WhiteboardIcon size={15} className="text-amber-500 shrink-0" />
          <span>Send to Whiteboard</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => handleAction(onSaveMemory, e)}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
        >
          <MemoryIcon size={15} className="text-violet-500 shrink-0" />
          <span>Save to Regaarder Memory</span>
        </button>
      </div>

      <div className="h-px bg-slate-200/60 dark:bg-zinc-800/80 my-1" />

      {/* SECTION 3: BROWSER PAGE UTILITIES */}
      <div className="px-1 py-1 space-y-0.5">
        <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block px-2.5 py-0.5">
          Page & Browser Tools
        </span>

        <button
          type="button"
          onPointerDown={(e) => handleAction(onOpenExternal, e)}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
        >
          <ExternalLink size={15} className="text-slate-500 dark:text-zinc-400 shrink-0" />
          <span>Open in External Browser</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => handleAction(onFindInPage, e)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Search size={15} className="text-slate-500 dark:text-zinc-400 shrink-0" />
            <span>Find in Page</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">⌘F</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => handleAction(onOpenHistory, e)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <History size={15} className="text-slate-500 dark:text-zinc-400 shrink-0" />
            <span>Saved Research & History</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">⌘H</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => handleAction(onOpenBookmarks, e)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Bookmark size={15} className="text-slate-500 dark:text-zinc-400 shrink-0" />
            <span>Bookmarks Manager</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">⌘B</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => handleAction(onOpenDownloads, e)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Download size={15} className="text-slate-500 dark:text-zinc-400 shrink-0" />
            <span>Downloads</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">⌘J</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => handleAction(onPrintPage, e)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Printer size={15} className="text-slate-500 dark:text-zinc-400 shrink-0" />
            <span>Print Page...</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">⌘P</span>
        </button>
      </div>
    </div>
  );

  const targetNode = document.fullscreenElement ?? document.body;
  return createPortal(content, targetNode);
};

export default BrowserUtilitiesPopover;
