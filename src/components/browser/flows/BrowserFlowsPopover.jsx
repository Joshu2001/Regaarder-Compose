import React, { useEffect, useRef } from 'react';
import { BrowserFlowIcon, BrowserRecordIcon } from '../RegaarderBrowserIcons';

/**
 * BrowserFlowsPopover: Executive Apple-style popover for Regaarder Browser Flows
 * Features touch-safe `onPointerDown` listeners and dynamic positioning relative to anchorRect.
 */
export const BrowserFlowsPopover = ({
  anchorRect,
  isRecording,
  onClose,
  onStartRecording,
  onSaveRecentAsFlow,
  onOpenRunFlow,
  onOpenMyFlows
}) => {
  const popoverRef = useRef(null);

  // Global click outside listener (deferred to prevent initiating pointerdown from closing immediately)
  useEffect(() => {
    let handleOutsideClick;
    const timer = setTimeout(() => {
      handleOutsideClick = (e) => {
        if (popoverRef.current && !popoverRef.current.contains(e.target)) {
          onClose();
        }
      };
      document.addEventListener('pointerdown', handleOutsideClick);
    }, 60);

    return () => {
      clearTimeout(timer);
      if (handleOutsideClick) {
        document.removeEventListener('pointerdown', handleOutsideClick);
      }
    };
  }, [onClose]);

  if (!anchorRect) return null;

  // Calculate dynamic top/left position below the anchor button
  const top = anchorRect.bottom + 6;
  const right = window.innerWidth - anchorRect.right;

  return (
    <div
      ref={popoverRef}
      style={{ top: `${top}px`, right: `${Math.max(12, right)}px` }}
      className="fixed z-50 w-64 bg-slate-900/95 dark:bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl font-sans select-none text-slate-100 overflow-hidden animate-in fade-in duration-150"
    >
      {/* Header */}
      <div className="px-3.5 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-violet-500/20 text-violet-400 border border-violet-500/30">
            <BrowserFlowIcon size={14} />
          </div>
          <span className="text-xs font-semibold tracking-tight text-slate-100">
            Regaarder Flows
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded-md">
          v1.0
        </span>
      </div>

      {/* Menu Options */}
      <div className="p-1.5 space-y-1 text-xs">
        {/* Save this activity / Record Flow */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onStartRecording();
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium hover:bg-violet-600/20 hover:text-violet-300 transition-colors group cursor-pointer"
        >
          <span className="p-1 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30 group-hover:bg-rose-500/25">
            <BrowserRecordIcon size={14} />
          </span>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-slate-100 group-hover:text-violet-200">
              {isRecording ? 'Stop Recording' : 'Save this activity'}
            </span>
            <span className="text-[10px] text-slate-400 group-hover:text-violet-300/80 truncate">
              Teach Regaarder live steps
            </span>
          </div>
        </button>

        {/* Save recent activity as Flow */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onSaveRecentAsFlow();
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium hover:bg-slate-800 text-slate-200 hover:text-slate-100 transition-colors group cursor-pointer"
        >
          <span className="p-1 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30">
            ✦
          </span>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-slate-200 group-hover:text-slate-100">
              Save recent activity as Flow
            </span>
            <span className="text-[10px] text-slate-400 truncate">
              Reconstruct recent history
            </span>
          </div>
        </button>

        <div className="h-px bg-slate-800 my-1 mx-2" />

        {/* Run a Flow */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onOpenRunFlow();
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium hover:bg-slate-800 text-slate-200 hover:text-slate-100 transition-colors cursor-pointer"
        >
          <span className="p-1 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            ▶
          </span>
          <span className="font-medium text-slate-200">Run a Flow</span>
        </button>

        {/* My Flows */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onOpenMyFlows();
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium hover:bg-slate-800 text-slate-200 hover:text-slate-100 transition-colors cursor-pointer"
        >
          <span className="p-1 rounded-md bg-sky-500/15 text-sky-400 border border-sky-500/30">
            ⚡
          </span>
          <span className="font-medium text-slate-200">My Flows</span>
        </button>
      </div>
    </div>
  );
};

export default BrowserFlowsPopover;
