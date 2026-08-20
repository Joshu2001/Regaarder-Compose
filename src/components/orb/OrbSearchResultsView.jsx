import React from 'react';
import { 
  ArrowRight, ExternalLink, Network, FileText, 
  Table, Presentation, Video, CheckSquare, Calendar, Globe,
  CornerDownRight, User, Hash, Clock, Layers, HelpCircle, Compass
} from 'lucide-react';
import { RegaarderProductIcon, RegaarderAiIcon } from '../RegaarderProductIcons';

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
  highContrast = false,
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
      <div className={`flex items-center justify-between px-6 py-2.5 border-b shrink-0 ${
        highContrast
          ? 'border-slate-300 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-950'
          : 'border-slate-200/70 dark:border-zinc-800/80 bg-slate-100/50 dark:bg-zinc-950/40'
      }`}>
        <div className="flex items-center gap-1.5 overflow-x-auto thin-scrollbar py-0.5">
          {Object.entries(WORKSPACE_LABELS).map(([key, label]) => {
            const isActive = workspaceFilter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelectWorkspaceFilter(key)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-150 whitespace-nowrap cursor-pointer select-none ${
                  isActive
                    ? highContrast
                      ? 'border-2 border-[#7C5ACF] dark:border-[#a78bfa] bg-white dark:bg-zinc-800 text-[#7C5ACF] dark:text-[#a78bfa] font-extrabold shadow-sm'
                      : 'border-2 border-[#7C5ACF] dark:border-[#8B6FD1] bg-white dark:bg-zinc-800 text-[#7C5ACF] dark:text-[#a78bfa] font-semibold shadow-xs'
                    : highContrast
                    ? 'border-2 border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 hover:border-slate-500 font-bold'
                    : 'border border-slate-200/90 dark:border-zinc-700/80 bg-white/70 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-700/60 font-medium'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className={`text-[11px] shrink-0 pl-3 ${highContrast ? 'font-bold text-slate-800 dark:text-zinc-200' : 'font-medium text-slate-500 dark:text-zinc-400'}`}>
          {results.length} connected item{results.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* ── Results Container ── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 thin-scrollbar">
        {/* Suggested Queries Chips with clear AI Primary vs Secondary Hierarchy */}
        {suggestedQuestions?.length > 0 && (() => {
          const primaryInquiries = suggestedQuestions.slice(0, 2);
          const secondaryInquiries = suggestedQuestions.slice(2);

          return (
            <div className={`p-5 rounded-2xl ${
              highContrast
                ? 'bg-white dark:bg-zinc-950 border-2 border-slate-400 dark:border-zinc-600 shadow-sm'
                : 'bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] shadow-xs'
            }`}>
              <div className={`flex items-center gap-2 mb-3 text-xs ${
                highContrast ? 'font-black text-black dark:text-white' : 'font-semibold text-slate-800 dark:text-zinc-200'
              }`}>
                <RegaarderAiIcon size={14} className="text-[#7C5ACF] dark:text-[#a78bfa]" />
                <span>Suggested Strategic Inquiries</span>
              </div>

              {/* Primary AI Recommendations */}
              <div className="flex flex-col sm:flex-row gap-2.5 mb-3">
                {primaryInquiries.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSwitchToDecide(q)}
                    className={`group flex-1 flex items-center justify-between p-3 rounded-xl transition-all text-left cursor-pointer ${
                      highContrast
                        ? 'bg-slate-100 dark:bg-zinc-900 border-2 border-violet-500 font-bold text-black dark:text-white'
                        : 'bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200/80 dark:border-violet-800/60 hover:bg-violet-100/80 dark:hover:bg-violet-900/40 text-slate-900 dark:text-zinc-100'
                    }`}
                  >
                    <div className="flex items-start gap-2 min-w-0 pr-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-violet-200/80 dark:bg-violet-900 text-violet-800 dark:text-violet-200 shrink-0 mt-0.5">
                        Suggested
                      </span>
                      <span className="text-xs font-semibold leading-snug">{q}</span>
                    </div>
                    <ArrowRight size={13} className="text-[#7C5ACF] dark:text-[#a78bfa] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>

              {/* Lighter Secondary Inquiries */}
              {secondaryInquiries.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100 dark:border-zinc-800/80">
                  {secondaryInquiries.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onSwitchToDecide(q)}
                      className={`group flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all text-left cursor-pointer ${
                        highContrast
                          ? 'font-bold text-slate-900 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-900 border border-slate-300'
                          : 'font-normal text-slate-600 dark:text-zinc-400 bg-slate-50/80 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-700/60 hover:text-slate-900 dark:hover:text-white border border-slate-200/60 dark:border-zinc-700/40'
                      }`}
                    >
                      <span className="truncate max-w-md">{q}</span>
                      <ArrowRight size={11} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* Results List */}
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 dark:text-zinc-400">
            <Compass size={38} strokeWidth={1.3} className="mb-3 text-slate-400 dark:text-zinc-500" />
            <div className="text-sm font-bold text-slate-800 dark:text-zinc-200">No workspace objects found</div>
            <div className="text-xs max-w-sm mt-1 text-slate-500 dark:text-zinc-400 font-normal">
              Try searching for concepts like "Nvidia revenue", "Taiwan semiconductor risk", "Capex", or person names.
            </div>
          </div>
        ) : (
          results.map(({ entity, relevanceScore, relevanceRationale, connectedCount }) => {
            const cleanRationale = relevanceRationale?.replace(/organizational memory/gi, 'workspace intelligence') || 'Indexed workspace entity across connected documents and models.';

            return (
              <div
                key={entity.id}
                className={`group relative flex flex-col p-5 rounded-2xl transition-all duration-200 ${
                  highContrast
                    ? 'bg-white dark:bg-zinc-950 border-2 border-slate-400 dark:border-zinc-600 shadow-sm'
                    : 'bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] hover:border-black/[0.12] dark:hover:border-white/[0.15] shadow-xs'
                }`}
              >
                {/* Header Row: Neutral Product Icon + Title + Workspace Badge */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      highContrast
                        ? 'bg-slate-100 dark:bg-zinc-900 text-black dark:text-white border-2 border-slate-400 dark:border-zinc-600'
                        : 'bg-slate-100/70 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700/60'
                    }`}>
                      <RegaarderProductIcon name={entity.workspace} size={15} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm truncate transition-colors ${
                          highContrast
                            ? 'font-extrabold text-black dark:text-white group-hover:text-[#7C5ACF]'
                            : 'font-semibold text-slate-900 dark:text-zinc-100 group-hover:text-[#7C5ACF] dark:group-hover:text-[#a78bfa]'
                        }`}>
                          {entity.title}
                        </h4>
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
                          highContrast
                            ? 'font-bold border-2 border-slate-500 dark:border-zinc-600 text-slate-900 dark:text-zinc-100 bg-slate-100 dark:bg-zinc-900'
                            : 'font-medium border border-slate-200/80 dark:border-zinc-700/60 text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800/40'
                        }`}>
                          {entity.workspace}
                        </span>
                      </div>
                      <div className={`flex items-center gap-2 text-[11px] mt-0.5 ${
                        highContrast ? 'font-bold text-slate-800 dark:text-zinc-300' : 'font-normal text-slate-500 dark:text-zinc-400'
                      }`}>
                        <span className={highContrast ? 'font-extrabold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-zinc-300'}>{entity.author}</span>
                        {entity.authorRole && <span>• {entity.authorRole}</span>}
                        {entity.project && <span>• {entity.project}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Metadata Metric or Value */}
                  {entity.metadata?.cellValue && (
                    <span className={`px-2.5 py-1 text-xs rounded-lg shrink-0 font-mono shadow-2xs ${
                      highContrast
                        ? 'font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-950 dark:text-emerald-200 border-2 border-emerald-500'
                        : 'font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    }`}>
                      {entity.metadata.cellValue}
                    </span>
                  )}
                  {entity.metadata?.headlineMetric && !entity.metadata?.cellValue && (
                    <span className={`px-2.5 py-1 text-xs rounded-lg shrink-0 font-mono shadow-2xs ${
                      highContrast
                        ? 'font-extrabold bg-slate-100 dark:bg-zinc-900 text-black dark:text-white border-2 border-slate-400'
                        : 'font-semibold bg-slate-100/70 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700'
                    }`}>
                      {entity.metadata.headlineMetric}
                    </span>
                  )}
                </div>

                {/* ── "Why this is relevant" Semantic Rationale Banner ── */}
                {cleanRationale && (
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11.5px] mb-2.5 ${
                    highContrast
                      ? 'bg-slate-100 dark:bg-zinc-900 border-2 border-slate-300 dark:border-zinc-700 text-black dark:text-white font-bold'
                      : 'bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-700/40 text-slate-700 dark:text-zinc-300 font-medium'
                  }`}>
                    <RegaarderAiIcon size={13} className="text-[#7C5ACF] dark:text-[#a78bfa] shrink-0" />
                    <span className="truncate">{cleanRationale}</span>
                  </div>
                )}

                {/* Context Excerpt */}
                <p className={`text-xs line-clamp-2 leading-relaxed mb-3 ${
                  highContrast ? 'font-medium text-slate-900 dark:text-zinc-100' : 'font-normal text-slate-600 dark:text-zinc-400'
                }`}>
                  {entity.excerpt || entity.content}
                </p>

                {/* Specific technical details (Formula, Slide, Timestamp Quote) */}
                {entity.metadata?.formula && (
                  <div className={`flex items-center gap-2 text-xs font-mono px-2.5 py-1 rounded-lg mb-3 w-fit ${
                    highContrast
                      ? 'text-black dark:text-white bg-slate-100 dark:bg-zinc-900 border-2 border-slate-400 font-extrabold'
                      : 'text-slate-800 dark:text-zinc-200 bg-slate-100/70 dark:bg-zinc-800/50 border border-slate-200/70 font-semibold'
                  }`}>
                    <span className="text-slate-500 font-sans text-[10px] uppercase font-bold">Formula</span>
                    <span>{entity.metadata.formula}</span>
                  </div>
                )}

                {/* Footer Controls & Quick Deep-Link Actions (Strict Button Hierarchy) */}
                <div className={`flex items-center justify-between pt-3 border-t mt-auto text-xs ${
                  highContrast ? 'border-slate-300 dark:border-zinc-700' : 'border-slate-100 dark:border-zinc-800/80'
                }`}>
                  <div className={`flex items-center gap-1.5 ${
                    highContrast ? 'font-bold text-slate-800 dark:text-zinc-200' : 'font-medium text-slate-500 dark:text-zinc-400'
                  }`}>
                    <Network size={13} className="text-slate-400" />
                    <span>{connectedCount} connected relationship{connectedCount === 1 ? '' : 's'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Ghost Navigation Actions */}
                    <button
                      type="button"
                      onClick={() => onSwitchToMap(entity)}
                      className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1 text-[11.5px] font-medium cursor-pointer"
                      title="View dynamic knowledge graph around this entity"
                    >
                      <Network size={12} />
                      <span>Map</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSwitchToUnderstand(entity)}
                      className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1 text-[11.5px] font-medium cursor-pointer"
                      title="Inspect evidence and connection provenance"
                    >
                      <Layers size={12} />
                      <span>Understand</span>
                    </button>
                    {/* Primary Action (Filled Purple) */}
                    <button
                      type="button"
                      onClick={() => onNavigateToWorkspace(entity)}
                      className="px-3 py-1 rounded-lg bg-[#7C5ACF] text-white hover:bg-[#6c48c5] transition-colors flex items-center gap-1 text-[11.5px] font-semibold shadow-2xs cursor-pointer ml-1"
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
