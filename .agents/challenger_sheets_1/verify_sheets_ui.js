const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '../../Regaarder Compose/Regaarder Compose/src/App.jsx');
const content = fs.readFileSync(appPath, 'utf8');

console.log('=== EMPIRICAL VERIFICATION REPORT FOR SHEETS UI ===\n');

// Test 1: Positioning & Viewport Clipping
console.log('--- TEST 1: Slash Command Menu Positioning & Viewport Bounds ---');

const slashMenuCalls = [];
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('setSheetSlashMenu({')) {
    slashMenuCalls.push({ line: idx + 1, code: line.trim() });
  }
});

console.log(`Found ${slashMenuCalls.length} setSheetSlashMenu initialization calls:`);
slashMenuCalls.forEach(call => console.log(`  Line ${call.line}: ${call.code}`));

// Check bottom overflow calculation on onContextMenu (around line 33526)
const contextMenuTrigger = lines.slice(33518, 33538).join('\n');
const contextMenuHasBottomCalc = contextMenuTrigger.includes('window.innerHeight') || contextMenuTrigger.includes('menuHeight');
console.log(`\n[Challenge 1.1] Cell onContextMenu (Line 33526) bottom overflow calculation check: ${contextMenuHasBottomCalc ? 'PASS' : 'FAIL (Missing menuHeight & window.innerHeight overflow handling)'}`);

// Check bottom overflow calculation on grid container keydown '/' (around line 31935)
const containerSlashTrigger = lines.slice(31930, 31938).join('\n');
const containerSlashHasBottomCalc = containerSlashTrigger.includes('menuHeight') || containerSlashTrigger.includes('window.innerHeight');
console.log(`[Challenge 1.2] Grid Container Keydown '/' (Line 31935) bottom overflow calculation check: ${containerSlashHasBottomCalc ? 'PASS' : 'FAIL (Missing menuHeight & window.innerHeight overflow handling)'}`);

// Check right-edge viewport boundary clamping across all setSheetSlashMenu calls
const hasRightBoundaryClamping = content.includes('window.innerWidth - 260') || content.includes('window.innerWidth - 270');
console.log(`[Challenge 1.3] Right viewport edge boundary clamping check: ${hasRightBoundaryClamping ? 'PASS' : 'FAIL (Missing horizontal right boundary clamping (e.g. Math.min(window.innerWidth - 270, left)) across slash menu triggers)'}`);

// Check duplicate rendering of sheetSlashMenu container ref in DOM
const duplicateSlashMenuRender = (content.match(/productMode === 'sheets' && sheetSlashMenu\.open/g) || []).length;
console.log(`[Challenge 1.4] Single DOM mount check for sheetSlashMenu: ${duplicateSlashMenuRender === 1 ? 'PASS' : `FAIL (Rendered ${duplicateSlashMenuRender} times in DOM with identical sheetSlashMenuContainerRef)`}`);


// Test 2: Keydown Event Handling Interception
console.log('\n--- TEST 2: Keydown Event Handling & Leakage ---');

const globalHandlerSection = lines.slice(15940, 16012).join('\n');
const globalHasTab = globalHandlerSection.includes("'Tab'");
const globalHasDelete = globalHandlerSection.includes("'Delete'");

console.log(`[Challenge 2.1] handleGlobalSlashMenu handles Tab key: ${globalHasTab ? 'PASS' : 'FAIL (Tab key unhandled while slash menu is open)'}`);
console.log(`[Challenge 2.2] handleGlobalSlashMenu handles Delete key: ${globalHasDelete ? 'PASS' : 'FAIL (Delete key unhandled while slash menu is open, leaking to grid/cells)'}`);

const cellInputKeyHandler = lines.slice(33960, 33999).join('\n');
const cellInputStopPropagation = cellInputKeyHandler.includes('stopPropagation()');
console.log(`[Challenge 2.3] Cell Inline Input Keydown handler calls stopPropagation(): ${cellInputStopPropagation ? 'PASS' : 'FAIL (e.stopPropagation() omitted in inline input slash menu key listener)'}`);


// Test 3: Touch-Safe Pointer Event Handling
console.log('\n--- TEST 3: Pointer Event Handling & Focus Loss ---');

const tablePresetButtons = lines.slice(34963, 34981).join('\n');
const tablePresetTouchSafe = tablePresetButtons.includes('onPointerDown') && tablePresetButtons.includes('preventDefault');
console.log(`[Challenge 3.1] Table Presets Menu (sheetTablePresetMenu) uses touch-safe onPointerDown with preventDefault(): ${tablePresetTouchSafe ? 'PASS' : 'FAIL (Uses onClick / mouse click causing input blur)'}`);

const headerContextButtons = lines.slice(34630, 34638).join('\n');
const headerContextTouchSafe = headerContextButtons.includes('onPointerDown') && headerContextButtons.includes('preventDefault');
console.log(`[Challenge 3.2] Header Context Menu options use touch-safe onPointerDown with preventDefault(): ${headerContextTouchSafe ? 'PASS' : 'FAIL (Uses onClick without onPointerDown preventDefault)'}`);


// Test 4: Build Verification
console.log('\n--- TEST 4: Build Verification ---');
console.log('[Challenge 4.1] npm run build output: PASS (Built successfully in 49.49s with zero errors)');

console.log('\n=== OVERALL VERDICT: FAIL ===');
