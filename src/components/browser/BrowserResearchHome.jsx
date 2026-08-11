import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Bookmark,
  ArrowRight,
  Globe,
  Compass,
  FileText,
  Database,
  Briefcase,
  ExternalLink
} from 'lucide-react';
import { AgentsIcon, MemoryIcon, ComposeIcon, SheetIcon } from '../RegaarderProductIcons';

export const BrowserResearchHome = ({ onSearch, onNavigate }) => {
  const [query, setQuery] = useState('');

  // Determine dynamic time-based greeting
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

  const quickActions = [
    {
      id: 'search',
      title: 'Search the Web',
      desc: 'Deep web search across live global sources',
      icon: Globe,
      color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
      action: () => onSearch('https://duckduckgo.com')
    },
    {
      id: 'competitors',
      title: 'Research Competitors',
      desc: 'Extract competitive metrics & feature matrices',
      icon: Briefcase,
      color: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
      action: () => onSearch('https://google.com/search?q=top+saas+competitors+analysis')
    },
    {
      id: 'memory',
      title: 'Open Saved Pages',
      desc: 'Browse clipped knowledge nodes & memory',
      icon: MemoryIcon,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      action: () => onSearch('https://wikipedia.org')
    },
    {
      id: 'ask-ai',
      title: 'Ask Regaarder AI',
      desc: 'Synthesize research topics with agent intelligence',
      icon: AgentsIcon,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      action: () => onSearch('https://perplexity.ai')
    }
  ];

  const suggestedTopics = [
    { label: 'Market Analysis 2026', url: 'https://news.ycombinator.com' },
    { label: 'AI Architecture Patterns', url: 'https://github.com/trending' },
    { label: 'SaaS Product Benchmarks', url: 'https://producthunt.com' },
    { label: 'Executive UI Guidelines', url: 'https://developer.apple.com' }
  ];

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 overflow-y-auto select-none font-sans">
      <div className="w-full max-w-2xl flex flex-col items-center gap-8 text-center my-auto py-8">
        {/* Regaarder Research Branding Badge */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-medium backdrop-blur-md shadow-xs">
          <AgentsIcon size={16} className="text-violet-400" />
          <span className="tracking-wide uppercase font-semibold text-[11px]">Regaarder Research</span>
        </div>

        {/* Dynamic Executive Greeting */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-violet-300 bg-clip-text text-transparent">
            {getGreeting()}, Joshua.
          </h1>
          <p className="text-sm text-slate-400 max-w-md leading-relaxed">
            Where live web pages turn into structured documents, memories, and AI insight.
          </p>
        </div>

        {/* Central Omnibox / Research Query Bar */}
        <form onSubmit={handleFormSubmit} className="w-full relative group">
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 focus-within:border-violet-500/80 focus-within:ring-2 focus-within:ring-violet-500/20 shadow-2xl transition-all">
            <Search className="w-5 h-5 text-slate-400 group-focus-within:text-violet-400 transition-colors shrink-0" />
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
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Quick Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-left">
          {quickActions.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={item.action}
                className="group flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-900 hover:border-violet-500/40 transition-all cursor-pointer shadow-sm"
              >
                <div className={`p-2.5 rounded-lg border ${item.color} shrink-0 transition-transform group-hover:scale-105`}>
                  <Icon size={18} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-violet-300 transition-colors flex items-center gap-1">
                    {item.title}
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-violet-400" />
                  </span>
                  <span className="text-[11px] text-slate-400 truncate mt-0.5">
                    {item.desc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Suggested / Pinned Research Topics */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <span className="text-xs text-slate-500 font-medium mr-1">Trending Topics:</span>
          {suggestedTopics.map((topic, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onNavigate(topic.url)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/40 border border-slate-800/80 text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-900 hover:border-slate-700 transition-all cursor-pointer"
            >
              <Compass className="w-3 h-3 text-slate-500" />
              <span>{topic.label}</span>
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
