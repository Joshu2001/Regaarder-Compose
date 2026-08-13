# Postmortem & Architecture Skill: Electron & React Dual-Host Popover Lifecycle

## 1. Executive Summary

This postmortem documents the investigation, root cause analysis, and architectural refactoring of the browser toolbar popovers in **Regaarder Compose** (`BrowserFlowsPopover`, `BrowserFontPopover` / Display & Appearance, `BrowserUtilitiesPopover`, `BrowserOverflowMenu`, `SendToSheetsPopover`, `SendToComposePopover`).

Prior to this fix, the popover subsystem exhibited several critical issues:
1. **Desktop Floating Leak:** The "Display & Appearance" popover panel appeared floating over external OS windows (e.g. Antigravity IDE, VSCode) and persisted across unrelated app views (Home page, Document editor).
2. **Sub-Menu Display Failure:** Opening "Display & Appearance" from within the Utilities menu failed to display or immediately dismissed itself upon click.
3. **Popover Flickering & Glitching:** Rapid pointer interactions caused popovers to flash for a fraction of a second and vanish.
4. **Visual Translucency & Bleed-Through:** Certain popovers lacked solid opaque surface backgrounds, causing webpage content behind them to bleed through.

---

## 2. System Architecture: The Dual-Host Model

Regaarder Compose operates under a **Dual-Host UI Architecture**:

```
                          ┌─────────────────────────────┐
                          │   Regaarder Main Window     │
                          └──────────────┬──────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
    ┌────────────▼────────────┐                     ┌────────────▼────────────┐
    │  Web Mode (Standalone)  │                     │   Electron Desktop Mode │
    └────────────┬────────────┘                     └────────────┬────────────┘
                 │                                               │
   React State (`fontPopoverRect`)                 IPC Bridge (`openPopover`)
                 │                                               │
   Portal Rendering (`createPortal`)                Child Window (`BrowserWindow`)
                 │                                               │
   Renders in DOM (`#root`)                         Renders in Popover WebContents
```

### Modes Breakdown:
1. **Web / Fallback Mode (`!isElectron`):**
   - Popovers are managed via React state hooks in `BrowserWorkspace.jsx` (`fontPopoverRect`, `utilitiesPopoverRect`, etc.).
   - Popovers render directly into the DOM using React Portals: `createPortal(content, document.body)`.

2. **Electron Desktop Mode (`isElectron`):**
   - Popovers are delegated via IPC (`window.electronAPI.openPopover({ type, bounds, force })`).
   - Electron's `BrowserViewManager` creates a dedicated, frameless child `BrowserWindow` (`popoverWindow`) anchored relative to `mainWindow` bounds.
   - The child window loads a dedicated route `/#/popover-window?type=...` rendered by `PopoverWindowContainer.jsx`.

---

## 3. Detailed Root Cause Analysis

### Root Cause 1: OS Desktop Window Leak via `alwaysOnTop: true`
* **Mechanism:** In `electron/browserViewManager.cjs` and `electron/browserViewManager.js`, `popoverWindow` was initialized with `alwaysOnTop: true`.
* **Impact:** `alwaysOnTop: true` instructs the OS window manager to place the child window at the topmost Z-index across the entire operating system desktop. When the user switched away from Regaarder Compose to another desktop app (such as the Antigravity IDE or VSCode), the popover window remained floating over the coding interface, detached from any visible main window.
* **Resolution:** Changed `alwaysOnTop` from `true` to `false`. Scoped popover window positioning strictly to `parent: mainWindow`.

### Root Cause 2: Unmount Event Bleed-Through (Pointer Event Race)
* **Mechanism:** The DOM mouse click cycle follows a 3-stage sequence: `pointerdown` → `pointerup` → `click`.
* **The Bug:** When a user clicked a sub-menu button inside `BrowserUtilitiesPopover` (e.g. "Display & Appearance"), the button's `onPointerDown` handler executed `callback(anchorRect)` followed immediately by `onClose()`. Calling `onClose()` synchronously dismounted `BrowserUtilitiesPopover` *during* the `pointerdown` phase.
* **DOM Bleed Effect:** Because the menu node was removed from the DOM before `pointerup` and `click` completed, the browser dispatched the remaining `pointerup` and `click` events to whatever element was positioned directly beneath the cursor coordinates (the underlying web page `<iframe` or `WebContentsView`).
* **Result:** The webpage canvas received a synthetic click event, which triggered global `handleMainWindowPointerDown` / `closePopover()`, instantly closing the newly opened child modal.
* **Resolution:** Wrapped `onClose()` inside `requestAnimationFrame(() => onClose?.())`. Deferring unmounting by one animation frame allows the browser to finish event dispatch cleanly on the menu button node before it dismounts.

```javascript
// BEFORE (Buggy: Unmounts synchronously during pointerdown)
const handleAction = (callback, e) => {
  e?.preventDefault();
  e?.stopPropagation();
  if (callback) callback(anchorRect);
  onClose?.(); // ❌ Dismounts DOM node mid-click!
};

// AFTER (Fixed: Defers unmount until pointer event cycle completes)
const handleAction = (callback, e) => {
  e?.preventDefault();
  e?.stopPropagation();
  if (!callback) return;
  callback(anchorRect);
  requestAnimationFrame(() => {
    onClose?.(); // ✅ Clean unmount on next frame
  });
};
```

### Root Cause 3: State Toggle Mismatch on Sub-Menu Triggers
* **Mechanism:** Popover handlers in `BrowserWorkspace.jsx` used boolean toggle functions:
  ```javascript
  setFontPopoverRect((prev) => (prev ? null : rect));
  ```
* **The Bug:** When triggering a popover from a sub-menu action (e.g., clicking "Display & Appearance" inside Utilities), `setFontPopoverRect` was toggled rather than explicitly set. If state was already dirty or double-dispatched, the toggle flipped `fontPopoverRect` back to `null`.
* **Resolution:** Introduced an explicit `forceOpen = false` parameter across all popover action handlers:
  ```javascript
  const handleOpenFontPopoverAction = useCallback((rect, forceOpen = false) => {
    setOverflowMenuRect(null);
    setUtilitiesPopoverRect(null);
    setFlowsPopoverRect(null);
    setSendToSheetsPopoverRect(null);
    setSendToComposePopoverRect(null);
    if (isElectron && window.electronAPI?.openPopover) {
      window.electronAPI.openPopover({ type: 'font', bounds: serializeRect(rect), force: forceOpen });
    } else {
      setFontPopoverRect((prev) => (forceOpen ? rect : (prev ? null : rect)));
    }
  }, [isElectron]);
  ```

### Root Cause 4: Missing `data-popover` Guards on Container Roots
* **Mechanism:** `BrowserWorkspace.jsx` relies on a global `pointerdown` listener for outside-click dismissal:
  ```javascript
  if (e.target?.closest?.('button')) return;
  if (e.target?.closest?.('[data-popover]')) return;
  ```
* **The Bug:** `SendToSheetsPopover.jsx` and `SendToComposePopover.jsx` lacked `data-popover` attributes on their root container `<div>`. Any click on a divider, section label, or non-button area inside those popovers failed the guard and dismissed the modal.
* **Resolution:** Standardized `data-popover` attributes on all popover root elements.

---

## 4. Architectural Refactoring & UX Improvements

1. **Promoted Display & Appearance to Top-Level Toolbar Icon:**
   - Stripped "Display & Appearance" from inside `BrowserUtilitiesPopover`.
   - Added a dedicated `SlidersHorizontal` icon button directly on `BrowserToolbar.jsx` in the primary action group alongside Bookmark, Flow, AI, Utilities, and Overflow.

2. **Standardized Surface Opacity & Shadows:**
   - Updated container classes across all 4 popovers (`BrowserFlowsPopover`, `BrowserFontPopover`, `BrowserUtilitiesPopover`, `BrowserOverflowMenu`) to use 100% solid surfaces (`bg-white dark:bg-[#1c1c1e]`), crisp borders (`border-slate-200/90 dark:border-zinc-800/90`), and high-contrast HIG shadows (`shadow-[0_20px_50px_-12px_rgba(0,0,0,0.22),0_4px_16px_-4px_rgba(0,0,0,0.08)]`).

3. **Added Real-Time Search & Filter to Utilities:**
   - Integrated an auto-focused search filter (`Search utilities...`) in `BrowserUtilitiesPopover.jsx` supporting instant filtering for terms like `"tab"`, `"sheet"`, `"print"`, `"font"`, and `"history"`.

---

## 5. Reusable Guidelines for Future Adjacent Tasks

When building or modifying popovers, dropdowns, or floating panels in dual-host (Electron + React) applications, ALWAYS adhere to the following checklist:

### Checklist for Floating Panels & Popovers:
- [ ] **No `alwaysOnTop: true` on Child Windows:** Set `alwaysOnTop: false` on Electron child `BrowserWindow` instances unless creating a system-wide modal dialog.
- [ ] **Defer Unmounting with `requestAnimationFrame`:** Never unmount a menu popover synchronously inside `onPointerDown` if it opens a new view or triggers navigation. Always wrap `onClose()` in `requestAnimationFrame(() => onClose())` to avoid DOM event bleed onto elements behind the menu.
- [ ] **Use Explicit `forceOpen` Parameters:** For sub-menu navigation (Menu A → Menu B), pass `forceOpen = true` to guarantee state is set directly rather than toggled.
- [ ] **Guard Root Container with `data-popover`:** Ensure every portal or floating overlay root `<div>` includes `data-popover`, `onPointerDown={(e) => e.stopPropagation()}`, and `onClick={(e) => e.stopPropagation()}`.
- [ ] **Cleanup on Unmount / Tab Switch:** Always trigger `window.electronAPI.closePopover()` and reset React state when navigating away from the parent workspace.
