const fs = require('fs');
const content = fs.readFileSync('src/App.jsx', 'utf8');

const start = content.indexOf('sheetChartMenu.open && (() => {');
const end   = content.indexOf('})()}', start);
const block = content.slice(start, end + 6);

// In JSX, when you put <rect/><rect/> directly inside an object literal value,
// those ARE valid JSX (they compile to React.createElement calls).
// BUT when you do:
//   { type: 'stacked_column', icon: <svg>...</svg> }
// The JSX inside the SVG with multiple children MUST be wrapped in <> </> or React.Fragment.
// Without it, the JSX parser sees it as an expression with multiple JSX siblings,
// which is a SYNTAX ERROR in JSX - even if esbuild happened to accept it.

// Let me extract EVERY icon definition from the block
const iconMatches = block.match(/icon: <svg[^>]*>[\s\S]*?<\/svg>/g) || [];
console.log(`Found ${iconMatches.length} SVG icon definitions:`);
iconMatches.forEach((m, i) => {
  const childTags = m.match(/<[a-z]+\s/g) || [];
  const hasFragment = m.includes('<>') || m.includes('React.Fragment');
  console.log(`\n[${i+1}] Children: ${childTags.length}, Has Fragment: ${hasFragment}`);
  console.log(m.slice(0, 200));
});

// Now find the ACTUAL problem: JSX with multiple root nodes at the same level
// inside an object literal. This is only a problem if SVG children are siblings
// at the top level of the <svg> element without a wrapping fragment.
// In JSX, <svg><rect/><rect/></svg> is FINE because <svg> is the root.
// But what about multi-line JSX assigned to object properties?

// Let's also check if the esbuild output has any issues
const distFile = fs.readdirSync('dist/assets').find(f => f.startsWith('index-') && f.endsWith('.js'));
if (distFile) {
  const dist = fs.readFileSync('dist/assets/' + distFile, 'utf8');
  // Look for undefined icon calls
  const undefinedIcon = dist.match(/React\.createElement\(void 0/g);
  console.log('\nUndefined React.createElement in bundle:', undefinedIcon ? undefinedIcon.length : 0);
}
