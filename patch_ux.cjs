const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. handleDrag
code = code.replace(
  'e.preventDefault(); e.stopPropagation();\n                             const startX = e.clientX; const startY = e.clientY;',
  'e.preventDefault(); e.stopPropagation();\n                             setIsShapeInteracting(true);\n                             const startX = e.clientX; const startY = e.clientY;'
);
code = code.replace(
  "const onMouseUp = () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };\n                             window.addEventListener('mousemove', onMouseMove); window.addEventListener('mouseup', onMouseUp);\n                           };\n\n                           return (\n                             <div ",
  "const onMouseUp = () => { setIsShapeInteracting(false); window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };\n                             window.addEventListener('mousemove', onMouseMove); window.addEventListener('mouseup', onMouseUp);\n                           };\n\n                           return (\n                             <div "
);

// 2. handleResize
code = code.replace(
  'e.preventDefault(); e.stopPropagation();\n                             const startX = e.clientX; const startY = e.clientY;\n                             const startW = overlay.width; const startH = overlay.height;',
  'e.preventDefault(); e.stopPropagation();\n                             setIsShapeInteracting(true);\n                             const startX = e.clientX; const startY = e.clientY;\n                             const startW = overlay.width; const startH = overlay.height;'
);
code = code.replace(
  "const onMouseUp = () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };\n                             window.addEventListener('mousemove', onMouseMove); window.addEventListener('mouseup', onMouseUp);\n                           };\n\n                           // Handle rotation",
  "const onMouseUp = () => { setIsShapeInteracting(false); window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };\n                             window.addEventListener('mousemove', onMouseMove); window.addEventListener('mouseup', onMouseUp);\n                           };\n\n                           // Handle rotation"
);

// 3. handleRotate
code = code.replace(
  'e.preventDefault(); e.stopPropagation();\n                             const rect = e.currentTarget.parentElement.getBoundingClientRect();\n                             const centerX = rect.left + rect.width / 2;\n                             const centerY = rect.top + rect.height / 2;',
  'e.preventDefault(); e.stopPropagation();\n                             setIsShapeInteracting(true);\n                             const rect = e.currentTarget.parentElement.getBoundingClientRect();\n                             const centerX = rect.left + rect.width / 2;\n                             const centerY = rect.top + rect.height / 2;'
);
code = code.replace(
  "const onMouseUp = () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };\n                             window.addEventListener('mousemove', onMouseMove); window.addEventListener('mouseup', onMouseUp);\n                           };\n\n                           // Handle dragging",
  "const onMouseUp = () => { setIsShapeInteracting(false); window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };\n                             window.addEventListener('mousemove', onMouseMove); window.addEventListener('mouseup', onMouseUp);\n                           };\n\n                           // Handle dragging"
);

// 4. Color pickers classes
code = code.replace(
  '<label className="w-6 h-6 rounded-full border border-gray-200 cursor-pointer overflow-hidden relative hover:scale-110 transition-transform flex items-center justify-center shrink-0">',
  '<label className="w-6 h-6 rounded-full border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.08)] ring-1 ring-black/5 cursor-pointer overflow-hidden relative hover:scale-110 transition-transform flex items-center justify-center shrink-0">'
);
code = code.replace(
  '<label className="w-4 h-4 rounded-full border border-gray-200 cursor-pointer overflow-hidden relative hover:scale-110 transition-transform flex items-center justify-center shrink-0">',
  '<label className="w-4 h-4 rounded-full border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.08)] ring-1 ring-black/5 cursor-pointer overflow-hidden relative hover:scale-110 transition-transform flex items-center justify-center shrink-0">'
);

// 5. Opacity fix
code = code.replace(
  'opacity: opacity / 100,\n                                 zIndex: isSelected ? 105 : 100,',
  'zIndex: isSelected ? 105 : 100,'
);
code = code.replace(
  '<textarea\n                                       className="w-full h-full bg-yellow-200 p-2 text-xs shadow-md resize-none border-none outline-none"\n                                       value={overlay.content || \'\'}',
  '<textarea\n                                       className="w-full h-full bg-yellow-200 p-2 text-xs shadow-md resize-none border-none outline-none"\n                                       style={{ opacity: opacity / 100 }}\n                                       value={overlay.content || \'\'}'
);
code = code.replace(
  '<svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-sm" viewBox="0 0 16 16" preserveAspectRatio="none">',
  '<svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-sm" style={{ opacity: opacity / 100 }} viewBox="0 0 16 16" preserveAspectRatio="none">'
);

// 6. Insert Menu top + 12
code = code.replace(
  'top: rect.bottom,\n                                     editingOverlayId: overlay.id,',
  'top: rect.bottom + 12,\n                                     editingOverlayId: overlay.id,'
);

fs.writeFileSync('src/App.jsx', code, 'utf8');
console.log('Patched App.jsx');
