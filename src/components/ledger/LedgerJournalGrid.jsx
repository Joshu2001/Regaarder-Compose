import React, { useState, useMemo, useRef } from "react";
import {
  Search,
  Check,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Scale
} from "lucide-react";
import { formatCurrency, validateDoubleEntry, CHART_OF_ACCOUNTS } from "./ledgerEngine";
import RegaarderDropdown from "./RegaarderDropdown";

export default function LedgerJournalGrid({
  journalLines = [],
  onUpdateJournalLine,
  onSelectLineEvidence
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [accountFilter, setAccountFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCell, setEditingCell] = useState(null); // { lineId, field: 'description' | 'debit' | 'credit' | 'account' }
  const [editValue, setEditValue] = useState("");
  const rowsPerPage = 10;

  // Real double-entry calculation from all lines
  const balanceState = validateDoubleEntry(journalLines);

  // Distinct account options for filter
  const accountFilterOptions = useMemo(() => {
    const list = [{ value: "all", label: "All Accounts" }];
    const seen = new Set();
    journalLines.forEach((l) => {
      if (!seen.has(l.accountCode)) {
        seen.add(l.accountCode);
        list.push({ value: l.accountCode, label: `${l.accountCode} · ${l.accountName}` });
      }
    });
    return list;
  }, [journalLines]);

  const statusFilterOptions = [
    { value: "all", label: "All Statuses" },
    { value: "verified", label: "Verified" },
    { value: "review", label: "Needs review" }
  ];

  // Filtered entries
  const filteredLines = useMemo(() => {
    return journalLines.filter(line => {
      if (accountFilter !== "all" && line.accountCode !== accountFilter) {
        return false;
      }
      if (statusFilter !== "all" && line.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          line.date.toLowerCase().includes(q) ||
          line.accountCode.toLowerCase().includes(q) ||
          line.accountName.toLowerCase().includes(q) ||
          line.description.toLowerCase().includes(q) ||
          line.ref.toLowerCase().includes(q) ||
          String(line.debit).includes(q) ||
          String(line.credit).includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [journalLines, accountFilter, statusFilter, searchQuery]);

  // Pagination calculation
  const totalEntries = filteredLines.length;
  const totalPages = Math.ceil(totalEntries / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedLines = filteredLines.slice(startIndex, startIndex + rowsPerPage);

  const formatShortDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const handleStartEdit = (lineId, field, initialVal) => {
    setEditingCell({ lineId, field });
    setEditValue(initialVal !== undefined && initialVal !== null ? String(initialVal) : "");
  };

  const handleCommitEdit = (lineId, field) => {
    if (!editingCell || !onUpdateJournalLine) {
      setEditingCell(null);
      return;
    }

    if (field === "debit" || field === "credit") {
      const numeric = parseFloat(editValue.replace(/[^0-9.-]/g, "")) || 0;
      onUpdateJournalLine(lineId, { [field]: numeric });
    } else if (field === "description") {
      onUpdateJournalLine(lineId, { description: editValue.trim() });
    }
    setEditingCell(null);
  };

  const handleSelectAccount = (lineId, newCode) => {
    const matched = CHART_OF_ACCOUNTS.find(a => a.code === newCode);
    if (matched && onUpdateJournalLine) {
      onUpdateJournalLine(lineId, {
        accountCode: matched.code,
        accountName: matched.name
      });
    }
    setEditingCell(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-4 select-none animate-in fade-in duration-150">
      
      {/* ── 1. Top Bar: Title & Consolidated Executive Balance Surface ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
            Journal
          </h2>
          <p className="text-xs text-slate-400 dark:text-zinc-500 font-normal mt-0.5">
            Double-entry accounting records
          </p>
        </div>

        {/* Consolidated Financial Summary Strip */}
        <div className="inline-flex items-center divide-x divide-slate-100 dark:divide-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
          {/* Debits */}
          <div className="px-5 py-2.5 flex flex-col min-w-[120px]">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>Debits</span>
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-1 tracking-tight">
              {formatCurrency(balanceState.totalDebit)}
            </span>
          </div>

          {/* Credits */}
          <div className="px-5 py-2.5 flex flex-col min-w-[120px]">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>Credits</span>
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-1 tracking-tight">
              {formatCurrency(balanceState.totalCredit)}
            </span>
          </div>

          {/* Balanced Status Pill */}
          <div className="px-5 py-2.5 flex flex-col justify-center min-w-[140px]">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${
                balanceState.isBalanced ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-rose-500"
              }`} />
              <span className={`text-xs font-bold ${
                balanceState.isBalanced ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700"
              }`}>
                {balanceState.isBalanced ? "Balanced" : "Unbalanced"}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono mt-1">
              {balanceState.isBalanced ? "Exact Δ = $0.00" : `${formatCurrency(balanceState.variance)} variance`}
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. Filter & Search Controls (Native Regaarder Dropdowns) ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search Journal */}
          <div className="relative flex items-center">
            <Search size={13} className="absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search journal..."
              className="pl-8 pr-3 py-1.5 w-60 sm:w-72 text-xs bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-violet-500 shadow-2xs transition-colors"
            />
          </div>

          {/* Native Regaarder Account Dropdown */}
          <RegaarderDropdown
            value={accountFilter}
            options={accountFilterOptions}
            onChange={(val) => setAccountFilter(val)}
            placeholder="All Accounts"
          />

          {/* Native Regaarder Status Dropdown */}
          <RegaarderDropdown
            value={statusFilter}
            options={statusFilterOptions}
            onChange={(val) => setStatusFilter(val)}
            placeholder="All Statuses"
          />
        </div>

        <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">
          {filteredLines.length} {filteredLines.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {/* ── 3. Expansive Sheets Table Surface with Live Inline Editing ── */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead className="bg-[#FAFAFA] dark:bg-zinc-800/90 border-b border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-zinc-300 text-[11px] font-semibold sticky top-0 z-10">
            <tr>
              <th className="py-3 px-5 w-28">Date</th>
              <th className="py-3 px-5 w-80">Account</th>
              <th className="py-3 px-5">Description</th>
              <th className="py-3 px-5 text-right w-32">Debit</th>
              <th className="py-3 px-5 text-right w-32">Credit</th>
              <th className="py-3 px-5 w-48 whitespace-nowrap">Source</th>
              <th className="py-3 px-5 w-32 text-center whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 text-[12px]">
            {paginatedLines.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 flex items-center justify-center mb-3">
                      <BookOpen size={20} />
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                      No journal entries found
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                      {searchQuery || accountFilter !== 'all' || statusFilter !== 'all'
                        ? "Try clearing your search query or filters."
                        : "No double-entry postings have been committed yet."}
                    </p>
                    {(searchQuery || accountFilter !== 'all' || statusFilter !== 'all') && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setAccountFilter('all');
                          setStatusFilter('all');
                        }}
                        className="mt-3 px-3 py-1 text-[11px] font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 cursor-pointer"
                      >
                        Clear journal filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedLines.map((line) => {
                const isVerified = line.status === 'verified';
                const isEditingAccount = editingCell?.lineId === line.id && editingCell?.field === 'account';
                const isEditingDesc = editingCell?.lineId === line.id && editingCell?.field === 'description';
                const isEditingDebit = editingCell?.lineId === line.id && editingCell?.field === 'debit';
                const isEditingCredit = editingCell?.lineId === line.id && editingCell?.field === 'credit';

                return (
                  <tr
                    key={line.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-3.5 px-5 text-slate-600 dark:text-zinc-400 font-normal whitespace-nowrap">
                      {formatShortDate(line.date)}
                    </td>

                    {/* Account: Inline Selector on click */}
                    <td className="py-3.5 px-5">
                      {isEditingAccount ? (
                        <div className="relative">
                          <select
                            autoFocus
                            value={line.accountCode}
                            onChange={(e) => handleSelectAccount(line.id, e.target.value)}
                            onBlur={() => setEditingCell(null)}
                            className="w-full text-xs p-1.5 rounded-lg border border-violet-400 bg-white dark:bg-zinc-800 outline-none"
                          >
                            {CHART_OF_ACCOUNTS.map(a => (
                              <option key={a.code} value={a.code}>
                                {a.code} · {a.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div
                          onClick={() => handleStartEdit(line.id, 'account')}
                          className="flex flex-col cursor-pointer hover:bg-slate-100/60 dark:hover:bg-zinc-800/60 p-1 -m-1 rounded-lg transition-colors group/acc"
                          title="Click to edit account"
                        >
                          <span className="font-semibold text-slate-900 dark:text-zinc-100 leading-tight group-hover/acc:text-violet-600 dark:group-hover/acc:text-violet-400">
                            {line.accountCode}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-normal leading-tight mt-0.5 truncate max-w-sm">
                            {line.accountName}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Description: Inline Editable Text */}
                    <td className="py-3.5 px-5 text-slate-700 dark:text-zinc-300 font-normal">
                      {isEditingDesc ? (
                        <input
                          autoFocus
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleCommitEdit(line.id, 'description')}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCommitEdit(line.id, 'description');
                            if (e.key === 'Escape') setEditingCell(null);
                          }}
                          className="w-full text-xs px-2 py-1 rounded-lg border border-violet-400 bg-white dark:bg-zinc-800 outline-none"
                        />
                      ) : (
                        <span
                          onClick={() => handleStartEdit(line.id, 'description', line.description)}
                          className="cursor-pointer hover:bg-slate-100/60 dark:hover:bg-zinc-800/60 p-1 -m-1 rounded-lg transition-colors block truncate"
                          title="Click to edit description"
                        >
                          {line.description}
                        </span>
                      )}
                    </td>

                    {/* Debit: Inline Editable Number */}
                    <td className="py-3.5 px-5 text-right font-mono font-medium whitespace-nowrap">
                      {isEditingDebit ? (
                        <input
                          autoFocus
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleCommitEdit(line.id, 'debit')}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCommitEdit(line.id, 'debit');
                            if (e.key === 'Escape') setEditingCell(null);
                          }}
                          className="w-24 text-right text-xs px-1.5 py-1 rounded-lg border border-violet-400 bg-white dark:bg-zinc-800 outline-none font-mono"
                        />
                      ) : (
                        <span
                          onClick={() => handleStartEdit(line.id, 'debit', line.debit > 0 ? line.debit : "")}
                          className="cursor-pointer hover:bg-slate-100/60 dark:hover:bg-zinc-800/60 p-1 -m-1 rounded-lg transition-colors text-slate-900 dark:text-white"
                          title="Click to edit debit"
                        >
                          {line.debit > 0 ? formatCurrency(line.debit) : '—'}
                        </span>
                      )}
                    </td>

                    {/* Credit: Inline Editable Number */}
                    <td className="py-3.5 px-5 text-right font-mono font-medium whitespace-nowrap">
                      {isEditingCredit ? (
                        <input
                          autoFocus
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleCommitEdit(line.id, 'credit')}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCommitEdit(line.id, 'credit');
                            if (e.key === 'Escape') setEditingCell(null);
                          }}
                          className="w-24 text-right text-xs px-1.5 py-1 rounded-lg border border-violet-400 bg-white dark:bg-zinc-800 outline-none font-mono"
                        />
                      ) : (
                        <span
                          onClick={() => handleStartEdit(line.id, 'credit', line.credit > 0 ? line.credit : "")}
                          className="cursor-pointer hover:bg-slate-100/60 dark:hover:bg-zinc-800/60 p-1 -m-1 rounded-lg transition-colors text-slate-900 dark:text-white"
                          title="Click to edit credit"
                        >
                          {line.credit > 0 ? formatCurrency(line.credit) : '—'}
                        </span>
                      )}
                    </td>

                    {/* Source Evidence */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onSelectLineEvidence && onSelectLineEvidence(line.docId)}
                        className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 font-medium transition-colors cursor-pointer group/src whitespace-nowrap"
                        title={`Inspect source document ${line.ref}`}
                      >
                        <FileText size={13} strokeWidth={1.75} className="text-slate-400 group-hover/src:text-violet-600 transition-colors shrink-0" />
                        <span className="underline decoration-slate-300 group-hover/src:decoration-violet-500 underline-offset-2 whitespace-nowrap">
                          {line.ref}
                        </span>
                      </button>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-5 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-zinc-400 whitespace-nowrap">
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            isVerified ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                          }`}
                        />
                        <span>{isVerified ? "Verified" : "Needs review"}</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* ── 4. Pagination / Results Footer ── */}
        <div className="py-3 px-5 border-t border-slate-100 dark:border-zinc-800 bg-[#FAFAFA] dark:bg-zinc-800/40 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
          <span>
            Showing {totalEntries === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + rowsPerPage, totalEntries)} of {totalEntries} entries
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="p-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Previous Page"
            >
              <ChevronLeft size={13} />
            </button>
            <span className="px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-zinc-300 font-mono">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="p-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Next Page"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
