import React, { useState, useEffect, useMemo } from 'react';
import { 
  HardDrive, FileText, MessageSquare, Brain, User, Key, Layers, 
  Trash2, Download, ShieldCheck, Check, AlertTriangle, RefreshCw, 
  CheckSquare, Square, Inbox
} from 'lucide-react';
import { 
  STORAGE_CATEGORIES, 
  getStorageBreakdown, 
  deleteStorageCategories, 
  exportUserDataArchive, 
  formatBytes 
} from '../services/storageManagerService';

const ICON_MAP = {
  FileText,
  MessageSquare,
  Brain,
  User,
  Key,
  Layers
};

export default function StorageDataManagement({ showToast = () => {} }) {
  const [breakdown, setBreakdown] = useState(() => getStorageBreakdown());
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const refreshMetrics = () => {
    const updated = getStorageBreakdown();
    setBreakdown(updated);
  };

  useEffect(() => {
    refreshMetrics();

    const handleStorageCleared = () => {
      refreshMetrics();
    };

    window.addEventListener('regaarder:storage-cleared', handleStorageCleared);
    return () => window.removeEventListener('regaarder:storage-cleared', handleStorageCleared);
  }, []);

  // Only display categories with real data (itemCount > 0)
  const activeCategories = useMemo(() => {
    return STORAGE_CATEGORIES.filter(cat => {
      const data = breakdown.categories[cat.id];
      return data && data.itemCount > 0 && data.bytes > 0;
    });
  }, [breakdown]);

  const hasData = activeCategories.length > 0 && breakdown.totalItems > 0 && breakdown.totalBytes > 0;

  const totalActiveCount = activeCategories.length;
  const isAllSelected = totalActiveCount > 0 && selectedCategoryIds.length === totalActiveCount;
  const isNoneSelected = selectedCategoryIds.length === 0;

  const toggleCategory = (id) => {
    setSelectedCategoryIds(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedCategoryIds([]);
    } else {
      setSelectedCategoryIds(activeCategories.map(c => c.id));
    }
  };

  const selectedStats = useMemo(() => {
    let bytes = 0;
    let items = 0;
    selectedCategoryIds.forEach(id => {
      const cat = breakdown.categories[id];
      if (cat) {
        bytes += cat.bytes;
        items += cat.itemCount;
      }
    });
    return {
      bytes,
      formattedBytes: formatBytes(bytes),
      items
    };
  }, [selectedCategoryIds, breakdown]);

  const handleExecuteDelete = () => {
    if (selectedCategoryIds.length === 0) return;
    setIsDeleting(true);

    try {
      const result = deleteStorageCategories(selectedCategoryIds);
      if (result.success) {
        showToast(`Successfully erased ${result.deletedCount} items (${result.formattedFreedBytes}) from device storage`);
        setSelectedCategoryIds([]);
        setConfirmModalOpen(false);
        refreshMetrics();
      } else {
        showToast('Error occurred while erasing storage: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      showToast('Deletion failed: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportData = () => {
    setIsExporting(true);
    try {
      const success = exportUserDataArchive();
      if (success) {
        showToast('Exported complete data archive (.json) in compliance with GDPR Art. 20');
      } else {
        showToast('Failed to export data archive');
      }
    } catch (err) {
      showToast('Export failed: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-[620px] text-slate-800 dark:text-zinc-100 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-100 tracking-tight flex items-center gap-2.5">
            <HardDrive size={22} className="text-violet-600 dark:text-violet-400" />
            Storage & Data Management
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
            Inspect, export, or selectively purge data stored on your device and browser with full GDPR Art. 17 compliance.
          </p>
        </div>
        <button
          type="button"
          onClick={refreshMetrics}
          className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 transition-colors"
          title="Refresh storage metrics"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {hasData ? (
        <>
          {/* Storage Visualizer Breakdown Card */}
          <div className="my-6 p-5 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Device Storage Used</span>
                <div className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight mt-0.5">
                  {breakdown.formattedTotalBytes}
                  <span className="text-xs font-normal text-slate-500 dark:text-zinc-400 ml-2">across {breakdown.totalItems} stored items</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleExportData}
                disabled={isExporting || breakdown.totalItems === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/80 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold transition-all disabled:opacity-50"
              >
                <Download size={13} />
                {isExporting ? 'Exporting...' : 'Export Archive (.json)'}
              </button>
            </div>

            {/* Visual Segmented Progress Bar */}
            <div className="w-full h-3.5 bg-slate-100 dark:bg-zinc-800 rounded-lg overflow-hidden flex shadow-inner">
              {activeCategories.map(cat => {
                const data = breakdown.categories[cat.id];
                const pct = data?.percentage || 0;
                if (pct <= 0) return null;
                return (
                  <div
                    key={cat.id}
                    style={{ width: `${pct}%`, backgroundColor: cat.color }}
                    className="h-full transition-all duration-300 relative group"
                    title={`${cat.name}: ${data.formattedBytes} (${pct}%)`}
                  />
                );
              })}
            </div>

            {/* Segmented Legend Chips (Only active categories with real data) */}
            <div className="flex items-center gap-x-4 gap-y-2 flex-wrap pt-1 text-[11px] text-slate-600 dark:text-zinc-400 font-medium">
              {activeCategories.map(cat => {
                const data = breakdown.categories[cat.id];
                return (
                  <div key={cat.id} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: cat.color }}></span>
                    <span>{cat.name.split(' ')[0]}:</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">{data?.formattedBytes || '0 B'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Granular Selection Controls Toolbar */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                {isAllSelected ? <CheckSquare size={14} className="text-violet-600" /> : isNoneSelected ? <Square size={14} /> : <CheckSquare size={14} className="text-violet-400" />}
                {isAllSelected ? 'Deselect All' : 'Select All Categories'}
              </button>
              {selectedCategoryIds.length > 0 && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/60">
                  {selectedCategoryIds.length} selected ({selectedStats.formattedBytes})
                </span>
              )}
            </div>

            {/* Delete Selected Action Trigger */}
            <button
              type="button"
              disabled={isNoneSelected}
              onClick={() => setConfirmModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-40 disabled:hover:bg-red-600 cursor-pointer disabled:cursor-not-allowed"
            >
              <Trash2 size={13} />
              Delete Selected Data
            </button>
          </div>

          {/* Category List (Only displayed when there is real data) */}
          <div className="space-y-2.5 mb-6">
            {activeCategories.map(cat => {
              const data = breakdown.categories[cat.id] || { bytes: 0, itemCount: 0, formattedBytes: '0 B' };
              const IconComponent = ICON_MAP[cat.icon] || FileText;
              const isSelected = selectedCategoryIds.includes(cat.id);

              return (
                <div
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected 
                      ? 'bg-violet-50/50 dark:bg-violet-950/20 border-violet-300 dark:border-violet-800/70 shadow-xs' 
                      : 'bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div 
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                        isSelected 
                          ? 'bg-violet-600 border-violet-600 text-white' 
                          : 'border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800'
                      }`}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>

                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" 
                      style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                    >
                      <IconComponent size={16} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">{cat.name}</h4>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">({data.itemCount} items)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">{cat.description}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 font-mono">{data.formattedBytes}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="my-8 py-12 px-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 flex flex-col items-center justify-center text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-500">
            <Inbox size={24} strokeWidth={1.75} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">No data stored yet</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm">
              Your device and browser storage is clean and empty. Documents, chats, memories, and workspace files will appear here as you create them.
            </p>
          </div>
        </div>
      )}

      {/* GDPR & Legal Compliance Notice Card */}
      <div className="p-4 bg-slate-50/80 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 rounded-2xl flex items-start gap-3">
        <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-[12px] leading-relaxed text-slate-600 dark:text-zinc-400 space-y-1">
          <div className="font-bold text-slate-800 dark:text-zinc-200">GDPR & Universal Privacy Compliance</div>
          <p>
            In accordance with <strong>GDPR Article 17 (Right to Erasure / &quot;Right to be Forgotten&quot;)</strong> and <strong>Article 20 (Right to Data Portability)</strong>, deleting data immediately evacuates all targeted identifiers, document contents, and AI context logs from this device.
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 max-w-[440px] w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-200 dark:border-red-900/60">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">Permanently Delete Data?</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200/80 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 space-y-2">
              <div className="flex justify-between">
                <span>Selected categories:</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">{selectedCategoryIds.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Items to purge:</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">{selectedStats.items} items</span>
              </div>
              <div className="flex justify-between">
                <span>Storage space freed:</span>
                <span className="font-bold text-red-600 dark:text-red-400 font-mono">{selectedStats.formattedBytes}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Selected categories will be immediately erased from your device in compliance with GDPR Art. 17.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleExecuteDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Trash2 size={13} />
                {isDeleting ? 'Erasing Data...' : 'Confirm & Erase'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
