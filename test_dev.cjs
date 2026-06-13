const { spawn } = require('child_process');
const puppeteer = require('puppeteer');

const server = spawn('npm', ['run', 'dev'], { shell: true });
let serverReady = false;

server.stdout.on('data', async (d) => {
  const output = d.toString();
  console.log('SERVER:', output.trim());
  if (output.includes('Local:') && !serverReady) {
    serverReady = true;
    console.log('Server is ready, starting puppeteer...');
    try {
      const browser = await puppeteer.launch({ headless: 'new' });
      const page = await browser.newPage();
      
      page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
      page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
      
      await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
      
      const buttons = await page.$$('button');
      let found = false;
      for (const btn of buttons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && text.includes('Start room')) {
          console.log('Clicking Start room...');
          found = true;
          await btn.click();
          await new Promise(r => setTimeout(r, 2000));
          break;
        }
      }
      if (!found) console.log('Button not found');
      
      await browser.close();
    } catch (err) {
      console.error('Test script error:', err);
    } finally {
      server.kill();
      process.exit(0);
    }
  }
});

server.stderr.on('data', d => console.error('SERVER ERR:', d.toString().trim()));

setTimeout(() => {
  if (!serverReady) {
    console.log('Timeout waiting for server');
    server.kill();
    process.exit(1);
  }
}, 10000);
