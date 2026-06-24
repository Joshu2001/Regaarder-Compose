const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add Icons
code = code.replace(
  'RotateCw, Unlock',
  'RotateCw, Unlock, BarChartHorizontal, Activity, LayoutTemplate, Plus'
);

// 2. Add State
code = code.replace(
  'const [sheetShapeMenu, setSheetShapeMenu] = useState({ open: false, left: 0, top: 0, anchorCell: null });',
  'const [sheetShapeMenu, setSheetShapeMenu] = useState({ open: false, left: 0, top: 0, anchorCell: null });\n  const [sheetChartMenu, setSheetChartMenu] = useState({ open: false, left: 0, top: 0, anchorCell: null });'
);

code = code.replace(
  'const sheetShapeMenuRef = useRef(null);',
  'const sheetShapeMenuRef = useRef(null);\n  const sheetChartMenuRef = useRef(null);'
);

// 3. Global click
code = code.replace(
  'if (sheetShapeMenuRef.current && !sheetShapeMenuRef.current.contains(e.target)) {',
  'if (sheetChartMenuRef.current && !sheetChartMenuRef.current.contains(e.target)) {\n        setSheetChartMenu({ open: false, left: 0, top: 0, anchorCell: null });\n      }\n\n      if (sheetShapeMenuRef.current && !sheetShapeMenuRef.current.contains(e.target)) {'
);

// 4. Slash options
code = code.replace(
  "{ key: 'insert_shape', label: 'Insert Shape', desc: 'Add a floating shape' },",
  "{ key: 'insert_chart', label: 'Insert Chart', desc: 'Add a beautiful chart or graph' },\n  { key: 'insert_shape', label: 'Insert Shape', desc: 'Add a floating shape' },"
);

// 5. Intercept slash
code = code.replace(
  "if (key === 'insert_shape') {",
  "if (key === 'insert_chart') {\n      setSheetChartMenu({\n        open: true,\n        left: Math.max(20, (window.innerWidth / 2) - 140),\n        top: Math.max(20, (window.innerHeight / 2) - 280),\n        anchorCell: selectedSheetRange ? selectedSheetRange : { startRow: 1, startCol: 1 }\n      });\n      return;\n    }\n\n    if (key === 'insert_shape') {"
);

// 6. insertChart helper and UI
const chartUi = `
          {/* Chart Picker Menu */}
          {sheetChartMenu.open && (
            <div 
              ref={sheetChartMenuRef}
              className="fixed z-[120] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 p-5 w-[420px] max-h-[80vh] overflow-y-auto thin-scrollbar"
              style={{ left: sheetChartMenu.left, top: sheetChartMenu.top }}
              onMouseDown={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[14px] font-semibold text-slate-800">Insert Chart</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-3 px-1">Basic</p>
                  <div className="grid grid-cols-3 gap-2">
                    {['column', 'line', 'pie'].map(type => (
                      <button key={type} type="button" onClick={() => {
                        const newOverlays = [...(activeSheetGridRaw.overlays || [])];
                        const cellAnchor = sheetChartMenu.anchorCell || { startRow: 1, startCol: 1 };
                        newOverlays.push({
                          id: 'overlay-' + Date.now(),
                          type: 'chart',
                          chartType: type,
                          row: cellAnchor.startRow,
                          col: cellAnchor.startCol,
                          x: 60, y: 60, width: 320, height: 200,
                          fillColor: '#8b5cf6', strokeColor: '#e2e8f0',
                          showLegend: true, showAxes: true, chartTheme: 'light'
                        });
                        updateSheetSettings(activeSheetId, { overlays: newOverlays });
                        setSheetChartMenu({ open: false, left: 0, top: 0, anchorCell: null });
                      }} className="p-3 border border-gray-100 rounded-xl hover:border-violet-300 hover:bg-violet-50 hover:shadow-sm transition-all flex flex-col items-center gap-2 group">
                        {type === 'column' && <BarChart2 size={24} className="text-slate-400 group-hover:text-violet-500 transition-colors" />}
                        {type === 'line' && <LineChart size={24} className="text-slate-400 group-hover:text-violet-500 transition-colors" />}
                        {type === 'pie' && <PieChart size={24} className="text-slate-400 group-hover:text-violet-500 transition-colors" />}
                        <span className="text-[12px] text-slate-600 font-medium capitalize">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-3 px-1">Advanced</p>
                  <div className="grid grid-cols-3 gap-2">
                    {['area', 'scatter', 'combo'].map(type => (
                      <button key={type} type="button" onClick={() => {
                        const newOverlays = [...(activeSheetGridRaw.overlays || [])];
                        const cellAnchor = sheetChartMenu.anchorCell || { startRow: 1, startCol: 1 };
                        newOverlays.push({
                          id: 'overlay-' + Date.now(),
                          type: 'chart',
                          chartType: type,
                          row: cellAnchor.startRow,
                          col: cellAnchor.startCol,
                          x: 60, y: 60, width: 320, height: 200,
                          fillColor: '#3b82f6', strokeColor: '#e2e8f0',
                          showLegend: true, showAxes: true, chartTheme: 'light'
                        });
                        updateSheetSettings(activeSheetId, { overlays: newOverlays });
                        setSheetChartMenu({ open: false, left: 0, top: 0, anchorCell: null });
                      }} className="p-3 border border-gray-100 rounded-xl hover:border-violet-300 hover:bg-violet-50 hover:shadow-sm transition-all flex flex-col items-center gap-2 group">
                        {type === 'area' && <TrendingUp size={24} className="text-slate-400 group-hover:text-violet-500 transition-colors" />}
                        {type === 'scatter' && <Activity size={24} className="text-slate-400 group-hover:text-violet-500 transition-colors" />}
                        {type === 'combo' && <Layers size={24} className="text-slate-400 group-hover:text-violet-500 transition-colors" />}
                        <span className="text-[12px] text-slate-600 font-medium capitalize">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Shape Menu */}`;

code = code.replace('{/* Shape Menu */}', chartUi);

fs.writeFileSync('src/App.jsx', code, 'utf8');
console.log('Chart UI patched.');
