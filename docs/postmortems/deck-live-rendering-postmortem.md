# Postmortem: Deck Sidebar Live Thumbnail Rendering & State Synchronization

**Incident Date:** August 31, 2026  
**Component:** Regaarder Deck — Sidebar Filmstrip & Canvas Snapshot Subsystem  
**Affected Files:** `src/App.jsx`  
**Status:** Resolved  

---

## 1. Executive Summary
In recent iterations, the slide deck filmstrip on the left sidebar ceased displaying real-time live miniature renders of the active slide. Instead, it rendered an arbitrary, static mock curve that failed to mirror the actual typography, background colors, 3D spline ribbons, or custom layouts placed on the canvas. 

Investigation revealed that an earlier working implementation (present in commit `0b1ec3e`) leveraged `html2canvas` DOM rasterization (`deckSnapshotPreviews[item.id]`), which had been inadvertently superseded by a hardcoded JSX placeholder block. Furthermore, the auto-capture `useEffect` lacked critical dependencies (`headline`, `blurb`, `backgroundColor`, `vectorWaveStyle`), preventing snapshots from re-triggering upon user edits.

---

## 2. Root Cause Analysis

### A. Bypassed Snapshot Pipeline
- In commit `0b1ec3e`, each slide thumbnail in the sidebar evaluated:
  ```jsx
  <img
    src={deckSnapshotPreviews[item.id] || buildDeckPreviewDataUri(item)}
    alt={`Slide preview ${item.title}`}
    className="w-full h-full object-cover"
    loading="lazy"
  />
  ```
- Subsequent edits replaced this dynamic image tag with an inline SVG block containing hardcoded bezier coordinates (`M 100 520 C 260 440...`). This broke the live synchronization mechanism completely.

### B. Incomplete React Effect Dependency Matrix
- The background `html2canvas` capture routine was defined as:
  ```javascript
  useEffect(() => {
    const timer = setTimeout(capturePreview, 220);
    return () => clearTimeout(timer);
  }, [
    isSheetsMode,
    productMode,
    activeDeckSlide?.id,
    activeDeckSlide?.title,
    activeDeckSlide?.subtitle,
    // MISSING: headline, blurb, backgroundColor, vectorWaveStyle, colors
  ]);
  ```
- Because user edits to the slide title, blurb, background, or theme motif did not change `activeDeckSlide.title` or `subtitle`, the effect never scheduled a new DOM capture.

---

## 3. Corrective Measures & Architecture

### 1. Dual-Tier Snapshot Rendering
Restored the proven snapshot architecture with an instant vector fallback:
- **Primary Tier (`deckSnapshotPreviews[item.id]`):** A debounced (220ms) high-fidelity PNG snapshot generated from `deckCanvasPreviewRef.current` by `html2canvas`. This guarantees 100% position, font, and asset fidelity.
- **Secondary Tier (`buildDeckPreviewDataUri(item)`):** An instant SVG data-URI generated immediately on mount or slide creation, preventing any empty or flashing thumbnails before the first raster capture completes.

### 2. Comprehensive Dependency Tracking
Expanded the React effect dependency array to monitor all visual slide state:
- `activeDeckSlide?.headline`
- `activeDeckSlide?.blurb`
- `activeDeckSlide?.backgroundColor`
- `activeDeckSlide?.vectorWaveStyle`
- `activeDeckSlide?.vectorColor1`
- `activeDeckSlide?.vectorColor2`

---

## 4. Prevention & Architectural Directives
1. **Never Replace Real DOM Capture with Synthetic Placeholders:** When an image-based live thumbnail pipeline is already in place, do not attempt to replicate arbitrary complex canvas DOM trees via separate static SVG mockups.
2. **Snapshot Invalidation Discipline:** Any state variable that alters the visual appearance of the slide canvas must be registered in the snapshot generator's dependency array.
3. **Build & Regression Verification:** Verify thumbnail updates visually across both slide creation and content editing phases.
