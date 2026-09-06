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
 * - Subtle luminous horizontal bridge between Memory and Relay with breathing glow
 * - Peripheral satellite tools positioned radially around the core in balanced, organic harmony:
 *   - Docs: top center
 *   - Sheets: upper-left
 *   - Deck: upper-right
 *   - Import: left
 *   - Whiteboard: lower-right
 *   - Room: lower-left/bottom
 * - No dark dotted ellipse. Instead, ethereal, translucent orbital arcs with soft white/lavender gradients and tiny glowing nodes.
 * - Gentle curved connection paths with low opacity, subtle directional accents, and tiny flowing particles.
 * - Neutral glass-card resting state for all peripheral cards (no persistent purple borders!).
 * - Cards remain spatially fixed (no spinning/rotation).
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
    <div className="w-full relative select-none flex items-center justify-center my-2 sm:my-4">
      {/* ── Internal Keyframes for Fluid Particle Flow & Soft Bridge Breathing ── */}
      <style>{`
        @keyframes pulseBridge {
          0%, 100% { opacity: 0.45; }
          50% { opacity: 0.85; }
        }
        @keyframes flowParticle {
          0% { offset-distance: 0%; opacity: 0; }
          15% { opacity: 0.9; }
          85% { opacity: 0.9; }
          100% { offset-distance: 100%; opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse-bridge {
            animation: none !important;
          }
          circle[style*="offset-path"] {
            display: none !important;
          }
        }
      `}</style>

      {/* ── Outer Ecosystem Stage (Aspect 1000 x 530) ── */}
      <div className="w-full max-w-[1020px] h-[510px] sm:h-[540px] relative flex items-center justify-center overflow-visible">
        
        {/* ── Soft Atmospheric Background Illumination (subtle, pure Apple aesthetic) ── */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Subtle lavender/blue ambient glow */}
          <div className="w-[720px] h-[400px] rounded-[100%] bg-gradient-to-r from-blue-100/40 via-indigo-100/30 to-purple-100/40 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 blur-[85px] transform -translate-y-1 opacity-70" />
          {/* Soft core glow directly behind central pair */}
          <div className="w-[420px] h-[220px] rounded-full bg-gradient-to-r from-purple-200/35 to-blue-200/35 dark:from-purple-900/15 dark:to-blue-900/15 blur-[55px] opacity-60" />
        </div>

        {/* ── SVG Connection Network Layer (Calculated against a 1000 × 530 ViewBox) ── */}
        <svg
          viewBox="0 0 1000 530"
          className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
          fill="none"
        >
          <defs>
            {/* Extremely delicate arrowheads */}
            <marker
              id="arrow-subtle-purple"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="3.8"
              markerHeight="3.8"
              orient="auto-start-reverse"
            >
              <path d="M 1 2.5 L 6.5 5 L 1 7.5" fill="none" stroke="#a855f7" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
            </marker>

            <marker
              id="arrow-subtle-blue"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="3.8"
              markerHeight="3.8"
              orient="auto-start-reverse"
            >
              <path d="M 1 2.5 L 6.5 5 L 1 7.5" fill="none" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
            </marker>

            <marker
              id="arrow-subtle-indigo"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="3.8"
              markerHeight="3.8"
              orient="auto-start-reverse"
            >
              <path d="M 1 2.5 L 6.5 5 L 1 7.5" fill="none" stroke="#818cf8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
            </marker>

            {/* Soft, low-opacity linear gradients for paths */}
            <linearGradient id="grad-subtle-docs" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.6" />
            </linearGradient>

            <linearGradient id="grad-subtle-sheets" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.3" />
              <stop offset="60%" stopColor="#a5b4fc" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.65" />
            </linearGradient>

            <linearGradient id="grad-subtle-deck" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fdba74" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#c4b5fd" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.65" />
            </linearGradient>

            <linearGradient id="grad-subtle-import" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.65" />
            </linearGradient>

            <linearGradient id="grad-subtle-whiteboard" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.25" />
              <stop offset="70%" stopColor="#818cf8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.65" />
            </linearGradient>

            <linearGradient id="grad-subtle-room" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5eead4" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#a5b4fc" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.65" />
            </linearGradient>

            {/* Ethereal orbital ring gradients */}
            <linearGradient id="grad-orbit-primary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.28" />
              <stop offset="35%" stopColor="#818cf8" stopOpacity="0.38" />
              <stop offset="70%" stopColor="#93c5fd" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.22" />
            </linearGradient>

            <linearGradient id="grad-subtle-bridge" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#a5b4fc" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.75" />
            </linearGradient>

            {/* Delicate glow filter */}
            <filter id="soft-ethereal-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ── Ethereal Translucent Orbital Curves (NO dark dotted rings!) ── */}
          {/* Main sweeping outer orbital arc */}
          <path
            d="M 115 285 C 105 170, 240 85, 510 82 C 780 79, 915 160, 905 280 C 895 390, 755 465, 490 468 C 235 470, 125 390, 115 285"
            stroke="url(#grad-orbit-primary)"
            strokeWidth="1"
            fill="none"
            opacity="0.35"
          />

          {/* Secondary delicate sweeping arc connecting Deck & Whiteboard */}
          <path
            d="M 640 145 C 800 170, 930 235, 875 355 C 825 435, 680 475, 480 470"
            stroke="url(#grad-orbit-primary)"
            strokeWidth="0.85"
            fill="none"
            opacity="0.22"
          />

          {/* Occasional tiny luminous planetary nodes along the curves */}
          <circle cx="215" cy="148" r="1.5" fill="#a5b4fc" opacity="0.6" />
          <circle cx="850" cy="225" r="1.5" fill="#93c5fd" opacity="0.6" />
          <circle cx="340" cy="460" r="1.5" fill="#c084fc" opacity="0.5" />
          <circle cx="730" cy="455" r="1.5" fill="#a5b4fc" opacity="0.5" />

          {/* ── Central Memory ↔ Relay Interlink Bridge ── */}
          <g className="transition-opacity duration-300">
            {/* Luminous soft glow track */}
            <line
              x1="472"
              y1="265"
              x2="528"
              y2="265"
              stroke="url(#grad-subtle-bridge)"
              strokeWidth="3.5"
              opacity="0.35"
              filter="url(#soft-ethereal-glow)"
            />
            {/* Crisp hairline spine */}
            <line
              x1="472"
              y1="265"
              x2="528"
              y2="265"
              stroke="url(#grad-subtle-bridge)"
              strokeWidth="1.2"
              opacity="0.75"
            />
            {/* Left anchor node */}
            <circle cx="474" cy="265" r="1.8" fill="#c084fc" opacity="0.8" />
            {/* Right anchor node */}
            <circle cx="526" cy="265" r="1.8" fill="#93c5fd" opacity="0.8" />
            {/* Pulsating energy node in center */}
            <circle
              cx="500"
              cy="265"
              r="2.5"
              fill="#a5b4fc"
              filter="url(#soft-ethereal-glow)"
              className="animate-pulse-bridge"
            />
          </g>

          {/* ── 1. Top Center: Docs → Core ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'compose' ? 'opacity-100' : 'opacity-70'}`}>
            <path
              id="path-docs"
              d="M 503 162 C 503 195, 492 205, 488 220"
              stroke="url(#grad-subtle-docs)"
              strokeWidth={hoveredNode === 'compose' ? "1.6" : "1"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-subtle-purple)"
            />
            <circle cx="503" cy="162" r="1.8" fill="#93c5fd" opacity="0.7" />
            {/* Flowing energy particle */}
            <circle r="1.8" fill="#c084fc" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 503 162 C 503 195, 492 205, 488 220')",
              animation: "flowParticle 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite",
            }} />
          </g>

          {/* ── 2. Upper Left: Sheets → Memory ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'sheet' ? 'opacity-100' : 'opacity-70'}`}>
            <path
              id="path-sheets"
              d="M 345 178 C 370 205, 395 228, 418 238"
              stroke="url(#grad-subtle-sheets)"
              strokeWidth={hoveredNode === 'sheet' ? "1.6" : "1"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-subtle-purple)"
            />
            <circle cx="345" cy="178" r="1.8" fill="#6ee7b7" opacity="0.7" />
            {/* Flowing energy particle */}
            <circle r="1.8" fill="#a5b4fc" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 345 178 C 370 205, 395 228, 418 238')",
              animation: "flowParticle 4s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.6s",
            }} />
          </g>

          {/* ── 3. Upper Right: Deck → Relay ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'deck' ? 'opacity-100' : 'opacity-70'}`}>
            <path
              id="path-deck"
              d="M 700 198 C 665 215, 645 225, 630 235"
              stroke="url(#grad-subtle-deck)"
              strokeWidth={hoveredNode === 'deck' ? "1.6" : "1"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-subtle-blue)"
            />
            <circle cx="700" cy="198" r="1.8" fill="#fdba74" opacity="0.7" />
            {/* Flowing energy particle */}
            <circle r="1.8" fill="#93c5fd" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 700 198 C 665 215, 645 225, 630 235')",
              animation: "flowParticle 3.8s cubic-bezier(0.4, 0, 0.2, 1) infinite 1.2s",
            }} />
          </g>

          {/* ── 4. Mid Left: Import → Memory ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'omni-portal' ? 'opacity-100' : 'opacity-70'}`}>
            <path
              id="path-import"
              d="M 315 265 C 348 265, 375 265, 404 265"
              stroke="url(#grad-subtle-import)"
              strokeWidth={hoveredNode === 'omni-portal' ? "1.6" : "1"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-subtle-purple)"
            />
            <circle cx="315" cy="265" r="1.8" fill="#c084fc" opacity="0.7" />
            {/* Flowing energy particle */}
            <circle r="1.8" fill="#c084fc" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 315 265 C 348 265, 375 265, 404 265')",
              animation: "flowParticle 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.3s",
            }} />
          </g>

          {/* ── 5. Bottom Right: Whiteboard → Relay ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'whiteboard' ? 'opacity-100' : 'opacity-70'}`}>
            <path
              id="path-whiteboard"
              d="M 705 330 C 675 322, 652 310, 632 292"
              stroke="url(#grad-subtle-whiteboard)"
              strokeWidth={hoveredNode === 'whiteboard' ? "1.6" : "1"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-subtle-blue)"
            />
            <circle cx="705" cy="330" r="1.8" fill="#93c5fd" opacity="0.7" />
            {/* Flowing energy particle */}
            <circle r="1.8" fill="#93c5fd" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 705 330 C 675 322, 652 310, 632 292')",
              animation: "flowParticle 4.2s cubic-bezier(0.4, 0, 0.2, 1) infinite 1.8s",
            }} />
          </g>

          {/* ── 6. Bottom Center/Left: Room → Memory ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'room' ? 'opacity-100' : 'opacity-70'}`}>
            <path
              id="path-room"
              d="M 458 348 C 464 328, 465 312, 465 300"
              stroke="url(#grad-subtle-room)"
              strokeWidth={hoveredNode === 'room' ? "1.6" : "1"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-subtle-indigo)"
            />
            <circle cx="458" cy="348" r="1.8" fill="#5eead4" opacity="0.7" />
            {/* Flowing energy particle */}
            <circle r="1.8" fill="#c084fc" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 458 348 C 464 328, 465 312, 465 300')",
              animation: "flowParticle 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.9s",
            }} />
          </g>
        </svg>

        {/* ── HTML Nodes Layer ── */}
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
                "w-[144px] sm:w-[154px] h-[130px] sm:h-[138px]",
                "rounded-[26px] p-3.5 sm:p-4",
                "flex flex-col items-center justify-center text-center",
                // Soft purple/lavender glass glow
                "bg-gradient-to-b from-white/95 via-purple-50/80 to-white/95 dark:from-zinc-900/95 dark:via-purple-950/40 dark:to-zinc-900/95",
                "border border-purple-200/80 dark:border-purple-500/30",
                "shadow-[0_12px_32px_-8px_rgba(168,85,247,0.2),0_2px_6px_rgba(15,23,42,0.03)] dark:shadow-[0_12px_32px_-8px_rgba(168,85,247,0.3)]",
                "backdrop-blur-xl transition-all duration-300 cursor-pointer group outline-none",
                hoveredNode === 'memory' ? "scale-[1.03] -translate-y-1 shadow-[0_16px_36px_-6px_rgba(168,85,247,0.3)]" : "",
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

            {/* ── RELAY CARD (Connectivity Core) ── */}
            <button
              type="button"
              onClick={() => handleLaunch('relay')}
              onMouseEnter={() => setHoveredNode('relay')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "w-[144px] sm:w-[154px] h-[130px] sm:h-[138px]",
                "rounded-[26px] p-3.5 sm:p-4",
                "flex flex-col items-center justify-center text-center",
                // Soft blue glass glow
                "bg-gradient-to-b from-white/95 via-blue-50/80 to-white/95 dark:from-zinc-900/95 dark:via-blue-950/40 dark:to-zinc-900/95",
                "border border-blue-200/80 dark:border-blue-500/30",
                "shadow-[0_12px_32px_-8px_rgba(59,130,246,0.2),0_2px_6px_rgba(15,23,42,0.03)] dark:shadow-[0_12px_32px_-8px_rgba(59,130,246,0.3)]",
                "backdrop-blur-xl transition-all duration-300 cursor-pointer group outline-none",
                hoveredNode === 'relay' ? "scale-[1.03] -translate-y-1 shadow-[0_16px_36px_-6px_rgba(59,130,246,0.3)]" : "",
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
          {/* ── PERIPHERAL TOOLS (Quieter secondary cards, neutral resting glass) ─── */}
          {/* ========================================================================= */}

          {/* ── 1. Top Center: DOCS ── */}
          <div className="absolute top-[8%] sm:top-[9%] left-[50%] -translate-x-[50%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('compose')}
              onMouseEnter={() => setHoveredNode('compose')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                "bg-white/90 dark:bg-[#18181b]/90 backdrop-blur-md",
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

          {/* ── 2. Upper Left: SHEETS (Neutral resting glass, no persistent purple border!) ── */}
          <div className="absolute top-[17%] sm:top-[19%] left-[9%] sm:left-[13%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('sheet')}
              onMouseEnter={() => setHoveredNode('sheet')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                "bg-white/90 dark:bg-[#18181b]/90 backdrop-blur-md",
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

          {/* ── 3. Upper Right: DECK ── */}
          <div className="absolute top-[19%] sm:top-[21%] right-[9%] sm:right-[12%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('deck')}
              onMouseEnter={() => setHoveredNode('deck')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                "bg-white/90 dark:bg-[#18181b]/90 backdrop-blur-md",
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

          {/* ── 4. Left: IMPORT ── */}
          <div className="absolute top-[49%] -translate-y-[50%] left-[5%] sm:left-[9%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('omni-portal')}
              onMouseEnter={() => setHoveredNode('omni-portal')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                "bg-white/90 dark:bg-[#18181b]/90 backdrop-blur-md",
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

          {/* ── 5. Lower Right: WHITEBOARD ── */}
          <div className="absolute top-[59%] sm:top-[61%] right-[7%] sm:right-[11%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('whiteboard')}
              onMouseEnter={() => setHoveredNode('whiteboard')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                "bg-white/90 dark:bg-[#18181b]/90 backdrop-blur-md",
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

          {/* ── 6. Lower Left/Bottom: ROOM (Neutral resting glass, no persistent purple border!) ── */}
          <div className="absolute bottom-[9%] sm:bottom-[11%] left-[28%] sm:left-[32%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('room')}
              onMouseEnter={() => setHoveredNode('room')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                "bg-white/90 dark:bg-[#18181b]/90 backdrop-blur-md",
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
