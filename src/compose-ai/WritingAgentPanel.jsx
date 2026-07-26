/**
 * WritingAgentPanel.jsx
 *
 * Controls for content creation and transformation.
 * Tone picker (9 tones) + grouped action buttons (Transform / Generate / Analyze).
 * The selected tone is applied to all subsequent generation actions.
 */
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

const TONES = [
  { key: 'professional',   label: 'Professional' },
  { key: 'formal',         label: 'Formal' },
  { key: 'casual',         label: 'Casual' },
  { key: 'persuasive',     label: 'Persuasive' },
  { key: 'humorous',       label: 'Humorous' },
  { key: 'academic',       label: 'Academic' },
  { key: 'technical',      label: 'Technical' },
  { key: 'executive',      label: 'Executive' },
  { key: 'conversational', label: 'Conversational' },
];

const ACTION_GROUPS = [
  {
    label: 'Transform',
    actions: [
      { key: 'rewrite',  label: 'Rewrite' },
      { key: 'expand',   label: 'Expand' },
      { key: 'shorten',  label: 'Shorten' },
    ],
  },
  {
    label: 'Generate',
    actions: [
      { key: 'continue',      label: 'Continue' },
      { key: 'brainstorm',    label: 'Brainstorm' },
      { key: 'introduction',  label: 'Introduction' },
      { key: 'conclusion',    label: 'Conclusion' },
      { key: 'abstract',      label: 'Abstract' },
      { key: 'summary',       label: 'Summary' },
      { key: 'title',         label: 'Titles' },
    ],
  },
  {
    label: 'Analyze',
    actions: [
      { key: 'explain',   label: 'Explain' },
      { key: 'translate', label: 'Translate' },
    ],
  },
];

export const WritingAgentPanel = ({ isLoading, onRunAction, selectedText, hasDocument }) => {
  const [activeTone,   setActiveTone]   = useState('professional');
  const [activeAction, setActiveAction] = useState(null);

  const canRun = selectedText || hasDocument;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto thin-scrollbar p-4 gap-5">
      {/* Tone picker */}
      <div>
        <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2.5">Tone</p>
        <div className="flex flex-wrap gap-1.5">
          {TONES.map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTone(t.key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                activeTone === t.key
                  ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                  : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action groups */}
      {ACTION_GROUPS.map(group => (
        <div key={group.label}>
          <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2.5">{group.label}</p>
          <div className="flex flex-wrap gap-1.5">
            {group.actions.map(a => {
              const isRunning = isLoading && activeAction === a.key;
              return (
                <button
                  key={a.key}
                  type="button"
                  disabled={isLoading || !canRun}
                  onClick={() => {
                    setActiveAction(a.key);
                    onRunAction(a.key, activeTone);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    isRunning
                      ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800'
                      : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:border-slate-300 dark:hover:border-zinc-600'
                  }`}
                >
                  {isRunning && <Loader2 size={10} className="animate-spin shrink-0" />}
                  {a.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {!canRun && (
        <div className="text-[11.5px] text-slate-400 dark:text-zinc-500 bg-slate-50 dark:bg-zinc-800/60 rounded-xl p-3 border border-slate-100 dark:border-zinc-700 leading-relaxed">
          Select text in your document, or write something first to use the Writing Agent.
        </div>
      )}
    </div>
  );
};
