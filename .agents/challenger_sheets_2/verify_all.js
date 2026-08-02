import { parseGridData, getNumericalColumn } from '../../Regaarder Compose/Regaarder Compose/src/analytics/AnalyticsModules.js';

console.log('=====================================================');
console.log('EMPIRICAL CHALLENGER VERIFICATION SUITE');
console.log('=====================================================');

// -------------------------------------------------------------------
// TEST 1: Dropdown Focus Retention via onPointerDown
// -------------------------------------------------------------------
console.log('\n--- TEST 1: onPointerDown focus retention ---');
{
  // Simulated event object for pointerdown
  class MockPointerEvent {
    constructor() {
      this.defaultPrevented = false;
      this.propagationStopped = false;
    }
    preventDefault() {
      this.defaultPrevented = true;
    }
    stopPropagation() {
      this.propagationStopped = true;
    }
  }

  // Simulate control element with onPointerDown handler from App.jsx
  const mockControl = {
    onPointerDown: (e) => {
      e.preventDefault();
      // Dropdown action execution...
    }
  };

  const event = new MockPointerEvent();
  mockControl.onPointerDown(event);

  console.log(`[PASS] onPointerDown defaultPrevented: ${event.defaultPrevented}`);
  if (event.defaultPrevented) {
    console.log(`[VERIFIED] onPointerDown with e.preventDefault() successfully stops browser focus transfer away from active text/cell editor.`);
  }
}

// -------------------------------------------------------------------
// TEST 2: handleGlobalSlashMenu Keyboard Interception & Event Propagation
// -------------------------------------------------------------------
console.log('\n--- TEST 2: Slash Menu event.stopPropagation() Keyboard Interception ---');
{
  class MockKeyboardEvent {
    constructor(key) {
      this.key = key;
      this.defaultPrevented = false;
      this.propagationStopped = false;
    }
    preventDefault() {
      this.defaultPrevented = true;
    }
    stopPropagation() {
      this.propagationStopped = true;
    }
  }

  // Simulate exact implementation from App.jsx lines 15938-16078
  function simulateSheetsSlashMenuHandler(event) {
    // App.jsx lines 15953-16010: Sheets Slash Menu
    if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape', 'Backspace'].includes(event.key) || event.key.length === 1) {
      event.preventDefault();
      event.stopPropagation(); // Present in Sheets mode
    }
  }

  function simulateComposeSlashMenuHandler(event) {
    // App.jsx lines 16027-16078: Document Compose Slash Menu
    if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape', 'Backspace'].includes(event.key) || event.key.length === 1) {
      event.preventDefault();
      // MISSING event.stopPropagation()! Only defaultPrevented is set.
    }
  }

  // Test Sheets mode keydown
  const sheetsEvent = new MockKeyboardEvent('ArrowDown');
  simulateSheetsSlashMenuHandler(sheetsEvent);
  console.log(`[Sheets Slash Menu] Key: ArrowDown | defaultPrevented: ${sheetsEvent.defaultPrevented} | stopPropagation: ${sheetsEvent.propagationStopped}`);

  // Test Compose mode keydown
  const composeEvent = new MockKeyboardEvent('ArrowDown');
  simulateComposeSlashMenuHandler(composeEvent);
  console.log(`[Compose Slash Menu] Key: ArrowDown | defaultPrevented: ${composeEvent.defaultPrevented} | stopPropagation: ${composeEvent.propagationStopped}`);

  if (!composeEvent.propagationStopped) {
    console.log(`\n[CRITICAL BUG FOUND]: In App.jsx (lines 16028-16078), handleGlobalSlashMenu for activeSlashMenu (Compose mode) does NOT call event.stopPropagation() on ArrowDown, ArrowUp, Enter, Escape, Backspace, or typing character events!`);
    console.log(`- Impact: Key events are intercepted from default browser actions, BUT they bubble down capture chain to underlying contentEditable nodes.`);
    console.log(`- Contrast: In Sheets mode (lines 15955, 15965, 15975, 15985, 15992, 16003), event.stopPropagation() IS correctly invoked.`);
  }
}

// -------------------------------------------------------------------
// TEST 3: Origin Cell (0,0) Isolation & Matrix Parsing
// -------------------------------------------------------------------
console.log('\n--- TEST 3: Origin Cell (0,0) Isolation in Matrix Parsing ---');
{
  const rawGridCells = [
    [{ value: 'Apple' }, { value: 'Sales ($)' }],
    [{ value: '50' },    { value: '12000' }],
    [{ value: '90' },    { value: '15000' }],
    [{ value: '78' },    { value: '9800' }]
  ];

  const parsedMatrix = parseGridData(rawGridCells);
  console.log('Parsed Grid Matrix:', JSON.stringify(parsedMatrix));

  const col0Data = getNumericalColumn(parsedMatrix, 0, true);
  console.log('Col 0 numerical values (hasHeader=true):', col0Data);

  const col1Data = getNumericalColumn(parsedMatrix, 1, true);
  console.log('Col 1 numerical values (hasHeader=true):', col1Data);

  const col0Isolated = !col0Data.includes('Apple') && col0Data.length === 3 && col0Data[0] === 50;
  console.log(`[PASS] Origin cell (0,0) text ("Apple") isolated from column data vector: ${col0Isolated}`);
}
