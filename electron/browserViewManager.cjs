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

  async extractPageSchema(tabId) {
    const tabState = this.tabs.get(tabId);
    if (!tabState) return { success: false, error: 'Tab not found' };
    try {
      const script = `
        (() => {
          try {
            const interactiveSelector = 'button, a, input, select, textarea, [role="button"], [role="link"], [role="checkbox"], [role="menuitem"], [role="tab"], [tabindex]:not([tabindex="-1"])';
            const allNodes = Array.from(document.querySelectorAll(interactiveSelector));
            
            let idCounter = 1;
            const elements = [];
            const vw = window.innerWidth || document.documentElement.clientWidth;
            const vh = window.innerHeight || document.documentElement.clientHeight;

            for (const node of allNodes) {
              const rect = node.getBoundingClientRect();
              const style = window.getComputedStyle(node);
              const isVisible = (
                style.display !== 'none' &&
                style.visibility !== 'hidden' &&
                style.opacity !== '0' &&
                rect.width > 0 &&
                rect.height > 0 &&
                rect.top < vh && rect.bottom > 0 &&
                rect.left < vw && rect.right > 0
              );

              let tag = node.tagName.toLowerCase();
              let role = node.getAttribute('role') || tag;
              let type = node.getAttribute('type') || '';
              let prefix = 'elem';
              if (tag === 'button' || role === 'button') prefix = 'btn';
              else if (tag === 'input' || tag === 'textarea') prefix = type === 'checkbox' ? 'chk' : (type === 'radio' ? 'rad' : 'input');
              else if (tag === 'select') prefix = 'sel';
              else if (tag === 'a') prefix = 'link';

              const virtualId = \`\${prefix}_\${idCounter++}\`;
              node.setAttribute('data-regaarder-id', virtualId);

              let label = (
                node.getAttribute('aria-label') ||
                node.getAttribute('placeholder') ||
                node.innerText ||
                node.value ||
                node.getAttribute('title') ||
                node.getAttribute('name') ||
                ''
              ).trim().replace(/\\s+/g, ' ').slice(0, 80);

              let options = undefined;
              if (tag === 'select') {
                options = Array.from(node.querySelectorAll('option')).map(o => o.text.trim()).filter(Boolean).slice(0, 20);
              }

              let parentMenu = undefined;
              const menuContainer = node.closest('g-menu, [role="menu"], g-popup, .dropdown, [aria-haspopup], [role="menubar"], ul, nav');
              if (menuContainer) {
                const prevTrigger = menuContainer.previousElementSibling || menuContainer.parentElement?.querySelector('button, [role="button"], a');
                if (prevTrigger) {
                  parentMenu = (prevTrigger.innerText || prevTrigger.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 30);
                }
              }

              if (isVisible || elements.length < 80) {
                elements.push({
                  id: virtualId,
                  tag,
                  role,
                  type: type || undefined,
                  label: label || '(unlabeled)',
                  parentMenu: parentMenu || undefined,
                  value: (tag === 'input' || tag === 'textarea') ? node.value : undefined,
                  options,
                  isVisible,
                  isEnabled: !node.disabled && !node.getAttribute('aria-disabled'),
                  bounds: {
                    x: Math.round(rect.x),
                    y: Math.round(rect.y),
                    width: Math.round(rect.width),
                    height: Math.round(rect.height)
                  }
                });
              }
            }

            const headingNodes = Array.from(document.querySelectorAll('h1, h2, h3, [role="heading"]'));
            const headings = headingNodes.map(h => ({
              level: parseInt(h.tagName.replace('H', '') || '2', 10) || 2,
              text: (h.innerText || '').trim().replace(/\\s+/g, ' ').slice(0, 120)
            })).filter(h => h.text.length > 0).slice(0, 15);

            const bodyText = (document.body?.innerText || '').replace(/\s+/g, ' ').slice(0, 4000);

            // Extract primary article links on search/feed pages
            const linkNodes = Array.from(document.querySelectorAll('a[href]'));
            const topLinks = [];
            for (const a of linkNodes) {
              const href = a.href;
              const text = (a.innerText || a.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ');
              if (href && href.startsWith('http') && !href.includes('google.com/search') && !href.includes('google.com/url') && text.length > 5 && !topLinks.some(l => l.url === href)) {
                topLinks.push({ title: text.slice(0, 80), url: href });
                if (topLinks.length >= 6) break;
              }
            }

            return {
              success: true,
              schema: {
                metadata: {
                  title: document.title || '',
                  url: window.location.href,
                  domain: window.location.hostname,
                  scrollPosition: {
                    x: Math.round(window.scrollX || window.pageXOffset || 0),
                    y: Math.round(window.scrollY || window.pageYOffset || 0),
                    maxScrollY: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight
                  },
                  selectedText: window.getSelection() ? window.getSelection().toString().trim() : ''
                },
                headings,
                elements: elements.slice(0, 60),
                topLinks,
                visibleTextSummary: bodyText
              }
            };
          } catch (err) {
            return { success: false, error: err.message };
          }
        })()
      `;
      const res = await tabState.view.webContents.executeJavaScript(script);
      return res || { success: false, error: 'Failed to extract schema' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async executeElementAction(tabId, payload) {
    const tabState = this.tabs.get(tabId);
    if (!tabState) return { success: false, error: 'Tab not found' };
    try {
      const { action, elementId, value, options } = payload || {};
      const script = `
        (() => {
          try {
            const action = ${JSON.stringify(action)};
            const elementId = ${JSON.stringify(elementId)};
            const value = ${JSON.stringify(value)};

            if (action === 'scroll') {
              const dir = ${JSON.stringify(options?.direction || 'down')};
              const amount = ${JSON.stringify(options?.amount || 400)};
              if (dir === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
              else if (dir === 'bottom') window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              else if (dir === 'up') window.scrollBy({ top: -amount, behavior: 'smooth' });
              else window.scrollBy({ top: amount, behavior: 'smooth' });
              return { success: true, action: 'scroll', executed: true };
            }

            if (action === 'navigate') {
              if (value) {
                window.location.href = value;
                return { success: true, action: 'navigate', url: value };
              }
              return { success: false, error: 'No URL provided' };
            }

            if (action === 'goBack') {
              window.history.back();
              return { success: true, action: 'goBack' };
            }

            if (!elementId) {
              return { success: false, error: 'No elementId specified' };
            }

            let target = document.querySelector(\`[data-regaarder-id="\${elementId}"]\`);
            if (!target) {
              const allCandidates = Array.from(document.querySelectorAll('button, a, input, textarea, select, [role="button"], [tabindex], div, span, a'));
              const searchKey = String(elementId).toLowerCase();
              target = allCandidates.find((el) => {
                const text = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.id || '').trim().toLowerCase();
                return text && (text.includes(searchKey) || searchKey.includes(text));
              }) || allCandidates[0];
            }

            if (!target) {
              return { success: false, error: \`Element with ID \${elementId} not found on page\` };
            }

            // Check if element is collapsed inside a parent dropdown/menu
            let rect = target.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0 || (rect.left === 0 && rect.top === 0)) {
              const menuContainer = target.closest('g-menu, [role="menu"], g-popup, .dropdown, [aria-haspopup], ul, nav');
              const parentTrigger = menuContainer ? (menuContainer.previousElementSibling || menuContainer.parentElement?.querySelector('button, [role="button"], a') || document.querySelector('button[aria-haspopup="true"], div[role="button"][aria-haspopup="true"]')) : null;
              if (parentTrigger && typeof parentTrigger.click === 'function') {
                try {
                  parentTrigger.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
                  parentTrigger.click();
                } catch (e) {}
              }
              rect = target.getBoundingClientRect();
            }

            // Robust non-zero coordinate fallback
            let anchorEl = target;
            while (anchorEl && (rect.width === 0 || rect.height === 0 || (rect.left === 0 && rect.top === 0)) && anchorEl.parentElement && anchorEl.parentElement !== document.body) {
              anchorEl = anchorEl.parentElement;
              rect = anchorEl.getBoundingClientRect();
            }

            if (rect.width === 0 || rect.height === 0) {
              const defaultBtn = document.querySelector('button, [role="button"], input, a');
              if (defaultBtn) rect = defaultBtn.getBoundingClientRect();
            }

            target.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Inject Live Gliding Visual AI Cursor & Spotlight Aura
            try {
              const scrollX = window.scrollX || window.pageXOffset || 0;
              const scrollY = window.scrollY || window.pageYOffset || 0;

              // 1. Live Gliding AI Cursor
              let cursor = document.getElementById('__regaarder_ai_cursor__');
              if (!cursor) {
                cursor = document.createElement('div');
                cursor.id = '__regaarder_ai_cursor__';
                cursor.style.cssText = \`
                  position: fixed;
                  left: 0;
                  top: 0;
                  width: 26px;
                  height: 26px;
                  pointer-events: none;
                  z-index: 2147483647;
                  transform: translate(50vw, 50vh);
                  transition: transform 0.42s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
                  filter: drop-shadow(0 4px 12px rgba(139, 92, 246, 0.6));
                \`;
                cursor.innerHTML = \`
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <path d="M4 3L18 13L11.5 14L8.5 20.5L4 3Z" fill="#8B5CF6" stroke="#FFFFFF" stroke-width="1.6" stroke-linejoin="round"/>
                    <circle cx="4" cy="3" r="2.5" fill="#FFFFFF"/>
                  </svg>
                \`;
                document.body.appendChild(cursor);
              }

              const targetX = Math.max(12, Math.round(rect.left + Math.max(16, rect.width) / 2));
              const targetY = Math.max(12, Math.round(rect.top + Math.max(16, rect.height) / 2));
              cursor.style.transform = \`translate(\${targetX}px, \${targetY}px) scale(1)\`;
              cursor.style.opacity = '1';

              // 2. Spotlight Beacon & Floating Badge
              const existingBeacon = document.getElementById('__regaarder_spotlight_beacon__');
              if (existingBeacon) existingBeacon.remove();

              const beacon = document.createElement('div');
              beacon.id = '__regaarder_spotlight_beacon__';
              beacon.style.cssText = \`
                position: absolute;
                left: \${rect.left + scrollX - 4}px;
                top: \${rect.top + scrollY - 4}px;
                width: \${Math.max(28, rect.width + 8)}px;
                height: \${Math.max(24, rect.height + 8)}px;
                border-radius: 8px;
                border: 2px solid #8b5cf6;
                box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.4), 0 0 32px rgba(139, 92, 246, 0.7);
                pointer-events: none;
                z-index: 2147483646;
                transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                animation: __regaarder_pulse 1.8s infinite;
              \`;

              const labelText = (target.innerText?.trim()?.slice(0, 36) || target.getAttribute('aria-label') || target.getAttribute('placeholder') || target.tagName).replace(/[<>]/g, '');
              const badge = document.createElement('div');
              badge.style.cssText = \`
                position: absolute;
                top: -30px;
                left: 0;
                background: rgba(15, 16, 26, 0.95);
                backdrop-filter: blur(12px);
                color: #f8fafc;
                border: 1px solid rgba(139, 92, 246, 0.7);
                border-radius: 6px;
                padding: 3px 8px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 11px;
                font-weight: 600;
                white-space: nowrap;
                box-shadow: 0 4px 20px rgba(0,0,0,0.6);
                display: flex;
                align-items: center;
                gap: 5px;
              \`;
              badge.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg><span>' + labelText + '</span>';
              beacon.appendChild(badge);

              if (!document.getElementById('__regaarder_spotlight_styles__')) {
                const styleTag = document.createElement('style');
                styleTag.id = '__regaarder_spotlight_styles__';
                styleTag.innerHTML = \`
                  @keyframes __regaarder_pulse {
                    0% { box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.7), 0 0 16px rgba(139, 92, 246, 0.5); }
                    50% { box-shadow: 0 0 0 9px rgba(139, 92, 246, 0.25), 0 0 40px rgba(139, 92, 246, 0.8); }
                    100% { box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.7), 0 0 16px rgba(139, 92, 246, 0.5); }
                  }
                  @keyframes __regaarder_click_ripple {
                    0% { transform: scale(0.2); opacity: 1; }
                    100% { transform: scale(2.4); opacity: 0; }
                  }
                \`;
                document.head.appendChild(styleTag);
              }

              document.body.appendChild(beacon);

              if (action === 'click') {
                setTimeout(() => {
                  if (cursor) cursor.style.transform = \`translate(\${targetX}px, \${targetY}px) scale(0.85)\`;
                  setTimeout(() => {
                    if (cursor) cursor.style.transform = \`translate(\${targetX}px, \${targetY}px) scale(1)\`;
                  }, 140);
                }, 180);

                const ripple = document.createElement('div');
                ripple.style.cssText = \`
                  position: absolute;
                  left: \${rect.left + scrollX + rect.width / 2 - 20}px;
                  top: \${rect.top + scrollY + rect.height / 2 - 20}px;
                  width: 40px;
                  height: 40px;
                  border-radius: 50%;
                  background: rgba(139, 92, 246, 0.8);
                  box-shadow: 0 0 24px #8b5cf6;
                  pointer-events: none;
                  z-index: 2147483647;
                  animation: __regaarder_click_ripple 0.6s ease-out forwards;
                \`;
                document.body.appendChild(ripple);
                setTimeout(() => ripple.remove(), 700);
              }

              setTimeout(() => {
                if (beacon && beacon.parentNode) beacon.remove();
                if (cursor) cursor.style.opacity = '0';
              }, 6000);
            } catch (e) {}

            if (action === 'click') {
              const evtOpts = { bubbles: true, cancelable: true, view: window };
              target.focus();
              try { target.dispatchEvent(new PointerEvent('pointerover', evtOpts)); } catch (e) {}
              try { target.dispatchEvent(new MouseEvent('mouseover', evtOpts)); } catch (e) {}
              try { target.dispatchEvent(new PointerEvent('pointerdown', evtOpts)); } catch (e) {}
              try { target.dispatchEvent(new MouseEvent('mousedown', evtOpts)); } catch (e) {}
              try { target.dispatchEvent(new PointerEvent('pointerup', evtOpts)); } catch (e) {}
              try { target.dispatchEvent(new MouseEvent('mouseup', evtOpts)); } catch (e) {}
              target.click();
              try {
                target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
                target.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
              } catch (e) {}
              return { success: true, action: 'click', elementId, label: target.innerText || target.getAttribute('aria-label') || target.value };
            }

            if (action === 'type' || action === 'fill') {
              target.focus();
              if (typeof target.value !== 'undefined') {
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                  target instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype,
                  'value'
                )?.set;
                if (nativeInputValueSetter) {
                  nativeInputValueSetter.call(target, value || '');
                } else {
                  target.value = value || '';
                }
                target.dispatchEvent(new Event('input', { bubbles: true }));
                target.dispatchEvent(new Event('change', { bubbles: true }));
              } else if (target.isContentEditable) {
                target.innerText = value || '';
                target.dispatchEvent(new Event('input', { bubbles: true }));
              }
              return { success: true, action: 'fill', elementId, value };
            }

            if (action === 'select') {
              if (target.tagName.toLowerCase() === 'select') {
                const opts = Array.from(target.options);
                const matched = opts.find(o => o.value === value || o.text.trim().toLowerCase() === String(value).trim().toLowerCase());
                if (matched) {
                  target.value = matched.value;
                  target.dispatchEvent(new Event('change', { bubbles: true }));
                  return { success: true, action: 'select', elementId, selected: matched.text };
                }
              }
              return { success: false, error: 'Select element option not matched' };
            }

            if (action === 'checkbox' || action === 'toggle') {
              if (target.type === 'checkbox' || target.getAttribute('role') === 'checkbox') {
                target.checked = typeof value === 'boolean' ? value : !target.checked;
                target.dispatchEvent(new Event('change', { bubbles: true }));
                return { success: true, action: 'toggle', elementId, checked: target.checked };
              }
              target.click();
              return { success: true, action: 'toggle', elementId };
            }

            if (action === 'focus' || action === 'highlight') {
              target.focus();
              return { success: true, action: action, elementId };
            }

            return { success: false, error: \`Unknown action: \${action}\` };
          } catch (err) {
            return { success: false, error: err.message };
          }
        })()
      `;
      const res = await tabState.view.webContents.executeJavaScript(script);
      return res || { success: false, error: 'Execution failed' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async captureTabScreenshot(tabId) {
    const tabState = this.tabs.get(tabId);
    if (!tabState) return { success: false, error: 'Tab not found' };
    try {
      const image = await tabState.view.webContents.capturePage();
      const dataUrl = image.toDataURL();
      return { success: true, dataUrl };
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
        preload: path.join(__dirname, 'preload.cjs'),
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
