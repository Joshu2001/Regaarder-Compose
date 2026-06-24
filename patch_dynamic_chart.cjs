const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Fix detectChartStructure 1D array bug
const oldDetect = `if (firstColHasText) {
      isColHeaders = true;
      dataStartC++;`;

const newDetect = `if (firstColHasText && cols > 1) {
      isColHeaders = true;
      dataStartC++;`;

if (content.indexOf(oldDetect) > -1) {
  content = content.replace(oldDetect, newDetect);
}

// 2. Inject chartData dynamically in the SVG rendering
const targetRenderBlock = `} else if (overlay.type === 'chart') {
                                    const { chartType, showAxes, showLegend, fillColor, strokeColor } = overlay;
                                    const isDark = overlay.chartTheme === 'dark';`;

const replacementRenderBlock = `} else if (overlay.type === 'chart') {
                                    const { chartType, showAxes, showLegend, fillColor, strokeColor } = overlay;
                                    let currentChartData = overlay.chartData;
                                    if (overlay.dataRange) {
                                      currentChartData = detectChartStructure(overlay.dataRange, activeSheetGridRaw) || currentChartData;
                                    }
                                    const isDark = overlay.chartTheme === 'dark';`;

if (content.indexOf(targetRenderBlock) > -1) {
  content = content.replace(targetRenderBlock, replacementRenderBlock);
}

// 3. Update the inner content to use currentChartData
const oldSVGContent = `{overlay.chartData ? renderDynamicChart(chartType, overlay.chartData, fillColor, strokeColor) : chartContent}`;
const newSVGContent = `{currentChartData ? renderDynamicChart(chartType, currentChartData, fillColor, strokeColor) : chartContent}`;

if (content.indexOf(oldSVGContent) > -1) {
  content = content.replace(oldSVGContent, newSVGContent);
}

// 4. Fix legend overlap by defaulting to bottom: 8px
const oldLegendStyle = `top: overlay.legendPos ? overlay.legendPos.y : '32px', 
                                              left: overlay.legendPos ? overlay.legendPos.x : '50%',
                                              transform: overlay.legendPos ? 'none' : 'translateX(-50%)'`;

const newLegendStyle = `top: overlay.legendPos ? overlay.legendPos.y : 'auto', 
                                              bottom: overlay.legendPos ? 'auto' : '8px', 
                                              left: overlay.legendPos ? overlay.legendPos.x : '50%',
                                              transform: overlay.legendPos ? 'none' : 'translateX(-50%)'`;

if (content.indexOf(oldLegendStyle) > -1) {
  content = content.replace(oldLegendStyle, newLegendStyle);
}

// 5. Connect legend editable labels to currentChartData
const targetSeries1 = `value={overlay.series1Name !== undefined ? overlay.series1Name : 'Series 1'}`;
const replaceSeries1 = `value={overlay.series1Name !== undefined ? overlay.series1Name : (currentChartData?.series?.[0]?.name || 'Series 1')}`;

if (content.indexOf(targetSeries1) > -1) {
  content = content.replace(targetSeries1, replaceSeries1);
}

const targetSeries2 = `value={overlay.series2Name !== undefined ? overlay.series2Name : 'Series 2'}`;
const replaceSeries2 = `value={overlay.series2Name !== undefined ? overlay.series2Name : (currentChartData?.series?.[1]?.name || 'Series 2')}`;

// Need to conditionally render series2 if it exists
// Let's find the whole block for series2
const oldSeries2Block = `                                            <div className="flex items-center gap-1.5">
                                              <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: strokeColor }} />
                                              <input 
                                                type="text" 
                                                placeholder="Series 2"
                                                value={overlay.series2Name !== undefined ? overlay.series2Name : 'Series 2'} 
                                                onChange={(e) => updateOverlay({ series2Name: e.target.value })}
                                                onMouseDown={e => e.stopPropagation()}
                                                className="bg-transparent border border-transparent hover:border-gray-200 focus:border-violet-400 focus:bg-white focus:shadow-sm transition-all text-[11px] font-medium rounded px-1 py-0.5 outline-none w-16"
                                                style={{ color: textClr }}
                                              />
                                            </div>`;

const newSeries2Block = `                                            {(!currentChartData || (currentChartData && currentChartData.series && currentChartData.series.length > 1)) && (
                                              <div className="flex items-center gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: strokeColor }} />
                                                <input 
                                                  type="text" 
                                                  placeholder="Series 2"
                                                  value={overlay.series2Name !== undefined ? overlay.series2Name : (currentChartData?.series?.[1]?.name || 'Series 2')} 
                                                  onChange={(e) => updateOverlay({ series2Name: e.target.value })}
                                                  onMouseDown={e => e.stopPropagation()}
                                                  className="bg-transparent border border-transparent hover:border-gray-200 focus:border-violet-400 focus:bg-white focus:shadow-sm transition-all text-[11px] font-medium rounded px-1 py-0.5 outline-none w-16"
                                                  style={{ color: textClr }}
                                                />
                                              </div>
                                            )}`;

if (content.indexOf(oldSeries2Block) > -1) {
  content = content.replace(oldSeries2Block, newSeries2Block);
}

fs.writeFileSync('src/App.jsx', content);
console.log('Patch complete.');
