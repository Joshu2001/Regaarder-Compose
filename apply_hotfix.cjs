const fs = require('fs');

const filePath = 'src/App.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// FIX 1: Add missing imports
if (content.includes("from 'lucide-react'")) {
  if (!content.includes('RotateCw')) {
    content = content.replace("from 'lucide-react';", ", RotateCw, Unlock } from 'lucide-react';");
  } else if (!content.includes('Unlock')) {
    content = content.replace("from 'lucide-react';", ", Unlock } from 'lucide-react';");
  }
}

// FIX 2: Dynamic Shape Rendering logic
const startMarker = '{/* The SVG Shape */}';
const startIndex = content.indexOf(startMarker);

if (startIndex === -1) {
  console.error("Start marker not found!");
  process.exit(1);
}

const endStr = '{/* Smart Selection Frame & Resize Handles */}';
let endIndex = content.indexOf(endStr, startIndex);

if (endIndex === -1) {
  console.error("End marker not found!");
  process.exit(1);
}

const replacement = `{/* The SVG Shape */}
                               {(() => {
                                 if (overlay.type === 'note') {
                                   return (
                                     <textarea
                                       className="w-full h-full bg-yellow-200 p-2 text-xs shadow-md resize-none border-none outline-none"
                                       value={overlay.content || ''}
                                       onChange={(e) => updateOverlay({ content: e.target.value })}
                                       onClick={(e) => { e.stopPropagation(); setSelectedSheetOverlayId(overlay.id); }}
                                       onMouseDown={e => e.stopPropagation()}
                                     />
                                   );
                                 } else if (overlay.type === 'rectangle' && overlay.shapeType) {
                                   const isLine = overlay.shapeType === 'line' || overlay.shapeType === 'arrow';
                                   const cr = overlay.cornerRadius || 0; // 0 to 50
                                   const rx = (cr / 100) * Math.min(overlay.width, overlay.height);
                                   
                                   const renderDefs = () => (
                                      <defs>
                                        {fillType === 'linear' && (
                                          <linearGradient id={\`gradient-\${overlay.id}\`} x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor={fillColor} />
                                            <stop offset="100%" stopColor={fillSecondaryColor} />
                                          </linearGradient>
                                        )}
                                        {fillType === 'radial' && (
                                          <radialGradient id={\`gradient-\${overlay.id}\`} cx="50%" cy="50%" r="50%">
                                            <stop offset="0%" stopColor={fillColor} />
                                            <stop offset="100%" stopColor={fillSecondaryColor} />
                                          </radialGradient>
                                        )}
                                        <filter id={\`filter-\${overlay.id}\`}>
                                          {effectShadow.active && (
                                            <feDropShadow dx={effectShadow.distance} dy={effectShadow.distance} stdDeviation={effectShadow.blur} floodOpacity={effectShadow.opacity} />
                                          )}
                                          {effectGlow.active && (
                                            <feDropShadow dx="0" dy="0" stdDeviation={effectGlow.intensity} floodColor={effectGlow.color} floodOpacity="1" />
                                          )}
                                          {effectBlur.active && (
                                            <feGaussianBlur stdDeviation={effectBlur.radius} />
                                          )}
                                        </filter>
                                      </defs>
                                   );

                                   // Fetch base SVG template from SHAPE_SECTIONS
                                   let shapeSvgTemplate = null;
                                   for (const sec of SHAPE_SECTIONS) {
                                     const found = sec.shapes.find(s => s.type === overlay.shapeType);
                                     if (found) { shapeSvgTemplate = found.svg; break; }
                                   }

                                   // Deep clone and customize the template's properties
                                   const customizeShapeSvg = (node) => {
                                     if (!React.isValidElement(node)) return node;
                                     if (node.type === React.Fragment) {
                                       return React.cloneElement(node, {}, React.Children.map(node.props.children, customizeShapeSvg));
                                     }
                                     
                                     const overrides = {};
                                     // Override Stroke
                                     if (node.props.stroke === 'currentColor' || node.props.stroke !== 'none') {
                                       overrides.stroke = strokeType !== 'none' ? strokeColor : 'none';
                                       // scale down stroke width because viewBox is 16x16 but width is 100+
                                       const strokeScale = 16 / Math.max(overlay.width, overlay.height);
                                       overrides.strokeWidth = strokeWidth > 0 ? (strokeWidth * strokeScale) : (node.props.strokeWidth || 1.5);
                                       
                                       if (strokeDasharray !== 'none') {
                                         // scale dash array for viewBox
                                         const scaledDash = strokeDasharray.split(',').map(v => (parseFloat(v.trim()) * strokeScale).toFixed(2)).join(',');
                                         overrides.strokeDasharray = scaledDash;
                                       }
                                     }
                                     
                                     // Override Fill
                                     if (node.type !== 'line' && node.type !== 'polyline') {
                                       // It's a shape that can be filled
                                       overrides.fill = fillDef;
                                     } else if (node.props.fill === 'currentColor') {
                                       // Arrow heads etc.
                                       overrides.fill = strokeType !== 'none' ? strokeColor : fillColor;
                                     }

                                     // Apply filter
                                     if (filterDef !== '') {
                                       overrides.filter = filterDef;
                                     }
                                     
                                     // Special case: Corner radius for rectangles
                                     if (node.type === 'rect' && overlay.cornerRadius > 0) {
                                        overrides.rx = (overlay.cornerRadius / 100) * 8; // 8 is half of viewBox 16
                                     }

                                     return React.cloneElement(node, overrides, React.Children.map(node.props.children, customizeShapeSvg));
                                   };

                                   let shapeContent = shapeSvgTemplate ? customizeShapeSvg(shapeSvgTemplate) : <rect x="0" y="0" width="16" height="16" fill={fillDef} />;

                                   return (
                                     <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-sm" viewBox="0 0 16 16" preserveAspectRatio="none">
                                       {renderDefs()}
                                       {shapeContent}
                                     </svg>
                                   );
                                 }
                                 return overlay.content;
                               })()}
                               
                               `;

const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Production hotfix applied successfully!');
