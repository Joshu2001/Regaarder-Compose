const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto("http://localhost:5173", { waitUntil: "networkidle0" });
  
  // Click on DMs in the mini sidebar using XPath
  const [dmIcon] = await page.$x('//span[text()="DMs"]');
  if (dmIcon) {
    await dmIcon.click();
    await page.waitForTimeout(2000);
  } else {
    console.log("Could not find DMs icon");
  }
  
  const content = await page.content();
  console.log("BODY HTML LENGTH:", content.length);
  
  await browser.close();
})();
