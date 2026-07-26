/**
 * AudiencePanel.jsx
 *
 * 12-audience grid for the Audience Agent.
 * Clicking an audience tile immediately triggers rewriting and
 * shows a live preview of the adapted excerpt in the panel.
 */
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

const AUDIENCES = [
  { key: 'CEO',           label: 'CEO',          emoji: '👔' },
  { key: 'Investors',     label: 'Investors',    emoji: '📈' },
  { key: 'Professor',     label: 'Professor',    emoji: '🎓' },
  { key: 'Customers',     label: 'Customers',    emoji: '🛍️' },
  { key: 'Scientists',    label: 'Scientists',   emoji: '🔬' },
  { key: 'Engineers',     label: 'Engineers',    emoji: '⚙️' },
  { key: 'Lawyers',       label: 'Lawyers',      emoji: '⚖️' },
  { key: 'Government',    label: 'Government',   emoji: '🏛️' },
  { key: 'Employees',     label: 'Employees',    emoji: '💼' },
  { key: 'Children',      label: 'Children',     emoji: '🎈' },
  { key: 'High School',   label: 'High School',  emoji: '📚' },
  { key: 'General Public',label: 'General',      emoji: '🌍' },
];

export const AudiencePanel = ({ isLoading, onAdaptForAudience, lastResult, lastAudience }) => {
  const [selected, setSelected] = useState(null);

  const handleSelect = (audience) => {
    setSelected(audience.key);
    onAdaptForAudience(audience.key);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto thin-scrollbar p-4 gap-5">
      <div>
        <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Select Audience</p>
        <div className="grid grid-cols-3 gap-2">
          {AUDIENCES.map(a => (
            <button
              key={a.key}
              type="button"
              disabled={isLoading}
              onClick={() => handleSelect(a)}
              className={`flex flex-col items-center gap-1 py-3 px-1 rounded-xl border text-center transition-all disabled:opacity-50 ${
                selected === a.key
                  ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800'
                  : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800'
              }`}
            >
              <span className="text-[20px] leading-none">{a.emoji}</span>
              <span className={`text-[10px] font-semibold leading-tight mt-0.5 ${
                selected === a.key ? 'text-purple-700 dark:text-purple-400' : 'text-slate-600 dark:text-zinc-300'
              }`}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2.5 text-[12px] text-slate-500 dark:text-zinc-400 py-2">
          <Loader2 size={14} className="animate-spin text-purple-500 shrink-0" />
          Adapting for {selected}…
        </div>
      )}

      {lastResult && !isLoading && (
        <div>
          <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
            Preview — {lastAudience || selected}
          </p>
          <div className="bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 p-3.5">
            <p className="text-[12.5px] text-slate-700 dark:text-zinc-300 leading-relaxed line-clamp-8">
              {lastResult}
            </p>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-2 text-center">
            Full adapted version available in the Assistant chat.
          </p>
        </div>
      )}
    </div>
  );
};
