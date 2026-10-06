import React from "react";
import {
  LayoutDashboard,
  Inbox,
  ArrowLeftRight,
  BookOpen,
  Building2,
  BarChart3,
  Scale,
  Settings,
  ChevronDown,
  X
} from "lucide-react";
import RegaarderBrandIcon from "../RegaarderBrandIcon";

const SIDEBAR_ITEMS = [
  { id: 'inbox', label: 'Ledger Home', icon: Inbox },
  { id: 'scans', label: 'Scans', icon: ArrowLeftRight },
  { id: 'journal', label: 'Journal', icon: BookOpen },
  { id: 'reconciliation', label: 'Reconciliation', icon: Scale },
  { id: 'accounts', label: 'Accounts', icon: Building2 },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function LedgerHoverSidebar({
  isOpen = false,
  onClose = () => {},
  activeNav = 'inbox',
  onSelectNav = () => {},
  onBackToHome = () => {},
  onOpenWorkspaceSwitcher = null,
  isBalanced = true,
}) {
  return (
    <>
      {/* Backdrop overlay for hover/flyout on small/medium screens or when expanded */}
      <div
        className={`fixed inset-0 z-[280] bg-slate-900/10 dark:bg-black/40 backdrop-blur-[2px] transition-opacity duration-200 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Floating Hover Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-[290] w-64 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border-r border-slate-200/80 dark:border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.12)] flex flex-col justify-between transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Header Strip */}
          <div className="h-14 px-4 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onBackToHome}
                title="Return to Home Workspace"
                className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center cursor-pointer shadow-xs hover:opacity-90 transition-opacity"
              >
                <RegaarderBrandIcon size={18} className="text-white" />
              </button>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white leading-none">
                  Regaarder
                </span>
                <span className="text-[10px] text-violet-600 dark:text-violet-400 font-semibold tracking-wider uppercase mt-0.5">
                  Ledger
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Workspace switcher dropdown button */}
              {onOpenWorkspaceSwitcher && (
                <button
                  type="button"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    onOpenWorkspaceSwitcher(rect);
                  }}
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 bg-slate-50 dark:bg-zinc-800 px-2 py-1 rounded-md border border-slate-200/60 dark:border-zinc-700/60 cursor-pointer"
                  title="Switch Workspace"
                >
                  <span>Workspace</span>
                  <ChevronDown size={11} />
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                title="Close sidebar"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = (activeNav === item.id) || (activeNav === 'inbox_review' && item.id === 'inbox');

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectNav(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-violet-50/90 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 font-semibold border border-violet-200/60 dark:border-violet-800/40 shadow-2xs"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100/70 dark:hover:bg-zinc-800/60"
                  }`}
                >
                  <Icon
                    size={16}
                    strokeWidth={1.8}
                    className={isActive ? "text-violet-600 dark:text-violet-400" : "text-slate-400 dark:text-zinc-500"}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Invariant Status Box */}
        <div className="p-3 border-t border-slate-100 dark:border-zinc-800">
          <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/60 flex items-center gap-2.5">
            <span className={`w-2 h-2 rounded-full shrink-0 ${isBalanced ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
            <div className="min-w-0 flex-1">
              <p className="text-[10.5px] font-bold text-slate-800 dark:text-zinc-200 truncate">
                R(Gx) Invariant Guard
              </p>
              <p className="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-mono">
                {isBalanced ? "Double-entry balanced (Δ = $0.00)" : "Entries out of balance"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
