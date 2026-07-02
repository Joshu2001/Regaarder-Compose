const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Capture console messages
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  console.log("Navigating to 127.0.0.1:5173...");
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle2' });
  
  console.log("Waiting for Room button...");
  await new Promise(r => setTimeout(r, 2000));
  
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.toLowerCase().includes('room')) {
      console.log(`Clicking button: ${text}`);
      await btn.click();
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  
  const startBtns = await page.$$('button');
  for (const btn of startBtns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.toLowerCase().includes('start meeting')) {
      console.log(`Clicking Start Meeting: ${text}`);
      await btn.click();
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  
  console.log("Checking for errors after 2 seconds...");
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
