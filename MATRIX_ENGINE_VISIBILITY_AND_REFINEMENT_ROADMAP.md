# Matrix Engine: Temporary Visibility Deferral & Next-Phase Refinement Roadmap

## 1. Executive Summary & Status
- **Current State:** Temporarily **HIDDEN** from the primary Sheets workspace top toolbar.
- **Location of Hidden Launcher:** [`src/App.jsx:50039`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/App.jsx#L50039-L50060)
- **Substrate Health:** The underlying engine ([`src/components/sheets/MatrixSchemaInspector.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/components/sheets/MatrixSchemaInspector.jsx) and [`src/services/matrixSchemaEngine.js`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/services/matrixSchemaEngine.js)) remains fully compiled, verified, and accessible internally via `window.__REGAARDER_OPEN_MATRIX_ENGINE__()` and within the `<MemoryDashboard>` sidebar.
- **Objective:** Complete full refinement of the remaining tabs and eliminate all remaining placeholders before exposing the feature prominently in the top navigation rail of the Sheets product.

---

## 2. Why the Button Was Hidden
In early user testing, having the prominent purple `[Calculator] Matrix Engine SQL` button in the top toolbar created an expectation of a fully finished end-user feature. While the **Schema Blueprint**, **Data Validation**, and **In-Browser SQL** engines have been elevated to Apple-tier empty states, other sub-features still contain mock placeholders or unfinished affordances. 

To preserve the clean, uncluttered, and executive aesthetic of Regaarder Compose (per `AGENTS.md` and `APPLE_GUIDING_PRINCIPLES.md`), the launcher button is hidden until the remaining subtabs are completely refined.

---

## 3. Inventory of Remaining Placeholders to Refine in Next Phase

### A. Formulas & Dependency Cycle Visualizer (`activeSubTab === 'formulas'`)
- **Current State:** Basic formula statistics badge and recalculation trigger. When formula count is 0, it displays an unstyled message without interactive formula builders.
- **Next Phase Refinements:**
  - Build an Apple-tier Formula Visualizer showing the reactive topological dependency DAG.
  - Implement real-time cycle detection warnings with step-by-step resolution suggestions (e.g. `A1 = B1 + 1` -> `B1 = A1 * 2`).
  - Add inline formula testing console supporting spreadsheet functions (`SUM`, `AVERAGE`, `IF`, `VLOOKUP`, `INDEX/MATCH`).

### B. Token-Dense Serialized Export (`activeSubTab === 'export'`)
- **Current State:** Raw JSON and Markdown table string displays.
- **Next Phase Refinements:**
  - Add 1-click syntax-highlighted code generators for Python (`pandas.DataFrame`), TypeScript interfaces, and SQL DDL (`CREATE TABLE`).
  - Include token counter telemetry showing exact savings of Regaarder token-dense matrix format versus raw JSON when ingested by LLMs.
  - Add native file download actions (`.csv`, `.parquet`, `.jsonl`).

### C. In-Browser SQL Auto-Completion & Query History (`activeSubTab === 'sql'`)
- **Current State:** SQL console with dynamic sample buttons, Apple-tier "Query Substrate Ready" standby state, and "0 Rows Matched" empty state.
- **Next Phase Refinements:**
  - Introduce contextual autocomplete popover anchored to the cursor for column names and SQL verbs (`SELECT`, `WHERE`, `GROUP BY`, `ORDER BY`, `LIMIT`).
  - Add persistent query history so previous queries can be re-run with 1 click.
  - Implement query execution plan viewer (Index Scan vs Full Grid Scan).

### D. Direct Column Schema Mutator
- **Current State:** Basic modal with text input and select dropdown.
- **Next Phase Refinements:**
  - Transform into an Apple-style contextual popover anchored directly over the column header.
  - Add support for advanced column constraint types (Min/Max numeric ranges, Regex pattern enforcement, and foreign key references).

---

## 4. How to Restore Visibility (Next Phase Activation)

When ready to make the Matrix Engine visible again in the Sheets toolbar, follow these simple steps:

1. Open [`src/App.jsx`](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/App.jsx#L50039).
2. Locate the line under `{/* Matrix Engine / Inspector Direct Launcher (Pillar 5) ... */}`:
   ```jsx
   {false && (
     <button
       type="button"
       onClick={() => { ... }}
       ...
     >
       <Calculator size={13} className="text-violet-600 dark:text-violet-400" />
       <span>Matrix Engine</span>
       <span className="text-[9.5px] px-1.5 py-0.2 bg-violet-200/70 dark:bg-violet-800/60 text-violet-800 dark:text-violet-200 rounded font-mono font-semibold">SQL</span>
     </button>
   )}
   ```
3. Change `{false && (` to `{true && (` (or remove the wrapper condition) to render the button back into the Sheets header.
4. Run `npm run build` to verify clean compilation.
