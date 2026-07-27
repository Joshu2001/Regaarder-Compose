import React, { useEffect } from 'react';

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
  topOffset = 'top-12',
  rightOffset = 'right-4',
  maxHeight = 'max-h-[calc(100vh-180px)]',
  zIndexBackdrop = 'z-[510]',
  zIndexModal = 'z-[520]',
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

  if (!isOpen) return null;

  return (
    <>
      {/* Subtle backdrop overlay with blur */}
      <div 
        className={`fixed inset-0 bg-black/10 dark:bg-black/40 backdrop-blur-[1.5px] ${zIndexBackdrop} transition-opacity duration-200 cursor-default`}
        onPointerDown={(e) => {
          e.preventDefault();
          onClose?.();
        }}
      />

      {/* Main macOS Executive Popover Container */}
      <div 
        className={`absolute ${rightOffset} ${topOffset} ${zIndexModal} ${width} max-w-[calc(100vw-32px)] flex flex-col rounded-[22px] border border-slate-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-2xl shadow-[0_24px_60px_-12px_rgba(0,0,0,0.18),0_4px_16px_-4px_rgba(0,0,0,0.06)] font-sans text-left cursor-default origin-top-right ${allowOverflowVisible ? 'overflow-visible' : 'overflow-hidden'} animate-in zoom-in-95 fade-in duration-150 ${className}`}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Hero Header */}
        <div className="px-6 pt-5 pb-3.5 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {IconComponent && (
              <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                <IconComponent size={15} className="text-slate-700 dark:text-zinc-300 stroke-[2]" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-zinc-100 leading-tight truncate">
                {title}
              </h3>
              {subtitle && (
                <p className="text-[11px] text-slate-400 dark:text-zinc-400 font-medium truncate max-w-[280px] mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {headerExtra && (
            <div className="flex items-center gap-2 shrink-0 ml-3">
              {headerExtra}
            </div>
          )}
        </div>

        {/* Body Content */}
        <div 
          className={`${maxHeight} ${allowOverflowVisible ? 'overflow-visible' : 'overflow-y-auto'} px-5 pt-4 pb-3.5 space-y-4 flex-1`}
          style={allowOverflowVisible ? {} : { scrollbarWidth: 'thin', scrollbarColor: 'rgba(148,163,184,0.25) transparent' }}
        >
          {children}
        </div>

        {/* Integrated Footer (optional) */}
        {footer && (
          <div className="border-t border-slate-100 dark:border-zinc-800/80 px-6 py-3.5 flex items-center justify-between bg-slate-50/70 dark:bg-zinc-900/70 backdrop-blur-md rounded-b-[22px] shrink-0">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
