import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  ExternalLink,
  Printer,
  X
} from 'lucide-react';
import {
  BrowserFlowIcon,
  BrowserCompetitorsIcon,
  BrowserCloseIcon,
  BrowserSearchIcon
} from './RegaarderBrowserIcons';
import {
  SheetIcon,
  ComposeIcon,
  WhiteboardIcon,
  MemoryIcon,
  AssistIcon,
  AgentsIcon
} from '../RegaarderProductIcons';

/**
 * Regaarder Commands Popover:
 * Houses Regaarder intelligence, automation, and contextual actions.
 * Grouped into: Workspace & Regaarder, Export & Ingestion, Contextual Actions.
 * Menu icons neutral by default, purple for Regaarder capabilities, red for destructive.
 */
export const BrowserUtilitiesPopover = ({
  anchorRect,
  isStandalone = false,
  onClose,
  onOpenFlows,
  onOpenExternal,
  onOpenSendToSheets,
  onOpenSendToCompose,
  onSendWhiteboard,
  onSaveMemory,
  onFindInPage,
  onCloseTab,
  onPrintPage,
  onSummarizePage,
  onOpenCompetitorWorkflow
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

  const POPOVER_HEIGHT_ESTIMATE = 380;
  const spaceBelow = anchorRect ? window.innerHeight - (anchorRect.bottom + 6) : 999;
  const top = anchorRect
    ? spaceBelow >= POPOVER_HEIGHT_ESTIMATE
      ? Math.max(46, anchorRect.bottom + 6)
      : Math.max(8, anchorRect.top - POPOVER_HEIGHT_ESTIMATE - 6)
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

  // Commands registry (Regaarder intelligence & contextual actions only)
  const allCommands = useMemo(() => [
    {
      id: 'regaarder-flows',
      title: 'Regaarder Flows',
      category: 'Workspace & Regaarder',
      keywords: ['flow', 'automation', 'record', 'replay', 'sequence'],
      icon: <BrowserFlowIcon size={16} className="text-violet-500 shrink-0" />,
      action: onOpenFlows
    },
    {
      id: 'save-memory',
      title: 'Save to Regaarder Memory',
      category: 'Workspace & Regaarder',
      keywords: ['memory', 'knowledge', 'save', 'ai', 'remember'],
      icon: <MemoryIcon size={16} className="text-violet-500 shrink-0" />,
      action: onSaveMemory
    },
    {
      id: 'summarize-page',
      title: 'Summarize Page with AI',
      category: 'Workspace & Regaarder',
      keywords: ['summarize', 'ai', 'assistant', 'explain', 'page'],
      icon: <AssistIcon size={16} className="text-violet-500 shrink-0" />,
      action: onSummarizePage
    },
    {
      id: 'send-sheets',
      title: 'Send to Sheets',
      category: 'Export & Ingestion',
      keywords: ['sheet', 'sheets', 'export', 'table', 'excel', 'data'],
      icon: <SheetIcon size={16} className="text-slate-500 dark:text-zinc-400 shrink-0" />,
      action: onOpenSendToSheets
    },
    {
      id: 'send-compose',
      title: 'Send to Compose',
      category: 'Export & Ingestion',
      keywords: ['compose', 'doc', 'document', 'export', 'text'],
      icon: <ComposeIcon size={16} className="text-slate-500 dark:text-zinc-400 shrink-0" />,
      action: onOpenSendToCompose
    },
    {
      id: 'send-whiteboard',
      title: 'Send to Whiteboard',
      category: 'Export & Ingestion',
      keywords: ['whiteboard', 'canvas', 'clip', 'draw', 'image'],
      icon: <WhiteboardIcon size={16} className="text-slate-500 dark:text-zinc-400 shrink-0" />,
      action: onSendWhiteboard
    },
    {
      id: 'find-page',
      title: 'Find in Page',
      shortcut: '⌘F',
      category: 'Contextual Actions',
      keywords: ['find', 'search', 'page', 'text', 'filter'],
      icon: <Search size={16} className="text-slate-500 dark:text-zinc-400 shrink-0" />,
      action: onFindInPage
    },
    {
      id: 'competitor-research',
      title: 'Research Competitors Workflow',
      category: 'Contextual Actions',
      keywords: ['competitor', 'research', 'matrix', 'comparison'],
      icon: <BrowserCompetitorsIcon size={16} className="text-slate-500 dark:text-zinc-400 shrink-0" />,
      action: onOpenCompetitorWorkflow
    },
    {
      id: 'external-browser',
      title: 'Open in External Browser',
      category: 'Contextual Actions',
      keywords: ['external', 'chrome', 'browser', 'open', 'system'],
      icon: <ExternalLink size={16} className="text-slate-500 dark:text-zinc-400 shrink-0" />,
      action: onOpenExternal
    },
    {
      id: 'print',
      title: 'Print Page...',
      shortcut: '⌘P',
      category: 'Contextual Actions',
      keywords: ['print', 'pdf', 'page', 'paper'],
      icon: <Printer size={16} className="text-slate-500 dark:text-zinc-400 shrink-0" />,
      action: onPrintPage
    },
    {
      id: 'close-tab',
      title: 'Close Active Tab',
      shortcut: '⌘W',
      category: 'Contextual Actions',
      keywords: ['tab', 'close tab', 'remove tab'],
      icon: <X size={16} className="text-rose-500 shrink-0" />,
      isDestructive: true,
      action: onCloseTab
    }
  ], [onOpenFlows, onSaveMemory, onSummarizePage, onOpenSendToSheets, onOpenSendToCompose, onSendWhiteboard, onFindInPage, onOpenCompetitorWorkflow, onOpenExternal, onPrintPage, onCloseTab]);

  // Filter commands based on search query
  const filteredCommands = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allCommands;
    return allCommands.filter((u) => {
      return (
        u.title.toLowerCase().includes(q) ||
        u.category.toLowerCase().includes(q) ||
        u.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [allCommands, searchQuery]);

  // Group items by category
  const groupedCommands = useMemo(() => {
    const groups = {};
    filteredCommands.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredCommands]);

  const content = (
    <div
      ref={popoverRef}
      data-popover
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={isStandalone ? {} : { top: `${top}px`, right: `${Math.max(12, right)}px` }}
      className={`${
        isStandalone
          ? 'relative z-[100000] w-full max-w-sm border border-slate-200/80 dark:border-zinc-800/80 shadow-2xl p-2'
          : 'fixed z-[100000] w-[280px] max-h-[440px] border border-slate-200/80 dark:border-zinc-800/80 backdrop-blur-2xl shadow-[0_12px_32px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.04)] p-2 animate-in fade-in zoom-in-95 duration-150 flex flex-col'
      } bg-white/95 dark:bg-[#1c1c1e]/95 rounded-2xl font-sans select-none text-slate-800 dark:text-zinc-100 overflow-hidden`}
    >
      {/* Quick Commands Search Field */}
      <div className="px-1 pt-0.5 pb-2 border-b border-slate-100 dark:border-zinc-800/60 shrink-0">
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-2.5 text-slate-400 dark:text-zinc-500 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search commands..."
            className="w-full pl-8 pr-6 py-1.5 rounded-xl bg-slate-100/80 dark:bg-zinc-800/70 text-xs font-sans text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 outline-none border border-transparent focus:border-violet-500/40 transition-all"
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

      {/* Commands Scroll Container */}
      <div className="flex-1 overflow-y-auto thin-scrollbar pt-1.5 space-y-2">
        {Object.keys(groupedCommands).length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400 dark:text-zinc-500">
            No commands matching &quot;{searchQuery}&quot;
          </div>
        ) : (
          Object.entries(groupedCommands).map(([category, items], idx) => (
            <div key={category} className="px-1">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block px-2.5 py-0.5 mb-0.5">
                {category}
              </span>
              <div className="space-y-0.5">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onPointerDown={(e) => handleAction(item.action, e)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer group ${
                      item.isDestructive
                        ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                        : 'text-slate-800 dark:text-zinc-200 hover:bg-slate-100/90 dark:hover:bg-zinc-800/80'
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
