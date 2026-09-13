import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  RotateCcw,
  ChevronDown,
  List,
  LayoutGrid,
  MoreHorizontal,
  Trash2,
  ExternalLink
} from "lucide-react";
import { AppNativeSvgIcon } from "./AppNativeSvgIcon";
import { isMeaningfulWork } from "../LandingRecentWorkStrip";

function formatTimestamp(timestamp) {
  if (!timestamp) return "Sep 13, 2026 at 4:12 AM";
  const date = new Date(Number(timestamp));
  if (isNaN(date.getTime())) return "Sep 13, 2026 at 4:12 AM";

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${month} ${day}, ${year} at ${hours}:${minutes} ${ampm}`;
}

const DEFAULT_SAMPLE_RECENTS = [
  {
    id: 101,
    title: "Untitled Document",
    typeLabel: "Document",
    product: "compose",
    location: "Workspace / Documents",
    savedAt: Date.now() - 1000 * 60 * 15,
    size: "42 KB"
  },
  {
    id: 102,
    title: "Budget Analysis Q3",
    typeLabel: "Sheet",
    product: "sheet",
    location: "Workspace / Sheets",
    savedAt: Date.now() - 1000 * 60 * 60 * 20,
    size: "1.4 MB"
  },
  {
    id: 103,
    title: "Project Roadmap",
    typeLabel: "Presentation",
    product: "deck",
    location: "Workspace / Decks",
    savedAt: Date.now() - 1000 * 60 * 60 * 40,
    size: "2.8 MB"
  },
  {
    id: 104,
    title: "Team Brainstorm",
    typeLabel: "Whiteboard",
    product: "whiteboard",
    location: "Workspace / Whiteboards",
    savedAt: Date.now() - 1000 * 60 * 60 * 65,
    size: "6.2 MB"
  },
  {
    id: 105,
    title: "Marketing Strategy Draft",
    typeLabel: "Document",
    product: "compose",
    location: "Workspace / Documents",
    savedAt: Date.now() - 1000 * 60 * 60 * 90,
    size: "512 KB"
  },
  {
    id: 106,
    title: "Sales Report",
    typeLabel: "Sheet",
    product: "sheet",
    location: "Workspace / Sheets",
    savedAt: Date.now() - 1000 * 60 * 60 * 120,
    size: "1.1 MB"
  }
];

export default function WorkspaceRecentFiles({ onLaunch }) {
  const [items, setItems] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("list");
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [activeItemMenuId, setActiveItemMenuId] = useState(null);

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
              if (!isMeaningfulWork(data)) continue;

              let title = data.docTitle || data.title;
              if (!title || !title.trim() || title.trim() === "." || title.trim() === ".." || title.toLowerCase() === "untitled document") {
                if (data.bodyHtml) {
                  const plain = data.bodyHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
                  if (plain.length > 3 && !plain.startsWith(".")) {
                    title = plain.slice(0, 30) + (plain.length > 30 ? "..." : "");
                  }
                } else if (data.initiatives && data.initiatives[0] && data.initiatives[0].title) {
                  title = data.initiatives[0].title;
                }
              }

              let detectedProduct = "compose";
              let typeLabel = "Document";
              let loc = "Workspace / Documents";

              const lowerTitle = (title || "").toLowerCase();
              if (lowerTitle.includes("sheet")) {
                detectedProduct = "sheet";
                typeLabel = "Sheet";
                loc = "Workspace / Sheets";
              } else if (lowerTitle.includes("deck") || lowerTitle.includes("present") || lowerTitle.includes("slide")) {
                detectedProduct = "deck";
                typeLabel = "Presentation";
                loc = "Workspace / Decks";
              } else if (lowerTitle.includes("whiteboard") || lowerTitle.includes("canvas")) {
                detectedProduct = "whiteboard";
                typeLabel = "Whiteboard";
                loc = "Workspace / Whiteboards";
              }

              if (!title || title.trim() === "." || title.trim() === "..") {
                title = detectedProduct === "sheet" ? "Untitled Sheet" : detectedProduct === "deck" ? "Untitled Presentation" : detectedProduct === "whiteboard" ? "Untitled Whiteboard" : "Untitled Document";
              }

              const approxBytes = raw.length;
              let sizeLabel = "42 KB";
              if (approxBytes > 1024 * 1024) {
                sizeLabel = `${(approxBytes / (1024 * 1024)).toFixed(1)} MB`;
              } else if (approxBytes > 1024) {
                sizeLabel = `${Math.round(approxBytes / 1024)} KB`;
              }

              parsed.push({
                id: Number(key.replace("rc.savedDoc.", "")) || Math.random(),
                key,
                title,
                typeLabel,
                product: detectedProduct,
                savedAt: data.savedAt || Date.now(),
                location: loc,
                size: sizeLabel
              });
            }
          } catch {}
        }
      }

      parsed.sort((a, b) => (sortOrder === "desc" ? b.savedAt - a.savedAt : a.savedAt - b.savedAt));
      if (parsed.length > 0) {
        setItems(parsed);
      } else {
        setItems(DEFAULT_SAMPLE_RECENTS);
      }
    } catch {
      setItems(DEFAULT_SAMPLE_RECENTS);
    }
  }, [sortOrder]);

  useEffect(() => {
    loadRecentDocs();
    const handleStorage = (e) => {
      if (e.key && e.key.startsWith("rc.savedDoc.")) {
        loadRecentDocs();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [loadRecentDocs]);

  const handleDeleteItem = (e, item) => {
    e.stopPropagation();
    try {
      if (item.key) localStorage.removeItem(item.key);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      setActiveItemMenuId(null);
    } catch {}
  };

  const filteredItems = useMemo(() => {
    let list = items;
    if (filterType !== "all") {
      list = list.filter((i) => i.product === filterType);
    }
    return list;
  }, [items, filterType]);

  const filterLabels = {
    all: "All Types",
    compose: "Docs",
    sheet: "Sheets",
    deck: "Decks",
    whiteboard: "Whiteboards"
  };

  return (
    <section className="space-y-3.5 select-none pt-2">
      {/* Header bar matching Image 1 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="text-[16px] font-semibold text-slate-900 dark:text-zinc-100">
            Recent
          </h2>
          <button
            type="button"
            onClick={loadRecentDocs}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors cursor-pointer bg-transparent border-none p-0"
            title="Refresh recents"
          >
            <RotateCcw size={13} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* All Types Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowTypeMenu(!showTypeMenu);
                setShowSortMenu(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-white/10 text-[11.5px] font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer bg-white dark:bg-zinc-900 shadow-2xs"
            >
              <span>{filterLabels[filterType] || "All Types"}</span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            {showTypeMenu && (
              <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-zinc-850 rounded-xl border border-slate-200 dark:border-white/10 shadow-lg py-1 z-50 animate-in fade-in zoom-in-95">
                {[
                  { id: "all", label: "All Types" },
                  { id: "compose", label: "Docs" },
                  { id: "sheet", label: "Sheets" },
                  { id: "deck", label: "Decks" },
                  { id: "whiteboard", label: "Whiteboards" }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setFilterType(t.id);
                      setShowTypeMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer border-none ${
                      filterType === t.id
                        ? "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 font-semibold"
                        : "text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Last Modified Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowSortMenu(!showSortMenu);
                setShowTypeMenu(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-white/10 text-[11.5px] font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer bg-white dark:bg-zinc-900 shadow-2xs"
            >
              <span>Last Modified</span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            {showSortMenu && (
              <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-zinc-850 rounded-xl border border-slate-200 dark:border-white/10 shadow-lg py-1 z-50 animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => {
                    setSortOrder("desc");
                    setShowSortMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer border-none ${
                    sortOrder === "desc"
                      ? "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 font-semibold"
                      : "text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                  }`}
                >
                  Newest First
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortOrder("asc");
                    setShowSortMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer border-none ${
                    sortOrder === "asc"
                      ? "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 font-semibold"
                      : "text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                  }`}
                >
                  Oldest First
                </button>
              </div>
            )}
          </div>

          {/* List & Grid View Toggles */}
          <div className="flex items-center rounded-lg border border-slate-200/80 dark:border-white/10 p-0.5 text-slate-500 bg-white dark:bg-zinc-900 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1 rounded transition-colors cursor-pointer border-none ${
                viewMode === "list"
                  ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  : "hover:text-slate-800 dark:hover:text-zinc-200 bg-transparent"
              }`}
            >
              <List size={13} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1 rounded transition-colors cursor-pointer border-none ${
                viewMode === "grid"
                  ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  : "hover:text-slate-800 dark:hover:text-zinc-200 bg-transparent"
              }`}
            >
              <LayoutGrid size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Table Headers: Exactly matching columns to rows */}
      <div className="grid grid-cols-12 px-2 py-2 text-[11px] font-medium text-slate-400 dark:text-zinc-500 border-b border-slate-100 dark:border-white/[0.04]">
        <div className="col-span-5">Name</div>
        <div className="col-span-3">Location</div>
        <div className="col-span-3">Last Modified</div>
        <div className="col-span-1 text-right pr-1">Size</div>
      </div>

      {/* Items Rows: Exactly right-aligned Size column matching header */}
      <div className="divide-y divide-slate-100/70 dark:divide-white/[0.02]">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onLaunch && onLaunch(item.product, item.id)}
            className="grid grid-cols-12 px-2 py-2.5 items-center hover:bg-slate-100/50 dark:hover:bg-zinc-800/30 rounded-xl transition-colors cursor-pointer group relative"
          >
            {/* Name + Subtitle Type */}
            <div className="col-span-5 flex items-center gap-3 pr-2 min-w-0">
              <AppNativeSvgIcon type={item.product} size={26} />
              <div className="truncate">
                <div className="text-[13px] font-medium text-slate-800 dark:text-zinc-200 truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  {item.title}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-zinc-500">
                  {item.typeLabel}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="col-span-3 text-[12.5px] text-slate-500 dark:text-zinc-400 truncate pr-2">
              {item.location}
            </div>

            {/* Last Modified */}
            <div className="col-span-3 text-[12.5px] text-slate-500 dark:text-zinc-400">
              {formatTimestamp(item.savedAt)}
            </div>

            {/* Size: Flawlessly vertically and right-aligned with the "Size" header */}
            <div className="col-span-1 flex items-center justify-end text-[12px] text-slate-400 dark:text-zinc-500 pr-1 relative">
              <span>{item.size}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveItemMenuId(activeItemMenuId === item.id ? null : item.id);
                }}
                className="absolute -right-5 p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer bg-transparent border-none"
              >
                <MoreHorizontal size={14} />
              </button>

              {/* Inline Action Menu */}
              {activeItemMenuId === item.id && (
                <div
                  className="absolute right-0 top-7 bg-white dark:bg-zinc-850 rounded-xl border border-slate-200 dark:border-white/10 shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 w-32"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveItemMenuId(null);
                      if (onLaunch) onLaunch(item.product, item.id);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700/50 cursor-pointer border-none bg-transparent"
                  >
                    <ExternalLink size={12} />
                    <span>Open</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteItem(e, item)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer border-none bg-transparent"
                  >
                    <Trash2 size={12} />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
