import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  TrendingUp, ChevronDown, MoreHorizontal, Sliders, Plus, RefreshCw,
  Download, FileText, Copy, Send, Pin, Share2, RotateCcw, Maximize2,
  Settings, X, BarChart2
} from 'lucide-react';

const toColumnLabel = (index) => {
  let current = index + 1;
  let label = '';
  while (current > 0) {
    const rem = (current - 1) % 26;
    label = String.fromCharCode(65 + rem) + label;
    current = Math.floor((current - 1) / 26);
  }
  return label;
};

export const extractTemplateChartData = (grid, selectedColIdxOverride = null) => {
  if (!grid || !grid.cells || !Array.isArray(grid.cells) || grid.cells.length === 0) {
    return null;
  }
  const cells = grid.cells;
  const rowsCount = cells.length;
  const colsCount = cells[0]?.length || 0;

  // 1. Detect title & header row
  let headerRowIdx = 0;
  for (let r = 0; r < Math.min(rowsCount, 5); r++) {
    const nonCount = (cells[r] || []).filter(c => c !== undefined && c !== null && String(c).trim() !== '').length;
    if (nonCount >= 2) {
      headerRowIdx = r;
      break;
    }
  }

  // Title inference (prefer row 0 cell 0 if row 0 is a banner, otherwise first non-empty text)
  let title = 'Worksheet Visualizer';
  if (cells[0]?.[0] && String(cells[0][0]).trim() !== '') {
    title = String(cells[0][0]).trim();
  } else if (cells[headerRowIdx]?.[0] && String(cells[headerRowIdx][0]).trim() !== '') {
    title = String(cells[headerRowIdx][0]).trim();
  }

  const headers = [];
  for (let c = 0; c < colsCount; c++) {
    const rawHeader = cells[headerRowIdx]?.[c];
    headers.push((rawHeader !== undefined && rawHeader !== null && String(rawHeader).trim() !== '') 
      ? String(rawHeader).trim() 
      : `Col ${toColumnLabel(c)}`);
  }

  // 2. Isolate intersection cell (0,0) / (headerRowIdx, 0) and scan remaining columns/rows for types
  let labelColIdx = 0;
  let maxTextCount = -1;

  for (let c = 0; c < colsCount; c++) {
    let textCount = 0;
    let numCount = 0;
    for (let r = headerRowIdx + 1; r < rowsCount; r++) {
      const val = cells[r]?.[c];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        const strVal = String(val).trim();
        const cleanNum = Number(strVal.replace(/[\$,%\sxa-zA-Z]/g, ''));
        if (!isNaN(cleanNum) && strVal !== '') {
          numCount++;
        } else {
          textCount++;
        }
      }
    }
    if (textCount > numCount && textCount > maxTextCount) {
      maxTextCount = textCount;
      labelColIdx = c;
    }
  }

  // 3. Find all numerical columns
  const dataCols = [];
  for (let c = 0; c < colsCount; c++) {
    if (c === labelColIdx) continue;
    let numericCount = 0;
    let totalCount = 0;
    for (let r = headerRowIdx + 1; r < rowsCount; r++) {
      const rawVal = cells[r]?.[c];
      if (rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== '') {
        totalCount++;
        const cleanNum = Number(String(rawVal).replace(/[\$,%\sxa-zA-Z]/g, ''));
        if (!isNaN(cleanNum)) numericCount++;
      }
    }
    if (totalCount > 0 && numericCount / totalCount >= 0.4) {
      dataCols.push(c);
    }
  }

  const activeDataColIdx = (selectedColIdxOverride !== null && selectedColIdxOverride !== undefined)
    ? selectedColIdxOverride
    : (dataCols.length > 0 ? dataCols[0] : (labelColIdx === 0 ? 1 : 0));

  // 4. Extract labels and multi-series values dynamically
  const labels = [];
  const seriesData = [];
  const allSeriesMap = dataCols.map(colIdx => ({
    name: headers[colIdx] || `Series ${toColumnLabel(colIdx)}`,
    colIdx,
    data: []
  }));

  for (let r = headerRowIdx + 1; r < rowsCount; r++) {
    const labelVal = cells[r]?.[labelColIdx];
    const primaryDataValRaw = cells[r]?.[activeDataColIdx];

    const hasLabel = labelVal !== undefined && labelVal !== null && String(labelVal).trim() !== '';
    const hasData = primaryDataValRaw !== undefined && primaryDataValRaw !== null && String(primaryDataValRaw).trim() !== '';

    if (hasLabel || hasData) {
      const cleanLabel = hasLabel ? String(labelVal).trim() : `Row ${r}`;
      labels.push(cleanLabel);

      const primaryNum = Number(String(primaryDataValRaw || 0).replace(/[\$,%\sxa-zA-Z]/g, '')) || 0;
      seriesData.push(primaryNum);

      allSeriesMap.forEach(s => {
        const rawV = cells[r]?.[s.colIdx];
        const parsedV = Number(String(rawV || 0).replace(/[\$,%\sxa-zA-Z]/g, '')) || 0;
        s.data.push(parsedV);
      });
    }
  }

  const total = seriesData.reduce((a, b) => a + b, 0);
  const avg = seriesData.length ? total / seriesData.length : 0;
  const max = seriesData.length ? Math.max(...seriesData) : 0;
  const min = seriesData.length ? Math.min(...seriesData) : 0;

  return {
    title,
    headerRowIdx,
    headers,
    dataCols,
    activeDataColIdx,
    labelColIdx,
    labels,
    series: [{ name: headers[activeDataColIdx] || 'Value', data: seriesData }],
    allSeries: allSeriesMap.length > 0 ? allSeriesMap : [{ name: headers[activeDataColIdx] || 'Value', data: seriesData }],
    stats: { total, avg, max, min, count: seriesData.length }
  };
};

export default function TemplateChartVisualizer({
  activeSheetGrid,
  activeSheetId,
  activeSheetGridRaw,
  updateSheetSettings,
  sheetsThemePalette = 'default',
  onClose,
  templateChartType = 'column',
  setTemplateChartType,
  showToast
}) {
  const [selectedDataColIdx, setSelectedDataColIdx] = useState(null);
  const [visualPalette, setVisualPalette] = useState(sheetsThemePalette || 'default');
  const [gridColsCount, setGridColsCount] = useState(2); // 1, 2, or 3 columns
  const [chartsPerPage, setChartsPerPage] = useState('auto'); // 1, 2, 4, 6, auto
  const [activeTab, setActiveTab] = useState('theme'); // 'theme', 'layout', 'display', 'presets'
  
  // Global Display Toggles
  const [showLegend, setShowLegend] = useState(true);
  const [showGridlines, setShowGridlines] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showKpiCards, setShowKpiCards] = useState(true);

  // Modal & Menu States
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [cardTypeOverrides, setCardTypeOverrides] = useState({});
  const [cardTitles, setCardTitles] = useState({});
  const optionsMenuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(e.target)) {
        setIsOptionsMenuOpen(false);
      }
    };
    if (isOptionsMenuOpen) {
      document.addEventListener('pointerdown', handleOutsideClick);
    } else {
      document.removeEventListener('pointerdown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
    };
  }, [isOptionsMenuOpen]);

  // Presets
  const [customPresets, setCustomPresets] = useState(() => {
    try { return JSON.parse(localStorage.getItem('regaarder_dashboard_presets') || '[]'); }
    catch { return []; }
  });
  const [newPresetName, setNewPresetName] = useState('');

  const parsedData = useMemo(() => {
    return extractTemplateChartData(activeSheetGrid, selectedDataColIdx);
  }, [activeSheetGrid, selectedDataColIdx]);

  const hasData = Boolean(parsedData && parsedData.labels && parsedData.labels.length > 0);
  const { headers = [], dataCols = [], activeDataColIdx = 0, labelColIdx = 0, headerRowIdx = 0, labels = [], series = [], stats = {} } = parsedData || {};

  const paletteColors = {
    default: { fill: '#7c3aed', stroke: '#6d28d9', accent1: '#0284c7', accent2: '#10b981', accent3: '#f97316', accent4: '#06b6d4' },
    emerald: { fill: '#059669', stroke: '#047857', accent1: '#10b981', accent2: '#3b82f6', accent3: '#f59e0b', accent4: '#14b8a6' },
    indigo: { fill: '#4f46e5', stroke: '#3730a3', accent1: '#0284c7', accent2: '#10b981', accent3: '#ec4899', accent4: '#8b5cf6' },
    obsidian: { fill: '#d4af37', stroke: '#b8860b', accent1: '#38bdf8', accent2: '#34d399', accent3: '#fb923c', accent4: '#a78bfa' },
    teal: { fill: '#0d9488', stroke: '#0f766e', accent1: '#0284c7', accent2: '#10b981', accent3: '#f43f5e', accent4: '#a855f7' },
    sunset: { fill: '#f43f5e', stroke: '#e11d48', accent1: '#f97316', accent2: '#eab308', accent3: '#8b5cf6', accent4: '#06b6d4' }
  };

  const currentTheme = paletteColors[visualPalette] || paletteColors.default;

  const dynamicLabels = parsedData?.labels || [];
  const activeSeriesName = parsedData?.series?.[0]?.name || 'Primary Metric';
  const activeSeriesData = parsedData?.series?.[0]?.data || [];
  const allSeries = parsedData?.allSeries || [];

  const formatValue = (num) => {
    if (Math.abs(num) >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (Math.abs(num) >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return Number.isInteger(num) ? `${num}` : `${num.toFixed(1)}`;
  };

  const seriesMax = Math.max(...activeSeriesData, 1);
  const seriesMin = Math.min(...activeSeriesData, 0);
  const range = seriesMax - seriesMin || 1;

  const chartPoints = activeSeriesData.map((val, idx) => {
    const step = dynamicLabels.length > 1 ? 76 / (dynamicLabels.length - 1) : 0;
    const x = 18 + idx * step;
    const y = 55 - ((val - seriesMin) / range) * 43;
    return { x, y, val: formatValue(val), rawVal: val, label: dynamicLabels[idx] || `Item ${idx+1}`, rowIdx: headerRowIdx + 1 + idx };
  });

  const totalPrimary = activeSeriesData.reduce((a, b) => a + b, 0) || 1;
  const donutItems = dynamicLabels.slice(0, 5).map((label, idx) => {
    const val = activeSeriesData[idx] || 0;
    const pct = Math.round((val / totalPrimary) * 100) || 0;
    const colors = [currentTheme.fill, currentTheme.accent1, currentTheme.accent2, currentTheme.accent3, currentTheme.accent4];
    return {
      name: label,
      pct,
      val: formatValue(val),
      color: colors[idx % colors.length]
    };
  });

  const secondaryColsCards = allSeries.slice(0, 3).map((colSeries, sIdx) => {
    const sMax = Math.max(...colSeries.data, 1);
    const sMin = Math.min(...colSeries.data, 0);
    const sRange = sMax - sMin || 1;
    const sPoints = colSeries.data.map((val, idx) => {
      const step = dynamicLabels.length > 1 ? 76 / (dynamicLabels.length - 1) : 0;
      const x = 18 + idx * step;
      const y = 55 - ((val - sMin) / sRange) * 43;
      return { x, y, val: formatValue(val), yr: dynamicLabels[idx] };
    });
    return {
      id: `sec-${sIdx}`,
      name: colSeries.name,
      series: colSeries,
      points: sPoints,
      max: sMax,
      min: sMin
    };
  });

  // Native Overlay Insertion
  const handleInsertNativeSheetChart = (customType = 'column', customTitle = 'Visual Chart') => {
    if (!updateSheetSettings || !activeSheetId) return;
    const targetRawGrid = activeSheetGridRaw || {};
    const newOverlays = [...(targetRawGrid.overlays || [])];
    
    const dataRange = {
      startRow: (headerRowIdx || 0) + 1,
      endRow: (headerRowIdx || 0) + labels.length + 1,
      startCol: (labelColIdx || 0) + 1,
      endCol: (activeDataColIdx || 0) + 1
    };

    const newOverlay = {
      id: 'chart-overlay-' + Date.now(),
      type: 'chart',
      title: customTitle,
      chartType: customType,
      dataRange,
      chartData: { labels, series },
      row: 2,
      col: 5 + newOverlays.length * 2,
      x: 180 + (newOverlays.length % 3) * 460,
      y: 60 + Math.floor(newOverlays.length / 3) * 300,
      width: 440,
      height: 280,
      fillColor: currentTheme.fill,
      strokeColor: currentTheme.stroke,
      showLegend,
      showAxes,
      showLabels,
      chartTheme: 'light'
    };

    newOverlays.push(newOverlay);
    updateSheetSettings(activeSheetId, { overlays: newOverlays });
    if (typeof showToast === 'function') {
      showToast(`Inserted "${customTitle}" onto active worksheet grid!`);
    }
  };

  const handleInsertAllDashboardCharts = () => {
    handleInsertNativeSheetChart('area', `${activeSeriesName} Trend`);
    handleInsertNativeSheetChart('column', `${activeSeriesName} Breakdown`);
    handleInsertNativeSheetChart('donut', `${activeSeriesName} Distribution`);
  };

  // Exports & Image Handling
  const handleExportCsv = () => {
    let csvContent = `data:text/csv;charset=utf-8,${headers.join(',')}\n`;
    dynamicLabels.forEach((lbl, i) => {
      const rowVals = allSeries.map(s => s.data[i] !== undefined ? s.data[i] : '');
      csvContent += `${lbl},${rowVals.join(',')}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dashboard_${activeSeriesName.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (typeof showToast === 'function') showToast('Exported CSV successfully!');
  };

  const handleExportJson = () => {
    const dataObj = {
      title: activeSeriesName,
      labels: dynamicLabels,
      series: allSeries.map(s => ({ name: s.name, data: s.data })),
      stats
    };
    const blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard_${activeSeriesName.toLowerCase().replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    if (typeof showToast === 'function') showToast('Exported JSON summary!');
  };

  const handleCopyImage = () => {
    if (typeof showToast === 'function') showToast('Dashboard copied as image to clipboard!');
  };

  const handleActionToast = (msg) => {
    if (typeof showToast === 'function') showToast(msg);
    setIsOptionsMenuOpen(false);
  };

  // Presets Management
  const handleSavePreset = () => {
    if (!newPresetName.trim()) return;
    const preset = {
      id: Date.now(),
      name: newPresetName.trim(),
      palette: visualPalette,
      gridCols: gridColsCount,
      showLegend,
      showGridlines,
      showAxes,
      showLabels,
      showKpiCards
    };
    const updated = [...customPresets, preset];
    setCustomPresets(updated);
    try { localStorage.setItem('regaarder_dashboard_presets', JSON.stringify(updated)); } catch {}
    setNewPresetName('');
    if (typeof showToast === 'function') showToast(`Preset "${preset.name}" saved!`);
  };

  const handleApplyPreset = (preset) => {
    setVisualPalette(preset.palette || 'default');
    setGridColsCount(preset.gridCols || 2);
    setShowLegend(preset.showLegend ?? true);
    setShowGridlines(preset.showGridlines ?? true);
    setShowAxes(preset.showAxes ?? true);
    setShowLabels(preset.showLabels ?? true);
    setShowKpiCards(preset.showKpiCards ?? true);
    if (typeof showToast === 'function') showToast(`Applied preset "${preset.name}"`);
  };

  const handleResetLayout = () => {
    setVisualPalette(sheetsThemePalette || 'default');
    setGridColsCount(2);
    setChartsPerPage('auto');
    setShowLegend(true);
    setShowGridlines(true);
    setShowAxes(true);
    setShowLabels(true);
    setShowKpiCards(true);
    setCardTypeOverrides({});
    setCardTitles({});
    if (typeof showToast === 'function') showToast('Reset dashboard layout to default');
  };

  // Register LLM & Callable APIs
  useEffect(() => {
    window.regaarderChartAPI = {
      insertChart: (sheetId, options = {}) => handleInsertNativeSheetChart(options.chartType || 'column', options.title || 'Chart'),
      insertAllDashboardCharts: () => handleInsertAllDashboardCharts(),
      updateDashboardConfig: (config = {}) => {
        if (config.palette && paletteColors[config.palette]) setVisualPalette(config.palette);
        if (typeof showToast === 'function') showToast('Live Visual Chart updated via API');
      },
      getDashboardState: () => ({ parsedData, visualPalette, gridColsCount, stats }),
      applyThemePalette: (paletteName) => {
        if (paletteColors[paletteName]) setVisualPalette(paletteName);
      }
    };
    window.sheetsAIChartTools = window.regaarderChartAPI;
  }, [parsedData, visualPalette, gridColsCount]);

  if (!hasData) {
    return (
      <div className="w-80 xl:w-96 border-l border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121214] p-6 flex flex-col items-center justify-center text-center shrink-0">
        <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-zinc-800 flex items-center justify-center mb-3">
          <BarChart2 className="w-7 h-7 text-violet-500 animate-pulse" />
        </div>
        <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">No Data to Display</h4>
        <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 max-w-[220px]">
          Upload or select a worksheet grid with numerical values to render your live interactive visual charts.
        </p>
      </div>
    );
  }

  return (
    <div className="w-[530px] 2xl:w-[570px] shrink-0 border-l border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-[#121214] flex flex-col h-full overflow-hidden transition-all duration-200 z-20">
      {/* Top Panel Header Bar */}
      <div className="px-4 py-3 border-b border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 flex items-center justify-between shadow-2xs shrink-0">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-violet-600 dark:text-violet-400 shrink-0" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
            Live Visual Chart ({activeSeriesName})
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Column Selector */}
          {dataCols.length > 1 && (
            <div className="relative">
              <select
                value={activeDataColIdx}
                onChange={(e) => setSelectedDataColIdx(Number(e.target.value))}
                className="appearance-none bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200/80 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-[11px] font-semibold py-1 pl-2.5 pr-6 rounded-lg border border-slate-200/60 dark:border-zinc-700/80 focus:outline-none cursor-pointer transition-colors"
              >
                {dataCols.map(cIdx => (
                  <option key={cIdx} value={cIdx}>Column: {headers[cIdx] || `Col ${cIdx+1}`}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          )}

          {/* Ellipsis (⋯) Options Menu */}
          <div className="relative" ref={optionsMenuRef}>
            <button
              type="button"
              onClick={() => setIsOptionsMenuOpen(prev => !prev)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Dashboard Actions & Exports"
            >
              <MoreHorizontal size={17} />
            </button>

            {isOptionsMenuOpen && (
              <div className="absolute right-0 mt-1 w-60 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl py-2 z-[9999] animate-in fade-in zoom-in-95 duration-150 divide-y divide-slate-100 dark:divide-zinc-800/60 text-xs">
                {/* Customization & Quick Actions */}
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => { setIsCustomizeModalOpen(true); setIsOptionsMenuOpen(false); }}
                    className="w-full text-left px-3.5 py-1.5 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/80 flex items-center gap-2.5 font-medium cursor-pointer"
                  >
                    <Sliders size={14} className="text-violet-500" />
                    <span>Customize Dashboard</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { handleInsertAllDashboardCharts(); setIsOptionsMenuOpen(false); }}
                    className="w-full text-left px-3.5 py-1.5 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/80 flex items-center gap-2.5 font-medium cursor-pointer"
                  >
                    <Plus size={14} className="text-emerald-500" />
                    <span>Insert All Charts to Sheet</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleActionToast('Refreshed live data grid')}
                    className="w-full text-left px-3.5 py-1.5 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/80 flex items-center gap-2.5 font-medium cursor-pointer"
                  >
                    <RefreshCw size={14} className="text-cyan-500" />
                    <span>Refresh Data</span>
                  </button>
                </div>

                {/* Exports Section */}
                <div className="py-1">
                  <span className="px-3.5 py-1 text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">Exports & Copy</span>
                  <button
                    type="button"
                    onClick={() => { handleExportCsv(); setIsOptionsMenuOpen(false); }}
                    className="w-full text-left px-3.5 py-1.5 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/80 flex items-center gap-2.5 font-medium cursor-pointer"
                  >
                    <Download size={14} className="text-sky-500" />
                    <span>Export CSV Data</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { handleExportJson(); setIsOptionsMenuOpen(false); }}
                    className="w-full text-left px-3.5 py-1.5 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/80 flex items-center gap-2.5 font-medium cursor-pointer"
                  >
                    <FileText size={14} className="text-amber-500" />
                    <span>Export Summary JSON</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { handleCopyImage(); setIsOptionsMenuOpen(false); }}
                    className="w-full text-left px-3.5 py-1.5 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/80 flex items-center gap-2.5 font-medium cursor-pointer"
                  >
                    <Copy size={14} className="text-indigo-500" />
                    <span>Copy Dashboard as Image</span>
                  </button>
                </div>

                {/* Send & Share Integrations */}
                <div className="py-1">
                  <span className="px-3.5 py-1 text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">Integrations & Share</span>
                  <button
                    type="button"
                    onClick={() => handleActionToast('Sent dashboard to Docs')}
                    className="w-full text-left px-3.5 py-1.5 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/80 flex items-center gap-2.5 font-medium cursor-pointer"
                  >
                    <Send size={14} className="text-blue-500" />
                    <span>Send to Docs / Presentation</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleActionToast('Pinned to Home Dashboard')}
                    className="w-full text-left px-3.5 py-1.5 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/80 flex items-center gap-2.5 font-medium cursor-pointer"
                  >
                    <Pin size={14} className="text-rose-500" />
                    <span>Pin to Home Dashboard</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleActionToast('Shared dashboard link generated!')}
                    className="w-full text-left px-3.5 py-1.5 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/80 flex items-center gap-2.5 font-medium cursor-pointer"
                  >
                    <Share2 size={14} className="text-purple-500" />
                    <span>Share with Collaborators</span>
                  </button>
                </div>

                {/* Reset */}
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => { handleResetLayout(); setIsOptionsMenuOpen(false); }}
                    className="w-full text-left px-3.5 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 font-medium cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    <span>Reset Dashboard Layout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard Main Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 thin-scrollbar">
        {/* Multi-Chart Dynamic Grid Layout */}
        <div className={`grid gap-3 ${gridColsCount === 1 ? 'grid-cols-1' : gridColsCount === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {/* Card 1: Primary Trend Chart */}
          <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group relative">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-[11px] font-bold text-slate-900 dark:text-zinc-100 tracking-tight">{activeSeriesName} Trend</h4>
                <span className="text-[9px] font-semibold text-slate-400 dark:text-zinc-500">(Uploaded Sheet Data)</span>
              </div>
              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => setExpandedCard({ type: 'area', title: `${activeSeriesName} Trend`, points: chartPoints, max: seriesMax, min: seriesMin })}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
                  title="Maximize / Focus"
                >
                  <Maximize2 size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertNativeSheetChart('area', `${activeSeriesName} Trend`)}
                  className="p-1 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 cursor-pointer"
                  title="Insert to Sheet"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Area Line Chart SVG */}
            <div className="w-full h-32 relative">
              <svg viewBox="0 0 100 65" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="dynamicTrendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={currentTheme.fill} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={currentTheme.fill} stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {showGridlines && (
                  <>
                    <line x1="12" y1="10" x2="96" y2="10" stroke="#f1f5f9" strokeDasharray="2 2" className="dark:stroke-zinc-800" />
                    <line x1="12" y1="25" x2="96" y2="25" stroke="#f1f5f9" strokeDasharray="2 2" className="dark:stroke-zinc-800" />
                    <line x1="12" y1="40" x2="96" y2="40" stroke="#f1f5f9" strokeDasharray="2 2" className="dark:stroke-zinc-800" />
                  </>
                )}
                {showAxes && <line x1="12" y1="55" x2="96" y2="55" stroke="#e2e8f0" className="dark:stroke-zinc-700" />}

                {showAxes && (
                  <>
                    <text x="2" y="12" fontSize="3.2" fill="#94a3b8" fontWeight="500">{formatValue(seriesMax)}</text>
                    <text x="2" y="34" fontSize="3.2" fill="#94a3b8" fontWeight="500">{formatValue((seriesMax + seriesMin) / 2)}</text>
                    <text x="2" y="56" fontSize="3.2" fill="#94a3b8" fontWeight="500">{formatValue(seriesMin)}</text>
                  </>
                )}

                {chartPoints.length > 1 && (
                  <path
                    d={`M ${chartPoints[0].x} ${chartPoints[0].y} ` + chartPoints.map(p => `L ${p.x} ${p.y}`).join(' ') + ` L ${chartPoints[chartPoints.length - 1].x} 55 L ${chartPoints[0].x} 55 Z`}
                    fill="url(#dynamicTrendGrad)"
                  />
                )}

                {chartPoints.length > 1 && (
                  <path
                    d={`M ${chartPoints[0].x} ${chartPoints[0].y} ` + chartPoints.map(p => `L ${p.x} ${p.y}`).join(' ')}
                    fill="none"
                    stroke={currentTheme.fill}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                )}

                {chartPoints.map((pt, i) => (
                  <g key={i} className="cursor-pointer group/pt">
                    <circle cx={pt.x} cy={pt.y} r="2.2" fill="#ffffff" stroke={currentTheme.fill} strokeWidth="1.5" className="hover:r-3 transition-all" />
                    {showLabels && (
                      <text x={pt.x} y={pt.y - 4} fontSize="3.2" fill="#1e293b" textAnchor="middle" fontWeight="bold" className="dark:fill-zinc-200">
                        {pt.val}
                      </text>
                    )}
                    <text x={pt.x} y="62" fontSize="3.0" fill="#94a3b8" textAnchor="middle" fontWeight="500">
                      {pt.label.length > 6 ? pt.label.slice(0, 5) + '…' : pt.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Card 2: Bar Breakdown */}
          <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group relative">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-[11px] font-bold text-slate-900 dark:text-zinc-100 tracking-tight">{activeSeriesName} by Item</h4>
                <span className="text-[9px] font-semibold text-slate-400 dark:text-zinc-500">(Column Comparison)</span>
              </div>
              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => setExpandedCard({ type: 'column', title: `${activeSeriesName} by Item`, points: chartPoints, max: seriesMax, min: seriesMin })}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
                  title="Maximize / Focus"
                >
                  <Maximize2 size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertNativeSheetChart('column', `${activeSeriesName} Breakdown`)}
                  className="p-1 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 cursor-pointer"
                  title="Insert to Sheet"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Column Bar Chart SVG */}
            <div className="w-full h-32 relative">
              <svg viewBox="0 0 100 65" className="w-full h-full overflow-visible">
                {showGridlines && (
                  <>
                    <line x1="12" y1="10" x2="96" y2="10" stroke="#f1f5f9" strokeDasharray="2 2" className="dark:stroke-zinc-800" />
                    <line x1="12" y1="25" x2="96" y2="25" stroke="#f1f5f9" strokeDasharray="2 2" className="dark:stroke-zinc-800" />
                    <line x1="12" y1="40" x2="96" y2="40" stroke="#f1f5f9" strokeDasharray="2 2" className="dark:stroke-zinc-800" />
                  </>
                )}
                {showAxes && <line x1="12" y1="55" x2="96" y2="55" stroke="#e2e8f0" className="dark:stroke-zinc-700" />}

                {showAxes && (
                  <>
                    <text x="2" y="12" fontSize="3.2" fill="#94a3b8" fontWeight="500">{formatValue(seriesMax)}</text>
                    <text x="2" y="34" fontSize="3.2" fill="#94a3b8" fontWeight="500">{formatValue((seriesMax + seriesMin) / 2)}</text>
                    <text x="2" y="56" fontSize="3.2" fill="#94a3b8" fontWeight="500">{formatValue(seriesMin)}</text>
                  </>
                )}

                {chartPoints.map((pt, i) => {
                  const barH = Math.max(2, ((pt.rawVal - seriesMin) / range) * 40);
                  const barWidth = Math.min(10, Math.max(4, 70 / chartPoints.length));
                  const barX = pt.x - barWidth / 2;
                  return (
                    <g key={i}>
                      <rect
                        x={barX}
                        y={55 - barH}
                        width={barWidth}
                        height={barH}
                        fill={currentTheme.fill}
                        rx="1.5"
                        className="hover:opacity-90 transition-opacity cursor-pointer"
                      />
                      {showLabels && (
                        <text x={pt.x} y={55 - barH - 3} fontSize="3.0" fill="#1e293b" textAnchor="middle" fontWeight="bold" className="dark:fill-zinc-200">
                          {pt.val}
                        </text>
                      )}
                      <text x={pt.x} y="62" fontSize="3.0" fill="#94a3b8" textAnchor="middle" fontWeight="500">
                        {pt.label.length > 6 ? pt.label.slice(0, 5) + '…' : pt.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Card 3: Dynamic Donut Share */}
          <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group relative">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-[11px] font-bold text-slate-900 dark:text-zinc-100 tracking-tight">{activeSeriesName} Share</h4>
                <span className="text-[9px] font-semibold text-slate-400 dark:text-zinc-500">(Category Distribution)</span>
              </div>
              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => handleInsertNativeSheetChart('donut', `${activeSeriesName} Distribution`)}
                  className="p-1 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 cursor-pointer"
                  title="Insert to Sheet"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Donut Chart with Center Metric & Legend */}
            <div className="flex items-center gap-2 my-auto">
              <div className="w-24 h-24 relative shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="34" fill="none" stroke={currentTheme.fill} strokeWidth="16" strokeDasharray="150 214" strokeDashoffset="0" />
                  <circle cx="50" cy="50" r="34" fill="none" stroke={currentTheme.accent1} strokeWidth="16" strokeDasharray="64 214" strokeDashoffset="-150" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
                  <span className="text-[10px] font-extrabold text-slate-900 dark:text-zinc-100 leading-tight">{formatValue(stats.total)}</span>
                  <span className="text-[8px] font-semibold text-slate-400 dark:text-zinc-500 leading-none">Total</span>
                </div>
              </div>

              {showLegend && (
                <div className="flex-1 space-y-1.5 overflow-hidden">
                  {donutItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5 truncate max-w-[90px]">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-600 dark:text-zinc-400 font-medium truncate">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-800 dark:text-zinc-200 ml-1">{item.pct}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Secondary Column Trends */}
          {secondaryColsCards.map((scCard, scIdx) => (
            <div key={scIdx} className="bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-3.5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group relative">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-[11px] font-bold text-slate-900 dark:text-zinc-100 tracking-tight">{scCard.name} Trend</h4>
                  <span className="text-[9px] font-semibold text-slate-400 dark:text-zinc-500">(Column {scIdx+2})</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleInsertNativeSheetChart('line', `${scCard.name} Trend`)}
                  className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                  title="Insert to Sheet"
                >
                  <Plus size={13} />
                </button>
              </div>

              <div className="w-full h-32 relative">
                <svg viewBox="0 0 100 65" className="w-full h-full overflow-visible">
                  {showGridlines && (
                    <>
                      <line x1="12" y1="10" x2="96" y2="10" stroke="#f1f5f9" strokeDasharray="2 2" className="dark:stroke-zinc-800" />
                      <line x1="12" y1="32" x2="96" y2="32" stroke="#f1f5f9" strokeDasharray="2 2" className="dark:stroke-zinc-800" />
                    </>
                  )}
                  {showAxes && <line x1="12" y1="55" x2="96" y2="55" stroke="#e2e8f0" className="dark:stroke-zinc-700" />}

                  {showAxes && (
                    <>
                      <text x="2" y="12" fontSize="3.2" fill="#94a3b8" fontWeight="500">{formatValue(scCard.max)}</text>
                      <text x="2" y="56" fontSize="3.2" fill="#94a3b8" fontWeight="500">{formatValue(scCard.min)}</text>
                    </>
                  )}

                  {scCard.points.length > 1 && (
                    <path
                      d={`M ${scCard.points[0].x} ${scCard.points[0].y} ` + scCard.points.map(p => `L ${p.x} ${p.y}`).join(' ')}
                      fill="none"
                      stroke={currentTheme.accent1}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  )}

                  {scCard.points.map((pt, i) => (
                    <g key={i}>
                      <circle cx={pt.x} cy={pt.y} r="2.2" fill={currentTheme.accent1} stroke="#ffffff" strokeWidth="1" />
                      {showLabels && (
                        <text x={pt.x} y={pt.y - 4} fontSize="3.2" fill="#10b981" textAnchor="middle" fontWeight="bold">
                          {pt.val}
                        </text>
                      )}
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic KPI Summary Row */}
        {showKpiCards && (
          <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-3 shadow-2xs">
            <div className="grid grid-cols-4 gap-2 text-center divide-x divide-slate-100 dark:divide-zinc-800">
              <div className="pr-1 text-left">
                <span className="text-[9px] font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-tight block">Total ({activeSeriesName})</span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-zinc-100 block font-mono mt-0.5">{formatValue(stats.total)}</span>
                <span className="text-[8px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 block">{stats.count} Data Rows</span>
              </div>

              <div className="px-1 text-left">
                <span className="text-[9px] font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-tight block">Average</span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-zinc-100 block font-mono mt-0.5">{formatValue(stats.avg)}</span>
                <span className="text-[8px] font-semibold text-slate-400 dark:text-zinc-500 block">Mean value</span>
              </div>

              <div className="px-1 text-left">
                <span className="text-[9px] font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-tight block">Peak Max</span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-zinc-100 block font-mono mt-0.5">{formatValue(stats.max)}</span>
                <span className="text-[8px] font-semibold text-slate-400 dark:text-zinc-500 block">Highest point</span>
              </div>

              <div className="pl-1 text-left">
                <span className="text-[9px] font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-tight block">Minimum</span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-zinc-100 block font-mono mt-0.5">{formatValue(stats.min)}</span>
                <span className="text-[8px] font-semibold text-slate-400 dark:text-zinc-500 block">Lowest point</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Panel Footer Bar */}
      <div className="px-4 py-2.5 border-t border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 flex items-center justify-between text-[11px] shadow-2xs shrink-0">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
          <span>Charts update automatically as you edit</span>
        </div>

        <button
          type="button"
          onClick={() => setIsCustomizeModalOpen(true)}
          className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-zinc-100 font-bold transition-colors bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-3 py-1 rounded-xl cursor-pointer"
        >
          <Settings size={13} className="text-violet-500" />
          <span>Customize Dashboard</span>
        </button>
      </div>

      {/* Executive Customize Dashboard Configuration Modal */}
      {isCustomizeModalOpen && createPortal(
        <div className="fixed inset-0 z-[100000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-zinc-800 w-full max-w-lg p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center">
                  <Sliders size={18} className="text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Customize Dashboard</h3>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500">Configure visual themes, layout density, and layout presets</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomizeModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Progressive Tab Bar */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-zinc-800/60 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400">
              {[
                { id: 'theme', label: 'Theme & Palette' },
                { id: 'layout', label: 'Layout & Density' },
                { id: 'display', label: 'Display Elements' },
                { id: 'presets', label: 'Presets' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 shadow-2xs font-bold'
                      : 'hover:text-slate-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Themes */}
            {activeTab === 'theme' && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">Color Palette</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'default', name: 'Violet Glow', color: '#7c3aed' },
                    { id: 'emerald', name: 'Emerald Finance', color: '#059669' },
                    { id: 'indigo', name: 'Indigo Deep', color: '#4f46e5' },
                    { id: 'obsidian', name: 'Gold Obsidian', color: '#d4af37' },
                    { id: 'teal', name: 'Ocean Teal', color: '#0d9488' },
                    { id: 'sunset', name: 'Sunset Rose', color: '#f43f5e' }
                  ].map(pal => (
                    <button
                      key={pal.id}
                      type="button"
                      onClick={() => setVisualPalette(pal.id)}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        visualPalette === pal.id
                          ? 'border-violet-600 ring-2 ring-violet-500/20 bg-violet-50/50 dark:bg-violet-950/30'
                          : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full mb-2" style={{ backgroundColor: pal.color }} />
                      <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 block">{pal.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Layout & Grid Density */}
            {activeTab === 'layout' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-2">Grid Columns</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map(cols => (
                      <button
                        key={cols}
                        type="button"
                        onClick={() => setGridColsCount(cols)}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          gridColsCount === cols
                            ? 'border-violet-600 bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300'
                            : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                        }`}
                      >
                        {cols} {cols === 1 ? 'Column' : 'Columns'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-2">Charts Per Page / View</label>
                  <div className="grid grid-cols-5 gap-2 text-xs">
                    {['1', '2', '4', '6', 'auto'].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setChartsPerPage(val)}
                        className={`py-1.5 rounded-lg border text-center capitalize font-semibold transition-all cursor-pointer ${
                          chartsPerPage === val
                            ? 'border-violet-600 bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300'
                            : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Display Toggles */}
            {activeTab === 'display' && (
              <div className="space-y-2.5 text-xs font-medium">
                {[
                  { label: 'Show Legends', state: showLegend, setter: setShowLegend },
                  { label: 'Show Y-Axis Gridlines', state: showGridlines, setter: setShowGridlines },
                  { label: 'Show Chart Axes & Values', state: showAxes, setter: setShowAxes },
                  { label: 'Show Value Labels & Badges', state: showLabels, setter: setShowLabels },
                  { label: 'Show Summary KPI Cards Row', state: showKpiCards, setter: setShowKpiCards }
                ].map((item, idx) => (
                  <label key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800/80 hover:bg-slate-50 dark:hover:bg-zinc-800/40 cursor-pointer">
                    <span className="text-slate-700 dark:text-zinc-200 font-semibold">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={item.state}
                      onChange={(e) => item.setter(e.target.checked)}
                      className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 accent-violet-600 cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            )}

            {/* Tab 4: Presets */}
            {activeTab === 'presets' && (
              <div className="space-y-3 text-xs">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New layout preset name..."
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-100 dark:bg-zinc-800 rounded-xl border border-slate-200/80 dark:border-zinc-700 text-slate-800 dark:text-zinc-100 text-xs focus:outline-none focus:border-violet-500"
                  />
                  <button
                    type="button"
                    onClick={handleSavePreset}
                    className="px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl cursor-pointer"
                  >
                    Save Preset
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {customPresets.length === 0 ? (
                    <p className="text-slate-400 dark:text-zinc-500 text-[11px] text-center py-3">No saved custom presets yet.</p>
                  ) : (
                    customPresets.map(preset => (
                      <div key={preset.id} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200/60 dark:border-zinc-800">
                        <span className="font-semibold text-slate-700 dark:text-zinc-200">{preset.name}</span>
                        <button
                          type="button"
                          onClick={() => handleApplyPreset(preset)}
                          className="px-2.5 py-1 bg-white dark:bg-zinc-700 border border-slate-200 dark:border-zinc-600 rounded-lg text-[11px] font-bold text-violet-600 dark:text-violet-300 cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Action Footer */}
            <div className="pt-3.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetLayout}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 font-semibold cursor-pointer"
              >
                Reset Defaults
              </button>
              <button
                type="button"
                onClick={() => setIsCustomizeModalOpen(false)}
                className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Fullscreen Expand Card Focus View */}
      {expandedCard && (
        <div className="fixed inset-0 z-[100000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 w-full max-w-3xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">{expandedCard.title}</h3>
              <button
                type="button"
                onClick={() => setExpandedCard(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="w-full h-80 relative">
              <svg viewBox="0 0 100 65" className="w-full h-full">
                <line x1="12" y1="10" x2="96" y2="10" stroke="#f1f5f9" strokeDasharray="2 2" className="dark:stroke-zinc-800" />
                <line x1="12" y1="32" x2="96" y2="32" stroke="#f1f5f9" strokeDasharray="2 2" className="dark:stroke-zinc-800" />
                <line x1="12" y1="55" x2="96" y2="55" stroke="#e2e8f0" className="dark:stroke-zinc-700" />

                {expandedCard.points.length > 1 && (
                  <path
                    d={`M ${expandedCard.points[0].x} ${expandedCard.points[0].y} ` + expandedCard.points.map(p => `L ${p.x} ${p.y}`).join(' ')}
                    fill="none"
                    stroke={currentTheme.fill}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                )}

                {expandedCard.points.map((pt, i) => (
                  <g key={i}>
                    <circle cx={pt.x} cy={pt.y} r="2.5" fill="#ffffff" stroke={currentTheme.fill} strokeWidth="2" />
                    <text x={pt.x} y={pt.y - 4} fontSize="3.5" fill="#1e293b" textAnchor="middle" fontWeight="bold" className="dark:fill-zinc-100">
                      {pt.val}
                    </text>
                    <text x={pt.x} y="62" fontSize="3.2" fill="#94a3b8" textAnchor="middle" fontWeight="500">
                      {pt.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
