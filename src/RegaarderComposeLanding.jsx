import { useTranslation } from './i18n';
import React, { useState } from "react";
import {
  ChevronDown,
  Search,
  Bell,
  HelpCircle,
  MessageSquare,
  Command,
  LogIn,
  User,
  Check,
  Sparkles
} from "lucide-react";
import {
  ComposeIcon,
  DeckIcon,
  SheetIcon,
  RoomIcon,
  WhiteboardIcon,
  ImportPortalIcon,
  MemoryIcon,
  RelayIcon
} from "./components/RegaarderProductIcons";

import RegaarderBrandIcon from "./components/RegaarderBrandIcon";
import LegalPolicyModal from "./components/LegalPolicyModal";
import LandingRecentWorkStrip, { isMeaningfulWork } from "./components/LandingRecentWorkStrip";
import WorkspaceEcosystemVisualizer from "./components/ecosystem/WorkspaceEcosystemVisualizer";

const DEFAULT_PRODUCTS = [
  { id: "compose", title: "Docs", icon: ComposeIcon },
  { id: "deck", title: "Deck", icon: DeckIcon },
  { id: "sheet", title: "Sheet", icon: SheetIcon },
  { id: "room", title: "Room", icon: RoomIcon },
  { id: "relay", title: "Relay", icon: RelayIcon },
  { id: "whiteboard", title: "Whiteboard", icon: WhiteboardIcon },
  { id: "omni-portal", title: "Import", icon: ImportPortalIcon },
  { id: "memory", title: "Memory", icon: MemoryIcon },
];

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
  isDarkMode = false,
  onOpenStagingPr,
}) {
  const { t } = useTranslation();
  const [legalModalTab, setLegalModalTab] = useState(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState('Idea');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Dynamic MRU (Most Recently Used) Product Ordering
  const [sortedProducts, setSortedProducts] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const lastApp = localStorage.getItem('rc.lastOpenedApp') || 'compose';
        const mruHistoryRaw = localStorage.getItem('rc.mruAppsHistory');
        const mruList = mruHistoryRaw ? JSON.parse(mruHistoryRaw) : [lastApp];
        
        // Sort DEFAULT_PRODUCTS by index in mruList (most recent first)
        const sorted = [...DEFAULT_PRODUCTS].sort((a, b) => {
          const idxA = mruList.indexOf(a.id);
          const idxB = mruList.indexOf(b.id);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return 0;
        });
        return sorted;
      }
    } catch {}
    return DEFAULT_PRODUCTS;
  });
  const [hasRecentWork, setHasRecentWork] = useState(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("rc.savedDoc.")) {
            try {
              const raw = localStorage.getItem(key);
              if (raw) {
                const parsed = JSON.parse(raw);
                if (isMeaningfulWork(parsed)) return true;
              }
            } catch {}
          }
        }
      }
    } catch {}
    return false;
  });

  const hasUnread = notifications.some(n => n.unread);

  return (
    <div
      className="w-full h-full relative overflow-hidden flex flex-col bg-[#fafbfc] dark:bg-[#0c0d0e]"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', Inter, sans-serif" }}
    >
      {/* ── Subconscious Atmospheric Glow (Substantially toned down by ~65%, neutral canvas) ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-16 dark:opacity-10">
        <div className="absolute -top-[15%] -left-[10%] w-[65%] h-[65%] rounded-full bg-sky-200/30 mix-blend-multiply filter blur-[140px] animate-blob" />
        <div className="absolute top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-200/25 mix-blend-multiply filter blur-[140px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-violet-200/20 mix-blend-multiply filter blur-[140px] animate-blob animation-delay-4000" />
      </div>

      {/* ── Global Navigation Bar ── */}
      <header className="h-14 flex items-center justify-between px-6 sm:px-8 bg-transparent shrink-0 select-none z-30 relative">

        {/* Left: Workspace Selector with Silhouette Mark */}
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
          className="flex items-center gap-2.5 h-8 px-2.5 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all duration-150 cursor-pointer group outline-none focus:outline-none"
          title="Switch Workspace"
        >
          <RegaarderBrandIcon size={18} className="text-slate-900 dark:text-white group-hover:opacity-75 transition-opacity" />
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
        <div className="flex items-center gap-1.5 relative">

          {/* Search */}
          <button
            type="button"
            onClick={() => onSearchClick?.()}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-100 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all duration-150 cursor-pointer outline-none focus:outline-none"
            title="Search Workspace (⌘K)"
          >
            <Search size={15} strokeWidth={1.6} />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowProfileMenu(false);
                if (onNotificationsClick) {
                  onNotificationsClick();
                } else {
                  setShowNotificationsMenu(prev => !prev);
                }
              }}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-100 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all duration-150 cursor-pointer relative outline-none focus:outline-none"
              title="Notifications"
            >
              <Bell size={15} strokeWidth={1.6} />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-slate-900 dark:bg-white ring-2 ring-white dark:ring-[#111111]" />
              )}
            </button>

            {/* Local Notifications Popover if not using parent modal */}
            {showNotificationsMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotificationsMenu(false)}
                />
                <div
                  className="absolute right-0 top-10 z-50 w-80 max-h-[380px] bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xl p-3 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-150 font-sans"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-slate-100 dark:border-zinc-800">
                    <span className="text-xs font-semibold text-slate-800 dark:text-zinc-100">Notifications</span>
                    {hasUnread && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 font-medium">
                        New
                      </span>
                    )}
                  </div>
                  <div className="overflow-y-auto max-h-[280px] thin-scrollbar space-y-1 py-1">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 dark:text-zinc-500 text-xs flex flex-col items-center gap-1.5">
                        <Bell size={18} strokeWidth={1.5} className="opacity-40" />
                        <span>You're all caught up</span>
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          className={`p-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                            item.unread
                              ? 'bg-violet-50/70 dark:bg-violet-950/20 text-slate-800 dark:text-zinc-200 hover:bg-violet-100/70'
                              : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                          }`}
                        >
                          <div className="font-medium text-[11.5px] mb-0.5">{item.title}</div>
                          {item.detail && <div className="text-[10.5px] text-slate-500 dark:text-zinc-400 line-clamp-2">{item.detail}</div>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User / Sign-in Control */}
          {currentUser ? (
            <div className="relative ml-1">
              <button
                type="button"
                onClick={() => {
                  setShowNotificationsMenu(false);
                  if (onProfileClick) {
                    onProfileClick();
                  } else {
                    setShowProfileMenu(prev => !prev);
                  }
                }}
                className="w-7 h-7 rounded-full border border-black/[0.08] dark:border-white/[0.12] flex items-center justify-center text-[11px] leading-none font-semibold text-white transition-all hover:opacity-85 focus:outline-none cursor-pointer bg-slate-500"
                title={`Profile: ${currentUser?.name || ''}`}
              >
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div
                    className="absolute right-0 top-10 z-50 w-60 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 shadow-xl p-3.5 space-y-3 animate-in fade-in zoom-in-95 duration-150 font-sans"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-zinc-800">
                      <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold">
                        {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-slate-800 dark:text-zinc-100 truncate">{currentUser?.name || 'User'}</span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">{currentUser?.email || ''}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 text-[11px] text-slate-600 dark:text-zinc-300">
                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-400">Account status</span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">Active</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        try {
                          localStorage.removeItem('rc.token');
                          localStorage.removeItem('rc.user');
                        } catch {}
                        setShowProfileMenu(false);
                        window.location.reload();
                      }}
                      className="w-full py-1.5 px-3 rounded-lg text-xs font-medium text-rose-600 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors cursor-pointer text-center"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="relative ml-1 flex items-center">
              <button
                type="button"
                onClick={() => {
                  if (onProfileClick) {
                    onProfileClick();
                  } else {
                    setShowProfileMenu(prev => !prev);
                  }
                }}
                className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-medium hover:bg-black dark:hover:bg-zinc-100 transition-all duration-150 cursor-pointer shadow-xs active:scale-95"
                title="Sign In or Create Account"
              >
                <LogIn size={12} strokeWidth={2} />
                <span>Sign in</span>
              </button>

              {/* Guest / Sign-in options dropdown */}
              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div
                    className="absolute right-0 top-10 z-50 w-64 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 shadow-xl p-4 text-center space-y-3 animate-in fade-in zoom-in-95 duration-150 font-sans"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center justify-center mx-auto text-sm font-semibold">
                      <User size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-zinc-100">Welcome to Regaarder</div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-snug">
                        Sign in to sync your work, collaborate, and access premium AI tools.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        onProfileClick?.();
                      }}
                      className="w-full py-1.5 px-3 rounded-lg text-xs font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-black transition-colors cursor-pointer shadow-xs"
                    >
                      Sign In / Sign Up
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </header>

      {/* ── Main Content Stage ── */}
      <div className="flex-1 flex flex-col items-center justify-start px-4 sm:px-8 pt-2 sm:pt-3 pb-8 sm:pb-12 overflow-y-auto thin-scrollbar relative z-10">
        <div className="w-full max-w-[1240px] mx-auto flex flex-col items-center">

          {/*
            ── Hero Section ──
            Pure Apple typography & authoritative monochrome Regaarder brand glyph.
            Matches reference image:
            - Regaarder brand mark comfortably positioned beneath header
            - "Every tool your team needs," (Line 1)
            - "connected as one." with subtle purple/blue gradient (Line 2)
            - Centered, dark navy typography
            - Subtitle directly beneath
          */}
          <div className="text-center mb-1 sm:mb-2 animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col items-center">
            
            {/* Minimal Regaarder Hero Mark */}
            <div className="mb-2 flex items-center justify-center">
              <div className="w-9 h-9 rounded-xl bg-white/90 dark:bg-[#18181b]/90 border border-slate-200/50 dark:border-white/[0.08] shadow-[0_1px_3px_rgba(15,23,42,0.03)] dark:shadow-none flex items-center justify-center group hover:border-violet-200/80 dark:hover:border-violet-500/30 transition-all duration-200">
                <RegaarderBrandIcon size={19} className="text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-200" />
              </div>
            </div>

            <h1 className="text-[28px] sm:text-[34px] md:text-[38px] font-bold tracking-tight text-slate-900 dark:text-white leading-[1.18] mb-1.5 text-balance max-w-2xl mx-auto">
              <span>Every tool your team needs,</span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 dark:from-purple-400 dark:via-indigo-300 dark:to-blue-400 bg-clip-text text-transparent">
                connected as one.
              </span>
            </h1>
            <p className="text-[13.5px] sm:text-[14px] text-slate-500 dark:text-zinc-400 font-normal max-w-lg mx-auto leading-relaxed">
              {t('landing.subheadline') || 'Docs, sheets, decks, and AI intelligence — completely private.'}
            </p>
          </div>

          {/*
            ── Connected Radial Ecosystem Visualization ──
            Replaces static 2×4 grid with a spatial, connected radial ecosystem matching the reference design.
          */}
          <WorkspaceEcosystemVisualizer onLaunch={onLaunch} />

          {/* ── Progressive Disclosure Recent Work Strip (cleanly positioned beneath ecosystem) ── */}
          <div className="w-full max-w-[860px] mx-auto mt-2 sm:mt-4">
            <LandingRecentWorkStrip
              onLaunch={onLaunch}
              onOpenRecentModal={onOpenRecentModal}
              onRecentCountChange={(count) => setHasRecentWork(count > 0)}
            />
          </div>

          {/* ── Subtle Workspace Utility Layer ── */}
          <div className={`${hasRecentWork ? "mt-6" : "mt-8 sm:mt-9"} flex items-center justify-center gap-5 sm:gap-6 text-[12px] text-slate-400 dark:text-zinc-500 select-none transition-all duration-200`}>
            <button
              type="button"
              onClick={() => onOpenHelp ? onOpenHelp() : onLaunch?.({ type: 'action', name: 'help' })}
              className="flex items-center gap-1.5 hover:text-slate-700 dark:hover:text-zinc-300 transition-colors cursor-pointer bg-transparent border-none p-0 font-normal outline-none focus:outline-none group"
            >
              <HelpCircle size={13} strokeWidth={1.6} className="opacity-70 group-hover:opacity-100 transition-opacity" />
              <span>{t('common.help') || 'Help'}</span>
            </button>

            <span className="w-1 h-1 rounded-full bg-slate-300/60 dark:bg-zinc-700/60" />

            <button
              type="button"
              onClick={() => onOpenFeedback ? onOpenFeedback() : setShowFeedbackModal(true)}
              className="flex items-center gap-1.5 hover:text-slate-700 dark:hover:text-zinc-300 transition-colors cursor-pointer bg-transparent border-none p-0 font-normal outline-none focus:outline-none group"
            >
              <MessageSquare size={13} strokeWidth={1.6} className="opacity-70 group-hover:opacity-100 transition-opacity" />
              <span>{t('common.feedback') || 'Feedback'}</span>
            </button>

            <span className="w-1 h-1 rounded-full bg-slate-300/60 dark:bg-zinc-700/60" />

            <button
              type="button"
              onClick={() => onOpenShortcuts ? onOpenShortcuts() : setShowShortcuts(true)}
              className="flex items-center gap-1.5 hover:text-slate-700 dark:hover:text-zinc-300 transition-colors cursor-pointer bg-transparent border-none p-0 font-normal outline-none focus:outline-none group"
            >
              <Command size={13} strokeWidth={1.6} className="opacity-70 group-hover:opacity-100 transition-opacity" />
              <span>{t('common.keyboardShortcuts') || 'Keyboard Shortcuts'}</span>
            </button>
          </div>

          {/* ── Footer with Terms of Service, Privacy Policy & Legal ── */}
          <div className="mt-8 sm:mt-9 flex items-center gap-5 sm:gap-6 text-[11px] sm:text-[11.5px] text-slate-400/70 dark:text-zinc-600 select-none">
            <button
              type="button"
              onClick={() => setLegalModalTab("terms")}
              className="hover:text-slate-600 dark:hover:text-zinc-400 transition-colors cursor-pointer bg-transparent border-none p-0 font-normal outline-none focus:outline-none"
            >
              {t('common.terms') || 'Terms of Service'}
            </button>
            <span className="w-1 h-1 rounded-full bg-slate-300/50 dark:bg-zinc-800" />
            <button
              type="button"
              onClick={() => setLegalModalTab("privacy")}
              className="hover:text-slate-600 dark:hover:text-zinc-400 transition-colors cursor-pointer bg-transparent border-none p-0 font-normal outline-none focus:outline-none"
            >
              {t('common.privacy') || 'Privacy Policy'}
            </button>
            <span className="w-1 h-1 rounded-full bg-slate-300/50 dark:bg-zinc-800" />
            <button
              type="button"
              onClick={() => setLegalModalTab("legal")}
              className="hover:text-slate-600 dark:hover:text-zinc-400 transition-colors cursor-pointer bg-transparent border-none p-0 font-normal outline-none focus:outline-none"
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

      {/* Keyboard Shortcuts Dialog */}
      {showShortcuts && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 dark:bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowShortcuts(false)}
        >
          <div 
            className="bg-white dark:bg-[#18181b] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl shadow-xl w-full max-w-sm p-5 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-800 dark:text-zinc-100">
                <Command size={14} className="text-slate-500" />
                <span>Keyboard Shortcuts</span>
              </div>
              <button
                type="button"
                onClick={() => setShowShortcuts(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 text-xs p-1 cursor-pointer bg-transparent border-none outline-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-zinc-300">
              <div className="flex items-center justify-between">
                <span>Search Workspace</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 font-mono text-[11px] text-slate-700 dark:text-zinc-300 border border-slate-200/60 dark:border-white/10">⌘K</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>New Document</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 font-mono text-[11px] text-slate-700 dark:text-zinc-300 border border-slate-200/60 dark:border-white/10">⌘N</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Slash Commands & AI</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 font-mono text-[11px] text-slate-700 dark:text-zinc-300 border border-slate-200/60 dark:border-white/10">/</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Switch Workspace</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 font-mono text-[11px] text-slate-700 dark:text-zinc-300 border border-slate-200/60 dark:border-white/10">⌘O</kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Apple-Style Feedback & Suggestions Dialog ── */}
      {showFeedbackModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 dark:bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowFeedbackModal(false)}
        >
          <div
            className="bg-white dark:bg-[#18181b] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl shadow-xl w-full max-w-md p-5 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[13.5px] font-semibold text-slate-800 dark:text-zinc-100">
                <MessageSquare size={15} className="text-violet-500" />
                <span>Feedback & Suggestions</span>
              </div>
              <button
                type="button"
                onClick={() => setShowFeedbackModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 text-xs p-1 cursor-pointer bg-transparent border-none outline-none"
              >
                ✕
              </button>
            </div>

            {feedbackSubmitted ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-base">
                  ✓
                </div>
                <div className="text-[13px] font-semibold text-slate-800 dark:text-zinc-100">Thank you for your feedback!</div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mx-auto">Your input helps shape the future of Regaarder.</p>
                <button
                  type="button"
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setFeedbackSubmitted(false);
                    setFeedbackText('');
                  }}
                  className="mt-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white dark:bg-white dark:text-slate-900 cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5">
                  {['Idea', 'Bug', 'Experience'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFeedbackCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                        feedbackCategory === cat
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent'
                          : 'bg-slate-50 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 border-slate-200/60 dark:border-white/5 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Tell us what you love or what we can improve..."
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-violet-400 resize-none font-sans leading-relaxed"
                />

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!feedbackText.trim()}
                    onClick={() => {
                      if (!feedbackText.trim()) return;
                      setFeedbackSubmitted(true);
                    }}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
                  >
                    Submit Feedback
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Ambient Mesh Blob Keyframe Animations ── */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(25px, -35px) scale(1.05); }
          66% { transform: translate(-15px, 15px) scale(0.96); }
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
