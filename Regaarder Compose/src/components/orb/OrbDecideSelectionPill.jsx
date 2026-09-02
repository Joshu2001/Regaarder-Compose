import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Sparkles, MessageSquare, HelpCircle, Scale, Copy, 
  Check, ArrowRight, CornerDownLeft, X, ChevronDown, ChevronUp
} from 'lucide-react';

/**
 * Intelligent contextual follow-up inquiry generator based on highlighted text semantics
 */
export function generateFollowUpInquiries(selectedText = '') {
  const text = (selectedText || '').trim();
  if (!text) return [];

  const lower = text.toLowerCase();
  const inquiries = [];

  const hasNumbers = /\d+%|\$[\d,.]+|\b\d+(\.\d+)?[xXkKmMbB]?\b/.test(text) || 
                     /(revenue|margin|arr|mrr|growth|churn|cac|ltv|cost|budget|conversion|ebitda)/i.test(text);
  const hasRisks = /(risk|conflict|discrepancy|bottleneck|delay|gap|contradiction|concern|vulnerability|uncertainty|fail)/i.test(text);
  const hasStrategy = /(recommend|strategy|roadmap|launch|hire|allocate|pivot|decision|execute|goal|objective|deliverable)/i.test(text);

  // 1. Metric / Quantitative Heuristic
  if (hasNumbers) {
    inquiries.push(`What sensitivity factors or stress scenarios could alter these figures?`);
    inquiries.push(`Which workspace sheet or baseline data verifies this metric?`);
  }

  // 2. Risk / Contradiction Heuristic
  if (hasRisks) {
    inquiries.push(`What concrete operational mitigation addresses this risk?`);
    inquiries.push(`What cross-document evidence indicates why this discrepancy exists?`);
  }

  // 3. Strategic / Action Heuristic
  if (hasStrategy) {
    inquiries.push(`What are the critical dependencies required before executing this?`);
    inquiries.push(`What leading indicators will signal if this recommendation succeeds or fails?`);
  }

  // Fallbacks if fewer than 3 inquiries
  if (inquiries.length < 3) {
    inquiries.push(`Explain the strategic implications and background of this excerpt.`);
  }
  if (inquiries.length < 3) {
    inquiries.push(`What workspace evidence supports or challenges this claim?`);
  }
  if (inquiries.length < 3) {
    inquiries.push(`How does this impact our executive roadmap and resource allocation?`);
  }

  return inquiries.slice(0, 3);
}

/**
 * OrbDecideSelectionPill - Apple-style Floating Selection Toolbar
 * 
 * Appears directly anchored over highlighted text in Orb Decide with:
 * - Direct Actions: Reply (quotes into inquiry bar), Explain, Challenge, Copy
 * - Contextual Follow-Up Inquiries: 2-3 tailored executive follow-up questions
 */
export default function OrbDecideSelectionPill({
  selectionState,
  onReply,
  onExplain,
  onChallenge,
  onAskQuestion,
  onDismiss
}) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const pillRef = useRef(null);

  const selectedText = selectionState?.text || '';
  const followUpQuestions = useMemo(() => generateFollowUpInquiries(selectedText), [selectedText]);

  // Handle Copy to Clipboard
  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(selectedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.warn('Failed to copy selected text:', err);
    }
  };

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onDismiss?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDismiss]);

  if (!selectionState || !selectedText) return null;

  const { x, y, isFlipped } = selectionState;

  // Truncated preview of selected text
  const previewText = selectedText.length > 55 ? `${selectedText.slice(0, 52)}...` : selectedText;

  return (
    <div
      ref={pillRef}
      style={{
        position: 'fixed',
        left: `${x}px`,
        top: `${y}px`,
        zIndex: 9999
      }}
      className={`transform -translate-x-1/2 ${
        isFlipped ? 'translate-y-2' : '-translate-y-full -mt-2.5'
      } pointer-events-auto select-none animate-in fade-in zoom-in-95 duration-150`}
    >
      <div className="w-[330px] sm:w-[380px] rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-zinc-700/80 shadow-[0_12px_36px_rgba(0,0,0,0.18)] p-1.5 space-y-1.5 transition-all">
        
        {/* ── Top Primary Action Row ── */}
        <div className="flex items-center justify-between gap-1 p-0.5">
          
          {/* Reply Button (Populates quote into inquiry bar) */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onReply?.(selectedText);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#7C5ACF] hover:bg-[#6c48c5] text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Reply to highlighted text in inquiry conversation"
          >
            <MessageSquare size={12} className="shrink-0" />
            <span>Reply</span>
          </button>

          {/* Explain Button */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onExplain?.(selectedText);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            title="Explain this strategic excerpt in detail"
          >
            <HelpCircle size={12} className="text-[#7C5ACF] dark:text-[#a78bfa] shrink-0" />
            <span>Explain</span>
          </button>

          {/* Challenge / Counterargument Button */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onChallenge?.(selectedText);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            title="Stress-test and challenge this claim"
          >
            <Scale size={12} className="text-amber-500 shrink-0" />
            <span>Challenge</span>
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onPointerDown={handleCopy}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            title={copied ? "Copied!" : "Copy excerpt"}
          >
            {copied ? (
              <Check size={13} className="text-emerald-500" />
            ) : (
              <Copy size={13} />
            )}
          </button>

          {/* Toggle Questions */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            }}
            className={`p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${
              isExpanded ? 'text-[#7C5ACF] dark:text-[#a78bfa]' : 'text-slate-400'
            }`}
            title={isExpanded ? "Collapse follow-up questions" : "Show follow-up questions"}
          >
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {/* Dismiss */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onDismiss?.();
            }}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
            title="Dismiss selection toolbar"
          >
            <X size={13} />
          </button>
        </div>

        {/* ── Contextual Follow-Up Inquiries Section ── */}
        {isExpanded && (
          <div className="pt-1.5 border-t border-black/[0.04] dark:border-white/[0.05] space-y-1 animate-in fade-in duration-100">
            {/* Header with Quote Context */}
            <div className="flex items-center justify-between px-1.5 py-0.5 text-[10px] text-slate-400 dark:text-zinc-500">
              <span className="flex items-center gap-1 font-semibold uppercase tracking-wider text-[#7C5ACF] dark:text-[#a78bfa]">
                <Sparkles size={10} />
                <span>Suggested Follow-Ups</span>
              </span>
              <span className="truncate max-w-[170px] italic font-normal">
                "{previewText}"
              </span>
            </div>

            {/* Inquiries List */}
            <div className="space-y-1 max-h-[160px] overflow-y-auto thin-scrollbar pr-0.5">
              {followUpQuestions.map((inquiry, idx) => (
                <button
                  key={idx}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    onAskQuestion?.(inquiry, selectedText);
                  }}
                  className="w-full text-left p-2 rounded-xl bg-slate-50/80 hover:bg-violet-50/80 dark:bg-zinc-800/60 dark:hover:bg-violet-950/40 border border-slate-200/50 dark:border-zinc-700/50 hover:border-violet-300 dark:hover:border-violet-800/80 transition-all text-[11.5px] text-slate-700 dark:text-zinc-200 hover:text-violet-950 dark:hover:text-violet-200 flex items-center justify-between gap-2 group cursor-pointer"
                >
                  <span className="leading-snug">{inquiry}</span>
                  <ArrowRight size={11} className="text-slate-400 group-hover:text-[#7C5ACF] dark:group-hover:text-[#a78bfa] shrink-0 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
