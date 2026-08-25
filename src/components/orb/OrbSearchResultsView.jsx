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

export const FILTER_EMPTY_STATES = {
  all: {
    title: 'No workspace items indexed yet',
    desc: 'Create or edit documents, spreadsheets, and tasks to build your live workspace intelligence.'
  },
  compose: {
    title: 'No documents yet to link',
    desc: 'Create or edit a document in Compose to index its text, headings, and key insights.'
  },
  sheets: {
    title: 'No spreadsheets yet to link',
    desc: 'Create or import a spreadsheet to index numerical data grids and calculation formulas.'
  },
  deck: {
    title: 'No presentation decks yet to link',
    desc: 'Create presentation slides to index executive summaries, outlines, and metrics.'
  },
  room: {
    title: 'No meeting transcripts yet',
    desc: 'Recorded discussions and live transcripts from Room will appear here automatically.'
  },
  tasks: {
    title: 'No tasks or action items yet',
    desc: 'Create tasks and assign deliverables to map action item dependencies.'
  },
  schedule: {
    title: 'No calendar events yet',
    desc: 'Add scheduled events and agenda milestones to track timeline relationships.'
  },
  browser: {
    title: 'No research notes yet',
    desc: 'Save web research and verified sources from the browser to connect external intelligence.'
  }
};

export default function OrbSearchResultsView({
  query,
  results = [],
  suggestedQuestions = [],
  workspaceFilter = 'all',
  highContrast = false,
  selectedIndex = 0,
  onSelectIndex,
  onSelectWorkspaceFilter,
  onSelectEntity,
  onSwitchToMap,
  onSwitchToUnderstand,
  onSwitchToDecide,
  onNavigateToWorkspace
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-transparent">
      {/* ── Sub-header with Flattened Workspace Filters ── */}
      <div className={`flex items-center justify-between px-6 py-2.5 border-b shrink-0 ${
        highContrast
          ? 'border-slate-300 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-950'
          : 'border-black/[0.04] dark:border-white/[0.04]'
      }`}>
        <div className="flex items-center gap-1 overflow-x-auto thin-scrollbar py-0.5">
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
                      ? 'border-2 border-slate-900 dark:border-white bg-white dark:bg-zinc-800 text-black dark:text-white font-extrabold shadow-sm'
                      : 'border border-slate-200/90 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-semibold shadow-2xs'
                    : highContrast
                    ? 'border-2 border-transparent text-slate-800 dark:text-zinc-200 hover:border-slate-400 font-bold'
                    : 'border border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] font-medium'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className={`text-[11px] shrink-0 pl-3 ${highContrast ? 'font-bold text-slate-800 dark:text-zinc-200' : 'font-medium text-slate-400 dark:text-zinc-500'}`}>
          {results.length} item{results.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* ── Results Container ── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 thin-scrollbar">
        {/* Suggested Inquiries (rendered only when results exist) */}
        {results.length > 0 && suggestedQuestions && suggestedQuestions.length > 0 && (() => {
          const primaryInquiries = suggestedQuestions.slice(0, 2);
          const secondaryInquiries = suggestedQuestions.slice(2);

          return (
            <div className={`p-4 rounded-xl ${
              highContrast
                ? 'bg-white dark:bg-zinc-950 border-2 border-slate-400 dark:border-zinc-600 shadow-sm'
                : 'bg-white/60 dark:bg-zinc-900/60 border border-black/[0.04] dark:border-white/[0.06] shadow-2xs'
            }`}>
              <div className={`flex items-center gap-1.5 mb-2.5 text-xs ${
                highContrast ? 'font-black text-black dark:text-white' : 'font-semibold text-slate-700 dark:text-zinc-300'
              }`}>
                <RegaarderAiIcon size={14} className="text-[#7C5ACF] dark:text-[#a78bfa]" />
                <span>Suggested Inquiries</span>
              </div>

              {/* Primary AI Recommendations */}
              <div className="flex flex-col sm:flex-row gap-2 mb-2">
                {primaryInquiries.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSwitchToDecide(q)}
                    className={`group flex-1 flex items-center justify-between p-2.5 rounded-lg transition-all text-left cursor-pointer ${
                      highContrast
                        ? 'bg-slate-100 dark:bg-zinc-900 border-2 border-slate-600 font-bold text-black dark:text-white'
                        : 'bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-100/90 dark:border-zinc-800/80 hover:bg-slate-100 dark:hover:bg-zinc-800/70 text-slate-800 dark:text-zinc-100'
                    }`}
                  >
                    <span className="text-xs font-medium leading-snug pr-2 truncate">{q}</span>
                    <ArrowRight size={12} className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>

              {/* Secondary Inquiries */}
              {secondaryInquiries.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-black/[0.03] dark:border-white/[0.04]">
                  {secondaryInquiries.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onSwitchToDecide(q)}
                      className={`group flex items-center gap-1 px-2.5 py-1 text-[11.5px] rounded-lg transition-all text-left cursor-pointer ${
                        highContrast
                          ? 'font-bold text-slate-900 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-900 border border-slate-300'
                          : 'font-normal text-slate-600 dark:text-zinc-400 bg-slate-50/60 dark:bg-zinc-800/40 hover:bg-white dark:hover:bg-zinc-700/60 hover:text-slate-900 dark:hover:text-white border border-slate-200/40 dark:border-zinc-700/30'
                      }`}
                    >
                      <span className="truncate max-w-xs">{q}</span>
                      <ArrowRight size={10} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white transition-all shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* Central Primary Empty State or Results List */}
        {results.length === 0 ? (() => {
          const emptyInfo = FILTER_EMPTY_STATES[workspaceFilter] || FILTER_EMPTY_STATES.all;
          const targetWorkspace = workspaceFilter !== 'all' ? workspaceFilter : 'compose';
          return (
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center max-w-sm mx-auto">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3.5 ${
                highContrast
                  ? 'bg-slate-100 dark:bg-zinc-900 border-2 border-slate-400 text-black dark:text-white'
                  : 'bg-slate-100/70 dark:bg-zinc-800/60 border border-black/[0.04] dark:border-white/[0.06] text-slate-500 dark:text-zinc-400 shadow-2xs'
              }`}>
                {workspaceFilter !== 'all' ? (
                  <RegaarderProductIcon name={workspaceFilter} size={22} />
                ) : (
                  <Compass size={22} strokeWidth={1.5} />
                )}
              </div>
              <h3 className={`text-sm mb-1 ${
                highContrast ? 'font-black text-black dark:text-white' : 'font-semibold text-slate-900 dark:text-zinc-100'
              }`}>
                {query ? `No results for "${query}"` : emptyInfo.title}
              </h3>
              <p className={`text-xs leading-relaxed mb-4 ${
                highContrast ? 'text-slate-800 dark:text-zinc-300 font-medium' : 'text-slate-500 dark:text-zinc-400'
              }`}>
                {query
                  ? 'No matching documents, formulas, or tasks found in this workspace.'
                  : emptyInfo.desc}
              </p>
              {!query && onNavigateToWorkspace && (
                <button
                  type="button"
                  onClick={() => onNavigateToWorkspace({ workspace: targetWorkspace })}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-zinc-100 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <span>Create {WORKSPACE_LABELS[workspaceFilter] || 'Document'}</span>
                  <ArrowRight size={12} />
                </button>
              )}
            </div>
          );
        })() : (
          results.map(({ entity, relevanceScore, relevanceRationale, connectedCount }, idx) => {
            const cleanRationale = relevanceRationale?.replace(/organizational memory/gi, 'workspace intelligence') || 'Indexed workspace entity across connected documents and models.';
            const isSelected = selectedIndex === idx;

            return (
              <div
                key={entity.id}
                onMouseEnter={() => onSelectIndex && onSelectIndex(idx)}
                onClick={() => onSelectIndex && onSelectIndex(idx)}
                className={`group relative flex flex-col p-5 rounded-xl transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? highContrast
                      ? 'bg-white dark:bg-zinc-950 border-2 border-black dark:border-white ring-2 ring-black dark:ring-white shadow-md'
                      : 'bg-white dark:bg-zinc-800 ring-1 ring-slate-300 dark:ring-zinc-600 shadow-sm border border-slate-200/80 dark:border-zinc-700'
                    : highContrast
                    ? 'bg-white dark:bg-zinc-950 border-2 border-slate-400 dark:border-zinc-600 shadow-sm'
                    : 'bg-white/80 dark:bg-zinc-800/60 shadow-2xs hover:bg-white dark:hover:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60'
                }`}
              >
                {/* Header Row: Neutral Product Icon + Title + Workspace Badge */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      highContrast
                        ? 'bg-slate-100 dark:bg-zinc-900 text-black dark:text-white border-2 border-slate-400 dark:border-zinc-600'
                        : 'bg-slate-100/80 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-700/60'
                    }`}>
                      <RegaarderProductIcon name={entity.workspace} size={15} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-[15.5px] truncate transition-colors ${
                          highContrast
                            ? 'font-extrabold text-black dark:text-white group-hover:text-[#7C5ACF]'
                            : isSelected
                            ? 'font-semibold text-[#7C5ACF] dark:text-[#a78bfa]'
                            : 'font-semibold text-slate-900 dark:text-zinc-100 group-hover:text-[#7C5ACF] dark:group-hover:text-[#a78bfa]'
                        }`}>
                          {entity.title}
                        </h4>
                        <span className={`text-[10.5px] uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          highContrast
                            ? 'font-bold border-2 border-slate-500 dark:border-zinc-600 text-slate-900 dark:text-zinc-100 bg-slate-100 dark:bg-zinc-900'
                            : 'font-semibold bg-slate-100 dark:bg-zinc-800/70 text-slate-600 dark:text-zinc-400 border-0'
                        }`}>
                          {entity.workspace}
                        </span>
                      </div>
                      <div className={`flex items-center gap-2 text-xs mt-0.5 ${
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
                    <span className={`px-2.5 py-1 text-xs rounded-lg shrink-0 font-mono ${
                      highContrast
                        ? 'font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-950 dark:text-emerald-200 border-2 border-emerald-500'
                        : 'font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                    }`}>
                      {entity.metadata.cellValue}
                    </span>
                  )}
                  {entity.metadata?.headlineMetric && !entity.metadata?.cellValue && (
                    <span className={`px-2.5 py-1 text-xs rounded-lg shrink-0 font-mono ${
                      highContrast
                        ? 'font-extrabold bg-slate-100 dark:bg-zinc-900 text-black dark:text-white border-2 border-slate-400'
                        : 'font-semibold bg-slate-100 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-700'
                    }`}>
                      {entity.metadata.headlineMetric}
                    </span>
                  )}
                </div>

                {/* ── "Why this is relevant" Semantic Rationale Banner ── */}
                {cleanRationale && (
                  <div className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs mb-3 ${
                    highContrast
                      ? 'bg-slate-100 dark:bg-zinc-900 border-2 border-slate-300 dark:border-zinc-700 text-black dark:text-white font-bold'
                      : 'bg-slate-50/90 dark:bg-zinc-800/40 border-0 text-slate-600 dark:text-zinc-300 font-normal'
                  }`}>
                    <RegaarderAiIcon size={14} className="text-[#7C5ACF] dark:text-[#a78bfa] shrink-0" />
                    <span className="truncate">{cleanRationale}</span>
                  </div>
                )}

                {/* Context Excerpt */}
                <p className={`text-[13.5px] line-clamp-2 leading-relaxed mb-3 ${
                  highContrast ? 'font-medium text-slate-900 dark:text-zinc-100' : 'font-normal text-slate-600 dark:text-zinc-400'
                }`}>
                  {entity.excerpt || entity.content}
                </p>

                {/* Specific technical details (Formula, Slide, Timestamp Quote) */}
                {entity.metadata?.formula && (
                  <div className={`flex items-center gap-2 text-xs font-mono px-2.5 py-1 rounded-lg mb-3 w-fit ${
                    highContrast
                      ? 'text-black dark:text-white bg-slate-100 dark:bg-zinc-900 border-2 border-slate-400 font-extrabold'
                      : 'text-slate-800 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800/50 border border-slate-200/60 font-semibold'
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

                  <div className="flex items-center gap-1.5">
                    {/* Ghost Navigation Actions */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSwitchToMap(entity);
                      }}
                      className="px-2.5 py-1.5 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer"
                      title="View dynamic knowledge graph around this entity"
                    >
                      <Network size={12} />
                      <span>Map</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSwitchToUnderstand(entity);
                      }}
                      className="px-2.5 py-1.5 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer"
                      title="Inspect evidence and connection provenance"
                    >
                      <Layers size={12} />
                      <span>Understand</span>
                    </button>
                    {/* Primary Action (Apple-style Refined Button) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToWorkspace(entity);
                      }}
                      className={`px-4 py-1.5 rounded-xl font-semibold text-xs transition-all duration-150 flex items-center gap-1.5 cursor-pointer ml-1 ${
                        isSelected
                          ? 'bg-[#7C5ACF] text-white hover:bg-[#6b47be] shadow-xs'
                          : 'bg-violet-50 dark:bg-violet-950/60 hover:bg-[#7C5ACF] text-[#7C5ACF] dark:text-[#a78bfa] hover:text-white border border-violet-100 dark:border-violet-900/40 shadow-2xs hover:shadow-xs'
                      }`}
                    >
                      <span>Open</span>
                      {isSelected ? (
                        <kbd className="px-1 py-0.2 rounded bg-white/20 text-[10px] font-mono leading-tight">↵</kbd>
                      ) : (
                        <ArrowRight size={12} />
                      )}
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
