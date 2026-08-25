import React, { useState, useEffect, useMemo } from 'react';
import { 
  HardDrive, FileText, MessageSquare, Brain, User, Key, Layers, 
  Trash2, Download, ShieldCheck, Check, AlertTriangle, RefreshCw, 
  CheckSquare, Square, Inbox
} from 'lucide-react';
import { useTranslation } from '../i18n';
import { 
  STORAGE_CATEGORIES, 
  getStorageBreakdown, 
  deleteStorageCategories, 
  clearAllStorage,
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
  const { t } = useTranslation();
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

  const categoriesWithData = useMemo(() => {
    return STORAGE_CATEGORIES.filter(cat => {
      const data = breakdown.categories[cat.id];
      return data && data.itemCount > 0 && data.bytes > 0;
    });
  }, [breakdown]);

  const hasAnyStoredData = breakdown.totalItems > 0 && breakdown.totalBytes > 0;

  const isAllSelected = categoriesWithData.length > 0 && selectedCategoryIds.length === categoriesWithData.length;
  const isNoneSelected = selectedCategoryIds.length === 0;

  const toggleCategory = (id) => {
    const data = breakdown.categories[id];
    if (!data || data.itemCount === 0) return;
    setSelectedCategoryIds(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedCategoryIds([]);
    } else {
      setSelectedCategoryIds(categoriesWithData.map(c => c.id));
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
        showToast(`${t('common.done')}: ${result.deletedCount} ${t('common.items')} (${result.formattedFreedBytes})`);
        setSelectedCategoryIds([]);
        setConfirmModalOpen(false);
        refreshMetrics();
      } else {
        showToast('Error: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      showToast('Error: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearAllStorage = () => {
    setIsDeleting(true);
    try {
      const result = clearAllStorage();
      if (result.success) {
        showToast(t('storage.emptyStateHeadline'));
        setSelectedCategoryIds([]);
        setConfirmModalOpen(false);
        refreshMetrics();
      } else {
        showToast('Error: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      showToast('Error: ' + err.message);
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
            {t('storage.title')}
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
            {t('storage.subtitle')}
          </p>
        </div>
        <button
          type="button"
          onClick={refreshMetrics}
          className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 transition-colors cursor-pointer"
          title={t('common.refresh')}
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Storage Visualizer Breakdown Card */}
      <div className="my-6 p-5 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('storage.deviceStorageUsed')}</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight mt-0.5">
              {hasAnyStoredData ? breakdown.formattedTotalBytes : '0 B'}
              <span className="text-xs font-normal text-slate-500 dark:text-zinc-400 ml-2">
                {t('storage.storedAcross', {
                  count: hasAnyStoredData ? breakdown.totalItems : 0,
                  itemUnit: (hasAnyStoredData ? breakdown.totalItems : 0) === 1 ? t('common.item') : t('common.items')
                })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasAnyStoredData && (
              <button
                type="button"
                onClick={handleClearAllStorage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 text-xs font-semibold transition-all cursor-pointer"
                title="Purge all stored workspace data"
              >
                <Trash2 size={12} />
                {t('storage.purgeAll')}
              </button>
            )}
            <button
              type="button"
              onClick={handleExportData}
              disabled={isExporting || !hasAnyStoredData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/80 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold transition-all disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <Download size={13} />
              {isExporting ? t('common.loading') : t('storage.exportArchive')}
            </button>
          </div>
        </div>

        {/* Segmented Progress Bar */}
        <div className="w-full h-3 bg-slate-100 dark:bg-zinc-800 rounded-lg overflow-hidden flex shadow-inner">
          {hasAnyStoredData ? (
            categoriesWithData.map(cat => {
              const data = breakdown.categories[cat.id];
              const pct = data?.percentage || 0;
              if (pct <= 0) return null;
              const catName = t(`storage.categories.${cat.id}.name`);
              return (
                <div
                  key={cat.id}
                  style={{ width: `${pct}%`, backgroundColor: cat.color }}
                  className="h-full transition-all duration-300 relative group"
                  title={`${catName}: ${data.formattedBytes} (${pct}%)`}
                />
              );
            })
          ) : (
            <div className="w-full h-full bg-slate-200/50 dark:bg-zinc-800/50" />
          )}
        </div>

        {/* Legend Chips */}
        {hasAnyStoredData ? (
          <div className="flex items-center gap-x-4 gap-y-2 flex-wrap pt-1 text-[11px] text-slate-600 dark:text-zinc-400 font-medium">
            {categoriesWithData.map(cat => {
              const data = breakdown.categories[cat.id];
              const catName = t(`storage.categories.${cat.id}.name`);
              return (
                <div key={cat.id} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: cat.color }}></span>
                  <span>{catName.split(' ')[0]}:</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">{data?.formattedBytes || '0 B'}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-[11.5px] text-slate-400 dark:text-zinc-500 font-normal">
            {t('storage.emptyStateHeadline')}
          </div>
        )}
      </div>

      {/* Selection Toolbar */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={categoriesWithData.length === 0}
            onClick={handleSelectAll}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isAllSelected ? <CheckSquare size={14} className="text-violet-600" /> : isNoneSelected ? <Square size={14} /> : <CheckSquare size={14} className="text-violet-400" />}
            {isAllSelected ? t('storage.deselectAll') : t('storage.selectAll')}
          </button>
          {selectedCategoryIds.length > 0 && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/60">
              {t('storage.selectedCount', { count: selectedCategoryIds.length, size: selectedStats.formattedBytes })}
            </span>
          )}
        </div>

        {/* Delete Selected Action Button */}
        <button
          type="button"
          disabled={isNoneSelected}
          onClick={() => setConfirmModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-40 disabled:hover:bg-red-600 cursor-pointer disabled:cursor-not-allowed"
        >
          <Trash2 size={13} />
          {t('storage.deleteSelected')}
        </button>
      </div>

      {/* Categories List */}
      <div className="space-y-2.5 mb-6">
        {STORAGE_CATEGORIES.map(cat => {
          const data = breakdown.categories[cat.id] || { bytes: 0, itemCount: 0, formattedBytes: '0 B' };
          const IconComponent = ICON_MAP[cat.icon] || FileText;
          const hasData = data.itemCount > 0 && data.bytes > 0;
          const isSelected = selectedCategoryIds.includes(cat.id);
          const catName = t(`storage.categories.${cat.id}.name`);
          const catDesc = t(`storage.categories.${cat.id}.description`);
          const catEmpty = t(`storage.categories.${cat.id}.emptyText`);

          return (
            <div
              key={cat.id}
              onClick={() => {
                if (hasData) toggleCategory(cat.id);
              }}
              className={`p-3.5 rounded-xl border transition-all ${
                hasData 
                  ? isSelected 
                    ? 'bg-violet-50/50 dark:bg-violet-950/20 border-violet-300 dark:border-violet-800/70 shadow-xs cursor-pointer' 
                    : 'bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 cursor-pointer'
                  : 'bg-slate-50/60 dark:bg-zinc-900/40 border-slate-200/50 dark:border-zinc-800/50 cursor-default opacity-85'
              } flex items-center justify-between gap-3`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div 
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                    hasData
                      ? isSelected 
                        ? 'bg-violet-600 border-violet-600 text-white' 
                        : 'border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800'
                      : 'border-slate-200 dark:border-zinc-800 bg-slate-100/50 dark:bg-zinc-800/30'
                  }`}
                >
                  {hasData && isSelected && <Check size={12} strokeWidth={3} />}
                </div>

                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" 
                  style={{ 
                    backgroundColor: hasData ? `${cat.color}15` : 'rgba(148, 163, 184, 0.1)', 
                    color: hasData ? cat.color : '#94a3b8' 
                  }}
                >
                  <IconComponent size={15} />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-xs font-bold truncate ${hasData ? 'text-slate-800 dark:text-zinc-200' : 'text-slate-600 dark:text-zinc-400'}`}>
                      {catName}
                    </h4>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${hasData ? 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-semibold' : 'bg-slate-100/60 dark:bg-zinc-800/40 text-slate-400 dark:text-zinc-500'}`}>
                      {hasData ? `${data.itemCount} ${data.itemCount === 1 ? t('common.item') : t('common.items')}` : `0 ${t('common.items')}`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">
                    {hasData ? catDesc : catEmpty}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className={`text-xs font-mono font-bold ${hasData ? 'text-slate-800 dark:text-zinc-200' : 'text-slate-400 dark:text-zinc-600'}`}>
                  {data.formattedBytes}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* GDPR Notice */}
      <div className="p-4 bg-slate-50/80 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 rounded-2xl flex items-start gap-3">
        <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-[12px] leading-relaxed text-slate-600 dark:text-zinc-400 space-y-1">
          <div className="font-bold text-slate-800 dark:text-zinc-200">{t('storage.gdprNoticeTitle')}</div>
          <p>{t('storage.gdprNoticeText')}</p>
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
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">{t('storage.confirmTitle')}</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{t('storage.confirmSubtitle')}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200/80 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 space-y-2">
              <div className="flex justify-between">
                <span>Selected categories:</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">{selectedCategoryIds.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Items to purge:</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">{selectedStats.items} {t('common.items')}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('storage.confirmFreed')}</span>
                <span className="font-bold text-red-600 dark:text-red-400 font-mono">{selectedStats.formattedBytes}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                {t('storage.confirmCancel')}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleExecuteDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? t('common.loading') : t('storage.confirmErase')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
