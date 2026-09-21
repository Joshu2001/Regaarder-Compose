import React from "react";
import {
  ComposeIcon,
  DeckIcon,
  SheetIcon,
  RoomIcon,
  WhiteboardIcon,
  RelayIcon,
  BrowserIcon,
  NotesIcon
} from "../RegaarderProductIcons";

/**
 * App Native SVG Icon:
 * Supports variant="tile" (default for Home/Recents/Library: rich dimensional 2D product/file identity)
 * and variant="minimal" (for document tabs: clean ~14-16px outline glyph without background box).
 *
 * Distinctive Product Shapes & Silhouettes:
 * - Docs: Taller portrait page ratio with a physical 45° dog-ear corner fold and text rules.
 * - Notes: Distinct notebook silhouette with an exposed spiral binder spine (metal wire loops) and margin rule.
 * - Sheets: Grid matrix ledger tile with emerald ribbon, column dividers, and data cell highlight.
 * - Deck: True 16:9 widescreen presentation display canvas with layered background slide plate.
 * - Whiteboard: Studio drafting board on a visible wooden/aluminum tripod easel stand with top clamp.
 * - Room: Optical studio camera horizon with dual-ring aperture glass and tally status light.
 * - PDF: Document page silhouette with folded corner and signature red identity block.
 */
export function AppNativeSvgIcon({ type, size = 24, className = "", variant = "tile" }) {
  const norm = (type || "").toLowerCase();

  // ---------------------------------------------------------------------------
  // Minimal tab mode: simplified crisp dimensional-2D silhouettes (12–16px)
  // Preserves filled body, distinct silhouette, and restrained dual-tone depth
  // without visual clutter or uncontained monoline flatness.
  // ---------------------------------------------------------------------------
  if (variant === "minimal") {
    // 1. SHEETS: Crisp Emerald Ledger Tile with header ribbon & data cells
    if (norm.includes("sheet")) {
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 select-none overflow-visible ${className}`}
        >
          {/* Base ledger plate */}
          <rect x="1.5" y="1.5" width="13" height="13" rx="3.2" fill="#10B981" />
          {/* Subtle bottom bevel shelf */}
          <path d="M2.5 13.5C3.5 14.2 4.8 14.5 6.5 14.5H10.5C12.2 14.5 13.5 14.2 14.5 13.5V11.5H1.5V13.5H2.5Z" fill="#047857" opacity="0.6" />
          {/* Inner data matrix surface */}
          <rect x="3.2" y="3.2" width="9.6" height="9.6" rx="1.6" fill="#FFFFFF" />
          {/* Header ribbon */}
          <path d="M3.2 4.8C3.2 3.9 3.9 3.2 4.8 3.2H11.2C12.1 3.2 12.8 3.9 12.8 4.8V6.2H3.2V4.8Z" fill="#A7F3D0" />
          {/* Crisp grid division */}
          <line x1="3.2" y1="9.4" x2="12.8" y2="9.4" stroke="#059669" strokeWidth="0.8" opacity="0.4" />
          <line x1="8" y1="6.2" x2="8" y2="12.8" stroke="#059669" strokeWidth="0.8" opacity="0.4" />
          {/* Active cell indicator */}
          <rect x="4.2" y="7.2" width="2.6" height="1.6" rx="0.4" fill="#10B981" />
        </svg>
      );
    }

    // 2. DECK: 16:9 Widescreen Presentation Plate with stacked slide layer
    if (norm.includes("deck") || norm.includes("present") || norm.includes("slide")) {
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 select-none overflow-visible ${className}`}
        >
          {/* Background layered slide edge */}
          <rect x="3.5" y="2" width="11" height="8" rx="2" fill="#FED7AA" />
          {/* Foreground widescreen slide body */}
          <rect x="1.5" y="3.8" width="13" height="10.2" rx="2.5" fill="#F97316" />
          {/* Lateral depth facet */}
          <path d="M12.5 4C13.8 4.2 14.5 5 14.5 6.5V12C14.5 13.2 13.8 13.8 12.5 14H13C14.2 13.7 14.5 12.8 14.5 11.5V6C14.5 4.8 14 4.2 12.5 4Z" fill="#C2410C" opacity="0.65" />
          {/* Inner slide projection screen */}
          <rect x="3" y="5.2" width="10" height="7.2" rx="1.4" fill="#FFFFFF" />
          {/* Ascending metric bars */}
          <rect x="4.4" y="9.2" width="1.6" height="2.2" rx="0.3" fill="#FDBA74" />
          <rect x="6.6" y="8" width="1.6" height="3.4" rx="0.3" fill="#FB923C" />
          <rect x="8.8" y="6.8" width="1.6" height="4.6" rx="0.3" fill="#EA580C" />
          {/* Header rule */}
          <line x1="4.4" y1="6.4" x2="7.4" y2="6.4" stroke="#F97316" strokeWidth="0.8" strokeLinecap="round" />
        </svg>
      );
    }

    // 3. WHITEBOARD: Studio Drafting Canvas with visible easel legs & diagram
    if (norm.includes("whiteboard") || norm.includes("canvas")) {
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 select-none overflow-visible ${className}`}
        >
          {/* Visible easel legs */}
          <line x1="3.2" y1="10.5" x2="1.5" y2="15" stroke="#60A5FA" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="12.8" y1="10.5" x2="14.5" y2="15" stroke="#60A5FA" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="8" y1="11" x2="8" y2="15.2" stroke="#3B82F6" strokeWidth="1" strokeLinecap="round" />
          {/* Main drafting board frame */}
          <rect x="1.5" y="1.5" width="13" height="9.8" rx="2.4" fill="#3B82F6" />
          {/* Board bevel */}
          <path d="M12 1.6C13.5 1.8 14.5 2.5 14.5 4V9C14.5 10.2 13.5 11 12 11.2H12.5C13.8 11 14.5 10 14.5 8.8V3.8C14.5 2.5 13.8 1.8 12.5 1.6H12Z" fill="#1D4ED8" opacity="0.6" />
          {/* Top drafting clamp */}
          <rect x="6" y="0.8" width="4" height="1.4" rx="0.7" fill="#BFDBFE" />
          {/* Inner drawing surface */}
          <rect x="2.8" y="2.8" width="10.4" height="7.2" rx="1.4" fill="#FFFFFF" />
          {/* Diagram sparkline & focal node */}
          <path d="M4.5 7.8L7 5.2L9.5 6.8L11.5 4.5" stroke="#2563EB" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="11.5" cy="4.5" r="0.9" fill="#1D4ED8" />
        </svg>
      );
    }

    // 4. NOTES: Spiral Notebook Silhouette with metal wire loops
    if (norm.includes("notes") || norm.includes("notebook")) {
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 select-none overflow-visible ${className}`}
        >
          {/* Main notebook cover */}
          <rect x="2.2" y="1.5" width="12.5" height="13.2" rx="2.8" fill="#F59E0B" />
          {/* Darker spine binding */}
          <path d="M2.2 4.3C2.2 2.8 3.2 1.5 5 1.5V14.7C3.2 14.7 2.2 13.4 2.2 11.9V4.3Z" fill="#B45309" />
          {/* Inset writing paper */}
          <rect x="5.8" y="2.8" width="7.8" height="10.5" rx="1.5" fill="#FFFFFF" />
          {/* Ruled content lines */}
          <line x1="7.2" y1="5.2" x2="12" y2="5.2" stroke="#D97706" strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />
          <line x1="7.2" y1="7.8" x2="12" y2="7.8" stroke="#D97706" strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />
          <line x1="7.2" y1="10.4" x2="10.5" y2="10.4" stroke="#D97706" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
          {/* Exposed spiral wire loops */}
          {[3.8, 6.8, 9.8, 12.4].map((y) => (
            <rect key={y} x="1.2" y={y - 0.7} width="2.6" height="1.4" rx="0.7" fill="#FFFFFF" />
          ))}
        </svg>
      );
    }

    // 5. ROOM: Studio Video Aperture & Lens
    if (norm.includes("room") || norm.includes("meet")) {
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 select-none overflow-visible ${className}`}
        >
          <rect x="1.5" y="1.5" width="13" height="13" rx="3.5" fill="#7C3AED" />
          <path d="M11.5 1.6C13.2 1.8 14.5 2.8 14.5 4.5V11.5C14.5 13.2 13.2 14.2 11.5 14.4H12C13.5 14.1 14.5 13 14.5 11.5V4.5C14.5 3 13.5 1.9 12 1.6H11.5Z" fill="#5B21B6" opacity="0.6" />
          {/* Video chamber display stage */}
          <rect x="3.2" y="3.5" width="9.6" height="8.8" rx="1.8" fill="#FFFFFF" />
          {/* Lens core & aperture highlight */}
          <circle cx="7" cy="7.8" r="2.2" fill="#6D28D9" />
          <circle cx="6.4" cy="7.2" r="0.7" fill="#FFFFFF" opacity="0.85" />
          {/* Live meeting tally dot */}
          <circle cx="10.8" cy="5.4" r="0.9" fill="#10B981" />
        </svg>
      );
    }

    // 6. RELAY: Intertwined Dual Communications Surface & Nexus Node
    if (norm.includes("relay") || norm.includes("dm") || norm === "chat" || norm === "message") {
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 select-none overflow-visible ${className}`}
        >
          {/* Primary Relay chassis */}
          <rect x="1.5" y="1.8" width="13" height="12.4" rx="3.2" fill="#6366F1" />
          <path d="M11.5 2C13 2.2 14.5 3.2 14.5 4.8V11C14.5 12.5 13 13.8 11.5 14H12C13.5 13.8 14.5 12.6 14.5 11V4.8C14.5 3.2 13.5 2.2 12 2H11.5Z" fill="#4338CA" opacity="0.6" />
          {/* Rear context plate */}
          <rect x="5.2" y="3.8" width="7.2" height="5.2" rx="1.6" fill="#312E81" opacity="0.55" />
          <circle cx="10.4" cy="5.8" r="0.8" fill="#FFFFFF" opacity="0.9" />
          {/* Foreground collaboration plate */}
          <rect x="3.4" y="6" width="7.8" height="6" rx="1.8" fill="#FFFFFF" />
          {/* Pulse track & anchor */}
          <line x1="5.2" y1="8.2" x2="9.2" y2="8.2" stroke="#4F46E5" strokeWidth="0.9" strokeLinecap="round" />
          <circle cx="9.2" cy="10" r="1" fill="#6366F1" />
        </svg>
      );
    }

    // 7. BROWSER
    if (norm.includes("browser")) {
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 select-none overflow-visible ${className}`}
        >
          <rect x="1.5" y="1.5" width="13" height="13" rx="3.2" fill="#2563EB" />
          <circle cx="8" cy="8" r="4.2" stroke="#FFFFFF" strokeWidth="1.2" />
          <ellipse cx="8" cy="8" rx="2" ry="4.2" stroke="#BFDBFE" strokeWidth="0.9" />
          <line x1="3.8" y1="8" x2="12.2" y2="8" stroke="#BFDBFE" strokeWidth="0.9" />
        </svg>
      );
    }

    // 8. PDF: Red Document Page with Fold
    if (norm.includes("pdf")) {
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 select-none overflow-visible ${className}`}
        >
          <path d="M3 1.5H10.5L13.8 4.8V13.5C13.8 14.1 13.2 14.5 12.5 14.5H3C2.4 14.5 2 14.1 2 13.5V2.5C2 1.9 2.4 1.5 3 1.5Z" fill="#EF4444" />
          <path d="M10.5 1.5V4.2C10.5 4.6 10.9 5 11.3 5H13.8L10.5 1.5Z" fill="#FCA5A5" />
          <rect x="4.2" y="7" width="6.6" height="2" rx="0.5" fill="#FFFFFF" />
          <line x1="4.2" y1="10.5" x2="9.8" y2="10.5" stroke="#FFFFFF" strokeWidth="0.9" strokeLinecap="round" opacity="0.8" />
        </svg>
      );
    }

    // 9. DEFAULT / DOCS: Portrait Page with Physical Dog-Ear Fold & Content Lines
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 select-none overflow-visible ${className}`}
      >
        {/* Document Page Silhouette */}
        <path
          d="M3 1.5H10.5L13.8 4.8V13.5C13.8 14.1 13.2 14.5 12.5 14.5H3C2.4 14.5 2 14.1 2 13.5V2.5C2 1.9 2.4 1.5 3 1.5Z"
          fill="#8B5CF6"
        />
        {/* Lateral thickness facet */}
        <path
          d="M13 4.8V13.5C13 13.9 12.6 14.3 12.2 14.4H12.5C13.2 14.2 13.8 13.5 13.8 12.8V4.8H13Z"
          fill="#5B21B6"
          opacity="0.6"
        />
        {/* Physical 45-degree dog-ear folded corner */}
        <path
          d="M10.5 1.5V4.2C10.5 4.6 10.9 5 11.3 5H13.8L10.5 1.5Z"
          fill="#C4B5FD"
        />
        {/* Document Content Rules */}
        <rect x="4.2" y="7" width="7" height="1.5" rx="0.75" fill="#FFFFFF" />
        <rect x="4.2" y="9.5" width="5.5" height="1.3" rx="0.65" fill="#DDD6FE" opacity="0.9" />
        <rect x="4.2" y="11.8" width="4" height="1.1" rx="0.55" fill="#DDD6FE" opacity="0.75" />
      </svg>
    );
  }

  // ---------------------------------------------------------------------------
  // Standalone unboxed tools
  // ---------------------------------------------------------------------------
  if (norm.includes("browser")) {
    return (
      <div className={`flex items-center justify-center shrink-0 text-[#2563EB] ${className}`}>
        <BrowserIcon size={size} strokeWidth={2.1} />
      </div>
    );
  }


  // ---------------------------------------------------------------------------
  // 1. DOCS: Vertical Document Page with Physical Dog-Ear Fold & Content Lines
  // ---------------------------------------------------------------------------
  if (norm.includes("doc") || norm === "compose") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 select-none overflow-visible ${className}`}
        style={{ width: size, height: size }}
      >
        <defs>
          <linearGradient id="docBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#6D28D9" />
          </linearGradient>
          <linearGradient id="docFoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C4B5FD" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
          <linearGradient id="docBevelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5B21B6" />
            <stop offset="100%" stopColor="#4C1D95" />
          </linearGradient>
        </defs>

        {/* Soft ground contact shadow */}
        <path d="M4 22H20C21.1 22 22 21.1 22 20V4L16 1.5H4C2.9 1.5 2 2.4 2 3.5V20C2 21.1 2.9 22 4 22Z" fill="#0F172A" opacity="0.12" transform="translate(0, 1)" />

        {/* Document Page Silhouette with Dog-Ear Cutout */}
        <path
          d="M4.5 1.5H15.5L21.5 7.5V20.5C21.5 21.6 20.6 22.5 19.5 22.5H4.5C3.4 22.5 2.5 21.6 2.5 20.5V3.5C2.5 2.4 3.4 1.5 4.5 1.5Z"
          fill="url(#docBodyGrad)"
        />

        {/* Right lateral thickness / spine shadow */}
        <path
          d="M20.5 7.5V20.5C20.5 21.1 20 21.6 19.4 21.6H20C21 21.2 21.5 20.2 21.5 19.2V7.5H20.5Z"
          fill="url(#docBevelGrad)"
          opacity="0.6"
        />

        {/* Top ambient highlight line */}
        <path d="M5 2.2H15C15.3 2.2 15.6 2.4 15.8 2.6L20.8 7.6C21 7.8 21.1 8 21.1 8.3V8.8C20.8 8.4 20.5 8 20 7.7L15.3 3C15.1 2.8 14.8 2.7 14.5 2.7H5C3.8 2.7 2.9 3.4 2.6 4.3C2.8 3.1 3.8 2.2 5 2.2Z" fill="#FFFFFF" opacity="0.45" />

        {/* Crisp Physical Folded Corner Flap */}
        <path
          d="M15.5 1.5V6C15.5 6.8 16.2 7.5 17 7.5H21.5L15.5 1.5Z"
          fill="url(#docFoldGrad)"
        />
        {/* Soft shadow under corner fold */}
        <path d="M15 7.5L21 7.5L15.5 8.2Z" fill="#4C1D95" opacity="0.4" />

        {/* Document Content Lines (Visual Mass) */}
        <rect x="6" y="10" width="10.5" height="2" rx="1" fill="#FFFFFF" />
        <rect x="6" y="13.5" width="8.5" height="1.6" rx="0.8" fill="#DDD6FE" opacity="0.9" />
        <rect x="6" y="16.5" width="6" height="1.4" rx="0.7" fill="#DDD6FE" opacity="0.75" />
      </svg>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. NOTES: Distinct Spiral Notebook with Exposed Wire Loops & Margin Strip
  // ---------------------------------------------------------------------------
  if (norm.includes("notes") || norm.includes("notebook")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 select-none overflow-visible ${className}`}
        style={{ width: size, height: size }}
      >
        <defs>
          <linearGradient id="notesBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="notesSpineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
          <linearGradient id="notesWireGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FDE68A" />
          </linearGradient>
        </defs>

        {/* Ground shadow */}
        <rect x="3.5" y="3" width="18" height="19" rx="4.5" fill="#0F172A" opacity="0.12" />

        {/* Main Notebook Cover (offset to the right of the spiral edge) */}
        <rect x="3" y="1.5" width="19" height="20.5" rx="4.5" fill="url(#notesBodyGrad)" />

        {/* Darker spine foundation strip */}
        <path d="M3 6C3 3.5 4.5 1.5 7.5 1.5V22C4.5 22 3 20 3 17.5V6Z" fill="url(#notesSpineGrad)" />

        {/* Inset Writing Card */}
        <rect x="8.5" y="3.5" width="12" height="16.5" rx="2.5" fill="#FFFFFF" />

        {/* Margin Guide Line */}
        <line x1="11.5" y1="3.5" x2="11.5" y2="20" stroke="#FDE68A" strokeWidth="1" />

        {/* Ruled content lines */}
        <line x1="13" y1="7" x2="18.5" y2="7" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />
        <line x1="13" y1="10.5" x2="18.5" y2="10.5" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />
        <line x1="13" y1="14" x2="17" y2="14" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />
        <line x1="13" y1="17.2" x2="16" y2="17.2" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />

        {/* Distinct Exposed Metal Spiral Loops (Cuts into left spine edge) */}
        {[5, 9, 13, 17].map((y) => (
          <g key={y}>
            <rect x="1.5" y={y - 1.2} width="4.2" height="2.4" rx="1.2" fill="url(#notesWireGrad)" />
            <rect x="2" y={y - 0.7} width="3" height="1.4" rx="0.7" fill="#78350F" opacity="0.6" />
          </g>
        ))}

        {/* Top ambient highlight line */}
        <path d="M7.5 2.2H18C19.5 2.2 20.8 3.2 21 4.6C20.6 3.5 19.4 2.7 18 2.7H7.5V2.2Z" fill="#FFFFFF" opacity="0.4" />
      </svg>
    );
  }

  // ---------------------------------------------------------------------------
  // 3. SHEETS: Rounded Spreadsheet Ledger with Distinct Header & Cell Matrix
  // ---------------------------------------------------------------------------
  if (norm.includes("sheet")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 select-none overflow-visible ${className}`}
        style={{ width: size, height: size }}
      >
        <defs>
          <linearGradient id="sheetBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="sheetBevelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#065F46" />
            <stop offset="100%" stopColor="#064E3B" />
          </linearGradient>
        </defs>

        <rect x="2.5" y="3" width="19" height="19" rx="5" fill="#0F172A" opacity="0.12" />
        <rect x="1.5" y="1.5" width="21" height="20.5" rx="5" fill="url(#sheetBodyGrad)" />

        <path
          d="M17.5 1.7C20 2 22 3.8 22.3 6.5V16.8C22.3 19.5 20.3 21.6 17.6 22H19C21 21.5 22.5 19.8 22.5 17.5V6C22.5 3.5 20.5 1.8 18 1.7H17.5Z"
          fill="url(#sheetBevelGrad)"
          opacity="0.55"
        />

        <path d="M5 2.2H19C20.5 2.2 21.8 3.2 22 4.6C21.6 3.5 20.4 2.7 19 2.7H5C3.6 2.7 2.4 3.5 2 4.6C2.2 3.2 3.5 2.2 5 2.2Z" fill="#FFFFFF" opacity="0.4" />

        {/* Physical Grid Inset Card */}
        <g transform="translate(5, 5)">
          <rect x="0.5" y="1" width="13.5" height="13.5" rx="2.5" fill="#064E3B" opacity="0.45" />
          <rect x="0" y="0" width="14" height="14" rx="2.5" fill="#FFFFFF" />

          {/* Accent Header Ribbon */}
          <rect x="0" y="0" width="14" height="4.5" rx="2.5" fill="#D1FAE5" />
          <rect x="0" y="2" width="14" height="2.5" fill="#D1FAE5" />

          {/* Grid partition lines */}
          <line x1="0" y1="4.5" x2="14" y2="4.5" stroke="#10B981" strokeWidth="0.8" opacity="0.7" />
          <line x1="0" y1="9.2" x2="14" y2="9.2" stroke="#047857" strokeWidth="0.65" opacity="0.25" />
          <line x1="4.8" y1="0" x2="4.8" y2="14" stroke="#047857" strokeWidth="0.75" opacity="0.3" />
          <line x1="9.5" y1="4.5" x2="9.5" y2="14" stroke="#047857" strokeWidth="0.65" opacity="0.25" />

          {/* Filled active data cell */}
          <rect x="1.2" y="5.7" width="2.5" height="2.5" rx="0.5" fill="#10B981" />
          <rect x="5.8" y="10.2" width="2.6" height="2.6" rx="0.5" fill="#34D399" opacity="0.7" />
        </g>
      </svg>
    );
  }

  // ---------------------------------------------------------------------------
  // 4. DECK: Authentic 16:9 Widescreen Presentation Display Plate
  // ---------------------------------------------------------------------------
  if (norm.includes("deck") || norm.includes("present") || norm.includes("slide")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 select-none overflow-visible ${className}`}
        style={{ width: size, height: size }}
      >
        <defs>
          <linearGradient id="deckBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#C2410C" />
          </linearGradient>
          <linearGradient id="deckBackSlideGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFEDD5" />
            <stop offset="100%" stopColor="#FED7AA" />
          </linearGradient>
          <linearGradient id="deckBevelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9A3412" />
            <stop offset="100%" stopColor="#7C2D12" />
          </linearGradient>
        </defs>

        {/* Soft ground shadow */}
        <rect x="2" y="4" width="20" height="17" rx="4" fill="#0F172A" opacity="0.12" />

        {/* Back Stacked Slide Plate (signals multiple presentation slides) */}
        <rect x="4.5" y="2" width="17" height="12" rx="3" fill="url(#deckBackSlideGrad)" />
        <rect x="4.5" y="2" width="17" height="12" rx="3" stroke="#EA580C" strokeWidth="0.5" opacity="0.5" />

        {/* Foreground Primary 16:9 Widescreen Slide Bezel */}
        <rect x="1.5" y="4.5" width="21" height="15.5" rx="3.5" fill="url(#deckBodyGrad)" />

        {/* Right lateral thickness facet */}
        <path
          d="M18 4.7C20.5 5 22 6.5 22.3 8.5V17C22.3 19 20.5 20 18.5 20H19.5C21.5 19.5 22.5 18 22.5 16V8C22.5 6 21 4.8 18.5 4.7H18Z"
          fill="url(#deckBevelGrad)"
          opacity="0.55"
        />

        {/* Top ambient highlight */}
        <path d="M4 5.2H20C21.2 5.2 22 5.9 22.2 7C21.8 6.1 20.8 5.6 19.5 5.6H4C2.7 5.6 1.7 6.1 1.3 7C1.5 5.9 2.5 5.2 4 5.2Z" fill="#FFFFFF" opacity="0.4" />

        {/* Inner Presentation Screen Surface */}
        <g transform="translate(4, 7)">
          <rect x="0" y="0" width="16" height="10.5" rx="1.8" fill="#FFFFFF" />

          {/* Presentation Header Title Bar */}
          <rect x="1.5" y="1.5" width="5.5" height="1.4" rx="0.7" fill="#F97316" />

          {/* Ascending Metric Bar Chart */}
          <rect x="2" y="5.5" width="2.2" height="3.5" rx="0.5" fill="#FED7AA" />
          <rect x="5.2" y="4" width="2.2" height="5" rx="0.5" fill="#FB923C" />
          <rect x="8.4" y="2.5" width="2.2" height="6.5" rx="0.5" fill="#EA580C" />

          {/* Keynote Projection Bullet Line */}
          <line x1="11.8" y1="4" x2="14.5" y2="4" stroke="#F97316" strokeWidth="0.8" strokeLinecap="round" opacity="0.8" />
          <line x1="11.8" y1="6" x2="14.5" y2="6" stroke="#C2410C" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
          <line x1="11.8" y1="8" x2="13.8" y2="8" stroke="#C2410C" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
        </g>
      </svg>
    );
  }

  // ---------------------------------------------------------------------------
  // 5. WHITEBOARD: Studio Drafting Canvas on Visible Tripod Easel Stand
  // ---------------------------------------------------------------------------
  if (norm.includes("whiteboard") || norm.includes("canvas")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 select-none overflow-visible ${className}`}
        style={{ width: size, height: size }}
      >
        <defs>
          <linearGradient id="boardBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="boardBevelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E40AF" />
            <stop offset="100%" stopColor="#172554" />
          </linearGradient>
        </defs>

        {/* Tripod Easel Legs (Clearly visible structural silhouette extending to the bottom) */}
        <path d="M4 15L1.5 22.5M20 15L22.5 22.5" stroke="#93C5FD" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="12" y1="16" x2="12" y2="23" stroke="#60A5FA" strokeWidth="1.4" strokeLinecap="round" />

        {/* Soft ground shadow for canvas frame */}
        <rect x="2.5" y="3" width="19" height="14" rx="3.5" fill="#0F172A" opacity="0.12" />

        {/* Main Canvas Board Frame */}
        <rect x="1.5" y="1.5" width="21" height="15" rx="3.5" fill="url(#boardBodyGrad)" />

        {/* Right lateral facet */}
        <path
          d="M17.5 1.7C20 2 22 3.2 22.3 5V13C22.3 14.8 20.5 16 18.5 16.5H19C21 16 22.5 14.8 22.5 13V5C22.5 3.2 21 2 18 1.7H17.5Z"
          fill="url(#boardBevelGrad)"
          opacity="0.55"
        />

        {/* Top drafting clamp / title bar */}
        <rect x="8.5" y="0.5" width="7" height="2.2" rx="1.1" fill="#BFDBFE" />
        <rect x="9" y="1" width="6" height="1" rx="0.5" fill="#1D4ED8" opacity="0.4" />

        {/* Top ambient highlight */}
        <path d="M4 2.2H19C20.5 2.2 21.8 2.8 22 3.8C21.6 3 20.4 2.5 19 2.5H4C2.6 2.5 1.4 3 1 3.8C1.2 2.8 2.5 2.2 4 2.2Z" fill="#FFFFFF" opacity="0.4" />

        {/* Inner Whiteboard Drawing Plane */}
        <g transform="translate(3.5, 3.5)">
          <rect x="0" y="0" width="17" height="11" rx="2" fill="#FFFFFF" />

          {/* Grid pattern / creative workspace nodes */}
          <path d="M2.5 8L6.5 4L11 6.5L14.5 3" stroke="#2563EB" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="2.5" cy="8" r="1.1" fill="#3B82F6" />
          <circle cx="6.5" cy="4" r="1.3" fill="#1D4ED8" />
          <circle cx="11" cy="6.5" r="1.1" fill="#60A5FA" />
          <circle cx="14.5" cy="3" r="1.3" fill="#1D4ED8" />

          {/* Bottom marker shelf */}
          <rect x="4" y="9.5" width="9" height="1" rx="0.5" fill="#DBEAFE" />
        </g>
      </svg>
    );
  }

  // ---------------------------------------------------------------------------
  // 6. ROOM: Studio Video Horizon / Optical Aperture Meeting Object
  // ---------------------------------------------------------------------------
  if (norm.includes("room") || norm.includes("meet")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 select-none overflow-visible ${className}`}
        style={{ width: size, height: size }}
      >
        <defs>
          <linearGradient id="roomBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#5B21B6" />
          </linearGradient>
          <linearGradient id="roomLensGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#4C1D95" />
          </linearGradient>
          <linearGradient id="roomBevelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4C1D95" />
            <stop offset="100%" stopColor="#2E1065" />
          </linearGradient>
        </defs>

        <rect x="2.5" y="3" width="19" height="19" rx="5.5" fill="#0F172A" opacity="0.12" />
        <rect x="1.5" y="1.5" width="21" height="20.5" rx="5.5" fill="url(#roomBodyGrad)" />
        <path
          d="M17.5 1.7C20 2 22 3.8 22.3 6.5V16.8C22.3 19.5 20.3 21.6 17.6 22H19C21 21.5 22.5 19.8 22.5 17.5V6C22.5 3.5 20.5 1.8 18 1.7H17.5Z"
          fill="url(#roomBevelGrad)"
          opacity="0.55"
        />
        <path d="M5 2.2H19C20.5 2.2 21.8 3.2 22 4.6C21.6 3.5 20.4 2.7 19 2.7H5C3.6 2.7 2.4 3.5 2 4.6C2.2 3.2 3.5 2.2 5 2.2Z" fill="#FFFFFF" opacity="0.4" />

        {/* Video Chamber / Meeting Perspective Chamber */}
        <g transform="translate(5, 5)">
          <rect x="0.5" y="1" width="14" height="13.5" rx="2.5" fill="#2E1065" opacity="0.45" />

          {/* Overlapping Chamber Stage (Collaborative Presence) */}
          <rect x="4" y="0.5" width="10" height="9" rx="2.2" fill="#C4B5FD" opacity="0.85" />
          <rect x="0" y="4" width="11" height="9.5" rx="2.2" fill="#FFFFFF" />

          {/* Optical Iris Aperture Core */}
          <circle cx="5.5" cy="8.7" r="2.8" fill="url(#roomLensGrad)" />
          <circle cx="4.8" cy="8" r="0.9" fill="#FFFFFF" opacity="0.9" />

          {/* Live Meeting Tally Dot */}
          <circle cx="9.2" cy="5.8" r="0.9" fill="#10B981" />
        </g>
      </svg>
    );
  }

  // ---------------------------------------------------------------------------
  // 7. RELAY: Dimensional 2D Interconnected Communication & Contextual Layer
  // ---------------------------------------------------------------------------
  if (norm.includes("relay") || norm.includes("dm") || norm === "chat" || norm === "message") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 select-none overflow-visible ${className}`}
        style={{ width: size, height: size }}
      >
        <defs>
          <linearGradient id="relayBaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#4338CA" />
          </linearGradient>
          <linearGradient id="relayFrontGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EEF2FF" />
            <stop offset="100%" stopColor="#E0E7FF" />
          </linearGradient>
          <linearGradient id="relayBevelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3730A3" />
            <stop offset="100%" stopColor="#312E81" />
          </linearGradient>
          <linearGradient id="relayNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
        </defs>

        {/* Ambient base shadow */}
        <rect x="2" y="3.5" width="20" height="18" rx="5.5" fill="#0F172A" opacity="0.12" />

        {/* Primary Relay chassis: rounded physical communications module */}
        <rect x="1.5" y="2" width="21" height="19.5" rx="5.5" fill="url(#relayBaseGrad)" />

        {/* Lateral thickness bevel (Right edge depth) */}
        <path
          d="M17.5 2.2C20 2.5 22 4.3 22.3 7V16C22.3 18.7 20.3 20.8 17.6 21.2H19C21 20.7 22.5 19 22.5 16.7V6.5C22.5 4 20.5 2.3 18 2.2H17.5Z"
          fill="url(#relayBevelGrad)"
          opacity="0.6"
        />

        {/* Upper edge specular highlight rim */}
        <path
          d="M5 2.7H19C20.5 2.7 21.8 3.7 22 5.1C21.6 4 20.4 3.2 19 3.2H5C3.6 3.2 2.4 4 2 5.1C2.2 3.7 3.5 2.7 5 2.7Z"
          fill="#FFFFFF"
          opacity="0.4"
        />

        {/* Dual Intertwined Communication & Context Surfaces */}
        {/* Rear Context / AI Transmission Plate */}
        <rect x="7" y="5.2" width="11" height="8" rx="2.5" fill="#312E81" opacity="0.55" />
        <rect x="7.8" y="6" width="9.4" height="6.4" rx="2" fill="#818CF8" opacity="0.4" />
        <circle cx="14.8" cy="8.2" r="1" fill="#FFFFFF" opacity="0.9" />

        {/* Foreground Collaboration & Human Presence Surface */}
        <rect x="4.8" y="8.8" width="12" height="9" rx="2.8" fill="url(#relayFrontGrad)" />

        {/* Relay Dynamic Bridge & Pulse Tracks (Connecting human, workspace, and AI context) */}
        <path
          d="M7.8 12.2H13.8"
          stroke="#4F46E5"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M7.8 14.8H11.8"
          stroke="#6366F1"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* Active Relay Interconnect / Node Anchor */}
        <circle cx="14.2" cy="14.8" r="1.5" fill="url(#relayNodeGrad)" />
        <circle cx="14.2" cy="14.8" r="0.6" fill="#FFFFFF" />
      </svg>
    );
  }

  // ---------------------------------------------------------------------------
  // 8. PDF: Document Page with Red Identifier Header & Bold File Stamp
  // ---------------------------------------------------------------------------
  if (norm.includes("pdf")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 select-none overflow-visible ${className}`}
        style={{ width: size, height: size }}
      >
        <defs>
          <linearGradient id="pdfBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#B91C1C" />
          </linearGradient>
          <linearGradient id="pdfFoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FCA5A5" />
            <stop offset="100%" stopColor="#F87171" />
          </linearGradient>
          <linearGradient id="pdfBevelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#991B1B" />
            <stop offset="100%" stopColor="#7F1D1D" />
          </linearGradient>
        </defs>

        <path d="M4.5 1.5H15.5L21.5 7.5V20.5C21.5 21.6 20.6 22.5 19.5 22.5H4.5C3.4 22.5 2.5 21.6 2.5 20.5V3.5C2.5 2.4 3.4 1.5 4.5 1.5Z" fill="#0F172A" opacity="0.12" transform="translate(0, 1)" />

        {/* Page Silhouette with Fold */}
        <path
          d="M4.5 1.5H15.5L21.5 7.5V20.5C21.5 21.6 20.6 22.5 19.5 22.5H4.5C3.4 22.5 2.5 21.6 2.5 20.5V3.5C2.5 2.4 3.4 1.5 4.5 1.5Z"
          fill="url(#pdfBodyGrad)"
        />

        {/* Right thickness facet */}
        <path
          d="M20.5 7.5V20.5C20.5 21.1 20 21.6 19.4 21.6H20C21 21.2 21.5 20.2 21.5 19.2V7.5H20.5Z"
          fill="url(#pdfBevelGrad)"
          opacity="0.6"
        />

        {/* Folded Corner Flap */}
        <path
          d="M15.5 1.5V6C15.5 6.8 16.2 7.5 17 7.5H21.5L15.5 1.5Z"
          fill="url(#pdfFoldGrad)"
        />

        {/* Content Block & PDF Stamp */}
        <rect x="6" y="9.5" width="9" height="3" rx="0.8" fill="#FFFFFF" />
        <rect x="6.8" y="10.2" width="7.4" height="1.6" rx="0.5" fill="#DC2626" />
        <line x1="6" y1="14.5" x2="14" y2="14.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
        <line x1="6" y1="17.2" x2="11.5" y2="17.2" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      </svg>
    );
  }

  // ---------------------------------------------------------------------------
  // Default Fallback
  // ---------------------------------------------------------------------------
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#8B5CF6" />
      <rect x="6" y="6" width="12" height="12" rx="2" fill="#FFFFFF" />
    </svg>
  );
}

export default AppNativeSvgIcon;
