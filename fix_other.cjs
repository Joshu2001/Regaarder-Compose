const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

// Fix 2: 1 click to edit worksheet title
content = content.replace(
  'onClick={() => setIsTopDraftTitleExpanded((prev) => !prev)}\n                  onDoubleClick={() => setIsEditingUnsavedDraftName(true)}',
  'onClick={() => setIsEditingUnsavedDraftName(true)}'
);

// Fix 5: Whiteboard draggable menus
// For left toolbar:
content = content.replace(
  '<div className="w-[52px] border border-gray-200 bg-white rounded-2xl py-3 flex flex-col items-center gap-2 shadow-sm z-10">',
  '<div className="w-[52px] border border-gray-200 bg-white rounded-2xl py-3 flex flex-col items-center gap-2 shadow-sm z-10 cursor-move" onMouseDown={(e) => { const el = e.currentTarget; const rect = el.getBoundingClientRect(); let ox = e.clientX - rect.left; let oy = e.clientY - rect.top; const move = (em) => { el.style.position="fixed"; el.style.left = (em.clientX - ox)+"px"; el.style.top = (em.clientY - oy)+"px"; }; const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); }; window.addEventListener("mousemove", move); window.addEventListener("mouseup", up); }}>'
);

// For bottom toolbar:
content = content.replace(
  '<div className="h-12 border border-gray-200 bg-white rounded-full px-2 flex items-center gap-1 shadow-sm z-10">',
  '<div className="h-12 border border-gray-200 bg-white rounded-full px-2 flex items-center gap-1 shadow-sm z-10 cursor-move" onMouseDown={(e) => { const el = e.currentTarget; const rect = el.getBoundingClientRect(); let ox = e.clientX - rect.left; let oy = e.clientY - rect.top; const move = (em) => { el.style.position="fixed"; el.style.left = (em.clientX - ox)+"px"; el.style.top = (em.clientY - oy)+"px"; }; const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); }; window.addEventListener("mousemove", move); window.addEventListener("mouseup", up); }}>'
);

// Fix 4: Scrollbar in right side panel
// In sharedRightPanels, there is an activeRightTab === 'chat' which has overflow-y-auto but wait.
// Let's find sharedRightPanels main flex container.
// It already has <div className="flex flex-col h-full w-full"> inside it sometimes?
// The user says "sheet still not have a scrollbar s compose for the right side panel with menu , give it one".
// Let's add thin-scrollbar to the tabs content.
content = content.replace(
  '<div className="flex-1 overflow-y-auto thin-scrollbar relative">',
  '<div className="flex-1 overflow-y-auto thin-scrollbar relative h-full">'
);
content = content.replace(
  '<div className="flex-1 overflow-y-auto relative bg-white">',
  '<div className="flex-1 overflow-y-auto thin-scrollbar relative bg-white">'
);
content = content.replace(
  '<div className="flex flex-col h-full">',
  '<div className="flex flex-col h-full overflow-y-auto thin-scrollbar">'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed 2, 4, 5');
