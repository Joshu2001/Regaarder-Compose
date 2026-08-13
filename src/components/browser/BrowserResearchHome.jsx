import React, { useState, useRef } from 'react';
import { ShieldCheck, Lock, ChevronRight } from 'lucide-react';
import {
  BrowserSearchIcon,
  BrowserSearchWebIcon,
  BrowserCompetitorsIcon,
  BrowserForwardIcon,
  BrowserExternalIcon,
  BrowserBookmarkIcon
} from './RegaarderBrowserIcons';
import { AgentsIcon, MemoryIcon } from '../RegaarderProductIcons';

/**
 * BrowserResearchHome: Regaarder Research Homepage & Saved Research canvas.
 * Executive Apple-style design with Privacy Shield & Anonymous Browsing Mode.
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
  const [activeSavedTab, setActiveSavedTab] = useState('pages');
  const [isPrivacyPopoverOpen, setIsPrivacyPopoverOpen] = useState(false);
  const [isAnonymousMode, setIsAnonymousMode] = useState(true);
  const [isIpTracking, setIsIpTracking] = useState(false);
  const searchInputRef = useRef(null);
  const privacyBtnRef = useRef(null);

  const getFontFamilyStack = (fontName) => {
    const map = {
      'System Default': '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
      'Inter': 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      'SF Pro Display': '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      'JetBrains Mono': '"JetBrains Mono", "IBM Plex Mono", "Fira Code", monospace'
    };
    return map[fontName] || fontName || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  };

  const isSavedView = activeUrl === 'regaarder://saved';

  // Apple-style Anonymous Greeting (No personal name in Private Mode)
  const getGreeting = () => {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';
    return isAnonymousMode ? `Good ${timeOfDay}` : `Good ${timeOfDay}, Joshua`;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query.trim());
  };

  // Primary Research Actions with refined spacing & icons
  const quickActions = [
    {
      id: 'search',
      title: 'Search the Web',
      desc: 'Deep web search across live global sources',
      icon: BrowserSearchWebIcon,
      iconColor: 'text-violet-400',
      action: () => searchInputRef.current?.focus()
    },
    {
      id: 'competitors',
      title: 'Research Competitors',
      desc: 'Extract competitive metrics & feature matrices',
      icon: BrowserCompetitorsIcon,
      iconColor: 'text-emerald-400',
      action: () => onLaunchCompetitorWorkflow()
    },
    {
      id: 'saved',
      title: 'Saved Research',
      desc: 'Browse clipped knowledge nodes & saved memories',
      icon: MemoryIcon,
      iconColor: 'text-sky-400',
      action: () => onNavigate('regaarder://saved')
    },
    {
      id: 'ask-ai',
      title: 'Ask Regaarder AI',
      desc: 'Synthesize research topics with agent intelligence',
      icon: AgentsIcon,
      iconColor: 'text-indigo-400',
      action: () => onToggleSidePanel()
    }
  ];

  const displaySavedItems = savedItems.length > 0 ? savedItems : [
    {
      id: 'saved-1',
      title: 'SaaS Competitive Pricing Matrix 2026',
      url: 'https://docs.google.com',
      tag: 'Pricing Matrix'
    },
    {
      id: 'saved-2',
      title: 'AI Agent Architecture Benchmarks',
      url: 'https://github.com',
      tag: 'Clipping'
    },
    {
      id: 'saved-3',
      title: 'Apple Executive UX Directives',
      url: 'https://developer.apple.com',
      tag: 'Knowledge Node'
    }
  ];

  const suggestedTopics = [
    { label: 'Agentic AI Workflows', query: 'agentic AI workflows' },
    { label: 'Market Intelligence 2026', query: 'market intelligence 2026' },
    { label: 'Vector DB Architecture', query: 'vector db architecture' }
  ];

  if (isSavedView) {
    return (
      <div className="w-full h-full bg-[#0b0c10] text-slate-100 flex flex-col items-center justify-start px-6 pt-10 pb-8 overflow-y-auto select-none no-scrollbar">
        <div className="w-full max-w-3xl flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
                <MemoryIcon size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-100">Saved Research</h1>
                <p className="text-xs text-slate-400">Organized clippings, pages, and sessions</p>
              </div>
            </div>
            <button
              type="button"
              onPointerDown={(e) => { e.preventDefault(); onNavigate('regaarder://research'); }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
            >
              Back Home
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {displaySavedItems.map((item) => (
              <div key={item.id} className="group p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-sky-500/40 transition-all">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <BrowserBookmarkIcon size={16} className="text-amber-400" />
                    <span className="text-xs font-semibold text-slate-200">{item.title}</span>
                  </div>
                  {onRemoveBookmark && (
                    <button type="button" onPointerDown={() => onRemoveBookmark(item.id)} className="text-[10px] text-rose-400">Remove</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#0b0c10] text-slate-100 flex flex-col items-center justify-between px-6 pt-8 pb-6 overflow-y-auto select-none font-sans no-scrollbar">
      <div className="w-full max-w-2xl flex flex-col items-center gap-8 text-center my-auto py-4">
        
        <div className="relative">
          <button
            ref={privacyBtnRef}
            type="button"
            onPointerDown={(e) => { e.preventDefault(); setIsPrivacyPopoverOpen(!isPrivacyPopoverOpen); }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] text-slate-300 text-xs font-medium backdrop-blur-xl shadow-lg hover:border-violet-500/40 transition-all cursor-pointer"
          >
            <ShieldCheck size={14} className={isAnonymousMode ? 'text-emerald-400' : 'text-amber-400'} />
            <span className="tracking-wider uppercase font-semibold text-[10px]">{isAnonymousMode ? 'Private Research Mode' : 'Standard Session'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          {isPrivacyPopoverOpen && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 p-4 rounded-2xl bg-[#14151a] border border-white/[0.15] shadow-2xl backdrop-blur-2xl z-50 text-left space-y-3.5">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
                <div className="flex items-center gap-2"><Lock size={15} className="text-violet-400" /><span className="text-xs font-semibold">Apple Privacy Cues</span></div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col"><span className="text-xs">Anonymous Mode</span></div>
                  <button type="button" onPointerDown={() => setIsAnonymousMode(!isAnonymousMode)} className={`w-9 h-5 rounded-full relative ${isAnonymousMode ? 'bg-violet-600' : 'bg-slate-700'}`}><div className={`w-4 h-4 rounded-full bg-white transition-transform ${isAnonymousMode ? 'translate-x-4' : 'translate-x-0'}`} /></button>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col"><span className="text-xs">Relay IP Masking</span></div>
                  <button type="button" onPointerDown={() => setIsIpTracking(!isIpTracking)} className={`w-9 h-5 rounded-full relative ${isIpTracking ? 'bg-emerald-600' : 'bg-slate-700'}`}><div className={`w-4 h-4 rounded-full bg-white transition-transform ${isIpTracking ? 'translate-x-4' : 'translate-x-0'}`} /></button>
                </div>
              </div>
              <button type="button" onPointerDown={() => setIsPrivacyPopoverOpen(false)} className="text-violet-400 text-[10px] font-medium">Done</button>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white/95">{getGreeting()}</h1>
          <p className="text-xs sm:text-sm text-slate-400/90 max-w-md">Where live web pages turn into structured documents, memories, and AI insight.</p>
        </div>

        <form onSubmit={handleFormSubmit} className="w-full relative group">
          <div className="flex items-center gap-3.5 px-4 py-4 rounded-2xl bg-white/[0.05] border border-white/[0.12] focus-within:border-violet-500/60 shadow-2xl backdrop-blur-2xl transition-all">
            <BrowserSearchIcon size={20} className="text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the web, ask a topic, or type a URL..."
              style={{ fontFamily: getFontFamilyStack(browserFont), fontSize: `${Math.max(13, Math.round(15 * ((browserFontSize || 100) / 100)))}px` }}
              className="flex-1 bg-transparent text-white placeholder-slate-500 border-none outline-none"
            />
            <button type="submit" disabled={!query.trim()} className="flex items-center justify-center w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-20 text-white transition-all cursor-pointer">
              <BrowserForwardIcon size={16} />
            </button>
          </div>
        </form>

        <div className="w-full flex flex-col gap-3 text-left">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-400/70 px-1">Research Actions</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
            {quickActions.map((item) => {
              const IconComponent = item.icon;
              return (
                <div key={item.id} onPointerDown={(e) => { e.preventDefault(); item.action(); }} className="group flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.06] cursor-pointer backdrop-blur-lg">
                  <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/[0.09]"><IconComponent size={20} className={item.iconColor} /></div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center justify-between">{item.title}<ChevronRight size={15} className="text-violet-400" /></span>
                    <span className="text-[11px] sm:text-xs text-slate-400/80 truncate mt-0.5">{item.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <span className="text-xs text-slate-500 font-medium mr-1">Topics:</span>
          {suggestedTopics.map((topic, idx) => (
            <button key={idx} type="button" onPointerDown={() => onSearch(topic.query)} className="px-3 py-1 rounded-xl bg-white/[0.03] text-[11px] text-slate-400 hover:text-slate-200">{topic.label}</button>
          ))}
        </div>
      </div>

      <div className="text-[11px] text-slate-500/70 font-mono tracking-tight pb-1 mt-auto pt-4">
        Regaarder Private Research Workspace • Chromium Engine
      </div>
    </div>
  );
};

export default BrowserResearchHome;
