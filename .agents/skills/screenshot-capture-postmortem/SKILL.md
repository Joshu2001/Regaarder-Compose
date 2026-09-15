---
name: screenshot-capture-postmortem
description: >
  Post-mortem and permanent architectural reference for the Regaarder Compose
  screenshot capture system. Read this before touching any screen-capture,
  html2canvas, or getDisplayMedia code in this codebase.
---

# Post-Mortem: Blank Screenshot in Feedback Modal

**Date:** 2026-09-16
**Severity:** High (feature completely non-functional across all Electron builds)
**Resolution Time:** ~3 sessions (~4 hours of iterative debugging)
**Status:** Resolved ✅

---

## 1. What Happened

The "Capture screenshot" action in the Regaarder Feedback Modal (`RegaarderFeedbackModal.jsx`)
consistently produced a blank or solid-colour image in the lightbox preview — first a dark
`#1e1e24` rectangle, then a white `#F8F9FA` rectangle — regardless of what was on screen.

The user flow:
1. Open Feedback modal → click **Capture screenshot**
2. Modal hides, snipper overlay opens
3. User drags to select region → clicks Attach
4. Thumbnail appears in modal — but tapping it shows a **blank white/dark rectangle**

No errors were thrown. The feature appeared to work but silently produced garbage output.

---

## 2. Root Cause Analysis

### Primary Root Cause — `html2canvas` Cannot Paint Electron's Composited Layers

`html2canvas` works by walking the DOM and re-painting each element onto a `<canvas>` using
the Canvas 2D API. This approach fundamentally fails in Electron for two reasons:

**A) GPU compositing is opaque to `html2canvas`.**
Electron's renderer uses Chromium's GPU process for compositing layers, `backdrop-filter`,
CSS `filter`, `transform: translateZ(0)`, and hardware-accelerated surfaces. The Canvas 2D
`drawImage` API cannot read back from GPU-composited surfaces — it only sees what the CPU
paint layer exposes. In practice this means the canvas is filled with the `backgroundColor`
option (`#F8F9FA`) and nothing meaningful is drawn on top.

**B) `useCORS: true` + `allowTaint: true` are mutually exclusive.**
Using both options simultaneously triggers a silent internal conflict in `html2canvas` that
causes the render pipeline to abort canvas composition early, producing a canvas that only
contains the background fill. The library does not throw — it resolves the promise with a
broken (but technically valid) canvas object.

### Secondary Root Cause — `drawImage` Source Dimension Bug

Even if `html2canvas` had produced a valid canvas, the crop in `handleFinishAndCrop`
(`ScreenSnipperOverlay.jsx`) was incorrectly written:

```js
// WRONG — both source and destination used targetWidth/targetHeight
ctx.drawImage(
  capturedCanvas,
  srcX, srcY,
  targetWidth,   // ← this is the DESTINATION width, not the source slice width
  targetHeight,  // ← same problem
  0, 0,
  targetWidth, targetHeight
);
```

The correct 9-argument `drawImage` signature separates source slice dimensions from
destination dimensions:

```js
// CORRECT
const srcW = Math.round(finalSelection.width * dpr);
const srcH = Math.round(finalSelection.height * dpr);
ctx.drawImage(capturedCanvas, srcX, srcY, srcW, srcH, 0, 0, targetWidth, targetHeight);
```

When a sub-region is selected (e.g. a 400×300 box on a 1920×1080 canvas), the source slice
must be `selection.width * dpr` × `selection.height * dpr` canvas pixels — not the output
dimensions. Reusing `targetWidth`/`targetHeight` sampled a misaligned region of the canvas,
compounding the blank output.

### Timeline of Failed Attempts

| Attempt | Approach | Outcome |
|---|---|---|
| 1 | `html2canvas(document.body)` | Black rectangle (GPU layer opaque) |
| 2 | Added `allowTaint: true` + `useCORS: true` | White rectangle (options conflict, fills only) |
| 3 | Added `scale`, `windowWidth/Height`, `ignoreElements` | Still white rectangle |
| 4 | Sequencing fix: hide modal → wait 60ms → capture | Still white (not a sequencing issue) |
| ✅ 5 | `getDisplayMedia` + `ImageCapture.grabFrame()` | Pixel-perfect capture |

---

## 3. Resolution

### Replace `html2canvas` with `getDisplayMedia` + `ImageCapture`

The correct architecture for pixel-perfect screen capture in Electron is identical to the
approach used for screen recording — `getDisplayMedia`. The OS handles compositing,
GPU surfaces, and all layer merging before handing us a `VideoFrame`/`ImageBitmap`.

```js
const stream = await navigator.mediaDevices.getDisplayMedia({
  video: { frameRate: { ideal: 1, max: 5 } },
  audio: false,
  preferCurrentTab: true,
});

const videoTrack = stream.getVideoTracks()[0];

// ImageCapture.grabFrame() returns an ImageBitmap — no video element needed
const imageCapture = new ImageCapture(videoTrack);
const bitmap = await imageCapture.grabFrame();

// Stop stream immediately — we only needed one frame
stream.getTracks().forEach((t) => t.stop());

// Paint onto a persistent canvas for ScreenSnipperOverlay
const canvas = document.createElement('canvas');
canvas.width = bitmap.width;
canvas.height = bitmap.height;
canvas.getContext('2d').drawImage(bitmap, 0, 0);
bitmap.close(); // release GPU memory

setCapturedCanvas(canvas);
setIsSnipperOpen(true);
```

**User-facing experience:** Same OS screen/window picker the recorder uses. User picks their
window, we grab one frame and immediately stop the stream. The snipper overlay then opens
with a frozen pixel-perfect replica of whatever was on screen.

**Fallback** (when `ImageCapture` is unavailable): draw a `<video>` element to canvas after
a 120ms play delay.

**On user dismissal** (`NotAllowedError`): catch silently and restore `isModalHidden = false`.
Never open the snipper with a null canvas.

### Fix `drawImage` Crop Dimensions

```js
const srcX = Math.round(finalSelection.x * dpr);
const srcY = Math.round(finalSelection.y * dpr);
const srcW = Math.round(finalSelection.width * dpr);   // source slice width
const srcH = Math.round(finalSelection.height * dpr);  // source slice height

ctx.drawImage(capturedCanvas, srcX, srcY, srcW, srcH, 0, 0, targetWidth, targetHeight);
```

---

## 4. Lessons Learned

### L1 — `html2canvas` is not safe to use in Electron
Never use `html2canvas` to capture UI content in an Electron app. Electron's Chromium
renderer composites through the GPU process. `html2canvas` only sees CPU paint layers and
will silently produce blank or background-only output. There is no workaround for this —
it is a fundamental architectural incompatibility.

**Rule:** In this codebase, any screen capture requirement must use `getDisplayMedia` or
Electron's native `desktopCapturer` IPC API.

### L2 — `useCORS: true` and `allowTaint: true` are mutually exclusive in `html2canvas`
These two options conflict. Using both causes silent render abort. If `html2canvas` must
ever be used in a non-Electron context, use exactly one of them — never both.

### L3 — Always verify `drawImage` source vs destination dimensions independently
The 9-argument form of `drawImage` is:
```
ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
```
`sWidth`/`sHeight` = how many pixels to read from the source image.
`dWidth`/`dHeight` = how large to render in the destination canvas.
These are independent. For a DPR-scaled crop, `sWidth = selectionWidth * dpr` and
`dWidth = selectionWidth` (or `targetWidth`). Never alias one to the other.

### L4 — Silent canvas failures are invisible in development
Both bugs produced no console errors and no thrown exceptions. The only signal was a
visually blank image. Always add a size sanity check when dealing with canvas capture:
```js
console.log('[capture]', canvas.width, canvas.height, canvas.toDataURL().slice(0, 80));
```
A healthy canvas will show non-trivial base64 beyond the header; a blank one will be
a short uniform string.

### L5 — `getDisplayMedia` is the universal Electron capture primitive
For screenshots, recordings, and any pixel-level inspection of the rendered screen,
`getDisplayMedia` is the correct primitive. It does not require IPC, works in the renderer
process, and produces composited native frames. `ImageCapture.grabFrame()` is the cleanest
single-frame extraction path; a video-element fallback covers older Chromium versions.

---

## 5. Files Changed in Resolution

| File | Change |
|---|---|
| `src/components/feedback/RegaarderFeedbackModal.jsx` | Removed html2canvas import; replaced handleStartScreenshotSnipper with getDisplayMedia + ImageCapture frame grab |
| `src/components/feedback/ScreenSnipperOverlay.jsx` | Fixed drawImage source slice dimensions in handleFinishAndCrop |

---

## 6. Permanent Architectural Invariants

> These must never be violated in future work on this codebase:

1. **No `html2canvas` in Electron renderer code.** If the package is used elsewhere, it must be scoped to non-Electron build targets only.
2. **Screenshot capture → `getDisplayMedia` only.** Use `ImageCapture.grabFrame()` for single frames; use `MediaRecorder` for ongoing streams.
3. **`drawImage` 9-arg form:** Always compute `srcW`/`srcH` from the source image's coordinate space (CSS pixels × dpr). Never reuse destination dimensions as source dimensions.
4. **Never open `ScreenSnipperOverlay` without a valid canvas.** If capture fails or the user dismisses the picker, restore `isModalHidden = false` and do not mount the snipper.
