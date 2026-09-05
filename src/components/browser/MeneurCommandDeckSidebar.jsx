import React, { useState } from 'react';
import {
  Shield, Clock, Bookmark, ListTodo, Plus, Trash2,
  ExternalLink, Check, X, Sparkles, Layers, ShieldAlert,
  ShieldCheck, ArrowRight, Zap
} from 'lucide-react';
import {
  isFocusModeActive,
  toggleFocusMode,
  setFocusModeRule,
  getActiveBlockRules,
  captureWebDirective,
  archiveTabSession,
  listTabArchives,
  restoreTabSession,
  deleteTabArchive
} from '../../services/meneurCommandDeckService.js';
import { DIRECTIVE_PRIORITY } from '../../services/directiveQueueEngine.js';

export default function MeneurCommandDeckSidebar({
  isOpen = false,
  onClose = () => {},
  currentUrl = '',
  activeTabs = [],
  onRestoreTabs = () => {},
  onShowToast = () => {}
}) {
  const [activeTab, setActiveTab] = useState('timetable'); // 'timetable' | 'focus' | 'capture' | 'archives'
  const [focusActive, setFocusActive] = useState(isFocusModeActive());
  const [blockRules, setBlockRules] = useState(getActiveBlockRules());
  const [newDomain, setNewDomain] = useState('');
  
  // Quick capture state
  const [captureText, setCaptureText] = useState('');
  const [capturePriority, setCapturePriority] = useState(DIRECTIVE_PRIORITY.P1);
  const [archiveLabel, setArchiveLabel] = useState('');
  const [archivesList, setArchivesList] = useState(listTabArchives());

  if (!isOpen) return null;

  const handleToggleShield = (e) => {
    if (e?.preventDefault) e.preventDefault();
    const next = toggleFocusMode();
    setFocusActive(next);
    onShowToast(next ? 'Contextual Focus Shield Enabled' : 'Focus Shield Disabled');
  };

  const handleAddDomain = (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!newDomain.trim()) return;
    setFocusModeRule(newDomain.trim(), true);
    setBlockRules(getActiveBlockRules());
    setNewDomain('');
    onShowToast(`Suppressed: ${newDomain.trim()}`);
  };

  const handleRemoveDomain = (e, domain) => {
    if (e?.preventDefault) e.preventDefault();
    setFocusModeRule(domain, false);
    setBlockRules(getActiveBlockRules());
    onShowToast(`Allowed: ${domain}`);
  };

  const handleCreateDirective = (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!captureText.trim()) return;
    captureWebDirective({
      text: captureText.trim(),
      sourceUrl: currentUrl || 'https://regaarder.internal',
      priority: capturePriority
    });
    setCaptureText('');
    onShowToast('Captured web directive into Tasks');
  };

  const handleArchiveCurrentSession = (e) => {
    if (e?.preventDefault) e.preventDefault();
    const created = archiveTabSession(activeTabs, archiveLabel || `Research ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    setArchivesList(listTabArchives());
    setArchiveLabel('');
    onShowToast(`Archived ${created.tabCount} tabs`);
  };

  const handleRestoreArchive = (e, archiveId) => {
    if (e?.preventDefault) e.preventDefault();
    const restored = restoreTabSession(archiveId);
    if (restored && onRestoreTabs) {
      onRestoreTabs(restored.tabs);
    }
    onShowToast(`Restored session "${restored.label}"`);
  };

  const handleDeleteArchive = (e, archiveId) => {
    if (e?.preventDefault) e.preventDefault();
    deleteTabArchive(archiveId);
    setArchivesList(listTabArchives());
    onShowToast('Deleted tab session archive');
  };

  return (
    <aside className="w-80 h-full border-l border-slate-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl flex flex-col shrink-0 shadow-xl z-30 select-none animate-in slide-in-from-right duration-200">
      
      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200/70 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-violet-600 text-white flex items-center justify-center shadow-xs">
            <Zap size={13} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>Meneur Command Deck</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-mono rounded border border-violet-200/60">
                DECK
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Contextual Focus & Execution</p>
          </div>
        </div>

        <button
          type="button"
          onPointerDown={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Close Command Deck"
        >
          <X size={15} />
        </button>
      </div>

      {/* ── NAVIGATION TABS (Strict Rule 3: Slightly rounded rectangles, NO pills) ── */}
      <div className="flex items-center gap-1 p-1 mx-3 mt-3 bg-slate-100 dark:bg-zinc-800/80 rounded-lg border border-slate-200/60 dark:border-zinc-700/60">
        {[
          { id: 'timetable', label: 'Schedule', icon: Clock },
          { id: 'focus', label: 'Shield', icon: Shield },
          { id: 'capture', label: 'Capture', icon: ListTodo },
          { id: 'archives', label: 'Tabs', icon: Bookmark }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onPointerDown={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-zinc-900 text-violet-700 dark:text-violet-300 shadow-xs border border-violet-200/60 dark:border-violet-800/60'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <Icon size={12} />
              <span>{tab.label}</span>
              {isActive && <span className="sr-only">(Active tab outline)</span>}
            </button>
          );
        })}
      </div>

      {/* ── CONTENT BODY ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">

        {/* ── TAB 1: TIMETABLE & FOCUS BLOCKS ── */}
        {activeTab === 'timetable' && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200/70 dark:border-violet-800/60 text-xs">
              <div className="flex items-center justify-between font-bold text-violet-900 dark:text-violet-200">
                <span>Active Time-Block</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  DEEP WORK
                </span>
              </div>
              <p className="text-[11px] text-violet-700 dark:text-violet-300 mt-1 font-medium">
                P0 Executive Architecture & Inference Optimization
              </p>
              <div className="text-[10px] text-slate-400 mt-2 font-mono flex items-center justify-between">
                <span>14:00 – 16:30</span>
                <span>45m remaining</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upcoming Schedule</span>
              {[
                { time: '16:30', title: 'Q3 Financial Matrix Review', tag: 'Sheets' },
                { time: '17:15', title: 'Elena Sync: Procurement Gates', tag: 'Room' },
                { time: '18:00', title: 'Daily Asynchronous Wrap', tag: 'Tasks' }
              ].map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-700/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-400">{item.time}</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200 text-[11px]">{item.title}</span>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300">{item.tag}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 2: CONTEXTUAL FOCUS SHIELD ── */}
        {activeTab === 'focus' && (
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-1.5">
                  {focusActive ? <ShieldCheck size={14} className="text-emerald-500" /> : <ShieldAlert size={14} className="text-amber-500" />}
                  <span>Focus Shield {focusActive ? 'Active' : 'Standby'}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Suppresses feeds during deep-work</p>
              </div>
              <button
                type="button"
                onPointerDown={handleToggleShield}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors border ${
                  focusActive 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-slate-200 text-slate-700 border-slate-300 dark:bg-zinc-700 dark:text-zinc-200'
                }`}
              >
                {focusActive ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suppressed Domains</span>
              <div className="flex gap-1.5 mt-1.5">
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="e.g. reddit.com"
                  className="flex-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-zinc-800 text-[11px] border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 outline-none"
                />
                <button
                  type="button"
                  onPointerDown={handleAddDomain}
                  className="px-2 py-1 rounded-md bg-violet-600 text-white text-[11px] font-bold cursor-pointer hover:bg-violet-700"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {blockRules.map(d => (
                <div key={d} className="flex items-center justify-between p-1.5 rounded-md bg-slate-50 dark:bg-zinc-800/40 text-[11px] border border-slate-100 dark:border-zinc-800">
                  <span className="font-mono text-slate-700 dark:text-zinc-300">{d}</span>
                  <button
                    type="button"
                    onPointerDown={(e) => handleRemoveDomain(e, d)}
                    className="text-slate-400 hover:text-rose-500 cursor-pointer p-0.5"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 3: INSTANT DIRECTIVE CAPTURE ── */}
        {activeTab === 'capture' && (
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Captured Research Text / Hotkey
              </label>
              <textarea
                value={captureText}
                onChange={(e) => setCaptureText(e.target.value)}
                placeholder="Paste or select web text (Shortcut: Cmd/Ctrl+Shift+D)..."
                rows={4}
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs text-slate-800 dark:text-zinc-100 outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-zinc-300">Priority Tier:</span>
              <div className="flex gap-1">
                {['P0', 'P1', 'P2'].map(p => (
                  <button
                    key={p}
                    type="button"
                    onPointerDown={() => setCapturePriority(p)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer border ${
                      capturePriority === p
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onPointerDown={handleCreateDirective}
              className="w-full py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Zap size={13} />
              <span>Queue Directive into Tasks</span>
            </button>
          </div>
        )}

        {/* ── TAB 4: TAB & CONTEXT ARCHIVES ── */}
        {activeTab === 'archives' && (
          <div className="space-y-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Archive Active Session</span>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={archiveLabel}
                  onChange={(e) => setArchiveLabel(e.target.value)}
                  placeholder="e.g. Semiconductor Research"
                  className="flex-1 px-2 py-1 rounded-md bg-white dark:bg-zinc-800 text-[11px] border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 outline-none"
                />
                <button
                  type="button"
                  onPointerDown={handleArchiveCurrentSession}
                  className="px-2.5 py-1 rounded-md bg-violet-600 text-white font-bold text-[11px] cursor-pointer hover:bg-violet-700 shrink-0"
                >
                  Save
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Saved Sessions</span>
              {archivesList.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">No saved tab sessions yet.</p>
              ) : (
                archivesList.map(arch => (
                  <div key={arch.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/70 dark:border-zinc-700/70 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-zinc-200 text-[11px]">{arch.label}</div>
                      <div className="text-[10px] text-slate-400">{arch.tabCount} tabs saved</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onPointerDown={(e) => handleRestoreArchive(e, arch.id)}
                        className="px-2 py-1 rounded-md bg-slate-200 dark:bg-zinc-700 hover:bg-violet-100 text-[10px] font-bold text-slate-700 dark:text-zinc-200 cursor-pointer"
                      >
                        Restore
                      </button>
                      <button
                        type="button"
                        onPointerDown={(e) => handleDeleteArchive(e, arch.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </aside>
  );
}
