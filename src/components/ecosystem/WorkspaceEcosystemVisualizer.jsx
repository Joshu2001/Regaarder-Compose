import React, { useState } from 'react';
import {
  ComposeIcon,
  SheetIcon,
  DeckIcon,
  ImportPortalIcon,
  WhiteboardIcon,
  RoomIcon,
  MemoryIcon,
  RelayIcon,
} from '../RegaarderProductIcons';

/**
 * WorkspaceEcosystemVisualizer
 * 
 * FINAL REFINEMENT PASS — MATCH REFERENCE IMAGE:
 * 1. Compressed horizontal ecosystem: Reduced overall horizontal radius by ~12-15%,
 *    bringing peripheral cards (Sheets, Import, Deck, Whiteboard) inward toward Memory + Relay.
 * 2. Breathing room: Perfectly aligned with hero subtitle (~30px breathing room), keeping
 *    Recent Work naturally visible above the bottom fold.
 * 3. Translucent glass Memory + Relay: Stronger backdrop blur (backdrop-blur-2xl), translucent
 *    surfaces, inner highlights, delicate 1px borders, and soft light diffusion (no saturated neon).
 * 4. Refined peripheral cards: Subtle 1px border, inner highlight, quiet shadows, Apple glass depth.
 * 5. Organic connection paths: Precise mathematical anchors to card boundaries, subtle flowing
 *    gradients, delicate markers (Sheets → Memory, Import → Memory, Docs → Memory, Deck → Relay,
 *    Relay → Whiteboard, Room → Memory).
 * 6. Atmospheric background: Soft central light diffusion around Memory + Relay, clean canvas.
 * 7. Zero continuous rotation: Spatial anchoring with subtle fluid energy particles.
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
    <div className="w-full relative select-none flex items-center justify-center my-0">
      {/* ── Internal Keyframes for Fluid Particle Flow & Soft Bridge Breathing ── */}
      <style>{`
        @keyframes pulseBridgeLuminous {
          0%, 100% { opacity: 0.65; filter: drop-shadow(0 0 4px rgba(168,85,247,0.3)); }
          50% { opacity: 0.95; filter: drop-shadow(0 0 8px rgba(99,102,241,0.55)); }
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

      {/* ── Outer Ecosystem Stage (Aspect 1060 x 415: Compact single-viewport height) ── */}
      <div className="w-full max-w-[1060px] h-[395px] sm:h-[415px] relative flex items-center justify-center overflow-visible">
        
        {/* ── Soft Atmospheric Background Illumination (Clean canvas, luminous soft diffusion) ── */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Pale soft ambient field */}
          <div className="w-[820px] h-[300px] rounded-[100%] bg-gradient-to-r from-blue-100/40 via-indigo-50/30 to-purple-100/40 dark:from-blue-950/20 dark:via-indigo-950/15 dark:to-purple-950/20 blur-[85px] transform -translate-y-1 opacity-85" />
          {/* Luminous lavender glow specifically behind Memory (left center) */}
          <div className="absolute w-[300px] h-[210px] -translate-x-16 rounded-full bg-purple-400/35 dark:bg-purple-900/30 blur-[60px] opacity-85" />
          {/* Luminous blue glow specifically behind Relay (right center) */}
          <div className="absolute w-[300px] h-[210px] translate-x-16 rounded-full bg-sky-400/35 dark:bg-blue-900/30 blur-[60px] opacity-85" />
          {/* Faint white center bloom floating behind the ecosystem core */}
          <div className="w-[440px] h-[190px] rounded-full bg-white/80 dark:bg-white/[0.05] blur-[42px] opacity-90" />
        </div>

        {/* ── SVG Connection Network Layer (Calculated against a 1060 × 415 ViewBox) ── */}
        <svg
          viewBox="0 0 1060 415"
          className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
          fill="none"
        >
          <defs>
            {/* Directional arrowheads matching reference line weights */}
            <marker
              id="arrow-subtle-purple"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="3.6"
              markerHeight="3.6"
              orient="auto-start-reverse"
            >
              <path d="M 1 2.5 L 6.5 5 L 1 7.5" fill="none" stroke="#a855f7" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
            </marker>

            <marker
              id="arrow-subtle-blue"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="3.6"
              markerHeight="3.6"
              orient="auto-start-reverse"
            >
              <path d="M 1 2.5 L 6.5 5 L 1 7.5" fill="none" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
            </marker>

            <marker
              id="arrow-subtle-indigo"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="3.6"
              markerHeight="3.6"
              orient="auto-start-reverse"
            >
              <path d="M 1 2.5 L 6.5 5 L 1 7.5" fill="none" stroke="#818cf8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
            </marker>

            {/* Vibrant, smooth linear gradients for connection paths */}
            <linearGradient id="grad-subtle-docs" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.75" />
            </linearGradient>

            <linearGradient id="grad-subtle-sheets" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#a5b4fc" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="grad-subtle-deck" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fdba74" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#c4b5fd" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="grad-subtle-import" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="grad-subtle-whiteboard" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#818cf8" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.4" />
            </linearGradient>

            <linearGradient id="grad-subtle-room" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5eead4" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#a5b4fc" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.8" />
            </linearGradient>

            {/* Radiant orbital ring gradients matching Reference Image 1 */}
            <linearGradient id="grad-orbit-primary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.6" />
              <stop offset="35%" stopColor="#818cf8" stopOpacity="0.75" />
              <stop offset="70%" stopColor="#60a5fa" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.6" />
            </linearGradient>

            <linearGradient id="grad-orbit-glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#818cf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.3" />
            </linearGradient>

            {/* Luminous Core Interlink Bridge Gradient */}
            <linearGradient id="grad-luminous-bridge" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#a5b4fc" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.85" />
            </linearGradient>

            {/* Delicate glow filter */}
            <filter id="soft-ethereal-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Bridge Glow Filter */}
            <filter id="bridge-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ── Ethereal Translucent Orbital Curves (Prominent glass cosmic track matching Reference Image 1) ── */}
          {/* Ambient soft glow aura track */}
          <path
            d="M 80 208 C 70 115, 210 38, 530 36 C 850 34, 990 105, 980 208 C 970 310, 820 378, 530 380 C 240 382, 90 310, 80 208"
            stroke="url(#grad-orbit-glow)"
            strokeWidth="3.6"
            fill="none"
            filter="url(#soft-ethereal-glow)"
            opacity="0.55"
          />

          {/* Crisp, radiant primary orbital track */}
          <path
            d="M 80 208 C 70 115, 210 38, 530 36 C 850 34, 990 105, 980 208 C 970 310, 820 378, 530 380 C 240 382, 90 310, 80 208"
            stroke="url(#grad-orbit-primary)"
            strokeWidth="1.5"
            fill="none"
            opacity="0.6"
          />

          {/* Secondary delicate sweeping arc connecting Deck & Whiteboard */}
          <path
            d="M 680 95 C 850 118, 990 178, 930 278 C 880 345, 730 382, 530 380"
            stroke="url(#grad-orbit-primary)"
            strokeWidth="1.1"
            fill="none"
            opacity="0.4"
          />

          {/* Glowing celestial nodes along the orbital curves */}
          <circle cx="190" cy="98" r="2.2" fill="#a5b4fc" opacity="0.8" filter="url(#soft-ethereal-glow)" />
          <circle cx="190" cy="98" r="1.1" fill="#ffffff" opacity="0.95" />
          <circle cx="905" cy="155" r="2.2" fill="#93c5fd" opacity="0.8" filter="url(#soft-ethereal-glow)" />
          <circle cx="905" cy="155" r="1.1" fill="#ffffff" opacity="0.95" />
          <circle cx="365" cy="372" r="2.2" fill="#c084fc" opacity="0.8" filter="url(#soft-ethereal-glow)" />
          <circle cx="365" cy="372" r="1.1" fill="#ffffff" opacity="0.95" />
          <circle cx="775" cy="368" r="2.2" fill="#a5b4fc" opacity="0.8" filter="url(#soft-ethereal-glow)" />
          <circle cx="775" cy="368" r="1.1" fill="#ffffff" opacity="0.95" />

          {/* ── MEMORY ↔ RELAY LUMINOUS CONNECTION BRIDGE ── */}
          {/* Communicates: Memory = shared context ↔ Relay = connectivity */}
          <g className="transition-opacity duration-300">
            {/* Luminous wide atmospheric aura track */}
            <line
              x1="514"
              y1="208"
              x2="546"
              y2="208"
              stroke="url(#grad-luminous-bridge)"
              strokeWidth="5"
              opacity="0.45"
              filter="url(#bridge-glow)"
            />
            {/* Inner radiant beam */}
            <line
              x1="514"
              y1="208"
              x2="546"
              y2="208"
              stroke="url(#grad-luminous-bridge)"
              strokeWidth="2"
              opacity="0.85"
              filter="url(#soft-ethereal-glow)"
            />
            {/* Crisp central spine */}
            <line
              x1="514"
              y1="208"
              x2="546"
              y2="208"
              stroke="#ffffff"
              strokeWidth="1.2"
              opacity="0.95"
            />
            {/* Left anchor node (Memory shared context connection) */}
            <circle cx="515" cy="208" r="2" fill="#c084fc" opacity="0.95" />
            {/* Right anchor node (Relay connectivity connection) */}
            <circle cx="545" cy="208" r="2" fill="#93c5fd" opacity="0.95" />
            {/* Pulsating energy node in center */}
            <circle
              cx="530"
              cy="208"
              r="2.8"
              fill="#ffffff"
              filter="url(#bridge-glow)"
              className="animate-pulse-bridge-luminous"
            />
            <circle
              cx="530"
              cy="208"
              r="1.8"
              fill="#a5b4fc"
            />
          </g>

          {/* ── 1. Top Center: Docs → Memory ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'compose' ? 'opacity-100' : 'opacity-85'}`}>
            <path
              id="path-docs"
              d="M 525 58 C 525 88, 490 114, 480 139"
              stroke="url(#grad-subtle-docs)"
              strokeWidth={hoveredNode === 'compose' ? "1.6" : "1.2"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-subtle-purple)"
            />
            <circle cx="525" cy="58" r="1.6" fill="#93c5fd" opacity="0.8" />
            {/* Flowing energy particle */}
            <circle r="1.6" fill="#c084fc" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 525 58 C 525 88, 490 114, 480 139')",
              animation: "flowParticleSubtle 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite",
            }} />
          </g>

          {/* ── 2. Upper Left: Sheets → Memory (Directional flow into Memory) ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'sheet' ? 'opacity-100' : 'opacity-85'}`}>
            <path
              id="path-sheets"
              d="M 302 85 C 322 110, 335 140, 352 168"
              stroke="url(#grad-subtle-sheets)"
              strokeWidth={hoveredNode === 'sheet' ? "1.6" : "1.2"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-subtle-purple)"
            />
            <circle cx="302" cy="85" r="1.6" fill="#6ee7b7" opacity="0.8" />
            {/* Flowing energy particle */}
            <circle r="1.6" fill="#a5b4fc" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 302 85 C 322 110, 335 140, 352 168')",
              animation: "flowParticleSubtle 4s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.6s",
            }} />
          </g>

          {/* ── 3. Upper Right: Deck → Relay (Directional flow into Relay) ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'deck' ? 'opacity-100' : 'opacity-85'}`}>
            <path
              id="path-deck"
              d="M 758 88 C 738 110, 725 140, 708 168"
              stroke="url(#grad-subtle-deck)"
              strokeWidth={hoveredNode === 'deck' ? "1.6" : "1.2"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-subtle-blue)"
            />
            <circle cx="758" cy="88" r="1.6" fill="#fdba74" opacity="0.8" />
            {/* Flowing energy particle */}
            <circle r="1.6" fill="#93c5fd" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 758 88 C 738 110, 725 140, 708 168')",
              animation: "flowParticleSubtle 3.8s cubic-bezier(0.4, 0, 0.2, 1) infinite 1.2s",
            }} />
          </g>

          {/* ── 4. Mid Left: Import → Memory (Directional flow into Memory) ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'omni-portal' ? 'opacity-100' : 'opacity-85'}`}>
            <path
              id="path-import"
              d="M 240 208 L 348 208"
              stroke="url(#grad-subtle-import)"
              strokeWidth={hoveredNode === 'omni-portal' ? "1.6" : "1.2"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-subtle-purple)"
            />
            <circle cx="240" cy="208" r="1.6" fill="#c084fc" opacity="0.8" />
            {/* Flowing energy particle */}
            <circle r="1.6" fill="#c084fc" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 240 208 L 348 208')",
              animation: "flowParticleSubtle 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.3s",
            }} />
          </g>

          {/* ── 5. Lower Right: Relay → Whiteboard (Directional flow outward to Whiteboard) ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'whiteboard' ? 'opacity-100' : 'opacity-85'}`}>
            <path
              id="path-whiteboard"
              d="M 708 235 C 728 245, 750 252, 773 262"
              stroke="url(#grad-subtle-whiteboard)"
              strokeWidth={hoveredNode === 'whiteboard' ? "1.6" : "1.2"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-subtle-blue)"
            />
            <circle cx="708" cy="235" r="1.6" fill="#60a5fa" opacity="0.8" />
            {/* Flowing energy particle */}
            <circle r="1.6" fill="#93c5fd" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 708 235 C 728 245, 750 252, 773 262')",
              animation: "flowParticleSubtle 4.2s cubic-bezier(0.4, 0, 0.2, 1) infinite 1.8s",
            }} />
          </g>

          {/* ── 6. Lower Left/Bottom: Room → Memory (Directional flow into Memory) ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'room' ? 'opacity-100' : 'opacity-85'}`}>
            <path
              id="path-room"
              d="M 432 328 L 432 278"
              stroke="url(#grad-subtle-room)"
              strokeWidth={hoveredNode === 'room' ? "1.6" : "1.2"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-subtle-indigo)"
            />
            <circle cx="432" cy="328" r="1.6" fill="#5eead4" opacity="0.8" />
            {/* Flowing energy particle */}
            <circle r="1.6" fill="#c084fc" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 432 328 L 432 278')",
              animation: "flowParticleSubtle 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.9s",
            }} />
          </g>
        </svg>

        {/* ── HTML Nodes Layer ── */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          
          {/* ========================================================================= */}
          {/* ── CENTRAL CONNECTED CORE: Memory (left) & Relay (right) ─────────────── */}
          {/* Luminous visionOS frosted glass infused with delicate gradient tints    ── */}
          {/* ========================================================================= */}
          <div className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] flex items-center gap-7 sm:gap-8 pointer-events-auto">
            
            {/* ── MEMORY CARD (Contextual Core - Luminous Lavender Frosted Glass) ── */}
            <button
              type="button"
              onClick={() => handleLaunch('memory')}
              onMouseEnter={() => setHoveredNode('memory')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "w-[148px] sm:w-[158px] h-[130px] sm:h-[138px]",
                "rounded-[26px] p-4",
                "flex flex-col items-center justify-center text-center",
                // Luminous lavender/violet frosted visionOS glass infusion matching Reference Image 1
                "bg-gradient-to-b from-white/95 via-purple-50/80 to-purple-100/65 dark:from-zinc-900/90 dark:via-purple-950/45 dark:to-purple-900/35",
                "backdrop-blur-2xl",
                "border border-purple-300/80 dark:border-purple-400/40",
                "shadow-[0_20px_50px_-8px_rgba(168,85,247,0.28),0_4px_16px_rgba(168,85,247,0.1),inset_0_1.5px_2px_rgba(255,255,255,0.95),inset_0_-2px_4px_rgba(168,85,247,0.15)]",
                "transition-all duration-300 cursor-pointer group outline-none",
                hoveredNode === 'memory' ? "scale-[1.03] -translate-y-1 shadow-[0_24px_56px_-6px_rgba(168,85,247,0.38)] border-purple-400" : "",
              ].join(" ")}
            >
              {/* Memory icon matching switchworkspace dropdown */}
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-1 text-purple-600 dark:text-purple-300 group-hover:scale-105 transition-transform duration-200 drop-shadow-[0_2px_6px_rgba(168,85,247,0.35)]">
                <MemoryIcon size={21} strokeWidth={1.75} className="text-purple-600 dark:text-purple-300" />
              </div>
              <span className="text-[14.5px] sm:text-[15.5px] font-semibold text-slate-900 dark:text-white tracking-[-0.01em]">
                Memory
              </span>
              <span className="text-[11.5px] sm:text-[12px] text-slate-500 dark:text-zinc-400 font-normal mt-0.5 leading-snug">
                Your team's<br />shared context
              </span>
            </button>

            {/* ── RELAY CARD (Connectivity Core - Luminous Sky-Blue Frosted Glass) ── */}
            <button
              type="button"
              onClick={() => handleLaunch('relay')}
              onMouseEnter={() => setHoveredNode('relay')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "w-[148px] sm:w-[158px] h-[130px] sm:h-[138px]",
                "rounded-[26px] p-4",
                "flex flex-col items-center justify-center text-center",
                // Luminous sky-blue frosted visionOS glass infusion matching Reference Image 1
                "bg-gradient-to-b from-white/95 via-sky-50/80 to-blue-100/65 dark:from-zinc-900/90 dark:via-sky-950/45 dark:to-blue-900/35",
                "backdrop-blur-2xl",
                "border border-blue-300/80 dark:border-blue-400/40",
                "shadow-[0_20px_50px_-8px_rgba(59,130,246,0.28),0_4px_16px_rgba(59,130,246,0.1),inset_0_1.5px_2px_rgba(255,255,255,0.95),inset_0_-2px_4px_rgba(59,130,246,0.15)]",
                "transition-all duration-300 cursor-pointer group outline-none",
                hoveredNode === 'relay' ? "scale-[1.03] -translate-y-1 shadow-[0_24px_56px_-6px_rgba(59,130,246,0.38)] border-blue-400" : "",
              ].join(" ")}
            >
              {/* Connection transfer icon matching reference with soft radiance */}
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-1 text-blue-600 dark:text-blue-300 group-hover:scale-105 transition-transform duration-200 drop-shadow-[0_2px_6px_rgba(59,130,246,0.35)]">
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
          {/* ── PERIPHERAL TOOLS (Frosted VisionOS Glass Cards, Floating Shadows) ───── */}
          {/* ========================================================================= */}

          {/* ── 1. Top Center: DOCS (Translucent frosted acrylic glass with inner specular rim) ── */}
          <div className="absolute top-[1%] sm:top-[2%] left-[50%] -translate-x-[50%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('compose')}
              onMouseEnter={() => setHoveredNode('compose')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                // Translucent frosted visionOS acrylic glass allowing underlying orbital ring to shine through
                "bg-gradient-to-b from-white/75 via-white/60 to-white/50 dark:from-[#18181b]/75 dark:via-[#18181b]/60 dark:to-[#18181b]/50",
                "backdrop-blur-xl",
                "border border-white/90 dark:border-white/20",
                "ring-1 ring-slate-900/[0.04] dark:ring-white/[0.04]",
                // Deep floating ambient shadows matching Reference Image 1
                "shadow-[0_16px_36px_-6px_rgba(15,23,42,0.08),0_4px_12px_rgba(15,23,42,0.03),inset_0_1.5px_1.5px_rgba(255,255,255,0.95),inset_0_-1px_1px_rgba(255,255,255,0.3)] dark:shadow-[0_16px_36px_-6px_rgba(0,0,0,0.4)]",
                "hover:bg-white/85 dark:hover:bg-[#1f1f23]/85 hover:border-white dark:hover:border-white/30",
                "hover:shadow-[0_20px_42px_-6px_rgba(15,23,42,0.12),0_6px_16px_rgba(15,23,42,0.05),inset_0_1.5px_1.5px_rgba(255,255,255,1)] hover:-translate-y-0.5",
                "active:scale-[0.985] transition-all duration-200 cursor-pointer group text-left outline-none",
                hoveredNode === 'compose' ? "border-slate-300 dark:border-white/30 shadow-xl" : "",
              ].join(" ")}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-[0_2px_6px_rgba(59,130,246,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)]">
                <ComposeIcon size={16} strokeWidth={1.7} className="text-white" />
              </div>
              <div className="flex flex-col min-w-0 pr-1">
                <span className="text-[12.5px] font-semibold text-slate-800 dark:text-zinc-100 leading-tight">Docs</span>
                <span className="text-[10.5px] text-slate-400 dark:text-zinc-500 font-normal leading-tight mt-0.5">Write, organize, collaborate</span>
              </div>
            </button>
          </div>

          {/* ── 2. Upper Left: SHEETS (Translucent frosted acrylic glass) ── */}
          <div className="absolute top-[11%] sm:top-[13%] left-[10%] sm:left-[12%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('sheet')}
              onMouseEnter={() => setHoveredNode('sheet')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                // Translucent frosted visionOS acrylic glass allowing underlying orbital ring to shine through
                "bg-gradient-to-b from-white/75 via-white/60 to-white/50 dark:from-[#18181b]/75 dark:via-[#18181b]/60 dark:to-[#18181b]/50",
                "backdrop-blur-xl",
                "border border-white/90 dark:border-white/20",
                "ring-1 ring-slate-900/[0.04] dark:ring-white/[0.04]",
                // Deep floating ambient shadows matching Reference Image 1
                "shadow-[0_16px_36px_-6px_rgba(15,23,42,0.08),0_4px_12px_rgba(15,23,42,0.03),inset_0_1.5px_1.5px_rgba(255,255,255,0.95),inset_0_-1px_1px_rgba(255,255,255,0.3)] dark:shadow-[0_16px_36px_-6px_rgba(0,0,0,0.4)]",
                "hover:bg-white/85 dark:hover:bg-[#1f1f23]/85 hover:border-white dark:hover:border-white/30",
                "hover:shadow-[0_20px_42px_-6px_rgba(15,23,42,0.12),0_6px_16px_rgba(15,23,42,0.05),inset_0_1.5px_1.5px_rgba(255,255,255,1)] hover:-translate-y-0.5",
                "active:scale-[0.985] transition-all duration-200 cursor-pointer group text-left outline-none",
                hoveredNode === 'sheet' ? "border-slate-300 dark:border-white/30 shadow-xl" : "",
              ].join(" ")}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center shrink-0 shadow-[0_2px_6px_rgba(16,185,129,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)]">
                <SheetIcon size={16} strokeWidth={1.7} className="text-white" />
              </div>
              <div className="flex flex-col min-w-0 pr-1">
                <span className="text-[12.5px] font-semibold text-slate-800 dark:text-zinc-100 leading-tight">Sheets</span>
                <span className="text-[10.5px] text-slate-400 dark:text-zinc-500 font-normal leading-tight mt-0.5">Analyze, visualize, plan</span>
              </div>
            </button>
          </div>

          {/* ── 3. Upper Right: DECK (Translucent frosted acrylic glass) ── */}
          <div className="absolute top-[12%] sm:top-[14%] right-[10%] sm:right-[12%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('deck')}
              onMouseEnter={() => setHoveredNode('deck')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                // Translucent frosted visionOS acrylic glass allowing underlying orbital ring to shine through
                "bg-gradient-to-b from-white/75 via-white/60 to-white/50 dark:from-[#18181b]/75 dark:via-[#18181b]/60 dark:to-[#18181b]/50",
                "backdrop-blur-xl",
                "border border-white/90 dark:border-white/20",
                "ring-1 ring-slate-900/[0.04] dark:ring-white/[0.04]",
                // Deep floating ambient shadows matching Reference Image 1
                "shadow-[0_16px_36px_-6px_rgba(15,23,42,0.08),0_4px_12px_rgba(15,23,42,0.03),inset_0_1.5px_1.5px_rgba(255,255,255,0.95),inset_0_-1px_1px_rgba(255,255,255,0.3)] dark:shadow-[0_16px_36px_-6px_rgba(0,0,0,0.4)]",
                "hover:bg-white/85 dark:hover:bg-[#1f1f23]/85 hover:border-white dark:hover:border-white/30",
                "hover:shadow-[0_20px_42px_-6px_rgba(15,23,42,0.12),0_6px_16px_rgba(15,23,42,0.05),inset_0_1.5px_1.5px_rgba(255,255,255,1)] hover:-translate-y-0.5",
                "active:scale-[0.985] transition-all duration-200 cursor-pointer group text-left outline-none",
                hoveredNode === 'deck' ? "border-slate-300 dark:border-white/30 shadow-xl" : "",
              ].join(" ")}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-[0_2px_6px_rgba(245,158,11,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)]">
                <DeckIcon size={16} strokeWidth={1.7} className="text-white" />
              </div>
              <div className="flex flex-col min-w-0 pr-1">
                <span className="text-[12.5px] font-semibold text-slate-800 dark:text-zinc-100 leading-tight">Deck</span>
                <span className="text-[10.5px] text-slate-400 dark:text-zinc-500 font-normal leading-tight mt-0.5">Present, tell your story</span>
              </div>
            </button>
          </div>

          {/* ── 4. Left: IMPORT (Translucent frosted acrylic glass with ImportPortalIcon) ── */}
          <div className="absolute top-[50%] -translate-y-[50%] left-[5%] sm:left-[7%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('omni-portal')}
              onMouseEnter={() => setHoveredNode('omni-portal')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                // Translucent frosted visionOS acrylic glass allowing underlying orbital ring to shine through
                "bg-gradient-to-b from-white/75 via-white/60 to-white/50 dark:from-[#18181b]/75 dark:via-[#18181b]/60 dark:to-[#18181b]/50",
                "backdrop-blur-xl",
                "border border-white/90 dark:border-white/20",
                "ring-1 ring-slate-900/[0.04] dark:ring-white/[0.04]",
                // Deep floating ambient shadows matching Reference Image 1
                "shadow-[0_16px_36px_-6px_rgba(15,23,42,0.08),0_4px_12px_rgba(15,23,42,0.03),inset_0_1.5px_1.5px_rgba(255,255,255,0.95),inset_0_-1px_1px_rgba(255,255,255,0.3)] dark:shadow-[0_16px_36px_-6px_rgba(0,0,0,0.4)]",
                "hover:bg-white/85 dark:hover:bg-[#1f1f23]/85 hover:border-white dark:hover:border-white/30",
                "hover:shadow-[0_20px_42px_-6px_rgba(15,23,42,0.12),0_6px_16px_rgba(15,23,42,0.05),inset_0_1.5px_1.5px_rgba(255,255,255,1)] hover:-translate-y-0.5",
                "active:scale-[0.985] transition-all duration-200 cursor-pointer group text-left outline-none",
                hoveredNode === 'omni-portal' ? "border-slate-300 dark:border-white/30 shadow-xl" : "",
              ].join(" ")}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-400 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-[0_2px_6px_rgba(168,85,247,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)]">
                <ImportPortalIcon size={16} strokeWidth={1.7} className="text-white" />
              </div>
              <div className="flex flex-col min-w-0 pr-1">
                <span className="text-[12.5px] font-semibold text-slate-800 dark:text-zinc-100 leading-tight">Import</span>
                <span className="text-[10.5px] text-slate-400 dark:text-zinc-500 font-normal leading-tight mt-0.5">Bring in any content</span>
              </div>
            </button>
          </div>

          {/* ── 5. Lower Right: WHITEBOARD (Translucent frosted acrylic glass) ── */}
          <div className="absolute top-[56%] sm:top-[58%] right-[7%] sm:right-[9%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('whiteboard')}
              onMouseEnter={() => setHoveredNode('whiteboard')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                // Translucent frosted visionOS acrylic glass allowing underlying orbital ring to shine through
                "bg-gradient-to-b from-white/75 via-white/60 to-white/50 dark:from-[#18181b]/75 dark:via-[#18181b]/60 dark:to-[#18181b]/50",
                "backdrop-blur-xl",
                "border border-white/90 dark:border-white/20",
                "ring-1 ring-slate-900/[0.04] dark:ring-white/[0.04]",
                // Deep floating ambient shadows matching Reference Image 1
                "shadow-[0_16px_36px_-6px_rgba(15,23,42,0.08),0_4px_12px_rgba(15,23,42,0.03),inset_0_1.5px_1.5px_rgba(255,255,255,0.95),inset_0_-1px_1px_rgba(255,255,255,0.3)] dark:shadow-[0_16px_36px_-6px_rgba(0,0,0,0.4)]",
                "hover:bg-white/85 dark:hover:bg-[#1f1f23]/85 hover:border-white dark:hover:border-white/30",
                "hover:shadow-[0_20px_42px_-6px_rgba(15,23,42,0.12),0_6px_16px_rgba(15,23,42,0.05),inset_0_1.5px_1.5px_rgba(255,255,255,1)] hover:-translate-y-0.5",
                "active:scale-[0.985] transition-all duration-200 cursor-pointer group text-left outline-none",
                hoveredNode === 'whiteboard' ? "border-slate-300 dark:border-white/30 shadow-xl" : "",
              ].join(" ")}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-[0_2px_6px_rgba(79,70,229,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)]">
                <WhiteboardIcon size={16} strokeWidth={1.7} className="text-white" />
              </div>
              <div className="flex flex-col min-w-0 pr-1">
                <span className="text-[12.5px] font-semibold text-slate-800 dark:text-zinc-100 leading-tight">Whiteboard</span>
                <span className="text-[10.5px] text-slate-400 dark:text-zinc-500 font-normal leading-tight mt-0.5">Brainstorm, create, iterate</span>
              </div>
            </button>
          </div>

          {/* ── 6. Lower Left/Bottom: ROOM (Translucent frosted acrylic glass with RoomIcon matching switchworkspace dropdown) ── */}
          <div className="absolute bottom-[8%] sm:bottom-[9%] left-[30%] sm:left-[33%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('room')}
              onMouseEnter={() => setHoveredNode('room')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                // Translucent frosted visionOS acrylic glass allowing underlying orbital ring to shine through
                "bg-gradient-to-b from-white/75 via-white/60 to-white/50 dark:from-[#18181b]/75 dark:via-[#18181b]/60 dark:to-[#18181b]/50",
                "backdrop-blur-xl",
                "border border-white/90 dark:border-white/20",
                "ring-1 ring-slate-900/[0.04] dark:ring-white/[0.04]",
                // Deep floating ambient shadows matching Reference Image 1
                "shadow-[0_16px_36px_-6px_rgba(15,23,42,0.08),0_4px_12px_rgba(15,23,42,0.03),inset_0_1.5px_1.5px_rgba(255,255,255,0.95),inset_0_-1px_1px_rgba(255,255,255,0.3)] dark:shadow-[0_16px_36px_-6px_rgba(0,0,0,0.4)]",
                "hover:bg-white/85 dark:hover:bg-[#1f1f23]/85 hover:border-white dark:hover:border-white/30",
                "hover:shadow-[0_20px_42px_-6px_rgba(15,23,42,0.12),0_6px_16px_rgba(15,23,42,0.05),inset_0_1.5px_1.5px_rgba(255,255,255,1)] hover:-translate-y-0.5",
                "active:scale-[0.985] transition-all duration-200 cursor-pointer group text-left outline-none",
                hoveredNode === 'room' ? "border-slate-300 dark:border-white/30 shadow-xl" : "",
              ].join(" ")}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 text-white flex items-center justify-center shrink-0 shadow-[0_2px_6px_rgba(20,184,166,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)]">
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
