document.addEventListener('DOMContentLoaded', () => {
  const toggleFocusBtn = document.getElementById('toggleFocusBtn');
  const focusStatus = document.getElementById('focusStatus');
  const captureBtn = document.getElementById('captureBtn');
  const archiveBtn = document.getElementById('archiveBtn');

  chrome.storage.local.get(['focusModeActive'], (res) => {
    const active = res.focusModeActive !== false;
    focusStatus.textContent = active ? 'ACTIVE' : 'STANDBY';
    focusStatus.style.color = active ? '#34d399' : '#fbbf24';
  });

  toggleFocusBtn.addEventListener('click', () => {
    chrome.storage.local.get(['focusModeActive'], (res) => {
      const next = !res.focusModeActive;
      chrome.storage.local.set({ focusModeActive: next }, () => {
        focusStatus.textContent = next ? 'ACTIVE' : 'STANDBY';
        focusStatus.style.color = next ? '#34d399' : '#fbbf24';
      });
    });
  });

  captureBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'TRIGGER_HOTKEY_CAPTURE' });
        window.close();
      }
    });
  });

  archiveBtn.addEventListener('click', () => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const payload = tabs.map(t => ({ id: t.id, title: t.title, url: t.url }));
      chrome.storage.local.get(['tabArchives'], (res) => {
        const list = res.tabArchives || [];
        list.unshift({
          id: `arch_${Date.now()}`,
          date: new Date().toISOString(),
          tabs: payload
        });
        chrome.storage.local.set({ tabArchives: list }, () => {
          archiveBtn.textContent = 'Archived!';
          setTimeout(() => window.close(), 800);
        });
      });
    });
  });
});
