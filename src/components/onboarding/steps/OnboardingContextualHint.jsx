import React from 'react';
import { RegaarderAiIcon } from '../../RegaarderProductIcons';
import { ArrowRight } from 'lucide-react';

export default function OnboardingContextualHint({ preset, onNextStep, onDismiss }) {
  return (
    <div className="relative w-full h-full min-h-[580px] flex flex-col bg-white dark:bg-[#18181b] select-none animate-in fade-in duration-300 overflow-hidden">
      {/* Document Top Bar */}
      <div className="h-12 px-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between text-[12px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800 dark:text-zinc-200">
            {preset?.title ? `${preset.title} Draft` : 'Launch Strategy Draft'}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-[10px]">Saved</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNextStep}
            className="px-3 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium text-[11.5px] transition-all cursor-pointer"
          >
            Continue →
          </button>
        </div>
      </div>

      {/* Document Canvas with Contextual Tooltip */}
      <div className="flex-1 max-w-3xl w-full mx-auto p-8 sm:p-12 overflow-y-auto relative">
        {/* Floating Contextual Tooltip */}
        <div className="relative mb-6 max-w-sm ml-auto z-20 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="relative p-4 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-[0_12px_32px_rgba(124,58,237,0.35)] border border-violet-400/30">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-xl bg-white/20 text-white shrink-0 mt-0.5">
                <RegaarderAiIcon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium leading-snug mb-2.5">
                  Use AI to improve your writing, fix grammar, or adjust the tone.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onNextStep}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white text-violet-700 hover:bg-white/90 text-[11.5px] font-semibold transition-all cursor-pointer"
                  >
                    <span>Try it</span>
                    <ArrowRight size={11} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
            {/* Tooltip pointer triangle */}
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-indigo-700 rotate-45 transform" />
          </div>
        </div>

        {/* Realistic Document Text */}
        <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-zinc-200">
          <h1 className="text-[26px] font-bold tracking-tight text-slate-900 dark:text-zinc-100 mb-6">
            {preset?.title || 'Launch Strategy'}
          </h1>

          <h2 className="text-[17px] font-semibold text-slate-900 dark:text-zinc-100 mt-6 mb-2">
            1. Market Opportunity
          </h2>
          <p className="text-[14px] text-slate-600 dark:text-zinc-300 leading-relaxed mb-4">
            The global market for productivity tools continues to grow, driven by remote work and digital transformation. Our research shows a strong demand for integrated workspace solutions that combine AI with traditional productivity tools.
          </p>

          <h2 className="text-[17px] font-semibold text-slate-900 dark:text-zinc-100 mt-6 mb-2">
            2. Key Differentiators
          </h2>
          <ul className="list-disc pl-5 text-[14px] text-slate-600 dark:text-zinc-300 space-y-1 mb-4">
            <li><strong>AI-powered context understanding:</strong> Reasoning that automatically adapts to the active project.</li>
            <li><strong>Seamless integration across apps:</strong> Fast multi-document synthesis.</li>
            <li><strong>Designed for individuals and teams:</strong> Minimal cognitive friction.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
