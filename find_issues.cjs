const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx', 'utf8');
const lines = content.split(/\r?\n/);

// Find sheetGrids useState 
console.log('=== sheetGrids useState ===');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const [sheetGrids') && lines[i].includes('useState')) {
    for (let j = Math.max(0, i-2); j <= Math.min(lines.length-1, i+30); j++) {
      console.log(`${j+1}: ${lines[j]}`);
    }
    console.log('---');
  }
}

// Find activeSheetId useState
console.log('\n=== activeSheetId useState ===');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const [activeSheetId') && lines[i].includes('useState')) {
    for (let j = Math.max(0, i-2); j <= Math.min(lines.length-1, i+5); j++) {
      console.log(`${j+1}: ${lines[j]}`);
    }
    console.log('---');
  }
}

// Find updateSheetSettings
console.log('\n=== updateSheetSettings function body ===');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const updateSheetSettings') || lines[i].includes('function updateSheetSettings')) {
    for (let j = Math.max(0, i-2); j <= Math.min(lines.length-1, i+25); j++) {
      console.log(`${j+1}: ${lines[j]}`);
    }
    console.log('---');
  }
}

// Find the filter in sheetGrids
console.log('\n=== sheetGrids filter or reduce calls ===');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('sheetGrids') && (lines[i].includes('filter') || lines[i].includes('reduce') || lines[i].includes('Object.keys') || lines[i].includes('Object.entries'))) {
    console.log(`${i+1}: ${lines[i].trim()}`);
  }
}

// Find setSheetGrids usage that might corrupt state
console.log('\n=== setSheetGrids calls ===');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('setSheetGrids(')) {
    console.log(`${i+1}: ${lines[i].trim()}`);
  }
}

// Find any calls to activeSheetGrid.rows or activeSheetGrid.cells without guard
console.log('\n=== activeSheetGrid.cells[ (direct index) ===');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('activeSheetGrid.cells[') && !lines[i].includes('activeSheetGrid.cells?.[')) {
    console.log(`${i+1}: ${lines[i].trim()}`);
  }
}

// Where does `sheets` tab button exist 
console.log('\n=== sheets tab/button mode switcher ===');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("setProductMode") && lines[i].includes("sheets")) {
    console.log(`${i+1}: ${lines[i].trim()}`);
  }
}
