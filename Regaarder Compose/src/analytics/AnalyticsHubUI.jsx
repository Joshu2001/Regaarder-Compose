import React, { useState, useEffect } from 'react';
import { 
  BarChart2, TrendingUp, Settings, ShieldAlert, Check, X, Play, FileSpreadsheet, 
  Sparkles, Lock, AlertCircle, Terminal, User, Clock, Activity, Cpu, Database, HelpCircle
} from 'lucide-react';
import registry from './AnalyticsRegistry';
import { parseGridData, getNumericalColumn } from './AnalyticsModules';

export default function AnalyticsHubUI({ activeSheetGrid, activeSheetId, updateSheetCell, showToast }) {
  const [selectedModule, setSelectedModule] = useState('descriptive_stats');
  const [columnA, setColumnA] = useState(0); // Col 0 is 'A'
  const [columnB, setColumnB] = useState(1); // Col 1 is 'B'
  const [selectedMethod, setSelectedMethod] = useState('random');
  const [sampleCount, setSampleCount] = useState(5);
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);
  const [discountRate, setDiscountRate] = useState(0.08);
  const [runs, setRuns] = useState(250);
  const [stdDev, setStdDev] = useState(0.15);
  const [distType, setDistType] = useState('normal');
  const [distMean, setDistMean] = useState(0);
  const [distStdDev, setDistStdDev] = useState(1);
  const [distX, setDistX] = useState(1.96);
  
  // Results state
  const [results, setResults] = useState(null);
  
  // Agent Simulator state
  const [simulatedAgentId, setSimulatedAgentId] = useState('analytical-agent-01');
  const [simulatedConsoleInput, setSimulatedConsoleInput] = useState('');
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [activeConfirmations, setActiveConfirmations] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Fetch audit logs and confirmations periodically
  useEffect(() => {
    setAuditLogs([...registry.auditLogs]);
    setActiveConfirmations([...registry.pendingConfirmations]);
  }, [results]);

  // Generate column labels for selector (e.g. A, B, C, D...)
  const numColumns = activeSheetGrid?.cols || 10;
  const colLabels = Array.from({ length: numColumns }, (_, i) => {
    return String.fromCharCode(65 + i);
  });

  // Pull parsed data from the grid
  const getParsedGridData = () => {
    if (!activeSheetGrid || !activeSheetGrid.cells) return [];
    return parseGridData(activeSheetGrid.cells);
  };

  // Populate sample test data into sheet
  const loadDemoData = (type) => {
    let rowsToInsert = [];
    if (type === 'stats') {
      rowsToInsert = [
        ['Score', 'Sales ($)'],
        [85, 12000],
        [90, 15000],
        [78, 9800],
        [92, 16200],
        [88, 14000],
        [84, 11500],
        [76, 9500],
        [95, 18000],
        [89, 13800],
        [82, 11000]
      ];
    } else if (type === 'ttest') {
      rowsToInsert = [
        ['Group A', 'Group B'],
        [102, 95],
        [108, 98],
        [115, 105],
        [101, 92],
        [98, 90],
        [112, 100],
        [105, 96],
        [109, 101],
        [104, 94],
        [110, 99]
      ];
    } else if (type === 'cashflow') {
      rowsToInsert = [
        ['Year', 'Cashflows'],
        [0, -50000],
        [1, 15000],
        [2, 20000],
        [3, 25000],
        [4, 30000]
      ];
    }

    if (rowsToInsert.length > 0) {
      // Write sample rows into grid cells
      rowsToInsert.forEach((row, rIdx) => {
        row.forEach((val, cIdx) => {
          updateSheetCell(activeSheetId, rIdx, cIdx, val.toString());
        });
      });
      showToast(`Sample "${type}" data populated in cols A and B!`);
    }
  };

  const handleRunAnalysis = async () => {
    const gridData = getParsedGridData();
    if (gridData.length < 2) {
      showToast('Spreadsheet grid must contain numerical data rows.');
      return;
    }

    try {
      let runResult;
      const colAData = getNumericalColumn(gridData, columnA, true);
      const colBData = getNumericalColumn(gridData, columnB, true);

      if (selectedModule === 'descriptive_stats') {
        runResult = registry.plugins.get('descriptive_stats').execute(colAData);
      } else if (selectedModule === 't_test') {
        runResult = registry.plugins.get('t_test').execute({ groupA: colAData, groupB: colBData });
      } else if (selectedModule === 'anova') {
        runResult = registry.plugins.get('anova').execute([colAData, colBData]);
      } else if (selectedModule === 'chi_square') {
        // Chi-Square expects a contingency table (e.g. 2D array of counts)
        const observed = gridData.slice(1).map(row => [row[columnA], row[columnB]].filter(val => typeof val === 'number'));
        runResult = registry.plugins.get('chi_square').execute(observed.filter(row => row.length === 2));
      } else if (selectedModule === 'correlation') {
        runResult = registry.plugins.get('correlation').execute({ x: colAData, y: colBData });
      } else if (selectedModule === 'regression') {
        runResult = registry.plugins.get('regression').execute({ x: colAData, y: colBData });
      } else if (selectedModule === 'forecasting') {
        runResult = registry.plugins.get('forecasting').execute(colAData, { periods: 3 });
      } else if (selectedModule === 'financial_modeling') {
        runResult = registry.plugins.get('financial_modeling').execute(colBData, { discountRate });
      } else if (selectedModule === 'monte_carlo') {
        const lastVal = colAData[colAData.length - 1] || 100;
        runResult = registry.plugins.get('monte_carlo').execute(null, { baseValue: lastVal, stdDev, runs });
      } else if (selectedModule === 'probability_distributions') {
        runResult = registry.plugins.get('probability_distributions').execute(null, { 
          distType, 
          distParams: { mean: distMean, stdDev: distStdDev, x: distX, n: 10, p: 0.5, k: 3, lambda: 2 } 
        });
      } else if (selectedModule === 'risk_analysis') {
        // Assume returns are computed from historical levels
        const returns = [];
        for (let i = 1; i < colAData.length; i++) {
          returns.push((colAData[i] - colAData[i-1]) / (colAData[i-1] || 1));
        }
        runResult = registry.plugins.get('risk_analysis').execute(returns, { confidenceLevel });
      } else if (selectedModule === 'portfolio_analysis') {
        const weights = [{ weight: 0.5, meanReturn: 0.08 }, { weight: 0.5, meanReturn: 0.12 }];
        const covariance = [[0.04, 0.01], [0.01, 0.09]];
        runResult = registry.plugins.get('portfolio_analysis').execute({ weights, covariance });
      } else if (selectedModule === 'data_sampling') {
        runResult = registry.plugins.get('data_sampling').execute(colAData, { method: selectedMethod, count: sampleCount });
      } else if (selectedModule === 'ai_analytical_insights') {
        // AI tool execution flow
        const sumText = `Analysis of column A: count=${colAData.length}, average=${(colAData.reduce((a,b)=>a+b,0)/(colAData.length||1)).toFixed(2)}`;
        runResult = await registry.callAgentTool('analytical-agent-01', 'ai_analytical_insights', {
          options: { summary: sumText }
        });
        runResult = runResult.data;
      }

      setResults(runResult);
      showToast('Analysis completed successfully!');
    } catch (e) {
      setResults({ error: e.message });
      showToast('Analysis failed: ' + e.message);
    }
  };

  // Simulates an AI Agent calling a tool from the console input
  const executeSimulatedAgentTool = async () => {
    if (!simulatedConsoleInput.trim()) return;
    const parts = simulatedConsoleInput.split(' ');
    const toolId = parts[0];
    const gridData = getParsedGridData();
    const colAData = getNumericalColumn(gridData, 0, true);

    const logConsole = (msg, level = 'info') => {
      setConsoleLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), text: msg, level }]);
    };

    logConsole(`Agent [${simulatedAgentId}] invoking tool: ${toolId}...`);

    try {
      let params = { data: colAData };
      if (toolId === 't_test') {
        const colBData = getNumericalColumn(gridData, 1, true);
        params = { data: { groupA: colAData, groupB: colBData } };
      } else if (toolId === 'regression' || toolId === 'correlation') {
        const colBData = getNumericalColumn(gridData, 1, true);
        params = { data: { x: colAData, y: colBData } };
      } else if (toolId === 'monte_carlo') {
        params = { options: { baseValue: 100, stdDev: 0.15 } };
      } else if (toolId === 'ai_analytical_insights') {
        params = { options: { summary: 'Console analytical run' } };
      }

      // Execute through registry
      const response = await registry.callAgentTool(simulatedAgentId, toolId, params);
      logConsole(`Execution SUCCESS: ${JSON.stringify(response.data).substring(0, 100)}...`, 'success');
      setResults(response.data);
    } catch (e) {
      logConsole(`Execution ERROR: ${e.message}`, 'error');
    }

    setSimulatedConsoleInput('');
    setAuditLogs([...registry.auditLogs]);
    setActiveConfirmations([...registry.pendingConfirmations]);
  };

  return (
    <div className="flex-1 bg-[#FAFAFC] dark:bg-[#121214] flex flex-col min-h-0 font-sans p-6 overflow-y-auto thin-scrollbar">
      
      {/* Header and Summary */}
      <div className="flex items-start justify-between border-b border-slate-200/80 dark:border-zinc-800 pb-5 mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-zinc-100 flex items-center gap-2">
            <Cpu className="text-violet-600 dark:text-violet-400" size={22} />
            Modular Analytics Workspace
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5">
            Configure statistical tests, sensitivity projections, and Monte Carlo runs on active grid data. Exposes plugin tools to AI agents securely.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button" 
            onClick={() => loadDemoData('stats')}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm transition-all"
          >
            Load Stats Demo
          </button>
          <button 
            type="button" 
            onClick={() => loadDemoData('ttest')}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm transition-all"
          >
            Load Group T-Test Demo
          </button>
          <button 
            type="button" 
            onClick={() => loadDemoData('cashflow')}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm transition-all"
          >
            Load Cashflows Demo
          </button>
        </div>
      </div>

      {/* Main Grid Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Configuration Controls */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1c1c1e] rounded-2xl border border-slate-100 dark:border-zinc-800 p-5 shadow-sm space-y-5">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400">Select Analytics Module</h3>
          
          <div className="space-y-1">
            {Array.from(registry.plugins.entries()).map(([id, plugin]) => (
              <button
                key={id}
                type="button"
                onClick={() => { setSelectedModule(id); setResults(null); }}
                className={`w-full flex items-center justify-between text-left px-3.5 py-2.5 rounded-xl transition-all text-xs font-medium ${selectedModule === id ? 'bg-transparent text-[#7C4DFF] outline outline-[2px] outline-[#7C4DFF] border-transparent' : 'text-slate-600 hover:bg-slate-50 dark:hover:bg-white/5'}`}
              >
                <span>{plugin.name}</span>
                <span className="text-[10px] text-slate-400 font-normal">{plugin.category}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-slate-100 dark:border-zinc-800 pt-4 space-y-4">
            <h4 className="text-xs font-bold text-slate-700">Parameters</h4>

            {/* Column A Picker */}
            {['descriptive_stats', 't_test', 'anova', 'chi_square', 'correlation', 'regression', 'forecasting', 'monte_carlo', 'risk_analysis', 'data_sampling'].includes(selectedModule) && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-500">Variable 1 Column (X Axis / Group A)</label>
                <select 
                  value={columnA} 
                  onChange={(e) => setColumnA(parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500"
                >
                  {colLabels.map((lbl, idx) => (
                    <option key={lbl} value={idx}>Column {lbl}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Column B Picker */}
            {['t_test', 'anova', 'chi_square', 'correlation', 'regression'].includes(selectedModule) && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-500">Variable 2 Column (Y Axis / Group B)</label>
                <select 
                  value={columnB} 
                  onChange={(e) => setColumnB(parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500"
                >
                  {colLabels.map((lbl, idx) => (
                    <option key={lbl} value={idx}>Column {lbl}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Forecasting & Financial Settings */}
            {selectedModule === 'financial_modeling' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-500">Discount Rate (e.g. 0.08 = 8%)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={discountRate} 
                  onChange={(e) => setDiscountRate(parseFloat(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none"
                />
              </div>
            )}

            {/* Monte Carlo Settings */}
            {selectedModule === 'monte_carlo' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-500">Runs</label>
                  <input 
                    type="number" 
                    value={runs} 
                    onChange={(e) => setRuns(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-500">Volatility (std dev)</label>
                  <input 
                    type="number" 
                    step="0.05"
                    value={stdDev} 
                    onChange={(e) => setStdDev(parseFloat(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700"
                  />
                </div>
              </div>
            )}

            {/* Sampling Settings */}
            {selectedModule === 'data_sampling' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-500">Sample Method</label>
                  <select 
                    value={selectedMethod} 
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700"
                  >
                    <option value="random">Random</option>
                    <option value="systematic">Systematic</option>
                    <option value="stratified">Stratified</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-500">Sample Count</label>
                  <input 
                    type="number" 
                    value={sampleCount} 
                    onChange={(e) => setSampleCount(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700"
                  />
                </div>
              </div>
            )}

            {/* Probability Distributions Settings */}
            {selectedModule === 'probability_distributions' && (
              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-500">Distribution Type</label>
                  <select 
                    value={distType} 
                    onChange={(e) => setDistType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-slate-700"
                  >
                    <option value="normal">Normal</option>
                    <option value="binomial">Binomial</option>
                    <option value="poisson">Poisson</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-slate-500">Mean / Lambda / p</label>
                    <input type="number" step="0.1" value={distMean} onChange={(e) => setDistMean(parseFloat(e.target.value))} className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs text-slate-700" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-slate-500">Std Dev / n / k</label>
                    <input type="number" step="0.1" value={distStdDev} onChange={(e) => setDistStdDev(parseFloat(e.target.value))} className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs text-slate-700" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-slate-500">Value (X / k)</label>
                  <input type="number" step="0.1" value={distX} onChange={(e) => setDistX(parseFloat(e.target.value))} className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs text-slate-700" />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleRunAnalysis}
              className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-all mt-4"
            >
              <Play size={13} fill="currentColor" /> Run Calculation
            </button>
          </div>
        </div>

        {/* Right Side: Results Display */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-slate-100 dark:border-zinc-800 p-5 shadow-sm min-h-[360px] flex flex-col">
            <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-4">Results Output</h3>

            {results ? (
              results.error ? (
                <div className="flex items-center gap-3 bg-red-50 text-red-700 rounded-xl p-4 text-xs font-medium">
                  <AlertCircle size={16} />
                  <span>Error running calculation: {results.error}</span>
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-6">
                  {/* Generic Summary table */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {Object.entries(results).map(([key, value]) => {
                      if (typeof value === 'number') {
                        return (
                          <div key={key} className="bg-slate-50 dark:bg-white/5 rounded-xl p-3.5 border border-slate-100 dark:border-zinc-800">
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1')}</div>
                            <div className="text-lg font-bold text-slate-800 dark:text-zinc-100 mt-1">{value.toFixed(4)}</div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>

                  {/* Render Custom visualizer charts depending on output */}
                  {selectedModule === 'regression' && results.slope !== undefined && (
                    <div className="border border-slate-200 dark:border-zinc-800 rounded-xl p-4 bg-slate-50/50 dark:bg-white/5 flex flex-col items-center">
                      <div className="text-xs font-bold text-slate-700 mb-3">Regression Line Trend & Scatter</div>
                      <svg width="320" height="180" className="overflow-visible">
                        <line x1="30" y1="150" x2="300" y2="150" stroke="#94a3b8" strokeWidth="1.5" />
                        <line x1="30" y1="20" x2="30" y2="150" stroke="#94a3b8" strokeWidth="1.5" />
                        {/* Trend line */}
                        <line x1="35" y1="130" x2="280" y2="40" stroke="#7c3aed" strokeWidth="2.5" />
                        {/* Dot scatter scatter */}
                        <circle cx="60" cy="115" r="4" fill="#3b82f6" />
                        <circle cx="100" cy="110" r="4" fill="#3b82f6" />
                        <circle cx="150" cy="85" r="4" fill="#3b82f6" />
                        <circle cx="210" cy="72" r="4" fill="#3b82f6" />
                        <circle cx="250" cy="45" r="4" fill="#3b82f6" />
                      </svg>
                      <span className="text-[11px] text-slate-500 font-mono mt-3">Trend formula: {results.formula}</span>
                    </div>
                  )}

                  {selectedModule === 'monte_carlo' && results.paths && (
                    <div className="border border-slate-200 dark:border-zinc-800 rounded-xl p-4 bg-slate-50/50 dark:bg-white/5 flex flex-col items-center">
                      <div className="text-xs font-bold text-slate-700 mb-3">Simulated Random Walks paths (Monte Carlo)</div>
                      <svg width="360" height="160" className="overflow-visible">
                        <line x1="30" y1="140" x2="330" y2="140" stroke="#cbd5e1" />
                        <line x1="30" y1="20" x2="30" y2="140" stroke="#cbd5e1" />
                        {/* Simulation path lines */}
                        {results.paths.map((path, idx) => (
                          <polyline
                            key={idx}
                            fill="none"
                            stroke={idx === 0 ? '#10b981' : '#8b5cf6'}
                            strokeWidth={idx === 0 ? 2 : 1}
                            strokeOpacity={idx === 0 ? 1 : 0.45}
                            points={path.map((val, step) => `${30 + step * 25},${140 - (val / results.endingValuesSummary.median) * 60}`).join(' ')}
                          />
                        ))}
                      </svg>
                    </div>
                  )}

                  {/* Sampled data display */}
                  {selectedModule === 'data_sampling' && Array.isArray(results) && (
                    <div className="border border-slate-100 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-slate-50 text-slate-600 px-4 py-2 text-xs font-semibold">Sampled Data Subsets</div>
                      <div className="bg-white dark:bg-transparent divide-y divide-slate-100 text-xs px-4 py-3">
                        {results.map((val, idx) => (
                          <div key={idx} className="py-2.5 text-slate-700 flex justify-between">
                            <span className="font-semibold text-slate-400">Sample #{idx+1}</span>
                            <span>{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI insights sparks */}
                  {selectedModule === 'ai_analytical_insights' && results.insight && (
                    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/10 border border-violet-100 dark:border-violet-900/50 rounded-2xl p-5 relative overflow-hidden shadow-sm">
                      <div className="absolute top-0 right-0 p-3 opacity-20">
                        <Sparkles size={40} className="text-violet-600" />
                      </div>
                      <h4 className="text-xs font-bold text-violet-800 dark:text-violet-400 flex items-center gap-1.5 tracking-wide uppercase">
                        <Sparkles size={14} className="text-violet-600" />
                        AI Analysis Recommendations
                      </h4>
                      <p className="text-xs text-violet-900 dark:text-zinc-200 mt-2.5 leading-relaxed font-medium">
                        {results.insight}
                      </p>
                      <div className="flex items-center gap-4 mt-4 text-[11px] font-semibold text-violet-700">
                        <span>Confidence: {(results.confidenceScore*100).toFixed(0)}%</span>
                        <span className="px-2 py-0.5 bg-violet-100 rounded-full">Rec: {results.reco}</span>
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-50 dark:bg-white/5 rounded-xl px-4 py-3 text-[11px] text-slate-500 font-mono">
                    Analysis executed successfully at {new Date().toLocaleTimeString()}
                  </div>
                </div>
              )
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <Database size={40} className="text-slate-300 dark:text-zinc-700 mb-3" />
                <p className="text-xs font-semibold text-slate-500">Configure parameters and click "Run Calculation" to compute results.</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs">Ensure sample data is loaded first if your spreadsheet grid is empty.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECURE AI AGENT TOOL CONSOLE */}
      <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-5 shadow-2xl mt-8 font-mono text-[12px] text-zinc-400">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="text-emerald-500" size={16} />
            <span className="font-bold text-zinc-200 tracking-tight">AI Agent secure call logs</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-zinc-800 rounded-full text-[10px] text-emerald-400 font-semibold border border-zinc-700 animate-pulse">
              <Activity size={10} /> Active Listening Mode
            </span>
          </div>
        </div>

        {/* Sensitive Action Approval Alerts */}
        {activeConfirmations.length > 0 && (
          <div className="bg-violet-950/30 border border-violet-800 rounded-xl p-4 mb-4 animate-in fade-in zoom-in-95 duration-200">
            {activeConfirmations.map((conf) => (
              <div key={conf.id} className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-violet-300 font-bold text-xs">
                    <ShieldAlert size={14} /> Agent Call Authorization Request
                  </div>
                  <p className="text-zinc-200 text-xs mt-1.5 leading-relaxed">{conf.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    type="button" 
                    onClick={() => { conf.confirm(); handleRunAnalysis(); }}
                    className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-[11px] font-bold shadow transition-all"
                  >
                    Confirm & Execute
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { conf.cancel(); handleRunAnalysis(); }}
                    className="px-3 py-1.5 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-lg text-[11px] font-bold transition-all"
                  >
                    Block Action
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Command Runner input */}
        <div className="flex items-center gap-2 border border-zinc-800 bg-zinc-950 rounded-xl px-3 py-2.5 mb-5 focus-within:border-violet-500/80 transition-colors">
          <span className="text-violet-500 font-bold shrink-0">$ simulated-agent ~ execute</span>
          <input
            type="text"
            value={simulatedConsoleInput}
            onChange={(e) => setSimulatedConsoleInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && executeSimulatedAgentTool()}
            placeholder="Type tool name (e.g. descriptive_stats, t_test, regression) and press Enter"
            className="flex-1 bg-transparent border-none outline-none text-zinc-100 placeholder-zinc-600 font-normal focus:ring-0 focus:outline-none"
          />
        </div>

        {/* Audit Logs Table */}
        <div className="space-y-2 mt-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Audit Logs</div>
          <div className="max-h-[140px] overflow-y-auto thin-scrollbar divide-y divide-zinc-800 bg-zinc-950/50 rounded-xl border border-zinc-800 px-3">
            {auditLogs.length > 0 ? (
              auditLogs.map((log, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-zinc-500 font-mono text-[10px]">{log.timestamp.substr(11, 8)}</span>
                    <span className="text-violet-400 font-semibold truncate max-w-[120px]">{log.agentId}</span>
                    <span className="text-zinc-300 font-mono">{log.toolId}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 font-semibold">
                    <span className="text-zinc-500 max-w-[200px] truncate font-normal">{log.details}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] ${log.status === 'SUCCESS' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/30' : 'bg-red-950/50 text-red-400 border border-red-900/30'}`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-zinc-600 text-xs">No active agent actions logged. Run calculations or type tool commands to initiate.</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
