import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, FolderGit2, Search, CheckSquare, ChevronDown, Check } from 'lucide-react';
import { RegaarderAiIcon, RoomIcon, ComposeIcon } from '../../RegaarderProductIcons';
import RegaarderBrandIcon from '../../RegaarderBrandIcon';

export const WORKFLOW_CARDS = [
  {
    id: 'organize',
    title: 'Ingest Files & Memory Bank',
    description: 'Drop PDFs, spreadsheets, or documents to cross-reference and search with AI memory.',
    badge: 'Universal Memory',
    icon: FolderGit2,
    badgeColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200/60 dark:border-emerald-800/40',
    accentColor: 'border-emerald-500/80 bg-emerald-50/30 dark:bg-emerald-950/20 ring-emerald-500/30'
  },
  {
    id: 'analyze',
    title: 'Deep Research with Orb AI',
    description: 'Synthesize market trends, competitive intelligence, and facts across live web & memory.',
    badge: 'Orb Intelligence',
    icon: Search,
    badgeColor: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 border-sky-200/60 dark:border-sky-800/40',
    accentColor: 'border-sky-500/80 bg-sky-50/30 dark:bg-sky-950/20 ring-sky-500/30'
  },
  {
    id: 'new',
    title: 'Create Doc, Sheet, Deck or Canvas',
    description: 'Start executive writing, data matrix formulas, or keynote presentation slides from scratch.',
    badge: 'Creation Studio',
    icon: ComposeIcon,
    badgeColor: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50 border-violet-200/60 dark:border-violet-800/40',
    accentColor: 'border-violet-500/80 bg-violet-50/30 dark:bg-violet-950/20 ring-violet-500/30'
  },
  {
    id: 'plan',
    title: 'Manage Tasks & Milestones',
    description: 'Track key deliverables, coordinate sprints, and synchronize project calendars with zero mockups.',
    badge: 'Execution & Schedule',
    icon: CheckSquare,
    badgeColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200/60 dark:border-indigo-800/40',
    accentColor: 'border-indigo-500/80 bg-indigo-50/30 dark:bg-indigo-950/20 ring-indigo-500/30'
  },
  {
    id: 'room',
    title: 'Collaborative Video Room',
    description: 'Meet with spatial camera presence, interactive shared stage, and live AI meeting notes.',
    badge: 'Spatial Room',
    icon: RoomIcon,
    badgeColor: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200/60 dark:border-rose-800/40',
    accentColor: 'border-rose-500/80 bg-rose-50/30 dark:bg-rose-950/20 ring-rose-500/30'
  }
];

export default function OnboardingIntentStep({ onSelectIntent, onSkip }) {
  const [selectedId, setSelectedId] = useState('organize');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, []);

  const handleCardClick = (id) => {
    setSelectedId(id);
    onSelectIntent(id, '');
  };

  const selectedWorkflow = WORKFLOW_CARDS.find(w => w.id === selectedId) || WORKFLOW_CARDS[0];

  return (
    <div className="relative w-full h-full min-h-[640px] flex flex-col justify-between p-8 sm:p-10 lg:p-12 select-none animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex items-center justify-between w-full mb-4">
        <div className="flex items-center gap-2.5">
          <RegaarderBrandIcon size={22} className="text-slate-900 dark:text-zinc-100" />
          <span className="text-[16px] font-bold tracking-tight text-slate-900 dark:text-zinc-100 font-sans">
            Regaarder
          </span>
        </div>

        {/* Quick Workflow Dropdown Switcher */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(prev => !prev)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white/90 dark:bg-zinc-900 text-[12px] font-medium text-slate-700 dark:text-zinc-300 transition-all cursor-pointer shadow-2xs"
          >
            <span className="text-slate-500 dark:text-zinc-400">Jump to:</span>
            <strong className="font-semibold text-slate-900 dark:text-zinc-100">{selectedWorkflow.badge}</strong>
            <ChevronDown size={13} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-[#1c1c20] border border-slate-200/90 dark:border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.18)] p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-3 py-1.5">
                All Platform Capabilities
              </div>
              {WORKFLOW_CARDS.map((item) => {
                const ItemIcon = item.icon;
                const isCur = item.id === selectedId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleCardClick(item.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-[12px] transition-colors cursor-pointer ${
                      isCur
                        ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-semibold'
                        : 'hover:bg-slate-50 dark:hover:bg-zinc-800/60 text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1 rounded-lg ${item.badgeColor}`}>
                        <ItemIcon size={13} />
                      </div>
                      <span className="truncate font-medium">{item.title}</span>
                    </div>
                    {isCur && <Check size={13} className="text-violet-600 dark:text-violet-400 shrink-0 ml-1.5" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Title Section */}
      <div className="w-full max-w-4xl mx-auto my-auto py-2">
        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-white/5 text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-3.5">
            <RegaarderAiIcon size={12} className="text-violet-600 dark:text-violet-400" />
            <span>AI-Native Executive Workspace</span>
          </div>
          <h1 className="text-[28px] sm:text-[32px] font-semibold text-slate-900 dark:text-zinc-100 tracking-tight leading-tight mb-2.5">
            What would you like to achieve today?
          </h1>
          <p className="text-[14px] text-slate-500 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Choose your primary workflow. Regaarder activates the tailored tools, memory bank, and workspace for that job.
          </p>
        </div>

        {/* Generous 2-Row Layout: 3 cards top row, 2 centered cards bottom row */}
        <div className="space-y-3.5">
          {/* Top Row: 3 Core Workflows */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {WORKFLOW_CARDS.slice(0, 3).map((card) => {
              const Icon = card.icon;
              const isSelected = selectedId === card.id;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleCardClick(card.id)}
                  className={`flex flex-col justify-between p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer group min-h-[160px] ${
                    isSelected
                      ? `${card.accentColor} shadow-xs ring-1`
                      : 'border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-zinc-900/60 hover:bg-slate-50/50 dark:hover:bg-zinc-850/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className={`p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-105 ${card.badgeColor}`}>
                        <Icon size={18} strokeWidth={1.8} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200/50 dark:border-white/5">
                        {card.badge}
                      </span>
                    </div>

                    <h2 className="text-[14px] font-semibold text-slate-900 dark:text-zinc-100 tracking-tight mb-1.5">
                      {card.title}
                    </h2>
                    <p className="text-[12px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="pt-3.5 mt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <span className="text-[11.5px] font-medium text-slate-400 dark:text-zinc-500 group-hover:text-slate-800 dark:group-hover:text-zinc-200 transition-colors">
                      Configure & Launch
                    </span>
                    <ArrowRight size={13} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Row: 2 Key Collaborative Workflows (Evenly Balanced) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-w-2xl mx-auto w-full">
            {WORKFLOW_CARDS.slice(3, 5).map((card) => {
              const Icon = card.icon;
              const isSelected = selectedId === card.id;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleCardClick(card.id)}
                  className={`flex flex-col justify-between p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer group min-h-[160px] ${
                    isSelected
                      ? `${card.accentColor} shadow-xs ring-1`
                      : 'border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-zinc-900/60 hover:bg-slate-50/50 dark:hover:bg-zinc-850/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className={`p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-105 ${card.badgeColor}`}>
                        <Icon size={18} strokeWidth={1.8} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200/50 dark:border-white/5">
                        {card.badge}
                      </span>
                    </div>

                    <h2 className="text-[14px] font-semibold text-slate-900 dark:text-zinc-100 tracking-tight mb-1.5">
                      {card.title}
                    </h2>
                    <p className="text-[12px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="pt-3.5 mt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <span className="text-[11.5px] font-medium text-slate-400 dark:text-zinc-500 group-hover:text-slate-800 dark:group-hover:text-zinc-200 transition-colors">
                      Configure & Launch
                    </span>
                    <ArrowRight size={13} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="flex items-center justify-between w-full pt-4 mt-2 border-t border-slate-100 dark:border-white/5">
        <span className="text-[12px] text-slate-400 dark:text-zinc-500">
          All workflows share the same unified memory bank, local models, and real-time synchronization.
        </span>
        <button
          type="button"
          onClick={onSkip}
          className="text-[12.5px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
