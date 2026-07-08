# Handoff Report: Omni-Import Hub Redesign Investigation

## 1. Observation

During our investigation of `c:\Users\user\Downloads\Project MOAT`, we directly observed the following:

### A. Sheets Mode Render Loop
In `Regaarder Compose/src/App.jsx`, the sheets mode is defined as:
* Line 17733:
  ```javascript
  const isSheetsMode = productMode === 'sheets';
  ```
* Line 25526:
  ```javascript
  {isSheetsMode ? (
    <div ref={sheetCanvasPreviewRef} className="flex-1 overflow-hidden bg-transparent flex flex-col relative">
  ```
* Line 25529 (Toolbar tabs mapping):
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

### B. Spreadsheet Grid View
The empty spreadsheet grid component/view is rendered inside the Sheets container at:
* Lines 25736–25831, which contains column headers (A, B, C...) and row data cells mapping.

### C. Styling Rules in `src/styles.css`
* The file `src/styles.css` has no existing class definitions for the spreadsheet toolbar tabs or their active state. Styling is currently performed via inline Tailwind classes (`rounded-lg bg-violet-50 text-violet-700`).

### D. AI Sidebar Assistant Actions
* The AI Assistant panel is located inside the sidebar container under `activeRightTab === 'assistant'` (line 19481).
* The assistant options for Sheets mode are defined statically on lines 19582–19588:
  ```javascript
  ] : productMode === 'sheets' ? [
    { label: 'Analyze this data', subtitle: 'Find trends and insights', icon: TrendingUp },
    { label: 'Create pivot table', subtitle: 'Summarize your raw data', icon: Table },
    { label: 'Forecast next quarter', subtitle: 'Project future numbers', icon: LineChart },
    { label: 'Find anomalies', subtitle: 'Highlight outliers in data', icon: AlertCircle },
    { label: 'Compare to last year', subtitle: 'Year-over-year analysis', icon: BarChart2 },
    { label: 'Generate chart', subtitle: 'Visualize selected data', icon: PieChart }
  ]
  ```

### E. E2E Tests
* There are no active E2E tests for sheets in the repository. Puppeteer verifiers like `check_dm.cjs` and `test_puppeteer.cjs` exist for other features.
* `c:\Users\user\Downloads\Project MOAT\TEST_INFRA.md` specifies the E2E architecture:
  - Test runner: `Regaarder Compose/run_tests.mjs`
  - Test script: `Regaarder Compose/tests/e2e.test.mjs`
  - Neither of these files currently exists in the workspace.

---

## 2. Logic Chain

1. **Swapping the Grid with the Hub**: Since the empty spreadsheet grid is contained in lines 25736–25831, we can introduce a new boolean state `hasImportedData` (defaulting to `false`). By wrapping the grid in a ternary conditional (`hasImportedData ? <Grid /> : <OmniImportHub />`), we can completely swap the empty grid with the premium Omni-Import Hub interface.
2. **Rounded Tabs and Active States**: In accordance with the `AGENTS.md` directive, tabs must be styled as slightly rounded rectangles (not pills/elliptical) and the active state must be styled/named as `outline`. Since the stylesheet does not contain these definitions, we must declare a new class `.sheet-tab-item` with `border-radius: 6px` and an active outline class `.sheet-tab-item.outline` with `border-color: #7c3aed`.
3. **Dynamic Sidebar Options**: By tracking the sheets workspace grid selection state (e.g. `selectedSheetRange`) and the number of loaded worksheets (`sheetsData.length`), we can dynamically resolve the AI sidebar options to match:
   - *Column selected state*: when `selectedSheetRange` spans all rows of a single column.
   - *Multiple datasets state*: when `sheetsData.length > 1`.
   - *Default state*: otherwise.
4. **Data Relationships AI Flow**: When multiple files (e.g. `Customers.csv` and `Orders.xlsx`) are uploaded into the simulated Omni-Import portal, we will display a notification box with a sparkles icon asking to connect datasets, which creates both worksheets and establishes relation fields on click.

---

## 3. Caveats

* This is a read-only investigation. No files inside `Regaarder Compose` have been modified.
* The test scripts described in `TEST_INFRA.md` are not yet created, so E2E test execution cannot be run to verify the current state of sheets.

---

## 4. Conclusion

We have mapped the sheets workspace structure, designed the conditional swap layout, defined CSS rules for tab styling complying with `AGENTS.md`, and formulated a state-driven approach for the dynamic AI Assistant sidebar options. The implementer can proceed by executing these specific adjustments.

---

## 5. Verification Method

1. **Code Inspect**: Use `view_file` to inspect the specified lines in `src/App.jsx` to verify that `isSheetsMode` matches line 17733 and `['Data', 'Insert', ...]` matches line 25529.
2. **Tab Styling Check**: Ensure the new CSS selectors `.sheet-tab-item` and `.sheet-tab-item.outline` are added to `src/styles.css` and use border/outline properties rather than background highlights.
3. **Dynamic Assistant options**: Confirm that the mapped list under `activeRightTab === 'assistant'` references the dynamic `assistantOptions` array.
