const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  
  // Tab Management
  createTab: (tabId, initialUrl) => ipcRenderer.invoke('browser:create-tab', { tabId, initialUrl }),
  closeTab: (tabId) => ipcRenderer.invoke('browser:close-tab', { tabId }),
  selectTab: (tabId) => ipcRenderer.invoke('browser:select-tab', { tabId }),
  
  // Navigation
  navigate: (tabId, url) => ipcRenderer.invoke('browser:navigate', { tabId, url }),
  goBack: (tabId) => ipcRenderer.invoke('browser:go-back', { tabId }),
  goForward: (tabId) => ipcRenderer.invoke('browser:go-forward', { tabId }),
  reload: (tabId) => ipcRenderer.invoke('browser:reload', { tabId }),
  stop: (tabId) => ipcRenderer.invoke('browser:stop', { tabId }),
  
  // Layout & Bounds
  updateViewportBounds: (bounds) => ipcRenderer.invoke('browser:update-bounds', bounds),
  setBrowserVisibility: (visible) => ipcRenderer.invoke('browser:set-visibility', { visible }),
  
  // Event Listeners
  onTabUpdated: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('browser:tab-updated', handler);
    return () => ipcRenderer.removeListener('browser:tab-updated', handler);
  },
  
  // Safe AI extraction bridge pipeline
  extractPageText: (tabId) => ipcRenderer.invoke('browser:extract-page-text', { tabId })
});
