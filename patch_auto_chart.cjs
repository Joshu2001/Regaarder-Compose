const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add new state for the auto-chart preview
const stateInsert = `
  const [quickChartPreview, setQuickChartPreview] = useState(null);
  
  // Data detection heuristic
  const detectChartStructure = (range, grid) => {
    if (!range || !grid || !grid.cells) return null;
    const startR = Math.min(range.startRow, range.endRow) - 1;
    const endR = Math.max(range.startRow, range.endRow) - 1;
    const startC = Math.min(range.startCol, range.endCol) - 1;
    const endC = Math.max(range.startCol, range.endCol) - 1;
    
    const rows = endR - startR + 1;
    const cols = endC - startC + 1;
    if (rows <= 1 && cols <= 1) return null; // Needs at least 2 cells
    
    let labels = [];
    let series = [];
    let title = 'Chart Title';
    let isRowHeaders = false;
    let isColHeaders = false;
    
    // Check if first row is mostly text (headers)
    let firstRowHasText = false;
    for (let c = startC; c <= endC; c++) {
      if (isNaN(parseFloat(grid.cells[startR][c]))) firstRowHasText = true;
    }
    
    // Check if first col is mostly text
    let firstColHasText = false;
    for (let r = startR; r <= endR; r++) {
      if (isNaN(parseFloat(grid.cells[r][startC]))) firstColHasText = true;
    }
    
    let dataStartR = startR;
    let dataStartC = startC;
    
    if (firstColHasText) {
      isColHeaders = true;
      dataStartC++;
      for(let r = startR + (firstRowHasText?1:0); r <= endR; r++) {
        labels.push(grid.cells[r][startC] || \`Row \${r+1}\`);
      }
    }
    
    if (firstRowHasText) {
      isRowHeaders = true;
      dataStartR++;
      if (!isColHeaders) {
        for(let c = startC; c <= endC; c++) {
           labels.push(grid.cells[startR][c] || \`Col \${c+1}\`);
        }
      }
    }
    
    if (!firstColHasText && !firstRowHasText) {
      if (rows >= cols) {
         for(let r = startR; r <= endR; r++) labels.push(\`Item \${r+1-startR}\`);
      } else {
         for(let c = startC; c <= endC; c++) labels.push(\`Item \${c+1-startC}\`);
      }
    }
    
    if (isColHeaders) {
       for (let c = dataStartC; c <= endC; c++) {
          let sName = (isRowHeaders ? grid.cells[startR][c] : \`Series \${c-dataStartC+1}\`) || \`Series \${c-dataStartC+1}\`;
          let values = [];
          for (let r = dataStartR; r <= endR; r++) {
            values.push(parseFloat(grid.cells[r][c]) || 0);
          }
          series.push({ name: sName, data: values });
       }
    } else {
       for (let r = dataStartR; r <= endR; r++) {
          let sName = \`Series \${r-dataStartR+1}\`;
          let values = [];
          for (let c = dataStartC; c <= endC; c++) {
             values.push(parseFloat(grid.cells[r][c]) || 0);
          }
          series.push({ name: sName, data: values });
       }
    }
    
    if (series.length === 0) return null;
    
    // Auto-recommendation logic
    let recommendedType = 'column';
    if (series.length === 1 && labels.length < 8) recommendedType = 'donut';
    else if (series.length >= 2) recommendedType = 'bar';
    
    // If labels look like dates or years, recommend line
    if (labels.some(l => l && (l.includes('20') || l.includes('/')))) {
      recommendedType = 'line';
    }
    
    return {
      labels,
      series,
      recommendedType
    };
  };

  // Helper to dynamically render SVG chart paths based on data
  const renderDynamicChart = (chartType, chartData, fill, stroke) => {
    if (!chartData || !chartData.series || chartData.series.length === 0) return null;
    
    const labels = chartData.labels || [];
    const s1 = chartData.series[0]?.data || [];
    const s2 = chartData.series[1]?.data || [];
    
    // Normalize data
    let allVals = [...s1, ...s2];
    let maxVal = Math.max(...allVals, 0.1);
    let minVal = Math.min(...allVals, 0);
    let range = maxVal - minVal;
    
    const w = 100;
    const h = 100;
    
    const getNormalized = (v) => ((v - minVal) / range) * h;
    const getNormY = (v) => h - getNormalized(v);
    
    const colW = labels.length > 0 ? (w / labels.length) * 0.6 : 10;
    const gap = labels.length > 0 ? (w / labels.length) : 20;
    
    if (chartType === 'column') {
      return (
        <g>
          {s1.map((v, i) => {
             const cx = (i * gap) + (gap/2);
             const bw = s2.length > 0 ? colW/2 : colW;
             return <rect key={\`s1-\${i}\`} x={cx - bw} y={getNormY(v)} width={bw} height={getNormalized(v)} fill={fill} rx="2"/>;
          })}
          {s2.map((v, i) => {
             const cx = (i * gap) + (gap/2);
             const bw = colW/2;
             return <rect key={\`s2-\${i}\`} x={cx} y={getNormY(v)} width={bw} height={getNormalized(v)} fill={stroke} rx="2"/>;
          })}
        </g>
      );
    } else if (chartType === 'bar') {
      return (
        <g>
          {s1.map((v, i) => {
             const cy = (i * gap) + (gap/2);
             const bh = s2.length > 0 ? colW/2 : colW;
             return <rect key={\`s1-\${i}\`} x={0} y={cy - bh} width={getNormalized(v)} height={bh} fill={fill} rx="2"/>;
          })}
          {s2.map((v, i) => {
             const cy = (i * gap) + (gap/2);
             const bh = colW/2;
             return <rect key={\`s2-\${i}\`} x={0} y={cy} width={getNormalized(v)} height={bh} fill={stroke} rx="2"/>;
          })}
        </g>
      );
    } else if (chartType === 'line' || chartType === 'area') {
      const getPoints = (s) => s.map((v, i) => \`\${(i * gap) + (gap/2)},\${getNormY(v)}\`).join(' ');
      const p1 = getPoints(s1);
      const p2 = getPoints(s2);
      return (
        <g>
          {chartType === 'area' && s1.length > 0 && <polygon points={\`\${gap/2},100 \${p1} \${((s1.length-1)*gap)+gap/2},100\`} fill={fill} opacity="0.3"/>}
          {chartType === 'area' && s2.length > 0 && <polygon points={\`\${gap/2},100 \${p2} \${((s2.length-1)*gap)+gap/2},100\`} fill={stroke} opacity="0.3"/>}
          {s1.length > 0 && <polyline points={p1} fill="none" stroke={fill} strokeWidth="3"/>}
          {s2.length > 0 && <polyline points={p2} fill="none" stroke={stroke} strokeWidth="3"/>}
          {s1.map((v, i) => <circle key={\`c1-\${i}\`} cx={(i * gap) + (gap/2)} cy={getNormY(v)} r="3" fill={fill}/>)}
          {s2.map((v, i) => <circle key={\`c2-\${i}\`} cx={(i * gap) + (gap/2)} cy={getNormY(v)} r="3" fill={stroke}/>)}
        </g>
      );
    } else if (chartType === 'pie' || chartType === 'donut') {
      const total = s1.reduce((a,b)=>a+b, 0) || 1;
      let startAngle = 0;
      let paths = [];
      const cx = 50, cy = 50, r = 40;
      s1.forEach((v, i) => {
         const sliceAngle = (v / total) * 360;
         if (sliceAngle === 360) {
            paths.push(<circle key={i} cx={cx} cy={cy} r={r} fill={i%2===0?fill:stroke} />);
            return;
         }
         const endAngle = startAngle + sliceAngle;
         const x1 = cx + r * Math.cos(Math.PI * startAngle / 180);
         const y1 = cy + r * Math.sin(Math.PI * startAngle / 180);
         const x2 = cx + r * Math.cos(Math.PI * endAngle / 180);
         const y2 = cy + r * Math.sin(Math.PI * endAngle / 180);
         const largeArc = sliceAngle > 180 ? 1 : 0;
         paths.push(<path key={i} d={\`M \${cx} \${cy} L \${x1} \${y1} A \${r} \${r} 0 \${largeArc} 1 \${x2} \${y2} Z\`} fill={i%2===0?fill:stroke}/>);
         startAngle = endAngle;
      });
      return (
        <g transform="translate(0, 10)">
           {paths}
           {chartType === 'donut' && <circle cx={cx} cy={cy} r={r*0.6} fill="#ffffff" />}
        </g>
      );
    } else if (chartType === 'scatter') {
      return (
        <g>
          {s1.map((v, i) => {
             return <circle key={\`s1-\${i}\`} cx={(i * gap) + (gap/2)} cy={getNormY(v)} r="4" fill={fill} opacity="0.8"/>;
          })}
          {s2.map((v, i) => {
             return <circle key={\`s2-\${i}\`} cx={(i * gap) + (gap/2)} cy={getNormY(v)} r="4" fill={stroke} opacity="0.8"/>;
          })}
        </g>
      );
    }
    
    // Return null if dynamic render not supported for this type, will fallback to structural svg
    return null;
  };
`;

const stateLocation = `const [selectedSheetRange, setSelectedSheetRange] = useState(null);`;
if (content.indexOf('quickChartPreview') === -1) {
  content = content.replace(stateLocation, stateLocation + '\n' + stateInsert);
}


// 2. Add QuickChart popup trigger
// We can hook it into the selection bounds computation
const renderLoc = `                      {/* ── Selection Outline ── */}`;
const quickChartIcon = `
                      {/* Auto Chart Quick Analysis Button */}
                      {selectedSheetRange && Math.abs(selectedSheetRange.endRow - selectedSheetRange.startRow) + Math.abs(selectedSheetRange.endCol - selectedSheetRange.startCol) > 0 && !quickChartPreview && (
                        <div 
                           className="absolute z-50 transition-opacity hover:scale-110"
                           style={{
                             left: \`calc(48px + \${Array.from({ length: Math.max(selectedSheetRange.startCol, selectedSheetRange.endCol) }).map((_, i) => \`var(--col-\${i}-width, 100px)\`).join(' + ')})\`,
                             top: \`calc(32px + \${Math.max(selectedSheetRange.startRow, selectedSheetRange.endRow) * 28}px)\`,
                             marginLeft: '8px',
                             marginTop: '-16px'
                           }}
                        >
                           <button 
                             onClick={(e) => {
                                e.stopPropagation();
                                const data = detectChartStructure(selectedSheetRange, activeSheetGridRaw);
                                if (data) {
                                  setQuickChartPreview({ ...data, type: data.recommendedType, x: e.clientX, y: e.clientY });
                                } else {
                                  showToast('Not enough data selected for a chart.');
                                }
                             }}
                             className="w-8 h-8 bg-white border border-gray-200 rounded-lg shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] flex items-center justify-center text-violet-600 hover:text-violet-700 hover:bg-violet-50 transition-all cursor-pointer"
                             title="Quick Auto-Chart"
                           >
                              <BarChart2 size={16} strokeWidth={2.5} />
                           </button>
                        </div>
                      )}
                      
                      {/* Auto Chart Apple-Style Popover */}
                      {quickChartPreview && (
                        <div 
                          className="fixed z-[200] bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] p-5 flex flex-col gap-4 w-[360px] animate-in fade-in zoom-in-95 duration-200"
                          style={{
                             left: Math.min(quickChartPreview.x + 20, window.innerWidth - 380),
                             top: Math.min(quickChartPreview.y - 100, window.innerHeight - 380)
                          }}
                          onClick={e => e.stopPropagation()}
                        >
                           <div className="flex justify-between items-center mb-1">
                             <div className="text-[13px] font-bold text-slate-800 tracking-tight flex items-center gap-2">
                                <Sparkles size={14} className="text-violet-500" />
                                Smart Chart Preview
                             </div>
                             <button onClick={() => setQuickChartPreview(null)} className="text-slate-400 hover:text-slate-600"><X size={14}/></button>
                           </div>
                           
                           {/* Live SVG Preview Box */}
                           <div className="w-full h-[180px] bg-slate-50/50 rounded-xl border border-gray-100 flex items-center justify-center relative overflow-hidden pointer-events-none p-4">
                              <svg className="w-full h-full drop-shadow-sm" viewBox="0 -15 100 115" preserveAspectRatio="none">
                                 {/* Draw axes */}
                                 {quickChartPreview.type !== 'pie' && quickChartPreview.type !== 'donut' && (
                                    <g stroke="#f1f5f9" strokeWidth="1">
                                      <line x1="10" y1="20" x2="100" y2="20" />
                                      <line x1="10" y1="40" x2="100" y2="40" />
                                      <line x1="10" y1="60" x2="100" y2="60" />
                                      <line x1="10" y1="80" x2="100" y2="80" />
                                      <line x1="10" y1="100" x2="100" y2="100" />
                                      <line x1="10" y1="0" x2="10" y2="100" />
                                    </g>
                                 )}
                                 {renderDynamicChart(quickChartPreview.type, quickChartPreview, '#8b5cf6', '#cbd5e1')}
                              </svg>
                           </div>
                           
                           {/* Chart Type Selector */}
                           <div className="flex gap-2 w-full mt-1 overflow-x-auto thin-scrollbar pb-1">
                              {['column', 'bar', 'line', 'area', 'donut', 'scatter'].map(t => (
                                 <button 
                                   key={t}
                                   onClick={() => setQuickChartPreview(p => ({...p, type: t}))}
                                   className={\`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors capitalize whitespace-nowrap \${quickChartPreview.type === t ? 'bg-violet-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}\`}
                                 >
                                    {t}
                                 </button>
                              ))}
                           </div>
                           
                           <button 
                             onClick={() => {
                               const newOverlays = [...(activeSheetGridRaw.overlays || [])];
                               newOverlays.push({
                                  id: 'overlay-' + Date.now(),
                                  type: 'chart',
                                  chartType: quickChartPreview.type,
                                  chartData: { labels: quickChartPreview.labels, series: quickChartPreview.series },
                                  row: Math.min(selectedSheetRange.startRow, selectedSheetRange.endRow),
                                  col: Math.max(selectedSheetRange.startCol, selectedSheetRange.endCol) + 1,
                                  x: 40, y: 40, width: 340, height: 220,
                                  fillColor: '#8b5cf6', strokeColor: '#cbd5e1',
                                  showLegend: true, showAxes: true, chartTheme: 'light'
                               });
                               updateSheetSettings(activeSheetId, { overlays: newOverlays });
                               setQuickChartPreview(null);
                             }}
                             className="w-full bg-slate-900 text-white rounded-xl py-2.5 text-[13px] font-bold shadow-lg hover:bg-slate-800 transition-colors mt-2"
                           >
                              Insert Chart
                           </button>
                        </div>
                      )}
`;

if (content.indexOf('Smart Chart Preview') === -1) {
   content = content.replace(renderLoc, quickChartIcon + '\n' + renderLoc);
}

// 3. Inject Dynamic chart rendering into the main chart renderer
const targetChartContent = `                                          {chartContent}
                                        </svg>`;

const replacementChartContent = `                                          {overlay.chartData ? renderDynamicChart(chartType, overlay.chartData, fillColor, strokeColor) : chartContent}
                                        </svg>`;

if (content.indexOf(replacementChartContent) === -1) {
   content = content.replace(targetChartContent, replacementChartContent);
}

fs.writeFileSync('src/App.jsx', content);
console.log('Patch complete.');
