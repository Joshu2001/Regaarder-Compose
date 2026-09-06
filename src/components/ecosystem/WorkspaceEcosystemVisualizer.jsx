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
        
        {/* ── Soft Atmospheric Background Illumination (Clean canvas, pale soft diffusion) ── */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Pale soft ambient field */}
          <div className="w-[740px] h-[280px] rounded-[100%] bg-gradient-to-r from-blue-100/35 via-indigo-50/20 to-purple-100/30 dark:from-blue-950/15 dark:via-indigo-950/10 dark:to-purple-950/15 blur-[80px] transform -translate-y-1 opacity-75" />
          {/* Subtle lavender glow specifically behind Memory (left center) */}
          <div className="absolute w-[260px] h-[170px] -translate-x-16 rounded-full bg-purple-200/30 dark:bg-purple-900/15 blur-[50px] opacity-70" />
          {/* Subtle blue glow specifically behind Relay (right center) */}
          <div className="absolute w-[260px] h-[170px] translate-x-16 rounded-full bg-blue-200/30 dark:bg-blue-900/15 blur-[50px] opacity-70" />
          {/* Faint white center bloom floating behind the ecosystem core */}
          <div className="w-[380px] h-[170px] rounded-full bg-white/70 dark:bg-white/[0.03] blur-[35px] opacity-80" />
        </div>

        {/* ── SVG Connection Network Layer (Calculated against a 1060 × 415 ViewBox) ── */}
        <svg
          viewBox="0 0 1060 415"
          className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
          fill="none"
        >
          <defs>
            {/* Extremely delicate arrowheads - subtle, low-opacity */}
            <marker
              id="arrow-subtle-purple"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="3.2"
              markerHeight="3.2"
              orient="auto-start-reverse"
            >
              <path d="M 1 2.5 L 6.5 5 L 1 7.5" fill="none" stroke="#a855f7" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
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
              <path d="M 1 2.5 L 6.5 5 L 1 7.5" fill="none" stroke="#3b82f6" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
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
              <path d="M 1 2.5 L 6.5 5 L 1 7.5" fill="none" stroke="#818cf8" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
            </marker>

            {/* Soft, low-opacity linear gradients for paths */}
            <linearGradient id="grad-subtle-docs" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.55" />
            </linearGradient>

            <linearGradient id="grad-subtle-sheets" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#a5b4fc" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.6" />
            </linearGradient>

            <linearGradient id="grad-subtle-deck" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fdba74" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#c4b5fd" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.6" />
            </linearGradient>

            <linearGradient id="grad-subtle-import" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.6" />
            </linearGradient>

            <linearGradient id="grad-subtle-whiteboard" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.6" />
              <stop offset="40%" stopColor="#818cf8" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.25" />
            </linearGradient>

            <linearGradient id="grad-subtle-room" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5eead4" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#a5b4fc" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.6" />
            </linearGradient>

            {/* Ethereal orbital ring gradients (subconscious subtlety) */}
            <linearGradient id="grad-orbit-primary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.18" />
              <stop offset="35%" stopColor="#818cf8" stopOpacity="0.24" />
              <stop offset="70%" stopColor="#93c5fd" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.15" />
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

          {/* ── Ethereal Translucent Orbital Curves (Subconscious spatial depth) ── */}
          {/* Main sweeping outer orbital arc (softened by ~25-30%) */}
          <path
            d="M 80 208 C 70 115, 210 38, 530 36 C 850 34, 990 105, 980 208 C 970 310, 820 378, 530 380 C 240 382, 90 310, 80 208"
            stroke="url(#grad-orbit-primary)"
            strokeWidth="0.8"
            fill="none"
            opacity="0.18"
          />

          {/* Secondary delicate sweeping arc connecting Deck & Whiteboard */}
          <path
            d="M 680 95 C 850 118, 990 178, 930 278 C 880 345, 730 382, 530 380"
            stroke="url(#grad-orbit-primary)"
            strokeWidth="0.7"
            fill="none"
            opacity="0.12"
          />

          {/* Occasional tiny luminous celestial nodes along the curves */}
          <circle cx="190" cy="98" r="1.4" fill="#a5b4fc" opacity="0.35" />
          <circle cx="905" cy="155" r="1.4" fill="#93c5fd" opacity="0.35" />
          <circle cx="365" cy="372" r="1.4" fill="#c084fc" opacity="0.3" />
          <circle cx="775" cy="368" r="1.4" fill="#a5b4fc" opacity="0.3" />

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
          <g className={`transition-all duration-300 ${hoveredNode === 'compose' ? 'opacity-100' : 'opacity-75'}`}>
            <path
              id="path-docs"
              d="M 525 58 C 525 88, 490 114, 480 139"
              stroke="url(#grad-subtle-docs)"
              strokeWidth={hoveredNode === 'compose' ? "1.4" : "1"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-subtle-purple)"
            />
            <circle cx="525" cy="58" r="1.5" fill="#93c5fd" opacity="0.65" />
            {/* Flowing energy particle */}
            <circle r="1.5" fill="#c084fc" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 525 58 C 525 88, 490 114, 480 139')",
              animation: "flowParticleSubtle 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite",
            }} />
          </g>

          {/* ── 2. Upper Left: Sheets → Memory (Directional flow into Memory) ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'sheet' ? 'opacity-100' : 'opacity-75'}`}>
            <path
              id="path-sheets"
              d="M 302 85 C 322 110, 335 140, 352 168"
              stroke="url(#grad-subtle-sheets)"
              strokeWidth={hoveredNode === 'sheet' ? "1.4" : "1"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-subtle-purple)"
            />
            <circle cx="302" cy="85" r="1.5" fill="#6ee7b7" opacity="0.65" />
            {/* Flowing energy particle */}
            <circle r="1.5" fill="#a5b4fc" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 302 85 C 322 110, 335 140, 352 168')",
              animation: "flowParticleSubtle 4s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.6s",
            }} />
          </g>

          {/* ── 3. Upper Right: Deck → Relay (Directional flow into Relay) ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'deck' ? 'opacity-100' : 'opacity-75'}`}>
            <path
              id="path-deck"
              d="M 758 88 C 738 110, 725 140, 708 168"
              stroke="url(#grad-subtle-deck)"
              strokeWidth={hoveredNode === 'deck' ? "1.4" : "1"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-subtle-blue)"
            />
            <circle cx="758" cy="88" r="1.5" fill="#fdba74" opacity="0.65" />
            {/* Flowing energy particle */}
            <circle r="1.5" fill="#93c5fd" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 758 88 C 738 110, 725 140, 708 168')",
              animation: "flowParticleSubtle 3.8s cubic-bezier(0.4, 0, 0.2, 1) infinite 1.2s",
            }} />
          </g>

          {/* ── 4. Mid Left: Import → Memory (Directional flow into Memory) ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'omni-portal' ? 'opacity-100' : 'opacity-75'}`}>
            <path
              id="path-import"
              d="M 240 208 L 348 208"
              stroke="url(#grad-subtle-import)"
              strokeWidth={hoveredNode === 'omni-portal' ? "1.4" : "1"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-subtle-purple)"
            />
            <circle cx="240" cy="208" r="1.5" fill="#c084fc" opacity="0.65" />
            {/* Flowing energy particle */}
            <circle r="1.5" fill="#c084fc" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 240 208 L 348 208')",
              animation: "flowParticleSubtle 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.3s",
            }} />
          </g>

          {/* ── 5. Lower Right: Relay → Whiteboard (Directional flow outward to Whiteboard) ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'whiteboard' ? 'opacity-100' : 'opacity-75'}`}>
            <path
              id="path-whiteboard"
              d="M 708 235 C 728 245, 750 252, 773 262"
              stroke="url(#grad-subtle-whiteboard)"
              strokeWidth={hoveredNode === 'whiteboard' ? "1.4" : "1"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-subtle-blue)"
            />
            <circle cx="708" cy="235" r="1.5" fill="#60a5fa" opacity="0.65" />
            {/* Flowing energy particle */}
            <circle r="1.5" fill="#93c5fd" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 708 235 C 728 245, 750 252, 773 262')",
              animation: "flowParticleSubtle 4.2s cubic-bezier(0.4, 0, 0.2, 1) infinite 1.8s",
            }} />
          </g>

          {/* ── 6. Lower Left/Bottom: Room → Memory (Directional flow into Memory) ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'room' ? 'opacity-100' : 'opacity-75'}`}>
            <path
              id="path-room"
              d="M 432 328 L 432 278"
              stroke="url(#grad-subtle-room)"
              strokeWidth={hoveredNode === 'room' ? "1.4" : "1"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-subtle-indigo)"
            />
            <circle cx="432" cy="328" r="1.5" fill="#5eead4" opacity="0.65" />
            {/* Flowing energy particle */}
            <circle r="1.5" fill="#c084fc" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 432 328 L 432 278')",
              animation: "flowParticleSubtle 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.9s",
            }} />
          </g>
        </svg>

        {/* ── HTML Nodes Layer ── */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          
          {/* ========================================================================= */}
          {/* ── CENTRAL CONNECTED CORE: Memory (left) & Relay (right) ─────────────── */}
          {/* Sized 158px × 138px with translucent, light-diffusing Apple glass        ── */}
          {/* ========================================================================= */}
          <div className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] flex items-center gap-7 sm:gap-8 pointer-events-auto">
            
            {/* ── MEMORY CARD (Contextual Core - Luminous Lavender Glass) ── */}
            <button
              type="button"
              onClick={() => handleLaunch('memory')}
              onMouseEnter={() => setHoveredNode('memory')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "w-[148px] sm:w-[158px] h-[130px] sm:h-[138px]",
                "rounded-[26px] p-4",
                "flex flex-col items-center justify-center text-center",
                // Translucent white glass surface, strong backdrop blur, subtle inner highlight
                "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl",
                "border border-purple-200/60 dark:border-purple-500/25",
                "shadow-[0_12px_36px_-6px_rgba(168,85,247,0.18),0_1px_2px_rgba(255,255,255,0.95)_inset,0_2px_8px_rgba(15,23,42,0.03)] dark:shadow-[0_12px_36px_-6px_rgba(168,85,247,0.3),0_1px_2px_rgba(255,255,255,0.1)_inset]",
                "transition-all duration-300 cursor-pointer group outline-none",
                hoveredNode === 'memory' ? "scale-[1.03] -translate-y-1 shadow-[0_16px_40px_-4px_rgba(168,85,247,0.28)] border-purple-300/80" : "",
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
                "w-[148px] sm:w-[158px] h-[130px] sm:h-[138px]",
                "rounded-[26px] p-4",
                "flex flex-col items-center justify-center text-center",
                // Translucent white glass surface, strong backdrop blur, subtle inner highlight
                "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl",
                "border border-blue-200/60 dark:border-blue-500/25",
                "shadow-[0_12px_36px_-6px_rgba(59,130,246,0.18),0_1px_2px_rgba(255,255,255,0.95)_inset,0_2px_8px_rgba(15,23,42,0.03)] dark:shadow-[0_12px_36px_-6px_rgba(59,130,246,0.3),0_1px_2px_rgba(255,255,255,0.1)_inset]",
                "transition-all duration-300 cursor-pointer group outline-none",
                hoveredNode === 'relay' ? "scale-[1.03] -translate-y-1 shadow-[0_16px_40px_-4px_rgba(59,130,246,0.28)] border-blue-300/80" : "",
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
          {/* ── PERIPHERAL TOOLS (Translucent Glass Cards, Compressed Inward by 12%) ── */}
          {/* ========================================================================= */}

          {/* ── 1. Top Center: DOCS (Positioned cleanly beneath subtitle with breathing room) ── */}
          <div className="absolute top-[1%] sm:top-[2%] left-[50%] -translate-x-[50%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('compose')}
              onMouseEnter={() => setHoveredNode('compose')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                // Translucent white glass surface with subtle inner highlight & delicate 1px border
                "bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-xl",
                "border border-white/90 dark:border-white/[0.08]",
                "ring-1 ring-slate-900/[0.04] dark:ring-white/[0.04]",
                "shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04),0_1px_1px_rgba(255,255,255,0.95)_inset] dark:shadow-[0_2px_12px_-2px_rgba(0,0,0,0.3)]",
                "hover:bg-white/95 dark:hover:bg-[#1f1f23]/95 hover:border-slate-200 dark:hover:border-white/15",
                "hover:shadow-[0_6px_20px_-3px_rgba(15,23,42,0.07),0_1px_1px_rgba(255,255,255,0.95)_inset] hover:-translate-y-0.5",
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

          {/* ── 2. Upper Left: SHEETS (Moved inward toward center, translucent glass) ── */}
          <div className="absolute top-[11%] sm:top-[13%] left-[10%] sm:left-[12%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('sheet')}
              onMouseEnter={() => setHoveredNode('sheet')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                // Translucent white glass surface with subtle inner highlight & delicate 1px border
                "bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-xl",
                "border border-white/90 dark:border-white/[0.08]",
                "ring-1 ring-slate-900/[0.04] dark:ring-white/[0.04]",
                "shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04),0_1px_1px_rgba(255,255,255,0.95)_inset] dark:shadow-[0_2px_12px_-2px_rgba(0,0,0,0.3)]",
                "hover:bg-white/95 dark:hover:bg-[#1f1f23]/95 hover:border-slate-200 dark:hover:border-white/15",
                "hover:shadow-[0_6px_20px_-3px_rgba(15,23,42,0.07),0_1px_1px_rgba(255,255,255,0.95)_inset] hover:-translate-y-0.5",
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

          {/* ── 3. Upper Right: DECK (Moved inward toward center, translucent glass) ── */}
          <div className="absolute top-[12%] sm:top-[14%] right-[10%] sm:right-[12%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('deck')}
              onMouseEnter={() => setHoveredNode('deck')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                // Translucent white glass surface with subtle inner highlight & delicate 1px border
                "bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-xl",
                "border border-white/90 dark:border-white/[0.08]",
                "ring-1 ring-slate-900/[0.04] dark:ring-white/[0.04]",
                "shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04),0_1px_1px_rgba(255,255,255,0.95)_inset] dark:shadow-[0_2px_12px_-2px_rgba(0,0,0,0.3)]",
                "hover:bg-white/95 dark:hover:bg-[#1f1f23]/95 hover:border-slate-200 dark:hover:border-white/15",
                "hover:shadow-[0_6px_20px_-3px_rgba(15,23,42,0.07),0_1px_1px_rgba(255,255,255,0.95)_inset] hover:-translate-y-0.5",
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

          {/* ── 4. Left: IMPORT (Moved inward toward center, translucent glass) ── */}
          <div className="absolute top-[50%] -translate-y-[50%] left-[5%] sm:left-[7%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('omni-portal')}
              onMouseEnter={() => setHoveredNode('omni-portal')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                // Translucent white glass surface with subtle inner highlight & delicate 1px border
                "bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-xl",
                "border border-white/90 dark:border-white/[0.08]",
                "ring-1 ring-slate-900/[0.04] dark:ring-white/[0.04]",
                "shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04),0_1px_1px_rgba(255,255,255,0.95)_inset] dark:shadow-[0_2px_12px_-2px_rgba(0,0,0,0.3)]",
                "hover:bg-white/95 dark:hover:bg-[#1f1f23]/95 hover:border-slate-200 dark:hover:border-white/15",
                "hover:shadow-[0_6px_20px_-3px_rgba(15,23,42,0.07),0_1px_1px_rgba(255,255,255,0.95)_inset] hover:-translate-y-0.5",
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

          {/* ── 5. Lower Right: WHITEBOARD (Moved inward toward center, translucent glass) ── */}
          <div className="absolute top-[56%] sm:top-[58%] right-[7%] sm:right-[9%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('whiteboard')}
              onMouseEnter={() => setHoveredNode('whiteboard')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                // Translucent white glass surface with subtle inner highlight & delicate 1px border
                "bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-xl",
                "border border-white/90 dark:border-white/[0.08]",
                "ring-1 ring-slate-900/[0.04] dark:ring-white/[0.04]",
                "shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04),0_1px_1px_rgba(255,255,255,0.95)_inset] dark:shadow-[0_2px_12px_-2px_rgba(0,0,0,0.3)]",
                "hover:bg-white/95 dark:hover:bg-[#1f1f23]/95 hover:border-slate-200 dark:hover:border-white/15",
                "hover:shadow-[0_6px_20px_-3px_rgba(15,23,42,0.07),0_1px_1px_rgba(255,255,255,0.95)_inset] hover:-translate-y-0.5",
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

          {/* ── 6. Lower Left/Bottom: ROOM (Moved upward with comfortable breathing room below) ── */}
          <div className="absolute bottom-[8%] sm:bottom-[9%] left-[30%] sm:left-[33%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('room')}
              onMouseEnter={() => setHoveredNode('room')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                // Translucent white glass surface with subtle inner highlight & delicate 1px border
                "bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-xl",
                "border border-white/90 dark:border-white/[0.08]",
                "ring-1 ring-slate-900/[0.04] dark:ring-white/[0.04]",
                "shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04),0_1px_1px_rgba(255,255,255,0.95)_inset] dark:shadow-[0_2px_12px_-2px_rgba(0,0,0,0.3)]",
                "hover:bg-white/95 dark:hover:bg-[#1f1f23]/95 hover:border-slate-200 dark:hover:border-white/15",
                "hover:shadow-[0_6px_20px_-3px_rgba(15,23,42,0.07),0_1px_1px_rgba(255,255,255,0.95)_inset] hover:-translate-y-0.5",
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
