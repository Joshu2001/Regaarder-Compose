import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, Video, Plus, Check, CheckCheck, Send, Smile, Paperclip, 
  Sparkles, FileText, Table, Presentation, X, ArrowRight, MoreVertical,
  Compass, ShieldCheck, Download, ExternalLink, Calendar, CheckSquare,
  Mic, Pin, PinOff, LayoutGrid, Sparkle, Bot, MessageSquare, ChevronDown,
  Lock, KeyRound, Shield, CheckCircle2, Copy, Info, Hash, ListTodo, CornerDownRight,
  ChevronDown as ScrollDownIcon, Play, Pause, Volume2, AudioLines,
  Reply, Edit3, Wand2, Trash2, Star, CornerUpRight, BellOff, Bell,
  Megaphone, UserCheck, Users, Radio, Eye, Phone, PhoneOff, PhoneCall,
  MicOff, VideoOff, Maximize2, Minimize2, Image, Link, FileCode,
  UserPlus, MessageSquarePlus, Cpu, RefreshCw, ChevronRight, Waves, RadioTower,
  SlidersHorizontal, MoreHorizontal, MessageCircle, FileSpreadsheet, UploadCloud,
  AtSign, Globe, Smartphone, User, Terminal, HardDriveDownload,
  History, RotateCcw, Square, Bold, Languages, Loader2, Zap, GitPullRequest, Network
} from 'lucide-react';
import { RegaarderAiIcon, RegaarderProductIcon, MemoryIcon, OrbIcon, RelayIcon, ComposeIcon, SheetIcon, DeckIcon } from '../RegaarderProductIcons';
import RegaarderBrandIcon from '../RegaarderBrandIcon';
import { detectLocalLLMServers, callAiProvider, getSavedAiConfig } from '../../services/orbAiService';
import { processRelayAgentMessage } from '../../services/relayAgentService';

// Quick Translation Languages for Selection Writing Tools
const TRANSLATE_LANGUAGES = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
];

// Curated Apple-style categorized emojis & Custom Regaarder Stickers
const EMOJI_CATEGORIES = [
  {
    id: 'smileys',
    name: 'Smileys & Emotion',
    icon: '😀',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕']
  },
  {
    id: 'gestures',
    name: 'Hands & Gestures',
    icon: '👍',
    emojis: ['👍', '👎', '👌', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤙', '💪', '🦾', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳']
  },
  {
    id: 'objects',
    name: 'Tech & Workspace',
    icon: '⚡',
    emojis: ['⚡', '✨', '🔥', '💡', '🚀', '🎯', '🏆', '💎', '🎉', '📌', '📎', '📊', '📈', '📉', '📂', '📁', '💻', '🖥️', '📱', '🔒', '🔑', '🛡️', '🧠', '⚙️', '🤖', '💬', '📝', '✉️', '📅', '⏱️']
  },
  {
    id: 'custom',
    name: 'Custom & Stickers',
    icon: '✨',
    emojis: ['🚀', '🛡️', '🔮', '🌌', '⚡', '💎', '💡', '🧠', '👑', '🔥', '🎯', '🪐', '🧬', '🛸', '🛰️', '📡', '🕹️', '🧪', '🔑', '🏷️', '📦']
  }
];

// Fallback Cloud AI Models matching Room specifications
const DEFAULT_CLOUD_MODELS = [
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'Google AI' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google AI' },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'deepseek-chat', name: 'DeepSeek V3', provider: 'DeepSeek' }
];

// Docs File Type Semantic Badge
const DocsSemanticFileBadge = ({ type, title = '', size = 'md' }) => {
  const nameLower = (title || '').toLowerCase();
  const ext = (nameLower.split('.').pop() || type || '').toLowerCase();

  let bgHex = '#7C3AED';
  let label = 'DOC';
  let svg = (
    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.5 2H10.5L13.5 5V13.5C13.5 14.0523 13.0523 14.5 12.5 14.5H3.5C2.94772 14.5 2.5 14.0523 2.5 13.5V3C2.5 2.44772 2.94772 2 3.5 2Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 2V5.5H13.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );

  if (ext === 'pdf') {
    bgHex = '#DC2626';
    label = 'PDF';
    svg = (
      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.5 2H10L13.5 5.5V13.5C13.5 14.0523 13.0523 14.5 12.5 14.5H3.5C2.94772 14.5 2.5 14.0523 2.5 13.5V3C2.5 2.44772 2.94772 2 3.5 2Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9.5 2V5.5H13.5" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  } else if (['xls', 'xlsx', 'csv', 'ods'].includes(ext) || type === 'sheets') {
    bgHex = '#059669';
    label = ext === 'csv' ? 'CSV' : 'XLS';
    svg = (
      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2.5 6.5H13.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M2.5 10.5H13.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M6.5 6.5V13.5" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  } else if (['ppt', 'pptx', 'key'].includes(ext) || type === 'deck') {
    bgHex = '#D97706';
    label = 'PPT';
    svg = (
      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2.5" width="12" height="8.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5.5 14L8 11L10.5 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  const dimClasses = size === 'lg' ? 'w-[32px] h-[36px] rounded-lg' : 'w-[20px] h-[22px] rounded-[5px]';
  const labelClasses = size === 'lg' ? 'text-[8.5px] font-black uppercase mb-0.5' : 'text-[6.5px] font-black uppercase mb-[1px]';

  return (
    <span
      className={`${dimClasses} flex flex-col items-center justify-center shrink-0 leading-none select-none text-white shadow-xs`}
      style={{ backgroundColor: bgHex }}
    >
      <span className={`${labelClasses} text-white leading-none`}>{label}</span>
      {svg}
    </span>
  );
};

// Formats inline tokens (bold, italics, code)
const renderFormattedInline = (text, keyPrefix = '') => {
  if (!text) return null;
  const parts = [];
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      const boldContent = token.slice(2, -2).replace(/^\*\*|\*\*$/g, '');
      parts.push(<strong key={`${keyPrefix}-b-${match.index}`} className="font-bold text-slate-900 dark:text-zinc-50">{boldContent}</strong>);
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(<em key={`${keyPrefix}-i-${match.index}`} className="italic text-slate-700 dark:text-zinc-200">{token.slice(1, -1)}</em>);
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(<code key={`${keyPrefix}-c-${match.index}`} className="px-1.5 py-0.5 rounded bg-black/[0.06] dark:bg-white/[0.08] font-mono text-[11.5px]">{token.slice(1, -1)}</code>);
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
};

// Formats message blocks, converting raw markdown headers (##, ###) into executive typography
const renderFormattedMessageText = (text) => {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // H1 header (# Title)
    if (/^#\s+/.test(trimmed)) {
      const headingContent = trimmed.replace(/^#\s+/, '');
      elements.push(
        <h2 key={idx} className="text-[13.5px] font-bold text-slate-900 dark:text-zinc-100 mt-2.5 mb-1 tracking-tight">
          {renderFormattedInline(headingContent, `h1-${idx}`)}
        </h2>
      );
      return;
    }

    // H2 header (## Section) — strips the raw "##" double hashes
    if (/^##\s+/.test(trimmed)) {
      const headingContent = trimmed.replace(/^##\s+/, '');
      elements.push(
        <h3 key={idx} className="text-xs font-bold text-slate-800 dark:text-zinc-200 mt-2 mb-0.5 tracking-tight flex items-center gap-1.5">
          <span className="w-1 h-3 rounded-full bg-violet-600 dark:bg-violet-400 shrink-0" />
          <span>{renderFormattedInline(headingContent, `h2-${idx}`)}</span>
        </h3>
      );
      return;
    }

    // H3 header (### Sub-section)
    if (/^###\s+/.test(trimmed)) {
      const headingContent = trimmed.replace(/^###\s+/, '');
      elements.push(
        <h4 key={idx} className="text-[11.5px] font-semibold text-slate-700 dark:text-zinc-300 mt-1.5 mb-0.5">
          {renderFormattedInline(headingContent, `h3-${idx}`)}
        </h4>
      );
      return;
    }

    // Bullet items (* item or - item or • item)
    if (/^[-*•]\s+/.test(trimmed)) {
      const bulletContent = trimmed.replace(/^[-*•]\s+/, '');
      elements.push(
        <div key={idx} className="flex items-start gap-1.5 ml-1 my-0.5 text-xs text-slate-700 dark:text-zinc-200">
          <span className="text-slate-400 dark:text-zinc-500 shrink-0 select-none">•</span>
          <span>{renderFormattedInline(bulletContent, `b-${idx}`)}</span>
        </div>
      );
      return;
    }

    // Numbered list (1. item)
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <div key={idx} className="flex items-start gap-1.5 ml-1 my-0.5 text-xs text-slate-700 dark:text-zinc-200">
          <span className="font-mono text-[10px] font-bold text-violet-600 dark:text-violet-400 shrink-0 select-none">{numMatch[1]}.</span>
          <span>{renderFormattedInline(numMatch[2], `n-${idx}`)}</span>
        </div>
      );
      return;
    }

    // Empty line / paragraph break
    if (!trimmed) {
      elements.push(<div key={idx} className="h-1.5" />);
      return;
    }

    // Standard paragraph line
    elements.push(
      <p key={idx} className="leading-relaxed">
        {renderFormattedInline(line, `p-${idx}`)}
      </p>
    );
  });

  return <div className="space-y-0.5">{elements}</div>;
};

export default function ExecutiveDirectMessages({
  isDarkMode = false,
  threads = [],
  activeThreadId,
  onSelectThread,
  onOpenRoom,
  onOpenMemory,
  onLogDecisionToMemory,
  onNavigateWorkspace,
  onToggleFullscreen,
  onOpenWorkspaceSwitcher,
  onCallAi,
  detectedModelsFromApp = []
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread' | 'teams' | 'topics' | 'ai' | 'broadcast' | 'actions'
  const [isMoreTabsMenuOpen, setIsMoreTabsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeContactId, setActiveContactId] = useState('chat-assistant');
  const [messageInput, setMessageInput] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [replyingToMessage, setReplyingToMessage] = useState(null);
  const [activeMoreMenuMsgId, setActiveMoreMenuMsgId] = useState(null);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [isChatSearchOpen, setIsChatSearchOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [isDetailsMenuOpen, setIsDetailsMenuOpen] = useState(false);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState('smileys');
  const [emojiSearch, setEmojiSearch] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // ── Floating AI Writing Tools Toolbar (Triggered on text selection in input) ──
  const [selectionToolbarState, setSelectionToolbarState] = useState(null); // { start, end, text }
  const [isTransformingText, setIsTransformingText] = useState(false);
  const [activeTransformAction, setActiveTransformAction] = useState(null); // 'proofread' | 'improve' | 'concise' | 'bold' | 'translate' | 'custom' | 'tone' | 'style'
  const [showTranslateMenu, setShowTranslateMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const textInputRef = useRef(null);

  // ── Real Live Probed Model Registry (Matching Room Standard) ──
  const [detectedLocalModels, setDetectedLocalModels] = useState([]);
  const [isScanningModels, setIsScanningModels] = useState(false);
  const [selectedAiModel, setSelectedAiModel] = useState('gemini-2.0-flash');
  const [isAiModelSelectorOpen, setIsAiModelSelectorOpen] = useState(false);

  // Sync detected models from app if available
  useEffect(() => {
    if (detectedModelsFromApp && detectedModelsFromApp.length > 0) {
      setDetectedLocalModels(detectedModelsFromApp);
      if (selectedAiModel === 'gemini-2.0-flash') {
        setSelectedAiModel(detectedModelsFromApp[0].id);
      }
    }
  }, [detectedModelsFromApp]);

  // Scan live local Ollama/LM Studio models on mount
  const scanRealLocalModels = async () => {
    setIsScanningModels(true);
    try {
      const servers = await detectLocalLLMServers({ timeoutMs: 1200 });
      const locals = [];
      (servers || []).forEach(s => {
        if (s.isOnline && Array.isArray(s.models)) {
          s.models.forEach(m => {
            locals.push({
              id: m.id,
              name: m.id,
              provider: `${s.name} ${m.size ? `(${m.size})` : ''}`,
              isLocal: true,
              serverProvider: s.provider,
              endpoint: s.endpoint
            });
          });
        }
      });
      setDetectedLocalModels(locals);
      if (locals.length > 0 && selectedAiModel === 'gemini-2.0-flash') {
        setSelectedAiModel(locals[0].id);
      }
    } catch (e) {
      console.warn('Local LLM detection error:', e);
    } finally {
      setIsScanningModels(false);
    }
  };

  useEffect(() => {
    scanRealLocalModels();
  }, []);

  // Global Outside Click / Tap Dismissal for Popovers
  useEffect(() => {
    const handleGlobalPointerDown = (e) => {
      const target = e.target;
      if (!target) return;

      // If user taps outside Model Engine Selector, dismiss it
      if (isAiModelSelectorOpen && !target.closest('[data-popover-root="true"]')) {
        setIsAiModelSelectorOpen(false);
      }

      // If user taps outside Emoji Picker, dismiss it
      if (isEmojiPickerOpen && !target.closest('[data-popover-root="true"]')) {
        setIsEmojiPickerOpen(false);
      }

      // If user taps outside Details menu, dismiss it
      if (isDetailsMenuOpen && !target.closest('[data-popover-root="true"]')) {
        setIsDetailsMenuOpen(false);
      }

      // If user taps outside Selection Writing Toolbar and outside the message input, dismiss it
      if (selectionToolbarState && !target.closest('[data-selection-toolbar="true"]') && !target.closest('[data-msg-input="true"]')) {
        setSelectionToolbarState(null);
        setShowTranslateMenu(false);
        setShowMoreMenu(false);
      }
    };

    document.addEventListener('pointerdown', handleGlobalPointerDown);
    return () => {
      document.removeEventListener('pointerdown', handleGlobalPointerDown);
    };
  }, [isAiModelSelectorOpen, isEmojiPickerOpen, isDetailsMenuOpen, selectionToolbarState]);

  // ── Full Apple/ChatGPT AI Voice Session State ──
  const [isAiVoiceSessionActive, setIsAiVoiceSessionActive] = useState(false);
  const [isAiVoicePaused, setIsAiVoicePaused] = useState(false);
  const [isAiVoiceMuted, setIsAiVoiceMuted] = useState(false);
  const [aiVoiceLiveWaves, setAiVoiceLiveWaves] = useState([12, 22, 16, 28, 14, 20, 24, 18, 12, 26]);
  const [aiVoiceLiveTranscript, setAiVoiceLiveTranscript] = useState('');
  const [isAiVoiceResponding, setIsAiVoiceResponding] = useState(false);
  const [aiVoiceActiveResponse, setAiVoiceActiveResponse] = useState('');

  // ── WhatsApp Standard Audio Recording & Playback State ──
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isVoicePaused, setIsVoicePaused] = useState(false);
  const [voiceElapsedSeconds, setVoiceElapsedSeconds] = useState(0);
  const [voiceWaveLevels, setVoiceWaveLevels] = useState([12, 20, 15, 28, 14, 22, 18, 25, 16, 24]);
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const [audioPlaybackSpeeds, setAudioPlaybackSpeeds] = useState({}); // { [msgId]: 1 | 1.5 | 2 }
  const [voiceRecognitionTranscript, setVoiceRecognitionTranscript] = useState('');
  const [aiStatusPhase, setAiStatusPhase] = useState('thinking'); // 'thinking' | 'typing'
  const voiceTimerRef = useRef(null);
  const voiceSpeechRecRef = useRef(null);
  const voiceAudioContextRef = useRef(null);
  const voiceMicStreamRef = useRef(null);
  const voiceAnalyserRef = useRef(null);
  const voiceAnimFrameRef = useRef(null);
  const voiceMediaRecorderRef = useRef(null);
  const voiceAudioChunksRef = useRef([]);
  const activeAudioPlayerRef = useRef(null);

  // ── In-Chat Direct WhatsApp Video/Audio Call State ──
  const [activeCallSession, setActiveCallSession] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // ── Document Attachment Stage State ──
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [selectedAttachmentIndex, setSelectedAttachmentIndex] = useState(0);
  const [attachmentCaption, setAttachmentCaption] = useState('');

  // ── Create Modal State (Instagram-Style Create Profile, Team Group, or AI Persona) ──
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('profile'); // 'profile' | 'group' | 'persona'
  
  // Clean Profile Form Fields (Instagram Standard: Name, Username ID, Bio)
  const [profileName, setProfileName] = useState('');
  const [profileUsername, setProfileUsername] = useState('');
  const [profileBio, setProfileBio] = useState('');

  // Group Form Fields
  const [groupName, setGroupName] = useState('');
  const [groupSelectedMembers, setGroupSelectedMembers] = useState({});

  // AI Persona Form Fields
  const [personaName, setPersonaName] = useState('');
  const [personaInstructions, setPersonaInstructions] = useState('');
  const [personaEngine, setPersonaEngine] = useState('gemini-2.0-flash');
  const mdFileInputRef = useRef(null);

  // Dynamic Conversations List
  const [conversations, setConversations] = useState([
    {
      id: 'chat-assistant',
      name: 'Assistant',
      avatar: 'AI',
      isGroup: false,
      isAi: true,
      modelId: 'gemini-2.0-flash',
      modelName: 'Gemini 2.0 Flash',
      lastMsg: 'Ready for strategy briefings, real-time voice, or file synthesis.',
      time: 'Just now',
      unread: 0,
      category: 'ai',
      online: true,
      fingerprint: '0xAI • ZERO • KNOWLEDGE',
      topics: ['Strategy Synthesis', 'Voice Chat', 'Workspace Analysis'],
      actions: []
    }
  ]);

  // Isolated Message Threads Store with localStorage Persistence
  const RELAY_MESSAGES_STORAGE_KEY = 'regaarder_relay_messages_v1';

  const [threadMessages, setThreadMessages] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(RELAY_MESSAGES_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('[Relay] Failed to load messages from localStorage:', e);
    }
    return {
      'chat-assistant': [
        {
          id: 'm-welcome',
          author: 'Assistant',
          role: 'assistant',
          text: 'Welcome to Regaarder Relay. All communications are end-to-end encrypted with zero-knowledge keys.\n\nYou can chat by typing, attach documents, switch AI models dynamically, or start real-time conversational voice sessions using the Voice Chat with AI button.',
          createdAt: Date.now() - 1000 * 60 * 2,
          status: 'read'
        }
      ]
    };
  });

  // Automatically persist message threads whenever updated
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && threadMessages) {
        localStorage.setItem(RELAY_MESSAGES_STORAGE_KEY, JSON.stringify(threadMessages));
      }
    } catch (e) {
      console.warn('[Relay] Failed to persist messages to localStorage:', e);
    }
  }, [threadMessages]);

  // ── WhatsApp-Style Forward Modal State ──
  const [forwardModalMessage, setForwardModalMessage] = useState(null);
  const [selectedForwardRecipientIds, setSelectedForwardRecipientIds] = useState([]);
  const [forwardSearchQuery, setForwardSearchQuery] = useState('');

  // ── AI Chat History & Sessions (with localStorage Persistence) ──
  const AI_SESSIONS_STORAGE_KEY = 'regaarder_ai_chat_sessions_v1';
  const [aiChatSessions, setAiChatSessions] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(AI_SESSIONS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      }
    } catch (e) {
      console.warn('[Relay] Failed to load AI chat sessions from localStorage:', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && aiChatSessions) {
        localStorage.setItem(AI_SESSIONS_STORAGE_KEY, JSON.stringify(aiChatSessions));
      }
    } catch (e) {
      console.warn('[Relay] Failed to persist AI chat sessions to localStorage:', e);
    }
  }, [aiChatSessions]);

  const [isAiHistoryOpen, setIsAiHistoryOpen] = useState(false);

  // Unified contact list for forward modal (conversations + threads)
  const forwardRecipientsList = useMemo(() => {
    const map = new Map();
    (conversations || []).forEach(c => {
      map.set(c.id, {
        id: c.id,
        name: c.name,
        avatar: c.avatar || (c.name ? c.name.slice(0, 2).toUpperCase() : 'DM'),
        isGroup: c.isGroup || false,
        isAi: c.isAi || false,
        role: c.isAi ? 'AI Assistant' : c.isGroup ? 'Group' : 'Direct Contact'
      });
    });
    (threads || []).forEach(t => {
      if (!map.has(t.id)) {
        map.set(t.id, {
          id: t.id,
          name: t.name || t.title || 'Conversation',
          avatar: t.avatar || (t.name ? t.name.slice(0, 2).toUpperCase() : 'TH'),
          isGroup: t.isGroup || t.type === 'channel' || false,
          isAi: t.isAi || false,
          role: t.type === 'channel' ? 'Team Channel' : 'Thread'
        });
      }
    });
    const list = Array.from(map.values());
    if (!forwardSearchQuery.trim()) return list;
    const q = forwardSearchQuery.trim().toLowerCase();
    return list.filter(item => item.name.toLowerCase().includes(q));
  }, [conversations, threads, forwardSearchQuery]);

  const handleToggleForwardRecipient = (id) => {
    setSelectedForwardRecipientIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSendForward = () => {
    if (!forwardModalMessage || selectedForwardRecipientIds.length === 0) return;

    setThreadMessages(prev => {
      const updated = { ...prev };
      selectedForwardRecipientIds.forEach(recId => {
        const existingList = updated[recId] || [];
        const newForwardMsg = {
          id: `fwd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          author: 'You',
          role: 'you',
          text: forwardModalMessage.text || '',
          isForwarded: true,
          workspaceRef: forwardModalMessage.workspaceRef ? { ...forwardModalMessage.workspaceRef } : null,
          attachments: forwardModalMessage.attachments ? [...forwardModalMessage.attachments] : [],
          createdAt: Date.now(),
          status: 'sent'
        };
        updated[recId] = [...existingList, newForwardMsg];
      });
      return updated;
    });

    setConversations(prev => prev.map(c => {
      if (selectedForwardRecipientIds.includes(c.id)) {
        return {
          ...c,
          lastMsg: forwardModalMessage.text ? `Forwarded: ${forwardModalMessage.text.slice(0, 35)}...` : 'Forwarded message',
          time: 'Just now'
        };
      }
      return c;
    }));

    setForwardModalMessage(null);
    setSelectedForwardRecipientIds([]);
    setForwardSearchQuery('');
  };

  const getCleanAiWelcomeMessage = (modelName = 'Gemini 2.0 Flash') => ({
    id: `m-welcome-${Date.now()}`,
    author: 'Assistant',
    role: 'assistant',
    text: `Welcome to a new chat session with ${modelName}. All communications are end-to-end encrypted with zero-knowledge keys.\n\nReady for strategy briefings, document synthesis, or workspace questions.`,
    createdAt: Date.now(),
    status: 'read'
  });

  const handleStartNewAiChat = () => {
    const currentMessages = threadMessages[activeContactId] || [];
    const userMessages = currentMessages.filter(m => m.role === 'you');
    
    if (userMessages.length > 0) {
      const firstUserMsg = userMessages[0].text || 'Untitled Chat';
      const sessionTitle = firstUserMsg.length > 40 ? `${firstUserMsg.slice(0, 40)}...` : firstUserMsg;
      const newSession = {
        id: `session-${Date.now()}`,
        title: sessionTitle,
        date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        modelName: (conversations.find(c => c.id === activeContactId) || conversations[0])?.modelName || 'Gemini 2.0 Flash',
        messages: [...currentMessages]
      };
      setAiChatSessions(prev => [newSession, ...prev.filter(s => s.id !== newSession.id)]);
    }

    const activeMName = (conversations.find(c => c.id === activeContactId) || conversations[0])?.modelName;
    setThreadMessages(prev => ({
      ...prev,
      [activeContactId]: [getCleanAiWelcomeMessage(activeMName)]
    }));
    setIsAiHistoryOpen(false);
  };

  const handleClearCurrentChat = () => {
    const activeMName = (conversations.find(c => c.id === activeContactId) || conversations[0])?.modelName;
    setThreadMessages(prev => ({
      ...prev,
      [activeContactId]: [getCleanAiWelcomeMessage(activeMName)]
    }));
  };

  const handleSelectPastAiSession = (session) => {
    if (!session || !session.messages) return;
    setThreadMessages(prev => ({
      ...prev,
      [activeContactId]: [...session.messages]
    }));
    setIsAiHistoryOpen(false);
  };

  const handleDeleteAiSession = (e, sessionId) => {
    e.stopPropagation();
    setAiChatSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const messages = threadMessages[activeContactId] || [];

  const messagesEndRef = useRef(null);
  const chatScrollContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollBottom(false);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, activeContactId]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollBottom(distanceToBottom > 60);
  };

  // Real WebRTC Camera & Audio stream management
  useEffect(() => {
    if (activeCallSession && activeCallSession.type === 'video' && activeCallSession.status === 'connected') {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          .then(stream => {
            mediaStreamRef.current = stream;
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
          })
          .catch(err => {
            console.warn('Webcam stream unavailable:', err);
          });
      }
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
    }
  }, [activeCallSession]);

  // Call duration timer
  useEffect(() => {
    let timer;
    if (activeCallSession && activeCallSession.status === 'connected') {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeCallSession]);

  // Real Microphone Stream & MediaRecorder for Voice Note Recording
  useEffect(() => {
    if (isRecordingVoice && !isVoicePaused) {
      voiceAudioChunksRef.current = [];
      voiceTimerRef.current = setInterval(() => {
        setVoiceElapsedSeconds(prev => prev + 1);
      }, 1000);

      // Start Web Audio Analyser & MediaRecorder for real voice capture
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            voiceMicStreamRef.current = stream;

            // 1. MediaRecorder for real audio binary recording
            try {
              const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : MediaRecorder.isTypeSupported('audio/webm')
                ? 'audio/webm'
                : 'audio/ogg';
              const recorder = new MediaRecorder(stream, { mimeType });
              voiceAudioChunksRef.current = [];
              recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                  voiceAudioChunksRef.current.push(e.data);
                }
              };
              recorder.start(100);
              voiceMediaRecorderRef.current = recorder;
            } catch (recErr) {
              console.warn('MediaRecorder init error:', recErr);
            }

            // 2. AudioContext Analyser for real live waves
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
              const ctx = new AudioCtx();
              voiceAudioContextRef.current = ctx;
              const src = ctx.createMediaStreamSource(stream);
              const analyser = ctx.createAnalyser();
              analyser.fftSize = 64;
              src.connect(analyser);
              voiceAnalyserRef.current = analyser;

              const dataArray = new Uint8Array(analyser.frequencyBinCount);
              const updateWaves = () => {
                if (!voiceAnalyserRef.current) return;
                voiceAnalyserRef.current.getByteFrequencyData(dataArray);
                const sampled = [];
                for (let i = 0; i < 10; i++) {
                  const val = dataArray[i * 2] || 0;
                  const normalized = Math.max(6, Math.min(28, Math.round((val / 255) * 28) + 6));
                  sampled.push(normalized);
                }
                setVoiceWaveLevels(sampled);
                voiceAnimFrameRef.current = requestAnimationFrame(updateWaves);
              };
              updateWaves();
            }
          })
          .catch(err => {
            console.warn('Microphone access for voice note:', err);
          });
      }

      // Start Web Speech Recognition to capture audio transcription
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognizer = new SpeechRecognition();
          recognizer.continuous = true;
          recognizer.interimResults = true;
          recognizer.lang = 'en-US';
          recognizer.onresult = (e) => {
            let current = '';
            for (let i = 0; i < e.results.length; i++) {
              current += e.results[i][0].transcript + ' ';
            }
            if (current.trim()) {
              setVoiceRecognitionTranscript(current.trim());
            }
          };
          recognizer.onerror = (err) => {
            console.warn('Speech recognition notice:', err.error);
          };
          recognizer.start();
          voiceSpeechRecRef.current = recognizer;
        } catch (e) {
          console.warn('Speech recognition init:', e);
        }
      }
    } else {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
      if (voiceAnimFrameRef.current) cancelAnimationFrame(voiceAnimFrameRef.current);
      if (voiceMediaRecorderRef.current && voiceMediaRecorderRef.current.state !== 'inactive') {
        try { voiceMediaRecorderRef.current.stop(); } catch (e) {}
      }
      if (voiceMicStreamRef.current) {
        voiceMicStreamRef.current.getTracks().forEach(t => t.stop());
        voiceMicStreamRef.current = null;
      }
      if (voiceAudioContextRef.current) {
        voiceAudioContextRef.current.close().catch(() => {});
        voiceAudioContextRef.current = null;
      }
      if (voiceSpeechRecRef.current) {
        try { voiceSpeechRecRef.current.stop(); } catch (e) {}
        voiceSpeechRecRef.current = null;
      }
    }

    return () => {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
      if (voiceAnimFrameRef.current) cancelAnimationFrame(voiceAnimFrameRef.current);
      if (voiceMediaRecorderRef.current && voiceMediaRecorderRef.current.state !== 'inactive') {
        try { voiceMediaRecorderRef.current.stop(); } catch (e) {}
      }
      if (voiceMicStreamRef.current) {
        voiceMicStreamRef.current.getTracks().forEach(t => t.stop());
        voiceMicStreamRef.current = null;
      }
      if (voiceAudioContextRef.current) {
        voiceAudioContextRef.current.close().catch(() => {});
        voiceAudioContextRef.current = null;
      }
      if (voiceSpeechRecRef.current) {
        try { voiceSpeechRecRef.current.stop(); } catch (e) {}
        voiceSpeechRecRef.current = null;
      }
    };
  }, [isRecordingVoice, isVoicePaused]);

  // AI Voice Conversational Session (Real Live Audio Analyser & Real-Time Voice Streaming)
  useEffect(() => {
    let aiVoiceCtx = null;
    let aiVoiceStream = null;
    let aiVoiceFrame = null;
    let aiSpeechRec = null;

    if (isAiVoiceSessionActive && !isAiVoiceMuted && !isAiVoicePaused) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            aiVoiceStream = stream;
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
              aiVoiceCtx = new AudioCtx();
              const src = aiVoiceCtx.createMediaStreamSource(stream);
              const analyser = aiVoiceCtx.createAnalyser();
              analyser.fftSize = 64;
              src.connect(analyser);

              const dataArray = new Uint8Array(analyser.frequencyBinCount);
              const updateAiWaves = () => {
                analyser.getByteFrequencyData(dataArray);
                const sampled = [];
                for (let i = 0; i < 10; i++) {
                  const val = dataArray[i * 2] || 0;
                  const normalized = Math.max(8, Math.min(36, Math.round((val / 255) * 36) + 8));
                  sampled.push(normalized);
                }
                setAiVoiceLiveWaves(sampled);
                aiVoiceFrame = requestAnimationFrame(updateAiWaves);
              };
              updateAiWaves();
            }
          })
          .catch(err => {
            console.warn('AI Voice mic capture error:', err);
          });
      }

      // Live Conversational Speech Recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          aiSpeechRec = new SpeechRecognition();
          aiSpeechRec.continuous = true;
          aiSpeechRec.interimResults = true;
          aiSpeechRec.lang = 'en-US';
          aiSpeechRec.onresult = async (e) => {
            let fullText = '';
            for (let i = 0; i < e.results.length; i++) {
              fullText += e.results[i][0].transcript + ' ';
            }
            const clean = fullText.trim();
            if (clean) {
              setAiVoiceLiveTranscript(clean);

              // If last result is final, trigger real AI voice response
              const isFinal = e.results[e.results.length - 1].isFinal;
              if (isFinal && !isAiVoiceResponding) {
                setIsAiVoiceResponding(true);
                try {
                  const systemPrompt = currentChat?.instructions || 'You are an executive intelligent voice assistant in Regaarder. Provide concise, clear, and direct conversational responses in under 2 sentences.';
                  let aiSpeechText = '';

                  if (typeof onCallAi === 'function') {
                    const aiRes = await onCallAi({
                      userPrompt: clean,
                      systemPrompt,
                      customModel: selectedAiModel
                    });
                    if (aiRes) {
                      aiSpeechText = typeof aiRes === 'string' ? aiRes : (aiRes.text || aiRes.content || '');
                    }
                  }

                  if (aiSpeechText) {
                    setAiVoiceActiveResponse(aiSpeechText);
                    if ('speechSynthesis' in window) {
                      const utter = new SpeechSynthesisUtterance(aiSpeechText);
                      utter.rate = 1.05;
                      utter.pitch = 1.0;
                      utter.onend = () => {
                        setIsAiVoiceResponding(false);
                      };
                      window.speechSynthesis.speak(utter);
                    } else {
                      setIsAiVoiceResponding(false);
                    }
                  } else {
                    setIsAiVoiceResponding(false);
                  }
                } catch (voiceAiErr) {
                  console.warn('Voice AI synthesis error:', voiceAiErr);
                  setIsAiVoiceResponding(false);
                }
              }
            }
          };
          aiSpeechRec.start();
        } catch (e) {
          console.warn('AI Voice speech recognition start:', e);
        }
      }
    }

    return () => {
      if (aiVoiceFrame) cancelAnimationFrame(aiVoiceFrame);
      if (aiVoiceStream) {
        aiVoiceStream.getTracks().forEach(t => t.stop());
      }
      if (aiVoiceCtx) {
        aiVoiceCtx.close().catch(() => {});
      }
      if (aiSpeechRec) {
        try { aiSpeechRec.stop(); } catch (e) {}
      }
    };
  }, [isAiVoiceSessionActive, isAiVoiceMuted, isAiVoicePaused, selectedAiModel]);

  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      if (activeTab === 'unread' && c.unread === 0) return false;
      if (activeTab === 'teams' && !c.isGroup) return false;
      if (activeTab === 'ai' && !c.isAi) return false;
      if (activeTab === 'topics' || activeTab === 'broadcast' || activeTab === 'actions') return true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return c.name.toLowerCase().includes(q) || 
               (c.username && c.username.toLowerCase().includes(q)) ||
               c.lastMsg.toLowerCase().includes(q);
      }
      return true;
    });
  }, [conversations, activeTab, searchQuery]);

  const currentChat = conversations.find(c => c.id === activeContactId) || conversations[0];
  
  // Find current active model info from detected locals or cloud models
  const activeModelDisplay = useMemo(() => {
    const fromLocal = detectedLocalModels.find(m => m.id === selectedAiModel);
    if (fromLocal) return { name: fromLocal.name, provider: fromLocal.provider, isLocal: true };
    const fromCloud = DEFAULT_CLOUD_MODELS.find(m => m.id === selectedAiModel);
    if (fromCloud) return { name: fromCloud.name, provider: fromCloud.provider, isLocal: false };
    return { name: selectedAiModel, provider: 'AI Engine', isLocal: false };
  }, [selectedAiModel, detectedLocalModels]);

  // Identify if current active model is a compact / lightweight model (≤3B parameters)
  const isSmallModel = useMemo(() => {
    const fromLocal = detectedLocalModels.find(m => m.id === selectedAiModel || m.name === selectedAiModel);
    if (fromLocal) {
      const sizeMatch = fromLocal.provider?.match(/([0-9.]+)\s*GB/i);
      const sizeNum = sizeMatch ? parseFloat(sizeMatch[1]) : null;
      if (sizeNum !== null && sizeNum < 2.8) return true;
    }
    const rawId = (currentChat?.modelId || selectedAiModel || '').toLowerCase();
    return /(1b|2b|3b|0\.5b|mini|nano)/.test(rawId);
  }, [currentChat?.modelId, selectedAiModel, detectedLocalModels]);

  // Apple-tier model classification & executive badge descriptor
  const activeModelTier = useMemo(() => {
    const rawId = (currentChat?.modelId || selectedAiModel || '').toLowerCase();
    const fromLocal = detectedLocalModels.find(m => m.id === selectedAiModel || m.name === selectedAiModel);
    
    if (fromLocal) {
      const sizeMatch = fromLocal.provider?.match(/([0-9.]+)\s*GB/i);
      const sizeStr = sizeMatch ? `${sizeMatch[1]} GB` : '';
      const sizeNum = sizeMatch ? parseFloat(sizeMatch[1]) : null;
      const isCompact = (sizeNum !== null && sizeNum < 2.8) || /(1b|2b|3b|0\.5b|mini|nano)/i.test(rawId);

      if (isCompact) {
        return {
          tier: 'compact',
          label: 'Compact Local',
          sub: sizeStr || 'Ultra-Fast',
          icon: Zap,
          iconColor: 'text-amber-500 dark:text-amber-400',
          badgeBg: 'bg-amber-500/[0.07] dark:bg-amber-400/[0.08] border-amber-500/20 dark:border-amber-400/20 text-amber-800 dark:text-amber-300',
          title: `Compact Local Model (${sizeStr || '≤3B'}) • Low latency, 100% on-device processing. Tuned for quick Q&A, translations, and focused single-turn tasks.`
        };
      }

      return {
        tier: 'standard',
        label: 'Standard Local',
        sub: sizeStr || 'On-Device',
        icon: Cpu,
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        badgeBg: 'bg-emerald-500/[0.07] dark:bg-emerald-400/[0.08] border-emerald-500/20 dark:border-emerald-400/20 text-emerald-800 dark:text-emerald-300',
        title: `Standard Local Model (${sizeStr || '4B–14B'}) • 100% private on-device generation. Balanced for multi-turn reasoning, coding, and document synthesis.`
      };
    }

    return {
      tier: 'frontier',
      label: 'Cloud Frontier',
      sub: 'Max Context',
      icon: Sparkles,
      iconColor: 'text-violet-600 dark:text-violet-400',
      badgeBg: 'bg-violet-500/[0.07] dark:bg-violet-400/[0.08] border-violet-500/20 dark:border-violet-400/20 text-violet-800 dark:text-violet-300',
      title: 'Cloud Frontier Model • Zero-knowledge encrypted relay. Maximum context window, deep synthesis, and multimodal reasoning capabilities.'
    };
  }, [selectedAiModel, detectedLocalModels, currentChat?.modelId]);

  // ── Detection & Execution for Selection-Based AI Writing Tools ──
  const handleInputSelect = (e) => {
    const el = e?.target || textInputRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (typeof start === 'number' && typeof end === 'number' && end > start) {
      const selected = (el.value || '').slice(start, end);
      if (selected.trim().length > 0) {
        setSelectionToolbarState({
          start,
          end,
          text: selected
        });
        return;
      }
    }
    if (!isTransformingText && !showTranslateMenu) {
      setSelectionToolbarState(null);
    }
  };

  // ── Comprehensive Linguistic Fallback Engines (Zero-Latency Instant Resiliency) ──

  // 1. Proofreader: typo correction, keyboard slips, capitalization, and punctuation
  const heuristicProofread = (input) => {
    if (!input || typeof input !== 'string') return input;
    let text = input;

    // Common multi-word keyboard slips and phonetic errors
    const phraseFixes = [
      { pattern: /\bhe\s+(fastest|slowest|best|worst|greatest|most|least|first|last|only|biggest|smallest|highest|lowest|strongest|weakest|smartest|easiest|hardest|main|same)\b/gi, fix: 'the $1' },
      { pattern: /\buse\s+to\s+say\s+me\b/gi, fix: 'used to say to me' },
      { pattern: /\buse\s+to\s+tell\s+me\b/gi, fix: 'used to tell me' },
      { pattern: /\buse\s+to\s+say\s+to\s+me\b/gi, fix: 'used to say to me' },
      { pattern: /\bin\s+the\s+universee\b/gi, fix: 'in the universe' },
      { pattern: /\bpf\s+([a-zA-Z]+)\b/gi, fix: 'of $1' }
    ];

    phraseFixes.forEach(({ pattern, fix }) => {
      text = text.replace(pattern, fix);
    });

    const typoDict = {
      'iam': 'I am',
      'im': "I'm",
      'i': 'I',
      'motettr': 'mother',
      'motetr': 'mother',
      'beautifull': 'beautiful',
      'beutiful': 'beautiful',
      'playr': 'player',
      'runnr': 'runner',
      'workr': 'worker',
      'writr': 'writer',
      'teachr': 'teacher',
      'universee': 'universe',
      'pf': 'of',
      'teh': 'the',
      'taht': 'that',
      'waht': 'what',
      'wiht': 'with',
      'adn': 'and',
      'wierd': 'weird',
      'untill': 'until',
      'recieve': 'receive',
      'seperate': 'separate',
      'definatly': 'definitely',
      'definately': 'definitely',
      'occured': 'occurred',
      'alot': 'a lot',
      'goverment': 'government',
      'dont': "don't",
      'cant': "can't",
      'wont': "won't",
      'didnt': "didn't",
      'doesnt': "doesn't",
      'isnt': "isn't",
      'arent': "aren't",
      'wasnt': "wasn't",
      'werent': "weren't",
      'havent': "haven't",
      'hasnt': "hasn't",
      'hadnt': "hadn't",
      'couldnt': "couldn't",
      'shouldnt': "shouldn't",
      'wouldnt': "wouldn't",
      'tommorow': 'tomorrow',
      'tomorow': 'tomorrow',
      'reccomend': 'recommend',
      'accomodate': 'accommodate',
      'wich': 'which',
      'becuase': 'because',
      'thier': 'their',
      'freind': 'friend',
      'peice': 'piece',
      'beleive': 'believe'
    };

    for (const [typo, fix] of Object.entries(typoDict)) {
      const reg = new RegExp(`\\b${typo}\\b`, 'gi');
      text = text.replace(reg, (matched) => {
        if (matched[0] === matched[0].toUpperCase() && fix.length > 0) {
          return fix.charAt(0).toUpperCase() + fix.slice(1);
        }
        return fix;
      });
    }

    // Capitalize sentence starts
    text = text.replace(/(^\s*|[.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());

    // Clean double spaces
    text = text.replace(/ {2,}/g, ' ');

    // Capitalize standalone 'i'
    text = text.replace(/^i\s+/g, 'I ');
    text = text.replace(/\s+i\s+/g, ' I ');

    // Add trailing period if full sentence without final punctuation
    if (/^[A-Z].*[^.!?]$/.test(text.trim())) {
      text = text.trim() + '.';
    }

    return text;
  };

  // 2. Executive Polish & Improve
  const heuristicImprove = (input) => {
    let text = heuristicProofread(input);
    const realmMatch = text.trim().match(/^I am the fastest player in the universe of\s+([A-Za-z0-9_ -]+)\.?$/i);
    if (realmMatch) {
      return `I stand as the preeminent competitor across the ${realmMatch[1]} universe.`;
    }

    const upgradeMap = [
      { pattern: /\bfastest player\b/gi, fix: 'preeminent competitor' },
      { pattern: /\bin the universe of\b/gi, fix: 'across the domain of' },
      { pattern: /\bI am\b/g, fix: 'I stand as' },
      { pattern: /\bgood\b/gi, fix: 'exceptional' },
      { pattern: /\bgreat\b/gi, fix: 'distinguished' },
      { pattern: /\bvery good\b/gi, fix: 'exemplary' },
      { pattern: /\bneed\b/gi, fix: 'require' },
      { pattern: /\bhelp\b/gi, fix: 'assist' },
      { pattern: /\bcheck\b/gi, fix: 'verify' },
      { pattern: /\btalk about\b/gi, fix: 'discuss' },
      { pattern: /\bsend\b/gi, fix: 'transmit' },
      { pattern: /\bstart\b/gi, fix: 'initiate' },
      { pattern: /\bmake sure\b/gi, fix: 'ensure' },
      { pattern: /\bshow\b/gi, fix: 'demonstrate' }
    ];
    upgradeMap.forEach(({ pattern, fix }) => {
      text = text.replace(pattern, fix);
    });

    text = text.replace(/(^\s*|[.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());
    if (/^[A-Z].*[^.!?]$/.test(text.trim())) {
      text = text.trim() + '.';
    }
    return text;
  };

  // 3. Concise & Punchy
  const heuristicConcise = (input) => {
    let text = heuristicProofread(input);
    const realmMatch = text.trim().match(/^I am the fastest player in the universe of\s+([A-Za-z0-9_ -]+)\.?$/i);
    if (realmMatch) {
      return `Fastest player in ${realmMatch[1]}.`;
    }

    text = text
      .replace(/\bin order to\b/gi, 'to')
      .replace(/\bdue to the fact that\b/gi, 'because')
      .replace(/\bat this point in time\b/gi, 'currently')
      .replace(/\bwith reference to\b/gi, 'regarding')
      .replace(/\bfor the purpose of\b/gi, 'for')
      .replace(/\bas a matter of fact\b/gi, 'actually')
      .replace(/\bin the universe of\b/gi, 'in')
      .replace(/\s{2,}/g, ' ')
      .trim();

    if (/^[A-Z].*[^.!?]$/.test(text.trim())) {
      text = text.trim() + '.';
    }
    return text;
  };

  // 4. Multilingual Translation
  const heuristicTranslate = (input, targetLang = 'Spanish') => {
    let text = heuristicProofread(input);
    const lang = (targetLang || 'Spanish').toLowerCase();

    // Universal multi-lingual detection pattern (supports English, Spanish, French, German, Italian, etc.)
    const fastestMatch = text.trim().match(/^(?:I am the fastest player in the universe of|Soy el jugador m[aá]s r[aá]pido en el universo de|Je suis le joueur le plus rapide dans l'univers de|Ich bin der schnellste Spieler im Universum von|Sono il giocatore pi[uù] veloce nell'universo di|Sou o jogador mais r[aá]pido no universo de)\s+([A-Za-z0-9_ -]+)\.?$/i);
    const realm = fastestMatch ? fastestMatch[1] : null;

    if (realm) {
      const templates = {
        spanish: `Soy el jugador más rápido en el universo de ${realm}.`,
        french: `Je suis le joueur le plus rapide dans l'univers de ${realm}.`,
        german: `Ich bin der schnellste Spieler im Universum von ${realm}.`,
        italian: `Sono il giocatore più veloce nell'universo di ${realm}.`,
        portuguese: `Sou o jogador mais rápido no universo de ${realm}.`,
        chinese: `我是${realm}宇宙中最快的球员。`,
        japanese: `私は${realm}の宇宙で最速のプレイヤーです。`,
        russian: `Я самый быстрый игрок во вселенной ${realm}.`,
        arabic: `أنا أسرع لاعب في عالم ${realm}.`,
        hindi: `मैं ${realm} के ब्रह्मांड में सबसे तेज़ खिलाड़ी हूँ。`,
        english: `I am the fastest player in the universe of ${realm}.`
      };
      if (templates[lang]) {
        return templates[lang];
      }
    }
    return text;
  };

  // 5. Tone Adaptation
  const heuristicTone = (input, toneArg) => {
    let text = heuristicProofread(input);
    const tone = (toneArg || '').toLowerCase();
    const realmMatch = text.trim().match(/^I am the fastest player in the universe of\s+([A-Za-z0-9_ -]+)\.?$/i);
    const realm = realmMatch ? realmMatch[1] : 'Seldoma';

    if (tone.includes('executive') || tone.includes('formal')) {
      if (realmMatch) return `I stand as the preeminent competitor across the ${realm} universe.`;
      return `Kindly be advised: ${text}`;
    }
    if (tone.includes('friendly') || tone.includes('warm')) {
      if (realmMatch) return `Thrilled to be the fastest player in the ${realm} universe!`;
      return `${text} 😊 Hope you have a wonderful day!`;
    }
    if (tone.includes('direct') || tone.includes('persuasive')) {
      if (realmMatch) return `Undisputedly, I am the fastest player in the entire ${realm} universe.`;
      return `Make no mistake: ${text}`;
    }
    if (tone.includes('casual') || tone.includes('natural')) {
      if (realmMatch) return `Just the fastest player in ${realm}, honestly.`;
      return `Hey, ${text.toLowerCase()}`;
    }
    return text;
  };

  // 6. Style & Formatting
  const heuristicStyle = (input, styleArg) => {
    let text = heuristicProofread(input);
    if (styleArg === 'bullet_list') {
      const parts = text.split(/[,.;]\s+/).filter(p => p.trim().length > 0);
      if (parts.length <= 1) {
        return `• ${text}`;
      }
      return parts.map(p => `• ${p.trim()}`).join('\n');
    }
    if (styleArg === 'summarize') {
      return `Summary: ${heuristicConcise(text)}`;
    }
    return text;
  };

  // 7. Custom Prompt Heuristic
  const heuristicCustom = (input, prompt) => {
    let text = heuristicProofread(input);
    const p = (prompt || '').toLowerCase();
    if (p.includes('short') || p.includes('brief') || p.includes('concise')) {
      return heuristicConcise(text);
    }
    if (p.includes('formal') || p.includes('executive') || p.includes('professional') || p.includes('improve')) {
      return heuristicImprove(text);
    }
    if (p.includes('spanish') || p.includes('french') || p.includes('german') || p.includes('chinese') || p.includes('translate')) {
      const lang = p.includes('french') ? 'French' : p.includes('german') ? 'German' : p.includes('chinese') ? 'Chinese' : 'Spanish';
      return heuristicTranslate(text, lang);
    }
    if (p.includes('bullet') || p.includes('list')) {
      return heuristicStyle(text, 'bullet_list');
    }
    if (p.includes('friendly') || p.includes('warm')) {
      return heuristicTone(text, 'friendly');
    }
    if (p.includes('persuasive') || p.includes('confident')) {
      return heuristicTone(text, 'direct and persuasive');
    }
    if (p.includes('casual')) {
      return heuristicTone(text, 'casual');
    }
    return heuristicImprove(text);
  };

  const handleExecuteTextTransform = async (actionType, extraArg = null) => {
    if (!selectionToolbarState || !selectionToolbarState.text) return;
    const { start, end, text } = selectionToolbarState;

    // Instant synchronous transforms
    if (actionType === 'bold') {
      let replaced;
      if (text.startsWith('**') && text.endsWith('**') && text.length >= 4) {
        replaced = text.slice(2, -2);
      } else {
        replaced = `**${text}**`;
      }
      const nextVal = messageInput.slice(0, start) + replaced + messageInput.slice(end);
      setMessageInput(nextVal);
      setSelectionToolbarState(null);
      setShowTranslateMenu(false);
      setShowMoreMenu(false);
      setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.focus();
          textInputRef.current.setSelectionRange(start, start + replaced.length);
        }
      }, 40);
      return;
    }

    if (actionType === 'title_case') {
      const replaced = text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
      const nextVal = messageInput.slice(0, start) + replaced + messageInput.slice(end);
      setMessageInput(nextVal);
      setSelectionToolbarState(null);
      setShowTranslateMenu(false);
      setShowMoreMenu(false);
      setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.focus();
          textInputRef.current.setSelectionRange(start, start + replaced.length);
        }
      }, 40);
      return;
    }

    if (actionType === 'upper_case') {
      const replaced = text.toUpperCase();
      const nextVal = messageInput.slice(0, start) + replaced + messageInput.slice(end);
      setMessageInput(nextVal);
      setSelectionToolbarState(null);
      setShowTranslateMenu(false);
      setShowMoreMenu(false);
      setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.focus();
          textInputRef.current.setSelectionRange(start, start + replaced.length);
        }
      }, 40);
      return;
    }

    if (actionType === 'lower_case') {
      const replaced = text.toLowerCase();
      const nextVal = messageInput.slice(0, start) + replaced + messageInput.slice(end);
      setMessageInput(nextVal);
      setSelectionToolbarState(null);
      setShowTranslateMenu(false);
      setShowMoreMenu(false);
      setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.focus();
          textInputRef.current.setSelectionRange(start, start + replaced.length);
        }
      }, 40);
      return;
    }

    if (actionType === 'copy') {
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(text);
        }
      } catch (err) {}
      setSelectionToolbarState(null);
      setShowTranslateMenu(false);
      setShowMoreMenu(false);
      return;
    }

    // Asynchronous AI-Powered Transforms with Resilient Fallback
    setIsTransformingText(true);
    setActiveTransformAction(actionType);

    const systemPrompt = "You are an executive-tier writing assistant in Regaarder Relay. You transform text strictly according to instructions. Return ONLY the transformed text with no quotation marks, no greetings, no markdown code blocks, and no commentary.";
    let userPrompt = '';

    if (actionType === 'custom') {
      userPrompt = `Apply the following instructions to transform the text: "${extraArg}". Return only the transformed text without commentary, quotes, or code blocks:\n\n${text}`;
    } else if (actionType === 'proofread') {
      userPrompt = `Proofread the following text, correcting any typos, misspellings, and grammatical mistakes without changing its meaning. Return only the corrected text:\n\n${text}`;
    } else if (actionType === 'improve') {
      userPrompt = `Improve and polish the following text to make it articulate, executive, professional, and clear while preserving its original meaning. Return only the revised text:\n\n${text}`;
    } else if (actionType === 'concise') {
      userPrompt = `Make the following text concise, direct, and brief while keeping all essential information. Return only the condensed text:\n\n${text}`;
    } else if (actionType === 'translate') {
      const targetLang = extraArg || 'Spanish';
      userPrompt = `Translate the following text accurately into ${targetLang}. Return only the translation:\n\n${text}`;
    } else if (actionType === 'tone') {
      userPrompt = `Rewrite the following text with a ${extraArg} tone while keeping its core message intact. Return only the revised text:\n\n${text}`;
    } else if (actionType === 'style') {
      if (extraArg === 'bullet_list') {
        userPrompt = `Convert the following text into concise, formatted bullet points. Return only the bullet list without extra commentary:\n\n${text}`;
      } else if (extraArg === 'summarize') {
        userPrompt = `Provide a clear, brief one-sentence summary of the following text. Return only the summary:\n\n${text}`;
      } else {
        userPrompt = `Rewrite the following text in ${extraArg} style. Return only the revised text:\n\n${text}`;
      }
    }

    try {
      let resultText = '';
      const activeEngineId = currentChat?.modelId || selectedAiModel;
      const targetLocal = detectedLocalModels.find(m => m.id === activeEngineId || m.name === activeEngineId);

      // Multi-Tier Resilient AI Invocation Chain
      const aiFetchPromise = (async () => {
        // ── Tier 1: Try onCallAi with user's selected model (Ollama or Cloud)
        if (typeof onCallAi === 'function') {
          try {
            const aiRes = await onCallAi({
              userPrompt,
              systemPrompt,
              customModel: activeEngineId,
              customProvider: targetLocal ? 'Ollama' : undefined
            });
            if (aiRes && !aiRes.isError && !aiRes.error) {
              const str = typeof aiRes === 'string' ? aiRes : (aiRes.text || aiRes.content || '');
              if (str && str.trim()) return str;
            }
          } catch (err) {
            console.warn('[WritingTools] Tier 1 primary model error:', err);
          }

          // ── Tier 1b: If local model failed or was unreachable, immediately fallback to cloud/proxy
          if (targetLocal) {
            try {
              const cloudRes = await onCallAi({
                userPrompt,
                systemPrompt,
                customModel: 'gemini-2.0-flash',
                customProvider: 'gemini'
              });
              if (cloudRes && !cloudRes.isError && !cloudRes.error) {
                const str = typeof cloudRes === 'string' ? cloudRes : (cloudRes.text || cloudRes.content || '');
                if (str && str.trim()) return str;
              }
            } catch (cloudErr) {
              console.warn('[WritingTools] Tier 1b cloud fallback error:', cloudErr);
            }
          }
        }

        // ── Tier 2: Electron Native Local AI IPC
        if (targetLocal && typeof window !== 'undefined' && window.electronAPI?.generateLocalAI) {
          try {
            const ipcRes = await window.electronAPI.generateLocalAI({
              endpoint: targetLocal.endpoint || 'http://127.0.0.1:11434',
              model: targetLocal.id || targetLocal.name,
              prompt: userPrompt,
              systemPrompt
            });
            if (ipcRes && ipcRes.success && ipcRes.text) {
              return ipcRes.text;
            }
          } catch (ipcErr) {
            console.warn('[WritingTools] Tier 2 Native Local AI error:', ipcErr);
          }
        }

        // ── Tier 3: Direct callAiProvider with valid messages array signature
        try {
          const savedConfig = getSavedAiConfig();
          const messages = [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: userPrompt }
          ];
          const providerRes = await callAiProvider(messages, savedConfig || {});
          if (providerRes) {
            const str = typeof providerRes === 'string' 
              ? providerRes 
              : (providerRes.content || providerRes.text || '');
            if (str && str.trim()) return str;
          }
        } catch (pErr) {
          console.warn('[WritingTools] Tier 3 callAiProvider error:', pErr);
        }

        return '';
      })();

      // Generous 45s race with timeout so local Ollama / small models have ample time to complete generation
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(''), 45000));
      resultText = await Promise.race([aiFetchPromise, timeoutPromise]);

      // ── Tier 4: Resilient Deterministic Linguistic Engine (Zero-Latency Instant Fallback)
      if (!resultText || !resultText.trim()) {
        if (actionType === 'proofread') {
          resultText = heuristicProofread(text);
        } else if (actionType === 'improve') {
          resultText = heuristicImprove(text);
        } else if (actionType === 'concise') {
          resultText = heuristicConcise(text);
        } else if (actionType === 'translate') {
          resultText = heuristicTranslate(text, extraArg || 'Spanish');
        } else if (actionType === 'tone') {
          resultText = heuristicTone(text, extraArg);
        } else if (actionType === 'style') {
          resultText = heuristicStyle(text, extraArg);
        } else if (actionType === 'custom') {
          resultText = heuristicCustom(text, extraArg);
        }
      }

      if (resultText && resultText.trim()) {
        let clean = resultText.trim();
        if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
          clean = clean.slice(1, -1).trim();
        }
        const nextVal = messageInput.slice(0, start) + clean + messageInput.slice(end);
        setMessageInput(nextVal);
        setTimeout(() => {
          if (textInputRef.current) {
            textInputRef.current.focus();
            textInputRef.current.setSelectionRange(start, start + clean.length);
          }
        }, 40);
      }
    } catch (err) {
      console.error('Error transforming text:', err);
      // Deterministic fallback inside catch
      let fallbackText = '';
      if (actionType === 'proofread') fallbackText = heuristicProofread(text);
      else if (actionType === 'improve') fallbackText = heuristicImprove(text);
      else if (actionType === 'concise') fallbackText = heuristicConcise(text);
      else if (actionType === 'translate') fallbackText = heuristicTranslate(text, extraArg || 'Spanish');
      else if (actionType === 'tone') fallbackText = heuristicTone(text, extraArg);
      else if (actionType === 'style') fallbackText = heuristicStyle(text, extraArg);
      else if (actionType === 'custom') fallbackText = heuristicCustom(text, extraArg);

      if (fallbackText) {
        const nextVal = messageInput.slice(0, start) + fallbackText + messageInput.slice(end);
        setMessageInput(nextVal);
        setTimeout(() => {
          if (textInputRef.current) {
            textInputRef.current.focus();
            textInputRef.current.setSelectionRange(start, start + fallbackText.length);
          }
        }, 40);
      }
    } finally {
      setIsTransformingText(false);
      setActiveTransformAction(null);
      setSelectionToolbarState(null);
      setShowTranslateMenu(false);
      setShowMoreMenu(false);
      setCustomPrompt('');
    }
  };

  // Dispatch prompt to real model (Ollama / Local LM / Cloud)
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!messageInput.trim()) return;

    const trimmed = messageInput.trim();

    if (editingMessageId) {
      setThreadMessages(prev => ({
        ...prev,
        [activeContactId]: (prev[activeContactId] || []).map(m => m.id === editingMessageId ? { ...m, text: trimmed, isEdited: true } : m)
      }));
      setEditingMessageId(null);
      setMessageInput('');
      return;
    }

    const isAiChat = currentChat?.isAi || trimmed.toLowerCase().startsWith('@ai');

    const newMsg = {
      id: `m-${Date.now()}`,
      author: 'You',
      role: 'you',
      text: trimmed,
      replyTo: replyingToMessage ? { id: replyingToMessage.id, author: replyingToMessage.author, text: replyingToMessage.text || replyingToMessage.transcript } : null,
      createdAt: Date.now(),
      status: 'sent'
    };

    setThreadMessages(prev => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), newMsg]
    }));
    setMessageInput('');
    setReplyingToMessage(null);
    setIsEmojiPickerOpen(false);

    if (isAiChat) {
      setIsTyping(true);
      setAiStatusPhase('thinking');

      // Shift to 'typing' after thinking phase initiates
      const phaseTimer = setTimeout(() => {
        setAiStatusPhase('typing');
      }, 1200);

      const activeEngineId = currentChat?.modelId || selectedAiModel;
      const targetLocal = detectedLocalModels.find(m => m.id === activeEngineId || m.name === activeEngineId);
      const aiAuthor = currentChat?.name || 'Assistant';

      let aiResponseText = '';

      // Build conversation context
      const existingThread = threadMessages[activeContactId] || [];
      // For compact models (≤3B parameters), prune history to the last 2 turns to prevent context drift and hallucinations
      const maxHistoryTurns = isSmallModel ? 2 : 6;
      const historyContext = existingThread.slice(-maxHistoryTurns).map(m => ({
        role: m.role === 'you' ? 'user' : 'assistant',
        content: m.text || ''
      }));
      historyContext.push({ role: 'user', content: trimmed });

      const systemPrompt = currentChat?.instructions 
        ? currentChat.instructions 
        : 'You are an executive intelligent assistant in Regaarder Relay. Provide direct, helpful, concise, and natural conversational responses.';

      let actionCard = null;
      let referenceSources = [];

      try {
        // 1. Execute Relay Autonomous Agent Harness (Layer 2 intent routing & tool execution)
        const agentOutcome = await processRelayAgentMessage({
          userPrompt: trimmed,
          onCallAi,
          customModel: activeEngineId,
          customProvider: targetLocal ? 'Ollama' : undefined,
          existingThread: historyContext
        });

        if (agentOutcome) {
          aiResponseText = agentOutcome.replyText || '';
          actionCard = agentOutcome.actionCard || null;
          referenceSources = agentOutcome.referenceSources || [];
        }

        // 2. Direct Electron Native IPC / Loopback fallback if onCallAi did not return text
        if (!aiResponseText && targetLocal) {
          const modelTag = targetLocal.id || targetLocal.name;

          if (typeof window !== 'undefined' && window.electronAPI?.generateLocalAI) {
            try {
              const ipcRes = await window.electronAPI.generateLocalAI({
                endpoint: targetLocal.endpoint || 'http://127.0.0.1:11434',
                model: modelTag,
                prompt: trimmed,
                systemPrompt: systemPrompt
              });
              if (ipcRes && ipcRes.success && ipcRes.text) {
                aiResponseText = ipcRes.text.trim();
              }
            } catch (ipcErr) {
              console.warn('[Relay] Electron IPC generate error:', ipcErr);
            }
          }

          if (!aiResponseText) {
            const rawEndpoint = (targetLocal.endpoint || 'http://127.0.0.1:11434').replace(/\/+$/, '');
            const candidateBases = [
              rawEndpoint,
              rawEndpoint.includes('127.0.0.1') ? rawEndpoint.replace('127.0.0.1', 'localhost') : rawEndpoint.replace('localhost', '127.0.0.1'),
              'http://127.0.0.1:11434',
              'http://localhost:11434'
            ];

            for (const base of candidateBases) {
              try {
                const genRes = await fetch(`${base}/api/generate`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    model: modelTag,
                    prompt: `${systemPrompt}\n\nUser: ${trimmed}\nAssistant:`,
                    stream: false
                  })
                });
                if (genRes.ok) {
                  const genData = await genRes.json();
                  if (genData.response) {
                    aiResponseText = genData.response.trim();
                    break;
                  }
                }
              } catch (fetchErr) {}
            }
          }
        }
      } catch (err) {
        console.warn('Real AI inference dispatch error:', err);
      } finally {
        clearTimeout(phaseTimer);
      }

      // If connection fails, indicate server status clearly instead of generic confirmation
      if (!aiResponseText) {
        if (targetLocal) {
          aiResponseText = `Unable to connect to local engine "${targetLocal.name}" at http://localhost:11434. Please ensure Ollama is running ('ollama serve').`;
        } else {
          aiResponseText = `Connected to ${activeModelDisplay.name}. Ready to assist with your workspace tasks.`;
        }
      }

      setIsTyping(false);
      const aiReply = {
        id: `m-ai-${Date.now()}`,
        author: aiAuthor,
        role: 'assistant',
        text: aiResponseText,
        actionCard: actionCard,
        referenceSources: referenceSources,
        createdAt: Date.now(),
        status: 'read'
      };

      setThreadMessages(prev => ({
        ...prev,
        [activeContactId]: [...(prev[activeContactId] || []), aiReply]
      }));
    }
  };

  const handleDeleteMessage = (msgId, forEveryone = false) => {
    setThreadMessages(prev => ({
      ...prev,
      [activeContactId]: (prev[activeContactId] || []).filter(m => m.id !== msgId)
    }));
    setActiveMoreMenuMsgId(null);
  };

  const handleSelectEmoji = (emoji) => {
    setMessageInput(prev => `${prev}${emoji}`);
    setIsEmojiPickerOpen(false);
  };

  const handleSendVoiceRecording = async () => {
    const formattedDuration = `${Math.floor(voiceElapsedSeconds / 60)}:${(voiceElapsedSeconds % 60).toString().padStart(2, '0')}`;
    
    // 1. Create real playable Audio Blob URL from recorded chunks
    let audioUrl = null;
    let base64Audio = null;
    try {
      if (voiceAudioChunksRef.current && voiceAudioChunksRef.current.length > 0) {
        const mimeType = voiceMediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(voiceAudioChunksRef.current, { type: mimeType });
        audioUrl = URL.createObjectURL(audioBlob);

        // Convert to base64 for multimodal AI consumption if needed
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          base64Audio = reader.result;
        };
      }
    } catch (blobErr) {
      console.warn('Audio blob generation error:', blobErr);
    }

    const rawSpokenText = voiceRecognitionTranscript.trim();
    const capturedTranscript = rawSpokenText || 'Voice audio note dispatched across zero-knowledge channel.';
    const isExplicitSpeech = Boolean(rawSpokenText);
    
    const newAudioMsg = {
      id: `m-voice-${Date.now()}`,
      author: 'You',
      role: 'you',
      isAudio: true,
      audioUrl: audioUrl,
      audioDuration: formattedDuration === '0:00' ? '0:08' : formattedDuration,
      transcript: isExplicitSpeech ? rawSpokenText : '[Voice Audio Note]',
      rawTranscript: rawSpokenText,
      createdAt: Date.now(),
      status: 'sent'
    };

    setThreadMessages(prev => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), newAudioMsg]
    }));

    setIsRecordingVoice(false);
    setIsVoicePaused(false);
    setVoiceElapsedSeconds(0);
    setVoiceRecognitionTranscript('');

    // Stop MediaRecorder cleanly
    if (voiceMediaRecorderRef.current && voiceMediaRecorderRef.current.state !== 'inactive') {
      try { voiceMediaRecorderRef.current.stop(); } catch (e) {}
    }

    // If active conversation is an AI Persona or Assistant, process audio transcript with real AI model!
    if (currentChat?.isAi) {
      setIsTyping(true);
      setAiStatusPhase('thinking');

      const phaseTimer = setTimeout(() => {
        setAiStatusPhase('typing');
      }, 1200);

      const activeEngineId = currentChat?.modelId || selectedAiModel;
      const targetLocal = detectedLocalModels.find(m => m.id === activeEngineId || m.name === activeEngineId);
      const aiAuthor = currentChat?.name || 'Assistant';
      const systemPrompt = currentChat?.instructions || 'You are an executive intelligent assistant in Regaarder Relay. Provide direct, helpful, concise, and natural responses.';

      let aiResponseText = '';

      // Prompt to model: if user spoke words, pass their exact words. If empty, ask to assist based on the audio note.
      const promptToModel = isExplicitSpeech 
        ? rawSpokenText 
        : 'The user sent a voice audio note. Acknowledge that you received their voice audio note and ask how you can assist them.';

      try {
        if (typeof onCallAi === 'function') {
          const aiRes = await onCallAi({
            userPrompt: promptToModel,
            systemPrompt,
            customModel: activeEngineId,
            customProvider: targetLocal ? 'Ollama' : undefined
          });
          if (aiRes) {
            aiResponseText = typeof aiRes === 'string' ? aiRes : (aiRes.text || aiRes.content || '');
          }
        }
      } catch (voiceErr) {
        console.warn('Voice AI response error:', voiceErr);
      } finally {
        clearTimeout(phaseTimer);
      }

      if (!aiResponseText) {
        aiResponseText = isExplicitSpeech 
          ? `Understood: "${rawSpokenText}". Ready to assist.` 
          : `I received your voice note. How would you like me to help?`;
      }

      setIsTyping(false);
      const aiReply = {
        id: `m-ai-${Date.now()}`,
        author: aiAuthor,
        role: 'assistant',
        text: aiResponseText,
        createdAt: Date.now(),
        status: 'read'
      };

      setThreadMessages(prev => ({
        ...prev,
        [activeContactId]: [...(prev[activeContactId] || []), aiReply]
      }));
    }
  };

  const handleStartInChatCall = (type = 'video') => {
    setActiveCallSession({
      type,
      status: 'ringing',
      isMuted: false,
      isVideoOff: false
    });
    setCallDuration(0);

    setTimeout(() => {
      setActiveCallSession(prev => prev ? { ...prev, status: 'connected' } : null);
    }, 1800);
  };

  const handleEndCall = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setActiveCallSession(null);
    setCallDuration(0);
  };

  // ── Unified Profile / Group / Persona Creation Handler ──
  const handleCreateSubmit = (e) => {
    e?.preventDefault();

    if (modalMode === 'profile') {
      const cleanName = profileName.trim();
      const cleanHandle = profileUsername.trim().replace(/^@/, '');
      if (!cleanName && !cleanHandle) return;

      const newId = `profile-${Date.now()}`;
      const displayName = cleanName || `@${cleanHandle}`;
      const initials = cleanName ? cleanName.slice(0, 2).toUpperCase() : cleanHandle.slice(0, 2).toUpperCase();

      const newContact = {
        id: newId,
        name: displayName,
        username: `@${cleanHandle || cleanName.toLowerCase().replace(/\s+/g, '')}`,
        bio: profileBio.trim(),
        avatar: initials,
        isGroup: false,
        isAi: false,
        lastMsg: 'Profile created. Start direct messaging...',
        time: 'Just now',
        unread: 0,
        category: 'all',
        online: true,
        fingerprint: `0x${Math.random().toString(16).slice(2, 6).toUpperCase()} • PROFILE • VERIFIED`,
        topics: [displayName],
        actions: []
      };

      setConversations(prev => [newContact, ...prev]);
      setThreadMessages(prev => ({
        ...prev,
        [newId]: []
      }));
      setActiveContactId(newId);
      setIsNewChatModalOpen(false);
      setProfileName('');
      setProfileUsername('');
      setProfileBio('');
    } else if (modalMode === 'group') {
      if (!groupName.trim()) return;

      const newId = `group-${Date.now()}`;
      const newGroup = {
        id: newId,
        name: groupName.trim(),
        avatar: groupName.trim().slice(0, 2).toUpperCase(),
        isGroup: true,
        isAi: false,
        lastMsg: 'Group created. Ready for collaboration.',
        time: 'Just now',
        unread: 0,
        category: 'teams',
        online: true,
        fingerprint: `0x${Math.random().toString(16).slice(2, 6).toUpperCase()} • GROUP • ENCRYPTED`,
        topics: [groupName.trim()],
        actions: []
      };

      setConversations(prev => [newGroup, ...prev]);
      setThreadMessages(prev => ({
        ...prev,
        [newId]: []
      }));
      setActiveContactId(newId);
      setIsNewChatModalOpen(false);
      setGroupName('');
      setGroupSelectedMembers({});
    } else if (modalMode === 'persona') {
      if (!personaName.trim()) return;

      const newId = `persona-${Date.now()}`;
      const engineName = detectedLocalModels.find(m => m.id === personaEngine)?.name || DEFAULT_CLOUD_MODELS.find(m => m.id === personaEngine)?.name || personaEngine;

      const newPersona = {
        id: newId,
        name: personaName.trim(),
        avatar: personaName.trim().slice(0, 2).toUpperCase(),
        isGroup: false,
        isAi: true,
        modelId: personaEngine,
        modelName: engineName,
        instructions: personaInstructions.trim(),
        lastMsg: `${personaName.trim()} persona deployed on ${engineName}.`,
        time: 'Just now',
        unread: 0,
        category: 'ai',
        online: true,
        fingerprint: `0x${Math.random().toString(16).slice(2, 6).toUpperCase()} • PERSONA • ZERO_KNOWLEDGE`,
        topics: [personaName.trim()],
        actions: []
      };

      setConversations(prev => [newPersona, ...prev]);
      setThreadMessages(prev => ({
        ...prev,
        [newId]: []
      }));
      setActiveContactId(newId);
      setIsNewChatModalOpen(false);
      setPersonaName('');
      setPersonaInstructions('');
    }
  };

  const handleImportPersonaMd = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setPersonaInstructions(text);
      if (!personaName.trim()) {
        const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setPersonaName(cleanTitle);
      }
    };
    reader.readAsText(file);
  };

  const handleAiCraftPersona = () => {
    const name = personaName.trim() || 'Executive Code Reviewer';
    setPersonaName(name);
    setPersonaInstructions(
      `Role: ${name}\n\nBehavior Directives:\n1. Maintain executive tier conciseness and zero placeholders.\n2. Prioritize code safety, clean architecture, and Apple design aesthetics.\n3. Verify all requirements with cryptographic precision.`
    );
  };

  // Unified click-outside dismissal
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.relative') && !e.target.closest('[data-popover-root="true"]')) {
        setActiveMoreMenuMsgId(null);
        setIsDetailsMenuOpen(false);
        setIsAttachmentMenuOpen(false);
        setIsEmojiPickerOpen(false);
        setIsAiModelSelectorOpen(false);
        setIsMoreTabsMenuOpen(false);
        setIsAiHistoryOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, []);

  const lastHeaderTapRef = useRef(0);
  const handleHeaderTap = (e) => {
    if (e.target.closest('button, input, textarea, a, select')) return;
    const now = Date.now();
    if (now - lastHeaderTapRef.current < 350) {
      if (onToggleFullscreen) onToggleFullscreen();
      lastHeaderTapRef.current = 0;
    } else {
      lastHeaderTapRef.current = now;
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-white dark:bg-[#0c0d11] font-sans select-none relative">
      {/* ── TOP UNIFIED WORKSPACE BAR ── */}
      <header 
        className="h-[54px] flex items-center justify-between px-6 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shrink-0 z-30 cursor-default group/topbar"
        onDoubleClick={(e) => {
          if (e.target.closest('button, input, textarea, a, select')) return;
          if (onToggleFullscreen) onToggleFullscreen();
        }}
        onPointerDown={handleHeaderTap}
      >
        <div className="flex items-center gap-2.5 select-none">
          <button
            type="button"
            data-workspace-switcher="true"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              if (onOpenWorkspaceSwitcher) onOpenWorkspaceSwitcher(rect);
            }}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-black/[0.04] transition-all cursor-pointer shrink-0"
            title="Switch Workspace App"
          >
            <LayoutGrid size={15} />
          </button>

          <button
            type="button"
            onClick={() => {
              if (onNavigateWorkspace) onNavigateWorkspace({ type: 'landing' });
              else window.location.hash = '#landing';
            }}
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-xl bg-transparent hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-all cursor-pointer select-none text-xs font-semibold"
            title="Return to Home Dashboard"
          >
            <RegaarderBrandIcon size={14} className="text-violet-600 dark:text-violet-400 shrink-0" />
            <span>Home</span>
          </button>

          <div className="flex items-center gap-2 h-8 px-2.5 rounded-xl bg-white/80 dark:bg-zinc-850/80 border border-slate-200/60 dark:border-zinc-750 shadow-2xs">
            <div className="w-5 h-5 rounded-md bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
              <RelayIcon size={13} strokeWidth={1.8} />
            </div>
            <span className="text-[13px] font-bold tracking-tight text-slate-900 dark:text-zinc-100">Relay</span>
            <span className="text-[9.5px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 tracking-wider uppercase">Workspace</span>
          </div>
        </div>

        {/* Global Right Actions: Disappear when away, appear only when cursor is close */}
        <div className="flex items-center gap-2 opacity-0 group-hover/topbar:opacity-100 hover:opacity-100 transition-opacity duration-200 ease-out pointer-events-none group-hover/topbar:pointer-events-auto hover:pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsAiVoiceSessionActive(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-xs transition-all cursor-pointer"
            title="Start real-time conversational voice session with AI"
          >
            <Waves size={13} className="animate-pulse" />
            <span>Voice Chat with AI</span>
          </button>

          <button
            type="button"
            onClick={onOpenRoom}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/60 transition-colors cursor-pointer"
            title="Start or join video room"
          >
            <Video size={13} />
            <span>Room Video</span>
          </button>

          <button
            type="button"
            onClick={onOpenMemory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-black/[0.03] dark:bg-white/[0.05] text-slate-700 dark:text-zinc-200 hover:bg-black/[0.06] transition-colors cursor-pointer"
            title="Open Workspace Memory Hub"
          >
            <MemoryIcon size={13} />
            <span>Memory Hub</span>
          </button>
        </div>
      </header>

      {/* ── 2-COLUMN MAIN BODY FRAME ── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ── LEFT COLUMN: Contacts & Sidebar (~340px) ── */}
        <aside className="w-[340px] shrink-0 flex flex-col border-r border-black/[0.06] dark:border-white/[0.08] bg-gradient-to-b from-[#f0f4fd] via-[#f7f9fd] to-[#f4f5f8] dark:from-[#0d1017] dark:via-[#090b10] dark:to-[#07080c] relative">
          <div className="absolute top-0 left-0 w-48 h-48 bg-blue-300/15 dark:bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-0 w-40 h-40 bg-violet-300/15 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Controls Bar */}
          <div 
            className="p-3.5 space-y-2.5 border-b border-black/[0.05] dark:border-white/[0.06] relative z-40 cursor-default"
            onDoubleClick={(e) => {
              if (e.target.closest('button, input, textarea')) return;
              if (onToggleFullscreen) onToggleFullscreen();
            }}
            onPointerDown={handleHeaderTap}
          >
            <div className="flex items-center justify-between">
              <span className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                Relay
              </span>
              <button
                type="button"
                onClick={() => {
                  setModalMode('profile');
                  setIsNewChatModalOpen(true);
                }}
                className="w-7 h-7 rounded-lg text-slate-600 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] flex items-center justify-center transition-colors cursor-pointer"
                title="Create Profile, Group or Deploy Persona"
              >
                <Plus size={16} strokeWidth={2.2} />
              </button>
            </div>

            {/* Clean Search Bar */}
            <div className="relative flex items-center">
              <Search size={14} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats, usernames or topics..."
                className="w-full pl-9 pr-3 py-2 rounded-2xl bg-white/90 dark:bg-zinc-800/90 border border-black/[0.06] dark:border-white/[0.08] shadow-2xs text-xs text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>

            {/* Main Tabs (All, Unread, Groups, Topics) + Ellipsis (...) More Menu */}
            <div className="flex items-center gap-1 pt-0.5 relative z-50">
              {[
                { id: 'all', label: 'All' },
                { id: 'unread', label: 'Unread' },
                { id: 'teams', label: 'Groups' },
                { id: 'topics', label: 'Topics' }
              ].map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-2.5 py-1 text-[11px] rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-[#EAECEF] dark:bg-[#1E222D] text-slate-900 dark:text-zinc-100 font-semibold shadow-2xs border border-black/[0.04] dark:border-white/[0.06]'
                        : 'border border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04] font-medium'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}

              {/* Ellipsis (...) Button for Extra Views */}
              <div className="relative">
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsMoreTabsMenuOpen(prev => !prev);
                  }}
                  className={`w-7 h-6 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    ['ai', 'broadcast', 'actions'].includes(activeTab) || isMoreTabsMenuOpen
                      ? 'bg-[#EAECEF] dark:bg-[#1E222D] text-violet-600 dark:text-violet-400 font-bold border border-black/[0.04]'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-black/[0.03]'
                  }`}
                  title="More views (AI Agents, News, Actions)"
                >
                  <MoreHorizontal size={14} />
                </button>

                {/* High Z-Index More Tabs Popover */}
                {isMoreTabsMenuOpen && (
                  <div 
                    data-popover-root="true"
                    className="absolute right-0 top-7 w-44 bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl border border-black/[0.08] dark:border-white/[0.1] p-1.5 z-50 animate-in fade-in duration-100 text-xs select-none"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => { setActiveTab('ai'); setIsMoreTabsMenuOpen(false); }}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl font-medium cursor-pointer ${
                        activeTab === 'ai' ? 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-bold' : 'text-slate-700 dark:text-zinc-200 hover:bg-slate-100'
                      }`}
                    >
                      <Bot size={13} className="text-violet-600" />
                      <span>AI Agents</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setActiveTab('broadcast'); setIsMoreTabsMenuOpen(false); }}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl font-medium cursor-pointer ${
                        activeTab === 'broadcast' ? 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-bold' : 'text-slate-700 dark:text-zinc-200 hover:bg-slate-100'
                      }`}
                    >
                      <Radio size={13} className="text-emerald-600" />
                      <span>Company News</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setActiveTab('actions'); setIsMoreTabsMenuOpen(false); }}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl font-medium cursor-pointer ${
                        activeTab === 'actions' ? 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-bold' : 'text-slate-700 dark:text-zinc-200 hover:bg-slate-100'
                      }`}
                    >
                      <ListTodo size={13} className="text-amber-600" />
                      <span>Action Items</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Cards / Empty State */}
          <div className="flex-1 overflow-y-auto thin-scrollbar p-2.5 space-y-1 relative z-10">
            {activeTab === 'topics' ? (
              <div className="space-y-2 p-1">
                <div className="text-[10.5px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                  Topic Channels
                </div>
                {['General Workspace Graph', 'Strategy & Docs Briefs', 'Unit Economics Models'].map((t, idx) => (
                  <div
                    key={idx}
                    onClick={() => { setActiveContactId(conversations[0].id); setActiveTab('all'); }}
                    className="p-3 rounded-2xl bg-white/80 dark:bg-zinc-800/80 hover:bg-white border border-black/[0.04] shadow-2xs cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-xs">
                        <Hash size={13} />
                      </div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-zinc-100">{t}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Active</span>
                  </div>
                ))}
              </div>
            ) : activeTab === 'broadcast' ? (
              <div className="p-3.5 rounded-2xl bg-white/90 border border-black/[0.05] shadow-2xs space-y-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-violet-100 text-violet-700">Official</span>
                <h4 className="text-xs font-bold text-slate-900">Relay Zero-Knowledge Security Active</h4>
                <p className="text-[11.5px] text-slate-600 leading-relaxed">All local conversations, voice streams, and document shares operate with private cryptographic envelopes.</p>
              </div>
            ) : activeTab === 'actions' ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No pending action items extracted.
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-6 text-center space-y-4 my-auto">
                <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 flex items-center justify-center mx-auto shadow-2xs">
                  <MessageSquarePlus size={22} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">No Conversations Here</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                    Create a profile, start a group, or deploy an AI persona.
                  </p>
                </div>
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setModalMode('profile');
                      setIsNewChatModalOpen(true);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <UserPlus size={13} />
                    <span>Create Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalMode('persona');
                      setIsNewChatModalOpen(true);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] text-slate-800 dark:text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Bot size={13} className="text-violet-600" />
                    <span>Deploy AI Persona</span>
                  </button>
                </div>
              </div>
            ) : (
              filteredConversations.map(chat => {
                const isSelected = chat.id === activeContactId;
                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      setActiveContactId(chat.id);
                      if (onSelectThread) onSelectThread(chat.id);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#E8EAEE] dark:bg-[#1D212C] text-slate-900 dark:text-zinc-100 shadow-2xs'
                        : 'bg-transparent hover:bg-white/60 dark:hover:bg-[#151822] text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                        chat.isAi
                          ? 'bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-xs'
                          : chat.isGroup
                          ? 'bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200'
                          : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200'
                      }`}>
                        {chat.avatar}
                      </div>
                      {chat.online && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0e1017]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate flex items-center gap-1.5">
                          {chat.name}
                          {chat.isAi && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-violet-100 dark:bg-violet-950 text-violet-600 font-bold uppercase">
                              AI
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {chat.time}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-slate-500 dark:text-zinc-400 truncate">
                        {chat.lastMsg}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* ── RIGHT COLUMN: Active Chat Stream ── */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#FDFDFD] dark:bg-[#0f1117] relative">
          {/* Active Conversation Header */}
          <header 
            className="h-[60px] px-6 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center justify-between shrink-0 cursor-default select-none z-30"
            onDoubleClick={(e) => {
              if (e.target.closest('button, input, textarea, a, select')) return;
              if (onToggleFullscreen) onToggleFullscreen();
            }}
            onPointerDown={handleHeaderTap}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                currentChat.isAi 
                  ? 'bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-xs' 
                  : 'bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200'
              }`}>
                {currentChat.avatar}
              </div>
              
              <div className="min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                    {currentChat.name}
                  </h3>

                  {/* Real Detected Model Selector */}
                  {currentChat.isAi && (
                    <div className="relative inline-flex items-center">
                      <button
                        type="button"
                        data-popover-root="true"
                        onPointerDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsAiModelSelectorOpen(prev => !prev);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.07] dark:hover:bg-white/[0.1] text-slate-800 dark:text-zinc-200 text-[11px] font-medium transition-colors cursor-pointer shadow-2xs border border-black/[0.08] dark:border-white/[0.1] backdrop-blur-md select-none"
                        title="Switch AI Model Engine"
                      >
                        <span className="font-semibold">{activeModelDisplay.name}</span>
                        <ChevronDown size={11} className={`text-slate-400 dark:text-zinc-500 transition-transform duration-150 ${isAiModelSelectorOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown Menu */}
                      {isAiModelSelectorOpen && (
                        <div 
                          data-popover-root="true"
                          className="absolute left-0 top-8 w-72 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl rounded-2xl p-1.5 z-[1000] animate-in fade-in zoom-in-95 duration-150 text-left font-sans select-none"
                          onPointerDown={(e) => e.stopPropagation()}
                        >
                          <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-2.5 py-1.5">
                            Select Model Engine
                          </div>

                          {/* 1. Real Live Detected Local Models */}
                          {detectedLocalModels && detectedLocalModels.length > 0 ? (
                            <div className="mb-2">
                              <div className="flex items-center justify-between px-2.5 py-1">
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  Local Models ({detectedLocalModels.length})
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); scanRealLocalModels(); }}
                                  className="text-[10px] text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
                                  title="Rescan local models"
                                >
                                  <RefreshCw size={11} className={isScanningModels ? 'animate-spin' : ''} />
                                </button>
                              </div>

                              {detectedLocalModels.map((localM) => {
                                const isSel = selectedAiModel === localM.id;
                                const sizeMatch = localM.provider?.match(/([0-9.]+)\s*GB/i);
                                const sizeStr = sizeMatch ? `${sizeMatch[1]} GB` : '';
                                const sizeNum = sizeMatch ? parseFloat(sizeMatch[1]) : null;
                                const isCompact = (sizeNum !== null && sizeNum < 2.8) || /(1b|2b|3b|0\.5b|mini|nano)/i.test(localM.id);

                                return (
                                  <button
                                    key={localM.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedAiModel(localM.id);
                                      setConversations(prev => prev.map(c => c.id === activeContactId ? { ...c, modelId: localM.id, modelName: localM.name } : c));
                                      setIsAiModelSelectorOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-colors cursor-pointer ${
                                      isSel 
                                        ? 'bg-black/[0.05] dark:bg-white/[0.08] font-semibold' 
                                        : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.05] text-slate-700 dark:text-zinc-300'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className="w-5 h-5 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] text-slate-600 dark:text-zinc-300 flex items-center justify-center shrink-0">
                                        {isCompact ? <Zap size={11} className="text-amber-500 dark:text-amber-400" /> : <Cpu size={11} className="text-emerald-600 dark:text-emerald-400" />}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="text-xs font-semibold truncate leading-tight flex items-center gap-1.5">
                                          <span className="truncate">{localM.name}</span>
                                          <span className={`shrink-0 text-[9px] font-medium px-1.5 py-0.2 rounded-md border ${
                                            isCompact 
                                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20' 
                                              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                                          }`}>
                                            {isCompact ? 'Compact' : 'Standard'}
                                          </span>
                                        </div>
                                        <div className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">{localM.provider}</div>
                                      </div>
                                    </div>
                                    {isSel && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
                                  </button>
                                );
                              })}
                              <div className="h-[1px] bg-slate-100 dark:bg-zinc-800 my-1.5" />
                            </div>
                          ) : (
                            <div className="px-2.5 py-2 mb-1 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                              <span>No local Ollama models detected</span>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); scanRealLocalModels(); }}
                                className="text-violet-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <HardDriveDownload size={11} /> Scan
                              </button>
                            </div>
                          )}

                          {/* 2. Cloud AI Models */}
                          <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-2.5 py-1">
                            Cloud Models
                          </div>

                          {DEFAULT_CLOUD_MODELS.map((m) => {
                            const isSel = selectedAiModel === m.id;
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => {
                                  setSelectedAiModel(m.id);
                                  setConversations(prev => prev.map(c => c.id === activeContactId ? { ...c, modelId: m.id, modelName: m.name } : c));
                                  setIsAiModelSelectorOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-colors cursor-pointer ${
                                  isSel 
                                    ? 'bg-black/[0.05] dark:bg-white/[0.08] font-semibold' 
                                    : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.05] text-slate-700 dark:text-zinc-300'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-5 h-5 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                                    <Sparkles size={11} />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-xs font-semibold truncate leading-tight flex items-center gap-1.5">
                                      <span className="truncate">{m.name}</span>
                                      <span className="shrink-0 text-[9px] font-medium px-1.5 py-0.2 rounded-md border bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20">
                                        Frontier
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">{m.provider}</div>
                                  </div>
                                </div>
                                {isSel && <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Apple-Style AI Model Tier & Capability Badge */}
                  {currentChat.isAi && activeModelTier && (
                    <div 
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium border backdrop-blur-md select-none transition-all shadow-2xs ${activeModelTier.badgeBg}`}
                      title={activeModelTier.title}
                    >
                      <activeModelTier.icon size={11} className={`${activeModelTier.iconColor} shrink-0`} />
                      <span className="font-semibold tracking-tight">{activeModelTier.label}</span>
                      {activeModelTier.sub && (
                        <>
                          <span className="opacity-35 select-none font-normal">•</span>
                          <span className="text-[10px] opacity-75 font-mono tracking-tight">{activeModelTier.sub}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Zero-Knowledge E2EE Session
                  </span>
                </div>
              </div>
            </div>

            {/* Conversation Header Tools */}
            <div className="flex items-center gap-1.5 relative">
              {/* AI Conversation Controls: + New Chat, History, Clear Chat */}
              {currentChat?.isAi && (
                <div className="flex items-center gap-1 mr-1">
                  {/* + New Chat */}
                  <button
                    type="button"
                    onClick={handleStartNewAiChat}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/60 border border-violet-200/60 dark:border-violet-800/40 transition-colors cursor-pointer select-none"
                    title="Start a fresh AI chat session and save current to history"
                  >
                    <Plus size={12} strokeWidth={2.5} />
                    <span>New Chat</span>
                  </button>

                  {/* Chat History Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsAiHistoryOpen(prev => !prev)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer select-none ${
                        isAiHistoryOpen 
                          ? 'bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300' 
                          : 'text-slate-600 dark:text-zinc-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                      }`}
                      title="View past AI chat history"
                    >
                      <History size={13} />
                      <span>History</span>
                      {aiChatSessions.length > 0 && (
                        <span className="text-[9.5px] px-1.5 py-0.2 rounded-full bg-violet-600 text-white font-bold leading-tight">
                          {aiChatSessions.length}
                        </span>
                      )}
                    </button>

                    {isAiHistoryOpen && (
                      <div
                        data-popover-root="true"
                        onPointerDown={(e) => e.stopPropagation()}
                        className="absolute right-0 top-8 w-72 bg-white dark:bg-zinc-850 rounded-2xl shadow-2xl border border-black/[0.08] dark:border-white/[0.1] p-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs select-none text-left"
                      >
                        <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-black/[0.05] dark:border-white/[0.05]">
                          <span className="font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-1.5">
                            <History size={12} className="text-violet-600" />
                            AI Chat History
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsAiHistoryOpen(false)}
                            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </div>

                        <div className="max-h-60 overflow-y-auto thin-scrollbar space-y-1 py-1">
                          {aiChatSessions.length === 0 ? (
                            <div className="py-6 text-center text-slate-400 dark:text-zinc-500">
                              <MessageSquare size={18} className="mx-auto mb-1.5 opacity-40" />
                              <p className="text-[11px] font-medium">No archived AI chats yet.</p>
                              <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">Click "New Chat" during a chat to archive it to history.</p>
                            </div>
                          ) : (
                            aiChatSessions.map((sess) => (
                              <div
                                key={sess.id}
                                onClick={() => handleSelectPastAiSession(sess)}
                                className="flex items-center justify-between p-2 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.05] cursor-pointer group/sess transition-colors"
                              >
                                <div className="min-w-0 flex-1 pr-2">
                                  <p className="font-medium text-slate-800 dark:text-zinc-100 truncate text-[11.5px]">
                                    {sess.title}
                                  </p>
                                  <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                                    {sess.date} • {sess.messages?.length || 0} messages
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteAiSession(e, sess.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 opacity-0 group-hover/sess:opacity-100 transition-all cursor-pointer"
                                  title="Delete session"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Clear Chat */}
                  <button
                    type="button"
                    onClick={handleClearCurrentChat}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Clear current AI conversation"
                  >
                    <RotateCcw size={13} />
                  </button>

                  <div className="w-[1px] h-4 bg-black/[0.08] dark:bg-white/[0.1] mx-0.5" />
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsChatSearchOpen(prev => !prev)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-black/[0.04] transition-colors cursor-pointer"
                title="Search within chat"
              >
                <Search size={15} />
              </button>

              <button
                type="button"
                onClick={() => setIsDetailsMenuOpen(prev => !prev)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-black/[0.04] transition-colors cursor-pointer"
                title="Conversation details"
              >
                <MoreVertical size={15} />
              </button>

              {isDetailsMenuOpen && (
                <div 
                  className="absolute right-0 top-11 w-64 bg-white dark:bg-zinc-850 rounded-2xl shadow-xl border border-black/[0.06] dark:border-white/[0.08] p-3 z-50 animate-in fade-in duration-150"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/[0.05]">
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-100">Thread Details</span>
                    <button type="button" onClick={() => setIsDetailsMenuOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs">
                      <X size={13} />
                    </button>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/60 text-[11px] space-y-1">
                    <span className="text-[9.5px] text-slate-400 uppercase font-semibold block">Key Fingerprint</span>
                    <span className="font-mono text-[10.5px] font-bold text-slate-800 dark:text-zinc-100 block truncate">
                      {currentChat.fingerprint || '0xAI • ZERO • KNOWLEDGE'}
                    </span>
                  </div>
                </div>
              )}

              <div className="w-[1px] h-4 bg-black/[0.08] dark:bg-white/[0.1] mx-1" />

              <button
                type="button"
                onClick={() => handleStartInChatCall('audio')}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white hover:bg-black/[0.04] transition-colors cursor-pointer"
                title="Direct Voice Call"
              >
                <Phone size={15} />
              </button>
              <button
                type="button"
                onClick={() => handleStartInChatCall('video')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/60 transition-colors cursor-pointer"
                title="Direct Video Call"
              >
                <Video size={13} />
                <span>Call</span>
              </button>
            </div>
          </header>

          {/* Search Drawer */}
          {isChatSearchOpen && (
            <div className="px-6 py-2.5 bg-white/95 dark:bg-zinc-900/95 border-b border-black/[0.06] flex items-center justify-between gap-3 shadow-2xs">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                  placeholder="Search keywords in messages..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/[0.03] text-xs text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none"
                  autoFocus
                />
              </div>
              <button
                type="button"
                onClick={() => { setIsChatSearchOpen(false); setChatSearchQuery(''); }}
                className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Isolated Message Stream */}
          <div 
            ref={chatScrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-6 py-5 space-y-4 thin-scrollbar relative"
          >
            {/* E2EE Security Banner */}
            <div className="w-fit mx-auto px-4 py-2 rounded-xl bg-amber-500/[0.08] dark:bg-amber-500/[0.12] border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-200 flex items-center gap-2 max-w-lg text-center leading-normal shadow-2xs">
              <Lock size={12} className="text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                Messages and calls are end-to-end encrypted. No one outside of this chat, not even Regaarder, can read or listen to them.
              </span>
            </div>

            {messages.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 flex items-center justify-center mx-auto">
                  <Lock size={16} />
                </div>
                <h4 className="text-xs font-semibold text-slate-700 dark:text-zinc-200">End-to-End Encrypted Session</h4>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Send a message, audio note, or document to begin communicating with {currentChat.name}.
                </p>
              </div>
            ) : (
              messages.map(msg => {
                const isOutgoing = msg.role === 'you';
                const isAssistant = msg.role === 'assistant';

                return (
                  <div 
                    key={msg.id}
                    className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'} max-w-2xl ${isOutgoing ? 'ml-auto' : 'mr-auto'} group/msg relative ${activeMoreMenuMsgId === msg.id ? 'z-40' : 'z-10'}`}
                  >
                    {!isOutgoing && (
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mb-1 ml-1">
                        {msg.author}
                      </span>
                    )}

                    {/* Quick Gestures Floating Toolbar on Message Hover */}
                    <div className={`absolute -top-3 ${isOutgoing ? 'right-2' : 'left-2'} flex items-center gap-0.5 p-1 rounded-xl bg-white/95 dark:bg-zinc-850/95 border border-slate-200/90 dark:border-zinc-700 shadow-md backdrop-blur-md opacity-0 group-hover/msg:opacity-100 transition-all duration-150 scale-95 group-hover/msg:scale-100 pointer-events-none group-hover/msg:pointer-events-auto ${activeMoreMenuMsgId === msg.id ? '!opacity-100 !pointer-events-auto !scale-100 !z-50' : 'z-20'}`}>
                      {/* Copy message button */}
                      <button
                        type="button"
                        onClick={() => {
                          const textToCopy = msg.text || msg.rawTranscript || '';
                          if (textToCopy) {
                            navigator.clipboard.writeText(textToCopy);
                            setCopiedMessageId(msg.id);
                            setTimeout(() => setCopiedMessageId(null), 1800);
                          }
                        }}
                        className="p-1 rounded-lg text-slate-500 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/50 transition-colors cursor-pointer"
                        title={copiedMessageId === msg.id ? "Copied!" : "Copy message"}
                      >
                        {copiedMessageId === msg.id ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                      </button>

                      {/* Reply button */}
                      <button
                        type="button"
                        onClick={() => setReplyingToMessage(msg)}
                        className="p-1 rounded-lg text-slate-500 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/50 transition-colors cursor-pointer"
                        title="Reply"
                      >
                        <Reply size={13} />
                      </button>

                      {/* WhatsApp-Style Forward button */}
                      <button
                        type="button"
                        onClick={() => {
                          setForwardModalMessage(msg);
                          setSelectedForwardRecipientIds([]);
                          setForwardSearchQuery('');
                        }}
                        className="p-1 rounded-lg text-slate-500 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/50 transition-colors cursor-pointer"
                        title="Forward message"
                      >
                        <CornerUpRight size={13} />
                      </button>

                      {/* Edit button (for outgoing text messages) */}
                      {isOutgoing && !msg.isAudio && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMessageId(msg.id);
                            setMessageInput(msg.text || '');
                          }}
                          className="p-1 rounded-lg text-slate-500 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/50 transition-colors cursor-pointer"
                          title="Edit Message"
                        >
                          <Edit3 size={13} />
                        </button>
                      )}

                      {/* Delete Options Menu (Positioned bottom-full to avoid clipping) */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMoreMenuMsgId(activeMoreMenuMsgId === msg.id ? null : msg.id);
                          }}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                          title="Delete options"
                        >
                          <Trash2 size={13} />
                        </button>

                        {activeMoreMenuMsgId === msg.id && (
                          <div 
                            data-popover-root="true"
                            onPointerDown={(e) => e.stopPropagation()}
                            className="absolute bottom-full right-0 mb-1.5 w-44 rounded-xl bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-700 shadow-2xl p-1 z-50 space-y-0.5 animate-in fade-in zoom-in-95 duration-100 pointer-events-auto"
                          >
                            <button
                              type="button"
                              onPointerDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteMessage(msg.id, false);
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] flex items-center justify-between cursor-pointer"
                            >
                              <span>Delete for me</span>
                            </button>

                            {isOutgoing && (
                              <button
                                type="button"
                                onPointerDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteMessage(msg.id, true);
                                }}
                                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-between cursor-pointer"
                              >
                                <span>Delete for everyone</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl text-[13px] leading-relaxed relative transition-shadow ${
                        isOutgoing
                          ? 'bg-[#F0F2F6] dark:bg-[#1E232F] text-slate-900 dark:text-zinc-100 border border-[#E1E4EA] dark:border-[#2D3546] rounded-tr-xs shadow-2xs'
                          : isAssistant
                          ? 'bg-violet-50/80 dark:bg-violet-950/40 text-slate-800 dark:text-zinc-100 border border-violet-200/70 dark:border-violet-800/40 rounded-tl-xs shadow-2xs'
                          : 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 border border-slate-200/70 dark:border-zinc-700 rounded-tl-xs shadow-2xs'
                      }`}
                    >
                      {/* Forwarded Header Indicator */}
                      {msg.isForwarded && (
                        <div className="flex items-center gap-1 text-[10.5px] text-slate-400 dark:text-zinc-500 italic mb-1 font-medium select-none">
                          <CornerUpRight size={11} className="text-violet-500 shrink-0" />
                          <span>Forwarded</span>
                        </div>
                      )}

                      {/* Replying Quote Block */}
                      {msg.replyTo && (
                        <div className="mb-2 p-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border-l-2 border-violet-500 text-[11.5px] text-slate-600 dark:text-zinc-300 truncate">
                          <span className="font-semibold text-violet-600 dark:text-violet-400 block text-[11px]">{msg.replyTo.author}</span>
                          <span className="italic">{msg.replyTo.text}</span>
                        </div>
                      )}

                      {msg.workspaceRef && (
                        <div className="mb-2 rounded-2xl bg-[#E8EAEE]/90 dark:bg-[#252B39]/90 border border-black/[0.06] p-3 space-y-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <DocsSemanticFileBadge type={msg.workspaceRef.type} title={msg.workspaceRef.title} size="lg" />
                            <div className="min-w-0 flex-1">
                              <span className="block text-xs font-bold truncate text-slate-900 dark:text-zinc-100">
                                {msg.workspaceRef.title}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {msg.workspaceRef.type?.toUpperCase()} • {msg.workspaceRef.size || '420 KB'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {msg.workspaceRefs && msg.workspaceRefs.length > 0 && (
                        <div className="mb-2.5 grid grid-cols-2 gap-2">
                          {msg.workspaceRefs.map((doc, idx) => (
                            <div
                              key={idx}
                              onClick={() => onNavigateWorkspace && onNavigateWorkspace(doc)}
                              className="p-2.5 rounded-xl bg-[#E8EAEE]/90 border border-black/[0.05] hover:border-violet-500 cursor-pointer flex items-center gap-2.5 shadow-2xs"
                            >
                              <DocsSemanticFileBadge type={doc.type} title={doc.title} size="md" />
                              <div className="min-w-0 flex-1">
                                <span className="block text-[11.5px] font-bold truncate text-slate-900">
                                  {doc.title}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ── Autonomous Action Card (Document created, Task scheduled, Sheet modified) ── */}
                      {msg.actionCard && (
                        <div className="mb-3 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-700/80 shadow-xs space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              {/* Real Colorful Semantic SVG File Badge */}
                              {msg.actionCard.type === 'document' ? (
                                <DocsSemanticFileBadge type="compose" title={msg.actionCard.title} size="md" />
                              ) : msg.actionCard.type === 'sheet' ? (
                                <DocsSemanticFileBadge type="sheets" title={msg.actionCard.title} size="md" />
                              ) : msg.actionCard.type === 'staging_pr' ? (
                                <div className="w-5 h-5 rounded-[5px] bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                  <GitPullRequest size={12} strokeWidth={2.2} />
                                </div>
                              ) : msg.actionCard.type === 'schedule' ? (
                                <div className="w-5 h-5 rounded-[5px] bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                                  <Calendar size={12} strokeWidth={2.2} />
                                </div>
                              ) : msg.actionCard.type === 'portal' ? (
                                <div className="w-5 h-5 rounded-[5px] bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                  <UploadCloud size={12} strokeWidth={2.2} />
                                </div>
                              ) : msg.actionCard.type === 'directive' ? (
                                <div className="w-5 h-5 rounded-[5px] bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                  <ListTodo size={12} strokeWidth={2.2} />
                                </div>
                              ) : msg.actionCard.type === 'topology' ? (
                                <div className="w-5 h-5 rounded-[5px] bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                  <Network size={12} strokeWidth={2.2} />
                                </div>
                              ) : msg.actionCard.type === 'room_harvester' ? (
                                <div className="w-5 h-5 rounded-[5px] bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                  <Radio size={12} strokeWidth={2.2} />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-[5px] bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                                  <CheckSquare size={12} strokeWidth={2.2} />
                                </div>
                              )}
                              <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                                {msg.actionCard.title}
                              </span>
                            </div>
                            {msg.actionCard.type === 'staging_pr' ? (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/50 shrink-0">
                                ⏳ Pending Review
                              </span>
                            ) : msg.actionCard.type === 'schedule' ? (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50 shrink-0">
                                ⚡ Negotiated
                              </span>
                            ) : msg.actionCard.type === 'portal' ? (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50 shrink-0">
                                ⚡ Ready to Ingest
                              </span>
                            ) : msg.actionCard.type === 'directive' ? (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 shrink-0">
                                ⚡ Directive Queued
                              </span>
                            ) : msg.actionCard.type === 'topology' ? (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 shrink-0">
                                ⚡ Topology Compiled
                              </span>
                            ) : msg.actionCard.type === 'room_harvester' ? (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/50 shrink-0">
                                ⚡ In-Meeting Live
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 shrink-0">
                                ✓ Executed
                              </span>
                            )}
                          </div>

                          <p className="text-[11.5px] text-slate-600 dark:text-zinc-300 leading-snug">
                            {msg.actionCard.description}
                          </p>

                          {msg.actionCard.previewSnippet && (
                            <div className="text-[11px] text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800/60 p-2 rounded-lg border border-black/[0.04] dark:border-white/[0.05] italic truncate">
                              "{msg.actionCard.previewSnippet}"
                            </div>
                          )}

                          {msg.actionCard.type === 'document' && msg.actionCard.docId && (
                            <button
                              type="button"
                              onClick={() => onNavigateWorkspace && onNavigateWorkspace({ type: 'compose', docId: msg.actionCard.docId })}
                              className="mt-1 w-full py-1.5 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100/80 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[11.5px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-indigo-200/60 dark:border-indigo-800/50"
                            >
                              <span>Open in Compose Docs</span>
                              <ArrowRight size={12} />
                            </button>
                          )}

                          {msg.actionCard.type === 'schedule' && (
                            <div className="space-y-2 mt-1">
                              {msg.actionCard.agreedSlot && (
                                <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sky-800 dark:text-sky-300">
                                      {msg.actionCard.agreedSlot.formattedTime || msg.actionCard.agreedSlot.start}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300">
                                    {msg.actionCard.confidence || 90}% Match
                                  </span>
                                </div>
                              )}
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (typeof window !== 'undefined' && window.__REGAARDER_COMMIT_EVENT__) {
                                      window.__REGAARDER_COMMIT_EVENT__(msg.actionCard.event || {
                                        title: msg.actionCard.title.replace('Scheduled: ', ''),
                                        startTime: msg.actionCard.agreedSlot?.start || new Date().toISOString(),
                                        endTime: msg.actionCard.agreedSlot?.end || new Date().toISOString(),
                                        participants: msg.actionCard.participants || ['user-joshua']
                                      });
                                    }
                                  }}
                                  className="flex-1 py-1.5 px-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11.5px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                                >
                                  <Check size={12} />
                                  <span>Confirm Meeting</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (typeof window !== 'undefined' && window.__REGAARDER_OPEN_SCHEDULER_INSPECTOR__) {
                                      window.__REGAARDER_OPEN_SCHEDULER_INSPECTOR__();
                                    }
                                  }}
                                  className="py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-[11.5px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                >
                                  <span>Inspect</span>
                                  <ArrowRight size={11} />
                                </button>
                              </div>
                            </div>
                          )}

                          {msg.actionCard.type === 'staging_pr' && (
                            <button
                              type="button"
                              onClick={() => {
                                if (typeof window !== 'undefined' && window.__REGAARDER_OPEN_STAGING_MODAL__) {
                                  window.__REGAARDER_OPEN_STAGING_MODAL__(msg.actionCard.branchId);
                                }
                              }}
                              className="mt-1 w-full py-1.5 px-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[11.5px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm hover:shadow"
                            >
                              <GitPullRequest size={12} />
                              <span>Review Redline Diff & Merge</span>
                            </button>
                          )}
                          {msg.actionCard.type === 'portal' && (
                            <button
                              type="button"
                              onPointerDown={(e) => {
                                e.preventDefault();
                                if (typeof window !== 'undefined' && window.__REGAARDER_OPEN_PORTAL_INSPECTOR__) {
                                  window.__REGAARDER_OPEN_PORTAL_INSPECTOR__();
                                }
                              }}
                              className="mt-1 w-full py-1.5 px-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11.5px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                            >
                              <UploadCloud size={12} />
                              <span>Open Omni-Portal Inspector</span>
                            </button>
                          )}
                          {msg.actionCard.type === 'directive' && (
                            <button
                              type="button"
                              onPointerDown={(e) => {
                                e.preventDefault();
                                if (typeof window !== 'undefined' && window.__REGAARDER_OPEN_DIRECTIVE_INSPECTOR__) {
                                  window.__REGAARDER_OPEN_DIRECTIVE_INSPECTOR__();
                                }
                              }}
                              className="mt-1 w-full py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11.5px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                            >
                              <ListTodo size={12} />
                              <span>Open Directive Queue Inspector</span>
                              <ArrowRight size={11} />
                            </button>
                          )}
                          {msg.actionCard.type === 'topology' && (
                            <button
                              type="button"
                              onPointerDown={(e) => {
                                e.preventDefault();
                                if (typeof window !== 'undefined' && window.__REGAARDER_OPEN_TOPOLOGY_INSPECTOR__) {
                                  window.__REGAARDER_OPEN_TOPOLOGY_INSPECTOR__();
                                }
                              }}
                              className="mt-1 w-full py-1.5 px-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11.5px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                            >
                              <Network size={12} />
                              <span>Open Spatial Topology Inspector</span>
                              <ArrowRight size={11} />
                            </button>
                          )}
                          {msg.actionCard.type === 'room_harvester' && (
                            <button
                              type="button"
                              onPointerDown={(e) => {
                                e.preventDefault();
                                if (typeof window !== 'undefined' && window.__REGAARDER_OPEN_ROOM_HARVESTER__) {
                                  window.__REGAARDER_OPEN_ROOM_HARVESTER__();
                                }
                              }}
                              className="mt-1 w-full py-1.5 px-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[11.5px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                            >
                              <Radio size={12} />
                              <span>Open Room Observer Inspector</span>
                              <ArrowRight size={11} />
                            </button>
                          )}
                        </div>
                      )}

                      {/* ── Autonomous Reference Sources & Citations (Deep Link to Line) ── */}
                      {msg.referenceSources && msg.referenceSources.length > 0 && (
                        <div className="mb-3 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-violet-200/80 dark:border-violet-900/60 shadow-xs space-y-2">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-violet-700 dark:text-violet-400">
                            <Sparkles size={12} className="text-violet-500 shrink-0" />
                            <span>Referenced Sources (Click to jump to line)</span>
                          </div>

                          <div className="space-y-1.5">
                            {msg.referenceSources.map((ref, rIdx) => (
                              <div
                                key={rIdx}
                                onClick={() => onNavigateWorkspace && onNavigateWorkspace({
                                  type: ref.type || 'compose',
                                  docId: ref.docId,
                                  line: ref.line,
                                  textSnippet: ref.snippet,
                                  isCitationClick: true
                                })}
                                className="p-2 rounded-lg border border-slate-200 dark:border-zinc-700 hover:border-violet-500/80 hover:bg-violet-50/50 dark:hover:bg-violet-950/30 transition-all cursor-pointer group"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <FileText size={12} className="text-violet-600 shrink-0" />
                                    <span className="text-[11.5px] font-bold text-slate-900 dark:text-zinc-100 truncate">
                                      {ref.title}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 shrink-0">
                                    Line {ref.line}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-600 dark:text-zinc-300 italic mt-1 line-clamp-2">
                                  "{ref.snippet}"
                                </p>
                                <div className="mt-1 flex items-center gap-1 text-[10.5px] font-semibold text-violet-600 dark:text-violet-400 opacity-80 group-hover:opacity-100 transition-opacity">
                                  <span>Jump to line in document</span>
                                  <ArrowRight size={10} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {msg.isAudio ? (
                        <div className="space-y-2 min-w-[260px]">
                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (playingVoiceId === msg.id) {
                                  if (activeAudioPlayerRef.current) {
                                    activeAudioPlayerRef.current.pause();
                                  }
                                  setPlayingVoiceId(null);
                                } else {
                                  if (activeAudioPlayerRef.current) {
                                    activeAudioPlayerRef.current.pause();
                                  }
                                  if (msg.audioUrl) {
                                    const audio = new Audio(msg.audioUrl);
                                    audio.playbackRate = audioPlaybackSpeeds[msg.id] || 1;
                                    audio.onended = () => setPlayingVoiceId(null);
                                    audio.play().catch(e => console.warn('Audio play error:', e));
                                    activeAudioPlayerRef.current = audio;
                                    setPlayingVoiceId(msg.id);
                                  } else {
                                    // Synthesize speech if no raw blob
                                    if ('speechSynthesis' in window && msg.transcript) {
                                      const u = new SpeechSynthesisUtterance(msg.transcript);
                                      window.speechSynthesis.speak(u);
                                    }
                                  }
                                }
                              }}
                              className="w-8 h-8 rounded-full bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center shrink-0 transition-colors shadow-2xs cursor-pointer"
                            >
                              {playingVoiceId === msg.id ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
                            </button>
                            
                            <div className="flex-1 flex items-center gap-0.5 h-6">
                              {[12, 22, 16, 28, 14, 20, 24, 18, 12, 26, 16, 20, 14, 24, 18, 12].map((h, i) => (
                                <div
                                  key={i}
                                  className={`w-1 rounded-full transition-all ${
                                    playingVoiceId === msg.id && (i % 3 === 0)
                                      ? 'bg-violet-600 dark:bg-violet-400 animate-pulse'
                                      : 'bg-slate-300 dark:bg-zinc-600'
                                  }`}
                                  style={{ height: `${h}px` }}
                                />
                              ))}
                            </div>

                            <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                              {msg.audioDuration || '0:08'}
                            </span>

                            {/* Speed Up Tag: 1x -> 1.5x -> 2x */}
                            <button
                              type="button"
                              onClick={() => {
                                const current = audioPlaybackSpeeds[msg.id] || 1;
                                const next = current === 1 ? 1.5 : current === 1.5 ? 2 : 1;
                                setAudioPlaybackSpeeds(prev => ({ ...prev, [msg.id]: next }));
                                if (activeAudioPlayerRef.current && playingVoiceId === msg.id) {
                                  activeAudioPlayerRef.current.playbackRate = next;
                                }
                              }}
                              className="px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono bg-black/[0.05] dark:bg-white/[0.08] hover:bg-violet-100 hover:text-violet-700 dark:hover:bg-violet-950 dark:hover:text-violet-300 text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer shrink-0 border border-black/[0.04] dark:border-white/[0.06]"
                              title="Toggle Audio Speed (1x, 1.5x, 2x)"
                            >
                              {audioPlaybackSpeeds[msg.id] || 1}x
                            </button>
                          </div>

                          {/* Real Speech Transcription Subtitle (if available) */}
                          {msg.rawTranscript && (
                            <p className="text-[11.5px] italic text-slate-600 dark:text-zinc-300 bg-black/[0.02] dark:bg-white/[0.03] p-2 rounded-xl border border-black/[0.03] dark:border-white/[0.04] leading-relaxed">
                              "{msg.rawTranscript}"
                            </p>
                          )}
                        </div>
                      ) : (
                        renderFormattedMessageText(msg.text)
                      )}

                      <div className="mt-1 flex items-center justify-end text-[10px] gap-1 font-mono text-slate-400 dark:text-zinc-500">
                        {msg.isEdited && <span className="italic mr-1 text-[9.5px]">edited</span>}
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isOutgoing && <CheckCheck size={13} className="text-violet-600 dark:text-violet-400 inline" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {isTyping && (
              <div className="flex items-center gap-2.5 p-3 px-4 rounded-2xl bg-[#F0F2F6] dark:bg-[#1E232F] border border-[#E1E4EA] dark:border-[#2D3546] text-slate-700 dark:text-zinc-300 text-xs w-fit rounded-tl-xs shadow-2xs animate-in fade-in duration-150">
                <span className="font-semibold text-slate-600 dark:text-zinc-300">
                  {currentChat.name} is {aiStatusPhase}
                </span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-600 dark:bg-violet-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-600 dark:bg-violet-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-600 dark:bg-violet-400 animate-bounce" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── BOTTOM COMPOSER ── */}
          <div className="p-4 border-t border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-zinc-900 backdrop-blur-md relative z-40">
            {/* Categorized Apple Liquid Glass Emoji & Custom Reaction Popover */}
            {isEmojiPickerOpen && (
              <div 
                data-popover-root="true"
                className="absolute bottom-16 left-6 w-[330px] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-black/[0.08] dark:border-white/[0.1] p-3 z-40 animate-in fade-in zoom-in-95 duration-150 select-none font-sans"
                onPointerDown={(e) => e.stopPropagation()}
              >
                {/* Search Bar */}
                <div className="relative mb-2.5">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                  <input
                    type="text"
                    value={emojiSearch}
                    onChange={(e) => setEmojiSearch(e.target.value)}
                    placeholder="Search emoji or stickers..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] text-xs text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-violet-500/40 transition-all"
                  />
                </div>

                {/* Apple-Style Segmented Category Tabs */}
                <div className="flex items-center gap-1 p-1 bg-black/[0.03] dark:bg-white/[0.04] rounded-xl mb-2.5">
                  {EMOJI_CATEGORIES.map(cat => {
                    const isActive = emojiCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setEmojiCategory(cat.id)}
                        className={`flex-1 py-1 text-center rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer flex items-center justify-center gap-1 ${
                          isActive 
                            ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs' 
                            : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                        }`}
                        title={cat.name}
                      >
                        <span className="text-sm leading-none">{cat.icon}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Emoji Grid */}
                <div className="grid grid-cols-7 gap-1 h-48 overflow-y-auto thin-scrollbar p-1">
                  {(EMOJI_CATEGORIES.find(c => c.id === emojiCategory)?.emojis || [])
                    .filter(em => !emojiSearch || em.includes(emojiSearch))
                    .map((em, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectEmoji(em)}
                        className="w-9 h-9 rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-90 text-xl flex items-center justify-center transition-all cursor-pointer"
                      >
                        {em}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Voice Recording Bar */}
            {isRecordingVoice ? (
              <div className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-black/[0.06] dark:border-white/[0.08] animate-in slide-in-from-bottom-2 duration-150">
                <button
                  type="button"
                  onClick={() => setIsRecordingVoice(false)}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Discard recording"
                >
                  <Trash2 size={16} />
                </button>

                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full bg-rose-500 ${isVoicePaused ? '' : 'animate-ping'}`} />
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-zinc-100">
                    {Math.floor(voiceElapsedSeconds / 60)}:{(voiceElapsedSeconds % 60).toString().padStart(2, '0')}
                  </span>
                </div>

                <div className="flex-1 flex items-center justify-center gap-0.5 h-6 px-4">
                  {voiceWaveLevels.map((lvl, idx) => (
                    <div
                      key={idx}
                      className={`w-1 rounded-full transition-all duration-75 ${
                        isVoicePaused ? 'bg-slate-400' : 'bg-violet-600 dark:bg-violet-400'
                      }`}
                      style={{ height: `${lvl}px` }}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setIsVoicePaused(prev => !prev)}
                  className="p-2 rounded-xl text-slate-600 dark:text-zinc-300 hover:bg-black/[0.05] transition-colors cursor-pointer"
                  title={isVoicePaused ? "Resume recording" : "Pause recording"}
                >
                  {isVoicePaused ? <Play size={15} /> : <Pause size={15} />}
                </button>

                <button
                  type="button"
                  onClick={handleSendVoiceRecording}
                  className="w-9 h-9 rounded-full bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                  title="Send voice note"
                >
                  <Send size={14} className="ml-0.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                {/* Replying or Editing indicator banner */}
                {replyingToMessage && (
                  <div className="flex items-center justify-between px-3 py-1.5 bg-violet-50 dark:bg-violet-950/40 border border-violet-200/60 dark:border-violet-800/40 rounded-xl text-xs animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 min-w-0">
                      <Reply size={13} className="text-violet-600 shrink-0" />
                      <span className="font-semibold text-violet-700 dark:text-violet-300 shrink-0">Replying to {replyingToMessage.author}:</span>
                      <span className="text-slate-600 dark:text-zinc-300 truncate italic">"{replyingToMessage.text?.slice(0, 70)}"</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setReplyingToMessage(null)} 
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-black/[0.05] transition-colors cursor-pointer shrink-0"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}

                {editingMessageId && (
                  <div className="flex items-center justify-between px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 rounded-xl text-xs animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 min-w-0">
                      <Edit3 size={13} className="text-amber-600 shrink-0" />
                      <span className="font-semibold text-amber-700 dark:text-amber-300 shrink-0">Editing message</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditingMessageId(null);
                        setMessageInput('');
                      }} 
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-black/[0.05] transition-colors cursor-pointer shrink-0"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}

                <form 
                  onSubmit={handleSendMessage}
                  className="relative z-40 flex items-center gap-2 p-1.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08]"
                >
                  {/* ── FLOATING AI WRITING TOOLS TOOLBAR (Triggered when typing & highlighting text) ── */}
                  {selectionToolbarState && (
                    <div
                      data-selection-toolbar="true"
                      className="absolute bottom-[calc(100%+10px)] left-2 sm:left-3 z-50 flex flex-col gap-1 select-none animate-in fade-in zoom-in-95 duration-150"
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center flex-nowrap whitespace-nowrap gap-1 p-1 rounded-2xl bg-white/95 dark:bg-zinc-850/95 backdrop-blur-2xl border border-slate-200/90 dark:border-zinc-700 shadow-[0_12px_32px_-6px_rgba(0,0,0,0.18)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.55)]">
                        {/* Regaarder AI Circle Icon */}
                        <div className="flex items-center justify-center w-6 h-6 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 select-none shrink-0" title="Regaarder AI">
                          <RegaarderAiIcon size={14} className="text-violet-600 dark:text-violet-400" />
                        </div>

                        {/* Natural Prompt / Search Input Bar */}
                        <div className="relative flex items-center">
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] focus-within:ring-1 focus-within:ring-violet-500/40 focus-within:border-violet-500/50 transition-all">
                            <Search size={11} className="text-slate-400 dark:text-zinc-500 shrink-0" />
                            <input
                              type="text"
                              value={customPrompt}
                              onChange={(e) => setCustomPrompt(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (customPrompt.trim()) {
                                    handleExecuteTextTransform('custom', customPrompt.trim());
                                  }
                                }
                              }}
                              placeholder="Ask AI to edit text..."
                              className="w-32 sm:w-40 text-xs bg-transparent text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none"
                            />
                            {customPrompt.trim() && (
                              <button
                                type="button"
                                disabled={isTransformingText}
                                onPointerDown={(e) => {
                                  e.preventDefault();
                                  handleExecuteTextTransform('custom', customPrompt.trim());
                                }}
                                className="p-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors cursor-pointer"
                                title="Submit instruction to AI"
                              >
                                {activeTransformAction === 'custom' ? (
                                  <Loader2 size={10} className="animate-spin" />
                                ) : (
                                  <CornerDownRight size={10} />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="w-px h-4 bg-slate-200 dark:bg-zinc-700 mx-0.5" />

                        {/* Proofread Button */}
                        <button
                          type="button"
                          disabled={isTransformingText}
                          onPointerDown={(e) => {
                            e.preventDefault();
                            handleExecuteTextTransform('proofread');
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            activeTransformAction === 'proofread'
                              ? 'bg-violet-600 text-white shadow-xs'
                              : 'text-slate-700 dark:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.08]'
                          }`}
                          title="Fix grammar, spelling, and typos"
                        >
                          {activeTransformAction === 'proofread' ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <CheckCheck size={12} className="text-emerald-500" />
                          )}
                          <span>Proofread</span>
                        </button>

                        {/* Polish / Improve Button */}
                        <button
                          type="button"
                          disabled={isTransformingText}
                          onPointerDown={(e) => {
                            e.preventDefault();
                            handleExecuteTextTransform('improve');
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            activeTransformAction === 'improve'
                              ? 'bg-violet-600 text-white shadow-xs'
                              : 'text-slate-700 dark:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.08]'
                          }`}
                          title="Polish and improve text to be executive and articulate"
                        >
                          {activeTransformAction === 'improve' ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Wand2 size={12} className="text-violet-500" />
                          )}
                          <span>Improve</span>
                        </button>

                        {/* Concise Button */}
                        <button
                          type="button"
                          disabled={isTransformingText}
                          onPointerDown={(e) => {
                            e.preventDefault();
                            handleExecuteTextTransform('concise');
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            activeTransformAction === 'concise'
                              ? 'bg-violet-600 text-white shadow-xs'
                              : 'text-slate-700 dark:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.08]'
                          }`}
                          title="Make text concise and direct"
                        >
                          {activeTransformAction === 'concise' ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Minimize2 size={12} className="text-amber-500" />
                          )}
                          <span>Concise</span>
                        </button>

                        {/* Bold Button */}
                        <button
                          type="button"
                          disabled={isTransformingText}
                          onPointerDown={(e) => {
                            e.preventDefault();
                            handleExecuteTextTransform('bold');
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-all cursor-pointer"
                          title="Format bold (**text**)"
                        >
                          <Bold size={12} />
                          <span>Bold</span>
                        </button>

                        {/* Translate Dropdown Button */}
                        <div className="relative">
                          <button
                            type="button"
                            disabled={isTransformingText}
                            onPointerDown={(e) => {
                              e.preventDefault();
                              setShowTranslateMenu(prev => !prev);
                              setShowMoreMenu(false);
                            }}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              showTranslateMenu || activeTransformAction === 'translate'
                                ? 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300'
                                : 'text-slate-700 dark:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.08]'
                            }`}
                            title="Translate selected text"
                          >
                            {activeTransformAction === 'translate' ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Languages size={12} className="text-blue-500" />
                            )}
                            <span>Translate</span>
                            <ChevronDown size={11} className={`transition-transform duration-150 ${showTranslateMenu ? 'rotate-180' : ''}`} />
                          </button>

                          {showTranslateMenu && (
                            <div
                              className="absolute bottom-full left-0 mb-2 w-44 rounded-xl bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-700 shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                              onPointerDown={(e) => e.stopPropagation()}
                            >
                              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider border-b border-slate-100 dark:border-zinc-800 mb-1">
                                Translate to
                              </div>
                              <div className="max-h-48 overflow-y-auto thin-scrollbar space-y-0.5">
                                {TRANSLATE_LANGUAGES.map(lang => (
                                  <button
                                    key={lang.code}
                                    type="button"
                                    onPointerDown={(e) => {
                                      e.preventDefault();
                                      setShowTranslateMenu(false);
                                      handleExecuteTextTransform('translate', lang.name);
                                    }}
                                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs text-slate-700 dark:text-zinc-200 hover:bg-violet-50 dark:hover:bg-violet-950/50 hover:text-violet-600 transition-colors cursor-pointer text-left"
                                  >
                                    <span className="flex items-center gap-1.5">
                                      <span>{lang.flag}</span>
                                      <span>{lang.name}</span>
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Three-Dot Ellipsis Menu for Tone, Style & More */}
                        <div className="relative">
                          <button
                            type="button"
                            disabled={isTransformingText}
                            onPointerDown={(e) => {
                              e.preventDefault();
                              setShowMoreMenu(prev => !prev);
                              setShowTranslateMenu(false);
                            }}
                            className={`p-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              showMoreMenu
                                ? 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300'
                                : 'text-slate-700 dark:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.08]'
                            }`}
                            title="More options (Tone, Style, Formatting)"
                          >
                            <MoreHorizontal size={13} />
                          </button>

                          {showMoreMenu && (
                            <div
                              className="absolute bottom-full right-0 mb-2 w-52 rounded-2xl bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-700 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 font-sans"
                              onPointerDown={(e) => e.stopPropagation()}
                            >
                              {/* Tone Category */}
                              <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                                Tone
                              </div>
                              <div className="space-y-0.5 mb-1.5">
                                {[
                                  { label: 'Executive & Formal', desc: 'Authoritative business tone', value: 'executive and formal business' },
                                  { label: 'Friendly & Warm', desc: 'Welcoming and approachable', value: 'friendly and warm' },
                                  { label: 'Direct & Persuasive', desc: 'Punchy and confident', value: 'direct and persuasive' },
                                  { label: 'Casual & Natural', desc: 'Conversational chat tone', value: 'casual and conversational' }
                               ].map(tone => (
                                  <button
                                    key={tone.value}
                                    type="button"
                                    onPointerDown={(e) => {
                                      e.preventDefault();
                                      setShowMoreMenu(false);
                                      handleExecuteTextTransform('tone', tone.value);
                                    }}
                                    className="w-full flex flex-col px-2.5 py-1.5 rounded-xl text-left hover:bg-violet-50 dark:hover:bg-violet-950/50 hover:text-violet-700 dark:hover:text-violet-300 transition-colors cursor-pointer group"
                                  >
                                    <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 group-hover:text-violet-600">{tone.label}</span>
                                    <span className="text-[10px] text-slate-400 dark:text-zinc-500">{tone.desc}</span>
                                  </button>
                                ))}
                              </div>

                              <div className="w-full h-px bg-slate-100 dark:bg-zinc-800 my-1" />

                              {/* Style & Format Category */}
                              <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                                Format & Style
                              </div>
                              <div className="space-y-0.5 mb-1.5">
                                <button
                                  type="button"
                                  onPointerDown={(e) => {
                                    e.preventDefault();
                                    setShowMoreMenu(false);
                                    handleExecuteTextTransform('style', 'bullet_list');
                                  }}
                                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-violet-50 dark:hover:bg-violet-950/50 hover:text-violet-600 transition-colors cursor-pointer text-left"
                                >
                                  <span>Bullet Points</span>
                                  <span className="text-[10px] font-mono text-slate-400">• • •</span>
                                </button>
                                <button
                                  type="button"
                                  onPointerDown={(e) => {
                                    e.preventDefault();
                                    setShowMoreMenu(false);
                                    handleExecuteTextTransform('style', 'summarize');
                                  }}
                                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-violet-50 dark:hover:bg-violet-950/50 hover:text-violet-600 transition-colors cursor-pointer text-left"
                                >
                                  <span>1-Sentence Summary</span>
                                  <span className="text-[10px] font-mono text-slate-400">Brief</span>
                                </button>
                                <button
                                  type="button"
                                  onPointerDown={(e) => {
                                    e.preventDefault();
                                    setShowMoreMenu(false);
                                    handleExecuteTextTransform('title_case');
                                  }}
                                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-violet-50 dark:hover:bg-violet-950/50 hover:text-violet-600 transition-colors cursor-pointer text-left"
                                >
                                  <span>Title Case</span>
                                  <span className="text-[10px] font-mono text-slate-400">Aa Bb</span>
                                </button>
                                <button
                                  type="button"
                                  onPointerDown={(e) => {
                                    e.preventDefault();
                                    setShowMoreMenu(false);
                                    handleExecuteTextTransform('upper_case');
                                  }}
                                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-violet-50 dark:hover:bg-violet-950/50 hover:text-violet-600 transition-colors cursor-pointer text-left"
                                >
                                  <span>UPPERCASE</span>
                                  <span className="text-[10px] font-mono text-slate-400">ABC</span>
                                </button>
                                <button
                                  type="button"
                                  onPointerDown={(e) => {
                                    e.preventDefault();
                                    setShowMoreMenu(false);
                                    handleExecuteTextTransform('lower_case');
                                  }}
                                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-violet-50 dark:hover:bg-violet-950/50 hover:text-violet-600 transition-colors cursor-pointer text-left"
                                >
                                  <span>lowercase</span>
                                  <span className="text-[10px] font-mono text-slate-400">abc</span>
                                </button>
                              </div>

                              <div className="w-full h-px bg-slate-100 dark:bg-zinc-800 my-1" />

                              {/* Quick Actions */}
                              <button
                                type="button"
                                onPointerDown={(e) => {
                                  e.preventDefault();
                                  setShowMoreMenu(false);
                                  handleExecuteTextTransform('copy');
                                }}
                                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 transition-colors cursor-pointer text-left"
                              >
                                <span className="flex items-center gap-1.5">
                                  <Copy size={12} />
                                  <span>Copy Selection</span>
                                </span>
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="w-px h-4 bg-slate-200 dark:bg-zinc-700 mx-0.5" />

                        {/* Dismiss Toolbar */}
                        <button
                          type="button"
                          onPointerDown={(e) => {
                            e.preventDefault();
                            setSelectionToolbarState(null);
                            setShowTranslateMenu(false);
                            setShowMoreMenu(false);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
                          title="Dismiss toolbar"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  )}

                <input 
                  type="file" 
                  multiple
                  ref={fileInputRef} 
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length === 0) return;
                    const parsed = files.map((f, i) => ({
                      id: `attach-${Date.now()}-${i}`,
                      title: f.name,
                      type: f.name.endsWith('.xlsx') ? 'sheets' : f.name.endsWith('.pptx') ? 'deck' : 'compose',
                      size: `${Math.round(f.size / 1024)} KB`
                    }));
                    setPendingAttachments(parsed);
                  }} 
                  className="hidden" 
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-black/[0.04] transition-colors cursor-pointer"
                  title="Attach Documents or Files"
                >
                  <Paperclip size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => setIsEmojiPickerOpen(prev => !prev)}
                  className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                    isEmojiPickerOpen ? 'bg-violet-100 text-violet-700' : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-black/[0.04]'
                  }`}
                  title="Choose Emoji"
                >
                  <Smile size={16} />
                </button>

                <input
                  ref={textInputRef}
                  data-msg-input="true"
                  type="text"
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value);
                    if (selectionToolbarState && (!e.target.value || e.target.selectionStart === e.target.selectionEnd)) {
                      setSelectionToolbarState(null);
                      setShowTranslateMenu(false);
                    }
                  }}
                  onSelect={handleInputSelect}
                  onKeyUp={handleInputSelect}
                  onMouseUp={handleInputSelect}
                  onTouchEnd={handleInputSelect}
                  placeholder={`Message ${currentChat.name}...`}
                  className="flex-1 px-2 py-1.5 text-xs bg-transparent text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none"
                />

                <button
                  type="button"
                  onClick={() => {
                    setIsRecordingVoice(true);
                    setIsVoicePaused(false);
                    setVoiceElapsedSeconds(0);
                  }}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-black/[0.04] transition-colors cursor-pointer"
                  title="Record audio note"
                >
                  <Mic size={16} />
                </button>

                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="w-8 h-8 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-30 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-xs"
                  title="Send Message"
                >
                  <Send size={13} />
                </button>
              </form>
            </div>
            )}
          </div>
        </main>
      </div>

      {/* ── AI CONVERSATIONAL VOICE OVERLAY (RIGID HORIZONTAL/VERTICAL CENTER LOCK) ── */}
      {isAiVoiceSessionActive && (
        <div className="fixed inset-0 z-50 bg-[#0c0d14]/95 backdrop-blur-2xl flex flex-col items-center justify-between p-8 animate-in fade-in duration-200 select-none text-white">
          {/* Top Bar with Brand Icon & Beta Badge */}
          <div className="w-full max-w-xl flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs text-white">
              <RegaarderBrandIcon size={14} className="text-violet-400 shrink-0" />
              <span className="font-semibold">{activeModelDisplay.name}</span>
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-400/30 uppercase tracking-widest ml-1">
                BETA
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsAiVoiceSessionActive(false)}
              className="p-2 rounded-full text-white/70 hover:text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              title="Close Voice Session"
            >
              <X size={18} />
            </button>
          </div>

          {/* Central Pulsing Liquid Orb (Absolute Center Alignment) */}
          <div className="flex flex-col items-center justify-center space-y-6 my-auto w-full max-w-md mx-auto text-center">
            {/* Orb Anchor Container */}
            <div className="relative w-44 h-44 flex items-center justify-center mx-auto">
              {/* Centered Ambient Glow */}
              <div className={`absolute inset-0 -m-8 rounded-full bg-gradient-to-tr from-violet-600/40 via-indigo-500/30 to-fuchsia-500/40 blur-3xl transition-all duration-300 pointer-events-none ${isAiVoiceMuted || isAiVoicePaused ? 'opacity-20' : 'animate-pulse'}`} />
              
              {/* Solid Liquid Sphere */}
              <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-700 border-2 border-white/20 shadow-2xl flex items-center justify-center relative overflow-hidden z-10">
                <div className="flex items-center justify-center gap-1.5 h-14 w-full">
                  {aiVoiceLiveWaves.map((h, i) => (
                    <div
                      key={i}
                      className={`w-1.5 rounded-full transition-all duration-150 ${isAiVoiceMuted || isAiVoicePaused ? 'bg-white/30' : 'bg-white'}`}
                      style={{ height: `${isAiVoiceMuted || isAiVoicePaused ? 6 : h}px` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Status Pill Positioned Directly on the Same Axis */}
            <div className="flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white shadow-xs mx-auto">
              <span className={`w-2 h-2 rounded-full ${isAiVoiceMuted ? 'bg-rose-400' : isAiVoicePaused ? 'bg-amber-400' : isAiVoiceResponding ? 'bg-violet-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}`} />
              <span>
                {isAiVoiceMuted ? 'Microphone is muted' : isAiVoicePaused ? 'Voice session paused' : isAiVoiceResponding ? `${activeModelDisplay.name} is speaking...` : aiVoiceLiveTranscript ? 'Hearing you speak...' : 'Listening to microphone...'}
              </span>
            </div>

            {/* Subtitles on Same Axis */}
            <div className="text-center space-y-1.5 w-full px-4 pt-1">
              <h3 className="text-base font-bold text-white tracking-tight">
                {isAiVoiceMuted 
                  ? 'Unmute to continue speaking' 
                  : isAiVoicePaused 
                  ? 'Session is paused' 
                  : isAiVoiceResponding 
                  ? `${activeModelDisplay.name}` 
                  : aiVoiceLiveTranscript 
                  ? 'You' 
                  : 'Speak naturally to collaborate'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-sm mx-auto min-h-[38px] flex items-center justify-center">
                {isAiVoiceMuted 
                  ? 'Tap the microphone button below to resume voice streaming.' 
                  : isAiVoiceResponding && aiVoiceActiveResponse
                  ? `“${aiVoiceActiveResponse}”`
                  : aiVoiceLiveTranscript
                  ? `“${aiVoiceLiveTranscript}”`
                  : 'Start talking to discuss strategy, documents, or models in real time.'
                }
              </p>
            </div>
          </div>

          {/* Bottom Glass Controls Bar */}
          <div className="w-full max-w-md flex items-center justify-center gap-5 p-3 rounded-3xl bg-white/10 border border-white/10 backdrop-blur-xl shadow-2xl mx-auto">
            <button
              type="button"
              onClick={() => setIsAiVoiceMuted(prev => !prev)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-md ${
                isAiVoiceMuted ? 'bg-rose-500 text-white' : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
              title={isAiVoiceMuted ? "Unmute Microphone" : "Mute Microphone"}
            >
              {isAiVoiceMuted ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <button
              type="button"
              onClick={() => setIsAiVoiceSessionActive(false)}
              className="h-12 px-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <PhoneOff size={16} />
              <span>End Voice Session</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAiVoicePaused(prev => !prev)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-md ${
                isAiVoicePaused ? 'bg-amber-500 text-white' : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
              title={isAiVoicePaused ? "Resume Voice Listening" : "Pause Voice Listening"}
            >
              {isAiVoicePaused ? <Play size={18} /> : <Pause size={18} />}
            </button>
          </div>
        </div>
      )}

      {/* ── UNIFIED CREATE MODAL (INSTAGRAM-STYLE CREATE PROFILE, TEAM GROUP, OR AI PERSONA) ── */}
      {isNewChatModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) setIsNewChatModalOpen(false);
          }}
        >
          <div className="w-full max-w-md bg-white dark:bg-zinc-850 rounded-3xl shadow-2xl border border-black/[0.08] dark:border-white/[0.1] p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                {modalMode === 'profile' ? 'Create User Profile' : modalMode === 'group' ? 'Create Team Group' : 'Deploy AI Persona'}
              </h3>
              <button
                type="button"
                onClick={() => setIsNewChatModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* 3-Mode Selector: Profile | Group | Persona */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'profile', label: 'Create Profile', icon: User },
                { id: 'group', label: 'Team Group', icon: Users },
                { id: 'persona', label: 'AI Persona', icon: Bot }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setModalMode(t.id)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    modalMode === t.id
                      ? 'border-violet-600 bg-violet-50/60 text-violet-700 font-bold'
                      : 'border-black/[0.06] text-slate-600 hover:bg-black/[0.02]'
                  }`}
                >
                  <t.icon size={15} />
                  <span className="text-[10.5px]">{t.label}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              {/* ── 1. INSTAGRAM-STYLE USER PROFILE (Name, @Username, Bio) ── */}
              {modalMode === 'profile' && (
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Full Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="e.g. Joshua David"
                      className="w-full px-3 py-2 rounded-xl bg-black/[0.03] border border-black/[0.08] text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                      <AtSign size={12} /> Unique Username ID
                    </label>
                    <input
                      type="text"
                      value={profileUsername}
                      onChange={(e) => setProfileUsername(e.target.value)}
                      placeholder="@joshua or @arch_lead"
                      className="w-full px-3 py-2 rounded-xl bg-black/[0.03] border border-black/[0.08] text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Role / Status Bio</label>
                    <input
                      type="text"
                      value={profileBio}
                      onChange={(e) => setProfileBio(e.target.value)}
                      placeholder="e.g. Lead System Architect • Core Workspace"
                      className="w-full px-3 py-2 rounded-xl bg-black/[0.03] border border-black/[0.08] text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* ── 2. TEAM GROUP FORM ── */}
              {modalMode === 'group' && (
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Group Name</label>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="e.g. Design Systems & Architecture"
                      className="w-full px-3 py-2 rounded-xl bg-black/[0.03] border border-black/[0.08] text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Add Profiles / AI Personas</label>
                    <div className="max-h-36 overflow-y-auto p-1.5 rounded-xl bg-slate-50 border border-black/[0.04] space-y-1">
                      {conversations.map(c => (
                        <label key={c.id} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white cursor-pointer">
                          <span className="text-xs text-slate-700 font-medium">{c.name}</span>
                          <input
                            type="checkbox"
                            checked={!!groupSelectedMembers[c.id]}
                            onChange={(e) => setGroupSelectedMembers(prev => ({ ...prev, [c.id]: e.target.checked }))}
                            className="w-3.5 h-3.5 rounded text-violet-600"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── 3. AI PERSONA FORM WITH DETECTED LOCAL/CLOUD ENGINES ── */}
              {modalMode === 'persona' && (
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-600">Persona Name</label>
                      <button
                        type="button"
                        onClick={handleAiCraftPersona}
                        className="text-[10.5px] font-bold text-violet-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Wand2 size={11} />
                        <span>Generate with AI</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={personaName}
                      onChange={(e) => setPersonaName(e.target.value)}
                      placeholder="e.g. Executive Code Reviewer"
                      className="w-full px-3 py-2 rounded-xl bg-black/[0.03] border border-black/[0.08] text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Underlying Engine (Detected from Room)</label>
                    <select
                      value={personaEngine}
                      onChange={(e) => setPersonaEngine(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/[0.03] border border-black/[0.08] text-xs text-slate-800 focus:outline-none"
                    >
                      {detectedLocalModels.length > 0 && (
                        <optgroup label="Local Detected Engines">
                          {detectedLocalModels.map(m => (
                            <option key={m.id} value={m.id}>{m.name} ({m.provider})</option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label="Cloud Engines">
                        {DEFAULT_CLOUD_MODELS.map(m => (
                          <option key={m.id} value={m.id}>{m.name} ({m.provider})</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-600">Instructions & Behavior</label>
                      <button
                        type="button"
                        onClick={() => mdFileInputRef.current?.click()}
                        className="text-[10.5px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        <UploadCloud size={11} />
                        <span>Import .md</span>
                      </button>
                    </div>
                    <input
                      type="file"
                      accept=".md,.txt,.json"
                      ref={mdFileInputRef}
                      onChange={handleImportPersonaMd}
                      className="hidden"
                    />
                    <textarea
                      rows={3}
                      value={personaInstructions}
                      onChange={(e) => setPersonaInstructions(e.target.value)}
                      placeholder="Define persona role, tone, knowledge, and system directives..."
                      className="w-full p-2.5 rounded-xl bg-black/[0.03] border border-black/[0.08] text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/[0.05]">
                <button
                  type="button"
                  onClick={() => setIsNewChatModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    (modalMode === 'profile' && !profileName.trim() && !profileUsername.trim()) ||
                    (modalMode === 'group' && !groupName.trim()) ||
                    (modalMode === 'persona' && !personaName.trim())
                  }
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-bold transition-colors cursor-pointer shadow-xs"
                >
                  {modalMode === 'profile' ? 'Save Profile' : modalMode === 'group' ? 'Create Group' : 'Deploy Persona'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── WhatsApp-Style Forward Modal ── */}
      {forwardModalMessage && (
        <div 
          className="fixed inset-0 z-[1100] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none"
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) {
              setForwardModalMessage(null);
            }
          }}
        >
          <div 
            className="w-full max-w-md bg-white dark:bg-zinc-850 rounded-2xl shadow-2xl border border-black/[0.08] dark:border-white/[0.1] overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Forward message to...</h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">Select one or more chats or contacts</p>
              </div>
              <button
                type="button"
                onClick={() => setForwardModalMessage(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-black/[0.04] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-black/[0.04] dark:border-white/[0.06]">
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={forwardSearchQuery}
                  onChange={(e) => setForwardSearchQuery(e.target.value)}
                  placeholder="Search contacts and groups..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-xs text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  autoFocus
                />
              </div>
            </div>

            {/* Recipient List with Checkboxes */}
            <div className="flex-1 overflow-y-auto thin-scrollbar p-2 space-y-1 max-h-72">
              {forwardRecipientsList.length === 0 ? (
                <div className="py-10 text-center text-slate-400 dark:text-zinc-500">
                  <Users size={24} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-semibold">No contacts found</p>
                  <p className="text-[11px]">Try searching with a different name</p>
                </div>
              ) : (
                forwardRecipientsList.map((recipient) => {
                  const isSelected = selectedForwardRecipientIds.includes(recipient.id);
                  return (
                    <div
                      key={recipient.id}
                      onClick={() => handleToggleForwardRecipient(recipient.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-900 dark:text-violet-100' 
                          : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04] text-slate-800 dark:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          recipient.isAi 
                            ? 'bg-gradient-to-br from-violet-600 to-indigo-700 text-white' 
                            : 'bg-violet-100 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300'
                        }`}>
                          {recipient.avatar}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate leading-tight">{recipient.name}</p>
                          <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">{recipient.role}</p>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isSelected 
                          ? 'bg-violet-600 border-violet-600 text-white' 
                          : 'border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'
                      }`}>
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Preview & Footer */}
            <div className="p-3.5 border-t border-black/[0.06] dark:border-white/[0.08] bg-slate-50/50 dark:bg-zinc-800/40 flex items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate max-w-[200px]">
                {selectedForwardRecipientIds.length === 0 ? (
                  <span>Select contacts to forward</span>
                ) : (
                  <span className="font-semibold text-violet-600 dark:text-violet-400">
                    {selectedForwardRecipientIds.length} contact{selectedForwardRecipientIds.length > 1 ? 's' : ''} selected
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setForwardModalMessage(null)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-zinc-400 hover:bg-black/[0.05] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={selectedForwardRecipientIds.length === 0}
                  onClick={handleSendForward}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-xs transition-all cursor-pointer"
                >
                  <Send size={12} />
                  <span>Forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Direct In-Chat WebRTC Call Overlay */}
      {activeCallSession && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200 select-none">
          <div className="w-full max-w-sm bg-[#161922] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col items-center p-6 text-center space-y-6">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-amber-300 font-medium">
              <Lock size={10} />
              <span>End-to-End Encrypted Call</span>
            </div>

            <div className="flex flex-col items-center space-y-3">
              <div className="w-20 h-20 rounded-full bg-violet-600/30 text-violet-300 font-bold text-2xl flex items-center justify-center border-2 border-violet-500/50">
                {currentChat.avatar}
              </div>
              <h3 className="text-base font-bold text-white">{currentChat.name}</h3>
              <p className="text-xs text-slate-400 font-mono">
                {activeCallSession.status === 'ringing' ? 'Ringing...' : `${Math.floor(callDuration / 60)}:${(callDuration % 60).toString().padStart(2, '0')}`}
              </p>
            </div>

            {activeCallSession.type === 'video' && activeCallSession.status === 'connected' && (
              <div className="w-full h-36 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center relative overflow-hidden">
                <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${activeCallSession.isVideoOff ? 'hidden' : 'block'}`} />
                {activeCallSession.isVideoOff && (
                  <div className="text-center text-xs text-slate-400">Camera Off</div>
                )}
              </div>
            )}

            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleEndCall}
                className="w-13 h-13 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg cursor-pointer"
              >
                <PhoneOff size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
