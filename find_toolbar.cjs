const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx', 'utf8');
const lines = content.split(/\r?\n/);

console.log('--- Sheets Toolbar Buttons ---');
for (let i = 22090; i < 22160; i++) {
  if (lines[i].includes('showToast(\'Undo not available in demo\')')) {
    for (let j = i; j < i + 10; j++) {
      console.log(`${j+1}: ${lines[j]}`);
    }
    break;
  }
}

console.log('--- Sheets Font Picker ---');
for (let i = 22100; i < 22170; i++) {
  if (lines[i].includes('sheetToolbarMenuOpen === \'font\'')) {
    for (let j = i - 3; j < i + 15; j++) {
      console.log(`${j+1}: ${lines[j]}`);
    }
    break;
  }
}

console.log('--- Sheets Size Picker ---');
for (let i = 22120; i < 22180; i++) {
  if (lines[i].includes('sheetToolbarMenuOpen === \'size\'')) {
    for (let j = i - 3; j < i + 15; j++) {
      console.log(`${j+1}: ${lines[j]}`);
    }
    break;
  }
}

