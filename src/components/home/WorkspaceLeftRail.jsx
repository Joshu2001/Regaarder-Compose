import React from "react";
import {
  Folder,
  CheckSquare,
  Calendar,
  Settings,
  Plus,
  X
} from "lucide-react";
import { AppNativeSvgIcon } from "./AppNativeSvgIcon";
import { FeedbackIcon, NotesIcon } from "../RegaarderProductIcons";

// Workspace Creation Applications (Documents & Canvases)
const WORKSPACE_APPS = [
  { id: "compose", label: "Docs", type: "compose" },
  { id: "notes", label: "Notes", type: "notes" },
  { id: "sheet", label: "Sheets", type: "sheet" },
  { id: "deck", label: "Deck", type: "deck" },
  { id: "whiteboard", label: "Whiteboard", type: "whiteboard" },
  { id: "room", label: "Room", type: "room" }
];

// Operational & Execution Tools (Coordination, Scheduling, Integration)
const OPERATE_APPS = [
  { id: "tasks", label: "Tasks", icon: "tasks" },
  { id: "schedule", label: "Schedule", icon: "schedule" },
  { id: "relay", label: "Relay", type: "relay" },
  { id: "browser", label: "Browser", type: "browser" }
];

export default function WorkspaceLeftRail({
  activeTab = "home",
  onSelectTab,
  onNewProject,
  onLaunch,
  onOpenTasks,
  onOpenSchedule,
  onOpenSettings,
  onOpenFeedback,
  onClose
}) {
  return (
    <aside className="w-64 md:w-56 shrink-0 border-r border-slate-200/60 dark:border-white/[0.06] bg-[#F9FAFB] dark:bg-zinc-900 px-3.5 py-4 sm:py-5 flex flex-col justify-between select-none h-full overflow-y-auto no-scrollbar">
      <div className="space-y-6">
        {/* Mobile Header with Close button */}
        {onClose && (
          <div className="flex md:hidden items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/[0.06]">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              Navigation
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-200/50 dark:hover:bg-zinc-800 transition-colors cursor-pointer border-none bg-transparent"
              title="Close menu"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Core Workspace Hub: Home & Projects */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab("home")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 cursor-pointer border-none ${
              activeTab === "home"
                ? "bg-[#EDE9FE] text-[#7C3AED] dark:bg-violet-950/50 dark:text-violet-300 font-semibold"
                : "text-slate-600 dark:text-zinc-400 hover:bg-slate-200/40 dark:hover:bg-white/[0.04]"
            }`}
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              className={activeTab === "home" ? "fill-[#7C3AED] text-[#7C3AED]" : "fill-none stroke-slate-500 stroke-2"}
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" fill={activeTab === "home" ? "#EDE9FE" : "none"} />
            </svg>
            <span>Home</span>
          </button>

          <div className="relative group/proj flex items-center">
            <button
              type="button"
              onClick={() => onSelectTab && onSelectTab("projects")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 cursor-pointer border-none ${
                activeTab === "projects" || activeTab === "library"
                  ? "bg-[#EDE9FE] text-[#7C3AED] dark:bg-violet-950/50 dark:text-violet-300 font-semibold"
                  : "text-slate-600 dark:text-zinc-400 hover:bg-slate-200/40 dark:hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Folder size={16} className={activeTab === "projects" || activeTab === "library" ? "text-[#7C3AED] dark:text-violet-300" : "text-slate-500"} />
                <span>Projects</span>
              </div>
            </button>

            {/* Quick Create Project Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onNewProject) {
                  onNewProject();
                } else if (onSelectTab) {
                  onSelectTab("projects");
                }
              }}
              title="Create new project"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-lg text-slate-500 hover:text-[#7C3AED] dark:text-zinc-400 dark:hover:text-violet-300 hover:bg-slate-200/70 dark:hover:bg-zinc-700/60 opacity-0 group-hover/proj:opacity-100 transition-all cursor-pointer border-none bg-transparent z-10"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* WORKSPACE: Creation & Thinking Surface */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400/90 dark:text-zinc-500 uppercase tracking-wider">
            Workspace
          </div>

          <div className="space-y-0.5">
            {WORKSPACE_APPS.map((app) => (
              <button
                key={app.id}
                type="button"
                onClick={() => onLaunch && onLaunch(app.id)}
                className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-[13px] font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer border-none group text-left"
              >
                <AppNativeSvgIcon type={app.type} size={18} />
                <span className="truncate">{app.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* OPERATE: Execution, Communication, Scheduling */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400/90 dark:text-zinc-500 uppercase tracking-wider">
            Operate
          </div>

          <div className="space-y-0.5">
            {/* Tasks */}
            <button
              type="button"
              onClick={() => {
                if (onOpenTasks) onOpenTasks();
                else if (onSelectTab) onSelectTab("tasks");
              }}
              className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer border-none ${
                activeTab === "tasks"
                  ? "bg-[#EDE9FE] text-[#7C3AED] dark:bg-violet-950/50 dark:text-violet-300 font-semibold"
                  : "text-slate-600 dark:text-zinc-400 hover:bg-slate-200/50 dark:hover:bg-zinc-800/40"
              }`}
            >
              <CheckSquare
                size={16}
                className={activeTab === "tasks" ? "text-[#7C3AED] dark:text-violet-300" : "text-slate-400"}
              />
              <span>Tasks</span>
            </button>

            {/* Schedule */}
            <button
              type="button"
              onClick={() => {
                if (onOpenSchedule) onOpenSchedule();
                else if (onSelectTab) onSelectTab("schedule");
              }}
              className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer border-none ${
                activeTab === "schedule"
                  ? "bg-[#EDE9FE] text-[#7C3AED] dark:bg-violet-950/50 dark:text-violet-300 font-semibold"
                  : "text-slate-600 dark:text-zinc-400 hover:bg-slate-200/50 dark:hover:bg-zinc-800/40"
              }`}
            >
              <Calendar
                size={16}
                className={activeTab === "schedule" ? "text-[#7C3AED] dark:text-violet-300" : "text-slate-400"}
              />
              <span>Schedule</span>
            </button>

            {/* Relay */}
            <button
              type="button"
              onClick={() => onLaunch && onLaunch("relay")}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-[13px] font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer border-none group text-left"
            >
              <AppNativeSvgIcon type="relay" size={18} />
              <span className="truncate">Relay</span>
            </button>

            {/* Browser */}
            <button
              type="button"
              onClick={() => onLaunch && onLaunch("browser")}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-[13px] font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer border-none group text-left"
            >
              <AppNativeSvgIcon type="browser" size={18} />
              <span className="truncate">Browser</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Actions: Feedback & Settings */}
      <div className="pt-4 space-y-1 border-t border-slate-200/60 dark:border-white/[0.04]">
        <button
          type="button"
          onClick={() => {
            if (onOpenFeedback) {
              onOpenFeedback();
            } else if (onSelectTab) {
              onSelectTab("feedback");
            }
          }}
          className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer border-none ${
            activeTab === "feedback"
              ? "bg-[#EDE9FE] text-[#7C3AED] dark:bg-violet-950/50 dark:text-violet-300 font-semibold"
              : "text-slate-600 dark:text-zinc-400 hover:bg-slate-200/50 dark:hover:bg-zinc-800/40"
          }`}
        >
          <FeedbackIcon size={16} className={activeTab === "feedback" ? "text-[#7C3AED] dark:text-violet-300" : "text-slate-400"} />
          <span>Feedback</span>
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-[13px] font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-200/50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer border-none"
        >
          <Settings size={16} className="text-slate-400" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
