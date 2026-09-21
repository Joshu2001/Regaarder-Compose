import React, { useState, useRef, useEffect } from "react";
import {
  Bold, Italic, Strikethrough, Highlighter,
  List, ListOrdered, CheckSquare, Sparkles,
  Search, CornerDownRight, Loader2, Wand2, CheckCheck,
  Minimize2, Maximize2, FileText, ChevronDown, Copy, Check
} from "lucide-react";
import { RegaarderAiIcon } from "./RegaarderProductIcons";
import { executeAiTurn } from "../services/llmProviderService";

/**
 * NotesSelectionToolbar
 * Floating contextual toolbar that appears directly above selected text in Notes.
 * Features:
 * - Formatting: Bold, Italic, Strikethrough, Highlight (amber marker).
 * - Lists: Bulleted List, Numbered List, Checklist Item.
 * - Quick Regaarder AI Actions: Polish & Improve, Summarize, Fix Grammar, Shorter/Longer, Turn into Bullets.
 * - Custom AI prompt input.
 * - Touch & focus safe: Uses onPointerDown + e.preventDefault() to retain editor selection & focus.
 */
export default function NotesSelectionToolbar({
  selectionState,
  onClose,
  onApplyFormat,
  onReplaceSelection,
  isDarkMode = false,
}) {
  const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isAiExecuting, setIsAiExecuting] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [copied, setCopied] = useState(false);
  const toolbarRef = useRef(null);
  const aiMenuRef = useRef(null);

  const rect = selectionState?.rect;

  // Compute anchored position above the selection bounding rectangle
  const style = React.useMemo(() => {
    if (!rect) return { display: "none" };

    const toolbarWidth = isAiMenuOpen ? 340 : 360;
    const estimatedHeight = 44;
    const gap = 10;

    // Center horizontally over the selection, keeping within window boundaries
    let left = rect.left + rect.width / 2 - toolbarWidth / 2;
    left = Math.max(16, Math.min(window.innerWidth - toolbarWidth - 16, left));

    // Place above selection if there's enough room, otherwise flip below
    let top = rect.top - estimatedHeight - gap;
    if (top < 60) {
      top = rect.bottom + gap;
    }

    return {
      position: "fixed",
      top: `${Math.round(top)}px`,
      left: `${Math.round(left)}px`,
      zIndex: 60,
    };
  }, [rect, isAiMenuOpen]);

  // Click outside listener
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(e.target) &&
        (!aiMenuRef.current || !aiMenuRef.current.contains(e.target))
      ) {
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [onClose]);

  // Handle format commands
  const handleFormat = (cmd, val = null) => {
    onApplyFormat?.(cmd, val);
  };

  // AI execution for selected text
  const handleAiAction = async (actionType, promptOverride = null) => {
    const selectedText = selectionState?.text?.trim();
    if (!selectedText) return;

    setIsAiExecuting(true);
    setActiveAction(actionType);

    try {
      let prompt = "";
      if (actionType === "improve") {
        prompt = `Here is a text excerpt selected in a personal note:\n\n"${selectedText}"\n\nPlease polish and rewrite this text for maximum clarity and elegance while preserving the original meaning and tone. Return only the revised text without meta commentary.`;
      } else if (actionType === "proofread") {
        prompt = `Here is a text excerpt selected in a note:\n\n"${selectedText}"\n\nPlease fix all grammar, spelling, and punctuation errors. Preserve the original phrasing wherever correct. Return only the corrected text without explanations.`;
      } else if (actionType === "summarize") {
        prompt = `Here is a text excerpt selected in a note:\n\n"${selectedText}"\n\nPlease summarize this succinctly into 1-2 crisp, high-impact sentences. Return only the summary text.`;
      } else if (actionType === "bullets") {
        prompt = `Here is a text excerpt selected in a note:\n\n"${selectedText}"\n\nPlease transform this into a clean, concise bulleted list. Use bullet point formatting. Return only the bullet points.`;
      } else if (actionType === "shorter") {
        prompt = `Make the following selected text more concise and punchy without losing key facts:\n\n"${selectedText}"\n\nReturn only the shortened text.`;
      } else if (actionType === "longer") {
        prompt = `Expand on the following selected note thoughts with thoughtful detail, context, and clear explanations:\n\n"${selectedText}"\n\nReturn only the expanded text.`;
      } else if (actionType === "custom" && promptOverride) {
        prompt = `Selected note text:\n"${selectedText}"\n\nInstruction: ${promptOverride}\n\nReturn only the edited text fulfilling this instruction.`;
      }

      const res = await executeAiTurn([{ role: "user", content: prompt }]);
      let resultText = "";
      if (res && res.type === "text") {
        resultText = res.content;
      } else if (res && typeof res.replyText === "string") {
        resultText = res.replyText;
      } else if (res && res.text) {
        resultText = res.text;
      }

      if (resultText && resultText.trim()) {
        onReplaceSelection?.(resultText.trim());
        onClose?.();
      }
    } catch (err) {
      console.warn("Notes AI Selection Action failed:", err);
    } finally {
      setIsAiExecuting(false);
      setActiveAction(null);
      setIsAiMenuOpen(false);
    }
  };

  const handleCopySelection = async () => {
    if (!selectionState?.text) return;
    try {
      await navigator.clipboard.writeText(selectionState.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_) {}
  };

  return (
    <div
      ref={toolbarRef}
      style={style}
      data-notes-selection-toolbar="true"
      className="flex flex-col items-start gap-1 select-none animate-in fade-in zoom-in-95 duration-150 pointer-events-auto"
      onPointerDown={(e) => {
        // Prevent default click behavior on the container to preserve editor selection
        e.stopPropagation();
      }}
    >
      <div className="flex items-center flex-nowrap whitespace-nowrap gap-0.5 p-1 rounded-2xl bg-white/95 dark:bg-[#1f1f23]/95 backdrop-blur-2xl border border-slate-200/90 dark:border-zinc-700/80 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.18)] dark:shadow-[0_16px_44px_rgba(0,0,0,0.65)] text-slate-700 dark:text-zinc-200">
        
        {/* Regaarder AI Capsule Trigger */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            setIsAiMenuOpen((prev) => !prev);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            isAiMenuOpen
              ? "bg-amber-500 text-white shadow-2xs"
              : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200/80 dark:border-amber-800/80"
          }`}
          title="Regaarder AI Selection Tools"
        >
          {isAiExecuting ? (
            <Loader2 size={13} className="animate-spin text-current" />
          ) : (
            <RegaarderAiIcon size={13} className={isAiMenuOpen ? "text-white" : "text-amber-600 dark:text-amber-400"} />
          )}
          <span>AI</span>
          <ChevronDown size={11} strokeWidth={2} className={`opacity-70 transition-transform ${isAiMenuOpen ? "rotate-180" : ""}`} />
        </button>

        <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 mx-1" />

        {/* Text Styling: Bold, Italic, Strikethrough, Highlight */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            handleFormat("bold");
          }}
          className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
          title="Bold (Ctrl+B)"
        >
          <Bold size={14} strokeWidth={2.4} />
        </button>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            handleFormat("italic");
          }}
          className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
          title="Italic (Ctrl+I)"
        >
          <Italic size={14} strokeWidth={2.2} />
        </button>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            handleFormat("strikeThrough");
          }}
          className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
          title="Strikethrough"
        >
          <Strikethrough size={14} strokeWidth={2} />
        </button>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            handleFormat("hiliteColor", "#FEF08A");
          }}
          className="p-1.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-600 dark:text-amber-400 transition-colors cursor-pointer"
          title="Highlight (Yellow Marker)"
        >
          <Highlighter size={14} strokeWidth={2.2} />
        </button>

        <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 mx-1" />

        {/* Lists & Tasks: Bullet, Numbered, Checklist */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            handleFormat("insertUnorderedList");
          }}
          className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
          title="Bulleted List"
        >
          <List size={14} strokeWidth={2} />
        </button>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            handleFormat("insertOrderedList");
          }}
          className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
          title="Numbered List"
        >
          <ListOrdered size={14} strokeWidth={2} />
        </button>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            handleFormat("checklist");
          }}
          className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
          title="Convert to Checklist"
        >
          <CheckSquare size={14} strokeWidth={2} />
        </button>

        <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 mx-1" />

        {/* Quick Copy */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            handleCopySelection();
          }}
          className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          title="Copy selected text"
        >
          {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
        </button>
      </div>

      {/* AI Quick Actions Sub-Menu */}
      {isAiMenuOpen && (
        <div
          ref={aiMenuRef}
          className="w-76 p-2 rounded-2xl bg-white/95 dark:bg-[#1c1c20]/95 backdrop-blur-2xl border border-slate-200/90 dark:border-zinc-700/80 shadow-[0_16px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_48px_rgba(0,0,0,0.7)] text-slate-800 dark:text-zinc-100 animate-in fade-in slide-in-from-top-2 duration-150 space-y-1"
        >
          {/* Natural prompt input */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100/80 dark:bg-zinc-800/80 border border-slate-200/70 dark:border-zinc-700/60 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500/20 mb-1.5">
            <Search size={12} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && customPrompt.trim()) {
                  e.preventDefault();
                  handleAiAction("custom", customPrompt.trim());
                }
              }}
              placeholder="Ask AI to transform text..."
              className="w-full text-xs bg-transparent text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 outline-none"
            />
            {customPrompt.trim() && (
              <button
                type="button"
                disabled={isAiExecuting}
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleAiAction("custom", customPrompt.trim());
                }}
                className="p-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer shrink-0"
              >
                {activeAction === "custom" ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <CornerDownRight size={11} />
                )}
              </button>
            )}
          </div>

          <div className="px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">
            Quick AI Tools
          </div>

          {/* Action options */}
          {[
            { id: "improve", label: "Polish & Elevate", icon: Wand2, tip: "Enhance vocabulary, flow, and clarity" },
            { id: "proofread", label: "Fix Grammar & Typos", icon: CheckCheck, tip: "Clean up spelling, grammar, and phrasing" },
            { id: "summarize", label: "Summarize Excerpt", icon: FileText, tip: "Condense selection into key takeaways" },
            { id: "bullets", label: "Turn into Bullet Points", icon: List, tip: "Convert passage into structured bullets" },
            { id: "shorter", label: "Make Shorter", icon: Minimize2, tip: "Trim extra fluff" },
            { id: "longer", label: "Expand Thoughts", icon: Maximize2, tip: "Add depth, context, and nuance" },
          ].map((act) => {
            const Icon = act.icon;
            const isCurrent = activeAction === act.id && isAiExecuting;
            return (
              <button
                key={act.id}
                type="button"
                disabled={isAiExecuting}
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleAiAction(act.id);
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer disabled:opacity-50"
                title={act.tip}
              >
                <div className="flex items-center gap-2">
                  {isCurrent ? (
                    <Loader2 size={13} className="animate-spin text-amber-600 dark:text-amber-400" />
                  ) : (
                    <Icon size={13} className="text-slate-400 group-hover:text-amber-600 shrink-0" />
                  )}
                  <span className="font-medium">{act.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
