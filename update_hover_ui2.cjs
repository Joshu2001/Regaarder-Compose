const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

const startIndex = app.indexOf('{hoveredBlockMenu && (');
const endIndexStr = `      {/* ────────────────────────────────────────────────────────── */}
      {/* 6) TOAST & SIDEBAR NOTIFICATIONS                           */}
      {/* ────────────────────────────────────────────────────────── */}`;

const endIndex = app.indexOf(endIndexStr);

if (startIndex !== -1 && endIndex !== -1) {
  const newMenu = `{hoveredBlockMenu && (
        <div 
          id="block-hover-menu"
          className="fixed z-[99999] flex flex-col gap-2 bg-white/95 backdrop-blur-md border border-slate-200 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-xl p-2.5 transition-all animate-in fade-in zoom-in-95 pointer-events-auto"
          style={{
            top: hoveredBlockMenu.rect.top - 80 > 10 ? hoveredBlockMenu.rect.top - 80 : hoveredBlockMenu.rect.bottom + 10,
            left: hoveredBlockMenu.rect.left + 24
          }}
          onMouseLeave={() => setHoveredBlockMenu(null)}
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-0.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">Block Appearance</span>
            <div className="flex items-center gap-0.5">
              <button 
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (hoveredBlockMenu.element && hoveredBlockMenu.element.parentNode) {
                    const clone = hoveredBlockMenu.element.cloneNode(true);
                    hoveredBlockMenu.element.parentNode.insertBefore(clone, hoveredBlockMenu.element.nextSibling);
                  }
                  setHoveredBlockMenu(null);
                }}
                title="Duplicate block" 
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
              <button 
                onPointerDown={(e) => { 
                  e.preventDefault(); 
                  e.stopPropagation(); 
                  if (hoveredBlockMenu.element && hoveredBlockMenu.element.parentNode) {
                    hoveredBlockMenu.element.parentNode.removeChild(hoveredBlockMenu.element);
                  }
                  setHoveredBlockMenu(null);
                }}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-0.5"
                title="Delete block"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-slate-400 font-medium px-1">Background Gradients</span>
            <div className="flex gap-1.5">
              {[
                { id: 'none', bg: 'transparent', label: 'None (Default)' },
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
                       if (hr) hr.style.borderColor = grad.bg === 'transparent' ? '#e2e8f0' : 'transparent';
                       hoveredBlockMenu.element.style.background = grad.bg;
                    } else if (hoveredBlockMenu.type === 'callout') {
                       if (grad.bg === 'transparent') {
                          hoveredBlockMenu.element.style.background = '#faf5ff';
                          hoveredBlockMenu.element.style.borderLeftColor = '#8b5cf6';
                          hoveredBlockMenu.element.style.color = '#4c1d95';
                       } else {
                          hoveredBlockMenu.element.style.background = grad.bg;
                          hoveredBlockMenu.element.style.borderLeftColor = 'transparent';
                          hoveredBlockMenu.element.style.color = '#1e293b';
                       }
                    } else if (hoveredBlockMenu.type === 'code_block') {
                       if (grad.bg === 'transparent') {
                          hoveredBlockMenu.element.style.background = '#1e293b';
                          hoveredBlockMenu.element.style.color = '#e2e8f0';
                       } else {
                          hoveredBlockMenu.element.style.background = grad.bg;
                          hoveredBlockMenu.element.style.color = '#1e293b';
                       }
                    } else {
                       hoveredBlockMenu.element.style.background = grad.bg;
                    }
                  }}
                  className={\`w-6 h-6 rounded-full border \${grad.bg === 'transparent' ? 'border-dashed border-slate-300' : 'border-slate-200'} hover:scale-110 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-300\`}
                  style={{ background: grad.bg }}
                >
                  {grad.bg === 'transparent' && <svg className="w-full h-full text-slate-300 p-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line></svg>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
`;
  app = app.substring(0, startIndex) + newMenu + app.substring(endIndex);
  fs.writeFileSync('src/App.jsx', app);
  console.log('Hover UI improved by substring slice.');
} else {
  console.log('Could not find start or end index.');
}
