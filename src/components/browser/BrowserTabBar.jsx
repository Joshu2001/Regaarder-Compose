import React from 'react';
import { Plus, X, RotateCw, Globe } from 'lucide-react';

/**
 * BrowserTabBar: Executive Apple-tier Browser Tab Bar
 * Rules Enforced:
 * - Tabs are slightly rounded rectangles (rounded-lg / rounded-md), NEVER pill-shaped or elliptical.
 * - Active tab uses "outline" styling rather than generic highlights.
 */
export const BrowserTabBar = ({
  tabs = [],
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab
}) => {
  return (
    <div className="flex items-center gap-1.5 px-3 pt-2 pb-1 bg-slate-100/90 dark:bg-[#18181b]/90 border-b border-slate-200/80 dark:border-zinc-800/80 select-none overflow-x-auto no-scrollbar shrink-0">
      <div className="flex items-center gap-1 min-w-0 flex-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              onPointerDown={(e) => {
                // Prevent focus blur disruption across pointer/touch
                if (e.target.closest('button')) return;
                onSelectTab(tab.id);
              }}
              className={`group relative flex items-center gap-2 px-3 py-1.5 min-w-[140px] max-w-[220px] flex-1 rounded-md text-xs font-medium cursor-pointer transition-all duration-150 border ${
                isActive
                  ? 'bg-white dark:bg-[#27272a] text-violet-600 dark:text-violet-400 border-violet-500/30 dark:border-violet-400/40 ring-1 ring-violet-500/20 shadow-xs'
                  : 'bg-slate-200/50 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-400 border-transparent hover:bg-slate-200/80 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              {/* Active Tab Outline Visual Indicator Bar */}
              {isActive && (
                <div className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-violet-600 dark:bg-violet-400" />
              )}

              {/* Favicon / Icon */}
              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                {tab.isLoading ? (
                  <RotateCw className="w-3.5 h-3.5 animate-spin text-violet-500" />
                ) : tab.favicon ? (
                  <img
                    src={tab.favicon}
                    alt=""
                    className="w-3.5 h-3.5 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <Globe className="w-3.5 h-3.5 opacity-70" />
                )}
              </div>

              {/* Tab Title */}
              <span className="truncate flex-1 text-[12px] leading-tight font-medium">
                {tab.title || 'New Tab'}
              </span>

              {/* Close Tab Button */}
              {tabs.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className={`p-0.5 rounded transition-colors shrink-0 opacity-0 group-hover:opacity-100 ${
                    isActive
                      ? 'hover:bg-violet-100 dark:hover:bg-violet-900/40 text-violet-600 dark:text-violet-300'
                      : 'hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400'
                  }`}
                  title="Close tab"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* New Tab Button */}
      <button
        type="button"
        onClick={onNewTab}
        onPointerDown={(e) => e.preventDefault()}
        className="flex items-center justify-center w-7 h-7 rounded-md text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors shrink-0 cursor-pointer"
        title="Open new tab"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};

export default BrowserTabBar;
