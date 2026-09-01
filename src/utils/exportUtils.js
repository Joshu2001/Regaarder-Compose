import TurndownService from 'turndown';
import fileSaver from 'file-saver';
const saveAs = fileSaver.saveAs || fileSaver;
import * as XLSX from 'xlsx';
import pptxgen from 'pptxgenjs';
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';

// Helper to decode HTML entities in text
export const unescapeHtml = (html = '') => {
  if (typeof document !== 'undefined' && document.createElement) {
    try {
      const tmp = document.createElement('textarea');
      tmp.innerHTML = html;
      if (typeof tmp.value === 'string' && tmp.value.length > 0) return tmp.value;
    } catch (_e) {}
  }
  return String(html || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
};

// Helper to strip HTML tags cleanly and decode entities
export const htmlToPlainText = (html = '') => {
  if (!html) return '';
  let text = '';
  if (typeof document !== 'undefined' && document.createElement) {
    try {
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      text = tmp.textContent || tmp.innerText || '';
    } catch (_e) {}
  }
  if (!text) {
    text = String(html).replace(/<[^>]+>/g, '');
  }
  return unescapeHtml(text).trim();
};

/**
 * Unified Compose Document Exporter
 * @param {string} format - Export format (PDF, Markdown, Plain Text, DOC, HTML, Compose)
 * @param {string|object} contentOrPayload - HTML string or payload object { title, subtitle, initiatives, bodyHtml }
 * @param {object} rawData - Extra document state/metadata
 * @param {string} fileName - Base filename
 */
export const exportCompose = async (format, contentOrPayload = '', rawData = {}, fileName = 'Document') => {
  try {
    let fullHtml = '';
    let payload = rawData || {};

    if (typeof contentOrPayload === 'object' && contentOrPayload !== null) {
      payload = { ...rawData, ...contentOrPayload };
      const titleHtml = payload.title ? `<h1>${payload.title}</h1>` : '';
      const subtitleHtml = payload.subtitle ? `<p><em>${payload.subtitle}</em></p>` : '';
      const initiativesHtml = (payload.initiatives && payload.initiatives.length > 0)
        ? `<ul>${payload.initiatives.map((item) => `<li>${item.name || item.title || item} (${item.timeline || ''})</li>`).join('')}</ul>`
        : '';
      const bodyHtml = payload.bodyHtml || payload.content || '';
      fullHtml = `${titleHtml}${subtitleHtml}${initiativesHtml}${bodyHtml}`;
    } else {
      fullHtml = String(contentOrPayload || '');
    }

    const fmt = (format || '').toLowerCase();

    // 1. Compose (.cmp) / JSON
    if (fmt.includes('compose') || fmt.includes('docs') || fmt === 'json') {
      const exportData = (typeof contentOrPayload === 'object' && contentOrPayload !== null) ? contentOrPayload : { bodyHtml: fullHtml, ...rawData };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      saveAs(blob, `${fileName}.cmp`);
      return true;
    }

    // 2. Markdown (.md)
    if (fmt.includes('markdown') || fmt === 'md') {
      let markdown = '';
      try {
        const turndownService = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
        markdown = turndownService.turndown(fullHtml || ' ');
      } catch (_err) {
        markdown = htmlToPlainText(fullHtml);
      }
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
      saveAs(blob, `${fileName}.md`);
      return true;
    }

    // 3. Plain Text (.txt)
    if (fmt.includes('plain') || fmt.includes('text') || fmt === 'txt') {
      const plainText = htmlToPlainText(fullHtml);
      const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, `${fileName}.txt`);
      return true;
    }

    // 4. Word (.docx / .doc)
    if (fmt.includes('word') || fmt.includes('doc')) {
      const docMarkup = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${fileName}</title></head><body>${fullHtml}</body></html>`;
      const blob = new Blob([docMarkup], { type: 'application/msword' });
      saveAs(blob, `${fileName}.doc`);
      return true;
    }

    // 5. HTML (.html)
    if (fmt.includes('html')) {
      const htmlDoc = `<!doctype html><html><head><meta charset="utf-8"/><title>${fileName}</title></head><body>${fullHtml}</body></html>`;
      const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' });
      saveAs(blob, `${fileName}.html`);
      return true;
    }

    // 6. PDF (.pdf)
    if (fmt.includes('pdf')) {
      if (typeof document === 'undefined') return false;
      const element = document.createElement('div');
      element.className = 'pdf-export-container';
      element.style.padding = '24px';
      element.style.fontFamily = 'sans-serif';
      element.style.color = '#1e293b';
      element.innerHTML = fullHtml || ' ';
      document.body.appendChild(element);

      try {
        await html2pdf().set({
          margin: 15,
          filename: `${fileName}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).from(element).save();
      } catch (err) {
        console.error('PDF Export Error:', err);
        const pdf = new jsPDF();
        pdf.text(htmlToPlainText(fullHtml).substring(0, 2000), 10, 10);
        pdf.save(`${fileName}.pdf`);
      } finally {
        if (element.parentNode) element.parentNode.removeChild(element);
      }
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error during document export:', error);
    return false;
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
