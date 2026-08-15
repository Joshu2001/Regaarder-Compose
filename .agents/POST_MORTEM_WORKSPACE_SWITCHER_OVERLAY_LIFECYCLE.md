# Post-Mortem: Dual-Host Viewport Occlusion & Workspace Switcher Trigger Resiliency

## 1. Incident Overview & Root Cause Analysis

### The Issues
1. **Live Webpage Turning Blank Behind Switch Workspace Popover in Research Mode:**
   When triggering the Workspace Switcher icon from Regaarder Research, the live webpage was hidden (`setBrowserVisibility(false)`), exposing a blank white/dark canvas underneath and causing fullscreen display glitches.
2. **Switch Workspace Trigger Inactivity in Sheets and Decks:**
   Tapping or clicking the 4-squares grid icon in Sheets mode and Deck mode originally failed to render the Switch Workspace popover due to a missing portal mount in the branched return block.

---

### Root Cause Analysis (RCA)

#### Issue 1: Improper Use of `setBrowserVisibility(false)` vs. Detached Child Windows
- **Mechanism:** In Electron, `WebContentsView` is an OS-level surface painted directly by Chromium. Calling `window.electronAPI.setBrowserVisibility(false)` hides the entire webview, exposing the bare background `<div>` of the window (rendering as a blank page).
- **Breakdown:** In `BrowserWorkspace.jsx`, `isWorkspaceSwitcherOpen` was previously included inside `isModalOpen` and `isPopoverOpen`. This caused `BrowserViewport` to aggressively hide the active browser view when clicking the Switch Workspace icon.
- **The Correct Architecture:** In Electron, all toolbar dropdowns and popovers (Font, Overflow, Utilities, Flows, Workspace Switcher) must be opened via Electron's child window IPC bridge (`openPopover({ type: 'workspaceSwitcher', bounds })`). This detached child `BrowserWindow` naturally floats **above** both `mainWindow` and the `WebContentsView` surface without needing to hide or blank out the live web page.

#### Issue 2: Missing Portal Mount in Sheets/Decks Branch & Stale Event Listeners
- **Mechanism:** `AppCore` in `App.jsx` uses an early return pattern `if (productMode === 'deck' || productMode === 'sheets') { return (...) }`.
- **Breakdown:**
  1. `{workspaceSwitcherOpen && renderWorkspaceSwitcherDropdownContent()}` was originally mounted only at the bottom of the *Docs* return branch (line 62966), meaning Sheets and Decks never rendered the portal despite the boolean being `true`.
  2. Legacy document-level `handleOutsideClick` listeners in empty-dependency `useEffect` hooks captured stale state and raced to reset `workspaceSwitcherOpen` to `false` during click event execution.

---

## 2. Resolutions Applied

### A. Detached Child Popover for Research in Electron Mode
1. **Removed `setBrowserVisibility(false)` Trigger:** Removed `isWorkspaceSwitcherOpen` from `isModalOpen` and `isPopoverOpen` in `BrowserWorkspace.jsx`.
2. **Integrated `workspaceSwitcher` into Electron Child Window:**
   - Updated `BrowserWorkspace.jsx` to dispatch `openPopover({ type: 'workspaceSwitcher', bounds })` when running in Electron.
   - Sized `workspaceSwitcher` bounds in `electron/browserViewManager.cjs` and `electron/browserViewManager.js` (width: 240, height: 335).
   - Rendered the Switch Workspace UI inside `PopoverWindowContainer.jsx`.
   - Wired `switchProductMode` IPC action from `PopoverWindowContainer` back to `AppCore` via `BrowserWorkspace.jsx` and `onSwitchProductMode`.
   - Maintained in-window React Portal fallback (`renderWorkspaceSwitcherDropdownContent()`) for web browser environments.

### B. Portal Mount in Sheets/Decks Return Block
In [App.jsx](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/App.jsx):
- Mounted `{workspaceSwitcherOpen && renderWorkspaceSwitcherDropdownContent()}` directly inside the `if (productMode === 'deck' || productMode === 'sheets')` return block right before its closing container.

### C. Clean Event Handling & Stale Listener Elimination
In [App.jsx](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/App.jsx) and [BrowserToolbar.jsx](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/components/browser/BrowserToolbar.jsx):
1. **Clean Event Execution:** Standardized all switcher trigger buttons to use `onClick={(e) => { e.stopPropagation(); ... }}` with anchor position tracking.
2. **Backdrop-Driven Outside-Click Architecture:** Dismissal in web mode is managed by the full-screen backdrop overlay (`z-[100000]`) and global `Escape` key listener without stale document listener races.

---

## 3. Extrapolated Directives for Future Dual-Host Development

### 1. Dual-Host Floating Popover Rule (Electron vs. Web)
> **Rule:** In Electron mode, floating toolbar dropdowns and menus that overlap `WebContentsView` must be rendered using detached child `BrowserWindow` popovers via `openPopover({ type, bounds })`. **Never call `setBrowserVisibility(false)` for small popovers or dropdown menus.**
- Reserve `setBrowserVisibility(false)` strictly for full-screen blocking modals (e.g. competitor research workflow wizard, onboarding modals).

### 2. Dual-Branch Component Return Parity Rule
> **Rule:** In React components with branched `if (mode) return (...)` architectures, all global floating overlays and modal portals must be present in **every** render branch, or factored out to a unified parent shell.

### 3. Backdrop Over Stale Global Listeners
> **Rule:** For full-screen modal overlays and popovers rendered via React Portals, use dedicated backdrop elements (`fixed inset-0`) for click-outside dismissal rather than registering global document `pointerdown`/`mousedown` listeners in empty-dependency `useEffect` hooks.

---

## 4. Prevention Checklist & Verification Matrix

| Area | Check | Status |
| :--- | :--- | :--- |
| **Electron Popover Delegation** | Does Research use `openPopover({ type: 'workspaceSwitcher' })` in Electron? | ✅ Verified |
| **Live Webpage Persistence** | Does the live webpage remain fully visible when opening the switcher in Research? | ✅ Verified |
| **Fullscreen Compatibility** | Does the popover display correctly across both windowed and fullscreen modes? | ✅ Verified |
| **Portal Render Parity** | Is `renderWorkspaceSwitcherDropdownContent()` present in all return branches? | ✅ Verified |
| **Build Verification** | Does `npm run build` succeed with zero syntax or bundle errors? | ✅ Verified |
