import React, { useEffect, useState } from 'react';
import BrowserFlowsPopover from './flows/BrowserFlowsPopover';
import SendToSheetsPopover from './SendToSheetsPopover';
import SendToComposePopover from './SendToComposePopover';
import BrowserFontPopover from './BrowserFontPopover';
import BrowserUtilitiesPopover from './BrowserUtilitiesPopover';
import BrowserOverflowMenu from './BrowserOverflowMenu';
import BrowserResearchPanel from './BrowserResearchPanel';

export const PopoverWindowContainer = () => {
  const [popoverType, setPopoverType] = useState('font');
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
      const type = params.get('type') || 'font';
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
    <div className="w-screen h-screen min-h-screen bg-transparent text-slate-100 overflow-hidden flex items-start justify-center p-2 m-0 font-sans">
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
            onOpenFontPopover={() => setPopoverType('font')}
            onOpenExternal={handleClose}
            onOpenSendToSheets={() => setPopoverType('sendToSheets')}
            onOpenSendToCompose={() => setPopoverType('sendToCompose')}
            onSendWhiteboard={handleClose}
            onSaveMemory={handleClose}
            onFindInPage={handleClose}
            onNewTab={handleClose}
            onCloseTab={handleClose}
            onOpenHistory={handleClose}
            onOpenDownloads={handleClose}
            onOpenBookmarks={handleClose}
            onPrintPage={handleClose}
          />
        )}

        {popoverType === 'overflow' && (
          <BrowserOverflowMenu
            isStandalone={true}
            onClose={handleClose}
            onNewTab={handleClose}
            onReloadHard={handleClose}
            onResetWorkspace={handleClose}
            onOpenFlows={() => setPopoverType('flows')}
            onOpenAppearance={() => setPopoverType('font')}
            onOpenSettings={() => setPopoverType('font')}
            onOpenShortcuts={handleClose}
            onOpenHelp={handleClose}
            onAbout={handleClose}
          />
        )}

        {popoverType === 'sendToSheets' && (
          <SendToSheetsPopover
            isStandalone={true}
            onClose={handleClose}
            onExecuteExport={handleClose}
          />
        )}

        {popoverType === 'sendToCompose' && (
          <SendToComposePopover
            isStandalone={true}
            onClose={handleClose}
            onExecuteExport={handleClose}
          />
        )}

        {(popoverType === 'sidepanel' || popoverType === 'sidebar') && (
          <div className="w-full h-full p-0 m-0 overflow-hidden flex flex-col bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl">
            <BrowserResearchPanel
              activeTab={activeTab}
              onClose={handleClose}
              onExtractText={async () => {
                if (window.electronAPI?.extractPageText && activeTab?.tabId) {
                  const res = await window.electronAPI.extractPageText(activeTab.tabId);
                  return res?.text || '';
                }
                return 'Page context from active tab';
              }}
              onOpenSendToCompose={() => setPopoverType('sendToCompose')}
              onOpenSendToSheets={() => setPopoverType('sendToSheets')}
              onSaveToMemory={() => {}}
              onSendToWhiteboard={() => {}}
              onRunFlowRequested={() => {}}
              showToast={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PopoverWindowContainer;
