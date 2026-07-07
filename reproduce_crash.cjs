const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: "new"
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err));

  await page.goto('http://localhost:5174/');
  
  // Wait for the app to load
  await new Promise(r => setTimeout(r, 5000));
  
  // Click Sheet button
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const sheetBtn = buttons.find(b => b.textContent.includes('Sheet'));
    if (sheetBtn) sheetBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Click grid cell to focus
  await page.evaluate(() => {
    const cells = Array.from(document.querySelectorAll('input')).filter(i => i.style.position === 'absolute' || i.className.includes('cursor-cell'));
    console.log('Cells found:', cells.length);
    if (cells.length > 0) cells[0].click();
  });
  
  // Type /
  await page.keyboard.press('/');
  await new Promise(r => setTimeout(r, 1000));
  
  // Click Insert Shape
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, div'));
    const insertShape = buttons.find(b => b.textContent && b.textContent.includes('Insert Shape'));
    if (insertShape) insertShape.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Click first shape (which is a line or rectangle)
  await page.evaluate(() => {
    const shapes = document.querySelectorAll('.w-8.h-8');
    if (shapes.length > 0) shapes[0].click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Click the shape overlay
  console.log("Clicking shape...");
  await page.evaluate(() => {
    const overlay = document.querySelector('div.absolute.z-\\[100\\][style*="cursor: move"]');
    if (overlay) {
      overlay.click();
    } else {
      console.log("Overlay not found!");
    }
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  console.log("Test finished");
  await browser.close();
})();
