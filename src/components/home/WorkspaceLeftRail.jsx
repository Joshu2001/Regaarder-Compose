import React from "react";
import {
  Folder,
  CheckSquare,
  Calendar,
  Settings,
  Plus
} from "lucide-react";
import { AppNativeSvgIcon } from "./AppNativeSvgIcon";
import { FeedbackIcon, NotesIcon } from "../RegaarderProductIcons";

const WORKSPACE_APPS = [
  { id: "compose", label: "Docs", type: "compose" },
  { id: "sheet", label: "Sheets", type: "sheet" },
  { id: "deck", label: "Deck", type: "deck" },
  { id: "whiteboard", label: "Whiteboard", type: "whiteboard" },
  { id: "room", label: "Room", type: "room" },
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
  onOpenFeedback
}) {
  return (
    <aside className="w-56 shrink-0 border-r border-slate-200/50 dark:border-white/[0.06] bg-[#F8F9FA] dark:bg-zinc-900/40 px-3.5 py-5 flex flex-col justify-between select-none h-[calc(100vh-54px)]">
      <div className="space-y-6">
        {/* Navigation Group 1: Home & Library */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab("home")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors cursor-pointer border-none ${
              activeTab === "home"
                ? "bg-[#EDE9FE] text-[#7C3AED] dark:bg-violet-950/50 dark:text-violet-300 font-semibold"
                : "text-slate-600 dark:text-zinc-400 hover:bg-slate-200/50 dark:hover:bg-white/[0.04]"
            }`}
          >
            {/* Solid Filled Purple Home Icon matching design */}
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
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-colors cursor-pointer border-none ${
                activeTab === "projects" || activeTab === "library"
                  ? "bg-[#EDE9FE] text-[#7C3AED] dark:bg-violet-950/50 dark:text-violet-300 font-semibold"
                  : "text-slate-600 dark:text-zinc-400 hover:bg-slate-200/50 dark:hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Folder size={16} className={activeTab === "projects" || activeTab === "library" ? "text-[#7C3AED] dark:text-violet-300" : "text-slate-500"} />
                <span>Projects</span>
              </div>
            </button>

            {/* Antigravity / ChatGPT style '+' quick create button revealed on hover */}
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
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-lg text-slate-500 hover:text-[#7C3AED] dark:text-zinc-400 dark:hover:text-violet-300 hover:bg-slate-300/50 dark:hover:bg-zinc-700/60 opacity-0 group-hover/proj:opacity-100 transition-all cursor-pointer border-none bg-transparent z-10"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Workspace Apps */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 dark:text-zinc-500">
            Workspace Apps
          </div>

          <div className="space-y-1">
            {WORKSPACE_APPS.map((app) => (
              <button
                key={app.id}
                type="button"
                onClick={() => onLaunch && onLaunch(app.id)}
                className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-[13px] font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-200/60 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer border-none group"
              >
                <AppNativeSvgIcon type={app.type} size={18} />
                <span className="truncate">{app.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* More */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 dark:text-zinc-500">
            More
          </div>

          <div className="space-y-1">
            <button
              type="button"
              onClick={() => {
                if (onOpenTasks) onOpenTasks();
                else if (onSelectTab) onSelectTab("tasks");
              }}
              className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer border-none ${
                activeTab === "tasks"
                  ? "bg-[#EDE9FE] text-[#7C3AED] dark:bg-violet-950/50 dark:text-violet-300 font-semibold"
                  : "text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800/40"
              }`}
            >
              <CheckSquare
                size={16}
                className={activeTab === "tasks" ? "text-[#7C3AED] dark:text-violet-300" : "text-slate-400"}
              />
              <span>Tasks</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onOpenSchedule) onOpenSchedule();
                else if (onSelectTab) onSelectTab("schedule");
              }}
              className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer border-none ${
                activeTab === "schedule"
                  ? "bg-[#EDE9FE] text-[#7C3AED] dark:bg-violet-950/50 dark:text-violet-300 font-semibold"
                  : "text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800/40"
              }`}
            >
              <Calendar
                size={16}
                className={activeTab === "schedule" ? "text-[#7C3AED] dark:text-violet-300" : "text-slate-400"}
              />
              <span>Schedule</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onLaunch) onLaunch("notes");
                else if (onSelectTab) onSelectTab("notes");
              }}
              className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer border-none ${
                activeTab === "notes"
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 font-semibold"
                  : "text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800/40"
              }`}
            >
              <NotesIcon
                size={16}
                className={activeTab === "notes" ? "text-amber-600 dark:text-amber-400" : "text-slate-400"}
              />
              <span>Notes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="pt-4 space-y-1 border-t border-slate-200/50 dark:border-white/[0.04]">
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
              : "text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800/40"
          }`}
        >
          <FeedbackIcon size={16} className={activeTab === "feedback" ? "text-[#7C3AED] dark:text-violet-300" : "text-slate-400"} />
          <span>Feedback</span>
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-[13px] font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer border-none"
        >
          <Settings size={16} className="text-slate-400" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
