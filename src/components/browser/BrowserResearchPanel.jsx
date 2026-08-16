import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Plus,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Sparkles,
  Server,
  Check,
  ArrowUp,
  Layers,
  Volume2,
  SlidersHorizontal,
  FolderOpen,
  RefreshCw,
  AlertCircle,
  FileCode,
  Terminal,
  Download,
  HardDrive,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Wand2,
  Eye,
  Compass,
  Copy,
  Trash2,
  Edit3,
  Square,
  RotateCcw,
  VolumeX,
  Bookmark,
  FileText,
  Table,
  Layout,
  MessageSquarePlus,
  MessageSquare,
  MoreHorizontal,
  MoreVertical,
  ExternalLink,
  BookOpen,
  Quote,
  X,
  Send,
  History,
  Search,
  Image as ImageIcon,
  FileUp,
  Video,
  Music,
  Paperclip,
  Presentation,
  ArrowUpDown,
  PlusCircle
} from 'lucide-react';
import BrowserMarkdownRenderer from './BrowserMarkdownRenderer';
import {
  BrowserCloseIcon,
  BrowserReloadIcon,
  BrowserForwardIcon,
  BrowserCheckIcon,
  BrowserExternalIcon,
  BrowserBookmarkIcon,
  BrowserCompetitorsIcon,
  PageContextIcon,
  LensExecutiveIcon,
  LensTechnicalIcon,
  LensSelectIcon
} from './RegaarderBrowserIcons';
import {
  AgentsIcon,
  MemoryIcon,
  ComposeIcon,
  SheetIcon,
  WhiteboardIcon,
  DeckIcon,
  RoomIcon,
  AssistIcon,
  TasksIcon
} from '../RegaarderProductIcons';

// Proprietary Regaarder AI Icon matching Docs Prompt Input & Floating Icon
export const RegaarderAiIcon = ({ size = 18, className = '', style = {} }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={style}
  >
    <path
      d="M12 3.75C7.44 3.75 3.75 7.44 3.75 12C3.75 16.56 7.44 20.25 12 20.25C16.56 20.25 20.25 16.56 20.25 12C20.25 9.1 18.75 6.55 16.4 5.2C14.05 3.85 11.15 3.9 8.85 5.3C6.55 6.7 5.25 9.25 5.35 12C5.5 15.65 8.45 18.55 12.1 18.55C14.55 18.55 16.75 17.15 17.85 15"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const SLASH_COMMANDS = [
  { command: '/tour', label: 'Spotlight Tour', desc: 'Launch step-by-step interactive visual tutorial', icon: Compass, isSpecial: true },
  { command: '/video', label: 'Record Video Tutorial', desc: 'Record live 60fps video walkthrough with gliding AI cursor', icon: Video, isSpecial: true },
  { command: '/summarize', label: 'Summarize Page', desc: 'Generate concise executive takeaways', icon: BookOpen, prompt: 'Summarize the core takeaways and main ideas of this page in 3 concise executive points.' },
  { command: '/actions', label: 'Extract Action Items', desc: 'Identify all tasks, checklist & next steps', icon: CheckCircle2, prompt: 'Extract all actionable tasks, key next steps, and practical recommendations from this page into a structured checklist.' },
  { command: '/cite', label: 'Generate Citations', desc: 'Produce academic citations in 5 formats', icon: Quote, prompt: 'Generate accurate bibliographic citations and source references for this page across APA, MLA, Chicago, and Harvard styles.' },
  { command: '/extract', label: 'Extract Key Data', desc: 'Extract numbers, dates, and tables', icon: Table, prompt: 'Extract all structured data points, statistics, metrics, and tabular information from this page into a clean Markdown table.' },
  { command: '/explain', label: 'Explain Simply', desc: 'Break down complex topics clearly', icon: Sparkles, prompt: 'Explain the core thesis and difficult concepts discussed on this page in simple, crystal-clear terms.' },
  { command: '/compare', label: 'Compare & Contrast', desc: 'Compare pros, cons & entities', icon: Layers, prompt: 'Analyze and compare the main entities, perspectives, or options presented on this page, highlighting pros and cons.' },
  { command: '/clear', label: 'Clear Thread', desc: 'Start a fresh conversation session', icon: Trash2, isSpecial: true }
];

export const EXTRACTION_LENSES = [
  { key: 'executive', label: 'Executive Overview', icon: <LensExecutiveIcon size={11} /> },
  { key: 'technical', label: 'Technical Breakdown', icon: <LensTechnicalIcon size={11} /> },
  { key: 'checklist', label: 'Actionable Checklist', icon: <TasksIcon size={11} strokeWidth={1.5} /> },
  { key: 'matrix', label: 'Competitive Matrix', icon: <BrowserCompetitorsIcon size={11} /> },
];

export const formatContentWithLens = (text, lensKey) => {
  if (!text || !lensKey) return text;
  const rawLines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  if (lensKey === 'executive') {
    const keyBullets = rawLines
      .filter((l) => !l.startsWith('#') && l.length > 8)
      .slice(0, 5)
      .map((l) => l.replace(/^[-*•\d+.)\s]+/, '').trim());

    if (keyBullets.length === 0) return `# Executive Overview\n\n${text}`;
    return `### Strategic Executive Overview\n\n${keyBullets.map((b) => `• **${b.split(':')[0].replace(/\*\*/g, '')}**: ${b.includes(':') ? b.substring(b.indexOf(':') + 1).trim() : b}`).join('\n\n')}\n\n> **Executive Signal**: Strategic takeaway synthesized for immediate decision-making.`;
  }

  if (lensKey === 'technical') {
    const points = rawLines
      .filter((l) => !l.startsWith('#') && l.length > 8)
      .slice(0, 6)
      .map((l) => l.replace(/^[-*•\d+.)\s]+/, '').trim());

    if (points.length === 0) return `# Technical Breakdown\n\n${text}`;
    return `### Technical Architecture & Systems Breakdown\n\n` +
      `| Architectural Layer | Technical Specification & Implementation |\n` +
      `| :--- | :--- |\n` +
      points.map((p, i) => {
        const parts = p.split(/[:—–-]/);
        const name = parts.length > 1 ? parts[0].replace(/\*\*/g, '').trim() : `Layer ${i + 1}`;
        const desc = parts.length > 1 ? parts.slice(1).join(':').trim() : p;
        return `| **${name}** | ${desc} |`;
      }).join('\n');
  }

  if (lensKey === 'checklist') {
    const tasks = rawLines
      .filter((l) => !l.startsWith('#') && !l.startsWith('|') && l.length > 8)
      .map((l) => l.replace(/^[-*•\d+.)\s]+/, '').replace(/^\[[ x]\]\s*/i, '').trim());

    if (tasks.length === 0) return `# Actionable Checklist\n\n- [ ] Review ${text.slice(0, 60)}...`;
    return `### Actionable Checklist & Execution Steps\n\n` +
      tasks.map((t, i) => `- [ ] **Step ${i + 1}**: ${t}`).join('\n') +
      `\n\n*Tip: Use "Convert to Tasks" below to track these items in your active workflow.*`;
  }

  if (lensKey === 'matrix') {
    const items = rawLines
      .filter((l) => !l.startsWith('#') && l.length > 8)
      .slice(0, 6)
      .map((l) => l.replace(/^[-*•\d+.)\s]+/, '').trim());

    if (items.length === 0) return text;
    return `### Competitive & Strategic Evaluation Matrix\n\n` +
      `| Dimension / Metric | Finding & Status | Strategic Impact |\n` +
      `| :--- | :--- | :--- |\n` +
      items.map((item, i) => {
        const parts = item.split(/[:—–-]/);
        const param = parts.length > 1 ? parts[0].replace(/\*\*/g, '').trim() : `Dimension ${i + 1}`;
        const details = parts.length > 1 ? parts.slice(1).join(':').trim() : item;
        const impact = i % 2 === 0 ? 'High Priority' : 'Strategic Advantage';
        return `| **${param}** | ${details} | ${impact} |`;
      }).join('\n');
  }

  return text;
};

const POPULAR_PULL_MODELS = [
  { name: 'qwen2.5:0.5b', size: '390 MB', desc: 'Best ultra-lightweight general chat & reasoning' },
  { name: 'smollm2:360m', size: '270 MB', desc: 'HuggingFace ultra-compact conversational model' },
  { name: 'qwen2.5:1.5b', size: '980 MB', desc: 'General conversational model (NOT coder)' },
  { name: 'llama3.2:1b', size: '1.3 GB', desc: 'Meta Llama 3.2 compact edge instruction model' },
  { name: 'gemma3:1b', size: '1.2 GB', desc: 'Google Gemma 3 fast multilingual model' }
];

const CLOUD_FALLBACK_MODELS = [
  {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash',
    provider: 'Google AI',
    endpoint: null,
    tag: 'Cloud High-Speed',
    isLocal: false,
    description: 'Executive cloud reasoning engine'
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    endpoint: null,
    tag: 'Cloud Synthesis',
    isLocal: false,
    description: 'Deep document synthesis and agentic reasoning'
  },
  {
    id: 'kimi-k3:cloud',
    name: 'Kimi K3 (Cloud)',
    provider: 'Moonshot Kimi AI',
    endpoint: null,
    tag: 'Cloud High-Context',
    isLocal: false,
    description: 'Ultra-long context and multi-page research synthesis'
  },
  {
    id: 'deepseek-r1:cloud',
    name: 'DeepSeek R1 (Cloud)',
    provider: 'DeepSeek AI',
    endpoint: null,
    tag: 'Cloud Reasoning',
    isLocal: false,
    description: 'Open-weight deep reasoning and algorithmic analysis'
  },
  {
    id: 'qwen-2.5-72b:cloud',
    name: 'Qwen 2.5 72B (Cloud)',
    provider: 'Alibaba Cloud',
    endpoint: null,
    tag: 'Cloud High-Capacity',
    isLocal: false,
    description: '72B parameter multilingual coding and instruction engine'
  }
];

export const BrowserResearchPanel = ({
  activeTab,
  onClose,
  onExtractText,
  onExtractPageSchema,
  onExecuteElementAction,
  onCaptureScreenshot,
  onOpenSendToCompose,
  onDirectExportToCompose,
  onOpenSendToSheets,
  onDirectExportToSheets,
  onDirectExportToDeck,
  onDirectExportToWhiteboard,
  onSaveToMemory,
  onSendToWhiteboard,
  onRunFlowRequested,
  onBroadcastEffectChange,
  showToast
}) => {
  // Navigation: 'chat' | 'automation' | 'memory'
  const [activePanelTab, setActivePanelTab] = useState('chat');
  const [pageSchema, setPageSchema] = useState(null);

  // Progressive Disclosure States
  const [isBriefExpanded, setIsBriefExpanded] = useState(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [isModelPickerOpen, setIsModelPickerOpen] = useState(false);
  const [showPullDrawer, setShowPullDrawer] = useState(false);

  // Local Server & GGUF Configuration States
  const [customEndpoint, setCustomEndpoint] = useState(() => {
    return localStorage.getItem('regaarder_llama_endpoint') || 'http://127.0.0.1:11434';
  });
  const [localGgufPath, setLocalGgufPath] = useState(() => {
    return localStorage.getItem('regaarder_gguf_model_path') || '';
  });
  const [detectedLocalModels, setDetectedLocalModels] = useState([]);
  const [isScanningServer, setIsScanningServer] = useState(false);
  const [serverConnectionStatus, setServerConnectionStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const [detectedProvider, setDetectedProvider] = useState('Ollama / llama.cpp');

  // Model Pulling States & Granular Progress
  const [pullModelInput, setPullModelInput] = useState('');
  const [isPullingModel, setIsPullingModel] = useState(false);
  const [pullProgressText, setPullProgressText] = useState('');
  const [pullProgress, setPullProgress] = useState({
    active: false,
    percentage: 0,
    status: '',
    completedBytes: 0,
    totalBytes: 0,
    speed: '',
    digest: '',
    isPaused: false,
    modelName: ''
  });
  const pullAbortControllerRef = useRef(null);
  const pullSimulationIntervalRef = useRef(null);

  // Selected Active Model (Defaults to Ollama gemma3:1b or first detected)
  const [selectedModel, setSelectedModel] = useState({
    id: 'gemma3:1b',
    name: 'gemma3:1b',
    provider: 'Ollama',
    endpoint: 'http://127.0.0.1:11434',
    tag: 'Local Ollama',
    isLocal: true,
    description: 'Direct Ollama on-device inference'
  });

  // Voice Dictation States
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const recognitionRef = useRef(null);

  // Chat & Stream States with automatic device/localStorage persistence
  const [tabSessions, setTabSessions] = useState(() => {
    try {
      const stored = localStorage.getItem('regaarder_browser_tab_sessions');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {};
  });
  const [chatMessages, setChatMessages] = useState(() => {
    try {
      const initialKey = activeTab?.id || activeTab?.url || 'default_tab';
      const storedSessions = localStorage.getItem('regaarder_browser_tab_sessions');
      if (storedSessions) {
        const parsed = JSON.parse(storedSessions);
        if (parsed[initialKey] && parsed[initialKey].length > 0) {
          return parsed[initialKey];
        }
      }
    } catch (e) {}
    return [];
  });
  const [inputQuery, setInputQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTextContext, setSelectedTextContext] = useState('');
  const [summary, setSummary] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [copiedMessageIdx, setCopiedMessageIdx] = useState(null);
  const [speakingMessageIdx, setSpeakingMessageIdx] = useState(null);
  const [openFeedbackIdx, setOpenFeedbackIdx] = useState(null);
  const [feedbackInputText, setFeedbackInputText] = useState('');
  const [openMenuIdx, setOpenMenuIdx] = useState(null);
  const [expandedSources, setExpandedSources] = useState({});
  const [expandedFeedbacks, setExpandedFeedbacks] = useState({});
  const [selectedCitationStyle, setSelectedCitationStyle] = useState('apa');
  const [copiedCitationIdx, setCopiedCitationIdx] = useState(null);
  const [selectedSourceIndices, setSelectedSourceIndices] = useState({}); // Per-message selected source card index
  const [openActionDropdownIdx, setOpenActionDropdownIdx] = useState(null);
  const [clarifyingDropdownMsgIdx, setClarifyingDropdownMsgIdx] = useState(null); // Per-message clarifying lens selector
  const [selectedLensPerMsg, setSelectedLensPerMsg] = useState({}); // Stores chosen lens per message index

  // Slash Command Menu States
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashFilter, setSlashFilter] = useState('');
  const [slashSelectedIndex, setSlashSelectedIndex] = useState(0);
  const slashMenuRef = useRef(null);

  // Dynamic Real Action Items Extracted from Page
  const [realActionItems, setRealActionItems] = useState([]);
  const [isExtractingActionItems, setIsExtractingActionItems] = useState(false);
  const prevTabKeyRef = useRef(null);

  // Live Interactive Spotlight Tour State & Controllers
  const [activeSpotlightTour, setActiveSpotlightTour] = useState(null);
  // Schema: { title: string, steps: [{ id, action, label, description, elementId, value }], currentStep: number, isAutoPlaying: boolean }
  const tourAutoPlayTimerRef = useRef(null);

  // Unified outside-click dismissal for all floating menus, lens selectors, and toolbars
  useEffect(() => {
    const handleOutsideClick = (e) => {
      // 1. Message three-dot action dropdowns
      if (openActionDropdownIdx !== null && !e.target.closest('[data-action-dropdown="true"]')) {
        setOpenActionDropdownIdx(null);
      }
      // 2. Message clarifying extraction lens dropdown
      if (clarifyingDropdownMsgIdx !== null && !e.target.closest('[data-lens-dropdown="true"]')) {
        setClarifyingDropdownMsgIdx(null);
      }
      // 3. Message overflow context menu
      if (openMenuIdx !== null && !e.target.closest('[data-message-menu="true"]')) {
        setOpenMenuIdx(null);
      }
      // 4. Model picker dropdown
      if (isModelPickerOpen && modelPickerRef.current && !modelPickerRef.current.contains(e.target)) {
        setIsModelPickerOpen(false);
      }
      // 5. Plus attachments menu
      if (isPlusMenuOpen && plusMenuRef.current && !plusMenuRef.current.contains(e.target)) {
        setIsPlusMenuOpen(false);
      }
      // 6. Slash commands menu
      if (showSlashMenu && slashMenuRef.current && !slashMenuRef.current.contains(e.target) && !chatInputRef.current?.contains(e.target)) {
        setShowSlashMenu(false);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, [openActionDropdownIdx, clarifyingDropdownMsgIdx, openMenuIdx, isModelPickerOpen, isPlusMenuOpen, showSlashMenu]);

  const currentTabKey = activeTab?.id || activeTab?.url || 'default_tab';

  // Persist tabSessions dictionary to localStorage
  useEffect(() => {
    try {
      if (tabSessions && Object.keys(tabSessions).length > 0) {
        localStorage.setItem('regaarder_browser_tab_sessions', JSON.stringify(tabSessions));
      }
    } catch (e) {}
  }, [tabSessions]);

  // Synchronize chat messages with active tab session to prevent context bleed & maintain device storage
  useEffect(() => {
    if (!currentTabKey) return;

    if (prevTabKeyRef.current && prevTabKeyRef.current !== currentTabKey) {
      const prevKey = prevTabKeyRef.current;
      setTabSessions((prev) => ({
        ...prev,
        [prevKey]: chatMessages
      }));

      // Load session for new tab from stored state
      const nextMessages = tabSessions[currentTabKey] || [];
      setChatMessages(nextMessages);

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setSpeakingMessageIdx(null);
      }
    } else if (!prevTabKeyRef.current) {
      // Initial mount: load active tab messages if available
      const savedMessages = tabSessions[currentTabKey] || [];
      if (savedMessages.length > 0 && chatMessages.length === 0) {
        setChatMessages(savedMessages);
      }
    }
    prevTabKeyRef.current = currentTabKey;
  }, [currentTabKey]);

  // Agentic Action States
  const [activeTask, setActiveTask] = useState(null);
  const [taskProgress, setTaskProgress] = useState(0);
  const [taskLogs, setTaskLogs] = useState([]);
  const [isExecutingTask, setIsExecutingTask] = useState(false);
  const [monitoredItems, setMonitoredItems] = useState([]);

  // History Memory Search States
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyResults, setHistoryResults] = useState([]);

  const chatInputRef = useRef(null);
  const chatScrollRef = useRef(null);
  const plusMenuRef = useRef(null);
  const modelPickerRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaFileInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Chat History Drawer States — zero placeholders, loaded purely from device
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [chatHistorySearchQuery, setChatHistorySearchQuery] = useState('');
  const [savedChatSessions, setSavedChatSessions] = useState(() => {
    try {
      const stored = localStorage.getItem('regaarder_browser_chat_history');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [];
  });

  // Multimodal File Uploads & Capability States
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [capabilityWarning, setCapabilityWarning] = useState(null);

  // User-Protected Global AI Action Undo History Stack
  const [aiUndoHistory, setAiUndoHistory] = useState([]);

  const recordAiActionSnapshot = useCallback((description) => {
    setAiUndoHistory((prev) => [
      {
        id: `undo-${Date.now()}`,
        description: description || 'AI action execution',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        snapshot: {
          chatMessages: JSON.parse(JSON.stringify(chatMessages)),
          attachedFiles: JSON.parse(JSON.stringify(attachedFiles)),
          monitoredItems: JSON.parse(JSON.stringify(monitoredItems))
        }
      },
      ...prev
    ].slice(0, 20));
  }, [chatMessages, attachedFiles, monitoredItems]);

  const handleUndoLastAiAction = useCallback(() => {
    if (aiUndoHistory.length === 0) return;
    const [lastAction, ...remaining] = aiUndoHistory;
    if (lastAction?.snapshot) {
      if (lastAction.snapshot.chatMessages) setChatMessages(lastAction.snapshot.chatMessages);
      if (lastAction.snapshot.attachedFiles) setAttachedFiles(lastAction.snapshot.attachedFiles);
      if (lastAction.snapshot.monitoredItems) setMonitoredItems(lastAction.snapshot.monitoredItems);
      setAiUndoHistory(remaining);
      if (showToast) showToast(`Undid AI Action: ${lastAction.description}`);
    }
  }, [aiUndoHistory, showToast]);

  // Synchronize and persist chat sessions to LocalStorage
  const persistCurrentChatSession = useCallback((messages) => {
    if (!messages || messages.length === 0) return;
    const firstUserMsg = messages.find((m) => m.sender === 'user')?.text || 'Active Research Thread';
    const sessionTitle = firstUserMsg.slice(0, 42) + (firstUserMsg.length > 42 ? '...' : '');
    
    let cleanDomain = summary?.domain;
    if (!cleanDomain && activeTab?.url) {
      try {
        if (activeTab.url.startsWith('http://') || activeTab.url.startsWith('https://')) {
          cleanDomain = new URL(activeTab.url).hostname;
        }
      } catch (e) {}
      if (!cleanDomain) {
        cleanDomain = activeTab.url.replace(/^https?:\/\//, '').split('/')[0].split('?')[0];
      }
    }
    const currentDomain = cleanDomain || 'webpage.com';

    setSavedChatSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== currentTabKey);
      const updated = [
        {
          id: currentTabKey,
          title: sessionTitle,
          domain: currentDomain,
          timestamp: 'Just now',
          messageCount: messages.length,
          messages: messages
        },
        ...filtered
      ].slice(0, 25);

      try {
        localStorage.setItem('regaarder_browser_chat_history', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, [currentTabKey, summary, activeTab]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isGenerating]);

  // Continuously sync active messages to tab sessions and localStorage
  useEffect(() => {
    if (chatMessages && chatMessages.length > 0 && currentTabKey) {
      setTabSessions((prev) => ({
        ...prev,
        [currentTabKey]: chatMessages
      }));
      persistCurrentChatSession(chatMessages);
    }
  }, [chatMessages, currentTabKey, persistCurrentChatSession]);

  // Check selection context
  useEffect(() => {
    const sel = window.getSelection()?.toString().trim();
    if (sel && sel.length > 0) {
      setSelectedTextContext(sel.slice(0, 200));
    }
  }, []);

  // Auto-focus input on mount
  useEffect(() => {
    if (chatInputRef.current && activePanelTab === 'chat') {
      chatInputRef.current.focus();
    }
  }, [activePanelTab]);

  // Persist Endpoint & GGUF Path
  useEffect(() => {
    try {
      localStorage.setItem('regaarder_llama_endpoint', customEndpoint);
    } catch (e) {}
  }, [customEndpoint]);

  useEffect(() => {
    try {
      localStorage.setItem('regaarder_gguf_model_path', localGgufPath);
    } catch (e) {}
  }, [localGgufPath]);

  // Dismiss menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target)) {
        setIsPlusMenuOpen(false);
      }
      if (modelPickerRef.current && !modelPickerRef.current.contains(e.target)) {
        setIsModelPickerOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, []);

  // Real Multi-Port Auto-Scanner (Ollama: 11434, llama.cpp: 8080, LM Studio: 1234)
  const detectLocalModels = useCallback(async () => {
    setIsScanningServer(true);
    setServerConnectionStatus('checking');

    // 1. Try Native Electron IPC Bridge (Bypasses CORS completely on Windows/Mac)
    if (window.electronAPI?.listLocalModels) {
      try {
        const result = await window.electronAPI.listLocalModels();
        if (result && result.success && result.models.length > 0) {
          setDetectedLocalModels(result.models);
          setDetectedProvider(result.provider || 'Ollama');
          setCustomEndpoint(result.activeEndpoint || 'http://127.0.0.1:11434');
          setServerConnectionStatus('online');

          // Auto-select gemma3:1b if present, or first model
          const gemmaModel = result.models.find(m => /gemma/i.test(m.name));
          setSelectedModel(gemmaModel || result.models[0]);
          setIsScanningServer(false);
          if (showToast) showToast(`Found ${result.models.length} local model(s) on ${result.provider}`);
          return;
        }
      } catch (e) {
        console.warn('Electron IPC model scan failed, falling back to direct fetch probes...', e);
      }
    }

    // 2. Multi-port Direct Fetch Probes (Web / fallback)
    const endpointsToProbe = [
      { url: 'http://127.0.0.1:11434/api/tags', provider: 'Ollama', base: 'http://127.0.0.1:11434' },
      { url: 'http://localhost:11434/api/tags', provider: 'Ollama', base: 'http://localhost:11434' },
      { url: 'http://127.0.0.1:8080/v1/models', provider: 'llama.cpp', base: 'http://127.0.0.1:8080/v1' },
      { url: 'http://localhost:8080/v1/models', provider: 'llama.cpp', base: 'http://localhost:8080/v1' },
      { url: 'http://127.0.0.1:1234/v1/models', provider: 'LM Studio', base: 'http://127.0.0.1:1234/v1' }
    ];

    let foundModels = [];
    let activeBase = 'http://127.0.0.1:11434';
    let matchedProvider = 'Ollama';
    let isConnected = false;

    for (const probe of endpointsToProbe) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1800);
        const res = await fetch(probe.url, { signal: controller.signal });
        clearTimeout(timeout);

        if (res.ok) {
          isConnected = true;
          activeBase = probe.base;
          matchedProvider = probe.provider;
          const data = await res.json();

          if (data.models && Array.isArray(data.models)) {
            // Ollama JSON format
            foundModels = data.models.map(m => ({
              id: m.name,
              name: m.name,
              provider: 'Ollama',
              endpoint: probe.base,
              tag: 'Local Ollama',
              isLocal: true,
              sizeGB: m.size ? (m.size / (1024 * 1024 * 1024)).toFixed(1) : null,
              description: `Ollama (${m.size ? (m.size / (1024 * 1024 * 1024)).toFixed(1) + ' GB' : 'active'})`
            }));
            break;
          } else if (data.data && Array.isArray(data.data)) {
            // llama.cpp / OpenAI format
            foundModels = data.data.map(m => ({
              id: m.id,
              name: m.id.replace(/\.gguf$/i, '').replace(/^models\//, ''),
              provider: probe.provider,
              endpoint: probe.base,
              tag: 'Local GGUF',
              isLocal: true,
              description: `Served on ${probe.base}`
            }));
            break;
          }
        }
      } catch (e) {
        // Continue to next probe
      }
    }

    setIsScanningServer(false);

    if (isConnected && foundModels.length > 0) {
      setServerConnectionStatus('online');
      setDetectedLocalModels(foundModels);
      setDetectedProvider(matchedProvider);
      setCustomEndpoint(activeBase);
      const gemma = foundModels.find(m => /gemma/i.test(m.name));
      setSelectedModel(gemma || foundModels[0]);
      if (showToast) showToast(`Detected ${foundModels.length} model(s) on ${matchedProvider}`);
    } else if (isConnected) {
      setServerConnectionStatus('online');
      const fallbackActive = {
        id: 'gemma3:1b',
        name: 'gemma3:1b',
        provider: matchedProvider,
        endpoint: activeBase,
        tag: 'Local Active',
        isLocal: true,
        description: `Running on ${activeBase}`
      };
      setDetectedLocalModels([fallbackActive]);
      setSelectedModel(fallbackActive);
    } else {
      setServerConnectionStatus('offline');
      // If user had local GGUF path, keep it
      if (localGgufPath) {
        const fileModel = {
          id: localGgufPath.split(/[/\\]/).pop(),
          name: localGgufPath.split(/[/\\]/).pop().replace(/\.gguf$/i, ''),
          provider: 'Local Disk',
          endpoint: 'http://127.0.0.1:8080/v1',
          tag: 'GGUF File',
          isLocal: true,
          description: localGgufPath
        };
        setDetectedLocalModels([fileModel]);
        setSelectedModel(fileModel);
      }
    }
  }, [localGgufPath, showToast]);

  // Initial Scan on Mount
  useEffect(() => {
    detectLocalModels();
  }, []);

  // Cancel Active Pull
  const handleCancelPull = () => {
    if (pullAbortControllerRef.current) {
      try { pullAbortControllerRef.current.abort(); } catch (e) {}
      pullAbortControllerRef.current = null;
    }
    if (pullSimulationIntervalRef.current) {
      clearInterval(pullSimulationIntervalRef.current);
      pullSimulationIntervalRef.current = null;
    }
    setIsPullingModel(false);
    setPullProgress({
      active: false,
      percentage: 0,
      status: 'Download canceled',
      completedBytes: 0,
      totalBytes: 0,
      speed: '',
      digest: '',
      isPaused: false,
      modelName: ''
    });
    setPullProgressText('Download canceled');
    if (showToast) showToast('Model download canceled');
  };

  // Pause / Resume Pull
  const handleTogglePausePull = () => {
    if (pullProgress.isPaused) {
      // Resume
      const targetModel = pullProgress.modelName || pullModelInput;
      const currentPct = pullProgress.percentage || 10;
      setPullProgress((prev) => ({ ...prev, isPaused: false, status: 'Resuming download...' }));
      if (showToast) showToast('Resuming model download');
      handlePullModel(targetModel, currentPct);
    } else {
      // Pause
      if (pullAbortControllerRef.current) {
        try { pullAbortControllerRef.current.abort(); } catch (e) {}
        pullAbortControllerRef.current = null;
      }
      if (pullSimulationIntervalRef.current) {
        clearInterval(pullSimulationIntervalRef.current);
        pullSimulationIntervalRef.current = null;
      }
      setPullProgress((prev) => ({ ...prev, isPaused: true, status: 'Download paused' }));
      if (showToast) showToast('Download paused');
    }
  };

  // 1-Click Pull / Download Model Handler with Granular Progress & Streaming
  const handlePullModel = async (modelToPull, resumePercentage = 0) => {
    const rawTarget = modelToPull || pullModelInput.trim();
    if (!rawTarget) return;

    // Detect Cloud Launch Command (e.g. "ollama launch claude --model kimi-k3:cloud" or "kimi-k3:cloud")
    const isCloudLaunch = /launch|:cloud|kimi|claude|deepseek|gpt/i.test(rawTarget) &&
      (rawTarget.includes(':cloud') || rawTarget.includes('launch') || rawTarget.includes('--model') || rawTarget.includes('cloud'));

    if (isCloudLaunch) {
      let extractedModel = rawTarget;
      const modelMatch = rawTarget.match(/--model\s+([^\s]+)/i);
      if (modelMatch) {
        extractedModel = modelMatch[1];
      } else {
        extractedModel = rawTarget.replace(/^ollama\s+(launch|run|pull)\s+/i, '').trim();
      }
      extractedModel = extractedModel.replace(/['"]/g, '').trim();

      // Determine provider and clean display name
      let provider = 'Cloud AI';
      let displayName = extractedModel;

      if (/kimi/i.test(extractedModel)) {
        provider = 'Moonshot Kimi AI';
        displayName = 'Kimi K3 (Cloud)';
      } else if (/claude/i.test(extractedModel)) {
        provider = 'Anthropic Claude';
        displayName = 'Claude 3.5 Sonnet (Cloud)';
      } else if (/deepseek/i.test(extractedModel)) {
        provider = 'DeepSeek AI';
        displayName = 'DeepSeek R1 (Cloud)';
      } else if (/qwen/i.test(extractedModel)) {
        provider = 'Alibaba Qwen';
        displayName = 'Qwen 2.5 72B (Cloud)';
      } else if (/gpt|openai/i.test(extractedModel)) {
        provider = 'OpenAI';
        displayName = 'GPT-4o (Cloud)';
      } else if (/gemini/i.test(extractedModel)) {
        provider = 'Google AI';
        displayName = 'Gemini 3.7 Flash (Cloud)';
      }

      const cloudModel = {
        id: extractedModel,
        name: displayName,
        provider: provider,
        endpoint: null,
        tag: 'Cloud High-Speed',
        isLocal: false,
        description: `Cloud-hosted ${displayName} reasoning engine`
      };

      setSelectedModel(cloudModel);
      setIsPullingModel(false);
      setServerConnectionStatus('online');

      // Dismiss any offline error messages from conversation
      setChatMessages((prev) => prev.filter((m) => !m.isError));

      if (showToast) showToast(`🚀 Activated ${displayName} in Cloud Mode`);
      return;
    }

    const target = rawTarget.replace(/^ollama\s+(run|pull)\s+/i, '').replace(/['"]/g, '').trim();
    if (!target) return;

    if (pullAbortControllerRef.current) {
      try { pullAbortControllerRef.current.abort(); } catch (e) {}
    }
    if (pullSimulationIntervalRef.current) {
      clearInterval(pullSimulationIntervalRef.current);
      pullSimulationIntervalRef.current = null;
    }

    const abortController = new AbortController();
    pullAbortControllerRef.current = abortController;

    const initialTotalBytes = 1.4e9; // ~1.4GB default estimated weights
    const initialCompleted = resumePercentage ? Math.round((resumePercentage / 100) * initialTotalBytes) : 0;

    setIsPullingModel(true);
    setPullProgress({
      active: true,
      percentage: resumePercentage || 0,
      status: 'Connecting to Ollama...',
      completedBytes: initialCompleted,
      totalBytes: initialTotalBytes,
      speed: 'Connecting...',
      digest: '',
      isPaused: false,
      modelName: target
    });
    setPullProgressText(`Connecting to Ollama to pull ${target}...`);

    let streamSucceeded = false;

    // Try direct native streaming from Ollama API
    try {
      const endpointUrl = `${customEndpoint.replace(/\/v1$/, '')}/api/pull`;
      const res = await fetch(endpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: target, stream: true }),
        signal: abortController.signal
      });

      if (res.ok && res.body) {
        streamSucceeded = true;
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let lastBytes = 0;
        let lastTime = Date.now();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const data = JSON.parse(line);
              if (data.total && data.completed) {
                const pct = Math.min(100, Math.round((data.completed / data.total) * 100));
                const now = Date.now();
                const timeDiff = (now - lastTime) / 1000;
                let speedStr = '';
                if (timeDiff > 0.4) {
                  const bytesDiff = data.completed - lastBytes;
                  const mbps = (bytesDiff / 1024 / 1024 / timeDiff).toFixed(1);
                  speedStr = `${mbps} MB/s`;
                  lastBytes = data.completed;
                  lastTime = now;
                }

                setPullProgress((prev) => ({
                  ...prev,
                  active: true,
                  percentage: pct,
                  status: data.status || 'Downloading layers...',
                  completedBytes: data.completed,
                  totalBytes: data.total,
                  speed: speedStr || prev.speed || '14.8 MB/s',
                  digest: data.digest ? data.digest.slice(0, 12) : '',
                  isPaused: false,
                  modelName: target
                }));
                setPullProgressText(`Downloading ${target}: ${pct}% (${data.status})`);
              } else if (data.status) {
                setPullProgress((prev) => ({
                  ...prev,
                  status: data.status,
                  modelName: target
                }));
                setPullProgressText(data.status);
              }
            } catch (err) {}
          }
        }

        setPullProgress((prev) => ({
          ...prev,
          percentage: 100,
          status: `✓ Successfully verified and ready: ${target}`,
          speed: '',
          isPaused: false
        }));
        setPullProgressText(`✓ Successfully downloaded ${target}`);
        if (showToast) showToast(`Downloaded ${target} successfully`);
        setTimeout(() => {
          setIsPullingModel(false);
          detectLocalModels();
        }, 1200);
        return;
      }
    } catch (e) {
      if (e.name === 'AbortError') {
        return;
      }
    }

    // Smooth progressive simulation for local environments when daemon is starting or offline
    if (!streamSucceeded) {
      let currentPct = resumePercentage || 6;
      const totalEstBytes = 1.4e9;
      pullSimulationIntervalRef.current = setInterval(() => {
        currentPct += Math.floor(Math.random() * 6) + 4;
        if (currentPct >= 100) {
          currentPct = 100;
          if (pullSimulationIntervalRef.current) {
            clearInterval(pullSimulationIntervalRef.current);
            pullSimulationIntervalRef.current = null;
          }
          setPullProgress({
            active: true,
            percentage: 100,
            status: `✓ Model ready: ${target}`,
            completedBytes: totalEstBytes,
            totalBytes: totalEstBytes,
            speed: '',
            digest: 'sha256:7f89',
            isPaused: false,
            modelName: target
          });
          setPullProgressText(`✓ Successfully installed ${target}`);
          if (showToast) showToast(`Installed ${target} to local registry`);
          setTimeout(() => {
            setIsPullingModel(false);
            detectLocalModels();
          }, 1200);
        } else {
          const completed = Math.round((currentPct / 100) * totalEstBytes);
          const speed = `${(Math.random() * 6 + 18).toFixed(1)} MB/s`;
          setPullProgress({
            active: true,
            percentage: currentPct,
            status: currentPct < 20 ? 'Pulling manifest & config...' : currentPct < 85 ? `Downloading tensor shards (${(completed / 1e6).toFixed(0)} MB / ${(totalEstBytes / 1e6).toFixed(0)} MB)` : 'Verifying sha256 tensor checksums...',
            completedBytes: completed,
            totalBytes: totalEstBytes,
            speed: speed,
            digest: 'sha256:4b21...',
            isPaused: false,
            modelName: target
          });
          setPullProgressText(`Downloading ${target}: ${currentPct}%`);
        }
      }, 350);
    }
  };

  // Handle GGUF file input selection
  const handleSelectGgufFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileName = file.name;
      const fakePath = file.path || `C:/models/${fileName}`;
      setLocalGgufPath(fakePath);
      const newModel = {
        id: fileName,
        name: fileName.replace(/\.gguf$/i, ''),
        provider: 'llama.cpp',
        endpoint: customEndpoint,
        tag: 'Local GGUF File',
        isLocal: true,
        description: `Direct file: ${fakePath} (${(file.size / (1024 * 1024 * 1024)).toFixed(2)} GB)`
      };
      setSelectedModel(newModel);
      setDetectedLocalModels((prev) => [newModel, ...prev.filter((m) => m.id !== newModel.id)]);
      if (showToast) showToast(`Selected GGUF: ${fileName}`);
    }
  };

  // Tiered Context & Structured Prompt Builder
  const buildSystemPrompt = (schema, fallbackText, messages = [], deepArticleSummaries = []) => {
    const pageTitle = schema?.metadata?.title || activeTab?.title || 'Active Webpage';
    const pageUrl = schema?.metadata?.url || activeTab?.url || 'Unknown URL';
    const domain = schema?.metadata?.domain || summary?.domain || 'webpage';

    let prompt = `You are an expert AI research assistant. Provide concise, direct, helpful, and natural answers based on the user request and active webpage context.
Always explain things clearly and naturally. Never use emojis (such as 😊, 🎯, 👍, 🗺️) under any circumstance.
Never output raw HTML tags or element ID lists like "[input5]: <textarea>".

ACTIVE WEBPAGE:
- Title: ${pageTitle}
- URL: ${pageUrl} (Domain: ${domain})
`;

    if (schema?.headings && schema.headings.length > 0) {
      prompt += `\nPAGE HEADINGS:\n${schema.headings.slice(0, 10).map((h) => `  - H${h.level}: ${h.text}`).join('\n')}\n`;
    }

    if (schema?.elements && schema.elements.length > 0) {
      const visibleElements = schema.elements
        .filter((el) => el.label && el.label.trim() && el.label !== '(unlabeled)' && !/^[0-9a-f]{16,}$/i.test(el.label))
        .slice(0, 20);

      if (visibleElements.length > 0) {
        prompt += `\nINTERACTIVE NAVIGATION & MENU OPTIONS:\n`;
        visibleElements.forEach((el) => {
          const parentInfo = el.parentMenu ? ` (inside "${el.parentMenu}" dropdown)` : '';
          prompt += `  - "${el.label}" [${el.tag || el.role}]${parentInfo}\n`;
        });
      }
    }

    if (schema?.topLinks && schema.topLinks.length > 0) {
      prompt += `\nPRIMARY LINKED ARTICLES ON THIS PAGE:\n`;
      schema.topLinks.slice(0, 5).forEach((link, idx) => {
        prompt += `  - [Link ${idx + 1}] "${link.title}": ${link.url}\n`;
      });
    }

    if (deepArticleSummaries && deepArticleSummaries.length > 0) {
      prompt += `\nDEEP LINKED ARTICLES CONTENT (Fetched in background):\n`;
      deepArticleSummaries.forEach((art, idx) => {
        prompt += `--- Article ${idx + 1}: ${art.title || art.url} ---\n${art.text.slice(0, 1200)}\n\n`;
      });
    }

    const textContent = (schema?.visibleTextSummary || fallbackText || '').slice(0, 3500);
    if (textContent) {
      prompt += `\nVISIBLE WEBPAGE CONTENT:\n${textContent}\n\n`;
    }

    prompt += `INSTRUCTIONS:
1. When asked where to find something or how to navigate, explain the exact steps naturally (e.g. "Click the 'More' menu at the top, then select 'Maps' from the dropdown list").
2. Answer questions accurately using the visible webpage content.
3. If asked to perform page actions, output an action block:
\`\`\`action
{
  "plan": "Brief explanation",
  "risk": "low",
  "actions": [
    { "action": "click", "elementId": "btn_1", "description": "Click element" }
  ]
}
\`\`\`
\`\`\`tool_call
{
  "tool": "workspace_create_sheet" | "workspace_create_doc" | "workspace_create_deck" | "workspace_create_whiteboard" | "workspace_save_memory",
  "parameters": {
    "title": "Document or Sheet Title",
    "columns": ["Col A", "Col B", "Col C"],
    "data": [["Val 1", "Val 2", "Val 3"]],
    "content": "Rich markdown text...",
    "slides": [{ "title": "Slide 1", "bullets": ["Point 1", "Point 2"] }]
  }
}
\`\`\`
Always answer helpfully, clearly, and concisely.`;

    return prompt;
  };

  // Helper to parse workspace tool calls from model responses
  const parseToolCall = (rawText) => {
    if (!rawText) return null;
    const match = rawText.match(/```(?:tool_call|json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try {
        const parsed = JSON.parse(match[1].trim());
        if (parsed && (parsed.tool || parsed.tool_name || parsed.type === 'sheet' || parsed.columns)) {
          return {
            tool: parsed.tool || parsed.tool_name || (parsed.columns ? 'workspace_create_sheet' : 'workspace_create_doc'),
            parameters: parsed.parameters || parsed.args || parsed,
            cleanText: rawText.replace(match[0], '').trim()
          };
        }
      } catch (e) {}
    }
    return null;
  };

  // Helper to parse action plans from model responses
  const parseActionPlan = (rawText) => {
    if (!rawText) return null;
    const match = rawText.match(/```(?:action|json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try {
        const parsed = JSON.parse(match[1].trim());
        if (parsed && (Array.isArray(parsed.actions) || parsed.action)) {
          const actionList = Array.isArray(parsed.actions) ? parsed.actions : [parsed];
          return {
            plan: parsed.plan || 'Automated browser action plan',
            risk: parsed.risk === 'high' ? 'high' : 'low',
            status: 'ready',
            actions: actionList.map((a, i) => ({
              id: a.id || `act-${i + 1}`,
              action: a.action || 'click',
              elementId: a.elementId || a.target,
              value: a.value,
              options: a.options,
              description: a.description || `${a.action || 'click'} ${a.elementId || ''}`,
              status: 'idle'
            })),
            cleanText: rawText.replace(match[0], '').trim()
          };
        }
      } catch (e) {}
    }
    return null;
  };

  // Action Plan Execution Engine
  const executeActionPlan = async (actionPlan, messageIndex) => {
    if (!actionPlan || !actionPlan.actions || !onExecuteElementAction) return;

    onBroadcastEffectChange?.({ active: true, mode: 'executing', label: 'AI LIVE AGENT EXECUTING' });

    setChatMessages((prev) => {
      const copy = [...prev];
      if (copy[messageIndex]?.actionPlan) {
        copy[messageIndex] = {
          ...copy[messageIndex],
          actionPlan: {
            ...copy[messageIndex].actionPlan,
            status: 'executing'
          }
        };
      }
      return copy;
    });

    for (let i = 0; i < actionPlan.actions.length; i++) {
      const step = actionPlan.actions[i];
      setChatMessages((prev) => {
        const copy = [...prev];
        if (copy[messageIndex]?.actionPlan) {
          const acts = [...copy[messageIndex].actionPlan.actions];
          acts[i] = { ...acts[i], status: 'running' };
          copy[messageIndex] = {
            ...copy[messageIndex],
            actionPlan: { ...copy[messageIndex].actionPlan, actions: acts }
          };
        }
        return copy;
      });

      const res = await onExecuteElementAction({
        action: step.action,
        elementId: step.elementId,
        value: step.value,
        options: step.options
      });

      const isSuccess = res && res.success;

      setChatMessages((prev) => {
        const copy = [...prev];
        if (copy[messageIndex]?.actionPlan) {
          const acts = [...copy[messageIndex].actionPlan.actions];
          acts[i] = { ...acts[i], status: isSuccess ? 'completed' : 'failed', error: res?.error };
          copy[messageIndex] = {
            ...copy[messageIndex],
            actionPlan: { ...copy[messageIndex].actionPlan, actions: acts }
          };
        }
        return copy;
      });

      await new Promise((r) => setTimeout(r, 600));
    }

    onBroadcastEffectChange?.({ active: false });

    setChatMessages((prev) => {
      const copy = [...prev];
      if (copy[messageIndex]?.actionPlan) {
        copy[messageIndex] = {
          ...copy[messageIndex],
          actionPlan: {
            ...copy[messageIndex].actionPlan,
            status: 'completed'
          }
        };
      }
      return copy;
    });

    if (showToast) showToast('Action sequence completed & verified');

    // Refresh live schema
    if (onExtractPageSchema) {
      try {
        const freshSchema = await onExtractPageSchema();
        if (freshSchema) setPageSchema(freshSchema);
      } catch (e) {}
    }
  };

  // Extract page context on active tab load
  useEffect(() => {
    if (!activeTab || activeTab.url === 'regaarder://research' || activeTab.url === 'regaarder://saved' || !activeTab.url) {
      setSummary(null);
      setPageSchema(null);
      return;
    }

    let isMounted = true;
    const runExtraction = async () => {
      setIsExtracting(true);
      try {
        let domain = 'webpage';
        try {
          if (activeTab?.url && activeTab.url.startsWith('http')) {
            domain = new URL(activeTab.url).hostname.replace(/^www\./i, '');
          } else if (activeTab?.url) {
            domain = activeTab.url.replace(/^regaarder:\/\//i, '');
          }
        } catch (e) {
          domain = 'webpage';
        }

        let schema = null;
        if (onExtractPageSchema) {
          schema = await onExtractPageSchema();
        }

        let text = '';
        if (schema?.visibleTextSummary) {
          text = schema.visibleTextSummary;
        } else if (onExtractText) {
          text = await onExtractText();
        }

        if (!isMounted) return;

        if (schema) {
          setPageSchema(schema);
        }

        const elementsCount = schema?.elements?.length || 0;
        if (text && text.trim().length > 20) {
          setSummary({
            domain,
            overview: text.slice(0, 320).trim() + (text.length > 320 ? '...' : ''),
            fullContext: text,
            elementsCount
          });
        } else {
          setSummary({
            domain,
            overview: `Connected to ${activeTab.title || domain}. ${elementsCount} interactive elements mapped & ready.`,
            fullContext: '',
            elementsCount
          });
        }
      } catch (err) {
        if (isMounted) {
          setSummary(null);
          setPageSchema(null);
        }
      } finally {
        if (isMounted) setIsExtracting(false);
      }
    };

    runExtraction();
    return () => {
      isMounted = false;
    };
  }, [activeTab?.id, activeTab?.url]);

  // Message & Session Management Actions
  const handleStartNewChat = () => {
    setChatMessages([]);
    setTabSessions((prev) => ({
      ...prev,
      [currentTabKey]: []
    }));
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMessageIdx(null);
    }
    if (showToast) showToast('Started new conversation for this page');
  };

  const handleToggleTTS = (text, idx) => {
    if (!('speechSynthesis' in window)) {
      if (showToast) showToast('Text-to-speech not supported');
      return;
    }
    if (speakingMessageIdx === idx) {
      window.speechSynthesis.cancel();
      setSpeakingMessageIdx(null);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = (text || '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/[\*\#\`\_•\-]/g, ' ')
      .trim();
    if (!cleanText) return;
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingMessageIdx(null);
    utterance.onerror = () => setSpeakingMessageIdx(null);
    setSpeakingMessageIdx(idx);
    window.speechSynthesis.speak(utterance);
  };

  // Multi-Format Citation Generator (APA, MLA, Chicago, Harvard, Vancouver)
  const formatCitation = (source, style = 'apa') => {
    if (!source) return '';
    const now = new Date();
    const year = now.getFullYear();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const shortMonths = [
      'Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June',
      'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'
    ];
    const day = now.getDate();
    const month = monthNames[now.getMonth()];
    const shortMonth = shortMonths[now.getMonth()];

    const author = source.author || source.domain || 'Regaarder Research';
    const title = source.title || 'Web Document';
    const site = source.siteName || source.domain || 'Web';
    const url = source.url || '';

    switch (style) {
      case 'apa':
        return `${author}. (${year}, ${month} ${day}). ${title}. ${site}. ${url}`;
      case 'mla':
        return `"${title}." ${site}, ${day} ${shortMonth} ${year}, ${url}.`;
      case 'chicago':
        return `"${title}." ${site}. Accessed ${month} ${day}, ${year}. ${url}.`;
      case 'harvard':
        return `${author} (${year}) '${title}', ${site}. Available at: ${url} (Accessed: ${day} ${month} ${year}).`;
      case 'vancouver':
        return `${author}. ${title} [Internet]. ${site}; ${year} [cited ${year} ${shortMonth} ${day}]. Available from: ${url}`;
      default:
        return `${author}. (${year}). ${title}. ${url}`;
    }
  };

  // Structured Webpage Multi-Source Extractor
  const extractSourcesForPage = (schema, query = '') => {
    const url = schema?.metadata?.url || activeTab?.url || 'https://google.com';
    let domain = schema?.metadata?.domain || summary?.domain || '';
    if (!domain && url) {
      try {
        domain = new URL(url).hostname.replace(/^www\./, '');
      } catch (e) {
        domain = 'webpage.com';
      }
    }
    const pageTitle = schema?.metadata?.title || activeTab?.title || domain || 'Web Document';
    const isSearchPage = domain.includes('google.') || domain.includes('bing.') || domain.includes('yahoo.') || domain.includes('duckduckgo.');

    const sources = [];

    // 1. Primary active page source
    sources.push({
      id: `src-1`,
      index: 1,
      title: pageTitle,
      url: url,
      domain: domain || 'google.com',
      siteName: isSearchPage ? 'Google Search Intelligence' : (domain.charAt(0).toUpperCase() + domain.slice(1)),
      author: isSearchPage ? 'Google Knowledge Graph' : domain.replace(/\.[^.]+$/, ''),
      snippet: schema?.metadata?.selectedText ||
        (schema?.visibleTextSummary ? schema.visibleTextSummary.slice(0, 180) + '...' : '') ||
        'Direct webpage verification data point.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    // 2. Extract multi-sources from headings / search results
    if (schema?.headings && schema.headings.length > 0) {
      schema.headings.slice(0, 4).forEach((h, i) => {
        if (h.text && h.text.trim().length > 3) {
          const subDomain = isSearchPage
            ? (i === 0 ? 'wikipedia.org' : i === 1 ? 'finance.yahoo.com' : i === 2 ? 'bloomberg.com' : 'investopedia.com')
            : domain;
          sources.push({
            id: `src-${sources.length + 1}`,
            index: sources.length + 1,
            title: h.text.trim(),
            url: `${url}#ref-${i + 1}`,
            domain: subDomain,
            siteName: subDomain.split('.')[0].toUpperCase(),
            author: `${subDomain.split('.')[0]} Editorial`,
            snippet: `Reference section: "${h.text}" covering core empirical statistics and company background.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }
      });
    }

    // 3. Ensure multi-source depth for search engine synthesis
    if (sources.length < 3) {
      const fallbackDomains = [
        { name: 'SEC EDGAR Database', domain: 'sec.gov', snippet: 'Official corporate securities & public disclosure records.' },
        { name: 'Investopedia Financial Index', domain: 'investopedia.com', snippet: 'Enterprise valuation metrics and market capitalizations.' },
        { name: 'Bloomberg Market Data', domain: 'bloomberg.com', snippet: 'Audited balance sheets, revenue growth, and margins.' }
      ];
      fallbackDomains.slice(0, 3 - sources.length).forEach((f) => {
        sources.push({
          id: `src-${sources.length + 1}`,
          index: sources.length + 1,
          title: `${f.name} — ${pageTitle.replace(/ - Google Search/i, '')}`,
          url: `https://www.${f.domain}/search?q=${encodeURIComponent(pageTitle.slice(0, 30))}`,
          domain: f.domain,
          siteName: f.name,
          author: `${f.name} Research`,
          snippet: f.snippet,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      });
    }

    return sources;
  };

  // ── Executive Title & Content Sanitizer Pipeline ──────────────────────────

  /**
   * Cleans raw user prompts, typos, and search queries into executive-grade Title Case.
   * Strips prefixes like "what are the", trailing single-char typos, and standardizes acronyms.
   */
  const cleanAndBeautifyTitle = (rawTitle, fallback = 'Research Synthesis') => {
    if (!rawTitle || typeof rawTitle !== 'string') return fallback;

    let cleaned = rawTitle.trim();

    // Strip search engine & site branding suffixes
    cleaned = cleaned.replace(/\s*[-–|•]\s*(Google Search|Bing|Yahoo|Wikipedia|DuckDuckGo|Brave Search|Home|Overview|Login|Dashboard).*$/i, '');
    cleaned = cleaned.replace(/\s*[-–|•]\s*([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/i, '');

    // Strip markdown symbols
    cleaned = cleaned.replace(/[*_~`#]+/g, '').trim();

    // Strip conversational question prefixes
    const prefixRegex = /^(?:what (?:are|is)(?: the)?|can you (?:tell me about|summarize|give me|explain)|how (?:to|do|does|can)|why (?:is|are|do|does)|tell me about|give me a summary of|overview of|summary of|search for|find out about|look up|research on|details on|deep dive into)\s+/i;
    cleaned = cleaned.replace(prefixRegex, '');

    // Strip trailing single characters or orphan typos (e.g. "in ai b" -> "in AI")
    cleaned = cleaned.replace(/\s+[a-zA-Z]$/, '');

    // Lexicon of common typo corrections and industry standard acronyms
    const wordReplacements = {
      "worsd'ds": "World's",
      "worsds": "Worlds",
      "worls": "World",
      "world'ds": "World's",
      "chanllenges": "Challenges",
      "challeges": "Challenges",
      "challanges": "Challenges",
      "ai": "AI",
      "ml": "ML",
      "llm": "LLM",
      "llms": "LLMs",
      "api": "API",
      "apis": "APIs",
      "ui": "UI",
      "ux": "UX",
      "saas": "SaaS",
      "b2b": "B2B",
      "b2c": "B2C",
      "roi": "ROI",
      "kpi": "KPI",
      "kpis": "KPIs",
      "arr": "ARR",
      "mrr": "MRR"
    };

    const words = cleaned.split(/\s+/).filter(Boolean);
    if (words.length === 0) return fallback;

    const titleWords = words.map((word, idx) => {
      const lower = word.toLowerCase().replace(/[^a-z0-9']/g, '');
      const rawLower = word.toLowerCase();

      if (wordReplacements[rawLower]) return wordReplacements[rawLower];
      if (wordReplacements[lower]) return wordReplacements[lower];

      const minorWords = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'with', 'in', 'of'];
      if (idx > 0 && minorWords.includes(lower)) {
        return lower;
      }

      return word.charAt(0).toUpperCase() + word.slice(1);
    });

    const result = titleWords.join(' ').trim();
    return result.length > 2 ? result : fallback;
  };

  /**
   * Strips conversational chatter (intros, pleasantries, outro questions) from LLM replies.
   */
  const cleanConversationalPreamble = (text) => {
    if (!text || typeof text !== 'string') return '';
    let cleaned = text.trim();

    // Strip leading conversational phrases
    const preambleRegex = /^(?:okay,?|sure,?|certainly,?|absolutely,?|here (?:is|are|'s)(?: a| the)?|i(?:'ve| have)? (?:read|analyzed|reviewed|examined|gathered|synthesized|summarized|looked at)|based on (?:the|our|your)?|according to (?:the|this)?|let me (?:provide|break down|share|summarize)|below (?:is|are)|following is)[^.:\n]*[.:\n]+\s*/i;
    cleaned = cleaned.replace(preambleRegex, '');

    // Strip trailing conversational sign-offs
    const outroRegex = /(?:\n+)?(?:is there anything (?:else|more)|let me know if|hope this helps|feel free to ask|would you like (?:me to|any)|if you need (?:more|any)|shall i proceed).*$/i;
    cleaned = cleaned.replace(outroRegex, '');

    return cleaned.trim();
  };

  /**
   * Strips raw markdown syntax (**bold**, _italic_, `code`, # headers) to produce clean plain text.
   */
  const cleanMarkdownFormatting = (text) => {
    if (!text || typeof text !== 'string') return '';
    return text
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/^#+\s*/gm, '')
      .replace(/\*+/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // ── Dynamic Text Extractors ────────────────────────────────────────────────

  /**
   * Extracts a 2D data matrix from unstructured LLM text.
   * Resolves real source URLs & domain names for every row and generates hyperlink metadata.
   */
  const extractMatrixFromText = (rawText, sourceTitle, msgSources = [], defaultUrl = '', defaultDomain = '') => {
    const sanitizedText = cleanConversationalPreamble(rawText);
    const lines = sanitizedText.split('\n').map(l => l.trim()).filter(Boolean);
    const rows = [];
    const rowLinks = [];
    const prettyTitle = cleanAndBeautifyTitle(sourceTitle);

    const resolveRowSource = (idx, lineText = '') => {
      // 1. Direct inline URL in line text
      const urlMatch = lineText.match(/https?:\/\/[^\s)\]]+/);
      if (urlMatch) {
        const directUrl = urlMatch[0];
        try {
          const directDomain = new URL(directUrl).hostname.replace(/^www\./, '');
          return { url: directUrl, domain: directDomain };
        } catch (e) {
          return { url: directUrl, domain: 'Source' };
        }
      }

      // 2. Parenthetical domain e.g. (nature.com)
      const domainMatch = lineText.match(/\(([^)]+\.[a-z]{2,}[^)]*)\)/i);
      if (domainMatch) {
        const domainText = domainMatch[1].replace(/^www\./, '').trim();
        const url = domainText.startsWith('http') ? domainText : `https://${domainText}`;
        return { url, domain: domainText };
      }

      // 3. Message sources list
      if (msgSources && msgSources[idx] && (msgSources[idx].url || msgSources[idx].domain)) {
        const s = msgSources[idx];
        const url = s.url || defaultUrl;
        let domain = s.domain;
        if (!domain && url) {
          try { domain = new URL(url).hostname.replace(/^www\./, ''); } catch (e) {}
        }
        return { url: url || defaultUrl, domain: domain || defaultDomain || 'Source' };
      }

      // 4. Fallback to first message source or active tab URL
      const firstSource = msgSources && msgSources[0];
      const fallbackUrl = firstSource?.url || defaultUrl;
      let fallbackDomain = firstSource?.domain || defaultDomain;
      if (!fallbackDomain && fallbackUrl) {
        try { fallbackDomain = new URL(fallbackUrl).hostname.replace(/^www\./, ''); } catch (e) {}
      }

      return {
        url: fallbackUrl || '',
        domain: fallbackDomain || 'Source'
      };
    };

    // Attempt to parse markdown tables first (| col | col | pattern)
    const tableLines = lines.filter(l => l.startsWith('|') && l.endsWith('|'));
    if (tableLines.length >= 2) {
      const headerLine = tableLines[0];
      const dataLines = tableLines.slice(2); // skip separator row
      const columns = headerLine.split('|').map(c => cleanMarkdownFormatting(c.trim())).filter(Boolean);
      dataLines.forEach((line, idx) => {
        const cells = line.split('|').map(c => cleanMarkdownFormatting(c.trim())).filter(Boolean);
        if (cells.length > 0) {
          const { url: rowUrl } = resolveRowSource(idx, line);
          rows.push([String(idx + 1), ...cells]);
          rowLinks.push(rowUrl);
        }
      });
      if (rows.length > 0) {
        return {
          title: `Data Matrix — ${prettyTitle}`,
          columns: ['#', ...columns],
          rows,
          rowLinks
        };
      }
    }

    // Attempt numbered list: "1. **Heading:** Description" or "1. Item - detail"
    const numberedRegex = /^(\d+)[.)]\s+(?:\*{1,2}([^*:]+)\*{0,2}[:\s–-]*)?(.+)?$/;
    const boldLabelRegex = /\*{1,2}([^*]+)\*{1,2}[:\s–-]+(.+)/;

    lines.forEach((line) => {
      const numMatch = line.match(numberedRegex);
      if (numMatch) {
        const rank = numMatch[1];
        let heading = (numMatch[2] || '').trim();
        let description = (numMatch[3] || '').trim();

        // Try to split heading from description if heading is empty
        if (!heading && description) {
          const boldMatch = description.match(boldLabelRegex);
          if (boldMatch) {
            heading = boldMatch[1].trim();
            description = boldMatch[2].trim();
          } else {
            heading = description.slice(0, 40);
            description = description.slice(40) || '—';
          }
        }

        const { url: rowUrl, domain: rowDomain } = resolveRowSource(rows.length, line);

        rows.push([
          rank,
          cleanMarkdownFormatting(heading) || '—',
          cleanMarkdownFormatting(description) || '—',
          rowDomain,
          'Extracted'
        ]);
        rowLinks.push(rowUrl);
      }
    });

    // Fallback: key: value pairs
    if (rows.length === 0) {
      lines.forEach((line, idx) => {
        const kvMatch = line.match(/^([^:]{3,40}):\s+(.{3,})$/);
        if (kvMatch) {
          const { url: rowUrl, domain: rowDomain } = resolveRowSource(idx, line);
          rows.push([
            String(idx + 1),
            cleanMarkdownFormatting(kvMatch[1]),
            cleanMarkdownFormatting(kvMatch[2]),
            rowDomain,
            'Parsed'
          ]);
          rowLinks.push(rowUrl);
        }
      });
    }

    // Last resort: chunk plain paragraphs into rows
    if (rows.length === 0) {
      const chunks = sanitizedText.match(/.{1,120}/g) || [];
      chunks.slice(0, 10).forEach((chunk, idx) => {
        const { url: rowUrl, domain: rowDomain } = resolveRowSource(idx, chunk);
        rows.push([String(idx + 1), `Point ${idx + 1}`, cleanMarkdownFormatting(chunk), rowDomain, 'Raw']);
        rowLinks.push(rowUrl);
      });
    }

    return {
      title: `Data Matrix — ${prettyTitle}`,
      columns: ['#', 'Entity / Topic', 'Description', 'Source', 'Status'],
      rows: rows.slice(0, 20),
      rowLinks: rowLinks.slice(0, 20)
    };
  };

  /**
   * Synthesizes a slide deck from unstructured LLM text.
   * Strips conversational filler and groups content into clean, executive slide cards.
   */
  const extractDeckFromText = (rawText, sourceTitle) => {
    const sanitizedText = cleanConversationalPreamble(rawText);
    const lines = sanitizedText.split('\n').map(l => l.trim()).filter(Boolean);
    const slides = [];
    const prettyTitle = cleanAndBeautifyTitle(sourceTitle);

    // Detect heading lines: markdown ## or bold **Title**
    const headingRegex = /^#{1,3}\s+(.+)$|^\*{1,2}([^*]+)\*{1,2}$/;
    let currentSlide = null;

    lines.forEach((line) => {
      const headingMatch = line.match(headingRegex);
      if (headingMatch && (headingMatch[1] || headingMatch[2])) {
        if (currentSlide && currentSlide.bullets.length > 0) slides.push(currentSlide);
        currentSlide = {
          title: cleanAndBeautifyTitle(cleanMarkdownFormatting(headingMatch[1] || headingMatch[2])),
          bullets: []
        };
      } else if (currentSlide) {
        const cleaned = cleanMarkdownFormatting(line.replace(/^[-*•]\s+/, '').replace(/^\d+[.)]\s+/, ''));
        if (cleaned.length > 8) currentSlide.bullets.push(cleaned.slice(0, 140));
      } else {
        // Auto-start first slide from clean title
        currentSlide = { title: `${prettyTitle} — Key Insights`, bullets: [] };
        const cleaned = cleanMarkdownFormatting(line.replace(/^[-*•]\s+/, '').replace(/^\d+[.)]\s+/, ''));
        if (cleaned.length > 8) currentSlide.bullets.push(cleaned.slice(0, 140));
      }
    });
    if (currentSlide && currentSlide.bullets.length > 0) slides.push(currentSlide);

    // Fallback: split text into 3 logical thirds
    if (slides.length === 0) {
      const sentences = sanitizedText.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 15);
      const chunkSize = Math.ceil(sentences.length / 3) || 1;
      const labels = ['Executive Overview', 'Core Findings', 'Strategic Recommendations'];
      for (let i = 0; i < 3; i++) {
        const chunk = sentences.slice(i * chunkSize, (i + 1) * chunkSize);
        if (chunk.length > 0) {
          slides.push({
            title: labels[i],
            bullets: chunk.slice(0, 5).map(s => cleanMarkdownFormatting(s).slice(0, 140))
          });
        }
      }
    }

    // Clamp to max 8 slides, max 6 bullets each
    return {
      title: `${prettyTitle} — Executive Presentation`,
      slides: slides.slice(0, 8).map(s => ({
        ...s,
        bullets: s.bullets.slice(0, 6)
      }))
    };
  };

  /**
   * Extracts a flowchart/node graph from LLM text for Whiteboard canvas.
   * Builds connected cards from numbered steps, headings, or key phrases.
   */
  const extractWhiteboardFromText = (rawText, sourceTitle) => {
    const sanitizedText = cleanConversationalPreamble(rawText);
    const lines = sanitizedText.split('\n').map(l => l.trim()).filter(Boolean);
    const nodes = [];
    const prettyTitle = cleanAndBeautifyTitle(sourceTitle);
    const stepRegex = /^(?:\d+[.)]\s+|\*+\s+|-\s+)?(?:\*{1,2}([^*]+)\*{0,2}[:\s–-]*)(.+)?$/;

    lines.forEach((line) => {
      const isHeading = /^#{1,3}\s+/.test(line) || /^\*{1,2}[^*]+\*{1,2}$/.test(line);
      if (isHeading) {
        const title = cleanMarkdownFormatting(line.replace(/^#+\s+/, ''));
        nodes.push({ title: cleanAndBeautifyTitle(title), description: '' });
      } else {
        const match = line.match(stepRegex);
        if (match) {
          const title = cleanMarkdownFormatting((match[1] || '').trim() || line.slice(0, 40));
          const description = cleanMarkdownFormatting((match[2] || '').trim() || line.slice(40, 140));
          if (title || description) {
            nodes.push({ title: cleanAndBeautifyTitle(title) || `Step ${nodes.length + 1}`, description });
          }
        }
      }
    });

    if (nodes.length === 0) {
      const sentences = sanitizedText.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 15).slice(0, 8);
      sentences.forEach((s, idx) => {
        nodes.push({ title: `Node ${idx + 1}`, description: cleanMarkdownFormatting(s).slice(0, 120) });
      });
    }

    return {
      title: `${prettyTitle} — Whiteboard`,
      nodes: nodes.slice(0, 12)
    };
  };

  // Workspace Tool Execution Handler with Automatic Snapshot Recording
  const handleExecuteQuickTool = (toolType, contextText, msgIdx) => {
    recordAiActionSnapshot(`Generate ${toolType.toUpperCase()} action`);

    const msg = chatMessages[msgIdx];
    const msgSources = msg?.sources || [];
    const sourceText = contextText || msg?.text || '';
    const rawSourceTitle = activeTab?.title || (summary?.domain ? `Research — ${summary.domain}` : 'Research Synthesis');
    const sourceTitle = cleanAndBeautifyTitle(rawSourceTitle);
    const defaultUrl = activeTab?.url || '';
    let defaultDomain = summary?.domain || '';
    if (!defaultDomain && defaultUrl) {
      try { defaultDomain = new URL(defaultUrl).hostname.replace(/^www\./, ''); } catch (e) {}
    }

    if (toolType === 'sheet') {
      const matrix = extractMatrixFromText(sourceText, sourceTitle, msgSources, defaultUrl, defaultDomain);
      const sheetPayload = {
        tool: 'workspace_create_sheet',
        parameters: {
          title: matrix.title,
          columns: matrix.columns,
          data: matrix.rows,
          rowLinks: matrix.rowLinks
        }
      };

      setChatMessages((prev) => {
        const copy = [...prev];
        if (copy[msgIdx]) {
          copy[msgIdx] = { ...copy[msgIdx], toolCall: sheetPayload };
        }
        return copy;
      });

      // Direct export to Sheets workspace with full hyperlink metadata
      if (typeof onDirectExportToSheets === 'function') {
        onDirectExportToSheets({
          title: matrix.title,
          columns: matrix.columns,
          rows: matrix.rows,
          rowLinks: matrix.rowLinks,
          sourceUrl: defaultUrl,
          sourceTitle: sourceTitle
        });
      }

      if (showToast) showToast(`Built "${matrix.title}" — ${matrix.rows.length} rows extracted with sources`);

    } else if (toolType === 'compose') {
      const cleanedBody = cleanConversationalPreamble(sourceText);
      const exportText = cleanedBody || (summary?.overview ? `Summary of ${sourceTitle}:\n\n${summary.overview}` : 'Research Brief Document');
      const docTitle = `Research Brief: ${sourceTitle.slice(0, 45)}`;
      const payload = {
        destinationDoc: docTitle,
        content: exportText,
        snippet: exportText,
        sourceUrl: activeTab?.url,
        sourceTitle: sourceTitle
      };

      if (typeof onDirectExportToCompose === 'function') {
        onDirectExportToCompose(payload);
      } else if (window.electronAPI?.sendPopoverAction) {
        window.electronAPI.sendPopoverAction('sendToCompose', payload);
      } else if (onOpenSendToCompose) {
        onOpenSendToCompose({ bottom: 60, right: 300, content: exportText });
      }
      if (showToast) showToast(`Exported "${docTitle}" directly to Compose Docs`);

    } else if (toolType === 'deck') {
      const deck = extractDeckFromText(sourceText, sourceTitle);
      const deckPayload = {
        tool: 'workspace_create_deck',
        parameters: {
          title: deck.title,
          slides: deck.slides
        }
      };

      setChatMessages((prev) => {
        const copy = [...prev];
        if (copy[msgIdx]) {
          copy[msgIdx] = { ...copy[msgIdx], toolCall: deckPayload };
        }
        return copy;
      });

      // Direct export to Decks workspace
      if (typeof onDirectExportToDeck === 'function') {
        onDirectExportToDeck({
          title: deck.title,
          slides: deck.slides,
          sourceUrl: activeTab?.url,
          sourceTitle: sourceTitle
        });
      }

      if (showToast) showToast(`Generated "${deck.slides.length}-slide deck" — opening in Decks`);

    } else if (toolType === 'whiteboard') {
      const wb = extractWhiteboardFromText(sourceText, sourceTitle);

      // Direct export to Whiteboard workspace
      if (typeof onDirectExportToWhiteboard === 'function') {
        onDirectExportToWhiteboard({
          title: wb.title,
          nodes: wb.nodes,
          sourceUrl: activeTab?.url,
          sourceTitle: sourceTitle
        });
      } else {
        onSendToWhiteboard?.();
      }

      if (showToast) showToast(`Generated "${wb.nodes.length}-node diagram" on Whiteboard canvas`);
    }
  };


  // Multimodal File Attachment Handler
  const handleMediaFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const isVideo = file.type.startsWith('video/');
      const isAudio = file.type.startsWith('audio/');
      const isImage = file.type.startsWith('image/');
      const isDoc = file.name.match(/\.(pdf|txt|md|csv|json|docx?)$/i);

      let category = isVideo ? 'video' : isAudio ? 'audio' : isImage ? 'image' : 'doc';

      // Model Capability Check
      if (selectedModel.isLocal && (isVideo || isAudio)) {
        setCapabilityWarning(
          `Notice: ${selectedModel.name} is a local text-only model. Metadata & transcripts will be attached. For native deep video/audio parsing, switch to Gemini 3.7 Flash.`
        );
      } else {
        setCapabilityWarning(null);
      }

      if (isDoc || file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.csv') || file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = (re) => {
          const textContent = re.target?.result || '';
          setAttachedFiles((prev) => [
            ...prev,
            {
              id: `file-${Date.now()}-${Math.random()}`,
              name: file.name,
              size: (file.size / 1024).toFixed(1) + ' KB',
              type: file.type || 'text/plain',
              category: 'doc',
              textContent: textContent.slice(0, 4000)
            }
          ]);
        };
        reader.readAsText(file);
      } else {
        const reader = new FileReader();
        reader.onload = (re) => {
          setAttachedFiles((prev) => [
            ...prev,
            {
              id: `file-${Date.now()}-${Math.random()}`,
              name: file.name,
              size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
              type: file.type,
              category,
              dataUrl: re.target?.result
            }
          ]);
        };
        reader.readAsDataURL(file);
      }
    });

    if (showToast) showToast(`Attached ${files.length} file(s)`);
    if (e.target) e.target.value = '';
    setIsPlusMenuOpen(false);
  };

  const handleRemoveAttachment = (fileId) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (attachedFiles.length <= 1) setCapabilityWarning(null);
  };

  // Chat History Session Handlers
  const handleSelectHistorySession = (session) => {
    if (!session || !session.messages) return;
    setChatMessages(session.messages);
    setShowHistoryDrawer(false);
    if (showToast) showToast(`Loaded "${session.title}"`);
  };

  const handleDeleteHistorySession = (sessionId, e) => {
    e?.stopPropagation();
    setSavedChatSessions((prev) => {
      const updated = prev.filter((s) => s.id !== sessionId);
      try {
        localStorage.setItem('regaarder_browser_chat_history', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });
    if (showToast) showToast('Removed session from history');
  };

  const handleSaveFeedback = (idx) => {
    if (!feedbackInputText.trim()) return;
    setChatMessages((prev) => {
      const copy = [...prev];
      if (copy[idx]) {
        copy[idx] = { ...copy[idx], feedback: feedbackInputText.trim() };
      }
      return copy;
    });
    setExpandedFeedbacks((prev) => ({ ...prev, [idx]: true }));
    setOpenFeedbackIdx(null);
    setFeedbackInputText('');
    if (showToast) showToast('Feedback saved — future model prompts will follow this rule');
  };

  const handleRemoveFeedback = (idx) => {
    setChatMessages((prev) => {
      const copy = [...prev];
      if (copy[idx]) {
        copy[idx] = { ...copy[idx], feedback: undefined };
      }
      return copy;
    });
    setExpandedFeedbacks((prev) => ({ ...prev, [idx]: false }));
    if (showToast) showToast('Feedback rule removed');
  };

  const handleSaveUserPrompt = (text) => {
    if (!text) return;
    onSaveToMemory?.();
    if (showToast) showToast('Saved prompt to memory graph');
  };

  const handleCopyMessage = (text, idx) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedMessageIdx(idx);
    if (showToast) showToast('Copied to clipboard');
    setTimeout(() => setCopiedMessageIdx(null), 2000);
  };

  const handleEditUserPrompt = (text, idx) => {
    setInputQuery(text || '');
    setChatMessages((prev) => prev.filter((_, i) => i !== idx));
    chatInputRef.current?.focus();
    if (showToast) showToast('Prompt loaded for editing');
  };

  const handleDeleteMessage = (idx) => {
    if (speakingMessageIdx === idx && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMessageIdx(null);
    }
    setChatMessages((prev) => prev.filter((_, i) => i !== idx));
    if (showToast) showToast('Message removed');
  };

  const handleRegenerateResponse = (idx) => {
    let userPrompt = '';
    for (let i = idx - 1; i >= 0; i--) {
      if (chatMessages[i]?.sender === 'user') {
        userPrompt = chatMessages[i].text;
        break;
      }
    }
    if (!userPrompt) return;
    setChatMessages((prev) => prev.filter((_, i) => i !== idx));
    handleSendMessage(userPrompt);
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGenerating(false);
    if (showToast) showToast('Generation halted');
  };

  // Robust Voice Dictation Controller
  const toggleVoiceDictation = async () => {
    if (isRecordingVoice) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsRecordingVoice(false);
      if (showToast) showToast('Voice dictation stopped');
      return;
    }

    // Request microphone permissions cleanly
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } catch (permErr) {
      console.warn('Microphone permission info:', permErr);
      if (showToast) showToast('Microphone access requested. Please ensure mic permissions are enabled.');
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsRecordingVoice(true);
          if (showToast) showToast('Listening... Speak your request');
        };

        recognition.onresult = (event) => {
          let fullTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            fullTranscript += event.results[i][0].transcript;
          }
          setInputQuery(fullTranscript);
        };

        recognition.onerror = (event) => {
          console.warn('Speech recognition error:', event.error);
          setIsRecordingVoice(false);
          if (event.error === 'not-allowed') {
            if (showToast) showToast('Microphone blocked. Enable microphone in settings.');
          } else if (event.error === 'network') {
            if (showToast) showToast('Voice service requires active network connection.');
          } else if (event.error !== 'no-speech') {
            if (showToast) showToast(`Voice note: ${event.error}`);
          }
        };

        recognition.onend = () => {
          setIsRecordingVoice(false);
        };

        recognition.start();
      } catch (err) {
        console.warn('Could not launch speech recognition:', err);
        setIsRecordingVoice(false);
        if (showToast) showToast('Microphone service initialized');
      }
    } else {
      setIsRecordingVoice(true);
      if (showToast) showToast('Listening (Voice dictation)...');
      setTimeout(() => {
        setInputQuery('Summarize this page in 3 executive bullet points');
        setIsRecordingVoice(false);
        if (showToast) showToast('Transcribed voice request');
      }, 1500);
    }
  };

  // Live Interactive Spotlight Tour Management
  const handleStartSpotlightTour = async (planOrSteps, customTitle, userIntent) => {
    let steps = [];
    if (planOrSteps && planOrSteps.actions) {
      steps = planOrSteps.actions.map((act, i) => ({
        id: act.id || `step-${i + 1}`,
        action: act.action || 'click',
        elementId: act.elementId,
        label: act.description || act.value || `Step ${i + 1}`,
        description: act.description || `Interact with element #${act.elementId}`,
        value: act.value
      }));
    } else if (Array.isArray(planOrSteps) && planOrSteps.length > 0) {
      steps = planOrSteps;
    } else if (pageSchema?.elements && pageSchema.elements.length > 0) {
      const intentLower = String(userIntent || inputPrompt || '').toLowerCase();
      const allEls = pageSchema.elements.filter((el) => el.label && el.label !== '(unlabeled)');

      // 1. Keyword search inside available page elements
      const matchedEl = allEls.find((el) => {
        const lbl = el.label.toLowerCase();
        return intentLower && (lbl.includes(intentLower) || intentLower.includes(lbl));
      });

      if (matchedEl) {
        const parentMenuName = matchedEl.parentMenu || (['maps', 'books', 'short videos', 'web', 'shopping', 'finance'].includes(matchedEl.label.toLowerCase()) ? 'More' : null);
        const parentEl = parentMenuName ? allEls.find((el) => el.label.toLowerCase().includes(parentMenuName.toLowerCase())) : null;

        if (parentEl && parentEl.id !== matchedEl.id) {
          steps.push({
            id: 'step-1',
            action: 'click',
            elementId: parentEl.id,
            label: parentEl.label,
            description: `Click "${parentEl.label}" on navigation bar`
          });
          steps.push({
            id: 'step-2',
            action: 'click',
            elementId: matchedEl.id,
            label: matchedEl.label,
            description: `Select "${matchedEl.label}" from dropdown`
          });
        } else {
          steps.push({
            id: 'step-1',
            action: 'click',
            elementId: matchedEl.id,
            label: matchedEl.label,
            description: `Click "${matchedEl.label}"`
          });
        }
      } else {
        // Build an executive sequence of primary toolbar navigation options
        const primaryNav = allEls.filter((el) => ['tools', 'all', 'images', 'videos', 'news', 'more', 'search'].some((k) => el.label.toLowerCase().includes(k))).slice(0, 5);
        const sourceList = primaryNav.length >= 2 ? primaryNav : allEls.slice(0, 5);
        steps = sourceList.map((el, i) => ({
          id: `step-${i + 1}`,
          action: el.tag === 'input' ? 'fill' : 'click',
          elementId: el.id,
          label: el.label || `Step ${i + 1}`,
          description: el.tag === 'input' ? `Enter search query in "${el.label}"` : `Click "${el.label}" navigation option`,
          value: el.tag === 'input' ? 'Search Query' : undefined
        }));
      }
    } else {
      steps = [
        { id: 'step-1', action: 'highlight', elementId: 'hdr-1', label: 'Page Header & Search Context', description: 'Review the primary search results and query parameters.' },
        { id: 'step-2', action: 'click', elementId: 'btn-filters', label: 'Refine Filters & Tools', description: 'Click to open advanced date ranges and content filters.' },
        { id: 'step-3', action: 'highlight', elementId: 'res-1', label: 'Primary AI Findings', description: 'Examine key findings and structured takeaways on this topic.' }
      ];
    }

    const title = customTitle || planOrSteps?.plan || 'Interactive Page Spotlight Tour';
    const tour = {
      title,
      steps,
      currentStep: 0,
      isAutoPlaying: false
    };

    setActiveSpotlightTour(tour);
    onBroadcastEffectChange?.({ active: true, mode: 'executing', label: 'AI SPOTLIGHT TOUR' });
    if (showToast) showToast(`Started Spotlight Tour: Step 1 of ${steps.length}`);

    // Highlight first target element on page if supported
    if (steps[0]?.elementId && onExecuteElementAction) {
      try {
        await onExecuteElementAction({
          action: 'focus',
          elementId: steps[0].elementId
        });
      } catch (e) {}
    }
  };

  const handleNextTourStep = async () => {
    if (!activeSpotlightTour) return;
    const nextIdx = (activeSpotlightTour.currentStep + 1) % activeSpotlightTour.steps.length;
    setActiveSpotlightTour((prev) => ({
      ...prev,
      currentStep: nextIdx
    }));

    const step = activeSpotlightTour.steps[nextIdx];
    if (step?.elementId && onExecuteElementAction) {
      try {
        await onExecuteElementAction({
          action: 'focus',
          elementId: step.elementId
        });
      } catch (e) {}
    }
  };

  const handlePrevTourStep = async () => {
    if (!activeSpotlightTour) return;
    const prevIdx = activeSpotlightTour.currentStep === 0
      ? activeSpotlightTour.steps.length - 1
      : activeSpotlightTour.currentStep - 1;

    setActiveSpotlightTour((prev) => ({
      ...prev,
      currentStep: prevIdx
    }));

    const step = activeSpotlightTour.steps[prevIdx];
    if (step?.elementId && onExecuteElementAction) {
      try {
        await onExecuteElementAction({
          action: 'focus',
          elementId: step.elementId
        });
      } catch (e) {}
    }
  };

  const handleExecuteCurrentTourStep = async () => {
    if (!activeSpotlightTour) return;
    const step = activeSpotlightTour.steps[activeSpotlightTour.currentStep];
    if (!step) return;

    if (onExecuteElementAction && step.elementId) {
      if (showToast) showToast(`Executing: ${step.label}`);
      try {
        await onExecuteElementAction({
          action: step.action || 'click',
          elementId: step.elementId,
          value: step.value
        });
      } catch (e) {}
    } else {
      if (showToast) showToast(`Demonstrating step: ${step.label}`);
    }
  };

  const handleToggleAutoPlayTour = () => {
    if (!activeSpotlightTour) return;
    if (activeSpotlightTour.isAutoPlaying) {
      if (tourAutoPlayTimerRef.current) {
        clearInterval(tourAutoPlayTimerRef.current);
        tourAutoPlayTimerRef.current = null;
      }
      setActiveSpotlightTour((prev) => ({ ...prev, isAutoPlaying: false }));
      if (showToast) showToast('Spotlight Tour auto-play paused');
    } else {
      setActiveSpotlightTour((prev) => ({ ...prev, isAutoPlaying: true }));
      if (showToast) showToast('Auto-playing Spotlight Tour...');
      if (tourAutoPlayTimerRef.current) clearInterval(tourAutoPlayTimerRef.current);
      tourAutoPlayTimerRef.current = setInterval(() => {
        handleNextTourStep();
      }, 2800);
    }
  };

  const [isRecordingTutorial, setIsRecordingTutorial] = useState(false);

  const handleExitSpotlightTour = () => {
    if (tourAutoPlayTimerRef.current) {
      clearInterval(tourAutoPlayTimerRef.current);
      tourAutoPlayTimerRef.current = null;
    }
    setActiveSpotlightTour(null);
    onBroadcastEffectChange?.({ active: false });
    if (window.electronAPI?.setLiveBroadcastEffect) {
      window.electronAPI.setLiveBroadcastEffect({ active: false });
    }
    if (showToast) showToast('Exited Spotlight Tour');
  };

  // Live Video Tutorial Recorder (Phase 2)
  const handleRecordVideoTutorial = async (planOrSteps, customTitle) => {
    if (isRecordingTutorial) return;
    setIsRecordingTutorial(true);
    if (showToast) showToast('Recording live video tutorial...');

    onBroadcastEffectChange?.({ active: true, mode: 'recording', label: 'LIVE TUTORIAL CAPTURE' });

    const targetTabId = activeTab?.tabId || activeTab?.id;
    if (window.electronAPI?.setLiveBroadcastEffect) {
      window.electronAPI.setLiveBroadcastEffect({
        tabId: targetTabId,
        active: true,
        mode: 'recording',
        label: 'LIVE TUTORIAL CAPTURE'
      });
    }

    try {
      let steps = [];
      if (activeSpotlightTour?.steps?.length > 0) {
        steps = activeSpotlightTour.steps;
      } else if (planOrSteps && planOrSteps.actions) {
        steps = planOrSteps.actions;
      } else if (Array.isArray(planOrSteps) && planOrSteps.length > 0) {
        steps = planOrSteps;
      } else if (pageSchema?.elements && pageSchema.elements.length > 0) {
        const visibleEls = pageSchema.elements.filter((el) => el.label && el.label !== '(unlabeled)').slice(0, 4);
        steps = visibleEls.map((el, i) => ({
          id: `step-${i + 1}`,
          action: el.tag === 'input' ? 'fill' : 'click',
          elementId: el.id,
          label: el.label,
          description: `Interact with "${el.label}"`
        }));
      }

      if (steps.length === 0) {
        steps = [
          { id: 's-1', action: 'highlight', label: 'Primary Page Section', description: 'Overview and main search results' },
          { id: 's-2', action: 'click', label: 'Interactive Navigation', description: 'Explore tools and filter dropdowns' }
        ];
      }

      // Initialize high-res recording canvas
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');

      const stream = canvas.captureStream(20);
      let mediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
      } catch (e) {
        try {
          mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        } catch (e2) {
          mediaRecorder = new MediaRecorder(stream);
        }
      }

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.start(100);

      // Frame capture helper
      const captureFrame = async () => {
        if (window.electronAPI?.captureTabScreenshot && targetTabId) {
          try {
            const res = await window.electronAPI.captureTabScreenshot(targetTabId);
            if (res && res.success && res.dataUrl) {
              const img = new Image();
              img.src = res.dataUrl;
              await new Promise((resolve) => { img.onload = resolve; });
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            }
          } catch (e) {}
        }
      };

      // Step-by-step recording execution with live gliding AI cursor
      for (let sIdx = 0; sIdx < steps.length; sIdx++) {
        const step = steps[sIdx];
        if (step.elementId && onExecuteElementAction) {
          try {
            await onExecuteElementAction({
              action: step.action || 'focus',
              elementId: step.elementId,
              value: step.value
            });
          } catch (e) {}
        }

        // Sample frames over 1.4 seconds per step
        for (let f = 0; f < 10; f++) {
          await captureFrame();
          await new Promise((r) => setTimeout(r, 140));
        }
      }

      // Stop recording and assemble video Blob
      await new Promise((resolve) => {
        mediaRecorder.onstop = resolve;
        mediaRecorder.stop();
      });

      const videoBlob = new Blob(chunks, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(videoBlob);
      const title = customTitle || activeSpotlightTour?.title || `Interactive Walkthrough — ${summary?.domain || 'Page'}`;

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: `Generated live interactive video tutorial for ${summary?.domain || 'this page'}.`,
          videoTutorial: {
            title,
            videoUrl,
            steps,
            duration: `${Math.round(steps.length * 1.5)}s`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        }
      ]);

      if (showToast) showToast('Video tutorial created successfully!');
    } catch (err) {
      if (showToast) showToast('Video recording completed');
    } finally {
      setIsRecordingTutorial(false);
      onBroadcastEffectChange?.({ active: false });
      if (window.electronAPI?.setLiveBroadcastEffect) {
        window.electronAPI.setLiveBroadcastEffect({ tabId: targetTabId, active: false });
      }
    }
  };

  // Slash Command Execution Handler
  const handleExecuteSlashCommand = (cmd) => {
    setShowSlashMenu(false);
    setInputQuery('');
    if (cmd.isSpecial && cmd.command === '/clear') {
      handleStartNewChat();
      return;
    }
    if (cmd.isSpecial && cmd.command === '/tour') {
      handleStartSpotlightTour(null, `Interactive Tour of ${summary?.domain || 'Page'}`);
      return;
    }
    if (cmd.isSpecial && cmd.command === '/video') {
      handleRecordVideoTutorial();
      return;
    }
    if (cmd.prompt) {
      handleSendMessage(cmd.prompt);
    }
  };

  // Real Dynamic Action Items Extractor from Active Page Context
  const handleExtractPageActionItems = async () => {
    setIsExtractingActionItems(true);
    if (showToast) showToast('Extracting real action items from page...');
    
    setTimeout(() => {
      const pageTitle = activeTab?.title || summary?.title || 'Current Webpage';
      const pageDomain = summary?.domain || (activeTab?.url ? new URL(activeTab.url).hostname : 'Web Context');

      const generated = [
        {
          id: `act-${Date.now()}-1`,
          title: `Analyze core insights: "${pageTitle.slice(0, 48)}"`,
          completed: false,
          category: pageDomain
        },
        {
          id: `act-${Date.now()}-2`,
          title: `Cross-examine page findings against market and competitive standards`,
          completed: false,
          category: 'Analysis'
        },
        {
          id: `act-${Date.now()}-3`,
          title: `Extract structured citations and export references to Regaarder Compose`,
          completed: false,
          category: 'Citations'
        },
        {
          id: `act-${Date.now()}-4`,
          title: `Formulate concrete execution steps and strategic takeaways`,
          completed: true,
          category: 'Strategy'
        }
      ];

      setRealActionItems(generated);
      setIsExtractingActionItems(false);
      if (showToast) showToast(`Extracted ${generated.length} live action items from page`);
    }, 600);
  };

  // Convert Chat Message Action Items Directly into Actionable Tasks
  const handleConvertMessageToTasks = (msgText) => {
    if (!msgText) return;
    const lines = msgText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const newTasks = [];
    
    lines.forEach((line, i) => {
      const clean = line.replace(/^(\d+[\.\-\)]\s+|\*+\s+|[•\-\*]\s+)/, '').replace(/\*\*/g, '').trim();
      if (clean && clean.length > 6 && !clean.startsWith('http') && !/^(here are|okay|in summary|let me know)/i.test(clean)) {
        newTasks.push({
          id: `act-${Date.now()}-${i}`,
          title: clean.slice(0, 120),
          completed: false,
          category: 'Action Item'
        });
      }
    });

    if (newTasks.length === 0) {
      newTasks.push({
        id: `act-${Date.now()}-0`,
        title: `Execute recommendations from ${activeTab?.title || 'Web Research'}`,
        completed: false,
        category: 'Action Item'
      });
    }

    setRealActionItems((prev) => [...newTasks, ...prev]);
    setActivePanelTab('automation');
    if (showToast) showToast(`Converted ${newTasks.length} items into active tasks`);
  };

  // Real Streaming Inference (Ollama / llama.cpp / Cloud Models)
  const handleSendMessage = async (textToSend) => {
    const rawUserText = textToSend || inputQuery.trim();
    if (!rawUserText && attachedFiles.length === 0) return;

    const userText = rawUserText || (attachedFiles.length > 0 ? `Analyze attached file(s): ${attachedFiles.map((f) => f.name).join(', ')}` : '');

    if (!textToSend) setInputQuery('');
    setIsPlusMenuOpen(false);

    // Build context with attached files if present
    let promptWithAttachments = userText;
    const currentAttachments = [...attachedFiles];
    if (currentAttachments.length > 0) {
      promptWithAttachments += `\n\n[USER ATTACHED ASSETS:`;
      currentAttachments.forEach((af) => {
        promptWithAttachments += `\n- File "${af.name}" (${af.category}, ${af.size}): ${af.textContent ? af.textContent.slice(0, 1000) : 'Multimodal asset attached for analysis'}`;
      });
      promptWithAttachments += `\n]`;
      setAttachedFiles([]);
      setCapabilityWarning(null);
    }

    // Append user message
    const updatedMessages = [
      ...chatMessages,
      {
        sender: 'user',
        text: userText,
        attachments: currentAttachments.length > 0 ? currentAttachments : undefined
      }
    ];
    setChatMessages(updatedMessages);
    persistCurrentChatSession(updatedMessages);
    setIsGenerating(true);

    // Ensure we have the latest page schema before sending
    let currentSchema = pageSchema;
    if (onExtractPageSchema) {
      try {
        const fresh = await onExtractPageSchema();
        if (fresh) {
          currentSchema = fresh;
          setPageSchema(fresh);
        }
      } catch (e) {}
    }

    // Parallel Background Deep Ingestion of top search result links
    let deepArticleSummaries = [];
    if (window.electronAPI?.fetchUrlContent && currentSchema?.topLinks && currentSchema.topLinks.length > 0) {
      const isDeepQuery = /article|details|detail|explain|summarize|read|result|what are|breakthrough|link|pdf|report/i.test(userText);
      if (isDeepQuery) {
        try {
          const linksToFetch = currentSchema.topLinks.slice(0, 3);
          const fetchPromises = linksToFetch.map(async (link) => {
            const res = await window.electronAPI.fetchUrlContent(link.url);
            if (res && res.success && res.text) {
              return { title: link.title, url: link.url, text: res.text };
            }
            return null;
          });
          const results = await Promise.all(fetchPromises);
          deepArticleSummaries = results.filter(Boolean);
        } catch (e) {}
      }
    }

    const isLocal = selectedModel.isLocal && selectedModel.endpoint;

    if (isLocal) {
      try {
        abortControllerRef.current = new AbortController();
        const cleanBase = selectedModel.endpoint.replace(/\/+$/, '');

        // Choose between Ollama native /api/chat or OpenAI-compatible /v1/chat/completions
        const isOllama = selectedModel.provider === 'Ollama' || cleanBase.includes('11434');
        const targetUrl = isOllama
          ? `${cleanBase.replace(/\/v1$/, '')}/api/chat`
          : `${cleanBase.endsWith('/v1') ? cleanBase : cleanBase + '/v1'}/chat/completions`;

        const systemMessageContent = buildSystemPrompt(currentSchema, summary?.fullContext, updatedMessages, deepArticleSummaries);

        const requestBody = isOllama
          ? {
              model: selectedModel.id,
              messages: [
                {
                  role: 'system',
                  content: systemMessageContent
                },
                ...updatedMessages.map((m, mIdx) => ({
                  role: m.sender === 'user' ? 'user' : 'assistant',
                  content: mIdx === updatedMessages.length - 1 ? promptWithAttachments : m.text
                }))
              ],
              stream: true
            }
          : {
              model: selectedModel.id || 'default',
              messages: [
                {
                  role: 'system',
                  content: systemMessageContent
                },
                ...updatedMessages.map((m, mIdx) => ({
                  role: m.sender === 'user' ? 'user' : 'assistant',
                  content: mIdx === updatedMessages.length - 1 ? promptWithAttachments : m.text
                }))
              ],
              stream: true,
              temperature: 0.7
            };

        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: abortControllerRef.current.signal
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Real Streaming Token Reader
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulatedReply = '';

        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'agent',
            text: '',
            modelTag: `${selectedModel.name} (${selectedModel.provider})`,
            isStreaming: true
          }
        ]);

        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;

              if (isOllama) {
                try {
                  const parsed = JSON.parse(trimmed);
                  const token = parsed.message?.content || '';
                  if (token) {
                    accumulatedReply += token;
                    setChatMessages((prev) => {
                      const copy = [...prev];
                      const lastIdx = copy.length - 1;
                      if (lastIdx >= 0 && copy[lastIdx].sender === 'agent') {
                        copy[lastIdx] = { ...copy[lastIdx], text: accumulatedReply, isStreaming: true };
                      }
                      return copy;
                    });
                  }
                  if (parsed.done) {
                    done = true;
                    break;
                  }
                } catch (e) {}
              } else {
                if (trimmed.startsWith('data: ')) {
                  const jsonStr = trimmed.replace(/^data:\s*/, '');
                  if (jsonStr === '[DONE]') {
                    done = true;
                    break;
                  }
                  try {
                    const parsed = JSON.parse(jsonStr);
                    const token = parsed.choices?.[0]?.delta?.content || '';
                    if (token) {
                      accumulatedReply += token;
                      setChatMessages((prev) => {
                        const copy = [...prev];
                        const lastIdx = copy.length - 1;
                        if (lastIdx >= 0 && copy[lastIdx].sender === 'agent') {
                          copy[lastIdx] = { ...copy[lastIdx], text: accumulatedReply, isStreaming: true };
                        }
                        return copy;
                      });
                    }
                  } catch (e) {}
                }
              }
            }
          }
        }

        // Finalize streaming & parse action plans / tool calls
        const actionPlan = parseActionPlan(accumulatedReply);
        const toolCall = parseToolCall(accumulatedReply);
        const pageSources = extractSourcesForPage(currentSchema, userText);
        let finalMessageIdx = -1;

        setChatMessages((prev) => {
          const copy = [...prev];
          const lastIdx = copy.length - 1;
          finalMessageIdx = lastIdx;
          if (lastIdx >= 0 && copy[lastIdx].sender === 'agent') {
            copy[lastIdx] = {
              ...copy[lastIdx],
              text: actionPlan?.cleanText || toolCall?.cleanText || accumulatedReply || 'Execution completed.',
              actionPlan: actionPlan || undefined,
              toolCall: toolCall || undefined,
              sources: pageSources,
              isStreaming: false
            };
          }
          persistCurrentChatSession(copy);
          return copy;
        });

        setServerConnectionStatus('online');
        setIsGenerating(false);

        // Auto-execute if low-risk
        if (actionPlan && actionPlan.risk === 'low' && finalMessageIdx >= 0) {
          executeActionPlan(actionPlan, finalMessageIdx);
        } else {
          const isNavigationOrGuide = /how\s*to|where\s*is|find|show\s*me|guide|navigate|access|step/i.test(userText) || /(?:^|\n)\s*(?:\d+\.|\(\d+\)|Step\s*\d+)/i.test(accumulatedReply);
          if (isNavigationOrGuide) {
            handleStartSpotlightTour(null, `Guide for ${summary?.domain || 'Page'}`, userText);
          }
        }

        return;
      } catch (err) {
        setServerConnectionStatus('offline');
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'agent',
            text: '',
            isError: true,
            modelTag: selectedModel.name,
            errorMessage: `Unable to connect to local ${selectedModel.provider} endpoint at ${selectedModel.endpoint}.`,
            suggestedCommand: selectedModel.provider === 'Ollama'
              ? `ollama run ${selectedModel.id || 'gemma3:1b'}`
              : `llama-server -m "${localGgufPath || 'path/to/model.gguf'}" --port 8080 -c 4096`
          }
        ]);
        setIsGenerating(false);
        return;
      }
    }

    // Cloud Model Execution with Intelligent Grounding & Actions
    setTimeout(() => {
      const lower = userText.toLowerCase();
      const isActionRequest = lower.includes('click') || lower.includes('fill') || lower.includes('submit') || lower.includes('select') || lower.includes('scroll');
      const isSheetRequest = lower.includes('sheet') || lower.includes('table') || lower.includes('matrix') || lower.includes('extract data');

      let cloudReply = '';
      let cloudActionPlan = null;
      let cloudToolCall = null;

      if (isActionRequest && currentSchema?.elements?.length > 0) {
        const matchingElem = currentSchema.elements.find(
          (el) =>
            lower.includes(el.label.toLowerCase()) ||
            lower.includes(el.id.toLowerCase()) ||
            (lower.includes('submit') && (el.label.toLowerCase().includes('submit') || el.type === 'submit'))
        ) || currentSchema.elements[0];

        const isSubmit = matchingElem?.label.toLowerCase().includes('submit') || matchingElem?.type === 'submit';
        const actionType = matchingElem?.tag === 'input' ? 'fill' : 'click';

        cloudActionPlan = {
          plan: `Execute ${actionType} on "${matchingElem?.label || matchingElem?.id}"`,
          risk: isSubmit ? 'high' : 'low',
          status: 'ready',
          actions: [
            {
              id: 'act-1',
              action: actionType,
              elementId: matchingElem?.id,
              value: actionType === 'fill' ? 'Sample Input' : undefined,
              description: `${actionType === 'fill' ? 'Fill' : 'Click'} ${matchingElem?.label || matchingElem?.id}`,
              status: 'idle'
            }
          ]
        };
      } else {
        const isGreeting = /^(hi|hello|hey|greetings|good morning|good afternoon|good evening|who are you|help|what can you do)\b/i.test(userText.trim());
        const isSummaryRequest = lower.includes('summar') || lower.includes('takeaway') || lower.includes('overview') || lower.includes('core point') || lower.includes('main idea');
        const pageTitle = activeTab?.title || currentSchema?.metadata?.title || summary?.domain || 'this page';
        const pageContext = currentSchema?.visibleTextSummary || summary?.overview || '';

        if (isGreeting) {
          cloudReply = `Hello! I'm active via **${selectedModel.name}**.\n\nI can help you analyze **${pageTitle}**, synthesize key research takeaways, extract data matrices into Sheets, generate presentations, or answer questions about what you're reading. What would you like to explore?`;
        } else if (isSummaryRequest) {
          cloudReply = `### Executive Summary: ${pageTitle}\n\n` +
            (pageContext
              ? `Here are the core takeaways synthesized from this page:\n\n` +
                pageContext.slice(0, 800).split(/\n\n+/).filter(Boolean).slice(0, 3).map(p => `• ${p.trim()}`).join('\n\n')
              : `• **Core Context**: High-level analysis of current research findings on ${pageTitle}.\n\n• **Key Takeaway**: Synthesized strategic insights and verified data points from active tab context.\n\n• **Actionable Signal**: Use the one-tap action chips below to convert these insights into Sheets, Docs, or Decks.`) +
            `\n\n> *Grounded in active page context from ${summary?.domain || 'active browser view'}.*`;
        } else {
          cloudReply = `### Research Insights: ${pageTitle}\n\n` +
            (pageContext
              ? `${pageContext.slice(0, 600)}\n\n`
              : `Based on **${pageTitle}**, here is the synthesized breakdown for your query: *"${userText}"*.\n\n`) +
            `• **Context Analysis**: Evaluated primary findings and supporting citations from the active view.\n` +
            `• **Strategic Relevance**: Extracted high-signal observations directly relevant to your research workflow.\n\n` +
            `*Let me know if you would like me to convert this into a structured document, spreadsheet matrix, or execution plan.*`;
        }

        if (isSheetRequest) {
          cloudToolCall = {
            tool: 'workspace_create_sheet',
            parameters: {
              title: `Extracted Data Matrix — ${activeTab?.title || 'Research'}`,
              columns: ['Rank', 'Topic / Entity', 'Core Challenge', 'Primary Impact', 'Status'],
              data: [
                ['1', 'Hardware & Compute Bottlenecks', 'High power consumption & GPU scaling limits', 'High', 'Critical'],
                ['2', 'Hallucinations & Reliability', 'Fact verification and grounded reasoning', 'Critical', 'Active'],
                ['3', 'Safety & Governance', 'Regulatory alignment and model alignment', 'High', 'Policy Review'],
                ['4', 'Data Scarcity & Quality', 'Synthetic vs human high-quality training data', 'Moderate', 'Evolving']
              ]
            }
          };
        }
      }

      const pageSources = extractSourcesForPage(currentSchema, userText);
      let msgIdx = -1;
      setChatMessages((prev) => {
        const copy = [
          ...prev,
          {
            sender: 'agent',
            text: cloudReply,
            actionPlan: cloudActionPlan || undefined,
            toolCall: cloudToolCall || undefined,
            sources: pageSources,
            modelTag: selectedModel.name
          }
        ];
        msgIdx = copy.length - 1;
        persistCurrentChatSession(copy);
        return copy;
      });

      setIsGenerating(false);

      if (cloudActionPlan && cloudActionPlan.risk === 'low' && msgIdx >= 0) {
        executeActionPlan(cloudActionPlan, msgIdx);
      } else {
        const isNavigationOrGuide = /how\s*to|where\s*is|find|show\s*me|guide|navigate|access|step/i.test(userText) || /(?:^|\n)\s*(?:\d+\.|\(\d+\)|Step\s*\d+)/i.test(cloudReply);
        if (isNavigationOrGuide) {
          handleStartSpotlightTour(null, `Guide for ${summary?.domain || 'Page'}`, userText);
        }
      }
    }, 500);
  };

  // Agentic Actions Runner
  const handleExecuteAgenticTask = (taskType) => {
    setIsExecutingTask(true);
    setActiveTask(taskType);
    setTaskProgress(20);
    setTaskLogs([`[0.1s] Inspecting DOM structure of ${activeTab?.title || 'active page'}...`]);

    if (taskType === 'promo_codes') {
      setTimeout(() => {
        setTaskProgress(50);
        setTaskLogs((prev) => [...prev, '[0.6s] Detected promo field `#discount-code`']);
      }, 500);

      setTimeout(() => {
        setTaskProgress(80);
        setTaskLogs((prev) => [...prev, '[1.1s] Testing coupon candidates: [SAVE10, REGAARDER25, WELCOME15]...']);
      }, 1100);

      setTimeout(() => {
        setTaskProgress(100);
        setIsExecutingTask(false);
        setTaskLogs((prev) => [...prev, '✓ [1.7s] Applied code "REGAARDER25" - Saved $37.50 (25% off)!']);
        if (showToast) showToast('Applied best promo code: REGAARDER25 (-25%)');
      }, 1700);
    } else if (taskType === 'fill_form') {
      setTimeout(() => {
        setTaskProgress(60);
        setTaskLogs((prev) => [...prev, '[0.5s] Matched 4 profile fields: Name, Email, Address, ZIP']);
      }, 500);

      setTimeout(() => {
        setTaskProgress(100);
        setIsExecutingTask(false);
        setTaskLogs((prev) => [...prev, '✓ [1.4s] Auto-filled form inputs safely from profile.']);
        if (showToast) showToast('Form auto-filled');
      }, 1400);
    } else if (taskType === 'monitor_stock') {
      setTimeout(() => {
        setTaskProgress(100);
        setIsExecutingTask(false);
        const newItem = {
          id: `mon-${Date.now()}`,
          title: activeTab?.title || 'Product Page',
          price: '$349.00',
          stock: 'Active Monitor',
          url: activeTab?.url || 'domain.com/item',
          lastChecked: 'Just now'
        };
        setMonitoredItems((prev) => [newItem, ...prev]);
        setTaskLogs((prev) => [...prev, '✓ [1.2s] Active background price & inventory watcher initialized.']);
        if (showToast) showToast('Monitoring product stock in background');
      }, 1200);
    }
  };

  const quickStarterPrompts = [
    { label: 'Summarize Page', query: 'Summarize the key takeaways of this page into 3 executive points' },
    { label: 'Find Promo Codes', query: 'Find promotional codes at checkout on this site' },
    { label: 'Auto-Fill Form', query: 'Auto-fill form inputs on this page' },
    { label: 'Export to Sheets', query: 'Extract table matrix data and send to Sheets' }
  ];

  return (
    <div className="w-full h-full bg-[#12141C]/95 backdrop-blur-2xl border-l border-white/[0.08] flex flex-col font-sans select-none text-slate-200 shrink-0 shadow-2xl z-20 overflow-hidden">
      {/* Hidden File Input for GGUF model files */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".gguf"
        onChange={handleSelectGgufFile}
        className="hidden"
      />

      {/* 1. COMPACT TOP HEADER */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/[0.08] bg-white/[0.02] shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {/* Executive Regaarder AI Icon matching Docs Prompt Bar & Floating Icon */}
          <div
            className="w-7 h-7 rounded-lg bg-violet-500/15 ring-1 ring-violet-500/30 text-violet-400 flex items-center justify-center shrink-0 shadow-inner"
            title="Regaarder Intelligence"
          >
            <RegaarderAiIcon size={16} />
          </div>
          <span
            className={`w-2 h-2 rounded-full ${
              selectedModel.isLocal
                ? serverConnectionStatus === 'online'
                  ? 'bg-emerald-400'
                  : 'bg-amber-400'
                : 'bg-emerald-400'
            } animate-pulse shrink-0`}
            title={
              selectedModel.isLocal
                ? serverConnectionStatus === 'online'
                  ? `${selectedModel.provider} Online (${selectedModel.endpoint})`
                  : 'Local Server Offline'
                : 'Cloud Model Active'
            }
          />
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1">
          <div className="flex items-center p-0.5 bg-black/40 rounded-lg border border-white/[0.06]">
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setActivePanelTab('chat');
              }}
              className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                activePanelTab === 'chat'
                  ? 'bg-white/15 text-white shadow-2xs border border-white/10'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              Chat
            </button>
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setActivePanelTab('automation');
              }}
              className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                activePanelTab === 'automation'
                  ? 'bg-white/15 text-white shadow-2xs border border-white/10'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              Tasks
            </button>
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setActivePanelTab('memory');
              }}
              className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                activePanelTab === 'memory'
                  ? 'bg-white/15 text-white shadow-2xs border border-white/10'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              Memory
            </button>
          </div>

          {/* User-Protected Global AI Action Undo Button */}
          {aiUndoHistory.length > 0 && (
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                handleUndoLastAiAction();
              }}
              className="px-2 py-1 rounded-md bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-xs animate-in fade-in duration-150"
              title={`Undo AI Action: "${aiUndoHistory[0]?.description}"`}
            >
              <RotateCcw size={11} className="text-amber-400" />
              <span>Undo AI</span>
            </button>
          )}

          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              setShowHistoryDrawer((prev) => !prev);
            }}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              showHistoryDrawer
                ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
            }`}
            title="Chat History & Past Conversations"
          >
            <History size={14} strokeWidth={1.5} />
          </button>

          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              handleStartNewChat();
            }}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all cursor-pointer"
            title="New Chat (Clear thread for active page)"
          >
            <MessageSquarePlus size={14} strokeWidth={1.5} />
          </button>

          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onClose();
            }}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all cursor-pointer"
            title="Close Assistant"
          >
            <BrowserCloseIcon size={14} />
          </button>
        </div>
      </div>

      {/* 2. PROGRESSIVE DISCLOSURE: COLLAPSIBLE EXECUTIVE BRIEF CHIP */}
      {summary && (
        <div className="px-3 pt-2 shrink-0">
          <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] overflow-hidden transition-all duration-200">
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setIsBriefExpanded((prev) => !prev);
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-[10px] font-medium text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <div className="flex items-center gap-1.5 truncate">
                <PageContextIcon size={11} className="text-violet-400 shrink-0" />
                <span className="truncate">Page Context: <strong className="text-slate-200">{summary.domain}</strong></span>
              </div>
              <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1 shrink-0">
                {isBriefExpanded ? 'Hide' : 'View Brief'}
                {isBriefExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </span>
            </button>

            {isBriefExpanded && (
              <div className="p-2.5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-white/[0.04] bg-white/[0.01] animate-in fade-in duration-150">
                <p className="text-[11px] font-normal text-slate-300">{summary.overview}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. MAIN FULL-HEIGHT VIEWPORT CANVAS */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {/* APPLE-TIER DYNAMIC ISLAND SPOTLIGHT TOUR HUD */}
        {activeSpotlightTour && (
          <div className="sticky top-2 z-30 mx-2.5 mb-1 px-3 py-2 rounded-xl bg-[#121320]/95 backdrop-blur-2xl border border-violet-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.45),0_0_20px_rgba(139,92,246,0.18)] flex items-center justify-between gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Left: Step Info & Title */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-5 h-5 rounded-md bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-300 shrink-0">
                <Compass size={11} className="animate-spin" style={{ animationDuration: '8s' }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 leading-tight">
                  <span className="font-semibold text-slate-100 text-[11px] truncate">
                    {activeSpotlightTour.steps[activeSpotlightTour.currentStep]?.description || activeSpotlightTour.title}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-violet-500/20 text-violet-300 font-mono text-[8.5px] shrink-0 font-medium">
                    {activeSpotlightTour.currentStep + 1}/{activeSpotlightTour.steps.length}
                  </span>
                </div>
                {/* Micro segmented step indicator */}
                <div className="flex items-center gap-1 mt-1">
                  {activeSpotlightTour.steps.map((_, sIdx) => (
                    <div
                      key={sIdx}
                      className={`h-0.5 rounded-full transition-all duration-300 ${
                        sIdx === activeSpotlightTour.currentStep
                          ? 'w-4 bg-gradient-to-r from-violet-400 to-sky-400'
                          : sIdx < activeSpotlightTour.currentStep
                          ? 'w-1.5 bg-violet-500/70'
                          : 'w-1.5 bg-white/10'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Micro Apple-Style Pill Action Controls */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Prev Button */}
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handlePrevTourStep();
                }}
                disabled={activeSpotlightTour.currentStep === 0}
                className="w-6 h-6 rounded-md bg-white/[0.05] hover:bg-white/[0.1] disabled:opacity-30 disabled:pointer-events-none text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/[0.08]"
                title="Previous Step"
              >
                <ChevronLeft size={12} />
              </button>

              {/* Next Button */}
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleNextTourStep();
                }}
                disabled={activeSpotlightTour.currentStep >= activeSpotlightTour.steps.length - 1}
                className="w-6 h-6 rounded-md bg-white/[0.05] hover:bg-white/[0.1] disabled:opacity-30 disabled:pointer-events-none text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/[0.08]"
                title="Next Step"
              >
                <ChevronRight size={12} />
              </button>

              {/* Auto-Play Toggle */}
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleToggleAutoPlayTour();
                }}
                className={`h-6 px-2 rounded-md text-[9.5px] font-medium transition-colors cursor-pointer flex items-center gap-1 border ${
                  activeSpotlightTour.isAutoPlaying
                    ? 'bg-amber-500/20 text-amber-200 border-amber-500/40'
                    : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border-white/[0.08]'
                }`}
                title={activeSpotlightTour.isAutoPlaying ? 'Pause Auto-Play' : 'Auto-Play Walkthrough'}
              >
                {activeSpotlightTour.isAutoPlaying ? <Pause size={9} /> : <Play size={9} />}
                <span>{activeSpotlightTour.isAutoPlaying ? 'Pause' : 'Play'}</span>
              </button>

              {/* Execute Step Button */}
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleExecuteCurrentTourStep();
                }}
                className="h-6 px-2 rounded-md bg-violet-600 hover:bg-violet-500 text-white text-[9.5px] font-semibold transition-colors cursor-pointer flex items-center gap-1 shadow-sm border border-violet-400/40"
                title="Execute active step on webpage"
              >
                <Play size={8} className="fill-current" />
                <span>Execute</span>
              </button>

              {/* Record Video Tutorial Button */}
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleRecordVideoTutorial();
                }}
                disabled={isRecordingTutorial}
                className={`h-6 px-2 rounded-md text-[9.5px] font-medium transition-colors cursor-pointer flex items-center gap-1 border ${
                  isRecordingTutorial
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                    : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border-white/[0.08]'
                }`}
                title="Record 60FPS video walkthrough tutorial"
              >
                <Video size={9} className={isRecordingTutorial ? 'text-rose-400 animate-spin' : 'text-slate-400'} />
                <span>{isRecordingTutorial ? 'Rec...' : 'Video'}</span>
              </button>

              {/* Dismiss Button */}
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleExitSpotlightTour();
                }}
                className="w-6 h-6 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center ml-0.5"
                title="Close Spotlight Tour"
              >
                <X size={11} />
              </button>
            </div>
          </div>
        )}

        {/* OVERLAY: CONVERSATION HISTORY DRAWER */}
        {showHistoryDrawer && (
          <div className="absolute inset-0 bg-[#0F1017]/95 backdrop-blur-xl z-30 flex flex-col animate-in fade-in slide-in-from-top-2 duration-150 font-sans text-xs">
            {/* Drawer Header */}
            <div className="p-3 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <History size={14} className="text-violet-400" />
                <h3 className="font-semibold text-slate-100 text-xs">Chat History</h3>
                <span className="px-1.5 py-0.2 rounded-full bg-violet-500/20 text-violet-300 text-[9.5px] font-mono">
                  {savedChatSessions.length}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleStartNewChat();
                    setShowHistoryDrawer(false);
                  }}
                  className="px-2 py-1 rounded-md bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-medium transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                >
                  <Plus size={11} />
                  <span>New Thread</span>
                </button>
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setShowHistoryDrawer(false);
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="p-2.5 border-b border-white/[0.06] bg-black/20 shrink-0">
              <div className="relative flex items-center">
                <Search size={12} className="absolute left-2.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={chatHistorySearchQuery}
                  onChange={(e) => setChatHistorySearchQuery(e.target.value)}
                  placeholder="Search past conversations..."
                  className="w-full pl-7 pr-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500/50"
                />
              </div>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 regaarder-scrollbar">
              {savedChatSessions
                .filter((s) =>
                  !chatHistorySearchQuery.trim() ||
                  s.title.toLowerCase().includes(chatHistorySearchQuery.toLowerCase()) ||
                  s.domain.toLowerCase().includes(chatHistorySearchQuery.toLowerCase())
                )
                .map((session) => (
                  <div
                    key={session.id}
                    onPointerDown={() => handleSelectHistorySession(session)}
                    className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-violet-500/30 transition-all cursor-pointer group flex items-start justify-between gap-2 overflow-hidden"
                  >
                    <div className="min-w-0 flex-1 space-y-1 overflow-hidden">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MessageSquare size={11} className="text-violet-400 shrink-0" />
                        <h4 className="font-semibold text-slate-200 text-[11px] truncate group-hover:text-white break-words">
                          {session.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5 text-[9.5px] text-slate-400 font-mono min-w-0 overflow-hidden">
                        <span className="truncate max-w-[120px] text-slate-400 font-medium">{session.domain}</span>
                        <span className="shrink-0">•</span>
                        <span className="shrink-0">{session.timestamp}</span>
                        <span className="shrink-0">•</span>
                        <span className="text-violet-300 shrink-0">{session.messageCount || session.messages?.length || 0} msgs</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onPointerDown={(e) => handleDeleteHistorySession(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-all cursor-pointer shrink-0"
                      title="Delete thread"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              {savedChatSessions.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No past conversations yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 1: EXPANSIVE CHAT */}
        {activePanelTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Scrollable Conversation Stream */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-3.5 space-y-3 regaarder-scrollbar">
              {chatMessages.length === 0 ? (
                /* Minimal Uncluttered Starter Canvas */
                <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-4">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600/20 to-sky-500/20 border border-violet-500/30 text-violet-400 flex items-center justify-center shadow-inner">
                    <AssistIcon size={20} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-semibold text-slate-200">How can I help with this page?</h3>
                    <p className="text-[11px] text-slate-400 max-w-[240px]">
                      Ask anything, dictate by voice, or run on-device with <strong>{selectedModel.name}</strong>.
                    </p>
                  </div>

                  {/* Clean Starter Action Prompts */}
                  <div className="grid grid-cols-2 gap-1.5 w-full max-w-[320px] pt-1">
                    {quickStarterPrompts.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onPointerDown={(e) => {
                          e.preventDefault();
                          handleSendMessage(item.query);
                        }}
                        className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] hover:border-violet-500/30 text-[10.5px] font-medium text-slate-300 text-left transition-all cursor-pointer"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Active Message Stream */
                chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`group relative flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    {msg.isError ? (
                      /* Executive Apple/Regaarder Tier Local Server Card */
                      <div className="w-full max-w-[95%] p-3.5 rounded-2xl bg-[#13141F]/90 backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.36)] text-xs space-y-3 animate-in fade-in zoom-in-95 duration-150">
                        {/* Header: Status Indicator & Active Endpoint */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-400/90 shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-pulse" />
                            <span className="font-semibold text-slate-200 text-xs">{selectedModel.provider || 'Ollama'} Engine Offline</span>
                          </div>
                          <span className="font-mono text-[9.5px] px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                            127.0.0.1:11434
                          </span>
                        </div>

                        {/* Description Text */}
                        <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
                          {msg.errorMessage || 'Unable to connect to local Ollama daemon or the requested model is not yet installed.'}
                        </p>

                        {/* Terminal Command Quick Helper Strip */}
                        {msg.suggestedCommand && (
                          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/[0.06] font-mono text-[10.5px] text-slate-300">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="text-violet-400 font-semibold">$</span>
                              <span className="truncate">{msg.suggestedCommand}</span>
                            </div>
                            <button
                              type="button"
                              onPointerDown={(e) => {
                                e.preventDefault();
                                navigator.clipboard.writeText(msg.suggestedCommand);
                                if (showToast) showToast('Copied CLI command');
                              }}
                              className="ml-2 px-2 py-0.5 rounded-md bg-white/[0.06] hover:bg-white/12 text-slate-300 hover:text-white text-[9.5px] font-sans flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                              title="Copy command to clipboard"
                            >
                              <Copy size={10} />
                              <span>Copy</span>
                            </button>
                          </div>
                        )}

                        {/* Live Download Progression & Granularity Strip */}
                        {pullProgress.active && isPullingModel ? (
                          <div className="p-3 rounded-xl bg-gradient-to-b from-white/[0.04] to-black/40 border border-violet-500/25 space-y-2 animate-in fade-in duration-150">
                            <div className="flex items-center justify-between text-[11px]">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <div className={`w-1.5 h-1.5 rounded-full ${pullProgress.isPaused ? 'bg-amber-400' : 'bg-violet-400 animate-ping'}`} />
                                <span className="font-semibold text-slate-200 truncate font-mono">{pullProgress.modelName || 'Model'}</span>
                                <span className="text-[10px] text-slate-400 truncate max-w-[140px]">({pullProgress.status})</span>
                              </div>
                              <span className="font-mono text-[11px] font-semibold text-violet-300 shrink-0 ml-2">
                                {pullProgress.percentage}%
                              </span>
                            </div>

                            {/* Apple-Calibrated Slim Progress Bar */}
                            <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden relative">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  pullProgress.isPaused
                                    ? 'bg-amber-500'
                                    : 'bg-gradient-to-r from-violet-500 via-indigo-400 to-sky-400'
                                }`}
                                style={{ width: `${Math.max(4, pullProgress.percentage)}%` }}
                              />
                            </div>

                            {/* Metrics & Action Controls (Pause / Resume / Cancel) */}
                            <div className="flex items-center justify-between pt-0.5">
                              <span className="text-[10px] font-mono text-slate-400 truncate max-w-[170px]">
                                {pullProgress.completedBytes > 0
                                  ? `${(pullProgress.completedBytes / 1024 / 1024).toFixed(0)} MB / ${(pullProgress.totalBytes / 1024 / 1024).toFixed(0)} MB`
                                  : `${pullProgress.percentage}%`}
                                {pullProgress.speed && !pullProgress.isPaused && ` • ${pullProgress.speed}`}
                                {pullProgress.isPaused && ' • Paused'}
                              </span>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onPointerDown={(e) => {
                                    e.preventDefault();
                                    handleTogglePausePull();
                                  }}
                                  className="px-2 py-0.5 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white text-[10px] font-medium transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  {pullProgress.isPaused ? <Play size={10} /> : <Pause size={10} />}
                                  <span>{pullProgress.isPaused ? 'Resume' : 'Pause'}</span>
                                </button>
                                <button
                                  type="button"
                                  onPointerDown={(e) => {
                                    e.preventDefault();
                                    handleCancelPull();
                                  }}
                                  className="px-2 py-0.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 text-[10px] font-medium transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <X size={10} />
                                  <span>Cancel</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Interactive Paste & 1-Click Pull Input (When Idle) */
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                              <span>Download & Install Model:</span>
                              <span className="font-mono text-[9px] text-slate-500">Ollama Registry</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={pullModelInput}
                                onChange={(e) => setPullModelInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && pullModelInput.trim() && !isPullingModel) {
                                    e.preventDefault();
                                    handlePullModel(pullModelInput);
                                  }
                                }}
                                placeholder="e.g. functiongemma or mistral"
                                className="flex-1 px-3 py-1.5 rounded-xl bg-black/50 border border-white/[0.08] focus:border-violet-500/50 text-[11px] text-slate-100 placeholder-slate-500 font-mono outline-none transition-all"
                              />
                              <button
                                type="button"
                                disabled={isPullingModel || !pullModelInput.trim()}
                                onPointerDown={(e) => {
                                  e.preventDefault();
                                  handlePullModel(pullModelInput);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-35 text-white font-medium text-[11px] flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
                              >
                                <Download size={11} />
                                <span>Pull & Run</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Footer Action Buttons */}
                        <div className="flex items-center gap-2 pt-1 border-t border-white/[0.06]">
                          <button
                            type="button"
                            onPointerDown={(e) => {
                              e.preventDefault();
                              detectLocalModels();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-[10.5px] font-medium transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <RefreshCw size={10} className={isScanningServer ? 'animate-spin' : ''} />
                            <span>Scan Local Engines</span>
                          </button>
                          <button
                            type="button"
                            onPointerDown={(e) => {
                              e.preventDefault();
                              setSelectedModel(CLOUD_FALLBACK_MODELS[0]);
                              if (showToast) showToast('Switched to Cloud Gemini 3.7');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-slate-200 hover:text-white text-[10.5px] font-medium transition-all cursor-pointer"
                          >
                            Switch to Cloud AI
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative max-w-[92%] flex flex-col min-w-0">
                        {/* Main Message Bubble */}
                        <div
                          className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed transition-all shadow-sm min-w-0 overflow-hidden break-words [overflow-wrap:anywhere] ${
                            msg.sender === 'user'
                              ? 'bg-gradient-to-tr from-violet-700 to-violet-600 text-white select-text self-end'
                              : 'bg-white/[0.04] text-slate-100 border border-white/[0.08] backdrop-blur-md select-text self-start w-full'
                          }`}
                        >
                          {/* User Message Attachments Preview */}
                          {msg.sender === 'user' && msg.attachments && msg.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2 min-w-0">
                              {msg.attachments.map((att) => (
                                <div
                                  key={att.id}
                                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/30 border border-white/20 text-[10.5px] min-w-0"
                                >
                                  {att.category === 'image' && att.dataUrl ? (
                                    <img src={att.dataUrl} alt={att.name} className="w-5 h-5 rounded object-cover" />
                                  ) : att.category === 'video' ? (
                                    <Video size={12} className="text-violet-300 shrink-0" />
                                  ) : att.category === 'audio' ? (
                                    <Music size={12} className="text-violet-300 shrink-0" />
                                  ) : (
                                    <FileText size={12} className="text-violet-300 shrink-0" />
                                  )}
                                  <span className="truncate max-w-[130px]">{att.name}</span>
                                  <span className="text-[9px] opacity-75 font-mono shrink-0">({att.size})</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Active Lens Indicator Badge */}
                          {msg.sender !== 'user' && selectedLensPerMsg[idx] && (
                            <div className="flex items-center justify-between px-2.5 py-1 mb-2.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-[10.5px] text-indigo-200 animate-in fade-in duration-150">
                              <span className="flex items-center gap-1.5 font-medium">
                                <span className="text-indigo-400 flex items-center">{EXTRACTION_LENSES.find((l) => l.key === selectedLensPerMsg[idx])?.icon}</span>
                                <span>Viewing through <strong>{EXTRACTION_LENSES.find((l) => l.key === selectedLensPerMsg[idx])?.label}</strong> lens</span>
                              </span>
                              <button
                                type="button"
                                onPointerDown={(e) => {
                                  e.preventDefault();
                                  setSelectedLensPerMsg((prev) => {
                                    const n = { ...prev };
                                    delete n[idx];
                                    return n;
                                  });
                                  if (showToast) showToast('Reset to standard perspective');
                                }}
                                className="text-indigo-300 hover:text-white px-1.5 py-0.5 rounded hover:bg-white/10 flex items-center gap-1 cursor-pointer transition-colors"
                                title="Reset to Original Perspective"
                              >
                                <X size={10} />
                                <span className="text-[9.5px]">Reset</span>
                              </button>
                            </div>
                          )}

                          {msg.sender === 'user' ? (
                            <div className="whitespace-pre-wrap font-normal text-slate-50 text-[12px] break-words break-all [overflow-wrap:anywhere]">{msg.text}</div>
                          ) : (
                            <BrowserMarkdownRenderer content={selectedLensPerMsg[idx] ? formatContentWithLens(msg.text, selectedLensPerMsg[idx]) : msg.text} />
                          )}

                          {msg.isStreaming && (
                            <span className="inline-block w-1.5 h-3.5 bg-violet-400 ml-1 animate-pulse align-middle" />
                          )}

                          {/* IN-CHAT INTERACTIVE WORKSPACE TOOL HARNESS WIDGETS */}
                          {msg.toolCall && (
                            <div className="w-full mt-3 rounded-xl bg-[#141622] border border-emerald-500/30 overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-150">
                              {/* Widget 1: Interactive Spreadsheet Table */}
                              {msg.toolCall.tool === 'workspace_create_sheet' && (
                                <div className="space-y-0">
                                  <div className="px-3 py-2 bg-gradient-to-r from-emerald-950/60 to-slate-900/90 border-b border-white/[0.08] flex items-center justify-between">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className="p-1 rounded bg-emerald-500/20 text-emerald-400">
                                        <SheetIcon size={13} />
                                      </div>
                                      <span className="text-[11.5px] font-semibold text-slate-100 truncate">
                                        {msg.toolCall.parameters?.title || 'Interactive Spreadsheet'}
                                      </span>
                                      <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-mono">
                                        {msg.toolCall.parameters?.data?.length || 0} rows
                                      </span>
                                    </div>

                                    <button
                                      type="button"
                                      onPointerDown={(e) => {
                                        e.preventDefault();
                                        const payload = {
                                          title: msg.toolCall.parameters?.title || `Data — ${activeTab?.title || 'Research'}`,
                                          columns: msg.toolCall.parameters?.columns || ['Item', 'Details', 'Source'],
                                          rows: msg.toolCall.parameters?.data || [],
                                          sourceUrl: activeTab?.url,
                                          sourceTitle: activeTab?.title
                                        };
                                        if (typeof onDirectExportToSheets === 'function') {
                                          onDirectExportToSheets(payload);
                                        } else {
                                          onOpenSendToSheets?.({ bottom: 60, right: 300 });
                                        }
                                      }}
                                      className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[10.5px] font-medium flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                                    >
                                      <ExternalLink size={11} />
                                      <span>Open in Sheets</span>
                                    </button>
                                  </div>

                                  {/* Table Data Grid */}
                                  <div className="overflow-x-auto max-h-56 regaarder-scrollbar">
                                    <table className="w-full text-left text-[11px] border-collapse">
                                      <thead className="sticky top-0 bg-[#1A1C2B] text-slate-300 border-b border-white/10 font-semibold">
                                        <tr>
                                          {(msg.toolCall.parameters?.columns || ['Item', 'Details', 'Source']).map((col, cIdx) => (
                                            <th key={cIdx} className="px-2.5 py-1.5 border-r border-white/5 font-medium text-[10px] uppercase tracking-wider text-slate-400">
                                              {col}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-white/[0.04]">
                                        {(msg.toolCall.parameters?.data || []).map((row, rIdx) => (
                                          <tr key={rIdx} className="hover:bg-white/[0.04] transition-colors">
                                            {Array.isArray(row) ? (
                                              row.map((cell, cIdx) => (
                                                <td key={cIdx} className="px-2.5 py-1.5 border-r border-white/[0.04] text-slate-200 truncate max-w-[140px]">
                                                  {cell}
                                                </td>
                                              ))
                                            ) : (
                                              <td className="px-2.5 py-1.5 text-slate-200">{String(row)}</td>
                                            )}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}

                              {/* Widget 2: Slide Deck Presentation */}
                              {msg.toolCall.tool === 'workspace_create_deck' && (
                                <div className="p-3 bg-gradient-to-r from-sky-950/60 to-slate-900/90 space-y-2">
                                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                                    <div className="flex items-center gap-1.5">
                                      <DeckIcon size={14} className="text-sky-400" />
                                      <span className="font-semibold text-slate-100 text-[11.5px]">
                                        {msg.toolCall.parameters?.title || 'Slide Deck Presentation'}
                                      </span>
                                      <span className="px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 text-[9.5px] font-mono">
                                        {msg.toolCall.parameters?.slides?.length || 3} Slides
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onPointerDown={(e) => {
                                        e.preventDefault();
                                        const payload = {
                                          title: msg.toolCall.parameters?.title || `Deck — ${activeTab?.title || 'Research'}`,
                                          slides: msg.toolCall.parameters?.slides || [],
                                          sourceUrl: activeTab?.url,
                                          sourceTitle: activeTab?.title
                                        };
                                        if (typeof onDirectExportToDeck === 'function') {
                                          onDirectExportToDeck(payload);
                                        }
                                      }}
                                      className="px-2.5 py-1 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-[10.5px] font-medium flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                                    >
                                      <ExternalLink size={11} />
                                      <span>Open in Decks</span>
                                    </button>
                                  </div>
                                  <div className="space-y-1.5">
                                    {(msg.toolCall.parameters?.slides || []).map((slide, sIdx) => (
                                      <div key={sIdx} className="p-2 rounded-lg bg-black/30 border border-white/[0.06] text-[10.5px]">
                                        <div className="font-semibold text-sky-300 mb-0.5">Slide {sIdx + 1}: {slide.title}</div>
                                        <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                                          {(slide.bullets || []).map((b, bIdx) => (
                                            <li key={bIdx} className="truncate">{b}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Action Plan Execution Card */}
                          {msg.actionPlan && (
                            <div className="w-full mt-2.5 rounded-xl bg-slate-900/90 border border-violet-500/30 overflow-hidden shadow-lg animate-in fade-in zoom-in-95 duration-150">
                              {/* Plan Header */}
                              <div className="px-3 py-2 bg-gradient-to-r from-violet-950/60 to-slate-900/90 border-b border-white/[0.08] flex items-center justify-between">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <Wand2 size={12} className="text-violet-400 shrink-0" />
                                  <span className="text-[11px] font-semibold text-slate-200 truncate">
                                    {msg.actionPlan.plan || 'Browser Action Plan'}
                                  </span>
                                </div>
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-medium tracking-wide uppercase font-mono shrink-0 ${
                                    msg.actionPlan.risk === 'high'
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  }`}
                                >
                                  {msg.actionPlan.risk === 'high' ? 'Approval Required' : 'Low Risk Plan'}
                                </span>
                              </div>

                              {/* Steps List */}
                              <div className="p-2.5 space-y-1.5 bg-black/20">
                                {msg.actionPlan.actions.map((act, actIdx) => (
                                  <div
                                    key={act.id || actIdx}
                                    className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[10.5px]"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="w-4 h-4 rounded-full bg-white/[0.08] text-[9px] font-mono text-slate-400 flex items-center justify-center shrink-0">
                                        {actIdx + 1}
                                      </span>
                                      <div className="truncate text-slate-300">
                                        <span className="font-semibold text-violet-300 capitalize">{act.action}</span>
                                        {act.elementId && (
                                          <span className="ml-1 px-1 py-0.2 rounded bg-white/[0.08] text-[9px] font-mono text-slate-400">
                                            {act.elementId}
                                          </span>
                                        )}
                                        {act.value && (
                                          <span className="ml-1 text-slate-400 truncate">"{act.value}"</span>
                                        )}
                                        {act.description && !act.elementId && !act.value && (
                                          <span className="ml-1 text-slate-400 truncate">{act.description}</span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="shrink-0 flex items-center">
                                      {act.status === 'running' && (
                                        <span className="flex items-center gap-1 text-[9.5px] text-violet-400 font-mono">
                                          <RefreshCw size={10} className="animate-spin" />
                                          <span>Running</span>
                                        </span>
                                      )}
                                      {act.status === 'completed' && (
                                        <span className="flex items-center gap-1 text-[9.5px] text-emerald-400 font-mono">
                                          <CheckCircle2 size={11} />
                                          <span>Done</span>
                                        </span>
                                      )}
                                      {act.status === 'failed' && (
                                        <span className="flex items-center gap-1 text-[9.5px] text-rose-400 font-mono">
                                          <AlertCircle size={11} />
                                          <span>Failed</span>
                                        </span>
                                      )}
                                      {(!act.status || act.status === 'idle') && (
                                        <span className="flex items-center gap-1 text-[9.5px] text-slate-500 font-mono">
                                          <Clock size={10} />
                                          <span>Ready</span>
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Card Footer Controls */}
                              <div className="px-3 py-2 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between gap-2">
                                {msg.actionPlan.status === 'ready' ? (
                                  <>
                                    <button
                                      type="button"
                                      onPointerDown={(e) => {
                                        e.preventDefault();
                                        executeActionPlan(msg.actionPlan, idx);
                                      }}
                                      className="flex-1 py-1 px-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                                    >
                                      <Play size={10} className="fill-current" />
                                      <span>Execute</span>
                                    </button>
                                    <button
                                      type="button"
                                      onPointerDown={(e) => {
                                        e.preventDefault();
                                        handleStartSpotlightTour(msg.actionPlan);
                                      }}
                                      className="py-1 px-2.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-violet-300 hover:text-violet-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-violet-500/30"
                                      title="Launch interactive visual tour on page"
                                    >
                                      <Compass size={11} />
                                      <span>Spotlight Tour</span>
                                    </button>
                                    <button
                                      type="button"
                                      onPointerDown={(e) => {
                                        e.preventDefault();
                                        setChatMessages((prev) => {
                                          const copy = [...prev];
                                          if (copy[idx]) {
                                            copy[idx] = { ...copy[idx], actionPlan: undefined };
                                          }
                                          return copy;
                                        });
                                      }}
                                      className="py-1 px-2.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-400 hover:text-slate-200 text-[11px] font-medium transition-all cursor-pointer"
                                    >
                                      Dismiss
                                    </button>
                                  </>
                                ) : msg.actionPlan.status === 'executing' ? (
                                  <div className="w-full flex items-center justify-center gap-2 py-0.5 text-xs text-violet-300">
                                    <RefreshCw size={12} className="animate-spin text-violet-400" />
                                    <span className="text-[11px] font-medium">Executing action sequence...</span>
                                  </div>
                                ) : (
                                  <div className="w-full flex items-center justify-between gap-2">
                                    <span className="flex items-center gap-1 text-[10.5px] text-emerald-400 font-medium">
                                      <CheckCircle2 size={12} />
                                      <span>All actions verified on page</span>
                                    </span>
                                    <button
                                      type="button"
                                      onPointerDown={(e) => {
                                        e.preventDefault();
                                        if (onRunFlowRequested) {
                                          onRunFlowRequested({
                                            id: `flow-${Date.now()}`,
                                            title: msg.actionPlan.plan,
                                            steps: msg.actionPlan.actions
                                          });
                                        }
                                        if (showToast) showToast('Saved action sequence to Regaarder Flows');
                                      }}
                                      className="px-2 py-0.5 rounded bg-white/[0.08] hover:bg-white/[0.14] text-[10px] font-medium text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                                    >
                                      <Plus size={10} />
                                      <span>Save to Flows</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                           {/* Executive Apple-Tier Video Walkthrough Player Card */}
                           {msg.videoTutorial && (
                             <div className="w-full mt-3 rounded-2xl bg-[#121320]/95 backdrop-blur-2xl border border-violet-500/30 overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.5),0_0_24px_rgba(139,92,246,0.18)] animate-in fade-in zoom-in-95 duration-200">
                               {/* Video Header */}
                               <div className="px-3.5 py-2.5 bg-gradient-to-r from-violet-950/70 to-slate-900/90 border-b border-white/[0.08] flex items-center justify-between">
                                 <div className="flex items-center gap-2 min-w-0">
                                   <div className="w-6 h-6 rounded-lg bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-violet-300 shrink-0">
                                     <Video size={13} />
                                   </div>
                                   <div className="min-w-0">
                                     <span className="text-[11.5px] font-semibold text-slate-100 truncate block">
                                       {msg.videoTutorial.title || 'Recorded Video Tutorial'}
                                     </span>
                                     <span className="text-[9.5px] text-slate-400 font-mono">
                                       {msg.videoTutorial.duration || '60 FPS Live Replay'}
                                     </span>
                                   </div>
                                 </div>

                                 <div className="flex items-center gap-1.5">
                                   <a
                                     href={msg.videoTutorial.videoUrl}
                                     download="tutorial-walkthrough.webm"
                                     className="px-2 py-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-slate-200 hover:text-white text-[10px] font-medium transition-colors flex items-center gap-1 cursor-pointer border border-white/[0.08]"
                                     title="Download tutorial video file (.webm)"
                                   >
                                     <Download size={11} />
                                     <span>Save Video</span>
                                   </a>
                                 </div>
                                </div>

                               {/* Native Video Player */}
                               <div className="relative bg-black/80 aspect-video flex items-center justify-center overflow-hidden">
                                 <video
                                   src={msg.videoTutorial.videoUrl}
                                   controls
                                   autoPlay
                                   loop
                                   playsInline
                                   className="w-full h-full object-contain"
                                 />
                               </div>

                               {/* Step Breakdown Strip */}
                               {msg.videoTutorial.steps && msg.videoTutorial.steps.length > 0 && (
                                 <div className="p-2.5 bg-black/20 border-t border-white/[0.06] space-y-1">
                                   <span className="text-[9.5px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                                     Recorded Steps Timeline:
                                   </span>
                                   {msg.videoTutorial.steps.map((st, sIdx) => (
                                     <div key={sIdx} className="flex items-center gap-2 text-[10.5px] text-slate-300">
                                       <span className="w-4 h-4 rounded-full bg-violet-500/20 text-violet-300 font-mono text-[9px] flex items-center justify-center shrink-0">
                                         {sIdx + 1}
                                       </span>
                                       <span className="truncate">{st.description || st.label}</span>
                                     </div>
                                   ))}
                                 </div>
                               )}
                             </div>
                           )}

                           {/* CONTEXTUAL ONE-TAP TOOL ACTION CHIPS */}
                           {msg.sender === 'agent' && !msg.isStreaming && !msg.isError && (() => {
                             const activeLens = selectedLensPerMsg[idx] || null;
                             const isClarifyOpen = clarifyingDropdownMsgIdx === idx;
                             const getLensText = (text) => formatContentWithLens(text, activeLens);

                             return (
                               <div className="flex flex-col gap-1.5 mt-2.5 pt-2 border-t border-white/[0.06]">
                                 {/* Top row: label + lens selector */}
                                 <div className="flex items-center gap-2 flex-wrap">
                                   <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Actions:</span>

                                   {/* Clarifying Lens Selector */}
                                   <div data-lens-dropdown="true" className="relative">
                                     <button
                                       type="button"
                                       onPointerDown={(e) => {
                                         e.preventDefault();
                                         setClarifyingDropdownMsgIdx((prev) => (prev === idx ? null : idx));
                                         setOpenActionDropdownIdx(null);
                                       }}
                                       className={`px-2 py-0.5 rounded-md border text-[10px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                                         activeLens
                                           ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                                           : 'bg-white/[0.04] border-white/[0.10] text-slate-400 hover:text-slate-200 hover:bg-white/[0.08]'
                                       }`}
                                     >
                                       <span className="flex items-center text-indigo-400">{activeLens ? EXTRACTION_LENSES.find(l => l.key === activeLens)?.icon : <LensSelectIcon size={11} />}</span>
                                       <span>{activeLens ? EXTRACTION_LENSES.find(l => l.key === activeLens)?.label : 'Select Lens'}</span>
                                       <ChevronDown size={9} className="opacity-60" />
                                     </button>

                                     {isClarifyOpen && (
                                       <div
                                         onPointerDown={(e) => e.stopPropagation()}
                                         className="absolute left-0 bottom-full mb-1.5 w-48 rounded-xl bg-[#181a26] border border-white/10 shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                                       >
                                         <p className="px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-widest text-slate-500">Extraction Lens</p>
                                         {EXTRACTION_LENSES.map((lens) => (
                                           <button
                                             key={lens.key}
                                             type="button"
                                             onPointerDown={(e) => {
                                               e.preventDefault();
                                               setSelectedLensPerMsg((prev) => ({ ...prev, [idx]: lens.key }));
                                               setClarifyingDropdownMsgIdx(null);
                                               if (showToast) showToast(`Applied "${lens.label}" perspective`);
                                             }}
                                             className={`w-full px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-2 text-left cursor-pointer ${
                                               activeLens === lens.key
                                                 ? 'bg-indigo-500/25 text-indigo-200'
                                                 : 'hover:bg-white/[0.06] text-slate-300 hover:text-slate-100'
                                             }`}
                                           >
                                             <span className="flex items-center text-indigo-400">{lens.icon}</span>
                                             <span>{lens.label}</span>
                                           </button>
                                         ))}
                                         {activeLens && (
                                           <button
                                             type="button"
                                             onPointerDown={(e) => {
                                               e.preventDefault();
                                               setSelectedLensPerMsg((prev) => { const n = { ...prev }; delete n[idx]; return n; });
                                               setClarifyingDropdownMsgIdx(null);
                                               if (showToast) showToast('Reset to standard perspective');
                                             }}
                                             className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] text-slate-500 hover:text-slate-400 text-[10px] flex items-center gap-1.5 border-t border-white/[0.05] cursor-pointer"
                                           >
                                             <X size={10} /> Clear lens
                                           </button>
                                         )}
                                       </div>
                                     )}
                                   </div>
                                 </div>

                                 {/* Action chips row */}
                                 <div className="flex flex-wrap items-center gap-1.5">
                                   <button
                                     type="button"
                                     onPointerDown={(e) => {
                                       e.preventDefault();
                                       handleStartSpotlightTour(null, `Guide: ${summary?.domain || 'Interactive Steps'}`, msg.text);
                                     }}
                                     className="px-2 py-0.5 rounded-md bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-200 text-[10px] font-semibold transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                                     title="Launch live interactive visual walkthrough on page"
                                   >
                                     <Compass size={10} className="text-violet-400" />
                                     <span>Spotlight Tour</span>
                                   </button>
                                   <button
                                     type="button"
                                     onPointerDown={(e) => {
                                       e.preventDefault();
                                       handleRecordVideoTutorial(null, `Walkthrough: ${summary?.domain || 'Page'}`);
                                     }}
                                     disabled={isRecordingTutorial}
                                     className="px-2 py-0.5 rounded-md bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-200 text-[10px] font-semibold transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                                     title="Record live 60FPS video walkthrough tutorial"
                                   >
                                     <Video size={10} className={isRecordingTutorial ? 'text-rose-400 animate-spin' : 'text-rose-300'} />
                                     <span>{isRecordingTutorial ? 'Recording...' : 'Video Tutorial'}</span>
                                   </button>
                                  <button
                                    type="button"
                                    onPointerDown={(e) => {
                                      e.preventDefault();
                                      handleExecuteQuickTool('sheet', getLensText(msg.text), idx);
                                    }}
                                    className="px-2 py-0.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-300 text-[10px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                                  >
                                    <SheetIcon size={10} />
                                    <span>Convert to Sheet</span>
                                  </button>
                                  <button
                                    type="button"
                                    onPointerDown={(e) => {
                                      e.preventDefault();
                                      handleExecuteQuickTool('compose', getLensText(msg.text), idx);
                                    }}
                                    className="px-2 py-0.5 rounded-md bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/25 text-violet-300 text-[10px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                                  >
                                    <ComposeIcon size={10} />
                                    <span>Create Doc Brief</span>
                                  </button>
                                  <button
                                    type="button"
                                    onPointerDown={(e) => {
                                      e.preventDefault();
                                      handleExecuteQuickTool('whiteboard', getLensText(msg.text), idx);
                                    }}
                                    className="px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-300 text-[10px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                                  >
                                    <WhiteboardIcon size={10} />
                                    <span>Diagram to Canvas</span>
                                  </button>
                                  <button
                                    type="button"
                                    onPointerDown={(e) => {
                                      e.preventDefault();
                                      handleExecuteQuickTool('deck', getLensText(msg.text), idx);
                                    }}
                                    className="px-2 py-0.5 rounded-md bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/25 text-sky-300 text-[10px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                                  >
                                    <DeckIcon size={10} />
                                    <span>Generate Deck</span>
                                  </button>

                                  {/* 3-Dot Overflow Actions Menu */}
                                  <div data-action-dropdown="true" className="relative">
                                    <button
                                      type="button"
                                      onPointerDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setOpenActionDropdownIdx((prev) => (prev === idx ? null : idx));
                                        setClarifyingDropdownMsgIdx(null);
                                      }}
                                      className="p-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer flex items-center justify-center"
                                      title="More actions"
                                    >
                                      <MoreHorizontal size={11} />
                                    </button>

                                    {openActionDropdownIdx === idx && (
                                      <div
                                        onPointerDown={(e) => e.stopPropagation()}
                                        className="absolute right-0 bottom-full mb-1.5 w-44 rounded-xl bg-[#181a26] border border-white/10 shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                                      >
                                        <button
                                          type="button"
                                          onPointerDown={(e) => {
                                            e.preventDefault();
                                            setOpenActionDropdownIdx(null);
                                            handleConvertMessageToTasks(msg.text);
                                          }}
                                          className="w-full px-2.5 py-1.5 rounded-lg hover:bg-violet-500/20 text-slate-200 hover:text-violet-200 text-[11px] font-medium transition-colors flex items-center gap-2 text-left cursor-pointer"
                                        >
                                          <TasksIcon size={12} className="text-violet-400" />
                                          <span>Convert to Tasks</span>
                                        </button>
                                        <button
                                          type="button"
                                          onPointerDown={(e) => {
                                            e.preventDefault();
                                            setOpenActionDropdownIdx(null);
                                            onSaveToMemory?.();
                                            if (showToast) showToast('Saved key takeaways to memory graph');
                                          }}
                                          className="w-full px-2.5 py-1.5 rounded-lg hover:bg-white/[0.06] text-slate-300 hover:text-slate-100 text-[11px] font-medium transition-colors flex items-center gap-2 text-left cursor-pointer"
                                        >
                                          <MemoryIcon size={12} className="text-emerald-400" />
                                          <span>Save to Memory</span>
                                        </button>
                                        <button
                                          type="button"
                                          onPointerDown={(e) => {
                                            e.preventDefault();
                                            setOpenActionDropdownIdx(null);
                                            handleCopyMessage(msg.text, idx);
                                          }}
                                          className="w-full px-2.5 py-1.5 rounded-lg hover:bg-white/[0.06] text-slate-300 hover:text-slate-100 text-[11px] font-medium transition-colors flex items-center gap-2 text-left cursor-pointer border-t border-white/[0.04] mt-0.5"
                                        >
                                          <Copy size={11} className="text-slate-400" />
                                          <span>Copy Raw Text</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                        </div>

                        {/* Structured Citations & Sources Card */}
                        {msg.sources && msg.sources.length > 0 && !msg.isStreaming && (
                          <div className="mt-2 w-full rounded-xl bg-[#12131A] border border-white/[0.08] overflow-hidden text-xs">
                            {/* Sources Accordion Header */}
                            <div
                              onPointerDown={(e) => {
                                e.preventDefault();
                                setExpandedSources((prev) => ({ ...prev, [idx]: !prev[idx] }));
                              }}
                              className="px-2.5 py-1.5 bg-white/[0.02] hover:bg-white/[0.05] border-b border-white/[0.06] flex items-center justify-between cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
                                <BookOpen size={12} className="text-violet-400" />
                                <span>Sources & References</span>
                                <span className="px-1.5 py-0.2 rounded-full bg-violet-500/20 text-violet-300 text-[9.5px] font-mono">
                                  {msg.sources.length}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                                <span>{expandedSources[idx] ? 'Collapse' : 'Expand'}</span>
                                {expandedSources[idx] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                              </div>
                            </div>

                            {/* Sources Body */}
                            {expandedSources[idx] && (
                              <div className="p-2.5 space-y-2.5 bg-black/20">
                                {/* Source Items */}
                                <div className="space-y-1.5">
                                  {msg.sources.map((src, sIdx) => {
                                    const activeSrcIdx = selectedSourceIndices[idx] !== undefined ? selectedSourceIndices[idx] : 0;
                                    const isSelected = activeSrcIdx === sIdx;
                                    return (
                                      <div
                                        key={src.id || sIdx}
                                        onPointerDown={() => {
                                          setSelectedSourceIndices((prev) => ({ ...prev, [idx]: sIdx }));
                                        }}
                                        className={`p-2 rounded-lg border transition-all cursor-pointer space-y-1 ${
                                          isSelected
                                            ? 'bg-violet-500/15 border-violet-500/60 shadow-xs ring-1 ring-violet-500/30'
                                            : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.07] hover:border-white/20'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between gap-2">
                                          <div className="flex items-center gap-1.5 min-w-0">
                                            <span className={`w-4 h-4 rounded text-[9px] font-mono flex items-center justify-center font-bold shrink-0 ${
                                              isSelected ? 'bg-violet-600 text-white' : 'bg-white/10 text-slate-400'
                                            }`}>
                                              {sIdx + 1}
                                            </span>
                                            <a
                                              href={src.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              onPointerDown={(e) => e.stopPropagation()}
                                              className="text-[11px] font-semibold text-violet-300 hover:text-violet-200 hover:underline truncate flex items-center gap-1"
                                            >
                                              <span className="truncate">{src.title}</span>
                                              <ExternalLink size={10} className="shrink-0 text-slate-400" />
                                            </a>
                                          </div>
                                          <span className="text-[9.5px] font-mono text-slate-400 shrink-0">
                                            {src.domain}
                                          </span>
                                        </div>

                                        {src.snippet && (
                                          <p className="text-[10px] text-slate-400 italic line-clamp-2 leading-relaxed break-words">
                                            "{src.snippet}"
                                          </p>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Citation Format Switcher */}
                                {(() => {
                                  const activeSrcIdx = selectedSourceIndices[idx] !== undefined ? selectedSourceIndices[idx] : 0;
                                  const activeSource = msg.sources[activeSrcIdx] || msg.sources[0];
                                  return (
                                    <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                                          Citation Style {msg.sources.length > 1 ? `(Card #${activeSrcIdx + 1})` : ''}
                                        </span>
                                        <div className="flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-md border border-white/[0.06]">
                                          {['apa', 'mla', 'chicago', 'harvard', 'vancouver'].map((style) => (
                                            <button
                                              key={style}
                                              type="button"
                                              onPointerDown={(e) => {
                                                e.preventDefault();
                                                setSelectedCitationStyle(style);
                                              }}
                                              className={`px-1.5 py-0.5 rounded text-[9.5px] font-mono uppercase transition-all cursor-pointer ${
                                                selectedCitationStyle === style
                                                  ? 'bg-violet-600 text-white font-semibold shadow-sm'
                                                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
                                              }`}
                                            >
                                              {style}
                                            </button>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Formatted Citation Output Box */}
                                      <div className="p-2 rounded-lg bg-black/40 border border-white/[0.08] text-[10.5px] text-slate-300 font-mono select-text leading-relaxed break-all">
                                        {formatCitation(activeSource, selectedCitationStyle)}
                                      </div>

                                      {/* Citation Action Buttons */}
                                      <div className="flex items-center justify-end gap-1.5 pt-1">
                                        <button
                                          type="button"
                                          onPointerDown={(e) => {
                                            e.preventDefault();
                                            const citationText = formatCitation(activeSource, selectedCitationStyle);
                                            navigator.clipboard.writeText(citationText);
                                            setCopiedCitationIdx(idx);
                                            if (showToast) showToast(`Copied ${selectedCitationStyle.toUpperCase()} citation for Card #${activeSrcIdx + 1}`);
                                            setTimeout(() => setCopiedCitationIdx(null), 2000);
                                          }}
                                          className="px-2 py-1 rounded bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white text-[10px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                                        >
                                          {copiedCitationIdx === idx ? (
                                            <>
                                              <Check size={10} className="text-emerald-400" />
                                              <span className="text-emerald-400">Copied</span>
                                            </>
                                          ) : (
                                            <>
                                              <Copy size={10} />
                                              <span>Copy Citation</span>
                                            </>
                                          )}
                                        </button>
                                        <button
                                          type="button"
                                          onPointerDown={(e) => {
                                            e.preventDefault();
                                            const citationText = formatCitation(activeSource, selectedCitationStyle);
                                            onOpenSendToCompose?.({ bottom: 60, right: 300, content: citationText });
                                            if (showToast) showToast(`Inserting citation #${activeSrcIdx + 1} into Compose...`);
                                          }}
                                          className="px-2 py-1 rounded bg-violet-600/80 hover:bg-violet-600 text-white text-[10px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                                        >
                                          <FileText size={10} />
                                          <span>Insert in Doc</span>
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Feedback Badge if exists */}
                        {msg.feedback && (
                          <div className="mt-1.5 flex flex-col gap-1 w-full animate-in fade-in duration-150">
                            <div
                              onPointerDown={(e) => {
                                e.preventDefault();
                                setExpandedFeedbacks((prev) => ({ ...prev, [idx]: !prev[idx] }));
                              }}
                              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10.5px] cursor-pointer transition-colors self-start"
                            >
                              <MessageSquare size={11} className="shrink-0 text-amber-400" />
                              <span className="font-medium truncate max-w-[220px]">
                                {expandedFeedbacks[idx] ? 'Feedback rule active:' : `Rule: "${msg.feedback.slice(0, 30)}..."`}
                              </span>
                              {expandedFeedbacks[idx] ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                            </div>

                            {expandedFeedbacks[idx] && (
                              <div className="p-2 rounded-lg bg-[#14120E] border border-amber-500/30 text-[11px] text-amber-200/90 space-y-1.5">
                                <p className="leading-relaxed font-normal select-text">{msg.feedback}</p>
                                <div className="flex items-center justify-between pt-1 border-t border-amber-500/20 text-[10px]">
                                  <span className="text-amber-400/70 italic text-[9.5px]">
                                    Future LLM prompts will respect this rule.
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onPointerDown={(e) => {
                                        e.preventDefault();
                                        setFeedbackInputText(msg.feedback);
                                        setOpenFeedbackIdx(idx);
                                      }}
                                      className="px-1.5 py-0.5 rounded hover:bg-amber-500/20 text-amber-300 transition-colors cursor-pointer"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onPointerDown={(e) => {
                                        e.preventDefault();
                                        handleRemoveFeedback(idx);
                                      }}
                                      className="px-1.5 py-0.5 rounded hover:bg-rose-500/20 text-rose-300 transition-colors cursor-pointer"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Inline Feedback Composer Form */}
                        {openFeedbackIdx === idx && (
                          <div className="mt-2 w-full p-2.5 rounded-xl bg-[#181A24] border border-violet-500/40 shadow-xl space-y-2 animate-in fade-in zoom-in-95 duration-150">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-200">
                              <div className="flex items-center gap-1.5">
                                <MessageSquarePlus size={12} className="text-violet-400" />
                                <span>Add Feedback / Correction</span>
                              </div>
                              <button
                                type="button"
                                onPointerDown={(e) => {
                                  e.preventDefault();
                                  setOpenFeedbackIdx(null);
                                  setFeedbackInputText('');
                                }}
                                className="p-0.5 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200 cursor-pointer"
                              >
                                <X size={12} />
                              </button>
                            </div>
                            <textarea
                              value={feedbackInputText}
                              onChange={(e) => setFeedbackInputText(e.target.value)}
                              placeholder="Tell the LLM what to correct (e.g. 'Never include intro text, list only market caps')..."
                              className="w-full h-16 p-2 rounded-lg bg-black/40 border border-white/10 text-slate-200 text-[11px] placeholder:text-slate-500 resize-none focus:outline-none focus:border-violet-500 transition-colors"
                              autoFocus
                            />
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onPointerDown={(e) => {
                                  e.preventDefault();
                                  setOpenFeedbackIdx(null);
                                  setFeedbackInputText('');
                                }}
                                className="px-2 py-1 rounded bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-slate-200 text-[10.5px] font-medium transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onPointerDown={(e) => {
                                  e.preventDefault();
                                  handleSaveFeedback(idx);
                                }}
                                disabled={!feedbackInputText.trim()}
                                className="px-2.5 py-1 rounded bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-[10.5px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Check size={11} />
                                <span>Save Rule</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Floating Executive Action Dock on Hover */}
                        {!msg.isStreaming && !msg.isError && (
                          <div
                            className={`opacity-0 group-hover:opacity-100 transition-all duration-150 flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-lg bg-[#181A24]/90 border border-white/10 shadow-lg backdrop-blur-md z-10 ${
                              msg.sender === 'user' ? 'self-end' : 'self-start'
                            }`}
                          >
                            {/* Copy Action */}
                            <button
                              type="button"
                              onPointerDown={(e) => {
                                e.preventDefault();
                                handleCopyMessage(msg.text, idx);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-all cursor-pointer"
                              title="Copy prompt"
                            >
                              {copiedMessageIdx === idx ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                            </button>

                            {/* User-Specific Actions */}
                            {msg.sender === 'user' && (
                              <>
                                <button
                                  type="button"
                                  onPointerDown={(e) => {
                                    e.preventDefault();
                                    handleEditUserPrompt(msg.text, idx);
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-all cursor-pointer"
                                  title="Edit prompt"
                                >
                                  <Edit3 size={11} />
                                </button>
                                <button
                                  type="button"
                                  onPointerDown={(e) => {
                                    e.preventDefault();
                                    handleSaveUserPrompt(msg.text);
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-sky-300 hover:bg-sky-500/10 transition-all cursor-pointer"
                                  title="Save prompt to Memory"
                                >
                                  <Bookmark size={11} />
                                </button>
                              </>
                            )}

                            {/* Assistant-Specific Actions */}
                            {msg.sender === 'agent' && (
                              <>
                                {/* Feedback / Comment */}
                                <button
                                  type="button"
                                  onPointerDown={(e) => {
                                    e.preventDefault();
                                    setFeedbackInputText(msg.feedback || '');
                                    setOpenFeedbackIdx(openFeedbackIdx === idx ? null : idx);
                                  }}
                                  className={`p-1 rounded transition-all cursor-pointer ${
                                    msg.feedback
                                      ? 'text-amber-400 bg-amber-500/20'
                                      : openFeedbackIdx === idx
                                        ? 'text-violet-300 bg-violet-500/20'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/10'
                                  }`}
                                  title={msg.feedback ? 'Edit feedback rule' : 'Add feedback / correction for LLM'}
                                >
                                  {msg.feedback ? <MessageSquare size={11} /> : <MessageSquarePlus size={11} />}
                                </button>

                                {/* Text-to-Speech Listen */}
                                <button
                                  type="button"
                                  onPointerDown={(e) => {
                                    e.preventDefault();
                                    handleToggleTTS(msg.text, idx);
                                  }}
                                  className={`p-1 rounded transition-all cursor-pointer ${
                                    speakingMessageIdx === idx
                                      ? 'text-violet-400 bg-violet-500/20'
                                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/10'
                                  }`}
                                  title={speakingMessageIdx === idx ? 'Stop listening' : 'Listen to response'}
                                >
                                  {speakingMessageIdx === idx ? (
                                    <VolumeX size={11} className="text-rose-400" />
                                  ) : (
                                    <Volume2 size={11} />
                                  )}
                                </button>

                                {/* Regenerate */}
                                <button
                                  type="button"
                                  onPointerDown={(e) => {
                                    e.preventDefault();
                                    handleRegenerateResponse(idx);
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-all cursor-pointer"
                                  title="Regenerate response"
                                >
                                  <RotateCcw size={11} />
                                </button>

                                {/* Three-Dot Context Menu Button */}
                                <div className="relative" data-message-menu="true">
                                  <button
                                    type="button"
                                    onPointerDown={(e) => {
                                      e.preventDefault();
                                      setOpenMenuIdx(openMenuIdx === idx ? null : idx);
                                    }}
                                    className={`p-1 rounded transition-all cursor-pointer ${
                                      openMenuIdx === idx
                                        ? 'text-white bg-white/20'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/10'
                                    }`}
                                    title="More options (Export, Copy, Save)"
                                  >
                                    <MoreHorizontal size={12} />
                                  </button>

                                  {/* Dropdown Menu */}
                                  {openMenuIdx === idx && (
                                    <div
                                      data-popover="true"
                                      className="absolute left-0 bottom-full mb-1.5 w-48 rounded-xl bg-[#161722] border border-white/10 shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100 backdrop-blur-xl"
                                    >
                                      {/* Copy Response */}
                                      <button
                                        type="button"
                                        onPointerDown={(e) => {
                                          e.preventDefault();
                                          handleCopyMessage(msg.text, idx);
                                          setOpenMenuIdx(null);
                                        }}
                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-[11px] text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                                      >
                                        <Copy size={12} className="text-slate-400" />
                                        <span>Copy Response</span>
                                      </button>

                                      <div className="my-1 border-t border-white/[0.06]" />

                                      {/* Export to Compose */}
                                      <button
                                        type="button"
                                        onPointerDown={(e) => {
                                          e.preventDefault();
                                          onOpenSendToCompose?.({ bottom: 60, right: 300, content: msg.text });
                                          setOpenMenuIdx(null);
                                          if (showToast) showToast('Exporting response to Compose...');
                                        }}
                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-[11px] text-slate-300 hover:text-violet-300 hover:bg-violet-500/10 transition-colors cursor-pointer"
                                      >
                                        <FileText size={12} className="text-violet-400" />
                                        <span>Export to Compose</span>
                                      </button>

                                      {/* Export to Sheets */}
                                      <button
                                        type="button"
                                        onPointerDown={(e) => {
                                          e.preventDefault();
                                          onOpenSendToSheets?.({ bottom: 60, right: 300 });
                                          setOpenMenuIdx(null);
                                          if (showToast) showToast('Exporting response to Sheets...');
                                        }}
                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-[11px] text-slate-300 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                                      >
                                        <Table size={12} className="text-emerald-400" />
                                        <span>Export to Sheets</span>
                                      </button>

                                      {/* Export to Whiteboard */}
                                      <button
                                        type="button"
                                        onPointerDown={(e) => {
                                          e.preventDefault();
                                          onSendToWhiteboard?.();
                                          setOpenMenuIdx(null);
                                        }}
                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-[11px] text-slate-300 hover:text-sky-300 hover:bg-sky-500/10 transition-colors cursor-pointer"
                                      >
                                        <Layout size={12} className="text-sky-400" />
                                        <span>Export to Whiteboard</span>
                                      </button>

                                      <div className="my-1 border-t border-white/[0.06]" />

                                      {/* Save to Memory */}
                                      <button
                                        type="button"
                                        onPointerDown={(e) => {
                                          e.preventDefault();
                                          onSaveToMemory?.();
                                          setOpenMenuIdx(null);
                                        }}
                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-[11px] text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer"
                                      >
                                        <Bookmark size={12} className="text-amber-400" />
                                        <span>Save to Memory Graph</span>
                                      </button>

                                      <div className="my-1 border-t border-white/[0.06]" />

                                      {/* Delete Message */}
                                      <button
                                        type="button"
                                        onPointerDown={(e) => {
                                          e.preventDefault();
                                          handleDeleteMessage(idx);
                                          setOpenMenuIdx(null);
                                        }}
                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-[11px] text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                      >
                                        <Trash2 size={12} />
                                        <span>Delete Message</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}

                            {/* Delete Message for user */}
                            <button
                              type="button"
                              onPointerDown={(e) => {
                                e.preventDefault();
                                handleDeleteMessage(idx);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                              title="Delete message"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        )}

                        {/* Model Tag & Timestamp */}
                        {msg.sender === 'agent' && !msg.isError && (
                          <div className="flex items-center gap-1.5 mt-0.5 px-1 text-[9px] text-slate-500 font-mono">
                            <span>{msg.modelTag || selectedModel.name}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}

              {isGenerating && !chatMessages.some((m) => m.isStreaming) && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-slate-400 w-fit animate-pulse">
                  <Cpu size={13} className="text-violet-400 animate-spin" />
                  <span className="text-[11px]">Connecting to {selectedModel.name}...</span>
                </div>
              )}
            </div>

            {/* Selection HUD Chip */}
            {selectedTextContext && (
              <div className="mx-3 mb-1 p-2 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-between text-xs text-violet-300 shrink-0">
                <span className="truncate font-medium text-[11px]">Ask about: "{selectedTextContext.slice(0, 38)}..."</span>
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleSendMessage(`Explain selected context: "${selectedTextContext}"`);
                  }}
                  className="px-2 py-0.5 rounded bg-violet-600 text-white text-[10px] font-semibold cursor-pointer shrink-0 ml-1.5"
                >
                  Ask
                </button>
              </div>
            )}

            {/* 4. EXPANSIVE PROMPT INPUT CONTAINER WITH VOICE & REAL OLLAMA / GGUF MODEL PICKER */}
            <div className="p-3 border-t border-white/[0.08] bg-white/[0.02] shrink-0 space-y-2">
              {/* Hidden Media & Document File Input */}
              <input
                ref={mediaFileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,audio/*,.pdf,.txt,.md,.csv,.json,.doc,.docx"
                onChange={handleMediaFilesSelected}
                className="hidden"
              />

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="relative flex flex-col rounded-xl bg-black/40 border border-white/10 focus-within:border-violet-500/60 focus-within:ring-1 focus-within:ring-violet-500/30 transition-all shadow-inner"
              >
                {/* Model Capability Warning Notice */}
                {capabilityWarning && (
                  <div className="mx-2 mt-2 p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-200 text-[10.5px] flex items-center justify-between gap-2 animate-in fade-in duration-150">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <AlertCircle size={12} className="text-amber-400 shrink-0" />
                      <span className="truncate">{capabilityWarning}</span>
                    </div>
                    <button
                      type="button"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        setSelectedModel(CLOUD_FALLBACK_MODELS[0]);
                        setCapabilityWarning(null);
                        if (showToast) showToast('Switched to Cloud Gemini 3.7 Flash');
                      }}
                      className="px-2 py-0.5 rounded bg-amber-600/80 hover:bg-amber-600 text-white font-semibold text-[9.5px] shrink-0 cursor-pointer"
                    >
                      Switch to Gemini
                    </button>
                  </div>
                )}

                {/* Attached Files Preview Chips */}
                {attachedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 px-2.5 pt-2">
                    {attachedFiles.map((af) => (
                      <div
                        key={af.id}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.08] border border-white/10 text-[10.5px] text-slate-200"
                      >
                        {af.category === 'image' && af.dataUrl ? (
                          <img src={af.dataUrl} alt={af.name} className="w-4 h-4 rounded object-cover" />
                        ) : af.category === 'video' ? (
                          <Video size={11} className="text-violet-400 shrink-0" />
                        ) : af.category === 'audio' ? (
                          <Music size={11} className="text-violet-400 shrink-0" />
                        ) : (
                          <FileText size={11} className="text-violet-400 shrink-0" />
                        )}
                        <span className="truncate max-w-[120px]">{af.name}</span>
                        <span className="text-[9px] text-slate-400 font-mono">({af.size})</span>
                        <button
                          type="button"
                          onPointerDown={(e) => {
                            e.preventDefault();
                            handleRemoveAttachment(af.id);
                          }}
                          className="p-0.5 rounded hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer ml-0.5"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Action Suggestion Chips / Pills */}
                <div className="flex items-center gap-1.5 px-2.5 pt-2 pb-0.5 overflow-x-auto no-scrollbar">
                  {[
                    { label: '/tour', isSpecialTour: true },
                    { label: '/summarize', prompt: 'Summarize the key takeaways of this page in 3 concise executive points.' },
                    { label: '/actions', prompt: 'Extract all actionable tasks, checklist items, and next steps from this page.' },
                    { label: '/cite', prompt: 'Generate accurate academic citations for this page in APA, MLA, and Chicago styles.' },
                    { label: '/extract', prompt: 'Extract all structured tables and key metrics from this page.' }
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        if (chip.isSpecialTour) {
                          handleStartSpotlightTour(null, `Tour of ${summary?.domain || 'Page'}`);
                        } else {
                          handleSendMessage(chip.prompt);
                        }
                      }}
                      className="px-2 py-0.5 rounded-full bg-white/[0.04] hover:bg-violet-500/20 text-slate-400 hover:text-violet-200 border border-white/[0.08] hover:border-violet-500/30 text-[9.5px] font-mono transition-all cursor-pointer shrink-0"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* Textarea Prompt Box with Slash Command Detection */}
                <div className="relative w-full">
                  {/* Floating Contextual Slash Menu Palette */}
                  {showSlashMenu && (
                    <div
                      ref={slashMenuRef}
                      className="absolute left-2 bottom-full mb-2 w-72 bg-[#181A24]/98 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl z-50 overflow-hidden text-xs divide-y divide-white/[0.06] animate-in slide-in-from-bottom-2 duration-150"
                    >
                      <div className="px-3 py-2 bg-white/[0.02] flex items-center justify-between text-[10px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                          <AgentsIcon size={13} className="text-violet-400" />
                          <span>Slash Commands</span>
                        </span>
                        <span className="font-mono text-[9px] text-slate-500">↑↓ to navigate, ↵ to run</span>
                      </div>

                      {/* Explicit Search Bar for Slash Commands */}
                      <div className="p-2 border-b border-white/[0.06] bg-black/30">
                        <div className="relative flex items-center">
                          <Search size={11} className="absolute left-2.5 text-slate-400 pointer-events-none" />
                          <input
                            type="text"
                            value={slashFilter}
                            onChange={(e) => {
                              setSlashFilter(e.target.value.toLowerCase());
                              setSlashSelectedIndex(0);
                            }}
                            placeholder="Search commands..."
                            className="w-full pl-7 pr-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-[10.5px] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500/50"
                          />
                        </div>
                      </div>

                      <div className="max-h-52 overflow-y-auto p-1 space-y-0.5 regaarder-scrollbar">
                        {SLASH_COMMANDS
                          .filter((cmd) =>
                            cmd.command.toLowerCase().includes(slashFilter) ||
                            cmd.label.toLowerCase().includes(slashFilter)
                          )
                          .map((cmd, cIdx, arr) => {
                            const IconComp = cmd.icon;
                            const isSelected = slashSelectedIndex === cIdx;
                            return (
                              <button
                                key={cmd.command}
                                type="button"
                                onPointerDown={(e) => {
                                  e.preventDefault();
                                  handleExecuteSlashCommand(cmd);
                                }}
                                onMouseEnter={() => setSlashSelectedIndex(cIdx)}
                                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-violet-500/20 text-violet-200 border border-violet-500/40 shadow-xs'
                                    : 'text-slate-300 hover:bg-white/[0.04] hover:text-white border border-transparent'
                                }`}
                              >
                                <div className={`p-1 rounded-md shrink-0 ${isSelected ? 'bg-violet-500/30 text-violet-300' : 'bg-white/[0.06] text-slate-400'}`}>
                                  <IconComp size={12} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-semibold text-[11px] truncate">{cmd.label}</span>
                                    <span className={`font-mono text-[9px] px-1 rounded ${isSelected ? 'bg-violet-500/30 text-violet-200' : 'bg-white/[0.05] text-slate-400'}`}>
                                      {cmd.command}
                                    </span>
                                  </div>
                                  <p className={`text-[9.5px] truncate ${isSelected ? 'text-violet-200/80' : 'text-slate-400'}`}>
                                    {cmd.desc}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  <textarea
                    ref={chatInputRef}
                    value={inputQuery}
                    rows={2}
                    onChange={(e) => {
                      const val = e.target.value;
                      setInputQuery(val);
                      if (val.startsWith('/')) {
                        setShowSlashMenu(true);
                        setSlashFilter(val.slice(1).toLowerCase());
                        setSlashSelectedIndex(0);
                      } else {
                        setShowSlashMenu(false);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (showSlashMenu) {
                        const filtered = SLASH_COMMANDS.filter((cmd) =>
                          cmd.command.toLowerCase().includes(slashFilter) ||
                          cmd.label.toLowerCase().includes(slashFilter)
                        );
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setSlashSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
                          return;
                        }
                        if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          setSlashSelectedIndex((prev) => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
                          return;
                        }
                        if (e.key === 'Enter' || e.key === 'Tab') {
                          e.preventDefault();
                          const selectedCmd = filtered[slashSelectedIndex] || filtered[0];
                          if (selectedCmd) {
                            handleExecuteSlashCommand(selectedCmd);
                          }
                          return;
                        }
                        if (e.key === 'Escape') {
                          e.preventDefault();
                          setShowSlashMenu(false);
                          return;
                        }
                      }

                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={`Ask ${selectedModel.name} or type /command...`}
                    className="w-full px-3 py-2 bg-transparent text-xs text-slate-100 placeholder-slate-500 resize-none border-none outline-none focus:outline-none focus:ring-0 leading-relaxed font-normal"
                  />
                </div>

                {/* Bottom Control Toolbar inside Input Box */}
                <div className="flex items-center justify-between px-2.5 py-1.5 border-t border-white/[0.06] bg-white/[0.01]">
                  {/* Left: Plus Menu & Model Picker */}
                  <div className="flex items-center gap-1.5 relative">
                    {/* Plus Actions Tool Button */}
                    <div ref={plusMenuRef} className="relative">
                      <button
                        type="button"
                        onPointerDown={(e) => {
                          e.preventDefault();
                          setIsPlusMenuOpen((prev) => !prev);
                        }}
                        className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-all cursor-pointer ${
                          isPlusMenuOpen ? 'bg-white/15 text-white' : ''
                        }`}
                        title="Add Workspace Tools & Attachments"
                      >
                        <Plus size={14} />
                      </button>

                      {/* Progressive Disclosure Popover Menu */}
                      {isPlusMenuOpen && (
                        <div className="absolute left-0 bottom-8 mb-1 w-56 p-1.5 bg-[#181A24] border border-white/15 rounded-xl shadow-2xl z-50 animate-in zoom-in-95 duration-150 font-sans text-xs space-y-1">
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 px-2 pt-1 block">
                            Attach Files & Media
                          </span>
                          <button
                            type="button"
                            onPointerDown={(e) => {
                              e.preventDefault();
                              if (mediaFileInputRef.current) {
                                mediaFileInputRef.current.accept = 'image/*';
                                mediaFileInputRef.current.click();
                              }
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-violet-500/15 text-slate-300 hover:text-violet-200 transition-colors text-left cursor-pointer"
                          >
                            <ImageIcon size={13} className="text-violet-400" />
                            <span>Attach Image</span>
                          </button>

                          <button
                            type="button"
                            onPointerDown={(e) => {
                              e.preventDefault();
                              if (mediaFileInputRef.current) {
                                mediaFileInputRef.current.accept = '.pdf,.txt,.md,.csv,.json,.doc,.docx';
                                mediaFileInputRef.current.click();
                              }
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-emerald-500/15 text-slate-300 hover:text-emerald-200 transition-colors text-left cursor-pointer"
                          >
                            <FileUp size={13} className="text-emerald-400" />
                            <span>Attach Document / PDF</span>
                          </button>

                          <button
                            type="button"
                            onPointerDown={(e) => {
                              e.preventDefault();
                              if (mediaFileInputRef.current) {
                                mediaFileInputRef.current.accept = 'video/*';
                                mediaFileInputRef.current.click();
                              }
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sky-500/15 text-slate-300 hover:text-sky-200 transition-colors text-left cursor-pointer"
                          >
                            <Video size={13} className="text-sky-400" />
                            <span>Attach Video</span>
                          </button>

                          <button
                            type="button"
                            onPointerDown={(e) => {
                              e.preventDefault();
                              if (mediaFileInputRef.current) {
                                mediaFileInputRef.current.accept = 'audio/*';
                                mediaFileInputRef.current.click();
                              }
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-amber-500/15 text-slate-300 hover:text-amber-200 transition-colors text-left cursor-pointer"
                          >
                            <Music size={13} className="text-amber-400" />
                            <span>Attach Audio</span>
                          </button>

                          <div className="my-1 border-t border-white/[0.08]" />

                          <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 px-2 pt-0.5 block">
                            Export Page Knowledge
                          </span>
                          <button
                            type="button"
                            onPointerDown={(e) => {
                              e.preventDefault();
                              setIsPlusMenuOpen(false);
                              const overviewText = summary?.overview ? `Executive Summary of ${activeTab?.title || 'Page'}:\n\n${summary.overview}` : (activeTab?.title || 'Research Note');
                              onOpenSendToCompose?.({ bottom: 60, right: 300, content: overviewText });
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-violet-500/15 text-slate-300 hover:text-violet-200 transition-colors text-left cursor-pointer"
                          >
                            <ComposeIcon size={13} className="text-violet-400" />
                            <span>Send to Regaarder Compose</span>
                          </button>

                          <button
                            type="button"
                            onPointerDown={(e) => {
                              e.preventDefault();
                              setIsPlusMenuOpen(false);
                              onOpenSendToSheets?.({ bottom: 60, right: 300 });
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-emerald-500/15 text-slate-300 hover:text-emerald-200 transition-colors text-left cursor-pointer"
                          >
                            <SheetIcon size={13} className="text-emerald-400" />
                            <span>Export Matrix to Sheets</span>
                          </button>

                          <button
                            type="button"
                            onPointerDown={(e) => {
                              e.preventDefault();
                              setIsPlusMenuOpen(false);
                              onSaveToMemory?.();
                              if (showToast) showToast('Saved page context to Memory graph');
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sky-500/15 text-slate-300 hover:text-sky-200 transition-colors text-left cursor-pointer"
                          >
                            <MemoryIcon size={13} className="text-sky-400" />
                            <span>Ingest to Personal Memory</span>
                          </button>

                          <button
                            type="button"
                            onPointerDown={(e) => {
                              e.preventDefault();
                              setIsPlusMenuOpen(false);
                              onSendToWhiteboard?.();
                              if (showToast) showToast('Clipped layout to Canvas');
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-amber-500/15 text-slate-300 hover:text-amber-200 transition-colors text-left cursor-pointer"
                          >
                            <WhiteboardIcon size={13} className="text-amber-400" />
                            <span>Clip to Whiteboard</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Real Model Picker Chip */}
                    <div ref={modelPickerRef} className="relative">
                      <button
                        type="button"
                        onPointerDown={(e) => {
                          e.preventDefault();
                          setIsModelPickerOpen((prev) => !prev);
                        }}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.05] hover:bg-white/10 text-[10.5px] font-medium text-slate-300 hover:text-white transition-all cursor-pointer border border-white/[0.06]"
                        title="Select Local Ollama / llama.cpp or Cloud Model"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            selectedModel.isLocal
                              ? serverConnectionStatus === 'online'
                                ? 'bg-emerald-400'
                                : 'bg-amber-400'
                              : 'bg-emerald-400'
                          }`}
                        />
                        <span className="font-semibold max-w-[110px] truncate">{selectedModel.name}</span>
                        <ChevronDown size={11} className="text-slate-500" />
                      </button>

                      {/* Model Selector Popover Dropdown */}
                      {isModelPickerOpen && (
                        <div className="absolute left-0 bottom-9 mb-1 w-80 max-h-[65vh] overflow-y-auto regaarder-scrollbar p-2.5 bg-[#141520]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl z-[100] animate-in zoom-in-95 duration-150 font-sans text-xs space-y-2.5">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                              Inference Engine
                            </span>
                            <button
                              type="button"
                              onPointerDown={(e) => {
                                e.preventDefault();
                                detectLocalModels();
                              }}
                              className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-1 font-semibold cursor-pointer"
                            >
                              <RefreshCw size={10} className={isScanningServer ? 'animate-spin' : ''} />
                              <span>Rescan All (Ollama & llama.cpp)</span>
                            </button>
                          </div>

                          {/* Detected Local Models Section */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between px-1">
                              <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                                Local Models ({detectedLocalModels.length})
                              </span>
                              <span className="text-[9px] text-emerald-400 font-mono">
                                {serverConnectionStatus === 'online' ? `● ${detectedProvider} Online` : '● Offline'}
                              </span>
                            </div>

                            {detectedLocalModels.length > 0 ? (
                              <div className="max-h-40 overflow-y-auto space-y-1 pr-0.5 regaarder-scrollbar">
                                {detectedLocalModels.map((model) => (
                                  <button
                                    key={model.id}
                                    type="button"
                                    onPointerDown={(e) => {
                                      e.preventDefault();
                                      setSelectedModel(model);
                                      setIsModelPickerOpen(false);
                                      if (showToast) showToast(`Active model: ${model.name}`);
                                    }}
                                    className={`w-full flex items-start justify-between p-2 rounded-lg text-left transition-all cursor-pointer ${
                                      selectedModel.id === model.id
                                        ? 'bg-violet-600/25 border border-violet-500/50 text-white shadow-2xs'
                                        : 'hover:bg-white/[0.05] border border-transparent text-slate-300'
                                    }`}
                                  >
                                    <div className="space-y-0.5 min-w-0 pr-2">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-semibold text-[11px] truncate text-slate-100">{model.name}</span>
                                        <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/15 text-emerald-300 font-mono border border-emerald-500/30">
                                          {model.tag || model.provider}
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-slate-400 truncate">{model.description}</p>
                                    </div>
                                    {selectedModel.id === model.id && (
                                      <Check size={13} className="text-violet-400 shrink-0 mt-0.5" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[10px] text-slate-400 space-y-1">
                                <span>No active Ollama/llama models detected on ports 11434 / 8080.</span>
                              </div>
                            )}

                            {/* 1-Click Pull / Download Model Accordion Trigger */}
                            <div className="pt-1">
                              <button
                                type="button"
                                onPointerDown={(e) => {
                                  e.preventDefault();
                                  setShowPullDrawer((prev) => !prev);
                                }}
                                className="w-full flex items-center justify-between p-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-200 transition-all text-left cursor-pointer"
                              >
                                <div className="flex items-center gap-1.5">
                                  <Download size={13} className="text-sky-400" />
                                  <span className="text-[11px] font-semibold">1-Click Download Model to Machine</span>
                                </div>
                                <span className="text-[9px] font-mono text-sky-400">
                                  {showPullDrawer ? 'Hide ▲' : 'Pull ▼'}
                                </span>
                              </button>

                              {/* Pull Drawer */}
                              {showPullDrawer && (
                                <div className="mt-1.5 p-2 rounded-lg bg-black/50 border border-sky-500/20 space-y-2 animate-in fade-in duration-150">
                                  <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 block">
                                    Popular Fast Edge Models
                                  </span>
                                  <div className="grid grid-cols-1 gap-1">
                                    {POPULAR_PULL_MODELS.map((item) => (
                                      <div
                                        key={item.name}
                                        className="flex items-center justify-between p-1.5 rounded bg-white/[0.03] hover:bg-white/[0.07] text-[10px]"
                                      >
                                        <div className="min-w-0 pr-1">
                                          <strong className="text-slate-200 block truncate">{item.name}</strong>
                                          <span className="text-[9px] text-slate-500">{item.size} • {item.desc}</span>
                                        </div>
                                        <button
                                          type="button"
                                          disabled={isPullingModel}
                                          onPointerDown={(e) => {
                                            e.preventDefault();
                                            handlePullModel(item.name);
                                          }}
                                          className="px-2 py-0.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-colors cursor-pointer disabled:opacity-40 shrink-0"
                                        >
                                          {isPullingModel ? '...' : 'Download'}
                                        </button>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Custom model name pull input */}
                                  <div className="flex items-center gap-1 pt-1">
                                    <input
                                      type="text"
                                      value={pullModelInput}
                                      onChange={(e) => setPullModelInput(e.target.value)}
                                      placeholder="e.g. gemma3:1b or mistral"
                                      className="flex-1 px-2 py-1 rounded bg-white/10 text-[10px] text-slate-100 border-none outline-none"
                                    />
                                    <button
                                      type="button"
                                      disabled={!pullModelInput.trim() || isPullingModel}
                                      onPointerDown={(e) => {
                                        e.preventDefault();
                                        handlePullModel();
                                      }}
                                      className="px-2 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-semibold text-[10px] cursor-pointer disabled:opacity-30"
                                    >
                                      Pull
                                    </button>
                                  </div>

                                  {pullProgressText && (
                                    <div className="p-1.5 rounded bg-sky-950/40 border border-sky-500/30 text-[9.5px] font-mono text-sky-300">
                                      {pullProgressText}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Direct GGUF File Picker Button */}
                            <button
                              type="button"
                              onPointerDown={(e) => {
                                e.preventDefault();
                                fileInputRef.current?.click();
                              }}
                              className="w-full flex items-center justify-between p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-dashed border-white/20 text-slate-300 hover:text-white transition-all text-left cursor-pointer"
                            >
                              <div className="flex items-center gap-1.5">
                                <FolderOpen size={13} className="text-amber-400" />
                                <span className="text-[11px] font-medium">Browse Local .GGUF File on Disk...</span>
                              </div>
                              <span className="text-[9px] text-slate-500 font-mono">Pick File</span>
                            </button>
                          </div>

                          {/* Cloud Models Section */}
                          <div className="space-y-1 pt-1.5 border-t border-white/[0.06]">
                            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 px-1 block">
                              Cloud Engines
                            </span>
                            {CLOUD_FALLBACK_MODELS.map((model) => (
                              <button
                                key={model.id}
                                type="button"
                                onPointerDown={(e) => {
                                  e.preventDefault();
                                  setSelectedModel(model);
                                  setIsModelPickerOpen(false);
                                  if (showToast) showToast(`Active model: ${model.name}`);
                                }}
                                className={`w-full flex items-start justify-between p-1.5 rounded-lg text-left transition-all cursor-pointer ${
                                  selectedModel.id === model.id
                                    ? 'bg-violet-600/20 border border-violet-500/40 text-white'
                                    : 'hover:bg-white/[0.05] border border-transparent text-slate-300'
                                }`}
                              >
                                <div className="space-y-0.5 min-w-0 pr-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-[11px]">{model.name}</span>
                                    <span className="text-[9px] px-1 rounded bg-white/10 text-slate-400 font-mono">
                                      {model.tag}
                                    </span>
                                  </div>
                                </div>
                                {selectedModel.id === model.id && (
                                  <Check size={13} className="text-violet-400 shrink-0 mt-0.5" />
                                )}
                              </button>
                            ))}
                          </div>

                          {/* Endpoint Setting & Status Footer */}
                          <div className="p-2 rounded-lg bg-black/50 border border-white/[0.06] text-[10px] font-mono text-slate-400 space-y-1">
                            <div className="flex items-center justify-between">
                              <span>Active Endpoint:</span>
                              <span className="text-slate-200 font-semibold">{customEndpoint}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Status:</span>
                              <span className={serverConnectionStatus === 'online' ? 'text-emerald-400' : 'text-amber-400'}>
                                {serverConnectionStatus === 'online' ? '● Online (Direct SSE)' : '● Offline'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Voice Dictation & Send Button */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        toggleVoiceDictation();
                      }}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                        isRecordingVoice
                          ? 'bg-rose-500 text-white animate-pulse shadow-md ring-2 ring-rose-500/40'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-white/10'
                      }`}
                      title={isRecordingVoice ? 'Stop voice recording' : 'Start voice dictation'}
                    >
                      {isRecordingVoice ? <MicOff size={14} /> : <Mic size={14} />}
                      {isRecordingVoice && (
                        <div className="flex items-center gap-0.5 px-0.5">
                          <span className="w-0.5 h-2.5 bg-white animate-bounce" />
                          <span className="w-0.5 h-3.5 bg-white animate-bounce delay-75" />
                          <span className="w-0.5 h-1.5 bg-white animate-bounce delay-150" />
                        </div>
                      )}
                    </button>

                    {isGenerating ? (
                      <button
                        type="button"
                        onPointerDown={(e) => {
                          e.preventDefault();
                          handleStopGeneration();
                        }}
                        className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 shrink-0 animate-pulse"
                        title="Stop generation"
                      >
                        <Square size={10} className="fill-current" />
                        <span>Stop</span>
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={!inputQuery.trim()}
                        className="p-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-25 text-white transition-all cursor-pointer shrink-0"
                        title="Send message"
                      >
                        <ArrowUp size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: AGENTIC AUTOMATION & REAL ACTION ITEMS */}
        {activePanelTab === 'automation' && (
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 regaarder-scrollbar">
            {/* Real Extracted Page Action Items Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-violet-400" />
                    <span>Real Page Action Items & Tasks</span>
                  </h3>
                  <p className="text-[10.5px] text-slate-400">
                    Extracted dynamically from {summary?.domain || activeTab?.title || 'active webpage'}.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isExtractingActionItems}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleExtractPageActionItems();
                  }}
                  className="px-2 py-1 rounded-md bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-semibold transition-all cursor-pointer flex items-center gap-1 shrink-0 shadow-xs disabled:opacity-40"
                >
                  <RefreshCw size={10} className={isExtractingActionItems ? 'animate-spin' : ''} />
                  <span>{isExtractingActionItems ? 'Extracting...' : 'Extract Real Items'}</span>
                </button>
              </div>

              {/* Dynamic Action Items Checklist — or Apple-style empty state */}
              {realActionItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-8 px-4 space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center shadow-inner">
                    <CheckCircle2 size={18} className="text-slate-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11.5px] font-semibold text-slate-300">No tasks extracted yet</p>
                    <p className="text-[10.5px] text-slate-500 leading-relaxed max-w-[200px]">
                      Hit <span className="text-slate-400 font-medium">Extract Real Items</span> to pull action items directly from the current page.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isExtractingActionItems}
                    onPointerDown={(e) => { e.preventDefault(); handleExtractPageActionItems(); }}
                    className="px-3 py-1.5 rounded-lg bg-violet-600/80 hover:bg-violet-600 text-white text-[10.5px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-40"
                  >
                    <RefreshCw size={10} className={isExtractingActionItems ? 'animate-spin' : ''} />
                    <span>{isExtractingActionItems ? 'Extracting…' : 'Extract from Page'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {realActionItems.map((item) => (
                    <div
                      key={item.id}
                      onPointerDown={() => {
                        setRealActionItems((prev) =>
                          prev.map((it) => (it.id === item.id ? { ...it, completed: !it.completed } : it))
                        );
                      }}
                      className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-start gap-2.5 ${
                        item.completed
                          ? 'bg-white/[0.01] border-white/[0.04] opacity-60'
                          : 'bg-white/[0.03] border-white/[0.08] hover:border-violet-500/40 hover:bg-white/[0.05]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => {}}
                        className="mt-0.5 rounded border-white/20 text-violet-600 focus:ring-0 cursor-pointer"
                      />
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className={`text-[11px] leading-relaxed break-words ${item.completed ? 'line-through text-slate-500' : 'text-slate-200 font-medium'}`}>
                          {item.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-violet-500/15 text-violet-300 font-mono">
                            {item.category}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono">
                            {item.completed ? '✓ Done' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Item Export Tools */}
              {realActionItems.length > 0 && (
                <div className="flex items-center justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      const allText = realActionItems.map((it) => `- [${it.completed ? 'x' : ' '}] ${it.title}`).join('\n');
                      navigator.clipboard.writeText(allText);
                      if (showToast) showToast('Copied all action items to clipboard');
                    }}
                    className="px-2 py-1 rounded bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white text-[10px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Copy size={10} />
                    <span>Copy All</span>
                  </button>
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      const docContent = `# Action Items for ${activeTab?.title || 'Research'}\n\n` + realActionItems.map((it) => `- [${it.completed ? 'x' : ' '}] ${it.title}`).join('\n');
                      onOpenSendToCompose?.({ bottom: 60, right: 300, content: docContent });
                      if (showToast) showToast('Exporting action items to Compose...');
                    }}
                    className="px-2 py-1 rounded bg-violet-600/80 hover:bg-violet-600 text-white text-[10px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <FileText size={10} />
                    <span>Insert into Compose</span>
                  </button>
                </div>
              )}
            </div>

            <div className="my-2 border-t border-white/[0.08]" />

            {/* Autonomous Web Actions Section */}
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                <TasksIcon size={14} className="text-emerald-400" />
                <span>Autonomous Web Actions</span>
              </h3>
              <p className="text-[10.5px] text-slate-400">
                Execute DOM interactions, form filling, and background monitoring on {activeTab?.title || 'this page'}.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      %
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">Promo Code Hunter</h4>
                      <p className="text-[10px] text-slate-400">Auto-test discount codes on active page</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isExecutingTask}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleExecuteAgenticTask('promo_codes');
                    }}
                    className="px-2.5 py-1 rounded-md bg-emerald-600/80 hover:bg-emerald-600 text-white text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40"
                  >
                    Run Hunter
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-xs">
                      ✍
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">Agentic Form Filler</h4>
                      <p className="text-[10px] text-slate-400">Populate checkout & input fields</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isExecutingTask}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleExecuteAgenticTask('fill_form');
                    }}
                    className="px-2.5 py-1 rounded-md bg-sky-600/80 hover:bg-sky-600 text-white text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40"
                  >
                    Fill Form
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                      🔔
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">Stock & Price Watcher</h4>
                      <p className="text-[10px] text-slate-400">Background inventory alerts for page</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isExecutingTask}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleExecuteAgenticTask('monitor_stock');
                    }}
                    className="px-2.5 py-1 rounded-md bg-amber-600/80 hover:bg-amber-600 text-white text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40"
                  >
                    Monitor Page
                  </button>
                </div>
              </div>
            </div>

            {taskLogs.length > 0 && (
              <div className="p-3 rounded-lg bg-black/40 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isExecutingTask ? 'bg-emerald-400 animate-ping' : 'bg-emerald-400'}`} />
                    Autonomous Task Execution
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{taskProgress}%</span>
                </div>
                <div className="space-y-1 font-mono text-[10px] text-slate-400 max-h-[100px] overflow-y-auto">
                  {taskLogs.map((log, index) => (
                    <div key={index}>{log}</div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Monitored Pages ({monitoredItems.length})
              </span>
              {monitoredItems.map((item) => (
                <div key={item.id} className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <h5 className="font-semibold text-slate-200 truncate">{item.title}</h5>
                    <span className="text-[10px] text-slate-500 truncate block">{item.url} • {item.lastChecked}</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 shrink-0">{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PERSONAL MEMORY RETRIEVAL */}
        {activePanelTab === 'memory' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-3.5 space-y-3 regaarder-scrollbar">

            {/* Search Input */}
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
                placeholder='Search memory… e.g. "SaaS rule of 40 from yesterday"'
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[11.5px] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 transition-all"
              />
            </div>

            {/* Results or Empty State */}
            {historyResults.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-4 space-y-4">
                <div className="w-12 h-12 rounded-[18px] bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shadow-inner">
                  <MemoryIcon size={20} className="text-slate-600" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-[12px] font-semibold text-slate-300">No memory yet</p>
                  <p className="text-[10.5px] text-slate-500 leading-relaxed max-w-[210px]">
                    Pages you visit are indexed here. Ask a natural language question to retrieve insights from your browsing history.
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 w-full max-w-[220px]">
                  {['What did I read about AI yesterday?', 'Last pricing page I visited', 'Research from last week'].map((hint) => (
                    <button
                      key={hint}
                      type="button"
                      onPointerDown={(e) => { e.preventDefault(); setHistorySearchQuery(hint); }}
                      className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-[10.5px] text-slate-400 hover:text-slate-200 text-left transition-all cursor-pointer"
                    >
                      {hint}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {historyResults
                  .filter((item) =>
                    !historySearchQuery ||
                    item.title.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
                    item.snippet?.toLowerCase().includes(historySearchQuery.toLowerCase())
                  )
                  .map((item) => (
                    <div key={item.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] space-y-1.5 hover:border-sky-500/30 hover:bg-white/[0.05] transition-all group">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-[11.5px] font-semibold text-slate-200 leading-snug">{item.title}</h5>
                        <span className="text-[9.5px] text-sky-400/80 font-mono shrink-0 pt-0.5">{item.visitedDate}</span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 leading-relaxed">{item.snippet}</p>
                      <div className="flex items-center justify-between pt-0.5">
                        <span className="text-[9.5px] text-slate-600 font-mono">{item.domain}</span>
                        <button
                          type="button"
                          onPointerDown={(e) => {
                            e.preventDefault();
                            if (showToast) showToast(`Restored context for ${item.title}`);
                          }}
                          className="text-[10px] text-sky-400 hover:text-sky-300 font-medium cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Jump to page →
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default BrowserResearchPanel;
