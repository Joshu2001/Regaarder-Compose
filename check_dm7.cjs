const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  try {
    await page.goto("http://localhost:5173", { waitUntil: "networkidle0", timeout: 30000 });
    
    // Click on DMs using page.evaluate
    await page.evaluate(() => {
      const spans = Array.from(document.querySelectorAll('span'));
      const dmSpan = spans.find(s => s.textContent === 'DMs');
      if (dmSpan) {
        dmSpan.click();
      }
    });
    
    // Use setTimeout instead of waitForTimeout
    await new Promise(r => setTimeout(r, 2000));
    
    const content = await page.evaluate(() => document.getElementById('root').innerHTML);
    if (!content || content.trim() === '') {
      console.log('CRASH: root is empty');
      await page.screenshot({ path: "crash.png" });
    } else {
      console.log('SUCCESS: root has content length', content.length);
    }
  } catch (err) {
    console.error("Puppeteer Error:", err);
  } finally {
    await browser.close();
  }
})();
