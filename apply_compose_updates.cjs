const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(file, 'utf8');

console.log('Original length:', content.length);

// 1. Update Document State Dropdown UI
content = content.replace(
  /\{\s*key:\s*'draft',\s*label:\s*'Draft',\s*desc:\s*'Actively being written',\s*color:\s*'hover:bg-violet-50 text-violet-700'(.*?)\},\s*\{\s*key:\s*'ready',\s*label:\s*'Ready',\s*desc:\s*'Completed and ready for use',\s*color:\s*'hover:bg-emerald-50 text-emerald-700'(.*?)\},\s*\{\s*key:\s*'review',\s*label:\s*'In Review',\s*desc:\s*'Awaiting feedback',\s*color:\s*'hover:bg-blue-50 text-blue-700'(.*?)\},\s*\{\s*key:\s*'archived',\s*label:\s*'Archived',\s*desc:\s*'Stored and inactive',\s*color:\s*'hover:bg-slate-550 text-slate-600'(.*?)\}\s*\]/gs,
  `{ key: 'draft', label: 'Draft', desc: 'Actively being written', color: 'hover:bg-slate-100 text-slate-800 font-medium'$1},
                        { key: 'ready', label: 'Ready', desc: 'Completed and ready for use', color: 'hover:bg-slate-100 text-slate-800 font-medium'$2},
                        { key: 'review', label: 'In Review', desc: 'Awaiting feedback', color: 'hover:bg-slate-100 text-slate-800 font-medium'$3},
                        { key: 'archived', label: 'Archived', desc: 'Stored and inactive', color: 'hover:bg-slate-100 text-slate-500'$4}
                      ]`
);

// 2. Add state hooks for the new pickers
if (!content.includes('const [mediaPickerOpen, setMediaPickerOpen]')) {
  content = content.replace(
    /(const \[docStateDropdownOpen, setDocStateDropdownOpen\] = useState\(false\);)/,
    `$1\n  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);\n  const [composeEmojiPickerOpen, setComposeEmojiPickerOpen] = useState(false);\n  const [symbolsPickerOpen, setSymbolsPickerOpen] = useState(false);\n  const [equationsPickerOpen, setEquationsPickerOpen] = useState(false);\n  const [listGalleryOpen, setListGalleryOpen] = useState(null); // 'bullet', 'numbered', 'multilevel'`
  );
}

// 3. Add necessary lucide icons
const iconImportsMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+'lucide-react';/);
if (iconImportsMatch) {
  const currentIcons = iconImportsMatch[1];
  const newIcons = ['Film', 'Folder', 'Calculator', 'Sigma', 'SmilePlus', 'ListTree', 'Sigma as SigmaIcon', 'Pi'];
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

// 4. Create the Galleries components
const galleriesCode = `
// --- COMPOSE PICKERS & GALLERIES ---
const MediaPicker = ({ isOpen, setOpen, anchorEl }) => {
  if (!isOpen || !anchorEl) return null;
  const rect = anchorEl.getBoundingClientRect();
  return (
    <>
      <div className="fixed inset-0 z-[200]" onPointerDown={(e) => { e.preventDefault(); setOpen(false); }} />
      <div className="fixed z-[201] bg-white border border-slate-200 rounded-xl shadow-2xl p-2 w-64 text-sm" style={{ top: rect.bottom + 8, left: rect.left }}>
        <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Insert Media</div>
        {[
          { icon: <ImageIcon size={14}/>, label: 'Images', desc: 'Device uploads & AI generation' },
          { icon: <Film size={14}/>, label: 'Videos', desc: 'External URLs & recordings' },
          { icon: <Folder size={14}/>, label: 'Files', desc: 'PDFs & attachments' }
        ].map((item, idx) => (
          <button key={idx} onPointerDown={(e) => { e.preventDefault(); window.showToast('Inserted ' + item.label); setOpen(false); }} className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors text-left text-slate-700">
            <div className="mt-0.5 text-violet-500">{item.icon}</div>
            <div className="flex-1">
              <div className="font-medium text-[13px]">{item.label}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
};

const EmojiGalleryPicker = ({ isOpen, setOpen, anchorEl }) => {
  if (!isOpen || !anchorEl) return null;
  const rect = anchorEl.getBoundingClientRect();
  const emojis = ['😀', '😂', '🥰', '😎', '🤔', '🙌', '🎉', '🔥', '✨', '💡', '🚀', '⭐', '❤️', '✅', '❌', '👀'];
  return (
    <>
      <div className="fixed inset-0 z-[200]" onPointerDown={(e) => { e.preventDefault(); setOpen(false); }} />
      <div className="fixed z-[201] bg-white border border-slate-200 rounded-xl shadow-2xl p-3 w-64 text-sm" style={{ top: rect.bottom + 8, left: rect.left }}>
        <div className="flex justify-between items-center mb-2 px-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Emojis</div>
          <div className="text-[10px] text-violet-500 cursor-pointer">Search</div>
        </div>
        <div className="grid grid-cols-6 gap-1">
          {emojis.map((emoji, idx) => (
            <button key={idx} onPointerDown={(e) => { e.preventDefault(); document.execCommand('insertText', false, emoji); setOpen(false); }} className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-slate-100 text-lg transition-colors">
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

const SymbolGalleryPicker = ({ isOpen, setOpen, anchorEl }) => {
  if (!isOpen || !anchorEl) return null;
  const rect = anchorEl.getBoundingClientRect();
  const symbols = ['©', '®', '™', '€', '£', '¥', '¢', 'µ', '¶', '§', '°', '±', '×', '÷', '∞', '≈', '≠', '≤', '≥', '→', '←', '↑', '↓'];
  return (
    <>
      <div className="fixed inset-0 z-[200]" onPointerDown={(e) => { e.preventDefault(); setOpen(false); }} />
      <div className="fixed z-[201] bg-white border border-slate-200 rounded-xl shadow-2xl p-3 w-64 text-sm" style={{ top: rect.bottom + 8, left: rect.left }}>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Symbols</div>
        <div className="grid grid-cols-6 gap-1">
          {symbols.map((sym, idx) => (
            <button key={idx} onPointerDown={(e) => { e.preventDefault(); document.execCommand('insertText', false, sym); setOpen(false); }} className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-slate-100 text-sm font-medium transition-colors">
              {sym}
            </button>
          ))}
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
    { label: 'Einstein', eq: 'E = mc²' }
  ];
  return (
    <>
      <div className="fixed inset-0 z-[200]" onPointerDown={(e) => { e.preventDefault(); setOpen(false); }} />
      <div className="fixed z-[201] bg-white border border-slate-200 rounded-xl shadow-2xl p-2 w-64 text-sm" style={{ top: rect.bottom + 8, left: rect.left }}>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 pt-1">Equations</div>
        {equations.map((item, idx) => (
          <button key={idx} onPointerDown={(e) => { e.preventDefault(); document.execCommand('insertText', false, item.eq); setOpen(false); }} className="w-full flex flex-col p-2 rounded-lg hover:bg-slate-50 transition-colors text-left text-slate-700">
            <span className="text-[11px] text-slate-400">{item.label}</span>
            <span className="font-mono text-[13px] font-medium">{item.eq}</span>
          </button>
        ))}
      </div>
    </>
  );
};

const ListGalleryPicker = ({ isOpen, setOpen, anchorEl, type }) => {
  if (!isOpen || !anchorEl) return null;
  const rect = anchorEl.getBoundingClientRect();
  let items = [];
  if (type === 'bullet') {
    items = [
      { id: 'none', label: 'None', preview: 'None' },
      { id: 'disc', label: 'Solid', preview: '● ---' },
      { id: 'circle', label: 'Hollow', preview: '○ ---' },
      { id: 'square', label: 'Square', preview: '■ ---' },
      { id: 'arrow', label: 'Arrow', preview: '➤ ---' },
      { id: 'check', label: 'Check', preview: '✓ ---' }
    ];
  } else if (type === 'numbered') {
    items = [
      { id: 'none', label: 'None', preview: 'None' },
      { id: 'decimal', label: '1, 2, 3', preview: '1. ---' },
      { id: 'decimal-leading-zero', label: '01, 02, 03', preview: '01. ---' },
      { id: 'lower-alpha', label: 'a, b, c', preview: 'a. ---' },
      { id: 'upper-alpha', label: 'A, B, C', preview: 'A. ---' },
      { id: 'lower-roman', label: 'i, ii, iii', preview: 'i. ---' },
      { id: 'upper-roman', label: 'I, II, III', preview: 'I. ---' }
    ];
  } else if (type === 'multilevel') {
    items = [
      { id: 'none', label: 'None', preview: 'None' },
      { id: 'multi-1', label: '1. a. i.', preview: '1. --\\n  a. --\\n    i. --' },
      { id: 'multi-2', label: '1. 1.1. 1.1.1.', preview: '1. --\\n  1.1. --\\n    1.1.1. --' }
    ];
  }

  return (
    <>
      <div className="fixed inset-0 z-[200]" onPointerDown={(e) => { e.preventDefault(); setOpen(null); }} />
      <div className="fixed z-[201] bg-white border border-slate-200 rounded-xl shadow-2xl p-3 text-sm" style={{ top: rect.bottom + 8, left: rect.left, width: type === 'multilevel' ? '300px' : '260px' }}>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
          {type === 'bullet' ? 'Bullet Library' : type === 'numbered' ? 'Numbering Library' : 'Multilevel Lists'}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {items.map((item, idx) => (
            <button key={idx} onPointerDown={(e) => { 
              e.preventDefault(); 
              window.showToast('Applied ' + item.label + ' list style');
              setOpen(null); 
              document.execCommand(type === 'bullet' ? 'insertUnorderedList' : 'insertOrderedList');
            }} className="h-16 flex items-center justify-center rounded-lg border border-slate-200 hover:border-violet-400 hover:bg-violet-50 transition-colors bg-white overflow-hidden p-2 text-xs font-mono whitespace-pre text-left">
              {item.preview}
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

// 6. Replace Toolbar Buttons
content = content.replace(
  /<button[^>]*><List size=\{12\} \/><\/button>\s*<button[^>]*><ListOrdered size=\{12\} \/><\/button>/g,
  `<button id="compose-list-btn" onPointerDown={(e) => { e.preventDefault(); setListGalleryOpen('bullet'); }} className="p-1 hover:bg-slate-100 rounded text-slate-500 flex items-center gap-1" title="Bullet Lists"><List size={12} /><ChevronDown size={10}/></button>
   <button onPointerDown={(e) => { e.preventDefault(); setListGalleryOpen('numbered'); }} className="p-1 hover:bg-slate-100 rounded text-slate-500 flex items-center gap-1" title="Numbered Lists"><ListOrdered size={12} /><ChevronDown size={10}/></button>
   <button onPointerDown={(e) => { e.preventDefault(); setListGalleryOpen('multilevel'); }} className="p-1 hover:bg-slate-100 rounded text-slate-500 flex items-center gap-1" title="Multilevel Lists"><ListTree size={12} /><ChevronDown size={10}/></button>`
);

content = content.replace(
  /<button className="p-1 hover:bg-slate-100 rounded text-slate-500"><ImageIcon size=\{12\} \/><\/button>/g,
  `<button id="compose-media-btn" onPointerDown={(e) => { e.preventDefault(); setMediaPickerOpen(!mediaPickerOpen); }} className="p-1 hover:bg-slate-100 rounded text-slate-500 flex items-center gap-1" title="Insert Media"><ImagePlus size={12} /><ChevronDown size={10}/></button>`
);

content = content.replace(
  /<button className="p-1 hover:bg-slate-100 rounded text-slate-500"><Smile size=\{12\} \/><\/button>/g,
  `<button id="compose-emoji-btn" onPointerDown={(e) => { e.preventDefault(); setComposeEmojiPickerOpen(!composeEmojiPickerOpen); }} className="p-1 hover:bg-slate-100 rounded text-slate-500 flex items-center gap-1" title="Emoji"><SmilePlus size={12} /><ChevronDown size={10}/></button>
   <button id="compose-symbols-btn" onPointerDown={(e) => { e.preventDefault(); setSymbolsPickerOpen(!symbolsPickerOpen); }} className="p-1 hover:bg-slate-100 rounded text-slate-500 flex items-center gap-1" title="Symbols"><Pi size={12} /><ChevronDown size={10}/></button>
   <button id="compose-equations-btn" onPointerDown={(e) => { e.preventDefault(); setEquationsPickerOpen(!equationsPickerOpen); }} className="p-1 hover:bg-slate-100 rounded text-slate-500 flex items-center gap-1" title="Equations"><SigmaIcon size={12} /><ChevronDown size={10}/></button>`
);

// Second pass for possible different classname formats or toolbar versions in the 1.9MB file
content = content.replace(
  /<button[^>]*><Smile size=\{14\}\s*\/\><\/button>/g,
  `<button id="compose-emoji-btn" onPointerDown={(e) => { e.preventDefault(); setComposeEmojiPickerOpen(!composeEmojiPickerOpen); }} className="p-1 hover:bg-slate-100 rounded text-slate-500 flex items-center gap-1" title="Emoji"><SmilePlus size={14} /><ChevronDown size={10}/></button>
   <button id="compose-symbols-btn" onPointerDown={(e) => { e.preventDefault(); setSymbolsPickerOpen(!symbolsPickerOpen); }} className="p-1 hover:bg-slate-100 rounded text-slate-500 flex items-center gap-1" title="Symbols"><Pi size={14} /><ChevronDown size={10}/></button>
   <button id="compose-equations-btn" onPointerDown={(e) => { e.preventDefault(); setEquationsPickerOpen(!equationsPickerOpen); }} className="p-1 hover:bg-slate-100 rounded text-slate-500 flex items-center gap-1" title="Equations"><SigmaIcon size={14} /><ChevronDown size={10}/></button>`
);

content = content.replace(
  /<button[^>]*title="Image"[^>]*><ImageIcon size=\{14\}\s*\/\><\/button>/g,
  `<button id="compose-media-btn" onPointerDown={(e) => { e.preventDefault(); setMediaPickerOpen(!mediaPickerOpen); }} className="p-1 hover:bg-slate-100 rounded text-slate-500 flex items-center gap-1" title="Insert Media"><ImagePlus size={14} /><ChevronDown size={10}/></button>`
);

content = content.replace(
  /<button[^>]*><List size=\{14\}\s*\/\><\/button>\s*<button[^>]*><ListOrdered size=\{14\}\s*\/\><\/button>/g,
  `<button id="compose-list-btn" onPointerDown={(e) => { e.preventDefault(); setListGalleryOpen('bullet'); }} className="p-1 hover:bg-slate-100 rounded text-slate-500 flex items-center gap-1" title="Bullet Lists"><List size={14} /><ChevronDown size={10}/></button>
   <button onPointerDown={(e) => { e.preventDefault(); setListGalleryOpen('numbered'); }} className="p-1 hover:bg-slate-100 rounded text-slate-500 flex items-center gap-1" title="Numbered Lists"><ListOrdered size={14} /><ChevronDown size={10}/></button>
   <button onPointerDown={(e) => { e.preventDefault(); setListGalleryOpen('multilevel'); }} className="p-1 hover:bg-slate-100 rounded text-slate-500 flex items-center gap-1" title="Multilevel Lists"><ListTree size={14} /><ChevronDown size={10}/></button>`
);

// One more pass for size=15 because why not, we saw it in search results.
content = content.replace(
  /<button[^>]*><Smile size=\{15\}\s*\/\><\/button>/g,
  `<button id="compose-emoji-btn" onPointerDown={(e) => { e.preventDefault(); setComposeEmojiPickerOpen(!composeEmojiPickerOpen); }} className="hover:text-slate-600 flex items-center gap-1" title="Emoji"><SmilePlus size={15} /><ChevronDown size={10}/></button>
   <button id="compose-symbols-btn" onPointerDown={(e) => { e.preventDefault(); setSymbolsPickerOpen(!symbolsPickerOpen); }} className="hover:text-slate-600 flex items-center gap-1" title="Symbols"><Pi size={15} /><ChevronDown size={10}/></button>
   <button id="compose-equations-btn" onPointerDown={(e) => { e.preventDefault(); setEquationsPickerOpen(!equationsPickerOpen); }} className="hover:text-slate-600 flex items-center gap-1" title="Equations"><SigmaIcon size={15} /><ChevronDown size={10}/></button>`
);


fs.writeFileSync(file, content, 'utf8');
console.log('Modified length:', content.length);
