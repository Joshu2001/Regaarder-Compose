import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, Video, Plus, Check, CheckCheck, Send, Smile, Paperclip, 
  Sparkles, FileText, Table, Presentation, X, ArrowRight, MoreVertical,
  Compass, ShieldCheck, Download, ExternalLink, Calendar, CheckSquare
} from 'lucide-react';
import { RegaarderAiIcon, RegaarderProductIcon, MemoryIcon, OrbIcon } from '../RegaarderProductIcons';

export default function ExecutiveDirectMessages({
  isDarkMode = false,
  threads = [],
  activeThreadId,
  onSelectThread,
  onOpenRoom,
  onOpenMemory,
  onLogDecisionToMemory,
  onNavigateWorkspace,
  onToggleFullscreen
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread' | 'teams'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeContactId, setActiveContactId] = useState(activeThreadId || 'thread-beta-launch');
  const [messageInput, setMessageInput] = useState('');
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Demo conversations list
  const conversations = useMemo(() => [
    {
      id: 'thread-beta-launch',
      name: 'Beta Launch Core',
      avatar: 'BL',
      isGroup: true,
      lastMsg: 'Decision logged: May 15 launch approved...',
      time: '20m ago',
      unread: 0,
      category: 'teams'
    },
    {
      id: 'dm-sarah',
      name: 'Sarah Johnson',
      avatar: 'SJ',
      isGroup: false,
      lastMsg: 'I added the revised CAC metrics to the presentation deck.',
      time: '1h ago',
      unread: 1,
      category: 'unread'
    },
    {
      id: 'dm-alex',
      name: 'Alex Morgan',
      avatar: 'AM',
      isGroup: false,
      lastMsg: 'The backend webhook latency dropped to 45ms.',
      time: 'Yesterday',
      unread: 0,
      category: 'all'
    },
    {
      id: 'thread-marketing',
      name: 'Marketing & Brand',
      avatar: 'MB',
      isGroup: true,
      lastMsg: 'New typography tokens pushed to design system.',
      time: 'Tuesday',
      unread: 0,
      category: 'teams'
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
    <div 
      className="flex h-full w-full overflow-hidden bg-[#f4f5f8] dark:bg-[#0c0d11] font-sans select-none"
      onDoubleClick={(e) => {
        if (e.target.closest('button, input, textarea, a, select, [contenteditable="true"]')) return;
        if (onToggleFullscreen) onToggleFullscreen();
      }}
    >
      {/* ── LEFT COLUMN: Contacts & Groups (WhatsApp Architecture, ~340px) ── */}
      <aside className="w-[340px] shrink-0 flex flex-col border-r border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#14161d]">
        {/* Top Search & Controls Bar */}
        <div 
          className="p-3.5 space-y-3 border-b border-black/[0.05] dark:border-white/[0.06] cursor-default"
          onDoubleClick={(e) => {
            if (e.target.closest('button, input, textarea')) return;
            if (onToggleFullscreen) onToggleFullscreen();
          }}
          onPointerDown={handleHeaderTap}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                Messages
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onOpenMemory}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors"
                title="Workspace Memory Hub"
              >
                <MemoryIcon size={16} />
              </button>
            </div>
          </div>

          {/* WhatsApp-Style Search Input */}
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search or start a new chat..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.06] text-xs text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-zinc-800 focus:border-violet-300 transition-all"
            />
          </div>

          {/* Quick Filter Tabs (Apple Outlines, Strictly No Pills) */}
          <div className="flex items-center gap-1.5 pt-0.5">
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: 'Unread' },
              { id: 'teams', label: 'Teams' }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 text-[11.5px] rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'border border-slate-200/90 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-semibold shadow-2xs outline outline-1 outline-violet-500/40'
                      : 'border border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04] font-medium'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto thin-scrollbar divide-y divide-black/[0.03] dark:divide-white/[0.03]">
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
                className={`flex items-center gap-3 p-3 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-violet-50/70 dark:bg-violet-950/30'
                    : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                }`}
              >
                {/* Contact Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  chat.isGroup
                    ? 'bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800'
                    : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200'
                }`}>
                  {chat.avatar}
                </div>

                {/* Text Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                      {chat.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {chat.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[11.5px] text-slate-500 dark:text-zinc-400 truncate pr-2">
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

      {/* ── RIGHT COLUMN: Active Chat Stream (Apple Aesthetics) ── */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f9f9fb] dark:bg-[#0f1117]">
        {/* Top Executive Chat Header */}
        <header 
          className="h-[60px] px-6 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center justify-between shrink-0 cursor-default select-none"
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
                <span>Enterprise Workspace Sync</span>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenRoom}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/60 transition-colors cursor-pointer"
              title="Start or join video room"
            >
              <Video size={13} />
              <span>Room Video</span>
            </button>

            <button
              type="button"
              onClick={onOpenMemory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-black/[0.03] dark:bg-white/[0.05] text-slate-700 dark:text-zinc-200 hover:bg-black/[0.06] transition-colors cursor-pointer"
              title="Open Workspace Memory Hub"
            >
              <MemoryIcon size={13} />
              <span>Memory Hub</span>
            </button>
          </div>
        </header>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 thin-scrollbar">
          <div className="w-fit mx-auto px-3 py-1 rounded-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.06] text-[10.5px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
            Today
          </div>

          {messages.map(msg => {
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

                {/* Message Bubble */}
                <div
                  className={`p-3.5 rounded-2xl text-[13px] leading-relaxed relative group ${
                    isOutgoing
                      ? 'bg-[#7C5ACF] text-white rounded-tr-xs shadow-xs'
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
                          ? 'bg-white/10 border-white/20 hover:bg-white/20 text-white'
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
                          <span className="text-[10px] opacity-70">
                            Workspace {msg.workspaceRef.type.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <ArrowRight size={12} className="opacity-70" />
                    </div>
                  )}

                  {/* 1-Tap Log to Memory Action */}
                  <div className="mt-2 pt-1.5 border-t border-current/10 flex items-center justify-between text-[10.5px]">
                    <button
                      type="button"
                      onClick={() => handleLogToMemory(msg)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-semibold hover:underline cursor-pointer"
                      title="Register this claim/decision in Workspace Memory Hub"
                    >
                      <RegaarderAiIcon size={11} strokeWidth={2.0} />
                      <span>Log to Memory</span>
                    </button>
                    <span className="opacity-60 ml-auto font-mono text-[10px]">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Message Input Bar */}
        <div className="p-4 border-t border-black/[0.06] dark:border-white/[0.08] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md">
          <form 
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08]"
          >
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message, @mention a document, or share updates..."
              className="flex-1 px-3 py-2 text-xs bg-transparent text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!messageInput.trim()}
              className="w-8 h-8 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-30 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Send Message"
            >
              <Send size={13} />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
