import React, { useState } from 'react';
import { Check, EyeOff, Eye, Lock, Clock, Copy, ArrowUpRight, MessageSquare, Download, Share2, ChevronDown } from 'lucide-react';
import DropdownModalShell from './DropdownModalShell';

function CustomSelect({ label, value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((o) => o.key === value || o.value === value) || options[0];

  return (
    <div className="relative">
      {label && (
        <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Field */}
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        }}
        className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200/90 dark:border-zinc-700/80 bg-slate-50/70 dark:bg-zinc-800/70 hover:bg-slate-100/90 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-100 text-xs transition-all duration-150 text-left font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-slate-400/20"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {selected.icon && (
            <span className="text-slate-500 dark:text-zinc-400 shrink-0 text-[13px]">
              {selected.icon}
            </span>
          )}
          <span className="font-semibold text-slate-900 dark:text-zinc-100 truncate text-xs">
            {selected.label}
          </span>
        </div>
        <ChevronDown
          size={13}
          className={`text-slate-400 dark:text-zinc-400 transition-transform duration-150 shrink-0 ml-1 ${
            isOpen ? 'rotate-180 text-slate-800 dark:text-zinc-200' : ''
          }`}
        />
      </button>

      {/* Apple-style Floating Context Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[590]"
            onPointerDown={(e) => {
              e.preventDefault();
              setIsOpen(false);
            }}
          />
          <div className="absolute top-full left-0 right-0 mt-1.5 z-[600] rounded-2xl border border-slate-200 dark:border-zinc-700/90 bg-white/98 dark:bg-[#242427]/98 shadow-[0_20px_48px_-8px_rgba(0,0,0,0.22)] dark:shadow-[0_20px_48px_-8px_rgba(0,0,0,0.6)] p-1.5 backdrop-blur-xl animate-in fade-in slide-in-from-top-1 zoom-in-98 duration-150">
            <div className="space-y-1 max-h-[220px] overflow-y-auto thin-scrollbar">
              {options.map((opt) => {
                const val = opt.key || opt.value;
                const isSelected = val === value;
                return (
                  <button
                    key={val}
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      onChange(val);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[40px] rounded-xl text-xs transition-all duration-150 text-left ${
                      isSelected
                        ? 'bg-slate-100 dark:bg-zinc-700/70 text-slate-900 dark:text-zinc-100 font-semibold'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`shrink-0 w-4 flex justify-center text-[13px] ${
                          isSelected ? 'text-slate-900 dark:text-zinc-100' : 'text-slate-400 dark:text-zinc-500'
                        }`}
                      >
                        {opt.icon}
                      </span>
                      <span className="truncate">{opt.label}</span>
                    </div>
                    {isSelected && (
                      <Check size={13} className="text-slate-900 dark:text-zinc-100 shrink-0 ml-2 stroke-[2.5]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ShareModal({
  isOpen,
  onClose,
  shareTargetDocTitle,
  shareDestination,
  setShareDestination,
  shareAccess,
  setShareAccess,
  shareFormat,
  setShareFormat,
  shareLink,
  handleShareModalConfirm,
  zeroKnowledgeRedactions = [],
  removeProtection,
  newRedactionKeyword,
  setNewRedactionKeyword,
  protectKeywordInEditor,
  setZeroKnowledgePreviewOpen,
  sharePasswordProtected,
  setSharePasswordProtected,
  sharePassword,
  setSharePassword,
  sharePasswordConfirm,
  setSharePasswordConfirm,
  showSharePassword,
  setShowSharePassword,
  isPasswordConfirmed,
  setIsPasswordConfirmed,
  shareExpiringAccess,
  setShareExpiringAccess,
  shareExpirationValue,
  setShareExpirationValue,
  shareExpirationUnit,
  setShareExpirationUnit,
  shareExpirationDate,
  setShareExpirationDate,
  showToast
}) {
  const triggerToast = (msg) => {
    if (showToast) {
      showToast(msg);
    } else if (window.showToast) {
      window.showToast(msg);
    } else {
      console.log('Toast:', msg);
    }
  };

  const handleCopyLinkDirect = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      triggerToast('Share link copied to clipboard!');
    }
  };

  const shareMethodOptions = [
    { key: 'friends', label: 'Copy link', icon: <Copy size={13} /> },
    { key: 'chat', label: 'Share to chat', icon: <MessageSquare size={13} /> },
    { key: 'apps', label: 'Native apps', icon: <ArrowUpRight size={13} /> },
    { key: 'downloads', label: 'Download', icon: <Download size={13} /> }
  ];

  const accessLevelOptions = [
    { value: 'Zero-Knowledge', label: 'Zero-Knowledge', icon: <EyeOff size={13} /> },
    { value: 'Viewer', label: 'Viewer', icon: <Lock size={13} /> },
    { value: 'Commenter', label: 'Commenter', icon: <MessageSquare size={13} /> },
    { value: 'Editor', label: 'Editor', icon: <Check size={13} /> },
    { value: 'Full access', label: 'Full access', icon: <Share2 size={13} /> }
  ];

  const formatOptions = [
    { value: 'Compose (.cmp)', label: 'Compose (.cmp)' },
    { value: 'PDF', label: 'PDF (.pdf)' },
    { value: 'DOC (Word-compatible)', label: 'DOC (.docx)' },
    { value: 'Markdown', label: 'Markdown (.md)' },
    { value: 'Plain Text', label: 'Plain Text (.txt)' },
    { value: 'HTML', label: 'HTML (.html)' }
  ];

  const modalFooter = (
    <>
      <span className="text-[10.5px] text-slate-400 dark:text-zinc-500 font-medium">
        Ready to share
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onClose()}
          className="px-3.5 py-1.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleShareModalConfirm}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-sm transition-all whitespace-nowrap min-w-[90px] active:scale-98"
        >
          {shareDestination === 'downloads'
            ? `Export ${shareFormat}`
            : shareDestination === 'apps'
            ? 'Share to Apps'
            : shareDestination === 'chat'
            ? 'Attach to Chat'
            : 'Copy Link'}
        </button>
      </div>
    </>
  );

  return (
    <DropdownModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Share document"
      subtitle={shareTargetDocTitle || 'Untitled document'}
      icon={Share2}
      width="w-[390px]"
      topOffset="top-12"
      rightOffset="right-4"
      zIndexBackdrop="z-[510]"
      zIndexModal="z-[520]"
      allowOverflowVisible={true}
      footer={modalFooter}
    >
      {/* Share Method Select */}
      <CustomSelect
        label="Share Method"
        value={shareDestination}
        onChange={setShareDestination}
        options={shareMethodOptions}
      />

      {/* Access Level Select */}
      <CustomSelect
        label="Access Level"
        value={shareAccess}
        onChange={setShareAccess}
        options={accessLevelOptions}
      />

      {/* Zero-Knowledge Redactions Panel */}
      {shareAccess === 'Zero-Knowledge' && (
        <div className="rounded-xl bg-slate-50/80 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 p-3 text-xs text-slate-700 dark:text-zinc-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-zinc-200 text-[11.5px]">
              <EyeOff size={13} className="text-slate-700 dark:text-zinc-300 animate-pulse" />
              <span>Protected contents</span>
            </div>
            <button
              type="button"
              onClick={() => setZeroKnowledgePreviewOpen(true)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 dark:bg-zinc-200 hover:bg-slate-900 text-white dark:text-slate-900 font-medium shadow-2xs transition-all text-[10.5px]"
            >
              <Eye size={11} />
              <span>Preview</span>
            </button>
          </div>

          {/* Protected Chips List */}
          <div className="flex flex-wrap gap-1 mb-2 max-h-[80px] overflow-y-auto thin-scrollbar">
            {zeroKnowledgeRedactions.length === 0 ? (
              <div className="w-full text-center py-2 text-[10px] text-slate-400 dark:text-zinc-500 border border-dashed border-slate-200 dark:border-zinc-800 rounded-lg bg-white/50 dark:bg-zinc-900/50">
                🔒 No terms protected yet.
              </div>
            ) : (
              zeroKnowledgeRedactions.map((chip) => (
                <span
                  key={chip.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-200/60 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-300/50 dark:border-zinc-700 text-[10px] font-medium"
                >
                  <span>🔒</span>
                  <span className="truncate max-w-[100px]" title={chip.fullText}>
                    {chip.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeProtection(chip.id)}
                    className="w-3 h-3 rounded flex items-center justify-center hover:bg-slate-300 dark:hover:bg-zinc-700 ml-0.5 text-[8px] font-bold"
                  >
                    ✕
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Add Keyword Input */}
          <div className="flex gap-1.5">
            <input
              type="text"
              placeholder="Custom word to redact..."
              value={newRedactionKeyword}
              onChange={(e) => setNewRedactionKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (newRedactionKeyword.trim()) {
                    protectKeywordInEditor(newRedactionKeyword.trim());
                    setNewRedactionKeyword('');
                  }
                }
              }}
              className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400/20 focus:border-slate-400 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={() => {
                if (newRedactionKeyword.trim()) {
                  protectKeywordInEditor(newRedactionKeyword.trim());
                  setNewRedactionKeyword('');
                }
              }}
              className="px-3 py-1.5 bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white font-medium rounded-lg text-xs transition-all shrink-0"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Advanced Security */}
      <div>
        <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">
          Advanced Security
        </label>
        <div className="rounded-xl bg-slate-50/70 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/60 p-3 space-y-2.5">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-zinc-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={sharePasswordProtected}
              onChange={(e) => setSharePasswordProtected(e.target.checked)}
              className="accent-slate-900 dark:accent-zinc-100 rounded border-slate-300 dark:border-zinc-700 cursor-pointer"
            />
            <Lock size={13} className="text-slate-400 dark:text-zinc-500" />
            <span>Password protection</span>
          </label>

          {sharePasswordProtected && (
            <div className="pl-5 space-y-2 pt-0.5">
              <div className="grid grid-cols-2 gap-1.5">
                <div className="relative">
                  <input
                    type={showSharePassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={sharePassword}
                    onChange={(e) => {
                      setSharePassword(e.target.value);
                      setIsPasswordConfirmed(false);
                    }}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400/20 focus:border-slate-400 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 pr-6"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSharePassword(!showSharePassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
                  >
                    {showSharePassword ? <EyeOff size={11} /> : <Eye size={11} />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showSharePassword ? 'text' : 'password'}
                    placeholder="Confirm"
                    value={sharePasswordConfirm}
                    onChange={(e) => {
                      setSharePasswordConfirm(e.target.value);
                      setIsPasswordConfirmed(false);
                    }}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400/20 focus:border-slate-400 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (sharePassword && sharePassword === sharePasswordConfirm) {
                      setIsPasswordConfirmed(true);
                      triggerToast('Password successfully set!');
                    } else {
                      triggerToast('Passwords do not match or are empty.');
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 font-medium hover:bg-slate-800 transition-all text-[11px] shadow-2xs"
                >
                  Set Password
                </button>
                {isPasswordConfirmed && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
                    <Check size={10} className="stroke-[3]" />
                    Active Outline
                  </span>
                )}
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-zinc-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={shareExpiringAccess}
              onChange={(e) => setShareExpiringAccess(e.target.checked)}
              className="accent-slate-900 dark:accent-zinc-100 rounded border-slate-300 dark:border-zinc-700 cursor-pointer"
            />
            <Clock size={13} className="text-slate-400 dark:text-zinc-500" />
            <span>Expiring access</span>
          </label>

          {shareExpiringAccess && (
            <div className="pl-5 pt-0.5">
              <input
                type="datetime-local"
                value={shareExpirationDate}
                onChange={(e) => setShareExpirationDate(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400/20 focus:border-slate-400 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100"
              />
            </div>
          )}
        </div>
      </div>

      {/* File Format Select */}
      <CustomSelect
        label="File Format"
        value={shareFormat}
        onChange={setShareFormat}
        options={formatOptions}
      />

      {/* Share Link Preview (Only shows for 'friends' / copy link) */}
      {shareDestination === 'friends' && (
        <div className="rounded-xl border border-slate-200/80 dark:border-zinc-700/80 bg-slate-50/70 dark:bg-zinc-800/50 p-2.5 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="text-[9.5px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">
              Share link
            </div>
            <div className="text-[10.5px] text-slate-700 dark:text-zinc-300 truncate font-mono">
              {shareLink}
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyLinkDirect}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-600 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-600 text-[10.5px] font-medium transition-colors shrink-0 flex items-center gap-1 shadow-2xs"
          >
            <Copy size={11} />
            <span>Copy</span>
          </button>
        </div>
      )}
    </DropdownModalShell>
  );
}
