/**
 * IntentSchedulerInspector.jsx
 * 
 * Regaarder Schedule & Calendar Experience
 * 
 * Aligned with the workspace aesthetic (TasksWorkspace):
 * - Clean "Schedule" product framing and violet interaction accents
 * - Segmented tab control for All Events, Conflicts, and Smart Scheduling & Negotiation
 * - Natural language quick-scheduling input card powered by the CSP engine
 * - Streamlined event list, conflict resolution, and multi-agent negotiation simulator
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
  X,
  Search,
  SlidersHorizontal
} from 'lucide-react';
import { RegaarderAiIcon } from '../RegaarderProductIcons';
import * as intentScheduler from '../../services/intentSchedulerEngine.js';

export default function IntentSchedulerInspector({ onClose }) {
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' | 'conflicts' | 'advanced'
  const [advancedSubTab, setAdvancedSubTab] = useState('negotiation'); // 'negotiation' | 'solver'
  const [calendarSnapshot, setCalendarSnapshot] = useState(() => intentScheduler.getCalendarSnapshot());
  const [searchQuery, setSearchQuery] = useState('');
  const [quickInput, setQuickInput] = useState('');

  // Constraint Solver Playground State
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

  // Feedback Notification
  const [resolutionFeedback, setResolutionFeedback] = useState(null);

  // Subscribe to schedule updates
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

  // Quick NLP Schedule submission
  const handleQuickSchedule = (e) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    try {
      const spec = intentScheduler.parseIntentToScheduleSpec(quickInput.trim());
      const solution = intentScheduler.solveScheduleConstraints(spec);
      const chosenSlot = solution.candidateSlots && solution.candidateSlots.length > 0
        ? solution.candidateSlots[0]
        : null;

      const startTime = chosenSlot?.start || new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString();
      const endTime = chosenSlot?.end || new Date(new Date(startTime).getTime() + (spec.durationMin || 45) * 60000).toISOString();

      const result = intentScheduler.createScheduledEvent({
        title: spec.title || quickInput.trim(),
        intentCategory: spec.intentCategory || 'general_initiative',
        startTime,
        endTime,
        durationMin: spec.durationMin || 45,
        participants: spec.participants || ['user-joshua', 'agent-alex'],
        priority: spec.priority || 'p1_high'
      });

      setQuickInput('');
      setResolutionFeedback(`Scheduled: "${result.event?.title || spec.title}"`);
      setTimeout(() => setResolutionFeedback(null), 4000);
    } catch (err) {
      console.error('Quick schedule error:', err);
    }
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

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const q = searchQuery.toLowerCase();
    return events.filter(e =>
      e.title.toLowerCase().includes(q) ||
      (e.location && e.location.toLowerCase().includes(q)) ||
      (e.intentCategory && e.intentCategory.toLowerCase().includes(q))
    );
  }, [events, searchQuery]);

  const priorityBadge = (p) => {
    switch (p) {
      case 'p0_critical':
        return <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-200/60 dark:border-rose-900/40">Critical</span>;
      case 'p1_high':
        return <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-900/40">High</span>;
      case 'p2_medium':
        return <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded-md border border-sky-200/60 dark:border-sky-900/40">Medium</span>;
      default:
        return <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">Normal</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#151518] overflow-hidden select-none">
      {/* ── Top Header Bar (Matching TasksWorkspace exactly) ── */}
      <div className="px-10 py-7 border-b border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between shrink-0 bg-white/70 dark:bg-[#151518]/70 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[22px] font-bold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Calendar className="text-violet-600 dark:text-violet-400" size={22} />
              <span>Schedule</span>
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-violet-100/70 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
              {events.length} {events.length === 1 ? 'event' : 'events'}
            </span>
            {conflicts.length > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-100/70 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 flex items-center gap-1">
                <AlertTriangle size={12} />
                <span>{conflicts.length} conflict{conflicts.length > 1 ? '' : ''}</span>
              </span>
            )}
          </div>
          <p className="text-[13px] text-slate-400 dark:text-zinc-400 mt-1">
            Plan meetings, deadlines, and smart scheduling across your workspace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {resolutionFeedback && (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-medium flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>{resolutionFeedback}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>New Event</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
              title="Close Schedule"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ── Main Scrollable Body Container (Matching Tasks layout) ── */}
      <div className="flex-1 overflow-y-auto px-10 py-6 max-w-[940px] w-full mx-auto space-y-6 thin-scrollbar">
        {/* Quick Schedule Input Card */}
        <form
          onSubmit={handleQuickSchedule}
          className="p-3 rounded-2xl bg-slate-50/80 dark:bg-zinc-850/60 border border-slate-200/70 dark:border-white/[0.06] flex items-center gap-2.5 shadow-2xs"
        >
          <div className="w-7 h-7 rounded-xl bg-violet-100/70 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 ml-1">
            <RegaarderAiIcon size={14} />
          </div>
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder="Quick schedule with AI (e.g., 'Product review with Alex tomorrow at 2pm')..."
            className="flex-1 bg-transparent border-none text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={!quickInput.trim()}
            className="px-3 py-1.5 rounded-xl bg-violet-600 text-white text-xs font-medium hover:bg-violet-700 transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer shrink-0"
          >
            Schedule
          </button>
        </form>

        {/* Top Controls: Segmented View Navigation & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Segmented Tab Controls (Strictly Non-Pill Rounded Rectangles) */}
          <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-zinc-800/60 p-0.5 rounded-xl border border-slate-200/60 dark:border-white/[0.04] self-start">
            {[
              { id: 'calendar', label: 'All Events', count: events.length },
              { id: 'conflicts', label: 'Conflicts', count: conflicts.length, alert: conflicts.length > 0 },
              { id: 'advanced', label: 'AI Scheduling & Negotiation', icon: RegaarderAiIcon }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {Icon && <Icon size={12} className={isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'} />}
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      tab.alert
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold'
                        : isActive
                        ? 'bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300'
                        : 'bg-black/5 dark:bg-white/5 text-slate-400'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Filter */}
          {activeTab === 'calendar' && (
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50/80 dark:bg-zinc-850/60 border border-slate-200/60 dark:border-white/[0.06] text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-hidden w-48 sm:w-56"
              />
            </div>
          )}
        </div>

        {/* ── TAB 1: ALL EVENTS (CALENDAR & TIMELINE) ── */}
        {activeTab === 'calendar' && (
          <div className="space-y-3">
            {filteredEvents.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-50/50 dark:bg-zinc-850/30 border border-dashed border-slate-200 dark:border-zinc-800 flex flex-col items-center justify-center space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-slate-100/70 dark:bg-zinc-850/60 border border-slate-200/50 dark:border-zinc-800/60 text-slate-500 dark:text-zinc-400 flex items-center justify-center">
                  <Calendar size={20} strokeWidth={1.8} />
                </div>
                <div className="max-w-sm space-y-1">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">No events scheduled</h4>
                  <p className="text-xs text-slate-400 dark:text-zinc-400">
                    {searchQuery ? 'No events match your search.' : 'Add a new session or load example events to get started.'}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus size={13} />
                    <span>New Event</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => intentScheduler.loadSampleSchedule()}
                    className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-medium border border-slate-200 dark:border-zinc-700 transition-all cursor-pointer"
                  >
                    Load Example Schedule
                  </button>
                </div>
              </div>
            ) : (
              filteredEvents.map((evt) => {
                const startTime = new Date(evt.startTime);
                const endTime = new Date(evt.endTime);
                const isConflict = conflicts.some(c => c.primaryEvent?.id === evt.id || c.secondaryEvent?.id === evt.id);

                return (
                  <div
                    key={evt.id}
                    className={`p-4 rounded-2xl bg-white dark:bg-zinc-900 border transition-all ${
                      isConflict
                        ? 'border-amber-400/80 dark:border-amber-600/80 shadow-xs'
                        : 'border-slate-200/70 dark:border-white/[0.06] hover:border-violet-300 dark:hover:border-violet-700/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {priorityBadge(evt.priority)}
                          <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500">
                            {evt.intentCategory?.replace(/_/g, ' ')}
                          </span>
                          {isConflict && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                              <AlertTriangle size={11} />
                              Conflict Detected
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                          {evt.title}
                        </h4>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-zinc-400">
                          <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-zinc-300">
                            <Clock size={13} className="text-violet-600 dark:text-violet-400" />
                            <span>
                              {startTime.toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                              {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({evt.durationMin}m)
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
                                  className="inline-block px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700"
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
                            onClick={() => setActiveTab('conflicts')}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>Resolve</span>
                            <ArrowRight size={12} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => intentScheduler.deleteScheduledEvent(evt.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Remove Event"
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
        )}

        {/* ── TAB 2: CONFLICTS RESOLUTION ── */}
        {activeTab === 'conflicts' && (
          <div className="space-y-4">
            {conflicts.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                <ShieldCheck className="w-10 h-10 mx-auto text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">No schedule conflicts</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  All active events and buffer intervals satisfy participant schedules cleanly.
                </p>
              </div>
            ) : (
              conflicts.map((conflict) => (
                <div
                  key={conflict.id}
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-800 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                          Conflict Detected
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200">
                          {conflict.overlapMinutes} min overlap
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

                  {/* Resolution Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Resolution Actions
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Action 1: Auto-Shift */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 flex flex-col justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                            Priority Auto-Shift
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Move lower-priority event to the next available slot.
                          </p>
                        </div>
                        <div className="flex gap-1.5 mt-3">
                          <button
                            type="button"
                            onClick={() => handleResolveConflict(conflict, 'priority_bump', false)}
                            className="flex-1 py-1 px-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Apply
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResolveConflict(conflict, 'priority_bump', true)}
                            className="py-1 px-2 rounded-lg bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Stage as proposal"
                          >
                            <GitPullRequest size={11} />
                            <span>Stage</span>
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
                            Compress event durations by 15–20% to fit the window.
                          </p>
                        </div>
                        <div className="flex gap-1.5 mt-3">
                          <button
                            type="button"
                            onClick={() => handleResolveConflict(conflict, 'duration_compression', false)}
                            className="flex-1 py-1 px-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Compress
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResolveConflict(conflict, 'duration_compression', true)}
                            className="py-1 px-2 rounded-lg bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Stage as proposal"
                          >
                            <GitPullRequest size={11} />
                            <span>Stage</span>
                          </button>
                        </div>
                      </div>

                      {/* Action 3: Buffer Adjustment */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 flex flex-col justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                            Buffer Adherence
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Tighten soft cooldown buffers while preserving duration.
                          </p>
                        </div>
                        <div className="flex gap-1.5 mt-3">
                          <button
                            type="button"
                            onClick={() => handleResolveConflict(conflict, 'cooldown_compression', false)}
                            className="flex-1 py-1 px-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Adjust
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResolveConflict(conflict, 'cooldown_compression', true)}
                            className="py-1 px-2 rounded-lg bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Stage as proposal"
                          >
                            <GitPullRequest size={11} />
                            <span>Stage</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── TAB 3: ADVANCED AI SCHEDULING & NEGOTIATION ── */}
        {activeTab === 'advanced' && (
          <div className="space-y-6">
            {/* Sub-tab Switcher */}
            <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-white/[0.06] pb-3">
              <button
                type="button"
                onClick={() => setAdvancedSubTab('negotiation')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  advancedSubTab === 'negotiation'
                    ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300'
                    : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                Multi-Agent Negotiation Studio
              </button>
              <button
                type="button"
                onClick={() => setAdvancedSubTab('solver')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  advancedSubTab === 'solver'
                    ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300'
                    : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                Constraint Solver Playground
              </button>
            </div>

            {/* Negotiation Sub-view */}
            {advancedSubTab === 'negotiation' && (
              <div className="space-y-5">
                <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-zinc-850/60 border border-slate-200/70 dark:border-white/[0.06] space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                      <RegaarderAiIcon size={16} className="text-violet-600" />
                      <span>Multi-Agent Negotiation Simulator</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      Simulate alternating-offer concession protocols between autonomous agent profiles with Pareto convergence.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Initiator
                      </label>
                      <select
                        value={negInitiator}
                        onChange={(e) => setNegInitiator(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-zinc-100"
                      >
                        <option value="user-joshua">Joshua David (Executive)</option>
                        <option value="agent-alex">Alex Miller (Frontend Principal)</option>
                        <option value="agent-elena">Elena Rostova (Chief Product Officer)</option>
                        <option value="agent-david">David Kim (Lead Infrastructure)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Counterparty
                      </label>
                      <select
                        value={negCounterparty}
                        onChange={(e) => setNegCounterparty(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-zinc-100"
                      >
                        <option value="agent-elena">Elena Rostova (Chief Product Officer)</option>
                        <option value="agent-alex">Alex Miller (Frontend Principal)</option>
                        <option value="user-joshua">Joshua David (Executive)</option>
                        <option value="agent-david">David Kim (Lead Infrastructure)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Meeting Subject
                      </label>
                      <input
                        type="text"
                        value={negIntent}
                        onChange={(e) => setNegIntent(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-zinc-100"
                        placeholder="e.g. Q3 Roadmap Review"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Max Rounds:</span>
                      {[2, 4, 6].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setNegMaxRounds(num)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                            negMaxRounds === num
                              ? 'bg-violet-600 text-white shadow-2xs'
                              : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100'
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
                      className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Play size={13} strokeWidth={2.5} />
                      <span>{isNegotiating ? 'Negotiating...' : 'Run Negotiation'}</span>
                    </button>
                  </div>
                </div>

                {/* Negotiation Transcript */}
                {activeNegotiation && (
                  <div className="space-y-4">
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
                            Status: {activeNegotiation.status}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-zinc-300">
                            Slot: <strong>{activeNegotiation.agreedSlot?.formattedTime || 'No slot agreed'}</strong> (Utility: {Math.round((activeNegotiation.agreedSlot?.utilityScore || 0) * 100)}%)
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
                          <span>Commit to Calendar</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Transcript ({activeNegotiation.negotiationRecord?.roundsCount || 0} Rounds)
                      </h4>

                      {(activeNegotiation.negotiationRecord?.transcript || []).map((step, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/70 dark:border-white/[0.06] flex items-start gap-3"
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

            {/* Solver Sub-view */}
            {advancedSubTab === 'solver' && (
              <div className="space-y-5">
                <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-zinc-850/60 border border-slate-200/70 dark:border-white/[0.06] space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                      <Sliders size={16} className="text-violet-600" />
                      <span>Constraint Satisfaction Problem (CSP) Playground</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      Test colloquial intent mapping and inspect how hard & soft constraints formulate optimal time intervals.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={solverIntentInput}
                      onChange={(e) => setSolverIntentInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRunSolver(solverIntentInput)}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-violet-500"
                      placeholder="Enter intent (e.g. 'Tennis practice', 'Board prep sync', 'QBR Session')"
                    />
                    <button
                      type="button"
                      onClick={() => handleRunSolver(solverIntentInput)}
                      className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                    >
                      Solve CSP
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-slate-400 font-medium">Presets:</span>
                    {['Tennis practice', 'Board prep sync', 'Q3 financial audit', 'Architecture review', 'Gym workout'].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setSolverIntentInput(preset);
                          handleRunSolver(preset);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-[11px] font-medium border border-slate-200/60 dark:border-zinc-700 transition-colors cursor-pointer"
                      >
                        "{preset}"
                      </button>
                    ))}
                  </div>
                </div>

                {solverResults && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/70 dark:border-white/[0.06] space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <RegaarderAiIcon size={13} className="text-violet-600" />
                        <span>Semantic Mapping Output</span>
                      </h4>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800">
                          <span className="text-slate-500">Extracted Title:</span>
                          <strong className="text-slate-900 dark:text-zinc-100">{solverResults.spec.title}</strong>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800">
                          <span className="text-slate-500">Category:</span>
                          <code className="text-violet-600 dark:text-violet-400 font-bold">{solverResults.spec.intentCategory}</code>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800">
                          <span className="text-slate-500">Standard Duration:</span>
                          <strong>{solverResults.spec.durationMin} minutes</strong>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800">
                          <span className="text-slate-500">Prep / Cooldown:</span>
                          <span>{solverResults.spec.constraints?.prepBufferMin || 15}m prep / {solverResults.spec.constraints?.cooldownBufferMin || 15}m cool</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Priority:</span>
                          <strong className="uppercase">{solverResults.spec.priority}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/70 dark:border-white/[0.06] space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Ranked Slots ({solverResults.solution?.candidateSlots?.length || 0})</span>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">Solved</span>
                      </h4>

                      <div className="space-y-2 max-h-64 overflow-y-auto thin-scrollbar pr-1">
                        {(solverResults.solution?.candidateSlots || []).map((slot, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-800/40 flex items-center justify-between"
                          >
                            <div>
                              <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                                {slot.formattedTime}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {slot.date} • {slot.durationMin}m duration
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                                {Math.round(slot.utilityScore * 100)}%
                              </span>
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
                                className="px-2 py-1 rounded bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
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
          </div>
        )}
      </div>

      {/* ── Modal: Create New Event ── */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                New Schedule Event
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
                  Event Title
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
                    Category
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
                    <option value="p0_critical">Critical</option>
                    <option value="p1_high">High</option>
                    <option value="p2_medium">Medium</option>
                    <option value="p3_low">Low</option>
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
                    <span>Stage to Proposal PR</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                >
                  {newEventStage ? 'Stage Event into PR' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
