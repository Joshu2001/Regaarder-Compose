import React, { useState } from "react";
import {
  Folder,
  CheckSquare,
  Calendar,
  Settings,
  Plus,
  X,
  ChevronDown
} from "lucide-react";
import { AppNativeSvgIcon } from "./AppNativeSvgIcon";
import { FeedbackIcon } from "../RegaarderProductIcons";
import RegaarderBrandIcon from "../RegaarderBrandIcon";

// Workspace Creation Applications (Documents & Canvases)
const WORKSPACE_APPS = [
  { id: "compose", label: "Docs", type: "compose" },
  { id: "notes", label: "Notes", type: "notes" },
  { id: "sheet", label: "Sheets", type: "sheet" },
  { id: "deck", label: "Deck", type: "deck" },
  { id: "whiteboard", label: "Whiteboard", type: "whiteboard" },
  { id: "room", label: "Room", type: "room" }
];

// Operational & Execution Tools
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
  const [selectedWorkspaceName] = useState("Team Space");

  return (
    <aside className="w-64 md:w-56 shrink-0 border-r border-zinc-200/80 dark:border-zinc-800/80 bg-[#f9fafb] dark:bg-[#151518] px-3 py-4 flex flex-col justify-between select-none h-full overflow-y-auto no-scrollbar transition-colors">
      <div className="space-y-4">
        {/* Mobile Header with Close button */}
        {onClose && (
          <div className="flex md:hidden items-center justify-between pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
            <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Navigation
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer border-none bg-transparent"
              title="Close menu"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Executive Workspace Row: Uncluttered Header + Full-Width Dropdown Card */}
        <div>
          <div className="flex items-center justify-between px-1 pb-1.5">
            <span className="text-[10.5px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Workspace
            </span>
            <button
              type="button"
              onClick={onNewProject}
              title="Create new project or doc"
              className="w-5 h-5 rounded-md hover:bg-zinc-200/70 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center justify-center transition-colors cursor-pointer border-none bg-transparent"
            >
              <Plus size={13} strokeWidth={2.4} />
            </button>
          </div>

          <button
            type="button"
            onClick={onNewProject}
            className="w-full h-8 px-2.5 rounded-lg bg-white dark:bg-[#1e1e22] border border-zinc-200/90 dark:border-zinc-700/80 hover:border-zinc-300 dark:hover:border-zinc-600 flex items-center justify-between text-left cursor-pointer transition-all shadow-2xs group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-4 h-4 rounded bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center shrink-0">
                <RegaarderBrandIcon size={10} />
              </div>
              <span className="text-[12.5px] font-medium text-zinc-800 dark:text-zinc-200 truncate">
                {selectedWorkspaceName}
              </span>
            </div>
            <ChevronDown size={13} className="text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 shrink-0 ml-1.5" />
          </button>
        </div>

        {/* Core Navigation Hub */}
        <div className="space-y-0.5 pt-1">
          {/* Home Item with Neutral Anchored Indicator */}
          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab("home")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors cursor-pointer border-none relative text-left ${
              activeTab === "home"
                ? "bg-zinc-200/80 dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
            }`}
          >
            {activeTab === "home" && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-zinc-900 dark:bg-white" />
            )}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              className={activeTab === "home" ? "fill-zinc-900 text-zinc-900 dark:fill-white dark:text-white" : "fill-none stroke-zinc-500 stroke-2"}
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" fill={activeTab === "home" ? "currentColor" : "none"} />
            </svg>
            <span className="truncate">Home</span>
          </button>

          {/* Projects Item */}
          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab("projects")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-colors cursor-pointer border-none relative text-left ${
              activeTab === "projects" || activeTab === "library"
                ? "bg-zinc-200/80 dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
            }`}
          >
            {(activeTab === "projects" || activeTab === "library") && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-zinc-900 dark:bg-white" />
            )}
            <div className="flex items-center gap-2.5 min-w-0">
              <Folder size={15} className={activeTab === "projects" || activeTab === "library" ? "text-zinc-950 dark:text-white" : "text-zinc-500"} />
              <span className="truncate">Projects</span>
            </div>
          </button>
        </div>

        {/* WORKSPACE APPS Section with Native Color Accents */}
        <div>
          <div className="px-2 pb-1.5 text-[10.5px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Workspace Apps
          </div>

          <div className="space-y-0.5">
            {WORKSPACE_APPS.map((app) => (
              <button
                key={app.id}
                type="button"
                onClick={() => onLaunch && onLaunch(app.id)}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer border-none group text-left"
              >
                <AppNativeSvgIcon type={app.type} size={16} />
                <span className="truncate">{app.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* OPERATE Section */}
        <div>
          <div className="px-2 pb-1.5 text-[10.5px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
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
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer border-none relative text-left ${
                activeTab === "tasks"
                  ? "bg-zinc-200/80 dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
              }`}
            >
              {activeTab === "tasks" && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-zinc-900 dark:bg-white" />
              )}
              <CheckSquare
                size={15}
                className={activeTab === "tasks" ? "text-zinc-950 dark:text-white" : "text-zinc-500"}
              />
              <span className="truncate">Tasks</span>
            </button>

            {/* Schedule */}
            <button
              type="button"
              onClick={() => {
                if (onOpenSchedule) onOpenSchedule();
                else if (onSelectTab) onSelectTab("schedule");
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer border-none relative text-left ${
                activeTab === "schedule"
                  ? "bg-zinc-200/80 dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
              }`}
            >
              {activeTab === "schedule" && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-zinc-900 dark:bg-white" />
              )}
              <Calendar
                size={15}
                className={activeTab === "schedule" ? "text-zinc-950 dark:text-white" : "text-zinc-500"}
              />
              <span className="truncate">Schedule</span>
            </button>

            {/* Relay */}
            <button
              type="button"
              onClick={() => onLaunch && onLaunch("relay")}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer border-none group text-left"
            >
              <AppNativeSvgIcon type="relay" size={16} />
              <span className="truncate">Relay</span>
            </button>

            {/* Browser */}
            <button
              type="button"
              onClick={() => onLaunch && onLaunch("browser")}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer border-none group text-left"
            >
              <AppNativeSvgIcon type="browser" size={16} />
              <span className="truncate">Browser</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Actions: Feedback & Settings */}
      <div className="pt-3 space-y-0.5 border-t border-zinc-200/80 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => {
            if (onOpenFeedback) {
              onOpenFeedback();
            } else if (onSelectTab) {
              onSelectTab("feedback");
            }
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer border-none text-left relative ${
            activeTab === "feedback"
              ? "bg-zinc-200/80 dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
          }`}
        >
          {activeTab === "feedback" && (
            <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-zinc-900 dark:bg-white" />
          )}
          <FeedbackIcon size={15} className={activeTab === "feedback" ? "text-zinc-950 dark:text-white" : "text-zinc-500"} />
          <span className="truncate">Feedback</span>
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer border-none text-left"
        >
          <Settings size={15} className="text-zinc-500" />
          <span className="truncate">Settings</span>
        </button>
      </div>
    </aside>
  );
}
