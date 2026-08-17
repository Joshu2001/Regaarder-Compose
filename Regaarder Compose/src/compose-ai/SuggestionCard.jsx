/**
 * SuggestionCard.jsx
 *
 * Reusable card component for AI agent suggestions.
 * Supports three actions: Preview (hover), Apply (commit), Ignore (dismiss + learns).
 * Applied state shows a compact green confirmation; Ignored suggestions vanish cleanly.
 */
import React from 'react';
import { Eye, Check, X } from 'lucide-react';

const SEVERITY = {
  critical: {
    dot:       'bg-rose-500',
    border:    'border-rose-100 dark:border-rose-900/40',
    header:    'bg-rose-50 dark:bg-rose-950/30 border-b border-rose-100 dark:border-rose-900/40',
    label:     'text-rose-600 dark:text-rose-400',
    badge:     'Critical',
  },
  warning: {
    dot:       'bg-amber-500',
    border:    'border-amber-100 dark:border-amber-900/40',
    header:    'bg-amber-50 dark:bg-amber-950/30 border-b border-amber-100 dark:border-amber-900/40',
    label:     'text-amber-700 dark:text-amber-400',
    badge:     'Suggested',
  },
  info: {
    dot:       'bg-sky-400',
    border:    'border-sky-100 dark:border-sky-900/40',
    header:    'bg-sky-50 dark:bg-sky-950/30 border-b border-sky-100 dark:border-sky-900/40',
    label:     'text-sky-700 dark:text-sky-400',
    badge:     'Optional',
  },
};

export const SuggestionCard = ({ suggestion, status = 'pending', onPreview, onCancelPreview, onApply, onIgnore }) => {
  if (status === 'ignored') return null;

  if (status === 'applied') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-xl text-xs font-medium text-emerald-700 dark:text-emerald-400 animate-in fade-in duration-200">
        <Check size={12} className="shrink-0" />
        <span className="truncate">{suggestion.issue}</span>
        <span className="ml-auto text-[10px] text-emerald-500 shrink-0">Applied ✓</span>
      </div>
    );
  }

  const sev = SEVERITY[suggestion.severity] || SEVERITY.info;

  return (
    <div className={`rounded-xl border bg-white dark:bg-zinc-900 ${sev.border} shadow-2xs overflow-hidden animate-in fade-in slide-in-from-bottom-1 duration-200`}>
      {/* Header row */}
      <div className={`flex items-center gap-2 px-3 py-2 ${sev.header}`}>
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sev.dot}`} />
        <span className={`text-[11px] font-semibold ${sev.label} flex-1 truncate`}>{suggestion.issue}</span>
        {suggestion.fallacy && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded-md bg-white/60 dark:bg-zinc-800/60 border ${sev.border} ${sev.label} font-medium shrink-0`}>
            {suggestion.fallacy}
          </span>
        )}
        <span className={`text-[10px] ${sev.label} opacity-60 shrink-0`}>{sev.badge}</span>
      </div>

      {/* Excerpt */}
      {suggestion.excerpt && (
        <div className="px-3 pt-2.5">
          <p className="text-[11.5px] text-slate-400 dark:text-zinc-500 italic leading-relaxed line-clamp-2">
            "{suggestion.excerpt}"
          </p>
        </div>
      )}

      {/* Explanation */}
      <div className="px-3 pt-1.5 pb-2">
        <p className="text-[12px] text-slate-700 dark:text-zinc-300 leading-relaxed">{suggestion.explanation}</p>

        {/* Research recommendation */}
        {suggestion.recommendation && (
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">{suggestion.recommendation}</p>
        )}

        {/* Consistency canonical term */}
        {suggestion.canonical && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-slate-500 dark:text-zinc-400">Use:</span>
            <code className="font-semibold text-slate-800 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
              "{suggestion.canonical}"
            </code>
            {suggestion.variants?.length > 0 && (
              <span className="text-slate-400 dark:text-zinc-500">
                instead of {suggestion.variants.map(v => `"${v}"`).join(', ')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action row */}
      <div className="flex items-center gap-1.5 px-3 pb-2.5">
        {suggestion.fix && (
          <button
            type="button"
            onMouseEnter={() => onPreview?.(suggestion.id, suggestion.fix)}
            onMouseLeave={() => onCancelPreview?.(suggestion.id)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 text-[11px] font-medium transition-colors"
            title="Hover to preview change in document"
          >
            <Eye size={11} /> Preview
          </button>
        )}
        {suggestion.fix && (
          <button
            type="button"
            onClick={() => onApply?.(suggestion)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-semibold transition-colors"
          >
            <Check size={11} /> Apply
          </button>
        )}
        <button
          type="button"
          onClick={() => onIgnore?.(suggestion)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-400 dark:text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-600 dark:hover:text-zinc-300 text-[11px] font-medium transition-colors ml-auto"
          title="Ignore and teach AI your preference"
        >
          <X size={11} /> Ignore
        </button>
      </div>
    </div>
  );
};
