const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  
  try {
    const btn = await page.waitForSelector('text/Sheet');
    if (btn) {
      await btn.click();
      await new Promise(r => setTimeout(r, 2000));
      const bodyHTML = await page.evaluate(() => document.body.innerHTML);
      console.log('BODY HTML LENGTH:', bodyHTML.length);
      if (bodyHTML.length < 500) {
        console.log('BODY HTML:', bodyHTML);
      }
    }
  } catch (e) {
    console.log('Click failed', e.message);
  }

  await browser.close();
})();
