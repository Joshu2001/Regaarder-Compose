const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto("http://localhost:5173", { waitUntil: "networkidle0" });
  
  // Click on DMs using page.evaluate
  await page.evaluate(() => {
    const spans = Array.from(document.querySelectorAll('span'));
    const dmSpan = spans.find(s => s.textContent === 'DMs');
    if (dmSpan) {
      dmSpan.click();
    }
  });
  
  await page.waitForTimeout(2000);
  
  const content = await page.content();
  console.log("BODY HTML LENGTH:", content.length);
  
  await browser.close();
})();
