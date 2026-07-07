const AttachmentPreviewModal = ({ isOpen, attachment, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  }, [attachment]);

  if (!isOpen || !attachment) return null;

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.25, 4));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.25, 0.5));
  const handleRotate = () => setRotation(r => (r + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  const handlePointerDown = (e) => {
    if (e.target.tagName === 'IMG') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handlePointerMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const isImage = attachment.isImage || (attachment.type || '').startsWith('image/');
  const isAudio = (attachment.type || '').startsWith('audio/');
  const isPdf = (attachment.type || '').includes('pdf') || (attachment.name || '').endsWith('.pdf');
  const isCsv = (attachment.type || '').includes('csv') || (attachment.name || '').endsWith('.csv');
  const isText = (attachment.type || '').startsWith('text/') || (attachment.name || '').endsWith('.txt') || (attachment.name || '').endsWith('.md') || (attachment.name || '').endsWith('.json');

  const renderContent = () => {
    if (isImage) {
      return (
        <div 
          className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <img 
            src={attachment.url} 
            alt={attachment.name} 
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain'
            }}
            className="rounded-lg shadow-lg pointer-events-none"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fb = e.currentTarget.nextSibling;
              if (fb) fb.style.style.display = 'flex';
            }}
          />
          <div className="hidden absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <AlertCircle size={48} className="text-red-500 mb-3" />
            <span className="text-sm font-semibold text-slate-200">Unable to load image preview</span>
            <span className="text-xs text-slate-400 mt-1">The image file might be corrupted or unsupported.</span>
          </div>
        </div>
      );
    }

    if (isPdf) {
      return (
        <div className="w-full h-full p-4 flex flex-col">
          <iframe 
            src={attachment.url} 
            title={attachment.name} 
            className="w-full flex-1 rounded-xl border border-slate-700 bg-slate-900 shadow-inner"
          />
        </div>
      );
    }

    if (isAudio) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-900 text-white">
          <div className="w-24 h-24 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mb-6 animate-pulse">
            <Mic size={40} className="text-violet-400" />
          </div>
          <audio 
            controls 
            autoPlay
            src={attachment.url} 
            className="w-full max-w-lg focus:outline-none" 
          />
        </div>
      );
    }

    if (isCsv) {
      const csvData = (() => {
        try {
          const text = attachment.extractedText || '';
          if (!text) return [];
          return text.split('
').map(row => {
            let cells = [];
            let inQuotes = false;
            let currentCell = '';
            for (let i = 0; i < row.length; i++) {
              const char = row[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                cells.push(currentCell.trim());
                currentCell = '';
              } else {
                currentCell += char;
              }
            }
            cells.push(currentCell.trim());
            return cells;
          }).filter(row => row.length > 0 && row.some(c => c !== ''));
        } catch (_) {
          return [];
        }
      })();

      if (csvData.length > 0) {
        return (
          <div className="w-full h-full p-6 overflow-auto bg-slate-900 text-slate-100 flex flex-col animate-fadeIn">
            <div className="flex-1 overflow-auto rounded-xl border border-slate-700 shadow-inner">
              <table className="min-w-full divide-y divide-slate-700 text-xs">
                <thead className="bg-slate-800 text-slate-300 font-semibold sticky top-0">
                  <tr>
                    {csvData[0].map((header, idx) => (
                      <th key={idx} className="px-4 py-3 text-left tracking-wider border-b border-slate-700">
                        {header || `Column ${idx + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                  {csvData.slice(1).map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-slate-800/40 transition-colors">
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className="px-4 py-2.5 whitespace-nowrap text-slate-300 border-r border-slate-800">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }
    }

    if (isText && attachment.extractedText) {
      return (
        <div className="w-full h-full p-6 bg-slate-950 text-slate-200 overflow-y-auto font-mono text-xs leading-relaxed selection:bg-violet-500/30 whitespace-pre-wrap">
          {attachment.extractedText}
        </div>
      );
    }

    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-slate-900 animate-fadeIn">
        <FileText size={56} className="text-violet-400/80 mb-4 animate-bounce" />
        <h3 className="text-sm font-bold text-slate-200">No Interactive Preview Available</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
          We support rich previews for images, PDF reader files, spreadsheet CSVs, text code layouts, and audio recordings.
        </p>
        {attachment.url && (
          <a 
            href={attachment.url} 
            download={attachment.name}
            className="mt-6 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
          >
            Download File
          </a>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/95 backdrop-blur-md flex flex-col font-sans select-none animate-fadeIn">
      <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between shrink-0 text-white bg-slate-900/50 backdrop-blur">
        <div className="flex items-center gap-3 min-w-0">
          <FileText className="text-violet-400 shrink-0" size={18} />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-100 truncate pr-4">{attachment.name}</span>
            <span className="text-[10px] text-slate-400 font-medium">
              {attachment.type || 'Unknown'} â¢ {Math.round((attachment.size || 0) / 1024)} KB
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isImage && (
            <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/50 rounded-xl p-1 text-slate-300">
              <button 
                onClick={handleZoomOut} 
                className="p-1.5 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Zoom Out"
              >
                <Minus size={14} />
              </button>
              <span className="text-[10px] font-bold px-1.5 min-w-[36px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button 
                onClick={handleZoomIn} 
                className="p-1.5 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Zoom In"
              >
                <Plus size={14} />
              </button>
              <div className="w-px h-4 bg-slate-700 mx-1" />
              <button 
                onClick={handleRotate} 
                className="p-1.5 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Rotate 90Â°"
              >
                <RotateCw size={14} />
              </button>
              <button 
                onClick={handleReset} 
                className="p-1.5 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Reset Viewport"
              >
                <RefreshCcw size={14} />
              </button>
            </div>
          )}

          {attachment.url && (
            <a 
              href={attachment.url} 
              download={attachment.name}
              className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-xl transition-all shadow-sm flex items-center justify-center"
              title="Download File"
            >
              <ArrowDownToLine size={14} />
            </a>
          )}

          <button 
            type="button"
            onClick={onClose}
            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer"
            title="Close Preview"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative bg-slate-950 flex items-center justify-center">
        {renderContent()}
      </div>
    </div>
  );
};

const SavedDocsPickerModal = ({ isOpen, setOpen, onSelectDoc }) => {