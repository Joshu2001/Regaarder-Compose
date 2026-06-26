const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

// Update Table
const tableOld = `<div contenteditable="false" style="margin:12px 0;"><table`;
const tableNew = `<div class="table-block" data-block-type="table" contenteditable="false" style="margin:12px 0; position:relative; border-radius:8px;"><table`;
app = app.replace(tableOld, tableNew);

// Update Callout
const calloutOld = `<div style="border-left:3px solid #8b5cf6;padding:12px 16px;background:#faf5ff;border-radius:0 8px 8px 0;margin:12px 0;color:#4c1d95;font-style:italic">`;
const calloutNew = `<div class="callout-block" data-block-type="callout" style="border-left:3px solid #8b5cf6;padding:12px 16px;background:#faf5ff;border-radius:0 8px 8px 0;margin:12px 0;color:#4c1d95;font-style:italic; transition:background 0.3s ease;">`;
// The slash handler
app = app.replace(calloutOld, calloutNew);
// The insert menu
app = app.replace(calloutOld, calloutNew); // Since there are two instances (slash menu and insert menu)
app = app.replace(calloutOld, calloutNew);

// Update Code Block
const codeOld = `<div style="background:#1e293b;border-radius:8px;padding:16px;margin:12px 0;font-family:monospace;font-size:13px;color:#e2e8f0;white-space:pre">`;
const codeNew = `<div class="code-block" data-block-type="code_block" style="background:#1e293b;border-radius:8px;padding:16px;margin:12px 0;font-family:monospace;font-size:13px;color:#e2e8f0;white-space:pre; transition:background 0.3s ease;">`;
app = app.replace(codeOld, codeNew);
app = app.replace(codeOld, codeNew);
app = app.replace(codeOld, codeNew);

// Update Divider
const divOld = `<hr style="border:none;border-top:2px solid #e2e8f0;margin:20px 0" />`;
const divNew = `<div class="divider-block" data-block-type="divider" style="padding:10px 0; margin:10px 0; border-radius:6px; transition:background 0.3s ease;"><hr style="border:none;border-top:2px solid #e2e8f0;margin:0" /></div>`;
app = app.replace(divOld, divNew);
app = app.replace(divOld, divNew);
app = app.replace(divOld, divNew);

fs.writeFileSync('src/App.jsx', app);
console.log('Blocks updated with data-block-type attributes.');
