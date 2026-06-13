const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
const content = fs.readFileSync(file, 'utf8');

const match = content.match(/import\s+\{[^}]*\}\s+from\s+['"]lucide-react['"]/);
if (match) {
  const imports = match[0];
  const missing = [];
  const required = ['ChevronRight', 'Mic', 'MicOff', 'MoreHorizontal', 'Sparkles', 'FileText', 'Clock', 'ListTodo', 'Send', 'ArrowUp', 'Video', 'VideoOff', 'PhoneOff', 'Users', 'Calendar', 'ChevronDown', 'LinkIcon'];
  for (const r of required) {
    if (!imports.includes(r)) {
      missing.push(r);
    }
  }
  console.log("Missing imports:", missing);
} else {
  console.log("lucide-react import NOT FOUND");
}
