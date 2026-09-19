import React, { useState } from 'react';
import { ArrowRight, ChevronLeft, ArrowUpRight } from 'lucide-react';
import RegaarderBrandIcon from '../../RegaarderBrandIcon';
import { ComposeIcon, SheetIcon, DeckIcon, WhiteboardIcon, RegaarderAiIcon } from '../../RegaarderProductIcons';

const CANVAS_TYPES = [
  {
    id: 'compose',
    title: 'Document (Compose)',
    subtitle: 'Executive writing, research synthesis & intelligence drafts',
    icon: ComposeIcon,
    color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200/60 dark:border-blue-800/40'
  },
  {
    id: 'sheets',
    title: 'Spreadsheet (Sheets)',
    subtitle: 'Data matrix heuristics, formulas, and structured models',
    icon: SheetIcon,
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200/60 dark:border-emerald-800/40'
  },
  {
    id: 'deck',
    title: 'Presentation (Deck)',
    subtitle: 'Multi-slide narrative blueprints and keynote assets',
    icon: DeckIcon,
    color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200/60 dark:border-amber-800/40'
  },
  {
    id: 'whiteboard',
    title: 'Whiteboard (Canvas)',
    subtitle: 'Spatial nodes, infinite topology, and brainstorming',
    icon: WhiteboardIcon,
    color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50 border-violet-200/60 dark:border-violet-800/40'
  }
];

export default function OnboardingNewCanvasStep({ onBack, onComplete, initialPrompt = '' }) {
  const [selectedCanvas, setSelectedCanvas] = useState('compose');
  const [projectTitle, setProjectTitle] = useState(initialPrompt || '');

  const handleLaunch = (mode = selectedCanvas) => {
    onComplete({
      type: 'create_canvas',
      mode: mode,
      title: projectTitle.trim() || undefined,
      toast: projectTitle.trim() ? `Created ${projectTitle.trim()}` : `Opened new workspace`
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
          <span className="text-[13px] font-bold text-slate-900 dark:text-zinc-100">Creation Studio</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-xl w-full mx-auto my-auto py-2 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/50 border border-violet-200/60 dark:border-violet-800/40 text-violet-700 dark:text-violet-300 text-[11.5px] font-semibold mb-4">
          <RegaarderAiIcon size={13} />
          <span>AI-Native Creation Canvas</span>
        </div>

        <h2 className="text-[26px] sm:text-[30px] font-semibold text-slate-900 dark:text-zinc-100 tracking-tight leading-tight mb-2.5">
          Select your starting format
        </h2>
        <p className="text-[13.5px] text-slate-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed mb-6">
          Whether you're drafting a strategic memo, modeling numerical data, or crafting a presentation deck, Regaarder connects every surface with unified intelligence.
        </p>

        {/* Optional Title Input */}
        <div className="mb-5">
          <input
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            placeholder="Give your project a name (optional)..."
            className="w-full h-11 px-4 text-[13.5px] rounded-xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 dark:focus:border-violet-400 focus:ring-1 focus:ring-violet-500/30 transition-all shadow-2xs"
          />
        </div>

        {/* 2x2 Canvas Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {CANVAS_TYPES.map((canvas) => {
            const Icon = canvas.icon;
            const isSel = selectedCanvas === canvas.id;
            return (
              <button
                key={canvas.id}
                type="button"
                onClick={() => setSelectedCanvas(canvas.id)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer group flex items-start gap-3.5 ${
                  isSel
                    ? 'border-violet-500/80 bg-violet-50/40 dark:bg-violet-950/20 shadow-xs ring-1 ring-violet-500/30'
                    : 'border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-zinc-900/60'
                }`}
              >
                <div className={`p-2.5 rounded-xl shrink-0 ${canvas.color}`}>
                  <Icon size={18} strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[13.5px] font-semibold text-slate-900 dark:text-zinc-100 mb-0.5">
                    {canvas.title}
                  </h3>
                  <p className="text-[11.5px] text-slate-400 dark:text-zinc-500 leading-snug">
                    {canvas.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Primary Launch Action */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => handleLaunch()}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white text-[13px] font-semibold shadow-xs transition-all cursor-pointer"
          >
            <span>Launch Canvas</span>
            <ArrowRight size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Footer hint */}
      <div className="flex items-center justify-between w-full pt-4 border-t border-slate-100 dark:border-white/5">
        <span className="text-[11.5px] text-slate-400 dark:text-zinc-500">
          You can seamlessly convert between Docs, Sheets, and Decks anytime.
        </span>
        <button
          type="button"
          onClick={() => handleLaunch('compose')}
          className="inline-flex items-center gap-1 text-[11.5px] font-medium text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
        >
          <span>Start with Blank Compose</span>
          <ArrowUpRight size={12} />
        </button>
      </div>
    </div>
  );
}
