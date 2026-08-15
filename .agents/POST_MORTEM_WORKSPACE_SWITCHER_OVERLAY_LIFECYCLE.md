# Post-Mortem: Dual-Host Viewport Occlusion & Workspace Switcher Trigger Resiliency

## 1. Incident Overview & Root Cause Analysis

### The Issues
1. **Live Webpage Occluding Switch Workspace Popover in Research Mode:**
   When triggering the Workspace Switcher modal from Regaarder Research, the live Chromium webpage rendered **above** the switch workspace popover and backdrop overlay, obscuring the menu content.
2. **Switch Workspace Trigger Inactivity in Sheets and Decks:**
   Tapping or clicking the 4-squares grid icon in Sheets mode and Deck mode failed to render the Switch Workspace popover.

---

### Root Cause Analysis (RCA)

#### Issue 1: Electron OS Viewport Layering Occlusion
- **Mechanism:** In Electron desktop architectures, `WebContentsView` is a native Chromium surface managed directly by the operating system window compositor. It does not exist inside the HTML DOM tree and is not governed by CSS `z-index` (even `z-[100000]`).
- **Breakdown:** In `BrowserWorkspace.jsx`, the viewport visibility state (`isModalOpen`) checked only internal workflow modals (`showCompetitorWorkflow`, `synthesizedFlowToReview`, etc.) and omitted `isWorkspaceSwitcherOpen`.
- **Consequence:** Because `isModalOpen` remained `false`, `window.electronAPI.setBrowserVisibility(false)` was never dispatched to the Electron main process. The native Chromium surface remained visible and painted directly over the React DOM portal overlay.

#### Issue 2: Missing Portal Mount in Sheets/Decks Branch & Event Stale Closures
- **Mechanism:** In `App.jsx`, `AppCore` contains multiple top-level return branches. When `productMode === 'deck' || productMode === 'sheets'`, an early `return (...)` block executed (lines 41397–49622).
- **Breakdown:**
  1. **Unmounted Portal Call:** `{workspaceSwitcherOpen && renderWorkspaceSwitcherDropdownContent()}` was only mounted at the bottom of the *Docs* return block (line 62966). In Sheets and Decks mode, although state toggled to `true`, the portal function was never invoked in that return block.
  2. **Event Cancellation & Stale Closure:** The trigger buttons initially used `onPointerDown={(e) => e.preventDefault()}` with `onClick`, which suppressed synthetic clicks in touch/stylus pipelines. Furthermore, a legacy document-level `handleOutsideClick` in an empty dependency `useEffect` was capturing stale state and resetting `workspaceSwitcherOpen` to `false` during the click tick.

---

## 2. Resolutions Applied

### A. Electron Viewport Lifecycle Synchronization
In [BrowserWorkspace.jsx](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/components/browser/BrowserWorkspace.jsx):
- Integrated `isWorkspaceSwitcherOpen` into both `isModalOpen` and `isPopoverOpen`.
- When the Switch Workspace popover opens, `window.electronAPI.setBrowserVisibility(false)` is automatically dispatched, hiding the OS-level webview.
- When dismissed, `window.electronAPI.setBrowserVisibility(true)` is immediately called, seamlessly restoring the live webpage.

### B. Portal Mount in Sheets/Decks Return Block
In [App.jsx](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/App.jsx):
- Mounted `{workspaceSwitcherOpen && renderWorkspaceSwitcherDropdownContent()}` directly inside the `if (productMode === 'deck' || productMode === 'sheets')` return block right before its closing container.

### C. Clean Event Handling & Stale Listener Elimination
In [App.jsx](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/App.jsx) and [BrowserToolbar.jsx](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/components/browser/BrowserToolbar.jsx):
1. **Clean Event Execution:** Standardized all switcher trigger buttons to use `onClick={(e) => { e.stopPropagation(); ... }}` with anchor position tracking.
2. **Backdrop-Driven Outside-Click Architecture:** Removed stale document `pointerdown` listeners for `workspaceSwitcherOpen`. Dismissal is now handled purely by the full-screen backdrop overlay (`z-[100000]`) and the global `Escape` key listener.

---

## 3. Extrapolated Directives for Future Dual-Host Development

### 1. Dual-Branch Component Return Parity Rule
> **Rule:** In React components with branched `if (mode) return (...)` architectures, all global floating overlays and modal portals must be present in **every** render branch, or factored out to a unified parent shell.
- Never place a global portal exclusively at the end of the default return branch.

### 2. The Native Viewport Occlusion Rule (Electron / Web)
> **Rule:** Whenever any global modal, dialog, slash menu, or floating popover is displayed in a dual-host application with embedded Chromium surfaces (`WebContentsView` or `<webview>`), the native view **must** be informed to hide or detach.
- Never rely on CSS `z-index` to sit on top of an Electron `WebContentsView`.
- Centralize overlay tracking flags in the workspace root to drive native visibility IPC calls.

### 3. Backdrop Over Stale Global Listeners
> **Rule:** For full-screen modal overlays and popovers rendered via React Portals, use dedicated backdrop elements (`fixed inset-0`) for click-outside dismissal rather than registering global document `pointerdown`/`mousedown` listeners in empty-dependency `useEffect` hooks.

---

## 4. Prevention Checklist & Verification Matrix

| Area | Check | Status |
| :--- | :--- | :--- |
| **Portal Render Parity** | Is `renderWorkspaceSwitcherDropdownContent()` present in all return branches? | ✅ Verified |
| **Electron Integration** | Does `isModalOpen` in `BrowserWorkspace.jsx` include all new modals/popovers? | ✅ Verified |
| **Event Propagation** | Do all trigger buttons invoke `e.stopPropagation()`? | ✅ Verified |
| **Outside-Click Logic** | Is outside-click handled by the portal's backdrop without stale document listener races? | ✅ Verified |
| **Build Verification** | Does `npm run build` succeed with zero syntax or bundle errors? | ✅ Verified |
