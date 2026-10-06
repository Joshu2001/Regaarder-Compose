import * as pdfjs from 'pdfjs-dist';

/**
 * Escapes HTML characters to prevent XSS and malformed tags
 */
function escapeHtml(text = '') {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Converts a PDF.js image object (Uint8ClampedArray/Uint8Array) into a PNG data URL via canvas
 */
function pdfImageToDataUrl(imageObj) {
  if (!imageObj || !imageObj.width || !imageObj.height) return null;
  const { width, height, data } = imageObj;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  try {
    let imgData;
    if (imageObj.kind === 2) {
      // Gray scale
      imgData = ctx.createImageData(width, height);
      let srcIdx = 0;
      let dstIdx = 0;
      for (let i = 0; i < width * height; i++) {
        const val = data[srcIdx++];
        imgData.data[dstIdx++] = val;
        imgData.data[dstIdx++] = val;
        imgData.data[dstIdx++] = val;
        imgData.data[dstIdx++] = 255;
      }
    } else if (imageObj.kind === 3 || data.length === width * height * 3) {
      // RGB
      imgData = ctx.createImageData(width, height);
      let srcIdx = 0;
      let dstIdx = 0;
      for (let i = 0; i < width * height; i++) {
        imgData.data[dstIdx++] = data[srcIdx++];
        imgData.data[dstIdx++] = data[srcIdx++];
        imgData.data[dstIdx++] = data[srcIdx++];
        imgData.data[dstIdx++] = 255;
      }
    } else if (data.length === width * height * 4) {
      // RGBA
      imgData = new ImageData(new Uint8ClampedArray(data.buffer, data.byteOffset, data.length), width, height);
    } else {
      // Fallback: draw directly if imageObj has bitmap or standard format
      imgData = ctx.createImageData(width, height);
      const limit = Math.min(data.length, imgData.data.length);
      for (let i = 0; i < limit; i++) {
        imgData.data[i] = data[i];
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL('image/png');
  } catch (err) {
    console.warn('[pdfToHtmlConverter] Failed converting imageObj to DataURL:', err);
    return null;
  }
}

/**
 * Extracts all content (text, embedded images, and graphical canvas regions)
 * from a PDF ArrayBuffer or Uint8Array and synthesizes an editable HTML structure.
 * 
 * @param {ArrayBuffer|Uint8Array} pdfData 
 * @param {Object} options
 * @returns {Promise<string>}
 */
export async function convertPdfToEditableHtml(pdfData, options = {}) {
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(pdfData) });
  const pdf = await loadingTask.promise;
  const htmlParts = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });
    const pageItems = [];

    // 1. Extract text items with layout coordinates (Y descending from top)
    try {
      const textContent = await page.getTextContent();
      let currentLine = '';
      let lineY = null;

      for (const item of textContent.items) {
        if (!item.str) continue;
        const tx = item.transform; // [scaleX, skewY, skewX, scaleY, tx, ty]
        const yCoord = tx ? (viewport.height - tx[5]) : 0; // normalize top-to-bottom

        if (lineY !== null && Math.abs(yCoord - lineY) > 8) {
          if (currentLine.trim()) {
            pageItems.push({
              type: 'text',
              y: lineY,
              text: currentLine.trim()
            });
          }
          currentLine = item.str;
          lineY = yCoord;
        } else {
          currentLine += (currentLine ? ' ' : '') + item.str;
          if (lineY === null) lineY = yCoord;
        }
      }

      if (currentLine.trim()) {
        pageItems.push({
          type: 'text',
          y: lineY ?? 0,
          text: currentLine.trim()
        });
      }
    } catch (textErr) {
      console.warn(`[pdfToHtmlConverter] Error extracting text from page ${pageNum}:`, textErr);
    }

    // 2. Extract embedded images via operator list (paintImageXObject, paintJpegXObject, paintInlineImageXObject)
    let extractedImageCount = 0;
    let hasVisualImageOperations = false;
    try {
      const operatorList = await page.getOperatorList();
      const fnArray = operatorList.fnArray;
      const argsArray = operatorList.argsArray;

      // Recognized PDF.js operator IDs for image painting
      const imgOps = new Set([
        pdfjs.OPS?.paintImageXObject,
        pdfjs.OPS?.paintJpegXObject,
        pdfjs.OPS?.paintInlineImageXObject,
        pdfjs.OPS?.paintImageMaskXObject,
        82, 85, 86, 83
      ].filter(Boolean));

      for (let i = 0; i < fnArray.length; i++) {
        const fn = fnArray[i];
        if (imgOps.has(fn)) {
          hasVisualImageOperations = true;
          const imgArg = argsArray[i]?.[0];
          
          try {
            let imgObj = null;
            if (typeof imgArg === 'string') {
              // Retrieve image using promise-based callback resolution for PDFObjects
              const fetchObj = (objs) => new Promise((resolve) => {
                if (!objs) return resolve(null);
                try {
                  if (typeof objs.get === 'function') {
                    objs.get(imgArg, (data) => resolve(data));
                    // If get returns immediately synchronously or doesn't invoke callback
                    setTimeout(() => resolve(null), 80);
                  } else {
                    resolve(null);
                  }
                } catch {
                  resolve(null);
                }
              });

              imgObj = await fetchObj(page.objs);
              if (!imgObj) {
                imgObj = await fetchObj(page.commonObjs);
              }
            } else if (imgArg && typeof imgArg === 'object') {
              imgObj = imgArg;
            }

            if (imgObj) {
              const dataUrl = pdfImageToDataUrl(imgObj);
              if (dataUrl) {
                const approxY = (i / Math.max(1, fnArray.length)) * viewport.height;
                pageItems.push({
                  type: 'image',
                  y: approxY,
                  dataUrl,
                  width: imgObj.width || 600,
                  height: imgObj.height || 400
                });
                extractedImageCount++;
              }
            }
          } catch (objErr) {
            console.warn(`[pdfToHtmlConverter] Failed reading image object ${imgArg}:`, objErr);
          }
        }
      }
    } catch (opErr) {
      console.warn(`[pdfToHtmlConverter] Operator list extraction error on page ${pageNum}:`, opErr);
    }

    // 3. Fallback / High-Fidelity Snapshot:
    // If the page contains image operations that were vector-composited/clipped without standalone extraction,
    // OR if extractedImageCount === 0 and the page has sparse text (e.g. screenshot page or slide deck),
    // render the page canvas so user screenshots and graphics are 100% captured without loss.
    const textItemsCount = pageItems.filter(item => item.type === 'text').length;
    if (extractedImageCount === 0 && (hasVisualImageOperations || textItemsCount < 4)) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: ctx, viewport }).promise;
          const pageSnapshotUrl = canvas.toDataURL('image/png');
          pageItems.push({
            type: 'image',
            y: 0,
            dataUrl: pageSnapshotUrl,
            width: viewport.width,
            height: viewport.height,
            isPageGraphic: true
          });
        }
      } catch (canvasErr) {
        console.warn(`[pdfToHtmlConverter] Canvas snapshot error on page ${pageNum}:`, canvasErr);
      }
    }

    // Sort page items by Y coordinate so images and text flow in natural reading order
    pageItems.sort((a, b) => a.y - b.y);

    // Format into executive Apple-tier semantic HTML
    for (let idx = 0; idx < pageItems.length; idx++) {
      const item = pageItems[idx];
      if (item.type === 'image') {
        const style = item.width && item.width < 400
          ? 'max-w-xs mx-auto my-6 rounded-xl border border-slate-200/80 shadow-sm block'
          : 'max-w-full mx-auto my-6 rounded-xl border border-slate-200/80 shadow-sm block';

        htmlParts.push(
          `<figure class="my-6 text-center">` +
            `<img src="${item.dataUrl}" alt="Extracted Document Graphic" class="${style}" style="max-height: 540px; object-fit: contain;" />` +
          `</figure>`
        );
      } else if (item.type === 'text') {
        const p = item.text;
        const isH1 = htmlParts.length === 0 && p.length < 90;
        const isH2 = p.length < 75 && !p.endsWith('.') && (p.startsWith('#') || p === p.toUpperCase() || /^[A-Z0-9\s\-:]{3,60}$/.test(p));
        const cleanP = p.replace(/^#+\s*/, '').trim();

        if (isH1) {
          htmlParts.push(`<h1 class="text-2xl font-bold my-4 text-slate-900 dark:text-white">${escapeHtml(cleanP)}</h1>`);
        } else if (isH2) {
          htmlParts.push(`<h2 class="text-xl font-bold my-3 text-slate-900 dark:text-white">${escapeHtml(cleanP)}</h2>`);
        } else {
          htmlParts.push(`<p class="my-2 text-slate-800 dark:text-zinc-200 leading-relaxed">${escapeHtml(cleanP)}</p>`);
        }
      }
    }
  }

  return htmlParts.join('\n');
}
