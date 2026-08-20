import React, { useState, useMemo } from 'react';
import { 
  Sparkles, AlertTriangle, CheckCircle2, Clock, ArrowRight,
  TrendingUp, HelpCircle, FileText, Table, Presentation, Video,
  CheckSquare, ShieldAlert, Plus, Layers, Search
} from 'lucide-react';
import { RegaarderProductIcon } from '../RegaarderProductIcons';
import { synthesizeStrategicDecision } from '../../services/orbKnowledgeGraphService';

export default function OrbDecideSynthesizer({
  initialQuestion = '',
  entities = [],
  edges = [],
  onNavigateToWorkspace,
  onAddActionToTasks
}) {
  const [question, setQuestion] = useState(initialQuestion || 'What should I know before making the Q3 Nvidia GPU and TSMC capacity decision?');
  const [activeQuery, setActiveQuery] = useState(initialQuestion || 'What should I know before making the Q3 Nvidia GPU and TSMC capacity decision?');

  const synthesis = useMemo(() => {
    return synthesizeStrategicDecision(activeQuery, { entities, edges });
  }, [activeQuery, entities, edges]);

  const handleQuerySubmit = (e) => {
    e?.preventDefault();
    if (question.trim()) {
      setActiveQuery(question.trim());
    }
  };

  const samplePrompts = [
    'What should I know before expanding Nvidia GPU commitments?',
    'What are the risks of Taiwan semiconductor single-sourcing?',
    'What evidence supports our Q3 revenue forecast of $48.2B?',
    'What decisions resulted from the Executive Sync on packaging bottlenecks?'
  ];

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-slate-50/50 dark:bg-zinc-900/30">
      {/* ── Query Bar Header ── */}
      <div className="p-6 border-b border-slate-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shrink-0">
        <form onSubmit={handleQuerySubmit} className="flex gap-2 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <Sparkles size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-600 dark:text-violet-400" />
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a strategic decision question across all workspace intelligence..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 shadow-xs"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#7C5ACF] text-white text-xs font-semibold hover:bg-[#6c48c5] transition-colors shrink-0 shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Synthesize</span>
            <ArrowRight size={13} />
          </button>
        </form>

        {/* Quick Sample Prompts */}
        <div className="flex items-center gap-2 mt-3 max-w-4xl mx-auto overflow-x-auto thin-scrollbar pb-1">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider shrink-0">
            Quick Inquiries:
          </span>
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuestion(prompt);
                setActiveQuery(prompt);
              }}
              className="px-2.5 py-1 rounded-lg text-xs border border-slate-200/80 dark:border-zinc-700/80 bg-white/90 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-300 dark:hover:border-violet-700 whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* ── Synthesis Content Dashboard ── */}
      <div className="flex-1 overflow-y-auto p-8 thin-scrollbar">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Executive Summary Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-50/90 via-white to-slate-50/80 dark:from-violet-950/30 dark:via-zinc-900/90 dark:to-zinc-900/60 border border-violet-100 dark:border-violet-900/50 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider mb-1">
                  <Sparkles size={14} />
                  <span>Strategic Decision Synthesis</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100">
                  {synthesis.topic}
                </h2>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {synthesis.status}
                </span>
                <span className="text-[10px] text-slate-400 font-mono mt-1">
                  {Math.round(synthesis.confidenceScore * 100)}% Cross-Workspace Alignment
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
              {synthesis.executiveSummary}
            </p>
          </div>

          {/* 2-Column Grid: Key Evidence & Contradictions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Evidence */}
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider mb-3">
                <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" />
                <span>Supporting Evidence Across Workspaces</span>
              </div>

              <div className="space-y-3 flex-1">
                {synthesis.keyEvidence.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-700/60 text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-zinc-200 mb-1">
                      <div className="w-5 h-5 rounded bg-white dark:bg-zinc-700 flex items-center justify-center text-violet-600 dark:text-violet-400">
                        <RegaarderProductIcon name={item.type} size={12} />
                      </div>
                      <span>{item.source}</span>
                    </div>
                    <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contradictions & Discrepancies */}
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-3">
                <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400" />
                <span>Detected Contradictions & Discrepancies</span>
              </div>

              <div className="space-y-3 flex-1">
                {synthesis.contradictions.map((contra, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-amber-900 dark:text-amber-300">
                        {contra.title}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-amber-200/80 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                        {contra.severity}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-zinc-300 mb-2 leading-relaxed">
                      {contra.description}
                    </p>
                    <div className="text-[11px] font-medium text-amber-800 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-900/40 p-2 rounded-lg">
                      <span className="font-bold">Recommended Resolution: </span>
                      {contra.resolution}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3-Column Grid: Dependencies, Trends & Blindspots */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Dependencies */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-zinc-100 uppercase tracking-wider mb-2.5">
                <Clock size={14} className="text-blue-500" />
                <span>Critical Path Dependencies</span>
              </div>
              <ul className="space-y-2">
                {synthesis.dependencies.map((dep, idx) => (
                  <li key={idx} className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60">
                    <div className="font-semibold text-slate-800 dark:text-zinc-200">{dep.item}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{dep.owner} • {dep.status}</div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Emerging Trends */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-zinc-100 uppercase tracking-wider mb-2.5">
                <TrendingUp size={14} className="text-violet-500" />
                <span>Signals & Velocity</span>
              </div>
              <ul className="space-y-2">
                {synthesis.emergingTrends.map((trend, idx) => (
                  <li key={idx} className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60 text-slate-600 dark:text-zinc-300 leading-relaxed">
                    {trend}
                  </li>
                ))}
              </ul>
            </div>

            {/* Missing Information */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-zinc-100 uppercase tracking-wider mb-2.5">
                <HelpCircle size={14} className="text-slate-400" />
                <span>Missing Blindspots</span>
              </div>
              <ul className="space-y-2">
                {synthesis.missingInformation.map((info, idx) => (
                  <li key={idx} className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60 text-slate-600 dark:text-zinc-300 leading-relaxed">
                    {info}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Actionable Next Steps ── */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                <CheckSquare size={15} className="text-violet-600 dark:text-violet-400" />
                <span>Recommended Action Items</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {synthesis.recommendedActions.map((act) => (
                <div
                  key={act.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80 hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                      {act.priority}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate">
                      {act.title}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate">
                      (Assignee: {act.assignee})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onAddActionToTasks && onAddActionToTasks(act)}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-700 dark:hover:text-violet-300 text-slate-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <Plus size={12} />
                    <span>Add to Tasks</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
