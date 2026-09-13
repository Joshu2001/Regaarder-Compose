import React from "react";
import {
  Clock,
  ChevronRight,
  Calendar,
  Folder,
  Search,
  HelpCircle,
  Link,
  X
} from "lucide-react";
import { AppNativeSvgIcon } from "./AppNativeSvgIcon";
import { RegaarderAiIcon } from "../RegaarderProductIcons";

export default function WorkspaceRightPanel({
  onLaunch,
  onSearchClick,
  onOpenHelp,
  onOpenLibrary,
  onOpenSchedule,
  onClose
}) {
  return (
    <aside className="w-[300px] shrink-0 p-5 space-y-4 select-none overflow-y-auto no-scrollbar border-l border-slate-200/50 dark:border-white/[0.06] bg-[#FAFBFD] dark:bg-zinc-900/40">
      {/* Header with Close affordance */}
      <div className="flex items-center justify-between pb-1">
        <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
          Workspace Panel
        </span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-200/50 dark:hover:bg-zinc-800 transition-colors cursor-pointer border-none bg-transparent"
            title="Hide panel"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* 1. Continue where you left off Card */}
      <div className="bg-white dark:bg-zinc-850/80 rounded-2xl p-4 border border-slate-200/50 dark:border-white/[0.06] shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200">
          <Clock size={15} className="text-slate-500" />
          <span className="text-[12.5px] font-semibold">Continue where you left off</span>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-zinc-500 -mt-1">
          Quick access to your active work.
        </p>

        <button
          type="button"
          onClick={() => onLaunch && onLaunch("compose")}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-100 dark:border-white/[0.04] hover:bg-slate-100/80 dark:hover:bg-zinc-800/70 transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2.5 truncate">
            <AppNativeSvgIcon type="compose" size={24} />
            <div className="truncate">
              <div className="text-[12px] font-medium text-slate-800 dark:text-zinc-200 truncate group-hover:text-violet-600 transition-colors">
                Untitled Document
              </div>
              <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                Editing · 2 min ago
              </div>
            </div>
          </div>
          <ChevronRight size={13} className="text-slate-400 shrink-0" />
        </button>
      </div>

      {/* 2. Upcoming Card */}
      <div className="bg-white dark:bg-zinc-850/80 rounded-2xl p-4 border border-slate-200/50 dark:border-white/[0.06] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200">
            <Calendar size={15} className="text-slate-500" />
            <span className="text-[12.5px] font-semibold">Upcoming</span>
          </div>
          <button
            type="button"
            onClick={onOpenSchedule}
            className="text-[11px] font-medium text-violet-600 dark:text-violet-400 hover:underline cursor-pointer bg-transparent border-none p-0"
          >
            View all
          </button>
        </div>

        <div className="space-y-3 pt-1 text-xs">
          {/* Sep 15 */}
          <div
            onClick={onOpenSchedule}
            className="flex items-start gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-11 text-[11px] font-medium text-slate-400 dark:text-zinc-500 pt-0.5 shrink-0">
              Sep 15
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                <span className="font-medium text-[12px] text-slate-800 dark:text-zinc-200">
                  Team meeting
                </span>
              </div>
              <div className="text-[11px] text-slate-400 pl-3">
                10:00 - 11:00 AM
              </div>
            </div>
          </div>

          {/* Sep 16 */}
          <div
            onClick={onOpenSchedule}
            className="flex items-start gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-11 text-[11px] font-medium text-slate-400 dark:text-zinc-500 pt-0.5 shrink-0">
              Sep 16
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-medium text-[12px] text-slate-800 dark:text-zinc-200">
                  Project review
                </span>
              </div>
              <div className="text-[11px] text-slate-400 pl-3">
                2:00 - 3:00 PM
              </div>
            </div>
          </div>

          {/* Sep 17 */}
          <div
            onClick={onOpenSchedule}
            className="flex items-start gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-11 text-[11px] font-medium text-slate-400 dark:text-zinc-500 pt-0.5 shrink-0">
              Sep 17
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span className="font-medium text-[12px] text-slate-800 dark:text-zinc-200">
                  Client presentation
                </span>
              </div>
              <div className="text-[11px] text-slate-400 pl-3">
                11:00 - 12:00 PM
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Quick links Card */}
      <div className="bg-white dark:bg-zinc-850/80 rounded-2xl p-4 border border-slate-200/50 dark:border-white/[0.06] shadow-2xs space-y-2.5">
        <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200">
          <Link size={14} className="text-slate-500" />
          <span className="text-[12.5px] font-semibold">Quick links</span>
        </div>

        <div className="space-y-0.5">
          <button
            type="button"
            onClick={onOpenLibrary}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[12px] text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors text-left cursor-pointer bg-transparent border-none"
          >
            <Folder size={14} className="text-slate-400" />
            <span>Open Library</span>
          </button>

          <button
            type="button"
            onClick={onSearchClick}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[12px] text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors text-left cursor-pointer bg-transparent border-none"
          >
            <Search size={14} className="text-slate-400" />
            <span>Search</span>
          </button>

          <button
            type="button"
            onClick={onOpenHelp}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[12px] text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors text-left cursor-pointer bg-transparent border-none"
          >
            <HelpCircle size={14} className="text-slate-400" />
            <span>Help & Support</span>
          </button>
        </div>
      </div>

      {/* 4. Ambient Regaarder Connected Card */}
      <div
        onClick={() => onLaunch && onLaunch("orb")}
        className="p-4 rounded-2xl bg-[#F6F4FE] dark:bg-violet-950/20 border border-violet-100/80 dark:border-violet-900/20 relative group cursor-pointer shadow-2xs hover:bg-[#F3EFFF] transition-colors"
      >
        <div className="flex items-center justify-between mb-2">
          <RegaarderAiIcon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          <ChevronRight size={14} className="text-violet-400 group-hover:translate-x-0.5 transition-transform" />
        </div>
        <div className="font-semibold text-[12px] text-slate-900 dark:text-zinc-100 mb-1">
          Your workspace, connected.
        </div>
        <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
          Docs, Sheets, Decks, Whiteboards, and more — all in one place.
        </p>
      </div>
    </aside>
  );
}
