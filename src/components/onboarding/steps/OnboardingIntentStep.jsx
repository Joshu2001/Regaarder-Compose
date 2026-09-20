import React, { useState } from 'react';
import { ArrowRight, FolderGit2, Search, CheckSquare, Edit3, Check } from 'lucide-react';
import { RoomIcon, ComposeIcon } from '../../RegaarderProductIcons';
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
  const [selectedIds, setSelectedIds] = useState([]);
  const [customText, setCustomText] = useState('');
  const [isInferring, setIsInferring] = useState(false);

  // Toggle multi-select intent
  const handleToggleIntent = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
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
    <div className="relative w-full h-full min-h-[580px] flex flex-col justify-between p-6 sm:p-9 lg:p-10 select-none animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2.5">
          <RegaarderBrandIcon size={22} className="text-slate-900 dark:text-zinc-100" />
          <span className="text-[16px] font-bold tracking-tight text-slate-900 dark:text-zinc-100 font-sans">
            Regaarder
          </span>
        </div>

        <button
          type="button"
          onClick={onSkip}
          className="text-[12.5px] font-medium text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
        >
          Skip for now
        </button>
      </div>

      {/* Main Core Stage */}
      <div className="w-full max-w-3xl mx-auto my-auto py-2">
        {/* Outcome-focused Question & Direct Subtext */}
        <div className="text-center mb-6">
          <h1 className="text-[26px] sm:text-[32px] font-semibold text-slate-900 dark:text-zinc-100 tracking-tight leading-tight mb-2">
            What would you like Regaarder to help you do?
          </h1>
          <p className="text-[13.5px] text-slate-600 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Select what you’re trying to accomplish. Regaarder will combine the right tools and context for you.
          </p>
        </div>

        {/* Compact Selectable Rows (Multi-Select Intent Options) */}
        <div className="flex flex-col gap-2 w-full mb-5">
          {OUTCOME_PATHS.map((item) => {
            const isChecked = selectedIds.includes(item.id);
            const IconComponent = ICON_MAP[item.iconName] || ComposeIcon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleToggleIntent(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 sm:py-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer group ${
                  isChecked
                    ? 'border-violet-500/80 bg-violet-50/40 dark:bg-violet-950/20 shadow-xs ring-1 ring-violet-500/25'
                    : 'border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-zinc-900/60 hover:bg-slate-50/70 dark:hover:bg-zinc-800/40'
                }`}
              >
                {/* Left Side: Checkbox + Icon + Title + Secondary Description */}
                <div className="flex items-center gap-3.5 min-w-0 pr-3">
                  {/* Apple-style Selection Checkbox Affordance */}
                  <div
                    className={`w-4.5 h-4.5 rounded-md flex items-center justify-center shrink-0 transition-all ${
                      isChecked
                        ? 'bg-violet-600 border border-violet-600 text-white shadow-xs'
                        : 'border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 group-hover:border-slate-400 dark:group-hover:border-zinc-500'
                    }`}
                  >
                    {isChecked && <Check size={12} strokeWidth={3} />}
                  </div>

                  {/* Lightweight Accent Icon */}
                  <div
                    className={`p-1.5 rounded-lg shrink-0 transition-transform ${
                      isChecked
                        ? 'text-violet-600 dark:text-violet-400 bg-violet-100/70 dark:bg-violet-900/40'
                        : 'text-slate-500 dark:text-zinc-400 bg-slate-100/80 dark:bg-zinc-800/80 group-hover:text-slate-700 dark:group-hover:text-zinc-200'
                    }`}
                  >
                    <IconComponent size={15} strokeWidth={1.75} />
                  </div>

                  {/* Intent Title & Concise Secondary Description */}
                  <div className="min-w-0 flex flex-col sm:flex-row sm:items-baseline sm:gap-2.5">
                    <span
                      className={`text-[13.5px] font-semibold tracking-tight transition-colors ${
                        isChecked
                          ? 'text-violet-950 dark:text-violet-100'
                          : 'text-slate-900 dark:text-zinc-100'
                      }`}
                    >
                      {item.title}
                    </span>
                    <span className="text-[12px] text-slate-500 dark:text-zinc-400 truncate">
                      {item.description}
                    </span>
                  </div>
                </div>

                {/* Right Side: Category Badge */}
                <div className="shrink-0 pl-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border transition-colors ${
                      isChecked
                        ? 'bg-violet-100/80 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200/60 dark:border-violet-800/40'
                        : 'bg-slate-100/90 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 border-slate-200/60 dark:border-white/5'
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
        <form onSubmit={handleProceed} className="relative w-full mb-2">
          <div className="relative flex items-center shadow-xs rounded-xl bg-white/95 dark:bg-zinc-900 border border-slate-200/90 dark:border-white/15 focus-within:border-violet-500 dark:focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all">
            <div className="pl-3.5 pr-2.5 text-slate-400 dark:text-zinc-500 flex items-center">
              <Edit3 size={15} />
            </div>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Or tell Regaarder in your own words (e.g., 'I need to research competitors and prepare a presentation')..."
              className="w-full h-11 sm:h-11.5 text-[13px] text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 bg-transparent outline-none pr-28"
            />
            <button
              type="submit"
              disabled={!hasValidSelection || isInferring}
              className={`absolute right-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all flex items-center gap-1.5 ${
                hasValidSelection
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs hover:opacity-90 active:scale-95 cursor-pointer'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 cursor-not-allowed opacity-60'
              }`}
            >
              {isInferring ? (
                <>
                  <div className="w-3 h-3 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                  <span>Preparing...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight size={12} strokeWidth={2.5} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* High-Contrast Restrained Bottom Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between w-full pt-3 mt-1 border-t border-slate-200/80 dark:border-white/10 gap-2">
        <span className="text-[11.5px] font-medium text-slate-600 dark:text-zinc-400">
          Regaarder combines multiple intents and configures the appropriate capabilities automatically.
        </span>
        <span className="text-[11.5px] font-medium text-slate-500 dark:text-zinc-400">
          {selectedIds.length > 0
            ? `${selectedIds.length} intent${selectedIds.length > 1 ? 's' : ''} selected`
            : 'Select 1–3 intents or describe your goal'}
        </span>
      </div>
    </div>
  );
}
