## 2026-07-31T01:10:47Z
Refactor and align the Sheets workspace layout and UI components in Regaarder Compose to mirror Compose (Docs) as the benchmark reference for executive-tier visual minimalism, floating island architecture, low cognitive load, and brand consistency.

Target Codebase: c:\Users\user\Downloads\Project MOAT\Regaarder Compose\Regaarder Compose
Target Files:
- src/App.jsx
- src/analytics/AnalyticsHubUI.jsx (if applicable for R3 active state styling)

Detailed Requirements & Findings:
1. Requirement 1 (R1) - Floating Island Architecture:
Refactor 5 core Sheets mode containers in App.jsx:
- Top View Switcher Tabs Bar (~line 31142)
- Formatting Toolbar Bar (~line 31427)
- Formula Bar (~line 31669)
- Grid Card Container & Sheet Column Headers (~lines 31700-33941)
- Bottom Worksheets Tabs Bar & Status Footer (~lines 33945-34007)

2. Requirement 2 (R2) - Typography, Progressive Disclosure & Slash Menu:
- Font standardization (Manrope/Outfit/Inter from FONT_FAMILY_MAP).
- Replace 'Highlight' label in formatting popover (~line 31643) with executive terminology ('Fill Color' or 'Background Outline').
- Group Row/Column modifier buttons (+ Row, - Row, + Col, - Col) into progressive disclosure popover.
- Slash Command ('/') Menu Architecture: remove duplicate JSX block rendering sheetSlashMenu (~lines 34791-34840), keeping portal render (~lines 44946-45017).
  Ensure dynamic positioning using target.getBoundingClientRect().
  In handleGlobalSlashMenu (~lines 15940-16003), add event.stopPropagation() on open menu keystrokes.

3. Requirement 3 (R3) - Active Outline States & Tab Styling:
- UI Statuses: Active visual state MUST use border-only rectangular outline (`outline-[2px] outline-[#7C4DFF]`), transparent background `bg-transparent`, and text color `text-[#7C4DFF]`. Strictly avoid solid color background fills (`bg-slate-100`, `bg-violet-50`, `bg-violet-100`).
- Navigation Tabs: Active and inactive tab items MUST be styled as slightly rounded rectangles (`rounded-[6px]`, `rounded-md`, `rounded-lg`). Under no circumstances should tabs be rendered as pill-shaped or elliptical (`rounded-full`).
- Locations to update:
  - Sheets Toolbar Tabs (App.jsx ~line 31144)
  - Bottom Sheet Tabs (App.jsx ~line 33955)
  - Formatting Tool Buttons B, I, U, S (App.jsx ~lines 31613-31616)
  - Search Mode Tabs (App.jsx ~line 31452)
  - Analytics Module Tabs (src/analytics/AnalyticsHubUI.jsx ~line 266)

4. Requirement 4 (R4) - Build Verification & Integrity:
- `npm run build` inside `c:\Users\user\Downloads\Project MOAT\Regaarder Compose\Regaarder Compose`
- Vite compiles cleanly with 0 errors.
- Ensure grid formula parser, scroll sync, and table rendering remain fully functional.
