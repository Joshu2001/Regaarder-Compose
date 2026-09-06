import React, { useState } from 'react';
import {
  ComposeIcon,
  SheetIcon,
  DeckIcon,
  ImportPortalIcon,
  WhiteboardIcon,
  RoomIcon,
  RelayIcon,
} from '../RegaarderProductIcons';

/**
 * WorkspaceEcosystemVisualizer
 * 
 * Accurately reproduces the reference design:
 * - Central connected core: Memory (left, soft lavender/purple glow, spark glyph) and Relay (right, soft blue glow, bidirectional glyph)
 * - Strengthened, elegant luminous horizontal connection between Memory and Relay with breathing light
 * - Peripheral satellite tools positioned radially with expanded horizontal footprint (10-12% wider):
 *   - Docs: top center (closer to subtitle)
 *   - Sheets: upper-left (spread wider)
 *   - Deck: upper-right (spread wider)
 *   - Import: left (spread wider)
 *   - Whiteboard: lower-right (spread wider)
 *   - Room: lower-left/bottom
 * - Reduced vertical footprint so Recent Work is naturally visible in standard viewports
 * - 20% subtler, whisper-thin, low-opacity ethereal connection paths and orbital sweeps
 * - Highly refined glass-like translucent surfaces on Memory & Relay
 * - Cards remain spatially fixed (no spinning/rotation)
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
    <div className="w-full relative select-none flex items-center justify-center -my-1 sm:-my-2">
      {/* ── Internal Keyframes for Fluid Particle Flow & Soft Bridge Breathing ── */}
      <style>{`
        @keyframes pulseBridgeLuminous {
          0%, 100% { opacity: 0.55; filter: drop-shadow(0 0 4px rgba(168,85,247,0.3)); }
          50% { opacity: 0.95; filter: drop-shadow(0 0 8px rgba(99,102,241,0.6)); }
        }
        @keyframes flowParticleSubtle {
          0% { offset-distance: 0%; opacity: 0; }
          15% { opacity: 0.75; }
          85% { opacity: 0.75; }
          100% { offset-distance: 100%; opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse-bridge-luminous {
            animation: none !important;
          }
          circle[style*="offset-path"] {
            display: none !important;
          }
        }
      `}</style>

      {/* ── Outer Ecosystem Stage (Aspect 1100 x 470: Widen horizontally by ~10%, reduce vertical footprint) ── */}
      <div className="w-full max-w-[1120px] h-[450px] sm:h-[475px] relative flex items-center justify-center overflow-visible">
        
        {/* ── Soft Atmospheric Background Illumination (subtle, pure Apple aesthetic) ── */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Subtle lavender/blue ambient glow */}
          <div className="w-[820px] h-[350px] rounded-[100%] bg-gradient-to-r from-blue-100/35 via-indigo-100/25 to-purple-100/35 dark:from-blue-950/15 dark:via-indigo-950/15 dark:to-purple-950/15 blur-[90px] transform -translate-y-1 opacity-65" />
          {/* Soft core glow directly behind central pair */}
          <div className="w-[450px] h-[200px] rounded-full bg-gradient-to-r from-purple-200/30 to-blue-200/30 dark:from-purple-900/12 dark:to-blue-900/12 blur-[50px] opacity-55" />
        </div>

        {/* ── SVG Connection Network Layer (Calculated against a 1100 × 470 ViewBox) ── */}
        <svg
          viewBox="0 0 1100 470"
          className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
          fill="none"
        >
          <defs>
            {/* Extremely delicate arrowheads - 20% subtler */}
            <marker
              id="arrow-subtle-purple"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="3.2"
              markerHeight="3.2"
              orient="auto-start-reverse"
            >
              <path d="M 1 2.5 L 6.5 5 L 1 7.5" fill="none" stroke="#a855f7" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />
            </marker>

            <marker
              id="arrow-subtle-blue"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="3.2"
              markerHeight="3.2"
              orient="auto-start-reverse"
            >
              <path d="M 1 2.5 L 6.5 5 L 1 7.5" fill="none" stroke="#3b82f6" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />
            </marker>

            <marker
              id="arrow-subtle-indigo"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="3.2"
              markerHeight="3.2"
              orient="auto-start-reverse"
            >
              <path d="M 1 2.5 L 6.5 5 L 1 7.5" fill="none" stroke="#818cf8" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />
            </marker>

            {/* Soft, low-opacity linear gradients for paths (subtler by ~20%) */}
            <linearGradient id="grad-subtle-docs" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.48" />
            </linearGradient>

            <linearGradient id="grad-subtle-sheets" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.22" />
              <stop offset="60%" stopColor="#a5b4fc" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.52" />
            </linearGradient>

            <linearGradient id="grad-subtle-deck" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fdba74" stopOpacity="0.18" />
              <stop offset="50%" stopColor="#c4b5fd" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.52" />
            </linearGradient>

            <linearGradient id="grad-subtle-import" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.5" />
            </linearGradient>

            <linearGradient id="grad-subtle-whiteboard" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.18" />
              <stop offset="70%" stopColor="#818cf8" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.52" />
            </linearGradient>

            <linearGradient id="grad-subtle-room" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5eead4" stopOpacity="0.18" />
              <stop offset="60%" stopColor="#a5b4fc" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.52" />
            </linearGradient>

            {/* Ethereal orbital ring gradients - reduced opacity by 20% */}
            <linearGradient id="grad-orbit-primary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.2" />
              <stop offset="35%" stopColor="#818cf8" stopOpacity="0.28" />
              <stop offset="70%" stopColor="#93c5fd" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.16" />
            </linearGradient>

            {/* Luminous Core Interlink Bridge Gradient */}
            <linearGradient id="grad-luminous-bridge" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#a5b4fc" stopOpacity="1" />
              <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.85" />
            </linearGradient>

            {/* Delicate glow filter */}
            <filter id="soft-ethereal-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Bridge Glow Filter */}
            <filter id="bridge-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3.2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ── Ethereal Translucent Orbital Curves (Reduced opacity, wider reach) ── */}
          {/* Main sweeping outer orbital arc */}
          <path
            d="M 90 235 C 80 135, 230 55, 550 52 C 870 49, 1020 125, 1010 230 C 1000 335, 840 415, 530 418 C 220 420, 100 335, 90 235"
            stroke="url(#grad-orbit-primary)"
            strokeWidth="0.9"
            fill="none"
            opacity="0.26"
          />

          {/* Secondary delicate sweeping arc connecting Deck & Whiteboard */}
          <path
            d="M 720 115 C 890 140, 1030 200, 970 310 C 915 385, 760 425, 530 420"
            stroke="url(#grad-orbit-primary)"
            strokeWidth="0.75"
            fill="none"
            opacity="0.17"
          />

          {/* Occasional tiny luminous celestial nodes along the curves */}
          <circle cx="205" cy="120" r="1.3" fill="#a5b4fc" opacity="0.45" />
          <circle cx="940" cy="185" r="1.3" fill="#93c5fd" opacity="0.45" />
          <circle cx="370" cy="412" r="1.3" fill="#c084fc" opacity="0.4" />
          <circle cx="810" cy="408" r="1.3" fill="#a5b4fc" opacity="0.4" />

          {/* ── STRENGTHENED MEMORY ↔ RELAY LUMINOUS CONNECTION ── */}
          {/* Communicates: Memory = shared context ↔ Relay = connectivity */}
          <g className="transition-opacity duration-300">
            {/* Luminous wide atmospheric aura track */}
            <line
              x1="522"
              y1="235"
              x2="578"
              y2="235"
              stroke="url(#grad-luminous-bridge)"
              strokeWidth="5"
              opacity="0.45"
              filter="url(#bridge-glow)"
            />
            {/* Inner radiant beam */}
            <line
              x1="522"
              y1="235"
              x2="578"
              y2="235"
              stroke="url(#grad-luminous-bridge)"
              strokeWidth="2"
              opacity="0.8"
              filter="url(#soft-ethereal-glow)"
            />
            {/* Crisp central spine */}
            <line
              x1="522"
              y1="235"
              x2="578"
              y2="235"
              stroke="#ffffff"
              strokeWidth="1"
              opacity="0.9"
            />
            {/* Left anchor node (Memory shared context connection) */}
            <circle cx="524" cy="235" r="2" fill="#c084fc" opacity="0.9" />
            {/* Right anchor node (Relay connectivity connection) */}
            <circle cx="576" cy="235" r="2" fill="#93c5fd" opacity="0.9" />
            {/* Pulsating energy node in center */}
            <circle
              cx="550"
              cy="235"
              r="3"
              fill="#ffffff"
              filter="url(#bridge-glow)"
              className="animate-pulse-bridge-luminous"
            />
            <circle
              cx="550"
              cy="235"
              r="1.8"
              fill="#a5b4fc"
            />
          </g>

          {/* ── 1. Top Center: Docs → Core (Slightly closer) ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'compose' ? 'opacity-100' : 'opacity-65'}`}>
            <path
              id="path-docs"
              d="M 550 120 C 550 158, 540 178, 536 195"
              stroke="url(#grad-subtle-docs)"
              strokeWidth={hoveredNode === 'compose' ? "1.4" : "0.9"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-subtle-purple)"
            />
            <circle cx="550" cy="120" r="1.5" fill="#93c5fd" opacity="0.55" />
            {/* Flowing energy particle */}
            <circle r="1.5" fill="#c084fc" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 550 120 C 550 158, 540 178, 536 195')",
              animation: "flowParticleSubtle 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite",
            }} />
          </g>

          {/* ── 2. Upper Left: Sheets → Memory (Expanded horizontally) ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'sheet' ? 'opacity-100' : 'opacity-65'}`}>
            <path
              id="path-sheets"
              d="M 335 142 C 375 175, 415 198, 458 208"
              stroke="url(#grad-subtle-sheets)"
              strokeWidth={hoveredNode === 'sheet' ? "1.4" : "0.9"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-subtle-purple)"
            />
            <circle cx="335" cy="142" r="1.5" fill="#6ee7b7" opacity="0.55" />
            {/* Flowing energy particle */}
            <circle r="1.5" fill="#a5b4fc" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 335 142 C 375 175, 415 198, 458 208')",
              animation: "flowParticleSubtle 4s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.6s",
            }} />
          </g>

          {/* ── 3. Upper Right: Deck → Relay (Expanded horizontally) ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'deck' ? 'opacity-100' : 'opacity-65'}`}>
            <path
              id="path-deck"
              d="M 770 160 C 725 185, 695 198, 650 208"
              stroke="url(#grad-subtle-deck)"
              strokeWidth={hoveredNode === 'deck' ? "1.4" : "0.9"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-subtle-blue)"
            />
            <circle cx="770" cy="160" r="1.5" fill="#fdba74" opacity="0.55" />
            {/* Flowing energy particle */}
            <circle r="1.5" fill="#93c5fd" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 770 160 C 725 185, 695 198, 650 208')",
              animation: "flowParticleSubtle 3.8s cubic-bezier(0.4, 0, 0.2, 1) infinite 1.2s",
            }} />
          </g>

          {/* ── 4. Mid Left: Import → Memory (Expanded horizontally) ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'omni-portal' ? 'opacity-100' : 'opacity-65'}`}>
            <path
              id="path-import"
              d="M 285 235 C 340 235, 395 235, 444 235"
              stroke="url(#grad-subtle-import)"
              strokeWidth={hoveredNode === 'omni-portal' ? "1.4" : "0.9"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-subtle-purple)"
            />
            <circle cx="285" cy="235" r="1.5" fill="#c084fc" opacity="0.55" />
            {/* Flowing energy particle */}
            <circle r="1.5" fill="#c084fc" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 285 235 C 340 235, 395 235, 444 235')",
              animation: "flowParticleSubtle 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.3s",
            }} />
          </g>

          {/* ── 5. Lower Right: Whiteboard → Relay (Expanded horizontally) ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'whiteboard' ? 'opacity-100' : 'opacity-65'}`}>
            <path
              id="path-whiteboard"
              d="M 795 305 C 750 292, 715 275, 656 258"
              stroke="url(#grad-subtle-whiteboard)"
              strokeWidth={hoveredNode === 'whiteboard' ? "1.4" : "0.9"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-subtle-blue)"
            />
            <circle cx="795" cy="305" r="1.5" fill="#93c5fd" opacity="0.55" />
            {/* Flowing energy particle */}
            <circle r="1.5" fill="#93c5fd" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 795 305 C 750 292, 715 275, 656 258')",
              animation: "flowParticleSubtle 4.2s cubic-bezier(0.4, 0, 0.2, 1) infinite 1.8s",
            }} />
          </g>

          {/* ── 6. Lower Left/Bottom: Room → Memory ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'room' ? 'opacity-100' : 'opacity-65'}`}>
            <path
              id="path-room"
              d="M 488 335 C 498 308, 502 288, 506 268"
              stroke="url(#grad-subtle-room)"
              strokeWidth={hoveredNode === 'room' ? "1.4" : "0.9"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-subtle-indigo)"
            />
            <circle cx="488" cy="335" r="1.5" fill="#5eead4" opacity="0.55" />
            {/* Flowing energy particle */}
            <circle r="1.5" fill="#c084fc" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 488 335 C 498 308, 502 288, 506 268')",
              animation: "flowParticleSubtle 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.9s",
            }} />
          </g>
        </svg>

        {/* ── HTML Nodes Layer ── */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          
          {/* ========================================================================= */}
          {/* ── CENTRAL CONNECTED CORE: Memory (left) & Relay (right) ─────────────── */}
          {/* ========================================================================= */}
          {/* Distance between Memory & Relay kept preserved */}
          <div className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] flex items-center gap-7 sm:gap-9 pointer-events-auto">
            
            {/* ── MEMORY CARD (Contextual Core - Refined Apple Glass Surface) ── */}
            <button
              type="button"
              onClick={() => handleLaunch('memory')}
              onMouseEnter={() => setHoveredNode('memory')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "w-[144px] sm:w-[154px] h-[128px] sm:h-[136px]",
                "rounded-[26px] p-3.5 sm:p-4",
                "flex flex-col items-center justify-center text-center",
                // Highly refined translucent glass surface, subtle backdrop blur, soft border
                "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl",
                "border border-purple-200/60 dark:border-purple-500/25",
                "shadow-[0_10px_30px_-6px_rgba(168,85,247,0.16),0_2px_6px_rgba(15,23,42,0.02)] dark:shadow-[0_10px_30px_-6px_rgba(168,85,247,0.25)]",
                "transition-all duration-300 cursor-pointer group outline-none",
                hoveredNode === 'memory' ? "scale-[1.03] -translate-y-0.5 shadow-[0_14px_36px_-4px_rgba(168,85,247,0.25)] border-purple-300/80" : "",
              ].join(" ")}
            >
              {/* 4-point curved intelligence spark icon matching reference */}
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-1 text-purple-600 dark:text-purple-300 group-hover:scale-105 transition-transform duration-200">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z" />
                </svg>
              </div>
              <span className="text-[14px] sm:text-[15px] font-semibold text-slate-900 dark:text-white tracking-[-0.01em]">
                Memory
              </span>
              <span className="text-[11px] sm:text-[11.5px] text-slate-500 dark:text-zinc-400 font-normal mt-0.5 leading-snug">
                Your team's<br />shared context
              </span>
            </button>

            {/* ── RELAY CARD (Connectivity Core - Refined Apple Glass Surface) ── */}
            <button
              type="button"
              onClick={() => handleLaunch('relay')}
              onMouseEnter={() => setHoveredNode('relay')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "w-[144px] sm:w-[154px] h-[128px] sm:h-[136px]",
                "rounded-[26px] p-3.5 sm:p-4",
                "flex flex-col items-center justify-center text-center",
                // Highly refined translucent glass surface, subtle backdrop blur, soft border
                "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl",
                "border border-blue-200/60 dark:border-blue-500/25",
                "shadow-[0_10px_30px_-6px_rgba(59,130,246,0.16),0_2px_6px_rgba(15,23,42,0.02)] dark:shadow-[0_10px_30px_-6px_rgba(59,130,246,0.25)]",
                "transition-all duration-300 cursor-pointer group outline-none",
                hoveredNode === 'relay' ? "scale-[1.03] -translate-y-0.5 shadow-[0_14px_36px_-4px_rgba(59,130,246,0.25)] border-blue-300/80" : "",
              ].join(" ")}
            >
              {/* Connection transfer icon matching reference */}
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-1 text-blue-600 dark:text-blue-300 group-hover:scale-105 transition-transform duration-200">
                <RelayIcon size={20} className="text-blue-600 dark:text-blue-300" strokeWidth={1.8} />
              </div>
              <span className="text-[14px] sm:text-[15px] font-semibold text-slate-900 dark:text-white tracking-[-0.01em]">
                Relay
              </span>
              <span className="text-[11px] sm:text-[11.5px] text-slate-500 dark:text-zinc-400 font-normal mt-0.5 leading-snug">
                Connects tools,<br />people and ideas
              </span>
            </button>

          </div>

          {/* ========================================================================= */}
          {/* ── PERIPHERAL TOOLS (Preserved secondary cards, wider horizontal reach) ─ */}
          {/* ========================================================================= */}

          {/* ── 1. Top Center: DOCS (Positioned closer to subtitle) ── */}
          <div className="absolute top-[4%] sm:top-[5%] left-[50%] -translate-x-[50%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('compose')}
              onMouseEnter={() => setHoveredNode('compose')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                "bg-white/85 dark:bg-[#18181b]/85 backdrop-blur-md",
                "border border-slate-200/50 dark:border-white/[0.07]",
                "shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] dark:shadow-none",
                "hover:bg-white dark:hover:bg-[#1f1f23] hover:border-slate-300 dark:hover:border-white/20",
                "hover:shadow-[0_6px_20px_-4px_rgba(15,23,42,0.08)] hover:-translate-y-0.5",
                "active:scale-[0.985] transition-all duration-200 cursor-pointer group text-left outline-none",
                hoveredNode === 'compose' ? "border-slate-300 dark:border-white/20 shadow-md" : "",
              ].join(" ")}
            >
              <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ComposeIcon size={16} strokeWidth={1.7} className="text-white" />
              </div>
              <div className="flex flex-col min-w-0 pr-1">
                <span className="text-[12.5px] font-semibold text-slate-800 dark:text-zinc-100 leading-tight">Docs</span>
                <span className="text-[10.5px] text-slate-400 dark:text-zinc-500 font-normal leading-tight mt-0.5">Write, organize, collaborate</span>
              </div>
            </button>
          </div>

          {/* ── 2. Upper Left: SHEETS (Expanded horizontally) ── */}
          <div className="absolute top-[14%] sm:top-[16%] left-[6%] sm:left-[8%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('sheet')}
              onMouseEnter={() => setHoveredNode('sheet')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                "bg-white/85 dark:bg-[#18181b]/85 backdrop-blur-md",
                "border border-slate-200/50 dark:border-white/[0.07]",
                "shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] dark:shadow-none",
                "hover:bg-white dark:hover:bg-[#1f1f23] hover:border-slate-300 dark:hover:border-white/20",
                "hover:shadow-[0_6px_20px_-4px_rgba(15,23,42,0.08)] hover:-translate-y-0.5",
                "active:scale-[0.985] transition-all duration-200 cursor-pointer group text-left outline-none",
                hoveredNode === 'sheet' ? "border-slate-300 dark:border-white/20 shadow-md" : "",
              ].join(" ")}
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <SheetIcon size={16} strokeWidth={1.7} className="text-white" />
              </div>
              <div className="flex flex-col min-w-0 pr-1">
                <span className="text-[12.5px] font-semibold text-slate-800 dark:text-zinc-100 leading-tight">Sheets</span>
                <span className="text-[10.5px] text-slate-400 dark:text-zinc-500 font-normal leading-tight mt-0.5">Analyze, visualize, plan</span>
              </div>
            </button>
          </div>

          {/* ── 3. Upper Right: DECK (Expanded horizontally) ── */}
          <div className="absolute top-[16%] sm:top-[18%] right-[6%] sm:right-[8%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('deck')}
              onMouseEnter={() => setHoveredNode('deck')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                "bg-white/85 dark:bg-[#18181b]/85 backdrop-blur-md",
                "border border-slate-200/50 dark:border-white/[0.07]",
                "shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] dark:shadow-none",
                "hover:bg-white dark:hover:bg-[#1f1f23] hover:border-slate-300 dark:hover:border-white/20",
                "hover:shadow-[0_6px_20px_-4px_rgba(15,23,42,0.08)] hover:-translate-y-0.5",
                "active:scale-[0.985] transition-all duration-200 cursor-pointer group text-left outline-none",
                hoveredNode === 'deck' ? "border-slate-300 dark:border-white/20 shadow-md" : "",
              ].join(" ")}
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <DeckIcon size={16} strokeWidth={1.7} className="text-white" />
              </div>
              <div className="flex flex-col min-w-0 pr-1">
                <span className="text-[12.5px] font-semibold text-slate-800 dark:text-zinc-100 leading-tight">Deck</span>
                <span className="text-[10.5px] text-slate-400 dark:text-zinc-500 font-normal leading-tight mt-0.5">Present, tell your story</span>
              </div>
            </button>
          </div>

          {/* ── 4. Left: IMPORT (Expanded horizontally) ── */}
          <div className="absolute top-[49%] -translate-y-[50%] left-[2%] sm:left-[4%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('omni-portal')}
              onMouseEnter={() => setHoveredNode('omni-portal')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                "bg-white/85 dark:bg-[#18181b]/85 backdrop-blur-md",
                "border border-slate-200/50 dark:border-white/[0.07]",
                "shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] dark:shadow-none",
                "hover:bg-white dark:hover:bg-[#1f1f23] hover:border-slate-300 dark:hover:border-white/20",
                "hover:shadow-[0_6px_20px_-4px_rgba(15,23,42,0.08)] hover:-translate-y-0.5",
                "active:scale-[0.985] transition-all duration-200 cursor-pointer group text-left outline-none",
                hoveredNode === 'omni-portal' ? "border-slate-300 dark:border-white/20 shadow-md" : "",
              ].join(" ")}
            >
              <div className="w-8 h-8 rounded-xl bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ImportPortalIcon size={16} strokeWidth={1.7} className="text-white" />
              </div>
              <div className="flex flex-col min-w-0 pr-1">
                <span className="text-[12.5px] font-semibold text-slate-800 dark:text-zinc-100 leading-tight">Import</span>
                <span className="text-[10.5px] text-slate-400 dark:text-zinc-500 font-normal leading-tight mt-0.5">Bring in any content</span>
              </div>
            </button>
          </div>

          {/* ── 5. Lower Right: WHITEBOARD (Expanded horizontally) ── */}
          <div className="absolute top-[59%] sm:top-[61%] right-[4%] sm:right-[6%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('whiteboard')}
              onMouseEnter={() => setHoveredNode('whiteboard')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                "bg-white/85 dark:bg-[#18181b]/85 backdrop-blur-md",
                "border border-slate-200/50 dark:border-white/[0.07]",
                "shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] dark:shadow-none",
                "hover:bg-white dark:hover:bg-[#1f1f23] hover:border-slate-300 dark:hover:border-white/20",
                "hover:shadow-[0_6px_20px_-4px_rgba(15,23,42,0.08)] hover:-translate-y-0.5",
                "active:scale-[0.985] transition-all duration-200 cursor-pointer group text-left outline-none",
                hoveredNode === 'whiteboard' ? "border-slate-300 dark:border-white/20 shadow-md" : "",
              ].join(" ")}
            >
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <WhiteboardIcon size={16} strokeWidth={1.7} className="text-white" />
              </div>
              <div className="flex flex-col min-w-0 pr-1">
                <span className="text-[12.5px] font-semibold text-slate-800 dark:text-zinc-100 leading-tight">Whiteboard</span>
                <span className="text-[10.5px] text-slate-400 dark:text-zinc-500 font-normal leading-tight mt-0.5">Brainstorm, create, iterate</span>
              </div>
            </button>
          </div>

          {/* ── 6. Lower Left/Bottom: ROOM ── */}
          <div className="absolute bottom-[7%] sm:bottom-[9%] left-[28%] sm:left-[32%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('room')}
              onMouseEnter={() => setHoveredNode('room')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                "bg-white/85 dark:bg-[#18181b]/85 backdrop-blur-md",
                "border border-slate-200/50 dark:border-white/[0.07]",
                "shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] dark:shadow-none",
                "hover:bg-white dark:hover:bg-[#1f1f23] hover:border-slate-300 dark:hover:border-white/20",
                "hover:shadow-[0_6px_20px_-4px_rgba(15,23,42,0.08)] hover:-translate-y-0.5",
                "active:scale-[0.985] transition-all duration-200 cursor-pointer group text-left outline-none",
                hoveredNode === 'room' ? "border-slate-300 dark:border-white/20 shadow-md" : "",
              ].join(" ")}
            >
              <div className="w-8 h-8 rounded-xl bg-teal-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <RoomIcon size={16} strokeWidth={1.7} className="text-white" />
              </div>
              <div className="flex flex-col min-w-0 pr-1">
                <span className="text-[12.5px] font-semibold text-slate-800 dark:text-zinc-100 leading-tight">Room</span>
                <span className="text-[10.5px] text-slate-400 dark:text-zinc-500 font-normal leading-tight mt-0.5">Meet, discuss, decide</span>
              </div>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
