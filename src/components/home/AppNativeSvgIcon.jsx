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
 * Supports variant="tile" (default for Home/Recents/Library: rich dimensional 2D color tile badge)
 * and variant="minimal" (for document tabs: clean ~14-16px outline glyph without background box).
 *
 * "Rich Flat / Dimensional 2D" Architectural System:
 * - 2-3 tonal values per tile: primary gradient face + darker structural plane/spine on right/bottom.
 * - Inset ambient light highlight on top/left edges (0.5px white specular line) for tactile surface mass.
 * - Grounded micro-shadow underneath the inner glyph.
 * - Semi-transparent dual-layer geometry inside the glyph (folded document page, column header bar, deck slide layers).
 * - Apple-like, clean, modern, executive-tier aesthetic (NOT glossy 3D, NOT generic monoline).
 */
export function AppNativeSvgIcon({ type, size = 24, className = "", variant = "tile" }) {
  const norm = (type || "").toLowerCase();

  // ---------------------------------------------------------------------------
  // Minimal outline mode: clean native stroke with muted brand accent, no box
  // ---------------------------------------------------------------------------
  if (variant === "minimal") {
    if (norm.includes("sheet")) {
      return (
        <div
          className={`flex items-center justify-center shrink-0 transition-colors ${className}`}
          style={{ color: "rgba(5, 150, 105, 0.82)" }}
        >
          <SheetIcon size={size} strokeWidth={1.6} />
        </div>
      );
    }
    if (norm.includes("deck") || norm.includes("present") || norm.includes("slide")) {
      return (
        <div className={`flex items-center justify-center shrink-0 text-orange-500 dark:text-orange-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 ${className}`}>
          <DeckIcon size={size} strokeWidth={1.6} />
        </div>
      );
    }
    if (norm.includes("whiteboard") || norm.includes("canvas")) {
      return (
        <div className={`flex items-center justify-center shrink-0 text-blue-500 dark:text-blue-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 ${className}`}>
          <WhiteboardIcon size={size} strokeWidth={1.6} />
        </div>
      );
    }
    if (norm.includes("room") || norm.includes("meet")) {
      return (
        <div className={`flex items-center justify-center shrink-0 text-violet-500 dark:text-violet-300 group-hover:text-violet-600 dark:group-hover:text-violet-400 ${className}`}>
          <RoomIcon size={size} strokeWidth={1.6} />
        </div>
      );
    }
    if (norm.includes("browser")) {
      return (
        <div className={`flex items-center justify-center shrink-0 text-sky-500 dark:text-sky-300 group-hover:text-sky-600 dark:group-hover:text-sky-400 ${className}`}>
          <BrowserIcon size={size} strokeWidth={1.6} />
        </div>
      );
    }
    if (norm.includes("relay")) {
      return (
        <div className={`flex items-center justify-center shrink-0 text-indigo-500 dark:text-indigo-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 ${className}`}>
          <RelayIcon size={size} strokeWidth={1.6} />
        </div>
      );
    }
    if (norm.includes("notes") || norm.includes("notebook")) {
      return (
        <div className={`flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-500 group-hover:text-amber-700 dark:group-hover:text-amber-400 ${className}`}>
          <NotesIcon size={size} strokeWidth={1.6} />
        </div>
      );
    }
    if (norm.includes("pdf")) {
      return (
        <div className={`flex items-center justify-center shrink-0 text-red-500 dark:text-red-400 group-hover:text-red-600 ${className}`}>
          <ComposeIcon size={size} strokeWidth={1.6} />
        </div>
      );
    }
    // Default Docs/Compose
    return (
      <div className={`flex items-center justify-center shrink-0 text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-300 ${className}`}>
        <ComposeIcon size={size} strokeWidth={1.6} />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Uncontained standalone tools
  // ---------------------------------------------------------------------------
  if (norm.includes("browser")) {
    return (
      <div className={`flex items-center justify-center shrink-0 text-[#2563EB] ${className}`}>
        <BrowserIcon size={size} strokeWidth={2.1} />
      </div>
    );
  }
  if (norm.includes("relay")) {
    return (
      <div className={`flex items-center justify-center shrink-0 text-[#4F46E5] ${className}`}>
        <RelayIcon size={size} strokeWidth={2.1} />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Dimensional 2D Palette Definitions:
  // lightFace: top-left ambient illumination
  // darkFace: bottom body plane
  // bevelSide: crisp lateral facet plane
  // bevelBottom: grounding bottom shelf
  // ---------------------------------------------------------------------------
  let palette = {
    id: "docs",
    lightFace: "#8B5CF6",    // Violet 500
    darkFace: "#6D28D9",     // Violet 700
    bevelSide: "#5B21B6",    // Violet 800 (lateral bevel plane)
    bevelBottom: "#4C1D95",  // Violet 900 (bottom shelf edge)
    glyphShadow: "rgba(46, 16, 101, 0.45)"
  };

  if (norm.includes("sheet")) {
    palette = {
      id: "sheets",
      lightFace: "#10B981",    // Emerald 500
      darkFace: "#047857",     // Emerald 700
      bevelSide: "#065F46",    // Emerald 800
      bevelBottom: "#064E3B",  // Emerald 900
      glyphShadow: "rgba(6, 78, 59, 0.45)"
    };
  } else if (norm.includes("deck") || norm.includes("present") || norm.includes("slide")) {
    palette = {
      id: "deck",
      lightFace: "#F97316",    // Orange 500
      darkFace: "#C2410C",     // Orange 700
      bevelSide: "#9A3412",    // Orange 800
      bevelBottom: "#7C2D12",  // Orange 900
      glyphShadow: "rgba(124, 45, 18, 0.45)"
    };
  } else if (norm.includes("whiteboard") || norm.includes("canvas")) {
    palette = {
      id: "whiteboard",
      lightFace: "#3B82F6",    // Blue 500
      darkFace: "#1D4ED8",     // Blue 700
      bevelSide: "#1E40AF",    // Blue 800
      bevelBottom: "#172554",  // Blue 950
      glyphShadow: "rgba(23, 37, 84, 0.45)"
    };
  } else if (norm.includes("notes") || norm.includes("notebook")) {
    palette = {
      id: "notes",
      lightFace: "#F59E0B",    // Amber 500
      darkFace: "#B45309",     // Amber 700
      bevelSide: "#92400E",    // Amber 800
      bevelBottom: "#78350F",  // Amber 900
      glyphShadow: "rgba(120, 53, 15, 0.45)"
    };
  } else if (norm.includes("room") || norm.includes("meet")) {
    palette = {
      id: "room",
      lightFace: "#7C3AED",    // Purple 600
      darkFace: "#5B21B6",     // Purple 800
      bevelSide: "#4C1D95",    // Purple 900
      bevelBottom: "#2E1065",  // Purple 950
      glyphShadow: "rgba(46, 16, 101, 0.45)"
    };
  } else if (norm.includes("pdf")) {
    palette = {
      id: "pdf",
      lightFace: "#EF4444",    // Red 500
      darkFace: "#B91C1C",     // Red 700
      bevelSide: "#991B1B",    // Red 800
      bevelBottom: "#7F1D1D",  // Red 900
      glyphShadow: "rgba(127, 29, 29, 0.45)"
    };
  }

  // ---------------------------------------------------------------------------
  // Inner Glyph Renderer with Dual-Layer Contrast & Visual Mass
  // ---------------------------------------------------------------------------
  const renderInnerGlyph = () => {
    // 1. Sheets: Multi-surface table grid with highlighted header block & cell division
    if (norm.includes("sheet")) {
      return (
        <g transform="translate(6, 6)">
          {/* Subtle under-glyph occlusion shadow */}
          <rect x="0.5" y="1" width="13" height="12.5" rx="2" fill={palette.glyphShadow} />
          {/* Base sheet paper card */}
          <rect x="0" y="0" width="13" height="13" rx="2" fill="#FFFFFF" />
          {/* Solid header row bar with brand emerald tint */}
          <rect x="0" y="0" width="13" height="4" rx="2" fill="#D1FAE5" />
          <rect x="0" y="2" width="13" height="2" fill="#D1FAE5" />
          {/* Table grid dividers */}
          <line x1="0" y1="4" x2="13" y2="4" stroke="#047857" strokeWidth="0.8" opacity="0.6" />
          <line x1="0" y1="8.5" x2="13" y2="8.5" stroke="#047857" strokeWidth="0.75" opacity="0.35" />
          <line x1="4.5" y1="0" x2="4.5" y2="13" stroke="#047857" strokeWidth="0.8" opacity="0.4" />
          <line x1="8.7" y1="4" x2="8.7" y2="13" stroke="#047857" strokeWidth="0.75" opacity="0.35" />
          {/* Subtle filled cell indicator */}
          <rect x="1" y="5" width="2.5" height="2.5" rx="0.5" fill="#10B981" opacity="0.45" />
        </g>
      );
    }

    // 2. Deck: Layered slide deck plates with front projection screen
    if (norm.includes("deck") || norm.includes("present") || norm.includes("slide")) {
      return (
        <g transform="translate(5.5, 6)">
          {/* Under-glyph occlusion */}
          <rect x="3" y="1" width="10.5" height="8.5" rx="1.5" fill={palette.glyphShadow} />
          {/* Background slide plate (layered depth) */}
          <rect x="3.5" y="0" width="10" height="8.5" rx="1.5" fill="#FED7AA" opacity="0.9" />
          {/* Foreground primary presentation slide */}
          <rect x="0.5" y="3" width="11" height="9.5" rx="1.8" fill="#FFFFFF" />
          {/* Slide graphic chart primitives */}
          <rect x="2.5" y="7.5" width="2" height="3.5" rx="0.5" fill="#F97316" />
          <rect x="5.2" y="5.5" width="2" height="5.5" rx="0.5" fill="#EA580C" />
          <rect x="8" y="4" width="2" height="7" rx="0.5" fill="#C2410C" />
        </g>
      );
    }

    // 3. Whiteboard / Canvas: Board frame on easel stand with collaborative nodes
    if (norm.includes("whiteboard") || norm.includes("canvas")) {
      return (
        <g transform="translate(5.5, 5.5)">
          {/* Under-glyph occlusion */}
          <rect x="1" y="1" width="12.5" height="9" rx="1.8" fill={palette.glyphShadow} />
          {/* Easel legs */}
          <path d="M3.5 10.5L2 13M10.5 10.5L12 13" stroke="#DBEAFE" strokeWidth="1.2" strokeLinecap="round" />
          {/* Whiteboard surface */}
          <rect x="0.5" y="0.5" width="13" height="9.5" rx="1.8" fill="#FFFFFF" />
          {/* Creative diagram stroke & node */}
          <path d="M3 6.5L6.5 3.5L9.5 5.5" stroke="#3B82F6" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9.5" cy="5.5" r="1.2" fill="#1D4ED8" />
          <circle cx="3" cy="6.5" r="1" fill="#60A5FA" />
        </g>
      );
    }

    // 4. Notes: Notebook with ruled margin spine
    if (norm.includes("notes") || norm.includes("notebook")) {
      return (
        <g transform="translate(6, 5.5)">
          <rect x="1" y="1" width="11" height="13" rx="1.8" fill={palette.glyphShadow} />
          <rect x="0.5" y="0.5" width="11.5" height="13" rx="1.8" fill="#FFFFFF" />
          {/* Left margin spine */}
          <rect x="0.5" y="0.5" width="3.2" height="13" rx="1.5" fill="#FEF3C7" />
          <line x1="3.7" y1="0.5" x2="3.7" y2="13.5" stroke="#D97706" strokeWidth="0.8" opacity="0.4" />
          {/* Ruled content lines */}
          <line x1="5.5" y1="4" x2="10.2" y2="4" stroke="#B45309" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          <line x1="5.5" y1="7" x2="10.2" y2="7" stroke="#B45309" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          <line x1="5.5" y1="10" x2="8.8" y2="10" stroke="#B45309" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
        </g>
      );
    }

    // 5. Room: Spatial viewport with perspective chamber & optical nexus
    if (norm.includes("room") || norm.includes("meet")) {
      return (
        <g transform="translate(5, 5.5)">
          <rect x="1" y="1" width="13" height="12.5" rx="2.5" fill={palette.glyphShadow} />
          {/* Back chamber frame */}
          <rect x="4.5" y="1" width="9" height="8.5" rx="2" fill="#DDD6FE" opacity="0.9" />
          {/* Main front camera/spatial viewport */}
          <rect x="0.5" y="3.5" width="10.5" height="9" rx="2" fill="#FFFFFF" />
          <circle cx="5.7" cy="8" r="2.4" fill="#6D28D9" />
          <circle cx="5.7" cy="8" r="1" fill="#FFFFFF" />
        </g>
      );
    }

    // 6. PDF: Document with folded corner and distinct red label strip
    if (norm.includes("pdf")) {
      return (
        <g transform="translate(6, 5.5)">
          <rect x="1" y="1" width="11" height="13" rx="1.8" fill={palette.glyphShadow} />
          {/* White sheet with folded top-right corner */}
          <path d="M0.5 0.5H8L11.5 4V13.5H0.5V0.5Z" fill="#FFFFFF" />
          {/* Folded corner flap */}
          <path d="M8 0.5V4H11.5L8 0.5Z" fill="#FEE2E2" />
          {/* PDF identification bar */}
          <rect x="2" y="6" width="7.5" height="2" rx="0.5" fill="#DC2626" />
          <line x1="2" y1="10" x2="8.5" y2="10" stroke="#DC2626" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
        </g>
      );
    }

    // Default: Docs / Compose: Crisp folded sheet with layered text lines
    return (
      <g transform="translate(6, 5.5)">
        {/* Under-glyph soft shadow */}
        <rect x="1" y="1" width="11" height="13" rx="1.8" fill={palette.glyphShadow} />
        {/* White document body with corner fold */}
        <path d="M0.5 0.5H7.8L11.5 4.2V13.5H0.5V0.5Z" fill="#FFFFFF" />
        {/* Dimensional corner fold triangle */}
        <path d="M7.8 0.5V4.2H11.5L7.8 0.5Z" fill="#EDE9FE" />
        {/* Text lines with hierarchy */}
        <rect x="2.5" y="6" width="6.5" height="1.4" rx="0.7" fill="#7C3AED" />
        <rect x="2.5" y="9" width="5.2" height="1.2" rx="0.6" fill="#8B5CF6" opacity="0.7" />
        <rect x="2.5" y="11.5" width="4" height="1" rx="0.5" fill="#8B5CF6" opacity="0.5" />
      </g>
    );
  };

  // ---------------------------------------------------------------------------
  // Dimensional 2D Tile Surface with 2-3 Tonal Values & Micro-Light Edges
  // ---------------------------------------------------------------------------
  const gradId = `tile_grad_${palette.id}`;
  const bevelSideGradId = `tile_side_${palette.id}`;

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
        {/* Primary surface gradient: subtle light-to-shade (Apple-like directional light) */}
        <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={palette.lightFace} />
          <stop offset="100%" stopColor={palette.darkFace} />
        </linearGradient>

        {/* Right lateral facet gradient */}
        <linearGradient id={bevelSideGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={palette.bevelSide} />
          <stop offset="100%" stopColor={palette.bevelBottom} />
        </linearGradient>
      </defs>

      {/* 1. Subtle Ground Contact Shadow */}
      <rect
        x="2.5"
        y="3"
        width="19"
        height="19"
        rx="5.5"
        fill="#0F172A"
        opacity="0.12"
      />

      {/* 2. Main Tile Body with Directional Gradient Surface */}
      <rect
        x="1.5"
        y="1.5"
        width="21"
        height="20.5"
        rx="5.5"
        fill={`url(#${gradId})`}
      />

      {/* 3. Right Lateral Dimensional Facet (adds physical thickness & mass) */}
      <path
        d="M17 1.6C19.8 1.9 22 4.1 22.3 6.9V16.5C22.3 19.3 20.1 21.6 17.3 22H19C21 21.5 22.5 19.8 22.5 17.5V6C22.5 3.5 20.5 1.7 18 1.6H17Z"
        fill={`url(#${bevelSideGradId})`}
        opacity="0.55"
      />

      {/* 4. Bottom Rim Occlusion Edge (grounds the bottom surface) */}
      <path
        d="M4.5 22H19.5C20.9 22 22 20.9 22 19.5V20C22 21.4 20.9 22.5 19.5 22.5H4.5C3.1 22.5 2 21.4 2 20V19.5C2 20.9 3.1 22 4.5 22Z"
        fill={palette.bevelBottom}
        opacity="0.75"
      />

      {/* 5. Top Specular Ambient Light Micro-Edge (subtle Apple-style glass highlight) */}
      <path
        d="M5 2.2H19C20.5 2.2 21.8 3.2 22 4.6C21.6 3.5 20.4 2.7 19 2.7H5C3.6 2.7 2.4 3.5 2 4.6C2.2 3.2 3.5 2.2 5 2.2Z"
        fill="#FFFFFF"
        opacity="0.4"
      />

      {/* 6. Inner Graphic Glyph with Multi-Surface Depth */}
      {renderInnerGlyph()}
    </svg>
  );
}

export default AppNativeSvgIcon;
