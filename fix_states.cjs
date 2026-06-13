const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add headerContextMenu
const pageContextState = "const [pageContextMenu, setPageContextMenu] = useState({ open: false, x: 0, y: 0, itemId: null, isSheets: false });";
if (!content.includes('headerContextMenu = useState')) {
  content = content.replace(pageContextState, pageContextState + '\n  const [headerContextMenu, setHeaderContextMenu] = useState({ open: false, x: 0, y: 0, type: \'\', index: -1 });');
}

// 2. Fix pageContextMenu.id to pageContextMenu.itemId
content = content.replace(/pageContextMenu\.id/g, 'pageContextMenu.itemId');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed states');
