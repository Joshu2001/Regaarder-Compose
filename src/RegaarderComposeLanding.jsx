import React, { useState } from "react";
import {
  FileText,
  MonitorPlay,
  Table,
  Video,
  PenTool,
  Calendar,
  Users,
  CheckSquare,
  Plus,
  ChevronRight,
  ChevronLeft,
  X
} from "lucide-react";

const products = [
  { title: "Compose", description: "Write and edit documents", icon: FileText },
  { title: "Deck", description: "Create presentations", icon: MonitorPlay },
  { title: "Sheet", description: "Manage spreadsheets", icon: Table },
  { title: "Room", description: "Host meetings", icon: Video },
  { title: "Whiteboard", description: "Brainstorm ideas", icon: PenTool },
  { title: "Schedule", description: "Manage calendar", icon: Calendar },
  { title: "People", description: "Manage contacts", icon: Users },
  { title: "Tasks", description: "Track to-dos", icon: CheckSquare },
];

export default function RegaarderComposeLanding({ onLaunch }) {
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  const displayedProducts = products.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  return (
    <div className="w-full h-full relative overflow-hidden bg-white" style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
      {/* Vibrant Blurred Mesh Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-400/40 mix-blend-multiply filter blur-[100px] animate-blob" />
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-purple-400/40 mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-[20%] left-[20%] w-[80%] h-[80%] rounded-full bg-pink-400/40 mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000" />
      </div>

      <div className="w-full h-full flex flex-col items-center justify-center p-8 overflow-y-auto thin-scrollbar relative z-10">
        <div className="w-full max-w-[800px] mx-auto flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              {/* Abstract Heart/Logo placeholder matching Image 2 */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 shadow-lg flex items-center justify-center shadow-pink-500/30 transform rotate-12">
                <div className="w-6 h-6 bg-white rounded-full opacity-20 -translate-x-1 -translate-y-1" />
              </div>
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
                className="flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-2xl p-6 hover:bg-white hover:border-violet-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group shadow-sm"
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

        </div>
      </div>

      {/* Floating + New Button Side Panel */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-end gap-3">
        
        {/* Dropdown Menu */}
        <div 
          className={`bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 overflow-hidden transition-all duration-300 origin-right ${
            showNewMenu ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 translate-x-4 pointer-events-none'
          }`}
          style={{ width: '180px' }}
        >
          <div className="flex items-center justify-between px-3 py-2 mb-1 border-b border-slate-50">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Create New</span>
            <button onClick={() => setShowNewMenu(false)} className="text-slate-400 hover:text-slate-700">
              <X size={14} />
            </button>
          </div>
          <div className="space-y-0.5">
            {products.slice(0, 5).map((product, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setShowNewMenu(false);
                  onLaunch?.({ type: 'action', name: product.title });
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-violet-50 hover:text-violet-700 rounded-lg transition-colors text-left font-medium"
              >
                <product.icon size={15} strokeWidth={2} className="text-slate-400" />
                {product.title}
              </button>
            ))}
          </div>
        </div>

        {/* Floating Action Button */}
        <button
          onClick={() => setShowNewMenu(!showNewMenu)}
          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:scale-105 active:scale-95 ${
            showNewMenu ? 'bg-slate-800 text-white shadow-slate-800/20' : 'bg-white text-violet-600 hover:shadow-violet-600/20 border border-slate-100'
          }`}
        >
          <Plus size={22} strokeWidth={2.5} className={showNewMenu ? 'rotate-45 transition-transform duration-300' : 'transition-transform duration-300'} />
          <span className={`text-[10px] font-bold ${showNewMenu ? 'text-slate-300' : 'text-slate-500'}`}>New</span>
        </button>
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
