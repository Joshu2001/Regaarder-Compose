const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');
content = content.replace(
  '                <span className=\"text-[10px] font-semibold text-violet-600 bg-violet-50 border border-violet-100 rounded-full px-2 py-0.5\">{Math.max(0, documentOutlineItems.length - 1)} Sections</span>',
  '                <span className=\"text-[11px] font-semibold text-slate-400 ml-2\">{Math.max(0, documentOutlineItems.length - 1)} Sections</span>'
);
content = content.replace(/\{\/\* Add New Section Buttons \*\/\}[\s\S]*?<Sparkles size=\{13\} \/> AI Section\s*<\/button>\s*<\/div>\s*\}/, '{/* Add New Section Buttons Removed */}');
content = content.replace(
  '{/* Consolidated Insert Dropdown */}\n          <div className=\"relative\">',
  '{/* Consolidated Insert Dropdown */}\n          <div className=\"relative shrink-0\">'
);
fs.writeFileSync('src/App.jsx', content);
console.log('Fixed');
