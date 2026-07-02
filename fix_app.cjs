const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

// Fix Document Outline Pill
content = content.replace(
  /<span className=`?\"?[^>]*?text-violet-600 bg-violet-50[^>]*?>\s*\{outlineTreeData\.length\} Sections\s*<\/span>/g,
  '<span className="text-[11px] font-semibold text-slate-400 ml-2">{outlineTreeData.length} Sections</span>'
);

// Fix Duplicate Add Section Buttons
const duplicateAddSectionRegex = /\{\/\* Add New Section Buttons \*\/\}\s*\{currentAccessLevel[\s\S]*?<Sparkles size=\{13\} \/> AI Section\s*<\/button>\s*<\/div>\s*\}/;
content = content.replace(duplicateAddSectionRegex, '');

// Fix Empty State Add Section Button
const emptyAddSectionRegex = /<button type=\"button\" onClick=\{\(\) => \{\s*setOutlineTreeData\(\[\{ id: `sec-\\\$\{Date\.now\(\)\}`, title: 'New Section', progress: 0, completed: false, subsections: \[\], expanded: false \}\]\);\s*\}\} className=\"text-\[11\.5px\] font-semibold text-violet-700 bg-violet-50 border border-violet-100 hover:bg-violet-100 px-5 py-2 rounded-full transition-all shadow-sm\">\s*Add Section\s*<\/button>/;
const newEmptyAddSection = `<button type="button" onClick={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    setOutlineMenuCoords({ top: rect.bottom + 8, left: rect.left });
                    setActiveOutlineMenuId('add-section');
                  }} className="text-[12px] font-semibold text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 px-5 py-2 rounded-lg transition-all shadow-sm">
                    Add Section
                  </button>`;
content = content.replace(emptyAddSectionRegex, newEmptyAddSection);

// Tab renaming logic (Tab 1 -> Untitled document 1)
content = content.replace(/`Tab \$\{docIndex \+ 1\}`/g, '`Untitled document ${docIndex + 1}`');

// The Insert button bleeding into the right sidebar
// In App.jsx, search for "+ Insert" in the toolbar
const insertButtonRegex = /<button[^>]*?>\s*<Plus size=\{14\} \/> Insert\s*<\/button>/;
// We can make the toolbar container wrapping elements so it doesn't bleed.
// Or we can add a min-width or overflow hidden, or flex-wrap to the toolbar.
// Let's add 'flex-shrink-0' to the Insert button so it doesn't wrap weirdly, or wrap the toolbar in overflow-x-auto.
content = content.replace(/className="flex items-center gap-1 border-l border-slate-200 pl-2 ml-2"/, 'className="flex items-center gap-1 border-l border-slate-200 pl-2 ml-2 shrink-0"');

fs.writeFileSync('src/App.jsx', content);
console.log('App.jsx fixed');
