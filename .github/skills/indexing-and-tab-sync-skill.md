# Indexing and Tab Sync Skill

## Root Cause Analysis

Workspace artifacts were stored in more than one representation: the Compose document collection, per-document `rc.savedDoc.*` keys, library records, and synthetic active search results. Consumers merged those sources differently. Missing or inferred discriminators caused renamed Sheets and Decks to route by title/content, while Whiteboards without a supported store mode fell back to Docs. Rendering timestamps from current state also made distinct artifacts appear to share a timestamp.

## Core Architectural Fixes

Use `regaarder_documents_v1` as the device-local single source of truth. Every record must be normalized before read and write:

```ts
interface WorkspaceDocument {
  id: string | number;
  mode: 'compose' | 'sheets' | 'deck' | 'whiteboard';
  title: string;
  createdAt: string;
  updatedAt: string;
  isDraft: boolean;
}
```

The store assigns stable IDs, preserves valid timestamps, generates numbered Untitled titles per mode, and falls back unknown modes to `compose` during migration. Do not infer an artifact mode from title, body text, or populated fields after normalization.

After create, rename, update, delete, or migration write, dispatch `workspace-storage-update`. React consumers and other tabs should also listen for the native `storage` event. Use a `BroadcastChannel` only when same-process latency requires it.

Search indexes each canonical record once. Do not append a synthetic active-only record when the active artifact already exists in the store.

## Filtering Pattern

Filter by the explicit discriminator:

- Docs: `mode === 'compose'`
- Sheets: `mode === 'sheets'`
- Decks: `mode === 'deck'`
- Whiteboards: `mode === 'whiteboard'`
- Relay, Tasks, Room, Notes, and People use their own stores and explicit resource types.

A category filter must use the canonical workspace/resource enum, never a title substring or content heuristic.

## Routing and CTA Guidelines

Map a record to its editor from `mode` and stable `id`:

- `compose` -> Docs editor / `docs/:id`
- `sheets` -> Sheets editor / `sheets/:id`
- `deck` -> Deck editor / `deck/:id`
- `whiteboard` -> Whiteboard editor / `whiteboard/:id`

Every result carries `metadata.docId` and a workspace identifier. Click handlers must validate the ID, call the owning switch/open function, and show a non-blocking `Document not found or removed` toast plus a home/Compose fallback when the record is missing or malformed.

Empty states use the same contract: `{ workspace, actionType: 'create' }`. The parent owns creation and navigation. Creation handlers should debounce or lock rapid clicks so one gesture creates one artifact.

Recommended CTA ownership:

- Room -> create/join a Room
- Tasks -> open Tasks and task creation
- Relay -> open Relay composer
- Notes -> open Notes and create a note
- People -> open the directory
- Docs, Sheets, Decks, Whiteboards -> create the matching artifact

## Troubleshooting Checklist

1. Inspect `regaarder_documents_v1` and verify every record has `id`, `mode`, `title`, `createdAt`, `updatedAt`, and `isDraft`.
2. Confirm the affected view filters by explicit `mode` or resource type.
3. Confirm search does not add an active synthetic duplicate.
4. Confirm the click payload contains the stable ID and owning workspace.
5. Delete or corrupt the stored ID and verify the missing-record toast and fallback.
6. Create and rename an artifact in another tab; verify both `storage` and `workspace-storage-update` refresh listeners update the current view.
7. Double-click an empty-state CTA and verify only one numbered Untitled record is created.
8. Check timestamps against stored `createdAt`/`updatedAt`, not `new Date()` during rendering.
