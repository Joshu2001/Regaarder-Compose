import React, { useState, useEffect } from 'react';
import { Sparkles, Check } from 'lucide-react';

export default function AppleGestureOnboardingHotspots({ onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const hasSeen = localStorage.getItem('rc.hasSeenGestureOnboarding_v1');
      if (!hasSeen) {
        const timer = setTimeout(() => setVisible(true), 600);
        return () => clearTimeout(timer);
      }
    } catch (_e) {}
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem('rc.hasSeenGestureOnboarding_v1', 'true');
    } catch (_e) {}
    if (typeof onDismiss === 'function') onDismiss();
  };

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[260000] overflow-hidden select-none animate-in fade-in duration-300">
      {/* 1. Left Edge Hotspot (Document Outline) */}
      <div className="pointer-events-auto absolute left-2 top-1/3 -translate-y-1/2 group">
        <div className="relative flex items-center">
          <div className="w-7 h-7 rounded-full bg-violet-600/90 text-white flex items-center justify-center shadow-[0_0_18px_rgba(139,92,246,0.6)] animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          </div>
          
          <div className="absolute left-9 top-1/2 -translate-y-1/2 min-w-[210px] p-2.5 bg-slate-900/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl text-white text-xs leading-relaxed animate-in fade-in slide-in-from-left-2">
            <div className="text-[10px] font-bold text-violet-400 uppercase tracking-wider mb-0.5">
              Document Outline
            </div>
            <p className="text-[11px] text-slate-200">
              ◀ Move cursor to the left edge to view headings and outline.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Top-Right Hotspot (Assistant & Panel) */}
      <div className="pointer-events-auto absolute right-16 top-3 group">
        <div className="relative flex items-center justify-end">
          <div className="absolute right-9 top-1/2 -translate-y-1/2 min-w-[220px] p-2.5 bg-slate-900/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl text-white text-xs leading-relaxed animate-in fade-in slide-in-from-right-2 text-right">
            <div className="text-[10px] font-bold text-violet-400 uppercase tracking-wider mb-0.5">
              Assistant & Tasks
            </div>
            <p className="text-[11px] text-slate-200">
              ▶ Click tabs on the top right to open AI Chat, History & Tasks.
            </p>
          </div>

          <div className="w-7 h-7 rounded-full bg-violet-600/90 text-white flex items-center justify-center shadow-[0_0_18px_rgba(139,92,246,0.6)] animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          </div>
        </div>
      </div>

      {/* 3. Bottom Center Hotspot (Slash Commands & AI Agents) */}
      <div className="pointer-events-auto absolute bottom-28 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div className="p-3.5 max-w-[340px] bg-slate-900/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl text-white text-xs leading-relaxed animate-in fade-in slide-in-from-bottom-2 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[10.5px] font-bold text-violet-400 uppercase tracking-wider mb-1">
            <Sparkles size={12} className="text-violet-400" />
            <span>AI Agents & Gestures</span>
          </div>
          <p className="text-[11.5px] text-slate-200 mb-2.5">
            Type <span className="px-1.5 py-0.5 rounded bg-violet-500/30 text-violet-300 font-mono font-bold">/</span> anywhere or highlight text to summon AI agents instantly.
          </p>
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Check size={13} strokeWidth={2.5} />
            <span>Got it, let&apos;s write</span>
          </button>
        </div>
      </div>
    </div>
  );
}
