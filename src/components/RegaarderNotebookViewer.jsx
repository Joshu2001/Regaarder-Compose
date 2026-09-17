import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus, Moon, Sun, AlignLeft, Grid3X3, Circle, Layout } from "lucide-react";
import { RegaarderAiIcon } from "./RegaarderProductIcons";

// ─── Constants ─────────────────────────────────────────────────────────────────

const RULING_OPTIONS = [
  { id: "college",  label: "Ruled",  icon: AlignLeft },
  { id: "grid",     label: "Grid",   icon: Grid3X3  },
  { id: "dots",     label: "Dots",   icon: Circle   },
  { id: "plain",    label: "Plain",  icon: Layout   },
];

// Baseline spacing that locks all ruled paper variants to a shared rhythm.
const BASELINE_PX = 32;

// ─── Sub-components ────────────────────────────────────────────────────────────

/**
 * NoteNavigatorPanel — Collapsible left rail showing note entries.
 * Entry format: date + title + first-line snippet + optional color chip.
 */
function NoteNavigatorPanel({ documents, activeDoc, onSelectDoc, onNewNote, collapsed, onToggle }) {
  const entries = (documents || []).filter(d => d.isNotesDoc || d.mode === "notes");

  return (
    <div
      className="flex flex-col border-r shrink-0 transition-all duration-250"
      style={{
        width: collapsed ? 0 : 224,
        overflow: "hidden",
        borderColor: "rgba(0,0,0,0.07)",
        background: "rgba(250,249,247,0.95)",
      }}
    >
      {!collapsed && (
        <>
          {/* Rail header */}
          <div className="flex items-center justify-between px-3 pt-3 pb-2">
            <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: "rgba(0,0,0,0.32)" }}>
              Notes
            </span>
            <button
              onClick={onNewNote}
              className="flex items-center justify-center w-6 h-6 rounded-md transition-colors"
              style={{ color: "rgba(0,0,0,0.45)" }}
              title="New note"
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.06)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <Plus size={14} strokeWidth={2} />
            </button>
          </div>

          {/* Entry list */}
          <div className="flex-1 overflow-y-auto px-1.5 pb-3">
            {entries.length === 0 && (
              <p className="px-2 py-3 text-[12px]" style={{ color: "rgba(0,0,0,0.32)" }}>
                No notes yet
              </p>
            )}
            {entries.map(note => {
              const isActive = activeDoc?.id === note.id;
              const dateStr = note.createdAt
                ? new Date(note.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : "";
              const snippet = note.bodyHtml
                ? note.bodyHtml.replace(/<[^>]*>/g, "").slice(0, 60)
                : "Empty note";

              return (
                <button
                  key={note.id}
                  onClick={() => onSelectDoc(note.id)}
                  className="w-full text-left px-2 py-2 rounded-[6px] mb-0.5 transition-colors group"
                  style={{
                    background: isActive ? "rgba(217,119,6,0.09)" : "transparent",
                    border: isActive ? "1px solid rgba(217,119,6,0.18)" : "1px solid transparent",
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(0,0,0,0.04)"; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  <div className="flex items-center gap-1.5">
                    {note.color && (
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: note.color }} />
                    )}
                    <span
                      className="text-[12.5px] font-medium truncate leading-tight"
                      style={{ color: "rgba(0,0,0,0.78)" }}
                    >
                      {note.title || "Untitled"}
                    </span>
                  </div>
                  {dateStr && (
                    <span className="text-[10.5px] mt-0.5 block" style={{ color: "rgba(0,0,0,0.38)" }}>
                      {dateStr}
                    </span>
                  )}
                  <p
                    className="text-[11px] mt-0.5 truncate leading-snug"
                    style={{ color: "rgba(0,0,0,0.42)" }}
                  >
                    {snippet}
                  </p>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * AppearancePopover — Ruling mode + Night Paper toggle.
 * Anchored to the trigger button using getBoundingClientRect().
 */
function AppearancePopover({ ruling, onRulingChange, nightPaper, onNightPaperToggle, anchorRef, onClose }) {
  const popRef = useRef(null);

  useEffect(() => {
    const anchor = anchorRef.current;
    const pop = popRef.current;
    if (!anchor || !pop) return;

    const rect = anchor.getBoundingClientRect();
    pop.style.top = `${rect.bottom + 8}px`;
    pop.style.left = `${rect.left}px`;

    const handleOutside = (e) => {
      if (!pop.contains(e.target) && !anchor.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [anchorRef, onClose]);

  return (
    <div
      ref={popRef}
      className="fixed z-50 rounded-[10px] shadow-xl border p-3"
      style={{
        background: "rgba(255,255,255,0.96)",
        borderColor: "rgba(0,0,0,0.09)",
        backdropFilter: "blur(12px)",
        width: 210,
      }}
    >
      <p className="text-[10.5px] font-semibold tracking-widest uppercase mb-2" style={{ color: "rgba(0,0,0,0.35)" }}>
        Paper Style
      </p>
      <div className="grid grid-cols-2 gap-1.5 mb-3">
        {RULING_OPTIONS.map(({ id, label, icon: Icon }) => {
          const active = ruling === id;
          return (
            <button
              key={id}
              onClick={() => onRulingChange(id)}
              className="flex items-center gap-2 px-2.5 py-2 rounded-[6px] text-[12px] font-medium transition-colors"
              style={{
                background: active ? "rgba(217,119,6,0.1)" : "rgba(0,0,0,0.04)",
                color: active ? "#D97706" : "rgba(0,0,0,0.65)",
                border: active ? "1px solid rgba(217,119,6,0.22)" : "1px solid transparent",
              }}
            >
              <Icon size={13} strokeWidth={active ? 2 : 1.6} />
              {label}
            </button>
          );
        })}
      </div>
      <div className="border-t pt-2.5" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
        <button
          onClick={onNightPaperToggle}
          className="flex items-center justify-between w-full px-1 py-1 rounded-md"
        >
          <div className="flex items-center gap-2">
            {nightPaper ? <Moon size={13} strokeWidth={1.6} style={{ color: "#6366F1" }} /> : <Sun size={13} strokeWidth={1.6} style={{ color: "#D97706" }} />}
            <span className="text-[12px] font-medium" style={{ color: "rgba(0,0,0,0.65)" }}>
              {nightPaper ? "Night Paper" : "Day Paper"}
            </span>
          </div>
          <div
            className="w-8 h-4 rounded-full transition-colors relative"
            style={{ background: nightPaper ? "#6366F1" : "rgba(0,0,0,0.14)" }}
          >
            <div
              className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform shadow-sm"
              style={{ transform: nightPaper ? "translateX(16px)" : "translateX(2px)" }}
            />
          </div>
        </button>
      </div>
    </div>
  );
}

/**
 * PaperCanvas — The ruled-paper hero area.
 * Draws the baseline grid via CSS background-image for performance.
 * Content is a native contentEditable div locked to the same baseline rhythm.
 */
function PaperCanvas({ ruling, nightPaper, title, onUpdateTitle, bodyHtml, onUpdateBodyHtml }) {
  const editorRef = useRef(null);
  const titleRef  = useRef(null);

  // Sync bodyHtml -> DOM only on external changes (avoids cursor jump)
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

  // Paper visual tokens
  const paper = {
    background: nightPaper ? "#1C1C1E" : "#FFFEF9",
    ruleColor:  nightPaper ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
    marginColor: nightPaper ? "rgba(220,80,70,0.3)" : "rgba(220,80,70,0.22)",
    textColor:  nightPaper ? "rgba(255,255,255,0.88)" : "rgba(0,0,0,0.84)",
    placeholderColor: nightPaper ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.22)",
    titleColor: nightPaper ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.88)",
  };

  // CSS background pattern based on ruling mode
  const getPaperPattern = () => {
    if (ruling === "plain") return "none";
    if (ruling === "grid") {
      return `
        linear-gradient(${paper.ruleColor} 1px, transparent 1px),
        linear-gradient(90deg, ${paper.ruleColor} 1px, transparent 1px)
      `;
    }
    if (ruling === "dots") {
      return `radial-gradient(circle, ${paper.ruleColor} 1.2px, transparent 1.2px)`;
    }
    // college ruled: horizontal lines only
    return `linear-gradient(${paper.ruleColor} 1px, transparent 1px)`;
  };

  const getPaperSize = () => {
    if (ruling === "dots") return `${BASELINE_PX}px ${BASELINE_PX}px`;
    if (ruling === "grid") return `${BASELINE_PX}px ${BASELINE_PX}px`;
    return `100% ${BASELINE_PX}px`;
  };

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div
      className="flex-1 overflow-y-auto relative"
      style={{ background: paper.background }}
    >
      {/* Ruled paper pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: getPaperPattern(),
          backgroundSize: getPaperSize(),
          backgroundPosition: `0 ${BASELINE_PX + 80}px`,
        }}
      />

      {/* Vertical margin rule - fixed at 64px from paper left edge */}
      {(ruling === "college" || ruling === "plain") && (
        <div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{ left: 64, width: 1, background: paper.marginColor }}
        />
      )}

      {/* Paper content column */}
      <div className="relative mx-auto" style={{ maxWidth: 680, padding: "40px 48px 80px 80px" }}>
        {/* Date header */}
        <p
          className="text-[11.5px] font-medium tracking-wide mb-3 select-none"
          style={{ color: paper.placeholderColor }}
        >
          {today}
        </p>

        {/* Note title */}
        <input
          ref={titleRef}
          type="text"
          value={title || ""}
          onChange={e => onUpdateTitle?.(e.target.value)}
          onKeyDown={handleTitleKeyDown}
          placeholder="Untitled"
          className="w-full bg-transparent border-none outline-none font-bold mb-6 leading-tight"
          style={{
            fontSize: 26,
            color: paper.titleColor,
            caretColor: "#D97706",
            fontFamily: "'New York', 'Georgia', 'Times New Roman', serif",
          }}
        />

        {/* Body editor */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleEditorInput}
          className="outline-none w-full min-h-[400px] leading-8"
          style={{
            fontSize: 15,
            lineHeight: `${BASELINE_PX}px`,
            color: paper.textColor,
            caretColor: "#D97706",
            fontFamily: "'New York', 'Georgia', 'Times New Roman', serif",
            wordBreak: "break-word",
          }}
          data-placeholder="Start writing..."
        />
      </div>
    </div>
  );
}

// --- Main Component -------------------------------------------------------------

/**
 * RegaarderNotebookViewer
 *
 * Hero ruled-paper canvas for Regaarder Notes.
 * Follows the PDF viewer integration pattern (isPdfDoc / isNotesDoc flag).
 *
 * Props:
 *   activeDoc        - current doc object ({ id, title, bodyHtml, ruling, isNotesDoc, ... })
 *   onUpdateBodyHtml - (html: string) => void
 *   onUpdateTitle    - (title: string) => void
 *   documents        - all docs in the workspace
 *   onSelectDoc      - (id: string) => void
 *   onNewNote        - () => void  - create a fresh note
 *   isDarkMode       - boolean
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
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [ruling, setRuling] = useState(activeDoc?.ruling || "college");
  const [nightPaper, setNightPaper] = useState(isDarkMode || false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const appearanceTriggerRef = useRef(null);

  const handleRulingChange = useCallback((r) => {
    setRuling(r);
    onUpdateBodyHtml?.(activeDoc?.bodyHtml || "");
  }, [activeDoc, onUpdateBodyHtml]);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden" style={{ background: nightPaper ? "#1C1C1E" : "#FFFEF9" }}>
      {/* Toolbar */}
      <div
        className="flex items-center gap-2 px-3 shrink-0 border-b"
        style={{
          height: 44,
          borderColor: nightPaper ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
          background: nightPaper ? "rgba(28,28,30,0.92)" : "rgba(255,254,249,0.92)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Navigator toggle */}
        <button
          onClick={() => setNavCollapsed(v => !v)}
          className="flex items-center justify-center w-7 h-7 rounded-[6px] transition-colors shrink-0"
          style={{ color: nightPaper ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.38)" }}
          title={navCollapsed ? "Show navigator" : "Hide navigator"}
          onMouseEnter={e => (e.currentTarget.style.background = nightPaper ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          {navCollapsed ? <ChevronRight size={15} strokeWidth={2} /> : <ChevronLeft size={15} strokeWidth={2} />}
        </button>

        {/* Appearance selector */}
        <button
          ref={appearanceTriggerRef}
          onClick={() => setAppearanceOpen(v => !v)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-medium transition-colors"
          style={{
            color: nightPaper ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.48)",
            background: appearanceOpen ? (nightPaper ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.06)") : "transparent",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = nightPaper ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)")}
          onMouseLeave={e => {
            if (!appearanceOpen) e.currentTarget.style.background = "transparent";
          }}
        >
          <Layout size={13} strokeWidth={1.6} />
          {RULING_OPTIONS.find(r => r.id === ruling)?.label || "Ruled"}
        </button>

        <div className="flex-1" />

        {/* AI entry - Regaarder Circle AI Signature */}
        <button
          className="flex items-center justify-center w-7 h-7 rounded-[6px] transition-colors"
          style={{ color: nightPaper ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.38)" }}
          title="AI suggestions"
          onMouseEnter={e => (e.currentTarget.style.background = nightPaper ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <RegaarderAiIcon size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <NoteNavigatorPanel
          documents={documents}
          activeDoc={activeDoc}
          onSelectDoc={onSelectDoc}
          onNewNote={onNewNote}
          collapsed={navCollapsed}
          onToggle={() => setNavCollapsed(v => !v)}
        />

        <PaperCanvas
          ruling={ruling}
          nightPaper={nightPaper}
          title={activeDoc?.title}
          onUpdateTitle={onUpdateTitle}
          bodyHtml={activeDoc?.bodyHtml || ""}
          onUpdateBodyHtml={onUpdateBodyHtml}
        />
      </div>

      {/* Appearance Popover */}
      {appearanceOpen && (
        <AppearancePopover
          ruling={ruling}
          onRulingChange={handleRulingChange}
          nightPaper={nightPaper}
          onNightPaperToggle={() => setNightPaper(v => !v)}
          anchorRef={appearanceTriggerRef}
          onClose={() => setAppearanceOpen(false)}
        />
      )}
    </div>
  );
}
