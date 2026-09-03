import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, Video, Plus, Check, CheckCheck, Send, Smile, Paperclip, 
  Sparkles, FileText, Table, Presentation, X, ArrowRight, MoreVertical,
  Compass, ShieldCheck, Download, ExternalLink, Calendar, CheckSquare,
  Mic, Pin, PinOff, LayoutGrid, Sparkle, Bot, MessageSquare, ChevronDown,
  Lock, KeyRound, Shield, CheckCircle2, Copy, Info, Hash, ListTodo, CornerDownRight,
  ChevronDown as ScrollDownIcon, Play, Pause, Volume2, AudioLines,
  Reply, Edit3, Wand2, Trash2, Forward, Star, CornerUpRight, BellOff, Bell,
  Share2
} from 'lucide-react';
import { RegaarderAiIcon, RegaarderProductIcon, MemoryIcon, OrbIcon, RelayIcon, ComposeIcon, SheetIcon, DeckIcon } from '../RegaarderProductIcons';
import RegaarderBrandIcon from '../RegaarderBrandIcon';

// Exact Docs File Type Pill Badges (Matching App.jsx getFileSemanticBadge)
const DocsSemanticFileBadge = ({ type, title = '' }) => {
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
  } else if (['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(ext) || type === 'image') {
    bgHex = '#475569';
    label = 'PNG';
    svg = (
      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="5.5" cy="5.5" r="1" fill="currentColor" />
        <path d="M2.5 11.5L6 8L10 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M8.5 10.5L10.5 8.5L13.5 11.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <span
      className="w-[20px] h-[22px] rounded-[5px] flex flex-col items-center justify-center shrink-0 leading-none select-none text-white shadow-xs"
      style={{ backgroundColor: bgHex }}
    >
      <span className="text-[6.5px] font-black tracking-tighter uppercase mb-[1px] text-white leading-none">{label}</span>
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
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread' | 'teams' | 'topics' | 'actions'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeContactId, setActiveContactId] = useState(activeThreadId || 'thread-beta-launch');
  const [messageInput, setMessageInput] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [replyingToMessage, setReplyingToMessage] = useState(null);
  const [activeMoreMenuMsgId, setActiveMoreMenuMsgId] = useState(null);
  const [isPinned, setIsPinned] = useState(false);
  const [isChatSearchOpen, setIsChatSearchOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [isAiMode, setIsAiMode] = useState(false); // Ask AI Conversation Companion
  const [aiCompanionResponse, setAiCompanionResponse] = useState(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [isDetailsMenuOpen, setIsDetailsMenuOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 'm1',
      author: 'Sarah Johnson',
      role: 'other',
      text: 'Product Hunt launch is locked for May 15th! Did everyone review the updated pricing table in Sheets?',
      createdAt: Date.now() - 1000 * 60 * 55,
      status: 'read',
      workspaceRef: { type: 'sheets', title: 'Q2 Financial Model & Pricing.xlsx', id: 'sheet-pricing' },
      topic: 'Pricing & Launch'
    },
    {
      id: 'm2',
      author: 'Joshua David',
      role: 'you',
      text: 'Looks exceptionally clean. The unit economics margins match our target. I approved the final copy in Docs.',
      createdAt: Date.now() - 1000 * 60 * 42,
      status: 'read',
      workspaceRef: { type: 'compose', title: 'Beta Launch Executive Brief.brief', id: 'doc-beta' },
      topic: 'Pricing & Launch'
    },
    {
      id: 'm-audio-1',
      author: 'Sarah Johnson',
      role: 'other',
      isAudio: true,
      audioDuration: '0:18',
      transcript: 'I also synced the marketing deck typography tokens with David Vance.',
      createdAt: Date.now() - 1000 * 60 * 30,
      status: 'read'
    },
    {
      id: 'm3',
      author: 'Orb Intelligence',
      role: 'assistant',
      text: 'Decision logged: May 15 launch approved across strategy docs and financial model. Next milestone: Final brand approval.',
      createdAt: Date.now() - 1000 * 60 * 20,
      status: 'read',
      isDecision: true,
      topic: 'Milestones'
    }
  ]);

  const messagesEndRef = useRef(null);
  const chatScrollContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollBottom(false);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollBottom(distanceToBottom > 60);
  };

  // Clean conversations list
  const conversations = useMemo(() => [
    {
      id: 'thread-beta-launch',
      name: 'Beta Launch Core',
      avatar: 'BL',
      isGroup: true,
      lastMsg: 'Decision logged: May 15 launch approved...',
      time: '20m ago',
      unread: 0,
      category: 'teams',
      online: true,
      fingerprint: '0x8F2A • B419 • E941 • 3D02',
      topics: ['Launch Prep', 'Pricing Model', 'CAC Metrics'],
      actions: [
        { id: 'act-1', text: 'Approve final copy in Docs', status: 'done', assignee: 'Joshua David' },
        { id: 'act-2', text: 'Lock pricing table in Sheets', status: 'done', assignee: 'Sarah Johnson' },
        { id: 'act-3', text: 'Obtain final brand approval', status: 'pending', assignee: 'Alex Morgan' }
      ]
    },
    {
      id: 'dm-sarah',
      name: 'Sarah Johnson',
      avatar: 'SJ',
      isGroup: false,
      lastMsg: 'I added the revised CAC metrics to the presentation deck.',
      time: '1h ago',
      unread: 1,
      category: 'unread',
      online: true,
      fingerprint: '0x4C19 • 7E33 • A08F • 99B1',
      topics: ['CAC Metrics', 'Investor Deck'],
      actions: [
        { id: 'act-4', text: 'Review revised CAC deck slide #4', status: 'pending', assignee: 'You' }
      ]
    },
    {
      id: 'dm-alex',
      name: 'Alex Morgan',
      avatar: 'AM',
      isGroup: false,
      lastMsg: 'The backend webhook latency dropped to 45ms.',
      time: 'Yesterday',
      unread: 0,
      category: 'all',
      online: false,
      fingerprint: '0x11B8 • E209 • 55CA • 7710',
      topics: ['Backend Infrastructure', 'Webhook Latency'],
      actions: []
    },
    {
      id: 'thread-marketing',
      name: 'Marketing & Brand',
      avatar: 'MB',
      isGroup: true,
      lastMsg: 'New typography tokens pushed to design system.',
      time: 'Tuesday',
      unread: 0,
      category: 'teams',
      online: true,
      fingerprint: '0xD702 • 99AE • 1204 • FA88',
      topics: ['Design System', 'Typography Tokens'],
      actions: [
        { id: 'act-5', text: 'Verify typography tokens on mobile', status: 'pending', assignee: 'David Vance' }
      ]
    }
  ], []);

  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      if (activeTab === 'unread' && c.unread === 0) return false;
      if (activeTab === 'teams' && !c.isGroup) return false;
      if (activeTab === 'topics') return true;
      if (activeTab === 'actions') return (c.actions && c.actions.length > 0);
      if (searchQuery.trim()) {
        return c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
               c.lastMsg.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [conversations, activeTab, searchQuery]);

  const currentChat = conversations.find(c => c.id === activeContactId) || conversations[0];

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!messageInput.trim()) return;

    const trimmed = messageInput.trim();

    // Handle Edit Mode
    if (editingMessageId) {
      setMessages(prev => prev.map(m => m.id === editingMessageId ? { ...m, text: trimmed, isEdited: true } : m));
      setEditingMessageId(null);
      setMessageInput('');
      return;
    }

    const isAiTagged = trimmed.toLowerCase().startsWith('@ai') || trimmed.toLowerCase().includes('@regaarder');

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

    if (isAiTagged) {
      setTimeout(() => {
        const aiReply = {
          id: `m-ai-${Date.now()}`,
          author: 'Regaarder AI',
          role: 'assistant',
          text: `Synthesizing across workspace: The May 15th release criteria are satisfied. CAC margin projections in Sheets match target unit economics at 68%.`,
          createdAt: Date.now(),
          status: 'read'
        };
        setMessages(prev => [...prev, aiReply]);
      }, 700);
    }
  };

  const handleStartEdit = (msg) => {
    setEditingMessageId(msg.id);
    setMessageInput(msg.text || '');
    setReplyingToMessage(null);
    setActiveMoreMenuMsgId(null);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setMessageInput('');
  };

  const handleCopyMessage = (msg) => {
    const textToCopy = msg.text || msg.transcript || '';
    if (textToCopy) {
      navigator.clipboard?.writeText(textToCopy);
    }
    setActiveMoreMenuMsgId(null);
  };

  const handleToggleStar = (msgId) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isStarred: !m.isStarred } : m));
    setActiveMoreMenuMsgId(null);
  };

  const handleForwardMessage = (msg) => {
    const textToForward = msg.text || msg.transcript || '';
    setMessageInput(`Fwd: ${textToForward}`);
    setActiveMoreMenuMsgId(null);
  };

  const handleAskAiAboutMessage = (msg) => {
    setIsChatSearchOpen(true);
    setIsAiMode(true);
    const query = `Analyze claim from ${msg.author}: "${msg.text || msg.transcript}"`;
    setChatSearchQuery(query);
    setAiCompanionResponse(`Orb Analysis: "${msg.text || msg.transcript}" aligns with Q2 Milestone targets. Verified against active brief and pricing models.`);
    setActiveMoreMenuMsgId(null);
  };

  const handleDeleteMessage = (msgId) => {
    setMessages(prev => prev.filter(m => m.id !== msgId));
    setActiveMoreMenuMsgId(null);
  };

  const handleAiProofread = (msg) => {
    const current = msg.text || '';
    const polished = current.endsWith('.') ? current : `${current}.`;
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, text: `✨ ${polished}` } : m));
    setActiveMoreMenuMsgId(null);
  };

  const handleLogToMemory = (msg) => {
    if (onLogDecisionToMemory) {
      onLogDecisionToMemory(msg.text || msg.transcript, currentChat.name);
    }
  };

  const handleScheduleHuddle = () => {
    setIsDetailsMenuOpen(false);
    if (onOpenRoom) onOpenRoom();
  };

  const handleExportBrief = () => {
    setIsDetailsMenuOpen(false);
    if (onNavigateWorkspace) {
      onNavigateWorkspace({ type: 'compose', title: `${currentChat.name} Summary Brief.brief` });
    }
  };

  const handleFileAttach = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileName = files[0].name;
      const fileType = fileName.endsWith('.xlsx') || fileName.endsWith('.csv') ? 'sheets' : fileName.endsWith('.pptx') ? 'deck' : fileName.endsWith('.pdf') ? 'pdf' : 'compose';
      const newMsg = {
        id: `m-${Date.now()}`,
        author: 'You',
        role: 'you',
        text: `Shared document: ${fileName}`,
        createdAt: Date.now(),
        status: 'sent',
        workspaceRef: { type: fileType, title: fileName, id: `file-${Date.now()}` }
      };
      setMessages(prev => [...prev, newMsg]);
    }
  };

  const handleVoiceRecord = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser environment.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    if (isRecordingVoice) {
      setIsRecordingVoice(false);
      return;
    }

    setIsRecordingVoice(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setIsRecordingVoice(false);
      const newAudioMsg = {
        id: `m-voice-${Date.now()}`,
        author: 'You',
        role: 'you',
        isAudio: true,
        audioDuration: '0:07',
        transcript: transcript,
        createdAt: Date.now(),
        status: 'sent'
      };
      setMessages(prev => [...prev, newAudioMsg]);
    };
    recognition.onerror = () => {
      setIsRecordingVoice(false);
    };
    recognition.onend = () => {
      setIsRecordingVoice(false);
    };
    recognition.start();
  };

  const handleAiAskSubmit = (e) => {
    e?.preventDefault();
    if (!chatSearchQuery.trim()) return;
    const q = chatSearchQuery.toLowerCase();
    if (q.includes('summary') || q.includes('summarize')) {
      setAiCompanionResponse("Summary: Sarah confirmed May 15 launch. Financial model in Sheets approved. Joshua verified the Docs brief. Milestone pending: Final brand approval.");
    } else if (q.includes('pricing') || q.includes('cac')) {
      setAiCompanionResponse("Pricing & CAC: Pricing model is locked in Sheets with CAC metrics added to the presentation deck.");
    } else {
      setAiCompanionResponse(`Query "${chatSearchQuery}": Found 3 referenced claims in Docs & Sheets. Unit economics confirmed compliant with target margins.`);
    }
  };

  const handleCopyKey = () => {
    if (currentChat?.fingerprint) {
      navigator.clipboard?.writeText(currentChat.fingerprint);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

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

  // In-chat filtered messages
  const visibleMessages = useMemo(() => {
    if (!chatSearchQuery.trim() || isAiMode) return messages;
    const q = chatSearchQuery.toLowerCase();
    return messages.filter(m => (m.text && m.text.toLowerCase().includes(q)) || (m.transcript && m.transcript.toLowerCase().includes(q)) || m.author.toLowerCase().includes(q));
  }, [messages, chatSearchQuery, isAiMode]);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-white dark:bg-[#0c0d11] font-sans select-none">
      {/* ── TOP UNIFIED WORKSPACE BAR (Clean Apple Hierarchy) ── */}
      <header 
        className="h-[54px] flex items-center justify-between px-6 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shrink-0 z-30 cursor-default"
        onDoubleClick={(e) => {
          if (e.target.closest('button, input, textarea, a, select')) return;
          if (onToggleFullscreen) onToggleFullscreen();
        }}
        onPointerDown={handleHeaderTap}
      >
        <div className="flex items-center gap-2.5 select-none">
          {/* Lightweight Borderless Workspace Switcher Button */}
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

          {/* Standard Docs/Sheets Style "R Home" Tab Pill */}
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

          {/* Cohesive Relay Workspace Breadcrumb */}
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
        {/* ── LEFT COLUMN: Contacts (~340px) ── */}
        <aside className="w-[340px] shrink-0 flex flex-col border-r border-black/[0.06] dark:border-white/[0.08] bg-gradient-to-b from-[#f0f4fd] via-[#f7f9fd] to-[#f4f5f8] dark:from-[#0d1017] dark:via-[#090b10] dark:to-[#07080c] relative">
          {/* Subtle Ambient Mesh Radial Glows */}
          <div className="absolute top-0 left-0 w-48 h-48 bg-blue-300/15 dark:bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-0 w-40 h-40 bg-violet-300/15 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Controls Bar */}
          <div 
            className="p-3.5 space-y-2.5 border-b border-black/[0.05] dark:border-white/[0.06] relative z-10 cursor-default"
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
            </div>

            {/* Clean Rounded Search Bar */}
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

            {/* Quick Filter Tabs (All, Unread, Groups, Topics, Actions) */}
            <div className="flex items-center gap-1 pt-0.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All' },
                { id: 'unread', label: 'Unread' },
                { id: 'teams', label: 'Groups' },
                { id: 'topics', label: 'Topics' },
                { id: 'actions', label: 'Actions' }
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
            </div>
          </div>

          {/* Contact Cards / Topic Channels View */}
          <div className="flex-1 overflow-y-auto thin-scrollbar p-2.5 space-y-1 relative z-10">
            {activeTab === 'topics' ? (
              <div className="space-y-2 p-1">
                <div className="text-[10.5px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                  Workspace Topic Channels
                </div>
                {['Launch Prep & Strategy', 'Pricing & Unit Economics', 'CAC & Marketing Deck', 'Design System Tokens'].map((t, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setActiveContactId(conversations[idx % conversations.length].id);
                      setActiveTab('all');
                    }}
                    className="p-3 rounded-2xl bg-white/80 dark:bg-zinc-800/80 hover:bg-white border border-black/[0.04] dark:border-white/[0.05] shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-xs">
                        <Hash size={13} />
                      </div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-zinc-100">{t}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Active</span>
                  </div>
                ))}
              </div>
            ) : activeTab === 'actions' ? (
              <div className="space-y-2 p-1">
                <div className="text-[10.5px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                  Extracted Conversation Actions
                </div>
                {conversations.flatMap(c => c.actions || []).map((action) => (
                  <div
                    key={action.id}
                    className="p-3 rounded-2xl bg-white/80 dark:bg-zinc-800/80 border border-black/[0.04] dark:border-white/[0.05] shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">
                        {action.assignee}
                      </span>
                      <span className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded ${action.status === 'done' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {action.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-800 dark:text-zinc-100">{action.text}</p>
                  </div>
                ))}
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
                    {/* Avatar with Status Indicator */}
                    <div className="relative shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                        chat.isGroup
                          ? 'bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800'
                          : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200'
                      }`}>
                        {chat.avatar}
                      </div>
                      {chat.online && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0e1017]" />
                      )}
                    </div>

                    {/* Clean Text Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                          {chat.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {chat.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-[11.5px] text-slate-500 dark:text-zinc-400 truncate">
                          {chat.lastMsg}
                        </p>
                        {chat.unread > 0 && (
                          <span className="w-4 h-4 rounded-full bg-violet-600 text-white text-[9.5px] font-bold flex items-center justify-center shrink-0">
                            {chat.unread}
                          </span>
                        )}
                      </div>
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
            className="h-[60px] px-6 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center justify-between shrink-0 cursor-default select-none z-20"
            onDoubleClick={(e) => {
              if (e.target.closest('button, input, textarea, a, select')) return;
              if (onToggleFullscreen) onToggleFullscreen();
            }}
            onPointerDown={handleHeaderTap}
          >
            <div className="flex items-center gap-3 min-w-0 pointer-events-none">
              <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-bold text-xs flex items-center justify-center border border-violet-200 dark:border-violet-800/60 pointer-events-auto">
                {currentChat.avatar}
              </div>
              <div className="min-w-0 pointer-events-auto">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                  {currentChat.name}
                </h3>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Active
                  </span>
                  <span>•</span>
                  <span>Synced with Workspace Graph</span>
                </div>
              </div>
            </div>

            {/* Conversation Tools */}
            <div className="flex items-center gap-1.5 relative">
              {/* In-Chat Search / Ask AI Toggle */}
              <button
                type="button"
                onClick={() => setIsChatSearchOpen(prev => !prev)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isChatSearchOpen 
                    ? 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-black/[0.04]'
                }`}
                title="Search or Ask AI within this chat"
              >
                <Search size={15} />
              </button>

              {/* Pin Conversation Toggle */}
              <button
                type="button"
                onClick={() => setIsPinned(prev => !prev)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isPinned 
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-black/[0.04]'
                }`}
                title={isPinned ? "Unpin chat" : "Pin chat to top"}
              >
                {isPinned ? <PinOff size={15} /> : <Pin size={15} />}
              </button>

              {/* Ellipsis Details Menu (Enterprise Utility Hub) */}
              <button
                type="button"
                onClick={() => setIsDetailsMenuOpen(prev => !prev)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isDetailsMenuOpen 
                    ? 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-black/[0.04]'
                }`}
                title="Conversation details and enterprise tools"
              >
                <MoreVertical size={15} />
              </button>

              {/* Enterprise Popover Utility Menu (Schedule, Export, Mute, Security) */}
              {isDetailsMenuOpen && (
                <div 
                  className="absolute right-0 top-11 w-72 bg-white dark:bg-zinc-850 rounded-2xl shadow-xl border border-black/[0.06] dark:border-white/[0.08] p-3 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/[0.05] dark:border-white/[0.06]">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-zinc-100">
                      <ShieldCheck size={14} className="text-emerald-600" />
                      <span>Enterprise Thread Tools</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsDetailsMenuOpen(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs"
                    >
                      <X size={13} />
                    </button>
                  </div>

                  {/* 4 High-Value Enterprise Actions */}
                  <div className="space-y-1 mb-2.5">
                    <button
                      type="button"
                      onClick={handleScheduleHuddle}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700/60 transition-colors text-left cursor-pointer"
                    >
                      <Calendar size={14} className="text-violet-600 dark:text-violet-400" />
                      <span>Schedule Instant Huddle</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportBrief}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700/60 transition-colors text-left cursor-pointer"
                    >
                      <FileText size={14} className="text-blue-600 dark:text-blue-400" />
                      <span>Export Thread to Docs Brief</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsMuted(prev => !prev); setIsDetailsMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700/60 transition-colors text-left cursor-pointer"
                    >
                      {isMuted ? <Bell size={14} className="text-emerald-600" /> : <BellOff size={14} className="text-slate-500" />}
                      <span>{isMuted ? 'Unmute Notifications' : 'Mute Thread Notifications'}</span>
                    </button>
                  </div>

                  {/* E2EE Security Section */}
                  <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.06] space-y-1.5 text-[11px]">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-black/[0.04]">
                      <span className="block text-[9.5px] text-slate-400 uppercase font-semibold">User Fingerprint</span>
                      <span className="font-mono text-[10.5px] font-bold text-slate-800 dark:text-zinc-100 block truncate">
                        {currentChat.fingerprint || '0x8F2A • B419 • E941 • 3D02'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyKey}
                      className="w-full py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-700 hover:bg-slate-200 text-slate-800 dark:text-zinc-200 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedKey ? <CheckCircle2 size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      <span>{copiedKey ? 'Fingerprint Copied' : 'Copy Key Fingerprint'}</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="w-[1px] h-4 bg-black/[0.08] dark:bg-white/[0.1] mx-1" />

              <button
                type="button"
                onClick={onOpenRoom}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/60 transition-colors cursor-pointer"
                title="Instant Video Room"
              >
                <Video size={13} />
                <span>Call</span>
              </button>
            </div>
          </header>

          {/* ── In-Chat Search & Ask AI Drawer ── */}
          {isChatSearchOpen && (
            <div className="px-6 py-2.5 bg-white/95 dark:bg-zinc-900/95 border-b border-black/[0.06] dark:border-white/[0.08] flex flex-col gap-2 shadow-2xs animate-in slide-in-from-top-2 duration-150 z-10">
              <form onSubmit={handleAiAskSubmit} className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={chatSearchQuery}
                    onChange={(e) => {
                      setChatSearchQuery(e.target.value);
                      if (aiCompanionResponse) setAiCompanionResponse(null);
                    }}
                    placeholder={isAiMode ? "Ask AI: e.g. 'Summarize conversation' or 'What did we decide on CAC?'..." : "Search keywords in messages..."}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.05] dark:border-white/[0.06] text-xs text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none"
                    autoFocus
                  />
                </div>

                {/* Mode Toggle: Search vs. Ask AI (with official signature circular AI glyph) */}
                <div className="flex items-center gap-1 bg-black/[0.04] dark:bg-white/[0.06] p-0.5 rounded-xl shrink-0">
                  <button
                    type="button"
                    onClick={() => { setIsAiMode(false); setAiCompanionResponse(null); }}
                    className={`px-2.5 py-1 text-[10.5px] rounded-lg transition-all cursor-pointer ${
                      !isAiMode
                        ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-semibold shadow-2xs'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAiMode(true)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-[10.5px] rounded-lg transition-all cursor-pointer ${
                      isAiMode
                        ? 'bg-violet-600 text-white font-semibold shadow-2xs'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <RegaarderAiIcon size={12} strokeWidth={2.0} />
                    <span>Ask AI</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsChatSearchOpen(false);
                    setChatSearchQuery('');
                    setAiCompanionResponse(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              </form>

              {/* In-Chat AI Response Card */}
              {aiCompanionResponse && (
                <div className="p-3 rounded-xl bg-violet-50/80 dark:bg-violet-950/40 border border-violet-200/80 dark:border-violet-800/50 text-xs text-slate-800 dark:text-zinc-100 flex items-start gap-2.5 animate-in fade-in duration-200">
                  <div className="w-5 h-5 rounded-md bg-violet-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <RegaarderAiIcon size={11} strokeWidth={2.0} />
                  </div>
                  <div className="flex-1 leading-relaxed">
                    <span className="font-bold text-violet-700 dark:text-violet-300 block mb-0.5">Regaarder Synthesis:</span>
                    <p>{aiCompanionResponse}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Message Stream */}
          <div 
            ref={chatScrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-6 py-5 space-y-4 thin-scrollbar relative"
          >
            {/* End-to-End Encryption Security Banner */}
            <div className="w-fit mx-auto px-4 py-2 rounded-xl bg-amber-500/[0.08] dark:bg-amber-500/[0.12] border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-200 flex items-center gap-2 max-w-lg text-center leading-normal shadow-2xs">
              <Lock size={12} className="text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                Messages and calls are end-to-end encrypted. No one outside of this chat, not even Regaarder, can read or listen to them.
              </span>
            </div>

            <div className="w-fit mx-auto px-3 py-1 rounded-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.06] text-[10.5px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Today
            </div>

            {visibleMessages.length === 0 && (
              <div className="py-12 text-center text-xs text-slate-400">
                No matching messages found
              </div>
            )}

            {visibleMessages.map(msg => {
              const isOutgoing = msg.role === 'you';
              const isAssistant = msg.role === 'assistant';

              return (
                <div 
                  key={msg.id}
                  className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'} max-w-2xl ${isOutgoing ? 'ml-auto' : 'mr-auto'} group/msg relative`}
                >
                  {/* Author Name */}
                  {!isOutgoing && (
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mb-1 ml-1">
                      {msg.author}
                    </span>
                  )}

                  {/* ── 20/80 Focused Floating Action Toolbar (WhatsApp & Apple Standard) ── */}
                  <div className={`absolute -top-3.5 ${isOutgoing ? 'right-2' : 'left-2'} z-20 opacity-0 group-hover/msg:opacity-100 transition-all duration-150 flex items-center gap-0.5 p-0.5 rounded-lg bg-white dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.12] shadow-sm select-none`}>
                    {/* 1. Reply / Quote */}
                    <button
                      type="button"
                      onClick={() => setReplyingToMessage(msg)}
                      className="p-1 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors"
                      title="Reply / Quote"
                    >
                      <Reply size={12} />
                    </button>

                    {/* 2. Forward */}
                    <button
                      type="button"
                      onClick={() => handleForwardMessage(msg)}
                      className="p-1 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors"
                      title="Forward to chat"
                    >
                      <Forward size={12} />
                    </button>

                    {/* 3. Ask AI about this message */}
                    <button
                      type="button"
                      onClick={() => handleAskAiAboutMessage(msg)}
                      className="p-1 rounded-md text-violet-600 hover:text-violet-800 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/50 transition-colors"
                      title="Ask AI about this message"
                    >
                      <RegaarderAiIcon size={12} strokeWidth={2.0} />
                    </button>

                    {/* 4. Star / Bookmark */}
                    <button
                      type="button"
                      onClick={() => handleToggleStar(msg.id)}
                      className={`p-1 rounded-md transition-colors ${msg.isStarred ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-700'}`}
                      title={msg.isStarred ? "Unstar message" : "Star message"}
                    >
                      <Star size={12} className={msg.isStarred ? "fill-amber-500" : ""} />
                    </button>

                    {/* 5. Micro-Ellipsis for Secondary Actions (Copy, Edit, AI Polish, Delete) */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setActiveMoreMenuMsgId(prev => prev === msg.id ? null : msg.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors"
                        title="More actions"
                      >
                        <MoreVertical size={12} />
                      </button>

                      {activeMoreMenuMsgId === msg.id && (
                        <div 
                          className="absolute right-0 top-6 w-36 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-black/[0.08] dark:border-white/[0.1] p-1 z-30 animate-in fade-in zoom-in-95 duration-100 text-xs"
                          onPointerDown={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(msg)}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-750 text-left font-medium"
                          >
                            <Copy size={11} />
                            <span>Copy Text</span>
                          </button>
                          {isOutgoing && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStartEdit(msg)}
                                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-750 text-left font-medium"
                              >
                                <Edit3 size={11} />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAiProofread(msg)}
                                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/40 text-left font-medium"
                              >
                                <Wand2 size={11} />
                                <span>AI Polish</span>
                              </button>
                            </>
                          )}
                          <div className="my-0.5 border-t border-black/[0.04] dark:border-white/[0.06]" />
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left font-medium"
                          >
                            <Trash2 size={11} />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`p-3.5 rounded-2xl text-[13px] leading-relaxed relative group transition-shadow ${
                      isOutgoing
                        ? 'bg-[#F0F2F6] dark:bg-[#1E232F] text-slate-900 dark:text-zinc-100 border border-[#E1E4EA] dark:border-[#2D3546] rounded-tr-xs shadow-2xs'
                        : isAssistant
                        ? 'bg-violet-50/80 dark:bg-violet-950/40 text-slate-800 dark:text-zinc-100 border border-violet-200/70 dark:border-violet-800/40 rounded-tl-xs shadow-2xs'
                        : 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 border border-slate-200/70 dark:border-zinc-700 rounded-tl-xs shadow-2xs'
                    }`}
                  >
                    {/* Quoted Message / Reply Preview if Present */}
                    {msg.replyTo && (
                      <div className="mb-2 p-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border-l-2 border-violet-600 text-[11px] space-y-0.5">
                        <span className="font-bold text-violet-700 dark:text-violet-400 block">{msg.replyTo.author}</span>
                        <p className="text-slate-600 dark:text-zinc-300 truncate">{msg.replyTo.text}</p>
                      </div>
                    )}

                    {/* Audio Voice Note Player with AI Transcript */}
                    {msg.isAudio ? (
                      <div className="space-y-2 min-w-[240px]">
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setPlayingVoiceId(prev => prev === msg.id ? null : msg.id)}
                            className="w-8 h-8 rounded-full bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center shrink-0 transition-colors shadow-2xs cursor-pointer"
                          >
                            {playingVoiceId === msg.id ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
                          </button>
                          
                          {/* Animated Voice Scrubber */}
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
                            {msg.audioDuration || '0:12'}
                          </span>
                        </div>

                        {/* Collapsible / Visible AI Transcription */}
                        {msg.transcript && (
                          <div className="p-2 rounded-xl bg-white dark:bg-black/20 border border-black/[0.04] text-[11px] leading-relaxed text-slate-700 dark:text-zinc-300 flex items-start gap-1.5">
                            <Sparkle size={12} className="text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-slate-800 dark:text-zinc-200">AI Transcript: </span>
                              <span>"{msg.transcript}"</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p>{msg.text}</p>
                    )}

                    {/* Exact Docs-Standard Colored Semantic File Badge Attachment (Image 3) */}
                    {msg.workspaceRef && (
                      <div 
                        onClick={() => onNavigateWorkspace && onNavigateWorkspace(msg.workspaceRef)}
                        className={`mt-2.5 p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          isOutgoing
                            ? 'bg-white dark:bg-zinc-800/80 border-black/[0.06] dark:border-white/10 hover:border-violet-500 text-slate-800 dark:text-zinc-200 shadow-2xs'
                            : 'bg-black/[0.02] dark:bg-white/[0.04] border-black/[0.05] dark:border-white/[0.08] hover:border-violet-400 text-slate-800 dark:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <DocsSemanticFileBadge type={msg.workspaceRef.type} title={msg.workspaceRef.title} />
                          <div className="min-w-0">
                            <span className="block text-xs font-semibold truncate text-slate-900 dark:text-zinc-100">
                              {msg.workspaceRef.title}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">
                              Workspace {msg.workspaceRef.type}
                            </span>
                          </div>
                        </div>
                        <ArrowRight size={13} className="opacity-70 shrink-0" />
                      </div>
                    )}

                    {/* Ambient Metadata & Read Tick Footer */}
                    <div className="mt-1.5 flex items-center justify-between text-[10px] gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleLogToMemory(msg)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-semibold hover:underline cursor-pointer text-violet-600 dark:text-violet-400"
                          title="Register this claim in Workspace Memory Hub"
                        >
                          <RegaarderAiIcon size={11} strokeWidth={2.0} />
                          <span>Log to Memory</span>
                        </button>
                        {msg.isStarred && <Star size={10} className="fill-amber-500 text-amber-500" />}
                      </div>
                      <div className="ml-auto flex items-center gap-1 font-mono text-slate-400 dark:text-zinc-500">
                        {msg.isEdited && <span className="text-[9.5px] italic text-slate-400 mr-0.5">edited</span>}
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isOutgoing && <CheckCheck size={13} className="text-violet-600 dark:text-violet-400 inline" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* ── WhatsApp-Style Floating Scroll-to-Bottom Button ── */}
          {showScrollBottom && (
            <button
              type="button"
              onClick={scrollToBottom}
              className="absolute bottom-20 right-8 w-9 h-9 rounded-full bg-white dark:bg-zinc-800 border border-black/[0.1] dark:border-white/[0.15] shadow-lg flex items-center justify-center text-slate-600 dark:text-zinc-200 hover:text-violet-600 hover:scale-105 transition-all cursor-pointer z-30 animate-in fade-in zoom-in-95 duration-150"
              title="Scroll to bottom"
            >
              <ScrollDownIcon size={17} />
            </button>
          )}

          {/* ── BOTTOM COMPOSER (WhatsApp Style with Quote & Edit Banners) ── */}
          <div className="p-4 border-t border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-zinc-900 backdrop-blur-md">
            {/* 1. WhatsApp-Style Quoted Reply Preview Banner */}
            {replyingToMessage && (
              <div className="mb-2 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/90 border border-black/[0.06] flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-150">
                <div className="flex items-center gap-2 min-w-0 border-l-2 border-violet-600 pl-2">
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-violet-700 dark:text-violet-400 block truncate">
                      Replying to {replyingToMessage.author}
                    </span>
                    <p className="text-xs text-slate-600 dark:text-zinc-300 truncate">
                      {replyingToMessage.text || replyingToMessage.transcript}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyingToMessage(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* 2. Edit Message Mode Banner */}
            {editingMessageId && (
              <div className="mb-2 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200 font-medium">
                  <Edit3 size={13} />
                  <span>Editing message</span>
                </div>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}

            <form 
              onSubmit={handleSendMessage}
              className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08]"
            >
              {/* Hidden File Input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileAttach} 
                className="hidden" 
              />

              {/* 1. Attachment Clip */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-black/[0.04] transition-colors cursor-pointer"
                title="Attach Document, Sheet, or File"
              >
                <Paperclip size={16} />
              </button>

              {/* 2. Emoji Picker Button */}
              <button
                type="button"
                onClick={() => setMessageInput(prev => `${prev} 👍`)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-black/[0.04] transition-colors cursor-pointer"
                title="Quick Emoji Reaction"
              >
                <Smile size={16} />
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={editingMessageId ? "Edit your message..." : "Type a message, @AI to ask assistant, or share files..."}
                className="flex-1 px-2 py-1.5 text-xs bg-transparent text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none"
              />

              {/* 3. Audio Voice Message Recorder with Auto-Transcription */}
              <button
                type="button"
                onClick={handleVoiceRecord}
                className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                  isRecordingVoice 
                    ? 'bg-rose-500 text-white animate-pulse' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-black/[0.04]'
                }`}
                title={isRecordingVoice ? "Recording audio note... (Click to send)" : "Record audio voice note"}
              >
                <Mic size={16} />
              </button>

              {/* 4. Send Button */}
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="w-8 h-8 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-30 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-xs"
                title={editingMessageId ? "Save Edit" : "Send Message"}
              >
                <Send size={13} />
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
