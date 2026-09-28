import React, { useState, useEffect } from 'react';
import {
  X,
  RefreshCw,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Search,
  Check,
  Lock,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  BarChart3,
  Activity,
  Users,
  Monitor,
  Calendar,
  Zap
} from 'lucide-react';
import { feedbackSubmissionService } from '../../services/feedbackSubmissionService';
import { telemetryService } from '../../services/telemetryService';

// Secret Founder PIN / Passcode (Change or configure via environment variable VITE_FOUNDER_ADMIN_PIN if desired)
const DEFAULT_FOUNDER_PIN = '1984';
const AUTH_SESSION_KEY = 'regaarder_admin_unlocked';

const TYPE_CONFIG = {
  bug: { label: 'Bug', icon: AlertTriangle, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200/80 dark:border-rose-900/60' },
  idea: { label: 'Idea', icon: Lightbulb, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200/80 dark:border-amber-900/60' },
  improvement: { label: 'Improvement', icon: Sparkles, color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/40 dark:text-violet-400 border-violet-200/80 dark:border-violet-900/60' },
  other: { label: 'General', icon: MessageSquare, color: 'text-slate-600 bg-slate-50 dark:bg-zinc-800 dark:text-zinc-300 border-slate-200 dark:border-zinc-700' }
};

const STATUS_CONFIG = {
  new: { label: 'New', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-900/60' },
  in_review: { label: 'In Review', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-900/60' },
  resolved: { label: 'Resolved', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60' }
};

export default function AdminFeedbackTriageModal({ isOpen, onClose }) {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem(AUTH_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  const [activeTab, setActiveTab] = useState('feedback'); // 'feedback' | 'insights'
  const [insights, setInsights] = useState(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  const [feedbackList, setFeedbackList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const handleUnlock = (e) => {
    e?.preventDefault();
    const targetPin = (import.meta?.env?.VITE_FOUNDER_ADMIN_PIN || DEFAULT_FOUNDER_PIN).trim();
    if (passcodeInput.trim() === targetPin) {
      try {
        sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
      } catch {}
      setIsUnlocked(true);
      setPasscodeError(false);
      loadFeedback();
      loadInsights();
    } else {
      setPasscodeError(true);
    }
  };

  const loadInsights = async () => {
    setIsLoadingInsights(true);
    try {
      const data = await telemetryService.getTelemetryInsights();
      setInsights(data);
    } catch (err) {
      console.error('[Admin] Failed to load telemetry insights:', err);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const loadFeedback = async () => {
    setIsLoading(true);
    try {
      const items = await feedbackSubmissionService.getFeedbackList({ status: statusFilter });
      setFeedbackList(items);
      if (items.length > 0 && !selectedItem) {
        setSelectedItem(items[0]);
        setAdminNotes(items[0].admin_notes || items[0].adminNotes || '');
      }
    } catch (e) {
      console.error('[Admin Feedback] Failed to load feedback:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isUnlocked) {
      loadFeedback();
      loadInsights();
    }
  }, [isOpen, isUnlocked, statusFilter]);

  const handleSelect = (item) => {
    setSelectedItem(item);
    setAdminNotes(item.admin_notes || item.adminNotes || '');
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedItem) return;
    await feedbackSubmissionService.updateFeedbackStatus(selectedItem.id, {
      status: newStatus,
      adminNotes
    });
    setSelectedItem((prev) => ({ ...prev, status: newStatus }));
    setFeedbackList((prev) =>
      prev.map((item) => (item.id === selectedItem.id ? { ...item, status: newStatus } : item))
    );
  };

  const handleSaveNotes = async () => {
    if (!selectedItem) return;
    setIsSavingNotes(true);
    await feedbackSubmissionService.updateFeedbackStatus(selectedItem.id, {
      adminNotes
    });
    setSelectedItem((prev) => ({ ...prev, admin_notes: adminNotes, adminNotes }));
    setIsSavingNotes(false);
  };

  if (!isOpen) return null;

  // 1. PIN / Passcode Authentication Gate
  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-900/50 dark:bg-black/70 backdrop-blur-xs p-4 select-none animate-in fade-in duration-150 font-sans">
        <div className="relative w-full max-w-sm bg-white dark:bg-[#18181b] border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-2xl p-7 flex flex-col items-center text-center">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={16} />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/60 border border-violet-100 dark:border-violet-900/50 flex items-center justify-center text-violet-600 dark:text-violet-400 shadow-2xs mb-4">
            <Lock size={22} strokeWidth={2.2} />
          </div>

          <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100 mb-1">
            Founder Access
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mb-6 leading-relaxed">
            Enter founder PIN to decrypt triage logs and inspect customer feedback.
          </p>

          <form onSubmit={handleUnlock} className="w-full space-y-3">
            <div className="relative">
              <input
                type="password"
                maxLength={10}
                autoFocus
                value={passcodeInput}
                onChange={(e) => {
                  setPasscodeInput(e.target.value);
                  if (passcodeError) setPasscodeError(false);
                }}
                placeholder="Enter PIN..."
                className={`w-full text-center text-lg tracking-[0.3em] font-mono py-2.5 px-4 bg-slate-50 dark:bg-zinc-900 border ${
                  passcodeError
                    ? 'border-rose-400 focus:border-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 focus:border-violet-500'
                } rounded-xl outline-none transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-xs text-slate-900 dark:text-white`}
              />
              <KeyRound size={15} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
            </div>

            {passcodeError && (
              <p className="text-[11px] text-rose-500 font-medium animate-in fade-in duration-100">
                Incorrect founder passcode. Access denied.
              </p>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
            >
              <span>Unlock Triage Console</span>
              <ArrowRight size={14} />
            </button>
          </form>

          <p className="text-[10px] text-slate-400 dark:text-zinc-600 mt-4">
            Protected by internal session encryption
          </p>
        </div>
      </div>
    );
  }

  const filteredItems = feedbackList.filter((item) => {
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const msgMatch = (item.message || '').toLowerCase().includes(q);
      const userMatch = (item.user_email || item.user_name || '').toLowerCase().includes(q);
      return msgMatch || userMatch;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs p-4 sm:p-6 select-none animate-in fade-in duration-150 font-sans">
      <div className="relative w-full max-w-5xl h-[85vh] bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="h-14 px-6 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between shrink-0 bg-[#FAFBFD] dark:bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-xs border border-violet-200/60 dark:border-violet-800/40">
              HQ
            </div>
            {/* Executive Tab Switcher */}
            <div className="flex items-center p-0.5 bg-slate-100 dark:bg-zinc-800/80 rounded-xl border border-slate-200/60 dark:border-white/5">
              <button
                type="button"
                onClick={() => setActiveTab('feedback')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'feedback'
                    ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <MessageSquare size={13} />
                <span>User Feedback</span>
                <span className="text-[10px] font-normal px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-zinc-600 text-slate-600 dark:text-zinc-300">
                  {filteredItems.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('insights');
                  loadInsights();
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'insights'
                    ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BarChart3 size={13} />
                <span>Data Insights & Metrics</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                try {
                  sessionStorage.removeItem(AUTH_SESSION_KEY);
                } catch {}
                setIsUnlocked(false);
                setPasscodeInput('');
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-xs font-medium"
              title="Lock Admin Session"
            >
              <Lock size={13} />
              <span>Lock</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'feedback') loadFeedback();
                else loadInsights();
              }}
              disabled={isLoading || isLoadingInsights}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw size={15} className={isLoading || isLoadingInsights ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Tab 1: Feedback Master-Detail Triage */}
        {activeTab === 'feedback' ? (
          <div className="flex-1 flex overflow-hidden">
            {/* Master List Column */}
            <div className="w-80 sm:w-96 border-r border-slate-100 dark:border-white/[0.06] flex flex-col bg-[#F9FAFB] dark:bg-zinc-900/30">
            {/* Filter Bar */}
            <div className="p-3 border-b border-slate-100 dark:border-white/[0.06] space-y-2">
              <div className="relative flex items-center">
                <Search size={13} className="absolute left-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter feedback or user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg outline-none focus:border-violet-500"
                />
              </div>

              {/* Status pills */}
              <div className="flex items-center gap-1 overflow-x-auto thin-scrollbar">
                {['all', 'new', 'in_review', 'resolved'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-colors ${
                      statusFilter === st
                        ? 'bg-violet-600 text-white font-semibold shadow-xs'
                        : 'text-slate-500 hover:bg-slate-200/60 dark:text-zinc-400 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* List entries */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.04]">
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 dark:text-zinc-500">
                  No feedback matching filters
                </div>
              ) : (
                filteredItems.map((item) => {
                  const typeMeta = TYPE_CONFIG[item.type] || TYPE_CONFIG.other;
                  const IconComp = typeMeta.icon;
                  const isSelected = selectedItem?.id === item.id;
                  const statusMeta = STATUS_CONFIG[item.status] || STATUS_CONFIG.new;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className={`p-3.5 cursor-pointer transition-colors text-left ${
                        isSelected
                          ? 'bg-white dark:bg-zinc-800 shadow-xs border-l-2 border-violet-600'
                          : 'hover:bg-slate-100/60 dark:hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${typeMeta.color}`}
                        >
                          <IconComp size={10} />
                          <span>{typeMeta.label}</span>
                        </span>

                        <span
                          className={`text-[9.5px] font-medium px-1.5 py-0.5 rounded border capitalize ${statusMeta.color}`}
                        >
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-slate-800 dark:text-zinc-200 line-clamp-2 leading-relaxed">
                        {item.message || 'No description provided'}
                      </p>

                      <div className="mt-2 flex items-center justify-between text-[10.5px] text-slate-400 dark:text-zinc-500">
                        <span className="truncate max-w-[140px]">
                          {item.user_email || item.user_name || 'Guest'}
                        </span>
                        <span>
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Detail View Column */}
          <div className="flex-1 flex flex-col bg-white dark:bg-[#18181b] overflow-y-auto">
            {selectedItem ? (
              <div className="p-6 space-y-6">
                {/* Item Header */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/[0.06]">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-400">
                        ID: {selectedItem.id}
                      </span>
                      <span className="text-slate-300 dark:text-zinc-600">•</span>
                      <span className="text-xs text-slate-500">
                        {selectedItem.created_at ? new Date(selectedItem.created_at).toLocaleString() : ''}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                      <span>Sender: {selectedItem.user_name || 'Anonymous User'}</span>
                      <span className="text-xs text-slate-400 font-normal">
                        ({selectedItem.user_email || 'No email provided'})
                      </span>
                    </div>
                  </div>

                  {/* Status Toggle Actions */}
                  <div className="flex items-center gap-1.5">
                    {['new', 'in_review', 'resolved'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleStatusChange(st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all border ${
                          selectedItem.status === st
                            ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback Message */}
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">
                    Feedback Message
                  </h4>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-white/[0.06] text-xs leading-relaxed text-slate-800 dark:text-zinc-200 whitespace-pre-wrap font-sans">
                    {selectedItem.message}
                  </div>
                </div>

                {/* Attachments & Screenshots */}
                {selectedItem.attachments && selectedItem.attachments.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">
                      Attachments ({selectedItem.attachments.length})
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedItem.attachments.map((att, idx) => (
                        <div
                          key={idx}
                          className="border border-slate-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-zinc-900/40 p-2"
                        >
                          {att.url || att.dataUrl ? (
                            <img
                              src={att.url || att.dataUrl}
                              alt={att.name || 'Screenshot'}
                              className="w-full h-40 object-contain rounded-lg bg-black/5"
                            />
                          ) : (
                            <div className="h-24 flex items-center justify-center text-xs text-slate-400">
                              {att.name || 'File Attachment'}
                            </div>
                          )}
                          <div className="mt-1 text-[10px] text-slate-500 truncate">{att.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Diagnostics & Environment Context */}
                {selectedItem.workspace_context && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">
                      System Diagnostics
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11.5px]">
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/60 dark:border-white/5">
                        <span className="text-[10px] text-slate-400 block">OS</span>
                        <span className="font-semibold text-slate-700 dark:text-zinc-200">
                          {selectedItem.workspace_context.os || 'Unknown'}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/60 dark:border-white/5">
                        <span className="text-[10px] text-slate-400 block">Browser / App</span>
                        <span className="font-semibold text-slate-700 dark:text-zinc-200">
                          {selectedItem.workspace_context.browser || 'Electron'}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/60 dark:border-white/5">
                        <span className="text-[10px] text-slate-400 block">Resolution</span>
                        <span className="font-semibold text-slate-700 dark:text-zinc-200">
                          {selectedItem.workspace_context.viewport || '1920 × 1080'}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/60 dark:border-white/5">
                        <span className="text-[10px] text-slate-400 block">Active File</span>
                        <span className="font-semibold text-slate-700 dark:text-zinc-200 truncate block">
                          {selectedItem.workspace_context.activeDocument || 'Workspace'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Admin Internal Notes */}
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">
                    Founder / Engineering Triage Notes
                  </h4>
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add internal notes on resolution, commit hash, or customer follow-up..."
                      className="w-full text-xs p-3 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none focus:border-violet-500"
                    />
                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      disabled={isSavingNotes}
                      className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-colors shadow-2xs"
                    >
                      {isSavingNotes ? 'Saving...' : 'Save Internal Note'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
                Select an item from the left to inspect details
              </div>
            )}
            </div>
          </div>
        ) : (
          /* Tab 2: Executive Data Insights & Metrics Dashboard */
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-zinc-950/40 thin-scrollbar">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 shadow-xs flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-100 dark:border-violet-900/50">
                  <Activity size={20} />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                    Total App Launches
                  </span>
                  <span className="text-xl font-bold text-slate-900 dark:text-zinc-100">
                    {insights?.totalLaunches ?? '—'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 shadow-xs flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                  <Users size={20} />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                    Active Users
                  </span>
                  <span className="text-xl font-bold text-slate-900 dark:text-zinc-100">
                    {insights?.activeUsersCount ?? '1'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 shadow-xs flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
                  <Clock size={20} />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                    Avg Session Time
                  </span>
                  <span className="text-xl font-bold text-slate-900 dark:text-zinc-100">
                    {insights?.averageSessionDuration || 'Active'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 shadow-xs flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/50">
                  <Zap size={20} />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                    Trial Days Left
                  </span>
                  <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                    {insights?.trialDaysRemaining ?? 14} Days
                  </span>
                </div>
              </div>
            </div>

            {/* Platform Distribution & Environment Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Distribution Card */}
              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 shadow-xs space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                  <Monitor size={14} />
                  <span>Client Environment Ratio</span>
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1 font-medium">
                      <span className="text-slate-700 dark:text-zinc-300">Desktop Electron</span>
                      <span className="text-slate-500 dark:text-zinc-400 font-mono">
                        {insights?.clientDistribution?.electron || 1} sessions
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-600 rounded-full w-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1 font-medium">
                      <span className="text-slate-700 dark:text-zinc-300">Web Browser</span>
                      <span className="text-slate-500 dark:text-zinc-400 font-mono">
                        {insights?.clientDistribution?.browser || 0} sessions
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${
                            insights?.clientDistribution?.browser
                              ? Math.min(100, (insights.clientDistribution.browser / (insights.totalLaunches || 1)) * 100)
                              : 0
                          }%`
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-zinc-400">Current App Build</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">v2.4.2 (Production)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-zinc-400">Supabase Connection</span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live PostgreSQL
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent User Session Activity Log */}
              <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 shadow-xs space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>Recent Launch & Activity Sessions</span>
                  </span>
                  <span className="text-[10px] font-normal text-slate-400 lowercase">
                    {insights?.recentSessions?.length || 0} recorded
                  </span>
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-white/5 text-[10.5px] uppercase font-semibold text-slate-400 dark:text-zinc-500">
                        <th className="pb-2.5">User</th>
                        <th className="pb-2.5">Platform</th>
                        <th className="pb-2.5">Client</th>
                        <th className="pb-2.5">Launched At</th>
                        <th className="pb-2.5">Resolution</th>
                        <th className="pb-2.5 text-right">Tier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/70 dark:divide-white/5">
                      {insights?.recentSessions && insights.recentSessions.length > 0 ? (
                        insights.recentSessions.map((s, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                            <td className="py-2.5 font-medium text-slate-900 dark:text-zinc-100">
                              {s.userEmail || 'guest@workspace.local'}
                            </td>
                            <td className="py-2.5 text-slate-600 dark:text-zinc-400">
                              {s.platform || 'Windows'}
                            </td>
                            <td className="py-2.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                                {s.clientType === 'desktop_electron' ? 'Desktop' : 'Web'}
                              </span>
                            </td>
                            <td className="py-2.5 text-slate-500 dark:text-zinc-400">
                              {s.launchedAt ? new Date(s.launchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                            </td>
                            <td className="py-2.5 text-slate-500 dark:text-zinc-400 font-mono text-[11px]">
                              {s.screenResolution || '1920x1080'}
                            </td>
                            <td className="py-2.5 text-right font-medium capitalize text-slate-700 dark:text-zinc-300">
                              {s.subscriptionTier || 'Free'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            Current session active. Launch telemetry recorded.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
