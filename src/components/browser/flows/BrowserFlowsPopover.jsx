import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { BrowserFlowIcon, BrowserRecordIcon } from '../RegaarderBrowserIcons';

/**
 * BrowserFlowsPopover: Executive Apple-style popover for Regaarder Browser Flows
 * Features touch-safe `onPointerDown` listeners and dynamic positioning relative to anchorRect.
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

  // Global click outside listener (deferred to prevent initiating pointerdown from closing immediately)
  useEffect(() => {
    if (isStandalone) return;
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
  }, [onClose, isStandalone]);

  if (!anchorRect && !isStandalone) return null;

  // Calculate dynamic top/left position below the anchor button
  const top = anchorRect ? anchorRect.bottom + 6 : 0;
  const right = anchorRect ? window.innerWidth - anchorRect.right : 0;

  const content = (
    <div
      ref={popoverRef}
      style={isStandalone ? {} : { top: `${top}px`, right: `${Math.max(12, right)}px` }}
      className={`${
        isStandalone
          ? 'relative z-50 w-full max-w-sm border border-slate-700/80 shadow-2xl'
          : 'fixed z-50 w-64 border border-slate-700/80 shadow-2xl animate-in fade-in duration-150'
      } bg-slate-900/95 dark:bg-slate-900/95 rounded-2xl backdrop-blur-xl font-sans select-none text-slate-100 overflow-hidden`}
    >
      {/* Header */}
      <div className="px-3.5 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-violet-500/20 text-violet-400 border border-violet-500/30">
            <BrowserFlowIcon size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 leading-none">Regaarder Flows</h3>
            <p className="text-[10px] text-slate-400 font-medium leading-tight">Automate research & extraction</p>
          </div>
        </div>
      </div>

      {/* Menu Actions */}
      <div className="p-2 space-y-1 text-xs">
        {/* Record Flow */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onStartRecording();
            onClose();
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-medium transition-colors cursor-pointer ${
            isRecording
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
              : 'hover:bg-slate-800 text-slate-200 hover:text-slate-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className={`p-1 rounded-md border ${isRecording ? 'bg-rose-500/30 border-rose-500 text-rose-400 animate-pulse' : 'bg-rose-500/15 border-rose-500/30 text-rose-400'}`}>
              <BrowserRecordIcon size={14} />
            </span>
            <span className="font-semibold">{isRecording ? 'Stop Recording Session' : 'Record New Flow'}</span>
          </div>
          {isRecording && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
        </button>

        {/* Save Recent Activity as Flow */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onSaveRecentAsFlow();
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium hover:bg-slate-800 text-slate-200 hover:text-slate-100 transition-colors cursor-pointer"
        >
          <span className="p-1 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30">
            ⚡
          </span>
          <span className="font-medium text-slate-200">Synthesize from Recent</span>
        </button>

        {/* Run Flow */}
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
            ⚙
          </span>
          <span className="font-medium text-slate-200">My Flows</span>
        </button>
      </div>
    </div>
  );

  if (isStandalone) return content;

  const targetNode = document.fullscreenElement ?? document.body;
  return createPortal(content, targetNode);
};

export default BrowserFlowsPopover;
