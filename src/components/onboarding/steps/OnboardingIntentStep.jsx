import React, { useState } from 'react';
import { ArrowRight, FolderGit2, Search, CheckSquare, Edit3 } from 'lucide-react';
import { RegaarderAiIcon, RoomIcon, ComposeIcon } from '../../RegaarderProductIcons';
import RegaarderBrandIcon from '../../RegaarderBrandIcon';
import { OUTCOME_PATHS, inferWorkflowFromText } from '../../../services/intentInferenceService';

const ICON_MAP = {
  ComposeIcon: ComposeIcon,
  FolderGit2: FolderGit2,
  CheckSquare: CheckSquare,
  Search: Search,
  RoomIcon: RoomIcon
};

export default function OnboardingIntentStep({ onSelectIntent, onSkip }) {
  const [selectedId, setSelectedId] = useState('create');
  const [customText, setCustomText] = useState('');
  const [isInferring, setIsInferring] = useState(false);

  // Handle direct free-text natural language submission
  const handleSubmitCustom = (e) => {
    if (e) e.preventDefault();
    const query = customText.trim();
    if (!query) {
      if (selectedId) {
        onSelectIntent(selectedId, '');
      }
      return;
    }

    setIsInferring(true);
    // Fast response under Doherty threshold (400ms) with visible understanding feedback
    setTimeout(() => {
      const inferredAction = inferWorkflowFromText(query);
      setIsInferring(false);
      onSelectIntent('inferred', query, inferredAction);
    }, 450);
  };

  const handleCardClick = (id) => {
    setSelectedId(id);
    onSelectIntent(id, '');
  };

  return (
    <div className="relative w-full h-full min-h-[640px] flex flex-col justify-between p-8 sm:p-10 lg:p-12 select-none animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full mb-2">
        <div className="flex items-center gap-2.5">
          <RegaarderBrandIcon size={22} className="text-slate-900 dark:text-zinc-100" />
          <span className="text-[16px] font-bold tracking-tight text-slate-900 dark:text-zinc-100 font-sans">
            Regaarder
          </span>
        </div>

        <button
          type="button"
          onClick={onSkip}
          className="text-[12.5px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
        >
          Skip for now
        </button>
      </div>

      {/* Main Core Stage */}
      <div className="w-full max-w-4xl mx-auto my-auto py-2">
        {/* Outcome-focused Question */}
        <div className="text-center mb-7">
          <h1 className="text-[28px] sm:text-[34px] font-semibold text-slate-900 dark:text-zinc-100 tracking-tight leading-tight mb-2.5">
            What would you like Regaarder to help you do?
          </h1>
          <p className="text-[14px] text-slate-500 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Tell Regaarder what you'd like to accomplish. Your workspace, tools, and context will be set up automatically.
          </p>
        </div>

        {/* First-Class Natural Language Input Box */}
        <form onSubmit={handleSubmitCustom} className="relative w-full mb-8">
          <div className="relative flex items-center shadow-xs rounded-2xl bg-white/95 dark:bg-zinc-900 border border-slate-200/90 dark:border-white/15 focus-within:border-violet-500 dark:focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all">
            <div className="pl-4 pr-3 text-slate-400 dark:text-zinc-500 flex items-center">
              <Edit3 size={17} />
            </div>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Or tell Regaarder in your own words (e.g., 'I need to launch my startup' or 'Write a proposal')..."
              className="w-full h-13 text-[14px] text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 bg-transparent outline-none pr-32"
            />
            <button
              type="submit"
              disabled={isInferring}
              className={`absolute right-2 px-4 py-2 rounded-xl text-[12.5px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                customText.trim()
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs hover:opacity-90 active:scale-95'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              {isInferring ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                  <span>Preparing...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight size={13} strokeWidth={2} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Outcome Category Cards (3 top row, 2 bottom row) */}
        <div className="space-y-3.5">
          {/* Top Row: 3 Primary Outcome Directions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {OUTCOME_PATHS.slice(0, 3).map((card) => {
              const IconComponent = ICON_MAP[card.iconName] || ComposeIcon;
              const isSelected = selectedId === card.id && !customText.trim();
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleCardClick(card.id)}
                  className={`flex flex-col justify-between p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer group min-h-[155px] ${
                    isSelected
                      ? 'border-violet-500/80 bg-violet-50/40 dark:bg-violet-950/20 shadow-xs ring-1 ring-violet-500/30'
                      : 'border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-zinc-900/60 hover:bg-slate-50/50 dark:hover:bg-zinc-850/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className={`p-2 rounded-xl shrink-0 transition-transform group-hover:scale-105 ${card.color}`}>
                        <IconComponent size={18} strokeWidth={1.8} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200/50 dark:border-white/5">
                        {card.badge}
                      </span>
                    </div>

                    <h2 className="text-[14px] font-semibold text-slate-900 dark:text-zinc-100 tracking-tight mb-1.5">
                      {card.title}
                    </h2>
                    <p className="text-[12px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="pt-3.5 mt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <span className="text-[11.5px] font-medium text-slate-400 dark:text-zinc-500 group-hover:text-slate-800 dark:group-hover:text-zinc-200 transition-colors">
                      Select
                    </span>
                    <ArrowRight size={13} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Row: 2 Secondary Outcome Directions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-w-2xl mx-auto w-full">
            {OUTCOME_PATHS.slice(3, 5).map((card) => {
              const IconComponent = ICON_MAP[card.iconName] || Search;
              const isSelected = selectedId === card.id && !customText.trim();
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleCardClick(card.id)}
                  className={`flex flex-col justify-between p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer group min-h-[155px] ${
                    isSelected
                      ? 'border-violet-500/80 bg-violet-50/40 dark:bg-violet-950/20 shadow-xs ring-1 ring-violet-500/30'
                      : 'border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-zinc-900/60 hover:bg-slate-50/50 dark:hover:bg-zinc-850/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className={`p-2 rounded-xl shrink-0 transition-transform group-hover:scale-105 ${card.color}`}>
                        <IconComponent size={18} strokeWidth={1.8} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200/50 dark:border-white/5">
                        {card.badge}
                      </span>
                    </div>

                    <h2 className="text-[14px] font-semibold text-slate-900 dark:text-zinc-100 tracking-tight mb-1.5">
                      {card.title}
                    </h2>
                    <p className="text-[12px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="pt-3.5 mt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <span className="text-[11.5px] font-medium text-slate-400 dark:text-zinc-500 group-hover:text-slate-800 dark:group-hover:text-zinc-200 transition-colors">
                      Select
                    </span>
                    <ArrowRight size={13} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Subtle Bottom Footer */}
      <div className="flex items-center justify-between w-full pt-4 mt-2 border-t border-slate-100 dark:border-white/5">
        <span className="text-[12px] text-slate-400 dark:text-zinc-500">
          Regaarder learns your goals and configures your workspace automatically.
        </span>
        <span className="text-[12px] text-slate-400 dark:text-zinc-500">
          Press Enter or choose an outcome to begin
        </span>
      </div>
    </div>
  );
}
