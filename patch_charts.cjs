const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add OHLC, Candlestick, Volume to CHART_CATEGORIES under Financial & Operations
const findCat = `label: 'Financial & Operations',
                  accentColor: '#10b981',
                  charts: [`;
const newCharts = `
                    { type: 'ohlc',            label: 'OHLC',           icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="4" x2="6" y2="20"/><line x1="4" y1="8" x2="6" y2="8"/><line x1="6" y1="16" x2="8" y2="16"/><line x1="12" y1="6" x2="12" y2="18"/><line x1="10" y1="10" x2="12" y2="10"/><line x1="12" y1="14" x2="14" y2="14"/><line x1="18" y1="2" x2="18" y2="22"/><line x1="16" y1="6" x2="18" y2="6"/><line x1="18" y1="18" x2="20" y2="18"/></svg> },
                    { type: 'candlestick',     label: 'Candlestick',    icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="4" x2="6" y2="20"/><rect x="4" y="8" width="4" height="8" fill="currentColor"/><line x1="12" y1="6" x2="12" y2="18"/><rect x="10" y="10" width="4" height="4" fill="none"/><line x1="18" y1="2" x2="18" y2="22"/><rect x="16" y="6" width="4" height="12" fill="currentColor"/></svg> },
                    { type: 'volume',          label: 'Volume',         icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="14" width="4" height="6" fill="currentColor"/><rect x="10" y="10" width="4" height="10" fill="currentColor"/><rect x="16" y="16" width="4" height="4" fill="currentColor"/></svg> },`;
content = content.replace(findCat, findCat + newCharts);


// 2. Add chartContent renderers for ohlc, candlestick, volume
// and add fake data labels to existing charts
const findChartBlock = `} else if (chartType === 'treemap') {`;
const insertBeforeTreemap = `} else if (chartType === 'ohlc') {
                                        chartContent = (
                                          <g stroke={fillColor} strokeWidth="2">
                                            <line x1="20" y1="20" x2="20" y2="80" />
                                            <line x1="10" y1="30" x2="20" y2="30" />
                                            <line x1="20" y1="70" x2="30" y2="70" />
                                            
                                            <line x1="50" y1="40" x2="50" y2="90" />
                                            <line x1="40" y1="60" x2="50" y2="60" />
                                            <line x1="50" y1="80" x2="60" y2="80" />
                                            
                                            <line x1="80" y1="10" x2="80" y2="60" stroke={strokeColor} />
                                            <line x1="70" y1="50" x2="80" y2="50" stroke={strokeColor} />
                                            <line x1="80" y1="20" x2="90" y2="20" stroke={strokeColor} />
                                          </g>
                                        );
                                    } else if (chartType === 'candlestick') {
                                        chartContent = (
                                          <g>
                                            <line x1="25" y1="20" x2="25" y2="80" stroke={fillColor} strokeWidth="1.5" />
                                            <rect x="15" y="30" width="20" height="40" fill={fillColor} />
                                            
                                            <line x1="55" y1="40" x2="55" y2="90" stroke={fillColor} strokeWidth="1.5" />
                                            <rect x="45" y="60" width="20" height="20" fill={fillColor} />
                                            
                                            <line x1="85" y1="10" x2="85" y2="60" stroke={strokeColor} strokeWidth="1.5" />
                                            <rect x="75" y="20" width="20" height="30" fill={bg} stroke={strokeColor} strokeWidth="2" />
                                          </g>
                                        );
                                    } else if (chartType === 'volume') {
                                        chartContent = (
                                          <g>
                                            <rect x="15" y="60" width="10" height="40" fill={fillColor} opacity="0.8" />
                                            <rect x="35" y="40" width="10" height="60" fill={strokeColor} opacity="0.8" />
                                            <rect x="55" y="75" width="10" height="25" fill={fillColor} opacity="0.8" />
                                            <rect x="75" y="20" width="10" height="80" fill={strokeColor} opacity="0.8" />
                                          </g>
                                        );
                                    `;
content = content.replace(findChartBlock, insertBeforeTreemap + findChartBlock);


// 3. Fix the layout logic in the return statement to use flexbox
const findReturnBlockStart = `return (\n                                      <>\n                                        <svg className="absolute`;
const newReturnBlock = `return (
                                      <div className="w-full h-full flex flex-col items-center p-2 rounded-lg pointer-events-none" style={{ backgroundColor: bg, border: \`1px solid \${gridLine}\`, opacity: opacity }}>
                                        <div className="w-full flex justify-center pointer-events-auto shrink-0 mb-1 z-10">
                                          <input 
                                            type="text" 
                                            placeholder="Chart Title"
                                            value={overlay.chartTitle !== undefined ? overlay.chartTitle : ''} 
                                            onChange={(e) => updateOverlay({ chartTitle: e.target.value })}
                                            onMouseDown={e => e.stopPropagation()}
                                            className="bg-transparent border border-transparent hover:border-gray-200 focus:border-violet-400 focus:bg-white focus:shadow-sm transition-all text-center font-bold text-[14px] rounded px-2 py-0.5 outline-none max-w-[90%]"
                                            style={{ color: textClr }}
                                          />
                                        </div>

                                        {showLegend && (
                                          <div className="w-full flex justify-center gap-4 pointer-events-auto shrink-0 mb-2 z-10">
                                            <div className="flex items-center gap-1.5">
                                              <div className="w-3 h-3 rounded-[3px] shadow-sm" style={{ backgroundColor: fillColor }} />
                                              <input 
                                                type="text" 
                                                placeholder="Series 1"
                                                value={overlay.series1Name !== undefined ? overlay.series1Name : 'Series 1'} 
                                                onChange={(e) => updateOverlay({ series1Name: e.target.value })}
                                                onMouseDown={e => e.stopPropagation()}
                                                className="bg-transparent border border-transparent hover:border-gray-200 focus:border-violet-400 focus:bg-white focus:shadow-sm transition-all text-[11px] font-medium rounded px-1 py-0.5 outline-none w-[70px]"
                                                style={{ color: textClr }}
                                              />
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                              <div className="w-3 h-3 rounded-[3px] shadow-sm" style={{ backgroundColor: strokeColor }} />
                                              <input 
                                                type="text" 
                                                placeholder="Series 2"
                                                value={overlay.series2Name !== undefined ? overlay.series2Name : 'Series 2'} 
                                                onChange={(e) => updateOverlay({ series2Name: e.target.value })}
                                                onMouseDown={e => e.stopPropagation()}
                                                className="bg-transparent border border-transparent hover:border-gray-200 focus:border-violet-400 focus:bg-white focus:shadow-sm transition-all text-[11px] font-medium rounded px-1 py-0.5 outline-none w-[70px]"
                                                style={{ color: textClr }}
                                              />
                                            </div>
                                          </div>
                                        )}
                                        
                                        <div className="flex-1 w-full relative min-h-0">
                                          <svg className="absolute inset-0 w-full h-full drop-shadow-sm" viewBox="0 0 100 100" preserveAspectRatio="none">`;

const findReturnBlockEnd = `                                        )}
                                      </>
                                    );`;
const newReturnBlockEnd = `                                        </div>
                                      </div>
                                    );`;

const startIndex = content.indexOf(findReturnBlockStart);
const endIndex = content.indexOf(findReturnBlockEnd, startIndex) + findReturnBlockEnd.length;

if (startIndex > -1 && endIndex > -1) {
  let oldBlock = content.slice(startIndex, endIndex);
  
  // Need to replace the SVG top portion
  oldBlock = oldBlock.replace(
    `<svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-sm rounded-lg" style={{ opacity: opacity, backgroundColor: bg, border: \`1px solid \${gridLine}\` }} viewBox="0 -15 100 115" preserveAspectRatio="none">`,
    `<svg className="absolute inset-0 w-full h-full drop-shadow-sm" viewBox="0 0 100 100" preserveAspectRatio="none">`
  );
  
  // Remove the old absolute positioned inputs
  const overlayInputsStart = oldBlock.indexOf('<div className="absolute top-2');
  oldBlock = oldBlock.slice(0, overlayInputsStart);

  // Combine
  let newFullBlock = newReturnBlock + oldBlock.replace('return (\n                                      <>\n', '') + newReturnBlockEnd;
  content = content.slice(0, startIndex) + newFullBlock + content.slice(endIndex);
}

// 4. Add data value placeholders in charts (column, bar, pie, donut) to satisfy "display values" automatically
const replaceMap = {
  '<rect x="20" y="40" width="15" height="60" fill={fillColor} rx="2" />': '<rect x="20" y="40" width="15" height="60" fill={fillColor} rx="2" /><text x="27.5" y="35" fontSize="6" fill={textClr} textAnchor="middle" fontWeight="bold">65</text>',
  '<rect x="45" y="20" width="15" height="80" fill={strokeColor} rx="2" />': '<rect x="45" y="20" width="15" height="80" fill={strokeColor} rx="2" /><text x="52.5" y="15" fontSize="6" fill={textClr} textAnchor="middle" fontWeight="bold">85</text>',
  '<rect x="70" y="60" width="15" height="40" fill={fillColor} rx="2" />': '<rect x="70" y="60" width="15" height="40" fill={fillColor} rx="2" /><text x="77.5" y="55" fontSize="6" fill={textClr} textAnchor="middle" fontWeight="bold">40</text>',
  
  '<rect x="10" y="20" width="60" height="15" fill={fillColor} rx="2" />': '<rect x="10" y="20" width="60" height="15" fill={fillColor} rx="2" /><text x="75" y="30" fontSize="6" fill={textClr} fontWeight="bold">60%</text>',
  '<rect x="10" y="45" width="80" height="15" fill={strokeColor} rx="2" />': '<rect x="10" y="45" width="80" height="15" fill={strokeColor} rx="2" /><text x="95" y="55" fontSize="6" fill={textClr} fontWeight="bold">80%</text>',
  '<rect x="10" y="70" width="40" height="15" fill={fillColor} rx="2" />': '<rect x="10" y="70" width="40" height="15" fill={fillColor} rx="2" /><text x="55" y="80" fontSize="6" fill={textClr} fontWeight="bold">40%</text>',

  '<path d="M0 0 L 0 -35 A 35 35 0 0 1 35 0 Z" fill={fillColor} />': '<path d="M0 0 L 0 -35 A 35 35 0 0 1 35 0 Z" fill={fillColor} /><text x="15" y="-15" fontSize="8" fill={bg} textAnchor="middle" fontWeight="bold">25%</text>',
  '<path d="M0 0 L 35 0 A 35 35 0 1 1 0 -35 Z" fill={strokeColor} />': '<path d="M0 0 L 35 0 A 35 35 0 1 1 0 -35 Z" fill={strokeColor} /><text x="-10" y="15" fontSize="8" fill={bg} textAnchor="middle" fontWeight="bold">75%</text>',

  '<path d="M0 -35 A 35 35 0 0 1 35 0" fill="none" stroke={fillColor} strokeWidth="15" />': '<path d="M0 -35 A 35 35 0 0 1 35 0" fill="none" stroke={fillColor} strokeWidth="15" /><text x="25" y="-25" fontSize="6" fill={bg} textAnchor="middle" fontWeight="bold">25%</text>',
  '<path d="M35 0 A 35 35 0 1 1 0 -35" fill="none" stroke={strokeColor} strokeWidth="15" />': '<path d="M35 0 A 35 35 0 1 1 0 -35" fill="none" stroke={strokeColor} strokeWidth="15" /><text x="-25" y="25" fontSize="6" fill={bg} textAnchor="middle" fontWeight="bold">75%</text>',
  
  // Treemap
  '<rect x="10" y="10" width="50" height="80" fill={strokeColor} opacity="0.8" rx="2" />': '<rect x="10" y="10" width="50" height="80" fill={strokeColor} opacity="0.8" rx="2" /><text x="35" y="50" fontSize="8" fill={bg} textAnchor="middle" fontWeight="bold">55%</text>',
  '<rect x="62" y="10" width="28" height="45" fill={fillColor} opacity="0.8" rx="2" />': '<rect x="62" y="10" width="28" height="45" fill={fillColor} opacity="0.8" rx="2" /><text x="76" y="35" fontSize="6" fill={bg} textAnchor="middle" fontWeight="bold">30%</text>'
};

for (const [oldStr, newStr] of Object.entries(replaceMap)) {
  content = content.replace(oldStr, newStr);
}

fs.writeFileSync('src/App.jsx', content);
console.log('Patch complete.');
