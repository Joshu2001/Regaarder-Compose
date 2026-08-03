import React, { useState } from 'react';
import { 
  BarChart2, Search, History, FileText, ChevronDown, Check, Play,
  Sigma, GitCommit, Split, ArrowUpDown, Shield, HelpCircle
} from 'lucide-react';

export default function AnalyticsHubUI({ activeSheetGrid, activeSheetId, updateSheetCell, showToast }) {
  const [selectedAnalysis, setSelectedAnalysis] = useState('descriptive');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selection states for statistics checkboxes
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

  const [groupByColumn, setGroupByColumn] = useState('');
  const [confidenceLevel, setConfidenceLevel] = useState('95%');

  const toggleStat = (key) => {
    setSelectedStats(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const hypothesisTests = [
    { id: 'descriptive', label: 'Descriptive Statistics', icon: BarChart2 },
    { id: 'ttest_ind', label: 'Independent T-Test', icon: Split },
    { id: 'anova', label: 'One Way ANOVA', icon: BarChart2 },
    { id: 'chisq', label: 'Chi-Square Test', icon: GitCommit },
    { id: 'ttest_paired', label: 'Paired T-Test', icon: Split },
    { id: 'mann_whitney', label: 'Mann-Whitney U Test', icon: ArrowUpDown }
  ];

  const correlationRegression = [
    { id: 'correlation', label: 'Correlation Analysis', icon: GitCommit },
    { id: 'regression', label: 'Linear Regression', icon: Split }
  ];

  const filteredTests = hypothesisTests.filter(t => t.label.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredCorr = correlationRegression.filter(t => t.label.toLowerCase().includes(searchQuery.toLowerCase()));

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
                    onClick={() => setSelectedAnalysis(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                      isSelected 
                        ? 'bg-violet-50/80 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300' 
                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-zinc-200'
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
                    onClick={() => setSelectedAnalysis(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                      isSelected 
                        ? 'bg-violet-50/80 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300' 
                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-zinc-200'
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
          
          {/* Header of Active Test */}
          <div className="flex items-start gap-3.5 border-b border-slate-100 dark:border-zinc-800 pb-5">
            <div className="p-2 bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 rounded-xl">
              <BarChart2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                Descriptive Statistics
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Summary statistics that describe the main features of your dataset.
              </p>
            </div>
          </div>

          {/* Select Data Range or Upload Dropzone Box */}
          <div className="border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-slate-50/40 dark:bg-zinc-850/30">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700 flex items-center justify-center text-slate-500 dark:text-zinc-400 shadow-sm mb-3">
              <FileText size={20} />
            </div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200">
              Select data range or upload a dataset
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 mb-4">
              Choose a range from your sheet or import a file to get started.
            </p>
            
            <button 
              type="button"
              onClick={() => showToast?.('Data range selector active')}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 rounded-xl text-xs font-semibold text-violet-600 dark:text-violet-400 shadow-sm hover:bg-slate-50 transition-all"
            >
              <span>Select Data</span>
              <ChevronDown size={14} />
            </button>
          </div>

          {/* Configuration Form Controls: STATISTICS, DISTRIBUTION, OPTIONS */}
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
                
                {/* Group by select */}
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

                {/* Confidence Level select */}
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

          {/* Bottom Right Run Analysis Button */}
          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-zinc-800">
            <button 
              type="button"
              onClick={() => showToast?.('Running Descriptive Statistics Analysis...')}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-100/80 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 rounded-xl text-xs font-semibold cursor-not-allowed transition-all"
            >
              <Play size={13} fill="currentColor" />
              <span>Run Analysis</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
