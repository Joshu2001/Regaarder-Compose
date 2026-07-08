## 2026-06-22T11:50:30+08:00

You are 'teamwork_preview_worker_omni_1', a worker agent.
Your working directory is 'c:\Users\user\Downloads\Project MOAT\.agents\teamwork_preview_worker_omni_1'.
Your task is to implement the UI and logic changes for the Omni-Import hub redesign in the Sheets workspace of Regaarder Compose.

Refer to the original user request and the project description.
Here are the specific requirements you must implement:

1. **Rounded Tabs & Outline Styling (M2)**
   - In 'src/styles.css', add a custom CSS class `.sheet-tab-item` for the spreadsheet toolbar tabs. It must style them as slightly rounded rectangles (use `border-radius: 6px`, border transparent) and define an active outline class `.sheet-tab-item.outline` (use `border-color: #7c3aed`, text violet, background-color transparent). No pill-shaped or elliptical elements. No background-color highlights for the active state.
   - In 'src/App.jsx', locate the mapping of the spreadsheet toolbar tabs (around line 25529). Replace the Tailwind button styling with the new `.sheet-tab-item` class and apply `.outline` conditionally when the tab is active. Ensure the active status is styled and named as "outline" (no highlight).

2. **Premium Empty State & Omni-Import Hub (M3)**
   - Introduce a new state `hasImportedData` (default `false`) and a files state (e.g. `selectedFiles`, default `[]`) in `src/App.jsx`.
   - Locate the spreadsheet grid component (around lines 25736-25831). Wrap it in a conditional render: if `hasImportedData` is true, render the spreadsheet grid; if `hasImportedData` is false, render the new `OmniImportHub` component.
   - Build a beautiful, premium, minimalist `OmniImportHub` component following the Notion/Linear aesthetic:
     - **Zone 1: Omni-Import Portal (Central focus)**:
       - Header: "What would you like to analyze?"
       - Actions: "Drop files", "Paste content", "Upload documents", "Ask AI". Include interactive handlers (e.g., file input select or drag-and-drop).
       - Example Prompts: "Turn this SOP into a tracker", "Create a CRM from this PDF" (clicking them can trigger a simulated AI generation and import).
     - **Zone 2: Quick Creation Row (Below the portal)**:
       - AI-generated templates: "Project Tracker", "Inventory Ledger", "Marketing Budget", "Sales Pipeline". Clicking one generates mock sheet data and sets `hasImportedData` to true.
     - **Zone 3: Recent Data Sources (Below templates)**:
       - A list of recent sources with file type icons: `revenue_q2.pdf` (PDF, 2.4 MB), `product_demo.mp4` (Video, 45 MB), `landing_page_v1.png` (Image, 1.2 MB). Clicking one imports it as a sheet.

3. **AI Sidebar Context-Aware States (M4)**
   - Locate the assistant options list in `src/App.jsx` (around line 19582).
   - Make the options list dynamic based on the workspace state:
     - **Default state**: "Import Data" (icon Database), "Generate Sheet" (icon Sparkles), "Build Dashboard" (icon LayoutGrid), "Ask Questions" (icon MessageSquare), "Find Insights" (icon FileText)
     - **Column Selected state**: "Analyze Data" (icon BarChart2), "Create Formula" (icon Wand2), "Detect Trends" (icon TrendingUp), "Forecast" (icon LineChart), "Clean Data" (icon Wand2), "Find Duplicates" (icon AlertCircle), "Visualize" (icon PieChart)
     - **Multiple Datasets state**: "Connect Sources" (icon LinkIcon), "Match Records" (icon CheckSquare), "Merge Tables" (icon Layers), "Find Relationships" (icon Sparkles), "Build Database" (icon Database)
   - To trigger "Column Selected": Track the selected column. If the user clicks on a column header (A, B, C...) in the sheet grid, set a state variable `selectedGridColumn` (or select the entire column). When a column is selected, the sidebar switches to the Column Selected options.
   - To trigger "Multiple Datasets": Detect if there are multiple sheets/worksheets loaded (e.g., `sheetsData.length > 1`).

4. **Data Relationships Detection and Matching Flow (M5)**
   - When multiple files (e.g. `Customers.csv` and `Orders.xlsx`) are uploaded or dragged into the Omni-Import portal, show a simulated AI detection prompt:
     `I found matching customer IDs across your files. Connect datasets?`
     with a button "Connect Datasets".
   - Clicking "Connect Datasets" will:
     1. Import both tables into `sheetsData` as separate sheets ("Customers" and "Orders").
     2. Connect their datasets (e.g., simulate foreign keys linking).
     3. Show a toast or feedback: "Primary key 'CustomerID' linked to foreign key 'CustomerID' in Orders."
     4. Set `hasImportedData` to true to transition to the grid view.
     5. Update the AI sidebar state to the Multiple Datasets state.
