import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { AppNativeSvgIcon } from "./AppNativeSvgIcon";
import { ImportPortalIcon } from "../RegaarderProductIcons";

const PRIMARY_CREATE_ACTIONS = [
  {
    id: "compose",
    title: "Docs",
    subtitle: "Write & collaborate",
    type: "compose"
  },
  {
    id: "notes",
    title: "Notes",
    subtitle: "Capture & think freely",
    type: "notes"
  },
  {
    id: "sheet",
    title: "Sheets",
    subtitle: "Analyze & visualize",
    type: "sheet"
  },
  {
    id: "deck",
    title: "Deck",
    subtitle: "Present your ideas",
    type: "deck"
  },
  {
    id: "whiteboard",
    title: "Whiteboard",
    subtitle: "Brainstorm & plan",
    type: "whiteboard"
  },
  {
    id: "room",
    title: "Room",
    subtitle: "Meet & discuss",
    type: "room"
  }
];

const SECONDARY_WORKSPACE_TOOLS = [
  {
    id: "relay",
    title: "Relay",
    subtitle: "Connect tools & context",
    type: "relay"
  },
  {
    id: "browser",
    title: "Browser",
    subtitle: "Workspace web research",
    type: "browser"
  },
  {
    id: "omni-portal",
    title: "Import",
    subtitle: "Bring in external files",
    type: "import"
  }
];

export default function WorkspaceQuickCreate({ onLaunch }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasDiscovered, setHasDiscovered] = useState(() => {
    try {
      return localStorage.getItem("rc.discoveredMoreTools") === "true";
    } catch {
      return false;
    }
  });

  const markDiscovered = () => {
    if (!hasDiscovered) {
      setHasDiscovered(true);
      try {
        localStorage.setItem("rc.discoveredMoreTools", "true");
      } catch {}
    }
  };

  const handleToggle = () => {
    markDiscovered();
    setIsExpanded(!isExpanded);
  };

  return (
    <section className="p-5 rounded-xl bg-[#F8FAFC] dark:bg-zinc-850/60 border border-slate-200/80 dark:border-white/[0.08] shadow-2xs select-none transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <h2 className="text-[13.5px] font-semibold text-slate-900 dark:text-zinc-100 leading-tight">
            Create new
          </h2>
          <p className="text-[11.5px] text-slate-400 dark:text-zinc-400 mt-0.5">
            Start a new document or open a tool.
          </p>
        </div>

        {/* Refined Ghost Action for More tools with progressive disclosure */}
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={handleToggle}
            onMouseEnter={markDiscovered}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11.5px] font-medium text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-750 border border-slate-200/80 dark:border-white/10 rounded-md shadow-2xs transition-all cursor-pointer group"
            title={isExpanded ? "Show fewer tools" : "Show more tools"}
          >
            <span className="text-[11.5px] font-medium">
              {isExpanded ? "Fewer tools" : "More tools"}
            </span>
            <div className={!hasDiscovered ? "animate-discovery-nudge" : ""}>
              <ChevronRight
                size={13}
                className={`transition-transform duration-200 ${
                  isExpanded ? "rotate-90 text-slate-700 dark:text-zinc-200" : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-zinc-200"
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Primary Create New Items */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
        {PRIMARY_CREATE_ACTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            data-onboarding-target={item.id === "compose" ? "quick-create-compose" : `quick-create-${item.id}`}
            onClick={() => onLaunch && onLaunch(item.id)}
            className="flex flex-col items-start p-3 sm:p-4 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 hover:shadow-xs transition-all text-left cursor-pointer group"
          >
            <AppNativeSvgIcon type={item.type} size={24} className="mb-2 sm:mb-3" />
            <div className="font-semibold text-[12.5px] sm:text-[13px] text-slate-900 dark:text-zinc-100 leading-tight mb-1 truncate w-full">
              {item.title}
            </div>
            <div className="text-[10.5px] sm:text-[11px] text-slate-400 dark:text-zinc-400 truncate w-full">
              {item.subtitle}
            </div>
          </button>
        ))}
      </div>

      {/* Progressively Disclosed "More tools" section */}
      {isExpanded && (
        <div className="pt-4 mt-4 border-t border-slate-200/50 dark:border-white/[0.06] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2.5 px-0.5">
            More tools
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
            {SECONDARY_WORKSPACE_TOOLS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onLaunch && onLaunch(item.id)}
                className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 hover:shadow-xs transition-all text-left cursor-pointer group"
              >
                {item.type === "import" ? (
                  <div className="w-8 h-8 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <ImportPortalIcon size={18} strokeWidth={1.8} />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-md bg-slate-50 dark:bg-zinc-700/50 flex items-center justify-center shrink-0">
                    <AppNativeSvgIcon type={item.type} size={20} />
                  </div>
                )}
                <div className="truncate">
                  <div className="font-semibold text-[12.5px] text-slate-900 dark:text-zinc-100 leading-tight mb-0.5">
                    {item.title}
                  </div>
                  <div className="text-[10.5px] text-slate-400 dark:text-zinc-400 truncate">
                    {item.subtitle}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
