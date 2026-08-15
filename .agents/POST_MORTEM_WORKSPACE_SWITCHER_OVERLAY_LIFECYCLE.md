# Post-Mortem: Dual-Host Viewport Occlusion & Workspace Switcher Trigger Resiliency

## 1. Incident Overview & Root Cause Analysis

### The Issues Observed
1. **Divergent Popover Appearance & Missing Backdrop in Research Mode (Image 1 vs Image 2):**
   The Workspace Switcher in Research mode appeared as a detached floating menu without the global dimming backdrop and was using generic Lucide icons rather than the bespoke Regaarder product icons.
2. **Chromium Viewport Lingering Over Destination Workspaces (Image 3):**
   When switching from Research to Docs/Sheets/Decks, the toast reported "Switched to Docs" and the top header updated, but the live Chromium webpage remained painted across the screen, hiding the document editor beneath it.
3. **Ghost Popover Flash When Switching to Browser (60ms Surface Attachment Delay):**
   When switching to Research, delaying `setBrowserVisibility(true)` via artificial `setTimeout` created a window where the DOM layer was briefly exposed before the native view covered it, producing a momentary flicker artifact.
4. **Trigger Inactivity in Electron Fullscreen Mode:**
   In fullscreen mode, the workspace switcher button in Research was unresponsive because it relied on `onClick` rather than touch-safe `onPointerDown`. In Electron fullscreen, mouse/pointer capture suppresses synthetic `click` events.

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

#### Issue 3: Artificial Delay Artifact
- **Mechanism:** Using `setTimeout(..., 60)` before setting `setBrowserVisibility(true)` created an artificial delay where the DOM background layer was visible for 60ms before the Chromium surface snapped into place.
- **Resolution:** Synchronous state batching in React 18 (`setWorkspaceSwitcherOpen(false)`, `setWorkspaceSwitcherAnchorRect(null)`, and `setProductMode(item.mode)` in one tick) ensures the portal unmounts instantly on the same commit that mounts `BrowserViewport`, removing any gap or flicker.

#### Issue 4: Fullscreen Pointer Event Interception
- **Mechanism:** Under Electron fullscreen mode, Chromium's compositor window and OS display pipeline intercept mouse down/up sequences, frequently suppressing synthetic DOM `click` event generation on header toolbar controls.
- **Breakdown:** While other toolbar buttons (Commands, Overflow, Font) utilized `onPointerDown`, the Workspace Switcher button was bound to `onClick`, preventing execution in fullscreen.

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

### C. Synchronous Atomic Transition
1. **Single-Tick State Batching in `App.jsx`:**
   - Executing `setWorkspaceSwitcherOpen(false)`, `setWorkspaceSwitcherAnchorRect(null)`, and `setProductMode(item.mode)` synchronously in a single React 18 batch guarantees the portal is purged from the DOM in the same render pass that loads `BrowserViewport`.
2. **Immediate Surface Visibility in `BrowserViewport.jsx`:**
   - Synchronously invoke `updateBounds()` and `setBrowserVisibility(true)`, eliminating artificial timer gaps.

### D. Fullscreen PointerDown Event Architecture
1. **Toolbar Trigger Standardization:**
   - Updated `workspaceSwitcherBtnRef` in `BrowserToolbar.jsx` to use `onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); onOpenWorkspaceSwitcher(rect); }}` matching all executive toolbar controls.
2. **Backdrop Guard:**
   - Added `[data-workspace-switcher]` guard in `BrowserWorkspace.jsx` `handleMainWindowPointerDown` to prevent accidental click-outside races.

---

## 3. Extrapolated Directives for Future Dual-Host Development

### 1. Viewport Unmount Teardown Rule
> **Rule:** Any React component hosting an external OS rendering surface (such as Electron `WebContentsView` or `<webview>`) **must** hide or detach that surface in its `useEffect` cleanup return.
- Never assume unmounting the React container element will automatically hide the OS window surface.

### 2. Global Product Mode State Guards
> **Rule:** Top-level application shells managing multi-workspace routing must explicitly enforce OS view detachment whenever transitioning to non-browser product modes (`productMode !== 'browser'`).

### 3. Single Source of Truth for Global Overlays
> **Rule:** Global overlays (Workspace Switcher, Command Palette, Global Auth Modals) must share a single portal implementation across all workspace modes (Docs, Sheets, Decks, Room, Research) to guarantee identical visual hierarchy and behavior.

### 4. Fullscreen-Safe Pointer Event Rule
> **Rule:** In Electron applications with dual-host window compositing, all toolbar dropdown triggers **must** execute via `onPointerDown` with `preventDefault()` and `stopPropagation()`, rather than relying on synthetic `onClick` events.

---

## 4. Verification Checklist

| Area | Check | Status |
| :--- | :--- | :--- |
| **Fullscreen Functionality** | Does the workspace switcher trigger reliably in Electron fullscreen mode? | ✅ Verified |
| **Unified Switcher UI** | Does Research use the identical backdrop + popover as Docs (Image 2)? | ✅ Verified |
| **Viewport Cleanup** | Does switching from Research to Docs hide the live web page (Image 3 fix)? | ✅ Verified |
| **Instant Transition** | Does switching to Research load cleanly without popover ghosting? | ✅ Verified |
| **Bespoke Icon Grammar** | Are custom Regaarder product icons used across all switcher instances? | ✅ Verified |
| **Dismissal Restoration** | Does dismissing the switcher restore the live browser view immediately? | ✅ Verified |
| **Build Verification** | Does `npm run build` succeed with zero syntax or bundle errors? | ✅ Verified |
