import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Download, 
  ArrowRight, 
  Monitor, 
  Laptop, 
  Terminal, 
  Sparkles, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  Check, 
  ExternalLink,
  ChevronDown,
  Layers,
  Flame,
  Globe
} from 'lucide-react';
import RegaarderBrandIcon from '../RegaarderBrandIcon';
import workspacePreviewImg from '../../assets/images/workspace-preview.png';

export default function DownloadPage({ previewVideoSrc = null }) {
  const [activeNarrativeIndex, setActiveNarrativeIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const heroNarratives = [
    {
      badge: 'Cognitive Memory',
      title: 'Your workspace remembers what you forget.',
      subtitle: 'Traditional tools make you remember folders and exact keywords. Regaarder understands what you actually meant, connecting your past thoughts to what you need today.'
    },
    {
      badge: 'Unified Architecture',
      title: 'Every tool you need, speaking the same language.',
      subtitle: 'Documents, spreadsheets, presentations, and whiteboards in one calm ecosystem. No tab clutter, no copy-pasting between apps, and no broken context.'
    },
    {
      badge: 'Sovereignty & Privacy',
      title: 'Intelligent, completely private, and yours forever.',
      subtitle: 'World-class intelligence running directly on your machine. Your proprietary thoughts never train cloud models, and your workspace is yours to own for life.'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setActiveNarrativeIndex((prev) => (prev + 1) % heroNarratives.length);
        setIsFading(false);
      }, 400);
    }, 7500);

    return () => clearInterval(interval);
  }, [heroNarratives.length]);

  const [detectedOs, setDetectedOs] = useState({
    name: 'Windows',
    tag: 'Windows 10 / 11 (64-bit)',
    ext: '.exe',
    arch: 'x64 Installer',
    href: 'https://github.com/Joshu2001/Regaarder-Compose/releases/latest',
    icon: Monitor
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const userAgent = window.navigator.userAgent.toLowerCase();
    const platform = window.navigator.platform?.toLowerCase() || '';

    if (platform.includes('mac') || userAgent.includes('macintosh') || userAgent.includes('mac os')) {
      setDetectedOs({
        name: 'macOS',
        tag: 'macOS 12.0+ (Apple Silicon & Intel)',
        ext: '.dmg',
        arch: 'Universal Binary',
        href: 'https://github.com/Joshu2001/Regaarder-Compose/releases/latest',
        icon: Laptop
      });
    } else if (platform.includes('linux') || userAgent.includes('linux')) {
      setDetectedOs({
        name: 'Linux',
        tag: 'Ubuntu, Fedora, Debian',
        ext: '.AppImage',
        arch: 'x86_64',
        href: 'https://github.com/Joshu2001/Regaarder-Compose/releases/latest',
        icon: Terminal
      });
    } else {
      setDetectedOs({
        name: 'Windows',
        tag: 'Windows 10 / 11 (64-bit)',
        ext: '.exe',
        arch: 'Setup Installer',
        href: 'https://github.com/Joshu2001/Regaarder-Compose/releases/latest',
        icon: Monitor
      });
    }
  }, []);

  const downloadOptions = [
    {
      os: 'macOS',
      arch: 'Apple Silicon (M1 / M2 / M3 / M4)',
      filename: 'Regaarder-mac-arm64.dmg',
      tag: 'Universal .dmg',
      href: 'https://github.com/Joshu2001/Regaarder-Compose/releases/latest',
      recommended: detectedOs.name === 'macOS'
    },
    {
      os: 'macOS',
      arch: 'Intel Processor (x64)',
      filename: 'Regaarder-mac-x64.dmg',
      tag: 'Universal .dmg',
      href: 'https://github.com/Joshu2001/Regaarder-Compose/releases/latest',
      recommended: false
    },
    {
      os: 'Windows',
      arch: 'Windows 10 / 11 (64-bit)',
      filename: 'Regaarder-Setup-x64.exe',
      tag: 'Installer .exe',
      href: 'https://github.com/Joshu2001/Regaarder-Compose/releases/latest',
      recommended: detectedOs.name === 'Windows'
    },
    {
      os: 'Linux',
      arch: 'x86_64 AppImage',
      filename: 'Regaarder-x86_64.AppImage',
      tag: 'Portable AppImage',
      href: 'https://github.com/Joshu2001/Regaarder-Compose/releases/latest',
      recommended: detectedOs.name === 'Linux'
    }
  ];

  const valueProps = [
    {
      title: 'Contextual Recall',
      description: 'Search by what you meant or remember, not exact file names. Surfaces the right calculation, note, or decision in one click.',
      icon: Zap
    },
    {
      title: 'Goal-Driven Execution',
      description: 'State what you are trying to accomplish. Regaarder connects relevant notes and models across your workspace to help you solve it.',
      icon: Layers
    },
    {
      title: 'Unified Work Canvas',
      description: 'Docs, sheets, decks, and whiteboards that actively share context instead of trapping your ideas in isolated app silos.',
      icon: Cpu
    },
    {
      title: 'Private & Local-First',
      description: 'Your accumulated work and intelligence stay secure on your machine with native hardware speed and offline resilience.',
      icon: ShieldCheck
    }
  ];

  return (
    <div className="fixed inset-0 overflow-y-auto bg-[#fafafa] dark:bg-[#111113] text-zinc-900 dark:text-zinc-100 selection:bg-zinc-200 dark:selection:bg-zinc-800 font-sans z-50 [scrollbar-gutter:stable]">
      {/* Top Header */}
      <header className="max-w-6xl mx-auto px-6 pt-8 pb-4 flex items-center justify-between relative z-10">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Workspace</span>
        </a>

        <div className="flex items-center gap-3">
          <a
            href="/pricing"
            className="text-xs font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors px-2 py-1"
          >
            Pricing
          </a>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-[#1a1a1e] border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs text-xs text-zinc-700 dark:text-zinc-300">
            <RegaarderBrandIcon size={14} className="text-zinc-900 dark:text-zinc-100" />
            <span className="font-semibold tracking-tight">Regaarder</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 py-8 sm:py-14 relative z-10">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          {/* Animated Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-semibold tracking-wide uppercase bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/60 mb-5 transition-all duration-500">
            <span>{heroNarratives[activeNarrativeIndex].badge}</span>
          </div>

          {/* Smooth Fade Narrative Container (Fixed Min-Height to eliminate layout shift) */}
          <div className="min-h-[170px] sm:min-h-[180px] flex flex-col justify-start items-center">
            <h1
              className={`text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-zinc-950 dark:text-white mb-4 leading-[1.15] transition-all duration-500 ease-out ${
                isFading ? 'opacity-0 translate-y-1.5' : 'opacity-100 translate-y-0'
              }`}
            >
              {heroNarratives[activeNarrativeIndex].title}
            </h1>
            <p
              className={`text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal max-w-xl mx-auto transition-all duration-500 ease-out ${
                isFading ? 'opacity-0 translate-y-1.5' : 'opacity-100 translate-y-0'
              }`}
            >
              {heroNarratives[activeNarrativeIndex].subtitle}
            </p>
          </div>

          {/* Subtle Progression Dash Indicators */}
          <div className="flex items-center justify-center gap-2 mb-8 mt-2">
            {heroNarratives.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setIsFading(true);
                  setTimeout(() => {
                    setActiveNarrativeIndex(idx);
                    setIsFading(false);
                  }, 250);
                }}
                className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                  activeNarrativeIndex === idx
                    ? 'w-7 bg-zinc-900 dark:bg-zinc-100'
                    : 'w-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Primary Auto-Detected Download CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <a
              href={detectedOs.href}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg font-semibold text-xs tracking-wide text-white dark:text-zinc-900 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 active:scale-[0.99] transition-all shadow-md cursor-pointer outline-none"
            >
              <Download size={15} strokeWidth={2.5} />
              <span>Download for {detectedOs.name}</span>
              <span className="text-[11px] opacity-75 font-normal">({detectedOs.ext})</span>
            </a>

            <a
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg font-medium text-xs tracking-wide text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-all cursor-pointer"
            >
              <Globe size={14} className="text-zinc-500" />
              <span>Launch Web App</span>
            </a>
          </div>

          <div className="mt-3 text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center justify-center gap-2">
            <span>Detected: {detectedOs.tag}</span>
            <span>•</span>
            <span>Version 1.0.0</span>
          </div>
        </div>

        {/* Feature Preview Window Mockup */}
        <div className="relative max-w-4xl mx-auto mb-20 rounded-xl overflow-hidden border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-[#18181b] shadow-2xl shadow-black/[0.04] dark:shadow-black/[0.4]">
          {/* macOS Titlebar Chrome */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-900/60 backdrop-blur-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400 dark:bg-rose-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 dark:bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 dark:bg-emerald-500/80" />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
              <RegaarderBrandIcon size={12} />
              <span>Regaarder - Native Desktop Engine</span>
            </div>
            <div className="w-12 text-right">
              <span className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400 tracking-wider">Online</span>
            </div>
          </div>

          {/* Inner Mockup Body - Hybrid Interactive Frame */}
          <div className="relative w-full aspect-16/10 sm:aspect-16/9 bg-zinc-950 overflow-hidden flex items-center justify-center group">
            {previewVideoSrc ? (
              <video
                src={previewVideoSrc}
                poster={workspacePreviewImg}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <img
                src={workspacePreviewImg}
                alt="Regaarder Workspace Interface"
                className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                loading="eager"
              />
            )}
            
            {/* Subtle gloss overlay reflection */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60" />
          </div>
        </div>

        {/* Why the Desktop App Pillar Grid */}
        <div className="mb-20">
          <div className="text-center max-w-lg mx-auto mb-10">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-white mb-2">
              Engineered for flow
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Every detail is tuned for speed, isolation, and ergonomics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {valueProps.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-[#18181b] flex flex-col justify-between"
                >
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-center text-zinc-900 dark:text-zinc-100 mb-4">
                      <Icon size={16} strokeWidth={2} />
                    </div>
                    <h3 className="text-xs font-semibold text-zinc-950 dark:text-white mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Multi-Platform Download Selector Grid */}
        <div className="max-w-3xl mx-auto mb-20">
          <div className="text-center mb-8">
            <h3 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white mb-1">
              All Platforms & Releases
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Direct download packages for your platform of choice.
            </p>
          </div>

          <div className="divide-y divide-zinc-200/80 dark:divide-zinc-800 border border-zinc-200/90 dark:border-zinc-800 rounded-xl bg-white dark:bg-[#18181b] overflow-hidden">
            {downloadOptions.map((opt, i) => (
              <div
                key={i}
                className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                    {opt.os === 'macOS' ? <Laptop size={16} /> : opt.os === 'Windows' ? <Monitor size={16} /> : <Terminal size={16} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-white">{opt.os}</span>
                      <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-normal">· {opt.arch}</span>
                      {opt.recommended && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                          Recommended
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">
                      {opt.filename}
                    </div>
                  </div>
                </div>

                <a
                  href={opt.href}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  <Download size={13} />
                  <span>Download</span>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Callout Banner */}
        <div className="max-w-2xl mx-auto rounded-xl p-8 border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-[#18181b] shadow-sm text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
            <RegaarderBrandIcon size={20} />
          </div>
          <h3 className="text-lg font-bold text-zinc-950 dark:text-white mb-2">
            Ready to upgrade your workflow?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-md mx-auto leading-relaxed">
            Get unlimited cloud synchronization, autonomous agent execution, and priority support.
          </p>
          <div className="flex items-center justify-center gap-3">
            <a
              href="/pricing"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white dark:text-zinc-900 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 transition-all cursor-pointer shadow-2xs"
            >
              <span>Explore Plans</span>
              <ArrowRight size={13} strokeWidth={2.5} />
            </a>
            <a
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
            >
              <span>Return to Web Workspace</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-10 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400 dark:text-zinc-500">
        <div className="flex items-center gap-2">
          <RegaarderBrandIcon size={14} className="opacity-70" />
          <span>© {new Date().getFullYear()} Regaarder Technologies. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/pricing" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">Pricing</a>
          <a href="/terms" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">Terms</a>
          <a href="/privacy" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">Privacy</a>
        </div>
      </footer>
    </div>
  );
}
