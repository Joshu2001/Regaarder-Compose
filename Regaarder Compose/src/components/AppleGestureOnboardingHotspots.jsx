import React, { useState, useEffect } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';

const RegaarderVectorIcon = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M 3 19 C 7 19, 9 5, 14 5 C 18 5, 20 12, 22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M 2 14 C 6 14, 8 9, 13 9 C 17 9, 19 16, 21 16" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
    <circle cx="14" cy="5" r="2" fill="currentColor" />
    <circle cx="3" cy="19" r="1.5" fill="currentColor" fillOpacity="0.7" />
  </svg>
);

const STEPS = [
  {
    id: 'ai-prompt',
    title: 'AI, wherever you write',
    description: 'Type / anywhere or highlight text in your document to summon AI agents instantly.',
    target: 'bottom-prompt',
    stepNumber: 1,
  },
  {
    id: 'outline',
    title: 'Your document, automatically organized',
    description: 'Move your cursor to the left edge to expand your headings, bookmarks, and section outline.',
    target: 'left-outline',
    stepNumber: 2,
  },
  {
    id: 'workspace-switcher',
    title: 'Switch workspaces seamlessly',
    description: 'Jump between Docs, Sheets, Decks, and Notes instantly without ever leaving your active workspace.',
    target: 'top-left-switcher',
    stepNumber: 3,
  },
  {
    id: 'assistant',
    title: 'Assistant & collaborative tasks',
    description: 'Switch between Assistant, History, and Tasks on the top right whenever you need cross-document intelligence.',
    target: 'top-assistant',
    stepNumber: 4,
  },
];

export default function AppleGestureOnboardingHotspots({ onDismiss }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const hasSeen = localStorage.getItem('rc.hasSeenGestureOnboarding_v1');
      if (!hasSeen) {
        const timer = setTimeout(() => setVisible(true), 700);
        return () => clearTimeout(timer);
      }
    } catch (_e) {}
  }, []);

  const finish = () => {
    setVisible(false);
    try {
      localStorage.setItem('rc.hasSeenGestureOnboarding_v1', 'true');
    } catch (_e) {}
    if (typeof onDismiss === 'function') onDismiss();
  };

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      finish();
    }
  };

  if (!visible) return null;

  const currentStep = STEPS[currentStepIndex];

  return (
    <div className="pointer-events-none fixed inset-0 z-[260000] overflow-hidden select-none animate-in fade-in duration-300">
      {/* Target Halo 1: Prompt Bar Breathing Halo */}
      {currentStep.id === 'ai-prompt' && (
        <div className="pointer-events-none fixed bottom-12 left-1/2 -translate-x-1/2 w-[min(980px,calc(100vw-120px))] h-14 rounded-2xl ring-2 ring-violet-500/40 dark:ring-violet-400/40 shadow-[0_0_30px_rgba(139,92,246,0.25)] animate-pulse" />
      )}

      {/* Target Halo 2: Left Outline Edge Halo */}
      {currentStep.id === 'outline' && (
        <div className="pointer-events-none fixed left-0 top-16 bottom-16 w-3 bg-gradient-to-r from-violet-500/40 to-transparent animate-pulse" />
      )}

      {/* Target Halo 3: Top Left Workspace Switcher Halo */}
      {currentStep.id === 'workspace-switcher' && (
        <div className="pointer-events-none fixed top-2 left-10 w-9 h-9 rounded-xl ring-2 ring-violet-500/50 dark:ring-violet-400/50 shadow-[0_0_24px_rgba(139,92,246,0.35)] animate-pulse" />
      )}

      {/* Target Halo 4: Top Right Tabs Halo */}
      {currentStep.id === 'assistant' && (
        <div className="pointer-events-none fixed top-2 right-4 w-72 h-11 rounded-xl ring-2 ring-violet-500/40 dark:ring-violet-400/40 shadow-[0_0_30px_rgba(139,92,246,0.25)] animate-pulse" />
      )}

      {/* Step 1: Prompt Bar */}
      {currentStep.id === 'ai-prompt' && (
        <div className="pointer-events-auto absolute bottom-32 left-1/2 -translate-x-1/2 w-[340px] max-w-[90vw] p-4 rounded-2xl bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-2xl border border-slate-200/80 dark:border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.7)] animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400">
              <div className="w-5 h-5 rounded-md bg-violet-50 dark:bg-violet-950/60 border border-violet-200/60 dark:border-violet-800/60 flex items-center justify-center">
                <RegaarderVectorIcon size={12} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Step {currentStep.stepNumber} of {STEPS.length}
              </span>
            </div>
            <button
              type="button"
              onClick={finish}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 rounded-md transition-colors cursor-pointer"
              title="Skip onboarding"
            >
              <X size={13} />
            </button>
          </div>

          <h4 className="text-[13.5px] font-bold text-slate-800 dark:text-zinc-100 tracking-tight leading-snug mb-1">
            {currentStep.title}
          </h4>
          <p className="text-[12px] text-slate-600 dark:text-zinc-300 leading-relaxed mb-3.5">
            {currentStep.description}
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-1">
              {STEPS.map((s, idx) => (
                <span
                  key={s.id}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStepIndex
                      ? 'w-4 bg-violet-600 dark:bg-violet-400'
                      : 'w-1.5 bg-slate-200 dark:bg-zinc-700'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight size={13} strokeWidth={2} />
            </button>
          </div>

          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/90 dark:bg-[#1c1c1e]/90 border-r border-b border-slate-200/80 dark:border-white/15 rotate-45" />
        </div>
      )}

      {/* Step 2: Outline */}
      {currentStep.id === 'outline' && (
        <div className="pointer-events-auto absolute left-6 top-1/3 -translate-y-1/2 w-[340px] max-w-[90vw] p-4 rounded-2xl bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-2xl border border-slate-200/80 dark:border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.7)] animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400">
              <div className="w-5 h-5 rounded-md bg-violet-50 dark:bg-violet-950/60 border border-violet-200/60 dark:border-violet-800/60 flex items-center justify-center">
                <RegaarderVectorIcon size={12} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Step {currentStep.stepNumber} of {STEPS.length}
              </span>
            </div>
            <button
              type="button"
              onClick={finish}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 rounded-md transition-colors cursor-pointer"
              title="Skip onboarding"
            >
              <X size={13} />
            </button>
          </div>

          <h4 className="text-[13.5px] font-bold text-slate-800 dark:text-zinc-100 tracking-tight leading-snug mb-1">
            {currentStep.title}
          </h4>
          <p className="text-[12px] text-slate-600 dark:text-zinc-300 leading-relaxed mb-3.5">
            {currentStep.description}
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-1">
              {STEPS.map((s, idx) => (
                <span
                  key={s.id}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStepIndex
                      ? 'w-4 bg-violet-600 dark:bg-violet-400'
                      : 'w-1.5 bg-slate-200 dark:bg-zinc-700'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight size={13} strokeWidth={2} />
            </button>
          </div>

          <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-white/90 dark:bg-[#1c1c1e]/90 border-l border-b border-slate-200/80 dark:border-white/15 rotate-45" />
        </div>
      )}

      {/* Step 3: Top-Left Workspace Switcher */}
      {currentStep.id === 'workspace-switcher' && (
        <div className="pointer-events-auto absolute top-14 left-8 w-[340px] max-w-[90vw] p-4 rounded-2xl bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-2xl border border-slate-200/80 dark:border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.7)] animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400">
              <div className="w-5 h-5 rounded-md bg-violet-50 dark:bg-violet-950/60 border border-violet-200/60 dark:border-violet-800/60 flex items-center justify-center">
                <RegaarderVectorIcon size={12} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Step {currentStep.stepNumber} of {STEPS.length}
              </span>
            </div>
            <button
              type="button"
              onClick={finish}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 rounded-md transition-colors cursor-pointer"
              title="Skip onboarding"
            >
              <X size={13} />
            </button>
          </div>

          <h4 className="text-[13.5px] font-bold text-slate-800 dark:text-zinc-100 tracking-tight leading-snug mb-1">
            {currentStep.title}
          </h4>
          <p className="text-[12px] text-slate-600 dark:text-zinc-300 leading-relaxed mb-3.5">
            {currentStep.description}
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-1">
              {STEPS.map((s, idx) => (
                <span
                  key={s.id}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStepIndex
                      ? 'w-4 bg-violet-600 dark:bg-violet-400'
                      : 'w-1.5 bg-slate-200 dark:bg-zinc-700'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight size={13} strokeWidth={2} />
            </button>
          </div>

          {/* Upward Anchor Arrow */}
          <div className="absolute -top-2 left-6 w-4 h-4 bg-white/90 dark:bg-[#1c1c1e]/90 border-t border-l border-slate-200/80 dark:border-white/15 rotate-45" />
        </div>
      )}

      {/* Step 4: Assistant & Tasks */}
      {currentStep.id === 'assistant' && (
        <div className="pointer-events-auto absolute top-18 right-6 w-[340px] max-w-[90vw] p-4 rounded-2xl bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-2xl border border-slate-200/80 dark:border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.7)] animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400">
              <div className="w-5 h-5 rounded-md bg-violet-50 dark:bg-violet-950/60 border border-violet-200/60 dark:border-violet-800/60 flex items-center justify-center">
                <RegaarderVectorIcon size={12} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Step {currentStep.stepNumber} of {STEPS.length}
              </span>
            </div>
            <button
              type="button"
              onClick={finish}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 rounded-md transition-colors cursor-pointer"
              title="Skip onboarding"
            >
              <X size={13} />
            </button>
          </div>

          <h4 className="text-[13.5px] font-bold text-slate-800 dark:text-zinc-100 tracking-tight leading-snug mb-1">
            {currentStep.title}
          </h4>
          <p className="text-[12px] text-slate-600 dark:text-zinc-300 leading-relaxed mb-3.5">
            {currentStep.description}
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-1">
              {STEPS.map((s, idx) => (
                <span
                  key={s.id}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStepIndex
                      ? 'w-4 bg-violet-600 dark:bg-violet-400'
                      : 'w-1.5 bg-slate-200 dark:bg-zinc-700'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Check size={13} strokeWidth={2.5} />
              <span>Start writing</span>
            </button>
          </div>

          {/* Upward Anchor Arrow */}
          <div className="absolute -top-2 right-12 w-4 h-4 bg-white/90 dark:bg-[#1c1c1e]/90 border-t border-l border-slate-200/80 dark:border-white/15 rotate-45" />
        </div>
      )}
    </div>
  );
}
