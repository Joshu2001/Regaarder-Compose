import React, { useState, useRef } from 'react';
import {
  BrowserSearchIcon,
  BrowserSearchWebIcon,
  BrowserCompetitorsIcon,
  BrowserForwardIcon,
  BrowserExternalIcon,
  BrowserBookmarkIcon
} from './RegaarderBrowserIcons';
import { AgentsIcon, MemoryIcon, ComposeIcon, SheetIcon } from '../RegaarderProductIcons';

/**
 * BrowserResearchHome: Regaarder Research Homepage & Saved Research canvas.
 * Implements deterministic action routing:
 * 1. Search the Web (Class A - Focus input)
 * 2. Research Competitors (Class C - Workflow setup)
 * 3. Open Saved Pages (Class A - Navigates directly to Saved Research)
 * 4. Ask Regaarder AI (Class B - Toggles AI Research sidebar)
 */
export const BrowserResearchHome = ({
  activeUrl = 'regaarder://research',
  savedItems = [],
  browserFont = 'System Default',
  browserFontSize = 100,
  onSearch,
  onNavigate,
  onLaunchCompetitorWorkflow,
  onToggleSidePanel,
  onRemoveBookmark
}) => {
  const [query, setQuery] = useState('');
  const [activeSavedTab, setActiveSavedTab] = useState('pages'); // 'pages', 'clippings', 'knowledge', 'sessions'
  const searchInputRef = useRef(null);

  const getFontFamilyStack = (fontName) => {
    const map = {
      'System Default': '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
      'Inter': 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      'SF Pro Display': '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      'JetBrains Mono': '"JetBrains Mono", "IBM Plex Mono", "Fira Code", monospace',
      'IBM Plex Mono': '"IBM Plex Mono", "JetBrains Mono", "Fira Code", monospace',
      'Fira Code': '"Fira Code", "JetBrains Mono", monospace',
      'Manrope': 'Manrope, sans-serif',
      'DM Sans': '"DM Sans", sans-serif',
      'Plus Jakarta Sans': '"Plus Jakarta Sans", sans-serif',
      'Public Sans': '"Public Sans", sans-serif',
      'Satoshi': 'Satoshi, sans-serif',
      'General Sans': '"General Sans", sans-serif',
      'Outfit': 'Outfit, sans-serif',
      'Space Grotesk': '"Space Grotesk", sans-serif'
    };
    return map[fontName] || fontName || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  };

  const isSavedView = activeUrl === 'regaarder://saved';

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query.trim());
  };

  // Primary 4 Research Actions
  const quickActions = [
    {
      id: 'search',
      title: 'Search the Web',
      desc: 'Deep web search across live global sources',
      icon: BrowserSearchWebIcon,
      accent: 'text-slate-200 group-hover:text-violet-300',
      iconColor: 'text-slate-300 group-hover:text-violet-400',
      action: () => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    },
    {
      id: 'competitors',
      title: 'Research Competitors',
      desc: 'Extract competitive metrics & feature matrices',
      icon: BrowserCompetitorsIcon,
      accent: 'text-slate-200 group-hover:text-violet-300',
      iconColor: 'text-violet-400',
      action: () => onLaunchCompetitorWorkflow()
    },
    {
      id: 'saved',
      title: 'Open Saved Pages',
      desc: 'Browse clipped knowledge nodes & saved research',
      icon: MemoryIcon,
      accent: 'text-slate-200 group-hover:text-sky-300',
      iconColor: 'text-sky-400',
      action: () => onNavigate('regaarder://saved')
    },
    {
      id: 'ask-ai',
      title: 'Ask Regaarder AI',
      desc: 'Synthesize research topics with agent intelligence',
      icon: AgentsIcon,
      accent: 'text-slate-200 group-hover:text-violet-300',
      iconColor: 'text-violet-400',
      action: () => onToggleSidePanel()
    }
  ];

  // Default mock saved items if user has not added custom ones yet
  const displaySavedItems = savedItems.length > 0 ? savedItems : [
    {
      id: 'saved-1',
      title: 'SaaS Competitive Pricing Matrix 2026',
      url: 'https://docs.google.com',
      type: 'pages',
      tag: 'Pricing Matrix',
      savedAt: 'Today, 09:42 AM'
    },
    {
      id: 'saved-2',
      title: 'AI Agent Architecture Patterns & Benchmarks',
      url: 'https://github.com',
      type: 'clippings',
      tag: 'Clipping',
      savedAt: 'Yesterday, 04:15 PM'
    },
    {
      id: 'saved-3',
      title: 'Apple Executive Design Principles & UX Directives',
      url: 'https://developer.apple.com',
      type: 'knowledge',
      tag: 'Knowledge Node',
      savedAt: 'Aug 10, 2026'
    },
    {
      id: 'saved-4',
      title: 'Competitor Analysis Session — SaaS Market',
      url: 'regaarder://research',
      type: 'sessions',
      tag: 'Session',
      savedAt: 'Aug 08, 2026'
    }
  ];

  // Filter saved items by selected sub-category
  const filteredSavedItems = displaySavedItems.filter((item) => {
    if (activeSavedTab === 'pages') return item.type === 'pages' || !item.type;
    if (activeSavedTab === 'clippings') return item.type === 'clippings';
    if (activeSavedTab === 'knowledge') return item.type === 'knowledge';
    if (activeSavedTab === 'sessions') return item.type === 'sessions';
    return true;
  });

  // Suggested topic chips
  const suggestedTopics = [
    { label: 'Market Analysis 2026', query: 'Market Analysis 2026 SaaS trends' },
    { label: 'AI Architecture Patterns', query: 'AI Architecture design patterns 2026' },
    { label: 'SaaS Benchmarks', query: 'SaaS product metrics benchmarks' },
    { label: 'Executive UI Guidelines', query: 'Apple executive UI design guidelines' }
  ];

  if (isSavedView) {
    return (
      <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col items-center justify-start px-6 pt-10 pb-8 overflow-y-auto font-sans select-none no-scrollbar">
        <div className="w-full max-w-3xl flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
                <MemoryIcon size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-100">Saved Research & Knowledge</h1>
                <p className="text-xs text-slate-400">Organized clippings, saved pages, and research sessions</p>
              </div>
            </div>

            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                onNavigate('regaarder://research');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
            >
              Back to Research Home
            </button>
          </div>

          {/* Sub-navigation categories (Rounded Rectangles per design system rules) */}
          <div className="flex items-center gap-2 border-b border-slate-800/60 pb-2">
            {[
              { id: 'pages', label: 'Saved Pages' },
              { id: 'clippings', label: 'Recent Clippings' },
              { id: 'knowledge', label: 'Knowledge Nodes' },
              { id: 'sessions', label: 'Research Sessions' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  setActiveSavedTab(tab.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                  activeSavedTab === tab.id
                    ? 'bg-sky-500/15 border-sky-500/40 text-sky-300 shadow-xs'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* List of Saved Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredSavedItems.length === 0 ? (
              <div className="col-span-2 p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-xs text-slate-400 space-y-2">
                <MemoryIcon size={24} className="mx-auto text-slate-500" />
                <p>No items found in this section of Saved Research.</p>
              </div>
            ) : (
              filteredSavedItems.map((item) => (
                <div
                  key={item.id}
                  className="group flex flex-col justify-between p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-sky-500/40 hover:bg-slate-900 transition-all shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <BrowserBookmarkIcon size={16} className="text-amber-400 shrink-0" />
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-slate-100 truncate">
                        {item.title}
                      </span>
                    </div>

                    {onRemoveBookmark && (
                      <button
                        type="button"
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onRemoveBookmark(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-[10px] text-rose-400 hover:text-rose-300 p-1 transition-opacity cursor-pointer"
                        title="Remove from Saved Research"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px]">
                    <span className="text-slate-500 font-mono truncate max-w-[180px]">{item.url}</span>
                    <button
                      type="button"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        onNavigate(item.url);
                      }}
                      className="flex items-center gap-1 text-sky-400 font-semibold hover:underline cursor-pointer"
                    >
                      <span>Open Page</span>
                      <BrowserExternalIcon size={10} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col items-center justify-start px-6 pt-10 sm:pt-14 pb-8 overflow-y-auto select-none font-sans no-scrollbar">
      <div className="w-full max-w-2xl flex flex-col items-center gap-7 text-center my-0">
        {/* Regaarder Research Branding Badge */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-medium backdrop-blur-md shadow-xs">
          <AgentsIcon size={16} className="text-violet-400" />
          <span className="tracking-wide uppercase font-semibold text-[11px]">Regaarder Research</span>
        </div>

        {/* Dynamic Executive Greeting */}
        <div className="flex flex-col items-center gap-1.5">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-violet-300 bg-clip-text text-transparent">
            {getGreeting()}, Joshua.
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
            Where live web pages turn into structured documents, memories, and AI insight.
          </p>
        </div>

        {/* HIERARCHY LEVEL 1: HERO SEARCH OMNIBOX */}
        <form onSubmit={handleFormSubmit} className="w-full relative group">
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 focus-within:border-violet-500/80 focus-within:ring-2 focus-within:ring-violet-500/20 shadow-2xl transition-all">
            <BrowserSearchIcon size={20} className="text-slate-400 group-focus-within:text-violet-400 transition-colors shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the web, ask a topic, or type a URL..."
              style={{
                fontFamily: getFontFamilyStack(browserFont),
                fontSize: `${Math.max(12, Math.round(14 * ((browserFontSize || 100) / 100)))}px`
              }}
              className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 border-none outline-none focus:outline-none focus:ring-0 focus:border-transparent focus-visible:outline-none focus-visible:ring-0 select-text tracking-wide"
              autoFocus
            />
            <button
              type="submit"
              disabled={!query.trim()}
              className="flex items-center justify-center w-8 h-8 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-30 text-white transition-all shadow-md shrink-0 cursor-pointer disabled:cursor-not-allowed"
            >
              <BrowserForwardIcon size={16} />
            </button>
          </div>
        </form>

        {/* HIERARCHY LEVEL 2: RESEARCH ACTIONS GRID */}
        <div className="w-full flex flex-col gap-2.5 text-left">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 px-1">
            Research Actions
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {quickActions.map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.id}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    item.action();
                  }}
                  className="group flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/90 hover:bg-slate-900 hover:border-violet-500/40 transition-all cursor-pointer shadow-xs"
                >
                  <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 shrink-0 transition-transform group-hover:scale-105">
                    <IconComponent size={18} className={item.iconColor} />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className={`text-xs font-semibold ${item.accent} transition-colors flex items-center justify-between`}>
                      <span>{item.title}</span>
                      <BrowserForwardIcon size={14} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-violet-400" />
                    </span>
                    <span className="text-[11px] text-slate-400 truncate mt-0.5">
                      {item.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* HIERARCHY LEVEL 3: SAVED / RELEVANT KNOWLEDGE */}
        <div className="w-full flex flex-col gap-2 text-left pt-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 flex items-center gap-1.5">
              <MemoryIcon size={13} className="text-sky-400" />
              Saved Knowledge & Memories
            </span>
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                onNavigate('regaarder://saved');
              }}
              className="text-[10px] text-sky-400 hover:underline font-mono cursor-pointer"
            >
              View All Saved →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full">
            {displaySavedItems.slice(0, 3).map((kn, idx) => (
              <div
                key={idx}
                onPointerDown={(e) => {
                  e.preventDefault();
                  onNavigate(kn.url);
                }}
                className="group flex flex-col justify-between p-3 rounded-2xl bg-slate-900/40 border border-slate-800/70 hover:bg-slate-900/80 hover:border-slate-700 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <MemoryIcon size={15} className="text-slate-400 group-hover:text-violet-400 transition-colors" />
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/50">
                    {kn.tag || 'Saved'}
                  </span>
                </div>
                <span className="text-xs font-medium text-slate-300 group-hover:text-slate-100 truncate">
                  {kn.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* HIERARCHY LEVEL 4: SUGGESTED TOPICS */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <span className="text-xs text-slate-500 font-medium mr-1">Topics:</span>
          {suggestedTopics.map((topic, idx) => (
            <button
              key={idx}
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                onSearch(topic.query);
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/30 border border-slate-800/70 text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-900 hover:border-slate-700 transition-all cursor-pointer"
            >
              <span>{topic.label}</span>
              <BrowserExternalIcon size={11} className="opacity-60" />
            </button>
          ))}
        </div>
      </div>

      {/* Footer Identity Hint */}
      <div className="text-[11px] text-slate-600 font-mono tracking-tight pb-2 mt-auto pt-6">
        Regaarder Research Workspace • Chromium Embedded Engine
      </div>
    </div>
  );
};

export default BrowserResearchHome;
