const { spawn } = require('child_process');
const puppeteer = require('puppeteer');

const server = spawn('npm', ['run', 'preview'], { shell: true });
server.stdout.on('data', d => console.log('SERVER:', d.toString().trim()));
server.stderr.on('data', d => console.error('SERVER ERR:', d.toString().trim()));

setTimeout(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
    
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });
    
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Start room')) {
        console.log('Clicking Start room...');
        await btn.click();
        await new Promise(r => setTimeout(r, 2000));
        break;
      }
    }
    
    await browser.close();
  } catch (err) {
    console.error('Test script error:', err);
  } finally {
    server.kill();
    process.exit(0);
  }
}, 3000);
