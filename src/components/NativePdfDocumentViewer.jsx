import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import * as pdfjs from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { 
  FileText, 
  Loader2, 
  AlertCircle, 
  Pen, 
  Highlighter, 
  Eraser, 
  Undo2, 
  Trash2,
  GripVertical,
  X,
  Layout,
  ChevronLeft,
  ChevronRight,
  Move
} from 'lucide-react';

if (!pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

const MARKUP_COLORS = [
  { id: 'slate', hex: '#1E293B', label: 'Ink Slate' },
  { id: 'crimson', hex: '#EF4444', label: 'Crimson Red' },
  { id: 'blue', hex: '#3B82F6', label: 'Electric Blue' },
  { id: 'green', hex: '#10B981', label: 'Emerald Green' },
  { id: 'amber', hex: '#F59E0B', label: 'Amber Gold' },
  { id: 'violet', hex: '#8B5CF6', label: 'Royal Violet' },
];

/**
 * Redraw all recorded strokes for a page onto its markup canvas
 */
function redrawPageStrokes(ctx, strokes, width, height) {
  if (!ctx || !width || !height) return;
  ctx.clearRect(0, 0, width, height);

  for (const stroke of strokes) {
    if (!stroke.points || stroke.points.length < 2) continue;

    ctx.save();
    if (stroke.tool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else if (stroke.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    ctx.beginPath();
    const first = stroke.points[0];
    ctx.moveTo(first.x * width, first.y * height);

    for (let i = 1; i < stroke.points.length; i++) {
      const pt = stroke.points[i];
      ctx.lineTo(pt.x * width, pt.y * height);
    }

    ctx.stroke();
    ctx.restore();
  }
}

/**
 * Fast Miniature Thumbnail Canvas for Sidebar
 */
/**
 * Fast Miniature Thumbnail Canvas for Sidebar with Interactive WPS-Style Viewport Indicator
 */
function PdfThumbnailCanvas({ 
  pdf, 
  pageNumber, 
  rotation = 0,
  isActive = false,
  viewportCoverage = null, // { topRatio: 0..1, heightRatio: 0..1 }
  onViewportPan, // (newTopRatio: 0..1) => void
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isRendered, setIsRendered] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(1 / 1.294); // default standard ratio
  const isDraggingViewportRef = useRef(false);
  const dragStartYRef = useRef(0);
  const dragStartTopRef = useRef(0);

  useEffect(() => {
    let isCancelled = false;
    const renderThumb = async () => {
      if (!pdf || !canvasRef.current) return;
      try {
        const page = await pdf.getPage(pageNumber);
        if (isCancelled) return;
        const viewport = page.getViewport({ scale: 1, rotation });
        if (viewport.width && viewport.height) {
          setAspectRatio(viewport.width / viewport.height);
        }
        const thumbWidth = 180;
        const scale = thumbWidth / viewport.width;
        const thumbViewport = page.getViewport({ scale, rotation });
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        canvas.width = Math.floor(thumbViewport.width);
        canvas.height = Math.floor(thumbViewport.height);
        canvas.style.width = '100%';
        canvas.style.height = 'auto';

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({ canvasContext: ctx, viewport: thumbViewport }).promise;
        if (!isCancelled) setIsRendered(true);
      } catch (_) {}
    };
    renderThumb();
    return () => { isCancelled = true; };
  }, [pdf, pageNumber, rotation]);

  // Handle interactive dragging of the viewport highlight box to pan the main editor
  const handleViewportPointerDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    isDraggingViewportRef.current = true;
    dragStartYRef.current = e.clientY;
    dragStartTopRef.current = viewportCoverage?.topRatio || 0;

    const handlePointerMove = (ev) => {
      if (!isDraggingViewportRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const deltaY = ev.clientY - dragStartYRef.current;
      const deltaRatio = deltaY / (rect.height || 1);
      const newTop = Math.max(0, Math.min(1 - (viewportCoverage?.heightRatio || 0.2), dragStartTopRef.current + deltaRatio));
      onViewportPan?.(newTop);
    };

    const handlePointerUp = () => {
      isDraggingViewportRef.current = false;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const topPercent = Math.max(0, Math.min(100, (viewportCoverage?.topRatio || 0) * 100));
  const heightPercent = Math.max(12, Math.min(100, (viewportCoverage?.heightRatio || 0.4) * 100));

  return (
    <div 
      ref={containerRef}
      style={{ aspectRatio: `${aspectRatio}` }}
      className="w-full relative bg-white dark:bg-zinc-800 rounded-sm overflow-hidden flex items-center justify-center shadow-xs border border-slate-200/80 dark:border-zinc-700/60"
    >
      <canvas ref={canvasRef} className="w-full h-auto block shadow-2xs pointer-events-none" />
      
      {!isRendered && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-zinc-800">
          <Loader2 size={12} className="animate-spin text-slate-400" />
        </div>
      )}

      {/* Regaarder Purple Interactive Viewport Indicator Box */}
      {isActive && viewportCoverage && isRendered && (
        <div
          onPointerDown={handleViewportPointerDown}
          className="absolute left-0 right-0 z-20 cursor-grab active:cursor-grabbing border-2 border-violet-500 bg-violet-500/15 transition-none select-none shadow-[0_0_8px_rgba(139,92,246,0.3)]"
          style={{
            top: `${topPercent}%`,
            height: `${heightPercent}%`,
          }}
          title="Drag to scroll document"
        >
          {/* Subtle drag bar indicator */}
          <div className="w-full h-0.5 bg-violet-500/60 absolute top-0" />
          <div className="w-full h-0.5 bg-violet-500/60 absolute bottom-0" />
        </div>
      )}
    </div>
  );
}

/**
 * High-DPI Vector Page Canvas
 * Renders an individual PDF page onto an HTML5 canvas matched to devicePixelRatio & zoomLevel.
 */
function PdfPageCanvas({
  pdf,
  pageNumber,
  zoomLevel = 100,
  rotation = 0,
  pageMaxWidth = 816,
  markupActive = false,
  toolMode = 'pen',
  activeColor = '#EF4444',
  strokes = [],
  onAddStroke,
  onSetActivePage,
}) {
  const canvasRef = useRef(null);
  const markupCanvasRef = useRef(null);
  const renderTaskRef = useRef(null);
  const [pageSize, setPageSize] = useState({ width: pageMaxWidth, height: pageMaxWidth * 1.294 });
  const [isRendering, setIsRendering] = useState(true);
  const [renderError, setRenderError] = useState(null);

  // Active stroke being drawn
  const isDrawingRef = useRef(false);
  const currentPointsRef = useRef([]);

  // Render PDF Page at High-DPI Vector Resolution
  useEffect(() => {
    let isCancelled = false;

    const renderPage = async () => {
      if (!pdf || !canvasRef.current) return;
      setIsRendering(true);
      setRenderError(null);

      try {
        const page = await pdf.getPage(pageNumber);
        if (isCancelled) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        // Cancel previous render task if active
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {}
        }

        // Get natural unscaled viewport for the page
        const naturalViewport = page.getViewport({ scale: 1, rotation });
        const naturalAspect = naturalViewport.width / naturalViewport.height;
        const targetWidth = pageMaxWidth || 816;
        const pageCssHeight = Math.round(targetWidth / naturalAspect);
        
        setPageSize({ width: targetWidth, height: pageCssHeight, aspect: naturalAspect });

        // High-DPI scaling: combine retina devicePixelRatio (min 2x) with zoom scale
        const dpr = Math.max(window.devicePixelRatio || 1, 2);
        const zoomScaleFactor = Math.max(0.5, Math.min(3, zoomLevel / 100));
        const baseScale = targetWidth / naturalViewport.width;
        const finalRenderScale = baseScale * dpr * zoomScaleFactor;

        const renderViewport = page.getViewport({ scale: finalRenderScale, rotation });

        // Set backing canvas pixel buffer to exact high-resolution
        canvas.width = Math.floor(renderViewport.width);
        canvas.height = Math.floor(renderViewport.height);

        // Set CSS display layout dimensions strictly matched to proportional height
        canvas.style.width = `${targetWidth}px`;
        canvas.style.height = `${pageCssHeight}px`;

        // Sync markup canvas dimensions
        if (markupCanvasRef.current) {
          markupCanvasRef.current.width = Math.floor(renderViewport.width);
          markupCanvasRef.current.height = Math.floor(renderViewport.height);
          markupCanvasRef.current.style.width = `${targetWidth}px`;
          markupCanvasRef.current.style.height = `${pageCssHeight}px`;

          const mCtx = markupCanvasRef.current.getContext('2d');
          if (mCtx) {
            redrawPageStrokes(mCtx, strokes, markupCanvasRef.current.width, markupCanvasRef.current.height);
          }
        }

        // White paper background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const renderContext = {
          canvasContext: ctx,
          viewport: renderViewport,
          intent: 'display',
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;

        if (!isCancelled) {
          setIsRendering(false);
        }
      } catch (err) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error(`PDF page ${pageNumber} render error:`, err);
          if (!isCancelled) {
            setRenderError(err.message || 'Failed to render page');
            setIsRendering(false);
          }
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }
    };
  }, [pdf, pageNumber, zoomLevel, rotation, pageMaxWidth]);

  // Redraw strokes whenever page strokes array updates (e.g., on Undo or Clear)
  useEffect(() => {
    if (markupCanvasRef.current) {
      const mCtx = markupCanvasRef.current.getContext('2d');
      if (mCtx) {
        redrawPageStrokes(mCtx, strokes, markupCanvasRef.current.width, markupCanvasRef.current.height);
      }
    }
  }, [strokes]);

  // Pointer drawing handlers
  const handlePointerDown = (e) => {
    if (!markupActive || !markupCanvasRef.current) return;
    onSetActivePage?.(pageNumber);

    const canvas = markupCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const normX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const normY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    isDrawingRef.current = true;
    currentPointsRef.current = [{ x: normX, y: normY }];

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    const pixelWidth = toolMode === 'highlighter' ? 24 : toolMode === 'eraser' ? 26 : 3;
    const dpr = Math.max(window.devicePixelRatio || 1, 2);

    if (toolMode === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = pixelWidth * dpr;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else if (toolMode === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = pixelWidth * dpr;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = pixelWidth * dpr;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    ctx.beginPath();
    ctx.moveTo(normX * canvas.width, normY * canvas.height);
  };

  const handlePointerMove = (e) => {
    if (!isDrawingRef.current || !markupCanvasRef.current) return;
    const canvas = markupCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const normX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const normY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    currentPointsRef.current.push({ x: normX, y: normY });

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(normX * canvas.width, normY * canvas.height);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (markupCanvasRef.current) {
      const ctx = markupCanvasRef.current.getContext('2d');
      if (ctx) ctx.restore();
    }

    if (currentPointsRef.current.length > 1) {
      const dpr = Math.max(window.devicePixelRatio || 1, 2);
      const pixelWidth = toolMode === 'highlighter' ? 24 : toolMode === 'eraser' ? 26 : 3;
      
      onAddStroke?.(pageNumber, {
        tool: toolMode,
        color: activeColor,
        width: pixelWidth * dpr,
        points: [...currentPointsRef.current],
      });
    }

    currentPointsRef.current = [];
  };

  return (
    <div
      className="relative w-full select-none"
      style={{ minHeight: `${pageSize.height}px` }}
      onPointerEnter={() => onSetActivePage?.(pageNumber)}
    >
      {/* High-DPI Vector Page Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full block"
        style={{ display: 'block' }}
      />

      {/* Markup / Annotation Transparent Overlay */}
      {markupActive && (
        <canvas
          ref={markupCanvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className={`absolute inset-0 z-20 touch-none ${
            toolMode === 'eraser' 
              ? 'cursor-cell' 
              : toolMode === 'highlighter' 
              ? 'cursor-text' 
              : 'cursor-crosshair'
          }`}
          style={{ display: 'block' }}
        />
      )}

      {/* Loading Skeleton */}
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-zinc-900/60 backdrop-blur-[1px] transition-opacity duration-200">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-zinc-900/90 shadow-sm border border-slate-200/60 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400">
            <Loader2 size={13} className="animate-spin text-violet-600" />
            <span>Rendering Vector Page {pageNumber}...</span>
          </div>
        </div>
      )}

      {/* Render Error Notice */}
      {renderError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-50/90 dark:bg-rose-950/40 p-6 text-center text-xs text-rose-600 dark:text-rose-400">
          <AlertCircle size={20} className="mb-1" />
          <span>Page {pageNumber} failed to render: {renderError}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Sticky Floating Annotation Dock
 * Positioned in viewport space above the document canvas.
 * Remains accessible across all pages as the user scrolls without drifting.
 */
function StickyAnnotationDock({
  toolMode,
  setToolMode,
  activeColor,
  setActiveColor,
  canUndo,
  onUndo,
  canClear,
  onClear,
  activePageNumber,
  numPages,
  onClose,
  zoomLevel = 100,
  pageOrientation = 'portrait',
  docPageSize = 'letter',
}) {
  const [dockPos, setDockPos] = useState({ top: 136, left: typeof window !== 'undefined' ? window.innerWidth / 2 : 500 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragOriginRef = useRef({ startX: 0, startY: 0, initOffsetX: 0, initOffsetY: 0 });

  // Dynamically calculate horizontal and vertical viewport anchoring
  useEffect(() => {
    const updatePosition = () => {
      const scrollContainer = document.querySelector('.editor-auto-dim-scrollbar') || document.querySelector('.overflow-y-auto');
      const pageEl = document.querySelector('[data-enterprise-page="true"]');

      if (scrollContainer) {
        const sRect = scrollContainer.getBoundingClientRect();
        // Place comfortably below the Compose subtoolbar/header
        const top = Math.max(120, Math.min(window.innerHeight - 80, sRect.top + 16));

        let centerX = sRect.left + sRect.width / 2;
        if (pageEl) {
          const pRect = pageEl.getBoundingClientRect();
          centerX = pRect.left + pRect.width / 2;
        }

        setDockPos({ top, left: centerX });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [zoomLevel, pageOrientation, docPageSize]);

  // Pointer drag handler for moving the dock if the user wants it elsewhere
  const handleDragPointerDown = (e) => {
    e.stopPropagation();
    isDraggingRef.current = true;
    dragOriginRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initOffsetX: dragOffset.x,
      initOffsetY: dragOffset.y,
    };

    const handlePointerMove = (ev) => {
      if (!isDraggingRef.current) return;
      const dx = ev.clientX - dragOriginRef.current.startX;
      const dy = ev.clientY - dragOriginRef.current.startY;
      setDragOffset({
        x: dragOriginRef.current.initOffsetX + dx,
        y: dragOriginRef.current.initOffsetY + dy,
      });
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: `${dockPos.top + dragOffset.y}px`,
        left: `${dockPos.left + dragOffset.x}px`,
        transform: 'translateX(-50%)',
        zIndex: 9999,
      }}
      className="pointer-events-none animate-in fade-in slide-in-from-top-2 duration-150"
    >
      <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.18)] border border-black/[0.08] dark:border-white/[0.1] text-xs select-none">
        
        {/* Grip Drag Handle */}
        <div
          onPointerDown={handleDragPointerDown}
          className="p-1 -ml-1 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 cursor-grab active:cursor-grabbing rounded-md transition-colors"
          title="Drag to reposition toolbar"
        >
          <GripVertical size={13} />
        </div>

        {/* Pen Tool */}
        <button
          type="button"
          onClick={() => setToolMode('pen')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            toolMode === 'pen'
              ? 'bg-violet-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.08]'
          }`}
          title="Pen Tool (Solid Ink)"
        >
          <Pen size={12} />
          <span>Pen</span>
        </button>

        {/* Highlighter Tool */}
        <button
          type="button"
          onClick={() => setToolMode('highlighter')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            toolMode === 'highlighter'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.08]'
          }`}
          title="Highlighter Tool (Translucent Ink)"
        >
          <Highlighter size={12} />
          <span>Highlight</span>
        </button>

        <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-0.5" />

        {/* Color Palette Dots */}
        <div className="flex items-center gap-1.5 px-1">
          {MARKUP_COLORS.map((c) => {
            const isSelected = activeColor === c.hex && toolMode !== 'eraser';
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setActiveColor(c.hex);
                  if (toolMode === 'eraser') {
                    setToolMode('pen');
                  }
                }}
                className={`w-4 h-4 rounded-full transition-transform cursor-pointer relative ${
                  isSelected 
                    ? 'scale-125 ring-2 ring-offset-2 ring-violet-500 shadow-xs' 
                    : 'hover:scale-110 opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.label}
              />
            );
          })}
        </div>

        <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-0.5" />

        {/* Eraser Tool */}
        <button
          type="button"
          onClick={() => setToolMode('eraser')}
          className={`p-1.5 rounded-full transition-all cursor-pointer ${
            toolMode === 'eraser'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.08]'
          }`}
          title="Eraser Tool"
        >
          <Eraser size={13} />
        </button>

        {/* Undo Button */}
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-1.5 rounded-full transition-all ${
            canUndo
              ? 'text-slate-600 dark:text-zinc-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] cursor-pointer'
              : 'text-slate-300 dark:text-zinc-600 cursor-not-allowed opacity-40'
          }`}
          title="Undo Last Stroke"
        >
          <Undo2 size={13} />
        </button>

        {/* Clear Page Marks */}
        <button
          type="button"
          onClick={onClear}
          disabled={!canClear}
          className={`p-1.5 rounded-full transition-all ${
            canClear
              ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer'
              : 'text-slate-300 dark:text-zinc-600 cursor-not-allowed opacity-40'
          }`}
          title={`Clear Marks on Page ${activePageNumber}`}
        >
          <Trash2 size={13} />
        </button>

        {/* Active Page Indicator */}
        {numPages > 1 && (
          <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 px-1 border-l border-black/10 dark:border-white/10 pl-2">
            P.{activePageNumber} / {numPages}
          </span>
        )}

        {/* Dismiss Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer ml-0.5"
            title="Close Markup Tools"
          >
            <X size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Native PDF Document Viewer Component
 * Multi-page executive presentation matching Regaarder Compose white paper specifications.
 */
export default function NativePdfDocumentViewer({
  pdfBlobUrl,
  rawBlob,
  title,
  zoomLevel = 100,
  rotation = 0,
  pageOrientation = 'portrait',
  docPageSize = 'letter',
  markupActive = false,
  onCloseMarkup,
  isDarkMode = false,
}) {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Global Markup & Annotation Tool State
  const [toolMode, setToolMode] = useState('pen'); // 'pen' | 'highlighter' | 'eraser'
  const [activeColor, setActiveColor] = useState('#EF4444');
  const [pageStrokes, setPageStrokes] = useState({}); // { [pageNumber]: Array<Stroke> }
  const [activePageNumber, setActivePageNumber] = useState(1);

  // Page ordering state (enables WPS-style thumbnail drag and drop reordering)
  const [pageOrder, setPageOrder] = useState([]);
  const [isThumbSidebarOpen, setIsThumbSidebarOpen] = useState(true);
  const [draggedThumbIndex, setDraggedThumbIndex] = useState(null);
  const [viewportCoverage, setViewportCoverage] = useState({ topRatio: 0, heightRatio: 0.5 });

  useEffect(() => {
    if (numPages > 0) {
      setPageOrder(Array.from({ length: numPages }, (_, i) => i + 1));
    }
  }, [numPages]);

  // Dynamic header offset & Fullscreen detection
  const [isFullscreenActive, setIsFullscreenActive] = useState(false);
  const [portalNode, setPortalNode] = useState(typeof document !== 'undefined' ? (document.fullscreenElement ?? document.body) : null);
  const [sidebarTop, setSidebarTop] = useState(112);

  useEffect(() => {
    const updateLayoutMetrics = () => {
      const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
      const isFs = !!fsEl;
      setIsFullscreenActive(isFs);
      setPortalNode(fsEl ?? document.body);

      // In fullscreen, if the top navigation/toolbar is hidden, top is 0; otherwise compute from editor container top
      const scrollContainer = document.querySelector('.editor-auto-dim-scrollbar');
      if (scrollContainer) {
        const rect = scrollContainer.getBoundingClientRect();
        setSidebarTop(Math.max(0, Math.round(rect.top)));
      } else {
        setSidebarTop(isFs ? 0 : 112);
      }
    };

    document.addEventListener('fullscreenchange', updateLayoutMetrics);
    document.addEventListener('webkitfullscreenchange', updateLayoutMetrics);
    document.addEventListener('mozfullscreenchange', updateLayoutMetrics);
    document.addEventListener('MSFullscreenChange', updateLayoutMetrics);
    window.addEventListener('resize', updateLayoutMetrics);

    updateLayoutMetrics();

    return () => {
      document.removeEventListener('fullscreenchange', updateLayoutMetrics);
      document.removeEventListener('webkitfullscreenchange', updateLayoutMetrics);
      document.removeEventListener('mozfullscreenchange', updateLayoutMetrics);
      document.removeEventListener('MSFullscreenChange', updateLayoutMetrics);
      window.removeEventListener('resize', updateLayoutMetrics);
    };
  }, []);

  // Track active page viewport coverage ratio in real-time as user scrolls editor
  useEffect(() => {
    const scrollContainer = document.querySelector('.editor-auto-dim-scrollbar') || window;

    const calculateCoverage = () => {
      const activeEl = document.querySelector(`[data-pdf-page-number="${activePageNumber}"]`);
      if (!activeEl) return;

      const pRect = activeEl.getBoundingClientRect();
      const cRect = scrollContainer === window 
        ? { top: 0, bottom: window.innerHeight, height: window.innerHeight }
        : scrollContainer.getBoundingClientRect();

      const visibleTop = Math.max(pRect.top, cRect.top);
      const visibleBottom = Math.min(pRect.bottom, cRect.bottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);

      if (pRect.height > 0) {
        const topOffset = Math.max(0, cRect.top - pRect.top);
        const topRatio = Math.min(1, Math.max(0, topOffset / pRect.height));
        const heightRatio = Math.min(1, Math.max(0.12, visibleHeight / pRect.height));
        setViewportCoverage({ topRatio, heightRatio });
      }
    };

    calculateCoverage();
    const target = scrollContainer === window ? window : scrollContainer;
    target.addEventListener('scroll', calculateCoverage, { passive: true });
    window.addEventListener('resize', calculateCoverage, { passive: true });

    return () => {
      target.removeEventListener('scroll', calculateCoverage);
      window.removeEventListener('resize', calculateCoverage);
    };
  }, [activePageNumber, isLoading, loadError]);

  // Calculate paper max-width matching Compose standards
  const pageMaxWidth = pageOrientation === 'landscape'
    ? (docPageSize === 'letter' ? 1056 : docPageSize === 'legal' ? 1296 : 1123)
    : (docPageSize === 'letter' ? 816 : docPageSize === 'legal' ? 816 : 800);

  // Load PDF Document asynchronously via pdfjs-dist
  useEffect(() => {
    let isCancelled = false;

    const loadPdf = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        let dataBuffer = null;

        if (rawBlob && typeof rawBlob.arrayBuffer === 'function') {
          dataBuffer = await rawBlob.arrayBuffer();
        } else if (pdfBlobUrl) {
          const resp = await fetch(pdfBlobUrl);
          if (!resp.ok) {
            throw new Error(`Failed to fetch PDF blob: ${resp.statusText}`);
          }
          dataBuffer = await resp.arrayBuffer();
        } else {
          throw new Error('No PDF data source available');
        }

        const loadingTask = pdfjs.getDocument({
          data: new Uint8Array(dataBuffer),
        });

        const loadedPdf = await loadingTask.promise;
        if (!isCancelled) {
          setPdfDoc(loadedPdf);
          setNumPages(loadedPdf.numPages || 1);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error initializing PDF document viewer:', err);
        if (!isCancelled) {
          setLoadError(err.message || 'Unable to parse PDF structure');
          setIsLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [pdfBlobUrl, rawBlob]);

  // Stroke management callbacks
  const handleAddStroke = useCallback((pNum, stroke) => {
    setPageStrokes((prev) => ({
      ...prev,
      [pNum]: [...(prev[pNum] || []), stroke],
    }));
  }, []);

  const handleUndo = useCallback(() => {
    setPageStrokes((prev) => {
      // Find page with strokes to undo, starting with active page
      const targetPage = (prev[activePageNumber] && prev[activePageNumber].length > 0)
        ? activePageNumber
        : Object.keys(prev).reverse().find((k) => prev[k] && prev[k].length > 0);

      if (!targetPage) return prev;

      const currentList = prev[targetPage] || [];
      return {
        ...prev,
        [targetPage]: currentList.slice(0, -1),
      };
    });
  }, [activePageNumber]);

  const handleClear = useCallback(() => {
    setPageStrokes((prev) => ({
      ...prev,
      [activePageNumber]: [],
    }));
  }, [activePageNumber]);

  const activeStrokes = pageStrokes[activePageNumber] || [];
  const totalStrokesAcrossDoc = Object.values(pageStrokes).reduce((acc, list) => acc + (list?.length || 0), 0);

  // Panning handler: when the user drags the purple viewport box in the thumbnail, scroll the main document within the active page only
  const isDraggingViewportActiveRef = useRef(false);
  const handleViewportPan = useCallback((newTopRatio) => {
    isDraggingViewportActiveRef.current = true;
    const activeEl = document.querySelector(`[data-pdf-page-number="${activePageNumber}"]`);
    const scrollContainer = document.querySelector('.editor-auto-dim-scrollbar') || window;
    if (!activeEl) return;

    const pageTopInContainer = activeEl.offsetTop;
    const pageHeight = activeEl.offsetHeight;
    const targetScrollTop = pageTopInContainer + (newTopRatio * pageHeight);

    if (scrollContainer === window) {
      window.scrollTo({ top: targetScrollTop, behavior: 'auto' });
    } else {
      scrollContainer.scrollTop = targetScrollTop;
    }
  }, [activePageNumber]);

  // Active page detection via IntersectionObserver so tools & indicator track visible page during scroll (ignored during active drag)
  useEffect(() => {
    if (isLoading || loadError || !pdfDoc) return;
    const pageElements = document.querySelectorAll('[data-pdf-page-number]');
    if (!pageElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Do not switch active page while dragging the viewport box inside a page thumbnail
        if (isDraggingViewportActiveRef.current) return;
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          visibleEntries.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          const pNum = parseInt(visibleEntries[0].target.getAttribute('data-pdf-page-number'), 10);
          if (!isNaN(pNum)) {
            setActivePageNumber(pNum);
          }
        }
      },
      {
        threshold: [0.1, 0.3, 0.5, 0.8],
      }
    );

    pageElements.forEach((el) => observer.observe(el));

    const handleGlobalPointerUp = () => {
      isDraggingViewportActiveRef.current = false;
    };
    window.addEventListener('pointerup', handleGlobalPointerUp);

    return () => {
      observer.disconnect();
      window.removeEventListener('pointerup', handleGlobalPointerUp);
    };
  }, [numPages, pdfDoc, isLoading, loadError]);

  // Loading Screen
  if (isLoading) {
    return (
      <div
        data-enterprise-page="true"
        className={`w-full mx-auto rounded-[24px] shadow-[0_16px_48px_-16px_rgba(15,23,42,0.12)] border transition-all overflow-hidden flex flex-col items-center justify-center p-16 gap-3 ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200/50'
        }`}
        style={{
          maxWidth: `${pageMaxWidth}px`,
          minHeight: '750px',
        }}
      >
        <Loader2 size={32} className="animate-spin text-violet-600" />
        <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
          Rendering Vector PDF...
        </p>
        <p className="text-xs text-slate-400 dark:text-zinc-500">
          Initializing high-fidelity vector rasterization engine
        </p>
      </div>
    );
  }

  // Fallback if parsing failed
  if (loadError || !pdfDoc) {
    return (
      <div
        data-enterprise-page="true"
        className={`w-full mx-auto rounded-[24px] shadow-[0_16px_48px_-16px_rgba(15,23,42,0.12)] border transition-all overflow-hidden animate-in fade-in duration-200 ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200/50'
        }`}
        style={{
          maxWidth: `${pageMaxWidth}px`,
        }}
      >
        {pdfBlobUrl ? (
          <iframe
            src={`${pdfBlobUrl}#toolbar=0&navpanes=0&view=FitH`}
            title={title || 'PDF Document'}
            className="w-full border-0"
            style={{ height: '85vh', display: 'block' }}
          />
        ) : (
          <div className="w-full flex flex-col items-center justify-center text-center p-16 gap-3" style={{ height: '70vh' }}>
            <FileText size={32} className="text-slate-400 dark:text-zinc-600" />
            <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
              PDF preview unavailable
            </p>
            <p className="text-xs text-slate-400 dark:text-zinc-500">
              {loadError || 'The original file blob could not be loaded.'}
            </p>
          </div>
        )}
      </div>
    );
  }



  const handleThumbnailDragStart = (e, index) => {
    setDraggedThumbIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleThumbnailDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleThumbnailDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedThumbIndex === null || draggedThumbIndex === dropIndex) return;

    setPageOrder((prev) => {
      const updated = [...prev];
      const [movedPage] = updated.splice(draggedThumbIndex, 1);
      updated.splice(dropIndex, 0, movedPage);
      return updated;
    });

    setDraggedThumbIndex(null);
  };

  const scrollToPage = (pNum) => {
    const el = document.querySelector(`[data-pdf-page-number="${pNum}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActivePageNumber(pNum);
    }
  };



  return (
    <div className="w-full flex-1 flex flex-col items-center min-h-0 relative">
      {/* Apple-Style Docked Left Document Navigation Sidebar (Pinned Fixed Left Pane via Portal) */}
      {numPages > 1 && portalNode && createPortal(
        <aside
          style={{ top: `${sidebarTop}px` }}
          className={`fixed left-0 bottom-0 z-[500] select-none flex transition-[width] duration-200 border-r border-slate-200/90 dark:border-zinc-800 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.06)] dark:shadow-[4px_0_24px_-4px_rgba(0,0,0,0.4)] ${
            isThumbSidebarOpen ? 'w-[230px]' : 'w-11'
          }`}
        >
          {isThumbSidebarOpen ? (
            <div className="w-[230px] h-full flex flex-col bg-slate-50/95 dark:bg-zinc-900/95 backdrop-blur-2xl overflow-hidden">
              <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-200/80 dark:border-zinc-800/80 text-[11px] font-medium text-slate-600 dark:text-zinc-400 bg-white/70 dark:bg-zinc-800/40 shrink-0">
                <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-zinc-300">
                  <Layout size={13} className="text-slate-500 dark:text-zinc-400" />
                  <span>Pages</span>
                  <span className="text-[10px] font-normal text-slate-400 dark:text-zinc-500">
                    ({numPages})
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsThumbSidebarOpen(false)}
                  className="p-1 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  title="Collapse thumbnails"
                >
                  <ChevronLeft size={13} />
                </button>
              </div>

              {/* Scrollable list of thumbnails with isolated scroll chain */}
              <div 
                className="flex-1 overflow-y-auto p-3 flex flex-col gap-3.5 thin-scrollbar"
                style={{ overscrollBehavior: 'contain' }}
              >
                {pageOrder.map((pageNumber, idx) => {
                  const isActive = activePageNumber === pageNumber;
                  return (
                    <div
                      key={pageNumber}
                      draggable
                      onDragStart={(e) => handleThumbnailDragStart(e, idx)}
                      onDragOver={(e) => handleThumbnailDragOver(e, idx)}
                      onDrop={(e) => handleThumbnailDrop(e, idx)}
                      onClick={() => scrollToPage(pageNumber)}
                      className={`group/thumb relative rounded-xl p-2 transition-all duration-150 cursor-pointer border ${
                        isActive
                          ? 'border-slate-300 dark:border-zinc-700 bg-slate-200/50 dark:bg-zinc-800/80 shadow-xs'
                          : 'border-slate-200/80 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700 bg-white/70 dark:bg-zinc-800/30 hover:bg-white dark:hover:bg-zinc-800'
                      }`}
                      title={`Page ${pageNumber} (drag to reorder)`}
                    >
                      <div className="absolute top-3 left-3 z-30 opacity-0 group-hover/thumb:opacity-100 p-1 rounded-md bg-black/60 backdrop-blur-xs text-white cursor-grab active:cursor-grabbing transition-opacity shadow-xs">
                        <GripVertical size={11} />
                      </div>

                      {/* Thumbnail Canvas with ONLY the Regaarder Purple Viewport indicator */}
                      <PdfThumbnailCanvas 
                        pdf={pdfDoc} 
                        pageNumber={pageNumber} 
                        rotation={rotation}
                        isActive={isActive}
                        viewportCoverage={isActive ? viewportCoverage : null}
                        onViewportPan={handleViewportPan}
                      />

                      {/* Understated Page Number Label */}
                      <div className="mt-1.5 flex items-center justify-center">
                        <span className={`text-[11px] font-medium tracking-tight ${
                          isActive 
                            ? 'text-slate-800 dark:text-zinc-100 font-bold' 
                            : 'text-slate-400 dark:text-zinc-500 group-hover/thumb:text-slate-600 dark:group-hover/thumb:text-zinc-300'
                        }`}>
                          {idx + 1}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="w-11 h-full flex flex-col items-center pt-3 bg-slate-50/80 dark:bg-zinc-900/80">
              <button
                type="button"
                onClick={() => setIsThumbSidebarOpen(true)}
                className="p-2 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 shadow-2xs text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 transition-all hover:scale-105 cursor-pointer h-8 w-8 flex items-center justify-center"
                title="Expand page thumbnails"
              >
                <Layout size={14} />
              </button>
            </div>
          )}
        </aside>,
        portalNode
      )}

      {/* Main Pages Flow — Perfectly Centered in Viewport */}
      <div className="w-full flex flex-col items-center p-6 md:p-8 pt-8 pb-20">
        {/* Viewport-Anchored Global Floating Annotation Dock via Portal */}
        {markupActive && portalNode && createPortal(
          <StickyAnnotationDock
            toolMode={toolMode}
            setToolMode={setToolMode}
            activeColor={activeColor}
            setActiveColor={setActiveColor}
            canUndo={totalStrokesAcrossDoc > 0}
            onUndo={handleUndo}
            canClear={activeStrokes.length > 0}
            onClear={handleClear}
            activePageNumber={activePageNumber}
            numPages={numPages}
            onClose={onCloseMarkup}
            zoomLevel={zoomLevel}
            pageOrientation={pageOrientation}
            docPageSize={docPageSize}
          />,
          portalNode
        )}

        <div className="w-full flex flex-col items-center gap-8">
          {(pageOrder.length > 0 ? pageOrder : [1]).map((pageNumber) => (
            <div
              key={pageNumber}
              data-pdf-page-number={pageNumber}
              data-enterprise-page="true"
              className={`mx-auto rounded-[24px] shadow-[0_16px_48px_-16px_rgba(15,23,42,0.12)] border transition-all overflow-hidden relative group animate-in fade-in duration-200 ${
                isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200/50'
              }`}
              style={{
                width: `${pageMaxWidth}px`,
                maxWidth: `${pageMaxWidth}px`,
              }}
            >
              {/* Subtle Page Number Badge */}
              {numPages > 1 && (
                <div className="absolute bottom-3 right-4 z-10 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/[0.04] dark:bg-white/[0.06] text-slate-400 dark:text-zinc-500 backdrop-blur-xs opacity-40 group-hover:opacity-100 transition-opacity select-none pointer-events-none">
                  {pageNumber} / {numPages}
                </div>
              )}

              {/* High-DPI Vector Page Canvas */}
              <PdfPageCanvas
                pdf={pdfDoc}
                pageNumber={pageNumber}
                zoomLevel={zoomLevel}
                rotation={rotation}
                pageMaxWidth={pageMaxWidth}
                markupActive={markupActive}
                toolMode={toolMode}
                activeColor={activeColor}
                strokes={pageStrokes[pageNumber] || []}
                onAddStroke={handleAddStroke}
                onSetActivePage={setActivePageNumber}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
