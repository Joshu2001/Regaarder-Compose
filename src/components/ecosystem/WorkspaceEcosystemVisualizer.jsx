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
 * FINAL VISUAL POLISH PASS (Faithfully matching reference):
 * 1. Ecosystem scale: 12-15% wider horizontal footprint (1200 × 480 viewBox).
 * 2. Premium glass-like cards: translucent white surfaces, backdrop-blur-2xl, subtle inner highlights,
 *    delicate 1px translucent borders, soft luminous outer glows, and subtle shadows.
 * 3. Atmospheric depth: Multi-layered soft glow field with pale blue illumination, subtle lavender
 *    glow around Memory, subtle blue glow around Relay, and faint white bloom around the center.
 * 4. Luminous connection paths: 15% increased visibility with thin, elegant curved gradients, tiny luminous
 *    nodes, and delicate directional accents (Sheets → Memory, Docs → Memory, Deck → Relay, Import → Memory,
 *    Relay → Whiteboard, Room → Memory).
 * 5. Memory + Relay prominence: 6-8% larger central core (162px × 142px) with distinct lavender and sky-blue glass.
 * 6. Luminous stream bridge between Memory and Relay communicating context & connectivity.
 * 7. Subtle spatial depth: faint orbital sweeps and tiny glowing celestial nodes floating in light.
 * 8. Zero continuous card rotation; spatially anchored with subliminal animated particles.
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
          0%, 100% { opacity: 0.65; filter: drop-shadow(0 0 4px rgba(168,85,247,0.35)); }
          50% { opacity: 0.95; filter: drop-shadow(0 0 10px rgba(99,102,241,0.65)); }
        }
        @keyframes flowParticleSubtle {
          0% { offset-distance: 0%; opacity: 0; }
          15% { opacity: 0.85; }
          85% { opacity: 0.85; }
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

      {/* ── Outer Ecosystem Stage (Aspect 1200 x 480: Scaled horizontally by ~12-15%) ── */}
      <div className="w-full max-w-[1220px] h-[460px] sm:h-[485px] relative flex items-center justify-center overflow-visible">
        
        {/* ── Soft Atmospheric Background Illumination (Pale blue, lavender, and faint white center bloom) ── */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Pale blue / soft azure ambient field */}
          <div className="w-[880px] h-[370px] rounded-[100%] bg-gradient-to-r from-blue-100/45 via-indigo-50/30 to-purple-100/40 dark:from-blue-950/20 dark:via-indigo-950/15 dark:to-purple-950/20 blur-[95px] transform -translate-y-1 opacity-80" />
          {/* Subtle lavender glow specifically behind Memory (left center) */}
          <div className="absolute w-[320px] h-[220px] -translate-x-20 rounded-full bg-purple-200/40 dark:bg-purple-900/20 blur-[60px] opacity-75" />
          {/* Subtle blue glow specifically behind Relay (right center) */}
          <div className="absolute w-[320px] h-[220px] translate-x-20 rounded-full bg-blue-200/40 dark:bg-blue-900/20 blur-[60px] opacity-75" />
          {/* Faint white center bloom floating behind the ecosystem core */}
          <div className="w-[480px] h-[220px] rounded-full bg-white/70 dark:bg-white/[0.03] blur-[45px] opacity-90" />
        </div>

        {/* ── SVG Connection Network Layer (Calculated against a 1200 × 480 ViewBox) ── */}
        <svg
          viewBox="0 0 1200 480"
          className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
          fill="none"
        >
          <defs>
            {/* Extremely delicate arrowheads - perfectly tuned visibility */}
            <marker
              id="arrow-subtle-purple"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="3.4"
              markerHeight="3.4"
              orient="auto-start-reverse"
            >
              <path d="M 1 2.5 L 6.5 5 L 1 7.5" fill="none" stroke="#a855f7" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
            </marker>

            <marker
              id="arrow-subtle-blue"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="3.4"
              markerHeight="3.4"
              orient="auto-start-reverse"
            >
              <path d="M 1 2.5 L 6.5 5 L 1 7.5" fill="none" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
            </marker>

            <marker
              id="arrow-subtle-indigo"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="3.4"
              markerHeight="3.4"
              orient="auto-start-reverse"
            >
              <path d="M 1 2.5 L 6.5 5 L 1 7.5" fill="none" stroke="#818cf8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
            </marker>

            {/* Soft, low-opacity linear gradients for paths (tuned +15% clearer than previous pass) */}
            <linearGradient id="grad-subtle-docs" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.6" />
            </linearGradient>

            <linearGradient id="grad-subtle-sheets" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.28" />
              <stop offset="60%" stopColor="#a5b4fc" stopOpacity="0.48" />
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

            <linearGradient id="grad-subtle-whiteboard" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.65" />
              <stop offset="40%" stopColor="#818cf8" stopOpacity="0.48" />
              <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.25" />
            </linearGradient>

            <linearGradient id="grad-subtle-room" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5eead4" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#a5b4fc" stopOpacity="0.48" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.65" />
            </linearGradient>

            {/* Ethereal orbital ring gradients */}
            <linearGradient id="grad-orbit-primary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.26" />
              <stop offset="35%" stopColor="#818cf8" stopOpacity="0.35" />
              <stop offset="70%" stopColor="#93c5fd" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.22" />
            </linearGradient>

            {/* Luminous Core Interlink Bridge Gradient */}
            <linearGradient id="grad-luminous-bridge" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#a5b4fc" stopOpacity="1" />
              <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.9" />
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

          {/* ── Ethereal Translucent Orbital Curves (Spatial depth floating in light) ── */}
          {/* Main sweeping outer orbital arc */}
          <path
            d="M 90 240 C 80 135, 250 50, 600 48 C 950 45, 1120 125, 1110 235 C 1100 345, 920 430, 580 432 C 240 435, 100 345, 90 240"
            stroke="url(#grad-orbit-primary)"
            strokeWidth="0.95"
            fill="none"
            opacity="0.32"
          />

          {/* Secondary delicate sweeping arc connecting Deck & Whiteboard */}
          <path
            d="M 780 115 C 970 140, 1130 205, 1060 320 C 1005 398, 830 440, 580 435"
            stroke="url(#grad-orbit-primary)"
            strokeWidth="0.8"
            fill="none"
            opacity="0.22"
          />

          {/* Occasional tiny luminous celestial nodes along the curves */}
          <circle cx="215" cy="115" r="1.5" fill="#a5b4fc" opacity="0.55" />
          <circle cx="1025" cy="180" r="1.5" fill="#93c5fd" opacity="0.55" />
          <circle cx="410" cy="425" r="1.5" fill="#c084fc" opacity="0.5" />
          <circle cx="880" cy="420" r="1.5" fill="#a5b4fc" opacity="0.5" />

          {/* ── STRENGTHENED MEMORY ↔ RELAY LUMINOUS CONNECTION ── */}
          {/* Communicates: Memory = shared context ↔ Relay = connectivity */}
          <g className="transition-opacity duration-300">
            {/* Luminous wide atmospheric aura track */}
            <line
              x1="570"
              y1="240"
              x2="630"
              y2="240"
              stroke="url(#grad-luminous-bridge)"
              strokeWidth="6"
              opacity="0.5"
              filter="url(#bridge-glow)"
            />
            {/* Inner radiant beam */}
            <line
              x1="570"
              y1="240"
              x2="630"
              y2="240"
              stroke="url(#grad-luminous-bridge)"
              strokeWidth="2.2"
              opacity="0.85"
              filter="url(#soft-ethereal-glow)"
            />
            {/* Crisp central spine */}
            <line
              x1="570"
              y1="240"
              x2="630"
              y2="240"
              stroke="#ffffff"
              strokeWidth="1.2"
              opacity="0.95"
            />
            {/* Left anchor node (Memory shared context connection) */}
            <circle cx="572" cy="240" r="2.2" fill="#c084fc" opacity="0.95" />
            {/* Right anchor node (Relay connectivity connection) */}
            <circle cx="628" cy="240" r="2.2" fill="#93c5fd" opacity="0.95" />
            {/* Pulsating energy node in center */}
            <circle
              cx="600"
              cy="240"
              r="3.2"
              fill="#ffffff"
              filter="url(#bridge-glow)"
              className="animate-pulse-bridge-luminous"
            />
            <circle
              cx="600"
              cy="240"
              r="2"
              fill="#a5b4fc"
            />
          </g>

          {/* ── 1. Top Center: Docs → Memory ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'compose' ? 'opacity-100' : 'opacity-75'}`}>
            <path
              id="path-docs"
              d="M 600 120 C 600 160, 588 180, 584 198"
              stroke="url(#grad-subtle-docs)"
              strokeWidth={hoveredNode === 'compose' ? "1.5" : "1"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-subtle-purple)"
            />
            <circle cx="600" cy="120" r="1.6" fill="#93c5fd" opacity="0.65" />
            {/* Flowing energy particle */}
            <circle r="1.6" fill="#c084fc" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 600 120 C 600 160, 588 180, 584 198')",
              animation: "flowParticleSubtle 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite",
            }} />
          </g>

          {/* ── 2. Upper Left: Sheets → Memory (Directional flow into Memory) ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'sheet' ? 'opacity-100' : 'opacity-75'}`}>
            <path
              id="path-sheets"
              d="M 360 145 C 410 180, 455 202, 502 212"
              stroke="url(#grad-subtle-sheets)"
              strokeWidth={hoveredNode === 'sheet' ? "1.5" : "1"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-subtle-purple)"
            />
            <circle cx="360" cy="145" r="1.6" fill="#6ee7b7" opacity="0.65" />
            {/* Flowing energy particle */}
            <circle r="1.6" fill="#a5b4fc" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 360 145 C 410 180, 455 202, 502 212')",
              animation: "flowParticleSubtle 4s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.6s",
            }} />
          </g>

          {/* ── 3. Upper Right: Deck → Relay (Directional flow into Relay) ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'deck' ? 'opacity-100' : 'opacity-75'}`}>
            <path
              id="path-deck"
              d="M 840 162 C 790 188, 755 202, 705 212"
              stroke="url(#grad-subtle-deck)"
              strokeWidth={hoveredNode === 'deck' ? "1.5" : "1"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-subtle-blue)"
            />
            <circle cx="840" cy="162" r="1.6" fill="#fdba74" opacity="0.65" />
            {/* Flowing energy particle */}
            <circle r="1.6" fill="#93c5fd" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 840 162 C 790 188, 755 202, 705 212')",
              animation: "flowParticleSubtle 3.8s cubic-bezier(0.4, 0, 0.2, 1) infinite 1.2s",
            }} />
          </g>

          {/* ── 4. Mid Left: Import → Memory (Directional flow into Memory) ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'omni-portal' ? 'opacity-100' : 'opacity-75'}`}>
            <path
              id="path-import"
              d="M 305 240 C 370 240, 430 240, 488 240"
              stroke="url(#grad-subtle-import)"
              strokeWidth={hoveredNode === 'omni-portal' ? "1.5" : "1"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-subtle-purple)"
            />
            <circle cx="305" cy="240" r="1.6" fill="#c084fc" opacity="0.65" />
            {/* Flowing energy particle */}
            <circle r="1.6" fill="#c084fc" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 305 240 C 370 240, 430 240, 488 240')",
              animation: "flowParticleSubtle 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.3s",
            }} />
          </g>

          {/* ── 5. Lower Right: Relay → Whiteboard (Directional flow outward to Whiteboard) ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'whiteboard' ? 'opacity-100' : 'opacity-75'}`}>
            <path
              id="path-whiteboard"
              d="M 710 262 C 770 280, 810 298, 868 312"
              stroke="url(#grad-subtle-whiteboard)"
              strokeWidth={hoveredNode === 'whiteboard' ? "1.5" : "1"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-subtle-blue)"
            />
            <circle cx="710" cy="262" r="1.6" fill="#60a5fa" opacity="0.65" />
            {/* Flowing energy particle */}
            <circle r="1.6" fill="#93c5fd" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 710 262 C 770 280, 810 298, 868 312')",
              animation: "flowParticleSubtle 4.2s cubic-bezier(0.4, 0, 0.2, 1) infinite 1.8s",
            }} />
          </g>

          {/* ── 6. Lower Left/Bottom: Room → Memory (Directional flow into Memory) ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'room' ? 'opacity-100' : 'opacity-75'}`}>
            <path
              id="path-room"
              d="M 532 342 C 544 314, 550 292, 554 272"
              stroke="url(#grad-subtle-room)"
              strokeWidth={hoveredNode === 'room' ? "1.5" : "1"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-subtle-indigo)"
            />
            <circle cx="532" cy="342" r="1.6" fill="#5eead4" opacity="0.65" />
            {/* Flowing energy particle */}
            <circle r="1.6" fill="#c084fc" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 532 342 C 544 314, 550 292, 554 272')",
              animation: "flowParticleSubtle 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.9s",
            }} />
          </g>
        </svg>

        {/* ── HTML Nodes Layer ── */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          
          {/* ========================================================================= */}
          {/* ── CENTRAL CONNECTED CORE: Memory (left) & Relay (right) ─────────────── */}
          {/* Sized 6-8% larger (162px × 142px) with premium Apple glass depth        ── */}
          {/* ========================================================================= */}
          <div className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] flex items-center gap-7 sm:gap-9 pointer-events-auto">
            
            {/* ── MEMORY CARD (Contextual Core - Luminous Lavender Glass) ── */}
            <button
              type="button"
              onClick={() => handleLaunch('memory')}
              onMouseEnter={() => setHoveredNode('memory')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "w-[152px] sm:w-[164px] h-[134px] sm:h-[144px]",
                "rounded-[28px] p-4",
                "flex flex-col items-center justify-center text-center",
                // Translucent white glass surface, strong backdrop blur, subtle inner highlight
                "bg-white/75 dark:bg-zinc-900/75 backdrop-blur-2xl",
                "border border-purple-200/70 dark:border-purple-500/30",
                "shadow-[0_12px_36px_-6px_rgba(168,85,247,0.22),0_1px_2px_rgba(255,255,255,0.9)_inset,0_2px_8px_rgba(15,23,42,0.03)] dark:shadow-[0_12px_36px_-6px_rgba(168,85,247,0.35),0_1px_2px_rgba(255,255,255,0.1)_inset]",
                "transition-all duration-300 cursor-pointer group outline-none",
                hoveredNode === 'memory' ? "scale-[1.03] -translate-y-1 shadow-[0_16px_40px_-4px_rgba(168,85,247,0.32)] border-purple-300" : "",
              ].join(" ")}
            >
              {/* 4-point curved intelligence spark icon matching reference */}
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-1 text-purple-600 dark:text-purple-300 group-hover:scale-105 transition-transform duration-200">
                <svg width="23" height="23" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z" />
                </svg>
              </div>
              <span className="text-[14.5px] sm:text-[15.5px] font-semibold text-slate-900 dark:text-white tracking-[-0.01em]">
                Memory
              </span>
              <span className="text-[11.5px] sm:text-[12px] text-slate-500 dark:text-zinc-400 font-normal mt-0.5 leading-snug">
                Your team's<br />shared context
              </span>
            </button>

            {/* ── RELAY CARD (Connectivity Core - Luminous Sky-Blue Glass) ── */}
            <button
              type="button"
              onClick={() => handleLaunch('relay')}
              onMouseEnter={() => setHoveredNode('relay')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "w-[152px] sm:w-[164px] h-[134px] sm:h-[144px]",
                "rounded-[28px] p-4",
                "flex flex-col items-center justify-center text-center",
                // Translucent white glass surface, strong backdrop blur, subtle inner highlight
                "bg-white/75 dark:bg-zinc-900/75 backdrop-blur-2xl",
                "border border-blue-200/70 dark:border-blue-500/30",
                "shadow-[0_12px_36px_-6px_rgba(59,130,246,0.22),0_1px_2px_rgba(255,255,255,0.9)_inset,0_2px_8px_rgba(15,23,42,0.03)] dark:shadow-[0_12px_36px_-6px_rgba(59,130,246,0.35),0_1px_2px_rgba(255,255,255,0.1)_inset]",
                "transition-all duration-300 cursor-pointer group outline-none",
                hoveredNode === 'relay' ? "scale-[1.03] -translate-y-1 shadow-[0_16px_40px_-4px_rgba(59,130,246,0.32)] border-blue-300" : "",
              ].join(" ")}
            >
              {/* Connection transfer icon matching reference */}
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-1 text-blue-600 dark:text-blue-300 group-hover:scale-105 transition-transform duration-200">
                <RelayIcon size={21} className="text-blue-600 dark:text-blue-300" strokeWidth={1.8} />
              </div>
              <span className="text-[14.5px] sm:text-[15.5px] font-semibold text-slate-900 dark:text-white tracking-[-0.01em]">
                Relay
              </span>
              <span className="text-[11.5px] sm:text-[12px] text-slate-500 dark:text-zinc-400 font-normal mt-0.5 leading-snug">
                Connects tools,<br />people and ideas
              </span>
            </button>

          </div>

          {/* ========================================================================= */}
          {/* ── PERIPHERAL TOOLS (Translucent Glass Cards, Expansive Horizontal Field) ─ */}
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
                // Translucent white glass surface with subtle inner highlight
                "bg-white/75 dark:bg-[#18181b]/75 backdrop-blur-xl",
                "border border-white/80 dark:border-white/[0.1] ring-1 ring-slate-200/50 dark:ring-transparent",
                "shadow-[0_4px_16px_-2px_rgba(15,23,42,0.04),0_1px_1px_rgba(255,255,255,0.9)_inset] dark:shadow-[0_4px_16px_-2px_rgba(0,0,0,0.3)]",
                "hover:bg-white/90 dark:hover:bg-[#1f1f23]/90 hover:border-slate-300 dark:hover:border-white/20",
                "hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.08),0_1px_1px_rgba(255,255,255,0.9)_inset] hover:-translate-y-0.5",
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

          {/* ── 2. Upper Left: SHEETS (Expanded horizontally, translucent glass) ── */}
          <div className="absolute top-[14%] sm:top-[16%] left-[6%] sm:left-[8%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('sheet')}
              onMouseEnter={() => setHoveredNode('sheet')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                // Translucent white glass surface with subtle inner highlight
                "bg-white/75 dark:bg-[#18181b]/75 backdrop-blur-xl",
                "border border-white/80 dark:border-white/[0.1] ring-1 ring-slate-200/50 dark:ring-transparent",
                "shadow-[0_4px_16px_-2px_rgba(15,23,42,0.04),0_1px_1px_rgba(255,255,255,0.9)_inset] dark:shadow-[0_4px_16px_-2px_rgba(0,0,0,0.3)]",
                "hover:bg-white/90 dark:hover:bg-[#1f1f23]/90 hover:border-slate-300 dark:hover:border-white/20",
                "hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.08),0_1px_1px_rgba(255,255,255,0.9)_inset] hover:-translate-y-0.5",
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

          {/* ── 3. Upper Right: DECK (Expanded horizontally, translucent glass) ── */}
          <div className="absolute top-[16%] sm:top-[18%] right-[6%] sm:right-[8%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('deck')}
              onMouseEnter={() => setHoveredNode('deck')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                // Translucent white glass surface with subtle inner highlight
                "bg-white/75 dark:bg-[#18181b]/75 backdrop-blur-xl",
                "border border-white/80 dark:border-white/[0.1] ring-1 ring-slate-200/50 dark:ring-transparent",
                "shadow-[0_4px_16px_-2px_rgba(15,23,42,0.04),0_1px_1px_rgba(255,255,255,0.9)_inset] dark:shadow-[0_4px_16px_-2px_rgba(0,0,0,0.3)]",
                "hover:bg-white/90 dark:hover:bg-[#1f1f23]/90 hover:border-slate-300 dark:hover:border-white/20",
                "hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.08),0_1px_1px_rgba(255,255,255,0.9)_inset] hover:-translate-y-0.5",
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

          {/* ── 4. Left: IMPORT (Expanded horizontally, translucent glass) ── */}
          <div className="absolute top-[49%] -translate-y-[50%] left-[2%] sm:left-[4%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('omni-portal')}
              onMouseEnter={() => setHoveredNode('omni-portal')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                // Translucent white glass surface with subtle inner highlight
                "bg-white/75 dark:bg-[#18181b]/75 backdrop-blur-xl",
                "border border-white/80 dark:border-white/[0.1] ring-1 ring-slate-200/50 dark:ring-transparent",
                "shadow-[0_4px_16px_-2px_rgba(15,23,42,0.04),0_1px_1px_rgba(255,255,255,0.9)_inset] dark:shadow-[0_4px_16px_-2px_rgba(0,0,0,0.3)]",
                "hover:bg-white/90 dark:hover:bg-[#1f1f23]/90 hover:border-slate-300 dark:hover:border-white/20",
                "hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.08),0_1px_1px_rgba(255,255,255,0.9)_inset] hover:-translate-y-0.5",
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

          {/* ── 5. Lower Right: WHITEBOARD (Expanded horizontally, translucent glass) ── */}
          <div className="absolute top-[59%] sm:top-[61%] right-[4%] sm:right-[6%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('whiteboard')}
              onMouseEnter={() => setHoveredNode('whiteboard')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                // Translucent white glass surface with subtle inner highlight
                "bg-white/75 dark:bg-[#18181b]/75 backdrop-blur-xl",
                "border border-white/80 dark:border-white/[0.1] ring-1 ring-slate-200/50 dark:ring-transparent",
                "shadow-[0_4px_16px_-2px_rgba(15,23,42,0.04),0_1px_1px_rgba(255,255,255,0.9)_inset] dark:shadow-[0_4px_16px_-2px_rgba(0,0,0,0.3)]",
                "hover:bg-white/90 dark:hover:bg-[#1f1f23]/90 hover:border-slate-300 dark:hover:border-white/20",
                "hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.08),0_1px_1px_rgba(255,255,255,0.9)_inset] hover:-translate-y-0.5",
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

          {/* ── 6. Lower Left/Bottom: ROOM (Translucent glass) ── */}
          <div className="absolute bottom-[7%] sm:bottom-[9%] left-[28%] sm:left-[32%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('room')}
              onMouseEnter={() => setHoveredNode('room')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                // Translucent white glass surface with subtle inner highlight
                "bg-white/75 dark:bg-[#18181b]/75 backdrop-blur-xl",
                "border border-white/80 dark:border-white/[0.1] ring-1 ring-slate-200/50 dark:ring-transparent",
                "shadow-[0_4px_16px_-2px_rgba(15,23,42,0.04),0_1px_1px_rgba(255,255,255,0.9)_inset] dark:shadow-[0_4px_16px_-2px_rgba(0,0,0,0.3)]",
                "hover:bg-white/90 dark:hover:bg-[#1f1f23]/90 hover:border-slate-300 dark:hover:border-white/20",
                "hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.08),0_1px_1px_rgba(255,255,255,0.9)_inset] hover:-translate-y-0.5",
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
