import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SheetIcon, AssistIcon } from '../RegaarderProductIcons';
import { BrowserCloseIcon, BrowserCheckIcon } from './RegaarderBrowserIcons';

/**
 * SendToSheetsPopover: Contextual Action popover for structured table extraction and export to Sheets.
 * Follows Design Directive: ONE OBVIOUS ACTION → INTELLIGENT CONTEXT DETECTION → MINIMAL NECESSARY CHOICE → IMMEDIATE VISIBLE RESULT
 */
export const SendToSheetsPopover = ({
  anchorRect,
  activeTab,
  activeSheets = [],
  isStandalone = false,
  onClose,
  onExecuteExport,
  showToast
}) => {
  // Detection phase states: 'detecting', 'ready', 'preview', 'executed'
  const [phase, setPhase] = useState('detecting');
  const [hasSelection, setHasSelection] = useState(false);
  const [selectedTextSnippet, setSelectedTextSnippet] = useState('');
  const [detectedTables, setDetectedTables] = useState([]);
  const [selectedTableIds, setSelectedTableIds] = useState([]);

  // Destination & Range states
  const [destinationSheet, setDestinationSheet] = useState(
    activeSheets[0]?.title || `Research — ${activeTab?.title || 'Extracted Table'}`
  );
  const [sheetTabName, setSheetTabName] = useState('Competitor Pricing');
  const [targetCell, setTargetCell] = useState('A1');

  // Preview data state
  const [previewData, setPreviewData] = useState(null);

  // Run intelligent context detection on mount
  useEffect(() => {
    let isMounted = true;
    const detectContext = () => {
      // Check window/document selection if active
      const userSel = window.getSelection()?.toString().trim();
      if (userSel && userSel.length > 0) {
        if (!isMounted) return;
        setHasSelection(true);
        setSelectedTextSnippet(userSel.slice(0, 140));
        setPreviewData({
          title: 'Selected Content Table',
          headers: ['Item', 'Attribute', 'Value', 'Source'],
          rows: [
            ['Selection 1', 'Extracted Snippet', userSel.slice(0, 45) + '...', activeTab?.url || 'Webpage'],
            ['Selection 2', 'Word Count', `${userSel.split(/\s+/).length} words`, 'DOM Selection'],
            ['Selection 3', 'Extraction Date', new Date().toLocaleDateString(), 'System']
          ],
          totalRows: 3,
          totalCols: 4
        });
        setPhase('ready');
        return;
      }

      let domain = 'page';
      try {
        if (activeTab?.url && activeTab.url.startsWith('http')) {
          domain = new URL(activeTab.url).hostname.replace(/^www\./i, '');
        } else if (activeTab?.url) {
          domain = activeTab.url.replace(/^regaarder:\/\//i, '');
        }
      } catch (e) {
        domain = 'page';
      }
      const mockTables = [
        {
          id: 'table-1',
          name: 'Pricing & Plan Comparison',
          rows: 24,
          cols: 5,
          checked: true,
          headers: ['Plan', 'Monthly Price', 'Annual Price', 'Storage', 'Support Tier'],
          sampleRows: [
            ['Starter', '$29', '$290', '100 GB', 'Standard Email'],
            ['Professional', '$79', '$790', '1 TB', '24/7 Priority'],
            ['Enterprise', '$199', '$1,990', 'Unlimited', 'Dedicated AM']
          ]
        },
        {
          id: 'table-2',
          name: 'Feature Matrix & Specifications',
          rows: 16,
          cols: 4,
          checked: false,
          headers: ['Feature Name', 'Core Tier', 'Pro Tier', 'Enterprise Tier'],
          sampleRows: [
            ['API Access', '1,000 req/mo', '100,000 req/mo', 'Unlimited'],
            ['Custom Domains', '1', '5', 'Unlimited'],
            ['SLA Guarantee', '99.5%', '99.9%', '99.99%']
          ]
        },
        {
          id: 'table-3',
          name: 'Company Financial Metrics 2026',
          rows: 8,
          cols: 3,
          checked: false,
          headers: ['Metric', 'Current Quarter', 'YoY Growth'],
          sampleRows: [
            ['ARR', '$14.2M', '45%'],
            ['Net Retention', '118%', '+4%'],
            ['Gross Margin', '78%', '+2%']
          ]
        }
      ];

      if (!isMounted) return;
      setDetectedTables(mockTables);
      setSelectedTableIds(['table-1']);
      setPreviewData({
        title: mockTables[0].name,
        headers: mockTables[0].headers,
        rows: mockTables[0].sampleRows,
        totalRows: mockTables[0].rows,
        totalCols: mockTables[0].cols
      });
      setPhase('ready');
    };

    const timer = setTimeout(detectContext, 150);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [activeTab?.url]);

  const handleToggleTable = (tableId) => {
    setSelectedTableIds((prev) => {
      const next = prev.includes(tableId)
        ? prev.filter((id) => id !== tableId)
        : [...prev, tableId];
      
      const primary = detectedTables.find((t) => next.includes(t.id)) || detectedTables[0];
      if (primary) {
        setPreviewData({
          title: primary.name,
          headers: primary.headers,
          rows: primary.sampleRows,
          totalRows: primary.rows,
          totalCols: primary.cols
        });
      }
      return next;
    });
  };

  const handleExecuteSend = () => {
    const tableToExport = previewData || {
      title: 'Extracted Research Data',
      rows: [
        ['Metric 1', 'Value A', '100%'],
        ['Metric 2', 'Value B', '$49']
      ],
      headers: ['Metric', 'Details', 'Value'],
      totalRows: 24,
      totalCols: 5
    };

    onExecuteExport({
      destinationSheet,
      sheetTabName,
      targetCell,
      tableData: tableToExport
    });
    onClose();
  };

  // Compute position relative to toolbar icon or side panel anchor
  const topPos = anchorRect
    ? (anchorRect.top !== undefined && anchorRect.bottom !== undefined && anchorRect.bottom < 200
        ? Math.max(86, anchorRect.bottom + 6)
        : anchorRect.top !== undefined
          ? Math.max(86, anchorRect.top)
          : Math.max(86, (anchorRect.bottom || 80) + 6))
    : 86;
  const rightPos = anchorRect
    ? (anchorRect.right !== undefined && anchorRect.right < 500
        ? anchorRect.right
        : Math.max(16, window.innerWidth - (anchorRect.right || 420)))
    : 24;

  const content = (
    <div
      data-popover
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={isStandalone ? {} : { top: `${topPos}px`, right: `${rightPos}px` }}
      className={`${
        isStandalone
          ? 'relative z-[100000] w-full max-w-md border border-white/10 shadow-2xl'
          : 'fixed z-[100000] w-[420px] max-h-[85vh] flex flex-col border border-white/10 shadow-2xl animate-in fade-in zoom-in-[0.98] duration-100 ease-out'
      } bg-[#161822]/95 backdrop-blur-2xl rounded-2xl overflow-hidden font-sans text-slate-100 select-none`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-white/[0.03] border-b border-white/[0.08] shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <SheetIcon size={16} />
          </div>
          <div>
            <h3 className="text-xs font-semibold tracking-tight text-slate-100">Send to Regaarder Sheets</h3>
            <p className="text-[10px] text-slate-400">Contextual structured matrix extraction</p>
          </div>
        </div>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onClose();
          }}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <BrowserCloseIcon size={14} />
        </button>
      </div>

      {/* Body Content */}
      <div className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[calc(85vh-120px)] regaarder-scrollbar">
        {phase === 'detecting' ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400 text-xs space-y-2">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span>Detecting webpage content structure & selection...</span>
          </div>
        ) : phase === 'preview' && previewData ? (
          /* Detailed Preview Step */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <AssistIcon size={13} className="text-emerald-400" />
                Data Preview ({previewData.totalRows} rows × {previewData.totalCols} cols)
              </span>
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  setPhase('ready');
                }}
                className="text-[10px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
              >
                Back to settings
              </button>
            </div>

            {/* Table Sample */}
            <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/60 p-2">
              <table className="w-full text-left text-[11px] border-collapse font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    {previewData.headers.map((h, i) => (
                      <th key={i} className="pb-1.5 px-2 font-semibold text-emerald-300/90">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {previewData.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/50">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="py-1 px-2">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Destination:</span>
                <span className="font-semibold text-slate-200">{destinationSheet}</span>
              </div>
              <div className="flex justify-between">
                <span>Sheet Tab:</span>
                <span className="font-semibold text-slate-200">{sheetTabName}</span>
              </div>
              <div className="flex justify-between">
                <span>Target Range:</span>
                <span className="font-semibold text-emerald-400">{targetCell}</span>
              </div>
            </div>
          </div>
        ) : (
          /* Normal Ready Phase */
          <>
            {/* STEP 1: CONTEXT SELECTION */}
            <div className="space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                1. Context Detection
              </span>

              {hasSelection ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                  <div className="flex items-center justify-between text-xs text-emerald-300 font-semibold">
                    <span>Active Selection Prioritized</span>
                    <BrowserCheckIcon size={14} />
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-2 italic">
                    "{selectedTextSnippet}"
                  </p>
                </div>
              ) : detectedTables.length > 0 ? (
                <div className="space-y-1.5">
                  <div className="text-[11px] text-slate-300 font-medium flex justify-between">
                    <span>{detectedTables.length} structured tables detected:</span>
                    <span className="text-[10px] text-slate-500 font-mono">Select tables</span>
                  </div>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto no-scrollbar">
                    {detectedTables.map((tbl) => {
                      const isChecked = selectedTableIds.includes(tbl.id);
                      return (
                        <div
                          key={tbl.id}
                          onPointerDown={(e) => {
                            e.preventDefault();
                            handleToggleTable(tbl.id);
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-slate-100'
                              : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="rounded border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
                            />
                            <div className="flex flex-col">
                              <span className="text-xs font-medium">{tbl.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {tbl.rows} rows × {tbl.cols} cols
                              </span>
                            </div>
                          </div>
                          {isChecked && <BrowserCheckIcon size={14} className="text-emerald-400" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
                  <p>No structured table detected on this webpage.</p>
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      showToast('Manual region extraction activated. Highlight page content to clip.');
                    }}
                    className="w-full py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Select Content Region
                  </button>
                </div>
              )}
            </div>

            {/* STEP 2: DESTINATION CONFIGURATION */}
            <div className="space-y-2 pt-1 border-t border-slate-800">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                2. Sheet Destination
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 mb-1 block">Workbook Target</label>
                  <input
                    type="text"
                    value={destinationSheet}
                    onChange={(e) => setDestinationSheet(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-emerald-500/80 font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 mb-1 block">Sheet Tab</label>
                  <input
                    type="text"
                    value={sheetTabName}
                    onChange={(e) => setSheetTabName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-emerald-500/80 font-medium"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer Action Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/90 border-t border-slate-800">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            if (phase === 'ready' && previewData) {
              setPhase('preview');
            } else {
              onClose();
            }
          }}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {phase === 'ready' && previewData ? 'Preview' : 'Cancel'}
        </button>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            handleExecuteSend();
          }}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
        >
          <SheetIcon size={14} />
          <span>Send to Sheets</span>
        </button>
      </div>
    </div>
  );

  if (isStandalone) return content;

  const targetNode = document.fullscreenElement ?? document.body;
  return createPortal(content, targetNode);
};

export default SendToSheetsPopover;
