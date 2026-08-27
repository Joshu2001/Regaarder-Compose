import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, Maximize2, X, MonitorPlay } from 'lucide-react';

export default function FloatingPipWidgetWindow() {
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const rawTitle = searchParams?.get('title') || 'External Window';

  // Clean title for display (e.g. "MINGW64:/c/Users/..." -> "Git Bash" or original name)
  const displayTitle = rawTitle.includes('MINGW') || rawTitle.includes('cmd.exe') || rawTitle.includes('bash')
    ? 'Git Bash'
    : rawTitle;

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [meetingTimer, setMeetingTimer] = useState('00:00');
  const [hasFrames, setHasFrames] = useState(false);
  const canvasRef = useRef(null);
  const imgRef = useRef(new Image());

  // CPU 2D Software Rasterized Frame Pipeline (Zero GPU crash code 34)
  useEffect(() => {
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
        ctx.drawImage(img, 0, 0, cvs.width, cvs.height);
        if (!hasFrames) setHasFrames(true);
      };
      img.src = jpegDataUrl;
    };

    let unsubscribe = null;
    if (window.electronAPI?.onPipFrame) {
      unsubscribe = window.electronAPI.onPipFrame(drawFrame);
    }

    const timer = setInterval(() => {
      const now = new Date();
      setMeetingTimer(`${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`);
    }, 1000);

    return () => {
      clearInterval(timer);
      if (typeof unsubscribe === 'function') unsubscribe();
      else window.electronAPI?.offPipFrame?.();
    };
  }, [hasFrames]);

  const handleClose = () => {
    window.electronAPI?.closeFloatingPipWidget?.();
  };

  const handleReturnToApp = async () => {
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
    <div className="w-screen h-screen p-2 bg-transparent select-none font-sans flex flex-col justify-end overflow-hidden">
      <div
        style={{ WebkitAppRegion: 'drag' }}
        className="w-full h-full bg-zinc-950/95 text-white rounded-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col relative"
      >
        {/* Header Drag Bar */}
        <div className="h-7 px-2.5 bg-black/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span className="text-[10px] font-bold tracking-wide text-zinc-200 truncate max-w-[130px]">{displayTitle}</span>
            <span className="text-[10px] text-zinc-500 font-mono ml-1">{meetingTimer}</span>
          </div>
          <div style={{ WebkitAppRegion: 'no-drag' }} className="flex items-center gap-1">
            <button type="button" onClick={handleReturnToApp} className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer" title="Return to Regaarder">
              <Maximize2 size={11} />
            </button>
            <button type="button" onClick={handleClose} className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-white/10 transition-colors cursor-pointer" title="Close">
              <X size={11} />
            </button>
          </div>
        </div>

        {/* Live Video Viewport */}
        <div className="flex-1 min-h-0 bg-black relative flex items-center justify-center overflow-hidden">
          <canvas
            ref={canvasRef}
            className={`w-full h-full object-contain bg-black transition-opacity duration-300 ${hasFrames ? 'opacity-100' : 'opacity-0'}`}
          />
          {!hasFrames && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-zinc-950">
              <div className="w-8 h-8 rounded-full bg-violet-600/30 text-violet-400 flex items-center justify-center mb-1.5 border border-violet-500/30 text-xs font-bold">
                R
              </div>
              <span className="text-[9px] font-medium text-zinc-400">Streaming live preview...</span>
            </div>
          )}
        </div>

        {/* Controls Footer */}
        <div
          style={{ WebkitAppRegion: 'no-drag' }}
          className="h-9 px-2.5 bg-black/70 border-t border-white/10 flex items-center justify-between shrink-0"
        >
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsMicOn(!isMicOn)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isMicOn ? 'bg-white/10 text-zinc-200 hover:bg-white/20' : 'bg-red-500/20 text-red-400'}`}
            >
              {isMicOn ? <Mic size={11} /> : <MicOff size={11} />}
            </button>
            <button
              type="button"
              onClick={() => setIsCameraOn(!isCameraOn)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isCameraOn ? 'bg-white/10 text-zinc-200 hover:bg-white/20' : 'bg-red-500/20 text-red-400'}`}
            >
              {isCameraOn ? <Video size={11} /> : <VideoOff size={11} />}
            </button>
          </div>
          <button
            type="button"
            onClick={handleReturnToApp}
            className="px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <MonitorPlay size={10} />
            <span>Open Room</span>
          </button>
        </div>
      </div>
    </div>
  );
}
