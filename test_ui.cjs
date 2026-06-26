const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

(async () => {
  let browser;
  try {
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    browser = await puppeteer.launch({
      executablePath: fs.existsSync(edgePath) ? edgePath : 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: 'new',
      defaultViewport: { width: 1280, height: 800 }
    });
    const page = await browser.newPage();
    await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0' });

    // Wait for compose media btn
    await page.waitForSelector('#compose-media-btn', { timeout: 10000 });
    
    // Click it
    console.log("Clicking compose-media-btn...");
    await page.click('#compose-media-btn');
    
    // Wait a moment for animation
    await new Promise(r => setTimeout(r, 1000));
    
    // Take screenshot
    const screenshotPath = 'C:\\Users\\user\\.gemini\\antigravity\\brain\\fbba473f-cfa7-45ce-be61-3c00081003db\\artifacts\\media_click.png';
    // Ensure dir exists
    fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
    await page.screenshot({ path: screenshotPath });
    
    console.log("Screenshot saved to " + screenshotPath);
    
    // Also log the HTML of the MediaPicker to see if it's there
    const html = await page.evaluate(() => {
      const el = document.querySelector('.z-\\[99999\\]');
      return el ? el.outerHTML : 'No z-[99999] element found';
    });
    console.log("Dropdown HTML:", html);
    
  } catch (e) {
    console.error(e);
  } finally {
    if (browser) await browser.close();
  }
})();
