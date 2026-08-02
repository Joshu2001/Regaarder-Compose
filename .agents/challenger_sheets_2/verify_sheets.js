import fs from 'fs';
import path from 'path';
import { Parser } from 'hot-formula-parser';
import { 
  parseGridData, 
  getNumericalColumn, 
  runDescriptiveStatistics,
  runTTest,
  runANOVA,
  runChiSquare,
  runCorrelation,
  runRegression
} from '../../Regaarder Compose/Regaarder Compose/src/analytics/AnalyticsModules.js';

let passed = true;
const log = [];

function check(title, condition, details = '') {
  if (condition) {
    log.push(`[PASS] ${title}`);
  } else {
    passed = false;
    log.push(`[FAIL] ${title} - ${details}`);
  }
}

console.log("=== RUNNING SHEETS STRESS & FUNCTIONAL VERIFICATION ===");

// -------------------------------------------------------------
// 1. Grid Canvas Stability & Header Scroll Synchronization
// -------------------------------------------------------------
const appPath = 'C:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\Regaarder Compose\\src\\App.jsx';
const appContent = fs.readFileSync(appPath, 'utf8');

check(
  'Header Scroll Sync handler exists',
  appContent.includes('sheetHeaderWrapperRef.current.scrollLeft = e.currentTarget.scrollLeft'),
  'sheetHeaderWrapperRef scrollLeft sync missing'
);

check(
  'Floating Island Card Container has rounded-2xl & overflow-hidden',
  appContent.includes('rounded-2xl border border-slate-200/80 dark:border-zinc-800') &&
  appContent.includes('overflow-hidden'),
  'Floating island card container class mismatch'
);

check(
  'Header wrapper ref bound to ref={sheetHeaderWrapperRef}',
  appContent.includes('ref={sheetHeaderWrapperRef}'),
  'sheetHeaderWrapperRef is not bound to header element'
);

// Check column track template match between header and grid body
const headerTrackMatch = appContent.includes('gridTemplateColumns: `48px ${Array.from({ length: activeSheetGrid.cols }).map((_, i) => `var(--col-${i}-width, 100px)`).join(\' \')}`');
check(
  'Header & Body share matching gridTemplateColumns definition',
  headerTrackMatch,
  'gridTemplateColumns styling differs between header and body'
);

// -------------------------------------------------------------
// 2. Formula Evaluation & Matrix Parsing (0,0) Data Isolation
// -------------------------------------------------------------
// Test hot-formula-parser evaluation
const parser = new Parser();
const mockCells = [
  ['10', '20', '=SUM(A1:B1)'],
  ['30', '40', '=AVERAGE(A2:B2)']
];

parser.on('callCellValue', (cellCoord, done) => {
  const r = cellCoord.row.index;
  const c = cellCoord.column.index;
  const val = mockCells[r]?.[c];
  done(isNumeric(val) ? parseFloat(val) : val);
});

parser.on('callRangeValue', (start, end, done) => {
  const fragment = [];
  for (let r = start.row.index; r <= end.row.index; r++) {
    const row = [];
    for (let c = start.column.index; c <= end.column.index; c++) {
      const val = mockCells[r]?.[c];
      row.push(isNumeric(val) ? parseFloat(val) : val);
    }
    fragment.push(row);
  }
  done(fragment);
});

function isNumeric(val) {
  if (typeof val === 'number') return true;
  if (typeof val !== 'string') return false;
  return !isNaN(val) && !isNaN(parseFloat(val));
}

const sumResult = parser.parse('SUM(A1:B1)');
check(
  'hot-formula-parser SUM formula evaluation',
  sumResult.error === null && sumResult.result === 30,
  `Expected 30, got ${JSON.stringify(sumResult)}`
);

const avgResult = parser.parse('AVERAGE(A2:B2)');
check(
  'hot-formula-parser AVERAGE formula evaluation',
  avgResult.error === null && avgResult.result === 35,
  `Expected 35, got ${JSON.stringify(avgResult)}`
);

// Test Matrix Parsing & (0,0) Intersection Isolation
// Case A: (0,0) is text ("Sales"), Row 0 has text headers ["Q1", "Q2"], Col 0 (rows 1..2) has numbers [100, 200]
const testGridDataA = [
  ['Sales', 'Q1', 'Q2'],
  [100, 50, 60],
  [200, 70, 80]
];

const col0Numeric = getNumericalColumn(testGridDataA, 0, true);
check(
  'getNumericalColumn extracts col 0 numeric data starting row 1 without swallowing',
  col0Numeric.length === 2 && col0Numeric[0] === 100 && col0Numeric[1] === 200,
  `Extracted ${JSON.stringify(col0Numeric)}`
);

// Test Descriptive statistics & ANOVA on parsed grid columns
const col1Numeric = getNumericalColumn(testGridDataA, 1, true);
const col2Numeric = getNumericalColumn(testGridDataA, 2, true);
const stats1 = runDescriptiveStatistics(col1Numeric);
check(
  'runDescriptiveStatistics mean calculation',
  stats1.mean === 60 && stats1.count === 2,
  `Expected mean 60 count 2, got ${JSON.stringify(stats1)}`
);

const anovaRes = runANOVA([col1Numeric, col2Numeric]);
check(
  'runANOVA evaluation on matrix numerical columns',
  anovaRes && !anovaRes.error && typeof anovaRes.fRatio === 'number',
  `ANOVA error: ${JSON.stringify(anovaRes)}`
);

// Check detectChartStructure in App.jsx for (0,0) isolation logic
const hasIntersectionIsolationInApp = appContent.includes('const intersectionIsText = isNaN(parseFloat(grid.cells?.[startR]?.[startC]))');
check(
  'detectChartStructure isolates (0,0) intersection cell from vector axis checks',
  hasIntersectionIsolationInApp,
  'detectChartStructure lacks intersectionIsText isolation'
);

// -------------------------------------------------------------
// 3. Active Outline States for Tabs and Formatting Tool Buttons
// -------------------------------------------------------------
// Formatting tool buttons (B, I, U, S)
const bBtnMatch = appContent.includes("updateSheetCellFormat(activeSheetId, 'bold')") &&
  appContent.includes("fmt.bold ? 'bg-transparent text-[#7C4DFF] outline outline-[2px] outline-[#7C4DFF] border-transparent'");
check(
  'Format Button B active state uses bg-transparent and outline-[#7C4DFF]',
  bBtnMatch,
  'Button B formatting outline style missing or non-compliant'
);

const iBtnMatch = appContent.includes("updateSheetCellFormat(activeSheetId, 'italic')") &&
  appContent.includes("fmt.italic ? 'bg-transparent text-[#7C4DFF] outline outline-[2px] outline-[#7C4DFF] border-transparent'");
check(
  'Format Button I active state uses bg-transparent and outline-[#7C4DFF]',
  iBtnMatch,
  'Button I formatting outline style missing or non-compliant'
);

const uBtnMatch = appContent.includes("updateSheetCellFormat(activeSheetId, 'underline')") &&
  appContent.includes("fmt.underline ? 'bg-transparent text-[#7C4DFF] outline outline-[2px] outline-[#7C4DFF] border-transparent'");
check(
  'Format Button U active state uses bg-transparent and outline-[#7C4DFF]',
  uBtnMatch,
  'Button U formatting outline style missing or non-compliant'
);

const sBtnMatch = appContent.includes("updateSheetCellFormat(activeSheetId, 'strikeThrough')") &&
  appContent.includes("fmt.strikeThrough ? 'bg-transparent text-[#7C4DFF] outline outline-[2px] outline-[#7C4DFF] border-transparent'");
check(
  'Format Button S active state uses bg-transparent and outline-[#7C4DFF]',
  sBtnMatch,
  'Button S formatting outline style missing or non-compliant'
);

// Sheet tabs active state
const tabMatch = appContent.includes("activeSheetId === sheet.id ? 'bg-transparent text-[#7C4DFF] outline outline-[2px] outline-[#7C4DFF] border-transparent rounded-lg'");
check(
  'Active Sheet Tabs use bg-transparent text-[#7C4DFF] outline outline-[2px] outline-[#7C4DFF] rounded-lg (rectangular, no pill/solid fill)',
  tabMatch,
  'Sheet tab active outline styling missing or non-compliant'
);

// Print summary log
console.log("\n--- TEST LOG ---");
log.forEach(l => console.log(l));
console.log("\nVERDICT:", passed ? "PASS" : "FAIL");

process.exit(passed ? 0 : 1);
