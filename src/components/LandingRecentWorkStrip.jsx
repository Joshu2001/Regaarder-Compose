import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Clock, ArrowUpRight, X } from "lucide-react";
import {
  ComposeIcon,
  SheetIcon,
  DeckIcon,
  WhiteboardIcon
} from "./RegaarderProductIcons";

/**
 * Format relative time in a clean, Apple-style format (e.g. "Just now", "5m ago", "2h ago", "Yesterday").
 */
function formatRelativeTime(timestamp) {
  if (!timestamp) return "Recently";
  const now = Date.now();
  const diffMs = now - Number(timestamp);
  if (diffMs < 0 || isNaN(diffMs)) return "Recently";

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 2) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * Product icon lookup map.
 */
const PRODUCT_INFO = {
  compose: { name: "Docs", icon: ComposeIcon },
  sheet: { name: "Sheet", icon: SheetIcon },
  deck: { name: "Deck", icon: DeckIcon },
  whiteboard: { name: "Whiteboard", icon: WhiteboardIcon }
};

/**
 * Strict verification that a document contains real, user-authored work.
 * Untouched default templates, empty sheets, and default "Untitled" drafts are excluded.
 */
export function isMeaningfulWork(data) {
  if (!data || typeof data !== "object") return false;

  // 1. Title verification (strictly match all default system titles)
  const rawTitle = (data.docTitle || data.title || data.sheetsTitle || data.deckTitle || "").trim();
  const isDefaultTitle = !rawTitle || /^(untitled(\s+(document|sheet|sheets|spreadsheet|deck|presentation|whiteboard|canvas))?|document\s*#\d+|composition|sheet\s*\d+|untitled\s*sheet)$/i.test(rawTitle);

  // If title is a generic default "Untitled Sheet" / "Untitled", do NOT qualify as recent work by title alone!
  // It MUST have actual user-written content (body, custom cells, slides) below:
  if (rawTitle && !isDefaultTitle) {
    return true;
  }

  // 2. Subtitle verification
  const subtitle = (data.docSubtitle || data.subtitle || "").trim();
  if (subtitle.length > 0 && !/^untitled/i.test(subtitle)) {
    return true;
  }

  // 3. Document body text verification (MUST have real text characters)
  if (data.bodyHtml && typeof data.bodyHtml === "string") {
    const plain = data.bodyHtml
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&#160;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (plain.length > 0) {
      return true;
    }
  }

  // 4. Sheet grid cell content verification (MUST have custom user cells beyond default template/demo data)
  const defaultSheetWords = new Set([
    "item", "description", "qty", "quantity", "price", "unit price", "total", "amount", 
    "category", "status", "priority", "date", "name", "revenue", "cost", "profit",
    "jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec",
    "q1", "q2", "q3", "q4", "sample", "template", "untitled"
  ]);

  const hasSheetCellData = (grid) => {
    if (!grid) return false;
    let customCellCount = 0;
    const checkVal = (cell) => {
      if (cell === null || cell === undefined) return false;
      const val = typeof cell === "object" ? (cell.value ?? cell.raw ?? "") : cell;
      const str = String(val).trim().toLowerCase();
      if (!str) return false;
      if (!defaultSheetWords.has(str)) {
        customCellCount++;
      }
      return customCellCount >= 2;
    };

    if (Array.isArray(grid)) {
      for (const row of grid) {
        if (Array.isArray(row)) {
          for (const cell of row) {
            if (checkVal(cell)) return true;
          }
        }
      }
    } else if (grid.cells && typeof grid.cells === "object") {
      for (const c of Object.values(grid.cells)) {
        if (checkVal(c)) return true;
      }
    } else if (Array.isArray(grid.data)) {
      return hasSheetCellData(grid.data);
    }
    return false;
  };

  if (data.sheetGrids && typeof data.sheetGrids === "object") {
    for (const k in data.sheetGrids) {
      if (hasSheetCellData(data.sheetGrids[k])) return true;
    }
  }

  // 5. Deck slide content verification (MUST have user slide elements with text)
  if (Array.isArray(data.deckSlidesData) && data.deckSlidesData.length > 0) {
    const hasRealSlide = data.deckSlidesData.some(slide => {
      if (slide.title && slide.title.trim() && !/^(untitled|slide\s*\d*)/i.test(slide.title.trim())) return true;
      if (Array.isArray(slide.elements) && slide.elements.length > 0) {
        return slide.elements.some(el => (el.text || el.content || el.src || "").trim() !== "");
      }
      return false;
    });
    if (hasRealSlide) return true;
  }

  // 6. User-created initiatives (EXCLUDING the default hardcoded template initiatives)
  if (Array.isArray(data.initiatives) && data.initiatives.length > 0) {
    const defaultTitles = new Set([
      'strategic alignment',
      'market expansion',
      'core architecture',
      'talent acquisition',
      'untitled initiative',
      'untitled'
    ]);
    const hasCustomInitiative = data.initiatives.some(init => {
      const t = (init.title || "").trim().toLowerCase();
      return t && !defaultTitles.has(t);
    });
    if (hasCustomInitiative) return true;
  }

  // 7. Custom tasks
  if (Array.isArray(data.tasks) && data.tasks.length > 0) {
    if (data.tasks.some(t => (t.title || t.text || "").trim() !== "" && !/^untitled/i.test(t.title || t.text))) return true;
  }

  return false;
}

export default function LandingRecentWorkStrip({ onLaunch, onOpenRecentModal, onRecentCountChange }) {
  const [recentItems, setRecentItems] = useState([]);
  const [showAllModal, setShowAllModal] = useState(false);
  const onRecentCountChangeRef = (React.useRef ? React.useRef(onRecentCountChange) : (typeof useRef !== 'undefined' ? useRef(onRecentCountChange) : null)) || { current: onRecentCountChange };
  if (onRecentCountChangeRef) onRecentCountChangeRef.current = onRecentCountChange;

  const loadRecentDocs = useCallback(() => {
    try {
      const parsed = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("rc.savedDoc.")) {
          try {
            const raw = localStorage.getItem(key);
            if (raw) {
              const data = JSON.parse(raw);

              // Minimum criteria validation: untouched empty drafts do NOT qualify as recent work
              if (!isMeaningfulWork(data)) {
                // Prune ghost empty draft from localStorage so it never pollutes the workspace
                try {
                  localStorage.removeItem(key);
                } catch {}
                continue;
              }

              let title = (data.docTitle || data.title || data.sheetsTitle || data.deckTitle || "").trim();

              if (!title) {
                title = "Untitled";
              }

              let detectedProduct = "compose";
              if (/sheet/i.test(title)) detectedProduct = "sheet";
              else if (/deck|presentation/i.test(title)) detectedProduct = "deck";
              else if (/whiteboard|canvas/i.test(title)) detectedProduct = "whiteboard";

              const info = PRODUCT_INFO[detectedProduct] || PRODUCT_INFO.compose;

              parsed.push({
                id: Number(key.replace("rc.savedDoc.", "")),
                title,
                savedAt: data.savedAt || Date.now(),
                product: detectedProduct,
                productName: info.name,
                icon: info.icon,
                data
              });
            }
          } catch {
            // Ignore malformed keys
          }
        }
      }

      parsed.sort((a, b) => b.savedAt - a.savedAt);

      const formatted = parsed.map(item => ({
        ...item,
        editedLabel: formatRelativeTime(item.savedAt)
      }));

      setRecentItems(formatted);
      onRecentCountChangeRef.current?.(formatted.length);
    } catch {
      setRecentItems([]);
      onRecentCountChangeRef.current?.(0);
    }
  }, []);

  useEffect(() => {
    loadRecentDocs();

    const handleStorage = () => loadRecentDocs();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [loadRecentDocs]);

  // Progressive disclosure: No recent work → completely remove the section from DOM
  if (!recentItems || recentItems.length === 0) return null;

  // Compact horizontal row displaying up to 3 items
  const visibleItems = recentItems.slice(0, 3);
  const isFewItems = visibleItems.length <= 2;

  const handleOpenDoc = (item) => {
    try {
      if (item.id) {
        localStorage.setItem("rc.activeDocId", String(item.id));
      }
    } catch {}
    onLaunch?.({ type: 'action', name: item.product || 'compose', doc: item });
  };

  return (
    <div className="w-full mt-6 animate-in fade-in slide-in-from-bottom-1 duration-300">
      {/* Visually Quiet Section Header */}
      <div className="flex items-center justify-between px-1 mb-1.5 select-none">
        <div className="flex items-center gap-1.5 text-[9.5px] font-semibold tracking-[0.08em] uppercase text-slate-400 dark:text-zinc-500">
          <Clock size={10} strokeWidth={2} className="opacity-65" />
          <span>Recent Work</span>
        </div>

        {/* View all affordance aligned right */}
        <button
          type="button"
          onClick={() => {
            if (onOpenRecentModal) {
              onOpenRecentModal();
            } else {
              setShowAllModal(true);
            }
          }}
          className="text-[10.5px] font-medium text-slate-400/90 hover:text-violet-600 dark:text-zinc-500/90 dark:hover:text-violet-400 transition-colors cursor-pointer bg-transparent border-none p-0 outline-none focus:outline-none"
        >
          View all →
        </button>
      </div>

      {/*
        Compact Horizontal Shelf (Up to 3 items):
        - 1 item: single compact card
        - 2 items: 2-column compact shelf
        - 3 items: 3-column compact shelf
        Items are visually quiet and subordinate to product launcher cards.
      */}
      <div
        className={[
          "grid gap-2 w-full",
          isFewItems
            ? visibleItems.length === 1
              ? "grid-cols-1 max-w-sm"
              : "grid-cols-1 sm:grid-cols-2"
            : "grid-cols-1 sm:grid-cols-3"
        ].join(" ")}
      >
        {visibleItems.map((item) => {
          const IconComp = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleOpenDoc(item)}
              className={[
                "group relative flex items-center justify-between",
                // Compact padding and quiet height
                "px-3 py-1.5 rounded-lg",
                // Ultra-quiet background and hairline border
                "bg-black/[0.012] dark:bg-white/[0.018]",
                "border border-slate-200/40 dark:border-white/[0.035]",
                "shadow-none",
                // Soft hover reveal
                "hover:bg-white/80 dark:hover:bg-[#1a1a1d]",
                "hover:border-slate-300/50 dark:hover:border-white/[0.07]",
                "hover:shadow-[0_2px_6px_rgba(15,23,42,0.03)] dark:hover:shadow-[0_2px_6px_rgba(0,0,0,0.3)]",
                "active:scale-[0.99]",
                "outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0",
                "transition-all duration-150 ease-out cursor-pointer text-left",
              ].join(" ")}
            >
              {/* Product Icon & Compact Metadata */}
              <div className="flex items-center gap-2 min-w-0 pr-1.5">
                <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0 text-slate-400 dark:text-zinc-500 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  <IconComp size={13} strokeWidth={1.5} />
                </div>

                <div className="min-w-0 flex items-center gap-1.5 text-[11.5px] leading-normal truncate">
                  <span className="font-medium text-slate-600 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-zinc-100 truncate transition-colors">
                    {item.title}
                  </span>
                  <span className="text-slate-300/80 dark:text-zinc-600/80 shrink-0 select-none">·</span>
                  <span className="text-[9.5px] text-slate-400/80 dark:text-zinc-500/80 font-normal shrink-0">
                    {item.productName} · {item.editedLabel}
                  </span>
                </div>
              </div>

              {/* Subtle Navigation Affordance */}
              <ArrowUpRight
                size={11}
                strokeWidth={1.8}
                className="shrink-0 text-slate-300 dark:text-zinc-600 group-hover:text-slate-500 dark:group-hover:text-zinc-400 transition-colors ml-1"
              />
            </button>
          );
        })}
      </div>

      {/* Sleek Recent Documents Modal Dialog (Triggered by 'View all →') */}
      {showAllModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 dark:bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowAllModal(false)}
        >
          <div
            className="bg-white dark:bg-[#18181b] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl shadow-xl w-full max-w-md p-5 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-800 dark:text-zinc-100">
                <Clock size={14} className="text-slate-500" />
                <span>Recent Work</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAllModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 text-xs p-1 cursor-pointer bg-transparent border-none outline-none"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-1 max-h-[55vh] overflow-y-auto thin-scrollbar pr-0.5">
              {recentItems.map((item) => {
                const IconComp = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setShowAllModal(false);
                      handleOpenDoc(item);
                    }}
                    className="w-full group flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100/70 dark:hover:bg-zinc-800/70 transition-colors text-left cursor-pointer border border-transparent hover:border-slate-200/60 dark:hover:border-white/5 outline-none focus:outline-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="w-4 h-4 flex items-center justify-center shrink-0 text-slate-400 dark:text-zinc-500 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                        <IconComp size={14} strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[12.5px] font-medium text-slate-700 dark:text-zinc-200 truncate group-hover:text-slate-950 dark:group-hover:text-white">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                          {item.productName} · {item.editedLabel}
                        </div>
                      </div>
                    </div>
                    <ArrowUpRight size={12} className="shrink-0 text-slate-300 dark:text-zinc-600 group-hover:text-slate-500 dark:group-hover:text-zinc-400 transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
