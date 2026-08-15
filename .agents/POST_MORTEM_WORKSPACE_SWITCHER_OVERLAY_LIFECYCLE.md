# Post-Mortem: Dual-Host Viewport Occlusion & Workspace Switcher Trigger Resiliency

## 1. Incident Overview & Root Cause Analysis

### The Issues Observed
1. **Divergent Popover Appearance & Missing Backdrop in Research Mode (Image 1 vs Image 2):**
   The Workspace Switcher in Research mode appeared as a detached floating menu without the global dimming backdrop and was using generic Lucide icons rather than the bespoke Regaarder product icons.
2. **Chromium Viewport Lingering Over Destination Workspaces (Image 3):**
   When switching from Research to Docs/Sheets/Decks, the toast reported "Switched to Docs" and the top header updated, but the live Chromium webpage remained painted across the screen, hiding the document editor beneath it.
3. **GPU Compositor Race on Reveal (Popover Appearing Momentarily Behind Webview):**
   When switching from Docs into Research mode, the native `WebContentsView` painted immediately on frame 0, before the React DOM had finished clearing the fading workspace switcher portal from the GPU raster buffer.

---

### Root Cause Analysis (RCA)

#### Issue 1: Detached Window Anti-Pattern vs. Unified Portal Architecture
- **Mechanism:** The workspace switcher in Regaarder is designed as a centralized executive portal (`renderWorkspaceSwitcherDropdownContent()`) with a full-screen ambient backdrop (`fixed inset-0 z-[100000] backdrop-blur-md`) and bespoke SVG product icons.
- **Breakdown:** Attempting to render the switcher in a separate child Electron `BrowserWindow` bypassed the shared portal, broke the unified aesthetic (Image 2), and lacked the backdrop overlay.
- **The Proper Pattern:** Research mode must invoke the identical `renderWorkspaceSwitcherDropdownContent()` portal as Docs, Sheets, and Decks. When the portal is open (`isWorkspaceSwitcherOpen === true`), Electron temporarily yields the display area (`setBrowserVisibility(false)`) so the backdrop and popover render cleanly. Upon dismissal or switching, the view state transitions seamlessly.

#### Issue 2: Missing Viewport Unmount & Mode Switch Cleanup
- **Mechanism:** In Electron desktop architectures, `WebContentsView` is an independent OS-level rendering surface attached to the main window.
- **Breakdown:** 
  1. `BrowserViewport.jsx`'s `useEffect` cleanup handler omitted `window.electronAPI.setBrowserVisibility(false)`. When switching product modes (e.g. Research → Docs), `BrowserViewport` unmounted from the React component tree, but the Electron main process was never told to hide or detach the native webview.
  2. Consequently, the Chromium webpage remained pinned to the OS window, painting directly over the newly mounted Docs/Sheets editor (Image 3).

#### Issue 3: Compositor Layer Race on Mode Transitions
- **Mechanism:** Native OS view attachment occurs asynchronously in the operating system window manager, whereas React DOM unmounting occurs in the JavaScript microtask loop.
- **Breakdown:** When `setProductMode('browser')` and `setWorkspaceSwitcherOpen(false)` executed simultaneously, the native view became visible before the DOM overlay had completed its unmount paint tick.

---

## 2. Resolutions Applied

### A. Viewport Unmount & Global Mode Cleanup (Fixing Image 3)
1. **`BrowserViewport.jsx` Cleanup:**
   - Added `window.electronAPI.setBrowserVisibility(false)` inside `BrowserViewport`'s `useEffect` return/cleanup function.
   - When the user navigates away from Research, the OS webview is immediately and reliably hidden.
2. **`App.jsx` Mode Guard:**
   - Added a top-level `useEffect` in `AppCore`:
     ```javascript
     useEffect(() => {
       if (productMode !== 'browser' && window.electronAPI?.setBrowserVisibility) {
         window.electronAPI.setBrowserVisibility(false);
       }
     }, [productMode]);
     ```

### B. Restoring the Unified Workspace Switcher Portal (Fixing Image 1 & Matching Image 2)
1. **Unified Portal Execution:**
   - Reconnected `BrowserToolbar` in Research mode to invoke `onOpenWorkspaceSwitcher(rect)`.
   - Wired `isWorkspaceSwitcherOpen` into `BrowserViewport.jsx` so `setBrowserVisibility(false)` is active while the switcher is open, allowing the full-screen backdrop and popover (Image 2) to render crisply.
   - Restored instant visibility (`setBrowserVisibility(true)`) when the switcher is dismissed.
2. **Bespoke Product Icons:**
   - Unified all workspace switcher instances to use `{ ComposeIcon, SheetIcon, DeckIcon, RoomIcon, BrowserIcon }` from [RegaarderProductIcons.jsx](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/components/RegaarderProductIcons.jsx).

### C. Grace-Period Compositor Transition (Eliminating Viewport Collision)
1. **Two-Phase Mode Switch in `App.jsx`:**
   - On clicking an app item in `renderWorkspaceSwitcherDropdownContent`, the popover is closed on Frame 0 (`setWorkspaceSwitcherOpen(false)`), and `setProductMode` is dispatched on Frame 1 via `requestAnimationFrame`.
2. **60ms Surface Reveal Delay in `BrowserViewport.jsx`:**
   - Defer `setBrowserVisibility(true)` by 60ms to guarantee that all DOM popover portals and backdrop blur filters have completely vacated the GPU raster buffer before the native OS surface renders.

---

## 3. Extrapolated Directives for Future Dual-Host Development

### 1. Viewport Unmount Teardown Rule
> **Rule:** Any React component hosting an external OS rendering surface (such as Electron `WebContentsView` or `<webview>`) **must** hide or detach that surface in its `useEffect` cleanup return.
- Never assume unmounting the React container element will automatically hide the OS window surface.

### 2. Global Product Mode State Guards
> **Rule:** Top-level application shells managing multi-workspace routing must explicitly enforce OS view detachment whenever transitioning to non-browser product modes (`productMode !== 'browser'`).

### 3. Single Source of Truth for Global Overlays
> **Rule:** Global overlays (Workspace Switcher, Command Palette, Global Auth Modals) must share a single portal implementation across all workspace modes (Docs, Sheets, Decks, Room, Research) to guarantee identical visual hierarchy and behavior.

### 4. Surface Attachment Grace-Period Rule
> **Rule:** When mounting an OS-level native webview following a DOM modal or popover dismissal, always introduce a micro-grace period (60ms) before asserting surface visibility to prevent visual overlap collisions with fading DOM elements.

---

## 4. Verification Checklist

| Area | Check | Status |
| :--- | :--- | :--- |
| **Unified Switcher UI** | Does Research use the identical backdrop + popover as Docs (Image 2)? | ✅ Verified |
| **Viewport Cleanup** | Does switching from Research to Docs hide the live web page (Image 3 fix)? | ✅ Verified |
| **Smooth Transition** | Does switching to Research reveal the webview without popover flicker? | ✅ Verified |
| **Bespoke Icon Grammar** | Are custom Regaarder product icons used across all switcher instances? | ✅ Verified |
| **Dismissal Restoration** | Does dismissing the switcher restore the live browser view immediately? | ✅ Verified |
| **Build Verification** | Does `npm run build` succeed with zero syntax or bundle errors? | ✅ Verified |
