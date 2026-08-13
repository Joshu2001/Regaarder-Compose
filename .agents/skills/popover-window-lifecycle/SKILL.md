---
name: popover-window-lifecycle
description: Guidelines and architectural patterns for managing dual-host (Electron + React) popovers, preventing alwaysOnTop desktop leaks, avoiding unmount event bleed-through, and standardizing data-popover event handling.
---

# Popover Window & Overlay Lifecycle Guidelines

This skill provides architectural rules, diagnostic procedures, and code patterns for implementing floating popovers, dropdowns, and multi-window overlays in dual-host (Electron + React) applications.

---

## 1. Core Architectural Rules

### 1.1 Desktop Isolation (No `alwaysOnTop` Leaks)
- **Rule:** Never set `alwaysOnTop: true` on child Electron `BrowserWindow` instances used for application popovers or menus.
- **Why:** `alwaysOnTop: true` instructs the OS window manager to elevate the child window above all desktop windows (VSCode, IDEs, external web browsers).
- **Pattern:** Use `alwaysOnTop: false` and anchor child windows strictly to `parent: mainWindow`.

### 1.2 Unmount Event Bleed Deferral (`requestAnimationFrame`)
- **Rule:** Never unmount a menu or popover synchronously inside a `pointerdown` event handler when triggering a secondary popover or action.
- **Why:** Synchronously removing the DOM node mid-click causes the remaining `pointerup` and `click` events to land on whatever element is positioned behind the cursor (e.g. underlying webpage `<iframe` or canvas), triggering accidental outside-click dismissal.
- **Pattern:** Wrap `onClose()` calls inside `requestAnimationFrame(() => onClose?.())`.

```javascript
// ✅ Correct Pattern
const handleAction = (callback, e) => {
  e?.preventDefault();
  e?.stopPropagation();
  if (!callback) return;
  callback(anchorRect);
  requestAnimationFrame(() => {
    onClose?.();
  });
};
```

### 1.3 Sub-Menu Navigation (`forceOpen` Parameters)
- **Rule:** When navigating between popovers (Popover A → Popover B), do not use state toggling (`(prev) => (prev ? null : rect)`).
- **Pattern:** Use an explicit `forceOpen = false` parameter in state setter actions.

```javascript
const handleOpenFontPopoverAction = useCallback((rect, forceOpen = false) => {
  setUtilitiesPopoverRect(null);
  setFontPopoverRect((prev) => (forceOpen ? rect : (prev ? null : rect)));
}, []);
```

### 1.4 Outside-Click Dismissal Guards (`data-popover`)
- **Rule:** Every popover root `<div>` must include `data-popover`, `onPointerDown={(e) => e.stopPropagation()}`, and `onClick={(e) => e.stopPropagation()}`.
- **Why:** Global pointerdown handlers check `e.target?.closest?.('[data-popover]')` to prevent clicks on dividers or section headers inside popovers from race-closing the menu.

---

## 2. Standard Popover Component Template

```jsx
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export const StandardPopover = ({
  anchorRect,
  isStandalone = false,
  onClose
}) => {
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!anchorRect && !isStandalone) return null;

  const POPOVER_HEIGHT_ESTIMATE = 380;
  const spaceBelow = anchorRect ? window.innerHeight - (anchorRect.bottom + 6) : 999;
  const top = anchorRect
    ? spaceBelow >= POPOVER_HEIGHT_ESTIMATE
      ? Math.max(86, anchorRect.bottom + 6)
      : Math.max(8, anchorRect.top - POPOVER_HEIGHT_ESTIMATE - 6)
    : 86;
  const right = anchorRect ? Math.max(16, window.innerWidth - anchorRect.right) : 16;

  const handleAction = (callback, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (callback) callback(anchorRect);
    requestAnimationFrame(() => {
      onClose?.();
    });
  };

  const content = (
    <div
      ref={popoverRef}
      data-popover
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={isStandalone ? {} : { top: `${top}px`, right: `${Math.max(12, right)}px` }}
      className={`${
        isStandalone
          ? 'relative z-[100000] w-full max-w-sm border border-slate-200/90 dark:border-zinc-800/90 shadow-2xl p-1.5'
          : 'fixed z-[100000] w-64 border border-slate-200/90 dark:border-zinc-800/90 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.22),0_4px_16px_-4px_rgba(0,0,0,0.08)] p-1.5 animate-in zoom-in-95 fade-in duration-150'
      } bg-white dark:bg-[#1c1c1e] rounded-2xl font-sans select-none text-slate-800 dark:text-zinc-100 overflow-hidden`}
    >
      {/* Popover Content */}
    </div>
  );

  if (isStandalone) return content;

  const targetNode = document.fullscreenElement ?? document.body;
  return createPortal(content, targetNode);
};
```
