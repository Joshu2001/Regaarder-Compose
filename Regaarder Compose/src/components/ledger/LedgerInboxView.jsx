import React, { useRef, useState } from "react";
import {
  Upload,
  ChevronRight
} from "lucide-react";
import { formatCurrency } from "./ledgerEngine";

export default function LedgerInboxView({
  documents = [],
  onSelectDocument,
  onUploadMockFile,
  onNavigateToScans
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (onUploadMockFile) {
        onUploadMockFile(file.name);
      }
    }
  };

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

  const getVendorMonogram = (name = "") => {
    const cleaned = name.replace(/[^a-zA-Z0-9 ]/g, "").trim();
    const parts = cleaned.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return cleaned.slice(0, 2).toUpperCase() || "DC";
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 select-none animate-in fade-in duration-200">
      
      {/* ── 1. Top Document Intake Surface (Minimalist Apple Canvas) ── */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full rounded-3xl py-12 px-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border ${
          isDragging
            ? "border-violet-500/80 shadow-[0_8px_32px_rgba(124,58,237,0.12)] scale-[1.004] bg-violet-50/40 dark:bg-violet-950/20"
            : "border-slate-200/80 dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-[0_6px_24px_rgba(0,0,0,0.05)]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0 && onUploadMockFile) {
              onUploadMockFile(e.target.files[0].name);
            }
          }}
        />

        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center justify-center mb-3.5 shadow-2xs">
          <Upload size={20} strokeWidth={1.75} />
        </div>

        <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100 mb-1.5 tracking-tight">
          Drop receipts, invoices & statements
        </h3>
        <p className="text-xs text-slate-400 dark:text-zinc-500 font-normal">
          Drag and drop documents here, or click to browse
        </p>
      </div>

      {/* ── 2. Primary Focal Area: Recent Scans Grid ── */}
      <div className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
            Recent Scans
          </h4>
          <button
            type="button"
            onClick={onNavigateToScans}
            className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200 font-medium flex items-center gap-0.5 cursor-pointer transition-colors"
          >
            <span>View all</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {documents.length === 0 ? (
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-2xs">
            <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 flex items-center justify-center mb-3">
              <FileText size={20} />
            </div>
            <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
              No scans in your inbox
            </p>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 max-w-sm mt-1">
              Drop invoices, receipts, or bank statements onto the intake zone above to trigger real-time grounding.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {documents.map((doc) => {
              const isVerified = doc.status === "verified";
              const monogram = getVendorMonogram(doc.vendor);

              return (
                <div
                  key={doc.id}
                  onClick={() => onSelectDocument && onSelectDocument(doc.id)}
                  className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-zinc-700 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
                >
                  {/* Monogram + Vendor Header */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold text-xs tracking-wider flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-zinc-700/60 group-hover:bg-slate-200/60 dark:group-hover:bg-zinc-700 transition-colors">
                      {monogram}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                        {doc.vendor}
                      </h5>
                      <p className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 truncate mt-0.5">
                        {doc.reference || formatShortDate(doc.date)}
                      </p>
                    </div>
                  </div>

                  {/* Amount + Minimal Status Indicator */}
                  <div className="mt-5 flex items-end justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                        {formatCurrency(doc.total)}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-normal">
                        {formatShortDate(doc.date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-slate-500 dark:text-zinc-400">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isVerified ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                        }`}
                      />
                      <span>{isVerified ? "Processed" : "Review"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
