import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, X, MonitorPlay, Users, Mic, MicOff, LayoutGrid, Monitor } from 'lucide-react';
import { LaserPointerIcon } from '../RegaarderProductIcons';

export default function FloatingPipWidgetWindow() {
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const rawTitle = searchParams?.get('title') || 'Screen Share';

  const displayTitle = rawTitle.includes('MINGW') || rawTitle.includes('cmd.exe') || rawTitle.includes('bash')
    ? 'Git Bash'
    : rawTitle;

  const [hasFrames, setHasFrames] = useState(false);
  const [viewMode, setViewMode] = useState('screen'); // 'screen' | 'audience'
  const [showCornerOverlay, setShowCornerOverlay] = useState(true);
  const [activeSpeakerIndex, setActiveSpeakerIndex] = useState(0);

  const canvasRef = useRef(null);
  const imgRef = useRef(new Image());
  const hasReceivedFrameRef = useRef(false);

  // Audience participants list
  const [audienceList] = useState([
    {
      id: 'p-sophia',
      name: 'Sophia Chen',
      isSpeaking: true,
      isRoomMicOn: true,
      img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      color: '#8B5CF6'
    },
    {
      id: 'p-marcus',
      name: 'Marcus Vance',
      isSpeaking: false,
      isRoomMicOn: false,
      img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
      color: '#3B82F6'
    },
    {
      id: 'p-elena',
      name: 'Elena Rostova',
      isSpeaking: false,
      isRoomMicOn: true,
      img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
      color: '#EC4899'
    },
    {
      id: 'p-sarah',
      name: 'Sarah Chen',
      isSpeaking: false,
      isRoomMicOn: false,
      img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
      color: '#10B981'
    }
  ]);

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

  // Keyboard shortcut to quickly toggle views (Space / Tab)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab' || e.key === ' ') {
        e.preventDefault();
        setViewMode(prev => (prev === 'screen' ? 'audience' : 'screen'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [isHovered, setIsHovered] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.button !== 0 || e.target.closest('button')) return;
    isDraggingRef.current = true;
    dragStartPosRef.current = { x: e.screenX, y: e.screenY };

    const onMouseMove = (moveEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = moveEvent.screenX - dragStartPosRef.current.x;
      const deltaY = moveEvent.screenY - dragStartPosRef.current.y;
      dragStartPosRef.current = { x: moveEvent.screenX, y: moveEvent.screenY };
      if (deltaX !== 0 || deltaY !== 0) {
        window.electronAPI?.moveFloatingPipWidget?.({ deltaX, deltaY });
      }
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

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

  const activeSpeaker = audienceList[activeSpeakerIndex] || audienceList[0];

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative w-screen h-screen bg-transparent select-none font-sans overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-center m-0 p-0"
    >
      {/* 100% Pure Frameless Floating Container */}
      <div className="relative w-full h-full rounded-xl overflow-hidden flex items-center justify-center bg-zinc-950">
        
        {/* VIEW 1: SCREEN SHARE STREAM */}
        {viewMode === 'screen' ? (
          <div className="relative w-full h-full flex items-center justify-center bg-zinc-950">
            <canvas
              ref={canvasRef}
              className={`w-full h-full block bg-transparent transition-opacity duration-150 ${hasFrames ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* Placeholder state when waiting for initial stream frames */}
            {!hasFrames && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-zinc-950 text-zinc-400">
                <div className="w-7 h-7 rounded-full bg-violet-600/30 text-violet-300 flex items-center justify-center mb-1 border border-violet-500/20 text-xs font-bold">
                  <MonitorPlay size={13} />
                </div>
                <span className="text-[9px] font-medium text-zinc-400">Live preview active</span>
              </div>
            )}

            {/* Corner Participant Overlay Bubble (Active Speaker Reactions) */}
            {showCornerOverlay && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setViewMode('audience');
                }}
                className="absolute bottom-2.5 left-2.5 z-20 flex items-center gap-1.5 p-1 pr-2 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-xl border border-white/15 shadow-xl cursor-pointer transition-all hover:scale-105 group/bubble"
                title="Tap to switch to full Audience View"
              >
                <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 border border-white/20">
                  <img src={activeSpeaker.img} alt={activeSpeaker.name} className="w-full h-full object-cover" />
                  {activeSpeaker.isSpeaking && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-black animate-pulse" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-semibold text-white/95 leading-tight truncate max-w-[70px]">
                    {activeSpeaker.name.split(' ')[0]}
                  </span>
                  <span className="text-[7.5px] text-emerald-400 font-medium leading-none">
                    {activeSpeaker.isSpeaking ? 'Speaking' : 'Listening'}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* VIEW 2: AUDIENCE FACES GRID */
          <div 
            onClick={() => setViewMode('screen')}
            className="relative w-full h-full bg-gradient-to-b from-zinc-900 to-black p-2 flex flex-col justify-between cursor-pointer"
            title="Click anywhere to return to Screen Share View"
          >
            {/* 4-Participant Apple-Style Face Grid */}
            <div className="grid grid-cols-2 grid-rows-2 gap-1.5 w-full h-full">
              {audienceList.map((p, idx) => (
                <div
                  key={p.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSpeakerIndex(idx);
                  }}
                  className={`relative rounded-lg overflow-hidden bg-zinc-900 border transition-all ${p.isSpeaking ? 'border-emerald-500/80 ring-2 ring-emerald-500/40' : 'border-white/10 hover:border-white/30'}`}
                >
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-1 flex items-center justify-between">
                    <span className="text-[8.5px] font-medium text-white/90 truncate">{p.name.split(' ')[0]}</span>
                    {p.isRoomMicOn ? (
                      <Mic size={9} className="text-emerald-400 shrink-0" />
                    ) : (
                      <MicOff size={9} className="text-white/60 shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Minimalist Apple-style Hover Overlay Controls (0ms Instant Response) */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/60 transition-opacity duration-200 flex flex-col justify-between p-2 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        >
          {/* Top Bar: Title & View Mode Toggle & Window Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-semibold text-white truncate max-w-[110px]">{displayTitle}</span>
            </div>

            {/* View Mode Segmented Switcher */}
            <div className="flex items-center bg-black/70 backdrop-blur-md rounded-lg p-0.5 border border-white/10 pointer-events-auto">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setViewMode('screen');
                }}
                className={`px-1.5 py-0.5 rounded-md text-[9px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${viewMode === 'screen' ? 'bg-white/25 text-white shadow-sm' : 'text-white/60 hover:text-white'}`}
                title="Show Screen Share View"
              >
                <Monitor size={10} />
                <span>Screen</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setViewMode('audience');
                }}
                className={`px-1.5 py-0.5 rounded-md text-[9px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${viewMode === 'audience' ? 'bg-violet-600 text-white shadow-sm' : 'text-white/60 hover:text-white'}`}
                title="Show Audience Faces View"
              >
                <Users size={10} />
                <span>Audience</span>
              </button>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1 pointer-events-auto">
              <button
                type="button"
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    if (window.electronAPI?.toggleLaserOverlay) {
                      await window.electronAPI.toggleLaserOverlay();
                    } else if (window.electronAPI?.returnToRoom) {
                      await window.electronAPI.returnToRoom();
                    }
                  } catch (err) {
                    console.warn('Laser overlay toggle error:', err);
                  }
                }}
                className="p-1 rounded-md bg-black/60 hover:bg-violet-600/80 text-zinc-200 hover:text-white transition-colors cursor-pointer backdrop-blur-md border border-white/10"
                title="Toggle Laser & Screen Annotations"
              >
                <LaserPointerIcon size={11} strokeWidth={1.6} />
              </button>
              <button
                type="button"
                onClick={handleReturnToApp}
                className="p-1 rounded-md bg-black/60 hover:bg-white/20 text-zinc-200 hover:text-white transition-colors cursor-pointer backdrop-blur-md border border-white/10"
                title="Expand to Full Room"
              >
                <Maximize2 size={11} />
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="p-1 rounded-md bg-black/60 hover:bg-rose-500/80 text-zinc-200 hover:text-white transition-colors cursor-pointer backdrop-blur-md border border-white/10"
                title="Close"
              >
                <X size={11} />
              </button>
            </div>
          </div>

          {/* Bottom Bar: Quick Switcher and Open Room Button */}
          <div className="flex items-center justify-between pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setViewMode(prev => (prev === 'screen' ? 'audience' : 'screen'));
              }}
              className="px-2 py-0.5 rounded-md bg-black/60 hover:bg-white/20 text-white/90 text-[9px] font-medium backdrop-blur-md border border-white/10 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <LayoutGrid size={9} />
              <span>{viewMode === 'screen' ? 'Flip to Faces' : 'Flip to Screen'}</span>
            </button>

            <button
              type="button"
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
