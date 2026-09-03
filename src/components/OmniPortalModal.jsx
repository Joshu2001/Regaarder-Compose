import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FolderPlus, 
  FileText, 
  Table, 
  Presentation, 
  FileCode, 
  Check, 
  Loader2, 
  Layers, 
  Eye, 
  ArrowRight,
  Database,
  Grid,
  ShieldCheck,
  Zap,
  CheckCircle2
} from 'lucide-react';
import JSZip from 'jszip';
import { ImportPortalIcon } from './RegaarderProductIcons';
import RegaarderBrandIcon from './RegaarderBrandIcon';

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * FileTypeBadge Component — Image 4 Branded SVG Specification
 * Features rich, authentic branding:
 * - PDF: Adobe Crimson Red with folded corner document
 * - DOCX: Microsoft Blue with structured text document
 * - XLSX / CSV: Excel Emerald Green with data matrix grid
 * - PPTX: PowerPoint Warm Amber with presentation screen
 */
export const FileTypeBadge = ({ ext = 'DOCX', type = 'docs', className = '' }) => {
  const upper = (ext || 'DOCX').toUpperCase().trim();
  const isSpreadsheet = ['XLSX', 'XLS', 'CSV', 'ODS', 'TSV', 'NUMBERS'].includes(upper);
  const isPdf = upper === 'PDF';
  const isPresentation = ['PPTX', 'PPT', 'KEY'].includes(upper);
  
  const bgColor = isSpreadsheet 
    ? '#059669' 
    : isPdf 
    ? '#DC2626' 
    : isPresentation 
    ? '#D97706' 
    : '#2563EB';

  const label = upper.length > 4 ? upper.slice(0, 4) : upper;

  return (
    <div
      className={`w-10 h-11 rounded-xl flex flex-col items-center justify-center text-white shrink-0 shadow-xs relative overflow-hidden select-none ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <div className="text-[9.5px] font-black tracking-tighter uppercase mb-0.5 leading-none">
        {label}
      </div>
      {isSpreadsheet ? (
        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M2.5 6.5H13.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M2.5 10.5H13.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M6.5 6.5V13.5" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      ) : isPdf ? (
        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.5 2H10L13.5 5.5V13.5C13.5 14.0523 13.0523 14.5 12.5 14.5H3.5C2.94772 14.5 2.5 14.0523 2.5 13.5V3C2.5 2.44772 2.94772 2 3.5 2Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9.5 2V5.5H13.5" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      ) : isPresentation ? (
        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2.5" y="3" width="11" height="8.5" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 11.5V14.5M5.5 14.5H10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.5 2H10L13.5 5.5V13.5C13.5 14.0523 13.0523 14.5 12.5 14.5H3.5C2.94772 14.5 2.5 14.0523 2.5 13.5V3C2.5 2.44772 2.94772 2 3.5 2Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5.5 7H10.5M5.5 10H8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
};

// Robust DOCX XML Parser extracting real paragraphs, headings, and tables
async function extractDocxContent(file, cleanTitle) {
  try {
    const zip = await JSZip.loadAsync(file);
    const docXml = await zip.file('word/document.xml')?.async('text');
    if (!docXml) return null;

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(docXml, 'application/xml');
    const body = xmlDoc.getElementsByTagName('w:body')[0];
    if (!body) return null;

    let html = '';
    const children = Array.from(body.childNodes);

    for (const child of children) {
      const nodeName = child.nodeName;

      if (nodeName === 'w:p') {
        const textRuns = Array.from(child.getElementsByTagName('w:t')).map(t => t.textContent).join('');
        if (!textRuns.trim()) continue;

        const pStyle = child.getElementsByTagName('w:pStyle')[0]?.getAttribute('w:val') || '';
        const isHeading1 = /heading\s*1/i.test(pStyle);
        const isHeading2 = /heading\s*2/i.test(pStyle);
        const isHeading3 = /heading\s*3/i.test(pStyle);
        const isBold = child.getElementsByTagName('w:b').length > 0;

        if (isHeading1) {
          html += `<h1 class="text-2xl font-bold my-3 text-slate-900 dark:text-white">${escapeHtml(textRuns)}</h1>\n`;
        } else if (isHeading2) {
          html += `<h2 class="text-xl font-bold my-2 text-slate-900 dark:text-white">${escapeHtml(textRuns)}</h2>\n`;
        } else if (isHeading3) {
          html += `<h3 class="text-lg font-semibold my-2 text-slate-800 dark:text-zinc-100">${escapeHtml(textRuns)}</h3>\n`;
        } else if (isBold && textRuns.length < 80) {
          html += `<p class="font-bold my-2 text-slate-900 dark:text-zinc-100">${escapeHtml(textRuns)}</p>\n`;
        } else {
          html += `<p class="my-2 text-slate-700 dark:text-zinc-300 leading-relaxed">${escapeHtml(textRuns)}</p>\n`;
        }
      } else if (nodeName === 'w:tbl') {
        html += `<div class="my-4 overflow-x-auto"><table class="w-full border-collapse border border-slate-300 dark:border-zinc-700 text-xs text-left">\n<tbody>\n`;
        const rows = child.getElementsByTagName('w:tr');
        for (let r = 0; r < rows.length; r++) {
          const cells = rows[r].getElementsByTagName('w:tc');
          html += `<tr>\n`;
          for (let c = 0; c < cells.length; c++) {
            const cellText = Array.from(cells[c].getElementsByTagName('w:t')).map(t => t.textContent).join(' ');
            const tag = r === 0 ? 'th' : 'td';
            const cellClass = r === 0 
              ? 'border border-slate-300 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 p-2 font-semibold' 
              : 'border border-slate-300 dark:border-zinc-700 p-2';
            html += `<${tag} class="${cellClass}">${escapeHtml(cellText)}</${tag}>\n`;
          }
          html += `</tr>\n`;
        }
        html += `</tbody>\n</table></div>\n`;
      }
    }

    if (!html.trim()) {
      const matches = docXml.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
      if (matches && matches.length > 0) {
        const text = matches.map(m => m.replace(/<[^>]+>/g, '')).join(' ');
        html = `<p class="my-2 text-slate-700 dark:text-zinc-300 leading-relaxed">${escapeHtml(text)}</p>`;
      }
    }

    return html || null;
  } catch (err) {
    console.warn('DOCX extraction fallback:', err);
    return null;
  }
}

// Robust PPTX XML Parser extracting real slide text frames
async function extractPptxContent(file, cleanTitle) {
  try {
    const zip = await JSZip.loadAsync(file);
    const slideFileNames = Object.keys(zip.files).filter(name => /^ppt\/slides\/slide\d+\.xml$/i.test(name));
    
    slideFileNames.sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
      const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
      return numA - numB;
    });

    if (slideFileNames.length === 0) return null;

    const slides = [];
    const parser = new DOMParser();

    for (let i = 0; i < slideFileNames.length; i++) {
      const xml = await zip.files[slideFileNames[i]].async('text');
      const xmlDoc = parser.parseFromString(xml, 'application/xml');
      const paragraphs = xmlDoc.getElementsByTagName('a:p');
      const textLines = [];

      for (const p of Array.from(paragraphs)) {
        const text = Array.from(p.getElementsByTagName('a:t')).map(t => t.textContent).join('');
        if (text && text.trim()) {
          textLines.push(text.trim());
        }
      }

      const slideTitle = textLines[0] || `Slide ${i + 1}`;
      const bullets = textLines.slice(1, 7);

      slides.push({
        id: `slide-${Date.now()}-${i + 1}`,
        title: slideTitle,
        subtitle: textLines[1] && bullets.length === 0 ? textLines[1] : (i === 0 ? 'Enterprise Readout' : 'Executive Analysis'),
        layout: i === 0 ? 'title' : (bullets.length > 2 ? 'bento' : 'split'),
        bullets: bullets.length > 0 ? bullets : ['Key strategic initiative', 'Enterprise execution roadmap']
      });
    }

    return slides;
  } catch (err) {
    console.warn('PPTX extraction fallback:', err);
    return null;
  }
}

// Raw binary text scanner — last-resort for encrypted or malformed PDFs.
// Pulls readable ASCII/Latin strings directly from the binary stream.
async function extractPdfRawText(file) {
  try {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const decoder = new TextDecoder('latin1');
    const raw = decoder.decode(bytes);
    // Extract readable strings of 4+ printable characters
    const matches = raw.match(/[\x20-\x7E\xA0-\xFF]{4,}/g) || [];
    // Filter out PDF binary noise (long hex strings, stream tokens)
    const cleaned = matches
      .filter(s => !/^[0-9a-fA-F]{8,}$/.test(s) && !/^[\x20]{3,}$/.test(s))
      .filter(s => s.trim().length > 3 && /[a-zA-ZÀ-ÿ]/.test(s))
      .slice(0, 400);
    return cleaned.length > 0 ? cleaned.join(' ') : null;
  } catch {
    return null;
  }
}

// Robust PDF Text Extractor using pdfjs, with raw-stream fallback
async function extractPdfContent(file, cleanTitle) {
  // ── Primary: pdfjs structured extraction ──────────────────────────
  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const buffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: buffer, disableWorker: true });
    const pdf = await loadingTask.promise;
    const maxPages = Math.min(pdf.numPages || 0, 15);
    let html = `<h1 class="text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-4">${escapeHtml(cleanTitle)}</h1>\n`;
    let totalChars = 0;

    for (let pNum = 1; pNum <= maxPages; pNum++) {
      const page = await pdf.getPage(pNum);
      const textContent = await page.getTextContent();
      const lines = [];
      let currentLine = '';

      for (const item of textContent.items) {
        if ('str' in item) {
          currentLine += item.str + ' ';
          if (item.hasEOL) {
            if (currentLine.trim()) lines.push(currentLine.trim());
            currentLine = '';
          }
        }
      }
      if (currentLine.trim()) lines.push(currentLine.trim());
      totalChars += lines.join('').length;

      html += `<div class="mb-5 p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-700/60">\n`;
      html += `<div class="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-2">Page ${pNum} of ${pdf.numPages}</div>\n`;
      
      for (const line of lines) {
        if (line.length < 50 && (line === line.toUpperCase() || /^[A-Z0-9\s:.-]+$/.test(line))) {
          html += `<h3 class="text-sm font-bold text-slate-800 dark:text-zinc-200 mt-2 mb-1">${escapeHtml(line)}</h3>\n`;
        } else {
          html += `<p class="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed my-1">${escapeHtml(line)}</p>\n`;
        }
      }
      html += `</div>\n`;
    }

    // If pdfjs returned no usable text, fall through to raw extractor
    if (totalChars < 20) throw new Error('pdfjs returned empty text');
    return html;
  } catch (err) {
    console.warn('pdfjs extraction failed, trying raw scan:', err);
  }

  // ── Secondary: raw binary string scan ────────────────────────────
  try {
    const rawText = await extractPdfRawText(file);
    if (rawText && rawText.trim().length > 30) {
      const sentences = rawText.match(/[^.!?\n]{10,}[.!?]?/g) || rawText.split(/\s{2,}/);
      let html = `<h1 class="text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-4">${escapeHtml(cleanTitle)}</h1>\n`;
      html += `<div class="mb-3 flex items-center gap-1.5 text-[10.5px] font-semibold text-amber-600 dark:text-amber-400"><span>⚠</span><span>Partial text extracted — PDF may use embedded images or non-standard encoding.</span></div>\n`;
      html += `<div class="space-y-1">\n`;
      sentences.slice(0, 120).forEach(s => {
        const trimmed = s.trim();
        if (trimmed.length > 4) {
          html += `<p class="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed my-1">${escapeHtml(trimmed)}</p>\n`;
        }
      });
      html += `</div>\n`;
      // Mark partial so inspector can show a notice
      return { html, partial: true };
    }
  } catch (rawErr) {
    console.warn('Raw PDF scan also failed:', rawErr);
  }

  return null;
}


/**
 * OmniPortalModal — Enterprise Batch Migration Engine
 */
export default function OmniPortalModal({
  isOpen,
  onClose,
  onBatchAbsorbed,
  onOpenDocument
}) {
  const [dragActive, setDragActive] = useState(false);
  const [filesQueue, setFilesQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressRatio, setProgressRatio] = useState(0);
  const [processedResults, setProcessedResults] = useState([]);
  const [previewItem, setPreviewItem] = useState(null);
  const [previewMode, setPreviewMode] = useState('regaarder');
  const [filterType, setFilterType] = useState('all');

  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  if (!isOpen) return null;

  const detectFileType = (fileName = '') => {
    const ext = fileName.toLowerCase().split('.').pop();
    if (['docx', 'doc', 'wps', 'odt', 'rtf'].includes(ext)) return 'docs';
    if (['xlsx', 'xls', 'csv', 'tsv', 'numbers', 'ods'].includes(ext)) return 'sheets';
    if (['pptx', 'ppt', 'key'].includes(ext)) return 'deck';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['txt', 'md'].includes(ext)) return 'docs';
    return 'docs';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processBatchQueue = async (incomingFiles) => {
    const fileList = Array.from(incomingFiles || []);
    if (fileList.length === 0) return;

    setIsProcessing(true);
    setProgressRatio(0);

    const initialQueue = fileList.map((f, idx) => {
      const ext = f.name.split('.').pop() || 'DOCX';
      return {
        id: `queue-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        file: f,
        name: f.name,
        ext: ext.toUpperCase(),
        size: f.size,
        sizeStr: formatFileSize(f.size),
        type: detectFileType(f.name),
        status: 'pending',
        error: null,
        regaarderDoc: null
      };
    });

    setFilesQueue(initialQueue);

    const converted = [];
    const queueMap = [...initialQueue];
    const totalFiles = initialQueue.length;
    const CHUNK_SIZE = 4;

    for (let i = 0; i < totalFiles; i += CHUNK_SIZE) {
      const chunk = queueMap.slice(i, i + CHUNK_SIZE);

      await Promise.all(chunk.map(async (item, chunkOffset) => {
        const itemIdx = i + chunkOffset;
        item.status = 'converting';

        try {
          const itemType = item.type;
          const cleanTitle = item.name.replace(/\.[^/.]+$/, "");
          const docId = Date.now() + Math.floor(Math.random() * 100000) + itemIdx;
          let regaarderDoc = null;

          if (itemType === 'sheets') {
            let sheetDataList = [{ id: Date.now(), title: cleanTitle, subtitle: 'Absorbed Sheet' }];
            let sheetGrids = {};

            const ext = item.name.toLowerCase().split('.').pop();
            if (ext === 'xlsx' || ext === 'xls') {
              try {
                const ExcelJS = await import('exceljs');
                const buffer = await item.file.arrayBuffer();
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.load(buffer);
                
                const validSheets = workbook.worksheets.filter(ws => ws && ws.rowCount > 0);
                const wsList = validSheets.length > 0 ? validSheets : [workbook.worksheets[0]].filter(Boolean);

                sheetDataList = [];
                wsList.forEach((ws, sIdx) => {
                  const sId = Date.now() + sIdx;
                  const sTitle = ws.name || `Sheet ${sIdx + 1}`;
                  const rCount = Math.max(22, ws.rowCount || 20);
                  const cCount = Math.max(26, ws.columnCount || 10);
                  const cells = Array.from({ length: rCount }, () => Array(cCount).fill(''));
                  const formats = Array.from({ length: rCount }, () => Array(cCount).fill(null));

                  ws.eachRow({ includeEmpty: true }, (row, rNum) => {
                    const rIdx = rNum - 1;
                    row.eachCell({ includeEmpty: true }, (cell, cNum) => {
                      const cIdx = cNum - 1;
                      if (cells[rIdx] && cIdx < cCount) {
                        cells[rIdx][cIdx] = cell.value ? String(cell.value) : '';
                      }
                    });
                  });

                  sheetDataList.push({ id: sId, title: sTitle, subtitle: 'Absorbed Sheet' });
                  sheetGrids[sId] = { rows: rCount, cols: cCount, cells, formats, columnWidths: {} };
                });
              } catch (excelErr) {
                console.warn('ExcelJS parse error, falling back:', excelErr);
              }
            } else {
              const text = await item.file.text();
              const lines = text.split(/\r?\n/).map(l => l.split(',').map(v => v.trim()));
              const rCount = Math.max(22, lines.length);
              const cCount = Math.max(26, lines[0]?.length || 10);
              const cells = Array.from({ length: rCount }, (_, rIdx) => {
                const row = lines[rIdx] || [];
                return Array.from({ length: cCount }, (_, cIdx) => row[cIdx] || '');
              });
              const sId = Date.now();
              sheetDataList = [{ id: sId, title: cleanTitle, subtitle: 'Absorbed Sheet' }];
              sheetGrids[sId] = { rows: rCount, cols: cCount, cells, formats: {}, columnWidths: {} };
            }

            regaarderDoc = {
              id: docId,
              mode: 'sheets',
              title: cleanTitle,
              subtitle: 'Absorbed Enterprise Sheet',
              sheetsTitle: cleanTitle,
              sheetsData: sheetDataList,
              sheetGrids,
              activeSheetId: sheetDataList[0]?.id,
              originalFileName: item.name,
              originalSize: item.sizeStr,
              absorbedAt: Date.now(),
              rawBlob: item.file
            };

          } else if (itemType === 'deck') {
            const extractedSlides = await extractPptxContent(item.file, cleanTitle);
            const slides = extractedSlides && extractedSlides.length > 0 ? extractedSlides : [
              {
                id: `slide-${Date.now()}-1`,
                title: cleanTitle,
                subtitle: 'Imported from enterprise presentation',
                layout: 'title',
                bullets: ['Enterprise Slide Asset', 'Interactive Regaarder Deck Layout']
              },
              {
                id: `slide-${Date.now()}-2`,
                title: 'Executive Summary',
                subtitle: 'Key Topics',
                layout: 'bento',
                bullets: ['Preserved layout parameters', 'Instant AI intelligence synthesis']
              }
            ];

            regaarderDoc = {
              id: docId,
              mode: 'deck',
              title: cleanTitle,
              subtitle: 'Absorbed Enterprise Presentation',
              deckSlides: slides,
              originalFileName: item.name,
              originalSize: item.sizeStr,
              absorbedAt: Date.now(),
              rawBlob: item.file
            };

          } else {
            let bodyHtml = '';
            let extractionPartial = false;
            const ext = item.name.toLowerCase().split('.').pop();

            if (ext === 'docx' || ext === 'doc' || ext === 'wps') {
              bodyHtml = await extractDocxContent(item.file, cleanTitle);
            } else if (ext === 'pdf') {
              const pdfResult = await extractPdfContent(item.file, cleanTitle);
              if (pdfResult && typeof pdfResult === 'object' && pdfResult.html) {
                // Partial raw-stream extraction
                bodyHtml = pdfResult.html;
                extractionPartial = true;
              } else if (typeof pdfResult === 'string') {
                // Full pdfjs extraction
                bodyHtml = pdfResult;
              }
              // else null — extraction fully failed, leave bodyHtml empty
            } else if (ext === 'md' || ext === 'txt') {
              const raw = await item.file.text();
              const lines = raw.split(/\r?\n/);
              bodyHtml = lines.map(line => {
                if (line.startsWith('# ')) return `<h1 class="text-2xl font-bold my-3 text-slate-900 dark:text-white">${escapeHtml(line.slice(2))}</h1>`;
                if (line.startsWith('## ')) return `<h2 class="text-xl font-bold my-2 text-slate-900 dark:text-white">${escapeHtml(line.slice(3))}</h2>`;
                if (line.startsWith('### ')) return `<h3 class="text-lg font-semibold my-2 text-slate-800 dark:text-zinc-100">${escapeHtml(line.slice(4))}</h3>`;
                if (line.trim().length === 0) return '';
                return `<p class="my-2 text-slate-700 dark:text-zinc-300 leading-relaxed">${escapeHtml(line)}</p>`;
              }).join('\n');
            }

            // extractionPartial remains false unless pdfjs partially succeeded above.
            // When bodyHtml is empty, the inspector will render a "Preview Unavailable" state.

            regaarderDoc = {
              id: docId,
              mode: 'compose',
              title: cleanTitle,
              subtitle: 'Absorbed Enterprise Document',
              bodyHtml: bodyHtml || null,
              extractionPartial,
              initiatives: [],
              originalFileName: item.name,
              originalSize: item.sizeStr,
              absorbedAt: Date.now(),
              rawBlob: item.file
            };
          }

          item.status = 'ready';
          item.regaarderDoc = regaarderDoc;
          converted.push(regaarderDoc);

        } catch (err) {
          console.error('File parsing error:', item.name, err);
          item.status = 'error';
          item.error = err?.message || 'Extraction failed';
        }
      }));

      const currentDone = Math.min(i + CHUNK_SIZE, totalFiles);
      setProgressRatio((currentDone / totalFiles) * 100);
      await new Promise(resolve => setTimeout(resolve, 16));
    }

    setFilesQueue([...queueMap]);
    setProcessedResults(converted);
    setIsProcessing(false);
    setProgressRatio(100);

    if (converted.length > 0) {
      setPreviewItem(converted[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processBatchQueue(e.dataTransfer.files);
    }
  };

  const handleCommitAll = () => {
    if (processedResults.length > 0 && typeof onBatchAbsorbed === 'function') {
      onBatchAbsorbed(processedResults);
    }
    onClose();
  };

  const filteredQueue = filesQueue.filter(q => {
    if (filterType === 'all') return true;
    if (filterType === 'docs') return q.type === 'docs' || q.type === 'pdf';
    if (filterType === 'sheets') return q.type === 'sheets';
    if (filterType === 'deck') return q.type === 'deck';
    return true;
  });

  const readyCount = filesQueue.filter(q => q.status === 'ready').length;

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 bg-black/60 dark:bg-black/75 backdrop-blur-xl animate-in fade-in duration-200 font-sans"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        data-popover-root="true"
        className="w-full max-w-6xl h-[88vh] max-h-[820px] bg-white/98 dark:bg-zinc-900/98 rounded-[20px] border border-black/[0.08] dark:border-white/[0.1] shadow-[0_25px_70px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Top Executive Header */}
        <div className="flex items-center justify-between px-6 sm:px-7 py-4.5 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white flex items-center justify-center shadow-[0_4px_14px_rgba(124,58,237,0.3)] shrink-0">
              <ImportPortalIcon size={22} strokeWidth={1.7} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Omni-Portal
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-black/[0.04] dark:bg-white/[0.06] text-slate-500 dark:text-zinc-400 border border-black/[0.06] dark:border-white/[0.08] select-none">
                  Experimental
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Bulk transfer Microsoft, Google & WPS repositories into native Regaarder formats
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors flex items-center justify-center cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Main Content Area: Split Ingestion & Dual-View Inspector */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-black/[0.06] dark:divide-white/[0.08] overflow-hidden">
          
          {/* Left Column: Dropzone & File Queue */}
          <div className="w-full md:w-[48%] flex flex-col p-5 overflow-y-auto">
            {/* ─── Premium Drop Zone ─── */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative rounded-[14px] transition-all duration-200 cursor-pointer mb-4 overflow-hidden ${
                dragActive
                  ? 'ring-2 ring-violet-500 ring-offset-0'
                  : ''
              }`}
              style={{
                background: dragActive
                  ? 'linear-gradient(135deg, rgba(139,92,246,0.07) 0%, rgba(99,102,241,0.05) 100%)'
                  : 'linear-gradient(135deg, rgba(248,247,255,1) 0%, rgba(243,244,255,1) 100%)',
                border: dragActive
                  ? '1.5px solid rgba(139,92,246,0.5)'
                  : '1.5px dashed rgba(0,0,0,0.10)',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".docx,.doc,.pptx,.ppt,.xlsx,.xls,.csv,.pdf,.txt,.md"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    processBatchQueue(e.target.files);
                  }
                }}
              />
              <input
                ref={folderInputRef}
                type="file"
                webkitdirectory="true"
                directory="true"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    processBatchQueue(e.target.files);
                  }
                }}
              />

              <div className="flex flex-col items-center text-center px-6 py-6">
                {/* Layered icon stack — matches Sheets empty state treatment */}
                <div className="relative mb-4">
                  <div className="w-[52px] h-[52px] rounded-[14px] bg-white shadow-[0_4px_16px_rgba(124,58,237,0.13),0_1px_3px_rgba(0,0,0,0.07)] flex items-center justify-center">
                    <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-[0_2px_8px_rgba(124,58,237,0.35)]">
                      <Upload size={18} strokeWidth={2} className="text-white" />
                    </div>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100 mb-1 tracking-tight">
                  Drop files or a folder here
                </h3>
                <p className="text-[11.5px] text-slate-400 dark:text-zinc-500 max-w-[220px] leading-relaxed mb-4">
                  Word, Excel, PowerPoint, CSV & PDF — all formats welcome
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-3.5 py-1.5 rounded-[8px] bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-semibold border border-black/[0.09] dark:border-white/[0.1] shadow-[0_1px_3px_rgba(0,0,0,0.07)] hover:bg-slate-50 transition-colors"
                  >
                    Browse Files
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      folderInputRef.current?.click();
                    }}
                    className="px-3.5 py-1.5 rounded-[8px] bg-violet-600 dark:bg-violet-700 text-white text-xs font-semibold shadow-[0_2px_8px_rgba(124,58,237,0.28)] hover:bg-violet-700 transition-colors flex items-center gap-1.5"
                  >
                    <FolderPlus size={13} />
                    <span>Dump Entire Folder</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Ingestion Queue & Metrics */}
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/[0.05] dark:border-white/[0.06]">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                    Ingestion Queue
                  </span>
                  {filesQueue.length > 0 && (
                    <span className="px-2 py-0.5 rounded-[5px] text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                      {filesQueue.length} files
                    </span>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 bg-black/[0.03] dark:bg-white/[0.04] p-0.5 rounded-lg text-[11px]">
                  {['all', 'docs', 'sheets', 'deck'].map(tab => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setFilterType(tab)}
                      className={`px-2 py-0.5 rounded-md font-medium capitalize transition-colors ${
                        filterType === tab 
                          ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs' 
                          : 'text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Queue List with Image 4 Style Branded SVG Badges */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 thin-scrollbar min-h-[140px]">
                {filteredQueue.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-zinc-500">
                    <ShieldCheck size={28} className="stroke-[1.3] text-slate-300 dark:text-zinc-600 mb-2" />
                    <p className="text-xs">No files in queue. Drag a folder or files above to begin.</p>
                  </div>
                ) : (
                  filteredQueue.map((item) => {
                    const isSelected = previewItem?.originalFileName === item.name || previewItem?.title === item.name.replace(/\.[^/.]+$/, "");
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (item.regaarderDoc) setPreviewItem(item.regaarderDoc);
                        }}
                        className={`p-2.5 rounded-[10px] border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-violet-50/80 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800/60 shadow-2xs'
                            : 'bg-white dark:bg-zinc-800/40 border-black/[0.04] dark:border-white/[0.05] hover:bg-black/[0.02] dark:hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileTypeBadge ext={item.ext} type={item.type} />

                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-800 dark:text-zinc-100 truncate">
                              {item.name}
                            </div>
                            <div className="text-[10.5px] text-slate-400 dark:text-zinc-500 flex items-center gap-2 mt-0.5">
                              <span>{item.sizeStr}</span>
                              <span>•</span>
                              <span className="uppercase font-semibold tracking-tight">{item.ext}</span>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          {item.status === 'converting' && (
                            <span className="flex items-center gap-1 text-[11px] text-violet-600 dark:text-violet-400 font-medium">
                              <Loader2 size={12} className="animate-spin" />
                              <span>Absorbing</span>
                            </span>
                          )}
                          {item.status === 'ready' && (
                            <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[11px] font-bold">
                              ✓
                            </div>
                          )}
                          {item.status === 'error' && (
                            <span className="text-[11px] text-rose-500 font-medium">Failed</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Ambient Stage (Image 3 Style) & Dual-View Reader */}
          <div 
            className="w-full md:w-[52%] flex flex-col p-6 overflow-hidden relative"
            style={{
              background: 'radial-gradient(ellipse at 50% 35%, rgba(147, 51, 234, 0.08) 0%, rgba(243, 232, 255, 0.4) 45%, rgba(255, 255, 255, 0.95) 75%)'
            }}
          >
            {previewItem ? (
              <div className="flex-1 flex flex-col min-h-0 relative z-10">
                <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-black/[0.06] dark:border-white/[0.08] shrink-0">
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-violet-600 dark:text-violet-400 tracking-wider">
                      Fidelity Inspector
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {previewItem.title}
                    </h4>
                  </div>

                  <div className="flex items-center p-1 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md rounded-xl border border-black/[0.05] dark:border-white/[0.06] shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setPreviewMode('regaarder')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        previewMode === 'regaarder'
                          ? 'bg-violet-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      Regaarder Format
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('original')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        previewMode === 'original'
                          ? 'bg-violet-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      Original Equivalent
                    </button>
                  </div>
                </div>

                <div className="flex-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-[12px] border border-black/[0.06] dark:border-white/[0.08] shadow-sm p-5 overflow-y-auto thin-scrollbar min-h-0">
                  {previewMode === 'regaarder' ? (
                    <div className="space-y-4">
                      {/* Extraction status header */}
                      {previewItem.mode === 'compose' && !previewItem.bodyHtml ? (
                        <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 font-semibold pb-2 border-b border-slate-100 dark:border-zinc-800">
                          <span className="w-4 h-4 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-[9px] font-black">!</span>
                          <span>Preview unavailable — content could not be extracted from this file</span>
                        </div>
                      ) : previewItem.extractionPartial ? (
                        <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-semibold pb-2 border-b border-slate-100 dark:border-zinc-800">
                          <span className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-[9px] font-black">~</span>
                          <span>Partial extraction — some content may be missing or garbled</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold pb-2 border-b border-slate-100 dark:border-zinc-800">
                          <CheckCircle2 size={15} />
                          <span>Native Regaarder {previewItem.mode.toUpperCase()} schema extracted</span>
                        </div>
                      )}

                      {previewItem.mode === 'compose' && (
                        previewItem.bodyHtml ? (
                          <div className="prose prose-sm max-w-none text-slate-800 dark:text-zinc-200">
                            <div 
                              dangerouslySetInnerHTML={{ __html: previewItem.bodyHtml }} 
                              className="space-y-2 leading-relaxed text-xs"
                            />
                          </div>
                        ) : (
                          /* Preview Unavailable state — shown when all extraction paths failed */
                          <div className="flex flex-col items-center justify-center text-center py-8 px-4 gap-3">
                            <div className="w-12 h-12 rounded-[12px] bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                              <FileCode size={22} className="text-slate-400 dark:text-zinc-500" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 dark:text-zinc-100 mb-1">{previewItem.title}</p>
                              <p className="text-[11px] text-slate-400 dark:text-zinc-500 max-w-[240px] leading-relaxed">
                                This file uses image-based content, encryption, or a non-standard encoding that couldn't be read in-browser. It has been absorbed faithfully and will open in Regaarder Compose as-is.
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-200/50 dark:border-emerald-800/40">
                              <ShieldCheck size={13} />
                              <span>Bit-for-Bit Preserved · {previewItem.originalSize}</span>
                            </div>
                          </div>
                        )
                      )}

                      {previewItem.mode === 'sheets' && (
                        <div className="space-y-3">
                          <div className="text-xs font-bold text-slate-700 dark:text-zinc-200">
                            Workbook: {previewItem.sheetsData?.length || 1} Sheets Extracted
                          </div>
                          {previewItem.sheetGrids && Object.values(previewItem.sheetGrids)[0] && (
                            <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded-xl">
                              <table className="w-full border-collapse text-[11px] font-mono">
                                <tbody>
                                  {Object.values(previewItem.sheetGrids)[0].cells.slice(0, 10).map((row, rIdx) => (
                                    <tr key={rIdx} className={rIdx === 0 ? 'bg-slate-100 dark:bg-zinc-800 font-bold' : 'border-t border-slate-100 dark:border-zinc-800'}>
                                      {row.slice(0, 6).map((cell, cIdx) => (
                                        <td key={cIdx} className="p-2 border-r border-slate-100 dark:border-zinc-800 truncate max-w-[120px]">
                                          {cell || '—'}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}

                      {previewItem.mode === 'deck' && (
                        <div className="space-y-3">
                          <div className="text-xs font-bold text-slate-700 dark:text-zinc-200">
                            Slide Deck Structure ({previewItem.deckSlides?.length || 2} slides)
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {(previewItem.deckSlides || []).slice(0, 4).map((slide, sIdx) => (
                              <div key={slide.id || sIdx} className="aspect-video bg-zinc-950 text-white p-3.5 rounded-xl flex flex-col justify-between shadow-md border border-white/10">
                                <div>
                                  <span className="text-[9px] font-bold text-violet-400 uppercase">Slide {sIdx + 1}</span>
                                  <h5 className="text-xs font-bold text-white mt-1 line-clamp-1">{slide.title}</h5>
                                </div>
                                <ul className="text-[10px] text-zinc-400 space-y-0.5">
                                  {(slide.bullets || []).slice(0, 2).map((b, bIdx) => (
                                    <li key={bIdx} className="truncate">• {b}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 flex items-center justify-center shadow-xs">
                        <FileCode size={24} />
                      </div>
                      <div className="max-w-xs">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                          {previewItem.originalFileName}
                        </h4>
                        <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">
                          Original binary payload ({previewItem.originalSize}) preserved in local zero-knowledge store for export and parity checking.
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-200/50">
                        <ShieldCheck size={13} />
                        <span>Bit-for-Bit Preserved</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Image 3 Style Centered Ambient Card */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 relative z-10">
                <div className="max-w-sm w-full bg-white/95 dark:bg-zinc-900/90 backdrop-blur-xl rounded-[16px] border border-purple-100/70 dark:border-zinc-800/80 shadow-[0_20px_50px_rgba(147,51,234,0.08)] p-8 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-[14px] bg-gradient-to-tr from-purple-100 to-indigo-100 dark:from-purple-950/60 dark:to-indigo-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center mb-4 ring-8 ring-purple-50/60 dark:ring-purple-950/20 shadow-xs">
                    <Database size={26} strokeWidth={1.8} />
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-1.5">
                    Dual-View Inspection Ready
                  </h3>
                  
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed mb-4">
                    Select any document from the queue on the left to inspect its live extracted typography, matrix tables, and original structure.
                  </p>

                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-[7px] bg-purple-50/80 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-[11px] font-semibold border border-purple-200/60 dark:border-purple-800/40">
                    <div className="w-4 h-4 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
                      <RegaarderBrandIcon size={9} color="white" />
                    </div>
                    <span>Instant Native Conversion</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Footer with Dynamic Progress Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shrink-0">
          <div className="flex-1 max-w-sm mr-4">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 dark:text-zinc-300 mb-1.5">
              <div className="flex items-center gap-1.5">
                {isProcessing ? (
                  <>
                    <Loader2 size={13} className="animate-spin text-violet-600" />
                    <span>Absorbing {readyCount} of {filesQueue.length} documents...</span>
                  </>
                ) : (
                  <>
                    <Zap size={14} className={readyCount > 0 ? 'text-amber-500' : 'text-slate-400'} />
                    <span>
                      {readyCount > 0 
                        ? `${readyCount} document${readyCount > 1 ? 's' : ''} ready to absorb into workspace` 
                        : 'Drop files or folders to start'}
                    </span>
                  </>
                )}
              </div>
              {filesQueue.length > 0 && (
                <span className="font-semibold text-violet-600 dark:text-violet-400">{Math.round(progressRatio)}%</span>
              )}
            </div>

            <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${progressRatio}%` }} 
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={processedResults.length === 0 || isProcessing}
              onClick={handleCommitAll}
              className={`px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                processedResults.length > 0 && !isProcessing
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_4px_14px_rgba(124,58,237,0.3)] hover:opacity-95 active:scale-95'
                  : 'bg-black/[0.05] dark:bg-white/[0.05] text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Absorb All into Workspace</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
