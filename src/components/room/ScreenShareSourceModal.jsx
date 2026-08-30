import React, { useState, useEffect } from 'react';
import {
  Monitor, AppWindow, Check, X, ShieldCheck, Volume2, ScreenShare
} from 'lucide-react';
import {
  ComposeIcon,
  SheetIcon,
  DeckIcon,
  WhiteboardIcon
} from '../RegaarderProductIcons';

// Refined presets with concise Apple-style titles and subtitles
const CLEAN_PRESETS = [
  {
    id: 'clean-docs',
    name: 'Compose',
    subtitle: 'Active document',
    icon: ComposeIcon,
    iconBg: 'bg-blue-50 dark:bg-blue-950/40',
    iconColor: 'text-blue-500 dark:text-blue-400',
    mode: 'compose'
  },
  {
    id: 'clean-sheets',
    name: 'Sheets',
    subtitle: 'Active spreadsheet',
    icon: SheetIcon,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    mode: 'sheets'
  },
  {
    id: 'clean-deck',
    name: 'Decks',
    subtitle: 'Current slide',
    icon: DeckIcon,
    iconBg: 'bg-orange-50 dark:bg-orange-950/40',
    iconColor: 'text-orange-500 dark:text-orange-400',
    mode: 'deck'
  },
  {
    id: 'clean-whiteboard',
    name: 'Whiteboard',
    subtitle: 'Active canvas',
    icon: WhiteboardIcon,
    iconBg: 'bg-purple-50 dark:bg-purple-950/40',
    iconColor: 'text-purple-500 dark:text-purple-400',
    mode: 'whiteboard'
  }
];

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

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      if (selectedSourceId.startsWith('clean-')) {
        const preset = CLEAN_PRESETS.find(p => p.id === selectedSourceId);
        await onSelectSource?.({
          type: 'clean-preset',
          preset: preset || CLEAN_PRESETS[0],
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

  // ─── Shared tab button style ─────────────────────────────────────────────────
  const tabClass = (tab) =>
    `px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
      activeTab === tab
        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800'
    }`;

  // ─── Shared canvas card style ─────────────────────────────────────────────────
  const cardClass = (id) =>
    `p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[110px] relative ${
      selectedSourceId === id
        ? 'border-slate-400 dark:border-zinc-500 bg-slate-50/80 dark:bg-zinc-800/60 ring-1 ring-slate-400/50 dark:ring-zinc-500/50'
        : 'border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700'
    }`;

  return (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 select-none font-sans"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[620px] bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-[0_32px_96px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="px-6 py-4.5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 flex items-center justify-center">
              <ScreenShare size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                Choose What to Share
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                Select an isolated canvas, window, or entire screen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Tab Bar & Privacy Header Indicator ───────────────────────────── */}
        <div className="px-6 pt-3.5 pb-2.5 flex items-center justify-between">
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => { setActiveTab('clean'); setSelectedSourceId('clean-docs'); }}
              className={tabClass('clean')}
            >
              <ShieldCheck size={13} />
              <span>Clean App Canvas</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('windows'); if (windowSources[0]) setSelectedSourceId(windowSources[0].id); }}
              className={tabClass('windows')}
            >
              <AppWindow size={13} />
              <span>Windows ({windowSources.length})</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('screens'); if (screenSources[0]) setSelectedSourceId(screenSources[0].id); }}
              className={tabClass('screens')}
            >
              <Monitor size={13} />
              <span>Entire Screen ({screenSources.length})</span>
            </button>
          </div>

          {activeTab === 'clean' && (
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck size={12} strokeWidth={2} />
              <span>Privacy protected</span>
            </div>
          )}
        </div>

        {/* ── Content Body ─────────────────────────────────────────────────── */}
        <div className="px-6 py-2.5 max-h-[340px] overflow-y-auto thin-scrollbar">

          {/* Clean Canvas Presets (2x2 Grid) */}
          {activeTab === 'clean' && (
            <div className="grid grid-cols-2 gap-3">
              {CLEAN_PRESETS.map((preset) => {
                const isSelected = selectedSourceId === preset.id;
                const Icon = preset.icon;
                return (
                  <div
                    key={preset.id}
                    onClick={() => setSelectedSourceId(preset.id)}
                    className={cardClass(preset.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-9 h-9 rounded-xl ${preset.iconBg} ${preset.iconColor} flex items-center justify-center`}>
                        <Icon size={18} strokeWidth={1.6} />
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-xs">
                          <Check size={11} strokeWidth={2.8} />
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-[13px] font-semibold text-slate-900 dark:text-white block leading-tight">
                        {preset.name}
                      </span>
                      <span className="text-[11.5px] text-slate-400 dark:text-zinc-500 block mt-0.5">
                        {preset.subtitle}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Window Sources */}
          {activeTab === 'windows' && (
            <div className="grid grid-cols-2 gap-3">
              {windowSources.length === 0 ? (
                <div className="col-span-2 py-10 text-center text-xs text-slate-400 dark:text-zinc-500">
                  No individual window sources detected.
                </div>
              ) : (
                windowSources.map((source) => {
                  const isSelected = selectedSourceId === source.id;
                  return (
                    <div
                      key={source.id}
                      onClick={() => setSelectedSourceId(source.id)}
                      className={cardClass(source.id)}
                    >
                      <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-zinc-950 border border-slate-100 dark:border-zinc-800 relative mb-2">
                        {source.thumbnail ? (
                          <img src={source.thumbnail} alt={source.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500 text-[10px]">
                            Preview
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-md">
                            <Check size={11} strokeWidth={2.8} />
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate">
                        {source.name || 'Window'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Screen Sources */}
          {activeTab === 'screens' && (
            <div className="grid grid-cols-2 gap-3">
              {screenSources.length === 0 ? (
                <div className="col-span-2 py-10 text-center text-xs text-slate-400 dark:text-zinc-500">
                  No display screens detected.
                </div>
              ) : (
                screenSources.map((source) => {
                  const isSelected = selectedSourceId === source.id;
                  return (
                    <div
                      key={source.id}
                      onClick={() => setSelectedSourceId(source.id)}
                      className={cardClass(source.id)}
                    >
                      <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-zinc-950 border border-slate-100 dark:border-zinc-800 relative mb-2">
                        {source.thumbnail ? (
                          <img src={source.thumbnail} alt={source.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500 text-[10px]">
                            Screen
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-md">
                            <Check size={11} strokeWidth={2.8} />
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate">
                        {source.name || 'Entire Display'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* ── Refined Footer Actions ────────────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          {/* Left: Audio Toggle */}
          <button
            type="button"
            onClick={() => setShareAudio(!shareAudio)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              shareAudio
                ? 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200'
                : 'bg-white dark:bg-zinc-900 border-slate-150 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 hover:bg-slate-50'
            }`}
            title="Toggle broadcasting system audio"
          >
            <Volume2 size={12} className={shareAudio ? 'text-slate-600 dark:text-zinc-300' : 'text-slate-300'} />
            <span>Share System Audio</span>
            <span className={`w-1.5 h-1.5 rounded-full ${shareAudio ? 'bg-emerald-400' : 'bg-slate-300 dark:bg-zinc-600'}`} />
          </button>

          {/* Right: Cancel & Share */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className="px-5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-slate-900 shadow-sm active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
