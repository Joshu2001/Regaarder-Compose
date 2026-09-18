import React, { useState, useMemo } from 'react';
import { Search, X, Check, FileText, Plus, Filter } from 'lucide-react';
import { AppNativeSvgIcon } from '../home/AppNativeSvgIcon';

/**
 * AddExistingFilesToProjectModal
 *
 * An executive, Apple-style modal allowing users to select one or multiple existing
 * workspace documents (docs, sheets, decks, whiteboards, notes) and assign them
 * to the active project.
 */
export default function AddExistingFilesToProjectModal({
  isOpen,
  project,
  allDocuments = [],
  onClose,
  onAddFiles
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [modeFilter, setModeFilter] = useState('all'); // 'all' | 'compose' | 'sheets' | 'deck' | 'notes' | 'whiteboard'

  // Filter documents that are NOT already in this project
  const availableDocuments = useMemo(() => {
    if (!project) return [];
    return allDocuments.filter((d) => d.projectId !== project.id);
  }, [allDocuments, project]);

  // Filtered by search and mode
  const filteredDocuments = useMemo(() => {
    let result = availableDocuments;

    if (modeFilter !== 'all') {
      result = result.filter((d) => (d.mode || 'compose') === modeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((d) => (d.title || 'Untitled').toLowerCase().includes(q));
    }

    return result;
  }, [availableDocuments, modeFilter, searchQuery]);

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setSelectedDocIds([]);
      setSearchQuery('');
      setModeFilter('all');
    }
  }, [isOpen]);

  if (!isOpen || !project) return null;

  const toggleDoc = (id) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedDocIds.length === filteredDocuments.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(filteredDocuments.map((d) => d.id));
    }
  };

  const handleConfirm = () => {
    if (selectedDocIds.length === 0) return;
    if (onAddFiles) {
      onAddFiles(selectedDocIds);
    }
    onClose();
  };

  const modeFiltersList = [
    { id: 'all', label: 'All Files' },
    { id: 'compose', label: 'Docs' },
    { id: 'sheets', label: 'Sheets' },
    { id: 'deck', label: 'Decks' },
    { id: 'notes', label: 'Notes' },
    { id: 'whiteboard', label: 'Whiteboard' }
  ];

  return (
    <div
      className="fixed inset-0 z-[1200] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none font-sans"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-zinc-850 rounded-2xl shadow-2xl border border-black/[0.08] dark:border-white/[0.1] overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              Add files to the &ldquo;{project.name}&rdquo; project
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              Select files from your workspace to link to this project
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-black/[0.04] transition-colors cursor-pointer border-none bg-transparent"
          >
            <X size={16} />
          </button>
        </div>

        {/* Filter Controls & Search */}
        <div className="p-3.5 border-b border-black/[0.04] dark:border-white/[0.06] space-y-2.5">
          <div className="relative flex items-center">
            <Search
              size={14}
              className="absolute left-3.5 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files by title..."
              className="w-full h-9 pl-10 pr-3.5 rounded-xl bg-slate-100/80 dark:bg-zinc-800/80 text-xs text-slate-800 dark:text-zinc-100 placeholder:text-slate-400/90 focus:outline-none focus:ring-2 focus:ring-violet-500/20 border border-transparent focus:border-slate-200 dark:focus:border-zinc-700 transition-all"
              autoFocus
            />
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto thin-scrollbar pb-0.5">
            {modeFiltersList.map((filter) => {
              const isActive = modeFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setModeFilter(filter.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border-none shrink-0 ${
                    isActive
                      ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 shadow-2xs'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200/70 dark:hover:bg-zinc-700'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Select All Row */}
        {filteredDocuments.length > 0 && (
          <div className="px-5 py-2 border-b border-slate-100 dark:border-white/[0.04] bg-slate-50/40 dark:bg-zinc-800/30 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-zinc-400 font-medium">
              {filteredDocuments.length} available file{filteredDocuments.length === 1 ? '' : 's'}
            </span>
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-violet-600 dark:text-violet-400 hover:underline font-semibold cursor-pointer border-none bg-transparent text-[11px]"
            >
              {selectedDocIds.length === filteredDocuments.length ? 'Deselect all' : 'Select all'}
            </button>
          </div>
        )}

        {/* File Picker List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 max-h-64 thin-scrollbar">
          {availableDocuments.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-zinc-500">
              <FileText size={24} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs font-semibold">No other files available</p>
              <p className="text-[11px]">All your workspace files are already linked to this project.</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="py-10 text-center text-slate-400 dark:text-zinc-500">
              <p className="text-xs font-semibold">No matching files found</p>
              <p className="text-[11px]">Try clearing your search query or filter.</p>
            </div>
          ) : (
            filteredDocuments.map((doc) => {
              const isSelected = selectedDocIds.includes(doc.id);
              return (
                <div
                  key={doc.id}
                  onClick={() => toggleDoc(doc.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-violet-50/80 dark:bg-violet-950/40 border-violet-300 dark:border-violet-700/60 shadow-2xs'
                      : 'border-slate-200/60 dark:border-white/[0.06] hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                      <AppNativeSvgIcon type={doc.mode || 'compose'} size={17} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate leading-snug">
                        {doc.title || 'Untitled Document'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10.5px] text-slate-400 dark:text-zinc-500">
                        <span className="capitalize">{doc.mode || 'document'}</span>
                        <span>•</span>
                        <span>Updated {new Date(doc.updatedAt || doc.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-colors shrink-0 ml-3 ${
                      isSelected
                        ? 'bg-violet-600 border-violet-600 text-white'
                        : 'border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'
                    }`}
                  >
                    {isSelected && <Check size={11} strokeWidth={3} />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-black/[0.06] dark:border-white/[0.08] bg-slate-50/50 dark:bg-zinc-800/40 flex items-center justify-between gap-3">
          <div className="text-[11.5px] text-slate-500 dark:text-zinc-400 truncate">
            {selectedDocIds.length === 0 ? (
              <span>Select files to attach</span>
            ) : (
              <span className="font-semibold text-violet-600 dark:text-violet-400">
                {selectedDocIds.length} file{selectedDocIds.length === 1 ? '' : 's'} selected
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-zinc-400 hover:bg-black/[0.05] transition-colors cursor-pointer border-none bg-transparent"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selectedDocIds.length === 0}
              onClick={handleConfirm}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer border-none"
            >
              <Plus size={13} />
              <span>Add to project</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
