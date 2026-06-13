const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('Lock,')) {
  content = content.replace('LayoutGrid,', 'LayoutGrid, Lock,');
}

const newRenderRoomStage = fs.readFileSync('c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\newRenderRoomStage.txt', 'utf8');

const startIndex = content.indexOf('const renderRoomStage = () => {');
const deckIndex = content.indexOf("if (productMode === 'deck' || productMode === 'sheets') {");

if (startIndex !== -1 && deckIndex !== -1) {
  content = content.slice(0, startIndex) + newRenderRoomStage + "\n\n" + content.slice(deckIndex);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully replaced renderRoomStage');
} else {
  console.log('Failed to find bounds:', startIndex, deckIndex);
}
