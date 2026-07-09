import TurndownService from 'turndown';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import pptxgen from 'pptxgenjs';
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';

// Compose Exports
export const exportCompose = async (format, editorHtml, rawData, fileName = 'Document') => {
  if (format === 'Compose' || format === 'Docs') {
    // Export raw JSON or text
    const blob = new Blob([JSON.stringify(rawData, null, 2)], { type: 'application/json' });
    saveAs(blob, `${fileName}.json`);
    return;
  }
  
  if (format === 'Markdown') {
    const turndownService = new TurndownService();
    const markdown = turndownService.turndown(editorHtml);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    saveAs(blob, `${fileName}.md`);
    return;
  }
  
  if (format === 'Word') {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun(editorHtml.replace(/<[^>]+>/g, '')) // Simplistic HTML to Text mapping
            ]
          })
        ]
      }]
    });
    const docxBlob = await Packer.toBlob(doc);
    saveAs(docxBlob, `${fileName}.docx`);
    return;
  }
  
  if (format === 'PDF') {
    const element = document.createElement('div');
    element.innerHTML = editorHtml;
    html2pdf().set({
      margin: 10,
      filename: `${fileName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(element).save();
    return;
  }
};

// Sheets Exports
export const exportSheets = async (format, gridData, fileName = 'Spreadsheet') => {
  if (format === 'Sheets' || format === 'JSON') {
    const blob = new Blob([JSON.stringify(gridData, null, 2)], { type: 'application/json' });
    saveAs(blob, `${fileName}.json`);
    return;
  }

  // Ensure gridData is array of arrays
  let dataArray = gridData;
  if (!Array.isArray(gridData)) {
    dataArray = [];
    const maxRow = Math.max(...Object.keys(gridData).map(Number)) || 0;
    for (let r = 0; r <= maxRow; r++) {
      const row = [];
      if (gridData[r]) {
        const maxCol = Math.max(...Object.keys(gridData[r]).map(Number)) || 0;
        for (let c = 0; c <= maxCol; c++) {
          row.push(gridData[r][c]?.value || gridData[r][c] || '');
        }
      }
      dataArray.push(row);
    }
  }

  if (format === 'CSV') {
    const worksheet = XLSX.utils.aoa_to_sheet(dataArray);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv' });
    saveAs(blob, `${fileName}.csv`);
    return;
  }

  if (format === 'XLSX') {
    const worksheet = XLSX.utils.aoa_to_sheet(dataArray);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    return;
  }

  if (format === 'PDF') {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.text(fileName, 10, 10);
    let startY = 20;
    dataArray.forEach((row, rIdx) => {
      let startX = 10;
      row.forEach((cell, cIdx) => {
        doc.text(String(cell || '').substring(0, 15), startX, startY);
        startX += 30;
      });
      startY += 10;
    });
    doc.save(`${fileName}.pdf`);
    return;
  }
};

// Deck Exports
export const exportDeck = async (format, deckSlides, fileName = 'Presentation') => {
  if (format === 'Deck') {
    const blob = new Blob([JSON.stringify(deckSlides, null, 2)], { type: 'application/json' });
    saveAs(blob, `${fileName}.json`);
    return;
  }

  if (format === 'PPTX') {
    const pres = new pptxgen();
    deckSlides.forEach((slide) => {
      const presSlide = pres.addSlide();
      if (slide.design.title) {
        presSlide.addText(slide.design.title, { x: 1, y: 1, w: '80%', fontSize: 32, bold: true });
      }
      if (slide.design.subtitle) {
        presSlide.addText(slide.design.subtitle, { x: 1, y: 2, w: '80%', fontSize: 24 });
      }
      if (slide.design.points && slide.design.points.length > 0) {
        slide.design.points.forEach((pt, i) => {
          presSlide.addText(pt, { x: 1, y: 3 + (i * 0.5), w: '80%', fontSize: 18, bullet: true });
        });
      }
    });
    pres.writeFile({ fileName: `${fileName}.pptx` });
    return;
  }

  if (format === 'PDF') {
    const doc = new jsPDF({ orientation: 'landscape' });
    deckSlides.forEach((slide, idx) => {
      if (idx > 0) doc.addPage();
      doc.setFontSize(32);
      if (slide.design.title) doc.text(slide.design.title, 20, 30);
      doc.setFontSize(24);
      if (slide.design.subtitle) doc.text(slide.design.subtitle, 20, 50);
      doc.setFontSize(18);
      if (slide.design.points) {
        slide.design.points.forEach((pt, i) => {
          doc.text(`• ${pt}`, 20, 80 + (i * 15));
        });
      }
    });
    doc.save(`${fileName}.pdf`);
    return;
  }
};

// Whiteboard Exports
export const exportWhiteboard = async (format, whiteboardObjects, canvasElement, fileName = 'Whiteboard') => {
  if (format === 'Whiteboard') {
    const blob = new Blob([JSON.stringify(whiteboardObjects, null, 2)], { type: 'application/json' });
    saveAs(blob, `${fileName}.json`);
    return;
  }

  if (format === 'PNG') {
    if (!canvasElement) return;
    const canvas = await html2canvas(canvasElement);
    canvas.toBlob((blob) => {
      saveAs(blob, `${fileName}.png`);
    });
    return;
  }

  if (format === 'SVG') {
    // Generate simple SVG from objects
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">\n`;
    svgContent += `  <rect width="100%" height="100%" fill="#ffffff" />\n`;
    whiteboardObjects.forEach(obj => {
      if (obj.type === 'rect') {
        svgContent += `  <rect x="${obj.x}" y="${obj.y}" width="${obj.w}" height="${obj.h}" fill="${obj.color || '#e2e8f0'}" stroke="#94a3b8" stroke-width="2" rx="8" ry="8" />\n`;
        if (obj.text) {
          svgContent += `  <text x="${obj.x + 10}" y="${obj.y + 20}" font-family="sans-serif" font-size="14" fill="#1e293b">${obj.text}</text>\n`;
        }
      } else if (obj.type === 'circle') {
        svgContent += `  <circle cx="${obj.x + obj.w/2}" cy="${obj.y + obj.h/2}" r="${obj.w/2}" fill="${obj.color || '#e2e8f0'}" stroke="#94a3b8" stroke-width="2" />\n`;
      }
    });
    svgContent += `</svg>`;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    saveAs(blob, `${fileName}.svg`);
    return;
  }

  if (format === 'PDF') {
    if (!canvasElement) return;
    const canvas = await html2canvas(canvasElement);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${fileName}.pdf`);
    return;
  }
};
