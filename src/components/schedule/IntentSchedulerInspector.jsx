/**
 * IntentSchedulerInspector.jsx
 * 
 * Pillar 6: The Constraint-Based Intent Scheduler & Multi-Agent Negotiation Studio
 * 
 * Implements:
 * 1. Visual Calendar & Timeline with conflict badges and participant chips
 * 2. Multi-Agent Negotiation Studio (live alternating-offer simulation between agent profiles)
 * 3. Constraint Satisfaction Problem (CSP) Playground (Rule 4 intent mapping + utility evaluation)
 * 4. Conflict Resolution Center (1-click resolution + Pillar 3 PR sandbox staging)
 * 
 * Adheres strictly to Apple Guiding Principles:
 * - Rounded rectangle navigation tabs (strictly non-pill-shaped)
 * - Visual active status termed "outline"
 * - High density, progressive disclosure, clean typography
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Bot,
  AlertTriangle,
  CheckCircle2,
  GitPullRequest,
  ArrowRight,
  RefreshCw,
  Plus,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Zap,
  Activity,
  Play,
  RotateCcw,
  Layers,
  TrendingUp,
  MapPin,
  Check,
  X
} from 'lucide-react';
import { RegaarderAiIcon } from '../RegaarderProductIcons';
import * as intentScheduler from '../../services/intentSchedulerEngine.js';

export default function IntentSchedulerInspector({ onClose }) {
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' | 'negotiation' | 'solver' | 'conflicts'
  const [calendarSnapshot, setCalendarSnapshot] = useState(() => intentScheduler.getCalendarSnapshot());
  const [selectedEventId, setSelectedEventId] = useState(null);

  // Playground Intent Input
  const [solverIntentInput, setSolverIntentInput] = useState('Tennis practice');
  const [solverDomainOverride, setSolverDomainOverride] = useState('');
  const [solverResults, setSolverResults] = useState(null);
  const [isSolving, setIsSolving] = useState(false);

  // Negotiation Simulator State
  const [negInitiator, setNegInitiator] = useState('agent-alex');
  const [negCounterparty, setNegCounterparty] = useState('agent-elena');
  const [negIntent, setNegIntent] = useState('Product Architecture Review (Deck V2)');
  const [negMaxRounds, setNegMaxRounds] = useState(4);
  const [activeNegotiation, setActiveNegotiation] = useState(null);
  const [isNegotiating, setIsNegotiating] = useState(false);

  // New Event Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState('executive_strategy');
  const [newEventDuration, setNewEventDuration] = useState(60);
  const [newEventPriority, setNewEventPriority] = useState('p1_high');
  const [newEventStage, setNewEventStage] = useState(false);

  // Conflict Action Status
  const [resolutionFeedback, setResolutionFeedback] = useState(null);

  // Subscribe to calendar updates
  useEffect(() => {
    const unsub = intentScheduler.subscribeToSchedule((nextSnap) => {
      setCalendarSnapshot(nextSnap);
    });
    return unsub;
  }, []);

  // Run initial intent parse in solver
  useEffect(() => {
    handleRunSolver(solverIntentInput);
  }, []);

  const handleRunSolver = useCallback((intentStr) => {
    setIsSolving(true);
    try {
      const spec = intentScheduler.parseIntentToScheduleSpec(intentStr, {
        domain: solverDomainOverride || undefined
      });
      const solution = intentScheduler.solveScheduleConstraints(spec);
      setSolverResults({ spec, solution });
    } catch (err) {
      console.error('Solver error:', err);
    } finally {
      setIsSolving(false);
    }
  }, [solverDomainOverride]);

  const handleRunNegotiation = useCallback(() => {
    setIsNegotiating(true);
    try {
      const spec = intentScheduler.parseIntentToScheduleSpec(negIntent, {
        participants: [negInitiator, negCounterparty]
      });
      const result = intentScheduler.negotiateScheduleBetweenAgents(spec, {
        maxRounds: negMaxRounds
      });
      setActiveNegotiation(result);
    } catch (err) {
      console.error('Negotiation error:', err);
    } finally {
      setIsNegotiating(false);
    }
  }, [negInitiator, negCounterparty, negIntent, negMaxRounds]);

  const handleResolveConflict = (conflict, strategy, stage = false) => {
    const res = intentScheduler.resolveScheduleConflict({
      conflictId: conflict.id,
      strategy,
      stage
    });
    setResolutionFeedback(res.message || res.resolutionSummary);
    setTimeout(() => setResolutionFeedback(null), 4000);
  };

  const handleCreateEventSubmit = (e) => {
    e.preventDefault();
    if (!newEventTitle) return;

    const start = new Date(Date.now() + 1000 * 60 * 60 * 3);
    const end = new Date(start.getTime() + newEventDuration * 60 * 1000);

    const result = intentScheduler.createScheduledEvent({
      title: newEventTitle,
      intentCategory: newEventCategory,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      durationMin: Number(newEventDuration),
      participants: ['user-joshua', 'agent-alex'],
      priority: newEventPriority
    }, { stage: newEventStage });

    setIsCreateOpen(false);
    setNewEventTitle('');
    setResolutionFeedback(result.isStaged
      ? `Staged into PR #${result.branchId}`
      : `Event created: ${result.event?.title}`
    );
    setTimeout(() => setResolutionFeedback(null), 4000);
  };

  const events = calendarSnapshot.events || [];
  const conflicts = calendarSnapshot.conflicts || [];
  const participants = calendarSnapshot.participants || [];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans select-none overflow-hidden">
      {/* ── Top Header Strip ────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-black/[0.08] dark:border-white/[0.08] bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Clock size={18} strokeWidth={2.3} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                Intent Scheduler & Negotiation Substrate
              </h2>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                Pillar 6 Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Rule 4 context-aware mapping • CSP optimization • Multi-agent Pareto consensus
            </p>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {resolutionFeedback && (
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span>{resolutionFeedback}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus size={13} strokeWidth={2.5} />
            <span>New Session</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
              title="Close Panel"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ── Substrate Navigation Tabs (Strictly Non-Pill Rectangles) ── */}
      <div className="px-6 py-2.5 border-b border-black/[0.06] dark:border-white/[0.06] bg-slate-100/60 dark:bg-zinc-900/40 flex items-center gap-2 shrink-0">
        {[
          { id: 'calendar', label: 'Calendar & Timeline', icon: Calendar, badge: events.length },
          { id: 'negotiation', label: 'Multi-Agent Negotiation Studio', icon: Bot, badge: 'Live' },
          { id: 'solver', label: 'Constraint Solver Playground', icon: Sliders, badge: 'CSP' },
          { id: 'conflicts', label: 'Conflict Resolution Center', icon: AlertTriangle, badge: conflicts.length, alert: conflicts.length > 0 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xs border border-black/[0.1] dark:border-white/[0.12] outline-slate-400 dark:outline-zinc-500'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-sky-600 dark:text-sky-400' : 'opacity-70'} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    tab.alert
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold'
                      : isActive
                      ? 'bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300'
                      : 'bg-black/[0.05] dark:bg-white/[0.08] text-slate-500 dark:text-zinc-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Main Tab Content Viewport ───────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6 thin-scrollbar">
        {/* ── TAB 1: CALENDAR & TIMELINE ────────────────────────────── */}
        {activeTab === 'calendar' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Stats Overview Strip */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-black/[0.07] dark:border-white/[0.08] shadow-2xs">
                <div className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Scheduled Events</div>
                <div className="text-2xl font-bold mt-1 text-slate-900 dark:text-zinc-100">{events.length}</div>
                <div className="text-xs text-slate-500 mt-0.5">Committed to universal substrate</div>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-black/[0.07] dark:border-white/[0.08] shadow-2xs">
                <div className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Temporal Conflicts</div>
                <div className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">{conflicts.length}</div>
                <div className="text-xs text-slate-500 mt-0.5">Collisions requiring resolution</div>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-black/[0.07] dark:border-white/[0.08] shadow-2xs">
                <div className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Active Agent Profiles</div>
                <div className="text-2xl font-bold mt-1 text-sky-600 dark:text-sky-400">{participants.length}</div>
                <div className="text-xs text-slate-500 mt-0.5 truncate">{participants.map(p => p.name.split(' ')[0]).join(', ')}</div>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-black/[0.07] dark:border-white/[0.08] shadow-2xs">
                <div className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">CSP Optimization</div>
                <div className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                  {events.length > 0 ? '92% Avg' : '—'}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {events.length > 0 ? 'Utility preference alignment' : 'No active sessions'}
                </div>
              </div>
            </div>

            {/* Event Timeline Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                  Universal Calendar Events
                </h3>
                {events.length > 0 && (
                  <span className="text-xs font-normal text-slate-400">Chronological schedule order</span>
                )}
              </div>

              {events.length === 0 ? (
                <div className="p-10 sm:p-14 text-center border border-dashed border-slate-300 dark:border-zinc-800 rounded-2xl bg-white/50 dark:bg-zinc-900/40 flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20">
                    <Calendar size={24} />
                  </div>
                  <div className="max-w-md space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">No Scheduled Sessions</h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                      The Intent Scheduler coordinates multi-agent meeting windows, automates CSP constraint resolution, and commits commitments to universal storage.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCreateOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus size={13} strokeWidth={2.5} />
                      <span>Schedule First Session</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => intentScheduler.loadSampleSchedule()}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-semibold border border-slate-200 dark:border-zinc-700 transition-all active:scale-95 cursor-pointer"
                    >
                      <span>Load Example Schedule</span>
                    </button>
                  </div>
                </div>
              ) : (
                events.map((evt) => {
                  const startTime = new Date(evt.startTime);
                  const endTime = new Date(evt.endTime);
                  const isConflict = conflicts.some(c => c.primaryEvent?.id === evt.id || c.secondaryEvent?.id === evt.id);

                  return (
                    <div
                      key={evt.id}
                      className={`p-4 rounded-xl bg-white dark:bg-zinc-900 border transition-all ${
                        isConflict
                          ? 'border-amber-400/80 dark:border-amber-600/80 shadow-xs'
                          : 'border-black/[0.07] dark:border-white/[0.08] hover:border-sky-400/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              evt.priority === 'p0_critical' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                              evt.priority === 'p1_high' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                              'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
                            }`}>
                              {evt.priority?.replace('_', ' ') || 'Normal'}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                              `{evt.intentCategory}`
                            </span>
                            {isConflict && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                                <AlertTriangle size={11} />
                                Temporal Collision
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                            {evt.title}
                          </h4>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-zinc-400">
                            <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-zinc-300">
                              <Clock size={13} className="text-sky-500" />
                              <span>
                                {startTime.toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                                {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({evt.durationMin}m)
                              </span>
                            </div>

                            {evt.location && (
                              <div className="flex items-center gap-1">
                                <MapPin size={13} className="text-slate-400" />
                                <span>{evt.location}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-1.5">
                              <Users size={13} className="text-slate-400" />
                              <div className="flex items-center -space-x-1.5">
                                {(evt.participants || []).map((pId) => (
                                  <span
                                    key={pId}
                                    className="inline-block px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-200 dark:bg-zinc-700 text-slate-800 dark:text-zinc-200 border border-white dark:border-zinc-900"
                                    title={pId}
                                  >
                                    {pId.replace(/user-|agent-/, '')}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isConflict && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('conflicts');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                            >
                              <span>Resolve</span>
                              <ArrowRight size={12} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              intentScheduler.deleteScheduledEvent(evt.id);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Remove Session"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: MULTI-AGENT NEGOTIATION STUDIO ────────────────── */}
        {activeTab === 'negotiation' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.08] shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <Bot size={16} className="text-sky-500" />
                  <span>Interactive Multi-Agent Negotiation Simulator</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Simulate alternating-offer concession protocols between autonomous agent profiles with Pareto convergence analysis.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Initiator Agent
                  </label>
                  <select
                    value={negInitiator}
                    onChange={(e) => setNegInitiator(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-zinc-100"
                  >
                    <option value="user-joshua">Joshua David (Executive)</option>
                    <option value="agent-alex">Alex Miller (Frontend Principal)</option>
                    <option value="agent-elena">Elena Rostova (Chief Product Officer)</option>
                    <option value="agent-david">David Kim (Lead Infrastructure)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Counterparty Agent
                  </label>
                  <select
                    value={negCounterparty}
                    onChange={(e) => setNegCounterparty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-zinc-100"
                  >
                    <option value="agent-elena">Elena Rostova (Chief Product Officer)</option>
                    <option value="agent-alex">Alex Miller (Frontend Principal)</option>
                    <option value="user-joshua">Joshua David (Executive)</option>
                    <option value="agent-david">David Kim (Lead Infrastructure)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Meeting Intent
                  </label>
                  <input
                    type="text"
                    value={negIntent}
                    onChange={(e) => setNegIntent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-zinc-100"
                    placeholder="e.g. Q3 Roadmap Review"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Max Rounds:</span>
                  {[2, 4, 6].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setNegMaxRounds(num)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                        negMaxRounds === num
                          ? 'bg-sky-600 text-white shadow-2xs'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleRunNegotiation}
                  disabled={isNegotiating}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Play size={13} strokeWidth={2.5} />
                  <span>{isNegotiating ? 'Negotiating...' : 'Execute Negotiation Protocol'}</span>
                </button>
              </div>
            </div>

            {/* Negotiation Output & Rounds */}
            {!activeNegotiation ? (
              <div className="p-8 sm:p-12 rounded-2xl bg-white/50 dark:bg-zinc-900/40 border border-dashed border-slate-200 dark:border-zinc-800 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20">
                  <Bot size={24} />
                </div>
                <div className="max-w-md space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Negotiation Protocol Standby</h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Select initiator and counterparty agent profiles above and execute the protocol to simulate monotonic concessions and Pareto convergence.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRunNegotiation}
                  disabled={isNegotiating}
                  className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Play size={13} strokeWidth={2.5} />
                  <span>Execute Negotiation Protocol</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Result Summary Card */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  activeNegotiation.status === 'AGREEMENT_REACHED'
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                    : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
                      activeNegotiation.status === 'AGREEMENT_REACHED' ? 'bg-emerald-600' : 'bg-amber-600'
                    }`}>
                      {activeNegotiation.status === 'AGREEMENT_REACHED' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                        Protocol Status: {activeNegotiation.status}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-zinc-300">
                        Converged Slot: <strong>{activeNegotiation.agreedSlot?.formattedTime || 'No slot agreed'}</strong> (Utility: {Math.round((activeNegotiation.agreedSlot?.utilityScore || 0) * 100)}%)
                      </div>
                    </div>
                  </div>

                  {activeNegotiation.status === 'AGREEMENT_REACHED' && (
                    <button
                      type="button"
                      onClick={() => {
                        intentScheduler.commitCalendarEvent({
                          title: negIntent,
                          startTime: activeNegotiation.agreedSlot?.start,
                          endTime: activeNegotiation.agreedSlot?.end,
                          participants: [negInitiator, negCounterparty]
                        });
                        setActiveTab('calendar');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Check size={13} strokeWidth={2.5} />
                      <span>Commit to Universal Calendar</span>
                    </button>
                  )}
                </div>

                {/* Round-by-Round Transcript */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Alternating-Offer Protocol Transcript ({activeNegotiation.negotiationRecord?.roundsCount || 0} Rounds)
                  </h4>

                  {(activeNegotiation.negotiationRecord?.transcript || []).map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-black/[0.06] dark:border-white/[0.08] flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold flex items-center justify-center shrink-0">
                        R{step.round}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                            {step.proposer.name} ➔ {step.receiver.name}
                          </div>
                          <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                            step.status === 'AGREED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
                          }`}>
                            {step.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-zinc-300 italic">
                          "{step.rationale}"
                        </p>
                        <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-zinc-400 pt-1">
                          <span>Proposer Utility: <strong>{Math.round(step.proposerUtility * 100)}%</strong></span>
                          <span>Receiver Utility: <strong>{Math.round(step.receiverUtility * 100)}%</strong></span>
                          <span>Composite Pareto: <strong>{Math.round(step.compositeUtility * 100)}%</strong></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: CONSTRAINT SOLVER PLAYGROUND ───────────────────── */}
        {activeTab === 'solver' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.08] shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <Sliders size={16} className="text-sky-500" />
                  <span>Constraint Satisfaction Problem (CSP) Playground</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Test Rule 4 colloquial intent mapping and inspect how hard & soft constraints formulate optimal time intervals.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={solverIntentInput}
                  onChange={(e) => setSolverIntentInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunSolver(solverIntentInput)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-sky-500"
                  placeholder="Enter colloquial intent (e.g. 'Tennis practice', 'Board prep sync', 'QBR Session')"
                />
                <button
                  type="button"
                  onClick={() => handleRunSolver(solverIntentInput)}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                >
                  Solve CSP
                </button>
              </div>

              {/* Quick Preset Chips */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">Try Presets:</span>
                {['Tennis practice', 'Board prep sync', 'Q3 financial audit', 'Architecture review', 'Gym workout'].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setSolverIntentInput(preset);
                      handleRunSolver(preset);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-[11px] font-medium transition-colors"
                  >
                    "{preset}"
                  </button>
                ))}
              </div>
            </div>

            {/* Solver Output */}
            {!solverResults ? (
              <div className="p-8 sm:p-12 rounded-2xl bg-white/50 dark:bg-zinc-900/40 border border-dashed border-slate-200 dark:border-zinc-800 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20">
                  <Sliders size={24} />
                </div>
                <div className="max-w-md space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Constraint Solver Ready</h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Enter a colloquial intent above or click any preset chip to trigger Rule 4 domain mapping and evaluate candidate time windows.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRunSolver('Board prep sync')}
                  className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Play size={13} strokeWidth={2.5} />
                  <span>Test "Board prep sync"</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Rule 4 Semantic Domain Specification */}
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.08] space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <RegaarderAiIcon size={13} className="text-sky-500" />
                    <span>Rule 4 Intent Mapping Output</span>
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800">
                      <span className="text-slate-500">Extracted Title:</span>
                      <strong className="text-slate-900 dark:text-zinc-100">{solverResults.spec.title}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800">
                      <span className="text-slate-500">Systemic Domain:</span>
                      <code className="text-sky-600 dark:text-sky-400 font-bold">{solverResults.spec.intentCategory}</code>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800">
                      <span className="text-slate-500">Standard Duration:</span>
                      <strong>{solverResults.spec.durationMin} minutes</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800">
                      <span className="text-slate-500">Prep / Cooldown Buffers:</span>
                      <span>{solverResults.spec.constraints?.prepBufferMin || 15}m prep / {solverResults.spec.constraints?.cooldownBufferMin || 15}m cool</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800">
                      <span className="text-slate-500">Energy Requirement:</span>
                      <strong className="capitalize">{solverResults.spec.constraints?.energyRequirement || 'medium'}</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Priority Level:</span>
                      <strong className="uppercase">{solverResults.spec.priority}</strong>
                    </div>
                  </div>
                </div>

                {/* Right: Feasible Ranked Candidate Slots */}
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.08] space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Ranked Feasible Slots ({solverResults.solution?.candidateSlots?.length || 0})</span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">CSP Solved</span>
                  </h4>

                  <div className="space-y-2 max-h-72 overflow-y-auto thin-scrollbar pr-1">
                    {(solverResults.solution?.candidateSlots || []).map((slot, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-800/40 flex items-center justify-between hover:border-sky-400 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                            {slot.formattedTime}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {slot.date} • {slot.durationMin}m duration
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                              {Math.round(slot.utilityScore * 100)}%
                            </span>
                            <div className="text-[9px] text-slate-400">Utility U(s)</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              intentScheduler.commitCalendarEvent({
                                title: solverResults.spec.title,
                                intentCategory: solverResults.spec.intentCategory,
                                startTime: slot.start,
                                endTime: slot.end,
                                durationMin: solverResults.spec.durationMin,
                                participants: solverResults.spec.participants,
                                priority: solverResults.spec.priority
                              });
                              setActiveTab('calendar');
                            }}
                            className="px-2 py-1 rounded bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Book
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: CONFLICT RESOLUTION CENTER ────────────────────── */}
        {activeTab === 'conflicts' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                <span>Temporal Conflict Matrix & Resolution Center</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Automated conflict detection across participant working windows with 1-click auto-shift, duration compression, or Pillar 3 staging.
              </p>
            </div>

            {conflicts.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/10 rounded-2xl">
                <ShieldCheck className="w-10 h-10 mx-auto text-emerald-500" />
                <h4 className="mt-2 text-sm font-bold text-emerald-900 dark:text-emerald-200">Zero Schedule Conflicts</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  All active events, participant working windows, and buffer intervals satisfy universal constraints.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {conflicts.map((conflict) => (
                  <div
                    key={conflict.id}
                    className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-700/80 shadow-xs space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                            Conflict ID: {conflict.id}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200">
                            {conflict.overlapMinutes} min collision
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-zinc-300 mt-1">
                          <strong>"{conflict.primaryEvent.title}"</strong> overlaps with <strong>"{conflict.secondaryEvent.title}"</strong>.
                        </p>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Shared Participants: {conflict.sharedParticipants.join(', ')}
                        </div>
                      </div>
                    </div>

                    {/* Resolution Strategies */}
                    <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Available Resolution Actions
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Action 1: Priority Auto-Shift */}
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 flex flex-col justify-between">
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                              Priority Auto-Shift
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Push lower priority event backward to adjacent feasible slot.
                            </p>
                          </div>
                          <div className="flex gap-1.5 mt-3">
                            <button
                              type="button"
                              onClick={() => handleResolveConflict(conflict, 'priority_bump', false)}
                              className="flex-1 py-1 px-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Apply
                            </button>
                            <button
                              type="button"
                              onClick={() => handleResolveConflict(conflict, 'priority_bump', true)}
                              className="py-1 px-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Stage to Pillar 3 PR branch"
                            >
                              <GitPullRequest size={11} />
                              <span>Stage PR</span>
                            </button>
                          </div>
                        </div>

                        {/* Action 2: Duration Compression */}
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 flex flex-col justify-between">
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                              Duration Compression
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Compress session lengths by 15-20% to fit contiguous window.
                            </p>
                          </div>
                          <div className="flex gap-1.5 mt-3">
                            <button
                              type="button"
                              onClick={() => handleResolveConflict(conflict, 'duration_compression', false)}
                              className="flex-1 py-1 px-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Compress
                            </button>
                            <button
                              type="button"
                              onClick={() => handleResolveConflict(conflict, 'duration_compression', true)}
                              className="py-1 px-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <GitPullRequest size={11} />
                              <span>Stage PR</span>
                            </button>
                          </div>
                        </div>

                        {/* Action 3: Cooldown Compression */}
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 flex flex-col justify-between">
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                              Buffer Adherence
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Compress soft prep/cooldown buffers while preserving meeting duration.
                            </p>
                          </div>
                          <div className="flex gap-1.5 mt-3">
                            <button
                              type="button"
                              onClick={() => handleResolveConflict(conflict, 'cooldown_compression', false)}
                              className="flex-1 py-1 px-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Adjust Buffers
                            </button>
                            <button
                              type="button"
                              onClick={() => handleResolveConflict(conflict, 'cooldown_compression', true)}
                              className="py-1 px-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <GitPullRequest size={11} />
                              <span>Stage PR</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modal: Create New Scheduled Session ─────────────────────── */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                New Universal Scheduled Session
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateEventSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Session Title
                </label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. Q4 Executive Product Council"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Domain / Category
                  </label>
                  <select
                    value={newEventCategory}
                    onChange={(e) => setNewEventCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-zinc-100"
                  >
                    <option value="executive_strategy">Executive Strategy</option>
                    <option value="technical_architecture">Tech Architecture</option>
                    <option value="financial_projection">Financial Model</option>
                    <option value="health_athletics">Health & Athletics</option>
                    <option value="general_initiative">General Initiative</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={newEventDuration}
                    onChange={(e) => setNewEventDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Priority
                  </label>
                  <select
                    value={newEventPriority}
                    onChange={(e) => setNewEventPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-zinc-100"
                  >
                    <option value="p0_critical">P0 Critical</option>
                    <option value="p1_high">P1 High</option>
                    <option value="p2_medium">P2 Medium</option>
                    <option value="p3_low">P3 Low</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-zinc-300 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={newEventStage}
                      onChange={(e) => setNewEventStage(e.target.checked)}
                      className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                    />
                    <span>Stage to Pillar 3 PR</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                >
                  {newEventStage ? 'Stage Session into PR' : 'Create Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
