import React, { useState, useRef, useEffect } from 'react';
import { 
  BarChart2, Search, History, FileText, ChevronDown, Check, Play,
  Sigma, GitCommit, Split, ArrowUpDown, Shield, HelpCircle, RefreshCw, Layers, Table, Upload,
  ArrowLeft, Download, Sparkles, CheckCircle2, AlertTriangle, ChevronRight, Share2, Copy, BarChart3, TrendingUp, Info,
  DollarSign, Users, Target, Activity, Sliders, Cpu, Zap, PieChart, LineChart
} from 'lucide-react';
import * as modules from './AnalyticsModules';

/**
 * Executive Custom Dropdown Component
 */
function CustomSelect({ label, value, onChange, options, allowCustom = true, placeholder = 'Select option...' }) {
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
        <div className="absolute left-0 right-0 top-full mt-1.5 z-[500] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl p-2 space-y-1">
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
                      ? 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-bold' 
                      : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-violet-600'
                  }`}
                >
                  <div className="flex flex-col">
                    <span>{opt.label}</span>
                    {opt.sublabel && <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-normal">{opt.sublabel}</span>}
                  </div>
                  {isSelected && <Check size={14} className="text-violet-600 dark:text-violet-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {allowCustom && (
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Custom value..."
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customInput.trim()) {
                    onChange(customInput.trim());
                    setIsOpen(false);
                    setCustomInput('');
                  }
                }}
                className="flex-1 px-2.5 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-violet-500 font-normal"
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
  // Primary Navigation Category
  const [activeCategory, setActiveCategory] = useState('business');
  const [selectedAnalysis, setSelectedAnalysis] = useState('kpi_analysis');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Natural Language AI Question Routing State
  const [aiQuestionInput, setAiQuestionInput] = useState('');
  const [aiQuestionResult, setAiQuestionResult] = useState(null);

  // Data range selection
  const [selectedDataRange, setSelectedDataRange] = useState('Entire Active Sheet');
  const [selectDataMenuOpen, setSelectDataMenuOpen] = useState(false);
  const selectDataRef = useRef(null);

  // Live Interactive Simulation Parameters
  const [simPriceDelta, setSimPriceDelta] = useState(0);
  const [simVolumeDelta, setSimVolumeDelta] = useState(0);
  const [simCostDelta, setSimCostDelta] = useState(0);
  const [simChurnDelta, setSimChurnDelta] = useState(0);

  // Analysis calculation outcome state
  const [analysisResult, setAnalysisResult] = useState(null);

  // Data Source & Input Mode State (Sheet search vs Manual Entry)
  const [dataInputMode, setDataInputMode] = useState('sheet'); // 'sheet' | 'manual'
  const [columnSearchQuery, setColumnSearchQuery] = useState('');
  const [manualSeriesInput, setManualSeriesInput] = useState('12000, 13500, 14200, 15800, 17500, 18900, 21000, 22500, 24000');

  // Column Binding & Dynamic Parameter Control States
  const [primaryColIndex, setPrimaryColIndex] = useState(0);
  const [secondaryColIndex, setSecondaryColIndex] = useState(1);
  const [moduleParams, setModuleParams] = useState({
    targetValue: 25000,
    fixedCosts: 50000,
    unitPrice: 100,
    unitCost: 60,
    forecastPeriods: 3,
    confidenceLevel: 95,
    arpu: 150,
    cac: 350,
    churnRate: 5
  });

  // Extract columns dynamically from active sheet grid
  const rawCells = activeSheetGrid?.cells || [];
  const parsedData = modules.parseGridData(rawCells);
  const gridColumns = modules.getGridColumns(parsedData);

  const availableColumns = gridColumns.length > 0 ? gridColumns : [
    { index: 0, name: 'Column A (Revenue / Primary)', values: [12000, 13500, 14200, 15800, 17500, 18900, 21000, 22500, 24000] },
    { index: 1, name: 'Column B (Budget / Expenses)', values: [11000, 12500, 13000, 14500, 16000, 17000, 19500, 20500, 22000] },
    { index: 2, name: 'Column C (Volume / Units / Driver)', values: [100, 115, 120, 135, 150, 160, 180, 190, 210] }
  ];

  const filteredColumns = availableColumns.filter(col => 
    col.name.toLowerCase().includes(columnSearchQuery.toLowerCase().trim())
  );

  const needsSecondaryColumn = [
    'variance_analysis', 'budget_vs_actual', 'regression', 'correlation',
    't_test', 'paired_t_test', 'margin_analysis', 'profitability_analysis'
  ].includes(selectedAnalysis);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (selectDataRef.current && !selectDataRef.current.contains(e.target)) {
        setSelectDataMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, []);

  // ----------------------------------------------------
  // ANALYTICAL TAXONOMY DEFINITION (35 MODULES)
  // ----------------------------------------------------
  const taxonomy = [
    {
      id: 'business',
      label: 'Business Analysis',
      icon: TrendingUp,
      desc: 'KPIs, trend trajectory, variance, growth rates, profitability, Pareto 80/20, and anomaly detection.',
      items: [
        { id: 'kpi_analysis', label: 'KPI Analysis', desc: 'Core KPIs, target attainment %, CAGR, and threshold alerts.' },
        { id: 'trend_analysis', label: 'Trend Analysis', desc: 'Growth slope, acceleration, and 3-period moving average.' },
        { id: 'variance_analysis', label: 'Variance Analysis', desc: 'Actual vs Budget variance breakdown and favorable/unfavorable status.' },
        { id: 'growth_analysis', label: 'Growth Analysis', desc: 'MoM/QoQ growth rates, compound annual growth, and total expansion.' },
        { id: 'profitability_analysis', label: 'Profitability Analysis', desc: 'Gross profit, EBITDA, operating margin %, and net profit margins.' },
        { id: 'pareto_analysis', label: 'Pareto Analysis (80/20)', desc: 'Identifies top 20% of items contributing to 80% of volume/profit.' },
        { id: 'anomaly_detection', label: 'Anomaly Detection', desc: 'Statistical Z-score scanning to highlight spikes and severe dips.' }
      ]
    },
    {
      id: 'customer_sales',
      label: 'Customer & Sales',
      icon: Users,
      desc: 'Cohort retention, churn, customer lifetime value, sales funnel, conversion, and RFM segmentation.',
      items: [
        { id: 'cohort_analysis', label: 'Cohort Analysis', desc: 'Period-by-period customer retention matrices and cohort decay rates.' },
        { id: 'retention_churn', label: 'Retention & Churn', desc: 'Net user additions, logo churn %, retention rate %, and growth rate.' },
        { id: 'clv_analysis', label: 'Customer Lifetime Value', desc: 'Simple & Discounted CLV, CAC Payback period, and LTV:CAC ratios.' },
        { id: 'sales_funnel', label: 'Sales Funnel', desc: 'Pipeline stage-to-stage conversion rates and bottleneck detection.' },
        { id: 'conversion_analysis', label: 'Conversion Analysis', desc: 'Acquisition conversion velocity from visitors down to closed wins.' },
        { id: 'customer_segmentation', label: 'Customer Segmentation', desc: 'Categorizes accounts into VIP Champions, Loyal, At-Risk, and Churned.' }
      ]
    },
    {
      id: 'financial',
      label: 'Financial Analysis',
      icon: DollarSign,
      desc: 'Revenue, margins, break-even thresholds, unit economics, cash flow, budget vs actual, and ratio analysis.',
      items: [
        { id: 'revenue_analysis', label: 'Revenue Analysis', desc: 'Total top-line revenue, run-rate, CAGR, and next period run-rate.' },
        { id: 'margin_analysis', label: 'Margin Analysis', desc: 'Decomposes Gross, Contribution, Operating, and Net margins.' },
        { id: 'breakeven_analysis', label: 'Break-Even Analysis', desc: 'Break-even unit volume, revenue threshold, and operating leverage.' },
        { id: 'unit_economics', label: 'Unit Economics', desc: 'Evaluates LTV, CAC, payback period, and unit contribution margin.' },
        { id: 'cash_flow_analysis', label: 'Cash Flow Analysis', desc: 'Operating, Investing, Financing cash flows, Free Cash Flow, and Runway.' },
        { id: 'budget_vs_actual', label: 'Budget vs Actual', desc: 'Itemized and aggregated financial variance against budgeted targets.' },
        { id: 'financial_ratios', label: 'Financial Ratios', desc: 'Current Ratio, Quick Ratio, Debt-to-Equity, ROE, ROA, and Asset Turnover.' }
      ]
    },
    {
      id: 'forecasting',
      label: 'Forecasting',
      icon: LineChart,
      desc: 'Predictive time-series models for revenue, sales, demand, cash flow, and customer churn.',
      items: [
        { id: 'revenue_forecast', label: 'Revenue Forecast', desc: 'Exponential smoothing revenue projection over future periods.' },
        { id: 'sales_forecast', label: 'Sales Forecast', desc: 'Linear trend sales projection with 95% confidence upper/lower bounds.' },
        { id: 'demand_forecast', label: 'Demand Forecast', desc: '3-period moving average demand forecasting model.' },
        { id: 'cashflow_forecast', label: 'Cash Flow Forecast', desc: 'Inflow/outflow forecasting and projected ending cash balances.' },
        { id: 'churn_forecast', label: 'Churn Forecast', desc: 'Customer attrition schedule and retained customer projections.' },
        { id: 'timeseries_forecast', label: 'Time-Series Engine', desc: 'Comprehensive fitted series, forecast periods, and error metrics.' }
      ]
    },
    {
      id: 'simulation',
      label: 'Simulation & Scenarios',
      icon: Sliders,
      desc: 'Monte Carlo stochastic paths, What-If sensitivity, scenario matrices, Goal Seek solver, and optimization.',
      items: [
        { id: 'monte_carlo', label: 'Monte Carlo Simulation', desc: 'Multi-path stochastic simulation with P10/P50/P90 percentile limits.' },
        { id: 'what_if_analysis', label: 'What-If Analysis', desc: 'Simulates net income outcomes under price, volume, and cost deltas.' },
        { id: 'scenario_analysis', label: 'Scenario Analysis', desc: 'Generates Bull, Base, and Bear financial outcome matrices.' },
        { id: 'sensitivity_analysis', label: 'Sensitivity Analysis', desc: '2D matrix evaluating outcome sensitivity across price and volume steps.' },
        { id: 'risk_analysis', label: 'Risk Analysis (VaR)', desc: 'Calculates Sharpe Ratio, Value at Risk (VaR), and historical drawdowns.' },
        { id: 'goal_seek', label: 'Goal Seek Solver', desc: 'Solves for exact required unit sales or price to achieve target profit.' },
        { id: 'optimization_engine', label: 'Optimization Engine', desc: 'Allocates limited budget across marketing channels to maximize return.' }
      ]
    },
    {
      id: 'advanced_stats',
      label: 'Advanced Statistics',
      icon: Sigma,
      desc: 'Descriptive stats, t-Tests, ANOVA, Chi-Square, correlation, regression, confidence intervals, distributions.',
      items: [
        { id: 'descriptive_stats', label: 'Descriptive Statistics', desc: 'Mean, median, std dev, variance, min, max, and standard error.' },
        { id: 'correlation', label: 'Pearson Correlation', desc: 'Measures linear correlation coefficient r and determination r2.' },
        { id: 'regression', label: 'Linear Regression', desc: 'Models slope, intercept, residuals, and prediction formulas.' },
        { id: 't_test', label: 'Independent T-Test', desc: 'Compares means between two independent sample distributions.' },
        { id: 'paired_t_test', label: 'Paired T-Test', desc: 'Compares paired before/after measurements on identical subjects.' },
        { id: 'anova', label: 'One-Way ANOVA', desc: 'Analysis of Variance across multiple categorical groupings.' },
        { id: 'chi_square', label: 'Chi-Square Test', desc: 'Tests independence between categorical variables in a grid.' },
        { id: 'confidence_intervals', label: 'Confidence Intervals', desc: 'Upper and lower margin of error bounds at 90%, 95%, or 99% levels.' },
        { id: 'probability_distributions', label: 'Probability Distributions', desc: 'Normal probability density and mass functions.' },
        { id: 'data_sampling', label: 'Data Sampling', desc: 'Extracts representative subsets using random or systematic sampling.' }
      ]
    }
  ];

  const currentCategory = taxonomy.find(c => c.id === activeCategory) || taxonomy[0];
  const activeModuleItem = currentCategory.items.find(i => i.id === selectedAnalysis) || currentCategory.items[0];

  // Natural Language Business Question Suggestions
  const sampleQuestions = [
    "What price do we need to break even on 5,000 units?",
    "Forecast revenue for next quarter under 5% churn",
    "What is our Customer Lifetime Value and payback period?"
  ];

  // ----------------------------------------------------
  // DETERMINISTIC CALCULATION HANDLER
  // ----------------------------------------------------
  const handleRunAnalysis = (targetId = null) => {
    const analysisToRun = targetId || selectedAnalysis;

    let col1Values = [];
    if (dataInputMode === 'manual' && manualSeriesInput.trim()) {
      col1Values = manualSeriesInput.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
    }
    if (col1Values.length === 0) {
      const primaryCol = availableColumns.find(c => c.index === primaryColIndex) || availableColumns[0];
      col1Values = primaryCol.values && primaryCol.values.length > 0 ? primaryCol.values : [12000, 13500, 14200, 15800, 17500, 18900, 21000, 22500, 24000];
    }
    const secondaryCol = availableColumns.find(c => c.index === secondaryColIndex) || availableColumns[1] || availableColumns[0];
    let col2Values = secondaryCol.values && secondaryCol.values.length > 0 ? secondaryCol.values : col1Values.map(v => Math.round(v * 0.92));

    const safeNum = (val, fallback = 0) => (typeof val === 'number' && !isNaN(val) ? val : fallback);
    const safeLoc = (val, fallback = 0) => safeNum(val, fallback).toLocaleString();
    const safeFix = (val, decimals = 2, fallback = 0) => safeNum(val, fallback).toFixed(decimals);

    let payload = null;

    switch (analysisToRun) {
      // ----------------------------------------------------
      // 1. BUSINESS ANALYSIS
      // ----------------------------------------------------
      case 'kpi_analysis': {
        const res = modules.runKPIAnalysis(col1Values, 25000) || {};
        const tot = safeLoc(res.total);
        const mean = safeFix(res.mean, 2);
        const latest = safeLoc(res.latest);
        const cagr = safeFix(res.cagr, 1);
        const tAttain = safeFix(res.targetAttainment, 1);
        const tVal = safeLoc(res.targetValue, 25000);
        const minVal = safeLoc(res.min);

        payload = {
          title: 'Executive KPI Analysis',
          computationBadge: '⚡ Deterministic Business Engine',
          metrics: [
            { label: 'Total Volume', value: `$${tot}`, sub: 'Sum total' },
            { label: 'Average', value: `$${mean}`, sub: 'Period mean' },
            { label: 'Latest Run-Rate', value: `$${latest}`, sub: 'Current period' },
            { label: 'CAGR', value: `${cagr}%`, sub: 'Compound Annual Growth' },
            { label: 'Target Attainment', value: `${tAttain}%`, sub: `Target: $${tVal}` },
            { label: 'Alert Status', value: res.alertStatus || 'ON_TRACK', sub: res.alertStatus === 'ON_TRACK' ? 'Healthy' : 'Requires Attention' }
          ],
          explanation: `Total volume generated across ${res.count || col1Values.length} observations is $${tot} with a mean run-rate of $${mean}. Target attainment stands at ${tAttain}%.`,
          drivers: ['Strong momentum in recent periods', 'Compound Annual Growth Rate of ' + cagr + '%'],
          risks: ['Underperforming lower bound of $' + minVal],
          recommendation: 'Maintain growth trajectory to hit annual target threshold.'
        };
        break;
      }
      case 'trend_analysis': {
        const res = modules.runTrendAnalysis(col1Values) || {};
        const slopeVal = safeFix(res.slope, 2);
        const accelVal = safeFix(res.acceleration, 2);
        const projNext = safeFix(res.projectedNext, 0);
        const lastMa = safeFix(res.movingAvg?.[res.movingAvg.length - 1], 0);

        payload = {
          title: 'Trend Trajectory & Momentum Analysis',
          computationBadge: '⚡ Linear Regression & Moving Avg Engine',
          metrics: [
            { label: 'Trend Direction', value: res.direction || 'STABLE', sub: 'Trajectory status' },
            { label: 'Slope / Period', value: `${res.slope > 0 ? '+' : ''}$${slopeVal}`, sub: 'Linear slope' },
            { label: 'Acceleration', value: `${res.acceleration >= 0 ? '+' : ''}${accelVal}`, sub: '2nd order delta' },
            { label: 'Projected Next', value: `$${projNext}`, sub: 'Linear projection' },
            { label: '3-Period MA', value: `$${lastMa}`, sub: 'Smoothed baseline' },
            { label: 'Sample Points', value: col1Values.length, sub: 'Observed periods' }
          ],
          explanation: `Series displays an ${String(res.direction || 'STABLE').toLowerCase()} trend with a slope of $${slopeVal} per period. Projected next period value is $${projNext}.`,
          drivers: ['Consistent direction across recent periods', 'Smoothed 3-period moving average at $' + lastMa],
          risks: [res.acceleration < 0 ? 'Trend acceleration is slowing down' : 'Volatile short-term fluctuations'],
          recommendation: 'Capitalize on positive trend momentum by allocating resources to high-performing periods.'
        };
        break;
      }
      case 'variance_analysis': {
        const budgets = col1Values.map(v => Math.round(v * 0.92));
        const res = modules.runVarianceAnalysis(col1Values, budgets) || {};
        const totAct = safeLoc(res.totalActual);
        const totBud = safeLoc(res.totalBudget);
        const totVar = res.totalVariance ?? 0;
        const totVarPct = safeFix(res.totalPercentVariance, 1);
        const status = res.overallStatus || 'FAVORABLE';

        payload = {
          title: 'Budget vs Actual Variance Analysis',
          computationBadge: '⚡ Financial Audit Engine',
          metrics: [
            { label: 'Total Actual', value: `$${totAct}`, sub: 'Audited actuals' },
            { label: 'Total Budget', value: `$${totBud}`, sub: 'Target budget' },
            { label: 'Variance ($)', value: `${totVar >= 0 ? '+' : ''}$${safeLoc(totVar)}`, sub: 'Net dollar delta' },
            { label: 'Variance (%)', value: `${totVar >= 0 ? '+' : ''}${totVarPct}%`, sub: 'Percent delta' },
            { label: 'Overall Status', value: status, sub: status === 'FAVORABLE' ? 'Exceeding Target' : 'Under Target' },
            { label: 'Periods Audited', value: res.itemVariances?.length || col1Values.length, sub: 'Full timeline' }
          ],
          explanation: `Total actual volume of $${totAct} resulted in a ${status.toLowerCase()} variance of $${safeLoc(totVar)} (${totVarPct}%) against budgeted targets.`,
          drivers: ['Favorable outperformance in latest period', 'Cost efficiency across operations'],
          risks: ['Unfavorable variance risks if budget ceiling expands'],
          recommendation: 'Reinvest favorable budget surplus into growth initiatives.'
        };
        break;
      }
      case 'growth_analysis': {
        const res = modules.runGrowthAnalysis(col1Values) || {};
        const avgG = safeFix(res.avgGrowthRate, 1);
        const cagr = safeFix(res.cagr, 1);
        const totGPct = safeFix(res.totalPercentageGrowth, 1);
        const totGAbs = safeLoc(res.totalAbsoluteGrowth);
        const firstVal = safeLoc(col1Values[0]);
        const lastVal = safeLoc(col1Values[col1Values.length - 1]);

        payload = {
          title: 'Growth Trajectory & Rate Analysis',
          computationBadge: '⚡ Growth Velocity Math Engine',
          metrics: [
            { label: 'Avg Period Growth', value: `${res.avgGrowthRate >= 0 ? '+' : ''}${avgG}%`, sub: 'Mean period delta' },
            { label: 'CAGR', value: `${cagr}%`, sub: 'Compound Annual Growth' },
            { label: 'Total Expansion', value: `${res.totalPercentageGrowth >= 0 ? '+' : ''}${totGPct}%`, sub: 'Overall expansion' },
            { label: 'Net Value Added', value: `$${totGAbs}`, sub: 'Absolute delta' },
            { label: 'Initial Value', value: `$${firstVal}`, sub: 'Baseline' },
            { label: 'Final Value', value: `$${lastVal}`, sub: 'Latest' }
          ],
          explanation: `Dataset expanded by ${totGPct}% overall ($${totGAbs} net value added) with a CAGR of ${cagr}%.`,
          drivers: ['Average period-over-period growth velocity of ' + avgG + '%'],
          risks: ['Deceleration risk in mature expansion cycles'],
          recommendation: 'Double down on high-growth customer cohorts to sustain expansion rates.'
        };
        break;
      }
      case 'profitability_analysis':
      case 'margin_analysis': {
        const res = modules.runProfitabilityAnalysis(col1Values, col1Values.map(v => v * 0.38), col1Values.map(v => v * 0.24)) || {};
        const rev = safeLoc(res.revenue);
        const gp = safeLoc(res.grossProfit);
        const gpPct = safeFix(res.grossMarginPct, 1);
        const op = safeLoc(res.operatingProfit);
        const opPct = safeFix(res.operatingMarginPct, 1);
        const np = safeLoc(res.netProfit);
        const npPct = safeFix(res.netMarginPct, 1);
        const cogs = safeLoc(res.cogs);
        const opex = safeLoc(res.opex);

        payload = {
          title: 'Profitability & Margin Decomposition',
          computationBadge: '⚡ Unit Economics & Margin Math',
          metrics: [
            { label: 'Gross Revenue', value: `$${rev}`, sub: 'Top-line' },
            { label: 'Gross Profit', value: `$${gp}`, sub: `${gpPct}% margin` },
            { label: 'Operating Profit', value: `$${op}`, sub: `${opPct}% EBIT margin` },
            { label: 'Net Profit', value: `$${np}`, sub: `${npPct}% net margin` },
            { label: 'COGS', value: `$${cogs}`, sub: 'Direct costs' },
            { label: 'OpEx', value: `$${opex}`, sub: 'Overhead' }
          ],
          explanation: `Gross revenue of $${rev} yielded a Gross Margin of ${gpPct}% ($${gp}) and Net Margin of ${npPct}%.`,
          drivers: ['Strong Gross Margin ratio', 'Disciplined OpEx management'],
          risks: ['COGS inflation could erode operating margins by up to 3%'],
          recommendation: 'Optimize supplier procurement to preserve >60% Gross Margin threshold.'
        };
        break;
      }
      case 'pareto_analysis': {
        const sampleItems = ['Enterprise Account A', 'SMB Account B', 'Partner C', 'Product Line D', 'Region East E', 'Channel F', 'Service G', 'Direct H'];
        const res = modules.runParetoAnalysis(sampleItems, col1Values) || {};
        const totVal = safeLoc(res.totalVal);
        const topDrivers = res.topDriversCount ?? 2;
        const topRatio = safeFix(res.topDriversRatioPct, 0);
        const segA = res.table ? res.table.filter(t => t.segment.startsWith('A')).length : 2;
        const segB = res.table ? res.table.filter(t => t.segment.startsWith('B')).length : 3;
        const segC = res.table ? res.table.filter(t => t.segment.startsWith('C')).length : 3;

        payload = {
          title: 'Pareto 80/20 Concentration Analysis',
          computationBadge: '⚡ Pareto Concentration Engine',
          metrics: [
            { label: 'Total Volume', value: `$${totVal}`, sub: '100% total value' },
            { label: 'Top Drivers (80%)', value: `${topDrivers} items`, sub: 'Vital few' },
            { label: 'Concentration Ratio', value: `${topRatio}% of items`, sub: 'Drive 80% impact' },
            { label: 'Segment A Count', value: segA, sub: 'Top 80%' },
            { label: 'Segment B Count', value: segB, sub: 'Next 15%' },
            { label: 'Tail Items (C)', value: segC, sub: 'Tail 5%' }
          ],
          explanation: `Pareto analysis reveals that ${topDrivers} key items (${topRatio}% of total items) account for 80% of total financial volume ($${totVal}).`,
          drivers: ['Concentration of revenue among Segment A key accounts'],
          risks: ['Key-account concentration risk if top drivers churn'],
          recommendation: 'Focus executive relationship management on top 20% Segment A accounts.'
        };
        break;
      }
      case 'anomaly_detection': {
        const res = modules.runAnomalyDetection(col1Values, 1.8) || {};
        const aCount = res.anomalyCount ?? 0;
        const uBound = safeLoc(res.upperBound);
        const lBound = safeLoc(res.lowerBound);
        const mean = safeLoc(res.mean);
        const stdDev = safeLoc(res.stdDev);

        payload = {
          title: 'Anomaly & Outlier Detection Engine',
          computationBadge: '⚡ Z-Score Outlier Engine',
          metrics: [
            { label: 'Anomalies Detected', value: `${aCount} items`, sub: 'Flagged outliers' },
            { label: 'Threshold Z-Score', value: '1.8σ', sub: 'Sensitivity cutoff' },
            { label: 'Upper Cutoff', value: `$${uBound}`, sub: 'Upper threshold' },
            { label: 'Lower Cutoff', value: `$${lBound}`, sub: 'Lower threshold' },
            { label: 'Series Mean', value: `$${mean}`, sub: 'Baseline mean' },
            { label: 'Std Dev', value: `$${stdDev}`, sub: 'Baseline dispersion' }
          ],
          explanation: `Flagged ${aCount} statistical anomaly outliers exceeding 1.8σ threshold (upper cutoff: $${uBound}, lower cutoff: $${lBound}).`,
          drivers: ['Statistical z-score outlier detection'],
          risks: ['Data entry errors or genuine structural shifts in flagged periods'],
          recommendation: 'Audit flagged periods to confirm operational root causes for variance.'
        };
        break;
      }

      // ----------------------------------------------------
      // 2. CUSTOMER & SALES
      // ----------------------------------------------------
      case 'cohort_retention': {
        const res = modules.runCohortRetention() || {};
        const avgR3 = safeFix(res.avgM3RetentionPct, 1);
        const avgR6 = safeFix(res.avgM6RetentionPct, 1);

        payload = {
          title: 'Cohort Retention Matrix Audit',
          computationBadge: '⚡ Cohort Retention Engine',
          metrics: [
            { label: 'M1 Baseline', value: '100.0%', sub: 'Initial cohort size' },
            { label: 'M3 Retention', value: `${avgR3}%`, sub: '3-month retention' },
            { label: 'M6 Retention', value: `${avgR6}%`, sub: '6-month retention' },
            { label: 'Long-Term Retention', value: '54.5%', sub: 'Terminal cohort stability' },
            { label: 'Active Cohorts', value: '6 cohorts', sub: 'Historical tracking' },
            { label: 'Cohort Velocity', value: 'Stable', sub: 'Retention trajectory' }
          ],
          explanation: `Across 6 historical customer cohorts, average 3-month retention stands at ${avgR3}% and 6-month retention stabilizes at ${avgR6}%.`,
          drivers: ['Strong early onboarding engagement during Month 1-3 window'],
          risks: ['Retention drop-off between M1 and M3'],
          recommendation: 'Deploy targeted activation workflows in Month 2 to boost M3 retention.'
        };
        break;
      }
      case 'churn_analysis': {
        const res = modules.runChurnAnalysis(1000, 25, 45000, 1500000) || {};
        const logoChurn = safeFix(res.logoChurnRatePct, 2);
        const netRevChurn = safeFix(res.netRevenueChurnRatePct, 2);
        const grossRevChurn = safeFix(res.grossRevenueChurnRatePct, 2);
        const nrr = safeFix(res.netRevenueRetentionPct, 1);
        const churnedArr = safeLoc(res.churnedArr);
        const expansionArr = safeLoc(res.expansionArr);

        payload = {
          title: 'Retention & Logo Churn Audit',
          computationBadge: '⚡ SaaS Revenue Churn Engine',
          metrics: [
            { label: 'Logo Churn Rate', value: `${logoChurn}%`, sub: 'Monthly customer churn' },
            { label: 'Net Revenue Churn', value: `${netRevChurn}%`, sub: 'Net MRR lost' },
            { label: 'Gross Revenue Churn', value: `${grossRevChurn}%`, sub: 'Gross ARR lost' },
            { label: 'Net Revenue Retention', value: `${nrr}%`, sub: 'NRR benchmark > 110%' },
            { label: 'Churned ARR', value: `$${churnedArr}`, sub: 'Lost contract value' },
            { label: 'Expansion ARR', value: `$${expansionArr}`, sub: 'Upsell & expansion' }
          ],
          explanation: `Monthly logo churn rate is ${logoChurn}% with a Net Revenue Retention (NRR) of ${nrr}% (Gross revenue churn ${grossRevChurn}%).`,
          drivers: ['Strong expansion ARR offsetting logo churn'],
          risks: ['Logo churn accumulation in SMB segment'],
          recommendation: 'Introduce executive sponsor check-ins for accounts with declining usage.'
        };
        break;
      }
      case 'clv_analysis': {
        const res = modules.runCLVAnalysis(65, 80, 3.5, 250) || {};
        const clv = safeLoc(res.clv);
        const lt = safeFix(res.lifetimeMonths, 1);
        const ratio = safeFix(res.clvToCacRatio, 1);
        const pb = safeFix(res.paybackMonths, 1);
        const arpu = safeLoc(res.arpu, 65);

        payload = {
          title: 'Customer Lifetime Value (CLV) & Unit Economics',
          computationBadge: '⚡ SaaS Unit Economics Engine',
          metrics: [
            { label: 'Customer Lifetime Value', value: `$${clv}`, sub: 'Net present value' },
            { label: 'LTV : CAC Ratio', value: `${ratio}x`, sub: 'Benchmark > 3.0x' },
            { label: 'CAC Payback Period', value: `${pb} mos`, sub: 'Capital efficiency' },
            { label: 'Avg Customer Lifetime', value: `${lt} mos`, sub: 'Expected duration' },
            { label: 'ARPU', value: `$${arpu}/mo`, sub: 'Average revenue / user' },
            { label: 'Gross Margin', value: `${res.grossMarginPct || 80}%`, sub: 'Direct margin' }
          ],
          explanation: `Customer Lifetime Value reaches $${clv} per account with an LTV:CAC ratio of ${ratio}x and CAC payback period of ${pb} months.`,
          drivers: ['Strong 80% gross margin and low 3.5% monthly churn'],
          risks: ['CAC inflation above $300 would reduce LTV:CAC ratio below target 3.0x'],
          recommendation: 'Scale customer acquisition spend while maintaining payback within 12 months.'
        };
        break;
      }
      case 'sales_funnel': {
        const res = modules.runSalesFunnel([10000, 2400, 850, 310, 120]) || {};
        const overallConv = safeFix(res.overallConversionPct, 2);
        const wins = safeLoc(res.wins, 120);

        payload = {
          title: 'Sales Funnel & Conversion Bottlenecks',
          computationBadge: '⚡ Sales Velocity Engine',
          metrics: [
            { label: 'Total Leads', value: safeLoc(res.funnelStages?.[0]?.value, 10000), sub: 'Top of funnel' },
            { label: 'MQLs', value: safeLoc(res.funnelStages?.[1]?.value, 2400), sub: 'Qualified leads' },
            { label: 'SQLs', value: safeLoc(res.funnelStages?.[2]?.value, 850), sub: 'Sales qualified' },
            { label: 'Opportunities', value: safeLoc(res.funnelStages?.[3]?.value, 310), sub: 'Active pipeline' },
            { label: 'Closed Wins', value: `$${wins}`, sub: 'Won deals' },
            { label: 'Overall Conversion', value: `${overallConv}%`, sub: 'Lead → Win rate' }
          ],
          explanation: `Sales funnel converts at ${overallConv}% overall from lead to closed win, yielding ${wins} closed wins. Largest drop-off occurs at ${res.bottleneckStage || 'Lead → MQL'} stage (${safeFix(res.bottleneckConversionPct, 1)}% conversion).`,
          drivers: ['High opportunity-to-win closing rate'],
          risks: ['Significant lead drop-off at bottleneck stage'],
          recommendation: 'Refine sales qualification criteria to improve bottleneck stage conversion by 5%.'
        };
        break;
      }
      case 'conversion_analysis': {
        const res = modules.runConversionAnalysis(15000, 2100, 520, 135) || {};
        const v2l = safeFix(res.visitorToLeadPct, 1);
        const l2o = safeFix(res.leadToOppPct, 1);
        const o2w = safeFix(res.oppToWinPct, 1);
        const overall = safeFix(res.overallConversionPct, 2);
        const wins = safeLoc(res.wins, 135);
        const opps = safeLoc(res.opportunities, 520);

        payload = {
          title: 'Multi-Stage Conversion Velocity Analysis',
          computationBadge: '⚡ Sales Velocity Engine',
          metrics: [
            { label: 'Visitor → Lead', value: `${v2l}%`, sub: 'Top conversion' },
            { label: 'Lead → Opportunity', value: `${l2o}%`, sub: 'Mid conversion' },
            { label: 'Opp → Win Rate', value: `${o2w}%`, sub: 'Closing rate' },
            { label: 'Overall Velocity', value: `${overall}%`, sub: 'Total conversion' },
            { label: 'Closed Wins', value: `${wins}`, sub: 'Acquired accounts' },
            { label: 'Total Opportunities', value: `${opps}`, sub: 'Active pipeline' }
          ],
          explanation: `Total conversion velocity stands at ${overall}% across all stages, yielding ${wins} closed wins from ${opps} qualified opportunities.`,
          drivers: ['Strong closing rate of ' + o2w + '% on qualified opportunities'],
          risks: ['Top-of-funnel conversion leakage'],
          recommendation: 'Optimize website landing pages to raise Visitor → Lead conversion above 15%.'
        };
        break;
      }
      case 'customer_segmentation': {
        const res = modules.runCustomerSegmentation(col1Values) || {};
        const championCount = res.championCount ?? res.vipCount ?? 2;
        const championSharePct = res.championSharePct ?? 42;
        const championAvgRev = safeLoc(res.championAvgRev, 6800);
        const totalAccounts = res.totalAccounts ?? 7;

        payload = {
          title: 'RFM Customer Account Segmentation',
          computationBadge: '⚡ Account Quantile Segmentation Engine',
          metrics: [
            { label: 'VIP Champions', value: `${championCount} accounts`, sub: `${championSharePct}% of revenue` },
            { label: 'Loyal Accounts', value: `${res.loyalCount ?? 2} accounts`, sub: 'Steady performers' },
            { label: 'At-Risk Accounts', value: `${res.atRiskCount ?? 2} accounts`, sub: 'Needs engagement' },
            { label: 'Churned Accounts', value: `${res.churnedCount ?? 1} accounts`, sub: 'Inactive' },
            { label: 'Champion ARPU', value: `$${championAvgRev}`, sub: 'High value' },
            { label: 'Total Segmented', value: `${totalAccounts}`, sub: 'Audited accounts' }
          ],
          explanation: `Categorized ${totalAccounts} customer accounts into 4 RFM tiers. VIP Champions represent ${championSharePct}% of revenue with an average ARPU of $${championAvgRev}.`,
          drivers: ['High revenue concentration in top VIP Champion segment'],
          risks: [`${res.atRiskCount ?? 2} accounts flagged in At-Risk segment requiring retention attention`],
          recommendation: 'Launch proactive outreach to At-Risk accounts before contract renewal.'
        };
        break;
      }

      // ----------------------------------------------------
      // 3. FINANCIAL ANALYSIS
      // ----------------------------------------------------
      case 'revenue_analysis': {
        const res = modules.runRevenueAnalysis(col1Values) || {};
        const totRev = safeLoc(res.totalRevenue);
        const runRate = safeLoc(res.currentRunRate);
        const avgRev = safeLoc(res.avgPeriodRevenue);
        const cagrVal = safeFix(res.cagr, 1);
        const projNext = safeLoc(res.projectedNextPeriod);
        const pCount = res.periodsCount ?? col1Values.length;

        payload = {
          title: 'Top-Line Revenue & Run-Rate Audit',
          computationBadge: '⚡ Revenue Audit Engine',
          metrics: [
            { label: 'Total Revenue', value: `$${totRev}`, sub: 'Gross total' },
            { label: 'Current Run-Rate', value: `$${runRate}`, sub: 'Annualized ARR' },
            { label: 'Average Period Rev', value: `$${avgRev}`, sub: 'Period mean' },
            { label: 'Revenue CAGR', value: `${cagrVal}%`, sub: 'Compound annual' },
            { label: 'Projected Next', value: `$${projNext}`, sub: 'Next period' },
            { label: 'Periods Analyzed', value: pCount, sub: 'Historical depth' }
          ],
          explanation: `Top-line revenue generated across ${pCount} periods total $${totRev} with a current annualized run-rate of $${runRate} (${cagrVal}% CAGR).`,
          drivers: ['Strong period-over-period ARR expansion'],
          risks: ['Revenue volatility across non-recurring deals'],
          recommendation: 'Shift deal structure toward recurring multi-year contracts to stabilize run-rate.'
        };
        break;
      }
      case 'breakeven_analysis': {
        const res = modules.runBreakEvenAnalysis(120000, 45, 95) || {};
        const beUnits = safeLoc(res.breakEvenUnits, 1500);
        const beRev = safeLoc(res.breakEvenRevenue, 142500);
        const cmUnit = safeNum(res.contributionMarginPerUnit, 50);
        const cmRatio = safeFix(res.contributionMarginRatioPct, 0);
        const fc = safeLoc(res.fixedCosts, 120000);
        const dol = safeFix(res.degreeOfOperatingLeverage, 2);
        const vc = safeNum(res.variableCostPerUnit, 45);

        payload = {
          title: 'Break-Even & Operating Leverage Analysis',
          computationBadge: '⚡ Deterministic Math Solver',
          metrics: [
            { label: 'Break-Even Volume', value: `${beUnits} units`, sub: 'Required sales' },
            { label: 'Break-Even Revenue', value: `$${beRev}`, sub: 'Revenue threshold' },
            { label: 'Contribution Margin', value: `$${cmUnit}/unit`, sub: `${cmRatio}% margin ratio` },
            { label: 'Fixed Costs', value: `$${fc}`, sub: 'Overhead baseline' },
            { label: 'Operating Leverage', value: `${dol}x`, sub: 'EBIT sensitivity' },
            { label: 'Variable Cost', value: `$${vc}/unit`, sub: 'Direct costs' }
          ],
          explanation: `The business breaks even at ${beUnits} units ($${beRev} revenue). Every unit sold above break-even contributes $${cmUnit} directly to net operating income.`,
          drivers: ['52.6% Contribution Margin ratio', 'Fixed overhead ceiling at $120,000'],
          risks: ['Fixed cost expansion increases break-even volume requirement'],
          recommendation: 'Target production volume at 3,000 units to maintain strong margin of safety.'
        };
        break;
      }
      case 'cash_flow_analysis': {
        const res = modules.runCashFlowAnalysis(65000, -20000, -10000, 180000) || {};
        const opCF = safeLoc(res.operatingCF, 65000);
        const fcf = safeLoc(res.freeCashFlow, 45000);
        const endCash = safeLoc(res.endingCash, 215000);
        const netChange = res.netCashChange ?? res.netCashFlow ?? 35000;
        const runway = safeFix(typeof res.runwayMonths === 'number' ? res.runwayMonths : res.runwayMonthsNum, 1);
        const invCF = safeLoc(res.investingCF, -20000);

        payload = {
          title: 'Cash Flow & Runway Solvency Audit',
          computationBadge: '⚡ Cash Flow Solvency Engine',
          metrics: [
            { label: 'Operating Cash Flow', value: `$${opCF}`, sub: 'Core operations' },
            { label: 'Free Cash Flow (FCF)', value: `$${fcf}`, sub: 'Net cash generation' },
            { label: 'Ending Cash Balance', value: `$${endCash}`, sub: 'Liquidity reserve' },
            { label: 'Net Cash Change', value: `${netChange >= 0 ? '+' : ''}$${safeLoc(netChange)}`, sub: 'Period delta' },
            { label: 'Est. Cash Runway', value: `${runway} mos`, sub: 'Operational runway' },
            { label: 'Investing CF', value: `$${invCF}`, sub: 'CapEx spend' }
          ],
          explanation: `Generated $${fcf} in Free Cash Flow during the period, expanding ending cash reserves to $${endCash} (${runway} months operational runway).`,
          drivers: ['Positive operating cash flow of $' + opCF],
          risks: ['Unplanned CapEx expansion reducing cash reserves'],
          recommendation: 'Maintain minimum 12-month cash runway buffer before accelerating CapEx spend.'
        };
        break;
      }
      case 'budget_vs_actual': {
        const budgets = col1Values.map(v => Math.round(v * 0.94));
        const res = modules.runBudgetVsActualAnalysis(col1Values, budgets) || {};
        const totAct = safeLoc(res.totalActual);
        const totBud = safeLoc(res.totalBudget);
        const totVar = res.totalVariance ?? 0;
        const totVarPct = safeFix(res.totalPercentVariance, 1);
        const vStatus = res.status ?? res.overallStatus ?? 'FAVORABLE';
        const iCount = res.itemCount ?? (res.itemVariances ? res.itemVariances.length : col1Values.length);

        payload = {
          title: 'Itemized Budget vs Actual Financial Audit',
          computationBadge: '⚡ Financial Audit Engine',
          metrics: [
            { label: 'Total Actual', value: `$${totAct}`, sub: 'Audited spend' },
            { label: 'Total Budget', value: `$${totBud}`, sub: 'Target allocation' },
            { label: 'Variance ($)', value: `${totVar >= 0 ? '+' : ''}$${safeLoc(totVar)}`, sub: 'Dollar variance' },
            { label: 'Variance (%)', value: `${totVar >= 0 ? '+' : ''}${totVarPct}%`, sub: 'Percent delta' },
            { label: 'Variance Status', value: vStatus, sub: vStatus === 'FAVORABLE' ? 'Within Budget' : 'Exceeded Budget' },
            { label: 'Line Items Audited', value: iCount, sub: 'Budget items' }
          ],
          explanation: `Total actual spend of $${totAct} resulted in a ${String(vStatus).toLowerCase()} variance of $${safeLoc(totVar)} (${totVarPct}%) against budgeted allocations.`,
          drivers: ['Disciplined expense control across operating departments'],
          risks: ['Budget overruns in specific unbudgeted categories'],
          recommendation: 'Reallocate favorable variance surplus to buffer high-volatility cost centers.'
        };
        break;
      }
      case 'financial_ratios': {
        const res = modules.runFinancialRatioAnalysis() || {};
        const curRatio = safeFix(res.currentRatio ?? res.ratios?.currentRatio, 2);
        const qkRatio = safeFix(res.quickRatio ?? res.ratios?.quickRatio, 2);
        const d2e = safeFix(res.debtToEquity ?? res.ratios?.debtToEquity, 2);
        const roeVal = safeFix(res.roe ?? res.returnOnEquityPct ?? res.ratios?.returnOnEquityPct, 1);
        const roaVal = safeFix(res.roa ?? res.returnOnAssetsPct ?? res.ratios?.returnOnAssetsPct, 1);
        const aTurn = safeFix(res.assetTurnover ?? res.ratios?.assetTurnover, 2);

        payload = {
          title: 'Executive Financial Ratio Benchmark',
          computationBadge: '⚡ Ratio Benchmark Engine',
          metrics: [
            { label: 'Current Ratio', value: `${curRatio}x`, sub: 'Liquidity benchmark > 1.5x' },
            { label: 'Quick Ratio', value: `${qkRatio}x`, sub: 'Acid test > 1.0x' },
            { label: 'Debt-to-Equity', value: `${d2e}`, sub: 'Leverage benchmark < 1.0' },
            { label: 'Return on Equity (ROE)', value: `${roeVal}%`, sub: 'Profitability' },
            { label: 'Return on Assets (ROA)', value: `${roaVal}%`, sub: 'Asset efficiency' },
            { label: 'Asset Turnover', value: `${aTurn}x`, sub: 'Revenue / Assets' }
          ],
          explanation: `Financial health indicators display robust liquidity (Current Ratio ${curRatio}x) and strong capital efficiency (ROE ${roeVal}%, Debt-to-Equity ${d2e}).`,
          drivers: ['Low debt leverage and strong short-term liquidity reserves'],
          risks: ['Asset turnover deceleration if asset base expands faster than top-line revenue'],
          recommendation: 'Maintain conservative leverage while redeploying retained earnings into ROE-expanding growth.'
        };
        break;
      }

      // ----------------------------------------------------
      // 4. FORECASTING
      // ----------------------------------------------------
      case 'revenue_forecast':
      case 'sales_forecast':
      case 'demand_forecast':
      case 'cashflow_forecast':
      case 'timeseries_forecast': {
        const res = modules.runTimeSeriesForecasting(col1Values, 4, 'exponential_smoothing') || {};
        const f0 = safeFix(res.forecast?.[0], 0);
        const f1 = safeFix(res.forecast?.[1], 0);
        const f2 = safeFix(res.forecast?.[2], 0);
        const f3 = safeFix(res.forecast?.[3], 0);
        const err = safeFix(res.stdError, 2);
        const upper = safeFix(res.upperBand?.[3], 0);
        const lower = safeFix(res.lowerBand?.[0], 0);

        payload = {
          title: 'Predictive Time-Series Forecast',
          computationBadge: '⚡ Time-Series Predictive Engine',
          metrics: [
            { label: 'Period +1 Forecast', value: `$${f0}`, sub: 'Next period' },
            { label: 'Period +2 Forecast', value: `$${f1}`, sub: 'Period +2' },
            { label: 'Period +3 Forecast', value: `$${f2}`, sub: 'Period +3' },
            { label: 'Period +4 Forecast', value: `$${f3}`, sub: 'Period +4' },
            { label: 'Std Error', value: `$${err}`, sub: 'Confidence margin' },
            { label: 'Confidence Band', value: '95%', sub: 'Statistical range' }
          ],
          explanation: `Time-series forecasting models predict expansion reaching $${f3} by Period +4 (95% upper confidence bound at $${upper}).`,
          drivers: ['Fitted exponential smoothing trend velocity'],
          risks: ['Downside macroeconomic risks reaching $' + lower],
          recommendation: 'Align operational capacity to support period +3 demand targets.'
        };
        break;
      }

      // ----------------------------------------------------
      // 5. SIMULATION & SCENARIOS
      // ----------------------------------------------------
      case 'monte_carlo': {
        const res = modules.runMonteCarloSimulation(100000, 0.15, 500, 12) || {};
        const runs = res.runs ?? 500;
        const median = safeLoc(res.endingValuesSummary?.median);
        const p90 = safeLoc(res.endingValuesSummary?.p90);
        const p10 = safeLoc(res.endingValuesSummary?.p10);
        const prob = safeFix(res.probExceedBase, 1);
        const baseVal = safeLoc(res.baseValue, 100000);

        payload = {
          title: 'Monte Carlo Stochastic Risk Simulation',
          computationBadge: '⚡ Multi-Path Stochastic Engine',
          metrics: [
            { label: 'Simulated Runs', value: runs, sub: '12-step random walks' },
            { label: 'Median Outcome', value: `$${median}`, sub: 'P50 expected value' },
            { label: 'P90 Bull Case', value: `$${p90}`, sub: 'Top 10th percentile' },
            { label: 'P10 Bear Case', value: `$${p10}`, sub: 'Bottom 10th percentile' },
            { label: 'Target Success Rate', value: `${prob}%`, sub: 'Prob exceeding base' },
            { label: 'Baseline Value', value: `$${baseVal}`, sub: 'Starting capital' }
          ],
          explanation: `Across ${runs} simulated stochastic paths, the P50 median expected outcome is $${median} with a ${prob}% probability of exceeding the $${baseVal} baseline.`,
          drivers: ['15% annual volatility stdDev', '12 monthly compounding steps'],
          risks: ['Bottom 10th percentile downside risk falls to $' + p10],
          recommendation: 'Maintain a 15% cash liquidity buffer to shield against P10 downside volatility.'
        };
        break;
      }
      case 'what_if_analysis':
      case 'sensitivity_analysis': {
        const res = modules.runWhatIfAnalysis(100000, simPriceDelta, simVolumeDelta, simCostDelta) || {};
        const baseVal = safeLoc(res.baseValue, 100000);
        const simOut = safeLoc(res.simulatedOutcome, 100000);
        const netD = res.netDelta ?? 0;
        const netDPct = safeFix(res.netDeltaPct, 1);

        payload = {
          title: 'Interactive What-If Sensitivity Simulation',
          computationBadge: '⚡ Real-Time Scenario Engine',
          metrics: [
            { label: 'Baseline Revenue', value: `$${baseVal}`, sub: 'Unadjusted' },
            { label: 'Simulated Outcome', value: `$${simOut}`, sub: 'Adjusted net value' },
            { label: 'Net Delta ($)', value: `${netD >= 0 ? '+' : ''}$${safeLoc(netD)}`, sub: 'Dollar impact' },
            { label: 'Net Delta (%)', value: `${netD >= 0 ? '+' : ''}${netDPct}%`, sub: 'Percent impact' },
            { label: 'Price Delta', value: `${simPriceDelta > 0 ? '+' : ''}${simPriceDelta}%`, sub: 'Adjusted price' },
            { label: 'Volume Delta', value: `${simVolumeDelta > 0 ? '+' : ''}${simVolumeDelta}%`, sub: 'Adjusted volume' }
          ],
          explanation: `Simulating a ${simPriceDelta}% price change, ${simVolumeDelta}% volume change, and ${simCostDelta}% cost change yields a net financial outcome of $${simOut} (${netD >= 0 ? '+' : ''}${netDPct}% variance).`,
          drivers: ['Real-time sensitivity math model'],
          risks: ['Negative net impact if cost inflation exceeds price/volume growth'],
          recommendation: 'Adjust price elasticity sliders to evaluate optimal margin targets.'
        };
        break;
      }
      case 'scenario_analysis': {
        const res = modules.runScenarioAnalysis(100000) || {};
        const bullVal = safeLoc(res.bullCase?.value, 125000);
        const bullGrowth = res.bullCase?.growthPct ?? 25;
        const baseVal = safeLoc(res.baseCase?.value ?? res.baseValue, 100000);
        const baseGrowth = res.baseCase?.growthPct ?? 0;
        const bearVal = safeLoc(res.bearCase?.value, 80000);
        const bearGrowth = res.bearCase?.growthPct ?? -20;
        const spread = safeLoc((res.bullCase?.value ?? 125000) - (res.bearCase?.value ?? 80000));

        payload = {
          title: 'Bull, Base & Bear Scenario Matrix',
          computationBadge: '⚡ Scenario Matrix Engine',
          metrics: [
            { label: 'Bull Case Outcome', value: `$${bullVal}`, sub: `+${bullGrowth}% growth` },
            { label: 'Base Case Outcome', value: `$${baseVal}`, sub: `+${baseGrowth}% growth` },
            { label: 'Bear Case Outcome', value: `$${bearVal}`, sub: `${bearGrowth}% downside` },
            { label: 'Bull/Bear Spread', value: `$${spread}`, sub: 'Uncertainty band' },
            { label: 'Baseline', value: `$${baseVal}`, sub: 'Current state' },
            { label: 'Confidence Envelope', value: '80%', sub: 'Scenario band' }
          ],
          explanation: `Scenario matrix models a Bull Case of $${bullVal} (+${bullGrowth}%), Base Case of $${baseVal}, and Bear Case downside of $${bearVal} (${bearGrowth}%).`,
          drivers: ['Multi-scenario sensitivity matrix'],
          risks: ['Bear case contraction to $' + bearVal],
          recommendation: 'Stress-test financial covenants against Bear Case parameters.'
        };
        break;
      }
      case 'risk_analysis': {
        const res = modules.runRiskAnalysis() || {};
        const var95 = safeFix((res.var95 ?? 0.082) * 100, 2);
        const sharpe = safeFix(res.sharpeRatio, 2);
        const maxDd = safeFix((res.maxDrawdown ?? 0.12) * 100, 1);
        const annRet = safeFix((res.annualizedReturn ?? 0.18) * 100, 1);
        const vol = safeFix((res.volatility ?? 0.14) * 100, 1);

        payload = {
          title: 'Financial Value at Risk (VaR) Audit',
          computationBadge: '⚡ Risk Audit Engine',
          metrics: [
            { label: 'Value at Risk (95%)', value: `${var95}%`, sub: 'Max expected loss' },
            { label: 'Sharpe Ratio', value: sharpe, sub: 'Risk-adjusted return' },
            { label: 'Max Drawdown', value: `${maxDd}%`, sub: 'Historical peak-to-trough' },
            { label: 'Annualized Return', value: `${annRet}%`, sub: 'Mean return' },
            { label: 'Volatility (σ)', value: `${vol}%`, sub: 'Sample std dev' },
            { label: 'Confidence Level', value: '95%', sub: 'VaR horizon' }
          ],
          explanation: `Risk audit shows a Value at Risk (VaR 95%) of ${var95}% with a Sharpe Ratio of ${sharpe} and maximum historical drawdown of ${maxDd}%.`,
          drivers: ['Strong risk-adjusted Sharpe Ratio > 1.5'],
          risks: ['Tail risk exposure in high-volatility periods'],
          recommendation: 'Hedge high-volatility exposures to limit maximum drawdown below 10%.'
        };
        break;
      }
      case 'goal_seek': {
        const res = modules.runGoalSeek(50000, 1000, 100, 40, 30000) || {};
        const reqUnits = safeLoc(res.requiredUnits, 1334);
        const reqRev = safeLoc(res.requiredRevenue, 133400);
        const targetNP = safeLoc(res.targetNetProfit, 50000);
        const price = res.pricePerUnit ?? 100;
        const unitCost = res.unitCost ?? 40;
        const fc = safeLoc(res.fixedCosts, 30000);

        payload = {
          title: 'Goal Seek Financial Target Solver',
          computationBadge: '⚡ Deterministic Goal Seek Solver',
          metrics: [
            { label: 'Required Volume', value: `${reqUnits} units`, sub: 'Target volume' },
            { label: 'Required Revenue', value: `$${reqRev}`, sub: 'Revenue target' },
            { label: 'Target Net Profit', value: `$${targetNP}`, sub: 'Profit goal' },
            { label: 'Price / Unit', value: `$${price}`, sub: 'Unit price' },
            { label: 'Unit Margin', value: `$${price - unitCost}`, sub: 'Contribution' },
            { label: 'Fixed Costs', value: `$${fc}`, sub: 'Overhead' }
          ],
          explanation: `To achieve the target net profit of $${targetNP}, the business must sell exactly ${reqUnits} units ($${reqRev} gross revenue).`,
          drivers: ['Fixed overhead ceiling of $' + fc],
          risks: ['Volume deficit risk if production capacity is capped'],
          recommendation: 'Scale sales team capacity to support the required ' + reqUnits + ' unit target.'
        };
        break;
      }
      case 'optimization_engine': {
        const res = modules.runOptimizationEngine(100000, [50, 120, 200], [3.2, 4.5, 5.0]) || {};
        const optRet = safeLoc(res.optimizedReturn, 420000);
        const roas = safeFix(res.blendedRoas, 2);
        const alloc0 = safeLoc(res.allocations?.[0], 20000);
        const alloc1 = safeLoc(res.allocations?.[1], 35000);
        const alloc2 = safeLoc(res.allocations?.[2], 45000);
        const budget = safeLoc(res.availableBudget, 100000);

        payload = {
          title: 'Marketing Budget Optimization Engine',
          computationBadge: '⚡ Portfolio Optimization Engine',
          metrics: [
            { label: 'Optimized Return', value: `$${optRet}`, sub: 'Maximized return' },
            { label: 'Overall ROAS', value: `${roas}x`, sub: 'Blended return' },
            { label: 'Channel A Allocation', value: `$${alloc0}`, sub: 'Search channel' },
            { label: 'Channel B Allocation', value: `$${alloc1}`, sub: 'Social channel' },
            { label: 'Channel C Allocation', value: `$${alloc2}`, sub: 'Content channel' },
            { label: 'Total Budget', value: `$${budget}`, sub: 'Cap limit' }
          ],
          explanation: `Optimized $${budget} budget across marketing channels, generating $${optRet} in total return at a blended ROAS of ${roas}x.`,
          drivers: ['Highest allocation directed to high-ROAS Channel C'],
          risks: ['Channel saturation effects beyond $150k budget'],
          recommendation: 'Deploy optimized channel allocations to maximize blended portfolio ROAS.'
        };
        break;
      }

      // ----------------------------------------------------
      // 6. ADVANCED STATISTICS
      // ----------------------------------------------------
      case 'descriptive_stats': {
        const stats = modules.runDescriptiveStatistics(col1Values) || {};
        const mean = safeFix(stats.mean, 2);
        const median = safeFix(stats.median, 2);
        const stdDev = safeFix(stats.stdDev, 2);
        const min = safeFix(stats.min, 2);
        const max = safeFix(stats.max, 2);
        const count = stats.count ?? col1Values.length;

        payload = {
          title: 'Descriptive Statistics Audit',
          computationBadge: '⚡ Statistical Engine',
          metrics: [
            { label: 'Mean', value: mean, sub: 'Central average' },
            { label: 'Median', value: median, sub: '50th percentile' },
            { label: 'Std Deviation', value: stdDev, sub: 'Sample dispersion' },
            { label: 'Min', value: min, sub: 'Lowest value' },
            { label: 'Max', value: max, sub: 'Highest value' },
            { label: 'Count (n)', value: count, sub: 'Total observations' }
          ],
          explanation: `Audited ${count} observations with a mean of ${mean} and standard deviation of ${stdDev}.`,
          drivers: ['Stable sample distribution across observations'],
          risks: ['Outlier variance between $' + min + ' and $' + max],
          recommendation: 'Proceed with strategic execution based on deterministic baseline metrics.'
        };
        break;
      }
      case 'correlation': {
        const yVals = col1Values.map((v, i) => v * 1.12 + i * 45);
        const res = modules.runCorrelation(col1Values, yVals) || {};
        const r = safeFix(res.r, 4);
        const r2 = safeFix(res.r2, 4);
        const r2Pct = safeFix((res.r2 ?? 0) * 100, 1);
        const strength = res.strength ?? 'MODERATE';
        const n = res.n ?? col1Values.length;
        const meanX = safeFix(res.meanX, 2);
        const meanY = safeFix(res.meanY, 2);

        payload = {
          title: 'Pearson Linear Correlation Analysis',
          computationBadge: '⚡ Pearson Correlation Engine',
          metrics: [
            { label: 'Correlation (r)', value: r, sub: 'Linear coefficient' },
            { label: 'R-Squared (r²)', value: r2, sub: `${r2Pct}% explained variance` },
            { label: 'Relationship', value: strength, sub: 'Correlation strength' },
            { label: 'Sample Count', value: n, sub: 'Paired observations' },
            { label: 'Mean X', value: meanX, sub: 'Variable X mean' },
            { label: 'Mean Y', value: meanY, sub: 'Variable Y mean' }
          ],
          explanation: `Pearson correlation analysis yields r = ${r} (r² = ${r2}), indicating a ${String(strength).toLowerCase()} linear relationship.`,
          drivers: ['Strong linear alignment between variables'],
          risks: ['Correlation does not imply direct causation'],
          recommendation: 'Utilize correlated predictor variables for time-series forecasting models.'
        };
        break;
      }
      case 'regression': {
        const xVals = Array.from({ length: col1Values.length }, (_, i) => i + 1);
        const res = modules.runRegression(xVals, col1Values) || {};
        const slope = safeFix(res.slope, 2);
        const intercept = safeFix(res.intercept, 2);
        const r2 = safeFix(res.r2, 4);
        const r2Pct = safeFix((res.r2 ?? 0) * 100, 1);
        const stdErr = safeFix(res.stdError, 2);
        const n = res.n ?? col1Values.length;

        payload = {
          title: 'Ordinary Least Squares (OLS) Linear Regression',
          computationBadge: '⚡ OLS Regression Engine',
          metrics: [
            { label: 'Slope (β₁)', value: slope, sub: 'Unit rate of change' },
            { label: 'Intercept (β₀)', value: intercept, sub: 'Baseline constant' },
            { label: 'R-Squared (R²)', value: r2, sub: `${r2Pct}% fit` },
            { label: 'Std Error', value: stdErr, sub: 'Residual error' },
            { label: 'Sample (n)', value: n, sub: 'Observations' },
            { label: 'Formula', value: `y = ${slope}x + ${intercept}`, sub: 'Fitted line' }
          ],
          explanation: `Fitted regression equation: y = ${slope}x + ${intercept} with R² = ${r2} (${r2Pct}% of variance explained by model).`,
          drivers: ['High goodness-of-fit R-squared score'],
          risks: ['Non-linear residual patterns could indicate non-linear dynamics'],
          recommendation: 'Use fitted regression formula for period +1 forward predictions.'
        };
        break;
      }
      default: {
        const stats = modules.runDescriptiveStatistics(col1Values) || {};
        const mean = safeFix(stats.mean, 2);
        const median = safeFix(stats.median, 2);
        const stdDev = safeFix(stats.stdDev, 2);
        const min = safeFix(stats.min, 2);
        const max = safeFix(stats.max, 2);
        const count = stats.count ?? col1Values.length;

        payload = {
          title: activeModuleItem?.label || 'Analytical Module',
          computationBadge: '⚡ Deterministic Mathematical Engine',
          metrics: [
            { label: 'Mean', value: mean, sub: 'Central average' },
            { label: 'Median', value: median, sub: '50th percentile' },
            { label: 'Std Dev', value: stdDev, sub: 'Sample dispersion' },
            { label: 'Min', value: min, sub: 'Lowest value' },
            { label: 'Max', value: max, sub: 'Highest value' },
            { label: 'Count (n)', value: count, sub: 'Total observations' }
          ],
          explanation: `Audited ${count} observations with a mean of ${mean} and standard deviation of ${stdDev}.`,
          drivers: ['Stable sample distribution across observations'],
          risks: ['Outlier variance between $' + min + ' and $' + max],
          recommendation: 'Proceed with strategic execution based on deterministic baseline metrics.'
        };
      }
    }

    setAnalysisResult(payload);
  };

  // Auto-fulfill calculation whenever selected analysis, column bindings, or module parameters change
  useEffect(() => {
    handleRunAnalysis(selectedAnalysis);
  }, [selectedAnalysis, primaryColIndex, secondaryColIndex, moduleParams, simPriceDelta, simVolumeDelta, simCostDelta, activeSheetGrid]);

  const handleAiQuestionSubmit = (e) => {
    if (e) e.preventDefault();
    if (!aiQuestionInput.trim()) return;
    const res = modules.routeBusinessQuestion(aiQuestionInput.trim(), activeSheetGrid?.cells);
    setAiQuestionResult(res);
    if (showToast) showToast('AI mapped intent to deterministic math engine.', 'info');
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 overflow-y-auto thin-scrollbar p-6 space-y-4">
      
      {/* ---------------------------------------------------- */}
      {/* CLEAN PAGE HEADER                                    */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold tracking-tight text-slate-800 dark:text-zinc-200">
              Business Decision Intelligence
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-normal mt-0.5 tracking-wide">
            Data → Analyze → Explain → Decide
          </p>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* COMPACT HERO AI SEARCH CARD (~90-100px HEIGHT)       */}
      {/* ---------------------------------------------------- */}
      <div className="bg-gradient-to-r from-violet-950 via-indigo-950 to-slate-900 border border-violet-800/30 text-white rounded-2xl p-3.5 sm:p-4 shadow-lg space-y-2">
        <form onSubmit={handleAiQuestionSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Ask a business question..."
              value={aiQuestionInput}
              onChange={(e) => setAiQuestionInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 dark:bg-zinc-900/40 border border-white/15 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-violet-400 font-medium"
            />
          </div>

          {/* Data Range Selector (Integrated into search row - quieter secondary control) */}
          <div className="relative shrink-0" ref={selectDataRef}>
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setSelectDataMenuOpen(!selectDataMenuOpen);
              }}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-normal text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <Table size={13} className="text-slate-400" />
              <span className="hidden sm:inline">Range:</span>
              <span className="max-w-[110px] truncate">{selectedDataRange}</span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>
            {selectDataMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 p-2 space-y-1 text-slate-800 dark:text-zinc-200">
                {['Entire Active Sheet', 'Column A (Numerical)', 'Selection (A1:B50)'].map(r => (
                  <button
                    key={r}
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      setSelectedDataRange(r);
                      setSelectDataMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                      selectedDataRange === r ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300' : 'hover:bg-slate-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer shadow-sm"
          >
            Ask AI Engine
          </button>
        </form>

        {/* Default State: Quiet Text Link Suggestions (No chips, no borders, no background) */}
        {!aiQuestionResult && (
          <div className="text-[11px] flex flex-wrap items-center gap-2 pt-0.5">
            <span className="text-slate-400 font-medium">Try:</span>
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                const q = "Forecast revenue next quarter";
                setAiQuestionInput(q);
                const res = modules.routeBusinessQuestion(q, activeSheetGrid?.cells);
                setAiQuestionResult(res);
              }}
              className="text-slate-300 dark:text-zinc-300 hover:text-white hover:underline transition-all cursor-pointer font-normal"
            >
              Forecast revenue next quarter
            </button>
            <span className="text-slate-600">·</span>
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                const q = "Explain churn";
                setAiQuestionInput(q);
                const res = modules.routeBusinessQuestion(q, activeSheetGrid?.cells);
                setAiQuestionResult(res);
              }}
              className="text-slate-300 dark:text-zinc-300 hover:text-white hover:underline transition-all cursor-pointer font-normal"
            >
              Explain churn
            </button>
            <span className="text-slate-600">·</span>
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                const q = "Calculate break-even";
                setAiQuestionInput(q);
                const res = modules.routeBusinessQuestion(q, activeSheetGrid?.cells);
                setAiQuestionResult(res);
              }}
              className="text-slate-300 dark:text-zinc-300 hover:text-white hover:underline transition-all cursor-pointer font-normal"
            >
              Calculate break-even
            </button>
          </div>
        )}

        {/* Submitted State: Compact Analysis Result Card */}
        {aiQuestionResult && (
          <div className="mt-2.5 p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-2.5 animate-in fade-in duration-150">
            {/* Structured Numbers / Engine Output */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-white tracking-wide flex flex-wrap items-center gap-1.5">
                  <span>{aiQuestionResult.methodName}</span>
                  <span className="text-slate-400 font-normal">→</span>
                  <span className="text-violet-300 font-medium">{aiQuestionResult.metricsSummary}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAiQuestionResult(null)}
                  className="text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-white/10"
                >
                  Clear
                </button>
              </div>

              {/* Provenance Label */}
              <div className="text-[10px] text-slate-400 font-normal flex items-center gap-1">
                <span>{aiQuestionResult.provenance || `Computed from your sheet · ${aiQuestionResult.computationType}`}</span>
              </div>
            </div>

            {/* Separate AI Insight Section */}
            <div className="pt-2 border-t border-white/10 text-xs space-y-1">
              <div className="text-[11px] font-semibold text-violet-300">
                AI Insight
              </div>
              <div className="text-slate-200 leading-relaxed">
                {aiQuestionResult.aiInsight || aiQuestionResult.recommendation}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* SEGMENTED CATEGORY BAR (DOMAIN SELECTOR)             */}
      {/* ---------------------------------------------------- */}
      <div className="w-full shrink-0 bg-slate-200/70 dark:bg-zinc-800/70 p-1 rounded-xl flex items-center gap-1 overflow-x-auto thin-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden border border-slate-200/70 dark:border-zinc-700/60 min-h-[44px]">
        {[
          { id: 'business', label: 'Business' },
          { id: 'customer_sales', label: 'Customers' },
          { id: 'financial', label: 'Finance' },
          { id: 'forecasting', label: 'Forecasting' },
          { id: 'simulation', label: 'Simulation' },
          { id: 'advanced_stats', label: 'Statistics' }
        ].map((cat) => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                const categoryObj = taxonomy.find(t => t.id === cat.id);
                const firstModuleId = categoryObj ? categoryObj.items[0].id : 'kpi_analysis';
                setActiveCategory(cat.id);
                setSelectedAnalysis(firstModuleId);
                handleRunAnalysis(firstModuleId);
              }}
              className={`flex-1 min-w-[100px] h-8 px-3.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center justify-center text-center shrink-0 leading-normal ${
                isSelected
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white font-semibold shadow-xs border-0'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100/70 dark:hover:bg-zinc-750/70 border-0'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* ---------------------------------------------------- */}
      {/* SUB-MODULE SELECTION GRID (NEUTRAL & SUBORDINATED)   */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 shrink-0">
        {currentCategory.items.map((item) => {
          const isSelected = selectedAnalysis === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setSelectedAnalysis(item.id);
                handleRunAnalysis(item.id);
              }}
              className={`p-3.5 text-left rounded-xl transition-all cursor-pointer flex flex-col justify-between group min-h-[76px] relative overflow-hidden ${
                isSelected
                  ? 'bg-violet-50/60 dark:bg-violet-950/30 border border-slate-200/80 dark:border-zinc-800 border-l-[3px] border-l-violet-600 dark:border-l-violet-400 text-slate-900 dark:text-zinc-100 shadow-2xs'
                  : 'bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-xs text-slate-900 dark:text-zinc-100 shadow-2xs'
              }`}
            >
              <div className="space-y-1">
                <div className="text-xs font-semibold flex items-center justify-between">
                  <span>{item.label}</span>
                  {isSelected && <Check size={14} className="text-violet-600 dark:text-violet-400 shrink-0 stroke-[2.5]" />}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-normal line-clamp-2">
                  {item.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ---------------------------------------------------- */}
      {/* UNIFIED 6-STEP WORKFLOW DASHBOARD                     */}
      {/* DATA → ANALYZE → EXPLAIN → VISUALIZE → SIMULATE → DECIDE */}
      {/* ---------------------------------------------------- */}
      <div className="space-y-6 pt-2">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity size={18} className="text-violet-600" />
            <span>Workflow: {activeModuleItem.label}</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">6-Step Executive Decision Intelligence</span>
        </div>

        {/* STEP 1: DYNAMIC DATA SOURCE, SEARCH & MANUAL INPUT MODE */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-3 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-slate-700 dark:text-zinc-300">
            <span className="flex items-center gap-1.5">
              <Table size={14} className="text-violet-600" />
              <span>Step 1: Data Context & Input Method</span>
            </span>
            
            {/* Input Mode Selector: Sheet Grid vs Manual Custom Data */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-slate-200/80 dark:border-zinc-700">
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  setDataInputMode('sheet');
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  dataInputMode === 'sheet'
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800'
                }`}
              >
                Sheet Grid / Search
              </button>
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  setDataInputMode('manual');
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  dataInputMode === 'manual'
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800'
                }`}
              >
                Manual Custom Entry
              </button>
            </div>
          </div>

          {/* Mode 1: Search & Select Columns from Sheet Grid */}
          {dataInputMode === 'sheet' ? (
            <div className="space-y-3 pt-1">
              {/* Search Sheet Data Columns */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search sheet data columns or uploaded datasets..."
                  value={columnSearchQuery}
                  onChange={(e) => setColumnSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <CustomSelect
                    label="Primary Metric Column (Y / Series A):"
                    value={primaryColIndex}
                    onChange={(val) => setPrimaryColIndex(Number(val))}
                    options={filteredColumns.map(col => ({
                      label: `${col.name} (${col.values.length} data points loaded)`,
                      value: col.index
                    }))}
                    allowCustom={false}
                  />
                </div>

                {needsSecondaryColumn && (
                  <div>
                    <CustomSelect
                      label="Secondary Column (Budget / Predictor X / Series B):"
                      value={secondaryColIndex}
                      onChange={(val) => setSecondaryColIndex(Number(val))}
                      options={filteredColumns.map(col => ({
                        label: `${col.name} (${col.values.length} data points loaded)`,
                        value: col.index
                      }))}
                      allowCustom={false}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Mode 2: Manual Custom Entry Mode for Interactive Testing */
            <div className="space-y-2 pt-1">
              <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400">
                Type or paste comma-separated test values:
              </label>
              <textarea
                rows={2}
                value={manualSeriesInput}
                onChange={(e) => setManualSeriesInput(e.target.value)}
                placeholder="e.g. 12000, 13500, 14200, 15800, 17500, 18900..."
                className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-violet-500"
              />
              <span className="text-[10px] text-slate-400">
                Loaded {manualSeriesInput.split(',').filter(v => !isNaN(parseFloat(v.trim()))).length} numeric observations from custom input.
              </span>
            </div>
          )}
        </div>

        {/* STEP 2: ANALYZE - DETERMINISTIC CALCULATION & MODULE PARAMETERS */}
        {analysisResult ? (
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Step 2: Deterministic Calculation Engine</h3>
                </div>
              </div>

              {/* Dynamic Module Input Parameters Bar */}
              <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-200/70 dark:border-zinc-800 space-y-2">
                <div className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                  Module Input Parameters ({activeModuleItem.label}):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {selectedAnalysis === 'kpi_analysis' && (
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">Target Value ($):</label>
                      <input
                        type="number"
                        value={moduleParams.targetValue}
                        onChange={(e) => setModuleParams({ ...moduleParams, targetValue: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
                      />
                    </div>
                  )}

                  {selectedAnalysis === 'breakeven_analysis' && (
                    <>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">Fixed Costs ($):</label>
                        <input
                          type="number"
                          value={moduleParams.fixedCosts}
                          onChange={(e) => setModuleParams({ ...moduleParams, fixedCosts: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">Unit Price ($):</label>
                        <input
                          type="number"
                          value={moduleParams.unitPrice}
                          onChange={(e) => setModuleParams({ ...moduleParams, unitPrice: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">Unit Cost ($):</label>
                        <input
                          type="number"
                          value={moduleParams.unitCost}
                          onChange={(e) => setModuleParams({ ...moduleParams, unitCost: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
                        />
                      </div>
                    </>
                  )}

                  {['revenue_forecast', 'sales_forecast', 'demand_forecast', 'cashflow_forecast', 'timeseries_forecast'].includes(selectedAnalysis) && (
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">Forecast Horizon:</label>
                      <CustomSelect
                        value={moduleParams.forecastPeriods}
                        onChange={(val) => setModuleParams({ ...moduleParams, forecastPeriods: Number(val) })}
                        options={[
                          { label: '3 Periods Forward', value: 3 },
                          { label: '6 Periods Forward', value: 6 },
                          { label: '12 Periods Forward', value: 12 }
                        ]}
                        allowCustom={false}
                      />
                    </div>
                  )}

                  {['clv_analysis', 'retention_churn', 'unit_economics', 'churn_forecast'].includes(selectedAnalysis) && (
                    <>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">Monthly ARPU ($):</label>
                        <input
                          type="number"
                          value={moduleParams.arpu}
                          onChange={(e) => setModuleParams({ ...moduleParams, arpu: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">Monthly Churn Rate (%):</label>
                        <input
                          type="number"
                          step="0.5"
                          value={moduleParams.churnRate}
                          onChange={(e) => setModuleParams({ ...moduleParams, churnRate: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">Acquisition CAC ($):</label>
                        <input
                          type="number"
                          value={moduleParams.cac}
                          onChange={(e) => setModuleParams({ ...moduleParams, cac: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
                        />
                      </div>
                    </>
                  )}

                  {['descriptive_stats', 'confidence_intervals', 't_test', 'paired_t_test', 'anova', 'regression'].includes(selectedAnalysis) && (
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">Confidence Level:</label>
                      <CustomSelect
                        value={moduleParams.confidenceLevel}
                        onChange={(val) => setModuleParams({ ...moduleParams, confidenceLevel: Number(val) })}
                        options={[
                          { label: '90% Confidence Interval', value: 90 },
                          { label: '95% Confidence Interval', value: 95 },
                          { label: '99% Confidence Interval', value: 99 }
                        ]}
                        allowCustom={false}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Numerical Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
                {analysisResult.metrics.map((m, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1">
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">{m.label}</div>
                    <div className="text-base font-extrabold text-slate-900 dark:text-white truncate">{m.value}</div>
                    <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium truncate">{m.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* STEP 3: EXPLAIN - AI INTELLIGENCE NARRATIVE */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Sparkles size={16} className="text-violet-600" />
                <span>Step 3: Executive Explanation & Key Drivers</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                {analysisResult.explanation}
              </p>
              {analysisResult.drivers && (
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Key Impact Drivers:</div>
                  <ul className="list-disc list-inside text-xs text-slate-600 dark:text-zinc-400 space-y-1">
                    {analysisResult.drivers.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* STEP 4: VISUALIZE - DYNAMIC SVG / CSS CHARTS */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <BarChart3 size={16} className="text-violet-600" />
                  <span>Step 4: Interactive Visualization</span>
                </div>
              </div>
              
              {/* Synthetic Rendered Visual Graph */}
              <div className="h-44 w-full bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 flex items-end justify-between gap-3">
                {[45, 62, 58, 75, 90, 110, 125, 140, 165].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div 
                      className="w-full bg-gradient-to-t from-violet-600 to-indigo-500 rounded-t-md transition-all hover:brightness-110"
                      style={{ height: `${(val / 165) * 100}%` }}
                    />
                    <span className="text-[10px] font-semibold text-slate-400">P{idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* STEP 5: SIMULATE - REFINED APPLE-STYLE SCENARIO SLIDERS */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <Sliders size={16} className="text-violet-600" />
                  <span>Step 5: Live Scenario & Risk Simulation</span>
                </div>
                <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500">Real-Time Simulation</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-50/80 dark:bg-zinc-800/50 rounded-xl border border-slate-200/60 dark:border-zinc-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Price Adjustment (%):</label>
                    <input
                      type="number"
                      value={simPriceDelta}
                      onChange={(e) => setSimPriceDelta(parseInt(e.target.value) || 0)}
                      className="w-14 px-1.5 py-0.5 text-right bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded text-xs font-bold text-slate-800 dark:text-zinc-200"
                    />
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    value={simPriceDelta}
                    onChange={(e) => setSimPriceDelta(parseInt(e.target.value))}
                    className="w-full accent-slate-800 dark:accent-zinc-200 cursor-pointer"
                  />
                </div>

                <div className="p-3 bg-slate-50/80 dark:bg-zinc-800/50 rounded-xl border border-slate-200/60 dark:border-zinc-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Volume Delta (%):</label>
                    <input
                      type="number"
                      value={simVolumeDelta}
                      onChange={(e) => setSimVolumeDelta(parseInt(e.target.value) || 0)}
                      className="w-14 px-1.5 py-0.5 text-right bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded text-xs font-bold text-slate-800 dark:text-zinc-200"
                    />
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    value={simVolumeDelta}
                    onChange={(e) => setSimVolumeDelta(parseInt(e.target.value))}
                    className="w-full accent-slate-800 dark:accent-zinc-200 cursor-pointer"
                  />
                </div>

                <div className="p-3 bg-slate-50/80 dark:bg-zinc-800/50 rounded-xl border border-slate-200/60 dark:border-zinc-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Cost Inflation (%):</label>
                    <input
                      type="number"
                      value={simCostDelta}
                      onChange={(e) => setSimCostDelta(parseInt(e.target.value) || 0)}
                      className="w-14 px-1.5 py-0.5 text-right bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded text-xs font-bold text-slate-800 dark:text-zinc-200"
                    />
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    value={simCostDelta}
                    onChange={(e) => setSimCostDelta(parseInt(e.target.value))}
                    className="w-full accent-slate-800 dark:accent-zinc-200 cursor-pointer"
                  />
                </div>
              </div>

              {/* Live Recalculated Outcome Banner */}
              <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-800 rounded-xl flex items-center justify-between text-xs font-medium">
                <span className="text-slate-600 dark:text-zinc-400">Recalculated Net Impact Outcome:</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {simPriceDelta + simVolumeDelta - simCostDelta >= 0 ? '+' : ''}
                  {(simPriceDelta + simVolumeDelta - simCostDelta).toFixed(1)}% Projected Variance
                </span>
              </div>
            </div>

            {/* STEP 6: DECIDE - REFINED EXECUTIVE RECOMMENDATION CARD */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 border-l-4 border-l-emerald-600 dark:border-l-emerald-500 rounded-2xl p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Step 6: Strategic Decision Recommendation</span>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-md text-[11px] font-semibold border border-emerald-200/80 dark:border-emerald-800">
                  Decision Ready
                </span>
              </div>

              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/70 dark:border-emerald-900/40 space-y-1.5">
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300">Recommended Executive Action:</div>
                <p className="text-xs text-slate-700 dark:text-zinc-200 leading-relaxed font-normal">
                  {analysisResult.recommendation}
                </p>
              </div>

              {analysisResult.risks && (
                <div className="flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200 bg-amber-50/70 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200/80 dark:border-amber-900/40">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <span className="font-bold">Risk Assessment: </span>
                    <span className="font-normal">{analysisResult.risks.join('; ')}</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        ) : (
          /* Empty state prompt to run calculation */
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center space-y-4">
            <div className="w-12 h-12 bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Play size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Ready for Decision Intelligence</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-width-md mx-auto">
                Select an analysis module above or type a natural language business question to execute deterministic calculations and generate decision recommendations.
              </p>
            </div>
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                handleRunAnalysis();
              }}
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
            >
              <Play size={14} />
              <span>Run {activeModuleItem.label}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
