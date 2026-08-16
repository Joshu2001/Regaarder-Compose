import React, { useEffect, useRef, useState } from 'react';
import { Globe, AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';
import BrowserResearchHome from './BrowserResearchHome';

const BROWSER_FONT_STACKS = {
  'System Default': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  'Inter': 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  'Manrope': 'Manrope, Inter, sans-serif',
  'SF Pro Display': '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
  'Georgia': 'Georgia, Cambria, "Times New Roman", serif',
  'Charter': 'Charter, Georgia, serif',
  'JetBrains Mono': '"JetBrains Mono", monospace'
};

const resolveBrowserFontStack = (name) => BROWSER_FONT_STACKS[name] || name || '-apple-system, sans-serif';

/**
 * BrowserViewport: Container mounting point for Electron WebContentsView Chromium Surface.
 * Renders executive BrowserResearchHome canvas when on regaarder://research or regaarder://saved,
 * and synchronizes DOM container bounds with Electron main process via IPC.
 */
export const BrowserViewport = ({
  activeTab = null,
  savedItems = [],
  isElectron = false,
  isSidePanelOpen = false,
  isRightSideHovered = false,
  isModalOpen = false,
  isPopoverOpen = false,
  isWorkspaceSwitcherOpen = false,
  browserFont = 'System Default',
  browserFontSize = 100,
  broadcastEffect = null,
  onNavigate,
  onLaunchCompetitorWorkflow,
  onToggleSidePanel,
  onRemoveBookmark
}) => {
  const containerRef = useRef(null);
  const [iframeError, setIframeError] = useState(false);

  const isResearchHome = activeTab?.url === 'regaarder://research' || activeTab?.url === 'regaarder://saved';

  useEffect(() => {
    if (!isElectron || !window.electronAPI) return;

    const updateBounds = () => {
      if (!containerRef.current || !window.electronAPI) return;
      const rect = containerRef.current.getBoundingClientRect();

      if (rect.width > 0 && rect.height > 0) {
        window.electronAPI.updateViewportBounds({
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        });
      }
    };

    if (isResearchHome || isModalOpen || isPopoverOpen || isWorkspaceSwitcherOpen) {
      window.electronAPI.setBrowserVisibility(false);
    } else {
      updateBounds();
      window.electronAPI.setBrowserVisibility(true);
    }

    const resizeObserver = new ResizeObserver(() => {
      if (!isResearchHome && !isModalOpen && !isWorkspaceSwitcherOpen) {
        updateBounds();
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateBounds);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateBounds);
      if (isElectron && window.electronAPI?.setBrowserVisibility) {
        window.electronAPI.setBrowserVisibility(false);
      }
    };
  }, [isElectron, activeTab?.id, isResearchHome, isSidePanelOpen, isRightSideHovered, isModalOpen, isPopoverOpen, isWorkspaceSwitcherOpen]);

  // Reset iframe error when URL changes in web fallback
  useEffect(() => {
    setIframeError(false);
  }, [activeTab?.url]);

  const viewportStyle = {
    fontFamily: resolveBrowserFontStack(browserFont),
    fontSize: `${browserFontSize}%`,
    zoom: browserFontSize !== 100 ? `${browserFontSize / 100}` : undefined
  };

  if (isResearchHome) {
    return (
      <div className="w-full h-full" style={viewportStyle}>
        <BrowserResearchHome
          activeUrl={activeTab?.url}
          savedItems={savedItems}
          browserFont={browserFont}
          browserFontSize={browserFontSize}
          onSearch={onNavigate}
          onNavigate={onNavigate}
          onLaunchCompetitorWorkflow={onLaunchCompetitorWorkflow}
          onToggleSidePanel={onToggleSidePanel}
          onRemoveBookmark={onRemoveBookmark}
        />
      </div>
    );
  }

  return (
    <div
      id="regaarder-browser-viewport"
      ref={containerRef}
      className="relative flex-1 w-full h-full bg-transparent overflow-hidden"
      style={viewportStyle}
    >
      {/* If inside Electron, Electron's WebContentsView paints directly behind this container */}
      {isElectron ? (
        <div className="absolute inset-0 bg-transparent pointer-events-none select-none" />
      ) : (
        /* Standalone Browser (Non-Electron) Fallback Renderer */
        <div className="relative w-full h-full flex flex-col">
          {iframeError ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950 text-slate-200 text-center font-sans">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Display Restricted by Web Security</h3>
              <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
                This website restricts iframe embedding via <code className="text-violet-300">X-Frame-Options</code> header policies.
                To view this page inside an embedded Chromium browser with full native web capabilities, launch Regaarder inside the Electron desktop shell.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setIframeError(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Frame</span>
                </button>
                <a
                  href={activeTab?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in External Browser</span>
                </a>
              </div>
            </div>
          ) : (
            <iframe
              key={activeTab?.id}
              src={activeTab?.url || 'https://google.com'}
              title={activeTab?.title || 'Browser tab'}
              className="w-full h-full border-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals"
              onError={() => setIframeError(true)}
            />
          )}
        </div>
      )}

      {/* RUNNING NEON SNAKE BORDER BEAM AROUND THE WEBPAGE VIEWPORT */}
      {broadcastEffect?.active && (
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
          <style>{`
            @keyframes __regaarder_viewport_snake_crawl {
              0% { stroke-dashoffset: 0; }
              100% { stroke-dashoffset: -100; }
            }
            @keyframes __regaarder_viewport_pulse {
              0%, 100% { transform: translateX(-50%) scale(1); opacity: 1; }
              50% { transform: translateX(-50%) scale(0.97); opacity: 0.9; }
            }
            @keyframes __regaarder_viewport_shimmer {
              0%, 100% { filter: drop-shadow(0 0 6px ${broadcastEffect.mode === 'recording' ? '#EF4444' : '#8B5CF6'}) drop-shadow(0 0 16px ${broadcastEffect.mode === 'recording' ? '#F43F5E' : '#38BDF8'}); }
              50% { filter: drop-shadow(0 0 10px ${broadcastEffect.mode === 'recording' ? '#FDA4AF' : '#EC4899'}) drop-shadow(0 0 24px ${broadcastEffect.mode === 'recording' ? '#EF4444' : '#8B5CF6'}); }
            }
          `}</style>

          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ animation: '__regaarder_viewport_shimmer 2.5s ease-in-out infinite' }}>
            <defs>
              <linearGradient id="__regaarder_vp_snake_grad__" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={broadcastEffect.mode === 'recording' ? '#EF4444' : '#8B5CF6'} />
                <stop offset="50%" stopColor={broadcastEffect.mode === 'recording' ? '#F43F5E' : '#38BDF8'} />
                <stop offset="100%" stopColor={broadcastEffect.mode === 'recording' ? '#FDA4AF' : '#EC4899'} />
              </linearGradient>
            </defs>
            {/* Base track border */}
            <rect
              x="2"
              y="2"
              width="calc(100% - 4px)"
              height="calc(100% - 4px)"
              fill="none"
              stroke={broadcastEffect.mode === 'recording' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(139, 92, 246, 0.25)'}
              strokeWidth="2"
            />
            {/* Running Neon Snake Stroke */}
            <rect
              x="2"
              y="2"
              width="calc(100% - 4px)"
              height="calc(100% - 4px)"
              fill="none"
              stroke="url(#__regaarder_vp_snake_grad__)"
              strokeWidth="3.5"
              strokeLinecap="round"
              pathLength="100"
              strokeDasharray="24 76"
              style={{ animation: '__regaarder_viewport_snake_crawl 3.2s linear infinite' }}
            />
          </svg>

          {/* Top Apple-Style Status Pill */}
          <div
            className="absolute top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0F101A]/90 backdrop-blur-2xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_16px_rgba(139,92,246,0.25)] text-white text-[11px] font-semibold tracking-wide"
            style={{ animation: '__regaarder_viewport_pulse 2s ease-in-out infinite' }}
          >
            <span
              className="w-2 h-2 rounded-full animate-ping"
              style={{
                backgroundColor: broadcastEffect.mode === 'recording' ? '#EF4444' : '#8B5CF6',
                boxShadow: `0 0 8px ${broadcastEffect.mode === 'recording' ? '#EF4444' : '#8B5CF6'}`
              }}
            />
            <span>{broadcastEffect.label || (broadcastEffect.mode === 'recording' ? 'LIVE VIDEO TUTORIAL RECORDING' : 'AI LIVE AGENT ACTIVE')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowserViewport;
