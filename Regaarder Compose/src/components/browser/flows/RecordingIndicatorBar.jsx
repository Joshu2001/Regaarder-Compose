import React, { useState } from 'react';

/**
 * RecordingIndicatorBar: Subtle, non-obstructive persistent indicator for Flow recording.
 * Adapts to Regaarder Light and Dark modes.
 */
export const RecordingIndicatorBar = ({
  actionCount = 0,
  hasSensitiveProtection = true,
  onPause,
  onResume,
  onStop
}) => {
  const [isPaused, setIsPaused] = useState(false);

  const handleTogglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      if (onResume) onResume();
    } else {
      setIsPaused(true);
      if (onPause) onPause();
    }
  };

  return (
    <div className="w-full bg-white/95 dark:bg-[#18181b]/95 border-b border-rose-500/30 dark:border-rose-500/40 px-4 py-2 flex items-center justify-between text-xs font-sans select-none z-30 shadow-xs backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
      {/* Recording Status Label */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3 items-center justify-center shrink-0">
            {!isPaused && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isPaused ? 'bg-amber-500' : 'bg-rose-500'}`} />
          </span>
          <span className="font-bold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
            Recording Flow
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-slate-500 dark:text-zinc-400 text-[11px]">
          <span className="text-slate-300 dark:text-zinc-700">•</span>
          <span>Regaarder is learning your actions ({actionCount} captured)</span>
        </div>

        {hasSensitiveProtection && (
          <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            🔒 Auto-Sensitive Protection Active
          </span>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            handleTogglePause();
          }}
          className={`px-3 py-1 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
            isPaused
              ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
              : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700'
          }`}
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onStop();
          }}
          className="px-3.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
        >
          <span>Stop</span>
        </button>
      </div>
    </div>
  );
};

export default RecordingIndicatorBar;
