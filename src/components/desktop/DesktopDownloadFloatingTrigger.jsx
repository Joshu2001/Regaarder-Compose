import React, { useState, useEffect, useRef } from 'react';
import { Download, Monitor, Laptop, Terminal, ChevronDown } from 'lucide-react';

/**
 * DesktopDownloadFloatingTrigger
 * 
 * Stacked Anchored Download Popover for Regaarder Desktop.
 * 
 * Key Requirements:
 * - "Download Desktop" anchored as the primary bottom-right button.
 * - Smooth physical stacked-deck interaction: 3 platform cards layered/overlapping vertically
 *   expanding upward from behind the button on click.
 * - Platform cards:
 *     - Windows: Windows 10/11 · 64-bit · .exe · download icon
 *     - macOS: macOS 12+ · Universal · .dmg · download icon
 *     - Linux: Ubuntu, Fedora, Arch · AppImage · download icon
 * - Detected OS receives subtle primary emphasis (refined outline & crisp contrast, not washed out).
 * - Refined chevron that smoothly rotates 180° when open.
 * - Escape key dismiss, focus trap/outline navigation, click-outside dismissal.
 * - Spatial continuity: cards collapse back toward the anchor button cleanly.
 * - Restrained glassmorphism, subtle borders/shadows matching Regaarder design.
 */
export default function DesktopDownloadFloatingTrigger() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [detectedOs, setDetectedOs] = useState('windows');
  const containerRef = useRef(null);
  const anchorButtonRef = useRef(null);

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

  // Dismiss on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
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
  }, [isExpanded]);

  // Keyboard navigation: Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isExpanded) {
        e.preventDefault();
        setIsExpanded(false);
        anchorButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

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

    // 1. Inside Electron desktop app
    if (typeof window !== 'undefined' && window.electronAPI?.isElectron) {
      if (osKey === 'windows' && window.electronAPI.showItemInFolder) {
        window.electronAPI.showItemInFolder();
        return;
      }
      if (window.electronAPI.openExternal) {
        window.electronAPI.openExternal(url);
        return;
      }
    }

    // 2. In normal web browser
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
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
        className={`flex flex-col items-stretch w-[280px] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom ${
          isExpanded
            ? 'opacity-100 translate-y-0 pointer-events-auto mb-2'
            : 'opacity-0 translate-y-4 pointer-events-none mb-0 h-0 overflow-hidden'
        }`}
      >
        {downloadPlatforms.map((platform, index) => {
          const Icon = platform.icon;
          const isDetected = detectedOs === platform.key;
          // Calculate card stacking z-index & subtle overlap
          // Top card index 0 has highest visual level when stacked, or bottom up
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
              className={`relative flex items-center justify-between px-3.5 py-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 group outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-md ${
                isDetected
                  ? 'bg-slate-900/95 dark:bg-[#141720]/95 text-white border-indigo-500/40 ring-1 ring-indigo-500/30 hover:border-indigo-400 hover:bg-slate-800/95'
                  : 'bg-slate-900/90 dark:bg-[#12141a]/90 hover:bg-slate-800/95 text-slate-200 hover:text-white border-white/10 hover:border-white/20'
              }`}
            >
              {/* Left Side: Icon + OS Details */}
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                    isDetected
                      ? 'bg-indigo-600/30 border border-indigo-500/40 text-indigo-300'
                      : 'bg-white/10 border border-white/10 text-slate-300 group-hover:text-white'
                  }`}
                >
                  <Icon size={14} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs text-white leading-tight">
                      {platform.name}
                    </span>
                    {isDetected && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-indigo-500/25 border border-indigo-400/30 text-indigo-300 font-medium">
                        Detected
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 group-hover:text-slate-300 block truncate leading-snug mt-0.5">
                    {platform.subtitle}
                  </span>
                </div>
              </div>

              {/* Right Side: Extension Tag + Action Icon */}
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                    isDetected
                      ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-400/20'
                      : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {platform.ext}
                </span>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-white group-hover:translate-y-0.5 transition-all">
                  <Download size={13} />
                </div>
              </div>
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
            isExpanded
              ? 'bg-indigo-600 text-white border-indigo-400/60 ring-1 ring-indigo-400/40 shadow-indigo-500/20'
              : 'bg-slate-900/95 dark:bg-[#12141a]/95 hover:bg-slate-800/95 text-white border-white/15 hover:border-white/25'
          }`}
          title="Download Regaarder Desktop App"
        >
          {/* Download Icon Badge */}
          <div
            className={`w-6 h-6 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
              isExpanded
                ? 'bg-white/20 text-white'
                : 'bg-indigo-500/20 border border-indigo-400/30 text-indigo-400'
            }`}
          >
            <Download size={13} />
          </div>

          {/* Label + Detected Extension */}
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="text-white tracking-tight">Download Desktop</span>
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
