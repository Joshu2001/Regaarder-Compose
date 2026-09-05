import React, { useState, useEffect, useRef } from 'react';
import { Download, Monitor, ChevronDown, ChevronUp, X, Laptop, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';

/**
 * DesktopDownloadFloatingTrigger
 * 
 * Executive-tier floating download trigger for web visitors.
 * Detects client OS (macOS, Windows, Linux) and provides 1-tap download
 * for native installers (.dmg, .exe, .AppImage) and Chrome Web Store bundle.
 * 
 * Automatically hidden when running inside native Electron.
 * Adheres strictly to AGENTS.md:
 * - Apple aesthetic, progressive disclosure
 * - Slightly rounded rectangles (no pill shapes)
 * - onPointerDown for touch safety
 * - "outline" visual state tracking
 */
export default function DesktopDownloadFloatingTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [detectedOs, setDetectedOs] = useState('windows');
  const [isElectron, setIsElectron] = useState(false);
  const menuRef = useRef(null);

  // Check if already running in native Electron
  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI?.isElectron) {
      setIsElectron(true);
      return;
    }

    // Detect user OS
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

    // Check dismissed state in session
    try {
      const dismissed = sessionStorage.getItem('regaarder_download_dismissed');
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    } catch (_e) {}
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('pointerdown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
    };
  }, [isOpen]);

  if (isElectron || isDismissed) {
    return null;
  }

  const releasesBaseUrl = 'https://github.com/Joshu2001/Regaarder-Compose/releases';
  const downloadLinks = {
    windows: {
      primary: `${releasesBaseUrl}/latest/download/Regaarder-Compose-Setup.exe`,
      name: 'Windows (.exe / NSIS)',
      label: 'Windows 10 / 11 (64-bit)',
      ext: '.exe'
    },
    mac: {
      primary: `${releasesBaseUrl}/latest/download/Regaarder-Compose.dmg`,
      name: 'macOS Universal (.dmg)',
      label: 'macOS 12+ (Apple Silicon & Intel)',
      ext: '.dmg'
    },
    linux: {
      primary: `${releasesBaseUrl}/latest/download/Regaarder-Compose.AppImage`,
      name: 'Linux (.AppImage)',
      label: 'Ubuntu, Fedora, Debian',
      ext: '.AppImage'
    },
    deb: {
      primary: `${releasesBaseUrl}/latest/download/Regaarder-Compose.deb`,
      name: 'Debian / Ubuntu (.deb)',
      label: 'Debian x86_64',
      ext: '.deb'
    },
    extension: {
      primary: 'https://github.com/Joshu2001/Regaarder-Compose/raw/main/meneur-extension.zip',
      name: 'Meneur Extension (.zip)',
      label: 'Chrome Web Store Bundle',
      ext: '.zip'
    }
  };

  const currentPlatform = downloadLinks[detectedOs] || downloadLinks.windows;

  const handleDismiss = (e) => {
    e.stopPropagation();
    setIsDismissed(true);
    try {
      sessionStorage.setItem('regaarder_download_dismissed', 'true');
    } catch (_e) {}
  };

  return (
    <div
      ref={menuRef}
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end select-none font-sans"
      style={{ filter: 'drop-shadow(0 12px 28px rgba(0, 0, 0, 0.28))' }}
    >
      {/* Expanded Multi-Platform Dropdown */}
      {isOpen && (
        <div className="mb-3 w-80 rounded-xl bg-slate-900/95 dark:bg-[#12141a]/95 backdrop-blur-xl border border-white/10 text-white shadow-2xl p-4 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Laptop size={15} />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-100 tracking-tight">Regaarder Desktop</h4>
                <p className="text-[10px] text-slate-400">v1.0.0 • Native AI Execution</p>
              </div>
            </div>
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setIsOpen(false);
              }}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Close download menu"
            >
              <X size={14} />
            </button>
          </div>

          <div className="mt-3 space-y-1.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 px-1">
              Select Your Platform
            </p>

            {/* Windows */}
            <a
              href={downloadLinks.windows.primary}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between p-2 rounded-lg transition-colors text-left ${
                detectedOs === 'windows'
                  ? 'bg-indigo-600/15 border border-indigo-500/30 text-white'
                  : 'hover:bg-white/5 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Monitor size={15} className={detectedOs === 'windows' ? 'text-indigo-400' : 'text-slate-400'} />
                <div>
                  <p className="text-xs font-medium leading-tight">Windows Installer</p>
                  <p className="text-[10px] text-slate-400">{downloadLinks.windows.label}</p>
                </div>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">.exe</span>
            </a>

            {/* macOS */}
            <a
              href={downloadLinks.mac.primary}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between p-2 rounded-lg transition-colors text-left ${
                detectedOs === 'mac'
                  ? 'bg-indigo-600/15 border border-indigo-500/30 text-white'
                  : 'hover:bg-white/5 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Laptop size={15} className={detectedOs === 'mac' ? 'text-indigo-400' : 'text-slate-400'} />
                <div>
                  <p className="text-xs font-medium leading-tight">macOS Universal</p>
                  <p className="text-[10px] text-slate-400">{downloadLinks.mac.label}</p>
                </div>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">.dmg</span>
            </a>

            {/* Linux */}
            <a
              href={downloadLinks.linux.primary}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between p-2 rounded-lg transition-colors text-left ${
                detectedOs === 'linux'
                  ? 'bg-indigo-600/15 border border-indigo-500/30 text-white'
                  : 'hover:bg-white/5 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Monitor size={15} className={detectedOs === 'linux' ? 'text-indigo-400' : 'text-slate-400'} />
                <div>
                  <p className="text-xs font-medium leading-tight">Linux AppImage</p>
                  <p className="text-[10px] text-slate-400">{downloadLinks.linux.label}</p>
                </div>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">.AppImage</span>
            </a>

            {/* Chrome Web Store Extension */}
            <a
              href={downloadLinks.extension.primary}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 text-slate-300 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles size={15} className="text-amber-400" />
                <div>
                  <p className="text-xs font-medium leading-tight">Meneur Chrome Extension</p>
                  <p className="text-[10px] text-slate-400">Sidebar Command Deck</p>
                </div>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">.zip</span>
            </a>
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck size={12} />
              Verified & Code Signed
            </span>
            <a
              href={releasesBaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 hover:text-white transition-colors"
            >
              All Releases
              <ExternalLink size={10} />
            </a>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <div className="inline-flex items-stretch rounded-xl bg-slate-900/90 dark:bg-[#161820]/95 backdrop-blur-md border border-white/15 text-white shadow-xl overflow-hidden">
        {/* Primary 1-Tap Download for Detected OS */}
        <a
          href={currentPlatform.primary}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3.5 py-2.5 hover:bg-white/10 transition-colors text-xs font-medium text-slate-100"
          title={`Download Regaarder for ${currentPlatform.name}`}
        >
          <div className="w-5 h-5 rounded-md bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
            <Download size={12} />
          </div>
          <span className="tracking-tight">
            Download for <span className="font-semibold text-white capitalize">{detectedOs}</span>
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
            {currentPlatform.ext}
          </span>
        </a>

        {/* Popover Toggle Chevron */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            setIsOpen(prev => !prev);
          }}
          className="px-2 border-l border-white/10 hover:bg-white/10 transition-colors text-slate-300 flex items-center justify-center"
          aria-label="Toggle all platform download options"
          title="More platforms"
        >
          {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>

        {/* Dismiss Button */}
        <button
          type="button"
          onPointerDown={handleDismiss}
          className="px-2 border-l border-white/10 hover:bg-red-500/20 hover:text-red-300 transition-colors text-slate-400 flex items-center justify-center"
          aria-label="Dismiss download prompt"
          title="Dismiss"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}
