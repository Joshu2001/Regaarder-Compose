import React, { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/**
 * Format a Date object to YYYY-MM-DD
 */
export function formatDateToIso(d) {
  if (!d) return "";
  const dateObj = typeof d === "string" ? new Date(d) : d;
  if (isNaN(dateObj.getTime())) return "";
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Format YYYY-MM-DD or date string to readable label: e.g. "Sep 22, 2026"
 */
export function formatDateDisplay(dateStr, placeholder = "Select date") {
  if (!dateStr) return placeholder;
  try {
    // If format is YYYY-MM-DD, parse year, month, day explicitly to avoid UTC timezone offsets
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return `${MONTH_SHORT[month]} ${day}, ${year}`;
      }
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

/**
 * Apple-style minimalist native popover Date Picker
 */
export default function AppleDatePickerPopover({
  value,
  onSelect,
  onClose,
  align = "left" // 'left' | 'right'
}) {
  // Initialize view to the current value date or today
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const parts = value.split("-");
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        const parsed = new Date(y, m, d);
        if (!isNaN(parsed.getTime())) return parsed;
      }
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setViewDate(new Date(year, month + 1, 1));
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  const isSelected = (day) => {
    if (!value) return false;
    const parts = value.split("-");
    if (parts.length === 3) {
      return (
        parseInt(parts[0], 10) === year &&
        parseInt(parts[1], 10) - 1 === month &&
        parseInt(parts[2], 10) === day
      );
    }
    return false;
  };

  const handleDaySelect = (day) => {
    const yStr = String(year);
    const mStr = String(month + 1).padStart(2, "0");
    const dStr = String(day).padStart(2, "0");
    const iso = `${yStr}-${mStr}-${dStr}`;
    onSelect(iso);
    onClose();
  };

  const handleQuickPreset = (daysOffset) => {
    const target = new Date();
    target.setDate(target.getDate() + daysOffset);
    const iso = formatDateToIso(target);
    onSelect(iso);
    onClose();
  };

  const handleClear = () => {
    onSelect("");
    onClose();
  };

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className={`absolute top-full mt-1.5 ${
        align === "right" ? "right-0" : "left-0"
      } w-68 rounded-2xl bg-white/98 dark:bg-[#1E1E22]/98 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-2xl p-3.5 z-[100] animate-in fade-in zoom-in-95 duration-150 font-sans select-none`}
    >
      {/* Quick Presets */}
      <div className="flex items-center gap-1.5 mb-2.5 pb-2.5 border-b border-slate-100 dark:border-white/[0.06]">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            handleQuickPreset(0);
          }}
          className="flex-1 py-1 px-1.5 rounded-lg text-[11px] font-medium text-center transition-colors cursor-pointer bg-slate-100/80 hover:bg-slate-200/70 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-200"
        >
          Today
        </button>
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            handleQuickPreset(1);
          }}
          className="flex-1 py-1 px-1.5 rounded-lg text-[11px] font-medium text-center transition-colors cursor-pointer bg-slate-100/80 hover:bg-slate-200/70 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-200"
        >
          Tomorrow
        </button>
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            handleQuickPreset(7);
          }}
          className="flex-1 py-1 px-1.5 rounded-lg text-[11px] font-medium text-center transition-colors cursor-pointer bg-slate-100/80 hover:bg-slate-200/70 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-200"
        >
          +1 Week
        </button>
        {value && (
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              handleClear();
            }}
            className="p-1 text-slate-400 hover:text-rose-500 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer border-none bg-transparent"
            title="Clear date"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between px-1 mb-2">
        <span className="text-[12.5px] font-semibold text-slate-800 dark:text-zinc-100">
          {MONTH_NAMES[month]} {year}
        </span>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onPointerDown={handlePrevMonth}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer border-none bg-transparent"
            title="Previous month"
          >
            <ChevronLeft size={14} strokeWidth={2.2} />
          </button>
          <button
            type="button"
            onPointerDown={handleNextMonth}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer border-none bg-transparent"
            title="Next month"
          >
            <ChevronRight size={14} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Weekday Row */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {WEEKDAYS.map((d) => (
          <span key={d} className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 py-0.5">
            {d}
          </span>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <span key={`blank-${i}`} className="w-7 h-7" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const selected = isSelected(day);
          const current = isToday(day);

          return (
            <button
              key={`day-${day}`}
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                handleDaySelect(day);
              }}
              className={`w-7 h-7 rounded-lg text-[11.5px] flex items-center justify-center font-medium transition-all cursor-pointer border-none ${
                selected
                  ? "bg-[#7C3AED] dark:bg-violet-600 text-white font-semibold shadow-xs"
                  : current
                  ? "border border-violet-500/40 text-[#7C3AED] dark:text-violet-400 font-semibold bg-violet-50/50 dark:bg-violet-950/30"
                  : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
