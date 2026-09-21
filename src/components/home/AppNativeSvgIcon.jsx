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
 * "Recognizable Product Object -> Dimensional 2D -> Regaarder-Specific"
 *
 * Distinctive Object Geometries:
 * - Docs: Taller document card with crisp asymmetric dog-ear page fold & embossed content lines.
 * - Sheets: Ledger/grid matrix block with distinctive top header rule, column bands, and data cell.
 * - Deck: Actual 16:9 presentation slide plate stacked over a background slide deck.
 * - Whiteboard / Canvas: Studio drafting easel board with tripod legs, top title clamp, and canvas graph.
 * - Notes: Vertical spiral/margin notebook spine with lined page body.
 * - Room: Optical studio iris & camera body with lens highlights and tally light.
 * - PDF: Document card with folded corner and signature red identifier badge plate.
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
  // Standalone unboxed tools
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
  // 1. DOCS: Vertical Document Page with Physical Corner Fold & Text Hierarchy
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
  // 2. SHEETS: Rounded Spreadsheet Ledger with Distinct Header & Cell Matrix
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
          <linearGradient id="sheetHeaderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="sheetBevelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#065F46" />
            <stop offset="100%" stopColor="#064E3B" />
          </linearGradient>
        </defs>

        {/* Soft ground contact shadow */}
        <rect x="2.5" y="3" width="19" height="19" rx="5" fill="#0F172A" opacity="0.12" />

        {/* Workbook Main Ledger Plate */}
        <rect x="1.5" y="1.5" width="21" height="20.5" rx="5" fill="url(#sheetBodyGrad)" />

        {/* Right lateral thickness facet */}
        <path
          d="M17.5 1.7C20 2 22 3.8 22.3 6.5V16.8C22.3 19.5 20.3 21.6 17.6 22H19C21 21.5 22.5 19.8 22.5 17.5V6C22.5 3.5 20.5 1.8 18 1.7H17.5Z"
          fill="url(#sheetBevelGrad)"
          opacity="0.55"
        />

        {/* Top ambient highlight */}
        <path d="M5 2.2H19C20.5 2.2 21.8 3.2 22 4.6C21.6 3.5 20.4 2.7 19 2.7H5C3.6 2.7 2.4 3.5 2 4.6C2.2 3.2 3.5 2.2 5 2.2Z" fill="#FFFFFF" opacity="0.4" />

        {/* Physical Grid Inset Card */}
        <g transform="translate(5, 5)">
          {/* Card shadow */}
          <rect x="0.5" y="1" width="13.5" height="13.5" rx="2.5" fill="#064E3B" opacity="0.45" />
          {/* White grid card */}
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
  // 3. DECK: Stacked 16:9 Presentation Canvas Slide Plates
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
        <rect x="2.5" y="3" width="19" height="19" rx="5.5" fill="#0F172A" opacity="0.12" />

        {/* Main Presentation Tile Body */}
        <rect x="1.5" y="1.5" width="21" height="20.5" rx="5.5" fill="url(#deckBodyGrad)" />

        {/* Right lateral bevel facet */}
        <path
          d="M17.5 1.7C20 2 22 3.8 22.3 6.5V16.8C22.3 19.5 20.3 21.6 17.6 22H19C21 21.5 22.5 19.8 22.5 17.5V6C22.5 3.5 20.5 1.8 18 1.7H17.5Z"
          fill="url(#deckBevelGrad)"
          opacity="0.55"
        />

        {/* Top ambient highlight */}
        <path d="M5 2.2H19C20.5 2.2 21.8 3.2 22 4.6C21.6 3.5 20.4 2.7 19 2.7H5C3.6 2.7 2.4 3.5 2 4.6C2.2 3.2 3.5 2.2 5 2.2Z" fill="#FFFFFF" opacity="0.4" />

        {/* Presentation Stack: Background Slide Plate */}
        <g transform="translate(5, 5)">
          {/* Shadow behind front slide */}
          <rect x="3.5" y="1" width="11" height="8.5" rx="2" fill="#7C2D12" opacity="0.4" />
          {/* Stacked background slide plate */}
          <rect x="3.5" y="0.5" width="11" height="8.5" rx="2" fill="url(#deckBackSlideGrad)" />

          {/* Foreground Primary Slide Canvas (16:9 aspect) */}
          <rect x="0" y="3.5" width="12" height="9.5" rx="2" fill="#FFFFFF" />
          {/* Chart Graphic Visuals */}
          <rect x="2" y="8.5" width="2" height="3" rx="0.5" fill="#F97316" />
          <rect x="5" y="6" width="2" height="5.5" rx="0.5" fill="#EA580C" />
          <rect x="8" y="4.5" width="2" height="7" rx="0.5" fill="#C2410C" />
        </g>
      </svg>
    );
  }

  // ---------------------------------------------------------------------------
  // 4. WHITEBOARD: Studio Drafting Canvas with Easel Stand & Creative Graph
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

        {/* Soft ground shadow */}
        <rect x="2.5" y="3" width="19" height="19" rx="5.5" fill="#0F172A" opacity="0.12" />

        {/* Main Whiteboard Tile */}
        <rect x="1.5" y="1.5" width="21" height="20.5" rx="5.5" fill="url(#boardBodyGrad)" />

        {/* Right lateral facet */}
        <path
          d="M17.5 1.7C20 2 22 3.8 22.3 6.5V16.8C22.3 19.5 20.3 21.6 17.6 22H19C21 21.5 22.5 19.8 22.5 17.5V6C22.5 3.5 20.5 1.8 18 1.7H17.5Z"
          fill="url(#boardBevelGrad)"
          opacity="0.55"
        />

        {/* Top ambient highlight */}
        <path d="M5 2.2H19C20.5 2.2 21.8 3.2 22 4.6C21.6 3.5 20.4 2.7 19 2.7H5C3.6 2.7 2.4 3.5 2 4.6C2.2 3.2 3.5 2.2 5 2.2Z" fill="#FFFFFF" opacity="0.4" />

        {/* Easel Frame & Freestanding Canvas Surface */}
        <g transform="translate(4.5, 4.5)">
          {/* Tripod Stand Feet */}
          <path d="M3.5 11.5L1.5 14.5M11.5 11.5L13.5 14.5" stroke="#BFDBFE" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="7.5" y1="12" x2="7.5" y2="14.5" stroke="#93C5FD" strokeWidth="1.2" strokeLinecap="round" />

          {/* Whiteboard Canvas Plane */}
          <rect x="0.5" y="1.5" width="14" height="10" rx="2" fill="#172554" opacity="0.45" />
          <rect x="0" y="1" width="14" height="10" rx="2" fill="#FFFFFF" />

          {/* Top Marker Tray / Clamp Bar */}
          <rect x="4.5" y="0" width="5" height="1.8" rx="0.8" fill="#DBEAFE" />

          {/* Connected Creative Graph Primitives */}
          <path d="M3 7.5L6.5 4.5L10.5 6.5" stroke="#2563EB" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="3" cy="7.5" r="1.1" fill="#3B82F6" />
          <circle cx="6.5" cy="4.5" r="1.3" fill="#1D4ED8" />
          <circle cx="10.5" cy="6.5" r="1.1" fill="#60A5FA" />
        </g>
      </svg>
    );
  }

  // ---------------------------------------------------------------------------
  // 5. NOTES: Vertical Spiral Margin Notebook
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
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
          <linearGradient id="notesBevelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#92400E" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
        </defs>

        <rect x="2.5" y="3" width="19" height="19" rx="5.5" fill="#0F172A" opacity="0.12" />
        <rect x="1.5" y="1.5" width="21" height="20.5" rx="5.5" fill="url(#notesBodyGrad)" />
        <path
          d="M17.5 1.7C20 2 22 3.8 22.3 6.5V16.8C22.3 19.5 20.3 21.6 17.6 22H19C21 21.5 22.5 19.8 22.5 17.5V6C22.5 3.5 20.5 1.8 18 1.7H17.5Z"
          fill="url(#notesBevelGrad)"
          opacity="0.55"
        />
        <path d="M5 2.2H19C20.5 2.2 21.8 3.2 22 4.6C21.6 3.5 20.4 2.7 19 2.7H5C3.6 2.7 2.4 3.5 2 4.6C2.2 3.2 3.5 2.2 5 2.2Z" fill="#FFFFFF" opacity="0.4" />

        {/* Notebook Body with Perforated Spine */}
        <g transform="translate(5.5, 5)">
          <rect x="0.5" y="1" width="13" height="14" rx="2" fill="#78350F" opacity="0.45" />
          <rect x="0" y="0" width="13" height="14" rx="2" fill="#FFFFFF" />

          {/* Left Bookmark / Margin Strip */}
          <rect x="0" y="0" width="3.5" height="14" rx="1.8" fill="#FEF3C7" />
          <line x1="3.5" y1="0" x2="3.5" y2="14" stroke="#D97706" strokeWidth="0.8" opacity="0.4" />

          {/* Spiral binding ticks on left spine */}
          <circle cx="1.6" cy="3.5" r="0.75" fill="#92400E" />
          <circle cx="1.6" cy="7" r="0.75" fill="#92400E" />
          <circle cx="1.6" cy="10.5" r="0.75" fill="#92400E" />

          {/* Lined writing rules */}
          <line x1="5.5" y1="4" x2="11" y2="4" stroke="#B45309" strokeWidth="1.1" strokeLinecap="round" opacity="0.7" />
          <line x1="5.5" y1="7.2" x2="11" y2="7.2" stroke="#B45309" strokeWidth="1.1" strokeLinecap="round" opacity="0.7" />
          <line x1="5.5" y1="10.5" x2="9" y2="10.5" stroke="#B45309" strokeWidth="1.1" strokeLinecap="round" opacity="0.7" />
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
  // 7. PDF: Document Page with Red Identifier Header & Bold File Stamp
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
