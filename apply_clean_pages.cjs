const fs = require('fs');

let code = fs.readFileSync('src/App.jsx', 'utf8');

// ============================================================
// PART 1: Remove duplicate/old page number render from Page 1
// ============================================================
const oldFirstPageNum = `            {showPageNumbers && showPageNumberOnFirstPage && (
              <div className={\`absolute bottom-10 \${pageNumberPositionClass} text-[11px] font-medium text-gray-400\`}>
                1
              </div>
            )}`;
code = code.replace(oldFirstPageNum, '');

// ============================================================
// PART 2: Unify Page 1 footer structure to match requirements 8 & 9:
// - Footer content (like "Confidential") remains consistent
// - Page number increments automatically (Page 1 has "1", not "Page 1")
// - No visible text such as "Page" in the footer, only the page number itself
// ============================================================
const oldPage1Footer = `            {docFooterText && (
              <div 
                className="absolute bottom-6 text-[10px] font-semibold text-gray-400 border-t border-gray-100 pt-1.5 flex justify-between select-none"
                style={{ 
                  left: docMargins === 'narrow' ? '24px' : docMargins === 'wide' ? '64px' : '48px', 
                  right: docMargins === 'narrow' ? '24px' : docMargins === 'wide' ? '64px' : '48px' 
                }}
              >
                <span>{docFooterText}</span>
                <span>Page 1</span>
              </div>
            )}

            {showPageNumbers && (
              <div 
                className={\`absolute text-[11px] font-semibold text-gray-400 select-none \${
                  pageNumberPos === 'bottom-left' ? 'bottom-10' :
                  pageNumberPos === 'bottom-right' ? 'bottom-10' :
                  'bottom-10 left-1/2 -translate-x-1/2'
                }\`}
                style={{ 
                  left: pageNumberPos === 'bottom-left' ? (docMargins === 'narrow' ? '24px' : docMargins === 'wide' ? '64px' : '48px') : undefined,
                  right: pageNumberPos === 'bottom-right' ? (docMargins === 'narrow' ? '24px' : docMargins === 'wide' ? '64px' : '48px') : undefined,
                }}
              >
                1
              </div>
            )}`;

const newPage1Footer = `            {(docFooterText || (showPageNumbers && showPageNumberOnFirstPage)) && (
              <div 
                className="absolute bottom-6 text-[10px] font-semibold text-gray-400 border-t border-gray-100 pt-1.5 flex justify-between select-none"
                style={{ 
                  left: docMargins === 'narrow' ? '24px' : docMargins === 'wide' ? '64px' : '48px', 
                  right: docMargins === 'narrow' ? '24px' : docMargins === 'wide' ? '64px' : '48px' 
                }}
              >
                <span>{docFooterText || ''}</span>
                {showPageNumbers && showPageNumberOnFirstPage && (
                  <span>1</span>
                )}
              </div>
            )}`;

code = code.replace(oldPage1Footer, newPage1Footer);

// ============================================================
// PART 3: Add extraPages state near other page states
// ============================================================
const stateAnchor = `const [showPageNumberOnFirstPage, setShowPageNumberOnFirstPage] = useState(true);`;
const stateInsert = `const [showPageNumberOnFirstPage, setShowPageNumberOnFirstPage] = useState(true);
  const [extraPages, setExtraPages] = useState([]);
  const extraPageRefs = useRef({});`;
code = code.replace(stateAnchor, stateInsert);

// ============================================================
// PART 4: Rewrite insertEnterprisePage to add a new page via React state instead of DOM insertion
// ============================================================
const oldInsertStart = `  const insertEnterprisePage = useCallback(() => {
    if (!blankBodyRef.current) {
      return;
    }

    const selection = window.getSelection();
    const existingPages = blankBodyRef.current.querySelectorAll('[data-enterprise-page="true"]').length;
    const pageNumber = existingPages + 2;

    const pageHeight = pageOrientation === 'landscape' ? (docPageSize === 'letter' ? 816 : docPageSize === 'legal' ? 816 : 794) : (docPageSize === 'letter' ? 1056 : docPageSize === 'legal' ? 1296 : 1123);
    
    const pageWrapper = document.createElement('div');
    pageWrapper.setAttribute('data-enterprise-page', 'true');
    pageWrapper.style.position = 'relative';
    pageWrapper.style.minHeight = \`\${pageHeight}px\`;
    pageWrapper.style.height = \`\${pageHeight}px\`;
    pageWrapper.style.cursor = 'text';

    // Click handler to remove placeholder/ghost elements
    pageWrapper.onclick = (e) => {
      setIsBlankDocument(false);
    };

    const paragraph = document.createElement('p');
    paragraph.innerHTML = '<br/>';
    pageWrapper.appendChild(paragraph);



    let inserted = false;
    if (selection && selection.rangeCount) {
      try {
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        if (blankBodyRef.current.contains(container)) {
          let targetNode = container;
          while (targetNode && targetNode.parentNode !== blankBodyRef.current) {
            targetNode = targetNode.parentNode;
          }
          if (targetNode) {
            blankBodyRef.current.insertBefore(pageWrapper, targetNode.nextSibling);
            inserted = true;
          }
        }
      } catch (e) {
        // Fall back to append
      }
    }

    if (!inserted) {
      blankBodyRef.current.appendChild(pageWrapper);
    }

    // Set editor focus to the new page content
    try {
      const nextRange = document.createRange();
      nextRange.selectNodeContents(paragraph);
      nextRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(nextRange);
    } catch (e) {
      // Ignore focus errors
    }

    showToast(\`Page \${pageNumber} created\`);

    requestAnimationFrame(() => {
      pageWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setDocBodyHtml(blankBodyRef.current?.innerHTML || '');
      computeDocumentStats();
      computeDocumentOutline();
    });
  }, [computeDocumentOutline, computeDocumentStats, setIsBlankDocument, docPageSize, pageOrientation]);`;

const newInsert = `  const insertEnterprisePage = useCallback(() => {
    const newPageId = 'page-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    setExtraPages(prev => [...prev, { id: newPageId, html: '' }]);
    showToast(\`Page \${extraPages.length + 2} created\`);
    
    // Scroll to the new page after render
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = extraPageRefs.current[newPageId];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Focus the editable area
          const editable = el.querySelector('[contenteditable]');
          if (editable) {
            editable.focus();
            const range = document.createRange();
            range.selectNodeContents(editable);
            range.collapse(true);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }
        computeDocumentStats();
        computeDocumentOutline();
      });
    });
  }, [extraPages.length, computeDocumentOutline, computeDocumentStats]);`;

code = code.replace(oldInsertStart, newInsert);

// ============================================================
// PART 5: Replace syncPageFooters to be a no-op since footers are fully React-rendered on demand
// ============================================================
const simpleSyncStart = '  const syncPageFooters = useCallback(() => {';
const idx = code.indexOf(simpleSyncStart);
if (idx !== -1) {
  let depth = 0;
  let endIdx = idx;
  let foundStart = false;
  for (let i = idx; i < code.length; i++) {
    if (code[i] === '{') { depth++; foundStart = true; }
    if (code[i] === '}') { depth--; }
    if (foundStart && depth === 0) {
      const rest = code.substring(i);
      const closingMatch = rest.match(/\}\s*,\s*\[.*?\]\s*\)/);
      if (closingMatch) {
        endIdx = i + closingMatch.index + closingMatch[0].length;
        if (code[endIdx] === ';') endIdx++;
      }
      break;
    }
  }
  const newSync = `  const syncPageFooters = useCallback(() => {
    // No-op: page footers are now handled dynamically by React state-driven rendering
  }, []);`;
  code = code.substring(0, idx) + newSync + code.substring(endIdx);
}

// ============================================================
// PART 6: Render extraPages after "End Page 1 Sheet Wrapper"
// ============================================================
const afterPage1Marker = `            </div> {/* End Page 1 Sheet Wrapper */}

            {/* Composing / Analyzing State Glow - Non-blocking floating status */}`;

const extraPagesJSX = `            </div> {/* End Page 1 Sheet Wrapper */}

            {/* ========== EXTRA PAGES (React state-driven) ========== */}
            {extraPages.map((pg, idx) => {
              const pgNum = idx + 2;
              const pgHeight = pageOrientation === 'landscape' ? (docPageSize === 'letter' ? 816 : docPageSize === 'legal' ? 816 : 794) : (docPageSize === 'letter' ? 1056 : docPageSize === 'legal' ? 1296 : 1123);
              const pgPadding = docMargins === 'narrow' ? '24px' : docMargins === 'wide' ? '64px' : '48px';
              return (
                <div
                  key={pg.id}
                  ref={(el) => { if (el) extraPageRefs.current[pg.id] = el; }}
                  className="w-full rounded-[24px] shadow-[0_4px_24px_-6px_rgba(15,23,42,0.08)] border transition-all relative"
                  style={{
                    marginTop: '32px',
                    backgroundColor:
                      docTheme === 'emerald' ? '#F0FDF4' :
                      docTheme === 'amber' ? '#FEFBE8' :
                      docTheme === 'rose' ? '#FFF1F2' :
                      docTheme === 'slate' ? '#F8FAFC' :
                      '#ffffff',
                    borderColor:
                      docTheme === 'emerald' ? '#BBF7D0' :
                      docTheme === 'amber' ? '#FEF08A' :
                      docTheme === 'rose' ? '#FECDD3' :
                      docTheme === 'slate' ? '#E2E8F0' :
                      'rgba(148, 163, 184, 0.22)',
                    color:
                      docTheme === 'emerald' ? '#052e16' :
                      docTheme === 'amber' ? '#451a03' :
                      docTheme === 'rose' ? '#4c0519' :
                      docTheme === 'slate' ? '#0f172a' :
                      '#0f172a',
                    fontFamily:
                      docTheme === 'emerald' ? 'sans-serif' :
                      docTheme === 'amber' ? 'serif' :
                      docTheme === 'rose' ? 'sans-serif' :
                      docTheme === 'slate' ? 'monospace' :
                      'sans-serif',
                    height: pgHeight + 'px',
                    minHeight: pgHeight + 'px',
                    paddingLeft: pgPadding,
                    paddingRight: pgPadding,
                    paddingTop: '64px',
                    paddingBottom: '78px',
                    boxSizing: 'border-box',
                    cursor: 'text',
                  }}
                >
                  {/* Header text on extra page */}
                  {docHeaderText && (
                    <div
                      className="absolute top-6 text-[10px] font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-1.5 select-none"
                      style={{ left: pgPadding, right: pgPadding }}
                    >
                      {docHeaderText}
                    </div>
                  )}

                  {/* Footer content - clean and increments page number automatically (No "Page" text) */}
                  {(docFooterText || showPageNumbers) && (
                    <div
                      className="absolute bottom-6 text-[10px] font-semibold text-gray-400 flex justify-between select-none"
                      style={{ left: pgPadding, right: pgPadding, borderTop: '1px solid rgba(148,163,184,0.1)', paddingTop: '12px' }}
                    >
                      <span>{docFooterText || ''}</span>
                      {showPageNumbers && (
                        <span>{pgNum}</span>
                      )}
                    </div>
                  )}

                  {/* Independent editable area */}
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    dir="ltr"
                    onInput={(e) => {
                      const html = e.currentTarget.innerHTML;
                      setExtraPages(prev => prev.map(p => p.id === pg.id ? { ...p, html } : p));
                    }}
                    className="outline-none text-sm text-gray-700 leading-relaxed min-h-[200px]"
                    style={{ fontFamily: editorFont, textAlign: alignMode, direction: 'ltr', unicodeBidi: 'plaintext' }}
                    dangerouslySetInnerHTML={{ __html: pg.html }}
                  />
                </div>
              );
            })}

            {/* Composing / Analyzing State Glow - Non-blocking floating status */}`;

code = code.replace(afterPage1Marker, extraPagesJSX);

// ============================================================
// PART 7: Prevent auto-insert page on ENTER key inside documentCardRef
// ============================================================
const autoPageInsert = `              if (!shouldInsertNewPageOnEnter()) {
                return;
              }
              event.preventDefault();
              insertEnterprisePage();`;
const autoPageInsertReplacement = `              // Auto page-insert on Enter disabled; pages are now created on-demand via the "+ New page" CTA
              return;`;
code = code.replace(autoPageInsert, autoPageInsertReplacement);

fs.writeFileSync('src/App.jsx', code);
console.log('Script execution complete!');
