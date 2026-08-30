# Postmortem: Homepage Fullscreen Default & Universal Double-Tap Lifecycle Architecture

**Date:** August 30, 2026
**Status:** Resolved & Production-Ready
**Components:** `src/App.jsx`, `src/RoomLandingPage.jsx`, `RegaarderComposeLanding.jsx`, `electron/main.cjs`
**Authors:** Senior Software Architect / Principal Engineer

---

## 1. Executive Summary & Problem Space

When launching Regaarder or navigating between workspaces, users encountered a severe lifecycle lock where the homepage defaulted to full screen immersive mode, the Windows taskbar was obscured, and double-tapping/clicking to exit or re-enter fullscreen failed to respond. Specifically:

1. **The Persistent Fullscreen Lock:** The homepage launched in borderless fullscreen mode instead of standard windowed mode.
2. **The "Taskbar Peek" Trap:** Pressing the Windows key or Ctrl momentarily revealed the taskbar, but returning focus to the window immediately locked the app back into exclusive fullscreen mode.
3. **Double-Tap Exit Failure:** Double-tapping or double-clicking within workspaces failed to exit or toggle fullscreen.
4. **App Launch Behavior:** Launching individual workspaces (Docs, Sheets, Deck, Room, Whiteboard) needed to enter fullscreen seamlessly, while returning home needed to restore standard windowed mode.

---

## 2. Root Cause Analysis (First-Principles Breakdown)

### A. Missing Electron Native Fullscreen Exit Sync

**The Disconnect:** When entering fullscreen, `enterFullscreen()` invoked `window.electronAPI.setFullscreen(true)` (which calls `mainWindow.setFullScreen(true)` via Electron IPC) alongside HTML5 `document.documentElement.requestFullscreen()`.

**The Asymmetric Exit:** When exiting fullscreen, the code only called HTML5 `document.exitFullscreen()`. In Electron on Windows, `mainWindow.setFullScreen(true)` is an OS-level window state completely independent of HTML5 DOM fullscreen elements. Because `window.electronAPI.setFullscreen(false)` was never invoked during exit paths, the native Electron window remained permanently locked in borderless OS fullscreen regardless of any DOM state changes.

**Diagnostic Signal:** Pressing Esc would appear to "exit" (CSS immersive class removed), but the window chrome (title bar, resize handles) would not reappear because the OS-level fullscreen was still active. The taskbar could peek but the app always snapped back.

---

### B. Auto-Fullscreen on Every Product Launch

**The Over-eager Initializers:** Functions like `createComposeExperience`, `createDeckExperience`, `createSheetsExperience`, `createWhiteboardExperience`, `createRoomLandingExperience`, and `createDmExperience` each called `enterFullscreen()` and `setIsDocumentImmersive(true)` unconditionally on every invocation ¡X including when simply switching between tabs or reopening a previous document.

**The Side Effect:** Even returning to the homepage triggered a fullscreen reset, meaning the homepage could never be in a clean normal windowed state.

---

### C. Double-Tap / Double-Click Event Race Condition

**The Trigger Collision:** A double-click on a desktop or trackpad produces this precise DOM event stream:

```
pointerdown(1) ¡÷ pointerup ¡÷ click ¡÷ pointerdown(2) ¡÷ pointerup ¡÷ click ¡÷ dblclick
```

**The Cancellation Loop:** A manual tap-interval tracker on `onPointerDown` detected the second tap within 320ms and toggled fullscreen (`false ¡÷ true`). Milliseconds later, Chromium emitted the native `dblclick` event to `onDoubleClick`, which immediately executed a second toggle (`true ¡÷ false`). Both events fired within the same 16ms render frame, canceling each other out ¡X giving the user the appearance that double-tap was completely non-functional.

**Why It Was Hard to Detect:** In isolation, each individual handler worked correctly. The bug was purely a timing race between two separate, parallel event listeners with no shared throttle guard.

---

### D. Window-Focus Re-Fullscreen Trap

**The Focus Hook:** In `App.jsx`, a `window.addEventListener('focus', handleWindowFocus)` listener attempted to restore fullscreen on window focus:

```javascript
// BAD: This trapped users who wanted to exit fullscreen
const handleWindowFocus = () => {
  if (isFilePickerActiveRef.current) {
    isFilePickerActiveRef.current = false;
    if (isDocumentImmersive && !document.fullscreenElement && wasNativeFullscreenRef.current) {
      if (appShellRef.current?.requestFullscreen) {
        appShellRef.current.requestFullscreen().catch(...);
      }
    }
  }
};
```

**The Failure Mode:** When a user pressed `Ctrl`/`Windows` to interact with the taskbar, Chromium lost focus. When clicking back into the window, the `focus` listener aggressively re-requested fullscreen, trapping the user and overriding any intentional exit. This was designed for file picker dialogs but was incorrectly branching on the broader `isDocumentImmersive` state.

---

### E. Missing Workspace Header & Gutter Listeners

**Scope Limitation:** Double-tap and double-click listeners were only bound locally to the internal video canvas element inside the Room workspace. In Docs (Compose), Sheets, Decks, and Whiteboard, the top navigation headers, side gutters, toolbar backgrounds, and document margins had zero double-tap or double-click listeners wired to `toggleDocumentImmersiveMode()`.

**Why Double-Tap Appeared to "Do Nothing":** The events fired, bubbled up through the React tree, and terminated silently at the root `appShellRef` div which had no handler attached.

---

## 3. Detailed Iteration Log: What Failed vs. What Succeeded

| Attempt / Hypothesis | Implementation | Result | Why It Failed / Succeeded |
| :--- | :--- | :--- | :--- |
| **Attempt 1:** Remove auto-fullscreen from all experience creators | Removed `enterFullscreen()` from all initializers | ?? Partial | Homepage stayed normal but tapping Docs/Room from home did not enter fullscreen. |
| **Attempt 2:** Rely solely on `document.exitFullscreen()` | Called HTML5 exit API on double-tap | ? Failed | Electron's native `mainWindow.setFullScreen(true)` stayed locked on Windows. |
| **Attempt 3:** Pointer-down double-tap tracking without debounce | Tracked `Date.now() - lastTap < 320ms` on pointerdown + dblclick both attached | ? Failed | pointerdown and native `dblclick` fired back-to-back within 16ms, immediately inverting the state to its original value. |
| **Attempt 4:** Unified `exitFullscreen()` + 350ms Throttle + AppShell Root Delegation | Created symmetric `exitFullscreen()` calling both Electron IPC and DOM, added 350ms debounce guard, global `onPointerDown` + `onDoubleClick` on the root appShell | ? **Succeeded** | Homepage starts normal, app launches enter fullscreen, double-tap toggles cleanly both ways with zero race conditions. |

---

## 4. Final Architecture: The Correct Dual-Host Fullscreen Pattern

### A. Symmetric Entry and Exit ¡X Never Asymmetric

```javascript
const enterFullscreen = () => {
  try {
    // 1. Electron OS-level fullscreen
    if (typeof window !== 'undefined' && window.electronAPI?.setFullscreen) {
      try { window.electronAPI.setFullscreen(true); } catch (e) {}
    }
    // 2. HTML5 DOM fullscreen (progressive enhancement)
    if (document.documentElement?.requestFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  } catch (e) {}
};

const exitFullscreen = () => {
  try {
    // 1. Electron OS-level exit ¡X THIS IS THE CRITICAL MISSING CALL
    if (typeof window !== 'undefined' && window.electronAPI?.setFullscreen) {
      try { window.electronAPI.setFullscreen(false); } catch (e) {}
    }
    // 2. HTML5 DOM exit
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  } catch (e) {}
  wasNativeFullscreenRef.current = false;
  setIsDocumentImmersive(false);
  setIsFocusMode(false);
};
```

### B. Universal Double-Tap Controller with Debounce Guard

```javascript
const lastToggleImmersiveTimeRef = useRef(0);
const lastUniversalTapRef = useRef({ time: 0, x: 0, y: 0 });

const toggleDocumentImmersiveMode = () => {
  const now = Date.now();
  // CRITICAL: 350ms guard prevents pointerdown + dblclick double-fire
  if (now - (lastToggleImmersiveTimeRef.current || 0) < 350) return;
  lastToggleImmersiveTimeRef.current = now;

  const entering = !isDocumentImmersive;
  if (entering) {
    setIsFocusMode(true);
    setIsDocumentImmersive(true);
    enterFullscreen();
  } else {
    exitFullscreen(); // Handles BOTH Electron and DOM
    setPulseCycleActive(true);
    closeCitationPopover();
  }
};

// Global root handler ¡X works across all apps
const handleAppShellPointerDown = (e) => {
  // Gate: never intercept interactive elements
  const BLOCKED = 'button, input, textarea, a, select, [contenteditable="true"], [role="button"], [data-prevent-doubletap], table, td, th, [data-deck-element], canvas, .rdp, .tippy-box';
  if (e.target.closest(BLOCKED)) return;
  if (productMode === 'landing') return;

  const now = Date.now();
  const prev = lastUniversalTapRef.current;
  const timeDiff = now - prev.time;
  const dist = Math.hypot((e.clientX || 0) - prev.x, (e.clientY || 0) - prev.y);

  if (timeDiff > 0 && timeDiff < 350 && dist < 30) {
    e.preventDefault();
    toggleDocumentImmersiveMode();
    lastUniversalTapRef.current = { time: 0, x: 0, y: 0 };
  } else {
    lastUniversalTapRef.current = { time: now, x: e.clientX || 0, y: e.clientY || 0 };
  }
};

const handleAppShellDoubleClick = (e) => {
  const BLOCKED = 'button, input, textarea, a, select, [contenteditable="true"], [role="button"], [data-prevent-doubletap], table, td, th, [data-deck-element], canvas, .rdp, .tippy-box';
  if (e.target.closest(BLOCKED)) return;
  if (productMode === 'landing') return;
  toggleDocumentImmersiveMode();
};
```

Attach to the root shell:
```jsx
<div
  ref={appShellRef}
  onPointerDown={handleAppShellPointerDown}
  onDoubleClick={handleAppShellDoubleClick}
  ...
>
```

---

## 5. Permanent Rules & Detection Checklist

### Rule 1 ¡X Dual-Host Synchronization is Non-Negotiable
Never call `requestFullscreen` without pairing it with `window.electronAPI.setFullscreen(true)`, and NEVER write an `enterFullscreen` path without a mirror `exitFullscreen` path that commands both Electron and DOM.

**Detection:** If pressing Esc appears to dismiss fullscreen but the window chrome (title bar, resize handles) does not reappear, Electron native fullscreen is still active. Check that `window.electronAPI.setFullscreen(false)` is in all exit paths.

### Rule 2 ¡X Throttle All Pointer + Click Dual-Listener Combinations
Whenever both `onPointerDown` (tap gesture detector) and `onDoubleClick` (mouse double-click) are attached to the same DOM tree for the same action, the underlying action MUST be protected by a minimum 300¡V350ms timestamp guard.

**Detection:** If a toggle action appears to fire and immediately revert with no visible change (the "nothing happened" bug), check if both a manual tap-interval detector AND a native `dblclick` handler are wired to the same function without a shared debounce.

### Rule 3 ¡X Never Re-Request Fullscreen on Window Focus
Never attach unconditional `requestFullscreen()` calls inside `window.addEventListener('focus')`. Focus events should only reset internal flags (like `isFilePickerActiveRef`), not command OS-level display modes.

**Detection:** If the app aggressively snaps back to fullscreen when clicking anywhere after viewing the taskbar, inspect `window.addEventListener('focus', ...)` handlers for fullscreen API calls.

### Rule 4 ¡X Restrict Double-Tap Guards with Strict Selector Filtering
Double-tap and double-click fullscreen controllers on the root app shell MUST always gate on `e.target.closest()` with interactive selectors. Failing to do so will cause random text editor clicks, button presses, or table cell interactions to unintentionally toggle fullscreen.

**Detection:** If fullscreen triggers randomly when clicking inside the editor or on toolbar buttons, check that the global root handler gates on `button, input, textarea, a, select, [contenteditable="true"]` etc.

### Rule 5 ¡X Homepage productMode === 'landing' Must Always Be a Clean Windowed State
The landing screen MUST call `exitFullscreen()` (not just CSS class removal) whenever `productMode` transitions to `'landing'`. Product launch functions should call `enterFullscreen()` only inside `openLandingWorkspace()` (the single centralized launch coordinator), not inside individual `createXExperience()` functions.

**Detection:** If the homepage appears in fullscreen or borderless mode on launch or after pressing Back, check that `productMode === 'landing'` triggers `exitFullscreen()` (both hosts) in a `useEffect`.

---

## 6. Verification Checklist

- [ ] App opens on homepage in standard windowed mode with title bar and taskbar visible
- [ ] Clicking any product card (Docs, Sheets, Deck, Room, Whiteboard) enters fullscreen
- [ ] Double-clicking the workspace gutter/header exits fullscreen to windowed mode
- [ ] Double-clicking again re-enters fullscreen
- [ ] Pressing Esc exits fullscreen and Electron window chrome reappears
- [ ] Pressing Windows key and clicking back into the app does NOT trap back to fullscreen
- [ ] Clicking buttons, text fields, table cells does NOT trigger fullscreen toggle
- [ ] Vite production build completes with 0 errors: `npm run build`
