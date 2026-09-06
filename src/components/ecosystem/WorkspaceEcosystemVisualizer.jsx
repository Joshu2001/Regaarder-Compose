import React, { useState } from 'react';
import {
  FileText,
  Table2,
  Presentation,
  Upload,
  Video,
  PenTool,
  Sparkles,
  ArrowLeftRight,
} from 'lucide-react';

/**
 * WorkspaceEcosystemVisualizer
 * 
 * Faithfully reproduces the reference design:
 * - Central connected core: Memory (left, soft purple glow) and Relay (right, soft blue glow)
 * - Horizontal luminous connection with pulsating energy node between Memory and Relay
 * - Peripheral satellite tools positioned radially around the core:
 *   - Top center: Docs
 *   - Upper left: Sheets
 *   - Upper right: Deck
 *   - Left: Import
 *   - Right: Whiteboard
 *   - Bottom center/left: Room
 * - Very thin, luminous curved SVG connection paths with subtle glows, directional flow arrowheads, and traveling energy particles
 * - Concentric celestial orbit rings with ethereal planetary glow
 * - Apple-style micro-interactions on hover with elevation and highlighted energetic flow
 * - Strict adherence to prefers-reduced-motion
 */

export default function WorkspaceEcosystemVisualizer({ onLaunch }) {
  const [hoveredNode, setHoveredNode] = useState(null);

  const handleLaunch = (targetId) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('rc.lastOpenedApp', targetId);
        const raw = localStorage.getItem('rc.mruAppsHistory');
        const prevList = raw ? JSON.parse(raw) : [];
        const nextList = [targetId, ...prevList.filter((id) => id !== targetId)];
        localStorage.setItem('rc.mruAppsHistory', JSON.stringify(nextList));
      }
    } catch {}

    const targetName = targetId === 'relay' ? 'dm' : targetId;
    onLaunch?.({ type: 'action', name: targetName });
  };

  return (
    <div className="w-full relative select-none flex items-center justify-center my-1 sm:my-2">
      {/* ── Internal Keyframes for Fluid Celestial Particle Flow & Gentle Breathing ── */}
      <style>{`
        @keyframes pulseBeam {
          0%, 100% { opacity: 0.35; transform: scaleX(0.96); }
          50% { opacity: 0.85; transform: scaleX(1.04); }
        }
        @keyframes breatheCore {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.018); }
        }
        @keyframes flowAlongPath {
          0% { offset-distance: 0%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { offset-distance: 100%; opacity: 0; }
        }
        .animate-core-breathe {
          animation: breatheCore 7s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-core-breathe {
            animation: none !important;
          }
          circle[style*="offset-path"] {
            display: none !important;
          }
        }
      `}</style>

      {/* ── Outer Ecosystem Stage (Aspect 960 x 510) ── */}
      <div className="w-full max-w-[980px] h-[490px] sm:h-[515px] relative flex items-center justify-center overflow-visible">
        
        {/* ── Ethereal Multi-Layered Radial Backdrop Glow ── */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Broad atmospheric soft azure/lavender glow */}
          <div className="w-[660px] h-[370px] rounded-[100%] bg-gradient-to-r from-blue-100/50 via-indigo-100/40 to-purple-100/50 dark:from-blue-900/15 dark:via-indigo-900/15 dark:to-purple-900/15 blur-[76px] transform -translate-y-2 opacity-85" />
          {/* Subtle concentrated core glow behind Memory & Relay */}
          <div className="w-[400px] h-[210px] rounded-full bg-gradient-to-r from-purple-200/50 to-blue-200/50 dark:from-purple-800/20 dark:to-blue-800/20 blur-[50px] opacity-75" />
        </div>

        {/* ── SVG Connection Network Layer (Calculated against a 960 × 510 ViewBox) ── */}
        <svg
          viewBox="0 0 960 510"
          className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
          fill="none"
        >
          <defs>
            {/* Arrowhead marker: Subtle purple */}
            <marker
              id="arrow-purple"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="4.5"
              markerHeight="4.5"
              orient="auto-start-reverse"
            >
              <path d="M 1 2 L 7 5 L 1 8" fill="none" stroke="#9333ea" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.65" />
            </marker>

            {/* Arrowhead marker: Subtle blue */}
            <marker
              id="arrow-blue"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="4.5"
              markerHeight="4.5"
              orient="auto-start-reverse"
            >
              <path d="M 1 2 L 7 5 L 1 8" fill="none" stroke="#3b82f6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.65" />
            </marker>

            {/* Arrowhead marker: Subtle violet-indigo */}
            <marker
              id="arrow-indigo"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="4.5"
              markerHeight="4.5"
              orient="auto-start-reverse"
            >
              <path d="M 1 2 L 7 5 L 1 8" fill="none" stroke="#6366f1" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.65" />
            </marker>

            {/* Linear gradients for connection paths */}
            <linearGradient id="grad-docs" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.75" />
            </linearGradient>

            <linearGradient id="grad-sheets" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#818cf8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="grad-deck" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fb923c" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#818cf8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="grad-import" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.85" />
            </linearGradient>

            <linearGradient id="grad-whiteboard" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#60a5fa" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.85" />
            </linearGradient>

            <linearGradient id="grad-room" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#818cf8" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.85" />
            </linearGradient>

            <linearGradient id="grad-core-bridge" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#818cf8" stopOpacity="1" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.85" />
            </linearGradient>

            {/* Subtle glow filter */}
            <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ── Ethereal Concentric Orbital Guide Rings ── */}
          {/* Main outer elliptical orbit */}
          <ellipse
            cx="480"
            cy="255"
            rx="420"
            ry="185"
            stroke="url(#grad-core-bridge)"
            strokeWidth="1"
            strokeDasharray="4 8"
            opacity="0.22"
            className="dark:opacity-15"
          />
          {/* Subtle inner orbital halo */}
          <ellipse
            cx="480"
            cy="255"
            rx="275"
            ry="115"
            stroke="currentColor"
            className="text-indigo-400/20 dark:text-indigo-500/15"
            strokeWidth="0.75"
            strokeDasharray="3 6"
          />

          {/* ── Central Memory ↔ Relay Interlink Bridge ── */}
          <g className="transition-opacity duration-300">
            {/* Luminous wide glow track */}
            <line
              x1="452"
              y1="255"
              x2="508"
              y2="255"
              stroke="url(#grad-core-bridge)"
              strokeWidth="4.5"
              opacity="0.4"
              filter="url(#soft-glow)"
            />
            {/* Crisp core spine */}
            <line
              x1="452"
              y1="255"
              x2="508"
              y2="255"
              stroke="url(#grad-core-bridge)"
              strokeWidth="1.5"
              opacity="0.85"
            />
            {/* Left anchor node */}
            <circle cx="454" cy="255" r="2.2" fill="#c084fc" />
            {/* Right anchor node */}
            <circle cx="506" cy="255" r="2.2" fill="#60a5fa" />
            {/* Pulsating energy node in center */}
            <circle
              cx="480"
              cy="255"
              r="3"
              fill="#818cf8"
              filter="url(#soft-glow)"
              className="animate-pulse"
            />
          </g>

          {/* ── 1. Top Center: Docs → Memory & Relay ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'compose' ? 'opacity-100' : 'opacity-70'}`}>
            <path
              id="path-docs"
              d="M 480 152 C 480 185, 470 195, 465 210"
              stroke="url(#grad-docs)"
              strokeWidth={hoveredNode === 'compose' ? "2" : "1.25"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-purple)"
            />
            <circle cx="480" cy="152" r="2" fill="#60a5fa" />
            {/* Flowing energy particle */}
            <circle r="2.2" fill="#a855f7" filter="url(#soft-glow)" style={{
              offsetPath: "path('M 480 152 C 480 185, 470 195, 465 210')",
              animation: "flowAlongPath 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite",
            }} />
          </g>

          {/* ── 2. Upper Left: Sheets → Memory ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'sheet' ? 'opacity-100' : 'opacity-70'}`}>
            <path
              id="path-sheets"
              d="M 335 170 C 355 195, 375 220, 395 230"
              stroke="url(#grad-sheets)"
              strokeWidth={hoveredNode === 'sheet' ? "2" : "1.25"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-purple)"
            />
            <circle cx="335" cy="170" r="2" fill="#34d399" />
            {/* Flowing energy particle */}
            <circle r="2.2" fill="#818cf8" filter="url(#soft-glow)" style={{
              offsetPath: "path('M 335 170 C 355 195, 375 220, 395 230')",
              animation: "flowAlongPath 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.6s",
            }} />
          </g>

          {/* ── 3. Upper Right: Deck → Relay ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'deck' ? 'opacity-100' : 'opacity-70'}`}>
            <path
              id="path-deck"
              d="M 670 190 C 640 205, 625 215, 610 225"
              stroke="url(#grad-deck)"
              strokeWidth={hoveredNode === 'deck' ? "2" : "1.25"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-blue)"
            />
            <circle cx="670" cy="190" r="2" fill="#fb923c" />
            {/* Flowing energy particle */}
            <circle r="2.2" fill="#60a5fa" filter="url(#soft-glow)" style={{
              offsetPath: "path('M 670 190 C 640 205, 625 215, 610 225')",
              animation: "flowAlongPath 3.4s cubic-bezier(0.4, 0, 0.2, 1) infinite 1.2s",
            }} />
          </g>

          {/* ── 4. Mid Left: Import → Memory ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'omni-portal' ? 'opacity-100' : 'opacity-70'}`}>
            <path
              id="path-import"
              d="M 305 255 C 335 255, 360 255, 385 255"
              stroke="url(#grad-import)"
              strokeWidth={hoveredNode === 'omni-portal' ? "2" : "1.25"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-purple)"
            />
            <circle cx="305" cy="255" r="2" fill="#c084fc" />
            {/* Flowing energy particle */}
            <circle r="2.2" fill="#c084fc" filter="url(#soft-glow)" style={{
              offsetPath: "path('M 305 255 C 335 255, 360 255, 385 255')",
              animation: "flowAlongPath 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.3s",
            }} />
          </g>

          {/* ── 5. Bottom Right: Whiteboard → Relay ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'whiteboard' ? 'opacity-100' : 'opacity-70'}`}>
            <path
              id="path-whiteboard"
              d="M 680 320 C 655 315, 635 305, 615 285"
              stroke="url(#grad-whiteboard)"
              strokeWidth={hoveredNode === 'whiteboard' ? "2" : "1.25"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-blue)"
            />
            <circle cx="680" cy="320" r="2" fill="#3b82f6" />
            {/* Flowing energy particle */}
            <circle r="2.2" fill="#60a5fa" filter="url(#soft-glow)" style={{
              offsetPath: "path('M 680 320 C 655 315, 635 305, 615 285')",
              animation: "flowAlongPath 3.8s cubic-bezier(0.4, 0, 0.2, 1) infinite 1.8s",
            }} />
          </g>

          {/* ── 6. Bottom Center/Left: Room → Memory ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'room' ? 'opacity-100' : 'opacity-70'}`}>
            <path
              id="path-room"
              d="M 440 340 C 445 320, 445 305, 445 295"
              stroke="url(#grad-room)"
              strokeWidth={hoveredNode === 'room' ? "2" : "1.25"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-indigo)"
            />
            <circle cx="440" cy="340" r="2" fill="#2dd4bf" />
            {/* Flowing energy particle */}
            <circle r="2.2" fill="#a855f7" filter="url(#soft-glow)" style={{
              offsetPath: "path('M 440 340 C 445 320, 445 305, 445 295')",
              animation: "flowAlongPath 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.9s",
            }} />
          </g>
        </svg>

        {/* ── HTML Nodes Layer (Positioned with high precision) ── */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          
          {/* ========================================================================= */}
          {/* ── CENTRAL CONNECTED CORE: Memory (left) & Relay (right) ─────────────── */}
          {/* ========================================================================= */}
          <div className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] flex items-center gap-7 sm:gap-9 pointer-events-auto">
            
            {/* ── MEMORY CARD (Contextual Core) ── */}
            <button
              type="button"
              onClick={() => handleLaunch('memory')}
              onMouseEnter={() => setHoveredNode('memory')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "w-[146px] sm:w-[158px] h-[130px] sm:h-[138px]",
                "rounded-[26px] p-3.5 sm:p-4",
                "flex flex-col items-center justify-center text-center",
                // Soft purple/lavender glass glow
                "bg-gradient-to-b from-white/95 via-purple-50/70 to-white/95 dark:from-zinc-900/95 dark:via-purple-950/40 dark:to-zinc-900/95",
                "border border-purple-200/70 dark:border-purple-500/30",
                "shadow-[0_12px_32px_-8px_rgba(168,85,247,0.18),0_2px_6px_rgba(15,23,42,0.03)] dark:shadow-[0_12px_32px_-8px_rgba(168,85,247,0.3)]",
                "backdrop-blur-xl transition-all duration-300 cursor-pointer group outline-none",
                hoveredNode === 'memory' ? "scale-[1.03] -translate-y-1 shadow-[0_16px_36px_-6px_rgba(168,85,247,0.28)]" : "animate-core-breathe",
              ].join(" ")}
            >
              {/* Subtle inner radial lavender illumination */}
              <div className="w-10 h-10 rounded-2xl bg-purple-100/70 dark:bg-purple-900/40 flex items-center justify-center mb-2 text-purple-600 dark:text-purple-300 group-hover:scale-105 transition-transform duration-200 shadow-xs">
                <Sparkles size={20} strokeWidth={1.8} className="text-purple-600 dark:text-purple-300" />
              </div>
              <span className="text-[14px] sm:text-[15px] font-bold text-slate-900 dark:text-white tracking-[-0.01em]">
                Memory
              </span>
              <span className="text-[11px] sm:text-[11.5px] text-slate-500 dark:text-zinc-400 font-normal mt-0.5 leading-snug">
                Your team's<br />shared context
              </span>
            </button>

            {/* ── RELAY CARD (Connectivity Core) ── */}
            <button
              type="button"
              onClick={() => handleLaunch('relay')}
              onMouseEnter={() => setHoveredNode('relay')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "w-[146px] sm:w-[158px] h-[130px] sm:h-[138px]",
                "rounded-[26px] p-3.5 sm:p-4",
                "flex flex-col items-center justify-center text-center",
                // Soft blue glass glow
                "bg-gradient-to-b from-white/95 via-blue-50/70 to-white/95 dark:from-zinc-900/95 dark:via-blue-950/40 dark:to-zinc-900/95",
                "border border-blue-200/70 dark:border-blue-500/30",
                "shadow-[0_12px_32px_-8px_rgba(59,130,246,0.18),0_2px_6px_rgba(15,23,42,0.03)] dark:shadow-[0_12px_32px_-8px_rgba(59,130,246,0.3)]",
                "backdrop-blur-xl transition-all duration-300 cursor-pointer group outline-none",
                hoveredNode === 'relay' ? "scale-[1.03] -translate-y-1 shadow-[0_16px_36px_-6px_rgba(59,130,246,0.28)]" : "animate-core-breathe",
              ].join(" ")}
            >
              {/* Subtle inner radial blue illumination */}
              <div className="w-10 h-10 rounded-2xl bg-blue-100/70 dark:bg-blue-900/40 flex items-center justify-center mb-2 text-blue-600 dark:text-blue-300 group-hover:scale-105 transition-transform duration-200 shadow-xs">
                <ArrowLeftRight size={19} strokeWidth={2} className="text-blue-600 dark:text-blue-300" />
              </div>
              <span className="text-[14px] sm:text-[15px] font-bold text-slate-900 dark:text-white tracking-[-0.01em]">
                Relay
              </span>
              <span className="text-[11px] sm:text-[11.5px] text-slate-500 dark:text-zinc-400 font-normal mt-0.5 leading-snug">
                Connects tools,<br />people and ideas
              </span>
            </button>

          </div>

          {/* ========================================================================= */}
          {/* ── PERIPHERAL TOOLS (Satellites in exact reference spatial positions) ─── */}
          {/* ========================================================================= */}

          {/* ── 1. Top Center: DOCS ── */}
          <div className="absolute top-[7%] sm:top-[8%] left-[50%] -translate-x-[50%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('compose')}
              onMouseEnter={() => setHoveredNode('compose')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-3 px-4 py-2.5 rounded-2xl",
                "bg-white/85 dark:bg-[#18181b]/85 backdrop-blur-md",
                "border border-slate-200/60 dark:border-white/[0.08]",
                "shadow-[0_4px_16px_-4px_rgba(15,23,42,0.06)] dark:shadow-none",
                "hover:bg-white dark:hover:bg-[#1f1f23] hover:border-blue-200 dark:hover:border-blue-500/30",
                "hover:shadow-[0_8px_24px_-4px_rgba(59,130,246,0.16)] hover:-translate-y-0.5",
                "active:scale-[0.985] transition-all duration-200 cursor-pointer group text-left outline-none",
                hoveredNode === 'compose' ? "border-blue-300 shadow-md ring-1 ring-blue-200/50" : "",
              ].join(" ")}
            >
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <FileText size={17} strokeWidth={1.8} />
              </div>
              <div className="flex flex-col min-w-0 pr-1">
                <span className="text-[13px] font-semibold text-slate-900 dark:text-white leading-tight">Docs</span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-normal leading-tight mt-0.5">Write, organize, collaborate</span>
              </div>
            </button>
          </div>

          {/* ── 2. Upper Left: SHEETS ── */}
          <div className="absolute top-[18%] sm:top-[20%] left-[8%] sm:left-[12%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('sheet')}
              onMouseEnter={() => setHoveredNode('sheet')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-3 px-4 py-2.5 rounded-2xl",
                "bg-white/85 dark:bg-[#18181b]/85 backdrop-blur-md",
                "border border-slate-200/60 dark:border-white/[0.08]",
                "shadow-[0_4px_16px_-4px_rgba(15,23,42,0.06)] dark:shadow-none",
                "hover:bg-white dark:hover:bg-[#1f1f23] hover:border-emerald-200 dark:hover:border-emerald-500/30",
                "hover:shadow-[0_8px_24px_-4px_rgba(16,185,129,0.16)] hover:-translate-y-0.5",
                "active:scale-[0.985] transition-all duration-200 cursor-pointer group text-left outline-none",
                hoveredNode === 'sheet' ? "border-emerald-300 shadow-md ring-1 ring-emerald-200/50" : "",
              ].join(" ")}
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Table2 size={17} strokeWidth={1.8} />
              </div>
              <div className="flex flex-col min-w-0 pr-1">
                <span className="text-[13px] font-semibold text-slate-900 dark:text-white leading-tight">Sheets</span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-normal leading-tight mt-0.5">Analyze, visualize, plan</span>
              </div>
            </button>
          </div>

          {/* ── 3. Upper Right: DECK ── */}
          <div className="absolute top-[20%] sm:top-[22%] right-[8%] sm:right-[11%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('deck')}
              onMouseEnter={() => setHoveredNode('deck')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-3 px-4 py-2.5 rounded-2xl",
                "bg-white/85 dark:bg-[#18181b]/85 backdrop-blur-md",
                "border border-slate-200/60 dark:border-white/[0.08]",
                "shadow-[0_4px_16px_-4px_rgba(15,23,42,0.06)] dark:shadow-none",
                "hover:bg-white dark:hover:bg-[#1f1f23] hover:border-amber-200 dark:hover:border-amber-500/30",
                "hover:shadow-[0_8px_24px_-4px_rgba(245,158,11,0.16)] hover:-translate-y-0.5",
                "active:scale-[0.985] transition-all duration-200 cursor-pointer group text-left outline-none",
                hoveredNode === 'deck' ? "border-amber-300 shadow-md ring-1 ring-amber-200/50" : "",
              ].join(" ")}
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Presentation size={17} strokeWidth={1.8} />
              </div>
              <div className="flex flex-col min-w-0 pr-1">
                <span className="text-[13px] font-semibold text-slate-900 dark:text-white leading-tight">Deck</span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-normal leading-tight mt-0.5">Present, tell your story</span>
              </div>
            </button>
          </div>

          {/* ── 4. Left: IMPORT ── */}
          <div className="absolute top-[48%] -translate-y-[50%] left-[4%] sm:left-[8%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('omni-portal')}
              onMouseEnter={() => setHoveredNode('omni-portal')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-3 px-4 py-2.5 rounded-2xl",
                "bg-white/85 dark:bg-[#18181b]/85 backdrop-blur-md",
                "border border-slate-200/60 dark:border-white/[0.08]",
                "shadow-[0_4px_16px_-4px_rgba(15,23,42,0.06)] dark:shadow-none",
                "hover:bg-white dark:hover:bg-[#1f1f23] hover:border-purple-200 dark:hover:border-purple-500/30",
                "hover:shadow-[0_8px_24px_-4px_rgba(168,85,247,0.16)] hover:-translate-y-0.5",
                "active:scale-[0.985] transition-all duration-200 cursor-pointer group text-left outline-none",
                hoveredNode === 'omni-portal' ? "border-purple-300 shadow-md ring-1 ring-purple-200/50" : "",
              ].join(" ")}
            >
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Upload size={17} strokeWidth={1.8} />
              </div>
              <div className="flex flex-col min-w-0 pr-1">
                <span className="text-[13px] font-semibold text-slate-900 dark:text-white leading-tight">Import</span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-normal leading-tight mt-0.5">Bring in any content</span>
              </div>
            </button>
          </div>

          {/* ── 5. Right: WHITEBOARD ── */}
          <div className="absolute top-[58%] sm:top-[60%] right-[6%] sm:right-[10%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('whiteboard')}
              onMouseEnter={() => setHoveredNode('whiteboard')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-3 px-4 py-2.5 rounded-2xl",
                "bg-white/85 dark:bg-[#18181b]/85 backdrop-blur-md",
                "border border-slate-200/60 dark:border-white/[0.08]",
                "shadow-[0_4px_16px_-4px_rgba(15,23,42,0.06)] dark:shadow-none",
                "hover:bg-white dark:hover:bg-[#1f1f23] hover:border-blue-200 dark:hover:border-blue-500/30",
                "hover:shadow-[0_8px_24px_-4px_rgba(59,130,246,0.16)] hover:-translate-y-0.5",
                "active:scale-[0.985] transition-all duration-200 cursor-pointer group text-left outline-none",
                hoveredNode === 'whiteboard' ? "border-blue-300 shadow-md ring-1 ring-blue-200/50" : "",
              ].join(" ")}
            >
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <PenTool size={17} strokeWidth={1.8} />
              </div>
              <div className="flex flex-col min-w-0 pr-1">
                <span className="text-[13px] font-semibold text-slate-900 dark:text-white leading-tight">Whiteboard</span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-normal leading-tight mt-0.5">Brainstorm, create, iterate</span>
              </div>
            </button>
          </div>

          {/* ── 6. Bottom Center/Left: ROOM ── */}
          <div className="absolute bottom-[8%] sm:bottom-[10%] left-[27%] sm:left-[31%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('room')}
              onMouseEnter={() => setHoveredNode('room')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-3 px-4 py-2.5 rounded-2xl",
                "bg-white/85 dark:bg-[#18181b]/85 backdrop-blur-md",
                "border border-slate-200/60 dark:border-white/[0.08]",
                "shadow-[0_4px_16px_-4px_rgba(15,23,42,0.06)] dark:shadow-none",
                "hover:bg-white dark:hover:bg-[#1f1f23] hover:border-teal-200 dark:hover:border-teal-500/30",
                "hover:shadow-[0_8px_24px_-4px_rgba(20,184,166,0.16)] hover:-translate-y-0.5",
                "active:scale-[0.985] transition-all duration-200 cursor-pointer group text-left outline-none",
                hoveredNode === 'room' ? "border-teal-300 shadow-md ring-1 ring-teal-200/50" : "",
              ].join(" ")}
            >
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <Video size={17} strokeWidth={1.8} />
              </div>
              <div className="flex flex-col min-w-0 pr-1">
                <span className="text-[13px] font-semibold text-slate-900 dark:text-white leading-tight">Room</span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-normal leading-tight mt-0.5">Meet, discuss, decide</span>
              </div>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
