import React, { useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  X
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
  { title: "Compose", description: "Write and edit documents", icon: ComposeIcon },
  { title: "Deck", description: "Create presentations", icon: DeckIcon },
  { title: "Sheet", description: "Manage spreadsheets", icon: SheetIcon },
  { title: "Room", description: "Host meetings", icon: RoomIcon },
  { title: "Whiteboard", description: "Brainstorm ideas", icon: WhiteboardIcon },
  { title: "Schedule", description: "Manage calendar", icon: ScheduleIcon },
  { title: "Memory", description: "Access memories", icon: MemoryIcon },
  { title: "Tasks", description: "Track to-dos", icon: TasksIcon },
];

export default function RegaarderComposeLanding({ onLaunch }) {
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [legalModalTab, setLegalModalTab] = useState(null);

  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  const displayedProducts = products.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  return (
    <div className="w-full h-full relative overflow-hidden bg-white" style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
      {/* Subtle Blurred Mesh Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-300/30 mix-blend-multiply filter blur-[100px] animate-blob" />
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-purple-300/30 mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-[20%] left-[20%] w-[80%] h-[80%] rounded-full bg-pink-300/30 mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000" />
      </div>

      <div className="w-full h-full flex flex-col items-center justify-center p-8 overflow-y-auto thin-scrollbar relative z-10">
        <div className="w-full max-w-[800px] mx-auto flex flex-col items-center transition-all duration-700 ease-out">
          
          {/* Header */}
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="flex justify-center mb-6">
              <RegaarderBrandIcon size={48} className="hover:scale-105 transition-transform duration-300" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">
              One workspace for all your office needs.
            </h1>
            <p className="text-[15px] text-slate-600 font-medium max-w-lg mx-auto">
              Choose a product to start creating.
            </p>
          </div>

          {/* Product Suite Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full mb-8 relative min-h-[220px]">
            {displayedProducts.map((product, idx) => (
              <button
                key={idx}
                onClick={() => onLaunch?.({ type: 'action', name: product.title })}
                style={{ animationDelay: `${idx * 40}ms` }}
                className="flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-2xl p-6 hover:bg-white hover:border-violet-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both"
              >
                <div className="text-slate-600 group-hover:text-violet-600 transition-colors">
                  <product.icon size={26} strokeWidth={1.5} />
                </div>
                <span className="text-sm font-semibold text-slate-800">{product.title}</span>
              </button>
            ))}
          </div>

          {/* Carousel Indicators (If we had more than 8 products) */}
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

          {/* Footer with Terms of Service, Privacy Policy & Legal */}
          <div className="mt-16 flex items-center gap-6 text-xs text-slate-400 select-none">
            <button
              type="button"
              onClick={() => setLegalModalTab("terms")}
              className="hover:text-slate-700 transition-colors cursor-pointer bg-transparent border-none p-0 text-xs font-normal"
            >
              Terms of Service
            </button>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <button
              type="button"
              onClick={() => setLegalModalTab("privacy")}
              className="hover:text-slate-700 transition-colors cursor-pointer bg-transparent border-none p-0 text-xs font-normal"
            >
              Privacy Policy
            </button>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <button
              type="button"
              onClick={() => setLegalModalTab("legal")}
              className="hover:text-slate-700 transition-colors cursor-pointer bg-transparent border-none p-0 text-xs font-normal"
            >
              Legal
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
