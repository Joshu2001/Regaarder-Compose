/**
 * MatrixSchemaInspector.jsx
 *
 * Pillar 5: The Matrix Engine (Code Execution & Schema Validation Inspector)
 *
 * Apple-tier executive interface to inspect active spreadsheet schemas,
 * run in-browser relational SQL queries, validate data against column types (Rule 9),
 * and trace topological formula dependencies with cycle detection.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Table, CheckCircle2, AlertTriangle, Play, RefreshCw, Copy, Check,
  Database, Calculator, Code2, Plus, Filter, ChevronRight,
  Terminal, ShieldCheck, ArrowRight, Layers, FileSpreadsheet
} from 'lucide-react';
import { RegaarderAiIcon } from '../RegaarderProductIcons';
import * as matrixEngine from '../../services/matrixSchemaEngine';

export default function MatrixSchemaInspector() {
  const [activeSubTab, setActiveSubTab] = useState('blueprint'); // 'blueprint' | 'validation' | 'sql' | 'formulas' | 'export'
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeSheetGrid, setActiveSheetGrid] = useState(() => {
    if (typeof window !== 'undefined' && window.__REGAARDER_SHEET_DATA__) {
      const data = window.__REGAARDER_SHEET_DATA__;
      const targetId = data.activeSheetId || 'default';
      return data.sheetGrids?.[targetId] || null;
    }
    return null;
  });

  // SQL Query State
  const [sqlQuery, setSqlQuery] = useState('SELECT *');
  const [sqlResult, setSqlResult] = useState(null);
  const [sqlRunning, setSqlRunning] = useState(false);

  // New Column State
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColLabel, setNewColLabel] = useState('');
  const [newColType, setNewColType] = useState('text');
  const [newColOptions, setNewColOptions] = useState('Active, Pending, Completed');

  // Formula & Validation Evaluation State
  const [recalculating, setRecalculating] = useState(false);
  const [notification, setNotification] = useState(null);

  // Poll / Subscribe to matrix changes
  useEffect(() => {
    const checkState = () => {
      if (typeof window !== 'undefined' && window.__REGAARDER_SHEET_DATA__) {
        const data = window.__REGAARDER_SHEET_DATA__;
        const targetId = data.activeSheetId || 'default';
        const grid = data.sheetGrids?.[targetId];
        if (grid) setActiveSheetGrid({ ...grid });
      }
    };
    checkState();
    const unsub = matrixEngine.subscribeToMatrixEngine(() => checkState());
    const timer = setInterval(checkState, 2000);
    return () => {
      unsub();
      clearInterval(timer);
    };
  }, []);

  // Detect whether the sheet actually has any non-empty cell content
  const isSheetEmpty = useMemo(() => {
    const cells = activeSheetGrid?.cells || [];
    if (!Array.isArray(cells) || cells.length === 0) return true;
    for (let r = 0; r < cells.length; r++) {
      const row = cells[r];
      if (Array.isArray(row)) {
        for (let c = 0; c < row.length; c++) {
          const val = String(row[c] !== undefined && row[c] !== null ? row[c] : '').trim();
          if (val !== '') return false;
        }
      }
    }
    return true;
  }, [activeSheetGrid]);

  // Compute Active Matrix Schema (Rule 7: Intersection-safe)
  const schema = useMemo(() => {
    if (isSheetEmpty) {
      return { columns: [], orientation: 'horizontal', rowCount: 0, colCount: 0 };
    }
    const cells = activeSheetGrid?.cells || [];
    return matrixEngine.inferMatrixSchema(cells);
  }, [activeSheetGrid, isSheetEmpty]);

  // Compute Validation Status (Rule 9: Dropdowns & %)
  const validation = useMemo(() => {
    if (isSheetEmpty || schema.columns.length === 0) {
      return { valid: true, violations: [], violationCount: 0, summary: 'No data to validate' };
    }
    const cells = activeSheetGrid?.cells || [];
    return matrixEngine.validateMatrixData(cells, schema.columns);
  }, [activeSheetGrid, schema, isSheetEmpty]);

  // Compute Formula Cells & Cycles
  const formulaStats = useMemo(() => {
    if (isSheetEmpty) return { list: [], count: 0 };
    const cells = activeSheetGrid?.cells || [];
    const list = [];
    for (let r = 0; r < cells.length; r++) {
      const row = cells[r];
      if (!Array.isArray(row)) continue;
      for (let c = 0; c < row.length; c++) {
        const val = row[c];
        if (typeof val === 'string' && val.startsWith('=')) {
          const cellRef = `${matrixEngine.colIndexToLetter(c)}${r + 1}`;
          list.push({ row: r, col: c, cellRef, raw: val });
        }
      }
    }
    return { list, count: list.length };
  }, [activeSheetGrid, isSheetEmpty]);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleLoadSampleModel = () => {
    const sampleRows = [
      ['Department', 'Q1 Actual', 'Q2 Forecast', 'Status', 'Margin %'],
      ['Enterprise Sales', '$1,250,000', '$1,420,000', 'Active', '32%'],
      ['Cloud Infrastructure', '$840,000', '$910,000', 'In Progress', '45%'],
      ['Product Engineering', '$2,100,000', '$2,250,000', 'Active', '28%'],
      ['Developer Relations', '$320,000', '$380,000', 'Completed', '18%'],
      ['AI Research Lab', '$1,750,000', '$1,950,000', 'Active', '52%'],
    ];
    const patches = [];
    for (let r = 0; r < sampleRows.length; r++) {
      for (let c = 0; c < sampleRows[r].length; c++) {
        patches.push({ row: r, col: c, value: sampleRows[r][c] });
      }
    }
    if (typeof window !== 'undefined' && window.__REGAARDER_UPDATE_SHEET_CELLS__) {
      window.__REGAARDER_UPDATE_SHEET_CELLS__(patches);
    }
    setNotification('Sample Financial Model loaded into active sheet.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRunSql = (overrideQuery) => {
    const q = typeof overrideQuery === 'string' ? overrideQuery : sqlQuery;
    if (isSheetEmpty) {
      setSqlResult({ success: false, error: 'Cannot query an empty worksheet. Load or enter tabular data first.', rowCount: 0, executionTimeMs: 0 });
      return;
    }
    setSqlRunning(true);
    const cells = activeSheetGrid?.cells || [];
    setTimeout(() => {
      const res = matrixEngine.queryMatrixSql(cells, q, schema.columns);
      setSqlResult(res);
      setSqlRunning(false);
    }, 50);
  };

  const dynamicSqlSamples = useMemo(() => {
    if (!schema.columns || schema.columns.length === 0) {
      return [{ label: 'SELECT *', query: 'SELECT *' }];
    }
    const samples = [{ label: 'SELECT *', query: 'SELECT *' }];

    // Filter column check
    const filterCol = schema.columns.find(c => c.type === 'dropdown' || c.key.includes('status')) || schema.columns[0];
    if (filterCol) {
      const sampleVal = filterCol.options?.[0] || 'Active';
      samples.push({
        label: `Filter ${filterCol.label}`,
        query: `SELECT * WHERE ${filterCol.key} = '${sampleVal}'`
      });
    }

    // Aggregation column check
    const numCol = schema.columns.find(c => ['currency', 'percentage', 'number'].includes(c.type));
    const groupCol = schema.columns.find(c => c !== numCol && (c.type === 'text' || c.type === 'dropdown'));
    if (numCol && groupCol) {
      samples.push({
        label: `Group by ${groupCol.label}`,
        query: `SELECT ${groupCol.key}, SUM(${numCol.key}) GROUP BY ${groupCol.key}`
      });
    } else if (schema.columns.length > 2) {
      samples.push({
        label: `Project Top Columns`,
        query: `SELECT ${schema.columns.slice(0, 3).map(c => c.key).join(', ')} LIMIT 5`
      });
    }

    return samples;
  }, [schema.columns]);

  const handleAutoFixAll = async () => {
    if (validation.violations.length === 0) return;
    const patches = validation.violations
      .filter(v => v.autoFix !== undefined)
      .map(v => ({ row: v.row, col: v.col, value: v.autoFix }));

    if (patches.length > 0) {
      await matrixEngine.patchMatrixCells({ patches });
      setNotification(`Auto-corrected ${patches.length} violation(s) to match schema.`);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleAddColumn = async () => {
    if (!newColLabel.trim()) return;
    const options = newColType === 'dropdown' ? newColOptions.split(',').map(s => s.trim()).filter(Boolean) : null;
    await matrixEngine.addColumnWithSchema({
      column: { label: newColLabel.trim(), type: newColType, options },
    });
    setNewColLabel('');
    setIsAddingColumn(false);
    setNotification(`Added column "${newColLabel}" to schema.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRecalculateFormulas = async () => {
    setRecalculating(true);
    const cells = activeSheetGrid?.cells || [];
    const evalRes = matrixEngine.evaluateMatrixFormulas(cells);
    if (evalRes.formulaCount > 0 && typeof window !== 'undefined' && window.__REGAARDER_UPDATE_SHEET_CELLS__) {
      const patches = [];
      for (let r = 0; r < evalRes.evaluatedCells.length; r++) {
        for (let c = 0; c < evalRes.evaluatedCells[r]?.length; c++) {
          if (String(cells[r]?.[c] || '').startsWith('=')) {
            patches.push({ row: r, col: c, value: evalRes.evaluatedCells[r][c] });
          }
        }
      }
      if (patches.length > 0) {
        window.__REGAARDER_UPDATE_SHEET_CELLS__(patches);
      }
    }
    setRecalculating(false);
    setNotification(`Recalculated ${evalRes.formulaCount} formula cells.`);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-4">
      {/* ── Header Card ── */}
      <div className="p-4 rounded-xl bg-white/80 dark:bg-zinc-800/70 border border-black/[0.06] dark:border-white/[0.08] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/10 dark:bg-violet-400/10 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-500/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Matrix Execution Engine</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Pillar 5 Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Protocol schema validation, topological formula recalculation, and in-browser SQL substrate.
            </p>
          </div>
        </div>

        {/* Status Metrics Strip */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-700/60 text-center">
            <div className="text-[9px] uppercase tracking-wider text-slate-400 font-mono font-medium">Columns</div>
            <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 font-mono">
              {isSheetEmpty ? 0 : schema.columns.length}
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-700/60 text-center">
            <div className="text-[9px] uppercase tracking-wider text-slate-400 font-mono font-medium">Data Rows</div>
            <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 font-mono">
              {isSheetEmpty ? 0 : Math.max(0, schema.rowCount - 1)}
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-lg border text-center ${isSheetEmpty ? 'bg-slate-100 dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-700/60' : validation.valid ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40' : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/40'}`}>
            <div className="text-[9px] uppercase tracking-wider font-mono font-medium text-slate-500">Violations</div>
            <div className={`text-xs font-bold font-mono ${isSheetEmpty ? 'text-slate-600 dark:text-zinc-300' : validation.valid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {isSheetEmpty ? 0 : validation.violationCount}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer">✕</button>
        </div>
      )}

      {/* ── Subtab Navigation Bar (Rounded Rectangles, Never Pills) ── */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-900/60 rounded-xl border border-slate-200/80 dark:border-zinc-800 overflow-x-auto thin-scrollbar">
        {[
          { id: 'blueprint', label: 'Schema Blueprint', icon: Table },
          { id: 'validation', label: `Data Validation (${isSheetEmpty ? 0 : validation.violationCount})`, icon: ShieldCheck, badge: !isSheetEmpty && validation.violationCount > 0 ? validation.violationCount : null },
          { id: 'sql', label: 'In-Browser SQL', icon: Database },
          { id: 'formulas', label: `Formulas (${formulaStats.count})`, icon: Code2 },
          { id: 'export', label: 'Token-Dense Export', icon: FileSpreadsheet },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs border border-slate-200/80 dark:border-zinc-700'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-rose-500 text-white font-bold font-mono">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content: Schema Blueprint ── */}
      {activeSubTab === 'blueprint' && (
        <div className="space-y-3">
          {isSheetEmpty ? (
            <div className="p-8 sm:p-12 rounded-2xl bg-white/60 dark:bg-zinc-800/40 border border-dashed border-slate-200 dark:border-zinc-700 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-500/20 shadow-2xs">
                <FileSpreadsheet size={24} />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Tabular Data in Active Sheet</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  The Matrix Engine inspects live spreadsheet schemas, enforces column validation constraints (dropdowns, percentages), and executes in-browser SQL once your worksheet has data.
                </p>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap justify-center pt-1">
                <button
                  type="button"
                  onClick={handleLoadSampleModel}
                  className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Table size={14} />
                  <span>Load Sample Financial Model</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingColumn(true)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200/90 dark:border-zinc-700 hover:bg-slate-100/60 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Add Typed Column</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Inferred Column Schemas ({schema.columns.length} columns | Orientation: {schema.orientation})
                </div>
                <button
                  onClick={() => setIsAddingColumn(prev => !prev)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Typed Column</span>
                </button>
              </div>

              {/* Add Column Inline Card */}
              {isAddingColumn && (
                <div className="p-3.5 rounded-xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800/40 space-y-3">
                  <div className="text-xs font-bold text-violet-900 dark:text-violet-300">Add New Typed Column</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Column Label (e.g. Stage)"
                      value={newColLabel}
                      onChange={(e) => setNewColLabel(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-800 dark:text-zinc-200 focus:outline-violet-500"
                    />
                    <select
                      value={newColType}
                      onChange={(e) => setNewColType(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-800 dark:text-zinc-200 focus:outline-violet-500"
                    >
                      {matrixEngine.ALLOWED_COLUMN_TYPES.map(t => (
                        <option key={t} value={t}>{t.toUpperCase()}</option>
                      ))}
                    </select>
                    {newColType === 'dropdown' ? (
                      <input
                        type="text"
                        placeholder="Options (comma separated)"
                        value={newColOptions}
                        onChange={(e) => setNewColOptions(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-800 dark:text-zinc-200 focus:outline-violet-500"
                      />
                    ) : (
                      <div className="text-[11px] text-slate-400 flex items-center">Standard type validation active</div>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setIsAddingColumn(false)}
                      className="px-2.5 py-1 rounded-lg text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddColumn}
                      className="px-3 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold cursor-pointer"
                    >
                      Save Column
                    </button>
                  </div>
                </div>
              )}

              {/* Columns Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {schema.columns.map((col) => (
                  <div
                    key={col.index}
                    className="p-3.5 rounded-xl bg-white/80 dark:bg-zinc-800/70 border border-black/[0.06] dark:border-white/[0.08] shadow-2xs space-y-2 hover:border-violet-500/30 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 flex items-center justify-center text-[10px] font-mono font-bold">
                          {matrixEngine.colIndexToLetter(col.index)}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{col.label}</span>
                      </div>
                      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border ${
                        col.type === 'dropdown' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' :
                        col.type === 'percentage' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                        col.type === 'currency' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' :
                        col.type === 'formula' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' :
                        'bg-slate-500/10 text-slate-600 dark:text-zinc-400 border-slate-500/20'
                      }`}>
                        {col.type}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono flex items-center gap-2">
                      <span>key: <code className="text-slate-700 dark:text-zinc-300 font-bold">{col.key}</code></span>
                      <span>•</span>
                      <span>width: {col.width}px</span>
                    </div>

                    {col.type === 'dropdown' && col.options && (
                      <div className="pt-1.5 border-t border-slate-100 dark:border-zinc-700/50">
                        <div className="text-[10px] uppercase font-mono text-slate-400 mb-1">Predefined Options (Rule 9):</div>
                        <div className="flex flex-wrap gap-1">
                          {col.options.map((opt, oIdx) => (
                            <span
                              key={oIdx}
                              className="px-1.5 py-0.5 text-[10px] rounded bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-600"
                            >
                              {opt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Tab Content: Data Validation ── */}
      {activeSubTab === 'validation' && (
        <div className="space-y-3">
          {isSheetEmpty ? (
            <div className="p-8 sm:p-12 rounded-2xl bg-white/60 dark:bg-zinc-800/40 border border-dashed border-slate-200 dark:border-zinc-700 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 flex items-center justify-center border border-slate-200 dark:border-zinc-700">
                <ShieldCheck size={24} />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Cells to Validate</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Column constraints, categorical dropdown options, and native percentage formatting rules will be verified once rows are added.
                </p>
              </div>
              <button
                type="button"
                onClick={handleLoadSampleModel}
                className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Table size={13} />
                <span>Load Sample Model to Validate</span>
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">{validation.summary}</span>
                </div>
                {validation.violationCount > 0 && (
                  <button
                    onClick={handleAutoFixAll}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-all cursor-pointer shadow-2xs"
                  >
                    <RegaarderAiIcon size={14} />
                    <span>Auto-Fix All Violations</span>
                  </button>
                )}
              </div>

              {validation.violations.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-white/80 dark:bg-zinc-800/70 border border-black/[0.06] dark:border-white/[0.08] space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">100% Strict Schema Conformance</div>
                  <div className="text-[11px] text-slate-500">All cells adhere to column types, dropdown options, and native percentage formatting.</div>
                </div>
              ) : (
            <div className="space-y-2">
              {validation.violations.map((v, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white/80 dark:bg-zinc-800/70 border border-rose-200 dark:border-rose-900/50 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono font-bold text-xs border border-rose-500/20">
                      {v.cellRef}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{v.columnLabel}</span>
                        <span className="text-[10px] font-mono text-slate-400 font-normal">({v.columnType})</span>
                      </div>
                      <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">{v.error}</div>
                    </div>
                  </div>

                  {v.autoFix !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-mono">
                        Fix: <code className="text-emerald-600 dark:text-emerald-400 font-bold">{String(v.autoFix)}</code>
                      </span>
                      <button
                        onClick={async () => {
                          await matrixEngine.patchMatrixCells({
                            patches: [{ row: v.row, col: v.col, value: v.autoFix }],
                          });
                          setNotification(`Corrected ${v.cellRef} to "${v.autoFix}"`);
                          setTimeout(() => setNotification(null), 2500);
                        }}
                        className="px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20 cursor-pointer"
                      >
                        Apply Fix
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
      )}

      {/* ── Tab Content: In-Browser SQL ── */}
      {activeSubTab === 'sql' && (
        <div className="space-y-3">
          {isSheetEmpty ? (
            <div className="p-8 sm:p-12 rounded-2xl bg-white/60 dark:bg-zinc-800/40 border border-dashed border-slate-200 dark:border-zinc-700 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 flex items-center justify-center border border-slate-200 dark:border-zinc-700">
                <Database size={24} />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Table Data Available to Query</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  In-browser relational SQL queries operate directly on your worksheet data. Populate rows or load a sample model to execute queries like <code className="font-mono text-violet-600 dark:text-violet-400 font-semibold">SELECT Department, SUM(Q1_Actual) GROUP BY Department</code>.
                </p>
              </div>
              <button
                type="button"
                onClick={handleLoadSampleModel}
                className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Table size={13} />
                <span>Load Sample Model & Run SQL</span>
              </button>
            </div>
          ) : (
            <>
              <div className="p-3.5 rounded-xl bg-white/80 dark:bg-zinc-800/70 border border-black/[0.06] dark:border-white/[0.08] shadow-2xs space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Relational SQL Console</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {dynamicSqlSamples.map((sample, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => {
                          setSqlQuery(sample.query);
                          handleRunSql(sample.query);
                        }}
                        className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-700 text-[10px] font-mono text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-600 transition-all cursor-pointer"
                      >
                        {sample.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleRunSql(); }}
                    placeholder={schema.columns.length > 0 ? `e.g. SELECT ${schema.columns.slice(0, 3).map(c => c.key).join(', ')} WHERE ...` : 'Enter SQL query (e.g. SELECT *)'}
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-mono text-slate-800 dark:text-zinc-200 focus:outline-violet-500"
                  />
                  <button
                    onClick={() => handleRunSql()}
                    disabled={sqlRunning}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{sqlRunning ? 'Running...' : 'Run Query'}</span>
                  </button>
                </div>
              </div>

              {/* SQL Results View or Standby Empty State */}
              {!sqlResult ? (
                <div className="p-8 sm:p-10 rounded-2xl bg-white/60 dark:bg-zinc-800/40 border border-dashed border-slate-200 dark:border-zinc-700 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-500/20">
                    <Database size={24} />
                  </div>
                  <div className="max-w-md space-y-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Query Substrate Ready</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                      Execute relational SQL queries directly across the {schema.columns.length} columns of your in-memory worksheet matrix.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-md pt-1">
                    {schema.columns.slice(0, 6).map((col) => (
                      <span key={col.key} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-700/80 text-[10px] font-mono text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-600">
                        {col.key} <span className="text-slate-400">({col.type})</span>
                      </span>
                    ))}
                    {schema.columns.length > 6 && (
                      <span className="text-[10px] font-mono text-slate-400">+{schema.columns.length - 6} more</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSqlQuery('SELECT *');
                      handleRunSql('SELECT *');
                    }}
                    className="mt-1 px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Play size={12} className="fill-current" />
                    <span>Execute "SELECT *"</span>
                  </button>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-white/80 dark:bg-zinc-800/70 border border-black/[0.06] dark:border-white/[0.08] shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>{sqlResult.rowCount} rows returned in {sqlResult.executionTimeMs}ms</span>
                    {sqlResult.error && (
                      <span className="text-rose-500 font-bold">{sqlResult.error}</span>
                    )}
                  </div>

                  {sqlResult.rowCount === 0 && !sqlResult.error ? (
                    <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-2">
                      <Filter className="w-8 h-8 text-slate-400 mx-auto" />
                      <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">0 Rows Matched Filter</div>
                      <div className="text-[11px] text-slate-500 max-w-sm mx-auto">
                        No rows in the worksheet matched your WHERE filter condition in: <code className="font-mono text-violet-600 dark:text-violet-400 font-semibold">{sqlQuery}</code>.
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSqlQuery('SELECT *');
                          handleRunSql('SELECT *');
                        }}
                        className="mt-2 px-3 py-1 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
                      >
                        Reset to "SELECT *"
                      </button>
                    </div>
                  ) : (
                    sqlResult.success && sqlResult.columns.length > 0 && (
                      <div className="overflow-x-auto thin-scrollbar rounded-lg border border-slate-200 dark:border-zinc-700">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 font-bold border-b border-slate-200 dark:border-zinc-700">
                            <tr>
                              {sqlResult.columns.map((c, idx) => (
                                <th key={idx} className="px-3 py-2 font-mono">{c}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                            {sqlResult.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="px-3 py-1.5 font-mono text-slate-800 dark:text-zinc-200">
                                    {String(cell !== undefined && cell !== null ? cell : '')}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Tab Content: Formulas & Cycles ── */}
      {activeSubTab === 'formulas' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Active Dynamic Formulas ({formulaStats.count} formula cells detected)
            </div>
            {formulaStats.count > 0 && (
              <button
                onClick={handleRecalculateFormulas}
                disabled={recalculating}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-all cursor-pointer shadow-2xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
                <span>Recalculate All</span>
              </button>
            )}
          </div>

          {formulaStats.count === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white/60 dark:bg-zinc-800/40 border border-dashed border-slate-200 dark:border-zinc-700 space-y-2">
              <Code2 className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">No Dynamic Formula Cells</div>
              <div className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Type <code className="font-mono text-violet-600 dark:text-violet-400 font-semibold">=SUM(...)</code> or <code className="font-mono text-violet-600 dark:text-violet-400 font-semibold">=AVERAGE(...)</code> in spreadsheet cells to register dynamic calculation nodes with cycle detection.
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {formulaStats.list.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white/80 dark:bg-zinc-800/70 border border-black/[0.06] dark:border-white/[0.08] shadow-2xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-7 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono font-bold text-xs flex items-center justify-center border border-purple-500/20">
                      {item.cellRef}
                    </span>
                    <div>
                      <code className="text-xs font-mono font-bold text-slate-900 dark:text-white">{item.raw}</code>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Cycle Safe
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab Content: Token-Dense Export ── */}
      {activeSubTab === 'export' && (
        <div className="space-y-3">
          {isSheetEmpty ? (
            <div className="p-8 text-center rounded-2xl bg-white/60 dark:bg-zinc-800/40 border border-dashed border-slate-200 dark:border-zinc-700">
              <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">No Data to Export</div>
              <div className="text-[11px] text-slate-500">Add rows or load a sample model to generate token-optimized feeds for LLMs and external agents.</div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  High-Density Markdown (MCP Resource: workspace://sheets/active)
                </div>
                <button
                  onClick={() => handleCopy(matrixEngine.matrixAstToMarkdown(activeSheetGrid), 'md')}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-medium cursor-pointer"
                >
                  {copiedKey === 'md' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'md' ? 'Copied' : 'Copy Markdown'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto border border-slate-800 max-h-96">
                {matrixEngine.matrixAstToMarkdown(activeSheetGrid)}
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}
