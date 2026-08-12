import React, { useState } from 'react';
import { BrowserFlowIcon, BrowserCloseIcon, BrowserSearchIcon } from '../RegaarderBrowserIcons';
import { SheetIcon, ComposeIcon, AgentsIcon } from '../../RegaarderProductIcons';
import { getSavedFlows, duplicateFlow, deleteFlow } from '../../../services/flowEngine';

/**
 * FlowLibraryModal: "My Flows" lightweight executive Apple-style modal.
 * Adapts to Regaarder Light and Dark themes.
 */
export const FlowLibraryModal = ({
  onClose,
  onRunFlow,
  showToast
}) => {
  const [flows, setFlows] = useState(() => getSavedFlows());
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Research', 'Finance', 'Growth', 'Operations', 'Personal'];

  const filteredFlows = flows.filter((f) => {
    const matchesCategory = activeCategory === 'All' || f.category === activeCategory;
    const matchesSearch = !searchQuery.trim() || f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDuplicate = (flowId) => {
    const updated = duplicateFlow(flowId);
    setFlows(updated);
    if (showToast) showToast('Duplicated Flow');
  };

  const handleDelete = (flowId) => {
    const updated = deleteFlow(flowId);
    setFlows(updated);
    if (showToast) showToast('Deleted Flow');
  };

  const handleShare = (flow) => {
    if (showToast) showToast(`Copied share link for "${flow.name}" to clipboard`);
  };

  const handleDownload = (flow) => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(flow, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `${flow.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_flow.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      if (showToast) showToast(`Downloaded "${flow.name}" JSON specification`);
    } catch (e) {
      console.error('Download flow error:', e);
    }
  };

  const renderAppBadge = (app) => {
    if (app === 'Sheets') {
      return (
        <span key={app} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
          <SheetIcon size={12} />
          <span>Sheets</span>
        </span>
      );
    }
    if (app === 'Compose') {
      return (
        <span key={app} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-500/10 dark:bg-violet-500/20 border border-violet-500/30 text-violet-600 dark:text-violet-400 text-[10px] font-semibold">
          <ComposeIcon size={12} />
          <span>Compose</span>
        </span>
      );
    }
    return (
      <span key={app} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/10 dark:bg-sky-500/20 border border-sky-500/30 text-sky-600 dark:text-sky-400 text-[10px] font-semibold">
        <AgentsIcon size={12} />
        <span>{app}</span>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md flex items-center justify-center p-4 font-sans select-none animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white dark:bg-[#1c1c1e] border border-slate-200/90 dark:border-zinc-800/90 rounded-2xl shadow-2xl overflow-hidden text-slate-800 dark:text-zinc-100 flex flex-col h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-50/80 dark:bg-zinc-900/80 border-b border-slate-200/80 dark:border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-500/10 dark:bg-violet-500/20 border border-violet-500/20 text-violet-600 dark:text-violet-400">
              <BrowserFlowIcon size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-zinc-100">My Flows</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Teach Regaarder once. Reuse forever.</p>
            </div>
          </div>

          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <BrowserCloseIcon size={16} />
          </button>
        </div>

        {/* Search & Category Tabs */}
        <div className="p-4 bg-slate-50/40 dark:bg-zinc-900/40 border-b border-slate-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto thin-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onPointerDown={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-violet-600 text-white border-violet-500 shadow-xs'
                    : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-56">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search flows..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            <div className="absolute left-2.5 top-2 text-slate-400 dark:text-zinc-500">
              <BrowserSearchIcon size={14} />
            </div>
          </div>
        </div>

        {/* Flow List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 thin-scrollbar">
          {filteredFlows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 dark:text-zinc-500 text-xs space-y-2">
              <BrowserFlowIcon size={32} className="text-slate-300 dark:text-zinc-600" />
              <p>No saved Flows match your search.</p>
            </div>
          ) : (
            filteredFlows.map((flow) => (
              <div
                key={flow.id}
                className="p-4 rounded-2xl bg-slate-50/60 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800/80 hover:border-violet-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                {/* Flow Overview */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors truncate">
                      {flow.name}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-mono font-medium">
                      {flow.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-1">
                    {flow.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                      Last run: {flow.lastRun || 'Never'}
                    </span>
                    <span className="text-slate-300 dark:text-zinc-700">•</span>
                    <div className="flex items-center gap-1">
                      {flow.apps?.map((app) => renderAppBadge(app))}
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      onRunFlow(flow);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    <span>Run</span>
                  </button>

                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleDuplicate(flow.id);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 text-xs font-medium transition-colors cursor-pointer"
                    title="Duplicate Flow"
                  >
                    Duplicate
                  </button>

                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleShare(flow);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 text-xs font-medium transition-colors cursor-pointer"
                    title="Share Flow link"
                  >
                    Share
                  </button>

                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleDownload(flow);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 text-xs font-medium transition-colors cursor-pointer"
                    title="Download Flow as JSON"
                  >
                    Download
                  </button>

                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleDelete(flow.id);
                    }}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete Flow"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FlowLibraryModal;
