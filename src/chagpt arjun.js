import React from "react";
import {
  FileText,
  Mic,
  ArrowUpRight,
  Sparkles,
  Presentation,
  Clock3,
  Users,
  RefreshCcw,
  Plus,
  Database,
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Video,
  Users2,
  MoreHorizontal,
  X,
  ChevronDown,
  Bell,
  Paperclip,
  PenTool,
  Lock,
} from "lucide-react";

const sidebarItems = [
  { icon: PenTool, label: "Compose", key: "compose", active: true },
  { icon: Sparkles, label: "Deck", key: "deck" },
  { icon: Database, label: "Sheets", key: "sheets" },
  { icon: CalendarDays, label: "Schedule", key: "calendar" },
  { icon: CheckSquare, label: "Tasks", key: "tasks" },
  { icon: Video, label: "Room", key: "room" },
  { icon: Users2, label: "People", key: "people" },
  { icon: Database, label: "Memory", key: "memory" },
  { icon: MoreHorizontal, label: "More", key: "more" },
];

const attachments = [
  {
    icon: "pdf",
    title: "Investor_Report.pdf",
    subtitle: "2.4 MB",
  },
  {
    icon: "sheet",
    title: "Revenue.csv",
    subtitle: "18 KB",
  },
  {
    icon: "audio",
    title: "Meeting Recording",
    subtitle: "12:45",
  },
];

const suggestions = [
  {
    icon: Presentation,
    text: "Create investor deck",
  },
  {
    icon: FileText,
    text: "Summarize this document",
  },
  {
    icon: Clock3,
    text: "Build a timeline",
  },
  {
    icon: Users,
    text: "Generate meeting notes",
  },
];

function AttachmentIcon({ type }) {
  if (type === "pdf") {
    return (
      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
        <FileText size={16} className="text-red-500" />
      </div>
    );
  }

  if (type === "sheet") {
    return (
      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
        <Database size={16} className="text-green-600" />
      </div>
    );
  }

  return (
    <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
      <Mic size={16} className="text-violet-500" />
    </div>
  );
}

export default function RegaarderComposeLanding({ onExit, onLaunch }) {
  return (
    <div className="w-full h-screen bg-white flex overflow-hidden text-gray-800" style={{ fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
      
      {/* Sidebar */}
      <aside className="w-[92px] bg-[#FAFAFC] border-r border-gray-200 flex flex-col items-center py-5">
        
        {/* Logo */}
        <div className="mt-1 w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-500 flex items-center justify-center text-white font-semibold text-base shadow-md shadow-violet-200/50">
          R
        </div>

        {/* Nav */}
        <div className="mt-7 flex flex-col gap-2.5">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <button
                key={index}
                type="button"
                onClick={() => onLaunch?.(item.key)}
                className={`w-[64px] h-[64px] rounded-2xl flex flex-col items-center justify-center transition-all duration-200 ${
                  item.active
                    ? "bg-violet-100 text-violet-700 shadow-[0_10px_24px_-14px_rgba(124,58,237,0.45)]"
                    : "hover:bg-white text-slate-600"
                }`}
              >
                <Icon size={16} strokeWidth={2} />
                <span className="text-[10px] mt-1.5 font-medium leading-none">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* User */}
        <div className="mt-auto">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-400" />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col">
        
        {/* Topbar */}
        <header className="h-16 px-6 md:px-8 border-b border-gray-200 flex items-center justify-between bg-white">
          
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[14px] md:text-[15px] font-semibold tracking-tight text-slate-900">
                  Untitled composition
                </h1>

                <ChevronDown
                  size={16}
                  className="text-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-5">
            
            {/* Avatars */}
            <div className="flex -space-x-2.5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border-2 border-white bg-gradient-to-br from-slate-200 to-slate-300"
                />
              ))}

              <div className="w-9 h-9 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[11px] text-slate-500 font-medium">
                +2
              </div>
            </div>

            <button type="button" className="h-11 px-6 rounded-2xl bg-gradient-to-r from-violet-600 to-violet-500 text-white text-sm font-semibold shadow-lg shadow-violet-200/40 flex items-center gap-2">
              <Users size={16} />
              Share
            </button>

            <button type="button" className="w-10 h-10 rounded-2xl hover:bg-slate-50 flex items-center justify-center">
              <Bell size={17} className="text-slate-500" />
            </button>

            <button type="button" className="w-10 h-10 rounded-2xl bg-violet-50 flex items-center justify-center">
              <Sparkles
                size={16}
                className="text-violet-600"
              />
            </button>

          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-hidden px-5 py-2 md:px-8 md:py-3">
          
          {/* Hero */}
          <div className="max-w-[980px] mx-auto text-center h-full flex flex-col justify-center -translate-y-1">
            
            <h2 className="text-[22px] sm:text-[26px] md:text-[30px] leading-[1.05] tracking-tight font-semibold text-slate-950">
              Good morning, Arjun
              <span className="text-violet-500 ml-1">✦</span>
            </h2>

            <p className="mt-1.5 text-[12px] sm:text-[13px] text-slate-500 font-normal">
              What would you like to create today?
            </p>

            {/* Main AI Box */}
            <div className="mt-5 md:mt-6 bg-white border border-gray-200 rounded-[28px] shadow-[0_20px_60px_rgba(15,23,42,0.05)] p-5 md:p-6 text-left max-w-[940px] mx-auto">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-[16px] md:text-[17px] font-medium tracking-tight text-slate-400">
                  What are you trying to create?
                </h3>
                <button
                  type="button"
                  onClick={() => onLaunch?.('assistant')}
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-violet-500 hover:text-violet-600"
                >
                  <Mic size={13} />
                  <span>Speak instead</span>
                </button>
              </div>

              <p className="mt-1.5 text-[11px] md:text-[12px] text-slate-400">
                Notes, presentations, schedules, reports,
                research...
              </p>

              {/* Attachments */}
              <div className="mt-4 flex flex-wrap gap-2.5">
                {attachments.map((item, index) => (
                  <div
                    key={index}
                    className="h-[52px] px-4 rounded-2xl border border-gray-200 bg-white flex items-center gap-3"
                  >
                    <AttachmentIcon type={item.icon} />

                    <div>
                      <p className="text-[11px] font-medium text-slate-800">
                        {item.title}
                      </p>

                      <p className="text-[9px] text-slate-500">
                        {item.subtitle}
                      </p>
                    </div>

                    <button type="button" aria-label={`Remove ${item.title}`}>
                      <X
                        size={16}
                        className="text-[#a5a5b3]"
                      />
                    </button>
                  </div>
                ))}

                {/* Add More */}
                <button type="button" className="h-[52px] px-4 rounded-2xl border border-dashed border-gray-300 text-slate-500 hover:bg-slate-50 flex items-center gap-2">
                  <Plus size={15} />
                  Add more
                </button>
              </div>

              {/* Bottom Row */}
              <div className="mt-4 flex items-end justify-between gap-4 flex-col md:flex-row">
                
                {/* Mode */}
                <button type="button" className="h-9 px-4 rounded-2xl bg-violet-50 text-violet-700 text-[11px] font-medium flex items-center gap-2.5 hover:bg-violet-100 transition-colors">
                  <Sparkles size={13} />
                  Auto (Compose decides)
                  <ChevronDown size={12} />
                </button>

                {/* Controls */}
                <div className="flex items-center gap-3 md:gap-4">
                  
                  <button type="button" className="w-9 h-9 rounded-2xl border border-gray-200 hover:bg-slate-50 flex items-center justify-center">
                    <Paperclip
                      size={15}
                      className="text-slate-500"
                    />
                  </button>

                  <button type="button" className="w-9 h-9 rounded-2xl border border-gray-200 hover:bg-slate-50 flex items-center justify-center">
                    <Mic
                      size={15}
                      className="text-slate-500"
                    />
                  </button>

                  <button type="button" className="w-9 h-9 rounded-2xl bg-gradient-to-r from-violet-600 to-violet-500 text-white flex items-center justify-center shadow-lg shadow-violet-200/40">
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div className="mt-5 md:mt-6">
              
              <p className="text-[11px] md:text-[12px] text-slate-500 mb-2.5">
                Try something
              </p>

              <div className="flex items-center justify-center gap-2.5 flex-wrap">
                {suggestions.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <button
                      type="button"
                      onClick={() => onLaunch?.('more')}
                      key={index}
                      className="h-9 px-4 md:px-5 rounded-2xl border border-gray-200 bg-white hover:bg-slate-50 flex items-center gap-2 text-slate-700 text-[11px] md:text-[12px] font-medium transition-all"
                    >
                      <Icon
                        size={14}
                        className="text-slate-500"
                      />

                      {item.text}
                    </button>
                  );
                })}

                <button type="button" onClick={() => onLaunch?.('more')} className="w-9 h-9 rounded-2xl border border-gray-200 bg-white hover:bg-slate-50 flex items-center justify-center">
                  <RefreshCcw
                    size={14}
                    className="text-slate-500"
                  />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-center gap-2 text-[10px] md:text-[11px] text-slate-500">
              <Lock size={12} className="text-slate-400" />
              Compose uses your content to generate results.
              <button type="button" className="text-violet-500 hover:underline">
                Learn more
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
