import React, { useState } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, Package,
  ShoppingCart, BarChart2, AlertCircle, CheckCircle2,
  Sparkles, ChevronDown, Loader2, RotateCw, Search, X,
} from 'lucide-react';

// ─── Engine Schema Definitions ────────────────────────────────────────────────
// Each layout schema defines the declarative config the AI produces.
// The engine renders this into a fully styled, formula-calculated sheet grid.

export const SHEET_ENGINE_LAYOUTS = {
  budgeting: {
    label: 'Budgeting',
    description: 'Income vs. Expenses with variance tracking',
    icon: DollarSign,
    palette: 'indigo',
    columns: ['Category', 'Budgeted ($)', 'Actual ($)', 'Variance ($)', 'Status'],
    columnWidths: [180, 120, 120, 120, 100],
    rows: [
      { category: 'Revenue', budgeted: 85000, actual: 91200 },
      { category: 'Cost of Goods Sold', budgeted: 32000, actual: 34100 },
      { category: 'Gross Profit', budgeted: 53000, actual: 57100 },
      { category: 'Salaries & Wages', budgeted: 24000, actual: 23500 },
      { category: 'Marketing & Ads', budgeted: 8000, actual: 9600 },
      { category: 'Software & Tools', budgeted: 2400, actual: 2150 },
      { category: 'Office & Utilities', budgeted: 1800, actual: 1950 },
      { category: 'Travel & Expenses', budgeted: 3000, actual: 2200 },
      { category: 'Operating Expenses', budgeted: 39200, actual: 39400 },
      { category: 'Net Profit', budgeted: 13800, actual: 17700 },
    ],
    summaryCards: [
      { label: 'Total Budgeted', valueKey: 'totalBudgeted', icon: DollarSign, color: 'indigo' },
      { label: 'Total Actual', valueKey: 'totalActual', icon: BarChart2, color: 'violet' },
      { label: 'Net Variance', valueKey: 'netVariance', icon: TrendingUp, color: 'emerald' },
      { label: 'Budget Health', valueKey: 'health', icon: CheckCircle2, color: 'sky' },
    ],
  },
  cash_flow: {
    label: 'Cash Flow',
    description: 'Inflow, outflow, and net cash position by period',
    icon: TrendingUp,
    palette: 'emerald',
    columns: ['Period', 'Cash Inflow ($)', 'Cash Outflow ($)', 'Net Cash ($)', 'Running Balance ($)'],
    columnWidths: [140, 140, 140, 130, 160],
    rows: [
      { period: 'Jan 2026', inflow: 42000, outflow: 38500 },
      { period: 'Feb 2026', inflow: 38000, outflow: 41200 },
      { period: 'Mar 2026', inflow: 51000, outflow: 37000 },
      { period: 'Apr 2026', inflow: 47000, outflow: 43000 },
      { period: 'May 2026', inflow: 55000, outflow: 39500 },
      { period: 'Jun 2026', inflow: 62000, outflow: 44000 },
      { period: 'Jul 2026', inflow: 58000, outflow: 40000 },
      { period: 'Aug 2026', inflow: 71000, outflow: 46000 },
    ],
    summaryCards: [
      { label: 'Total Inflow', valueKey: 'totalInflow', icon: TrendingUp, color: 'emerald' },
      { label: 'Total Outflow', valueKey: 'totalOutflow', icon: TrendingDown, color: 'rose' },
      { label: 'Net Position', valueKey: 'netPosition', icon: DollarSign, color: 'indigo' },
      { label: 'Burn Rate / Mo', valueKey: 'avgOutflow', icon: AlertCircle, color: 'amber' },
    ],
  },
  sales_tracking: {
    label: 'Sales Tracking',
    description: 'Pipeline stages, deal values, and rep performance',
    icon: ShoppingCart,
    palette: 'violet',
    columns: ['Deal Name', 'Stage', 'Value ($)', 'Rep', 'Close Date', 'Probability (%)'],
    columnWidths: [200, 120, 110, 120, 120, 140],
    rows: [
      { deal: 'Acme Corp Enterprise', stage: 'Qualified', value: 48000, rep: 'Sarah K.', date: 'Sep 15', prob: 70 },
      { deal: 'Nova Systems Upgrade', stage: 'Proposal', value: 22000, rep: 'Marcus T.', date: 'Aug 28', prob: 55 },
      { deal: 'Zephyr Media Bundle', stage: 'Demo', value: 15500, rep: 'Lisa W.', date: 'Sep 5', prob: 40 },
      { deal: 'Helix Analytics Suite', stage: 'Closed Won', value: 67000, rep: 'Sarah K.', date: 'Aug 10', prob: 100 },
      { deal: 'Pinnacle SaaS Renewal', stage: 'Negotiation', value: 31000, rep: 'James R.', date: 'Sep 22', prob: 85 },
      { deal: 'Stratos Cloud Migration', stage: 'Prospecting', value: 89000, rep: 'Marcus T.', date: 'Oct 10', prob: 20 },
      { deal: 'Vantage Group Pilot', stage: 'Proposal', value: 12000, rep: 'Lisa W.', date: 'Aug 30', prob: 60 },
    ],
    summaryCards: [
      { label: 'Total Pipeline', valueKey: 'totalPipeline', icon: DollarSign, color: 'violet' },
      { label: 'Closed Won', valueKey: 'closedWon', icon: CheckCircle2, color: 'emerald' },
      { label: 'Win Rate', valueKey: 'winRate', icon: TrendingUp, color: 'sky' },
      { label: 'Avg Deal Size', valueKey: 'avgDeal', icon: BarChart2, color: 'indigo' },
    ],
  },
  inventory: {
    label: 'Inventory',
    description: 'SKU tracking, stock levels, and reorder alerts',
    icon: Package,
    palette: 'amber',
    columns: ['SKU', 'Item Name', 'In Stock', 'Reorder Point', 'Unit Cost ($)', 'Total Value ($)', 'Status'],
    columnWidths: [90, 200, 90, 120, 110, 120, 100],
    rows: [
      { sku: 'SKU-001', name: 'Wireless Keyboard Pro', stock: 148, reorder: 50, unitCost: 24.99 },
      { sku: 'SKU-002', name: 'USB-C Hub 7-Port', stock: 32, reorder: 40, unitCost: 39.95 },
      { sku: 'SKU-003', name: 'Monitor Stand Aluminium', stock: 91, reorder: 30, unitCost: 59.00 },
      { sku: 'SKU-004', name: 'Ergonomic Mouse', stock: 18, reorder: 25, unitCost: 34.50 },
      { sku: 'SKU-005', name: 'HDMI 2.1 Cable 2m', stock: 220, reorder: 80, unitCost: 12.99 },
      { sku: 'SKU-006', name: 'Laptop Sleeve 15"', stock: 7, reorder: 20, unitCost: 22.00 },
      { sku: 'SKU-007', name: 'Portable SSD 1TB', stock: 54, reorder: 20, unitCost: 89.00 },
      { sku: 'SKU-008', name: 'Webcam 4K', stock: 43, reorder: 15, unitCost: 79.99 },
    ],
    summaryCards: [
      { label: 'Total SKUs', valueKey: 'totalSKUs', icon: Package, color: 'amber' },
      { label: 'Total Value', valueKey: 'totalValue', icon: DollarSign, color: 'indigo' },
      { label: 'Low Stock Alerts', valueKey: 'lowStockCount', icon: AlertCircle, color: 'rose' },
      { label: 'Healthy Items', valueKey: 'healthyCount', icon: CheckCircle2, color: 'emerald' },
    ],
  },
  runway_calculator: {
    label: 'Runway Calculator',
    description: 'Cash zero date, monthly burn, and runway projection',
    icon: AlertCircle,
    palette: 'amber',
    columns: ['Month', 'Starting Cash ($)', 'Revenue ($)', 'Gross Burn ($)', 'Net Burn ($)', 'Ending Cash ($)', 'Runway Status'],
    columnWidths: [110, 140, 120, 120, 120, 140, 130],
    rows: [
      { month: 'Aug 2026', start: 1200000, rev: 65000, gross: 145000, net: 80000, end: 1120000, status: 'Healthy (14.0 mos)' },
      { month: 'Sep 2026', start: 1120000, rev: 72000, gross: 148000, net: 76000, end: 1044000, status: 'Healthy (13.7 mos)' },
      { month: 'Oct 2026', start: 1044000, rev: 80000, gross: 152000, net: 72000, end: 972000, status: 'Healthy (13.5 mos)' },
      { month: 'Nov 2026', start: 972000, rev: 88000, gross: 155000, net: 67000, end: 905000, status: 'Healthy (13.5 mos)' },
      { month: 'Dec 2026', start: 905000, rev: 95000, gross: 160000, net: 65000, end: 840000, status: 'Healthy (12.9 mos)' },
      { month: 'Jan 2027', start: 840000, rev: 102000, gross: 162000, net: 60000, end: 780000, status: 'Healthy (13.0 mos)' },
    ],
    summaryCards: [
      { label: 'Current Runway', valueKey: 'runwayMonths', icon: AlertCircle, color: 'amber' },
      { label: 'Avg Net Burn', valueKey: 'avgNetBurn', icon: TrendingDown, color: 'rose' },
      { label: 'Starting Cash', valueKey: 'startCash', icon: DollarSign, color: 'emerald' },
      { label: 'Zero Cash Date', valueKey: 'zeroCashDate', icon: CheckCircle2, color: 'indigo' },
    ],
  },
  hiring_tradeoff: {
    label: 'Hiring Tradeoff (Eng vs Mktg)',
    description: 'Compare ROI of hiring Senior Engineer vs Growth Marketer',
    icon: BarChart2,
    palette: 'indigo',
    columns: ['Scenario / Role', 'Base Salary ($)', 'Fully Loaded Cost ($)', '3-Mo Rev Impact ($)', 'Net 12-Mo ROI ($)', 'Breakeven (Mos)'],
    columnWidths: [180, 130, 150, 150, 140, 130],
    rows: [
      { role: 'Sr. Fullstack Engineer', salary: 165000, loaded: 206250, rev: 45000, net: 180000, break: 7.2 },
      { role: 'Growth Marketing Lead', salary: 140000, loaded: 175000, rev: 110000, net: 265000, break: 4.5 },
      { role: 'Combined (Both Hires)', salary: 305000, loaded: 381250, rev: 165000, net: 410000, break: 5.8 },
    ],
    summaryCards: [
      { label: 'Recommended Hire', valueKey: 'topHire', icon: Sparkles, color: 'emerald' },
      { label: 'Mktg 12Mo ROI', valueKey: 'mktgRoi', icon: TrendingUp, color: 'indigo' },
      { label: 'Eng 12Mo ROI', valueKey: 'engRoi', icon: BarChart2, color: 'violet' },
      { label: 'Capital Delta', valueKey: 'capDelta', icon: DollarSign, color: 'sky' },
    ],
  },
  cap_table: {
    label: 'Cap Table & Dilution',
    description: 'Shareholders, ownership %, Series A valuation, and pool',
    icon: DollarSign,
    palette: 'violet',
    columns: ['Shareholder', 'Share Type', 'Shares Held', 'Pre-Money %', 'Post-Money %', 'Valuation ($)'],
    columnWidths: [180, 130, 120, 110, 110, 130],
    rows: [
      { holder: 'Founder A (CEO)', type: 'Common', shares: 4200000, pre: 42.0, post: 31.5, val: 4725000 },
      { holder: 'Founder B (CTO)', type: 'Common', shares: 3800000, pre: 38.0, post: 28.5, val: 4275000 },
      { holder: 'Unallocated Option Pool', type: 'Options', shares: 1000000, pre: 10.0, post: 7.5, val: 1125000 },
      { holder: 'Angel Syndicate', type: 'Preferred A', shares: 1000000, pre: 10.0, post: 7.5, val: 1125000 },
      { holder: 'Series Lead (New Inc)', type: 'Preferred B', shares: 3333333, pre: 0.0, post: 25.0, val: 3750000 },
    ],
    summaryCards: [
      { label: 'Post-Money Valuation', valueKey: 'postVal', icon: DollarSign, color: 'violet' },
      { label: 'Founders Total %', valueKey: 'founderPct', icon: CheckCircle2, color: 'emerald' },
      { label: 'Option Pool %', valueKey: 'poolPct', icon: BarChart2, color: 'sky' },
      { label: 'New Money Raised', valueKey: 'raised', icon: TrendingUp, color: 'indigo' },
    ],
  },
  ltv_cac: {
    label: 'LTV / CAC Unit Economics',
    description: 'Customer Lifetime Value, CAC, payback period, and churn',
    icon: TrendingUp,
    palette: 'emerald',
    columns: ['Customer Segment', 'ARPU / Mo ($)', 'Churn Rate (%)', 'LTV ($)', 'CAC ($)', 'LTV : CAC Ratio', 'Payback (Mos)'],
    columnWidths: [160, 120, 110, 110, 110, 120, 120],
    rows: [
      { seg: 'Self-Serve Starter', arpu: 49, churn: 4.2, ltv: 933, cac: 210, ratio: '4.4x', payback: 4.3 },
      { seg: 'Pro Scale', arpu: 249, churn: 2.1, ltv: 9485, cac: 1850, ratio: '5.1x', payback: 7.4 },
      { seg: 'Enterprise Custom', arpu: 1850, churn: 0.8, ltv: 185000, cac: 24000, ratio: '7.7x', payback: 13.0 },
    ],
    summaryCards: [
      { label: 'Blended LTV : CAC', valueKey: 'blendedRatio', icon: TrendingUp, color: 'emerald' },
      { label: 'Avg Payback Period', valueKey: 'avgPayback', icon: AlertCircle, color: 'amber' },
      { label: 'Blended Monthly Churn', valueKey: 'churnRate', icon: TrendingDown, color: 'indigo' },
      { label: 'Net Retention (NDR)', valueKey: 'ndr', icon: CheckCircle2, color: 'sky' },
    ],
  },
};

// ─── Palette Tokens ────────────────────────────────────────────────────────────
const PALETTE_TOKENS = {
  indigo: {
    headerBg: '#eef2ff',
    headerText: '#3730a3',
    headerBorder: '#c7d2fe',
    accentFg: '#4f46e5',
    accentBg: '#e0e7ff',
    badgePill: 'rgba(79,70,229,0.10)',
    badgeText: '#4338ca',
  },
  emerald: {
    headerBg: '#ecfdf5',
    headerText: '#065f46',
    headerBorder: '#a7f3d0',
    accentFg: '#059669',
    accentBg: '#d1fae5',
    badgePill: 'rgba(5,150,105,0.10)',
    badgeText: '#047857',
  },
  violet: {
    headerBg: '#f5f3ff',
    headerText: '#4c1d95',
    headerBorder: '#ddd6fe',
    accentFg: '#7c3aed',
    accentBg: '#ede9fe',
    badgePill: 'rgba(124,58,237,0.10)',
    badgeText: '#6d28d9',
  },
  amber: {
    headerBg: '#fffbeb',
    headerText: '#78350f',
    headerBorder: '#fde68a',
    accentFg: '#d97706',
    accentBg: '#fef3c7',
    badgePill: 'rgba(217,119,6,0.10)',
    badgeText: '#b45309',
  },
};

// ─── Compute Summary Metrics ───────────────────────────────────────────────────
function computeMetrics(layout, rows) {
  switch (layout) {
    case 'budgeting': {
      const revenue = rows.find((r) => r.category === 'Revenue');
      const net = rows.find((r) => r.category === 'Net Profit');
      const totalBudgeted = revenue?.budgeted ?? 0;
      const totalActual = revenue?.actual ?? 0;
      const netVariance = (net?.actual ?? 0) - (net?.budgeted ?? 0);
      const health = netVariance >= 0 ? 'On Track' : 'Over Budget';
      return {
        totalBudgeted: `$${totalBudgeted.toLocaleString()}`,
        totalActual: `$${totalActual.toLocaleString()}`,
        netVariance: `${netVariance >= 0 ? '+' : ''}$${netVariance.toLocaleString()}`,
        health,
      };
    }
    case 'cash_flow': {
      const totalInflow = rows.reduce((s, r) => s + r.inflow, 0);
      const totalOutflow = rows.reduce((s, r) => s + r.outflow, 0);
      const netPosition = totalInflow - totalOutflow;
      const avgOutflow = Math.round(totalOutflow / rows.length);
      return {
        totalInflow: `$${totalInflow.toLocaleString()}`,
        totalOutflow: `$${totalOutflow.toLocaleString()}`,
        netPosition: `${netPosition >= 0 ? '+' : ''}$${netPosition.toLocaleString()}`,
        avgOutflow: `$${avgOutflow.toLocaleString()}`,
      };
    }
    case 'sales_tracking': {
      const totalPipeline = rows.reduce((s, r) => s + r.value, 0);
      const closedRows = rows.filter((r) => r.stage === 'Closed Won');
      const closedWon = closedRows.reduce((s, r) => s + r.value, 0);
      const winRate = rows.length > 0 ? `${Math.round((closedRows.length / rows.length) * 100)}%` : '0%';
      const avgDeal = rows.length > 0 ? Math.round(totalPipeline / rows.length) : 0;
      return {
        totalPipeline: `$${totalPipeline.toLocaleString()}`,
        closedWon: `$${closedWon.toLocaleString()}`,
        winRate,
        avgDeal: `$${avgDeal.toLocaleString()}`,
      };
    }
    case 'inventory': {
      const totalSKUs = rows.length;
      const totalValue = rows.reduce((s, r) => s + r.stock * r.unitCost, 0);
      const lowStockCount = rows.filter((r) => r.stock < r.reorder).length;
      const healthyCount = totalSKUs - lowStockCount;
      return {
        totalSKUs: String(totalSKUs),
        totalValue: `$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        lowStockCount: String(lowStockCount),
        healthyCount: String(healthyCount),
      };
    }
    default:
      return {};
  }
}

// ─── Row Renderer ──────────────────────────────────────────────────────────────
function renderRowCells(layoutKey, row, tokens) {
  const currency = (v) => `$${Number(v).toLocaleString()}`;
  const pct = (v) => `${v}%`;

  switch (layoutKey) {
    case 'budgeting': {
      const variance = row.actual - row.budgeted;
      const status = variance >= 0 ? '✓ Under Budget' : '⚠ Over Budget';
      const isNegative = variance < 0;
      return [
        <td key="cat" style={{ padding: '7px 12px', fontWeight: 500, color: '#1e293b', borderRight: '1px solid #f1f5f9' }}>{row.category}</td>,
        <td key="bud" style={{ padding: '7px 12px', textAlign: 'right', borderRight: '1px solid #f1f5f9', color: '#475569', fontVariantNumeric: 'tabular-nums' }}>{currency(row.budgeted)}</td>,
        <td key="act" style={{ padding: '7px 12px', textAlign: 'right', borderRight: '1px solid #f1f5f9', fontWeight: 600, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>{currency(row.actual)}</td>,
        <td key="var" style={{ padding: '7px 12px', textAlign: 'right', borderRight: '1px solid #f1f5f9', fontWeight: 600, color: isNegative ? '#e11d48' : '#059669', fontVariantNumeric: 'tabular-nums' }}>{variance >= 0 ? '+' : ''}{currency(variance)}</td>,
        <td key="sta" style={{ padding: '7px 12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: isNegative ? 'rgba(225,29,72,0.08)' : 'rgba(5,150,105,0.08)', color: isNegative ? '#be123c' : '#047857' }}>
            {status}
          </span>
        </td>,
      ];
    }
    case 'cash_flow': {
      const net = row.inflow - row.outflow;
      const isNegative = net < 0;
      return [
        <td key="per" style={{ padding: '7px 12px', fontWeight: 500, color: '#1e293b', borderRight: '1px solid #f1f5f9' }}>{row.period}</td>,
        <td key="in"  style={{ padding: '7px 12px', textAlign: 'right', borderRight: '1px solid #f1f5f9', color: '#059669', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{currency(row.inflow)}</td>,
        <td key="out" style={{ padding: '7px 12px', textAlign: 'right', borderRight: '1px solid #f1f5f9', color: '#e11d48', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{currency(row.outflow)}</td>,
        <td key="net" style={{ padding: '7px 12px', textAlign: 'right', borderRight: '1px solid #f1f5f9', fontWeight: 700, color: isNegative ? '#e11d48' : '#0f172a', fontVariantNumeric: 'tabular-nums' }}>{net >= 0 ? '+' : ''}{currency(net)}</td>,
        <td key="bal" style={{ padding: '7px 12px', textAlign: 'right', color: '#475569', fontVariantNumeric: 'tabular-nums' }}>–</td>,
      ];
    }
    case 'sales_tracking': {
      const stageColors = {
        'Closed Won':   { bg: 'rgba(5,150,105,0.08)',   text: '#047857' },
        'Negotiation':  { bg: 'rgba(217,119,6,0.10)',    text: '#b45309' },
        'Proposal':     { bg: 'rgba(79,70,229,0.08)',   text: '#4338ca' },
        'Qualified':    { bg: 'rgba(2,132,199,0.08)',   text: '#0369a1' },
        'Demo':         { bg: 'rgba(124,58,237,0.08)',  text: '#6d28d9' },
        'Prospecting':  { bg: 'rgba(107,114,128,0.10)', text: '#4b5563' },
      };
      const sc = stageColors[row.stage] ?? { bg: 'rgba(107,114,128,0.08)', text: '#374151' };
      return [
        <td key="deal" style={{ padding: '7px 12px', fontWeight: 500, color: '#0f172a', borderRight: '1px solid #f1f5f9' }}>{row.deal}</td>,
        <td key="stg"  style={{ padding: '7px 12px', borderRight: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: sc.bg, color: sc.text }}>{row.stage}</span>
        </td>,
        <td key="val"  style={{ padding: '7px 12px', textAlign: 'right', borderRight: '1px solid #f1f5f9', fontWeight: 600, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>{currency(row.value)}</td>,
        <td key="rep"  style={{ padding: '7px 12px', borderRight: '1px solid #f1f5f9', color: '#475569' }}>{row.rep}</td>,
        <td key="dt"   style={{ padding: '7px 12px', borderRight: '1px solid #f1f5f9', color: '#64748b' }}>{row.date}</td>,
        <td key="prob" style={{ padding: '7px 12px', textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
            <div style={{ width: 48, height: 4, borderRadius: 99, background: '#e2e8f0', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${row.prob}%`, background: row.prob === 100 ? '#059669' : row.prob >= 70 ? '#6366f1' : row.prob >= 40 ? '#f59e0b' : '#94a3b8', borderRadius: 99 }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{pct(row.prob)}</span>
          </div>
        </td>,
      ];
    }
    case 'inventory': {
      const isLow = row.stock < row.reorder;
      return [
        <td key="sku"  style={{ padding: '7px 12px', fontFamily: 'monospace', fontSize: 12, color: '#6366f1', borderRight: '1px solid #f1f5f9', fontWeight: 600 }}>{row.sku}</td>,
        <td key="name" style={{ padding: '7px 12px', fontWeight: 500, color: '#0f172a', borderRight: '1px solid #f1f5f9' }}>{row.name}</td>,
        <td key="stk"  style={{ padding: '7px 12px', textAlign: 'right', borderRight: '1px solid #f1f5f9', fontWeight: 700, color: isLow ? '#e11d48' : '#0f172a', fontVariantNumeric: 'tabular-nums' }}>{row.stock}</td>,
        <td key="reo"  style={{ padding: '7px 12px', textAlign: 'right', borderRight: '1px solid #f1f5f9', color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>{row.reorder}</td>,
        <td key="uc"   style={{ padding: '7px 12px', textAlign: 'right', borderRight: '1px solid #f1f5f9', color: '#475569', fontVariantNumeric: 'tabular-nums' }}>{currency(row.unitCost)}</td>,
        <td key="tv"   style={{ padding: '7px 12px', textAlign: 'right', borderRight: '1px solid #f1f5f9', fontWeight: 600, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>{currency(row.stock * row.unitCost)}</td>,
        <td key="sts"  style={{ padding: '7px 12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: isLow ? 'rgba(225,29,72,0.08)' : 'rgba(5,150,105,0.08)', color: isLow ? '#be123c' : '#047857' }}>
            {isLow ? '⚠ Reorder' : '✓ OK'}
          </span>
        </td>,
      ];
    }
    default:
      return [];
  }
}

// ─── Summary Card ──────────────────────────────────────────────────────────────
function SummaryCard({ label, value, Icon, color }) {
  const colorMap = {
    indigo:  { bg: '#eef2ff', fg: '#4338ca', icon: '#6366f1' },
    violet:  { bg: '#f5f3ff', fg: '#5b21b6', icon: '#7c3aed' },
    emerald: { bg: '#ecfdf5', fg: '#065f46', icon: '#059669' },
    rose:    { bg: '#fff1f2', fg: '#9f1239', icon: '#e11d48' },
    amber:   { bg: '#fffbeb', fg: '#78350f', icon: '#d97706' },
    sky:     { bg: '#f0f9ff', fg: '#075985', icon: '#0284c7' },
  };
  const c = colorMap[color] ?? colorMap.indigo;

  return (
    <div style={{
      flex: 1,
      minWidth: 110,
      borderRadius: 10,
      background: c.bg,
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      border: `1px solid ${c.bg === '#eef2ff' ? '#c7d2fe' : 'transparent'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{
          width: 24, height: 24, borderRadius: 6,
          background: 'rgba(255,255,255,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={13} style={{ color: c.icon }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: c.fg, letterSpacing: '0.03em', textTransform: 'uppercase' }}>{label}</span>
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: c.fg, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
    </div>
  );
}

// ─── Engine Picker Panel (Shown in sidebar) ────────────────────────────────────
// This is the compact sidebar panel with layout trigger buttons, search filtering, and custom scrollbar.
export function SheetEnginePickerPanel({ onRender, isGenerating, activeLayoutKey }) {
  const [searchQuery, setSearchQuery] = useState('');

  const layouts = Object.entries(SHEET_ENGINE_LAYOUTS);
  const filteredLayouts = layouts.filter(([key, schema]) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      schema.label.toLowerCase().includes(q) ||
      schema.description.toLowerCase().includes(q) ||
      key.toLowerCase().includes(q)
    );
  });

  const colorMap = {
    indigo: { bg: 'rgba(99,102,241,0.08)', text: '#4338ca', border: 'rgba(99,102,241,0.2)' },
    emerald: { bg: 'rgba(5,150,105,0.08)', text: '#047857', border: 'rgba(5,150,105,0.2)' },
    violet: { bg: 'rgba(124,58,237,0.08)', text: '#6d28d9', border: 'rgba(124,58,237,0.2)' },
    amber: { bg: 'rgba(217,119,6,0.08)', text: '#b45309', border: 'rgba(217,119,6,0.2)' },
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          AI Actions
        </div>
        <div style={{ fontSize: 9, fontWeight: 600, color: '#6366f1', background: 'rgba(99,102,241,0.08)', padding: '2px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
          <Sparkles style={{ width: 10, height: 10 }} /> BUILD WITH AI
        </div>
      </div>

      {/* Search Bar */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        marginBottom: 4,
      }}>
        <Search size={12} style={{ position: 'absolute', left: 9, color: '#94a3b8', pointerEvents: 'none' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search AI templates..."
          style={{
            width: '100%',
            padding: '6px 26px 6px 28px',
            fontSize: 11,
            borderRadius: 6,
            border: '1px solid #e2e8f0',
            background: '#f8fafc',
            color: '#1e293b',
            outline: 'none',
            transition: 'all 0.15s ease',
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute',
              right: 6,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              padding: 2,
            }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Scrollable Layout Items List */}
      <div style={{
        maxHeight: 280,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        paddingRight: 4,
      }}>
        {filteredLayouts.length === 0 ? (
          <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '12px 0' }}>
            No templates matching "{searchQuery}"
          </div>
        ) : (
          filteredLayouts.map(([key, schema]) => {
            const Icon = schema.icon || Sparkles;
            const c = colorMap[schema.palette] || colorMap.indigo;
            const isActive = activeLayoutKey === key;
            const isLoading = isGenerating && isActive;

            return (
              <button
                key={key}
                type="button"
                onClick={() => onRender(key)}
                disabled={isGenerating}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: `1px solid ${isActive ? c.border : 'rgba(226,232,240,0.6)'}`,
                  background: isActive ? c.bg : 'rgba(248,250,252,0.5)',
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  opacity: isGenerating && !isActive ? 0.5 : 1,
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                  flexShrink: 0,
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 7,
                  background: isActive ? c.bg : '#f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  border: `1px solid ${isActive ? c.border : '#e2e8f0'}`,
                }}>
                  {isLoading
                    ? <Loader2 size={13} style={{ color: c.text, animation: 'spin 1s linear infinite' }} />
                    : <Icon size={13} style={{ color: isActive ? c.text : '#64748b' }} />
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: isActive ? c.text : '#1e293b', lineHeight: 1.2 }}>{schema.label}</div>
                  <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{schema.description}</div>
                </div>
                {isActive && !isLoading && (
                  <CheckCircle2 size={12} style={{ color: c.text, flexShrink: 0 }} />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Palette key normaliser for AI-generated specs ────────────────────────────
// Maps the grammar palette names from sheetEngineService to the internal token keys.
const PALETTE_KEY_MAP = {
  'slate-dark':    'indigo',
  'emerald-glow':  'emerald',
  'aurora-indigo': 'violet',
  'amber-warm':    'amber',
  indigo:          'indigo',
  emerald:         'emerald',
  violet:          'violet',
  amber:           'amber',
};

// ─── Dynamic Cell Renderer (used for AI-generated specs) ──────────────────────
// Renders any column type defined in COLUMN_TYPES without hardcoded layout logic.
function renderDynamicCell(value, colType, colIdx, totalCols) {
  const borderRight = colIdx < totalCols - 1 ? '1px solid #f1f5f9' : 'none';
  const baseStyle = { padding: '7px 12px', borderRight, fontSize: 13 };

  const num = Number(value);
  const isNum = !Number.isNaN(num) && value !== '' && value !== null;

  switch (colType) {
    case 'currency':
      return (
        <td key={colIdx} style={{ ...baseStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#0f172a' }}>
          {isNum ? `$${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}` : String(value ?? '–')}
        </td>
      );
    case 'number':
      return (
        <td key={colIdx} style={{ ...baseStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: '#334155' }}>
          {isNum ? num.toLocaleString() : String(value ?? '–')}
        </td>
      );
    case 'percentage':
      return (
        <td key={colIdx} style={{ ...baseStyle, textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
            <div style={{ width: 48, height: 4, borderRadius: 99, background: '#e2e8f0', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, num))}%`, background: num >= 80 ? '#059669' : num >= 50 ? '#6366f1' : '#f59e0b', borderRadius: 99 }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{isNum ? `${num}%` : String(value ?? '–')}</span>
          </div>
        </td>
      );
    case 'status': {
      const statusStr = String(value ?? '');
      const isPositive = /ok|active|complete|won|healthy|on.?track/i.test(statusStr);
      const isNegative = /over|fail|reorder|blocked|low|warn/i.test(statusStr);
      return (
        <td key={colIdx} style={{ ...baseStyle }}>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
            background: isPositive ? 'rgba(5,150,105,0.08)' : isNegative ? 'rgba(225,29,72,0.08)' : 'rgba(99,102,241,0.08)',
            color: isPositive ? '#047857' : isNegative ? '#be123c' : '#4338ca',
          }}>
            {statusStr || '–'}
          </span>
        </td>
      );
    }
    case 'date':
      return (
        <td key={colIdx} style={{ ...baseStyle, color: '#64748b' }}>{String(value ?? '–')}</td>
      );
    default: // 'text' and fallback
      return (
        <td key={colIdx} style={{ ...baseStyle, fontWeight: colIdx === 0 ? 500 : 400, color: colIdx === 0 ? '#0f172a' : '#475569' }}>
          {String(value ?? '–')}
        </td>
      );
  }
}

// ─── AI Context Diagnostic Card ───────────────────────────────────────────────
// Renders when AI context diagnosis detects NO_DATA, INSUFFICIENT_DATA, or AMBIGUOUS_REQUEST.
// Guiding principle: Never end with an error. Explain WHY and offer actionable next steps.
export function SheetDiagnosticCard({ diagnostic, onAction, onDismiss }) {
  if (!diagnostic || diagnostic.status === 'DATA_READY') return null;

  const statusIcons = {
    NO_DATA: AlertCircle,
    INSUFFICIENT_DATA: AlertCircle,
    AMBIGUOUS_REQUEST: Sparkles,
    UNSUPPORTED_DATA: AlertCircle,
  };

  const statusColors = {
    NO_DATA: { bg: '#fff1f2', border: '#fecdd3', text: '#9f1239', badgeBg: 'rgba(225,29,72,0.1)', badgeText: '#be123c' },
    INSUFFICIENT_DATA: { bg: '#fffbeb', border: '#fde68a', text: '#78350f', badgeBg: 'rgba(217,119,6,0.1)', badgeText: '#b45309' },
    AMBIGUOUS_REQUEST: { bg: '#eef2ff', border: '#c7d2fe', text: '#3730a3', badgeBg: 'rgba(79,70,229,0.1)', badgeText: '#4338ca' },
    UNSUPPORTED_DATA: { bg: '#f8fafc', border: '#e2e8f0', text: '#334155', badgeBg: 'rgba(100,116,139,0.1)', badgeText: '#475569' },
  };

  const c = statusColors[diagnostic.status] || statusColors.AMBIGUOUS_REQUEST;
  const IconComponent = statusIcons[diagnostic.status] || Sparkles;

  return (
    <div style={{
      width: '100%',
      padding: '24px',
      background: '#ffffff',
      borderBottom: '1px solid #f1f5f9',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: c.bg, border: `1px solid ${c.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, marginTop: 2,
          }}>
            <IconComponent size={18} style={{ color: c.text }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>
                {diagnostic.title}
              </span>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                background: c.badgeBg, color: c.badgeText, letterSpacing: '0.04em', textTransform: 'uppercase',
              }}>
                AI Diagnostic
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#475569', marginTop: 4, lineHeight: 1.5, maxWidth: 640 }}>
              {diagnostic.message}
            </p>
          </div>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            style={{
              padding: '4px 10px', borderRadius: 6, border: '1px solid #e2e8f0',
              background: '#f8fafc', fontSize: 11, fontWeight: 500, color: '#64748b', cursor: 'pointer',
            }}
          >
            Dismiss
          </button>
        )}
      </div>

      {/* Actionable Next Steps */}
      {Array.isArray(diagnostic.actions) && diagnostic.actions.length > 0 && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
          {diagnostic.actions.map((act) => (
            <button
              key={act.id}
              type="button"
              onClick={() => onAction && onAction(act)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 8,
                border: '1px solid #c7d2fe', background: '#eef2ff',
                color: '#3730a3', fontSize: 12.5, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s ease',
              }}
            >
              {act.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Rendered Sheet Workspace ────────────────────────────────────────────
export default function SheetRenderingEngine({ layoutKey, validatedSpec, diagnosticResult, onDiagnosticAction, onDismiss }) {
  // If a diagnostic warning exists (e.g. NO_DATA, INSUFFICIENT_DATA, AMBIGUOUS_REQUEST), render diagnostic card
  if (diagnosticResult && diagnosticResult.status !== 'DATA_READY') {
    return (
      <div style={{ width: '100%', height: '100%', overflow: 'auto', background: '#f8fafc' }}>
        <SheetDiagnosticCard
          diagnostic={diagnosticResult}
          onAction={onDiagnosticAction}
          onDismiss={onDismiss}
        />
      </div>
    );
  }

  // ── Resolve source: AI spec wins over static preset ──
  const isAiSpec = Boolean(validatedSpec && validatedSpec.columns && validatedSpec.rows);
  const schema = isAiSpec ? null : SHEET_ENGINE_LAYOUTS[layoutKey];

  // Guard: nothing to render
  if (!isAiSpec && !schema) return null;

  const paletteKey = isAiSpec
    ? (PALETTE_KEY_MAP[validatedSpec.palette] ?? 'indigo')
    : (PALETTE_KEY_MAP[schema.palette] ?? 'indigo');

  const tokens = PALETTE_TOKENS[paletteKey] ?? PALETTE_TOKENS.indigo;

  const displayTitle = isAiSpec ? validatedSpec.title : schema.label;
  const displaySubtitle = isAiSpec ? `AI-generated via createSheet()` : schema.description;
  const Icon = isAiSpec ? Sparkles : (schema.icon ?? Sparkles);

  // ── For static presets: compute metrics and use typed cell renderers ──
  const metrics = !isAiSpec ? computeMetrics(layoutKey, schema.rows) : {};
  const staticSummaryCards = !isAiSpec ? schema.summaryCards : [];

  // ── For AI specs: derive column headers and widths from spec ──
  const columns = isAiSpec ? validatedSpec.columns : schema.columns;
  const columnWidths = isAiSpec
    ? validatedSpec.columns.map((c) => c.width || 120)
    : schema.columnWidths;
  const rows = isAiSpec ? validatedSpec.rows : schema.rows;

  // ── For AI specs: compute generic KPI cards ──
  const aiSummaryCards = isAiSpec && validatedSpec.summaryCards ? (() => {
    const numericCols = validatedSpec.columns.filter((c) => c.type === 'currency' || c.type === 'number');
    return numericCols.slice(0, 4).map((col, i) => {
      const total = validatedSpec.rows.reduce((s, r) => s + Number(r[col.key] ?? 0), 0);
      const icons = [DollarSign, BarChart2, TrendingUp, AlertCircle];
      const colors = ['indigo', 'violet', 'emerald', 'amber'];
      return {
        label: col.label,
        value: col.type === 'currency'
          ? `$${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
          : total.toLocaleString(undefined, { maximumFractionDigits: 1 }),
        icon: icons[i] ?? DollarSign,
        color: colors[i] ?? 'indigo',
      };
    });
  })() : [];

  const summaryCardsToRender = isAiSpec ? aiSummaryCards : staticSummaryCards;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      overflow: 'auto',
      background: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>

      {/* ── Engine Header ── */}
      <div style={{
        padding: '18px 24px 14px',
        background: '#ffffff',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: tokens.accentBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1.5px solid ${tokens.headerBorder}`,
          }}>
            <Icon size={16} style={{ color: tokens.accentFg }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1 }}>{displayTitle}</div>
            <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>{displaySubtitle}</div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '3px 8px', borderRadius: 6,
            background: tokens.badgePill,
            marginLeft: 4,
          }}>
            <Sparkles size={10} style={{ color: tokens.badgeText }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: tokens.badgeText, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {isAiSpec ? 'Tool-Call' : 'AI Generated'}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 12px', borderRadius: 7,
            border: '1px solid #e2e8f0',
            background: '#f8fafc',
            fontSize: 12, fontWeight: 500, color: '#475569',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <RotateCw size={11} />
          Reset Sheet
        </button>
      </div>

      {/* ── Summary Cards ── */}
      {summaryCardsToRender.length > 0 && (
        <div style={{ padding: '16px 24px', display: 'flex', gap: 10, flexWrap: 'wrap', flexShrink: 0 }}>
          {isAiSpec
            ? aiSummaryCards.map((card, i) => (
                <SummaryCard key={i} label={card.label} value={card.value} Icon={card.icon} color={card.color} />
              ))
            : staticSummaryCards.map((card) => (
                <SummaryCard
                  key={card.valueKey}
                  label={card.label}
                  value={metrics[card.valueKey] ?? '–'}
                  Icon={card.icon}
                  color={card.color}
                />
              ))
          }
        </div>
      )}

      {/* ── Data Table ── */}
      <div style={{ padding: '0 24px 24px', flex: 1, minHeight: 0 }}>
        <div style={{
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          background: '#ffffff',
          boxShadow: '0 1px 3px 0 rgba(0,0,0,0.04)',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            {/* Column Widths */}
            <colgroup>
              {columnWidths.map((w, i) => (
                <col key={i} style={{ width: w }} />
              ))}
            </colgroup>

            {/* Header */}
            <thead>
              <tr style={{ background: tokens.headerBg }}>
                {columns.map((col, i) => {
                  const label = isAiSpec ? col.label : col;
                  return (
                    <th key={i} style={{
                      padding: '10px 12px',
                      textAlign: i === 0 ? 'left' : 'right',
                      fontSize: 11,
                      fontWeight: 700,
                      color: tokens.headerText,
                      letterSpacing: '0.03em',
                      textTransform: 'uppercase',
                      borderBottom: `1.5px solid ${tokens.headerBorder}`,
                      borderRight: i < columns.length - 1 ? `1px solid ${tokens.headerBorder}` : 'none',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {label}
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {rows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  style={{
                    background: rIdx % 2 === 0 ? '#ffffff' : '#fafafa',
                    borderBottom: rIdx < rows.length - 1 ? '1px solid #f1f5f9' : 'none',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = tokens.accentBg; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = rIdx % 2 === 0 ? '#ffffff' : '#fafafa'; }}
                >
                  {isAiSpec
                    ? columns.map((col, cIdx) =>
                        renderDynamicCell(row[col.key], col.type, cIdx, columns.length)
                      )
                    : renderRowCells(layoutKey, row, tokens)
                  }
                </tr>
              ))}
            </tbody>

            {/* Footer Totals Row */}
            {layoutKey !== 'sales_tracking' && (
              <tfoot>
                <tr style={{ background: tokens.headerBg, borderTop: `2px solid ${tokens.headerBorder}` }}>
                  {columns.map((_, i) => (
                    <td key={i} style={{
                      padding: '9px 12px',
                      fontSize: 11,
                      fontWeight: 700,
                      color: tokens.headerText,
                      textAlign: i === 0 ? 'left' : 'right',
                    }}>
                      {i === 0 ? 'TOTALS' : ''}
                    </td>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Keyframe animation for spinner */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
