import React, { useState } from 'react';
import { Upload, ArrowRight, Database, FileText, CheckCircle2, ChevronLeft, ArrowUpRight } from 'lucide-react';
import RegaarderBrandIcon from '../../RegaarderBrandIcon';
import { RegaarderAiIcon } from '../../RegaarderProductIcons';

export default function OnboardingOrganizeStep({ onBack, onComplete }) {
  const [droppedFiles, setDroppedFiles] = useState([]);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexingDone, setIndexingDone] = useState(false);

  const handleSimulatedFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const fileNames = files.map(f => f.name);
      setDroppedFiles(fileNames);
    }
  };

  const handleTriggerIndexing = () => {
    setIsIndexing(true);
    setTimeout(() => {
      setIsIndexing(false);
      setIndexingDone(true);
      setTimeout(() => {
        onComplete({
          type: 'action',
          destination: 'omni-portal',
          toast: droppedFiles.length > 0 ? `${droppedFiles.length} files queued in Universal Memory` : 'Universal Memory activated'
        });
      }, 700);
    }, 1100);
  };

  return (
    <div className="relative w-full h-full min-h-[580px] flex flex-col justify-between p-8 sm:p-12 select-none animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-2">
          <RegaarderBrandIcon size={18} className="text-slate-900 dark:text-zinc-100" />
          <span className="text-[13px] font-bold text-slate-900 dark:text-zinc-100">Universal Memory</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-xl w-full mx-auto my-auto py-2 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-[11.5px] font-semibold mb-4">
          <Database size={13} />
          <span>Context Ingestion & Cross-Reference</span>
        </div>

        <h2 className="text-[26px] sm:text-[30px] font-semibold text-slate-900 dark:text-zinc-100 tracking-tight leading-tight mb-2.5">
          Bring your documents & data together
        </h2>
        <p className="text-[13.5px] text-slate-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed mb-6">
          Drop your existing PDFs, spreadsheets, or notes. Regaarder indexes them into Universal Memory so you can search, cross-reference, and summarize across every file.
        </p>

        {/* Drag and Drop Zone */}
        <label className="relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-700 hover:border-emerald-500/80 dark:hover:border-emerald-500/80 bg-slate-50/60 dark:bg-zinc-900/40 hover:bg-emerald-50/20 transition-all cursor-pointer group mb-5">
          <input
            type="file"
            multiple
            className="hidden"
            onChange={handleSimulatedFiles}
          />
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-white/10 shadow-xs flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3 group-hover:scale-105 transition-transform">
            <Upload size={22} strokeWidth={1.8} />
          </div>
          <span className="text-[13px] font-semibold text-slate-800 dark:text-zinc-200 mb-1">
            {droppedFiles.length > 0 ? `${droppedFiles.length} files selected` : 'Click to select or drag & drop files'}
          </span>
          <span className="text-[11.5px] text-slate-400 dark:text-zinc-500">
            Supports PDF, DOCX, XLSX, CSV, Markdown & TXT
          </span>

          {droppedFiles.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-1.5 max-h-20 overflow-y-auto">
              {droppedFiles.map((fn, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[10.5px] font-medium">
                  <FileText size={10} />
                  <span className="max-w-[120px] truncate">{fn}</span>
                </span>
              ))}
            </div>
          )}
        </label>

        {/* Memory Superpower Callout */}
        <div className="grid grid-cols-2 gap-3 text-left mb-6">
          <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/70 dark:border-white/5">
            <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200 text-[12px] font-semibold mb-1">
              <Database size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>Universal Search</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 leading-snug">
              Semantic retrieval across all uploaded files and meeting notes.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/70 dark:border-white/5">
            <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200 text-[12px] font-semibold mb-1">
              <RegaarderAiIcon size={13} className="text-violet-600 dark:text-violet-400" />
              <span>AI Cross-Synthesis</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 leading-snug">
              Compare contradictory points across documents automatically.
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={isIndexing}
            onClick={handleTriggerIndexing}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-[13px] font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {indexingDone ? (
              <>
                <CheckCircle2 size={15} />
                <span>Indexed! Opening...</span>
              </>
            ) : isIndexing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Indexing Into Memory...</span>
              </>
            ) : (
              <>
                <span>{droppedFiles.length > 0 ? 'Index & Open Ingestion' : 'Open Ingestion Portal'}</span>
                <ArrowRight size={14} strokeWidth={2} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Footer hint */}
      <div className="flex items-center justify-between w-full pt-4 border-t border-slate-100 dark:border-white/5">
        <span className="text-[11.5px] text-slate-400 dark:text-zinc-500">
          Files are processed locally and stored securely in your private workspace.
        </span>
        <button
          type="button"
          onClick={() => onComplete({ type: 'action', destination: 'omni-portal' })}
          className="inline-flex items-center gap-1 text-[11.5px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
        >
          <span>Open Full Omni-Portal</span>
          <ArrowUpRight size={12} />
        </button>
      </div>
    </div>
  );
}
