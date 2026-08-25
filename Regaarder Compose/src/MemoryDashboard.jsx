import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Brain, Users, Folder, CheckSquare, Clock, FileText, History, 
  RefreshCcw, Filter, ChevronDown, Sparkles, HelpCircle,
  Network, ArrowRight, Box, Layers, Globe, Layout, Plus, Check,
  SlidersHorizontal, Calendar, Zap, MessageSquare, Database, X,
  Maximize2, Minimize2, Eye, ExternalLink, ShieldCheck, Compass,
  AlertTriangle, Tag as TagIcon, Hash, CheckCircle2, ChevronRight
} from 'lucide-react';
import { MemoryIcon, TasksIcon, OrbIcon, RegaarderAiIcon, RegaarderProductIcon } from './components/RegaarderProductIcons';

const MEMORY_TABS = [
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'decisions', label: 'Decisions', icon: TasksIcon },
  { id: 'graph', label: 'Knowledge Graph', icon: Network },
  { id: 'people', label: 'People', icon: Users },
  { id: 'projects', label: 'Projects', icon: Folder },
  { id: 'files', label: 'Files', icon: FileText },
  { id: 'meetings', label: 'Meetings', icon: MessageSquare }
];

const QUICK_SUGGESTIONS = [
  "What concerns did Michelle raise?",
  "Show all AI template decisions",
  "Find mobile onboarding roadmap",
  "Summarize Q3 launch sync"
];

// Mock Knowledge Dataset
const TIMELINE_DATA = [
  {
    id: 'mem-1',
    date: 'Jun 12',
    time: '10:30 AM',
    type: 'meeting',
    icon: MessageSquare,
    color: 'violet',
    title: 'Product Strategy Sync',
    desc: 'Aligned on Q3 launch schedule, generative AI templates rollout, and simplified mobile onboarding flow.',
    tags: ['AI Templates', 'Mobile Improvements', 'Q3 Launch'],
    avatars: ['a04258114e29026702d', '114e29026702d', '29026702d'],
    extraUsers: '+2',
    workspace: 'compose',
    epistemic: 'verified',
    confidence: '100%'
  },
  {
    id: 'mem-2',
    date: 'Jun 10',
    time: '2:15 PM',
    type: 'decision',
    icon: CheckSquare,
    color: 'emerald',
    title: 'Investor Growth Model Approved',
    desc: 'Validated revenue metrics, creator tier unit economics, and confirmed European expansion cohort criteria.',
    tags: ['Funding', 'Growth Metrics', 'Monetization'],
    avatars: ['29026702d', '114e29026702d'],
    extraUsers: '+1',
    workspace: 'sheets',
    epistemic: 'verified',
    confidence: '98%'
  },
  {
    id: 'mem-3',
    date: 'Jun 9',
    time: '9:00 AM',
    type: 'design',
    icon: Layers,
    color: 'purple',
    title: 'Design Architecture Critique',
    desc: 'Standardized translucent glass surfaces (90–95% opacity), Apple-tier progressive disclosure overlays, and border outlines.',
    tags: ['UI/UX', 'Glass Layer', 'Design System'],
    avatars: ['114e29026702d', 'a04258114e29026702d', '29026702d'],
    extraUsers: '+3',
    workspace: 'whiteboard',
    epistemic: 'inferred',
    confidence: '94%'
  },
  {
    id: 'mem-4',
    date: 'Jun 7',
    time: '4:45 PM',
    type: 'file',
    icon: FileText,
    color: 'sky',
    title: 'Enterprise Security Compliance Spec',
    desc: 'Drafted SOC2 Type II audit readiness documentation and tokenized data residency constraints.',
    tags: ['Security', 'Enterprise', 'Compliance'],
    avatars: ['a04258114e29026702d'],
    workspace: 'compose',
    epistemic: 'verified',
    confidence: '100%'
  }
];

const DECISIONS_DATA = [
  {
    id: 'dec-1',
    title: 'Launch AI Templates in August',
    date: 'Jun 12, 2026',
    owner: 'Joshua Regaarder',
    workspace: 'compose',
    status: 'Confirmed',
    impact: 'High',
    rationale: 'Generative template pipeline benchmarks showed 42% faster document inception times.'
  },
  {
    id: 'dec-2',
    title: 'Simplify Mobile Navigation Gestures',
    date: 'Jun 10, 2026',
    owner: 'Elena Rostova',
    workspace: 'whiteboard',
    status: 'Confirmed',
    impact: 'Medium',
    rationale: 'User testing cohort revealed swipe-from-edge reduced thumb strain by 28%.'
  },
  {
    id: 'dec-3',
    title: 'Expand Private Beta to 500 Teams',
    date: 'Jun 9, 2026',
    owner: 'Marcus Vance',
    workspace: 'sheets',
    status: 'Confirmed',
    impact: 'High',
    rationale: 'Infrastructure stress tests passed with sub-18ms latency across all multi-region clusters.'
  }
];

const PEOPLE_DATA = [
  { id: 'p-1', name: 'Joshua Regaarder', role: 'Product Architect', memories: 342, avatar: 'a04258114e29026702d', activeProject: 'Compose AI Core' },
  { id: 'p-2', name: 'Elena Rostova', role: 'Design Lead', memories: 218, avatar: '114e29026702d', activeProject: 'Apple Aesthetic Overhaul' },
  { id: 'p-3', name: 'Marcus Vance', role: 'Systems Engineer', memories: 194, avatar: '29026702d', activeProject: 'Multi-Region Mesh' },
  { id: 'p-4', name: 'Michelle Zhang', role: 'Growth Strategy', memories: 156, avatar: '39026702d', activeProject: 'Creator Monetization' }
];

const PROJECTS_DATA = [
  { id: 'proj-1', title: 'Compose AI Architecture', progress: '84%', memories: 428, workspace: 'compose', updated: '2h ago' },
  { id: 'proj-2', title: 'Financial Model Q3-Q4', progress: '92%', memories: 184, workspace: 'sheets', updated: '1d ago' },
  { id: 'proj-3', title: 'Executive Keynote Deck', progress: '65%', memories: 112, workspace: 'deck', updated: '3d ago' },
  { id: 'proj-4', title: 'Enterprise Room System', progress: '78%', memories: 240, workspace: 'room', updated: '5h ago' }
];

const GRAPH_NODES = [
  { id: 'node-1', label: 'AI Templates', category: 'Feature', connections: 18, color: 'violet' },
  { id: 'node-2', label: 'Monetization Model', category: 'Finance', connections: 14, color: 'emerald' },
  { id: 'node-3', label: 'Mobile Onboarding', category: 'UX', connections: 13, color: 'sky' },
  { id: 'node-4', label: 'SOC2 Security Spec', category: 'Compliance', connections: 9, color: 'amber' },
  { id: 'node-5', label: 'Room Realtime Sync', category: 'Network', connections: 11, color: 'purple' }
];

const MemoryDashboard = ({ onClose, onNavigateToEntity }) => {
  const [activeTab, setActiveTab] = useState('timeline');
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
    setTimeout(() => setIsRefreshing(false), 700);
  };

  // Filtered timeline data
  const filteredTimeline = useMemo(() => {
    return TIMELINE_DATA.filter(item => {
      if (selectedTopic && !item.tags.includes(selectedTopic)) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.tags.some(t => t.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, selectedTopic]);

  return (
    <div 
      className={`relative flex h-full w-full overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-[999999]' : 'relative'
      } bg-slate-900/30 dark:bg-black/55 backdrop-blur-[28px] text-slate-800 dark:text-zinc-100 select-none`}
      style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
    >
      {/* ── Outer Semi-Transparent Context Surface Shell (≈78% Glass Surface) ── */}
      <div className={`flex-1 flex flex-col m-2 sm:m-3.5 rounded-2xl overflow-hidden backdrop-blur-[28px] transition-all duration-200 ${
        isHighContrast 
          ? 'bg-white dark:bg-zinc-950 border-2 border-slate-400 dark:border-zinc-500 shadow-2xl'
          : 'bg-white/[0.78] dark:bg-[#12141a]/[0.80] border border-white/60 dark:border-white/[0.12] ring-1 ring-black/[0.04] dark:ring-white/[0.05] shadow-[0_20px_60px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.45)]'
      }`}>
        
        {/* ── Top Window Bar (Orb-consistent Crisp Header) ── */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-black/[0.06] dark:border-white/[0.07] bg-white/70 dark:bg-zinc-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-violet-500/10 dark:bg-violet-400/15 border border-violet-500/20 text-violet-600 dark:text-violet-300 flex items-center justify-center shadow-2xs">
              <MemoryIcon size={16} strokeWidth={1.8} />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[13.5px] tracking-tight text-slate-900 dark:text-white">Memory</span>
              <span className="text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/15 font-mono">
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
                  ? 'bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-500 font-bold'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
              }`}
              title="High Contrast Mode"
            >
              <Eye size={14} />
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen(f => !f)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* ── Main Body Split ── */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          
          {/* ── Left Sidebar Navigation Rail ── */}
          <div className="w-[220px] flex-shrink-0 border-r border-black/[0.05] dark:border-white/[0.06] bg-slate-50/[0.4] dark:bg-zinc-950/[0.3] flex flex-col p-3.5 overflow-y-auto">
            
            {/* Category Navigation Items */}
            <div className="space-y-1 mb-4">
              <SidebarNavItem 
                icon={<Clock size={14} />} 
                label="Timeline" 
                isActive={activeTab === 'timeline'} 
                onClick={() => setActiveTab('timeline')} 
              />
              <SidebarNavItem 
                icon={<TasksIcon size={14} strokeWidth={1.8} />} 
                label="Decisions" 
                isActive={activeTab === 'decisions'} 
                onClick={() => setActiveTab('decisions')} 
              />
              <SidebarNavItem 
                icon={<Network size={14} />} 
                label="Knowledge Graph" 
                isActive={activeTab === 'graph'} 
                onClick={() => setActiveTab('graph')} 
              />
              <SidebarNavItem 
                icon={<Users size={14} />} 
                label="People" 
                isActive={activeTab === 'people'} 
                onClick={() => setActiveTab('people')} 
              />
              <SidebarNavItem 
                icon={<Folder size={14} />} 
                label="Projects" 
                isActive={activeTab === 'projects'} 
                onClick={() => setActiveTab('projects')} 
              />
              <SidebarNavItem 
                icon={<FileText size={14} />} 
                label="Files" 
                isActive={activeTab === 'files'} 
                onClick={() => setActiveTab('files')} 
              />
              <SidebarNavItem 
                icon={<MessageSquare size={14} />} 
                label="Meetings" 
                isActive={activeTab === 'meetings'} 
                onClick={() => setActiveTab('meetings')} 
              />
            </div>

            {/* Memory Index Health Card */}
            <div className="bg-white/80 dark:bg-zinc-900/70 rounded-xl border border-black/[0.06] dark:border-white/[0.08] p-3.5 mt-auto shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9.5px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider font-mono">Memory Index</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-semibold">Live</span>
                </span>
              </div>
              
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 mb-0.5">Indexed Entities</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">1,274</div>
              
              <div className="flex justify-between items-center text-[11px] mb-3">
                <span className="text-slate-500 dark:text-zinc-400">This month</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                  +186 synched
                </span>
              </div>
              
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">Connected Workspaces</div>
              <div className="flex items-center gap-1.5 mb-3">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-violet-500/10 text-violet-600 dark:text-violet-300 border border-violet-500/15" title="Compose"><RegaarderProductIcon name="compose" size={12} /></div>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/15" title="Sheets"><RegaarderProductIcon name="sheets" size={12} /></div>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/15" title="Deck"><RegaarderProductIcon name="deck" size={12} /></div>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-sky-500/10 text-sky-600 dark:text-sky-300 border border-sky-500/15" title="Room"><RegaarderProductIcon name="room" size={12} /></div>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] text-slate-500 dark:text-zinc-400 font-mono font-semibold bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.05]">+4</div>
              </div>
              
              <button 
                type="button"
                onClick={handleRefreshIndex}
                className="w-full py-1.5 rounded-lg border border-violet-500/20 bg-violet-50/60 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 hover:bg-violet-100/80 dark:hover:bg-violet-900/50 transition-colors active:scale-[0.98] cursor-pointer"
              >
                <RefreshCcw size={11} className={isRefreshing ? 'animate-spin' : ''} />
                {isRefreshing ? 'Re-indexing...' : 'Refresh Context'}
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
              
              {/* ── Context Query Hub (Crisp, High-Legibility Glass Card) ── */}
              <div className="relative rounded-2xl bg-gradient-to-br from-violet-500/[0.06] via-white/80 to-white/60 dark:from-violet-950/25 dark:via-zinc-900/70 dark:to-zinc-900/50 border border-violet-500/15 dark:border-violet-500/20 p-5 sm:p-6 overflow-hidden shadow-2xs">
                
                {/* Subtle Subordinate Ambient Glow */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-violet-400/10 dark:bg-violet-600/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] flex items-center justify-center shrink-0 border border-violet-500/20 text-violet-600 dark:text-violet-400">
                    <Brain size={24} strokeWidth={1.8} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">Query Context Memory</h1>
                      <span className="text-[9.5px] font-mono font-semibold text-violet-700 dark:text-violet-300 bg-violet-100/80 dark:bg-violet-950/80 px-2 py-0.5 rounded-md border border-violet-200/60 dark:border-violet-800/60 uppercase">
                        Cross-Workspace
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-500 dark:text-zinc-400 mb-3.5 leading-relaxed">
                      Search across all team discussions, spreadsheet models, decisions, and artifacts.
                    </p>
                    
                    {/* Search Input Box */}
                    <div className="relative flex items-center shadow-2xs rounded-xl">
                      <Search className="absolute left-3.5 text-slate-400 dark:text-zinc-500 pointer-events-none" size={15} />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search topics, decisions, meetings, or keywords..."
                        className="w-full pl-10 pr-24 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-black/[0.08] dark:border-white/[0.1] focus:border-violet-500/60 dark:focus:border-violet-400/60 focus:outline-none focus:ring-3 focus:ring-violet-500/15 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 transition-all font-normal"
                      />
                      {searchQuery && (
                        <button 
                          type="button" 
                          onClick={() => setSearchQuery('')}
                          className="absolute right-16 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                        >
                          <X size={13} />
                        </button>
                      )}
                      <button 
                        type="button"
                        className="absolute right-1.5 bg-violet-600 hover:bg-violet-700 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Search</span>
                      </button>
                    </div>
                    
                    {/* Quick Suggestion Chips */}
                    <div className="flex gap-2 mt-3 flex-wrap items-center">
                      <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500">Suggestions:</span>
                      {QUICK_SUGGESTIONS.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => setSearchQuery(suggestion)}
                          className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-zinc-800/80 border border-black/[0.06] dark:border-white/[0.08] text-[11px] font-medium text-slate-700 dark:text-zinc-300 hover:text-violet-700 dark:hover:text-violet-300 hover:border-violet-500/30 hover:bg-white dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-2xs"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Key Metrics Overview ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard 
                  icon={<CheckSquare className="text-violet-600 dark:text-violet-400" size={15} />} 
                  title="Decisions" 
                  value="128" 
                  subtitle="3 recorded this week" 
                  trend="up" 
                  color="violet" 
                />
                <StatCard 
                  icon={<Sparkles className="text-purple-600 dark:text-purple-400" size={15} />} 
                  title="Topics" 
                  value="67" 
                  subtitle="AI Templates trending" 
                  trend="up" 
                  color="purple" 
                />
                <StatCard 
                  icon={<Users className="text-emerald-600 dark:text-emerald-400" size={15} />} 
                  title="People" 
                  value="42" 
                  subtitle="4 core contributors" 
                  color="emerald" 
                />
                <StatCard 
                  icon={<Folder className="text-amber-600 dark:text-amber-400" size={15} />} 
                  title="Projects" 
                  value="16" 
                  subtitle="Across 4 workspaces" 
                  color="amber" 
                />
              </div>

              {/* ── Main Context Explorer Area ── */}
              <div className="flex flex-col lg:flex-row gap-5">
                
                {/* Center Content Stream */}
                <div className="flex-1 min-w-0">
                  
                  {/* Navigation Tab Bar (Apple-style Slightly Rounded Rectangles with Outlines) */}
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

                  {/* Dynamic Tab Body */}
                  {activeTab === 'timeline' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Knowledge Stream</h2>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">{filteredTimeline.length} entries</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            type="button"
                            onClick={() => setTimeFilter(f => f === 'All time' ? 'Last 30 days' : 'All time')}
                            className="flex items-center gap-1.5 px-2.5 py-1 border border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-zinc-800/80 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 shadow-2xs cursor-pointer transition-colors"
                          >
                            <span>{timeFilter}</span>
                            <ChevronDown size={12} className="text-slate-400" />
                          </button>
                          {selectedTopic && (
                            <button
                              type="button"
                              onClick={() => setSelectedTopic(null)}
                              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 text-[10px] font-semibold border border-violet-200 dark:border-violet-800"
                            >
                              <span>{selectedTopic}</span>
                              <X size={10} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Stream Timeline List */}
                      <div className="relative space-y-2.5 before:absolute before:left-[76px] before:top-3 before:bottom-3 before:w-[1px] before:bg-slate-200 dark:before:bg-zinc-800">
                        {filteredTimeline.map((item) => (
                          <TimelineItem 
                            key={item.id}
                            date={item.date} 
                            time={item.time} 
                            icon={<item.icon size={14} className={`text-${item.color}-600 dark:text-${item.color}-400`} />}
                            title={item.title}
                            desc={item.desc}
                            tags={item.tags}
                            avatars={item.avatars}
                            extraUsers={item.extraUsers}
                            workspace={item.workspace}
                            epistemic={item.epistemic}
                            confidence={item.confidence}
                            onNavigate={onNavigateToEntity}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'decisions' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Confirmed Organizational Decisions</h2>
                        <span className="text-[10px] text-slate-400 font-mono">{DECISIONS_DATA.length} verified</span>
                      </div>
                      <div className="grid gap-2.5">
                        {DECISIONS_DATA.map((dec) => (
                          <div key={dec.id} className="p-4 rounded-xl bg-white/80 dark:bg-zinc-800/70 border border-black/[0.06] dark:border-white/[0.08] shadow-2xs hover:border-violet-500/30 transition-all">
                            <div className="flex items-start justify-between gap-3 mb-1.5">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                                  <CheckSquare size={12} />
                                </div>
                                <h3 className="text-[13px] font-bold text-slate-900 dark:text-zinc-100">{dec.title}</h3>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 shrink-0">{dec.date}</span>
                            </div>
                            <p className="text-[12px] text-slate-600 dark:text-zinc-400 mb-3 leading-relaxed pl-7">{dec.rationale}</p>
                            <div className="flex items-center justify-between pl-7 text-[11px] text-slate-500 dark:text-zinc-400">
                              <div className="flex items-center gap-3">
                                <span>Owner: <strong className="text-slate-800 dark:text-zinc-200 font-medium">{dec.owner}</strong></span>
                                <span>Impact: <strong className="text-violet-600 dark:text-violet-400 font-medium">{dec.impact}</strong></span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] font-mono uppercase bg-black/[0.03] dark:bg-white/[0.04] px-2 py-0.5 rounded border border-black/[0.04] dark:border-white/[0.05]">
                                <RegaarderProductIcon name={dec.workspace} size={11} />
                                <span>{dec.workspace}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'graph' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Indexed Knowledge Clusters</h2>
                        <span className="text-[10px] text-slate-400 font-mono">5 active clusters</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {GRAPH_NODES.map((node) => (
                          <div key={node.id} className="p-4 rounded-xl bg-white/80 dark:bg-zinc-800/70 border border-black/[0.06] dark:border-white/[0.08] shadow-2xs hover:border-violet-500/30 transition-all flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded border border-violet-500/15">
                                  {node.category}
                                </span>
                                <span className="text-[11px] text-slate-400 font-mono">{node.connections} links</span>
                              </div>
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{node.label}</h3>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-black/[0.04] dark:border-white/[0.05] mt-3">
                              <span className="text-[11px] text-slate-500 dark:text-zinc-400">High semantic affinity</span>
                              <button 
                                type="button"
                                onClick={() => setSearchQuery(node.label)}
                                className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <span>Inspect</span>
                                <ArrowRight size={10} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'people' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Active Context Contributors</h2>
                        <span className="text-[10px] text-slate-400 font-mono">{PEOPLE_DATA.length} teammates</span>
                      </div>
                      <div className="grid gap-2.5">
                        {PEOPLE_DATA.map((p) => (
                          <div key={p.id} className="p-3.5 rounded-xl bg-white/80 dark:bg-zinc-800/70 border border-black/[0.06] dark:border-white/[0.08] shadow-2xs flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <img src={`https://i.pravatar.cc/150?u=${p.avatar}`} className="w-9 h-9 rounded-full object-cover ring-1 ring-black/[0.08] dark:ring-white/[0.1]" alt={p.name} />
                              <div>
                                <div className="text-[13px] font-bold text-slate-900 dark:text-white">{p.name}</div>
                                <div className="text-[11px] text-slate-500 dark:text-zinc-400">{p.role} • Active in <strong className="text-slate-700 dark:text-zinc-300 font-medium">{p.activeProject}</strong></div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[12px] font-bold text-violet-600 dark:text-violet-400 font-mono">{p.memories}</div>
                              <div className="text-[10px] text-slate-400">citations</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'projects' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Active Workspace Projects</h2>
                        <span className="text-[10px] text-slate-400 font-mono">{PROJECTS_DATA.length} tracking</span>
                      </div>
                      <div className="grid gap-2.5">
                        {PROJECTS_DATA.map((proj) => (
                          <div key={proj.id} className="p-3.5 rounded-xl bg-white/80 dark:bg-zinc-800/70 border border-black/[0.06] dark:border-white/[0.08] shadow-2xs flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] flex items-center justify-center shrink-0 border border-black/[0.04] dark:border-white/[0.05]">
                                <RegaarderProductIcon name={proj.workspace} size={15} />
                              </div>
                              <div className="min-w-0">
                                <div className="text-[13px] font-bold text-slate-900 dark:text-white truncate">{proj.title}</div>
                                <div className="text-[11px] text-slate-500 dark:text-zinc-400">Updated {proj.updated} • {proj.memories} linked context entities</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-[11px] font-bold text-slate-800 dark:text-zinc-200 font-mono">{proj.progress}</span>
                              <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-zinc-700 overflow-hidden">
                                <div className="h-full bg-violet-600 rounded-full" style={{ width: proj.progress }} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(activeTab === 'files' || activeTab === 'meetings') && (
                    <div className="p-8 text-center rounded-xl bg-white/60 dark:bg-zinc-800/50 border border-black/[0.05] dark:border-white/[0.06]">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto mb-2 border border-violet-500/15">
                        {activeTab === 'files' ? <FileText size={18} /> : <MessageSquare size={18} />}
                      </div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-1">
                        {activeTab === 'files' ? 'Cross-Workspace File Index' : 'Meeting Memory Logs'}
                      </h3>
                      <p className="text-[12px] text-slate-500 dark:text-zinc-400 max-w-sm mx-auto mb-3">
                        All synced items are automatically referenced into your primary knowledge stream.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('timeline')}
                        className="text-[11px] text-violet-600 dark:text-violet-400 font-semibold hover:underline cursor-pointer"
                      >
                        Return to Knowledge Stream
                      </button>
                    </div>
                  )}

                  {/* Load More Button */}
                  <div className="flex justify-center pt-2">
                    <button 
                      type="button"
                      className="flex items-center gap-1.5 px-4 py-1.5 border border-black/[0.08] dark:border-white/[0.1] bg-white/90 dark:bg-zinc-800/90 rounded-lg text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-500/30 transition-all shadow-2xs cursor-pointer active:scale-95"
                    >
                      <span>Load older context records</span>
                      <ArrowRight size={12} className="rotate-90 text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* ── Right Rail: Contextual Insights Panel ── */}
                <div className="w-full lg:w-[280px] shrink-0 space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={13} className="text-violet-600 dark:text-violet-400" />
                      <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Context Insights</h2>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 flex items-center gap-1 font-mono">
                      <RefreshCcw size={9} /> Synced 2m ago
                    </span>
                  </div>

                  {/* Recurring Topics Card */}
                  <div className="bg-white/80 dark:bg-zinc-800/70 rounded-xl border border-black/[0.06] dark:border-white/[0.08] p-3.5 shadow-2xs">
                    <div className="flex gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-300 flex items-center justify-center shrink-0 mt-0.5 border border-violet-500/15">
                        <TagIcon size={12} />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">Recurring Topics</h3>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">Click a topic to filter memory stream.</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      <Tag name="AI Templates" count="18" active={selectedTopic === 'AI Templates'} onClick={() => setSelectedTopic(t => t === 'AI Templates' ? null : 'AI Templates')} />
                      <Tag name="Monetization" count="14" active={selectedTopic === 'Monetization'} onClick={() => setSelectedTopic(t => t === 'Monetization' ? null : 'Monetization')} />
                      <Tag name="Mobile Improvements" count="13" active={selectedTopic === 'Mobile Improvements'} onClick={() => setSelectedTopic(t => t === 'Mobile Improvements' ? null : 'Mobile Improvements')} />
                      <Tag name="Funding" count="8" active={selectedTopic === 'Funding'} onClick={() => setSelectedTopic(t => t === 'Funding' ? null : 'Funding')} />
                      <Tag name="Security" count="9" active={selectedTopic === 'Security'} onClick={() => setSelectedTopic(t => t === 'Security' ? null : 'Security')} />
                    </div>
                  </div>

                  {/* Open Questions Card */}
                  <div className="bg-white/80 dark:bg-zinc-800/70 rounded-xl border border-black/[0.06] dark:border-white/[0.08] p-3.5 shadow-2xs">
                    <div className="flex gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/15">
                        <HelpCircle size={12} />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">Pending Questions</h3>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">Unresolved points requiring alignment.</p>
                      </div>
                    </div>
                    <ul className="space-y-1.5 text-[11.5px] text-slate-700 dark:text-zinc-300 pl-1">
                      <li className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>Target rollout date for AI template builder</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>Beta feedback cohort on mobile gestures</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>Enterprise tier data retention SLA</span>
                      </li>
                    </ul>
                  </div>

                  {/* Quick Knowledge Tip */}
                  <div className="p-3 rounded-xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200/50 dark:border-violet-900/30 text-[11px] text-slate-600 dark:text-zinc-300">
                    <div className="flex items-center gap-1.5 text-violet-700 dark:text-violet-300 font-bold mb-1">
                      <RegaarderAiIcon size={12} />
                      <span>Context Layer Tip</span>
                    </div>
                    Memory links cross-workspace references automatically. Press <kbd className="font-mono bg-white dark:bg-zinc-800 px-1 py-0.5 rounded text-[10px] border border-black/10 dark:border-white/10">Esc</kbd> anytime to return to your work.
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
    <div className="bg-white/80 dark:bg-zinc-800/70 p-3.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] shadow-2xs flex flex-col justify-between">
      <div className="flex items-center gap-2.5 mb-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${badgeColors[color] || badgeColors.violet}`}>
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

const TimelineItem = ({ date, time, icon, title, desc, tags, avatars, extraUsers, workspace, epistemic, confidence, onNavigate }) => (
  <div className="relative flex items-start gap-3 p-3 rounded-xl bg-white/70 dark:bg-zinc-800/60 hover:bg-white dark:hover:bg-zinc-800 transition-all border border-black/[0.04] dark:border-white/[0.05] hover:border-black/[0.08] dark:hover:border-white/[0.1] shadow-2xs">
    {/* Left Date / Time Badge */}
    <div className="w-[60px] shrink-0 text-right pt-0.5">
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
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-[13px] font-bold text-slate-900 dark:text-white truncate">{title}</h3>
            {workspace && (
              <span className="inline-flex items-center gap-1 text-[9.5px] font-mono uppercase text-slate-500 dark:text-zinc-400 bg-black/[0.03] dark:bg-white/[0.04] px-1.5 py-0.2 rounded border border-black/[0.04] dark:border-white/[0.05]">
                <RegaarderProductIcon name={workspace} size={10} />
                <span>{workspace}</span>
              </span>
            )}
          </div>
          <p className="text-[11.5px] text-slate-500 dark:text-zinc-400 mb-2.5 leading-relaxed">{desc}</p>
          
          <div className="flex items-center gap-1.5 flex-wrap">
            {tags.map((tag) => (
              <span 
                key={tag} 
                className="px-2 py-0.5 rounded-md bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.06] text-[10px] font-medium text-slate-600 dark:text-zinc-300"
              >
                {tag}
              </span>
            ))}
            {epistemic && (
              <span className="text-[9.5px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/15">
                {epistemic === 'verified' ? 'Verified' : `${confidence} Inferred`}
              </span>
            )}
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

const Tag = ({ name, count, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10.5px] font-medium border transition-all cursor-pointer ${
      active
        ? 'ring-2 ring-violet-500/40 bg-violet-600 text-white border-violet-600 font-semibold'
        : 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20 hover:bg-violet-500/15'
    }`}
  >
    <span>{name}</span>
    <span className="opacity-60 font-mono text-[9.5px]">{count}</span>
  </button>
);

export default MemoryDashboard;
