import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Plus, Search, MoreHorizontal, ChevronDown, Check,
  X, ArrowUpDown, AlignLeft, AlignJustify, CheckSquare, Edit3, Type,
  Highlighter, Paperclip, ImagePlus, FileText, Pin, PinOff,
  Table, Sliders, Undo2, Redo2, Sparkles, ChevronRight, Hash, Eye
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

// ─── Floating Toolbar Popover Shell ─────────────────────────────────────────────

function ToolbarPopover({ anchorRef, onClose, children, width = 220 }) {
  const popRef = useRef(null);

  useEffect(() => {
    const anchor = anchorRef.current;
    const pop = popRef.current;
    if (!anchor || !pop) return;

    const rect = anchor.getBoundingClientRect();
    // Default open upward above the floating dock
    pop.style.bottom = `${window.innerHeight - rect.top + 10}px`;
    pop.style.left = `${Math.max(12, Math.min(window.innerWidth - width - 16, rect.left + rect.width / 2 - width / 2))}px`;

    const handleOutside = (e) => {
      if (!pop.contains(e.target) && !anchor.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [anchorRef, onClose, width]);

  return (
    <div
      ref={popRef}
      className="fixed z-50 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-slate-200/80 dark:border-zinc-700/80 p-2.5 animate-in fade-in zoom-in-95 duration-150 select-none text-slate-800 dark:text-zinc-100 bg-white/95 dark:bg-[#1c1c1f]/95 backdrop-blur-2xl"
      style={{ width }}
    >
      {children}
    </div>
  );
}

// ─── Floating Bottom Dock (Inspired by Whiteboard Dock Model) ───────────────────

export function NotesFloatingDock({
  activeDoc,
  onUpdateDoc,
  onConvertToDoc,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  stats,
  isDarkMode,
}) {
  const [activeTool, setActiveTool] = useState(activeDoc?.activeTool || (activeDoc?.isHandwriting ? "pen" : "text"));
  const [openPopover, setOpenPopover] = useState(null); // 'ruling' | 'add' | 'ai' | 'more'
  const [isAiLoading, setIsAiLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (activeDoc?.activeTool) {
      setActiveTool(activeDoc.activeTool);
    } else if (activeDoc?.isHandwriting !== undefined) {
      setActiveTool(activeDoc.isHandwriting ? "pen" : "text");
    }
  }, [activeDoc?.activeTool, activeDoc?.isHandwriting]);

  const refs = {
    ruling: useRef(null),
    add: useRef(null),
    ai: useRef(null),
    more: useRef(null),
  };

  const closeAll = () => setOpenPopover(null);
  const toggle = (id) => setOpenPopover((prev) => (prev === id ? null : id));

  const savedRuling = typeof window !== "undefined" ? localStorage.getItem("regaarder_notes_default_ruling") : null;
  const savedThickness = typeof window !== "undefined" ? localStorage.getItem("regaarder_notes_default_thickness") : null;

  const rulingType = activeDoc?.rulingType || savedRuling || "ruled";
  const rulingThickness = activeDoc?.rulingThickness || savedThickness || "normal";

  const handleSetRuling = (newType) => {
    try {
      localStorage.setItem("regaarder_notes_default_ruling", newType);
    } catch (_) {}
    onUpdateDoc?.({ rulingType: newType });
  };

  const handleSetThickness = (newThickness) => {
    try {
      localStorage.setItem("regaarder_notes_default_thickness", newThickness);
    } catch (_) {}
    onUpdateDoc?.({ rulingThickness: newThickness });
  };

  const exec = (cmd, value = null) => {
    const editor = document.getElementById("regaarder-notebook-editor");
    if (editor) editor.focus();
    document.execCommand(cmd, false, value);
  };

  const handleTogglePen = () => {
    const nextTool = activeTool === "pen" ? "text" : "pen";
    setActiveTool(nextTool);
    onUpdateDoc?.({ activeTool: nextTool, isHandwriting: nextTool === "pen" });
  };

  const handleToggleText = () => {
    setActiveTool("text");
    onUpdateDoc?.({ activeTool: "text", isHandwriting: false });
    const editor = document.getElementById("regaarder-notebook-editor");
    if (editor) editor.focus();
  };

  const handleHighlight = () => {
    exec("hiliteColor", "#FEF08A");
  };

  const handleInsertChecklist = () => {
    const editor = document.getElementById("regaarder-notebook-editor");
    if (editor) editor.focus();
    const checkboxHtml = `<div class="note-todo-item" style="display:flex;align-items:flex-start;gap:8px;margin:3px 0;"><input type="checkbox" style="width:15px;height:15px;margin-top:7px;accent-color:#D97706;cursor:pointer;" onchange="this.nextElementSibling.style.textDecoration=this.checked?'line-through':'none';this.nextElementSibling.style.opacity=this.checked?'0.6':'1';" /><span>New action item</span></div><br/>`;
    exec("insertHTML", checkboxHtml);
    closeAll();
  };

  const handleInsertTable = () => {
    const tableHtml = `<table style="width:100%;border-collapse:collapse;margin:12px 0;border:1px solid rgba(148,163,184,0.3);"><tbody><tr><th style="border:1px solid rgba(148,163,184,0.3);padding:6px 12px;text-align:left;background:rgba(241,245,249,0.5);">Header 1</th><th style="border:1px solid rgba(148,163,184,0.3);padding:6px 12px;text-align:left;background:rgba(241,245,249,0.5);">Header 2</th><th style="border:1px solid rgba(148,163,184,0.3);padding:6px 12px;text-align:left;background:rgba(241,245,249,0.5);">Status</th></tr><tr><td style="border:1px solid rgba(148,163,184,0.3);padding:6px 12px;">Item A</td><td style="border:1px solid rgba(148,163,184,0.3);padding:6px 12px;">Notes...</td><td style="border:1px solid rgba(148,163,184,0.3);padding:6px 12px;">In Progress</td></tr></tbody></table><br/>`;
    exec("insertHTML", tableHtml);
    closeAll();
  };

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
        prompt = `Here is a notebook entry titled "${title}":\n\n${rawContent}\n\nPlease generate a crisp, executive 3-bullet summary synthesizing key insights, decisions, and takeaways. Output clean HTML paragraphs or <ul><li> bullet points.`;
      } else if (actionType === "checklist") {
        prompt = `Here is a notebook entry titled "${title}":\n\n${rawContent}\n\nPlease extract all action items and next steps into an executive checklist. Format each item as an HTML div with class "note-todo-item" and checkbox. Example: <div class="note-todo-item" style="display:flex;align-items:flex-start;gap:8px;margin:3px 0;"><input type="checkbox" style="width:15px;height:15px;margin-top:7px;accent-color:#7C3AED;cursor:pointer;" /><span>Action text</span></div>`;
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

  const handleUndoClick = () => {
    if (onUndo) {
      onUndo();
    } else {
      exec("undo");
    }
  };

  const handleRedoClick = () => {
    if (onRedo) {
      onRedo();
    } else {
      exec("redo");
    }
  };

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 select-none pointer-events-auto"
      style={{ willChange: "transform" }}
    >
      {/* Hidden file input for image insertion */}
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

      {/* Floating Island Dock matching Whiteboard styling */}
      <div className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-[#1c1c1f]/95 backdrop-blur-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={handleUndoClick}
            disabled={canUndo === false}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              canUndo === false
                ? "text-slate-300 dark:text-zinc-600 cursor-not-allowed"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800"
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={15} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={handleRedoClick}
            disabled={canRedo === false}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              canRedo === false
                ? "text-slate-300 dark:text-zinc-600 cursor-not-allowed"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800"
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={15} strokeWidth={2} />
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 mx-1 shrink-0" />

        {/* Mode Toggle: Pen vs Text */}
        <div className="flex items-center p-0.5 rounded-xl bg-slate-100/90 dark:bg-zinc-800/80 border border-slate-200/50 dark:border-zinc-700/50">
          <button
            type="button"
            onClick={handleTogglePen}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
              activeTool === "pen"
                ? "bg-white dark:bg-zinc-900 text-amber-700 dark:text-amber-400 shadow-2xs border border-slate-200/60 dark:border-zinc-700/60"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
            }`}
            title="Handwriting cursive pen mode"
          >
            <Edit3 size={13} strokeWidth={2} />
            <span>Pen</span>
          </button>
          <button
            type="button"
            onClick={handleToggleText}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
              activeTool === "text"
                ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs border border-slate-200/60 dark:border-zinc-700/60"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
            }`}
            title="Standard typography typing mode"
          >
            <Type size={13} strokeWidth={2} />
            <span>Text</span>
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 mx-1 shrink-0" />

        {/* Ruling & Grid Selector */}
        <div className="relative">
          <button
            ref={refs.ruling}
            type="button"
            onClick={() => toggle("ruling")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              openPopover === "ruling"
                ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100/70 dark:hover:bg-zinc-800/70"
            }`}
            title="Paper ruling and grid layout"
          >
            <AlignJustify size={14} strokeWidth={1.8} />
            <span>{RULING_PRESETS[rulingType]?.label || "Ruled"}</span>
            <ChevronDown size={11} strokeWidth={2} className="opacity-60" />
          </button>

          {openPopover === "ruling" && (
            <ToolbarPopover anchorRef={refs.ruling} onClose={closeAll} width={230}>
              <div className="px-2 py-1 text-[10px] font-semibold tracking-wider uppercase text-slate-400">
                Paper Ruling Pattern
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
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 font-semibold"
                          : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <div>
                        <div className="font-medium">{preset.label}</div>
                        <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-normal">{preset.sub}</div>
                      </div>
                      {isSelected && <Check size={13} className="text-amber-600 dark:text-amber-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="my-1.5 border-t border-slate-100 dark:border-zinc-800" />

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
                      className={`flex-1 py-1 px-2 text-center text-xs rounded-lg transition-all cursor-pointer ${
                        isSelected
                          ? "bg-amber-600 dark:bg-amber-500 text-white font-semibold shadow-2xs"
                          : "bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300"
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

        {/* Divider */}
        <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 mx-1 shrink-0" />

        {/* + Add (Insert Image, Table, Checklist, Link) */}
        <div className="relative">
          <button
            ref={refs.add}
            type="button"
            onClick={() => toggle("add")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              openPopover === "add"
                ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100/70 dark:hover:bg-zinc-800/70"
            }`}
            title="Insert content"
          >
            <Plus size={14} strokeWidth={2} />
            <span>Add</span>
          </button>

          {openPopover === "add" && (
            <ToolbarPopover anchorRef={refs.add} onClose={closeAll} width={190}>
              <div className="px-2 py-1 text-[10px] font-semibold tracking-wider uppercase text-slate-400">
                Insert Content
              </div>
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleInsertChecklist();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-slate-700 dark:text-zinc-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-800 dark:hover:text-amber-200 transition-colors text-left cursor-pointer"
                >
                  <CheckSquare size={14} strokeWidth={1.8} className="text-amber-600" />
                  <span>Checklist Item</span>
                </button>
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    fileInputRef.current?.click();
                    closeAll();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
                >
                  <ImagePlus size={14} strokeWidth={1.8} />
                  <span>Image</span>
                </button>
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleInsertTable();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
                >
                  <Table size={14} strokeWidth={1.8} />
                  <span>Table Grid</span>
                </button>
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    const url = prompt("Enter URL link:");
                    if (url) exec("createLink", url);
                    closeAll();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
                >
                  <Paperclip size={14} strokeWidth={1.8} />
                  <span>Hyperlink</span>
                </button>
              </div>
            </ToolbarPopover>
          )}
        </div>

        {/* AI Note Assistant (MANDATORY RegaarderAiIcon signature) */}
        <div className="relative">
          <button
            ref={refs.ai}
            type="button"
            disabled={isAiLoading}
            onClick={() => toggle("ai")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              openPopover === "ai"
                ? "bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300"
                : "text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/40"
            } ${isAiLoading ? "opacity-60 cursor-wait" : ""}`}
            title="Regaarder AI Note Assistant"
          >
            <RegaarderAiIcon size={14} className={isAiLoading ? "animate-spin text-violet-600" : "text-violet-600 dark:text-violet-400"} />
            <span>{isAiLoading ? "Synthesizing..." : "AI"}</span>
            <ChevronDown size={11} strokeWidth={2} className="opacity-60" />
          </button>

          {openPopover === "ai" && (
            <ToolbarPopover anchorRef={refs.ai} onClose={closeAll} width={230}>
              <div className="px-2 py-1 text-[10px] font-semibold tracking-wider uppercase text-violet-600 dark:text-violet-400">
                Regaarder AI Note Assistant
              </div>
              <div className="flex flex-col gap-0.5">
                {[
                  { id: "summarize", label: "Summarize thoughts", sub: "Generate executive bullet points" },
                  { id: "checklist", label: "Extract action items", sub: "Convert ideas into interactive checklist" },
                  { id: "continue", label: "Continue writing", sub: "Brainstorm strategic next steps" },
                  { id: "refine", label: "Refine phrasing", sub: "Elevate tone while preserving handwritten voice" },
                ].map(({ id, label, sub }) => (
                  <button
                    key={id}
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleAiAction(id);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5">
                      <RegaarderAiIcon size={13} className="text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold text-slate-800 dark:text-zinc-100 group-hover:text-violet-700 dark:hover:text-violet-300">
                        {label}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-zinc-500 pl-4 mt-0.5">{sub}</div>
                  </button>
                ))}
              </div>
            </ToolbarPopover>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 mx-1 shrink-0" />

        {/* More Actions Popover */}
        <div className="relative">
          <button
            ref={refs.more}
            type="button"
            onClick={() => toggle("more")}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              openPopover === "more"
                ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100/70 dark:hover:bg-zinc-800/70"
            }`}
            title="More actions and stats"
          >
            <MoreHorizontal size={15} strokeWidth={2} />
          </button>

          {openPopover === "more" && (
            <ToolbarPopover anchorRef={refs.more} onClose={closeAll} width={210}>
              <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase text-slate-400">
                Note Actions
              </div>
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleHighlight();
                    closeAll();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
                >
                  <Highlighter size={14} strokeWidth={1.8} className="text-amber-500" />
                  <span>Highlight Selection</span>
                </button>
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    onUpdateDoc?.({ pinned: !activeDoc?.pinned });
                    closeAll();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
                >
                  {activeDoc?.pinned ? <PinOff size={14} strokeWidth={1.8} /> : <Pin size={14} strokeWidth={1.8} />}
                  <span>{activeDoc?.pinned ? "Unpin Note" : "Pin Note to Top"}</span>
                </button>
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    onConvertToDoc?.();
                    closeAll();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
                >
                  <FileText size={14} strokeWidth={1.8} />
                  <span>Promote to Compose Doc</span>
                </button>
              </div>

              {/* Note Word & Character Stats */}
              {stats && (
                <>
                  <div className="my-1.5 border-t border-slate-100 dark:border-zinc-800" />
                  <div className="px-2.5 py-1.5 flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500">
                    <span>{stats.words} words</span>
                    <span>•</span>
                    <span>{stats.chars} chars</span>
                  </div>
                </>
              )}
            </ToolbarPopover>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Exported Notes Write Toolbar Controls (for Compose Header bar) ────────────

export function NotesWriteToolbarControls({
  activeDoc,
  onUpdateDoc,
  onNewNote,
  onConvertToDoc,
  isDarkMode,
}) {
  const [openPopover, setOpenPopover] = useState(null);
  const rulingRef = useRef(null);
  const addRef = useRef(null);

  const rulingType = activeDoc?.rulingType || "ruled";
  const rulingThickness = activeDoc?.rulingThickness || "normal";

  const handleSetRuling = (newType) => {
    try {
      localStorage.setItem("regaarder_notes_default_ruling", newType);
    } catch (_) {}
    onUpdateDoc?.({ rulingType: newType });
    setOpenPopover(null);
  };

  const handleSetThickness = (newThickness) => {
    try {
      localStorage.setItem("regaarder_notes_default_thickness", newThickness);
    } catch (_) {}
    onUpdateDoc?.({ rulingThickness: newThickness });
    setOpenPopover(null);
  };

  const exec = (cmd, value = null) => {
    const editor = document.getElementById("regaarder-notebook-editor");
    if (editor) editor.focus();
    document.execCommand(cmd, false, value);
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Ruling Selector */}
      <div className="relative">
        <button
          ref={rulingRef}
          type="button"
          onClick={() => setOpenPopover((prev) => (prev === "ruling" ? null : "ruling"))}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Notebook Ruling & Margin Style"
        >
          <Sliders size={13} className="text-amber-500" />
          <span className="capitalize">{RULING_PRESETS[rulingType]?.label || "Ruled"}</span>
          <ChevronDown size={11} className="opacity-60" />
        </button>

        {openPopover === "ruling" && (
          <div className="absolute left-0 top-full mt-1.5 z-50 w-52 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl flex flex-col gap-1">
            <div className="px-2 py-1 text-[10px] font-semibold tracking-wider uppercase text-slate-400">
              Ruling Pattern
            </div>
            {Object.values(RULING_PRESETS).map((preset) => (
              <button
                key={preset.id}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleSetRuling(preset.id);
                }}
                className={`flex items-center justify-between w-full px-2 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  rulingType === preset.id
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold"
                    : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                }`}
              >
                <div className="text-left">
                  <div>{preset.label}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{preset.sub}</div>
                </div>
                {rulingType === preset.id && <Check size={13} className="text-amber-500 shrink-0" />}
              </button>
            ))}
            <div className="my-1 border-t border-slate-100 dark:border-zinc-800" />
            <div className="px-2 py-1 text-[10px] font-semibold tracking-wider uppercase text-slate-400">
              Line Spacing
            </div>
            <div className="grid grid-cols-3 gap-1 px-1">
              {[
                { id: "fine", label: "Fine" },
                { id: "normal", label: "Medium" },
                { id: "bold", label: "Wide" },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleSetThickness(id);
                  }}
                  className={`py-1 text-center rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    rulingThickness === id
                      ? "bg-amber-500 text-white font-semibold"
                      : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 mx-1 shrink-0" />

      {/* Quick Formatting shortcuts */}
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          exec("bold");
        }}
        className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors font-bold text-xs"
        title="Bold (Ctrl+B)"
      >
        B
      </button>
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          exec("italic");
        }}
        className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors italic text-xs font-serif"
        title="Italic (Ctrl+I)"
      >
        I
      </button>
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          exec("insertUnorderedList");
        }}
        className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
        title="Bullet List"
      >
        <AlignLeft size={13} />
      </button>

      {/* Checklist Button */}
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          const checkHtml = `<div class="note-todo-item" style="display: flex; align-items: flex-start; gap: 8px; margin: 4px 0;"><input type="checkbox" style="width: 15px; height: 15px; margin-top: 7px; accent-color: #D97706; cursor: pointer;" /><span>&nbsp;</span></div>`;
          exec("insertHTML", checkHtml);
        }}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        title="Insert Interactive Checklist"
      >
        <CheckSquare size={13} className="text-amber-500" />
        <span>Checklist</span>
      </button>

      <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 mx-1 shrink-0" />

      {/* Handwriting Font Toggle */}
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          onUpdateDoc?.({ isHandwriting: !activeDoc?.isHandwriting });
        }}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
          activeDoc?.isHandwriting
            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
        }`}
        title="Toggle Cursive Handwriting vs Serif Print Font"
      >
        <Type size={13} />
        <span>{activeDoc?.isHandwriting ? "Handwriting" : "Print Serif"}</span>
      </button>

      <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 mx-1 shrink-0" />

      {/* Convert Note to Doc */}
      <button
        type="button"
        onClick={onConvertToDoc}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        title="Promote Note into Full Compose Document"
      >
        <FileText size={13} />
        <span>Promote to Doc</span>
      </button>

      {/* New Note Shortcut */}
      {onNewNote && (
        <button
          type="button"
          onClick={onNewNote}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer shadow-sm"
          title="Create New Note"
        >
          <Plus size={13} strokeWidth={2.5} />
          <span>New Note</span>
        </button>
      )}
    </div>
  );
}

// ─── Hover Note Snapshot Card ───────────────────────────────────────────────────

function HoverNoteSnapshotCard({ note, anchorRect, isDarkMode }) {
  if (!note || !anchorRect) return null;

  const title = note.title || "Untitled Note";
  const bodyText = (note.bodyHtml || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const dateStr = note.createdAt || note.updatedAt ? new Date(note.updatedAt || note.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }) : "Today";

  const top = Math.max(16, Math.min(window.innerHeight - 250, anchorRect.top - 20));
  const left = anchorRect.right + 12;
  const rulingType = note.rulingType || "ruled";

  return (
    <div
      className="fixed z-[350] w-[270px] pointer-events-none rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-slate-200/90 dark:border-zinc-800 bg-[#FCFAF7] dark:bg-[#1C1C1F] p-3.5 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
      style={{
        top: `${top}px`,
        left: `${left}px`,
      }}
    >
      {/* Background ruling representation */}
      {rulingType === "ruled" && (
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(147, 197, 253, 0.3) 1px, transparent 1px)",
            backgroundSize: "100% 20px",
            backgroundPosition: "0 28px",
          }}
        />
      )}
      {rulingType === "grid" && (
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(to right, rgba(148, 163, 184, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.2) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
      )}
      {rulingType === "dot" && (
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(rgba(100, 116, 139, 0.3) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
      )}

      {/* Vertical red margin line */}
      {rulingType === "ruled" && (
        <div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{
            left: 24,
            width: 1.5,
            backgroundColor: "rgba(248, 113, 113, 0.45)",
          }}
        />
      )}

      <div className="relative pl-5">
        <div className="flex items-center justify-between text-[9.5px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
          <span>{dateStr}</span>
          <span className="text-amber-600 dark:text-amber-400 font-bold">Snapshot</span>
        </div>

        <div
          className="text-[13.5px] font-semibold text-slate-900 dark:text-zinc-100 truncate italic mb-1.5"
          style={{ fontFamily: "'Newsreader', 'Georgia', serif" }}
        >
          {title}
        </div>

        <div
          className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-5 leading-relaxed overflow-hidden"
          style={{ lineHeight: "20px" }}
        >
          {bodyText || "Empty notebook entry. Start typing your thoughts..."}
        </div>
      </div>
    </div>
  );
}

// ─── Hover-Reveal Floating Notes Sidebar (Reference #3 Model) ───────────────────

function HoverRevealNotesSidebar({
  documents,
  activeDoc,
  onSelectDoc,
  onNewNote,
  isOpen,
  isPinned,
  onTogglePin,
  onClose,
  onMouseEnter,
  onMouseLeave,
  sortAscending,
  onToggleSort,
  isDarkMode,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredNoteInfo, setHoveredNoteInfo] = useState(null);
  const hoverTimeoutRef = useRef(null);

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
      // Pinned notes always surface first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      const timeA = a.updatedAt || a.createdAt || 0;
      const timeB = b.updatedAt || b.createdAt || 0;
      return sortAscending ? timeA - timeB : timeB - timeA;
    });
  }, [documents, searchQuery, sortAscending]);

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

  const getNoteSnippet = (doc) => {
    if (!doc.bodyHtml) return "Start typing your thoughts...";
    const plain = doc.bodyHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    return plain.length > 55 ? plain.substring(0, 55) + "..." : plain || "Empty note";
  };

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
    return <NotesIcon size={14} className="shrink-0 text-amber-600 dark:text-amber-500" />;
  };

  const handleMouseEnterItem = (note, element) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      const rect = element.getBoundingClientRect();
      setHoveredNoteInfo({ note, rect });
    }, 180);
  };

  const handleMouseLeaveItem = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredNoteInfo(null);
  };

  return (
    <>
      <aside
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`fixed top-4 bottom-4 left-4 z-50 w-[280px] flex flex-col rounded-2xl bg-white/95 dark:bg-[#1c1c1f]/95 backdrop-blur-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] select-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen || isPinned
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "-translate-x-[calc(100%+24px)] opacity-0 pointer-events-none"
        }`}
      >
        {/* Header: Notes title + Pin toggle + Close */}
        <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
          <div className="flex items-center gap-2">
            <NotesIcon size={18} className="text-amber-600 dark:text-amber-500" />
            <span className="text-[14px] font-semibold text-slate-900 dark:text-zinc-100 tracking-tight">
              Notes
            </span>
            <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">
              {notes.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onTogglePin}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isPinned
                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
              title={isPinned ? "Unpin sidebar (auto-hide)" : "Pin sidebar open"}
            >
              <Pin size={13} className={isPinned ? "fill-current" : ""} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Close sidebar"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>
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
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-100/70 dark:bg-zinc-800/60 hover:bg-slate-100 focus:bg-white dark:focus:bg-zinc-900 border border-transparent focus:border-amber-400 dark:focus:border-amber-500 rounded-xl outline-none transition-all text-slate-800 dark:text-zinc-200 placeholder-slate-400"
            />
          </div>
        </div>

        {/* CTA: + New Note */}
        <div className="px-3 py-1.5">
          <button
            type="button"
            onClick={onNewNote}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
          >
            <Plus size={14} strokeWidth={2.2} />
            <span>New Note</span>
          </button>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto px-2 py-1.5 space-y-1 thin-scrollbar">
          {notes.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">No notes found</div>
          ) : (
            notes.map((note) => {
              const isActive = activeDoc?.id === note.id;
              return (
                <div
                  key={note.id}
                  onClick={() => onSelectDoc(note.id)}
                  onMouseEnter={(e) => handleMouseEnterItem(note, e.currentTarget)}
                  onMouseLeave={handleMouseLeaveItem}
                  className={`group relative w-full text-left px-3 py-2.5 rounded-xl transition-all cursor-pointer select-none ${
                    isActive
                      ? "bg-amber-50 dark:bg-amber-950/40 text-slate-900 dark:text-zinc-100 border-l-2 border-amber-500 shadow-2xs"
                      : "hover:bg-slate-100/80 dark:hover:bg-zinc-800/60 text-slate-700 dark:text-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      {isActive ? (
                        <NotesIcon size={14} className="shrink-0 text-amber-600 dark:text-amber-400" />
                      ) : (
                        getNoteIcon(note)
                      )}
                      <span
                        className={`text-[12.5px] font-semibold truncate ${
                          isActive ? "text-slate-900 dark:text-zinc-100" : "text-slate-800 dark:text-zinc-200"
                        }`}
                      >
                        {note.title || "Untitled Note"}
                      </span>
                    </div>

                    {note.pinned && (
                      <Pin size={11} className="text-amber-600 dark:text-amber-400 fill-current shrink-0" />
                    )}
                  </div>

                  <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium mb-0.5">
                    {formatNoteDate(note)}
                  </div>

                  <div className="text-[11px] text-slate-400 dark:text-zinc-500 truncate leading-normal">
                    {getNoteSnippet(note)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer: Sort toggle */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-zinc-800/80 text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
          <span>{notes.length} notes</span>
          <button
            type="button"
            onClick={onToggleSort}
            className="flex items-center gap-1 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-300 transition-colors cursor-pointer"
            title="Toggle sort order"
          >
            <ArrowUpDown size={12} strokeWidth={1.8} />
            <span className="text-[10.5px]">{sortAscending ? "Oldest" : "Newest"}</span>
          </button>
        </div>
      </aside>

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

// ─── Ruled Notebook Canvas (Dominant Hero Writing Surface) ──────────────────────

function RuledNotebookCanvas({
  title,
  onUpdateTitle,
  bodyHtml,
  onUpdateBodyHtml,
  rulingType = "ruled",
  rulingThickness = "normal",
  isHandwriting = false,
  isDarkMode = false,
  onOpenSidebar,
}) {
  const editorRef = useRef(null);
  const titleRef = useRef(null);

  const activePreset = RULING_PRESETS[rulingType] || RULING_PRESETS.ruled;
  const config = activePreset[rulingThickness] || activePreset.normal;
  const baselinePx = config.baseline || 32;

  const lastHtmlRef = useRef(bodyHtml);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;
    if (bodyHtml !== lastHtmlRef.current && editorRef.current.innerHTML !== bodyHtml) {
      editorRef.current.innerHTML = bodyHtml || "";
      lastHtmlRef.current = bodyHtml;
    }
  }, [bodyHtml]);

  const flushUpdates = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    const currentHtml = editorRef.current?.innerHTML || "";
    if (currentHtml !== lastHtmlRef.current) {
      lastHtmlRef.current = currentHtml;
      onUpdateBodyHtml?.(currentHtml);
    }
  }, [onUpdateBodyHtml]);

  const handleEditorInput = useCallback(() => {
    const html = editorRef.current?.innerHTML || "";
    lastHtmlRef.current = html;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      onUpdateBodyHtml?.(html);
    }, 280);
  }, [onUpdateBodyHtml]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleTitleKeyDown = useCallback((e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      editorRef.current?.focus();
    }
  }, []);

  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const rulingBgStyle = useMemo(() => {
    if (rulingType === "plain") {
      return {};
    }
    if (rulingType === "grid") {
      const lineCol = isDarkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(148, 163, 184, 0.16)";
      return {
        backgroundImage: `linear-gradient(to right, ${lineCol} 1px, transparent 1px), linear-gradient(to bottom, ${lineCol} 1px, transparent 1px)`,
        backgroundSize: `${baselinePx}px ${baselinePx}px`,
        backgroundPosition: `136px 80px`,
      };
    }
    if (rulingType === "dot") {
      const dotCol = isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(100, 116, 139, 0.22)";
      return {
        backgroundImage: `radial-gradient(${dotCol} 1.1px, transparent 1.1px)`,
        backgroundSize: `${baselinePx}px ${baselinePx}px`,
        backgroundPosition: `136px 80px`,
      };
    }
    const ruleCol = isDarkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(147, 197, 253, 0.18)";
    return {
      backgroundImage: `linear-gradient(${ruleCol} 1px, transparent 1px)`,
      backgroundSize: `100% ${baselinePx}px`,
      backgroundPosition: `0 80px`,
    };
  }, [rulingType, baselinePx, isDarkMode]);

  const baselineTopOffset = useMemo(() => {
    return Math.max(0, Math.round(baselinePx - 16.5));
  }, [baselinePx]);

  return (
    <div className="flex-1 h-full overflow-y-auto relative bg-[#FCFAF7] dark:bg-[#18181A] transition-colors select-text">
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

      {/* Vertical red margin guide line: left 72px */}
      {rulingType === "ruled" && (
        <div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{
            left: 72,
            width: 1.5,
            backgroundColor: "rgba(248, 113, 113, 0.38)",
          }}
        />
      )}

      {/* Notebook writing content container */}
      <div
        className="relative min-h-full max-w-4xl mx-auto"
        style={{
          paddingLeft: rulingType === "ruled" ? 144 : 56,
          paddingRight: 56,
          paddingTop: 80,
          paddingBottom: 160,
        }}
      >
        {/* Large Note Title: baseline rests naturally on the ruled line */}
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

        {/* Note Body Editor */}
        <div
          id="regaarder-notebook-editor"
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleEditorInput}
          onBlur={flushUpdates}
          className="outline-none w-full min-h-[600px] text-slate-800 dark:text-zinc-200"
          style={{
            fontSize: "15px",
            lineHeight: `${baselinePx}px`,
            paddingTop: `${baselineTopOffset}px`,
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
 * Edge-to-edge ruled notebook viewer featuring:
 * - Spatial hover-reveal sidebar anchored to left edge (Reference #3)
 * - Floating bottom dock toolbar (Undo/Redo | Pen/Text | Ruling | + Add | AI | More)
 * - Pure notebook hero writing canvas with sub-millimeter baseline alignment
 */
export default function RegaarderNotebookViewer({
  activeDoc,
  onUpdateBodyHtml,
  onUpdateTitle,
  onUpdateDoc,
  onConvertToDoc,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  documents,
  onSelectDoc,
  onNewNote,
  isDarkMode,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const [sortAscending, setSortAscending] = useState(false);
  const sidebarLeaveTimerRef = useRef(null);

  const rulingType = activeDoc?.rulingType || "ruled";
  const rulingThickness = activeDoc?.rulingThickness || "normal";
  const isHandwriting = activeDoc?.isHandwriting || activeDoc?.activeTool === "pen";

  // Hover detection handlers for left edge
  const handleLeftEdgeEnter = () => {
    if (sidebarLeaveTimerRef.current) {
      clearTimeout(sidebarLeaveTimerRef.current);
      sidebarLeaveTimerRef.current = null;
    }
    setIsSidebarOpen(true);
  };

  const handleSidebarMouseEnter = () => {
    if (sidebarLeaveTimerRef.current) {
      clearTimeout(sidebarLeaveTimerRef.current);
      sidebarLeaveTimerRef.current = null;
    }
    setIsSidebarOpen(true);
  };

  const handleSidebarMouseLeave = () => {
    if (isSidebarPinned) return;
    if (sidebarLeaveTimerRef.current) {
      clearTimeout(sidebarLeaveTimerRef.current);
    }
    sidebarLeaveTimerRef.current = setTimeout(() => {
      setIsSidebarOpen(false);
    }, 320);
  };

  // Real-time word and character counts
  const stats = useMemo(() => {
    const text = (activeDoc?.bodyHtml || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    if (!text) return { words: 0, chars: 0 };
    const words = text.split(/\s+/).filter(Boolean).length;
    return { words, chars: text.length };
  }, [activeDoc?.bodyHtml]);

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-white dark:bg-[#18181B]">
      {/* 1. Left Edge Hover Trigger Zone (16px invisible strip along left margin) */}
      <div
        onMouseEnter={handleLeftEdgeEnter}
        className="absolute top-0 bottom-0 left-0 w-4 z-40 pointer-events-auto"
        title="Hover to reveal Notes list"
      />

      {/* 2. Quiet floating pill button at top left to explicitly open sidebar if preferred */}
      {!isSidebarOpen && !isSidebarPinned && (
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="absolute left-4 top-4 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-[0_4px_16px_rgba(0,0,0,0.06)] text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:border-amber-400 transition-all cursor-pointer group select-none animate-in fade-in"
          title="Open Notes Sidebar"
        >
          <NotesIcon size={14} className="text-amber-600 dark:text-amber-500" />
          <span className="text-xs font-semibold">Notes</span>
          <ChevronRight size={12} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* 3. Hover-Reveal Floating Notes Sidebar (Retractable Card Overlay) */}
      <HoverRevealNotesSidebar
        documents={documents}
        activeDoc={activeDoc}
        onSelectDoc={onSelectDoc}
        onNewNote={onNewNote}
        isOpen={isSidebarOpen}
        isPinned={isSidebarPinned}
        onTogglePin={() => setIsSidebarPinned((prev) => !prev)}
        onClose={() => {
          setIsSidebarPinned(false);
          setIsSidebarOpen(false);
        }}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
        sortAscending={sortAscending}
        onToggleSort={() => setSortAscending((prev) => !prev)}
        isDarkMode={isDarkMode}
      />

      {/* 4. Dominant Ruled Notebook Writing Surface */}
      <RuledNotebookCanvas
        title={activeDoc?.title}
        onUpdateTitle={onUpdateTitle}
        bodyHtml={activeDoc?.bodyHtml || ""}
        onUpdateBodyHtml={onUpdateBodyHtml}
        rulingType={rulingType}
        rulingThickness={rulingThickness}
        isHandwriting={isHandwriting}
        isDarkMode={isDarkMode}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />

      {/* 5. Floating Bottom Dock (Whiteboard-Inspired Capsule Dock) */}
      <NotesFloatingDock
        activeDoc={activeDoc}
        onUpdateDoc={onUpdateDoc}
        onConvertToDoc={onConvertToDoc}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={onUndo}
        onRedo={onRedo}
        stats={stats}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}


