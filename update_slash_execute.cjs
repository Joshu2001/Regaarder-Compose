const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

const targetStr = `    } else if (key === 'watermark') {`;
const replacementStr = `    } else if (key === 'callout') {
      const calloutHtml = '<div class="callout-block" data-block-type="callout" style="border-left:3px solid #8b5cf6;padding:12px 16px;background:#faf5ff;border-radius:0 8px 8px 0;margin:12px 0;color:#4c1d95;font-style:italic; transition:background 0.3s ease;">&nbsp;</div><p><br></p>';
      if (window.__composeInsertHTML) window.__composeInsertHTML(calloutHtml);
      else document.execCommand('insertHTML', false, calloutHtml);
    } else if (key === 'code_block') {
      const codeHtml = '<div class="code-block" data-block-type="code_block" style="background:#1e293b;border-radius:8px;padding:16px;margin:12px 0;font-family:monospace;font-size:13px;color:#e2e8f0;white-space:pre; transition:background 0.3s ease;"><span style="color:#94a3b8">// Code block</span>\\n</div><p><br></p>';
      if (window.__composeInsertHTML) window.__composeInsertHTML(codeHtml);
      else document.execCommand('insertHTML', false, codeHtml);
    } else if (key === 'divider') {
      const divHtml = '<div class="divider-block" data-block-type="divider" style="padding:10px 0; margin:10px 0; border-radius:6px; transition:background 0.3s ease;"><hr style="border:none;border-top:2px solid #e2e8f0;margin:0" /></div><p><br></p>';
      if (window.__composeInsertHTML) window.__composeInsertHTML(divHtml);
      else document.execCommand('insertHTML', false, divHtml);
    } else if (key === 'watermark') {`;

if (!app.includes(`key === 'callout'`)) {
  app = app.replace(targetStr, replacementStr);
  fs.writeFileSync('src/App.jsx', app);
  console.log('Added blocks to executeSlashCommand.');
} else {
  console.log('Already added.');
}
