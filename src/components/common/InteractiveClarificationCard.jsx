import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Edit3, CornerDownLeft } from 'lucide-react';
import { RegaarderAiIcon } from '../RegaarderProductIcons';

// Renders inline markdown tokens (bold, italics, code) cleanly without raw syntax leaks
const renderInlineTokens = (text) => {
  if (!text || typeof text !== 'string') return text;
  const parts = [];
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-semibold text-slate-900 dark:text-zinc-100">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={match.index} className="italic text-slate-700 dark:text-zinc-300">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={match.index} className="px-1 py-0.5 rounded bg-black/[0.05] dark:bg-white/[0.08] font-mono text-[11px]">
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : text;
};

// Normalize and parse option items into clean { id, label, value, hint }
const parseOptionItem = (opt, idx) => {
  let rawLabel = '';
  let rawHint = null;
  let rawValue = '';

  if (typeof opt === 'string') {
    rawLabel = opt.trim();
  } else if (opt && typeof opt === 'object') {
    rawLabel = (opt.label || opt.value || `Option ${idx + 1}`).trim();
    rawHint = opt.hint ? String(opt.hint).trim() : null;
    rawValue = opt.value ? String(opt.value).trim() : '';
  }

  // Detect and split title vs description if embedded in a single string:
  // Examples:
  // - "**Translating language:** I can translate languages if you give me text..."
  // - "**Generating Creative content:** I can write..."
  // - "**Provide summaries:** I can quickly..."
  // - "**Answering your questions as a resourceful assistant**: I will respond..."
  // - "Translating language: I can translate..."
  if (!rawHint && rawLabel) {
    const boldSplitMatch = rawLabel.match(/^(?:\*\*|\*)(.+?)(?:\*\*|\*)\s*:?\s*[-—]?\s*(.+)$/s);
    if (boldSplitMatch) {
      rawLabel = boldSplitMatch[1].replace(/[:*]+$/, '').trim();
      rawHint = boldSplitMatch[2].replace(/^[-—:\s]+/, '').trim();
    } else {
      const colonSplitMatch = rawLabel.match(/^([^:\n]{2,45}):\s+(.+)$/s);
      if (colonSplitMatch && !colonSplitMatch[1].startsWith('http')) {
        rawLabel = colonSplitMatch[1].replace(/[*_#`]/g, '').trim();
        rawHint = colonSplitMatch[2].trim();
      }
    }
  }

  // Strip dangling asterisks or markdown syntax from label and hint
  const cleanLabel = rawLabel
    .replace(/\*\*/g, '')
    .replace(/^\*|\*$/g, '')
    .replace(/[:\s]+$/, '')
    .trim();

  const cleanHint = rawHint
    ? rawHint
        .replace(/\*\*/g, '')
        .replace(/^\*|\*$/g, '')
        .trim()
    : null;

  const cleanValue = rawValue
    ? rawValue.replace(/\*\*/g, '').trim()
    : cleanLabel;

  return {
    id: (opt && opt.id) || `opt-${idx}`,
    label: cleanLabel || `Option ${idx + 1}`,
    value: cleanValue || cleanLabel || `Option ${idx + 1}`,
    hint: cleanHint
  };
};

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

  // Normalize options array into clean { id, label, value, hint } objects
  const normalizedOptions = (options || []).map((opt, idx) => parseOptionItem(opt, idx));

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
          onSelectOption(selected.value || selected.label, num - 1);
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
          onSelectOption(normalizedOptions[highlightedIndex].value || normalizedOptions[highlightedIndex].label, highlightedIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [normalizedOptions, highlightedIndex, onSelectOption, onDismiss, onSkip]);

  const isCompact = variant === 'compact';
  const isInline = variant === 'inline';
  const cleanQuestion = (question || '').replace(/^[-*•#\s]+/, '').replace(/\*\*/g, '').trim();

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
            {renderInlineTokens(cleanQuestion)}
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
                if (onSelectOption) onSelectOption(opt.value || opt.label, idx);
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
                  <p className={`font-semibold tracking-tight ${isCompact ? 'text-[11.5px]' : 'text-xs'} ${
                    isHighlighted ? 'text-violet-900 dark:text-violet-200' : 'text-slate-900 dark:text-zinc-100'
                  }`}>
                    {renderInlineTokens(opt.label)}
                  </p>
                  {opt.hint && (
                    <p 
                      className="text-[10.5px] text-slate-500 dark:text-zinc-400 truncate leading-snug mt-0.5"
                      title={opt.hint}
                    >
                      {renderInlineTokens(opt.hint)}
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
