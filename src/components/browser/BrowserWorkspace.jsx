import React, { useState, useEffect, useCallback, useMemo } from 'react';
import BrowserTabBar from './BrowserTabBar';
import BrowserToolbar from './BrowserToolbar';
import BrowserViewport from './BrowserViewport';
import BrowserResearchPanel from './BrowserResearchPanel';
import SendToSheetsPopover from './SendToSheetsPopover';
import SendToComposePopover from './SendToComposePopover';
import CompetitorResearchWorkflow from './CompetitorResearchWorkflow';
import BrowserFlowsPopover from './flows/BrowserFlowsPopover';
import RecordingIndicatorBar from './flows/RecordingIndicatorBar';
import FlowSynthesisModal from './flows/FlowSynthesisModal';
import FlowLibraryModal from './flows/FlowLibraryModal';
import FlowExecutionModal from './flows/FlowExecutionModal';
import BrowserFontPopover from './BrowserFontPopover';
import BrowserOverflowMenu from './BrowserOverflowMenu';
import BrowserUtilitiesPopover from './BrowserUtilitiesPopover';
import { globalActivityObserver, synthesizeFlowFromActions, getSavedFlows } from '../../services/flowEngine';

const STORAGE_KEY = 'regaarder_research_tabs_v2';
const SAVED_ITEMS_KEY = 'regaarder_saved_research_v1';
const BROWSER_FONT_STORAGE_KEY = 'regaarder_browser_font_v1';
const BROWSER_FONT_SIZE_STORAGE_KEY = 'regaarder_browser_font_size_v1';
const SIDE_PANEL_STORAGE_KEY = 'regaarder_side_panel_open_v1';
const DEFAULT_RESEARCH_URL = 'regaarder://research';

export const BrowserWorkspace = ({ showToast, setProductMode, isDarkMode, setIsDarkMode, isRightSideHovered = false }) => {
  const isElectron = Boolean(window.electronAPI?.isElectron);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(() => {
    try {
      const saved = localStorage.getItem(SIDE_PANEL_STORAGE_KEY);
      return saved !== null ? JSON.parse(saved) : false;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SIDE_PANEL_STORAGE_KEY, JSON.stringify(isSidePanelOpen));
    } catch (e) {}
  }, [isSidePanelOpen]);

  const [isDarkModeState, setIsDarkModeState] = useState(() => {
    if (typeof isDarkMode === 'boolean') return isDarkMode;
    return typeof document !== 'undefined' && (document.documentElement.classList.contains('dark') || document.documentElement.classList.contains('app-dark'));
  });

  const handleToggleDarkMode = useCallback((newVal) => {
    const target = typeof newVal === 'boolean' ? newVal : !isDarkModeState;
    setIsDarkModeState(target);
    if (setIsDarkMode) setIsDarkMode(target);
    if (target) {
      document.documentElement.classList.add('dark', 'app-dark');
    } else {
      document.documentElement.classList.remove('dark', 'app-dark');
    }
    try {
      localStorage.setItem('rc.darkMode', String(target));
    } catch (e) {}
    if (showToast) showToast(`Switched to ${target ? 'Dark' : 'Light'} Mode`);
  }, [isDarkModeState, setIsDarkMode, showToast]);

  // Browser-Specific Isolated Font & Font Size States (Does not touch Compose document editor)
  const [browserFont, setBrowserFont] = useState(() => {
    try {
      return localStorage.getItem(BROWSER_FONT_STORAGE_KEY) || 'System Default';
    } catch (e) {
      return 'System Default';
    }
  });

  const [browserFontSize, setBrowserFontSize] = useState(() => {
    try {
      const saved = localStorage.getItem(BROWSER_FONT_SIZE_STORAGE_KEY);
      return saved ? Number(saved) : 100;
    } catch (e) {
      return 100;
    }
  });

  const [fontPopoverRect, setFontPopoverRect] = useState(null);

  // Persist & sync Browser font settings with Electron WebContentsView
  useEffect(() => {
    try {
      localStorage.setItem(BROWSER_FONT_STORAGE_KEY, browserFont);
    } catch (e) {}
    if (isElectron && window.electronAPI?.setFontZoom) {
      window.electronAPI.setFontZoom({ font: browserFont, size: browserFontSize });
    }
  }, [browserFont, isElectron, browserFontSize]);

  useEffect(() => {
    try {
      localStorage.setItem(BROWSER_FONT_SIZE_STORAGE_KEY, String(browserFontSize));
    } catch (e) {}
    if (isElectron && window.electronAPI?.setFontZoom) {
      window.electronAPI.setFontZoom({ font: browserFont, size: browserFontSize });
    }
  }, [browserFontSize, isElectron, browserFont]);

  // Sync font & size state across windows (e.g. native Electron popover overlay)
  useEffect(() => {
    const handleStorageSync = () => {
      try {
        const savedFont = localStorage.getItem(BROWSER_FONT_STORAGE_KEY);
        if (savedFont && savedFont !== browserFont) setBrowserFont(savedFont);
        const savedSize = localStorage.getItem(BROWSER_FONT_SIZE_STORAGE_KEY);
        if (savedSize && Number(savedSize) !== browserFontSize) setBrowserFontSize(Number(savedSize));
      } catch (e) {}
    };
    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, [browserFont, browserFontSize]);

  // Popover state anchors
  const [sendToSheetsPopoverRect, setSendToSheetsPopoverRect] = useState(null);
  const [sendToComposePopoverRect, setSendToComposePopoverRect] = useState(null);
  const [overflowMenuRect, setOverflowMenuRect] = useState(null);
  const [utilitiesPopoverRect, setUtilitiesPopoverRect] = useState(null);
  const [showCompetitorWorkflow, setShowCompetitorWorkflow] = useState(false);

  // Regaarder Flows system state
  const [isFlowRecording, setIsFlowRecording] = useState(false);
  const [flowsPopoverRect, setFlowsPopoverRect] = useState(null);
  const [recordedActionCount, setRecordedActionCount] = useState(0);
  const [synthesizedFlowToReview, setSynthesizedFlowToReview] = useState(null);
  const [showFlowLibraryModal, setShowFlowLibraryModal] = useState(false);
  const [activeExecutingFlow, setActiveExecutingFlow] = useState(null);

  const serializeRect = (rect) => {
    if (!rect) return null;
    return {
      x: Math.round(rect.x || rect.left || 0),
      y: Math.round(rect.y || rect.top || 0),
      width: Math.round(rect.width || 0),
      height: Math.round(rect.height || 0),
      top: Math.round(rect.top || 0),
      right: Math.round(rect.right || 0),
      bottom: Math.round(rect.bottom || 0),
      left: Math.round(rect.left || 0)
    };
  };

  const handleOpenFontPopoverAction = useCallback((rect, forceOpen = false) => {
    setOverflowMenuRect(null);
    setUtilitiesPopoverRect(null);
    setFlowsPopoverRect(null);
    setSendToSheetsPopoverRect(null);
    setSendToComposePopoverRect(null);
    if (isElectron && window.electronAPI?.openPopover) {
      window.electronAPI.openPopover({ type: 'font', bounds: serializeRect(rect), force: forceOpen });
    } else {
      setFontPopoverRect((prev) => (forceOpen ? rect : (prev ? null : rect)));
    }
  }, [isElectron]);

  const handleOpenOverflowMenuAction = useCallback((rect, forceOpen = false) => {
    setFontPopoverRect(null);
    setUtilitiesPopoverRect(null);
    setFlowsPopoverRect(null);
    setSendToSheetsPopoverRect(null);
    setSendToComposePopoverRect(null);
    if (isElectron && window.electronAPI?.openPopover) {
      window.electronAPI.openPopover({ type: 'overflow', bounds: serializeRect(rect), force: forceOpen });
    } else {
      setOverflowMenuRect((prev) => (forceOpen ? rect : (prev ? null : rect)));
    }
  }, [isElectron]);

  const handleOpenUtilitiesPopoverAction = useCallback((rect, forceOpen = false) => {
    setFontPopoverRect(null);
    setOverflowMenuRect(null);
    setFlowsPopoverRect(null);
    setSendToSheetsPopoverRect(null);
    setSendToComposePopoverRect(null);
    if (isElectron && window.electronAPI?.openPopover) {
      window.electronAPI.openPopover({ type: 'utilities', bounds: serializeRect(rect), force: forceOpen });
    } else {
      setUtilitiesPopoverRect((prev) => (forceOpen ? rect : (prev ? null : rect)));
    }
  }, [isElectron]);

  const handleOpenFlowsPopoverAction = useCallback((rect, forceOpen = false) => {
    setFontPopoverRect(null);
    setOverflowMenuRect(null);
    setUtilitiesPopoverRect(null);
    setSendToSheetsPopoverRect(null);
    setSendToComposePopoverRect(null);
    if (isElectron && window.electronAPI?.openPopover) {
      window.electronAPI.openPopover({ type: 'flows', bounds: serializeRect(rect), force: forceOpen });
    } else {
      setFlowsPopoverRect((prev) => (forceOpen ? rect : (prev ? null : rect)));
    }
  }, [isElectron]);

  // Handle Escape keypresses from Electron webContents & window listeners to exit sidepanel / popovers
  useEffect(() => {
    const handleCloseOnEsc = () => {
      setIsSidePanelOpen(false);
      setFontPopoverRect(null);
      setOverflowMenuRect(null);
      setUtilitiesPopoverRect(null);
      setFlowsPopoverRect(null);
      setSendToSheetsPopoverRect(null);
      setSendToComposePopoverRect(null);
      if (isElectron && window.electronAPI?.closePopover) {
        window.electronAPI.closePopover();
      }
    };

    if (isElectron && window.electronAPI?.onEscPressed) {
      const unsubscribe = window.electronAPI.onEscPressed(handleCloseOnEsc);
      return unsubscribe;
    }
  }, [isElectron]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSidePanelOpen(false);
        setFontPopoverRect(null);
        setOverflowMenuRect(null);
        setUtilitiesPopoverRect(null);
        setFlowsPopoverRect(null);
        setSendToSheetsPopoverRect(null);
        setSendToComposePopoverRect(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenSidePanelAction = useCallback(() => {
    if (isElectron && window.electronAPI?.closePopover) {
      window.electronAPI.closePopover();
    }
    setIsSidePanelOpen(true);
  }, [isElectron]);

  const handleToggleSidePanelAction = useCallback(() => {
    if (isElectron && window.electronAPI?.closePopover) {
      window.electronAPI.closePopover();
    }
    setIsSidePanelOpen((prev) => !prev);
  }, [isElectron]);

  const handleOpenSendToSheetsPopoverAction = useCallback((rect, forceOpen = false) => {
    setFontPopoverRect(null);
    setOverflowMenuRect(null);
    setUtilitiesPopoverRect(null);
    setFlowsPopoverRect(null);
    setSendToComposePopoverRect(null);
    if (isElectron && window.electronAPI?.openPopover) {
      window.electronAPI.openPopover({ type: 'sendToSheets', bounds: serializeRect(rect), force: forceOpen });
    } else {
      setSendToSheetsPopoverRect((prev) => (forceOpen ? rect : (prev ? null : rect)));
    }
  }, [isElectron]);

  const handleOpenSendToComposePopoverAction = useCallback((rect, forceOpen = false) => {
    setFontPopoverRect(null);
    setOverflowMenuRect(null);
    setUtilitiesPopoverRect(null);
    setFlowsPopoverRect(null);
    setSendToSheetsPopoverRect(null);
    if (isElectron && window.electronAPI?.openPopover) {
      window.electronAPI.openPopover({ type: 'sendToCompose', bounds: serializeRect(rect), force: forceOpen });
    } else {
      setSendToComposePopoverRect((prev) => (forceOpen ? rect : (prev ? null : rect)));
    }
  }, [isElectron]);

  useEffect(() => {
    const handleMainWindowPointerDown = (e) => {
      // Guard: bail if the event originated inside any open popover surface, side panel, or interactive button.
      if (e.target?.closest?.('button')) return;
      if (e.target?.closest?.('[data-popover]')) return;
      if (e.target?.closest?.('[data-side-panel]')) return;
      if (isElectron && window.electronAPI?.closePopover) {
        window.electronAPI.closePopover();
      }
      setFontPopoverRect(null);
      setOverflowMenuRect(null);
      setUtilitiesPopoverRect(null);
      setFlowsPopoverRect(null);
      setSendToSheetsPopoverRect(null);
      setSendToComposePopoverRect(null);
    };

    window.addEventListener('pointerdown', handleMainWindowPointerDown);
    return () => window.removeEventListener('pointerdown', handleMainWindowPointerDown);
  }, [isElectron]);

  // Restore or initialize research tabs
  const [tabs, setTabs] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[BrowserWorkspace] Failed to restore saved tabs:', e);
    }
    return [
      {
        id: 'tab-1',
        title: 'Regaarder Research',
        url: DEFAULT_RESEARCH_URL,
        isLoading: false,
        canGoBack: false,
        canGoForward: false,
        favicon: '',
        isSecure: true
      }
    ];
  });

  const [activeTabId, setActiveTabId] = useState(() => tabs[0]?.id || 'tab-1');

  // Saved Research & Bookmarks store
  const [savedItems, setSavedItems] = useState(() => {
    try {
      const saved = localStorage.getItem(SAVED_ITEMS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return [
      {
        id: 'saved-1',
        title: 'SaaS Competitive Pricing Matrix 2026',
        url: 'https://docs.google.com',
        type: 'pages',
        tag: 'Pricing Matrix',
        savedAt: 'Today, 09:42 AM'
      },
      {
        id: 'saved-2',
        title: 'AI Agent Architecture Patterns & Benchmarks',
        url: 'https://github.com',
        type: 'clippings',
        tag: 'Clipping',
        savedAt: 'Yesterday, 04:15 PM'
      }
    ];
  });

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const isBookmarked = savedItems.some((item) => item.url === activeTab?.url);

  // Listen for actions dispatched from popovers running in standalone Electron windows
  useEffect(() => {
    if (!isElectron || !window.electronAPI?.onPopoverAction) return;

    const unsubscribe = window.electronAPI.onPopoverAction(({ action }) => {
      if (action === 'newTab') {
        handleNewTab(DEFAULT_RESEARCH_URL);
      } else if (action === 'reloadHard') {
        handleReload();
      } else if (action === 'resetWorkspace') {
        setTabs([{
          id: 'tab-1',
          title: 'Regaarder Research',
          url: DEFAULT_RESEARCH_URL,
          isLoading: false,
          canGoBack: false,
          canGoForward: false,
          favicon: '',
          isSecure: true
        }]);
        setActiveTabId('tab-1');
        if (showToast) showToast('Reset browser tabs workspace');
      } else if (action === 'openShortcuts') {
        if (showToast) showToast('Opened Keyboard Shortcuts guide');
      } else if (action === 'openHelp') {
        if (showToast) showToast('Opened Regaarder Help & Documentation');
      } else if (action === 'about') {
        if (showToast) showToast('Regaarder Research v2.4 (Executive Build)');
      } else if (action === 'openExternal') {
        handleOpenExternal();
      } else if (action === 'sendWhiteboard') {
        if (showToast) showToast('Clipped visual layout to Whiteboard canvas');
      } else if (action === 'saveMemory') {
        if (showToast) showToast(`Saved knowledge node for ${activeTab?.title || activeTab?.url} to Memory`);
      } else if (action === 'findInPage') {
        if (showToast) showToast('Opened Find in Page search');
      } else if (action === 'closeTab') {
        handleCloseTab(activeTabId);
      } else if (action === 'openHistory' || action === 'openBookmarks') {
        handleNavigate('regaarder://saved');
      } else if (action === 'openDownloads') {
        if (showToast) showToast('Opened Downloads manager');
      } else if (action === 'printPage') {
        window.print();
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [isElectron, activeTab, activeTabId, showToast]);

  // Persist tabs
  useEffect(() => {
    try {
      const tabDataToSave = tabs.map((t) => ({
        id: t.id,
        title: t.title,
        url: t.url,
        favicon: t.favicon,
        isSecure: t.isSecure
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tabDataToSave));
    } catch (e) {
      // ignore
    }
  }, [tabs]);

  // Persist saved items
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(savedItems));
    } catch (e) {
      // ignore
    }
  }, [savedItems]);

  // Sync with Electron Main Process
  useEffect(() => {
    if (!isElectron || !window.electronAPI) return;

    tabs.forEach((tab) => {
      if (tab.url !== DEFAULT_RESEARCH_URL && tab.url !== 'regaarder://saved') {
        window.electronAPI.createTab(tab.id, tab.url);
      }
    });

    if (activeTabId) {
      const current = tabs.find((t) => t.id === activeTabId);
      if (current && current.url !== DEFAULT_RESEARCH_URL && current.url !== 'regaarder://saved') {
        window.electronAPI.selectTab(activeTabId);
      }
    }

    const unsubscribe = window.electronAPI.onTabUpdated((data) => {
      setTabs((prevTabs) =>
        prevTabs.map((tab) => {
          if (tab.id === data.tabId) {
            return {
              ...tab,
              url: data.url !== undefined ? data.url : tab.url,
              title: data.title !== undefined ? data.title : tab.title,
              isLoading: data.isLoading !== undefined ? data.isLoading : tab.isLoading,
              canGoBack: data.canGoBack !== undefined ? data.canGoBack : tab.canGoBack,
              canGoForward: data.canGoForward !== undefined ? data.canGoForward : tab.canGoForward,
              favicon: data.favicon !== undefined ? data.favicon : tab.favicon,
              isSecure: data.isSecure !== undefined ? data.isSecure : tab.isSecure
            };
          }
          return tab;
        })
      );
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [isElectron]);

  const handleSelectTab = (tabId) => {
    setActiveTabId(tabId);
    const tab = tabs.find((t) => t.id === tabId);
    if (isElectron && window.electronAPI && tab && tab.url !== DEFAULT_RESEARCH_URL && tab.url !== 'regaarder://saved') {
      window.electronAPI.selectTab(tabId);
    }
  };

  const handleNewTab = (initialUrl = DEFAULT_RESEARCH_URL) => {
    const newId = `tab-${Date.now()}`;
    const newTab = {
      id: newId,
      title: initialUrl === DEFAULT_RESEARCH_URL ? 'Regaarder Research' : (initialUrl === 'regaarder://saved' ? 'Saved Research' : 'New Tab'),
      url: initialUrl,
      isLoading: initialUrl !== DEFAULT_RESEARCH_URL && initialUrl !== 'regaarder://saved',
      canGoBack: false,
      canGoForward: false,
      favicon: '',
      isSecure: true
    };

    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);

    if (isElectron && window.electronAPI && initialUrl !== DEFAULT_RESEARCH_URL && initialUrl !== 'regaarder://saved') {
      window.electronAPI.createTab(newId, initialUrl);
      window.electronAPI.selectTab(newId);
    }
  };

  const handleCloseTab = (tabId) => {
    if (tabs.length <= 1) return;

    const nextTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(nextTabs);

    if (activeTabId === tabId) {
      const nextActiveId = nextTabs[nextTabs.length - 1].id;
      setActiveTabId(nextActiveId);
      const nextTab = nextTabs[nextTabs.length - 1];
      if (isElectron && window.electronAPI && nextTab && nextTab.url !== DEFAULT_RESEARCH_URL && nextTab.url !== 'regaarder://saved') {
        window.electronAPI.selectTab(nextActiveId);
      }
    }

    if (isElectron && window.electronAPI) {
      window.electronAPI.closeTab(tabId);
    }
  };

  const handleNavigate = (targetUrl) => {
    if (!targetUrl || !targetUrl.trim()) return;
    const trimmed = targetUrl.trim();
    let formattedUrl = trimmed;

    if (formattedUrl !== DEFAULT_RESEARCH_URL && formattedUrl !== 'regaarder://saved') {
      if (/^https?:\/\//i.test(formattedUrl) || /^regaarder:\/\//i.test(formattedUrl) || /^file:\/\//i.test(formattedUrl)) {
        // Already valid protocol
      } else if (trimmed.includes(' ') || (!trimmed.includes('.') && !trimmed.includes('localhost'))) {
        // Search query (e.g. "react hooks" or "apple market cap")
        formattedUrl = `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
      } else {
        // Domain name (e.g. "google.com" or "localhost:5173")
        const protocol = trimmed.startsWith('localhost') || trimmed.startsWith('127.0.0.1') ? 'http://' : 'https://';
        formattedUrl = protocol + trimmed;
      }
    }

    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? {
              ...t,
              url: formattedUrl,
              title: formattedUrl === DEFAULT_RESEARCH_URL ? 'Regaarder Research' : (formattedUrl === 'regaarder://saved' ? 'Saved Research' : t.title),
              isLoading: formattedUrl !== DEFAULT_RESEARCH_URL && formattedUrl !== 'regaarder://saved',
              isSecure: formattedUrl.startsWith('https://') || formattedUrl.startsWith('regaarder://')
            }
          : t
      )
    );

    if (isElectron && window.electronAPI && formattedUrl !== DEFAULT_RESEARCH_URL && formattedUrl !== 'regaarder://saved') {
      window.electronAPI.createTab(activeTabId, formattedUrl);
      window.electronAPI.selectTab(activeTabId);
      window.electronAPI.navigate(activeTabId, formattedUrl);
    }

    // Record action in Flow engine
    globalActivityObserver.record({
      type: 'navigate',
      url: formattedUrl,
      title: activeTab?.title || formattedUrl
    });
    setRecordedActionCount((prev) => prev + 1);
  };

  const handleGoBack = () => {
    if (isElectron && window.electronAPI) {
      window.electronAPI.goBack(activeTabId);
    }
  };

  const handleGoForward = () => {
    if (isElectron && window.electronAPI) {
      window.electronAPI.goForward(activeTabId);
    }
  };

  const handleReload = () => {
    if (isElectron && window.electronAPI) {
      window.electronAPI.reload(activeTabId);
    } else {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, url: t.url } : t))
      );
    }
  };

  const handleStop = () => {
    if (isElectron && window.electronAPI) {
      window.electronAPI.stop(activeTabId);
    }
  };

  const handleHome = () => {
    handleNavigate(DEFAULT_RESEARCH_URL);
  };

  const handleOpenExternal = () => {
    if (activeTab?.url && activeTab.url !== DEFAULT_RESEARCH_URL && activeTab.url !== 'regaarder://saved') {
      window.open(activeTab.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Flow Recording Control Handlers
  const handleStartRecordingFlow = () => {
    globalActivityObserver.startRecording();
    setIsFlowRecording(true);
    setRecordedActionCount(0);
    if (showToast) showToast('Started Flow recording session');
  };

  const handleStopRecordingFlow = () => {
    const sessionActions = globalActivityObserver.stopRecording();
    setIsFlowRecording(false);
    const synthesized = synthesizeFlowFromActions(
      sessionActions.length > 0 ? sessionActions : globalActivityObserver.getRecentActions(),
      'Competitor Pricing Research'
    );
    setSynthesizedFlowToReview(synthesized);
  };

  const handleSaveRecentAsFlow = () => {
    const recent = globalActivityObserver.getRecentActions();
    const synthesized = synthesizeFlowFromActions(recent, 'Flow from Recent Activity');
    setSynthesizedFlowToReview(synthesized);
  };

  // Direct Toggle Bookmark Action (Zero dialogs prompt, toast with Undo)
  const handleToggleBookmark = () => {
    if (!activeTab?.url) return;

    if (isBookmarked) {
      const removedItem = savedItems.find((i) => i.url === activeTab.url);
      const prevItems = [...savedItems];
      setSavedItems((prev) => prev.filter((i) => i.url !== activeTab.url));

      const undoAction = () => {
        setSavedItems(prevItems);
        if (showToast) showToast(`Restored ${activeTab.title || 'page'} to Saved Research`);
      };

      if (showToast) {
        showToast('Removed from Saved Research', undoAction);
      }
    } else {
      const newItem = {
        id: `saved-${Date.now()}`,
        title: activeTab.title || activeTab.url,
        url: activeTab.url,
        type: 'pages',
        tag: 'Saved Page',
        savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const prevItems = [...savedItems];
      setSavedItems((prev) => [newItem, ...prev]);

      const undoAction = () => {
        setSavedItems(prevItems);
        if (showToast) showToast(`Removed ${activeTab.title || 'page'} from Saved Research`);
      };

      if (showToast) {
        showToast('Saved to Research', undoAction);
      }
    }
  };

  const handleRemoveBookmark = (itemId) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== itemId));
    if (showToast) showToast('Removed from Saved Research');
  };

  const handleExtractText = async () => {
    if (isElectron && window.electronAPI) {
      const result = await window.electronAPI.extractPageText(activeTabId);
      if (result.success) {
        return result.text;
      }
    }
    return `Sample research context from ${activeTab?.title || activeTab?.url || 'webpage'}. Regaarder AI automatically ingests live webpage documents, tables, and notes.`;
  };

  // Contextual Action: Send to Sheets Execution & Undo System
  const handleExecuteSendToSheets = (payload) => {
    const { destinationSheet, tableData } = payload;
    const count = tableData.rows ? tableData.rows.length : 24;
    const msg = `${count} rows added to ${destinationSheet}`;

    globalActivityObserver.record({
      type: 'send_to_sheets',
      target: 'Sheets',
      destination: destinationSheet
    });
    setRecordedActionCount((prev) => prev + 1);

    const undoAction = () => {
      if (showToast) showToast(`Reverted data export to ${destinationSheet}`);
    };

    if (showToast) {
      showToast(msg, undoAction);
    }
  };

  // Contextual Action: Send to Compose Execution & Undo System
  const handleExecuteSendToCompose = (payload) => {
    const { destinationDoc } = payload;
    const msg = `Added to ${destinationDoc}`;

    globalActivityObserver.record({
      type: 'send_to_compose',
      target: 'Compose',
      destination: destinationDoc
    });
    setRecordedActionCount((prev) => prev + 1);

    const undoAction = () => {
      if (showToast) showToast(`Reverted content export to ${destinationDoc}`);
    };

    if (showToast) {
      showToast(msg, undoAction);
    }
  };

  const isModalOpen = Boolean(
    showCompetitorWorkflow ||
    synthesizedFlowToReview ||
    showFlowLibraryModal ||
    activeExecutingFlow
  );

  const isPopoverOpen = !isElectron && Boolean(
    fontPopoverRect ||
    overflowMenuRect ||
    utilitiesPopoverRect ||
    flowsPopoverRect ||
    sendToSheetsPopoverRect ||
    sendToComposePopoverRect
  );

  return (
    <div className="flex flex-col w-full h-full bg-slate-900 overflow-hidden font-sans select-none relative">
      {/* Active Flow Recording Sticky Indicator Bar */}
      {isFlowRecording && (
        <RecordingIndicatorBar
          actionCount={recordedActionCount}
          onStop={handleStopRecordingFlow}
        />
      )}

      {/* Regaarder Research Tab Bar */}
      <BrowserTabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={handleSelectTab}
        onCloseTab={handleCloseTab}
        onNewTab={() => handleNewTab(DEFAULT_RESEARCH_URL)}
      />

      {/* Executive Navigation Toolbar */}
      <BrowserToolbar
        currentUrl={activeTab?.url || ''}
        isLoading={activeTab?.isLoading || false}
        canGoBack={activeTab?.canGoBack || false}
        canGoForward={activeTab?.canGoForward || false}
        isSecure={activeTab?.isSecure !== false}
        isBookmarked={isBookmarked}
        isSidePanelOpen={isSidePanelOpen}
        isFlowRecording={isFlowRecording}
        isFlowsPopoverOpen={Boolean(flowsPopoverRect)}
        isFontPopoverOpen={Boolean(fontPopoverRect)}
        isUtilitiesPopoverOpen={Boolean(utilitiesPopoverRect)}
        isOverflowMenuOpen={Boolean(overflowMenuRect)}
        browserFont={browserFont}
        browserFontSize={browserFontSize}
        onNavigate={handleNavigate}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onReload={handleReload}
        onStop={handleStop}
        onHome={handleHome}
        onToggleBookmark={handleToggleBookmark}
        onToggleSidePanel={handleToggleSidePanelAction}
        onOpenFontPopover={handleOpenFontPopoverAction}
        onOpenFlowsPopover={handleOpenFlowsPopoverAction}
        onOpenUtilitiesPopover={handleOpenUtilitiesPopoverAction}
        onOpenOverflowMenu={handleOpenOverflowMenuAction}
        onSaveMemoryChip={() => {
          if (showToast) showToast(`Saved knowledge node for ${activeTab?.title || activeTab?.url} to Memory`);
        }}
        onSummarizeChip={handleToggleSidePanelAction}
      />

      {/* Viewport + Side Panel Layout (Reserved Gutter Architecture) */}
      <div className="flex-1 flex w-full h-full overflow-hidden relative bg-white dark:bg-zinc-950">
        <div 
          className="flex-1 h-full min-w-0 relative bg-white dark:bg-zinc-950 transition-[margin-right] duration-150 ease-out"
          style={{
            marginRight: isSidePanelOpen ? '380px' : '0px'
          }}
        >
          <BrowserViewport
            activeTab={activeTab}
            savedItems={savedItems}
            isElectron={isElectron}
            isSidePanelOpen={isSidePanelOpen}
            isRightSideHovered={false}
            isModalOpen={isModalOpen}
            isPopoverOpen={isPopoverOpen}
            browserFont={browserFont}
            browserFontSize={browserFontSize}
            onNavigate={handleNavigate}
            onLaunchCompetitorWorkflow={() => setShowCompetitorWorkflow(true)}
            onToggleSidePanel={handleToggleSidePanelAction}
            onRemoveBookmark={handleRemoveBookmark}
          />
        </div>

        {/* Regaarder AI Assistant Side Panel (Explicit Click Toggle Only) */}
        {isSidePanelOpen && (
          <div data-side-panel="true" data-popover="true" className="absolute right-0 top-0 bottom-0 z-40 w-[380px] max-w-[90vw] h-full shadow-2xl border-l border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 animate-in slide-in-from-right duration-200">
            <BrowserResearchPanel
              activeTab={activeTab}
              onClose={() => setIsSidePanelOpen(false)}
              onExtractText={handleExtractText}
              onOpenSendToCompose={(rect) => {
                handleOpenSendToComposePopoverAction(rect || { bottom: 60, right: 300 });
              }}
              onOpenSendToSheets={(rect) => {
                handleOpenSendToSheetsPopoverAction(rect || { bottom: 60, right: 300 });
              }}
              onSaveToMemory={() => {
                if (showToast) showToast(`Saved knowledge node for ${activeTab?.title || activeTab?.url} to Memory`);
              }}
              onSendToWhiteboard={() => {
                if (showToast) showToast('Clipped visual layout to Whiteboard canvas');
              }}
              onRunFlowRequested={(flow, initialInputs) => {
                setActiveExecutingFlow({ flow, initialInputs });
              }}
              showToast={showToast}
            />
          </div>
        )}
      </div>

      {/* Regaarder Flows Menu Popover */}
      {flowsPopoverRect && (
        <BrowserFlowsPopover
          anchorRect={flowsPopoverRect}
          isRecording={isFlowRecording}
          onClose={() => setFlowsPopoverRect(null)}
          onStartRecording={() => {
            if (isFlowRecording) {
              handleStopRecordingFlow();
            } else {
              handleStartRecordingFlow();
            }
          }}
          onSaveRecentAsFlow={handleSaveRecentAsFlow}
          onOpenRunFlow={(selectedFlow) => {
            if (selectedFlow) {
              setActiveExecutingFlow({ flow: selectedFlow });
            } else {
              const saved = getSavedFlows();
              if (saved.length > 0) {
                setActiveExecutingFlow({ flow: saved[0] });
              }
            }
          }}
          onOpenMyFlows={() => setShowFlowLibraryModal(true)}
        />
      )}

      {/* Flow Synthesis & Review Modal */}
      {synthesizedFlowToReview && (
        <FlowSynthesisModal
          synthesizedFlow={synthesizedFlowToReview}
          onClose={() => setSynthesizedFlowToReview(null)}
          onSaveSuccess={(updatedFlows, savedFlow) => {
            // Optionally auto-open execution modal for immediate reuse
          }}
          showToast={showToast}
        />
      )}

      {/* My Flows Library Modal */}
      {showFlowLibraryModal && (
        <FlowLibraryModal
          onClose={() => setShowFlowLibraryModal(false)}
          onRunFlow={(flow) => setActiveExecutingFlow({ flow })}
          showToast={showToast}
        />
      )}

      {/* Flow Execution Overlay Modal */}
      {activeExecutingFlow && (
        <FlowExecutionModal
          flow={activeExecutingFlow.flow}
          initialInputs={activeExecutingFlow.initialInputs}
          onClose={() => setActiveExecutingFlow(null)}
          onNavigate={handleNavigate}
          onSendToSheets={(tableData) => {
            handleExecuteSendToSheets({
              destinationSheet: activeExecutingFlow.flow?.name || 'Competitor Analysis',
              tableData
            });
          }}
          showToast={showToast}
        />
      )}

      {/* Contextual Action Popover: Send to Sheets */}
      {sendToSheetsPopoverRect && (
        <SendToSheetsPopover
          anchorRect={sendToSheetsPopoverRect}
          activeTab={activeTab}
          onClose={() => setSendToSheetsPopoverRect(null)}
          onExecuteExport={handleExecuteSendToSheets}
          showToast={showToast}
        />
      )}

      {/* Contextual Action Popover: Send to Compose */}
      {sendToComposePopoverRect && (
        <SendToComposePopover
          anchorRect={sendToComposePopoverRect}
          activeTab={activeTab}
          onClose={() => setSendToComposePopoverRect(null)}
          onExecuteExport={handleExecuteSendToCompose}
          showToast={showToast}
        />
      )}

      {/* Intelligent Workflow: Competitor Research */}
      {showCompetitorWorkflow && (
        <CompetitorResearchWorkflow
          onClose={() => setShowCompetitorWorkflow(false)}
          onSendToSheets={(tableData) => {
            handleExecuteSendToSheets({
              destinationSheet: 'Competitor Research Matrix',
              tableData
            });
          }}
          onNavigate={handleNavigate}
          showToast={showToast}
        />
      )}

      {/* Executive Regaarder Commands Popover */}
      {utilitiesPopoverRect && (
        <BrowserUtilitiesPopover
          anchorRect={utilitiesPopoverRect}
          onClose={() => setUtilitiesPopoverRect(null)}
          onOpenFlows={(rect) => {
            if (isFlowRecording) {
              handleStopRecordingFlow();
            } else {
              handleStartRecordingFlow();
            }
            handleOpenFlowsPopoverAction(rect || utilitiesPopoverRect || { top: 48, right: 120, width: 30, height: 30 }, true);
          }}
          onOpenExternal={handleOpenExternal}
          onOpenSendToSheets={(rect) => {
            handleOpenSendToSheetsPopoverAction(rect || utilitiesPopoverRect, true);
          }}
          onOpenSendToCompose={(rect) => {
            handleOpenSendToComposePopoverAction(rect || utilitiesPopoverRect, true);
          }}
          onSendWhiteboard={() => {
            if (showToast) showToast('Clipped visual layout to Whiteboard canvas');
          }}
          onSaveMemory={() => {
            if (showToast) showToast(`Saved knowledge node for ${activeTab?.title || activeTab?.url} to Memory`);
          }}
          onSummarizePage={handleToggleSidePanelAction}
          onOpenCompetitorWorkflow={() => {
            setShowCompetitorWorkflow(true);
          }}
          onFindInPage={() => {
            if (showToast) showToast('Opened Find in Page search');
          }}
          onCloseTab={() => handleCloseTab(activeTabId)}
          onPrintPage={() => {
            window.print();
          }}
        />
      )}

      {/* Executive Browser Overflow Popover Menu */}
      {overflowMenuRect && (
        <BrowserOverflowMenu
          anchorRect={overflowMenuRect}
          onClose={() => setOverflowMenuRect(null)}
          onNewTab={() => {
            handleNewTab(DEFAULT_RESEARCH_URL);
            setOverflowMenuRect(null);
          }}
          onReloadHard={() => {
            handleReload();
            setOverflowMenuRect(null);
          }}
          onResetWorkspace={() => {
            setTabs([{
              id: 'tab-1',
              title: 'Regaarder Research',
              url: DEFAULT_RESEARCH_URL,
              isLoading: false,
              canGoBack: false,
              canGoForward: false,
              favicon: '',
              isSecure: true
            }]);
            setActiveTabId('tab-1');
            if (showToast) showToast('Reset browser tabs workspace');
            setOverflowMenuRect(null);
          }}
          onOpenFlows={(rect) => {
            handleOpenFlowsPopoverAction(rect || overflowMenuRect, true);
          }}
          onOpenAppearance={(rect) => {
            handleOpenFontPopoverAction(rect || overflowMenuRect, true);
          }}
          onOpenSettings={(rect) => {
            handleOpenFontPopoverAction(rect || overflowMenuRect, true);
          }}
          onOpenShortcuts={() => {
            if (showToast) showToast('Opened Keyboard Shortcuts guide');
            setOverflowMenuRect(null);
          }}
          onOpenHelp={() => {
            if (showToast) showToast('Opened Regaarder Help & Documentation');
            setOverflowMenuRect(null);
          }}
          onAbout={() => {
            if (showToast) showToast('Regaarder Research v2.4 (Executive Build)');
            setOverflowMenuRect(null);
          }}
        />
      )}

      {/* Contextual Options Popover: Isolated Browser Font, Size & Appearance */}
      {fontPopoverRect && (
        <BrowserFontPopover
          anchorRect={fontPopoverRect}
          isDarkMode={isDarkModeState}
          browserFont={browserFont}
          browserFontSize={browserFontSize}
          onChangeFont={(newFont) => {
            setBrowserFont(newFont);
            if (isElectron && window.electronAPI?.setFontZoom) {
              window.electronAPI.setFontZoom({ font: newFont, size: browserFontSize });
            }
            if (showToast) showToast(`Browser font updated to ${newFont}`);
          }}
          onChangeFontSize={(newSize) => {
            setBrowserFontSize(newSize);
            if (isElectron && window.electronAPI?.setFontZoom) {
              window.electronAPI.setFontZoom({ font: browserFont, size: newSize });
            }
            if (showToast) showToast(`Browser size set to ${newSize}%`);
          }}
          onToggleDarkMode={handleToggleDarkMode}
          onReset={() => {
            setBrowserFont('System Default');
            setBrowserFontSize(100);
            if (isElectron && window.electronAPI?.setFontZoom) {
              window.electronAPI.setFontZoom({ font: 'System Default', size: 100 });
            }
            if (showToast) showToast('Reset browser font and zoom');
          }}
          onClose={() => setFontPopoverRect(null)}
        />
      )}
    </div>
  );
};

export default BrowserWorkspace;
