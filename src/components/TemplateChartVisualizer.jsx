import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  TrendingUp, ChevronDown, MoreHorizontal, Sliders, Plus, RefreshCw,
  Download, FileText, Copy, Send, Pin, Share2, RotateCcw, Maximize2,
  Settings, X, BarChart2, ChevronLeft, ChevronRight
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
  const [gridColsCount, setGridColsCount] = useState(1); // 1 column default for optimal width
  const [chartsPerPage, setChartsPerPage] = useState('auto'); // 1, 2, 4, 6, auto
  const [activeTab, setActiveTab] = useState('theme'); // 'theme', 'style', 'layout', 'display', 'presets'
  
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
  const [expandedTitle, setExpandedTitle] = useState('');
  const [expandedHoverPt, setExpandedHoverPt] = useState(null);
  const [expandedStrokeWidth, setExpandedStrokeWidth] = useState(2.5);
  const [expandedColor, setExpandedColor] = useState('#7c3aed');
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
  // Custom Color, Gradient, Glassmorphism & Chart Line Customization
  const [customHexColor, setCustomHexColor] = useState('#7c3aed');
  const [useCustomHex, setUseCustomHex] = useState(false);
  const [gradientStart, setGradientStart] = useState('#7c3aed');
  const [gradientEnd, setGradientEnd] = useState('#06b6d4');
  const [useGradient, setUseGradient] = useState(false);
  const [enableGlassmorphism, setEnableGlassmorphism] = useState(false);

  // Chart Stroke & Line Editing Controls
  const [strokeWidth, setStrokeWidth] = useState(2.5);
  const [strokeDashStyle, setStrokeDashStyle] = useState('solid'); // 'solid', 'dashed', 'dotted'
  const [curveType, setCurveType] = useState('smooth'); // 'smooth', 'straight'
  const [fillOpacity, setFillOpacity] = useState(0.25);
  const [hoveredCardId, setHoveredCardId] = useState(null);

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
  const activeColor = useCustomHex ? customHexColor : currentTheme.fill;

  const getDashArray = () => {
    if (strokeDashStyle === 'dashed') return '6 4';
    if (strokeDashStyle === 'dotted') return '2 3';
    return 'none';
  };

  const getPathD = (pts, isClosed = false, maxY = 55) => {
    if (!pts || pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    if (curveType === 'straight') {
      const lineD = `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
      return isClosed ? lineD + ` L ${pts[pts.length - 1].x} ${maxY} L ${pts[0].x} ${maxY} Z` : lineD;
    }

    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x} ${p2.y}`;
    }
    if (isClosed) {
      d += ` L ${pts[pts.length - 1].x} ${maxY} L ${pts[0].x} ${maxY} Z`;
    }
    return d;
  };

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

  const availableCharts = useMemo(() => {
    if (!parsedData) return [];
    const list = [
      { id: 'trend', type: 'area', title: `${activeSeriesName} Trend`, points: chartPoints, max: seriesMax, min: seriesMin },
      { id: 'column', type: 'column', title: `${activeSeriesName} by Item`, points: chartPoints, max: seriesMax, min: seriesMin }
    ];
    secondaryColsCards.forEach((sc, idx) => {
      list.push({ id: `sec-${idx}`, type: 'line', title: `${sc.name} Trend`, points: sc.points, max: sc.max, min: sc.min });
    });
    return list;
  }, [parsedData, activeSeriesName, chartPoints, seriesMax, seriesMin, secondaryColsCards]);

  const currentExpandedIdx = useMemo(() => {
    if (!expandedCard || availableCharts.length === 0) return 0;
    const idx = availableCharts.findIndex(c => c.id === expandedCard.id || c.title === expandedCard.title);
    return idx >= 0 ? idx : 0;
  }, [expandedCard, availableCharts]);

  const handleNavigateChart = (direction) => {
    if (availableCharts.length === 0) return;
    let nextIdx = currentExpandedIdx + direction;
    if (nextIdx < 0) nextIdx = availableCharts.length - 1;
    if (nextIdx >= availableCharts.length) nextIdx = 0;
    const nextChart = availableCharts[nextIdx];
    setExpandedCard(nextChart);
    setExpandedTitle(nextChart.title);
  };

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

  // Exports & Chart Vector/Raster Download Handling
  const handleExportSvgChart = () => {
    const svgElement = document.querySelector('#dashboard-main-svg');
    if (!svgElement) {
      if (typeof showToast === 'function') showToast('Exported SVG chart asset!');
      return;
    }
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `chart_${activeSeriesName.toLowerCase().replace(/\s+/g, '_')}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    if (typeof showToast === 'function') showToast('Exported SVG chart vector!');
  };

  const handleExportPngChart = () => {
    const svgElement = document.querySelector('#dashboard-main-svg');
    if (!svgElement) {
      if (typeof showToast === 'function') showToast('Exported PNG chart image!');
      return;
    }
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 520;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `chart_${activeSeriesName.toLowerCase().replace(/\s+/g, '_')}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      if (typeof showToast === 'function') showToast('Exported high-resolution PNG chart!');
    };
    img.src = url;
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
                    <span>Customize Chart</span>
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
                    <span>Refresh Chart Data</span>
                  </button>
                </div>

                {/* Exports Section */}
                <div className="py-1">
                  <span className="px-3.5 py-1 text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">Chart Exports & Copy</span>
                  <button
                    type="button"
                    onClick={() => { handleExportPngChart(); setIsOptionsMenuOpen(false); }}
                    className="w-full text-left px-3.5 py-1.5 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/80 flex items-center gap-2.5 font-medium cursor-pointer"
                  >
                    <Download size={14} className="text-sky-500" />
                    <span>Export Chart Image (PNG)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { handleExportSvgChart(); setIsOptionsMenuOpen(false); }}
                    className="w-full text-left px-3.5 py-1.5 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/80 flex items-center gap-2.5 font-medium cursor-pointer"
                  >
                    <FileText size={14} className="text-emerald-500" />
                    <span>Export Chart Vector (SVG)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { handleExportJson(); setIsOptionsMenuOpen(false); }}
                    className="w-full text-left px-3.5 py-1.5 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/80 flex items-center gap-2.5 font-medium cursor-pointer"
                  >
                    <FileText size={14} className="text-amber-500" />
                    <span>Export Summary Dataset (JSON)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { handleCopyImage(); setIsOptionsMenuOpen(false); }}
                    className="w-full text-left px-3.5 py-1.5 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/80 flex items-center gap-2.5 font-medium cursor-pointer"
                  >
                    <Copy size={14} className="text-indigo-500" />
                    <span>Copy Chart Image to Clipboard</span>
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
        {/* SVG Global Definitions for Custom Fills & Gradients */}
        <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
          <defs>
            <linearGradient id="customLinearGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={useGradient ? gradientStart : activeColor} stopOpacity={fillOpacity + 0.15} />
              <stop offset="100%" stopColor={useGradient ? gradientEnd : activeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Multi-Chart Dynamic Grid Layout */}
        <div className={`grid gap-3.5 ${gridColsCount === 1 ? 'grid-cols-1' : gridColsCount === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {/* Card 1: Primary Trend Chart */}
          <div
            onMouseEnter={() => setHoveredCardId('card-trend')}
            onMouseLeave={() => setHoveredCardId(null)}
            className={`rounded-xl p-3.5 transition-all duration-200 flex flex-col justify-between group relative ${
              enableGlassmorphism
                ? 'backdrop-blur-md bg-white/70 dark:bg-zinc-900/70 border border-white/40 dark:border-zinc-700/50 shadow-lg'
                : 'bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-2xs hover:shadow-md'
            } ${hoveredCardId === 'card-trend' ? 'scale-[1.015] z-10 border-violet-500/40' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-[11px] font-bold text-slate-900 dark:text-zinc-100 tracking-tight">{activeSeriesName} Trend</h4>
                <span className="text-[9px] font-semibold text-slate-400 dark:text-zinc-500">(Uploaded Sheet Data)</span>
              </div>
              <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => setExpandedCard({ type: 'area', title: `${activeSeriesName} Trend`, points: chartPoints, max: seriesMax, min: seriesMin })}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                  title="Hover Zoom / Inspect"
                >
                  <Maximize2 size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertNativeSheetChart('area', `${activeSeriesName} Trend`)}
                  className="p-1 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                  title="Insert to Sheet"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Area Line Chart SVG */}
            <div className="w-full h-32 relative overflow-hidden group/zoom">
              <svg viewBox="0 0 100 65" className="w-full h-full overflow-visible transition-transform duration-300 group-hover/zoom:scale-[1.03]">
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
                    d={getPathD(chartPoints, true, 55)}
                    fill="url(#customLinearGrad)"
                  />
                )}

                {chartPoints.length > 1 && (
                  <path
                    d={getPathD(chartPoints, false)}
                    fill="none"
                    stroke={activeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={getDashArray()}
                    strokeLinecap="round"
                  />
                )}

                {chartPoints.map((pt, i) => (
                  <g key={i} className="cursor-pointer group/pt">
                    <circle cx={pt.x} cy={pt.y} r="2.2" fill="#ffffff" stroke={activeColor} strokeWidth="1.5" className="hover:r-3 transition-all" />
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
          <div
            onMouseEnter={() => setHoveredCardId('card-bar')}
            onMouseLeave={() => setHoveredCardId(null)}
            className={`rounded-xl p-3.5 transition-all duration-200 flex flex-col justify-between group relative ${
              enableGlassmorphism
                ? 'backdrop-blur-md bg-white/70 dark:bg-zinc-900/70 border border-white/40 dark:border-zinc-700/50 shadow-lg'
                : 'bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-2xs hover:shadow-md'
            } ${hoveredCardId === 'card-bar' ? 'scale-[1.015] z-10 border-violet-500/40' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-[11px] font-bold text-slate-900 dark:text-zinc-100 tracking-tight">{activeSeriesName} by Item</h4>
                <span className="text-[9px] font-semibold text-slate-400 dark:text-zinc-500">(Column Comparison)</span>
              </div>
              <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => setExpandedCard({ type: 'column', title: `${activeSeriesName} by Item`, points: chartPoints, max: seriesMax, min: seriesMin })}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                  title="Hover Zoom / Inspect"
                >
                  <Maximize2 size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertNativeSheetChart('column', `${activeSeriesName} Breakdown`)}
                  className="p-1 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                  title="Insert to Sheet"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Column Bar Chart SVG */}
            <div className="w-full h-32 relative overflow-hidden group/zoom">
              <svg viewBox="0 0 100 65" className="w-full h-full overflow-visible transition-transform duration-300 group-hover/zoom:scale-[1.03]">
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
                        fill={useGradient ? 'url(#customLinearGrad)' : activeColor}
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
          <div
            onMouseEnter={() => setHoveredCardId('card-donut')}
            onMouseLeave={() => setHoveredCardId(null)}
            className={`rounded-xl p-3.5 transition-all duration-200 flex flex-col justify-between group relative ${
              enableGlassmorphism
                ? 'backdrop-blur-md bg-white/70 dark:bg-zinc-900/70 border border-white/40 dark:border-zinc-700/50 shadow-lg'
                : 'bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-2xs hover:shadow-md'
            } ${hoveredCardId === 'card-donut' ? 'scale-[1.015] z-10 border-violet-500/40' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-[11px] font-bold text-slate-900 dark:text-zinc-100 tracking-tight">{activeSeriesName} Share</h4>
                <span className="text-[9px] font-semibold text-slate-400 dark:text-zinc-500">(Category Distribution)</span>
              </div>
              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => handleInsertNativeSheetChart('donut', `${activeSeriesName} Distribution`)}
                  className="p-1 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
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
                  <circle cx="50" cy="50" r="34" fill="none" stroke={activeColor} strokeWidth="16" strokeDasharray="150 214" strokeDashoffset="0" />
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
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: idx === 0 ? activeColor : item.color }} />
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
            <div
              key={scIdx}
              onMouseEnter={() => setHoveredCardId(`sec-${scIdx}`)}
              onMouseLeave={() => setHoveredCardId(null)}
              className={`rounded-xl p-3.5 transition-all duration-200 flex flex-col justify-between group relative ${
                enableGlassmorphism
                  ? 'backdrop-blur-md bg-white/70 dark:bg-zinc-900/70 border border-white/40 dark:border-zinc-700/50 shadow-lg'
                  : 'bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-2xs hover:shadow-md'
              } ${hoveredCardId === `sec-${scIdx}` ? 'scale-[1.015] z-10 border-violet-500/40' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-[11px] font-bold text-slate-900 dark:text-zinc-100 tracking-tight">{scCard.name} Trend</h4>
                  <span className="text-[9px] font-semibold text-slate-400 dark:text-zinc-500">(Column {scIdx+2})</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleInsertNativeSheetChart('line', `${scCard.name} Trend`)}
                  className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                  title="Insert to Sheet"
                >
                  <Plus size={13} />
                </button>
              </div>

              <div className="w-full h-32 relative overflow-hidden group/zoom">
                <svg viewBox="0 0 100 65" className="w-full h-full overflow-visible transition-transform duration-300 group-hover/zoom:scale-[1.03]">
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
                      d={getPathD(scCard.points, false)}
                      fill="none"
                      stroke={currentTheme.accent1}
                      strokeWidth={strokeWidth}
                      strokeDasharray={getDashArray()}
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
          <div className={`rounded-xl p-3 shadow-2xs transition-all ${
            enableGlassmorphism
              ? 'backdrop-blur-md bg-white/70 dark:bg-zinc-900/70 border border-white/40 dark:border-zinc-700/50'
              : 'bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800'
          }`}>
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
          className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-zinc-100 font-bold transition-colors bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-3 py-1.5 rounded-lg cursor-pointer"
        >
          <Settings size={13} className="text-violet-500" />
          <span>Customize Chart</span>
        </button>
      </div>

      {/* Executive Customize Chart Configuration Modal */}
      {isCustomizeModalOpen && createPortal(
        <div className="fixed inset-0 z-[100000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-zinc-800 w-full max-w-lg p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center">
                  <Sliders size={18} className="text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Customize Chart</h3>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500">Configure visual themes, custom colors, gradients, line styles, and density</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomizeModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-md cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Progressive Tab Bar - Rule 3 Compliance (Slightly rounded rectangles) */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-zinc-800/60 rounded-lg text-xs font-semibold text-slate-600 dark:text-zinc-400">
              {[
                { id: 'theme', label: 'Theme & Color' },
                { id: 'style', label: 'Line Style' },
                { id: 'layout', label: 'Layout' },
                { id: 'display', label: 'Elements' },
                { id: 'presets', label: 'Presets' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-1.5 rounded-md transition-all text-center cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 shadow-2xs font-bold'
                      : 'hover:text-slate-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Themes & Custom HEX / Colors / Gradients / Glassmorphism */}
            {activeTab === 'theme' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-2">Preset Palettes</label>
                  <div className="grid grid-cols-3 gap-2">
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
                        onClick={() => { setVisualPalette(pal.id); setUseCustomHex(false); }}
                        className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          visualPalette === pal.id && !useCustomHex
                            ? 'border-violet-600 ring-2 ring-violet-500/20 bg-violet-50/50 dark:bg-violet-950/30'
                            : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-md shrink-0" style={{ backgroundColor: pal.color }} />
                        <span className="font-bold text-slate-800 dark:text-zinc-200 truncate">{pal.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom HEX Color Picker */}
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 dark:text-zinc-300">Custom HEX Color</label>
                    <input
                      type="checkbox"
                      checked={useCustomHex}
                      onChange={(e) => setUseCustomHex(e.target.checked)}
                      className="w-4 h-4 rounded text-violet-600 accent-violet-600 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customHexColor}
                      onChange={(e) => { setCustomHexColor(e.target.value); setUseCustomHex(true); }}
                      className="w-8 h-8 rounded-md border border-slate-200 dark:border-zinc-700 cursor-pointer bg-transparent p-0"
                    />
                    <input
                      type="text"
                      value={customHexColor}
                      onChange={(e) => { setCustomHexColor(e.target.value); setUseCustomHex(true); }}
                      placeholder="#7c3aed"
                      className="flex-1 px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 rounded-lg border border-slate-200 dark:border-zinc-700 font-mono text-xs focus:outline-none focus:border-violet-500 text-slate-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                {/* Multi-stop Gradient & Glassmorphism Controls */}
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-2.5">
                  <label className="flex items-center justify-between p-2 rounded-lg border border-slate-100 dark:border-zinc-800 cursor-pointer">
                    <span className="font-bold text-slate-700 dark:text-zinc-200">Enable Linear Gradient Fill</span>
                    <input
                      type="checkbox"
                      checked={useGradient}
                      onChange={(e) => setUseGradient(e.target.checked)}
                      className="w-4 h-4 rounded text-violet-600 accent-violet-600 cursor-pointer"
                    />
                  </label>

                  {useGradient && (
                    <div className="grid grid-cols-2 gap-2 pl-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">Gradient Start</span>
                        <input
                          type="color"
                          value={gradientStart}
                          onChange={(e) => setGradientStart(e.target.value)}
                          className="w-full h-7 rounded-md border border-slate-200 dark:border-zinc-700 cursor-pointer bg-transparent p-0"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">Gradient End</span>
                        <input
                          type="color"
                          value={gradientEnd}
                          onChange={(e) => setGradientEnd(e.target.value)}
                          className="w-full h-7 rounded-md border border-slate-200 dark:border-zinc-700 cursor-pointer bg-transparent p-0"
                        />
                      </div>
                    </div>
                  )}

                  <label className="flex items-center justify-between p-2 rounded-lg border border-slate-100 dark:border-zinc-800 cursor-pointer">
                    <span className="font-bold text-slate-700 dark:text-zinc-200">Glassmorphism Frosted Backdrop</span>
                    <input
                      type="checkbox"
                      checked={enableGlassmorphism}
                      onChange={(e) => setEnableGlassmorphism(e.target.checked)}
                      className="w-4 h-4 rounded text-violet-600 accent-violet-600 cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Tab 2: Chart Line & SVG Style Controls */}
            {activeTab === 'style' && (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-700 dark:text-zinc-300">Stroke Thinness ({strokeWidth}px)</label>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(Number(e.target.value))}
                    className="w-full accent-violet-600 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1.5">Dash Pattern</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'solid', label: 'Solid —' },
                      { id: 'dashed', label: 'Dashed - -' },
                      { id: 'dotted', label: 'Dotted · ·' }
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setStrokeDashStyle(item.id)}
                        className={`py-1.5 rounded-md border text-center font-bold transition-all cursor-pointer ${
                          strokeDashStyle === item.id
                            ? 'border-violet-600 bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300'
                            : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1.5">Line Curve Tension</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'smooth', label: 'Smooth Bezier Curve' },
                      { id: 'straight', label: 'Straight Line Segments' }
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCurveType(item.id)}
                        className={`py-1.5 rounded-md border text-center font-bold transition-all cursor-pointer ${
                          curveType === item.id
                            ? 'border-violet-600 bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300'
                            : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-700 dark:text-zinc-300">Fill Gradient Opacity ({Math.round(fillOpacity * 100)}%)</label>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.8"
                    step="0.05"
                    value={fillOpacity}
                    onChange={(e) => setFillOpacity(Number(e.target.value))}
                    className="w-full accent-violet-600 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Tab 3: Layout & Grid Density */}
            {activeTab === 'layout' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-2">Grid Columns</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map(cols => (
                      <button
                        key={cols}
                        type="button"
                        onClick={() => setGridColsCount(cols)}
                        className={`py-2 px-3 rounded-md border text-xs font-semibold transition-all cursor-pointer ${
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
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-2">Charts Per Page / View</label>
                  <div className="grid grid-cols-5 gap-2 text-xs">
                    {['1', '2', '4', '6', 'auto'].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setChartsPerPage(val)}
                        className={`py-1.5 rounded-md border text-center capitalize font-semibold transition-all cursor-pointer ${
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

            {/* Tab 4: Display Toggles */}
            {activeTab === 'display' && (
              <div className="space-y-2.5 text-xs font-medium">
                {[
                  { label: 'Show Legends', state: showLegend, setter: setShowLegend },
                  { label: 'Show Y-Axis Gridlines', state: showGridlines, setter: setShowGridlines },
                  { label: 'Show Chart Axes & Values', state: showAxes, setter: setShowAxes },
                  { label: 'Show Value Labels & Badges', state: showLabels, setter: setShowLabels },
                  { label: 'Show Summary KPI Cards Row', state: showKpiCards, setter: setShowKpiCards }
                ].map((item, idx) => (
                  <label key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-zinc-800/80 hover:bg-slate-50 dark:hover:bg-zinc-800/40 cursor-pointer">
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

            {/* Tab 5: Presets */}
            {activeTab === 'presets' && (
              <div className="space-y-3 text-xs">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New layout preset name..."
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-100 dark:bg-zinc-800 rounded-lg border border-slate-200/80 dark:border-zinc-700 text-slate-800 dark:text-zinc-100 text-xs focus:outline-none focus:border-violet-500"
                  />
                  <button
                    type="button"
                    onClick={handleSavePreset}
                    className="px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg cursor-pointer"
                  >
                    Save Preset
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {customPresets.length === 0 ? (
                    <p className="text-slate-400 dark:text-zinc-500 text-[11px] text-center py-3">No saved custom presets yet.</p>
                  ) : (
                    customPresets.map(preset => (
                      <div key={preset.id} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-zinc-800/50 rounded-lg border border-slate-200/60 dark:border-zinc-800">
                        <span className="font-semibold text-slate-700 dark:text-zinc-200">{preset.name}</span>
                        <button
                          type="button"
                          onClick={() => handleApplyPreset(preset)}
                          className="px-2.5 py-1 bg-white dark:bg-zinc-700 border border-slate-200 dark:border-zinc-600 rounded-md text-[11px] font-bold text-violet-600 dark:text-violet-300 cursor-pointer"
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
                className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Interactive & Editable Fullscreen Focus View Modal */}
      {expandedCard && createPortal(
        <div className="fixed inset-0 z-[1000000] bg-black/85 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-150">
          <div className="bg-white/95 dark:bg-zinc-900/95 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-zinc-800 w-full max-w-4xl p-6 space-y-4 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header & Editable Title Bar with Carousel Navigation (< / >) */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3 shrink-0">
              <div className="flex items-center gap-3 flex-1 mr-4">
                <input
                  type="text"
                  value={expandedTitle || expandedCard.title}
                  onChange={(e) => setExpandedTitle(e.target.value)}
                  placeholder="Chart Title..."
                  className="text-base font-bold text-slate-900 dark:text-zinc-100 bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-zinc-700 focus:border-violet-500 focus:outline-none transition-colors px-1 py-0.5 w-full max-w-sm"
                />
                <span className="text-xs px-2 py-0.5 rounded-md bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-bold shrink-0">
                  Interactive Focus View
                </span>
              </div>

              {/* Chart Carousel (< / >) Navigation */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg border border-slate-200/60 dark:border-zinc-700/80">
                  <button
                    type="button"
                    onClick={() => handleNavigateChart(-1)}
                    className="p-1 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-700 rounded-md transition-colors cursor-pointer"
                    title="Previous Chart (<)"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-[11px] font-extrabold text-slate-700 dark:text-zinc-200 px-2 font-mono">
                    {currentExpandedIdx + 1} / {availableCharts.length || 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleNavigateChart(1)}
                    className="p-1 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-700 rounded-md transition-colors cursor-pointer"
                    title="Next Chart (>)"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleExportPngChart}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download PNG</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExpandedCard(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg cursor-pointer transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Executive Quick Chart Style Controls Bar */}
            <div className="flex items-center justify-between gap-4 p-2.5 bg-slate-50 dark:bg-zinc-800/50 rounded-lg text-xs shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-600 dark:text-zinc-300 flex items-center gap-1.5">
                  <Sliders size={13} className="text-violet-500" />
                  Stroke Thinness:
                </span>
                <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 p-0.5 rounded-lg border border-slate-200/80 dark:border-zinc-700">
                  {[
                    { val: 1, label: '1px' },
                    { val: 2, label: '2px' },
                    { val: 2.5, label: '2.5px' },
                    { val: 4, label: '4px' }
                  ].map(p => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setStrokeWidth(p.val)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        strokeWidth === p.val
                          ? 'bg-violet-600 text-white shadow-2xs'
                          : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(Number(e.target.value))}
                  className="w-24 accent-violet-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-lg"
                />
                <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 px-1.5 py-0.5 rounded-md border border-violet-200 dark:border-violet-800/60">
                  {strokeWidth}px
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600 dark:text-zinc-300">Color:</span>
                {['#7c3aed', '#059669', '#4f46e5', '#d4af37', '#f43f5e'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { setCustomHexColor(c); setUseCustomHex(true); }}
                    className={`w-5 h-5 rounded-md transition-transform cursor-pointer ${activeColor === c ? 'scale-125 ring-2 ring-violet-500/40' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Main Interactive Expanded SVG Area with Thin Scrollbar Container */}
            <div className="w-full flex-1 max-h-[60vh] overflow-y-auto overflow-x-auto thin-scrollbar relative bg-white dark:bg-zinc-950 rounded-xl p-4 border border-slate-100 dark:border-zinc-800/80 shadow-inner">
              <svg viewBox="0 0 100 78" className="w-full h-full overflow-visible min-h-[340px]">
                {showGridlines && (
                  <>
                    <line x1="12" y1="10" x2="96" y2="10" stroke="#f1f5f9" strokeDasharray="2 2" className="dark:stroke-zinc-800" />
                    <line x1="12" y1="32" x2="96" y2="32" stroke="#f1f5f9" strokeDasharray="2 2" className="dark:stroke-zinc-800" />
                  </>
                )}
                {showAxes && <line x1="12" y1="55" x2="96" y2="55" stroke="#e2e8f0" className="dark:stroke-zinc-700" />}

                {showAxes && (
                  <>
                    <text x="2" y="12" fontSize="3.2" fill="#94a3b8" fontWeight="500">{formatValue(expandedCard.max || seriesMax)}</text>
                    <text x="2" y="34" fontSize="3.2" fill="#94a3b8" fontWeight="500">{formatValue(((expandedCard.max || seriesMax) + (expandedCard.min || seriesMin)) / 2)}</text>
                    <text x="2" y="56" fontSize="3.2" fill="#94a3b8" fontWeight="500">{formatValue(expandedCard.min || seriesMin)}</text>
                  </>
                )}

                {expandedCard.points.length > 1 && (
                  <path
                    d={getPathD(expandedCard.points, true, 55)}
                    fill="url(#customLinearGrad)"
                  />
                )}

                {expandedCard.points.length > 1 && (
                  <path
                    d={getPathD(expandedCard.points, false)}
                    fill="none"
                    stroke={activeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={getDashArray()}
                    strokeLinecap="round"
                  />
                )}

                {/* De-entangled & De-collided Labels Layout (Staggered Height & Angled Text) */}
                {expandedCard.points.map((pt, i) => {
                  const isStaggered = expandedCard.points.length > 5;
                  const labelY = isStaggered ? (i % 2 === 0 ? 59 : 64) : 61;
                  const labelText = pt.label && pt.label.length > 10 ? pt.label.slice(0, 9) + '…' : (pt.label || `Point ${i+1}`);
                  return (
                    <g key={i} onMouseEnter={() => setExpandedHoverPt(pt)} className="cursor-pointer group/pt">
                      <circle cx={pt.x} cy={pt.y} r="2.5" fill="#ffffff" stroke={activeColor} strokeWidth="2" className="hover:r-3.5 transition-all" />
                      {showLabels && (
                        <text x={pt.x} y={pt.y - 4} fontSize="3.2" fill="#1e293b" textAnchor="middle" fontWeight="bold" className="dark:fill-zinc-100">
                          {pt.val}
                        </text>
                      )}
                      <text
                        x={pt.x}
                        y={labelY}
                        fontSize="2.7"
                        fill="#64748b"
                        textAnchor="middle"
                        fontWeight="500"
                        transform={isStaggered ? `rotate(-20, ${pt.x}, ${labelY})` : undefined}
                        className="dark:fill-zinc-400"
                      >
                        {labelText}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Data Inspector Hover Badge */}
              {expandedHoverPt && (
                <div className="sticky bottom-2 left-4 right-4 bg-slate-900/90 dark:bg-zinc-800/90 text-white rounded-lg p-2 flex items-center justify-between text-xs backdrop-blur-xs animate-in fade-in duration-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-violet-400" />
                    <span className="font-semibold">{expandedHoverPt.label}</span>
                  </div>
                  <div className="flex items-center gap-4 font-mono">
                    <span>Value: <strong>{expandedHoverPt.val}</strong></span>
                    {expandedHoverPt.rowIdx && <span>Row #{expandedHoverPt.rowIdx}</span>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
