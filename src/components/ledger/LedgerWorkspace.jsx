import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  HardDrive,
  BookOpen,
  Users
} from "lucide-react";
import LedgerInboxView from "./LedgerInboxView";
import LedgerScansView from "./LedgerScansView";
import LedgerDocumentReview from "./LedgerDocumentReview";
import LedgerJournalGrid from "./LedgerJournalGrid";
import LedgerReconciliation from "./LedgerReconciliation";
import LedgerAccountsView from "./LedgerAccountsView";
import LedgerReportsView from "./LedgerReportsView";
import LedgerHoverSidebar from "./LedgerHoverSidebar";
import OmniPortalModal from "../OmniPortalModal";
import { RegaarderAiIcon } from "../RegaarderProductIcons";
import {
  INITIAL_DOCUMENTS,
  INITIAL_JOURNAL_LINES,
  INITIAL_BANK_FEED,
  validateDoubleEntry
} from "./ledgerEngine";

export default function LedgerWorkspace({
  onBackToHome,
  onOpenWorkspaceSwitcher,
  onOpenMemorySearch,
  showToast
}) {
  const [activeSidebarNav, setActiveSidebarNav] = useState('inbox');
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'scans' | 'journal' | 'reconciliation'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [selectedDocId, setSelectedDocId] = useState(INITIAL_DOCUMENTS[0].id);
  const [journalLines, setJournalLines] = useState(INITIAL_JOURNAL_LINES);
  const [bankFeed, setBankFeed] = useState(INITIAL_BANK_FEED);
  const [isOmniPortalOpen, setIsOmniPortalOpen] = useState(false);

  const selectedDocument = documents.find(d => d.id === selectedDocId) || documents[0];
  const balanceState = validateDoubleEntry(journalLines);

  const handleSelectDocument = (docId) => {
    setSelectedDocId(docId);
    setActiveSidebarNav('inbox_review');
  };

  const handleCommitToJournal = (docId, newLines) => {
    setJournalLines(prev => [...prev, ...newLines]);
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'verified' } : d));
    setActiveTab('journal');
    setActiveSidebarNav('journal');
    showToast?.('Committed entries to General Journal');
  };

  const handleUploadMockFile = (fileName) => {
    const isReceipt = fileName.toLowerCase().includes('receipt') || fileName.toLowerCase().endsWith('.png');
    const newDoc = {
      id: `doc-upload-${Date.now()}`,
      reference: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      vendor: fileName.replace(/\.[^/.]+$/, ""),
      date: new Date().toISOString().split('T')[0],
      rawFileType: fileName.split('.').pop() || 'pdf',
      status: isReceipt ? 'review' : 'verified',
      items: [
        { id: 'it-1', label: 'Extracted Line Item Service', amount: 450.00, boundingBox: { top: 40, left: 10, width: 80, height: 12 } }
      ],
      tax: { rate: '8.0%', amount: 36.00, jurisdiction: 'Local Tax', boundingBox: { top: 60, left: 10, width: 80, height: 10 } },
      total: 486.00,
      currency: 'USD',
      hash: `sha256-${Math.random().toString(36).substring(2)}`,
      suggestedAccount: '6010',
      settlementAccount: '2000',
      notes: 'Auto-ingested via dropzone upload.'
    };
    setDocuments(prev => [newDoc, ...prev]);
    setSelectedDocId(newDoc.id);
    setActiveSidebarNav('inbox_review');
    showToast?.(`Ingested "${fileName}" into Ledger Inbox`);
  };

  const handleBatchAbsorbed = (absorbedResult) => {
    setIsOmniPortalOpen(false);
    const count = absorbedResult?.packages?.length || 1;
    showToast?.(`Imported ${count} package(s) via Omni-Portal`);
  };

  const handleUpdateJournalLine = (lineId, updates) => {
    setJournalLines(prev => prev.map(l => l.id === lineId ? { ...l, ...updates } : l));
    showToast?.("Updated journal entry");
  };

  const navTabs = [
    { id: 'home', label: 'Ledger Home' },
    { id: 'scans', label: 'Scans' },
    { id: 'journal', label: 'Journal' },
    { id: 'reconciliation', label: 'Reconciliation' },
  ];

  return (
    <div className="flex h-screen w-full bg-[#f5f7fc] dark:bg-[#000000] text-slate-900 dark:text-zinc-100 overflow-hidden font-sans select-none relative">
      
      {/* ── Ambient Radial Gradient Mesh (matching Regaarder Docs) ── */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none opacity-[0.38]">
        <div className="absolute -top-[15%] -left-[15%] w-[70%] h-[70%] rounded-full bg-blue-400/30 dark:bg-blue-900/20 mix-blend-multiply dark:mix-blend-screen filter blur-[110px]" />
        <div className="absolute top-[20%] -right-[15%] w-[60%] h-[60%] rounded-full bg-purple-400/25 dark:bg-purple-900/15 mix-blend-multiply dark:mix-blend-screen filter blur-[110px]" />
        <div className="absolute bottom-[5%] left-[15%] w-[80%] h-[80%] rounded-full bg-pink-400/20 dark:bg-pink-900/10 mix-blend-multiply dark:mix-blend-screen filter blur-[120px]" />
      </div>

      {/* ── Left Edge Proximity Hover Area ── */}
      <div
        onMouseEnter={() => setIsSidebarOpen(true)}
        className="fixed top-0 bottom-0 left-0 w-3 z-[270] cursor-pointer"
        title="Hover to reveal navigation sidebar"
      />

      {/* ── Flyout/Drawer Sidebar on Hover or Toggle ── */}
      <LedgerHoverSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeNav={activeSidebarNav}
        onSelectNav={(navId) => {
          setActiveSidebarNav(navId);
          if (navId === 'inbox') setActiveTab('home');
          else if (navId === 'scans') setActiveTab('scans');
          else if (navId === 'journal') setActiveTab('journal');
          else if (navId === 'reconciliation') setActiveTab('reconciliation');
          else setActiveTab(navId);
        }}
        onBackToHome={onBackToHome}
        onOpenWorkspaceSwitcher={onOpenWorkspaceSwitcher}
        isBalanced={balanceState.isBalanced}
      />

      {/* ── Main Canvas & Chrome ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        
        {/* Tier 1 Header: Unified with Sheets/Docs with Approach-Hover Reveal */}
        <header
          onMouseEnter={() => setIsHeaderHovered(true)}
          onMouseLeave={() => setIsHeaderHovered(false)}
          className="h-12 flex items-center justify-between px-5 border-b border-slate-200/60 dark:border-white/[0.08] bg-white/85 dark:bg-[#111111]/85 backdrop-blur-2xl shrink-0 select-none relative z-30 transition-all duration-200"
        >
          {/* Left Cluster: Sidebar Toggle + App Switcher + Stage Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(prev => !prev)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
              title={isSidebarOpen ? "Hide navigation sidebar" : "Show navigation sidebar"}
            >
              {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>

            {/* App Switcher */}
            {onOpenWorkspaceSwitcher && (
              <button
                type="button"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  onOpenWorkspaceSwitcher(rect);
                }}
                className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
                title="Switch Workspace App"
              >
                <LayoutGrid size={15} />
              </button>
            )}

            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                Ledger
              </span>
              <span className="text-slate-300 dark:text-zinc-700 font-mono">/</span>
              <span className="text-xs font-normal text-slate-500 dark:text-zinc-400">
                {activeSidebarNav === 'inbox_review'
                  ? `Review: ${selectedDocument.reference || selectedDocument.vendor}`
                  : activeSidebarNav === 'accounts'
                  ? 'Chart of Accounts'
                  : activeSidebarNav === 'reports'
                  ? 'Financial Reports'
                  : activeTab === 'home'
                  ? 'Capture & Intake'
                  : activeTab === 'scans'
                  ? 'Scans'
                  : activeTab === 'journal'
                  ? 'Journal'
                  : 'Reconciliation'}
              </span>
            </div>
          </div>

          {/* Right Cluster: Approaching/Hovering reveals peripheral tools, exactly like Sheets/Docs */}
          <div className="flex items-center gap-2.5">
            <div className={`flex items-center gap-2.5 transition-all duration-200 ${
              isHeaderHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}>
              {/* Minimal Invariant Dot + Text */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-400 px-2 py-1">
                <span className={`w-1.5 h-1.5 rounded-full ${balanceState.isBalanced ? "bg-emerald-500" : "bg-red-500"}`} />
                <span className="font-medium text-[11px]">{balanceState.isBalanced ? "Ledger is balanced" : "Ledger unbalanced"}</span>
              </div>

              {/* Omni-Portal Trigger */}
              <button
                type="button"
                onClick={() => setIsOmniPortalOpen(true)}
                className="text-xs font-medium px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition-all duration-150 active:scale-[0.97] border cursor-pointer select-none text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-zinc-800 border-slate-200/80 dark:border-zinc-700/80 bg-white/70 dark:bg-zinc-900/60 shadow-2xs"
                title="Omni-Portal Multi-Source Ingestion"
              >
                <HardDrive size={13} strokeWidth={1.5} className="text-slate-500 dark:text-zinc-400" />
                <span>Omni-Portal</span>
              </button>

              {/* Share Button (Executive Purple #7C3AED) */}
              <button
                type="button"
                onClick={() => showToast?.("Ledger link copied to clipboard")}
                className="bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-xs font-medium px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all duration-150 active:scale-[0.97] cursor-pointer select-none"
                style={{ backgroundColor: '#7c3aed', color: '#ffffff' }}
              >
                <Users size={13} strokeWidth={1.5} />
                <span>Share</span>
              </button>

              {/* Regaarder AI Signature Icon */}
              <button
                type="button"
                onClick={() => showToast?.("Regaarder Accounting Intelligence active")}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center justify-center shadow-2xs hover:scale-105 transition-all cursor-pointer shrink-0"
                title="Ask Regaarder AI Accountant"
              >
                <RegaarderAiIcon size={14} />
              </button>
            </div>
          </div>
        </header>

        {/* Tier 2: Apple Segmented Pill Strip - Ledger Home | Scans | Journal | Reconciliation */}
        <div className="mx-6 mt-3 mb-1 flex items-center shrink-0 z-20">
          <div className="inline-flex items-center p-1 gap-1 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-xl border border-slate-200/70 dark:border-white/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            {navTabs.map((tab) => {
              const isCurrent = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 'home') setActiveSidebarNav('inbox');
                    if (tab.id === 'scans') setActiveSidebarNav('scans');
                    if (tab.id === 'journal') setActiveSidebarNav('journal');
                    if (tab.id === 'reconciliation') setActiveSidebarNav('reconciliation');
                  }}
                  className={`relative px-3.5 py-1.5 text-xs rounded-lg transition-all duration-150 select-none active:scale-[0.98] cursor-pointer ${
                    isCurrent
                      ? "bg-slate-100/90 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-semibold shadow-2xs border border-slate-200/60 dark:border-zinc-700/60"
                      : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-100/50 dark:hover:bg-zinc-800/40 font-medium"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Main Stage Workspace Content with Native Regaarder Overlay Scrollbar ── */}
        <main className="flex-1 overflow-y-auto regaarder-scrollbar px-6 py-4 flex flex-col min-h-0">
          {activeSidebarNav === 'inbox_review' ? (
            <LedgerDocumentReview
              document={selectedDocument}
              onCommitToJournal={handleCommitToJournal}
              onBackToInbox={() => {
                setActiveSidebarNav(activeTab === 'scans' ? 'scans' : 'inbox');
              }}
            />
          ) : activeSidebarNav === 'accounts' ? (
            <LedgerAccountsView
              journalLines={journalLines}
              onSelectAccount={(accCode) => {
                setActiveTab('journal');
                setActiveSidebarNav('journal');
              }}
            />
          ) : activeSidebarNav === 'reports' ? (
            <LedgerReportsView
              journalLines={journalLines}
              onNavigateToScans={() => {
                setActiveTab('scans');
                setActiveSidebarNav('scans');
              }}
            />
          ) : activeTab === 'home' || activeSidebarNav === 'inbox' ? (
            <LedgerInboxView
              documents={documents}
              onSelectDocument={handleSelectDocument}
              onUploadMockFile={handleUploadMockFile}
              onNavigateToScans={() => {
                setActiveTab('scans');
                setActiveSidebarNav('scans');
              }}
            />
          ) : activeTab === 'scans' || activeSidebarNav === 'scans' ? (
            <LedgerScansView
              documents={documents}
              onSelectDocument={handleSelectDocument}
            />
          ) : activeTab === 'journal' || activeSidebarNav === 'journal' ? (
            <LedgerJournalGrid
              journalLines={journalLines}
              onUpdateJournalLine={handleUpdateJournalLine}
              onSelectLineEvidence={handleSelectDocument}
            />
          ) : activeTab === 'reconciliation' || activeSidebarNav === 'reconciliation' ? (
            <LedgerReconciliation
              bankFeed={bankFeed}
              journalLines={journalLines}
              onSelectDoc={handleSelectDocument}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center justify-center mb-3">
                <BookOpen size={24} />
              </div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-zinc-100 capitalize">
                {activeSidebarNav} Module
              </h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-sm mt-1">
                Connected to the deterministic ledger engine.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveSidebarNav('inbox');
                  setActiveTab('home');
                }}
                className="mt-4 px-4 py-1.5 rounded-xl bg-violet-600 text-white text-xs font-medium cursor-pointer shadow-xs hover:bg-violet-700"
              >
                Go to Ledger Home
              </button>
            </div>
          )}
        </main>

      </div>

      {/* ── Omni-Portal Batch Ingestion Modal ── */}
      <OmniPortalModal
        isOpen={isOmniPortalOpen}
        onClose={() => setIsOmniPortalOpen(false)}
        onBatchAbsorbed={handleBatchAbsorbed}
      />

    </div>
  );
}
