import React, { useEffect, useState } from 'react';
import {
  ComposeIcon,
  SheetIcon,
  DeckIcon,
  RoomIcon,
  BrowserIcon
} from '../RegaarderProductIcons';
import BrowserFlowsPopover from './flows/BrowserFlowsPopover';
import SendToSheetsPopover from './SendToSheetsPopover';
import SendToComposePopover from './SendToComposePopover';
import BrowserFontPopover from './BrowserFontPopover';
import BrowserUtilitiesPopover from './BrowserUtilitiesPopover';
import BrowserOverflowMenu from './BrowserOverflowMenu';
import BrowserResearchPanel from './BrowserResearchPanel';

export const PopoverWindowContainer = () => {
  const [popoverType, setPopoverType] = useState(() => {
    try {
      const hash = window.location.hash || '';
      const queryStr = hash.includes('?') ? hash.split('?')[1] : '';
      const params = new URLSearchParams(queryStr);
      return params.get('type') || 'overflow';
    } catch (e) {
      return 'overflow';
    }
  });
  const [activeTab, setActiveTab] = useState(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('rc.darkMode');
      if (saved !== null) return saved === 'true';
    } catch (e) {}
    return typeof document !== 'undefined' && (document.documentElement.classList.contains('dark') || document.documentElement.classList.contains('app-dark'));
  });

  const [browserFont, setBrowserFont] = useState(() => {
    try {
      return localStorage.getItem('regaarder_browser_font_v1') || 'System Default';
    } catch (e) {
      return 'System Default';
    }
  });

  const [browserFontSize, setBrowserFontSize] = useState(() => {
    try {
      const saved = localStorage.getItem('regaarder_browser_font_size_v1');
      return saved ? Number(saved) : 100;
    } catch (e) {
      return 100;
    }
  });

  useEffect(() => {
    document.documentElement.style.background = 'transparent';
    document.body.style.background = 'transparent';
    document.documentElement.style.backgroundColor = 'transparent';
    document.body.style.backgroundColor = 'transparent';
    document.documentElement.classList.add('popover-root', 'bg-transparent');
    document.body.classList.add('popover-root', 'bg-transparent');
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark', 'app-dark');
    } else {
      document.documentElement.classList.remove('dark', 'app-dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const parseType = () => {
      const hash = window.location.hash || '';
      const queryStr = hash.includes('?') ? hash.split('?')[1] : '';
      const params = new URLSearchParams(queryStr);
      const type = params.get('type') || 'overflow';
      setPopoverType(type);
    };

    parseType();
    window.addEventListener('hashchange', parseType);
    return () => window.removeEventListener('hashchange', parseType);
  }, []);

  useEffect(() => {
    if (window.electronAPI?.onPopoverChangeType) {
      const unsubscribe = window.electronAPI.onPopoverChangeType((newType) => {
        if (newType) setPopoverType(newType);
      });
      return unsubscribe;
    }
  }, []);

  useEffect(() => {
    if (window.electronAPI?.onTabUpdated) {
      const unsubscribe = window.electronAPI.onTabUpdated((data) => {
        if (data && data.isActive) {
          setActiveTab(data);
        }
      });
      return unsubscribe;
    }
  }, []);

  const handleClose = () => {
    if (window.electronAPI?.closePopover) {
      window.electronAPI.closePopover();
    } else {
      window.close();
    }
  };

  const handleToggleDarkMode = (newVal) => {
    const target = typeof newVal === 'boolean' ? newVal : !isDarkMode;
    setIsDarkMode(target);
    try {
      localStorage.setItem('rc.darkMode', String(target));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}
  };

  return (
    <div className="w-screen h-screen bg-transparent text-slate-100 overflow-hidden flex items-start justify-center p-1 m-0 font-sans">
      <style>{`
        ::-webkit-scrollbar-button,
        *::-webkit-scrollbar-button,
        ::-webkit-scrollbar-button:single-button,
        ::-webkit-scrollbar-button:double-button,
        ::-webkit-scrollbar-button:vertical,
        ::-webkit-scrollbar-button:horizontal,
        ::-webkit-scrollbar-button:vertical:decrement,
        ::-webkit-scrollbar-button:vertical:increment,
        ::-webkit-scrollbar-button:horizontal:decrement,
        ::-webkit-scrollbar-button:horizontal:increment,
        ::-webkit-scrollbar-button:start,
        ::-webkit-scrollbar-button:end,
        ::-webkit-scrollbar-button:start:decrement,
        ::-webkit-scrollbar-button:end:increment {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
          max-width: 0 !important;
          max-height: 0 !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          background: transparent !important;
          border: none !important;
        }
      `}</style>
      <div className="w-full h-full flex flex-col items-center justify-start bg-transparent">
        {popoverType === 'font' && (
          <BrowserFontPopover
            isStandalone={true}
            isDarkMode={isDarkMode}
            browserFont={browserFont}
            browserFontSize={browserFontSize}
            onChangeFont={(newFont) => {
              setBrowserFont(newFont);
              try {
                localStorage.setItem('regaarder_browser_font_v1', newFont);
                window.dispatchEvent(new Event('storage'));
              } catch (e) {}
              if (window.electronAPI?.setFontZoom) {
                window.electronAPI.setFontZoom({ font: newFont, size: browserFontSize });
              }
            }}
            onChangeFontSize={(newSize) => {
              setBrowserFontSize(newSize);
              try {
                localStorage.setItem('regaarder_browser_font_size_v1', String(newSize));
                window.dispatchEvent(new Event('storage'));
              } catch (e) {}
              if (window.electronAPI?.setFontZoom) {
                window.electronAPI.setFontZoom({ font: browserFont, size: newSize });
              }
            }}
            onToggleDarkMode={handleToggleDarkMode}
            onReset={() => {
              setBrowserFont('System Default');
              setBrowserFontSize(100);
              try {
                localStorage.setItem('regaarder_browser_font_v1', 'System Default');
                localStorage.setItem('regaarder_browser_font_size_v1', '100');
                window.dispatchEvent(new Event('storage'));
              } catch (e) {}
              if (window.electronAPI?.setFontZoom) {
                window.electronAPI.setFontZoom({ font: 'System Default', size: 100 });
              }
            }}
            onClose={handleClose}
          />
        )}

        {popoverType === 'flows' && (
          <BrowserFlowsPopover
            isStandalone={true}
            onClose={handleClose}
            onStartRecording={handleClose}
            onSaveRecentAsFlow={handleClose}
            onOpenRunFlow={handleClose}
            onOpenMyFlows={handleClose}
          />
        )}

        {popoverType === 'utilities' && (
          <BrowserUtilitiesPopover
            isStandalone={true}
            onClose={handleClose}
            onOpenFlows={(rect) => {
              setPopoverType('flows');
              const fallbackRight = typeof window !== 'undefined' ? Math.max(380, window.innerWidth - 16) : 1100;
              window.electronAPI?.openPopover?.({
                type: 'flows',
                bounds: (rect && (rect.right || rect.x)) ? rect : { top: 44, bottom: 72, left: fallbackRight - 380, right: fallbackRight, width: 380, height: 390 },
                force: true
              });
            }}
            onOpenExternal={() => {
              window.electronAPI?.sendPopoverAction?.('openExternal');
              handleClose();
            }}
            onOpenSendToSheets={() => {
              setPopoverType('sendToSheets');
              window.electronAPI?.openPopover?.({ type: 'sendToSheets', force: true });
            }}
            onOpenSendToCompose={() => {
              setPopoverType('sendToCompose');
              window.electronAPI?.openPopover?.({ type: 'sendToCompose', force: true });
            }}
            onSendWhiteboard={() => {
              window.electronAPI?.sendPopoverAction?.('sendWhiteboard');
              handleClose();
            }}
            onSaveMemory={() => {
              window.electronAPI?.sendPopoverAction?.('saveMemory');
              handleClose();
            }}
            onSummarizePage={() => {
              setPopoverType('sidepanel');
              window.electronAPI?.openPopover?.({ type: 'sidepanel', force: true });
            }}
            onOpenCompetitorWorkflow={() => {
              window.electronAPI?.sendPopoverAction?.('openCompetitors');
              handleClose();
            }}
            onFindInPage={() => {
              window.electronAPI?.sendPopoverAction?.('findInPage');
              handleClose();
            }}
            onCloseTab={() => {
              window.electronAPI?.sendPopoverAction?.('closeTab');
              handleClose();
            }}
            onPrintPage={() => {
              window.electronAPI?.sendPopoverAction?.('printPage');
              handleClose();
            }}
          />
        )}

        {popoverType === 'overflow' && (
          <BrowserOverflowMenu
            isStandalone={true}
            onClose={handleClose}
            onNewTab={() => {
              window.electronAPI?.sendPopoverAction?.('newTab');
              handleClose();
            }}
            onReloadHard={() => {
              window.electronAPI?.sendPopoverAction?.('reloadHard');
              handleClose();
            }}
            onResetWorkspace={() => {
              window.electronAPI?.sendPopoverAction?.('resetWorkspace');
              handleClose();
            }}
            onOpenFlows={() => {
              setPopoverType('flows');
              window.electronAPI?.openPopover?.({ type: 'flows', force: true });
            }}
            onOpenAppearance={() => {
              setPopoverType('font');
              window.electronAPI?.openPopover?.({ type: 'font', force: true });
            }}
            onOpenSettings={() => {
              setPopoverType('font');
              window.electronAPI?.openPopover?.({ type: 'font', force: true });
            }}
            onOpenShortcuts={() => {
              window.electronAPI?.sendPopoverAction?.('openShortcuts');
              handleClose();
            }}
            onOpenHelp={() => {
              window.electronAPI?.sendPopoverAction?.('openHelp');
              handleClose();
            }}
            onAbout={() => {
              window.electronAPI?.sendPopoverAction?.('about');
              handleClose();
            }}
          />
        )}

        {popoverType === 'sendToSheets' && (
          <SendToSheetsPopover
            isStandalone={true}
            activeTab={activeTab}
            onClose={handleClose}
            onExecuteExport={(payload) => {
              if (window.electronAPI?.sendPopoverAction) {
                window.electronAPI.sendPopoverAction('sendToSheets', payload);
              }
              handleClose();
            }}
          />
        )}

        {popoverType === 'sendToCompose' && (
          <SendToComposePopover
            isStandalone={true}
            activeTab={activeTab}
            onClose={handleClose}
            onExecuteExport={(payload) => {
              if (window.electronAPI?.sendPopoverAction) {
                window.electronAPI.sendPopoverAction('sendToCompose', payload);
              }
              handleClose();
            }}
          />
        )}

        {popoverType === 'workspaceSwitcher' && (
          <div className="w-[220px] rounded-[22px] border border-white/60 dark:border-white/10 ring-1 ring-slate-900/5 dark:ring-black/40 bg-white/85 dark:bg-[#1c1c1e]/85 backdrop-blur-3xl shadow-2xl p-2 font-sans overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex flex-col gap-1">
              {[
                { mode: 'compose', label: 'Docs', desc: 'AI Document Editor', icon: ComposeIcon },
                { mode: 'sheets', label: 'Sheets', desc: 'Grid & Data Analysis', icon: SheetIcon },
                { mode: 'deck', label: 'Decks', desc: 'Slide & Presentation', icon: DeckIcon },
                { mode: 'room', label: 'Room', desc: 'Team Video & Meetings', icon: RoomIcon },
                { mode: 'browser', label: 'Research', desc: 'AI Knowledge Browser', icon: BrowserIcon }
              ].map((item) => {
                const IconComponent = item.icon;
                const isCurrent = item.mode === 'browser';
                return (
                  <button
                    key={item.mode}
                    type="button"
                    onClick={() => {
                      window.electronAPI?.sendPopoverAction?.('switchProductMode', { mode: item.mode });
                      handleClose();
                    }}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-left select-none transition-all duration-150 w-full cursor-pointer ${
                      isCurrent
                        ? 'bg-[#7C5ACF]/[0.08] dark:bg-[#7C5ACF]/[0.16] shadow-xs'
                        : 'bg-transparent text-slate-700 dark:text-zinc-300 hover:bg-slate-100/80 dark:hover:bg-zinc-800/80 hover:text-slate-900 dark:hover:text-zinc-100 font-medium'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isCurrent 
                        ? 'bg-[#7C5ACF]/[0.14] dark:bg-[#7C5ACF]/[0.22] text-[#7C5ACF] dark:text-[#8B6FD1]' 
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 group-hover:text-slate-800 dark:group-hover:text-zinc-200'
                    }`}>
                      <IconComponent size={18} strokeWidth={isCurrent ? 2 : 1.8} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className={`text-[13.5px] leading-tight whitespace-nowrap ${
                        isCurrent
                          ? 'text-slate-900 dark:text-zinc-100 font-semibold'
                          : 'text-slate-700 dark:text-zinc-300 font-medium group-hover:text-slate-900 dark:group-hover:text-zinc-100'
                      }`}>
                        {item.label}
                      </span>
                      <span className="text-[10.5px] text-slate-400 dark:text-zinc-500 font-normal truncate mt-0.5">
                        {item.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {(popoverType === 'sidepanel' || popoverType === 'sidebar') && (
          <div className="w-full h-full p-0 m-0 overflow-hidden flex flex-col bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl">
            <BrowserResearchPanel
              activeTab={activeTab}
              onClose={handleClose}
              onExtractText={async () => {
                const targetTabId = activeTab?.tabId || activeTab?.id;
                if (window.electronAPI?.extractPageText && targetTabId) {
                  const res = await window.electronAPI.extractPageText(targetTabId);
                  return res?.text || '';
                }
                return 'Page context from active tab';
              }}
              onExtractPageSchema={async () => {
                const targetTabId = activeTab?.tabId || activeTab?.id;
                if (window.electronAPI?.extractPageSchema && targetTabId) {
                  const res = await window.electronAPI.extractPageSchema(targetTabId);
                  return res?.schema || null;
                }
                return null;
              }}
              onExecuteElementAction={async (payload) => {
                const targetTabId = activeTab?.tabId || activeTab?.id;
                if (window.electronAPI?.executeElementAction && targetTabId) {
                  return await window.electronAPI.executeElementAction({
                    tabId: targetTabId,
                    ...payload
                  });
                }
                return { success: false, error: 'Unavailable' };
              }}
              onCaptureScreenshot={async () => {
                const targetTabId = activeTab?.tabId || activeTab?.id;
                if (window.electronAPI?.captureTabScreenshot && targetTabId) {
                  const res = await window.electronAPI.captureTabScreenshot(targetTabId);
                  return res?.dataUrl || null;
                }
                return null;
              }}
              onOpenSendToCompose={() => setPopoverType('sendToCompose')}
              onDirectExportToCompose={(payload) => {
                if (window.electronAPI?.sendPopoverAction) {
                  window.electronAPI.sendPopoverAction('sendToCompose', payload);
                }
              }}
              onOpenSendToSheets={() => setPopoverType('sendToSheets')}
              onDirectExportToSheets={(payload) => {
                if (window.electronAPI?.sendPopoverAction) {
                  window.electronAPI.sendPopoverAction('sendToSheets', payload);
                }
              }}
              onDirectExportToDeck={(payload) => {
                if (window.electronAPI?.sendPopoverAction) {
                  window.electronAPI.sendPopoverAction('sendToDeck', payload);
                }
              }}
              onDirectExportToWhiteboard={(payload) => {
                if (window.electronAPI?.sendPopoverAction) {
                  window.electronAPI.sendPopoverAction('sendToWhiteboard', payload);
                }
              }}
              onSaveToMemory={(node) => {
                if (window.electronAPI?.sendPopoverAction) {
                  window.electronAPI.sendPopoverAction('saveToMemory', node);
                }
              }}
              onSendToWhiteboard={(data) => {
                if (window.electronAPI?.sendPopoverAction) {
                  window.electronAPI.sendPopoverAction('sendToWhiteboard', data);
                }
              }}
              onRunFlowRequested={(flow, initialInputs) => {
                if (window.electronAPI?.sendPopoverAction) {
                  window.electronAPI.sendPopoverAction('runFlow', { flow, initialInputs });
                }
              }}
              showToast={(msg) => {
                console.log('[Popover Toast]:', msg);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PopoverWindowContainer;
