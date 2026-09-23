import React, { useState, useMemo } from "react";
import { BarChart3, TrendingUp, DollarSign, Layers } from "lucide-react";
import { CHART_OF_ACCOUNTS, formatCurrency } from "./ledgerEngine";

export default function LedgerReportsView({
  journalLines = [],
  onNavigateToScans = () => {}
}) {
  const [reportType, setReportType] = useState("pnl"); // 'pnl' | 'balance_sheet' | 'trial_balance'

  // Compute live account debits and credits
  const accountsData = useMemo(() => {
    const map = {};
    CHART_OF_ACCOUNTS.forEach((acc) => {
      map[acc.code] = { ...acc, debit: 0, credit: 0, balance: 0 };
    });

    journalLines.forEach((line) => {
      if (map[line.accountCode]) {
        map[line.accountCode].debit += Number(line.debit) || 0;
        map[line.accountCode].credit += Number(line.credit) || 0;
      }
    });

    Object.values(map).forEach((acc) => {
      const isDebitNormal = acc.type === "Asset" || acc.type === "Expense";
      acc.balance = isDebitNormal ? acc.debit - acc.credit : acc.credit - acc.debit;
    });

    return map;
  }, [journalLines]);

  // Profit & Loss calculations: Revenue minus Expenses
  const pnlData = useMemo(() => {
    const revenues = Object.values(accountsData).filter((a) => a.type === "Revenue");
    const expenses = Object.values(accountsData).filter((a) => a.type === "Expense");
    const totalRevenue = revenues.reduce((acc, r) => acc + r.balance, 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + e.balance, 0);
    const netIncome = totalRevenue - totalExpenses;

    return { revenues, expenses, totalRevenue, totalExpenses, netIncome };
  }, [accountsData]);

  // Balance Sheet calculations: Assets === Liabilities + Equity
  const balanceSheetData = useMemo(() => {
    const assets = Object.values(accountsData).filter((a) => a.type === "Asset");
    const liabilities = Object.values(accountsData).filter((a) => a.type === "Liability");
    const totalAssets = assets.reduce((acc, a) => acc + a.balance, 0);
    const totalLiabilities = liabilities.reduce((acc, l) => acc + l.balance, 0);
    const retainedEarnings = pnlData.netIncome;
    const totalLiabilitiesAndEquity = totalLiabilities + retainedEarnings;

    return { assets, liabilities, totalAssets, totalLiabilities, retainedEarnings, totalLiabilitiesAndEquity };
  }, [accountsData, pnlData.netIncome]);

  // Trial Balance totals
  const trialBalanceTotals = useMemo(() => {
    const totalDebit = journalLines.reduce((acc, l) => acc + (Number(l.debit) || 0), 0);
    const totalCredit = journalLines.reduce((acc, l) => acc + (Number(l.credit) || 0), 0);
    return { totalDebit, totalCredit };
  }, [journalLines]);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* ── Top Bar: Segmented Switcher & Executive Badge ── */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div className="flex items-center p-1 bg-slate-100/90 dark:bg-zinc-800/80 rounded-xl border border-slate-200/60 dark:border-zinc-700/60 shadow-2xs">
          {[
            { id: "pnl", label: "Profit & Loss" },
            { id: "balance_sheet", label: "Balance Sheet" },
            { id: "trial_balance", label: "Trial Balance" }
          ].map((tab) => {
            const isCurrent = reportType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setReportType(tab.id)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-150 cursor-pointer ${
                  isCurrent
                    ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white font-semibold shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span>Reporting Period:</span>
          <span className="font-semibold text-slate-800 dark:text-zinc-200">Current Fiscal Quarter</span>
        </div>
      </div>

      {/* ── Report Views ── */}
      {journalLines.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-400 flex items-center justify-center mb-3">
            <BarChart3 size={22} />
          </div>
          <h4 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
            No accounting records to report
          </h4>
          <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-sm mt-1">
            Financial statements are derived deterministically from posted journal entries. Ingest scans or create entries to view live reports.
          </p>
          <button
            type="button"
            onClick={onNavigateToScans}
            className="mt-4 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold cursor-pointer shadow-xs hover:bg-violet-700 transition-colors"
          >
            Review scans
          </button>
        </div>
      ) : reportType === "pnl" ? (
        /* ── Profit & Loss Statement ── */
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-6 shadow-2xs">
          <div className="mb-6 pb-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Profit & Loss Statement</h3>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">Accrual Basis • USD</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Net Income</span>
              <span className={`text-base font-bold font-mono ${pnlData.netIncome >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"}`}>
                {formatCurrency(pnlData.netIncome)}
              </span>
            </div>
          </div>

          <div className="space-y-6 text-xs">
            {/* Revenue Section */}
            <div>
              <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-zinc-300 pb-2 border-b border-slate-100 dark:border-zinc-800">
                <span className="uppercase tracking-wider text-[10.5px]">Operating Revenue</span>
                <span className="font-mono">{formatCurrency(pnlData.totalRevenue)}</span>
              </div>
              <div className="divide-y divide-slate-50 dark:divide-zinc-800/40 mt-1">
                {pnlData.revenues.map((r) => (
                  <div key={r.code} className="py-2.5 flex items-center justify-between px-2">
                    <span className="text-slate-600 dark:text-zinc-400">{r.code} — {r.name}</span>
                    <span className="font-mono text-slate-900 dark:text-zinc-100">{formatCurrency(r.balance)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expenses Section */}
            <div>
              <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-zinc-300 pb-2 border-b border-slate-100 dark:border-zinc-800">
                <span className="uppercase tracking-wider text-[10.5px]">Operating Expenses</span>
                <span className="font-mono">{formatCurrency(pnlData.totalExpenses)}</span>
              </div>
              <div className="divide-y divide-slate-50 dark:divide-zinc-800/40 mt-1">
                {pnlData.expenses.map((e) => (
                  <div key={e.code} className="py-2.5 flex items-center justify-between px-2">
                    <span className="text-slate-600 dark:text-zinc-400">{e.code} — {e.name}</span>
                    <span className="font-mono text-slate-900 dark:text-zinc-100">{formatCurrency(e.balance)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Net Total Summary Row */}
            <div className="pt-3 border-t-2 border-slate-900 dark:border-white flex items-center justify-between font-bold text-sm">
              <span className="text-slate-900 dark:text-white">Net Operating Income</span>
              <span className="font-mono text-slate-900 dark:text-white">{formatCurrency(pnlData.netIncome)}</span>
            </div>
          </div>
        </div>
      ) : reportType === "balance_sheet" ? (
        /* ── Balance Sheet ── */
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-6 shadow-2xs">
          <div className="mb-6 pb-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Balance Sheet</h3>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">Assets = Liabilities + Equity</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Total Assets</span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                {formatCurrency(balanceSheetData.totalAssets)}
              </span>
            </div>
          </div>

          <div className="space-y-6 text-xs">
            {/* Assets */}
            <div>
              <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-zinc-300 pb-2 border-b border-slate-100 dark:border-zinc-800">
                <span className="uppercase tracking-wider text-[10.5px]">Assets</span>
                <span className="font-mono">{formatCurrency(balanceSheetData.totalAssets)}</span>
              </div>
              <div className="divide-y divide-slate-50 dark:divide-zinc-800/40 mt-1">
                {balanceSheetData.assets.map((a) => (
                  <div key={a.code} className="py-2.5 flex items-center justify-between px-2">
                    <span className="text-slate-600 dark:text-zinc-400">{a.code} — {a.name}</span>
                    <span className="font-mono text-slate-900 dark:text-zinc-100">{formatCurrency(a.balance)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Liabilities */}
            <div>
              <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-zinc-300 pb-2 border-b border-slate-100 dark:border-zinc-800">
                <span className="uppercase tracking-wider text-[10.5px]">Liabilities</span>
                <span className="font-mono">{formatCurrency(balanceSheetData.totalLiabilities)}</span>
              </div>
              <div className="divide-y divide-slate-50 dark:divide-zinc-800/40 mt-1">
                {balanceSheetData.liabilities.map((l) => (
                  <div key={l.code} className="py-2.5 flex items-center justify-between px-2">
                    <span className="text-slate-600 dark:text-zinc-400">{l.code} — {l.name}</span>
                    <span className="font-mono text-slate-900 dark:text-zinc-100">{formatCurrency(l.balance)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Equity */}
            <div>
              <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-zinc-300 pb-2 border-b border-slate-100 dark:border-zinc-800">
                <span className="uppercase tracking-wider text-[10.5px]">Equity</span>
                <span className="font-mono">{formatCurrency(balanceSheetData.retainedEarnings)}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between px-2">
                <span className="text-slate-600 dark:text-zinc-400">Retained Earnings (Period Net Income)</span>
                <span className="font-mono text-slate-900 dark:text-zinc-100">{formatCurrency(balanceSheetData.retainedEarnings)}</span>
              </div>
            </div>

            {/* Liabilities & Equity Summary */}
            <div className="pt-3 border-t-2 border-slate-900 dark:border-white flex items-center justify-between font-bold text-sm">
              <span className="text-slate-900 dark:text-white">Total Liabilities & Equity</span>
              <span className="font-mono text-slate-900 dark:text-white">{formatCurrency(balanceSheetData.totalLiabilitiesAndEquity)}</span>
            </div>
          </div>
        </div>
      ) : (
        /* ── Trial Balance ── */
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F9FAFB] dark:bg-zinc-800/80 border-b border-slate-200/80 dark:border-white/[0.08] text-slate-600 dark:text-zinc-400 text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-5 w-24">Code</th>
                <th className="py-3 px-5">Account Name</th>
                <th className="py-3 px-5 text-right w-36">Total Debit</th>
                <th className="py-3 px-5 text-right w-36">Total Credit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/70 text-[12px]">
              {Object.values(accountsData).map((acc) => (
                <tr key={acc.code} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40">
                  <td className="py-3 px-5 font-mono font-bold text-slate-800 dark:text-zinc-200">{acc.code}</td>
                  <td className="py-3 px-5 text-slate-900 dark:text-zinc-100">{acc.name}</td>
                  <td className="py-3 px-5 text-right font-mono text-slate-800 dark:text-zinc-200">
                    {acc.debit > 0 ? formatCurrency(acc.debit) : "—"}
                  </td>
                  <td className="py-3 px-5 text-right font-mono text-slate-800 dark:text-zinc-200">
                    {acc.credit > 0 ? formatCurrency(acc.credit) : "—"}
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50 dark:bg-zinc-800/80 font-bold border-t-2 border-slate-900 dark:border-white">
                <td colSpan={2} className="py-3 px-5 text-slate-900 dark:text-white">Total Assertion</td>
                <td className="py-3 px-5 text-right font-mono text-slate-900 dark:text-white">{formatCurrency(trialBalanceTotals.totalDebit)}</td>
                <td className="py-3 px-5 text-right font-mono text-slate-900 dark:text-white">{formatCurrency(trialBalanceTotals.totalCredit)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
