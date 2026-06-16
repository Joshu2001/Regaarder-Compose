const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle2' });
  } catch (e) {
    await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle2' });
  }
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Find compose-editor-surface
  const surface = await page.$('.compose-editor-surface');
  if (surface) {
    const html = await page.evaluate(el => el.outerHTML, surface);
    console.log("SURFACE HTML LENGTH:", html.length);
    console.log("FIRST 1000 CHARS:");
    console.log(html.substring(0, 1000));
    console.log("...");
  } else {
    console.log("No .compose-editor-surface found!");
    // Dump body html
    const html = await page.evaluate(() => document.body.innerHTML);
    console.log("BODY HTML:", html.substring(0, 500));
  }
  
  await browser.close();
})();
