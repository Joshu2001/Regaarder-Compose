import React from 'react';
import RegaarderBrandIcon from '../../RegaarderBrandIcon';

export default function OnboardingBlankWorkspaceStep({ onStartBlank, onGoBack }) {
  return (
    <div className="relative w-full h-full min-h-[580px] flex flex-col justify-between p-8 sm:p-12 select-none animate-in fade-in duration-300 overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full relative z-10">
        <div className="flex items-center gap-2.5">
          <RegaarderBrandIcon size={20} className="text-slate-900 dark:text-zinc-100" />
          <span className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-zinc-100">
            Regaarder
          </span>
        </div>
        <button
          type="button"
          onClick={onStartBlank}
          className="text-[12px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
        >
          Skip
        </button>
      </div>

      {/* Centered Minimal Content */}
      <div className="max-w-md w-full mx-auto my-auto text-center relative z-10">
        <h1 className="text-[28px] sm:text-[32px] font-semibold text-slate-900 dark:text-zinc-100 tracking-tight leading-tight mb-2.5">
          Ready when you are.
        </h1>
        <p className="text-[14px] text-slate-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed mb-8">
          Skip the setup and start with a clean workspace. You can always personalize it later.
        </p>

        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <button
            type="button"
            onClick={onStartBlank}
            className="w-full py-2.5 px-5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            Start with a blank workspace
          </button>
          <button
            type="button"
            onClick={onGoBack}
            className="w-full py-2 px-4 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 text-[12.5px] font-medium transition-colors cursor-pointer"
          >
            Go back
          </button>
        </div>
      </div>

      {/* Ethereal Purple Mountain Horizon SVG Base */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none opacity-40 dark:opacity-30">
        <svg viewBox="0 0 1200 350" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path
            d="M0 350L0 200C120 180 240 260 380 220C520 180 640 140 780 170C920 200 1060 120 1200 160L1200 350Z"
            fill="url(#horizon-grad-1)"
          />
          <path
            d="M0 350L0 240C150 210 300 270 450 230C600 190 750 260 900 220C1050 180 1150 240 1200 250L1200 350Z"
            fill="url(#horizon-grad-2)"
          />
          <defs>
            <linearGradient id="horizon-grad-1" x1="0" y1="120" x2="1200" y2="350" gradientUnits="userSpaceOnUse">
              <stop stopColor="#a78bfa" stopOpacity="0.4" />
              <stop offset="1" stopColor="#7c3aed" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="horizon-grad-2" x1="0" y1="180" x2="1200" y2="350" gradientUnits="userSpaceOnUse">
              <stop stopColor="#c4b5fd" stopOpacity="0.6" />
              <stop offset="1" stopColor="#8b5cf6" stopOpacity="0.9" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Footer Caption */}
      <div className="relative z-10 flex items-center justify-between w-full pt-2">
        <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
          Your workspace. Your way.
        </span>
      </div>
    </div>
  );
}
