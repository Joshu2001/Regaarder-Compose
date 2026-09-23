import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  X
} from "lucide-react";
import { formatCurrency } from "./ledgerEngine";
import RegaarderDropdown from "./RegaarderDropdown";

export default function LedgerScansView({
  documents = [],
  onSelectDocument = () => {}
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'verified' | 'review'
  const [typeFilter, setTypeFilter] = useState("all"); // 'all' | 'invoice' | 'receipt' | 'statement' | 'batch'
  const [sortField, setSortField] = useState("date"); // 'date' | 'amount' | 'vendor'
  const [sortDirection, setSortDirection] = useState("desc"); // 'asc' | 'desc'

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

  const getDocTypeLabel = (doc) => {
    const ref = (doc.reference || "").toUpperCase();
    const vendor = (doc.vendor || "").toLowerCase();
    const rawType = (doc.rawFileType || "").toLowerCase();
    if (ref.startsWith("INV") || vendor.includes("services") || vendor.includes("platform")) return "Invoice";
    if (ref.startsWith("RCT") || vendor.includes("store") || rawType === "png" || rawType === "jpg") return "Receipt";
    if (rawType === "csv" || ref.startsWith("TXN")) return "Batch Settlement";
    return "Statement";
  };

  const filteredAndSortedDocs = useMemo(() => {
    let result = documents.filter((doc) => {
      // 1. Status Filter
      if (statusFilter !== "all" && doc.status !== statusFilter) {
        return false;
      }

      // 2. Type Filter
      if (typeFilter !== "all") {
        const docType = getDocTypeLabel(doc).toLowerCase();
        if (!docType.includes(typeFilter.toLowerCase())) {
          return false;
        }
      }

      // 3. Deep Full-Text Metadata Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const vendor = (doc.vendor || "").toLowerCase();
        const ref = (doc.reference || "").toLowerCase();
        const date = (doc.date || "").toLowerCase();
        const total = String(doc.total || "");
        const formattedTotal = formatCurrency(doc.total).toLowerCase();
        const rawType = (doc.rawFileType || "").toLowerCase();
        const suggestedAccount = (doc.suggestedAccount || "").toLowerCase();
        const notes = (doc.notes || "").toLowerCase();
        const typeLabel = getDocTypeLabel(doc).toLowerCase();
        const itemsText = (doc.items || []).map(i => `${i.label} ${i.amount}`).join(" ").toLowerCase();

        const match =
          vendor.includes(query) ||
          ref.includes(query) ||
          date.includes(query) ||
          total.includes(query) ||
          formattedTotal.includes(query) ||
          rawType.includes(query) ||
          suggestedAccount.includes(query) ||
          notes.includes(query) ||
          typeLabel.includes(query) ||
          itemsText.includes(query);

        if (!match) return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      let comp = 0;
      if (sortField === "date") {
        comp = (a.date || "").localeCompare(b.date || "");
      } else if (sortField === "amount") {
        comp = (a.total || 0) - (b.total || 0);
      } else if (sortField === "vendor") {
        comp = (a.vendor || "").localeCompare(b.vendor || "");
      }
      return sortDirection === "asc" ? comp : -comp;
    });

    return result;
  }, [documents, searchQuery, statusFilter, typeFilter, sortField, sortDirection]);

  const handleToggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-4 select-none animate-in fade-in duration-150">
      
      {/* ── Page Header & Search + Filters Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
            Scans ({filteredAndSortedDocs.length})
          </h2>
          <p className="text-xs text-slate-400 dark:text-zinc-500 font-normal">
            Financial documents ingested, OCR-grounded, and verified into Ledger.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center gap-2">
          {/* Prominent Deep Search Input */}
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scans…"
              className="pl-8 pr-7 py-1.5 w-52 sm:w-64 text-xs bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 shadow-2xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Native Regaarder Status Dropdown */}
          <RegaarderDropdown
            value={statusFilter}
            options={[
              { value: "all", label: "All Statuses" },
              { value: "verified", label: "Processed" },
              { value: "review", label: "Review" }
            ]}
            onChange={(val) => setStatusFilter(val)}
            placeholder="All Statuses"
          />

          {/* Native Regaarder Type Dropdown */}
          <RegaarderDropdown
            value={typeFilter}
            options={[
              { value: "all", label: "All Types" },
              { value: "invoice", label: "Invoices" },
              { value: "receipt", label: "Receipts" },
              { value: "batch", label: "Settlements" }
            ]}
            onChange={(val) => setTypeFilter(val)}
            placeholder="All Types"
          />
        </div>
      </div>

      {/* ── Scans Grid Table (Matching Regaarder Sheets & Journal layout) ── */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead className="bg-[#F9FAFB] dark:bg-zinc-800/80 border-b border-slate-200/80 dark:border-white/[0.08] text-slate-600 dark:text-zinc-400 text-[11px] font-semibold sticky top-0 z-10">
            <tr>
              <th
                onClick={() => handleToggleSort("vendor")}
                className="p-3 border-r border-slate-200/70 dark:border-white/[0.06] cursor-pointer hover:text-slate-900 select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Scan</span>
                  <ArrowUpDown size={11} className={sortField === "vendor" ? "text-violet-600" : "text-slate-400"} />
                </div>
              </th>
              <th className="p-3 w-32 border-r border-slate-200/70 dark:border-white/[0.06]">
                Type
              </th>
              <th
                onClick={() => handleToggleSort("date")}
                className="p-3 w-28 border-r border-slate-200/70 dark:border-white/[0.06] cursor-pointer hover:text-slate-900 select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Date</span>
                  <ArrowUpDown size={11} className={sortField === "date" ? "text-violet-600" : "text-slate-400"} />
                </div>
              </th>
              <th
                onClick={() => handleToggleSort("amount")}
                className="p-3 w-32 text-right border-r border-slate-200/70 dark:border-white/[0.06] cursor-pointer hover:text-slate-900 select-none"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Amount</span>
                  <ArrowUpDown size={11} className={sortField === "amount" ? "text-violet-600" : "text-slate-400"} />
                </div>
              </th>
              <th className="p-3 w-28 text-center">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/70 text-[12px]">
            {filteredAndSortedDocs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 flex items-center justify-center mb-3">
                      <FileText size={20} />
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                      No scans found
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                      {searchTerm || statusFilter !== "all" || typeFilter !== "all" || dateFilter !== "all"
                        ? "Try adjusting or clearing your search filters."
                        : "No scanned documents have been ingested yet."}
                    </p>
                    {(searchTerm || statusFilter !== "all" || typeFilter !== "all" || dateFilter !== "all") && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm("");
                          setStatusFilter("all");
                          setTypeFilter("all");
                          setDateFilter("all");
                        }}
                        className="mt-3 px-3 py-1 text-[11px] font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 cursor-pointer"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedDocs.map((doc) => {
                const isVerified = doc.status === "verified";
                const docType = getDocTypeLabel(doc);

                return (
                  <tr
                    key={doc.id}
                    onClick={() => onSelectDocument(doc.id)}
                    className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors group"
                  >
                    {/* Scan: Icon + Vendor + Reference */}
                    <td className="p-3 border-r border-slate-100 dark:border-zinc-800">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-zinc-700/60">
                          {doc.rawFileType === "pdf" ? (
                            <FileText size={15} />
                          ) : (
                            <FileSpreadsheet size={15} className="text-emerald-500" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-slate-900 dark:text-zinc-100 block truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                            {doc.vendor}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 block truncate">
                            {doc.reference || "Unassigned reference"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="p-3 border-r border-slate-100 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 font-medium">
                      {docType}
                    </td>

                    {/* Date */}
                    <td className="p-3 border-r border-slate-100 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 font-normal">
                      {formatShortDate(doc.date)}
                    </td>

                    {/* Amount */}
                    <td className="p-3 text-right font-semibold font-mono text-slate-900 dark:text-white border-r border-slate-100 dark:border-zinc-800">
                      {formatCurrency(doc.total)}
                    </td>

                    {/* Status */}
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-zinc-400">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isVerified ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                          }`}
                        />
                        <span>{isVerified ? "Processed" : "Review"}</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
