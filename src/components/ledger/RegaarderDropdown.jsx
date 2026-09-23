import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function RegaarderDropdown({
  label,
  value,
  options = [],
  onChange = () => {},
  placeholder = "Select..."
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("pointerdown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  return (
    <div ref={containerRef} className="relative inline-block text-left select-none">
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        }}
        className={`px-3 py-1.5 text-xs rounded-xl border flex items-center justify-between gap-2 transition-all duration-150 active:scale-[0.98] cursor-pointer shadow-2xs font-medium ${
          isOpen
            ? "bg-white dark:bg-zinc-800 border-violet-500 ring-2 ring-violet-500/10 text-slate-900 dark:text-zinc-100"
            : "bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50/60 dark:hover:bg-zinc-800/60"
        }`}
      >
        <span className="truncate max-w-[160px]">{displayLabel}</span>
        <ChevronDown
          size={12}
          strokeWidth={2}
          className={`text-slate-400 dark:text-zinc-500 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-violet-600 dark:text-violet-400" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 z-[100] min-w-[180px] max-w-[240px] max-h-64 overflow-y-auto regaarder-scrollbar rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-[0_12px_32px_rgba(0,0,0,0.12)] p-1 animate-in fade-in zoom-in-95 duration-150">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs rounded-xl transition-colors cursor-pointer text-left ${
                  isSelected
                    ? "bg-violet-50/90 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 font-semibold"
                    : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100/70 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <Check size={12} strokeWidth={2.5} className="text-violet-600 dark:text-violet-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
