const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { Sparkles, X, Search, Link, ImageIcon } = require('lucide-react');

global.document = {
  execCommand: () => {},
  getElementById: () => ({ getBoundingClientRect: () => ({ top: 10, left: 10, bottom: 20, right: 20 }) })
};

const AIGenerationModal = () => React.createElement('div', null, "AI");
const StockMediaModal = () => React.createElement('div', null, "Stock");
const ExternalMediaModal = () => React.createElement('div', null, "External");

const MediaPicker = ({ isOpen, setOpen, anchorEl, mediaInsertionModal, setMediaInsertionModal }) => {
  const [activePipeline, setActivePipeline] = React.useState(null); 

  const handleDeviceUpload = (e) => {};
  const handlePlaceholder = () => {};

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
    
    dropdownHtml = React.createElement('div', null,
      [
        { id: 'device', icon: React.createElement(ImageIcon, {size:15, strokeWidth:1.5}), label: 'Device Uploads', desc: 'Photos, Videos, Files' },
        { id: 'ai', icon: React.createElement(Sparkles, {size:15, strokeWidth:1.5, className:"text-purple-500"}), label: 'AI Generation', desc: 'Generate visual assets' },
        { id: 'stock', icon: React.createElement(Search, {size:15, strokeWidth:1.5}), label: 'Stock Media', desc: 'Search Unsplash & Pexels' },
        { id: 'url', icon: React.createElement(Link, {size:15, strokeWidth:1.5}), label: 'External URL', desc: 'Embed from web' },
        { id: 'placeholder', icon: React.createElement(ImageIcon, {size:15, strokeWidth:1.5, className:"opacity-50"}), label: 'Placeholder', desc: 'Add media placeholder box' },
      ].map((item, idx) => {
        if (item.id === 'device') {
          return React.createElement('label', { key: idx, htmlFor: 'hidden-media-upload' }, "Device");
        }
        return React.createElement('button', { key: idx }, item.label);
      })
    );
  }

  return React.createElement(React.Fragment, null,
    dropdownHtml,
    React.createElement('input', { type: 'file', id: 'hidden-media-upload', onChange: handleDeviceUpload, style: { display: 'none' }, accept: 'image/*,video/*,.pdf,.doc,.docx,.txt' }),
    React.createElement(AIGenerationModal, { isOpen: activePipeline === 'ai', setOpen: (val) => !val && setActivePipeline(null) }),
    React.createElement(StockMediaModal, { isOpen: activePipeline === 'stock', setOpen: (val) => !val && setActivePipeline(null) }),
    React.createElement(ExternalMediaModal, { isOpen: activePipeline === 'url', setOpen: (val) => !val && setActivePipeline(null) })
  );
};

try {
  console.log(ReactDOMServer.renderToString(React.createElement(MediaPicker, { isOpen: true, setOpen: () => {}, anchorEl: document.getElementById('x') })));
} catch (e) {
  console.error("RENDER ERROR:", e);
}
