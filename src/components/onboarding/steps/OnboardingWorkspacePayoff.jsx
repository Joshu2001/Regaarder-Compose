import React, { useState } from 'react';
import {
  FileText, CheckCircle2, Circle, Calendar, 
  ArrowRight, Search, FileSpreadsheet,
  Layers, CheckSquare, Grid
} from 'lucide-react';
import RegaarderBrandIcon from '../../RegaarderBrandIcon';

const SUB_TABS = ['Overview', 'Docs', 'Sheets', 'Tasks', 'Schedule', 'Research'];

export default function OnboardingWorkspacePayoff({ preset, onViewDocument, onFinish }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [taskList, setTaskList] = useState(preset?.tasks || []);

  const toggleTask = (taskId) => {
    setTaskList(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="relative w-full h-full min-h-[620px] flex flex-col md:flex-row bg-[#fafafc] dark:bg-[#121214] text-slate-900 dark:text-zinc-100 select-none animate-in fade-in duration-300 overflow-hidden">
      {/* Mini Sidebar */}
      <div className="hidden md:flex w-56 border-r border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#18181b] flex-col justify-between p-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 px-2 py-2 mb-4">
            <RegaarderBrandIcon size={18} className="text-slate-900 dark:text-zinc-100" />
            <span className="text-[14px] font-bold tracking-tight">Regaarder</span>
          </div>

          <div className="space-y-1 mb-6">
            <button type="button" className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12.5px] font-medium bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100">
              <Grid size={14} />
              <span>Home</span>
            </button>
            <button type="button" className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12.5px] font-medium text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200">
              <Search size={14} />
              <span>Search</span>
            </button>
          </div>

          <div className="px-2 mb-2">
            <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Workspace Apps
            </span>
          </div>
          <div className="space-y-1 text-[12.5px] text-slate-600 dark:text-zinc-400">
            <div className="flex items-center gap-2.5 px-3 py-1 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/50">
              <FileText size={14} className="text-blue-500" />
              <span>Compose</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-1 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/50">
              <FileSpreadsheet size={14} className="text-emerald-500" />
              <span>Sheets</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-1 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/50">
              <Layers size={14} className="text-amber-500" />
              <span>Deck</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-1 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/50">
              <CheckSquare size={14} className="text-violet-500" />
              <span>Tasks</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-white/10 text-[11.5px] text-slate-400">
          Tailored Workspace
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <div className="h-14 px-6 border-b border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#18181b]/70 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="relative w-64 max-w-full">
            <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              readOnly
              placeholder="Search your workspace..."
              className="w-full h-8 pl-8 pr-3 text-[12px] rounded-lg bg-slate-100/80 dark:bg-zinc-800/80 border-0 text-slate-600 dark:text-zinc-300 focus:outline-none cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onFinish} className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[12px] font-medium transition-all shadow-2xs cursor-pointer">
              Open Full App
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div className="p-6 md:p-8 max-w-5xl w-full mx-auto space-y-6">
          {/* Workspace Title & Badge */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-lg shrink-0 shadow-2xs">
                {preset?.title ? preset.title.charAt(0) : 'P'}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-[20px] sm:text-[22px] font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
                    {preset?.title || 'Product Launch Plan'}
                  </h1>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border border-violet-200/50 dark:border-violet-800/50">
                    {preset?.type || 'Project'}
                  </span>
                </div>
                <p className="text-[13px] text-slate-500 dark:text-zinc-400">
                  {preset?.subtitle || 'Everything you need to plan, research, and execute your product launch.'}
                </p>
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1.5 border-b border-slate-200/80 dark:border-white/10 pb-2">
            {SUB_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-[12.5px] font-medium transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'border border-violet-500/50 bg-violet-50/60 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 font-semibold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Grid Layout Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Project Brief Card */}
            <div className="md:col-span-2 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Project Brief
                  </span>
                  <FileText size={14} className="text-slate-400" />
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-100 dark:border-white/5 mb-3">
                  <h3 className="text-[14px] font-semibold text-slate-900 dark:text-zinc-100 mb-1">
                    {preset?.projectBrief?.title || 'Product Launch Plan'}
                  </h3>
                  <p className="text-[12px] text-slate-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                    {preset?.projectBrief?.description || 'A comprehensive plan for our Q4 product launch.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onViewDocument}
                className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 transition-colors cursor-pointer group"
              >
                <span>View document</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* 2. Key Tasks Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Key Tasks
                  </span>
                  <CheckSquare size={14} className="text-slate-400" />
                </div>
                <div className="space-y-2 mb-3">
                  {taskList.slice(0, 4).map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      className="w-full flex items-center justify-between text-left p-1 rounded-md hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        {task.completed ? (
                          <CheckCircle2 size={13} className="text-violet-600 shrink-0" />
                        ) : (
                          <Circle size={13} className="text-slate-300 dark:text-zinc-600 shrink-0" />
                        )}
                        <span className={`text-[11.5px] truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-zinc-300'}`}>
                          {task.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">{task.dueDate}</span>
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={onViewDocument}
                className="text-[11.5px] font-medium text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 text-left transition-colors"
              >
                View all tasks →
              </button>
            </div>

            {/* 3. Market Research Card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-2">
                Market Research
              </span>
              <div className="h-10 flex items-end gap-1 mb-2">
                {(preset?.marketResearch?.chartData || [20, 45, 60, 80, 95]).map((val, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-violet-400/30 dark:bg-violet-500/30 hover:bg-violet-500 rounded-t transition-all"
                    style={{ height: `${val}%` }}
                  />
                ))}
              </div>
              <span className="text-[12px] font-semibold text-slate-800 dark:text-zinc-200 block">
                {preset?.marketResearch?.title || 'Competitive Analysis'}
              </span>
              <span className="text-[10.5px] text-slate-400">
                {preset?.marketResearch?.updatedText || 'Updated 2h ago'}
              </span>
            </div>

            {/* 4. Launch Timeline */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-2">
                Launch Timeline
              </span>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-950/50 text-violet-600">
                  <Calendar size={16} />
                </div>
                <div>
                  <span className="text-[12.5px] font-bold text-slate-900 dark:text-zinc-100 block">
                    {preset?.launchTimeline?.period || 'Q4 2026'}
                  </span>
                  <span className="text-[10.5px] text-slate-400">
                    {preset?.launchTimeline?.milestonesCount || '12 key milestones'}
                  </span>
                </div>
              </div>
            </div>

            {/* 5. Related Docs */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-2">
                Related Docs
              </span>
              <div className="space-y-1.5">
                {(preset?.relatedDocs || [
                  { title: 'Go-to-Market Strategy', type: 'doc' },
                  { title: 'Competitive Analysis', type: 'sheet' }
                ]).map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11.5px] text-slate-600 dark:text-zinc-300">
                    <FileText size={12} className="text-violet-500 shrink-0" />
                    <span className="truncate">{doc.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
