import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Calendar,
  Flag,
  Trash2,
  Clock,
  ChevronDown,
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

export default function TasksWorkspace({ onBackToHome, onOpenSchedule }) {
  const [tasks, setTasks] = useState(() => {
    try {
      const stored = localStorage.getItem("rc.workspaceTasks");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: "task-1",
        title: "Review Q3 financial report with accounting team",
        completed: false,
        category: "user",
        priority: "high",
        dueDate: "Today",
        location: "Workspace / Sheets"
      },
      {
        id: "task-2",
        title: "Finalize brand design refresh slides for keynote",
        completed: false,
        category: "user",
        priority: "urgent",
        dueDate: "Tomorrow",
        location: "Workspace / Decks"
      },
      {
        id: "task-3",
        title: "Synthesize customer interviews and transcript highlights",
        completed: false,
        category: "agent",
        priority: "medium",
        dueDate: "Sep 16",
        location: "Workspace / Documents"
      },
      {
        id: "task-4",
        title: "Update security compliance documentation for ISO audit",
        completed: true,
        category: "team",
        priority: "low",
        dueDate: "Sep 12",
        location: "Workspace / Documents"
      }
    ];
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
          if (Array.isArray(parsed)) setTasks(parsed);
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
              <CheckSquare className="text-violet-600 dark:text-violet-400" size={22} />
              <span>Tasks</span>
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-violet-100/70 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
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
                <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-700 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 font-sans space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                    Due Date
                  </div>
                  <div className="space-y-0.5">
                    {["Today", "Tomorrow", "Next Week"].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onPointerDown={(e) => {
                          e.preventDefault();
                          setNewTaskDueDate(preset);
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                          newTaskDueDate.startsWith(preset)
                            ? "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-semibold"
                            : "text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <span>{preset}</span>
                        {newTaskDueDate.startsWith(preset) && <Check size={11} />}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 dark:border-zinc-800 pt-1.5 space-y-1.5 px-1">
                    <div className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Optional Time:</span>
                    </div>
                    <input
                      type="text"
                      value={customTimeInput}
                      onChange={(e) => setCustomTimeInput(e.target.value)}
                      placeholder="e.g. 10:00 AM"
                      className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 outline-none focus:border-violet-500"
                    />
                    <button
                      type="button"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        setIsNewDateOpen(false);
                      }}
                      className="w-full py-1 text-center text-xs font-semibold rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!newTaskInput.trim()}
              className="px-3.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white text-xs font-semibold transition-all cursor-pointer border-none shadow-2xs"
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
            <div className="py-12 text-center text-slate-400 dark:text-zinc-500 text-xs">
              No tasks found in this view.
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
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-full mt-1.5 w-44 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-700 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 font-sans space-y-1.5"
                      >
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                          Select Date
                        </div>
                        {["Today", "Tomorrow", "Next Week", "Sep 16", "Sep 30"].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onPointerDown={(e) => {
                              e.preventDefault();
                              updateTaskDueDate(task.id, preset);
                            }}
                            className={`w-full flex items-center justify-between px-2 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                              task.dueDate?.startsWith(preset)
                                ? "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-semibold"
                                : "text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
                            }`}
                          >
                            <span>{preset}</span>
                            {task.dueDate?.startsWith(preset) && <Check size={11} />}
                          </button>
                        ))}
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
