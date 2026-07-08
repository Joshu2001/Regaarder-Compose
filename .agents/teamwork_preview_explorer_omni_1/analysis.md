# Omni-Import Hub Redesign & Sheets Workspace Integration Analysis

This analysis outlines the structural locations, design strategies, and concrete implementation plans for the Omni-Import Hub redesign, styling refactors, and AI sidebar state transitions in the Regaarder Compose workspace.

---

## 1. Sheets Workspace Structure

In `src/App.jsx`, the sheets workspace structure is determined by the `productMode` state and `isSheetsMode` boolean:
* **`isSheetsMode` Definition**: Declared on line 17733 as:
  ```javascript
  const isSheetsMode = productMode === 'sheets';
  ```
* **Sheets View Container**: Rendered conditionally on lines 25526–25867 inside the main editor layout block:
  ```javascript
  {isSheetsMode ? (
    <div ref={sheetCanvasPreviewRef} className="flex-1 overflow-hidden bg-transparent flex flex-col relative">
      ...
    </div>
  ) : ( ... )}
  ```
* **Sheets Toolbar Tabs**: Rendered on lines 25529–25542 using an array map over the tab labels `['Data', 'Insert', 'Analyze', 'Visualize', 'AI']`:
  ```javascript
  {['Data', 'Insert', 'Analyze', 'Visualize', 'AI'].map((tab) => (
    <button
      key={tab}
      type="button"
      onClick={() => {
        setSheetToolbarTab(tab);
        showToast(`${tab} tools ready`);
      }}
      className={`px-3 py-1.5 rounded-lg transition-colors ${sheetToolbarTab === tab ? 'bg-violet-50 text-violet-700' : 'hover:bg-gray-100 text-[#374151]'}`}
    >
      {tab}
    </button>
  ))}
  ```
  Note that there is currently no conditional rendering or sub-toolbars associated with `sheetToolbarTab === 'Data'`. It only sets the state and displays a toast.

---

## 2. Empty Spreadsheet Grid Component & Conditional Swap

The current spreadsheet grid headers and cells are rendered on lines 25736–25831:
* **Column Headers**: Lines 25736–25749.
* **Row Headers & Input Cells**: Lines 25750–25831.

To support the Omni-Import Hub redesign, we introduce a new state:
```javascript
const [hasImportedData, setHasImportedData] = useState(false);
```

### Swapping Flow
When `hasImportedData` is `false`, the empty spreadsheet grid is swapped with the **Omni-Import Hub**. 
This is implemented by wrapping the grid elements in a conditional render:
```javascript
{hasImportedData ? (
  <>
    {/* Grid Column Headers (lines 25736-25749) */}
    {/* Grid Cells and Rows (lines 25750-25831) */}
  </>
) : (
  <OmniImportHub 
    onImportComplete={() => setHasImportedData(true)} 
    sheetsData={sheetsData}
    setSheetsData={setSheetsData}
    setSheetGrids={setSheetGrids}
    setActiveSheetId={setActiveSheetId}
  />
)}
```

---

## 3. Rounded Tabs & Active State Styling

According to `AGENTS.md` guidelines, tabs must be styled as slightly rounded rectangles (not pills/elliptical) and the active state must be styled and named as `outline` (no highlight or color fills).

Currently, tabs are styled inline via Tailwind classes (`rounded-lg bg-violet-50 text-violet-700`). We will extract this to class-based styles in `src/styles.css`.

### Proposed CSS in `src/styles.css`
```css
/* Sheets Toolbar & Navigation Tabs */
.sheet-tab-item {
  border-radius: 6px !important; /* Slightly rounded rectangle, no organic curves */
  padding: 6px 14px !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  transition: all 150ms ease !important;
  border: 1px solid transparent !important;
  background-color: transparent !important;
  color: #374151 !important;
}

.sheet-tab-item:hover {
  background-color: #f3f4f6 !important;
  color: #1f2937 !important;
}

/* Outline state for active visual styling (No highlight) */
.sheet-tab-item.outline {
  border-color: #7c3aed !important;
  color: #7c3aed !important;
  background-color: transparent !important;
}
```

### Proposed JSX Update in `src/App.jsx`
```javascript
className={`sheet-tab-item ${sheetToolbarTab === tab ? 'outline' : ''}`}
```

---

## 4. AI Sidebar & Dynamic Options

The AI Assistant panel is located in `src/App.jsx` under the right sidebar component, controlled by `activeRightTab`. The AI Assistant options are rendered when `activeRightTab === 'assistant'` (lines 19481–19620).

Currently, the options list for Sheets mode is statically defined on lines 19582–19588:
```javascript
: productMode === 'sheets' ? [
  { label: 'Analyze this data', subtitle: 'Find trends and insights', icon: TrendingUp },
  { label: 'Create pivot table', subtitle: 'Summarize your raw data', icon: Table },
  { label: 'Forecast next quarter', subtitle: 'Project future numbers', icon: LineChart },
  { label: 'Find anomalies', subtitle: 'Highlight outliers in data', icon: AlertCircle },
  { label: 'Compare to last year', subtitle: 'Year-over-year analysis', icon: BarChart2 },
  { label: 'Generate chart', subtitle: 'Visualize selected data', icon: PieChart }
]
```

### Design for Dynamic Switching
We define three states based on grid selection and datasets:
1. **Column Selected**: The user has clicked a column header, selecting the entire column.
2. **Multiple Datasets**: There is more than one sheet or dataset loaded.
3. **Default**: Single cell selection / initial empty workspace.

We implement this detection logic:
```javascript
const isColumnSelected = useMemo(() => {
  if (!selectedSheetRange) return false;
  const isFullCol = selectedSheetRange.startRow === 1 && selectedSheetRange.endRow === activeSheetGridRaw.rows;
  return isFullCol && (selectedSheetRange.startCol === selectedSheetRange.endCol);
}, [selectedSheetRange, activeSheetGridRaw.rows]);

const hasMultipleDatasets = useMemo(() => {
  return sheetsData.length > 1;
}, [sheetsData]);
```

We map the options dynamically based on these states:
```javascript
const assistantOptions = useMemo(() => {
  if (hasMultipleDatasets) {
    return [
      { label: 'Connect Sources', subtitle: 'Connect multiple datasets', icon: Link },
      { label: 'Match Records', subtitle: 'Identify matching IDs', icon: CheckSquare },
      { label: 'Merge Tables', subtitle: 'Combine sheets dynamically', icon: Layers },
      { label: 'Find Relationships', subtitle: 'Map foreign key relations', icon: Sparkles },
      { label: 'Build Database', subtitle: 'Initialize relational schema', icon: Database }
    ];
  }
  if (isColumnSelected) {
    return [
      { label: 'Analyze Data', subtitle: 'Get column summary stats', icon: BarChart2 },
      { label: 'Create Formula', subtitle: 'Generate fx formulas', icon: Wand2 },
      { label: 'Detect Trends', subtitle: 'Spot patterns in values', icon: TrendingUp },
      { label: 'Forecast', subtitle: 'Extrapolate data series', icon: LineChart },
      { label: 'Clean Data', subtitle: 'Resolve formats and nulls', icon: Wand2 },
      { label: 'Find Duplicates', subtitle: 'Locate repeating values', icon: AlertCircle },
      { label: 'Visualize', subtitle: 'Plot selected columns', icon: PieChart }
    ];
  }
  return [
    { label: 'Import Data', subtitle: 'Upload CSV or XLSX sheets', icon: Database },
    { label: 'Generate Sheet', subtitle: 'Create sheet using AI prompts', icon: Sparkles },
    { label: 'Build Dashboard', subtitle: 'Assemble quick charts', icon: LayoutGrid },
    { label: 'Ask Questions', subtitle: 'Inquire about current sheet', icon: MessageSquare },
    { label: 'Find Insights', subtitle: 'Synthesize data summaries', icon: FileText }
  ];
}, [isColumnSelected, hasMultipleDatasets]);
```

---

## 5. Data Relationships AI Flow

Inside the new `OmniImportHub` component, we simulate an AI detection flow triggered when multiple files are uploaded.

### Flow Scenario:
1. User drops or uploads two files (e.g., `Customers.csv` and `Orders.xlsx`).
2. An AI detection box appears with a subtle purple border and sparkles icon.
3. Message displayed: **"I found matching customer IDs across your files. Connect datasets?"**
4. Action button: **"Connect Datasets & Build Relational Database"**.
5. Clicking this button automatically:
   - Configures the worksheets (`sheetsData`) to contain a `Customers` sheet and an `Orders` sheet with relational keys.
   - Triggers the state `hasImportedData` to `true`.
   - Fires a visual toast confirming the link: *"Primary key 'CustomerID' linked to foreign key 'CustomerID' in Orders."*

---

## 6. E2E Test Verification

* **Current Codebase State**: No E2E test files or runner scripts exist in `Regaarder Compose` directly verifying the sheets workspace. There are only generic verifiers like `check_dm.cjs` and `test_puppeteer.cjs` checking meeting/room rendering.
* **Planned Test Infrastructure**: The file `TEST_INFRA.md` at the project root outlines the planned architecture:
  - **Runner Location**: `c:\Users\user\Downloads\Project MOAT\Regaarder Compose\run_tests.mjs`
  - **Tests Location**: `c:\Users\user\Downloads\Project MOAT\Regaarder Compose\tests\e2e.test.mjs`
  - **Target Verification Method**: Launch headless browser using Puppeteer, navigate to local instance, select Sheets mode, execute file drop event simulation, trigger the relationship connect button, and assert:
    - DOM element existence of the relational worksheets.
    - Active tab styles having the class `outline` (asserting `border-color: #7c3aed`).
    - Sidebar options list length and labels matching state changes (default vs column-selected vs multi-dataset).
