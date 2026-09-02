# POSTMORTEM: Slash Menu Unreachable Return Branch & Accidental Coloring Resolution

**Date:** September 2, 2026  
**Component:** `src/App.jsx` (Sheets, Deck, and Compose Workspaces)  
**Severity:** High (Feature Inoperable & Keystroke Swallowing)  
**Status:** Resolved & Verified via Production Build  

---

## 1. Executive Summary

When users typed `/` in a spreadsheet cell within Regaarder Sheets:
1. No slash command menu modal appeared on screen.
2. The user observed a "bluish bar when there's text".
3. Immediately afterwards, typing was completely frozen—keystrokes (`a`, `b`, `c`, numbers) did not appear in the cell.
4. Tables and borders across the spreadsheet displayed unexpected purple/violet styling instead of clean blue accents.

Investigation revealed that **the `<SlashMenuPopover>` modal was never rendered into the DOM**. In `src/App.jsx` (an 88,847-line monolith), an early `return` statement at line 49409 for `productMode === 'sheets' || productMode === 'deck'` exits the render lifecycle at line 73028. The JSX for `<SlashMenuPopover>` had been appended at lines 85266 and 85283—over 12,000 lines *after* the early return, making it dead, unreachable code.

Because `sheetSlashMenu.open` was set to `true`, the cell input's keyboard routing handler intercepted all subsequent keypresses with `e.preventDefault()`, buffering keystrokes into a search filter for a popover that did not exist in the DOM.

---

## 2. User Symptoms & Observed Behavior

| Symptom | User Perception | Architectural Root Cause |
|---|---|---|
| **No modal appears upon typing `/`** | Modal is missing, hidden, or zero-opacity | Modal was placed in unreachable JSX code after an early return block; React never mounted the component into the DOM. |
| **"Bluish bar when there's text"** | Accidental UI glitch triggered by slash menu | The active cell entered standard editing/selection state with `bg-[#ebf0fc]/50` and `selectionBorderColor` (`#818cf8`). The user saw the normal cell selection outline and assumed it was an artifact of the failed modal. |
| **Typing is frozen after pressing `/`** | Keyboard input broken or app crashed | Cell `<input>` `onKeyDown` saw `sheetSlashMenuRef.current?.open === true` and invoked `e.preventDefault()` on every single printable keypress to feed `filterText`. |
| **Accidental purple coloring** | Accidental coloring across the app | Commit `18ec746` changed `TABLE_PRESETS.blue` to `TABLE_PRESETS.purple` in default presets, grid lines, and SVG resize handles. |

---

## 3. Root Cause Analysis (Deep Dive)

### 3.1 The Unreachable Early Return Trap
In `src/App.jsx`, the component structure follows a split render path:

```jsx
// Line 49409: Early return branch for Sheets & Deck
if (productMode === 'deck' || productMode === 'sheets') {
    return (
      <div ref={appShellRef} ...>
        {/* All Sheets and Deck workspace UI */}
      </div>
    ); // <-- Line 73028: AppCore EXITS HERE for Sheets & Deck!
}

// Line 73532: Compose return branch
return (
  <div ref={appShellRef} ...>
    {/* Compose document editor */}
    
    {/* Overlays appended at the bottom of the file */}
    {/* Line 85266 */}
    {deckSlashMenu.open && <SlashMenuPopover ... />}
    
    {/* Line 85283 */}
    {productMode === 'sheets' && sheetSlashMenu.open && <SlashMenuPopover ... />}
  </div>
);
```

When a developer added `sheetSlashMenu` and `deckSlashMenu` to `src/App.jsx`, they scrolled to the bottom of the file (line 85283) and added the JSX there, assuming it was the universal root of the application. However, because `productMode === 'sheets'` exits at line 73028, lines 73029 through 88847 are **never evaluated or rendered** by React in Sheets mode.

### 3.2 Silent Keystroke Interception Without a View
In cell inputs (`src/App.jsx` line 54016):
```javascript
// When slash menu is open: route all keypresses to menu, not the cell
if (sheetSlashMenuRef.current?.open) {
  const filtered = SHEET_SLASH_OPTIONS.filter(opt =>
    opt.label.toLowerCase().includes(sheetSlashMenuRef.current.filterText.toLowerCase())
  );
  if (e.key === 'Escape') {
    e.preventDefault();
    setSheetSlashMenu(prev => ({ ...prev, open: false }));
    return;
  }
  if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.preventDefault(); // <--- SWALLOWS ALL KEYSTROKES
    setSheetSlashMenu(prev => ({ ...prev, filterText: prev.filterText + e.key, activeIndex: 0 }));
    return;
  }
}
```
Because `sheetSlashMenu.open` was `true`, every alphanumeric key typed was intercepted by `e.preventDefault()` to update `sheetSlashMenu.filterText`. Since no popover was on screen, the user felt as though typing was entirely broken.

### 3.3 Premature Capture-Phase Interception in `handleGlobalSlashMenu`
In commit `b8d43e6`, `target.tagName === 'INPUT'` was removed from `handleGlobalSlashMenu` line 28023. This caused the window capture listener to intercept `/` before the cell's native input handler could process it, attempting to calculate coordinates from a query selector rather than the actively focused element.

### 3.4 Unfiltered Options Binding
In commit `b8d43e6`, line 85286 was changed from:
```jsx
options={getFilteredSheetSlashOptions(sheetSlashMenu.filterText || '', copiedCellStyle)}
```
to:
```jsx
options={SHEET_SLASH_OPTIONS}
```
`SlashMenuPopover` filters by its own internal `searchQuery` state, but cell typing updates `sheetSlashMenu.filterText`. Passing `SHEET_SLASH_OPTIONS` statically prevented the popover from filtering options live when typing from the cell.

### 3.5 Accidental Purple Token Saturation
In commit `18ec746`:
```diff
- const preset = TABLE_PRESETS[table.presetStyle] || TABLE_PRESETS.blue;
+ const preset = TABLE_PRESETS[table.presetStyle] || TABLE_PRESETS.purple;
- borderColor: ... TABLE_PRESETS.blue.border
+ borderColor: ... TABLE_PRESETS.purple.border
```
This violated the visual hierarchy guidelines established in `POST_MORTEM_COLOR_CONFLICT.md`, replacing clean blue table borders and accents with high-saturation purple.

---

## 4. Red Herrings & Previous Missteps

### Mistake 1: Editing `RoomLiveDocStage.jsx`
The initial investigation incorrectly assumed the user was in `RoomLiveDocStage.jsx` because grepping for `slashMenu` returned hits in that component. However, `RoomLiveDocStage` is only mounted when `productMode === 'room'`. Modifying `RoomLiveDocStage.jsx` had zero effect on the main app where the user was working.

### Mistake 2: Assuming CSS Clipping, Stacking Context, or Fullscreen Bleed
Previous attempts focused on `overflow: hidden`, `z-index`, or compositor layering per `POSTMORTEM_CitationPopover_Fullscreen.md`. While portaling to `document.fullscreenElement ?? document.body` is essential best practice for floating overlays, it did not solve the issue because the component was **not even mounted** in the DOM tree.

---

## 5. First-Principles Resolution & Methodology

### Step 1: Commit Archeology
Inspecting the Git history revealed recent commits:
- `0ff4f2c fix(sheets): resolve slash menu fixed positioning and cell typing focus`
- `b8d43e6 fix(sheets): anchor slash menu to active cell element and allow native search input typing`
- `18ec746 feat(sheets): default to Data tab, clean Monitor icon, inline view toolbar, and micro drag handle`

Reviewing the diffs showed where `TABLE_PRESETS.purple` was introduced and where fixed positioning was attempted on a component that wasn't rendering.

### Step 2: Bracket-Level AST Mapping
Using a Node.js brace-counting script on `src/App.jsx`, we traced the exact boundary of `if (productMode === 'deck' || productMode === 'sheets')`:
- **Opened:** Line 49409
- **Closed:** Line 73028
This proved that lines 73029 to 88847 were unreachable during Sheets and Deck execution.

### Step 3: Targeted Multi-File Portaling & Option Restoration
1. Injected `<SlashMenuPopover>` directly into the Sheets/Deck return branch (line 73025) wrapped in `createPortal(..., document.fullscreenElement ?? document.body)`.
2. Restored `getFilteredSheetSlashOptions` so typing `/` followed by characters dynamically filters commands.
3. Restored `target.tagName === 'INPUT'` guard in `handleGlobalSlashMenu`.
4. Reverted `TABLE_PRESETS.purple` to `TABLE_PRESETS.blue`.
5. Applied fixes identically to all copies: `src/App.jsx`, `Regaarder Compose/src/App.jsx`, and `Regaarder Compose/Regaarder Compose/src/App.jsx`.

---

## 6. Code Changes Applied

### 6.1 Sheets/Deck Return Branch Injection (`src/App.jsx:73025`)
```jsx
      {/* ── Deck Slash Menu Overlay in Sheets/Deck view ── */}
      {productMode === 'deck' && deckSlashMenu.open && typeof document !== 'undefined' && createPortal(
        <SlashMenuPopover
          options={DECK_SLASH_OPTIONS
            .filter(opt => currentAccessLevel === 'commenter' ? opt.key === 'comment' : true)
            .filter(opt => opt.label.toLowerCase().includes(deckSlashMenu.filterText.toLowerCase()))}
          selectedIndex={deckSlashMenu.activeIndex}
          onSelectOption={(opt) => executeDeckSlashCommand(opt.key)}
          onClose={() => setDeckSlashMenu(prev => ({ ...prev, open: false }))}
          style={{ 
            left: `${deckSlashMenu.left}px`, 
            top: deckSlashMenu.top,
            bottom: deckSlashMenu.bottom
          }}
          className="fixed"
        />,
        document.fullscreenElement ?? document.body
      )}

      {/* ── Sheet Slash Menu Overlay in Sheets/Deck view ── */}
      {productMode === 'sheets' && sheetSlashMenu.open && typeof document !== 'undefined' && createPortal(
        <SlashMenuPopover
          ref={sheetSlashMenuContainerRef}
          options={getFilteredSheetSlashOptions(sheetSlashMenu.filterText || '', copiedCellStyle)}
          selectedIndex={sheetSlashMenu.activeIndex}
          onSelectOption={(opt) => {
            executeSheetSlashCommand(opt.key);
            setSheetSlashMenu(prev => ({ ...prev, open: false }));
          }}
          onClose={() => setSheetSlashMenu(prev => ({ ...prev, open: false }))}
          style={{
            left: `${sheetSlashMenu.left}px`,
            top: sheetSlashMenu.top,
            bottom: sheetSlashMenu.bottom,
          }}
          className="fixed"
        />,
        document.fullscreenElement ?? document.body
      )}
```

### 6.2 Cell Input Guard Restoration (`src/App.jsx:28023`)
```javascript
        if (productMode === 'sheets') {
          const target = event.target;
          if (target && (
            target.id === 'ai-chat-input' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'INPUT' ||
            target.closest('.inline-ai-prompt-box')
          )) {
            return;
          }
          event.preventDefault();
```

### 6.3 Accidental Coloring Reversion (`src/App.jsx:53495, 53541, 54066, 54077`)
```javascript
// Restored TABLE_PRESETS.blue default preset
const preset = TABLE_PRESETS[table.presetStyle] || TABLE_PRESETS.blue;

// Restored TABLE_PRESETS.blue.border for table grid lines
borderColor: ... (TABLE_PRESETS[tableIntersections[tableIntersections.length - 1].presetStyle]?.border || TABLE_PRESETS.blue.border)

// Restored TABLE_PRESETS.blue.border for table context & resize SVGs
style={{ color: (TABLE_PRESETS[tableIntersections[tableIntersections.length - 1]?.presetStyle] || TABLE_PRESETS.blue).border }}
```

---

## 7. Verification & Build Validation

1. **Compilation Check:** Executed `npm run build` inside `Regaarder Compose`:
   - Rolldown bundle completed with **Exit Code 0** in 30.58s.
   - Output files generated cleanly (`dist/assets/index-*.js`, `dist/assets/vendor-*.js`).
2. **Runtime Verification:**
   - Typing `/` in any Sheets cell opens the `<SlashMenuPopover>` directly anchored beneath the active cell.
   - Subsequent alphanumeric keypresses filter the command list live without freezing input.
   - Pressing `Escape` cleanly dismisses the menu and restores direct cell editing.
   - Tables and cell borders maintain consistent Apple-style blue accents without purple saturation.

---

## 8. Prevention Directives for Future Developers

1. **Audit Return Hierarchy in Mega-Monoliths:** Never assume an 80,000-line React component has a single return statement at the end of the file. Always verify whether `productMode` or view switches exit earlier in the function body.
2. **Overlay Teleportation Mandatory:** Any floating contextual menu (Slash menu, context menu, tooltip) must use `createPortal(..., document.fullscreenElement ?? document.body)` with `position: fixed`.
3. **No Silent Keystroke Interception:** When capturing keyboard events via `e.preventDefault()`, ensure there is always visual feedback (e.g. an open menu with active focus). If the target menu is closed or unmounted, keystrokes must pass through natively.
4. **Color Hierarchy Respect:** Consult `POST_MORTEM_COLOR_CONFLICT.md` before overriding table presets. Violet and purple tokens are reserved for primary AI interactions, while data grids should adhere to neutral or blue accents.
