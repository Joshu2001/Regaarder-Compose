import React, { useState, useEffect, useRef } from 'react';
import { Download, Monitor, Laptop, Terminal, ChevronDown, CheckCircle2, Loader2 } from 'lucide-react';

/**
 * DesktopDownloadFloatingTrigger
 * 
 * Micro-Alignment Polish:
 * - Perfectly aligns the right edge of the Windows/macOS/Linux stacked deck
 *   with the right edge of the "Download Desktop" button.
 * - Both elements share the exact same right-side visual axis.
 * - Preserves card height, vertical overlap (-4px), spacing, typography,
 *   colors, shadows, detected badge, and smooth Apple-style easing.
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
  const isExpandedRef = useRef(isExpanded);
  isExpandedRef.current = isExpanded;
  const downloadStateRef = useRef(downloadState);
  downloadStateRef.current = downloadState;

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

  // Dismiss on click outside ONLY when idle and user clicks genuinely outside
  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (downloadStateRef.current.status !== 'idle') {
        return;
      }
      if (!isExpandedRef.current) {
        return;
      }
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  // Keyboard navigation: Escape to close when idle
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isExpandedRef.current && downloadStateRef.current.status === 'idle') {
        e.preventDefault();
        setIsExpanded(false);
        anchorButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      subtitle: 'Ubuntu · Fedora · Arch',
      ext: '.AppImage',
      icon: Terminal,
      url: `${releasesBaseUrl}/latest/download/Regaarder-Compose.AppImage`
    }
  ];

  const handleDownload = (e, url, osKey) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    if (downloadState.status === 'downloading') return;

    // Immediately keep popover open and initiate active downloading state
    setIsExpanded(true);
    setDownloadState({
      platformKey: osKey,
      status: 'downloading',
      progress: 10
    });

    if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);

    let currentProgress = 10;
    progressTimerRef.current = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 15) + 12;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(progressTimerRef.current);

        try {
          if (typeof window !== 'undefined' && window.electronAPI?.isElectron) {
            if (osKey === 'windows' && window.electronAPI.showItemInFolder) {
              window.electronAPI.showItemInFolder();
            } else if (window.electronAPI.openExternal) {
              window.electronAPI.openExternal(url);
            }
          } else if (typeof window !== 'undefined') {
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', '');
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        } catch (err) {
          console.error('Download trigger error:', err);
        }

        setDownloadState({
          platformKey: osKey,
          status: 'completed',
          progress: 100
        });

        // Keep visible for feedback, then gently collapse
        autoCloseTimerRef.current = setTimeout(() => {
          setIsExpanded(false);
          setTimeout(() => {
            setDownloadState({
              platformKey: null,
              status: 'idle',
              progress: 0
            });
          }, 350);
        }, 8000);
      } else {
        setDownloadState(prev => ({
          ...prev,
          progress: currentProgress
        }));
      }
    }, 130);
  };

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Download Desktop App"
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans select-none"
      style={{ paddingRight: 0, marginRight: 0 }}
    >
      {/* ── Overlapping Physical Stacked Deck (Slides smoothly upward from behind the button) ── */}
      <div
        id="desktop-download-deck"
        role="menu"
        aria-label="Platform options"
        aria-hidden={!isExpanded}
        className={`flex flex-col items-stretch w-[304px] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] origin-bottom ${
          isExpanded
            ? 'opacity-100 translate-y-0 pointer-events-auto mb-3.5'
            : 'opacity-0 translate-y-3 pointer-events-none mb-0 h-0 overflow-hidden'
        }`}
        style={{ marginRight: 0 }}
      >
        {downloadPlatforms.map((platform, index) => {
          const Icon = platform.icon;
          const isDetected = detectedOs === platform.key;
          const isThisDownloading = downloadState.platformKey === platform.key && downloadState.status === 'downloading';
          const isThisCompleted = downloadState.platformKey === platform.key && downloadState.status === 'completed';
          
          // Layered visual hierarchy: Top cards have higher z-index & slightly crisper contrast
          const zIndex = 30 - index;
          // Refined overlap: -4px gives clear layered deck feel without compressing the contents
          const marginTop = index === 0 ? '0px' : '-4px';
          
          // Subtle restrained styling for detected OS: soft border & elevation without harsh neon outlines
          let cardBg = 'bg-[#141722]/95 hover:bg-[#1a1e2b]/95 text-slate-200 hover:text-white border-white/10 hover:border-white/15';
          if (isThisDownloading || isThisCompleted) {
            cardBg = 'bg-[#181c2b]/98 text-white border-indigo-500/50 shadow-lg shadow-indigo-950/40';
          } else if (isDetected) {
            cardBg = 'bg-[#171b28]/95 hover:bg-[#1d2232]/95 text-white border-slate-600/40 shadow-md shadow-black/20';
          } else if (index === 2) {
            // Lowest card (Linux) has slightly softer contrast for layered depth
            cardBg = 'bg-[#12141d]/90 hover:bg-[#171a26]/95 text-slate-300 hover:text-white border-white/[0.07] hover:border-white/15';
          }

          return (
            <div
              key={platform.key}
              role="menuitem"
              tabIndex={isExpanded ? 0 : -1}
              onClick={(e) => handleDownload(e, platform.url, platform.key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleDownload(e, platform.url, platform.key);
                }
              }}
              style={{
                zIndex,
                marginTop,
                transitionDelay: isExpanded ? `${index * 30}ms` : `${(2 - index) * 20}ms`,
                marginRight: 0
              }}
              className={`relative overflow-hidden flex flex-col justify-center px-4 py-3.5 min-h-[58px] rounded-2xl border text-left cursor-pointer transition-all duration-200 group outline-none focus-visible:ring-1 focus-visible:ring-indigo-400 backdrop-blur-xl ${cardBg}`}
            >
              {/* Card Top Row */}
              <div className="flex items-center justify-between w-full">
                {/* Left Side: Icon + OS Details */}
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  {/* Subtle circular icon wrapper */}
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      isThisCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
                        : isThisDownloading
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
                        : isDetected
                        ? 'bg-white/10 text-slate-300 border border-white/15'
                        : 'bg-white/[0.05] text-slate-400 border border-white/[0.08] group-hover:text-slate-200'
                    }`}
                  >
                    {isThisCompleted ? (
                      <CheckCircle2 size={13} className="text-emerald-400" />
                    ) : isThisDownloading ? (
                      <Loader2 size={13} className="animate-spin text-indigo-300" />
                    ) : (
                      <Icon size={12} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 leading-none">
                      <span className="font-semibold text-xs text-white">
                        {platform.name}
                      </span>
                      {isThisCompleted ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-medium leading-none">
                          Downloaded
                        </span>
                      ) : isThisDownloading ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-500/25 text-indigo-300 font-medium animate-pulse leading-none">
                          {downloadState.progress}%
                        </span>
                      ) : isDetected ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/10 text-slate-300 font-medium border border-white/10 leading-none">
                          Detected
                        </span>
                      ) : null}
                    </div>
                    <span className="text-[11px] text-slate-400 group-hover:text-slate-300 block truncate leading-snug mt-1">
                      {isThisDownloading ? `Downloading binary (${downloadState.progress}%)...` : platform.subtitle}
                    </span>
                  </div>
                </div>

                {/* Right Side: Extension Tag + Action Icon */}
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                      isDetected || isThisDownloading
                        ? 'bg-white/10 text-slate-200'
                        : 'bg-white/[0.06] text-slate-400'
                    }`}
                  >
                    {platform.ext}
                  </span>
                  <div className="w-5 h-5 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-white group-hover:translate-y-0.5 transition-all">
                    {isThisCompleted ? (
                      <CheckCircle2 size={13} className="text-emerald-400" />
                    ) : (
                      <Download size={13} className={isThisDownloading ? 'text-indigo-300 animate-bounce' : ''} />
                    )}
                  </div>
                </div>
              </div>

              {/* In-Card Progress Track */}
              {isThisDownloading && (
                <div className="w-full mt-2.5 bg-white/10 rounded-full h-1 overflow-hidden">
                  <div
                    className="bg-indigo-400 h-full rounded-full transition-all duration-120 ease-out"
                    style={{ width: `${downloadState.progress}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Primary Bottom-Right Anchor Button ── */}
      <div className="relative z-40 flex justify-end w-full" style={{ marginRight: 0 }}>
        <button
          ref={anchorButtonRef}
          type="button"
          aria-haspopup="menu"
          aria-expanded={isExpanded}
          aria-controls="desktop-download-deck"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsExpanded(prev => !prev);
          }}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border backdrop-blur-2xl transition-all duration-200 cursor-pointer shadow-lg group outline-none focus-visible:ring-1 focus-visible:ring-indigo-400 ${
            downloadState.status === 'downloading'
              ? 'bg-[#181c2b]/98 text-white border-indigo-500/50 shadow-indigo-950/40'
              : isExpanded
              ? 'bg-indigo-600 text-white border-indigo-500/60 shadow-indigo-900/30'
              : 'bg-[#141722]/95 hover:bg-[#1a1e2b]/95 text-white border-white/15 hover:border-white/25'
          }`}
          title="Download Regaarder Desktop App"
          style={{ marginRight: 0 }}
        >
          {/* Download Icon Badge / Spinner */}
          <div
            className={`w-6 h-6 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
              downloadState.status === 'downloading'
                ? 'bg-indigo-500/20 text-indigo-300'
                : downloadState.status === 'completed'
                ? 'bg-emerald-500/20 text-emerald-300'
                : isExpanded
                ? 'bg-white/20 text-white'
                : 'bg-white/10 text-slate-200'
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

          {/* Clean Label */}
          <span className="text-xs font-semibold text-white tracking-tight">
            {downloadState.status === 'downloading'
              ? `Downloading (${downloadState.progress}%)`
              : downloadState.status === 'completed'
              ? 'Download Complete'
              : 'Download Desktop'}
          </span>

          {/* Refined Chevron with 180-degree rotation */}
          <div
            className={`text-slate-400 group-hover:text-white transition-transform duration-300 ease-out ml-0.5 ${
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
