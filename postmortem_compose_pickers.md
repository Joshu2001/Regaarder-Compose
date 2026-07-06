# Postmortem: Compose Mode Shared Chart & Shape Pickers Bug

**Date:** July 6, 2026  
**Author:** Antigravity (AI Coding Assistant)  
**Status:** Completed & Resolved  

---

## 1. Summary & Impact
When users in **Compose** mode typed `/` and selected **Chart / Graph** or **Shapes**, the picker menus either did not appear at all, or forced a transition into the Sheets layout. Selecting an option did not successfully insert the element back into the Compose document context, breaking the inline flow.

---

## 2. Root Cause Analysis
Upon deep tracing of `src/App.jsx`, we discovered the following structural layout:
- The `App` component chooses which UI shell to render using three disjointed top-level `return` statements determined by `productMode`:
  1. `if (productMode === 'deck' || productMode === 'sheets') { return (...); }`
  2. `if (productMode === 'room' && roomState !== 'active') { return (...); }`
  3. Default `return (...)` (handles `'compose'` and active rooms).

- The rich, full-featured `sheetChartMenu` and `sheetShapeMenu` picker elements were originally coded inline *only* inside the first `return` block (Sheets/Deck).
- Consequently, when `productMode` was `'compose'`, the default return block was executed, rendering the pickers completely absent from the DOM. Any attempt to set their state to `open: true` had no visual effect.

---

## 3. Resolution & Implementation
To provide a premium, unified user experience across workspaces without duplicating massive blocks of JSX, we refactored the picker architecture:

1. **Extraction**: Moved the inline picker JSX definitions (approx. 250 lines of complex markup, icons, category mappings, and handlers) into unified helper render methods in the component body:
   - `renderSharedChartPicker()`
   - `renderSharedShapePicker()`
2. **Double-binding**: Called both helper functions in the Sheets/Deck return statement *and* at the bottom of the default Compose return statement.
3. **Internal Routing**: Maintained the picker logic's self-contained check on `!isSheetsMode`. When triggered from Compose, the pickers automatically delegate to `insertInlineChartBoxWithType` and `insertInlineShapeBoxWithType` using the active text range, then close gracefully while retaining the Compose context.

---

## 4. Lessons Learned for Future Tasks

### A. Trace Conditional Returns in Monolithic Components
When debugging global modal or overlay rendering issues in massive React files (e.g., `App.jsx` exceeding 40k lines), **never assume a component renders globally**. Always identify the exact `return` statement executed for the target `productMode` and check for duplicate or missing DOM mount points.

### B. Leverage Render Helpers Over Duplicate JSX
When sharing large, state-heavy UI overlays across disjointed layout branches:
- Do not duplicate the markup (increases code footprint and maintenance overhead).
- Extracting to component-scoped helpers (e.g., `renderSharedComponent = () => { ... }`) retains access to all hooks, state-setters, refs, and dependencies via lexical closure without needing verbose prop drilling.

### C. Mode-Aware State Cleansers
When sharing components, ensure that trigger ranges/anchors are carefully guarded (e.g., passing `savedRange` for editor cursors vs. `anchorCell` for cell coordinates) to prevent one mode's data payload from poisoning the other.
