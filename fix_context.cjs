const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

// Ensure headerContextMenu state exists
if (!content.includes('headerContextMenu')) {
  const stateInsertPoint = "const [pageContextMenu, setPageContextMenu] = useState({ open: false, x: 0, y: 0, id: null, isSheets: false });";
  const newStates = `const [pageContextMenu, setPageContextMenu] = useState({ open: false, x: 0, y: 0, id: null, isSheets: false });
  const [headerContextMenu, setHeaderContextMenu] = useState({ open: false, x: 0, y: 0, type: '', index: -1 });`;
  content = content.replace(stateInsertPoint, newStates);
}

// Add onContextMenu to column and row headers
content = content.replace(
  `onClick={() => setSelectedSheetCell({ row: selectedSheetCell.row, col: colIndex + 1 })}`,
  `onClick={() => setSelectedSheetCell({ row: selectedSheetCell.row, col: colIndex + 1 })} onContextMenu={(e) => { e.preventDefault(); setHeaderContextMenu({ open: true, x: e.clientX, y: e.clientY, type: 'col', index: colIndex }); }}`
);

content = content.replace(
  `onClick={() => setSelectedSheetCell({ row: num, col: selectedSheetCell.col })}`,
  `onClick={() => setSelectedSheetCell({ row: num, col: selectedSheetCell.col })} onContextMenu={(e) => { e.preventDefault(); setHeaderContextMenu({ open: true, x: e.clientX, y: e.clientY, type: 'row', index: num - 1 }); }}`
);

// Render the menu right after pageContextMenu
const pageContextStr = `        {pageContextMenu.open && (`;
const headerContextHtml = `        {headerContextMenu.open && (
          <div
            className="fixed z-[700] w-[220px] rounded-xl border border-gray-200 bg-white shadow-[0_18px_45px_-24px_rgba(15,23,42,0.65)] p-2"
            style={{ left: Math.max(12, headerContextMenu.x - 20), top: Math.max(12, headerContextMenu.y - 12) }}
          >
            <div className="px-2 py-2 border-b border-gray-100 mb-1">
              <div className="text-[13px] font-semibold text-gray-900">{headerContextMenu.type === 'col' ? 'Column options' : 'Row options'}</div>
            </div>
            {[
              { key: 'select', label: headerContextMenu.type === 'col' ? 'Select column' : 'Select row' },
              { key: 'insert-before', label: headerContextMenu.type === 'col' ? 'Insert 1 column left' : 'Insert 1 row above' },
              { key: 'insert-after', label: headerContextMenu.type === 'col' ? 'Insert 1 column right' : 'Insert 1 row below' },
              { key: 'delete', label: headerContextMenu.type === 'col' ? 'Delete column' : 'Delete row' },
              { key: 'clear', label: headerContextMenu.type === 'col' ? 'Clear column' : 'Clear row' },
            ].map((item, i) => (
              <React.Fragment key={item.key}>
                {(i === 1 || i === 3) && <div className="h-px bg-gray-100 my-1 mx-1" />}
                <button
                  className="w-full text-left px-3 py-1.5 text-[13px] text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => {
                    setHeaderContextMenu({ open: false, x: 0, y: 0, type: '', index: -1 });
                  }}
                >
                  {item.label}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}
`;

if (!content.includes('headerContextMenu.open && (')) {
  content = content.replace(pageContextStr, headerContextHtml + pageContextStr);
}

// Ensure the page click handler also closes the header context menu
content = content.replace(
  `setPageContextMenu(prev => prev.open ? { ...prev, open: false } : prev);`,
  `setPageContextMenu(prev => prev.open ? { ...prev, open: false } : prev);\n      setHeaderContextMenu(prev => prev.open ? { ...prev, open: false } : prev);`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Context menu added');
