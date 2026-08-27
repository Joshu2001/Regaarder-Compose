# Post-Mortem: Workspace Screen Sharing, Anti-Mirror Architecture, and the Monolith Early-Return Trap

**Date:** 2026-08-27  
**Module:** Regaarder Room, Compose, Sheets, Decks, Whiteboard  
**Files Involved:**
- [`src/App.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/App.jsx)
- [`src/RoomLandingPage.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/RoomLandingPage.jsx)
- [`src/components/room/ScreenShareSourceModal.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/components/room/ScreenShareSourceModal.jsx)

---

## 1. Executive Summary

In multi-workspace productivity suites (Docs, Sheets, Decks, Whiteboard, Meetings), presenting live work requires a seamless bridge between WebRTC screen capture and the active editing canvas. During this feature rollout, three distinct engineering failures occurred:
1. **The Mock Canvas Illusion:** Simulated 2D canvas streams were used instead of native GPU window capture, causing real interactive DOM elements (like the Dictate button and live editing cursors) to be omitted.
2. **The Recursive Mirror Tunnel:** Capturing the application window while simultaneously viewing the meeting stage created an infinite video-in-video feedback loop.
3. **The Monolith Early-Return Trap:** In an 85,000+ line monolithic component (`App.jsx`), a global Picture-in-Picture (PIP) HUD portal placed at the bottom of the file failed to render on Sheets and Decks because `AppCore` had early return branches (`if (productMode === 'deck' || productMode === 'sheets') return (...)`).

This document details the first-principles investigation, the failed assumptions, the root causes, and the permanent architectural heuristics to ensure this failure mode is resolved instantly in the future.

---

## 2. Chronology of Failures, Hypotheses & Resolutions

### Phase 1: Mock 2D Canvas vs. Real GPU Window Capture

#### The Problem
The user noticed that in the mini PIP preview, the live stream did not reflect the real page: buttons like **Dictate**, active document tabs, and real-time cursor highlights were missing.

#### Why It Happened
An earlier implementation created a simulated 2D `<canvas>` (`startCleanDocCanvasStream()`) that drew placeholder white rectangles and simulated text lines. While this avoided Electron window permission dialogs, it was not capturing the running DOM.

#### The Resolution
- Replaced the mock canvas generator with direct native Chromium/Electron `desktopCapturer.getSources` and `navigator.mediaDevices.getUserMedia({ mandatory: { chromeMediaSource: 'desktop', chromeMediaSourceId: sourceId } })`.
- This captures the exact 60 FPS GPU compositor frame buffer containing all real DOM controls, buttons, toolbars, and cursor movements.

---

### Phase 2: The Infinite Recursive Mirror Tunnel

#### The Problem
When the presenter navigated from Documents back to the Room meeting page, the main video stage displayed an infinite recursive mirror tunnel (the video player was playing a recording of the screen that contains the video player).

#### Why It Happened
The meeting stage was set to render `<video srcObject={screenShareStream} autoPlay playsInline muted />` for both the presenter and the participants.

#### The Resolution (Google Meet / Zoom Standard)
- Presenters must **never** watch their own live window capture inside that same window.
- When `isScreenSharing` is active and the local user is viewing the Room stage, the main stage now renders an **Anti-Mirror Status Dashboard**:
  - Displays a clean status: *"You are presenting to everyone. To prevent recursive mirror tunnels, your screen is broadcasting in the background."*
  - Provides instant **[Stop Sharing]** and **[Return to Workspace]** actions.
- Remote participants continue receiving the 60 FPS WebRTC stream undisturbed.

---

### Phase 3: The Monolith Early-Return Trap (Why PIP HUD Vanished in Sheets & Decks)

#### The Problem
When presenting **Docs** (`productMode === 'compose'`), the floating draggable PIP HUD appeared in the bottom-right corner. But when selecting **Sheets** or **Decks**, the notification *"Streaming live workspace"* appeared, yet the floating PIP HUD was completely missing from the screen.

#### The Diagnostic Journey & False Hypotheses
1. *False Hypothesis 1 (Z-Index Occlusion):* Suspected that full-screen Canvas elements in Sheets/Whiteboard had a higher z-index (e.g., `z-[99999]`) that visually blocked the HUD.  
   *Test:* Wrapped the HUD in `createPortal(..., document.body)` with `z-[999999]`. The HUD still did not appear on Sheets or Decks.
2. *False Hypothesis 2 (State Eviction on Unmount):* Suspected that `RoomLandingPage` held the stream in local state and lost it when unmounting.  
   *Test:* Lifted stream state to `window.__currentScreenShareStream` and synchronized it to root `App.jsx`. The HUD still did not appear on Sheets or Decks.

#### The Root Cause (First-Principles Code Audit)
In `src/App.jsx`, `AppCore` is a large monolithic component. At line 47,956, the component had an **early return**:
```jsx
// Line 47,956 in App.jsx:
if (productMode === 'deck' || productMode === 'sheets') {
  return (
    <div ref={appShellRef} className="...">
      {/* Sheets and Decks workspace JSX (Lines 47,958 - 69,000) */}
    </div>
  );
}
```
The floating PIP HUD portal was placed at line 82,056 (inside the default `productMode === 'compose'` return branch). When `productMode` was `'sheets'` or `'deck'`, React executed the early return at line 47,956 and exited. **Line 82,056 was never evaluated.**

#### The Resolution
1. Encapsulated the HUD portal into a pure helper: `renderFloatingMeetingPipHud()`.
2. Injected `{renderFloatingMeetingPipHud()}` directly into:
   - The Sheets / Decks early return tree (`line 47,960`).
   - The DMs early return tree (`line 44,855`).
   - The Tasks early return tree (`line 46,467`).
   - The Main Workspace return tree (`line 71,288`).
3. Added draggable pointer tracking (`pipPosition: { x, y }`) so users can move the HUD anywhere across all apps.

---

## 3. First-Principles Mental Models

### The Aircraft Cockpit HUD Analogy
> If an airplane's heads-up display (HUD) is wired exclusively to the primary navigation display, switching to the radar screen or fuel management screen will shut off the HUD if the HUD's power line was routed inside the primary display's sub-circuit.
> To ensure the HUD stays in the pilot's vision at all times, the HUD must be wired directly to the main aircraft battery bus (the root component tree or universal early-return injection).

### The Monolithic Early-Return Guardrail
> In large React codebases with multiple top-level `if (mode) return (...)` branches, **no global overlay, portal, toast, or supervisor can exist solely in the trailing return statement.** It must either be hoisted into a thin wrapper shell above the branching logic, or explicitly invoked in every return branch.

---

## 4. Permanent Architectural Heuristics for Future Agents

1. **Global Portals in Branching Components:**
   When adding global overlays (PIP HUDs, AI floating widgets, Screen recording indicators, Command palettes) in components with early returns:
   - Check every instance of `return (` in the component.
   - If early returns exist, place the overlay helper in **every** return tree or lift it to the parent router shell (`App`).
2. **Native Window Capture Authenticity:**
   Never substitute real application capture with mock HTML5 canvas redraws unless explicitly requested for offline testing. Use native `chromeMediaSourceId` / `getDisplayMedia`.
3. **Presenter Loop Prevention:**
   When broadcasting the active application window, never display that broadcast feed inside the broadcasted window. Display a non-looping presenter dashboard instead.
4. **Draggable Portals on Canvas Surfaces:**
   Any floating HUD overlaid on interactive grids (Sheets) or infinite canvases (Whiteboard) must support free-form pointer dragging and portal mounting to prevent click interception or layer clipping.

---

## 5. Summary of Commits
- `17e0d7b`: Selective source picker, clean canvas presets, and initial anti-mirror stage.
- `c276a9f`: Global stream state lifting and draggable portal PIP HUD.
- `03e2d02`: Fix `createPortal` invocation reference.
- `f14fc2b`: Dynamic workspace routing and last-presented-mode continuity.
- `d678a4e`: Universal meeting supervisor and constructor stream retention.
- `c9e0937`: Fixed early-return JSX omission; HUD injected into Sheets and Decks return tree.
