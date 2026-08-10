import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search } from 'lucide-react';

/**
 * AppleToolbarDropdown
 * Reusable Apple HIG-compliant dropdown component for toolbars, menus, and controls.
 * Uses createPortal to ensure absolute menus never get clipped by overflow containers.
 */
export default function AppleToolbarDropdown({
  label,
  value,
  options = [], // [{ id, label, description, category, style, icon }]
  onChange,
  searchable = false,
  searchPlaceholder = 'Search...',
  width = 'w-48',
  align = 'left', // 'left' | 'right'
  dropUp = false,
  triggerClassName = '',
  className = '',
  icon: IconComponent,
  showCheckmark = true
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [coords, setCoords] = useState(null);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let top = dropUp ? rect.top - 6 : rect.bottom + 6;
      let left = align === 'right' ? rect.right : rect.left;

      setCoords({
        top,
        bottom: vh - rect.top + 6,
        left,
        right: vw - rect.right,
        rectWidth: rect.width
      });
    }
  };

  // Toggle open state and calculate trigger bounds
  const toggleOpen = () => {
    if (!isOpen) {
      updateCoords();
      setSearchQuery('');
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Auto-dismiss on outside pointer click
  useEffect(() => {
    const handlePointerDown = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        !e.target.closest('.apple-toolbar-dropdown-menu-portal')
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('pointerdown', handlePointerDown);
    }
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen]);

  // Recalculate coordinates on open, scroll, or resize
  useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener('scroll', updateCoords, true);
      window.addEventListener('resize', updateCoords);
    }
    return () => {
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
    };
  }, [isOpen]);

  // Dismiss on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const activeOption = options.find((o) => (o.id !== undefined ? o.id === value : o.label === value)) || null;
  const displayLabel = activeOption ? activeOption.label : (value || label || 'Select');

  const filteredOptions = searchable
    ? options.filter((o) =>
        String(o.label || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(o.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const categories = Array.from(new Set(filteredOptions.map((o) => o.category).filter(Boolean)));

  // Calculate positioning styles for the portal element
  const portalStyle = {
    position: 'fixed',
    zIndex: 100000,
  };

  if (coords) {
    if (dropUp) {
      portalStyle.bottom = `${coords.bottom}px`;
    } else {
      portalStyle.top = `${coords.top}px`;
    }

    if (align === 'right') {
      portalStyle.right = `${coords.right}px`;
    } else {
      portalStyle.left = `${coords.left}px`;
    }
  }

  const mountNode = typeof document !== 'undefined' ? (document.fullscreenElement ?? document.body) : null;

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          toggleOpen();
        }}
        className={`group inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[13px] font-medium border transition-all duration-150 shadow-2xs cursor-pointer select-none ${
          isOpen
            ? 'bg-slate-200/80 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 border-slate-300 dark:border-zinc-700 shadow-sm'
            : 'bg-slate-100/90 dark:bg-[#18181b] text-slate-700 dark:text-zinc-300 border-slate-200/60 dark:border-zinc-800/80 hover:bg-slate-200/60 dark:hover:bg-zinc-800/70 hover:text-slate-900 dark:hover:text-zinc-100'
        } ${triggerClassName}`}
      >
        {IconComponent && <IconComponent size={14} className="text-slate-500 dark:text-zinc-400 shrink-0" />}
        {label && <span className="text-slate-500 dark:text-zinc-400 font-normal pr-0.5">{label}</span>}
        <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate">{displayLabel}</span>
        <ChevronDown
          size={13}
          className={`text-slate-400 dark:text-zinc-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-slate-600 dark:text-zinc-300' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Panel (Portal) */}
      {isOpen && mountNode && coords && createPortal(
        <div
          style={portalStyle}
          className={`apple-toolbar-dropdown-menu-portal ${
            dropUp ? 'origin-bottom-left' : 'origin-top-left'
          } ${width} max-h-[320px] flex flex-col rounded-2xl border border-slate-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.18)] overflow-hidden animate-in zoom-in-95 fade-in duration-150 select-none`}
        >
          {/* Optional Search Bar */}
          {searchable && (
            <div className="p-2 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/50 shrink-0">
              <div className="relative flex items-center">
                <Search size={13} className="absolute left-2.5 text-slate-400 dark:text-zinc-500" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-zinc-500 transition-all font-sans"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 thin-scrollbar">
            {categories.length > 0 ? (
              categories.map((cat) => {
                const catOpts = filteredOptions.filter((o) => o.category === cat);
                if (catOpts.length === 0) return null;
                return (
                  <div key={cat} className="space-y-0.5">
                    <div className="px-2.5 pt-1.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      {cat}
                    </div>
                    {catOpts.map((opt) => renderOptionItem(opt))}
                  </div>
                );
              })
            ) : (
              filteredOptions.map((opt) => renderOptionItem(opt))
            )}

            {filteredOptions.length === 0 && (
              <div className="py-4 text-center text-xs text-slate-400 dark:text-zinc-500 font-medium">
                No matching options
              </div>
            )}
          </div>
        </div>,
        mountNode
      )}
    </div>
  );

  function renderOptionItem(opt) {
    const itemKey = opt.id !== undefined ? opt.id : opt.label;
    const isSelected = value !== undefined && (opt.id !== undefined ? opt.id === value : opt.label === value);

    return (
      <button
        key={itemKey}
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          onChange?.(opt.id !== undefined ? opt.id : opt.label, opt);
          setIsOpen(false);
        }}
        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
          isSelected
            ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-semibold'
            : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100/70 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-zinc-100'
        }`}
        style={opt.style || {}}
      >
        <div className="flex items-center gap-2 min-w-0 pr-1">
          {opt.icon && <opt.icon size={13} className="text-slate-400 dark:text-zinc-400 shrink-0" />}
          <div className="flex flex-col min-w-0">
            <span className="truncate leading-tight">{opt.label}</span>
            {opt.description && (
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 truncate font-normal leading-tight mt-0.5">
                {opt.description}
              </span>
            )}
          </div>
        </div>
        {showCheckmark && isSelected && (
          <Check size={13} className="text-slate-900 dark:text-zinc-100 shrink-0 ml-1.5 stroke-[2.5]" />
        )}
      </button>
    );
  }
}
