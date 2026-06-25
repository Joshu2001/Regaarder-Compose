const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(file, 'utf8');

console.log('Original length:', content.length);

// 1. Remove the previously injected galleries code to avoid duplicates
const startMarker = '// --- COMPOSE PICKERS & GALLERIES ---';
const endMarker = '// --- END COMPOSE PICKERS ---';
if (content.includes(startMarker) && content.includes(endMarker)) {
  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker) + endMarker.length;
  content = content.substring(0, startIdx) + content.substring(endIdx);
}

// 2. Add necessary lucide icons for the new UI
const iconImportsMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+'lucide-react';/);
if (iconImportsMatch) {
  const currentIcons = iconImportsMatch[1];
  const newIcons = ['Film', 'Folder', 'Calculator', 'Sigma', 'SmilePlus', 'ListTree', 'Sigma as SigmaIcon', 'Pi', 'Sparkles', 'Link', 'ImagePlus', 'Image as ImageIcon', 'Search', 'Clock'];
  let iconsToAdd = [];
  newIcons.forEach(icon => {
    if (!currentIcons.includes(icon.split(' as ')[0])) {
      iconsToAdd.push(icon);
    }
  });
  if (iconsToAdd.length > 0) {
    const updatedIcons = currentIcons + ', ' + iconsToAdd.join(', ');
    content = content.replace(iconImportsMatch[0], `import {${updatedIcons}} from 'lucide-react';`);
  }
}

// 3. Draft Status Modal Redesign (Apple-tier typography and monochromatic slate colors)
content = content.replace(
  /\{\s*key:\s*'draft',\s*label:\s*'Draft',\s*desc:\s*'Actively being written',\s*color:\s*'[^']*'(.*?)\},\s*\{\s*key:\s*'ready',\s*label:\s*'Ready',\s*desc:\s*'Completed and ready for use',\s*color:\s*'[^']*'(.*?)\},\s*\{\s*key:\s*'review',\s*label:\s*'In Review',\s*desc:\s*'Awaiting feedback',\s*color:\s*'[^']*'(.*?)\},\s*\{\s*key:\s*'archived',\s*label:\s*'Archived',\s*desc:\s*'Stored and inactive',\s*color:\s*'[^']*'(.*?)\}\s*\]/gs,
  `{ key: 'draft', label: 'Draft', desc: 'Actively being written', color: 'hover:bg-slate-100/80 text-slate-900 font-semibold tracking-tight'$1},
                        { key: 'ready', label: 'Ready', desc: 'Completed and ready for use', color: 'hover:bg-slate-100/80 text-slate-900 font-semibold tracking-tight'$2},
                        { key: 'review', label: 'In Review', desc: 'Awaiting feedback', color: 'hover:bg-slate-100/80 text-slate-900 font-semibold tracking-tight'$3},
                        { key: 'archived', label: 'Archived', desc: 'Stored and inactive', color: 'hover:bg-slate-100/80 text-slate-500 font-medium tracking-tight'$4}
                      ]`
);
// Make sure the title "DOCUMENT STATE" matches Apple typography
content = content.replace(
  /<div className="px-2 py-1 text-\[10px\] font-bold uppercase tracking-wider text-slate-400">Document State<\/div>/g,
  `<div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-slate-500 font-[system-ui]">Document State</div>`
);

// Update document dropdown styling container
content = content.replace(
  /<div className="absolute right-0 top-full mt-1.5 z-\[300\] bg-white border border-slate-200 rounded-2xl p-2 shadow-2xl w-56 text-left normal-case tracking-normal">/g,
  `<div className="absolute right-0 top-full mt-2 z-[300] bg-white border border-slate-200/60 rounded-xl p-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-60 text-left normal-case tracking-normal font-[system-ui] backdrop-blur-xl">`
);

// 4. Create the Galleries components
const galleriesCode = `
// --- COMPOSE PICKERS & GALLERIES ---
const MediaPicker = ({ isOpen, setOpen, anchorEl }) => {
  if (!isOpen || !anchorEl) return null;
  const rect = anchorEl.getBoundingClientRect();
  return (
    <>
      <div className="fixed inset-0 z-[200]" onPointerDown={(e) => { e.preventDefault(); setOpen(false); }} />
      <div className="fixed z-[201] bg-white border border-slate-200/60 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-1.5 w-64 text-sm font-[system-ui] backdrop-blur-xl" style={{ top: rect.bottom + 8, left: rect.left }}>
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400">Insert Media</div>
        {[
          { icon: <ImageIcon size={15} strokeWidth={1.5}/>, label: 'Device Uploads', desc: 'Photos & Videos from computer' },
          { icon: <Sparkles size={15} strokeWidth={1.5}/>, label: 'AI Generation', desc: 'Generate visual assets' },
          { icon: <Search size={15} strokeWidth={1.5}/>, label: 'Stock Media', desc: 'Search Unsplash & Pexels' },
          { icon: <Link size={15} strokeWidth={1.5}/>, label: 'External URL', desc: 'Embed from web' },
          { icon: <ImageIcon size={15} strokeWidth={1.5} className="opacity-50"/>, label: 'Placeholder', desc: 'Add image placeholder box' },
        ].map((item, idx) => (
          <button key={idx} onPointerDown={(e) => { e.preventDefault(); window.showToast('Selected ' + item.label); setOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 transition-colors text-left text-slate-800">
            <div className="text-slate-500">{item.icon}</div>
            <div className="flex-1">
              <div className="font-medium text-[13px] tracking-tight">{item.label}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
};

const EmojiGalleryPicker = ({ isOpen, setOpen, anchorEl }) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Smileys');
  if (!isOpen || !anchorEl) return null;
  const rect = anchorEl.getBoundingClientRect();
  
  const categories = ['Recent', 'Smileys', 'Animals', 'Food', 'Activity', 'Travel', 'Objects', 'Symbols'];
  const emojis = {
    'Smileys': ['😀', '😂', '🥰', '😎', '🤔', '🙌', '🎉', '🔥', '✨', '💡', '🚀', '⭐', '❤️', '✅', '❌', '👀', '🥺', '😭', '😊', '😅'],
    'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵'],
    'Food': ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥'],
    'Recent': ['🎉', '🚀', '✨', '🔥', '✅']
  };

  const displayEmojis = search ? Object.values(emojis).flat().filter(e => true) : (emojis[activeTab] || emojis['Smileys']);

  return (
    <>
      <div className="fixed inset-0 z-[200]" onPointerDown={(e) => { e.preventDefault(); setOpen(false); }} />
      <div className="fixed z-[201] bg-white border border-slate-200/60 rounded-xl shadow-[0_12px_40px_rgb(0,0,0,0.12)] flex flex-col font-[system-ui] backdrop-blur-xl overflow-hidden" style={{ top: rect.bottom + 8, left: rect.left, width: '380px', height: '320px' }}>
        
        {/* Search Bar */}
        <div className="p-2 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 text-slate-400" size={14} />
            <input type="text" placeholder="Search emojis..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-slate-100 rounded-lg pl-8 pr-3 py-1.5 text-[13px] outline-none text-slate-800 placeholder-slate-400 font-medium" autoFocus />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-28 bg-slate-50/50 border-r border-slate-100 overflow-y-auto p-1.5 space-y-0.5">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveTab(cat)} className={\`w-full text-left px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-colors \${activeTab === cat ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-100'}\`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Emoji Grid */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2 px-1">{search ? 'Search Results' : activeTab}</div>
            <div className="grid grid-cols-6 gap-1">
              {displayEmojis.map((emoji, idx) => (
                <button key={idx} onPointerDown={(e) => { e.preventDefault(); document.execCommand('insertText', false, emoji); setOpen(false); }} className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-slate-200 text-xl transition-colors">
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const SymbolGalleryPicker = ({ isOpen, setOpen, anchorEl }) => {
  const [activeTab, setActiveTab] = useState('Math');
  if (!isOpen || !anchorEl) return null;
  const rect = anchorEl.getBoundingClientRect();
  
  const categories = ['Math', 'Currency', 'Arrows', 'Greek', 'Technical'];
  const symbolsMap = {
    'Math': ['±', '×', '÷', '∞', '≈', '≠', '≤', '≥', '∑', '∏', '∫', '∆', '∇', '√', '∝'],
    'Currency': ['€', '£', '¥', '¢', '₹', '₽', '₩', '₪', '₫', '฿'],
    'Arrows': ['←', '↑', '→', '↓', '↔', '↕', '⇐', '⇑', '⇒', '⇓', '⇔', '⇕'],
    'Greek': ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω'],
    'Technical': ['©', '®', '™', 'µ', '¶', '§', '°', '†', '‡', '•']
  };

  return (
    <>
      <div className="fixed inset-0 z-[200]" onPointerDown={(e) => { e.preventDefault(); setOpen(false); }} />
      <div className="fixed z-[201] bg-white border border-slate-200/60 rounded-xl shadow-[0_12px_40px_rgb(0,0,0,0.12)] flex flex-col font-[system-ui] backdrop-blur-xl overflow-hidden" style={{ top: rect.bottom + 8, left: rect.left, width: '360px', height: '280px' }}>
        
        <div className="flex flex-1 overflow-hidden">
          <div className="w-24 bg-slate-50/50 border-r border-slate-100 overflow-y-auto p-1.5 space-y-0.5">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveTab(cat)} className={\`w-full text-left px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-colors \${activeTab === cat ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-100'}\`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3 px-1">{activeTab} Symbols</div>
            <div className="grid grid-cols-5 gap-1.5">
              {(symbolsMap[activeTab] || []).map((sym, idx) => (
                <button key={idx} onPointerDown={(e) => { e.preventDefault(); document.execCommand('insertText', false, sym); setOpen(false); }} className="h-9 w-9 flex items-center justify-center rounded-md border border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-[15px] font-medium transition-all text-slate-800 shadow-sm">
                  {sym}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const EquationGalleryPicker = ({ isOpen, setOpen, anchorEl }) => {
  if (!isOpen || !anchorEl) return null;
  const rect = anchorEl.getBoundingClientRect();
  const equations = [
    { label: 'Area of Circle', eq: 'A = πr²' },
    { label: 'Pythagorean Theorem', eq: 'a² + b² = c²' },
    { label: 'Quadratic Formula', eq: 'x = (-b ± √(b² - 4ac)) / 2a' },
    { label: 'Standard Deviation', eq: 'σ = √(Σ(x - μ)² / N)' },
    { label: 'Einstein Energy', eq: 'E = mc²' },
    { label: 'Euler Identity', eq: 'e^(iπ) + 1 = 0' }
  ];
  return (
    <>
      <div className="fixed inset-0 z-[200]" onPointerDown={(e) => { e.preventDefault(); setOpen(false); }} />
      <div className="fixed z-[201] bg-white border border-slate-200/60 rounded-xl shadow-[0_12px_40px_rgb(0,0,0,0.12)] p-2 w-72 text-sm font-[system-ui] backdrop-blur-xl" style={{ top: rect.bottom + 8, left: rect.left }}>
        <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Common Equations</div>
        <div className="space-y-1">
          {equations.map((item, idx) => (
            <button key={idx} onPointerDown={(e) => { e.preventDefault(); document.execCommand('insertText', false, item.eq); setOpen(false); }} className="w-full flex flex-col px-3 py-2.5 rounded-lg hover:bg-slate-100 transition-colors text-left text-slate-800">
              <span className="text-[11px] text-slate-500 font-medium tracking-tight uppercase mb-0.5">{item.label}</span>
              <span className="font-mono text-[14px] font-medium tracking-tight text-slate-900">{item.eq}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

const ListGalleryPicker = ({ isOpen, setOpen, anchorEl, type }) => {
  if (!isOpen || !anchorEl) return null;
  const rect = anchorEl.getBoundingClientRect();
  let items = [];
  let title = '';
  if (type === 'bullet') {
    title = 'Bullet Library';
    items = [
      { id: 'none', label: 'None', preview: 'None' },
      { id: 'disc', label: 'Solid Circle', preview: '●\\n●\\n●' },
      { id: 'circle', label: 'Hollow Circle', preview: '○\\n○\\n○' },
      { id: 'square', label: 'Solid Square', preview: '■\\n■\\n■' },
      { id: 'arrow', label: 'Arrow', preview: '➤\\n➤\\n➤' },
      { id: 'check', label: 'Checkmark', preview: '✓\\n✓\\n✓' },
      { id: 'diamond', label: 'Diamond', preview: '◆\\n◆\\n◆' },
      { id: 'star', label: 'Star', preview: '★\\n★\\n★' }
    ];
  } else if (type === 'numbered') {
    title = 'Numbering Library';
    items = [
      { id: 'none', label: 'None', preview: 'None' },
      { id: 'decimal', label: 'Decimal', preview: '1.\\n2.\\n3.' },
      { id: 'decimal-paren', label: 'Decimal Paren', preview: '1)\\n2)\\n3)' },
      { id: 'lower-alpha', label: 'Lower Alpha', preview: 'a.\\nb.\\nc.' },
      { id: 'upper-alpha', label: 'Upper Alpha', preview: 'A.\\nB.\\nC.' },
      { id: 'lower-roman', label: 'Lower Roman', preview: 'i.\\nii.\\niii.' },
      { id: 'upper-roman', label: 'Upper Roman', preview: 'I.\\nII.\\nIII.' },
      { id: 'padded', label: 'Padded', preview: '01.\\n02.\\n03.' }
    ];
  } else if (type === 'multilevel') {
    title = 'Multilevel Lists';
    items = [
      { id: 'none', label: 'None', preview: 'None' },
      { id: 'multi-1', label: '1. a. i.', preview: '1.\\n  a.\\n    i.' },
      { id: 'multi-2', label: '1. 1.1. 1.1.1.', preview: '1.\\n  1.1.\\n    1.1.1.' },
      { id: 'multi-3', label: 'Article', preview: 'Article I.\\n  Section 1.01\\n    (a)' },
      { id: 'multi-4', label: 'Bullets', preview: '●\\n  ○\\n    ■' },
      { id: 'multi-5', label: 'Chapters', preview: 'Chapter 1\\n  Heading 1\\n    Sub 1' }
    ];
  }

  return (
    <>
      <div className="fixed inset-0 z-[200]" onPointerDown={(e) => { e.preventDefault(); setOpen(null); }} />
      <div className="fixed z-[201] bg-white border border-slate-200/60 rounded-xl shadow-[0_12px_40px_rgb(0,0,0,0.12)] p-4 font-[system-ui] backdrop-blur-xl" style={{ top: rect.bottom + 8, left: rect.left, width: '480px' }}>
        <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3 ml-1">
          {title}
        </div>
        <div className="grid grid-cols-4 gap-3">
          {items.map((item, idx) => (
            <button key={idx} onPointerDown={(e) => { 
              e.preventDefault(); 
              window.showToast('Applied ' + item.label);
              setOpen(null); 
              document.execCommand(type === 'bullet' ? 'insertUnorderedList' : 'insertOrderedList');
            }} className="group relative flex flex-col items-center gap-2">
              <div className="h-20 w-full bg-white border border-slate-200 rounded-lg shadow-sm flex items-center justify-center p-3 group-hover:border-blue-500 group-hover:ring-1 group-hover:ring-blue-500 transition-all overflow-hidden">
                {item.id === 'none' ? (
                  <span className="font-semibold text-slate-800 tracking-tight text-[13px]">None</span>
                ) : (
                  <div className="w-full h-full flex flex-col justify-between text-[11px] font-mono text-slate-600 leading-none">
                    {item.preview.split('\\n').map((line, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <span className="text-right inline-block whitespace-pre">{line}</span>
                        <div className="h-0.5 bg-slate-200 flex-1 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
// --- END COMPOSE PICKERS ---
`;

if (!content.includes('MediaPicker = ({ isOpen, setOpen, anchorEl })')) {
  content = content.replace(/(return \(\s*<div className="flex flex-col h-screen w-full)/, galleriesCode + '\n  $1');
}

// 5. Render the Galleries in App root
if (!content.includes('<MediaPicker isOpen={mediaPickerOpen}')) {
  content = content.replace(/(<Toaster \/>)/, `$1
      <MediaPicker isOpen={mediaPickerOpen} setOpen={setMediaPickerOpen} anchorEl={document.getElementById('compose-media-btn')} />
      <EmojiGalleryPicker isOpen={composeEmojiPickerOpen} setOpen={setComposeEmojiPickerOpen} anchorEl={document.getElementById('compose-emoji-btn')} />
      <SymbolGalleryPicker isOpen={symbolsPickerOpen} setOpen={setSymbolsPickerOpen} anchorEl={document.getElementById('compose-symbols-btn')} />
      <EquationGalleryPicker isOpen={equationsPickerOpen} setOpen={setEquationsPickerOpen} anchorEl={document.getElementById('compose-equations-btn')} />
      <ListGalleryPicker isOpen={!!listGalleryOpen} type={listGalleryOpen} setOpen={setListGalleryOpen} anchorEl={document.getElementById('compose-list-btn')} />
  `);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Modified length:', content.length);
