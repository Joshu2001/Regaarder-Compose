import React, { useEffect, useState, useRef } from 'react';
import RegaarderBrandIcon from '../../RegaarderBrandIcon';
import { ComposeIcon, SheetIcon, DeckIcon } from '../../RegaarderProductIcons';
import { Calendar } from 'lucide-react';

export default function OnboardingPreparationStep({ onComplete }) {
  const [progress, setProgress] = useState(20);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // Continuous smooth progression
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(prev + 12, 100);
      });
    }, 150);

    const completionTimer = setTimeout(() => {
      if (typeof onCompleteRef.current === 'function') {
        onCompleteRef.current();
      }
    }, 1500);

    return () => {
      clearInterval(interval);
      clearTimeout(completionTimer);
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[580px] flex flex-col justify-between p-8 sm:p-12 select-none animate-in fade-in duration-300">
      {/* Top Brand Mark */}
      <div className="flex items-center gap-2.5">
        <RegaarderBrandIcon size={20} className="text-slate-900 dark:text-zinc-100" />
        <span className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-zinc-100">
          Regaarder
        </span>
      </div>

      {/* Orbital Assembly Visual */}
      <div className="max-w-md w-full mx-auto my-auto text-center flex flex-col items-center">
        <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
          {/* Ambient Purple Glow */}
          <div className="absolute inset-2 rounded-full bg-violet-500/15 dark:bg-violet-500/25 blur-2xl animate-pulse" />

          {/* Center Regaarder Mark Tile */}
          <div className="relative z-10 w-20 h-20 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200/90 dark:border-white/10 shadow-[0_12px_36px_rgba(139,92,246,0.15)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.4)] flex items-center justify-center">
            <RegaarderBrandIcon size={34} className="text-slate-900 dark:text-zinc-100" />
          </div>

          {/* Orbiting Tool Badges */}
          <div className="absolute top-1 left-3 w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-white/10 shadow-md flex items-center justify-center text-blue-500">
            <ComposeIcon size={18} />
          </div>

          <div className="absolute top-1 right-3 w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-white/10 shadow-md flex items-center justify-center text-emerald-500">
            <SheetIcon size={18} />
          </div>

          <div className="absolute bottom-1 left-3 w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-white/10 shadow-md flex items-center justify-center text-amber-500">
            <DeckIcon size={18} />
          </div>

          <div className="absolute bottom-1 right-3 w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-white/10 shadow-md flex items-center justify-center text-violet-500">
            <Calendar size={18} strokeWidth={2} />
          </div>
        </div>

        {/* Copy */}
        <h2 className="text-[22px] sm:text-[24px] font-semibold text-slate-900 dark:text-zinc-100 tracking-tight mb-2">
          Setting up your workspace...
        </h2>
        <p className="text-[13px] text-slate-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed mb-8">
          Creating your project, organizing your tools, and preparing relevant context. This will only take a moment.
        </p>

        {/* Progress Indicator with Continuous Shimmer Effect */}
        <div className="relative w-56 h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-violet-500 transition-all duration-300 ease-out rounded-full relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            {/* Animated Shimmer Sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[pulse_1s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>

      <div className="h-6" />
    </div>
  );
}
