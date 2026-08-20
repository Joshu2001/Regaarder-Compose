import React, { useState } from 'react';
import { 
  Layers, Sparkles, ArrowRight, ExternalLink, Link2, 
  FileText, Table, Presentation, Video, CheckSquare, Clock,
  ShieldCheck, AlertCircle, HelpCircle, Check, Compass, Eye
} from 'lucide-react';
import { RegaarderProductIcon } from '../RegaarderProductIcons';

export default function OrbUnderstandPanel({
  selectedEdge,
  selectedEntity,
  entities = [],
  edges = [],
  onSelectEdge,
  onSelectEntity,
  onNavigateToWorkspace
}) {
  // Find active edge or fallback to first connected edge
  const activeEdge = selectedEdge || (selectedEntity 
    ? edges.find(e => e.sourceId === selectedEntity.id || e.targetId === selectedEntity.id)
    : edges[0]);

  const sourceEntity = activeEdge ? entities.find(e => e.id === activeEdge.sourceId) : null;
  const targetEntity = activeEdge ? entities.find(e => e.id === activeEdge.targetId) : null;

  return (
    <div className="flex h-full w-full overflow-hidden bg-slate-50/50 dark:bg-zinc-900/30">
      {/* ── Left Rail: List of Connected Semantic Relationships ── */}
      <div className="w-[320px] flex flex-col border-r border-slate-200/80 dark:border-zinc-800 shrink-0 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md">
        <div className="p-4 border-b border-slate-200/70 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-zinc-100 uppercase tracking-wider">
            <Layers size={14} className="text-violet-600 dark:text-violet-400" />
            <span>Semantic Linkages</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
            Provenance & evidence supporting cross-workspace connections.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 thin-scrollbar">
          {edges.map(edge => {
            const isSelected = activeEdge?.id === edge.id;
            const src = entities.find(e => e.id === edge.sourceId);
            const tgt = entities.find(e => e.id === edge.targetId);

            return (
              <button
                key={edge.id}
                type="button"
                onClick={() => onSelectEdge(edge)}
                className={`w-full text-left p-3 rounded-xl border transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'border-[#7C5ACF] bg-[#7C5ACF]/[0.08] dark:bg-[#7C5ACF]/[0.18] shadow-xs'
                    : 'border-slate-200/70 dark:border-zinc-800 bg-white/80 dark:bg-zinc-800/60 hover:bg-slate-100 dark:hover:bg-zinc-700/60'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                    edge.isAiInferred
                      ? 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300'
                  }`}>
                    {edge.isAiInferred ? 'AI Inferred' : 'Explicit Link'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {Math.round((edge.confidenceScore || 1) * 100)}% conf
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100 line-clamp-2 mb-1.5 leading-snug">
                  {edge.label || edge.relationType}
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                  <span className="font-medium text-slate-700 dark:text-zinc-300 truncate max-w-[90px]">
                    {src?.title || 'Source'}
                  </span>
                  <ArrowRight size={11} className="shrink-0 text-slate-400" />
                  <span className="font-medium text-slate-700 dark:text-zinc-300 truncate max-w-[90px]">
                    {tgt?.title || 'Target'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right Panel: Deep Relationship Inspector & Evidence View ── */}
      <div className="flex-1 overflow-y-auto p-8 thin-scrollbar">
        {!activeEdge ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
            <Compass size={40} className="mb-2 text-slate-300" />
            <span className="text-sm font-semibold text-slate-700">Select a relationship to inspect evidence</span>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Header Badge & Title */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg ${
                    activeEdge.isAiInferred
                      ? 'bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  }`}>
                    {activeEdge.isAiInferred ? <Sparkles size={13} /> : <ShieldCheck size={13} />}
                    <span>{activeEdge.isAiInferred ? 'AI Inferred Semantic Relationship' : 'Verified Explicit Citation / Formula'}</span>
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Confidence: {Math.round((activeEdge.confidenceScore || 1) * 100)}%
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 leading-tight">
                  {activeEdge.label}
                </h3>
              </div>
            </div>

            {/* AI Inferred Rationale Callout if applicable */}
            {activeEdge.isAiInferred && activeEdge.evidence?.aiRationale && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-50 via-slate-50 to-white dark:from-violet-950/40 dark:via-zinc-900/50 dark:to-zinc-900/20 border border-violet-200 dark:border-violet-800/80">
                <div className="flex items-center gap-2 text-xs font-bold text-violet-700 dark:text-violet-300 mb-1">
                  <Sparkles size={14} />
                  <span>AI Semantic Discovery Rationale</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                  {activeEdge.evidence.aiRationale}
                </p>
              </div>
            )}

            {/* ── Side-by-Side Provenance Evidence Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Source Card */}
              {sourceEntity && (
                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-700 dark:text-zinc-300">
                          <RegaarderProductIcon name={sourceEntity.workspace} size={15} />
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Origin ({sourceEntity.workspace})
                        </span>
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-1">
                      {sourceEntity.title}
                    </h4>
                    <div className="text-[11px] text-slate-400 mb-3">
                      By {sourceEntity.author} • {sourceEntity.authorRole}
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80 text-xs text-slate-700 dark:text-zinc-300 italic leading-relaxed mb-4">
                      "{activeEdge.evidence?.sourceSnippet || sourceEntity.excerpt}"
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigateToWorkspace(sourceEntity)}
                    className="w-full py-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:border-violet-300 dark:hover:border-violet-600 hover:text-violet-600 dark:hover:text-violet-400 text-slate-700 dark:text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Inspect in {sourceEntity.workspace}</span>
                    <ExternalLink size={13} />
                  </button>
                </div>
              )}

              {/* Target Card */}
              {targetEntity && (
                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-950/60 flex items-center justify-center text-violet-600 dark:text-violet-400">
                          <RegaarderProductIcon name={targetEntity.workspace} size={15} />
                        </div>
                        <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                          Destination ({targetEntity.workspace})
                        </span>
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-1">
                      {targetEntity.title}
                    </h4>
                    <div className="text-[11px] text-slate-400 mb-3">
                      By {targetEntity.author} • {targetEntity.authorRole}
                    </div>

                    <div className="p-3 rounded-xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/50 text-xs text-slate-700 dark:text-zinc-300 italic leading-relaxed mb-4">
                      "{activeEdge.evidence?.targetSnippet || targetEntity.excerpt}"
                    </div>

                    {/* Specific Formula Snippet */}
                    {activeEdge.evidence?.formula && (
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 font-mono text-xs text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 mb-3">
                        <span className="text-slate-400 font-sans text-[10px] uppercase font-bold block mb-0.5">Underlying Formula Link:</span>
                        <span>{activeEdge.evidence.formula}</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigateToWorkspace(targetEntity)}
                    className="w-full py-2 rounded-xl bg-[#7C5ACF] text-white hover:bg-[#6c48c5] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span>Open in {targetEntity.workspace}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
