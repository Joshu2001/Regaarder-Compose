const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "          {activeRightTab === 'whiteboard' && (\n            <div className=\"flex-1 overflow-y-auto p-4 space-y-4 bg-[#fcfcff]\">",
  "          {activeRightTab === 'whiteboard' && (\n            <div className=\"flex-1 overflow-y-auto thin-scrollbar p-4 space-y-4 bg-[#fcfcff]\">"
);
content = content.replace(
  "          {activeRightTab === 'whiteboard' && (\r\n            <div className=\"flex-1 overflow-y-auto p-4 space-y-4 bg-[#fcfcff]\">",
  "          {activeRightTab === 'whiteboard' && (\r\n            <div className=\"flex-1 overflow-y-auto thin-scrollbar p-4 space-y-4 bg-[#fcfcff]\">"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed whiteboard scrollbar');
