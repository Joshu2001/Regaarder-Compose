const { WebContentsView } = require('electron');

// Safe navigation history helpers resolving Electron webContents.canGoBack / canGoForward deprecation warnings
function getCanGoBack(wc) {
  if (!wc || wc.isDestroyed()) return false;
  if (wc.navigationHistory && typeof wc.navigationHistory.canGoBack === 'function') {
    return wc.navigationHistory.canGoBack();
  }
  return typeof wc.canGoBack === 'function' ? wc.canGoBack() : false;
}

function getCanGoForward(wc) {
  if (!wc || wc.isDestroyed()) return false;
  if (wc.navigationHistory && typeof wc.navigationHistory.canGoForward === 'function') {
    return wc.navigationHistory.canGoForward();
  }
  return typeof wc.canGoForward === 'function' ? wc.canGoForward() : false;
}

function performGoBack(wc) {
  if (!wc || wc.isDestroyed()) return;
  if (wc.navigationHistory && typeof wc.navigationHistory.goBack === 'function') {
    wc.navigationHistory.goBack();
  } else if (typeof wc.goBack === 'function') {
    wc.goBack();
  }
}

function performGoForward(wc) {
  if (!wc || wc.isDestroyed()) return;
  if (wc.navigationHistory && typeof wc.navigationHistory.goForward === 'function') {
    wc.navigationHistory.goForward();
  } else if (typeof wc.goForward === 'function') {
    wc.goForward();
  }
}

class BrowserViewManager {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.isOpeningPopover = false;
    if (this.mainWindow && typeof this.mainWindow.on === 'function') {
      this.mainWindow.on('blur', () => {
        if (this.isOpeningPopover) return;
        try {
          const { BrowserWindow } = require('electron');
          const focusedWin = BrowserWindow.getFocusedWindow();
          if (focusedWin && (focusedWin === this.mainWindow || focusedWin === this.popoverWindow)) {
            return;
          }
        } catch (e) {}
        this.closePopover();
      });
      this.mainWindow.on('hide', () => this.closePopover());
      this.mainWindow.on('minimize', () => this.closePopover());
    }
    this.tabs = new Map(); // tabId -> tabState object
    this.activeTabId = null;
    this.bounds = { x: 0, y: 0, width: 0, height: 0 };
    this.isVisible = false;
    this.popoverView = null;
    this.popoverType = null;
    this.currentFont = 'System Default';
    this.currentFontSize = 100;
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

    wc.on('before-input-event', (event, input) => {
      if (input.type === 'mouseDown' || input.type === 'touchStart') {
        this.closePopover();
      }
    });

    wc.on('did-start-loading', () => {
      tabState.isLoading = true;
      this.emitTabUpdate(tabId);
      this.injectCustomScrollbar(wc);
    });

    wc.on('dom-ready', () => {
      this.injectCustomScrollbar(wc);
    });

    wc.on('did-stop-loading', () => {
      tabState.isLoading = false;
      tabState.canGoBack = getCanGoBack(wc);
      tabState.canGoForward = getCanGoForward(wc);
      this.emitTabUpdate(tabId);
      this.setFontZoom();
      this.injectCustomScrollbar(wc);
    });

    wc.on('did-fail-load', (event, errorCode, errorDescription) => {
      // Don't treat cancelled loads (e.g. user navigating away -3) as total failure
      if (errorCode !== -3) {
        console.warn(`[BrowserViewManager] Tab ${tabId} failed to load: ${errorDescription} (${errorCode})`);
      }
      tabState.isLoading = false;
      this.emitTabUpdate(tabId);
    });

    wc.on('before-input-event', (event, input) => {
      if (input.type === 'keyDown' && (input.key === 'Escape' || input.code === 'Escape')) {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
          this.mainWindow.webContents.send('browser:esc-pressed');
        }
      }
      if (input.type === 'mouseDown' || input.type === 'touchStart') {
        this.closePopover();
      }
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
      tabState.canGoBack = getCanGoBack(wc);
      tabState.canGoForward = getCanGoForward(wc);
      this.emitTabUpdate(tabId);
      this.injectCustomScrollbar(wc);
    });

    wc.on('did-navigate-in-page', (event, url) => {
      tabState.url = url;
      tabState.canGoBack = getCanGoBack(wc);
      tabState.canGoForward = getCanGoForward(wc);
      this.emitTabUpdate(tabId);
      this.injectCustomScrollbar(wc);
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
        this.mainWindow.contentView.addChildView(currentTab.view, 0);
        currentTab.view.setBounds(this.bounds);
        if (typeof currentTab.view.webContents.setSize === 'function') {
          currentTab.view.webContents.setSize({ width: this.bounds.width, height: this.bounds.height });
        }
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
            this.mainWindow.contentView.addChildView(currentTab.view, 0);
          }
          currentTab.view.setBounds(this.bounds);
          if (typeof currentTab.view.webContents.setSize === 'function') {
            currentTab.view.webContents.setSize({ width: this.bounds.width, height: this.bounds.height });
          }
        } catch (e) {
          console.error('[BrowserViewManager] Error updating view bounds:', e);
        }
      }
    }
  }

  sendInputEvent(tabId, inputEvent) {
    const targetTabId = tabId || this.activeTabId;
    if (!targetTabId || !this.tabs.has(targetTabId)) return;
    const tabState = this.tabs.get(targetTabId);
    if (tabState && tabState.view && tabState.view.webContents && !tabState.view.webContents.isDestroyed()) {
      try {
        tabState.view.webContents.sendInputEvent(inputEvent);
      } catch (e) {
        console.error('[BrowserViewManager] Error sending input event:', e);
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
          this.mainWindow.contentView.addChildView(currentTab.view, 0);
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
    if (tabState) {
      performGoBack(tabState.view?.webContents);
    }
  }

  goForward(tabId) {
    const tabState = this.tabs.get(tabId);
    if (tabState) {
      performGoForward(tabState.view?.webContents);
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

  setFontZoom(font, size) {
    if (font !== undefined && font !== null) this.currentFont = font;
    if (size !== undefined && size !== null) this.currentFontSize = Number(size);

    const zoomFactor = (this.currentFontSize || 100) / 100;
    const fontStacks = {
      'System Default': '',
      'Inter': 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      'Manrope': 'Manrope, Inter, sans-serif',
      'SF Pro Display': '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
      'Georgia': 'Georgia, Cambria, "Times New Roman", serif',
      'Charter': 'Charter, Georgia, serif',
      'JetBrains Mono': '"JetBrains Mono", monospace'
    };

    const targetFontStack = fontStacks[this.currentFont] || (this.currentFont !== 'System Default' ? this.currentFont : '');

    this.tabs.forEach((tabState) => {
      try {
        const wc = tabState.view?.webContents;
        if (wc && !wc.isDestroyed()) {
          wc.setZoomFactor(zoomFactor);
          if (targetFontStack) {
            const css = `* { font-family: ${targetFontStack} !important; }`;
            wc.insertCSS(css).catch(() => {});
          }
        }
      } catch (e) {
        // ignore destroyed webContents
      }
    });
    this.tabs.forEach((tabState) => {
      this.injectCustomScrollbar(tabState.view?.webContents);
    });
  }

  injectCustomScrollbar(wc) {
    if (!wc || wc.isDestroyed()) return;
    const scrollbarCss = `
      html, body, *, ::-webkit-scrollbar {
        scrollbar-width: thin !important;
        scrollbar-color: rgba(148, 163, 184, 0.45) transparent !important;
      }
      ::-webkit-scrollbar {
        width: 7px !important;
        height: 7px !important;
      }
      ::-webkit-scrollbar-track {
        background: transparent !important;
        margin: 4px 2px !important;
      }
      ::-webkit-scrollbar-thumb {
        background-color: rgba(148, 163, 184, 0.45) !important;
        border-radius: 9999px !important;
        border: 1px solid transparent !important;
        background-clip: padding-box !important;
        transition: background-color 0.2s ease !important;
      }
      ::-webkit-scrollbar-thumb:hover {
        background-color: rgba(100, 116, 139, 0.75) !important;
      }
      ::-webkit-scrollbar-thumb:active {
        background-color: rgba(71, 85, 105, 0.9) !important;
      }
      @media (prefers-color-scheme: dark) {
        html, body, *, ::-webkit-scrollbar {
          scrollbar-color: rgba(161, 161, 170, 0.4) transparent !important;
        }
        ::-webkit-scrollbar-thumb {
          background-color: rgba(161, 161, 170, 0.4) !important;
        }
        ::-webkit-scrollbar-thumb:hover {
          background-color: rgba(212, 212, 216, 0.7) !important;
        }
      }
    `;
    // Insert CSS via native Chromium webContents engine
    wc.insertCSS(scrollbarCss, { cssOrigin: 'user' }).catch(() => {});

    // Inject into Document DOM & recursively attach to ShadowRoots (e.g. YouTube ytd-app, Polymer, Custom Web Components)
    const domInjectionScript = `
      (function injectRegaarderScrollbar() {
        const css = \`${scrollbarCss}\`;
        if (!document.getElementById('regaarder-global-scrollbar-style')) {
          const style = document.createElement('style');
          style.id = 'regaarder-global-scrollbar-style';
          style.textContent = css;
          (document.head || document.documentElement).appendChild(style);
        }
        
        function styleShadowRoots(root) {
          const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
          let node;
          while ((node = treeWalker.nextNode())) {
            if (node.shadowRoot && !node.shadowRoot.querySelector('#regaarder-shadow-scrollbar-style')) {
              const shadowStyle = document.createElement('style');
              shadowStyle.id = 'regaarder-shadow-scrollbar-style';
              shadowStyle.textContent = css;
              node.shadowRoot.appendChild(shadowStyle);
              styleShadowRoots(node.shadowRoot);
            }
          }
        }
        try { styleShadowRoots(document.body || document.documentElement); } catch(e) {}
      })();
    `;
    wc.executeJavaScript(domInjectionScript).catch(() => {});
  }

  getOrCreatePopoverWindow(type = 'overflow') {
    if (this.popoverWindow && !this.popoverWindow.isDestroyed()) {
      return this.popoverWindow;
    }

    const { BrowserWindow } = require('electron');
    const path = require('path');

    const popoverWindow = new BrowserWindow({
      width: 340,
      height: 380,
      parent: this.mainWindow,
      frame: false,
      transparent: true,
      backgroundColor: '#00000000',
      hasShadow: false,
      resizable: false,
      show: false,
      skipTaskbar: true,
      alwaysOnTop: false,
      focusable: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false
      }
    });

    popoverWindow.removeMenu();

    // Kill scrollbar stepper arrows using dual injection strategy:
    // 1. insertCSS — Chromium compositor-level override (high priority)
    // 2. executeJavaScript — Injects a <style> tag directly into <head> before first paint
    // Both are needed because neither alone is guaranteed to win against the
    // internal user-agent stylesheet on all Electron/Chromium versions.
    const SCROLLBAR_NUKE_CSS = `
      ::-webkit-scrollbar-button,
      ::-webkit-scrollbar-button:single-button,
      ::-webkit-scrollbar-button:double-button,
      ::-webkit-scrollbar-button:single-button:vertical:decrement,
      ::-webkit-scrollbar-button:single-button:vertical:increment,
      ::-webkit-scrollbar-button:single-button:horizontal:decrement,
      ::-webkit-scrollbar-button:single-button:horizontal:increment,
      ::-webkit-scrollbar-button:start,
      ::-webkit-scrollbar-button:end {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
        max-width: 0 !important;
        max-height: 0 !important;
        opacity: 0 !important;
        background: transparent !important;
        border: none !important;
      }
    `;

    const JS_INJECT = `
      (function() {
        if (document.getElementById('__rc-no-scrollbar-btns__')) return;
        var s = document.createElement('style');
        s.id = '__rc-no-scrollbar-btns__';
        s.textContent = ${JSON.stringify(SCROLLBAR_NUKE_CSS)};
        (document.head || document.documentElement).appendChild(s);
      })();
    `;

    const injectScrollbarKill = () => {
      try {
        popoverWindow.webContents.insertCSS(SCROLLBAR_NUKE_CSS).catch(() => {});
        popoverWindow.webContents.executeJavaScript(JS_INJECT).catch(() => {});
      } catch (e) {}
    };

    popoverWindow.webContents.on('dom-ready', injectScrollbarKill);
    popoverWindow.webContents.on('did-finish-load', injectScrollbarKill);
    popoverWindow.webContents.on('did-navigate-in-page', injectScrollbarKill);

    let baseUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
    try {
      const mainUrl = this.mainWindow?.webContents?.getURL();
      if (mainUrl && (mainUrl.startsWith('http://') || mainUrl.startsWith('https://') || mainUrl.startsWith('file://'))) {
        baseUrl = mainUrl.split('#')[0].split('?')[0];
      }
    } catch (e) {}

    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }

    const initialUrl = `${baseUrl}/#/popover-window?type=${type || 'overflow'}`;
    popoverWindow.loadURL(initialUrl).catch(() => {
      popoverWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
        hash: `/popover-window?type=${type || 'overflow'}`
      });
    });

    this.popoverWindow = popoverWindow;
    this.popoverIsVisible = false;
    this.popoverType = null;
    return popoverWindow;
  }

  syncPopoverPosition() {
    if (!this.popoverIsVisible || !this.popoverWindow || this.popoverWindow.isDestroyed() || !this.mainWindow || this.mainWindow.isDestroyed()) return;

    const mainBounds = this.mainWindow.getBounds();
    const type = this.popoverType;

    if (type === 'sidepanel' || type === 'sidebar') {
      const width = 380;
      const height = Math.max(400, mainBounds.height - 64);
      const screenX = mainBounds.x + mainBounds.width - width - 12;
      const screenY = mainBounds.y + 56;
      try {
        this.popoverWindow.setBounds({ x: screenX, y: screenY, width, height });
      } catch (e) {}
    }
  }

  showPopover(type, bounds, force = false) {
    if (!this.mainWindow || !bounds) return;

    if (type === 'sidepanel' || type === 'sidebar') {
      this.closePopover();
      return;
    }

    if (!force && this.popoverIsVisible && this.popoverType === type) {
      this.closePopover();
      return;
    }

    this.isOpeningPopover = true;
    setTimeout(() => {
      this.isOpeningPopover = false;
    }, 250);

    this.popoverType = type;
    this.popoverIsVisible = true;

    const popoverWin = this.getOrCreatePopoverWindow(type);
    const mainBounds = this.mainWindow.getBounds();

    const isPanel = type === 'sidepanel' || type === 'sidebar';
    const width = isPanel ? 380 : type === 'font' ? 340 : type === 'flows' ? 380 : type === 'overflow' ? 270 : type === 'utilities' ? 285 : type === 'workspaceSwitcher' ? 240 : 360;
    const height = isPanel ? Math.max(400, mainBounds.height - 64) : type === 'font' ? 345 : type === 'flows' ? 390 : type === 'overflow' ? 375 : type === 'utilities' ? 430 : type === 'workspaceSwitcher' ? 335 : 380;

    let relativeX = Math.round(bounds.left || bounds.x || 0);
    if (isPanel) {
      relativeX = Math.max(16, mainBounds.width - width - 12);
    } else if (bounds.right) {
      relativeX = Math.max(16, Math.round(bounds.right - width));
    }
    if (!isPanel && relativeX + width > mainBounds.width - 16) {
      relativeX = Math.max(16, mainBounds.width - width - 16);
    }

    let relativeY = isPanel ? 44 : Math.max(44, Math.round((bounds.bottom || bounds.y || 40) + 4));

    const screenX = mainBounds.x + relativeX;
    const screenY = mainBounds.y + relativeY;

    popoverWin.setBounds({ x: screenX, y: screenY, width, height });

    const sendType = () => {
      try {
        popoverWin.webContents.send('popover:change-type', type);
      } catch (e) {}
    };

    if (popoverWin.webContents.isLoading()) {
      // Window is still loading (first open). Defer both the type message and
      // show() until content is ready — prevents the blank flash and top-left
      // positioning artifact caused by showing before React has painted.
      popoverWin.webContents.once('did-finish-load', () => {
        sendType();
        if (!popoverWin.isDestroyed()) {
          popoverWin.setBounds({ x: screenX, y: screenY, width, height });
          popoverWin.show();
          popoverWin.focus();
        }
      });
    } else {
      sendType();
      if (!popoverWin.isVisible()) {
        popoverWin.show();
      }
      popoverWin.focus();
    }
  }

  closePopover() {
    this.popoverIsVisible = false;
    this.popoverType = null;
    if (this.popoverWindow && !this.popoverWindow.isDestroyed()) {
      try {
        this.popoverWindow.hide();
      } catch (e) {}
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
