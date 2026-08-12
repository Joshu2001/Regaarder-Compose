import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Type, Minus, Plus, RotateCcw, Check, Sparkles } from 'lucide-react';

const BROWSER_FONT_OPTIONS = [
  { id: 'System Default', label: 'System Default', stack: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  { id: 'Inter', label: 'Inter Modern', stack: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  { id: 'Manrope', label: 'Manrope Clean', stack: 'Manrope, Inter, sans-serif' },
  { id: 'SF Pro Display', label: 'SF Pro Display', stack: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' },
  { id: 'Georgia', label: 'Georgia Editorial', stack: 'Georgia, Cambria, "Times New Roman", serif' },
  { id: 'Charter', label: 'Charter Serif', stack: 'Charter, Georgia, serif' },
  { id: 'JetBrains Mono', label: 'JetBrains Code', stack: '"JetBrains Mono", monospace' }
];

const BROWSER_SIZE_PRESETS = [80, 90, 100, 115, 125, 150, 175, 200];

export const BrowserFontPopover = ({
  anchorRect,
  isStandalone = false,
  browserFont = 'System Default',
  browserFontSize = 100,
  onChangeFont,
  onChangeFontSize,
  onReset,
  onClose
}) => {
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, [onClose]);

  if (!isStandalone && !anchorRect) return null;

  const top = anchorRect ? anchorRect.bottom + 6 : 0;
  const right = anchorRect ? Math.max(12, window.innerWidth - anchorRect.right) : 0;

  const containerClasses = isStandalone
    ? "w-full h-full bg-white/95 dark:bg-zinc-900/95 border border-slate-200/90 dark:border-zinc-800 shadow-2xl rounded-2xl p-4 backdrop-blur-xl font-sans select-none text-slate-800 dark:text-zinc-100 flex flex-col justify-between"
    : "fixed z-[99999] w-[310px] bg-white/95 dark:bg-zinc-900/95 border border-slate-200/90 dark:border-zinc-800 shadow-[0_12px_36px_-6px_rgba(15,23,42,0.18)] dark:shadow-[0_12px_36px_-6px_rgba(0,0,0,0.6)] rounded-2xl p-4 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 font-sans select-none text-slate-800 dark:text-zinc-100";

  const containerStyle = isStandalone ? {} : { top: `${top}px`, right: `${right}px` };

  const content = (
    <div
      ref={popoverRef}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className={containerClasses}
      style={containerStyle}
    >
      {/* Popover Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <Type size={15} />
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              Browser Display Options
            </h4>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
              Isolated Browser Typography & Zoom
            </p>
          </div>
        </div>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onReset();
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          title="Reset Browser Font & Size"
        >
          <RotateCcw size={13} />
        </button>
      </div>

      {/* Font Size & Zoom Stepper */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
            Browser Font Size / Zoom
          </span>
          <span className="text-xs font-bold text-violet-600 dark:text-violet-400 font-mono bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 rounded-md border border-violet-200/50 dark:border-violet-800/40">
            {browserFontSize}%
          </span>
        </div>

        {/* Stepper Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onChangeFontSize(Math.max(70, browserFontSize - 10));
            }}
            disabled={browserFontSize <= 70}
            className="flex-1 h-8 rounded-lg border border-slate-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700/60 disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center transition-colors cursor-pointer"
            title="Decrease Browser Text Size"
          >
            <Minus size={14} />
          </button>

          <div className="flex gap-1 overflow-x-auto thin-scrollbar py-0.5">
            {BROWSER_SIZE_PRESETS.slice(0, 4).map((size) => (
              <button
                key={`preset-${size}`}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onChangeFontSize(size);
                }}
                className={`px-2 py-1 text-[11px] font-semibold rounded-md border transition-all cursor-pointer ${
                  browserFontSize === size
                    ? 'bg-violet-600 text-white border-violet-600 shadow-2xs'
                    : 'bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:border-slate-300'
                }`}
              >
                {size}%
              </button>
            ))}
          </div>

          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onChangeFontSize(Math.min(220, browserFontSize + 10));
            }}
            disabled={browserFontSize >= 220}
            className="flex-1 h-8 rounded-lg border border-slate-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700/60 disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center transition-colors cursor-pointer"
            title="Increase Browser Text Size"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Font Family Selection List */}
      <div className="space-y-1.5 mb-3">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
          Browser Font Family
        </span>
        <div className="max-h-[180px] overflow-y-auto thin-scrollbar space-y-1 pr-0.5">
          {BROWSER_FONT_OPTIONS.map((opt) => {
            const isSelected = browserFont === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onChangeFont(opt.id);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                  isSelected
                    ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-semibold border border-violet-200 dark:border-violet-800/60'
                    : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100/70 dark:hover:bg-zinc-800/80 border border-transparent'
                }`}
                style={{ fontFamily: opt.stack }}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={14} className="text-violet-600 dark:text-violet-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scope Footer Notification */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-zinc-500">
        <Sparkles size={12} className="text-violet-500 shrink-0" />
        <span>Browser view only. Document typography remains untouched.</span>
      </div>
    </div>
  );

  if (isStandalone) return content;

  const targetNode = document.fullscreenElement ?? document.body;
  return createPortal(content, targetNode);
};

export default BrowserFontPopover;
