import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  RotateCcw,
  ChevronDown,
  List,
  LayoutGrid,
  MoreHorizontal,
  Trash2,
  ExternalLink,
  Star,
  Share2,
  Edit2,
  FolderInput,
  Check
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

  // Selection state
  const [selectedIds, setSelectedIds] = useState(new Set());
  // Starred state persisted in localStorage
  const [starredIds, setStarredIds] = useState(() => {
    try {
      const stored = localStorage.getItem("rc.starredDocs");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Rename inline state
  const [renamingDocId, setRenamingDocId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  // Share feedback notification
  const [feedbackToast, setFeedbackToast] = useState(null);

  const containerRef = useRef(null);

  // Unified click-outside dismissal
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setActiveItemMenuId(null);
        setShowTypeMenu(false);
        setShowSortMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

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

  const toggleStar = (e, itemId) => {
    e.stopPropagation();
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      try {
        localStorage.setItem("rc.starredDocs", JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  const handleShare = (e, item) => {
    e.stopPropagation();
    const link = `${window.location.origin}/#/${item.product}/${item.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).then(() => {
        setFeedbackToast(`Link copied: ${item.title}`);
        setTimeout(() => setFeedbackToast(null), 2500);
      });
    } else {
      setFeedbackToast(`Share: ${item.title}`);
      setTimeout(() => setFeedbackToast(null), 2500);
    }
  };

  const startRename = (e, item) => {
    e.stopPropagation();
    setActiveItemMenuId(null);
    setRenamingDocId(item.id);
    setRenameValue(item.title);
  };

  const submitRename = (item) => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== item.title) {
      if (item.key) {
        try {
          const raw = localStorage.getItem(item.key);
          if (raw) {
            const data = JSON.parse(raw);
            data.docTitle = trimmed;
            data.title = trimmed;
            localStorage.setItem(item.key, JSON.stringify(data));
          }
        } catch {}
      }
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, title: trimmed } : i))
      );
    }
    setRenamingDocId(null);
  };

  const handleDeleteItem = (e, item) => {
    e.stopPropagation();
    try {
      if (item.key) localStorage.removeItem(item.key);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
      setActiveItemMenuId(null);
    } catch {}
  };

  const handleRemoveFromRecents = (e, item) => {
    e.stopPropagation();
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(item.id);
      return next;
    });
    setActiveItemMenuId(null);
  };

  const filteredItems = useMemo(() => {
    let list = items;
    if (filterType !== "all") {
      list = list.filter((i) => i.product === filterType);
    }
    return list;
  }, [items, filterType]);

  const isMultiSelectActive = selectedIds.size > 0;
  const allFilteredSelected =
    filteredItems.length > 0 &&
    filteredItems.every((item) => selectedIds.has(item.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((i) => i.id)));
    }
  };

  const toggleItemSelection = (e, itemId) => {
    e?.stopPropagation?.();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleBulkRemoveRecords = () => {
    setItems((prev) => prev.filter((i) => !selectedIds.has(i.id)));
    setSelectedIds(new Set());
  };

  const handleBulkDelete = () => {
    try {
      items.forEach((item) => {
        if (selectedIds.has(item.id) && item.key) {
          localStorage.removeItem(item.key);
        }
      });
      setItems((prev) => prev.filter((i) => !selectedIds.has(i.id)));
      setSelectedIds(new Set());
    } catch {}
  };

  const handleBulkShare = () => {
    const selectedCount = selectedIds.size;
    setFeedbackToast(`Shared link for ${selectedCount} file${selectedCount > 1 ? "s" : ""}`);
    setTimeout(() => setFeedbackToast(null), 2500);
  };

  const filterLabels = {
    all: "All Types",
    compose: "Docs",
    sheet: "Sheets",
    deck: "Decks",
    whiteboard: "Whiteboards"
  };

  return (
    <section ref={containerRef} className="space-y-3.5 select-none pt-2 relative">
      {/* Toast alert */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 text-xs px-3.5 py-2 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <Check size={13} className="text-emerald-400 dark:text-emerald-600" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex items-center justify-between min-h-[36px]">
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

      {/* Dynamic Table Header vs Bulk Action Bar */}
      {isMultiSelectActive ? (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200/60 dark:border-violet-800/40 text-xs text-slate-700 dark:text-zinc-200 animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSelectAll}
              className={`w-4 h-4 rounded flex items-center justify-center border transition-all cursor-pointer ${
                allFilteredSelected
                  ? "bg-violet-600 border-violet-600 text-white"
                  : "bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-600 hover:border-violet-500"
              }`}
              title={allFilteredSelected ? "Deselect all" : "Select all"}
            >
              {allFilteredSelected && <Check size={11} strokeWidth={3} />}
            </button>
            <span className="font-semibold text-violet-950 dark:text-violet-200">
              ${selectedIds.size} item${selectedIds.size > 1 ? "s" : ""} selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-violet-600 dark:text-violet-400 hover:underline font-medium cursor-pointer bg-transparent border-none p-0 text-xs"
            >
              Deselect
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleBulkShare}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 border border-slate-200/80 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <Share2 size={12} />
              <span>Share</span>
            </button>
            <button
              type="button"
              onClick={handleBulkRemoveRecords}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 border border-slate-200/80 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer shadow-2xs"
            >
              Remove records
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800/40 text-xs font-medium text-red-600 dark:text-red-300 transition-colors cursor-pointer shadow-2xs"
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-12 px-2 py-2 text-[11px] font-medium text-slate-400 dark:text-zinc-500 border-b border-slate-100 dark:border-white/[0.04]">
          <div className="col-span-5 pl-7">Name</div>
          <div className="col-span-3">Location</div>
          <div className="col-span-3">Last Modified</div>
          <div className="col-span-1 text-right pr-1">Size</div>
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <div className="divide-y divide-slate-100/70 dark:divide-white/[0.02]">
          {filteredItems.map((item) => {
            const isSelected = selectedIds.has(item.id);
            const isStarred = starredIds.has(item.id);
            const isRenaming = renamingDocId === item.id;
            const isMenuOpen = activeItemMenuId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (isMultiSelectActive) {
                    toggleItemSelection(null, item.id);
                  } else if (onLaunch) {
                    onLaunch(item.product, item.id);
                  }
                }}
                className={`grid grid-cols-12 px-2 py-2.5 items-center rounded-xl transition-all cursor-pointer group relative ${
                  isSelected
                    ? "bg-violet-50/70 dark:bg-violet-950/25 ring-1 ring-violet-200 dark:ring-violet-800/40"
                    : "hover:bg-slate-100/50 dark:hover:bg-zinc-800/30"
                }`}
              >
                {/* Name Column with Checkbox slot & App icon */}
                <div className="col-span-5 flex items-center gap-2.5 pr-2 min-w-0">
                  {/* WPS / Apple style Checkbox slot on the far left */}
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    <button
                      type="button"
                      onClick={(e) => toggleItemSelection(e, item.id)}
                      className={`w-4 h-4 rounded flex items-center justify-center border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-violet-600 border-violet-600 text-white opacity-100"
                          : isMultiSelectActive
                          ? "bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-600 hover:border-violet-500 opacity-100"
                          : "bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-600 hover:border-violet-500 opacity-0 group-hover:opacity-100"
                      }`}
                      title={isSelected ? "Deselect file" : "Select file"}
                    >
                      {isSelected && <Check size={11} strokeWidth={3} />}
                    </button>
                  </div>

                  <AppNativeSvgIcon type={item.product} size={26} />

                  <div className="truncate flex-1">
                    {isRenaming ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          submitRename(item);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1"
                      >
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={() => submitRename(item)}
                          autoFocus
                          className="text-[13px] font-medium text-slate-800 dark:text-zinc-100 bg-white dark:bg-zinc-900 border border-violet-400 dark:border-violet-500 rounded px-1.5 py-0.5 outline-none w-full"
                        />
                      </form>
                    ) : (
                      <>
                        <div
                          className="text-[13px] font-medium text-slate-800 dark:text-zinc-200 truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors"
                          title={item.title}
                        >
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-zinc-500">
                          {item.typeLabel}
                        </div>
                      </>
                    )}
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

                {/* Size Column + Hover Contextual Actions (Star, Share, More) */}
                <div className="col-span-1 flex items-center justify-end text-[12px] text-slate-400 dark:text-zinc-500 pr-1 relative">
                  {/* Size text (hidden when hovering so actions fit cleanly) */}
                  <span className={`${isMenuOpen ? "opacity-0" : "group-hover:opacity-0"} transition-opacity`}>
                    {item.size}
                  </span>

                  {/* Contextual Action Group: Revealed on row hover */}
                  <div
                    className={`absolute right-0 flex items-center gap-1 transition-opacity ${
                      isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Star Button */}
                    <button
                      type="button"
                      onClick={(e) => toggleStar(e, item.id)}
                      className={`p-1 rounded-md transition-colors cursor-pointer border-none bg-transparent ${
                        isStarred
                          ? "text-amber-400 hover:text-amber-500"
                          : "text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
                      }`}
                      title={isStarred ? "Starred" : "Star file"}
                    >
                      <Star
                        size={13}
                        className={isStarred ? "fill-amber-400 text-amber-400" : ""}
                      />
                    </button>

                    {/* Share Button */}
                    <button
                      type="button"
                      onClick={(e) => handleShare(e, item)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors cursor-pointer border-none bg-transparent"
                      title="Share link"
                    >
                      <Share2 size={13} />
                    </button>

                    {/* More Horizontal Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveItemMenuId(isMenuOpen ? null : item.id);
                      }}
                      className={`p-1 rounded-md transition-colors cursor-pointer border-none ${
                        isMenuOpen
                          ? "bg-slate-200 dark:bg-zinc-700 text-slate-900 dark:text-zinc-100"
                          : "text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 bg-transparent"
                      }`}
                      title="More actions"
                    >
                      <MoreHorizontal size={14} />
                    </button>
                  </div>

                  {/* Contextual Dropdown Menu */}
                  {isMenuOpen && (
                    <div
                      className="absolute right-0 top-7 bg-white dark:bg-zinc-850 rounded-xl border border-slate-200 dark:border-white/10 shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 w-44"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setActiveItemMenuId(null);
                          if (onLaunch) onLaunch(item.product, item.id);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-750 cursor-pointer border-none bg-transparent"
                      >
                        <ExternalLink size={13} className="text-slate-400" />
                        <span>Open</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => startRename(e, item)}
                        className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-750 cursor-pointer border-none bg-transparent"
                      >
                        <Edit2 size={13} className="text-slate-400" />
                        <span>Rename</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          toggleStar(e, item.id);
                          setActiveItemMenuId(null);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-750 cursor-pointer border-none bg-transparent"
                      >
                        <Star
                          size={13}
                          className={isStarred ? "fill-amber-400 text-amber-400" : "text-slate-400"}
                        />
                        <span>{isStarred ? "Unstar" : "Star"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          handleShare(e, item);
                          setActiveItemMenuId(null);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-750 cursor-pointer border-none bg-transparent"
                      >
                        <Share2 size={13} className="text-slate-400" />
                        <span>Share</span>
                      </button>

                      <div className="my-1 border-t border-slate-100 dark:border-white/[0.06]" />

                      <button
                        type="button"
                        onClick={(e) => handleRemoveFromRecents(e, item)}
                        className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-750 cursor-pointer border-none bg-transparent"
                      >
                        <FolderInput size={13} className="text-slate-400" />
                        <span>Remove from Recents</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteItem(e, item)}
                        className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer border-none bg-transparent"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 pt-1">
          {filteredItems.map((item) => {
            const isSelected = selectedIds.has(item.id);
            const isStarred = starredIds.has(item.id);

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (isMultiSelectActive) {
                    toggleItemSelection(null, item.id);
                  } else if (onLaunch) {
                    onLaunch(item.product, item.id);
                  }
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between h-36 ${
                  isSelected
                    ? "bg-violet-50/70 dark:bg-violet-950/25 border-violet-300 dark:border-violet-700 shadow-sm"
                    : "bg-white dark:bg-zinc-850 border-slate-200/70 dark:border-white/[0.06] hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-700"
                }`}
              >
                {/* Top row: Checkbox slot & Star button */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={(e) => toggleItemSelection(e, item.id)}
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-violet-600 border-violet-600 text-white opacity-100"
                        : isMultiSelectActive
                        ? "bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-600 hover:border-violet-500 opacity-100"
                        : "bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-600 hover:border-violet-500 opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {isSelected && <Check size={11} strokeWidth={3} />}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => toggleStar(e, item.id)}
                      className={`p-1 rounded-md transition-colors cursor-pointer border-none bg-transparent ${
                        isStarred
                          ? "text-amber-400 opacity-100"
                          : "text-slate-400 opacity-0 group-hover:opacity-100 hover:text-slate-700"
                      }`}
                    >
                      <Star size={12} className={isStarred ? "fill-amber-400" : ""} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleShare(e, item)}
                      className="p-1 rounded-md text-slate-400 opacity-0 group-hover:opacity-100 hover:text-slate-700 transition-colors cursor-pointer border-none bg-transparent"
                    >
                      <Share2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Center product icon */}
                <div className="my-auto flex items-center justify-center">
                  <AppNativeSvgIcon type={item.product} size={32} />
                </div>

                {/* Bottom title & metadata */}
                <div>
                  <div
                    className="text-[12.5px] font-medium text-slate-800 dark:text-zinc-200 truncate group-hover:text-violet-600 dark:group-hover:text-violet-400"
                    title={item.title}
                  >
                    {item.title}
                  </div>
                  <div className="flex items-center justify-between text-[10.5px] text-slate-400 dark:text-zinc-500 mt-0.5">
                    <span>{item.typeLabel}</span>
                    <span>{item.size}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
