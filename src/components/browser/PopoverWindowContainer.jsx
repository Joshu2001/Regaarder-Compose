import React, { useEffect, useState } from 'react';
import BrowserFlowsPopover from './flows/BrowserFlowsPopover';
import SendToSheetsPopover from './SendToSheetsPopover';
import SendToComposePopover from './SendToComposePopover';
import BrowserFontPopover from './BrowserFontPopover';

export const PopoverWindowContainer = () => {
  const [popoverType, setPopoverType] = useState('flows');
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
    const parseType = () => {
      const hash = window.location.hash || '';
      const queryStr = hash.includes('?') ? hash.split('?')[1] : '';
      const params = new URLSearchParams(queryStr);
      const type = params.get('type') || 'flows';
      setPopoverType(type);
    };

    parseType();
    window.addEventListener('hashchange', parseType);
    return () => window.removeEventListener('hashchange', parseType);
  }, []);

  const handleClose = () => {
    if (window.electronAPI?.closePopover) {
      window.electronAPI.closePopover();
    } else {
      window.close();
    }
  };

  return (
    <div className="w-screen h-screen min-h-screen bg-transparent text-slate-100 overflow-hidden flex items-center justify-center p-0 m-0 font-sans">
      <div className="w-full h-full flex flex-col items-center justify-center">
        {popoverType === 'font' && (
          <BrowserFontPopover
            isStandalone={true}
            browserFont={browserFont}
            browserFontSize={browserFontSize}
            onChangeFont={(newFont) => {
              setBrowserFont(newFont);
              try {
                localStorage.setItem('regaarder_browser_font_v1', newFont);
                window.dispatchEvent(new Event('storage'));
              } catch (e) {}
            }}
            onChangeFontSize={(newSize) => {
              setBrowserFontSize(newSize);
              try {
                localStorage.setItem('regaarder_browser_font_size_v1', String(newSize));
                window.dispatchEvent(new Event('storage'));
              } catch (e) {}
            }}
            onReset={() => {
              setBrowserFont('System Default');
              setBrowserFontSize(100);
              try {
                localStorage.setItem('regaarder_browser_font_v1', 'System Default');
                localStorage.setItem('regaarder_browser_font_size_v1', '100');
                window.dispatchEvent(new Event('storage'));
              } catch (e) {}
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
      </div>
    </div>
  );
};

export default PopoverWindowContainer;
