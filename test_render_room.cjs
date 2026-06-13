const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  
  try {
    const buttons = await page.$$('button');
    let startRoomBtn = null;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Start room')) {
        startRoomBtn = btn;
        break;
      }
    }
    
    if (startRoomBtn) {
      console.log('Found Start Room button. Clicking...');
      await startRoomBtn.click();
      await new Promise(r => setTimeout(r, 2000));
      console.log('Done waiting after click.');
    } else {
      console.log('Start room button not found.');
    }
  } catch(e) {
    console.error('Error during test:', e);
  }
  
  await browser.close();
})();
