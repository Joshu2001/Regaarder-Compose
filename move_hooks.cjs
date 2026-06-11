const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx', 'utf8');
const lines = content.split(/\r?\n/);

let callLine = -1;
let copilotLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const callRecognitionRef = useRef(null);')) callLine = i;
  if (lines[i].includes('const coPilotRecognitionRef = useRef(null);')) copilotLine = i;
}

if (callLine !== -1 && copilotLine !== -1) {
  // Save the lines
  const callStr = lines[callLine];
  const copilotStr = lines[copilotLine];
  
  // Replace them with empty strings or comments
  lines[callLine] = '    // Moved callRecognitionRef to top level';
  lines[copilotLine] = '    // Moved coPilotRecognitionRef to top level';
  
  // Find where to insert them
  let insertLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const whiteboardCanvasRef = useRef(null);')) {
      insertLine = i;
      break;
    }
  }
  
  if (insertLine !== -1) {
    lines.splice(insertLine, 0, '  const callRecognitionRef = useRef(null);', '  const coPilotRecognitionRef = useRef(null);');
    fs.writeFileSync('c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx', lines.join('\n'));
    console.log('Hooks moved successfully!');
  } else {
    console.log('Could not find insert line');
  }
} else {
  console.log('Could not find hook lines');
}
