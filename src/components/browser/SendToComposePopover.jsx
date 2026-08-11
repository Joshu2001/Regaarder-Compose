import React, { useState, useEffect } from 'react';
import { ComposeIcon } from '../RegaarderProductIcons';
import { BrowserCloseIcon, BrowserCheckIcon } from './RegaarderBrowserIcons';

/**
 * SendToComposePopover: Contextual Action popover for document capture & clipping into Regaarder Compose.
 * Follows Design Directive: ONE OBVIOUS ACTION → INTELLIGENT CONTEXT DETECTION → MINIMAL NECESSARY CHOICE → IMMEDIATE VISIBLE RESULT
 */
export const SendToComposePopover = ({
  anchorRect,
  activeTab,
  activeDocTitle = 'Untitled Document',
  onClose,
  onExecuteExport,
  showToast
}) => {
  const [hasSelection, setHasSelection] = useState(false);
  const [selectionWordCount, setSelectionWordCount] = useState(0);
  const [selectedSnippet, setSelectedSnippet] = useState('');

  // Mode & Capture options
  const [textFormatMode, setTextFormatMode] = useState('text'); // 'text', 'quote', 'summarize'
  const [noSelectionMode, setNoSelectionMode] = useState('main'); // 'main', 'article', 'table', 'page'
  const [destinationDoc, setDestinationDoc] = useState(
    activeDocTitle || `Research Notes — ${activeTab?.title || 'Webpage'}`
  );

  useEffect(() => {
    const sel = window.getSelection()?.toString().trim();
    if (sel && sel.length > 0) {
      setHasSelection(true);
      const words = sel.split(/\s+/).length;
      setSelectionWordCount(words);
      setSelectedSnippet(sel.slice(0, 120));
    } else {
      setHasSelection(false);
    }
  }, []);

  const handleExecute = () => {
    const capturedPayload = {
      sourceUrl: activeTab?.url || 'regaarder://research',
      sourceTitle: activeTab?.title || 'Web Page',
      destinationDoc,
      formatMode: hasSelection ? textFormatMode : noSelectionMode,
      hasSelection,
      contentSnippet: hasSelection ? selectedSnippet : `Captured ${noSelectionMode} content from ${activeTab?.title || 'page'}`
    };

    onExecuteExport(capturedPayload);
    onClose();
  };

  const topPos = anchorRect ? anchorRect.bottom + 6 : 60;
  const rightPos = anchorRect ? Math.max(16, window.innerWidth - anchorRect.right - 20) : 24;

  return (
    <div
      style={{ top: `${topPos}px`, right: `${rightPos}px` }}
      className="fixed z-50 w-[380px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden font-sans text-slate-100 animate-in fade-in zoom-in-95 duration-150 select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-400">
            <ComposeIcon size={16} />
          </div>
          <div>
            <h3 className="text-xs font-semibold tracking-tight text-slate-100">Send to Compose</h3>
            <p className="text-[10px] text-slate-400">Context-aware document clipping</p>
          </div>
        </div>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onClose();
          }}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <BrowserCloseIcon size={14} />
        </button>
      </div>

      {/* Body Content */}
      <div className="p-4 space-y-4 max-h-[440px] overflow-y-auto no-scrollbar">
        {/* STEP 1: CONTEXT RECOGNITION */}
        {hasSelection ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-violet-300 font-semibold">
              <span>Selected Text Detected ({selectionWordCount} words)</span>
              <BrowserCheckIcon size={14} />
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 italic">
              "{selectedSnippet}..."
            </div>

            <div className="space-y-1 pt-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Format Option:
              </label>
              <div className="space-y-1">
                {[
                  { id: 'text', label: 'Insert as plain text', desc: 'Preserve readable formatting & paragraph layout' },
                  { id: 'quote', label: 'Insert as blockquote', desc: 'Format as styled callout quote with citation' },
                  { id: 'summarize', label: 'Summarize first', desc: 'Synthesize key insights into concise bullet points' }
                ].map((opt) => (
                  <label
                    key={opt.id}
                    onPointerDown={() => setTextFormatMode(opt.id)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      textFormatMode === opt.id
                        ? 'bg-violet-500/10 border-violet-500/40 text-slate-100'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <input
                      type="radio"
                      name="formatOption"
                      checked={textFormatMode === opt.id}
                      onChange={() => setTextFormatMode(opt.id)}
                      className="mt-0.5 text-violet-600 focus:ring-0 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-200">{opt.label}</span>
                      <span className="text-[10px] text-slate-400">{opt.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              What would you like to capture?
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'main', label: 'Main Content', desc: 'Primary body text' },
                { id: 'article', label: 'Full Article', desc: 'Full narrative read' },
                { id: 'table', label: 'Key Tables', desc: 'Extracted matrices' },
                { id: 'page', label: 'Entire Page', desc: 'Full DOM snapshot' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setNoSelectionMode(item.id);
                  }}
                  className={`flex flex-col text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                    noSelectionMode === item.id
                      ? 'bg-violet-500/15 border-violet-500/50 text-violet-300'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <span className="text-xs font-semibold">{item.label}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: DESTINATION */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Target Document:
          </label>
          <input
            type="text"
            value={destinationDoc}
            onChange={(e) => setDestinationDoc(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-violet-500/80 font-medium"
          />
        </div>
      </div>

      {/* Footer Action */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/90 border-t border-slate-800">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onClose();
          }}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            handleExecute();
          }}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
        >
          <ComposeIcon size={14} />
          <span>Send to Compose</span>
        </button>
      </div>
    </div>
  );
};

export default SendToComposePopover;
