import React, { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import { RegaarderAiIcon } from '../../RegaarderProductIcons';
import RegaarderBrandIcon from '../../RegaarderBrandIcon';

/**
 * OnboardingPreparingWorkspaceStep
 * 
 * Provides an authentic, executive-tier perceived value preparation experience ("Labor Illusion").
 * Retains the exact dimensions, padding, header, and footer structure as OnboardingIntentStep
 * so the modal container does not shift or resize.
 * 
 * Runs through 3 snappy yet authentic stages (~720ms total), safely handling lifecycle
 * via stable refs so timers are never cancelled or trapped by re-renders.
 */
export default function OnboardingPreparingWorkspaceStep({ intent = 'create', customPrompt = '', onComplete }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(35);

  // Stable ref for onComplete callback so parent re-renders never invalidate or reset the timer effect
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // 3 tightly-scoped contextual step sequences tailored to the selected intent
  const stepsByIntent = {
    create: [
      { label: 'Initializing creative canvas environment', detail: 'Configuring document formatting engine and styles' },
      { label: 'Calibrating Regaarder AI writing models', detail: 'Preparing context-aware / slash commands and inline tools' },
      { label: 'Finalizing workspace layout and templates', detail: 'Creative environment primed and ready for your first draft' }
    ],
    organize: [
      { label: 'Connecting to Universal Memory vault', detail: 'Mounting cross-workspace knowledge indexing pipeline' },
      { label: 'Configuring multi-format document parsers', detail: 'Preparing ingestion dropzone for PDF, Notes, and Sheets' },
      { label: 'Finalizing knowledge organization hub', detail: 'Semantic cross-reference index ready' }
    ],
    plan: [
      { label: 'Structuring project roadmap hierarchy', detail: 'Establishing milestones, workstream phases, and deadlines' },
      { label: 'Configuring deliverable matrix & status pipelines', detail: 'Wiring task priority and completion tracking' },
      { label: 'Finalizing your project workspace', detail: 'Interactive roadmap and deliverable board ready' }
    ],
    memora: [
      { label: 'Connecting to Memora intelligence core', detail: 'Initializing vector embeddings and memory index' },
      { label: 'Calibrating past session context retrieval', detail: 'Indexing discussions, documents, and decision logs' },
      { label: 'Finalizing Memora knowledge context', detail: 'Memory retrieval active across all workspaces' }
    ],
    collaborate: [
      { label: 'Preparing spatial collaboration room', detail: 'Setting up dynamic stage and meeting presence' },
      { label: 'Configuring live AI transcription pipeline', detail: 'Connecting real-time speech audio synthesis' },
      { label: 'Finalizing collaborative room stage', detail: 'Live sync and interactive stage ready to launch' }
    ],
    inferred: [
      { label: 'Analyzing your project requirements', detail: customPrompt ? `Synthesizing goal: "${customPrompt.slice(0, 45)}..."` : 'Parsing natural language specifications' },
      { label: 'Selecting optimal workspace configuration', detail: 'Routing to tailored canvas, milestone, and AI tools' },
      { label: 'Finalizing your personalized workspace', detail: 'Workspace fully configured and ready' }
    ]
  };

  const steps = stepsByIntent[intent] || stepsByIntent.create;

  useEffect(() => {
    // Crisp, snappy progression: ~720ms total duration
    // 0ms: Step 1 active (35% progress)
    // 220ms: Step 2 active (70% progress)
    // 480ms: Step 3 active (95% progress)
    // 720ms: 100% progress -> trigger completion
    const t1 = setTimeout(() => {
      setCurrentStepIndex(1);
      setProgressPercent(70);
    }, 220);

    const t2 = setTimeout(() => {
      setCurrentStepIndex(2);
      setProgressPercent(95);
    }, 480);

    const t3 = setTimeout(() => {
      setProgressPercent(100);
      if (typeof onCompleteRef.current === 'function') {
        onCompleteRef.current();
      }
    }, 720);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []); // Mount-only effect: guaranteed never to re-trigger or cancel prematurely

  return (
    <div className="relative w-full h-full min-h-[560px] flex flex-col justify-between p-6 sm:p-9 lg:p-11 select-none animate-in fade-in duration-200">
      {/* Top Header Bar matching OnboardingIntentStep exactly */}
      <div className="flex items-center justify-between w-full pb-3">
        <div className="flex items-center gap-2.5">
          <RegaarderBrandIcon size={22} className="text-slate-900 dark:text-zinc-100" />
          <span className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-zinc-100 font-sans">
            Regaarder Workspace
          </span>
        </div>

        {/* Dynamic Stripe-inspired progress tracker matching intent step width */}
        <div className="flex items-center gap-2.5">
          <span className="text-[12px] font-medium text-slate-400 dark:text-zinc-500 tabular-nums">
            {progressPercent}%
          </span>
          <div className="w-20 h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-600 dark:bg-violet-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Core Stage matching max-w-3xl container */}
      <div className="w-full max-w-3xl mx-auto my-auto py-2 flex flex-col items-center">
        {/* Animated AI Pulse Halo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3.5">
            <div className="absolute -inset-2.5 rounded-full bg-violet-500/15 dark:bg-violet-400/15 blur-lg animate-pulse" />
            <div className="relative w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/70 border border-violet-200/80 dark:border-violet-800/80 flex items-center justify-center text-violet-600 dark:text-violet-400 shadow-xs">
              <RegaarderAiIcon size={24} className="animate-[spin_3s_linear_infinite]" />
            </div>
          </div>

          <h2 className="text-[21px] sm:text-[24px] font-semibold text-slate-900 dark:text-zinc-100 tracking-tight mb-1.5">
            Setting up your workspace
          </h2>
          <p className="text-[13.5px] text-slate-500 dark:text-zinc-400 max-w-md">
            Regaarder is tailoring tools, context, and intelligence models for your setup.
          </p>
        </div>

        {/* 3 Step Verification Checklist */}
        <div className="flex flex-col gap-2.5 w-full max-w-xl bg-slate-50/60 dark:bg-zinc-850/40 rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 dark:border-zinc-800">
          {steps.map((step, idx) => {
            const isFinished = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={step.label}
                className={`flex items-start gap-3 p-2.5 rounded-xl transition-all duration-200 ${
                  isCurrent
                    ? 'bg-white dark:bg-zinc-800 shadow-xs border border-violet-200/70 dark:border-violet-800/60 translate-x-0.5'
                    : 'border border-transparent'
                }`}
              >
                {/* Step Status Indicator */}
                <div className="shrink-0 mt-0.5">
                  {isFinished ? (
                    <div className="w-4.5 h-4.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xs animate-in zoom-in-50 duration-150">
                      <Check size={11} strokeWidth={3} />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-4.5 h-4.5 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-xs">
                      <div className="w-2.5 h-2.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="w-4.5 h-4.5 rounded-full border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600" />
                    </div>
                  )}
                </div>

                {/* Step Details */}
                <div className="flex flex-col min-w-0">
                  <span
                    className={`text-[13px] sm:text-[13.5px] font-semibold tracking-tight transition-colors ${
                      isFinished
                        ? 'text-slate-700 dark:text-zinc-300'
                        : isCurrent
                          ? 'text-violet-950 dark:text-violet-100 font-bold'
                          : 'text-slate-400 dark:text-zinc-500'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span
                    className={`text-[11.5px] transition-colors line-clamp-1 ${
                      isCurrent
                        ? 'text-violet-700/80 dark:text-violet-300/80 font-medium'
                        : 'text-slate-400 dark:text-zinc-500'
                    }`}
                  >
                    {step.detail}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stripe-inspired Bottom Control Bar matching OnboardingIntentStep height & border */}
      <div className="flex items-center justify-between w-full pt-4 mt-2 border-t border-slate-100 dark:border-zinc-800">
        <span className="text-[12px] text-slate-400 dark:text-zinc-500 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-ping" />
          Configuring workspace...
        </span>

        <span className="text-[12px] text-slate-400 dark:text-zinc-500 tabular-nums">
          Almost ready
        </span>
      </div>
    </div>
  );
}
