const fs = require('fs');
const file = 'C:/Users/user/.gemini/antigravity/worktrees/Project MOAT/swift-axis-dips-23h46/Regaarder Compose/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<button onClick=\{onClose\} className="w-full mt-8 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-medium transition-colors">\s*Start Recording\s*<\/button>/g,
  `<button onClick={() => { onClose(); startRoomRecording(); }} className="w-full mt-8 py-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl font-medium transition-colors">Start Recording</button>`
);

fs.writeFileSync(file, content);
console.log("Successfully patched modal.");
