import React, { useState, useEffect, useRef } from 'react';
import { Download, Monitor, Laptop, Terminal, ChevronUp, ChevronDown, X, ShieldCheck, ExternalLink } from 'lucide-react';
import { RegaarderAiIcon } from '../RegaarderProductIcons';

/**
 * DesktopDownloadFloatingTrigger
 * 
 * Executive-tier floating corner flag docked at the bottom-right corner.
 * - Stays compact, unobtrusive, and docked like a flag by default.
 * - Glides upward smoothly into an Apple-style vertical stack on hover or click.
 * - Direct 1-tap download buttons stacked vertically:
 *     1. Windows (.exe)
 *     2. macOS (.dmg)
 *     3. Linux (.AppImage)
 * - Secondary drawer for Extension & .deb package.
 * 
 * Directives Followed:
 * - Rule 3: Slightly rounded rectangles (rounded-xl, rounded-2xl), NO pill shapes or ellipses.
 * - Rule 6: Touch-safe onPointerDown + onClick stopPropagation.
 * - Rule 10: RegaarderAiIcon used exclusively, zero generic sparkles.
 */
export default function DesktopDownloadFloatingTrigger() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [detectedOs, setDetectedOs] = useState('windows');
  const containerRef = useRef(null);
  const closeTimeoutRef = useRef(null);

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
        setShowMoreOptions(false);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
    };
  }, []);

  // Smooth hover open/close with slight debounce
  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
      setShowMoreOptions(false);
    }, 350);
  };

  const releasesBaseUrl = 'https://github.com/Joshu2001/Regaarder-Compose/releases';
  const downloadLinks = {
    windows: {
      url: `${releasesBaseUrl}/latest/download/Regaarder-Compose-Setup.exe`,
      name: 'Windows',
      label: 'Windows 10 / 11 (64-bit)',
      ext: '.exe',
      icon: Monitor
    },
    mac: {
      url: `${releasesBaseUrl}/latest/download/Regaarder-Compose.dmg`,
      name: 'macOS',
      label: 'macOS 12+ (Universal)',
      ext: '.dmg',
      icon: Laptop
    },
    linux: {
      url: `${releasesBaseUrl}/latest/download/Regaarder-Compose.AppImage`,
      name: 'Linux',
      label: 'Ubuntu, Fedora, Arch',
      ext: '.AppImage',
      icon: Terminal
    },
    deb: {
      url: `${releasesBaseUrl}/latest/download/Regaarder-Compose.deb`,
      name: 'Debian / Ubuntu',
      ext: '.deb',
      icon: Terminal
    },
    extension: {
      url: 'https://github.com/Joshu2001/Regaarder-Compose/raw/main/meneur-extension.zip',
      name: 'Meneur Extension',
      label: 'Chrome Web Store Bundle',
      ext: '.zip'
    }
  };

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

  const primary = downloadLinks[detectedOs] || downloadLinks.windows;

  // OS platforms in ordered stack
  const platformOrder = ['windows', 'mac', 'linux'];

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="region"
      aria-label="Download Desktop App"
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans select-none"
    >
      {/* ── Auxiliary Extended Drawer (Extension / .deb) ── */}
      {showMoreOptions && isExpanded && (
        <div className="mb-2 w-72 p-3 rounded-2xl bg-slate-900/95 dark:bg-[#12141a]/95 backdrop-blur-2xl border border-white/15 text-white shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-[11px] font-semibold text-slate-300 tracking-tight">Additional Ecosystem</span>
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setShowMoreOptions(false);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>

          <div className="mt-2 space-y-1.5">
            {/* Chrome Web Store Extension */}
            <a
              href={downloadLinks.extension.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-violet-500/20 border border-violet-400/30 flex items-center justify-center text-violet-300">
                  <RegaarderAiIcon size={12} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-100">Meneur Extension</p>
                  <p className="text-[9px] text-slate-400">Chrome Web Store (MV3)</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white/10 text-slate-300">
                .zip
              </span>
            </a>

            {/* Debian .deb package */}
            <a
              href={downloadLinks.deb.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                  <Terminal size={12} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-100">Debian / Ubuntu</p>
                  <p className="text-[9px] text-slate-400">Debian x86_64 Package</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white/10 text-slate-300">
                .deb
              </span>
            </a>
          </div>

          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck size={11} />
              <span>Verified Releases</span>
            </span>
            <a
              href={releasesBaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-white underline transition-colors"
            >
              <span>View All</span>
              <ExternalLink size={9} />
            </a>
          </div>
        </div>
      )}

      {/* ── Vertically Stacked Platform Items (Glides Upward) ── */}
      <div
        className={`flex flex-col items-end gap-1.5 transition-all duration-300 ease-out origin-bottom ${
          isExpanded
            ? 'opacity-100 translate-y-0 pointer-events-auto mb-2 max-h-96'
            : 'opacity-0 translate-y-4 pointer-events-none mb-0 max-h-0 overflow-hidden'
        }`}
      >
        {/* Dock Header Banner */}
        <div className="w-64 flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-900/90 dark:bg-[#12141a]/90 backdrop-blur-xl border border-white/15 text-white shadow-lg">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-slate-200">Regaarder Desktop</span>
            <span className="text-[9px] font-mono text-slate-400">v1.0</span>
          </div>
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              setShowMoreOptions(prev => !prev);
            }}
            className="text-[10px] text-indigo-300 hover:text-indigo-200 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span>More</span>
            {showMoreOptions ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
          </button>
        </div>

        {/* 3 Vertically Stacked Download Buttons */}
        {platformOrder.map((key) => {
          const item = downloadLinks[key];
          const Icon = item.icon;
          const isDetected = detectedOs === key;

          return (
            <button
              key={key}
              type="button"
              onClick={(e) => handleDownload(e, item.url, key)}
              onPointerDown={(e) => handleDownload(e, item.url, key)}
              className={`w-64 flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold backdrop-blur-xl border shadow-lg transition-all duration-200 cursor-pointer text-left group ${
                isDetected
                  ? 'bg-indigo-600/95 hover:bg-indigo-500 text-white border-indigo-400/50 ring-1 ring-indigo-400/30'
                  : 'bg-slate-900/90 dark:bg-[#12141a]/90 hover:bg-slate-800 text-slate-200 hover:text-white border-white/15'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 ${
                  isDetected ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-300'
                }`}>
                  <Icon size={13} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[12px]">{item.name}</span>
                    {isDetected && (
                      <span className="text-[9px] px-1 py-0.2 rounded-md bg-white/25 text-white font-medium">
                        Your OS
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] block font-normal ${isDetected ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {item.label}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                  isDetected ? 'bg-indigo-800/80 text-indigo-100' : 'bg-white/10 text-slate-300'
                }`}>
                  {item.ext}
                </span>
                <Download size={13} className={`transition-transform group-hover:translate-y-0.5 ${
                  isDetected ? 'text-white' : 'text-slate-400 group-hover:text-white'
                }`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Docked Anchor Flag (Persistent Bottom-Right Tab) ── */}
      <div className="flex items-center shadow-2xl rounded-xl">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(prev => !prev);
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            setIsExpanded(prev => !prev);
          }}
          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border backdrop-blur-xl transition-all duration-200 cursor-pointer shadow-lg group ${
            isExpanded
              ? 'bg-indigo-600 text-white border-indigo-400/60 ring-2 ring-indigo-400/40'
              : 'bg-slate-900/95 dark:bg-[#12141a]/95 hover:bg-slate-800 text-white border-white/15 hover:border-white/25'
          }`}
          title="Download Regaarder Desktop App"
        >
          {/* Icon Badge */}
          <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 ${
            isExpanded ? 'bg-white/20 text-white' : 'bg-indigo-500/20 border border-indigo-400/30 text-indigo-400'
          }`}>
            <Download size={12} />
          </div>

          {/* Text Info */}
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span>Download Desktop</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
              isExpanded ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-300'
            }`}>
              {primary.ext}
            </span>
          </div>

          {/* Glide / Collapse indicator */}
          <div className="text-slate-400 group-hover:text-white transition-transform">
            {isExpanded ? (
              <ChevronDown size={14} className="text-white" />
            ) : (
              <ChevronUp size={14} />
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
