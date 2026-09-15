import React from "react";
import {
  ComposeIcon,
  DeckIcon,
  SheetIcon,
  RoomIcon,
  WhiteboardIcon,
  RelayIcon,
  BrowserIcon
} from "../RegaarderProductIcons";

/**
 * App Native SVG Icon:
 * Supports variant="tile" (default for Home/Recents: filled color tile badge)
 * and variant="minimal" (for document tabs: clean ~14-16px outline glyph without background box).
 */
export function AppNativeSvgIcon({ type, size = 24, className = "", variant = "tile" }) {
  const norm = (type || "").toLowerCase();

  // Minimal outline mode: clean native stroke with muted brand accent, no background box.
  // strokeWidth aligns to the icon library's native 1.6 grammar weight so icons read
  // as quiet secondary metadata rather than competing with the document title.
  if (variant === "minimal") {
    if (norm.includes("sheet")) {
      return (
        <div className={`flex items-center justify-center shrink-0 text-emerald-600/80 dark:text-emerald-400/80 group-hover/tab:text-emerald-600 dark:group-hover/tab:text-emerald-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors ${className}`}>
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
    // Default Docs/Compose: neutral — the tab background/border carries the active state signal.
    return (
      <div className={`flex items-center justify-center shrink-0 text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-300 ${className}`}>
        <ComposeIcon size={size} strokeWidth={1.6} />
      </div>
    );
  }

  // 1. Browser: Clean vibrant blue (#2563EB), NO container
  if (norm.includes("browser")) {
    return (
      <div className={`flex items-center justify-center shrink-0 text-[#2563EB] ${className}`}>
        <BrowserIcon size={size} strokeWidth={2.1} />
      </div>
    );
  }

  // 2. Relay: Clean indigo/blue stroke (#4F46E5), NO container
  if (norm.includes("relay")) {
    return (
      <div className={`flex items-center justify-center shrink-0 text-[#4F46E5] ${className}`}>
        <RelayIcon size={size} strokeWidth={2.1} />
      </div>
    );
  }

  // Helper for badges
  const renderBadge = (bgColor, innerGlyph) => (
    <div
      className={`flex items-center justify-center shrink-0 rounded-[6px] text-white shadow-2xs ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor
      }}
    >
      {innerGlyph}
    </div>
  );

  const innerIconSize = Math.round(size * 0.62);

  // 3. Sheets: Solid filled glyph
  if (norm.includes("sheet")) {
    return renderBadge(
      "#10B981",
      <svg
        width={innerIconSize}
        height={innerIconSize}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2v2h4V6H5zm6 0v2h4V6h-4zm4 4h-4v2h4v-2zm-6 0H5v2h4v-2zm-4 4v2h4v-2H5zm6 2h4v-2h-4v2z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  // 4. Deck: Orange (#F97316) with bold white presentation glyph
  if (norm.includes("deck") || norm.includes("present") || norm.includes("slide")) {
    return renderBadge(
      "#F97316",
      <DeckIcon size={innerIconSize} strokeWidth={2.4} className="text-white" />
    );
  }

  // 5. Whiteboard: Blue (#3B82F6) with bold white whiteboard glyph
  if (norm.includes("whiteboard") || norm.includes("canvas")) {
    return renderBadge(
      "#3B82F6",
      <WhiteboardIcon size={innerIconSize} strokeWidth={2.4} className="text-white" />
    );
  }

  // 6. Room: Violet (#7C3AED) with bold white room camera glyph
  if (norm.includes("room") || norm.includes("meet")) {
    return renderBadge(
      "#7C3AED",
      <RoomIcon size={innerIconSize} strokeWidth={2.4} className="text-white" />
    );
  }

  // Default: Docs: Purple (#8B5CF6) with solid filled glyph
  return renderBadge(
    "#8B5CF6",
    <svg
      width={innerIconSize}
      height={innerIconSize}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
        clipRule="evenodd"
      />
    </svg>
  );
}
