import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { BrowserFlowIcon } from '../RegaarderBrowserIcons';
import { getSavedFlows } from '../../../services/flowEngine';

// Standardized monoline UI icons matching Regaarder HIG
const RecordDotIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="6" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.75" fill="none" />
  </svg>
);

const AISparkleIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6l2.1 2.1M5.6 18.4l2.1-2.1m8.6-8.6l2.1-2.1" />
    <circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none" />
  </svg>
);

const PlayTriangleIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="7 4 19 12 7 20 7 4" fill="currentColor" stroke="none" />
  </svg>
);

const FolderLibraryIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const ChevronRightIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ChevronLeftIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

/**
 * BrowserFlowsPopover: Executive Apple-style popover for Regaarder Browser Flows
 * Matches Display & Appearance popover design language: 95% surface opacity, backdrop-blur-2xl,
 * light/dark mode theme adaptation, 4-action structure with pure UI icons, and Flow Picker.
 */
export const BrowserFlowsPopover = ({
  anchorRect,
  isRecording,
  isStandalone = false,
  onClose,
  onStartRecording,
  onSaveRecentAsFlow,
  onOpenRunFlow,
  onOpenMyFlows
}) => {
  const popoverRef = useRef(null);
  const [view, setView] = useState('main'); // 'main' | 'picker'
  const [flows, setFlows] = useState([]);

  useEffect(() => {
    setFlows(getSavedFlows());
  }, []);

  // Outside-click dismissal is handled globally by BrowserWorkspace's pointerdown
  // listener (which guards via [data-popover]). Only Escape key is handled here.
  useEffect(() => {
    if (isStandalone) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (view === 'picker') {
          setView('main');
        } else {
          onClose?.();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isStandalone, view]);

  if (!anchorRect && !isStandalone) return null;

  // Calculate dynamic position below (or above, if space is tight) the anchor button.
  const POPOVER_HEIGHT_ESTIMATE = 340;
  const spaceBelow = anchorRect ? window.innerHeight - (anchorRect.bottom + 6) : 999;
  const top = anchorRect
    ? spaceBelow >= POPOVER_HEIGHT_ESTIMATE
      ? Math.max(86, anchorRect.bottom + 6)
      : Math.max(8, anchorRect.top - POPOVER_HEIGHT_ESTIMATE - 6)
    : 86;
  const right = anchorRect ? Math.max(16, window.innerWidth - anchorRect.right) : 16;

  const content = (
    <div
      ref={popoverRef}
      data-popover
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={isStandalone ? {} : { top: `${top}px`, right: `${Math.max(12, right)}px` }}
      className={`${
        isStandalone
          ? 'relative z-[100000] w-full max-w-sm border border-slate-200/90 dark:border-zinc-800/90 shadow-2xl'
          : 'fixed z-[100000] w-72 border border-slate-200/90 dark:border-zinc-800/90 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.22),0_4px_16px_-4px_rgba(0,0,0,0.08)] animate-in zoom-in-95 fade-in duration-150'
      } bg-white dark:bg-[#1c1c1e] rounded-2xl font-sans select-none text-slate-800 dark:text-zinc-100 overflow-hidden`}
    >
      {/* Header */}
      <div className="px-3.5 py-3 bg-slate-50/60 dark:bg-zinc-900/60 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
        {view === 'picker' ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setView('main');
              }}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-200/60 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
              title="Back to Flows menu"
            >
              <ChevronLeftIcon size={14} />
            </button>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 leading-none">Select Flow to Run</h3>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium leading-tight mt-0.5">Pick a saved research workflow</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/20 shrink-0">
              <BrowserFlowIcon size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 leading-none">Regaarder Flows</h3>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium leading-tight mt-0.5">Automate research & extraction</p>
            </div>
          </div>
        )}
      </div>

      {/* Main 4-Action Categorized Structure (CREATE -> RUN -> MANAGE) */}
      {view === 'main' ? (
        <div className="p-2 space-y-2.5 text-xs">
          {/* SECTION 1: CREATE */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block px-1">
              Create
            </span>
            <div className="space-y-1">
              {/* 1. Record Flow (Primary Action) */}
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onStartRecording();
                  requestAnimationFrame(() => onClose?.());
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                  isRecording
                    ? 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-semibold'
                    : 'bg-violet-500/10 dark:bg-violet-500/15 text-slate-900 dark:text-zinc-100 border border-violet-500/20 dark:border-violet-500/30 hover:bg-violet-500/20 dark:hover:bg-violet-500/25 font-semibold shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`p-1.5 rounded-lg shrink-0 ${
                      isRecording
                        ? 'bg-rose-500/20 border border-rose-500/40 text-rose-500 animate-pulse'
                        : 'bg-violet-500/15 dark:bg-violet-500/25 border border-violet-500/30 text-violet-600 dark:text-violet-300'
                    }`}
                  >
                    <RecordDotIcon size={13} />
                  </span>
                  <span className="leading-tight">
                    {isRecording ? 'Stop Recording Session' : 'Record Flow'}
                  </span>
                </div>
                {isRecording && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />}
              </button>

              {/* 2. Create from Recent */}
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onSaveRecentAsFlow();
                  requestAnimationFrame(() => onClose?.());
                }}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-100/80 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-zinc-100 transition-all duration-150 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200/60 dark:border-zinc-700/60 shrink-0 group-hover:text-slate-900 dark:group-hover:text-zinc-100 group-hover:bg-slate-200/60 dark:group-hover:bg-zinc-700/60 transition-colors">
                    <AISparkleIcon size={13} />
                  </span>
                  <span className="leading-tight">Create from Recent</span>
                </div>
              </button>
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-slate-100 dark:border-zinc-800/80 my-0.5" />

          {/* SECTION 2: RUN */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block px-1">
              Run
            </span>
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setView('picker');
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-100/80 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-zinc-100 transition-all duration-150 cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200/60 dark:border-zinc-700/60 shrink-0 group-hover:text-slate-900 dark:group-hover:text-zinc-100 group-hover:bg-slate-200/60 dark:group-hover:bg-zinc-700/60 transition-colors">
                  <PlayTriangleIcon size={13} />
                </span>
                <span className="leading-tight">Run Flow</span>
              </div>
              <ChevronRightIcon size={13} className="text-slate-400 dark:text-zinc-500 shrink-0 group-hover:text-slate-600 dark:group-hover:text-zinc-300 transition-colors" />
            </button>
          </div>

          {/* Separator */}
          <div className="border-t border-slate-100 dark:border-zinc-800/80 my-0.5" />

          {/* SECTION 3: MANAGE */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block px-1">
              Manage
            </span>
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                onOpenMyFlows();
                onClose();
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-100/80 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-zinc-100 transition-all duration-150 cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200/60 dark:border-zinc-700/60 shrink-0 group-hover:text-slate-900 dark:group-hover:text-zinc-100 group-hover:bg-slate-200/60 dark:group-hover:bg-zinc-700/60 transition-colors">
                  <FolderLibraryIcon size={13} />
                </span>
                <span className="leading-tight">My Flows</span>
              </div>
              <ChevronRightIcon size={13} className="text-slate-400 dark:text-zinc-500 shrink-0 group-hover:text-slate-600 dark:group-hover:text-zinc-300 transition-colors" />
            </button>
          </div>
        </div>
      ) : (
        /* Flow Picker View */
        <div className="p-1.5 space-y-1 max-h-[280px] overflow-y-auto thin-scrollbar">
          {flows.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 dark:text-zinc-500 font-medium">
              No saved flows found
            </div>
          ) : (
            flows.map((flow) => (
              <button
                key={flow.id}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onOpenRunFlow(flow);
                  onClose();
                }}
                className="w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <span className="p-1.5 rounded-lg bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/20 shrink-0">
                    <BrowserFlowIcon size={13} />
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate leading-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      {flow.name}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 truncate font-normal leading-tight mt-0.5">
                      {flow.description || `${flow.steps?.length || 0} steps • ${flow.category || 'Research'}`}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] border border-emerald-500/20 shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  Run
                </span>
              </button>
            ))
          )}

          <div className="pt-1.5 border-t border-slate-100 dark:border-zinc-800/80 mt-1">
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                onOpenMyFlows();
                onClose();
              }}
              className="w-full text-center py-1.5 text-[11px] font-semibold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
            >
              View All Flows in Library →
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (isStandalone) return content;

  const targetNode = document.fullscreenElement ?? document.body;
  return createPortal(content, targetNode);
};

export default BrowserFlowsPopover;
