import * as modules from './AnalyticsModules.js';

class AnalyticsRegistry {
  constructor() {
    this.plugins = new Map();
    this.auditLogs = [];
    this.permissions = new Map(); // agentId -> Set of allowed tool IDs
    this.rateLimits = new Map(); // agentId -> array of timestamps
    this.pendingConfirmations = []; // queue of sensitive tasks needing user click

    // Auto-register standard analytical modules
    this.initDefaultModules();
  }

  // Registers a module plugin dynamically
  registerModule(id, pluginConfig) {
    if (this.plugins.has(id)) {
      console.warn(`Plugin with id ${id} is already registered. Overwriting.`);
    }
    // Validation of config
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

  // Checks rate limits for a given agent (e.g. max 15 requests per minute)
  checkRateLimit(agentId) {
    const now = Date.now();
    const timeframe = 60000; // 1 minute
    const limit = 15;

    if (!this.rateLimits.has(agentId)) {
      this.rateLimits.set(agentId, []);
    }

    const timestamps = this.rateLimits.get(agentId).filter(ts => now - ts < timeframe);
    timestamps.push(now);
    this.rateLimits.set(agentId, timestamps);

    return timestamps.length <= limit;
  }

  // Check if agent is permitted to call a tool
  checkPermission(agentId, toolId) {
    if (!this.permissions.has(agentId)) {
      // Default: Allow all agents to run basic calculations, but restrict writes
      return true;
    }
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
    this.auditLogs.unshift(logEntry); // new items first
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
        this.logAudit(agentId, toolId, { confirmed: true }, true, 'User approved sensitive action: ' + description);
        onConfirm();
      },
      cancel: () => {
        confItem.status = 'REJECTED';
        this.logAudit(agentId, toolId, { confirmed: false }, false, 'User rejected sensitive action: ' + description);
        onCancel();
      }
    };
    this.pendingConfirmations.push(confItem);
    return confirmationId;
  }

  // Expose callable tools for AI agents
  async callAgentTool(agentId, toolId, params = {}) {
    // 1. Rate Limiting Check
    if (!this.checkRateLimit(agentId)) {
      this.logAudit(agentId, toolId, params, false, 'Rate limit exceeded (Max 15/min)');
      throw new Error(`Rate limit exceeded for agent ${agentId}. Limit is 15 requests per minute.`);
    }

    // 2. Permission Check
    if (!this.checkPermission(agentId, toolId)) {
      this.logAudit(agentId, toolId, params, false, 'Permission denied');
      throw new Error(`Agent ${agentId} does not have permission to execute tool ${toolId}.`);
    }

    // 3. Find Plugin
    const plugin = this.plugins.get(toolId);
    if (!plugin) {
      this.logAudit(agentId, toolId, params, false, 'Tool not found');
      throw new Error(`Tool ${toolId} not registered in Analytics Workspace.`);
    }

    // 4. Input Validation
    if (plugin.validate) {
      const validationError = plugin.validate(params);
      if (validationError) {
        this.logAudit(agentId, toolId, params, false, `Validation error: ${validationError}`);
        throw new Error(`Input validation failed: ${validationError}`);
      }
    }

    // 5. Handle Sensitive Writes
    if (plugin.isSensitive || params.writeBackToSheet) {
      return new Promise((resolve, reject) => {
        this.queueConfirmation(
          agentId,
          toolId,
          `Agent wants to run "${plugin.name}" and write results back to the sheet.`,
          () => {
            try {
              const res = plugin.execute(params.data, params.options);
              resolve({ status: 'SUCCESS', data: res });
            } catch (err) {
              reject(err);
            }
          },
          () => {
            reject(new Error('Sensitive action rejected by user.'));
          }
        );
      });
    }

    // 6. Regular Execution
    try {
      const result = plugin.execute(params.data, params.options);
      this.logAudit(agentId, toolId, params, true, 'Tool executed successfully');
      return { status: 'SUCCESS', data: result };
    } catch (error) {
      this.logAudit(agentId, toolId, params, false, `Execution error: ${error.message}`);
      throw error;
    }
  }

  // Populate default analytical plugins
  initDefaultModules() {
    // 1. Descriptive Stats
    this.registerModule('descriptive_stats', {
      name: 'Descriptive Statistics',
      category: 'Statistical Analysis',
      description: 'Calculates mean, median, standard deviation, variance, and standard error.',
      validate: (params) => (!params.data || !Array.isArray(params.data)) ? 'Requires array parameter [data]' : null,
      execute: (data) => modules.runDescriptiveStatistics(data)
    });

    // 2. T-Test
    this.registerModule('t_test', {
      name: 'Independent T-Test',
      category: 'Hypothesis Testing',
      description: 'Performs independent two-sample t-test between group A and group B columns.',
      validate: (params) => {
        if (!params.data || !params.data.groupA || !params.data.groupB) {
          return 'Requires { groupA: number[], groupB: number[] } in parameters';
        }
        return null;
      },
      execute: (data) => modules.runTTest(data.groupA, data.groupB)
    });

    // 3. ANOVA
    this.registerModule('anova', {
      name: 'One-Way ANOVA',
      category: 'Hypothesis Testing',
      description: 'Calculates One-Way Analysis of Variance across multiple numeric groupings.',
      validate: (params) => (!params.data || !Array.isArray(params.data)) ? 'Requires a 2D array of data arrays' : null,
      execute: (data) => modules.runANOVA(data)
    });

    // 4. Chi-Square Test
    this.registerModule('chi_square', {
      name: 'Chi-Square Test',
      category: 'Hypothesis Testing',
      description: 'Calculates Chi-Square test of independence on an observed grid/matrix of counts.',
      validate: (params) => (!params.data || !Array.isArray(params.data) || !Array.isArray(params.data[0])) ? 'Requires a 2D matrix of observed counts' : null,
      execute: (data) => modules.runChiSquare(data)
    });

    // 5. Pearson Correlation
    this.registerModule('correlation', {
      name: 'Pearson Correlation',
      category: 'Statistical Analysis',
      description: 'Measures linear correlation coefficient r and coefficient of determination r2.',
      validate: (params) => {
        if (!params.data || !params.data.x || !params.data.y) return 'Requires parameters { x: number[], y: number[] }';
        return null;
      },
      execute: (data) => modules.runCorrelation(data.x, data.y)
    });

    // 6. Linear Regression
    this.registerModule('regression', {
      name: 'Linear Regression',
      category: 'Statistical Analysis',
      description: 'Computes regression line slope, intercept, residuals, and predictions.',
      validate: (params) => {
        if (!params.data || !params.data.x || !params.data.y) return 'Requires parameters { x: number[], y: number[] }';
        return null;
      },
      execute: (data) => modules.runRegression(data.x, data.y)
    });

    // 7. Time Series Forecasting
    this.registerModule('forecasting', {
      name: 'Forecasting',
      category: 'Modeling & Forecasting',
      description: 'Performs single exponential smoothing time-series forecasting.',
      validate: (params) => (!params.data || !Array.isArray(params.data)) ? 'Requires numeric series array [data]' : null,
      execute: (data, options) => modules.runForecasting(data, options?.periods || 3, options?.alpha || 0.3)
    });

    // 8. Scenario & Sensitivity Analysis
    this.registerModule('sensitivity_analysis', {
      name: 'Scenario & Sensitivity Analysis',
      category: 'Modeling & Forecasting',
      description: 'Computes outcomes under positive, neutral, and negative sensitivity steps.',
      validate: (params) => {
        const baseVal = params.options?.base !== undefined ? params.options.base : params.base;
        const vars = params.options?.variables || params.variables;
        if (baseVal === undefined || !vars) return 'Requires base outcome and variables structure';
        return null;
      },
      execute: (data, options) => modules.runScenarioAnalysis(options?.base || 100, options?.variables || [])
    });

    // 9. Financial Modeling
    this.registerModule('financial_modeling', {
      name: 'Financial Modeling',
      category: 'Financial Analysis',
      description: 'Calculates Net Present Value (NPV), Internal Rate of Return (IRR), and Payback Period.',
      validate: (params) => {
        const rate = params.options?.discountRate !== undefined ? params.options.discountRate : params.discountRate;
        if (!params.data || !Array.isArray(params.data) || rate === undefined) {
          return 'Requires parameters cashflows array [data] and discountRate';
        }
        return null;
      },
      execute: (data, options) => modules.runFinancialModeling(data, options?.discountRate || 0.08)
    });

    // 10. Monte Carlo Simulations
    this.registerModule('monte_carlo', {
      name: 'Monte Carlo Simulation',
      category: 'Simulation & Risk',
      description: 'Generates random normal walk paths to simulate asset prices or business outcomes.',
      validate: (params) => {
        const base = params.options?.baseValue !== undefined ? params.options.baseValue : params.baseValue;
        const sd = params.options?.stdDev !== undefined ? params.options.stdDev : params.stdDev;
        if (base === undefined || sd === undefined) {
          return 'Requires parameter options { baseValue, stdDev }';
        }
        return null;
      },
      execute: (data, options) => modules.runMonteCarlo(options?.baseValue || 100, options?.stdDev || 0.15, options?.runs || 250, options?.steps || 12)
    });

    // 11. Probability Distributions
    this.registerModule('probability_distributions', {
      name: 'Probability Distributions',
      category: 'Simulation & Risk',
      description: 'Computes probability density and mass functions for Normal, Binomial, or Poisson distributions.',
      validate: (params) => {
        const type = params.options?.distType || params.distType;
        const dParams = params.options?.distParams || params.distParams;
        if (!type || !dParams) return 'Requires distribution type and params';
        return null;
      },
      execute: (data, options) => modules.runProbabilityDistribution(options?.distType, options?.distParams)
    });

    // 12. Risk Analysis
    this.registerModule('risk_analysis', {
      name: 'Risk Analysis (VaR)',
      category: 'Simulation & Risk',
      description: 'Calculates Sharpe Ratio and Historical Value at Risk (VaR) on portfolio returns.',
      validate: (params) => (!params.data || !Array.isArray(params.data)) ? 'Requires numeric returns array' : null,
      execute: (data, options) => modules.runRiskAnalysis(data, options?.confidenceLevel || 0.95, options?.riskFreeRate || 0.02)
    });

    // 13. Portfolio Analysis
    this.registerModule('portfolio_analysis', {
      name: 'Portfolio Analysis',
      category: 'Financial Analysis',
      description: 'Analyzes expected return and total variance of an asset portfolio.',
      validate: (params) => {
        if (!params.data || !params.data.weights || !params.data.covariance) {
          return 'Requires portfolio asset weights and covariance matrix';
        }
        return null;
      },
      execute: (data) => modules.runPortfolioAnalysis(data.weights, data.covariance)
    });

    // 14. Data Sampling
    this.registerModule('data_sampling', {
      name: 'Data Sampling',
      category: 'Statistical Analysis',
      description: 'Samples subsets from grids using random, systematic, or stratified techniques.',
      validate: (params) => (!params.data || !Array.isArray(params.data)) ? 'Requires array data' : null,
      execute: (data, options) => modules.runDataSampling(data, options?.method || 'random', options?.count || 5)
    });

    // 15. AI Powered Tools (Future modules bridge)
    this.registerModule('ai_analytical_insights', {
      name: 'AI Analytical Insights',
      category: 'AI Analysis',
      description: 'Leverages large analytical patterns to highlight spreadsheet risk factors, anomalous distributions, and recommended actions.',
      isSensitive: true,
      validate: (params) => null,
      execute: (data, options) => modules.runFutureAIAnalysis(data, options?.summary || '')
    });
  }
}

export const registry = new AnalyticsRegistry();
export default registry;
