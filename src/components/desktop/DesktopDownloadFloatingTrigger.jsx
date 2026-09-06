import React, { useState, useEffect, useRef } from 'react';
import { Download, Monitor, Laptop, Terminal, ChevronDown, CheckCircle2, Loader2 } from 'lucide-react';

/**
 * DesktopDownloadFloatingTrigger
 * 
 * Stacked Anchored Download Popover with Download Progress Feedback:
 * - Anchored "Download Desktop" bottom-right button with 180-deg rotating chevron.
 * - Stays stably open when a platform download is triggered.
 * - Displays active downloading progress / feedback animation directly within the card
 *   and anchor button (Progress bar %, bytes simulated or live trigger, completed state).
 * - Remains open for several seconds after download before gracefully auto-collapsing.
 * - Eliminates unwanted premature dismissals.
 */
export default function DesktopDownloadFloatingTrigger() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [detectedOs, setDetectedOs] = useState('windows');
  
  // Download progress tracking state: { platformKey, status: 'idle' | 'downloading' | 'completed', progress: number }
  const [downloadState, setDownloadState] = useState({
    platformKey: null,
    status: 'idle',
    progress: 0
  });

  const containerRef = useRef(null);
  const anchorButtonRef = useRef(null);
  const progressTimerRef = useRef(null);
  const autoCloseTimerRef = useRef(null);

  // Detect user OS
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent || '';
      if (/mac|darwin/i.test(ua)) {
        setDetectedOs('mac');
      } else if (/linux/i.test(ua) && !/android/i.test(ua)) {
        setDetectedOs('linux');
      } else {
        setDetectedOs('windows');
      }
    }
  }, []);

  // Dismiss on outside click ONLY when not actively downloading
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (downloadState.status === 'downloading') {
        return; // Keep popover open while downloading
      }
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsExpanded(false);
      }
    };
    if (isExpanded) {
      document.addEventListener('pointerdown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
    };
  }, [isExpanded, downloadState.status]);

  // Keyboard navigation: Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isExpanded && downloadState.status !== 'downloading') {
        e.preventDefault();
        setIsExpanded(false);
        anchorButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded, downloadState.status]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    };
  }, []);

  const releasesBaseUrl = 'https://github.com/Joshu2001/Regaarder-Compose/releases';
  const downloadPlatforms = [
    {
      key: 'windows',
      name: 'Windows',
      subtitle: 'Windows 10/11 · 64-bit',
      ext: '.exe',
      icon: Monitor,
      url: `${releasesBaseUrl}/latest/download/Regaarder-Compose-Setup.exe`
    },
    {
      key: 'mac',
      name: 'macOS',
      subtitle: 'macOS 12+ · Universal',
      ext: '.dmg',
      icon: Laptop,
      url: `${releasesBaseUrl}/latest/download/Regaarder-Compose.dmg`
    },
    {
      key: 'linux',
      name: 'Linux',
      subtitle: 'Ubuntu, Fedora, Arch · AppImage',
      ext: '.AppImage',
      icon: Terminal,
      url: `${releasesBaseUrl}/latest/download/Regaarder-Compose.AppImage`
    }
  ];

  const handleDownload = (e, url, osKey) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    // Prevent re-triggering if already in progress
    if (downloadState.status === 'downloading') return;

    // Ensure popover remains open and starts progress feedback
    setIsExpanded(true);
    setDownloadState({
      platformKey: osKey,
      status: 'downloading',
      progress: 5
    });

    if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);

    // Progressive download animation feedback
    let currentProgress = 5;
    progressTimerRef.current = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 15) + 10;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(progressTimerRef.current);

        // Execute actual OS download / native reveal
        if (typeof window !== 'undefined' && window.electronAPI?.isElectron) {
          if (osKey === 'windows' && window.electronAPI.showItemInFolder) {
            window.electronAPI.showItemInFolder();
          } else if (window.electronAPI.openExternal) {
            window.electronAPI.openExternal(url);
          }
        } else if (typeof window !== 'undefined') {
          // Trigger file download in browser
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', '');
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        setDownloadState({
          platformKey: osKey,
          status: 'completed',
          progress: 100
        });

        // Keep open for 4 seconds after download completes so user can see verification, then gently collapse
        autoCloseTimerRef.current = setTimeout(() => {
          setIsExpanded(false);
          // Reset status after collapse animation
          setTimeout(() => {
            setDownloadState({
              platformKey: null,
              status: 'idle',
              progress: 0
            });
          }, 400);
        }, 4000);
      } else {
        setDownloadState(prev => ({
          ...prev,
          progress: currentProgress
        }));
      }
    }, 160);
  };

  const detectedPlatform = downloadPlatforms.find(p => p.key === detectedOs) || downloadPlatforms[0];

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Download Desktop App"
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans select-none"
    >
      {/* ── Overlapping Physical Stacked Deck (Expands upward from behind the button) ── */}
      <div
        id="desktop-download-deck"
        role="menu"
        aria-label="Platform options"
        aria-hidden={!isExpanded}
        className={`flex flex-col items-stretch w-[290px] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom ${
          isExpanded
            ? 'opacity-100 translate-y-0 pointer-events-auto mb-2'
            : 'opacity-0 translate-y-4 pointer-events-none mb-0 h-0 overflow-hidden'
        }`}
      >
        {downloadPlatforms.map((platform, index) => {
          const Icon = platform.icon;
          const isDetected = detectedOs === platform.key;
          const isThisDownloading = downloadState.platformKey === platform.key && downloadState.status === 'downloading';
          const isThisCompleted = downloadState.platformKey === platform.key && downloadState.status === 'completed';
          const zIndex = 30 - index;
          
          return (
            <button
              key={platform.key}
              role="menuitem"
              tabIndex={isExpanded ? 0 : -1}
              onClick={(e) => handleDownload(e, platform.url, platform.key)}
              onPointerDown={(e) => handleDownload(e, platform.url, platform.key)}
              style={{
                zIndex,
                marginTop: index > 0 ? '-6px' : '0px',
                transitionDelay: isExpanded ? `${index * 35}ms` : `${(2 - index) * 20}ms`
              }}
              className={`relative overflow-hidden flex flex-col px-3.5 py-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 group outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-md ${
                isThisDownloading || isThisCompleted
                  ? 'bg-slate-900/98 dark:bg-[#141720]/98 text-white border-indigo-500 ring-2 ring-indigo-500/40 shadow-indigo-500/20'
                  : isDetected
                  ? 'bg-slate-900/95 dark:bg-[#141720]/95 text-white border-indigo-500/40 ring-1 ring-indigo-500/30 hover:border-indigo-400 hover:bg-slate-800/95'
                  : 'bg-slate-900/90 dark:bg-[#12141a]/90 hover:bg-slate-800/95 text-slate-200 hover:text-white border-white/10 hover:border-white/20'
              }`}
            >
              {/* Card Top Row */}
              <div className="flex items-center justify-between w-full">
                {/* Left Side: Icon + OS Details */}
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      isThisCompleted
                        ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-400'
                        : isThisDownloading
                        ? 'bg-indigo-600/30 border border-indigo-500/40 text-indigo-300'
                        : isDetected
                        ? 'bg-indigo-600/30 border border-indigo-500/40 text-indigo-300'
                        : 'bg-white/10 border border-white/10 text-slate-300 group-hover:text-white'
                    }`}
                  >
                    {isThisCompleted ? (
                      <CheckCircle2 size={15} className="text-emerald-400" />
                    ) : isThisDownloading ? (
                      <Loader2 size={15} className="animate-spin text-indigo-300" />
                    ) : (
                      <Icon size={14} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs text-white leading-tight">
                        {platform.name}
                      </span>
                      {isThisCompleted ? (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-medium">
                          Downloaded
                        </span>
                      ) : isThisDownloading ? (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-indigo-500/25 border border-indigo-400/30 text-indigo-300 font-medium animate-pulse">
                          {downloadState.progress}%
                        </span>
                      ) : isDetected ? (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-indigo-500/25 border border-indigo-400/30 text-indigo-300 font-medium">
                          Detected
                        </span>
                      ) : null}
                    </div>
                    <span className="text-[10px] text-slate-400 group-hover:text-slate-300 block truncate leading-snug mt-0.5">
                      {isThisDownloading ? `Downloading binary (${downloadState.progress}%)...` : platform.subtitle}
                    </span>
                  </div>
                </div>

                {/* Right Side: Extension Tag + Action Icon */}
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                      isDetected || isThisDownloading
                        ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-400/20'
                        : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {platform.ext}
                  </span>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-white group-hover:translate-y-0.5 transition-all">
                    {isThisCompleted ? (
                      <CheckCircle2 size={13} className="text-emerald-400" />
                    ) : (
                      <Download size={13} className={isThisDownloading ? 'text-indigo-300 animate-bounce' : ''} />
                    )}
                  </div>
                </div>
              </div>

              {/* In-Card Progress Bar when downloading */}
              {isThisDownloading && (
                <div className="w-full mt-2 bg-white/10 rounded-full h-1 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-150 ease-out"
                    style={{ width: `${downloadState.progress}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Primary Bottom-Right Anchor Button ── */}
      <div className="relative z-40">
        <button
          ref={anchorButtonRef}
          type="button"
          aria-haspopup="menu"
          aria-expanded={isExpanded}
          aria-controls="desktop-download-deck"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(prev => !prev);
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            setIsExpanded(prev => !prev);
          }}
          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border backdrop-blur-2xl transition-all duration-200 cursor-pointer shadow-xl group outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
            downloadState.status === 'downloading'
              ? 'bg-slate-900/95 text-white border-indigo-500/60 ring-2 ring-indigo-500/40 shadow-indigo-500/20'
              : isExpanded
              ? 'bg-indigo-600 text-white border-indigo-400/60 ring-1 ring-indigo-400/40 shadow-indigo-500/20'
              : 'bg-slate-900/95 dark:bg-[#12141a]/95 hover:bg-slate-800/95 text-white border-white/15 hover:border-white/25'
          }`}
          title="Download Regaarder Desktop App"
        >
          {/* Download Icon Badge / Spinner */}
          <div
            className={`w-6 h-6 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
              downloadState.status === 'downloading'
                ? 'bg-indigo-500/20 border border-indigo-400/40 text-indigo-300'
                : downloadState.status === 'completed'
                ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-300'
                : isExpanded
                ? 'bg-white/20 text-white'
                : 'bg-indigo-500/20 border border-indigo-400/30 text-indigo-400'
            }`}
          >
            {downloadState.status === 'downloading' ? (
              <Loader2 size={13} className="animate-spin text-indigo-300" />
            ) : downloadState.status === 'completed' ? (
              <CheckCircle2 size={13} className="text-emerald-400" />
            ) : (
              <Download size={13} />
            )}
          </div>

          {/* Label + Progress Status */}
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="text-white tracking-tight">
              {downloadState.status === 'downloading'
                ? `Downloading (${downloadState.progress}%)`
                : downloadState.status === 'completed'
                ? 'Download Complete'
                : 'Download Desktop'}
            </span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                isExpanded ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-300'
              }`}
            >
              {detectedPlatform.ext}
            </span>
          </div>

          {/* Refined Chevron with 180-degree rotation */}
          <div
            className={`text-slate-400 group-hover:text-white transition-transform duration-300 ease-out ${
              isExpanded ? 'rotate-180 text-white' : 'rotate-0'
            }`}
          >
            <ChevronDown size={14} />
          </div>
        </button>
      </div>
    </div>
  );
}
