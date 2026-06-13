const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

const dragHandlerStr = `onPointerDown={(e) => {
                      if (e.target.closest('button')) return;
                      const el = e.currentTarget;
                      const rect = el.getBoundingClientRect();
                      const parentRect = el.parentElement.getBoundingClientRect();
                      const shiftX = e.clientX - rect.left;
                      const shiftY = e.clientY - rect.top;
                      const moveAt = (clientX, clientY) => {
                        el.style.left = (clientX - parentRect.left - shiftX) + 'px';
                        el.style.top = (clientY - parentRect.top - shiftY) + 'px';
                        el.style.transform = 'none';
                        el.style.bottom = 'auto';
                        el.style.right = 'auto';
                      };
                      const onPointerMove = (eMove) => moveAt(eMove.clientX, eMove.clientY);
                      const onPointerUp = () => {
                        document.removeEventListener('pointermove', onPointerMove);
                        document.removeEventListener('pointerup', onPointerUp);
                      };
                      document.addEventListener('pointermove', onPointerMove);
                      document.addEventListener('pointerup', onPointerUp);
                    }}`;

content = content.replace(
  '<div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 rounded-2xl border border-gray-200 bg-white/95 shadow-sm p-2 flex flex-col gap-1.5">',
  `<div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 rounded-2xl border border-gray-200 bg-white/95 shadow-sm p-2 flex flex-col gap-1.5 cursor-move"\n                    ${dragHandlerStr}>`
);

content = content.replace(
  '<div className="absolute left-1/2 bottom-4 -translate-x-1/2 z-20 rounded-2xl border border-gray-200 bg-white/95 shadow-sm px-2.5 py-2 flex items-center gap-1.5">',
  `<div className="absolute left-1/2 bottom-4 -translate-x-1/2 z-20 rounded-2xl border border-gray-200 bg-white/95 shadow-sm px-2.5 py-2 flex items-center gap-1.5 cursor-move"\n                    ${dragHandlerStr}>`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully made toolbars draggable');
