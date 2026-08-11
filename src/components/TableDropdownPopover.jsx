import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Check, X, BookmarkPlus, Trash2 } from 'lucide-react';

export const COLOR_PALETTES = {
  red:    { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  orange: { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
  amber:  { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  green:  { bg: '#dcfce7', color: '#166534', border: '#86efac' },
  blue:   { bg: '#e0f2fe', color: '#0369a1', border: '#7dd3fc' },
  purple: { bg: '#ede9fe', color: '#5b21b6', border: '#c4b5fd' },
  slate:  { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
};

export const BADGE_COLOR_MAP = {
  'critical':     COLOR_PALETTES.red,
  'blocked':      COLOR_PALETTES.red,
  'high':         COLOR_PALETTES.orange,
  'at risk':      COLOR_PALETTES.orange,
  'medium':       COLOR_PALETTES.amber,
  'in progress':  COLOR_PALETTES.amber,
  'pending':      COLOR_PALETTES.amber,
  'low':          COLOR_PALETTES.slate,
  'upcoming':     COLOR_PALETTES.slate,
  'not started':  COLOR_PALETTES.slate,
  'cancelled':    COLOR_PALETTES.slate,
  'done':         COLOR_PALETTES.green,
  'complete':     COLOR_PALETTES.green,
  'completed':    COLOR_PALETTES.green,
  'on track':     COLOR_PALETTES.green,
  'review':       COLOR_PALETTES.purple,
  'in review':    COLOR_PALETTES.purple,
  'on hold':      COLOR_PALETTES.purple,
  'ready':        COLOR_PALETTES.blue,
  'phase 1':      COLOR_PALETTES.blue,
  'phase 2':      COLOR_PALETTES.amber,
  'phase 3':      COLOR_PALETTES.green,
  'phase 4':      COLOR_PALETTES.purple,
  'yes':          COLOR_PALETTES.green,
  'no':           COLOR_PALETTES.red,
};

export const getOptionPalette = (optText, customColors = {}) => {
  const key = optText.toLowerCase().trim();
  if (customColors[key]) {
    const c = customColors[key];
    return typeof c === 'string' ? (COLOR_PALETTES[c] || COLOR_PALETTES.slate) : c;
  }
  return BADGE_COLOR_MAP[key] || COLOR_PALETTES.slate;
};

export const createDropdownHTML = (choices, initialValue = '', customColors = {}) => {
  const cleanChoices = choices.map(s => s.trim()).filter(Boolean);
  if (cleanChoices.length === 0) return '';
  const trimmedInitial = (initialValue || '').trim();
  const matchedVal = cleanChoices.find(c => c.toLowerCase() === trimmedInitial.toLowerCase());
  const selectedVal = matchedVal || cleanChoices[0];
  const initialPalette = getOptionPalette(selectedVal, customColors);

  const escapeAttr = (str) => String(str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const escapeHtml = (str) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const optionItems = cleanChoices.map(opt => {
    const p = getOptionPalette(opt, customColors);
    const safeOptAttr = escapeAttr(opt);
    const safeOptHtml = escapeHtml(opt);
    return `<div onpointerdown="
      event.preventDefault();
      event.stopPropagation();
      const menu = this.parentElement;
      const btn = menu ? menu.previousElementSibling : null;
      const valSpan = btn ? btn.querySelector('.selected-val') : null;
      if (valSpan) valSpan.innerText = this.getAttribute('data-val');
      if (btn) {
        btn.style.background = '${p.bg}';
        btn.style.color = '${p.color}';
        btn.style.borderColor = '${p.border}';
      }
      if (menu) menu.style.display = 'none';
      const block = this.closest('.table-block') || this.closest('table') || this.closest('td');
      if (block) {
        block.dispatchEvent(new Event('input', { bubbles: true }));
      }
    " data-val="${safeOptAttr}" onmouseover="this.style.background='#f1f5f9';" onmouseout="this.style.background='transparent';" style="display:flex; align-items:center; gap:8px; padding:6px 10px; font-size:12px; font-weight:500; color:#334155; cursor:pointer; text-align:left; transition:background 0.15s; font-family:inherit; border-radius:6px; margin-bottom:1px;">
      <span style="width:7px; height:7px; border-radius:50%; background:${p.color}; flex-shrink:0; display:inline-block;"></span>
      <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${safeOptHtml}</span>
    </div>`;
  }).join('');

  return `<div class="custom-doc-dropdown relative" contenteditable="false" onpointerdown="event.stopPropagation();" onmousedown="event.stopPropagation();" style="position:relative; display:inline-block; user-select:none; font-family:inherit; vertical-align:middle; line-height:normal;">
<button type="button" onpointerdown="
  event.preventDefault();
  event.stopPropagation();
  const menu = this.nextElementSibling;
  if (menu) {
    const isOpen = menu.style.display === 'block';
    document.querySelectorAll('.custom-doc-dropdown-menu').forEach(m => { m.style.display = 'none'; });
    menu.style.display = isOpen ? 'none' : 'block';
  }
" style="appearance:none; -webkit-appearance:none; display:inline-flex; align-items:center; justify-content:space-between; gap:6px; background:${initialPalette.bg}; color:${initialPalette.color}; border:1px solid ${initialPalette.border}; border-radius:6px; padding:3px 10px; font-size:11px; font-weight:600; outline:none; cursor:pointer; min-width:85px; box-shadow: 0 1px 2px rgba(0,0,0,0.03); transition:all 0.2s; user-select:none;">
  <span class="selected-val" style="margin-right:2px; display:inline-block; text-align:left; flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(selectedVal)}</span>
  <svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 24 24' style="flex-shrink:0; margin-left:auto; opacity:0.65;"><polyline points='6 9 12 15 18 9'></polyline></svg>
</button>
<div class="custom-doc-dropdown-menu" onpointerdown="event.stopPropagation();" onmousedown="event.stopPropagation();" style="display:none; position:absolute; left:0; top:100%; margin-top:4px; background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; box-shadow:0 10px 25px -5px rgba(15,23,42,0.12), 0 8px 16px -6px rgba(15,23,42,0.08); z-index:100005; min-width:130px; padding:4px; max-height:220px; overflow-y:auto; scrollbar-width:thin;">
  ${optionItems}
</div>
</div>`;
};

export default function TableDropdownPopover({
  isOpen,
  onClose,
  tableToolbar,
  focusedTableCell,
  lastFocusedTableCellRef,
  dropdownChoicesText,
  setDropdownChoicesText,
  createDropdownHTML: createDropdownHTMLProp,
  triggerButtonRef
}) {
  const popoverRef = useRef(null);
  const addInputRef = useRef(null);
  const makeDropdownHTML = createDropdownHTMLProp || createDropdownHTML;

  const targetCell = tableToolbar?.cellEl || focusedTableCell;
  const initialTarget = (targetCell && targetCell.tagName?.toUpperCase() === 'TH') ? 'column' : 'cell';

  const [dropdownTarget, setDropdownTarget] = useState(initialTarget);
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [newOptionInput, setNewOptionInput] = useState('');
  const [editingIdx, setEditingIdx] = useState(-1);
  const [editingText, setEditingText] = useState('');
  const [optionColors, setOptionColors] = useState({});
  const [savingPreset, setSavingPreset] = useState(false);
  const [presetNameInput, setPresetNameInput] = useState('');

  const [customPresets, setCustomPresets] = useState(() => {
    try {
      const saved = localStorage.getItem('regaarder_dropdown_custom_presets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveCustomPreset = (name, presetChoices) => {
    if (!name.trim() || !presetChoices.length) return;
    const newPreset = { label: name.trim(), choices: presetChoices };
    const updated = [...customPresets.filter(p => p.label.toLowerCase() !== name.trim().toLowerCase()), newPreset];
    setCustomPresets(updated);
    try {
      localStorage.setItem('regaarder_dropdown_custom_presets', JSON.stringify(updated));
    } catch {}
  };

  const removeCustomPreset = (name) => {
    const updated = customPresets.filter(p => p.label !== name);
    setCustomPresets(updated);
    try {
      localStorage.setItem('regaarder_dropdown_custom_presets', JSON.stringify(updated));
    } catch {}
  };

  const [pos, setPos] = useState({ top: 120, left: 100 });

  const activeTargetCellRef = useRef(null);
  const prevIsOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      // Highest-priority: the cell pinned at button-press time (before focus theft).
      const pinnedCell = lastFocusedTableCellRef?.current;
      const cell = (pinnedCell && document.body?.contains(pinnedCell))
        ? pinnedCell
        : (focusedTableCell && document.body?.contains(focusedTableCell))
          ? focusedTableCell
          : (tableToolbar?.cellEl && document.body?.contains(tableToolbar?.cellEl))
            ? tableToolbar.cellEl
            : null;

      // Always force overwrite activeTargetCellRef so stale targets from past sessions never persist
      activeTargetCellRef.current = cell;

      if (cell) {
        const dropdownMenu = cell.querySelector('.custom-doc-dropdown-menu');
        if (dropdownMenu) {
          const items = Array.from(dropdownMenu.querySelectorAll('[data-val]')).map(el => el.getAttribute('data-val'));
          if (items.length) {
            setDropdownChoicesText(items.join(', '));
          }
        }
      }

      if (!prevIsOpenRef.current) {
        const activeCell = cell;
        if (activeCell && activeCell.tagName?.toUpperCase() === 'TH') {
          setDropdownTarget('column');
        } else {
          setDropdownTarget('cell');
        }
      }

      setIsAddingOption(false);
      setNewOptionInput('');
      setEditingIdx(-1);
      setSavingPreset(false);
      setPresetNameInput('');
    } else {
      // Reset active target when popover is closed
      activeTargetCellRef.current = null;
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, lastFocusedTableCellRef, tableToolbar?.cellEl, focusedTableCell, setDropdownChoicesText]);

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const popoverWidth = 310;
      const popoverHeight = 380;

      const targetEl = activeTargetCellRef.current && document.body.contains(activeTargetCellRef.current)
        ? activeTargetCellRef.current
        : (lastFocusedTableCellRef?.current && document.body.contains(lastFocusedTableCellRef.current))
          ? lastFocusedTableCellRef.current
          : (tableToolbar?.cellEl && document.body.contains(tableToolbar.cellEl))
            ? tableToolbar.cellEl
            : (triggerButtonRef?.current && document.body.contains(triggerButtonRef.current))
              ? triggerButtonRef.current
              : null;

      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        let top = rect.bottom + 8;
        let left = rect.left;

        if (top + popoverHeight > window.innerHeight - 16) {
          top = Math.max(16, rect.top - popoverHeight - 8);
        }
        if (left + popoverWidth > window.innerWidth - 16) {
          left = Math.max(16, window.innerWidth - popoverWidth - 16);
        }
        left = Math.max(16, left);
        top = Math.max(16, top);

        setPos({ top, left });
        return;
      }

      const editorPaperEl = document.querySelector('.compose-blank-body') || 
                            document.querySelector('[contenteditable="true"]')?.closest('.bg-white, .dark\\:bg-zinc-900') || 
                            document.querySelector('[contenteditable="true"]');
      let editorTop = editorPaperEl ? editorPaperEl.getBoundingClientRect().top : 120;
      let top = Math.max(16, Math.min(editorTop, window.innerHeight - popoverHeight - 16));
      let left = Math.max(16, window.innerWidth - popoverWidth - 24);
      setPos({ top, left });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, lastFocusedTableCellRef, tableToolbar?.cellEl, triggerButtonRef]);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e) => {
      const isInsidePopover = e.target.closest('.table-dropdown-popover') || (popoverRef.current && popoverRef.current.contains(e.target));
      const isTrigger = e.target.closest('.table-dropdown-btn') || (triggerButtonRef?.current && triggerButtonRef.current.contains(e.target));
      const clickedCell = e.target.closest('td, th');

      if (clickedCell) {
        activeTargetCellRef.current = clickedCell;
        if (lastFocusedTableCellRef) {
          lastFocusedTableCellRef.current = clickedCell;
        }
        if (clickedCell.tagName?.toUpperCase() === 'TH') {
          setDropdownTarget('column');
        } else {
          setDropdownTarget('cell');
        }
        return;
      }

      if (!isInsidePopover && !isTrigger) {
        onClose?.();
      }
    };
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, triggerButtonRef, lastFocusedTableCellRef]);

  if (!isOpen || typeof document === 'undefined') return null;

  const rawChoices = (dropdownChoicesText || '').split(',').map((s) => s.trim()).filter(Boolean);
  const choices = rawChoices.length > 0 ? rawChoices : ['In Progress', 'Done', 'Upcoming', 'Blocked', 'Ready'];

  const BUILTIN_PRESETS = [
    { label: 'Status', choices: ['In Progress', 'Done', 'Upcoming', 'Blocked', 'Ready'] },
    { label: 'Priority', choices: ['High', 'Medium', 'Low', 'Critical'] },
    { label: 'Stage', choices: ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'] },
    { label: 'Category', choices: ['Engineering', 'Design', 'Marketing', 'Finance'] },
    { label: 'Severity', choices: ['Critical', 'Major', 'Minor', 'Low'] },
    { label: 'Yes / No', choices: ['Yes', 'No'] }
  ];

  const allPresets = [...BUILTIN_PRESETS, ...customPresets];

  const cycleOptionColor = (opt) => {
    const colorKeys = Object.keys(COLOR_PALETTES);
    const key = opt.toLowerCase().trim();
    const currentP = getOptionPalette(opt, optionColors);
    const currentKey = Object.keys(COLOR_PALETTES).find(k => COLOR_PALETTES[k].bg === currentP.bg) || 'slate';
    const nextIdx = (colorKeys.indexOf(currentKey) + 1) % colorKeys.length;
    const nextColorKey = colorKeys[nextIdx];
    setOptionColors(prev => ({ ...prev, [key]: COLOR_PALETTES[nextColorKey] }));
  };

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

  const resolveTargetCell = () => {
    // 1. Explicitly clicked cell while popover is open takes highest priority
    if (activeTargetCellRef.current && document.body.contains(activeTargetCellRef.current)) {
      return activeTargetCellRef.current;
    }
    // 2. Pinned cell from button press (from live selection or focused cell)
    if (lastFocusedTableCellRef?.current && document.body?.contains(lastFocusedTableCellRef.current)) {
      return lastFocusedTableCellRef.current;
    }
    // 3. Focused cell
    if (focusedTableCell && document.body.contains(focusedTableCell)) {
      return focusedTableCell;
    }
    // 4. Floating toolbar cell fallback
    if (tableToolbar?.cellEl && document.body.contains(tableToolbar.cellEl)) {
      return tableToolbar.cellEl;
    }
    if (tableToolbar?.tableEl && document.body.contains(tableToolbar.tableEl)) {
      const firstCell = tableToolbar.tableEl.querySelector('td, th');
      if (firstCell) return firstCell;
    }
    // Never resolve a "default" table cell via a generic DOM query. That can
    // drift to the far-left cell in the page when UI focus is shifting.
    return null;
  };

  const getCellInitialVal = (c) => {
    if (!c) return '';
    const selVal = c.querySelector?.('.selected-val');
    if (selVal) return selVal.textContent || '';
    return c.textContent || '';
  };

  const handleApply = () => {
    const raw = (dropdownChoicesText || '').split(',').map((s) => s.trim()).filter(Boolean);
    const applyChoices = raw.length > 0 ? raw : ['In Progress', 'Done', 'Upcoming', 'Blocked', 'Ready'];

    const cell = resolveTargetCell();
    if (!cell) return;
    const table = tableToolbar?.tableEl || cell.closest('table');
    if (!table) return;

    if (dropdownTarget === 'cell') {
      const initVal = getCellInitialVal(cell);
      cell.innerHTML = makeDropdownHTML(applyChoices, initVal, optionColors);
      cell.contentEditable = 'false';
      cell.setAttribute('data-cell-col-type', 'dropdown');
      table.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (dropdownTarget === 'column') {
      const parentRow = cell.closest('tr');
      if (parentRow) {
        const colIndex = typeof cell.cellIndex === 'number' ? cell.cellIndex : Array.from(parentRow.children).indexOf(cell);
        if (colIndex >= 0) {
          const rows = table.rows && table.rows.length ? Array.from(table.rows) : Array.from(table.querySelectorAll('tr'));
          rows.forEach((row) => {
            if (row.parentElement?.tagName.toLowerCase() === 'thead') return;
            if (row.querySelector('th') && !row.querySelector('td')) return;
            const colCell = row.cells ? row.cells[colIndex] : row.children[colIndex];
            if (colCell && (colCell.tagName.toLowerCase() === 'td' || colCell.tagName.toLowerCase() === 'th')) {
              const initVal = getCellInitialVal(colCell);
              colCell.innerHTML = makeDropdownHTML(applyChoices, initVal, optionColors);
              colCell.contentEditable = 'false';
              colCell.setAttribute('data-cell-col-type', 'dropdown');
            }
          });
          table.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    }
    onClose?.();
  };

  const handleResetCell = () => {
    const cell = resolveTargetCell();
    if (cell) {
      cell.innerHTML = getCellInitialVal(cell).trim() || '&nbsp;';
      cell.contentEditable = 'true';
      cell.removeAttribute('data-cell-col-type');
      (tableToolbar?.tableEl || cell.closest('table'))?.dispatchEvent(new Event('input', { bubbles: true }));
    }
    onClose?.();
  };

  const handleResetColumn = () => {
    const cell = resolveTargetCell();
    const table = tableToolbar?.tableEl || cell?.closest('table');
    if (cell && table) {
      const parentRow = cell.closest('tr');
      if (parentRow) {
        const colIndex = typeof cell.cellIndex === 'number' ? cell.cellIndex : Array.from(parentRow.children).indexOf(cell);
        if (colIndex >= 0) {
          const rows = table.rows && table.rows.length ? Array.from(table.rows) : Array.from(table.querySelectorAll('tr'));
          rows.forEach((row) => {
            if (row.parentElement?.tagName.toLowerCase() === 'thead') return;
            if (row.querySelector('th') && !row.querySelector('td')) return;
            const colCell = row.cells ? row.cells[colIndex] : row.children[colIndex];
            if (colCell?.tagName.toLowerCase() === 'td') {
              colCell.innerHTML = getCellInitialVal(colCell).trim() || '&nbsp;';
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

  const portalTarget = document.fullscreenElement || document.querySelector('.fullscreen-mode') || document.querySelector('[data-fullscreen="true"]') || document.body;

  return createPortal(
    <div
      ref={popoverRef}
      style={{ top: `${pos.top}px`, left: `${pos.left}px` }}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className="fixed z-[200000] w-[310px] table-dropdown-popover table-dropdown-modal-container rounded-xl border border-slate-200/80 dark:border-zinc-800/90 bg-white/95 dark:bg-zinc-900/95 shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl text-left font-sans select-none p-3.5 space-y-3 transition-all duration-150 animate-in fade-in zoom-in-98"
    >
      <div className="border-b border-slate-100 dark:border-zinc-800/80 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-violet-600 dark:text-violet-400 shrink-0">
            <rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.3" />
            <path d="M5 7L8 10L11 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h3 className="text-[13px] font-semibold text-slate-900 dark:text-zinc-100 leading-tight">
            Convert to dropdown
          </h3>
        </div>
        <button
          type="button"
          onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); onClose?.(); }}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 p-0.5 rounded transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
            Preset Choices
          </span>
          {!savingPreset ? (
            <button
              type="button"
              onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); setSavingPreset(true); }}
              className="text-[10px] font-medium text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
            >
              <BookmarkPlus size={10} /> + Save preset
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <input
                type="text"
                autoFocus
                placeholder="Preset name..."
                value={presetNameInput}
                onChange={(e) => setPresetNameInput(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') {
                    saveCustomPreset(presetNameInput, choices);
                    setSavingPreset(false);
                    setPresetNameInput('');
                  }
                  if (e.key === 'Escape') setSavingPreset(false);
                }}
                className="px-1.5 py-0.5 text-[10px] bg-white dark:bg-zinc-800 border border-violet-400 rounded outline-none w-24 text-slate-800 dark:text-zinc-100"
              />
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault(); e.stopPropagation();
                  saveCustomPreset(presetNameInput, choices);
                  setSavingPreset(false);
                  setPresetNameInput('');
                }}
                className="text-violet-600 p-0.5"
              >
                <Check size={10} />
              </button>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1 max-h-[75px] overflow-y-auto thin-scrollbar p-0.5">
          {allPresets.map((p) => {
            const isCustom = customPresets.some(cp => cp.label === p.label);
            const isSelected =
              choices.length === p.choices.length &&
              p.choices.every((c, i) => c.toLowerCase() === (choices[i] || '').toLowerCase());
            return (
              <div key={p.label} className="relative group inline-flex items-center">
                <button
                  type="button"
                  onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); handleSelectPreset(p.choices); }}
                  aria-pressed={isSelected}
                  className={`px-2 py-0.5 text-[11px] font-medium rounded-md border transition-all duration-150 ${
                    isSelected
                      ? 'bg-violet-50/80 dark:bg-violet-950/40 border-violet-300 dark:border-violet-700/80 text-violet-700 dark:text-violet-300 shadow-2xs font-semibold'
                      : 'bg-slate-50 dark:bg-zinc-800/50 border-slate-200/60 dark:border-zinc-700/60 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-800 dark:hover:text-zinc-200'
                  }`}
                >
                  {p.label}
                </button>
                {isCustom && (
                  <button
                    type="button"
                    onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); removeCustomPreset(p.label); }}
                    className="ml-0.5 text-slate-400 hover:text-rose-500 p-0.5 opacity-60 hover:opacity-100 transition-opacity"
                    title="Remove custom preset"
                  >
                    <Trash2 size={9} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">
          Options & Colors (click dot to cycle color)
        </span>
        <div className="flex flex-wrap gap-1.5 items-center max-h-[120px] overflow-y-auto thin-scrollbar p-0.5">
          {choices.map((opt, idx) => {
            const p = getOptionPalette(opt, optionColors);
            if (editingIdx === idx) {
              return (
                <input
                  key={idx}
                  type="text"
                  autoFocus
                  aria-label={`Edit option ${opt}`}
                  className="px-2 py-0.5 text-[11px] bg-white dark:bg-zinc-800 border border-violet-500 rounded-md outline-none text-slate-800 dark:text-zinc-100 w-24 focus:ring-1 focus:ring-violet-500"
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
                style={{ background: p.bg, color: p.color, borderColor: p.border }}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold border rounded-md transition-all shadow-2xs"
              >
                <button
                  type="button"
                  onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); cycleOptionColor(opt); }}
                  title="Click to cycle color"
                  className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0 cursor-pointer hover:scale-125 transition-transform"
                  style={{ background: p.color }}
                />
                <span
                  className="cursor-pointer hover:underline"
                  title="Click to edit text"
                  onPointerDown={(e) => {
                    e.preventDefault(); e.stopPropagation();
                    setEditingIdx(idx);
                    setEditingText(opt);
                  }}
                >
                  {opt}
                </span>
                <button
                  type="button"
                  onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); handleRemoveOption(idx); }}
                  aria-label={`Remove option ${opt}`}
                  className="opacity-60 hover:opacity-100 transition-opacity p-0.5 rounded focus-visible:outline-none"
                  title="Remove option"
                >
                  <X size={11} strokeWidth={2.5} />
                </button>
              </div>
            );
          })}

          {isAddingOption ? (
            <div className="inline-flex items-center gap-1">
              <input
                ref={addInputRef}
                type="text"
                autoFocus
                aria-label="New option name"
                placeholder="Option name..."
                className="px-2 py-0.5 text-[11px] bg-white dark:bg-zinc-800 border border-violet-500 rounded-md outline-none text-slate-800 dark:text-zinc-100 w-28 focus:ring-1 focus:ring-violet-500"
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
                onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); handleAddOption(); }}
                aria-label="Confirm add option"
                className="p-1 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950 rounded transition-colors"
              >
                <Check size={12} strokeWidth={2} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsAddingOption(true); }}
              aria-label="Add option"
              className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-violet-600 dark:text-violet-400 bg-violet-50/50 dark:bg-violet-950/30 hover:bg-violet-100/70 dark:hover:bg-violet-900/50 border border-dashed border-violet-200/80 dark:border-violet-800/80 rounded-md transition-colors cursor-pointer"
            >
              <Plus size={11} strokeWidth={2} /> Add option
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-0.5">
        <span className="text-[11px] font-medium text-slate-600 dark:text-zinc-300">Apply to</span>
        <div className="flex items-center p-0.5 bg-slate-100/80 dark:bg-zinc-800/80 rounded-lg border border-slate-200/60 dark:border-zinc-700/60">
          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); setDropdownTarget('cell'); }}
            aria-pressed={dropdownTarget === 'cell'}
            className={`px-2.5 py-0.5 text-[11px] rounded-md transition-all ${
              dropdownTarget === 'cell'
                ? 'bg-white dark:bg-zinc-700 text-violet-700 dark:text-violet-300 shadow-2xs font-semibold'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 font-medium'
            }`}
          >
            Cell
          </button>
          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); setDropdownTarget('column'); }}
            aria-pressed={dropdownTarget === 'column'}
            className={`px-2.5 py-0.5 text-[11px] rounded-md transition-all ${
              dropdownTarget === 'column'
                ? 'bg-white dark:bg-zinc-700 text-violet-700 dark:text-violet-300 shadow-2xs font-semibold'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 font-medium'
            }`}
          >
            Column
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleApply();
        }}
        className="w-full py-1.5 px-3 text-[12px] font-semibold text-white bg-violet-600 hover:bg-violet-700 active:bg-violet-800 rounded-lg shadow-2xs transition-all duration-150 text-center cursor-pointer active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1"
      >
        Apply
      </button>

      <div className="pt-1.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-center gap-2.5 text-[10.5px]">
        <button
          type="button"
          onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); handleResetCell(); }}
          className="text-slate-400 dark:text-zinc-500 hover:text-rose-500 dark:hover:text-rose-400 font-medium transition-colors"
        >
          Reset cell
        </button>
        <span className="text-slate-300 dark:text-zinc-700">·</span>
        <button
          type="button"
          onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); handleResetColumn(); }}
          className="text-slate-400 dark:text-zinc-500 hover:text-rose-500 dark:hover:text-rose-400 font-medium transition-colors"
        >
          Reset column
        </button>
      </div>
    </div>,
    portalTarget
  );
}
