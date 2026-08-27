import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Maximize2, X, MonitorPlay } from 'lucide-react';

export default function FloatingPipWidgetWindow() {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [meetingTimer, setMeetingTimer] = useState('00:00');
  const videoRef = useRef(null);

  useEffect(() => {
    // Attempt to acquire desktop stream or listen to global stream
    if (window.electronAPI?.getDesktopSources) {
      window.electronAPI.getDesktopSources(['screen', 'window']).then(sources => {
        if (sources && sources.length > 0) {
          navigator.mediaDevices?.getUserMedia?.({
            audio: false,
            video: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: sources[0].id,
                minWidth: 640,
                maxWidth: 1280,
                minHeight: 360,
                maxHeight: 720
              }
            }
          }).then(stream => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.play().catch(() => {});
            }
          }).catch(err => {
            console.warn('[Floating PIP] Stream capture notice:', err);
          });
        }
      });
    }

    const timer = setInterval(() => {
      const now = new Date();
      setMeetingTimer(`${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClose = () => {
    window.electronAPI?.closeFloatingPipWidget?.();
  };

  const handleReturnToApp = () => {
    window.electronAPI?.sendPopoverAction?.('navigate-room', {});
    window.electronAPI?.closeFloatingPipWidget?.();
  };

  return (
    <div className="w-screen h-screen p-2 bg-transparent select-none font-sans flex flex-col justify-end overflow-hidden">
      <div 
        style={{ WebkitAppRegion: 'drag' }}
        className="w-full h-full bg-zinc-950/95 dark:bg-black/95 text-white rounded-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col relative group"
      >
        {/* Header Drag Bar */}
        <div className="h-7 px-2.5 bg-black/40 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span className="text-[10px] font-bold tracking-wide uppercase text-zinc-300">Live Meeting</span>
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

        {/* Video Canvas Container */}
        <div className="flex-1 min-h-0 bg-zinc-900 relative flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {/* Overlay fallback if no active stream */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
            <div className="w-8 h-8 rounded-full bg-violet-600/30 text-violet-400 flex items-center justify-center mb-1 text-xs font-bold border border-violet-500/30">
              R
            </div>
            <span className="text-[9px] font-medium text-zinc-400">Broadcasting to room</span>
          </div>
        </div>

        {/* Controls Footer */}
        <div 
          style={{ WebkitAppRegion: 'no-drag' }}
          className="h-9 px-2 bg-black/60 backdrop-blur-md border-t border-white/10 flex items-center justify-between shrink-0"
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
