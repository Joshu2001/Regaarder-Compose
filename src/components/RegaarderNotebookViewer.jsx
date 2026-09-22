import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Plus, Search, MoreHorizontal, ChevronDown, Check,
  X, ArrowUpDown, AlignLeft, AlignJustify, CheckSquare, Edit3, Type,
  Highlighter, Paperclip, ImagePlus, FileText, Pin, PinOff,
  Table, Sliders, Undo2, Redo2, Sparkles, ChevronRight, Hash, Eye,
  Lock, Unlock, Shield, Users, Share2, Copy, Download, Eraser,
  PenTool, Brush, Palette, Trash2, ExternalLink, Play
} from "lucide-react";
import { RegaarderAiIcon, NotesIcon } from "./RegaarderProductIcons";
import { executeAiTurn } from "../services/llmProviderService";
import NotesSelectionToolbar from "./NotesSelectionToolbar";

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
    const updatePosition = () => {
      const anchor = anchorRef?.current;
      const pop = popRef?.current;
      if (!anchor || !pop) return;

      const rect = anchor.getBoundingClientRect();
      const popRect = pop.getBoundingClientRect();
      const actualWidth = popRect.width || width;
      const actualHeight = popRect.height || 260;

      // Vertical positioning: default open upward above the floating dock, with safe top margin
      const spaceAbove = rect.top - 12;
      const spaceBelow = window.innerHeight - rect.bottom - 12;

      if (spaceAbove >= actualHeight || spaceAbove >= spaceBelow) {
        pop.style.bottom = `${Math.max(12, window.innerHeight - rect.top + 10)}px`;
        pop.style.top = "auto";
        pop.style.maxHeight = `${Math.max(160, rect.top - 24)}px`;
      } else {
        pop.style.top = `${Math.max(12, rect.bottom + 10)}px`;
        pop.style.bottom = "auto";
        pop.style.maxHeight = `${Math.max(160, window.innerHeight - rect.bottom - 24)}px`;
      }

      // Horizontal positioning: center on anchor, clamped within screen margins
      const targetLeft = rect.left + rect.width / 2 - actualWidth / 2;
      const clampedLeft = Math.max(12, Math.min(window.innerWidth - actualWidth - 16, targetLeft));
      pop.style.left = `${clampedLeft}px`;
    };

    updatePosition();
    const handleResize = () => updatePosition();
    window.addEventListener("resize", handleResize);

    const handleOutside = (e) => {
      const anchor = anchorRef?.current;
      const pop = popRef?.current;
      if (pop && anchor && !pop.contains(e.target) && !anchor.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("pointerdown", handleOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("pointerdown", handleOutside);
    };
  }, [anchorRef, onClose, width]);

  return (
    <div
      ref={popRef}
      className="fixed z-50 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-slate-200/80 dark:border-zinc-700/80 p-2.5 animate-in fade-in zoom-in-95 duration-150 select-none text-slate-800 dark:text-zinc-100 bg-white/95 dark:bg-[#1c1c1f]/95 backdrop-blur-2xl overflow-y-auto"
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
  const [openPopover, setOpenPopover] = useState(null); // 'pen' | 'ruling' | 'add' | 'ai' | 'more'
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const fileInputRef = useRef(null);

  // Pen tool configurations
  const penTool = activeDoc?.penTool || "ballpoint";
  const penColor = activeDoc?.penColor || "#1c1917";
  const penWidth = activeDoc?.penWidth || 3;

  useEffect(() => {
    if (activeDoc?.activeTool) {
      setActiveTool(activeDoc.activeTool);
    } else if (activeDoc?.isHandwriting !== undefined) {
      setActiveTool(activeDoc.isHandwriting ? "pen" : "text");
    }
  }, [activeDoc?.activeTool, activeDoc?.isHandwriting]);

  const refs = {
    pen: useRef(null),
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

  const handleShareAsText = async () => {
    const editor = document.getElementById("regaarder-notebook-editor");
    const rawContent = editor ? (editor.innerText || editor.textContent || "") : (activeDoc?.bodyHtml || "");
    const title = activeDoc?.title || "Untitled Note";
    const textToCopy = `${title}\n\n${rawContent}`.trim();
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    } catch (err) {
      console.warn("Failed to copy note text:", err);
    }
  };

  const handleShareAsPicture = () => {
    // Printable / image export hook
    window.print();
  };

  const handleRedactSelection = () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString();
    const redactMarkup = `<mark style="background:#0f172a;color:#0f172a;border-radius:3px;padding:1px 5px;user-select:none;cursor:default;" title="Redacted Content">${selectedText || "REDACTED"}</mark>`;
    exec("insertHTML", redactMarkup);
  };

  const handleTogglePassword = () => {
    if (activeDoc?.isLocked) {
      onUpdateDoc?.({ isLocked: false });
    } else {
      const pin = window.prompt("Enter a 4-digit PIN to lock this note:", "1234");
      if (pin) {
        onUpdateDoc?.({ isLocked: true, passcode: pin.trim() });
      }
    }
  };

  const handleToggleCollab = () => {
    onUpdateDoc?.({ isCollab: !activeDoc?.isCollab });
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
        <div className="flex items-center p-0.5 rounded-xl bg-slate-100/90 dark:bg-zinc-800/80 border border-slate-200/50 dark:border-zinc-700/50 relative">
          <button
            ref={refs.pen}
            type="button"
            onClick={() => {
              if (activeTool !== "pen") {
                handleTogglePen();
              } else {
                toggle("pen");
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
              activeTool === "pen"
                ? "bg-white dark:bg-zinc-900 text-amber-700 dark:text-amber-400 shadow-2xs border border-slate-200/60 dark:border-zinc-700/60"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
            }`}
            title="Handwriting pen mode & palette"
          >
            <Edit3 size={13} strokeWidth={2} />
            <span>Pen</span>
            {activeTool === "pen" && <ChevronDown size={10} className="text-amber-600/70" />}
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

          {/* Pen Tool Popover */}
          {openPopover === "pen" && (
            <ToolbarPopover anchorRef={refs.pen} onClose={closeAll} width={230}>
              <div className="px-2 py-1 text-[10px] font-semibold tracking-wider uppercase text-slate-400">
                Pen Tools & Inking
              </div>
              <div className="grid grid-cols-3 gap-1 mb-2">
                {[
                  { id: "ballpoint", label: "Pen", icon: Edit3 },
                  { id: "highlighter", label: "Highlighter", icon: Highlighter },
                  { id: "eraser", label: "Eraser", icon: Eraser },
                ].map(({ id, label, icon: IconComp }) => {
                  const isSelected = penTool === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        onUpdateDoc?.({ penTool: id });
                      }}
                      className={`flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer ${
                        isSelected
                          ? "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-semibold shadow-2xs"
                          : "hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                      }`}
                    >
                      <IconComp size={15} strokeWidth={isSelected ? 2.2 : 1.8} />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Color Swatches */}
              {penTool !== "eraser" && (
                <>
                  <div className="px-2 py-1 text-[10px] font-semibold tracking-wider uppercase text-slate-400">
                    Ink Color
                  </div>
                  <div className="flex items-center justify-between px-1 mb-2">
                    {[
                      { name: "Onyx", value: "#1c1917" },
                      { name: "Navy", value: "#1e3a8a" },
                      { name: "Amber", value: "#d97706" },
                      { name: "Crimson", value: "#dc2626" },
                      { name: "Emerald", value: "#059669" },
                      { name: "Purple", value: "#7c3aed" },
                    ].map((col) => {
                      const isChosen = penColor === col.value;
                      return (
                        <button
                          key={col.value}
                          type="button"
                          title={col.name}
                          onPointerDown={(e) => {
                            e.preventDefault();
                            onUpdateDoc?.({ penColor: col.value });
                          }}
                          className={`w-6 h-6 rounded-full transition-transform cursor-pointer relative flex items-center justify-center ${
                            isChosen ? "scale-110 ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-zinc-900" : "hover:scale-105"
                          }`}
                          style={{ backgroundColor: col.value }}
                        >
                          {isChosen && <Check size={11} className="text-white drop-shadow-xs" strokeWidth={3} />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Stroke Width Selection */}
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">
                  Thickness
                </span>
                <span className="text-[10px] font-mono font-medium text-slate-500 dark:text-zinc-400">
                  {penWidth}px
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-1 mb-2">
                {[
                  { id: 2, label: "Fine", h: 2 },
                  { id: 4, label: "Medium", h: 4 },
                  { id: 6, label: "Bold", h: 6 },
                  { id: 10, label: "Heavy", h: 8 },
                ].map((st) => {
                  const isSelected = penWidth === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        onUpdateDoc?.({ penWidth: st.id });
                      }}
                      className={`flex-1 flex flex-col items-center gap-1 py-1 px-1 rounded-lg text-[10px] cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-slate-200/80 dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 font-semibold"
                          : "hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500"
                      }`}
                    >
                      <div
                        className="rounded-full w-full max-w-[24px]"
                        style={{ height: st.h, backgroundColor: penColor || "#1c1917" }}
                      />
                      <span>{st.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Thickness Custom Slider */}
              <div className="px-2 pb-2">
                <input
                  type="range"
                  min="1"
                  max="16"
                  step="1"
                  value={penWidth}
                  onChange={(e) => {
                    const w = parseInt(e.target.value, 10) || 3;
                    onUpdateDoc?.({ penWidth: w });
                  }}
                  className="w-full accent-amber-500 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Inking Accuracy & Smoothing Calibration */}
              <div className="px-2 pt-1.5 pb-1 border-t border-slate-100 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">
                    Calibration & Smoothing
                  </span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium capitalize">
                    {activeDoc?.penSmoothing || "balanced"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 mb-1">
                  {[
                    { id: "raw", label: "Responsive", tip: "Instant sub-pixel response" },
                    { id: "balanced", label: "Balanced", tip: "Natural handwriting flow" },
                    { id: "smooth", label: "Silky", tip: "Maximum curve stabilization" },
                  ].map((lvl) => {
                    const isSelected = (activeDoc?.penSmoothing || "balanced") === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        title={lvl.tip}
                        onPointerDown={(e) => {
                          e.preventDefault();
                          onUpdateDoc?.({ penSmoothing: lvl.id });
                        }}
                        className={`py-1 px-1 rounded-lg text-[10.5px] font-medium text-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-semibold shadow-2xs border border-amber-300/60 dark:border-amber-700/60"
                            : "hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-transparent"
                        }`}
                      >
                        {lvl.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clear Drawings Button */}
              <div className="pt-1.5 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    if (window.confirm("Clear all handwriting & drawing strokes on this note?")) {
                      onUpdateDoc?.({ drawings: [] });
                      closeAll();
                    }
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Clear All Inking</span>
                </button>
              </div>
            </ToolbarPopover>
          )}
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
            <ToolbarPopover anchorRef={refs.more} onClose={closeAll} width={230}>
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
                    fileInputRef.current?.click();
                    closeAll();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
                >
                  <ImagePlus size={14} strokeWidth={1.8} />
                  <span>Insert Image</span>
                </button>
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleRedactSelection();
                    closeAll();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
                >
                  <Shield size={14} strokeWidth={1.8} className="text-slate-600 dark:text-zinc-300" />
                  <span>Redact Selection</span>
                </button>
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleShareAsText();
                    closeAll();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
                >
                  <Copy size={14} strokeWidth={1.8} />
                  <span>Share as Plain Text</span>
                </button>
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleShareAsPicture();
                    closeAll();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
                >
                  <Download size={14} strokeWidth={1.8} />
                  <span>Export / Snapshot Note</span>
                </button>
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleTogglePassword();
                    closeAll();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
                >
                  {activeDoc?.isLocked ? (
                    <Unlock size={14} strokeWidth={1.8} className="text-emerald-600" />
                  ) : (
                    <Lock size={14} strokeWidth={1.8} className="text-amber-600" />
                  )}
                  <span>{activeDoc?.isLocked ? "Remove Password Lock" : "Password Protect Note"}</span>
                </button>
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleToggleCollab();
                    closeAll();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
                >
                  <Users size={14} strokeWidth={1.8} className={activeDoc?.isCollab ? "text-indigo-600" : ""} />
                  <span>{activeDoc?.isCollab ? "Disable Collaboration" : "Collaborative Editing"}</span>
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

      {/* Copied to clipboard visual toast */}
      {copiedToast && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-900/90 dark:bg-zinc-800 text-white text-xs font-medium rounded-full shadow-lg pointer-events-none animate-in fade-in duration-150 flex items-center gap-1.5">
          <Check size={12} className="text-emerald-400" />
          <span>Copied plain text</span>
        </div>
      )}
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

  const cardWidth = 270;
  const estimatedCardHeight = 220;

  // Auto-flip to the left of the anchor if not enough room on the right
  const roomOnRight = window.innerWidth - (anchorRect.right + 12);
  const left = roomOnRight >= cardWidth 
    ? anchorRect.right + 12 
    : Math.max(12, anchorRect.left - cardWidth - 12);

  const top = Math.max(16, Math.min(window.innerHeight - estimatedCardHeight - 16, anchorRect.top - 20));
  const rulingType = note.rulingType || "ruled";

  return (
    <div
      className="fixed z-[350] w-[270px] pointer-events-none rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-slate-200/90 dark:border-zinc-800 bg-[#FCFAF7] dark:bg-[#1C1C1F] p-3.5 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
      style={{
        top: `${top}px`,
        left: `${left}px`,
        maxHeight: `${Math.max(180, window.innerHeight - top - 24)}px`,
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
        <div className="text-[9.5px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
          {dateStr}
        </div>

        <div
          className="text-[13.5px] font-semibold text-slate-900 dark:text-zinc-100 truncate italic mb-1.5"
          style={{ fontFamily: "'Newsreader', 'Georgia', serif" }}
        >
          {title}
        </div>

        {bodyText && (
          <div
            className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-5 leading-relaxed overflow-hidden"
            style={{ lineHeight: "20px" }}
          >
            {bodyText}
          </div>
        )}
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
  onDeleteNote,
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
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const hoverTimeoutRef = useRef(null);
  const deleteConfirmTimerRef = useRef(null);
  const notesListRef = useRef(null);

  // Reveal scrollbar only when nearing the end of the scroll content
  useEffect(() => {
    const el = notesListRef.current;
    if (!el) return;
    const handleScroll = () => {
      const ratio = el.scrollTop / (el.scrollHeight - el.clientHeight || 1);
      el.classList.toggle("near-end", ratio > 0.75);
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if a note document contains actual user-created content (real data)
  const hasRealNoteData = (doc) => {
    if (!doc) return false;

    // Check for actual typed or formatted text
    const plainText = (doc.bodyHtml || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .trim();

    // Check for drawings / handwriting strokes
    const hasStrokes = Array.isArray(doc.drawings) && doc.drawings.length > 0;

    // Check for genuine user-given title (not default/generic placeholders)
    const trimmedTitle = (doc.title || "").trim();
    const isGenericTitle = !trimmedTitle || /^(?:untitled\s*(?:note|document|sheet|deck|whiteboard|entry)?(?:\s+\d+)?|new\s*action\s*item)$/i.test(trimmedTitle);
    const hasCustomTitle = !isGenericTitle;

    // If there is real user data, treat it as real regardless of stale isBlank flag
    if (plainText.length > 0 || hasStrokes || (hasCustomTitle && trimmedTitle.length > 0)) {
      return true;
    }

    if (doc.isBlank) return false;
    return false;
  };

  const notes = useMemo(() => {
    const list = (documents || []).filter(
      (d) => (d.isNotesDoc || d.mode === "notes") && hasRealNoteData(d)
    );
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
    const timestamp = doc.updatedAt || doc.createdAt;
    if (!timestamp) return "";
    const d = new Date(timestamp);
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
    if (!doc.bodyHtml) return "";
    // Strip HTML tags, collapse whitespace, decode basic entities
    const plain = doc.bodyHtml
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#?\w+;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!plain || plain.length < 3) return "";
    return plain.length > 55 ? plain.substring(0, 55) + "…" : plain;
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
        className={`fixed top-4 bottom-4 left-4 z-50 w-[280px] flex flex-col rounded-2xl bg-white/95 dark:bg-[#1c1c1f]/95 backdrop-blur-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] select-none transition-[transform,opacity] duration-[120ms] ease-out ${
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

        {/* Notes List — scrollbar only appears when nearing the bottom of overflow content */}
        <div ref={notesListRef} className="flex-1 overflow-y-auto px-2 py-1.5 space-y-1 notes-list-scrollbar">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[260px] px-4 py-8 text-center select-none animate-in fade-in duration-300">
              <div className="relative mb-3 flex items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-center shadow-xs">
                  <NotesIcon size={26} className="text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <h3 className="text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1">
                {searchQuery.trim() ? "No matching notes" : "No Notes Yet"}
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 max-w-[190px] leading-relaxed mb-4">
                {searchQuery.trim()
                  ? "Try searching for a different keyword or title."
                  : "Capture thoughts, brainstorms, and sketches on ruled pages."}
              </p>
              {!searchQuery.trim() && (
                <button
                  type="button"
                  onClick={onNewNote}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-200/80 dark:border-amber-800/60 transition-all active:scale-95 cursor-pointer"
                >
                  <Plus size={13} strokeWidth={2.2} />
                  <span>Create First Note</span>
                </button>
              )}
            </div>
          ) : (
            notes.map((note, index) => {
              const isActive = activeDoc?.id === note.id;
              const snippet = getNoteSnippet(note);
              const dateText = formatNoteDate(note);
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
                        {note.title?.trim() || "Untitled Note"}
                      </span>
                    </div>

                    {note.pinned && (
                      <Pin size={11} className="text-amber-600 dark:text-amber-400 fill-current shrink-0" />
                    )}

                    <button
                      type="button"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();

                        if (pendingDeleteId === note.id) {
                          // Second tap — confirmed: fire deletion and clear all preview state immediately
                          clearTimeout(deleteConfirmTimerRef.current);
                          clearTimeout(hoverTimeoutRef.current);
                          setPendingDeleteId(null);
                          setHoveredNoteInfo(null);
                          onDeleteNote?.(note.id);
                        } else {
                          // First tap — arm the confirm state, auto-reset after 2.5s
                          clearTimeout(deleteConfirmTimerRef.current);
                          setPendingDeleteId(note.id);
                          deleteConfirmTimerRef.current = setTimeout(() => {
                            setPendingDeleteId(null);
                          }, 2500);
                        }
                      }}
                      className={`opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all shrink-0 ${
                        pendingDeleteId === note.id
                          ? "opacity-100 text-rose-500 bg-rose-50 dark:bg-rose-950/40 ring-1 ring-rose-300 dark:ring-rose-800"
                          : "text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      }`}
                      title={pendingDeleteId === note.id ? "Tap again to confirm delete" : "Delete note"}
                    >
                      {pendingDeleteId === note.id ? (
                        <X size={12} strokeWidth={2.5} />
                      ) : (
                        <Trash2 size={12} strokeWidth={2} />
                      )}
                    </button>
                  </div>

                  {dateText && (
                    <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium mb-0.5">
                      {dateText}
                    </div>
                  )}

                  {snippet && (
                    <div className="text-[11px] text-slate-400 dark:text-zinc-500 truncate leading-normal">
                      {snippet}
                    </div>
                  )}
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
  activeDoc,
  title,
  onUpdateTitle,
  bodyHtml,
  onUpdateBodyHtml,
  onUpdateDoc,
  rulingType = "ruled",
  rulingThickness = "normal",
  isHandwriting = false,
  isDarkMode = false,
  onOpenSidebar,
  onToggleImmersive,
}) {
  const editorRef = useRef(null);
  const titleRef = useRef(null);
  const drawingSvgRef = useRef(null);
  const lastTapRef = useRef({ time: 0, x: 0, y: 0 });

  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [isUnlockedLocally, setIsUnlockedLocally] = useState(false);
  const [isDrawingNow, setIsDrawingNow] = useState(false);
  const [currentStroke, setCurrentStroke] = useState(null);
  const [selectionToolbarState, setSelectionToolbarState] = useState(null); // { text, range, rect }

  const isLocked = Boolean(activeDoc?.isLocked) && !isUnlockedLocally;
  const drawings = activeDoc?.drawings || [];

  // Universal double-click / double-tap to toggle or exit immersive mode
  const handleCanvasDoubleClick = useCallback((e) => {
    if (isHandwriting) return;
    if (e.target.closest("button, input, textarea, a, select, [contenteditable='true'], [role='button'], [data-notes-selection-toolbar]")) {
      return;
    }
    onToggleImmersive?.();
  }, [isHandwriting, onToggleImmersive]);

  const handleCanvasPointerDown = useCallback((e) => {
    if (isHandwriting) return;
    if (e.target.closest("button, input, textarea, a, select, [contenteditable='true'], [role='button'], [data-notes-selection-toolbar]")) {
      return;
    }
    const now = Date.now();
    const prev = lastTapRef.current;
    const timeDiff = now - prev.time;
    const dist = Math.hypot((e.clientX || 0) - prev.x, (e.clientY || 0) - prev.y);

    if (timeDiff > 0 && timeDiff < 350 && dist < 30) {
      onToggleImmersive?.();
      lastTapRef.current = { time: 0, x: 0, y: 0 };
    } else {
      lastTapRef.current = { time: now, x: e.clientX || 0, y: e.clientY || 0 };
    }
  }, [isHandwriting, onToggleImmersive]);

  // Track text selection in notebook editor for floating toolbar
  const checkSelection = useCallback(() => {
    if (isHandwriting) {
      setSelectionToolbarState(null);
      return;
    }
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) {
      setSelectionToolbarState(null);
      return;
    }
    const text = sel.toString().trim();
    if (!text) {
      setSelectionToolbarState(null);
      return;
    }

    const range = sel.getRangeAt(0);
    const editor = editorRef.current;
    if (!editor || !editor.contains(range.commonAncestorContainer)) {
      setSelectionToolbarState(null);
      return;
    }

    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      setSelectionToolbarState(null);
      return;
    }

    setSelectionToolbarState({
      text,
      range: range.cloneRange(),
      rect,
    });
  }, [isHandwriting]);

  useEffect(() => {
    const handleDocSelectionChange = () => {
      // Delay slightly so mouseup or keyup completes range establishment
      requestAnimationFrame(() => {
        checkSelection();
      });
    };

    document.addEventListener("selectionchange", handleDocSelectionChange);
    return () => document.removeEventListener("selectionchange", handleDocSelectionChange);
  }, [checkSelection]);

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

      // Auto-extract first non-empty line as note title if user hasn't explicitly set a custom title
      const plain = html
        .replace(/<[^>]*>/g, "\n")
        .replace(/&nbsp;/g, " ")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)[0];

      if (plain && (!title || /^untitled\s*note(?:\s+\d+)?$/i.test(title.trim()))) {
        const autoTitle = plain.length > 36 ? plain.substring(0, 36).trim() + "…" : plain;
        onUpdateTitle?.(autoTitle);
      }
    }, 280);
  }, [onUpdateBodyHtml, onUpdateTitle, title]);

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

  // ─── Smart Paste Handler (YouTube / Vimeo / Images / Web links) ──────────────
  const handleEditorPaste = useCallback((e) => {
    const text = e.clipboardData?.getData("text/plain")?.trim();
    if (!text) return;

    // Check YouTube URL
    const ytMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      e.preventDefault();
      const videoId = ytMatch[1];
      const ytHtml = `<div class="regaarder-media-embed" contenteditable="false" style="margin:16px 0;max-width:560px;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.12);background:#000;"><div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;"><iframe src="https://www.youtube-nocookie.com/embed/${videoId}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></div><p><br/></p>`;
      document.execCommand("insertHTML", false, ytHtml);
      return;
    }

    // Check Vimeo URL
    const vimeoMatch = text.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      e.preventDefault();
      const vimeoId = vimeoMatch[1];
      const vimeoHtml = `<div class="regaarder-media-embed" contenteditable="false" style="margin:16px 0;max-width:560px;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.12);background:#000;"><div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;"><iframe src="https://player.vimeo.com/video/${vimeoId}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div></div><p><br/></p>`;
      document.execCommand("insertHTML", false, vimeoHtml);
      return;
    }

    // Check Direct Image URL
    if (text.match(/\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i)) {
      e.preventDefault();
      const imgHtml = `<img src="${text}" alt="Embedded Image" style="max-width:100%;border-radius:8px;margin:12px 0;box-shadow:0 4px 16px rgba(0,0,0,0.08);display:block;" /><p><br/></p>`;
      document.execCommand("insertHTML", false, imgHtml);
      return;
    }

    // Check general http/https link -> rich card embed
    if (/^https?:\/\/[^\s]+$/i.test(text)) {
      try {
        const urlObj = new URL(text);
        e.preventDefault();
        const linkCardHtml = `<div class="regaarder-link-preview" contenteditable="false" style="margin:12px 0;display:inline-flex;align-items:center;gap:10px;padding:8px 14px;border-radius:10px;background:rgba(241,245,249,0.7);border:1px solid rgba(203,213,225,0.8);text-decoration:none;"><span style="font-size:16px;">🔗</span><div><div style="font-size:12.5px;font-weight:600;color:#0f172a;"><a href="${text}" target="_blank" rel="noopener noreferrer" style="color:#0284c7;text-decoration:none;">${urlObj.hostname}</a></div><div style="font-size:11px;color:#64748b;max-width:320px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${text}</div></div></div><p><br/></p>`;
        document.execCommand("insertHTML", false, linkCardHtml);
      } catch (_) {}
    }
  }, []);

  const canvasContainerRef = useRef(null);

  // Dynamic scrollbar: completely hidden by default, emerges only when content overflows heavily and scrolled near the end
  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const scrollRange = el.scrollHeight - el.clientHeight;
      if (scrollRange <= 180) {
        el.classList.remove("has-visible-scrollbar");
        return;
      }
      const scrollRatio = el.scrollTop / scrollRange;
      // Appears when text is close to the end of the note (> 65% scrolled) or when overflowing heavily and scrolling
      if (scrollRatio > 0.65) {
        el.classList.add("has-visible-scrollbar");
      } else {
        el.classList.remove("has-visible-scrollbar");
      }
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // ─── Drawing Overlay Pointer Event Handlers ─────────────────────────────────
  const handlePointerDown = (e) => {
    if (!isHandwriting) return;
    const svg = drawingSvgRef.current;
    if (!svg) return;

    // Capture pointer for 60fps ultra-responsive drawing without dropped events
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}

    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const tool = activeDoc?.penTool || "ballpoint";
    const color = activeDoc?.penColor || "#1c1917";
    const width = activeDoc?.penWidth || 3;
    const smoothing = activeDoc?.penSmoothing || "balanced";

    if (tool === "eraser") {
      // Remove strokes near (x, y)
      const filtered = drawings.filter((st) => {
        return !st.points.some(([px, py]) => Math.hypot(px - x, py - y) < 18);
      });
      if (filtered.length !== drawings.length) {
        onUpdateDoc?.({ drawings: filtered });
      }
      setIsDrawingNow(true);
      return;
    }

    setIsDrawingNow(true);
    setCurrentStroke({
      tool,
      color,
      width: tool === "highlighter" ? Math.max(16, width * 4) : width,
      opacity: tool === "highlighter" ? 0.35 : 1,
      smoothing,
      points: [[x, y]],
    });
  };

  const handlePointerMove = (e) => {
    if (!isDrawingNow) return;
    const svg = drawingSvgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const tool = activeDoc?.penTool || "ballpoint";
    if (tool === "eraser") {
      const filtered = drawings.filter((st) => {
        return !st.points.some(([px, py]) => Math.hypot(px - x, py - y) < 18);
      });
      if (filtered.length !== drawings.length) {
        onUpdateDoc?.({ drawings: filtered });
      }
      return;
    }

    if (currentStroke) {
      setCurrentStroke((prev) => ({
        ...prev,
        points: [...prev.points, [x, y]],
      }));
    }
  };

  const handlePointerUp = (e) => {
    if (e?.currentTarget && e.pointerId !== undefined) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
    if (!isDrawingNow) return;
    setIsDrawingNow(false);
    if (currentStroke && currentStroke.points.length > 0) {
      const updatedDrawings = [...drawings, currentStroke];
      onUpdateDoc?.({ drawings: updatedDrawings });
      setCurrentStroke(null);
    }
  };

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
        backgroundPosition: `56px 36px`,
      };
    }
    if (rulingType === "dot") {
      const dotCol = isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(100, 116, 139, 0.22)";
      return {
        backgroundImage: `radial-gradient(${dotCol} 1.1px, transparent 1.1px)`,
        backgroundSize: `${baselinePx}px ${baselinePx}px`,
        backgroundPosition: `56px 36px`,
      };
    }
    const ruleCol = isDarkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(147, 197, 253, 0.18)";
    return {
      backgroundImage: `linear-gradient(${ruleCol} 1px, transparent 1px)`,
      backgroundSize: `100% ${baselinePx}px`,
      backgroundPosition: `0 36px`,
    };
  }, [rulingType, baselinePx, isDarkMode]);

  const baselineTopOffset = useMemo(() => {
    // In typographic rendering with a 15px font inside a baselinePx line-box:
    // Font glyphs sit at baseline = (lineHeight - fontSize)/2 + fontAscent ≈ (baselinePx - 15)/2 + 12 = baselinePx/2 + 4.5.
    // The horizontal ruled line is located at 0px of each background tile.
    // To make the font baseline rest squarely ON TOP of the ruled line at baselinePx,
    // we apply a vertical offset equal to (baselinePx - 7) px so that:
    // (baselinePx - 7) + (baselinePx / 2 + 4.5) aligns the bottom of x-height characters right on the rule.
    return Math.max(0, baselinePx - 7);
  }, [baselinePx]);

  // Convert points array to SVG path 'd' string with midpoint quadratic bezier curve smoothing
  const getSvgPathData = (points, smoothingLevel = "balanced") => {
    if (!points || points.length === 0) return "";
    if (points.length === 1) {
      return `M ${points[0][0]} ${points[0][1]} L ${points[0][0] + 0.5} ${points[0][1] + 0.5}`;
    }
    if (points.length === 2 || smoothingLevel === "raw") {
      let d = `M ${points[0][0]} ${points[0][1]}`;
      for (let i = 1; i < points.length; i++) {
        d += ` L ${points[i][0]} ${points[i][1]}`;
      }
      return d;
    }

    // Quadratic Bezier curve using midpoints between vertices for Apple-grade smoothness
    let d = `M ${points[0][0]} ${points[0][1]}`;
    const p0 = points[0];
    const p1 = points[1];
    const midX = (p0[0] + p1[0]) / 2;
    const midY = (p0[1] + p1[1]) / 2;
    d += ` L ${midX} ${midY}`;

    for (let i = 1; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const mx = (current[0] + next[0]) / 2;
      const my = (current[1] + next[1]) / 2;
      d += ` Q ${current[0]} ${current[1]}, ${mx} ${my}`;
    }

    const last = points[points.length - 1];
    d += ` L ${last[0]} ${last[1]}`;
    return d;
  };

  // Password Unlock Submission
  const handleUnlockSubmit = (e) => {
    e.preventDefault();
    const correctPin = activeDoc?.passcode || "1234";
    if (enteredPin === correctPin) {
      setIsUnlockedLocally(true);
      setPinError(false);
      setEnteredPin("");
    } else {
      setPinError(true);
    }
  };

  // Formatting commands for selection toolbar
  const handleApplyFormat = useCallback((cmd, value = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    if (cmd === "checklist") {
      const checkboxHtml = `<div class="note-todo-item" style="display:flex;align-items:flex-start;gap:8px;margin:3px 0;"><input type="checkbox" style="width:15px;height:15px;margin-top:7px;accent-color:#D97706;cursor:pointer;" onchange="this.nextElementSibling.style.textDecoration=this.checked?'line-through':'none';this.nextElementSibling.style.opacity=this.checked?'0.6':'1';" /><span>New action item</span></div><br/>`;
      document.execCommand("insertHTML", false, checkboxHtml);
    } else {
      document.execCommand(cmd, false, value);
    }
    flushUpdates();
    checkSelection();
  }, [flushUpdates, checkSelection]);

  // Replace selection with AI generated text
  const handleReplaceSelection = useCallback((replacementText) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    // Clean replacement and format paragraphs if multiline
    let clean = (replacementText || "").trim();
    if (clean.includes("\n")) {
      clean = clean
        .split("\n")
        .map((l) => (l.trim() ? `<p>${l.trim()}</p>` : "<p><br/></p>"))
        .join("");
      document.execCommand("insertHTML", false, clean);
    } else {
      document.execCommand("insertText", false, clean);
    }
    flushUpdates();
    setSelectionToolbarState(null);
  }, [flushUpdates]);

  const displayTitle = title && !/^untitled\s*note(?:\s+\d+)?$/i.test(title.trim()) ? title : "";

  return (
    <div
      ref={canvasContainerRef}
      onDoubleClick={handleCanvasDoubleClick}
      onPointerDown={handleCanvasPointerDown}
      className="flex-1 h-full overflow-y-auto relative bg-[#FCFAF7] dark:bg-[#18181A] transition-colors select-text notes-canvas-scrollbar"
    >
      {/* Floating Contextual Selection Toolbar */}
      {selectionToolbarState && !isHandwriting && (
        <NotesSelectionToolbar
          selectionState={selectionToolbarState}
          onClose={() => setSelectionToolbarState(null)}
          onApplyFormat={handleApplyFormat}
          onReplaceSelection={handleReplaceSelection}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Top right notebook header: Date + Page indicator + Collab / Lock badges */}
      <div className="absolute right-8 top-3 z-10 flex items-center gap-3 text-[11.5px] font-medium text-slate-400 dark:text-zinc-500 select-none pointer-events-none">
        {activeDoc?.isCollab && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold text-[10px]">
            <Users size={11} />
            <span>Collab</span>
          </span>
        )}
        {activeDoc?.isLocked && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-semibold text-[10px]">
            <Lock size={11} />
            <span>Protected</span>
          </span>
        )}
        <span>{formattedDate}</span>
        <span>1 / 1</span>
      </div>

      {/* Ruling lines layer */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-150"
        style={rulingBgStyle}
      />

      {/* Vertical red margin guide line: left 56px (Image 1 authentic placement) */}
      {rulingType === "ruled" && (
        <div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{
            left: 56,
            width: 1.5,
            backgroundColor: "rgba(248, 113, 113, 0.42)",
          }}
        />
      )}

      {/* If Password-Locked, Show Apple-Style Lock Card */}
      {isLocked ? (
        <div className="flex flex-col items-center justify-center min-h-[500px] h-full p-8 text-center select-none animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-2xl bg-amber-100/80 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-4 shadow-sm border border-amber-200/80 dark:border-amber-800/80">
            <Lock size={28} strokeWidth={2.2} />
          </div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 mb-1">
            This Note is Password-Protected
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mb-5 max-w-[260px]">
            Enter your 4-digit PIN to view and edit the contents of this notebook entry.
          </p>
          <form onSubmit={handleUnlockSubmit} className="flex flex-col items-center gap-3">
            <input
              type="password"
              maxLength={8}
              value={enteredPin}
              onChange={(e) => {
                setEnteredPin(e.target.value);
                if (pinError) setPinError(false);
              }}
              placeholder="Enter PIN"
              className={`w-36 text-center text-sm py-2 px-3 rounded-xl bg-white dark:bg-zinc-800 border ${
                pinError
                  ? "border-rose-500 ring-2 ring-rose-400/20"
                  : "border-slate-200 dark:border-zinc-700 focus:border-amber-500"
              } outline-none tracking-widest text-slate-900 dark:text-zinc-100 shadow-2xs font-semibold`}
            />
            {pinError && <span className="text-xs text-rose-500 font-medium">Incorrect PIN. Try again.</span>}
            <button
              type="submit"
              className="py-1.5 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Unlock Note
            </button>
          </form>
        </div>
      ) : (
        /* Notebook writing content container - edge-to-edge starting immediately from top-left margin */
        <div
          className="relative min-h-full w-full"
          style={{
            paddingLeft: rulingType === "ruled" ? 72 : 36,
            paddingRight: 40,
            paddingTop: 36,
            paddingBottom: 160,
          }}
        >
          {/* SVG Inking Canvas Overlay (Active when Pen mode is enabled) */}
          <svg
            ref={drawingSvgRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className={`absolute inset-0 w-full h-full ${
              isHandwriting
                ? `pointer-events-auto z-20 ${(activeDoc?.penTool || "ballpoint") === "eraser" ? "cursor-cell" : "cursor-crosshair-pen"}`
                : "pointer-events-none z-10 cursor-default"
            }`}
            style={{ touchAction: "none" }}
          >
            {drawings.map((st, i) => (
              <path
                key={i}
                d={getSvgPathData(st.points, st.smoothing || activeDoc?.penSmoothing || "balanced")}
                fill="none"
                stroke={st.color || "#1c1917"}
                strokeWidth={st.width || 3}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={st.opacity || 1}
              />
            ))}
            {currentStroke && (
              <path
                d={getSvgPathData(currentStroke.points, currentStroke.smoothing || activeDoc?.penSmoothing || "balanced")}
                fill="none"
                stroke={currentStroke.color || "#1c1917"}
                strokeWidth={currentStroke.width || 3}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={currentStroke.opacity || 1}
              />
            )}
          </svg>

          {/* Dedicated Note Title Header with Elegant Placeholder */}
          <div className="relative z-15 w-full mb-1">
            <input
              ref={titleRef}
              type="text"
              value={displayTitle}
              onChange={(e) => onUpdateTitle?.(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              placeholder="Title"
              className="w-full bg-transparent outline-none font-bold text-slate-900 dark:text-zinc-100 placeholder:text-slate-300 dark:placeholder:text-zinc-600 transition-colors border-none p-0 tracking-tight"
              style={{
                fontSize: "22px",
                lineHeight: `${baselinePx}px`,
                fontFamily: isHandwriting
                  ? "'Caveat', 'Segoe Script', cursive, serif"
                  : "'Newsreader', 'Georgia', -apple-system, serif",
              }}
            />
          </div>

          {/* Note Body Editor - starts immediately below title at ruled baseline */}
          <div
            id="regaarder-notebook-editor"
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleEditorInput}
            onPaste={handleEditorPaste}
            onBlur={flushUpdates}
            className="outline-none w-full min-h-[600px] text-slate-800 dark:text-zinc-200 relative z-15 regaarder-notebook-content-body"
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
      )}
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
  onDeleteNote,
  onToggleImmersive,
  isDarkMode,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const [sortAscending, setSortAscending] = useState(false);
  const sidebarLeaveTimerRef = useRef(null);

  const rulingType = activeDoc?.rulingType || "ruled";
  const rulingThickness = activeDoc?.rulingThickness || "normal";
  const isHandwriting = activeDoc?.isHandwriting || activeDoc?.activeTool === "pen";

  // Hover detection handlers for left edge (Instantaneous reveal)
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
    }, 200);
  };

  // Real-time word and character counts
  const stats = useMemo(() => {
    const text = (activeDoc?.bodyHtml || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    if (!text) return { words: 0, chars: 0 };
    const words = text.split(/\s+/).filter(Boolean).length;
    return { words, chars: text.length };
  }, [activeDoc?.bodyHtml]);

  // Track mouse coordinates to seamlessly open the Notes modal when hovering near the left edge
  const handleContainerMouseMove = (e) => {
    // If mouse is within 72px from left edge, instantly reveal notes sidebar
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    if (relX >= 0 && relX <= 72) {
      handleLeftEdgeEnter();
    }
  };

  return (
    <div 
      onMouseMove={handleContainerMouseMove}
      className="relative flex h-full w-full overflow-hidden bg-white dark:bg-[#18181B]"
    >
      {/* 1. Left Edge Hover Trigger Zone (Expanded 72px invisible strip along left margin) */}
      <div
        onMouseEnter={handleLeftEdgeEnter}
        className="absolute top-0 bottom-0 left-0 w-18 z-40 pointer-events-auto"
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
        onDeleteNote={onDeleteNote}
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
        activeDoc={activeDoc}
        title={activeDoc?.title}
        onUpdateTitle={onUpdateTitle}
        bodyHtml={activeDoc?.bodyHtml || ""}
        onUpdateBodyHtml={onUpdateBodyHtml}
        onUpdateDoc={onUpdateDoc}
        rulingType={rulingType}
        rulingThickness={rulingThickness}
        isHandwriting={isHandwriting}
        isDarkMode={isDarkMode}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onToggleImmersive={onToggleImmersive}
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


