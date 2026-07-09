const fs = require('fs');
const path = require('path');

const filePath = 'c:/Users/user/Downloads/Project MOAT/Regaarder Compose/src/App.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update getSelectedCellFormat
const getSelectedCellFormatTarget = `  const getSelectedCellFormat = () => {
    if (!activeSheetGridRaw || !selectedSheetCell) return {};`;

const getSelectedCellFormatReplacement = `  const getSelectedCellFormat = () => {
    if (selectedSheetOverlayId && activeSheetGridRaw?.overlays) {
      const overlay = activeSheetGridRaw.overlays.find(o => o.id === selectedSheetOverlayId);
      if (overlay) {
        return {
          bold: !!overlay.bold,
          italic: !!overlay.italic,
          underline: !!overlay.underline,
          strikeThrough: !!overlay.strikeThrough,
          color: overlay.color,
          fontFamily: overlay.fontFamily,
          fontSize: overlay.fontSize,
        };
      }
    }
    if (!activeSheetGridRaw || !selectedSheetCell) return {};`;

if (content.includes(getSelectedCellFormatTarget)) {
  console.log('Found getSelectedCellFormatTarget, replacing...');
  content = content.replace(getSelectedCellFormatTarget, getSelectedCellFormatReplacement);
} else {
  // Let's try matching with different line endings
  const normalizedTarget = getSelectedCellFormatTarget.replace(/\r?\n/g, '\n');
  const normalizedContent = content.replace(/\r?\n/g, '\n');
  if (normalizedContent.includes(normalizedTarget)) {
    console.log('Found getSelectedCellFormatTarget (normalized), replacing...');
    // Replace in original content by finding the indices or using a regex
    content = content.replace(new RegExp(getSelectedCellFormatTarget.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/\r?\n/g, '\\r?\\n')), getSelectedCellFormatReplacement);
  } else {
    console.error('Could not find getSelectedCellFormatTarget');
  }
}

// 2. Update updateSheetCellFormat
const updateSheetCellFormatTarget = `  const updateSheetCellFormat = (sheetId, formatType, formatValue = undefined) => {
    if (!selectedSheetRange && !selectedSheetCell) return;`;

const updateSheetCellFormatReplacement = `  const updateSheetCellFormat = (sheetId, formatType, formatValue = undefined) => {
    if (selectedSheetOverlayId) {
      const overlays = activeSheetGridRaw?.overlays || [];
      const updatedOverlays = overlays.map(o => {
        if (o.id === selectedSheetOverlayId) {
          const updates = {};
          if (formatType === 'bold') updates.bold = !o.bold;
          else if (formatType === 'italic') updates.italic = !o.italic;
          else if (formatType === 'underline') updates.underline = !o.underline;
          else if (formatType === 'strikeThrough') updates.strikeThrough = !o.strikeThrough;
          else if (formatType === 'fontFamily') updates.fontFamily = formatValue;
          else if (formatType === 'fontSize') updates.fontSize = formatValue;
          else if (formatType === 'color') updates.color = formatValue;
          return { ...o, ...updates };
        }
        return o;
      });
      updateSheetSettings(sheetId, { overlays: updatedOverlays });
      return;
    }
    if (!selectedSheetRange && !selectedSheetCell) return;`;

if (content.includes(updateSheetCellFormatTarget)) {
  console.log('Found updateSheetCellFormatTarget, replacing...');
  content = content.replace(updateSheetCellFormatTarget, updateSheetCellFormatReplacement);
} else {
  const normalizedTarget = updateSheetCellFormatTarget.replace(/\r?\n/g, '\n');
  const normalizedContent = content.replace(/\r?\n/g, '\n');
  if (normalizedContent.includes(normalizedTarget)) {
    console.log('Found updateSheetCellFormatTarget (normalized), replacing...');
    content = content.replace(new RegExp(updateSheetCellFormatTarget.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/\r?\n/g, '\\r?\\n')), updateSheetCellFormatReplacement);
  } else {
    console.error('Could not find updateSheetCellFormatTarget');
  }
}

// 3. Update Shape Overlay Rendering styles
const renderingTarget = `                                           {editingTextOverlayId === overlay.id ? (
                                             <textarea
                                               className="w-full bg-transparent text-sm resize-none border-none outline-none font-medium text-center pointer-events-auto"
                                               style={{
                                                 color: overlay.color || '#333',
                                                 height: 'auto',
                                                 maxHeight: '100%',
                                               }}`;

const renderingReplacement = `                                           {editingTextOverlayId === overlay.id ? (
                                             <textarea
                                               className="w-full bg-transparent text-sm resize-none border-none outline-none font-medium text-center pointer-events-auto"
                                               style={{
                                                 color: overlay.color || '#333',
                                                 fontWeight: overlay.bold ? '700' : '500',
                                                 fontStyle: overlay.italic ? 'italic' : 'normal',
                                                 textDecoration: [
                                                   overlay.underline ? 'underline' : '',
                                                   overlay.strikeThrough ? 'line-through' : ''
                                                 ].filter(Boolean).join(' ') || 'none',
                                                 fontFamily: overlay.fontFamily ? FONT_FAMILY_MAP[overlay.fontFamily] || overlay.fontFamily : 'inherit',
                                                 fontSize: overlay.fontSize ? (typeof overlay.fontSize === 'number' ? \`\${overlay.fontSize}px\` : overlay.fontSize) : 'inherit',
                                                 height: 'auto',
                                                 maxHeight: '100%',
                                               }}`;

if (content.includes(renderingTarget)) {
  console.log('Found renderingTarget, replacing...');
  content = content.replace(renderingTarget, renderingReplacement);
} else {
  const normalizedTarget = renderingTarget.replace(/\r?\n/g, '\n');
  const normalizedContent = content.replace(/\r?\n/g, '\n');
  if (normalizedContent.includes(normalizedTarget)) {
    console.log('Found renderingTarget (normalized), replacing...');
    content = content.replace(new RegExp(renderingTarget.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/\r?\n/g, '\\r?\\n')), renderingReplacement);
  } else {
    console.error('Could not find renderingTarget');
  }
}

// 4. Update Shape Overlay Rendering display div styles
const divTarget = `                                           ) : (
                                             <div
                                               className="w-full text-sm font-medium text-center break-words"
                                               style={{ color: overlay.color || '#333' }}
                                             >`;

const divReplacement = `                                           ) : (
                                             <div
                                               className="w-full text-sm font-medium text-center break-words"
                                               style={{ 
                                                 color: overlay.color || '#333',
                                                 fontWeight: overlay.bold ? '700' : '500',
                                                 fontStyle: overlay.italic ? 'italic' : 'normal',
                                                 textDecoration: [
                                                   overlay.underline ? 'underline' : '',
                                                   overlay.strikeThrough ? 'line-through' : ''
                                                 ].filter(Boolean).join(' ') || 'none',
                                                 fontFamily: overlay.fontFamily ? FONT_FAMILY_MAP[overlay.fontFamily] || overlay.fontFamily : 'inherit',
                                                 fontSize: overlay.fontSize ? (typeof overlay.fontSize === 'number' ? \`\${overlay.fontSize}px\` : overlay.fontSize) : 'inherit',
                                               }}
                                             >`;

if (content.includes(divTarget)) {
  console.log('Found divTarget, replacing...');
  content = content.replace(divTarget, divReplacement);
} else {
  const normalizedTarget = divTarget.replace(/\r?\n/g, '\n');
  const normalizedContent = content.replace(/\r?\n/g, '\n');
  if (normalizedContent.includes(normalizedTarget)) {
    console.log('Found divTarget (normalized), replacing...');
    content = content.replace(new RegExp(divTarget.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/\r?\n/g, '\\r?\\n')), divReplacement);
  } else {
    console.error('Could not find divTarget');
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Patch complete.');
