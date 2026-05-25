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
} from "lucide-react";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Compose", key: "compose", active: true },
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
    <div className="w-full h-screen bg-[#fafafa] flex overflow-hidden text-[#161616]">
      
      {/* Sidebar */}
      <aside className="w-[108px] bg-white border-r border-[#ededf3] flex flex-col items-center py-8">
        
        {/* Logo */}
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-500 flex items-center justify-center text-white font-semibold text-lg shadow-md">
          R
        </div>

        {/* Nav */}
        <div className="mt-10 flex flex-col gap-4">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <button
                key={index}
                type="button"
                onClick={() => onLaunch?.(item.key)}
                className={`w-[76px] h-[76px] rounded-2xl flex flex-col items-center justify-center transition-all duration-200 ${
                  item.active
                    ? "bg-violet-50 text-violet-600"
                    : "hover:bg-[#f5f5f8] text-[#707080]"
                }`}
              >
                <Icon size={21} strokeWidth={1.9} />
                <span className="text-[13px] mt-2 font-medium">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* User */}
        <div className="mt-auto">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d8d8e5] to-[#bfbfd0]" />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col">
        
        {/* Topbar */}
        <header className="h-[88px] px-10 border-b border-[#efeff3] flex items-center justify-between bg-white">
          
          <div className="flex items-center gap-4">
            <button className="text-[34px] font-light text-[#b5b5c2] leading-none">
              +
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[32px] font-semibold tracking-tight">
                  Untitled composition
                </h1>

                <ChevronDown
                  size={18}
                  className="text-[#8f8f9d]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5">
            
            {/* Avatars */}
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-11 h-11 rounded-full border-2 border-white bg-gradient-to-br from-[#d7d7e4] to-[#bcbccd]"
                />
              ))}

              <div className="w-11 h-11 rounded-full border-2 border-white bg-[#f5f5fa] flex items-center justify-center text-sm text-[#707080] font-medium">
                +2
              </div>
            </div>

            <button className="h-12 px-7 rounded-2xl bg-gradient-to-r from-violet-600 to-violet-500 text-white font-medium shadow-lg shadow-violet-200 flex items-center gap-2">
              <Users size={17} />
              Share
            </button>

            <button className="w-11 h-11 rounded-2xl hover:bg-[#f5f5f8] flex items-center justify-center">
              <Bell size={19} className="text-[#7f7f8f]" />
            </button>

            <button className="w-11 h-11 rounded-2xl bg-violet-50 flex items-center justify-center">
              <Sparkles
                size={18}
                className="text-violet-600"
              />
            </button>

            <button
              type="button"
              onClick={onExit}
              className="w-11 h-11 rounded-2xl border border-[#ececf3] hover:bg-[#f5f5f8] flex items-center justify-center"
              aria-label="Exit to Compose"
              title="Exit to Compose"
            >
              <X size={18} className="text-[#7f7f8f]" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto px-10 py-14">
          
          {/* Hero */}
          <div className="max-w-[980px] mx-auto text-center">
            
            <h2 className="text-[56px] leading-[1.1] tracking-tight font-semibold text-[#17172a]">
              Good morning, Arjun
              <span className="text-violet-500 ml-1">✦</span>
            </h2>

            <p className="mt-5 text-[24px] text-[#7c7c8f] font-light">
              What would you like to create today?
            </p>

            {/* Main AI Box */}
            <div className="mt-14 bg-white border border-[#ededf3] rounded-[36px] shadow-[0_20px_60px_rgba(0,0,0,0.04)] p-12 text-left">
              
              <h3 className="text-[42px] font-medium tracking-tight text-[#4a4a5d]">
                What are you trying to create?
              </h3>

              <p className="mt-3 text-[22px] text-[#9494a4]">
                Notes, presentations, schedules, reports,
                research...
              </p>

              {/* Attachments */}
              <div className="mt-10 flex flex-wrap gap-4">
                {attachments.map((item, index) => (
                  <div
                    key={index}
                    className="h-[76px] px-5 rounded-2xl border border-[#ececf3] bg-[#fcfcfd] flex items-center gap-4"
                  >
                    <AttachmentIcon type={item.icon} />

                    <div>
                      <p className="text-[15px] font-medium text-[#252538]">
                        {item.title}
                      </p>

                      <p className="text-[13px] text-[#8d8d9d]">
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
                <button type="button" className="h-[76px] px-7 rounded-2xl border border-dashed border-[#d9d9e6] text-[#707080] hover:bg-[#fafafd] flex items-center gap-3">
                  <Plus size={18} />
                  Add more
                </button>
              </div>

              {/* Bottom Row */}
              <div className="mt-14 flex items-end justify-between">
                
                {/* Mode */}
                <button type="button" className="h-[54px] px-6 rounded-2xl bg-violet-50 text-violet-600 font-medium flex items-center gap-3 hover:bg-violet-100 transition-colors">
                  <Sparkles size={17} />
                  Auto (Compose decides)
                  <ChevronDown size={16} />
                </button>

                {/* Controls */}
                <div className="flex items-center gap-4">
                  
                  <button type="button" className="w-14 h-14 rounded-2xl border border-[#ececf2] hover:bg-[#f8f8fc] flex items-center justify-center">
                    <Paperclip
                      size={20}
                      className="text-[#6f6f80]"
                    />
                  </button>

                  <button type="button" className="w-14 h-14 rounded-2xl border border-[#ececf2] hover:bg-[#f8f8fc] flex items-center justify-center">
                    <Mic
                      size={20}
                      className="text-[#6f6f80]"
                    />
                  </button>

                  <button type="button" className="w-14 h-14 rounded-2xl bg-gradient-to-r from-violet-600 to-violet-500 text-white flex items-center justify-center shadow-lg shadow-violet-200">
                    <ArrowUpRight size={21} />
                  </button>
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div className="mt-14">
              
              <p className="text-[18px] text-[#8c8c9b] mb-6">
                Try something
              </p>

              <div className="flex items-center justify-center gap-4 flex-wrap">
                {suggestions.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <button
                      type="button"
                      onClick={() => onLaunch?.('more')}
                      key={index}
                      className="h-[60px] px-7 rounded-2xl border border-[#ececf3] bg-white hover:bg-[#fafafd] flex items-center gap-3 text-[#2a2a3d] font-medium transition-all"
                    >
                      <Icon
                        size={18}
                        className="text-[#707080]"
                      />

                      {item.text}
                    </button>
                  );
                })}

                <button type="button" onClick={() => onLaunch?.('more')} className="w-[60px] h-[60px] rounded-2xl border border-[#ececf3] bg-white hover:bg-[#fafafd] flex items-center justify-center">
                  <RefreshCcw
                    size={18}
                    className="text-[#707080]"
                  />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 flex items-center justify-center gap-2 text-[15px] text-[#9a9aac]">
              <span>🔒</span>
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
