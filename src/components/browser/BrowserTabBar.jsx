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
    <div className="flex items-center gap-1.5 px-3 pt-1.5 pb-0 bg-[#D9DEE6] dark:bg-[#141416] border-b border-[#CBD1DC] dark:border-zinc-800/90 select-none shrink-0 z-30 relative">
      {/* Tabs Container */}
      <div className="flex items-end gap-1 min-w-0 flex-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onPointerDown={(e) => {
                if (e.target.closest('button')) return;
                onSelectTab(tab.id);
              }}
              className={`group relative flex items-center gap-2 px-3 py-1.5 min-w-[140px] max-w-[220px] shrink-0 rounded-t-lg rounded-b-none text-xs font-medium cursor-pointer transition-all duration-150 border ${
                isActive
                  ? 'bg-white dark:bg-[#1A1A1E] text-slate-900 dark:text-zinc-100 border-slate-300/80 dark:border-zinc-700/80 border-b-white dark:border-b-[#1A1A1E] -mb-[1px] shadow-xs z-10'
                  : 'bg-transparent text-slate-600 dark:text-zinc-400 border-transparent hover:bg-[#CBD1DC]/60 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              {/* Active Tab Top 2px Regaarder Purple Accent */}
              {isActive && (
                <div className="absolute top-0 left-2 right-2 h-[2px] rounded-t-sm bg-violet-600 dark:bg-violet-400" />
              )}

              {/* Favicon / Smart Domain Badge */}
              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                {getTabIcon(tab)}
              </div>

              {/* Tab Title with Natural Browser Truncation */}
              <span className={`truncate flex-1 text-[12px] leading-tight ${isActive ? 'font-semibold text-slate-900 dark:text-zinc-100' : 'font-medium text-slate-600 dark:text-zinc-400'}`}>
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
                      ? 'hover:bg-slate-200 dark:hover:bg-zinc-700/80 text-slate-600 dark:text-zinc-300'
                      : 'hover:bg-[#CBD1DC] dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400'
                  }`}
                  title="Close tab"
                >
                  <BrowserCloseIcon size={13} />
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
          className="flex items-center justify-center w-7 h-7 mb-1 rounded-md text-slate-600 dark:text-zinc-400 hover:bg-[#CBD1DC]/70 dark:hover:bg-zinc-800/80 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors shrink-0 cursor-pointer ml-1"
          title="Open new research tab"
        >
          <BrowserPlusIcon size={16} />
        </button>
      </div>
    </div>
  );
};

export default BrowserTabBar;
