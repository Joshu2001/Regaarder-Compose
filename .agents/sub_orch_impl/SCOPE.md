# Scope: Regaarder Omni-Import Redesign Implementation

## Architecture
- React/Vite single page app. Main files: `src/App.jsx` and `src/styles.css`.
- State managed in `src/App.jsx`.
- When `sheetToolbarTab === 'Data'` and `hasImportedData` is false, show Omni-Import Hub.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M2 | Rounded Tabs & Outline styling | Style sheets toolbar tabs as slightly rounded rectangles and configure active states with "outline" nomenclature (no highlight) | None | PLANNED |
| M3 | Premium Empty State & Hub | Build the three-zone structure (Omni-Import, Quick Creation, Recent Sources) to replace the immediate empty spreadsheet grid | M2 | PLANNED |
| M4 | AI Context Sidebar States | Implement selection/multiple dataset awareness and update sidebar options dynamically | M3 | PLANNED |
| M5 | Data Relationships Flow | Implement multiple-file upload relationship detection and click-to-connect flow | M4 | PLANNED |
| M6 | E2E Verification & Audit | Execute full test suite and run challenger tests / forensic audit | M5 | PLANNED |

## Interface Contracts
### `OmniImportState` ↔ `App.jsx`
- `hasImportedData`: boolean flag to control whether to show the Omni-Import hub empty state or the actual sheet grid workspace.
- `selectedFiles`: array of names of files currently uploaded/dragged in.
- `selectedGridColumn`: index/label of selected column to trigger column selected sidebar state.
- `sidebarMode`: active options listed in the sidebar depending on sheet context state.
