import React, { useState } from 'react';
import { BrowserRecordIcon } from '../RegaarderBrowserIcons';

/**
 * RecordingIndicatorBar: Minimal, non-obstructive persistent indicator for Flow recording.
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
    <div className="w-full bg-slate-950/95 border-b border-rose-500/30 px-4 py-2 flex items-center justify-between text-xs font-sans select-none z-30 shadow-md animate-in slide-in-from-top-2 duration-200">
      {/* Recording Status Label */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3 items-center justify-center">
            {!isPaused && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isPaused ? 'bg-amber-400' : 'bg-rose-500'}`} />
          </span>
          <span className="font-semibold tracking-tight text-slate-100 flex items-center gap-1.5">
            Recording Flow
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-slate-400 text-[11px]">
          <span className="text-slate-600">•</span>
          <span>Regaarder is learning your actions ({actionCount} captured)</span>
        </div>

        {hasSensitiveProtection && (
          <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400">
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
          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
            isPaused
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-slate-100'
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
          className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
        >
          <BrowserRecordIcon size={14} className="text-white" />
          <span>Stop & Synthesize</span>
        </button>
      </div>
    </div>
  );
};

export default RecordingIndicatorBar;
