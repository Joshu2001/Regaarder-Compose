import React, { useState } from 'react';
import {
  BrowserSearchIcon,
  BrowserSearchWebIcon,
  BrowserCompetitorsIcon,
  BrowserForwardIcon,
  BrowserExternalIcon
} from './RegaarderBrowserIcons';
import { AgentsIcon, MemoryIcon, ComposeIcon, SheetIcon, AssistIcon } from '../RegaarderProductIcons';

export const BrowserResearchHome = ({ onSearch, onNavigate }) => {
  const [query, setQuery] = useState('');

  // Dynamic time-based executive greeting
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

  // Standardized Research Action Items
  const quickActions = [
    {
      id: 'search',
      title: 'Search the Web',
      desc: 'Deep web search across live global sources',
      icon: BrowserSearchWebIcon,
      accent: 'text-slate-200 group-hover:text-violet-300',
      iconColor: 'text-slate-300 group-hover:text-violet-400',
      action: () => onSearch('https://duckduckgo.com')
    },
    {
      id: 'competitors',
      title: 'Research Competitors',
      desc: 'Extract competitive metrics & feature matrices',
      icon: BrowserCompetitorsIcon,
      accent: 'text-slate-200 group-hover:text-violet-300',
      iconColor: 'text-slate-300 group-hover:text-violet-400',
      action: () => onSearch('https://google.com/search?q=top+saas+competitors+analysis')
    },
    {
      id: 'memory',
      title: 'Open Saved Pages',
      desc: 'Browse clipped knowledge nodes & memory',
      icon: MemoryIcon,
      accent: 'text-slate-200 group-hover:text-sky-300',
      iconColor: 'text-sky-400',
      action: () => onSearch('https://wikipedia.org')
    },
    {
      id: 'ask-ai',
      title: 'Ask Regaarder AI',
      desc: 'Synthesize research topics with agent intelligence',
      icon: AgentsIcon,
      accent: 'text-slate-200 group-hover:text-violet-300',
      iconColor: 'text-violet-400',
      action: () => onSearch('https://perplexity.ai')
    }
  ];

  // Saved / Relevant Knowledge items
  const savedKnowledge = [
    {
      title: 'SaaS Competitive Matrix',
      type: 'Sheet',
      icon: SheetIcon,
      tag: 'Clipped Matrix',
      url: 'https://docs.google.com'
    },
    {
      title: 'AI Architecture Benchmark 2026',
      type: 'Compose Briefing',
      icon: ComposeIcon,
      tag: 'Document',
      url: 'https://github.com'
    },
    {
      title: 'Executive UX Design System',
      type: 'Memory Node',
      icon: MemoryIcon,
      tag: 'Knowledge',
      url: 'https://developer.apple.com'
    }
  ];

  // Tertiary suggested topics
  const suggestedTopics = [
    { label: 'Market Analysis 2026', url: 'https://news.ycombinator.com' },
    { label: 'AI Architecture Patterns', url: 'https://github.com/trending' },
    { label: 'SaaS Product Benchmarks', url: 'https://producthunt.com' },
    { label: 'Executive UI Guidelines', url: 'https://developer.apple.com' }
  ];

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
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the web, ask a topic, or type a URL..."
              className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden font-sans tracking-wide"
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
                  onClick={item.action}
                  className="group flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:bg-slate-900 hover:border-violet-500/40 transition-all cursor-pointer shadow-xs"
                >
                  <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 shrink-0 transition-transform group-hover:scale-105">
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
            <span className="text-[10px] text-slate-500 font-mono">Recent Clippings</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full">
            {savedKnowledge.map((kn, idx) => {
              const KnIcon = kn.icon;
              return (
                <div
                  key={idx}
                  onClick={() => onNavigate(kn.url)}
                  className="group flex flex-col justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800/70 hover:bg-slate-900/80 hover:border-slate-700 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <KnIcon size={15} className="text-slate-400 group-hover:text-violet-400 transition-colors" />
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
                      {kn.tag}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-slate-300 group-hover:text-slate-100 truncate">
                    {kn.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* HIERARCHY LEVEL 4: SUGGESTED TOPICS */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <span className="text-xs text-slate-500 font-medium mr-1">Topics:</span>
          {suggestedTopics.map((topic, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onNavigate(topic.url)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/30 border border-slate-800/70 text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-900 hover:border-slate-700 transition-all cursor-pointer"
            >
              <span>{topic.label}</span>
              <BrowserExternalIcon size={11} className="opacity-60" />
            </button>
          ))}
        </div>
      </div>

      {/* Footer Identity Hint */}
      <div className="text-[11px] text-slate-600 font-mono tracking-tight pb-2">
        Regaarder Research Workspace • Chromium Embedded Engine
      </div>
    </div>
  );
};

export default BrowserResearchHome;
