import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, BookOpen, Link, Sparkles, ChevronRight, AlertCircle, Loader2, Check } from "lucide-react";

// ---------------------------------------------------------------------------
// CitationPopover — Controlled component.
// All insertion goes through onInsert(sourceData).
// Never touches the DOM, never calls execCommand, never generates HTML.
// ---------------------------------------------------------------------------

const TABS = [
  { id: "manual", label: "Manual Entry", icon: BookOpen },
  { id: "url",    label: "URL / DOI",    icon: Link },
  { id: "ai",     label: "Ask AI",       icon: Sparkles },
];

const EMPTY_FORM = { title: "", authors: "", year: "", publisher: "", url: "", doi: "" };

/** Extract a DOI from a raw string (plain DOI or doi.org URL). */
function parseDOI(raw) {
  if (!raw) return "";
  const match = raw.match(/10\.\d{4,}[\S]+/);
  return match ? match[0] : "";
}

/** Resolve structured metadata from a DOI via the CrossRef public API. */
async function resolveFromDOI(doi) {
  try {
    const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
    if (!res.ok) return null;
    const json = await res.json();
    const work = json.message;
    const authors = (work.author || [])
      .map((a) => `${a.family ?? ""}, ${(a.given ?? "")[0] ?? ""}`.trim())
      .filter(Boolean)
      .join("; ");
    const year = work.published?.["date-parts"]?.[0]?.[0]
      ?? work["published-print"]?.["date-parts"]?.[0]?.[0]
      ?? "";
    return {
      title: work.title?.[0] ?? "",
      authors,
      year: String(year),
      publisher: work.publisher ?? work["container-title"]?.[0] ?? "",
      url: work.URL ?? work.resource?.primary?.URL ?? "",
      doi,
    };
  } catch { return null; }
}

/**
 * Deduplicate: DOI match > URL match > title+authors match.
 * Returns the existing DocSource or null.
 */
function findDuplicate(data, existing) {
  for (const s of existing) {
    if (data.doi && s.doi && data.doi.trim().toLowerCase() === s.doi.trim().toLowerCase()) return s;
    if (data.url && s.url && data.url.trim().toLowerCase() === s.url.trim().toLowerCase()) return s;
    if (data.title && data.authors &&
        data.title.trim().toLowerCase() === s.title.trim().toLowerCase() &&
        data.authors.trim().toLowerCase() === s.authors.trim().toLowerCase()) return s;
  }
  return null;
}

// ---------------------------------------------------------------------------

export default function CitationPopover({
  isOpen,
  anchorRect,
  selectedText,
  existingSources,
  onInsert,
  onClose,
}) {
  const [activeTab,   setActiveTab]   = useState("manual");
  const [form,        setForm]        = useState({ ...EMPTY_FORM });
  const [urlInput,    setUrlInput]    = useState("");
  const [urlStatus,   setUrlStatus]   = useState(null);
  const [urlPreview,  setUrlPreview]  = useState(null);
  const [aiStatus,    setAiStatus]    = useState(null);
  const [aiPreview,   setAiPreview]   = useState(null);
  const [duplicate,   setDuplicate]   = useState(null);
  const [errors,      setErrors]      = useState({});
  const firstInputRef = useRef(null);

  // Reset when popover opens
  useEffect(() => {
    if (!isOpen) return;
    setActiveTab("manual");
    setForm({ ...EMPTY_FORM });
    setUrlInput(""); setUrlStatus(null); setUrlPreview(null);
    setAiStatus(null); setAiPreview(null); setDuplicate(null); setErrors({});
    setTimeout(() => firstInputRef.current?.focus(), 60);
  }, [isOpen]);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Re-calculate position on window resize / fullscreen toggle
  const [, setResizeTick] = useState(0);
  useEffect(() => {
    if (!isOpen) return;
    const onResize = () => setResizeTick((t) => t + 1);
    window.addEventListener("resize", onResize);
    document.addEventListener("fullscreenchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("fullscreenchange", onResize);
    };
  }, [isOpen]);

  // Compute position anchored below the trigger button with strict viewport bounds
  const style = (() => {
    const W = 420;
    const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;

    // Check if anchorRect is missing, zero, or off-screen (e.g. after exiting fullscreen or when toolbar is hidden)
    const isAnchorInvalid =
      !anchorRect ||
      (anchorRect.top === 0 && anchorRect.bottom === 0) ||
      anchorRect.bottom <= 0 ||
      anchorRect.top >= vh - 20 ||
      anchorRect.right <= 0 ||
      anchorRect.left >= vw;

    if (isAnchorInvalid) {
      const left = Math.max(16, Math.min(vw - W - 16, (vw - W) / 2));
      const top = Math.max(16, Math.min(vh - 200, 120));
      const maxHeight = Math.max(220, vh - top - 24);
      return { top, left, width: W, maxHeight };
    }

    let left = anchorRect.left;
    if (left + W > vw - 16) left = vw - W - 16;
    if (left < 16) left = 16;

    // Default: position below the trigger button
    let top = anchorRect.bottom + 8;
    let maxHeight = vh - top - 16;

    // If space below is extremely tight (< 220px) AND there is significantly more space above, flip above
    const spaceAbove = anchorRect.top - 16;
    if (maxHeight < 220 && spaceAbove > maxHeight) {
      top = Math.max(16, anchorRect.top - 480 - 8);
      maxHeight = anchorRect.top - top - 8;
    }

    // Strict boundary enforcement: NEVER position off-screen top or bottom
    top = Math.max(16, Math.min(vh - 200, top));
    maxHeight = Math.max(220, Math.min(vh - top - 16, maxHeight));

    return { top, left, width: W, maxHeight };
  })();


  const setField = useCallback((field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  }, []);

  const validate = (data) => {
    const e = {};
    if (!data.title?.trim())   e.title   = "Title is required";
    if (!data.authors?.trim()) e.authors  = "Authors are required";
    if (!data.year?.trim())    e.year     = "Year is required";
    if (!data.url?.trim() && !data.doi?.trim()) e.url = "URL or DOI is required";
    return e;
  };

  // Tab 2 — resolve URL/DOI
  const handleResolveUrl = useCallback(async () => {
    const raw = urlInput.trim();
    if (!raw) return;
    setUrlStatus("loading"); setUrlPreview(null);
    const doi = parseDOI(raw);
    if (doi) {
      const result = await resolveFromDOI(doi);
      if (result) { setUrlPreview(result); setUrlStatus("resolved"); return; }
    }
    // Fallback: pre-populate URL field, let user complete remaining fields
    setUrlPreview({ ...EMPTY_FORM, url: raw, doi });
    setUrlStatus("resolved");
  }, [urlInput]);

  // Tab 3 — Ask AI
  const handleAskAI = useCallback(async () => {
    setAiStatus("searching"); setAiPreview(null);
    if (!window.__citationAISearch) { setAiStatus("not_found"); return; }
    try {
      const result = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("timeout")), 20000);
        window.__citationAIRespond = (payload) => {
          clearTimeout(timeout);
          delete window.__citationAIRespond;
          resolve(payload);
        };
        window.__citationAISearch({
          selectedText,
          instruction:
            "Search attached/context sources, then verified web sources. " +
            "Return structured JSON only via window.__citationAIRespond(). " +
            "Never fabricate. If nothing found: { \"error\": \"No reliable source found.\" }",
        });
      });
      if (result?.error || !result?.title || !result?.authors || result.confidence === "low") {
        setAiStatus("not_found");
        return;
      }
      setAiPreview(result);
      setAiStatus("found");
    } catch { setAiStatus("not_found"); }
  }, [selectedText]);

  // Final insertion — delegates entirely to onInsert()
  const handleInsert = useCallback(() => {
    let sourceData;
    if (activeTab === "manual") {
      const errs = validate(form);
      if (Object.keys(errs).length > 0) { setErrors(errs); return; }
      sourceData = { ...form };
    } else if (activeTab === "url") {
      if (!urlPreview) return;
      const merged = { ...EMPTY_FORM, ...urlPreview };
      const errs = validate(merged);
      if (Object.keys(errs).length > 0) { setErrors(errs); return; }
      sourceData = merged;
    } else if (activeTab === "ai") {
      if (!aiPreview) return;
      sourceData = { ...aiPreview };
    }
    if (!sourceData) return;
    const dup = findDuplicate(sourceData, existingSources);
    if (dup) setDuplicate(dup);
    onInsert({ ...sourceData, citationStyle: "vancouver", _duplicate: dup ?? null });
    onClose();
  }, [activeTab, form, urlPreview, aiPreview, existingSources, onInsert, onClose]);

  if (!isOpen) return null;

  const FieldRow = ({ label, field, half, placeholder, required }) => (
    <div className={"citation-form__row" + (half ? " citation-form__row--half-item" : "")}>
      <label className="citation-form__label">{label}{required ? " *" : ""}</label>
      <input
        className={"citation-form__input" + (errors[field] ? " citation-form__input--error" : "")}
        placeholder={placeholder}
        value={form[field]}
        onChange={(e) => setField(field, e.target.value)}
      />
      {errors[field] && <span className="citation-form__error">{errors[field]}</span>}
    </div>
  );

  return createPortal(
    <>
      {/* Transparent scrim — click outside closes */}
      <div className="citation-popover-scrim" onPointerDown={onClose} aria-hidden="true" />

      <div
        className="citation-popover"
        style={{
          position: "fixed",
          top: style.top,
          left: style.left,
          width: style.width,
          maxHeight: style.maxHeight,
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Insert Citation"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="citation-popover__header">
          <div className="citation-popover__title">
            <BookOpen size={15} />
            Insert Citation
          </div>
          <button className="citation-popover__close" onClick={onClose} aria-label="Close citation popover">
            <X size={15} />
          </button>
        </div>

        {/* Citing context */}
        {selectedText && (
          <div className="citation-popover__context">
            <span className="citation-popover__context-label">Citing:</span>
            <span className="citation-popover__context-text">
              &ldquo;{selectedText.length > 80 ? selectedText.slice(0, 80) + "\u2026" : selectedText}&rdquo;
            </span>
          </div>
        )}

        {/* Duplicate source notice */}
        {duplicate && (
          <div className="citation-popover__duplicate-notice">
            <Check size={13} />
            Source already in document — it will be reused with the same reference number.
          </div>
        )}

        {/* Tabs — slightly-rounded rectangles per design system */}
        <div className="citation-popover__tabs">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={"citation-tab-btn" + (activeTab === id ? " citation-tab-btn--active" : "")}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="citation-popover__body">

          {/* Tab 1: Manual Entry */}
          {activeTab === "manual" && (
            <div className="citation-form">
              <div className="citation-form__row">
                <label className="citation-form__label">Authors *</label>
                <input
                  ref={firstInputRef}
                  className={"citation-form__input" + (errors.authors ? " citation-form__input--error" : "")}
                  placeholder="e.g. Smith J, Jones K; Patel R"
                  value={form.authors}
                  onChange={(e) => setField("authors", e.target.value)}
                />
                {errors.authors && <span className="citation-form__error">{errors.authors}</span>}
              </div>
              <div className="citation-form__row">
                <label className="citation-form__label">Title *</label>
                <input
                  className={"citation-form__input" + (errors.title ? " citation-form__input--error" : "")}
                  placeholder="e.g. The Impact of Remote Work on Productivity"
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                />
                {errors.title && <span className="citation-form__error">{errors.title}</span>}
              </div>
              <div className="citation-form__row citation-form__row--half">
                <div>
                  <label className="citation-form__label">Year *</label>
                  <input
                    className={"citation-form__input" + (errors.year ? " citation-form__input--error" : "")}
                    placeholder="2024" maxLength={4}
                    value={form.year}
                    onChange={(e) => setField("year", e.target.value)}
                  />
                  {errors.year && <span className="citation-form__error">{errors.year}</span>}
                </div>
                <div>
                  <label className="citation-form__label">Publisher / Journal</label>
                  <input
                    className="citation-form__input"
                    placeholder="e.g. Nature, Springer"
                    value={form.publisher}
                    onChange={(e) => setField("publisher", e.target.value)}
                  />
                </div>
              </div>
              <div className="citation-form__row citation-form__row--half">
                <div>
                  <label className="citation-form__label">URL</label>
                  <input
                    className={"citation-form__input" + (errors.url ? " citation-form__input--error" : "")}
                    placeholder="https://..."
                    value={form.url}
                    onChange={(e) => setField("url", e.target.value)}
                  />
                </div>
                <div>
                  <label className="citation-form__label">DOI</label>
                  <input
                    className="citation-form__input"
                    placeholder="10.xxxx/xxxx"
                    value={form.doi}
                    onChange={(e) => setField("doi", e.target.value)}
                  />
                </div>
              </div>
              {errors.url && <span className="citation-form__error">{errors.url}</span>}
            </div>
          )}

          {/* Tab 2: URL / DOI */}
          {activeTab === "url" && (
            <div className="citation-form">
              <div className="citation-form__row">
                <label className="citation-form__label">Paste a URL or DOI</label>
                <div className="citation-url-row">
                  <input
                    ref={firstInputRef}
                    className="citation-form__input"
                    placeholder="https://doi.org/10.xxxx or https://..."
                    value={urlInput}
                    onChange={(e) => { setUrlInput(e.target.value); setUrlStatus(null); setUrlPreview(null); }}
                    onKeyDown={(e) => { if (e.key === "Enter") handleResolveUrl(); }}
                  />
                  <button
                    className="citation-url-resolve-btn"
                    onClick={handleResolveUrl}
                    disabled={!urlInput.trim() || urlStatus === "loading"}
                  >
                    {urlStatus === "loading"
                      ? <Loader2 size={13} className="citation-spin" />
                      : <ChevronRight size={13} />}
                  </button>
                </div>
              </div>

              {urlStatus === "resolved" && urlPreview && (
                <div className="citation-preview-card">
                  <div className="citation-preview-card__label">Preview — edit if needed before inserting</div>
                  {["title", "authors", "year", "publisher", "url", "doi"].map((field) => (
                    <div className="citation-form__row" key={field}>
                      <label className="citation-form__label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                      <input
                        className="citation-form__input"
                        value={urlPreview[field] ?? ""}
                        onChange={(e) => setUrlPreview((p) => ({ ...p, [field]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              )}

              {urlStatus === "error" && (
                <div className="citation-ai-error">
                  <AlertCircle size={13} />
                  Could not resolve this URL or DOI. Please try Manual Entry.
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Ask AI */}
          {activeTab === "ai" && (
            <div className="citation-form">
              <div className="citation-ai-context">
                <p className="citation-ai-context__desc">
                  The AI will search attached sources, then verified web sources, in order.
                  It will <strong>never fabricate</strong> a citation. If no real source is found,
                  it will report that clearly.
                </p>
                {selectedText && (
                  <blockquote className="citation-ai-context__quote">
                    &ldquo;{selectedText.length > 120 ? selectedText.slice(0, 120) + "\u2026" : selectedText}&rdquo;
                  </blockquote>
                )}
              </div>

              {aiStatus === null && (
                <button ref={firstInputRef} className="citation-ai-search-btn" onClick={handleAskAI}>
                  <Sparkles size={13} />
                  Find a supporting source
                </button>
              )}
              {aiStatus === "searching" && (
                <div className="citation-ai-loading">
                  <Loader2 size={16} className="citation-spin" />
                  <span>Searching attached sources and verified references\u2026</span>
                </div>
              )}
              {aiStatus === "not_found" && (
                <div className="citation-ai-error">
                  <AlertCircle size={15} />
                  <div>
                    <strong>No reliable source found</strong> supporting this claim.
                    <br />
                    <span>Use Manual Entry or URL/DOI to add a source yourself.</span>
                  </div>
                </div>
              )}
              {aiStatus === "found" && aiPreview && (
                <div className="citation-preview-card">
                  <div className="citation-preview-card__label">
                    <Check size={13} className="citation-preview-card__check" />
                    Source found — click &ldquo;Insert Citation&rdquo; to confirm
                  </div>
                  {[
                    ["Authors", aiPreview.authors],
                    ["Title",   aiPreview.title],
                    ["Year",    aiPreview.year],
                    ...(aiPreview.publisher ? [["Publisher", aiPreview.publisher]] : []),
                    ...(aiPreview.doi       ? [["DOI",       aiPreview.doi]]       : []),
                    ...(aiPreview.url && !aiPreview.doi ? [["URL", aiPreview.url]] : []),
                  ].map(([k, v]) => (
                    <div className="citation-preview-card__field" key={k}>
                      <span className="citation-preview-card__key">{k}</span>
                      <span className="citation-preview-card__val">{v}</span>
                    </div>
                  ))}
                  {aiPreview.confidence && aiPreview.confidence !== "high" && (
                    <div className="citation-preview-card__confidence">
                      Confidence: {aiPreview.confidence}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="citation-popover__footer">
          <button className="citation-btn citation-btn--ghost" onClick={onClose}>Cancel</button>
          <button
            className="citation-btn citation-btn--primary"
            id="citation-popover-insert-btn"
            onClick={handleInsert}
            disabled={
              (activeTab === "url" && !urlPreview) ||
              (activeTab === "ai"  && aiStatus !== "found")
            }
          >
            <BookOpen size={13} />
            Insert Citation
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
