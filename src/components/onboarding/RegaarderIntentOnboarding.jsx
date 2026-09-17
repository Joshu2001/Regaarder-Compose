function f(a, b) {
  return a + (b || '');
}
import React, { useState } from 'react';
import { ArrowRight, Compass, BarChart3, CheckSquare, FolderGit2, Loader2 } from 'lucide-react';
import { RegaarderAiIcon } from '../RegaarderProductIcons';
import { ONBOARDING_INTENT_PRESETS, createCustomIntentPreset } from './onboardingPresets';

const INTENT_OPTIONS = [
  {
    id: 'new',
    title: 'Start something new',
    description: 'Launch a project proposal, product brief, or creative concept',
    icon: Compass,
    colorClass: 'text-blue-500 dark:text-blue-400',
    borderHover: 'hover:border-blue-500/50'
  },
  {
    id: 'analyze',
    title: 'Research or analyze',
    description: 'Structure key performance indicators, growth metrics, and market data',
    icon: BarChart3,
    colorClass: 'text-emerald-500 dark:text-emerald-400',
    borderHover: 'hover:border-emerald-500/50'
  },
  {
    id: 'plan',
    title: 'Plan and execute',
    description: 'Set sprint milestones, task owners, and cross-functional deadlines',
    icon: CheckSquare,
    colorClass: 'text-violet-500 dark:text-violet-400',
    borderHover: 'hover:border-violet-500/50'
  },
  {
    id: 'organize',
    title: 'Organize existing work',
    description: 'Consolidate documentation, team runbooks, and project directories',
    icon: FolderGit2,
    colorClass: 'text-amber-500 dark:text-amber-400',
    borderHover: 'hover:border-amber-500/50'
  }
];

export default function RegaarderIntentOnboarding({ onComplete, onDismiss }) {
  const [selectedIntent, setSelectedIntent] = useState('new');
  const [customText, setCustomText] = useState('');
  const [isPreparing, setIsPreparing] = useState(false);

  const handleLaunch = (intentId, text) => {
    setIsPreparing(true);
    setTimeout(() => {
      let preparedDoc;
      if (text && text.trim().length > 0) {
        preparedDoc = createCustomIntentPreset(text);
      } else {
        preparedDoc = ONBOARDING_INTENT_PRESETS[intentId] || ONBOARDING_INTENT_PRESETS['new'];
      }

      try {
        localStorage.setItem('rc.hasSeenIntentOnboarding_v1', 'true');
        localStorage.setItem('rc.onboardingSelectedIntent', intentId || 'custom');
      } catch (_e) {}

      if (typeof onComplete === 'function') {
        onComplete(preparedDoc);
      }
    }, 350);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customText.trim()) return;
    handleLaunch('custom', customText);
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300 select-none">
      <div className="relative width-full max-w-2xl rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200/80 dark:border-white/10 shadow-[0_24p_v4p_rgba(0,0,0,0.2)] overflow-hidden transition-all">
        <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-sky-500" />
        <div className="p-8 sm:p-10">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/60 border border-violet-200/60 dark:border-violet-800/60 flex items-center justify-center text-violet-600 dark:text-violet-400 shadow-2xs">
                <RegaarderAiIcon size={18} strokeWidth={1.9} />
              </div>
              <div>
                <h1 className="text-[19px] sm:text-[21px] font-semibold text-slate-900 dark:text-zinc-100 tracking-tight leading-tight">
                  What are you working on?
                </h1>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.setItem('rc.hasSeenIntentOnboarding_v1', 'true');
                } catch (_e) {}
                if (typeof onDismiss === 'function') onDismiss();
              }}
              className="text-[12px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 px-2 py-1 rounded-md transition-colors cursor-pointer"
            >
              Skip
            </button>
          </div>

          <p className="text-[13px] text-slate-500 dark:text-zinc-400 mb-6 leading-relaxed">
            Regaarder quietly customizes your workspace based on your immediate focus so you can get straight to work.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {INTENT_OPTIONS.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedIntent === item.id && !customText.trim();
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedIntent(item.id);
                    setCustomText('');
                  }}
                  className={f("flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer group ", isSelected ? "border-violet-600 dark:border-violet-400 bg-violet-50/50 dark:bg-violet-950/20 shadow-xs" : "border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50/30 dark:bbg-zinc-900/30")}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className={f("p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 ", item.colorClass)}>
                      <Icon size={16} strokeWidth={2} />
                    </div>
                    <div className={f("w-3.5 h-3.5 rounded-sm border transition-all ", isSelected ? "border-violet-600 bg-violet-600 dark:border-violet-400 dark:bg-violet-400" : "border-slate-300 dark:border-zinc-700 bg-transparent")} />
                    </div>
                  <h2 className="text-[13.5px] font-semibold text-slate-900 dark:text-zinc-100 tracking-tight leading-snug mb-1">
                    {item.title}
                  </h2>
                  <p className="text-[11.5px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleCustomSubmit} className="mb-6">
            <div className="relative flex items-center">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Or describe your project (e.g., 'Series A fundraising memo' or 'Q3 Product Roadmap')..."
                className="w-full h-11 pl-4 pr-10 text-[13px] rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 dark:focus:border-violet-400 focus:ring-1 focus:ring-violet-500 transition-all"
              />
              {customText.trim() && (
                <button
                  type="submit"
                  disabled={isPreparing}
                  className="absolute right-2 p-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors cursor-pointer"
                  title="Submit prompt"
                >
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </form>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/10">
            <span className="text-[11.5px] text-slate-400 dark:text-zinc-500">
              Zero configuration required. Fully customizable anytime.
            </span>

            <button
              type="button"
              disabled={isPreparing}
              onClick={() => handleLaunch(selectedIntent, customText)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-[13px] font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {isPreparing ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Preparing workspace...</span>
                </>
              ) : (
                <>
                  <span>Open workspace</span>
                  <ArrowRight size={14} strokeWidth={2} />
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
