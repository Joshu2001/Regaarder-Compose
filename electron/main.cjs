const { app, BrowserWindow, ipcMain, session, desktopCapturer, safeStorage } = require('electron');
const path = require('path');
const fs = require('fs');
const BrowserViewManager = require('./browserViewManager.cjs');

// Disable hardware acceleration to eliminate exit_code=34 Chromium GPU process crashes on Windows
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-gpu-compositing');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');

let mainWindow = null;
let browserViewManager = null;
let activeAppUrl = null;

function createWindow() {
  const isDev = process.env.NODE_ENV !== 'production';

  // Intercept headers for embedded browser views to resolve ERR_BLOCKED_BY_RESPONSE on external sites like Google, YouTube, GitHub
  // High Severity fix: NEVER strip CSP or framing headers from the main application origin (localhost or local file)!
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = Object.assign({}, details.responseHeaders);

    const isAppOrigin = details.url.startsWith('http://localhost') || details.url.startsWith('file://');
    const isEmbeddedSubframe = details.resourceType === 'subFrame';

    // Only strip frame restrictions for external third-party sites embedded in subframes or browser views
    if (!isAppOrigin || isEmbeddedSubframe) {
      Object.keys(responseHeaders).forEach((header) => {
        const lower = header.toLowerCase();
        if (
          lower === 'x-frame-options' ||
          lower === 'content-security-policy' ||
          lower === 'content-security-policy-report-only'
        ) {
          delete responseHeaders[header];
        }
      });
    }

    callback({ cancel: false, responseHeaders });
  });

  // Automatically grant microphone, display-capture, and media permissions
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (['media', 'microphone', 'audio-capture', 'display-capture', 'screen'].includes(permission)) {
      return callback(true);
    }
    callback(true);
  });

  session.defaultSession.setPermissionCheckHandler(() => true);

  let currentSelectedDesktopSource = null;
  ipcMain.handle('desktop:set-active-source', (event, source) => {
    currentSelectedDesktopSource = source;
    return { success: true };
  });

  ipcMain.handle('desktop:focus-window', async (event, { sourceId, name }) => {
    try {
      if (process.platform === 'win32') {
        const { exec } = require('child_process');
        const handleMatch = sourceId ? sourceId.match(/window:(\d+):/) : null;
        const hwnd = handleMatch ? parseInt(handleMatch[1], 10) : null;
        const targetName = (name || '').replace(/'/g, "''");

        let psScript = `
$code = @'
using System;
using System.Runtime.InteropServices;
public class WinFocus {
  [StructLayout(LayoutKind.Sequential)]
  public struct RECT {
    public int Left;
    public int Top;
    public int Right;
    public int Bottom;
  }
  [DllImport("user32.dll")] public static extern bool ShowWindowAsync(IntPtr hWnd, int nCmdShow);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool BringWindowToTop(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern void SwitchToThisWindow(IntPtr hWnd, bool fAltTab);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
}
'@
Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue
`;

        if (hwnd && hwnd > 0) {
          const isConsoleWin = (name || '').toLowerCase().includes('mingw') || (name || '').toLowerCase().includes('cmd') || (name || '').toLowerCase().includes('bash');
          const showCmd = isConsoleWin ? 3 : 9; // SW_MAXIMIZE (3) for terminal, SW_RESTORE (9) for GUI apps
          psScript += `
$h = [IntPtr]${hwnd}
[WinFocus]::ShowWindowAsync($h, ${showCmd})
[WinFocus]::BringWindowToTop($h)
[WinFocus]::SetForegroundWindow($h)
[WinFocus]::SwitchToThisWindow($h, $true)
$r = New-Object WinFocus+RECT
if ([WinFocus]::GetWindowRect($h, [ref]$r)) {
  Write-Output "$($r.Left),$($r.Top),$($r.Right - $r.Left),$($r.Bottom - $r.Top)"
}
`;
        } else if (targetName) {
          psScript += `
$ws = New-Object -ComObject WScript.Shell
$ws.AppActivate('${targetName}')
`;
        }

        const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
        return new Promise((resolve) => {
          exec(`powershell -NoProfile -EncodedCommand ${encoded}`, (err, stdout) => {
            if (err) {
              console.warn('[Electron Main] Focus window error:', err);
              return resolve({ success: true });
            }
            const out = (stdout || '').trim();
            if (out && out.includes(',')) {
              const parts = out.split(',').map(n => parseInt(n.trim(), 10));
              if (parts.length === 4 && !parts.some(isNaN)) {
                return resolve({
                  success: true,
                  bounds: { x: parts[0], y: parts[1], width: parts[2], height: parts[3] }
                });
              }
            }
            resolve({ success: true });
          });
        });
      }

      const isConsole = (name || '').toLowerCase().includes('mingw') || (name || '').toLowerCase().includes('cmd') || (name || '').toLowerCase().includes('bash');
      if (isConsole && mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.minimize();
      }
      return { success: true };
    } catch (e) {
      console.error('[Electron Main] focus error:', e);
      return { success: false };
    }
  });

  // Handle WebRTC getDisplayMedia screen and window sharing in Electron
  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    desktopCapturer.getSources({ types: ['screen', 'window'] }).then((sources) => {
      if (currentSelectedDesktopSource) {
        const targetId = typeof currentSelectedDesktopSource === 'string' ? currentSelectedDesktopSource : currentSelectedDesktopSource.id;
        const matched = sources.find(s => s.id === targetId);
        if (matched) {
          callback({ video: matched });
          return;
        }
      }
      if (sources && sources.length > 0) {
        callback({ video: sources[0] });
      } else {
        callback({});
      }
    }).catch((err) => {
      console.error('[Electron Main] getDisplayMedia error:', err);
      callback({});
    });
  });

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Regaarder',
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  });

  browserViewManager = new BrowserViewManager(mainWindow);

  // Layout resize listener to sync browser view bounds when window resizes
  mainWindow.on('resize', () => {
    mainWindow.webContents.send('browser:window-resized');
    if (browserViewManager) {
      browserViewManager.syncPopoverPosition();
    }
  });

  mainWindow.on('move', () => {
    if (browserViewManager) {
      browserViewManager.syncPopoverPosition();
    }
  });

  mainWindow.webContents.on('before-input-event', (event, input) => {
    // Enable Ctrl+R / Cmd+R / F5 for instant reload in dev
    if ((input.control || input.meta) && input.key.toLowerCase() === 'r' && !input.alt) {
      mainWindow.webContents.reload();
      event.preventDefault();
    }
    if (input.key === 'F5') {
      mainWindow.webContents.reload();
      event.preventDefault();
    }
    // Enable Ctrl+Shift+I / F12 for DevTools
    if (((input.control || input.meta) && input.shift && input.key.toLowerCase() === 'i') || input.key === 'F12') {
      mainWindow.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  const portsToTry = [
    process.env.VITE_DEV_SERVER_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175'
  ].filter(Boolean);

  const loadApp = (portIndex = 0, attemptsLeft = 25) => {
    const currentUrl = portsToTry[portIndex % portsToTry.length];
    mainWindow.loadURL(currentUrl).then(() => {
      activeAppUrl = currentUrl;
      console.log(`[Electron Main] Connected to dev server: ${currentUrl}`);
    }).catch(err => {
      if (attemptsLeft > 0) {
        setTimeout(() => loadApp(portIndex + 1, attemptsLeft - 1), 500);
      } else {
        console.warn('[Electron Main] Dev server not active. Loading production dist/index.html...');
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html')).then(() => {
          activeAppUrl = `file://${path.join(__dirname, '../dist/index.html')}`;
          const pollInterval = setInterval(async () => {
            try {
              const res = await fetch('http://localhost:5173');
              if (res.ok) {
                clearInterval(pollInterval);
                console.log('[Electron Main] Dev server detected. Upgrading to http://localhost:5173...');
                mainWindow.loadURL('http://localhost:5173');
              }
            } catch (_) {}
          }, 2000);
        }).catch(loadErr => {
          console.error('[Electron Main] Failed to load dist/index.html:', loadErr);
        });
      }
    });
  };

  loadApp();
}

// Setup IPC handlers
ipcMain.handle('browser:create-tab', async (event, { tabId, initialUrl }) => {
  if (browserViewManager) {
    browserViewManager.createTab(tabId, initialUrl);
  }
});

ipcMain.handle('browser:close-tab', async (event, { tabId }) => {
  if (browserViewManager) {
    browserViewManager.closeTab(tabId);
  }
});

ipcMain.handle('browser:select-tab', async (event, { tabId }) => {
  if (browserViewManager) {
    browserViewManager.selectTab(tabId);
  }
});

ipcMain.handle('browser:navigate', async (event, { tabId, url }) => {
  if (browserViewManager) {
    browserViewManager.navigate(tabId, url);
  }
});

ipcMain.handle('browser:go-back', async (event, { tabId }) => {
  if (browserViewManager) {
    browserViewManager.goBack(tabId);
  }
});

ipcMain.handle('browser:go-forward', async (event, { tabId }) => {
  if (browserViewManager) {
    browserViewManager.goForward(tabId);
  }
});

ipcMain.handle('browser:reload', async (event, { tabId }) => {
  if (browserViewManager) {
    browserViewManager.reload(tabId);
  }
});

ipcMain.handle('browser:stop', async (event, { tabId }) => {
  if (browserViewManager) {
    browserViewManager.stop(tabId);
  }
});

ipcMain.handle('browser:update-bounds', async (event, bounds) => {
  if (browserViewManager) {
    browserViewManager.updateBounds(bounds);
  }
});

ipcMain.handle('browser:set-visibility', async (event, { visible }) => {
  if (browserViewManager) {
    browserViewManager.setVisibility(visible);
  }
});

ipcMain.handle('browser:extract-page-text', async (event, { tabId }) => {
  if (browserViewManager) {
    return await browserViewManager.extractPageText(tabId);
  }
  return { success: false, error: 'Browser manager not initialized' };
});

ipcMain.handle('browser:extract-page-schema', async (event, { tabId }) => {
  if (browserViewManager) {
    return await browserViewManager.extractPageSchema(tabId);
  }
  return { success: false, error: 'Browser manager not initialized' };
});

ipcMain.handle('browser:execute-element-action', async (event, params) => {
  if (browserViewManager) {
    const { tabId, ...payload } = params || {};
    return await browserViewManager.executeElementAction(tabId, payload);
  }
  return { success: false, error: 'Browser manager not initialized' };
});

ipcMain.handle('browser:capture-screenshot', async (event, { tabId }) => {
  if (browserViewManager) {
    return await browserViewManager.captureTabScreenshot(tabId);
  }
  return { success: false, error: 'Browser manager not initialized' };
});

ipcMain.handle('browser:fetch-url-content', async (event, { url }) => {
  try {
    const { net } = require('electron');
    const res = await net.fetch(url);
    const html = await res.text();
    const cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 5000);
    return { success: true, text: cleanText, url };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('browser:set-live-broadcast-effect', async (event, params) => {
  if (browserViewManager) {
    const { tabId, ...rest } = params || {};
    const targetId = tabId || browserViewManager.activeTabId;
    return await browserViewManager.setLiveBroadcastEffect(targetId, rest);
  }
  return { success: false, error: 'Browser manager not initialized' };
});

ipcMain.handle('browser:set-font-zoom', async (event, { font, size }) => {
  if (browserViewManager) {
    browserViewManager.setFontZoom(font, size);
  }
});

ipcMain.handle('browser:open-popover', async (event, { type, bounds, force }) => {
  if (browserViewManager) {
    browserViewManager.showPopover(type, bounds, force);
  }
});

ipcMain.handle('browser:close-popover', async () => {
  if (browserViewManager) {
    browserViewManager.closePopover();
  }
});

ipcMain.handle('popover:send-action', async (event, { action, payload }) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('popover:action', { action, payload });
  }
});

ipcMain.handle('browser:send-input-event', async (event, { tabId, inputEvent }) => {
  if (browserViewManager) {
    browserViewManager.sendInputEvent(tabId, inputEvent);
  }
});

// Native Local AI & Ollama Bridge (Bypasses browser CORS on Windows/macOS)
ipcMain.handle('localAI:list-models', async (event, { endpoints } = {}) => {
  const targetEndpoints = endpoints && endpoints.length > 0 ? endpoints : [
    'http://127.0.0.1:11434/api/tags',
    'http://localhost:11434/api/tags',
    'http://127.0.0.1:8080/v1/models',
    'http://localhost:8080/v1/models',
    'http://127.0.0.1:1234/v1/models'
  ];

  let discoveredModels = [];
  let activeEndpoint = null;
  let provider = null;

  for (const ep of targetEndpoints) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(ep, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        if (data.models && Array.isArray(data.models)) {
          // Ollama format
          activeEndpoint = ep.replace(/\/api\/tags$/, '');
          provider = 'Ollama';
          discoveredModels = data.models.map(m => ({
            id: m.name,
            name: m.name,
            provider: 'Ollama',
            endpoint: activeEndpoint,
            tag: 'Local Ollama',
            isLocal: true,
            sizeGB: m.size ? (m.size / (1024 * 1024 * 1024)).toFixed(1) : null,
            description: `Ollama model (${m.size ? (m.size / (1024 * 1024 * 1024)).toFixed(1) + ' GB' : 'active'})`
          }));
          break;
        } else if (data.data && Array.isArray(data.data)) {
          // llama.cpp / OpenAI format
          activeEndpoint = ep.replace(/\/models$/, '');
          provider = 'llama.cpp';
          discoveredModels = data.data.map(m => ({
            id: m.id,
            name: m.id.replace(/\.gguf$/i, '').replace(/^models\//, ''),
            provider: 'llama.cpp',
            endpoint: activeEndpoint,
            tag: 'Local GGUF',
            isLocal: true,
            description: `Served on ${activeEndpoint}`
          }));
          break;
        }
      }
    } catch (e) {
      // Continue searching next endpoint
    }
  }

  return {
    success: discoveredModels.length > 0,
    models: discoveredModels,
    activeEndpoint,
    provider
  };
});

ipcMain.handle('localAI:pull-model', async (event, { modelName, endpoint = 'http://127.0.0.1:11434' }) => {
  try {
    const cleanUrl = `${endpoint.replace(/\/+$/, '')}/api/pull`;
    const res = await fetch(cleanUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelName, stream: false })
    });
    if (res.ok) {
      return { success: true, message: `Successfully pulled ${modelName}` };
    }
    const errText = await res.text();
    return { success: false, error: errText };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('localAI:generate', async (event, params) => {
  const { endpoint = 'http://127.0.0.1:11434', model = 'gemma3:1b', prompt = '', systemPrompt = '', format, options } = params || {};
  const targetEndpoints = [
    endpoint,
    endpoint && endpoint.includes('127.0.0.1') ? endpoint.replace('127.0.0.1', 'localhost') : (endpoint ? endpoint.replace('localhost', '127.0.0.1') : null),
    'http://127.0.0.1:11434',
    'http://localhost:11434'
  ].filter(Boolean);

  let lastError = 'Local inference server not reachable';

  for (const ep of targetEndpoints) {
    try {
      const cleanEp = ep.replace(/\/+$/, '');
      const isOllama = cleanEp.includes('11434') || !cleanEp.includes('/v1');
      const targetUrl = isOllama ? `${cleanEp}/api/generate` : `${cleanEp.endsWith('/v1') ? cleanEp : cleanEp + '/v1'}/chat/completions`;

      const requestBody = isOllama
        ? {
            model: model || 'gemma3:1b',
            prompt: systemPrompt ? `${systemPrompt}\r\n\r\n${prompt}` : prompt,
            format: format ? 'json' : undefined,
            stream: false,
            ...(options ? { options } : {})
          }
        : {
            model: model || 'local-model',
            messages: [
              ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
              { role: 'user', content: prompt }
            ],
            stream: false,
            response_format: format ? { type: 'json_object' } : undefined
          };

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 180000);

      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const text = isOllama ? (data.response || data.message?.content || '') : (data.choices?.[0]?.message?.content || '');
        return { success: true, text, raw: data };
      } else {
        lastError = `HTTP ${res.status}`;
      }
    } catch (e) {
      lastError = e.message;
    }
  }

  return { success: false, error: lastError };
});

process.on('uncaughtException', (err) => {
  console.error('[Electron Main] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Electron Main] Unhandled Rejection at:', promise, 'reason:', reason);
});

// App window frame capture for Video Agent real screen recording pipeline.
// Uses capturePage() — CPU-based, safe with hardware acceleration disabled.
ipcMain.handle('app:capture-frame', async () => {
  if (!mainWindow || mainWindow.isDestroyed()) return null;
  try {
    const image = await mainWindow.webContents.capturePage();
    const resized = image.resize({ width: 960, height: 600 });
    return resized.toJPEG(72);
  } catch (e) {
    console.warn('[app:capture-frame] capturePage failed:', e.message);
    return null;
  }
});

// Native OS Dictation Bridge (Windows Win+H / macOS Dictation)
ipcMain.handle('native:start-dictation', async () => {
  try {
    if (process.platform === 'win32') {
      const { exec } = require('child_process');
      const triggerScript = `
        Add-Type -TypeDefinition @"
        using System;
        using System.Runtime.InteropServices;
        public class WinDictate {
          [DllImport("user32.dll")]
          public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, int dwExtraInfo);
          public const int VK_LWIN = 0x5B;
          public const int VK_H = 0x48;
          public const int KEYEVENTF_KEYUP = 0x0002;
          public static void Launch() {
            keybd_event(VK_LWIN, 0, 0, 0);
            keybd_event(VK_H, 0, 0, 0);
            keybd_event(VK_H, 0, KEYEVENTF_KEYUP, 0);
            keybd_event(VK_LWIN, 0, KEYEVENTF_KEYUP, 0);
          }
        }
"@
        [WinDictate]::Launch()
      `;

      exec(`powershell -NoProfile -NonInteractive -Command "${triggerScript.replace(/\\r?\\r\n/g, ' ')}"`, (err) => {
        if (err) console.warn('[Native Dictation] Windows trigger warning:', err);
      });
      return { success: true, platform: 'win32' };
    } else if (process.platform === 'darwin') {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.startDictation();
        return { success: true, platform: 'darwin' };
      }
    }
    return { success: false, reason: 'unsupported-platform' };
  } catch (err) {
    console.warn('[Native Dictation] Error:', err);
    return { success: false, error: err.message };
  }
});

// Screen and Window Desktop Sources for Room Screen Sharing
ipcMain.handle('desktop:get-sources', async (event, types = ['screen', 'window']) => {
  try {
    const sources = await desktopCapturer.getSources({ types, thumbnailSize: { width: 320, height: 180 } });
    return sources.map(s => ({ id: s.id, name: s.name, thumbnail: s.thumbnail.toDataURL() }));
  } catch (e) {
    console.error('[Electron Main] getDesktopSources error:', e);
    return [];
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PiP Frame Relay: main renderer → main process → floating pip window
// This sidesteps GPU/D3D11 entirely. The main window draws its screenShareStream
// to an offscreen canvas and sends JPEG data URLs here via ipcRenderer.send().
// We forward them to pipFloatingWindow.webContents.send() for canvas rendering.
// ─────────────────────────────────────────────────────────────────────────────
let pipFloatingWindow = null;

ipcMain.on('pip:push-frame', (event, jpegDataUrl) => {
  if (pipFloatingWindow && !pipFloatingWindow.isDestroyed()) {
    pipFloatingWindow.webContents.send('pip:frame', jpegDataUrl);
  }
});

ipcMain.on('pip:move-window', (event, delta) => {
  if (pipFloatingWindow && !pipFloatingWindow.isDestroyed() && delta) {
    const { deltaX = 0, deltaY = 0 } = delta;
    const [currentX, currentY] = pipFloatingWindow.getPosition();
    pipFloatingWindow.setPosition(currentX + deltaX, currentY + deltaY);
  }
});

ipcMain.handle('pip:open-floating-widget', async (event, params) => {
  try {
    if (pipFloatingWindow && !pipFloatingWindow.isDestroyed()) {
      pipFloatingWindow.show();
      pipFloatingWindow.focus();
      return { success: true };
    }

    const { screen } = require('electron');
    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
    const winWidth = 320;
    const winHeight = 180;

    pipFloatingWindow = new BrowserWindow({
      width: winWidth,
      height: winHeight,
      x: screenWidth - winWidth - 24,
      y: screenHeight - winHeight - 24,
      frame: false,
      transparent: true,
      backgroundColor: '#00000000',
      alwaysOnTop: true,
      resizable: false,
      skipTaskbar: true,
      hasShadow: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.cjs'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      }
    });

    pipFloatingWindow.setAlwaysOnTop(true, 'screen-saver');
    pipFloatingWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

    const winTitle = params?.windowTitle || 'External Window';
    const sourceId = params?.sourceId || '';
    const baseUrl = activeAppUrl || (process.env.NODE_ENV !== 'production' ? 'http://localhost:5173' : `file://${path.join(__dirname, '../dist/index.html')}`);

    if (baseUrl.startsWith('file://')) {
      const distPath = path.join(__dirname, '../dist/index.html');
      await pipFloatingWindow.loadFile(distPath, {
        hash: '/floating-pip-widget',
        query: { title: winTitle, sourceId: sourceId }
      }).catch(err => {
        console.warn('[Floating PIP] loadFile error:', err.message);
      });
    } else {
      const pipUrl = `${baseUrl}?title=${encodeURIComponent(winTitle)}&sourceId=${encodeURIComponent(sourceId)}#/floating-pip-widget`;
      await pipFloatingWindow.loadURL(pipUrl).catch(err => {
        console.warn('[Floating PIP] loadURL error:', err.message);
      });
    }

    pipFloatingWindow.on('closed', () => {
      pipFloatingWindow = null;
    });

    return { success: true };
  } catch (err) {
    console.error('[Floating PIP] Error:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('pip:close-floating-widget', async () => {
  if (pipFloatingWindow && !pipFloatingWindow.isDestroyed()) {
    pipFloatingWindow.close();
    pipFloatingWindow = null;
  }
  return { success: true };
});

// Window minimize / restore for pip widget "Open Room" button

ipcMain.handle('window:set-fullscreen', async (event, flag) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setFullScreen(Boolean(flag));
  }
  return { success: true };
});

ipcMain.handle('window:is-fullscreen', async () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    return mainWindow.isFullScreen();
  }
  return false;
});

ipcMain.handle('window:minimize', async () => {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.minimize();
  return { success: true };
});

ipcMain.handle('window:restore', async () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }
  return { success: true };
});

ipcMain.handle('window:set-content-protection', async (event, enable) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setContentProtection(false);
  }
  return { success: true };
});

ipcMain.handle('pip:return-to-room', async () => {
  if (pipFloatingWindow && !pipFloatingWindow.isDestroyed()) {
    pipFloatingWindow.close();
    pipFloatingWindow = null;
  }
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send('pip:navigate-to-room');
  }
  return { success: true };
});

// ─────────────────────────────────────────────────────────────────────────────
// OS-Backed Secure Credential Storage via Electron safeStorage (DPAPI/Keychain)
// ─────────────────────────────────────────────────────────────────────────────
function getSecureStorePath() {
  return path.join(app.getPath('userData'), 'regaarder_secure_vault.json');
}

function readSecureStore() {
  try {
    const vaultPath = getSecureStorePath();
    if (fs.existsSync(vaultPath)) {
      return JSON.parse(fs.readFileSync(vaultPath, 'utf8'));
    }
  } catch (err) {
    console.warn('[SafeStorage] Error reading secure vault:', err.message);
  }
  return {};
}

function writeSecureStore(store) {
  try {
    const vaultPath = getSecureStorePath();
    fs.writeFileSync(vaultPath, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.error('[SafeStorage] Error persisting secure vault:', err.message);
  }
}

ipcMain.handle('secure:is-available', async () => {
  try {
    return safeStorage.isEncryptionAvailable();
  } catch (_e) {
    return false;
  }
});

ipcMain.handle('secure:store-secret', async (event, { key, value }) => {
  if (!safeStorage.isEncryptionAvailable()) {
    return { success: false, error: 'OS hardware encryption unavailable on this system' };
  }
  try {
    const store = readSecureStore();
    if (value === null || value === undefined || value === '') {
      delete store[key];
    } else {
      const encryptedBuffer = safeStorage.encryptString(String(value));
      store[key] = encryptedBuffer.toString('base64');
    }
    writeSecureStore(store);
    return { success: true };
  } catch (err) {
    console.error('[SafeStorage] store-secret error:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('secure:get-secret', async (event, { key }) => {
  if (!safeStorage.isEncryptionAvailable()) {
    return { success: false, value: null, error: 'OS hardware encryption unavailable on this system' };
  }
  try {
    const store = readSecureStore();
    const b64 = store[key];
    if (!b64) return { success: true, value: null };
    const buffer = Buffer.from(b64, 'base64');
    const decrypted = safeStorage.decryptString(buffer);
    return { success: true, value: decrypted };
  } catch (err) {
    console.error('[SafeStorage] get-secret error:', err);
    return { success: false, value: null, error: err.message };
  }
});

ipcMain.handle('secure:delete-secret', async (event, { key }) => {
  try {
    const store = readSecureStore();
    delete store[key];
    writeSecureStore(store);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
