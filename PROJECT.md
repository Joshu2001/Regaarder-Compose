# Project: Regaarder Omni-Import Redesign

## Architecture
The application is a single-page React application powered by Vite, with a huge entry point component `src/App.jsx`.
- **UI State**: State is managed in `src/App.jsx` via React state. A key state is `productMode` which controls which workspace is visible (e.g. `'sheets'`).
- **Sheet Workspace**: Within Sheets mode (`productMode === 'sheets'`), the workspace has tabs ('Data', 'Insert', 'Analyze', 'Visualize', 'AI'). The active tab in this toolbar is controlled by `sheetToolbarTab`.
- **Redesign Scope**: We will modify the 'Data' tab behavior:
  - If `sheetToolbarTab === 'Data'` and no file is imported yet (first-run empty state), instead of rendering a blank spreadsheet grid (or spreadsheet workspace), we render the **Omni-Import Hub**.
  - The Omni-Import Hub contains:
    1. Omni-Import Portal (Drag & Drop, Paste content, Upload documents, Ask AI) with example prompts ("Turn this SOP into a tracker", "Create a CRM from this PDF").
    2. Quick Creation Row for AI-generated templates.
    3. Recent Data Sources list showing mock files (.pdf, .mp4, .png).
  - **Context-Aware AI Sidebar**: The sidebar states change dynamically depending on user interactions:
    - Default state: "Import Data", "Generate Sheet", "Build Dashboard", "Ask Questions", "Find Insights"
    - Column selected state: "Analyze Data", "Create Formula", "Detect Trends", "Forecast", "Clean Data", "Find Duplicates", "Visualize"
    - Multiple datasets state: "Connect Sources", "Match Records", "Merge Tables", "Find Relationships", "Build Database"
  - **Data Relationships**: If multiple mock files are uploaded/selected (e.g. Customers.csv, Orders.xlsx), the hub triggers a simulated AI prompt: "I found matching customer IDs across your files. Connect datasets?" with a button to establish one-click relational data.

## Code Layout
- `src/App.jsx`: Core container file where workspace layout, sidebar, toolbar tabs, sheet grid, and the new Omni-Import hub are defined.
- `src/styles.css`: Stylesheet where layout, rounded-rectangle tabs, and "outline" focus/active states are defined.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M1 | E2E Test Suite Setup | Set up the test suite skeleton and run commands | None | PLANNED |
| M2 | Rounded Tabs & Outline styling | Style sheets toolbar tabs as slightly rounded rectangles and configure active states with "outline" nomenclature (no highlight) | None | PLANNED |
| M3 | Premium Empty State & Hub | Build the three-zone structure (Omni-Import, Quick Creation, Recent Sources) to replace the immediate empty spreadsheet grid | M2 | PLANNED |
| M4 | AI Context Sidebar States | Implement selection/multiple dataset awareness and update sidebar options dynamically | M3 | PLANNED |
| M5 | Data Relationships Flow | Implement multiple-file upload relationship detection and click-to-connect flow | M4 | PLANNED |
| M6 | E2E & Hardening Tests | Execute full test suite and run challenger tests / forensic audit | M1, M5 | PLANNED |

## Interface Contracts
### `OmniImportState` ↔ `App.jsx`
- `hasImportedData`: boolean flag to control whether to show the Omni-Import hub empty state or the actual sheet grid workspace.
- `selectedFiles`: array of names of files currently uploaded/dragged in.
- `selectedGridColumn`: index/label of selected column to trigger column selected sidebar state.
- `sidebarMode`: active options listed in the sidebar depending on sheet context state.
