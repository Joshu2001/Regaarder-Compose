const fs = require('fs');

const filePath = 'src/App.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: Properly append RotateCw and Unlock to lucide-react imports
const importMarker = "} from 'lucide-react';";
if (content.includes(importMarker) && !content.includes('RotateCw, Unlock')) {
  content = content.replace(importMarker, "  , RotateCw, Unlock\n} from 'lucide-react';");
}

// Fix 2: Add hover outline
const classMarker = "className={`absolute z-[100] flex items-center justify-center text-sm`}";
if (content.includes(classMarker)) {
  const newClassMarker = "className={`absolute z-[100] flex items-center justify-center text-sm group hover:outline hover:outline-2 hover:outline-blue-400/50 transition-all ${isLocked ? 'cursor-not-allowed' : 'cursor-move'}`}";
  content = content.replace(classMarker, newClassMarker);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Final patch applied successfully!');
