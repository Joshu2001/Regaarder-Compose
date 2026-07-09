import puppeteer from 'puppeteer';

(async () => {
  console.log("Starting puppeteer...");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
  
  console.log("Navigating to http://localhost:5173...");
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 10000 }).catch(e => console.log("Goto error:", e));
  
  console.log("Waiting 2s...");
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
  console.log("Done.");
})();
