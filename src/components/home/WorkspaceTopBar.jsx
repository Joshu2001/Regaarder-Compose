import React from "react";
import { Search, Bell, Layout, Menu, User } from "lucide-react";
import RegaarderBrandIcon from "../RegaarderBrandIcon";
import WindowControls from "../desktop/WindowControls";

export default function WorkspaceTopBar({
  currentUser,
  onSearchClick,
  onNotificationsClick,
  notifications = [],
  onProfileClick,
  onOpenWorkspaceSwitcher,
  activeWorkspaceName = "Regaarder Workspace",
  isRightPanelOpen = true,
  onToggleRightPanel,
  onToggleMobileMenu
}) {
  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n) => !n.read).length
    : 0;

  const rawName = currentUser?.displayName || currentUser?.name || currentUser?.full_name || '';
  const initials = rawName
    ? rawName
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : currentUser?.email
    ? currentUser.email.slice(0, 2).toUpperCase()
    : "U";

  return (
    <header
      data-window-drag
      className="h-[50px] pl-3 pr-0 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#151518] flex items-center justify-between shrink-0 select-none z-30 transition-colors"
    >
      {/* Left Column: Authoritative Regaarder Brand Identity */}
      <div className="flex items-center gap-2.5 min-w-[200px]" style={{ WebkitAppRegion: 'no-drag' }}>
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 -ml-1 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer border-none bg-transparent"
            title="Open navigation menu"
            aria-label="Open navigation menu"
          >
            <Menu size={18} />
          </button>
        )}
        <div className="flex items-center gap-2 select-none">
          <div className="w-5 h-5 flex items-center justify-center shrink-0">
            <RegaarderBrandIcon className="w-4.5 h-4.5 text-zinc-900 dark:text-white" />
          </div>
          <span className="font-bold text-[13.5px] tracking-tight text-zinc-900 dark:text-white">
            Regaarder Workspace
          </span>
        </div>
      </div>

      {/* Center Column: Perfectly Centered Spotlight-Grade Search */}
      <div className="flex-1 max-w-[480px] mx-auto px-4 min-w-0" style={{ WebkitAppRegion: 'no-drag' }}>
        <button
          type="button"
          onClick={onSearchClick}
          className="w-full h-8 flex items-center pl-3 pr-3 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700/60 hover:border-zinc-300 dark:hover:border-zinc-600 text-zinc-400 dark:text-zinc-400 transition-all text-xs cursor-pointer shadow-none group"
        >
          <div className="flex items-center gap-2 min-w-0 truncate">
            <Search size={14} className="text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-colors shrink-0" />
            <span className="truncate text-zinc-500 dark:text-zinc-400 text-[12.5px] font-normal">
              Search your workspace...
            </span>
          </div>
        </button>
      </div>

      {/* Right Column: Harmonized Tool Cluster with Relaxed Breathing Room */}
      <div className="flex items-center justify-end gap-2.5 min-w-[200px]" style={{ WebkitAppRegion: 'no-drag' }}>
        {/* Restrained Executive Upgrade Button */}
        <a
          href="/pricing"
          className="hidden sm:inline-flex items-center h-7 px-3 rounded-md text-[11.5px] font-semibold text-zinc-900 dark:text-white bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200/90 dark:border-zinc-700/80 transition-all cursor-pointer shadow-2xs active:scale-[0.99]"
        >
          Upgrade
        </a>

        {/* Notifications Button with Crisp Micro Badge */}
        <button
          type="button"
          onClick={onNotificationsClick}
          className="relative w-8 h-8 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer bg-transparent border-none"
          title="Notifications"
        >
          <Bell size={15} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Layout Side Panel Toggle */}
        <button
          type="button"
          onClick={onToggleRightPanel}
          className={`hidden sm:flex w-8 h-8 items-center justify-center rounded-md transition-colors cursor-pointer border-none ${
            isRightPanelOpen
              ? "text-zinc-900 bg-zinc-200/80 dark:text-zinc-100 dark:bg-zinc-800"
              : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 bg-transparent"
          }`}
          title={isRightPanelOpen ? "Hide side panel" : "Show side panel"}
        >
          <Layout size={15} />
        </button>

        {/* Separator Line */}
        <div className="h-4.5 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-0.5 hidden sm:block" />

        {/* User Profile Avatar with Strict Sizing and Clipping */}
        <div className="relative shrink-0 flex items-center justify-center">
          {currentUser ? (
            <button
              type="button"
              onClick={onProfileClick}
              className="w-7 h-7 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium text-[11px] shadow-2xs cursor-pointer border border-black/[0.08] dark:border-white/[0.12] hover:opacity-90 transition-all overflow-hidden flex items-center justify-center shrink-0 p-0"
              title={`Profile: ${currentUser.name || currentUser.displayName || currentUser.email || 'User'}`}
            >
              {currentUser?.photoURL || currentUser?.avatar ? (
                <img
                  src={currentUser.photoURL || currentUser.avatar}
                  alt={currentUser.name || "User"}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                initials
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onProfileClick}
              className="flex items-center gap-1.5 h-7 px-2.5 rounded-md text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 font-medium text-[11.5px] border border-zinc-200/90 dark:border-zinc-700/80 transition-all cursor-pointer shadow-2xs"
              title="Sign in to your workspace"
            >
              <User size={13} className="text-zinc-500 dark:text-zinc-400" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>

      <WindowControls />
    </header>
  );
}
