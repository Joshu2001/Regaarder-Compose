const fs = require('fs');

let app = fs.readFileSync('src/App.jsx', 'utf8');

const replacementCode = `
// --- COMPOSE MEDIA WORKFLOW MODALS ---

const UnifiedMediaModal = ({ isOpen, setOpen, mediaInsertionModal, setMediaInsertionModal }) => {
  const [activeTab, setActiveTab] = React.useState('device'); // 'device', 'ai', 'stock', 'url', 'placeholder'
  const [aiPrompt, setAiPrompt] = React.useState('');
  const [generating, setGenerating] = React.useState(false);
  const [stockSearch, setStockSearch] = React.useState('');
  const [externalUrl, setExternalUrl] = React.useState('');

  const isActuallyOpen = isOpen || (mediaInsertionModal && mediaInsertionModal.open);
  
  if (!isActuallyOpen) return null;

  const closeAll = () => {
    setOpen(false);
    if(setMediaInsertionModal) setMediaInsertionModal({ open: false });
  };

  const insertHtmlAndClose = (html) => {
    document.execCommand('insertHTML', false, html);
    closeAll();
  };

  const handleDeviceUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (file.type.startsWith('image/')) {
          insertHtmlAndClose(\`<img src="\${event.target.result}" style="max-width: 100%; border-radius: 8px; margin: 12px 0;" alt="\${file.name}" />\`);
        } else if (file.type.startsWith('video/')) {
          insertHtmlAndClose(\`<video src="\${event.target.result}" controls style="max-width: 100%; border-radius: 8px; margin: 12px 0;"></video><p><br></p>\`);
        } else {
          insertHtmlAndClose(\`<div class="file-attachment" contenteditable="false" style="display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; margin: 12px 0; user-select: none;">
            <div style="width: 32px; height: 32px; border-radius: 6px; background: #3b82f6; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">\${file.name.split('.').pop().toUpperCase()}</div>
            <div style="flex: 1;"><div style="font-size: 14px; font-weight: 500; color: #0f172a;">\${file.name}</div><div style="font-size: 12px; color: #64748b;">\${(file.size / 1024).toFixed(1)} KB</div></div>
          </div><p><br></p>\`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateAI = () => {
    if (!aiPrompt.trim()) return;
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      const randomSeed = Math.floor(Math.random() * 1000);
      insertHtmlAndClose(\`<img src="https://picsum.photos/seed/\${randomSeed}/800/400" style="max-width: 100%; border-radius: 8px; margin: 12px 0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" alt="AI Generated: \${aiPrompt}" /><p><br></p>\`);
    }, 2000);
  };

  const handleEmbedUrl = () => {
    if (!externalUrl.trim()) return;
    let embedHtml = '';
    const url = externalUrl;
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
    insertHtmlAndClose(embedHtml);
  };

  const handlePlaceholder = () => {
    insertHtmlAndClose(\`<div class="media-placeholder" contenteditable="false" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 32px; border: 2px dashed #cbd5e1; border-radius: 12px; background: #f8fafc; margin: 16px 0; user-select: none; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='#94a3b8'; this.style.background='#f1f5f9'; this.style.boxShadow='0 0 0 2px rgba(59, 130, 246, 0.5)';" onmouseout="this.style.borderColor='#cbd5e1'; this.style.background='#f8fafc'; this.style.boxShadow='none';">
      <div style="color: #64748b;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></div>
      <div style="font-size: 14px; font-weight: 500; color: #475569;">Media Placeholder</div>
      <div style="font-size: 12px; color: #94a3b8;">Click to replace asset</div>
    </div><p><br></p>\`);
  };

  const stockImages = [
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=400&q=80'
  ];

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[99998]" onPointerDown={closeAll} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-[99999] w-[700px] h-[500px] overflow-hidden flex font-[system-ui]">
        {/* Sidebar */}
        <div className="w-48 bg-slate-50 border-r border-slate-200 flex flex-col py-4 gap-1 px-2">
          <div className="px-3 pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Insert Media</div>
          {[
            { id: 'device', icon: <ImageIcon size={16} />, label: 'Upload' },
            { id: 'ai', icon: <Sparkles size={16} className={activeTab === 'ai' ? "text-purple-600" : ""} />, label: 'AI Generation' },
            { id: 'stock', icon: <Search size={16} />, label: 'Stock Images' },
            { id: 'url', icon: <Link size={16} />, label: 'Embed URL' },
            { id: 'placeholder', icon: <ImageIcon size={16} className="opacity-50" />, label: 'Placeholder' }
          ].map(tab => (
            <button
              key={tab.id}
              onPointerDown={(e) => { e.preventDefault(); setActiveTab(tab.id); }}
              className={\`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors \${activeTab === tab.id ? 'bg-white shadow-sm text-slate-900 border border-slate-200/60' : 'text-slate-600 hover:bg-slate-100/60'}\`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Content Area */}
        <div className="flex-1 flex flex-col bg-white relative">
          <button onPointerDown={closeAll} className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-md text-slate-400 z-10"><X size={16} /></button>
          
          {activeTab === 'device' && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                <Upload size={28} />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Upload Media or Files</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-sm">Select photos, videos, or documents from your computer to insert into the editor.</p>
              <label className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm shadow-blue-600/20 transition-all cursor-pointer">
                Choose File
                <input type="file" className="hidden" onChange={handleDeviceUpload} accept="image/*,video/*,.pdf,.doc,.docx,.txt" />
              </label>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="flex-1 flex flex-col p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 leading-tight">AI Image Generation</h3>
                  <p className="text-xs text-slate-500">Describe what you want to see.</p>
                </div>
              </div>
              <textarea 
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="A futuristic city skyline at sunset with flying cars..."
                className="w-full flex-1 resize-none p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm placeholder:text-slate-400 text-slate-800 mb-6"
              />
              <div className="flex justify-end">
                <button 
                  onPointerDown={handleGenerateAI}
                  disabled={generating || !aiPrompt.trim()}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg shadow-sm shadow-purple-600/20 transition-all flex items-center gap-2"
                >
                  {generating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles size={16} />}
                  {generating ? 'Generating...' : 'Generate Image'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'stock' && (
            <div className="flex-1 flex flex-col h-full">
              <div className="p-6 pb-4 border-b border-slate-100">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    value={stockSearch}
                    onChange={e => setStockSearch(e.target.value)}
                    placeholder="Search high-quality stock photos..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm placeholder:text-slate-400 text-slate-800"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 pt-2 bg-slate-50/50">
                <div className="columns-2 gap-4 space-y-4">
                  {stockImages.map((img, i) => (
                    <div 
                      key={i} 
                      onPointerDown={(e) => { e.preventDefault(); insertHtmlAndClose(\`<img src="\${img}" style="max-width: 100%; border-radius: 8px; margin: 12px 0;" alt="Stock Media" /><p><br></p>\`); }}
                      className="relative group rounded-xl overflow-hidden cursor-pointer bg-slate-200 break-inside-avoid shadow-sm hover:shadow-md transition-all"
                    >
                      <img src={img} className="w-full h-auto block object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'url' && (
            <div className="flex-1 flex flex-col p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                  <Link size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 leading-tight">Embed External Media</h3>
                  <p className="text-xs text-slate-500">Paste a link to an image, YouTube video, or website.</p>
                </div>
              </div>
              <input 
                value={externalUrl}
                onChange={e => setExternalUrl(e.target.value)}
                placeholder="https://..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm placeholder:text-slate-400 text-slate-800 mb-auto"
              />
              <div className="flex justify-end mt-6">
                <button 
                  onPointerDown={handleEmbedUrl}
                  disabled={!externalUrl.trim()}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg shadow-sm shadow-blue-600/20 transition-all"
                >
                  Embed
                </button>
              </div>
            </div>
          )}

          {activeTab === 'placeholder' && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                <ImageIcon size={28} />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Insert Placeholder</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-sm">Add a dynamic placeholder box to the document. You can click it later to replace it with a real asset.</p>
              <button 
                onPointerDown={(e) => { e.preventDefault(); handlePlaceholder(); }}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-lg shadow-sm transition-all"
              >
                Insert Placeholder
              </button>
            </div>
          )}

        </div>
      </div>
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
  
  // Replace references of MediaPicker with UnifiedMediaModal
  app = app.replace(
    /<MediaPicker isOpen=\{mediaPickerOpen\}/g,
    "<UnifiedMediaModal isOpen={mediaPickerOpen}"
  );
  
  fs.writeFileSync('src/App.jsx', app);
  console.log("Successfully replaced MediaPicker with UnifiedMediaModal");
} else {
  console.error("Could not find boundaries to replace.");
}
