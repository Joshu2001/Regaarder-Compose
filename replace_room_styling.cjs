const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Top Header
content = content.replace(
  '<div className="absolute top-0 left-0 right-0 h-[72px] bg-white border-b border-gray-200 flex items-center justify-between px-6 z-50">',
  '<div className="absolute top-0 left-0 right-0 h-[88px] bg-white border-b border-gray-200 flex items-center justify-between px-8 py-5 z-50">'
);

content = content.replace(
  '<div className="bg-violet-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">\n          <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>\n          Meeting Active\n        </div>',
  '<div className="bg-violet-50 text-violet-700 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-violet-100 shadow-sm">\n          <Sparkles size={14} className="text-violet-500" /> AI Active\n        </div>'
);

content = content.replace(
  '<div className="text-gray-800 font-semibold text-lg">Team Sync</div>',
  '<div className="text-slate-900 font-semibold text-[24px] leading-[32px] flex items-center gap-2">Product Strategy Meeting <ChevronDown size={18} className="text-slate-400" /></div>'
);

// 2. Participant Sidebar
content = content.replace(
  /className="relative rounded-2xl overflow-hidden bg-gray-100 h-36 border border-gray-200"/g,
  'className="relative rounded-[24px] overflow-hidden bg-gray-100 min-h-[136px] border border-[rgba(124,58,237,0.08)] shadow-[0_8px_30px_rgba(124,58,237,0.06)]"'
);

content = content.replace(
  /className="relative rounded-2xl overflow-hidden bg-gray-100 h-32 border border-gray-200"/g,
  'className="relative rounded-[24px] overflow-hidden bg-gray-100 min-h-[136px] border border-[rgba(124,58,237,0.08)] shadow-[0_8px_30px_rgba(124,58,237,0.06)]"'
);

// Soften Left Utility Cards (Document Outline)
content = content.replace(
  '<div className="rounded-2xl border border-violet-200 bg-white p-3 shadow-sm relative overflow-hidden">',
  '<div className="rounded-[20px] border border-[rgba(124,58,237,0.08)] bg-white p-4 shadow-[0_8px_30px_rgba(124,58,237,0.06)] relative overflow-hidden">'
);
content = content.replace(
  '<div className="text-[11px] font-semibold uppercase tracking-wide text-violet-700 mb-2">Document Outline</div>',
  '<div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-3">Document Outline</div>'
);
content = content.replace(
  '<div className="text-[10px] font-bold text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full">0 Sections</div>',
  '<div className="text-[10px] font-medium text-violet-500 bg-violet-50 px-2 py-0.5 rounded-full">0 Sections</div>'
);

// Center Workspace / Toolbar
content = content.replace(
  '<div className="flex items-center gap-2 px-3 py-1.5 overflow-x-auto no-scrollbar shrink-0">',
  '<div className="flex items-center gap-4 px-4 py-2 overflow-x-auto no-scrollbar shrink-0 h-[56px]">'
);

// Tabs spacing
content = content.replace(
  '<div className="flex gap-4">',
  '<div className="flex gap-6">'
);
content = content.replace(
  'border-b-2 border-violet-600 text-violet-700',
  'border-b-[3px] border-violet-600 text-violet-700 pb-1'
);

// Empty State
content = content.replace(
  '<h3 className="text-3xl font-bold text-gray-300 mb-4 select-none max-w-lg leading-tight">',
  '<h3 className="text-[26px] font-medium text-gray-300/80 mb-4 select-none max-w-lg leading-tight">'
);

// Room Assistant Panel
content = content.replace(
  '<div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-4 relative overflow-hidden">',
  '<div className="bg-white rounded-[20px] border border-[rgba(124,58,237,0.08)] shadow-[0_8px_30px_rgba(124,58,237,0.06)] p-6 relative overflow-hidden">'
);
content = content.replace(
  '<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">',
  '<div className="bg-white rounded-[20px] border border-[rgba(124,58,237,0.08)] shadow-[0_8px_30px_rgba(124,58,237,0.06)] p-6">'
);

// Chat Area
content = content.replace(
  '<div className="px-4 py-2.5 text-xs font-bold text-violet-700 border-b-2 border-violet-600">Chat</div>',
  '<div className="px-4 py-3 text-[13px] font-semibold text-violet-700 border-b-[3px] border-violet-600">Chat</div>'
);
content = content.replace(
  '<div className="px-4 py-2.5 text-xs font-medium text-gray-500 hover:text-gray-700 cursor-pointer">Notes</div>',
  '<div className="px-4 py-3 text-[13px] font-medium text-slate-500 hover:text-slate-800 cursor-pointer">Notes</div>'
);
content = content.replace(
  '<div className="px-4 py-2.5 text-xs font-medium text-gray-500 hover:text-gray-700 cursor-pointer">Highlights</div>',
  '<div className="px-4 py-3 text-[13px] font-medium text-slate-500 hover:text-slate-800 cursor-pointer">Highlights</div>'
);
content = content.replace(
  '<input type="text" placeholder="Message everyone..." className="w-full bg-gray-50 border border-gray-200 rounded-full py-2 pl-3 pr-10 text-xs outline-none focus:border-violet-300" />',
  '<input type="text" placeholder="Message everyone..." className="w-full bg-gray-50 border border-gray-200 rounded-[24px] py-0 pl-4 pr-12 text-[13px] outline-none focus:border-violet-300 min-h-[48px]" />'
);
content = content.replace(
  '<button className="absolute right-1 top-1 w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center">',
  '<button className="absolute right-2 top-2 w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-sm hover:bg-violet-700">'
);

// Bottom Control Bar
content = content.replace(
  '<div className="absolute bottom-0 left-0 right-0 h-[72px] bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-[500] flex items-center justify-between px-6">',
  '<div className="absolute bottom-0 left-0 right-0 h-[80px] bg-white border-t border-[rgba(124,58,237,0.08)] shadow-[0_8px_30px_rgba(124,58,237,0.06)] z-[500] flex items-center justify-between px-8">'
);

content = content.replace(/h-10 rounded-full/g, 'h-[48px] rounded-[999px]');

// Room AI Button
content = content.replace(
  '<button className="flex items-center gap-2 px-5 h-[48px] rounded-[999px] bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">',
  '<button className="flex items-center gap-2 px-8 h-[48px] rounded-[999px] bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] text-white text-[15px] font-bold shadow-[0_8px_30px_rgba(139,92,246,0.3)] hover:shadow-[0_12px_40px_rgba(139,92,246,0.4)] transition-all hover:-translate-y-0.5">'
);

// Component shadows globally in the room replaced with softer ones
content = content.replace(
  /shadow-sm/g,
  'shadow-[0_8px_30px_rgba(124,58,237,0.06)]'
);

fs.writeFileSync(file, content, 'utf8');
console.log('UI Fixes Applied');
