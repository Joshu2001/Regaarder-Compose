---
name: product-launch-fullscreen
description: Post-mortem and checklist for ensuring all product experience launchers consistently call enterFullscreen(). Prevents partial launches where a product opens but remains windowed while all other products go fullscreen.
---

# Product Launcher Fullscreen Consistency

## Background

**Bug:** Tapping **Room** on the landing page launched the meeting UI but did not go fullscreen, while every other product (Compose, Deck, Sheets, Whiteboard, DM) correctly entered fullscreen mode.

**Root Cause:** `createRoomExperience()` was missing the `enterFullscreen()` call that all sibling launcher functions share as their first instruction. The meeting logic (`startMeetingNow`) was called directly without the prerequisite fullscreen request.

---

## Architectural Pattern

Every product experience launcher in this codebase follows this strict signature:

```js
const createXExperience = () => {
  enterFullscreen();          // <- ALWAYS FIRST
  setCreationPickerOpen(false);
  setProductMode('x');
  // ... product-specific state resets
  showToast('X workspace ready');
};
```

**`enterFullscreen()` must always be the first call.** It requests the Fullscreen API on `document.documentElement` and silently swallows errors (browser policy rejections, sandboxed iframes, etc.). Placing it first ensures the browser transitions before any state changes trigger re-renders.

---

## Diagnostic Checklist

When a product tapped from the landing page opens in windowed mode while others go fullscreen:

1. **Find the launcher function** — search for `create{ProductName}Experience` in `App.jsx`.
2. **Verify `enterFullscreen()` is the very first line** inside the function body.
3. **Check `openLandingWorkspace`** — confirm the `target === 'productname'` branch calls the correct launcher and does not fall through to a different code path.
4. **Check `createRoomExperience` specifically** — Room calls `startMeetingNow()` which is an async-ish side effect; always insert `enterFullscreen()` before it, never after.

---

## Fix Template

```diff
  const createRoomExperience = () => {
+   enterFullscreen();
    setCreationPickerOpen(false);
    setProductMode('room');
    setRightSidebarOpen(false);
    setLeftSidebarOpen(false);
    startMeetingNow(generateRoomCode());
  };
```

---

## Invariant Rule

> **Every `create*Experience` function that is reachable from the landing page MUST call `enterFullscreen()` as its first statement.** No exceptions. This is a contract, not a suggestion.

When adding a new product launcher, copy an existing launcher (e.g. `createDeckExperience`) as a scaffold and verify `enterFullscreen()` is present before wiring up the new product in `openLandingWorkspace`.

---

## Files Involved

| File | Role |
|---|---|
| `src/App.jsx` | Contains all `create*Experience` functions and `openLandingWorkspace` router |
| `src/RegaarderComposeLanding.jsx` | Landing grid — calls `onLaunch({ type: 'action', name: product.title })` |

---

## Related Skills

- `dropdown-focus-handling` — focus management patterns for overlays and menus
- `color-hierarchy-resolution` — visual hierarchy rules for product UI states
