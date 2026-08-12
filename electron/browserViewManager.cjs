const { WebContentsView } = require('electron');

class BrowserViewManager {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.tabs = new Map(); // tabId -> tabState object
    this.activeTabId = null;
    this.bounds = { x: 0, y: 0, width: 0, height: 0 };
    this.isVisible = false;
  }

  createTab(tabId, initialUrl = 'https://google.com') {
    if (this.tabs.has(tabId)) {
      this.selectTab(tabId);
      return;
    }

    const view = new WebContentsView({
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        webSecurity: true,
        allowRunningInsecureContent: false
      }
    });

    view.webContents.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Regaarder/1.0'
    );

    const tabState = {
      tabId,
      view,
      url: initialUrl,
      title: 'New Tab',
      isLoading: true,
      canGoBack: false,
      canGoForward: false,
      favicon: '',
      isSecure: initialUrl.startsWith('https://')
    };

    this.tabs.set(tabId, tabState);

    const wc = view.webContents;

    wc.on('did-start-loading', () => {
      tabState.isLoading = true;
      this.emitTabUpdate(tabId);
    });

    wc.on('did-stop-loading', () => {
      tabState.isLoading = false;
      tabState.canGoBack = wc.canGoBack();
      tabState.canGoForward = wc.canGoForward();
      this.emitTabUpdate(tabId);
    });

    wc.on('did-fail-load', (event, errorCode, errorDescription) => {
      // Don't treat cancelled loads (e.g. user navigating away -3) as total failure
      if (errorCode !== -3) {
        console.warn(`[BrowserViewManager] Tab ${tabId} failed to load: ${errorDescription} (${errorCode})`);
      }
      tabState.isLoading = false;
      this.emitTabUpdate(tabId);
    });

    wc.on('page-title-updated', (event, title) => {
      tabState.title = title || 'Untitled';
      this.emitTabUpdate(tabId);
    });

    wc.on('page-favicon-updated', (event, favicons) => {
      if (favicons && favicons.length > 0) {
        tabState.favicon = favicons[0];
        this.emitTabUpdate(tabId);
      }
    });

    wc.on('did-navigate', (event, url) => {
      tabState.url = url;
      tabState.isSecure = url.startsWith('https://');
      tabState.canGoBack = wc.canGoBack();
      tabState.canGoForward = wc.canGoForward();
      this.emitTabUpdate(tabId);
    });

    wc.on('did-navigate-in-page', (event, url) => {
      tabState.url = url;
      tabState.canGoBack = wc.canGoBack();
      tabState.canGoForward = wc.canGoForward();
      this.emitTabUpdate(tabId);
    });

    wc.setWindowOpenHandler(({ url }) => {
      this.mainWindow.webContents.send('browser:open-new-tab-requested', { url });
      return { action: 'deny' };
    });

    wc.loadURL(initialUrl).catch(err => {
      console.error(`[BrowserViewManager] Failed to load URL ${initialUrl}:`, err);
    });

    if (!this.activeTabId) {
      this.selectTab(tabId);
    }
  }

  selectTab(tabId) {
    if (!this.tabs.has(tabId)) return;

    if (this.activeTabId && this.tabs.has(this.activeTabId)) {
      const prevTab = this.tabs.get(this.activeTabId);
      try {
        this.mainWindow.contentView.removeChildView(prevTab.view);
      } catch (e) {
        // ignore if already removed
      }
    }

    this.activeTabId = tabId;
    const currentTab = this.tabs.get(tabId);

    if (this.isVisible && this.bounds.width > 0 && this.bounds.height > 0) {
      try {
        this.mainWindow.contentView.addChildView(currentTab.view);
        currentTab.view.setBounds(this.bounds);
      } catch (e) {
        console.error('[BrowserViewManager] Error adding child view:', e);
      }
    }

    this.emitTabUpdate(tabId);
  }

  closeTab(tabId) {
    if (!this.tabs.has(tabId)) return;

    const tabState = this.tabs.get(tabId);
    if (this.activeTabId === tabId) {
      try {
        this.mainWindow.contentView.removeChildView(tabState.view);
      } catch (e) {}
    }

    try {
      tabState.view.webContents.close();
    } catch (e) {}

    this.tabs.delete(tabId);

    if (this.activeTabId === tabId) {
      const remainingTabIds = Array.from(this.tabs.keys());
      if (remainingTabIds.length > 0) {
        this.selectTab(remainingTabIds[remainingTabIds.length - 1]);
      } else {
        this.activeTabId = null;
      }
    }
  }

  updateBounds(bounds) {
    this.bounds = {
      x: Math.round(bounds.x),
      y: Math.round(bounds.y),
      width: Math.round(bounds.width),
      height: Math.round(bounds.height)
    };

    if (this.activeTabId && this.tabs.has(this.activeTabId) && this.isVisible) {
      const currentTab = this.tabs.get(this.activeTabId);
      if (this.bounds.width > 0 && this.bounds.height > 0) {
        try {
          if (!this.mainWindow.contentView.children.includes(currentTab.view)) {
            this.mainWindow.contentView.addChildView(currentTab.view);
          }
          currentTab.view.setBounds(this.bounds);
        } catch (e) {
          console.error('[BrowserViewManager] Error updating view bounds:', e);
        }
      }
    }
  }

  setVisibility(visible) {
    this.isVisible = visible;
    if (!this.activeTabId || !this.tabs.has(this.activeTabId)) return;

    const currentTab = this.tabs.get(this.activeTabId);
    if (visible && this.bounds.width > 0 && this.bounds.height > 0) {
      try {
        if (!this.mainWindow.contentView.children.includes(currentTab.view)) {
          this.mainWindow.contentView.addChildView(currentTab.view);
        }
        currentTab.view.setBounds(this.bounds);
      } catch (e) {
        console.error('[BrowserViewManager] Error setting visibility:', e);
      }
    } else {
      try {
        this.mainWindow.contentView.removeChildView(currentTab.view);
      } catch (e) {}
    }
  }

  navigate(tabId, url) {
    const tabState = this.tabs.get(tabId);
    if (!tabState || !url) return;
    const trimmed = url.trim();
    let targetUrl = trimmed;

    if (!/^https?:\/\//i.test(targetUrl) && !/^regaarder:\/\//i.test(targetUrl) && !/^file:\/\//i.test(targetUrl)) {
      if (trimmed.includes(' ') || (!trimmed.includes('.') && !trimmed.startsWith('localhost'))) {
        targetUrl = `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
      } else {
        const protocol = trimmed.startsWith('localhost') || trimmed.startsWith('127.0.0.1') ? 'http://' : 'https://';
        targetUrl = protocol + trimmed;
      }
    }

    if (tabState.url === targetUrl && tabState.isLoading) {
      return;
    }
    tabState.view.webContents.loadURL(targetUrl).catch(err => {
      console.error(`[BrowserViewManager] Failed to navigate to ${targetUrl}:`, err);
    });
  }

  goBack(tabId) {
    const tabState = this.tabs.get(tabId);
    if (tabState && tabState.view.webContents.canGoBack()) {
      tabState.view.webContents.goBack();
    }
  }

  goForward(tabId) {
    const tabState = this.tabs.get(tabId);
    if (tabState && tabState.view.webContents.canGoForward()) {
      tabState.view.webContents.goForward();
    }
  }

  reload(tabId) {
    const tabState = this.tabs.get(tabId);
    if (tabState) {
      tabState.view.webContents.reload();
    }
  }

  stop(tabId) {
    const tabState = this.tabs.get(tabId);
    if (tabState) {
      tabState.view.webContents.stop();
    }
  }

  async extractPageText(tabId) {
    const tabState = this.tabs.get(tabId);
    if (!tabState) return { success: false, text: '' };
    try {
      const text = await tabState.view.webContents.executeJavaScript('document.body.innerText');
      return { success: true, text: text || '' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  emitTabUpdate(tabId) {
    const tabState = this.tabs.get(tabId);
    if (!tabState) return;
    this.mainWindow.webContents.send('browser:tab-updated', {
      tabId: tabState.tabId,
      url: tabState.url,
      title: tabState.title,
      isLoading: tabState.isLoading,
      canGoBack: tabState.canGoBack,
      canGoForward: tabState.canGoForward,
      favicon: tabState.favicon,
      isSecure: tabState.isSecure,
      isActive: tabId === this.activeTabId
    });
  }
}

module.exports = BrowserViewManager;
