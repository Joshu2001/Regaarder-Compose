import React, { useState } from 'react';
import { 
  Search, Brain, Users, Folder, CheckSquare, Clock, FileText, History, 
  RefreshCcw, Filter, ChevronDown, Sparkles, HelpCircle,
  Network, ArrowRight, Box, Layers, Globe, Layout
} from 'lucide-react';
import { MemoryIcon, TasksIcon } from './components/RegaarderProductIcons';

const MemoryDashboard = () => {
  return (
    <div className="flex h-full w-full bg-[#f8f9fa] text-slate-800" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Left Sidebar */}
      <div className="w-[240px] flex-shrink-0 bg-[#f8f9fa] border-r border-slate-200 flex flex-col p-4 overflow-y-auto">
        <div className="flex items-center gap-2 mb-8 mt-2 px-2 text-violet-700">
          <MemoryIcon size={18} strokeWidth={2.0} />
          <span className="font-semibold text-sm">Memory</span>
        </div>
        
        <div className="space-y-1 mb-8">
          <NavItem icon={<Search size={16} />} label="Search" />
          <NavItem icon={<Network size={16} />} label="Knowledge Graph" />
          <NavItem icon={<Users size={16} />} label="People" />
          <NavItem icon={<Folder size={16} />} label="Projects" />
          <NavItem icon={<TasksIcon size={16} strokeWidth={1.8} />} label="Decisions" />
          <NavItem icon={<Clock size={16} />} label="Timeline" />
          <NavItem icon={<FileText size={16} />} label="Files" />
          <NavItem icon={<History size={16} />} label="Room History" />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 mt-auto shadow-sm">
          <div className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-3">Memory Status</div>
          <div className="text-xs text-slate-500 mb-1">Total memories</div>
          <div className="text-2xl font-bold text-slate-800 mb-2">1,274</div>
          <div className="flex justify-between text-[11px] mb-4">
            <span className="text-slate-500">This month</span>
            <span className="text-emerald-500 font-semibold">+186</span>
          </div>
          
          <div className="text-[11px] font-semibold text-slate-700 mb-2">Sources connected</div>
          <div className="flex items-center gap-1.5 mb-4">
            <div className="w-5 h-5 rounded flex items-center justify-center bg-purple-100 text-purple-600"><Box size={12} /></div>
            <div className="w-5 h-5 rounded flex items-center justify-center bg-green-100 text-green-600"><Layers size={12} /></div>
            <div className="w-5 h-5 rounded flex items-center justify-center bg-yellow-100 text-yellow-600"><Layout size={12} /></div>
            <div className="w-5 h-5 rounded flex items-center justify-center bg-blue-100 text-blue-600"><Globe size={12} /></div>
            <div className="w-5 h-5 flex items-center justify-center text-xs text-slate-500 font-medium">+5</div>
          </div>
          
          <button className="w-full py-2 rounded-lg border border-slate-200 text-violet-600 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-violet-50 transition-colors">
            <RefreshCcw size={12} />
            Refresh index
          </button>
        </div>
        
        {/* User profile at bottom of sidebar matching image */}
        <div className="mt-4 p-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 cursor-pointer transition-colors">
           <img src="https://i.pravatar.cc/150?u=a04258114e29026702d" className="w-8 h-8 rounded-full" alt="User" />
           <div className="flex-1 min-w-0">
             <div className="text-xs font-semibold text-slate-900 truncate">Joshua Regaarder</div>
             <div className="text-[10px] text-slate-500 truncate">joshua@regaarder.com</div>
           </div>
           <ChevronDown size={14} className="text-slate-400" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white m-2 rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="flex-1 overflow-y-auto p-8 thin-scrollbar">
          
          {/* Hero Search Section */}
          <div className="bg-gradient-to-br from-violet-50 via-white to-white rounded-2xl border border-violet-100 p-8 mb-6 relative overflow-hidden">
             <div className="flex gap-6 relative z-10">
               <div className="w-24 h-24 rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-center shrink-0 border border-violet-50">
                  <Brain size={48} className="text-violet-500" strokeWidth={1.5} />
               </div>
               <div className="flex-1">
                 <h1 className="text-2xl font-bold text-slate-900 mb-1">Ask Memory Anything</h1>
                 <p className="text-sm text-slate-500 mb-4">Search across meetings, chats, tasks, notes, files, and decisions.</p>
                 
                 <div className="relative">
                   <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input 
                     type="text" 
                     placeholder="What was decided about Q3 launch?"
                     className="w-full pl-10 pr-24 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 shadow-sm text-sm"
                   />
                   <button className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-violet-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors flex items-center gap-1.5">
                     <Search size={14} /> Search
                   </button>
                 </div>
                 
                 <div className="flex gap-2 mt-4 flex-wrap">
                   <Chip label="What concerns did Michelle raise?" />
                   <Chip label="Show all AI template discussions" />
                   <Chip label="Find mobile roadmap decisions" />
                   <Chip label="What happened last week?" />
                 </div>
               </div>
             </div>
             {/* Decorative Background blob */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-violet-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <StatCard icon={<CheckSquare className="text-violet-600" size={20} />} title="Decisions" value="128" subtitle="2 this month" trend="up" color="violet" />
            <StatCard icon={<Sparkles className="text-purple-600" size={20} />} title="Topics" value="67" subtitle="AI Templates trending" trend="up" color="purple" />
            <StatCard icon={<Users className="text-emerald-600" size={20} />} title="People" value="42" subtitle="Most active contributors" color="emerald" />
            <StatCard icon={<Folder className="text-amber-600" size={20} />} title="Projects" value="16" subtitle="Across all rooms" color="amber" />
          </div>

          {/* Tabs and Content Area */}
          <div className="flex gap-6">
            <div className="flex-1 min-w-0">
               {/* Nav Tabs */}
               <div className="flex items-center gap-6 border-b border-slate-200 mb-6 text-sm font-medium">
                 <div className="pb-3 border-b-2 border-violet-600 text-violet-600 flex items-center gap-2 cursor-pointer">
                    <Clock size={16} /> Timeline
                 </div>
                 <div className="pb-3 text-slate-500 hover:text-slate-800 flex items-center gap-2 cursor-pointer transition-colors">
                    <Network size={16} /> Knowledge Graph
                 </div>
                 <div className="pb-3 text-slate-500 hover:text-slate-800 flex items-center gap-2 cursor-pointer transition-colors">
                    <Users size={16} /> People
                 </div>
                 <div className="pb-3 text-slate-500 hover:text-slate-800 flex items-center gap-2 cursor-pointer transition-colors">
                    <Folder size={16} /> Projects
                 </div>
                 <div className="pb-3 text-slate-500 hover:text-slate-800 flex items-center gap-2 cursor-pointer transition-colors">
                    <FileText size={16} /> Files
                 </div>
                 <div className="pb-3 text-slate-500 hover:text-slate-800 flex items-center gap-2 cursor-pointer transition-colors">
                    <Clock size={16} /> Meetings
                 </div>
               </div>

               {/* Timeline Header */}
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-slate-900">Memory Timeline</h2>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50">
                      All time <ChevronDown size={14} />
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50">
                      <Filter size={14} /> Filter
                    </button>
                  </div>
               </div>

               {/* Timeline List */}
               <div className="relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  <TimelineItem 
                    date="June 12" time="10:30 AM" 
                    icon={<div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600"><Clock size={18} /></div>}
                    title="Product Strategy Meeting"
                    desc="Discussed Q3 priorities, AI templates launch, and mobile improvements."
                    tags={['AI Templates', 'Mobile Improvements', 'Q3 Launch']}
                    avatars={['a04258114e29026702d', '114e29026702d', '29026702d']}
                    extraUsers="+2"
                  />
                  <TimelineItem 
                    date="June 10" time="2:15 PM" 
                    icon={<div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><Network size={18} /></div>}
                    title="Investor Review"
                    desc="Reviewed growth metrics, funding strategy, and market expansion."
                    tags={['Funding', 'Growth Metrics', 'Market Expansion']}
                    avatars={['29026702d', '114e29026702d', 'a04258114e29026702d']}
                    extraUsers="+1"
                  />
                  <TimelineItem 
                    date="June 9" time="9:00 AM" 
                    icon={<div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"><FileText size={18} /></div>}
                    title="Design Critique"
                    desc="Reviewed new dashboard UI concepts and user feedback."
                    tags={['Dashboard', 'UI/UX', 'User Feedback']}
                    avatars={['114e29026702d', 'a04258114e29026702d', '29026702d']}
                    extraUsers="+3"
                  />
               </div>

               <div className="flex justify-center mt-6">
                 <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-full text-sm font-medium text-violet-600 hover:bg-violet-50 transition-colors">
                   Load more <ArrowRight size={14} className="rotate-90" />
                 </button>
               </div>
            </div>

            {/* Right Sidebar - AI Insights */}
            <div className="w-[300px] shrink-0 space-y-4">
               <div className="flex items-center justify-between mb-2">
                 <h2 className="text-[15px] font-bold text-slate-900">AI Insights</h2>
                 <span className="text-[10px] text-slate-400 flex items-center gap-1"><RefreshCcw size={10} /> Updated 2 min ago</span>
               </div>

               {/* Recurring Topics Card */}
               <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                 <div className="flex gap-2 mb-2">
                   <div className="w-6 h-6 rounded-md bg-purple-100 flex items-center justify-center shrink-0 mt-0.5"><Sparkles size={12} className="text-purple-600" /></div>
                   <div>
                     <h3 className="text-[13px] font-bold text-slate-900">Recurring Topics</h3>
                     <p className="text-[11px] text-slate-500 leading-tight">These topics keep coming up in your conversations.</p>
                   </div>
                 </div>
                 <div className="flex flex-wrap gap-2 mt-3">
                    <Tag name="AI Templates" count="18" color="purple" />
                    <Tag name="Monetization" count="14" color="purple" />
                    <Tag name="Mobile App" count="13" color="blue" />
                    <Tag name="User Onboarding" count="9" color="purple" />
                    <Tag name="Growth" count="8" color="blue" />
                 </div>
               </div>

               {/* Open Questions Card */}
               <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                 <div className="flex gap-2 mb-3">
                   <div className="w-6 h-6 rounded-md bg-amber-100 flex items-center justify-center shrink-0 mt-0.5"><HelpCircle size={12} className="text-amber-600" /></div>
                   <div>
                     <h3 className="text-[13px] font-bold text-slate-900">Open Questions</h3>
                     <p className="text-[11px] text-slate-500 leading-tight">These are unresolved or need decisions.</p>
                   </div>
                 </div>
                 <ul className="space-y-2 text-[12px] text-slate-700 list-disc pl-4 marker:text-slate-300">
                   <li>What's the exact launch date for AI templates?</li>
                   <li>How should we structure the mobile beta?</li>
                   <li>What's our go-to-market strategy?</li>
                 </ul>
                 <button className="text-[11px] text-violet-600 font-medium flex items-center gap-1 mt-3 hover:underline">
                   View all open questions <ArrowRight size={10} />
                 </button>
               </div>

               {/* Recent Decisions Card */}
               <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                 <div className="flex gap-2 mb-3">
                   <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5"><CheckSquare size={12} className="text-emerald-600" /></div>
                   <div>
                     <h3 className="text-[13px] font-bold text-slate-900">Recent Decisions</h3>
                     <p className="text-[11px] text-slate-500 leading-tight">Key decisions from your team.</p>
                   </div>
                 </div>
                 <ul className="space-y-2.5 text-[12px] text-slate-700 list-disc pl-4 marker:text-slate-300">
                   <li className="flex justify-between items-start gap-2 relative -left-4">
                     <div className="flex gap-1.5"><span className="text-slate-300">•</span> <span>Launch AI templates in August</span></div>
                     <span className="text-[10px] text-slate-400 shrink-0">Jun 12</span>
                   </li>
                   <li className="flex justify-between items-start gap-2 relative -left-4">
                     <div className="flex gap-1.5"><span className="text-slate-300">•</span> <span>Improve mobile onboarding flow</span></div>
                     <span className="text-[10px] text-slate-400 shrink-0">Jun 10</span>
                   </li>
                   <li className="flex justify-between items-start gap-2 relative -left-4">
                     <div className="flex gap-1.5"><span className="text-slate-300">•</span> <span>Expand beta to 500 users</span></div>
                     <span className="text-[10px] text-slate-400 shrink-0">Jun 9</span>
                   </li>
                 </ul>
                 <button className="text-[11px] text-violet-600 font-medium flex items-center gap-1 mt-3 hover:underline">
                   View all decisions <ArrowRight size={10} />
                 </button>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Helper Components

const NavItem = ({ icon, label }) => (
  <div className={`flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition-colors ${label === 'Search' ? 'text-violet-600 bg-violet-50 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}>
    <div className={label === 'Search' ? 'text-violet-600' : 'text-slate-400'}>{icon}</div>
    <span className="text-[13px]">{label}</span>
  </div>
);

const Chip = ({ label }) => (
  <div className="px-3 py-1.5 rounded-full bg-violet-50/50 border border-violet-100 text-[11px] font-medium text-violet-700 hover:bg-violet-100 cursor-pointer transition-colors whitespace-nowrap">
    {label}
  </div>
);

const StatCard = ({ icon, title, value, subtitle, trend, color }) => {
  // Use a hack to allow dynamic Tailwind classes by mapping them
  const bgColors = {
    violet: 'bg-violet-50',
    purple: 'bg-purple-50',
    emerald: 'bg-emerald-50',
    amber: 'bg-amber-50'
  };
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bgColors[color]}`}>
          {icon}
        </div>
        <div>
          <div className="text-[13px] font-semibold text-slate-600">{title}</div>
          <div className="text-2xl font-bold text-slate-900 leading-none">{value}</div>
        </div>
      </div>
      <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
        {trend === 'up' && <ArrowRight size={10} className="-rotate-45" />} {subtitle}
      </div>
    </div>
  );
};

const TimelineItem = ({ date, time, icon, title, desc, tags, avatars, extraUsers }) => (
  <div className="relative flex items-start gap-4 mb-8">
    <div className="w-[70px] shrink-0 text-right pt-2 relative z-10 bg-white">
      <div className="text-[11px] font-bold text-slate-900">{date}</div>
      <div className="text-[10px] text-slate-500">{time}</div>
    </div>
    
    <div className="relative z-10 flex items-center justify-center bg-white py-1">
      {icon}
    </div>
    
    <div className="flex-1 pt-1.5 pb-4 border-b border-slate-100 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[14px] font-bold text-slate-900 mb-1">{title}</h3>
          <p className="text-[12px] text-slate-500 mb-3">{desc}</p>
          <div className="flex gap-2 flex-wrap">
            {tags.map((tag, i) => (
              <div key={i} className="px-2 py-1 rounded bg-slate-100 text-[10px] font-medium text-slate-600">
                {tag}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center">
          <div className="flex -space-x-2 mr-2">
            {avatars.map((av, i) => (
              <img key={i} src={`https://i.pravatar.cc/150?u=${av}`} alt="Avatar" className="w-6 h-6 rounded-full border-2 border-white" />
            ))}
          </div>
          {extraUsers && <div className="text-[10px] font-medium text-slate-400">{extraUsers}</div>}
        </div>
      </div>
    </div>
  </div>
);

const Tag = ({ name, count, color }) => {
  const bgColors = {
    purple: 'bg-purple-50 text-purple-700',
    blue: 'bg-blue-50 text-blue-700'
  };
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium ${bgColors[color]}`}>
      <span>{name}</span>
      <span className={`opacity-60`}>{count}</span>
    </div>
  );
};

export default MemoryDashboard;
