const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const brokenBlock = `                  {whiteboardShapeMenuOpen && (
                      ))}
                    </div>
                  )}`;

const correctBlock = `                  {whiteboardShapeMenuOpen && (
                    <div className="absolute left-20 top-[44%] -translate-y-1/2 z-20 rounded-2xl border border-gray-200 bg-white shadow-[0_24px_60px_-12px_rgba(15,23,42,0.35)] overflow-hidden flex flex-col w-[280px] max-h-[520px]">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white sticky top-0">
                        <span className="text-[13px] font-semibold text-gray-800">Insert Shape</span>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 thin-scrollbar bg-slate-50">
                        {[
                          { label: 'Recently Used', shapes: recentlyUsedShapes.slice(0, 8) },
                          ...SHAPE_SECTIONS
                        ]
                        .filter(sec => sec.label !== 'Recently Used' || sec.shapes.length > 0)
                        .map((section) => (
                          <div key={section.label} className="mb-3">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-0.5">
                              {section.label}
                            </div>
                            <div className="flex flex-wrap gap-0.5">
                              {section.shapes.map((shape) => {
                                let svgContent = shape.svg;
                                if (section.label === 'Recently Used') {
                                  svgContent = <rect x="2" y="4" width="12" height="8" stroke="currentColor" strokeWidth="1.5" fill="none"/>;
                                  for (const sec of SHAPE_SECTIONS) {
                                    const found = sec.shapes.find(s => s.type === shape.type);
                                    if (found) { svgContent = found.svg; break; }
                                  }
                                }
                                
                                return (
                                  <button
                                    key={shape.type}
                                    type="button"
                                    title={shape.label || shape.type}
                                    onMouseEnter={() => setWhiteboardHoverLabel(shape.label || shape.type)}
                                    onMouseLeave={() => setWhiteboardHoverLabel('')}
                                    className={\`w-8 h-8 flex items-center justify-center rounded hover:bg-violet-50 hover:text-violet-700 text-gray-600 transition-colors group \${whiteboardShapeVariant === shape.type ? 'bg-violet-100 text-violet-700' : ''}\`}
                                    onClick={() => {
                                      setRecentlyUsedShapes(prev => [{ type: shape.type }, ...prev.filter(s => s.type !== shape.type)].slice(0, 8));
                                      setWhiteboardShapeVariant(shape.type);
                                      setWhiteboardTool('shapes');
                                      showToast(\`\${shape.label || shape.type} selected\`);
                                      setWhiteboardShapeMenuOpen(false);
                                    }}
                                  >
                                    <svg
                                      viewBox="0 0 16 16"
                                      width="18"
                                      height="18"
                                      className="group-hover:scale-110 transition-transform"
                                    >
                                      {svgContent}
                                    </svg>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}`;

if (content.includes(brokenBlock)) {
  content = content.replace(brokenBlock, correctBlock);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed broken block');
} else {
  // Let's use regex in case of trailing spaces
  const regex = /\{whiteboardShapeMenuOpen && \(\s*\)\)\}\s*<\/div>\s*\)\}/;
  if (regex.test(content)) {
    content = content.replace(regex, correctBlock.replace('                  {whiteboardShapeMenuOpen && (', '{whiteboardShapeMenuOpen && ('));
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed using regex');
  } else {
    console.log('Broken block not found');
  }
}
