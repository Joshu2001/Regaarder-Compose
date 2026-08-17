/**
 * WritingDNAPanel.jsx
 *
 * Compose's flagship AI capability — the Writing DNA Agent.
 *
 * Displays the user's writing identity profile with:
 *   • DNA Mode selector (Mirror Me / Improve Me / Best Version / Blend)
 *   • Blend ratio slider (My Style % ↔ Other %)
 *   • Voice profile with animated metric bars
 *   • Writing Evolution timeline (monthly snapshots)
 *   • "Build My Profile" CTA when no profile exists
 */
import React, { useEffect, useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

const DNA_MODES = [
  {
    key:   'mirror',
    label: 'Mirror Me',
    desc:  'Generate content nearly indistinguishable from your natural writing',
  },
  {
    key:   'improve',
    label: 'Improve Me',
    desc:  'Preserve your voice while improving clarity, grammar, and structure',
  },
  {
    key:   'best',
    label: 'Best Version of Me',
    desc:  'Learn from your strongest documents and elevate future writing',
  },
  {
    key:   'blend',
    label: 'Blend',
    desc:  'Mix writing identities with custom ratios',
  },
];

// Animated metric bar (fades in from 0 on mount)
const MetricBar = ({ label, value, color = '#6366f1' }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(Math.round(value * 100)), 100);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1">
        <span className="text-slate-500 dark:text-zinc-400">{label}</span>
        <span className="font-semibold text-slate-700 dark:text-zinc-200">{Math.round(value * 100)}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${width}%`, backgroundColor: color }} />
      </div>
    </div>
  );
};

// Evolution row: shows "before → after" comparison for a metric
const EvolutionRow = ({ label, before, after, unit = '' }) => {
  const improved = after < before; // lower is better for sentence length / passive voice
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className="text-slate-500 dark:text-zinc-400 w-[90px] shrink-0">{label}</span>
      <span className="text-slate-400 dark:text-zinc-500 font-mono">{before}{unit}</span>
      <span className="text-slate-300 dark:text-zinc-600">→</span>
      <span className={`font-semibold font-mono ${improved ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
        {after}{unit}
      </span>
      {improved && <span className="text-emerald-500 text-[10px]">↓ improved</span>}
    </div>
  );
};

export const WritingDNAPanel = ({ dnaProfile, isLoading, onBuildProfile, onSetMode, currentMode }) => {
  const [activeMode, setActiveMode] = useState(currentMode || 'mirror');
  const [blend, setBlend] = useState(70);

  const handleModeSelect = (mode) => {
    setActiveMode(mode);
    onSetMode?.(mode, mode === 'blend' ? { myStyle: blend, other: 100 - blend } : null);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <Loader2 size={20} className="text-indigo-500 animate-spin" />
        <p className="text-[13px] text-slate-700 dark:text-zinc-200 font-semibold">Building your Writing DNA…</p>
        <p className="text-[11.5px] text-slate-400 dark:text-zinc-500 max-w-[200px] leading-relaxed">
          Analyzing vocabulary, rhythm, reasoning patterns, and communication style.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto thin-scrollbar p-4 gap-5">

      {/* DNA Mode selector */}
      <div>
        <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2.5">DNA Mode</p>
        <div className="flex flex-col gap-1.5">
          {DNA_MODES.map(m => (
            <button
              key={m.key}
              type="button"
              onClick={() => handleModeSelect(m.key)}
              className={`flex items-start gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                activeMode === m.key
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800'
                  : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800'
              }`}
            >
              {/* Radio indicator */}
              <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                activeMode === m.key ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300 dark:border-zinc-600'
              }`}>
                {activeMode === m.key && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <div className="min-w-0">
                <p className={`text-[12px] font-semibold ${activeMode === m.key ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-zinc-200'}`}>
                  {m.label}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5 leading-snug">{m.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Blend ratio slider */}
      {activeMode === 'blend' && (
        <div className="bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 p-3.5">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mb-3">Style Blend Ratio</p>
          <input
            type="range" min={0} max={100} value={blend}
            onChange={e => {
              const v = Number(e.target.value);
              setBlend(v);
              onSetMode?.('blend', { myStyle: v, other: 100 - v });
            }}
            className="w-full h-1.5 appearance-none bg-slate-200 dark:bg-zinc-700 rounded-full cursor-pointer"
          />
          <div className="flex justify-between text-[10.5px] mt-1.5">
            <span className="text-indigo-600 dark:text-indigo-400 font-medium">My Style {blend}%</span>
            <span className="text-slate-400 dark:text-zinc-500">Other {100 - blend}%</span>
          </div>
        </div>
      )}

      {/* Profile display */}
      {dnaProfile ? (
        <>
          {/* Voice summary */}
          <div>
            <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2.5">Voice Profile</p>
            <div className="bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/50 p-3.5 mb-3.5">
              <p className="text-[12.5px] text-indigo-800 dark:text-indigo-300 leading-relaxed italic">
                "{dnaProfile.overallVoice || 'Profile analysis complete. Your voice has been captured.'}"
              </p>
            </div>

            {/* Metric bars */}
            <div className="flex flex-col gap-3">
              <MetricBar label="Technical Depth"   value={dnaProfile.vocabulary?.technicalDepth  ?? 0} color="#6366f1" />
              <MetricBar label="Lexical Diversity"  value={dnaProfile.vocabulary?.lexicalDiversity ?? 0} color="#8b5cf6" />
              <MetricBar label="Formality"          value={dnaProfile.style?.formality            ?? 0} color="#0ea5e9" />
              <MetricBar label="Confidence"         value={dnaProfile.style?.confidence           ?? 0} color="#10b981" />
            </div>
          </div>

          {/* Writing Evolution timeline */}
          {dnaProfile.evolution?.length >= 2 && (
            <div>
              <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2.5">
                Writing Evolution
              </p>
              <div className="bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 p-3.5 flex flex-col gap-2.5">
                <EvolutionRow
                  label="Sentence Length"
                  before={dnaProfile.evolution[0].sentenceLength}
                  after={dnaProfile.evolution[dnaProfile.evolution.length - 1].sentenceLength}
                  unit=" words"
                />
                <EvolutionRow
                  label="Passive Voice"
                  before={Math.round(dnaProfile.evolution[0].passiveVoice * 100)}
                  after={Math.round(dnaProfile.evolution[dnaProfile.evolution.length - 1].passiveVoice * 100)}
                  unit="%"
                />
                <EvolutionRow
                  label="Reading Level"
                  before={dnaProfile.evolution[0].readability}
                  after={dnaProfile.evolution[dnaProfile.evolution.length - 1].readability}
                  unit=" grade"
                />
              </div>
              <p className="text-[10.5px] text-slate-400 dark:text-zinc-500 mt-2 text-center">
                {dnaProfile.evolution.length} snapshot{dnaProfile.evolution.length !== 1 ? 's' : ''} recorded •{' '}
                Last updated {dnaProfile.lastUpdated ? new Date(dnaProfile.lastUpdated).toLocaleDateString() : 'unknown'}
              </p>
            </div>
          )}

          <button type="button" onClick={onBuildProfile}
            className="w-full py-2 text-[11.5px] text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors">
            Re-analyze to update profile
          </button>
        </>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
            <Sparkles size={24} className="text-indigo-500" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-slate-800 dark:text-zinc-100 mb-1.5">No DNA Profile Yet</p>
            <p className="text-[12px] text-slate-500 dark:text-zinc-400 max-w-[210px] leading-relaxed">
              Analyze this document to build your unique writing identity — vocabulary, rhythm, reasoning, and communication style.
            </p>
          </div>
          <button type="button" onClick={onBuildProfile}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-semibold rounded-xl transition-all hover:-translate-y-0.5 active:scale-95 shadow-sm">
            <Sparkles size={14} /> Build My Writing DNA
          </button>
        </div>
      )}
    </div>
  );
};
