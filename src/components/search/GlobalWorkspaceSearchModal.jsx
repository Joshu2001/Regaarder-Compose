import { useTranslation } from '../../i18n';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Search, X, ArrowRight, CornerDownLeft, Copy, Check, RefreshCw,
  Clock, FileText, Database, ShieldCheck, Compass,
  Palette, Type, Plus, Trash2, Sliders, ExternalLink, BookmarkCheck,
  Tag, Lightbulb, HelpCircle, Upload, FileUp, UserCheck, ChevronDown,
  Edit3, RotateCcw, History, MoreHorizontal, Calendar
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
  RelayIcon,
  PeopleIcon,
  ChatIcon,
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

// Helper component to render rich executive markdown safely
function FormattedMarkdown({ content = '' }) {
  if (!content) return null;
  const paragraphs = content.split(/\n\n+/);

  return (
    <div className="space-y-3 text-[13px] leading-[1.7] text-slate-800 dark:text-zinc-200">
      {paragraphs.map((p, pIdx) => {
        const trimmed = p.trim();
        if (!trimmed) return null;

        // Blockquote
        if (trimmed.startsWith('>')) {
          return (
            <blockquote key={pIdx} className="pl-3 border-l-2 border-violet-500/60 italic text-slate-700 dark:text-zinc-300 my-1 bg-violet-500/[0.04] py-1 rounded-r-md">
              {renderInlineMarkdown(trimmed.replace(/^>\s*/, ''))}
            </blockquote>
          );
        }

        // Bullet list
        if (/^[-*•]\s+/m.test(trimmed)) {
          const items = trimmed.split(/\n/).filter(line => /^[-*•]\s+/.test(line.trim()));
          if (items.length > 0) {
            return (
              <ul key={pIdx} className="list-disc list-inside space-y-1 my-1 pl-1">
                {items.map((item, iIdx) => (
                  <li key={iIdx} className="text-slate-800 dark:text-zinc-200">
                    {renderInlineMarkdown(item.trim().replace(/^[-*•]\s+/, ''))}
                  </li>
                ))}
              </ul>
            );
          }
        }

        // Numbered list
        if (/^\d+\.\s+/m.test(trimmed)) {
          const items = trimmed.split(/\n/).filter(line => /^\d+\.\s+/.test(line.trim()));
          if (items.length > 0) {
            return (
              <ol key={pIdx} className="list-decimal list-inside space-y-1 my-1 pl-1">
                {items.map((item, iIdx) => (
                  <li key={iIdx} className="text-slate-800 dark:text-zinc-200">
                    {renderInlineMarkdown(item.trim().replace(/^\d+\.\s+/, ''))}
                  </li>
                ))}
              </ol>
            );
          }
        }

        // Regular paragraph with linebreaks
        const lines = trimmed.split('\n');
        return (
          <p key={pIdx}>
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {renderInlineMarkdown(line)}
                {lIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

function renderInlineMarkdown(text) {
  if (!text) return '';
  const parts = [];
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIdx = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.substring(lastIdx, match.index));
    }
    if (match[2]) {
      // Bold
      parts.push(<strong key={match.index} className="font-semibold text-slate-900 dark:text-white">{match[2]}</strong>);
    } else if (match[3]) {
      // Italic
      parts.push(<em key={match.index} className="italic">{match[3]}</em>);
    } else if (match[4]) {
      // Inline code
      parts.push(<code key={match.index} className="px-1.5 py-0.5 rounded bg-black/[0.06] dark:bg-white/[0.08] font-mono text-[12px]">{match[4]}</code>);
    } else if (match[5] && match[6]) {
      // Link
      parts.push(<a key={match.index} href={match[6]} target="_blank" rel="noreferrer" className="text-violet-600 dark:text-violet-400 hover:underline">{match[5]}</a>);
    }
    lastIdx = regex.lastIndex;
  }
  if (lastIdx < text.length) {
    parts.push(text.substring(lastIdx));
  }
  return parts.length > 0 ? parts : text;
}

// Primary visible tabs in top navigation bar
const FILTER_TABS = [
  { id: 'all', label: 'All', icon: MemoryIcon },
  { id: 'compose', label: 'Docs', icon: ComposeIcon },
  { id: 'sheets', label: 'Sheets', icon: SheetIcon },
  { id: 'deck', label: 'Deck', icon: DeckIcon },
  { id: 'tasks', label: 'Tasks', icon: TasksIcon },
  { id: 'relay', label: 'Relay', icon: RelayIcon },
  { id: 'room', label: 'Room', icon: RoomIcon },
  { id: 'notes', label: 'Notes', icon: BrowserIcon },
  { id: 'browser-history', label: 'Browser History', icon: History },
  { id: 'people', label: 'People', icon: PeopleIcon }
];

// Additional workspace resources accessible via the ellipsis (...) menu immediately after People
const MORE_FILTER_TABS = [
  { id: 'whiteboard', label: 'Whiteboards', icon: Palette },
  { id: 'comments', label: 'Comments', icon: Tag },
  { id: 'chat', label: 'Chats', icon: ChatIcon },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'browser', label: 'Research', icon: BrowserIcon }
];

export function getWorkspaceCtaLabel(filter = '') {
  switch (filter) {
    case 'compose':
    case 'docs':
      return 'New Document';
    case 'sheets':
      return 'New Spreadsheet';
    case 'deck':
    case 'decks':
      return 'New Presentation';
    case 'tasks':
      return 'New Task';
    case 'relay':
      return 'New Message';
    case 'room':
    case 'rooms':
      return 'Add New Meeting';
    case 'notes':
      return 'Add Room Note';
    case 'whiteboard':
    case 'whiteboards':
      return 'New Whiteboard';
    case 'comments':
      return 'New Comment';
    case 'chat':
    case 'chats':
      return 'New Chat';
    case 'schedule':
      return 'New Event';
    case 'browser':
      return 'New Research';
    default:
      return 'New Item';
  }
}

export function getWorkspaceFilterTitle(filter = '') {
  switch (filter) {
    case 'compose':
    case 'docs':
      return 'Documents';
    case 'sheets':
      return 'Spreadsheets';
    case 'deck':
      return 'Presentations';
    case 'tasks':
      return 'Tasks';
    case 'relay':
      return 'Relay Messages';
    case 'room':
      return 'Meetings';
    case 'notes':
      return 'Room Notes';
    case 'whiteboard':
      return 'Whiteboards';
    case 'comments':
      return 'Comments';
    case 'chat':
      return 'Chats';
    case 'schedule':
      return 'Schedule';
    case 'browser-history':
      return 'Browser History';
    case 'people':
      return 'People';
    case 'browser':
      return 'Research';
    default:
      return filter.charAt(0).toUpperCase() + filter.slice(1);
  }
}

// Suggested Ask Memory prompt queries
const SUGGESTED_AI_PROMPTS = [
  "Summarize key decisions across recent documents",
  "Review open financial models and spreadsheet metrics",
  "Apply active brand guidelines to my recent presentation",
  "Show high-priority tasks and upcoming deadlines"
];

// Pre-built Executive Agentic Personas (Claude / ChatGPT style)
const INITIAL_PRESET_PERSONAS = [
  {
    id: 'executive-editor',
    name: 'Executive Editor',
    badge: 'Concise & Structured',
    instructions: 'Communicate with executive brevity, strategic precision, and decisive focus. Use clean tables, bold takeaways, and actionable bullet points. Cut preamble, corporate buzzwords, and redundant text.'
  },
  {
    id: 'executive-strategist',
    name: 'Strategist',
    badge: 'High-Agency Synthesis',
    instructions: 'High-agency polymath intelligence with cross-disciplinary mastery across strategy, unit economics, architecture, and long-term moat. Answers with first-principles clarity, zero corporate fluff, and verified metrics.'
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
    id: 'peter-thiel',
    name: 'Peter Thiel',
    badge: 'Contrarian & Zero-to-One',
    instructions: 'Challenge conventional consensus. Demand secret truths, network effects, and proprietary durability. Avoid corporate buzzwords, cosmetic fluff, and incrementalism.'
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
  { id: 'h-1', title: 'Calculations Engine', desc: 'Frequently inspects SUM & AVERAGE formulas in Sheets', icon: SheetIcon },
  { id: 'h-2', title: 'Export Preferences', desc: 'Prefers Excel (.xlsx) and clean PDF with dark backdrops', icon: ComposeIcon },
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
  aiConfig = null,
  selectedModel = null,
  detectedModels = [],
  liveWorkspaceContext = {},
  onNavigateToEntity
}) {
  const isDeck = productMode === 'deck';
  const [mode, setMode] = useState(isDeck ? (initialMode || 'search') : 'search');
  const { t } = useTranslation();
  const [query, setQuery] = useState(initialQuery || '');
  const [activeFilter, setActiveFilter] = useState(initialFilter || 'all');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Natural language question or AI prompt intent detection
  const isQuestionQuery = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed || trimmed.length < 8) return false;
    if (trimmed.endsWith('?')) return true;
    const questionStarters = ['what', 'how', 'why', 'who', 'where', 'when', 'which', 'can you', 'could you', 'explain', 'summarize', 'tell me', 'find all', 'analyze', 'is there', 'are there', 'list all', 'give me'];
    return questionStarters.some(starter => trimmed.startsWith(starter + ' ') || trimmed.startsWith(starter));
  }, [query]);

  // AI Synthesis state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiProgress, setAiProgress] = useState({ step: 1, label: 'Scanning workspace metadata' });
  const [aiResponse, setAiResponse] = useState(null);
  const [copiedAi, setCopiedAi] = useState(false);

  // Interactive Follow-up, Prompt Edit & Selection States
  const [isReplying, setIsReplying] = useState(false);
  const [replyQuery, setReplyQuery] = useState('');
  const [quotedSnippet, setQuotedSnippet] = useState('');
  const [conversationThread, setConversationThread] = useState([]);
  const [isSendingFollowUp, setIsSendingFollowUp] = useState(false);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [editingQueryText, setEditingQueryText] = useState('');
  const [selectionTooltip, setSelectionTooltip] = useState(null);

  const followUpInputRef = useRef(null);
  const promptEditInputRef = useRef(null);
  const synthesisCardRef = useRef(null);

  // Persistent Recent Inquiries History
  const [recentInquiries, setRecentInquiries] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('regaarder_memory_inquiries_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      }
    } catch (e) {
      console.warn('[Memory] Failed to load recent inquiries:', e);
    }
    return [];
  });

  const saveInquiryToHistory = (q, answer, sources = []) => {
    if (!q || !q.trim() || !answer) return;
    const item = {
      id: `inq-${Date.now()}`,
      query: q.trim(),
      answerPreview: answer.length > 90 ? `${answer.slice(0, 90)}...` : answer,
      fullAnswer: answer,
      sources: sources || [],
      timestamp: Date.now()
    };
    setRecentInquiries(prev => {
      const filtered = prev.filter(i => i.query.toLowerCase() !== q.trim().toLowerCase());
      const updated = [item, ...filtered].slice(0, 8);
      try {
        localStorage.setItem('regaarder_memory_inquiries_v1', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  const handleClearMemorySynthesis = () => {
    setQuery('');
    setAiResponse(null);
    setConversationThread([]);
    setQuotedSnippet('');
    setSelectionTooltip(null);
    setIsReplying(false);
    setIsEditingPrompt(false);
    setMode('search');
    setTimeout(() => inputRef.current?.focus(), 40);
  };

  const handleRestorePastInquiry = (inq) => {
    if (!inq) return;
    setQuery(inq.query);
    setAiResponse({
      answer: inq.fullAnswer || inq.answerPreview,
      sources: inq.sources || []
    });
    setConversationThread([]);
    setQuotedSnippet('');
    setSelectionTooltip(null);
    setIsReplying(false);
    setIsEditingPrompt(false);
    setMode('ai');
  };

  const handleClearInquiriesHistory = () => {
    setRecentInquiries([]);
    try {
      localStorage.removeItem('regaarder_memory_inquiries_v1');
    } catch (_) {}
  };

  // Persona list (supports custom on-device edits)
  const [personas, setPersonas] = useState(() => {
    try {
      const savedV2 = localStorage.getItem('regaarder_personas_list_v2');
      if (savedV2) {
        const parsed = JSON.parse(savedV2);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      // If legacy storage exists without the new Executive Editor default, reset to updated presets
      const legacySaved = localStorage.getItem('regaarder_personas_list');
      if (legacySaved) {
        const parsedLegacy = JSON.parse(legacySaved);
        if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0 && parsedLegacy[0]?.id !== 'peter-thiel') {
          return parsedLegacy;
        }
      }
    } catch (e) {
      console.warn('Failed to load custom personas:', e);
    }
    return INITIAL_PRESET_PERSONAS;
  });

  // Active Agentic Persona State - Default is Executive Editor / Strategist (never Peter Thiel)
  const [activePersona, setActivePersona] = useState(() => {
    try {
      const savedV2 = localStorage.getItem('regaarder_active_persona_v2');
      if (savedV2) {
        const parsed = JSON.parse(savedV2);
        if (parsed && parsed.id) return parsed;
      }
      const legacySaved = localStorage.getItem('regaarder_active_persona');
      if (legacySaved) {
        const parsedLegacy = JSON.parse(legacySaved);
        // If legacy storage defaulted to peter-thiel, explicitly override to executive-editor
        if (parsedLegacy && parsedLegacy.id && parsedLegacy.id !== 'peter-thiel') {
          return parsedLegacy;
        }
      }
    } catch (e) {
      console.warn('Failed to load active persona:', e);
    }
    return INITIAL_PRESET_PERSONAS[0];
  });

  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const [isMoreFilterMenuOpen, setIsMoreFilterMenuOpen] = useState(false);
  const [isRecentHistoryOpen, setIsRecentHistoryOpen] = useState(false);
  const [isWorkspaceSettingsOpen, setIsWorkspaceSettingsOpen] = useState(false);
  const [moreFilterMenuPosition, setMoreFilterMenuPosition] = useState({ top: 0, left: 0 });
  const [workspaceStorageRevision, setWorkspaceStorageRevision] = useState(0);

  // Edit Persona Modal State
  const [isEditPersonaModalOpen, setIsEditPersonaModalOpen] = useState(false);
  const [editingPersonaName, setEditingPersonaName] = useState('');
  const [editingPersonaBadge, setEditingPersonaBadge] = useState('');
  const [editingPersonaInstructions, setEditingPersonaInstructions] = useState('');

  // Workspace Brand Rules & Guidelines state (persisted on device in localStorage)
  const [brandRules, setBrandRules] = useState(() => {
    try {
      const saved = localStorage.getItem('regaarder_workspace_brand_rules');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
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
  const moreFilterMenuRef = useRef(null);
  const moreFilterButtonRef = useRef(null);
  const recentHistoryRef = useRef(null);

  const inputRef = useRef(null);
  const resultsContainerRef = useRef(null);

  // Persist brand rules to localStorage on update
  useEffect(() => {
    try {
      localStorage.setItem('regaarder_workspace_brand_rules', JSON.stringify(brandRules));
    } catch (e) {
      console.warn('Failed to persist brand rules:', e);
    }
  }, [brandRules]);

  // Persist active persona to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('regaarder_active_persona_v2', JSON.stringify(activePersona));
      localStorage.setItem('regaarder_active_persona', JSON.stringify(activePersona));
    } catch (e) {
      console.warn('Failed to persist active persona:', e);
    }
  }, [activePersona]);

  // Persist personas list to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('regaarder_personas_list_v2', JSON.stringify(personas));
      localStorage.setItem('regaarder_personas_list', JSON.stringify(personas));
    } catch (e) {
      console.warn('Failed to persist personas list:', e);
    }
  }, [personas]);

  useEffect(() => {
    const refreshWorkspaceIndex = () => setWorkspaceStorageRevision((revision) => revision + 1);
    window.addEventListener('workspace-storage-update', refreshWorkspaceIndex);
    return () => window.removeEventListener('workspace-storage-update', refreshWorkspaceIndex);
  }, []);

  // Build the complete searchable workspace index strictly from real state
  const workspaceIndex = useMemo(() => {
    return buildWorkspaceIndex(liveWorkspaceContext);
  }, [liveWorkspaceContext, workspaceStorageRevision]);

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
      return searchResults.slice(0, 10).map((r) => ({ type: 'entity', data: r.entity }));
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
      setAiProgress({ step: 1, label: 'Scanning workspace metadata' });
      setConversationThread([]);
      setQuotedSnippet('');
      setIsReplying(false);
      setIsEditingPrompt(false);
      setIsMdModalOpen(false);
      setIsPersonaMenuOpen(false);
      setIsEditPersonaModalOpen(false);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isOpen, initialQuery, initialMode, initialFilter, isDeck]);

  // Pre-fill raw Markdown text from device when opening the markdown modal
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

  // Reset selected index when query or filter changes (when question query is detected, don't auto-highlight result 0)
  useEffect(() => {
    setSelectedIndex(isQuestionQuery ? -1 : 0);
  }, [query, activeFilter, mode, isQuestionQuery]);

  useEffect(() => {
    if (!isMoreFilterMenuOpen) return;
    const updateMenuPosition = () => {
      const button = moreFilterButtonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const menuWidth = 220;
      setMoreFilterMenuPosition({
        top: rect.bottom + 8,
        left: Math.max(8, Math.min(rect.left, window.innerWidth - menuWidth - 8))
      });
    };

    updateMenuPosition();
    const handleClickOutside = (event) => {
      const clickedInsideButton = moreFilterButtonRef.current?.contains(event.target);
      const clickedInsideMenu = moreFilterMenuRef.current?.contains(event.target);
      if (!clickedInsideButton && !clickedInsideMenu) {
        setIsMoreFilterMenuOpen(false);
      }
    };
    const handleResize = () => updateMenuPosition();
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, [isMoreFilterMenuOpen]);

  useEffect(() => {
    if (!isRecentHistoryOpen) return;
    const handleClickOutside = (event) => {
      if (!recentHistoryRef.current?.contains(event.target)) {
        setIsRecentHistoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isRecentHistoryOpen]);

  // Auto-scroll selected result into view
  useEffect(() => {
    if (!resultsContainerRef.current) return;
    const selectedEl = resultsContainerRef.current.querySelector('[data-selected="true"]');
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  // Open the persona customization modal prefilled with the active persona
  const handleOpenEditPersona = (personaToEdit = activePersona) => {
    setEditingPersonaName(personaToEdit.name);
    setEditingPersonaBadge(personaToEdit.badge);
    setEditingPersonaInstructions(personaToEdit.instructions);
    setIsEditPersonaModalOpen(true);
    setIsPersonaMenuOpen(false);
  };

  // Save customized persona prompt to device
  const handleSaveCustomPersona = () => {
    if (!editingPersonaName.trim() || !editingPersonaInstructions.trim()) return;
    const updatedPersona = {
      ...activePersona,
      name: editingPersonaName.trim(),
      badge: editingPersonaBadge.trim() || 'Custom Lens',
      instructions: editingPersonaInstructions.trim()
    };
    setActivePersona(updatedPersona);
    setPersonas(prev => prev.map(p => p.id === updatedPersona.id ? updatedPersona : p));
    setIsEditPersonaModalOpen(false);
  };

  // Reset active persona instructions to defaults
  const handleResetActivePersona = () => {
    const original = INITIAL_PRESET_PERSONAS.find(p => p.id === activePersona.id) || INITIAL_PRESET_PERSONAS[0];
    setEditingPersonaName(original.name);
    setEditingPersonaBadge(original.badge);
    setEditingPersonaInstructions(original.instructions);
  };

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

  // Handle applying pasted Markdown into individual extracted guidelines
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
    setBrandRules(prev => {
      const next = prev.filter(r => r.id !== ruleId);
      try {
        localStorage.setItem('regaarder_workspace_brand_rules', JSON.stringify(next));
      } catch (err) {
        console.warn('Failed to persist brand rules:', err);
      }
      return next;
    });
  };
  const handleDeleteBrandRule = handleRemoveBrandRule;

  // Execute AI Workspace Synthesis with persona and extracted brand memory context
  const handleRunAiSynthesis = async (promptQuery) => {
    const targetQ = promptQuery || query;
    if (!targetQ || !targetQ.trim()) return;

    setAiLoading(true);
    setAiProgress({ step: 1, label: 'Scanning workspace metadata' });
    setAiResponse(null);
    setConversationThread([]);
    setIsReplying(false);
    setIsEditingPrompt(false);
    setQuotedSnippet('');
    setSelectionTooltip(null);

    try {
      const brandContextSnippet = brandRules.map(r => `${r.label}: ${r.value}`).join('; ');
      const personaContext = `${activePersona.name} (${activePersona.badge}) - ${activePersona.instructions}. Brand Guidelines: ${brandContextSnippet}`;
      const activeModelId = selectedModel?.id || selectedModel?.name || (detectedModels?.[0]?.id || detectedModels?.[0]?.name);
      const activeProvider = (selectedModel?.isLocal || selectedModel?.provider === 'Ollama') ? 'Ollama' : undefined;

      const result = await synthesizeWorkspaceKnowledge({
        query: targetQ.trim(),
        activeFilter,
        workspaceIndex,
        onProgress: setAiProgress,
        onCallAi,
        aiConfig,
        customModel: activeModelId,
        customProvider: activeProvider,
        personaInstructions: personaContext
      });
      setAiResponse(result);
      if (result?.answer) {
        saveInquiryToHistory(targetQ.trim(), result.answer, result.sources);
      }
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

  // Multi-turn conversational follow-up handler
  const handleSendFollowUp = async () => {
    const trimmed = replyQuery.trim();
    if (!trimmed || isSendingFollowUp) return;

    const userMessage = quotedSnippet ? `[Quoting: "${quotedSnippet}"] ${trimmed}` : trimmed;
    const newTurn = { role: 'user', text: userMessage, timestamp: Date.now() };
    const updatedThread = [...conversationThread, newTurn];

    setConversationThread(updatedThread);
    setReplyQuery('');
    setQuotedSnippet('');
    setIsSendingFollowUp(true);

    try {
      const brandContextSnippet = brandRules.map(r => `${r.label}: ${r.value}`).join('; ');
      const personaContext = `${activePersona.name} (${activePersona.badge}) - ${activePersona.instructions}. Brand Guidelines: ${brandContextSnippet}`;
      const activeModelId = selectedModel?.id || selectedModel?.name || (detectedModels?.[0]?.id || detectedModels?.[0]?.name);
      const activeProvider = (selectedModel?.isLocal || selectedModel?.provider === 'Ollama') ? 'Ollama' : undefined;

      const result = await synthesizeWorkspaceKnowledge({
        query: userMessage,
        activeFilter,
        workspaceIndex,
        onCallAi,
        aiConfig,
        customModel: activeModelId,
        customProvider: activeProvider,
        previousConversation: [
          { role: 'user', text: query },
          ...(aiResponse?.answer ? [{ role: 'assistant', text: aiResponse.answer }] : []),
          ...conversationThread
        ],
        personaInstructions: personaContext
      });

      if (result?.answer) {
        setConversationThread(prev => [...prev, { role: 'assistant', text: result.answer, timestamp: Date.now() }]);
      }
    } catch (err) {
      console.error('Error in follow-up synthesis:', err);
      setConversationThread(prev => [...prev, { role: 'assistant', text: "Unable to process follow-up query right now.", timestamp: Date.now() }]);
    } finally {
      setIsSendingFollowUp(false);
    }
  };

  // Save and execute edited query in-place
  const handleSaveEditedPrompt = () => {
    const trimmed = editingQueryText.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    setIsEditingPrompt(false);
    handleRunAiSynthesis(trimmed);
  };

  // Highlight selection quote helper
  const handleTextSelection = () => {
    if (typeof window === 'undefined') return;
    const selection = window.getSelection();
    const selText = selection?.toString()?.trim();
    if (selText && selText.length > 4 && synthesisCardRef.current?.contains(selection.anchorNode)) {
      setSelectionTooltip({ text: selText });
    } else {
      setSelectionTooltip(null);
    }
  };

  // Handle opening an entity
  const handleActivateItem = (item) => {
    if (!item) return;
    const entity = item.type === 'entity' ? item.data : item;
    if (onNavigateToEntity) {
      onNavigateToEntity(entity);
    }
    onClose();
  };

  // Keyboard navigation handler for the search modal
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      if (isEditPersonaModalOpen) {
        setIsEditPersonaModalOpen(false);
        return;
      }
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
      // If user typed a natural language question and didn't manually navigate down into results, route to Ask Memory synthesis
      if (isQuestionQuery && selectedIndex === -1) {
        setMode('ai');
        handleRunAiSynthesis(query);
        return;
      }
      if (flatSelectableItems.length > 0 && selectedIndex >= 0 && flatSelectableItems[selectedIndex]) {
        handleActivateItem(flatSelectableItems[selectedIndex]);
      } else if (isQuestionQuery || query.trim().length > 15) {
        // Fallback: route question to Ask Memory
        setMode('ai');
        handleRunAiSynthesis(query);
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
        return 'text-violet-600 dark:text-violet-400 bg-violet-500/[0.08]';
      case 'palette':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/[0.08]';
      case 'voice':
        return 'text-blue-600 dark:text-blue-400 bg-blue-500/[0.08]';
      case 'rules':
        return 'text-amber-600 dark:text-amber-400 bg-amber-500/[0.08]';
      case 'layout':
      default:
        return 'text-slate-500 dark:text-zinc-400 bg-black/[0.04] dark:bg-white/[0.05]';
    }
  };

  // Frosted Apple glass surface with 36px backdrop blur
  const backdropClasses = 'bg-slate-900/35 dark:bg-black/60 backdrop-blur-[24px]';
  const surfaceClasses = 'bg-white/[0.72] dark:bg-[rgba(30,30,30,0.72)] backdrop-blur-[20px] saturate-[180%] rounded-2xl shadow-[0_32px_90px_rgba(0,0,0,0.18),0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.65)] border border-white/70 dark:border-white/[0.12] ring-1 ring-black/[0.05] dark:ring-white/[0.06]';
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
        {/* ── Dominant Search / Header (Adaptive min-h-[62px] fluid height) ── */}
        <div className="min-h-[62px] py-2.5 flex items-center px-5 border-b border-black/[0.06] dark:border-white/[0.07] gap-3.5 shrink-0 bg-transparent transition-all duration-150">
          {mode === 'ai' ? (
            <div className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-2xs self-center">
              <RegaarderAiIcon size={15} strokeWidth={1.9} />
            </div>
          ) : (
            <Search size={18} strokeWidth={1.8} className="text-slate-400 dark:text-zinc-500 shrink-0 self-center" />
          )}

          <div className="flex-1 flex items-center min-w-0">
            <textarea
              ref={inputRef}
              rows={1}
              value={query}
              onChange={(e) => {
                const val = e.target.value;
                setQuery(val);
                setAiResponse(null);
                // Auto-adjust height up to 3 lines
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 88)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleKeyDown(e);
                }
              }}
              placeholder={
                mode === 'ai' 
                  ? (t('search.askAnything') || `Ask Memory as ${activePersona.name} across workspace files & guidelines…`) 
                  : (t('search.searchAnything') || 'Search anything in your workspace…')
              }
              className="w-full bg-transparent border-none outline-none text-[15px] font-normal text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 tracking-tight resize-none py-1.5 leading-relaxed thin-scrollbar max-h-[88px] overflow-y-auto"
              style={{ minHeight: '28px' }}
            />
          </div>

          {/* Right Action Controls: Clear & Apple Dual Switch */}
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
            <div className="flex items-center p-0.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.06]">
              <button
                type="button"
                onClick={() => {
                  setMode('search');
                  setAiResponse(null);
                  setTimeout(() => inputRef.current?.focus(), 20);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11.5px] font-medium transition-all duration-150 cursor-pointer ${
                  mode === 'search'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xs border border-black/[0.05] dark:border-white/[0.08]'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
                title="Search across workspace memory"
              >
                <Search size={12} strokeWidth={1.9} className={mode === 'search' ? 'text-slate-700 dark:text-zinc-300' : 'text-slate-400 dark:text-zinc-500'} />
                <span>Search</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('ai');
                  setAiResponse(null);
                  if (query.trim()) {
                    handleRunAiSynthesis(query);
                  }
                  setTimeout(() => inputRef.current?.focus(), 20);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11.5px] font-semibold transition-all duration-150 cursor-pointer ${
                  mode === 'ai'
                    ? 'bg-violet-600 text-white shadow-2xs'
                    : 'text-violet-700/90 dark:text-violet-300/90 hover:text-violet-900 dark:hover:text-violet-200 hover:bg-violet-50/60 dark:hover:bg-violet-950/30'
                }`}
                title="Ask Memory - Intelligent contextual synthesis"
              >
                <RegaarderAiIcon size={12} strokeWidth={1.8} className={mode === 'ai' ? 'text-white' : 'text-violet-600 dark:text-violet-400'} />
                <span>Ask Memory</span>
              </button>
            </div>

            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-[10px] font-mono font-medium text-slate-500 dark:text-zinc-400 border border-slate-200/70 dark:border-zinc-700/60 shadow-2xs ml-0.5">
              ESC
            </kbd>
          </div>
        </div>

        {/* ── Category Navigation Tabs (Clean unclipped split bar) ── */}
        <div className={`flex items-center justify-between px-5 py-2 shrink-0 gap-3 select-none ${categoryBarClasses}`}>
          {/* Scrollable category tabs */}
          <div className="flex items-center gap-1 min-w-0 overflow-x-auto no-scrollbar">
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveFilter(tab.id);
                    setMode('search');
                    setIsMoreFilterMenuOpen(false);
                    setIsRecentHistoryOpen(false);
                  }}
                  className={`px-2.5 py-1 text-[12px] rounded-md transition-all duration-150 cursor-pointer shrink-0 ${
                    isActive
                      ? 'border border-slate-200/90 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-semibold shadow-2xs outline outline-1 outline-violet-500/30'
                      : 'border border-transparent text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] font-medium'
                  }`}
                >
                  <span>
                    {tab.id === 'all'
                      ? (t('common.all') || 'All')
                      : tab.id === 'compose'
                        ? (t('nav.docs') || t('nav.compose') || 'Docs')
                        : tab.id === 'notes'
                          ? (t('nav.notes') || 'Notes')
                          : tab.id === 'browser-history'
                            ? 'Browser History'
                            : (t('nav.' + tab.id) || tab.label)}
                  </span>
                </button>
              );
            })}

            {MORE_FILTER_TABS.length > 0 && (
              <div className="relative shrink-0" ref={moreFilterMenuRef}>
                <button
                  ref={moreFilterButtonRef}
                  type="button"
                  onClick={() => setIsMoreFilterMenuOpen((prev) => !prev)}
                  className={`flex items-center gap-1 px-2.5 py-1 text-[12px] rounded-md transition-all duration-150 cursor-pointer shrink-0 ${
                    MORE_FILTER_TABS.some((t) => t.id === activeFilter)
                      ? 'border border-slate-200/90 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-semibold shadow-2xs outline outline-1 outline-violet-500/30'
                      : 'border border-transparent text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] font-medium'
                  }`}
                  title="More workspace resources"
                  aria-label="More workspace resources"
                >
                  <MoreHorizontal size={13} strokeWidth={2} />
                  <span className="text-[12px] font-medium">More</span>
                </button>

                {isMoreFilterMenuOpen && createPortal(
                  <div
                    className="fixed w-52 rounded-xl border border-slate-200/90 dark:border-zinc-700 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-xl p-1.5 z-[100010] animate-in fade-in zoom-in-95 duration-100"
                    style={{ top: `${moreFilterMenuPosition.top}px`, left: `${moreFilterMenuPosition.left}px` }}
                  >
                    {MORE_FILTER_TABS.map((tab) => {
                      const isActive = activeFilter === tab.id;
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onPointerDown={(e) => {
                            e.preventDefault();
                            setActiveFilter(tab.id);
                            setMode('search');
                            setIsMoreFilterMenuOpen(false);
                            setIsRecentHistoryOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left text-[12px] transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-900 dark:text-violet-200 font-semibold'
                              : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <Icon size={12} strokeWidth={1.8} className={isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-zinc-500'} />
                          <span className="flex-1">{tab.label}</span>
                          {isActive && <Check size={12} className="text-violet-600 dark:text-violet-400" />}
                        </button>
                      );
                    })}
                  </div>,
                  document.body
                )}
              </div>
            )}
          </div>

          {/* Persona Selector Badge - Strictly Anchored, Shrink-0, Never Clipped */}
          <div className="relative shrink-0 pr-0.5">
            <button
              type="button"
              onClick={() => setIsPersonaMenuOpen(prev => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-violet-500/[0.07] hover:bg-violet-500/[0.12] border border-violet-500/20 text-violet-700 dark:text-violet-300 text-[11.5px] font-medium transition-all duration-150 cursor-pointer whitespace-nowrap shadow-2xs"
              title={`Active Lens: ${activePersona.name}`}
            >
              <Compass size={12} strokeWidth={1.8} className="text-violet-600/80 dark:text-violet-400/80" />
              <span className="font-semibold text-slate-800 dark:text-zinc-200">{activePersona.name}</span>
              <ChevronDown size={11} className={`text-slate-400 dark:text-zinc-500 transition-transform duration-150 ${isPersonaMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isPersonaMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-72 rounded-xl border border-slate-200/90 dark:border-zinc-700 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 font-sans text-left">
                <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  <span>Select Cognitive Lens</span>
                  <button
                    type="button"
                    onClick={() => handleOpenEditPersona(activePersona)}
                    className="text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 size={10} />
                    <span>Edit Prompt</span>
                  </button>
                </div>
                {personas.map((p) => {
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
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4" aria-live="polite" aria-busy="true">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-500/20">
                    <RegaarderAiIcon size={21} strokeWidth={2.0} className="animate-pulse" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-[14.5px] font-bold text-slate-800 dark:text-zinc-100">
                      {aiProgress.step}. {aiProgress.label}
                    </div>
                    <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-sm leading-relaxed">
                      Synthesizing Workspace Memory as {activePersona.name} for &ldquo;{query}&rdquo;
                    </p>
                  </div>
                  <div className="w-full max-w-md space-y-2.5" aria-hidden="true">
                    {[0, 1, 2].map((bar) => (
                      <div key={bar} className="h-2.5 rounded-full bg-slate-200/70 dark:bg-white/[0.08] overflow-hidden">
                        <div
                          className="h-full w-2/3 rounded-full bg-gradient-to-r from-transparent via-violet-400/70 to-transparent animate-[synthesis-shimmer_1.8s_ease-in-out_infinite]"
                          style={{ animationDelay: `${bar * 180}ms` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {aiResponse && !aiLoading && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div
                    ref={synthesisCardRef}
                    onMouseUp={handleTextSelection}
                    className="relative p-5 rounded-xl bg-violet-50/25 dark:bg-violet-950/10 border border-violet-100/60 dark:border-violet-800/25 space-y-3.5 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <RegaarderAiIcon size={14} className="text-violet-600 dark:text-violet-400" />
                        <span className="text-[10.5px] font-bold text-violet-900 dark:text-violet-200 uppercase tracking-wider font-mono">
                          Executive Synthesis ({activePersona.name})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setIsReplying(true);
                            setTimeout(() => followUpInputRef.current?.focus(), 50);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-[11px] font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 border border-black/[0.08] dark:border-white/[0.1] shadow-2xs transition-colors cursor-pointer"
                          title="Reply or continue chatting"
                        >
                          <CornerDownLeft size={11} className="text-violet-600 dark:text-violet-400" />
                          <span>Reply</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingPrompt(true);
                            setEditingQueryText(query);
                            setTimeout(() => promptEditInputRef.current?.focus(), 50);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-[11px] font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 border border-black/[0.08] dark:border-white/[0.1] shadow-2xs transition-colors cursor-pointer"
                          title="Edit prompt in-place"
                        >
                          <Edit3 size={11} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCopyAiResponse}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-[11px] font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 border border-black/[0.08] dark:border-white/[0.1] shadow-2xs transition-colors cursor-pointer"
                        >
                          {copiedAi ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                          <span>{copiedAi ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Floating Selection Tooltip for Quick Quote & Reply */}
                    {selectionTooltip && (
                      <div className="absolute top-2 right-44 z-20 animate-in fade-in zoom-in-95 duration-150">
                        <button
                          type="button"
                          onPointerDown={(e) => {
                            e.preventDefault();
                            setQuotedSnippet(selectionTooltip.text);
                            setIsReplying(true);
                            setSelectionTooltip(null);
                            setTimeout(() => followUpInputRef.current?.focus(), 50);
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-semibold shadow-md transition-colors cursor-pointer"
                        >
                          <CornerDownLeft size={11} />
                          <span>Quote & Reply</span>
                        </button>
                      </div>
                    )}

                    {/* In-Place Prompt Editor Mode */}
                    {isEditingPrompt ? (
                      <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-violet-200 dark:border-violet-700 shadow-xs space-y-2">
                        <div className="text-[11px] font-semibold text-violet-900 dark:text-violet-300 flex items-center gap-1.5">
                          <Edit3 size={12} />
                          <span>Edit Prompt:</span>
                        </div>
                        <input
                          ref={promptEditInputRef}
                          type="text"
                          value={editingQueryText}
                          onChange={(e) => setEditingQueryText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveEditedPrompt();
                            } else if (e.key === 'Escape') {
                              e.preventDefault();
                              setIsEditingPrompt(false);
                            }
                          }}
                          className="w-full px-2.5 py-1.5 text-[12.5px] rounded-md bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-violet-500"
                        />
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setIsEditingPrompt(false)}
                            className="px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveEditedPrompt}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-md transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                          >
                            <Check size={11} />
                            <span>Re-synthesize</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Rich Formatted Markdown Output */
                      <FormattedMarkdown content={aiResponse.answer} />
                    )}
                  </div>

                  {/* Multi-Turn Follow-Up Conversation Thread */}
                  {conversationThread.length > 0 && (
                    <div className="space-y-3 pt-1">
                      <div className="text-[10.5px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-1 font-mono">
                        Follow-Up Conversation ({conversationThread.length} turns)
                      </div>
                      {conversationThread.map((turn, tIdx) => (
                        <div key={tIdx} className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          {turn.role === 'user' ? (
                            <div className="max-w-[85%] p-2.5 px-3.5 rounded-2xl bg-violet-600 text-white text-[12px] leading-relaxed shadow-xs">
                              {turn.text}
                            </div>
                          ) : (
                            <div className="max-w-[90%] p-3.5 rounded-xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200/60 dark:border-violet-800/50 shadow-xs">
                              <FormattedMarkdown content={turn.text} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Loading Indicator for Follow-Up */}
                  {isSendingFollowUp && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-violet-50/50 dark:bg-violet-950/30 border border-violet-200/40 text-violet-700 dark:text-violet-300 text-xs">
                      <RegaarderAiIcon size={14} className="animate-spin text-violet-600" />
                      <span>Synthesizing follow-up as {activePersona.name}…</span>
                    </div>
                  )}

                  {/* Inline Follow-Up Prompt Box */}
                  {isReplying && (
                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-850 border border-violet-200 dark:border-violet-800/60 shadow-xs space-y-2 animate-in fade-in duration-150">
                      {quotedSnippet && (
                        <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-950/50 border border-violet-200/60 dark:border-violet-800/50 text-[11px] text-violet-800 dark:text-violet-300">
                          <span className="truncate max-w-[90%] italic">Quoting: &ldquo;{quotedSnippet}&rdquo;</span>
                          <button
                            type="button"
                            onClick={() => setQuotedSnippet('')}
                            className="hover:text-violet-950 dark:hover:text-white cursor-pointer ml-1"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <input
                          ref={followUpInputRef}
                          type="text"
                          value={replyQuery}
                          onChange={(e) => setReplyQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendFollowUp();
                            }
                            if (e.key === 'Escape') {
                              e.preventDefault();
                              setIsReplying(false);
                            }
                          }}
                          placeholder="Continue chatting or ask a follow-up about this synthesis…"
                          className="flex-1 bg-transparent text-[12.5px] text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleSendFollowUp}
                          disabled={!replyQuery.trim() || isSendingFollowUp}
                          className="px-2.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                        >
                          <span>Send</span>
                          <CornerDownLeft size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsReplying(false);
                            setQuotedSnippet('');
                          }}
                          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  )}

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
              MODE B: SEARCH MODE - EMPTY QUERY (Category Browser or 3-Pillar Executive Architecture)
             ══════════════════════════════════════════════════════════ */}
          {mode === 'search' && !query.trim() && (
            activeFilter === 'all' ? (
              <div className="space-y-4">
                {searchResults.length > 0 ? (
                  <div>
                    <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-600 dark:text-zinc-400 mb-2 px-1">
                      <RegaarderHistoryIcon size={12} strokeWidth={1.7} className="text-slate-400 dark:text-zinc-500" />
                      <span>Recent Workspace Files & Context</span>
                    </div>
                    <div className="space-y-1">
                      {searchResults.slice(0, 5).map((res, itemIdx) => {
                        const isSelected = selectedIndex === itemIdx;
                        const entity = res.entity;

                        return (
                          <div
                            key={entity.id}
                            data-selected={isSelected}
                            onClick={() => handleActivateItem({ type: 'entity', data: entity })}
                            onMouseEnter={() => setSelectedIndex(itemIdx)}
                            className={`flex items-center justify-between p-2.5 rounded-lg transition-all duration-150 cursor-pointer ${
                              isSelected
                                ? 'bg-black/[0.03] dark:bg-white/[0.05]'
                                : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-7 h-7 rounded-md bg-black/[0.03] dark:bg-white/[0.04] flex items-center justify-center text-slate-600 dark:text-zinc-300 shrink-0">
                                <RegaarderProductIcon name={entity.workspace} size={13} strokeWidth={1.6} />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-[12.5px] font-medium text-slate-800 dark:text-zinc-100 truncate">
                                    {entity.title}
                                  </span>
                                  {entity.isCurrent && (
                                    <span className="text-[9px] font-medium uppercase px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono">
                                      Active
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400/90 dark:text-zinc-500 truncate mt-0.5">
                                  {entity.location} • {entity.author}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10.5px] text-slate-400/80 dark:text-zinc-500 font-mono">
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
                  <div className="py-14 text-center max-w-sm mx-auto space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.07] flex items-center justify-center text-slate-400 dark:text-zinc-500 shadow-2xs">
                      <History size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-semibold text-slate-800 dark:text-zinc-200">
                        No recent workspace activity
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 leading-relaxed">
                        Recent docs, sheets, tasks, and rooms will appear here as soon as you start working.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ── Category-Specific Workspace File Browser ── */
              <div className="space-y-3">
                {searchResults.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between px-1 mb-2">
                      <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-600 dark:text-zinc-400">
                        <RegaarderProductIcon name={activeFilter} size={13} strokeWidth={1.7} className="text-violet-600 dark:text-violet-400" />
                        <span>{getWorkspaceFilterTitle(activeFilter)}</span>
                        <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-normal">
                          · {searchResults.length}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          if (onNavigateToEntity) {
                            onNavigateToEntity({ workspace: activeFilter, actionType: 'create' });
                          }
                        }}
                        className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-violet-600 dark:text-zinc-400 dark:hover:text-violet-400 transition-colors cursor-pointer"
                      >
                        <Plus size={12} strokeWidth={2.0} />
                        <span>{getWorkspaceCtaLabel(activeFilter)}</span>
                      </button>
                    </div>

                    <div className="space-y-1">
                      {searchResults.map((res, itemIdx) => {
                        const isSelected = selectedIndex === itemIdx;
                        const entity = res.entity;

                        return (
                          <div
                            key={entity.id}
                            data-selected={isSelected}
                            onClick={() => handleActivateItem({ type: 'entity', data: entity })}
                            onMouseEnter={() => setSelectedIndex(itemIdx)}
                            className={`flex items-center justify-between p-2.5 rounded-lg transition-all duration-150 cursor-pointer ${
                              isSelected
                                ? 'bg-black/[0.03] dark:bg-white/[0.05]'
                                : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-7 h-7 rounded-md bg-black/[0.03] dark:bg-white/[0.04] flex items-center justify-center text-slate-600 dark:text-zinc-300 shrink-0">
                                <RegaarderProductIcon name={entity.workspace} size={14} strokeWidth={1.6} />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-[12.5px] font-medium text-slate-800 dark:text-zinc-100 truncate">
                                    {entity.title}
                                  </span>
                                  {entity.isCurrent && (
                                    <span className="text-[9px] font-medium uppercase px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono">
                                      Active
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400/90 dark:text-zinc-500 truncate mt-0.5">
                                  {entity.location} • {entity.author}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10.5px] text-slate-400/80 dark:text-zinc-500 font-mono">
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
                  /* Empty State for Selected Category */
                  <div className="py-14 text-center max-w-sm mx-auto space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.07] flex items-center justify-center text-slate-400 dark:text-zinc-500 shadow-2xs">
                      <RegaarderProductIcon name={activeFilter} size={22} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-semibold text-slate-800 dark:text-zinc-200">
                        No {getWorkspaceFilterTitle(activeFilter)} Found
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 leading-relaxed">
                        There are no {getWorkspaceFilterTitle(activeFilter).toLowerCase()} created in your workspace yet.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onNavigateToEntity) {
                          onNavigateToEntity({ workspace: activeFilter, actionType: 'create' });
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-600 hover:bg-violet-700 text-white shadow-2xs transition-all cursor-pointer"
                    >
                      <Plus size={12} strokeWidth={2.0} />
                      <span>{getWorkspaceCtaLabel(activeFilter)}</span>
                    </button>
                  </div>
                )}
              </div>
            )
          )}

          {/* ══════════════════════════════════════════════════════════
              MODE B: SEARCH MODE - ACTIVE QUERY RESULTS
             ══════════════════════════════════════════════════════════ */}
          {mode === 'search' && query.trim() && searchResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-500 mb-3 border border-black/[0.05] dark:border-white/[0.07] shadow-2xs">
                <Search size={18} strokeWidth={1.6} />
              </div>
              <h4 className="text-[13.5px] font-semibold text-slate-800 dark:text-zinc-200 mb-1">
                No results for &ldquo;{query}&rdquo;
              </h4>
              <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-sm leading-relaxed">
                Check your spelling or switch category tabs to search across all Documents, Sheets, Decks, Tasks, Rooms, and Notes.
              </p>
            </div>
          )}

          {mode === 'search' && query.trim() && searchResults.length > 0 && (
            <div className="space-y-4">
              {/* Natural Language Prompt Suggestion Card */}
              {isQuestionQuery && (
                <div 
                  onClick={() => {
                    setMode('ai');
                    handleRunAiSynthesis(query);
                  }}
                  className="p-3.5 rounded-xl bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-transparent border border-violet-500/25 flex items-center justify-between cursor-pointer hover:border-violet-500/40 hover:bg-violet-500/[0.12] transition-all group shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                      <RegaarderAiIcon size={16} strokeWidth={2.0} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[12.5px] font-semibold text-slate-900 dark:text-zinc-100">
                          Ask Memory with AI Intelligence
                        </span>
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-violet-600/15 text-violet-700 dark:text-violet-300 font-mono">
                          Recommended
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                        Synthesize an executive answer for &ldquo;{query}&rdquo; using {activePersona.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-violet-600/10 text-violet-700 dark:text-violet-300 text-[10px] font-mono font-semibold border border-violet-500/20">
                      ↵ Enter
                    </kbd>
                    <ArrowRight size={14} className="text-violet-600 dark:text-violet-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              )}
              {groupedResults.map((group) => (
                <div key={group.label} className="space-y-1">
                  {/* Category Section Header with Native Regaarder SVG Icon */}
                  <div className="flex items-center justify-between px-1 mb-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-zinc-400">
                      <RegaarderProductIcon name={group.workspace} size={12} strokeWidth={1.7} />
                      <span>{group.label}</span>
                      <span className="text-[10.5px] text-slate-400 dark:text-zinc-500 font-normal">
                        · {group.items.length}
                      </span>
                    </div>
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
                        className={`group relative flex flex-col p-2.5 rounded-lg transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? 'bg-white dark:bg-zinc-800 border border-slate-200/90 dark:border-zinc-700 shadow-2xs'
                            : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.03] border border-black/[0.03] dark:border-white/[0.04]'
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
                              <div className="w-6 h-6 rounded-md bg-black/[0.03] dark:bg-white/[0.04] flex items-center justify-center text-slate-600 dark:text-zinc-300 shrink-0 mt-0.5">
                                <RegaarderProductIcon name={entity.workspace} size={12} strokeWidth={1.6} />
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-[12.5px] font-semibold text-slate-900 dark:text-zinc-100 truncate">
                                  <HighlightedText text={entity.title} query={query} />
                                </h4>
                                {entity.type === 'person' && entity.role && (
                                  <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-black/[0.03] dark:bg-white/[0.04] text-slate-500 dark:text-zinc-400 shrink-0">
                                    {entity.role}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10.5px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">
                                <HighlightedText text={entity.location} query={query} />
                                {entity.author && ` • ${entity.author}`}
                              </div>
                            </div>
                          </div>

                          {/* Metric / Formula / Status Pill */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {entity.metadata?.cellValue && (
                              <span className="px-2 py-0.5 text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded">
                                <HighlightedText text={entity.metadata.cellValue} query={query} />
                              </span>
                            )}
                            {entity.metadata?.priority && (
                              <span className={`px-1.5 py-0.2 text-[9px] font-medium rounded uppercase tracking-wider font-mono ${
                                entity.metadata.priority === 'High'
                                  ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
                                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                              }`}>
                                {entity.metadata.priority}
                              </span>
                            )}
                            {entity.metadata?.status && (
                              <span className="px-1.5 py-0.2 text-[9.5px] font-medium bg-black/[0.04] dark:bg-white/[0.06] text-slate-500 dark:text-zinc-400 rounded">
                                {entity.metadata.status}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Snippet preview with keyword highlighting */}
                        {res.snippet && (
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed pl-8 mt-0.5">
                            <HighlightedText text={res.snippet} query={query} />
                          </p>
                        )}

                        {/* Formula row if available */}
                        {entity.metadata?.formula && (
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-600 dark:text-zinc-400 pl-8 mt-1">
                            <span className="text-[9px] font-sans font-medium text-slate-400">Formula:</span>
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

        {/* ── Recent Inquiries Strip (Apple-Style Ambient Memory) ── */}
        {recentInquiries.length > 0 && (
          <div className="px-5 py-2 border-t border-black/[0.04] dark:border-white/[0.05] bg-slate-50/70 dark:bg-zinc-900/60 flex items-center gap-2 select-none">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 font-mono shrink-0 flex items-center gap-1">
              <History size={11} className="text-violet-600 dark:text-violet-400" />
              Recent:
            </span>
            <div className="relative flex items-center gap-1.5 min-w-0 flex-1" ref={recentHistoryRef}>
              {recentInquiries.slice(0, 3).map((inq) => (
                <button
                  key={inq.id}
                  type="button"
                  onClick={() => handleRestorePastInquiry(inq)}
                  className="px-2.5 py-0.5 rounded-lg text-[11px] bg-white dark:bg-zinc-800 hover:bg-violet-50 dark:hover:bg-violet-950/40 text-slate-700 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-violet-300 border border-slate-200/80 dark:border-zinc-700/60 transition-all shrink-0 cursor-pointer shadow-2xs font-medium"
                  title={inq.query}
                >
                  {inq.query.length > 28 ? `${inq.query.slice(0, 28)}…` : inq.query}
                </button>
              ))}
              {recentInquiries.length > 3 && (
                <button
                  type="button"
                  onClick={() => setIsRecentHistoryOpen((prev) => !prev)}
                  className="px-2.5 py-0.5 rounded-lg text-[11px] bg-transparent hover:bg-violet-50 dark:hover:bg-violet-950/40 text-violet-600 dark:text-violet-300 border border-violet-200/70 dark:border-violet-800/50 transition-all shrink-0 cursor-pointer font-medium"
                  aria-expanded={isRecentHistoryOpen}
                  aria-haspopup="listbox"
                >
                  +{recentInquiries.length - 3} more
                </button>
              )}
              {isRecentHistoryOpen && recentInquiries.length > 3 && (
                <div className="absolute left-0 bottom-full mb-2 w-72 max-h-56 overflow-y-auto rounded-xl border border-slate-200/90 dark:border-zinc-700 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-xl p-1.5 z-[100010]">
                  {recentInquiries.slice(3).map((inq) => (
                    <button
                      key={inq.id}
                      type="button"
                      onClick={() => {
                        handleRestorePastInquiry(inq);
                        setIsRecentHistoryOpen(false);
                      }}
                      className="w-full px-2.5 py-2 rounded-lg text-left text-[11px] text-slate-700 dark:text-zinc-300 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-700 dark:hover:text-violet-300 truncate cursor-pointer transition-colors"
                      title={inq.query}
                      role="option"
                    >
                      {inq.query}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleClearInquiriesHistory}
              className="text-[10px] text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 shrink-0 ml-auto transition-colors cursor-pointer"
              title="Clear inquiry history"
            >
              Clear History
            </button>
          </div>
        )}

        {/* ── Footer Cheatsheet Bar ── */}
        <div className={`flex items-center justify-between px-5 py-2.5 text-[11px] text-slate-500 dark:text-zinc-400 shrink-0 ${footerClasses}`}>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-400 dark:text-zinc-500">
              <kbd className="px-1.5 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.06] text-slate-500 dark:text-zinc-400 font-mono text-[10px]">↑↓</kbd>
              <span>{t('search.navigate') || 'Navigate'}</span>
            </span>
            <span className="flex items-center gap-1 text-slate-400 dark:text-zinc-500">
              <kbd className="px-1.5 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.06] text-slate-500 dark:text-zinc-400 font-mono text-[10px]">↵</kbd>
              <span>{mode === 'ai' || isQuestionQuery ? 'Ask Memory' : (t('search.open') || 'Open')}</span>
            </span>
            <span className="flex items-center gap-1 text-slate-400 dark:text-zinc-500">
              <kbd className="px-1.5 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.06] text-slate-500 dark:text-zinc-400 font-mono text-[10px]">Esc</kbd>
              <span>{t('common.close') || 'Close'}</span>
            </span>

            {(aiResponse || query || conversationThread.length > 0) && (
              <button
                type="button"
                onClick={handleClearMemorySynthesis}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/[0.03] hover:bg-rose-50 dark:bg-white/[0.04] dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 font-medium text-[10.5px] transition-colors cursor-pointer ml-1"
                title="Reset search and clear current synthesis"
              >
                <RotateCcw size={10} />
                <span>Reset Search</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 font-medium text-slate-400 dark:text-zinc-500 text-[10.5px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70 inline-block" />
            <span>{t('search.footerBrand') || 'Regaarder Context Search'}</span>
            <button
              type="button"
              onClick={() => setIsWorkspaceSettingsOpen(true)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer"
              title="Open workspace settings"
            >
              <Sliders size={10} strokeWidth={2} />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {isWorkspaceSettingsOpen && (
        <div
          className="fixed inset-0 z-[100020] bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-100"
          onClick={() => setIsWorkspaceSettingsOpen(false)}
        >
          <div
            className="w-full max-w-4xl rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl p-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.12em] font-bold text-violet-600 dark:text-violet-400 font-mono">Executive Settings</div>
                <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-zinc-100">Workspace Memory & Brand Controls</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWorkspaceSettingsOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-3.5">
              <div className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/80 dark:bg-zinc-800/60 p-3.5">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[12px] font-semibold text-slate-800 dark:text-zinc-100">Brand Rules</span>
                  <span className="text-[10px] font-medium text-violet-600 dark:text-violet-400">{brandRules.length}</span>
                </div>
                <div className="space-y-2">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-semibold px-3 py-2 transition-colors cursor-pointer">
                    <FileUp size={12} /> Upload MD
                  </button>
                  <button type="button" onClick={() => setIsMdModalOpen(true)} className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 text-[11px] font-semibold px-3 py-2 transition-colors cursor-pointer">
                    <Plus size={12} /> Add Rule Set
                  </button>
                  <div className="text-[10.5px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    {brandRules.slice(0, 2).map((rule) => (
                      <div key={rule.id} className="mb-1.5 last:mb-0">
                        <span className="font-semibold text-slate-700 dark:text-zinc-200">{rule.label}:</span> {rule.value}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/80 dark:bg-zinc-800/60 p-3.5">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[12px] font-semibold text-slate-800 dark:text-zinc-100">Ambient Habits</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live</span>
                </div>
                <div className="space-y-2">
                  {LEARNED_HABITS.map((habit) => {
                    const IconComponent = habit.icon;
                    return (
                      <div key={habit.id} className="flex items-start gap-2.5 rounded-lg bg-white/70 dark:bg-zinc-900/60 p-2">
                        <div className="w-6 h-6 rounded-md bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0"><IconComponent size={12} /></div>
                        <div className="min-w-0">
                          <div className="text-[11px] font-semibold text-slate-800 dark:text-zinc-100">{habit.title}</div>
                          <div className="text-[10px] text-slate-500 dark:text-zinc-400 leading-snug">{habit.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/80 dark:bg-zinc-800/60 p-3.5">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[12px] font-semibold text-slate-800 dark:text-zinc-100">Cognitive Lens</span>
                  <button type="button" onClick={() => handleOpenEditPersona(activePersona)} className="text-[10px] font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 cursor-pointer">Edit</button>
                </div>
                <div className="space-y-2.5">
                  <div className="rounded-lg bg-violet-50 dark:bg-violet-950/40 p-2.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-300">Active Lens</div>
                    <div className="mt-1 text-[12px] font-semibold text-slate-900 dark:text-zinc-100">{activePersona.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400">{activePersona.badge}</div>
                  </div>
                  <div className="rounded-lg bg-white dark:bg-zinc-900 p-2.5 border border-slate-200 dark:border-zinc-700">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Directive</div>
                    <p className="mt-1 text-[10.5px] leading-relaxed text-slate-600 dark:text-zinc-300 italic">“{activePersona.instructions}”</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button type="button" onClick={() => setIsWorkspaceSettingsOpen(false)} className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Cognitive Lens Prompt Modal ── */}
      {isEditPersonaModalOpen && (
        <div 
          className="fixed inset-0 z-[100010] bg-black/45 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-100"
          onClick={() => setIsEditPersonaModalOpen(false)}
        >
          <div 
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150 font-sans text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-violet-600 text-white flex items-center justify-center font-bold text-xs">
                  {editingPersonaName ? editingPersonaName.charAt(0) : 'P'}
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Customize Persona System Prompt
                </h4>
              </div>
              <button 
                type="button" 
                onClick={() => setIsEditPersonaModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Define the tone, behavioral guidelines, what to say, and what to avoid. Saved 100% on your device and applied whenever querying Memory.
            </p>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono block mb-1">
                    Persona Name
                  </label>
                  <input
                    type="text"
                    value={editingPersonaName}
                    onChange={(e) => setEditingPersonaName(e.target.value)}
                    placeholder="e.g. Peter Thiel, Warren Buffett"
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono block mb-1">
                    Badge / Specialty
                  </label>
                  <input
                    type="text"
                    value={editingPersonaBadge}
                    onChange={(e) => setEditingPersonaBadge(e.target.value)}
                    placeholder="e.g. Contrarian & Zero-to-One"
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono block mb-1">
                  System Directive & Behavioral Prompt
                </label>
                <textarea
                  rows={6}
                  value={editingPersonaInstructions}
                  onChange={(e) => setEditingPersonaInstructions(e.target.value)}
                  placeholder="What the persona should focus on, its tone of voice, what it should never do..."
                  className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 outline-none focus:border-violet-500 resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={handleResetActivePersona}
                className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <RotateCcw size={11} />
                <span>Reset to Default</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditPersonaModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustomPersona}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-xs transition-all cursor-pointer"
                >
                  Save Lens to Device
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
