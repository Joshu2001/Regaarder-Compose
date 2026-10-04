import React, { useState, useEffect } from 'react';
import { Mail, ArrowRight, ShieldCheck, Inbox, RefreshCw, Send, CheckCircle2 } from 'lucide-react';

export function RegaarderCourierModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMail, setSelectedMail] = useState(null);

  const fetchInbox = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/courier-webhook');
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        if (data.messages && data.messages.length > 0 && !selectedMail) {
          setSelectedMail(data.messages[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch courier messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInbox();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[650px] animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Mail size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white tracking-tight">Regaarder Courier</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Routing Active
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span>support@regaarder.com</span>
                <ArrowRight size={11} className="text-slate-500" />
                <span className="text-violet-400 font-mono">regaarder@gmail.com</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchInbox}
              disabled={loading}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh Inbox"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Body Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Message List */}
          <div className="w-1/3 border-r border-slate-800/80 overflow-y-auto bg-slate-950/50">
            {messages.length === 0 ? (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center h-full">
                <Inbox size={28} className="text-slate-600 mb-2" />
                <p className="text-xs font-medium">No messages yet</p>
                <p className="text-[11px] text-slate-600 mt-1 max-w-[200px]">
                  Emails sent to support@regaarder.com will appear here and route to regaarder@gmail.com
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-900">
                {messages.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => setSelectedMail(msg)}
                    className={`w-full text-left p-4 transition-colors ${
                      selectedMail?.id === msg.id
                        ? 'bg-violet-950/30 border-l-2 border-violet-500'
                        : 'hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-200 truncate max-w-[140px]">
                        {msg.from}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(msg.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-300 truncate mb-1">
                      {msg.subject || '(No subject)'}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {msg.body || 'No content'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mail Content Viewer */}
          <div className="flex-1 flex flex-col bg-slate-900/30 overflow-y-auto">
            {selectedMail ? (
              <div className="p-6 flex-1 flex flex-col">
                <div className="border-b border-slate-800 pb-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-white tracking-tight">{selectedMail.subject}</h3>
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      Forwarded to regaarder@gmail.com
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1">
                    <p><span className="text-slate-500">From:</span> {selectedMail.from}</p>
                    <p><span className="text-slate-500">To:</span> {selectedMail.to}</p>
                    <p><span className="text-slate-500">Date:</span> {new Date(selectedMail.receivedAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex-1 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap overflow-y-auto">
                  {selectedMail.body || 'No text content.'}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                <Mail size={32} className="mb-2 opacity-50" />
                <p className="text-xs">Select a message from the list</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-2.5 border-t border-slate-800/80 bg-slate-950 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-emerald-500" />
            Zero-cost Namecheap / Cloudflare email routing enabled
          </span>
          <span>Target: regaarder@gmail.com</span>
        </div>
      </div>
    </div>
  );
}
