# Postmortem: Wrong-cell dropdown conversion in table editor

## Incident summary

During the “Convert to dropdown” workflow in the table editor, the UI could apply dropdown conversion to the wrong DOM cell: the far-left cell in the table would sometimes receive the dropdown HTML instead of the cell that the user had clicked or otherwise interacted with in the active toolbar context.

The symptoms were not deterministic across attempts. In one pass the user clicked a target cell and the apply flow selected the wrong cell; in a second pass, after state had been re-established, the same workflow behaved correctly. The user later clarified that the first click on the Apply button can be swallowed entirely — it never reaches the `handleApply()` branch because the target cell is not resolved; on a second attempt, the same modal can re-open with a stable target and the Apply button path executes normally. That suggested a stale-target resolution problem rather than a rendering-only defect.

## Impact

- A user-visible table action could mutate the HTML of a non-selected cell.
- The wrong DOM element could be persisted as the conversion target for the current modal workflow.
- Because the path was UI-driven and dependent on browser selection / ref timing, the result could look intermittent and non-reproducible without a checklist of the surrounding state.

## Detection

The issue was first surfaced during the table cell dropdown conversion UI flow. The evidence trail pointed to the popover application path, where the conversion target was not always derived from the same source of truth.

Observed symptom:

- Click a cell in the table.
- Launch the dropdown/popover conversion workflow.
- In the first attempt the wrong cell can become the conversion target and runtime DOM updates land in the far-left table cell.
- In the first modal pass, the Apply button click can be suppressed before the target node reaches `handleApply()`; there is no concrete HTML mutation, so it looks like the first press fails to trigger.
- In a second attempt the process can succeed because the cell context is now pinned through state and refs and does not depend on a stale browser selection path.

## Root-cause analysis

The root cause was a stale target-selection and fallback-selection chain in the editor.

Two contributing factors were present:

1. In the table toolbar / apply flow, the target cell resolution allowed a browser-selection fallback (`window.getSelection()` / derived `activeSelectionCell`) to influence the conversion target before the explicit clicked cell state was fully restored.
2. In the dropdown popover’s `resolveTargetCell()` / `handleApply()` path, a last-resort DOM fallback was too broad and effectively allowed a document-wide lookup to resolve a cell using a generic CSS selector, such as `td:focus`, `td.selected`, `table td`, or `.table-block td`.

That broad selector could resolve the first `td` discovered in the DOM shape, which in a table layout is often the top-left / furthest-left cell. This explains why the bad target appeared as “the far-left one always convert[s] the dropdown not the one I clicked.”

The persistence of the wrong target is consistent with two state channels in the UI:

- `focusedTableCell` (React state that points to the selected table cell)
- `lastFocusedTableCellRef` (ref storage intended to keep a stable target across pointer/focus events)

The failure was not necessarily that either state itself was invalid; the failure was that the code front-loaded a generic fallback path and a later resolution path that did not treat the fallback as an error condition.

## Timeline / chronology

### Initial symptom report

A user reported that the dropdown conversion flow selected the wrong cell after clicking a cell. The first attempt displayed the wrong destination in the UI and the second attempt behaved as expected.

### Investigation

The troubleshooting flow searched a sequence of symbol boundaries that the conversion action relies on:

- the app’s table-editing state (`focusedTableCell`)
- the “last focused” ref (`lastFocusedTableCellRef`)
- toolbar-level cell storage (`tableToolbar.cellEl`)
- popover modal resolution (`TableDropdownPopover`) and its `resolveTargetCell()` / `handleApply()` logic

The codebase confirmed that these different channels were independent enough to drift. The browser selection path (`activeSelectionCell`) can contain a stale range anchor or a selection state that describes a cell before the pointer-down / toolbar logic has settled.

### Attempts and failures

Attempt 1: One-way fallback from selection state

- We attempted to diagnose the race through the current selection object and “active selection cell” mechanics.
- Failure: browser selection and table focus order are too dependent on the browser’s native event ordering. A selection`getSelection()` can land on stale text that points to a cell from an earlier point in the timeline.

Attempt 2: Let the apply path resolve any generic table cell if it cannot determine a high-confidence target

- The popover code included a document-level fallback that resolved the first matching cell through a broad selector.
- Failure: that selector is non-deterministic enough to choose a table cell that is not user intent because it is simply the highest-priority DOM match and not a consumed, pinned current-cell pointer.

Attempt 3: Blindly rely on the last clicked/focused cell path

- The app did have `lastFocusedTableCellRef`, but it was not consistently used across the table toolbar and popover. That allowed refresh timing to skew the result.
- Failure: if the popover opened before the ref and state were synchronized, the apply logic could walk through `tableToolbar` / `focusedTableCell` / `lastFocusedTableCellRef` in a sequence that was not a strict source-of-truth order.

## Detailed resolution

The resolution was a defensive, higher-confidence target ordering and a safer failure mode.

The apply-flow hit a second-order symptom: because `handleApply()` depends on `resolveTargetCell()` and `resolveTargetCell()` can return `null` for the initial attempt, the first Apply press can be a live no-op. That is why the UI can look like the button never triggered. The second pass becomes available only after the same open flow gets a rehydrated cell context that survives the pointer lifecycle.

The application code now treats the target cell as an explicit context object, not a permissive CSS fallback.

### Code-level correction

The table dropdown button and toolbar entry point now select the current cell in this priority order:

1. `tableToolbar?.cellEl`
2. `focusedTableCell`
3. `lastFocusedTableCellRef.current`
4. only then `activeSelectionCell` or another browser-selection-oriented fallback

That means the conversion action no longer pushes a browser selection-derived cell ahead of the clearly-intended toolbar or React cell state.

The popover’s `resolveTargetCell()` path no longer tries to “recover” by selecting the first `table td` or a similarly broad DOM fallback. Instead it prefers the pinned active cell and refuses to invent a new fallback target from a global DOM query.

The resulting behavior is as follows:

- If the popover is opened from a stable and confirmed active cell, that exact DOM cell is used.
- If no high-confidence target can be derived, the popover does not quietly send the command to the top-left cell or another arbitrary element.
- The conversion target is now fail-closed where the old implementation was fail-open.

## Validation

After the code correction, the existing production Vite build was rerun for the affected editor package and completed successfully. This confirms the updated flow compiles and the previous stale-selector path is no longer in the active trust order for the build-included state.

## Learnings and preventive actions

1. Keep DOM resolution fail-closed: never default to `document.querySelector('table td')` or a similar first-match strategy when a user-targeted transformation should be constrained to a real, trusted cell.
2. Treat browser selection as an auxiliary signal, not the authoritative UI context, unless the table cell is proved stable and aligned with the current event sequence.
3. Keep strong source-of-truth ordering across all modal entry points: toolbar cell context, focused cell state, last-focused cell ref, and only then browser selection.
4. If a future modal can be opened from an editor UI state, it should store and verify a pinned active target at the exact pointer event boundary and reuse that same target for the entire workflow.
5. Instrument the input path where the first click / pointer-down / toolbar wiring / popover opening occurs so a future stale-cell symptom becomes visible in logs rather than only in a rare browser repro.

## Follow-up / future protection

The code now establishes an explicit priority chain, but this postmortem should be used as a pattern when auditing other table interaction features. Any operation that mutates an HTML cell, applies a popup action, or uses a `focus`/`selection` fallback should be reviewed against the same rules:

- no first `td` auto-guessing
- no selection-based target regeneration once a concrete cell is established
- no stale event ref crossing the modal lifecycle

That pattern is expected to generalize to any future conversion, formatting, dropdown, or HTML-injection action that is bound to a clicked table cell in this editor.
