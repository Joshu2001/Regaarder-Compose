import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  CheckCircle,
  Circle,
  Calendar,
  Flag,
  Trash2,
  Clock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  User,
  SlidersHorizontal,
  ArrowUpDown,
  Check
} from "lucide-react";

const PRIORITY_OPTIONS = [
  { id: "urgent", label: "Urgent", color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200/60 dark:border-rose-900/40" },
  { id: "high", label: "High", color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-900/40" },
  { id: "medium", label: "Medium", color: "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border-sky-200/60 dark:border-sky-900/40" },
  { id: "low", label: "Low", color: "text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 border-slate-200/60 dark:border-zinc-700/60" }
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

function AppleMiniDatePicker({ value, onSelect, onClose, showTimeInput = false, timeValue = "", onTimeChange = null }) {
  const [viewDate, setViewDate] = useState(() => new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setViewDate(new Date(year, month + 1, 1));
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  const handleSelectDay = (day) => {
    const formatted = `${MONTH_SHORT[month]} ${day}`;
    onSelect(formatted);
  };

  return (
    <div 
      onClick={(e) => e.stopPropagation()} 
      className="w-64 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-zinc-700 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 font-sans"
    >
      {/* Quick Presets */}
      <div className="flex items-center gap-1 mb-2.5 pb-2 border-b border-slate-100 dark:border-zinc-800">
        {[
          { label: "Today", val: "Today" },
          { label: "Tomorrow", val: "Tomorrow" },
          { label: "Next Week", val: "Next Week" }
        ].map((preset) => {
          const isSel = value?.startsWith(preset.val);
          return (
            <button
              key={preset.label}
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                onSelect(preset.val);
              }}
              className={`flex-1 py-1 px-1.5 rounded-lg text-[11px] font-medium text-center transition-colors cursor-pointer ${
                isSel
                  ? "bg-violet-600 text-white font-semibold shadow-2xs"
                  : "bg-slate-100/70 hover:bg-slate-200/70 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300"
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Month & Year Navigation Header */}
      <div className="flex items-center justify-between px-1 mb-2">
        <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
          {MONTH_NAMES[month]} {year}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onPointerDown={handlePrevMonth}
            className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Previous month"
          >
            <ChevronLeft size={13} strokeWidth={2.2} />
          </button>
          <button
            type="button"
            onPointerDown={handleNextMonth}
            className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Next month"
          >
            <ChevronRight size={13} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <span key={d} className="text-[10px] font-medium text-slate-400 dark:text-zinc-500">
            {d}
          </span>
        ))}
      </div>

      {/* Day Cells */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <span key={`empty-${i}`} className="w-7 h-7" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const formatted = `${MONTH_SHORT[month]} ${day}`;
          const isSel = value?.includes(formatted);
          const currentDay = isToday(day);

          return (
            <button
              key={`day-${day}`}
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                handleSelectDay(day);
              }}
              className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center font-medium transition-all cursor-pointer ${
                isSel
                  ? "bg-violet-600 text-white font-semibold shadow-2xs"
                  : currentDay
                  ? "border border-violet-500/40 text-violet-600 dark:text-violet-400 font-semibold bg-violet-50/50 dark:bg-violet-950/30"
                  : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Optional Time & Action Footer */}
      {showTimeInput && (
        <div className="border-t border-slate-100 dark:border-zinc-800 mt-2.5 pt-2 space-y-1.5 px-0.5">
          <div className="flex items-center justify-between text-[10.5px] text-slate-500 dark:text-zinc-400">
            <span>Optional Time</span>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={timeValue}
              onChange={(e) => onTimeChange && onTimeChange(e.target.value)}
              placeholder="e.g. 10:00 AM"
              className="flex-1 text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 outline-none focus:border-violet-500"
            />
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                onClose();
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors cursor-pointer shrink-0"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const KNOWN_MOCK_TASK_TITLES = new Set([
  "Review Q3 financial report with accounting team",
  "Finalize brand design refresh slides for keynote",
  "Synthesize customer interviews and transcript highlights",
  "Update security compliance documentation for ISO audit"
]);

export default function TasksWorkspace({ onBackToHome, onOpenSchedule }) {
  const [tasks, setTasks] = useState(() => {
    try {
      const stored = localStorage.getItem("rc.workspaceTasks");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Permanently filter out any legacy mock placeholder tasks
          const realOnly = parsed.filter(
            (t) =>
              t &&
              t.title &&
              !KNOWN_MOCK_TASK_TITLES.has(t.title) &&
              !String(t.id).startsWith("task-1") &&
              !String(t.id).startsWith("task-2") &&
              !String(t.id).startsWith("task-3") &&
              !String(t.id).startsWith("task-4") &&
              !String(t.id).startsWith("sample-task-")
          );
          return realOnly;
        }
      }
    } catch {}
    return [];
  });

  const [filterCategory, setFilterCategory] = useState("all"); // 'all' | 'user' | 'agent' | 'team' | 'completed'
  const [searchQuery, setSearchQuery] = useState("");
  const [newTaskInput, setNewTaskInput] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState("Today");

  // Popover States
  const [isNewPriorityOpen, setIsNewPriorityOpen] = useState(false);
  const [isNewDateOpen, setIsNewDateOpen] = useState(false);
  const [activeTaskPriorityPopover, setActiveTaskPriorityPopover] = useState(null); // taskId
  const [activeTaskDatePopover, setActiveTaskDatePopover] = useState(null); // taskId
  const [customTimeInput, setCustomTimeInput] = useState("");

  const newPriorityRef = useRef(null);
  const newDateRef = useRef(null);
  const taskPopoverRef = useRef(null);

  // Synchronize to localStorage and custom events
  useEffect(() => {
    try {
      localStorage.setItem("rc.workspaceTasks", JSON.stringify(tasks));
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("rc.tasks-updated", { detail: tasks }));
    } catch {}
  }, [tasks]);

  useEffect(() => {
    const handleSync = () => {
      try {
        const stored = localStorage.getItem("rc.workspaceTasks");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const realOnly = parsed.filter(
              (t) =>
                t &&
                t.title &&
                !KNOWN_MOCK_TASK_TITLES.has(t.title) &&
                !String(t.id).startsWith("task-1") &&
                !String(t.id).startsWith("task-2") &&
                !String(t.id).startsWith("task-3") &&
                !String(t.id).startsWith("task-4") &&
                !String(t.id).startsWith("sample-task-")
            );
            setTasks(realOnly);
          }
        }
      } catch {}
    };
    window.addEventListener("storage", handleSync);
    window.addEventListener("rc.tasks-updated", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("rc.tasks-updated", handleSync);
    };
  }, []);

  // Global click-outside listener to dismiss popovers
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (newPriorityRef.current && !newPriorityRef.current.contains(e.target)) {
        setIsNewPriorityOpen(false);
      }
      if (newDateRef.current && !newDateRef.current.contains(e.target)) {
        setIsNewDateOpen(false);
      }
      if (taskPopoverRef.current && !taskPopoverRef.current.contains(e.target)) {
        setActiveTaskPriorityPopover(null);
        setActiveTaskDatePopover(null);
      }
    };
    document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, []);

  const handleAddTask = (e) => {
    e.preventDefault();
    const trimmed = newTaskInput.trim();
    if (!trimmed) return;

    const formattedDate = customTimeInput.trim() 
      ? `${newTaskDueDate} at ${customTimeInput.trim()}`
      : newTaskDueDate;

    const newTask = {
      id: `task-${Date.now()}`,
      title: trimmed,
      completed: false,
      category: filterCategory === "agent" ? "agent" : filterCategory === "team" ? "team" : "user",
      priority: newTaskPriority,
      dueDate: formattedDate,
      location: "Workspace / General"
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTaskInput("");
    setNewTaskDueDate("Today");
    setCustomTimeInput("");
  };

  const toggleTask = (taskId) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const updateTaskPriority = (taskId, newPriority) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, priority: newPriority } : t))
    );
    setActiveTaskPriorityPopover(null);
  };

  const updateTaskDueDate = (taskId, newDate) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, dueDate: newDate } : t))
    );
    setActiveTaskDatePopover(null);
  };

  const deleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterCategory === "completed" && !t.completed) return false;
      if (filterCategory !== "completed" && filterCategory !== "all") {
        if (t.category !== filterCategory) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          (t.location && t.location.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [tasks, filterCategory, searchQuery]);

  const renderPriorityBadge = (p, interactive = false, onClick = null) => {
    const opt = PRIORITY_OPTIONS.find((o) => o.id === p) || PRIORITY_OPTIONS[2];
    return (
      <button
        type="button"
        onClick={onClick}
        className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${opt.color} ${
          interactive ? "hover:scale-105 shadow-2xs" : ""
        }`}
      >
        {opt.label}
      </button>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#151518] overflow-hidden select-none">
      {/* Top Header Bar */}
      <div className="px-10 py-7 border-b border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between shrink-0 bg-white/70 dark:bg-[#151518]/70 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[22px] font-bold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <CheckSquare className="text-slate-600 dark:text-zinc-300" size={22} />
              <span>Tasks</span>
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
              {tasks.filter((t) => !t.completed).length} active
            </span>
          </div>
          <p className="text-[13px] text-slate-400 dark:text-zinc-400 mt-1">
            Organize, prioritize, and track deliverables across your entire workspace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenSchedule && (
            <button
              type="button"
              onClick={onOpenSchedule}
              className="px-3 py-1.5 rounded-xl border border-slate-200/70 dark:border-white/10 text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Calendar size={13} />
              <span>Open Schedule</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area with elegant thin memory-scrollbar */}
      <div className="flex-1 overflow-y-auto px-10 py-6 max-w-[940px] w-full mx-auto space-y-6 memory-scrollbar">
        {/* Task Creation Input Card */}
        <form
          onSubmit={handleAddTask}
          className="p-3 rounded-2xl bg-slate-50/80 dark:bg-zinc-850/60 border border-slate-200/70 dark:border-white/[0.06] flex items-center gap-2.5 shadow-2xs relative"
        >
          <Plus size={16} className="text-slate-400 ml-2 shrink-0" />
          <input
            type="text"
            value={newTaskInput}
            onChange={(e) => setNewTaskInput(e.target.value)}
            placeholder="Add a new task or action item..."
            className="flex-1 bg-transparent border-none outline-none text-xs text-slate-800 dark:text-zinc-200 placeholder-slate-400"
          />

          <div className="flex items-center gap-2 shrink-0">
            {/* Native Priority Popover Button */}
            <div className="relative" ref={newPriorityRef}>
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  setIsNewPriorityOpen((prev) => !prev);
                  setIsNewDateOpen(false);
                }}
                className="flex items-center gap-1 text-[11px] bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-white/10 rounded-lg px-2.5 py-1 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700/50 transition-colors cursor-pointer shadow-2xs"
              >
                <span>{PRIORITY_OPTIONS.find((o) => o.id === newTaskPriority)?.label}</span>
                <ChevronDown size={11} className="text-slate-400" />
              </button>

              {isNewPriorityOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-32 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-700 shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100 font-sans">
                  {PRIORITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        setNewTaskPriority(opt.id);
                        setIsNewPriorityOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        newTaskPriority === opt.id
                          ? "bg-slate-100 dark:bg-zinc-800 font-semibold text-slate-900 dark:text-white"
                          : "text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          opt.id === "urgent" ? "bg-rose-500" : opt.id === "high" ? "bg-amber-500" : opt.id === "medium" ? "bg-sky-500" : "bg-slate-400"
                        }`} />
                        {opt.label}
                      </span>
                      {newTaskPriority === opt.id && <Check size={11} className="text-violet-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Native Date & Optional Time Popover Button */}
            <div className="relative" ref={newDateRef}>
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  setIsNewDateOpen((prev) => !prev);
                  setIsNewPriorityOpen(false);
                }}
                className="flex items-center gap-1.5 text-[11px] bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-white/10 rounded-lg px-2.5 py-1 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700/50 transition-colors cursor-pointer shadow-2xs"
              >
                <Clock size={11} className="text-slate-400" />
                <span>{newTaskDueDate}</span>
                <ChevronDown size={11} className="text-slate-400" />
              </button>

              {isNewDateOpen && (
                <div className="absolute right-0 top-full mt-1.5 z-50">
                  <AppleMiniDatePicker
                    value={newTaskDueDate}
                    onSelect={(d) => setNewTaskDueDate(d)}
                    onClose={() => setIsNewDateOpen(false)}
                    showTimeInput={true}
                    timeValue={customTimeInput}
                    onTimeChange={setCustomTimeInput}
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!newTaskInput.trim()}
              className="px-3.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-slate-900 disabled:opacity-40 text-xs font-semibold transition-all cursor-pointer border-none shadow-2xs"
            >
              Add Task
            </button>
          </div>
        </form>

        {/* Filter Navigation Bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-zinc-800/60 p-0.5 rounded-xl border border-slate-200/60 dark:border-white/[0.04]">
            {[
              { id: "all", label: "All Tasks" },
              { id: "user", label: "Your Tasks" },
              { id: "agent", label: "Agent Tasks" },
              { id: "team", label: "Team Tasks" },
              { id: "completed", label: "Completed" }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterCategory(f.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border-none ${
                  filterCategory === f.id
                    ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-2xs font-semibold"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 bg-transparent"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Field */}
          <div className="relative flex items-center w-52">
            <Search size={13} className="absolute left-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-7 pr-2.5 py-1 rounded-lg bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-white/10 text-xs text-slate-800 dark:text-zinc-200 placeholder-slate-400 outline-none focus:border-violet-500 transition-colors"
            />
          </div>
        </div>

        {/* Tasks List */}
        <div 
          ref={taskPopoverRef}
          className="rounded-2xl border border-slate-200/60 dark:border-white/[0.06] bg-white dark:bg-zinc-850/40 shadow-2xs divide-y divide-slate-100 dark:divide-white/[0.04]"
        >
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-slate-100/70 dark:bg-zinc-850/60 border border-slate-200/50 dark:border-zinc-800/60 text-slate-500 dark:text-zinc-400 flex items-center justify-center">
                {filterCategory === "completed" ? (
                  <CheckCircle size={20} strokeWidth={1.8} />
                ) : (
                  <CheckSquare size={20} strokeWidth={1.8} />
                )}
              </div>
              <div className="max-w-sm space-y-1">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  {searchQuery.trim()
                    ? "No tasks match your search"
                    : filterCategory === "completed"
                    ? "No completed tasks yet"
                    : filterCategory === "user"
                    ? "No personal tasks"
                    : filterCategory === "agent"
                    ? "No agent tasks queued"
                    : filterCategory === "team"
                    ? "No team deliverables"
                    : "No tasks yet"}
                </h4>
                <p className="text-xs text-slate-400 dark:text-zinc-400">
                  {searchQuery.trim()
                    ? `No tasks found matching "${searchQuery}". Try searching for another keyword or clear the search.`
                    : filterCategory === "completed"
                    ? "Tasks you mark as complete will be cataloged and tracked here."
                    : tasks.length === 0
                    ? "Use the input above to organize, prioritize, and track deliverables."
                    : `No tasks found under ${
                        filterCategory === "user"
                          ? "Your Tasks"
                          : filterCategory === "agent"
                          ? "Agent Tasks"
                          : "Team Tasks"
                      }. Use the input above to add one.`}
                </p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                {searchQuery.trim() ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-200 text-xs font-medium border border-slate-200/90 dark:border-zinc-700 shadow-2xs transition-all cursor-pointer"
                  >
                    Clear Search
                  </button>
                ) : tasks.length === 0 ? null : (
                  <button
                    type="button"
                    onClick={() => setFilterCategory("all")}
                    className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-200 text-xs font-medium border border-slate-200/90 dark:border-zinc-700 shadow-2xs transition-all cursor-pointer"
                  >
                    View All Tasks
                  </button>
                )}
              </div>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center justify-between px-4 py-3 hover:bg-slate-50/70 dark:hover:bg-zinc-800/30 transition-colors group cursor-pointer relative ${
                  task.completed ? "opacity-50" : ""
                }`}
                onClick={() => toggleTask(task.id)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTask(task.id);
                    }}
                    className="cursor-pointer border-none bg-transparent p-0 text-slate-400 hover:text-violet-600 transition-colors shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle2 size={18} className="text-violet-600 dark:text-violet-400 fill-violet-50 dark:fill-violet-950/50" />
                    ) : (
                      <Circle size={18} className="text-slate-300 dark:text-zinc-600 hover:text-violet-500" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-[13px] font-medium truncate ${
                        task.completed
                          ? "line-through text-slate-400 dark:text-zinc-500"
                          : "text-slate-800 dark:text-zinc-200"
                      }`}
                    >
                      {task.title}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">
                      {task.location}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-4">
                  {/* Interactive Priority Pill with Native Popover */}
                  <div className="relative">
                    {renderPriorityBadge(task.priority, true, (e) => {
                      e.stopPropagation();
                      setActiveTaskPriorityPopover((prev) => (prev === task.id ? null : task.id));
                      setActiveTaskDatePopover(null);
                    })}

                    {activeTaskPriorityPopover === task.id && (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-full mt-1.5 w-32 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-700 shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100 font-sans"
                      >
                        {PRIORITY_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onPointerDown={(e) => {
                              e.preventDefault();
                              updateTaskPriority(task.id, opt.id);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                              task.priority === opt.id
                                ? "bg-slate-100 dark:bg-zinc-800 font-semibold text-slate-900 dark:text-white"
                                : "text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${
                                opt.id === "urgent" ? "bg-rose-500" : opt.id === "high" ? "bg-amber-500" : opt.id === "medium" ? "bg-sky-500" : "bg-slate-400"
                              }`} />
                              {opt.label}
                            </span>
                            {task.priority === opt.id && <Check size={11} className="text-violet-600" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Interactive Due Date Pill with Native Popover */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTaskDatePopover((prev) => (prev === task.id ? null : task.id));
                        setActiveTaskPriorityPopover(null);
                      }}
                      className="text-[11px] text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer border-none bg-transparent"
                    >
                      <Clock size={11} className="text-slate-400" />
                      <span>{task.dueDate}</span>
                    </button>

                    {activeTaskDatePopover === task.id && (
                      <div className="absolute right-0 top-full mt-1.5 z-50">
                        <AppleMiniDatePicker
                          value={task.dueDate}
                          onSelect={(d) => updateTaskDueDate(task.id, d)}
                          onClose={() => setActiveTaskDatePopover(null)}
                          showTimeInput={false}
                        />
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTask(task.id);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer border-none bg-transparent"
                    title="Delete task"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
