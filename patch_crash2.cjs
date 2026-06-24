const fs = require('fs');
let lines = fs.readFileSync('src/App.jsx', 'utf8').split('\n');

const startIdx = lines.findIndex(l => l.includes('const detectChartStructure ='));
const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes('recommendedType') && l.includes('return {'));

if (startIdx > -1 && endIdx > -1) {
  // we found the start and the `return {`
  // the `};` is a few lines after
  let finalIdx = endIdx;
  while (!lines[finalIdx].includes('};') && finalIdx < lines.length) {
    finalIdx++;
  }
  
  const newDetectFunc = `  const detectChartStructure = (range, grid) => {
    if (!range || !grid || !grid.cells) return null;
    const startR = Math.min(range.startRow, range.endRow) - 1;
    const endR = Math.max(range.startRow, range.endRow) - 1;
    const startC = Math.min(range.startCol, range.endCol) - 1;
    const endC = Math.max(range.startCol, range.endCol) - 1;
    
    const rows = endR - startR + 1;
    const cols = endC - startC + 1;
    if (rows <= 1 && cols <= 1) return null; // Needs at least 2 cells
    
    let labels = [];
    let series = [];
    let title = 'Chart Title';
    let isRowHeaders = false;
    let isColHeaders = false;
    
    // Check if first row is mostly text (headers)
    let firstRowHasText = false;
    for (let c = startC; c <= endC; c++) {
      if (isNaN(parseFloat(grid.cells[startR]?.[c]))) firstRowHasText = true;
    }
    
    // Check if first col is mostly text
    let firstColHasText = false;
    for (let r = startR; r <= endR; r++) {
      if (isNaN(parseFloat(grid.cells[r]?.[startC]))) firstColHasText = true;
    }
    
    let dataStartR = startR;
    let dataStartC = startC;
    
    if (firstColHasText && cols > 1) {
      isColHeaders = true;
      dataStartC++;
      for(let r = startR + (firstRowHasText?1:0); r <= endR; r++) {
        labels.push(grid.cells[r]?.[startC] || \`Row \${r+1}\`);
      }
    }
    
    if (firstRowHasText) {
      isRowHeaders = true;
      dataStartR++;
      if (!isColHeaders) {
        for(let c = startC; c <= endC; c++) {
           labels.push(grid.cells[startR]?.[c] || \`Col \${c+1}\`);
        }
      }
    }
    
    if (!firstColHasText && !firstRowHasText) {
      if (rows >= cols) {
         for(let r = startR; r <= endR; r++) labels.push(\`Item \${r+1-startR}\`);
      } else {
         for(let c = startC; c <= endC; c++) labels.push(\`Item \${c+1-startC}\`);
      }
    }
    
    if (isColHeaders) {
       for (let c = dataStartC; c <= endC; c++) {
          let sName = (isRowHeaders ? grid.cells[startR]?.[c] : \`Series \${c-dataStartC+1}\`) || \`Series \${c-dataStartC+1}\`;
          let values = [];
          for (let r = dataStartR; r <= endR; r++) {
            values.push(parseFloat(grid.cells[r]?.[c]) || 0);
          }
          series.push({ name: String(sName), data: values });
       }
    } else {
       for (let r = dataStartR; r <= endR; r++) {
          let sName = \`Series \${r-dataStartR+1}\`;
          let values = [];
          for (let c = dataStartC; c <= endC; c++) {
             values.push(parseFloat(grid.cells[r]?.[c]) || 0);
          }
          series.push({ name: String(sName), data: values });
       }
    }
    
    if (series.length === 0) return null;
    
    // Auto-recommendation logic
    let recommendedType = 'column';
    if (series.length === 1 && labels.length < 8) recommendedType = 'donut';
    else if (series.length >= 2) recommendedType = 'bar';
    
    // If labels look like dates or years, recommend line. CAST to String first!
    if (labels.some(l => l && (String(l).includes('20') || String(l).includes('/')))) {
      recommendedType = 'line';
    }
    
    return {
      labels,
      series,
      recommendedType
    };
  };`;

  lines.splice(startIdx, finalIdx - startIdx + 1, newDetectFunc);
  fs.writeFileSync('src/App.jsx', lines.join('\n'));
  console.log('Patch complete. Lines removed:', finalIdx - startIdx + 1);
} else {
  console.log('Could not find start or end block');
}
