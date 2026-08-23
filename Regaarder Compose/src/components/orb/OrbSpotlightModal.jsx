import React, { useState, useEffect, useRef } from "react";
import { Search, Sparkles, X, ArrowRight, Loader2 } from "lucide-react";
import { OrbIcon } from "../RegaarderProductIcons";

export default function OrbSpotlightModal({
  isOpen,
  onClose,
  initialQuery = "",
  initialMode = "all",
  onCallAi,
  aiProviderConfig,
  liveWorkspaceContext = {},
  onNavigateToEntity,
}) {
  const [query, setQuery] = useState(initialQuery || "");
  const [isLoading, setIsLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery || "");
      setAiAnswer("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialQuery, initialMode]);

  if (!isOpen) return null;

  const handleAskOrb = async (e) => {
    e?.preventDefault();
    if (!query.trim() || isLoading) return;
    setIsLoading(true);
    setAiAnswer("");

    try {
      if (onCallAi) {
        const res = await onCallAi({
          userPrompt: query,
          systemPrompt: "You are Regaarder Orb, the unified cross-workspace executive AI. Synthesize information across Docs, Sheets, Decks, Tasks, and Schedule. Provide direct, concise answers with actionable links or citations where relevant.",
        });
        if (res && res.text) {
          setAiAnswer(res.text.trim());
        } else {
          setAiAnswer(res?.error || "Orb could not generate a response. Please check your AI configuration.");
        }
      } else {
        setAiAnswer("Orb AI service is currently unavailable.");
      }
    } catch (err) {
      setAiAnswer(err?.message || "Failed to query Orb AI.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-start justify-center pt-24 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleAskOrb} className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-zinc-800 gap-3">
          <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
            <OrbIcon size={18} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask Orb across Docs, Sheets, Decks, Tasks..."
            className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium text-slate-800 dark:text-zinc-100 placeholder:text-slate-400"
          />
          {isLoading ? (
            <Loader2 size={18} className="animate-spin text-violet-500 shrink-0" />
          ) : query.trim() ? (
            <button
              type="submit"
              className="p-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors shrink-0"
            >
              <ArrowRight size={14} />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </form>
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {aiAnswer ? (
            <div className="p-4 rounded-xl bg-violet-50/60 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40 text-sm text-slate-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
              <div className="flex items-center gap-2 mb-2 text-violet-600 dark:text-violet-400 font-semibold text-xs uppercase tracking-wider">
                <Sparkles size={13} /> Orb Intelligence Response
              </div>
              {aiAnswer}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 dark:text-zinc-500 text-xs">
              Type a prompt or question to search across all your workspaces in Regaarder.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
