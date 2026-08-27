import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, Maximize2, X, MonitorPlay } from 'lucide-react';

export default function FloatingPipWidgetWindow() {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [meetingTimer, setMeetingTimer] = useState('00:00');
  const [hasFrames, setHasFrames] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameIdRef = useRef(null);

  useEffect(() => {
    let activeStream = null;

    const startStream = async () => {
      try {
        if (window.electronAPI?.getDesktopSources) {
          const sources = await window.electronAPI.getDesktopSources(['screen', 'window']);
          // Parse sourceId from hash if present
          const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
          const targetSourceId = hashParams.get('sourceId');
          const matched = (targetSourceId && sources.find(s => s.id === targetSourceId)) || sources[0];

          if (matched) {
            activeStream = await navigator.mediaDevices.getUserMedia({
              audio: false,
              video: {
                mandatory: {
                  chromeMediaSource: 'desktop',
                  chromeMediaSourceId: matched.id,
                  minWidth: 640,
                  maxWidth: 1280,
                  minHeight: 360,
                  maxHeight: 720
                }
              }
            });

            if (videoRef.current) {
              videoRef.current.srcObject = activeStream;
              await videoRef.current.play().catch(() => {});
            }

            // Software 2D Canvas Fallback Loop (immune to disable-gpu)
            const renderCanvas = () => {
              const vid = videoRef.current;
              const cvs = canvasRef.current;
              if (vid && cvs && vid.readyState >= 2) {
                const ctx = cvs.getContext('2d');
                if (ctx) {
                  if (cvs.width !== vid.videoWidth && vid.videoWidth > 0) {
                    cvs.width = vid.videoWidth;
                    cvs.height = vid.videoHeight;
                  }
                  ctx.drawImage(vid, 0, 0, cvs.width, cvs.height);
                  setHasFrames(true);
                }
              }
              animFrameIdRef.current = requestAnimationFrame(renderCanvas);
            };

            animFrameIdRef.current = requestAnimationFrame(renderCanvas);
          }
        }
      } catch (err) {
        console.warn('[Floating PIP] Stream capture notice:', err);
      }
    };

    startStream();

    const timer = setInterval(() => {
      const now = new Date();
      setMeetingTimer(`${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`);
    }, 1000);

    return () => {
      clearInterval(timer);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (activeStream) activeStream.getTracks().forEach(t => t.stop());
    };
  }, []);

  const handleClose = () => {
    window.electronAPI?.closeFloatingPipWidget?.();
  };

  const handleReturnToApp = () => {
    if (window.electronAPI?.restoreMainWindow) {
      window.electronAPI.restoreMainWindow();
    }
    window.electronAPI?.sendPopoverAction?.('navigate-room', {});
    window.electronAPI?.closeFloatingPipWidget?.();
  };

  return (
    <div className="w-screen h-screen p-2 bg-transparent select-none font-sans flex flex-col justify-end overflow-hidden">
      <div 
        style={{ WebkitAppRegion: 'drag' }}
        className="w-full h-full bg-zinc-950/95 dark:bg-black/95 text-white rounded-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col relative group"
      >
        {/* Header Drag Bar */}
        <div className="h-7 px-2.5 bg-black/50 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span className="text-[10px] font-bold tracking-wide uppercase text-zinc-300">Live Presenter</span>
            <span className="text-[10px] text-zinc-500 font-mono ml-1">{meetingTimer}</span>
          </div>

          <div style={{ WebkitAppRegion: 'no-drag' }} className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleReturnToApp}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Return to Regaarder"
            >
              <Maximize2 size={11} />
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
              title="Close Floating Widget"
            >
              <X size={11} />
            </button>
          </div>
        </div>

        {/* Video & Software Canvas Viewport */}
        <div className="flex-1 min-h-0 bg-black relative flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-contain hidden"
          />

          <canvas
            ref={canvasRef}
            className={`w-full h-full object-contain bg-black ${hasFrames ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
          />
          
          {/* Overlay fallback if no frames yet */}
          {!hasFrames && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-60 bg-zinc-950">
              <div className="w-8 h-8 rounded-full bg-violet-600/30 text-violet-400 flex items-center justify-center mb-1 text-xs font-bold border border-violet-500/30">
                R
              </div>
              <span className="text-[9px] font-medium text-zinc-400">Broadcasting live...</span>
            </div>
          )}
        </div>

        {/* Controls Footer */}
        <div 
          style={{ WebkitAppRegion: 'no-drag' }}
          className="h-9 px-2.5 bg-black/70 backdrop-blur-md border-t border-white/10 flex items-center justify-between shrink-0"
        >
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsMicOn(!isMicOn)}
              className={`p-1.5 rounded-lg text-xs transition-colors ${isMicOn ? 'bg-white/10 text-zinc-200 hover:bg-white/20' : 'bg-red-500/20 text-red-400'}`}
              title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
            >
              {isMicOn ? <Mic size={11} /> : <MicOff size={11} />}
            </button>
            <button
              type="button"
              onClick={() => setIsCameraOn(!isCameraOn)}
              className={`p-1.5 rounded-lg text-xs transition-colors ${isCameraOn ? 'bg-white/10 text-zinc-200 hover:bg-white/20' : 'bg-red-500/20 text-red-400'}`}
              title={isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
            >
              {isCameraOn ? <Video size={11} /> : <VideoOff size={11} />}
            </button>
          </div>

          <button
            type="button"
            onClick={handleReturnToApp}
            className="px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
          >
            <MonitorPlay size={10} />
            <span>Open Room</span>
          </button>
        </div>
      </div>
    </div>
  );
}
