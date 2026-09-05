import React, { useState, useEffect } from 'react';
import {
  Radio, Play, Square, RefreshCw, Send, CheckCircle2,
  AlertCircle, ArrowRight, GitPullRequest, ListTodo,
  Network, Calculator, FileText, Users, Mic,
  Volume2, Shield, Copy, Check, Sparkles, Layers,
  ChevronRight, ArrowUpRight, Zap
} from 'lucide-react';
import {
  getLiveSession,
  subscribeToRoomObserver,
  ingestSpeechTurn,
  runSyntheticMeetingSimulation,
  startLiveSimulationStream,
  stopLiveSimulationStream,
  commitMeetingPr,
  rejectMeetingPr,
  resetRoomSession,
  serializeRoomContextToMarkdown,
  serializeRoomContextToJson,
  EPISTEMIC_INTENT_TYPES,
  HARVESTER_STATUS,
  DEFAULT_IN_ROOM_OBSERVERS
} from '../../services/roomObserverEngine.js';

export default function RoomContextHarvesterInspector({ isDarkMode = false }) {
  const [session, setSession] = useState(getLiveSession());
  const [activeTab, setActiveTab] = useState('stream'); // 'stream' | 'consensus' | 'mutations' | 'staging'
  const [customSpeaker, setCustomSpeaker] = useState('Elena Rostova (VP Finance)');
  const [customText, setCustomText] = useState('');
  const [isAutoStreaming, setIsAutoStreaming] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState(null);
  const [actionFeedback, setActionFeedback] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToRoomObserver((updated) => {
      setSession({ ...updated });
    });
    return () => {
      unsubscribe();
      stopLiveSimulationStream();
    };
  }, []);

  const showFeedback = (msg) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const handleSendCustomTurn = (e) => {
    e.preventDefault();
    if (!customText.trim()) return;
    ingestSpeechTurn({
      speaker: customSpeaker,
      text: customText.trim(),
      confidence: 0.96,
      autoMutate: true,
      stage: true
    });
    setCustomText('');
    showFeedback(`Harvested speech turn from ${customSpeaker}`);
  };

  const handleToggleAutoStream = () => {
    if (isAutoStreaming) {
      stopLiveSimulationStream();
      setIsAutoStreaming(false);
      showFeedback('Paused simulated in-meeting speech stream');
    } else {
      setIsAutoStreaming(true);
      startLiveSimulationStream(2200, () => {
        // Callback on each turn
      });
      showFeedback('Started simulated in-meeting live speech stream');
    }
  };

  const handleRunFullSimulation = async () => {
    stopLiveSimulationStream();
    setIsAutoStreaming(false);
    await runSyntheticMeetingSimulation();
    showFeedback('Simulated 5-turn executive meeting sequence');
  };

  const handleCommitPr = () => {
    const res = commitMeetingPr();
    if (res.success) {
      showFeedback('Successfully committed all in-meeting mutations into workspace');
    } else {
      showFeedback(`Commit error: ${res.message || res.error}`);
    }
  };

  const handleRejectPr = () => {
    const res = rejectMeetingPr();
    if (res.success) {
      showFeedback('Discarded pending in-meeting staged mutations');
    } else {
      showFeedback(`Reject error: ${res.message || res.error}`);
    }
  };

  const handleResetSession = () => {
    stopLiveSimulationStream();
    setIsAutoStreaming(false);
    resetRoomSession();
    showFeedback('Reset Room In-Meeting Harvester Session');
  };

  const copyToClipboard = (type) => {
    const content = type === 'json'
      ? serializeRoomContextToJson(session)
      : serializeRoomContextToMarkdown(session);
    navigator.clipboard.writeText(content).then(() => {
      setCopiedFormat(type);
      setTimeout(() => setCopiedFormat(null), 2000);
      showFeedback(`Copied ${type.toUpperCase()} context feed`);
    });
  };

  const getIntentBadgeStyle = (type) => {
    switch (type) {
      case EPISTEMIC_INTENT_TYPES.DECISION_CONSENSUS:
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      case EPISTEMIC_INTENT_TYPES.ACTION_DIRECTIVE:
        return 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      case EPISTEMIC_INTENT_TYPES.ARCHITECTURE_MUTATION:
        return 'bg-teal-50 text-teal-700 border-teal-300 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800';
      case EPISTEMIC_INTENT_TYPES.FINANCIAL_METRIC_UPDATE:
        return 'bg-violet-50 text-violet-700 border-violet-300 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 text-slate-800 dark:text-zinc-100 font-sans">
      
      {/* ── HEADER BANNER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Radio size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Room Context Harvester & Observer
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-800">
                Pillar 10 Substrate
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Live organizational intent ingestion • Concurrent cross-app workspace mutator • Meeting PR sandboxes
            </p>
          </div>
        </div>

        {/* Live Controls Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onPointerDown={handleToggleAutoStream}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              isAutoStreaming
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                : 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-300 dark:border-violet-800 hover:bg-violet-100'
            }`}
          >
            {isAutoStreaming ? <Square size={13} /> : <Play size={13} />}
            <span>{isAutoStreaming ? 'Stop Audio Stream' : 'Live Audio Stream'}</span>
          </button>

          <button
            type="button"
            onPointerDown={handleRunFullSimulation}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-zinc-700"
          >
            <Sparkles size={13} className="text-violet-500" />
            <span>Simulate 5-Turn Call</span>
          </button>

          <button
            type="button"
            onPointerDown={handleResetSession}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 transition-colors cursor-pointer border border-slate-200 dark:border-zinc-700"
            title="Reset Session"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div className="px-4 py-2 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 text-xs text-violet-800 dark:text-violet-200 flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 size={14} className="text-violet-600 dark:text-violet-400 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* ── ACTIVE OBSERVERS & LIVE STATUS STRIP ──────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500">Meeting Status</div>
          <div className="text-sm font-bold text-slate-800 dark:text-zinc-100 mt-1 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-xs ${session.status === HARVESTER_STATUS.LISTENING ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span className="capitalize">{session.status}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500">Decisions / Consensus</div>
          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {session.summary.decisionsCount} resolved
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500">Directives Queued</div>
          <div className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-1">
            {session.summary.directivesCount} tasks
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500">Whiteboard & Matrix</div>
          <div className="text-sm font-bold text-teal-600 dark:text-teal-400 mt-1">
            {session.summary.architectureCount + session.summary.financialCount} mutations
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500">Meeting Sandbox PR</div>
          <div className="text-sm font-bold text-violet-600 dark:text-violet-400 mt-1 truncate">
            {session.activePrBranchId ? session.activePrBranchId.slice(0, 16) + '...' : 'None pending'}
          </div>
        </div>
      </div>

      {/* In-Room Observers Roster */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 shrink-0 uppercase tracking-wider">
          In-Room Observers:
        </span>
        {session.activeObservers.map((obs) => (
          <div
            key={obs.id}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/90 dark:bg-zinc-800/90 border border-slate-200/80 dark:border-zinc-700/80 text-slate-700 dark:text-zinc-300 shrink-0"
          >
            <span className="w-1.5 h-1.5 rounded-xs bg-violet-500 animate-pulse" />
            <span className="font-bold">{obs.name}</span>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500">({obs.role})</span>
          </div>
        ))}
      </div>

      {/* ── NAVIGATION TABS (Strict Rule 3: Slightly rounded rectangles, NO pills) ── */}
      <div className="flex items-center gap-1 p-1 bg-slate-100/80 dark:bg-zinc-800/80 rounded-xl border border-slate-200/60 dark:border-zinc-700/60 w-fit">
        {[
          { id: 'stream', label: 'Live Harvester Stream', icon: Mic },
          { id: 'consensus', label: 'Epistemic Intent Matrix', icon: Shield },
          { id: 'mutations', label: 'Cross-App Live Mutator', icon: Layers },
          { id: 'staging', label: 'Meeting Staged PR Sandbox', icon: GitPullRequest }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onPointerDown={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-zinc-900 text-violet-700 dark:text-violet-300 shadow-xs border border-violet-200/60 dark:border-violet-800/60'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-white/40 dark:hover:bg-zinc-900/40'
              }`}
              title={tab.label}
            >
              <Icon size={13} className={isActive ? 'text-violet-600 dark:text-violet-400' : ''} />
              <span>{tab.label}</span>
              {/* Active visual status strictly named outline (Rule 2) */}
              {isActive && (
                <span className="sr-only">(Active tab outline)</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: LIVE HARVESTER STREAM ──────────────────────────────────── */}
      {activeTab === 'stream' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Speaker Transcript Stream */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 size={15} className="text-violet-600 dark:text-violet-400" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                    Real-Time Audio Transcript Stream
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {session.speakerTurns.length} turns processed
                </span>
              </div>

              {session.speakerTurns.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
                  <Mic size={24} className="mx-auto text-slate-300 dark:text-zinc-600 mb-2" />
                  <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Listening for in-meeting spoken turns...
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 max-w-sm mx-auto">
                    Click "Live Audio Stream" or "Simulate 5-Turn Call" above to stream executive audio into the harvester.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-[460px] overflow-y-auto pr-1">
                  {session.speakerTurns.map((turn, idx) => (
                    <div
                      key={turn.id || idx}
                      className="p-3 rounded-xl bg-slate-50/80 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80 text-xs flex flex-col gap-1.5 hover:border-violet-400/50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 flex items-center justify-center font-bold text-[10px]">
                            {turn.speaker ? turn.speaker[0] : 'U'}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-zinc-100">
                            {turn.speaker}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[9.5px] font-bold rounded border uppercase ${getIntentBadgeStyle(turn.intent?.type)}`}>
                            {turn.intent?.type?.replace(/_/g, ' ') || 'NOTE'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-700 dark:text-zinc-300 leading-relaxed pl-7">
                        "{turn.text}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ingest Spoken Turn Form */}
            <form onSubmit={handleSendCustomTurn} className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                  Inject Speech Turn (Testing & Manual Input)
                </span>
                <span className="text-[10px] text-slate-400">
                  Simulate voice audio packet
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                <select
                  value={customSpeaker}
                  onChange={(e) => setCustomSpeaker(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                >
                  <option value="Elena Rostova (VP Finance)">Elena Rostova (VP Finance)</option>
                  <option value="Alex Chen (Principal Architect)">Alex Chen (Principal Architect)</option>
                  <option value="Marcus Vance (CEO)">Marcus Vance (CEO)</option>
                  <option value="Sarah Lin (VP Product)">Sarah Lin (VP Product)</option>
                  <option value="You (Participant)">You (Participant)</option>
                </select>

                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="e.g. 'We agreed to allocate $250k for vector database storage...'"
                  className="md:col-span-2 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!customText.trim()}
                  className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Send size={12} />
                  <span>Harvest Spoken Turn</span>
                </button>
              </div>
            </form>
          </div>

          {/* Side Context Feed & Token Efficiency Card */}
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                  Token Efficiency Comparison
                </h3>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
                  97.6% Saved
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Raw Post-Call Audio / Transcript</span>
                  <span className="font-mono font-bold text-rose-500">~18,000 tokens</span>
                </div>
                <div className="p-2.5 rounded-xl bg-violet-50/50 dark:bg-violet-950/30 border border-violet-200/80 dark:border-violet-800/80 flex items-center justify-between">
                  <span className="text-violet-900 dark:text-violet-200 font-semibold">Semantic Harvester State</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">~420 tokens</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 dark:text-zinc-500 leading-relaxed">
                By stripping raw acoustic frames and non-essential conversation, the in-room observer distills hours of speech into token-dense machine intent for background agents.
              </p>

              <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onPointerDown={() => copyToClipboard('markdown')}
                  className="flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[11px] font-bold text-slate-700 dark:text-zinc-300 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedFormat === 'markdown' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  <span>Copy Markdown</span>
                </button>
                <button
                  type="button"
                  onPointerDown={() => copyToClipboard('json')}
                  className="flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[11px] font-bold text-slate-700 dark:text-zinc-300 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedFormat === 'json' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  <span>Copy JSON</span>
                </button>
              </div>
            </div>

            {/* Live Context Quick View */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col gap-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                MCP Resource Endpoint
              </h4>
              <div className="p-2.5 rounded-xl bg-zinc-950 font-mono text-[11px] text-violet-300 select-all break-all">
                workspace://room/live-context
              </div>
              <p className="text-[10.5px] text-slate-400 leading-tight">
                Exposed natively via MCP 2024-11-05 for external agent tooling.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ── TAB 2: EPISTEMIC INTENT MATRIX ─────────────────────────────────── */}
      {activeTab === 'consensus' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
              Harvested Epistemic Consensus & Intent Items ({session.harvestedIntents.length})
            </h3>
            <span className="text-[11px] text-slate-400">
              Categorized by speech-to-intent engine
            </span>
          </div>

          {session.harvestedIntents.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900">
              <Shield size={24} className="mx-auto text-slate-300 dark:text-zinc-600 mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                No consensus items harvested yet
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Run the simulation or speak decisions like "We agreed to..." to populate this matrix.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {session.harvestedIntents.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between gap-3 hover:border-violet-400/50 transition-colors"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 text-[9.5px] font-bold rounded border uppercase ${getIntentBadgeStyle(item.type)}`}>
                        {item.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                        {(item.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 leading-snug">
                      {item.data.resolution || item.data.title || item.data.rawProposal || item.data.note}
                    </h4>

                    {item.data.financialFigure && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                        <Calculator size={13} />
                        <span>Capital Allocation: {item.data.financialFigure}</span>
                      </div>
                    )}

                    {item.data.assignee && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-bold">
                        <ListTodo size={13} />
                        <span>Assigned to: {item.data.assignee} ({item.data.priority})</span>
                      </div>
                    )}

                    {item.data.sourceNode && item.data.targetNode && (
                      <div className="flex items-center gap-1.5 text-xs text-teal-700 dark:text-teal-400 font-bold">
                        <Network size={13} />
                        <span>Spatial Edge: ({item.data.sourceNode}) ➔ ({item.data.targetNode})</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[10.5px] text-slate-400">
                    <span>Articulated by {item.speaker}</span>
                    <span className="font-mono">{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: CROSS-APP LIVE MUTATOR ─────────────────────────────────── */}
      {activeTab === 'mutations' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                Concurrent Workspace Mutations ({session.pendingMutations.length})
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Mutations routed concurrently across Docs, Whiteboard, Tasks, and Sheets
              </p>
            </div>
          </div>

          {session.pendingMutations.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900">
              <Layers size={24} className="mx-auto text-slate-300 dark:text-zinc-600 mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                No active workspace mutations
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Spoken consensus and directives will appear here as live mutative operations.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {session.pendingMutations.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 uppercase">
                        {m.targetApp}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                        {m.description}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-violet-200 text-violet-700 bg-violet-50 dark:bg-violet-950/40">
                      {m.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Before / After Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 text-rose-800 dark:text-rose-300 text-[11px] overflow-hidden truncate">
                      <span className="font-bold block text-[9.5px] uppercase text-rose-500">Baseline State</span>
                      {m.before || '—'}
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 text-emerald-800 dark:text-emerald-300 text-[11px] overflow-hidden truncate">
                      <span className="font-bold block text-[9.5px] uppercase text-emerald-500">Proposed Mutation</span>
                      {m.after || '—'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: POST-MEETING STAGED PR SANDBOX ─────────────────────────── */}
      {activeTab === 'staging' && (
        <div className="flex flex-col gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 flex items-center justify-center shrink-0">
                  <GitPullRequest size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                      Post-Meeting Staged PR Sandbox
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200">
                      Pillar 3 Isolated Branch
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Branch: <code className="font-mono text-violet-600 font-bold">{session.activePrBranchId || 'No active PR branch'}</code>
                  </p>
                </div>
              </div>

              {session.activePrBranchId && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onPointerDown={handleCommitPr}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <CheckCircle2 size={13} />
                    <span>Commit All Decisions & Merge</span>
                  </button>
                  <button
                    type="button"
                    onPointerDown={handleRejectPr}
                    className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer border border-rose-200 dark:border-rose-800"
                  >
                    <span>Discard</span>
                  </button>
                </div>
              )}
            </div>

            {session.activePrBranchId ? (
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  Staged Mutations Awaiting Executive Sign-Off ({session.pendingMutations.length}):
                </div>
                <div className="flex flex-col gap-2">
                  {session.pendingMutations.map((mut, idx) => (
                    <div
                      key={mut.id || idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-xs flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-2 h-2 rounded-xs bg-violet-500 shrink-0" />
                        <span className="font-bold text-slate-900 dark:text-zinc-100 uppercase text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-zinc-700">
                          {mut.targetApp}
                        </span>
                        <span className="text-slate-700 dark:text-zinc-300 truncate">
                          {mut.description}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {mut.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-500">
                No active meeting PR branch. Ingest in-meeting decisions to automatically bundle staged mutations.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
