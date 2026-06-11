const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto("http://localhost:5173", { waitUntil: "networkidle0" });
  
  // Click on DMs in the mini sidebar
  const dmIcon = await page.$('span:contains("DMs")');
  if (dmIcon) {
    await dmIcon.click();
    await page.waitForTimeout(2000);
  } else {
    // try to find the div wrapping it
    const elements = await page.$$('span');
    for (let el of elements) {
      const text = await page.evaluate(e => e.textContent, el);
      if (text === 'DMs') {
        await el.click();
        await page.waitForTimeout(2000);
        break;
      }
    }
  }
  
  const content = await page.content();
  console.log("BODY HTML LENGTH:", content.length);
  
  await browser.close();
})();
