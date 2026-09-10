# Postmortem: Electron Onboarding Overlay Stacking and Stale Renderer

**Date:** 2026-09-11  
**Status:** Resolved  
**Scope:** Compose onboarding cards in browser and Electron

## Summary

The onboarding cards appeared clipped, positioned incorrectly, or unchanged in Electron even though the Electron window was connected. Two separate issues were involved:

1. The running Electron process could load an old renderer bundle or an unrelated Vite server.
2. The onboarding component was rendered inside the React editor layout, so its large child `z-index` could not reliably escape parent stacking contexts created by the toolbar/editor shell.

The final solution was to render the onboarding overlay through a React portal attached to `document.body`, build the correct root renderer, and make the Electron development command start and target its own Vite server.

## What Was Wrong

### 1. Electron was connected to the wrong renderer source

`npm run dev:electron` originally ran only `electron .`. The Electron main process tried several ports, including `5173`, before falling back to `dist/index.html`.

That meant “connected” did not guarantee that Electron was showing the current workspace. It could connect to:

- A Vite server from another project already using port `5173`.
- A stale `dist/index.html` bundle.
- A different mirrored project directory than the one being edited.

The nested `Regaarder Compose/Regaarder Compose/dist` output was older than the root `Regaarder Compose/dist` output, which confirmed the stale-bundle risk.

### 2. The card `z-index` was not enough by itself

The tour was mounted inside the main React application tree. The toolbar and editor surfaces could establish their own stacking contexts. Increasing the card's `z-index` helped locally but did not guarantee that the card would paint above every ancestor-controlled layer.

The reliable fix was to use `createPortal(..., document.body)`. The overlay is now mounted at the document root, where its fixed positioning and `z-[999999]` layer can compete directly with the application chrome.

### 3. A highlight rectangle was mistaken for a target indicator

The top rectangle in the screenshot came from the Step 4 assistant halo:

```jsx
<div className="... fixed top-2 right-4 w-72 h-11 ..." />
```

It highlighted the old top-right target even though the card content was intended to point to a side control. The halo was removed rather than leaving a misleading target marker behind.

### 4. The callout tails described the wrong geometry

The Step 3 card used a right-side tail even though it sits beneath the workspace switcher. Step 4 used an upward tail even though the target is on the side.

The tails now match their targets:

- Step 3: top tail, directly beneath the workspace switcher.
- Step 4: right-side tail, toward the side panel/control.

## Fixes Applied

### Renderer and overlay

- Added `createPortal` to both onboarding component mirrors.
- Mounted the tour at `document.body`.
- Kept the overlay root at a high stacking layer.
- Changed Step 3 to an upward-pointing top tail.
- Changed Step 4 to a right-side tail.
- Updated Step 4 copy from “top right” to “side panel.”
- Removed the obsolete Step 4 top halo rectangle.

### Electron development workflow

Added `scripts/dev-electron.mjs`, which:

1. Starts this package's Vite server on port `5176`.
2. Waits until that server responds.
3. Starts Electron with `VITE_DEV_SERVER_URL=http://127.0.0.1:5176`.
4. Stops Vite when Electron exits.

Updated `package.json` so `npm run dev:electron` uses that launcher.

## Verification

- Root production renderer build completed successfully with `npm run build`.
- The changed onboarding components report no editor diagnostics.
- Electron launcher and main process pass Node syntax checks.

## Reusable Checklist

When an Electron UI change is not visible:

1. Confirm which URL Electron actually loaded, rather than assuming “connected” means current.
2. Check whether another Vite server owns the preferred port.
3. Compare source and `dist` timestamps.
4. Rebuild the same package directory referenced by Electron's `main` entry.
5. For overlays that must cross app-shell layers, render through a body-level React portal.
6. Treat trigger highlights and card tails as separate concerns: remove stale halos and align the tail with the actual target edge.
7. Verify the Electron command starts the matching Vite server instead of probing unrelated ports.

## Files Involved

- `src/components/AppleGestureOnboardingHotspots.jsx`
- `Regaarder Compose/src/components/AppleGestureOnboardingHotspots.jsx`
- `scripts/dev-electron.mjs`
- `package.json`
- `electron/main.cjs`
