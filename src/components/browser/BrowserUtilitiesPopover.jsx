import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  SlidersHorizontal,
  Search,
  History,
  Download,
  ExternalLink,
  Bookmark,
  Printer,
  Plus,
  X
} from 'lucide-react';
import { SheetIcon, ComposeIcon, WhiteboardIcon, MemoryIcon } from '../RegaarderProductIcons';

/**
 * BrowserUtilitiesPopover: Regaarder Dedicated Browser Utilities & Tools Popover
 * Houses search & filter, tab management, export/ingestion, page tools, and display appearance settings.
 */
export const BrowserUtilitiesPopover = ({
  anchorRect,
  isStandalone = false,
  onClose,
  onOpenFontPopover,
  onOpenExternal,
  onOpenSendToSheets,
  onOpenSendToCompose,
  onSendWhiteboard,
  onSaveMemory,
  onFindInPage,
  onNewTab,
  onCloseTab,
  onOpenHistory,
  onOpenDownloads,
  onOpenBookmarks,
  onPrintPage
}) => {
  const popoverRef = useRef(null);
  const searchInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-focus search input when popover mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!anchorRect && !isStandalone) return null;

  // Estimated utilities popover height for bottom-clamp calculation.
  const POPOVER_HEIGHT_ESTIMATE = 420;
  const spaceBelow = anchorRect ? window.innerHeight - (anchorRect.bottom + 6) : 999;
  const top = anchorRect
    ? spaceBelow >= POPOVER_HEIGHT_ESTIMATE
      ? Math.max(86, anchorRect.bottom + 6)
      : Math.max(8, anchorRect.top - POPOVER_HEIGHT_ESTIMATE - 6)
    : 86;
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

  // Comprehensive utility items registry with tags/keywords
  const allUtilities = useMemo(() => [
    {
      id: 'new-tab',
      title: 'New Research Tab',
      shortcut: '⌘T',
      category: 'Tabs & Navigation',
      keywords: ['tab', 'new tab', 'add tab', 'open tab', 'create tab', 'tabs'],
      icon: <Plus size={15} className="text-violet-500 shrink-0" />,
      action: onNewTab
    },
    {
      id: 'close-tab',
      title: 'Close Active Tab',
      shortcut: '⌘W',
      category: 'Tabs & Navigation',
      keywords: ['tab', 'close tab', 'remove tab', 'delete tab', 'tabs'],
      icon: <X size={15} className="text-rose-500 shrink-0" />,
      action: onCloseTab
    },
    {
      id: 'history',
      title: 'Saved Tabs & History',
      shortcut: '⌘H',
      category: 'Tabs & Navigation',
      keywords: ['tab', 'saved tabs', 'history', 'recent tabs', 'tabs', 'saved'],
      icon: <History size={15} className="text-slate-500 dark:text-zinc-400 shrink-0" />,
      action: onOpenHistory
    },
    {
      id: 'display',
      title: 'Display & Appearance',
      shortcut: '⌘,',
      category: 'Page Customization',
      keywords: ['display', 'appearance', 'font', 'dark', 'light', 'theme', 'zoom', 'tab', 'page', 'customization'],
      icon: (
        <div className="w-5 h-5 rounded-md bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 border border-violet-500/20">
          <SlidersHorizontal size={12} />
        </div>
      ),
      action: onOpenFontPopover,
      isFeatured: true
    },
    {
      id: 'send-sheets',
      title: 'Send to Sheets',
      category: 'Export & Ingestion',
      keywords: ['sheet', 'sheets', 'export', 'table', 'excel', 'csv', 'data', 'tab'],
      icon: <SheetIcon size={15} className="text-emerald-500 shrink-0" />,
      action: onOpenSendToSheets
    },
    {
      id: 'send-compose',
      title: 'Send to Compose',
      category: 'Export & Ingestion',
      keywords: ['compose', 'doc', 'document', 'export', 'text', 'notes'],
      icon: <ComposeIcon size={15} className="text-sky-500 shrink-0" />,
      action: onOpenSendToCompose
    },
    {
      id: 'send-whiteboard',
      title: 'Send to Whiteboard',
      category: 'Export & Ingestion',
      keywords: ['whiteboard', 'canvas', 'clip', 'draw', 'export', 'image'],
      icon: <WhiteboardIcon size={15} className="text-amber-500 shrink-0" />,
      action: onSendWhiteboard
    },
    {
      id: 'save-memory',
      title: 'Save to Regaarder Memory',
      category: 'Export & Ingestion',
      keywords: ['memory', 'knowledge', 'save', 'ai', 'remember', 'node'],
      icon: <MemoryIcon size={15} className="text-violet-500 shrink-0" />,
      action: onSaveMemory
    },
    {
      id: 'find-page',
      title: 'Find in Page',
      shortcut: '⌘F',
      category: 'Page & Browser Tools',
      keywords: ['find', 'search', 'page', 'text', 'filter'],
      icon: <Search size={15} className="text-slate-500 dark:text-zinc-400 shrink-0" />,
      action: onFindInPage
    },
    {
      id: 'bookmarks',
      title: 'Bookmarks Manager',
      shortcut: '⌘B',
      category: 'Page & Browser Tools',
      keywords: ['bookmark', 'bookmarks', 'favorite', 'saved', 'tab', 'tabs'],
      icon: <Bookmark size={15} className="text-slate-500 dark:text-zinc-400 shrink-0" />,
      action: onOpenBookmarks
    },
    {
      id: 'downloads',
      title: 'Downloads',
      shortcut: '⌘J',
      category: 'Page & Browser Tools',
      keywords: ['download', 'downloads', 'files', 'saved'],
      icon: <Download size={15} className="text-slate-500 dark:text-zinc-400 shrink-0" />,
      action: onOpenDownloads
    },
    {
      id: 'external-browser',
      title: 'Open in External Browser',
      category: 'Page & Browser Tools',
      keywords: ['external', 'chrome', 'browser', 'open', 'system', 'tab'],
      icon: <ExternalLink size={15} className="text-slate-500 dark:text-zinc-400 shrink-0" />,
      action: onOpenExternal
    },
    {
      id: 'print',
      title: 'Print Page...',
      shortcut: '⌘P',
      category: 'Page & Browser Tools',
      keywords: ['print', 'pdf', 'page', 'export', 'paper'],
      icon: <Printer size={15} className="text-slate-500 dark:text-zinc-400 shrink-0" />,
      action: onPrintPage
    }
  ], [onNewTab, onCloseTab, onOpenHistory, onOpenFontPopover, onOpenSendToSheets, onOpenSendToCompose, onSendWhiteboard, onSaveMemory, onFindInPage, onOpenBookmarks, onOpenDownloads, onOpenExternal, onPrintPage]);

  // Filter utilities based on search query
  const filteredUtilities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allUtilities;
    return allUtilities.filter((u) => {
      return (
        u.title.toLowerCase().includes(q) ||
        u.category.toLowerCase().includes(q) ||
        u.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [allUtilities, searchQuery]);

  // Group items by category
  const groupedUtilities = useMemo(() => {
    const groups = {};
    filteredUtilities.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredUtilities]);

  const content = (
    <div
      ref={popoverRef}
      data-popover
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={isStandalone ? {} : { top: `${top}px`, right: `${Math.max(12, right)}px` }}
      className={`${
        isStandalone
          ? 'relative z-[100000] w-full max-w-sm border border-slate-200/90 dark:border-zinc-800/90 shadow-2xl p-1.5'
          : 'fixed z-[100000] w-[275px] max-h-[460px] border border-slate-200/90 dark:border-zinc-800/90 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.22),0_4px_16px_-4px_rgba(0,0,0,0.08)] p-1.5 animate-in fade-in zoom-in-95 duration-150 flex flex-col'
      } bg-white dark:bg-[#1c1c1e] rounded-2xl font-sans select-none text-slate-800 dark:text-zinc-100 overflow-hidden`}
    >
      {/* Quick Utility Search / Filter Field */}
      <div className="px-1 pt-1 pb-1.5 border-b border-slate-100 dark:border-zinc-800/80 shrink-0">
        <div className="relative flex items-center">
          <Search size={13} className="absolute left-2.5 text-slate-400 dark:text-zinc-500 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search utilities... (e.g. tab, sheets, print)"
            className="w-full pl-8 pr-6 py-1.5 rounded-xl bg-slate-100/80 dark:bg-zinc-800/80 text-xs font-sans text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 outline-none border border-transparent focus:border-violet-500/40 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setSearchQuery('');
              }}
              className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-0.5 cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Utility Items Scroll Container */}
      <div className="flex-1 overflow-y-auto thin-scrollbar pt-1 space-y-1.5">
        {Object.keys(groupedUtilities).length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400 dark:text-zinc-500">
            No utilities matching &quot;{searchQuery}&quot;
          </div>
        ) : (
          Object.entries(groupedUtilities).map(([category, items], idx) => (
            <div key={category} className="px-1">
              {idx > 0 && <div className="h-px bg-slate-200/60 dark:bg-zinc-800/80 my-1" />}
              <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block px-2.5 py-0.5">
                {category}
              </span>
              <div className="space-y-0.5 mt-0.5">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onPointerDown={(e) => handleAction(item.action, e)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer group ${
                      item.isFeatured
                        ? 'font-semibold text-slate-900 dark:text-zinc-50 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-600 dark:hover:text-violet-300'
                        : 'font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.icon}
                      <span className="truncate">{item.title}</span>
                    </div>
                    {item.shortcut && (
                      <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 opacity-70 group-hover:opacity-100 shrink-0 ml-2">
                        {item.shortcut}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  if (isStandalone) return content;

  const targetNode = document.fullscreenElement ?? document.body;
  return createPortal(content, targetNode);
};

export default BrowserUtilitiesPopover;
