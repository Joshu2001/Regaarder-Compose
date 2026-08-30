import React, { useState, useEffect, useRef } from 'react';
import { MousePointer, PenTool, Highlighter, Trash2 } from 'lucide-react';
import { LaserPointerIcon } from '../RegaarderProductIcons';

export default function RoomAnnotationOverlay({
  isEnabled = true,
  className = ''
}) {
  const [activeTool, setActiveTool] = useState('cursor'); // 'cursor' | 'laser' | 'pen' | 'highlighter'
  const [activeColor, setActiveColor] = useState('#EF4444'); // Red laser / pen default
  
  const canvasRef = useRef(null);
  const laserRef = useRef({ x: -100, y: -100, active: false });
  const trailsRef = useRef([]);
  const strokesRef = useRef([]);
  const currentStrokeRef = useRef(null);
  const animFrameIdRef = useRef(null);

  // Resize canvas to match container
  useEffect(() => {
    const updateCanvasSize = () => {
      const cvs = canvasRef.current;
      if (!cvs || !cvs.parentElement) return;
      const rect = cvs.parentElement.getBoundingClientRect();
      if (cvs.width !== rect.width || cvs.height !== rect.height) {
        cvs.width = rect.width;
        cvs.height = rect.height;
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

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
          ? `rgba(250, 204, 21, ${opacity * 0.4})`
          : `rgba(239, 68, 68, ${opacity})`;
        
        if (stroke.type === 'highlighter') {
          ctx.globalCompositeOperation = 'source-over';
        }

        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
        ctx.restore();
        return true;
      });

      // 2. Draw Current Active Stroke
      if (currentStrokeRef.current && currentStrokeRef.current.points.length > 1) {
        const s = currentStrokeRef.current;
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = s.width;
        ctx.strokeStyle = s.type === 'highlighter' ? 'rgba(250, 204, 21, 0.45)' : s.color;
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
        // Age trails
        trailsRef.current = trailsRef.current.filter((t) => {
          t.alpha -= 0.04;
          t.radius = Math.max(1, t.radius * 0.95);
          if (t.alpha <= 0) return false;

          ctx.save();
          ctx.beginPath();
          ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(239, 68, 68, ${t.alpha * 0.6})`;
          ctx.shadowColor = '#EF4444';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.restore();
          return true;
        });

        // Draw Active Laser Dot
        if (laserRef.current.active) {
          const { x, y } = laserRef.current;
          ctx.save();

          // Outer Radiant Glow
          const grad = ctx.createRadialGradient(x, y, 0, x, y, 20);
          grad.addColorStop(0, 'rgba(239, 68, 68, 1)');
          grad.addColorStop(0.3, 'rgba(239, 68, 68, 0.5)');
          grad.addColorStop(1, 'rgba(239, 68, 68, 0)');

          ctx.beginPath();
          ctx.arc(x, y, 20, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();

          // Core High-Intensity Bead
          ctx.beginPath();
          ctx.arc(x, y, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = '#EF4444';
          ctx.shadowBlur = 12;
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

  const handlePointerDown = (e) => {
    if (!isEnabled || activeTool === 'cursor') return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'laser') {
      laserRef.current = { x, y, active: true };
      trailsRef.current.push({ x, y, time: Date.now() });
    } else if (activeTool === 'pen' || activeTool === 'highlighter') {
      currentStrokeRef.current = {
        tool: activeTool,
        color: activeTool === 'highlighter' ? '#FBBF24' : '#8B5CF6',
        points: [{ x, y }]
      };
    }
  };

  const handlePointerMove = (e) => {
    if (!isEnabled || activeTool === 'cursor') return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'laser' && laserRef.current.active) {
      laserRef.current = { x, y, active: true };
      trailsRef.current.push({ x, y, time: Date.now() });
    } else if (currentStrokeRef.current) {
      currentStrokeRef.current.points.push({ x, y });
    }
  };

  const handlePointerUp = () => {
    if (activeTool === 'laser') {
      laserRef.current.active = false;
    } else if (currentStrokeRef.current) {
      currentStrokeRef.current.created = Date.now();
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

  return (
    <div
      className={`absolute inset-0 z-30 pointer-events-none ${className}`}
      style={{ touchAction: 'none' }}
    >
      {/* Canvas for Live Render */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`w-full h-full ${activeTool !== 'cursor' ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'}`}
      />

      {/* Floating Apple-Style Annotation Toolstrip */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 pointer-events-auto flex items-center gap-1 bg-black/45 backdrop-blur-xl border border-white/15 px-2 py-1 rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.3)] transition-all select-none">
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
          className={`px-2 py-1 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${activeTool === 'laser' ? 'bg-white/20 text-white ring-1 ring-white/30 shadow-xs' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
          title="Laser Pointer"
        >
          <LaserPointerIcon size={13} className={activeTool === 'laser' ? 'text-violet-400' : 'text-current'} strokeWidth={1.5} />
          <span className="text-[11px]">Laser</span>
        </button>

        {/* Tool: Ephemeral Pen */}
        <button
          type="button"
          onClick={() => setActiveTool('pen')}
          className={`px-2 py-1 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${activeTool === 'pen' ? 'bg-white/20 text-white ring-1 ring-white/30 shadow-xs' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
          title="Live Annotator (Strokes auto-fade after 2.5s)"
        >
          <PenTool size={12} className={activeTool === 'pen' ? 'text-violet-400' : ''} />
          <span className="text-[11px]">Pen</span>
        </button>

        {/* Tool: Highlighter */}
        <button
          type="button"
          onClick={() => setActiveTool('highlighter')}
          className={`px-2 py-1 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${activeTool === 'highlighter' ? 'bg-white/20 text-white ring-1 ring-white/30 shadow-xs' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
          title="Highlighter"
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
          title="Clear all strokes"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
