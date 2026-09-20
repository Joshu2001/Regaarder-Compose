import React, { useState } from 'react';
import { Users, ArrowRight, Video, Mic, Share2, Shield, ChevronLeft, ArrowUpRight, Sparkles } from 'lucide-react';
import RegaarderBrandIcon from '../../RegaarderBrandIcon';
import { RegaarderAiIcon, RoomIcon } from '../../RegaarderProductIcons';

export default function OnboardingRoomStep({ onBack, onComplete }) {
  const [meetingTopic, setMeetingTopic] = useState('');
  const [enableAiTranscription, setEnableAiTranscription] = useState(true);

  const handleLaunchMeeting = (actionType = 'instant') => {
    const topic = meetingTopic.trim() || 'Collaborative Workspace Room';
    onComplete({
      type: 'action',
      destination: 'room',
      meetingTopic: topic,
      enableAiTranscription,
      actionType,
      toast: `Launching Room: "${topic}"`
    });
  };

  return (
    <div className="relative w-full h-full min-h-[580px] flex flex-col justify-between p-8 sm:p-12 select-none animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-2">
          <RegaarderBrandIcon size={18} className="text-slate-900 dark:text-zinc-100" />
          <span className="text-[13px] font-bold text-slate-900 dark:text-zinc-100">Collaborative Room</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-xl w-full mx-auto my-auto py-2 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200/60 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-[11.5px] font-semibold mb-4">
          <RoomIcon size={14} />
          <span>Spatial Presence & Live Transcription</span>
        </div>

        <h2 className="text-[26px] sm:text-[30px] font-semibold text-slate-900 dark:text-zinc-100 tracking-tight leading-tight mb-2.5">
          Meet, co-create, and synthesize live
        </h2>
        <p className="text-[13.5px] text-slate-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed mb-6">
          Start an instant collaborative meeting with low-latency video, shared whiteboard stages, and real-time AI agents capturing decisions into memory.
        </p>

        {/* Meeting Topic Input */}
        <div className="p-4 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-zinc-900 text-left shadow-xs mb-5">
          <input
            type="text"
            value={meetingTopic}
            onChange={(e) => setMeetingTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleLaunchMeeting('instant');
              }
            }}
            placeholder="Name your meeting session (optional)..."
            className="w-full text-[14px] text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 bg-transparent outline-none mb-3"
          />

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800">
            <label className="flex items-center gap-2 text-[12px] text-slate-600 dark:text-zinc-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={enableAiTranscription}
                onChange={(e) => setEnableAiTranscription(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 dark:border-zinc-600"
              />
              <span className="flex items-center gap-1.5">
                <RegaarderAiIcon size={12} className="text-violet-600 dark:text-violet-400" />
                <span>AI Live Transcriber & Minutes</span>
              </span>
            </label>

            <button
              type="button"
              onClick={() => handleLaunchMeeting('instant')}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[12px] font-semibold transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              <span>Start Meeting</span>
              <ArrowRight size={13} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Room Features Callout */}
        <div className="grid grid-cols-3 gap-2.5 text-left mb-4">
          <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/70 dark:border-white/5">
            <div className="flex items-center gap-1.5 text-slate-800 dark:text-zinc-200 text-[11.5px] font-semibold mb-1">
              <Video size={13} className="text-rose-500" />
              <span>Spatial Presence</span>
            </div>
            <p className="text-[10.5px] text-slate-400 dark:text-zinc-500 leading-snug">
              Fluid, non-distracting camera tiles with native aperture controls.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/70 dark:border-white/5">
            <div className="flex items-center gap-1.5 text-slate-800 dark:text-zinc-200 text-[11.5px] font-semibold mb-1">
              <Share2 size={13} className="text-blue-500" />
              <span>Live Stage</span>
            </div>
            <p className="text-[10.5px] text-slate-400 dark:text-zinc-500 leading-snug">
              Simultaneous multi-screen share and real-time document co-editing.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/70 dark:border-white/5">
            <div className="flex items-center gap-1.5 text-slate-800 dark:text-zinc-200 text-[11.5px] font-semibold mb-1">
              <Shield size={13} className="text-emerald-500" />
              <span>End-to-End E2EE</span>
            </div>
            <p className="text-[10.5px] text-slate-400 dark:text-zinc-500 leading-snug">
              Private peer-to-peer encryption with local device keys.
            </p>
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="flex items-center justify-between w-full pt-4 border-t border-slate-100 dark:border-white/5">
        <span className="text-[11.5px] text-slate-400 dark:text-zinc-500">
          No plugins required. Works natively in your browser and desktop client.
        </span>
        <button
          type="button"
          onClick={() => handleLaunchMeeting('instant')}
          className="inline-flex items-center gap-1 text-[11.5px] font-medium text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
        >
          <span>Open Room Hub</span>
          <ArrowUpRight size={12} />
        </button>
      </div>
    </div>
  );
}
