import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search, X, ArrowRight, CornerDownLeft, Sparkles, Send, Copy, Check, RefreshCw
} from 'lucide-react';
import {
  buildWorkspaceIndex,
  queryWorkspace,
  groupResultsByCategory,
  synthesizeWorkspaceKnowledge,
  WORKSPACE_PEOPLE
} from '../../services/GlobalWorkspaceSearchEngine';
import {
  ComposeIcon,
  DeckIcon,
  SheetIcon,
  RoomIcon,
  TasksIcon,
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
  { id: 'all', label: 'All', icon: OrbIcon },
  { id: 'compose', label: 'Docs', icon: ComposeIcon },
  { id: 'sheets', label: 'Sheets', icon: SheetIcon },
  { id: 'deck', label: 'Decks', icon: DeckIcon },
  { id: 'tasks', label: 'Tasks', icon: TasksIcon },
  { id: 'room', label: 'Rooms', icon: RoomIcon },
  { id: 'browser', label: 'Notes', icon: BrowserIcon },
  { id: 'people', label: 'People', icon: PeopleIcon }
];

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

// Suggested Ask AI prompt queries
const SUGGESTED_AI_PROMPTS = [
  "What did we decide about the pricing strategy?",
  "What is our Q3 GPU revenue & margin forecast?",
  "Who is leading hardware supply chain operations?",
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
  const [mode, setMode] = useState(initialMode || 'search');
  const [query, setQuery] = useState(initialQuery || '');
  const [activeFilter, setActiveFilter] = useState(initialFilter || 'all');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // AI Synthesis state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [copiedAi, setCopiedAi] = useState(false);

  const inputRef = useRef(null);
  const resultsContainerRef = useRef(null);

  // Build the complete searchable workspace index
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
      setMode(initialMode || 'search');
      setQuery(initialQuery || '');
      setActiveFilter(initialFilter || 'all');
      setSelectedIndex(0);
      setAiResponse(null);
      setAiLoading(false);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isOpen, initialQuery, initialMode, initialFilter]);

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

  // Check if current workspace is Deck (or dark high-contrast mode)
  const isDeck = productMode === 'deck';

  // Backdrop Scrim:
  // - On Deck (Image 1): Atmospheric dark blur + desaturation + soft dark scrim
  // - On Compose, Sheets, Whiteboard, etc. (Image 2): Luminous light translucent scrim with soft blur
  const backdropClasses = isDeck
    ? 'bg-slate-950/40 dark:bg-black/50 backdrop-blur-[14px] backdrop-saturate-[0.4] backdrop-contrast-[1.05]'
    : 'bg-slate-900/12 dark:bg-black/40 backdrop-blur-[10px] backdrop-saturate-[1.1]';

  // Modal Surface:
  // - On Deck (Image 1): Solid crisp white/zinc surface for maximum contrast against neon graphics
  // - On other apps (Image 2): Pristine luminous frosted glass surface (80% opacity with backdrop blur)
  const surfaceClasses = isDeck
    ? 'bg-white dark:bg-[#161618] rounded-[14px] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.25)] dark:shadow-[0_30px_80px_-15px_rgba(0,0,0,0.8)] border border-slate-200/90 dark:border-zinc-800/90'
    : 'bg-white/80 dark:bg-[#161618]/85 backdrop-blur-2xl rounded-[14px] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.12)] border border-white/90 dark:border-white/10 ring-1 ring-black/5 dark:ring-black/40';

  const categoryBarClasses = isDeck
    ? 'bg-slate-50/50 dark:bg-zinc-900/30 border-b border-slate-200/60 dark:border-zinc-800/60'
    : 'bg-white/40 dark:bg-zinc-900/30 border-b border-white/60 dark:border-zinc-800/40 backdrop-blur-sm';

  const footerClasses = isDeck
    ? 'bg-slate-50/60 dark:bg-zinc-900/40 border-t border-slate-200/60 dark:border-zinc-800/60'
    : 'bg-white/50 dark:bg-zinc-900/40 border-t border-white/60 dark:border-zinc-800/40 backdrop-blur-sm';

  return (
    <div
      className={`fixed inset-0 z-[100000] flex items-start justify-center pt-[9vh] sm:pt-[11vh] px-4 pb-6 animate-in fade-in duration-150 select-none ${backdropClasses}`}
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      {/* ── Search Surface Shell (840px wide, 610px high, 14px restrained radius) ── */}
      <div
        className={`w-[840px] max-w-[95vw] h-[610px] max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-[0.98] duration-150 text-slate-900 dark:text-zinc-100 select-text ${surfaceClasses}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Large Dominant Search / Ask AI Header (60px height) ── */}
        <div className="h-[60px] flex items-center px-5 border-b border-slate-200/40 dark:border-zinc-800/40 gap-3.5 shrink-0 bg-transparent">
          {mode === 'ai' ? (
            <RegaarderAiIcon size={20} className="text-violet-600 dark:text-violet-400 shrink-0" />
          ) : (
            <Search size={20} strokeWidth={2} className="text-slate-400 dark:text-zinc-500 shrink-0" />
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
                ? "Ask anything about your workspace…"
                : "Search anything in your workspace…"
            }
            className="flex-1 bg-transparent border-none outline-none text-[16.5px] font-normal text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 tracking-[-0.01em]"
          />

          {/* Right Action Controls: AI Mode Toggle Pill + Clear + ESC */}
          <div className="flex items-center gap-1.5 shrink-0 select-none">
            {/* ✦ AI Mode Toggle */}
            <button
              type="button"
              onClick={() => {
                const nextMode = mode === 'ai' ? 'search' : 'ai';
                setMode(nextMode);
                setAiResponse(null);
                setTimeout(() => inputRef.current?.focus(), 20);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-95 cursor-pointer ${
                mode === 'ai'
                  ? 'bg-violet-600 text-white shadow-xs border border-violet-500'
                  : 'bg-violet-500/10 hover:bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-500/25'
              }`}
              title={mode === 'ai' ? "Switch back to direct file search" : "Switch to Ask AI workspace knowledge synthesis"}
            >
              <RegaarderAiIcon size={14} strokeWidth={1.8} className={mode === 'ai' ? 'text-white' : 'text-violet-600 dark:text-violet-400'} />
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
                <X size={15} />
              </button>
            )}

            <kbd className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-white/80 dark:bg-zinc-800/80 text-[10.5px] font-mono font-medium text-slate-500 dark:text-zinc-400 border border-slate-200/70 dark:border-zinc-700/60 shadow-2xs">
              ESC
            </kbd>
          </div>
        </div>

        {/* ── Category Navigation Tabs (Light & Compact with Subtle Purple Active State) ── */}
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
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[12px] rounded-lg transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-violet-500/10 text-violet-700 dark:text-violet-300 font-semibold border border-violet-500/25 shadow-2xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-white/60 dark:hover:bg-zinc-800/40 border border-transparent font-medium'
                  }`}
                >
                  <Icon size={13} strokeWidth={1.7} className={isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-zinc-500'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Result Count in search mode when search query exists */}
          {mode === 'search' && query.trim() && searchResults.length > 0 && (
            <div className="text-[11.5px] font-medium text-slate-400 dark:text-zinc-500 pl-3 shrink-0 whitespace-nowrap">
              {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
            </div>
          )}

          {/* AI Mode indicator */}
          {mode === 'ai' && (
            <div className="text-[11px] font-medium text-violet-600 dark:text-violet-400 flex items-center gap-1 pl-3 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              <span>Workspace Knowledge Layer</span>
            </div>
          )}
        </div>

        {/* ── Surface Body (Search Mode vs Ask AI Mode) ── */}
        <div
          ref={resultsContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 thin-scrollbar"
        >
          {/* ══════════════════════════════════════════════════════════════════════
              MODE A: ASK AI MODE (Workspace Cross-Synthesis & Clickable Sources)
             ══════════════════════════════════════════════════════════════════════ */}
          {mode === 'ai' && (
            <div className="space-y-4">
              {/* If no answer yet and not loading, show suggestions & guidance */}
              {!aiLoading && !aiResponse && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-violet-500/5 dark:bg-violet-500/10 border border-violet-500/15 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <RegaarderAiIcon size={16} />
                    </div>
                    <div>
                      <h4 className="text-[13.5px] font-semibold text-slate-900 dark:text-zinc-100">
                        Ask AI across your entire workspace
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed mt-0.5">
                        Ask questions in natural language. Regaarder AI analyzes and synthesizes answers across your active Documents, Spreadsheets, Presentations, Tasks, and Meeting Transcripts.
                      </p>
                    </div>
                  </div>

                  {/* Suggested Question Chips */}
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2 px-1">
                      <Sparkles size={12} className="text-violet-500" />
                      <span>Suggested questions</span>
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
                          className="p-3 text-left rounded-xl bg-white/80 dark:bg-zinc-800/40 hover:bg-white dark:hover:bg-zinc-800/70 border border-white/90 dark:border-zinc-700/50 hover:border-violet-300 dark:hover:border-violet-700 shadow-2xs transition-all duration-150 group cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[12.5px] font-medium text-slate-700 dark:text-zinc-300 group-hover:text-violet-700 dark:group-hover:text-violet-300">
                              {promptText}
                            </span>
                            <ArrowRight size={13} className="text-slate-300 dark:text-zinc-600 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* AI Loading State */}
              {aiLoading && (
                <div className="flex flex-col items-center justify-center py-14 px-4 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-violet-50/80 dark:bg-violet-950/50 border border-violet-200/70 dark:border-violet-800/60 flex items-center justify-center text-violet-600 dark:text-violet-400 shadow-sm animate-pulse">
                    <RegaarderAiIcon size={24} className="animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-[14.5px] font-semibold text-slate-900 dark:text-zinc-100">
                      Synthesizing workspace knowledge…
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                      Grounding across documents, spreadsheet formulas, slide metrics, and team transcripts.
                    </p>
                  </div>
                </div>
              )}

              {/* AI Synthesized Answer & Clickable Source Cards */}
              {!aiLoading && aiResponse && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Executive Synthesized Answer Box */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-white/80 dark:border-zinc-800/60 shadow-xs">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-200/50 dark:border-zinc-800/50 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-violet-600 text-white flex items-center justify-center">
                          <RegaarderAiIcon size={13} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
                          Workspace Synthesis
                        </span>
                        {activeFilter !== 'all' && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-violet-100/80 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 uppercase">
                            Filtered: {activeFilter}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleCopyAiResponse}
                          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60 transition-colors"
                        >
                          {copiedAi ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          <span>{copiedAi ? 'Copied' : 'Copy'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRunAiSynthesis(query)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-md transition-colors"
                          title="Re-synthesize answer"
                        >
                          <RefreshCw size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Markdown structured answer body */}
                    <div className="text-[13.5px] text-slate-800 dark:text-zinc-200 leading-relaxed space-y-2 whitespace-pre-line font-normal">
                      {aiResponse.answer}
                    </div>
                  </div>

                  {/* Clearly Visible, Clickable Source Cards */}
                  {aiResponse.sources && aiResponse.sources.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2 px-1">
                        <OrbIcon size={13} className="text-slate-400" />
                        <span>Referenced Workspace Sources ({aiResponse.sources.length})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {aiResponse.sources.map((src) => (
                          <div
                            key={src.id}
                            onClick={() => handleActivateItem({ type: 'entity', data: src.entity })}
                            className="flex items-center justify-between p-3 rounded-xl bg-white/85 dark:bg-zinc-900/80 border border-white/90 dark:border-zinc-800/80 hover:border-violet-400 dark:hover:border-violet-600 shadow-2xs hover:shadow-xs transition-all duration-150 group cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-slate-100/80 dark:bg-zinc-800/80 flex items-center justify-center text-slate-700 dark:text-zinc-300 shrink-0 border border-slate-200/50 dark:border-zinc-700/50 group-hover:text-violet-600">
                                <RegaarderProductIcon name={src.workspace} size={14} />
                              </div>
                              <div className="min-w-0">
                                <div className="text-[12.5px] font-semibold text-slate-900 dark:text-zinc-100 truncate group-hover:text-violet-700 dark:group-hover:text-violet-300">
                                  {src.title}
                                </div>
                                <div className="text-[10.5px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">
                                  {src.location || src.workspace}
                                </div>
                              </div>
                            </div>

                            <ArrowRight size={13} className="text-slate-300 dark:text-zinc-600 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              MODE B: SEARCH MODE (DEFAULT LAYOUT: Quick Actions & Continue Recent)
             ══════════════════════════════════════════════════════════════════════ */}
          {mode === 'search' && !query.trim() && (
            <div className="space-y-4 select-none">
              {/* Quick Action Chips (Shown only when not typing - exact Image 2 bright white tiles) */}
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2 px-1">
                  <RegaarderAiIcon size={14} className="text-violet-600 dark:text-violet-400" />
                  <span>Quick Actions</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {COMPACT_QUICK_ACTIONS.map((action, idx) => {
                    const isSelected = selectedIndex === idx;
                    const ActionIcon = action.icon;
                    return (
                      <button
                        key={action.id}
                        type="button"
                        data-selected={isSelected}
                        onClick={() => handleActivateItem({ type: 'action', data: action })}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? 'bg-violet-500/10 dark:bg-violet-500/20 border border-violet-500/35 text-violet-700 dark:text-violet-300 shadow-2xs'
                            : isDeck
                            ? 'bg-slate-50/80 dark:bg-zinc-800/40 hover:bg-slate-100 dark:hover:bg-zinc-800/70 border border-slate-200/60 dark:border-zinc-800/60 text-slate-700 dark:text-zinc-300'
                            : 'bg-white/85 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800/80 border border-white/90 dark:border-zinc-700/50 text-slate-700 dark:text-zinc-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <ActionIcon size={14} strokeWidth={1.7} className="text-violet-600 dark:text-violet-400 shrink-0" />
                          <span className="text-[12px] font-medium truncate">{action.title}</span>
                        </div>
                        <kbd className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 px-1 py-0.5 rounded bg-white/70 dark:bg-zinc-800/70 border border-slate-200/50 dark:border-zinc-700/50 ml-1 shrink-0">
                          {action.shortcut}
                        </kbd>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Continue Where You Left Off Section */}
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2 px-1">
                  <RegaarderHistoryIcon size={13} strokeWidth={1.7} className="text-slate-400 dark:text-zinc-500" />
                  <span>Continue where you left off</span>
                </div>
                <div className="space-y-1">
                  {searchResults.slice(0, 5).map((res, itemIdx) => {
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
                            ? 'bg-violet-500/8 dark:bg-violet-500/15 border border-violet-500/25 shadow-2xs'
                            : 'hover:bg-white/50 dark:hover:bg-zinc-800/40 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-white/80 dark:bg-zinc-800/80 flex items-center justify-center text-slate-700 dark:text-zinc-300 shrink-0 border border-white/80 dark:border-zinc-700/50 shadow-2xs">
                            <RegaarderProductIcon name={entity.workspace} size={14} strokeWidth={1.6} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-semibold text-slate-900 dark:text-zinc-100 truncate">
                                {entity.title}
                              </span>
                              {entity.isCurrent && (
                                <span className="text-[9.5px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                                  Active Now
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">
                              {entity.location} • {entity.author}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-slate-400 dark:text-zinc-500">
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

              {/* People & Teammates Directory */}
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2 px-1">
                  <PeopleIcon size={13} strokeWidth={1.7} className="text-slate-400 dark:text-zinc-500" />
                  <span>Teammates & Collaborators</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {WORKSPACE_PEOPLE.slice(0, 4).map((person) => (
                    <div
                      key={person.id}
                      onClick={() => handleActivateItem({ type: 'entity', data: person })}
                      className="flex items-center gap-2.5 p-2 rounded-lg bg-white/60 dark:bg-zinc-800/40 hover:bg-white/90 dark:hover:bg-zinc-800/70 border border-white/70 dark:border-zinc-800/50 cursor-pointer transition-colors shadow-2xs"
                    >
                      <img
                        src={person.avatar}
                        alt={person.title}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-zinc-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-[12px] font-semibold text-slate-800 dark:text-zinc-200 truncate">
                          {person.title}
                        </div>
                        <div className="text-[10.5px] text-slate-400 dark:text-zinc-500 truncate">
                          {person.role}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              MODE B: SEARCH MODE (ACTIVE QUERY TYPING: Quick Actions Collapsed)
             ══════════════════════════════════════════════════════════════════════ */}
          {mode === 'search' && query.trim() && searchResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-11 h-11 rounded-xl bg-white/80 dark:bg-zinc-800/80 flex items-center justify-center text-slate-400 dark:text-zinc-500 mb-3 border border-white/80 dark:border-zinc-700/50 shadow-2xs">
                <Search size={20} strokeWidth={1.5} />
              </div>
              <h4 className="text-[14.5px] font-semibold text-slate-900 dark:text-zinc-100 mb-1">
                No results for &ldquo;{query}&rdquo;
              </h4>
              <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-sm leading-relaxed mb-3">
                Check your spelling or switch category tabs to search across all Documents, Sheets, Decks, Tasks, Rooms, and Notes.
              </p>
              <button
                type="button"
                onClick={() => {
                  setMode('ai');
                  handleRunAiSynthesis(query);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold shadow-xs hover:bg-violet-700 transition-colors"
              >
                <RegaarderAiIcon size={14} />
                <span>Ask AI about &ldquo;{query}&rdquo;</span>
              </button>
            </div>
          )}

          {mode === 'search' && query.trim() && searchResults.length > 0 && (
            <div className="space-y-4">
              {groupedResults.map((group) => (
                <div key={group.label} className="space-y-1">
                  {/* Category Section Header with Native Regaarder SVG Icon */}
                  <div className="flex items-center justify-between px-1 mb-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      <RegaarderProductIcon name={group.workspace} size={13} strokeWidth={1.7} />
                      <span>{group.label}</span>
                    </div>
                    <span className="text-[10.5px] font-medium text-slate-400 dark:text-zinc-500">
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
                            ? 'bg-violet-500/8 dark:bg-violet-500/15 border border-violet-500/25 shadow-2xs'
                            : 'bg-white/70 dark:bg-zinc-800/30 hover:bg-white/95 dark:hover:bg-zinc-800/60 border border-white/80 dark:border-zinc-800/40 shadow-2xs'
                        }`}
                      >
                        {/* Header: Icon + Title + Location + Metadata */}
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <div className="flex items-start gap-2.5 min-w-0">
                            {entity.avatar ? (
                              <img
                                src={entity.avatar}
                                alt={entity.title}
                                className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 dark:ring-zinc-700 shrink-0 mt-0.5"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-md bg-white dark:bg-zinc-800 flex items-center justify-center text-slate-700 dark:text-zinc-300 shrink-0 border border-slate-200/60 dark:border-zinc-700/60 shadow-2xs mt-0.5">
                                <RegaarderProductIcon name={entity.workspace} size={13} strokeWidth={1.6} />
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-[13.5px] font-semibold text-slate-900 dark:text-zinc-100 truncate">
                                  <HighlightedText text={entity.title} query={query} />
                                </h4>
                                {entity.type === 'person' && entity.role && (
                                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/80 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 shrink-0 border border-slate-200/50">
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
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                                entity.metadata.priority === 'High'
                                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border border-rose-200/60'
                                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 border border-amber-200/60'
                              }`}>
                                {entity.metadata.priority}
                              </span>
                            )}
                            {entity.metadata?.status && (
                              <span className="px-2 py-0.5 text-[10px] font-medium bg-white/80 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 rounded-md border border-slate-200/50">
                                {entity.metadata.status}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Snippet preview with keyword highlighting */}
                        {res.snippet && (
                          <p className="text-[12px] text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed pl-8.5 mt-0.5">
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
        <div className={`flex items-center justify-between px-5 py-2.5 text-[11px] text-slate-500 dark:text-zinc-400 shrink-0 select-none ${footerClasses}`}>
          <div className="flex items-center gap-3">
            {mode === 'ai' ? (
              <>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/90 dark:bg-zinc-800/80 border border-slate-200/70 dark:border-zinc-700/60 font-mono text-[10px] shadow-2xs">↵</kbd>
                  <span>Ask AI</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/90 dark:bg-zinc-800/80 border border-slate-200/70 dark:border-zinc-700/60 font-mono text-[10px] shadow-2xs">Esc</kbd>
                  <span>Close</span>
                </span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/90 dark:bg-zinc-800/80 border border-slate-200/70 dark:border-zinc-700/60 font-mono text-[10px] shadow-2xs">↑↓</kbd>
                  <span>Navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/90 dark:bg-zinc-800/80 border border-slate-200/70 dark:border-zinc-700/60 font-mono text-[10px] shadow-2xs">↵</kbd>
                  <span>Open</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/90 dark:bg-zinc-800/80 border border-slate-200/70 dark:border-zinc-700/60 font-mono text-[10px] shadow-2xs">Esc</kbd>
                  <span>Close</span>
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 font-medium text-slate-400 dark:text-zinc-500">
            <span>Regaarder Workspace Search</span>
          </div>
        </div>
      </div>
    </div>
  );
}
