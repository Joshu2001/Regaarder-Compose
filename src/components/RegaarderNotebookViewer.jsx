import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Plus, Search, MoreHorizontal, ChevronDown,
  X, ArrowUpDown, AlignLeft, CheckSquare, Edit3, Type,
  Highlighter, Paperclip, ImagePlus, FileText, Pin, PinOff
} from "lucide-react";
import { RegaarderAiIcon, NotesIcon } from "./RegaarderProductIcons";

// ─── Constants ─────────────────────────────────────────────────────────────────

const BASELINE_PX = 36; // Exact ruling rhythm matching reference design

// ─── Toolbar Popover Shell ──────────────────────────────────────────────────────

function ToolbarPopover({ anchorRef, onClose, children, width = 210 }) {
  const popRef = useRef(null);

  useEffect(() => {
    const anchor = anchorRef.current;
    const pop = popRef.current;
    if (!anchor || !pop) return;

    const rect = anchor.getBoundingClientRect();
    pop.style.top = `${rect.bottom + 6}px`;
    pop.style.left = `${rect.left}px`;

    const rightEdge = rect.left + width;
    if (rightEdge > window.innerWidth - 12) {
      pop.style.left = `${window.innerWidth - width - 12}px`;
    }

    const handleOutside = (e) => {
      if (!pop.contains(e.target) && !anchor.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [anchorRef, onClose, width]);

  return (
    <div
      ref={popRef}
      className="fixed z-50 rounded-xl shadow-xl border p-2 animate-in fade-in zoom-in-95 duration-100 select-none text-slate-800 dark:text-zinc-100"
      style={{
        width,
        background: "rgba(255, 255, 255, 0.98)",
        borderColor: "rgba(0, 0, 0, 0.08)",
        backdropFilter: "blur(16px)",
      }}
    >
      {children}
    </div>
  );
}

// ─── Notes Write Toolbar Controls (matching reference) ──────────────────────────

/**
 * NotesWriteToolbarControls
 * Action controls in reference: Pen (active outline/pill), Text, Highlight, Checklist, Insert ⌄, AI ⌄, ... More
 */
export function NotesWriteToolbarControls({
  activeDoc,
  onUpdateDoc,
  onNewNote,
  onConvertToDoc,
  isDarkMode,
}) {
  const [activeTool, setActiveTool] = useState("pen"); // 'pen' | 'text' | 'highlight' | 'checklist'
  const [openPopover, setOpenPopover] = useState(null); // 'insert' | 'ai' | 'more'
  const refs = {
    insert: useRef(null),
    ai: useRef(null),
    more: useRef(null),
  };

  const closeAll = () => setOpenPopover(null);
  const toggle = (id) => setOpenPopover((prev) => (prev === id ? null : id));

  const exec = (cmd, value = null) => {
    document.execCommand(cmd, false, value);
  };

  const btnClass = (isActive) =>
    `flex items-center gap-1.5 px-3 py-1 rounded-full text-[12.5px] font-medium transition-all duration-150 cursor-pointer select-none ${
      isActive
        ? "bg-[#F3F0FF] text-[#7C3AED] border border-[#DDD6FE] shadow-2xs font-semibold"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent"
    }`;

  return (
    <div className="flex items-center gap-1.5 animate-in fade-in duration-150 select-none">
      {/* Pen tool */}
      <button
        type="button"
        onClick={() => setActiveTool("pen")}
        className={btnClass(activeTool === "pen")}
        title="Pen / Handwriting mode"
      >
        <Edit3 size={13} strokeWidth={2} />
        <span>Pen</span>
      </button>

      {/* Text tool */}
      <button
        type="button"
        onClick={() => {
          setActiveTool("text");
          exec("formatBlock", "p");
        }}
        className={btnClass(activeTool === "text")}
        title="Type Text"
      >
        <Type size={13} strokeWidth={2} />
        <span>Text</span>
      </button>

      {/* Highlight tool */}
      <button
        type="button"
        onClick={() => {
          setActiveTool("highlight");
          exec("hiliteColor", "#FEF08A");
        }}
        className={btnClass(activeTool === "highlight")}
        title="Highlight"
      >
        <Highlighter size={13} strokeWidth={2} />
        <span>Highlight</span>
      </button>

      {/* Checklist tool */}
      <button
        type="button"
        onClick={() => {
          setActiveTool("checklist");
          exec(
            "insertHTML",
            '<div class="note-todo-item" style="display:flex;align-items:center;gap:8px;margin:4px 0;"><input type="checkbox" style="width:16px;height:16px;accent-color:#7C3AED;cursor:pointer;" /> <span>New action item</span></div>'
          );
        }}
        className={btnClass(activeTool === "checklist")}
        title="Checklist"
      >
        <CheckSquare size={13} strokeWidth={2} />
        <span>Checklist</span>
      </button>

      {/* Insert ⌄ */}
      <div className="relative">
        <button
          ref={refs.insert}
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            toggle("insert");
          }}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer ${
            openPopover === "insert" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
          }`}
        >
          <Plus size={13} strokeWidth={2} />
          <span>Insert</span>
          <ChevronDown size={11} strokeWidth={2} className="opacity-60" />
        </button>

        {openPopover === "insert" && (
          <ToolbarPopover anchorRef={refs.insert} onClose={closeAll} width={180}>
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = (ev) => {
                    const file = ev.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (re) => {
                      exec("insertHTML", `<img src="${re.result}" style="max-width:100%;border-radius:8px;margin:8px 0;" />`);
                    };
                    reader.readAsDataURL(file);
                  };
                  input.click();
                  closeAll();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12.5px] text-slate-700 hover:bg-slate-100 transition-colors text-left"
              >
                <ImagePlus size={13} strokeWidth={1.8} />
                <span>Image</span>
              </button>
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  const url = prompt("Enter URL link:");
                  if (url) exec("createLink", url);
                  closeAll();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12.5px] text-slate-700 hover:bg-slate-100 transition-colors text-left"
              >
                <Paperclip size={13} strokeWidth={1.8} />
                <span>Link</span>
              </button>
            </div>
          </ToolbarPopover>
        )}
      </div>

      {/* AI ⌄ (with official RegaarderAiIcon signature) */}
      <div className="relative">
        <button
          ref={refs.ai}
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            toggle("ai");
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer ${
            openPopover === "ai" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
          }`}
        >
          <RegaarderAiIcon size={14} strokeWidth={1.8} />
          <span>AI</span>
          <ChevronDown size={11} strokeWidth={2} className="opacity-60" />
        </button>

        {openPopover === "ai" && (
          <ToolbarPopover anchorRef={refs.ai} onClose={closeAll} width={210}>
            <div className="px-2 py-1 text-[10px] font-semibold tracking-wider uppercase text-slate-400">
              AI Note Actions
            </div>
            <div className="flex flex-col gap-0.5">
              {[
                { label: "Summarize thoughts", sub: "Generate brief key points" },
                { label: "Structure into checklist", sub: "Convert items into tasks" },
                { label: "Continue writing", sub: "Brainstorm next steps" },
                { label: "Refine tone & grammar", sub: "Polish handwritten phrasing" },
              ].map(({ label, sub }) => (
                <button
                  key={label}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    closeAll();
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-violet-50 hover:text-violet-700 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <RegaarderAiIcon size={12} />
                    <span className="text-xs font-medium text-slate-800">{label}</span>
                  </div>
                  <div className="text-[10.5px] text-slate-400 pl-4">{sub}</div>
                </button>
              ))}
            </div>
          </ToolbarPopover>
        )}
      </div>

      {/* More ... */}
      <div className="relative">
        <button
          ref={refs.more}
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            toggle("more");
          }}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer ${
            openPopover === "more" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
          }`}
        >
          <MoreHorizontal size={13} strokeWidth={2} />
          <span>More</span>
        </button>

        {openPopover === "more" && (
          <ToolbarPopover anchorRef={refs.more} onClose={closeAll} width={190}>
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onConvertToDoc?.();
                  closeAll();
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left"
              >
                <FileText size={13} strokeWidth={1.8} />
                <span>Convert to Document</span>
              </button>
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onUpdateDoc?.({ pinned: !activeDoc?.pinned });
                  closeAll();
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left"
              >
                {activeDoc?.pinned ? <PinOff size={13} strokeWidth={1.8} /> : <Pin size={13} strokeWidth={1.8} />}
                <span>{activeDoc?.pinned ? "Unpin Note" : "Pin Note"}</span>
              </button>
            </div>
          </ToolbarPopover>
        )}
      </div>
    </div>
  );
}

// ─── Collapsible Notes Sidebar ──────────────────────────────────────────────────

function NotesSidebar({
  documents,
  activeDoc,
  onSelectDoc,
  onNewNote,
  onCloseSidebar,
  sortAscending,
  onToggleSort,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenuDocId, setActiveMenuDocId] = useState(null);

  // Filter notes belonging to notes mode or isNotesDoc
  const notes = useMemo(() => {
    const list = (documents || []).filter((d) => d.isNotesDoc || d.mode === "notes");
    const filtered = list.filter((n) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const titleMatch = (n.title || "Untitled Note").toLowerCase().includes(q);
      const bodyMatch = (n.bodyHtml || "").toLowerCase().includes(q);
      return titleMatch || bodyMatch;
    });

    return filtered.sort((a, b) => {
      const timeA = a.updatedAt || a.createdAt || 0;
      const timeB = b.updatedAt || b.createdAt || 0;
      return sortAscending ? timeA - timeB : timeB - timeA;
    });
  }, [documents, searchQuery, sortAscending]);

  // Format date or timestamp cleanly matching reference (e.g. "Today · 3:42 PM", "Sep 14, 2025")
  const formatNoteDate = (doc) => {
    if (!doc.createdAt && !doc.updatedAt) return "Today · 3:42 PM";
    const d = new Date(doc.updatedAt || doc.createdAt);
    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    if (isToday) {
      const timeStr = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      return `Today · ${timeStr}`;
    }
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Extract preview snippet
  const getNoteSnippet = (doc) => {
    if (!doc.bodyHtml) return "Finish the Regaarder Workspace mockups...";
    const plain = doc.bodyHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    return plain.length > 55 ? plain.substring(0, 55) + "..." : plain || "Empty note";
  };

  // Choose icon based on note title/type
  const getNoteIcon = (doc) => {
    const title = (doc.title || "").toLowerCase();
    if (title.includes("idea") || title.includes("project")) {
      return <Edit3 size={14} className="shrink-0 text-slate-400 group-hover:text-slate-600" />;
    }
    if (title.includes("plan") || title.includes("study") || title.includes("action")) {
      return <AlignLeft size={14} className="shrink-0 text-slate-400 group-hover:text-slate-600" />;
    }
    if (title.includes("meeting") || title.includes("personal") || title.includes("business")) {
      return <FileText size={14} className="shrink-0 text-slate-400 group-hover:text-slate-600" />;
    }
    return <NotesIcon size={14} className="shrink-0 text-violet-600" />;
  };

  return (
    <aside
      className="w-[260px] h-full flex flex-col border-r border-slate-200/70 dark:border-zinc-800 bg-[#FFFFFF] dark:bg-[#18181B] shrink-0 select-none z-10 transition-all duration-200"
    >
      {/* Header: Notes icon + Notes text + Close button */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <NotesIcon size={18} className="text-violet-600 dark:text-violet-400" />
          <span className="text-[14px] font-semibold text-slate-900 dark:text-zinc-100 tracking-tight">
            Notes
          </span>
        </div>
        <button
          type="button"
          onClick={onCloseSidebar}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Close notes sidebar"
        >
          <X size={14} strokeWidth={2} />
        </button>
      </div>

      {/* Search Input */}
      <div className="px-3 py-1.5">
        <div className="relative flex items-center">
          <Search size={13} className="absolute left-2.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-100/70 dark:bg-zinc-800/60 hover:bg-slate-100 focus:bg-white dark:focus:bg-zinc-900 border border-transparent focus:border-violet-400 rounded-xl outline-none transition-all text-slate-800 dark:text-zinc-200 placeholder-slate-400"
          />
        </div>
      </div>

      {/* CTA: + New Note */}
      <div className="px-3 py-1.5">
        <button
          type="button"
          onClick={onNewNote}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#F3F0FF] dark:bg-violet-950/40 text-[#6D28D9] dark:text-violet-300 hover:bg-[#EDE9FE] dark:hover:bg-violet-900/50 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
        >
          <Plus size={14} strokeWidth={2.2} />
          <span>New Note</span>
        </button>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1 thin-scrollbar">
        {notes.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">No notes found</div>
        ) : (
          notes.map((note) => {
            const isActive = activeDoc?.id === note.id;
            return (
              <div
                key={note.id}
                onClick={() => onSelectDoc(note.id)}
                className={`group relative w-full text-left p-2.5 rounded-xl transition-all cursor-pointer select-none ${
                  isActive
                    ? "bg-[#F3F0FF] dark:bg-violet-950/30 text-slate-900 dark:text-zinc-100"
                    : "hover:bg-slate-50 dark:hover:bg-zinc-800/50 text-slate-700 dark:text-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {isActive ? (
                      <NotesIcon size={14} className="shrink-0 text-violet-600 dark:text-violet-400" />
                    ) : (
                      getNoteIcon(note)
                    )}
                    <span
                      className={`text-xs font-semibold truncate ${
                        isActive ? "text-slate-900 dark:text-zinc-100" : "text-slate-800 dark:text-zinc-200"
                      }`}
                    >
                      {note.title || "Untitled Note"}
                    </span>
                  </div>

                  {/* Context menu trigger (visible on active note or hover) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuDocId(activeMenuDocId === note.id ? null : note.id);
                    }}
                    className={`p-0.5 rounded text-slate-400 hover:text-slate-700 transition-opacity ${
                      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <MoreHorizontal size={13} />
                  </button>
                </div>

                {/* Date stamp */}
                <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium mb-0.5">
                  {formatNoteDate(note)}
                </div>

                {/* Snippet preview */}
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate leading-tight">
                  {getNoteSnippet(note)}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer: note count + sort icon */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-zinc-800/80 text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
        <span>{notes.length} notes</span>
        <button
          type="button"
          onClick={onToggleSort}
          className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-300 transition-colors cursor-pointer"
          title="Toggle sort order"
        >
          <ArrowUpDown size={13} strokeWidth={1.8} />
        </button>
      </div>
    </aside>
  );
}

// ─── Ruled Notebook Canvas (Dominant Hero Area) ──────────────────────────────────

function RuledNotebookCanvas({
  title,
  onUpdateTitle,
  bodyHtml,
  onUpdateBodyHtml,
  sidebarCollapsed,
  onOpenSidebar,
}) {
  const editorRef = useRef(null);
  const titleRef = useRef(null);

  // Sync bodyHtml to DOM without dropping cursor
  const lastHtmlRef = useRef(bodyHtml);
  useEffect(() => {
    if (!editorRef.current) return;
    if (bodyHtml !== lastHtmlRef.current && editorRef.current.innerHTML !== bodyHtml) {
      editorRef.current.innerHTML = bodyHtml || "";
      lastHtmlRef.current = bodyHtml;
    }
  }, [bodyHtml]);

  const handleEditorInput = useCallback(() => {
    const html = editorRef.current?.innerHTML || "";
    lastHtmlRef.current = html;
    onUpdateBodyHtml?.(html);
  }, [onUpdateBodyHtml]);

  const handleTitleKeyDown = useCallback((e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      editorRef.current?.focus();
    }
  }, []);

  // Today formatted e.g. "Sep 17, 2025"
  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  return (
    <div className="flex-1 h-full overflow-y-auto relative bg-[#FCFAF7] dark:bg-[#18181A] transition-colors select-text">
      {/* If sidebar is collapsed, provide quiet expand button */}
      {sidebarCollapsed && (
        <button
          type="button"
          onClick={onOpenSidebar}
          className="absolute left-3 top-3 z-20 p-1.5 rounded-lg bg-white/80 dark:bg-zinc-800/80 border border-slate-200/70 shadow-xs text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
          title="Open Notes Sidebar"
        >
          <NotesIcon size={16} className="text-violet-600" />
        </button>
      )}

      {/* Top right notebook header: Date + Page indicator */}
      <div className="absolute right-12 top-6 z-10 flex items-center gap-6 text-[12px] font-medium text-slate-400 dark:text-zinc-500 select-none pointer-events-none">
        <span>{formattedDate}</span>
        <span>1 / 1</span>
      </div>

      {/* Ruled lines pattern spanning full width */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(147, 197, 253, 0.35) 1px, transparent 1px)",
          backgroundSize: `100% ${BASELINE_PX}px`,
          backgroundPosition: `0 96px`,
        }}
      />

      {/* Vertical red margin guide line */}
      <div
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{
          left: 100,
          width: 1.5,
          backgroundColor: "rgba(248, 113, 113, 0.4)",
        }}
      />

      {/* Notebook writing content container */}
      <div
        className="relative min-h-full"
        style={{
          paddingLeft: 120,
          paddingRight: 64,
          paddingTop: 80,
          paddingBottom: 120,
        }}
      >
        {/* Large Note Title: Italicized serif resting right on the baseline */}
        <div style={{ height: BASELINE_PX * 1.5, marginBottom: BASELINE_PX * 0.5 }}>
          <input
            ref={titleRef}
            type="text"
            value={title || ""}
            onChange={(e) => onUpdateTitle?.(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            placeholder="Untitled Note"
            className="w-full bg-transparent border-none outline-none font-medium italic text-slate-800 dark:text-zinc-100 placeholder-slate-400 leading-none"
            style={{
              fontSize: "28px",
              fontFamily: "'Newsreader', 'Georgia', 'Times New Roman', serif",
              lineHeight: `${BASELINE_PX}px`,
            }}
          />
        </div>

        {/* Note Body Editor: Text line-height matches ruled lines perfectly */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleEditorInput}
          className="outline-none w-full min-h-[500px] text-slate-800 dark:text-zinc-200"
          style={{
            fontSize: "15px",
            lineHeight: `${BASELINE_PX}px`,
            fontFamily: "'Newsreader', 'Georgia', -apple-system, serif",
            wordBreak: "break-word",
          }}
          data-placeholder="Start typing your thoughts..."
        />
      </div>
    </div>
  );
}

// ─── Default Export: RegaarderNotebookViewer ────────────────────────────────────

/**
 * RegaarderNotebookViewer
 * Edge-to-edge ruled notebook viewer with dedicated collapsible Notes sidebar.
 */
export default function RegaarderNotebookViewer({
  activeDoc,
  onUpdateBodyHtml,
  onUpdateTitle,
  documents,
  onSelectDoc,
  onNewNote,
  isDarkMode,
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sortAscending, setSortAscending] = useState(false);

  return (
    <div className="flex h-full w-full overflow-hidden bg-white dark:bg-[#18181B]">
      {/* Collapsible Sidebar */}
      {!sidebarCollapsed && (
        <NotesSidebar
          documents={documents}
          activeDoc={activeDoc}
          onSelectDoc={onSelectDoc}
          onNewNote={onNewNote}
          onCloseSidebar={() => setSidebarCollapsed(true)}
          sortAscending={sortAscending}
          onToggleSort={() => setSortAscending((prev) => !prev)}
        />
      )}

      {/* Dominant Ruled Notebook Canvas */}
      <RuledNotebookCanvas
        title={activeDoc?.title}
        onUpdateTitle={onUpdateTitle}
        bodyHtml={activeDoc?.bodyHtml || ""}
        onUpdateBodyHtml={onUpdateBodyHtml}
        sidebarCollapsed={sidebarCollapsed}
        onOpenSidebar={() => setSidebarCollapsed(false)}
      />
    </div>
  );
}

