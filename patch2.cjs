const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const target1 = `  const syncPageFooters = useCallback(() => {
    if (!blankBodyRef.current || isSyncingFootersRef.current) return;
    isSyncingFootersRef.current = true;
    try {
      const pages = blankBodyRef.current.querySelectorAll('[data-enterprise-page="true"]');
      pages.forEach((page, index) => {
        const pageNum = index + 2;`;

const replace1 = `  const syncPageFooters = useCallback(() => {
    if (!blankBodyRef.current || isSyncingFootersRef.current) return;
    isSyncingFootersRef.current = true;
    try {
      const pages = blankBodyRef.current.querySelectorAll('[data-enterprise-page="true"]');
      if (pages.length === 0) return;
      
      const wrapperElement = documentCardRef.current?.querySelector('.compose-editor-surface > div');
      const wrapperTop = wrapperElement ? wrapperElement.getBoundingClientRect().top : 0;
      
      const pageHeight = pageOrientation === 'landscape' ? (docPageSize === 'letter' ? 816 : docPageSize === 'legal' ? 816 : 794) : (docPageSize === 'letter' ? 1056 : docPageSize === 'legal' ? 1296 : 1123);

      pages.forEach((page, index) => {
        const pageNum = index + 2;`;

const target2 = `        if (pageNumberPos === 'bottom-left') {
            if (footerEl.style.flexDirection !== 'row-reverse') footerEl.style.flexDirection = 'row-reverse';
            if (numSpan.style.position) numSpan.style.position = '';
            if (numSpan.style.left) numSpan.style.left = '';
            if (numSpan.style.transform) numSpan.style.transform = '';
          } else if (pageNumberPos === 'bottom-center') {
            if (numSpan.style.position !== 'absolute') numSpan.style.position = 'absolute';
            if (numSpan.style.left !== '50%') numSpan.style.left = '50%';
            if (numSpan.style.transform !== 'translateX(-50%)') numSpan.style.transform = 'translateX(-50%)';
          } else {
            if (footerEl.style.flexDirection !== 'row') footerEl.style.flexDirection = 'row';
            if (numSpan.style.position) numSpan.style.position = '';
            if (numSpan.style.left) numSpan.style.left = '';
            if (numSpan.style.transform) numSpan.style.transform = '';
          }
        } else if (numSpan) {
          numSpan.remove();
        }
      });
    } finally {
      // Release loop lock after microtask or immediately
      isSyncingFootersRef.current = false;
    }
  }, [docFooterText, showPageNumbers, pageNumberPos, docMargins]);`;

const replace2 = `        if (pageNumberPos === 'bottom-left') {
            if (footerEl.style.flexDirection !== 'row-reverse') footerEl.style.flexDirection = 'row-reverse';
            if (numSpan.style.position) numSpan.style.position = '';
            if (numSpan.style.left) numSpan.style.left = '';
            if (numSpan.style.transform) numSpan.style.transform = '';
          } else if (pageNumberPos === 'bottom-center') {
            if (numSpan.style.position !== 'absolute') numSpan.style.position = 'absolute';
            if (numSpan.style.left !== '50%') numSpan.style.left = '50%';
            if (numSpan.style.transform !== 'translateX(-50%)') numSpan.style.transform = 'translateX(-50%)';
          } else {
            if (footerEl.style.flexDirection !== 'row') footerEl.style.flexDirection = 'row';
            if (numSpan.style.position) numSpan.style.position = '';
            if (numSpan.style.left) numSpan.style.left = '';
            if (numSpan.style.transform) numSpan.style.transform = '';
          }
        } else if (numSpan) {
          numSpan.remove();
        }

        // --- DYNAMIC PAGE POSITIONING LOGIC ---
        // Calculate vertical margin required to push this page to its correct boundary
        if (wrapperTop !== 0) {
          const targetDistance = (pageNum - 1) * (pageHeight + 32);
          const currentDistance = page.getBoundingClientRect().top - wrapperTop;
          const discrepancy = targetDistance - currentDistance;
          
          if (Math.abs(discrepancy) > 1) {
            const currentMargin = parseFloat(window.getComputedStyle(page).marginTop) || 0;
            // Never pull it up closer than 32px to the previous content
            const newMargin = Math.max(32, currentMargin + discrepancy);
            if (page.style.marginTop !== \`\${newMargin}px\`) {
              page.style.marginTop = \`\${newMargin}px\`;
            }
          }
        }
        page.style.minHeight = \`\${pageHeight}px\`;
        page.style.height = \`\${pageHeight}px\`;
      });
    } finally {
      // Release loop lock after microtask or immediately
      isSyncingFootersRef.current = false;
    }
  }, [docFooterText, showPageNumbers, pageNumberPos, docMargins, pageOrientation, docPageSize]);`;

code = code.replace(target1, replace1).replace(target2, replace2);
fs.writeFileSync('src/App.jsx', code);
