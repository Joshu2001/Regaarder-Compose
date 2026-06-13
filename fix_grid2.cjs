const fs = require('fs');
const file = 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\src\\App.jsx';
let content = fs.readFileSync(file, 'utf8');

// Inject ResizeObserver logic
const roLogic = `
  useEffect(() => {
    window.__sheetGridRO = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.target.dataset.colIndex !== undefined) {
          const w = entry.borderBoxSize ? entry.borderBoxSize[0].inlineSize : entry.contentRect.width;
          document.documentElement.style.setProperty(\`--col-\${entry.target.dataset.colIndex}-width\`, \`\${w}px\`);
        }
        if (entry.target.dataset.rowIndex !== undefined) {
          const h = entry.borderBoxSize ? entry.borderBoxSize[0].blockSize : entry.contentRect.height;
          document.documentElement.style.setProperty(\`--row-\${entry.target.dataset.rowIndex}-height\`, \`\${h}px\`);
        }
      }
    });
    return () => {
      window.__sheetGridRO.disconnect();
    };
  }, []);
`;
if (!content.includes('__sheetGridRO')) {
  content = content.replace('useEffect(() => {\n    const handleKeyDown = (e) => {', roLogic + '\n  useEffect(() => {\n    const handleKeyDown = (e) => {');
}

// Update column header
content = content.replace(
  `{Array.from({ length: activeSheetGrid.cols }, (_, colIndex) => toColumnLabel(colIndex)).map((col, colIndex) => (
                        <div key={col} className={\`h-8 relative border-r border-gray-300 last:border-r-0 \${selectedSheetCell.col === colIndex + 1 ? 'bg-violet-100 text-violet-800' : ''}\`} style={{ resize: 'horizontal', overflow: 'hidden' }}>`,
  `{Array.from({ length: activeSheetGrid.cols }, (_, colIndex) => toColumnLabel(colIndex)).map((col, colIndex) => (
                        <div key={col} ref={el => { if (el && window.__sheetGridRO) window.__sheetGridRO.observe(el) }} data-col-index={colIndex} className={\`h-8 relative border-r border-gray-300 last:border-r-0 \${selectedSheetCell.col === colIndex + 1 ? 'bg-violet-100 text-violet-800' : ''}\`} style={{ resize: 'horizontal', overflow: 'hidden', width: \`var(--col-\${colIndex}-width, 100px)\` }}>`
);

// Update col headers gridTemplateColumns
content = content.replace(
  `style={{ gridTemplateColumns: \`48px repeat(\${activeSheetGrid.cols}, minmax(100px, 1fr))\`, minWidth: 'max-content' }}`,
  `style={{ gridTemplateColumns: \`48px \${Array.from({ length: activeSheetGrid.cols }).map((_, i) => \`var(--col-\${i}-width, minmax(100px, 1fr))\`).join(' ')}\`, minWidth: 'max-content' }}`
);

// Update row headers
content = content.replace(
  `{Array.from({ length: activeSheetGrid.rows }, (_, idx) => idx + 1).map((num) => (
                            <div key={num} className={\`h-9 relative border-b border-gray-300 text-[11px] font-semibold \${selectedSheetCell.row === num ? 'bg-violet-100 text-violet-800' : 'text-slate-700'}\`} style={{ resize: 'vertical', overflow: 'hidden' }}>`,
  `{Array.from({ length: activeSheetGrid.rows }, (_, idx) => idx + 1).map((num) => (
                            <div key={num} ref={el => { if (el && window.__sheetGridRO) window.__sheetGridRO.observe(el) }} data-row-index={num - 1} className={\`relative border-b border-gray-300 text-[11px] font-semibold flex items-center justify-center \${selectedSheetCell.row === num ? 'bg-violet-100 text-violet-800' : 'text-slate-700'}\`} style={{ resize: 'vertical', overflow: 'hidden', height: \`var(--row-\${num-1}-height, 36px)\` }}>`
);

// Update main grid wrapper
content = content.replace(
  `<div className="grid grid-cols-[48px_1fr] origin-top-left" style={{ zoom: \`\${sheetZoomLevel}%\`, minWidth: 'max-content' }}>`,
  `<div className="origin-top-left" style={{ zoom: \`\${sheetZoomLevel}%\`, minWidth: 'max-content', display: 'grid', gridTemplateColumns: \`48px \${Array.from({ length: activeSheetGrid.cols }).map((_, i) => \`var(--col-\${i}-width, minmax(100px, 1fr))\`).join(' ')}\` }}>`
);

// Replace fake background grid with actual CSS grid
const oldFakeGrid = `<div className="relative overflow-hidden bg-white" style={{ backgroundSize: '100px 36px', backgroundImage: 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)' }}>`;
const newFakeGrid = `<div className="relative overflow-hidden bg-white" style={{ display: 'grid', gridTemplateColumns: Array.from({ length: activeSheetGrid.cols }).map((_, i) => \`var(--col-\${i}-width, minmax(100px, 1fr))\`).join(' '), gridTemplateRows: Array.from({ length: activeSheetGrid.rows }).map((_, i) => \`var(--row-\${i}-height, 36px)\`).join(' ') }}>
                          {Array.from({ length: activeSheetGrid.rows * activeSheetGrid.cols }).map((_, i) => (
                            <div key={i} className="border-b border-r border-slate-200 pointer-events-none" />
                          ))}`;

content = content.replace(oldFakeGrid, newFakeGrid);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed grid');
