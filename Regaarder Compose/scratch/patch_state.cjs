const fs = require('fs');

const filePath = 'c:/Users/user/Downloads/Project MOAT/Regaarder Compose/src/App.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings to LF
content = content.replace(/\r\n/g, '\n');

const stateTarget = `  const [selectedSheetOverlayId, setSelectedSheetOverlayId] = useState(null);`;
const stateReplacement = `  const [selectedSheetOverlayId, setSelectedSheetOverlayId] = useState(null);
  const [editingTextOverlayId, setEditingTextOverlayId] = useState(null);`;

if (content.includes(stateTarget)) {
  content = content.replace(stateTarget, stateReplacement);
  console.log('Successfully added editingTextOverlayId state definition.');
} else {
  console.error('Could not find selectedSheetOverlayId state target');
}

const crlfContent = content.replace(/\n/g, '\r\n');
fs.writeFileSync(filePath, crlfContent, 'utf8');
console.log('State patch complete.');
