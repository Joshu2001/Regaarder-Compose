/**
 * DocumentHealthPanel.jsx
 *
 * The AI Orchestrator's default view. Shows an overall document health
 * score (animated ring) and six category rows. Clicking any category
 * navigates into that agent's detailed suggestion view.
 *
 * The animated score ring and bar counts up from 0 — a deliberate
 * micro-interaction that makes results feel computed, not fabricated.
 */
import React, { useEffect, useState } from 'react';
import { Activity, ChevronRight, Loader2, Zap } from 'lucide-react';

const CATEGORIES = [
  { key: 'grammar',     label: 'Grammar',     agentId: 'editor' },
  { key: 'logic',       label: 'Logic',       agentId: 'logic' },
  { key: 'formatting',  label: 'Formatting',  agentId: 'designer' },
  { key: 'evidence',    label: 'Evidence',    agentId: 'research' },
  { key: 'readability', label: 'Readability', agentId: 'editor' },
  { key: 'consistency', label: 'Consistency', agentId: 'consistency' },
];

const scoreColor = (s) => s >= 90 ? '#10b981' : s >= 75 ? '#f59e0b' : '#ef4444';
const scoreEmoji = (s) => s >= 90 ? '🟢' : s >= 75 ? '🟡' : '🔴';

// Animated progress bar — transitions from 0 to target width over 700ms
const ScoreBar = ({ score }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(score), 80);
    return () => clearTimeout(t);
  }, [score]);
  return (
    <div className="flex-1 h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${width}%`, backgroundColor: scoreColor(score) }}
      />
    </div>
  );
};

// SVG ring that counts up to the overall score
const OverallRing = ({ score }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let n = 0;
    const t = setInterval(() => {
      n = Math.min(n + 2, score);
      setDisplay(n);
      if (n >= score) clearInterval(t);
    }, 12);
    return () => clearInterval(t);
  }, [score]);

  const r = 30;
  const circ = 2 * Math.PI * r;
  const offset = circ - (display / 100) * circ;
  const color = scoreColor(score);

  return (
    <div className="flex flex-col items-center py-5">
      <div className="relative w-[88px] h-[88px]">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={r} fill="none" stroke="#f1f5f9" strokeWidth="6.5" className="dark:stroke-zinc-800" />
          <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6.5"
            strokeLinecap="round" strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.04s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[20px] font-bold text-slate-800 dark:text-zinc-100 leading-none">{display}</span>
          <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-medium mt-0.5">/ 100</span>
        </div>
      </div>
      <p className="text-[12px] text-slate-500 dark:text-zinc-400 font-medium mt-1">Document Health</p>
    </div>
  );
};

export const DocumentHealthPanel = ({ healthData, isLoading, onAnalyze, onSelectAgent }) => {
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <Loader2 size={22} className="text-indigo-500 animate-spin" />
        <p className="text-[13px] text-slate-700 dark:text-zinc-200 font-semibold">Analyzing document…</p>
        <p className="text-[11px] text-slate-400 dark:text-zinc-500">Running 6 quality checks in parallel</p>
      </div>
    );
  }

  if (!healthData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
          <Activity size={24} className="text-indigo-500" />
        </div>
        <div>
          <h3 className="text-[14px] font-semibold text-slate-800 dark:text-zinc-100 mb-1.5">Document Health</h3>
          <p className="text-[12px] text-slate-500 dark:text-zinc-400 leading-relaxed max-w-[210px] mx-auto">
            One tap runs 6 quality checks — grammar, logic, formatting, evidence, readability, and consistency — in parallel.
          </p>
        </div>
        <button
          type="button"
          onClick={onAnalyze}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-semibold rounded-xl transition-all hover:-translate-y-0.5 active:scale-95 shadow-sm"
        >
          <Zap size={14} /> Analyze Document
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto thin-scrollbar">
      <OverallRing score={healthData.overall} />

      <div className="px-4 pb-4 flex flex-col gap-1.5">
        {CATEGORIES.map((cat, idx) => {
          const data  = healthData[cat.key] || { score: 0, issues: [] };
          const score = data.score;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => onSelectAgent(cat.agentId)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:bg-slate-50 dark:hover:bg-zinc-800/60 hover:border-slate-200 dark:hover:border-zinc-700 transition-all group"
              style={{ animationDelay: `${idx * 55}ms` }}
            >
              <span className="text-[13px] shrink-0">{scoreEmoji(score)}</span>
              <span className="text-[12.5px] font-medium text-slate-700 dark:text-zinc-300 w-[88px] text-left shrink-0">{cat.label}</span>
              <ScoreBar score={score} />
              <span className="text-[12px] font-semibold text-slate-700 dark:text-zinc-200 w-9 text-right shrink-0">{score}%</span>
              <ChevronRight size={13} className="text-slate-300 dark:text-zinc-600 group-hover:text-slate-500 dark:group-hover:text-zinc-400 shrink-0 transition-colors" />
            </button>
          );
        })}
      </div>

      <div className="px-4 pb-4">
        <button type="button" onClick={onAnalyze}
          className="w-full py-1.5 text-[11.5px] text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors">
          Re-analyze document
        </button>
      </div>
    </div>
  );
};
