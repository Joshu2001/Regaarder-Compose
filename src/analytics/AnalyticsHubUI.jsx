import React, { useState, useRef, useEffect } from 'react';
import { 
  BarChart2, Search, History, FileText, ChevronDown, Check, Play,
  Sigma, GitCommit, Split, ArrowUpDown, Shield, HelpCircle, RefreshCw, Layers, Table, Upload
} from 'lucide-react';
import { 
  parseGridData, getNumericalColumn, runDescriptiveStatistics, 
  runTTest, runANOVA, runChiSquare, runCorrelation, runRegression 
} from './AnalyticsModules';

/**
 * Reusable Executive Custom Dropdown & Editable Select Component with Glassmorphism
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
      
      {/* Trigger Button */}
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

      {/* Floating Glassmorphic Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-[500] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-white/60 dark:border-zinc-800 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.18)] p-2 space-y-2 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Options List */}
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

          {/* Optional Freeform Custom Input */}
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
    showToast?.(`Ran ${activeConfig.label} on ${selectedDataRange}`);
  };

  const IconComponent = activeConfig.icon;

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

      {/* Top Title Header */}
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

      {/* Main Two-Column Layout */}
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
            <div className="p-2 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-[#6d28d9] dark:text-violet-400 rounded-xl shadow-2xs shrink-0">
              <IconComponent size={18} />
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
            
            {/* "Select Data" Dropdown Pill Button (Exact Color & Vertical Split Line matching Image 1) */}
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

          {/* Dynamic Form Controls wrapped in Thin Outline Cards matching Image 3 */}
          {selectedAnalysis === 'descriptive' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* STATISTICS Container Card */}
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

              {/* DISTRIBUTION Container Card */}
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

              {/* OPTIONS Container Card */}
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

          {/* Results Output Display Box */}
          {analysisResults && (
            <div className="p-5 bg-[#f4f0ff]/80 dark:bg-violet-950/20 border border-violet-200/80 dark:border-violet-800/50 backdrop-blur-xl rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#6d28d9] dark:text-violet-300 flex items-center gap-2">
                  <Check size={14} className="text-[#6d28d9]" />
                  {activeConfig.label} Results Output ({selectedDataRange})
                </h4>
                <span className="text-[11px] font-semibold text-[#6d28d9] dark:text-violet-400 bg-white/90 dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-violet-200 dark:border-violet-800">
                  Computed Live
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(analysisResults).map(([key, value]) => {
                  if (typeof value === 'object' || key === 'error') return null;
                  return (
                    <div key={key} className="bg-white/90 dark:bg-zinc-900 p-3 rounded-xl border border-violet-100 dark:border-zinc-800 shadow-2xs">
                      <div className="text-[10.5px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-tight">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </div>
                      <div className="text-sm font-bold text-slate-800 dark:text-zinc-100 mt-0.5">
                        {typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(4)) : String(value)}
                      </div>
                    </div>
                  );
                })}
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

    </div>
  );
}
