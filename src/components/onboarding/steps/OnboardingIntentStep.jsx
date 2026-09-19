import React, { useState } from 'react';
import { ArrowRight, FolderGit2, Search, CheckSquare, Edit3 } from 'lucide-react';
import { RegaarderAiIcon } from '../../RegaarderProductIcons';
import RegaarderBrandIcon from '../../RegaarderBrandIcon';

const INTENT_CARDS = [
  {
    id: 'new',
    title: 'Start something new',
    description: 'Create a doc, sheet, or presentation canvas from scratch.',
    icon: RegaarderAiIcon,
    badgeColor: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50'
  },
  {
    id: 'organize',
    title: 'Organize existing work',
    description: 'Ingest and index your docs, files, and project context.',
    icon: FolderGit2,
    badgeColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50'
  },
  {
    id: 'analyze',
    title: 'Research or analyze',
    description: 'Uncover insights, search memory, and analyze data with Orb.',
    icon: Search,
    badgeColor: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50'
  },
  {
    id: 'plan',
    title: 'Plan and execute',
    description: 'Track deliverables, manage sprint tasks, and align schedules.',
    icon: CheckSquare,
    badgeColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50'
  }
];

export default function OnboardingIntentStep({ onSelectIntent, onSkip }) {
  const [selectedId, setSelectedId] = useState('new');
  const [customText, setCustomText] = useState('');

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (customText.trim()) {
      onSelectIntent('custom', customText.trim());
    } else {
      onSelectIntent(selectedId, '');
    }
  };

  const handleCardClick = (id) => {
    setSelectedId(id);
    setCustomText('');
    onSelectIntent(id, '');
  };

  return (
    <div className="relative w-full h-full min-h-[580px] flex flex-col justify-between p-8 sm:p-12 select-none animate-in fade-in duration-300">
      {/* Header with Regaarder Mark */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2.5">
          <RegaarderBrandIcon size={20} className="text-slate-900 dark:text-zinc-100" />
          <span className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-zinc-100 font-sans">
            Regaarder
          </span>
        </div>
      </div>

      {/* Main Intent Form */}
      <div className="max-w-2xl w-full mx-auto my-auto py-4">
        <div className="text-center mb-8">
          <h1 className="text-[28px] sm:text-[32px] font-semibold text-slate-900 dark:text-zinc-100 tracking-tight leading-tight mb-2.5">
            What are you working on?
          </h1>
          <p className="text-[14px] text-slate-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            Choose how you'd like to begin. Regaarder will activate the exact tools, memory, and workspace you need.
          </p>
        </div>

        {/* 2x2 Grid of Intent Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
          {INTENT_CARDS.map((card) => {
            const Icon = card.icon;
            const isSelected = selectedId === card.id && !customText.trim();
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleCardClick(card.id)}
                className={`flex items-start gap-4 p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer group ${
                  isSelected
                    ? 'border-violet-500/80 bg-violet-50/50 dark:bg-violet-950/20 shadow-[0_2px_12px_rgba(139,92,246,0.12)] ring-1 ring-violet-500/30'
                    : 'border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white/70 dark:bg-zinc-900/50 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30'
                }`}
              >
                <div className={`p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-105 ${card.badgeColor}`}>
                  <Icon size={18} strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-[14px] font-semibold text-slate-900 dark:text-zinc-100 tracking-tight mb-1">
                    {card.title}
                  </h2>
                  <p className="text-[12px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Free-text input row */}
        <form onSubmit={handleSubmit} className="relative w-full">
          <div className="relative flex items-center">
            <div className="absolute left-4 text-slate-400 dark:text-zinc-500">
              <Edit3 size={15} />
            </div>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Or describe your project in your own words..."
              className="w-full h-12 pl-11 pr-12 text-[13.5px] rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 dark:focus:border-violet-400 focus:ring-1 focus:ring-violet-500/30 transition-all shadow-2xs"
            />
            <button
              type="submit"
              disabled={!customText.trim() && !selectedId}
              className={`absolute right-2.5 p-2 rounded-xl text-white transition-all cursor-pointer ${
                customText.trim()
                  ? 'bg-violet-600 hover:bg-violet-700 shadow-xs active:scale-95'
                  : 'bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 hover:bg-violet-600 hover:text-white'
              }`}
              title="Continue"
            >
              <ArrowRight size={15} strokeWidth={2} />
            </button>
          </div>
        </form>
      </div>

      {/* Footer Link */}
      <div className="flex items-center justify-between w-full pt-4">
        <button
          type="button"
          onClick={onSkip}
          className="text-[12px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
