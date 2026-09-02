import * as modules from './AnalyticsModules';

class AnalyticsRegistry {
  constructor() {
    this.plugins = new Map();
    this.auditLogs = [];
    this.permissions = new Map();
    this.rateLimits = new Map();
    this.pendingConfirmations = [];

    // Auto-register standard analytical modules
    this.initDefaultModules();
  }

  // Registers a module plugin dynamically
  registerModule(id, pluginConfig) {
    if (this.plugins.has(id)) {
      console.warn(`Plugin with id ${id} is already registered. Overwriting.`);
    }
    if (!pluginConfig.name || !pluginConfig.category || typeof pluginConfig.execute !== 'function') {
      throw new Error(`Invalid plugin configuration for ${id}`);
    }
    this.plugins.set(id, {
      id,
      ...pluginConfig
    });
  }

  // Get all registered plugins grouped by category
  getPluginsByCategory() {
    const categories = {};
    for (const [id, plugin] of this.plugins.entries()) {
      if (!categories[plugin.category]) {
        categories[plugin.category] = [];
      }
      categories[plugin.category].push(plugin);
    }
    return categories;
  }

  // Checks rate limits for a given agent
  checkRateLimit(agentId) {
    const now = Date.now();
    const timeframe = 60000;
    const limit = 30;

    if (!this.rateLimits.has(agentId)) {
      this.rateLimits.set(agentId, []);
    }

    const timestamps = this.rateLimits.get(agentId).filter(ts => now - ts < timeframe);
    timestamps.push(now);
    this.rateLimits.set(agentId, timestamps);

    return timestamps.length <= limit;
  }

  // Check permissions
  checkPermission(agentId, toolId) {
    if (!this.permissions.has(agentId)) return true;
    return this.permissions.get(agentId).has(toolId);
  }

  // Logs tool execution audit trail
  logAudit(agentId, toolId, params, success, outcomeMessage) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      agentId,
      toolId,
      params: JSON.stringify(params),
      status: success ? 'SUCCESS' : 'FAILED',
      details: outcomeMessage
    };
    this.auditLogs.unshift(logEntry);
    if (this.auditLogs.length > 200) {
      this.auditLogs.pop();
    }
  }

  // Queue confirmation for sensitive actions
  queueConfirmation(agentId, toolId, description, onConfirm, onCancel) {
    const confirmationId = 'conf-' + Math.random().toString(36).substr(2, 9);
    const confItem = {
      id: confirmationId,
      agentId,
      toolId,
      description,
      status: 'PENDING',
      timestamp: Date.now(),
      confirm: () => {
        confItem.status = 'APPROVED';
        this.logAudit(agentId, toolId, { confirmed: true }, true, 'Approved sensitive action: ' + description);
        onConfirm();
      },
      cancel: () => {
        confItem.status = 'REJECTED';
        this.logAudit(agentId, toolId, { confirmed: false }, false, 'Rejected sensitive action: ' + description);
        onCancel();
      }
    };
    this.pendingConfirmations.push(confItem);
    return confirmationId;
  }

  // Expose callable tools for agents
  async callAgentTool(agentId, toolId, params = {}) {
    if (!this.checkRateLimit(agentId)) {
      this.logAudit(agentId, toolId, params, false, 'Rate limit exceeded');
      throw new Error(`Rate limit exceeded for agent ${agentId}.`);
    }

    if (!this.checkPermission(agentId, toolId)) {
      this.logAudit(agentId, toolId, params, false, 'Permission denied');
      throw new Error(`Agent ${agentId} does not have permission for tool ${toolId}.`);
    }

    const plugin = this.plugins.get(toolId);
    if (!plugin) {
      this.logAudit(agentId, toolId, params, false, 'Tool not found');
      throw new Error(`Tool ${toolId} not registered in Analytics Workspace.`);
    }

    if (plugin.validate) {
      const validationError = plugin.validate(params);
      if (validationError) {
        this.logAudit(agentId, toolId, params, false, `Validation error: ${validationError}`);
        throw new Error(`Input validation failed: ${validationError}`);
      }
    }

    if (plugin.isSensitive || params.writeBackToSheet) {
      return new Promise((resolve, reject) => {
        this.queueConfirmation(
          agentId,
          toolId,
          `Agent wants to execute "${plugin.name}" and write back results.`,
          () => {
            try {
              const res = plugin.execute(params.data, params.options);
              resolve({ status: 'SUCCESS', data: res });
            } catch (err) {
              reject(err);
            }
          },
          () => reject(new Error('Sensitive action rejected by user.'))
        );
      });
    }

    try {
      const result = plugin.execute(params.data, params.options);
      this.logAudit(agentId, toolId, params, true, 'Tool executed successfully');
      return { status: 'SUCCESS', data: result };
    } catch (error) {
      this.logAudit(agentId, toolId, params, false, `Execution error: ${error.message}`);
      throw error;
    }
  }

  // Register all analytical plugins across the 6 categories
  initDefaultModules() {
    // ----------------------------------------------------
    // 1. BUSINESS ANALYSIS (DETERMINISTIC)
    // ----------------------------------------------------
    this.registerModule('kpi_analysis', {
      name: 'KPI Analysis',
      category: 'Business Analysis',
      description: 'Calculates core business metrics, target attainment, CAGR, and alert thresholds.',
      execute: (data, opts) => modules.runKPIAnalysis(data, opts?.target)
    });

    this.registerModule('trend_analysis', {
      name: 'Trend Analysis',
      category: 'Business Analysis',
      description: 'Determines growth direction, slope, acceleration, and 3-period moving average.',
      execute: (data) => modules.runTrendAnalysis(data)
    });

    this.registerModule('variance_analysis', {
      name: 'Variance Analysis',
      category: 'Business Analysis',
      description: 'Compares actual performance vs budget targets to isolate favorable/unfavorable deltas.',
      execute: (data, opts) => modules.runVarianceAnalysis(data, opts?.budgets)
    });

    this.registerModule('growth_analysis', {
      name: 'Growth Analysis',
      category: 'Business Analysis',
      description: 'Computes period-over-period growth rates, absolute expansion, and CAGR.',
      execute: (data) => modules.runGrowthAnalysis(data)
    });

    this.registerModule('profitability_analysis', {
      name: 'Profitability Analysis',
      category: 'Business Analysis',
      description: 'Evaluates Gross Profit, EBITDA, Operating Margin %, and Net Profit Margins.',
      execute: (data, opts) => modules.runProfitabilityAnalysis(opts?.revenue || data, opts?.cogs, opts?.opex)
    });

    this.registerModule('pareto_analysis', {
      name: 'Pareto Analysis (80/20 Rule)',
      category: 'Business Analysis',
      description: 'Identifies the top 20% of drivers generating 80% of total output.',
      execute: (data, opts) => modules.runParetoAnalysis(opts?.items, data)
    });

    this.registerModule('anomaly_detection', {
      name: 'Anomaly Detection',
      category: 'Business Analysis',
      description: 'Scans matrix series for statistical Z-score spikes and severe dips.',
      execute: (data, opts) => modules.runAnomalyDetection(data, opts?.threshold)
    });

    // ----------------------------------------------------
    // 2. CUSTOMER & SALES ANALYSIS (DETERMINISTIC)
    // ----------------------------------------------------
    this.registerModule('cohort_analysis', {
      name: 'Cohort Analysis',
      category: 'Customer & Sales Analysis',
      description: 'Calculates period-by-period customer retention matrices and cohort decay rates.',
      execute: (data) => modules.runCohortAnalysis(data)
    });

    this.registerModule('retention_churn', {
      name: 'Retention & Churn Analysis',
      category: 'Customer & Sales Analysis',
      description: 'Tracks net user additions, retention rate %, and monthly churn rate %.',
      execute: (data, opts) => modules.runRetentionChurnAnalysis(opts?.start, opts?.newUsers, opts?.end)
    });

    this.registerModule('clv_analysis', {
      name: 'Customer Lifetime Value (CLV)',
      category: 'Customer & Sales Analysis',
      description: 'Computes Simple & Discounted CLV, CAC Payback period, and LTV:CAC ratios.',
      execute: (data, opts) => modules.runCLVAnalysis(opts?.arpu, opts?.grossMarginPct, opts?.churnRatePct)
    });

    this.registerModule('sales_funnel', {
      name: 'Sales Funnel Analysis',
      category: 'Customer & Sales Analysis',
      description: 'Analyzes stage-to-stage pipeline conversion rates and isolates conversion bottlenecks.',
      execute: (data) => modules.runSalesFunnelAnalysis(data)
    });

    this.registerModule('conversion_analysis', {
      name: 'Conversion Analysis',
      category: 'Customer & Sales Analysis',
      description: 'Measures acquisition efficiency from raw visitors down to closed sales wins.',
      execute: (data, opts) => modules.runConversionAnalysis(opts?.visitors, opts?.leads, opts?.opps, opts?.wins)
    });

    this.registerModule('customer_segmentation', {
      name: 'Customer Segmentation',
      category: 'Customer & Sales Analysis',
      description: 'Categorizes customers into Champions, Loyal, At-Risk, and Inactive RFM tiers.',
      execute: (data) => modules.runCustomerSegmentation(data)
    });

    // ----------------------------------------------------
    // 3. FINANCIAL ANALYSIS (DETERMINISTIC)
    // ----------------------------------------------------
    this.registerModule('revenue_analysis', {
      name: 'Revenue Analysis',
      category: 'Financial Analysis',
      description: 'Audits total top-line revenue, run-rate, CAGR, and next-period projection.',
      execute: (data) => modules.runRevenueAnalysis(data)
    });

    this.registerModule('margin_analysis', {
      name: 'Margin Analysis',
      category: 'Financial Analysis',
      description: 'Decomposes Gross, Contribution, Operating, and Net Profit Margin ratios.',
      execute: (data, opts) => modules.runMarginAnalysis(opts?.revenue, opts?.cogs, opts?.opex)
    });

    this.registerModule('breakeven_analysis', {
      name: 'Break-Even Analysis',
      category: 'Financial Analysis',
      description: 'Calculates break-even unit volume, revenue threshold, and degree of operating leverage.',
      execute: (data, opts) => modules.runBreakEvenAnalysis(opts?.fixedCosts, opts?.variableCost, opts?.price)
    });

    this.registerModule('unit_economics', {
      name: 'Unit Economics',
      category: 'Financial Analysis',
      description: 'Evaluates LTV, CAC, payback period, and contribution margin per customer.',
      execute: (data, opts) => modules.runUnitEconomics(opts?.cac, opts?.arpu, opts?.marginPct, opts?.churnPct)
    });

    this.registerModule('cash_flow_analysis', {
      name: 'Cash Flow Analysis',
      category: 'Financial Analysis',
      description: 'Calculates Operating, Investing, Financing Cash Flows, Free Cash Flow, and Runway.',
      execute: (data, opts) => modules.runCashFlowAnalysis(opts?.operating, opts?.investing, opts?.financing, opts?.startCash)
    });

    this.registerModule('budget_vs_actual', {
      name: 'Budget vs Actual Analysis',
      category: 'Financial Analysis',
      description: 'Measures financial variance against budgeted line items.',
      execute: (data, opts) => modules.runBudgetVsActualAnalysis(data, opts?.budgets)
    });

    this.registerModule('financial_ratios', {
      name: 'Financial Ratio Analysis',
      category: 'Financial Analysis',
      description: 'Computes Current Ratio, Quick Ratio, Debt-to-Equity, ROE, ROA, and Asset Turnover.',
      execute: (data) => modules.runFinancialRatioAnalysis(data)
    });

    // ----------------------------------------------------
    // 4. FORECASTING (COMPUTATIONAL TIME-SERIES)
    // ----------------------------------------------------
    this.registerModule('revenue_forecast', {
      name: 'Revenue Forecast',
      category: 'Forecasting',
      description: 'Time-series revenue projection using exponential smoothing.',
      execute: (data, opts) => modules.runRevenueForecast(data, opts?.periods)
    });

    this.registerModule('sales_forecast', {
      name: 'Sales Forecast',
      category: 'Forecasting',
      description: 'Linear trend sales projection with upper/lower confidence bounds.',
      execute: (data, opts) => modules.runSalesForecast(data, opts?.periods)
    });

    this.registerModule('demand_forecast', {
      name: 'Demand Forecast',
      category: 'Forecasting',
      description: '3-period moving average demand forecasting model.',
      execute: (data, opts) => modules.runDemandForecast(data, opts?.periods)
    });

    this.registerModule('cashflow_forecast', {
      name: 'Cash Flow Forecast',
      category: 'Forecasting',
      description: 'Projects future cash inflows, outflows, and net cash balances over N periods.',
      execute: (data, opts) => modules.runCashFlowForecast(opts?.inflows, opts?.outflows, opts?.startCash, opts?.periods)
    });

    this.registerModule('churn_forecast', {
      name: 'Churn Forecast',
      category: 'Forecasting',
      description: 'Projects customer attrition and retained customer base over future periods.',
      execute: (data, opts) => modules.runChurnForecast(opts?.currentCustomers, opts?.churnRatePct, opts?.periods)
    });

    this.registerModule('timeseries_forecast', {
      name: 'Time-Series Forecasting Engine',
      category: 'Forecasting',
      description: 'Generates fitted values, future forecasts, and 95% confidence bounds.',
      execute: (data, opts) => modules.runTimeSeriesForecasting(data, opts?.periods, opts?.method)
    });

    // ----------------------------------------------------
    // 5. SIMULATION & SCENARIOS (MATH ENGINES)
    // ----------------------------------------------------
    this.registerModule('monte_carlo', {
      name: 'Monte Carlo Simulation',
      category: 'Simulation & Scenarios',
      description: 'Generates multi-path stochastic simulations with P10/P50/P90 aggregated portfolio percentile limits.',
      execute: (data, opts) => modules.runMonteCarloSimulation(opts?.baseValue || 100000, opts?.stdDev || 0.15, opts?.runs || 500, opts?.steps || 12, opts?.lineItems || null)
    });

    this.registerModule('what_if_analysis', {
      name: 'What-If Analysis',
      category: 'Simulation & Scenarios',
      description: 'Evaluates outcome changes resulting from price, volume, or cost adjustments.',
      execute: (data, opts) => modules.runWhatIfAnalysis(opts?.baseValue || 100000, opts?.priceDeltaPct, opts?.volumeDeltaPct, opts?.cogsDeltaPct)
    });

    this.registerModule('scenario_analysis', {
      name: 'Scenario Analysis',
      category: 'Simulation & Scenarios',
      description: 'Generates Bull, Base, and Bear case financial scenarios.',
      execute: (data, opts) => modules.runScenarioAnalysis(opts?.baseValue || 100000)
    });

    this.registerModule('sensitivity_analysis', {
      name: 'Sensitivity Analysis',
      category: 'Simulation & Scenarios',
      description: '2D matrix evaluation testing outcome sensitivity across price and volume steps.',
      execute: (data, opts) => modules.runSensitivityAnalysis(opts?.baseValue || 100000)
    });

    this.registerModule('risk_analysis', {
      name: 'Risk Analysis (VaR)',
      category: 'Simulation & Scenarios',
      description: 'Calculates Sharpe Ratio, Value at Risk (VaR), and historical return distributions.',
      execute: (data, opts) => modules.runRiskAnalysis(data, opts?.confidenceLevel, opts?.riskFreeRate)
    });

    this.registerModule('goal_seek', {
      name: 'Goal Seek Solver',
      category: 'Simulation & Scenarios',
      description: 'Solves for exact required unit sales or price to achieve target profit.',
      execute: (data, opts) => modules.runGoalSeek(opts?.targetNetProfit, opts?.initialUnits, opts?.price, opts?.cost, opts?.fixedCosts)
    });

    this.registerModule('optimization_engine', {
      name: 'Optimization Engine',
      category: 'Simulation & Scenarios',
      description: 'Allocates limited budgets across channels to maximize return on investment.',
      execute: (data, opts) => modules.runOptimizationEngine(opts?.budget, opts?.costs, opts?.roas)
    });

    // ----------------------------------------------------
    // 6. ADVANCED STATISTICS (STATISTICAL ENGINES)
    // ----------------------------------------------------
    this.registerModule('descriptive_stats', {
      name: 'Descriptive Statistics',
      category: 'Advanced Statistics',
      description: 'Calculates mean, median, std dev, variance, min, max, and standard error.',
      execute: (data) => modules.runDescriptiveStatistics(data)
    });

    this.registerModule('t_test', {
      name: 'Independent T-Test',
      category: 'Advanced Statistics',
      description: 'Performs independent two-sample t-test between group A and group B columns.',
      execute: (data, opts) => modules.runTTest(opts?.groupA || data.groupA, opts?.groupB || data.groupB)
    });

    this.registerModule('paired_t_test', {
      name: 'Paired T-Test',
      category: 'Advanced Statistics',
      description: 'Compares before/after measurements on paired observations.',
      execute: (data, opts) => modules.runPairedTTest(opts?.groupA || data.groupA, opts?.groupB || data.groupB)
    });

    this.registerModule('anova', {
      name: 'One-Way ANOVA',
      category: 'Advanced Statistics',
      description: 'Calculates Analysis of Variance across multiple categorical groupings.',
      execute: (data) => modules.runANOVA(data)
    });

    this.registerModule('chi_square', {
      name: 'Chi-Square Test',
      category: 'Advanced Statistics',
      description: 'Tests independence between categorical variables in an observed matrix.',
      execute: (data) => modules.runChiSquare(data)
    });

    this.registerModule('correlation', {
      name: 'Pearson Correlation',
      category: 'Advanced Statistics',
      description: 'Measures correlation coefficient r and determination r2 between variables.',
      execute: (data, opts) => modules.runCorrelation(opts?.x || data.x, opts?.y || data.y)
    });

    this.registerModule('regression', {
      name: 'Linear Regression',
      category: 'Advanced Statistics',
      description: 'Models linear relationship y = mx + b, slope, intercept, and r-squared.',
      execute: (data, opts) => modules.runRegression(opts?.x || data.x, opts?.y || data.y)
    });

    this.registerModule('confidence_intervals', {
      name: 'Confidence Intervals',
      category: 'Advanced Statistics',
      description: 'Calculates upper and lower margin of error bounds at 90%, 95%, or 99% levels.',
      execute: (data, opts) => modules.runConfidenceIntervals(data, opts?.confidenceLevel)
    });

    this.registerModule('probability_distributions', {
      name: 'Probability Distributions',
      category: 'Advanced Statistics',
      description: 'Computes Normal probability density functions.',
      execute: (data, opts) => modules.runProbabilityDistribution(opts?.type, opts?.params)
    });

    this.registerModule('data_sampling', {
      name: 'Data Sampling',
      category: 'Advanced Statistics',
      description: 'Extracts representative subsets using random or systematic sampling.',
      execute: (data, opts) => modules.runDataSampling(data, opts?.method, opts?.count)
    });

    // ----------------------------------------------------
    // 7. AI INTENT ROUTER
    // ----------------------------------------------------
    this.registerModule('ai_business_router', {
      name: 'AI Business Question Router',
      category: 'AI Intent Routing',
      description: 'Maps natural language questions directly to deterministic computational engines.',
      execute: (data, opts) => modules.routeBusinessQuestion(opts?.question, data)
    });
  }
}

export const registry = new AnalyticsRegistry();
export default registry;
