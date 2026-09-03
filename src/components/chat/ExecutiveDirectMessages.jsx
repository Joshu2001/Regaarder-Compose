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
  SlidersHorizontal, MoreHorizontal, MessageCircle, FileSpreadsheet
} from 'lucide-react';
import { RegaarderAiIcon, RegaarderProductIcon, MemoryIcon, OrbIcon, RelayIcon, ComposeIcon, SheetIcon, DeckIcon } from '../RegaarderProductIcons';
import RegaarderBrandIcon from '../RegaarderBrandIcon';

// Curated Apple-style categorized emojis
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
  }
];

// Available AI Models for dynamic in-chat switching
const AI_MODEL_OPTIONS = [
  { id: 'chatgpt-4o', name: 'ChatGPT (GPT-4o)', provider: 'OpenAI Cloud', icon: '⚡', desc: 'Advanced multimodal reasoning & synthesis' },
  { id: 'gemma-local', name: 'Gemma 2B (Local Engine)', provider: 'On-Device Zero-Knowledge', icon: '🧠', desc: 'Fast, cryptographically private local AI' },
  { id: 'llama-local', name: 'Llama 3.2 (Local Engine)', provider: 'Local Edge Mesh', icon: '🦙', desc: 'Offline code, logic, and structure analysis' },
  { id: 'orb-strategist', name: 'Regaarder Orb Orchestrator', provider: 'Workspace Core', icon: '✨', desc: 'Autonomous cross-document synthesis' }
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
  onOpenWorkspaceSwitcher
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread' | 'teams' | 'topics' | 'ai' | 'broadcast' | 'actions'
  const [isMoreTabsMenuOpen, setIsMoreTabsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeContactId, setActiveContactId] = useState('chat-assistant');
  const [messageInput, setMessageInput] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [replyingToMessage, setReplyingToMessage] = useState(null);
  const [forwardingMessage, setForwardingMessage] = useState(null);
  const [forwardSelectedRecipients, setForwardSelectedRecipients] = useState({});
  const [forwardComment, setForwardComment] = useState('');
  const [forwardSearchQuery, setForwardSearchQuery] = useState('');
  const [activeMoreMenuMsgId, setActiveMoreMenuMsgId] = useState(null);
  const [isPinned, setIsPinned] = useState(false);
  const [isChatSearchOpen, setIsChatSearchOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [isDetailsMenuOpen, setIsDetailsMenuOpen] = useState(false);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState('smileys');
  const [emojiSearch, setEmojiSearch] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // ── AI Model Switcher State ──
  const [selectedAiModel, setSelectedAiModel] = useState('chatgpt-4o');
  const [isAiModelSelectorOpen, setIsAiModelSelectorOpen] = useState(false);

  // ── Full Apple/ChatGPT AI Voice Session State ──
  const [isAiVoiceSessionActive, setIsAiVoiceSessionActive] = useState(false);
  const [isAiVoicePaused, setIsAiVoicePaused] = useState(false);
  const [isAiVoiceMuted, setIsAiVoiceMuted] = useState(false);
  const [aiVoiceLiveWaves, setAiVoiceLiveWaves] = useState([12, 22, 16, 28, 14, 20, 24, 18, 12, 26]);

  // ── WhatsApp Standard Audio Recording State ──
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isVoicePaused, setIsVoicePaused] = useState(false);
  const [voiceElapsedSeconds, setVoiceElapsedSeconds] = useState(0);
  const [voiceWaveLevels, setVoiceWaveLevels] = useState([12, 20, 15, 28, 14, 22, 18, 25, 16, 24]);
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const voiceTimerRef = useRef(null);

  // ── In-Chat Direct WhatsApp Video/Audio Call State ──
  const [activeCallSession, setActiveCallSession] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // ── Document Attachment Stage State ──
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [selectedAttachmentIndex, setSelectedAttachmentIndex] = useState(0);
  const [attachmentCaption, setAttachmentCaption] = useState('');

  // ── Create Group / Persona Modal State ──
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [newChatType, setNewChatType] = useState('group');
  const [newChatPersonaModel, setNewChatPersonaModel] = useState('gemma-local');

  // Clean starting state with default Assistant channel
  const [conversations, setConversations] = useState([
    {
      id: 'chat-assistant',
      name: 'Assistant',
      avatar: 'AI',
      isGroup: false,
      isAi: true,
      modelId: 'chatgpt-4o',
      modelName: 'ChatGPT (GPT-4o)',
      lastMsg: 'Ready for strategy briefings, real-time voice, or file synthesis.',
      time: 'Just now',
      unread: 0,
      category: 'ai',
      online: true,
      fingerprint: '0xAI • CRYPTO • ZERO • KNOWLEDGE',
      topics: ['Strategy Synthesis', 'Voice Chat', 'Workspace Analysis'],
      actions: []
    }
  ]);

  // Clean initial messages
  const [messages, setMessages] = useState([
    {
      id: 'm-welcome',
      author: 'Assistant',
      role: 'assistant',
      text: 'Welcome to Regaarder Relay. All communications are end-to-end encrypted with zero-knowledge keys.\n\nYou can chat by typing, attach documents, switch AI models dynamically, or start real-time conversational voice sessions using the Voice Chat with AI button.',
      createdAt: Date.now() - 1000 * 60 * 2,
      status: 'read'
    }
  ]);

  const messagesEndRef = useRef(null);
  const chatScrollContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const addMoreFileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollBottom(false);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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

  // Voice recording timer
  useEffect(() => {
    if (isRecordingVoice && !isVoicePaused) {
      voiceTimerRef.current = setInterval(() => {
        setVoiceElapsedSeconds(prev => prev + 1);
        setVoiceWaveLevels(prev => prev.map(() => Math.floor(Math.random() * 18) + 8));
      }, 1000);
    } else {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    }
    return () => {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    };
  }, [isRecordingVoice, isVoicePaused]);

  // AI Voice conversational session simulator
  useEffect(() => {
    let interval;
    if (isAiVoiceSessionActive && !isAiVoiceMuted && !isAiVoicePaused) {
      interval = setInterval(() => {
        setAiVoiceLiveWaves(prev => prev.map(() => Math.floor(Math.random() * 32) + 8));
      }, 120);
    }
    return () => clearInterval(interval);
  }, [isAiVoiceSessionActive, isAiVoiceMuted, isAiVoicePaused]);

  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      if (activeTab === 'unread' && c.unread === 0) return false;
      if (activeTab === 'teams' && !c.isGroup) return false;
      if (activeTab === 'ai' && !c.isAi) return false;
      if (activeTab === 'topics' || activeTab === 'broadcast' || activeTab === 'actions') return true;
      if (searchQuery.trim()) {
        return c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
               c.lastMsg.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [conversations, activeTab, searchQuery]);

  const currentChat = conversations.find(c => c.id === activeContactId) || conversations[0];
  const activeModelObj = AI_MODEL_OPTIONS.find(m => m.id === selectedAiModel) || AI_MODEL_OPTIONS[0];

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!messageInput.trim()) return;

    const trimmed = messageInput.trim();

    if (editingMessageId) {
      setMessages(prev => prev.map(m => m.id === editingMessageId ? { ...m, text: trimmed, isEdited: true } : m));
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

    setMessages(prev => [...prev, newMsg]);
    setMessageInput('');
    setReplyingToMessage(null);
    setIsEmojiPickerOpen(false);

    if (isAiChat) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const aiReply = {
          id: `m-ai-${Date.now()}`,
          author: 'Assistant',
          role: 'assistant',
          text: `(${activeModelObj.name}): Processed your prompt "${trimmed}". Zero-knowledge verification complete across the active workspace.`,
          createdAt: Date.now(),
          status: 'read'
        };
        setMessages(prev => [...prev, aiReply]);
      }, 700);
    }
  };

  const handleSelectEmoji = (emoji) => {
    setMessageInput(prev => `${prev}${emoji}`);
  };

  // Document Selection Handlers
  const handleFileAttach = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const parsedDocs = files.map((f, i) => {
      const fileName = f.name;
      const fileType = fileName.endsWith('.xlsx') || fileName.endsWith('.csv') ? 'sheets' : fileName.endsWith('.pptx') ? 'deck' : fileName.endsWith('.pdf') ? 'pdf' : 'compose';
      const sizeStr = f.size ? `${Math.round(f.size / 1024)} KB` : '420 KB';
      return {
        id: `attach-${Date.now()}-${i}`,
        title: fileName,
        type: fileType,
        size: sizeStr
      };
    });

    setPendingAttachments(prev => [...prev, ...parsedDocs]);
    setSelectedAttachmentIndex(0);
    setAttachmentCaption('');
    setIsAttachmentMenuOpen(false);
  };

  const handleAddMoreFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const parsedDocs = files.map((f, i) => {
      const fileName = f.name;
      const fileType = fileName.endsWith('.xlsx') || fileName.endsWith('.csv') ? 'sheets' : fileName.endsWith('.pptx') ? 'deck' : fileName.endsWith('.pdf') ? 'pdf' : 'compose';
      const sizeStr = f.size ? `${Math.round(f.size / 1024)} KB` : '420 KB';
      return {
        id: `attach-${Date.now()}-${i}`,
        title: fileName,
        type: fileType,
        size: sizeStr
      };
    });

    setPendingAttachments(prev => [...prev, ...parsedDocs]);
  };

  const handleSendPendingAttachments = () => {
    if (pendingAttachments.length === 0) return;

    const newMsg = {
      id: `m-doc-${Date.now()}`,
      author: 'You',
      role: 'you',
      text: attachmentCaption.trim() || '',
      createdAt: Date.now(),
      status: 'sent',
      workspaceRef: pendingAttachments.length === 1 ? pendingAttachments[0] : null,
      workspaceRefs: pendingAttachments.length > 1 ? pendingAttachments : null
    };

    setMessages(prev => [...prev, newMsg]);
    setPendingAttachments([]);
    setAttachmentCaption('');
    setSelectedAttachmentIndex(0);
  };

  const handleStartVoiceRecording = () => {
    setIsRecordingVoice(true);
    setIsVoicePaused(false);
    setVoiceElapsedSeconds(0);
    setIsEmojiPickerOpen(false);
  };

  const handleCancelVoiceRecording = () => {
    setIsRecordingVoice(false);
    setIsVoicePaused(false);
    setVoiceElapsedSeconds(0);
  };

  const handleTogglePauseVoiceRecording = () => {
    setIsVoicePaused(prev => !prev);
  };

  const handleSendVoiceRecording = () => {
    const formattedDuration = `${Math.floor(voiceElapsedSeconds / 60)}:${(voiceElapsedSeconds % 60).toString().padStart(2, '0')}`;
    const newAudioMsg = {
      id: `m-voice-${Date.now()}`,
      author: 'You',
      role: 'you',
      isAudio: true,
      audioDuration: formattedDuration === '0:00' ? '0:08' : formattedDuration,
      transcript: 'Voice audio note dispatched across zero-knowledge channel.',
      createdAt: Date.now(),
      status: 'sent'
    };
    setMessages(prev => [...prev, newAudioMsg]);
    setIsRecordingVoice(false);
    setIsVoicePaused(false);
    setVoiceElapsedSeconds(0);
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

  const handleCreateNewChat = (e) => {
    e?.preventDefault();
    if (!newChatName.trim()) return;

    const isGroupChat = newChatType === 'group' || newChatType === 'ai-persona';
    const isAiChannel = newChatType === 'ai-persona';

    const newChannel = {
      id: `chat-${Date.now()}`,
      name: newChatName.trim(),
      avatar: newChatName.trim().slice(0, 2).toUpperCase(),
      isGroup: isGroupChat,
      isAi: isAiChannel,
      modelId: isAiChannel ? newChatPersonaModel : null,
      modelName: isAiChannel ? AI_MODEL_OPTIONS.find(m => m.id === newChatPersonaModel)?.name : null,
      lastMsg: isAiChannel ? `${newChatName} persona initialized.` : 'Channel created. Start messaging...',
      time: 'Just now',
      unread: 0,
      category: isAiChannel ? 'ai' : isGroupChat ? 'teams' : 'all',
      online: true,
      fingerprint: `0x${Math.random().toString(16).slice(2, 6).toUpperCase()} • E2EE • VERIFIED`,
      topics: [newChatName.trim()],
      actions: []
    };

    setConversations(prev => [newChannel, ...prev]);
    setActiveContactId(newChannel.id);
    setIsNewChatModalOpen(false);
    setNewChatName('');
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
        className="h-[54px] flex items-center justify-between px-6 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shrink-0 z-30 cursor-default"
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

        {/* Global Right Actions */}
        <div className="flex items-center gap-2">
          {/* AI Voice Session Trigger Button */}
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

          {/* Top Controls Bar with High Z-Index for Popovers */}
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
                onClick={() => setIsNewChatModalOpen(true)}
                className="w-7 h-7 rounded-lg text-slate-600 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] flex items-center justify-center transition-colors cursor-pointer"
                title="Create Group or Add AI Persona"
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
                placeholder="Search chats, topics or files..."
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

                {/* High Z-Index More Tabs Popover (Floating Over All Chats) */}
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
                    Start a team channel or interact with a local AI persona.
                  </p>
                </div>
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewChatType('group');
                      setIsNewChatModalOpen(true);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus size={13} />
                    <span>Create Team Group</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewChatType('ai-persona');
                      setIsNewChatModalOpen(true);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] text-slate-800 dark:text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Bot size={13} className="text-violet-600" />
                    <span>Deploy Local AI Persona</span>
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
              
              {/* Correctly Aligned Title & Interactive Model Switcher */}
              <div className="min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                    {currentChat.name}
                  </h3>

                  {/* Fully Interactive In-Chat AI Model Selector */}
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
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-violet-100/90 dark:bg-violet-950/90 text-violet-700 dark:text-violet-300 text-[11px] font-bold hover:bg-violet-200 transition-colors cursor-pointer shadow-2xs border border-violet-200/50"
                        title="Switch AI Engine"
                      >
                        <span>{activeModelObj.name}</span>
                        <ChevronDown size={12} className={`transition-transform ${isAiModelSelectorOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown Popover */}
                      {isAiModelSelectorOpen && (
                        <div 
                          data-popover-root="true"
                          className="absolute left-0 top-8 w-64 bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl border border-black/[0.08] dark:border-white/[0.1] p-1.5 z-[100] animate-in fade-in duration-100"
                          onPointerDown={(e) => e.stopPropagation()}
                        >
                          <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-black/[0.04]">
                            Select AI Engine
                          </div>
                          {AI_MODEL_OPTIONS.map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                setSelectedAiModel(m.id);
                                setIsAiModelSelectorOpen(false);
                              }}
                              className={`w-full flex items-start gap-2 p-2 rounded-xl text-left transition-colors cursor-pointer ${
                                selectedAiModel === m.id
                                  ? 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300'
                                  : 'hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200'
                              }`}
                            >
                              <span className="text-sm mt-0.5">{m.icon}</span>
                              <div className="min-w-0 flex-1">
                                <span className="block text-xs font-bold leading-tight">{m.name}</span>
                                <span className="block text-[10px] text-slate-400 leading-tight mt-0.5">{m.desc}</span>
                              </div>
                              {selectedAiModel === m.id && <Check size={13} className="text-violet-600 shrink-0 mt-1" />}
                            </button>
                          ))}
                        </div>
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
                      {currentChat.fingerprint || '0xAI • CRYPTO • ZERO • KNOWLEDGE'}
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

          {/* Message Stream */}
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

            <div className="w-fit mx-auto px-3 py-1 rounded-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.04] text-[10.5px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Today
            </div>

            {messages.map(msg => {
              const isOutgoing = msg.role === 'you';
              const isAssistant = msg.role === 'assistant';

              return (
                <div 
                  key={msg.id}
                  className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'} max-w-2xl ${isOutgoing ? 'ml-auto' : 'mr-auto'} group/msg relative`}
                >
                  {!isOutgoing && (
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mb-1 ml-1">
                      {msg.author}
                    </span>
                  )}

                  {/* Scaled-Up Touch-Friendly Floating Action Toolbar */}
                  <div className={`absolute -top-4.5 ${isOutgoing ? 'right-2' : 'left-2'} z-20 opacity-0 group-hover/msg:opacity-100 transition-all duration-150 flex items-center gap-1 p-1 rounded-xl bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.12] shadow-md select-none`}>
                    <button
                      type="button"
                      onClick={() => setReplyingToMessage(msg)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Reply"
                    >
                      <Reply size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(msg.text || '');
                      }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Copy"
                    >
                      <Copy size={13} />
                    </button>
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
                    {/* Attached Single Document Card */}
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

                    {/* Attached Multiple Documents Bento Grid */}
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

                    {msg.isAudio ? (
                      <div className="space-y-1.5 min-w-[240px]">
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setPlayingVoiceId(prev => prev === msg.id ? null : msg.id)}
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
                        </div>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    )}

                    <div className="mt-1 flex items-center justify-end text-[10px] gap-1 font-mono text-slate-400 dark:text-zinc-500">
                      <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isOutgoing && <CheckCheck size={13} className="text-violet-600 dark:text-violet-400 inline" />}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200/60 text-violet-700 dark:text-violet-300 text-xs w-fit">
                <RegaarderAiIcon size={13} strokeWidth={2.0} className="animate-spin" />
                <span className="font-semibold">Assistant is synthesizing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── BOTTOM COMPOSER ── */}
          <div className="p-4 border-t border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-zinc-900 backdrop-blur-md relative">
            {/* Categorized Apple-Style Emoji Picker Popover */}
            {isEmojiPickerOpen && (
              <div 
                data-popover-root="true"
                className="absolute bottom-16 left-6 w-80 bg-white dark:bg-zinc-850 rounded-3xl shadow-2xl border border-black/[0.08] dark:border-white/[0.1] p-3 z-40 animate-in fade-in slide-in-from-bottom-2 duration-150 select-none"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <div className="relative mb-2">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={emojiSearch}
                    onChange={(e) => setEmojiSearch(e.target.value)}
                    placeholder="Search emoji..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] text-xs text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1 pb-2 mb-2 border-b border-black/[0.05]">
                  {EMOJI_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setEmojiCategory(cat.id)}
                      className={`flex-1 py-1 text-center rounded-lg text-sm transition-colors cursor-pointer ${
                        emojiCategory === cat.id ? 'bg-violet-100 dark:bg-violet-950/80 shadow-2xs' : 'hover:bg-slate-100'
                      }`}
                      title={cat.name}
                    >
                      {cat.icon}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 h-44 overflow-y-auto thin-scrollbar p-1">
                  {(EMOJI_CATEGORIES.find(c => c.id === emojiCategory)?.emojis || [])
                    .filter(em => !emojiSearch || em.includes(emojiSearch))
                    .map((em, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectEmoji(em)}
                        className="w-8 h-8 rounded-lg hover:bg-black/[0.05] text-lg flex items-center justify-center transition-transform hover:scale-120 cursor-pointer"
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
                  onClick={handleCancelVoiceRecording}
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
                      className={`w-1 rounded-full transition-all duration-150 ${
                        isVoicePaused ? 'bg-slate-400' : 'bg-violet-600 dark:bg-violet-400'
                      }`}
                      style={{ height: `${lvl}px` }}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleTogglePauseVoiceRecording}
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
              <form 
                onSubmit={handleSendMessage}
                className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08]"
              >
                <input 
                  type="file" 
                  multiple
                  ref={fileInputRef} 
                  onChange={handleFileAttach} 
                  className="hidden" 
                />

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsAttachmentMenuOpen(prev => !prev)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-black/[0.04] transition-colors cursor-pointer"
                    title="Attach Documents, Media, or Workspace Files"
                  >
                    <Paperclip size={16} />
                  </button>

                  {isAttachmentMenuOpen && (
                    <div 
                      data-popover-root="true"
                      className="absolute bottom-11 left-0 w-56 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-black/[0.08] dark:border-white/[0.1] p-1.5 z-40 animate-in fade-in slide-in-from-bottom-2 duration-150 text-xs"
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-zinc-200 hover:bg-slate-100 text-left font-medium cursor-pointer"
                      >
                        <FileText size={14} className="text-violet-600" />
                        <span>Upload Documents</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAttachmentMenuOpen(false);
                          const demoSheet = {
                            id: `sheet-${Date.now()}`,
                            title: 'Q2 Unit Economics Model.xlsx',
                            type: 'sheets',
                            size: '340 KB'
                          };
                          setPendingAttachments([demoSheet]);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-zinc-200 hover:bg-slate-100 text-left font-medium cursor-pointer"
                      >
                        <Table size={14} className="text-emerald-600" />
                        <span>Import Sheet / Table</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAttachmentMenuOpen(false);
                          const demoDeck = {
                            id: `deck-${Date.now()}`,
                            title: 'Investor Pitch & Token System.pptx',
                            type: 'deck',
                            size: '1.2 MB'
                          };
                          setPendingAttachments([demoDeck]);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-zinc-200 hover:bg-slate-100 text-left font-medium cursor-pointer"
                      >
                        <Presentation size={14} className="text-amber-600" />
                        <span>Import Deck / Diagram</span>
                      </button>
                    </div>
                  )}
                </div>

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
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Message ${activeModelObj.name} or teammates...`}
                  className="flex-1 px-2 py-1.5 text-xs bg-transparent text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none"
                />

                <button
                  type="button"
                  onClick={handleStartVoiceRecording}
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
            )}
          </div>
        </main>
      </div>

      {/* ── REFINED EXECUTIVE AI VOICE CONVERSATIONAL OVERLAY (IMAGE 2 STANDARD) ── */}
      {isAiVoiceSessionActive && (
        <div className="fixed inset-0 z-50 bg-[#090A10]/92 backdrop-blur-2xl flex flex-col items-center justify-between p-8 animate-in fade-in duration-200 select-none">
          {/* Top Bar with Regaarder Signature Circle Brand Icon */}
          <div className="w-full max-w-xl flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs text-white">
              <RegaarderBrandIcon size={14} className="text-violet-400 shrink-0" />
              <span className="font-semibold">{activeModelObj.name}</span>
            </div>

            <button
              type="button"
              onClick={() => setIsAiVoiceSessionActive(false)}
              className="p-2 rounded-full text-white/60 hover:text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              title="Close Voice Session"
            >
              <X size={18} />
            </button>
          </div>

          {/* Central Pulsing Liquid Soundwave Orb + Polished Status Pill Below Orb */}
          <div className="flex flex-col items-center justify-center space-y-5 my-auto">
            <div className="relative flex items-center justify-center">
              <div className={`w-56 h-56 rounded-full bg-gradient-to-tr from-violet-600/40 via-indigo-500/30 to-fuchsia-500/40 blur-3xl transition-all duration-300 pointer-events-none ${isAiVoiceMuted || isAiVoicePaused ? 'opacity-30' : 'animate-pulse'}`} />
              
              <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-700 border-2 border-white/20 shadow-2xl flex items-center justify-center relative overflow-hidden">
                <div className="flex items-center gap-1.5 h-14">
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

            {/* Polished Frosted Status Pill Placed Beneath the Central Orb */}
            <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white/90 shadow-xs">
              <span className={`w-2 h-2 rounded-full ${isAiVoiceMuted ? 'bg-rose-400' : isAiVoicePaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
              <span>
                {isAiVoiceMuted ? 'Microphone is muted' : isAiVoicePaused ? 'Voice session paused' : 'Listening to voice...'}
              </span>
            </div>

            {/* Natural Text Subtitles (Standard Sans Font, No Monospace) */}
            <div className="text-center space-y-1 max-w-md px-4 pt-1">
              <h3 className="text-base font-bold text-white tracking-tight">
                {isAiVoiceMuted ? 'Unmute to continue speaking' : isAiVoicePaused ? 'Session is paused' : 'Speak naturally to collaborate'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {isAiVoiceMuted 
                  ? 'Tap the microphone button below to resume voice streaming.' 
                  : '“I analyzed the active brief and verified all unit economics margins.”'
                }
              </p>
            </div>
          </div>

          {/* Bottom Glass Controls Bar with Pause/Resume Toggle */}
          <div className="w-full max-w-md flex items-center justify-center gap-5 p-3 rounded-3xl bg-white/10 border border-white/10 backdrop-blur-xl shadow-2xl">
            {/* 1. Mute / Unmute Toggle */}
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

            {/* 2. End Voice Session (Apple Rose Red) */}
            <button
              type="button"
              onClick={() => setIsAiVoiceSessionActive(false)}
              className="h-12 px-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <PhoneOff size={16} />
              <span>End Voice Session</span>
            </button>

            {/* 3. Pause / Resume Voice Listening Toggle */}
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

      {/* ── CREATE NEW GROUP / AI PERSONA MODAL ── */}
      {isNewChatModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) setIsNewChatModalOpen(false);
          }}
        >
          <div className="w-full max-w-md bg-white dark:bg-zinc-850 rounded-3xl shadow-2xl border border-black/[0.08] dark:border-white/[0.1] p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Create Channel or Persona</h3>
              <button
                type="button"
                onClick={() => setIsNewChatModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateNewChat} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'group', label: 'Team Group', icon: Users },
                  { id: 'ai-persona', label: 'AI Persona', icon: Bot }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setNewChatType(t.id)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      newChatType === t.id
                        ? 'border-violet-600 bg-violet-50/60 text-violet-700 font-bold'
                        : 'border-black/[0.06] text-slate-600 hover:bg-black/[0.02]'
                    }`}
                  >
                    <t.icon size={15} />
                    <span className="text-[10.5px]">{t.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600">Channel / Persona Name</label>
                <input
                  type="text"
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  placeholder={newChatType === 'ai-persona' ? "e.g. Gemma Copy Reviewer" : "e.g. Design Systems"}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.03] border border-black/[0.08] text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  autoFocus
                />
              </div>

              {newChatType === 'ai-persona' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600">Underlying Engine</label>
                  <select
                    value={newChatPersonaModel}
                    onChange={(e) => setNewChatPersonaModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/[0.03] border border-black/[0.08] text-xs text-slate-800 focus:outline-none"
                  >
                    {AI_MODEL_OPTIONS.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
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
                  disabled={!newChatName.trim()}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Create
                </button>
              </div>
            </form>
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

      {/* Document Attachment Preview Carousel */}
      {pendingAttachments.length > 0 && (
        <div className="fixed inset-0 z-50 bg-white/95 dark:bg-[#0c0d11]/95 backdrop-blur-md flex flex-col justify-between p-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => { setPendingAttachments([]); setAttachmentCaption(''); }}
              className="p-2 rounded-full text-slate-400 hover:text-slate-800 cursor-pointer"
            >
              <X size={20} />
            </button>
            <span className="text-xs font-mono font-semibold text-slate-600">
              {pendingAttachments[selectedAttachmentIndex]?.title || 'Document Preview'}
            </span>
            <div className="w-8" />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-6">
            <div className="w-full max-w-md p-8 rounded-3xl bg-[#F4F5F8] border border-black/[0.05] flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
              <DocsSemanticFileBadge 
                type={pendingAttachments[selectedAttachmentIndex]?.type} 
                title={pendingAttachments[selectedAttachmentIndex]?.title} 
                size="lg" 
              />
              <h3 className="text-sm font-bold text-slate-800">{pendingAttachments[selectedAttachmentIndex]?.title}</h3>
              <span className="text-[11px] text-slate-400">No preview available</span>
            </div>
          </div>

          <div className="w-full max-w-xl mx-auto space-y-3">
            <input
              type="text"
              value={attachmentCaption}
              onChange={(e) => setAttachmentCaption(e.target.value)}
              placeholder="Type a message or document caption..."
              className="w-full px-4 py-2.5 rounded-2xl bg-white border border-black/[0.08] shadow-2xs text-xs text-slate-800 focus:outline-none"
              autoFocus
            />
            <div className="flex items-center justify-center gap-3">
              <input type="file" multiple ref={addMoreFileInputRef} onChange={handleAddMoreFiles} className="hidden" />
              <button
                type="button"
                onClick={handleSendPendingAttachments}
                className="w-12 h-12 rounded-full bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center shadow-lg cursor-pointer shrink-0"
              >
                <Send size={16} className="ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
