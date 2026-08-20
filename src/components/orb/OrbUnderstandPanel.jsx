import React, { useState } from 'react';
import { 
  Layers, ArrowRight, ExternalLink, Link2, 
  FileText, Table, Presentation, Video, CheckSquare, Clock,
  ShieldCheck, AlertTriangle, HelpCircle, Check, Compass, Eye,
  GitCommit, ArrowUpRight
} from 'lucide-react';
import { RegaarderProductIcon, RegaarderAiIcon } from '../RegaarderProductIcons';
import { ORB_EPISTEMIC_STATUS } from '../../services/orbKnowledgeGraphService';

const EPISTEMIC_CONFIG = {
  verified: {
    label: 'Verified',
    badgeClass: 'bg-emerald-100 text-emerald-950 border-emerald-400 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-700 font-bold',
    icon: ShieldCheck,
    description: 'Explicit citation, spreadsheet formula linkage, or signed board resolution.'
  },
  inferred: {
    label: 'Inferred',
    badgeClass: 'bg-violet-100 text-violet-950 border-violet-400 dark:bg-violet-950/80 dark:text-violet-200 dark:border-violet-700 font-bold',
    icon: RegaarderAiIcon,
    description: 'Autonomous multi-modal correlation & cross-document semantic linkage.'
  },
  probable: {
    label: 'Probable',
    badgeClass: 'bg-sky-100 text-sky-950 border-sky-400 dark:bg-sky-950/80 dark:text-sky-200 dark:border-sky-700 font-bold',
    icon: Compass,
    description: 'High statistical confidence based on sequential milestones & workstream ownership.'
  },
  uncertain: {
    label: 'Uncertain / Risk',
    badgeClass: 'bg-amber-100 text-amber-950 border-amber-400 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-700 font-bold',
    icon: AlertTriangle,
    description: 'Detected contradiction or variance between quantitative models and qualitative reports.'
  }
};

export default function OrbUnderstandPanel({
  selectedEdge,
  selectedEntity,
  entities = [],
  edges = [],
  highContrast = false,
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

  const currentEpistemicKey = activeEdge?.epistemicStatus || (activeEdge?.isAiInferred ? 'inferred' : 'verified');
  const currentEpistemic = EPISTEMIC_CONFIG[currentEpistemicKey] || EPISTEMIC_CONFIG.verified;
  const EpistemicIcon = currentEpistemic.icon;

  return (
    <div className={`flex h-full w-full overflow-hidden ${
      highContrast ? 'bg-slate-200/50 dark:bg-zinc-950' : 'bg-slate-100/30 dark:bg-zinc-950/20'
    }`}>
      {/* ── Left Rail: List of Connected Semantic Relationships ── */}
      <div className={`w-[320px] flex flex-col shrink-0 ${
        highContrast
          ? 'border-r-2 border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950'
          : 'border-r border-black/[0.06] dark:border-white/[0.08] bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl'
      }`}>
        <div className={`p-4 border-b ${
          highContrast ? 'border-slate-300 dark:border-zinc-700' : 'border-slate-200/60 dark:border-zinc-800/60'
        }`}>
          <div className={`flex items-center gap-2 text-xs uppercase tracking-wider ${
            highContrast ? 'font-black text-black dark:text-white' : 'font-bold text-slate-800 dark:text-zinc-200'
          }`}>
            <Layers size={14} className="text-slate-700 dark:text-zinc-300" />
            <span>Semantic Linkages</span>
          </div>
          <p className={`text-[11px] mt-1 ${
            highContrast ? 'font-bold text-slate-800 dark:text-zinc-300' : 'font-normal text-slate-500 dark:text-zinc-400'
          }`}>
            Provenance & epistemic status supporting cross-workspace links.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 thin-scrollbar">
          {edges.map(edge => {
            const isSelected = activeEdge?.id === edge.id;
            const src = entities.find(e => e.id === edge.sourceId);
            const tgt = entities.find(e => e.id === edge.targetId);

            const statusKey = edge.epistemicStatus || (edge.isAiInferred ? 'inferred' : 'verified');
            const statusConfig = EPISTEMIC_CONFIG[statusKey] || EPISTEMIC_CONFIG.verified;
            const StatusIcon = statusConfig.icon;
            const isExplicit = statusKey === 'verified' || edge.evidence?.formula;

            return (
              <button
                key={edge.id}
                type="button"
                onClick={() => onSelectEdge(edge)}
                className={`w-full text-left p-3 rounded-xl transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? highContrast
                      ? 'border-2 border-violet-500 bg-slate-100 dark:bg-zinc-800 shadow-sm'
                      : 'border border-violet-300/80 dark:border-violet-700/60 bg-violet-50/70 dark:bg-violet-950/40 shadow-xs'
                    : highContrast
                    ? 'border-2 border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-slate-400'
                    : 'border border-slate-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-700/60'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${
                    highContrast
                      ? statusConfig.badgeClass
                      : isSelected
                      ? 'bg-violet-100/90 dark:bg-violet-900/60 text-[#7C5ACF] dark:text-violet-200 border-violet-200 dark:border-violet-800'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
                  }`}>
                    <StatusIcon size={10} />
                    <span>{statusConfig.label}</span>
                  </span>
                  <span className={`text-[10px] font-mono ${highContrast ? 'text-slate-900 dark:text-zinc-100 font-bold' : 'text-slate-500 font-medium'}`}>
                    {isExplicit ? 'Explicit' : `${Math.round((edge.confidenceScore || 0.88) * 100)}% conf`}
                  </span>
                </div>

                <div className={`text-xs line-clamp-2 mb-1.5 leading-snug ${
                  highContrast ? 'font-black text-black dark:text-white' : 'font-semibold text-slate-800 dark:text-zinc-200'
                }`}>
                  {edge.label || edge.relationType}
                </div>

                <div className={`flex items-center gap-1 text-[11px] truncate ${
                  highContrast ? 'text-slate-700 dark:text-zinc-300' : 'text-slate-500 dark:text-zinc-400'
                }`}>
                  <span className={`truncate max-w-[90px] ${highContrast ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-zinc-300'}`}>
                    {src?.title || 'Source'}
                  </span>
                  <ArrowRight size={11} className="shrink-0 text-slate-400" />
                  <span className={`truncate max-w-[90px] ${highContrast ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-zinc-300'}`}>
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
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-zinc-400">
            <Compass size={38} strokeWidth={1.3} className="mb-2 text-slate-400 dark:text-zinc-500" />
            <span className="text-sm font-bold text-slate-800 dark:text-zinc-200">Select a relationship to inspect evidence</span>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Header: Epistemic Status & Modality */}
            <div className={`p-6 rounded-2xl ${
              highContrast
                ? 'bg-white dark:bg-zinc-950 border-2 border-slate-400 dark:border-zinc-600 shadow-sm'
                : 'bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] shadow-xs'
            }`}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border ${
                    highContrast
                      ? statusConfigBadgeClass(currentEpistemicKey)
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80 font-semibold'
                  }`}>
                    <EpistemicIcon size={13} />
                    <span>{currentEpistemic.label} Connection</span>
                  </span>
                  {activeEdge.modality && (
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      highContrast
                        ? 'font-bold bg-slate-100 dark:bg-zinc-900 text-black dark:text-white border border-slate-300'
                        : 'font-medium bg-slate-100/70 dark:bg-zinc-800/60 text-slate-600 dark:text-zinc-400 border border-slate-200/60'
                    }`}>
                      {activeEdge.modality}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-mono ${highContrast ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-500'}`}>
                    {activeEdge.epistemicStatus === 'verified' || activeEdge.evidence?.formula
                      ? 'Explicit • Deterministic'
                      : `Confidence: ${Math.round((activeEdge.confidenceScore || 0.88) * 100)}%`}
                  </span>
                </div>
              </div>

              <h3 className={`text-lg leading-tight mb-2 ${
                highContrast ? 'font-black text-black dark:text-white' : 'font-semibold text-slate-900 dark:text-zinc-100'
              }`}>
                {activeEdge.label}
              </h3>

              <p className={`text-xs leading-relaxed ${
                highContrast ? 'font-medium text-slate-900 dark:text-zinc-200' : 'font-normal text-slate-600 dark:text-zinc-400'
              }`}>
                {activeEdge.epistemicRationale || currentEpistemic.description}
              </p>
            </div>

            {/* AI Inferred Rationale Callout if applicable */}
            {activeEdge.isAiInferred && activeEdge.evidence?.aiRationale && (
              <div className={`p-4 rounded-2xl ${
                highContrast
                  ? 'bg-white dark:bg-zinc-950 border-2 border-slate-400 dark:border-zinc-600 shadow-sm'
                  : 'bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] shadow-xs'
              }`}>
                <div className="flex items-center gap-2 text-xs font-bold text-[#7C5ACF] dark:text-[#a78bfa] mb-1">
                  <RegaarderAiIcon size={14} />
                  <span>AI Semantic Discovery Rationale</span>
                </div>
                <p className={`text-xs leading-relaxed ${
                  highContrast ? 'font-medium text-slate-900 dark:text-zinc-100' : 'font-normal text-slate-600 dark:text-zinc-400'
                }`}>
                  {activeEdge.evidence.aiRationale}
                </p>
              </div>
            )}

            {/* ── Side-by-Side Provenance Evidence Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Origin / Source Card */}
              {sourceEntity && (
                <div className={`p-5 rounded-2xl flex flex-col justify-between ${
                  highContrast
                    ? 'bg-white dark:bg-zinc-950 border-2 border-slate-400 dark:border-zinc-600 shadow-sm'
                    : 'bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] shadow-xs'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          highContrast
                            ? 'bg-slate-100 dark:bg-zinc-800 text-black dark:text-white border-2 border-slate-400'
                            : 'bg-slate-100/80 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 border border-slate-200/80'
                        }`}>
                          <RegaarderProductIcon name={sourceEntity.workspace} size={14} />
                        </div>
                        <span className={`text-[11px] uppercase tracking-wider ${
                          highContrast ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-500 dark:text-zinc-400'
                        }`}>
                          Origin ({sourceEntity.workspace})
                        </span>
                      </div>
                    </div>
                    <h4 className={`text-sm mb-1 ${
                      highContrast ? 'font-black text-black dark:text-white' : 'font-semibold text-slate-900 dark:text-zinc-100'
                    }`}>
                      {sourceEntity.title}
                    </h4>
                    <div className={`text-[11px] mb-3 ${
                      highContrast ? 'font-bold text-slate-800 dark:text-zinc-300' : 'font-normal text-slate-500 dark:text-zinc-400'
                    }`}>
                      By {sourceEntity.author} • {sourceEntity.authorRole}
                    </div>

                    <div className={`p-3 rounded-xl text-xs italic leading-relaxed mb-4 ${
                      highContrast
                        ? 'bg-slate-100 dark:bg-zinc-900 border-2 border-slate-300 text-black dark:text-white'
                        : 'bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-200/60 text-slate-700 dark:text-zinc-300'
                    }`}>
                      "{activeEdge.evidence?.sourceSnippet || sourceEntity.excerpt}"
                    </div>
                  </div>

                  {/* Secondary Action: Ghost / Outlined */}
                  <button
                    type="button"
                    onClick={() => onNavigateToWorkspace(sourceEntity)}
                    className="w-full py-2 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 bg-white/60 dark:bg-zinc-800/60 hover:bg-white dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Inspect in {sourceEntity.workspace}</span>
                    <ExternalLink size={12} />
                  </button>
                </div>
              )}

              {/* Destination / Target Card */}
              {targetEntity && (
                <div className={`p-5 rounded-2xl flex flex-col justify-between ${
                  highContrast
                    ? 'bg-white dark:bg-zinc-950 border-2 border-slate-400 dark:border-zinc-600 shadow-sm'
                    : 'bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] shadow-xs'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          highContrast
                            ? 'bg-slate-100 dark:bg-zinc-800 text-black dark:text-white border-2 border-slate-400'
                            : 'bg-slate-100/80 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 border border-slate-200/80'
                        }`}>
                          <RegaarderProductIcon name={targetEntity.workspace} size={14} />
                        </div>
                        <span className={`text-[11px] uppercase tracking-wider ${
                          highContrast ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-500 dark:text-zinc-400'
                        }`}>
                          Destination ({targetEntity.workspace})
                        </span>
                      </div>
                    </div>
                    <h4 className={`text-sm mb-1 ${
                      highContrast ? 'font-black text-black dark:text-white' : 'font-semibold text-slate-900 dark:text-zinc-100'
                    }`}>
                      {targetEntity.title}
                    </h4>
                    <div className={`text-[11px] mb-3 ${
                      highContrast ? 'font-bold text-slate-800 dark:text-zinc-300' : 'font-normal text-slate-500 dark:text-zinc-400'
                    }`}>
                      By {targetEntity.author} • {targetEntity.authorRole}
                    </div>

                    <div className={`p-3 rounded-xl text-xs italic leading-relaxed mb-4 ${
                      highContrast
                        ? 'bg-slate-100 dark:bg-zinc-900 border-2 border-slate-300 text-black dark:text-white'
                        : 'bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-200/60 text-slate-700 dark:text-zinc-300'
                    }`}>
                      "{activeEdge.evidence?.targetSnippet || targetEntity.excerpt}"
                    </div>

                    {/* Specific Formula Snippet */}
                    {activeEdge.evidence?.formula && (
                      <div className={`p-2.5 rounded-xl font-mono text-xs mb-3 ${
                        highContrast
                          ? 'bg-slate-100 dark:bg-zinc-900 text-black dark:text-white border-2 border-slate-400 font-extrabold'
                          : 'bg-slate-100/70 dark:bg-zinc-800/60 text-slate-800 dark:text-zinc-200 border border-slate-200/80 font-semibold'
                      }`}>
                        <span className="text-slate-500 font-sans text-[10px] uppercase font-bold block mb-0.5">Formula:</span>
                        <span>{activeEdge.evidence.formula}</span>
                      </div>
                    )}
                  </div>

                  {/* Primary Action: Filled Purple */}
                  <button
                    type="button"
                    onClick={() => onNavigateToWorkspace(targetEntity)}
                    className="w-full py-2 rounded-xl bg-[#7C5ACF] text-white hover:bg-[#6c48c5] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
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

function statusConfigBadgeClass(key) {
  if (key === 'verified') return 'bg-emerald-100 text-emerald-950 border-2 border-emerald-500 font-bold';
  if (key === 'inferred') return 'bg-violet-100 text-violet-950 border-2 border-violet-500 font-bold';
  if (key === 'probable') return 'bg-sky-100 text-sky-950 border-2 border-sky-500 font-bold';
  return 'bg-amber-100 text-amber-950 border-2 border-amber-500 font-bold';
}

