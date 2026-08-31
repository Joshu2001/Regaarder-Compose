import { useTranslation } from './i18n';
import React, { useState } from "react";
import {
  ChevronDown,
  Search,
  Bell
} from "lucide-react";
import {
  ComposeIcon,
  DeckIcon,
  SheetIcon,
  RoomIcon,
  WhiteboardIcon,
  ScheduleIcon,
  MemoryIcon,
  TasksIcon
} from "./components/RegaarderProductIcons";

import RegaarderBrandIcon from "./components/RegaarderBrandIcon";
import LegalPolicyModal from "./components/LegalPolicyModal";

const products = [
  { 
    id: "compose",
    title: "Docs", 
    description: "Write and edit documents", 
    icon: ComposeIcon,
    theme: {
      badgeBg: "bg-blue-500/10 dark:bg-blue-500/20",
      badgeBorder: "border-blue-500/20 dark:border-blue-500/30",
      iconColor: "text-blue-600 dark:text-blue-400"
    }
  },
  { 
    id: "deck",
    title: "Deck", 
    description: "Create presentations", 
    icon: DeckIcon,
    theme: {
      badgeBg: "bg-amber-500/10 dark:bg-amber-500/20",
      badgeBorder: "border-amber-500/20 dark:border-amber-500/30",
      iconColor: "text-amber-600 dark:text-amber-400"
    }
  },
  { 
    id: "sheet",
    title: "Sheet", 
    description: "Manage spreadsheets", 
    icon: SheetIcon,
    theme: {
      badgeBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      badgeBorder: "border-emerald-500/20 dark:border-emerald-500/30",
      iconColor: "text-emerald-600 dark:text-emerald-400"
    }
  },
  { 
    id: "room",
    title: "Room", 
    description: "Host meetings", 
    icon: RoomIcon,
    theme: {
      badgeBg: "bg-violet-500/10 dark:bg-violet-500/20",
      badgeBorder: "border-violet-500/20 dark:border-violet-500/30",
      iconColor: "text-violet-600 dark:text-violet-400"
    }
  },
  { 
    id: "whiteboard",
    title: "Whiteboard", 
    description: "Brainstorm ideas", 
    icon: WhiteboardIcon,
    theme: {
      badgeBg: "bg-sky-500/10 dark:bg-sky-500/20",
      badgeBorder: "border-sky-500/20 dark:border-sky-500/30",
      iconColor: "text-sky-600 dark:text-sky-400"
    }
  },
  { 
    id: "schedule",
    title: "Schedule", 
    description: "Manage calendar", 
    icon: ScheduleIcon,
    theme: {
      badgeBg: "bg-rose-500/10 dark:bg-rose-500/20",
      badgeBorder: "border-rose-500/20 dark:border-rose-500/30",
      iconColor: "text-rose-600 dark:text-rose-400"
    }
  },
  { 
    id: "memory",
    title: "Memory", 
    description: "Access memories", 
    icon: MemoryIcon,
    theme: {
      badgeBg: "bg-indigo-500/10 dark:bg-indigo-500/20",
      badgeBorder: "border-indigo-500/20 dark:border-indigo-500/30",
      iconColor: "text-indigo-600 dark:text-indigo-400"
    }
  },
  { 
    id: "tasks",
    title: "Tasks", 
    description: "Track to-dos", 
    icon: TasksIcon,
    theme: {
      badgeBg: "bg-teal-500/10 dark:bg-teal-500/20",
      badgeBorder: "border-teal-500/20 dark:border-teal-500/30",
      iconColor: "text-teal-600 dark:text-teal-400"
    }
  },
];

export default function RegaarderComposeLanding({
  onLaunch,
  onOpenWorkspaceSwitcher,
  onSearchClick,
  onNotificationsClick,
  notifications = [],
  currentUser = null,
  onProfileClick,
  isDarkMode = false,
}) {
  const { t } = useTranslation();
  const [legalModalTab, setLegalModalTab] = useState(null);

  const hasUnread = notifications.some(n => n.unread);

  return (
    <div
      className="w-full h-full relative overflow-hidden flex flex-col bg-[#FAFAFA] dark:bg-[#111111]"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', Inter, sans-serif" }}
    >
      {/* Global Top Navigation Bar: Permeates and seamlessly blends into ambient canvas */}
      <header className="h-14 flex items-center justify-between px-6 bg-transparent shrink-0 select-none z-30 relative">

        {/* Left: Workspace Selector */}
        <button
          type="button"
          data-workspace-switcher="true"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            onOpenWorkspaceSwitcher?.(rect);
          }}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2.5 h-8 px-2.5 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all duration-150 cursor-pointer group"
          title="Switch Workspace"
        >
          <RegaarderBrandIcon size={22} className="group-hover:scale-105 transition-transform duration-200" />
          <span className="text-[13.5px] font-semibold text-slate-800 dark:text-zinc-100 tracking-[-0.01em]">
            Regaarder Workspace
          </span>
          <ChevronDown
            size={13}
            strokeWidth={2}
            className="text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-300 transition-colors"
          />
        </button>

        {/* Right: Global Controls */}
        <div className="flex items-center gap-1">

          {/* Search */}
          <button
            type="button"
            onClick={() => onSearchClick?.()}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-100 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all duration-150 cursor-pointer"
            title="Search Workspace"
          >
            <Search size={15} strokeWidth={1.6} />
          </button>

          {/* Notifications */}
          <button
            type="button"
            onClick={() => onNotificationsClick?.()}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-100 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all duration-150 cursor-pointer relative"
            title="Notifications"
          >
            <Bell size={15} strokeWidth={1.6} />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500 ring-2 ring-white dark:ring-[#111111] animate-pulse" />
            )}
          </button>

          {/* Profile Avatar */}
          <button
            type="button"
            onClick={() => onProfileClick?.()}
            className="w-7 h-7 rounded-full border-2 border-white dark:border-[#121214] flex items-center justify-center text-[11px] leading-none font-semibold text-white transition-all shadow-xs hover:ring-2 hover:ring-slate-300 dark:hover:ring-slate-700 focus:outline-none ml-1 cursor-pointer"
            style={{ backgroundColor: currentUser ? '#8b5cf6' : '#64748B' }}
            title={currentUser ? `Profile: ${currentUser?.name || ''}` : 'Sign In'}
          >
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
          </button>

        </div>
      </header>

      {/* Subtle Ambient Mesh Aura */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-35 dark:opacity-20">
        <div className="absolute -top-[15%] left-[20%] w-[50%] h-[50%] rounded-full bg-blue-300/30 dark:bg-blue-600/15 mix-blend-multiply filter blur-[120px] animate-blob" />
        <div className="absolute top-[20%] right-[15%] w-[45%] h-[45%] rounded-full bg-purple-300/30 dark:bg-purple-600/15 mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-[15%] left-[30%] w-[55%] h-[55%] rounded-full bg-pink-300/25 dark:bg-pink-600/15 mix-blend-multiply filter blur-[120px] animate-blob animation-delay-4000" />
      </div>

      {/* Hub Content Stage */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-6 overflow-y-auto thin-scrollbar relative z-10">
        <div className="w-full max-w-[700px] mx-auto flex flex-col items-center">

          {/* Executive Typography */}
          <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <h1 className="text-[32px] sm:text-[38px] font-bold tracking-[-0.03em] text-slate-900 dark:text-white leading-[1.15] mb-2">
              {t('landing.headline') || 'One workspace for all your office needs.'}
            </h1>
            <p className="text-[14px] sm:text-[14.5px] text-slate-600 dark:text-zinc-400 font-normal max-w-md mx-auto leading-relaxed">
              {t('landing.subheadline') || 'Choose a product to start creating.'}
            </p>
          </div>

          {/* Apple-Tier Product Suite Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 w-full">
            {products.map((product, idx) => {
              const IconComp = product.icon;
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => onLaunch?.({ type: 'action', name: product.id })}
                  style={{ animationDelay: `${idx * 25}ms` }}
                  className="flex flex-col items-center justify-center gap-3 bg-white/75 dark:bg-[#1c1c1e]/75 backdrop-blur-xl border border-slate-200/60 dark:border-white/[0.07] rounded-2xl py-5 px-4 shadow-[0_2px_8px_rgba(0,0,0,0.02),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)] hover:bg-white dark:hover:bg-[#252528] hover:border-slate-300 dark:hover:border-white/20 hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_12px_28px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 group cursor-pointer"
                >
                  {/* Tinted Apple Squircle Icon Container */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-200 group-hover:scale-105 ${product.theme.badgeBg} ${product.theme.badgeBorder} ${product.theme.iconColor}`}>
                    <IconComp size={22} strokeWidth={1.7} />
                  </div>
                  
                  {/* Clean Product Label */}
                  <span className="text-[13.5px] font-semibold tracking-[-0.01em] text-slate-800 dark:text-zinc-200 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
                    {t('landing.' + product.id) || product.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Minimalist Apple-Style Footer */}
          <div className="mt-12 flex items-center gap-5 text-[11.5px] text-slate-400 dark:text-zinc-500 select-none">
            <button
              type="button"
              onClick={() => setLegalModalTab("terms")}
              className="hover:text-slate-700 dark:hover:text-zinc-300 transition-colors cursor-pointer bg-transparent border-none p-0 text-[11.5px] font-normal"
            >
              {t('common.terms') || 'Terms of Service'}
            </button>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-700" />
            <button
              type="button"
              onClick={() => setLegalModalTab("privacy")}
              className="hover:text-slate-700 dark:hover:text-zinc-300 transition-colors cursor-pointer bg-transparent border-none p-0 text-[11.5px] font-normal"
            >
              {t('common.privacy') || 'Privacy Policy'}
            </button>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-700" />
            <button
              type="button"
              onClick={() => setLegalModalTab("legal")}
              className="hover:text-slate-700 dark:hover:text-zinc-300 transition-colors cursor-pointer bg-transparent border-none p-0 text-[11.5px] font-normal"
            >
              {t('common.legal') || 'Legal'}
            </button>
          </div>

        </div>
      </div>

      {/* Legal & Policy Dialog */}
      <LegalPolicyModal
        isOpen={Boolean(legalModalTab)}
        initialTab={legalModalTab || "terms"}
        onClose={() => setLegalModalTab(null)}
      />

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(25px, -35px) scale(1.05); }
          66% { transform: translate(-15px, 15px) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 18s infinite alternate ease-in-out;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}} />
    </div>
  );
}
