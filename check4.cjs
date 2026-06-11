const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  
  try {
    const btn = await page.waitForSelector('text/Compose');
    if (btn) {
      await btn.click();
      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: 'c:\\Users\\user\\Downloads\\Project MOAT\\Regaarder Compose\\compose.png' });
      console.log('Saved compose.png');
    }
  } catch (e) {
    console.log('Click failed', e.message);
  }

  await browser.close();
})();
