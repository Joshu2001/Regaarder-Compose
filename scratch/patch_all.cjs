const fs = require('fs');

const filePath = 'c:/Users/user/Downloads/Project MOAT/Regaarder Compose/src/App.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings to LF
content = content.replace(/\r\n/g, '\n');

function replaceTarget(target, replacement) {
  const lfTarget = target.replace(/\r\n/g, '\n');
  const lfReplacement = replacement.replace(/\r\n/g, '\n');
  if (content.includes(lfTarget)) {
    content = content.replace(lfTarget, lfReplacement);
    console.log('Successfully replaced target');
  } else {
    console.error('Could not find target');
  }
}

// 1. Update handleOutsideClick (already replaced in the previous run, let's verify if it's there)
const outsideClickTarget = `    const handleOutsideClick = (e) => {
      if (sheetToolbarMenuRef.current && sheetToolbarMenuRef.current.contains(e.target)) {
        return;
      }
      if (e.target.closest && (e.target.closest('.style-panel') || e.target.closest('.resize-handle'))) {
        return;
      }
      if (replayPanelRef.current && !replayPanelRef.current.contains(e.target)) {`;

if (!content.includes(outsideClickTarget)) {
  const originalOutsideClickTarget = `    const handleOutsideClick = (e) => {
      if (replayPanelRef.current && !replayPanelRef.current.contains(e.target)) {`;
  const outsideClickReplacement = `    const handleOutsideClick = (e) => {
      if (sheetToolbarMenuRef.current && sheetToolbarMenuRef.current.contains(e.target)) {
        return;
      }
      if (e.target.closest && (e.target.closest('.style-panel') || e.target.closest('.resize-handle'))) {
        return;
      }
      if (replayPanelRef.current && !replayPanelRef.current.contains(e.target)) {`;
  replaceTarget(originalOutsideClickTarget, outsideClickReplacement);
} else {
  console.log('outsideClickTarget already applied');
}

// 2. Update getSelectedCellFormat (already replaced in the previous run, let's verify)
const getSelectedCellFormatTarget = `  const getSelectedCellFormat = () => {
    if (selectedSheetOverlayId && activeSheetGridRaw?.overlays) {`;

if (!content.includes(getSelectedCellFormatTarget)) {
  const originalGetSelectedCellFormatTarget = `  const getSelectedCellFormat = () => {
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
          highlight: overlay.highlight,
        };
      }
    }
    if (!activeSheetGridRaw || !selectedSheetCell) return {};`;
  replaceTarget(originalGetSelectedCellFormatTarget, getSelectedCellFormatReplacement);
} else {
  console.log('getSelectedCellFormatTarget already applied');
}

// 3. Update updateSheetCellFormat (already replaced in previous run, let's verify)
const updateSheetCellFormatTarget = `  const updateSheetCellFormat = (sheetId, formatType, formatValue = undefined) => {
    if (selectedSheetOverlayId) {`;

if (!content.includes(updateSheetCellFormatTarget)) {
  const originalUpdateSheetCellFormatTarget = `  const updateSheetCellFormat = (sheetId, formatType, formatValue = undefined) => {
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
          else if (formatType === 'highlight') updates.highlight = formatValue;
          return { ...o, ...updates };
        }
        return o;
      });
      updateSheetSettings(sheetId, { overlays: updatedOverlays });
      return;
    }
    if (!selectedSheetRange && !selectedSheetCell) return;`;
  replaceTarget(originalUpdateSheetCellFormatTarget, updateSheetCellFormatReplacement);
} else {
  console.log('updateSheetCellFormatTarget already applied');
}

// 4. Update shape rendering text overlays using Regex (ignores exact whitespace)
const renderingRegex = /\{\s*overlay\.type\s*===\s*'rectangle'\s*&&\s*\(\s*<textarea[\s\S]*?\/>\s*\)\s*\}/;
const shapeRenderingReplacement = `{overlay.type === 'rectangle' && (
                                          <div 
                                            className="absolute inset-0 flex items-center justify-center p-3 z-10 pointer-events-none"
                                          >
                                            {editingTextOverlayId === overlay.id ? (
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
                                                  backgroundColor: overlay.highlight || 'transparent',
                                                  height: 'auto',
                                                  maxHeight: '100%',
                                                }}
                                                value={overlay.content || ''}
                                                placeholder={isSelected ? "New Text" : ""}
                                                onChange={(e) => {
                                                  updateOverlay({ content: e.target.value });
                                                  e.target.style.height = 'auto';
                                                  e.target.style.height = e.target.scrollHeight + 'px';
                                                }}
                                                ref={(el) => {
                                                  if (el) {
                                                    el.style.height = 'auto';
                                                    el.style.height = el.scrollHeight + 'px';
                                                  }
                                                }}
                                                onClick={(e) => { e.stopPropagation(); setSelectedSheetOverlayId(overlay.id); }}
                                                onMouseDown={e => e.stopPropagation()}
                                                onBlur={() => setEditingTextOverlayId(null)}
                                                autoFocus={editingTextOverlayId === overlay.id}
                                              />
                                            ) : (
                                              <div
                                                className="w-full text-sm font-medium text-center break-words pointer-events-auto select-none cursor-text"
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
                                                  backgroundColor: overlay.highlight || 'transparent',
                                                }}
                                                onClick={(e) => { e.stopPropagation(); setSelectedSheetOverlayId(overlay.id); }}
                                                onDoubleClick={(e) => { e.stopPropagation(); setSelectedSheetOverlayId(overlay.id); setEditingTextOverlayId(overlay.id); }}
                                              >
                                                {overlay.content || (isSelected ? "New Text" : "")}
                                              </div>
                                            )}
                                          </div>
                                        )}`;

if (renderingRegex.test(content)) {
  console.log('Found shape rendering regex target, replacing...');
  content = content.replace(renderingRegex, shapeRenderingReplacement);
} else {
  console.error('Could not match shape rendering regex');
}

// 5. Default newly created shape values using Regex
const shapeInsertRegex = /newOverlays\.push\(\{\s*id:\s*'overlay-'\s*\+\s*Date\.now\(\),\s*type:\s*'rectangle',\s*shapeType:\s*shape\.type,[\s\S]*?content:\s*'',\s*color:\s*'#8b5cf6',[\s\S]*?\}\);/;
const shapeInsertReplacement = `newOverlays.push({
                              id: 'overlay-' + Date.now(),
                              type: 'rectangle',
                              shapeType: shape.type,
                              row: cellAnchor.startRow,
                              col: cellAnchor.startCol,
                              x: 60, y: 60, width: 120, height: 80,
                              content: 'New Text', color: '#ffffff', fillColor: '#8b5cf6', strokeType: 'none', fillType: 'solid' });`;

if (shapeInsertRegex.test(content)) {
  console.log('Found shapeInsertRegex, replacing...');
  content = content.replace(shapeInsertRegex, shapeInsertReplacement);
} else {
  // If it's already replaced (e.g. from git status but wait, we checked out, so it should match or be already replaced)
  if (content.includes("content: 'New Text', color: '#ffffff'")) {
    console.log('shapeInsertRegex already applied');
  } else {
    console.error('Could not match shapeInsertRegex');
  }
}

// Write back with CRLF line endings to preserve Windows line endings
const crlfContent = content.replace(/\n/g, '\r\n');
fs.writeFileSync(filePath, crlfContent, 'utf8');
console.log('All patches applied.');
