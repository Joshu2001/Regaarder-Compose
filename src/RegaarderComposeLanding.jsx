import React from "react";
import {
  Search,
  BookOpen,
  PieChart,
  FolderOpen,
  Briefcase,
  PenTool,
  Palette,
  Code,
  Users,
  TrendingUp,
  Settings,
  MoreHorizontal,
  Sparkles
} from "lucide-react";

const actionCards = [
  {
    title: "Web Reading",
    description: "AI-powered web reading, summarize articles, and extract key information.",
    icon: BookOpen,
    color: "bg-blue-50 text-blue-600 border-blue-100",
  },
  {
    title: "Deep Research",
    description: "Write high-quality reports, essays, and articles with verifiable citations.",
    icon: Search,
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  {
    title: "Data Mining",
    description: "Extract insights from unstructured data, visualize trends, and make decisions.",
    icon: PieChart,
    color: "bg-orange-50 text-orange-600 border-orange-100",
  },
  {
    title: "File Management",
    description: "Organize, classify, and search through your documents automatically.",
    icon: FolderOpen,
    color: "bg-violet-50 text-violet-600 border-violet-100",
  },
];

const roleCards = [
  { title: "Founder", icon: Briefcase },
  { title: "Product", icon: PenTool },
  { title: "Designer", icon: Palette },
  { title: "Engineer", icon: Code },
  { title: "Consultant", icon: Users },
  { title: "Marketing/Sales", icon: TrendingUp },
  { title: "Operations", icon: Settings },
  { title: "Other", icon: MoreHorizontal },
];

export default function RegaarderComposeLanding({ onLaunch }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-white via-indigo-50/30 to-violet-50/50 p-8 overflow-y-auto thin-scrollbar relative" style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
      <div className="w-full max-w-[900px] mx-auto flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100/50 border border-violet-200/50 text-violet-700 text-xs font-semibold mb-6">
            <Sparkles size={14} />
            <span>AI Workspace</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
            Work with <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">Regaarder Compose</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            Let our AI agents handle your office tasks.
          </p>
        </div>

        {/* 4 Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-14">
          {actionCards.map((card, idx) => (
            <button
              key={idx}
              onClick={() => onLaunch?.({ type: 'action', name: card.title })}
              className="text-left group bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-violet-500/10 hover:border-violet-300/50 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${card.color} transition-transform group-hover:scale-110 duration-300`}>
                <card.icon size={22} strokeWidth={2.5} />
              </div>
              <h3 className="text-[17px] font-semibold text-slate-900 mb-1.5">{card.title}</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed">{card.description}</p>
            </button>
          ))}
        </div>

        {/* Roles Section */}
        <div className="w-full text-center">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 tracking-tight">Which role fits you best?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
            {roleCards.map((role, idx) => (
              <button
                key={idx}
                onClick={() => onLaunch?.({ type: 'role', name: role.title })}
                className="flex flex-col items-center justify-center gap-3 bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl p-5 hover:bg-white hover:border-violet-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className="text-slate-400 group-hover:text-violet-600 transition-colors">
                  <role.icon size={24} strokeWidth={2} />
                </div>
                <span className="text-xs font-semibold text-slate-700">{role.title}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
