import { useTranslation } from '../../i18n';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search, X, ArrowRight, CornerDownLeft, Copy, Check, RefreshCw,
  Sparkles, Clock, FileText, Database, ShieldCheck, Compass
} from 'lucide-react';
import {
  buildWorkspaceIndex,
  queryWorkspace,
  groupResultsByCategory,
  synthesizeWorkspaceKnowledge
} from '../../services/GlobalWorkspaceSearchEngine';
import {
  ComposeIcon,
  DeckIcon,
  SheetIcon,
  RoomIcon,
  TasksIcon,
  MemoryIcon,
  BrowserIcon,
  PeopleIcon,
  OrbIcon,
  RegaarderAiIcon,
  RegaarderHistoryIcon,
  RegaarderProductIcon
} from '../RegaarderProductIcons';

// Helper component to highlight matched text
function HighlightedText({ text = '', query = '', className = '' }) {
  if (!text) return null;
  if (!query || !query.trim()) {
    return <span className={className}>{text}</span>;
  }

  const cleanQuery = query.trim();
  const escapedQuery = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.toLowerCase() === cleanQuery.toLowerCase() ? (
          <mark
            key={i}
            className="bg-violet-100 dark:bg-violet-900/60 text-violet-900 dark:text-violet-200 font-semibold px-0.5 rounded"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}

// Category filter tabs definition using native Regaarder SVG product icons
const FILTER_TABS = [
  { id: 'all', label: 'All', icon: MemoryIcon },
  { id: 'compose', label: 'Docs', icon: ComposeIcon },
  { id: 'sheets', label: 'Sheets', icon: SheetIcon },
  { id: 'deck', label: 'Decks', icon: DeckIcon },
  { id: 'tasks', label: 'Tasks', icon: TasksIcon },
  { id: 'room', label: 'Rooms', icon: RoomIcon },
  { id: 'browser', label: 'Notes', icon: BrowserIcon },
  { id: 'people', label: 'People', icon: PeopleIcon }
];

// Context-aware empty state configurations per category
const EMPTY_STATE_CONFIG = {
  all: {
    icon: MemoryIcon,
    title: 'No recent items in workspace',
    description: 'Create a document, spreadsheet, presentation, or task to see contextual items here.'
  },
  compose: {
    icon: ComposeIcon,
    title: 'No documents indexed yet',
    description: 'Draft and organize rich documents in Compose to view them in workspace memory.'
  },
  sheets: {
    icon: SheetIcon,
    title: 'No spreadsheets indexed yet',
    description: 'Build calculation models and formula data grids in Sheets.'
  },
  deck: {
    icon: DeckIcon,
    title: 'No presentations indexed yet',
    description: 'Design slides and executive decks to view them here.'
  },
  tasks: {
    icon: TasksIcon,
    title: 'No tasks or initiatives',
    description: 'Add project deliverables and action items to track progress across memory.'
  },
  room: {
    icon: RoomIcon,
    title: 'No meeting rooms active',
    description: 'Start a video call or ambient room to generate meeting memory records.'
  },
  browser: {
    icon: BrowserIcon,
    title: 'No research notes saved',
    description: 'Browse live web sources and save citations to your knowledge notes.'
  },
  people: {
    icon: PeopleIcon,
    title: 'No collaborators indexed',
    description: 'Invite teammates and assign roles across workspace projects.'
  }
};

// Compact primary quick action chips with native Regaarder SVG product icons
const COMPACT_QUICK_ACTIONS = [
  {
    id: 'action-new-doc',
    type: 'action',
    workspace: 'compose',
    title: 'New Document',
    targetWorkspace: 'compose',
    shortcut: '⌘N',
    actionType: 'new_doc',
    icon: ComposeIcon
  },
  {
    id: 'action-new-sheet',
    type: 'action',
    workspace: 'sheets',
    title: 'New Spreadsheet',
    targetWorkspace: 'sheets',
    shortcut: '⌘⇧S',
    actionType: 'new_sheet',
    icon: SheetIcon
  },
  {
    id: 'action-new-deck',
    type: 'action',
    workspace: 'deck',
    title: 'New Presentation',
    targetWorkspace: 'deck',
    shortcut: '⌘⇧P',
    actionType: 'new_deck',
    icon: DeckIcon
  },
  {
    id: 'action-new-room',
    type: 'action',
    workspace: 'room',
    title: 'Start Room',
    targetWorkspace: 'room',
    shortcut: '⌘M',
    actionType: 'new_room',
    icon: RoomIcon
  }
];

// Suggested Ask AI prompt queries for Deck mode
const SUGGESTED_AI_PROMPTS = [
  "Summarize key decisions across recent documents",
  "What are the active milestones and deliverables?",
  "Review open items in my workspace memory",
  "Show high-priority tasks and upcoming deadlines"
];

export default function GlobalWorkspaceSearchModal({

  isOpen,
  onClose,
  initialQuery = '',
  initialMode = 'search', // 'search' | 'ai'
  initialFilter = 'all',
  isDarkMode = false,
  productMode = 'compose',
  onCallAi = null,
  liveWorkspaceContext = {},
  onNavigateToEntity,
  onQuickAction
}) {
  const isDeck = productMode === 'deck';
  const [mode, setMode] = useState(isDeck ? (initialMode || 'search') : 'search');
  const { t } = useTranslation();
  const [query, setQuery] = useState(initialQuery || '');
  const [activeFilter, setActiveFilter] = useState(initialFilter || 'all');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // AI Synthesis state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [copiedAi, setCopiedAi] = useState(false);

  const inputRef = useRef(null);
  const resultsContainerRef = useRef(null);

  // Build the complete searchable workspace index strictly from real state
  const workspaceIndex = useMemo(() => {
    return buildWorkspaceIndex(liveWorkspaceContext);
  }, [liveWorkspaceContext]);

  // Execute dynamic query across the workspace index for Search Mode
  const searchResults = useMemo(() => {
    return queryWorkspace(workspaceIndex, query, activeFilter);
  }, [workspaceIndex, query, activeFilter]);

  // Grouped results for categorized display when query is present in Search Mode
  const groupedResults = useMemo(() => {
    if (!query.trim() || mode === 'ai') return [];
    return groupResultsByCategory(searchResults);
  }, [searchResults, query, mode]);

  // Flat list of selectable items for keyboard navigation in Search Mode
  const flatSelectableItems = useMemo(() => {
    if (mode === 'ai') return [];
    if (!query.trim()) {
      return [
        ...COMPACT_QUICK_ACTIONS.map((a) => ({ type: 'action', data: a })),
        ...searchResults.slice(0, 10).map((r) => ({ type: 'entity', data: r.entity }))
      ];
    }
    return searchResults.map((r) => ({ type: 'entity', data: r.entity }));
  }, [query, searchResults, mode]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(isDeck ? (initialMode || 'search') : 'search');
      setQuery(initialQuery || '');
      setActiveFilter(initialFilter || 'all');
      setSelectedIndex(0);
      setAiResponse(null);
      setAiLoading(false);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isOpen, initialQuery, initialMode, initialFilter, isDeck]);

  // Reset selected index when query or filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeFilter, mode]);

  // Auto-scroll selected result into view
  useEffect(() => {
    if (!resultsContainerRef.current) return;
    const selectedEl = resultsContainerRef.current.querySelector('[data-selected="true"]');
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  // Execute AI Workspace Synthesis
  const handleRunAiSynthesis = async (promptQuery) => {
    const targetQ = promptQuery || query;
    if (!targetQ || !targetQ.trim()) return;

    setAiLoading(true);
    setAiResponse(null);
    try {
      const result = await synthesizeWorkspaceKnowledge({
        query: targetQ,
        activeFilter,
        workspaceIndex,
        onCallAi
      });
      setAiResponse(result);
    } catch (err) {
      console.error('Error synthesizing workspace knowledge:', err);
      setAiResponse({
        answer: "Unable to synthesize workspace data at this moment. Please check your query and try again.",
        sources: []
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Handle opening an entity or executing a quick action
  const handleActivateItem = (item) => {
    if (!item) return;
    if (item.type === 'action') {
      const act = item.data;
      if (onQuickAction) {
        onQuickAction(act);
      } else if (onNavigateToEntity) {
        onNavigateToEntity({ workspace: act.targetWorkspace, actionType: act.actionType });
      }
    } else {
      const entity = item.type === 'entity' ? item.data : item;
      if (onNavigateToEntity) {
        onNavigateToEntity(entity);
      }
    }
    onClose();
  };

  // Keyboard navigation handler for the search modal
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }

    if (mode === 'ai') {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleRunAiSynthesis(query);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < flatSelectableItems.length - 1 ? prev + 1 : 0
      );
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : flatSelectableItems.length - 1
      );
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (flatSelectableItems.length > 0 && flatSelectableItems[selectedIndex]) {
        handleActivateItem(flatSelectableItems[selectedIndex]);
      }
      return;
    }
  };

  // Copy synthesized text to clipboard
  const handleCopyAiResponse = () => {
    if (!aiResponse?.answer) return;
    navigator.clipboard?.writeText(aiResponse.answer);
    setCopiedAi(true);
    setTimeout(() => setCopiedAi(false), 2000);
  };

  // Semi-transparent glass surface (rgba 0.78) with 28px backdrop blur and restrained white border
  const backdropClasses = 'bg-slate-900/30 dark:bg-black/55 backdrop-blur-[28px]';
  const surfaceClasses = 'bg-white/[0.78] dark:bg-[#12141a]/[0.80] backdrop-blur-[28px] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.45)] border border-white/60 dark:border-white/[0.12] ring-1 ring-black/[0.04] dark:ring-white/[0.05]';
  const categoryBarClasses = 'bg-white/[0.4] dark:bg-black/[0.2] border-b border-black/[0.04] dark:border-white/[0.06]';
  const footerClasses = 'bg-white/[0.45] dark:bg-black/[0.25] border-t border-black/[0.04] dark:border-white/[0.06]';

  const currentEmptyState = EMPTY_STATE_CONFIG[activeFilter] || EMPTY_STATE_CONFIG.all;
  const EmptyIcon = currentEmptyState.icon;

  return (
    <div
      className={`fixed inset-0 z-[100000] flex items-start justify-center pt-[9vh] sm:pt-[11vh] px-4 pb-6 animate-in fade-in duration-150 select-none ${backdropClasses}`}
      onClick={onClose}
      onKeyDown={handleKeyDown}
      style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
    >
      {/* ── Search Surface Shell (840px wide, 610px high, 16px radius) ── */}
      <div
        className={`w-[840px] max-w-[95vw] h-[610px] max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-[0.98] duration-150 text-slate-900 dark:text-zinc-100 select-text ${surfaceClasses}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Dominant Search / Header (58px height) ── */}
        <div className="h-[58px] flex items-center px-5 border-b border-black/[0.06] dark:border-white/[0.07] gap-3.5 shrink-0 bg-transparent">
          {mode === 'ai' ? (
            <div className="w-6 h-6 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 border border-violet-500/20">
              <RegaarderAiIcon size={14} strokeWidth={1.8} />
            </div>
          ) : (
            <Search size={18} strokeWidth={1.8} className="text-slate-400 dark:text-zinc-500 shrink-0" />
          )}

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (mode === 'ai' && aiResponse) {
                setAiResponse(null);
              }
            }}
            placeholder={
              mode === 'ai'
                ? "Ask anything across workspace memory…"
                : "Search anything in your workspace…"
            }
            className="flex-1 bg-transparent border-none outline-none text-[15px] font-normal text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 tracking-tight"
          />

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 shrink-0 select-none">
            {/* ✦ AI Mode Toggle */}
            <button
              type="button"
              onClick={() => {
                const nextMode = mode === 'ai' ? 'search' : 'ai';
                setMode(nextMode);
                setAiResponse(null);
                setTimeout(() => inputRef.current?.focus(), 20);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all duration-150 active:scale-95 cursor-pointer ${
                mode === 'ai'
                  ? 'bg-violet-600 text-white font-semibold shadow-2xs border border-violet-500'
                  : 'bg-violet-500/10 hover:bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/20 font-medium'
              }`}
              title={mode === 'ai' ? "Switch back to file search" : "Switch to AI knowledge synthesis"}
            >
              <RegaarderAiIcon size={12} strokeWidth={1.8} className={mode === 'ai' ? 'text-white' : 'text-violet-600 dark:text-violet-400'} />
              <span>{mode === 'ai' ? 'Ask AI' : '✦ AI'}</span>
            </button>

            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setAiResponse(null);
                  inputRef.current?.focus();
                }}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors"
                title="Clear input"
              >
                <X size={14} />
              </button>
            )}

            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-[10px] font-mono font-medium text-slate-500 dark:text-zinc-400 border border-slate-200/70 dark:border-zinc-700/60 shadow-2xs">
              ESC
            </kbd>
          </div>
        </div>

        {/* ── Category Navigation Tabs (Apple-style Slightly Rounded Rectangles with Outlines, NO Pills) ── */}
        <div className={`flex items-center justify-between px-5 py-2 shrink-0 overflow-x-auto no-scrollbar gap-2 select-none ${categoryBarClasses}`}>
          <div className="flex items-center gap-1 min-w-max">
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveFilter(tab.id);
                    if (mode === 'ai' && query.trim()) {
                      handleRunAiSynthesis(query);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'border border-slate-200/90 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold shadow-2xs'
                      : 'border border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04] font-medium'
                  }`}
                >
                  <Icon size={13} strokeWidth={1.7} className={isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-zinc-500'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Result Count */}
          {mode === 'search' && query.trim() && searchResults.length > 0 && (
            <div className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 pl-3 shrink-0 whitespace-nowrap">
              {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
            </div>
          )}

          {/* AI Mode indicator */}
          {mode === 'ai' && (
            <div className="text-[10.5px] font-medium text-violet-600 dark:text-violet-400 flex items-center gap-1.5 pl-3 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              <span>Workspace Context Layer</span>
            </div>
          )}
        </div>

        {/* ── Surface Body (Search Mode vs Ask AI Mode) ── */}
        <div
          ref={resultsContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 thin-scrollbar"
        >
          {/* ══════════════════════════════════════════════════════════
              MODE A: ASK AI WORKSPACE SYNTHESIS
             ══════════════════════════════════════════════════════════ */}
          {mode === 'ai' && (
            <div className="space-y-4">
              {!aiResponse && !aiLoading && (
                <div className="space-y-3 py-1">
                  <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-1 font-mono">
                    <RegaarderAiIcon size={12} className="text-violet-600 dark:text-violet-400" />
                    <span>Suggested Prompts</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SUGGESTED_AI_PROMPTS.map((promptText, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setQuery(promptText);
                          handleRunAiSynthesis(promptText);
                        }}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/80 dark:bg-zinc-800/60 hover:bg-white dark:hover:bg-zinc-800 border border-black/[0.06] dark:border-white/[0.08] text-left transition-all group cursor-pointer shadow-2xs hover:border-violet-500/30"
                      >
                        <span className="text-[12.5px] font-medium text-slate-800 dark:text-zinc-200 group-hover:text-violet-700 dark:group-hover:text-violet-300">
                          {promptText}
                        </span>
                        <ArrowRight size={12} className="text-slate-400 group-hover:text-violet-600 transition-transform group-hover:translate-x-0.5 shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {aiLoading && (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center text-violet-600 dark:text-violet-400 animate-spin shadow-2xs border border-violet-200/50 dark:border-violet-800/40">
                    <RefreshCw size={16} />
                  </div>
                  <div className="text-[14px] font-bold text-slate-800 dark:text-zinc-100">
                    Synthesizing cross-workspace memory…
                  </div>
                  <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-sm">
                    Analyzing documents, spreadsheet models, slides, and transcripts for &ldquo;{query}&rdquo;
                  </p>
                </div>
              )}

              {aiResponse && !aiLoading && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="p-4 rounded-xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200/60 dark:border-violet-800/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <RegaarderAiIcon size={14} className="text-violet-600 dark:text-violet-400" />
                        <span className="text-[10.5px] font-bold text-violet-900 dark:text-violet-200 uppercase tracking-wider font-mono">
                          AI Executive Synthesis
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyAiResponse}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-zinc-800 text-[11px] font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 border border-black/[0.08] dark:border-white/[0.1] shadow-2xs transition-colors cursor-pointer"
                      >
                        {copiedAi ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                        <span>{copiedAi ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="text-[13px] text-slate-800 dark:text-zinc-200 leading-relaxed font-normal whitespace-pre-line">
                      {aiResponse.answer}
                    </div>
                  </div>

                  {aiResponse.sources?.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[10.5px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-1 font-mono">
                        Referenced Sources ({aiResponse.sources.length})
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {aiResponse.sources.map((src, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              const entity = workspaceIndex.find(e => e.id === src.id);
                              if (entity) handleActivateItem({ type: 'entity', data: entity });
                            }}
                            className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/70 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 border border-black/[0.06] dark:border-white/[0.08] cursor-pointer transition-colors shadow-2xs"
                          >
                            <div className="w-6 h-6 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] flex items-center justify-center text-slate-700 dark:text-zinc-300 shrink-0 border border-black/[0.04] dark:border-white/[0.05] mt-0.5">
                              <RegaarderProductIcon name={src.workspace} size={12} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[12px] font-semibold text-slate-800 dark:text-zinc-200 truncate">
                                {src.title}
                              </div>
                              <div className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">
                                {src.location}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              MODE B: SEARCH MODE - EMPTY QUERY (Quick Actions & Real Items)
             ══════════════════════════════════════════════════════════ */}
          {mode === 'search' && !query.trim() && (
            <div className="space-y-4">
              {/* Compact Quick Action Chips */}
              <div>
                <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2 px-1 font-mono">
                  <RegaarderAiIcon size={13} className="text-violet-600 dark:text-violet-400" />
                  <span>Quick Actions</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {COMPACT_QUICK_ACTIONS.map((action, idx) => {
                    const isSelected = selectedIndex === idx;
                    const ActionIcon = action.icon;
                    const workspaceBadgeColors = {
                      compose: 'bg-blue-500/12 text-blue-600 dark:text-blue-400',
                      sheets: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400',
                      deck: 'bg-violet-500/12 text-violet-600 dark:text-violet-400',
                      room: 'bg-rose-500/12 text-rose-600 dark:text-rose-400'
                    };
                    const badgeClass = workspaceBadgeColors[action.workspace] || 'bg-violet-500/12 text-violet-600 dark:text-violet-300';

                    return (
                      <button
                        key={action.id}
                        type="button"
                        data-selected={isSelected}
                        onClick={() => handleActivateItem({ type: 'action', data: action })}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`group flex items-center justify-between px-3 py-2 rounded-[10px] text-left transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? 'bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-600 text-slate-900 dark:text-white shadow-xs ring-1 ring-black/[0.04] dark:ring-white/[0.08]'
                            : 'bg-white/[0.55] dark:bg-zinc-800/[0.45] backdrop-blur-md hover:bg-white/80 dark:hover:bg-zinc-800/80 border border-white/70 dark:border-white/[0.08] hover:border-slate-200/80 dark:hover:border-zinc-700 text-slate-700 dark:text-zinc-300 shadow-[0_2px_8px_rgba(0,0,0,0.02)]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${badgeClass}`}>
                            <ActionIcon size={12} strokeWidth={1.8} />
                          </div>
                          <span className="text-[12px] font-medium tracking-tight truncate">{action.title}</span>
                        </div>
                        <kbd className="text-[9.5px] font-mono text-slate-400 dark:text-zinc-500 px-1.5 py-0.5 rounded bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.05] ml-1 shrink-0">
                          {action.shortcut}
                        </kbd>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Real Items: Continue Where You Left Off */}
              {searchResults.length > 0 ? (
                <div>
                  <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2 px-1 font-mono">
                    <RegaarderHistoryIcon size={12} strokeWidth={1.7} className="text-slate-400 dark:text-zinc-500" />
                    <span>Recent Workspace Context</span>
                  </div>
                  <div className="space-y-1">
                    {searchResults.slice(0, 6).map((res, itemIdx) => {
                      const globalIdx = COMPACT_QUICK_ACTIONS.length + itemIdx;
                      const isSelected = selectedIndex === globalIdx;
                      const entity = res.entity;

                      return (
                        <div
                          key={entity.id}
                          data-selected={isSelected}
                          onClick={() => handleActivateItem({ type: 'entity', data: entity })}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                          className={`flex items-center justify-between p-2.5 rounded-xl transition-all duration-150 cursor-pointer ${
                            isSelected
                              ? 'bg-white dark:bg-zinc-800 border border-slate-200/90 dark:border-zinc-700 shadow-2xs'
                              : 'hover:bg-white/60 dark:hover:bg-zinc-800/40 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] flex items-center justify-center text-slate-700 dark:text-zinc-300 shrink-0 border border-black/[0.04] dark:border-white/[0.05]">
                              <RegaarderProductIcon name={entity.workspace} size={13} strokeWidth={1.6} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[13px] font-semibold text-slate-900 dark:text-zinc-100 truncate">
                                  {entity.title}
                                </span>
                                {entity.isCurrent && (
                                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono">
                                    Active
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">
                                {entity.location} • {entity.author}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10.5px] text-slate-400 dark:text-zinc-500 font-mono">
                              {entity.updatedAt}
                            </span>
                            <ArrowRight
                              size={12}
                              className={`transition-transform duration-150 ${
                                isSelected ? 'translate-x-0.5 text-violet-600 dark:text-violet-400' : 'text-slate-300 dark:text-zinc-600'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* ── Context-Aware Minimal Apple Empty State ── */
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl bg-white/60 dark:bg-zinc-800/40 border border-black/[0.05] dark:border-white/[0.06] my-1">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-500 mb-2.5 border border-black/[0.06] dark:border-white/[0.08] shadow-2xs">
                    <EmptyIcon size={16} strokeWidth={1.6} />
                  </div>
                  <h4 className="text-[13px] font-bold text-slate-800 dark:text-zinc-200 mb-1">
                    {currentEmptyState.title}
                  </h4>
                  <p className="text-[11.5px] text-slate-400 dark:text-zinc-500 max-w-xs leading-relaxed">
                    {currentEmptyState.description}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              MODE B: SEARCH MODE - ACTIVE QUERY RESULTS
             ══════════════════════════════════════════════════════════ */}
          {mode === 'search' && query.trim() && searchResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-500 mb-3 border border-black/[0.06] dark:border-white/[0.08] shadow-2xs">
                <Search size={18} strokeWidth={1.6} />
              </div>
              <h4 className="text-[14px] font-bold text-slate-900 dark:text-zinc-100 mb-1">
                No results for &ldquo;{query}&rdquo;
              </h4>
              <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-sm leading-relaxed">
                Check your spelling or switch category tabs to search across all Documents, Sheets, Decks, Tasks, Rooms, and Notes.
              </p>
            </div>
          )}

          {mode === 'search' && query.trim() && searchResults.length > 0 && (
            <div className="space-y-4">
              {groupedResults.map((group) => (
                <div key={group.label} className="space-y-1">
                  {/* Category Section Header with Native Regaarder SVG Icon */}
                  <div className="flex items-center justify-between px-1 mb-1">
                    <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-mono">
                      <RegaarderProductIcon name={group.workspace} size={12} strokeWidth={1.7} />
                      <span>{group.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                      {group.items.length}
                    </span>
                  </div>

                  {/* Results List */}
                  {group.items.map((res) => {
                    const entity = res.entity;
                    const itemGlobalIdx = searchResults.findIndex((r) => r.entity.id === entity.id);
                    const isSelected = selectedIndex === itemGlobalIdx;

                    return (
                      <div
                        key={entity.id}
                        data-selected={isSelected}
                        onClick={() => handleActivateItem({ type: 'entity', data: entity })}
                        onMouseEnter={() => setSelectedIndex(itemGlobalIdx)}
                        className={`group relative flex flex-col p-3 rounded-xl transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? 'bg-white dark:bg-zinc-800 border border-slate-200/90 dark:border-zinc-700 shadow-2xs'
                            : 'bg-white/70 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 border border-black/[0.05] dark:border-white/[0.06]'
                        }`}
                      >
                        {/* Header: Icon + Title + Location + Metadata */}
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <div className="flex items-start gap-2.5 min-w-0">
                            {entity.avatar ? (
                              <img
                                src={entity.avatar}
                                alt={entity.title}
                                className="w-6 h-6 rounded-full object-cover ring-1 ring-black/[0.08] dark:ring-white/[0.1] shrink-0 mt-0.5"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] flex items-center justify-center text-slate-700 dark:text-zinc-300 shrink-0 border border-black/[0.04] dark:border-white/[0.05] mt-0.5">
                                <RegaarderProductIcon name={entity.workspace} size={12} strokeWidth={1.6} />
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-[13px] font-bold text-slate-900 dark:text-zinc-100 truncate">
                                  <HighlightedText text={entity.title} query={query} />
                                </h4>
                                {entity.type === 'person' && entity.role && (
                                  <span className="text-[9.5px] font-medium px-1.5 py-0.2 rounded bg-black/[0.03] dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 shrink-0">
                                    {entity.role}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-medium text-slate-400 dark:text-zinc-500 truncate mt-0.5">
                                <HighlightedText text={entity.location} query={query} />
                                {entity.author && ` • ${entity.author}`}
                              </div>
                            </div>
                          </div>

                          {/* Metric / Formula / Status Pill */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {entity.metadata?.cellValue && (
                              <span className="px-2 py-0.5 text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/70 rounded-md">
                                <HighlightedText text={entity.metadata.cellValue} query={query} />
                              </span>
                            )}
                            {entity.metadata?.priority && (
                              <span className={`px-2 py-0.5 text-[9.5px] font-bold rounded-md uppercase tracking-wider font-mono ${
                                entity.metadata.priority === 'High'
                                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border border-rose-200/60'
                                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 border border-amber-200/60'
                              }`}>
                                {entity.metadata.priority}
                              </span>
                            )}
                            {entity.metadata?.status && (
                              <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 rounded-md">
                                {entity.metadata.status}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Snippet preview with keyword highlighting */}
                        {res.snippet && (
                          <p className="text-[11.5px] text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed pl-8.5 mt-0.5">
                            <HighlightedText text={res.snippet} query={query} />
                          </p>
                        )}

                        {/* Formula row if available */}
                        {entity.metadata?.formula && (
                          <div className="flex items-center gap-1.5 text-[10.5px] font-mono text-slate-700 dark:text-zinc-300 pl-8.5 mt-1">
                            <span className="text-[9px] font-sans font-bold uppercase text-slate-400">Formula:</span>
                            <HighlightedText text={entity.metadata.formula} query={query} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer Cheatsheet Bar ── */}
        <div className={`flex items-center justify-between px-5 py-2.5 text-[11px] text-slate-500 dark:text-zinc-400 shrink-0 ${footerClasses}`}>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] font-mono text-[10px] shadow-2xs">↑↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] font-mono text-[10px] shadow-2xs">↵</kbd>
              <span>Open</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] font-mono text-[10px] shadow-2xs">Esc</kbd>
              <span>Close</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-medium text-slate-400 dark:text-zinc-500 font-mono text-[10.5px]">
            <span>Regaarder Context Search</span>
          </div>
        </div>
      </div>
    </div>
  );
}
