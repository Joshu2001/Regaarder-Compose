# Postmortem: Deck Fullscreen Presentation Mode Execution Failure

**Date:** 2026-08-24  
**Severity:** High — Presentation mode failed to render across the Deck workspace  
**Status:** Resolved  

---

## 1. Executive Summary

When clicking the **"Present"** button (formerly *"Fullscreen Presentation Mode"*) in the Slide Deck workspace, the application hid the top header bar (containing Share and Export controls), but failed to enter fullscreen presentation mode. The slide canvas remained small in the center, and the thumbnail sidebar, document tab strip, and floating sub-header toolbar remained visible on screen.

---

## 2. Incident Timeline

| Phase | Event / Observation | Diagnosis & Action |
|-------|-------------------|-------------------|
| **Phase 1** | Button label shortened to "Present" | Applied minimalist Apple-grade styling and tooltips to the deck toolbar. |
| **Phase 2** | User clicked "Present" — only the top bar vanished | The app entered `isDeckPresentationMode = true`, hiding the top header, but the presentation overlay never appeared. |
| **Phase 3** | Deep Control-Flow & AST Analysis | Discovered `AppCore` utilizes a **Dual-Tree Return Architecture**: Tree 1 for Deck/Sheets (`lines ~46839–68312`) and Tree 2 for Compose (`lines ~68811–83171`). |
| **Phase 4** | Root Cause Pinpointed | The Presentation Overlay component was located exclusively inside **Tree 2**, which was completely unreachable when `productMode === 'deck'`. |
| **Phase 5** | Solution & Verification | Injected a portaled edge-to-edge Presentation Viewer directly into **Tree 1**, verified build compilation (`npm run build` succeeded with zero errors in 1m 36s). |

---

## 3. Root Cause Analysis

### The Dual-Tree Monolith Dilemma
In `src/App.jsx`, `AppCore` contains separate top-level JSX return blocks depending on `productMode`:

1. **Tree 1 (`productMode === 'deck' || productMode === 'sheets'`):** Evaluated from line `46839` to `68312`.
2. **Tree 2 (Compose / Docs Workspace):** Evaluated from line `68811` to `83171`.

```
                    ┌────────────────────────────────────────┐
                    │          function AppCore()            │
                    └───────────────────┬────────────────────┘
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 ▼                                             ▼
  [productMode === 'deck']                       [productMode === 'compose']
        Tree 1 Return                                  Tree 2 Return
    (Lines 46839 - 68312)                          (Lines 68811 - 83171)
   ───────────────────────                        ───────────────────────
   • Hides Header via                             • Contained the Presentation
     `!isDeckPresentationMode`                      Overlay JSX at Line 82862
   • MISSING Presentation                         • NEVER REACHED in Deck mode!
     Overlay JSX!                                   (Dead Branch for Decks)
```

### The State vs. Render Disconnect
When `handleStartDeckPresentation()` executed:
1. `setIsDeckPresentationMode(true)` triggered a React re-render.
2. In **Tree 1**, `{!isSheetsPresentationMode && !isDeckPresentationMode && <Header />}` evaluated `!isDeckPresentationMode` to `false`, correctly unmounting the top bar.
3. However, Tree 1 returned immediately at line `68312` without rendering the Presentation Overlay.
4. The Presentation Overlay JSX sat at line `82862` inside **Tree 2**, meaning it was physically impossible for React to mount the overlay while in Deck mode.

---

## 4. Engineering Solution

### A. Tree 1 Portal Injection
The Presentation Overlay was integrated directly into the Deck/Sheets return tree (`Tree 1`) right before its closing container tag using `createPortal(..., document.body)`:

```jsx
{/* ── Layer 7: Presentation Deck Fullscreen Mode Overlay ──────────────── */}
{isDeckPresentationMode && typeof document !== 'undefined' && createPortal(
  <div 
    className="fixed inset-0 z-[99999999] w-screen h-screen bg-zinc-950 text-white flex flex-col min-w-0 min-h-0 select-none animate-in fade-in duration-200"
    style={{ zIndex: 99999999, position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
  >
    {/* Presentation Header, Slide Canvas, Dynamic Waves, Bento Cards, Controls */}
  </div>,
  document.body
)}
```

### B. High-Fidelity Presenter View Features
- **True Edge-to-Edge Isolation:** Bypasses all layout bounds, scroll containers, and sidebar margins.
- **Dynamic Slide Layouts:** Renders active slide headlines, section badges, presenter tags, bento cards, status/priority controls, and vector background curves.
- **Unified Navigation:** Keyboard shortcuts (`←`/`→`/`Space`/`Esc`) and slide-picker numbers.
- **Native Fullscreen Trigger:** Calls `document.documentElement.requestFullscreen()` with graceful fallback.

---

## 5. Architectural Directives & Prevention Rules

1. **Global Overlays Must Span All Return Branches:**  
   In multi-branch React components, global layers (modals, presentation modes, toasts, and popovers) must be present across all return branches, or hoisted outside the branch condition into a unified top-level shell.
2. **Mandatory Portal Target for Fullscreen Views:**  
   Fullscreen viewers must always use `createPortal(..., document.body)` with explicit viewport styles (`w-screen h-screen fixed inset-0`) to prevent containment by parent layout constraints (`overflow: hidden`).
3. **Single Source of Truth for State Triggers:**  
   When adding a state flag (e.g. `isDeckPresentationMode`) that disables UI in one branch, verify that the corresponding positive UI handler exists in that *same* branch.
