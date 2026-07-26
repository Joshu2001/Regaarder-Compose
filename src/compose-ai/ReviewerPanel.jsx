/**
 * ReviewerPanel.jsx
 *
 * Holistic document review: animated score ring (0–10), editorial
 * summary, Strengths list, and Areas to Improve list.
 * Score counts up from 0 with smooth animation.
 */
import React, { useEffect, useState } from 'react';
import { Star, Loader2, TrendingUp, TrendingDown } from 'lucide-react';

const scoreColor = (s) => s >= 8 ? '#10b981' : s >= 6 ? '#f59e0b' : '#ef4444';

const ScoreRing = ({ score }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let n = 0;
    const t = setInterval(() => {
      n = Math.min(+(n + 0.15).toFixed(1), score);
      setDisplay(+(n).toFixed(1));
      if (n >= score) clearInterval(t);
    }, 18);
    return () => clearInterval(t);
  }, [score]);

  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (display / 10) * circ;
  const color  = scoreColor(score);

  return (
    <div className="flex flex-col items-center py-6">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} fill="none" stroke="#f1f5f9" strokeWidth="7" className="dark:stroke-zinc-800" />
          <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="7"
            strokeLinecap="round" strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.04s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[22px] font-bold text-slate-800 dark:text-zinc-100 leading-none">{display}</span>
          <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium mt-0.5">/ 10</span>
        </div>
      </div>
      <p className="text-[12px] text-slate-500 dark:text-zinc-400 font-medium mt-2">Review Score</p>
    </div>
  );
};

export const ReviewerPanel = ({ reviewData, isLoading, onRunReview }) => {
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6">
        <Loader2 size={20} className="text-sky-500 animate-spin" />
        <p className="text-[12px] text-slate-500 dark:text-zinc-400">Reviewer Agent is evaluating…</p>
        <p className="text-[11px] text-slate-400 dark:text-zinc-500 text-center max-w-[200px]">
          Assessing structure, persuasiveness, evidence quality, and reader engagement.
        </p>
      </div>
    );
  }

  if (!reviewData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950/40 flex items-center justify-center">
          <Star size={24} className="text-sky-500" />
        </div>
        <div>
          <h3 className="text-[14px] font-semibold text-slate-800 dark:text-zinc-100 mb-1.5">Document Reviewer</h3>
          <p className="text-[12px] text-slate-500 dark:text-zinc-400 leading-relaxed max-w-[210px] mx-auto">
            Get editorial-quality feedback on structure, persuasiveness, argument strength, and writing quality.
          </p>
        </div>
        <button type="button" onClick={onRunReview}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-[13px] font-semibold rounded-xl transition-all hover:-translate-y-0.5 active:scale-95 shadow-sm">
          <Star size={14} /> Review Document
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto thin-scrollbar">
      <ScoreRing score={reviewData.score} />

      <div className="px-4 pb-6 flex flex-col gap-5">
        {/* Editorial summary */}
        {reviewData.summary && (
          <p className="text-[12.5px] text-slate-600 dark:text-zinc-300 leading-relaxed italic border-l-2 border-slate-200 dark:border-zinc-700 pl-3">
            {reviewData.summary}
          </p>
        )}

        {/* Strengths */}
        {reviewData.strengths?.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <TrendingUp size={12} /> Strengths
            </p>
            <ul className="flex flex-col gap-2">
              {reviewData.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-[12px] text-slate-700 dark:text-zinc-300">
                  <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weaknesses */}
        {reviewData.weaknesses?.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <TrendingDown size={12} /> Areas to Improve
            </p>
            <ul className="flex flex-col gap-2">
              {reviewData.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-[12px] text-slate-700 dark:text-zinc-300">
                  <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button type="button" onClick={onRunReview}
          className="w-full py-2 text-[11.5px] text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors">
          Re-evaluate document
        </button>
      </div>
    </div>
  );
};
