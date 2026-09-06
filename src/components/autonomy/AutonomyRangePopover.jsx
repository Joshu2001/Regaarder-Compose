import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, ShieldAlert, ShieldCheck, Zap, Sliders, Check, 
  ChevronRight, AlertTriangle, GitPullRequest, DollarSign, Info, X
} from 'lucide-react';
import { 
  AUTONOMY_TIERS, 
  getCurrentAutonomyTier, 
  setAutonomyTier,
  subscribeToAutonomyTier 
} from '../../services/actionPolicyEngine.js';

/**
 * AutonomyRangePopover
 *
 * Executive Apple-tier floating popover providing a visual, interactive dial
 * across the 4 autonomy tiers (Draft Only -> Default -> High -> Full Autonomous).
 *
 * Conforms strictly to:
 * - Rule 3: Apple aesthetics, slightly rounded rectangles (no pill tabs)
 * - Rule 5: Dynamic anchoring via getBoundingClientRect & outside-click dismissal
 * - Rule 6: Touch-safe onPointerDown handlers
 */
export default function AutonomyRangePopover({ anchorRect, onClose }) {
  const [currentTier, setCurrentTier] = useState(() => getCurrentAutonomyTier());
  const [customThreshold, setCustomThreshold] = useState(() => currentTier.activeThreshold || 500);
  const popoverRef = useRef(null);

  useEffect(() => {
    const unsub = subscribeToAutonomyTier(tier => {
      setCurrentTier(tier);
      if (tier.activeThreshold !== undefined && tier.activeThreshold !== null && tier.activeThreshold !== Infinity) {
        setCustomThreshold(tier.activeThreshold);
      }
    });
    return unsub;
  }, []);

  // Calculate dynamic coordinates with screen edge protection
  const popoverStyle = React.useMemo(() => {
    if (!anchorRect) {
      return { bottom: 60, right: 16 };
    }
    const width = 340;
    const padding = 12;
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    
    let left = anchorRect.left;
    if (left + width > windowWidth - padding) {
      left = windowWidth - width - padding;
    }
    if (left < padding) left = padding;

    // Anchor strictly above anchor element
    let bottom = (window.innerHeight - anchorRect.top) + 8;
    return {
      position: 'fixed',
      left: `${left}px`,
      bottom: `${bottom}px`,
      width: `${width}px`,
      zIndex: 9999
    };
  }, [anchorRect]);

  // Click outside dismissal with data-popover guard
  useEffect(() => {
    const handlePointerDownOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        if (e.target?.closest?.('[data-autonomy-trigger]')) return;
        onClose?.();
      }
    };
    document.addEventListener('pointerdown', handlePointerDownOutside);
    return () => document.removeEventListener('pointerdown', handlePointerDownOutside);
  }, [onClose]);

  const handleSelectTier = (tierKey) => {
    const tierDef = AUTONOMY_TIERS[tierKey];
    const thresholdToSet = tierDef.id === 'DRAFT_ONLY' ? 0 : tierDef.id === 'FULL_AUTONOMOUS' ? null : customThreshold;
    setAutonomyTier(tierKey, thresholdToSet);
  };

  const handleThresholdChange = (newVal) => {
    const parsed = Number(newVal);
    setCustomThreshold(parsed);
    setAutonomyTier(currentTier.id, parsed);
  };

  const tierKeys = ['DRAFT_ONLY', 'DEFAULT_PERMISSIONS', 'HIGH_AUTONOMY', 'FULL_AUTONOMOUS'];

  return (
    <div
      ref={popoverRef}
      data-popover="autonomy-range-popover"
      style={popoverStyle}
      onPointerDown={(e) => e.stopPropagation()}
      className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.12] rounded-2xl shadow-2xl p-4 text-slate-800 dark:text-zinc-100 animate-in fade-in zoom-in-95 duration-150 select-none"
    >
      {/* Popover Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <ShieldCheck size={14} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight leading-none">
              Autonomy & Permissions Dial
            </h4>
            <span className="text-[10px] text-slate-400 dark:text-zinc-400 leading-tight">
              Pre-execution guardrails & clearance
            </span>
          </div>
        </div>
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose?.();
          }}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
          title="Close dial"
        >
          <X size={13} />
        </button>
      </div>

      {/* Visual Segmented Dial (4-Stop Range) */}
      <div className="mb-3.5">
        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
          <span>Supervised</span>
          <span>Autonomous</span>
        </div>

        {/* Stepped Dial Track */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-black/[0.04] dark:bg-white/[0.05] rounded-xl border border-black/[0.04] dark:border-white/[0.06]">
          {tierKeys.map((key, idx) => {
            const tier = AUTONOMY_TIERS[key];
            const isSelected = currentTier.id === key;
            return (
              <button
                key={key}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelectTier(key);
                }}
                className={`py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs border border-black/[0.08] dark:border-zinc-700 font-bold'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 font-medium'
                }`}
              >
                <div className="text-[11px] leading-tight truncate">
                  {tier.label.split(' ')[0]}
                </div>
                <div className="text-[9px] opacity-70 tracking-tighter">
                  Tier {tier.level}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tier Card */}
      <div className="p-2.5 rounded-xl bg-violet-500/[0.04] dark:bg-violet-500/[0.08] border border-violet-500/15 mb-3.5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold text-violet-700 dark:text-violet-300 flex items-center gap-1.5">
            {currentTier.id === 'DRAFT_ONLY' && <GitPullRequest size={12} />}
            {currentTier.id === 'DEFAULT_PERMISSIONS' && <Shield size={12} />}
            {currentTier.id === 'HIGH_AUTONOMY' && <ShieldAlert size={12} />}
            {currentTier.id === 'FULL_AUTONOMOUS' && <Zap size={12} />}
            {currentTier.label}
          </span>
          <span className="text-[9px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
            {currentTier.id === 'DRAFT_ONLY' ? 'Review PR' : currentTier.id === 'FULL_AUTONOMOUS' ? 'Zero Gate' : `Auto ≤ $${currentTier.activeThreshold}`}
          </span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
          {currentTier.description}
        </p>
      </div>

      {/* Quantitative Budget Threshold Slider (for tiers 2 & 3) */}
      {(currentTier.id === 'DEFAULT_PERMISSIONS' || currentTier.id === 'HIGH_AUTONOMY') && (
        <div className="mb-3.5 p-2.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.01] dark:bg-white/[0.02]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-[11px] text-slate-700 dark:text-zinc-300 flex items-center gap-1">
              <DollarSign size={12} className="text-emerald-500" />
              Auto-Execute Limit
            </span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
              ${customThreshold.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min={100}
            max={5000}
            step={100}
            value={customThreshold}
            onChange={(e) => handleThresholdChange(e.target.value)}
            className="w-full accent-violet-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-lg"
          />
          <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1 font-mono">
            <span>$100</span>
            <span>$2,500</span>
            <span>$5,000</span>
          </div>
        </div>
      )}

      {/* Live Pre-Flight Clearance Checklist */}
      <div className="space-y-1.5 border-t border-black/[0.06] dark:border-white/[0.08] pt-2.5 text-[10.5px]">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">
          Execution Clearance
        </div>
        <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
          <span>Read & Research Operations:</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Check size={11} /> Auto-execute
          </span>
        </div>
        <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
          <span>Sheet & Matrix Calculations:</span>
          <span className="font-semibold text-slate-800 dark:text-zinc-200">
            {currentTier.id === 'DRAFT_ONLY' ? (
              <span className="text-amber-600 dark:text-amber-400">Requires PR</span>
            ) : currentTier.id === 'FULL_AUTONOMOUS' ? (
              <span className="text-emerald-600 dark:text-emerald-400">Auto-execute</span>
            ) : (
              `Auto under $${customThreshold}`
            )}
          </span>
        </div>
        <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
          <span>Destructive Tool Actions:</span>
          <span className="font-semibold text-slate-800 dark:text-zinc-200">
            {currentTier.id === 'FULL_AUTONOMOUS' ? (
              <span className="text-rose-600 dark:text-rose-400">Auto Allowed</span>
            ) : (
              <span className="text-violet-600 dark:text-violet-400">Quarantined to PR</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
