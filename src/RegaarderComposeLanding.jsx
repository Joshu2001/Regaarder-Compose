import React, { useState } from "react";
import WorkspaceTopBar from "./components/home/WorkspaceTopBar";
import WorkspaceLeftRail from "./components/home/WorkspaceLeftRail";
import WorkspaceQuickCreate from "./components/home/WorkspaceQuickCreate";
import WorkspaceRecentFiles from "./components/home/WorkspaceRecentFiles";
import WorkspaceRightPanel from "./components/home/WorkspaceRightPanel";
import TasksWorkspace from "./components/tasks/TasksWorkspace";
import IntentSchedulerInspector from "./components/schedule/IntentSchedulerInspector";

export default function RegaarderComposeLanding({
  onLaunch,
  onOpenWorkspaceSwitcher,
  onSearchClick,
  onNotificationsClick,
  notifications = [],
  currentUser = null,
  onProfileClick,
  onOpenRecentModal,
  onOpenHelp,
  onOpenFeedback,
  onOpenShortcuts,
  onOpenSettings
}) {
  const [activeRailTab, setActiveRailTab] = useState("home"); // 'home' | 'tasks' | 'schedule' | 'library' | 'recent'
  // Default: RIGHT SIDEBAR HIDDEN (matches Image 3 for maximum calmness & focus)
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

  // Dynamic user greeting based on actual authenticated user
  const userGreetingName = currentUser?.displayName
    ? currentUser.displayName.trim().split(" ")[0]
    : currentUser?.email
    ? currentUser.email.split("@")[0]
    : "";

  return (
    <div className="flex flex-col h-screen w-full bg-[#FAFBFD] dark:bg-[#121214] text-slate-900 dark:text-zinc-100 overflow-hidden font-sans">
      {/* 1. Top Bar */}
      <WorkspaceTopBar
        currentUser={currentUser}
        onSearchClick={onSearchClick}
        onNotificationsClick={onNotificationsClick}
        notifications={notifications}
        onProfileClick={onProfileClick}
        onOpenWorkspaceSwitcher={onOpenWorkspaceSwitcher}
        activeWorkspaceName="Regaarder Workspace"
        isRightPanelOpen={isRightPanelOpen}
        onToggleRightPanel={() => setIsRightPanelOpen((prev) => !prev)}
      />

      {/* 2. Workspace Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Rail */}
        <WorkspaceLeftRail
          activeTab={activeRailTab}
          onSelectTab={setActiveRailTab}
          onLaunch={onLaunch}
          onOpenTasks={() => setActiveRailTab("tasks")}
          onOpenSchedule={() => setActiveRailTab("schedule")}
          onOpenSettings={onOpenSettings || onProfileClick}
        />

        {/* Center Stage: Dynamic View based on Active Destination */}
        {activeRailTab === "tasks" ? (
          <TasksWorkspace
            onBackToHome={() => setActiveRailTab("home")}
            onOpenSchedule={() => setActiveRailTab("schedule")}
          />
        ) : activeRailTab === "schedule" ? (
          <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#151518] overflow-hidden">
            <IntentSchedulerInspector onClose={() => setActiveRailTab("home")} />
          </div>
        ) : (
          /* Default Home / Recent View */
          <main className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar bg-white dark:bg-[#151518] transition-all">
            <div className="max-w-[940px] mx-auto space-y-7">
              {/* Header Greeting */}
              <div>
                <h1 className="text-[22px] font-bold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2 leading-snug">
                  <span>
                    Good morning{userGreetingName ? `, ${userGreetingName}` : ""}
                  </span>
                  <span className="inline-block" role="img" aria-label="waving hand">
                    &#x1F44B;
                  </span>
                </h1>
                <p className="text-[13px] text-slate-400 dark:text-zinc-400 mt-1">
                  Here’s what’s happening in your workspace.
                </p>
              </div>

              {/* Create new section */}
              <WorkspaceQuickCreate
                onLaunch={onLaunch}
                onOpenAllTools={onOpenWorkspaceSwitcher}
              />

              {/* Recent work */}
              <WorkspaceRecentFiles onLaunch={onLaunch} />
            </div>
          </main>
        )}



        {/* Right Panel: Clean slide-in on reveal without permanently consuming space */}
        {isRightPanelOpen && (
          <div className="h-full z-20 animate-in slide-in-from-right-8 duration-200 ease-out shrink-0">
            <WorkspaceRightPanel
              onLaunch={onLaunch}
              onSearchClick={onSearchClick}
              onOpenHelp={onOpenHelp}
              onOpenLibrary={() => setActiveRailTab("library")}
              onOpenSchedule={() => setActiveRailTab("schedule")}
              onClose={() => setIsRightPanelOpen(false)}
            />
          </div>
        )}
      </div>

      {/* Clean thin Apple-style scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.25);
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.45);
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
