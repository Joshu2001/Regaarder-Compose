import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * DropdownModalShell
 * Reusable Apple / macOS System Gray Popover Shell for Notifications, Share Modal, etc.
 */
export default function DropdownModalShell({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: IconComponent,
  headerExtra,
  children,
  footer,
  width = 'w-[400px]',
  topOffset = 'top-14',
  rightOffset = 'right-5',
  maxHeight = 'max-h-[calc(100vh-180px)]',
  zIndexBackdrop = 'z-[100000]',
  zIndexModal = 'z-[100001]',
  allowOverflowVisible = false,
  className = ''
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <>
      {/* Backdrop overlay with full-screen blur and dim */}
      <div 
        className={`fixed inset-0 bg-slate-950/45 dark:bg-black/65 backdrop-blur-md ${zIndexBackdrop} transition-all duration-200 cursor-default animate-in fade-in`}
        onPointerDown={(e) => {
          e.preventDefault();
          onClose?.();
        }}
      />

      {/* Main Glassmorphism Popover Container */}
      <div 
        className={`fixed ${rightOffset} ${topOffset} ${zIndexModal} ${width} max-w-[calc(100vw-32px)] flex flex-col rounded-2xl border border-white/60 dark:border-white/10 ring-1 ring-slate-900/5 dark:ring-black/40 bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.16)] font-sans text-left cursor-default origin-top-right ${allowOverflowVisible ? 'overflow-visible' : 'overflow-hidden'} animate-in zoom-in-[0.98] fade-in duration-100 ease-out ${className}`}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Hero Header */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-200/50 dark:border-zinc-800/80 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {IconComponent && (
              React.isValidElement(IconComponent) ? (
                IconComponent
              ) : (
                <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center shrink-0 border border-violet-100 dark:border-violet-900/30">
                  <IconComponent size={14} className="text-violet-600 dark:text-violet-400 stroke-[2]" />
                </div>
              )
            )}
            <div className="min-w-0">
              <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-zinc-100 leading-tight truncate">
                {title}
              </h3>
              {subtitle && (
                <p className="text-[11px] text-slate-400 dark:text-zinc-400 font-medium truncate max-w-[260px] mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-3">
            {headerExtra}
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose?.();
              }}
              className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Close"
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M1 1l10 10M11 1L1 11" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div 
          className={`${maxHeight} ${allowOverflowVisible ? 'overflow-visible' : 'overflow-y-auto thin-scrollbar'} px-5 pt-3.5 pb-3 space-y-3 flex-1`}
          style={allowOverflowVisible ? {} : { scrollbarWidth: 'thin', scrollbarColor: 'rgba(148,163,184,0.25) transparent' }}
        >
          {children}
        </div>

        {/* Integrated Footer (optional) */}
        {footer && (
          <div className="border-t border-slate-200/50 dark:border-zinc-800/80 px-5 py-3 flex items-center justify-between bg-slate-50/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-b-2xl shrink-0">
            {footer}
          </div>
        )}
      </div>
    </>,
    document.body
  );
}

