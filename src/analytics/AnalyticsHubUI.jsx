import React, { useState } from 'react';
import { 
  BarChart2, Search, History, FileText, ChevronDown, Check, Play,
  Sigma, GitCommit, Split, ArrowUpDown, Shield, HelpCircle, RefreshCw, Layers, Table
} from 'lucide-react';
import { 
  parseGridData, getNumericalColumn, runDescriptiveStatistics, 
  runTTest, runANOVA, runChiSquare, runCorrelation, runRegression 
} from './AnalyticsModules';

export default function AnalyticsHubUI({ activeSheetGrid, activeSheetId, updateSheetCell, showToast }) {
  const [selectedAnalysis, setSelectedAnalysis] = useState('descriptive');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom inputs state for various analysis types
  const [varA, setVarA] = useState('Column A');
  const [varB, setVarB] = useState('Column B');
  const [confidenceLevel, setConfidenceLevel] = useState('95%');
  const [groupByColumn, setGroupByColumn] = useState('');
  const [hypothesisType, setHypothesisType] = useState('two_tailed');
  const [corrMethod, setCorrMethod] = useState('pearson');
  const [postHocTest, setPostHocTest] = useState('tukey');
  const [analysisResults, setAnalysisResults] = useState(null);

  // Selection states for descriptive statistics checkboxes
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

  // Handler to run analysis calculation on current sheet grid data or sample data
  const handleRunAnalysis = () => {
    // Attempt to extract numerical data from current active sheet grid
    const rawCells = activeSheetGrid?.cells || [];
    const parsedData = parseGridData(rawCells);

    let col1Values = getNumericalColumn(parsedData, 0, true);
    let col2Values = getNumericalColumn(parsedData, 1, true);

    // Fallback sample values if sheet is currently empty
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
    showToast?.(`Ran ${activeConfig.label} analysis successfully`);
  };

  const IconComponent = activeConfig.icon;

  return (
    <div className="flex-1 h-full min-h-0 bg-[#F9F9FB] dark:bg-[#09090b] flex flex-col font-sans p-8 overflow-y-auto thin-scrollbar">
      
      {/* Top Title & Subtitle Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-sm shadow-violet-200">
              <BarChart2 size={18} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              Analyze
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1.5 font-normal">
            Statistical analysis, hypothesis testing, and simulations for your data.
          </p>
        </div>

        {/* History Action Button */}
        <button 
          type="button"
          onClick={() => showToast?.('Opening Analysis History...')}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
        >
          <History size={15} className="text-slate-500" />
          <span>History</span>
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Navigation Sidebar */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/70 dark:border-zinc-800 p-5 shadow-sm space-y-6">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search analysis"
              className="w-full pl-9 pr-12 py-2.5 bg-slate-50/70 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/80 rounded-xl text-xs text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] font-semibold text-slate-400 border border-slate-200 dark:border-zinc-700 rounded px-1.5 py-0.5 bg-white dark:bg-zinc-800">
              ⌘K
            </div>
          </div>

          {/* HYPOTHESIS TESTS Section */}
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
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                      isSelected 
                        ? 'bg-violet-50/80 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/40 shadow-xs' 
                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-zinc-200 border border-transparent'
                    }`}
                  >
                    <Icon size={16} className={isSelected ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CORRELATION & REGRESSION Section */}
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
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                      isSelected 
                        ? 'bg-violet-50/80 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/40 shadow-xs' 
                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-zinc-200 border border-transparent'
                    }`}
                  >
                    <Icon size={16} className={isSelected ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Detail Content Panel */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/70 dark:border-zinc-800 p-7 shadow-sm space-y-7">
          
          {/* Dynamic Header of Active Test */}
          <div className="flex items-start gap-3.5 border-b border-slate-100 dark:border-zinc-800 pb-5">
            <div className="p-2 bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 rounded-xl">
              <IconComponent size={20} />
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
          <div className="border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-slate-50/40 dark:bg-zinc-850/30">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700 flex items-center justify-center text-slate-500 dark:text-zinc-400 shadow-sm mb-3">
              <FileText size={20} />
            </div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200">
              Select data range or upload dataset for {activeConfig.label}
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 mb-4">
              Choose columns from your sheet or import a dataset file.
            </p>
            
            <button 
              type="button"
              onClick={() => showToast?.(`Selected active sheet data for ${activeConfig.label}`)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 rounded-xl text-xs font-semibold text-violet-600 dark:text-violet-400 shadow-sm hover:bg-slate-50 transition-all"
            >
              <span>Select Sheet Data</span>
              <ChevronDown size={14} />
            </button>
          </div>

          {/* Dynamic Configuration Form Controls based on selected analysis */}
          {selectedAnalysis === 'descriptive' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* STATISTICS Section */}
              <div>
                <h4 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 mb-3">
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

              {/* DISTRIBUTION Section */}
              <div>
                <h4 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 mb-3">
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

              {/* OPTIONS Section */}
              <div>
                <h4 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Options
                </h4>
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400">Group by</label>
                    <div className="relative">
                      <select 
                        value={groupByColumn}
                        onChange={(e) => setGroupByColumn(e.target.value)}
                        className="w-full appearance-none bg-slate-50/70 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-500 dark:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
                      >
                        <option value="">Select column</option>
                        <option value="ColA">Column A</option>
                        <option value="ColB">Column B</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400">Confidence Level</label>
                    <div className="relative">
                      <select 
                        value={confidenceLevel}
                        onChange={(e) => setConfidenceLevel(e.target.value)}
                        className="w-full appearance-none bg-slate-50/70 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-300 font-semibold focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
                      >
                        <option value="90%">90%</option>
                        <option value="95%">95%</option>
                        <option value="99%">99%</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(selectedAnalysis === 'ttest_ind' || selectedAnalysis === 'ttest_paired' || selectedAnalysis === 'mann_whitney') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-4">
                <h4 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                  Variables / Groups Selection
                </h4>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400">Sample / Variable 1 (Group A)</label>
                  <select value={varA} onChange={(e)=>setVarA(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-200 font-medium">
                    <option value="Column A">Column A (Numerical)</option>
                    <option value="Column B">Column B (Numerical)</option>
                    <option value="Column C">Column C (Numerical)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400">Sample / Variable 2 (Group B)</label>
                  <select value={varB} onChange={(e)=>setVarB(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-200 font-medium">
                    <option value="Column B">Column B (Numerical)</option>
                    <option value="Column A">Column A (Numerical)</option>
                    <option value="Column C">Column C (Numerical)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                  Test Hypothesis & Parameters
                </h4>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400">Alternative Hypothesis</label>
                  <select value={hypothesisType} onChange={(e)=>setHypothesisType(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-200 font-medium">
                    <option value="two_tailed">Two-tailed (Mean 1 ≠ Mean 2)</option>
                    <option value="greater">Greater (Mean 1 &gt; Mean 2)</option>
                    <option value="less">Less (Mean 1 &lt; Mean 2)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400">Confidence Interval</label>
                  <select value={confidenceLevel} onChange={(e)=>setConfidenceLevel(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-200 font-medium">
                    <option value="95%">95% (α = 0.05)</option>
                    <option value="99%">99% (α = 0.01)</option>
                    <option value="90%">90% (α = 0.10)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {selectedAnalysis === 'anova' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-4">
                <h4 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">ANOVA Model Variables</h4>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400">Dependent Variable (Continuous)</label>
                  <select value={varA} onChange={(e)=>setVarA(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-200 font-medium">
                    <option value="Column A">Column A (Score / Outcome)</option>
                    <option value="Column B">Column B (Response Time)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400">Factor Variable (Categorical Groups)</label>
                  <select value={varB} onChange={(e)=>setVarB(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-200 font-medium">
                    <option value="Column B">Column B (Treatment Category)</option>
                    <option value="Column C">Column C (Department)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">Post-Hoc Analysis Options</h4>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400">Post-Hoc Test</label>
                  <select value={postHocTest} onChange={(e)=>setPostHocTest(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-200 font-medium">
                    <option value="tukey">Tukey HSD (Honest Significant Difference)</option>
                    <option value="bonferroni">Bonferroni Correction</option>
                    <option value="scheffe">Scheffé Method</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {selectedAnalysis === 'chisq' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-4">
                <h4 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">Contingency Matrix Input</h4>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400">Row Factor (Variable 1)</label>
                  <select value={varA} onChange={(e)=>setVarA(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-200 font-medium">
                    <option value="Column A">Column A (Category Rows)</option>
                    <option value="Column B">Column B (Gender / Type)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400">Column Factor (Variable 2)</label>
                  <select value={varB} onChange={(e)=>setVarB(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-200 font-medium">
                    <option value="Column B">Column B (Category Columns)</option>
                    <option value="Column C">Column C (Status / Outcome)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
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
              <div className="space-y-4">
                <h4 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">Variables Selection</h4>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400">
                    {selectedAnalysis === 'regression' ? 'Dependent Variable Y (Outcome)' : 'Variable X'}
                  </label>
                  <select value={varA} onChange={(e)=>setVarA(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-200 font-medium">
                    <option value="Column A">Column A (Sales / Metric Y)</option>
                    <option value="Column B">Column B (Metric)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400">
                    {selectedAnalysis === 'regression' ? 'Independent Variable X (Predictor)' : 'Variable Y'}
                  </label>
                  <select value={varB} onChange={(e)=>setVarB(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-200 font-medium">
                    <option value="Column B">Column B (Ad Spend / Predictor X)</option>
                    <option value="Column C">Column C (Feature X2)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">Method & Output Options</h4>
                {selectedAnalysis === 'correlation' ? (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400">Correlation Coefficient</label>
                    <select value={corrMethod} onChange={(e)=>setCorrMethod(e.target.value)} className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-200 font-medium">
                      <option value="pearson">Pearson Correlation Coefficient (r)</option>
                      <option value="spearman">Spearman Rank Correlation (ρ)</option>
                    </select>
                  </div>
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

          {/* Results Output Display Box when Run Analysis is executed */}
          {analysisResults && (
            <div className="p-5 bg-violet-50/60 dark:bg-violet-950/20 border border-violet-200/80 dark:border-violet-800/50 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-violet-800 dark:text-violet-300 flex items-center gap-2">
                  <Check size={14} className="text-violet-600" />
                  {activeConfig.label} Results Output
                </h4>
                <span className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-violet-200 dark:border-violet-800">
                  Computed Live
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(analysisResults).map(([key, value]) => {
                  if (typeof value === 'object' || key === 'error') return null;
                  return (
                    <div key={key} className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-violet-100 dark:border-zinc-800 shadow-2xs">
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
