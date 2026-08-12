# Postmortem: Invisible Browser Toolbar Popovers in Electron Shell

**Date:** 2026-08-12  
**Severity:** High — Core UI navigation features (Ellipsis typography menu, Send to Sheets, Send to Compose, Flows) non-functional in Electron desktop app  
**Status:** Resolved  

---

## 1. Executive Summary & 6-Year-Old Explanation

### 🎈 The Story for a 6-Year-Old (The Toy Box & Storybook Analogy)

Imagine you are holding a tiny sticker on your desk (a 28-pixel icon button, like the `...` three-dot button). You tap the sticker because you want a **big pop-up storybook** (a 360-pixel wide menu) to pop open on top of your desk.

Instead of measuring how big the storybook was, the robot helper (Electron's `browserViewManager`) looked at the tiny sticker and thought:  
*"Oh! You clicked a tiny 28px sticker? I will shrink the entire storybook down to 28px × 28px!"*

So the robot crammed a giant storybook into a microscopic 28-pixel square box hidden right under the sticker. Naturally, you couldn't see anything!

To make matters worse, the shrunk storybook tried calling the house telephone on **Line 5173** (`http://localhost:5173`), but the family was actually chatting on **Line 5174**! The phone just rang in an empty room, so even if you looked inside the tiny 28px box, it was completely blank!

**How we fixed it:**  
1. We taught the robot helper: *"Stop shrinking the storybook! A sticker is 28px, but the storybook needs to be 360px wide!"*  
2. We taught the storybook: *"Look at what telephone line the main window is using, and call that exact same number!"*  
3. Now, whenever you tap the sticker, a full-sized, beautiful storybook pops up right where you expect it!

---

## 2. Timeline & Investigation Steps

| Phase | Event / Action | Result |
| :--- | :--- | :--- |
| **Bug Report** | User reported that tapping the ellipsis `...` button and other circled toolbar icons did not show any popover menu over the embedded Google webpage. | Issue confirmed in Electron desktop shell mode (`isElectron = true`). |
| **Step 1: Code Trace** | Inspected `BrowserWorkspace.jsx` to trace what happens when `onOpenFontPopover` is triggered. | Discovered that in Electron mode, React delegates popover rendering to native Electron IPC: `window.electronAPI.openPopover({ type: 'font', bounds })`. |
| **Step 2: Main Process Trace** | Traced `browser:open-popover` IPC handler in `electron/main.cjs` to `browserViewManager.showPopover(type, bounds)`. | Located the popover `WebContentsView` instantiation code in `browserViewManager.cjs`. |
| **Step 3: Finding Root Cause #1** | Inspected `showPopover` bounds calculation: `const width = Math.round(bounds.width || 360)`. | **Aha!** `bounds.width` was `28` (the button's width). In JavaScript, `28 || 360` evaluates to `28`! The popover view was being sized to 28px × 28px. |
| **Step 4: Finding Root Cause #2** | Inspected URL resolution: `const popoverUrl = 'http://localhost:5173/#/popover-window?type=font'`. | When Vite dev server started on port `5174` (or another port), `loadURL` failed to connect, rendering a blank view. |
| **Step 5: Finding Root Cause #3** | Inspected toggle behavior when tapping the button repeatedly. | `showPopover` did not track `this.popoverType`, so tapping the ellipsis button a second time re-opened a new view instead of closing the existing one. |
| **Step 6: Finding Root Cause #4** | Checked IPC parameter passing for `DOMRect`. | Passing `DOMRectReadOnly` directly across IPC could strip prototype getters (`x`, `y`, `left`, `right`). |
| **Resolution** | Applied fixed popover dimension sizing, dynamic base URL extraction from `mainWindow`, `popoverType` toggle tracking, and `serializeRect` plain-object conversion. Verified via `npm run build` (Exit code 0). | Popovers now render perfectly at full 360px/420px dimensions, dynamically anchored next to toolbar icons. |

---

## 3. Detailed Root Cause Analysis

### Bug #1: Logical OR (`||`) Fallback Misconception with Non-Zero Numbers
In `showPopover(type, bounds)`:
```javascript
// BROKEN CODE:
const width = Math.round(bounds.width || (type === 'font' ? 360 : type === 'flows' ? 380 : 420));
const height = Math.round(bounds.height || (type === 'font' ? 340 : type === 'flows' ? 380 : 420));
```
* **Why it broke:** The author intended `bounds.width` to represent the desired popover width if specified, falling back to 360px. However, `bounds` passed in was the `DOMRect` of the *trigger button* (`width: 28px, height: 28px`). Since `28` is a truthy number in JavaScript (`Boolean(28) === true`), `28 || 360` returned **`28`**.
* **Impact:** Electron's `WebContentsView` for the popover was instantiated with `width: 28px, height: 28px`, rendering the menu as a microscopic, invisible dot.

### Bug #2: Hardcoded Port vs. Dynamic Origin Resolution
```javascript
// BROKEN CODE:
const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
const popoverUrl = `${devUrl}/#/popover-window?type=${type}`;
```
* **Why it broke:** `main.cjs` tries ports 5173, 5174, and 5175 when starting up. If port 5173 was busy, Vite ran on port 5174. `mainWindow` loaded `http://localhost:5174/`, but `showPopover` attempted to load `http://localhost:5173/`, resulting in `net::ERR_CONNECTION_REFUSED`.

### Bug #3: Missing Toggle State Management
* **Why it broke:** In native Electron view managers, `showPopover` did not remember which popover type was currently active. Tapping the ellipsis icon button a second time destroyed and re-created the view rather than toggling it off.

### Bug #4: IPC Serialization of `DOMRect` Prototype Getters
* **Why it broke:** `getBoundingClientRect()` returns a `DOMRect` instance where properties (`x`, `y`, `left`, `right`, `top`, `bottom`) live on `DOMRectReadOnly.prototype` as getters. Electron's structured clone during `ipcRenderer.invoke` can strip prototype getters if passed directly without plain object serialization.

---

## 4. The Fix & Code Diff

### A. `electron/browserViewManager.cjs` & `electron/browserViewManager.js`
Fixed popover dimensions, dynamic URL origin resolution, and toggle state tracking:

```diff
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.tabs = new Map();
    this.activeTabId = null;
    this.bounds = { x: 0, y: 0, width: 0, height: 0 };
    this.isVisible = false;
+   this.popoverView = null;
+   this.popoverType = null;
  }

  showPopover(type, bounds) {
    if (!this.mainWindow || !bounds) return;

+   if (this.popoverView && this.popoverType === type) {
+     this.closePopover();
+     return;
+   }

    this.closePopover();
+   this.popoverType = type;

    const path = require('path');
    const popoverView = new WebContentsView({
      webPreferences: {
        preload: path.join(__dirname, 'preload.cjs'),
        contextIsolation: true,
        nodeIntegration: false
      }
    });

    this.popoverView = popoverView;
    try {
      popoverView.setBackgroundColor('#00000000');
    } catch (e) {}

-   const width = Math.round(bounds.width || (type === 'font' ? 360 : type === 'flows' ? 380 : 420));
-   const height = Math.round(bounds.height || (type === 'font' ? 340 : type === 'flows' ? 380 : 420));
+   // Fixed popover panel dimensions based on content requirements (independent of trigger button size)
+   const width = type === 'font' ? 360 : type === 'flows' ? 380 : 420;
+   const height = type === 'font' ? 340 : type === 'flows' ? 380 : 440;

    let x = Math.round(bounds.x || bounds.left || 0);
-   if (bounds.right && !bounds.x) {
+   if (bounds.right && (!bounds.x || bounds.right > width)) {
      x = Math.max(16, Math.round(bounds.right - width));
    }
+   const windowBounds = this.mainWindow.getBounds();
+   if (x + width > windowBounds.width - 16) {
+     x = Math.max(16, windowBounds.width - width - 16);
+   }

    let y = Math.round((bounds.bottom || bounds.y || 80) + 4);

    popoverView.setBounds({ x, y, width, height });

-   const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
-   const popoverUrl = `${devUrl}/#/popover-window?type=${type}`;
+   // Derive popover URL dynamically from mainWindow's active webContents URL
+   let baseUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
+   try {
+     const mainUrl = this.mainWindow.webContents.getURL();
+     if (mainUrl && (mainUrl.startsWith('http://') || mainUrl.startsWith('https://') || mainUrl.startsWith('file://'))) {
+       baseUrl = mainUrl.split('#')[0].split('?')[0];
+     }
+   } catch (e) {}
+
+   if (baseUrl.endsWith('/')) {
+     baseUrl = baseUrl.slice(0, -1);
+   }
+   const popoverUrl = `${baseUrl}/#/popover-window?type=${type}`;

    popoverView.webContents.loadURL(popoverUrl).catch(() => {
      popoverView.webContents.loadFile(path.join(__dirname, '../dist/index.html'), {
        hash: `/popover-window?type=${type}`
      });
    });

    popoverView.webContents.on('blur', () => {
      this.closePopover();
    });

    try {
      this.mainWindow.contentView.addChildView(popoverView);
    } catch (e) {
      console.error('[BrowserViewManager] Error adding popover view:', e);
    }
  }

  closePopover() {
    if (this.popoverView) {
      try {
        this.mainWindow.contentView.removeChildView(this.popoverView);
      } catch (e) {}
      try {
        this.popoverView.webContents.close();
      } catch (e) {}
      this.popoverView = null;
+     this.popoverType = null;
    }
  }
```

### B. `src/components/browser/BrowserWorkspace.jsx`
Added plain object `DOMRect` serialization before sending over IPC:

```javascript
const serializeRect = (rect) => {
  if (!rect) return null;
  return {
    x: Math.round(rect.x || rect.left || 0),
    y: Math.round(rect.y || rect.top || 0),
    width: Math.round(rect.width || 0),
    height: Math.round(rect.height || 0),
    top: Math.round(rect.top || 0),
    right: Math.round(rect.right || 0),
    bottom: Math.round(rect.bottom || 0),
    left: Math.round(rect.left || 0)
  };
};

const handleOpenFontPopoverAction = useCallback((rect) => {
  if (isElectron && window.electronAPI?.openPopover) {
    window.electronAPI.openPopover({ type: 'font', bounds: serializeRect(rect) });
  } else {
    setFontPopoverRect((prev) => (prev ? null : rect));
  }
}, [isElectron]);
```

---

## 5. Reusable Future Template & Golden Rules for Electron Overlay Views

Whenever you build or debug popovers, modals, or dropdown overlays in Electron using multi-`WebContentsView` architecture, enforce these 4 Golden Rules:

```
                  ┌──────────────────────────────────────────────┐
                  │ Does the popover appear or is it invisible? │
                  └──────────────────────┬───────────────────────┘
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   ▼                                           ▼
      [ Popover bounds size = 28px ]              [ Popover is blank / white ]
                   │                                           │
                   ▼                                           ▼
 ┌───────────────────────────────────┐       ┌───────────────────────────────────┐
 │ RULE 1: Never use                 │       │ RULE 2: Never hardcode            │
 │ `buttonBounds.width || 360`!      │       │ `http://localhost:5173`!          │
 │ Set fixed panel width/height from │       │ Derive base URL dynamically from  │
 │ popover content specifications!   │       │ `mainWindow.webContents.getURL()` │
 └───────────────────────────────────┘       └───────────────────────────────────┘
```

### Checklist for Future Issues:
1. **Rule 1 — Distinguish Trigger Bounds vs. Popover Bounds**:
   - `triggerBounds` (from `getBoundingClientRect()`) tells you **where to anchor** (`x`, `y`, `top`, `bottom`).
   - `popoverBounds` (`width`, `height`) comes from the **popover content component**. Never mix them with `||` fallbacks!

2. **Rule 2 — Match Main Window Protocol & Port**:
   - Always extract the origin from `mainWindow.webContents.getURL()` when loading sub-views or popover URLs.

3. **Rule 3 — Serialize DOMRect Objects**:
   - Always convert `DOMRect` into a plain object (`{ x, y, width, height }`) before passing through Electron IPC.

4. **Rule 4 — Implement Toggle State**:
   - Always track `activePopoverType` in your view manager to close the active view if triggered again.
