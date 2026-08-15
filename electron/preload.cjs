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
  extractPageText: (tabId) => ipcRenderer.invoke('browser:extract-page-text', { tabId }),

  // Browser Font & Zoom Customization
  setFontZoom: (params) => ipcRenderer.invoke('browser:set-font-zoom', params),

  // Popover Overlay Window
  openPopover: (params) => ipcRenderer.invoke('browser:open-popover', params),
  closePopover: () => ipcRenderer.invoke('browser:close-popover'),
  sendPopoverAction: (action, payload) => ipcRenderer.invoke('popover:send-action', { action, payload }),
  onPopoverChangeType: (callback) => {
    const handler = (event, type) => callback(type);
    ipcRenderer.on('popover:change-type', handler);
    return () => ipcRenderer.removeListener('popover:change-type', handler);
  },
  onPopoverAction: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('popover:action', handler);
    return () => ipcRenderer.removeListener('popover:action', handler);
  },

  // Offscreen Rendering (OSR) Canvas Pipeline
  sendInputEvent: (params) => ipcRenderer.invoke('browser:send-input-event', params),
  onFramePaint: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('browser:frame-paint', handler);
    return () => ipcRenderer.removeListener('browser:frame-paint', handler);
  },
  onEscPressed: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('browser:esc-pressed', handler);
    return () => ipcRenderer.removeListener('browser:esc-pressed', handler);
  },

  // Native Local AI & Ollama Bridge
  listLocalModels: (params) => ipcRenderer.invoke('localAI:list-models', params),
  pullLocalModel: (params) => ipcRenderer.invoke('localAI:pull-model', params)
});

