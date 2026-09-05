/**
 * contentScript.js - Meneur Web Experience Page Injector
 * 
 * Manages in-page highlight detection, instant directive toasts,
 * contextual focus overlays, and the persistent slide-in command deck.
 */

let sidebarIframe = null;

function getSelectedText() {
  return window.getSelection ? window.getSelection().toString().trim() : '';
}

function showNotificationToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'meneur-toast-banner';
  toast.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;">
      <div style="width:8px;height:8px;border-radius:2px;background:#8b5cf6;"></div>
      <span style="font-weight:600;font-size:12px;color:#ffffff;font-family:-apple-system,sans-serif;">${msg}</span>
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Listen for messages from background worker
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.action === 'CAPTURE_DIRECTIVE' || req.action === 'TRIGGER_HOTKEY_CAPTURE') {
    const text = req.text || getSelectedText() || document.title;
    showNotificationToast(`Meneur: Captured "${text.slice(0, 45)}..." into Directive Queue`);
    sendResponse({ success: true, captured: text });
  } else if (req.action === 'TOGGLE_SIDEBAR_DECK') {
    toggleSidebar();
    sendResponse({ success: true });
  }
});

function toggleSidebar() {
  if (sidebarIframe) {
    sidebarIframe.remove();
    sidebarIframe = null;
  } else {
    sidebarIframe = document.createElement('iframe');
    sidebarIframe.src = chrome.runtime.getURL('popup.html');
    sidebarIframe.className = 'meneur-command-deck-frame';
    document.body.appendChild(sidebarIframe);
  }
}

// Intercept inline keyboard shortcuts
window.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
    e.preventDefault();
    const text = getSelectedText() || document.title;
    showNotificationToast(`Meneur: Captured "${text.slice(0, 45)}..." into Directive Queue`);
  }
});
