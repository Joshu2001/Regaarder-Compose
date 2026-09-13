# Workspace Memory, Indexing, and Tab Routing Implementation

## Purpose

This document records the workspace indexing and navigation refactor implemented in Regaarder Compose. It is derived from the attached workspace screenshots and the accompanying engineering prompt.

The screenshots showed three classes of defects:

1. Saved Compose artifacts appeared in the local document dropdown but were missing or duplicated in Workspace Memory.
2. Whiteboards appeared in Docs and sometimes opened in the wrong editor.
3. Workspace category actions such as Schedule and Chat could fall through to the wrong destination.

The implementation establishes one canonical local document representation, makes artifact type explicit, and separates category filtering from breadcrumb text or title heuristics.

## Before: Observed Failure Modes

### Fragmented storage

The application previously read from several partially overlapping representations:

- `regaarder_documents_v1`
- Per-document `rc.savedDoc.*` keys
- `regaarder_library_documents_v1`
- Live React state
- Synthetic active-only search records

The saved dropdown and Workspace Memory did not always consume the same collection. A document could therefore exist in one view and be absent from another, or appear twice when the active synthetic record and the saved record were both indexed.

### Inferred artifact identity

Some consumers inferred the editor from:

- A title containing `sheet`, `deck`, or `whiteboard`
- Presence of sheet or deck fields
- A breadcrumb such as `Compose > ...`
- The current product mode

This was unsafe. A renamed Sheet could be routed as a document, and a Whiteboard carrying a Compose breadcrumb could appear under Docs.

### Legacy Whiteboard leakage

Older records could contain Whiteboard fields while still carrying `mode: 'compose'`, or carry a Whiteboard-style title without a proper discriminator. Those records were rendered as Compose documents by strict consumers and leaked into the Docs list.

### Synthetic current records

The search engine created a separate active record for the currently open document, Sheet, or Deck. The same artifact was also present in the saved document array, creating duplicate results and inconsistent timestamps.

### Dirty-tab comparison against the wrong store

The tab-close handler compared the live document against the obsolete library store. This meant the close decision could disagree with the actual canonical saved record.

## After: Canonical Architecture

### Single source of truth

`regaarder_documents_v1` is now the canonical local store for Docs, Sheets, Decks, and Whiteboards.

The implementation lives in:

- `Regaarder Compose/src/services/workspaceDocumentStore.js`
- `Regaarder Compose/src/App.jsx`
- `Regaarder Compose/src/services/GlobalWorkspaceSearchEngine.js`

The store provides:

- `readWorkspaceDocuments()`
- `writeWorkspaceDocuments()`
- `normalizeWorkspaceDocuments()`
- `normalizeWorkspaceDocumentMode()`
- `WORKSPACE_DOCUMENT_MODES`

### Canonical schema

Every normalized artifact contains the following core fields:

```ts
interface WorkspaceDocument {
  id: string | number;
  type: 'compose' | 'sheets' | 'deck' | 'whiteboard';
  mode: 'compose' | 'sheets' | 'deck' | 'whiteboard';
  title: string;
  createdAt: string;
  updatedAt: string;
  isDraft: boolean;
}
```

Mode and type are intentionally aligned for local workspace artifacts. `type` is included as a stable consumer-facing discriminator, while `mode` remains the editor state used by Compose.

Additional editor data remains on the record where appropriate:

- Compose: `bodyHtml`, `subtitle`, `initiatives`, `appendedSections`
- Sheets: `sheetsTitle`, `sheetsData`, `sheetGrids`, `activeSheetId`
- Decks: `deckTitle`, `deckSlidesData`, `activeDeckSlideId`
- Whiteboards: `whiteboardWidgets`, `whiteboardShapes`, `whiteboardStrokes`, `whiteboardComments`

## Normalization and Migration

Normalization occurs at store read and write boundaries.

### Stable identity

Existing IDs are preserved. Records without an ID receive a deterministic migration ID based on their position and creation timestamp.

### Stable timestamps

Valid `createdAt` values are preserved. If missing, a valid `updatedAt` is reused. If neither exists, a creation timestamp is assigned once. `updatedAt` is preserved when valid and is updated only when the artifact changes.

The index formats stored timestamps; it does not replace them with the current time during rendering.

### Numbered Untitled titles

Generated names are assigned per mode:

- `Untitled Document 1`
- `Untitled Sheet 1`
- `Untitled Deck 1`
- `Untitled Whiteboard 1`

Already-numbered titles remain stable during repeated normalization. This prevents names from changing every time a component re-reads local storage.

### Legacy Whiteboard detection

A legacy record is migrated to `whiteboard` when it has a Compose mode but has reliable Whiteboard signals such as:

- `Untitled Whiteboard` or `Untitled Whiteboard N`
- `Whiteboard N`
- `whiteboardWidgets`
- `whiteboardStrokes`
- `whiteboardShapes`

This migration is intentionally narrow. Valid explicit modes are not re-inferred from arbitrary titles or content.

The search index also applies the same defensive classification when it receives a raw legacy record before the next persistence cycle completes.

## Persistence and Synchronization

All document saves now write the normalized collection directly to `regaarder_documents_v1`.

The store dispatches:

```js
window.dispatchEvent(new CustomEvent('workspace-storage-update'));
```

after a successful write. Consumers listen to both:

- `workspace-storage-update` for same-window reactive refreshes
- `storage` for updates from another browser tab

The following surfaces refresh from the canonical store:

- Saved document dropdowns
- Recent Work
- Workspace Memory search
- Compose document state
- Sheets and Deck tab collections

## Search Indexing Rules

### Exactly once

The search engine indexes canonical stored artifacts once. It no longer creates a separate active-only result for a record that already exists in `context.documents`.

### Explicit editor targets

Indexed artifacts now carry an `editorTarget`:

- `compose`
- `sheets`
- `deck`
- `whiteboard`

This target is used for navigation and is independent of display breadcrumbs.

### Strict category filters

Docs, Sheets, Decks, and Whiteboards use strict primary type matching:

```js
const primaryType = normalizeFilterKey(
  item.editorTarget || item.mode || item.resourceType || item.type || item.workspace
);

return primaryType === filterKey;
```

The Docs filter cannot include a Whiteboard merely because its location begins with `Compose`. The Sheets filter cannot include a renamed document because its title contains `sheet`.

The category breadcrumb remains presentation metadata only. It is not an identity signal.

### Other workspace categories

Relay, Tasks, Room, Notes, People, Chat, Schedule, Browser History, and Research continue to use their explicit resource/workspace values. Their navigation branches are kept separate from artifact editor routing.

## Navigation and Route Safety

Search results now route using the following precedence:

1. `entity.editorTarget`
2. `entity.workspace`
3. `entity.type`

This prevents a misleading location string from controlling navigation.

### Artifact routing

- Compose -> Compose document editor
- Sheets -> Sheets editor
- Deck -> Deck editor
- Whiteboard -> Whiteboard editor

Each artifact navigation carries `metadata.docId`. The target is resolved from the in-memory collection or the canonical document store.

### Missing-record handling

When the ID no longer exists or the stored record is corrupted:

- The editor is not mounted with invalid data.
- A non-blocking `Document not found or removed` toast is shown.
- The workspace remains usable instead of breaking the shell.

### Schedule and Chat

Schedule and Chat now have explicit branches instead of falling through to a generic or Whiteboard path:

- Schedule opens the calendar/scheduling workspace.
- Chat opens the chat/Relay assistant surface.

Creation CTAs use the same explicit workspace contract.

## Empty-State CTA Contract

Empty-state actions are represented as:

```js
{
  workspace: 'whiteboard',
  actionType: 'create'
}
```

The parent App owns the creation flow. This keeps empty-state components presentational and prevents each view from inventing its own routing logic.

Supported creation routing includes:

- Docs -> new document
- Sheets -> Sheets creation surface
- Deck -> Deck creation surface
- Whiteboard -> `createNewWhiteboard()`
- Room -> Room creation/join surface
- Tasks -> Tasks surface
- Relay -> Chat/Relay surface
- Notes -> Room Notes surface
- Schedule -> Calendar surface

Creation actions use a short lock to prevent double-clicks from creating duplicate Untitled records.

## Dirty Tab Close Behavior

The document tab close handler now compares the active record against the canonical `regaarder_documents_v1` representation.

### Clean record

If no meaningful changes exist, the tab closes immediately. No save prompt is shown.

### Dirty record

If the current title, body, Sheet data, Deck data, or Whiteboard data differs from the canonical saved record, the standard confirmation modal remains available:

- Save changes
- Discard changes
- Cancel

The save path writes back to `regaarder_documents_v1`, not the obsolete library store.

## Screenshot-Based Acceptance Criteria

The attached screenshots are satisfied when the following conditions hold:

1. A Whiteboard does not appear in the Docs result list.
2. The Whiteboard tab displays a Whiteboard artifact with a Whiteboard breadcrumb and icon.
3. A Whiteboard result opens the Whiteboard editor, regardless of its title or old breadcrumb.
4. The Schedule tab opens Schedule rather than Whiteboard.
5. The Chat tab opens Chat/Relay rather than Whiteboard.
6. Search results remain stable when switching between All, Docs, Sheets, Deck, and More categories.
7. Closing a clean tab does not display a save confirmation.
8. Closing a dirty tab displays the existing Save/Discard confirmation.
9. Creating an empty-state artifact twice rapidly creates only one record.
10. Stored creation and update timestamps remain stable across Memory refreshes.

## Validation Performed

The active package was validated with:

```powershell
npm run build
```

The build completed successfully in the active `Regaarder Compose` package. Editor diagnostics reported no errors in the touched files.

A mixed-mode index check confirmed that canonical Docs, Sheets, and Whiteboards are isolated under their respective filters.

## Files Changed

- `Regaarder Compose/src/services/workspaceDocumentStore.js`
  - Canonical schema, normalization, migration, type assignment, persistence, and update events.
- `Regaarder Compose/src/services/GlobalWorkspaceSearchEngine.js`
  - Strict artifact filters, legacy Whiteboard defense, exactly-once indexing, and editor targets.
- `Regaarder Compose/src/App.jsx`
  - Canonical save/switch/close flows, Whiteboard migration bridge, explicit navigation, CTA routing, and dirty-state persistence.
- `Regaarder Compose/src/components/search/GlobalWorkspaceSearchModal.jsx`
  - Reactive workspace index refresh on `workspace-storage-update`.
- `Regaarder Compose/src/components/LandingRecentWorkStrip.jsx`
  - Canonical recent-work ingestion and live refresh.
- `.github/skills/indexing-and-tab-sync-skill.md`
  - Reusable agent/developer guidance for preventing recurrence.

## Future Maintenance Rules

1. Never infer Docs, Sheets, Decks, or Whiteboards from titles after normalization.
2. Never use location breadcrumbs as routing identity.
3. Never add a synthetic active result when the artifact is already in the canonical array.
4. Never use current time as a rendered substitute for stored timestamps.
5. Never write a closed document only to the obsolete library store.
6. Add a focused filter and routing test whenever a new workspace artifact type is introduced.
