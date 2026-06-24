// This proves SVGs compile fine. Let's find the REAL blank page cause:
// The IIFE approach itself stores JSX elements in object literals BEFORE render.
// This is actually valid. Let's look at something else:
// the `Map` identifier - it shadows the global JS Map constructor!

const fs = require('fs');
const content = fs.readFileSync('src/App.jsx', 'utf8');

// Check: does anywhere in the file use `new Map(` or `Map.from(` etc.?
// If our import `Map` from lucide-react shadows the builtin Map, that's the crash
const newMapUsages = [];
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (/\bnew Map\b|\bMap\.from\b|\bMap\.entries\b/.test(line)) {
    newMapUsages.push({ line: i + 1, text: line.trim().slice(0, 120) });
  }
});
console.log('Uses of builtin Map constructor:', newMapUsages.length);
newMapUsages.forEach(u => console.log(`  Line ${u.line}: ${u.text}`));

// Also check useState(() => new Map()) initializations
const mapInits = [];
lines.forEach((line, i) => {
  if (/useState.*Map\(\)|useRef.*new Map/.test(line)) {
    mapInits.push({ line: i + 1, text: line.trim().slice(0, 120) });
  }
});
console.log('\nMap in useState/useRef:', mapInits.length);
mapInits.forEach(u => console.log(`  Line ${u.line}: ${u.text}`));

// Check for any .map() usage that could be broken by shadowing
// Actually .map() is fine, it's prototype method, not Map constructor
// The issue would be `new Map()` specifically
const newMapPattern = /\bnew\s+Map\s*\(/;
const critical = lines.filter((l, i) => newMapPattern.test(l));
console.log('\nCritical: `new Map(` usages:', critical.length);
critical.slice(0, 5).forEach(l => console.log(' ', l.trim().slice(0, 100)));
