import React from "react";
import { ChevronRight } from "lucide-react";
import { AppNativeSvgIcon } from "./AppNativeSvgIcon";

const CREATE_ACTIONS = [
  {
    id: "compose",
    title: "Docs",
    subtitle: "Write & collaborate",
    type: "compose"
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

export default function WorkspaceQuickCreate({ onLaunch, onOpenAllTools }) {
  return (
    <section className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-zinc-850/60 border border-slate-200/60 dark:border-white/[0.06] shadow-2xs select-none">
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <h2 className="text-[13.5px] font-semibold text-slate-900 dark:text-zinc-100 leading-tight">
            Create new
          </h2>
          <p className="text-[11.5px] text-slate-400 dark:text-zinc-400 mt-0.5">
            Start a new document or open a tool.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenAllTools}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors cursor-pointer bg-transparent border-none p-1"
          title="View all tools"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {CREATE_ACTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onLaunch && onLaunch(item.id)}
            className="flex flex-col items-start p-4 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/60 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/15 hover:shadow-xs transition-all text-left cursor-pointer group"
          >
            <AppNativeSvgIcon type={item.type} size={26} className="mb-3" />
            <div className="font-semibold text-[13px] text-slate-900 dark:text-zinc-100 leading-tight mb-1">
              {item.title}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-zinc-400 truncate w-full">
              {item.subtitle}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
