import React, { useState, useEffect } from 'react';
import { Monitor, AppWindow, FileText, Check, X, ShieldCheck, Sparkles, Sliders, Volume2 } from 'lucide-react';

export default function ScreenShareSourceModal({ isOpen, onClose, onSelectSource }) {
  const [sources, setSources] = useState([]);
  const [selectedSourceId, setSelectedSourceId] = useState('clean-docs');
  const [activeTab, setActiveTab] = useState('clean'); // 'clean' | 'windows' | 'screens'
  const [isLoading, setIsLoading] = useState(false);
  const [shareAudio, setShareAudio] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchSources = async () => {
      setIsLoading(true);
      try {
        if (window.electronAPI?.getDesktopSources) {
          const rawSources = await window.electronAPI.getDesktopSources(['screen', 'window']);
          setSources(rawSources || []);
        } else {
          setSources([]);
        }
      } catch (err) {
        console.warn('Failed to load desktop sources:', err);
        setSources([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSources();
  }, [isOpen]);

  if (!isOpen) return null;

  const windowSources = sources.filter(s => s.id.startsWith('window:'));
  const screenSources = sources.filter(s => s.id.startsWith('screen:'));

  const cleanAppPresets = [
    {
      id: 'clean-docs',
      name: 'Docs Document Canvas',
      desc: 'Streams ONLY the active document page. Hides sidebars, AI assistant, chat, and OS taskbar.',
      icon: FileText,
      badge: 'Privacy Shield Active',
      isClean: true,
      mode: 'compose'
    },
    {
      id: 'clean-sheets',
      name: 'Sheets Spreadsheet Grid',
      desc: 'Streams ONLY the spreadsheet grid and formula canvas without UI chrome.',
      icon: FileText,
      badge: 'Privacy Shield Active',
      isClean: true,
      mode: 'sheets'
    },
    {
      id: 'clean-deck',
      name: 'Decks Presentation Slide',
      desc: 'Streams ONLY the presentation slide viewport.',
      icon: FileText,
      badge: 'Privacy Shield Active',
      isClean: true,
      mode: 'deck'
    },
    {
      id: 'clean-whiteboard',
      name: 'Whiteboard Infinite Canvas',
      desc: 'Streams ONLY the interactive whiteboard canvas and diagram shapes.',
      icon: FileText,
      badge: 'Privacy Shield Active',
      isClean: true,
      mode: 'whiteboard'
    },
    {
      id: 'clean-full',
      name: 'Full Workspace App Grid',
      desc: 'Streams the complete multi-tab workspace application layout.',
      icon: Monitor,
      badge: 'Full App Active',
      isClean: true,
      mode: 'compose'
    }
  ];

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      if (selectedSourceId.startsWith('clean-')) {
        const preset = cleanAppPresets.find(p => p.id === selectedSourceId);
        await onSelectSource?.({
          type: 'clean-preset',
          preset: preset || cleanAppPresets[0],
          sourceId: selectedSourceId,
          shareAudio
        });
      } else {
        const found = sources.find(s => s.id === selectedSourceId);
        await onSelectSource?.({
          type: 'desktop-source',
          source: found || { id: selectedSourceId, name: 'Screen' },
          sourceId: selectedSourceId,
          shareAudio
        });
      }
    } catch (err) {
      console.error('Selection error:', err);
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 select-none font-sans"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-[32px] border border-slate-200/80 dark:border-zinc-800 shadow-[0_32px_100px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Monitor size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Choose What to Share</h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">Select an isolated application canvas, window, or entire screen</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-6 pt-3 pb-2 flex gap-2 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/50">
          <button
            type="button"
            onClick={() => { setActiveTab('clean'); setSelectedSourceId('clean-docs'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'clean'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800'
            }`}
          >
            <ShieldCheck size={13} />
            <span>Clean App Canvas (Privacy Safe)</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('windows'); if (windowSources[0]) setSelectedSourceId(windowSources[0].id); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'windows'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800'
            }`}
          >
            <AppWindow size={13} />
            <span>Windows ({windowSources.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('screens'); if (screenSources[0]) setSelectedSourceId(screenSources[0].id); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'screens'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800'
            }`}
          >
            <Monitor size={13} />
            <span>Entire Screen ({screenSources.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[340px] overflow-y-auto thin-scrollbar">
          {activeTab === 'clean' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {cleanAppPresets.map((preset) => {
                const isSelected = selectedSourceId === preset.id;
                const Icon = preset.icon;
                return (
                  <div
                    key={preset.id}
                    onClick={() => setSelectedSourceId(preset.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between text-left relative ${
                      isSelected
                        ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-950/20 ring-2 ring-violet-500/20 shadow-md'
                        : 'border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300 flex items-center justify-center">
                        <Icon size={18} />
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-xs">
                          <Check size={12} strokeWidth={2.5} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{preset.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed mb-3">{preset.desc}</p>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800/60">
                        <ShieldCheck size={10} />
                        <span>{preset.badge}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'windows' && (
            <div className="grid grid-cols-2 gap-3.5">
              {windowSources.length === 0 ? (
                <div className="col-span-2 p-8 text-center text-xs text-slate-400">
                  No individual window sources detected. You can share your entire screen or clean canvas.
                </div>
              ) : (
                windowSources.map((source) => {
                  const isSelected = selectedSourceId === source.id;
                  return (
                    <div
                      key={source.id}
                      onClick={() => setSelectedSourceId(source.id)}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col text-left relative ${
                        isSelected
                          ? 'border-violet-500 bg-violet-50/40 dark:bg-violet-950/20 ring-2 ring-violet-500/20 shadow-md'
                          : 'border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
                      }`}
                    >
                      <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-black/90 mb-2 border border-slate-200/60 dark:border-zinc-800 relative">
                        {source.thumbnail ? (
                          <img src={source.thumbnail} alt={source.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500 text-[10px]">Preview</div>
                        )}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-md">
                            <Check size={12} strokeWidth={2.5} />
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">{source.name || 'Window'}</span>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'screens' && (
            <div className="grid grid-cols-2 gap-3.5">
              {screenSources.length === 0 ? (
                <div className="col-span-2 p-8 text-center text-xs text-slate-400">
                  No display screens detected.
                </div>
              ) : (
                screenSources.map((source) => {
                  const isSelected = selectedSourceId === source.id;
                  return (
                    <div
                      key={source.id}
                      onClick={() => setSelectedSourceId(source.id)}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col text-left relative ${
                        isSelected
                          ? 'border-violet-500 bg-violet-50/40 dark:bg-violet-950/20 ring-2 ring-violet-500/20 shadow-md'
                          : 'border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
                      }`}
                    >
                      <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-black/90 mb-2 border border-slate-200/60 dark:border-zinc-800 relative">
                        {source.thumbnail ? (
                          <img src={source.thumbnail} alt={source.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500 text-[10px]">Screen</div>
                        )}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-md">
                            <Check size={12} strokeWidth={2.5} />
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">{source.name || 'Entire Display'}</span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400">Selected: <strong className="text-slate-700 dark:text-zinc-200 font-semibold">{selectedSourceId.startsWith('clean-') ? 'Isolated Canvas' : 'Window / Display'}</strong></span>
            <label className="flex items-center gap-1.5 cursor-pointer select-none bg-white dark:bg-zinc-800 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-zinc-700">
              <input
                type="checkbox"
                checked={shareAudio}
                onChange={(e) => setShareAudio(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-violet-600 focus:ring-violet-500 accent-violet-600 cursor-pointer"
              />
              <span className="text-[11px] font-medium text-slate-600 dark:text-zinc-300 flex items-center gap-1">
                <Volume2 size={12} className="text-slate-400" />
                Share System Audio
              </span>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Monitor size={13} />
              <span>Share Selected View</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
