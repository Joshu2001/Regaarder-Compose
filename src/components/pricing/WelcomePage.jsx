import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import RegaarderBrandIcon from '../RegaarderBrandIcon';

export default function WelcomePage() {
  const returnToWorkspace = () => {
    window.location.href = window.location.origin;
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#111113] text-zinc-900 dark:text-zinc-100 flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800">
      <div className="relative z-10 max-w-md w-full bg-white dark:bg-[#18181b] border border-zinc-200/90 dark:border-zinc-800 rounded-xl p-8 sm:p-9 shadow-lg shadow-black/[0.03] dark:shadow-none text-center">
        {/* Brand Mark with verified micro-badge */}
        <div className="relative w-14 h-14 mx-auto mb-6 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
          <RegaarderBrandIcon size={24} />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs border-2 border-white dark:border-[#18181b]">
            <Check size={11} strokeWidth={3} />
          </div>
        </div>

        {/* Status Eyebrow */}
        <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10.5px] font-semibold tracking-wider uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 mb-4">
          <span>Membership Active</span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white mb-2">
          You're all set
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
          Your workspace is upgraded and active. Everything is ready for you to do your best work.
        </p>

        <button
          onClick={returnToWorkspace}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold text-xs tracking-wide text-white dark:text-zinc-900 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 active:scale-[0.99] transition-all shadow-2xs cursor-pointer outline-none"
        >
          <span>Open Workspace</span>
          <ArrowRight size={14} strokeWidth={2.5} />
        </button>
      </div>

      <div className="mt-8 text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
        <RegaarderBrandIcon size={12} className="opacity-60" />
        <span className="font-medium">Regaarder Workspace</span>
      </div>
    </div>
  );
}
