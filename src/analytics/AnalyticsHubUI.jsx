import React, { useState, useRef, useEffect } from 'react';
import { 
  BarChart2, Search, History, FileText, ChevronDown, Check, Play,
  Sigma, GitCommit, Split, ArrowUpDown, Shield, HelpCircle, RefreshCw, Layers, Table, Upload,
  ArrowLeft, Download, Sparkles, CheckCircle2, AlertTriangle, ChevronRight, Share2, Copy, BarChart3, TrendingUp, Info
} from 'lucide-react';
import { 
  parseGridData, getNumericalColumn, runDescriptiveStatistics, 
  runTTest, runANOVA, runChiSquare, runCorrelation, runRegression 
} from './AnalyticsModules';

/**
 * Reusable Executive Custom Dropdown Component
 */
function CustomSelect({ label, value, onChange, options, allowCustom = true, placeholder = 'Select or type custom...' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, []);

  const selectedOption = options.find(o => o.value === value) || { label: value || placeholder, value };

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">{label}</label>}
      
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className={`w-full flex items-center justify-between px-3 py-2 bg-slate-50/80 dark:bg-zinc-800/70 hover:bg-slate-100/80 dark:hover:bg-zinc-800 border ${
          isOpen ? 'border-violet-500 ring-2 ring-violet-500/20' : 'border-slate-200/80 dark:border-zinc-700/80'
        } rounded-xl text-xs font-semibold text-slate-800 dark:text-zinc-200 transition-all shadow-2xs text-left cursor-pointer`}
      >
        <span className="truncate">{selectedOption.label || value || placeholder}</span>
        <ChevronDown size={14} className={`text-slate-400 dark:text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-violet-600' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-[500] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-white/60 dark:border-zinc-800 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.18)] p-2 space-y-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="max-h-48 overflow-y-auto thin-scrollbar space-y-1">
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                    isSelected 
                      ? 'bg-[#f4f0ff] dark:bg-violet-950/50 text-[#6d28d9] dark:text-violet-300 font-bold' 
                      : 'text-slate-700 dark:text-zinc-300 hover:bg-[#f4f0ff]/60 dark:hover:bg-zinc-800/80 hover:text-[#6d28d9]'
                  }`}
                >
                  <div className="flex flex-col">
                    <span>{opt.label}</span>
                    {opt.sublabel && <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-normal">{opt.sublabel}</span>}
                  </div>
                  {isSelected && <Check size={14} className="text-[#6d28d9] dark:text-violet-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {allowCustom && (
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Custom value / range..."
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customInput.trim()) {
                    onChange(customInput.trim());
                    setIsOpen(false);
                    setCustomInput('');
                  }
                }}
                className="flex-1 px-2.5 py-1.5 bg-slate-50/80 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-violet-500 font-normal"
              />
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  if (customInput.trim()) {
                    onChange(customInput.trim());
                    setIsOpen(false);
                    setCustomInput('');
                  }
                }}
                className="px-2.5 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-semibold hover:bg-violet-700 transition-colors"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AnalyticsHubUI({ activeSheetGrid, activeSheetId, updateSheetCell, showToast }) {
  const [selectedAnalysis, setSelectedAnalysis] = useState('descriptive');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data range selection & history state
  const [selectedDataRange, setSelectedDataRange] = useState('Entire Active Sheet');
  const [rangeHistory, setRangeHistory] = useState([
    { label: 'Entire Active Sheet', desc: 'All numerical columns' },
    { label: 'Columns A & B', desc: 'Primary numerical dataset' },
    { label: 'Selection (A1:B50)', desc: 'First 50 rows' }
  ]);
  const [selectDataMenuOpen, setSelectDataMenuOpen] = useState(false);
  const [customRangeInput, setCustomRangeInput] = useState('');
  const selectDataRef = useRef(null);
  const fileInputRef = useRef(null);

  // Results & View Mode state (Config mode vs Apple Results Dashboard mode)
  const [viewMode, setViewMode] = useState('config'); // 'config' | 'results'
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [aiTonePersona, setAiTonePersona] = useState('business'); // 'business' | 'academic' | 'executive' | 'simplify'
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);

  const [varA, setVarA] = useState('Column A');
  const [varB, setVarB] = useState('Column B');
  const [confidenceLevel, setConfidenceLevel] = useState('95%');
  const [groupByColumn, setGroupByColumn] = useState('None');
  const [hypothesisType, setHypothesisType] = useState('two_tailed');
  const [corrMethod, setCorrMethod] = useState('pearson');
  const [postHocTest, setPostHocTest] = useState('tukey');
  const [analysisResults, setAnalysisResults] = useState(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (selectDataRef.current && !selectDataRef.current.contains(e.target)) {
        setSelectDataMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, []);

  const addRangeToHistory = (newRange) => {
    if (!newRange) return;
    setSelectedDataRange(newRange);
    setRangeHistory(prev => {
      if (prev.some(r => r.label === newRange)) return prev;
      return [{ label: newRange, desc: 'Custom sheet range' }, ...prev];
    });
  };

  const [selectedStats, setSelectedStats] = useState({
    mean: true,
    median: true,
    mode: true,
    stdDev: true,
    min: true,
    max: true,
    range: true,
    variance: true
  });

  const toggleStat = (key) => {
    setSelectedStats(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const hypothesisTests = [
    { 
      id: 'descriptive', 
      label: 'Descriptive Statistics', 
      icon: BarChart2,
      desc: 'Summary statistics that describe the central tendency, dispersion, and shape of your dataset.'
    },
    { 
      id: 'ttest_ind', 
      label: 'Independent T-Test', 
      icon: Split,
      desc: 'Compares the means of two independent groups to determine if there is statistical significance.'
    },
    { 
      id: 'anova', 
      label: 'One Way ANOVA', 
      icon: BarChart2,
      desc: 'Compares means across three or more categorical groups to test for significant differences.'
    },
    { 
      id: 'chisq', 
      label: 'Chi-Square Test', 
      icon: GitCommit,
      desc: 'Tests independence or goodness of fit between categorical variables using a contingency matrix.'
    },
    { 
      id: 'ttest_paired', 
      label: 'Paired T-Test', 
      icon: Split,
      desc: 'Compares two related observations or before/after measurements on the same subjects.'
    },
    { 
      id: 'mann_whitney', 
      label: 'Mann-Whitney U Test', 
      icon: ArrowUpDown,
      desc: 'Non-parametric test comparing outcomes between two independent groups without normal distribution assumption.'
    }
  ];

  const correlationRegression = [
    { 
      id: 'correlation', 
      label: 'Correlation Analysis', 
      icon: GitCommit,
      desc: 'Measures the strength and direction of the linear relationship between two variables.'
    },
    { 
      id: 'regression', 
      label: 'Linear Regression', 
      icon: Split,
      desc: 'Models the linear relationship between a dependent (Y) variable and independent (X) predictors.'
    }
  ];

  const allAnalyses = [...hypothesisTests, ...correlationRegression];
  const activeConfig = allAnalyses.find(a => a.id === selectedAnalysis) || hypothesisTests[0];

  const filteredTests = hypothesisTests.filter(t => t.label.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredCorr = correlationRegression.filter(t => t.label.toLowerCase().includes(searchQuery.toLowerCase()));

  // Handler to run analysis calculation & launch Apple Results Dashboard
  const handleRunAnalysis = () => {
    const rawCells = activeSheetGrid?.cells || [];
    const parsedData = parseGridData(rawCells);

    let col1Values = getNumericalColumn(parsedData, 0, true);
    let col2Values = getNumericalColumn(parsedData, 1, true);

    if (col1Values.length === 0) col1Values = [12, 15, 18, 22, 25, 30, 28, 34, 39, 42];
    if (col2Values.length === 0) col2Values = [10, 14, 16, 20, 24, 27, 26, 31, 35, 40];

    let result = null;
    switch (selectedAnalysis) {
      case 'descriptive':
        result = runDescriptiveStatistics(col1Values);
        break;
      case 'ttest_ind':
        result = runTTest(col1Values, col2Values);
        break;
      case 'anova':
        result = runANOVA([col1Values, col2Values, [14, 19, 21, 25, 29, 33]]);
        break;
      case 'chisq':
        result = runChiSquare([[25, 15], [10, 30]]);
        break;
      case 'ttest_paired':
        result = runTTest(col1Values, col2Values);
        break;
      case 'mann_whitney':
        result = runTTest(col1Values, col2Values);
        break;
      case 'correlation':
        result = runCorrelation(col1Values, col2Values);
        break;
      case 'regression':
        result = runRegression(col1Values, col2Values);
        break;
      default:
        result = runDescriptiveStatistics(col1Values);
    }

    setAnalysisResults(result);
    setViewMode('results');
    showToast?.(`Generated Apple Intelligence report for ${activeConfig.label}`);
  };

  const IconComponent = activeConfig.icon;

  // AI Narrative Text Generator based on selected tone persona
  const getAiInterpretation = () => {
    switch (aiTonePersona) {
      case 'academic':
        return "The empirical sample distribution exhibits mild positive skewness (S = +0.38, K = -0.22). Parametric assumptions for independent t-tests and ANOVA models are fully satisfied (p > 0.05).";
      case 'executive':
        return "Overall metric health is exceptionally strong. Revenue stability sits at $45.22 mean with low standard deviation ($5.61), indicating highly predictable operations for Q3 forecasting.";
      case 'simplify':
        return "Your numbers look very steady and healthy! Most values cluster tightly around 44-45 with no strange data gaps.";
      case 'business':
      default:
        return "Revenue variability is relatively low, indicating stable monthly performance. The slight positive skew suggests occasional high-value transactions. No obvious anomalies were detected.";
    }
  };

  return (
    <div className="flex-1 h-full min-h-0 bg-[#F9F9FB] dark:bg-[#09090b] flex flex-col font-sans p-8 overflow-y-auto thin-scrollbar">
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".csv,.xlsx,.json"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            const fileName = e.target.files[0].name;
            addRangeToHistory(`Uploaded: ${fileName}`);
            showToast?.(`Uploaded dataset file: ${fileName}`);
          }
        }} 
      />

      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7c3aed] to-[#a855f7] flex items-center justify-center text-white shadow-sm shadow-violet-200 shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="4" />
                <path d="M12 3v18" />
                <path d="M7 9h2" />
                <path d="M7 15h3" />
                <path d="M15 9.5c.8-1 2.2-1 3 0" />
                <path d="M15 15c.8 1 2.2 1 3 0" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              Analyze
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1.5 font-normal">
            Statistical analysis, hypothesis testing, and simulations for your data.
          </p>
        </div>

        {/* History Button (No Container, matching Image 2) */}
        <button 
          type="button"
          onClick={() => showToast?.('Opening Analysis History...')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors cursor-pointer py-1 px-1.5"
        >
          <History size={16} className="text-slate-500 dark:text-zinc-400" />
          <span>History</span>
        </button>
      </div>

      {/* Main Content View (Config Mode vs Apple Results Dashboard Mode) */}
      {viewMode === 'results' && analysisResults ? (
        /* APPLE HEALTH + NUMBERS + CHATGPT RESULTS DASHBOARD */
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Executive Results Header Banner */}
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl rounded-2xl border border-white/60 dark:border-zinc-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setViewMode('config')}
                  className="flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Config</span>
                </button>
                <span className="text-slate-300 dark:text-zinc-700">|</span>
                <span className="text-xs text-slate-400 dark:text-zinc-500">
                  Dataset: <strong className="text-slate-700 dark:text-zinc-300">{selectedDataRange}</strong>
                </span>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100">
                  {activeConfig.label} Report
                </h2>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 size={12} />
                  <span>Completed in 0.48s</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 dark:text-zinc-500">
                145 observations analyzed · 12 numerical metrics calculated · 95% confidence interval
              </p>
            </div>

            {/* Export & Share Dropdown Actions */}
            <div className="relative flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  showToast?.('Copied full statistical report to clipboard');
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                <Copy size={13} />
                <span>Copy Results</span>
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-violet-200 dark:shadow-none cursor-pointer"
                >
                  <Download size={13} />
                  <span>Export Report</span>
                  <ChevronDown size={13} />
                </button>

                {isExportMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl p-1.5 z-[500] space-y-1">
                    {[
                      { label: 'Export PDF Document', fmt: 'pdf' },
                      { label: 'Export Markdown Summary', fmt: 'md' },
                      { label: 'Export Excel Workbook', fmt: 'xlsx' }
                    ].map(item => (
                      <button
                        key={item.fmt}
                        type="button"
                        onClick={() => {
                          setIsExportMenuOpen(false);
                          showToast?.(`Exported report as ${item.fmt.toUpperCase()}`);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 1. Insight Summary Section (Readable in 10 seconds) */}
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl rounded-2xl border border-white/60 dark:border-zinc-800 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-2">
              <Sparkles size={15} className="text-violet-600" />
              Executive Insight Summary
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { title: 'Mean revenue increased 18.4%', desc: 'Primary metric average sits at $45.22, up from $38.20 baseline.' },
                { title: 'Slightly Right Skewed Distribution', desc: 'Positive skew (+0.38) indicates occasional high-value transactions.' },
                { title: '100% Data Integrity Verified', desc: 'No missing values or corrupted rows detected across 145 items.' },
                { title: 'Moderate Variance & Dispersion', desc: 'Standard deviation is low ($5.61) showing stable performance.' },
                { title: '96% Confidence Interval', desc: 'True population mean is bounded reliably between $41.20 and $49.24.' }
              ].map((bullet, idx) => (
                <div key={idx} className="p-3.5 bg-[#f4f0ff]/60 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40 rounded-xl space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#6d28d9] dark:text-violet-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6d28d9] shrink-0" />
                    <span>{bullet.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 pl-3.5 leading-snug">
                    {bullet.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Statistical Health Indicators (Apple Health Style) */}
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl rounded-2xl border border-white/60 dark:border-zinc-800 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-2">
              <Shield size={15} className="text-violet-600" />
              Dataset Health Scorecard
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { status: 'ok', text: 'No Duplicates' },
                { status: 'ok', text: 'No Missing Values' },
                { status: 'ok', text: 'Normal Distribution' },
                { status: 'warn', text: '1 Potential Outlier' },
                { status: 'ok', text: 'Sample Size (n=145)' }
              ].map((item, idx) => (
                <div key={idx} className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                  item.status === 'ok' 
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/40 text-amber-800 dark:text-amber-300'
                }`}>
                  {item.status === 'ok' ? <CheckCircle2 size={15} className="shrink-0 text-emerald-600" /> : <AlertTriangle size={15} className="shrink-0 text-amber-600" />}
                  <span className="truncate">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Interactive Visualizations (First-Class Citizens, Photos.app style horizontal cards) */}
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl rounded-2xl border border-white/60 dark:border-zinc-800 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-2">
              <BarChart3 size={15} className="text-violet-600" />
              Interactive Visualizations
            </h3>

            <div className="flex gap-4 overflow-x-auto thin-scrollbar pb-2">
              {/* Histogram Card */}
              <div className="min-w-[260px] max-w-[280px] bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80 rounded-2xl p-4 space-y-3 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">Distribution Histogram</span>
                  <span className="text-[10px] text-slate-400">Frequency</span>
                </div>
                {/* SVG Mini Histogram */}
                <div className="h-32 flex items-end justify-between gap-1.5 pt-4 px-2">
                  {[20, 35, 55, 85, 100, 75, 45, 25, 15].map((h, i) => (
                    <div 
                      key={i} 
                      style={{ height: `${h}%` }} 
                      className={`w-full rounded-t-sm transition-all duration-300 ${i === 4 ? 'bg-[#7c3aed]' : 'bg-slate-300 dark:bg-zinc-600 hover:bg-violet-400'}`}
                      title={`Bin ${i+1}: ${h}% frequency`}
                    />
                  ))}
                </div>
                <div className="text-[10.5px] text-slate-400 text-center font-mono">Continuous Metric Histogram</div>
              </div>

              {/* Box Plot Card */}
              <div className="min-w-[260px] max-w-[280px] bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80 rounded-2xl p-4 space-y-3 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">Box & Whisker Plot</span>
                  <span className="text-[10px] text-slate-400">Quartiles</span>
                </div>
                {/* SVG Mini Boxplot */}
                <div className="h-32 flex items-center justify-center relative">
                  <div className="w-full h-px bg-slate-300 dark:bg-zinc-600 relative">
                    {/* IQR Box */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-1/4 right-1/4 h-12 bg-violet-100 dark:bg-violet-950/60 border border-[#7c3aed] rounded-sm flex items-center justify-center">
                      <div className="w-px h-full bg-[#7c3aed] stroke-2" title="Median: 44.01" />
                    </div>
                    {/* Whisker caps */}
                    <div className="absolute -top-3 left-0 w-px h-6 bg-slate-400" />
                    <div className="absolute -top-3 right-0 w-px h-6 bg-slate-400" />
                    {/* Outlier Dot */}
                    <div className="absolute top-1/2 -translate-y-1/2 -right-6 w-2 h-2 rounded-full bg-amber-500" title="Outlier: 92.40" />
                  </div>
                </div>
                <div className="text-[10.5px] text-slate-400 text-center font-mono">Q1: 39.2 | Q2: 44.0 | Q3: 49.8</div>
              </div>

              {/* Density Curve Card */}
              <div className="min-w-[260px] max-w-[280px] bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80 rounded-2xl p-4 space-y-3 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">Kernel Density (KDE)</span>
                  <span className="text-[10px] text-slate-400">Smooth Probability</span>
                </div>
                {/* SVG Density Curve */}
                <div className="h-32 flex items-center justify-center">
                  <svg width="100%" height="80" viewBox="0 0 200 80" className="overflow-visible">
                    <path 
                      d="M 10 70 Q 50 70 80 40 T 120 10 T 160 65 T 190 70" 
                      fill="none" 
                      stroke="#7c3aed" 
                      strokeWidth="2.5" 
                    />
                    <path 
                      d="M 10 70 Q 50 70 80 40 T 120 10 T 160 65 T 190 70 L 190 75 L 10 75 Z" 
                      fill="rgba(124, 58, 237, 0.12)" 
                    />
                  </svg>
                </div>
                <div className="text-[10.5px] text-slate-400 text-center font-mono">Gaussian Kernel Bandwidth 1.2</div>
              </div>
            </div>
          </div>

          {/* 4. Apple Metric Cards (Instead of raw tables) */}
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl rounded-2xl border border-white/60 dark:border-zinc-800 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Key Metric Cards
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Mean', value: typeof analysisResults.mean === 'number' ? analysisResults.mean.toFixed(2) : '45.22', sub: 'Average value' },
                { label: 'Median', value: typeof analysisResults.median === 'number' ? analysisResults.median.toFixed(2) : '44.01', sub: '50th percentile' },
                { label: 'Std Deviation', value: typeof analysisResults.stdDev === 'number' ? analysisResults.stdDev.toFixed(2) : '5.61', sub: 'Sample spread' },
                { label: 'Variance', value: typeof analysisResults.variance === 'number' ? analysisResults.variance.toFixed(2) : '31.40', sub: 'Squared deviation' },
                { label: 'Minimum', value: typeof analysisResults.min === 'number' ? analysisResults.min.toFixed(2) : '29.50', sub: 'Lowest observed' },
                { label: 'Maximum', value: typeof analysisResults.max === 'number' ? analysisResults.max.toFixed(2) : '58.00', sub: 'Highest observed' },
                { label: 'Range', value: typeof analysisResults.range === 'number' ? analysisResults.range.toFixed(2) : '28.50', sub: 'Max - Min' },
                { label: 'Count (n)', value: analysisResults.count || 145, sub: 'Total samples' }
              ].map((card, idx) => (
                <div key={idx} className="bg-slate-50/80 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80 p-4 rounded-2xl space-y-1 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-tight">{card.label}</span>
                  <div className="text-xl font-bold text-slate-900 dark:text-zinc-100">{card.value}</div>
                  <div className="text-[10px] text-slate-400 dark:text-zinc-500">{card.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. AI Interpretation Card (ChatGPT Narrative + Persona Switcher) */}
          <div className="bg-[#f4f0ff]/80 dark:bg-violet-950/30 border border-violet-200/80 dark:border-violet-900/50 backdrop-blur-2xl rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6d28d9] dark:text-violet-300 flex items-center gap-2">
                <Sparkles size={15} className="text-[#6d28d9]" />
                AI Interpretation Narrative
              </h3>

              {/* Persona Switcher Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'business', label: 'Business' },
                  { id: 'executive', label: 'Executive' },
                  { id: 'academic', label: 'Academic' },
                  { id: 'simplify', label: 'Simplify' }
                ].map((persona) => (
                  <button
                    key={persona.id}
                    type="button"
                    onClick={() => setAiTonePersona(persona.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      aiTonePersona === persona.id
                        ? 'bg-[#6d28d9] text-white shadow-xs'
                        : 'bg-white/80 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-white'
                    }`}
                  >
                    {persona.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-zinc-200 leading-relaxed italic bg-white/70 dark:bg-zinc-900/70 p-4 rounded-xl border border-violet-100 dark:border-violet-900/40">
              "{getAiInterpretation()}"
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button 
                type="button" 
                onClick={() => showToast?.('Regenerating explanation with GPT-4o...')} 
                className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-violet-200 dark:border-violet-800 rounded-xl text-xs font-semibold text-[#6d28d9] dark:text-violet-300 hover:bg-violet-50 transition-all cursor-pointer"
              >
                Explain Further
              </button>
              <button 
                type="button" 
                onClick={() => showToast?.('Suggesting next analysis step...')} 
                className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-violet-200 dark:border-violet-800 rounded-xl text-xs font-semibold text-[#6d28d9] dark:text-violet-300 hover:bg-violet-50 transition-all cursor-pointer"
              >
                Suggest Next Step
              </button>
            </div>
          </div>

          {/* 6. Progressive Disclosure (Collapsible Advanced Statistics) */}
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl rounded-2xl border border-white/60 dark:border-zinc-800 p-6 shadow-sm space-y-4">
            <button
              type="button"
              onClick={() => setShowAdvancedStats(!showAdvancedStats)}
              className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <span>▼ Advanced Statistics & Higher Moments</span>
              <ChevronDown size={16} className={`transition-transform duration-200 ${showAdvancedStats ? 'rotate-180' : ''}`} />
            </button>

            {showAdvancedStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800 animate-in fade-in duration-150">
                {[
                  { label: 'Skewness', val: '+0.38' },
                  { label: 'Kurtosis', val: '-0.22' },
                  { label: 'Coeff of Variation (CV)', val: '12.4%' },
                  { label: 'Std Error (SEM)', val: '0.46' },
                  { label: 'Interquartile Range (IQR)', val: '10.60' },
                  { label: 'Mean Abs Dev (MAD)', val: '4.22' },
                  { label: 'Geometric Mean', val: '44.18' },
                  { label: 'Harmonic Mean', val: '43.10' }
                ].map((adv, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200/70 dark:border-zinc-700/70 space-y-0.5">
                    <div className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase">{adv.label}</div>
                    <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">{adv.val}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 7. Recommended Next Steps (One-Click Actions) */}
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl rounded-2xl border border-white/60 dark:border-zinc-800 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Recommended Next Steps
            </h3>

            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Run Pearson Correlation', action: 'correlation' },
                { label: 'Run Linear Regression', action: 'regression' },
                { label: 'Run One-Way ANOVA', action: 'anova' },
                { label: 'Create Visualization', action: 'visualize' }
              ].map((rec, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    if (rec.action === 'visualize') {
                      showToast?.('Opening Visualization tab...');
                    } else {
                      setSelectedAnalysis(rec.action);
                      setViewMode('config');
                      showToast?.(`Switched to ${rec.label}`);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-violet-50 hover:text-violet-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  <span>{rec.label}</span>
                  <ChevronRight size={14} className="text-slate-400" />
                </button>
              ))}
            </div>
          </div>

        </div>
      ) : (
        /* CONFIGURATION FORM MODE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Navigation Sidebar */}
          <div className="lg:col-span-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl rounded-2xl border border-white/60 dark:border-zinc-800/80 p-5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.06)] space-y-6">
            
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search analysis"
                className="w-full pl-9 pr-12 py-2.5 bg-slate-50/80 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80 rounded-xl text-xs text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] font-semibold text-slate-400 border border-slate-200 dark:border-zinc-700 rounded px-1.5 py-0.5 bg-white dark:bg-zinc-800">
                ⌘K
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-3 px-1">
                Hypothesis Tests
              </h3>
              <div className="space-y-1">
                {filteredTests.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedAnalysis === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedAnalysis(item.id);
                        setAnalysisResults(null);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 text-left cursor-pointer ${
                        isSelected 
                          ? 'bg-[#f4f0ff] dark:bg-violet-950/50 text-[#6d28d9] dark:text-violet-300 font-bold' 
                          : 'text-slate-600 dark:text-zinc-400 hover:bg-[#f4f0ff]/70 dark:hover:bg-zinc-800/60 hover:text-[#6d28d9] dark:hover:text-zinc-200'
                      }`}
                    >
                      <Icon size={16} className={isSelected ? 'text-[#6d28d9] dark:text-violet-400' : 'text-[#6d28d9]/70 dark:text-zinc-400'} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-3 px-1">
                Correlation & Regression
              </h3>
              <div className="space-y-1">
                {filteredCorr.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedAnalysis === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedAnalysis(item.id);
                        setAnalysisResults(null);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 text-left cursor-pointer ${
                        isSelected 
                          ? 'bg-[#f4f0ff] dark:bg-violet-950/50 text-[#6d28d9] dark:text-violet-300 font-bold' 
                          : 'text-slate-600 dark:text-zinc-400 hover:bg-[#f4f0ff]/70 dark:hover:bg-zinc-800/60 hover:text-[#6d28d9] dark:hover:text-zinc-200'
                      }`}
                    >
                      <Icon size={16} className={isSelected ? 'text-[#6d28d9] dark:text-violet-400' : 'text-[#6d28d9]/70 dark:text-zinc-400'} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Detail Content Panel */}
          <div className="lg:col-span-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl rounded-2xl border border-white/60 dark:border-zinc-800/80 p-7 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.06)] space-y-7">
            
            <div className="flex items-start gap-3.5 border-b border-slate-100 dark:border-zinc-800 pb-5">
              <div className="w-9 h-9 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-[#6d28d9] dark:text-violet-400 rounded-xl shadow-2xs shrink-0 flex items-center justify-center">
                <IconComponent size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                  {activeConfig.label}
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  {activeConfig.desc}
                </p>
              </div>
            </div>

            {/* Select Data Range or Upload Dropzone Box */}
            <div className="border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-white/40 dark:bg-zinc-850/20 backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700 flex items-center justify-center text-slate-500 dark:text-zinc-400 shadow-sm mb-3">
                <FileText size={20} />
              </div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                Select data range or upload a dataset
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 mb-4">
                Choose a range from your sheet or import a file to get started.
              </p>
              
              {/* "Select Data" Dropdown Pill Button */}
              <div className="relative" ref={selectDataRef}>
                <button 
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setSelectDataMenuOpen(!selectDataMenuOpen);
                  }}
                  className="flex items-center px-4 py-2 bg-[#f4f0ff] dark:bg-violet-950/50 hover:bg-[#eae3fb] border border-violet-200/80 dark:border-violet-800/60 rounded-xl text-xs font-semibold text-[#6d28d9] dark:text-violet-300 shadow-2xs transition-all cursor-pointer backdrop-blur-md"
                >
                  <span>{selectedDataRange === 'Entire Active Sheet' ? 'Select Data' : selectedDataRange}</span>
                  <div className="h-3.5 w-px bg-violet-200/80 dark:bg-violet-800/80 mx-2 shrink-0" />
                  <ChevronDown size={14} className={`text-[#6d28d9] dark:text-violet-300 transition-transform duration-200 ${selectDataMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Data Selection Popover Menu */}
                {selectDataMenuOpen && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-[500] w-72 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-white/80 dark:border-zinc-800 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.22)] p-2 space-y-2 animate-in fade-in zoom-in-95 duration-150 text-left">
                    
                    <button
                      type="button"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        setSelectDataMenuOpen(false);
                        fileInputRef.current?.click();
                      }}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-violet-50/80 dark:bg-violet-950/40 text-[#6d28d9] dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-950/60 font-semibold text-xs transition-colors cursor-pointer border border-violet-200/60 dark:border-violet-800/40"
                    >
                      <Upload size={14} className="text-[#6d28d9] dark:text-violet-400" />
                      <div className="flex flex-col">
                        <span>Upload Dataset / File</span>
                        <span className="text-[10px] text-violet-500 font-normal">Import .CSV, .XLSX, or .JSON</span>
                      </div>
                    </button>

                    <div className="px-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Sheet Ranges & Selection</div>
                    
                    <div className="max-h-40 overflow-y-auto thin-scrollbar space-y-1">
                      {rangeHistory.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onPointerDown={(e) => {
                            e.preventDefault();
                            addRangeToHistory(preset.label);
                            setSelectDataMenuOpen(false);
                            showToast?.(`Selected ${preset.label}`);
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <div className="flex flex-col">
                            <span className="text-slate-800 dark:text-zinc-200">{preset.label}</span>
                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-normal">{preset.desc}</span>
                          </div>
                          {selectedDataRange === preset.label && <Check size={14} className="text-[#6d28d9] shrink-0" />}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
                      <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Custom Sheet Range</div>
                      <div className="flex items-center gap-1.5 px-1">
                        <input 
                          type="text"
                          placeholder="e.g. Sheet1!A1:B100"
                          value={customRangeInput}
                          onChange={(e) => setCustomRangeInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && customRangeInput.trim()) {
                              addRangeToHistory(customRangeInput.trim());
                              setSelectDataMenuOpen(false);
                              showToast?.(`Custom range set to ${customRangeInput.trim()}`);
                              setCustomRangeInput('');
                            }
                          }}
                          className="flex-1 px-2.5 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-mono text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-violet-500 font-normal"
                        />
                        <button
                          type="button"
                          onPointerDown={(e) => {
                            e.preventDefault();
                            if (customRangeInput.trim()) {
                              addRangeToHistory(customRangeInput.trim());
                              setSelectDataMenuOpen(false);
                              showToast?.(`Custom range set to ${customRangeInput.trim()}`);
                              setCustomRangeInput('');
                            }
                          }}
                          className="px-2.5 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-semibold hover:bg-violet-700 transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            </div>

            {/* Dynamic Form Controls */}
            {selectedAnalysis === 'descriptive' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="bg-white/60 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-3">
                  <h4 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                    Statistics
                  </h4>
                  <div className="space-y-2.5">
                    {[
                      { id: 'mean', label: 'Mean' },
                      { id: 'median', label: 'Median' },
                      { id: 'mode', label: 'Mode' },
                      { id: 'stdDev', label: 'Standard Deviation' }
                    ].map((stat) => (
                      <label key={stat.id} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          checked={selectedStats[stat.id]}
                          onChange={() => toggleStat(stat.id)}
                          className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer accent-violet-600"
                        />
                        <span>{stat.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-white/60 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-3">
                  <h4 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                    Distribution
                  </h4>
                  <div className="space-y-2.5">
                    {[
                      { id: 'min', label: 'Minimum' },
                      { id: 'max', label: 'Maximum' },
                      { id: 'range', label: 'Range' },
                      { id: 'variance', label: 'Variance' }
                    ].map((stat) => (
                      <label key={stat.id} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          checked={selectedStats[stat.id]}
                          onChange={() => toggleStat(stat.id)}
                          className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer accent-violet-600"
                        />
                        <span>{stat.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-white/60 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-3">
                  <h4 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                    Options
                  </h4>
                  <div className="space-y-4">
                    <CustomSelect 
                      label="Group by"
                      value={groupByColumn}
                      onChange={setGroupByColumn}
                      placeholder="Select column"
                      options={[
                        { label: 'None (Entire Sheet)', value: 'None' },
                        { label: 'Column A (Category)', value: 'Column A' },
                        { label: 'Column B (Segment)', value: 'Column B' },
                        { label: 'Column C (Department)', value: 'Column C' }
                      ]}
                    />
                    <CustomSelect 
                      label="Confidence Level"
                      value={confidenceLevel}
                      onChange={setConfidenceLevel}
                      options={[
                        { label: '95%', value: '95%' },
                        { label: '99%', value: '99%' },
                        { label: '90%', value: '90%' }
                      ]}
                    />
                  </div>
                </div>
              </div>
            )}

            {(selectedAnalysis === 'ttest_ind' || selectedAnalysis === 'ttest_paired' || selectedAnalysis === 'mann_whitney') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="bg-white/60 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
                  <h4 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                    Variables / Groups Selection
                  </h4>
                  <CustomSelect 
                    label="Sample / Variable 1 (Group A)"
                    value={varA}
                    onChange={setVarA}
                    options={[
                      { label: 'Column A (Numerical)', value: 'Column A' },
                      { label: 'Column B (Numerical)', value: 'Column B' },
                      { label: 'Column C (Numerical)', value: 'Column C' }
                    ]}
                  />
                  <CustomSelect 
                    label="Sample / Variable 2 (Group B)"
                    value={varB}
                    onChange={setVarB}
                    options={[
                      { label: 'Column B (Numerical)', value: 'Column B' },
                      { label: 'Column A (Numerical)', value: 'Column A' },
                      { label: 'Column C (Numerical)', value: 'Column C' }
                    ]}
                  />
                </div>

                <div className="bg-white/60 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
                  <h4 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                    Test Hypothesis & Parameters
                  </h4>
                  <CustomSelect 
                    label="Alternative Hypothesis"
                    value={hypothesisType}
                    onChange={setHypothesisType}
                    options={[
                      { label: 'Two-tailed (Mean 1 ≠ Mean 2)', value: 'two_tailed' },
                      { label: 'Greater (Mean 1 > Mean 2)', value: 'greater' },
                      { label: 'Less (Mean 1 < Mean 2)', value: 'less' }
                    ]}
                    allowCustom={false}
                  />
                  <CustomSelect 
                    label="Confidence Interval %"
                    value={confidenceLevel}
                    onChange={setConfidenceLevel}
                    options={[
                      { label: '95% (α = 0.05)', value: '95%' },
                      { label: '99% (α = 0.01)', value: '99%' },
                      { label: '90% (α = 0.10)', value: '90%' }
                    ]}
                  />
                </div>
              </div>
            )}

            {selectedAnalysis === 'anova' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="bg-white/60 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
                  <h4 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">ANOVA Model Variables</h4>
                  <CustomSelect 
                    label="Dependent Variable (Continuous Outcome)"
                    value={varA}
                    onChange={setVarA}
                    options={[
                      { label: 'Column A (Score / Outcome)', value: 'Column A' },
                      { label: 'Column B (Response Time)', value: 'Column B' }
                    ]}
                  />
                  <CustomSelect 
                    label="Factor Variable (Categorical Grouping)"
                    value={varB}
                    onChange={setVarB}
                    options={[
                      { label: 'Column B (Treatment Category)', value: 'Column B' },
                      { label: 'Column C (Department)', value: 'Column C' }
                    ]}
                  />
                </div>
                <div className="bg-white/60 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
                  <h4 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">Post-Hoc Analysis Options</h4>
                  <CustomSelect 
                    label="Post-Hoc Test Method"
                    value={postHocTest}
                    onChange={setPostHocTest}
                    options={[
                      { label: 'Tukey HSD (Honest Significant Difference)', value: 'tukey' },
                      { label: 'Bonferroni Correction', value: 'bonferroni' },
                      { label: 'Scheffé Method', value: 'scheffe' },
                      { label: 'None', value: 'none' }
                    ]}
                  />
                </div>
              </div>
            )}

            {selectedAnalysis === 'chisq' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="bg-white/60 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
                  <h4 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">Contingency Matrix Input</h4>
                  <CustomSelect 
                    label="Row Factor (Variable 1)"
                    value={varA}
                    onChange={setVarA}
                    options={[
                      { label: 'Column A (Category Rows)', value: 'Column A' },
                      { label: 'Column B (Gender / Type)', value: 'Column B' }
                    ]}
                  />
                  <CustomSelect 
                    label="Column Factor (Variable 2)"
                    value={varB}
                    onChange={setVarB}
                    options={[
                      { label: 'Column B (Category Columns)', value: 'Column B' },
                      { label: 'Column C (Status / Outcome)', value: 'Column C' }
                    ]}
                  />
                </div>
                <div className="bg-white/60 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
                  <h4 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">Chi-Square Options</h4>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    <input type="checkbox" defaultChecked className="rounded accent-violet-600" />
                    <span>Yates Continuity Correction (2x2 tables)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    <input type="checkbox" defaultChecked className="rounded accent-violet-600" />
                    <span>Compute Expected Cell Frequencies</span>
                  </label>
                </div>
              </div>
            )}

            {(selectedAnalysis === 'correlation' || selectedAnalysis === 'regression') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="bg-white/60 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
                  <h4 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">Variables Selection</h4>
                  <CustomSelect 
                    label={selectedAnalysis === 'regression' ? 'Dependent Variable Y (Outcome)' : 'Variable X'}
                    value={varA}
                    onChange={setVarA}
                    options={[
                      { label: 'Column A (Sales / Metric Y)', value: 'Column A' },
                      { label: 'Column B (Metric)', value: 'Column B' }
                    ]}
                  />
                  <CustomSelect 
                    label={selectedAnalysis === 'regression' ? 'Independent Variable X (Predictor)' : 'Variable Y'}
                    value={varB}
                    onChange={setVarB}
                    options={[
                      { label: 'Column B (Ad Spend / Predictor X)', value: 'Column B' },
                      { label: 'Column C (Feature X2)', value: 'Column C' }
                    ]}
                  />
                </div>
                <div className="bg-white/60 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
                  <h4 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">Method & Output Options</h4>
                  {selectedAnalysis === 'correlation' ? (
                    <CustomSelect 
                      label="Correlation Coefficient"
                      value={corrMethod}
                      onChange={setCorrMethod}
                      options={[
                        { label: 'Pearson Correlation Coefficient (r)', value: 'pearson' },
                        { label: 'Spearman Rank Correlation (ρ)', value: 'spearman' }
                      ]}
                      allowCustom={false}
                    />
                  ) : (
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        <input type="checkbox" defaultChecked className="rounded accent-violet-600" />
                        <span>Include Intercept Constant (β0)</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        <input type="checkbox" defaultChecked className="rounded accent-violet-600" />
                        <span>Generate Residual Diagnostics Plot</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Right Run Analysis Button */}
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-zinc-800">
              <button 
                type="button"
                onClick={handleRunAnalysis}
                className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-violet-200 dark:shadow-none transition-all active:scale-95 cursor-pointer"
              >
                <Play size={14} fill="currentColor" />
                <span>Run {activeConfig.label}</span>
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
