# Postmortem: Document Tab Renaming State Lag & Multi-Mode Title Desynchronization

## Overview & Executive Summary

During document workflow testing in Regaarder Compose across Compose, Sheets, Deck, and Whiteboard modes, document and workbook renaming exhibited several critical defects:
1. **Title Reversion on Enter/Blur:** After double-clicking a tab to rename it and pressing Enter or blurring the input, the typed title was dropped or reverted back to generic defaults (e.g., Untitled Document 3).
2. **Stale displayTitle Masking:** Even when a title was edited, tab headers and workbook dropdown menus continued displaying initial placeholder titles because doc.displayTitle took precedence over doc.title.
3. **Unintended Tab Navigation on Edit:** Double-clicking or clicking inside the rename input triggered the parent tab container's onClick, causing accidental document switching that interrupted edit state.
4. **Draft Name Synchronization Failures:** Header unsaved draft rename inputs failed to synchronize bidirectionally with the active document model and document list.

All issues have been resolved across both the tab bars, document action dropdowns, header draft controls, and persistence routines.

---

## 1. Root Cause Diagnosis

### A. React State Asynchrony / Race Condition (renameDocValue)
- commitRenameDocument(id) relied strictly on the component state variable renameDocValue.
- When an Enter keypress or onBlur event fired rapidly, the synthetic event executed before React flushed pending updates from onChange(e.target.value) to renameDocValue. As a result, commitRenameDocument read an empty string or stale value and fell back to default untitled strings.

### B. Inverted Title Precedence (displayTitle vs doc.title)
- Throughout the tab strips and dropdown pickers, title evaluation logic used:
  // Defective logic:
  const effectiveDocTitle = doc.displayTitle || doc.title?.trim() || ...;
- Because displayTitle was populated at document creation/import with initial names like Untitled Document 1, any subsequent edit saved into doc.title was permanently masked.

### C. Container Event Bubbling & Navigation Interruption
- The tab element had an onClick={() => switchDocument(doc.id)} wrapper.
- Clicking or focusing inside the input element during an inline rename triggered tab switching logic, resetting the active document context and destroying the active rename session.

### D. Multi-Mode Property Fragmentation
- Different modes tracked independent title fields (doc.sheetsTitle, doc.deckTitle, doc.title, doc.displayTitle, and local states docTitle, sheetsTitle, deckTitle). Renaming via one surface failed to mirror changes to mode-specific fields and backend storage payloads.

---

## 2. Technical Resolutions

### 1. Direct Target Value Bypass (overrideTitle)
- Updated commitRenameDocument(id, overrideTitle) and commitUnsavedDraftRename(overrideTitle) to accept an explicit value directly from event.target.value:
  const nextTitle = (overrideTitle !== undefined ? overrideTitle : renameDocValue).trim();
- Wired all onBlur={(e) => commitRenameDocument(doc.id, e.target.value)} and onKeyDown Enter handlers to pass e.target.value synchronously, bypassing React state batching latency.

### 2. Inverted Title Resolution Hierarchy
- Standardized title resolution across Compose, Sheets, Deck, Whiteboard, and dropdown menus to prioritize user-edited title:
  const effectiveDocTitle = doc.title?.trim() || doc.displayTitle || (isActive ? docTitle?.trim() : '') || fallback;

### 3. Navigation Guard on Active Rename
- Guarded the tab strip onClick:
  onClick={() => {
    if (renamingDocId !== doc.id) {
      switchDocument(doc.id);
    }
  }}

### 4. Comprehensive State & Storage Synchronization
- commitRenameDocument now updates:
  - doc.title = nextTitle
  - doc.displayTitle = nextTitle
  - Mode-specific properties: doc.sheetsTitle = nextTitle, doc.deckTitle = nextTitle
  - Active React states: setDocTitle, setSheetsTitle, setDeckTitle
  - Persistence storage hooks (saveWhiteboard, saveSheets, saveDeck, local/cloud state)

---

## 3. Lessons Learned

1. **Never Depend on Asynchronous State for Commit Events:** For inline text editing that commits on Blur or Enter, always pass e.target.value directly into the commit routine.
2. **Single Source of Truth for Entity Names:** Avoid shadow fields like displayTitle unless they are strictly computed getters. When persistent title fields exist, user edits must always take strict precedence over initial display strings.
3. **Decouple Selection/Navigation from Editing Interactions:** Interactive container cards that host inline editors must explicitly check the editing status (renamingDocId !== doc.id) before firing selection or navigation side-effects.
4. **Synchronize Multi-Mode Projections Uniformly:** In hybrid multi-mode applications (Documents, Sheets, Decks, Whiteboards), all document metadata projections must be updated synchronously in a single atomic transaction.
