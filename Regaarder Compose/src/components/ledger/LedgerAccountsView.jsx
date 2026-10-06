import React, { useState, useMemo } from "react";
import { Search, Building2, ArrowUpDown, ShieldCheck } from "lucide-react";
import { CHART_OF_ACCOUNTS, formatCurrency } from "./ledgerEngine";
import RegaarderDropdown from "./RegaarderDropdown";

export default function LedgerAccountsView({
  journalLines = [],
  onSelectAccount = () => {}
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortField, setSortField] = useState("code");
  const [sortOrder, setSortOrder] = useState("asc");

  // Deterministically compute live account balances from journal lines
  const accountStats = useMemo(() => {
    const stats = {};
    CHART_OF_ACCOUNTS.forEach((acc) => {
      stats[acc.code] = {
        totalDebit: 0,
        totalCredit: 0,
        entryCount: 0,
      };
    });

    journalLines.forEach((line) => {
      const code = line.accountCode;
      if (stats[code]) {
        stats[code].totalDebit += Number(line.debit) || 0;
        stats[code].totalCredit += Number(line.credit) || 0;
        stats[code].entryCount += 1;
      }
    });

    return stats;
  }, [journalLines]);

  const filteredAndSortedAccounts = useMemo(() => {
    return CHART_OF_ACCOUNTS.map((acc) => {
      const stat = accountStats[acc.code] || { totalDebit: 0, totalCredit: 0, entryCount: 0 };
      // Standard accounting normal balance:
      // Assets / Expenses = Debit - Credit
      // Liabilities / Equity / Revenue = Credit - Debit
      const isDebitNormal = acc.type === "Asset" || acc.type === "Expense";
      const balance = isDebitNormal
        ? stat.totalDebit - stat.totalCredit
        : stat.totalCredit - stat.totalDebit;

      return {
        ...acc,
        balance,
        totalDebit: stat.totalDebit,
        totalCredit: stat.totalCredit,
        entryCount: stat.entryCount,
      };
    })
      .filter((acc) => {
        if (typeFilter !== "all" && acc.type.toLowerCase() !== typeFilter.toLowerCase()) {
          return false;
        }
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
          acc.code.toLowerCase().includes(q) ||
          acc.name.toLowerCase().includes(q) ||
          acc.type.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (sortField === "code" || sortField === "name") {
          return sortOrder === "asc"
            ? String(valA).localeCompare(String(valB))
            : String(valB).localeCompare(String(valA));
        }
        return sortOrder === "asc" ? valA - valB : valB - valA;
      });
  }, [accountStats, typeFilter, searchTerm, sortField, sortOrder]);

  const handleToggleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto w-full">
      {/* ── Search & Filter Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search accounts by code, name, or type..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 shadow-2xs transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <RegaarderDropdown
            value={typeFilter}
            options={[
              { value: "all", label: "All Account Types" },
              { value: "asset", label: "Assets" },
              { value: "liability", label: "Liabilities" },
              { value: "revenue", label: "Revenue" },
              { value: "expense", label: "Expenses" },
            ]}
            onChange={(val) => setTypeFilter(val)}
            placeholder="All Account Types"
          />
        </div>
      </div>

      {/* ── Accounts Table Surface ── */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead className="bg-[#F9FAFB] dark:bg-zinc-800/80 border-b border-slate-200/80 dark:border-white/[0.08] text-slate-600 dark:text-zinc-400 text-[11px] font-semibold sticky top-0 z-10">
            <tr>
              <th
                onClick={() => handleToggleSort("code")}
                className="py-3 px-5 w-24 border-r border-slate-200/70 dark:border-white/[0.06] cursor-pointer hover:text-slate-900 select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Code</span>
                  <ArrowUpDown size={11} className={sortField === "code" ? "text-violet-600" : "text-slate-400"} />
                </div>
              </th>
              <th
                onClick={() => handleToggleSort("name")}
                className="py-3 px-5 border-r border-slate-200/70 dark:border-white/[0.06] cursor-pointer hover:text-slate-900 select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Account Name</span>
                  <ArrowUpDown size={11} className={sortField === "name" ? "text-violet-600" : "text-slate-400"} />
                </div>
              </th>
              <th className="py-3 px-5 w-32 border-r border-slate-200/70 dark:border-white/[0.06]">
                Type
              </th>
              <th
                onClick={() => handleToggleSort("balance")}
                className="py-3 px-5 w-36 text-right border-r border-slate-200/70 dark:border-white/[0.06] cursor-pointer hover:text-slate-900 select-none"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Live Balance</span>
                  <ArrowUpDown size={11} className={sortField === "balance" ? "text-violet-600" : "text-slate-400"} />
                </div>
              </th>
              <th
                onClick={() => handleToggleSort("entryCount")}
                className="py-3 px-5 w-28 text-center border-r border-slate-200/70 dark:border-white/[0.06] cursor-pointer hover:text-slate-900 select-none"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Postings</span>
                  <ArrowUpDown size={11} className={sortField === "entryCount" ? "text-violet-600" : "text-slate-400"} />
                </div>
              </th>
              <th className="py-3 px-5 w-28 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/70 text-[12px]">
            {filteredAndSortedAccounts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-400 flex items-center justify-center mb-3">
                      <Building2 size={20} />
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                      No accounts found
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                      No chart of accounts matched your filter criteria.
                    </p>
                    {(searchTerm || typeFilter !== "all") && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm("");
                          setTypeFilter("all");
                        }}
                        className="mt-3 px-3 py-1 text-[11px] font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 cursor-pointer"
                      >
                        Reset filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedAccounts.map((acc) => (
                <tr
                  key={acc.code}
                  onClick={() => onSelectAccount(acc.code)}
                  className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-5 font-mono font-bold text-slate-800 dark:text-zinc-200 border-r border-slate-100 dark:border-zinc-800">
                    {acc.code}
                  </td>
                  <td className="py-3.5 px-5 font-medium text-slate-900 dark:text-zinc-100 border-r border-slate-100 dark:border-zinc-800">
                    {acc.name}
                  </td>
                  <td className="py-3.5 px-5 border-r border-slate-100 dark:border-zinc-800">
                    <span className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">
                      {acc.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-900 dark:text-white border-r border-slate-100 dark:border-zinc-800">
                    {formatCurrency(acc.balance)}
                  </td>
                  <td className="py-3.5 px-5 text-center font-mono text-slate-500 dark:text-zinc-400 border-r border-slate-100 dark:border-zinc-800">
                    {acc.entryCount}
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/40">
                      <ShieldCheck size={11} className="text-emerald-600" />
                      <span>Active</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
