const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// ─── 1. Expand lucide imports with new icons ──────────────────────────────────
const oldIconLine = `, RotateCw, Unlock, BarChartHorizontal, Activity`;
const newIconLine = `, RotateCw, Unlock, BarChartHorizontal, Activity, GitBranch, Filter, Map, Network, LayoutDashboard, Radar, Waypoints, TrendingDown`;

if (!content.includes(newIconLine)) {
  content = content.replace(oldIconLine, newIconLine);
  console.log('✓ Updated icon imports');
} else {
  console.log('— Icon imports already updated');
}

// ─── 2. Replace the entire sheetChartMenu JSX block ──────────────────────────
const oldChartBlock = `          {productMode === 'sheets' && sheetChartMenu.open && (
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
          )}`;

const newChartBlock = `          {productMode === 'sheets' && sheetChartMenu.open && (() => {
            const CHART_CATEGORIES = [
              {
                label: 'Basic',
                accentColor: '#8b5cf6',
                charts: [
                  { type: 'column',          label: 'Column',         icon: <BarChart2 size={24} /> },
                  { type: 'bar',             label: 'Bar',            icon: <BarChartHorizontal size={24} /> },
                  { type: 'line',            label: 'Line',           icon: <LineChart size={24} /> },
                  { type: 'pie',             label: 'Pie',            icon: <PieChart size={24} /> },
                  { type: 'donut',           label: 'Donut',          icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg> },
                ],
              },
              {
                label: 'Advanced',
                accentColor: '#3b82f6',
                charts: [
                  { type: 'area',            label: 'Area',           icon: <TrendingUp size={24} /> },
                  { type: 'scatter',         label: 'Scatter',        icon: <Activity size={24} /> },
                  { type: 'combo',           label: 'Combo',          icon: <Layers size={24} /> },
                  { type: 'stacked_column',  label: 'Stacked Col',    icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="12" width="5" height="9"/><rect x="3" y="6" width="5" height="6"/><rect x="10" y="8" width="5" height="13"/><rect x="10" y="3" width="5" height="5"/><rect x="17" y="10" width="5" height="11"/><rect x="17" y="5" width="5" height="5"/></svg> },
                  { type: 'stacked_bar',     label: 'Stacked Bar',    icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="9" height="4"/><rect x="12" y="4" width="6" height="4"/><rect x="3" y="10" width="13" height="4"/><rect x="16" y="10" width="4" height="4"/><rect x="3" y="16" width="7" height="4"/><rect x="10" y="16" width="9" height="4"/></svg> },
                  { type: 'stacked_area',    label: 'Stacked Area',   icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,18 8,10 13,14 21,6"/><polyline points="3,21 8,16 13,18 21,12"/></svg> },
                ],
              },
              {
                label: 'Financial & Operations',
                accentColor: '#10b981',
                charts: [
                  { type: 'waterfall',       label: 'Waterfall',      icon: <TrendingDown size={24} /> },
                  { type: 'gantt',           label: 'Gantt',          icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="11" height="3"/><rect x="8" y="11" width="9" height="3"/><rect x="5" y="17" width="13" height="3"/></svg> },
                  { type: 'radar',           label: 'Radar / Spider', icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12,3 21,8.5 21,15.5 12,21 3,15.5 3,8.5"/><polygon points="12,7 17,9.8 17,14.2 12,17 7,14.2 7,9.8"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="8.5" x2="21" y2="15.5"/><line x1="21" y1="8.5" x2="3" y2="15.5"/></svg> },
                ],
              },
              {
                label: 'Relational & Process',
                accentColor: '#f59e0b',
                charts: [
                  { type: 'bubble',          label: 'Bubble',         icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="7" cy="16" r="3"/><circle cx="17" cy="8" r="5"/><circle cx="12" cy="18" r="2"/></svg> },
                  { type: 'funnel',          label: 'Funnel',         icon: <Filter size={24} /> },
                  { type: 'sankey',          label: 'Sankey',         icon: <Waypoints size={24} /> },
                ],
              },
              {
                label: 'Geographic & Hierarchical',
                accentColor: '#ef4444',
                charts: [
                  { type: 'map',             label: 'Map Chart',      icon: <Map size={24} /> },
                  { type: 'treemap',         label: 'Treemap',        icon: <LayoutDashboard size={24} /> },
                ],
              },
            ];

            const insertChart = (type, accentColor) => {
              const newOverlays = [...(activeSheetGridRaw.overlays || [])];
              const cellAnchor = sheetChartMenu.anchorCell || { startRow: 1, startCol: 1 };
              newOverlays.push({
                id: 'overlay-' + Date.now(),
                type: 'chart',
                chartType: type,
                row: cellAnchor.startRow,
                col: cellAnchor.startCol,
                x: 60, y: 60, width: 320, height: 200,
                fillColor: accentColor,
                strokeColor: '#e2e8f0',
                showLegend: true,
                showAxes: true,
                chartTheme: 'light',
              });
              updateSheetSettings(activeSheetId, { overlays: newOverlays });
              setSheetChartMenu({ open: false, left: 0, top: 0, anchorCell: null });
            };

            return (
              <div
                ref={sheetChartMenuRef}
                className="fixed z-[120] bg-white rounded-2xl shadow-[0_24px_60px_-12px_rgba(15,23,42,0.35)] border border-gray-100 overflow-hidden flex flex-col w-[440px] max-h-[82vh]"
                style={{ left: sheetChartMenu.left, top: sheetChartMenu.top }}
                onMouseDown={e => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white sticky top-0">
                  <h3 className="text-[14px] font-semibold text-slate-800">Insert Chart</h3>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto p-5 thin-scrollbar bg-slate-50 space-y-6">
                  {CHART_CATEGORIES.map(({ label, accentColor, charts }) => (
                    <div key={label}>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3 px-0.5">{label}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {charts.map(({ type, label: chartLabel, icon }) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => insertChart(type, accentColor)}
                            className="p-3 border border-gray-100 bg-white rounded-xl hover:border-violet-300 hover:bg-violet-50 hover:shadow-sm transition-all flex flex-col items-center gap-2 group"
                          >
                            <span className="text-slate-400 group-hover:text-violet-500 transition-colors [&>svg]:transition-transform group-hover:[&>svg]:scale-110">
                              {icon}
                            </span>
                            <span className="text-[11px] text-slate-600 font-medium text-center leading-tight">{chartLabel}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}`;

if (content.includes(oldChartBlock)) {
  content = content.replace(oldChartBlock, newChartBlock);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✓ Chart picker block replaced successfully');
} else {
  console.log('✗ Could not find old chart block – no changes made');
  process.exit(1);
}
