const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const target = `                                 } else if (overlay.type === 'rectangle' && overlay.shapeType) {`;

const replacement = `                                 } else if (overlay.type === 'chart') {
                                    const { chartType, showAxes, showLegend, fillColor, strokeColor } = overlay;
                                    const isDark = overlay.chartTheme === 'dark';
                                    const bg = isDark ? '#1e293b' : '#ffffff';
                                    const gridLine = isDark ? '#334155' : '#f1f5f9';
                                    const textClr = isDark ? '#94a3b8' : '#64748b';
                                    const opacity = overlay.opacity !== undefined ? overlay.opacity / 100 : 1;

                                    let chartContent = null;
                                    if (chartType === 'column') {
                                        chartContent = (
                                          <g>
                                            <rect x="20" y="40" width="15" height="60" fill={fillColor} rx="2" />
                                            <rect x="45" y="20" width="15" height="80" fill={strokeColor} rx="2" />
                                            <rect x="70" y="60" width="15" height="40" fill={fillColor} rx="2" />
                                          </g>
                                        );
                                    } else if (chartType === 'line') {
                                        chartContent = (
                                          <path d="M10 80 L30 40 L50 60 L70 20 L90 50" fill="none" stroke={fillColor} strokeWidth="3" />
                                        );
                                    } else if (chartType === 'pie') {
                                        chartContent = (
                                          <g transform="translate(50, 50)">
                                            <path d="M0 0 L 0 -35 A 35 35 0 0 1 35 0 Z" fill={fillColor} />
                                            <path d="M0 0 L 35 0 A 35 35 0 1 1 0 -35 Z" fill={strokeColor} />
                                          </g>
                                        );
                                    } else if (chartType === 'area') {
                                        chartContent = (
                                          <g>
                                            <path d="M10 80 L30 40 L50 60 L70 20 L90 50 L90 100 L10 100 Z" fill={fillColor} opacity="0.3" />
                                            <path d="M10 80 L30 40 L50 60 L70 20 L90 50" fill="none" stroke={fillColor} strokeWidth="3" />
                                          </g>
                                        );
                                    } else if (chartType === 'scatter') {
                                        chartContent = (
                                          <g fill={fillColor}>
                                            <circle cx="20" cy="40" r="3" />
                                            <circle cx="35" cy="25" r="4" fill={strokeColor}/>
                                            <circle cx="50" cy="60" r="3" />
                                            <circle cx="70" cy="20" r="5" />
                                            <circle cx="85" cy="45" r="3" fill={strokeColor}/>
                                          </g>
                                        );
                                    } else if (chartType === 'combo') {
                                        chartContent = (
                                          <g>
                                            <rect x="25" y="40" width="10" height="60" fill={strokeColor} opacity="0.5" />
                                            <rect x="65" y="30" width="10" height="70" fill={strokeColor} opacity="0.5" />
                                            <path d="M10 80 L30 30 L50 70 L70 20 L90 60" fill="none" stroke={fillColor} strokeWidth="3" />
                                          </g>
                                        );
                                    }

                                    return (
                                      <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-sm rounded-lg" style={{ opacity: opacity, backgroundColor: bg, border: \`1px solid \${gridLine}\` }} viewBox="0 0 100 100" preserveAspectRatio="none">
                                        {showAxes && chartType !== 'pie' && (
                                          <g stroke={gridLine} strokeWidth="1">
                                            <line x1="10" y1="20" x2="100" y2="20" />
                                            <line x1="10" y1="40" x2="100" y2="40" />
                                            <line x1="10" y1="60" x2="100" y2="60" />
                                            <line x1="10" y1="80" x2="100" y2="80" />
                                            <line x1="10" y1="100" x2="100" y2="100" />
                                            <line x1="10" y1="0" x2="10" y2="100" />
                                          </g>
                                        )}
                                        {chartContent}
                                        {showLegend && (
                                           <g transform="translate(10, 8)">
                                             <rect x="0" y="0" width="4" height="4" fill={fillColor} />
                                             <text x="6" y="4" fontSize="4" fill={textClr}>Series 1</text>
                                             <rect x="25" y="0" width="4" height="4" fill={strokeColor} />
                                             <text x="31" y="4" fontSize="4" fill={textClr}>Series 2</text>
                                           </g>
                                        )}
                                      </svg>
                                    );
                                 } else if (overlay.type === 'rectangle' && overlay.shapeType) {`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.jsx', code, 'utf8');
console.log('Done');
