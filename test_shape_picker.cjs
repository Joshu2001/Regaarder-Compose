const { spawn } = require('child_process');
const puppeteer = require('puppeteer');

// Run npm run dev and pass --host 127.0.0.1 to Vite
const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1'], { shell: true });
let serverReady = false;
let accumulatedStdout = '';
const consoleErrors = [];

server.stdout.on('data', async (d) => {
  const output = d.toString();
  accumulatedStdout += output;
  console.log('SERVER:', output.trim());
  
  // Strip ANSI escape codes
  const cleanOutput = accumulatedStdout.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
  const match = cleanOutput.match(/(http:\/\/127\.0\.0\.1:\d+)/i);
  
  if (match && !serverReady) {
    serverReady = true;
    const url = match[1] + '/';
    console.log('Server detected on 127.0.0.1! URL:', url, 'Starting Puppeteer...');
    
    try {
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.setDefaultNavigationTimeout(60000);
      
      page.on('console', msg => {
        const text = msg.text();
        if (msg.type() === 'error') {
          console.log('BROWSER ERROR LOG:', text);
          // Ignore environmental warnings, resource load errors, and Yjs websocket/socket.io connection failures
          const shouldIgnore = 
            text.includes('WebSocket') || 
            text.includes('connection') || 
            text.includes('socket.io') || 
            text.includes('Permissions policy') || 
            text.includes('Failed to load resource') || 
            text.includes('ERR_CONNECTION_REFUSED');
            
          if (!shouldIgnore) {
            consoleErrors.push(text);
          }
        } else {
          console.log('BROWSER LOG:', text);
        }
      });
      
      page.on('pageerror', err => {
        const errText = err.toString();
        console.log('BROWSER PAGE ERROR:', errText);
        // Ignore environmental warnings, resource load errors, and Yjs websocket/socket.io connection failures
        const shouldIgnore = 
          errText.includes('WebSocket') || 
          errText.includes('connection') || 
          errText.includes('socket.io') || 
          errText.includes('Permissions policy') || 
          errText.includes('Failed to load resource') || 
          errText.includes('ERR_CONNECTION_REFUSED');
          
        if (!shouldIgnore) {
          consoleErrors.push(errText);
        }
      });
      
      console.log('Navigating to application landing page...');
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      console.log('Page loaded. Waiting 5 seconds for initialization...');
      await new Promise(r => setTimeout(r, 5000));
      
      // 1. Switch to sheets mode
      const buttons = await page.$$('button');
      let sheetsBtn = null;
      for (const btn of buttons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && text.trim().toLowerCase() === 'sheet') {
          sheetsBtn = btn;
          break;
        }
      }
      if (!sheetsBtn) {
        throw new Error('Sheet button not found on landing page');
      }
      
      console.log('Clicking Sheet button to switch to sheets mode...');
      await sheetsBtn.click();
      await new Promise(r => setTimeout(r, 3000));
      
      // 2. Open the shape picker modal
      console.log('Waiting for grid cell inputs...');
      await page.waitForSelector('input.cursor-cell');
      const cellInputs = await page.$$('input.cursor-cell');
      if (cellInputs.length === 0) {
        throw new Error('No cell inputs found in sheets view');
      }
      
      console.log('Clicking the first grid cell to focus it...');
      await cellInputs[0].click();
      await new Promise(r => setTimeout(r, 500));
      
      console.log('Typing "/" to open slash menu...');
      await page.keyboard.type('/');
      await new Promise(r => setTimeout(r, 1500));
      
      console.log('Waiting for slash menu option "Insert Shape"...');
      await page.waitForSelector('.slash-menu-option');
      const options = await page.$$('.slash-menu-option');
      let insertShapeOption = null;
      for (const opt of options) {
        const text = await page.evaluate(el => el.textContent, opt);
        if (text && text.includes('Insert Shape')) {
          insertShapeOption = opt;
          break;
        }
      }
      if (!insertShapeOption) {
        throw new Error('Insert Shape option not found in slash menu');
      }
      
      console.log('Clicking "Insert Shape" to open shape picker modal...');
      await insertShapeOption.click();
      await new Promise(r => setTimeout(r, 1500));
      
      // 3. Insert a shape
      console.log('Waiting for shape picker modal to be displayed...');
      await page.waitForSelector('div.fixed.z-\\[99999\\]');
      const modals = await page.$$('div.fixed.z-\\[99999\\]');
      let shapeModal = null;
      for (const m of modals) {
        const text = await page.evaluate(el => el.textContent, m);
        if (text && text.includes('Insert Shape')) {
          shapeModal = m;
          break;
        }
      }
      if (!shapeModal) {
        throw new Error('Shape picker modal not found in DOM');
      }
      
      const shapeButtons = await shapeModal.$$('button[title]');
      if (shapeButtons.length === 0) {
        throw new Error('No shape buttons found inside shape picker modal');
      }
      
      console.log('Clicking the first shape button to insert shape...');
      await shapeButtons[0].click();
      await new Promise(r => setTimeout(r, 1500));
      
      // 4. Click the shape overlay
      console.log('Waiting for shape overlay to render...');
      const overlaySelector = 'div.absolute.z-\\[100\\][style*="cursor: move"]';
      await page.waitForSelector(overlaySelector);
      const overlayDivs = await page.$$(overlaySelector);
      if (overlayDivs.length === 0) {
        throw new Error('Shape overlay was not created/rendered');
      }
      console.log(`Found ${overlayDivs.length} shape overlays.`);
      
      console.log('Clicking the shape overlay to reopen shape picker modal...');
      await page.evaluate(el => el.click(), overlayDivs[0]);
      await new Promise(r => setTimeout(r, 1500));
      
      // 5. Verify the shape picker modal successfully displays in the DOM
      console.log('Checking if shape picker modal displays in the DOM...');
      const reopenedModals = await page.$$('div.fixed.z-\\[99999\\]');
      let shapeModalVisible = false;
      for (const m of reopenedModals) {
        const text = await page.evaluate(el => el.textContent, m);
        if (text && text.includes('Insert Shape')) {
          shapeModalVisible = true;
          break;
        }
      }
      
      if (!shapeModalVisible) {
        throw new Error('Shape picker modal did not display in the DOM after clicking the shape overlay');
      }
      console.log('SUCCESS: Shape picker modal is successfully displayed in the DOM!');
      
      if (consoleErrors.length > 0) {
        throw new Error(`Console errors detected during run: ${consoleErrors.join('; ')}`);
      }
      console.log('SUCCESS: No console errors detected!');
      
      await browser.close();
      console.log('Test completed successfully. Exiting.');
      server.kill();
      process.exit(0);
    } catch (err) {
      console.error('TEST FAILURE:', err);
      server.kill();
      process.exit(1);
    }
  }
});

server.stderr.on('data', d => console.error('SERVER ERR:', d.toString().trim()));

setTimeout(() => {
  if (!serverReady) {
    console.log('Timeout waiting for dev server to start');
    server.kill();
    process.exit(1);
  }
}, 60000);
