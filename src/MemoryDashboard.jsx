import React, { useState, useEffect } from 'react';
import { 
  Search, Brain, Users, Folder, CheckSquare, Clock, FileText, History, 
  RefreshCcw, Filter, ChevronDown, Sparkles, HelpCircle,
  Network, ArrowRight, Box, Layers, Globe, Layout, Plus, Check,
  SlidersHorizontal, Calendar, Zap, MessageSquare, Database, X,
  Maximize2, Minimize2, Eye
} from 'lucide-react';
import { MemoryIcon, TasksIcon, OrbIcon, RegaarderAiIcon } from './components/RegaarderProductIcons';

const MEMORY_TABS = [
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'graph', label: 'Knowledge Graph', icon: Network },
  { id: 'people', label: 'People', icon: Users },
  { id: 'projects', label: 'Projects', icon: Folder },
  { id: 'files', label: 'Files', icon: FileText },
  { id: 'meetings', label: 'Meetings', icon: MessageSquare }
];

const QUICK_SUGGESTIONS = [
  "What concerns did Michelle raise?",
  "Show all AI template discussions",
  "Find mobile roadmap decisions",
  "What happened last week?"
];

const MemoryDashboard = ({ onClose, onNavigateToEntity }) => {
  const [activeTab, setActiveTab] = useState('timeline');
  const [activeNav, setActiveNav] = useState('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('All time');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);

  // Esc key dismissal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleRefreshIndex = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div 
      className={`relative flex h-full w-full overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-[999999]' : 'relative'
      } bg-slate-900/20 dark:bg-black/40 backdrop-blur-[28px] text-slate-800 dark:text-zinc-100 select-none`}
      style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
    >
      {/* ── Outer Semi-Transparent Intelligence Surface Shell ── */}
      <div className={`flex-1 flex flex-col m-2 sm:m-3.5 rounded-2xl overflow-hidden backdrop-blur-2xl transition-all duration-200 ${
        isHighContrast 
          ? 'bg-white dark:bg-zinc-950 border-2 border-slate-400 dark:border-zinc-500 shadow-2xl'
          : 'bg-white/[0.88] dark:bg-[#12141a]/[0.90] border border-black/[0.08] dark:border-white/[0.08] shadow-[0_24px_70px_rgba(0,0,0,0.12)]'
      }`}>
        
        {/* ── Top Window Bar (Orb-consistent Glass Header) ── */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-black/[0.05] dark:border-white/[0.06] bg-white/40 dark:bg-zinc-950/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-500/10 dark:bg-violet-400/15 border border-violet-500/20 text-violet-600 dark:text-violet-300 flex items-center justify-center shadow-2xs">
              <MemoryIcon size={16} strokeWidth={2.0} />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[13.5px] tracking-tight text-slate-900 dark:text-white">Memory</span>
              <span className="text-[9.5px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/15">
                Context Layer
              </span>
            </div>
          </div>

          {/* Window Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsHighContrast(c => !c)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                isHighContrast
                  ? 'bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border-2 border-violet-500 font-extrabold'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
              }`}
              title="High Contrast Mode"
            >
              <Eye size={13} />
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen(f => !f)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ── Main Body Split ── */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          
          {/* ── Left Sidebar Navigation Rail (Translucent Glass Rail) ── */}
          <div className="w-[230px] flex-shrink-0 border-r border-black/[0.05] dark:border-white/[0.06] bg-slate-50/[0.35] dark:bg-zinc-900/[0.35] flex flex-col p-3.5 overflow-y-auto">
            
            {/* Navigation Category Items (Slightly rounded rectangular outlines) */}
            <div className="space-y-1 mb-4">
              <SidebarNavItem 
                icon={<Search size={14} />} 
                label="Search" 
                isActive={activeNav === 'search'} 
                onClick={() => setActiveNav('search')} 
              />
              <SidebarNavItem 
                icon={<Network size={14} />} 
                label="Knowledge Graph" 
                isActive={activeNav === 'graph'} 
                onClick={() => { setActiveNav('graph'); setActiveTab('graph'); }} 
              />
              <SidebarNavItem 
                icon={<Users size={14} />} 
                label="People" 
                isActive={activeNav === 'people'} 
                onClick={() => { setActiveNav('people'); setActiveTab('people'); }} 
              />
              <SidebarNavItem 
                icon={<Folder size={14} />} 
                label="Projects" 
                isActive={activeNav === 'projects'} 
                onClick={() => { setActiveNav('projects'); setActiveTab('projects'); }} 
              />
              <SidebarNavItem 
                icon={<TasksIcon size={14} strokeWidth={1.8} />} 
                label="Decisions" 
                isActive={activeNav === 'decisions'} 
                onClick={() => { setActiveNav('decisions'); setActiveTab('timeline'); }} 
              />
              <SidebarNavItem 
                icon={<Clock size={14} />} 
                label="Timeline" 
                isActive={activeNav === 'timeline'} 
                onClick={() => { setActiveNav('timeline'); setActiveTab('timeline'); }} 
              />
              <SidebarNavItem 
                icon={<FileText size={14} />} 
                label="Files" 
                isActive={activeNav === 'files'} 
                onClick={() => { setActiveNav('files'); setActiveTab('files'); }} 
              />
              <SidebarNavItem 
                icon={<History size={14} />} 
                label="Room History" 
                isActive={activeNav === 'history'} 
                onClick={() => { setActiveNav('history'); setActiveTab('meetings'); }} 
              />
            </div>

            {/* Memory Status Glass Card */}
            <div className="bg-white/70 dark:bg-zinc-800/60 backdrop-blur-md rounded-xl border border-black/[0.06] dark:border-white/[0.08] p-3 mt-auto shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Memory Status</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
              </div>
              
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 mb-0.5">Total memories</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">1,274</div>
              
              <div className="flex justify-between items-center text-[11px] mb-3">
                <span className="text-slate-500 dark:text-zinc-400">This month</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                  +186
                </span>
              </div>
              
              <div className="text-[10.5px] font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">Sources connected</div>
              <div className="flex items-center gap-1 mb-3">
                <div className="w-5 h-5 rounded-md flex items-center justify-center bg-violet-100/80 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300 border border-violet-200/50 dark:border-violet-800/40 shadow-2xs"><Box size={11} /></div>
                <div className="w-5 h-5 rounded-md flex items-center justify-center bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40 shadow-2xs"><Layers size={11} /></div>
                <div className="w-5 h-5 rounded-md flex items-center justify-center bg-amber-100/80 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40 shadow-2xs"><Layout size={11} /></div>
                <div className="w-5 h-5 rounded-md flex items-center justify-center bg-sky-100/80 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 border border-sky-200/50 dark:border-sky-800/40 shadow-2xs"><Globe size={11} /></div>
                <div className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] text-slate-500 dark:text-zinc-400 font-semibold bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.05]">+5</div>
              </div>
              
              <button 
                type="button"
                onClick={handleRefreshIndex}
                className="w-full py-1.5 rounded-lg border border-violet-500/20 bg-violet-50/50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 hover:bg-violet-100/70 dark:hover:bg-violet-900/40 transition-colors active:scale-[0.98] cursor-pointer"
              >
                <RefreshCcw size={11} className={isRefreshing ? 'animate-spin' : ''} />
                {isRefreshing ? 'Indexing...' : 'Refresh index'}
              </button>
            </div>
            
            {/* User Profile Pill at Bottom */}
            <div className="mt-3 p-2 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.04] flex items-center gap-2.5 cursor-pointer transition-colors border border-transparent hover:border-black/[0.04] dark:hover:border-white/[0.05]">
              <img src="https://i.pravatar.cc/150?u=a04258114e29026702d" className="w-7 h-7 rounded-full object-cover ring-1 ring-black/[0.08] dark:ring-white/[0.1]" alt="User avatar" />
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-slate-900 dark:text-zinc-100 truncate">Joshua Regaarder</div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">joshua@regaarder.com</div>
              </div>
              <ChevronDown size={13} className="text-slate-400 dark:text-zinc-500" />
            </div>
          </div>

          {/* ── Main Context Knowledge Layer Content ── */}
          <div className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden">
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 select-text thin-scrollbar">
              
              {/* ── Hero Search Surface: Refined Glass Intelligence Hub ── */}
              <div className="relative rounded-2xl bg-gradient-to-br from-violet-500/[0.05] via-white/60 to-white/40 dark:from-violet-950/20 dark:via-zinc-900/50 dark:to-zinc-900/30 backdrop-blur-md border border-violet-500/15 dark:border-violet-500/20 p-5 sm:p-6 overflow-hidden shadow-2xs">
                
                {/* Subtle Ambient Light Orb (Subordinate) */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-violet-400/10 dark:bg-violet-600/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row gap-4 items-start">
                  <div className="w-14 h-14 rounded-2xl bg-white/90 dark:bg-zinc-800/90 shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)] flex items-center justify-center shrink-0 border border-violet-500/15 text-violet-600 dark:text-violet-400">
                    <Brain size={28} strokeWidth={1.6} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">Ask Memory Anything</h1>
                      <span className="text-[9.5px] font-semibold text-violet-700 dark:text-violet-300 bg-violet-100/80 dark:bg-violet-950/80 px-2 py-0.5 rounded-md border border-violet-200/60 dark:border-violet-800/60">
                        AI Knowledge Graph
                      </span>
                    </div>
                    <p className="text-[12.5px] text-slate-500 dark:text-zinc-400 mb-3.5 leading-relaxed">
                      Instantly search across team meetings, chats, initiatives, spreadsheet models, notes, and decisions.
                    </p>
                    
                    {/* Dominant Search Input Box */}
                    <div className="relative flex items-center shadow-xs rounded-xl">
                      <Search className="absolute left-3.5 text-slate-400 dark:text-zinc-500 pointer-events-none" size={15} />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="What was decided about Q3 launch?"
                        className="w-full pl-10 pr-26 py-2 rounded-xl bg-white/90 dark:bg-zinc-900/90 border border-black/[0.08] dark:border-white/[0.1] focus:border-violet-500/60 dark:focus:border-violet-400/60 focus:outline-none focus:ring-3 focus:ring-violet-500/15 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 transition-all font-normal"
                      />
                      <button 
                        type="button"
                        className="absolute right-1.5 bg-violet-600 hover:bg-violet-700 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <Search size={12} />
                        <span>Search</span>
                      </button>
                    </div>
                    
                    {/* Quick Chip Prompts (Sharp, rounded rectangular outlines) */}
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {QUICK_SUGGESTIONS.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => setSearchQuery(suggestion)}
                          className="px-2.5 py-1 rounded-lg bg-white/70 dark:bg-zinc-800/70 border border-black/[0.06] dark:border-white/[0.08] text-[11px] font-medium text-slate-700 dark:text-zinc-300 hover:text-violet-700 dark:hover:text-violet-300 hover:border-violet-500/30 hover:bg-white dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-2xs"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Key Metrics Cards (Restrained Glass Cards) ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard 
                  icon={<CheckSquare className="text-violet-600 dark:text-violet-400" size={16} />} 
                  title="Decisions" 
                  value="128" 
                  subtitle="2 this month" 
                  trend="up" 
                  color="violet" 
                />
                <StatCard 
                  icon={<Sparkles className="text-purple-600 dark:text-purple-400" size={16} />} 
                  title="Topics" 
                  value="67" 
                  subtitle="AI Templates trending" 
                  trend="up" 
                  color="purple" 
                />
                <StatCard 
                  icon={<Users className="text-emerald-600 dark:text-emerald-400" size={16} />} 
                  title="People" 
                  value="42" 
                  subtitle="Active contributors" 
                  color="emerald" 
                />
                <StatCard 
                  icon={<Folder className="text-amber-600 dark:text-amber-400" size={16} />} 
                  title="Projects" 
                  value="16" 
                  subtitle="Across all workspaces" 
                  color="amber" 
                />
              </div>

              {/* ── Main Context Explorer Area ── */}
              <div className="flex flex-col lg:flex-row gap-5">
                
                {/* Center Stream / Knowledge Timeline */}
                <div className="flex-1 min-w-0">
                  
                  {/* ── Navigation Tabs (Slightly rounded rectangular outlines, no pills) ── */}
                  <div className="flex items-center gap-1.5 border-b border-black/[0.06] dark:border-white/[0.07] pb-2 mb-4 overflow-x-auto no-scrollbar">
                    {MEMORY_TABS.map((tab) => {
                      const isActive = activeTab === tab.id;
                      const TabIcon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer ${
                            isActive
                              ? 'border border-slate-200/90 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold shadow-2xs'
                              : 'border border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04] font-medium'
                          }`}
                        >
                          <TabIcon size={13} className={isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-zinc-500'} />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Timeline Sub-Header & Filters */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">Knowledge Stream</h2>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">3 recent entries</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={() => setTimeFilter(f => f === 'All time' ? 'Last 30 days' : 'All time')}
                        className="flex items-center gap-1.5 px-2.5 py-1 border border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-zinc-800/70 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 shadow-2xs cursor-pointer transition-colors"
                      >
                        <span>{timeFilter}</span>
                        <ChevronDown size={12} className="text-slate-400" />
                      </button>
                      <button 
                        type="button"
                        className="flex items-center gap-1.5 px-2.5 py-1 border border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-zinc-800/70 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 shadow-2xs cursor-pointer transition-colors"
                      >
                        <Filter size={12} className="text-slate-400" />
                        <span>Filter</span>
                      </button>
                    </div>
                  </div>

                  {/* Stream Timeline Items */}
                  <div className="relative space-y-3 before:absolute before:left-[88px] before:top-4 before:bottom-4 before:w-[1px] before:bg-slate-200/80 dark:before:bg-zinc-800">
                    <TimelineItem 
                      date="Jun 12" 
                      time="10:30 AM" 
                      icon={<Clock size={15} className="text-violet-600 dark:text-violet-400" />}
                      title="Product Strategy Sync"
                      desc="Discussed Q3 launch priorities, AI templates rollout schedule, and mobile onboarding improvements."
                      tags={['AI Templates', 'Mobile Improvements', 'Q3 Launch']}
                      avatars={['a04258114e29026702d', '114e29026702d', '29026702d']}
                      extraUsers="+2"
                    />
                    <TimelineItem 
                      date="Jun 10" 
                      time="2:15 PM" 
                      icon={<Network size={15} className="text-emerald-600 dark:text-emerald-400" />}
                      title="Investor Review & Growth Model"
                      desc="Validated revenue metrics, creator tier unit economics, and prospective European market expansion."
                      tags={['Funding', 'Growth Metrics', 'Market Expansion']}
                      avatars={['29026702d', '114e29026702d', 'a04258114e29026702d']}
                      extraUsers="+1"
                    />
                    <TimelineItem 
                      date="Jun 9" 
                      time="9:00 AM" 
                      icon={<FileText size={15} className="text-amber-600 dark:text-amber-400" />}
                      title="Design Architecture Critique"
                      desc="Reviewed updated translucent glass surfaces, Apple-tier progressive disclosure overlays, and user feedback."
                      tags={['Dashboard', 'UI/UX', 'Glass Layer']}
                      avatars={['114e29026702d', 'a04258114e29026702d', '29026702d']}
                      extraUsers="+3"
                    />
                  </div>

                  {/* Load More Button */}
                  <div className="flex justify-center mt-5">
                    <button 
                      type="button"
                      className="flex items-center gap-1.5 px-4 py-1.5 border border-black/[0.08] dark:border-white/[0.1] bg-white/80 dark:bg-zinc-800/80 rounded-lg text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-500/30 transition-all shadow-2xs cursor-pointer active:scale-95"
                    >
                      <span>Load previous records</span>
                      <ArrowRight size={12} className="rotate-90 text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* ── Right Rail: Contextual AI Insights Panel ── */}
                <div className="w-full lg:w-[280px] shrink-0 space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={13} className="text-violet-600 dark:text-violet-400" />
                      <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">AI Insights</h2>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                      <RefreshCcw size={9} /> Sync 2m ago
                    </span>
                  </div>

                  {/* Recurring Topics Card */}
                  <div className="bg-white/70 dark:bg-zinc-800/60 backdrop-blur-md border border-black/[0.06] dark:border-white/[0.08] rounded-xl p-3.5 shadow-xs">
                    <div className="flex gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-300 flex items-center justify-center shrink-0 mt-0.5 border border-violet-500/15">
                        <Sparkles size={12} />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">Recurring Topics</h3>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">Key concepts recurrent in discussions.</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      <Tag name="AI Templates" count="18" color="purple" active={selectedTopic === 'AI Templates'} onClick={() => setSelectedTopic(t => t === 'AI Templates' ? null : 'AI Templates')} />
                      <Tag name="Monetization" count="14" color="purple" active={selectedTopic === 'Monetization'} onClick={() => setSelectedTopic(t => t === 'Monetization' ? null : 'Monetization')} />
                      <Tag name="Mobile App" count="13" color="blue" active={selectedTopic === 'Mobile App'} onClick={() => setSelectedTopic(t => t === 'Mobile App' ? null : 'Mobile App')} />
                      <Tag name="Onboarding" count="9" color="purple" active={selectedTopic === 'Onboarding'} onClick={() => setSelectedTopic(t => t === 'Onboarding' ? null : 'Onboarding')} />
                      <Tag name="Growth" count="8" color="blue" active={selectedTopic === 'Growth'} onClick={() => setSelectedTopic(t => t === 'Growth' ? null : 'Growth')} />
                    </div>
                  </div>

                  {/* Open Questions Card */}
                  <div className="bg-white/70 dark:bg-zinc-800/60 backdrop-blur-md border border-black/[0.06] dark:border-white/[0.08] rounded-xl p-3.5 shadow-xs">
                    <div className="flex gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/15">
                        <HelpCircle size={12} />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">Open Questions</h3>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">Unresolved decisions requiring alignment.</p>
                      </div>
                    </div>
                    <ul className="space-y-1.5 text-[11.5px] text-slate-700 dark:text-zinc-300 pl-1">
                      <li className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>Target launch date for generative templates</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>Beta testing cohort criteria for mobile app</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>Enterprise tier pricing and storage quota</span>
                      </li>
                    </ul>
                    <button 
                      type="button"
                      className="text-[11px] text-violet-600 dark:text-violet-400 font-semibold flex items-center gap-1 mt-2.5 hover:underline cursor-pointer"
                    >
                      <span>View all questions</span>
                      <ArrowRight size={10} />
                    </button>
                  </div>

                  {/* Recent Decisions Card */}
                  <div className="bg-white/70 dark:bg-zinc-800/60 backdrop-blur-md border border-black/[0.06] dark:border-white/[0.08] rounded-xl p-3.5 shadow-xs">
                    <div className="flex gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/15">
                        <CheckSquare size={12} />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">Recent Decisions</h3>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">Confirmed outcomes from meetings & docs.</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-[11.5px] text-slate-700 dark:text-zinc-300">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>Launch AI templates in August</span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 shrink-0 font-mono">Jun 12</span>
                      </div>
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>Simplify mobile gesture navigation</span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 shrink-0 font-mono">Jun 10</span>
                      </div>
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>Expand private beta to 500 teams</span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 shrink-0 font-mono">Jun 9</span>
                      </div>
                    </div>
                    <button 
                      type="button"
                      className="text-[11px] text-violet-600 dark:text-violet-400 font-semibold flex items-center gap-1 mt-2.5 hover:underline cursor-pointer"
                    >
                      <span>View all decisions</span>
                      <ArrowRight size={10} />
                    </button>
                  </div>

                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// ── Subcomponents ──

const SidebarNavItem = ({ icon, label, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all duration-150 cursor-pointer ${
      isActive
        ? 'border border-slate-200/90 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold shadow-2xs'
        : 'border border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04] font-medium'
    }`}
  >
    <div className={isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-zinc-500'}>
      {icon}
    </div>
    <span className="text-[12.5px] truncate">{label}</span>
  </button>
);

const StatCard = ({ icon, title, value, subtitle, trend, color }) => {
  const badgeColors = {
    violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-300 border-violet-500/20',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20'
  };

  return (
    <div className="bg-white/70 dark:bg-zinc-800/60 backdrop-blur-md p-3.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] shadow-xs flex flex-col justify-between">
      <div className="flex items-center gap-2.5 mb-2">
        <div className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center border ${badgeColors[color] || badgeColors.violet}`}>
          {icon}
        </div>
        <div>
          <div className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">{title}</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none">{value}</div>
        </div>
      </div>
      <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-1">
        {trend === 'up' && <ArrowRight size={10} className="-rotate-45 text-emerald-500" />} 
        <span className="truncate">{subtitle}</span>
      </div>
    </div>
  );
};

const TimelineItem = ({ date, time, icon, title, desc, tags, avatars, extraUsers }) => (
  <div className="relative flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/60 dark:hover:bg-zinc-800/50 transition-colors border border-transparent hover:border-black/[0.04] dark:hover:border-white/[0.05]">
    {/* Left Date / Time Badge */}
    <div className="w-[72px] shrink-0 text-right pt-0.5">
      <div className="text-[11.5px] font-bold text-slate-900 dark:text-white">{date}</div>
      <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">{time}</div>
    </div>
    
    {/* Center Node Icon */}
    <div className="relative z-10 w-7 h-7 rounded-lg bg-white dark:bg-zinc-800 border border-black/[0.08] dark:border-white/[0.1] flex items-center justify-center shadow-2xs shrink-0">
      {icon}
    </div>
    
    {/* Content Box */}
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-[13px] font-bold text-slate-900 dark:text-white mb-0.5 truncate">{title}</h3>
          <p className="text-[11.5px] text-slate-500 dark:text-zinc-400 mb-2 leading-relaxed">{desc}</p>
          
          <div className="flex gap-1.5 flex-wrap">
            {tags.map((tag) => (
              <span 
                key={tag} 
                className="px-2 py-0.5 rounded-md bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.06] text-[10px] font-medium text-slate-600 dark:text-zinc-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Avatars */}
        <div className="flex items-center shrink-0 pt-0.5">
          <div className="flex -space-x-1.5 mr-1.5">
            {avatars.map((av, i) => (
              <img 
                key={i} 
                src={`https://i.pravatar.cc/150?u=${av}`} 
                alt="Avatar" 
                className="w-5 h-5 rounded-full border border-white dark:border-zinc-800 object-cover" 
              />
            ))}
          </div>
          {extraUsers && (
            <span className="text-[9.5px] font-semibold text-slate-400 dark:text-zinc-500 font-mono">
              {extraUsers}
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
);

const Tag = ({ name, count, color, active, onClick }) => {
  const colorStyles = {
    purple: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20',
    blue: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10.5px] font-medium border transition-all cursor-pointer ${
        active
          ? 'ring-2 ring-violet-500/40 bg-violet-600 text-white border-violet-600 font-semibold'
          : colorStyles[color] || colorStyles.purple
      }`}
    >
      <span>{name}</span>
      <span className="opacity-60 font-mono text-[9.5px]">{count}</span>
    </button>
  );
};

export default MemoryDashboard;
