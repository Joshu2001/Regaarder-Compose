const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

content = content.replace(
  /\['Data', 'Insert', 'Analyze', 'Visualize'\]/g,
  "['Data', 'Templates', 'Analyze', 'Visualize', 'Export']"
);

fs.writeFileSync(appPath, content, 'utf8');
console.log('Tabs updated');
