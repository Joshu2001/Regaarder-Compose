const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldGridBlock = `                    <div
                      className="grid border-b border-gray-300 bg-slate-50 text-[11px] font-semibold text-slate-700"
                      style={{ gridTemplateColumns: \`48px repeat(\${activeSheetGrid.cols}, minmax(100px, 1fr))\`, minWidth: 'max-content' }}
                    >
                      <div className="h-8 border-r border-gray-300" />
                      {Array.from({ length: activeSheetGrid.cols }, (_, colIndex) => toColumnLabel(colIndex)).map((col, colIndex) => (
                        <div key={col} className={\`h-8 flex items-center justify-center border-r border-gray-300 last:border-r-0 \${selectedSheetCell.col === colIndex + 1 ? 'bg-violet-100 text-violet-800' : ''}\`}>{col}</div>
                      ))}
                    </div>
                    <div className="flex-1 overflow-auto thin-scrollbar relative bg-white">
                      <div className="grid grid-cols-[48px_1fr] origin-top-left" style={{ zoom: \`\${sheetZoomLevel}%\`, minWidth: 'max-content' }}>
                        <div className="border-r border-gray-300 bg-slate-50">
                          {Array.from({ length: activeSheetGrid.rows }, (_, idx) => idx + 1).map((num) => (
                            <div key={num} className={\`h-9 border-b border-gray-300 text-[11px] font-semibold flex items-center justify-center \${selectedSheetCell.row === num ? 'bg-violet-100 text-violet-800' : 'text-slate-700'}\`}>{num}</div>
                          ))}
                        </div>`;

const newGridBlock = `                    <div
                      className="grid border-b border-gray-300 bg-slate-50 text-[11px] font-semibold text-slate-700"
                      style={{ gridTemplateColumns: \`48px repeat(\${activeSheetGrid.cols}, minmax(100px, 1fr))\`, minWidth: 'max-content' }}
                    >
                      <div className="h-8 border-r border-gray-300 relative group">
                        <div className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-violet-400" />
                      </div>
                      {Array.from({ length: activeSheetGrid.cols }, (_, colIndex) => toColumnLabel(colIndex)).map((col, colIndex) => (
                        <div key={col} className={\`h-8 relative border-r border-gray-300 last:border-r-0 \${selectedSheetCell.col === colIndex + 1 ? 'bg-violet-100 text-violet-800' : ''}\`} style={{ resize: 'horizontal', overflow: 'hidden' }}>
                          <input className="w-full h-full bg-transparent text-center focus:outline-none cursor-pointer" defaultValue={col} onClick={() => setSelectedSheetCell({ row: selectedSheetCell.row, col: colIndex + 1 })} />
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 overflow-auto thin-scrollbar relative bg-white">
                      <div className="grid grid-cols-[48px_1fr] origin-top-left" style={{ zoom: \`\${sheetZoomLevel}%\`, minWidth: 'max-content' }}>
                        <div className="border-r border-gray-300 bg-slate-50">
                          {Array.from({ length: activeSheetGrid.rows }, (_, idx) => idx + 1).map((num) => (
                            <div key={num} className={\`h-9 relative border-b border-gray-300 text-[11px] font-semibold \${selectedSheetCell.row === num ? 'bg-violet-100 text-violet-800' : 'text-slate-700'}\`} style={{ resize: 'vertical', overflow: 'hidden' }}>
                              <input className="w-full h-full bg-transparent text-center focus:outline-none cursor-pointer" defaultValue={num} onClick={() => setSelectedSheetCell({ row: num, col: selectedSheetCell.col })} />
                            </div>
                          ))}
                        </div>`;

if (content.includes(oldGridBlock)) {
  content = content.replace(oldGridBlock, newGridBlock);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Grid block replaced.');
} else {
  console.log('Grid block NOT found.');
}
