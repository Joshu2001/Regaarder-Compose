import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const svgContent = `<svg width="256" height="256" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="notesBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F59E0B" />
      <stop offset="100%" stopColor="#D97706" />
    </linearGradient>
    <linearGradient id="notesSpineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#B45309" />
      <stop offset="100%" stopColor="#78350F" />
    </linearGradient>
    <linearGradient id="notesWireGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FFFFFF" />
      <stop offset="100%" stopColor="#FDE68A" />
    </linearGradient>
  </defs>

  <!-- Ground shadow -->
  <rect x="3.5" y="3" width="18" height="19" rx="4.5" fill="#0F172A" opacity="0.16" />

  <!-- Main Notebook Cover -->
  <rect x="3" y="1.5" width="19" height="20.5" rx="4.5" fill="url(#notesBodyGrad)" />

  <!-- Darker spine foundation strip -->
  <path d="M3 6C3 3.5 4.5 1.5 7.5 1.5V22C4.5 22 3 20 3 17.5V6Z" fill="url(#notesSpineGrad)" />

  <!-- Inset Writing Card -->
  <rect x="8.5" y="3.5" width="12" height="16.5" rx="2.5" fill="#FFFFFF" />

  <!-- Margin Guide Line -->
  <line x1="11.5" y1="3.5" x2="11.5" y2="20" stroke="#FDE68A" stroke-width="0.8" />

  <!-- Ruled content lines -->
  <line x1="13" y1="7" x2="18.5" y2="7" stroke="#D97706" stroke-width="1.2" stroke-linecap="round" opacity="0.65" />
  <line x1="13" y1="10.5" x2="18.5" y2="10.5" stroke="#D97706" stroke-width="1.2" stroke-linecap="round" opacity="0.65" />
  <line x1="13" y1="14" x2="17" y2="14" stroke="#D97706" stroke-width="1.2" stroke-linecap="round" opacity="0.65" />
  <line x1="13" y1="17.2" x2="16" y2="17.2" stroke="#D97706" stroke-width="1.2" stroke-linecap="round" opacity="0.4" />

  <!-- Distinct Exposed Metal Spiral Loops -->
  <g>
    <rect x="1.5" y="3.8" width="4.2" height="2.4" rx="1.2" fill="url(#notesWireGrad)" />
    <rect x="2" y="4.3" width="3" height="1.4" rx="0.7" fill="#78350F" opacity="0.6" />
  </g>
  <g>
    <rect x="1.5" y="7.8" width="4.2" height="2.4" rx="1.2" fill="url(#notesWireGrad)" />
    <rect x="2" y="8.3" width="3" height="1.4" rx="0.7" fill="#78350F" opacity="0.6" />
  </g>
  <g>
    <rect x="1.5" y="11.8" width="4.2" height="2.4" rx="1.2" fill="url(#notesWireGrad)" />
    <rect x="2" y="12.3" width="3" height="1.4" rx="0.7" fill="#78350F" opacity="0.6" />
  </g>
  <g>
    <rect x="1.5" y="15.8" width="4.2" height="2.4" rx="1.2" fill="url(#notesWireGrad)" />
    <rect x="2" y="16.3" width="3" height="1.4" rx="0.7" fill="#78350F" opacity="0.6" />
  </g>

  <!-- Top ambient highlight line -->
  <path d="M7.5 2.2H18C19.5 2.2 20.8 3.2 21 4.6C20.6 3.5 19.4 2.7 18 2.7H7.5V2.2Z" fill="#FFFFFF" opacity="0.4" />
</svg>`;

async function generate() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 256, height: 256, deviceScaleFactor: 1 });
  
  const html = `<!DOCTYPE html>
  <html>
    <head>
      <style>
        body { margin: 0; padding: 0; background: transparent; overflow: hidden; display: flex; align-items: center; justify-content: center; }
        svg { width: 256px; height: 256px; }
      </style>
    </head>
    <body>
      ${svgContent}
    </body>
  </html>`;

  await page.setContent(html);

  const sizes = [16, 32, 48, 64, 128, 256];
  const pngBuffers = [];

  for (const size of sizes) {
    await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
    await page.evaluate((s) => {
      document.querySelector('svg').style.width = s + 'px';
      document.querySelector('svg').style.height = s + 'px';
    }, size);
    const buf = await page.screenshot({ type: 'png', omitBackground: true });
    pngBuffers.push({ size, buf });
  }

  await browser.close();

  // Save 256px PNG
  const png256 = pngBuffers.find(p => p.size === 256).buf;
  fs.writeFileSync(path.join(rootDir, 'build', 'note.png'), png256);

  // Construct standard multi-resolution ICO file from PNG buffers
  const numImages = pngBuffers.length;
  const headerLen = 6;
  const dirEntryLen = 16;
  let offset = headerLen + (dirEntryLen * numImages);

  const header = Buffer.alloc(headerLen);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO type
  header.writeUInt16LE(numImages, 4);

  const entries = [];
  const imageBuffers = [];

  for (const item of pngBuffers) {
    const entry = Buffer.alloc(dirEntryLen);
    const w = item.size >= 256 ? 0 : item.size;
    const h = item.size >= 256 ? 0 : item.size;
    entry.writeUInt8(w, 0); // width
    entry.writeUInt8(h, 1); // height
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(item.buf.length, 8); // size of image data
    entry.writeUInt32LE(offset, 12); // offset of image data

    entries.push(entry);
    imageBuffers.push(item.buf);
    offset += item.buf.length;
  }

  const icoBuffer = Buffer.concat([header, ...entries, ...imageBuffers]);

  // Write to build/, electron/icons/, and AppData
  const buildIcoPath = path.join(rootDir, 'build', 'note.ico');
  const electronIcoPath = path.join(rootDir, 'electron', 'icons', 'note.ico');
  fs.writeFileSync(buildIcoPath, icoBuffer);
  fs.writeFileSync(electronIcoPath, icoBuffer);

  const appDataIcons = path.join(process.env.APPDATA || '', 'regaarder-compose', 'icons');
  if (fs.existsSync(appDataIcons)) {
    fs.writeFileSync(path.join(appDataIcons, 'note.ico'), icoBuffer);
  }

  console.log('[SUCCESS] Generated distinct Amber Spiral Notebook note.ico & note.png!');
}

generate().catch(console.error);
