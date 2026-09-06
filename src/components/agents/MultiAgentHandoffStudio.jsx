import React, { useState, useEffect, useMemo } from 'react';
import { 
  Network, ArrowRight, CheckCircle2, Clock, AlertTriangle, 
  Send, RefreshCw, Layers, ShieldCheck, Check, 
  GitBranch, Zap, Bot, ChevronRight, User, ExternalLink,
  SlidersHorizontal, MessageSquare, Terminal, FileText, Database
} from 'lucide-react';
import { RegaarderAiIcon } from '../RegaarderProductIcons';
import {
  REGISTERED_SPECIALIST_AGENTS,
  HANDOFF_LIFECYCLE,
  NEGOTIATION_STATUS,
  getActiveHandoffs,
  subscribeToHandoffs,
  dispatchAgentHandoff,
  submitNegotiationCounterOffer,
  updateHandoff
} from '../../services/agentHandoffBus.js';

export default function MultiAgentHandoffStudio() {
  const [handoffs, setHandoffs] = useState([]);
  const [selectedHandoffId, setSelectedHandoffId] = useState(null);
  const [targetCapability, setTargetCapability] = useState('browser_research');
  const [targetAgentId, setTargetAgentId] = useState('agent_browser_researcher');
  const [intentInput, setIntentInput] = useState('Analyze European datacenter energy tariffs and compile executive briefing');
  const [targetUrl, setTargetUrl] = useState('https://ec.europa.eu/energy/data-analysis');
  const [isDispatching, setIsDispatching] = useState(false);
  const [isCounterOffering, setIsCounterOffering] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');

  useEffect(() => {
    const unsub = subscribeToHandoffs((items) => {
      setHandoffs(items);
      if (!selectedHandoffId && items.length > 0) {
        setSelectedHandoffId(items[0].handoffId);
      }
    });
    return unsub;
  }, []);

  const selectedHandoff = useMemo(() => {
    return handoffs.find(h => h.handoffId === selectedHandoffId) || handoffs[0] || null;
  }, [handoffs, selectedHandoffId]);

  const filteredHandoffs = useMemo(() => {
    if (activeFilter === 'ALL') return handoffs;
    if (activeFilter === 'ACTIVE') return handoffs.filter(h => h.lifecycle === HANDOFF_LIFECYCLE.ACTIVE || h.lifecycle === HANDOFF_LIFECYCLE.AWAITING_PEER);
    if (activeFilter === 'COMPLETED') return handoffs.filter(h => h.lifecycle === HANDOFF_LIFECYCLE.COMPLETED);
    return handoffs;
  }, [handoffs, activeFilter]);

  const handleSelectCapability = (cap) => {
    setTargetCapability(cap);
    const agent = REGISTERED_SPECIALIST_AGENTS.find(a => a.capabilities.includes(cap));
    if (agent) setTargetAgentId(agent.id);
  };

  const handleDispatchNewHandoff = async () => {
    if (!intentInput.trim()) return;
    setIsDispatching(true);
    try {
      const newEnvelope = await dispatchAgentHandoff({
        sourceAgentId: 'agent_relay_orchestrator',
        targetAgentId,
        targetCapability,
        intent: intentInput.trim(),
        contextPayload: {
          targetUrl: targetCapability === 'browser_research' ? targetUrl : undefined,
          sheetCellRange: 'Sheets!B3:D8',
          documentTitle: 'Synthesized Multi-Agent Brief'
        },
        parameters: {
          searchTopic: intentInput.trim(),
          maxRounds: 4
        }
      });
      setSelectedHandoffId(newEnvelope.handoffId);
    } catch (err) {
      console.error('[MultiAgentHandoffStudio] Dispatch error:', err);
    } finally {
      setIsDispatching(false);
    }
  };

  const handleTriggerCounterOffer = async () => {
    if (!selectedHandoff) return;
    setIsCounterOffering(true);
    try {
      await submitNegotiationCounterOffer(selectedHandoff.handoffId, {
        notes: 'Adjusting temporal constraints for Pareto alignment'
      });
    } catch (err) {
      console.error('[MultiAgentHandoffStudio] Counter-offer error:', err);
    } finally {
      setIsCounterOffering(false);
    }
  };

  const getStatusOutlineBadge = (lifecycle) => {
    switch (lifecycle) {
      case HANDOFF_LIFECYCLE.ACTIVE:
        return 'border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400';
      case HANDOFF_LIFECYCLE.AWAITING_PEER:
        return 'border border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400';
      case HANDOFF_LIFECYCLE.COMPLETED:
        return 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      case HANDOFF_LIFECYCLE.STAGED_FOR_APPROVAL:
        return 'border border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400';
      case HANDOFF_LIFECYCLE.FAILED:
        return 'border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400';
      default:
        return 'border border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Executive Header Banner ── */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-violet-500/5 via-sky-500/5 to-emerald-500/5 border border-violet-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Universal A2A Handoff Substrate Active
            </span>
          </div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
            <RegaarderAiIcon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span>Multi-Agent Handoff & Remote Alternating Negotiation Bus</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Real-time peer orchestration: Relay Director delegates to Browser Scraper, Calendar CSP Negotiator, Matrix Modeler, and Canvas Synthesizer.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] font-mono font-bold text-slate-800 dark:text-zinc-200">
              {REGISTERED_SPECIALIST_AGENTS.length} Specialized Agents Online
            </span>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500">Pareto Threshold: &ge; 0.65</p>
          </div>
        </div>
      </div>

      {/* ── Specialist Agent Topology Grid ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
            Active Specialist Nodes
          </span>
          <span className="text-[11px] text-slate-400 dark:text-zinc-500">Standardized A2A Envelope Enforced</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {REGISTERED_SPECIALIST_AGENTS.map((agent) => {
            const isTarget = targetAgentId === agent.id;
            return (
              <button
                key={agent.id}
                type="button"
                onClick={() => {
                  setTargetAgentId(agent.id);
                  setTargetCapability(agent.capabilities[0]);
                }}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  isTarget
                    ? 'border-violet-500/50 bg-violet-500/[0.06] dark:bg-violet-500/10 shadow-2xs'
                    : 'border-black/[0.06] dark:border-white/[0.08] bg-white/60 dark:bg-zinc-900/60 hover:border-black/[0.12] dark:hover:border-white/[0.15]'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg overflow-hidden border border-black/[0.08] dark:border-white/[0.1] bg-slate-100 dark:bg-zinc-800 shrink-0">
                    <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{agent.name}</p>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">{agent.role}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {agent.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                        isTarget && targetCapability === cap
                          ? 'border border-violet-500/40 bg-violet-500/15 text-violet-700 dark:text-violet-300 font-semibold'
                          : 'bg-black/[0.04] dark:bg-white/[0.05] text-slate-500 dark:text-zinc-400'
                      }`}
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Dispatch Live Handoff Console ── */}
      <div className="p-4 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-white/70 dark:bg-zinc-900/70 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send size={14} className="text-violet-600 dark:text-violet-400" />
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Dispatch Agent Handoff
            </span>
          </div>
          <span className="text-[10.5px] font-mono text-slate-400 dark:text-zinc-500">
            Source: agent_relay_orchestrator &rarr; Target: {targetAgentId}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-300">Directive Intent</label>
            <input
              type="text"
              value={intentInput}
              onChange={(e) => setIntentInput(e.target.value)}
              placeholder="Enter cross-agent directive..."
              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-950 border border-black/[0.08] dark:border-white/[0.1] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-300">Target Capability</label>
            <select
              value={targetCapability}
              onChange={(e) => handleSelectCapability(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-950 border border-black/[0.08] dark:border-white/[0.1] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500/50"
            >
              <option value="browser_research">browser_research (Web / DOM Scrape)</option>
              <option value="scheduler_negotiation">scheduler_negotiation (Alternating Offers CSP)</option>
              <option value="finance_modeling">finance_modeling (Spreadsheet Reconcile)</option>
              <option value="doc_synthesis">doc_synthesis (Canvas AST Patching)</option>
            </select>
          </div>
        </div>

        {targetCapability === 'browser_research' && (
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-300">Live Target URL</label>
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-1 rounded-lg bg-white dark:bg-zinc-950 border border-black/[0.08] dark:border-white/[0.1] text-xs font-mono text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-violet-500/50"
            />
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="button"
            disabled={isDispatching || !intentInput.trim()}
            onClick={handleDispatchNewHandoff}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95"
          >
            {isDispatching ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12} />}
            <span>Execute A2A Handoff</span>
          </button>
        </div>
      </div>

      {/* ── Master-Detail Handoff Inspector ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Handoff Queue Stream */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-black/[0.06] dark:border-white/[0.07]">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
              Handoff Queue ({filteredHandoffs.length})
            </span>
            <div className="flex gap-1">
              {['ALL', 'ACTIVE', 'COMPLETED'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveFilter(f)}
                  className={`text-[10px] px-2 py-0.5 rounded transition-all cursor-pointer ${
                    activeFilter === f
                      ? 'border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {filteredHandoffs.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-black/[0.08] dark:border-white/[0.1] text-center text-xs text-slate-400">
                No handoffs matching filter.
              </div>
            ) : (
              filteredHandoffs.map((h) => {
                const isSelected = h.handoffId === selectedHandoff?.handoffId;
                return (
                  <button
                    key={h.handoffId}
                    type="button"
                    onClick={() => setSelectedHandoffId(h.handoffId)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-violet-500/60 bg-violet-500/[0.04] dark:bg-violet-500/10 shadow-2xs'
                        : 'border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-zinc-900/50 hover:border-black/[0.12] dark:hover:border-white/[0.15]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[10px] font-mono text-slate-400 truncate">{h.handoffId}</span>
                      <span className={`text-[9.5px] font-mono px-1.5 py-0.5 rounded ${getStatusOutlineBadge(h.lifecycle)}`}>
                        {h.lifecycle}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2 mb-1.5">
                      {h.intent}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400">
                      <span className="truncate">{h.targetCapability}</span>
                      <span>{new Date(h.updatedAt || h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Handoff Protocol Inspector & Alternating Negotiation Rounds */}
        <div className="lg:col-span-2 space-y-4">
          {selectedHandoff ? (
            <div className="p-4 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-white/70 dark:bg-zinc-900/70 shadow-2xs space-y-4">
              {/* Envelope Metadata Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-black/[0.06] dark:border-white/[0.07]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      {selectedHandoff.handoffId}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${getStatusOutlineBadge(selectedHandoff.lifecycle)}`}>
                      {selectedHandoff.lifecycle}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Created: {new Date(selectedHandoff.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-600 dark:text-zinc-300">
                    {selectedHandoff.sourceAgentId} &rarr; {selectedHandoff.targetAgentId}
                  </span>
                </div>
              </div>

              {/* Intent & Context Payload */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                  Directive Objective
                </span>
                <p className="text-xs text-slate-800 dark:text-zinc-200 bg-black/[0.02] dark:bg-white/[0.03] p-2.5 rounded-lg border border-black/[0.04] dark:border-white/[0.05]">
                  {selectedHandoff.intent}
                </p>
              </div>

              {/* Negotiation Substrate: Alternating Offers & Utility Convergence */}
              {selectedHandoff.negotiationState && (
                <div className="space-y-3 pt-2 border-t border-black/[0.06] dark:border-white/[0.07]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal size={13} className="text-violet-600 dark:text-violet-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                        Alternating-Offer Negotiation Rounds
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Convergence: 
                      </span>
                      <span className="text-xs font-mono font-bold text-violet-600 dark:text-violet-400">
                        {Math.round((selectedHandoff.negotiationState.convergenceScore || 0) * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Convergence Progress Bar */}
                  <div className="w-full bg-black/[0.06] dark:bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-violet-500 to-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.round((selectedHandoff.negotiationState.convergenceScore || 0) * 100))}%` }}
                    />
                  </div>

                  {/* Round Sequence */}
                  <div className="space-y-2">
                    {(selectedHandoff.negotiationState.history || []).map((round) => (
                      <div
                        key={round.round}
                        className="p-2.5 rounded-lg border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02] text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800 dark:text-zinc-200">
                            Round {round.round}: {round.proposer} &rarr; {round.receiver}
                          </span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                            round.status === NEGOTIATION_STATUS.CONVERGED
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'
                          }`}>
                            {round.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-zinc-300">
                          <span>Proposed Slot: <strong>{round.proposedSlot?.day || 'Tomorrow'} @ {round.proposedSlot?.time}</strong></span>
                          <span className="font-mono text-[10px]">Utility: {round.compositeUtility}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Interactive Counter-Offer Control */}
                  {selectedHandoff.lifecycle !== HANDOFF_LIFECYCLE.COMPLETED && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        disabled={isCounterOffering}
                        onClick={handleTriggerCounterOffer}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-violet-500/40 bg-violet-500/10 hover:bg-violet-500/20 text-violet-700 dark:text-violet-300 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                      >
                        {isCounterOffering ? <RefreshCw size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                        <span>Submit Peer Counter-Offer (Round {(selectedHandoff.negotiationState.round || 1) + 1})</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Artifacts & Staging Pull Requests */}
              <div className="space-y-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.07]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                  Produced Artifacts & Staged Mutations
                </span>
                {(!selectedHandoff.artifacts || selectedHandoff.artifacts.length === 0) ? (
                  <p className="text-xs text-slate-400 italic">No artifacts produced yet for this handoff.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedHandoff.artifacts.map((art, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02] text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                            <FileText size={12} className="text-violet-500" />
                            {art.title || art.type}
                          </span>
                          <span className="text-[9px] font-mono bg-black/[0.05] dark:bg-white/[0.05] px-1.5 py-0.5 rounded">
                            {art.type}
                          </span>
                        </div>
                        {art.content && (
                          <pre className="text-[10.5px] font-mono text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-950 p-2 rounded border border-black/[0.04] dark:border-white/[0.05] whitespace-pre-wrap max-h-40 overflow-y-auto">
                            {art.content}
                          </pre>
                        )}
                        {art.branchId && (
                          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                            <GitBranch size={11} />
                            <span>Staged PR Branch: {art.branchId}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Raw A2A JSON Envelope Inspector */}
              <div className="space-y-1.5 pt-2 border-t border-black/[0.06] dark:border-white/[0.07]">
                <span className="text-[10.5px] font-mono font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Raw Envelope Payload
                </span>
                <pre className="p-2.5 rounded-lg bg-slate-950 text-slate-300 font-mono text-[10px] overflow-x-auto max-h-36">
                  {JSON.stringify(selectedHandoff, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-xl border border-dashed border-black/[0.08] dark:border-white/[0.1] text-center text-xs text-slate-400">
              Select a handoff envelope to inspect protocol metrics and negotiation history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
