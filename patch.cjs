const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const target1 = `        pages.forEach((page, index) => {
          const pageNum = index + 2;
          
          let footerEl = page.querySelector('.page-sheet-footer');`;

const replace1 = `        pages.forEach((page, index) => {
          const pageNum = index + 2;
          
          // --- INJECT CLONED PAGE HEADER (Title, Subtitle, Badges) ---
          let headerEl = page.querySelector('.page-sheet-header');
          if (!headerEl) {
            headerEl = document.createElement('div');
            headerEl.setAttribute('contenteditable', 'false');
            headerEl.className = 'page-sheet-header select-none pointer-events-none';
            headerEl.style.position = 'absolute';
            headerEl.style.top = '0';
            headerEl.style.left = '0';
            headerEl.style.right = '0';
            page.appendChild(headerEl);
          }
          
          const marginPadding = docMargins === 'narrow' ? '24px' : docMargins === 'wide' ? '64px' : '48px';
          
          const badgeBg = docState === 'draft' ? 'rgba(139, 92, 246, 0.1)' : docState === 'ready' ? 'rgba(16, 185, 129, 0.1)' : docState === 'review' ? 'rgba(59, 130, 246, 0.1)' : '#f8fafc';
          const badgeBorder = docState === 'draft' ? 'rgba(139, 92, 246, 0.2)' : docState === 'ready' ? 'rgba(16, 185, 129, 0.2)' : docState === 'review' ? 'rgba(59, 130, 246, 0.2)' : '#e2e8f0';
          const badgeColor = docState === 'draft' ? '#6d28d9' : docState === 'ready' ? '#047857' : docState === 'review' ? '#1d4ed8' : '#475569';
          
          const newHeaderHtml = \`
            <div style="position: absolute; top: 24px; left: \${marginPadding}; right: \${marginPadding}; pointer-events: auto;">
              \${docHeaderText ? \`<div style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.2em; border-bottom: 1px solid #f3f4f6; padding-bottom: 6px; width: max-content;">\${docHeaderText}</div>\` : ''}
              
              <div style="position: absolute; top: -4px; right: 0; display: flex; align-items: center; gap: 6px; background-color: \${badgeBg}; border: 1px solid \${badgeBorder}; padding: 4px 10px; border-radius: 8px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="\${badgeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
                <span style="font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: \${badgeColor};">\${docState}</span>
              </div>
            </div>
            
            <div style="padding-top: 64px; padding-left: \${marginPadding}; padding-right: \${marginPadding};">
              <div style="font-size: \${editorSize}px; font-family: \${editorFont}; font-weight: 600; color: #111827; margin-bottom: 8px; line-height: 1.25; letter-spacing: -0.025em; white-space: pre-wrap;">\${docTitle || ''}</div>
              <div style="font-size: \${subtitleSize}px; font-family: \${editorFont}; color: #6b7280; margin-bottom: 40px; line-height: 1.625; min-height: 56px; white-space: pre-wrap;">\${docSubtitle || ''}</div>
            </div>
          \`;
          
          if (headerEl.innerHTML !== newHeaderHtml) {
            headerEl.innerHTML = newHeaderHtml;
          }
          
          // Provide enough padding to the page wrapper so the editable text begins below the absolute header
          const expectedPadding = 64 + editorSize + 8 + Math.max(56, subtitleSize * 1.625) + 40;
          if (page.style.paddingTop !== \`\${expectedPadding}px\`) {
            page.style.paddingTop = \`\${expectedPadding}px\`;
          }
          // ---------------------------------------------------------

          let footerEl = page.querySelector('.page-sheet-footer');`;

code = code.replace(target1, replace1);

const target2 = `  }, [docFooterText, showPageNumbers, pageNumberPos, docMargins]);`;
const replace2 = `  }, [docFooterText, showPageNumbers, pageNumberPos, docMargins, docHeaderText, docState, docTitle, docSubtitle, editorSize, subtitleSize, editorFont]);`;
code = code.replace(target2, replace2);

fs.writeFileSync('src/App.jsx', code);
