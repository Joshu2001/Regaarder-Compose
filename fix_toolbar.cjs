const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

// Fix 1: Plus button
content = content.replace(
  '<button type="button" className="px-2 py-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">+</button>',
  '<button type="button" onClick={addWorksheet} className="px-2 py-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">+</button>'
);

// Fix 2: Duplicated buttons in toolbar - use whitespace-nowrap
content = content.replace(
  '<div className="h-12 px-4 border-b border-gray-200 bg-white flex items-center gap-1 overflow-x-auto no-scrollbar">',
  '<div className="h-12 px-4 border-b border-gray-200 bg-white flex items-center gap-1 overflow-x-auto no-scrollbar whitespace-nowrap">'
);

// Fix 3: Thinner and smaller More button
content = content.replace(
  '<span className="ml-auto text-[#374151] px-2 font-medium">More</span>',
  '<button className="ml-auto text-[11px] text-[#374151] px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 font-medium">More</button>'
);

// Fix 4: Edit worksheet title
const oldContextTitle = '<div className="text-[13px] font-semibold text-gray-900">{pageContextMenu.isSheets ? \'Add worksheet title\' : \'Add page title\'}</div>';
const newContextTitle = `{(() => {
                const targetTitle = pageContextMenu.isSheets ? sheetsData.find(s => s.id === pageContextMenu.id)?.title : deckSlides.find(s => s.id === pageContextMenu.id)?.title;
                return (
                  <input
                    type="text"
                    value={targetTitle || ''}
                    onChange={(e) => {
                      if (pageContextMenu.isSheets) {
                        setSheetsData(prev => prev.map(s => s.id === pageContextMenu.id ? { ...s, title: e.target.value } : s));
                      } else {
                        setDeckSlides(prev => prev.map(s => s.id === pageContextMenu.id ? { ...s, title: e.target.value } : s));
                      }
                    }}
                    placeholder={pageContextMenu.isSheets ? 'Add worksheet title' : 'Add page title'}
                    className="w-full text-[13px] font-semibold text-gray-900 focus:outline-none focus:bg-gray-50 rounded px-1 py-0.5"
                    autoFocus
                  />
                );
              })()}`;
content = content.replace(oldContextTitle, newContextTitle);

fs.writeFileSync(file, content, 'utf8');
console.log('Applied script 1');
