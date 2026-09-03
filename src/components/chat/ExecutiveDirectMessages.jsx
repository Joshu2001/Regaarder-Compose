import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, Video, Plus, Check, CheckCheck, Send, Smile, Paperclip, 
  Sparkles, FileText, Table, Presentation, X, ArrowRight, MoreVertical,
  Compass, ShieldCheck, Download, ExternalLink, Calendar, CheckSquare,
  Mic, Pin, PinOff, LayoutGrid, Sparkle, Bot, MessageSquare, ChevronDown,
  Lock, KeyRound, Shield, CheckCircle2, Copy, Info
} from 'lucide-react';
import { RegaarderAiIcon, RegaarderProductIcon, MemoryIcon, OrbIcon, ChatIcon } from '../RegaarderProductIcons';

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
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread' | 'teams'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeContactId, setActiveContactId] = useState(activeThreadId || 'thread-beta-launch');
  const [messageInput, setMessageInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isChatSearchOpen, setIsChatSearchOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState('keyword'); // 'keyword' | 'semantic'
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isDetailsMenuOpen, setIsDetailsMenuOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 'm1',
      author: 'Sarah Johnson',
      role: 'other',
      text: 'Product Hunt launch is locked for May 15th! Did everyone review the updated pricing table in Sheets?',
      createdAt: Date.now() - 1000 * 60 * 55,
      status: 'read',
      workspaceRef: { type: 'sheets', title: 'Q2 Financial Model & Pricing', id: 'sheet-pricing' }
    },
    {
      id: 'm2',
      author: 'Joshua David',
      role: 'you',
      text: 'Looks exceptionally clean. The unit economics margins match our target. I approved the final copy in Docs.',
      createdAt: Date.now() - 1000 * 60 * 42,
      status: 'read',
      workspaceRef: { type: 'compose', title: 'Beta Launch Executive Brief', id: 'doc-beta' }
    },
    {
      id: 'm3',
      author: 'Orb Intelligence',
      role: 'assistant',
      text: 'Decision logged: May 15 launch approved across strategy docs and financial model. Next milestone: Final brand approval.',
      createdAt: Date.now() - 1000 * 60 * 20,
      status: 'read',
      isDecision: true
    }
  ]);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean conversations list without lock spam or clutter
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
      e2eeStatus: 'Verified Enterprise Key',
      participants: ['Sarah Johnson', 'Alex Morgan', 'Joshua David', 'Orb AI']
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
      e2eeStatus: 'Verified Enterprise Key',
      roleTitle: 'VP of Product Strategy'
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
      e2eeStatus: 'Verified Enterprise Key',
      roleTitle: 'Principal Infrastructure Engineer'
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
      e2eeStatus: 'Verified Enterprise Key',
      participants: ['Elena Rostova', 'Sarah Johnson', 'David Vance']
    }
  ], []);

  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      if (activeTab === 'unread' && c.unread === 0) return false;
      if (activeTab === 'teams' && !c.isGroup) return false;
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

    const newMsg = {
      id: `m-${Date.now()}`,
      author: 'You',
      role: 'you',
      text: messageInput.trim(),
      createdAt: Date.now(),
      status: 'sent'
    };

    setMessages(prev => [...prev, newMsg]);
    setMessageInput('');
  };

  const handleLogToMemory = (msg) => {
    if (onLogDecisionToMemory) {
      onLogDecisionToMemory(msg.text, currentChat.name);
    }
  };

  const handleFileAttach = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileName = files[0].name;
      const fileType = fileName.endsWith('.xlsx') || fileName.endsWith('.csv') ? 'sheets' : fileName.endsWith('.pptx') ? 'deck' : 'compose';
      const newMsg = {
        id: `m-${Date.now()}`,
        author: 'You',
        role: 'you',
        text: `Attached file: ${fileName}`,
        createdAt: Date.now(),
        status: 'sent',
        workspaceRef: { type: fileType, title: fileName, id: `file-${Date.now()}` }
      };
      setMessages(prev => [...prev, newMsg]);
    }
  };

  const handleVoiceDictate = () => {
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
      setMessageInput(prev => `${prev ? prev + ' ' : ''}${transcript}`);
      setIsRecordingVoice(false);
    };
    recognition.onerror = () => {
      setIsRecordingVoice(false);
    };
    recognition.onend = () => {
      setIsRecordingVoice(false);
    };
    recognition.start();
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
    if (!chatSearchQuery.trim()) return messages;
    const q = chatSearchQuery.toLowerCase();
    return messages.filter(m => m.text.toLowerCase().includes(q) || m.author.toLowerCase().includes(q));
  }, [messages, chatSearchQuery]);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#FBFBFA] dark:bg-[#0c0d11] font-sans select-none">
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
          {/* Universal Workspace Switcher Button */}
          <button
            type="button"
            data-workspace-switcher="true"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              if (onOpenWorkspaceSwitcher) onOpenWorkspaceSwitcher(rect);
            }}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/90 dark:bg-zinc-850/90 border border-slate-200/70 dark:border-zinc-750 shadow-2xs hover:bg-slate-50 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 transition-all cursor-pointer shrink-0"
            title="Switch Workspace App"
          >
            <LayoutGrid size={14} />
          </button>

          {/* Cohesive Relay Workspace Breadcrumb */}
          <div className="flex items-center gap-2 h-8 px-2.5 rounded-xl bg-white/80 dark:bg-zinc-850/80 border border-slate-200/60 dark:border-zinc-750 shadow-2xs">
            <div className="w-5 h-5 rounded-md bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
              <ChatIcon size={13} strokeWidth={1.8} />
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
        {/* ── LEFT COLUMN: Contacts (WhatsApp-style Clean Soft Highlight, ~340px) ── */}
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
              <div className="flex items-center gap-2">
                <span className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                  Relay
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40">
                  On-Device
                </span>
              </div>
            </div>

            {/* Clean Rounded Search Bar */}
            <div className="relative flex items-center">
              <Search size={14} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search or start new chat..."
                className="w-full pl-9 pr-3 py-2 rounded-2xl bg-white/90 dark:bg-zinc-800/90 border border-black/[0.06] dark:border-white/[0.08] shadow-2xs text-xs text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>

            {/* Quick Filter Tabs (Apple Outlines, Strictly Zero Pills) */}
            <div className="flex items-center gap-1.5 pt-0.5">
              {[
                { id: 'all', label: 'All' },
                { id: 'unread', label: 'Unread' },
                { id: 'teams', label: 'Groups' }
              ].map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1 text-[11.5px] rounded-xl transition-all cursor-pointer ${
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

          {/* Contact Cards (WhatsApp-Style Executive Highlight - No Harsh Outlines) */}
          <div className="flex-1 overflow-y-auto thin-scrollbar p-2.5 space-y-1 relative z-10">
            {filteredConversations.length === 0 && (
              <div className="py-12 text-center text-xs text-slate-400">
                No conversations found
              </div>
            )}
            {filteredConversations.map(chat => {
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

                  {/* Clean Text Details (No lock spam) */}
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
            })}
          </div>
        </aside>

        {/* ── RIGHT COLUMN: Active Chat Stream ── */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#FBFBFC] dark:bg-[#0f1117] relative">
          {/* Active Conversation Header (Clean & Executive) */}
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

            {/* Conversation Tools (In-Chat Search, Pin, Meet, Details Ellipsis) */}
            <div className="flex items-center gap-1.5 relative">
              {/* In-Chat Search Toggle */}
              <button
                type="button"
                onClick={() => setIsChatSearchOpen(prev => !prev)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isChatSearchOpen 
                    ? 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-black/[0.04]'
                }`}
                title="Search within this chat"
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

              {/* Ellipsis Details Menu (Houses Optional Cryptographic / Key Info) */}
              <button
                type="button"
                onClick={() => setIsDetailsMenuOpen(prev => !prev)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isDetailsMenuOpen 
                    ? 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-black/[0.04]'
                }`}
                title="Conversation details and security info"
              >
                <MoreVertical size={15} />
              </button>

              {/* Popover Menu for Details & Cryptography */}
              {isDetailsMenuOpen && (
                <div 
                  className="absolute right-0 top-11 w-72 bg-white dark:bg-zinc-850 rounded-2xl shadow-xl border border-black/[0.06] dark:border-white/[0.08] p-3 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/[0.05] dark:border-white/[0.06]">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-zinc-100">
                      <ShieldCheck size={14} className="text-emerald-600" />
                      <span>Security & Trust Details</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsDetailsMenuOpen(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs"
                    >
                      <X size={13} />
                    </button>
                  </div>
                  <div className="space-y-2 text-[11px] text-slate-600 dark:text-zinc-300">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-black/[0.04]">
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">Encryption Protocol</span>
                      <span className="font-semibold text-slate-800 dark:text-zinc-100">AES-256-GCM / Curve25519 E2EE</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-black/[0.04]">
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">User Fingerprint</span>
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

          {/* ── In-Chat Search Drawer with AI Retrieval Toggle ── */}
          {isChatSearchOpen && (
            <div className="px-6 py-2.5 bg-white/95 dark:bg-zinc-900/95 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between gap-3 shadow-2xs animate-in slide-in-from-top-2 duration-150 z-10">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                  placeholder={searchMode === 'semantic' ? "Ask AI semantic retrieval across this conversation..." : "Search keywords in messages..."}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.05] dark:border-white/[0.06] text-xs text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none"
                  autoFocus
                />
              </div>

              {/* Mode Toggle: Keyword vs. AI Semantic */}
              <div className="flex items-center gap-1 bg-black/[0.04] dark:bg-white/[0.06] p-0.5 rounded-lg shrink-0">
                <button
                  type="button"
                  onClick={() => setSearchMode('keyword')}
                  className={`px-2 py-1 text-[10.5px] rounded-md transition-all cursor-pointer ${
                    searchMode === 'keyword'
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-semibold shadow-2xs'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Keyword
                </button>
                <button
                  type="button"
                  onClick={() => setSearchMode('semantic')}
                  className={`flex items-center gap-1 px-2 py-1 text-[10.5px] rounded-md transition-all cursor-pointer ${
                    searchMode === 'semantic'
                      ? 'bg-violet-600 text-white font-semibold shadow-2xs'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Sparkle size={10} />
                  <span>AI Semantic</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsChatSearchOpen(false);
                  setChatSearchQuery('');
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 thin-scrollbar">
            {/* End-to-End Encryption Security Banner (Clean & Subtle) */}
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
                  className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'} max-w-2xl ${isOutgoing ? 'ml-auto' : 'mr-auto'}`}
                >
                  {/* Author Name */}
                  {!isOutgoing && (
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mb-1 ml-1">
                      {msg.author}
                    </span>
                  )}

                  {/* Clean Message Bubble: Soft Light Blue/Slate Outgoing (matching left atmosphere), White/Slate Incoming */}
                  <div
                    className={`p-3.5 rounded-2xl text-[13px] leading-relaxed relative group transition-shadow ${
                      isOutgoing
                        ? 'bg-[#E3EBF8] dark:bg-[#1C2638] text-slate-900 dark:text-zinc-100 border border-[#D0DDF2] dark:border-[#2B3952] rounded-tr-xs shadow-2xs'
                        : isAssistant
                        ? 'bg-violet-50/80 dark:bg-violet-950/40 text-slate-800 dark:text-zinc-100 border border-violet-200/70 dark:border-violet-800/40 rounded-tl-xs shadow-2xs'
                        : 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 border border-slate-200/70 dark:border-zinc-700 rounded-tl-xs shadow-2xs'
                    }`}
                  >
                    <p>{msg.text}</p>

                    {/* Connected Workspace Reference Card */}
                    {msg.workspaceRef && (
                      <div 
                        onClick={() => onNavigateWorkspace && onNavigateWorkspace(msg.workspaceRef)}
                        className={`mt-2.5 p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                          isOutgoing
                            ? 'bg-white/70 dark:bg-white/5 border-black/[0.06] dark:border-white/10 hover:border-violet-400 text-slate-800 dark:text-zinc-200'
                            : 'bg-black/[0.02] dark:bg-white/[0.04] border-black/[0.05] dark:border-white/[0.08] hover:border-violet-400 text-slate-800 dark:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300 flex items-center justify-center shrink-0">
                            <RegaarderProductIcon name={msg.workspaceRef.type} size={15} />
                          </div>
                          <div className="min-w-0">
                            <span className="block text-xs font-semibold truncate">
                              {msg.workspaceRef.title}
                            </span>
                            <span className="text-[10px] opacity-75">
                              Workspace {msg.workspaceRef.type.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <ArrowRight size={12} className="opacity-70" />
                      </div>
                    )}

                    {/* Ambient Metadata Footer */}
                    <div className="mt-1.5 flex items-center justify-between text-[10px]">
                      <button
                        type="button"
                        onClick={() => handleLogToMemory(msg)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-semibold hover:underline cursor-pointer text-violet-600 dark:text-violet-400"
                        title="Register this claim in Workspace Memory Hub"
                      >
                        <RegaarderAiIcon size={11} strokeWidth={2.0} />
                        <span>Log to Memory</span>
                      </button>
                      <span className="ml-auto font-mono text-slate-400 dark:text-zinc-500">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* ── BOTTOM COMPOSER: WhatsApp Style with Complete Controls ── */}
          <div className="p-4 border-t border-black/[0.06] dark:border-white/[0.08] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md">
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
                placeholder="Type a message, @mention a document, or share updates..."
                className="flex-1 px-2 py-1.5 text-xs bg-transparent text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none"
              />

              {/* 3. Voice Dictation Microphone */}
              <button
                type="button"
                onClick={handleVoiceDictate}
                className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                  isRecordingVoice 
                    ? 'bg-rose-500 text-white animate-pulse' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-black/[0.04]'
                }`}
                title={isRecordingVoice ? "Listening..." : "Dictate message"}
              >
                <Mic size={16} />
              </button>

              {/* 4. Send Button */}
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
        </main>
      </div>
    </div>
  );
}
