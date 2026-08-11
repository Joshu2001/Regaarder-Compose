const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const BrowserViewManager = require('./browserViewManager');

let mainWindow = null;
let browserViewManager = null;

function createWindow() {
  const isDev = process.env.NODE_ENV !== 'production';

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
  });

  const targetUrl = isDev ? (process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173') : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(targetUrl).catch(err => {
    console.error('[Electron Main] Failed to load window URL:', err);
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
