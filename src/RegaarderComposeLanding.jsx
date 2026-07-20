import React, { useState } from "react";
import {
  FileText,
  MonitorPlay,
  Table,
  Video,
  Shapes,
  Calendar,
  CheckSquare,
  Brain,
  ChevronRight,
  ChevronLeft,
  ArrowUpRight,
  Sparkles
} from "lucide-react";

const products = [
  { 
    title: "Compose", 
    subtext: "Docs & Notes",
    description: "Write and edit documents", 
    icon: FileText,
    accent: "from-indigo-500/10 to-violet-500/10 text-indigo-600 border-indigo-200/50 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 group-hover:shadow-indigo-500/25"
  },
  { 
    title: "Deck", 
    subtext: "Slides & Pitch",
    description: "Create presentations", 
    icon: MonitorPlay,
    accent: "from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-200/50 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500 group-hover:shadow-amber-500/25"
  },
  { 
    title: "Sheet", 
    subtext: "Data & Tables",
    description: "Manage spreadsheets", 
    icon: Table,
    accent: "from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-200/50 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 group-hover:shadow-emerald-500/25"
  },
  { 
    title: "Room", 
    subtext: "Video & Calls",
    description: "Host meetings", 
    icon: Video,
    accent: "from-rose-500/10 to-pink-500/10 text-rose-600 border-rose-200/50 group-hover:bg-rose-500 group-hover:text-white group-hover:border-rose-500 group-hover:shadow-rose-500/25"
  },
  { 
    title: "Whiteboard", 
    subtext: "Canvas & Ideas",
    description: "Brainstorm ideas", 
    icon: Shapes,
    accent: "from-cyan-500/10 to-blue-500/10 text-cyan-600 border-cyan-200/50 group-hover:bg-cyan-500 group-hover:text-white group-hover:border-cyan-500 group-hover:shadow-cyan-500/25"
  },
  { 
    title: "Schedule", 
    subtext: "Events & Planner",
    description: "Manage calendar", 
    icon: Calendar,
    accent: "from-purple-500/10 to-fuchsia-500/10 text-purple-600 border-purple-200/50 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 group-hover:shadow-purple-500/25"
  },
  { 
    title: "Memory", 
    subtext: "AI Knowledge",
    description: "Access memories", 
    icon: Brain,
    accent: "from-violet-500/10 to-pink-500/10 text-violet-600 border-violet-200/50 group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-600 group-hover:shadow-violet-500/25"
  },
  { 
    title: "Tasks", 
    subtext: "To-Dos & Tracker",
    description: "Track to-dos", 
    icon: CheckSquare,
    accent: "from-blue-500/10 to-sky-500/10 text-blue-600 border-blue-200/50 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:shadow-blue-500/25"
  },
];

export default function RegaarderComposeLanding({ onLaunch }) {
  const [currentPage, setCurrentPage] = useState(0);

  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  const displayedProducts = products.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-50/60 select-none" style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
      {/* Multi-layered Soft Mesh & Light Refraction Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-70">
        <div className="absolute -top-[25%] -left-[15%] w-[75%] h-[75%] rounded-full bg-gradient-to-br from-indigo-200/40 to-blue-200/20 mix-blend-multiply filter blur-[120px] animate-blob" />
        <div className="absolute top-[15%] -right-[15%] w-[65%] h-[65%] rounded-full bg-gradient-to-br from-purple-200/40 to-pink-200/20 mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-[25%] left-[15%] w-[85%] h-[85%] rounded-full bg-gradient-to-br from-pink-200/30 to-violet-200/20 mix-blend-multiply filter blur-[120px] animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/70 via-transparent to-slate-100/40" />
      </div>

      <div className="w-full h-full flex flex-col items-center justify-center p-6 sm:p-8 overflow-y-auto thin-scrollbar relative z-10">
        <div className="w-full max-w-[840px] mx-auto flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Header & Brand Crest Anchor */}
          <div className="text-center mb-10 flex flex-col items-center">
            {/* Grounded Brand Crest Container */}
            <div className="relative inline-flex items-center justify-center mb-5 group">
              {/* Soft Ambient Glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 rounded-3xl opacity-25 blur-xl group-hover:opacity-45 transition duration-700" />
              
              {/* Frosted Glass Crest Frame */}
              <div className="relative p-2.5 rounded-2xl bg-white/75 backdrop-blur-xl border border-white/90 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center justify-center">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 shadow-md flex items-center justify-center transform rotate-6 group-hover:rotate-0 transition-transform duration-500">
                  <div className="w-5 h-5 bg-white/30 rounded-full blur-[1px] -translate-x-1 -translate-y-1" />
                </div>
              </div>
            </div>

            {/* Brand Tag Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/[0.04] border border-slate-900/[0.06] text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-3 backdrop-blur-md">
              <Sparkles className="w-3 h-3 text-violet-500" />
              <span>Regaarder Workspace</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
              One workspace for all your office needs.
            </h1>
            <p className="text-[15px] text-slate-500 font-normal max-w-lg mx-auto">
              Choose a product to start creating.
            </p>
          </div>

          {/* Product Suite Grid with Frosted Glassmorphism & Tactile Micro-Interactions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 w-full mb-8 relative min-h-[220px]">
            {displayedProducts.map((product, idx) => (
              <button
                key={idx}
                onClick={() => onLaunch?.({ type: 'action', name: product.title })}
                className="group relative flex flex-col items-center justify-between bg-white/65 hover:bg-white/95 backdrop-blur-xl backdrop-saturate-150 border border-white/80 hover:border-violet-300/80 rounded-2xl p-5 sm:p-6 transition-all duration-300 ease-out hover:-translate-y-1.5 active:scale-[0.98] shadow-[0_10px_30px_-5px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.02),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_20px_35px_-10px_rgba(99,102,241,0.14),0_8px_16px_-4px_rgba(0,0,0,0.04)] text-left min-h-[168px]"
              >
                {/* Top Right Arrow Action Indicator */}
                <div className="absolute top-3.5 right-3.5 text-slate-300 group-hover:text-slate-500 transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowUpRight size={15} strokeWidth={2} />
                </div>

                {/* Custom Gradient Accent Icon Frame */}
                <div className="w-full flex justify-center mb-1">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${product.accent} border flex items-center justify-center transition-all duration-300 shadow-sm group-hover:scale-110 group-hover:shadow-md`}>
                    <product.icon size={22} strokeWidth={1.8} />
                  </div>
                </div>

                {/* Card Title & Micro-copy Subtext */}
                <div className="flex flex-col items-center text-center w-full">
                  <span className="text-[15px] font-bold text-slate-800 tracking-tight group-hover:text-slate-950 transition-colors">
                    {product.title}
                  </span>
                  <span className="text-[12px] text-slate-400 font-medium group-hover:text-slate-500 transition-colors mt-0.5">
                    {product.subtext}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Carousel Indicators (If more than 8 products) */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2 mt-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="flex gap-1.5">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${currentPage === i ? 'w-4 bg-slate-800' : 'w-1.5 bg-slate-300'}`} 
                  />
                ))}
              </div>

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage === totalPages - 1}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Footer inside Sleek Glass Pill Container */}
          <div className="mt-14 flex items-center justify-center">
            <div className="px-5 py-2 rounded-full bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.8)] flex items-center gap-4 text-xs font-medium text-slate-400 select-none">
              <a href="#/terms" onClick={(e) => { e.preventDefault(); alert("Terms of Service"); }} className="hover:text-slate-700 transition-colors">Terms of Service</a>
              <span className="w-1 h-1 rounded-full bg-slate-300/80" />
              <a href="#/privacy" onClick={(e) => { e.preventDefault(); alert("Privacy Policy"); }} className="hover:text-slate-700 transition-colors">Privacy Policy</a>
              <span className="w-1 h-1 rounded-full bg-slate-300/80" />
              <a href="#/legal" onClick={(e) => { e.preventDefault(); alert("Legal Notices"); }} className="hover:text-slate-700 transition-colors">Legal</a>
            </div>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 15s infinite alternate ease-in-out;
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
