import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Shield, ShieldAlert, Zap, Monitor, Cloud, ChevronUp } from 'lucide-react';
import { 
  getCurrentAutonomyTier, 
  subscribeToAutonomyTier 
} from '../../services/actionPolicyEngine.js';
import AutonomyRangePopover from './AutonomyRangePopover.jsx';

/**
 * PromptAutonomyBar
 *
 * Micro-subbar placed directly beneath the AI prompt box (referencing VS Code/Antigravity design):
 * - Displays execution engine (e.g. "Local" / "Cloud")
 * - Displays active permission tier (e.g. "Default permissions", "Drafts only")
 * - Dynamic gliding disclosure: subtle resting state that slides into sharp focus on container hover/focus
 * - Smoothly anchors the AutonomyRangePopover on pointer click
 */
export default function PromptAutonomyBar({ isLocal = false, engineLabel = null }) {
  const [currentTier, setCurrentTier] = useState(() => getCurrentAutonomyTier());
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const unsub = subscribeToAutonomyTier(tier => {
      setCurrentTier(tier);
    });
    return unsub;
  }, []);

  const handleTogglePopover = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isPopoverOpen) {
      setIsPopoverOpen(false);
    } else if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setAnchorRect(rect);
      setIsPopoverOpen(true);
    }
  };

  const runtimeLabel = engineLabel || (isLocal ? 'Local' : 'Cloud');

  const getTierIcon = () => {
    if (currentTier.id === 'DRAFT_ONLY') return <ShieldAlert size={12} className="text-amber-500" />;
    if (currentTier.id === 'FULL_AUTONOMOUS') return <Zap size={12} className="text-violet-500" />;
    return <ShieldCheck size={12} className="text-slate-500 dark:text-zinc-400 group-hover:text-violet-600 dark:group-hover:text-violet-400" />;
  };

  return (
    <div className="relative w-full pt-1 pb-0.5 px-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 transition-all duration-200 ease-out select-none">
      {/* Left side items: Engine & Permissions trigger */}
      <div className="flex items-center gap-3.5">
        {/* Runtime Execution Indicator */}
        <div 
          className="flex items-center gap-1.5 opacity-75 hover:opacity-100 transition-opacity cursor-default"
          title={isLocal ? "Running on local machine hardware (Ollama/GGUF)" : "Running on cloud inference engine"}
        >
          {isLocal ? (
            <Monitor size={12} className="text-emerald-500" />
          ) : (
            <Cloud size={12} className="text-sky-500" />
          )}
          <span className="font-medium text-[11px] text-slate-600 dark:text-zinc-400">
            {runtimeLabel}
          </span>
        </div>

        {/* Autonomy Dial Trigger */}
        <button
          ref={triggerRef}
          type="button"
          data-autonomy-trigger="true"
          onPointerDown={handleTogglePopover}
          className={`group flex items-center gap-1.5 py-0.5 px-1.5 rounded-md transition-all cursor-pointer ${
            isPopoverOpen
              ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 ring-1 ring-violet-500/30'
              : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
          }`}
          title="Click to tune agent permissions & autonomy dial"
        >
          {getTierIcon()}
          <span className="font-medium text-[11px]">
            {currentTier.shortLabel || currentTier.label}
          </span>
          <ChevronUp 
            size={10} 
            className={`text-slate-400 transition-transform duration-150 ${isPopoverOpen ? 'rotate-180 text-violet-600' : 'opacity-60'}`} 
          />
        </button>
      </div>

      {/* Right side item: Activity Journal Timeline Trigger */}
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (typeof window !== 'undefined' && window.__REGAARDER_OPEN_AGENT_JOURNAL__) {
            window.__REGAARDER_OPEN_AGENT_JOURNAL__();
          }
        }}
        className="flex items-center gap-1.5 py-0.5 px-2 rounded-md hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
        title="View today's executive agent activity journal and timeline"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span className="font-medium text-[10.5px]">Today's Activity</span>
      </button>

      {/* Floating Range Popover */}
      {isPopoverOpen && (
        <AutonomyRangePopover
          anchorRect={anchorRect}
          onClose={() => setIsPopoverOpen(false)}
        />
      )}
    </div>
  );
}
