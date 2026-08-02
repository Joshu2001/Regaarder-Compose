# Comprehensive Investigation Report: Active Control States, Navigation Tab Styling, and Spreadsheet Grid Stability

**Investigator:** teamwork_preview_explorer (subagent)  
**Milestone:** M1/R3 & R4  
**Date:** 2026-07-31  

---

## 1. Observation

Direct code observations from `c:\Users\user\Downloads\Project MOAT\Regaarder Compose\Regaarder Compose\src\`:

### A. Sheets Toolbar Navigation Tabs
- **Location:** `App.jsx`, lines 31121–31137
- **Code:**
  ```jsx
  {['Data', 'Templates', 'Analyze', 'Visualize'].map((tab) => (
    <button
      key={tab}
      type="button"
      onClick={(e) => {
        if (tab === 'Data') {
          setSheetToolbarTab(sheetToolbarTab === 'Data' ? null : 'Data');
        } else {
          setSheetToolbarTab(sheetToolbarTab === tab ? null : tab);
          showToast(`${tab} tools ready`);
        }
      }}
      className={`px-3 py-1.5 rounded-[6px] border text-sm font-semibold transition-colors ${sheetToolbarTab === tab ? 'bg-slate-100 text-slate-900 border-transparent dark:bg-zinc-800 dark:text-zinc-100' : 'border-transparent hover:bg-gray-100 text-[#374151] dark:text-[#a3a3a3] dark:hover:bg-[#1c1c1e]'}`}
    >
      {tab}
    </button>
  ))}
  ```
- **Finding:** Active tab state uses solid background fill `bg-slate-100` (`dark:bg-zinc-800`) with `border-transparent`. Corners use `rounded-[6px]` (slightly rounded rectangle).

### B. Bottom Sheet Tabs
- **Location:** `App.jsx`, lines 33947–33959
- **Code:**
  ```jsx
  {sheetsData.map((sheet) => (
    <button
      key={sheet.id}
      type="button"
      onClick={() => {
        setActiveSheetId(sheet.id);
        setSheetsTitle(sheet.title);
      }}
      className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[13px] font-medium tracking-wide transition-colors ${activeSheetId === sheet.id ? 'bg-violet-50 text-violet-700' : 'hover:bg-gray-100 text-[#374151]'}`}
    >
      {sheet.title.split(' ')[0]}
    </button>
  ))}
  ```
- **Finding:** Active sheet tab uses solid background fill `bg-violet-50 text-violet-700` instead of a border-only outline.

### C. Text Formatting Tools (Bold, Italic, Underline, Strikethrough)
- **Location:** `App.jsx`, lines 31613–31616
- **Code:**
  ```jsx
  <button type="button" onPointerDown={(e) => { e.preventDefault(); updateSheetCellFormat(activeSheetId, 'bold'); }} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors font-bold ${fmt.bold ? 'bg-violet-50 text-violet-700' : 'hover:bg-gray-100 text-[#374151]'}`}>B</button>
  <button type="button" onPointerDown={(e) => { e.preventDefault(); updateSheetCellFormat(activeSheetId, 'italic'); }} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors italic font-serif ${fmt.italic ? 'bg-violet-50 text-violet-700' : 'hover:bg-gray-100 text-[#374151]'}`}>I</button>
  <button type="button" onPointerDown={(e) => { e.preventDefault(); updateSheetCellFormat(activeSheetId, 'underline'); }} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors underline ${fmt.underline ? 'bg-violet-50 text-violet-700' : 'hover:bg-gray-100 text-[#374151]'}`}>U</button>
  <button type="button" onPointerDown={(e) => { e.preventDefault(); updateSheetCellFormat(activeSheetId, 'strikeThrough'); }} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors line-through ${fmt.strikeThrough ? 'bg-violet-50 text-violet-700' : 'hover:bg-gray-100 text-[#374151]'}`}>S</button>
  ```
- **Finding:** Active formatting tool states apply solid color background fill `bg-violet-50 text-violet-700`.

### D. Search Mode & Redact Sub-navigation Tabs
- **Location:** `App.jsx`, lines 31448–31456
- **Code:**
  ```jsx
  className={`px-2 py-1 rounded-md transition-colors ${docSearchMode === item.key ? 'bg-violet-100 text-violet-700' : 'text-gray-600 hover:bg-gray-100'}`}
  ```
- **Finding:** Uses `bg-violet-100 text-violet-700` background fill for active tab state.

### E. Analytics Hub UI Module Navigation
- **Location:** `src/analytics/AnalyticsHubUI.jsx`, lines 262–271
- **Code:**
  ```jsx
  className={`w-full flex items-center justify-between text-left px-3.5 py-2.5 rounded-xl transition-all text-xs font-medium ${selectedModule === id ? 'bg-violet-50 text-violet-700 border-l-4 border-violet-600 dark:bg-violet-950/20 dark:text-violet-400' : 'text-slate-650 hover:bg-slate-50 dark:hover:bg-white/5'}`}
  ```
- **Finding:** Uses `bg-violet-50` fill with `border-l-4 border-violet-600` instead of full border outline.

### F. Left Sidebar Thumbnail Active State (Existing Reference Pattern)
- **Location:** `App.jsx`, lines 30757–30761
- **Code:**
  ```jsx
  className={`flex-1 relative rounded-[14px] overflow-hidden border border-gray-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)] aspect-[16/9] transition-all ${
    isActive 
      ? 'outline outline-[2px] outline-[#7C4DFF] outline-offset-1 shadow-md' 
      : 'hover:border-gray-300'
  }`}
  ```
- **Finding:** Established design pattern for active outline already present in line 30759: `outline outline-[2px] outline-[#7C4DFF]`.

### G. Grid Formula Calculation, Scroll Sync & Build System
- **Formula Engine:** `App.jsx`, lines 22691–22729 uses `hot-formula-parser` (`new Parser()`) memoized in `activeSheetGrid`.
- **Scroll Sync:** `App.jsx`, line 31767 synchronizes horizontal scroll (`sheetHeaderWrapperRef.current.scrollLeft = e.currentTarget.scrollLeft`).
- **Data Grid Heuristics:** `src/analytics/AnalyticsModules.js`, lines 26–39 strictly isolates cell `(0,0)` to prevent Axis Overlap Fallacies per AGENTS.md Section 7.
- **Build System:** `package.json` script `"build": "vite build"`, `vite.config.js` configures unminified builds and warning suppression.

---

## 2. Logic Chain

1. **Observation to Rule Comparison:**
   - AGENTS.md Section 2 specifies that active visual states must be referred to and styled with "outline" rather than "highlight" or solid background fills.
   - AGENTS.md Section 3 requires navigation tabs to be styled as slightly rounded rectangles (non-pill-shaped).
   - Milestone R3 explicitly requires active states to use border-only rectangular outline styling (`outline-[2px] outline-[#7C4DFF]`) with clear backgrounds.

2. **Analysis of Current Violations:**
   - Toolbar tabs (lines 31133), bottom sheet tabs (line 33955), active formatting tool highlights (lines 31613-31616), search mode tabs (line 31452), and analytics module items (`AnalyticsHubUI.jsx` line 266) currently use solid color background fills (`bg-slate-100`, `bg-violet-50`, `bg-violet-100`).
   - These solid fills obscure background clarity and violate border-only outline directives.

3. **Derivation of Exact Class Replacements:**
   - Standardize all active navigation tabs and tool states to use:
     `bg-transparent text-[#7C4DFF] outline outline-[2px] outline-[#7C4DFF] border-transparent`
   - Preserve `rounded-[6px]` or `rounded-lg` / `rounded-md` on buttons to maintain slightly rounded rectangular corners.

4. **Impact Assessment on Grid Stability:**
   - Toolbar tab and control button styling resides strictly in JSX render templates for UI buttons.
   - Formula evaluation (`activeSheetGrid`), table grid models (`sheetGrids`), cell formatting maps (`formats`), and scroll synchronization (`onScroll`) are cleanly decoupled from active button CSS class names.
   - Refactoring button active state classes will not alter data references, event handlers, or grid rendering loops.

---

## 3. Caveats

- **Network Environment:** Operating in CODE_ONLY mode (no external HTTP calls).
- **Scope Limit:** Investigation is read-only. Proposed class changes are provided verbatim for the implementer subagent.
- **Dropdown Overlays:** Sub-menus (e.g. export menu, font dropdowns) use floating absolute containers; changing tab outline classes does not affect overlay z-indexes or bounding rect anchor logic.

---

## 4. Conclusion

The codebase currently contains several active state violations where navigation tabs and active toolbar controls use solid color fills (`bg-slate-100`, `bg-violet-50`, `bg-violet-100`) instead of border-only rectangular outlines.

All navigation tabs already maintain slightly rounded rectangular corner radiuses (`rounded-[6px]`, `rounded-lg`, `rounded-md`). To achieve full compliance with AGENTS.md Sections 2, 3, 8 and M1/R3 requirements:
1. Replace solid background active classes on Toolbar Tabs (`App.jsx`:31133), Bottom Sheet Tabs (`App.jsx`:33955), Formatting Buttons (`App.jsx`:31613-31616), Search Tabs (`App.jsx`:31452), and Analytics Module Tabs (`AnalyticsHubUI.jsx`:266) with `bg-transparent text-[#7C4DFF] outline outline-[2px] outline-[#7C4DFF] border-transparent`.
2. Grid formula parsing (`hot-formula-parser`), table rendering, intersection isolation heuristics, and header scroll event handlers are completely independent of UI tab active state classes and will remain 100% stable.

---

## 5. Verification Method

### Concrete Verification Steps
1. **File Inspection:**
   - Inspect `c:\Users\user\Downloads\Project MOAT\Regaarder Compose\Regaarder Compose\src\App.jsx` at lines 31133, 31452, 31613-31616, and 33955 using `view_file`.
   - Inspect `c:\Users\user\Downloads\Project MOAT\Regaarder Compose\Regaarder Compose\src\analytics\AnalyticsHubUI.jsx` at line 266 using `view_file`.
2. **Build Verification Command:**
   - Command: `npm run build` in directory `c:\Users\user\Downloads\Project MOAT\Regaarder Compose\Regaarder Compose`.
   - Expected Result: Clean build completion with 0 errors.
3. **Invalidation Conditions:**
   - Any active state retaining solid background fill (`bg-slate-100`, `bg-violet-50`, `bg-violet-100`).
   - Any tab adopting elliptical/pill shape (`rounded-full`).
   - Any regression in grid formula evaluation (`Parser`) or header scroll alignment (`onScroll`).
