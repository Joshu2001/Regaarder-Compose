const fs = require('fs');
const content = fs.readFileSync('src/App.jsx', 'utf8');

// ── 1. Verify IIFE boundaries ────────────────────────────────────────────────
const start = content.indexOf('sheetChartMenu.open && (() => {');
const end   = content.indexOf('})()}', start);
const block = content.slice(start, end + 6);

let depth = 0;
for (let i = 0; i < block.length; i++) {
  if (block[i] === '(') depth++;
  if (block[i] === ')') depth--;
}
console.log('Paren balance:', depth, '(0 = balanced)');

// ── 2. Detect stale/corrupt whiteboard shape block ────────────────────────────
const corruptPattern = /\{whiteboardShapeMenuOpen && \(\s*\)\)\}/;
const hasCorrupt = corruptPattern.test(content);
console.log('Corrupt whiteboardShapeMenuOpen remnant:', hasCorrupt);

// ── 3. Find the App function's return statement and check for early returns ───
const earlyReturns = [];
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.trim().startsWith('return') && i > 700 && i < 1000) {
    earlyReturns.push({ line: i + 1, text: line.trim().slice(0, 80) });
  }
});
console.log('Early returns (lines 700-1000):', earlyReturns);

// ── 4. Detect any undefined icon reference patterns ───────────────────────────
const iconRefs = block.match(/<[A-Z][a-zA-Z]+ size=\{24\}/g) || [];
console.log('Icon references in chart block:', [...new Set(iconRefs)]);

// ── 5. Check the main App component's JSX root – look for mismatched tags ────
const returnIndex = content.lastIndexOf('  return (');
console.log('Last main return at approx line:', content.slice(0, returnIndex).split('\n').length);

// ── 6. Look for JSX elements that define SVG children outside fragments  ──────
const svgNoKey = block.match(/<svg[^>]*>(<[a-z]+[^>]*\/>){2,}<\/svg>/g) || [];
console.log('SVG elements with multiple children (no fragment):', svgNoKey.length);
