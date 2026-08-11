import React, { useState, useEffect, useCallback } from 'react';
import BrowserTabBar from './BrowserTabBar';
import BrowserToolbar from './BrowserToolbar';
import BrowserViewport from './BrowserViewport';

const STORAGE_KEY = 'regaarder_browser_tabs_v1';
const DEFAULT_START_URL = 'https://google.com';

export const BrowserWorkspace = ({ showToast }) => {
  const isElectron = Boolean(window.electronAPI?.isElectron);

  // Initialize tabs from localStorage or default tab
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
        title: 'Google',
        url: DEFAULT_START_URL,
        isLoading: false,
        canGoBack: false,
        canGoForward: false,
        favicon: '',
        isSecure: true
      }
    ];
  });

  const [activeTabId, setActiveTabId] = useState(() => tabs[0]?.id || 'tab-1');

  // Persist tabs to localStorage
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

    // Create tabs in Electron main process
    tabs.forEach((tab) => {
      window.electronAPI.createTab(tab.id, tab.url);
    });

    if (activeTabId) {
      window.electronAPI.selectTab(activeTabId);
    }

    // Subscribe to tab updates from main process
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
    if (isElectron && window.electronAPI) {
      window.electronAPI.selectTab(tabId);
    }
  };

  const handleNewTab = (initialUrl = DEFAULT_START_URL) => {
    const newId = `tab-${Date.now()}`;
    const newTab = {
      id: newId,
      title: 'New Tab',
      url: initialUrl,
      isLoading: true,
      canGoBack: false,
      canGoForward: false,
      favicon: '',
      isSecure: initialUrl.startsWith('https://')
    };

    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);

    if (isElectron && window.electronAPI) {
      window.electronAPI.createTab(newId, initialUrl);
      window.electronAPI.selectTab(newId);
    }
  };

  const handleCloseTab = (tabId) => {
    if (tabs.length <= 1) return; // Keep at least 1 tab open

    const nextTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(nextTabs);

    if (activeTabId === tabId) {
      const nextActiveId = nextTabs[nextTabs.length - 1].id;
      setActiveTabId(nextActiveId);
      if (isElectron && window.electronAPI) {
        window.electronAPI.selectTab(nextActiveId);
      }
    }

    if (isElectron && window.electronAPI) {
      window.electronAPI.closeTab(tabId);
    }
  };

  const handleNavigate = (targetUrl) => {
    let formattedUrl = targetUrl;
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? { ...t, url: formattedUrl, isLoading: true, isSecure: formattedUrl.startsWith('https://') }
          : t
      )
    );

    if (isElectron && window.electronAPI) {
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
      // Force iframe refresh
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
    handleNavigate(DEFAULT_START_URL);
  };

  const handleOpenExternal = () => {
    if (activeTab?.url) {
      window.open(activeTab.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleExtractAIContent = async (action) => {
    if (isElectron && window.electronAPI) {
      const result = await window.electronAPI.extractPageText(activeTabId);
      if (result.success) {
        if (showToast) showToast(`Extracted page text (${result.text.length} chars)`);
      } else {
        if (showToast) showToast(`Failed to extract text: ${result.error || 'Unknown error'}`);
      }
    } else {
      if (showToast) showToast('AI page extraction requires native Regaarder desktop shell');
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-900 overflow-hidden font-sans select-none">
      {/* Browser Tab Bar */}
      <BrowserTabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={handleSelectTab}
        onCloseTab={handleCloseTab}
        onNewTab={() => handleNewTab(DEFAULT_START_URL)}
      />

      {/* Navigation Toolbar */}
      <BrowserToolbar
        currentUrl={activeTab?.url || ''}
        isLoading={activeTab?.isLoading || false}
        canGoBack={activeTab?.canGoBack || false}
        canGoForward={activeTab?.canGoForward || false}
        isSecure={activeTab?.isSecure !== false}
        onNavigate={handleNavigate}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onReload={handleReload}
        onStop={handleStop}
        onHome={handleHome}
        onOpenExternal={handleOpenExternal}
        onExtractAIContent={handleExtractAIContent}
      />

      {/* Chromium / Viewport Surface */}
      <BrowserViewport
        activeTab={activeTab}
        isElectron={isElectron}
        onNavigate={handleNavigate}
      />
    </div>
  );
};

export default BrowserWorkspace;
