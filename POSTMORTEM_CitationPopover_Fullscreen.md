# Postmortem: CitationPopover Invisible in Immersive Fullscreen Mode

**Date:** 2026-08-10  
**Severity:** High — feature completely non-functional in the primary writing mode  
**Status:** Resolved  

---

## Summary

The **Insert Citation** popover was completely invisible and unclickable whenever the
document was in immersive fullscreen mode (triggered by the Maximize button in the Review
toolbar or by double-clicking the canvas). Exiting fullscreen caused the popover to
"reappear" if it had been opened while invisible. Re-entering fullscreen and clicking
the button again produced no visible result.

---

## Timeline

| Time | Event |
|------|-------|
| Bug reported | User reports popover stays open on fullscreen exit; does not show in fullscreen |
| First attempt | Diagnosed as a React state problem — added `citationPopoverKey` counter to force re-mounts and `closeCitationPopover()` in both immersive-exit paths |
| Still broken | User confirms same behaviour after first fix |
| Root cause found | Identified as a browser compositor constraint, not a React state issue |
| Fix applied | One-line change to `CitationPopover.jsx`: portal target changed from `document.body` to `document.fullscreenElement ?? document.body` |

---

## Root Cause

### The Browser Fullscreen Compositor Contract

When the browser enters **native fullscreen** via the Fullscreen API
(`element.requestFullscreen()`), the browser compositor physically elevates the
`document.fullscreenElement` to the top of its rendering stack. This is a
**browser-level guarantee**, not a CSS concern.

**CSS `z-index` has no influence over this layer separation.**

Any DOM node that lives *outside* the `fullscreenElement` subtree — regardless of its
`z-index`, `position`, or stacking context — is rendered behind the fullscreen surface
and receives no pointer events.

### How This Broke the Popover

`CitationPopover` uses `ReactDOM.createPortal(content, document.body)`. In windowed
mode this works fine — `document.body` is the top-level layout root. But when the user
activated immersive mode:

1. `appShellRef.current.requestFullscreen()` elevated the app shell to the fullscreen
   compositor layer.
2. The portal continued to inject the popover into `document.body`, which now sat
   **beneath** the fullscreen layer.
3. The popover rendered, its state was `open: true`, but the browser never painted it
   to the screen and never delivered pointer events to it.
4. On fullscreen **exit**, `document.body` returned to full visibility — and the popover
   "reappeared" from its never-closed open state, creating the illusion that exiting
   fullscreen was what opened it.

### Why First Principles Matter Here

The first fix attempt diagnosed the symptom (popover appears on exit, doesn't appear on
re-entry) as a **React state coherence issue** and applied React-layer solutions
(forced re-mounts, stable close callbacks). These were structurally sound improvements
but could not resolve an issue that existed entirely below React's abstraction layer —
in the browser's native compositing pipeline.

The correct frame: *"Where in the DOM does the portal inject its content, and is that
node visible to the browser compositor?"*

---

## Fix

**File:** `src/components/CitationPopover.jsx`  
**Change:** One line — the `createPortal` target.

```diff
- document.body
+ document.fullscreenElement ?? document.body
```

When native fullscreen is active, `document.fullscreenElement` is the `appShellRef`
node — the exact element the compositor is rendering. Portaling into it places the
popover inside the visible fullscreen surface. In windowed or CSS-only immersive mode,
`document.fullscreenElement` is `null` and the portal falls back to `document.body`
as before.

---

## Retained Improvements from First Fix

The React-layer changes applied during the first attempt are retained as genuine
quality improvements, independent of the root cause:

| Change | Rationale |
|--------|-----------|
| `closeCitationPopover()` on immersive exit | Prevents stale-open state; popover with a stale `anchorRect` from fullscreen coordinates would misposition in windowed mode |
| `openCitationPopover()` with key counter | Forces a clean re-mount on every open — eliminates the case where rapid open/close cycles left the form in a dirty state |
| Stable `onClose={closeCitationPopover}` prop | Avoids recreating the close callback on every render |

---

## Generalised Rule

> **Any `createPortal` that renders interactive UI (modals, tooltips, popovers) must
> portal into `document.fullscreenElement` when native fullscreen is active.**
> `document.body` is not the compositor root in fullscreen; `fullscreenElement` is.

Pattern to follow for all future portal-based overlays in this codebase:

```js
const portalTarget = document.fullscreenElement ?? document.body;
return createPortal(content, portalTarget);
```

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/CitationPopover.jsx` | Portal target: `document.fullscreenElement ?? document.body` |
| `src/App.jsx` | `closeCitationPopover()` on both immersive exit paths; `openCitationPopover()` with key counter at both call-sites; stable `onClose` prop |
