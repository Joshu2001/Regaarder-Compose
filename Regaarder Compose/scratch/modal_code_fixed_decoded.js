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
          onPointerDown={handlePoint
<truncated 9345 bytes>