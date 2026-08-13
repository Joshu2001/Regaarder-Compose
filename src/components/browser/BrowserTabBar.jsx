import React from 'react';
import { BrowserPlusIcon, BrowserCloseIcon, BrowserReloadIcon, BrowserSearchWebIcon } from './RegaarderBrowserIcons';
import { AgentsIcon, SheetIcon, ComposeIcon } from '../RegaarderProductIcons';

/**
 * BrowserTabBar: Executive Apple-tier Browser Tab Bar
 * Rules Enforced:
 * - Tabs are slightly rounded rectangles (rounded-md), NEVER pill-shaped or elliptical.
 * - Active tab uses "outline" visual state.
 * - Dynamic domain / favicon badges with Regaarder SVG icons.
 * - New Tab (+) button sits immediately adjacent to the tabs.
 * - Ellipsis (...) browser options menu sits anchored on the far right.
 */
export const BrowserTabBar = ({
  tabs = [],
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab
}) => {

  const getTabIcon = (tab) => {
    if (tab.isLoading) {
      return <BrowserReloadIcon size={16} className="animate-spin text-violet-500" />;
    }

    if (tab.url === 'regaarder://research' || tab.title === 'Regaarder Research') {
      return <AgentsIcon size={16} className="text-violet-500" />;
    }

    if (tab.favicon) {
      return (
        <img
          src={tab.favicon}
          alt=""
          className="w-4 h-4 object-contain"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      );
    }

    const titleLower = (tab.title || '').toLowerCase();

    if (titleLower.includes('sheet') || titleLower.includes('data') || titleLower.includes('matrix')) {
      return <SheetIcon size={16} className="text-emerald-500" />;
    }

    if (titleLower.includes('research') || titleLower.includes('doc') || titleLower.includes('wiki')) {
      return <ComposeIcon size={16} className="text-sky-500" />;
    }

    return <BrowserSearchWebIcon size={16} className="opacity-70 text-slate-400 dark:text-zinc-400" />;
  };

  const getDisplayTitle = (tab) => {
    if (tab.url === 'regaarder://research') return 'Regaarder Research';
    if (!tab.title || tab.title === 'New Tab') return 'Research Home';
    return tab.title;
  };

  return (
    <div className="flex items-center gap-2 px-4 pt-2 pb-1.5 bg-slate-200/70 dark:bg-[#121214]/90 border-b border-slate-300/60 dark:border-zinc-800/80 select-none shrink-0 z-30 relative backdrop-blur-md">
      {/* Tabs Container */}
      <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onPointerDown={(e) => {
                if (e.target.closest('button')) return;
                onSelectTab(tab.id);
              }}
              className={`group relative flex items-center gap-2 px-3.5 py-1.5 min-w-[145px] max-w-[230px] shrink-0 rounded-lg text-xs font-medium cursor-pointer transition-all duration-150 border ${
                isActive
                  ? 'bg-white dark:bg-[#27272a] text-violet-700 dark:text-violet-300 border-violet-500/30 dark:border-violet-400/40 ring-1 ring-violet-500/20 shadow-xs'
                  : 'bg-slate-300/35 dark:bg-zinc-800/35 text-slate-600 dark:text-zinc-400 border-transparent hover:bg-slate-300/70 dark:hover:bg-zinc-800/70 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              {/* Active Tab Outline Indicator */}
              {isActive && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-violet-600 dark:bg-violet-400" />
              )}

              {/* Favicon / Smart Domain Badge */}
              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                {getTabIcon(tab)}
              </div>

              {/* Tab Title */}
              <span className="truncate flex-1 text-[12px] leading-tight font-medium">
                {getDisplayTitle(tab)}
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
                  className={`p-0.5 rounded transition-colors shrink-0 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto ${
                    isActive
                      ? 'hover:bg-violet-100 dark:hover:bg-violet-900/40 text-violet-600 dark:text-violet-300'
                      : 'hover:bg-slate-300/80 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400'
                  }`}
                  title="Close tab"
                >
                  <BrowserCloseIcon size={14} />
                </button>
              )}
            </div>
          );
        })}

        {/* New Tab (+) Button Positioned Immediately Next to Tabs */}
        <button
          type="button"
          onClick={onNewTab}
          onPointerDown={(e) => e.preventDefault()}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-300/60 dark:hover:bg-zinc-800/80 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors shrink-0 cursor-pointer ml-1"
          title="Open new research tab"
        >
          <BrowserPlusIcon size={18} />
        </button>
      </div>
    </div>
  );
};

export default BrowserTabBar;
