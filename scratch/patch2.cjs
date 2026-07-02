const fs = require('fs');

const filePath = 'c:/Users/user/Downloads/Project MOAT/Regaarder Compose/src/App.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Support 'highlight' in updateSheetCellFormat
const highlightUpdateTarget = `          else if (formatType === 'fontSize') updates.fontSize = formatValue;
          else if (formatType === 'color') updates.color = formatValue;`;

const highlightUpdateReplacement = `          else if (formatType === 'fontSize') updates.fontSize = formatValue;
          else if (formatType === 'color') updates.color = formatValue;
          else if (formatType === 'highlight') updates.highlight = formatValue;`;

if (content.includes(highlightUpdateTarget)) {
  console.log('Found highlightUpdateTarget, replacing...');
  content = content.replace(highlightUpdateTarget, highlightUpdateReplacement);
} else {
  console.error('Could not find highlightUpdateTarget');
}

// 2. Add backgroundColor style to Textarea and Div rendering
const textareaStyleTarget = `                                                 fontFamily: overlay.fontFamily ? FONT_FAMILY_MAP[overlay.fontFamily] || overlay.fontFamily : 'inherit',
                                                 fontSize: overlay.fontSize ? (typeof overlay.fontSize === 'number' ? \`\${overlay.fontSize}px\` : overlay.fontSize) : 'inherit',
                                                 height: 'auto',
                                                 maxHeight: '100%',
                                               }}`;

const textareaStyleReplacement = `                                                 fontFamily: overlay.fontFamily ? FONT_FAMILY_MAP[overlay.fontFamily] || overlay.fontFamily : 'inherit',
                                                 fontSize: overlay.fontSize ? (typeof overlay.fontSize === 'number' ? \`\${overlay.fontSize}px\` : overlay.fontSize) : 'inherit',
                                                 backgroundColor: overlay.highlight || 'transparent',
                                                 height: 'auto',
                                                 maxHeight: '100%',
                                               }}`;

const divStyleTarget = `                                                 fontFamily: overlay.fontFamily ? FONT_FAMILY_MAP[overlay.fontFamily] || overlay.fontFamily : 'inherit',
                                                 fontSize: overlay.fontSize ? (typeof overlay.fontSize === 'number' ? \`\${overlay.fontSize}px\` : overlay.fontSize) : 'inherit',
                                               }}`;

const divStyleReplacement = `                                                 fontFamily: overlay.fontFamily ? FONT_FAMILY_MAP[overlay.fontFamily] || overlay.fontFamily : 'inherit',
                                                 fontSize: overlay.fontSize ? (typeof overlay.fontSize === 'number' ? \`\${overlay.fontSize}px\` : overlay.fontSize) : 'inherit',
                                                 backgroundColor: overlay.highlight || 'transparent',
                                               }}`;

if (content.includes(textareaStyleTarget)) {
  console.log('Found textareaStyleTarget, replacing...');
  content = content.replace(textareaStyleTarget, textareaStyleReplacement);
} else {
  console.error('Could not find textareaStyleTarget');
}

if (content.includes(divStyleTarget)) {
  console.log('Found divStyleTarget, replacing...');
  content = content.replace(divStyleTarget, divStyleReplacement);
} else {
  console.error('Could not find divStyleTarget');
}

// 3. Set better default text color and default content for newly created shapes
const shapeInsertTarget = `                            newOverlays.push({
                              id: 'overlay-' + Date.now(),
                              type: 'rectangle',
                              shapeType: shape.type,
                              row: cellAnchor.startRow,
                              col: cellAnchor.startCol,
                              x: 60, y: 60, width: 120, height: 80,
                              content: '', color: '#8b5cf6', fillColor: '#8b5cf6', strokeType: 'none', fillType: 'solid' });`;

const shapeInsertReplacement = `                            newOverlays.push({
                              id: 'overlay-' + Date.now(),
                              type: 'rectangle',
                              shapeType: shape.type,
                              row: cellAnchor.startRow,
                              col: cellAnchor.startCol,
                              x: 60, y: 60, width: 120, height: 80,
                              content: 'New Text', color: '#ffffff', fillColor: '#8b5cf6', strokeType: 'none', fillType: 'solid' });`;

if (content.includes(shapeInsertTarget)) {
  console.log('Found shapeInsertTarget, replacing...');
  content = content.replace(shapeInsertTarget, shapeInsertReplacement);
} else {
  // Let's normalize it to check for any whitespace/CRLF mismatch
  const normalizedTarget = shapeInsertTarget.replace(/\r?\n/g, '\n');
  const normalizedContent = content.replace(/\r?\n/g, '\n');
  if (normalizedContent.includes(normalizedTarget)) {
    console.log('Found shapeInsertTarget (normalized), replacing...');
    content = content.replace(new RegExp(shapeInsertTarget.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/\r?\n/g, '\\r?\\n')), shapeInsertReplacement);
  } else {
    console.error('Could not find shapeInsertTarget');
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Patch complete.');
