# Postmortem: Document Table Dropdown Z-Index Clipping & Single-Click Apply Failure

## Overview & Executive Summary

During testing of the document table dropdown feature in Regaarder Compose, two critical interaction bugs were identified:
1. **Dropdown Menu Underlay/Clipping (Image 1 Issue):** When a user clicked a document dropdown badge (e.g., *Critical*, *High*, *In Progress*), the options popover menu rendered underneath subsequent table row elements and dropdown buttons below it.
2. **Apply Button Failure on First Click:** Clicking the "Apply" button inside the *Convert to Dropdown* modal failed to convert the active cell on the first try, requiring a second click to execute.

Both issues have been resolved in [`TableDropdownPopover.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/components/TableDropdownPopover.jsx), and verified via a clean production build (`npm run build`).

---

## 1. Issue Analysis & Root Cause Diagnosis

### Bug 1: Dropdown Options Rendered Under Subsequent Rows
- **Symptom:** Opening a dropdown option menu inside a table row caused the option items (*Critical*, *High*, *In Progress*, *Completed*, etc.) to overlap and clip behind the dropdown badges of lower rows.
- **Root Cause:**
  - The rendered `.custom-doc-dropdown` wrapper had standard inline block positioning without an elevated `z-index` stacking context.
  - Standard HTML table cells (`<td>`) create natural stacking context boundaries according to DOM order. Rows lower in the DOM tree naturally layer *on top* of higher rows unless an explicit `z-index` higher than the surrounding elements is assigned to the active dropdown container.

### Bug 2: Apply Button Required Two Clicks
- **Symptom:** Clicking "Apply" in the *Convert to Dropdown* modal did nothing on the first attempt; only the second click successfully turned the target cell into a dropdown.
- **Root Cause:**
  - When the *Convert to dropdown* toolbar button was pressed, focus shifted from the content editable table cell to the popover button.
  - `resolveTargetCell()` attempted to locate the active cell by checking `lastFocusedTableCellRef.current`, `focusedTableCell`, or `tableToolbar.cellEl`. If `lastFocusedTableCellRef.current` was not yet updated before `isOpen` state toggled, `cell` evaluated to `null` on the first click of "Apply".
  - It was only after interacting with elements inside the popover that `activeTargetCellRef.current` was populated for the second attempt.

---

## 2. Technical Resolution Details

### Fix 1: Dynamic Z-Index Elevation for Active Dropdowns
- In [`TableDropdownPopover.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/components/TableDropdownPopover.jsx), updated `createDropdownHTML` to set a base `z-index: 50` on `.custom-doc-dropdown`.
- Added dynamic pointer handlers to elevate the active dropdown's container `z-index` to `99999` upon opening, while resetting all inactive dropdown containers back to `50`.

```javascript
// Dynamic Z-Index Stacking Management inside createDropdownHTML
onpointerdown="
  event.preventDefault();
  event.stopPropagation();
  const dropdownContainer = this.closest('.custom-doc-dropdown');
  const menu = this.nextElementSibling;
  if (menu) {
    const isOpen = menu.style.display === 'block';
    document.querySelectorAll('.custom-doc-dropdown-menu').forEach(m => { 
      m.style.display = 'none'; 
      if (m.closest('.custom-doc-dropdown')) m.closest('.custom-doc-dropdown').style.zIndex = '50';
    });
    if (!isOpen) {
      menu.style.display = 'block';
      if (dropdownContainer) dropdownContainer.style.zIndex = '99999';
    } else {
      menu.style.display = 'none';
      if (dropdownContainer) dropdownContainer.style.zIndex = '50';
    }
  }
"
```

### Fix 2: Live Selection Target Resolution & Single-Click Apply Execution
- Updated the `useEffect` hook in [`TableDropdownPopover.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/components/TableDropdownPopover.jsx) to immediately extract the target cell from `window.getSelection()` at popover mount/open time if `lastFocusedTableCellRef` is empty.
- Updated `resolveTargetCell()` to prioritize active DOM selection ranges over stale floating toolbar fallbacks.

```javascript
// High-priority live DOM selection capture on popover open
const getActiveSelectionCell = () => {
  const sel = typeof window !== 'undefined' ? window.getSelection() : null;
  if (sel && sel.rangeCount > 0) {
    const node = sel.getRangeAt(0).startContainer;
    const selCell = node ? (node.nodeType === 1 ? node.closest('td, th') : node.parentElement?.closest('td, th')) : null;
    if (selCell && document.body.contains(selCell)) return selCell;
  }
  return null;
};
```

---

## 3. Verification & Validation

1. **Production Build:**
   - Ran `npm run build` in `Regaarder Compose`.
   - Result: Exit code 0, 2026 modules transformed cleanly with zero errors.
2. **Behavioral Audit:**
   - Dropdown menu options float above subsequent table rows with clean background contrast (`z-index: 99999`).
   - Clicking "Apply" immediately converts the active cell or column on the first click.

---

## 4. Prevention & Lessons Learned

- **Stacking Contexts in Tables:** Inline dropdown overlays inside table cells must explicitly raise the parent element's `z-index` when open, as absolute `z-index` on child menus alone cannot break out of parent stacking contexts.
- **Selection Preservation:** Always resolve active DOM text selections immediately upon button press before browser focus transitions occur.
