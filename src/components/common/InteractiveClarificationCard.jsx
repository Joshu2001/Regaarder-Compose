import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Edit3, CornerDownLeft } from 'lucide-react';
import { RegaarderAiIcon } from '../RegaarderProductIcons';

/**
 * InteractiveClarificationCard
 * 
 * Adaptive clarification & multi-choice card displayed when AI agents
 * detect ambiguity or need user decision input.
 * 
 * Variants:
 * - 'docked': Full-width floating card docked directly above chat composer (Relay / Full Assistant).
 * - 'compact': Space-efficient layout for Orb Decide Synthesizer and narrow sidebars.
 * - 'inline': Embedded directly within the message bubble stream or canvas popovers.
 */
export default function InteractiveClarificationCard({
  clarification,
  onSelectOption,
  onCustomReply,
  onSkip,
  onDismiss,
  onNextQuestion,
  onPrevQuestion,
  variant = 'docked',
  isDarkMode = false,
  className = ''
}) {
  if (!clarification || !clarification.question) return null;

  const {
    question = '',
    options = [],
    allowCustom = true,
    allowSkip = true,
    pageIndex = 0,
    totalQuestions = 1
  } = clarification;

  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const cardRef = useRef(null);

  // Normalize options array into { id, label, value, hint } objects
  const normalizedOptions = (options || []).map((opt, idx) => {
    if (typeof opt === 'string') {
      return { id: `opt-${idx}`, label: opt, value: opt, hint: null };
    }
    return {
      id: opt.id || `opt-${idx}`,
      label: opt.label || opt.value || `Option ${idx + 1}`,
      value: opt.value || opt.label || '',
      hint: opt.hint || null
    };
  });

  // Global Keyboard Navigation (Single key 1-9, ArrowUp/Down, Enter, Esc)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') && activeEl.value?.trim().length > 0;

      if (e.key === 'Escape') {
        e.preventDefault();
        if (onDismiss) onDismiss();
        else if (onSkip) onSkip();
        return;
      }

      if (isTyping) return;

      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= normalizedOptions.length) {
        e.preventDefault();
        const selected = normalizedOptions[num - 1];
        if (selected && onSelectOption) {
          onSelectOption(selected.label, num - 1);
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < normalizedOptions.length - 1 ? prev + 1 : 0));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : normalizedOptions.length - 1));
        return;
      }

      if (e.key === 'Enter' && !activeEl?.closest('form') && !isTyping) {
        if (normalizedOptions[highlightedIndex] && onSelectOption) {
          e.preventDefault();
          onSelectOption(normalizedOptions[highlightedIndex].label, highlightedIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [normalizedOptions, highlightedIndex, onSelectOption, onDismiss, onSkip]);

  const isCompact = variant === 'compact';
  const isInline = variant === 'inline';

  return (
    <div
      ref={cardRef}
      role="region"
      aria-label="Agent Clarification"
      className={`select-none transition-all duration-200 animate-in fade-in zoom-in-98 ${
        isCompact
          ? 'p-2.5 rounded-xl bg-white/95 dark:bg-zinc-900/95 border border-slate-200/90 dark:border-zinc-800 shadow-lg text-xs'
          : isInline
          ? 'p-3 rounded-xl bg-slate-50/90 dark:bg-zinc-850/90 border border-slate-200/80 dark:border-zinc-700/80 my-2'
          : 'p-3.5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.1] shadow-2xl text-xs'
      } ${className}`}
    >
      {/* ── Header: Title, Carousel Paging, & Dismiss ── */}
      <div className="flex items-center justify-between gap-2 pb-2 mb-1.5 border-b border-black/[0.05] dark:border-white/[0.06]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded-lg bg-violet-600/10 dark:bg-violet-400/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <RegaarderAiIcon size={12} strokeWidth={2.0} />
          </div>
          <span className={`font-semibold text-slate-900 dark:text-zinc-100 truncate ${isCompact ? 'text-[11.5px]' : 'text-[13px]'}`}>
            {question}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Carousel Pagination (if multiple questions) */}
          {totalQuestions > 1 && (
            <div className="flex items-center gap-1 text-[10.5px] font-mono font-medium text-slate-400 dark:text-zinc-500 mr-1.5 bg-black/[0.03] dark:bg-white/[0.05] px-1.5 py-0.5 rounded-md">
              <button
                type="button"
                onClick={onPrevQuestion}
                disabled={pageIndex <= 0}
                className="p-0.5 rounded hover:text-slate-800 dark:hover:text-zinc-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                title="Previous question"
              >
                <ChevronLeft size={11} />
              </button>
              <span>{pageIndex + 1} of {totalQuestions}</span>
              <button
                type="button"
                onClick={onNextQuestion}
                disabled={pageIndex >= totalQuestions - 1}
                className="p-0.5 rounded hover:text-slate-800 dark:hover:text-zinc-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                title="Next question"
              >
                <ChevronRight size={11} />
              </button>
            </div>
          )}

          {/* Dismiss Button */}
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Dismiss clarification (Esc)"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── Option Choice Rows (Numbered, Apple-style slightly rounded rectangles) ── */}
      <div className="space-y-1">
        {normalizedOptions.map((opt, idx) => {
          const isHighlighted = idx === highlightedIndex;
          return (
            <button
              key={opt.id}
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setHighlightedIndex(idx);
                if (onSelectOption) onSelectOption(opt.label, idx);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-all duration-150 cursor-pointer border ${
                isHighlighted
                  ? 'bg-violet-50/80 dark:bg-violet-950/40 border-violet-300/80 dark:border-violet-700/60 shadow-xs'
                  : 'bg-black/[0.015] dark:bg-white/[0.02] hover:bg-black/[0.035] dark:hover:bg-white/[0.05] border-transparent hover:border-black/[0.04] dark:hover:border-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {/* Number Shortcut Badge */}
                <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono text-[10.5px] font-bold shrink-0 transition-colors ${
                  isHighlighted
                    ? 'bg-violet-600 text-white shadow-2xs'
                    : 'bg-black/[0.05] dark:bg-white/[0.08] text-slate-600 dark:text-zinc-400'
                }`}>
                  {idx + 1}
                </span>

                {/* Option Label & Optional Subtitle */}
                <div className="min-w-0 flex-1">
                  <p className={`font-medium truncate ${isCompact ? 'text-[11.5px]' : 'text-xs'} ${
                    isHighlighted ? 'text-violet-900 dark:text-violet-200 font-semibold' : 'text-slate-800 dark:text-zinc-200'
                  }`}>
                    {opt.label}
                  </p>
                  {opt.hint && (
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate leading-tight">
                      {opt.hint}
                    </p>
                  )}
                </div>
              </div>

              {isHighlighted && (
                <CornerDownLeft size={12} className="text-violet-500 shrink-0 ml-2 opacity-80" />
              )}
            </button>
          );
        })}

        {/* "Something else" / Write-in option */}
        {allowCustom && onCustomReply && (
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onCustomReply();
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-left text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors cursor-pointer border border-transparent hover:border-black/[0.04]"
          >
            <span className="w-5 h-5 rounded-md bg-black/[0.03] dark:bg-white/[0.05] flex items-center justify-center text-slate-400 shrink-0">
              <Edit3 size={11} />
            </span>
            <span className={`font-medium ${isCompact ? 'text-[11.5px]' : 'text-xs'}`}>
              Something else
            </span>
          </button>
        )}
      </div>

      {/* ── Footer: Keyboard Helper & Skip ── */}
      <div className="flex items-center justify-between pt-2 mt-1.5 border-t border-black/[0.04] dark:border-white/[0.05] text-[10.5px] text-slate-400 dark:text-zinc-500 select-none">
        <div className="hidden sm:flex items-center gap-2 font-mono text-[10px]">
          <span>[1-{normalizedOptions.length}] quick choose</span>
          <span>•</span>
          <span>[↑][↓] navigate</span>
          <span>•</span>
          <span>[↵] select</span>
        </div>

        {allowSkip && onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="ml-auto px-2 py-0.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors font-medium cursor-pointer"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
