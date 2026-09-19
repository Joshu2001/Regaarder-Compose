import React, { useState } from 'react';
import { Search, ArrowRight, Globe, Database, Sparkles, ChevronLeft, ArrowUpRight } from 'lucide-react';
import RegaarderBrandIcon from '../../RegaarderBrandIcon';
import { RegaarderAiIcon } from '../../RegaarderProductIcons';

const RESEARCH_SUGGESTIONS = [
  'Compare top 3 market competitors and pricing',
  'Summarize recent AI hardware inference developments',
  'Analyze customer retention trends across cohort data',
  'Extract key takeaways from our uploaded research docs'
];

export default function OnboardingAnalyzeStep({ onBack, onComplete }) {
  const [query, setQuery] = useState('');
  const [sources, setSources] = useState('all'); // 'all' | 'web' | 'memory'

  const handleLaunchResearch = (chosenQuery = query) => {
    const finalQuery = (chosenQuery || '').trim();
    onComplete({
      type: 'action',
      destination: 'browser',
      query: finalQuery,
      sourceMode: sources,
      toast: finalQuery ? `Orb Research started: "${finalQuery}"` : 'Regaarder Research activated'
    });
  };

  return (
    <div className="relative w-full h-full min-h-[580px] flex flex-col justify-between p-8 sm:p-12 select-none animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-2">
          <RegaarderBrandIcon size={18} className="text-slate-900 dark:text-zinc-100" />
          <span className="text-[13px] font-bold text-slate-900 dark:text-zinc-100">Orb Deep Research</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-xl w-full mx-auto my-auto py-2 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/50 border border-sky-200/60 dark:border-sky-800/40 text-sky-700 dark:text-sky-300 text-[11.5px] font-semibold mb-4">
          <RegaarderAiIcon size={13} />
          <span>Multi-Source Intelligence & Synthesis</span>
        </div>

        <h2 className="text-[26px] sm:text-[30px] font-semibold text-slate-900 dark:text-zinc-100 tracking-tight leading-tight mb-2.5">
          Research anything across web & memory
        </h2>
        <p className="text-[13.5px] text-slate-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed mb-6">
          Ask complex research questions. Regaarder Orb browses live sources and cross-examines your private workspace memory to compile cited reports.
        </p>

        {/* Query Input Box */}
        <div className="relative mb-4">
          <div className="relative flex items-center">
            <div className="absolute left-4 text-sky-600 dark:text-sky-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleLaunchResearch();
                }
              }}
              placeholder="What would you like to investigate or analyze?"
              className="w-full h-13 pl-11 pr-28 text-[13.5px] rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-sky-500 dark:focus:border-sky-400 focus:ring-1 focus:ring-sky-500/30 transition-all shadow-xs"
            />
            <button
              type="button"
              onClick={() => handleLaunchResearch()}
              className="absolute right-2 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-[12.5px] font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>Analyze</span>
              <ArrowRight size={13} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Source Scope Selector */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-[11.5px] text-slate-400 dark:text-zinc-500 mr-1">Search Scope:</span>
          {[
            { id: 'all', label: 'Web + Memory', icon: Sparkles },
            { id: 'web', label: 'Live Web Only', icon: Globe },
            { id: 'memory', label: 'Workspace Memory', icon: Database }
          ].map((item) => {
            const isSel = sources === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSources(item.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11.5px] font-medium transition-all cursor-pointer ${
                  isSel
                    ? 'bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border border-sky-300/60 dark:border-sky-800'
                    : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200/70 dark:border-zinc-700/60 hover:bg-slate-50'
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="text-left mb-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-2">
            Suggested Research Prompts
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {RESEARCH_SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleLaunchResearch(sug)}
                className="p-2.5 rounded-xl border border-slate-200/70 dark:border-white/5 hover:border-sky-300 dark:hover:border-sky-800/60 bg-white/70 dark:bg-zinc-900/50 hover:bg-sky-50/40 dark:hover:bg-sky-950/20 text-left text-[12px] text-slate-700 dark:text-zinc-300 leading-snug transition-all cursor-pointer flex items-center justify-between group"
              >
                <span className="line-clamp-1">{sug}</span>
                <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 text-sky-600 dark:text-sky-400 transition-opacity shrink-0 ml-1.5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="flex items-center justify-between w-full pt-4 border-t border-slate-100 dark:border-white/5">
        <span className="text-[11.5px] text-slate-400 dark:text-zinc-500">
          Powered by Orb Multi-Model Intelligence & Local Semantic Retrieval.
        </span>
        <button
          type="button"
          onClick={() => handleLaunchResearch()}
          className="inline-flex items-center gap-1 text-[11.5px] font-medium text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
        >
          <span>Open Full Research Surface</span>
          <ArrowUpRight size={12} />
        </button>
      </div>
    </div>
  );
}
