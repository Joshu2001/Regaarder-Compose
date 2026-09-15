import React, { useState, useRef, useEffect } from 'react';
import {
  Square,
  EyeOff,
  Check,
  X,
  RotateCcw,
  Maximize2
} from 'lucide-react';

export default function ScreenSnipperOverlay({
  isOpen,
  capturedCanvas,
  onConfirmCrop,
  onCancel,
}) {
  const containerRef = useRef(null);
  const [selection, setSelection] = useState(null); // { x, y, width, height } in client coords
  const [activeTool, setActiveTool] = useState('select'); // 'select' | 'rectangle' | 'blur'
  const [annotations, setAnnotations] = useState([]); // [{ type, x, y, width, height }]
  const [previewDataUrl, setPreviewDataUrl] = useState(null);

  // Dragging & Resizing interaction state
  const [interactionMode, setInteractionMode] = useState(null); // 'create' | 'move' | 'nw' | 'ne' | 'se' | 'sw' | 'n' | 'e' | 's' | 'w'
  const [dragAnchor, setDragAnchor] = useState(null); // { x, y, initialSelection }

  useEffect(() => {
    if (isOpen) {
      if (capturedCanvas) {
        try {
          setPreviewDataUrl(capturedCanvas.toDataURL('image/png'));
        } catch (e) {
          console.warn('[ScreenSnipperOverlay] Canvas toDataURL failed:', e);
        }
      }
      setSelection(null);
      setAnnotations([]);
      setActiveTool('select');
      setInteractionMode(null);
      setDragAnchor(null);
    }
  }, [isOpen, capturedCanvas]);

  if (!isOpen) return null;

  const getClientCoords = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX, y: clientY };
  };

  // Start Resizing or Moving from a specific handle
  const handleStartHandleDrag = (mode, e) => {
    e.stopPropagation();
    e.preventDefault();
    const { x, y } = getClientCoords(e);
    setInteractionMode(mode);
    setDragAnchor({ x, y, initialSelection: { ...selection } });
  };

  // Main Stage Mouse Down (creation of new box or annotations)
  const handleStageMouseDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    const { x, y } = getClientCoords(e);

    setInteractionMode('create');
    setDragAnchor({ x, y, initialSelection: null });

    if (activeTool === 'select') {
      setSelection({ x, y, width: 0, height: 0 });
    }
  };

  // Pointer Movement (Creation, Moving, or Resizing)
  const handleStageMouseMove = (e) => {
    if (!interactionMode || !dragAnchor) return;
    const { x, y } = getClientCoords(e);
    const dx = x - dragAnchor.x;
    const dy = y - dragAnchor.y;

    if (interactionMode === 'create') {
      const xMin = Math.min(dragAnchor.x, x);
      const yMin = Math.min(dragAnchor.y, y);
      const width = Math.abs(x - dragAnchor.x);
      const height = Math.abs(y - dragAnchor.y);

      if (activeTool === 'select') {
        setSelection({ x: xMin, y: yMin, width, height });
      }
    } else if (interactionMode === 'move' && dragAnchor.initialSelection) {
      const init = dragAnchor.initialSelection;
      const nextX = Math.max(0, Math.min(window.innerWidth - init.width, init.x + dx));
      const nextY = Math.max(0, Math.min(window.innerHeight - init.height, init.y + dy));
      setSelection({
        ...init,
        x: nextX,
        y: nextY,
      });
    } else if (dragAnchor.initialSelection) {
      // Edge / Corner Resizing
      const init = dragAnchor.initialSelection;
      let newX = init.x;
      let newY = init.y;
      let newW = init.width;
      let newH = init.height;

      // Handle horizontal resize
      if (interactionMode.includes('e')) {
        newW = Math.max(20, init.width + dx);
      } else if (interactionMode.includes('w')) {
        const proposedW = init.width - dx;
        if (proposedW >= 20) {
          newX = init.x + dx;
          newW = proposedW;
        }
      }

      // Handle vertical resize
      if (interactionMode.includes('s')) {
        newH = Math.max(20, init.height + dy);
      } else if (interactionMode.includes('n')) {
        const proposedH = init.height - dy;
        if (proposedH >= 20) {
          newY = init.y + dy;
          newH = proposedH;
        }
      }

      setSelection({
        x: Math.round(newX),
        y: Math.round(newY),
        width: Math.round(newW),
        height: Math.round(newH),
      });
    }
  };

  // Pointer Release
  const handleStageMouseUp = (e) => {
    if (!interactionMode || !dragAnchor) return;

    if (interactionMode === 'create') {
      const { x, y } = getClientCoords(e);
      const xMin = Math.min(dragAnchor.x, x);
      const yMin = Math.min(dragAnchor.y, y);
      const width = Math.abs(x - dragAnchor.x);
      const height = Math.abs(y - dragAnchor.y);

      if (activeTool === 'rectangle' || activeTool === 'blur') {
        if (width > 8 && height > 8) {
          setAnnotations((prev) => [
            ...prev,
            { type: activeTool, x: xMin, y: yMin, width, height },
          ]);
        }
      } else if (activeTool === 'select') {
        if (width < 20 || height < 20) {
          // If clicked without dragging a sizable area, preserve full or clear
          if (selection && (selection.width < 20 || selection.height < 20)) {
            setSelection(null);
          }
        }
      }
    }

    setInteractionMode(null);
    setDragAnchor(null);
  };

  // Select Full Workspace
  const handleSelectFullScreen = () => {
    setSelection({
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  // Commit and Crop
  const handleFinishAndCrop = () => {
    const finalSelection = selection && selection.width > 15 && selection.height > 15
      ? selection
      : {
          x: 0,
          y: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };

    const dpr = capturedCanvas && capturedCanvas.width
      ? capturedCanvas.width / window.innerWidth
      : (window.devicePixelRatio || 1);

    const targetWidth = Math.max(10, Math.round(finalSelection.width * dpr));
    const targetHeight = Math.max(10, Math.round(finalSelection.height * dpr));

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = targetWidth;
    cropCanvas.height = targetHeight;
    const ctx = cropCanvas.getContext('2d');

    if (capturedCanvas) {
      // The captured canvas may be at device pixel ratio scale, so we scale
      // source coordinates by the ratio of canvas pixels to CSS pixels.
      const srcX = Math.round(finalSelection.x * dpr);
      const srcY = Math.round(finalSelection.y * dpr);
      const srcW = Math.round(finalSelection.width * dpr);   // source slice width  in canvas pixels
      const srcH = Math.round(finalSelection.height * dpr);  // source slice height in canvas pixels

      ctx.drawImage(
        capturedCanvas,
        srcX, srcY, srcW, srcH,  // source region in the full captured canvas
        0, 0, targetWidth, targetHeight  // render into the full crop canvas
      );
    } else {
      // Fallback workspace canvas styling
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }

    // Render annotations (blur & red boxes)
    annotations.forEach((ann) => {
      const relX = Math.round((ann.x - finalSelection.x) * dpr);
      const relY = Math.round((ann.y - finalSelection.y) * dpr);
      const relW = Math.round(ann.width * dpr);
      const relH = Math.round(ann.height * dpr);

      if (ann.type === 'blur') {
        const sampleSize = 10;
        const offCanvas = document.createElement('canvas');
        offCanvas.width = Math.max(1, Math.floor(relW / sampleSize));
        offCanvas.height = Math.max(1, Math.floor(relH / sampleSize));
        const offCtx = offCanvas.getContext('2d');
        offCtx.imageSmoothingEnabled = false;

        offCtx.drawImage(cropCanvas, relX, relY, relW, relH, 0, 0, offCanvas.width, offCanvas.height);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(offCanvas, 0, 0, offCanvas.width, offCanvas.height, relX, relY, relW, relH);
        ctx.imageSmoothingEnabled = true;
      } else if (ann.type === 'rectangle') {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = Math.max(3, Math.round(3 * dpr));
        ctx.strokeRect(relX, relY, relW, relH);
      }
    });

    const croppedDataUrl = cropCanvas.toDataURL('image/png');
    onConfirmCrop(croppedDataUrl, Math.round(finalSelection.width), Math.round(finalSelection.height));
  };

  const hasValidSelection = selection && selection.width > 15 && selection.height > 15;

  return (
    <div
      role="dialog"
      aria-label="Interactive screenshot snip and crop"
      className="fixed inset-0 z-[9999999] select-none flex flex-col font-sans animate-in fade-in duration-150 overflow-hidden"
      style={{ cursor: activeTool === 'select' ? 'crosshair' : 'default' }}
    >
      {/* Top Floating Control Bar */}
      <div
        className="absolute top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#18181c]/95 border border-white/15 shadow-[0_16px_36px_rgba(0,0,0,0.6)] backdrop-blur-md text-white text-xs pointer-events-auto"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setActiveTool('select')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer border-none flex items-center gap-1.5 ${
            activeTool === 'select'
              ? 'bg-violet-600 text-white font-semibold'
              : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/10'
          }`}
          title="Drag to select or resize workspace area"
        >
          <span>Select area</span>
        </button>

        <button
          type="button"
          onClick={handleSelectFullScreen}
          className="px-2 py-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/10 transition-colors cursor-pointer border-none bg-transparent flex items-center gap-1"
          title="Select entire workspace"
        >
          <Maximize2 size={13} />
          <span>Full screen</span>
        </button>

        <div className="h-4 w-[1px] bg-white/10 mx-1" />

        <button
          type="button"
          onClick={() => setActiveTool('rectangle')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer border-none flex items-center gap-1.5 ${
            activeTool === 'rectangle'
              ? 'bg-red-600 text-white font-semibold'
              : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/10'
          }`}
          title="Draw red boundary box over issue"
        >
          <Square size={13} />
          <span>Highlight</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTool('blur')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer border-none flex items-center gap-1.5 ${
            activeTool === 'blur'
              ? 'bg-zinc-700 text-white font-semibold'
              : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/10'
          }`}
          title="Blur sensitive tokens, emails or personal data"
        >
          <EyeOff size={13} />
          <span>Blur</span>
        </button>

        {annotations.length > 0 && (
          <button
            type="button"
            onClick={() => setAnnotations([])}
            className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-white/10 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
            title="Clear all annotations"
          >
            <RotateCcw size={13} />
          </button>
        )}

        <div className="h-4 w-[1px] bg-white/10 mx-1" />

        <button
          type="button"
          onClick={handleFinishAndCrop}
          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors cursor-pointer border-none flex items-center gap-1 shadow-xs"
        >
          <Check size={13} strokeWidth={2.5} />
          <span>Attach</span>
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-white/10 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
          title="Cancel"
        >
          <X size={14} />
        </button>
      </div>

      {/* Main Snipping Stage */}
      <div
        ref={containerRef}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        className="relative w-full h-full"
      >
        {/* Frozen Screen Canvas or Dimmed Scrim */}
        {previewDataUrl ? (
          <img
            src={previewDataUrl}
            alt="Workspace capture"
            className="absolute inset-0 w-full h-full object-fill pointer-events-none"
          />
        ) : (
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        )}

        {/* Shroud Dimming Overlay (Shadow around selection) */}
        <div
          className="absolute inset-0 transition-opacity pointer-events-none"
          style={{
            backgroundColor: hasValidSelection ? 'transparent' : 'rgba(0, 0, 0, 0.45)',
          }}
        />

        {/* Selected Crop Area Frame with Active Resize Edges & Handles */}
        {hasValidSelection && (
          <div
            className="absolute border-2 border-violet-400 bg-violet-500/10 shadow-[0_0_0_99999px_rgba(0,0,0,0.55)] cursor-move pointer-events-auto"
            style={{
              left: `${selection.x}px`,
              top: `${selection.y}px`,
              width: `${selection.width}px`,
              height: `${selection.height}px`,
            }}
            onMouseDown={(e) => handleStartHandleDrag('move', e)}
          >
            {/* Dimensions Pill */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/85 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-sm whitespace-nowrap pointer-events-none">
              {Math.round(selection.width)} × {Math.round(selection.height)} px
            </div>

            {/* 4 Corner Precision Handles */}
            <div
              className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border border-violet-600 rounded-xs shadow-md cursor-nwse-resize pointer-events-auto z-10"
              onMouseDown={(e) => handleStartHandleDrag('nw', e)}
            />
            <div
              className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border border-violet-600 rounded-xs shadow-md cursor-nesw-resize pointer-events-auto z-10"
              onMouseDown={(e) => handleStartHandleDrag('ne', e)}
            />
            <div
              className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border border-violet-600 rounded-xs shadow-md cursor-nesw-resize pointer-events-auto z-10"
              onMouseDown={(e) => handleStartHandleDrag('sw', e)}
            />
            <div
              className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border border-violet-600 rounded-xs shadow-md cursor-nwse-resize pointer-events-auto z-10"
              onMouseDown={(e) => handleStartHandleDrag('se', e)}
            />

            {/* 4 Edge Resizers */}
            <div
              className="absolute -top-1 inset-x-2 h-2 cursor-ns-resize pointer-events-auto"
              onMouseDown={(e) => handleStartHandleDrag('n', e)}
            />
            <div
              className="absolute -bottom-1 inset-x-2 h-2 cursor-ns-resize pointer-events-auto"
              onMouseDown={(e) => handleStartHandleDrag('s', e)}
            />
            <div
              className="absolute -left-1 inset-y-2 w-2 cursor-ew-resize pointer-events-auto"
              onMouseDown={(e) => handleStartHandleDrag('w', e)}
            />
            <div
              className="absolute -right-1 inset-y-2 w-2 cursor-ew-resize pointer-events-auto"
              onMouseDown={(e) => handleStartHandleDrag('e', e)}
            />
          </div>
        )}

        {/* Render Annotations Overlays */}
        {annotations.map((ann, idx) => (
          <div
            key={idx}
            className={`absolute pointer-events-none ${
              ann.type === 'blur'
                ? 'bg-zinc-800/80 backdrop-blur-md border border-white/20'
                : 'border-2 border-red-500 bg-red-500/15'
            }`}
            style={{
              left: `${ann.x}px`,
              top: `${ann.y}px`,
              width: `${ann.width}px`,
              height: `${ann.height}px`,
            }}
          />
        ))}

        {/* First time helper hint */}
        {!hasValidSelection && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none bg-black/85 backdrop-blur-sm text-zinc-200 text-xs px-4 py-2 rounded-full border border-white/10 shadow-xl flex items-center gap-2">
            <span>Drag across any area to crop, or click <strong>Full screen</strong></span>
          </div>
        )}
      </div>
    </div>
  );
}
