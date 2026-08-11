import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Check } from 'lucide-react';

export const createDropdownHTML = (choices, initialValue = '') => {
  const cleanChoices = choices.map(s => s.trim()).filter(Boolean);
  if (cleanChoices.length === 0) return '';
  const trimmedInitial = (initialValue || '').trim();
  const matchedVal = cleanChoices.find(c => c.toLowerCase() === trimmedInitial.toLowerCase());
  const selectedVal = matchedVal || cleanChoices[0];

  const optionItems = cleanChoices.map(opt => `
    <div onclick="
      const menu = this.parentElement;
      const btn = menu.previousElementSibling;
      btn.querySelector('.selected-val').innerText = this.innerText;
      menu.style.display = 'none';
      btn.style.borderColor = '#e2e8f0';
      btn.style.boxShadow = 'none';
      const block = this.closest('.table-block');
      if (block) {
        block.dispatchEvent(new Event('input', { bubbles: true }));
      }
      event.stopPropagation();
    " onmouseover="this.style.background='#f5f3ff'; this.style.color='#7c3aed';" onmouseout="this.style.background='transparent'; this.style.color='#334155';" style="padding:6px 12px; font-size:11px; color:#334155; cursor:pointer; text-align:left; transition:background 0.15s, color 0.15s; font-weight: 500; font-family: inherit; border-radius: 4px;">${opt}</div>
  `).join('');

  return `<div class="custom-doc-dropdown relative" contenteditable="false" style="position:relative; display:inline-block; user-select:none; font-family:inherit; vertical-align:middle; line-height:normal;">
<button onclick="
  const menu = this.nextElementSibling;
  const isOpen = menu.style.display === 'block';
  document.querySelectorAll('.custom-doc-dropdown-menu').forEach(m => { m.style.display = 'none'; });
  menu.style.display = isOpen ? 'none' : 'block';
  event.stopPropagation();
" onmouseover="this.style.borderColor='#7c3aed'; this.style.boxShadow='0 0 0 2px rgba(124,58,237,0.1)'" onmouseout="const menu = this.nextElementSibling; if(menu && menu.style.display !== 'block'){ this.style.borderColor='#e2e8f0'; this.style.boxShadow='none'; }" style="appearance:none; -webkit-appearance:none; display:flex; align-items:center; justify-content:space-between; background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:5px 12px; font-size:11px; font-weight:500; color:#334155; outline:none; cursor:pointer; min-width:120px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); transition:all 0.2s;">
  <span class="selected-val" style="margin-right:8px; display:inline-block; text-align:left; flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${selectedVal}</span>
  <svg xmlns='http://www.w3.org/2000/svg' width='11' height='11' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 24 24' style="flex-shrink:0; margin-left:auto;"><polyline points='6 9 12 15 18 9'></polyline></svg>
</button>
<div class="custom-doc-dropdown-menu" style="display:none; position:absolute; left:0; top:100%; margin-top:4px; background:#ffffff; border:1px solid #e6e3fb; border-radius:8px; box-shadow:0 10px 25px -5px rgba(76,29,149,0.08), 0 8px 16px -6px rgba(76,29,149,0.06); z-index:100005; min-width:130px; padding:4px; max-height:200px; overflow-y:auto; scrollbar-width:thin;">
  ${optionItems}
</div>
</div>`;
};

export default function TableDropdownPopover({
  isOpen,
  onClose,
  tableToolbar,
  focusedTableCell,
  dropdownChoicesText,
  setDropdownChoicesText,
  createDropdownHTML: createDropdownHTMLProp,
  triggerButtonRef
}) {
  const popoverRef = useRef(null);
  const addInputRef = useRef(null);
  const makeDropdownHTML = createDropdownHTMLProp || createDropdownHTML;

  // Determine initial target based on selected cell tag (TH -> column, TD -> cell)
  const targetCell = tableToolbar?.cellEl || focusedTableCell;
  const initialTarget = (targetCell && targetCell.tagName?.toUpperCase() === 'TH') ? 'column' : 'cell';

  const [dropdownTarget, setDropdownTarget] = useState(initialTarget);
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [newOptionInput, setNewOptionInput] = useState('');
  const [editingIdx, setEditingIdx] = useState(-1);
  const [editingText, setEditingText] = useState('');

  // Position state
  const [pos, setPos] = useState({ top: 100, left: 100 });

  // Update target when opening
  useEffect(() => {
    if (isOpen) {
      const cell = tableToolbar?.cellEl || focusedTableCell;
      if (cell && cell.tagName?.toUpperCase() === 'TH') {
        setDropdownTarget('column');
      } else {
        setDropdownTarget('cell');
      }
      setIsAddingOption(false);
      setNewOptionInput('');
      setEditingIdx(-1);
    }
  }, [isOpen, tableToolbar?.cellEl, focusedTableCell]);

  // Compute position relative to selected cell or trigger button
  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const cell = tableToolbar?.cellEl || focusedTableCell;
      const anchorEl = triggerButtonRef?.current || cell;

      const popoverWidth = 320;
      const popoverHeight = 310;

      let rect = null;
      if (anchorEl && typeof anchorEl.getBoundingClientRect === 'function') {
        rect = anchorEl.getBoundingClientRect();
      }

      // Vertical position: drop down below anchor matching Add Source File & TableGridPickerModal
      let top = rect ? rect.bottom + 8 : 12;
      // Horizontal alignment: align to left edge of trigger/anchor
      let left = rect ? rect.left : 12;

      // Clamp left inside viewport margins
      left = Math.max(12, Math.min(left, window.innerWidth - popoverWidth - 12));

      // Flip above anchor if bottom is cut off by viewport bottom
      if (rect && (top + popoverHeight > window.innerHeight - 12)) {
        const topAbove = rect.top - popoverHeight - 8;
        if (topAbove >= 12) {
          top = topAbove;
        }
      }

      // Final viewport clamping
      top = Math.max(12, Math.min(top, window.innerHeight - popoverHeight - 12));

      setPos({ top, left });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, tableToolbar, focusedTableCell, triggerButtonRef]);

  // Outside click & Escape listener
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        if (triggerButtonRef?.current && triggerButtonRef.current.contains(e.target)) {
          return;
        }
        onClose?.();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, triggerButtonRef]);

  if (!isOpen || typeof document === 'undefined') return null;

  // Options parsing
  const choices = dropdownChoicesText
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const PRESETS = [
    { label: 'Status', choices: ['In Progress', 'Done', 'Upcoming', 'Blocked', 'Ready'] },
    { label: 'Priority', choices: ['High', 'Medium', 'Low', 'Critical'] },
    { label: 'Stage', choices: ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'] },
    { label: 'Category', choices: ['Engineering', 'Design', 'Marketing', 'Finance'] },
    { label: 'Yes / No', choices: ['Yes', 'No'] }
  ];

  const handleSelectPreset = (presetChoices) => {
    setDropdownChoicesText(presetChoices.join(', '));
  };

  const handleRemoveOption = (indexToRemove) => {
    const updated = choices.filter((_, idx) => idx !== indexToRemove);
    setDropdownChoicesText(updated.join(', '));
  };

  const handleAddOption = () => {
    if (!newOptionInput.trim()) {
      setIsAddingOption(false);
      return;
    }
    const added = newOptionInput.split(',').map((s) => s.trim()).filter(Boolean);
    const updated = [...choices, ...added];
    setDropdownChoicesText(updated.join(', '));
    setNewOptionInput('');
    setIsAddingOption(false);
  };

  const handleSaveEditedOption = (idx) => {
    if (!editingText.trim()) {
      handleRemoveOption(idx);
    } else {
      const updated = [...choices];
      updated[idx] = editingText.trim();
      setDropdownChoicesText(updated.join(', '));
    }
    setEditingIdx(-1);
  };

  const handleApply = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (choices.length === 0) return;

    const cell = tableToolbar?.cellEl || focusedTableCell;
    const table = tableToolbar?.tableEl || cell?.closest('table');

    if (dropdownTarget === 'cell') {
      if (cell) {
        const existingText = cell.textContent || '';
        cell.innerHTML = makeDropdownHTML(choices, existingText);
        cell.contentEditable = 'false';
        cell.setAttribute('data-cell-col-type', 'dropdown');
        const parentTable = tableToolbar?.tableEl || cell.closest('table');
        if (parentTable) parentTable.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } else {
      if (cell && table) {
        const parentRow = cell.closest('tr');
        if (parentRow) {
          const colIndex = Array.from(parentRow.children).indexOf(cell);
          if (colIndex >= 0) {
            const rows = table.querySelectorAll('tr');
            rows.forEach((row) => {
              if (row.parentElement && row.parentElement.tagName.toLowerCase() === 'thead') return;
              if (row.querySelector('th') && !row.querySelector('td')) return;
              const colCell = row.children[colIndex];
              if (colCell && colCell.tagName.toLowerCase() === 'td') {
                const existingText = colCell.textContent || '';
                colCell.innerHTML = makeDropdownHTML(choices, existingText);
                colCell.contentEditable = 'false';
                colCell.setAttribute('data-cell-col-type', 'dropdown');
              }
            });
            table.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      }
    }
    onClose?.();
  };

  const handleResetCell = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const cell = tableToolbar?.cellEl || focusedTableCell;
    if (cell) {
      const text = cell.textContent || '';
      cell.innerHTML = text.trim() || '&nbsp;';
      cell.contentEditable = 'true';
      cell.removeAttribute('data-cell-col-type');
      const table = tableToolbar?.tableEl || cell.closest('table');
      if (table) table.dispatchEvent(new Event('input', { bubbles: true }));
    }
    onClose?.();
  };

  const handleResetColumn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const cell = tableToolbar?.cellEl || focusedTableCell;
    const table = tableToolbar?.tableEl || cell?.closest('table');
    if (cell && table) {
      const parentRow = cell.closest('tr');
      if (parentRow) {
        const colIndex = Array.from(parentRow.children).indexOf(cell);
        if (colIndex >= 0) {
          const rows = table.querySelectorAll('tr');
          rows.forEach((row) => {
            if (row.parentElement && row.parentElement.tagName.toLowerCase() === 'thead') return;
            if (row.querySelector('th') && !row.querySelector('td')) return;
            const colCell = row.children[colIndex];
            if (colCell && colCell.tagName.toLowerCase() === 'td') {
              const text = colCell.textContent || '';
              colCell.innerHTML = text.trim() || '&nbsp;';
              colCell.contentEditable = 'true';
              colCell.removeAttribute('data-cell-col-type');
            }
          });
          table.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    }
    onClose?.();
  };

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[199999]"
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose?.();
        }}
      />
      <div
        ref={popoverRef}
        style={{ top: `${pos.top}px`, left: `${pos.left}px` }}
        className="fixed z-[200000] w-[320px] rounded-xl border border-slate-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 shadow-[0_12px_40px_rgb(0,0,0,0.14)] backdrop-blur-xl text-left font-sans select-none p-3.5 space-y-3.5 animate-in fade-in zoom-in-95 duration-100"
        onPointerDown={(e) => e.stopPropagation()}
      >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-zinc-800/80 pb-2.5">
        <div>
          <div className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-violet-600 dark:text-violet-400 shrink-0">
              <rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.3" />
              <path d="M5 7L8 10L11 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3 className="text-[13px] font-semibold text-slate-900 dark:text-zinc-100 leading-tight">
              Convert to dropdown
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 font-normal">
            Choose options for this cell or column.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onClose?.()}
          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shrink-0 -mr-1 -mt-1"
          title="Close"
        >
          <X size={14} strokeWidth={2} />
        </button>
      </div>

      {/* Preset section */}
      <div>
        <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">
          Preset
        </span>
        <div className="flex flex-wrap gap-1">
          {PRESETS.map((p) => {
            const isSelected =
              choices.length === p.choices.length &&
              p.choices.every((c, i) => c.toLowerCase() === (choices[i] || '').toLowerCase());
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => handleSelectPreset(p.choices)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md border transition-colors ${
                  isSelected
                    ? 'bg-violet-50 dark:bg-violet-950/60 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300'
                    : 'bg-slate-100/70 dark:bg-zinc-800/80 border-slate-200/60 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-zinc-700/80'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Options Chips section */}
      <div>
        <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">
          Options
        </span>
        <div className="flex flex-wrap gap-1.5 items-center max-h-[110px] overflow-y-auto thin-scrollbar p-0.5">
          {choices.map((opt, idx) => {
            if (editingIdx === idx) {
              return (
                <input
                  key={idx}
                  type="text"
                  autoFocus
                  className="px-2 py-0.5 text-[11px] bg-white dark:bg-zinc-800 border border-violet-500 rounded-md outline-none text-slate-800 dark:text-zinc-100 w-24"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onBlur={() => handleSaveEditedOption(idx)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter') handleSaveEditedOption(idx);
                    if (e.key === 'Escape') setEditingIdx(-1);
                  }}
                />
              );
            }
            return (
              <div
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium bg-slate-100 dark:bg-zinc-800/90 text-slate-700 dark:text-zinc-200 border border-slate-200/80 dark:border-zinc-700 rounded-md group"
              >
                <span
                  className="cursor-pointer hover:underline"
                  title="Click to edit"
                  onClick={() => {
                    setEditingIdx(idx);
                    setEditingText(opt);
                  }}
                >
                  {opt}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveOption(idx)}
                  className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                  title="Remove option"
                >
                  <X size={12} strokeWidth={2} />
                </button>
              </div>
            );
          })}

          {/* Add option input or button */}
          {isAddingOption ? (
            <div className="inline-flex items-center gap-1">
              <input
                ref={addInputRef}
                type="text"
                autoFocus
                placeholder="Option name..."
                className="px-2 py-0.5 text-[11px] bg-white dark:bg-zinc-800 border border-violet-500 rounded-md outline-none text-slate-800 dark:text-zinc-100 w-28"
                value={newOptionInput}
                onChange={(e) => setNewOptionInput(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') handleAddOption();
                  if (e.key === 'Escape') setIsAddingOption(false);
                }}
              />
              <button
                type="button"
                onClick={handleAddOption}
                className="p-1 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950 rounded"
              >
                <Check size={13} strokeWidth={2} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingOption(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-violet-600 dark:text-violet-400 bg-violet-50/60 dark:bg-violet-950/40 hover:bg-violet-100/80 dark:hover:bg-violet-900/60 border border-violet-200/60 dark:border-violet-800 rounded-md transition-colors"
            >
              <Plus size={12} strokeWidth={2} /> Add option
            </button>
          )}
        </div>
      </div>

      {/* Target Segmented Control */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <span className="text-[11px] font-medium text-slate-600 dark:text-zinc-300">Apply to</span>
        <div className="flex items-center p-0.5 bg-slate-100/90 dark:bg-zinc-800/90 rounded-lg border border-slate-200/60 dark:border-zinc-700/80">
          <button
            type="button"
            onClick={() => setDropdownTarget('cell')}
            className={`px-3 py-1 text-[11px] rounded-md transition-all ${
              dropdownTarget === 'cell'
                ? 'bg-white dark:bg-zinc-700 text-violet-700 dark:text-violet-300 shadow-2xs font-semibold'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 font-medium'
            }`}
          >
            Cell
          </button>
          <button
            type="button"
            onClick={() => setDropdownTarget('column')}
            className={`px-3 py-1 text-[11px] rounded-md transition-all ${
              dropdownTarget === 'column'
                ? 'bg-white dark:bg-zinc-700 text-violet-700 dark:text-violet-300 shadow-2xs font-semibold'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 font-medium'
            }`}
          >
            Column
          </button>
        </div>
      </div>

      {/* Primary Apply Button */}
      <button
        type="button"
        onClick={handleApply}
        className="w-full py-2 px-3 text-[12px] font-semibold text-white bg-violet-600 hover:bg-violet-700 active:bg-violet-800 rounded-lg shadow-sm transition-all duration-150 text-center cursor-pointer"
      >
        Apply
      </button>

      {/* Reversal Footer */}
      <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-center gap-3 text-[10.5px]">
        <button
          type="button"
          onClick={handleResetCell}
          className="text-slate-400 dark:text-zinc-500 hover:text-rose-500 dark:hover:text-rose-400 font-medium transition-colors"
        >
          Reset cell
        </button>
        <span className="text-slate-300 dark:text-zinc-700">·</span>
        <button
          type="button"
          onClick={handleResetColumn}
          className="text-slate-400 dark:text-zinc-500 hover:text-rose-500 dark:hover:text-rose-400 font-medium transition-colors"
        >
          Reset column
        </button>
      </div>
    </div>
  </>,
  document.body
);
}
