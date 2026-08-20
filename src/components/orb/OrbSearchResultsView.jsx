import React from 'react';
import { 
  Sparkles, ArrowRight, ExternalLink, Network, FileText, 
  Table, Presentation, Video, CheckSquare, Calendar, Globe,
  CornerDownRight, User, Hash, Clock, Layers, HelpCircle, Compass
} from 'lucide-react';
import { RegaarderProductIcon } from '../RegaarderProductIcons';

export const WORKSPACE_LABELS = {
  all: 'All Intelligence',
  compose: 'Docs',
  sheets: 'Sheets',
  deck: 'Decks',
  room: 'Room / Meetings',
  tasks: 'Tasks',
  schedule: 'Schedule',
  browser: 'Research'
};

export default function OrbSearchResultsView({
  query,
  results = [],
  suggestedQuestions = [],
  workspaceFilter = 'all',
  onSelectWorkspaceFilter,
  onSelectEntity,
  onSwitchToMap,
  onSwitchToUnderstand,
  onSwitchToDecide,
  onNavigateToWorkspace
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Sub-header with Workspace Filters ── */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-200/60 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/40 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto thin-scrollbar py-0.5">
          {Object.entries(WORKSPACE_LABELS).map(([key, label]) => {
            const isActive = workspaceFilter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelectWorkspaceFilter(key)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border border-[#7C5ACF]/60 dark:border-[#8B6FD1]/60 bg-[#7C5ACF]/[0.08] dark:bg-[#7C5ACF]/[0.18] text-[#7C5ACF] dark:text-[#a78bfa] shadow-xs'
                    : 'border border-slate-200/80 dark:border-zinc-700/80 bg-white/70 dark:bg-zinc-800/60 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100/80 dark:hover:bg-zinc-700/60'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="text-[11px] font-medium text-slate-400 dark:text-zinc-500 shrink-0 pl-3">
          {results.length} connected item{results.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* ── Results Container ── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 thin-scrollbar">
        {/* Suggested Queries Chips when query is empty or short */}
        {suggestedQuestions?.length > 0 && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-50/80 via-slate-50/60 to-white/40 dark:from-violet-950/20 dark:via-zinc-900/40 dark:to-zinc-900/20 border border-violet-100/80 dark:border-violet-900/40">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-violet-700 dark:text-violet-400">
              <Sparkles size={13} className="text-violet-600 dark:text-violet-400" />
              <span>Suggested Strategic Inquiries</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSwitchToDecide(q)}
                  className="group flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 dark:text-zinc-300 bg-white/90 dark:bg-zinc-800/90 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-700 dark:hover:text-violet-300 border border-slate-200/80 dark:border-zinc-700/80 hover:border-violet-300 dark:hover:border-violet-700 rounded-lg transition-all text-left"
                >
                  <span>{q}</span>
                  <ArrowRight size={11} className="text-slate-400 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results List */}
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 dark:text-zinc-500">
            <Compass size={40} strokeWidth={1.3} className="mb-3 text-slate-300 dark:text-zinc-600" />
            <div className="text-sm font-semibold text-slate-700 dark:text-zinc-300">No workspace objects found</div>
            <div className="text-xs max-w-sm mt-1">
              Try searching for concepts like "Nvidia revenue", "Taiwan semiconductor risk", "Capex", or person names.
            </div>
          </div>
        ) : (
          results.map(({ entity, relevanceScore, relevanceRationale, connectedCount }) => {
            return (
              <div
                key={entity.id}
                className="group relative flex flex-col p-4 rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800/90 hover:border-violet-300 dark:hover:border-violet-700/80 hover:shadow-md transition-all duration-200"
              >
                {/* Header Row: Product Icon + Title + Workspace Badge */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 border border-violet-100 dark:border-violet-900/50 mt-0.5">
                      <RegaarderProductIcon name={entity.workspace} size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                          {entity.title}
                        </h4>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-slate-200/80 dark:border-zinc-700/80 text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800/80">
                          {entity.workspace}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                        <span>{entity.author}</span>
                        {entity.authorRole && <span>• {entity.authorRole}</span>}
                        {entity.project && <span>• {entity.project}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Metadata Metric or Value */}
                  {entity.metadata?.cellValue && (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 shrink-0 font-mono">
                      {entity.metadata.cellValue}
                    </span>
                  )}
                  {entity.metadata?.headlineMetric && !entity.metadata?.cellValue && (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800/60 shrink-0">
                      {entity.metadata.headlineMetric}
                    </span>
                  )}
                </div>

                {/* ── "Why this is relevant" Semantic Rationale Banner ── */}
                {relevanceRationale && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40 text-violet-800 dark:text-violet-300 text-[11.5px] font-medium mb-2.5">
                    <Sparkles size={13} className="text-violet-600 dark:text-violet-400 shrink-0" />
                    <span className="truncate">{relevanceRationale}</span>
                  </div>
                )}

                {/* Context Excerpt */}
                <p className="text-xs text-slate-600 dark:text-zinc-300 line-clamp-2 leading-relaxed mb-3">
                  {entity.excerpt || entity.content}
                </p>

                {/* Specific technical details (Formula, Slide, Timestamp Quote) */}
                {entity.metadata?.formula && (
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 mb-3 w-fit">
                    <span className="text-slate-400 font-sans text-[10px] uppercase font-bold">Formula</span>
                    <span>{entity.metadata.formula}</span>
                  </div>
                )}

                {/* Footer Controls & Quick Deep-Link Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800/60 mt-auto text-xs">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
                    <Network size={13} className="text-violet-500" />
                    <span>{connectedCount} connected relationship{connectedCount === 1 ? '' : 's'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSwitchToMap(entity)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 hover:border-violet-300 dark:hover:border-violet-600 hover:text-violet-600 dark:hover:text-violet-400 text-slate-600 dark:text-zinc-300 transition-colors flex items-center gap-1 font-medium text-[11.5px]"
                      title="View dynamic knowledge graph around this entity"
                    >
                      <Network size={12} />
                      <span>Map</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSwitchToUnderstand(entity)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 hover:border-violet-300 dark:hover:border-violet-600 hover:text-violet-600 dark:hover:text-violet-400 text-slate-600 dark:text-zinc-300 transition-colors flex items-center gap-1 font-medium text-[11.5px]"
                      title="Inspect evidence and connection provenance"
                    >
                      <Layers size={12} />
                      <span>Understand</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigateToWorkspace(entity)}
                      className="px-3 py-1 rounded-lg bg-[#7C5ACF] text-white hover:bg-[#6c48c5] transition-colors flex items-center gap-1 font-medium text-[11.5px] shadow-xs"
                      title="Jump directly into this application"
                    >
                      <span>Open</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
