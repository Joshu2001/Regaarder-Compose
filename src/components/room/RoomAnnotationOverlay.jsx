import React, { useState, useEffect, useRef } from 'react';
import { MousePointer, PenTool, Highlighter, Trash2 } from 'lucide-react';
import { LaserPointerIcon } from '../RegaarderProductIcons';

export default function RoomAnnotationOverlay({
  isEnabled = true,
  className = '',
  initialTool = 'cursor'
}) {
  const [activeTool, setActiveTool] = useState(initialTool); // 'cursor' | 'laser' | 'pen' | 'highlighter'
  const [activeColor, setActiveColor] = useState('#EF4444'); // Red laser / pen default
  
  const canvasRef = useRef(null);
  const laserRef = useRef({ x: -100, y: -100, active: false });
  const trailsRef = useRef([]);
  const strokesRef = useRef([]);
  const currentStrokeRef = useRef(null);
  const animFrameIdRef = useRef(null);

  // Resize canvas to fill full screen window viewport
  useEffect(() => {
    const updateCanvasSize = () => {
      const cvs = canvasRef.current;
      if (!cvs) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (cvs.width !== w || cvs.height !== h) {
        cvs.width = w;
        cvs.height = h;
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Continuous Laser Pointer Tracking on Mouse Move (Hover Mode)
  useEffect(() => {
    if (!isEnabled || activeTool !== 'laser') {
      laserRef.current.active = false;
      return;
    }

    const handleGlobalPointerMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      laserRef.current = { x, y, active: true };
      // Push trail point with decay properties
      trailsRef.current.push({ x, y, alpha: 1.0, radius: 4.5, createdAt: Date.now() });
    };

    const handleGlobalPointerLeave = () => {
      laserRef.current.active = false;
    };

    window.addEventListener('pointermove', handleGlobalPointerMove, { passive: true });
    window.addEventListener('pointerleave', handleGlobalPointerLeave);

    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerleave', handleGlobalPointerLeave);
    };
  }, [isEnabled, activeTool]);

  // Main Render Loop (Laser Trails & Ephemeral Strokes)
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      const now = Date.now();

      // 1. Draw Ephemeral Strokes (Fade out after 2.5 seconds)
      strokesRef.current = strokesRef.current.filter((stroke) => {
        const age = now - stroke.createdAt;
        const maxAge = 2500; // 2.5s duration
        if (age >= maxAge) return false;

        const opacity = Math.max(0, 1 - age / maxAge);
        if (stroke.points.length < 2) return true;

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = stroke.width;
        ctx.strokeStyle = stroke.type === 'highlighter'
          ? `rgba(250, 204, 21, ${opacity * 0.45})`
          : `rgba(139, 92, 246, ${opacity})`;
        
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
        ctx.restore();
        return true;
      });

      // 2. Draw Current Active Stroke (Pen or Highlighter)
      if (currentStrokeRef.current && currentStrokeRef.current.points.length > 1) {
        const s = currentStrokeRef.current;
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = s.width;
        ctx.strokeStyle = s.type === 'highlighter' ? 'rgba(250, 204, 21, 0.45)' : '#8B5CF6';
        ctx.beginPath();
        ctx.moveTo(s.points[0].x, s.points[0].y);
        for (let i = 1; i < s.points.length; i++) {
          ctx.lineTo(s.points[i].x, s.points[i].y);
        }
        ctx.stroke();
        ctx.restore();
      }

      // 3. Draw Laser Pointer & Motion Trails
      if (activeTool === 'laser') {
        // Age and draw decaying trails
        trailsRef.current = trailsRef.current.filter((t) => {
          t.alpha -= 0.035;
          t.radius = Math.max(0.8, t.radius * 0.96);
          if (t.alpha <= 0) return false;

          ctx.save();
          ctx.beginPath();
          ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(239, 68, 68, ${t.alpha * 0.55})`;
          ctx.shadowColor = '#EF4444';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.restore();
          return true;
        });

        // Draw Active Laser Dot
        if (laserRef.current.active && laserRef.current.x > 0 && laserRef.current.y > 0) {
          const { x, y } = laserRef.current;
          ctx.save();

          // Outer Radiant Ambient Halo
          const grad = ctx.createRadialGradient(x, y, 0, x, y, 22);
          grad.addColorStop(0, 'rgba(239, 68, 68, 0.95)');
          grad.addColorStop(0.35, 'rgba(239, 68, 68, 0.45)');
          grad.addColorStop(1, 'rgba(239, 68, 68, 0)');

          ctx.beginPath();
          ctx.arc(x, y, 22, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();

          // Core High-Intensity Laser Bead
          ctx.beginPath();
          ctx.arc(x, y, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = '#EF4444';
          ctx.shadowBlur = 14;
          ctx.fill();

          ctx.restore();
        }
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [activeTool]);

  // Handle Freehand Drawing (Pen / Highlighter)
  const handlePointerDown = (e) => {
    if (!isEnabled || (activeTool !== 'pen' && activeTool !== 'highlighter')) return;
    const x = e.clientX;
    const y = e.clientY;

    currentStrokeRef.current = {
      type: activeTool,
      width: activeTool === 'highlighter' ? 18 : 3,
      points: [{ x, y }]
    };
  };

  const handlePointerMove = (e) => {
    if (!isEnabled || !currentStrokeRef.current) return;
    const x = e.clientX;
    const y = e.clientY;
    currentStrokeRef.current.points.push({ x, y });
  };

  const handlePointerUp = () => {
    if (currentStrokeRef.current) {
      currentStrokeRef.current.createdAt = Date.now();
      strokesRef.current.push(currentStrokeRef.current);
      currentStrokeRef.current = null;
    }
  };

  const clearAllAnnotations = () => {
    strokesRef.current = [];
    trailsRef.current = [];
    currentStrokeRef.current = null;
    laserRef.current = { x: -100, y: -100, active: false };
  };

  if (!isEnabled) return null;

  const isDrawingTool = activeTool === 'pen' || activeTool === 'highlighter';

  return (
    <div
      className={`fixed inset-0 z-[9999990] pointer-events-none select-none ${className}`}
      style={{ touchAction: 'none' }}
    >
      {/* Canvas for Live Render across full screen viewport */}
      <canvas
        ref={canvasRef}
        onPointerDown={isDrawingTool ? handlePointerDown : undefined}
        onPointerMove={isDrawingTool ? handlePointerMove : undefined}
        onPointerUp={isDrawingTool ? handlePointerUp : undefined}
        onPointerCancel={isDrawingTool ? handlePointerUp : undefined}
        className={`w-full h-full block ${isDrawingTool ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'}`}
      />

      {/* Floating Apple-Style Annotation Toolstrip (Fixed at top-center of viewport) */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999999] pointer-events-auto flex items-center gap-1 bg-black/75 dark:bg-zinc-900/90 backdrop-blur-2xl border border-white/20 px-2.5 py-1.5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all select-none animate-in fade-in slide-in-from-top-3 duration-200">
        {/* Tool: Cursor */}
        <button
          type="button"
          onClick={() => setActiveTool('cursor')}
          className={`p-1.5 rounded-xl transition-all flex items-center justify-center cursor-pointer ${activeTool === 'cursor' ? 'bg-white/20 text-white shadow-xs ring-1 ring-white/30' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
          title="Normal Cursor"
        >
          <MousePointer size={13} />
        </button>

        {/* Tool: Laser Pointer (Minimal custom laser glyph) */}
        <button
          type="button"
          onClick={() => setActiveTool('laser')}
          className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${activeTool === 'laser' ? 'bg-white/20 text-white ring-1 ring-white/30 shadow-xs' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
          title="Live Laser Pointer (Hover & Move Mouse to Point, Tap Elements to Interact)"
        >
          <LaserPointerIcon size={13} className={activeTool === 'laser' ? 'text-rose-400' : 'text-current'} strokeWidth={1.5} />
          <span className="text-[11px]">Laser</span>
        </button>

        {/* Tool: Ephemeral Pen */}
        <button
          type="button"
          onClick={() => setActiveTool('pen')}
          className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${activeTool === 'pen' ? 'bg-white/20 text-white ring-1 ring-white/30 shadow-xs' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
          title="Live Annotator (Draw arrows or circles; strokes auto-fade after 2.5s)"
        >
          <PenTool size={12} className={activeTool === 'pen' ? 'text-violet-400' : ''} />
          <span className="text-[11px]">Pen</span>
        </button>

        {/* Tool: Highlighter */}
        <button
          type="button"
          onClick={() => setActiveTool('highlighter')}
          className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${activeTool === 'highlighter' ? 'bg-white/20 text-white ring-1 ring-white/30 shadow-xs' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
          title="Highlighter (Highlight text & elements; auto-fades after 2.5s)"
        >
          <Highlighter size={12} className={activeTool === 'highlighter' ? 'text-amber-400' : ''} />
          <span className="text-[11px]">Highlight</span>
        </button>

        {/* Action: Clear */}
        <div className="w-[1px] h-3.5 bg-white/15 mx-0.5" />
        <button
          type="button"
          onClick={clearAllAnnotations}
          className="p-1.5 rounded-xl text-white/40 hover:text-rose-400 hover:bg-white/10 transition-all cursor-pointer"
          title="Clear all annotations"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
