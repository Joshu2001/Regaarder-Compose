const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add HoveredBlock state
const stateOld = `const [isComposing, setIsComposing] = useState(false);`;
const stateNew = `const [isComposing, setIsComposing] = useState(false);\n  const [hoveredBlockMenu, setHoveredBlockMenu] = useState(null);`;

if (!app.includes('const [hoveredBlockMenu, setHoveredBlockMenu]')) {
  app = app.replace(stateOld, stateNew);
}

// 2. Add MouseMove listener
const effectOld = `  useEffect(() => {
    // -------------------------------------------------------------
    // AI Streaming Setup
    // -------------------------------------------------------------`;

const effectNew = `  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      const targetBlock = e.target.closest('[data-block-type]');
      const menu = e.target.closest('#block-hover-menu');
      
      if (targetBlock) {
        setHoveredBlockMenu({
          element: targetBlock,
          type: targetBlock.getAttribute('data-block-type'),
          rect: targetBlock.getBoundingClientRect()
        });
      } else if (!menu) {
        setHoveredBlockMenu(null);
      }
    };
    document.addEventListener('mousemove', handleGlobalMouseMove);
    return () => document.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  useEffect(() => {
    // -------------------------------------------------------------
    // AI Streaming Setup
    // -------------------------------------------------------------`;

if (!app.includes('handleGlobalMouseMove')) {
  app = app.replace(effectOld, effectNew);
}

// 3. Render BlockHoverMenu
const renderOld = `      {/* ────────────────────────────────────────────────────────── */}
      {/* 5) THE MAIN CANVAS (Compose Content)                       */}
      {/* ────────────────────────────────────────────────────────── */}`;

const renderNew = `      {/* ────────────────────────────────────────────────────────── */}
      {/* 5) THE MAIN CANVAS (Compose Content)                       */}
      {/* ────────────────────────────────────────────────────────── */}
      
      {/* Block Hover Action Menu */}
      {hoveredBlockMenu && (
        <div 
          id="block-hover-menu"
          className="fixed z-[99999] flex items-center gap-1 bg-white border border-slate-200 shadow-[0_4px_24px_rgba(0,0,0,0.12)] rounded-full px-2 py-1 transition-all animate-in fade-in zoom-in-95 pointer-events-auto"
          style={{
            top: hoveredBlockMenu.rect.top - 40 > 10 ? hoveredBlockMenu.rect.top - 40 : hoveredBlockMenu.rect.bottom + 10,
            left: hoveredBlockMenu.rect.left + 24
          }}
          onMouseLeave={() => setHoveredBlockMenu(null)}
        >
          <div className="flex gap-1.5 pr-2 border-r border-slate-200">
            {[
              { id: 'grad1', bg: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)', label: 'Silver' },
              { id: 'grad2', bg: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)', label: 'Rose' },
              { id: 'grad3', bg: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)', label: 'Sky' },
              { id: 'grad4', bg: 'linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)', label: 'Mint' },
              { id: 'grad5', bg: 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)', label: 'Sun' },
              { id: 'grad6', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', label: 'Plum' }
            ].map(grad => (
              <button
                key={grad.id}
                title={grad.label}
                onPointerDown={(e) => { 
                  e.preventDefault(); 
                  e.stopPropagation(); 
                  if (hoveredBlockMenu.type === 'divider') {
                     const hr = hoveredBlockMenu.element.querySelector('hr');
                     if (hr) hr.style.borderColor = 'transparent';
                     hoveredBlockMenu.element.style.background = grad.bg;
                  } else {
                     hoveredBlockMenu.element.style.background = grad.bg;
                  }
                }}
                className="w-5 h-5 rounded-full border border-slate-200 hover:scale-110 hover:shadow-md transition-all duration-200"
                style={{ background: grad.bg }}
              />
            ))}
          </div>
          <button 
            onPointerDown={(e) => { 
              e.preventDefault(); 
              e.stopPropagation(); 
              if (hoveredBlockMenu.element && hoveredBlockMenu.element.parentNode) {
                hoveredBlockMenu.element.parentNode.removeChild(hoveredBlockMenu.element);
              }
              setHoveredBlockMenu(null);
            }}
            className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition-colors ml-1"
            title="Delete block"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      )}
`;

if (!app.includes('id="block-hover-menu"')) {
  app = app.replace(renderOld, renderNew);
}

fs.writeFileSync('src/App.jsx', app);
console.log('BlockHoverMenu feature added.');
