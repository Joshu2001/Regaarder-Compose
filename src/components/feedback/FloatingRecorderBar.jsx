import React from 'react';
import { Play, Pause, Square, X, Mic, MicOff } from 'lucide-react';

export default function FloatingRecorderBar({
  isRecording,
  isPaused,
  recordingSeconds,
  maxDuration = 60,
  isMuted,
  onTogglePause,
  onToggleMute,
  onStop,
  onCancel,
}) {
  if (!isRecording) return null;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      role="region"
      aria-label="Screen recording controls"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999999] flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#18181c]/95 backdrop-blur-md border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.5)] text-zinc-100 font-sans select-none animate-in slide-in-from-bottom-4 duration-200"
    >
      {/* Live recording indicator beacon */}
      <div className="flex items-center gap-2 pl-1 pr-2">
        <span className="relative flex h-2.5 w-2.5">
          {!isPaused && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isPaused ? 'bg-amber-400' : 'bg-red-500'
            }`}
          />
        </span>
        <span className="font-mono text-xs font-semibold tracking-wider text-zinc-200">
          {formatTime(recordingSeconds)}{' '}
          <span className="text-zinc-500 font-normal">/ {formatTime(maxDuration)}</span>
        </span>
      </div>

      <div className="h-4 w-[1px] bg-white/10" />

      {/* Controls */}
      <div className="flex items-center gap-1">
        {/* Pause / Resume */}
        <button
          type="button"
          onClick={onTogglePause}
          className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer border-none bg-transparent flex items-center gap-1 text-xs"
          title={isPaused ? 'Resume recording' : 'Pause recording'}
        >
          {isPaused ? <Play size={14} className="fill-current" /> : <Pause size={14} />}
          <span className="text-[11px]">{isPaused ? 'Resume' : 'Pause'}</span>
        </button>

        {/* Mic Narration Toggle */}
        <button
          type="button"
          onClick={onToggleMute}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer border-none flex items-center gap-1 text-xs ${
            isMuted
              ? 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 bg-transparent'
              : 'text-violet-400 hover:text-violet-300 hover:bg-violet-950/40 bg-violet-900/20'
          }`}
          title={isMuted ? 'Unmute microphone (add voice narration)' : 'Mute microphone'}
        >
          {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
          <span className="text-[11px]">{isMuted ? 'Muted' : 'Mic on'}</span>
        </button>

        {/* Done / Stop */}
        <button
          type="button"
          onClick={onStop}
          className="ml-1 px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-[11.5px] transition-colors cursor-pointer border-none flex items-center gap-1.5 shadow-xs"
          title="Finish recording and attach to feedback"
        >
          <Square size={11} className="fill-current" />
          <span>Done</span>
        </button>

        {/* Discard / Cancel */}
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-white/10 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
          title="Discard recording"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
