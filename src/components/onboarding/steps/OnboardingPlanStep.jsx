import React, { useState } from 'react';
import { CheckSquare, ArrowRight, Calendar, Flag, ChevronLeft, Plus, Clock, ArrowUpRight } from 'lucide-react';
import RegaarderBrandIcon from '../../RegaarderBrandIcon';

const INITIAL_TASK_SUGGESTIONS = [
  { title: 'Define product launch milestones & delivery timeline', priority: 'high', date: 'Today' },
  { title: 'Conduct technical feasibility & architectural review', priority: 'urgent', date: 'Tomorrow' },
  { title: 'Coordinate cross-functional design system review', priority: 'medium', date: 'Next Week' }
];

export default function OnboardingPlanStep({ onBack, onComplete }) {
  const [taskTitle, setTaskTitle] = useState('');
  const [priority, setPriority] = useState('high'); // 'urgent' | 'high' | 'medium' | 'low'
  const [dueDate, setDueDate] = useState('Today');

  const handleLaunchPlan = (initialTitle = taskTitle) => {
    const finalTitle = (initialTitle || '').trim();
    let initialTasks = [];

    if (finalTitle) {
      initialTasks.push({
        id: `task-user-${Date.now()}`,
        title: finalTitle,
        priority: priority,
        dueDate: dueDate,
        completed: false,
        source: 'user_intent_onboarding'
      });
    }

    onComplete({
      type: 'action',
      destination: 'tasks',
      createdTasks: initialTasks,
      toast: finalTitle ? `Task created: "${finalTitle}"` : 'Tasks & Schedule workspace ready'
    });
  };

  return (
    <div className="relative w-full h-full min-h-[580px] flex flex-col justify-between p-8 sm:p-12 select-none animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-2">
          <RegaarderBrandIcon size={18} className="text-slate-900 dark:text-zinc-100" />
          <span className="text-[13px] font-bold text-slate-900 dark:text-zinc-100">Tasks & Execution</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-xl w-full mx-auto my-auto py-2 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/40 text-indigo-700 dark:text-indigo-300 text-[11.5px] font-semibold mb-4">
          <CheckSquare size={13} />
          <span>Milestones & Cross-Workspace Scheduling</span>
        </div>

        <h2 className="text-[26px] sm:text-[30px] font-semibold text-slate-900 dark:text-zinc-100 tracking-tight leading-tight mb-2.5">
          What is your first major deliverable?
        </h2>
        <p className="text-[13.5px] text-slate-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed mb-6">
          Add your primary goal or first task. Regaarder synchronizes tasks into your schedule and connects them directly to relevant project documents.
        </p>

        {/* Task Creation Input */}
        <div className="p-4 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-zinc-900 text-left shadow-xs mb-5">
          <input
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleLaunchPlan();
              }
            }}
            placeholder="e.g. Finalize Q4 strategic launch roadmap..."
            className="w-full text-[14px] text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 bg-transparent outline-none mb-3"
          />

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              {/* Priority Selector */}
              <div className="flex items-center gap-1">
                {[
                  { id: 'urgent', label: 'Urgent', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/40' },
                  { id: 'high', label: 'High', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/40' },
                  { id: 'medium', label: 'Medium', color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900/40' }
                ].map((p) => {
                  const isSel = priority === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                        isSel ? p.color : 'text-slate-400 dark:text-zinc-500 border-transparent hover:bg-slate-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <Flag size={10} />
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Due Date Indicator */}
              <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400 px-2 py-1 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60">
                <Calendar size={11} />
                <span>{dueDate}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleLaunchPlan()}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-semibold transition-all active:scale-95 cursor-pointer"
            >
              <span>Set Deliverable</span>
              <ArrowRight size={13} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="text-left mb-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-2">
            Or pick an executive template
          </span>
          <div className="space-y-1.5">
            {INITIAL_TASK_SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLaunchPlan(item.title)}
                className="w-full p-2.5 rounded-xl border border-slate-200/70 dark:border-white/5 hover:border-indigo-300 dark:hover:border-indigo-800/60 bg-white/70 dark:bg-zinc-900/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 text-left text-[12px] text-slate-700 dark:text-zinc-300 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-zinc-600 flex items-center justify-center shrink-0" />
                  <span className="truncate">{item.title}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10.5px] text-slate-400 dark:text-zinc-500">{item.date}</span>
                  <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 text-indigo-600 dark:text-indigo-400 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="flex items-center justify-between w-full pt-4 border-t border-slate-100 dark:border-white/5">
        <span className="text-[11.5px] text-slate-400 dark:text-zinc-500">
          Zero placeholders. Only your authentic deliverables and timelines will be saved.
        </span>
        <button
          type="button"
          onClick={() => onComplete({ type: 'action', destination: 'tasks' })}
          className="inline-flex items-center gap-1 text-[11.5px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
        >
          <span>Open Tasks Workspace</span>
          <ArrowUpRight size={12} />
        </button>
      </div>
    </div>
  );
}
