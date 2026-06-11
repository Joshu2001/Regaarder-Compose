const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  
  try {
    const deckBtn = await page.waitForSelector('text/Sheet');
    if (deckBtn) {
      await deckBtn.click();
      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\sheets.png' });
      console.log('Saved sheets.png');
    }
    
  } catch (e) {
    console.log('Click failed', e.message);
  }

  await browser.close();
})();
