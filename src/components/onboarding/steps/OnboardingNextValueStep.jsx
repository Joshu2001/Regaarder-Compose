import React from 'react';
import { Check, Search, Layers, Calendar, Users, ArrowRight } from 'lucide-react';
import RegaarderBrandIcon from '../../RegaarderBrandIcon';

const CONTINUATION_ACTIONS = [
  { id: 'research', label: 'Research deeper', icon: Search, prompt: 'Perform a deeper market research analysis on our project scope' },
  { id: 'deck', label: 'Create a deck', icon: Layers, prompt: 'Generate an executive presentation pitch deck from this document' },
  { id: 'schedule', label: 'Plan your schedule', icon: Calendar, prompt: 'Create a detailed timeline schedule with milestone dates' },
  { id: 'team', label: 'Invite your team', icon: Users, prompt: 'Invite team members to collaborate in this workspace' }
];

export default function OnboardingNextValueStep({ onStartWorking, onActionSelect }) {
  return (
    <div className="relative w-full h-full min-h-[580px] flex flex-col justify-between p-8 sm:p-12 select-none animate-in fade-in duration-300">
      {/* Top Brand Mark */}
      <div className="flex items-center gap-2.5">
        <RegaarderBrandIcon size={20} className="text-slate-900 dark:text-zinc-100" />
        <span className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-zinc-100">
          Regaarder
        </span>
      </div>

      {/* Center Completion Card */}
      <div className="max-w-md w-full mx-auto my-auto text-center flex flex-col items-center">
        {/* Soft Purple Checkmark */}
        <div className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-6 shadow-xs animate-in zoom-in-75 duration-300">
          <Check size={28} strokeWidth={2.5} />
        </div>

        <h2 className="text-[26px] font-bold text-slate-900 dark:text-zinc-100 tracking-tight mb-2">
          You're all set!
        </h2>
        <p className="text-[13.5px] text-slate-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed mb-8">
          Your workspace is ready. You can always adjust it later from the settings menu.
        </p>

        {/* Primary Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center mb-10">
          <button
            type="button"
            onClick={onStartWorking}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <span>Start working</span>
            <ArrowRight size={14} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={onStartWorking}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-zinc-300 text-[13px] font-medium transition-colors cursor-pointer"
          >
            Explore more features
          </button>
        </div>

        {/* Continuation Actions Section */}
        <div className="w-full pt-6 border-t border-slate-100 dark:border-white/10">
          <span className="text-[12px] font-medium text-slate-400 dark:text-zinc-500 block mb-3.5">
            Want me to take it further?
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {CONTINUATION_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => onActionSelect(action)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200/90 dark:border-white/10 hover:border-violet-500/60 bg-white/60 dark:bg-zinc-900/60 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 text-[12px] font-medium text-slate-700 dark:text-zinc-300 transition-all cursor-pointer group"
                >
                  <Icon size={13} className="text-violet-500 group-hover:scale-110 transition-transform" />
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="h-6" />
    </div>
  );
}
