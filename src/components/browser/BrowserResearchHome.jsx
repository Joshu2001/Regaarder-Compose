import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Lock, ChevronRight, Mic, MicOff, Palette, Sparkles, Check } from 'lucide-react';
import {
  BrowserSearchIcon,
  BrowserSearchWebIcon,
  BrowserCompetitorsIcon,
  BrowserForwardIcon,
  BrowserExternalIcon,
  BrowserBookmarkIcon
} from './RegaarderBrowserIcons';
import { AgentsIcon, MemoryIcon, ComposeIcon } from '../RegaarderProductIcons';

/**
 * BrowserResearchHome: Regaarder Research Homepage & Saved Research canvas.
 * Executive Apple-style design with:
 * 1. Privacy Shield & Anonymous Browsing Mode
 * 2. Background Canvas Theme Customizer (Deep Space, Midnight Mesh, Subtle Blur)
 * 3. Hero Dictate (Voice-to-Text) Omnibox Button with Web Speech API integration
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
  const [isThemePopoverOpen, setIsThemePopoverOpen] = useState(false);
  const [isAnonymousMode, setIsAnonymousMode] = useState(true);
  const [isIpTracking, setIsIpTracking] = useState(false);
  const [bgTheme, setBgTheme] = useState('deep-space'); // 'deep-space' | 'midnight-mesh' | 'subtle-blur'
  const [isListening, setIsListening] = useState(false);

  const searchInputRef = useRef(null);
  const privacyBtnRef = useRef(null);
  const recognitionRef = useRef(null);

  // Web Speech API Initialization for Dictation
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('');
        setQuery(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleToggleDictation = (e) => {
    e.preventDefault();
    if (!recognitionRef.current) {
      alert('Voice dictation is not supported in this browser environment.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        searchInputRef.current?.focus();
      } catch (err) {
        setIsListening(false);
      }
    }
  };

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

  // Dynamic Background Style Mapping
  const getCanvasBgClass = () => {
    switch (bgTheme) {
      case 'midnight-mesh':
        return 'bg-[#0b0c10] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]';
      case 'subtle-blur':
        return 'bg-[#0a0b0e] bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.08),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.08),transparent_50%)]';
      case 'deep-space':
      default:
        return 'bg-[#0b0c10]';
    }
  };

  if (isSavedView) {
    return (
      <div className={`w-full h-full text-slate-100 flex flex-col items-center justify-start px-6 pt-10 pb-8 overflow-y-auto select-none no-scrollbar transition-colors duration-300 ${getCanvasBgClass()}`}>
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
    <div className={`w-full h-full text-slate-100 flex flex-col items-center justify-between px-6 pt-8 pb-6 overflow-y-auto select-none font-sans no-scrollbar transition-all duration-500 relative ${getCanvasBgClass()}`}>
      
      {/* Top-Right Page Controls: Canvas Theme Customizer (Brave Style) */}
      <div className="absolute top-4 right-6 z-40">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            setIsPrivacyPopoverOpen(false);
            setIsThemePopoverOpen(!isThemePopoverOpen);
          }}
          className="flex items-center justify-center p-2 rounded-full bg-white/[0.04] border border-white/[0.1] text-slate-400 hover:text-white backdrop-blur-xl shadow-lg hover:border-white/[0.22] hover:bg-white/[0.08] transition-all cursor-pointer group"
          title="Customize Canvas Background"
        >
          <Palette size={16} className="group-hover:rotate-12 transition-transform duration-200" />
        </button>

        {/* Theme Customizer Popover: Positioned to the Top-Left of the trigger icon */}
        {isThemePopoverOpen && (
          <div className="absolute top-11 right-0 w-64 p-3.5 rounded-2xl bg-[#14151a] border border-white/[0.15] shadow-2xl backdrop-blur-2xl z-50 text-left space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 border-b border-white/[0.08] pb-2.5">
              <ComposeIcon size={16} className="text-violet-400" />
              <span className="text-xs font-semibold text-white tracking-wide">Canvas Themes</span>
            </div>
            
            <div className="space-y-1 pt-0.5">
              {[
                { id: 'deep-space', label: 'Deep Space Black', desc: 'Minimalist Apple obsidian' },
                { id: 'midnight-mesh', label: 'Midnight Mesh', desc: 'Subtle radial aura' },
                { id: 'subtle-blur', label: 'Subtle Dark Glow', desc: 'Ambient cyan-purple gradient' }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setBgTheme(t.id);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                    bgTheme === t.id
                      ? 'bg-violet-600/20 border border-violet-500/40 text-violet-200'
                      : 'hover:bg-white/[0.05] border border-transparent text-slate-300'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-medium">{t.label}</span>
                    <span className="text-[10px] text-slate-400">{t.desc}</span>
                  </div>
                  {bgTheme === t.id && <Check size={14} className="text-violet-400 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-2xl flex flex-col items-center gap-8 text-center my-auto py-4">
        
        {/* Apple Privacy Shield Header Control */}
        <div className="relative">
          <button
            ref={privacyBtnRef}
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              setIsThemePopoverOpen(false);
              setIsPrivacyPopoverOpen(!isPrivacyPopoverOpen);
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] text-slate-300 text-xs font-medium backdrop-blur-xl shadow-lg hover:border-violet-500/40 hover:bg-white/[0.07] transition-all cursor-pointer"
          >
            <ShieldCheck size={14} className={isAnonymousMode ? 'text-emerald-400' : 'text-amber-400'} />
            <span className="tracking-wider uppercase font-semibold text-[10px]">
              {isAnonymousMode ? 'Private Mode' : 'Standard Session'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          {/* Apple Privacy Popover */}
          {isPrivacyPopoverOpen && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 p-4 rounded-2xl bg-[#14151a] border border-white/[0.15] shadow-2xl backdrop-blur-2xl z-50 text-left space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
                <div className="flex items-center gap-2"><Lock size={15} className="text-violet-400" /><span className="text-xs font-semibold">Apple Privacy Cues</span></div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col"><span className="text-xs font-medium">Anonymous Mode</span><span className="text-[10px] text-slate-400">Mask personal user identity</span></div>
                  <button type="button" onPointerDown={() => setIsAnonymousMode(!isAnonymousMode)} className={`w-9 h-5 rounded-full relative cursor-pointer ${isAnonymousMode ? 'bg-violet-600' : 'bg-slate-700'}`}><div className={`w-4 h-4 rounded-full bg-white transition-transform ${isAnonymousMode ? 'translate-x-4' : 'translate-x-0'}`} /></button>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col"><span className="text-xs font-medium">Relay IP Masking</span><span className="text-[10px] text-slate-400">Encrypted relay routing</span></div>
                  <button type="button" onPointerDown={() => setIsIpTracking(!isIpTracking)} className={`w-9 h-5 rounded-full relative cursor-pointer ${isIpTracking ? 'bg-emerald-600' : 'bg-slate-700'}`}><div className={`w-4 h-4 rounded-full bg-white transition-transform ${isIpTracking ? 'translate-x-4' : 'translate-x-0'}`} /></button>
                </div>
              </div>
              <button type="button" onPointerDown={() => setIsPrivacyPopoverOpen(false)} className="text-violet-400 text-[10px] font-medium hover:underline">Done</button>
            </div>
          )}
        </div>

        {/* Header Greeting */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white/95">{getGreeting()}</h1>
          <p className="text-xs sm:text-sm text-slate-400/90 max-w-md">Where live web pages turn into structured documents, memories, and AI insight.</p>
        </div>

        {/* HIERARCHY LEVEL 1: HERO SEARCH OMNIBOX WITH DICTATION BUTTON */}
        <form onSubmit={handleFormSubmit} className="w-full relative group">
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/[0.05] border border-white/[0.12] focus-within:border-violet-500/60 focus-within:bg-white/[0.07] focus-within:ring-4 focus-within:ring-violet-500/15 shadow-2xl backdrop-blur-2xl transition-all">
            <BrowserSearchIcon size={20} className="text-slate-400 group-focus-within:text-violet-400 transition-colors shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isListening ? "Listening... Speak your prompt clearly" : "Search the web, ask a topic, or type a URL..."}
              style={{ fontFamily: getFontFamilyStack(browserFont), fontSize: `${Math.max(13, Math.round(15 * ((browserFontSize || 100) / 100)))}px` }}
              className="flex-1 bg-transparent text-white placeholder-slate-500 border-none outline-none font-normal"
            />
            
            {/* Dictate / Voice-to-Text Button */}
            <button
              type="button"
              onPointerDown={handleToggleDictation}
              className={`flex items-center justify-center p-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                isListening
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.08]'
              }`}
              title={isListening ? "Stop Listening" : "Dictate Prompt (Voice-to-Text)"}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            {/* Submit Forward Button */}
            <button
              type="submit"
              disabled={!query.trim()}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-20 text-white transition-all shadow-md shrink-0 cursor-pointer disabled:cursor-not-allowed"
            >
              <BrowserForwardIcon size={16} />
            </button>
          </div>
        </form>

        {/* HIERARCHY LEVEL 2: RESEARCH ACTIONS GRID */}
        <div className="w-full flex flex-col gap-3 text-left">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-400/70 px-1">Research Actions</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
            {quickActions.map((item) => {
              const IconComponent = item.icon;
              return (
                <div key={item.id} onPointerDown={(e) => { e.preventDefault(); item.action(); }} className="group flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.06] hover:border-white/[0.16] cursor-pointer backdrop-blur-lg transition-all duration-200 shadow-sm">
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

        {/* HIERARCHY LEVEL 3: SUGGESTED TOPICS */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <span className="text-xs text-slate-500 font-medium mr-1">Topics:</span>
          {suggestedTopics.map((topic, idx) => (
            <button key={idx} type="button" onPointerDown={() => onSearch(topic.query)} className="px-3 py-1 rounded-xl bg-white/[0.03] text-[11px] text-slate-400 hover:text-slate-200 border border-white/[0.07] hover:bg-white/[0.07] transition-all cursor-pointer">{topic.label}</button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-[11px] text-slate-500/70 font-mono tracking-tight pb-1 mt-auto pt-4">
        Regaarder Private Research Workspace • Chromium Engine
      </div>
    </div>
  );
};

export default BrowserResearchHome;
