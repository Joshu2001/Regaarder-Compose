import { useTranslation } from '../../i18n';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search, X, ArrowRight, CornerDownLeft, Copy, Check, RefreshCw,
  Clock, FileText, Database, ShieldCheck, Compass,
  Palette, Type, Plus, Trash2, Sliders, ExternalLink, BookmarkCheck,
  Tag, Lightbulb, HelpCircle, Upload, FileUp, UserCheck, ChevronDown,
  Sparkles
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
  RegaarderProductIcon,
  RegaarderQuickActionIcon,
  RegaarderHapticIcon
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

// Suggested Ask Memory prompt queries
const SUGGESTED_AI_PROMPTS = [
  "Summarize key decisions across recent documents",
  "Review open financial models and spreadsheet metrics",
  "Apply active brand guidelines to my recent presentation",
  "Show high-priority tasks and upcoming deadlines"
];

// Pre-built Executive Agentic Personas (Claude / ChatGPT style)
const PRESET_PERSONAS = [
  {
    id: 'peter-thiel',
    name: 'Peter Thiel',
    badge: 'Contrarian & Zero-to-One',
    instructions: 'Challenge conventional consensus. Demand secret truths, network effects, and proprietary durability. Avoid corporate buzzwords, incrementalism, and cosmetic fluff.'
  },
  {
    id: 'steve-jobs',
    name: 'Steve Jobs',
    badge: 'Apple Product Minimalist',
    instructions: 'Focus ruthlessly on elegance, taste, and restraint. Eliminate unnecessary UI clutter. Demand seamless craftsmanship, refined typography, and emotional user delight.'
  },
  {
    id: 'quant-analyst',
    name: 'Quant Analyst',
    badge: 'Wall Street Metric Rigor',
    instructions: 'Analyze spreadsheet formulas, financial margins, and unit economics with strict mathematical rigor. Every statement must be backed by data and formulas.'
  },
  {
    id: 'executive-editor',
    name: 'Executive Editor',
    badge: 'Concise & Structured',
    instructions: 'Communicate with executive brevity. Use clean tables, bold takeaways, and actionable bullet points. Cut preamble and redundant text.'
  }
];

// Default executive brand rules and styling guidelines
const INITIAL_BRAND_RULES = [
  { id: 'rule-font', label: 'Primary Typography', value: 'Inter & SF Pro System Font', category: 'typography' },
  { id: 'rule-color', label: 'Brand Color', value: 'Regaarder Violet (#7C3AED)', category: 'palette' },
  { id: 'rule-tone', label: 'Voice & Tone', value: 'Executive, concise, and analytical', category: 'voice' },
  { id: 'rule-grid', label: 'Design System', value: '8pt Precision Matrix • 16px Corners', category: 'layout' }
];

// Semantic Markdown Parser: Decomposes Markdown documents into categorized individual memory cards
function parseMarkdownToGuidelines(markdownText) {
  if (!markdownText || typeof markdownText !== 'string') return [];
  
  const lines = markdownText.split(/\r?\n/);
  const guidelines = [];
  let currentCategory = 'guideline';

  const categoryKeywords = {
    typography: /(typography|font|type|typeface|text style|heading)/i,
    palette: /(color|palette|hex|swatch|accent|theme|styling)/i,
    voice: /(voice|tone|persona|communication|style guide|author)/i,
    rules: /(rule|do'?s?|don'?t?s?|guideline|instruction|constraint|requirement|never|always)/i,
    layout: /(layout|grid|spacing|margin|padding|radius|dimension|matrix)/i
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    // Check header line for category context (# Typography, ## Brand Colors, etc.)
    const headerMatch = rawLine.match(/^#{1,4}\s+(.+)$/);
    if (headerMatch) {
      const headerTitle = headerMatch[1].trim();
      for (const [cat, regex] of Object.entries(categoryKeywords)) {
        if (regex.test(headerTitle)) {
          currentCategory = cat;
          break;
        }
      }
      continue;
    }

    // Check key: value pairs (e.g. "**Primary Color:** #7C3AED", "- Font: Inter", "Tone: Concise")
    const kvMatch = rawLine.match(/^[-*•]?\s*\*{0,2}([^:*]+)\*{0,2}\s*:\s*(.+)$/);
    if (kvMatch) {
      const label = kvMatch[1].trim().replace(/\*{1,2}/g, '');
      const value = kvMatch[2].trim().replace(/\*{1,2}/g, '');
      if (label.length > 0 && value.length > 0) {
        let cat = currentCategory;
        for (const [c, regex] of Object.entries(categoryKeywords)) {
          if (regex.test(label) || regex.test(value)) {
            cat = c;
            break;
          }
        }
        guidelines.push({
          id: 'rule-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
          label,
          value,
          category: cat,
          source: 'md-extract'
        });
        continue;
      }
    }

    // Check bullet points or numbered lists
    const bulletMatch = rawLine.match(/^[-*•\d.]+\s+(.+)$/);
    if (bulletMatch) {
      const statement = bulletMatch[1].trim();
      if (statement.length > 5) {
        let cat = currentCategory;
        if (/always|never|must|should|don't|do not/i.test(statement)) {
          cat = 'rules';
        }
        const words = statement.split(' ');
        const label = words.slice(0, 3).join(' ');
        const value = words.slice(3).join(' ') || statement;
        guidelines.push({
          id: 'rule-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
          label: label.charAt(0).toUpperCase() + label.slice(1),
          value: value,
          category: cat,
          source: 'md-extract'
        });
      }
    }
  }

  return guidelines;
}

// Ambient learned user habits across workspace
const LEARNED_HABITS = [
  { id: 'h-1', title: 'Calculations', desc: 'Frequently inspects SUM & AVERAGE formulas in Sheets', icon: SheetIcon },
  { id: 'h-2', title: 'Export Habits', desc: 'Prefers Excel (.xlsx) and clean PDF with dark backdrops', icon: ComposeIcon },
  { id: 'h-3', title: 'Micro-Interactions', desc: 'Uses 100ms transitions and unblurred live canvas inspectors', icon: RegaarderHapticIcon }
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

  // Active Agentic Persona State
  const [activePersona, setActivePersona] = useState(() => {
    try {
      const saved = localStorage.getItem('regaarder_active_persona');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load active persona:', e);
    }
    return PRESET_PERSONAS[0];
  });

  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);

  // Workspace Brand Rules & Guidelines state (persisted on device in localStorage)
  const [brandRules, setBrandRules] = useState(() => {
    try {
      const saved = localStorage.getItem('regaarder_workspace_brand_rules');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load brand rules:', e);
    }
    return INITIAL_BRAND_RULES;
  });

  // Markdown Upload & Edit Modal State with on-device raw preservation
  const [isMdModalOpen, setIsMdModalOpen] = useState(false);
  const [mdInputText, setMdInputText] = useState('');
  const fileInputRef = useRef(null);

  const inputRef = useRef(null);
  const resultsContainerRef = useRef(null);

  // Save brand rules to localStorage on update
  useEffect(() => {
    try {
      localStorage.setItem('regaarder_workspace_brand_rules', JSON.stringify(brandRules));
    } catch (e) {
      console.warn('Failed to persist brand rules:', e);
    }
  }, [brandRules]);

  // Save active persona to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('regaarder_active_persona', JSON.stringify(activePersona));
    } catch (e) {
      console.warn('Failed to persist active persona:', e);
    }
  }, [activePersona]);

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
      setIsMdModalOpen(false);
      setIsPersonaMenuOpen(false);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isOpen, initialQuery, initialMode, initialFilter, isDeck]);

  // Pre-fill raw Markdown text from device when opening the modal
  useEffect(() => {
    if (isMdModalOpen && !mdInputText) {
      try {
        const savedMd = localStorage.getItem('regaarder_raw_brand_markdown');
        if (savedMd) setMdInputText(savedMd);
      } catch (e) {
        console.warn('Failed to load raw markdown from device:', e);
      }
    }
  }, [isMdModalOpen, mdInputText]);

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

  // Handle Markdown file upload from disk with 100% on-device persistence
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        try {
          localStorage.setItem('regaarder_raw_brand_markdown', content);
        } catch (err) {
          console.warn('Failed to save raw md to device:', err);
        }
        const extracted = parseMarkdownToGuidelines(content);
        if (extracted.length > 0) {
          setBrandRules(prev => [...prev, ...extracted]);
          setIsMdModalOpen(false);
        } else {
          setMdInputText(content);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Handle applying pasted Markdown into individual extracted guidelines with on-device persistence
  const handleApplyPastedMarkdown = () => {
    if (!mdInputText.trim()) return;
    try {
      localStorage.setItem('regaarder_raw_brand_markdown', mdInputText);
    } catch (err) {
      console.warn('Failed to save raw md to device:', err);
    }
    const extracted = parseMarkdownToGuidelines(mdInputText);
    if (extracted.length > 0) {
      setBrandRules(prev => [...prev, ...extracted]);
      setIsMdModalOpen(false);
    }
  };

  // Remove an individual guideline
  const handleRemoveBrandRule = (ruleId) => {
    setBrandRules(prev => prev.filter(r => r.id !== ruleId));
  };

  // Execute AI Workspace Synthesis with persona and extracted brand memory context
  const handleRunAiSynthesis = async (promptQuery) => {
    const targetQ = promptQuery || query;
    if (!targetQ || !targetQ.trim()) return;

    setAiLoading(true);
    setAiResponse(null);
    try {
      const brandContextSnippet = brandRules.map(r => `${r.label}: ${r.value}`).join('; ');
      const contextualQuery = `[Agentic Persona: ${activePersona.name} (${activePersona.badge}) - Instruction: ${activePersona.instructions}] [Workspace Brand Rules: ${brandContextSnippet}] Query: ${targetQ}`;

      const result = await synthesizeWorkspaceKnowledge({
        query: contextualQuery,
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
      if (isMdModalOpen) {
        setIsMdModalOpen(false);
        return;
      }
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

  // Category badge color helper for extracted guidelines
  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'typography':
        return 'bg-violet-100/80 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border-violet-200/60';
      case 'palette':
        return 'bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/60';
      case 'voice':
        return 'bg-blue-100/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/60';
      case 'rules':
        return 'bg-amber-100/80 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/60';
      case 'layout':
      default:
        return 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200/60 dark:border-zinc-700';
    }
  };

  // Frosted Apple glass surface with 36px backdrop blur
  const backdropClasses = 'bg-slate-900/35 dark:bg-black/60 backdrop-blur-[24px]';
  const surfaceClasses = 'bg-white/[0.88] dark:bg-[#14161f]/[0.88] backdrop-blur-[36px] rounded-2xl shadow-[0_32px_90px_rgba(0,0,0,0.18),0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.65)] border border-white/70 dark:border-white/[0.12] ring-1 ring-black/[0.05] dark:ring-white/[0.06]';
  const categoryBarClasses = 'bg-white/[0.45] dark:bg-black/[0.22] border-b border-black/[0.05] dark:border-white/[0.07]';
  const footerClasses = 'bg-white/[0.45] dark:bg-black/[0.25] border-t border-black/[0.05] dark:border-white/[0.07]';

  return (
    <div
      className={`fixed inset-0 z-[100000] flex items-start justify-center pt-[7vh] sm:pt-[9vh] px-4 pb-6 animate-in fade-in duration-150 select-none ${backdropClasses}`}
      onClick={onClose}
      onKeyDown={handleKeyDown}
      style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
    >
      {/* ── Search Surface Shell (920px wide, 650px high, 16px radius) ── */}
      <div
        className={`w-[920px] max-w-[95vw] h-[650px] max-h-[88vh] overflow-hidden flex flex-col animate-in zoom-in-[0.98] duration-150 text-slate-900 dark:text-zinc-100 select-text ${surfaceClasses}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Dominant Search / Header (62px height) ── */}
        <div className="h-[62px] flex items-center px-5 border-b border-black/[0.06] dark:border-white/[0.07] gap-3.5 shrink-0 bg-transparent">
          {mode === 'ai' ? (
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs ring-1 ring-violet-500/30">
              <RegaarderAiIcon size={16} strokeWidth={2.0} />
            </div>
          ) : (
            <Search size={19} strokeWidth={1.8} className="text-slate-400 dark:text-zinc-500 shrink-0" />
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
                ? (t('search.askAnything') || `Ask Memory as ${activePersona.name} across workspace files & guidelines…`) 
                : (t('search.searchAnything') || 'Search anything across workspace memory…')
            }
            className="flex-1 bg-transparent border-none outline-none text-[15.5px] font-normal text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 tracking-tight"
          />

          {/* Right Action Controls: Clear, Persona Switcher & Apple Dual Switch */}
          <div className="flex items-center gap-2.5 shrink-0 select-none">
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

            {/* ── Apple-Style Segmented Mode Switcher: Search vs Ask Memory with Regaarder Signature Orbit ── */}
            <div className="flex items-center p-0.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.05] dark:border-white/[0.06]">
              <button
                type="button"
                onClick={() => {
                  setMode('search');
                  setAiResponse(null);
                  setTimeout(() => inputRef.current?.focus(), 20);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  mode === 'search'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xs ring-1 ring-black/[0.06] dark:ring-white/[0.08]'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                <Search size={12} strokeWidth={2} className={mode === 'search' ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'} />
                <span>Search</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('ai');
                  setTimeout(() => inputRef.current?.focus(), 20);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                  mode === 'ai'
                    ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 text-white shadow-xs ring-1 ring-violet-500/50'
                    : 'text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:bg-violet-500/10'
                }`}
              >
                <RegaarderAiIcon size={13} strokeWidth={2.0} className={mode === 'ai' ? 'text-white' : 'text-violet-500'} />
                <span>Ask Memory</span>
              </button>
            </div>

            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-[10px] font-mono font-medium text-slate-500 dark:text-zinc-400 border border-slate-200/70 dark:border-zinc-700/60 shadow-2xs ml-0.5">
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
                      ? 'border border-slate-200/90 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold shadow-2xs outline outline-1 outline-violet-500/40'
                      : 'border border-transparent text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] font-medium'
                  }`}
                >
                  <Icon size={13} strokeWidth={1.7} className={isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-zinc-500'} />
                  <span>{tab.id === 'all' ? (t('common.all') || 'All') : (tab.id === 'compose' ? (t('nav.docs') || t('nav.compose') || 'Docs') : (tab.id === 'browser' ? (t('nav.notes') || t('nav.browser') || 'Notes') : (t('nav.' + tab.id) || tab.label)))}</span>
                </button>
              );
            })}
          </div>

          {/* Persona Selector Badge */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsPersonaMenuOpen(prev => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/10 hover:bg-violet-500/15 border border-violet-500/25 text-violet-700 dark:text-violet-300 text-[11.5px] font-semibold transition-colors cursor-pointer shadow-2xs"
              title="Active Agentic Persona"
            >
              <UserCheck size={12} strokeWidth={2.2} />
              <span>Active Lens: {activePersona.name}</span>
              <ChevronDown size={10} className={`transition-transform duration-150 ${isPersonaMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isPersonaMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-68 rounded-xl border border-slate-200/90 dark:border-zinc-700 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 font-sans text-left">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 font-mono">
                  Select Cognitive Lens
                </div>
                {PRESET_PERSONAS.map((p) => {
                  const isSel = activePersona.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setActivePersona(p);
                        setIsPersonaMenuOpen(false);
                      }}
                      className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors cursor-pointer ${
                        isSel ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-900 dark:text-violet-200 font-semibold' : 'hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                      }`}
                    >
                      <div className="w-5 h-5 rounded flex items-center justify-center bg-violet-500/15 text-violet-700 dark:text-violet-300 font-bold text-[9.5px] shrink-0 mt-0.5 font-mono">
                        {p.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold">{p.name}</div>
                        <div className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">{p.badge}</div>
                      </div>
                      {isSel && <Check size={12} className="text-violet-600 mt-1" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Surface Body (Search Mode vs Ask Memory Mode) ── */}
        <div
          ref={resultsContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 thin-scrollbar"
        >
          {/* ══════════════════════════════════════════════════════════
              MODE A: ASK MEMORY WORKSPACE SYNTHESIS
             ══════════════════════════════════════════════════════════ */}
          {mode === 'ai' && (
            <div className="space-y-4">
              {!aiResponse && !aiLoading && (
                <div className="space-y-4 py-1">
                  {/* Executive AI Intro Banner */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-transparent border border-violet-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-violet-600 text-white flex items-center justify-center shadow-xs">
                        <RegaarderAiIcon size={18} strokeWidth={2.0} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-[13.5px] font-bold text-slate-900 dark:text-zinc-100">
                            Workspace Intelligence & Persona Layer
                          </h4>
                          <span className="text-[9.5px] font-bold uppercase px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-mono">
                            {activePersona.name} Active
                          </span>
                        </div>
                        <p className="text-[11.5px] text-slate-500 dark:text-zinc-400 mt-0.5">
                          Synthesizes documents, calculation formulas, slide decks, and active brand rules.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-1 font-mono">
                      <RegaarderAiIcon size={12} className="text-violet-600 dark:text-violet-400" />
                      <span>Suggested Knowledge Queries</span>
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
                </div>
              )}

              {aiLoading && (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                    <RegaarderAiIcon size={20} strokeWidth={2.0} className="animate-spin" />
                  </div>
                  <div className="text-[14.5px] font-bold text-slate-800 dark:text-zinc-100">
                    Synthesizing Workspace Memory as {activePersona.name}…
                  </div>
                  <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-sm leading-relaxed">
                    Analyzing documents, spreadsheet formulas, slide decks, and active brand guidelines for &ldquo;{query}&rdquo;
                  </p>
                </div>
              )}

              {aiResponse && !aiLoading && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="p-4.5 rounded-xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200/60 dark:border-violet-800/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <RegaarderAiIcon size={14} className="text-violet-600 dark:text-violet-400" />
                        <span className="text-[10.5px] font-bold text-violet-900 dark:text-violet-200 uppercase tracking-wider font-mono">
                          Executive Synthesis ({activePersona.name})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyAiResponse}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-[11px] font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 border border-black/[0.08] dark:border-white/[0.1] shadow-2xs transition-colors cursor-pointer"
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
              MODE B: SEARCH MODE - EMPTY QUERY (Unified Streamlined Layout)
             ══════════════════════════════════════════════════════════ */}
          {mode === 'search' && !query.trim() && (
            <div className="space-y-4">
              {/* Primary Quick Actions: Sleek Unified Apple Segmented Strip */}
              <div className="rounded-xl bg-white/60 dark:bg-zinc-800/40 border border-black/[0.05] dark:border-white/[0.06] p-1.5 shadow-2xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                  {COMPACT_QUICK_ACTIONS.map((action, idx) => {
                    const isSelected = selectedIndex === idx;
                    const ActionIcon = action.icon;
                    const workspaceBadgeColors = {
                      compose: 'text-blue-600 dark:text-blue-400 bg-blue-500/10',
                      sheets: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
                      deck: 'text-violet-600 dark:text-violet-400 bg-violet-500/10',
                      room: 'text-rose-600 dark:text-rose-400 bg-rose-500/10'
                    };
                    const badgeClass = workspaceBadgeColors[action.workspace] || 'text-violet-600 dark:text-violet-400 bg-violet-500/10';

                    return (
                      <button
                        key={action.id}
                        type="button"
                        data-selected={isSelected}
                        onClick={() => handleActivateItem({ type: 'action', data: action })}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs ring-1 ring-black/[0.06] dark:ring-white/[0.08]'
                            : 'hover:bg-white/70 dark:hover:bg-zinc-800/70 text-slate-700 dark:text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${badgeClass}`}>
                            <ActionIcon size={11} strokeWidth={1.8} />
                          </div>
                          <span className="text-[11.5px] font-medium tracking-tight truncate">
                            {t('quickActions.' + (action.id === 'action-new-doc' ? 'newDoc' : action.id === 'action-new-sheet' ? 'newSheet' : action.id === 'action-new-deck' ? 'newDeck' : 'startRoom')) || action.title}
                          </span>
                        </div>
                        <kbd className="text-[9px] font-mono text-slate-400 dark:text-zinc-500 px-1.5 py-0.2 rounded bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.05] ml-1 shrink-0">
                          {action.shortcut}
                        </kbd>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Executive Hero Card: Workspace Brand Guidelines & Ambient Memory ── */}
              <div className="rounded-xl bg-white/75 dark:bg-zinc-800/55 border border-black/[0.06] dark:border-white/[0.08] overflow-hidden shadow-xs">
                {/* Header with Title, Rule Counter and Upload / Paste Triggers */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/[0.05] dark:border-white/[0.06] bg-black/[0.015] dark:bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <RegaarderAiIcon size={13} className="text-violet-600 dark:text-violet-400" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-200 font-mono">
                      Workspace Memory & Guidelines
                    </span>
                    <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 font-semibold">
                      {brandRules.length} Active Rules
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Hidden file input for .MD upload */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".md,.markdown,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-300 px-2.5 py-1 rounded-md hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors cursor-pointer border border-black/[0.04] dark:border-white/[0.05]"
                      title="Upload a .md file to semantically extract guidelines on device"
                    >
                      <FileUp size={11} strokeWidth={2.0} />
                      <span>Upload .MD</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsMdModalOpen(true)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-violet-700 dark:text-violet-300 bg-violet-500/10 hover:bg-violet-500/15 border border-violet-500/20 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                    >
                      <Plus size={11} strokeWidth={2.5} />
                      <span>Add / Paste MD</span>
                    </button>
                  </div>
                </div>

                {/* Divided Inset Grid: Brand Guidelines on Left, Learned Habits on Right */}
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-black/[0.05] dark:divide-white/[0.06]">
                  {/* Left Column: Brand & Style Rules */}
                  <div className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-mono">
                      <span>Brand & Design System Tokens</span>
                      <span>On-Device Storage</span>
                    </div>
                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto thin-scrollbar pr-0.5">
                      {brandRules.map((rule) => (
                        <div
                          key={rule.id}
                          className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.03] dark:border-white/[0.04] group hover:border-black/[0.08] dark:hover:border-white/[0.08] transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {rule.category && (
                              <span className={`text-[8.5px] font-bold uppercase font-mono px-1 py-0.2 rounded border ${getCategoryBadge(rule.category)}`}>
                                {rule.category}
                              </span>
                            )}
                            <span className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 truncate">
                              {rule.label}:
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                              {rule.value}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveBrandRule(rule.id)}
                            className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 shrink-0 ml-1 cursor-pointer"
                            title="Delete rule"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Learned User Habits */}
                  <div className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-mono">
                      <span>Ambient Learned Habits</span>
                      <span>Live Intelligence</span>
                    </div>
                    <div className="space-y-1.5">
                      {LEARNED_HABITS.map((habit) => {
                        const HabitIcon = habit.icon;
                        return (
                          <div
                            key={habit.id}
                            className="flex items-start gap-2.5 py-2 px-2.5 rounded-lg bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.03] dark:border-white/[0.04]"
                          >
                            <div className="w-5 h-5 rounded flex items-center justify-center bg-violet-500/10 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5">
                              <HabitIcon size={11} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 truncate">
                                {habit.title}
                              </div>
                              <div className="text-[10.5px] text-slate-400 dark:text-zinc-500 leading-tight mt-0.5">
                                {habit.desc}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Real Items: Continue Where You Left Off (Only rendered when items exist) */}
              {searchResults.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2 px-1 font-mono">
                    <RegaarderHistoryIcon size={12} strokeWidth={1.7} className="text-slate-400 dark:text-zinc-500" />
                    <span>Recent Workspace Files & Context</span>
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
              <span>{t('search.navigate') || 'Navigate'}</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] font-mono text-[10px] shadow-2xs">↵</kbd>
              <span>{t('search.open') || 'Open'}</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] font-mono text-[10px] shadow-2xs">Esc</kbd>
              <span>{t('common.close') || 'Close'}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 font-medium text-slate-400 dark:text-zinc-500 font-mono text-[10.5px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            <span>{t('search.footerBrand') || 'Regaarder Workspace Memory Hub'}</span>
          </div>
        </div>
      </div>

      {/* ── Semantic Markdown Input Modal with On-Device Persistence ── */}
      {isMdModalOpen && (
        <div 
          className="fixed inset-0 z-[100010] bg-black/45 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsMdModalOpen(false)}
        >
          <div 
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150 font-sans text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-violet-600" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Import Guidelines or Agentic Rules
                </h4>
              </div>
              <button 
                type="button" 
                onClick={() => setIsMdModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Paste your company guidelines, design system rules, or custom persona prompt. Saved 100% on your device and semantically parsed into individual memory cards.
            </p>

            <textarea
              rows={8}
              value={mdInputText}
              onChange={(e) => setMdInputText(e.target.value)}
              placeholder={`# Typography\n- Font: Inter, -apple-system\n\n# Brand Colors\n- Primary: #7C3AED\n- Surface: #FFFFFF\n\n# Constraints\n- Always format numbers with %\n- Never use pill-shaped buttons`}
              className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 outline-none focus:border-violet-500 resize-none leading-relaxed"
            />

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-zinc-800">
              <span className="text-[10px] text-slate-400 font-mono">
                Stored in client-side device storage
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMdModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyPastedMarkdown}
                  disabled={!mdInputText.trim()}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-xs transition-all disabled:opacity-40 cursor-pointer"
                >
                  Decompose & Save Locally
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
