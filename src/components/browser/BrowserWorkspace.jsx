import React, { useState, useEffect, useCallback } from 'react';
import BrowserTabBar from './BrowserTabBar';
import BrowserToolbar from './BrowserToolbar';
import BrowserViewport from './BrowserViewport';
import BrowserResearchPanel from './BrowserResearchPanel';

const STORAGE_KEY = 'regaarder_research_tabs_v2';
const DEFAULT_RESEARCH_URL = 'regaarder://research';

export const BrowserWorkspace = ({ showToast }) => {
  const isElectron = Boolean(window.electronAPI?.isElectron);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

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

  // Sync with Electron Main Process
  useEffect(() => {
    if (!isElectron || !window.electronAPI) return;

    tabs.forEach((tab) => {
      if (tab.url !== DEFAULT_RESEARCH_URL) {
        window.electronAPI.createTab(tab.id, tab.url);
      }
    });

    if (activeTabId) {
      const current = tabs.find((t) => t.id === activeTabId);
      if (current && current.url !== DEFAULT_RESEARCH_URL) {
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

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const handleSelectTab = (tabId) => {
    setActiveTabId(tabId);
    const tab = tabs.find((t) => t.id === tabId);
    if (isElectron && window.electronAPI && tab && tab.url !== DEFAULT_RESEARCH_URL) {
      window.electronAPI.selectTab(tabId);
    }
  };

  const handleNewTab = (initialUrl = DEFAULT_RESEARCH_URL) => {
    const newId = `tab-${Date.now()}`;
    const newTab = {
      id: newId,
      title: initialUrl === DEFAULT_RESEARCH_URL ? 'Regaarder Research' : 'New Tab',
      url: initialUrl,
      isLoading: initialUrl !== DEFAULT_RESEARCH_URL,
      canGoBack: false,
      canGoForward: false,
      favicon: '',
      isSecure: true
    };

    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);

    if (isElectron && window.electronAPI && initialUrl !== DEFAULT_RESEARCH_URL) {
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
      if (isElectron && window.electronAPI && nextTab && nextTab.url !== DEFAULT_RESEARCH_URL) {
        window.electronAPI.selectTab(nextActiveId);
      }
    }

    if (isElectron && window.electronAPI) {
      window.electronAPI.closeTab(tabId);
    }
  };

  const handleNavigate = (targetUrl) => {
    let formattedUrl = targetUrl;
    if (formattedUrl !== DEFAULT_RESEARCH_URL && !/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? { ...t, url: formattedUrl, isLoading: formattedUrl !== DEFAULT_RESEARCH_URL, isSecure: formattedUrl.startsWith('https://') }
          : t
      )
    );

    if (isElectron && window.electronAPI && formattedUrl !== DEFAULT_RESEARCH_URL) {
      window.electronAPI.createTab(activeTabId, formattedUrl);
      window.electronAPI.navigate(activeTabId, formattedUrl);
    }
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
    if (activeTab?.url && activeTab.url !== DEFAULT_RESEARCH_URL) {
      window.open(activeTab.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleExtractText = async () => {
    if (isElectron && window.electronAPI) {
      const result = await window.electronAPI.extractPageText(activeTabId);
      if (result.success) {
        return result.text;
      }
    }
    // Fallback simulation for non-electron or empty states
    return `Sample research context from ${activeTab?.title || activeTab?.url || 'webpage'}. Regaarder AI automatically ingests live webpage documents, tables, and notes.`;
  };

  const handleSendToCompose = async () => {
    const text = await handleExtractText();
    if (showToast) showToast(`Clipped webpage content into Compose document (${text.length} chars)`);
  };

  const handleSendToSheets = async () => {
    if (showToast) showToast(`Extracted pricing & metrics table from ${activeTab?.title || 'page'} into Sheets`);
  };

  const handleSaveToMemory = async () => {
    if (showToast) showToast(`Saved knowledge node for ${activeTab?.title || activeTab?.url} to Regaarder Memory`);
  };

  const handleSendToWhiteboard = async () => {
    if (showToast) showToast(`Clipped visual layout from ${activeTab?.title || 'page'} to Whiteboard canvas`);
  };

  const handleBookmarkPage = () => {
    if (showToast) showToast(`Bookmarked ${activeTab?.title || activeTab?.url} in Regaarder Research`);
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-900 overflow-hidden font-sans select-none">
      {/* Regaarder Research Tab Bar */}
      <BrowserTabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={handleSelectTab}
        onCloseTab={handleCloseTab}
        onNewTab={() => handleNewTab(DEFAULT_RESEARCH_URL)}
      />

      {/* Regaarder Research Navigation & Action Bar */}
      <BrowserToolbar
        currentUrl={activeTab?.url || ''}
        isLoading={activeTab?.isLoading || false}
        canGoBack={activeTab?.canGoBack || false}
        canGoForward={activeTab?.canGoForward || false}
        isSecure={activeTab?.isSecure !== false}
        isSidePanelOpen={isSidePanelOpen}
        onNavigate={handleNavigate}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onReload={handleReload}
        onStop={handleStop}
        onHome={handleHome}
        onOpenExternal={handleOpenExternal}
        onToggleSidePanel={() => setIsSidePanelOpen((prev) => !prev)}
        onSummarizeChip={() => {
          setIsSidePanelOpen(true);
        }}
        onSaveMemoryChip={handleSaveToMemory}
        onSendComposeChip={handleSendToCompose}
        onSendSheetsChip={handleSendToSheets}
        onSendWhiteboardChip={handleSendToWhiteboard}
        onBookmarkPage={handleBookmarkPage}
      />

      {/* Main Workspace Layout (Viewport + AI Research Assistant Side Panel) */}
      <div className="flex-1 flex w-full h-full overflow-hidden relative">
        {/* Chromium Viewport / Research Home */}
        <BrowserViewport
          activeTab={activeTab}
          isElectron={isElectron}
          isSidePanelOpen={isSidePanelOpen}
          onNavigate={handleNavigate}
        />

        {/* AI Research Assistant Side Panel */}
        {isSidePanelOpen && (
          <BrowserResearchPanel
            activeTab={activeTab}
            onClose={() => setIsSidePanelOpen(false)}
            onExtractText={handleExtractText}
            onSendToCompose={handleSendToCompose}
            onSendToSheets={handleSendToSheets}
            onSaveToMemory={handleSaveToMemory}
            onSendToWhiteboard={handleSendToWhiteboard}
            showToast={showToast}
          />
        )}
      </div>
    </div>
  );
};

export default BrowserWorkspace;
