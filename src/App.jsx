import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { 
  Menu, Search, Plus, Sparkles, Bell, 
  ChevronLeft, ChevronRight, Cloud, Users, Home, Inbox, Star, 
  FileText, Trash, Settings, MoreHorizontal,
  Mic, ArrowUp, MessageSquare, CheckSquare, Calendar, 
  File, User, PenTool, AlignLeft, AlignCenter, AlignRight, 
  List, Bold, Italic, Underline, Type, X, ChevronDown,
  LayoutGrid, BookOpen, Scissors, Expand, Check,
  AlertTriangle, MonitorPlay, MessageCircle, FileQuestion,
  Send, ListTodo, ShieldAlert, ArrowRight, Loader2, Move, Upload, Database, KeyRound,
  Undo2, Redo2, Save, RefreshCcw, Trash2, ThumbsUp, ThumbsDown, MessageSquarePlus
} from 'lucide-react';

const DEMO_GEMINI_API_KEY = (import.meta.env.VITE_GEMINI_DEMO_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || '').trim();
const AI_NATIVE_PLACEHOLDER = 'Type, ask Compose AI, or speak to start';
const UNTITLED_COMPOSITION_LABEL = 'Untitled composition';

export default function App() {
  const defaultTitle = 'Product Launch Plan';
  const defaultSubtitle = 'A strategic plan to successfully launch Regaarder Compose and drive adoption, engagement, and growth.';
  const defaultInitiatives = [
    { id: 1, name: 'Beta Launch', owner: 'Alex R.', timeline: 'May 15 - May 30', status: 'In Progress' },
    { id: 2, name: 'Creator Outreach', owner: 'Maya K.', timeline: 'May 20 - Jun 10', status: 'Planned' },
    { id: 3, name: 'Product Hunt Launch', owner: 'Jordan T.', timeline: 'Jun 15', status: 'Planned' },
    { id: 4, name: 'Paid Campaigns', owner: 'Sam K.', timeline: 'Jun 20 - Jul 10', status: 'Planned' },
  ];
  const defaultWorkspaces = [
    { id: 1, name: 'Regaarder', letter: 'R', colorClass: 'bg-indigo-500', hasDocuments: false },
    { id: 2, name: 'Product', letter: 'P', colorClass: 'bg-orange-500', hasDocuments: true },
    { id: 3, name: 'Marketing', letter: 'M', colorClass: 'bg-emerald-500', hasDocuments: false },
    { id: 4, name: 'Finance', letter: 'F', colorClass: 'bg-blue-500', hasDocuments: false },
    { id: 5, name: 'Personal', letter: 'P', colorClass: 'bg-fuchsia-500', hasDocuments: false },
  ];

  // Sidebar states
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(256);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(340);
  const [activeRightTab, setActiveRightTab] = useState('chat'); // 'chat' | 'assistant' | 'tasks' | 'calendar' | 'memory'
  const [dragTarget, setDragTarget] = useState(null);
  const [promptOffset, setPromptOffset] = useState({ x: 0, y: -14 });
  const [isPromptExpanded, setIsPromptExpanded] = useState(true);
  const [promptWidth, setPromptWidth] = useState(620);
  const [isPromptMenuOpen, setIsPromptMenuOpen] = useState(false);
  const [isPromptAutoVisible, setIsPromptAutoVisible] = useState(false);
  const [hasVoiceInteraction, setHasVoiceInteraction] = useState(false);
  const [miniPromptOffset, setMiniPromptOffset] = useState({ x: 0, y: 0 });
  const [dictationOffset, setDictationOffset] = useState({ x: 0, y: 0 });
  
  // Interactive inputs
  const [chatInput, setChatInput] = useState('');
  const [floatingPrompt, setFloatingPrompt] = useState('');
  const [newTaskInput, setNewTaskInput] = useState('');
  const [newTaskOwner, setNewTaskOwner] = useState('user');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskText, setEditingTaskText] = useState('');
  const [chatAttachments, setChatAttachments] = useState([]);
  const [scheduleAttachments, setScheduleAttachments] = useState([]);
  const [voiceTarget, setVoiceTarget] = useState('compose');
  const [scheduleInput, setScheduleInput] = useState('');
  const [scheduleOutput, setScheduleOutput] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([
    { id: 1, title: 'Beta Launch Kickoff', slotLabel: 'May 15 • 10:00 AM' },
    { id: 2, title: 'Product Hunt Checklist Finalization', slotLabel: 'June 14 • 2:30 PM' },
  ]);
  const [calendarMonth, setCalendarMonth] = useState(4); // 0=Jan, 4=May
  const [calendarYear, setCalendarYear] = useState(2026);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date(2026, 4, 15));
  
  // AI State machine
  const [isComposing, setIsComposing] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [workspaces, setWorkspaces] = useState(defaultWorkspaces);
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  const [workspaceModalMode, setWorkspaceModalMode] = useState('create');
  const [workspaceNameInput, setWorkspaceNameInput] = useState('');
  const [editingWorkspaceId, setEditingWorkspaceId] = useState(null);
  const [openWorkspaceMenuId, setOpenWorkspaceMenuId] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareTargetDocId, setShareTargetDocId] = useState(null);
  const [shareTargetDocTitle, setShareTargetDocTitle] = useState('');
  const [shareDestination, setShareDestination] = useState('friends');
  const [shareFormat, setShareFormat] = useState('Compose (.cmp)');
  const [shareAccess, setShareAccess] = useState('Viewer');
  const [shareLink, setShareLink] = useState('');
  const [composeOutputFormat, setComposeOutputFormat] = useState('Auto (Compose decides)');
  const [customComposeFormat, setCustomComposeFormat] = useState('');
  const [promptTone, setPromptTone] = useState('normal');
  const [promptLengthMode, setPromptLengthMode] = useState('words');
  const [promptLengthValue, setPromptLengthValue] = useState(220);
  const [promptTuneMenuOpen, setPromptTuneMenuOpen] = useState(false);
  const [promptFormatMenuOpen, setPromptFormatMenuOpen] = useState(false);
  const [promptLibraryOpen, setPromptLibraryOpen] = useState(false);
  const [promptHistory, setPromptHistory] = useState([]);
  const [promptHistorySearch, setPromptHistorySearch] = useState('');
  const [promptHistoryFilter, setPromptHistoryFilter] = useState('all');
  const [promptHistoryFilterMenuOpen, setPromptHistoryFilterMenuOpen] = useState(false);
  const [editingPromptId, setEditingPromptId] = useState(null);
  const [editingPromptValue, setEditingPromptValue] = useState('');
  const [assistantQuickPrompt, setAssistantQuickPrompt] = useState('');
  const [isPromptMinimized, setIsPromptMinimized] = useState(false);
  const [selectedEditorText, setSelectedEditorText] = useState('');
  const [promptAttachments, setPromptAttachments] = useState([]);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [lastComposeRun, setLastComposeRun] = useState(null);
  const [liveSpeechInterimText, setLiveSpeechInterimText] = useState('');
  const [apiMode, setApiMode] = useState('demo');
  const [userApiKey, setUserApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [memoryCaptureEnabled, setMemoryCaptureEnabled] = useState(true);
  const [memoryRetentionDays, setMemoryRetentionDays] = useState(90);
  const [memoryEntries, setMemoryEntries] = useState([]);
  const [memoryFilter, setMemoryFilter] = useState('all');
  const [memorySearch, setMemorySearch] = useState('');
  const [lastAiError, setLastAiError] = useState('');
  const [chatFeedbackDrafts, setChatFeedbackDrafts] = useState({});

  // Auto-scroll ref for chat
  const chatEndRef = useRef(null);
  const documentCardRef = useRef(null);
  const blankBodyRef = useRef(null);
  const titleEditableRef = useRef(null);
  const subtitleEditableRef = useRef(null);
  const formattingMenuRef = useRef(null);
  const savedSelectionRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const promptAudioInputRef = useRef(null);
  const floatingPromptRef = useRef(null);
  const chatInputRef = useRef(null);
  const scheduleInputRef = useRef(null);
  const promptMenuRef = useRef(null);
  const promptRootRef = useRef(null);
  const promptTuneRef = useRef(null);
  const promptFormatRef = useRef(null);
  const promptLibraryRef = useRef(null);
  const promptHistoryFilterRef = useRef(null);
  const promptFileInputRef = useRef(null);
  const chatFileInputRef = useRef(null);
  const scheduleFileInputRef = useRef(null);
  const voiceTargetRef = useRef('compose');
  const isMicMutedRef = useRef(false);
  const isVoiceActiveRef = useRef(false);
  const insertTranscriptIntoDocumentRef = useRef(null);
  const pendingInterimTranscriptRef = useRef('');
  const interimCommitTimerRef = useRef(null);
  const selectedEditorTextRef = useRef('');
  const pointerDownInPromptRef = useRef(false);
  const calendarMenuRef = useRef(null);
  const formattingDropdownCloseTimerRef = useRef(null);
  const textStyleMenuCloseTimerRef = useRef(null);
  const modelCandidatesCacheRef = useRef(null);
  const modelCandidatesCacheKeyRef = useRef('');
  const dragStateRef = useRef({
    startX: 0,
    startY: 0,
    leftWidth: 256,
    rightWidth: 340,
    promptX: 0,
    promptY: -14,
    miniPromptX: 0,
    miniPromptY: 0,
    dictationX: 0,
    dictationY: 0,
  });
  const wholeDocSelectionRef = useRef(false);
  const micPermissionGrantedRef = useRef(false);
  const mockDictationTimeoutRef = useRef(null);
  const mockIntervalRef = useRef(null);
  const interimTranscriptRef = useRef('');
  const lastDocumentTranscriptRef = useRef({ text: '', source: '', at: 0 });
  const toastTimerRef = useRef(null);
  const promptRevealTimerRef = useRef(null);

  // Stateful document content
  const [docTitle, setDocTitle] = useState(defaultTitle);
  const [docSubtitle, setDocSubtitle] = useState(defaultSubtitle);
  const [initiatives, setInitiatives] = useState(defaultInitiatives);
  const [isBlankDocument, setIsBlankDocument] = useState(false);
  const [documents, setDocuments] = useState([
    {
      id: Date.now(),
      title: defaultTitle,
      subtitle: defaultSubtitle,
      initiatives: defaultInitiatives,
      appendedSections: [],
      isBlank: false,
      bodyHtml: '',
    },
  ]);
  const [activeDocId, setActiveDocId] = useState(null);
  const [docBodyHtml, setDocBodyHtml] = useState('');
  const [closeConfirmDocId, setCloseConfirmDocId] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [headingSearch, setHeadingSearch] = useState('');
  const [fontSearch, setFontSearch] = useState('');
  const [sizeSearch, setSizeSearch] = useState('');
  const [openDocMenuId, setOpenDocMenuId] = useState(null);
  const [renamingDocId, setRenamingDocId] = useState(null);
  const [renameDocValue, setRenameDocValue] = useState('');
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('Auto detect');
  const [isUnsavedDraftVisible, setIsUnsavedDraftVisible] = useState(true);
  const [isEditingUnsavedDraftName, setIsEditingUnsavedDraftName] = useState(false);
  const [unsavedDraftNameInput, setUnsavedDraftNameInput] = useState('');
  const [activePrimaryNav, setActivePrimaryNav] = useState('drafts');
  const [documentStats, setDocumentStats] = useState({ words: 0, characters: 0 });
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [textStyleMenuOpen, setTextStyleMenuOpen] = useState(false);
  const [activeDocView, setActiveDocView] = useState('document');
  const [isFormattingDropdownHovered, setIsFormattingDropdownHovered] = useState(false);
  const [isTextStyleMenuHovered, setIsTextStyleMenuHovered] = useState(false);

  const [editorHeading, setEditorHeading] = useState('Heading 1');
  const [editorFont, setEditorFont] = useState('Inter');
  const [editorSize, setEditorSize] = useState(32);
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isItalicActive, setIsItalicActive] = useState(false);
  const [isUnderlineActive, setIsUnderlineActive] = useState(false);
  const [isStrikeActive, setIsStrikeActive] = useState(false);
  const [alignMode, setAlignMode] = useState('left');
  const [isListActive, setIsListActive] = useState(false);
  const [showPageNumbers, setShowPageNumbers] = useState(true);
  const [showPageNumberOnFirstPage, setShowPageNumberOnFirstPage] = useState(true);
  const [pageNumberPosition, setPageNumberPosition] = useState('center');

  const headingOptions = ['Heading 1', 'Heading 2', 'Heading 3', 'Paragraph'];
  const headingMeta = {
    'Heading 1': { tag: 'H1', size: 42, previewClass: 'text-base font-bold' },
    'Heading 2': { tag: 'H2', size: 34, previewClass: 'text-sm font-semibold' },
    'Heading 3': { tag: 'H3', size: 26, previewClass: 'text-xs font-semibold' },
    Paragraph: { tag: 'P', size: 16, previewClass: 'text-xs font-normal' },
  };
  const fontOptions = ['Inter', 'Georgia', 'Verdana', 'Courier New', 'Times New Roman', 'Trebuchet MS'];
  const sizeOptions = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64];
  const composeFormatOptions = ['Auto (Compose decides)', 'Timeline', 'Checklist', 'Risk Analysis', 'Article', 'Presentation Draft', 'Proposal', 'Plain Text', 'Custom...'];
  const promptToneOptions = [
    { key: 'formal', label: 'Formal' },
    { key: 'normal', label: 'Normal' },
    { key: 'geeky', label: 'Geeky' },
    { key: 'naive', label: 'Naive' },
    { key: 'concise', label: 'Concise' },
  ];

  const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const getPlainText = (value) => String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const detectBrowserLocale = () => {
    if (typeof navigator === 'undefined') {
      return 'en-US';
    }
    const preferred = Array.isArray(navigator.languages) && navigator.languages.length
      ? navigator.languages[0]
      : navigator.language;
    return String(preferred || 'en-US');
  };

  const resolveSpeechLocale = (languageLabel = currentLanguage) => {
    const map = {
      'English (US)': 'en-US',
      'English (UK)': 'en-GB',
      Spanish: 'es-ES',
      French: 'fr-FR',
      German: 'de-DE',
      Chinese: 'zh-CN',
    };
    if (languageLabel === 'Auto detect') {
      return detectBrowserLocale();
    }
    return map[languageLabel] || detectBrowserLocale();
  };

  const getDisplayLanguageLabel = () => {
    if (currentLanguage !== 'Auto detect') {
      return currentLanguage;
    }
    const locale = resolveSpeechLocale('Auto detect');
    return `Auto detect (${locale})`;
  };

  const computeDocumentStats = useCallback(() => {
    const rawText = String(documentCardRef.current?.innerText || '')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const words = rawText ? rawText.split(' ').filter(Boolean).length : 0;
    const characters = rawText.length;
    setDocumentStats({ words, characters });
  }, []);

  // Dynamically appended sections from the AI Chat
  const [appendedSections, setAppendedSections] = useState([]);
  const historyMuteRef = useRef(false);
  const historyPastRef = useRef([]);
  const historyFutureRef = useRef([]);
  const lastSnapshotHashRef = useRef('');

  useEffect(() => {
    voiceTargetRef.current = voiceTarget;
  }, [voiceTarget]);

  useEffect(() => {
    isMicMutedRef.current = isMicMuted;
  }, [isMicMuted]);

  useEffect(() => {
    isVoiceActiveRef.current = isVoiceActive;
  }, [isVoiceActive]);

  useEffect(() => {
    if (hasVoiceInteraction) {
      setIsPromptAutoVisible(true);
      if (promptRevealTimerRef.current) {
        clearTimeout(promptRevealTimerRef.current);
        promptRevealTimerRef.current = null;
      }
      return;
    }

    if (promptRevealTimerRef.current) {
      clearTimeout(promptRevealTimerRef.current);
    }
    promptRevealTimerRef.current = setTimeout(() => {
      setIsPromptAutoVisible(true);
      promptRevealTimerRef.current = null;
    }, 7000);

    return () => {
      if (promptRevealTimerRef.current) {
        clearTimeout(promptRevealTimerRef.current);
        promptRevealTimerRef.current = null;
      }
    };
  }, [hasVoiceInteraction]);

  useEffect(() => {
    if (!activeDocId && documents.length) {
      setActiveDocId(documents[0].id);
    }
  }, [documents, activeDocId]);

  useEffect(() => {
    try {
      const storedApiMode = localStorage.getItem('rc.apiMode');
      const storedApiKey = localStorage.getItem('rc.userApiKey');
      const storedCapture = localStorage.getItem('rc.memoryCapture');
      const storedRetention = localStorage.getItem('rc.memoryRetentionDays');
      const storedEntries = localStorage.getItem('rc.memoryEntries');
      const storedPromptHistory = localStorage.getItem('rc.promptHistory');
      const storedPromptTone = localStorage.getItem('rc.promptTone');
      const storedPromptLengthMode = localStorage.getItem('rc.promptLengthMode');
      const storedPromptLengthValue = localStorage.getItem('rc.promptLengthValue');
      const storedEditorPrefs = localStorage.getItem('rc.editorPrefs');

      if (storedApiMode === 'demo' || storedApiMode === 'byok') {
        setApiMode(storedApiMode);
      }
      if (storedApiKey) {
        setUserApiKey(storedApiKey);
      }
      if (storedCapture === 'true' || storedCapture === 'false') {
        setMemoryCaptureEnabled(storedCapture === 'true');
      }
      if (storedRetention) {
        const parsedRetention = Number(storedRetention);
        if (!Number.isNaN(parsedRetention) && parsedRetention >= 1 && parsedRetention <= 3650) {
          setMemoryRetentionDays(parsedRetention);
        }
      }
      if (storedEntries) {
        const parsedEntries = JSON.parse(storedEntries);
        if (Array.isArray(parsedEntries)) {
          setMemoryEntries(parsedEntries.slice(0, 300));
        }
      }
      if (storedPromptHistory) {
        const parsedPromptHistory = JSON.parse(storedPromptHistory);
        if (Array.isArray(parsedPromptHistory)) {
          setPromptHistory(parsedPromptHistory.slice(0, 120));
        }
      }
      if (storedPromptTone && ['formal', 'normal', 'geeky', 'naive', 'concise'].includes(storedPromptTone)) {
        setPromptTone(storedPromptTone);
      }
      if (storedPromptLengthMode && ['words', 'characters'].includes(storedPromptLengthMode)) {
        setPromptLengthMode(storedPromptLengthMode);
      }
      if (storedPromptLengthValue) {
        const parsedLength = Number(storedPromptLengthValue);
        if (!Number.isNaN(parsedLength) && parsedLength >= 40 && parsedLength <= 3000) {
          setPromptLengthValue(parsedLength);
        }
      }
      if (storedEditorPrefs) {
        const parsedPrefs = JSON.parse(storedEditorPrefs);
        if (parsedPrefs && typeof parsedPrefs === 'object') {
          if (typeof parsedPrefs.editorHeading === 'string' && headingOptions.includes(parsedPrefs.editorHeading)) {
            setEditorHeading(parsedPrefs.editorHeading);
          }
          if (typeof parsedPrefs.editorFont === 'string' && parsedPrefs.editorFont.trim()) {
            setEditorFont(parsedPrefs.editorFont);
          }
          const parsedSize = Number(parsedPrefs.editorSize);
          if (!Number.isNaN(parsedSize) && parsedSize >= 10 && parsedSize <= 72) {
            setEditorSize(parsedSize);
          }
          if (typeof parsedPrefs.alignMode === 'string' && ['left', 'center', 'right'].includes(parsedPrefs.alignMode)) {
            setAlignMode(parsedPrefs.alignMode);
          }
          setIsBoldActive(Boolean(parsedPrefs.isBoldActive));
          setIsItalicActive(Boolean(parsedPrefs.isItalicActive));
          setIsUnderlineActive(Boolean(parsedPrefs.isUnderlineActive));
          setIsStrikeActive(Boolean(parsedPrefs.isStrikeActive));
          setIsListActive(Boolean(parsedPrefs.isListActive));
          setShowPageNumbers(parsedPrefs.showPageNumbers !== false);
          setShowPageNumberOnFirstPage(parsedPrefs.showPageNumberOnFirstPage !== false);
          if (typeof parsedPrefs.pageNumberPosition === 'string' && ['left', 'center', 'right'].includes(parsedPrefs.pageNumberPosition)) {
            setPageNumberPosition(parsedPrefs.pageNumberPosition);
          }
          if (typeof parsedPrefs.currentLanguage === 'string' && parsedPrefs.currentLanguage.trim()) {
            setCurrentLanguage(parsedPrefs.currentLanguage);
          }
          const parsedZoom = Number(parsedPrefs.zoomLevel);
          if (!Number.isNaN(parsedZoom) && parsedZoom >= 50 && parsedZoom <= 200) {
            setZoomLevel(parsedZoom);
          }
        }
      }
    } catch (_error) {
      // noop
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('rc.apiMode', apiMode);
  }, [apiMode]);

  useEffect(() => {
    localStorage.setItem('rc.userApiKey', userApiKey);
  }, [userApiKey]);

  useEffect(() => {
    localStorage.setItem('rc.memoryCapture', String(memoryCaptureEnabled));
  }, [memoryCaptureEnabled]);

  useEffect(() => {
    localStorage.setItem('rc.memoryRetentionDays', String(memoryRetentionDays));
  }, [memoryRetentionDays]);

  useEffect(() => {
    localStorage.setItem('rc.memoryEntries', JSON.stringify(memoryEntries.slice(0, 300)));
  }, [memoryEntries]);

  useEffect(() => {
    localStorage.setItem('rc.promptHistory', JSON.stringify(promptHistory.slice(0, 120)));
  }, [promptHistory]);

  useEffect(() => {
    localStorage.setItem('rc.promptTone', promptTone);
  }, [promptTone]);

  useEffect(() => {
    localStorage.setItem('rc.promptLengthMode', promptLengthMode);
  }, [promptLengthMode]);

  useEffect(() => {
    localStorage.setItem('rc.promptLengthValue', String(promptLengthValue));
  }, [promptLengthValue]);

  useEffect(() => {
    localStorage.setItem('rc.editorPrefs', JSON.stringify({
      editorHeading,
      editorFont,
      editorSize,
      alignMode,
      isBoldActive,
      isItalicActive,
      isUnderlineActive,
      isStrikeActive,
      isListActive,
      showPageNumbers,
      showPageNumberOnFirstPage,
      pageNumberPosition,
      currentLanguage,
      zoomLevel,
    }));
  }, [
    editorHeading,
    editorFont,
    editorSize,
    alignMode,
    isBoldActive,
    isItalicActive,
    isUnderlineActive,
    isStrikeActive,
    isListActive,
    showPageNumbers,
    showPageNumberOnFirstPage,
    pageNumberPosition,
    currentLanguage,
    zoomLevel,
  ]);

  const buildSnapshot = () => ({
    docTitle,
    docSubtitle,
    initiatives,
    appendedSections,
    docBodyHtml,
    isBlankDocument,
  });

  const applySnapshot = (snapshot) => {
    if (!snapshot) {
      return;
    }

    historyMuteRef.current = true;
    setDocTitle(snapshot.docTitle || '');
    setDocSubtitle(snapshot.docSubtitle || '');
    setInitiatives(Array.isArray(snapshot.initiatives) ? snapshot.initiatives : []);
    setAppendedSections(Array.isArray(snapshot.appendedSections) ? snapshot.appendedSections : []);
    setDocBodyHtml(snapshot.docBodyHtml || '');
    setIsBlankDocument(Boolean(snapshot.isBlankDocument));

    setTimeout(() => {
      historyMuteRef.current = false;
    }, 0);
  };

  useEffect(() => {
    if (historyMuteRef.current) {
      return;
    }

    const snapshot = buildSnapshot();
    const nextHash = JSON.stringify(snapshot);
    if (nextHash === lastSnapshotHashRef.current) {
      return;
    }

    lastSnapshotHashRef.current = nextHash;
    historyPastRef.current = [...historyPastRef.current.slice(-79), snapshot];
    historyFutureRef.current = [];
  }, [docTitle, docSubtitle, initiatives, appendedSections, docBodyHtml, isBlankDocument]);

  const saveDocumentLocally = () => {
    if (!activeDocId) {
      return;
    }

    const payload = getDocumentPayload(activeDocId);
    localStorage.setItem(`rc.savedDoc.${activeDocId}`, JSON.stringify({
      ...payload,
      savedAt: Date.now(),
    }));
    trackMemoryAction('document', 'Saved document locally', {
      documentId: String(activeDocId),
    });
    showToast('Document saved locally');
  };

  const undoDocumentChange = () => {
    if (historyPastRef.current.length < 2) {
      showToast('Nothing to undo');
      return;
    }

    const current = historyPastRef.current[historyPastRef.current.length - 1];
    const previous = historyPastRef.current[historyPastRef.current.length - 2];
    historyPastRef.current = historyPastRef.current.slice(0, -1);
    historyFutureRef.current = [current, ...historyFutureRef.current].slice(0, 80);
    applySnapshot(previous);
    trackMemoryAction('document', 'Undo document change');
    showToast('Undid last change');
  };

  const redoDocumentChange = () => {
    if (!historyFutureRef.current.length) {
      showToast('Nothing to redo');
      return;
    }

    const next = historyFutureRef.current[0];
    historyFutureRef.current = historyFutureRef.current.slice(1);
    historyPastRef.current = [...historyPastRef.current, next].slice(-80);
    applySnapshot(next);
    trackMemoryAction('document', 'Redo document change');
    showToast('Redid change');
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      const activeElement = document.activeElement;
      const insideEditor = Boolean(activeElement && documentCardRef.current?.contains(activeElement));

      if (!(event.ctrlKey || event.metaKey) && wholeDocSelectionRef.current && insideEditor && (event.key === 'Backspace' || event.key === 'Delete')) {
        event.preventDefault();
        clearEntireCompositionText();
        wholeDocSelectionRef.current = false;
        return;
      }

      if (!(event.ctrlKey || event.metaKey)) {
        return;
      }

      const key = event.key.toLowerCase();
      if (key === 's') {
        event.preventDefault();
        saveDocumentLocally();
        return;
      }

      if (key === 'a') {
        if (insideEditor) {
          event.preventDefault();
          selectEntireComposition();
        }
        return;
      }

      if (key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undoDocumentChange();
        return;
      }

      if (key === 'y' || (key === 'z' && event.shiftKey)) {
        event.preventDefault();
        redoDocumentChange();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeDocId, docTitle, docSubtitle, initiatives, appendedSections, docBodyHtml, isBlankDocument]);

  useEffect(() => {
    const handlePaste = (event) => {
      if (!wholeDocSelectionRef.current) {
        return;
      }

      const target = event.target;
      if (!documentCardRef.current || !documentCardRef.current.contains(target)) {
        return;
      }

      event.preventDefault();
      const pasted = event.clipboardData?.getData('text/plain') || '';
      replaceEntireCompositionText(pasted);
      wholeDocSelectionRef.current = false;
    };

    window.addEventListener('paste', handlePaste, true);
    return () => window.removeEventListener('paste', handlePaste, true);
  }, []);

  useEffect(() => {
    if (!openDropdown) {
      if (formattingDropdownCloseTimerRef.current) {
        clearTimeout(formattingDropdownCloseTimerRef.current);
      }
      return;
    }

    if (isFormattingDropdownHovered) {
      if (formattingDropdownCloseTimerRef.current) {
        clearTimeout(formattingDropdownCloseTimerRef.current);
      }
      return;
    }

    formattingDropdownCloseTimerRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 2000);

    return () => {
      if (formattingDropdownCloseTimerRef.current) {
        clearTimeout(formattingDropdownCloseTimerRef.current);
      }
    };
  }, [openDropdown, isFormattingDropdownHovered]);

  useEffect(() => {
    if (!textStyleMenuOpen) {
      if (textStyleMenuCloseTimerRef.current) {
        clearTimeout(textStyleMenuCloseTimerRef.current);
      }
      return;
    }

    if (isTextStyleMenuHovered) {
      if (textStyleMenuCloseTimerRef.current) {
        clearTimeout(textStyleMenuCloseTimerRef.current);
      }
      return;
    }

    textStyleMenuCloseTimerRef.current = setTimeout(() => {
      setTextStyleMenuOpen(false);
    }, 2000);

    return () => {
      if (textStyleMenuCloseTimerRef.current) {
        clearTimeout(textStyleMenuCloseTimerRef.current);
      }
    };
  }, [textStyleMenuOpen, isTextStyleMenuHovered]);

  useEffect(() => {
    const now = Date.now();
    const maxAge = memoryRetentionDays * 24 * 60 * 60 * 1000;
    setMemoryEntries((prev) => prev.filter((entry) => now - entry.timestamp <= maxAge));
  }, [memoryRetentionDays]);

  useEffect(() => {
    if (!activeDocId) {
      return;
    }

    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === activeDocId
          ? {
              ...doc,
              title: docTitle,
              subtitle: docSubtitle,
              initiatives,
              appendedSections,
              isBlank: isBlankDocument,
              bodyHtml: docBodyHtml,
            }
          : doc,
      ),
    );
  }, [activeDocId, appendedSections, docSubtitle, docTitle, initiatives, isBlankDocument, docBodyHtml]);

  useEffect(() => {
    if (!documentCardRef.current || typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = Math.max(320, Math.floor(entry.contentRect.width * 0.9));
        setPromptWidth(width);
      }
    });

    observer.observe(documentCardRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    computeDocumentStats();
    if (!documentCardRef.current || typeof MutationObserver === 'undefined') {
      return;
    }

    const observer = new MutationObserver(() => {
      computeDocumentStats();
    });

    observer.observe(documentCardRef.current, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [
    computeDocumentStats,
    activeDocId,
    isBlankDocument,
    docBodyHtml,
    docTitle,
    docSubtitle,
    initiatives,
    appendedSections,
  ]);

  useEffect(() => {
    if (!shareTargetDocId) {
      return;
    }

    const base = `${window.location.origin}${window.location.pathname}`;
    setShareLink(`${base}?doc=${shareTargetDocId}&access=${shareAccess.toLowerCase()}`);
  }, [shareAccess, shareTargetDocId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutsideFormatting = formattingMenuRef.current && !formattingMenuRef.current.contains(event.target);
      const clickedOutsideCalendar = calendarMenuRef.current && !calendarMenuRef.current.contains(event.target);

      if (clickedOutsideFormatting && clickedOutsideCalendar) {
        setOpenDropdown(null);
        setTextStyleMenuOpen(false);
      }
      if (!event.target.closest('[data-doc-menu-root]')) {
        setOpenDocMenuId(null);
      }
      if (promptMenuRef.current && !promptMenuRef.current.contains(event.target)) {
        setIsPromptMenuOpen(false);
      }
      if (promptTuneRef.current && !promptTuneRef.current.contains(event.target)) {
        setPromptTuneMenuOpen(false);
      }
      if (promptFormatRef.current && !promptFormatRef.current.contains(event.target)) {
        setPromptFormatMenuOpen(false);
      }
      if (promptLibraryRef.current && !promptLibraryRef.current.contains(event.target)) {
        setPromptLibraryOpen(false);
      }
      if (promptHistoryFilterRef.current && !promptHistoryFilterRef.current.contains(event.target)) {
        setPromptHistoryFilterMenuOpen(false);
      }
      if (!event.target.closest('[data-workspace-menu-root]')) {
        setOpenWorkspaceMenuId(null);
      }
      if (!event.target.closest('[data-language-menu-root]')) {
        setLanguageMenuOpen(false);
      }
    };

    window.addEventListener('pointerdown', handleClickOutside);
    return () => window.removeEventListener('pointerdown', handleClickOutside);
  }, []);

  const isRangeInsideEditor = (range) => {
    if (!range || !documentCardRef.current) {
      return false;
    }

    const ancestor = range.commonAncestorContainer;
    const targetNode = ancestor.nodeType === Node.TEXT_NODE ? ancestor.parentNode : ancestor;
    return !!targetNode && documentCardRef.current.contains(targetNode);
  };

  const getEditorSelectionRange = () => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
      return null;
    }

    const range = selection.getRangeAt(0);
    return isRangeInsideEditor(range) ? range : null;
  };

  const restoreSavedSelection = () => {
    if (!savedSelectionRef.current) {
      return false;
    }

    const selection = window.getSelection();
    if (!selection) {
      return false;
    }

    selection.removeAllRanges();
    selection.addRange(savedSelectionRef.current);
    return true;
  };

  const injectIntoSavedSelection = (text) => {
    const nextText = String(text || '').trim();
    if (!nextText) {
      return false;
    }

    const restored = restoreSavedSelection();
    if (!restored) {
      return false;
    }

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
      return false;
    }

    const range = selection.getRangeAt(0);
    if (!isRangeInsideEditor(range)) {
      return false;
    }

    range.deleteContents();
    range.insertNode(document.createTextNode(nextText));
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    return true;
  };

  const selectEntireComposition = () => {
    if (!documentCardRef.current) {
      return;
    }

    const selection = window.getSelection();
    if (!selection) {
      return;
    }

    const range = document.createRange();
    range.selectNodeContents(documentCardRef.current);
    selection.removeAllRanges();
    selection.addRange(range);
    savedSelectionRef.current = range.cloneRange();
    wholeDocSelectionRef.current = true;
  };

  const isWholeDocumentSelection = (range) => {
    if (!range || !documentCardRef.current) {
      return false;
    }
    const selected = range.toString().replace(/\s+/g, ' ').trim();
    const allText = (documentCardRef.current.textContent || '').replace(/\s+/g, ' ').trim();
    if (!selected || !allText) {
      return false;
    }
    return selected.length >= Math.max(1, Math.floor(allText.length * 0.85));
  };

  const clearEntireCompositionText = () => {
    setDocTitle('');
    setDocSubtitle('');
    setDocBodyHtml('');
    setIsBlankDocument(true);
    setAppendedSections([]);
    setLastComposeRun(null);
    setTimeout(() => {
      blankBodyRef.current?.focus();
    }, 0);
  };

  const replaceEntireCompositionText = (value) => {
    const raw = String(value || '').replace(/\r/g, '').trim();
    setDocTitle('');
    setDocSubtitle('');
    setIsBlankDocument(true);
    setAppendedSections([]);
    if (!raw) {
      setDocBodyHtml('');
      return;
    }
    const html = raw
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .filter(Boolean)
      .map((block) => `<p>${escapeHtml(block).replace(/\n/g, '<br/>')}</p>`)
      .join('');
    setDocBodyHtml(html);
    setTimeout(() => {
      blankBodyRef.current?.focus();
    }, 0);
  };

  const normalizeEditableDirection = (element) => {
    if (!element) {
      return;
    }

    element.setAttribute('dir', 'ltr');
    element.style.direction = 'ltr';
    element.style.unicodeBidi = 'plaintext';
  };

  const clearPlaceholderOnFocus = (event, placeholder) => {
    const currentValue = event.currentTarget.textContent?.trim() || '';
    if (currentValue === placeholder) {
      event.currentTarget.textContent = '';
    }
  };

  const handleEditablePaste = (event, placeholder, afterPaste) => {
    const target = event.currentTarget;
    const plainText = event.clipboardData?.getData('text/plain') || '';
    const currentValue = target.textContent?.trim() || '';

    if (currentValue === placeholder || currentValue === AI_NATIVE_PLACEHOLDER) {
      target.textContent = '';
    }

    event.preventDefault();
    if (plainText) {
      document.execCommand('insertText', false, plainText);
    }
    normalizeEditableDirection(target);
    if (afterPaste) {
      afterPaste(target);
    }
  };

  const insertTranscriptIntoDocument = (spokenText, options = {}) => {
    const normalized = String(spokenText || '').trim();
    if (!normalized) {
      return;
    }
    const forceAppendToEnd = Boolean(options.forceAppendToEnd);

    const getFallbackDocumentTarget = () => {
      if (blankBodyRef.current) {
        return blankBodyRef.current;
      }

      if (!documentCardRef.current) {
        return null;
      }

      const editableNodes = Array.from(documentCardRef.current.querySelectorAll('[contenteditable="true"]'));
      if (!editableNodes.length) {
        return null;
      }

      const nonHeaderNode = editableNodes.find((node) => node !== titleEditableRef.current && node !== subtitleEditableRef.current);
      return nonHeaderNode || editableNodes[editableNodes.length - 1] || null;
    };

    const active = document.activeElement;
    const activeEditable = active?.isContentEditable && documentCardRef.current?.contains(active)
      ? active
      : null;

    let target = activeEditable;
    if (!target) {
      if (!docTitle.trim() || docTitle === AI_NATIVE_PLACEHOLDER) {
        target = titleEditableRef.current;
      } else if (!docSubtitle.trim() || docSubtitle === AI_NATIVE_PLACEHOLDER) {
        target = subtitleEditableRef.current;
      } else {
        target = getFallbackDocumentTarget();
      }
    }

    if (!target) {
      return;
    }

    target.focus();
    if ((target.textContent || '').trim() === AI_NATIVE_PLACEHOLDER) {
      target.textContent = '';
    }

    const selection = window.getSelection();
    let shouldResetToEnd = forceAppendToEnd;
    if (selection && selection.rangeCount) {
      if (!forceAppendToEnd) {
        const currentRange = selection.getRangeAt(0);
        const anchorNode = selection.anchorNode;
        const anchorElement = anchorNode?.nodeType === Node.TEXT_NODE ? anchorNode.parentNode : anchorNode;
        shouldResetToEnd = !anchorElement || !target.contains(anchorElement);
        if (!shouldResetToEnd && !isRangeInsideEditor(currentRange)) {
          shouldResetToEnd = true;
        }
      }
    } else if (!forceAppendToEnd) {
      shouldResetToEnd = true;
    }

    if (selection && shouldResetToEnd) {
      const endRange = document.createRange();
      endRange.selectNodeContents(target);
      endRange.collapse(false);
      selection.removeAllRanges();
      selection.addRange(endRange);
    }

    const insertedViaCommand = document.execCommand('insertText', false, `${normalized} `);
    if (!insertedViaCommand) {
      const fallbackSelection = window.getSelection();
      if (fallbackSelection && fallbackSelection.rangeCount) {
        const fallbackRange = fallbackSelection.getRangeAt(0);
        fallbackRange.deleteContents();
        fallbackRange.insertNode(document.createTextNode(`${normalized} `));
        fallbackRange.collapse(false);
        fallbackSelection.removeAllRanges();
        fallbackSelection.addRange(fallbackRange);
      }
    }

    const finalSelection = window.getSelection();
    if (finalSelection) {
      const endRange = document.createRange();
      endRange.selectNodeContents(target);
      endRange.collapse(false);
      finalSelection.removeAllRanges();
      finalSelection.addRange(endRange);
    }
    normalizeEditableDirection(target);

    if (target === titleEditableRef.current) {
      setDocTitle(target.textContent || '');
    } else if (target === subtitleEditableRef.current) {
      setDocSubtitle(target.textContent || '');
    } else if (target === blankBodyRef.current) {
      setIsBlankDocument(true);
      setDocBodyHtml(target.innerHTML);
    }
  };

  useEffect(() => {
    insertTranscriptIntoDocumentRef.current = insertTranscriptIntoDocument;
  }, [insertTranscriptIntoDocument]);

  const createAttachmentItems = (files, source = 'chat') => Array.from(files || []).map((file, index) => ({
    id: `${source}-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
    name: file.name || 'attachment',
    type: file.type || 'application/octet-stream',
    size: file.size || 0,
    file,
  }));

  const ingestScheduleAttachments = async (files) => {
    const list = Array.from(files || []);
    if (!list.length) {
      return;
    }

    const nextAttachments = createAttachmentItems(list, 'schedule');
    setScheduleAttachments((prev) => [...prev, ...nextAttachments].slice(0, 20));

    // Pull plain text from text-like files to help schedule cleanup.
    const textPayloads = await Promise.all(list.map(async (file) => {
      const isTextLike = (file.type || '').startsWith('text/') || /\.(txt|md|csv|json)$/i.test(file.name || '');
      if (!isTextLike) {
        return '';
      }
      try {
        const content = await file.text();
        return content.trim();
      } catch (_error) {
        return '';
      }
    }));

    const mergedText = textPayloads.filter(Boolean).join('\n');
    if (mergedText) {
      setScheduleInput((prev) => `${prev}${prev ? '\n' : ''}${mergedText}`.trim());
    }
  };

  const ingestChatAttachments = async (files) => {
    const list = Array.from(files || []);
    if (!list.length) {
      return;
    }

    const nextAttachments = createAttachmentItems(list, 'chat');
    setChatAttachments((prev) => [...prev, ...nextAttachments].slice(0, 20));
  };

  const handleSchedulePaste = async (event) => {
    const clipboardFiles = Array.from(event.clipboardData?.files || []);
    if (!clipboardFiles.length) {
      return;
    }

    event.preventDefault();
    await ingestScheduleAttachments(clipboardFiles);
    showToast('Attachment added to schedule input');
  };

  const handleChatPaste = async (event) => {
    const clipboardFiles = Array.from(event.clipboardData?.files || []);
    if (!clipboardFiles.length) {
      return;
    }

    event.preventDefault();
    await ingestChatAttachments(clipboardFiles);
    showToast('Attachment added to chat input');
  };

  const autoResizeTextarea = (element, maxHeight = 140) => {
    if (!element) {
      return;
    }

    element.style.height = '0px';
    const nextHeight = Math.min(element.scrollHeight, maxHeight);
    element.style.height = `${nextHeight}px`;
    element.style.overflowY = element.scrollHeight > maxHeight ? 'auto' : 'hidden';
  };

  useEffect(() => {
    autoResizeTextarea(chatInputRef.current, 120);
  }, [chatInput]);

  useEffect(() => {
    autoResizeTextarea(scheduleInputRef.current, 120);
  }, [scheduleInput]);

  useEffect(() => {
    if (isPromptExpanded) {
      autoResizeTextarea(floatingPromptRef.current, 160);
    }
  }, [floatingPrompt, isPromptExpanded]);

  useEffect(() => {
    const trackPointerOrigin = (event) => {
      pointerDownInPromptRef.current = Boolean(promptRootRef.current && promptRootRef.current.contains(event.target));
    };

    window.addEventListener('pointerdown', trackPointerOrigin, true);
    return () => window.removeEventListener('pointerdown', trackPointerOrigin, true);
  }, []);

  useEffect(() => {
    if (!selectedEditorText) {
      return;
    }
    setRightSidebarOpen(true);
    setActiveRightTab('assistant');
  }, [selectedEditorText]);

  useEffect(() => {
    const handleSelectionChange = () => {
      const range = getEditorSelectionRange();
      if (!range) {
        if (pointerDownInPromptRef.current) {
          return;
        }
        setSelectedEditorText('');
        selectedEditorTextRef.current = '';
        setIsBoldActive(false);
        setIsItalicActive(false);
        setIsUnderlineActive(false);
        setIsStrikeActive(false);
        setIsListActive(false);
        wholeDocSelectionRef.current = false;
        return;
      }

      savedSelectionRef.current = range.cloneRange();
      const selectedText = range.toString().trim();
      const next = truncateText(selectedText, 180);
      setSelectedEditorText(next);
      selectedEditorTextRef.current = selectedText;
      wholeDocSelectionRef.current = isWholeDocumentSelection(range);

      try {
        setIsBoldActive(Boolean(document.queryCommandState('bold')));
        setIsItalicActive(Boolean(document.queryCommandState('italic')));
        setIsUnderlineActive(Boolean(document.queryCommandState('underline')));
        setIsStrikeActive(Boolean(document.queryCommandState('strikeThrough')));
        setIsListActive(Boolean(document.queryCommandState('insertUnorderedList')));
      } catch (_error) {
        // noop
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  useEffect(() => {
    if (!isFocusMode) {
      return;
    }
    setLeftSidebarOpen(false);
    setRightSidebarOpen(false);
  }, [isFocusMode]);

  useEffect(() => {
    const RecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!RecognitionCtor) {
      setSpeechSupported(false);
      return;
    }

    setSpeechSupported(true);
    const recognition = new RecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = resolveSpeechLocale(currentLanguage);

    recognition.onresult = (event) => {
      if (isMicMutedRef.current) {
        return;
      }

      if (mockDictationTimeoutRef.current) {
        clearTimeout(mockDictationTimeoutRef.current);
        mockDictationTimeoutRef.current = null;
      }
      if (mockIntervalRef.current) {
        clearInterval(mockIntervalRef.current);
        mockIntervalRef.current = null;
      }

      const routeTranscriptToTarget = (text, source = 'final') => {
        const normalizedText = String(text || '').trim();
        if (!normalizedText) {
          return;
        }

        const activeVoiceTarget = voiceTargetRef.current;
        if (activeVoiceTarget === 'schedule') {
          setScheduleInput((prev) => `${prev}${prev ? ' ' : ''}${normalizedText}`);
        } else if (activeVoiceTarget === 'document') {
          const previous = lastDocumentTranscriptRef.current;
          let textToInsert = normalizedText;
          const shouldCompareWithInterim = previous.text
            && previous.source === 'interim'
            && source !== 'interim'
            && Date.now() - previous.at < 3500;

          if (shouldCompareWithInterim) {
            const previousLower = previous.text.toLowerCase();
            const normalizedLower = normalizedText.toLowerCase();
            if (normalizedLower === previousLower) {
              return;
            }
            if (normalizedLower.startsWith(previousLower)) {
              textToInsert = normalizedText.slice(previous.text.length).trim();
              if (!textToInsert) {
                return;
              }
            }
          }

          insertTranscriptIntoDocumentRef.current?.(textToInsert, { forceAppendToEnd: true });
          lastDocumentTranscriptRef.current = { text: normalizedText, source, at: Date.now() };
        } else {
          setFloatingPrompt((prev) => `${prev}${prev ? ' ' : ''}${normalizedText}`);
          requestAnimationFrame(() => {
            const promptEl = floatingPromptRef.current;
            if (promptEl && typeof promptEl.setSelectionRange === 'function') {
              const end = promptEl.value.length;
              promptEl.focus();
              promptEl.setSelectionRange(end, end);
            }
          });
        }
      };

      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0]?.transcript || '';
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript.trim()) {
        routeTranscriptToTarget(finalTranscript.trim(), 'final');
        interimTranscriptRef.current = '';
        pendingInterimTranscriptRef.current = '';
        if (interimCommitTimerRef.current) {
          clearTimeout(interimCommitTimerRef.current);
          interimCommitTimerRef.current = null;
        }
        setLiveSpeechInterimText('');
      } else {
        const normalizedInterim = interimTranscript.trim();
        const activeVoiceTarget = voiceTargetRef.current;
        interimTranscriptRef.current = normalizedInterim;
        setLiveSpeechInterimText(normalizedInterim);

        if (activeVoiceTarget === 'document' && normalizedInterim) {
          pendingInterimTranscriptRef.current = normalizedInterim;
          if (interimCommitTimerRef.current) {
            clearTimeout(interimCommitTimerRef.current);
          }
          interimCommitTimerRef.current = setTimeout(() => {
            const buffered = pendingInterimTranscriptRef.current.trim();
            if (buffered) {
              routeTranscriptToTarget(buffered, 'interim');
              pendingInterimTranscriptRef.current = '';
            }
            interimCommitTimerRef.current = null;
          }, 850);
        }
      }
    };

    recognition.onstart = () => {
      setIsVoiceActive(true);
    };

    recognition.onerror = (event) => {
      const errorCode = String(event?.error || 'unknown');
      console.warn('Speech recognition error:', errorCode);

      // Match attached behavior: do not hard-stop on recognizer errors.
      const recoverableErrors = ['not-allowed', 'service-not-allowed', 'audio-capture', 'aborted', 'network'];
      if (voiceTargetRef.current === 'document' && isVoiceActiveRef.current && recoverableErrors.includes(errorCode) && !mockIntervalRef.current) {
        showToast('Microphone stream interrupted. Switching to fallback dictation.');
        const phrases = [
          'Draft a launch plan for the new beta. ',
          'I need to make sure we cover the marketing assets, technical rollout, and timeline milestones. ',
          'Let us schedule a team sync for next week. ',
        ];
        const fullText = phrases.join('');
        let currentIndex = 0;
        try {
          recognition.stop();
        } catch (_error) {
          // noop
        }
        mockIntervalRef.current = setInterval(() => {
          if (!isVoiceActiveRef.current || isMicMutedRef.current) {
            clearInterval(mockIntervalRef.current);
            mockIntervalRef.current = null;
            return;
          }
          currentIndex += Math.floor(Math.random() * 3) + 2;
          if (currentIndex > fullText.length) {
            currentIndex = fullText.length;
          }
          const chunk = fullText.substring(0, currentIndex).trim();
          interimTranscriptRef.current = chunk;
          setLiveSpeechInterimText(chunk);

          if (currentIndex === fullText.length) {
            clearInterval(mockIntervalRef.current);
            mockIntervalRef.current = null;
            setTimeout(() => {
              if (isVoiceActiveRef.current && chunk) {
                insertTranscriptIntoDocumentRef.current?.(chunk, { forceAppendToEnd: true });
              }
              interimTranscriptRef.current = '';
              setLiveSpeechInterimText('');
              setIsVoiceActive(false);
            }, 1000);
          }
        }, 40);
      }
    };

    recognition.onend = () => {
      const buffered = pendingInterimTranscriptRef.current.trim();
      if (buffered) {
        if (voiceTargetRef.current === 'schedule') {
          setScheduleInput((prev) => `${prev}${prev ? ' ' : ''}${buffered}`);
        } else if (voiceTargetRef.current === 'document') {
          insertTranscriptIntoDocumentRef.current?.(buffered, { forceAppendToEnd: true });
          lastDocumentTranscriptRef.current = { text: buffered, source: 'onend', at: Date.now() };
        } else {
          setFloatingPrompt((prev) => `${prev}${prev ? ' ' : ''}${buffered}`);
        }
        pendingInterimTranscriptRef.current = '';
        if (voiceTargetRef.current !== 'document') {
          setLiveSpeechInterimText('');
        }
      }

      if (isVoiceActiveRef.current && !isMicMutedRef.current && !mockIntervalRef.current) {
        try {
          recognition.start();
        } catch (_error) {
          setIsVoiceActive(false);
          setLiveSpeechInterimText('');
        }
      }
    };

    speechRecognitionRef.current = recognition;
    return () => {
      if (mockDictationTimeoutRef.current) {
        clearTimeout(mockDictationTimeoutRef.current);
        mockDictationTimeoutRef.current = null;
      }
      if (mockIntervalRef.current) {
        clearInterval(mockIntervalRef.current);
        mockIntervalRef.current = null;
      }
      if (interimCommitTimerRef.current) {
        clearTimeout(interimCommitTimerRef.current);
        interimCommitTimerRef.current = null;
      }
      try {
        recognition.stop();
      } catch (_error) {
        // noop
      }
      speechRecognitionRef.current = null;
    };
  }, [currentLanguage]);

  // Integrated Tasks checklist state
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Confirm final beta signup workflow with design team', completed: false, owner: 'user' },
    { id: 2, text: 'Draft launch announcements for Twitter and LinkedIn', completed: true, owner: 'agent' },
    { id: 3, text: 'Coordinate with marketing for Creator pricing model tier', completed: false, owner: 'user' },
    { id: 4, text: 'Check analytics dashboard integration is live', completed: false, owner: 'agent' },
  ]);
  const [taskOwnerFilter, setTaskOwnerFilter] = useState('all');

  const visibleTasks = useMemo(() => {
    if (taskOwnerFilter === 'all') {
      return tasks;
    }
    return tasks.filter((task) => task.owner === taskOwnerFilter);
  }, [tasks, taskOwnerFilter]);

  // Conversational state with pre-loaded AI response cards
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Compose AI is ready. Ask, summarize, or instruct to update your document.',
      type: 'welcome',
    },
  ]);

  // Handle status cycle on initiatives
  const toggleStatus = (id) => {
    setInitiatives(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'Planned' ? 'In Progress' : item.status === 'In Progress' ? 'Completed' : 'Planned';
        return { ...item, status: nextStatus };
      }
      return item;
    }));
    showToast("Status updated");
  };

  // Toast notifier helper
  const showToast = (msg) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage('');
      toastTimerRef.current = null;
    }, 2800);
  };

  useEffect(() => () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  }, []);

  const truncateText = (value, max = 120) => {
    const raw = String(value || '').trim();
    if (raw.length <= max) {
      return raw;
    }
    return `${raw.slice(0, max)}...`;
  };

  const removePromptAttachment = (attachmentId) => {
    setPromptAttachments((prev) => {
      const target = prev.find((attachment) => attachment.id === attachmentId);
      if (target?.url) {
        try {
          URL.revokeObjectURL(target.url);
        } catch (_error) {
          // noop
        }
      }
      const next = prev.filter((attachment) => attachment.id !== attachmentId);
      return next;
    });
  };

  const attachFilesToPrompt = (files) => {
    if (!files || !files.length) {
      return;
    }

    const attachments = Array.from(files).map((file, index) => ({
      id: Date.now() + index + Math.floor(Math.random() * 1000),
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: file.size || 0,
      file,
      url: URL.createObjectURL(file),
      isImage: (file.type || '').startsWith('image/'),
    }));

    setPromptAttachments((prev) => [...attachments, ...prev].slice(0, 24));

    trackMemoryAction('upload', 'Attached files to prompt', {
      count: attachments.length,
      types: attachments.map((attachment) => attachment.type).join(', '),
    });
  };

  const beginPromptEdit = (entry) => {
    setEditingPromptId(entry.id);
    setEditingPromptValue(entry.text || '');
  };

  const cancelPromptEdit = () => {
    setEditingPromptId(null);
    setEditingPromptValue('');
  };

  const savePromptEdit = (entryId) => {
    const nextValue = editingPromptValue.trim();
    if (!nextValue) {
      showToast('Prompt cannot be empty');
      return;
    }
    setPromptHistory((prev) => prev.map((entry) => (entry.id === entryId ? { ...entry, text: nextValue } : entry)));
    cancelPromptEdit();
    showToast('Prompt updated');
  };

  const handleComposeUndo = () => {
    undoDocumentChange();
    setLastComposeRun(null);
  };

  const handleComposeRetry = () => {
    if (!lastComposeRun?.prompt) {
      showToast('No prompt to retry');
      return;
    }
    handleAISubmit(lastComposeRun.prompt, {
      ...(lastComposeRun.options || {}),
      source: 'compose',
      forceDocBuild: true,
      suppressChatEcho: true,
    });
  };

  const handleComposeDelete = () => {
    setDocBodyHtml('');
    setAppendedSections([]);
    setIsBlankDocument(true);
    setDocTitle('');
    setDocSubtitle('');
    setLastComposeRun(null);
    showToast('Removed generated output');
  };

  const handleComposeAccept = () => {
    setLastComposeRun(null);
    showToast('Changes accepted');
  };

  const closeTransientMenus = () => {
    setOpenDropdown(null);
    setTextStyleMenuOpen(false);
    setOpenDocMenuId(null);
    setIsPromptMenuOpen(false);
    setPromptTuneMenuOpen(false);
    setPromptFormatMenuOpen(false);
    setPromptLibraryOpen(false);
    setPromptHistoryFilterMenuOpen(false);
    setOpenWorkspaceMenuId(null);
    setLanguageMenuOpen(false);
  };

  const trackMemoryAction = (type, summary, details = {}) => {
    if (!memoryCaptureEnabled) {
      return;
    }

    const entry = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      type,
      summary,
      details,
      timestamp: Date.now(),
    };

    setMemoryEntries((prev) => [entry, ...prev].slice(0, 300));
  };

  const registerPromptHistory = ({ text, source = 'compose', format = 'Auto', tone = 'normal', lengthMode = 'words', lengthValue = 220 }) => {
    const normalizedText = String(text || '').trim();
    if (!normalizedText) {
      return;
    }

    const nextEntry = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      text: normalizedText,
      source,
      format,
      tone,
      lengthMode,
      lengthValue,
      timestamp: Date.now(),
    };

    setPromptHistory((prev) => {
      const withoutDuplicate = prev.filter(
        (entry) => String(entry.text || '').trim().toLowerCase() !== normalizedText.toLowerCase(),
      );
      return [nextEntry, ...withoutDuplicate].slice(0, 120);
    });
  };

  const toParagraphHtml = (value) => {
    const normalized = String(value || '').replace(/\r/g, '').trim();
    if (!normalized) {
      return '<p style="font-size:16px;color:#334155;line-height:1.8;margin-bottom:12px;"></p>';
    }

    const applyInlineFormatting = (text) => String(text || '')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.+?)__/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');

    return normalized
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .filter(Boolean)
      .map((block) => `<p style="font-size:16px;color:#334155;line-height:1.8;margin-bottom:12px;">${applyInlineFormatting(escapeHtml(block).replace(/\n/g, '<br/>'))}</p>`)
      .join('');
  };

  const renderDocActionHtml = (action) => {
    if (!action) {
      return '';
    }

    const title = escapeHtml(action.title || 'Compose AI Output');
    if (action.type === 'timeline' && Array.isArray(action.content)) {
      const rows = action.content.map((item) => `
        <div style="padding:10px 12px;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:8px;background:#f8fafc;">
          <div style="font-size:12px;font-weight:700;color:#6d28d9;">${escapeHtml(item.dates)}</div>
          <div style="font-size:14px;font-weight:600;color:#0f172a;margin-top:3px;">${escapeHtml(item.phase)}</div>
          <div style="font-size:13px;color:#475569;margin-top:2px;">${escapeHtml(item.detail)}</div>
        </div>
      `).join('');
      return `<h2 style="font-size:28px;line-height:1.2;margin-bottom:16px;">${title}</h2>${rows}`;
    }

    if (action.type === 'tasks' && Array.isArray(action.content)) {
      const items = action.content.map((task) => `<li style="margin-bottom:8px;">${escapeHtml(task)}</li>`).join('');
      return `<h2 style="font-size:28px;line-height:1.2;margin-bottom:16px;">${title}</h2><ul style="padding-left:20px;color:#334155;line-height:1.7;">${items}</ul>`;
    }

    if (action.type === 'risks' && Array.isArray(action.content)) {
      const items = action.content.map((risk) => `
        <div style="padding:10px 12px;border:1px solid #fecdd3;border-radius:10px;margin-bottom:8px;background:#fff1f2;">
          <div style="font-size:13px;font-weight:700;color:#be123c;">${escapeHtml(risk.threat)}</div>
          <div style="font-size:12px;color:#9f1239;margin-top:3px;">Impact: ${escapeHtml(risk.impact)}</div>
          <div style="font-size:12px;color:#475569;margin-top:4px;">Mitigation: ${escapeHtml(risk.fix)}</div>
        </div>
      `).join('');
      return `<h2 style="font-size:28px;line-height:1.2;margin-bottom:16px;">${title}</h2>${items}`;
    }

    return `<h2 style="font-size:28px;line-height:1.2;margin-bottom:16px;">${title}</h2>${toParagraphHtml(action.paragraph || '')}`;
  };

  const getActiveGeminiApiKey = () => {
    if (apiMode === 'byok') {
      return userApiKey.trim();
    }
    return DEMO_GEMINI_API_KEY.trim();
  };

  const parseJsonSafely = (rawText) => {
    if (!rawText) {
      return null;
    }

    try {
      return JSON.parse(rawText);
    } catch (_error) {
      const first = rawText.indexOf('{');
      const last = rawText.lastIndexOf('}');
      if (first >= 0 && last > first) {
        try {
          return JSON.parse(rawText.slice(first, last + 1));
        } catch (_nestedError) {
          return null;
        }
      }
      return null;
    }
  };

  const getGemini25ModelCandidates = async (apiKey) => {
    const fallbackModels = ['gemini-2.5-flash', 'gemini-2.5-pro'];
    if (!apiKey) {
      return fallbackModels;
    }

    if (modelCandidatesCacheRef.current && modelCandidatesCacheKeyRef.current === apiKey) {
      return modelCandidatesCacheRef.current;
    }

    try {
      const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`);
      if (!modelsResponse.ok) {
        modelCandidatesCacheRef.current = fallbackModels;
        modelCandidatesCacheKeyRef.current = apiKey;
        return fallbackModels;
      }

      const modelsPayload = await modelsResponse.json();
      const models = Array.isArray(modelsPayload?.models) ? modelsPayload.models : [];
      const candidates = models
        .filter((model) => {
          const name = model?.name || '';
          const methods = Array.isArray(model?.supportedGenerationMethods) ? model.supportedGenerationMethods : [];
          return name.includes('models/gemini-2.5') && methods.includes('generateContent');
        })
        .map((model) => (model.name || '').replace('models/', ''))
        .filter(Boolean);

      const ranked = candidates
        .sort((a, b) => {
          const score = (model) => {
            if (model.includes('flash')) return 0;
            if (model.includes('pro')) return 1;
            return 2;
          };
          return score(a) - score(b);
        })
        .filter((model, index, arr) => arr.indexOf(model) === index);

      const resolvedModels = ranked.length ? ranked : [];
      modelCandidatesCacheRef.current = resolvedModels;
      modelCandidatesCacheKeyRef.current = apiKey;
      return resolvedModels;
    } catch (_error) {
      modelCandidatesCacheRef.current = fallbackModels;
      modelCandidatesCacheKeyRef.current = apiKey;
      return fallbackModels;
    }
  };

  const callGemini = async ({ userPrompt, systemPrompt, schema, overrideApiKey }) => {
    const apiKey = (overrideApiKey || getActiveGeminiApiKey()).trim();
    if (!apiKey) {
      setLastAiError('Missing API key. Set VITE_GEMINI_DEMO_API_KEY or VITE_GEMINI_API_KEY in Vercel.');
      return null;
    }

    const modelCandidates = await getGemini25ModelCandidates(apiKey);
    let lastErrorMessage = '';

    if (!modelCandidates.length) {
      setLastAiError('No Gemini 2.5 generateContent model is enabled for this API key/project.');
      return null;
    }

    setLastAiError('');

    for (const modelName of modelCandidates) {
      try {
        const body = {
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 1200,
          },
        };

        if (systemPrompt) {
          body.systemInstruction = { parts: [{ text: systemPrompt }] };
        }

        if (schema) {
          body.generationConfig.responseMimeType = 'application/json';
          body.generationConfig.responseSchema = schema;
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          try {
            const errorBody = await response.json();
            const providerMessage = errorBody?.error?.message || `HTTP ${response.status}`;
            lastErrorMessage = `${modelName}: ${providerMessage}`;
          } catch (_error) {
            lastErrorMessage = `${modelName}: HTTP ${response.status}`;
          }
          continue;
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!text) {
          continue;
        }

        if (!schema) {
          return { text, modelName };
        }

        const parsed = parseJsonSafely(text);
        if (parsed) {
          return { text, parsed, modelName };
        }
      } catch (_error) {
        lastErrorMessage = `${modelName}: network or CORS error`;
        // try next model candidate
      }
    }

    if (lastErrorMessage) {
      setLastAiError(lastErrorMessage);
    }

    return null;
  };

  const applyUserApiKey = async () => {
    const trimmed = userApiKey.trim();
    if (!trimmed) {
      showToast('Paste an API key first');
      return;
    }

    setUserApiKey(trimmed);
    setApiMode('byok');

    const probe = await callGemini({
      userPrompt: 'Reply with exactly: API connected',
      overrideApiKey: trimmed,
    });
    if (probe?.text) {
      showToast('API key connected successfully');
      trackMemoryAction('ai', 'Updated API key', { mode: 'byok', verified: true });
      return;
    }

    showToast('API key saved. Verification failed, check key restrictions.');
    trackMemoryAction('ai', 'Updated API key', { mode: 'byok', verified: false });
  };

  const memoryStats = useMemo(() => {
    const uploads = memoryEntries.filter((entry) => entry.type === 'upload').length;
    const exports = memoryEntries.filter((entry) => entry.type === 'export').length;
    const aiCalls = memoryEntries.filter((entry) => entry.type === 'ai').length;
    const automations = memoryEntries.filter((entry) => entry.type === 'automation').length;

    return {
      total: memoryEntries.length,
      uploads,
      exports,
      aiCalls,
      automations,
    };
  }, [memoryEntries]);

  const filteredMemoryEntries = useMemo(() => {
    const query = memorySearch.trim().toLowerCase();

    return memoryEntries.filter((entry) => {
      if (memoryFilter !== 'all' && entry.type !== memoryFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      const detailsText = Object.values(entry.details || {}).join(' ').toLowerCase();
      return entry.summary.toLowerCase().includes(query) || detailsText.includes(query);
    });
  }, [memoryEntries, memoryFilter, memorySearch]);

  const filteredPromptHistory = useMemo(() => {
    const query = promptHistorySearch.trim().toLowerCase();
    return promptHistory.filter((entry) => {
      if (promptHistoryFilter !== 'all' && entry.source !== promptHistoryFilter) {
        return false;
      }
      if (!query) {
        return true;
      }
      const metadata = `${entry.format || ''} ${entry.tone || ''}`.toLowerCase();
      return String(entry.text || '').toLowerCase().includes(query) || metadata.includes(query);
    });
  }, [promptHistory, promptHistoryFilter, promptHistorySearch]);

  const resolveDocTypeFromComposeFormat = (formatLabel) => {
    const normalized = String(formatLabel || '').toLowerCase();
    if (normalized.includes('timeline')) {
      return 'timeline';
    }
    if (normalized.includes('checklist') || normalized.includes('task')) {
      return 'tasks';
    }
    if (normalized.includes('risk')) {
      return 'risks';
    }
    return 'text';
  };

  const shouldStartNewComposition = ({ promptText, source, actionType }) => {
    const normalizedPrompt = String(promptText || '').toLowerCase();
    const explicitNewDoc = /(new\s+(composition|document|doc|page)|separate\s+(composition|document|doc|page)|another\s+(composition|document|doc|page)|start\s+fresh)/i.test(normalizedPrompt);
    const explicitSameDoc = /(same\s+(document|doc|page)|current\s+(document|doc|page)|this\s+(document|doc|page)|keep\s+here)/i.test(normalizedPrompt);

    if (explicitNewDoc) {
      return true;
    }

    if (explicitSameDoc) {
      return false;
    }

    const docHasMeaningfulContent = getPlainText(docBodyHtml).length > 120;
    const taskLikeAction = ['tasks', 'timeline', 'risks'].includes(String(actionType || '').toLowerCase());

    return source === 'chat' && taskLikeAction && docHasMeaningfulContent;
  };

  // Function to process AI prompt and generate structured output
  const handleAISubmit = async (promptText, options = {}) => {
    if (!promptText.trim()) return;

    const source = options.source || 'chat';
    const forceDocBuild = Boolean(options.forceDocBuild);
    const suppressChatEcho = Boolean(options.suppressChatEcho);
    const requestedFormat = options.composeFormat || 'Auto (Compose decides)';
    const shouldBuildDocument = forceDocBuild || source === 'compose';
    const selectionScoped = Boolean(options.selectionScoped);
    const preferredDocType = resolveDocTypeFromComposeFormat(requestedFormat);
    const requestedTone = String(options.tone || 'normal');
    const requestedLengthMode = String(options.lengthMode || 'words');
    const requestedLengthValue = Number(options.lengthValue || 220);

    registerPromptHistory({
      text: promptText,
      source,
      format: requestedFormat,
      tone: requestedTone,
      lengthMode: requestedLengthMode,
      lengthValue: requestedLengthValue,
    });

    setIsComposing(true);
    trackMemoryAction('ai', 'Prompt sent to AI', {
      length: promptText.trim().length,
      mode: apiMode,
      source,
      requestedFormat,
      tone: requestedTone,
      [`${requestedLengthMode}`]: requestedLengthValue,
    });

    if (!suppressChatEcho) {
      const userMsgId = Date.now();
      setChatMessages((prev) => [...prev, {
        id: userMsgId,
        sender: 'user',
        text: promptText,
      }]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }

    let aiResponseText = '';
    let docAction = null;
    let usedLiveModel = false;

    const actionSchema = {
      type: 'OBJECT',
      properties: {
        aiResponseText: { type: 'STRING' },
        hasAction: { type: 'BOOLEAN' },
        docAction: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING' },
            type: { type: 'STRING' },
            timelineItems: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  phase: { type: 'STRING' },
                  dates: { type: 'STRING' },
                  detail: { type: 'STRING' },
                },
              },
            },
            taskItems: {
              type: 'ARRAY',
              items: { type: 'STRING' },
            },
            riskItems: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  threat: { type: 'STRING' },
                  impact: { type: 'STRING' },
                  fix: { type: 'STRING' },
                },
              },
            },
            textParagraph: { type: 'STRING' },
          },
        },
      },
    };

    try {
      const modelResponse = await callGemini({
        userPrompt: promptText,
        systemPrompt: `You are Compose AI. Return JSON only.
Context title: ${docTitle || 'Untitled'}.
Context subtitle: ${docSubtitle || 'No subtitle'}.
Requested output format: ${requestedFormat}.
Preferred doc action type: ${preferredDocType}.
Tone style: ${requestedTone}.
Length target: around ${requestedLengthValue} ${requestedLengthMode}.
Rules:
- If the input comes from Compose canvas prompt, always set hasAction=true and provide docAction that can be inserted into the main document immediately.
- docAction.type must be one of: timeline, tasks, risks, text.
- Prefer using the requested output format and preferred doc action type.
- For chat-only questions, hasAction can be false and provide aiResponseText only.
- Preserve paragraph structure for text outputs using meaningful line breaks.
- Keep aiResponseText concise, actionable, and specific.
- Do not simulate placeholders. Produce useful output.` ,
        schema: actionSchema,
      });

      if (modelResponse?.parsed) {
        usedLiveModel = true;
        const result = modelResponse.parsed;
        aiResponseText = result.aiResponseText?.trim() || (result.docAction?.textParagraph ? String(result.docAction.textParagraph).trim() : 'Composed with live AI.');

        if (result.hasAction && result.docAction) {
          const rawType = String(result.docAction.type || '').toLowerCase();
          if (rawType === 'timeline' && Array.isArray(result.docAction.timelineItems) && result.docAction.timelineItems.length) {
            docAction = {
              title: result.docAction.title || '🗓️ AI Timeline',
              type: 'timeline',
              content: result.docAction.timelineItems,
            };
          } else if (rawType === 'tasks' && Array.isArray(result.docAction.taskItems) && result.docAction.taskItems.length) {
            const sanitizedTasks = result.docAction.taskItems.filter(Boolean).map((item) => String(item));
            docAction = {
              title: result.docAction.title || '📋 AI Checklist',
              type: 'tasks',
              content: sanitizedTasks,
            };
            const syncedTasks = sanitizedTasks.map((task, index) => ({
              id: Date.now() + index,
              text: task,
              completed: false,
              owner: 'agent',
            }));
            setTasks((prev) => [...prev, ...syncedTasks]);
          } else if (rawType === 'risks' && Array.isArray(result.docAction.riskItems) && result.docAction.riskItems.length) {
            docAction = {
              title: result.docAction.title || '🛡️ AI Risk Matrix',
              type: 'risks',
              content: result.docAction.riskItems,
            };
          } else if (rawType === 'text' && result.docAction.textParagraph) {
            docAction = {
              title: result.docAction.title || '✨ AI Composed Section',
              type: 'text',
              paragraph: result.docAction.textParagraph,
            };
          }
        }

        if (shouldBuildDocument && !docAction) {
          docAction = {
            title: requestedFormat === 'Auto (Compose decides)'
              ? '✨ AI Composed Section'
              : `✨ ${requestedFormat}`,
            type: 'text',
            paragraph: (result.docAction?.textParagraph || aiResponseText || '').trim(),
          };
        }
      }
    } catch (_error) {
      usedLiveModel = false;
    }

    if (!usedLiveModel) {
      if (!getActiveGeminiApiKey()) {
        aiResponseText = 'Live AI is not configured. Add a key in Memory tab or set VITE_GEMINI_DEMO_API_KEY or VITE_GEMINI_API_KEY in Vercel.';
      } else {
        aiResponseText = `Live AI request failed. ${lastAiError || 'Check API key restrictions, billing, and model access.'}`;
      }
      trackMemoryAction('ai', 'Live AI request failed', {
        reason: lastAiError || 'Unknown provider error',
      });
    }

    setIsComposing(false);

    const actionSectionId = docAction
      ? `sec_${Date.now()}_${Math.floor(Math.random() * 1000)}`
      : null;

    if (!suppressChatEcho || !docAction) {
      setChatMessages((prev) => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiResponseText,
        type: docAction ? 'action_completed' : 'standard',
        actionTitle: docAction?.title,
        actionSectionId,
      }]);
    }

    if (docAction) {
      const finalizedAction = { ...docAction, sectionId: actionSectionId };
      if (shouldBuildDocument) {
        const targetedText = finalizedAction.type === 'text'
          ? String(finalizedAction.paragraph || '').replace(/\n{2,}/g, '\n\n')
          : aiResponseText;
        const injectedToSelection = selectionScoped && injectIntoSavedSelection(targetedText);

        if (!injectedToSelection) {
          const spawnNewComposition = shouldStartNewComposition({
            promptText,
            source,
            actionType: finalizedAction.type,
          });

          if (spawnNewComposition) {
            createNewComposition({ silent: true });
          }

          const composedHtml = renderDocActionHtml(finalizedAction);
          setIsBlankDocument(true);
          setAppendedSections([]);
          setDocBodyHtml(composedHtml);
          if (!docTitle?.trim() || docTitle === AI_NATIVE_PLACEHOLDER || docTitle === defaultTitle) {
            setDocTitle(finalizedAction.title?.replace(/^✨\s*/, '') || 'Compose Draft');
          }
          if (!docSubtitle?.trim() || docSubtitle === AI_NATIVE_PLACEHOLDER || docSubtitle === defaultSubtitle) {
            setDocSubtitle(`Generated in ${requestedTone} tone with ~${requestedLengthValue} ${requestedLengthMode}.`);
          }
          if (spawnNewComposition) {
            showToast(`Opened a new composition for ${finalizedAction.type} output`);
          }
        }
      } else {
        setIsBlankDocument(false);
        setAppendedSections((prev) => [...prev, finalizedAction]);
      }
      showToast(`Composed: ${docAction.title} injected into document!`);
      trackMemoryAction('automation', 'AI injected section', {
        section: docAction.title,
        sectionId: actionSectionId,
      });
    }

    trackMemoryAction('ai', 'AI response generated', {
      usedLiveModel,
    });

    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const handleSidebarSend = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    handleAISubmit(chatInput, { source: 'chat' });
    setChatInput('');
  };

  const handleAssistantQuickPromptSend = (event) => {
    event.preventDefault();
    const prompt = assistantQuickPrompt.trim();
    if (!prompt || isComposing) {
      return;
    }
    handleAISubmit(prompt, { source: 'chat' });
    setAssistantQuickPrompt('');
  };

  const runSmartAssistAction = (instruction) => {
    const selectedScope = selectedEditorTextRef.current || selectedEditorText;
    const hasSelection = Boolean(selectedScope);
    const scopedPrompt = hasSelection
      ? `${instruction}\n\nRefine ONLY this selected excerpt and preserve intent:\n"""${selectedScope}"""`
      : `${instruction}\n\nUse the current document context and provide a directly usable rewrite.`;

    setRightSidebarOpen(true);
    setActiveRightTab('chat');
    showToast('Smart Assist is running...');

    handleAISubmit(scopedPrompt, {
      source: hasSelection ? 'compose' : 'chat',
      forceDocBuild: hasSelection,
      suppressChatEcho: false,
      composeFormat: hasSelection ? 'Plain Text' : 'Auto (Compose decides)',
      selectionScoped: hasSelection,
      tone: promptTone,
      lengthMode: promptLengthMode,
      lengthValue: promptLengthValue,
    });
  };

  const handleFloatingSend = (e) => {
    e.preventDefault();
    if (isComposing) return;
    if (!floatingPrompt.trim() && !promptAttachments.length) return;
    const formatLabel = composeOutputFormat === 'Custom...'
      ? (customComposeFormat.trim() || 'Custom Document')
      : composeOutputFormat;
    const selectedScope = selectedEditorTextRef.current || selectedEditorText;
    const attachmentSummary = promptAttachments.length
      ? `\nAttached files: ${promptAttachments.map((item) => `${item.name} (${item.type})`).join(', ')}`
      : '';
    const fallbackPrompt = promptAttachments.length
      ? `Use attached files as source context and generate the requested output.`
      : '';
    const scopedInstruction = selectedScope
      ? `Modify ONLY the selected excerpt below. Do not rewrite unrelated sections.\nSelected excerpt:\n"""${selectedScope}"""\n\nUser request: ${floatingPrompt.trim() || fallbackPrompt}`
      : (floatingPrompt.trim() || fallbackPrompt);
    const finalPrompt = `${scopedInstruction}${attachmentSummary}`;
    const composeOptions = {
      source: 'compose',
      forceDocBuild: true,
      suppressChatEcho: true,
      composeFormat: formatLabel,
      tone: promptTone,
      lengthMode: promptLengthMode,
      lengthValue: promptLengthValue,
      selectionScoped: Boolean(selectedScope),
    };
    handleAISubmit(finalPrompt, composeOptions);
    setLastComposeRun({
      prompt: finalPrompt,
      options: composeOptions,
      documentId: activeDocId,
      createdAt: Date.now(),
    });
    setFloatingPrompt('');
    setSelectedEditorText('');
    selectedEditorTextRef.current = '';
  };

  const handleFloatingPaste = (event) => {
    const clipboard = event.clipboardData;
    if (!clipboard) {
      return;
    }

    const items = Array.from(clipboard.items || []);
    const files = items
      .filter((item) => item.kind === 'file')
      .map((item) => item.getAsFile())
      .filter(Boolean);

    if (files.length) {
      event.preventDefault();
      attachFilesToPrompt(files);
      showToast(`Attached ${files.length} item${files.length > 1 ? 's' : ''} from clipboard`);
      return;
    }

    const pastedText = clipboard.getData('text');
    if (pastedText) {
      setFloatingPrompt((prev) => `${prev}${prev ? ' ' : ''}${pastedText}`.trimStart());
      trackMemoryAction('upload', 'Pasted text into compose prompt', {
        length: pastedText.length,
      });
    }
  };

  const recordChatFeedback = (message, feedbackType, comment = '') => {
    trackMemoryAction('feedback', 'Chat feedback submitted', {
      messageId: String(message.id),
      feedbackType,
      comment,
    });
  };

  const retryMessageAction = (message) => {
    if (!message) {
      return;
    }

    if (message.sender === 'user') {
      handleAISubmit(message.text);
      recordChatFeedback(message, 'retry');
      return;
    }

    const index = chatMessages.findIndex((msg) => msg.id === message.id);
    const previousUser = [...chatMessages.slice(0, index)].reverse().find((msg) => msg.sender === 'user');
    if (previousUser) {
      handleAISubmit(previousUser.text);
      recordChatFeedback(message, 'retry_previous_prompt');
    }
  };

  const undoMessageAction = (message) => {
    if (!message?.actionSectionId) {
      showToast('No linked action to undo');
      return;
    }

    setAppendedSections((prev) => prev.filter((section) => section.sectionId !== message.actionSectionId));
    recordChatFeedback(message, 'undo_action');
    showToast('Undid AI section injection');
  };

  const deleteMessageAction = (message) => {
    setChatMessages((prev) => prev.filter((msg) => msg.id !== message.id));
    recordChatFeedback(message, 'delete_message');
  };

  const ensureMicrophonePermission = async () => {
    if (micPermissionGrantedRef.current) {
      return true;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('media-devices-unsupported');
    }

    if (navigator.permissions?.query) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
        if (permissionStatus.state === 'granted') {
          micPermissionGrantedRef.current = true;
          return true;
        }
        if (permissionStatus.state === 'denied') {
          throw new Error('microphone-denied');
        }
      } catch (_error) {
        if (String(_error?.message || '').includes('microphone-denied')) {
          throw _error;
        }
        // Some browsers do not support querying microphone permissions.
      }
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    micPermissionGrantedRef.current = true;
    return true;
  };

  const toggleVoiceRecording = async (targetMode = voiceTarget) => {
    if (!speechSupported) {
      showToast('Speech recognition is not supported in this browser');
      return;
    }

    const nextTarget = targetMode || 'compose';
    setVoiceTarget(nextTarget);
    voiceTargetRef.current = nextTarget;
    setHasVoiceInteraction(true);
    if (nextTarget === 'compose') {
      setIsPromptExpanded(true);
      setIsPromptAutoVisible(true);
    }

    if (isVoiceActive) {
      // If a different voice surface is requested, restart with the new target.
      if (voiceTarget !== nextTarget) {
        try {
          speechRecognitionRef.current?.stop();
        } catch (_error) {
          // noop
        }
        setIsVoiceActive(false);
      } else {
        try {
          speechRecognitionRef.current?.stop();
        } catch (_error) {
          // noop
        }
        if (mockDictationTimeoutRef.current) {
          clearTimeout(mockDictationTimeoutRef.current);
          mockDictationTimeoutRef.current = null;
        }
        if (mockIntervalRef.current) {
          clearInterval(mockIntervalRef.current);
          mockIntervalRef.current = null;
        }
        interimTranscriptRef.current = '';
        setIsVoiceActive(false);
        showToast('Voice transcription stopped');
        return;
      }
    }

    if (isMicMuted) {
      setIsMicMuted(false);
    }

    try {
      await ensureMicrophonePermission();
      const recognition = speechRecognitionRef.current;
      if (!recognition) {
        showToast('Voice engine is initializing. Please tap mic again in a moment.');
        return;
      }

      recognition.lang = resolveSpeechLocale(currentLanguage);
      try {
        recognition.start();
      } catch (startError) {
        const startName = String(startError?.name || '').toLowerCase();
        if (startName.includes('invalidstate')) {
          try {
            recognition.stop();
          } catch (_stopError) {
            // noop
          }
          setTimeout(() => {
            try {
              recognition.start();
            } catch (_retryError) {
              setIsVoiceActive(false);
              showToast('Microphone could not restart. Please tap once more.');
            }
          }, 120);
        } else {
          throw startError;
        }
      }
      showToast('Voice transcription started');

      if (mockDictationTimeoutRef.current) {
        clearTimeout(mockDictationTimeoutRef.current);
      }
      // Match attached behavior: fallback simulate if sandbox blocks real mic input.
      mockDictationTimeoutRef.current = setTimeout(() => {
        const noRealTranscript = !interimTranscriptRef.current.trim() && !pendingInterimTranscriptRef.current.trim();
        if (isVoiceActiveRef.current && voiceTargetRef.current === 'document' && noRealTranscript && !mockIntervalRef.current) {
          showToast('No live mic input yet. Switching to fallback dictation.');
          const phrases = [
            'Draft a launch plan for the new beta. ',
            'I need to cover marketing assets, technical rollout, and timeline milestones. ',
            'Let us schedule a team sync for next week. ',
          ];
          const fullText = phrases.join('');
          let currentIndex = 0;
          mockIntervalRef.current = setInterval(() => {
            if (!isVoiceActiveRef.current || isMicMutedRef.current) {
              clearInterval(mockIntervalRef.current);
              mockIntervalRef.current = null;
              return;
            }
            currentIndex += Math.floor(Math.random() * 3) + 2;
            if (currentIndex > fullText.length) {
              currentIndex = fullText.length;
            }
            const chunk = fullText.substring(0, currentIndex).trim();
            interimTranscriptRef.current = chunk;
            setLiveSpeechInterimText(chunk);
            if (currentIndex === fullText.length) {
              clearInterval(mockIntervalRef.current);
              mockIntervalRef.current = null;
              setTimeout(() => {
                if (isVoiceActiveRef.current && chunk) {
                  insertTranscriptIntoDocumentRef.current?.(chunk, { forceAppendToEnd: true });
                }
                interimTranscriptRef.current = '';
                setLiveSpeechInterimText('');
                setIsVoiceActive(false);
              }, 1000);
            }
          }, 40);
        }
      }, 2500);
    } catch (_error) {
      setIsVoiceActive(false);
      const errorName = String(_error?.name || '').toLowerCase();
      const errorMessage = String(_error?.message || '').toLowerCase();
      const isPermissionIssue = errorName.includes('notallowed')
        || errorName.includes('permission')
        || errorMessage.includes('microphone-denied');
      if (isPermissionIssue) {
        showToast('Microphone access is blocked. Please allow access in browser settings.');
      } else {
        showToast('Microphone could not start right now. Please tap mic again.');
      }
    }
  };

  const toggleMicMute = () => {
    setIsMicMuted((prev) => {
      const next = !prev;
      if (next && isVoiceActive) {
        try {
          speechRecognitionRef.current?.stop();
        } catch (_error) {
          // noop
        }
        if (mockDictationTimeoutRef.current) {
          clearTimeout(mockDictationTimeoutRef.current);
          mockDictationTimeoutRef.current = null;
        }
        if (mockIntervalRef.current) {
          clearInterval(mockIntervalRef.current);
          mockIntervalRef.current = null;
        }
        interimTranscriptRef.current = '';
        setIsVoiceActive(false);
      }
      showToast(next ? 'Microphone muted' : 'Microphone unmuted');
      return next;
    });
  };

  const handlePromptAudioUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    attachFilesToPrompt([file]);
    trackMemoryAction('upload', 'Uploaded prompt audio', {
      name: file.name,
      size: file.size,
      mimeType: file.type,
    });
    showToast(`Audio attached: ${file.name}`);
  };

  // Click handler for Right Mini Sidebar
  const handleMiniSidebarClick = (tabKey) => {
    if (rightSidebarOpen && activeRightTab === tabKey) {
      setRightSidebarOpen(false);
    } else {
      setRightSidebarOpen(true);
      setActiveRightTab(tabKey);
    }
  };

  const handleRightSidebarTabsKeyDown = (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }

    event.preventDefault();
    const tabOrder = ['chat', 'assistant', 'tasks', 'calendar', 'memory'];
    const currentIndex = tabOrder.indexOf(activeRightTab);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = event.key === 'ArrowRight'
      ? (safeIndex + 1) % tabOrder.length
      : (safeIndex - 1 + tabOrder.length) % tabOrder.length;

    setActiveRightTab(tabOrder[nextIndex]);
    setRightSidebarOpen(true);
  };

  const switchDocument = (docId) => {
    const targetDoc = documents.find((doc) => doc.id === docId);
    if (!targetDoc) {
      return;
    }

    setActiveDocId(docId);
    setDocTitle(targetDoc.title);
    setDocSubtitle(targetDoc.subtitle);
    setInitiatives(targetDoc.initiatives);
    setAppendedSections(targetDoc.appendedSections);
    setIsBlankDocument(targetDoc.isBlank);
    setDocBodyHtml(targetDoc.bodyHtml || '');
  };

  const createNewComposition = ({ silent = false } = {}) => {
    const newDoc = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      title: '',
      subtitle: '',
      initiatives: [],
      appendedSections: [],
      isBlank: true,
      bodyHtml: '',
      pinned: false,
    };

    setDocuments((prev) => [...prev, newDoc]);
    setActiveDocId(newDoc.id);
    setDocTitle('');
    setDocSubtitle('');
    setIsBlankDocument(true);
    setAppendedSections([]);
    setInitiatives([]);
    setDocBodyHtml('');
    setLastComposeRun(null);
    setLeftSidebarOpen(false);
    trackMemoryAction('document', silent ? 'Created new blank composition (auto)' : 'Created new blank composition', {
      documentId: String(newDoc.id),
    });
    if (!silent) {
      showToast('Blank composition created');
    }
    return newDoc.id;
  };

  const requestCloseDocument = (docId) => {
    setCloseConfirmDocId(docId);
    setOpenDocMenuId(null);
  };

  const confirmCloseDocument = () => {
    if (!closeConfirmDocId) {
      return;
    }

    const remaining = documents.filter((doc) => doc.id !== closeConfirmDocId);
    if (!remaining.length) {
      setCloseConfirmDocId(null);
      createNewComposition();
      return;
    }

    setDocuments(remaining);
    const nextActive = remaining[0];
    setCloseConfirmDocId(null);
    switchDocument(nextActive.id);
  };

  const openCreateWorkspaceModal = () => {
    setWorkspaceModalMode('create');
    setWorkspaceNameInput('');
    setEditingWorkspaceId(null);
    setWorkspaceModalOpen(true);
    setOpenWorkspaceMenuId(null);
  };

  const openRenameWorkspaceModal = (workspace) => {
    setWorkspaceModalMode('rename');
    setWorkspaceNameInput(workspace.name);
    setEditingWorkspaceId(workspace.id);
    setWorkspaceModalOpen(true);
    setOpenWorkspaceMenuId(null);
  };

  const submitWorkspaceModal = () => {
    const trimmed = workspaceNameInput.trim();
    if (!trimmed) {
      return;
    }

    if (workspaceModalMode === 'create') {
      const letter = trimmed.charAt(0).toUpperCase();
      setWorkspaces((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: trimmed,
          letter,
          colorClass: 'bg-slate-500',
          hasDocuments: false,
        },
      ]);
      showToast(`Workspace ${trimmed} created`);
    } else if (editingWorkspaceId) {
      setWorkspaces((prev) =>
        prev.map((ws) =>
          ws.id === editingWorkspaceId
            ? { ...ws, name: trimmed, letter: trimmed.charAt(0).toUpperCase() }
            : ws,
        ),
      );
      showToast(`Workspace renamed to ${trimmed}`);
    }

    setWorkspaceModalOpen(false);
    setWorkspaceNameInput('');
    setEditingWorkspaceId(null);
  };

  const startRenameDocument = (doc) => {
    setRenamingDocId(doc.id);
    setRenameDocValue(doc.title?.trim() ? doc.title : '');
    setOpenDocMenuId(null);
  };

  const commitRenameDocument = (docId) => {
    const nextTitle = renameDocValue.trim();
    setDocuments((prev) => prev.map((doc) => (doc.id === docId ? { ...doc, title: nextTitle } : doc)));
    if (activeDocId === docId) {
      setDocTitle(nextTitle);
    }
    setRenamingDocId(null);
    setRenameDocValue('');
    showToast('Document renamed');
  };

  const beginUnsavedDraftRename = () => {
    const activeDoc = documents.find((doc) => doc.id === activeDocId);
    const currentName = (activeDoc?.title || docTitle || 'Unsaved draft').trim() || 'Unsaved draft';
    setUnsavedDraftNameInput(currentName);
    setIsEditingUnsavedDraftName(true);
  };

  const commitUnsavedDraftRename = () => {
    const nextTitle = unsavedDraftNameInput.trim();
    if (!nextTitle) {
      setIsEditingUnsavedDraftName(false);
      setUnsavedDraftNameInput('');
      return;
    }

    if (activeDocId) {
      setDocuments((prev) => prev.map((doc) => (doc.id === activeDocId ? { ...doc, title: nextTitle } : doc)));
    }
    setDocTitle(nextTitle);
    setIsEditingUnsavedDraftName(false);
    setUnsavedDraftNameInput('');
    showToast('Document renamed');
  };

  const getDocumentPayload = (docId = activeDocId) => {
    const fallback = {
      title: docTitle,
      subtitle: docSubtitle,
      initiatives,
      bodyHtml: docBodyHtml,
      appendedSections,
      isBlank: isBlankDocument,
    };

    if (!docId) {
      return fallback;
    }

    const target = documents.find((doc) => doc.id === docId);
    return target || fallback;
  };

  const sanitizeFileName = (value) => {
    const trimmed = (value || '').trim();
    const safe = trimmed.replace(/[<>:"/\\|?*]+/g, '-');
    return safe || 'composition';
  };

  const triggerBlobDownload = (filename, blob) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const exportCurrentDocumentAsPdf = async (forcedFileName) => {
    if (!documentCardRef.current) {
      showToast('Document is not ready for export yet');
      return false;
    }

    let printContainer = null;

    try {
      showToast('Generating PDF...');

      printContainer = document.createElement('div');
      printContainer.style.position = 'fixed';
      printContainer.style.left = '-99999px';
      printContainer.style.top = '0';
      printContainer.style.width = '850px';
      printContainer.style.background = '#ffffff';
      printContainer.style.padding = '24px';

      const clonedCard = documentCardRef.current.cloneNode(true);
      printContainer.appendChild(clonedCard);
      document.body.appendChild(printContainer);

      const canvas = await html2canvas(printContainer, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });

      const imageData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageProps = pdf.getImageProperties(imageData);
      const imageWidth = pageWidth;
      const imageHeight = (imageProps.height * imageWidth) / imageProps.width;

      let heightLeft = imageHeight;
      let position = 0;

      pdf.addImage(imageData, 'PNG', 0, position, imageWidth, imageHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imageHeight;
        pdf.addPage();
        pdf.addImage(imageData, 'PNG', 0, position, imageWidth, imageHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      const fileName = forcedFileName || `${sanitizeFileName(docTitle)}.pdf`;
      pdf.save(fileName);
      trackMemoryAction('export', 'Exported document', {
        format: 'PDF',
        fileName,
      });
      showToast('PDF exported successfully');
      return true;
    } catch (_error) {
      showToast('Unable to export PDF right now');
      return false;
    } finally {
      if (printContainer && printContainer.parentNode) {
        printContainer.parentNode.removeChild(printContainer);
      }
    }
  };

  const downloadDocumentInFormat = async (format, docId = activeDocId) => {
    const payload = getDocumentPayload(docId);
    const fileBase = sanitizeFileName(payload.title);

    if (format === 'PDF') {
      return exportCurrentDocumentAsPdf(`${fileBase}.pdf`);
    }

    if (format === 'Compose (.cmp)') {
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      triggerBlobDownload(`${fileBase}.cmp`, blob);
      trackMemoryAction('export', 'Exported document', { format: 'Compose (.cmp)' });
      return true;
    }

    if (format === 'Markdown') {
      const markdown = `# ${payload.title || 'Untitled'}\n\n${payload.subtitle || ''}\n\n${(payload.initiatives || []).map((item) => `- ${item.name} (${item.timeline})`).join('\n')}\n`;
      triggerBlobDownload(`${fileBase}.md`, new Blob([markdown], { type: 'text/markdown' }));
      trackMemoryAction('export', 'Exported document', { format: 'Markdown' });
      return true;
    }

    if (format === 'Plain Text') {
      const plain = `${payload.title || 'Untitled'}\n\n${payload.subtitle || ''}`;
      triggerBlobDownload(`${fileBase}.txt`, new Blob([plain], { type: 'text/plain' }));
      trackMemoryAction('export', 'Exported document', { format: 'Plain Text' });
      return true;
    }

    if (format === 'DOC (Word-compatible)') {
      const docMarkup = `<html><head><meta charset="utf-8"/></head><body><h1>${payload.title || 'Untitled'}</h1><p>${payload.subtitle || ''}</p></body></html>`;
      triggerBlobDownload(`${fileBase}.doc`, new Blob([docMarkup], { type: 'application/msword' }));
      trackMemoryAction('export', 'Exported document', { format: 'DOC (Word-compatible)' });
      return true;
    }

    if (format === 'HTML') {
      const html = `<!doctype html><html><head><meta charset="utf-8"/></head><body>${payload.bodyHtml || ''}</body></html>`;
      triggerBlobDownload(`${fileBase}.html`, new Blob([html], { type: 'text/html' }));
      trackMemoryAction('export', 'Exported document', { format: 'HTML' });
      return true;
    }

    return false;
  };

  const openShareModal = (docId) => {
    const target = getDocumentPayload(docId);
    const base = `${window.location.origin}${window.location.pathname}`;
    setShareTargetDocId(docId);
    setShareTargetDocTitle(target.title?.trim() || 'Untitled composition');
    setShareDestination('friends');
    setShareFormat('Compose (.cmp)');
    setShareAccess('Viewer');
    setShareLink(`${base}?doc=${docId}&access=viewer`);
    closeTransientMenus();
    setRightSidebarOpen(false);
    setShareModalOpen(true);
    trackMemoryAction('share', 'Opened share modal', {
      documentId: String(docId),
    });
  };

  const handleShareModalConfirm = async () => {
    if (shareDestination === 'downloads') {
      const ok = await downloadDocumentInFormat(shareFormat, shareTargetDocId || activeDocId);
      if (ok) {
        trackMemoryAction('share', 'Shared to downloads', {
          format: shareFormat,
          access: shareAccess,
        });
        setShareModalOpen(false);
      }
      return;
    }

    if (shareDestination === 'apps') {
      try {
        if (navigator.share) {
          await navigator.share({
            title: shareTargetDocTitle,
            text: `Shared from Regaarder Compose (${shareAccess})`,
            url: shareLink,
          });
          trackMemoryAction('share', 'Shared via native app sheet', {
            access: shareAccess,
            format: shareFormat,
          });
          showToast('Shared to app successfully');
        } else {
          await navigator.clipboard.writeText(shareLink);
          showToast('Native app sharing not supported. Link copied instead.');
        }
      } catch (_error) {
        showToast('Sharing to app was cancelled or unavailable');
      }
      setShareModalOpen(false);
      return;
    }

    try {
      await navigator.clipboard.writeText(shareLink);
      trackMemoryAction('share', 'Copied share link', {
        access: shareAccess,
      });
      showToast(`Share link copied (${shareAccess})`);
    } catch (_error) {
      showToast('Could not copy link automatically');
    }
    setShareModalOpen(false);
  };

  const handleDocumentAction = (action, docId) => {
    if (action === 'rename') {
      const target = documents.find((doc) => doc.id === docId);
      if (target) {
        startRenameDocument(target);
      }
      return;
    }

    if (action === 'save') {
      saveDocumentLocally();
      setOpenDocMenuId(null);
      return;
    }

    if (action === 'share') {
      openShareModal(docId);
      setOpenDocMenuId(null);
      return;
    }

    if (action === 'pin') {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === docId
            ? {
                ...doc,
                pinned: !doc.pinned,
              }
            : doc,
        ),
      );
      setOpenDocMenuId(null);
      showToast('Pin state updated');
      return;
    }

    if (action === 'close') {
      requestCloseDocument(docId);
    }
  };

  const applyFormatCommand = (command, value) => {
    let range = getEditorSelectionRange();

    if (!range && restoreSavedSelection()) {
      range = getEditorSelectionRange();
    }

    if (!range) {
      blankBodyRef.current?.focus();
      return;
    }

    document.execCommand(command, false, value);

    const selection = window.getSelection();
    if (selection && selection.rangeCount) {
      savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
    }

    if (blankBodyRef.current) {
      setDocBodyHtml(blankBodyRef.current.innerHTML);
    }

    try {
      setIsBoldActive(Boolean(document.queryCommandState('bold')));
      setIsItalicActive(Boolean(document.queryCommandState('italic')));
      setIsUnderlineActive(Boolean(document.queryCommandState('underline')));
      setIsStrikeActive(Boolean(document.queryCommandState('strikeThrough')));
      setIsListActive(Boolean(document.queryCommandState('insertUnorderedList')));
    } catch (_error) {
      // noop
    }
  };

  const addTaskFromInput = () => {
    const trimmed = newTaskInput.trim();
    if (!trimmed) {
      return;
    }

    setTasks((prev) => [...prev, { id: Date.now(), text: trimmed, completed: false, owner: newTaskOwner }]);
    setNewTaskInput('');
    trackMemoryAction('task', 'Added task', {
      textLength: trimmed.length,
    });
    showToast('Task added');
  };

  const removeTask = (taskId) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    showToast('Task removed');
  };

  const beginTaskEdit = (task) => {
    setEditingTaskId(task.id);
    setEditingTaskText(task.text || '');
  };

  const commitTaskEdit = (taskId) => {
    const next = editingTaskText.trim();
    if (!next) {
      setEditingTaskId(null);
      setEditingTaskText('');
      return;
    }
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, text: next } : task)));
    setEditingTaskId(null);
    setEditingTaskText('');
    showToast('Task updated');
  };

  const formatTimeSlot = (hours24, minutes = 0) => `${String(hours24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  const parseTimeSlot = (slot) => {
    const match = String(slot || '').match(/(\d{1,2}):(\d{2})/);
    if (!match) {
      return { hours: 9, minutes: 0 };
    }
    return {
      hours: Math.min(23, Math.max(0, Number(match[1] || 9))),
      minutes: Math.min(59, Math.max(0, Number(match[2] || 0))),
    };
  };

  const inferCategory = (text) => {
    const value = String(text || '').toLowerCase();
    if (/meeting|call|sync|interview|standup/.test(value)) return 'Meeting';
    if (/review|report|draft|write|document|plan/.test(value)) return 'Work';
    if (/doctor|gym|pay|bill|buy|pickup|family/.test(value)) return 'Personal';
    return 'General';
  };

  const inferUrgency = (text, targetDate) => {
    const value = String(text || '').toLowerCase();
    if (/urgent|asap|immediately|today/.test(value)) return 'high';
    if (/tomorrow|soon|next/.test(value)) return 'medium';
    if (targetDate) {
      const now = new Date();
      const diffDays = Math.ceil((targetDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      if (diffDays <= 1) return 'high';
      if (diffDays <= 3) return 'medium';
    }
    return 'low';
  };

  const parseScheduleItem = (rawItem, index = 0) => {
    const cleaned = String(rawItem || '').trim();
    const normalized = cleaned.replace(/\bshhedule\b|\bshedule\b/gi, 'schedule').replace(/\bppm\b/gi, 'pm');

    const explicitTimeMatch = normalized.match(/\bat\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?/i);
    const timeWithMarkerMatch = normalized.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)\b/i);
    const timeMatch = explicitTimeMatch || timeWithMarkerMatch;
    let hours = 9 + (index % 10);
    let minutes = 0;
    const hasExplicitTime = Boolean(timeMatch);
    if (timeMatch) {
      hours = Number(timeMatch[1] || hours);
      minutes = Number(timeMatch[2] || 0);
      const marker = String(timeMatch[3] || '').toLowerCase().replace(/\./g, '');
      if (marker === 'pm' && hours < 12) hours += 12;
      if (marker === 'am' && hours === 12) hours = 0;
      if (!marker && hours <= 7 && explicitTimeMatch) {
        hours += 12;
      }
      hours = Math.min(23, Math.max(0, hours));
    }

    const durationMatch = normalized.match(/(\d{1,3})\s*(m|min|mins|minute|minutes|h|hr|hrs|hour|hours)\b/i);
    let durationMinutes = 60;
    if (durationMatch) {
      const amount = Number(durationMatch[1] || 60);
      const unit = String(durationMatch[2] || 'm').toLowerCase();
      durationMinutes = /h|hr|hrs|hour/.test(unit) ? amount * 60 : amount;
    }

    const monthRegex = /(january|february|march|april|may|june|july|august|september|october|november|december)(?:\s+[a-z]+)?\s+(\d{1,2})(?:[^\d]+(\d{4}))?/i;
    const dateMatch = normalized.match(monthRegex);
    let dueDate = null;
    if (dateMatch) {
      const monthNamesLookup = {
        january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
        july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
      };
      const monthIndex = monthNamesLookup[String(dateMatch[1] || '').toLowerCase()];
      const day = Number(dateMatch[2] || selectedCalendarDate.getDate());
      const year = Number(dateMatch[3] || selectedCalendarDate.getFullYear());
      if (!Number.isNaN(monthIndex) && !Number.isNaN(day)) {
        dueDate = new Date(year, monthIndex, day, hours, minutes);
      }
    } else {
      dueDate = new Date(selectedCalendarDate.getFullYear(), selectedCalendarDate.getMonth(), selectedCalendarDate.getDate(), hours, minutes);
    }

    const titleSource = normalized
      .replace(/\b(schedule|create|add|set|plan)\b/gi, '')
      .replace(/\bon\b.+$/i, '')
      .replace(/\bat\b.+$/i, '')
      .trim();

    let title = titleSource;
    if (/meeting|call|sync/i.test(normalized)) {
      title = 'Meeting';
    } else if (!title) {
      title = `Task ${index + 1}`;
    }

    const category = inferCategory(normalized);
    const urgency = inferUrgency(normalized, dueDate);

    const slot = formatTimeSlot(hours, minutes);

    const parsed = {
      id: Date.now() + index + Math.floor(Math.random() * 1000),
      slot,
      timeExplicit: hasExplicitTime,
      title,
      summary: '',
      steps: [],
      category,
      urgency,
      durationMinutes,
      dueDate: dueDate ? dueDate.toISOString() : null,
      approved: false,
      rawInput: cleaned,
    };

    return {
      ...parsed,
      original: {
        slot: parsed.slot,
        title: parsed.title,
        summary: parsed.summary,
        steps: parsed.steps,
        category: parsed.category,
        urgency: parsed.urgency,
        durationMinutes: parsed.durationMinutes,
        dueDate: parsed.dueDate,
      },
    };
  };

  const findBestAvailableSlot = (targetDate) => {
    const pool = ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00'];
    const isSameDay = (iso) => {
      if (!iso) return false;
      const d = new Date(iso);
      return d.getFullYear() === targetDate.getFullYear() && d.getMonth() === targetDate.getMonth() && d.getDate() === targetDate.getDate();
    };
    const busy = new Set([
      ...scheduleOutput.filter((item) => isSameDay(item.dueDate)).map((item) => item.slot),
      ...upcomingEvents.filter((item) => isSameDay(item.dueDate)).map((item) => item.slot),
    ]);
    return pool.find((slot) => !busy.has(slot)) || pool[0];
  };

  const enrichScheduleItemsWithAI = async (rawItems, fallbackItems) => {
    if (!getActiveGeminiApiKey()) {
      return fallbackItems;
    }

    const schema = {
      type: 'OBJECT',
      properties: {
        items: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              title: { type: 'STRING' },
              slot: { type: 'STRING' },
              dueDateISO: { type: 'STRING' },
              durationMinutes: { type: 'NUMBER' },
              category: { type: 'STRING' },
              urgency: { type: 'STRING' },
              summary: { type: 'STRING' },
              steps: { type: 'ARRAY', items: { type: 'STRING' } },
            },
          },
        },
      },
    };

    try {
      const response = await callGemini({
        userPrompt: rawItems.join('\n'),
        systemPrompt: `Convert the schedule lines into structured JSON.\nRules:\n- Extract title, date/time, duration in minutes.\n- slot must be HH:MM 24-hour.\n- dueDateISO must be valid ISO datetime.\n- infer category as Meeting/Work/Personal/General.\n- urgency must be high/medium/low.\n- Keep summary concise.\n- Add useful step checklist when obvious.`,
        schema,
      });

      const aiItems = response?.parsed?.items;
      if (!Array.isArray(aiItems) || !aiItems.length) {
        return fallbackItems;
      }

      return fallbackItems.map((base, index) => {
        const ai = aiItems[index] || {};
        const mergedDate = ai.dueDateISO ? new Date(ai.dueDateISO) : (base.dueDate ? new Date(base.dueDate) : null);
        const nextDate = mergedDate && !Number.isNaN(mergedDate.getTime()) ? mergedDate : null;
        const nextSlot = /\d{1,2}:\d{2}/.test(String(ai.slot || '')) ? String(ai.slot) : base.slot;
        const next = {
          ...base,
          title: String(ai.title || base.title || '').trim() || base.title,
          slot: nextSlot,
          dueDate: nextDate ? nextDate.toISOString() : base.dueDate,
          timeExplicit: /\d{1,2}:\d{2}/.test(String(ai.slot || '')) || base.timeExplicit,
          durationMinutes: Number(ai.durationMinutes || base.durationMinutes || 60),
          category: String(ai.category || base.category || 'General'),
          urgency: ['high', 'medium', 'low'].includes(String(ai.urgency || '').toLowerCase()) ? String(ai.urgency).toLowerCase() : base.urgency,
          summary: String(ai.summary || base.summary || ''),
          steps: Array.isArray(ai.steps) ? ai.steps.filter(Boolean).map((step) => String(step)) : base.steps,
        };

        return {
          ...next,
          original: {
            slot: next.slot,
            title: next.title,
            summary: next.summary,
            steps: next.steps,
            category: next.category,
            urgency: next.urgency,
            durationMinutes: next.durationMinutes,
            dueDate: next.dueDate,
          },
        };
      });
    } catch (_error) {
      return fallbackItems;
    }
  };

  const formatEventSlotLabel = (event) => {
    if (!event?.dueDate) {
      return event?.slot ? `${event.slot}` : (event?.slotLabel || 'No time set');
    }

    const dateValue = new Date(event.dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    const slotLabel = event.slot || formatTimeSlot(dateValue.getHours(), dateValue.getMinutes());

    if (isSameDay(dateValue, today)) {
      return `Today • ${slotLabel}`;
    }
    if (isSameDay(dateValue, tomorrow)) {
      return `Tomorrow • ${slotLabel}`;
    }
    return `${dateValue.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} • ${slotLabel}`;
  };

  const formatUpcomingHeaderDate = (dateValue) => {
    const safeDate = dateValue instanceof Date ? dateValue : new Date();
    const weekday = safeDate.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase();
    const month = safeDate.toLocaleDateString(undefined, { month: 'short' }).toUpperCase();
    return `${weekday} ${month} ${safeDate.getDate()}`;
  };

  const convertTaskToSchedule = async (taskValue) => {
    const taskText = typeof taskValue === 'string' ? taskValue : String(taskValue?.text || '');
    const trimmed = taskText.trim();
    if (!trimmed) {
      return;
    }

    let scheduleItem = parseScheduleItem(trimmed, scheduleOutput.length);
    const targetDate = scheduleItem.dueDate ? new Date(scheduleItem.dueDate) : selectedCalendarDate;
    if (!scheduleItem.timeExplicit) {
      scheduleItem.slot = findBestAvailableSlot(targetDate);
    }

    const aiEnriched = await enrichScheduleItemsWithAI([trimmed], [scheduleItem]);
    scheduleItem = aiEnriched[0] || scheduleItem;
    if (typeof taskValue === 'object' && taskValue?.owner) {
      scheduleItem.category = taskValue.owner === 'agent' ? 'Agent Task' : scheduleItem.category;
    }

    setScheduleOutput((prev) => [...prev, scheduleItem]);
    setActiveRightTab('calendar');
    setRightSidebarOpen(true);
    trackMemoryAction('automation', 'Converted task to schedule', {
      title: scheduleItem.title,
    });
    showToast('Task converted to schedule');
  };

  const convertMessyScheduleToPlan = async () => {
    const rawItems = scheduleInput
      .split(/\n|;/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (!rawItems.length) {
      return;
    }

    let cleanItems = rawItems.map((item, index) => {
      const parsed = parseScheduleItem(item, index);
      if (!parsed.timeExplicit) {
        const targetDate = parsed.dueDate ? new Date(parsed.dueDate) : selectedCalendarDate;
        parsed.slot = findBestAvailableSlot(targetDate);
      }
      return parsed;
    });

    cleanItems = await enrichScheduleItemsWithAI(rawItems, cleanItems);

    setScheduleOutput(cleanItems);
    trackMemoryAction('automation', 'Converted raw schedule input', {
      items: cleanItems.length,
    });
    showToast('Messy schedule converted to clean timeline');
  };

  const updateScheduleItem = (id, field, value) => {
    setScheduleOutput((prev) => prev.map((item) => (
      item.id === id ? { ...item, [field]: value } : item
    )));
  };

  const undoScheduleItem = (id) => {
    setScheduleOutput((prev) => prev.filter((item) => item.id !== id));
    showToast('Removed from processed list');
  };

  const addScheduleStep = (id) => {
    setScheduleOutput((prev) => prev.map((item) => (
      item.id === id ? { ...item, steps: [...(item.steps || []), ''] } : item
    )));
  };

  const updateScheduleStep = (id, stepIndex, value) => {
    setScheduleOutput((prev) => prev.map((item) => {
      if (item.id !== id) return item;
      const nextSteps = [...(item.steps || [])];
      nextSteps[stepIndex] = value;
      return { ...item, steps: nextSteps };
    }));
  };

  const removeScheduleStep = (id, stepIndex) => {
    setScheduleOutput((prev) => prev.map((item) => {
      if (item.id !== id) return item;
      return { ...item, steps: (item.steps || []).filter((_, idx) => idx !== stepIndex) };
    }));
  };

  const approveScheduleItem = (id) => {
    setScheduleOutput((prev) => {
      const target = prev.find((item) => item.id === id);
      if (!target) return prev;

      setUpcomingEvents((existing) => [
        {
          id: Date.now() + Math.floor(Math.random() * 1000),
          title: target.title,
          slot: target.slot,
          dueDate: target.dueDate || selectedCalendarDate.toISOString(),
          category: target.category,
          urgency: target.urgency,
          durationMinutes: target.durationMinutes || 60,
          slotLabel: formatEventSlotLabel(target),
        },
        ...existing,
      ]);

      showToast('Schedule item approved and added to upcoming events');
      return prev.filter((item) => item.id !== id);
    });
  };

  const beginPanelResize = (target, event) => {
    const point = event.touches?.[0] || event;
    if (!event.touches && event.button !== 0) {
      return;
    }
    dragStateRef.current = {
      startX: point.clientX,
      startY: point.clientY,
      leftWidth: leftSidebarWidth,
      rightWidth: rightSidebarWidth,
      promptX: promptOffset.x,
      promptY: promptOffset.y,
      miniPromptX: miniPromptOffset.x,
      miniPromptY: miniPromptOffset.y,
      dictationX: dictationOffset.x,
      dictationY: dictationOffset.y,
    };
    setDragTarget(target);
  };

  useEffect(() => {
    if (!dragTarget) {
      return;
    }

    const handlePointerMove = (event) => {
      const deltaX = event.clientX - dragStateRef.current.startX;

      if (dragTarget === 'left') {
        const nextLeftWidth = Math.min(380, Math.max(220, dragStateRef.current.leftWidth + deltaX));
        setLeftSidebarWidth(nextLeftWidth);
      }

      if (dragTarget === 'right') {
        const nextRightWidth = Math.min(520, Math.max(280, dragStateRef.current.rightWidth - deltaX));
        setRightSidebarWidth(nextRightWidth);
      }

      if (dragTarget === 'prompt') {
        const nextX = Math.min(620, Math.max(-620, dragStateRef.current.promptX + deltaX));
        const deltaY = event.clientY - dragStateRef.current.startY;
        const nextY = Math.min(320, Math.max(-540, dragStateRef.current.promptY - deltaY));
        setPromptOffset({ x: nextX, y: nextY });
      }

      if (dragTarget === 'miniPrompt') {
        const nextX = Math.min(840, Math.max(-20, dragStateRef.current.miniPromptX + deltaX));
        const deltaY = event.clientY - dragStateRef.current.startY;
        const nextY = Math.min(560, Math.max(-40, dragStateRef.current.miniPromptY + deltaY));
        setMiniPromptOffset({ x: nextX, y: nextY });
      }

      if (dragTarget === 'dictation') {
        const nextX = Math.min(840, Math.max(-20, dragStateRef.current.dictationX + deltaX));
        const deltaY = event.clientY - dragStateRef.current.startY;
        const nextY = Math.min(520, Math.max(-80, dragStateRef.current.dictationY - deltaY));
        setDictationOffset({ x: nextX, y: nextY });
      }
    };

    const handlePointerUp = () => {
      setDragTarget(null);
    };

    document.body.style.cursor = ['prompt', 'miniPrompt', 'dictation'].includes(dragTarget) ? 'grabbing' : 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragTarget]);

  // Helper function to generate calendar days
  const generateCalendarDays = (month, year) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const days = [];
    
    // Previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
    }
    
    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = new Date(year, month, i).toDateString() === new Date().toDateString();
      days.push({ day: i, isCurrentMonth: true, isToday });
    }
    
    // Next month's leading days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false });
    }
    
    return days;
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const setCalendarView = (nextMonth, nextYear) => {
    const boundedYear = Math.min(2029, Math.max(2026, nextYear));
    const boundedMonth = Math.min(11, Math.max(0, nextMonth));
    const preferredDay = selectedCalendarDate?.getDate?.() || 1;
    const maxDay = new Date(boundedYear, boundedMonth + 1, 0).getDate();

    setCalendarMonth(boundedMonth);
    setCalendarYear(boundedYear);
    setSelectedCalendarDate(new Date(boundedYear, boundedMonth, Math.min(preferredDay, maxDay)));
  };

  // Helper component for the Workspace icons in the sidebar
  const WorkspaceIcon = ({ letter, colorClass }) => (
    <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white ${colorClass}`}>
      {letter}
    </div>
  );

  const orderedDocuments = [...documents].sort((a, b) => {
    if (!!a.pinned === !!b.pinned) {
      return 0;
    }
    return a.pinned ? -1 : 1;
  });

  const canShowComposeActions = Boolean(
    lastComposeRun
    && lastComposeRun.documentId === activeDocId
    && getPlainText(docBodyHtml).length
  );
  const pageNumberPositionClass = pageNumberPosition === 'left'
    ? 'left-12 text-left'
    : pageNumberPosition === 'right'
      ? 'right-12 text-right'
      : 'left-1/2 -translate-x-1/2 text-center';

  return (
    <div className="flex h-screen bg-[#FDFDFD] font-sans text-gray-800 overflow-hidden relative">
      
      {/* Dynamic Toast System */}
      {toastMessage && (
        <div className="absolute top-16 right-6 max-w-[380px] bg-white/95 backdrop-blur border border-violet-100 text-slate-700 text-xs font-medium px-4 py-2.5 rounded-xl shadow-[0_12px_35px_-18px_rgba(91,33,182,0.45)] z-[420] flex items-center gap-2 transition-all duration-300">
          <span className="inline-block w-2 h-2 rounded-full bg-violet-500"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {closeConfirmDocId && (
        <div className="absolute inset-0 z-50 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
          <div className="w-[420px] max-w-[90vw] rounded-xl bg-white border border-gray-100 shadow-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Close this document?</h3>
            <p className="text-xs text-gray-500 mb-4">You can still create a new one after closing. This action will remove the selected tab.</p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setCloseConfirmDocId(null)}
                className="px-3 py-1.5 rounded-lg text-xs border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmCloseDocument}
                className="px-3 py-1.5 rounded-lg text-xs bg-violet-600 text-white hover:bg-violet-700"
              >
                Close Document
              </button>
            </div>
          </div>
        </div>
      )}

      {workspaceModalOpen && (
        <div className="absolute inset-0 z-50 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
          <div className="w-[420px] max-w-[90vw] rounded-xl bg-white border border-gray-100 shadow-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              {workspaceModalMode === 'create' ? 'Create workspace' : 'Rename workspace'}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {workspaceModalMode === 'create'
                ? 'Give your new workspace a clear name.'
                : 'Update the workspace name.'}
            </p>
            <input
              value={workspaceNameInput}
              onChange={(e) => setWorkspaceNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  submitWorkspaceModal();
                }
              }}
              autoFocus
              placeholder="Workspace name"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 mb-4 outline-none focus:border-violet-400"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setWorkspaceModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitWorkspaceModal}
                className="px-3 py-1.5 rounded-lg text-xs bg-violet-600 text-white hover:bg-violet-700"
              >
                {workspaceModalMode === 'create' ? 'Create' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {shareModalOpen && (
        <div className="absolute inset-0 z-[520] bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-[640px] max-w-[95vw] rounded-2xl bg-white border border-slate-200 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.65)] p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Share from Compose</h3>
                <p className="text-xs text-slate-500 mt-1">{shareTargetDocTitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-5">
              {[
                { key: 'friends', label: 'Copy link', sub: 'Share instantly' },
                { key: 'apps', label: 'Native apps', sub: 'Use system sheet' },
                { key: 'downloads', label: 'Download', sub: 'Export file' },
              ].map((destination) => (
                <button
                  key={destination.key}
                  type="button"
                  onClick={() => setShareDestination(destination.key)}
                  className={`text-left rounded-xl border px-3 py-2.5 transition-colors ${shareDestination === destination.key ? 'border-violet-300 bg-violet-50/70 text-violet-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                  <div className="text-sm font-semibold">{destination.label}</div>
                  <div className="text-[11px] text-slate-500">{destination.sub}</div>
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block mb-2">Access level</label>
              <div className="flex flex-wrap items-center gap-2">
                {['Viewer', 'Commenter', 'Editor'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setShareAccess(level)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${shareAccess === level ? 'bg-violet-50 border-violet-300 text-violet-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block mb-2">File format</label>
              <div className="flex flex-wrap gap-2">
                {['Compose (.cmp)', 'PDF', 'DOC (Word-compatible)', 'Markdown', 'Plain Text', 'HTML'].map((format) => (
                  <button
                    key={format}
                    type="button"
                    onClick={() => setShareFormat(format)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs border transition-colors ${shareFormat === format ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>

            {shareDestination === 'friends' && (
              <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Share link</div>
                <div className="text-xs text-slate-600 break-all">{shareLink}</div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShareModalOpen(false)}
                className="px-3 py-2 rounded-lg text-xs border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleShareModalConfirm}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700"
              >
                {shareDestination === 'downloads' ? `Export ${shareFormat}` : shareDestination === 'apps' ? 'Share to Apps' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {previewAttachment && (
        <div className="absolute inset-0 z-[130] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-[640px] max-w-[95vw] max-h-[90vh] overflow-auto rounded-2xl bg-white border border-gray-200 shadow-2xl p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">{previewAttachment.name}</div>
                <div className="text-[11px] text-gray-500">{previewAttachment.type || 'Unknown type'} • {Math.round((previewAttachment.size || 0) / 1024)} KB</div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewAttachment(null)}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X size={14} />
              </button>
            </div>
            {previewAttachment.isImage ? (
              <img src={previewAttachment.url} alt={previewAttachment.name} className="w-full h-auto rounded-xl border border-gray-200" />
            ) : previewAttachment.type?.startsWith('audio/') ? (
              <audio controls src={previewAttachment.url} className="w-full" />
            ) : (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600">
                Preview is not available for this file type. It is still attached to your prompt context.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 1. Left Navigation Sidebar */}
      <div
        className="border-r border-gray-100 flex flex-col bg-[#FAFAFC] shrink-0 select-none overflow-hidden transition-[width] duration-200"
        style={{ width: leftSidebarOpen ? `${leftSidebarWidth}px` : '0px' }}
      >
        {/* Logo Area */}
        <div className="h-14 flex items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold text-gray-900 text-lg">
            {/* Custom Logo SVG - Elegant, minimalist "C" and "R" intersection */}
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-violet-600">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 12 10c3.1 0 5.89-1.41 1.77-5.5L12 13.5L8.5 17H6.5L12 11.5L17.5 17H15.5L12 13.5L15.5 10H19.5C21.1 12 22 14.4 22 12c0-5.523-4.477-10-10-10z" fill="currentColor" />
            </svg>
            <span className="tracking-tight text-gray-900">Regaarder Compose</span>
          </div>
        </div>

        <div className="px-4 py-3">
          <button 
            onClick={createNewComposition}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-lg py-2 flex items-center justify-center gap-2 font-medium text-sm transition-colors active:scale-95"
          >
            <Plus size={16} />
            New Composition
          </button>
        </div>

        <div className="px-4 pb-2">
          <div
            className="relative"
            onMouseEnter={() => setIsFormattingDropdownHovered(true)}
            onMouseLeave={() => setIsFormattingDropdownHovered(false)}
          >
            <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search compositions..." 
              className="w-full bg-white border border-gray-200 rounded-md py-1.5 pl-8 pr-2 text-sm focus:outline-none focus:border-violet-300"
            />
            <span className="absolute right-2.5 top-1.5 text-xs text-gray-400 border border-gray-200 rounded px-1">⌘ K</span>
          </div>
        </div>

        {/* Main Nav Links */}
        <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
          <button
            onClick={() => setActivePrimaryNav('home')}
            className={`w-full flex items-center gap-3 px-2 py-1.5 text-sm rounded-md transition-colors ${activePrimaryNav === 'home' ? 'bg-violet-50 text-violet-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Home size={16} /> Home
          </button>
          <button
            onClick={() => setActivePrimaryNav('library')}
            className={`w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md transition-colors ${activePrimaryNav === 'library' ? 'bg-violet-50 text-violet-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <div className="flex items-center gap-3">
              <BookOpen size={16} className={activePrimaryNav === 'library' ? 'text-violet-600' : ''} /> Library
            </div>
          </button>
          <button
            onClick={() => setActivePrimaryNav('drafts')}
            className={`w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md transition-colors ${activePrimaryNav === 'drafts' ? 'bg-violet-50 text-violet-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <div className="flex items-center gap-3">
              <FileText size={16} className={activePrimaryNav === 'drafts' ? 'text-violet-600' : ''} /> Drafts
            </div>
          </button>
          <button
            onClick={() => setActivePrimaryNav('inbox')}
            className={`w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md transition-colors ${activePrimaryNav === 'inbox' ? 'bg-violet-50 text-violet-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <div className="flex items-center gap-3">
              <Inbox size={16} /> Inbox
            </div>
            <span className="bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded-full font-medium">12</span>
          </button>
          <button className="w-full flex items-center gap-3 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
            <Star size={16} /> Starred
          </button>
          <button className="w-full flex items-center gap-3 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
            <Users size={16} /> Shared
          </button>
          <button
            onClick={() => {
              setActiveRightTab('memory');
              setRightSidebarOpen(true);
            }}
            className="w-full flex items-center gap-3 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Database size={16} /> Memory
          </button>
          <button className="w-full flex items-center gap-3 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors mb-4">
            <Trash size={16} /> Trash
          </button>

          {/* Workspaces Section */}
          <div className="flex items-center justify-between px-2 py-2 mt-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Workspaces</span>
            <button onClick={openCreateWorkspaceModal} className="text-gray-400 hover:text-gray-600">
              <Plus size={14} className="cursor-pointer" />
            </button>
          </div>
          
          <div className="space-y-1">
            {workspaces.map((workspace) => (
              <div key={workspace.id} className="relative">
                <button className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md font-medium transition-colors">
                  <div className="flex items-center gap-3">
                    <WorkspaceIcon letter={workspace.letter} colorClass={workspace.colorClass} /> {workspace.name}
                  </div>
                  <MoreHorizontal
                    size={14}
                    data-workspace-menu-root
                    className="text-gray-400"
                    onClick={(event) => {
                      event.stopPropagation();
                      closeTransientMenus();
                      setOpenWorkspaceMenuId((prev) => (prev === workspace.id ? null : workspace.id));
                    }}
                  />
                </button>

                {openWorkspaceMenuId === workspace.id && (
                  <div className="absolute right-2 top-9 z-30 w-28 bg-white border border-gray-200 rounded-lg shadow-lg p-1" data-workspace-menu-root>
                    <button
                      onClick={() => openRenameWorkspaceModal(workspace)}
                      className="w-full text-left px-2 py-1 text-xs rounded hover:bg-violet-50"
                    >
                      Rename
                    </button>
                  </div>
                )}

                {workspace.hasDocuments && (
                  <div className="ml-7 mt-1 space-y-0.5 border-l border-gray-200 pl-1">
                    {orderedDocuments.map((doc) => {
                      const label = doc.title?.trim() ? doc.title : UNTITLED_COMPOSITION_LABEL;
                      const isActive = activeDocId === doc.id;

                      return (
                        <button
                          key={doc.id}
                          onClick={() => switchDocument(doc.id)}
                          className={`w-full flex items-center justify-between pl-3 pr-2 py-1 text-sm rounded-r-md transition-colors ${isActive ? 'bg-violet-50 text-violet-700' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText size={14} className={isActive ? 'text-violet-500' : 'text-gray-400'} />
                            <span className="truncate">{doc.pinned ? '📌 ' : ''}{label}</span>
                          </div>
                          <MoreHorizontal size={14} className={isActive ? 'text-violet-400' : 'text-gray-300'} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Settings */}
        <div className="p-4 border-t border-gray-100 bg-[#FAFAFC]">
          <button className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900 w-full transition-colors">
            <Settings size={16} /> Settings
          </button>
        </div>
      </div>

      {leftSidebarOpen && (
        <div
          onMouseDown={(event) => beginPanelResize('left', event)}
          className="w-1 shrink-0 cursor-col-resize bg-transparent hover:bg-violet-100 active:bg-violet-200 transition-colors"
          aria-label="Resize left sidebar"
        />
      )}

      {/* 2. Main Editor Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white relative">
        
        {/* Top Header */}
        <div className="h-14 flex items-center justify-between px-6 border-b border-gray-100 shrink-0 select-none">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLeftSidebarOpen((prev) => !prev)}
              className="text-gray-400 hover:text-gray-600"
            >
              {leftSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>
            {isUnsavedDraftVisible && (
              <>
                {isEditingUnsavedDraftName ? (
                  <input
                    autoFocus
                    type="text"
                    value={unsavedDraftNameInput}
                    onChange={(e) => setUnsavedDraftNameInput(e.target.value)}
                    onBlur={commitUnsavedDraftRename}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        commitUnsavedDraftRename();
                      }
                      if (e.key === 'Escape') {
                        setIsEditingUnsavedDraftName(false);
                        setUnsavedDraftNameInput('');
                      }
                    }}
                    className="text-sm text-gray-500 font-medium italic bg-white border border-violet-200 rounded px-2 py-0.5 min-w-[180px] outline-none focus:border-violet-400"
                    placeholder="Rename draft"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={beginUnsavedDraftRename}
                    className="text-sm text-gray-400 font-medium italic hover:text-gray-600 px-1 py-0.5 rounded min-w-[110px] text-left"
                    title="Rename current draft"
                  >
                    {(documents.find((doc) => doc.id === activeDocId)?.title || docTitle || 'Unsaved draft').trim() || 'Unsaved draft'}
                  </button>
                )}
                <div className="flex items-center gap-1.5 text-xs text-gray-400 ml-2">
                  <Cloud size={14} /> Saved Just now
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button
                onClick={undoDocumentChange}
                className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 size={15} />
              </button>
              <button
                onClick={redoDocumentChange}
                className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 size={15} />
              </button>
              <button
                onClick={saveDocumentLocally}
                className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                title="Save locally (Ctrl+S)"
              >
                <Save size={15} />
              </button>
            </div>
            <button
              onClick={() => openShareModal(activeDocId || documents[0]?.id)}
              className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-1.5 rounded-md flex items-center gap-2 transition-all active:scale-95"
            >
              <Users size={16} /> Share
            </button>
            
            {/* Avatars */}
            <div className="flex -space-x-2">
              <img className="w-7 h-7 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Sarah" />
              <img className="w-7 h-7 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Alex" />
              <img className="w-7 h-7 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="Maya" />
            </div>

            <button className="text-gray-400 hover:text-gray-600 relative">
              <Bell size={18} />
              <span className="absolute -top-2 -right-0.5 w-1.5 h-1.5 bg-violet-500 rounded-full"></span>
            </button>
            <button 
              onClick={() => handleMiniSidebarClick('assistant')}
              className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${activeRightTab === 'assistant' && rightSidebarOpen ? 'bg-violet-100 text-violet-700' : 'bg-violet-50 text-violet-600 hover:bg-violet-100'}`}
            >
              <Sparkles size={14} />
            </button>
          </div>
        </div>

        <div className="h-10 border-b border-gray-100 px-4 flex items-center gap-2 overflow-visible no-scrollbar bg-[#FAFAFC] relative z-[140]">
          {orderedDocuments.map((doc) => {
            const label = doc.title?.trim() ? doc.title : UNTITLED_COMPOSITION_LABEL;
            const isActive = activeDocId === doc.id;

            return (
              <div
                key={doc.id}
                onClick={() => switchDocument(doc.id)}
                className={`relative shrink-0 px-2 py-1 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 ${isActive ? 'bg-white border-violet-200 text-violet-700' : 'bg-transparent border-transparent text-gray-500 hover:bg-white hover:border-gray-200'}`}
              >
                {renamingDocId === doc.id ? (
                  <input
                    autoFocus
                    value={renameDocValue}
                    onChange={(e) => setRenameDocValue(e.target.value)}
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        commitRenameDocument(doc.id);
                      }
                      if (event.key === 'Escape') {
                        setRenamingDocId(null);
                        setRenameDocValue('');
                      }
                    }}
                    onBlur={() => commitRenameDocument(doc.id)}
                    className="w-[160px] bg-white border border-violet-200 rounded px-1 py-0.5 text-xs outline-none"
                  />
                ) : (
                  <span className="max-w-[160px] truncate">{doc.pinned ? '📌 ' : ''}{label}</span>
                )}
                <button
                  data-doc-menu-root
                  onClick={(event) => {
                    event.stopPropagation();
                    closeTransientMenus();
                    setOpenDocMenuId((prev) => (prev === doc.id ? null : doc.id));
                  }}
                  className="p-0.5 rounded hover:bg-gray-100 shrink-0"
                  title="Document actions"
                >
                  <MoreHorizontal size={12} />
                </button>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    requestCloseDocument(doc.id);
                  }}
                  className="p-0.5 rounded hover:bg-rose-50 text-gray-400 hover:text-rose-600 shrink-0"
                  title="Close document"
                >
                  <X size={12} />
                </button>
                {openDocMenuId === doc.id && (
                  <div className="absolute right-0 top-full mt-1 z-[230] w-36 bg-white isolate border border-gray-200 rounded-lg shadow-2xl ring-1 ring-black/5 p-1" data-doc-menu-root>
                    <button onClick={(e) => { e.stopPropagation(); handleDocumentAction('rename', doc.id); }} className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-violet-50">Rename</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDocumentAction('save', doc.id); }} className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-violet-50">Save</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDocumentAction('share', doc.id); }} className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-violet-50">Share</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDocumentAction('pin', doc.id); }} className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-violet-50">{doc.pinned ? 'Unpin' : 'Pin'}</button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button onClick={(e) => { e.stopPropagation(); handleDocumentAction('close', doc.id); }} className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-rose-50 text-rose-600">Close</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Formatting Ribbon */}
        <div
          ref={formattingMenuRef}
          onMouseDown={(event) => {
            if (event.target.closest('button')) {
              event.preventDefault();
            }
          }}
          className="h-12 border-b border-gray-100 flex items-center px-6 gap-4 text-sm text-gray-600 shrink-0 overflow-visible no-scrollbar select-none relative z-[130]"
        >
          <div
            className="relative"
            onMouseEnter={() => setIsFormattingDropdownHovered(true)}
            onMouseLeave={() => setIsFormattingDropdownHovered(false)}
          >
            <button
              onClick={() => {
                closeTransientMenus();
                setOpenDropdown((prev) => (prev === 'heading' ? null : 'heading'));
              }}
              className="flex items-center gap-1 hover:bg-gray-50 px-2 py-1 rounded whitespace-nowrap shrink-0"
            >
              {editorHeading} <ChevronDown size={14} className="text-gray-400" />
            </button>
            {openDropdown === 'heading' && (
              <div className="absolute top-9 left-0 z-[230] w-44 bg-white isolate border border-gray-200 rounded-lg shadow-2xl ring-1 ring-black/5 p-2">
                <input
                  value={headingSearch}
                  onChange={(e) => setHeadingSearch(e.target.value)}
                  placeholder="Search heading"
                  className="w-full border border-gray-200 rounded px-2 py-1 text-xs mb-2 outline-none focus:border-violet-400"
                />
                <div className="max-h-40 overflow-y-auto">
                  {headingOptions
                    .filter((option) => option.toLowerCase().includes(headingSearch.toLowerCase()))
                    .map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          const nextHeading = headingMeta[option] || headingMeta.Paragraph;
                          setEditorHeading(option);
                          setEditorSize(nextHeading.size);
                          applyFormatCommand('formatBlock', nextHeading.tag);
                          applyFormatCommand('fontSize', String(nextHeading.size));
                          setOpenDropdown(null);
                        }}
                        className="w-full text-left px-2 py-1 rounded text-xs hover:bg-violet-50"
                      >
                        <span className={headingMeta[option]?.previewClass || 'text-xs'}>{option}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={createNewComposition}
            className="h-7 w-7 rounded-full border border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-gray-600 hover:text-violet-700 flex items-center justify-center"
            title="Create new composition"
            aria-label="Create new composition"
          >
            <Plus size={14} />
          </button>
          <div
            className="relative"
            onMouseEnter={() => setIsFormattingDropdownHovered(true)}
            onMouseLeave={() => setIsFormattingDropdownHovered(false)}
          >
            <button
              type="button"
              onClick={() => {
                closeTransientMenus();
                setOpenDropdown((prev) => (prev === 'page-number' ? null : 'page-number'));
              }}
              className="flex items-center gap-1 hover:bg-gray-50 px-2 py-1 rounded text-xs"
              title="Page numbering"
            >
              Page # <ChevronDown size={13} className="text-gray-400" />
            </button>
            {openDropdown === 'page-number' && (
              <div className="absolute top-9 left-0 z-[230] w-52 bg-white isolate border border-gray-200 rounded-lg shadow-2xl ring-1 ring-black/5 p-2 space-y-2">
                <button
                  type="button"
                  onClick={() => setShowPageNumbers((prev) => !prev)}
                  className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-violet-50"
                >
                  {showPageNumbers ? 'Hide page numbers' : 'Show page numbers'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPageNumberOnFirstPage((prev) => !prev)}
                  className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-violet-50"
                >
                  {showPageNumberOnFirstPage ? 'Hide on first page' : 'Show on first page'}
                </button>
                <div className="border-t border-gray-100 pt-1">
                  <div className="px-2 py-1 text-[10px] uppercase tracking-wide text-gray-400">Position</div>
                  <div className="grid grid-cols-3 gap-1 px-1 pb-1">
                    {['left', 'center', 'right'].map((position) => (
                      <button
                        key={position}
                        type="button"
                        onClick={() => setPageNumberPosition(position)}
                        className={`text-[11px] rounded px-2 py-1 border ${pageNumberPosition === position ? 'bg-violet-50 border-violet-200 text-violet-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      >
                        {position}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="w-px h-4 bg-gray-200"></div>
          <div
            className="relative"
            onMouseEnter={() => setIsFormattingDropdownHovered(true)}
            onMouseLeave={() => setIsFormattingDropdownHovered(false)}
          >
            <button
              onClick={() => {
                closeTransientMenus();
                setOpenDropdown((prev) => (prev === 'font' ? null : 'font'));
              }}
              className="flex items-center gap-1 hover:bg-gray-50 px-2 py-1 rounded"
            >
              {editorFont} <ChevronDown size={14} className="text-gray-400" />
            </button>
            {openDropdown === 'font' && (
              <div className="absolute top-9 left-0 z-[230] w-48 bg-white isolate border border-gray-200 rounded-lg shadow-2xl ring-1 ring-black/5 p-2">
                <input
                  value={fontSearch}
                  onChange={(e) => setFontSearch(e.target.value)}
                  placeholder="Search font"
                  className="w-full border border-gray-200 rounded px-2 py-1 text-xs mb-2 outline-none focus:border-violet-400"
                />
                <div className="max-h-40 overflow-y-auto">
                  {fontOptions
                    .filter((option) => option.toLowerCase().includes(fontSearch.toLowerCase()))
                    .map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setEditorFont(option);
                          applyFormatCommand('fontName', option);
                          setOpenDropdown(null);
                        }}
                        className="w-full text-left px-2 py-1 rounded text-xs hover:bg-violet-50"
                      >
                        {option}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
          <div className="w-px h-4 bg-gray-200"></div>
          <div
            className="relative flex items-center gap-1"
            onMouseEnter={() => setIsFormattingDropdownHovered(true)}
            onMouseLeave={() => setIsFormattingDropdownHovered(false)}
          >
            <input
              type="number"
              min={10}
              max={72}
              value={editorSize}
              onChange={(e) => {
                const nextSize = Number(e.target.value) || 32;
                setEditorSize(nextSize);
                applyFormatCommand('fontSize', String(nextSize));
              }}
              className="w-14 bg-transparent border border-transparent hover:border-gray-200 rounded px-1 py-0.5 focus:outline-none"
            />
            <button
              onClick={() => {
                closeTransientMenus();
                setOpenDropdown((prev) => (prev === 'size' ? null : 'size'));
              }}
            >
              <ChevronDown size={14} className="text-gray-400" />
            </button>
            {openDropdown === 'size' && (
              <div className="absolute top-9 left-0 z-[230] w-32 bg-white isolate border border-gray-200 rounded-lg shadow-2xl ring-1 ring-black/5 p-2">
                <input
                  value={sizeSearch}
                  onChange={(e) => setSizeSearch(e.target.value)}
                  placeholder="Search"
                  className="w-full border border-gray-200 rounded px-2 py-1 text-xs mb-2 outline-none focus:border-violet-400"
                />
                <div className="max-h-40 overflow-y-auto">
                  {sizeOptions
                    .filter((option) => String(option).includes(sizeSearch.trim()))
                    .map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setEditorSize(option);
                          applyFormatCommand('fontSize', String(option));
                          setOpenDropdown(null);
                        }}
                        className="w-full text-left px-2 py-1 rounded text-xs hover:bg-violet-50"
                      >
                        {option}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
          <div className="w-px h-4 bg-gray-200"></div>
          <div className="flex items-center gap-4">
            <button onClick={() => applyFormatCommand('bold')} className={`font-bold hover:text-gray-900 ${isBoldActive ? 'text-violet-600' : ''}`}>B</button>
            <button onClick={() => applyFormatCommand('italic')} className={`italic font-serif hover:text-gray-900 ${isItalicActive ? 'text-violet-600' : ''}`}>I</button>
            <button onClick={() => applyFormatCommand('underline')} className={`underline hover:text-gray-900 ${isUnderlineActive ? 'text-violet-600' : ''}`}>U</button>
            <button onClick={() => applyFormatCommand('strikeThrough')} className={`line-through hover:text-gray-900 ${isStrikeActive ? 'text-violet-600' : ''}`}>S</button>
            <div
              className="relative"
              onMouseEnter={() => setIsTextStyleMenuHovered(true)}
              onMouseLeave={() => setIsTextStyleMenuHovered(false)}
            >
              <button
                onClick={() => setTextStyleMenuOpen((prev) => !prev)}
                className="flex items-center gap-1.5 hover:text-gray-900 cursor-pointer pl-0.5"
              >
                <Type size={14} /> <ChevronDown size={12} className="text-gray-400" />
              </button>
              {textStyleMenuOpen && (
                <div className="absolute top-8 left-0 z-[230] w-32 bg-white isolate border border-gray-200 rounded-lg shadow-2xl ring-1 ring-black/5 p-1">
                  <button onClick={() => { applyFormatCommand('formatBlock', 'P'); setTextStyleMenuOpen(false); }} className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-violet-50">Body</button>
                  <button onClick={() => { applyFormatCommand('formatBlock', 'BLOCKQUOTE'); setTextStyleMenuOpen(false); }} className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-violet-50">Quote</button>
                  <button onClick={() => { applyFormatCommand('formatBlock', 'PRE'); setTextStyleMenuOpen(false); }} className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-violet-50">Code</button>
                </div>
              )}
            </div>
          </div>
          <div className="w-px h-4 bg-gray-200"></div>
          <button
            onClick={exportCurrentDocumentAsPdf}
            className="text-xs font-medium px-2 py-1 rounded hover:bg-violet-50 hover:text-violet-700"
            title="Convert current document to PDF"
          >
            PDF
          </button>
          <div className="w-px h-4 bg-gray-200"></div>
          <div className="flex items-center gap-3">
            <AlignLeft onClick={() => { setAlignMode('left'); applyFormatCommand('justifyLeft'); }} size={16} className={`${alignMode === 'left' ? 'text-violet-600' : 'hover:text-gray-900'} cursor-pointer`} />
            <AlignCenter onClick={() => { setAlignMode('center'); applyFormatCommand('justifyCenter'); }} size={16} className={`${alignMode === 'center' ? 'text-violet-600' : 'hover:text-gray-900'} cursor-pointer`} />
            <AlignRight onClick={() => { setAlignMode('right'); applyFormatCommand('justifyRight'); }} size={16} className={`${alignMode === 'right' ? 'text-violet-600' : 'hover:text-gray-900'} cursor-pointer`} />
            <List onClick={() => applyFormatCommand('insertUnorderedList')} size={16} className={`${isListActive ? 'text-violet-600' : 'hover:text-gray-900'} cursor-pointer`} />
          </div>
          <div className="w-px h-4 bg-gray-200"></div>
          <div className="flex items-center gap-3">
            <span className="font-serif italic font-bold hover:text-gray-900 cursor-pointer">∑</span>
          </div>
        </div>

        {/* Document Editor Content (Beautifully separated page area) */}
        <div className="flex-1 overflow-y-auto relative bg-[#F7F7F9] p-6 md:p-8 transition-opacity duration-300 opacity-100">
          <div
            className="mx-auto"
            style={{
              width: '100%',
              maxWidth: '850px',
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 180ms ease-out',
            }}
          >
          <div ref={documentCardRef} className="max-w-[850px] mx-auto bg-white rounded-[24px] shadow-[0_2px_24px_-4px_rgba(0,0,0,0.04)] border border-gray-100/70 px-12 md:px-16 pt-16 pb-36 min-h-[calc(100vh-13rem)] relative">
            
            {/* Title & Subtitle */}
            <div
              ref={titleEditableRef}
              contentEditable
              suppressContentEditableWarning
              onFocus={(e) => clearPlaceholderOnFocus(e, AI_NATIVE_PLACEHOLDER)}
              onInput={(e) => normalizeEditableDirection(e.currentTarget)}
              onPaste={(e) => handleEditablePaste(e, AI_NATIVE_PLACEHOLDER, (target) => setDocTitle(target.textContent || ''))}
              onBlur={(e) => setDocTitle(e.currentTarget.textContent || '')}
              dir="ltr"
              style={{ fontSize: `${editorSize}px`, fontFamily: editorFont, textAlign: alignMode, direction: 'ltr', unicodeBidi: 'plaintext' }}
              className="w-full text-gray-900 leading-tight mb-2 tracking-tight border-none outline-none focus:ring-0 bg-transparent font-semibold"
            >
              {docTitle || AI_NATIVE_PLACEHOLDER}
            </div>
            
            <div
              ref={subtitleEditableRef}
              contentEditable
              suppressContentEditableWarning
              onFocus={(e) => clearPlaceholderOnFocus(e, AI_NATIVE_PLACEHOLDER)}
              onInput={(e) => normalizeEditableDirection(e.currentTarget)}
              onPaste={(e) => handleEditablePaste(e, AI_NATIVE_PLACEHOLDER, (target) => setDocSubtitle(target.textContent || ''))}
              onBlur={(e) => setDocSubtitle(e.currentTarget.textContent || '')}
              dir="ltr"
              style={{ fontFamily: editorFont, textAlign: alignMode, direction: 'ltr', unicodeBidi: 'plaintext' }}
              className="w-full text-[17px] text-gray-500 mb-10 leading-relaxed max-w-2xl border-none outline-none resize-none focus:ring-0 bg-transparent min-h-14"
            >
              {docSubtitle || AI_NATIVE_PLACEHOLDER}
            </div>

            {isBlankDocument && (
              <>
                <div
                  ref={blankBodyRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => normalizeEditableDirection(e.currentTarget)}
                  onPaste={(e) => handleEditablePaste(e, AI_NATIVE_PLACEHOLDER, (target) => setDocBodyHtml(target.innerHTML))}
                  onBlur={(e) => setDocBodyHtml(e.currentTarget.innerHTML)}
                  dir="ltr"
                  className="mb-4 min-h-[220px] outline-none text-sm text-gray-700 leading-relaxed relative"
                  style={{ fontFamily: editorFont, textAlign: alignMode, direction: 'ltr', unicodeBidi: 'plaintext' }}
                  dangerouslySetInnerHTML={{ __html: docBodyHtml }}
                />
                {canShowComposeActions && (
                  <div className="mb-8 flex items-center justify-end gap-2">
                    <button type="button" onClick={handleComposeAccept} className="px-2.5 py-1.5 text-[11px] rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50">Accept</button>
                    <button type="button" onClick={handleComposeRetry} className="px-2.5 py-1.5 text-[11px] rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">Retry</button>
                    <button type="button" onClick={handleComposeUndo} className="px-2.5 py-1.5 text-[11px] rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">Undo</button>
                    <button type="button" onClick={handleComposeDelete} className="px-2.5 py-1.5 text-[11px] rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50">Delete</button>
                    <button type="button" onClick={() => setLastComposeRun(null)} className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100" title="Dismiss actions">
                      <X size={12} />
                    </button>
                  </div>
                )}
              </>
            )}

            {!isBlankDocument && (
              <>
                {/* 1. Objective */}
                <div className="mb-10 group relative">
                  <h2 contentEditable suppressContentEditableWarning className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-4 outline-none">
                    <span className="text-2xl">🎯</span> 1. Objective
                  </h2>
                  <p contentEditable suppressContentEditableWarning className="text-gray-600 text-base leading-relaxed outline-none">
                    Launch Regaarder Compose to establish it as the most intuitive AI-native productivity workspace for modern teams and individuals.
                  </p>
                </div>

                {/* 2. Key Initiatives Table */}
                <div className="mb-10 group relative">
                  <h2 contentEditable suppressContentEditableWarning className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-4 outline-none">
                    <span className="text-2xl">🚀</span> 2. Key Initiatives
                    <span className="text-[10px] font-normal text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">Click Status to Cycle</span>
                  </h2>
                  
                  <div className="border border-gray-100 rounded-lg overflow-hidden mt-6 bg-[#FAFAFC]/30">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#FAFAFC] text-gray-500 font-medium border-b border-gray-100">
                        <tr>
                          <th className="py-3 px-4 w-[40%] font-medium">Initiative</th>
                          <th className="py-3 px-4 font-medium">Owner</th>
                          <th className="py-3 px-4 font-medium">Timeline</th>
                          <th className="py-3 px-4 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-gray-700">
                        {initiatives.map((row) => (
                          <tr key={row.id} className="hover:bg-white/60 transition-colors">
                            <td contentEditable suppressContentEditableWarning className="py-3 px-4 font-medium outline-none">{row.name}</td>
                            <td contentEditable suppressContentEditableWarning className="py-3 px-4 text-gray-500 outline-none">{row.owner}</td>
                            <td contentEditable suppressContentEditableWarning className="py-3 px-4 text-gray-500 text-xs outline-none">{row.timeline}</td>
                            <td className="py-3 px-4">
                              <button 
                                onClick={() => toggleStatus(row.id)}
                                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                                  row.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                  row.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                  'bg-violet-50 text-violet-600 border border-violet-100'
                                }`}
                              >
                                {row.status}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. Target Audience */}
                <div className="mb-10">
                  <h2 contentEditable suppressContentEditableWarning className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-4 outline-none">
                    <span className="text-2xl">👥</span> 3. Target Audience
                  </h2>
                  <p contentEditable suppressContentEditableWarning className="text-gray-600 text-base leading-relaxed outline-none">
                    Knowledge workers, founders, creators, marketers, and teams who want a smarter, calmer, and more connected workspace.
                  </p>
                </div>
              </>
            )}

            {/* Dynamic AI Appended Sections */}
            {!isBlankDocument && appendedSections.map((sec, idx) => (
              <div 
                key={idx} 
                className="mb-10 border-t border-dashed border-violet-100 pt-8 animate-fade-in group relative"
              >
                <div className="absolute -top-3 left-4 bg-violet-600 text-[10px] text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <Sparkles size={8} /> AI Composed
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-4">
                  {sec.title}
                </h2>

                {sec.type === 'timeline' && (
                  <div className="space-y-3 mt-4">
                    {sec.content.map((item, i) => (
                      <div key={i} className="flex gap-4 p-3 bg-violet-50/20 border border-violet-100/50 rounded-lg">
                        <div className="text-xs font-semibold text-violet-600 bg-white px-2 py-1 rounded h-fit shadow-xs">
                          {item.dates}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-800">{item.phase}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{item.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {sec.type === 'tasks' && (
                  <div className="bg-[#FAFAFC] p-4 rounded-lg border border-gray-100 space-y-2.5">
                    {sec.content.map((taskStr, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                        <div className="w-4 h-4 rounded-full border border-violet-400 flex items-center justify-center bg-white text-white">
                          <Check size={10} className="stroke-[3]" />
                        </div>
                        <span>{taskStr}</span>
                      </div>
                    ))}
                  </div>
                )}

                {sec.type === 'risks' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sec.content.map((riskObj, i) => (
                      <div key={i} className="p-4 rounded-xl border border-rose-100 bg-rose-50/10 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-rose-600 flex items-center gap-1 uppercase tracking-wide">
                            <ShieldAlert size={12} /> Risk Factor
                          </span>
                          <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded">
                            Impact: {riskObj.impact}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-gray-800">{riskObj.threat}</h4>
                        <p className="text-xs text-gray-500 bg-white p-2 rounded border border-gray-100 mt-1">
                          <span className="font-semibold text-gray-700">Mitigation:</span> {riskObj.fix}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {sec.type === 'text' && (
                  <p className="text-gray-600 text-base leading-relaxed bg-violet-50/10 p-4 rounded-lg border border-violet-100/30">
                    {sec.paragraph}
                  </p>
                )}
              </div>
            ))}

            {showPageNumbers && showPageNumberOnFirstPage && (
              <div className={`absolute bottom-10 ${pageNumberPositionClass} text-[11px] font-medium text-gray-400`}>
                1
              </div>
            )}

            {/* Composing / Analyzing State Glow */}
            {isComposing && (
              <div className="absolute inset-0 z-30 bg-white/85 backdrop-blur-[2px] flex items-center justify-center px-6">
                <div className="w-full max-w-xl rounded-2xl border border-violet-100 bg-white shadow-[0_20px_50px_-20px_rgba(109,40,217,0.35)] p-5">
                  <div className="flex items-center gap-2 text-violet-700 mb-3">
                    <Loader2 className="animate-spin" size={16} />
                    <span className="text-xs font-semibold tracking-wide">Provisioning your composition</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 rounded bg-violet-100/70 animate-pulse w-4/5"></div>
                    <div className="h-3 rounded bg-violet-100/70 animate-pulse w-full"></div>
                    <div className="h-3 rounded bg-violet-100/70 animate-pulse w-3/4"></div>
                    <div className="h-3 rounded bg-violet-100/70 animate-pulse w-5/6"></div>
                  </div>
                  <p className="mt-3 text-[11px] text-gray-500">Structuring headings, sections, and action-ready blocks.</p>
                </div>
              </div>
            )}

          </div>
          </div>
        </div>

        {/* Persistent Floating AI Prompt Bar */}
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-14 z-[320] transition-all duration-500 ease-out ${(!isPromptAutoVisible || isPromptMinimized || (isVoiceActive && voiceTarget === 'document')) ? 'opacity-0 translate-y-6' : 'opacity-100 translate-y-0'}`}
          style={{ transform: `translateY(${promptOffset.y}px)` }}
        >
          <div className={`max-w-[850px] mx-auto px-12 md:px-16 flex ${alignMode === 'left' ? 'justify-start' : alignMode === 'right' ? 'justify-end' : 'justify-center'}`} style={{ transform: `translateX(${promptOffset.x}px)` }}>
          <form
            ref={promptRootRef}
            onSubmit={handleFloatingSend}
            className={`relative bg-white border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] flex items-end px-2 py-1.5 hover:border-violet-200 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all duration-500 ${isPromptExpanded ? 'rounded-xl' : 'rounded-2xl'} ${isVoiceActive && voiceTarget === 'document' ? 'pointer-events-none' : 'pointer-events-auto'}`}
            style={{ width: `${Math.max(320, Math.min(promptWidth, isPromptExpanded ? 860 : 700))}px`, maxWidth: '100%' }}
          >
            {isPromptExpanded && (
              <button
                type="button"
                onClick={() => setIsPromptMinimized(true)}
                className="absolute right-2 top-2 p-1 rounded-md text-gray-400 hover:text-violet-700 hover:bg-violet-50"
                title="Minimize AI prompt"
              >
                <X size={14} />
              </button>
            )}
            <button
              type="button"
              onPointerDown={(event) => beginPanelResize('prompt', event)}
              className="p-2.5 rounded-lg bg-violet-50/70 text-violet-400 hover:bg-violet-100 hover:text-violet-600 cursor-move touch-none shrink-0"
              title="Move prompt bar"
            >
              <Move size={14} />
            </button>
            <div className="flex items-center gap-3 px-2 flex-1 min-w-0">
              <div className="relative shrink-0 self-start mt-1" ref={promptMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    closeTransientMenus();
                    setIsPromptMenuOpen((prev) => !prev);
                  }}
                  className={`p-2 rounded-full transition-colors ${isPromptMenuOpen ? 'bg-violet-50 text-violet-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                  title="Add files, images, audio, or open prompt library"
                >
                  <Plus size={16} />
                </button>
                {isPromptMenuOpen && (
                  <div className="absolute left-0 bottom-full mb-1 bg-white isolate border border-gray-200 rounded-lg shadow-2xl ring-1 ring-black/5 p-1 w-[210px] z-[9999]">
                    <button
                      type="button"
                      onClick={() => {
                        promptAudioInputRef.current?.click();
                        setIsPromptMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Upload size={14} />
                      <span>Audio</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        promptFileInputRef.current?.click();
                        setIsPromptMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    >
                      <File size={14} />
                      <span>Files</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        promptFileInputRef.current?.click();
                        setIsPromptMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    >
                      <FileText size={14} />
                      <span>Images</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPromptLibraryOpen(true);
                        setIsPromptMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    >
                      <BookOpen size={14} />
                      <span>Prompt library</span>
                    </button>
                  </div>
                )}
              </div>
              {isPromptExpanded ? (
                <div className="flex-1 min-w-0 space-y-2 py-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold text-gray-500">Compose format</span>
                    <div className="relative" ref={promptFormatRef}>
                      <button
                        type="button"
                        onClick={() => {
                          closeTransientMenus();
                          setPromptFormatMenuOpen((prev) => !prev);
                        }}
                        className="inline-flex items-center gap-2 bg-violet-50/70 border border-violet-200 rounded-lg px-2.5 py-1.5 text-xs text-violet-700 hover:bg-violet-100"
                      >
                        <span>{composeOutputFormat}</span>
                        <ChevronDown size={12} />
                      </button>
                      {promptFormatMenuOpen && (
                        <div className="absolute left-0 bottom-full mb-1 w-56 bg-white border border-gray-200 rounded-xl shadow-xl p-1 z-[9999]">
                          {composeFormatOptions.map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                setComposeOutputFormat(option);
                                setPromptFormatMenuOpen(false);
                              }}
                              className={`w-full text-left px-2.5 py-2 rounded-lg text-xs ${composeOutputFormat === option ? 'bg-violet-50 text-violet-700' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="relative" ref={promptTuneRef}>
                      <button
                        type="button"
                        onClick={() => {
                          closeTransientMenus();
                          setPromptTuneMenuOpen((prev) => !prev);
                        }}
                        className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
                      >
                        <Settings size={12} />
                        <span>Tune</span>
                      </button>
                      {promptTuneMenuOpen && (
                        <div className="absolute left-0 bottom-full mb-1 w-64 bg-white border border-gray-200 rounded-xl shadow-xl p-3 z-[9999] space-y-3">
                          <div>
                            <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Style</div>
                            <div className="flex flex-wrap gap-1.5">
                              {promptToneOptions.map((toneOption) => (
                                <button
                                  key={toneOption.key}
                                  type="button"
                                  onClick={() => setPromptTone(toneOption.key)}
                                  className={`px-2 py-1 rounded-full text-[10px] border ${promptTone === toneOption.key ? 'bg-violet-50 border-violet-300 text-violet-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                >
                                  {toneOption.label}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Length target</div>
                            <div className="flex items-center gap-2 mb-2">
                              <button
                                type="button"
                                onClick={() => setPromptLengthMode('words')}
                                className={`px-2 py-1 rounded text-[10px] border ${promptLengthMode === 'words' ? 'bg-violet-50 border-violet-300 text-violet-700' : 'border-gray-200 text-gray-600'}`}
                              >
                                Words
                              </button>
                              <button
                                type="button"
                                onClick={() => setPromptLengthMode('characters')}
                                className={`px-2 py-1 rounded text-[10px] border ${promptLengthMode === 'characters' ? 'bg-violet-50 border-violet-300 text-violet-700' : 'border-gray-200 text-gray-600'}`}
                              >
                                Characters
                              </button>
                            </div>
                            <input
                              type="number"
                              min={40}
                              max={3000}
                              value={promptLengthValue}
                              onChange={(e) => setPromptLengthValue(Math.max(40, Math.min(3000, Number(e.target.value) || 220)))}
                              className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 outline-none focus:border-violet-400"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400">{promptTone} • ~{promptLengthValue} {promptLengthMode}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {['Timeline', 'Article', 'Checklist', 'Presentation Draft'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setComposeOutputFormat(preset)}
                          className={`px-2 py-1 rounded-full text-[10px] border ${composeOutputFormat === preset ? 'bg-violet-50 border-violet-300 text-violet-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                  {composeOutputFormat === 'Custom...' && (
                    <input
                      type="text"
                      value={customComposeFormat}
                      onChange={(e) => setCustomComposeFormat(e.target.value)}
                      placeholder="Enter custom format (e.g. investor memo, press release)"
                      className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 outline-none focus:border-violet-400"
                    />
                  )}
                  {selectedEditorText && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                      <span className="font-semibold text-violet-600">Selected text</span>
                      <span className="truncate">{selectedEditorText}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEditorText('');
                          selectedEditorTextRef.current = '';
                        }}
                        className="ml-auto text-gray-400 hover:text-gray-700"
                        title="Detach selected text"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                  {promptAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {promptAttachments.map((attachment) => (
                        <button
                          key={attachment.id}
                          type="button"
                          onClick={() => setPreviewAttachment(attachment)}
                          className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-2 py-1 text-[11px] text-gray-600 max-w-[210px]"
                          title="Click to preview"
                        >
                          {attachment.isImage ? (
                            <img src={attachment.url} alt={attachment.name} className="w-4 h-4 rounded object-cover" />
                          ) : (
                            <File size={12} className="text-gray-400" />
                          )}
                          <span className="truncate">{attachment.name}</span>
                          <span
                            onClick={(event) => {
                              event.stopPropagation();
                              removePromptAttachment(attachment.id);
                            }}
                            className="text-gray-400 hover:text-gray-700"
                            title="Remove"
                          >
                            <X size={12} />
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  <textarea
                    ref={floatingPromptRef}
                    value={floatingPrompt}
                    onChange={(e) => setFloatingPrompt(e.target.value)}
                    onPaste={handleFloatingPaste}
                    onInput={(e) => autoResizeTextarea(e.currentTarget, 360)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleFloatingSend(e);
                      }
                    }}
                    placeholder="Describe what you need. Compose will build it into your document."
                    rows={1}
                    style={{ textAlign: alignMode }}
                    className="w-full bg-transparent border-none focus:outline-none text-sm text-gray-700 placeholder-gray-400 py-1 resize-y min-h-[42px] max-h-[360px]"
                  />
                </div>
              ) : (
                <textarea
                  value={floatingPrompt}
                  onChange={(e) => setFloatingPrompt(e.target.value)}
                  onInput={(e) => autoResizeTextarea(e.currentTarget, 120)}
                  placeholder="Ask Compose AI..."
                  rows={1}
                  style={{ textAlign: alignMode }}
                  className="w-full bg-transparent border-none focus:outline-none text-sm text-gray-700 placeholder-gray-400 py-2 resize-y min-h-[38px] max-h-[120px]"
                />
              )}
            </div>
            <div className="flex items-center gap-2 pr-1 shrink-0">
              <input
                ref={promptAudioInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handlePromptAudioUpload}
              />
              <button
                type="button"
                onClick={() => setIsPromptExpanded((prev) => !prev)}
                className={`p-2 rounded-full transition-colors ${isPromptExpanded ? 'bg-violet-50 text-violet-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                title="Expand prompt input"
              >
                <Expand size={16} />
              </button>
              <button
                type="button"
                onClick={async () => {
                  await toggleVoiceRecording('compose');
                }}
                className={`relative p-2 rounded-full transition-all ${isVoiceActive && voiceTarget === 'compose' ? 'text-violet-600 bg-violet-50 shadow-[0_0_0_2px_rgba(139,92,246,0.22),0_0_18px_rgba(139,92,246,0.55)]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                title={isVoiceActive && voiceTarget === 'compose' ? 'Stop live transcription' : 'Start live transcription'}
              >
                <Mic size={16} className={isVoiceActive && voiceTarget === 'compose' ? 'animate-pulse' : ''} />
                {isVoiceActive && voiceTarget === 'compose' && (
                  <>
                    <span className="absolute inset-0 rounded-full border border-violet-400/70 animate-ping"></span>
                    <span className="absolute -inset-1 rounded-full border border-violet-300/60 animate-pulse"></span>
                  </>
                )}
              </button>
              <div className="relative hidden" ref={promptLibraryRef}>
                <button
                  type="button"
                  onClick={() => {
                    closeTransientMenus();
                    setPromptLibraryOpen((prev) => !prev);
                  }}
                  className={`p-2 rounded-full transition-colors ${promptLibraryOpen ? 'bg-violet-50 text-violet-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                  title="Prompt library"
                >
                  <BookOpen size={16} />
                </button>
                {promptLibraryOpen && (
                  <div className="absolute right-0 bottom-full mb-1 w-[320px] bg-white border border-gray-200 rounded-xl shadow-2xl p-3 z-[9999]">
                    <div className="text-xs font-semibold text-gray-700 mb-2">Prompt Library</div>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={promptHistorySearch}
                        onChange={(e) => setPromptHistorySearch(e.target.value)}
                        placeholder="Search prompts"
                        className="flex-1 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 outline-none focus:border-violet-400"
                      />
                      <div className="relative" ref={promptHistoryFilterRef}>
                        <button
                          type="button"
                          onClick={() => setPromptHistoryFilterMenuOpen((prev) => !prev)}
                          className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700"
                        >
                          <span>{promptHistoryFilter === 'all' ? 'All' : promptHistoryFilter === 'compose' ? 'Compose' : 'Chat'}</span>
                          <ChevronDown size={12} />
                        </button>
                        {promptHistoryFilterMenuOpen && (
                          <div className="absolute right-0 bottom-full mb-1 bg-white border border-gray-200 rounded-xl shadow-lg p-1.5 z-[9999] min-w-[130px]">
                            {[
                              { key: 'all', label: 'All' },
                              { key: 'compose', label: 'Compose' },
                              { key: 'chat', label: 'Chat' },
                            ].map((filterOption) => (
                              <button
                                key={filterOption.key}
                                type="button"
                                onClick={() => {
                                  setPromptHistoryFilter(filterOption.key);
                                  setPromptHistoryFilterMenuOpen(false);
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs ${promptHistoryFilter === filterOption.key ? 'bg-violet-50 text-violet-700 border border-violet-200' : 'text-gray-700 hover:bg-gray-50 border border-transparent'}`}
                              >
                                {filterOption.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                      {filteredPromptHistory.length === 0 && (
                        <div className="text-[11px] text-gray-500 py-3 text-center">No saved prompts yet.</div>
                      )}
                      {filteredPromptHistory.map((entry) => (
                        <div key={entry.id} className="p-2 rounded-lg border border-gray-100 hover:border-violet-200 hover:bg-violet-50/40">
                          {editingPromptId === entry.id ? (
                            <>
                              <textarea
                                value={editingPromptValue}
                                onChange={(e) => setEditingPromptValue(e.target.value)}
                                rows={2}
                                className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 outline-none focus:border-violet-400 resize-none"
                              />
                              <div className="mt-1.5 flex items-center justify-end gap-1.5">
                                <button type="button" onClick={cancelPromptEdit} className="px-2 py-1 text-[10px] rounded border border-gray-200 text-gray-600">Cancel</button>
                                <button type="button" onClick={() => savePromptEdit(entry.id)} className="px-2 py-1 text-[10px] rounded bg-violet-600 text-white">Save</button>
                              </div>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setFloatingPrompt(entry.text || '');
                                  if (entry.format) {
                                    setComposeOutputFormat(entry.format);
                                  }
                                  if (entry.tone) {
                                    setPromptTone(entry.tone);
                                  }
                                  if (entry.lengthMode) {
                                    setPromptLengthMode(entry.lengthMode);
                                  }
                                  if (entry.lengthValue) {
                                    setPromptLengthValue(entry.lengthValue);
                                  }
                                  setPromptLibraryOpen(false);
                                }}
                                className="w-full text-left"
                              >
                                <div className="text-[11px] text-gray-700 line-clamp-2">{entry.text}</div>
                              </button>
                              <div className="mt-1 flex items-center justify-between gap-2">
                                <div className="text-[10px] text-gray-400">{entry.source} • {entry.tone} • ~{entry.lengthValue} {entry.lengthMode}</div>
                                <button type="button" onClick={() => beginPromptEdit(entry)} className="text-[10px] text-violet-600 hover:text-violet-700">Edit</button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <input
                ref={promptFileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(event) => {
                  attachFilesToPrompt(event.target.files);
                  event.target.value = '';
                }}
              />
              <button
                type="button"
                onClick={() => promptFileInputRef.current?.click()}
                className="p-2 rounded-full transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                title="Attach files"
              >
                <Upload size={16} />
              </button>
              <button
                type="submit"
                disabled={isComposing}
                className={`text-white p-2 rounded-full transition-colors flex items-center justify-center h-8 w-8 active:scale-90 ${isComposing ? 'bg-violet-300 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-700'}`}
              >
                {isComposing ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              </button>
            </div>
          </form>
          </div>
                  className="bg-white rounded-2xl p-2.5 border border-violet-100 space-y-2 pointer-events-auto"

        {!isComposing && (
          <div
            className="pointer-events-none absolute left-6 bottom-24 z-[338]"
            style={{ transform: `translate(${dictationOffset.x}px, ${-dictationOffset.y}px)` }}
          >
            <div className="pointer-events-auto flex flex-col items-center gap-3">
              <button
                type="button"
                onPointerDown={(event) => beginPanelResize('dictation', event)}
                className="h-7 w-7 rounded-full bg-white/95 border border-gray-200 text-gray-400 hover:text-violet-600 hover:border-violet-200 cursor-move touch-none flex items-center justify-center"
                title="Move dictation control"
              >
                <Move size={13} />
              </button>
              <button
                type="button"
                onClick={async () => {
                  await toggleVoiceRecording('document');
                }}
                className={`relative w-24 h-24 rounded-full border transition-all ${isVoiceActive && voiceTarget === 'document' ? 'border-violet-400 bg-violet-50 shadow-[0_0_0_6px_rgba(139,92,246,0.18),0_0_35px_rgba(139,92,246,0.55)]' : 'border-gray-200 bg-white/95 hover:border-violet-300 hover:bg-violet-50/70'}`}
                title={isVoiceActive && voiceTarget === 'document' ? 'Stop document voice transcription' : 'Start document voice transcription'}
              >
                <Mic size={34} className={`mx-auto ${isVoiceActive && voiceTarget === 'document' ? 'text-violet-600 animate-pulse' : 'text-gray-500'}`} />
                {isVoiceActive && voiceTarget === 'document' && (
                  <>
                    <span className="absolute inset-0 rounded-full border-2 border-violet-300 animate-ping"></span>
                    <span className="absolute -inset-2 rounded-full border border-violet-200/80 animate-pulse"></span>
                  </>
                )}
              </button>
              <div className="text-[11px] text-gray-500 bg-white/95 border border-gray-200 rounded-full px-3 py-1">
                {isVoiceActive && voiceTarget === 'document' ? (liveSpeechInterimText || 'Listening... start speaking') : 'Voice dictation'}
              </div>
              {isVoiceActive && voiceTarget === 'document' && (
                <button
                  type="button"
                  onClick={() => {
                    try {
                      speechRecognitionRef.current?.stop();
                    } catch (_error) {
                      // noop
                    }
                    setIsVoiceActive(false);
                    setLiveSpeechInterimText('');
                  }}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    try {
                      speechRecognitionRef.current?.stop();
                    } catch (_error) {
                      // noop
                    }
                    setIsVoiceActive(false);
                    setLiveSpeechInterimText('');
                  }}
                  className="text-[11px] text-violet-700 bg-white/95 border border-violet-200 rounded-full px-3 py-1 hover:bg-violet-50"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        )}

        {isPromptMinimized && (
          <div
            className="pointer-events-none absolute left-6 top-20 z-[340]"
            style={{ transform: `translate(${miniPromptOffset.x}px, ${miniPromptOffset.y}px)` }}
          >
            <div className="pointer-events-auto flex items-center gap-2">
              <button
                type="button"
                onPointerDown={(event) => beginPanelResize('miniPrompt', event)}
                className="h-8 w-8 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-violet-600 hover:border-violet-200 cursor-move touch-none flex items-center justify-center shadow-sm"
                title="Move AI bubble"
              >
                <Move size={14} />
              </button>
              <button
                type="button"
                onClick={() => setIsPromptMinimized(false)}
                className="h-12 w-12 rounded-full bg-violet-600 text-white shadow-[0_12px_30px_-10px_rgba(124,58,237,0.7)] hover:bg-violet-700 transition-all"
                title="Open AI prompt"
              >
                <PenTool size={18} className="mx-auto" />
              </button>
            </div>
          </div>
        )}

        {/* Bottom Status Bar */}
        <div className="h-10 border-t border-gray-100 flex items-center justify-between px-6 text-xs text-gray-500 bg-white shrink-0 select-none">
          <div className="flex items-center gap-6">
            <span title="Real-time document stats">{documentStats.words} words • {documentStats.characters} characters</span>
            <div className="relative">
              <button
                data-language-menu-root
                onClick={() => {
                  closeTransientMenus();
                  setLanguageMenuOpen((prev) => !prev);
                }}
                className="flex items-center gap-1 cursor-pointer hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-50"
              >
                {getDisplayLanguageLabel()} <ChevronDown size={12} />
              </button>
              {languageMenuOpen && (
                <div className="absolute left-0 bottom-full mb-1 z-40 w-40 bg-white border border-gray-200 rounded-lg shadow-lg p-1" data-language-menu-root>
                  {['Auto detect', 'English (US)', 'English (UK)', 'Spanish', 'French', 'German', 'Chinese'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setCurrentLanguage(lang);
                        setLanguageMenuOpen(false);
                        showToast(`Language set to ${lang}`);
                      }}
                      className={`w-full text-left px-2 py-1.5 text-xs rounded transition-colors ${currentLanguage === lang ? 'bg-violet-50 text-violet-700' : 'hover:bg-gray-50'}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setIsFocusMode((prev) => !prev)}
              className={`px-2 py-1 rounded transition-colors ${isFocusMode ? 'bg-violet-100 text-violet-700' : 'hover:bg-gray-50 hover:text-gray-700'}`}
              title="Toggle focus mode"
            >
              {isFocusMode ? 'Exit Focus Mode' : 'Focus Mode'}
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-gray-400">
              <button onClick={() => { setActiveDocView('document'); showToast('Document view active'); }} className={`p-1 rounded ${activeDocView === 'document' ? 'text-violet-600 bg-violet-50' : 'hover:text-gray-600'}`} title="Document view"><FileText size={14} /></button>
              <button onClick={() => setTextStyleMenuOpen((prev) => !prev)} className="p-1 rounded hover:text-gray-600" title="Text style options"><Type size={14} /></button>
              <button onClick={() => { setRightSidebarOpen((prev) => !prev); }} className="p-1 rounded hover:text-gray-600" title="Toggle right panel"><LayoutGrid size={14} /></button>
              <button onClick={() => showToast('Quality review complete: no critical formatting issues')} className="p-1 rounded hover:text-gray-600" title="Run quick quality check"><AlertTriangle size={14} /></button>
            </div>
            <div className="relative flex items-center gap-2">
              <button onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))} className="text-gray-400 hover:text-gray-600 px-1.5 py-1 hover:bg-gray-50 rounded" title="Zoom out">−</button>
              <span className="w-8 text-center cursor-default">{zoomLevel}%</span>
              <button onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))} className="text-gray-400 hover:text-gray-600 px-1.5 py-1 hover:bg-gray-50 rounded" title="Zoom in">+</button>
              <ChevronDown size={12} className="cursor-pointer text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {!shareModalOpen && rightSidebarOpen && (
        <div
          onMouseDown={(event) => beginPanelResize('right', event)}
          className="w-1 shrink-0 cursor-col-resize bg-transparent hover:bg-violet-100 active:bg-violet-200 transition-colors"
          aria-label="Resize right sidebar"
        />
      )}

      {/* 3. Right Sidebar (AI Assistant / Smart Chat / Tools) */}
      <div 
        className={`border-l border-gray-100 flex flex-col bg-white shrink-0 transition-[width] duration-300 relative z-[260] ${
          rightSidebarOpen && !shareModalOpen ? '' : 'w-0 overflow-hidden border-l-0'
        }`}
        style={{ width: rightSidebarOpen && !shareModalOpen ? `${rightSidebarWidth}px` : '0px' }}
      >
        {/* Sidebar Header Tabs */}
        <div className="flex border-b border-gray-100 text-xs font-semibold select-none bg-[#FAFAFC]">
          <div
            className="flex-1 min-w-0 overflow-x-auto no-scrollbar"
            tabIndex={0}
            onKeyDown={handleRightSidebarTabsKeyDown}
            aria-label="Right panel tabs"
          >
            <div className="inline-flex min-w-max">
              {[
                { key: 'chat', label: 'AI Chat' },
                { key: 'assistant', label: 'AI Assistant' },
                { key: 'tasks', label: `Tasks (${tasks.filter((t) => !t.completed).length})` },
                { key: 'calendar', label: 'Schedule' },
                { key: 'memory', label: 'Memory' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  className={`shrink-0 px-3 py-4 transition-all border-b-2 ${activeRightTab === tab.key ? 'text-violet-600 border-violet-600 bg-white' : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setActiveRightTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="w-10 shrink-0 flex items-center justify-center border-l border-gray-100">
            <X 
              size={14} 
              className="text-gray-400 cursor-pointer hover:text-gray-600" 
              onClick={() => setRightSidebarOpen(false)}
            />
          </div>
        </div>

        {/* Dynamic Sidebar Content */}
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          
          {/* A. ACTIVE TAB: AI CHAT */}
          {activeRightTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Context Indicator */}
              <div className="px-4 py-2 bg-violet-50/40 border-b border-violet-100/30 flex items-center gap-2 text-xs text-violet-700">
                <FileText size={12} />
                <span className="font-medium truncate">Context Linked: {docTitle}</span>
              </div>

              {/* Chat Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`group flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                  >
                    {/* Speaker Header */}
                    <span className="text-[10px] text-gray-400 mb-1 px-1">
                      {msg.sender === 'user' ? 'Alex R.' : 'Compose AI'}
                    </span>

                    {/* Chat Bubble / Cards */}
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-violet-600 text-white rounded-tr-xs shadow-sm' 
                        : 'bg-[#FAFAFC] text-gray-700 border border-gray-100 rounded-tl-xs shadow-xs'
                    }`}>
                      {msg.text}

                      {/* Render suggestions block inline */}
                      {msg.type === 'suggestions' && (
                        <div className="mt-3 flex flex-col gap-1.5">
                          {msg.suggestions.map((sug, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleAISubmit(sug.label)}
                              className="w-full text-left bg-white hover:bg-violet-50 text-xs font-medium text-gray-700 hover:text-violet-700 p-2.5 rounded-lg border border-gray-200/60 hover:border-violet-200 transition-all flex items-center justify-between group/sug"
                            >
                              <span>{sug.label}</span>
                              <ArrowRight size={12} className="text-gray-400 group-hover/sug:translate-x-1 transition-transform" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Action confirmation pill */}
                      {msg.type === 'action_completed' && (
                        <div className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                          <Check size={12} />
                          <span>Successfully injected into document</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-1.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => retryMessageAction(msg)}
                        className="p-1 rounded-md text-gray-400 hover:text-violet-600 hover:bg-violet-50"
                        title="Retry"
                      >
                        <RefreshCcw size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => undoMessageAction(msg)}
                        className="p-1 rounded-md text-gray-400 hover:text-violet-600 hover:bg-violet-50"
                        title="Undo AI action"
                      >
                        <Undo2 size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMessageAction(msg)}
                        className="p-1 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete message"
                      >
                        <Trash2 size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => recordChatFeedback(msg, 'thumbs_up')}
                        className="p-1 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                        title="Helpful"
                      >
                        <ThumbsUp size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => recordChatFeedback(msg, 'thumbs_down')}
                        className="p-1 rounded-md text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                        title="Needs improvement"
                      >
                        <ThumbsDown size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setChatFeedbackDrafts((prev) => ({
                            ...prev,
                            [msg.id]: {
                              ...(prev[msg.id] || { text: '' }),
                              open: !(prev[msg.id]?.open),
                            },
                          }));
                        }}
                        className="p-1 rounded-md text-gray-400 hover:text-sky-600 hover:bg-sky-50"
                        title="Add feedback comment"
                      >
                        <MessageSquarePlus size={12} />
                      </button>
                    </div>

                    {chatFeedbackDrafts[msg.id]?.open && (
                      <div className="mt-1.5 w-full">
                        <div className="relative flex items-center bg-white border border-gray-200 rounded-full px-2 py-1 hover:border-violet-200 focus-within:border-violet-400 transition-colors">
                          <input
                            type="text"
                            value={chatFeedbackDrafts[msg.id]?.text || ''}
                            onChange={(event) => {
                              const value = event.target.value;
                              setChatFeedbackDrafts((prev) => ({
                                ...prev,
                                [msg.id]: {
                                  ...(prev[msg.id] || { open: true }),
                                  open: true,
                                  text: value,
                                },
                              }));
                            }}
                            placeholder="Tell AI how to improve this response..."
                            className="w-full min-w-0 bg-transparent border-none focus:outline-none text-[11px] text-gray-700 py-1 pl-1 pr-14"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const comment = chatFeedbackDrafts[msg.id]?.text?.trim() || '';
                              if (!comment) {
                                return;
                              }
                              recordChatFeedback(msg, 'comment', comment);
                              setChatFeedbackDrafts((prev) => ({
                                ...prev,
                                [msg.id]: { open: false, text: '' },
                              }));
                              showToast('Feedback saved to memory');
                            }}
                            className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full text-[11px] bg-violet-600 text-white hover:bg-violet-700"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Loader animation when AI is processing */}
                {isComposing && (
                  <div className="flex items-center gap-2 text-xs text-gray-400 p-2 animate-pulse">
                    <Loader2 className="animate-spin text-violet-500" size={14} />
                    <span>Compose AI is writing...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSidebarSend} className="p-3 border-t border-gray-100 bg-[#FAFAFC]">
                {chatAttachments.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {chatAttachments.map((attachment) => (
                      <span key={attachment.id} className="text-[10px] px-2 py-0.5 rounded-full border border-gray-200 bg-white text-gray-600">
                        {attachment.name}
                      </span>
                    ))}
                  </div>
                )}
                <div className="relative flex items-end bg-white border border-gray-200 rounded-xl focus-within:border-violet-400 transition-colors">
                  <input
                    ref={chatFileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={async (event) => {
                      await ingestChatAttachments(event.target.files);
                      event.target.value = '';
                    }}
                  />
                  <textarea
                    ref={chatInputRef}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onInput={(e) => autoResizeTextarea(e.currentTarget, 120)}
                    onPaste={handleChatPaste}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSidebarSend(e);
                      }
                    }}
                    placeholder="Ask, summarize, or instruct..."
                    rows={1}
                    className="w-full bg-transparent border-none focus:outline-none text-sm py-2.5 pl-10 pr-10 text-gray-700 placeholder-gray-400 resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => chatFileInputRef.current?.click()}
                    className="absolute left-1.5 bottom-1.5 p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
                    title="Attach files"
                  >
                    <Upload size={14} />
                  </button>
                  <button 
                    type="submit" 
                    className="absolute right-1.5 bottom-1.5 p-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-600 transition-colors"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* B. ACTIVE TAB: AI ASSISTANT CO-WRITER */}
          {activeRightTab === 'assistant' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {selectedEditorText && (
                <div className="rounded-xl border border-violet-200 bg-violet-50/70 px-3 py-2">
                  <div className="text-[11px] font-semibold text-violet-700 mb-0.5">Quick Assist Available</div>
                  <div className="text-[11px] text-violet-700/80">Text is highlighted. Tap an action to run immediately.</div>
                </div>
              )}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">Smart Assist Options</h3>
                <p className="text-xs text-gray-500">Highlight text in the page or use these global actions to refine current paragraphs.</p>
              </div>

              {/* Action Buttons Grid */}
              <div className="space-y-2">
                <button 
                  onClick={() => runSmartAssistAction('Improve the writing tone and professional clarity')}
                  className={`w-full flex items-center gap-3 px-4 py-3 border rounded-lg text-sm text-gray-700 hover:border-violet-200 hover:bg-violet-50 transition-colors text-left ${selectedEditorText ? 'assist-option-snake border-transparent' : 'border-gray-100'}`}
                >
                  <PenTool size={16} className="text-violet-500" />
                  <div>
                    <div className="font-semibold text-xs">Improve writing</div>
                    <p className="text-[10px] text-gray-400">Enhance vocabulary and structure</p>
                  </div>
                </button>

                <button 
                  onClick={() => runSmartAssistAction('Summarize the launch plan concisely')}
                  className={`w-full flex items-center gap-3 px-4 py-3 border rounded-lg text-sm text-gray-700 hover:border-violet-200 hover:bg-violet-50 transition-colors text-left ${selectedEditorText ? 'assist-option-snake border-transparent' : 'border-gray-100'}`}
                >
                  <FileText size={16} className="text-indigo-500" />
                  <div>
                    <div className="font-semibold text-xs">Summarize document</div>
                    <p className="text-[10px] text-gray-400">Condense overall strategy into bullets</p>
                  </div>
                </button>

                <button 
                  onClick={() => runSmartAssistAction('Make the plan shorter and more direct')}
                  className={`w-full flex items-center gap-3 px-4 py-3 border rounded-lg text-sm text-gray-700 hover:border-violet-200 hover:bg-violet-50 transition-colors text-left ${selectedEditorText ? 'assist-option-snake border-transparent' : 'border-gray-100'}`}
                >
                  <Scissors size={16} className="text-violet-400" />
                  <div>
                    <div className="font-semibold text-xs">Make shorter</div>
                    <p className="text-[10px] text-gray-400">Prune unnecessary wording</p>
                  </div>
                </button>

                <button 
                  onClick={() => runSmartAssistAction('Analyze risks and mitigation strategies')}
                  className={`w-full flex items-center gap-3 px-4 py-3 border rounded-lg text-sm text-gray-700 hover:border-violet-200 hover:bg-violet-50 transition-colors text-left ${selectedEditorText ? 'assist-option-snake border-transparent' : 'border-gray-100'}`}
                >
                  <AlertTriangle size={16} className="text-amber-500" />
                  <div>
                    <div className="font-semibold text-xs">Check for gaps & risks</div>
                    <p className="text-[10px] text-gray-400">Locate potential launch bottle necks</p>
                  </div>
                </button>
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">AI Prompt Box</h4>
                <form onSubmit={handleAssistantQuickPromptSend} className="bg-[#FAFAFC] rounded-lg p-3 border border-gray-100 space-y-2">
                  <textarea
                    value={assistantQuickPrompt}
                    onChange={(e) => setAssistantQuickPrompt(e.target.value)}
                    placeholder="Ask AI Assistant from here..."
                    rows={2}
                    className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-2 text-xs text-gray-700 outline-none focus:border-violet-400 resize-y min-h-[64px]"
                  />
                  <div className="flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={isComposing || !assistantQuickPrompt.trim()}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${isComposing || !assistantQuickPrompt.trim() ? 'bg-violet-200 text-white cursor-not-allowed' : 'bg-violet-600 text-white hover:bg-violet-700'}`}
                    >
                      Send to AI
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* C. ACTIVE TAB: TASKS WORKLIST */}
          {activeRightTab === 'tasks' && (
            <div className="flex-1 overflow-y-auto p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">Workspace Checklist</h3>
                <button 
                  onClick={addTaskFromInput}
                  className="text-xs font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1"
                >
                  <Plus size={14} /> Add Task
                </button>
              </div>

              <div className="mb-3 rounded-xl border border-gray-100 bg-[#FAFAFC] p-2.5">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewTaskOwner('user');
                      setTaskOwnerFilter('user');
                    }}
                    className={`px-2 py-1 rounded-full text-[10px] border ${taskOwnerFilter === 'user' ? 'bg-violet-50 border-violet-200 text-violet-700' : 'bg-white border-gray-200 text-gray-500'}`}
                  >
                    User Task
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewTaskOwner('agent');
                      setTaskOwnerFilter('agent');
                    }}
                    className={`px-2 py-1 rounded-full text-[10px] border ${taskOwnerFilter === 'agent' ? 'bg-sky-50 border-sky-200 text-sky-700' : 'bg-white border-gray-200 text-gray-500'}`}
                  >
                    Agent Task
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskOwnerFilter('all')}
                    className={`px-2 py-1 rounded-full text-[10px] border ${taskOwnerFilter === 'all' ? 'bg-gray-100 border-gray-300 text-gray-700' : 'bg-white border-gray-200 text-gray-500'}`}
                  >
                    All
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTaskInput}
                    onChange={(e) => setNewTaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTaskFromInput();
                      }
                    }}
                    placeholder="Add a new action item..."
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-violet-400"
                  />
                  <button
                    onClick={addTaskFromInput}
                    className="px-3 py-2 rounded-lg text-xs font-medium bg-violet-600 text-white hover:bg-violet-700"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {visibleTasks.map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => {
                      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
                      showToast(task.completed ? "Task uncompleted" : "Task marked completed");
                    }}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      task.completed 
                        ? 'bg-gray-50/50 border-gray-100 text-gray-400 line-through' 
                        : 'bg-white border-gray-100 text-gray-700 hover:border-violet-100 hover:bg-violet-50/20'
                    }`}
                  >
                    <div className={`mt-0.5 w-4.5 h-4.5 rounded border flex items-center justify-center transition-all ${
                      task.completed ? 'bg-violet-600 border-violet-600 text-white' : 'border-gray-300 bg-white'
                    }`}>
                      {task.completed && <Check size={12} className="stroke-[3]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold border mb-1 ${task.owner === 'agent' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-violet-50 text-violet-700 border-violet-200'}`}>
                            {task.owner === 'agent' ? 'Agent' : 'User'}
                          </span>
                          {editingTaskId === task.id ? (
                            <input
                              autoFocus
                              value={editingTaskText}
                              onChange={(event) => setEditingTaskText(event.target.value)}
                              onClick={(event) => event.stopPropagation()}
                              onBlur={() => commitTaskEdit(task.id)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                  event.preventDefault();
                                  commitTaskEdit(task.id);
                                }
                                if (event.key === 'Escape') {
                                  setEditingTaskId(null);
                                  setEditingTaskText('');
                                }
                              }}
                              className="w-full bg-white border border-violet-200 rounded px-2 py-1 text-xs text-gray-700 focus:outline-none"
                            />
                          ) : (
                            <span
                              onDoubleClick={(event) => {
                                event.stopPropagation();
                                beginTaskEdit(task);
                              }}
                              className="text-xs font-medium leading-relaxed block"
                            >
                              {task.text}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            removeTask(task.id);
                          }}
                          className="p-1 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete task"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          convertTaskToSchedule(task);
                        }}
                        className="mt-2 text-[11px] text-violet-600 hover:text-violet-700 font-medium"
                      >
                        Convert to Schedule
                      </button>
                    </div>
                  </div>
                ))}
                {visibleTasks.length === 0 && (
                  <div className="rounded-lg border border-dashed border-gray-200 p-3 text-[11px] text-gray-500 bg-white">
                    No tasks in this view yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* D. ACTIVE TAB: INTEGRATED CALENDAR & TIMELINE SCHEDULE */}
          {activeRightTab === 'calendar' && (
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <h3 className="text-sm font-bold text-gray-900">Launch Timeline</h3>
                <p className="text-xs text-gray-500">Consolidated product rollouts aligned with team calendar events.</p>

                {scheduleOutput.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-violet-500 uppercase tracking-wider block">Processed List</span>
                    {scheduleOutput.map((item) => (
                      <div key={item.id} className={`p-3 rounded-xl border bg-white space-y-2 relative overflow-hidden ${item.urgency === 'high' ? 'border-red-200' : item.urgency === 'medium' ? 'border-yellow-200' : 'border-blue-200'}`}>
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.urgency === 'high' ? 'bg-red-500' : item.urgency === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] px-2 py-0.5 rounded-full border border-gray-200 text-gray-600">{item.category || 'General'}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${item.urgency === 'high' ? 'bg-red-50 text-red-700 border-red-200' : item.urgency === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{item.urgency || 'low'}</span>
                          </div>
                          <div className="text-[10px] text-gray-400">{item.dueDate ? formatEventSlotLabel(item) : item.slot}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            value={item.title}
                            onChange={(event) => updateScheduleItem(item.id, 'title', event.target.value)}
                            className="flex-1 text-xs font-semibold text-gray-800 border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-violet-400"
                          />
                          <input
                            value={item.slot}
                            onChange={(event) => updateScheduleItem(item.id, 'slot', event.target.value)}
                            className="w-24 text-[10px] font-semibold text-violet-700 bg-violet-50 border border-violet-200 rounded-full px-2 py-1 focus:outline-none focus:border-violet-400"
                          />
                          <input
                            type="number"
                            min={15}
                            max={360}
                            value={item.durationMinutes || 60}
                            onChange={(event) => updateScheduleItem(item.id, 'durationMinutes', Math.max(15, Number(event.target.value) || 60))}
                            className="w-16 text-[10px] font-semibold text-gray-700 bg-white border border-gray-200 rounded-full px-2 py-1 focus:outline-none focus:border-violet-400"
                            title="Duration in minutes"
                          />
                        </div>
                        <textarea
                          value={item.summary}
                          onChange={(event) => updateScheduleItem(item.id, 'summary', event.target.value)}
                          rows={2}
                          placeholder="Add context or notes"
                          className="w-full text-[11px] text-gray-600 border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-violet-400 resize-none"
                        />
                        <div className="rounded-lg border border-gray-200 p-2 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Steps</span>
                            <button
                              type="button"
                              onClick={() => addScheduleStep(item.id)}
                              className="text-[10px] text-violet-600 hover:text-violet-700"
                            >
                              + Add step
                            </button>
                          </div>
                          {(item.steps || []).map((step, stepIndex) => (
                            <div key={`${item.id}-step-${stepIndex}`} className="flex items-center gap-1.5">
                              <input
                                value={step}
                                onChange={(event) => updateScheduleStep(item.id, stepIndex, event.target.value)}
                                placeholder={`Step ${stepIndex + 1}`}
                                className="flex-1 text-[11px] text-gray-700 border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-violet-400"
                              />
                              <button
                                type="button"
                                onClick={() => removeScheduleStep(item.id, stepIndex)}
                                className="p-1 rounded text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                                title="Remove step"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => undoScheduleItem(item.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full px-2.5 py-1"
                          >
                            <Undo2 size={12} /> Undo
                          </button>
                          <button
                            type="button"
                            onClick={() => approveScheduleItem(item.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-full px-2.5 py-1"
                          >
                            <Check size={12} /> Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Minimalist interactive calendar widget */}
                <div className="border border-gray-100 rounded-xl p-4 bg-[#FAFAFC]">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-3">
                    <div className="flex items-center gap-2" ref={calendarMenuRef}>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            closeTransientMenus();
                            setOpenDropdown((prev) => (prev === 'calendar-month' ? null : 'calendar-month'));
                          }}
                          className="flex items-center gap-1 hover:bg-gray-50 px-2 py-1 rounded whitespace-nowrap"
                        >
                          {monthNames[calendarMonth]} <ChevronDown size={14} className="text-gray-400" />
                        </button>
                        {openDropdown === 'calendar-month' && (
                          <div className="absolute top-9 left-0 z-[230] w-44 bg-white isolate border border-gray-200 rounded-lg shadow-2xl ring-1 ring-black/5 p-2">
                            <div className="max-h-44 overflow-y-auto">
                              {monthNames.map((m, i) => (
                                <button
                                  key={m}
                                  type="button"
                                  onPointerDown={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    setCalendarView(i, calendarYear);
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full text-left px-2 py-1 rounded text-xs hover:bg-violet-50"
                                >
                                  {m}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            closeTransientMenus();
                            setOpenDropdown((prev) => (prev === 'calendar-year' ? null : 'calendar-year'));
                          }}
                          className="flex items-center gap-1 hover:bg-gray-50 px-2 py-1 rounded whitespace-nowrap"
                        >
                          {calendarYear} <ChevronDown size={14} className="text-gray-400" />
                        </button>
                        {openDropdown === 'calendar-year' && (
                          <div className="absolute top-9 left-0 z-[230] w-32 bg-white isolate border border-gray-200 rounded-lg shadow-2xl ring-1 ring-black/5 p-2">
                            <div className="max-h-44 overflow-y-auto">
                              {[2026, 2027, 2028, 2029].map((y) => (
                                <button
                                  key={y}
                                  type="button"
                                  onPointerDown={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    setCalendarView(calendarMonth, y);
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full text-left px-2 py-1 rounded text-xs hover:bg-violet-50"
                                >
                                  {y}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 text-gray-400">
                      <button
                        type="button"
                        onClick={() => {
                          if (calendarYear === 2026 && calendarMonth === 0) {
                            return;
                          }

                          if (calendarMonth === 0) {
                            setCalendarView(11, calendarYear - 1);
                          } else {
                            setCalendarView(calendarMonth - 1, calendarYear);
                          }
                        }}
                        disabled={calendarYear === 2026 && calendarMonth === 0}
                        className="cursor-pointer hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (calendarMonth === 11) {
                            setCalendarView(0, calendarYear + 1);
                          } else {
                            setCalendarView(calendarMonth + 1, calendarYear);
                          }
                        }}
                        disabled={calendarYear === 2029 && calendarMonth === 11}
                        className="cursor-pointer hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        →
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-gray-400 mb-2">
                    <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-700">
                    {generateCalendarDays(calendarMonth, calendarYear).map((dayObj, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (!dayObj.isCurrentMonth) {
                            return;
                          }
                          setSelectedCalendarDate(new Date(calendarYear, calendarMonth, dayObj.day));
                        }}
                        className={`py-1 rounded transition-colors ${
                          dayObj.isCurrentMonth
                            ? (selectedCalendarDate
                                && selectedCalendarDate.getFullYear() === calendarYear
                                && selectedCalendarDate.getMonth() === calendarMonth
                                && selectedCalendarDate.getDate() === dayObj.day)
                              ? 'bg-violet-600 text-white font-bold'
                              : dayObj.isToday
                                ? 'bg-violet-100 text-violet-700 font-semibold hover:bg-violet-200 cursor-pointer'
                                : 'hover:bg-gray-200 cursor-pointer'
                            : 'text-gray-300'
                        }`}
                        disabled={!dayObj.isCurrentMonth}
                      >
                        {dayObj.day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-[11px] text-violet-700 bg-violet-50 border border-violet-100 rounded-lg px-3 py-2">
                  Selected date: {selectedCalendarDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Upcoming Events</span>
                  <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.24em] text-slate-500 uppercase">
                    <Calendar size={13} className="text-violet-500" />
                    <span>{formatUpcomingHeaderDate(selectedCalendarDate)}</span>
                  </div>
                  {upcomingEvents.map((event, index) => (
                    <div key={event.id} className={`p-3 rounded-xl border text-xs relative overflow-hidden ${event.urgency === 'high' ? 'border-red-100 bg-red-50/20' : event.urgency === 'medium' ? 'border-yellow-100 bg-yellow-50/20' : index === 0 ? 'border-blue-100 bg-blue-50/20' : 'border-gray-100 bg-white'}`}>
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${event.urgency === 'high' ? 'bg-red-500' : event.urgency === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                      <div className={`font-bold text-sm ${event.urgency === 'high' ? 'text-red-700' : event.urgency === 'medium' ? 'text-yellow-700' : index === 0 ? 'text-blue-700' : 'text-gray-700'}`}>{event.title}</div>
                      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-violet-200 bg-violet-50 text-violet-700">{event.category || 'General'}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-gray-200 bg-white text-gray-600">{event.durationMinutes || 60}m</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-violet-200 bg-white text-violet-700">{event.slot || formatEventSlotLabel(event).split('•').slice(-1)[0].trim()}</span>
                      </div>
                      <div className="text-gray-500 mt-1">{formatEventSlotLabel(event)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  convertMessyScheduleToPlan();
                }}
                className="border-t border-gray-100 bg-[#FAFAFC] p-4"
              >
                {scheduleAttachments.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {scheduleAttachments.map((attachment) => (
                      <span key={attachment.id} className="text-[10px] px-2 py-0.5 rounded-full border border-gray-200 bg-white text-gray-600">
                        {attachment.name}
                      </span>
                    ))}
                  </div>
                )}
                <div className="bg-white border border-gray-100 shadow-sm flex items-center px-2 py-1.5 hover:border-violet-200 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all rounded-full">
                  <input
                    ref={scheduleFileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={async (event) => {
                      await ingestScheduleAttachments(event.target.files);
                      event.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => scheduleFileInputRef.current?.click()}
                    className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
                    title="Attach files or images"
                  >
                    <Upload size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await toggleVoiceRecording('schedule');
                    }}
                    className={`ml-1 p-1.5 rounded-lg transition-colors ${voiceTarget === 'schedule' && isVoiceActive ? 'bg-violet-100 text-violet-700' : 'bg-gray-50 hover:bg-gray-100 text-gray-500'}`}
                    title="Dictate schedule input"
                  >
                    <Mic size={13} />
                  </button>
                  <PenTool size={14} className="text-gray-400 mx-2 shrink-0" />
                  <div className="relative flex-1">
                  <textarea
                    ref={scheduleInputRef}
                    value={scheduleInput}
                    onChange={(e) => setScheduleInput(e.target.value)}
                    onInput={(e) => autoResizeTextarea(e.currentTarget, 120)}
                    onPaste={handleSchedulePaste}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        convertMessyScheduleToPlan();
                      }
                    }}
                    placeholder="Paste messy tasks, notes, or shorthand..."
                    rows={1}
                    className="w-full bg-transparent border-none focus:outline-none text-xs text-gray-700 placeholder-gray-400 py-1 pr-10 resize-none"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-600 transition-colors"
                    title="Process list"
                  >
                    <Send size={14} />
                  </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {activeRightTab === 'memory' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">AI Access + Memory</h3>
                <p className="text-xs text-gray-500">Hybrid mode: demo API for instant use, plus your own API key option.</p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-[#FAFAFC] p-3 space-y-3">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">API Mode</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setApiMode('demo')}
                    className={`px-3 py-1.5 rounded-full text-xs border ${apiMode === 'demo' ? 'bg-violet-50 border-violet-300 text-violet-700' : 'bg-white border-gray-200 text-gray-600'}`}
                  >
                    Demo API
                  </button>
                  <button
                    onClick={() => setApiMode('byok')}
                    className={`px-3 py-1.5 rounded-full text-xs border ${apiMode === 'byok' ? 'bg-violet-50 border-violet-300 text-violet-700' : 'bg-white border-gray-200 text-gray-600'}`}
                  >
                    Use My API Key
                  </button>
                </div>
                <div className="text-[11px] text-gray-500 flex items-center gap-2">
                  <KeyRound size={12} />
                  {apiMode === 'demo'
                    ? (DEMO_GEMINI_API_KEY ? 'Demo API is configured.' : 'Demo API is missing (set VITE_GEMINI_DEMO_API_KEY or VITE_GEMINI_API_KEY).')
                    : (userApiKey.trim() ? 'Your API key is stored locally in this browser.' : 'Paste your API key to enable live responses.')}
                </div>

                <div className="flex items-center gap-2 min-w-0">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={userApiKey}
                    onChange={(e) => setUserApiKey(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        applyUserApiKey();
                      }
                    }}
                    placeholder="Paste your Gemini API key"
                    className="flex-1 min-w-0 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-violet-400"
                  />
                  <button
                    onClick={() => setShowApiKey((prev) => !prev)}
                    className="shrink-0 px-2 py-2 rounded-lg text-xs border border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    {showApiKey ? 'Hide' : 'Show'}
                  </button>
                  <button
                    onClick={applyUserApiKey}
                    className="shrink-0 px-2.5 py-2 rounded-lg text-xs bg-violet-600 text-white hover:bg-violet-700"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-[#FAFAFC] p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Memory Controls</div>
                  <label className="text-xs text-gray-600 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={memoryCaptureEnabled}
                      onChange={(e) => setMemoryCaptureEnabled(e.target.checked)}
                    />
                    Capture events
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div className="rounded-lg border border-gray-200 bg-white p-2">Total: <span className="font-semibold">{memoryStats.total}</span></div>
                  <div className="rounded-lg border border-gray-200 bg-white p-2">AI: <span className="font-semibold">{memoryStats.aiCalls}</span></div>
                  <div className="rounded-lg border border-gray-200 bg-white p-2">Uploads: <span className="font-semibold">{memoryStats.uploads}</span></div>
                  <div className="rounded-lg border border-gray-200 bg-white p-2">Exports: <span className="font-semibold">{memoryStats.exports}</span></div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <label className="text-xs text-gray-600">Retention days</label>
                  <input
                    type="number"
                    min={1}
                    max={3650}
                    value={memoryRetentionDays}
                    onChange={(e) => setMemoryRetentionDays(Math.min(3650, Math.max(1, Number(e.target.value) || 90)))}
                    className="w-24 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-violet-400"
                  />
                  <button
                    onClick={() => setMemoryEntries([])}
                    className="ml-auto shrink-0 px-2.5 py-1.5 rounded-lg text-xs border border-rose-200 text-rose-600 hover:bg-rose-50"
                  >
                    Clear all
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-[#FAFAFC] p-3 space-y-2">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Memory Browser</div>
                <div className="flex gap-2 min-w-0">
                  <input
                    type="text"
                    value={memorySearch}
                    onChange={(e) => setMemorySearch(e.target.value)}
                    placeholder="Search memory entries..."
                    className="flex-1 min-w-0 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-violet-400"
                  />
                  <select
                    value={memoryFilter}
                    onChange={(e) => setMemoryFilter(e.target.value)}
                    className="shrink-0 bg-white border border-gray-200 rounded-lg px-2 py-2 text-xs text-gray-700"
                  >
                    <option value="all">All</option>
                    <option value="ai">AI</option>
                    <option value="upload">Uploads</option>
                    <option value="export">Exports</option>
                    <option value="automation">Automation</option>
                    <option value="task">Tasks</option>
                    <option value="share">Sharing</option>
                    <option value="feedback">Feedback</option>
                    <option value="document">Documents</option>
                  </select>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {filteredMemoryEntries.length === 0 && (
                    <div className="text-xs text-gray-500 py-3 text-center">No memory entries yet.</div>
                  )}
                  {filteredMemoryEntries.map((entry) => (
                    <div key={entry.id} className="rounded-lg border border-gray-200 bg-white p-2.5 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-gray-800">{entry.summary}</span>
                        <span className="text-[10px] uppercase text-violet-600 font-semibold">{entry.type}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1">{new Date(entry.timestamp).toLocaleString()}</div>
                      {Object.keys(entry.details || {}).length > 0 && (
                        <div className="mt-1.5 text-[10px] text-gray-600 break-all">{Object.entries(entry.details).map(([key, value]) => `${key}: ${value}`).join(' • ')}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 4. Far Right Mini Sidebar (Icons only / Navigation controller) */}
      <div className="w-16 border-l border-gray-100 bg-[#FAFAFC] flex flex-col items-center py-4 gap-6 shrink-0 select-none">
        
        <div 
          onClick={() => handleMiniSidebarClick('chat')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeRightTab === 'chat' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all ${activeRightTab === 'chat' && rightSidebarOpen ? 'bg-violet-100' : ''}`}>
            <MessageCircle size={20} />
          </div>
          <span className="text-[9px] font-semibold">Chat</span>
        </div>

        <div 
          onClick={() => handleMiniSidebarClick('assistant')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeRightTab === 'assistant' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all relative ${activeRightTab === 'assistant' && rightSidebarOpen ? 'bg-violet-100' : ''} ${selectedEditorText ? 'ring-2 ring-violet-300 ring-offset-2 ring-offset-[#FAFAFC]' : ''}`}>
            <PenTool size={20} />
            {selectedEditorText && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse" />}
          </div>
          <span className="text-[9px] font-semibold">Assist</span>
        </div>

        <div 
          onClick={() => handleMiniSidebarClick('tasks')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeRightTab === 'tasks' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all ${activeRightTab === 'tasks' && rightSidebarOpen ? 'bg-violet-100' : ''}`}>
            <CheckSquare size={20} />
          </div>
          <span className="text-[9px] font-semibold">Tasks</span>
        </div>

        <div 
          onClick={() => handleMiniSidebarClick('calendar')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeRightTab === 'calendar' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all ${activeRightTab === 'calendar' && rightSidebarOpen ? 'bg-violet-100' : ''}`}>
            <Calendar size={20} />
          </div>
          <span className="text-[9px] font-semibold">Schedule</span>
        </div>

        <div
          onClick={() => handleMiniSidebarClick('memory')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
            activeRightTab === 'memory' && rightSidebarOpen ? 'text-violet-600' : 'text-gray-400 hover:text-violet-600'
          }`}
        >
          <div className={`p-2 rounded-xl transition-all ${activeRightTab === 'memory' && rightSidebarOpen ? 'bg-violet-100' : ''}`}>
            <Database size={20} />
          </div>
          <span className="text-[9px] font-semibold">Memory</span>
        </div>

        <div className="flex flex-col items-center gap-1 text-gray-400 hover:text-violet-600 cursor-pointer">
          <div className="p-2">
            <File size={20} />
          </div>
          <span className="text-[9px] font-semibold">Files</span>
        </div>

        <div className="flex flex-col items-center gap-1 text-gray-400 hover:text-violet-600 cursor-pointer">
          <div className="p-2">
            <Users size={20} />
          </div>
          <span className="text-[9px] font-semibold">People</span>
        </div>

        <div className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 cursor-pointer mt-auto">
          <div className="p-2">
            <MoreHorizontal size={20} />
          </div>
          <span className="text-[9px] font-semibold">More</span>
        </div>
      </div>

    </div>
  );
}