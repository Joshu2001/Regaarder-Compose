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
 * FINAL VISUAL REFINEMENT — MATCH THE REFERENCE:
 * 1. Dramatically softened orbital ring: Opacity reduced by 65–75%, soft ambient glow,
 *    becoming an almost subconscious spatial aura rather than a technical diagram.
 * 2. Card arrangement strictly preserved: Exact spatial coordinates for all 8 tools.
 * 3. Softened central glow: Saturation reduced by 25–30%, feeling like soft light
 *    passing through frosted glass rather than colored neon illumination.
 * 4. Refined directional flow: Arrowheads 35% smaller, softer opacity, conveying
 *    natural light flowing toward the core rather than a flowchart.
 * 5. High-fidelity frosted glass: Translucent multi-stop white gradient surfaces,
 *    deep backdrop blur (backdrop-blur-2xl), delicate specular highlights, and quiet shadows.
 * 6. Clean canvas preserved: Pure minimalist Apple-tier atmospheric depth.
 */

export default function WorkspaceEcosystemVisualizer({ onLaunch, className = '' }) {
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
      {/* ── Keyframes for Gentle Core Light Breathing & Subtle Light Streams ── */}
      <style>{`
        @keyframes pulseApertureFlareSubtle {
          0%, 100% {
            opacity: 0.55;
            transform: scale(0.96);
          }
          50% {
            opacity: 0.75;
            transform: scale(1.04);
          }
        }
        @keyframes pulseBridgeLink {
          0%, 100% {
            opacity: 0.8;
            transform: scale(0.96);
          }
          50% {
            opacity: 1;
            transform: scale(1.04);
          }
        }
        @keyframes flowParticleGentle {
          0% { offset-distance: 0%; opacity: 0; }
          20% { opacity: 0.28; }
          80% { opacity: 0.28; }
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

      {/* ── Outer Ecosystem Stage (Aspect 980 x 340: Compact single-viewport height with breathing room) ── */}
      <div className={`w-full max-w-[980px] h-[320px] sm:h-[340px] relative flex items-center justify-center overflow-visible ${className}`}>
        
        {/* ── Soft Atmospheric Background Illumination (Clean canvas, luminous soft diffusion) ── */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible">
          {/* Broad soft ambient field */}
          <div className="w-[860px] h-[280px] rounded-[100%] bg-gradient-to-r from-blue-100/15 via-indigo-50/10 to-purple-100/15 dark:from-blue-950/10 dark:via-indigo-950/8 dark:to-purple-950/10 blur-[90px] transform -translate-y-1 opacity-40" />
          {/* Delicate lavender aura specifically behind Memory (reduced saturation by 25-30%) */}
          <div className="absolute w-[340px] h-[220px] -translate-x-24 rounded-full bg-purple-300/12 dark:bg-purple-900/12 blur-[75px] opacity-40" />
          {/* Delicate sky-blue aura specifically behind Relay (reduced saturation by 25-30%) */}
          <div className="absolute w-[340px] h-[220px] translate-x-24 rounded-full bg-sky-300/12 dark:bg-blue-900/12 blur-[75px] opacity-40" />
          {/* Faint white center core wash */}
          <div className="w-[440px] h-[180px] rounded-full bg-white/50 dark:bg-white/[0.02] blur-[45px] opacity-40" />
        </div>

        {/* ── SVG Connection Network & Subconscious Orbital Layer (1060 × 380 ViewBox) ── */}
        <svg
          viewBox="0 0 1060 380"
          className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
          fill="none"
        >
          <defs>
            {/* Directional arrowheads: 35% smaller, softer, subtle flow indicators rather than flowchart arrows */}
            <marker
              id="arrow-soft-purple"
              viewBox="0 0 10 10"
              refX="5.5"
              refY="5"
              markerWidth="2.8"
              markerHeight="2.8"
              orient="auto-start-reverse"
            >
              <path d="M 1.5 2.5 L 5.5 5 L 1.5 7.5" fill="none" stroke="#a855f7" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />
            </marker>

            <marker
              id="arrow-soft-blue"
              viewBox="0 0 10 10"
              refX="5.5"
              refY="5"
              markerWidth="2.8"
              markerHeight="2.8"
              orient="auto-start-reverse"
            >
              <path d="M 1.5 2.5 L 5.5 5 L 1.5 7.5" fill="none" stroke="#60a5fa" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />
            </marker>

            {/* Delicate linear gradients for flowing light streams */}
            <linearGradient id="grad-path-docs" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.65" />
            </linearGradient>

            <linearGradient id="grad-path-sheets" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#a5b4fc" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.65" />
            </linearGradient>

            <linearGradient id="grad-path-deck" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fdba74" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#c4b5fd" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.65" />
            </linearGradient>

            <linearGradient id="grad-path-import" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.65" />
            </linearGradient>

            <linearGradient id="grad-path-whiteboard" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.65" />
            </linearGradient>

            <linearGradient id="grad-path-room" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5eead4" stopOpacity="0.45" />
              <stop offset="55%" stopColor="#a5b4fc" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.65" />
            </linearGradient>

            {/* Subconscious, Whisper-Soft Orbital Track Gradients (ambient atmospheric light) */}
            <linearGradient id="grad-celestial-subtle" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.16" />
              <stop offset="30%" stopColor="#a78bfa" stopOpacity="0.20" />
              <stop offset="70%" stopColor="#60a5fa" stopOpacity="0.19" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.16" />
            </linearGradient>

            <linearGradient id="grad-celestial-glow-soft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.07" />
              <stop offset="50%" stopColor="#818cf8" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.07" />
            </linearGradient>

            {/* Delicate ripple gradient */}
            <linearGradient id="grad-ripple-whisper" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.04" />
              <stop offset="50%" stopColor="#818cf8" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.04" />
            </linearGradient>

            {/* Core Bridge Interlink Gradient */}
            <linearGradient id="grad-luminous-bridge" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.65" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.65" />
            </linearGradient>

            {/* Soft Glow Filter for delicate ambient auras */}
            <filter id="soft-whisper-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Atmosphere light blur filter specifically for orbital ribbon softening */}
            <filter id="orbital-atmosphere-soft" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Bridge Aperture Flare Filter */}
            <filter id="bridge-aperture-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ── SUBTLE CONCENTRIC ACOUSTIC RIPPLES (Subconscious background depth) ── */}
          <g className="opacity-30 dark:opacity-15">
            <ellipse cx="530" cy="190" rx="270" ry="110" stroke="url(#grad-ripple-whisper)" strokeWidth="0.7" fill="none" />
            <ellipse cx="530" cy="190" rx="350" ry="142" stroke="url(#grad-ripple-whisper)" strokeWidth="0.7" fill="none" />
            <ellipse cx="530" cy="190" rx="430" ry="174" stroke="url(#grad-ripple-whisper)" strokeWidth="0.7" fill="none" />
          </g>

          {/* ── WHISPER-SOFT AMBIENT ORBITAL FIELD (Ambient atmospheric light, not a drawn ellipse) ── */}
          <g className="transition-opacity duration-300">
            {/* Extremely soft ambient glow under-stroke */}
            <path
              d="M 95 190 C 85 92, 225 32, 530 30 C 835 28, 975 92, 965 190 C 955 288, 815 352, 530 354 C 245 356, 105 288, 95 190"
              stroke="url(#grad-celestial-glow-soft)"
              strokeWidth="2.4"
              fill="none"
              filter="url(#soft-whisper-glow)"
              opacity="0.22"
            />

            {/* Ambient atmospheric light track */}
            <path
              d="M 95 190 C 85 92, 225 32, 530 30 C 835 28, 975 92, 965 190 C 955 288, 815 352, 530 354 C 245 356, 105 288, 95 190"
              stroke="url(#grad-celestial-subtle)"
              strokeWidth="0.8"
              fill="none"
              filter="url(#orbital-atmosphere-soft)"
              opacity="0.28"
            />

            {/* Specular glass core highlight */}
            <path
              d="M 95 190 C 85 92, 225 32, 530 30 C 835 28, 975 92, 965 190 C 955 288, 815 352, 530 354 C 245 356, 105 288, 95 190"
              stroke="#ffffff"
              strokeWidth="0.35"
              fill="none"
              opacity="0.12"
            />

            {/* Secondary sweeping arc */}
            <path
              d="M 680 90 C 850 115, 985 170, 925 265 C 875 330, 725 354, 530 354"
              stroke="url(#grad-celestial-subtle)"
              strokeWidth="0.65"
              fill="none"
              opacity="0.15"
            />

            {/* Delicate celestial star nodes along the track (subtle light specks) */}
            <circle cx="195" cy="85" r="1.6" fill="#a5b4fc" opacity="0.15" filter="url(#soft-whisper-glow)" />
            <circle cx="195" cy="85" r="0.8" fill="#ffffff" opacity="0.3" />

            <circle cx="895" cy="135" r="1.6" fill="#93c5fd" opacity="0.15" filter="url(#soft-whisper-glow)" />
            <circle cx="895" cy="135" r="0.8" fill="#ffffff" opacity="0.3" />

            <circle cx="360" cy="348" r="1.6" fill="#c084fc" opacity="0.15" filter="url(#soft-whisper-glow)" />
            <circle cx="360" cy="348" r="0.8" fill="#ffffff" opacity="0.3" />

            <circle cx="760" cy="345" r="1.6" fill="#a5b4fc" opacity="0.15" filter="url(#soft-whisper-glow)" />
            <circle cx="760" cy="345" r="0.8" fill="#ffffff" opacity="0.3" />
          </g>

          {/* ── MEMORY ↔ RELAY CORE BRIDGE (Architectural link) ── */}
          <g className="transition-opacity duration-300">
            {/* Soft luminous bridge aura */}
            <line
              x1="514"
              y1="190"
              x2="546"
              y2="190"
              stroke="url(#grad-luminous-bridge)"
              strokeWidth="2.5"
              opacity="0.25"
              filter="url(#bridge-aperture-glow)"
            />
            {/* Inner radiant beam */}
            <line
              x1="514"
              y1="190"
              x2="546"
              y2="190"
              stroke="url(#grad-luminous-bridge)"
              strokeWidth="1.2"
              opacity="0.6"
            />
            {/* Crisp central spine */}
            <line
              x1="514"
              y1="190"
              x2="546"
              y2="190"
              stroke="#ffffff"
              strokeWidth="0.8"
              opacity="0.75"
            />
            {/* Left anchor node */}
            <circle cx="515" cy="190" r="1.5" fill="#c084fc" opacity="0.75" />
            {/* Right anchor node */}
            <circle cx="545" cy="190" r="1.5" fill="#60a5fa" opacity="0.75" />

            {/* ARCHITECTURAL DIAMOND BRIDGE LINK NODE in the exact center */}
            <g style={{ transformOrigin: '530px 190px', animation: 'pulseBridgeLink 4s ease-in-out infinite' }}>
              <polygon points="530,186 534,190 530,194 526,190" fill="#ffffff" stroke="#c084fc" strokeWidth="0.75" opacity="0.92" />
              <circle cx="530" cy="190" r="1.2" fill="#60a5fa" opacity="0.9" />
            </g>
          </g>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* ── 6 REFINED DIRECTIONAL CONNECTIONS (Natural light streams) ── */}
          {/* ══════════════════════════════════════════════════════════════ */}

          {/* ── 1. Top Center: Docs → Memory ── */}
          <g className={`transition-all duration-300 ${(hoveredNode === 'compose' || hoveredNode === 'memory') ? 'opacity-100' : 'opacity-65'}`}>
            <path
              id="path-docs"
              d="M 508 68 C 502 92, 488 112, 475 125"
              stroke="url(#grad-path-docs)"
              strokeWidth={(hoveredNode === 'compose' || hoveredNode === 'memory') ? "1.3" : "0.9"}
              strokeLinecap="round"
              fill="none"
              filter={hoveredNode === 'compose' ? "url(#soft-whisper-glow)" : "none"}
              markerEnd="url(#arrow-soft-purple)"
            />
            <circle cx="508" cy="68" r="1.3" fill="#93c5fd" opacity={hoveredNode === 'compose' ? "1" : "0.6"} />
            {/* Flowing energy particle */}
            <circle r={hoveredNode === 'compose' ? "1.5" : "1.2"} fill="#c084fc" filter="url(#soft-whisper-glow)" style={{
              offsetPath: "path('M 508 68 C 502 92, 488 112, 475 125')",
              animation: "flowParticleGentle 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite",
            }} />
          </g>

          {/* ── 2. Upper Left: Sheets → Memory ── */}
          <g className={`transition-all duration-300 ${(hoveredNode === 'sheet' || hoveredNode === 'memory') ? 'opacity-100' : 'opacity-65'}`}>
            <path
              id="path-sheets"
              d="M 285 86 C 335 104, 380 126, 432 146"
              stroke="url(#grad-path-sheets)"
              strokeWidth={(hoveredNode === 'sheet' || hoveredNode === 'memory') ? "1.3" : "0.9"}
              strokeLinecap="round"
              fill="none"
              filter={hoveredNode === 'sheet' ? "url(#soft-whisper-glow)" : "none"}
              markerEnd="url(#arrow-soft-purple)"
            />
            <circle cx="285" cy="86" r="1.3" fill="#6ee7b7" opacity={hoveredNode === 'sheet' ? "1" : "0.6"} />
            {/* Flowing energy particle */}
            <circle r={hoveredNode === 'sheet' ? "1.5" : "1.2"} fill="#a5b4fc" filter="url(#soft-whisper-glow)" style={{
              offsetPath: "path('M 285 86 C 335 104, 380 126, 432 146')",
              animation: "flowParticleGentle 3.8s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.5s",
            }} />
          </g>

          {/* ── 3. Upper Right: Deck → Relay (Harmonized sweeping curve) ── */}
          <g className={`transition-all duration-300 ${(hoveredNode === 'deck' || hoveredNode === 'relay') ? 'opacity-100' : 'opacity-65'}`}>
            <path
              id="path-deck"
              d="M 775 86 C 722 104, 675 124, 628 146"
              stroke="url(#grad-path-deck)"
              strokeWidth={(hoveredNode === 'deck' || hoveredNode === 'relay') ? "1.3" : "0.9"}
              strokeLinecap="round"
              fill="none"
              filter={hoveredNode === 'deck' ? "url(#soft-whisper-glow)" : "none"}
              markerEnd="url(#arrow-soft-blue)"
            />
            <circle cx="775" cy="86" r="1.3" fill="#fdba74" opacity={hoveredNode === 'deck' ? "1" : "0.6"} />
            {/* Flowing energy particle */}
            <circle r={hoveredNode === 'deck' ? "1.5" : "1.2"} fill="#93c5fd" filter="url(#soft-whisper-glow)" style={{
              offsetPath: "path('M 775 86 C 722 104, 675 124, 628 146')",
              animation: "flowParticleGentle 3.8s cubic-bezier(0.4, 0, 0.2, 1) infinite 1.1s",
            }} />
          </g>

          {/* ── 4. Mid Left: Import → Memory ── */}
          <g className={`transition-all duration-300 ${(hoveredNode === 'omni-portal' || hoveredNode === 'memory') ? 'opacity-100' : 'opacity-65'}`}>
            <path
              id="path-import"
              d="M 230 190 L 428 190"
              stroke="url(#grad-path-import)"
              strokeWidth={(hoveredNode === 'omni-portal' || hoveredNode === 'memory') ? "1.3" : "0.9"}
              strokeLinecap="round"
              fill="none"
              filter={hoveredNode === 'omni-portal' ? "url(#soft-whisper-glow)" : "none"}
              markerEnd="url(#arrow-soft-purple)"
            />
            <circle cx="230" cy="190" r="1.3" fill="#c084fc" opacity={hoveredNode === 'omni-portal' ? "1" : "0.6"} />
            {/* Flowing energy particle */}
            <circle r={hoveredNode === 'omni-portal' ? "1.5" : "1.2"} fill="#c084fc" filter="url(#soft-whisper-glow)" style={{
              offsetPath: "path('M 230 190 L 428 190')",
              animation: "flowParticleGentle 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.2s",
            }} />
          </g>

          {/* ── 5. Lower Right: Whiteboard → Relay (Harmonized smooth arc) ── */}
          <g className={`transition-all duration-300 ${(hoveredNode === 'whiteboard' || hoveredNode === 'relay') ? 'opacity-100' : 'opacity-65'}`}>
            <path
              id="path-whiteboard"
              d="M 770 246 C 718 242, 670 230, 628 214"
              stroke="url(#grad-path-whiteboard)"
              strokeWidth={(hoveredNode === 'whiteboard' || hoveredNode === 'relay') ? "1.3" : "0.9"}
              strokeLinecap="round"
              fill="none"
              filter={hoveredNode === 'whiteboard' ? "url(#soft-whisper-glow)" : "none"}
              markerEnd="url(#arrow-soft-blue)"
            />
            <circle cx="770" cy="246" r="1.3" fill="#818cf8" opacity={hoveredNode === 'whiteboard' ? "1" : "0.6"} />
            {/* Flowing energy particle */}
            <circle r={hoveredNode === 'whiteboard' ? "1.5" : "1.2"} fill="#93c5fd" filter="url(#soft-whisper-glow)" style={{
              offsetPath: "path('M 770 246 C 718 242, 670 230, 628 214')",
              animation: "flowParticleGentle 4.0s cubic-bezier(0.4, 0, 0.2, 1) infinite 1.6s",
            }} />
          </g>

          {/* ── 6. Lower Left/Center: Room → Memory ── */}
          <g className={`transition-all duration-300 ${(hoveredNode === 'room' || hoveredNode === 'memory') ? 'opacity-100' : 'opacity-65'}`}>
            <path
              id="path-room"
              d="M 438 282 C 446 272, 460 264, 472 258"
              stroke="url(#grad-path-room)"
              strokeWidth={(hoveredNode === 'room' || hoveredNode === 'memory') ? "1.3" : "0.9"}
              strokeLinecap="round"
              fill="none"
              filter={hoveredNode === 'room' ? "url(#soft-whisper-glow)" : "none"}
              markerEnd="url(#arrow-soft-purple)"
            />
            <circle cx="438" cy="282" r="1.3" fill="#5eead4" opacity={hoveredNode === 'room' ? "1" : "0.6"} />
            {/* Flowing energy particle */}
            <circle r={hoveredNode === 'room' ? "1.5" : "1.2"} fill="#c084fc" filter="url(#soft-whisper-glow)" style={{
              offsetPath: "path('M 438 282 C 446 272, 460 264, 472 258')",
              animation: "flowParticleGentle 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.8s",
            }} />
          </g>
        </svg>

        {/* ── HTML Nodes Layer ── */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          
          {/* ========================================================================= */}
          {/* ── CENTRAL CONNECTED CORE: Memory (left) & Relay (right) ─────────────── */}
          {/* Frosted glass with subtle ambient chromatic undertones (not heavy neon) ── */}
          {/* ========================================================================= */}
          <div className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] flex items-center gap-7 sm:gap-8 pointer-events-auto">
            
            {/* ── MEMORY CARD (Soft Lavender Frosted Glass) ── */}
            <button
              type="button"
              onClick={() => handleLaunch('memory')}
              onMouseEnter={() => setHoveredNode('memory')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "w-[148px] sm:w-[156px] h-[126px] sm:h-[134px]",
                "rounded-[26px] p-3.5 sm:p-4",
                "flex flex-col items-center justify-center text-center",
                // Soft light passing through frosted glass
                "bg-gradient-to-b from-white/92 via-white/80 to-purple-50/35 dark:from-zinc-900/90 dark:via-zinc-900/75 dark:to-purple-950/20",
                "backdrop-blur-2xl",
                "border transition-all duration-300 cursor-pointer group outline-none",
                hoveredNode === 'memory'
                  ? "scale-[1.02] -translate-y-0.5 border-purple-300 dark:border-purple-400 shadow-[0_16px_36px_-6px_rgba(168,85,247,0.18)]"
                  : ['compose', 'sheet', 'omni-portal', 'room'].includes(hoveredNode)
                    ? "border-purple-300/80 dark:border-purple-400/40 shadow-[0_14px_32px_-8px_rgba(168,85,247,0.15)] -translate-y-0.5"
                    : "border-purple-200/80 dark:border-purple-500/35 shadow-[0_8px_28px_-6px_rgba(168,85,247,0.12),0_1px_3px_rgba(0,0,0,0.03),inset_0_1.5px_2px_rgba(255,255,255,0.95),inset_0_-1.5px_2px_rgba(168,85,247,0.04)]",
              ].join(" ")}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-1 text-purple-600 dark:text-purple-300 group-hover:scale-105 transition-transform duration-200 drop-shadow-[0_1.5px_3px_rgba(168,85,247,0.2)]">
                <MemoryIcon size={21} strokeWidth={1.75} className="text-purple-600 dark:text-purple-300" />
              </div>
              <span className="text-[15px] sm:text-[15.5px] font-semibold text-slate-900 dark:text-white tracking-[-0.01em]">
                Memory
              </span>
              <span className="text-[11.5px] sm:text-[12px] text-slate-500 dark:text-zinc-400 font-normal mt-0.5 leading-snug">
                Your team's<br />shared context
              </span>
            </button>

            {/* ── RELAY CARD (Soft Sky-Blue Frosted Glass) ── */}
            <button
              type="button"
              onClick={() => handleLaunch('relay')}
              onMouseEnter={() => setHoveredNode('relay')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "w-[148px] sm:w-[156px] h-[126px] sm:h-[134px]",
                "rounded-[26px] p-3.5 sm:p-4",
                "flex flex-col items-center justify-center text-center",
                // Soft light passing through frosted glass
                "bg-gradient-to-b from-white/92 via-white/80 to-sky-50/35 dark:from-zinc-900/90 dark:via-zinc-900/75 dark:to-sky-950/20",
                "backdrop-blur-2xl",
                "border transition-all duration-300 cursor-pointer group outline-none",
                hoveredNode === 'relay'
                  ? "scale-[1.02] -translate-y-0.5 border-sky-300 dark:border-sky-400 shadow-[0_16px_36px_-6px_rgba(56,189,248,0.18)]"
                  : ['deck', 'whiteboard'].includes(hoveredNode)
                    ? "border-sky-300/80 dark:border-sky-400/40 shadow-[0_14px_32px_-8px_rgba(56,189,248,0.15)] -translate-y-0.5"
                    : "border-sky-200/80 dark:border-sky-500/35 shadow-[0_8px_28px_-6px_rgba(56,189,248,0.12),0_1px_3px_rgba(0,0,0,0.03),inset_0_1.5px_2px_rgba(255,255,255,0.95),inset_0_-1.5px_2px_rgba(56,189,248,0.04)]",
              ].join(" ")}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-1 text-sky-600 dark:text-sky-300 group-hover:scale-105 transition-transform duration-200 drop-shadow-[0_1.5px_3px_rgba(56,189,248,0.2)]">
                <RelayIcon size={21} strokeWidth={1.75} className="text-sky-600 dark:text-sky-300" />
              </div>
              <span className="text-[15px] sm:text-[15.5px] font-semibold text-slate-900 dark:text-white tracking-[-0.01em]">
                Relay
              </span>
              <span className="text-[11.5px] sm:text-[12px] text-slate-500 dark:text-zinc-400 font-normal mt-0.5 leading-snug">
                Connect tools,<br />people and ideas
              </span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* ── PERIPHERAL ECOSYSTEM NODES: 6 Tools ────────────────────────────────── */}
          {/* VisionOS Frosted Acrylic Glass: translucent, inner highlights, soft depth ── */}
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
                // Frosted glass: translucent multi-stop white surface with backdrop blur
                "bg-gradient-to-b from-white/85 via-white/70 to-white/55 dark:from-[#18181b]/85 dark:via-[#18181b]/70 dark:to-[#18181b]/55",
                "backdrop-blur-2xl",
                "border border-white/90 dark:border-white/15",
                "ring-1 ring-slate-900/[0.03] dark:ring-white/[0.03]",
                "shadow-[0_10px_28px_-6px_rgba(15,23,42,0.06),0_2px_6px_rgba(15,23,42,0.02),inset_0_1.5px_1.5px_rgba(255,255,255,0.95),inset_0_-1px_1px_rgba(255,255,255,0.35)] dark:shadow-[0_10px_28px_-6px_rgba(0,0,0,0.35)]",
                "hover:bg-white/90 dark:hover:bg-[#1f1f23]/90 hover:border-white dark:hover:border-white/25",
                "hover:shadow-[0_14px_34px_-6px_rgba(15,23,42,0.09),0_3px_10px_rgba(15,23,42,0.03),inset_0_1.5px_1.5px_rgba(255,255,255,1)] hover:-translate-y-0.5",
                "active:scale-[0.985] transition-all duration-200 cursor-pointer group text-left outline-none",
                hoveredNode === 'compose' ? "border-slate-300 dark:border-white/30 shadow-lg" : "",
              ].join(" ")}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-[0_2px_6px_rgba(59,130,246,0.25),inset_0_1px_1px_rgba(255,255,255,0.4)]">
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
                // Frosted glass: translucent multi-stop white surface with backdrop blur
                "bg-gradient-to-b from-white/85 via-white/70 to-white/55 dark:from-[#18181b]/85 dark:via-[#18181b]/70 dark:to-[#18181b]/55",
                "backdrop-blur-2xl",
                "border border-white/90 dark:border-white/15",
                "ring-1 ring-slate-900/[0.03] dark:ring-white/[0.03]",
                "shadow-[0_10px_28px_-6px_rgba(15,23,42,0.06),0_2px_6px_rgba(15,23,42,0.02),inset_0_1.5px_1.5px_rgba(255,255,255,0.95),inset_0_-1px_1px_rgba(255,255,255,0.35)] dark:shadow-[0_10px_28px_-6px_rgba(0,0,0,0.35)]",
                "hover:bg-white/90 dark:hover:bg-[#1f1f23]/90 hover:border-white dark:hover:border-white/25",
                "hover:shadow-[0_14px_34px_-6px_rgba(15,23,42,0.09),0_3px_10px_rgba(15,23,42,0.03),inset_0_1.5px_1.5px_rgba(255,255,255,1)] hover:-translate-y-0.5",
                "active:scale-[0.985] transition-all duration-200 cursor-pointer group text-left outline-none",
                hoveredNode === 'sheet' ? "border-slate-300 dark:border-white/30 shadow-lg" : "",
              ].join(" ")}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center shrink-0 shadow-[0_2px_6px_rgba(16,185,129,0.25),inset_0_1px_1px_rgba(255,255,255,0.4)]">
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
                // Frosted glass: translucent multi-stop white surface with backdrop blur
                "bg-gradient-to-b from-white/85 via-white/70 to-white/55 dark:from-[#18181b]/85 dark:via-[#18181b]/70 dark:to-[#18181b]/55",
                "backdrop-blur-2xl",
                "border border-white/90 dark:border-white/15",
                "ring-1 ring-slate-900/[0.03] dark:ring-white/[0.03]",
                "shadow-[0_10px_28px_-6px_rgba(15,23,42,0.06),0_2px_6px_rgba(15,23,42,0.02),inset_0_1.5px_1.5px_rgba(255,255,255,0.95),inset_0_-1px_1px_rgba(255,255,255,0.35)] dark:shadow-[0_10px_28px_-6px_rgba(0,0,0,0.35)]",
                "hover:bg-white/90 dark:hover:bg-[#1f1f23]/90 hover:border-white dark:hover:border-white/25",
                "hover:shadow-[0_14px_34px_-6px_rgba(15,23,42,0.09),0_3px_10px_rgba(15,23,42,0.03),inset_0_1.5px_1.5px_rgba(255,255,255,1)] hover:-translate-y-0.5",
                "active:scale-[0.985] transition-all duration-200 cursor-pointer group text-left outline-none",
                hoveredNode === 'deck' ? "border-slate-300 dark:border-white/30 shadow-lg" : "",
              ].join(" ")}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-[0_2px_6px_rgba(245,158,11,0.25),inset_0_1px_1px_rgba(255,255,255,0.4)]">
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
                // Frosted glass: translucent multi-stop white surface with backdrop blur
                "bg-gradient-to-b from-white/85 via-white/70 to-white/55 dark:from-[#18181b]/85 dark:via-[#18181b]/70 dark:to-[#18181b]/55",
                "backdrop-blur-2xl",
                "border border-white/90 dark:border-white/15",
                "ring-1 ring-slate-900/[0.03] dark:ring-white/[0.03]",
                "shadow-[0_10px_28px_-6px_rgba(15,23,42,0.06),0_2px_6px_rgba(15,23,42,0.02),inset_0_1.5px_1.5px_rgba(255,255,255,0.95),inset_0_-1px_1px_rgba(255,255,255,0.35)] dark:shadow-[0_10px_28px_-6px_rgba(0,0,0,0.35)]",
                "hover:bg-white/90 dark:hover:bg-[#1f1f23]/90 hover:border-white dark:hover:border-white/25",
                "hover:shadow-[0_14px_34px_-6px_rgba(15,23,42,0.09),0_3px_10px_rgba(15,23,42,0.03),inset_0_1.5px_1.5px_rgba(255,255,255,1)] hover:-translate-y-0.5",
                "active:scale-[0.985] transition-all duration-200 cursor-pointer group text-left outline-none",
                hoveredNode === 'omni-portal' ? "border-slate-300 dark:border-white/30 shadow-lg" : "",
              ].join(" ")}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-400 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-[0_2px_6px_rgba(168,85,247,0.25),inset_0_1px_1px_rgba(255,255,255,0.4)]">
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
                // Frosted glass: translucent multi-stop white surface with backdrop blur
                "bg-gradient-to-b from-white/85 via-white/70 to-white/55 dark:from-[#18181b]/85 dark:via-[#18181b]/70 dark:to-[#18181b]/55",
                "backdrop-blur-2xl",
                "border border-white/90 dark:border-white/15",
                "ring-1 ring-slate-900/[0.03] dark:ring-white/[0.03]",
                "shadow-[0_10px_28px_-6px_rgba(15,23,42,0.06),0_2px_6px_rgba(15,23,42,0.02),inset_0_1.5px_1.5px_rgba(255,255,255,0.95),inset_0_-1px_1px_rgba(255,255,255,0.35)] dark:shadow-[0_10px_28px_-6px_rgba(0,0,0,0.35)]",
                "hover:bg-white/90 dark:hover:bg-[#1f1f23]/90 hover:border-white dark:hover:border-white/25",
                "hover:shadow-[0_14px_34px_-6px_rgba(15,23,42,0.09),0_3px_10px_rgba(15,23,42,0.03),inset_0_1.5px_1.5px_rgba(255,255,255,1)] hover:-translate-y-0.5",
                "active:scale-[0.985] transition-all duration-200 cursor-pointer group text-left outline-none",
                hoveredNode === 'whiteboard' ? "border-slate-300 dark:border-white/30 shadow-lg" : "",
              ].join(" ")}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-[0_2px_6px_rgba(79,70,229,0.25),inset_0_1px_1px_rgba(255,255,255,0.4)]">
                <WhiteboardIcon size={16} strokeWidth={1.7} className="text-white" />
              </div>
              <div className="flex flex-col min-w-0 pr-1">
                <span className="text-[12.5px] font-semibold text-slate-800 dark:text-zinc-100 leading-tight">Whiteboard</span>
                <span className="text-[10.5px] text-slate-400 dark:text-zinc-500 font-normal leading-tight mt-0.5">Brainstorm, create, iterate</span>
              </div>
            </button>
          </div>

          {/* ── 6. Lower Left/Bottom: ROOM ── */}
          <div className="absolute bottom-[9.5%] sm:bottom-[10.5%] left-[30%] sm:left-[33%] pointer-events-auto">
            <button
              type="button"
              onClick={() => handleLaunch('room')}
              onMouseEnter={() => setHoveredNode('room')}
              onMouseLeave={() => setHoveredNode(null)}
              className={[
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl",
                // Frosted glass: translucent multi-stop white surface with backdrop blur
                "bg-gradient-to-b from-white/85 via-white/70 to-white/55 dark:from-[#18181b]/85 dark:via-[#18181b]/70 dark:to-[#18181b]/55",
                "backdrop-blur-2xl",
                "border border-white/90 dark:border-white/15",
                "ring-1 ring-slate-900/[0.03] dark:ring-white/[0.03]",
                "shadow-[0_10px_28px_-6px_rgba(15,23,42,0.06),0_2px_6px_rgba(15,23,42,0.02),inset_0_1.5px_1.5px_rgba(255,255,255,0.95),inset_0_-1px_1px_rgba(255,255,255,0.35)] dark:shadow-[0_10px_28px_-6px_rgba(0,0,0,0.35)]",
                "hover:bg-white/90 dark:hover:bg-[#1f1f23]/90 hover:border-white dark:hover:border-white/25",
                "hover:shadow-[0_14px_34px_-6px_rgba(15,23,42,0.09),0_3px_10px_rgba(15,23,42,0.03),inset_0_1.5px_1.5px_rgba(255,255,255,1)] hover:-translate-y-0.5",
                "active:scale-[0.985] transition-all duration-200 cursor-pointer group text-left outline-none",
                hoveredNode === 'room' ? "border-slate-300 dark:border-white/30 shadow-lg" : "",
              ].join(" ")}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 text-white flex items-center justify-center shrink-0 shadow-[0_2px_6px_rgba(20,184,166,0.25),inset_0_1px_1px_rgba(255,255,255,0.4)]">
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
