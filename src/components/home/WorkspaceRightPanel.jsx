import React, { useState, useEffect } from "react";
import {
  Clock,
  ChevronRight,
  Calendar,
  CheckSquare,
  CheckCircle2,
  Circle,
  Folder,
  Search,
  HelpCircle,
  Link,
  X
} from "lucide-react";
import { AppNativeSvgIcon } from "./AppNativeSvgIcon";
import { RegaarderAiIcon } from "../RegaarderProductIcons";
import { subscribeToSchedule } from "../../services/intentSchedulerEngine";

export default function WorkspaceRightPanel({
  onLaunch,
  onSearchClick,
  onOpenHelp,
  onOpenLibrary,
  onOpenTasks,
  onOpenSchedule,
  onClose
}) {
  // 1. Dynamic Schedule Events
  const [scheduleEvents, setScheduleEvents] = useState(() => {
    try {
      const stored = localStorage.getItem("regaarder_schedule_events_v1");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  // 2. Dynamic Tasks
  const [tasks, setTasks] = useState(() => {
    try {
      const stored = localStorage.getItem("rc.workspaceTasks");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  // Subscribe to live schedule events
  useEffect(() => {
    const unsub = subscribeToSchedule((snapshot) => {
      if (snapshot && Array.isArray(snapshot.events)) {
        setScheduleEvents(snapshot.events);
      }
    });

    const handleScheduleSync = () => {
      try {
        const stored = localStorage.getItem("regaarder_schedule_events_v1");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setScheduleEvents(parsed);
        }
      } catch {}
    };

    window.addEventListener("rc.schedule-updated", handleScheduleSync);
    window.addEventListener("storage", handleScheduleSync);

    return () => {
      unsub();
      window.removeEventListener("rc.schedule-updated", handleScheduleSync);
      window.removeEventListener("storage", handleScheduleSync);
    };
  }, []);

  // Subscribe to live tasks
  useEffect(() => {
    const handleTaskSync = () => {
      try {
        const stored = localStorage.getItem("rc.workspaceTasks");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setTasks(parsed);
        }
      } catch {}
    };

    window.addEventListener("rc.tasks-updated", handleTaskSync);
    window.addEventListener("storage", handleTaskSync);

    return () => {
      window.removeEventListener("rc.tasks-updated", handleTaskSync);
      window.removeEventListener("storage", handleTaskSync);
    };
  }, []);

  // Quick toggle task completed from right panel
  const handleToggleTask = (e, taskId) => {
    e.stopPropagation();
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
      try {
        localStorage.setItem("rc.workspaceTasks", JSON.stringify(updated));
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new CustomEvent("rc.tasks-updated", { detail: updated }));
      } catch {}
      return updated;
    });
  };

  // Format date helper for upcoming events
  const formatEventDate = (dateStr) => {
    if (!dateStr) return "Upcoming";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const formatEventTime = (startStr, endStr) => {
    if (!startStr) return "";
    try {
      const d1 = new Date(startStr);
      if (isNaN(d1.getTime())) return "";
      const t1 = d1.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      if (endStr) {
        const d2 = new Date(endStr);
        if (!isNaN(d2.getTime())) {
          const t2 = d2.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
          return `${t1} - ${t2}`;
        }
      }
      return t1;
    } catch {
      return "";
    }
  };

  const activeTasks = tasks.filter((t) => !t.completed).slice(0, 3);
  const displayEvents = scheduleEvents.slice(0, 3);
  return (
    <aside className="w-[300px] shrink-0 p-5 space-y-4 select-none overflow-y-auto no-scrollbar border-l border-slate-200/50 dark:border-white/[0.06] bg-[#FAFBFD] dark:bg-zinc-900/40">
      {/* Header with Close affordance */}
      <div className="flex items-center justify-between pb-1">
        <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
          Workspace Panel
        </span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-200/50 dark:hover:bg-zinc-800 transition-colors cursor-pointer border-none bg-transparent"
            title="Hide panel"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* 1. Continue where you left off Card */}
      <div className="bg-white dark:bg-zinc-850/80 rounded-2xl p-4 border border-slate-200/50 dark:border-white/[0.06] shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200">
          <Clock size={15} className="text-slate-500" />
          <span className="text-[12.5px] font-semibold">Continue where you left off</span>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-zinc-500 -mt-1">
          Quick access to your active work.
        </p>

        <button
          type="button"
          onClick={() => onLaunch && onLaunch("compose")}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-100 dark:border-white/[0.04] hover:bg-slate-100/80 dark:hover:bg-zinc-800/70 transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2.5 truncate">
            <AppNativeSvgIcon type="compose" size={24} />
            <div className="truncate">
              <div className="text-[12px] font-medium text-slate-800 dark:text-zinc-200 truncate group-hover:text-violet-600 transition-colors">
                Untitled Document
              </div>
              <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                Editing · 2 min ago
              </div>
            </div>
          </div>
          <ChevronRight size={13} className="text-slate-400 shrink-0" />
        </button>
      </div>

      {/* 2. Upcoming Schedule Card */}
      <div className="bg-white dark:bg-zinc-850/80 rounded-2xl p-4 border border-slate-200/50 dark:border-white/[0.06] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200">
            <Calendar size={15} className="text-slate-500" />
            <span className="text-[12.5px] font-semibold">Upcoming</span>
          </div>
          <button
            type="button"
            onClick={onOpenSchedule}
            className="text-[11px] font-medium text-violet-600 dark:text-violet-400 hover:underline cursor-pointer bg-transparent border-none p-0"
          >
            View all
          </button>
        </div>

        {displayEvents.length > 0 ? (
          <div className="space-y-3 pt-1 text-xs">
            {displayEvents.map((evt, idx) => {
              const dotColors = ["bg-violet-500", "bg-emerald-500", "bg-amber-500", "bg-blue-500"];
              const dotColor = dotColors[idx % dotColors.length];
              const timeDisplay = formatEventTime(evt.startTime || evt.start, evt.endTime || evt.end);
              return (
                <div
                  key={evt.id || idx}
                  onClick={onOpenSchedule}
                  className="flex items-start gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <div className="w-11 text-[11px] font-medium text-slate-400 dark:text-zinc-500 pt-0.5 shrink-0">
                    {formatEventDate(evt.startTime || evt.start || evt.date)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />
                      <span className="font-medium text-[12px] text-slate-800 dark:text-zinc-200 truncate">
                        {evt.title || "Meeting / Event"}
                      </span>
                    </div>
                    {timeDisplay && (
                      <div className="text-[11px] text-slate-400 pl-3">
                        {timeDisplay}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            onClick={onOpenSchedule}
            className="text-center py-3 text-[11.5px] text-slate-400 dark:text-zinc-500 cursor-pointer hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            No upcoming events. Click to schedule.
          </div>
        )}
      </div>

      {/* 3. Your Tasks Card */}
      <div className="bg-white dark:bg-zinc-850/80 rounded-2xl p-4 border border-slate-200/50 dark:border-white/[0.06] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200">
            <CheckSquare size={15} className="text-slate-500" />
            <span className="text-[12.5px] font-semibold">Your Tasks</span>
          </div>
          <button
            type="button"
            onClick={onOpenTasks}
            className="text-[11px] font-medium text-violet-600 dark:text-violet-400 hover:underline cursor-pointer bg-transparent border-none p-0"
          >
            View all
          </button>
        </div>

        {activeTasks.length > 0 ? (
          <div className="space-y-2 pt-1 text-xs">
            {activeTasks.map((t) => {
              const priorityColors = {
                urgent: "text-red-500 bg-red-50 dark:bg-red-950/30",
                high: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
                medium: "text-violet-600 bg-violet-50 dark:bg-violet-950/30",
                low: "text-slate-500 bg-slate-100 dark:bg-zinc-800"
              };
              const pStyle = priorityColors[t.priority] || priorityColors.medium;
              return (
                <div
                  key={t.id}
                  onClick={onOpenTasks}
                  className="flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                >
                  <button
                    type="button"
                    onClick={(e) => handleToggleTask(e, t.id)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer bg-transparent border-none p-0 shrink-0"
                    title="Mark task completed"
                  >
                    <Circle size={13} className="text-slate-400 hover:text-emerald-500" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-medium text-slate-800 dark:text-zinc-200 truncate group-hover:text-violet-600 transition-colors">
                      {t.title}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[9.5px] font-medium px-1 rounded ${pStyle}`}>
                        {t.priority ? t.priority.toUpperCase() : "NORMAL"}
                      </span>
                      {t.dueDate && (
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                          · {t.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            onClick={onOpenTasks}
            className="text-center py-3 text-[11.5px] text-slate-400 dark:text-zinc-500 cursor-pointer hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            All tasks completed. Click to add.
          </div>
        )}
      </div>

      {/* 3. Quick links Card */}
      <div className="bg-white dark:bg-zinc-850/80 rounded-2xl p-4 border border-slate-200/50 dark:border-white/[0.06] shadow-2xs space-y-2.5">
        <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200">
          <Link size={14} className="text-slate-500" />
          <span className="text-[12.5px] font-semibold">Quick links</span>
        </div>

        <div className="space-y-0.5">
          <button
            type="button"
            onClick={onOpenLibrary}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[12px] text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors text-left cursor-pointer bg-transparent border-none"
          >
            <Folder size={14} className="text-slate-400" />
            <span>Open Library</span>
          </button>

          <button
            type="button"
            onClick={onSearchClick}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[12px] text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors text-left cursor-pointer bg-transparent border-none"
          >
            <Search size={14} className="text-slate-400" />
            <span>Search</span>
          </button>

          <button
            type="button"
            onClick={onOpenHelp}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[12px] text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors text-left cursor-pointer bg-transparent border-none"
          >
            <HelpCircle size={14} className="text-slate-400" />
            <span>Help & Support</span>
          </button>
        </div>
      </div>

      {/* 4. Ambient Regaarder Connected Card */}
      <div
        onClick={() => onLaunch && onLaunch("orb")}
        className="p-4 rounded-2xl bg-[#F6F4FE] dark:bg-violet-950/20 border border-violet-100/80 dark:border-violet-900/20 relative group cursor-pointer shadow-2xs hover:bg-[#F3EFFF] transition-colors"
      >
        <div className="flex items-center justify-between mb-2">
          <RegaarderAiIcon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          <ChevronRight size={14} className="text-violet-400 group-hover:translate-x-0.5 transition-transform" />
        </div>
        <div className="font-semibold text-[12px] text-slate-900 dark:text-zinc-100 mb-1">
          Your workspace, connected.
        </div>
        <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
          Docs, Sheets, Decks, Whiteboards, and more — all in one place.
        </p>
      </div>
    </aside>
  );
}
