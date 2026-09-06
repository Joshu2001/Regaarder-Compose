import React, { useState, useEffect, useRef } from 'react';
import { Download, Monitor, Laptop, Terminal, ChevronDown, ChevronUp, X, ShieldCheck, ExternalLink, Minimize2 } from 'lucide-react';
import { RegaarderAiIcon } from '../RegaarderProductIcons';

/**
 * DesktopDownloadFloatingTrigger
 * 
 * Executive-tier floating download dock for Regaarder Desktop.
 * Provides 3 direct 1-tap download buttons simultaneously:
 * - Windows (.exe / NSIS Installer)
 * - macOS (.dmg Universal Binary)
 * - Linux (.AppImage Portable)
 * 
 * Plus quick access to the Meneur Chrome Web Store extension bundle (.zip).
 * 
 * Design Standards (AGENTS.md):
 * - Apple aesthetic, progressive disclosure
 * - Slightly rounded rectangles (rounded-xl, rounded-2xl), NO pill shapes
 * - onPointerDown for touch safety
 * - "outline" visual state tracking for active detected OS
 * - Zero generic sparkles (Rule 10)
 */
export default function DesktopDownloadFloatingTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [detectedOs, setDetectedOs] = useState('windows');
  const menuRef = useRef(null);

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

  // Click outside to close extra options dropdown
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
      label: 'macOS 12+ (Apple Silicon & Intel)',
      ext: '.dmg',
      icon: Laptop
    },
    linux: {
      url: `${releasesBaseUrl}/latest/download/Regaarder-Compose.AppImage`,
      name: 'Linux',
      label: 'Ubuntu, Fedora, Debian',
      ext: '.AppImage',
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
    if (typeof window !== 'undefined' && window.electronAPI?.isElectron) {
      e.preventDefault();
      if (osKey === 'windows' && window.electronAPI.showItemInFolder) {
        window.electronAPI.showItemInFolder();
        return;
      }
      if (window.electronAPI.openExternal) {
        window.electronAPI.openExternal(url);
        return;
      }
    }
  };

  // Minimized Floating Orb Button (Restores full dock when clicked)
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 select-none">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            setIsMinimized(false);
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/95 dark:bg-[#12141a]/95 text-white border border-white/15 shadow-2xl backdrop-blur-xl hover:bg-slate-800 transition-all cursor-pointer group"
          title="Open Native Desktop Downloads"
        >
          <div className="w-5 h-5 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
            <Download size={12} />
          </div>
          <span className="text-xs font-semibold text-slate-200 group-hover:text-white">
            Download App
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white/10 text-slate-300">
            {detectedOs === 'mac' ? '.dmg' : detectedOs === 'linux' ? '.AppImage' : '.exe'}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div
      ref={menuRef}
      role="region"
      aria-label="Regaarder Desktop Downloads"
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end select-none font-sans transition-all duration-200 animate-in fade-in slide-in-from-bottom-3"
      style={{ filter: 'drop-shadow(0 14px 32px rgba(0, 0, 0, 0.32))' }}
    >
      {/* ── Multi-Platform Dropdown (Extension / Debian / Releases) ── */}
      {isOpen && (
        <div className="mb-3 w-80 rounded-2xl bg-slate-900/95 dark:bg-[#12141a]/95 backdrop-blur-2xl border border-white/15 text-white shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Laptop size={14} />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-100 tracking-tight">Regaarder Desktop Ecosystem</h4>
                <p className="text-[10px] text-slate-400">v1.0.0 • Verified Binary Releases</p>
              </div>
            </div>
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setIsOpen(false);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close options"
            >
              <X size={13} />
            </button>
          </div>

          <div className="mt-2.5 space-y-1.5">
            {/* Chrome Web Store Extension Bundle */}
            <a
              href={downloadLinks.extension.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white border border-transparent hover:border-white/10 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-violet-500/20 border border-violet-400/30 flex items-center justify-center text-violet-300 shrink-0">
                  <RegaarderAiIcon size={13} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold leading-tight truncate">Meneur Chrome Extension</p>
                  <p className="text-[10px] text-slate-400 truncate">Browser Command Deck (Manifest V3)</p>
                </div>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 text-slate-300 font-mono shrink-0">
                .zip
              </span>
            </a>

            {/* Debian Linux Package */}
            <a
              href={`${releasesBaseUrl}/latest/download/Regaarder-Compose.deb`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white border border-transparent hover:border-white/10 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                  <Terminal size={13} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold leading-tight truncate">Debian / Ubuntu (.deb)</p>
                  <p className="text-[10px] text-slate-400 truncate">Debian x86_64 Native Package</p>
                </div>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 text-slate-300 font-mono shrink-0">
                .deb
              </span>
            </a>
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck size={12} />
              <span>Verified & Hardened Runtime</span>
            </span>
            <a
              href={releasesBaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-white transition-colors underline"
            >
              <span>All Releases</span>
              <ExternalLink size={10} />
            </a>
          </div>
        </div>
      )}

      {/* ── Main Executive Dock (3 1-Tap Download Buttons Side-by-Side) ── */}
      <div className="flex flex-col rounded-2xl bg-slate-900/95 dark:bg-[#12141a]/95 backdrop-blur-2xl border border-white/15 text-white shadow-2xl p-2.5 space-y-2">
        {/* Dock Header */}
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-slate-200 tracking-tight">
              Regaarder Desktop
            </span>
            <span className="text-[10px] text-slate-400 font-mono">v1.0</span>
          </div>

          <div className="flex items-center gap-1">
            {/* Options Toggle */}
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setIsOpen(prev => !prev);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={isOpen ? "Hide additional options" : "Show Chrome Extension & more formats"}
            >
              {isOpen ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
            </button>

            {/* Minimize to small floating button */}
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setIsMinimized(true);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Minimize download dock"
            >
              <Minimize2 size={12} />
            </button>
          </div>
        </div>

        {/* 3 Direct Download Buttons (Windows, macOS, Linux) */}
        <div className="flex items-center gap-1.5">
          {/* 1. Windows Button */}
          <a
            href={downloadLinks.windows.url}
            target="_blank"
            rel="noopener noreferrer"
            onPointerDown={(e) => handleDownload(e, downloadLinks.windows.url, 'windows')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              detectedOs === 'windows'
                ? 'bg-indigo-600 text-white border-indigo-400/50 shadow-md ring-1 ring-indigo-400/40'
                : 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border-white/10 hover:border-white/20'
            }`}
            title={`Download ${downloadLinks.windows.name} (${downloadLinks.windows.label})`}
          >
            <Monitor size={14} className={detectedOs === 'windows' ? 'text-white' : 'text-slate-300'} />
            <span>Windows</span>
            <span className={`text-[10px] font-mono px-1 py-0.2 rounded-md ${
              detectedOs === 'windows' ? 'bg-indigo-700/80 text-indigo-100' : 'bg-white/10 text-slate-300'
            }`}>
              .exe
            </span>
          </a>

          {/* 2. macOS Button */}
          <a
            href={downloadLinks.mac.url}
            target="_blank"
            rel="noopener noreferrer"
            onPointerDown={(e) => handleDownload(e, downloadLinks.mac.url, 'mac')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              detectedOs === 'mac'
                ? 'bg-indigo-600 text-white border-indigo-400/50 shadow-md ring-1 ring-indigo-400/40'
                : 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border-white/10 hover:border-white/20'
            }`}
            title={`Download ${downloadLinks.mac.name} (${downloadLinks.mac.label})`}
          >
            <Laptop size={14} className={detectedOs === 'mac' ? 'text-white' : 'text-slate-300'} />
            <span>macOS</span>
            <span className={`text-[10px] font-mono px-1 py-0.2 rounded-md ${
              detectedOs === 'mac' ? 'bg-indigo-700/80 text-indigo-100' : 'bg-white/10 text-slate-300'
            }`}>
              .dmg
            </span>
          </a>

          {/* 3. Linux Button */}
          <a
            href={downloadLinks.linux.url}
            target="_blank"
            rel="noopener noreferrer"
            onPointerDown={(e) => handleDownload(e, downloadLinks.linux.url, 'linux')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              detectedOs === 'linux'
                ? 'bg-indigo-600 text-white border-indigo-400/50 shadow-md ring-1 ring-indigo-400/40'
                : 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border-white/10 hover:border-white/20'
            }`}
            title={`Download ${downloadLinks.linux.name} (${downloadLinks.linux.label})`}
          >
            <Terminal size={14} className={detectedOs === 'linux' ? 'text-white' : 'text-slate-300'} />
            <span>Linux</span>
            <span className={`text-[10px] font-mono px-1 py-0.2 rounded-md ${
              detectedOs === 'linux' ? 'bg-indigo-700/80 text-indigo-100' : 'bg-white/10 text-slate-300'
            }`}>
              .AppImage
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
