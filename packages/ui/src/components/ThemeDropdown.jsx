import React, { useState, useRef, useEffect } from 'react';
import { Palette, ChevronDown, Check, Search } from 'lucide-react';

export const SHEETS_THEME_OPTIONS = [
  { 
    id: 'default', 
    label: 'Slate', 
    category: 'Executive Classics',
    bg: '#f8fafc', 
    accent: '#7c3aed', 
    previewColors: ['#f1f5f9', '#e2e8f0', '#7c3aed'],
    description: 'Classic cool gray slate with violet selection highlights.'
  },
  { 
    id: 'obsidian', 
    label: 'Obsidian', 
    category: 'Dark Synth & AMOLED',
    bg: '#09090b', 
    accent: '#a1a1aa', 
    previewColors: ['#18181b', '#27272a', '#a1a1aa'],
    description: 'Deep AMOLED black canvas with crisp platinum accents.'
  },
  { 
    id: 'nordic', 
    label: 'Nordic Frost', 
    category: 'Executive Classics',
    bg: '#f0f9ff', 
    accent: '#0284c7', 
    previewColors: ['#e0f2fe', '#bae6fd', '#0284c7'],
    description: 'Arctic ice blue palette with crisp frost details.'
  },
  { 
    id: 'emerald', 
    label: 'Emerald Luxe', 
    category: 'Executive Classics',
    bg: '#ecfdf5', 
    accent: '#10b981', 
    previewColors: ['#d1fae5', '#a7f3d0', '#10b981'],
    description: 'Rich botanical sage & mint emerald styling.'
  },
  { 
    id: 'alabaster', 
    label: 'Alabaster White', 
    category: 'Warm & Editorial',
    bg: '#fbfbf9', 
    accent: '#525252', 
    previewColors: ['#f5f5f0', '#e7e5e4', '#525252'],
    description: 'Warm minimalist stone white with subtle stone boundaries.'
  },
  { 
    id: 'indigo', 
    label: 'Midnight Indigo', 
    category: 'Executive Classics',
    bg: '#0b0f19', 
    accent: '#818cf8', 
    previewColors: ['#1e1b4b', '#312e81', '#818cf8'],
    description: 'Royal velvet indigo with deep blue-violet headers.'
  },
  { 
    id: 'sand', 
    label: 'Warm Sand', 
    category: 'Warm & Editorial',
    bg: '#f7f4ef', 
    accent: '#d97706', 
    previewColors: ['#fef3c7', '#fde68a', '#d97706'],
    description: 'Terracotta and warm golden amber tones.'
  },
  { 
    id: 'rose', 
    label: 'Rose Quartz', 
    category: 'Warm & Editorial',
    bg: '#faf4f5', 
    accent: '#f43f5e', 
    previewColors: ['#ffe4e6', '#fecdd3', '#f43f5e'],
    description: 'Soft quartz pink with refined crimson selection highlights.'
  },
  { 
    id: 'barbie', 
    label: 'Barbie Pink & Glam', 
    category: 'Pop & Psychographic',
    bg: '#fff0f6', 
    accent: '#ec4899', 
    previewColors: ['#fce7f3', '#fbcfe8', '#ec4899'],
    description: 'Vibrant hot pink, magentas and glam pastels for Barbie lovers.'
  },
  { 
    id: 'christian_cross', 
    label: 'Stained Glass Cross', 
    category: 'Pop & Psychographic',
    bg: '#faf5ff', 
    accent: '#8b5cf6', 
    previewColors: ['#ef4444', '#3b82f6', '#eab308'],
    description: 'Sacred stained-glass spectrum with ruby red, sapphire blue and radiant gold cross accents.'
  },
  { 
    id: 'messi', 
    label: 'Albiceleste 10', 
    category: 'Pop & Psychographic',
    bg: '#f0f9ff', 
    accent: '#0284c7', 
    previewColors: ['#bae6fd', '#fef08a', '#0284c7'],
    description: 'Sky blue stripes, sun-gold emblem accents and championship navy.'
  },
  { 
    id: 'apex_exec', 
    label: 'Apex Executive Noir', 
    category: 'Executive Classics',
    bg: '#0f172a', 
    accent: '#38bdf8', 
    previewColors: ['#1e293b', '#334155', '#38bdf8'],
    description: 'Ultra-luxurious dark slate & platinum glass built for executive boardrooms.'
  },
  { 
    id: 'studio_bloom', 
    label: 'Studio Bloom', 
    category: 'Creative & Artistic',
    bg: '#fdf2f8', 
    accent: '#d946ef', 
    previewColors: ['#fae8ff', '#f5d0fe', '#d946ef'],
    description: 'Expressive gradient palette designed for designers, visionaries and creatives.'
  },
  { 
    id: 'deep_zenith', 
    label: 'Deep Zenith Focus', 
    category: 'Focus & Calm',
    bg: '#051923', 
    accent: '#00a6fb', 
    previewColors: ['#003554', '#0582ca', '#00a6fb'],
    description: 'Zero-distraction deep oceanic dark mode tuned for intense deep focus.'
  },
  { 
    id: 'honey_warmth', 
    label: 'Honey Amber Warmth', 
    category: 'Warm & Editorial',
    bg: '#fffbeb', 
    accent: '#b45309', 
    previewColors: ['#fef3c7', '#fde68a', '#b45309'],
    description: 'Cozy honey gold and warm amber glow for a comforting workspace.'
  },
  { 
    id: 'carbon', 
    label: 'Carbon Matrix', 
    category: 'Dark Synth & AMOLED',
    bg: '#121619', 
    accent: '#00f5d4', 
    previewColors: ['#1a202c', '#2d3748', '#00f5d4'],
    description: 'High-tech graphite carbon grid with electric mint accents.'
  },
  { 
    id: 'tokyo', 
    label: 'Tokyo Night', 
    category: 'Dark Synth & AMOLED',
    bg: '#1a1b26', 
    accent: '#bb9af7', 
    previewColors: ['#24283b', '#414868', '#bb9af7'],
    description: 'Cyber neon synth navy with vibrant fuchsia highlights.'
  },
  { 
    id: 'amber', 
    label: 'Solarized Amber', 
    category: 'Warm & Editorial',
    bg: '#fdf6e3', 
    accent: '#d97706', 
    previewColors: ['#eee8d5', '#93a1a1', '#d97706'],
    description: 'Vintage warm terminal gold with warm sepia lines.'
  },
  { 
    id: 'nature_botanical', 
    label: 'Nature Leaf', 
    category: 'Creative & Nature',
    bg: '#f2f9f4', 
    accent: '#15803d', 
    previewColors: ['#dcfce7', '#bbf7d0', '#15803d'],
    description: 'Fresh organic canopy green with botanical leaf styling.'
  },
  { 
    id: 'ocean_water', 
    label: 'Ocean Water Droplets', 
    category: 'Creative & Nature',
    bg: '#f0fdfa', 
    accent: '#0d9488', 
    previewColors: ['#ccfbf1', '#99f6e4', '#0d9488'],
    description: 'Aquatic aqua-cyan theme inspired by pristine ocean water droplets.'
  }
];

export default function ThemeDropdown({
  value = 'default',
  onChange,
  options = SHEETS_THEME_OPTIONS,
  label = 'Theme',
  align = 'left',
  dropUp = false,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);

  // Outside click dismissal
  useEffect(() => {
    const handlePointerDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
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

  const activeOption = options.find(o => o.id === value) || options[0];

  const filteredOptions = options.filter(o => 
    o.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.description && o.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (o.category && o.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group by category
  const categories = Array.from(new Set(filteredOptions.map(o => o.category || 'Themes')));

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          setIsOpen(prev => !prev);
        }}
        className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-150 shadow-2xs cursor-pointer ${
          isOpen
            ? 'bg-[#F5F5F7] dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 border-slate-300 dark:border-zinc-700'
            : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200/80 dark:border-zinc-800 hover:bg-[#F5F5F7] dark:hover:bg-zinc-800/60'
        }`}
      >
        <span className="text-slate-500 dark:text-zinc-400 font-medium">{label}</span>

        {/* Theme Color Dot */}
        <span 
          className="w-2.5 h-2.5 rounded-full border border-black/10 dark:border-white/20 shadow-2xs inline-block shrink-0 transition-transform group-hover:scale-110" 
          style={{ backgroundColor: activeOption.accent || activeOption.bg }} 
        />

        <span className="font-semibold text-slate-800 dark:text-zinc-200">{activeOption.label}</span>

        <ChevronDown 
          size={13} 
          className={`text-slate-400 dark:text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-slate-600 dark:text-zinc-300' : ''}`} 
        />
      </button>

      {/* Floating Executive Dropdown Menu */}
      {isOpen && (
        <div 
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} ${
            dropUp ? 'bottom-full mb-2 origin-bottom-left' : 'top-full mt-2 origin-top-left'
          } w-72 max-h-[380px] flex flex-col rounded-2xl border border-slate-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.22),0_4px_16px_-4px_rgba(0,0,0,0.08)] z-[99999] overflow-hidden animate-in zoom-in-95 fade-in duration-150 select-none`}
        >
          {/* Header Search Bar */}
          <div className="p-2.5 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/50">
            <div className="relative flex items-center">
              <Search size={13} className="absolute left-2.5 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder="Search themes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-zinc-500 transition-all font-sans"
                autoFocus
              />
            </div>
          </div>

          {/* Theme Options List */}
          <div className="flex-1 overflow-y-auto p-1.5 space-y-3 thin-scrollbar">
            {categories.map((cat) => {
              const catOptions = filteredOptions.filter(o => (o.category || 'Themes') === cat);
              if (catOptions.length === 0) return null;

              return (
                <div key={cat} className="space-y-1">
                  <div className="px-2.5 pt-1.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    {cat}
                  </div>

                  {catOptions.map((opt) => {
                    const isSelected = opt.id === value;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onPointerDown={(e) => {
                          e.preventDefault();
                          onChange?.(opt.id);
                          setIsOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-all duration-150 cursor-pointer ${
                          isSelected 
                            ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-bold border border-slate-200/80 dark:border-zinc-700/80 shadow-xs' 
                            : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-zinc-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Palette 3-swatch preview */}
                          <div className="flex items-center gap-0.5 p-1 rounded-md bg-slate-200/40 dark:bg-zinc-700/40 border border-slate-200/60 dark:border-zinc-600/60 shrink-0">
                            {opt.previewColors?.map((c, i) => (
                              <span 
                                key={i} 
                                className="w-2.5 h-2.5 rounded-full" 
                                style={{ backgroundColor: c }} 
                              />
                            )) || (
                              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: opt.accent || opt.bg }} />
                            )}
                          </div>

                          <div className="min-w-0 flex flex-col">
                            <span className="truncate leading-tight">{opt.label}</span>
                            {opt.description && (
                              <span className="text-[10px] text-slate-400 dark:text-zinc-500 truncate font-normal leading-tight mt-0.5">
                                {opt.description}
                              </span>
                            )}
                          </div>
                        </div>

                        {isSelected && (
                          <Check size={14} className="text-slate-900 dark:text-zinc-100 shrink-0 ml-2 stroke-[2.5]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}

            {filteredOptions.length === 0 && (
              <div className="py-6 text-center text-xs text-slate-400 dark:text-zinc-500 font-medium">
                No matching themes found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
