import React from "react";
import { Search, Bell, Layout } from "lucide-react";
import RegaarderBrandIcon from "../RegaarderBrandIcon";

export default function WorkspaceTopBar({
  currentUser,
  onSearchClick,
  onNotificationsClick,
  notifications = [],
  onProfileClick,
  onOpenWorkspaceSwitcher,
  activeWorkspaceName = "Regaarder Workspace",
  isRightPanelOpen = true,
  onToggleRightPanel
}) {
  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n) => !n.read).length
    : 0;

  const initials = currentUser?.displayName
    ? currentUser.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : currentUser?.email
    ? currentUser.email.slice(0, 2).toUpperCase()
    : "U";

  return (
    <header className="h-[54px] px-6 border-b border-slate-100 dark:border-white/[0.06] bg-[#F9FAFB] dark:bg-zinc-900 flex items-center justify-between shrink-0 select-none z-30">
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={onOpenWorkspaceSwitcher}
          className="flex items-center gap-2 cursor-pointer bg-transparent border-none p-0 outline-none hover:opacity-80 transition-opacity"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <RegaarderBrandIcon className="w-5 h-5 text-slate-900 dark:text-white" />
          </div>
          <span className="font-semibold text-[13.5px] tracking-tight text-slate-900 dark:text-zinc-100">
            {activeWorkspaceName}
          </span>
        </button>
      </div>

      {/* Center: Clean Search bar with premium succinct label */}
      <div className="flex-1 max-w-[460px] mx-8">
        <button
          type="button"
          onClick={onSearchClick}
          className="w-full flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-white/[0.08] text-slate-400 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-white/20 transition-all text-xs cursor-pointer shadow-2xs group"
        >
          <Search size={14} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-zinc-300 transition-colors shrink-0" />
          <span className="truncate text-slate-400 text-[12.5px] font-normal">Search your workspace</span>
        </button>
      </div>

      {/* Right: Notifications, Layout Panel Toggle, Avatar */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onNotificationsClick}
          className="relative p-1 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-100 transition-colors cursor-pointer bg-transparent border-none"
          title="Notifications"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-violet-600" />
          )}
        </button>

        {/* Layout button: toggles right sidebar */}
        <button
          type="button"
          onClick={onToggleRightPanel}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer border-none ${
            isRightPanelOpen
              ? "text-slate-800 bg-slate-200/60 dark:text-zinc-100 dark:bg-zinc-800"
              : "text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 bg-transparent"
          }`}
          title={isRightPanelOpen ? "Hide side panel" : "Show side panel"}
        >
          <Layout size={16} />
        </button>

        <button
          type="button"
          onClick={onProfileClick}
          className="flex items-center justify-center w-7 h-7 rounded-full bg-[#8B5CF6] text-white font-medium text-[11px] shadow-2xs cursor-pointer border-none hover:opacity-90 transition-opacity"
        >
          {initials}
        </button>
      </div>
    </header>
  );
}
