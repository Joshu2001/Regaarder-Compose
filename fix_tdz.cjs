const fs = require('fs');
const content = fs.readFileSync('src/App.jsx', 'utf8');
const lines = content.split('\n');

const startChart = lines.findIndex(l => l.includes('const renderSharedChartPicker = () => {'));
const startShape = lines.findIndex(l => l.includes('const renderSharedShapePicker = () => {'));
const endShape = lines.findIndex(l => l.includes('const renderDocumentOutlineContent = () => {'));

if (startChart === -1 || startShape === -1 || endShape === -1) {
  console.error('Could not find functions', {startChart, startShape, endShape});
  process.exit(1);
}

const functionsLines = lines.splice(startChart, endShape - startChart);

const insertIdx = lines.findIndex(l => l.includes("if (productMode === 'deck' || productMode === 'sheets') {"));

if (insertIdx === -1) {
  console.error('Could not find insertion point');
  process.exit(1);
}

lines.splice(insertIdx, 0, ...functionsLines);

// Also fix handleOutsideClick
const handleOutsideClickTarget = "if (!e.target.closest('.absolute.z-\\\\[100\\\\]')) {";
const handleOutsideClickReplacement = "if (e.target && typeof e.target.closest === 'function' && !e.target.closest('.absolute.z-\\\\[100\\\\]')) {";

let foundOutsideClick = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes(handleOutsideClickTarget)) {
    lines[i] = lines[i].replace(handleOutsideClickTarget, handleOutsideClickReplacement);
    foundOutsideClick = true;
    break;
  }
}

if (!foundOutsideClick) {
  console.error('Could not find handleOutsideClick target');
}

fs.writeFileSync('src/App.jsx', lines.join('\n'));
console.log('Fixed App.jsx');
