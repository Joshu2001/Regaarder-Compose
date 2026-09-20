import React, { useState } from 'react';
import { ArrowRight, FolderGit2, CheckSquare, Edit3, Check } from 'lucide-react';
import { RoomIcon, ComposeIcon, MemoryIcon } from '../../RegaarderProductIcons';
import RegaarderBrandIcon from '../../RegaarderBrandIcon';
import { OUTCOME_PATHS, inferWorkflowFromText } from '../../../services/intentInferenceService';

const ICON_MAP = {
  ComposeIcon: ComposeIcon,
  FolderGit2: FolderGit2,
  CheckSquare: CheckSquare,
  MemoryIcon: MemoryIcon,
  RoomIcon: RoomIcon
};

export default function OnboardingIntentStep({ onSelectIntent, onSkip }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [customText, setCustomText] = useState('');
  const [isInferring, setIsInferring] = useState(false);

  // Toggle multi-select intent (cap at 3 selections)
  const handleToggleIntent = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), id]; // keep newest 3 selections
      }
      return [...prev, id];
    });
  };

  // Handle direct submission (either from clicking Continue or pressing Enter)
  const handleProceed = (e) => {
    if (e) e.preventDefault();
    const query = customText.trim();

    // If free-text was typed, use natural language inference
    if (query) {
      setIsInferring(true);
      setTimeout(() => {
        const inferredAction = inferWorkflowFromText(query);
        setIsInferring(false);
        onSelectIntent('inferred', query, inferredAction);
      }, 400);
      return;
    }

    // Otherwise, use the selected intent categories
    if (selectedIds.length > 0) {
      onSelectIntent(selectedIds, '');
    }
  };

  const hasValidSelection = selectedIds.length > 0 || customText.trim().length > 0;

  return (
    <div className="relative w-full h-full min-h-[560px] flex flex-col justify-between p-6 sm:p-9 lg:p-11 select-none animate-in fade-in duration-300">
      {/* Top Header Bar with Stripe-inspired Progress indicator */}
      <div className="flex items-center justify-between w-full pb-3">
        <div className="flex items-center gap-2.5">
          <RegaarderBrandIcon size={22} className="text-slate-900 dark:text-zinc-100" />
          <span className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-zinc-100 font-sans">
            Regaarder
          </span>
        </div>

        {/* Minimal Progress Bar (Stripe-inspired rounded pill) */}
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-violet-600 dark:bg-violet-500 rounded-full transition-all duration-500" />
          </div>
        </div>
      </div>

      {/* Main Core Stage */}
      <div className="w-full max-w-3xl mx-auto my-auto py-2">
        {/* Stripe-style crisp, executive typography: Bold question + inline subtitle */}
        <div className="mb-7">
          <h1 className="text-[22px] sm:text-[25px] font-semibold text-slate-900 dark:text-zinc-100 tracking-tight leading-snug inline">
            What do you need to get started?{' '}
          </h1>
          <span className="text-[15px] text-slate-500 dark:text-zinc-400 font-normal leading-relaxed">
            You can always adjust your workspaces and tools later.
          </span>
        </div>

        {/* Stripe-style 2-Column Responsive Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-6">
          {OUTCOME_PATHS.map((item) => {
            const isChecked = selectedIds.includes(item.id);
            const IconComponent = ICON_MAP[item.iconName] || ComposeIcon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleToggleIntent(item.id)}
                className={`relative flex items-center justify-between p-3.5 sm:p-4 rounded-xl text-left transition-all duration-150 cursor-pointer border group ${
                  isChecked
                    ? 'border-violet-600 dark:border-violet-500 bg-violet-50/50 dark:bg-violet-950/30 ring-1 ring-violet-600/30 shadow-xs'
                    : 'border-slate-200/90 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-850/50 hover:bg-slate-100/70 dark:hover:bg-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                {/* Left side: Checkbox + Icon + Label & Subtitle */}
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  {/* Stripe-style rounded checkbox */}
                  <div
                    className={`w-4.5 h-4.5 rounded-[5px] flex items-center justify-center shrink-0 transition-all ${
                      isChecked
                        ? 'bg-violet-600 border border-violet-600 text-white shadow-2xs'
                        : 'border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 group-hover:border-slate-400 dark:group-hover:border-zinc-500'
                    }`}
                  >
                    {isChecked && <Check size={11} strokeWidth={3.2} />}
                  </div>

                  {/* Micro Accent Icon */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isChecked
                        ? 'text-violet-600 dark:text-violet-300 bg-violet-100 dark:bg-violet-900/50'
                        : 'text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60 group-hover:text-slate-700 dark:group-hover:text-zinc-200'
                    }`}
                  >
                    <IconComponent size={14} strokeWidth={1.75} />
                  </div>

                  {/* Content title and brief helper */}
                  <div className="min-w-0 flex flex-col">
                    <span
                      className={`text-[13.5px] font-semibold tracking-tight transition-colors truncate ${
                        isChecked
                          ? 'text-violet-950 dark:text-violet-100'
                          : 'text-slate-800 dark:text-zinc-200'
                      }`}
                    >
                      {item.title}
                    </span>
                    <span className="text-[11.5px] text-slate-500 dark:text-zinc-400 line-clamp-1">
                      {item.description}
                    </span>
                  </div>
                </div>

                {/* Right side: Subtle micro category pill */}
                <div className="shrink-0 hidden md:block">
                  <span
                    className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border transition-colors ${
                      isChecked
                        ? 'bg-violet-100/90 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800/60'
                        : 'bg-white dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border-slate-200/80 dark:border-zinc-700/70'
                    }`}
                  >
                    {item.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* First-Class Natural Language Input Box */}
        <form onSubmit={handleProceed} className="relative w-full">
          <div className="relative flex items-center rounded-xl bg-slate-50/70 dark:bg-zinc-850/60 border border-slate-200/90 dark:border-zinc-800 focus-within:bg-white dark:focus-within:bg-zinc-900 focus-within:border-violet-500 dark:focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all">
            <div className="pl-3.5 pr-2.5 text-slate-400 dark:text-zinc-500 flex items-center">
              <Edit3 size={15} />
            </div>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Or describe in your own words (e.g., 'Organize product specs and launch our new beta')..."
              className="w-full h-11 text-[13px] text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 bg-transparent outline-none pr-4"
            />
          </div>
        </form>
      </div>

      {/* Stripe-inspired Bottom Control Bar */}
      <div className="flex items-center justify-between w-full pt-4 mt-2 border-t border-slate-100 dark:border-zinc-800">
        <button
          type="button"
          onClick={onSkip}
          className="text-[13px] font-medium text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
        >
          Skip for now
        </button>

        <div className="flex items-center gap-3">
          <span className="text-[12px] text-slate-400 dark:text-zinc-500 hidden sm:inline">
            {selectedIds.length > 0
              ? `${selectedIds.length} of 3 selected`
              : 'Select 1–3 options'}
          </span>

          <button
            type="button"
            onClick={onSkip}
            className="px-4 py-2 rounded-xl text-[13px] font-medium text-slate-700 dark:text-zinc-200 bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 border border-slate-200/60 dark:border-zinc-700 transition-all cursor-pointer"
          >
            Skip
          </button>

          <button
            type="button"
            onClick={handleProceed}
            disabled={!hasValidSelection || isInferring}
            className={`px-5 py-2 rounded-xl text-[13px] font-semibold transition-all flex items-center gap-1.5 shadow-sm ${
              hasValidSelection
                ? 'bg-violet-600 hover:bg-violet-700 text-white active:scale-[0.98] cursor-pointer'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 cursor-not-allowed opacity-60'
            }`}
          >
            {isInferring ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Preparing...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight size={13} strokeWidth={2.5} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
