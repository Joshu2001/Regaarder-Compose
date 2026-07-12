const fs = require('fs');
const file = 'C:/Users/user/.gemini/antigravity/worktrees/Project MOAT/swift-axis-dips-23h46/Regaarder Compose/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove padding from outer fixed container
content = content.replace(
  /<div className="fixed inset-0 z-\[9999\] bg-\[#F9F8F6\] bg-\[radial-gradient\(ellipse_at_center,_var\(--tw-gradient-stops\)\)\] from-\[#FFFDFB\] via-\[#F9F8F6\] to-\[#F1F0EE\] flex flex-col items-center justify-center font-sans overflow-hidden transition-all duration-500 p-2 md:p-4">/g,
  `<div className={\`fixed inset-0 z-[9999] bg-[#F9F8F6] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FFFDFB] via-[#F9F8F6] to-[#F1F0EE] flex flex-col items-center justify-center font-sans overflow-hidden transition-all duration-500 \${isVideoExpanded ? 'p-0 bg-black' : 'p-2 md:p-4'}\`}>`
);

// 2. Remove max width from centering container
content = content.replace(
  /<div className="w-full h-full relative flex items-center justify-center max-w-\[1640px\]">/g,
  `<div className={\`w-full h-full relative flex items-center justify-center \${isVideoExpanded ? 'max-w-none bg-black' : 'max-w-[1640px]'}\`}>`
);

// 3. Remove border, border-radius, and shadow from glass panel, and add background double click
content = content.replace(
  /<div className="w-full h-full bg-white\/70 backdrop-blur-\[60px\] flex flex-col overflow-hidden relative transition-all duration-500 shadow-\[0_32px_120px_rgba\(0,0,0,0\.04\)\] border border-white\/60 rounded-\[40px\]">/g,
  `<div onDoubleClick={(e) => { if (e.target === e.currentTarget) toggleImmersiveFullscreen(); }} className={\`w-full h-full backdrop-blur-[60px] flex flex-col overflow-hidden relative transition-all duration-500 shadow-[0_32px_120px_rgba(0,0,0,0.04)] \${isVideoExpanded ? 'bg-black border-transparent rounded-none' : 'bg-white/70 border border-white/60 rounded-[40px]'}\`}>`
);

// 4. Hide header
content = content.replace(
  /\{renderRoomTopHeader\(\)\}/g,
  `{!isVideoExpanded && renderRoomTopHeader()}`
);

// 5. Remove border radius from main workspace and add background double click here too
content = content.replace(
  /<div className="flex-1 relative overflow-hidden bg-transparent rounded-t-\[40px\]">/g,
  `<div onDoubleClick={(e) => { if (e.target === e.currentTarget) toggleImmersiveFullscreen(); }} className={\`flex-1 relative overflow-hidden bg-transparent \${isVideoExpanded ? 'rounded-none' : 'rounded-t-[40px]'}\`}>`
);

// 6. Remove p-8 from canvas area, and add double click here as well
content = content.replace(
  /<div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-8 gap-6">/g,
  `<div onDoubleClick={(e) => { if (e.target === e.currentTarget) toggleImmersiveFullscreen(); }} className={\`absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-6 \${isVideoExpanded ? 'p-0' : 'p-8'}\`}>`
);

fs.writeFileSync(file, content);
console.log('Successfully patched true fullscreen styling');
