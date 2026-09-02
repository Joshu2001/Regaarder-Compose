import React, { useState } from 'react';
import { 
  Check, 
  EyeOff, 
  Eye, 
  Lock, 
  Clock, 
  Copy, 
  ArrowUpRight, 
  MessageSquare, 
  Download, 
  Share2, 
  ChevronDown, 
  Link2, 
  ShieldCheck,
  Globe
} from 'lucide-react';
import DropdownModalShell from './DropdownModalShell';

/**
 * Apple-style Inset Dropdown Row Control
 */
function AppleSelectRow({ icon: Icon, label, value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((o) => (o.key || o.value) === value) || options[0];

  return (
    <div className="relative flex items-center justify-between py-2 px-2.5 transition-colors">
      <div className="flex items-center gap-2.5 min-w-0">
        {Icon && <Icon size={14} className="text-slate-400 dark:text-zinc-500 shrink-0" />}
        <span className="text-xs font-medium text-slate-700 dark:text-zinc-300 truncate">
          {label}
        </span>
      </div>

      <div className="relative shrink-0">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-800 dark:text-zinc-200 bg-slate-200/60 dark:bg-zinc-700/60 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
        >
          {selected.icon && (
            <span className="text-slate-500 dark:text-zinc-400 shrink-0">
              {selected.icon}
            </span>
          )}
          <span className="truncate max-w-[130px]">{selected.label}</span>
          <ChevronDown size={12} className={`text-slate-400 dark:text-zinc-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-[690]"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen(false);
              }}
            />
            <div className="absolute right-0 top-full mt-1 z-[700] w-48 rounded-xl border border-black/[0.08] dark:border-white/[0.12] ring-1 ring-slate-900/5 dark:ring-black/40 bg-white/95 dark:bg-[#242427]/95 shadow-xl p-1 backdrop-blur-2xl animate-in fade-in zoom-in-[0.98] duration-100 ease-out select-none">
              <div className="space-y-0.5 max-h-[200px] overflow-y-auto thin-scrollbar">
                {options.map((opt) => {
                  const val = opt.key || opt.value;
                  const isSelected = val === value;
                  return (
                    <button
                      key={val}
                      type="button"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onChange(val);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                        isSelected
                          ? 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-semibold'
                          : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {opt.icon && <span className="shrink-0 text-slate-400 dark:text-zinc-500">{opt.icon}</span>}
                        <span className="truncate">{opt.label}</span>
                      </div>
                      {isSelected && <Check size={12} className="text-violet-600 dark:text-violet-400 shrink-0 ml-1.5 stroke-[2.5]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Apple-style Fluid Toggle Switch
 */
function AppleToggleSwitch({ checked, onChange, id }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`w-8 h-[18px] rounded-full p-0.5 transition-colors duration-150 shrink-0 cursor-pointer ${
        checked ? 'bg-violet-600' : 'bg-slate-300 dark:bg-zinc-700'
      }`}
    >
      <div
        className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform duration-150 ease-out ${
          checked ? 'translate-x-3.5' : 'translate-x-0'
        }`}
      />
    </button>
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
  shareExpirationDate,
  setShareExpirationDate,
  showToast,
  t: propT
}) {
  const t = propT || (typeof window !== 'undefined' && window.__rc_t) || ((k) => null);
  const [justCopied, setJustCopied] = useState(false);

  const triggerToast = (msg) => {
    if (showToast) {
      showToast(msg);
    } else if (typeof window !== 'undefined' && window.showToast) {
      window.showToast(msg);
    }
  };

  const handleCopyLinkDirect = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setJustCopied(true);
      triggerToast(t('common.copied') || 'Share link copied to clipboard!');
      setTimeout(() => setJustCopied(false), 2000);
    }
  };

  const shareMethodOptions = [
    { key: 'friends', label: t('share.copyLink') || 'Copy Link', icon: <Link2 size={12} /> },
    { key: 'chat', label: t('share.shareToChat') || 'Chat Channel', icon: <MessageSquare size={12} /> },
    { key: 'apps', label: t('share.nativeApps') || 'Native Apps', icon: <ArrowUpRight size={12} /> },
    { key: 'downloads', label: t('share.download') || 'Download File', icon: <Download size={12} /> }
  ];

  const accessLevelOptions = [
    { value: 'Viewer', label: t('share.viewer') || 'Viewer (Read Only)', icon: <Lock size={12} /> },
    { value: 'Commenter', label: t('share.commenter') || 'Commenter', icon: <MessageSquare size={12} /> },
    { value: 'Editor', label: t('share.editor') || 'Editor (Can Edit)', icon: <Check size={12} /> },
    { value: 'Full access', label: t('share.fullAccess') || 'Full Access', icon: <Share2 size={12} /> },
    { value: 'Zero-Knowledge', label: t('share.zeroKnowledge') || 'Zero-Knowledge', icon: <EyeOff size={12} /> }
  ];

  const formatOptions = [
    { value: 'Compose (.cmp)', label: 'Regaarder (.cmp)' },
    { value: 'PDF', label: 'PDF Document (.pdf)' },
    { value: 'DOC (Word-compatible)', label: 'Word (.docx)' },
    { value: 'Markdown', label: 'Markdown (.md)' },
    { value: 'Plain Text', label: 'Plain Text (.txt)' },
    { value: 'HTML', label: 'Web (.html)' }
  ];

  const modalFooter = (
    <>
      <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
        {shareDestination === 'friends' ? 'Anyone with link can access' : (t('share.readyToShare') || 'Ready to share')}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onClose()}
          className="px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-zinc-700/80 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          {t('common.cancel') || 'Cancel'}
        </button>
        <button
          type="button"
          onClick={handleShareModalConfirm}
          className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-xs transition-all whitespace-nowrap active:scale-[0.98] cursor-pointer"
        >
          {shareDestination === 'downloads'
            ? `${t('common.export') || 'Export'} ${shareFormat}`
            : shareDestination === 'apps'
            ? (t('share.shareToApps') || 'Share to Apps')
            : shareDestination === 'chat'
            ? (t('share.attachToChat') || 'Attach to Chat')
            : (t('share.copyLink') || 'Copy Link')}
        </button>
      </div>
    </>
  );

  return (
    <DropdownModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={t('share.title') || "Share Document"}
      subtitle={shareTargetDocTitle || (t('common.untitledDoc') || 'Untitled document')}
      icon={Share2}
      width="w-[380px]"
      topOffset="top-12"
      rightOffset="right-4"
      zIndexBackdrop="z-[510]"
      zIndexModal="z-[520]"
      allowOverflowVisible={true}
      footer={modalFooter}
    >
      {/* Grouped Inset Card: General Permissions & Destination */}
      <div className="rounded-xl bg-slate-50/80 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60 divide-y divide-slate-200/50 dark:divide-zinc-700/50 overflow-visible">
        <AppleSelectRow
          icon={Globe}
          label={t('share.shareMethod') || "Share Via"}
          value={shareDestination}
          options={shareMethodOptions}
          onChange={setShareDestination}
        />
        <AppleSelectRow
          icon={Lock}
          label={t('share.accessLevel') || "Permissions"}
          value={shareAccess}
          options={accessLevelOptions}
          onChange={setShareAccess}
        />
        <AppleSelectRow
          icon={Download}
          label={t('share.fileFormat') || "Format"}
          value={shareFormat}
          options={formatOptions}
          onChange={setShareFormat}
        />
      </div>

      {/* Share Link Pill (Active when 'friends' / copy link is chosen) */}
      {shareDestination === 'friends' && (
        <div className="rounded-xl border border-slate-200/70 dark:border-zinc-700/60 bg-slate-50/90 dark:bg-zinc-800/70 p-1.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 pl-2">
            <Link2 size={13} className="text-violet-600 dark:text-violet-400 shrink-0" />
            <span className="text-[11px] font-mono text-slate-600 dark:text-zinc-300 truncate select-all">
              {shareLink || 'Generating link...'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyLinkDirect}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              justCopied
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-600 border border-slate-200/80 dark:border-zinc-600 shadow-2xs'
            }`}
          >
            {justCopied ? (
              <>
                <Check size={11} className="stroke-[3]" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={11} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Zero-Knowledge Redactions Card (when Zero-Knowledge is chosen) */}
      {shareAccess === 'Zero-Knowledge' && (
        <div className="rounded-xl bg-slate-50/80 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60 p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-zinc-200 text-xs">
              <EyeOff size={13} className="text-violet-600 dark:text-violet-400" />
              <span>Protected Content</span>
            </div>
            <button
              type="button"
              onClick={() => setZeroKnowledgePreviewOpen(true)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 text-slate-800 dark:text-zinc-100 font-medium text-[10px] transition-colors cursor-pointer"
            >
              <Eye size={10} />
              <span>Preview</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1 max-h-[72px] overflow-y-auto thin-scrollbar">
            {zeroKnowledgeRedactions.length === 0 ? (
              <div className="w-full text-center py-1.5 text-[10.5px] text-slate-400 dark:text-zinc-500 border border-dashed border-slate-200 dark:border-zinc-700 rounded-lg">
                No words redacted yet
              </div>
            ) : (
              zeroKnowledgeRedactions.map((chip) => (
                <span
                  key={chip.id}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-[10.5px] font-medium"
                >
                  <span className="truncate max-w-[90px]">{chip.text}</span>
                  <button
                    type="button"
                    onClick={() => removeProtection(chip.id)}
                    className="hover:text-rose-500 cursor-pointer ml-0.5 text-[9px] font-bold"
                  >
                    ✕
                  </button>
                </span>
              ))
            )}
          </div>

          <div className="flex gap-1.5">
            <input
              type="text"
              placeholder="Word to redact..."
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
              className="flex-1 text-xs px-2.5 py-1 border border-slate-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-violet-500 placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={() => {
                if (newRedactionKeyword.trim()) {
                  protectKeywordInEditor(newRedactionKeyword.trim());
                  setNewRedactionKeyword('');
                }
              }}
              className="px-2.5 py-1 bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 font-semibold rounded-lg text-xs hover:bg-slate-800 dark:hover:bg-white transition-colors cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Grouped Inset Card: Security & Expiration (Apple Settings Style) */}
      <div className="rounded-xl bg-slate-50/80 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60 divide-y divide-slate-200/50 dark:divide-zinc-700/50">
        {/* Row 1: Password Protection */}
        <div className="p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-slate-400 dark:text-zinc-500" />
              <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                Password Protection
              </span>
            </div>
            <AppleToggleSwitch
              checked={sharePasswordProtected}
              onChange={setSharePasswordProtected}
            />
          </div>

          {sharePasswordProtected && (
            <div className="pt-1.5 space-y-1.5 animate-in fade-in duration-100">
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
                    className="w-full text-xs px-2.5 py-1 border border-slate-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 pr-6 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSharePassword(!showSharePassword)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
                  >
                    {showSharePassword ? <EyeOff size={11} /> : <Eye size={11} />}
                  </button>
                </div>
                <input
                  type={showSharePassword ? 'text' : 'password'}
                  placeholder="Confirm"
                  value={sharePasswordConfirm}
                  onChange={(e) => {
                    setSharePasswordConfirm(e.target.value);
                    setIsPasswordConfirmed(false);
                  }}
                  className="w-full text-xs px-2.5 py-1 border border-slate-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    if (sharePassword && sharePassword === sharePasswordConfirm) {
                      setIsPasswordConfirmed(true);
                      triggerToast('Password confirmed successfully!');
                    } else {
                      triggerToast('Passwords do not match or are empty.');
                    }
                  }}
                  className="px-2.5 py-0.5 rounded-md bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 font-medium text-[10.5px] hover:bg-slate-800 dark:hover:bg-white transition-colors cursor-pointer"
                >
                  Save Password
                </button>
                {isPasswordConfirmed && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <Check size={11} className="stroke-[3]" />
                    Password Active
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Row 2: Expiring Access */}
        <div className="p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-slate-400 dark:text-zinc-500" />
              <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                Expiring Access
              </span>
            </div>
            <AppleToggleSwitch
              checked={shareExpiringAccess}
              onChange={setShareExpiringAccess}
            />
          </div>

          {shareExpiringAccess && (
            <div className="pt-1 animate-in fade-in duration-100">
              <input
                type="datetime-local"
                value={shareExpirationDate}
                onChange={(e) => setShareExpirationDate(e.target.value)}
                className="w-full text-xs px-2.5 py-1 border border-slate-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          )}
        </div>
      </div>
    </DropdownModalShell>
  );
}
