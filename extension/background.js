/**
 * background.js - Meneur Web Experience Extension Service Worker
 * 
 * Coordinates contextual focus site-blocking, hotkey dispatch,
 * and zero-latency state synchronization with the Regaarder platform.
 */

const DEFAULT_DISTRACTING_DOMAINS = [
  'twitter.com',
  'x.com',
  'reddit.com',
  'facebook.com',
  'instagram.com',
  'tiktok.com',
  'youtube.com/shorts'
];

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    focusModeActive: true,
    blockedDomains: DEFAULT_DISTRACTING_DOMAINS,
    tabArchives: []
  });

  // Setup context menu for right-click directive capture
  chrome.contextMenus.create({
    id: 'meneur-capture-directive',
    title: 'Meneur: Capture as Priority Directive',
    contexts: ['selection', 'page']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'meneur-capture-directive') {
    const selectedText = info.selectionText || tab.title || '';
    chrome.tabs.sendMessage(tab.id, {
      action: 'CAPTURE_DIRECTIVE',
      text: selectedText,
      url: tab.url,
      title: tab.title
    });
  }
});

// Handle global hotkey commands
chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    if (command === 'capture-directive') {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'TRIGGER_HOTKEY_CAPTURE' });
    } else if (command === 'toggle-command-deck') {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'TOGGLE_SIDEBAR_DECK' });
    }
  });
});

// Handle internal messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'CHECK_FOCUS_BLOCK') {
    chrome.storage.local.get(['focusModeActive', 'blockedDomains'], (res) => {
      if (!res.focusModeActive) {
        sendResponse({ isBlocked: false });
        return;
      }
      const isBlocked = (res.blockedDomains || []).some(d => (request.url || '').toLowerCase().includes(d));
      sendResponse({ isBlocked });
    });
    return true; // async
  }
});
