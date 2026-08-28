import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, X, MonitorPlay } from 'lucide-react';

export default function FloatingPipWidgetWindow() {
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const rawTitle = searchParams?.get('title') || 'Screen Share';

  const displayTitle = rawTitle.includes('MINGW') || rawTitle.includes('cmd.exe') || rawTitle.includes('bash')
    ? 'Git Bash'
    : rawTitle;

  const [hasFrames, setHasFrames] = useState(false);
  const canvasRef = useRef(null);
  const imgRef = useRef(new Image());
  const hasReceivedFrameRef = useRef(false);

  // Stable CPU 2D Software Rasterized Frame Pipeline
  useEffect(() => {
    document.documentElement.style.background = 'transparent';
    document.body.style.background = 'transparent';

    const drawFrame = (jpegDataUrl) => {
      if (!jpegDataUrl) return;
      const img = imgRef.current;
      img.onload = () => {
        const cvs = canvasRef.current;
        if (!cvs) return;
        const ctx = cvs.getContext('2d');
        if (!ctx) return;
        if (cvs.width !== img.naturalWidth && img.naturalWidth > 0) {
          cvs.width = img.naturalWidth;
          cvs.height = img.naturalHeight;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        ctx.drawImage(img, 0, 0, cvs.width, cvs.height);
        if (!hasReceivedFrameRef.current) {
          hasReceivedFrameRef.current = true;
          setHasFrames(true);
        }
      };
      img.src = jpegDataUrl;
    };

    let unsubscribe = null;
    if (window.electronAPI?.onPipFrame) {
      unsubscribe = window.electronAPI.onPipFrame(drawFrame);
    }

    return () => {
      document.documentElement.style.background = '';
      document.body.style.background = '';
      if (typeof unsubscribe === 'function') unsubscribe();
      else window.electronAPI?.offPipFrame?.();
    };
  }, []);

  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let timer = null;
    const onMove = () => {
      setIsHovered(true);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setIsHovered(false);
      }, 3000);
    };

    const onLeave = (e) => {
      if (!e.relatedTarget && (e.clientX <= 0 || e.clientX >= window.innerWidth || e.clientY <= 0 || e.clientY >= window.innerHeight)) {
        if (timer) clearTimeout(timer);
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseenter', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave, { passive: true });

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseenter', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  const handleClose = (e) => {
    e?.stopPropagation();
    window.electronAPI?.closeFloatingPipWidget?.();
  };

  const handleReturnToApp = async (e) => {
    e?.stopPropagation();
    try {
      if (window.electronAPI?.returnToRoom) {
        await window.electronAPI.returnToRoom();
      } else if (window.electronAPI?.restoreMainWindow) {
        await window.electronAPI.restoreMainWindow();
      }
    } catch (err) {
      console.warn('Return to room error:', err);
    }
    window.electronAPI?.closeFloatingPipWidget?.();
  };

  return (
    <div
      style={{ WebkitAppRegion: 'drag' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative w-screen h-screen bg-transparent select-none font-sans overflow-hidden cursor-move flex items-center justify-center m-0 p-0"
    >
      {/* 100% Pure Frameless Floating Screen Surface (No Clipped Shadows) */}
      <div
        style={{ WebkitAppRegion: 'drag' }}
        className="relative w-full h-full rounded-xl overflow-hidden flex items-center justify-center bg-transparent"
      >
        <canvas
          ref={canvasRef}
          style={{ WebkitAppRegion: 'drag' }}
          className={`w-full h-full block bg-transparent transition-opacity duration-200 ${hasFrames ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Placeholder state when waiting for initial stream frames */}
        {!hasFrames && (
          <div
            style={{ WebkitAppRegion: 'drag' }}
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-zinc-950 text-zinc-400"
          >
            <div className="w-7 h-7 rounded-full bg-violet-600/30 text-violet-300 flex items-center justify-center mb-1 border border-violet-500/20 text-xs font-bold">
              <MonitorPlay size={13} />
            </div>
            <span className="text-[9px] font-medium text-zinc-400">Live preview active</span>
          </div>
        )}

        {/* Minimalist Apple-style Hover Overlay Controls (Active Mouse Tracking) */}
        <div
          style={{ WebkitAppRegion: 'drag' }}
          className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/50 transition-opacity duration-200 flex flex-col justify-between p-2 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        >
          {/* Top Bar: Title & Window Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-semibold text-white truncate max-w-[140px]">{displayTitle}</span>
            </div>
            <div style={{ WebkitAppRegion: 'no-drag' }} className="flex items-center gap-1 pointer-events-auto">
              <button
                type="button"
                style={{ WebkitAppRegion: 'no-drag' }}
                onClick={handleReturnToApp}
                className="p-1 rounded-md bg-black/60 hover:bg-white/20 text-zinc-200 hover:text-white transition-colors cursor-pointer backdrop-blur-md border border-white/10"
                title="Expand to Full Room"
              >
                <Maximize2 size={11} />
              </button>
              <button
                type="button"
                style={{ WebkitAppRegion: 'no-drag' }}
                onClick={handleClose}
                className="p-1 rounded-md bg-black/60 hover:bg-rose-500/80 text-zinc-200 hover:text-white transition-colors cursor-pointer backdrop-blur-md border border-white/10"
                title="Close"
              >
                <X size={11} />
              </button>
            </div>
          </div>

          {/* Bottom Bar: Action Pill */}
          <div style={{ WebkitAppRegion: 'no-drag' }} className="flex items-center justify-end pointer-events-auto">
            <button
              type="button"
              style={{ WebkitAppRegion: 'no-drag' }}
              onClick={handleReturnToApp}
              className="px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-semibold shadow-lg transition-all flex items-center gap-1 cursor-pointer"
            >
              <MonitorPlay size={10} />
              <span>Open Room</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
