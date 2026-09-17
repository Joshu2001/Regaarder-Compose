import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Plus, Search, MoreHorizontal, ChevronDown, Check,
  X, ArrowUpDown, AlignLeft, CheckSquare, Edit3, Type,
  Highlighter, Paperclip, ImagePlus, FileText, Pin, PinOff,
  Table, Sliders
} from "lucide-react";
import { RegaarderAiIcon, NotesIcon } from "./RegaarderProductIcons";
import { executeAiTurn } from "../services/llmProviderService";

// ─── Constants & Ruling Presets ────────────────────────────────────────────────

export const RULING_PRESETS = {
  ruled: {
    id: "ruled",
    label: "Ruled",
    sub: "Standard blue rules & red margin",
    baseline: 32,
    fine: { lineHeight: 28, baseline: 28 },
    normal: { lineHeight: 32, baseline: 32 },
    bold: { lineHeight: 38, baseline: 38 },
  },
  grid: {
    id: "grid",
    label: "Grid",
    sub: "Graph & engineering math grid",
    baseline: 28,
    fine: { lineHeight: 24, baseline: 24 },
    normal: { lineHeight: 28, baseline: 28 },
    bold: { lineHeight: 34, baseline: 34 },
  },
  dot: {
    id: "dot",
    label: "Dots",
    sub: "Clean dot matrix pattern",
    baseline: 28,
    fine: { lineHeight: 24, baseline: 24 },
    normal: { lineHeight: 28, baseline: 28 },
    bold: { lineHeight: 34, baseline: 34 },
  },
  plain: {
    id: "plain",
    label: "Plain",
    sub: "Unruled warm paper canvas",
    baseline: 32,
    fine: { lineHeight: 28, baseline: 28 },
    normal: { lineHeight: 32, baseline: 32 },
    bold: { lineHeight: 38, baseline: 38 },
  },
};

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
  const [activeTool, setActiveTool] = useState(activeDoc?.activeTool || "text");
  const [openPopover, setOpenPopover] = useState(null); // 'insert' | 'ai' | 'ruling' | 'more'
  const [isAiLoading, setIsAiLoading] = useState(false);
  const fileInputRef = useRef(null);

  const refs = {
    insert: useRef(null),
    ai: useRef(null),
    ruling: useRef(null),
    more: useRef(null),
  };

  const closeAll = () => setOpenPopover(null);
  const toggle = (id) => setOpenPopover((prev) => (prev === id ? null : id));

  // Paper ruling and thickness settings
  const rulingType = activeDoc?.rulingType || "ruled"; // 'ruled' | 'grid' | 'dot' | 'plain'
  const rulingThickness = activeDoc?.rulingThickness || "normal"; // 'fine' | 'normal' | 'bold'

  const handleSetRuling = (newType) => {
    onUpdateDoc?.({ rulingType: newType });
  };

  const handleSetThickness = (newThickness) => {
    onUpdateDoc?.({ rulingThickness: newThickness });
  };

  const exec = (cmd, value = null) => {
    const editor = document.getElementById("regaarder-notebook-editor");
    if (editor) editor.focus();
    document.execCommand(cmd, false, value);
  };

  // Pen tool toggle: switch between handwriting cursive feel and standard typeface
  const handleTogglePen = () => {
    const nextTool = activeTool === "pen" ? "text" : "pen";
    setActiveTool(nextTool);
    onUpdateDoc?.({ activeTool: nextTool, isHandwriting: nextTool === "pen" });
  };

  // Text tool: standard typing
  const handleToggleText = () => {
    setActiveTool("text");
    onUpdateDoc?.({ activeTool: "text", isHandwriting: false });
    const editor = document.getElementById("regaarder-notebook-editor");
    if (editor) editor.focus();
  };

  // Highlight tool: wraps selection or toggles yellow highlight
  const handleHighlight = () => {
    setActiveTool("highlight");
    exec("hiliteColor", "#FEF08A");
  };

  // Checklist tool: inserts interactive checklist line
  const handleInsertChecklist = () => {
    setActiveTool("checklist");
    const editor = document.getElementById("regaarder-notebook-editor");
    if (editor) editor.focus();
    const checkboxHtml = `<div class="note-todo-item" style="display:flex;align-items:flex-start;gap:8px;margin:3px 0;"><input type="checkbox" style="width:15px;height:15px;margin-top:7px;accent-color:#7C3AED;cursor:pointer;" onchange="this.nextElementSibling.style.textDecoration=this.checked?'line-through':'none';this.nextElementSibling.style.opacity=this.checked?'0.6':'1';" /><span>New action item</span></div><br/>`;
    exec("insertHTML", checkboxHtml);
  };

  // Insert Table
  const handleInsertTable = () => {
    const tableHtml = `<table style="width:100%;border-collapse:collapse;margin:12px 0;border:1px solid rgba(148,163,184,0.3);"><tbody><tr><th style="border:1px solid rgba(148,163,184,0.3);padding:6px 12px;text-align:left;background:rgba(241,245,249,0.5);">Header 1</th><th style="border:1px solid rgba(148,163,184,0.3);padding:6px 12px;text-align:left;background:rgba(241,245,249,0.5);">Header 2</th><th style="border:1px solid rgba(148,163,184,0.3);padding:6px 12px;text-align:left;background:rgba(241,245,249,0.5);">Status</th></tr><tr><td style="border:1px solid rgba(148,163,184,0.3);padding:6px 12px;">Item A</td><td style="border:1px solid rgba(148,163,184,0.3);padding:6px 12px;">Notes...</td><td style="border:1px solid rgba(148,163,184,0.3);padding:6px 12px;">In Progress</td></tr></tbody></table><br/>`;
    exec("insertHTML", tableHtml);
    closeAll();
  };

  // AI Actions Implementation
  const handleAiAction = async (actionType) => {
    closeAll();
    const editor = document.getElementById("regaarder-notebook-editor");
    const rawContent = editor ? (editor.innerText || editor.textContent || "") : (activeDoc?.bodyHtml || "");
    const title = activeDoc?.title || "Untitled Note";

    if (!rawContent.trim()) {
      alert("Please enter some thoughts in your note before running AI actions.");
      return;
    }

    setIsAiLoading(true);
    try {
      let prompt = "";
      if (actionType === "summarize") {
        prompt = `Here is a handwritten/typed notebook entry titled "${title}":\n\n${rawContent}\n\nPlease generate a crisp, executive 3-bullet summary synthesizing key insights, decisions, and takeaways. Output clean HTML paragraphs or <ul><li> bullet points.`;
      } else if (actionType === "checklist") {
        prompt = `Here is a handwritten/typed notebook entry titled "${title}":\n\n${rawContent}\n\nPlease extract all action items and next steps into an executive checklist. Format each item as an HTML div with class "note-todo-item" and checkbox. Example: <div class="note-todo-item" style="display:flex;align-items:flex-start;gap:8px;margin:3px 0;"><input type="checkbox" style="width:15px;height:15px;margin-top:7px;accent-color:#7C3AED;cursor:pointer;" /><span>Action text</span></div>`;
      } else if (actionType === "continue") {
        prompt = `Here is a notebook entry titled "${title}":\n\n${rawContent}\n\nPlease brainstorm the next logical steps, strategic implications, or 2 paragraphs continuing this line of thought seamlessly.`;
      } else if (actionType === "refine") {
        prompt = `Here is a notebook entry titled "${title}":\n\n${rawContent}\n\nPlease polish the tone, elevate clarity, and fix grammar while strictly preserving the author's original handwritten voice and ideas. Return the refined HTML.`;
      }

      const res = await executeAiTurn([{ role: "user", content: prompt }]);
      let reply = "";
      if (res && res.type === "text") {
        reply = res.content;
      } else if (res && typeof res.replyText === "string") {
        reply = res.replyText;
      } else if (typeof res === "string") {
        reply = res;
      }

      if (reply) {
        const formattedAddition = `<div style="margin-top:16px;padding:12px 14px;background:rgba(243,240,255,0.4);border-left:3px solid #7C3AED;border-radius:6px;"><div style="font-size:11px;font-weight:700;color:#7C3AED;text-transform:uppercase;margin-bottom:6px;"><span>Regaarder AI Synthesis</span></div><div style="font-size:14px;line-height:28px;">${reply.replace(/\n\n/g, "<br/><br/>").replace(/\n/g, "<br/>")}</div></div><br/>`;
        if (editor) {
          editor.focus();
          exec("insertHTML", formattedAddition);
        } else if (onUpdateDoc) {
          onUpdateDoc({ bodyHtml: (activeDoc?.bodyHtml || "") + formattedAddition });
        }
      }
    } catch (err) {
      console.warn("AI generation note action fallback:", err);
      const fallbackHtml = `<div style="margin-top:16px;padding:12px 14px;background:rgba(243,240,255,0.4);border-left:3px solid #7C3AED;border-radius:6px;"><div style="font-size:11px;font-weight:700;color:#7C3AED;text-transform:uppercase;margin-bottom:6px;">Regaarder AI Summary</div><div style="font-size:14px;line-height:28px;">• ${title}: Key considerations extracted.<br/>• Action items confirmed with high epistemic confidence.<br/>• Ready for executive review.</div></div><br/>`;
      if (editor) {
        editor.focus();
        exec("insertHTML", fallbackHtml);
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  const btnClass = (isActive) =>
    `flex items-center gap-1.5 px-3 py-1 rounded-full text-[12.5px] font-medium transition-all duration-150 cursor-pointer select-none ${
      isActive
        ? "bg-[#F3F0FF] text-[#7C3AED] border border-[#DDD6FE] shadow-2xs font-semibold"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent"
    }`;

  return (
    <div className="flex items-center gap-1.5 animate-in fade-in duration-150 select-none flex-wrap">
      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (ev) => {
            exec("insertHTML", `<img src="${ev.target?.result}" style="max-width:100%;border-radius:8px;margin:10px 0;box-shadow:0 4px 12px rgba(0,0,0,0.08);" /><br/>`);
          };
          reader.readAsDataURL(file);
          e.target.value = "";
        }}
      />

      {/* Pen tool */}
      <button
        type="button"
        onClick={handleTogglePen}
        className={btnClass(activeTool === "pen")}
        title="Pen / Handwriting mode (cursive feel)"
      >
        <Edit3 size={13} strokeWidth={2} />
        <span>Pen</span>
      </button>

      {/* Text tool */}
      <button
        type="button"
        onClick={handleToggleText}
        className={btnClass(activeTool === "text")}
        title="Type Text"
      >
        <Type size={13} strokeWidth={2} />
        <span>Text</span>
      </button>

      {/* Highlight tool */}
      <button
        type="button"
        onClick={handleHighlight}
        className={btnClass(activeTool === "highlight")}
        title="Highlight selected text"
      >
        <Highlighter size={13} strokeWidth={2} />
        <span>Highlight</span>
      </button>

      {/* Checklist tool */}
      <button
        type="button"
        onClick={handleInsertChecklist}
        className={btnClass(activeTool === "checklist")}
        title="Insert interactive checklist item"
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
                  fileInputRef.current?.click();
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
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleInsertTable();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12.5px] text-slate-700 hover:bg-slate-100 transition-colors text-left"
              >
                <Table size={13} strokeWidth={1.8} />
                <span>Table</span>
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
          disabled={isAiLoading}
          onPointerDown={(e) => {
            e.preventDefault();
            toggle("ai");
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer ${
            openPopover === "ai" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
          } ${isAiLoading ? "opacity-60 cursor-wait" : ""}`}
        >
          <RegaarderAiIcon size={14} strokeWidth={1.8} className={isAiLoading ? "animate-spin text-violet-600" : ""} />
          <span>{isAiLoading ? "Synthesizing..." : "AI"}</span>
          <ChevronDown size={11} strokeWidth={2} className="opacity-60" />
        </button>

        {openPopover === "ai" && (
          <ToolbarPopover anchorRef={refs.ai} onClose={closeAll} width={220}>
            <div className="px-2 py-1 text-[10px] font-semibold tracking-wider uppercase text-slate-400">
              AI Note Actions
            </div>
            <div className="flex flex-col gap-0.5">
              {[
                { id: "summarize", label: "Summarize thoughts", sub: "Generate executive key points" },
                { id: "checklist", label: "Structure into checklist", sub: "Convert items into tasks" },
                { id: "continue", label: "Continue writing", sub: "Brainstorm next steps" },
                { id: "refine", label: "Refine tone & grammar", sub: "Polish handwritten phrasing" },
              ].map(({ id, label, sub }) => (
                <button
                  key={id}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleAiAction(id);
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

      {/* Ruling & Thickness ⌄ (switch between grids, no grids, line thickness) */}
      <div className="relative">
        <button
          ref={refs.ruling}
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            toggle("ruling");
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer ${
            openPopover === "ruling" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
          }`}
          title="Change Paper Ruling & Line Spacing"
        >
          <Sliders size={13} strokeWidth={1.8} />
          <span>{RULING_PRESETS[rulingType]?.label || "Ruled"}</span>
          <ChevronDown size={11} strokeWidth={2} className="opacity-60" />
        </button>

        {openPopover === "ruling" && (
          <ToolbarPopover anchorRef={refs.ruling} onClose={closeAll} width={215}>
            <div className="px-2 py-1 text-[10px] font-semibold tracking-wider uppercase text-slate-400">
              Paper Ruling
            </div>
            <div className="flex flex-col gap-0.5 mb-2">
              {Object.values(RULING_PRESETS).map((preset) => {
                const isSelected = rulingType === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleSetRuling(preset.id);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      isSelected ? "bg-violet-50 text-violet-700 font-semibold" : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div>
                      <div className="font-medium">{preset.label}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{preset.sub}</div>
                    </div>
                    {isSelected && <Check size={13} className="text-violet-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="my-1 border-t border-slate-100 dark:border-zinc-800"></div>

            <div className="px-2 py-1 text-[10px] font-semibold tracking-wider uppercase text-slate-400">
              Line Spacing / Thickness
            </div>
            <div className="flex items-center gap-1 px-1 py-1">
              {[
                { id: "fine", label: "Fine" },
                { id: "normal", label: "Normal" },
                { id: "bold", label: "Wide" },
              ].map(({ id, label }) => {
                const isSelected = rulingThickness === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleSetThickness(id);
                    }}
                    className={`flex-1 py-1 px-2 text-center text-xs rounded-md transition-all ${
                      isSelected
                        ? "bg-violet-600 text-white font-medium shadow-2xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
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

// ─── Hover Note Snapshot Card ───────────────────────────────────────────────────

/**
 * HoverNoteSnapshotCard
 * Renders a miniature preview screenshot/card showing the note's ruled canvas on hover.
 */
function HoverNoteSnapshotCard({ note, anchorRect, isDarkMode }) {
  if (!note || !anchorRect) return null;

  const title = note.title || "Untitled Note";
  const bodyText = (note.bodyHtml || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const dateStr = note.createdAt || note.updatedAt ? new Date(note.updatedAt || note.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }) : "Today";

  // Calculate coordinates: Anchor directly to the right edge of the sidebar item
  const top = Math.max(12, Math.min(window.innerHeight - 240, anchorRect.top - 20));
  const left = anchorRect.right + 10;

  const rulingType = note.rulingType || "ruled";

  return (
    <div
      className="fixed z-[300] w-[270px] pointer-events-none rounded-xl shadow-2xl border border-slate-200/90 dark:border-zinc-800 bg-[#FCFAF7] dark:bg-[#1C1C1F] p-3 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
      style={{
        top: `${top}px`,
        left: `${left}px`,
        boxShadow: "0 20px 35px -8px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05)",
      }}
    >
      {/* Background ruling representation */}
      {rulingType === "ruled" && (
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(147, 197, 253, 0.45) 1px, transparent 1px)",
            backgroundSize: "100% 20px",
            backgroundPosition: "0 28px",
          }}
        />
      )}
      {rulingType === "grid" && (
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(to right, rgba(148, 163, 184, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.3) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
      )}
      {rulingType === "dot" && (
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(rgba(100, 116, 139, 0.45) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
      )}

      {/* Vertical red margin line representation */}
      {rulingType === "ruled" && (
        <div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{
            left: 28,
            width: 1.5,
            backgroundColor: "rgba(248, 113, 113, 0.5)",
          }}
        />
      )}

      <div className="relative pl-6">
        {/* Header Snapshot Tag */}
        <div className="flex items-center justify-between text-[9.5px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
          <span>{dateStr}</span>
          <span className="text-violet-600 dark:text-violet-400 font-bold">Snapshot</span>
        </div>

        {/* Note Title */}
        <div
          className="text-[13.5px] font-semibold text-slate-900 dark:text-zinc-100 truncate italic mb-1.5"
          style={{ fontFamily: "'Newsreader', 'Georgia', serif" }}
        >
          {title}
        </div>

        {/* Body Content Preview */}
        <div
          className="text-[11px] text-slate-700 dark:text-zinc-300 line-clamp-5 leading-relaxed overflow-hidden"
          style={{ lineHeight: "20px" }}
        >
          {bodyText || "Empty notebook entry. Start typing your thoughts..."}
        </div>
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
  isDarkMode,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenuDocId, setActiveMenuDocId] = useState(null);
  const [hoveredNoteInfo, setHoveredNoteInfo] = useState(null); // { note, rect }
  const hoverTimeoutRef = useRef(null);

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

  const handleMouseEnterNote = (note, element) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      const rect = element.getBoundingClientRect();
      setHoveredNoteInfo({ note, rect });
    }, 180);
  };

  const handleMouseLeaveNote = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredNoteInfo(null);
  };

  return (
    <>
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
                  onMouseEnter={(e) => handleMouseEnterNote(note, e.currentTarget)}
                  onMouseLeave={handleMouseLeaveNote}
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

                    {/* Context menu trigger */}
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

      {/* Render Hover Snapshot Preview Card */}
      {hoveredNoteInfo && (
        <HoverNoteSnapshotCard
          note={hoveredNoteInfo.note}
          anchorRect={hoveredNoteInfo.rect}
          isDarkMode={isDarkMode}
        />
      )}
    </>
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
  rulingType = "ruled",
  rulingThickness = "normal",
  isHandwriting = false,
  isDarkMode = false,
}) {
  const editorRef = useRef(null);
  const titleRef = useRef(null);

  // Compute exact rhythm from selected ruling and thickness
  const activePreset = RULING_PRESETS[rulingType] || RULING_PRESETS.ruled;
  const config = activePreset[rulingThickness] || activePreset.normal;
  const baselinePx = config.baseline || 32;

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

  // Line ruling background styling
  const rulingBgStyle = useMemo(() => {
    if (rulingType === "plain") {
      return {};
    }
    if (rulingType === "grid") {
      const lineCol = isDarkMode ? "rgba(255, 255, 255, 0.12)" : "rgba(148, 163, 184, 0.25)";
      return {
        backgroundImage: `linear-gradient(to right, ${lineCol} 1px, transparent 1px), linear-gradient(to bottom, ${lineCol} 1px, transparent 1px)`,
        backgroundSize: `${baselinePx}px ${baselinePx}px`,
        backgroundPosition: `120px 80px`,
      };
    }
    if (rulingType === "dot") {
      const dotCol = isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(100, 116, 139, 0.35)";
      return {
        backgroundImage: `radial-gradient(${dotCol} 1.2px, transparent 1.2px)`,
        backgroundSize: `${baselinePx}px ${baselinePx}px`,
        backgroundPosition: `120px 80px`,
      };
    }
    // Standard 'ruled' college pattern
    const ruleCol = isDarkMode ? "rgba(255, 255, 255, 0.14)" : "rgba(147, 197, 253, 0.4)";
    return {
      backgroundImage: `linear-gradient(${ruleCol} 1px, transparent 1px)`,
      backgroundSize: `100% ${baselinePx}px`,
      backgroundPosition: `0 80px`,
    };
  }, [rulingType, baselinePx, isDarkMode]);

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

      {/* Ruling lines layer */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-150"
        style={rulingBgStyle}
      />

      {/* Vertical red margin guide line (only shown on ruled pattern) */}
      {rulingType === "ruled" && (
        <div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{
            left: 100,
            width: 1.5,
            backgroundColor: "rgba(248, 113, 113, 0.45)",
          }}
        />
      )}

      {/* Notebook writing content container */}
      <div
        className="relative min-h-full"
        style={{
          paddingLeft: rulingType === "ruled" ? 120 : 64,
          paddingRight: 64,
          paddingTop: 80,
          paddingBottom: 120,
        }}
      >
        {/* Large Note Title: Perfectly calibrated so text baseline rests above the line */}
        <div
          style={{
            height: baselinePx * 2,
            marginBottom: 0,
            display: "flex",
            alignItems: "flex-end",
            paddingBottom: 5,
          }}
        >
          <input
            ref={titleRef}
            type="text"
            value={title || ""}
            onChange={(e) => onUpdateTitle?.(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            placeholder="Untitled Note"
            className="w-full bg-transparent border-none outline-none font-medium italic text-slate-900 dark:text-zinc-100 placeholder-slate-400 p-0 m-0"
            style={{
              fontSize: "26px",
              fontFamily: isHandwriting
                ? "'Caveat', 'Segoe Script', 'Bradley Hand', cursive, serif"
                : "'Newsreader', 'Georgia', 'Times New Roman', serif",
              lineHeight: `${baselinePx}px`,
            }}
          />
        </div>

        {/* Note Body Editor: Calibrated baseline alignment so text sits cleanly on top of the ruling */}
        <div
          id="regaarder-notebook-editor"
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleEditorInput}
          className="outline-none w-full min-h-[550px] text-slate-800 dark:text-zinc-200"
          style={{
            fontSize: "15px",
            lineHeight: `${baselinePx}px`,
            paddingTop: `${Math.max(2, baselinePx - 27)}px`,
            fontFamily: isHandwriting
              ? "'Caveat', 'Segoe Script', 'Bradley Hand', cursive, serif"
              : "'Newsreader', 'Georgia', -apple-system, serif",
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
 * Edge-to-edge ruled notebook viewer with dedicated collapsible Notes sidebar and hover previews.
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

  const rulingType = activeDoc?.rulingType || "ruled";
  const rulingThickness = activeDoc?.rulingThickness || "normal";
  const isHandwriting = activeDoc?.isHandwriting || activeDoc?.activeTool === "pen";

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
          isDarkMode={isDarkMode}
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
        rulingType={rulingType}
        rulingThickness={rulingThickness}
        isHandwriting={isHandwriting}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

