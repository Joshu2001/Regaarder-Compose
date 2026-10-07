import React, { useCallback, useEffect, useState } from 'react';
import './windowControls.css';

const ICON_STROKE = 1.25;

const MinimizeGlyph = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path d="M1.5 5h7" stroke="currentColor" strokeWidth={ICON_STROKE} strokeLinecap="round" />
  </svg>
);

const MaximizeGlyph = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <rect x="1.5" y="1.5" width="7" height="7" rx="1.25" stroke="currentColor" strokeWidth={ICON_STROKE} />
  </svg>
);

const RestoreGlyph = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <rect x="1.5" y="3" width="5.5" height="5.5" rx="1.1" stroke="currentColor" strokeWidth={ICON_STROKE} />
    <path d="M3.5 3V2.6A1.1 1.1 0 0 1 4.6 1.5H7.4a1.1 1.1 0 0 1 1.1 1.1v2.8A1.1 1.1 0 0 1 7.4 6.5H7"
      stroke="currentColor" strokeWidth={ICON_STROKE} strokeLinecap="round" />
  </svg>
);

const CloseGlyph = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth={ICON_STROKE} strokeLinecap="round" />
  </svg>
);

/**
 * Window controls for the frameless Electron shell. Placed in normal layout flow
 * at the extreme right of the top header so it can never overlap header content.
 */
export default function WindowControls() {
  const electronApi = typeof window !== 'undefined' ? window.electronAPI : undefined;
  const isDesktopShell = Boolean(electronApi?.toggleMaximizeMainWindow);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (!isDesktopShell) return undefined;
    let isMounted = true;
    electronApi.isMainWindowMaximized().then((value) => {
      if (isMounted) setIsMaximized(Boolean(value));
    });
    const unsubscribe = electronApi.onMainWindowMaximizeChanged(setIsMaximized);
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [isDesktopShell, electronApi]);

  const handleMinimize = useCallback(() => electronApi.minimizeMainWindow(), [electronApi]);
  const handleToggleMaximize = useCallback(() => electronApi.toggleMaximizeMainWindow(), [electronApi]);
  const handleClose = useCallback(() => electronApi.closeMainWindow(), [electronApi]);

  if (!isDesktopShell) return null;

  return (
    <div className="rg-window-controls" role="group" aria-label="Window controls">
      <button type="button" className="rg-window-control" onClick={handleMinimize} title="Minimize" aria-label="Minimize">
        <MinimizeGlyph />
      </button>
      <button
        type="button"
        className="rg-window-control"
        onClick={handleToggleMaximize}
        title={isMaximized ? 'Restore' : 'Maximize'}
        aria-label={isMaximized ? 'Restore' : 'Maximize'}
      >
        {isMaximized ? <RestoreGlyph /> : <MaximizeGlyph />}
      </button>
      <button
        type="button"
        className="rg-window-control rg-window-control--close"
        onClick={handleClose}
        title="Close"
        aria-label="Close"
      >
        <CloseGlyph />
      </button>
    </div>
  );
}
