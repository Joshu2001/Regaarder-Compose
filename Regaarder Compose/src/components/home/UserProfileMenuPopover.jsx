import React from 'react';
import { User, LogOut, Settings, CloudCheck, ExternalLink, RefreshCw } from 'lucide-react';

/**
 * Premium Apple-style User Profile Popover
 * Anchored to the user avatar in the top-right workspace navigation.
 * Displays user identity, cloud sync status, and account actions (Sign Out, Switch Account).
 */
export default function UserProfileMenuPopover({
  isOpen,
  onClose,
  currentUser,
  onSignOut,
  onOpenSettings,
  onSwitchAccount,
  menuRef,
}) {
  if (!isOpen || !currentUser) return null;

  const initials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : currentUser?.email
    ? currentUser.email.slice(0, 2).toUpperCase()
    : 'U';

  return (
    <div
      ref={menuRef}
      className="fixed right-6 top-[60px] z-[99999] w-[260px] rounded-2xl bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.06)] p-3 flex flex-col gap-2 font-sans select-none animate-in fade-in zoom-in-95 duration-150"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Header: User Profile Details */}
      <div className="flex items-center gap-3 p-1.5 border-b border-slate-100 dark:border-white/[0.06] pb-3">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-white font-semibold text-xs flex items-center justify-center shadow-xs overflow-hidden border border-black/5 dark:border-white/10">
            {currentUser?.photoURL || currentUser?.avatar ? (
              <img
                src={currentUser.photoURL || currentUser.avatar}
                alt={currentUser.name || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          {/* Cloud Sync Status Indicator */}
          <span
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#1c1c1e]"
            title="Connected to Supabase PostgreSQL"
          />
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[13px] font-semibold text-slate-900 dark:text-zinc-100 truncate leading-snug">
            {currentUser.name || currentUser.displayName || 'Workspace Member'}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-zinc-400 truncate leading-tight">
            {currentUser.email || 'No email attached'}
          </span>
          <div className="flex items-center gap-1 mt-1">
            <span className="inline-flex items-center gap-1 text-[9.5px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-800/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Cloud Synced
            </span>
          </div>
        </div>
      </div>

      {/* Menu Actions */}
      <div className="flex flex-col gap-0.5 py-1">
        <button
          type="button"
          onClick={() => {
            onClose?.();
            onOpenSettings?.();
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-[12px] font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-100/80 dark:hover:bg-zinc-800/80 transition-colors text-left cursor-pointer border-none bg-transparent"
        >
          <Settings size={14} className="text-slate-400 dark:text-zinc-400" />
          <span>Account Settings</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onClose?.();
            onSwitchAccount?.();
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-[12px] font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-100/80 dark:hover:bg-zinc-800/80 transition-colors text-left cursor-pointer border-none bg-transparent"
        >
          <RefreshCw size={14} className="text-slate-400 dark:text-zinc-400" />
          <span>Switch Account</span>
        </button>
      </div>

      <div className="border-t border-slate-100 dark:border-white/[0.06] pt-1">
        <button
          type="button"
          onClick={() => {
            onClose?.();
            onSignOut?.();
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-[12px] font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-950/30 transition-colors text-left cursor-pointer border-none bg-transparent"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
