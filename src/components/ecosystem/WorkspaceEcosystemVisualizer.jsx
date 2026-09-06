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
 * FIDELITY HARMONIZATION — MATCH REFERENCE IMAGE 2:
 * 1. Solid Continuous Celestial Orbital Ribbon:
 *    - Replaces dashed ring with a smooth, solid, glowing 3D-tilted celestial glass track.
 *    - Dual-stroke construction: soft ethereal glow under-track + sharp radiant glass ribbon.
 *    - Luminous celestial nodes / starburst sparks along the orbital path.
 * 2. Elegant Curved Flow Arrows (Bézier Arcs):
 *    - Every peripheral tool connects via a distinct, beautifully curved lavender/periwinkle
 *      Bézier arrow pointing directly into Memory and Relay.
 *    - Sharp, prominent SVG marker arrowheads with optimal contrast.
 * 3. Memory ↔ Relay Core Bridge with Aperture Lens Flare:
 *    - Live starburst / diamond lens flare in the center of the connection bridge.
 *    - Ethereal lavender bloom behind Memory; azure sky bloom behind Relay.
 * 4. Concentric Acoustic / Gravity Ripples:
 *    - Soft multi-tier elliptical ripples radiating outwards across the canvas.
 * 5. Single-Viewport Geometry:
 *    - Optimized 1060 × 380 coordinate space ensuring the ecosystem, Recent Work, and footer
 *      all sit comfortably within a single viewport without triggering vertical scrollbars.
 * 6. Canonical Tool Icons Preserved:
 *    - Strictly utilizes the Switch Workspace dropdown canonical icon set.
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
      {/* ── Keyframes for Dynamic Aperture Pulse & Flowing Energy Particles ── */}
      <style>{`
        @keyframes pulseApertureFlare {
          0%, 100% {
            opacity: 0.8;
            transform: scale(0.95);
          }
          50% {
            opacity: 1;
            transform: scale(1.08);
          }
        }
        @keyframes flowParticleSubtle {
          0% { offset-distance: 0%; opacity: 0; }
          15% { opacity: 0.85; }
          85% { opacity: 0.85; }
          100% { offset-distance: 100%; opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse-flare {
            animation: none !important;
          }
          circle[style*="offset-path"] {
            display: none !important;
          }
        }
      `}</style>

      {/* ── Outer Ecosystem Stage (Aspect 1060 x 380: Compact single-viewport height) ── */}
      <div className="w-full max-w-[1060px] h-[360px] sm:h-[380px] relative flex items-center justify-center overflow-visible">
        
        {/* ── Soft Atmospheric Background Illumination (Clean canvas, luminous dual-tone diffusion) ── */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible">
          {/* Broad soft ambient field */}
          <div className="w-[860px] h-[290px] rounded-[100%] bg-gradient-to-r from-blue-100/35 via-indigo-50/25 to-purple-100/35 dark:from-blue-950/20 dark:via-indigo-950/15 dark:to-purple-950/20 blur-[85px] transform -translate-y-1 opacity-80" />
          {/* Luminous lavender nebula specifically behind Memory & left periphery */}
          <div className="absolute w-[360px] h-[240px] -translate-x-24 rounded-full bg-purple-400/30 dark:bg-purple-900/30 blur-[70px] opacity-85" />
          {/* Luminous sky-blue nebula specifically behind Relay & right periphery */}
          <div className="absolute w-[360px] h-[240px] translate-x-24 rounded-full bg-sky-400/30 dark:bg-blue-900/30 blur-[70px] opacity-85" />
          {/* Luminous diffuse white center core wash */}
          <div className="w-[460px] h-[190px] rounded-full bg-white/85 dark:bg-white/[0.04] blur-[44px] opacity-90" />
        </div>

        {/* ── SVG Connection Network & Celestial Orbit Layer (1060 × 380 ViewBox) ── */}
        <svg
          viewBox="0 0 1060 380"
          className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
          fill="none"
        >
          <defs>
            {/* Directional arrowheads matching Reference Image 2: prominent, sharp, and high-contrast */}
            <marker
              id="arrow-celestial-purple"
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="4.5"
              markerHeight="4.5"
              orient="auto-start-reverse"
            >
              <path d="M 1.5 2 L 7 5 L 1.5 8" fill="none" stroke="#a855f7" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </marker>

            <marker
              id="arrow-celestial-blue"
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="4.5"
              markerHeight="4.5"
              orient="auto-start-reverse"
            >
              <path d="M 1.5 2 L 7 5 L 1.5 8" fill="none" stroke="#60a5fa" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </marker>

            <marker
              id="arrow-celestial-periwinkle"
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="4.5"
              markerHeight="4.5"
              orient="auto-start-reverse"
            >
              <path d="M 1.5 2 L 7 5 L 1.5 8" fill="none" stroke="#818cf8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </marker>

            {/* Smooth linear gradients for connection paths matching Reference Image 2 */}
            <linearGradient id="grad-path-docs" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="grad-path-sheets" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#a5b4fc" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.95" />
            </linearGradient>

            <linearGradient id="grad-path-deck" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fdba74" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#c4b5fd" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.95" />
            </linearGradient>

            <linearGradient id="grad-path-import" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.95" />
            </linearGradient>

            <linearGradient id="grad-path-whiteboard" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.95" />
            </linearGradient>

            <linearGradient id="grad-path-room" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5eead4" stopOpacity="0.7" />
              <stop offset="55%" stopColor="#a5b4fc" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.95" />
            </linearGradient>

            {/* Continuous Celestial Ribbon Gradient (Solid glowing glass track) */}
            <linearGradient id="grad-celestial-ribbon" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.75" />
              <stop offset="25%" stopColor="#a855f7" stopOpacity="0.85" />
              <stop offset="55%" stopColor="#818cf8" stopOpacity="0.8" />
              <stop offset="80%" stopColor="#60a5fa" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.75" />
            </linearGradient>

            <linearGradient id="grad-celestial-glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#818cf8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.4" />
            </linearGradient>

            {/* Ripple Wave Gradient */}
            <linearGradient id="grad-ripple-wave" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.16" />
              <stop offset="50%" stopColor="#818cf8" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.16" />
            </linearGradient>

            {/* Core Bridge Interlink Gradient */}
            <linearGradient id="grad-luminous-bridge" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.9" />
            </linearGradient>

            {/* Soft Glow Filter for ambient auras */}
            <filter id="soft-ethereal-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Bridge Aperture Flare Filter */}
            <filter id="bridge-flare-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ── CONCENTRIC ACOUSTIC / GRAVITATIONAL RIPPLES (Matching Reference Image 2) ── */}
          <g className="opacity-70 dark:opacity-40">
            <ellipse cx="530" cy="190" rx="270" ry="110" stroke="url(#grad-ripple-wave)" strokeWidth="1" opacity="0.3" fill="none" />
            <ellipse cx="530" cy="190" rx="350" ry="142" stroke="url(#grad-ripple-wave)" strokeWidth="1" opacity="0.22" fill="none" />
            <ellipse cx="530" cy="190" rx="430" ry="174" stroke="url(#grad-ripple-wave)" strokeWidth="1" opacity="0.15" fill="none" />
            <ellipse cx="530" cy="190" rx="510" ry="205" stroke="url(#grad-ripple-wave)" strokeWidth="1" opacity="0.1" fill="none" />
          </g>

          {/* ── SOLID CONTINUOUS 3D-TILTED CELESTIAL ORBITAL RIBBON ── */}
          <g className="transition-opacity duration-300">
            {/* Ambient diffuse glow tube */}
            <path
              d="M 95 190 C 85 92, 225 32, 530 30 C 835 28, 975 92, 965 190 C 955 288, 815 352, 530 354 C 245 356, 105 288, 95 190"
              stroke="url(#grad-celestial-glow)"
              strokeWidth="4.2"
              fill="none"
              filter="url(#soft-ethereal-glow)"
              opacity="0.45"
            />

            {/* Continuous, solid radiant glass ribbon (NO DASHES) */}
            <path
              d="M 95 190 C 85 92, 225 32, 530 30 C 835 28, 975 92, 965 190 C 955 288, 815 352, 530 354 C 245 356, 105 288, 95 190"
              stroke="url(#grad-celestial-ribbon)"
              strokeWidth="1.8"
              fill="none"
              opacity="0.8"
            />

            {/* Specular glass core highlight for dimensional refraction */}
            <path
              d="M 95 190 C 85 92, 225 32, 530 30 C 835 28, 975 92, 965 190 C 955 288, 815 352, 530 354 C 245 356, 105 288, 95 190"
              stroke="#ffffff"
              strokeWidth="0.75"
              fill="none"
              opacity="0.5"
            />

            {/* Subtle secondary sweeping orbital arc on right side */}
            <path
              d="M 680 90 C 850 115, 985 170, 925 265 C 875 330, 725 354, 530 354"
              stroke="url(#grad-celestial-ribbon)"
              strokeWidth="1.1"
              fill="none"
              opacity="0.35"
            />

            {/* Ethereal glowing celestial star nodes along the ribbon */}
            <circle cx="195" cy="85" r="3.2" fill="#a5b4fc" opacity="0.75" filter="url(#soft-ethereal-glow)" />
            <circle cx="195" cy="85" r="1.4" fill="#ffffff" opacity="0.95" />

            <circle cx="895" cy="135" r="3.2" fill="#93c5fd" opacity="0.75" filter="url(#soft-ethereal-glow)" />
            <circle cx="895" cy="135" r="1.4" fill="#ffffff" opacity="0.95" />

            <circle cx="360" cy="348" r="3.2" fill="#c084fc" opacity="0.75" filter="url(#soft-ethereal-glow)" />
            <circle cx="360" cy="348" r="1.4" fill="#ffffff" opacity="0.95" />

            <circle cx="760" cy="345" r="3.2" fill="#a5b4fc" opacity="0.75" filter="url(#soft-ethereal-glow)" />
            <circle cx="760" cy="345" r="1.4" fill="#ffffff" opacity="0.95" />

            <circle cx="930" cy="225" r="2.8" fill="#60a5fa" opacity="0.7" filter="url(#soft-ethereal-glow)" />
            <circle cx="930" cy="225" r="1.2" fill="#ffffff" opacity="0.9" />

            <circle cx="110" cy="220" r="2.8" fill="#c084fc" opacity="0.7" filter="url(#soft-ethereal-glow)" />
            <circle cx="110" cy="220" r="1.2" fill="#ffffff" opacity="0.9" />
          </g>

          {/* ── MEMORY ↔ RELAY LUMINOUS CORE BRIDGE WITH APERTURE FLARE ── */}
          <g className="transition-opacity duration-300">
            {/* Luminous aura track */}
            <line
              x1="514"
              y1="190"
              x2="546"
              y2="190"
              stroke="url(#grad-luminous-bridge)"
              strokeWidth="5"
              opacity="0.45"
              filter="url(#bridge-flare-glow)"
            />
            {/* Inner radiant beam */}
            <line
              x1="514"
              y1="190"
              x2="546"
              y2="190"
              stroke="url(#grad-luminous-bridge)"
              strokeWidth="2.2"
              opacity="0.9"
            />
            {/* Crisp central spine */}
            <line
              x1="514"
              y1="190"
              x2="546"
              y2="190"
              stroke="#ffffff"
              strokeWidth="1.2"
              opacity="0.95"
            />
            {/* Left anchor node (Memory core anchor) */}
            <circle cx="515" cy="190" r="2.2" fill="#c084fc" opacity="0.95" />
            {/* Right anchor node (Relay core anchor) */}
            <circle cx="545" cy="190" r="2.2" fill="#60a5fa" opacity="0.95" />

            {/* RADIANT APERTURE LENS FLARE / STARBURST in the exact center */}
            <g className="animate-pulse-flare" style={{ transformOrigin: '530px 190px' }}>
              {/* Diffuse horizontal flare */}
              <ellipse cx="530" cy="190" rx="12" ry="2.5" fill="#ffffff" opacity="0.85" filter="url(#bridge-flare-glow)" />
              {/* Vertical starburst ray */}
              <polygon points="530,179 532.5,190 530,201 527.5,190" fill="#ffffff" opacity="0.9" filter="url(#soft-ethereal-glow)" />
              {/* Horizontal starburst ray */}
              <polygon points="519,190 530,192.5 541,190 530,187.5" fill="#ffffff" opacity="0.9" filter="url(#soft-ethereal-glow)" />
              {/* Inner brilliant core */}
              <circle cx="530" cy="190" r="2.4" fill="#ffffff" />
            </g>
          </g>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* ── 6 CURVED FLOW ARROWS WITH VISIBLE ARROWHEADS ────────────── */}
          {/* ══════════════════════════════════════════════════════════════ */}

          {/* ── 1. Top Center: Docs → Memory ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'compose' ? 'opacity-100' : 'opacity-85'}`}>
            <path
              id="path-docs"
              d="M 508 68 C 502 92, 488 112, 475 125"
              stroke="url(#grad-path-docs)"
              strokeWidth={hoveredNode === 'compose' ? "1.8" : "1.4"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-celestial-purple)"
            />
            <circle cx="508" cy="68" r="1.8" fill="#93c5fd" opacity="0.85" />
            {/* Flowing energy particle */}
            <circle r="1.8" fill="#c084fc" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 508 68 C 502 92, 488 112, 475 125')",
              animation: "flowParticleSubtle 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite",
            }} />
          </g>

          {/* ── 2. Upper Left: Sheets → Memory (Curved downward arc) ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'sheet' ? 'opacity-100' : 'opacity-85'}`}>
            <path
              id="path-sheets"
              d="M 285 86 C 335 104, 380 126, 432 146"
              stroke="url(#grad-path-sheets)"
              strokeWidth={hoveredNode === 'sheet' ? "1.8" : "1.4"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-celestial-purple)"
            />
            <circle cx="285" cy="86" r="1.8" fill="#6ee7b7" opacity="0.85" />
            {/* Flowing energy particle */}
            <circle r="1.8" fill="#a5b4fc" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 285 86 C 335 104, 380 126, 432 146')",
              animation: "flowParticleSubtle 3.8s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.5s",
            }} />
          </g>

          {/* ── 3. Upper Right: Deck → Relay (Curved downward arc) ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'deck' ? 'opacity-100' : 'opacity-85'}`}>
            <path
              id="path-deck"
              d="M 775 86 C 725 104, 680 126, 628 146"
              stroke="url(#grad-path-deck)"
              strokeWidth={hoveredNode === 'deck' ? "1.8" : "1.4"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-celestial-blue)"
            />
            <circle cx="775" cy="86" r="1.8" fill="#fdba74" opacity="0.85" />
            {/* Flowing energy particle */}
            <circle r="1.8" fill="#93c5fd" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 775 86 C 725 104, 680 126, 628 146')",
              animation: "flowParticleSubtle 3.8s cubic-bezier(0.4, 0, 0.2, 1) infinite 1.1s",
            }} />
          </g>

          {/* ── 4. Mid Left: Import → Memory (Clean horizontal flow) ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'omni-portal' ? 'opacity-100' : 'opacity-85'}`}>
            <path
              id="path-import"
              d="M 230 190 L 428 190"
              stroke="url(#grad-path-import)"
              strokeWidth={hoveredNode === 'omni-portal' ? "1.8" : "1.4"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-celestial-purple)"
            />
            <circle cx="230" cy="190" r="1.8" fill="#c084fc" opacity="0.85" />
            {/* Flowing energy particle */}
            <circle r="1.8" fill="#c084fc" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 230 190 L 428 190')",
              animation: "flowParticleSubtle 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.2s",
            }} />
          </g>

          {/* ── 5. Lower Right: Whiteboard → Relay (Curved upward arc) ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'whiteboard' ? 'opacity-100' : 'opacity-85'}`}>
            <path
              id="path-whiteboard"
              d="M 770 246 C 725 240, 680 228, 628 212"
              stroke="url(#grad-path-whiteboard)"
              strokeWidth={hoveredNode === 'whiteboard' ? "1.8" : "1.4"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-celestial-blue)"
            />
            <circle cx="770" cy="246" r="1.8" fill="#818cf8" opacity="0.85" />
            {/* Flowing energy particle */}
            <circle r="1.8" fill="#93c5fd" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 770 246 C 725 240, 680 228, 628 212')",
              animation: "flowParticleSubtle 4.0s cubic-bezier(0.4, 0, 0.2, 1) infinite 1.6s",
            }} />
          </g>

          {/* ── 6. Lower Left/Center: Room → Memory (Curved upward arc) ── */}
          <g className={`transition-all duration-300 ${hoveredNode === 'room' ? 'opacity-100' : 'opacity-85'}`}>
            <path
              id="path-room"
              d="M 438 296 C 446 282, 460 270, 472 258"
              stroke="url(#grad-path-room)"
              strokeWidth={hoveredNode === 'room' ? "1.8" : "1.4"}
              strokeLinecap="round"
              fill="none"
              markerEnd="url(#arrow-celestial-purple)"
            />
            <circle cx="438" cy="296" r="1.8" fill="#5eead4" opacity="0.85" />
            {/* Flowing energy particle */}
            <circle r="1.8" fill="#c084fc" filter="url(#soft-ethereal-glow)" style={{
              offsetPath: "path('M 438 296 C 446 282, 460 270, 472 258')",
              animation: "flowParticleSubtle 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.8s",
            }} />
          </g>
        </svg>

        {/* ── HTML Nodes Layer ── */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          
          {/* ========================================================================= */}
          {/* ── CENTRAL CONNECTED CORE: Memory (left) & Relay (right) ─────────────── */}
          {/* Translucent frosted visionOS acrylic glass with chromatic undertones     ── */}
          {/* ========================================================================= */}
          <div className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] flex items-center gap-7 sm:gap-8 pointer-events-auto">
            
            {/* ── MEMORY CARD (Luminous Lavender Frosted Glass) ── */}
            <button
              type="button"
              onClick={() => handleLaunch('memory')}
              onMouseEnter={() => setHoveredNode('memory')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "w-[148px] sm:w-[156px] h-[126px] sm:h-[134px]",
                "rounded-[26px] p-3.5 sm:p-4",
                "flex flex-col items-center justify-center text-center",
                // Luminous lavender/violet frosted visionOS glass infusion matching Reference Image 2
                "bg-gradient-to-b from-white/95 via-purple-50/70 to-purple-100/50 dark:from-zinc-900/90 dark:via-purple-950/40 dark:to-purple-900/30",
                "backdrop-blur-2xl",
                "border border-purple-300/80 dark:border-purple-400/40",
                "shadow-[0_20px_50px_-8px_rgba(168,85,247,0.24),0_4px_16px_rgba(168,85,247,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.95),inset_0_-2px_4px_rgba(168,85,247,0.12)]",
                "transition-all duration-300 cursor-pointer group outline-none",
                hoveredNode === 'memory' ? "scale-[1.03] -translate-y-1 shadow-[0_24px_56px_-6px_rgba(168,85,247,0.36)] border-purple-400" : "",
              ].join(" ")}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-1 text-purple-600 dark:text-purple-300 group-hover:scale-105 transition-transform duration-200 drop-shadow-[0_2px_6px_rgba(168,85,247,0.35)]">
                <MemoryIcon size={21} strokeWidth={1.75} className="text-purple-600 dark:text-purple-300" />
              </div>
              <span className="text-[14.5px] sm:text-[15px] font-semibold text-slate-900 dark:text-white tracking-[-0.01em]">
                Memory
              </span>
              <span className="text-[11px] sm:text-[11.5px] text-slate-500 dark:text-zinc-400 font-normal mt-0.5 leading-snug">
                Your team's<br />shared context
              </span>
            </button>

            {/* ── RELAY CARD (Luminous Sky-Blue Frosted Glass) ── */}
            <button
              type="button"
              onClick={() => handleLaunch('relay')}
              onMouseEnter={() => setHoveredNode('relay')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "w-[148px] sm:w-[156px] h-[126px] sm:h-[134px]",
                "rounded-[26px] p-3.5 sm:p-4",
                "flex flex-col items-center justify-center text-center",
                // Luminous sky-blue frosted visionOS glass infusion matching Reference Image 2
                "bg-gradient-to-b from-white/95 via-sky-50/70 to-sky-100/50 dark:from-zinc-900/90 dark:via-sky-950/40 dark:to-sky-900/30",
                "backdrop-blur-2xl",
                "border border-sky-300/80 dark:border-sky-400/40",
                "shadow-[0_20px_50px_-8px_rgba(56,189,248,0.24),0_4px_16px_rgba(56,189,248,0.08),inset_0_1.5px_2px_rgba(255,255,255,0.95),inset_0_-2px_4px_rgba(56,189,248,0.12)]",
                "transition-all duration-300 cursor-pointer group outline-none",
                hoveredNode === 'relay' ? "scale-[1.03] -translate-y-1 shadow-[0_24px_56px_-6px_rgba(56,189,248,0.36)] border-sky-400" : "",
              ].join(" ")}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-1 text-sky-600 dark:text-sky-300 group-hover:scale-105 transition-transform duration-200 drop-shadow-[0_2px_6px_rgba(56,189,248,0.35)]">
                <RelayIcon size={21} strokeWidth={1.75} className="text-sky-600 dark:text-sky-300" />
              </div>
              <span className="text-[14.5px] sm:text-[15px] font-semibold text-slate-900 dark:text-white tracking-[-0.01em]">
                Relay
              </span>
              <span className="text-[11px] sm:text-[11.5px] text-slate-500 dark:text-zinc-400 font-normal mt-0.5 leading-snug">
                Connects tools,<br />people and ideas
              </span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* ── PERIPHERAL ECOSYSTEM NODES: 6 Tools ────────────────────────────────── */}
          {/* Crisp, clean, luminous Apple frosted acrylic glass with canonical icons   ── */}
          {/* ========================================================================= */}

          {/* ── 1. Top: DOCS ── */}
          <div className="absolute top-[2%] sm:top-[3%] left-[50%] -translate-x-[50%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('compose')}
              onMouseEnter={() => setHoveredNode('compose')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                "bg-white/95 dark:bg-[#18181b]/95",
                "backdrop-blur-xl",
                "border border-white dark:border-white/20",
                "ring-1 ring-slate-900/[0.04] dark:ring-white/[0.04]",
                "shadow-[0_14px_34px_-6px_rgba(15,23,42,0.08),0_3px_10px_rgba(15,23,42,0.03),inset_0_1.5px_1.5px_rgba(255,255,255,0.95)] dark:shadow-[0_14px_34px_-6px_rgba(0,0,0,0.4)]",
                "hover:bg-white dark:hover:bg-[#1f1f23] hover:border-white dark:hover:border-white/30",
                "hover:shadow-[0_18px_40px_-6px_rgba(15,23,42,0.12),0_4px_14px_rgba(15,23,42,0.05)] hover:-translate-y-0.5",
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

          {/* ── 2. Upper Left: SHEETS ── */}
          <div className="absolute top-[10%] sm:top-[12%] left-[10%] sm:left-[12%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('sheet')}
              onMouseEnter={() => setHoveredNode('sheet')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                "bg-white/95 dark:bg-[#18181b]/95",
                "backdrop-blur-xl",
                "border border-white dark:border-white/20",
                "ring-1 ring-slate-900/[0.04] dark:ring-white/[0.04]",
                "shadow-[0_14px_34px_-6px_rgba(15,23,42,0.08),0_3px_10px_rgba(15,23,42,0.03),inset_0_1.5px_1.5px_rgba(255,255,255,0.95)] dark:shadow-[0_14px_34px_-6px_rgba(0,0,0,0.4)]",
                "hover:bg-white dark:hover:bg-[#1f1f23] hover:border-white dark:hover:border-white/30",
                "hover:shadow-[0_18px_40px_-6px_rgba(15,23,42,0.12),0_4px_14px_rgba(15,23,42,0.05)] hover:-translate-y-0.5",
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

          {/* ── 3. Upper Right: DECK ── */}
          <div className="absolute top-[10%] sm:top-[12%] right-[10%] sm:right-[12%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('deck')}
              onMouseEnter={() => setHoveredNode('deck')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                "bg-white/95 dark:bg-[#18181b]/95",
                "backdrop-blur-xl",
                "border border-white dark:border-white/20",
                "ring-1 ring-slate-900/[0.04] dark:ring-white/[0.04]",
                "shadow-[0_14px_34px_-6px_rgba(15,23,42,0.08),0_3px_10px_rgba(15,23,42,0.03),inset_0_1.5px_1.5px_rgba(255,255,255,0.95)] dark:shadow-[0_14px_34px_-6px_rgba(0,0,0,0.4)]",
                "hover:bg-white dark:hover:bg-[#1f1f23] hover:border-white dark:hover:border-white/30",
                "hover:shadow-[0_18px_40px_-6px_rgba(15,23,42,0.12),0_4px_14px_rgba(15,23,42,0.05)] hover:-translate-y-0.5",
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

          {/* ── 4. Mid Left: IMPORT ── */}
          <div className="absolute top-[50%] -translate-y-[50%] left-[5%] sm:left-[7%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('omni-portal')}
              onMouseEnter={() => setHoveredNode('omni-portal')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                "bg-white/95 dark:bg-[#18181b]/95",
                "backdrop-blur-xl",
                "border border-white dark:border-white/20",
                "ring-1 ring-slate-900/[0.04] dark:ring-white/[0.04]",
                "shadow-[0_14px_34px_-6px_rgba(15,23,42,0.08),0_3px_10px_rgba(15,23,42,0.03),inset_0_1.5px_1.5px_rgba(255,255,255,0.95)] dark:shadow-[0_14px_34px_-6px_rgba(0,0,0,0.4)]",
                "hover:bg-white dark:hover:bg-[#1f1f23] hover:border-white dark:hover:border-white/30",
                "hover:shadow-[0_18px_40px_-6px_rgba(15,23,42,0.12),0_4px_14px_rgba(15,23,42,0.05)] hover:-translate-y-0.5",
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

          {/* ── 5. Lower Right: WHITEBOARD ── */}
          <div className="absolute top-[56%] sm:top-[58%] right-[7%] sm:right-[9%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('whiteboard')}
              onMouseEnter={() => setHoveredNode('whiteboard')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                "bg-white/95 dark:bg-[#18181b]/95",
                "backdrop-blur-xl",
                "border border-white dark:border-white/20",
                "ring-1 ring-slate-900/[0.04] dark:ring-white/[0.04]",
                "shadow-[0_14px_34px_-6px_rgba(15,23,42,0.08),0_3px_10px_rgba(15,23,42,0.03),inset_0_1.5px_1.5px_rgba(255,255,255,0.95)] dark:shadow-[0_14px_34px_-6px_rgba(0,0,0,0.4)]",
                "hover:bg-white dark:hover:bg-[#1f1f23] hover:border-white dark:hover:border-white/30",
                "hover:shadow-[0_18px_40px_-6px_rgba(15,23,42,0.12),0_4px_14px_rgba(15,23,42,0.05)] hover:-translate-y-0.5",
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

          {/* ── 6. Lower Left/Bottom: ROOM ── */}
          <div className="absolute bottom-[6%] sm:bottom-[7%] left-[30%] sm:left-[33%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('room')}
              onMouseEnter={() => setHoveredNode('room')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                "bg-white/95 dark:bg-[#18181b]/95",
                "backdrop-blur-xl",
                "border border-white dark:border-white/20",
                "ring-1 ring-slate-900/[0.04] dark:ring-white/[0.04]",
                "shadow-[0_14px_34px_-6px_rgba(15,23,42,0.08),0_3px_10px_rgba(15,23,42,0.03),inset_0_1.5px_1.5px_rgba(255,255,255,0.95)] dark:shadow-[0_14px_34px_-6px_rgba(0,0,0,0.4)]",
                "hover:bg-white dark:hover:bg-[#1f1f23] hover:border-white dark:hover:border-white/30",
                "hover:shadow-[0_18px_40px_-6px_rgba(15,23,42,0.12),0_4px_14px_rgba(15,23,42,0.05)] hover:-translate-y-0.5",
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
