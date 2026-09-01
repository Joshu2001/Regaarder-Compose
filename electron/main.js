const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const BrowserViewManager = require('./browserViewManager');

// Disable hardware acceleration to eliminate exit_code=34 Chromium GPU process crashes on Windows
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-gpu-compositing');

let mainWindow = null;
let browserViewManager = null;

function createWindow() {
  const isDev = process.env.NODE_ENV !== 'production';

  // Intercept headers for embedded browser views and local inference daemons
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = Object.assign({}, details.responseHeaders);

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

    if (
      details.url.includes('127.0.0.1:11434') ||
      details.url.includes('localhost:11434') ||
      details.url.includes(':1234') ||
      details.url.includes(':8080')
    ) {
      responseHeaders['access-control-allow-origin'] = ['*'];
      responseHeaders['access-control-allow-methods'] = ['GET, POST, PUT, DELETE, OPTIONS'];
      responseHeaders['access-control-allow-headers'] = ['*'];
      responseHeaders['access-control-allow-private-network'] = ['true'];
    }

    callback({ cancel: false, responseHeaders });
  });

  // Automatically grant microphone and media permissions for local voice transcription and dictation
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (['media', 'microphone', 'audio-capture'].includes(permission)) {
      return callback(true);
    }
    callback(true);
  });

  session.defaultSession.setPermissionCheckHandler(() => true);

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Regaarder',
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
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

  const targetUrl = isDev ? (process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173') : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(targetUrl).catch(err => {
    console.warn('[Electron Main] Dev server not active, loading dist/index.html...');
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html')).catch(loadErr => {
      console.error('[Electron Main] Failed to load dist/index.html:', loadErr);
    });
  });
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
    } catch (e) {}
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

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
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

      exec(`powershell -NoProfile -NonInteractive -Command "${triggerScript.replace(/\\r?\\n/g, ' ')}"`, (err) => {
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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
