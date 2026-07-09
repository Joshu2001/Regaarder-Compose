const fs = require('fs');

const filePath = 'c:/Users/user/Downloads/Project MOAT/Regaarder Compose/src/App.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Helper to replace matching patterns with regex ignoring whitespace
function regexReplace(targetRegex, replacement) {
  if (targetRegex.test(content)) {
    console.log(`Replacing pattern: ${targetRegex}`);
    content = content.replace(targetRegex, replacement);
  } else {
    console.error(`Could not match pattern: ${targetRegex}`);
  }
}

// 1. Font family dropdown trigger onClick -> onPointerDown
regexReplace(
  /<button\s+type="button"\s+onClick=\{\(\) => setSheetToolbarMenuOpen\(\(prev\) => prev === 'font' \? null : 'font'\)\}/g,
  '<button type="button" onPointerDown={(e) => { e.preventDefault(); setSheetToolbarMenuOpen((prev) => prev === \'font\' ? null : \'font\'); }}'
);

// 2. Font family dropdown container
regexReplace(
  /\{sheetToolbarMenuOpen === 'font' && \(\s+<div className="absolute z-\[420\]/g,
  `{sheetToolbarMenuOpen === 'font' && (
                            <div onPointerDown={(e) => e.preventDefault()} className="absolute z-[420]`
);

// 3. Font Size dropdown trigger onClick -> onPointerDown
regexReplace(
  /<button\s+type="button"\s+onClick=\{\(\) => setSheetToolbarMenuOpen\(\(prev\) => prev === 'size' \? null : 'size'\)\}/g,
  '<button type="button" onPointerDown={(e) => { e.preventDefault(); setSheetToolbarMenuOpen((prev) => prev === \'size\' ? null : \'size\'); }}'
);

// 4. Font Size dropdown container
regexReplace(
  /\{sheetToolbarMenuOpen === 'size' && \(\s+<div className="absolute z-\[420\]/g,
  `{sheetToolbarMenuOpen === 'size' && (
                            <div onPointerDown={(e) => e.preventDefault()} className="absolute z-[420]`
);

// 5. Text style menu trigger onClick -> onPointerDown
regexReplace(
  /onClick=\{\(\) => setSheetToolbarMenuOpen\(\(prev\) => prev === 'textStyle' \? null : 'textStyle'\)\}\s+className="h-8 px-2 flex items-center justify-center/g,
  `onPointerDown={(e) => { e.preventDefault(); setSheetToolbarMenuOpen((prev) => prev === 'textStyle' ? null : 'textStyle'); }} className="h-8 px-2 flex items-center justify-center`
);

// 6. Text style menu dropdown container
regexReplace(
  /\{sheetToolbarMenuOpen === 'textStyle' && \(\s+<div className="absolute top-8 left-0/g,
  `{sheetToolbarMenuOpen === 'textStyle' && (
                                <div onPointerDown={(e) => e.preventDefault()} className="absolute top-8 left-0`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Patch 4 complete.');
