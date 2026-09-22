# Whiteboard → Notes State Bleed — Post-Mortem & Fix Reference

**name:** whiteboard-notes-state-bleed  
**description:** Post-mortem and permanent architectural reference for the Whiteboard → Notes "Frankenstein" rendering bug where the whiteboard canvas persisted on top of the Notes workspace after switching modes. Read this before touching any productMode, activeRightTab, or workspace-switching logic in App.jsx.

---

## 1. Symptom

After switching directly from **Whiteboard → Notes**, the Notes workspace rendered as a hybrid "Frankenstein" creature — partly the whiteboard canvas (dotted grid, tool sidebar, etc.) and partly the Notes UI layered on top of each other.

The bug only occurred on the **direct Whiteboard → Notes path**. Switching through any other workspace first (e.g. Compose → Notes) worked perfectly because those paths never set `activeRightTab = 'whiteboard'`.

---

## 2. Root Cause

The whiteboard canvas is guarded by a dual-condition check:

```jsx
// App.jsx ~L78516
{(productMode === 'whiteboard' || activeRightTab === 'whiteboard') && (
  <div className="absolute inset-0 z-30 ...">
    {/* whiteboard canvas, tool sidebar, pan/zoom, etc. */}
  </div>
)}
```

`createWhiteboardExperience()` sets **both** flags on entry:

```js
setProductMode('whiteboard');      // L34996
setActiveRightTab('whiteboard');   // L35005
```

`createNotesExperience()` only cleared one of them:

```js
setProductMode('notes');   // ✅ — disables first condition
// setActiveRightTab ???    // ❌ — NEVER CALLED — second condition stays true
```

Because `activeRightTab` was left as `'whiteboard'`, the canvas render guard's second arm remained `true`, keeping the entire whiteboard canvas mounted and visible even while Notes was active. The two workspaces literally coexisted in the DOM, z-stacked on top of each other.

### Why the First Fix Attempt Missed This

The first investigation focused on `isWhiteboardTopNavRevealed` and the auto-hide top nav system — which was a real but *secondary* symptom. The primary cause (canvas mount persisting via `activeRightTab`) was overlooked because:

- The canvas guard uses **two independent state variables** (`productMode` AND `activeRightTab`) joined by `||`
- The investigation traced only `productMode` transitions, not `activeRightTab`
- `activeRightTab` is a right-panel tab system value (`'chat' | 'assistant' | 'whiteboard' | 'tasks' | ...`) — it doubles as a workspace activator for whiteboard but is otherwise unrelated to workspace identity

---

## 3. The Fix

**File:** `src/App.jsx`  
**Function:** `createNotesExperience()` (~L34488)  
**Commit:** `67cbee9`

Added `setActiveRightTab('room')` alongside the existing whiteboard state resets:

```js
const createNotesExperience = (options = {}) => {
  setCreationPickerOpen(false);
  setProductMode('notes');
  setFocusedModule('notes');
  setDockedModules([]);
  setRoomPanelMode('docked');
  setLeftSidebarOpen(false);
  setActiveDocView('document');

  // ✅ FIX: Clear activeRightTab so the whiteboard canvas render guard
  // (productMode === 'whiteboard' || activeRightTab === 'whiteboard') deactivates.
  // Without this, the whiteboard canvas remains mounted after switching Whiteboard → Notes
  // because activeRightTab was set to 'whiteboard' by createWhiteboardExperience and
  // never cleared — causing the "Frankenstein" hybrid rendering bug.
  setActiveRightTab('room');

  // Reset whiteboard hover/reveal state so the top nav is never stuck in
  // auto-hide mode when switching from Whiteboard → Notes.
  setIsWhiteboardTopNavHovered(false);
  setIsWhiteboardInitialPeek(false);

  // ... rest of note document creation
};
```

---

## 4. Architectural Invariant — Enforce Going Forward

> **Rule:** Any `createXxxExperience()` function that transitions *away from* Whiteboard **MUST** call `setActiveRightTab('room')` (or any non-`'whiteboard'` value) to invalidate the canvas render guard's second arm.

The whiteboard canvas uses a **dual-key activation pattern**:

| Flag | Set by | Clears when |
|------|--------|-------------|
| `productMode === 'whiteboard'` | `createWhiteboardExperience()` | Any `setProductMode(x)` where x ≠ `'whiteboard'` |
| `activeRightTab === 'whiteboard'` | `createWhiteboardExperience()` | **Must be explicitly reset by the destination workspace** |

Both conditions must be false for the canvas to unmount. Clearing only one is insufficient.

### Workspaces that currently clear activeRightTab correctly

| Destination | Clears activeRightTab? |
|-------------|------------------------|
| Notes (`createNotesExperience`) | ✅ Yes — `setActiveRightTab('room')` added in commit `67cbee9` |
| Compose (`switchDocument`) | ✅ Yes — `if (activeRightTab === 'whiteboard') setActiveRightTab('assistant')` at L34097 |
| Deck (`createDeckExperience`) | ⚠️ Not verified — should be audited |
| Sheets | ⚠️ Not verified — should be audited |

---

## 5. File Map

| File | Relevant Lines | Purpose |
|------|---------------|---------|
| `src/App.jsx` | ~L34488 | `createNotesExperience()` — where the fix lives |
| `src/App.jsx` | ~L34990 | `createWhiteboardExperience()` — sets both flags |
| `src/App.jsx` | ~L34097 | `switchDocument()` — clears activeRightTab for compose path |
| `src/App.jsx` | ~L78516 | Whiteboard canvas render guard (`productMode \|\| activeRightTab`) |
| `src/App.jsx` | ~L38154 | `isWhiteboardWorkspace` derived constant |
| `src/App.jsx` | ~L38159 | `isWhiteboardTopNavRevealed` — top nav auto-hide logic |

---

## 6. Timeline of Commits

| Commit | Description |
|--------|-------------|
| `8b5207a` | First fix attempt — addressed top nav state bleed only (incomplete) |
| `67cbee9` | **True root fix** — `setActiveRightTab('room')` in `createNotesExperience()` |
