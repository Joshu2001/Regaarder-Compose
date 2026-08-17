import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  SlidersHorizontal,
  Sun,
  Moon,
  Minus,
  Plus,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Check,
  RotateCcw,
  Search,
  X
} from 'lucide-react';

const BROWSER_FONT_OPTIONS = [
  { id: 'System Default', label: 'System Default', stack: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  { id: 'Manrope', label: 'Manrope', stack: "Manrope, 'Plus Jakarta Sans', 'DM Sans', Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" },
  { id: 'Satoshi', label: 'Satoshi', stack: "Satoshi, 'General Sans', Manrope, 'DM Sans', Inter, system-ui, sans-serif" },
  { id: 'General Sans', label: 'General Sans', stack: "'General Sans', Satoshi, Manrope, Inter, system-ui, sans-serif" },
  { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', stack: "'Plus Jakarta Sans', Manrope, 'DM Sans', Inter, system-ui, sans-serif" },
  { id: 'IBM Plex Sans', label: 'IBM Plex Sans', stack: "'IBM Plex Sans', 'Public Sans', Inter, system-ui, sans-serif" },
  { id: 'DM Sans', label: 'DM Sans', stack: "'DM Sans', Manrope, 'Plus Jakarta Sans', Inter, system-ui, sans-serif" },
  { id: 'Public Sans', label: 'Public Sans', stack: "'Public Sans', 'IBM Plex Sans', Inter, system-ui, sans-serif" },
  { id: 'SF Pro Display', label: 'SF Pro Display', stack: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
  { id: 'Helvetica Now', label: 'Helvetica Now', stack: "'Helvetica Now', 'Helvetica Neue', Helvetica, Arial, sans-serif" },
  { id: 'Aptos', label: 'Aptos', stack: "Aptos, 'Segoe UI', Calibri, sans-serif" },
  { id: 'Merriweather', label: 'Merriweather', stack: "Merriweather, 'Source Serif 4', Georgia, serif" },
  { id: 'Libre Baskerville', label: 'Libre Baskerville', stack: "'Libre Baskerville', Merriweather, Georgia, serif" },
  { id: 'Playfair Display', label: 'Playfair Display', stack: "'Playfair Display', 'Libre Baskerville', Georgia, serif" },
  { id: 'Source Serif 4', label: 'Source Serif 4', stack: "'Source Serif 4', Merriweather, Georgia, serif" },
  { id: 'Charter', label: 'Charter', stack: "Charter, 'Source Serif 4', Georgia, serif" },
  { id: 'Lora', label: 'Lora', stack: "Lora, 'Source Serif 4', Georgia, serif" },
  { id: 'Spectral', label: 'Spectral', stack: "Spectral, 'Source Serif 4', Georgia, serif" },
  { id: 'Poppins', label: 'Poppins', stack: "Poppins, Manrope, 'Plus Jakarta Sans', sans-serif" },
  { id: 'Montserrat', label: 'Montserrat', stack: "Montserrat, Poppins, Manrope, sans-serif" },
  { id: 'Outfit', label: 'Outfit', stack: "Outfit, 'Space Grotesk', Manrope, sans-serif" },
  { id: 'Space Grotesk', label: 'Space Grotesk', stack: "'Space Grotesk', Outfit, Manrope, sans-serif" },
  { id: 'Clash Display', label: 'Clash Display', stack: "'Clash Display', 'Neue Haas Grotesk', Montserrat, sans-serif" },
  { id: 'Neue Haas Grotesk', label: 'Neue Haas Grotesk', stack: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif" },
  { id: 'Circular Std', label: 'Circular Std', stack: "'Circular Std', 'Avenir Next', 'Helvetica Neue', Arial, sans-serif" },
  { id: 'Avenir Next', label: 'Avenir Next', stack: "'Avenir Next', 'Helvetica Neue', Helvetica, Arial, sans-serif" },
  { id: 'JetBrains Mono', label: 'JetBrains Mono', stack: "'JetBrains Mono', 'IBM Plex Mono', 'Fira Code', 'Source Code Pro', monospace" },
  { id: 'IBM Plex Mono', label: 'IBM Plex Mono', stack: "'IBM Plex Mono', 'JetBrains Mono', 'Fira Code', 'Source Code Pro', monospace" },
  { id: 'Fira Code', label: 'Fira Code', stack: "'Fira Code', 'JetBrains Mono', 'IBM Plex Mono', 'Source Code Pro', monospace" },
  { id: 'Source Code Pro', label: 'Source Code Pro', stack: "'Source Code Pro', 'JetBrains Mono', 'IBM Plex Mono', 'Fira Code', monospace" },
  { id: 'Inter', label: 'Inter', stack: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
  { id: 'Georgia', label: 'Georgia', stack: "Georgia, Cambria, 'Times New Roman', serif" },
  { id: 'Verdana', label: 'Verdana', stack: "Verdana, Geneva, sans-serif" },
  { id: 'Courier New', label: 'Courier New', stack: "'Courier New', Courier, monospace" },
  { id: 'Times New Roman', label: 'Times New Roman', stack: "'Times New Roman', Times, serif" },
  { id: 'Trebuchet MS', label: 'Trebuchet MS', stack: "'Trebuchet MS', 'Lucida Sans Unicode', sans-serif" }
];

const ZOOM_PRESETS = [80, 90, 100, 110, 125, 150, 200];

/**
 * BrowserFontPopover: Executive Apple/Safari-Style Display & Appearance Popover
 * Features:
 * - Softer, restrained Regaarder purple accent for active states.
 * - ~10% tighter vertical padding & layout.
 * - Strengthened title/subtitle hierarchy ("Display & Appearance" bold/darker, "Customize this page" small/muted).
 * - Progressive Disclosure: Font selector opens in dedicated secondary subview; Zoom dropdown opens in compact menu.
 */
export const BrowserFontPopover = ({
  anchorRect,
  isStandalone = false,
  isDarkMode = true,
  browserFont = 'System Default',
  browserFontSize = 100,
  onChangeFont,
  onChangeFontSize,
  onToggleDarkMode,
  onReset,
  onClose
}) => {
  const popoverRef = useRef(null);
  const [currentView, setCurrentView] = useState('main'); // 'main' | 'fontPicker'
  const [showZoomMenu, setShowZoomMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Outside-click dismissal is handled globally by BrowserWorkspace's pointerdown
    // listener (which guards via [data-popover]). Only Escape key is handled here.
    // Escape navigates back to main view if in sub-view, otherwise closes the popover.
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (currentView === 'fontPicker') {
          setCurrentView('main');
        } else {
          onClose?.();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, currentView]);

  const filteredFonts = useMemo(() => {
    if (!searchQuery.trim()) return BROWSER_FONT_OPTIONS;
    const q = searchQuery.toLowerCase().trim();
    return BROWSER_FONT_OPTIONS.filter(
      (opt) => opt.label.toLowerCase().includes(q) || opt.id.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const selectedFontObj = useMemo(() => {
    return BROWSER_FONT_OPTIONS.find((f) => f.id === browserFont) || BROWSER_FONT_OPTIONS[0];
  }, [browserFont]);

  if (!isStandalone && !anchorRect) return null;

  const top = anchorRect ? Math.max(86, anchorRect.bottom + 6) : 86;
  const right = anchorRect ? Math.max(16, window.innerWidth - anchorRect.right) : 16;

  const containerClasses = isStandalone
    ? "w-full h-full bg-white/90 dark:bg-[#1c1c1e]/90 border border-slate-200/70 dark:border-zinc-800/80 shadow-2xl rounded-2xl p-3.5 font-sans select-none text-slate-800 dark:text-zinc-100 flex flex-col justify-between overflow-hidden"
    : "fixed z-[100000] w-[330px] bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-2xl border border-slate-200/70 dark:border-zinc-800/80 shadow-[0_12px_32px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.04)] rounded-2xl p-3.5 animate-in fade-in zoom-in-95 duration-150 font-sans select-none text-slate-800 dark:text-zinc-100 overflow-hidden";

  const containerStyle = isStandalone ? {} : { top: `${top}px`, right: `${right}px` };

  const renderMainView = () => (
    <div className="flex flex-col justify-between h-full space-y-2.5">
      {/* Header with strengthened hierarchy */}
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-zinc-800/80 shrink-0">
        <div className="w-7 h-7 rounded-xl bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 border border-violet-500/20">
          <SlidersHorizontal size={14} />
        </div>
        <div>
          <h4 className="text-[13px] font-extrabold tracking-tight text-slate-900 dark:text-zinc-50 leading-tight">
            Display & Appearance
          </h4>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-normal leading-tight mt-0.5">
            Customize this page
          </p>
        </div>
      </div>

      {/* SECTION 1: APPEARANCE */}
      <div className="space-y-1 shrink-0">
        <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
          Appearance
        </span>
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60 text-xs">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              if (isDarkMode) onToggleDarkMode?.(false);
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              !isDarkMode
                ? 'bg-violet-100 dark:bg-violet-950/60 text-violet-800 dark:text-violet-300 border border-violet-300 dark:border-violet-700/60 shadow-2xs'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 border border-transparent'
            }`}
          >
            <Sun size={13} className={!isDarkMode ? 'text-violet-700 dark:text-violet-300' : ''} />
            <span>Light</span>
          </button>

          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              if (!isDarkMode) onToggleDarkMode?.(true);
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              isDarkMode
                ? 'bg-violet-500/90 text-white shadow-2xs'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <Moon size={13} className={isDarkMode ? 'text-white' : ''} />
            <span>Dark</span>
          </button>
        </div>
      </div>

      {/* SECTION 2: PAGE ZOOM */}
      <div className="space-y-1 shrink-0">
        <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
          Page Zoom
        </span>
        <div className="relative">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                onChangeFontSize?.(Math.max(70, browserFontSize - 10));
              }}
              disabled={browserFontSize <= 70}
              className="w-8 h-7 rounded-xl border border-slate-200/80 dark:border-zinc-700/80 bg-slate-100/60 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer"
              title="Decrease zoom"
            >
              <Minus size={13} />
            </button>

            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setShowZoomMenu((prev) => !prev);
              }}
              className="flex-1 h-7 px-3 rounded-xl border border-slate-200/80 dark:border-zinc-700/80 bg-slate-100/60 dark:bg-zinc-800/60 text-slate-800 dark:text-zinc-100 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-between text-xs font-semibold font-mono transition-colors cursor-pointer"
            >
              <span>{browserFontSize}%</span>
              <ChevronDown size={13} className={`text-slate-400 transition-transform duration-150 ${showZoomMenu ? 'rotate-180' : ''}`} />
            </button>

            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                onChangeFontSize?.(Math.min(200, browserFontSize + 10));
              }}
              disabled={browserFontSize >= 200}
              className="w-8 h-7 rounded-xl border border-slate-200/80 dark:border-zinc-700/80 bg-slate-100/60 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer"
              title="Increase zoom"
            >
              <Plus size={13} />
            </button>
          </div>

          {/* Compact Secondary Zoom Dropdown Menu */}
          {showZoomMenu && (
            <div className="absolute top-8 left-10 right-10 z-50 py-1 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-lg text-xs space-y-0.5 animate-in fade-in zoom-in-95 duration-100 max-h-[150px] overflow-y-auto thin-scrollbar">
              {ZOOM_PRESETS.map((preset) => {
                const isSelected = browserFontSize === preset;
                return (
                  <button
                    key={`zoom-${preset}`}
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      onChangeFontSize?.(preset);
                      setShowZoomMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-mono transition-colors text-left cursor-pointer ${
                      isSelected
                        ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-bold'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700/60'
                    }`}
                  >
                    <span>{preset}%</span>
                    {isSelected && <Check size={12} className="text-violet-600 dark:text-violet-400 stroke-[2.5]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: READING FONT */}
      <div className="space-y-1 shrink-0">
        <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
          Reading Font
        </span>
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            setCurrentView('fontPicker');
          }}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-100/60 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80 text-xs font-medium text-slate-800 dark:text-zinc-100 hover:bg-slate-200/70 dark:hover:bg-zinc-700/80 transition-colors cursor-pointer"
        >
          <span style={{ fontFamily: selectedFontObj.stack }} className="truncate pr-2 font-medium">
            {selectedFontObj.label}
          </span>
          <ChevronRight size={14} className="text-slate-400 shrink-0" />
        </button>
      </div>

      {/* Subtle Low-Emphasis Reset to Defaults Action */}
      <div className="pt-1.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-center shrink-0">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onReset?.();
            setShowZoomMenu(false);
          }}
          className="flex items-center gap-1.5 py-0.5 px-2 rounded-lg text-[10px] font-medium text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors cursor-pointer"
        >
          <RotateCcw size={11} />
          <span>Reset to defaults</span>
        </button>
      </div>
    </div>
  );

  const renderFontPickerView = () => (
    <div className="flex flex-col justify-between h-full space-y-2.5">
      {/* Header with Back button */}
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-zinc-800/80 shrink-0">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            setCurrentView('main');
          }}
          className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 transition-colors cursor-pointer"
        >
          <ChevronLeft size={14} />
          <span>Back</span>
        </button>
        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
          Reading Font
        </span>
        <div className="w-8" />
      </div>

      {/* Search Bar */}
      <div className="relative shrink-0">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search fonts..."
          className="w-full pl-8 pr-7 py-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/80 text-xs text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
        />
        {searchQuery && (
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              setSearchQuery('');
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-0.5 cursor-pointer"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Scrollable Font List */}
      <div className="flex-1 min-h-0 overflow-y-auto thin-scrollbar space-y-0.5 pr-0.5">
        {filteredFonts.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 dark:text-zinc-500 font-medium">
            No fonts found matching "{searchQuery}"
          </div>
        ) : (
          filteredFonts.map((opt) => {
            const isSelected = browserFont === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onChangeFont?.(opt.id);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                  isSelected
                    ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-semibold border border-violet-200/80 dark:border-violet-800/60'
                    : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100/70 dark:hover:bg-zinc-800/80 border border-transparent'
                }`}
                style={{ fontFamily: opt.stack }}
              >
                <span className="truncate pr-2">{opt.label}</span>
                {isSelected && <Check size={13} className="text-violet-600 dark:text-violet-400 shrink-0 stroke-[2.5]" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  const content = (
    <div
      ref={popoverRef}
      data-popover
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className={containerClasses}
      style={containerStyle}
    >
      {currentView === 'main' ? renderMainView() : renderFontPickerView()}
    </div>
  );

  if (isStandalone) return content;

  const targetNode = document.fullscreenElement ?? document.body;
  return createPortal(content, targetNode);
};

export default BrowserFontPopover;
