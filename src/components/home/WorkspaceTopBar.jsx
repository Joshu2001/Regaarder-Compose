import React from "react";
import { Search, Bell, Layout, Menu, User } from "lucide-react";
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
  onToggleRightPanel,
  onToggleMobileMenu
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

  const isElectron = typeof window !== 'undefined' && Boolean(window.electronAPI?.isElectron || window.navigator?.userAgent?.includes('Electron'));

  return (
    <header
      style={{
        WebkitAppRegion: 'drag',
        paddingRight: isElectron ? '146px' : undefined
      }}
      className="h-[52px] px-3 sm:px-6 border-b border-slate-200/70 dark:border-white/[0.06] bg-white/80 dark:bg-zinc-900/90 backdrop-blur-md flex items-center justify-between shrink-0 select-none z-30 transition-colors"
    >
      {/* Left Column: Brand Identity & Workspace Switcher */}
      <div className="flex items-center gap-2.5 min-w-[200px]" style={{ WebkitAppRegion: 'no-drag' }}>
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer border-none bg-transparent"
            title="Open navigation menu"
            aria-label="Open navigation menu"
          >
            <Menu size={18} />
          </button>
        )}
        <button
          type="button"
          onClick={onOpenWorkspaceSwitcher}
          className="flex items-center gap-2 cursor-pointer bg-transparent border-none p-1 -m-1 rounded-md hover:bg-slate-100/70 dark:hover:bg-zinc-800/70 transition-colors outline-none group text-left"
        >
          <div className="w-5 h-5 flex items-center justify-center shrink-0">
            <RegaarderBrandIcon className="w-4.5 h-4.5 text-slate-900 dark:text-white group-hover:scale-105 transition-transform" />
          </div>
          <span className="font-semibold text-[13px] tracking-tight text-slate-800 dark:text-zinc-100">
            {activeWorkspaceName}
          </span>
        </button>
      </div>

      {/* Center Column: Perfectly Centered Spotlight-Grade Search */}
      <div className="flex-1 max-w-[520px] mx-auto px-4 min-w-0" style={{ WebkitAppRegion: 'no-drag' }}>
        <button
          type="button"
          onClick={onSearchClick}
          className="w-full h-8 flex items-center pl-3 pr-3 rounded-lg bg-slate-100/70 dark:bg-zinc-800/60 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/60 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/15 text-slate-400 dark:text-zinc-400 transition-all text-xs cursor-pointer shadow-[inset_0_1px_1px_rgba(0,0,0,0.02)] group"
        >
          <div className="flex items-center gap-2.5 min-w-0 truncate">
            <Search size={14} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-zinc-300 transition-colors shrink-0" />
            <span className="truncate text-slate-500 dark:text-zinc-400 text-[12px] font-normal">
              Search your workspace...
            </span>
          </div>
        </button>
      </div>

      {/* Right Column: Harmonized Executive-Tier Tool Cluster */}
      <div className="flex items-center justify-end gap-1.5 min-w-[200px]" style={{ WebkitAppRegion: 'no-drag' }}>
        {/* Subtle, restrained Pricing entry */}
        <a
          href="/pricing"
          className="hidden sm:inline-flex items-center h-7 px-2.5 rounded-md text-[11.5px] font-medium text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/70 dark:border-zinc-800 transition-colors"
        >
          Pricing
        </a>

        {/* Notifications Button */}
        <button
          type="button"
          onClick={onNotificationsClick}
          className="relative w-7 h-7 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer bg-transparent border-none"
          title="Notifications"
        >
          <Bell size={15} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-violet-600" />
          )}
        </button>

        {/* Layout Side Panel Toggle */}
        <button
          type="button"
          onClick={onToggleRightPanel}
          className={`hidden sm:flex w-7 h-7 items-center justify-center rounded-md transition-colors cursor-pointer border-none ${
            isRightPanelOpen
              ? "text-slate-800 bg-slate-200/80 dark:text-zinc-100 dark:bg-zinc-800"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 bg-transparent"
          }`}
          title={isRightPanelOpen ? "Hide side panel" : "Show side panel"}
        >
          <Layout size={15} />
        </button>

        {/* Separator Line */}
        <div className="h-4 w-[1px] bg-slate-200 dark:bg-zinc-800 mx-1 hidden sm:block" />

        {/* User / Sign-in Control */}
        <div className="relative">
          {currentUser ? (
            <button
              type="button"
              onClick={onProfileClick}
              className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium text-[11px] shadow-2xs cursor-pointer border border-black/[0.08] dark:border-white/[0.12] hover:opacity-90 transition-all overflow-hidden"
              title={`Profile: ${currentUser.name || currentUser.displayName || currentUser.email || 'User'}`}
            >
              {currentUser?.photoURL || currentUser?.avatar ? (
                <img
                  src={currentUser.photoURL || currentUser.avatar}
                  alt={currentUser.name || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onProfileClick}
              className="flex items-center gap-1.5 h-7 px-2.5 rounded-md text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 font-medium text-[11.5px] border border-slate-200/90 dark:border-zinc-700/80 transition-all cursor-pointer shadow-2xs"
              title="Sign in to your workspace"
            >
              <User size={13} className="text-slate-500 dark:text-zinc-400" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
