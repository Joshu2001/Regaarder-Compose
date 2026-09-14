import React, { useState, useEffect, useMemo } from "react";
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
  ArrowUpDown
} from "lucide-react";

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

  useEffect(() => {
    try {
      localStorage.setItem("rc.workspaceTasks", JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  const handleAddTask = (e) => {
    e.preventDefault();
    const trimmed = newTaskInput.trim();
    if (!trimmed) return;

    const newTask = {
      id: `task-${Date.now()}`,
      title: trimmed,
      completed: false,
      category: filterCategory === "agent" ? "agent" : filterCategory === "team" ? "team" : "user",
      priority: newTaskPriority,
      dueDate: "Today",
      location: "Workspace / General"
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTaskInput("");
  };

  const toggleTask = (taskId) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
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

  const priorityBadge = (p) => {
    switch (p) {
      case "urgent":
        return <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-200/60 dark:border-rose-900/40">Urgent</span>;
      case "high":
        return <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-900/40">High</span>;
      case "medium":
        return <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded-md border border-sky-200/60 dark:border-sky-900/40">Medium</span>;
      default:
        return <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">Normal</span>;
    }
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

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-10 py-6 max-w-[940px] w-full mx-auto space-y-6">
        {/* Task Creation Input Card */}
        <form
          onSubmit={handleAddTask}
          className="p-3 rounded-2xl bg-slate-50/80 dark:bg-zinc-850/60 border border-slate-200/70 dark:border-white/[0.06] flex items-center gap-2.5 shadow-2xs"
        >
          <Plus size={16} className="text-slate-400 ml-2 shrink-0" />
          <input
            type="text"
            value={newTaskInput}
            onChange={(e) => setNewTaskInput(e.target.value)}
            placeholder="Add a new task or action item..."
            className="flex-1 bg-transparent border-none outline-none text-xs text-slate-800 dark:text-zinc-200 placeholder-slate-400"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value)}
              className="text-[11.5px] bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-white/10 rounded-lg px-2 py-1 text-slate-700 dark:text-zinc-300 outline-none cursor-pointer"
            >
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
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
        <div className="rounded-2xl border border-slate-200/60 dark:border-white/[0.06] bg-white dark:bg-zinc-850/40 overflow-hidden shadow-2xs divide-y divide-slate-100 dark:divide-white/[0.04]">
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-zinc-500 text-xs">
              No tasks found in this view.
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center justify-between px-4 py-3 hover:bg-slate-50/70 dark:hover:bg-zinc-800/30 transition-colors group cursor-pointer ${
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
                  {priorityBadge(task.priority)}

                  <span className="text-[11px] text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                    <Clock size={11} />
                    <span>{task.dueDate}</span>
                  </span>

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
