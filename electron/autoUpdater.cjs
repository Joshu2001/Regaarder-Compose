/**
 * Regaarder Compose - Native Auto-Updater Module
 * 
 * Powered by electron-updater with GitHub Releases distribution.
 * Bridges background binary update checks, download progress streams,
 * and seamless hot-restart / quit-and-install orchestration.
 */

const { ipcMain, app } = require('electron');

let autoUpdater = null;
try {
  const electronUpdater = require('electron-updater');
  autoUpdater = electronUpdater.autoUpdater;
} catch (err) {
  console.warn('[AutoUpdater] electron-updater module not loaded yet:', err.message);
}

let updaterConfigured = false;

function initAutoUpdater(mainWindow) {
  if (!autoUpdater) {
    console.warn('[AutoUpdater] Skipping autoUpdater init - module unavailable');
    registerFallbackIpc();
    return;
  }

  if (updaterConfigured) return;
  updaterConfigured = true;

  // Logging configuration
  autoUpdater.logger = console;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  // In development, electron-updater by default skips checks unless explicitly allowed
  if (!app.isPackaged && process.env.ELECTRON_FORCE_UPDATE_CHECK !== 'true') {
    console.log('[AutoUpdater] Running in unpacked development mode. Update checks idle by default.');
  }

  // Forward update lifecycle events to renderer
  const sendStatus = (status, payload = {}) => {
    console.log(`[AutoUpdater] Event: ${status}`, payload);
    if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
      mainWindow.webContents.send('updater:status', { status, ...payload });
    }
  };

  autoUpdater.on('checking-for-update', () => {
    sendStatus('checking');
  });

  autoUpdater.on('update-available', (info) => {
    sendStatus('available', {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes || ''
    });
  });

  autoUpdater.on('update-not-available', (info) => {
    sendStatus('not-available', {
      version: info ? info.version : app.getVersion()
    });
  });

  autoUpdater.on('error', (err) => {
    sendStatus('error', {
      error: err ? (err.message || String(err)) : 'Unknown updater error'
    });
  });

  autoUpdater.on('download-progress', (progressObj) => {
    sendStatus('progress', {
      percent: Math.round(progressObj.percent || 0),
      bytesPerSecond: progressObj.bytesPerSecond || 0,
      transferred: progressObj.transferred || 0,
      total: progressObj.total || 0
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    sendStatus('downloaded', {
      version: info.version,
      releaseNotes: info.releaseNotes || ''
    });
  });

  // Wire IPC handlers
  ipcMain.handle('updater:check-for-updates', async () => {
    if (!app.isPackaged && process.env.ELECTRON_FORCE_UPDATE_CHECK !== 'true') {
      return {
        success: true,
        status: 'dev-mode',
        currentVersion: app.getVersion(),
        message: 'Running in development mode. Auto-updates active in packaged release.'
      };
    }
    try {
      const result = await autoUpdater.checkForUpdates();
      return {
        success: true,
        status: 'checked',
        updateInfo: result ? result.updateInfo : null
      };
    } catch (err) {
      console.error('[AutoUpdater] check error:', err);
      return {
        success: false,
        error: err.message
      };
    }
  });

  ipcMain.handle('updater:download-update', async () => {
    try {
      if (autoUpdater) {
        await autoUpdater.downloadUpdate();
        return { success: true };
      }
      return { success: false, error: 'Updater not initialized' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('updater:quit-and-install', () => {
    if (autoUpdater) {
      // isSilent: false, isForceRunAfter: true
      setImmediate(() => {
        autoUpdater.quitAndInstall(false, true);
      });
      return { success: true };
    }
    return { success: false, error: 'Updater not initialized' };
  });

  ipcMain.handle('updater:get-app-version', () => {
    return app.getVersion();
  });

  ipcMain.handle('updater:get-channel', () => {
    return autoUpdater ? (autoUpdater.channel || 'latest') : 'latest';
  });

  ipcMain.handle('updater:set-channel', (event, channel) => {
    if (autoUpdater && channel) {
      autoUpdater.channel = channel;
      return { success: true, channel };
    }
    return { success: false, error: 'Invalid channel or updater unavailable' };
  });

  // Perform initial check in packaged builds after a 5 second warm-up delay
  if (app.isPackaged) {
    setTimeout(() => {
      try {
        autoUpdater.checkForUpdatesAndNotify();
      } catch (e) {
        console.warn('[AutoUpdater] Initial check error:', e.message);
      }
    }, 5000);
  }
}

function registerFallbackIpc() {
  ipcMain.handle('updater:check-for-updates', async () => ({
    success: true,
    status: 'standalone',
    currentVersion: app.getVersion(),
    message: 'Updater in standalone mode'
  }));
  ipcMain.handle('updater:download-update', async () => ({ success: false, error: 'Standalone mode' }));
  ipcMain.handle('updater:quit-and-install', () => ({ success: false, error: 'Standalone mode' }));
  ipcMain.handle('updater:get-app-version', () => app.getVersion());
  ipcMain.handle('updater:get-channel', () => 'latest');
  ipcMain.handle('updater:set-channel', (event, channel) => ({ success: true, channel }));
}

module.exports = {
  initAutoUpdater
};
