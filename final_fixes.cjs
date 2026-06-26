const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Fix 'symbols' and 'equations' slash command keys
const oldExecStart = `if (key === 'emoji') { setComposeEmojiPickerOpen(true); return; }
    if (key === 'symbol') { setSymbolsPickerOpen(true); return; }
    if (key === 'equation') { setEquationsPickerOpen(true); return; }`;

const newExecStart = `if (key === 'emoji') { setComposeEmojiPickerOpen(true); return; }
    if (key === 'symbols' || key === 'symbol') { setSymbolsPickerOpen(true); return; }
    if (key === 'equations' || key === 'equation') { setEquationsPickerOpen(true); return; }`;

if (app.includes(oldExecStart)) {
  app = app.replace(oldExecStart, newExecStart);
  console.log('Fixed symbols and equations slash command keys.');
} else {
  console.log('Could not find old symbols/equations block.');
}

// 2. Fix bullets to open list picker instead of formatting directly
const oldBullets = `} else if (key === 'bullets') {
      applyFormatCommand('insertUnorderedList');
    } else if (key === 'numbered') {
      applyFormatCommand('insertOrderedList');
    }`;

const newBullets = `} else if (key === 'bullets') {
      setListGalleryOpen('bullet');
      return;
    } else if (key === 'numbered') {
      setListGalleryOpen('numbered');
      return;
    }`;

if (app.includes(oldBullets)) {
  app = app.replace(oldBullets, newBullets);
  console.log('Fixed bullets to open ListGalleryPicker.');
} else if (app.includes("} else if (key === 'bullets') {\\n      applyFormatCommand('insertUnorderedList');\\n    } else if (key === 'icon') {")) {
  // Fallback if numbered isn't there
  app = app.replace(
    "} else if (key === 'bullets') {\n      applyFormatCommand('insertUnorderedList');\n    } else if (key === 'icon') {",
    "} else if (key === 'bullets') {\n      setListGalleryOpen('bullet');\n      return;\n    } else if (key === 'icon') {"
  );
  console.log('Fixed bullets to open ListGalleryPicker (fallback).');
} else {
  console.log('Could not find old bullets block.');
}

// 3. Revert Media in Insert Menu
const oldMedia = `executeSlashCommand('image'); setInsertDropdownOpen(false);`;
const newMedia = `setMediaPickerOpen(true); setInsertDropdownOpen(false);`;
// We only want to replace this in the compose-media-btn
const mediaBtnStr = `<button id="compose-media-btn" onPointerDown={(e) => { e.preventDefault(); executeSlashCommand('image'); setInsertDropdownOpen(false); }}`;
const newMediaBtnStr = `<button id="compose-media-btn" onPointerDown={(e) => { e.preventDefault(); setMediaPickerOpen(true); setInsertDropdownOpen(false); }}`;
if (app.includes(mediaBtnStr)) {
  app = app.replace(mediaBtnStr, newMediaBtnStr);
  console.log('Reverted Media button in Insert menu.');
} else {
  console.log('Could not find media button string.');
}

fs.writeFileSync('src/App.jsx', app);
console.log('Final fixes applied.');
