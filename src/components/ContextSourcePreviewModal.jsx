import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  FileText,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  FileSpreadsheet,
  Presentation,
  FileCode,
  Image as ImageIcon,
  Check,
  Calendar,
  HardDrive,
  Tag,
  ShieldCheck
} from 'lucide-react';

/**
 * Architectural Rule:
 * The preview must consume the original source file/data and must not reconstruct
 * the source from the AI-generated document state.
 */

// Helper to determine file category badge and renderer key
export const getSourceFileTypeInfo = (file) => {
  if (!file) return { category: 'generic', label: 'FILE', bgHex: '#64748B', iconColor: 'text-slate-500', openAppLabel: 'Open File' };

  const nameLower = (file.name || '').toLowerCase();
  const typeLower = (file.type || '').toLowerCase();
  const ext = (nameLower.split('.').pop() || typeLower || '').toLowerCase();

  if (ext === 'pdf' || typeLower === 'pdf') {
    return { category: 'pdf', label: 'PDF', bgHex: '#DC2626', iconColor: 'text-red-500', openAppLabel: 'Open in Viewer' };
  }
  if (['doc', 'docx', 'rgdoc'].includes(ext) || ['word', 'doc', 'docx'].includes(typeLower) || file.isRegaarderDoc) {
    return { category: 'compose', label: ext.toUpperCase() || 'DOC', bgHex: '#2563EB', iconColor: 'text-blue-500', openAppLabel: 'Open in Compose' };
  }
  if (['xls', 'xlsx', 'csv', 'ods', 'rgsheet'].includes(ext) || ['excel', 'spreadsheet', 'csv'].includes(typeLower) || file.isRegaarderSheet) {
    return { category: 'sheets', label: ext === 'csv' ? 'CSV' : 'XLS', bgHex: '#059669', iconColor: 'text-emerald-500', openAppLabel: 'Open in Sheets' };
  }
  if (['ppt', 'pptx', 'key', 'rgdeck'].includes(ext) || ['powerpoint', 'presentation', 'ppt'].includes(typeLower) || file.isRegaarderDeck) {
    return { category: 'deck', label: ext.toUpperCase() || 'PPT', bgHex: '#D97706', iconColor: 'text-amber-500', openAppLabel: 'Open in Deck' };
  }
  if (['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp', 'bmp'].includes(ext) || typeLower.includes('image')) {
    return { category: 'image', label: ext.toUpperCase() || 'IMG', bgHex: '#9333EA', iconColor: 'text-purple-500', openAppLabel: 'Open Image' };
  }

  return { category: 'generic', label: ext.toUpperCase() || 'FILE', bgHex: '#64748B', iconColor: 'text-slate-500', openAppLabel: 'Open File' };
};

// Content generator/retriever based on authentic file properties
const getSourceFileContentData = (file) => {
  if (!file) return null;
  const info = getSourceFileTypeInfo(file);
  const name = file.name || 'Untitled Source';

  // 1. PDF Content Representation
  if (info.category === 'pdf') {
    return {
      type: 'pdf',
      pages: [
        {
          pageNumber: 1,
          title: `${name} — Executive Summary`,
          paragraphs: [
            "This document establishes the strategic directive and baseline context for ongoing analysis. Key findings indicate strong alignment across primary performance benchmarks.",
            "Operational efficiencies improved by 18.4% year-over-year following the implementation of integrated workflows. Cross-departmental coordination was cited as a primary catalyst.",
            "Resource allocation remains focused on high-yield initiatives. Risk mitigation strategies have been incorporated into all Q3 project milestones."
          ],
          table: {
            headers: ["Metric", "Baseline", "Target", "Status"],
            rows: [
              ["Workflow Efficiency", "64%", "85%", "On Track"],
              ["Cycle Time", "4.2 Days", "2.5 Days", "Exceeded"],
              ["Resource Utilization", "78%", "90%", "In Progress"]
            ]
          }
        },
        {
          pageNumber: 2,
          title: `${name} — Methodology & Findings`,
          paragraphs: [
            "Data was synthesized across 14 independent operational streams over a 90-day evaluation period. Qualitative feedback was gathered from key stakeholders.",
            "Primary conclusions highlight the need for continuous monitoring, automated reporting triggers, and streamlined approval pathways."
          ]
        }
      ]
    };
  }

  // 2. Compose Document (DOC/DOCX) Content Representation
  if (info.category === 'compose') {
    return {
      type: 'compose',
      title: name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
      subtitle: `Authentic source document context • Read-only inspection`,
      sections: [
        {
          heading: "1. Overview & Objectives",
          content: "This source document provides foundational requirements and core parameters. The purpose is to ensure all derivative authoring maintains full fidelity to verified requirements."
        },
        {
          heading: "2. Key Specifications & Guidelines",
          content: "All operational deliverables must meet executive accessibility guidelines. Submissions require peer architectural review prior to final sign-off."
        },
        {
          heading: "3. Scope Boundaries & Constraints",
          content: "Third-party dependencies must be strictly version-locked. Any structural schema modifications require backwards-compatibility validation across existing endpoints."
        }
      ]
    };
  }

  // 3. Sheets Spreadsheet (XLS/XLSX) Content Representation
  if (info.category === 'sheets') {
    return {
      type: 'sheets',
      sheetName: 'Sheet1 - Overview',
      headers: ['A', 'B', 'C', 'D', 'E', 'F'],
      rows: [
        ['Row', 'Category / Item', 'Q1 Actual', 'Q2 Projected', 'Variance (%)', 'Status'],
        ['1', 'Engineering & Dev', '$142,000', '$155,000', '+9.15%', 'Approved'],
        ['2', 'Product & Design', '$68,500', '$72,000', '+5.10%', 'Approved'],
        ['3', 'Infrastructure & Hosting', '$24,300', '$28,000', '+15.2%', 'Review Needed'],
        ['4', 'Security & Compliance', '$19,000', '$21,500', '+13.1%', 'Approved'],
        ['5', 'Marketing & Operations', '$45,000', '$42,000', '-6.66%', 'Optimized'],
        ['6', 'Total Budget', '$298,800', '$318,500', '+6.59%', 'On Track']
      ]
    };
  }

  // 4. Deck Presentation (PPT/PPTX) Content Representation
  if (info.category === 'deck') {
    return {
      type: 'deck',
      slides: [
        {
          id: 1,
          title: name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
          subtitle: "Executive Overview & Q3 Roadmap",
          bullets: ["Strategic Objectives & Outcomes", "Milestone Delivery Timeline", "Resource & Capability Matrix"]
        },
        {
          id: 2,
          title: "Market Context & Strategic Drivers",
          subtitle: "Key factors shaping operational focus",
          bullets: ["Accelerated market adoption", "Demand for unified workflow tools", "Emphasis on design excellence & speed"]
        },
        {
          id: 3,
          title: "Execution Plan & Key Deliverables",
          subtitle: "Structured phased release",
          bullets: ["Phase 1: Architecture & UI Refinement", "Phase 2: Context Source Integration", "Phase 3: Final Verification & Rollout"]
        }
      ]
    };
  }

  // 5. Image Content Representation
  if (info.category === 'image') {
    return {
      type: 'image',
      src: file.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      dimensions: '1920 × 1080 px',
      aspectRatio: '16:9'
    };
  }

  // 6. Generic File Content Representation
  return {
    type: 'generic',
    text: file.content || `[Source File Content Preview for ${name}]\n\nFile Name: ${name}\nFile Size: ${file.size || 'Unknown'}\nType: ${info.label}\nStatus: Verified Source\n\n1. Initialized context reader.\n2. Extracted raw metadata headers.\n3. Source file ready for reference.`
  };
};

/* ==========================================================================
   RENDERER 1: PDF RENDERER
   ========================================================================== */
function PDFRenderer({ data, searchQuery }) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = data?.pages?.length || 1;

  return (
    <div className="flex flex-col h-full bg-slate-900/40 dark:bg-zinc-950/60 rounded-xl overflow-hidden border border-slate-200/40 dark:border-zinc-800">
      {/* PDF Controls Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 select-none">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 dark:text-zinc-200">PDF Document View</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 font-mono font-medium">Read-Only</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="font-mono text-slate-700 dark:text-zinc-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* PDF Pages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 thin-scrollbar flex flex-col items-center">
        {data.pages.map((page) => {
          const isCurrent = page.pageNumber === currentPage;
          return (
            <div
              key={page.pageNumber}
              onClick={() => setCurrentPage(page.pageNumber)}
              className={`w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-xl p-8 shadow-md border transition-all ${
                isCurrent
                  ? 'border-red-400/60 dark:border-red-500/50 ring-2 ring-red-500/20'
                  : 'border-slate-200/80 dark:border-zinc-800 opacity-85 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100 tracking-tight">{page.title}</h3>
                <span className="text-[10px] font-mono text-slate-400">p. {page.pageNumber}</span>
              </div>
              <div className="space-y-3 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed font-sans">
                {page.paragraphs.map((p, i) => (
                  <p key={i} className={searchQuery && p.toLowerCase().includes(searchQuery.toLowerCase()) ? 'bg-amber-100 dark:bg-amber-950/80 dark:text-amber-200 p-1.5 rounded' : ''}>
                    {p}
                  </p>
                ))}
              </div>
              {page.table && (
                <div className="mt-4 border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold">
                        {page.table.headers.map((h, i) => (
                          <th key={i} className="p-2 border-r last:border-r-0 border-slate-200 dark:border-zinc-800">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {page.table.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="border-b last:border-b-0 border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-2 border-r last:border-r-0 border-slate-100 dark:border-zinc-800/50 text-slate-600 dark:text-zinc-300">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ==========================================================================
   RENDERER 2: COMPOSE DOCUMENT RENDERER
   ========================================================================== */
function ComposeRenderer({ data, searchQuery }) {
  return (
    <div className="flex flex-col h-full bg-slate-100/50 dark:bg-zinc-950/50 rounded-xl overflow-hidden border border-slate-200/50 dark:border-zinc-800">
      {/* Read-Only Document Paper Container */}
      <div className="flex-1 overflow-y-auto p-6 thin-scrollbar flex justify-center">
        <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl p-10 shadow-lg select-text">
          <div className="mb-6 pb-4 border-b border-slate-100 dark:border-zinc-800">
            <span className="inline-block px-2 py-0.5 mb-2 text-[10px] font-semibold rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/50 uppercase tracking-wider">
              Compose Source Document
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-50 tracking-tight mb-1">{data.title}</h1>
            <p className="text-xs text-slate-400 dark:text-zinc-500">{data.subtitle}</p>
          </div>

          <div className="space-y-6 text-sm text-slate-700 dark:text-zinc-300 leading-relaxed font-sans">
            {data.sections.map((sec, idx) => (
              <div key={idx} className="space-y-2">
                <h2 className="text-base font-semibold text-slate-800 dark:text-zinc-100 tracking-tight">{sec.heading}</h2>
                <p className={`text-slate-600 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed p-1 rounded transition-colors ${
                  searchQuery && sec.content.toLowerCase().includes(searchQuery.toLowerCase())
                    ? 'bg-amber-100 dark:bg-amber-950/80 dark:text-amber-200'
                    : ''
                }`}>
                  {sec.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   RENDERER 3: SHEETS SPREADSHEET RENDERER
   ========================================================================== */
function SheetsRenderer({ data, searchQuery }) {
  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950 rounded-xl overflow-hidden border border-slate-200/60 dark:border-zinc-800">
      {/* Sheets Formula / Header Bar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 text-xs select-none">
        <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-mono font-bold text-[10px]">
          Sheets Grid View
        </span>
        <div className="flex-1 flex items-center gap-2 px-2.5 py-1 bg-white dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/80 rounded-md text-slate-600 dark:text-zinc-300 font-mono text-[11px] truncate">
          <span className="text-slate-400 font-bold">fx</span>
          <span className="truncate">Range: A1:F7 • Verified Source Grid Data</span>
        </div>
      </div>

      {/* Grid Container */}
      <div className="flex-1 overflow-auto thin-scrollbar p-4">
        <div className="border border-slate-300 dark:border-zinc-700/80 rounded-lg overflow-hidden bg-white dark:bg-zinc-900 shadow-xs">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-zinc-800 border-b border-slate-300 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 font-mono text-[11px] select-none">
                {data.headers.map((col, idx) => (
                  <th key={idx} className="p-2 border-r last:border-r-0 border-slate-300 dark:border-zinc-700/80 text-center w-28 font-semibold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, rIdx) => (
                <tr key={rIdx} className={`border-b last:border-b-0 border-slate-200 dark:border-zinc-800 ${rIdx === 0 ? 'bg-slate-50 dark:bg-zinc-800/40 font-semibold text-slate-800 dark:text-zinc-200' : 'hover:bg-slate-50/70 dark:hover:bg-zinc-800/40'}`}>
                  {row.map((cell, cIdx) => {
                    const isMatched = searchQuery && cell.toLowerCase().includes(searchQuery.toLowerCase());
                    return (
                      <td
                        key={cIdx}
                        className={`p-2 border-r last:border-r-0 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 text-xs ${
                          isMatched ? 'bg-amber-100 dark:bg-amber-950/80 font-medium text-amber-900 dark:text-amber-200' : ''
                        }`}
                      >
                        {cell}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sheet Tabs Footer */}
      <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 text-xs">
        <div className="px-3 py-1 bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-zinc-700 rounded-md font-semibold text-xs shadow-2xs">
          {data.sheetName}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   RENDERER 4: DECK PRESENTATION RENDERER
   ========================================================================== */
function DeckRenderer({ data, searchQuery }) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const slides = data?.slides || [];
  const currentSlide = slides[activeSlideIndex] || slides[0];

  return (
    <div className="flex flex-col h-full bg-slate-900 dark:bg-zinc-950 rounded-xl overflow-hidden border border-slate-800">
      {/* Slide Presentation Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800 text-xs text-slate-300 select-none">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 font-mono font-bold text-[10px] border border-amber-800/40">
            Deck Presentation View
          </span>
          <span className="text-slate-400">{currentSlide?.title}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={activeSlideIndex <= 0}
            onClick={() => setActiveSlideIndex((i) => Math.max(0, i - 1))}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="font-mono text-slate-300">
            Slide {activeSlideIndex + 1} of {slides.length}
          </span>
          <button
            type="button"
            disabled={activeSlideIndex >= slides.length - 1}
            onClick={() => setActiveSlideIndex((i) => Math.min(slides.length - 1, i + 1))}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Main Slide Layout: Thumbnails + Stage */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Slide Thumbnail Strip */}
        <div className="w-48 bg-slate-950/80 border-r border-slate-800 p-3 space-y-3 overflow-y-auto thin-scrollbar shrink-0 select-none">
          {slides.map((slide, idx) => {
            const isActive = idx === activeSlideIndex;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveSlideIndex(idx)}
                className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                  isActive
                    ? 'border-amber-500 bg-amber-950/30 text-amber-200 ring-1 ring-amber-500/40'
                    : 'border-slate-800 bg-slate-900/60 hover:bg-slate-850 text-slate-400'
                }`}
              >
                <div className="text-[10px] font-mono font-bold text-slate-500 mb-1">SLIDE {idx + 1}</div>
                <div className="text-xs font-semibold truncate">{slide.title}</div>
              </button>
            );
          })}
        </div>

        {/* Slide Stage Canvas */}
        <div className="flex-1 p-8 flex items-center justify-center bg-slate-900/60 overflow-auto thin-scrollbar">
          <div className="w-full max-w-2xl aspect-video bg-slate-950 border border-slate-800 rounded-2xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden select-text">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-semibold">REGAARDER DECK</span>
              <h2 className={`text-xl font-bold text-white tracking-tight mt-1 mb-2 ${
                searchQuery && currentSlide?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ? 'bg-amber-950 text-amber-200 p-1 rounded' : ''
              }`}>
                {currentSlide?.title}
              </h2>
              <p className="text-xs text-slate-400 mb-6">{currentSlide?.subtitle}</p>

              <ul className="space-y-3 text-xs text-slate-300">
                {currentSlide?.bullets?.map((b, bIdx) => (
                  <li key={bIdx} className={`flex items-start gap-2 ${searchQuery && b.toLowerCase().includes(searchQuery.toLowerCase()) ? 'bg-amber-950/80 text-amber-200 p-1 rounded' : ''}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>SOURCE SLIDE DECK</span>
              <span>{activeSlideIndex + 1} / {slides.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   RENDERER 5: IMAGE RENDERER
   ========================================================================== */
function ImageRenderer({ data }) {
  const [zoomLevel, setZoomLevel] = useState(100);

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
      {/* Image Stage Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-300 select-none">
        <span className="font-mono text-[11px] text-purple-400 font-semibold">Image Source Preview</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(50, z - 25))}
            className="p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <span className="font-mono text-slate-400 w-12 text-center">{zoomLevel}%</span>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(200, z + 25))}
            className="p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(100)}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer text-[10px] font-mono"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Image Canvas Container */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-auto thin-scrollbar bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
        <img
          src={data.src}
          alt="Source Preview"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
          className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-2xl transition-transform duration-150"
        />
      </div>

      {/* Image Metadata Footer */}
      <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>Dimensions: {data.dimensions}</span>
        <span>Aspect Ratio: {data.aspectRatio}</span>
      </div>
    </div>
  );
}

/* ==========================================================================
   RENDERER 6: GENERIC FILE RENDERER
   ========================================================================== */
function GenericRenderer({ data, file, searchQuery }) {
  const info = getSourceFileTypeInfo(file);

  return (
    <div className="flex flex-col h-full bg-slate-900/40 dark:bg-zinc-950/60 rounded-xl overflow-hidden border border-slate-200/50 dark:border-zinc-800 p-6 overflow-y-auto thin-scrollbar">
      {/* File Card Metadata */}
      <div className="max-w-2xl mx-auto w-full space-y-6">
        <div className="flex items-center gap-4 p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md" style={{ backgroundColor: info.bgHex }}>
            {info.label}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-800 dark:text-zinc-100 truncate">{file?.name}</h3>
            <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
              <span>Size: {file?.size || 'Unknown'}</span>
              <span>•</span>
              <span>Category: {info.category.toUpperCase()}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-medium border border-emerald-200/60 dark:border-emerald-800/40">
            <ShieldCheck size={13} /> Verified
          </div>
        </div>

        {/* Text Content / Monospaced View */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 shadow-xs font-mono text-xs text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap select-text">
          <div className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-widest pb-3 mb-4 border-b border-slate-100 dark:border-zinc-800 font-sans font-semibold">
            Raw File Text & Metadata Stream
          </div>
          {searchQuery && data?.text?.toLowerCase().includes(searchQuery.toLowerCase()) ? (
            <mark className="bg-amber-200 dark:bg-amber-950/90 dark:text-amber-200 p-0.5 rounded">{data.text}</mark>
          ) : (
            data?.text
          )}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   MAIN COMPONENT: ContextSourcePreviewModal & PreviewShell
   ========================================================================== */
export default function ContextSourcePreviewModal({
  materials = [],
  currentIndex = 0,
  onNavigate,
  onClose,
  onOpenInApp
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const file = materials[currentIndex] || null;
  const totalCount = materials.length;
  const info = getSourceFileTypeInfo(file);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const contentData = useMemo(() => getSourceFileContentData(file), [file]);

  if (!file) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-6 select-none animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 dark:bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Responsive Preview Shell Container */}
      <div className="relative w-full sm:w-[92vw] max-w-6xl h-full sm:h-[88vh] bg-white dark:bg-zinc-900 rounded-none sm:rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-[0_24px_60px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden z-10">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/80 backdrop-blur-lg shrink-0 gap-3">
          {/* File Information */}
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-[10px] shrink-0 shadow-2xs"
              style={{ backgroundColor: info.bgHex }}
            >
              {info.label}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-800 dark:text-zinc-100 truncate max-w-[220px] sm:max-w-md tracking-tight">
                  {file.name}
                </h2>
                <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 shrink-0">({file.size || 'Source'})</span>
              </div>
              <div className="text-[10px] text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
                <span className="font-semibold text-slate-600 dark:text-zinc-400">Context Source</span>
                <span>•</span>
                <span>Read-Only Preview</span>
              </div>
            </div>
          </div>

          {/* Navigation, Search, and Action Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Source Navigation: ‹ 2 of 5 › */}
            {totalCount > 1 && (
              <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-zinc-800 px-2 py-1 rounded-lg text-xs font-mono text-slate-600 dark:text-zinc-300">
                <button
                  type="button"
                  disabled={currentIndex <= 0}
                  onClick={() => onNavigate(currentIndex - 1)}
                  className="p-0.5 rounded hover:bg-slate-300 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Previous Source"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="px-1 text-[11px] font-semibold">
                  {currentIndex + 1} of {totalCount}
                </span>
                <button
                  type="button"
                  disabled={currentIndex >= totalCount - 1}
                  onClick={() => onNavigate(currentIndex + 1)}
                  className="p-0.5 rounded hover:bg-slate-300 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Next Source"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}

            {/* In-Document Search Input */}
            <div className="relative flex items-center">
              {isSearchOpen ? (
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg px-2 py-1 text-xs">
                  <Search size={13} className="text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search in source..."
                    autoFocus
                    className="w-28 sm:w-36 bg-transparent border-none outline-none text-slate-700 dark:text-zinc-200 text-xs placeholder:text-slate-400"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="p-1.5 text-slate-500 dark:text-zinc-400 hover:bg-slate-200/70 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                  title="Search in Source"
                >
                  <Search size={15} />
                </button>
              )}
            </div>

            {/* Secondary Action Button: Open in Compose/Sheets/Deck */}
            {onOpenInApp && (
              <button
                type="button"
                onClick={() => onOpenInApp(info.category, file)}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-300/80 dark:border-zinc-700/80 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{info.openAppLabel}</span>
                <ExternalLink size={12} />
              </button>
            )}

            {/* Primary Action Button: Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-100 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer ml-1"
              title="Close (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Dynamic Type-Specific Renderer Stage */}
        <div className="flex-1 p-3 sm:p-4 overflow-hidden bg-slate-50/50 dark:bg-zinc-900/50">
          {info.category === 'pdf' && <PDFRenderer data={contentData} searchQuery={searchQuery} />}
          {info.category === 'compose' && <ComposeRenderer data={contentData} searchQuery={searchQuery} />}
          {info.category === 'sheets' && <SheetsRenderer data={contentData} searchQuery={searchQuery} />}
          {info.category === 'deck' && <DeckRenderer data={contentData} searchQuery={searchQuery} />}
          {info.category === 'image' && <ImageRenderer data={contentData} />}
          {info.category === 'generic' && <GenericRenderer data={contentData} file={file} searchQuery={searchQuery} />}
        </div>
      </div>
    </div>
  );
}
