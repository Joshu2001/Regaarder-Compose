const fs = require('fs');

let app = fs.readFileSync('src/App.jsx', 'utf8');

const replacementCode = `
// --- COMPOSE MEDIA WORKFLOW MODALS ---

const AIGenerationModal = ({ isOpen, setOpen }) => {
  const [prompt, setPrompt] = React.useState('');
  const [generating, setGenerating] = React.useState(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setOpen(false);
      const randomSeed = Math.floor(Math.random() * 1000);
      const imgHtml = \`<img src="https://picsum.photos/seed/\${randomSeed}/800/400" style="max-width: 100%; border-radius: 8px; margin: 12px 0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" alt="AI Generated: \${prompt}" /><p><br></p>\`;
      document.execCommand('insertHTML', false, imgHtml);
    }, 2000);
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[300]" onPointerDown={() => setOpen(false)} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-[301] w-[480px] overflow-hidden flex flex-col font-[system-ui]">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <Sparkles size={18} className="text-purple-500" />
            AI Image Generation
          </div>
          <button onPointerDown={() => setOpen(false)} className="p-1 hover:bg-slate-100 rounded-md text-slate-400"><X size={16} /></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <textarea 
            autoFocus
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate in detail..."
            className="w-full resize-none h-28 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm placeholder:text-slate-400 text-slate-800"
          />
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Style</div>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button className="px-3 py-1 text-xs font-medium bg-white shadow-sm rounded-md text-slate-700">Realistic</button>
              <button className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-700">Illustration</button>
            </div>
          </div>
        </div>
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            onPointerDown={handleGenerate}
            disabled={generating || !prompt.trim()}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg shadow-sm shadow-purple-600/20 transition-all flex items-center gap-2"
          >
            {generating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles size={16} />}
            {generating ? 'Generating...' : 'Generate Image'}
          </button>
        </div>
      </div>
    </>
  );
};

const StockMediaModal = ({ isOpen, setOpen }) => {
  const [search, setSearch] = React.useState('');
  
  if (!isOpen) return null;

  const stockImages = [
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=400&q=80'
  ];

  const handleSelect = (url) => {
    const imgHtml = \`<img src="\${url}" style="max-width: 100%; border-radius: 8px; margin: 12px 0;" alt="Stock Media" /><p><br></p>\`;
    document.execCommand('insertHTML', false, imgHtml);
    setOpen(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[300]" onPointerDown={() => setOpen(false)} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-[301] w-[640px] h-[480px] overflow-hidden flex flex-col font-[system-ui]">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
          <Search size={18} className="text-slate-400" />
          <input 
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search Unsplash for high-quality photos..."
            className="flex-1 bg-transparent border-none focus:outline-none text-slate-800 text-sm placeholder:text-slate-400"
          />
          <button onPointerDown={() => setOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
          <div className="columns-2 gap-4 space-y-4">
            {stockImages.map((img, i) => (
              <div 
                key={i} 
                onPointerDown={(e) => { e.preventDefault(); handleSelect(img); }}
                className="relative group rounded-xl overflow-hidden cursor-pointer bg-slate-200 break-inside-avoid shadow-sm hover:shadow-md transition-all"
              >
                <img src={img} className="w-full h-auto block object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const ExternalMediaModal = ({ isOpen, setOpen }) => {
  const [url, setUrl] = React.useState('');

  if (!isOpen) return null;

  const handleEmbed = () => {
    if (!url.trim()) return;
    
    let embedHtml = '';
    if (url.match(/\\.(jpeg|jpg|gif|png|webp)$/i)) {
      embedHtml = \`<img src="\${url}" style="max-width: 100%; border-radius: 8px; margin: 12px 0;" alt="External Image" /><p><br></p>\`;
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('youtu.be/')[1];
      embedHtml = \`<iframe width="100%" height="400" src="https://www.youtube.com/embed/\${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius: 8px; margin: 12px 0;"></iframe><p><br></p>\`;
    } else {
      embedHtml = \`<a href="\${url}" target="_blank" contenteditable="false" style="display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; background: white; margin: 12px 0; text-decoration: none; user-select: none;">
        <div style="width: 40px; height: 40px; border-radius: 6px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #64748b;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg></div>
        <div style="flex: 1; overflow: hidden;"><div style="font-size: 14px; font-weight: 500; color: #0f172a; white-space: nowrap; text-overflow: ellipsis;">\${url}</div><div style="font-size: 12px; color: #64748b;">External Link</div></div>
      </a><p><br></p>\`;
    }
    
    document.execCommand('insertHTML', false, embedHtml);
    setOpen(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[300]" onPointerDown={() => setOpen(false)} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-[301] w-[400px] overflow-hidden flex flex-col font-[system-ui]">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <Link size={18} className="text-blue-500" />
            Embed External Media
          </div>
          <button onPointerDown={() => setOpen(false)} className="p-1 hover:bg-slate-100 rounded-md text-slate-400"><X size={16} /></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <input 
            autoFocus
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="Paste URL to image, video, or webpage..."
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm placeholder:text-slate-400 text-slate-800"
          />
        </div>
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            onPointerDown={handleEmbed}
            disabled={!url.trim()}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg shadow-sm shadow-blue-600/20 transition-all"
          >
            Embed Media
          </button>
        </div>
      </div>
    </>
  );
};

const MediaPicker = ({ isOpen, setOpen, anchorEl, mediaInsertionModal, setMediaInsertionModal }) => {
  const [activePipeline, setActivePipeline] = React.useState(null); 

  const handleDeviceUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (file.type.startsWith('image/')) {
          const imgHtml = \`<img src="\${event.target.result}" style="max-width: 100%; border-radius: 8px; margin: 12px 0;" alt="\${file.name}" />\`;
          document.execCommand('insertHTML', false, imgHtml);
        } else if (file.type.startsWith('video/')) {
          const videoHtml = \`<video src="\${event.target.result}" controls style="max-width: 100%; border-radius: 8px; margin: 12px 0;"></video><p><br></p>\`;
          document.execCommand('insertHTML', false, videoHtml);
        } else {
          const fileHtml = \`<div class="file-attachment" contenteditable="false" style="display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; margin: 12px 0; user-select: none;">
            <div style="width: 32px; height: 32px; border-radius: 6px; background: #3b82f6; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">\${file.name.split('.').pop().toUpperCase()}</div>
            <div style="flex: 1;"><div style="font-size: 14px; font-weight: 500; color: #0f172a;">\${file.name}</div><div style="font-size: 12px; color: #64748b;">\${(file.size / 1024).toFixed(1)} KB</div></div>
          </div><p><br></p>\`;
          document.execCommand('insertHTML', false, fileHtml);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePlaceholder = () => {
    const placeholderHtml = \`<div class="media-placeholder" contenteditable="false" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 32px; border: 2px dashed #cbd5e1; border-radius: 12px; background: #f8fafc; margin: 16px 0; user-select: none; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='#94a3b8'; this.style.background='#f1f5f9'; this.style.boxShadow='0 0 0 2px rgba(59, 130, 246, 0.5)';" onmouseout="this.style.borderColor='#cbd5e1'; this.style.background='#f8fafc'; this.style.boxShadow='none';">
      <div style="color: #64748b;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></div>
      <div style="font-size: 14px; font-weight: 500; color: #475569;">Media Placeholder</div>
      <div style="font-size: 12px; color: #94a3b8;">Click to replace asset</div>
    </div><p><br></p>\`;
    document.execCommand('insertHTML', false, placeholderHtml);
    setOpen(false);
    if(setMediaInsertionModal) setMediaInsertionModal({ open: false });
  };

  const isActuallyOpen = isOpen || (mediaInsertionModal && mediaInsertionModal.open);
  
  let dropdownHtml = null;
  if (isActuallyOpen && anchorEl) {
    const rect = anchorEl.getBoundingClientRect();
    const slashRange = mediaInsertionModal?.range;
    let top = rect.bottom + 8;
    let left = rect.left;
    if (mediaInsertionModal?.open && slashRange) {
        const slashRect = slashRange.getBoundingClientRect();
        top = slashRect.bottom + 8;
        left = slashRect.left;
    }
    
    dropdownHtml = (
      <>
        <div className="fixed inset-0 z-[200]" onPointerDown={(e) => { e.preventDefault(); setOpen(false); if(setMediaInsertionModal) setMediaInsertionModal({ open: false }); }} />
        <div className="fixed z-[201] bg-white border border-slate-200/60 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-1.5 w-64 text-sm font-[system-ui] backdrop-blur-xl" style={{ top, left }}>
          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400">Insert Media</div>
          {[
            { id: 'device', icon: <ImageIcon size={15} strokeWidth={1.5}/>, label: 'Device Uploads', desc: 'Photos, Videos, Files' },
            { id: 'ai', icon: <Sparkles size={15} strokeWidth={1.5} className="text-purple-500" />, label: 'AI Generation', desc: 'Generate visual assets' },
            { id: 'stock', icon: <Search size={15} strokeWidth={1.5}/>, label: 'Stock Media', desc: 'Search Unsplash & Pexels' },
            { id: 'url', icon: <Link size={15} strokeWidth={1.5}/>, label: 'External URL', desc: 'Embed from web' },
            { id: 'placeholder', icon: <ImageIcon size={15} strokeWidth={1.5} className="opacity-50"/>, label: 'Placeholder', desc: 'Add media placeholder box' },
          ].map((item, idx) => (
            <button 
              key={idx} 
              onPointerDown={(e) => { 
                e.preventDefault(); 
                if (item.id === 'placeholder') {
                  handlePlaceholder();
                } else if (item.id === 'device') {
                  document.getElementById('hidden-media-upload').click();
                  setOpen(false);
                  if(setMediaInsertionModal) setMediaInsertionModal({ open: false });
                } else {
                  setActivePipeline(item.id);
                  setOpen(false); 
                  if(setMediaInsertionModal) setMediaInsertionModal({ open: false });
                }
              }} 
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 transition-colors text-left text-slate-800"
            >
              <div className="text-slate-500">{item.icon}</div>
              <div className="flex-1">
                <div className="font-medium text-[13px] tracking-tight">{item.label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">{item.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      {dropdownHtml}
      {/* Hidden input rendered outside conditional so it is always present to receive click */}
      <input type="file" id="hidden-media-upload" onChange={handleDeviceUpload} style={{ display: 'none' }} accept="image/*,video/*,.pdf,.doc,.docx,.txt" />
      <AIGenerationModal isOpen={activePipeline === 'ai'} setOpen={(val) => !val && setActivePipeline(null)} />
      <StockMediaModal isOpen={activePipeline === 'stock'} setOpen={(val) => !val && setActivePipeline(null)} />
      <ExternalMediaModal isOpen={activePipeline === 'url'} setOpen={(val) => !val && setActivePipeline(null)} />
    </>
  );
};
`

// Regex to replace from `// --- COMPOSE MEDIA WORKFLOW MODALS ---` up to `const EmojiGalleryPicker`
const startMarker = "// --- COMPOSE MEDIA WORKFLOW MODALS ---";
const endMarker = "const EmojiGalleryPicker = ({ isOpen, setOpen, anchorEl }) => {";
const startIndex = app.indexOf(startMarker);
const endIndex = app.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  app = app.substring(0, startIndex) + replacementCode + "\n" + app.substring(endIndex);
  
  // also inject `mediaInsertionModal={mediaInsertionModal} setMediaInsertionModal={setMediaInsertionModal}`
  // into `<MediaPicker isOpen={mediaPickerOpen} setOpen={setMediaPickerOpen} anchorEl={document.getElementById('compose-media-btn')} />`
  app = app.replace(
    /<MediaPicker isOpen={mediaPickerOpen} setOpen={setMediaPickerOpen} anchorEl={document\.getElementById\('compose-media-btn'\)} \/>/g,
    "<MediaPicker isOpen={mediaPickerOpen} setOpen={setMediaPickerOpen} anchorEl={document.getElementById('compose-media-btn')} mediaInsertionModal={mediaInsertionModal} setMediaInsertionModal={setMediaInsertionModal} />"
  );
  
  fs.writeFileSync('src/App.jsx', app);
  console.log("Successfully patched MediaPicker to fix Device Uploads and Slash menu");
} else {
  console.error("Could not find boundaries to replace.");
}
