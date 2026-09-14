# Document Title Twitching & Local Sync Resolution Report

## Overview
This document outlines the investigation, root cause analysis, and resolution for the issue where a document's title was rapidly alternating ("twitching") between its user-assigned name (e.g. `miao`) and the generated fallback title (`Untitled Document 1`), causing continuous UI flickering in the workspace recent files list and oscillating filename writes in `~/Documents/Regaarder/Documents`.

---

## 1. Work Area & System Components

The title synchronization and local file persistence architecture spans three primary areas:

1. **Active Document Title Derivation & State Management (`src/App.jsx`)**
   - Manages React state for `docTitle`, `docBodyHtml`, `documents`, and `activeDocId`.
   - Coordinates two `useEffect` hooks:
     - Title Derivation Effect (`lines 18374–18388`): Determines the document title either from explicit metadata or by parsing the first block element of the HTML body.
     - Document State Sync Effect (`lines 18362–18370`): Synchronizes active document changes into the canonical `documents` array.
   - Handles renaming callbacks (`commitRenameDocument` and `commitUnsavedDraftRename`).

2. **Canonical Document Store & Normalization (`src/services/workspaceDocumentStore.js`)**
   - Serializes workspace documents to `localStorage`.
   - Runs `normalizeWorkspaceDocuments()` on write.
   - Evaluates titles through `hasGeneratedTitle()` and calculates incremental numbers with `nextUntitledTitle()` for generic fallback titles.

3. **Local Filesystem Synchronization (`src/services/localSyncService.js`)**
   - Bridges renderer documents to the native OS filesystem via Electron IPC.
   - Translates documents into `.rgdoc` files in `~/Documents/Regaarder/Documents`.
   - Maintains an operation queue (`_enqueueDocOperation`) to eliminate race conditions and cleans up previous filenames on rename.

---

## 2. Root Cause Analysis

### A. Title Derivation Inversion in `App.jsx`
Previously, `App.jsx` calculated the document title as:
```javascript
const titleText = firstBlock ? (firstBlock.textContent || '').trim() : '';
const derivedTitle = titleText || (hasPersistedExplicitTitle ? persistedTitle : 'Untitled Document');
setDocTitle(derivedTitle);
```
- The body text (`titleText`) was prioritized **ahead** of the user's explicit title (`persistedTitle`).
- Whenever the user typed in the body, or whenever an empty block (`<p><br></p>`) was focused, `titleText` evaluated to empty or non-empty content, causing the title to bounce between the extracted body text and the fallback title.

### B. Circular State Feedback Loop with Normalizer
- When `docTitle` flipped to `'Untitled Document'`, it updated `documents`.
- `workspaceDocumentStore.js` normalized the title: `hasGeneratedTitle('Untitled Document')` returned true, causing `nextUntitledTitle()` to format it as `'Untitled Document 1'`.
- This title was dispatched to `localStorage` and written to disk (`Untitled_Document_1_...rgdoc`).
- When the editor or active document re-rendered with the explicit title (`miao`), it set it back to `miao`, unlinking `Untitled_Document_1_...rgdoc` and writing `miao_...rgdoc`.
- This created an oscillatory feedback loop where the file and UI continuously twitched between both names.

---

## 3. Solution Applied

### 1. Authoritative Precedence for Explicit Titles
In `src/App.jsx`:
- If `hasPersistedExplicitTitle` is true (i.e. the title is non-empty and does not begin with generic `untitled`), it immediately takes precedence and returns without consulting the body content:
```javascript
useEffect(() => {
  const persistedTitle = activeDoc?.title?.trim();
  const hasPersistedExplicitTitle = !!persistedTitle && !/^untitled\b/i.test(persistedTitle);

  if (hasPersistedExplicitTitle) {
    setDocTitle((prev) => (prev !== persistedTitle ? persistedTitle : prev));
    return;
  }

  if (!docBodyHtml) {
    setDocTitle((prev) => (prev !== 'Untitled Document' ? 'Untitled Document' : prev));
    return;
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(docBodyHtml, 'text/html');
  const firstBlock = doc.body.firstElementChild;
  const titleText = firstBlock ? (firstBlock.textContent || '').trim() : '';
  const derivedTitle = titleText || 'Untitled Document';
  setDocTitle((prev) => (prev !== derivedTitle ? derivedTitle : prev));
}, [docBodyHtml, activeDoc?.title]);
```

### 2. State Setter Deduplication
- Added `(prev) => (prev !== next ? next : prev)` across all title updates to prevent unnecessary re-renders when the value is unchanged.

### 3. String-Coerced ID Matching for Renames
- In `commitRenameDocument` and `commitUnsavedDraftRename`, coerced comparisons (`String(doc.id) === String(docId)`) to ensure numeric and string IDs update reliably.

---

## 4. Verification
- `npm run build`: Production build verified with exit code 0 (`vite build` completed cleanly).
- Disk synchronization verified: Documents write deterministically to disk without oscillating filenames.
