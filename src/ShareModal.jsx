import React from 'react';
import { X, Check, EyeOff, Eye, Lock, Clock } from 'lucide-react';

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
  showToast // Added to props to fix reference error bug
}) {
  if (!isOpen) return null;

  // Safe wrapper for toast notifications to avoid crashes if prop is missing
  const triggerToast = (msg) => {
    if (showToast) {
      showToast(msg);
    } else if (window.showToast) {
      window.showToast(msg);
    } else {
      console.log('Toast:', msg);
    }
  };

  return (
    <div className="fixed inset-0 z-[520] bg-slate-950/20 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300">
      <div className="w-[640px] max-w-[95vw] rounded-2xl bg-white border border-slate-200/80 shadow-[0_24px_60px_-15px_rgba(15,23,42,0.12),0_0_1px_rgba(0,0,0,0.08)] p-6 transition-all duration-200">
        
        {/* Header Section */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900 tracking-tight">Share document</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">{shareTargetDocTitle}</p>
          </div>
          <button
            type="button"
            onClick={() => onClose()}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all duration-150 active:scale-95 border border-transparent hover:border-slate-100"
            title="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Share Destination Tabs (Styled as slightly rounded rectangles per Apple design) */}
        <div className="mb-6">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
            Share Method
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {[
              { 
                key: 'friends', 
                label: 'Copy link', 
                sub: 'Share instantly',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 inline">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                )
              },
              { 
                key: 'apps', 
                label: 'Native apps', 
                sub: 'Use system sheet',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 inline">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                )
              },
              { 
                key: 'downloads', 
                label: 'Download', 
                sub: 'Export file',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 inline">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                )
              },
            ].map((destination) => {
              const isSelected = shareDestination === destination.key;
              return (
                <button
                  key={destination.key}
                  type="button"
                  onClick={() => setShareDestination(destination.key)}
                  className={`text-left rounded-xl border px-3.5 py-3 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${
                    isSelected 
                      ? 'border-violet-500 bg-violet-50/30 text-violet-900 ring-1 ring-violet-500/20 font-semibold shadow-sm outline-violet-500' 
                      : 'border-slate-100 bg-slate-50/40 text-slate-700 hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className="text-[13px] font-semibold flex items-center gap-1">
                    {destination.icon}
                    <span>{destination.label}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-medium">{destination.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Access Level Section (Sleek Rounded Rectangles) */}
        <div className="mb-6">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
            Access level
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {[
              {
                level: 'Zero-Knowledge',
                icon: <EyeOff size={13} className="mr-1.5 inline" />
              },
              {
                level: 'Viewer',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 inline">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                )
              },
              {
                level: 'Commenter',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 inline">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                )
              },
              {
                level: 'Editor',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 inline">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                )
              },
              {
                level: 'Full access',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 inline">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                  </svg>
                )
              }
            ].map(({ level, icon }) => {
              const isSelected = shareAccess === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setShareAccess(level)}
                  className={`px-3.5 py-2 rounded-xl text-xs border transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center ${
                    isSelected 
                      ? 'border-violet-500 bg-violet-50/30 text-violet-900 font-semibold ring-1 ring-violet-500/20 outline-violet-500' 
                      : 'border-slate-100 text-slate-650 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  {icon}
                  <span>{level}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Zero-Knowledge Redactions Overlay panel */}
        {shareAccess === 'Zero-Knowledge' && (
          <div className="mb-6 rounded-2xl bg-slate-50/50 border border-slate-100 p-5 text-xs text-slate-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)] transition-all duration-300">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2 font-semibold text-slate-800 text-[13px]">
                <EyeOff size={15} className="text-violet-600 animate-pulse" />
                <span>Protected contents & redactions</span>
              </div>
              <button 
                type="button"
                onClick={() => setZeroKnowledgePreviewOpen(true)} 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-750 text-white font-medium shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 text-xs"
              >
                <Eye size={13} />
                <span>Preview Share</span>
              </button>
            </div>
            
            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed font-medium">
              Collaborators cannot see protected content. Highlight text or blocks in the document to protect them directly, or add custom search keywords below.
            </p>

            {/* Protected Chips List */}
            <div className="flex flex-wrap gap-2 mb-4 max-h-[120px] overflow-y-auto pr-1">
              {zeroKnowledgeRedactions.length === 0 ? (
                <div className="w-full text-center py-4 text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white/70">
                  🔒 No terms or keywords protected yet.
                </div>
              ) : (
                zeroKnowledgeRedactions.map(chip => (
                  <span 
                    key={chip.id} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-50/60 text-violet-800 border border-violet-100/85 text-[11px] font-medium transition-all duration-150 hover:bg-violet-50"
                  >
                    <span className="text-[10px]">🔒</span>
                    <span className="truncate max-w-[150px]" title={chip.fullText}>{chip.text}</span>
                    <button
                      type="button"
                      onClick={() => removeProtection(chip.id)}
                      className="w-4 h-4 rounded-lg flex items-center justify-center hover:bg-violet-100 hover:text-violet-950 transition-colors ml-0.5 text-[9px] font-bold"
                    >
                      ✕
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Add Keyword Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter custom word or phrase to redact..."
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
                className="flex-1 text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500/20 focus:border-violet-400 bg-white transition-all duration-200 shadow-[inset_0_1px_2.5px_rgba(0,0,0,0.015)] placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => {
                  if (newRedactionKeyword.trim()) {
                    protectKeywordInEditor(newRedactionKeyword.trim());
                    setNewRedactionKeyword('');
                  }
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-all duration-200 active:scale-95 text-xs shadow-sm"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Advanced Access Controls Section */}
        <div className="mb-6">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
            Advanced Security & Options
          </label>
          <div className="space-y-3">
            <label className="flex items-center gap-2.5 text-xs font-medium text-slate-650 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sharePasswordProtected}
                onChange={(e) => setSharePasswordProtected(e.target.checked)}
                className="accent-violet-600 rounded-md border-slate-350 cursor-pointer"
              />
              <Lock size={14} className="text-slate-400" />
              <span>Password-protected links</span>
            </label>
            
            {sharePasswordProtected && (
              <div className="pl-6 space-y-2 mt-1.5 transition-all duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="relative">
                    <input
                      type={showSharePassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={sharePassword}
                      onChange={(e) => { setSharePassword(e.target.value); setIsPasswordConfirmed(false); }}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500/20 focus:border-violet-400 bg-white transition-all duration-200 pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSharePassword(!showSharePassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 focus:outline-none"
                    >
                      {showSharePassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showSharePassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={sharePasswordConfirm}
                      onChange={(e) => { setSharePasswordConfirm(e.target.value); setIsPasswordConfirmed(false); }}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500/20 focus:border-violet-400 bg-white transition-all duration-200 pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSharePassword(!showSharePassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 focus:outline-none"
                    >
                      {showSharePassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
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
                    className="px-3.5 py-1.5 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-750 transition-all duration-200 text-xs shadow-sm active:scale-95"
                  >
                    Set Password
                  </button>
                  {isPasswordConfirmed && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100/60 animate-fade-in">
                      <Check size={11} className="stroke-[3]" />
                      Active Outline Setup Complete
                    </span>
                  )}
                </div>
              </div>
            )}
            
            <label className="flex items-center gap-2.5 text-xs font-medium text-slate-650 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={shareExpiringAccess}
                onChange={(e) => setShareExpiringAccess(e.target.checked)}
                className="accent-violet-600 rounded-md border-slate-350 cursor-pointer"
              />
              <Clock size={14} className="text-slate-400" />
              <span>Expiring access</span>
            </label>
            
            {shareExpiringAccess && (
              <div className="pl-6 flex gap-2 mt-1.5 transition-all duration-300">
                <input
                  type="datetime-local"
                  value={shareExpirationDate}
                  onChange={(e) => setShareExpirationDate(e.target.value)}
                  className="w-full md:w-auto text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500/20 focus:border-violet-400 bg-white transition-all duration-200"
                />
                <div className="text-[10px] text-slate-400 font-medium self-center">Access will expire automatically at the specified date.</div>
              </div>
            )}
          </div>
        </div>

        {/* File Format Selection */}
        <div className="mb-6">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
            File format
          </label>
          <div className="flex flex-wrap gap-2">
            {['Compose (.cmp)', 'PDF', 'DOC (Word-compatible)', 'Markdown', 'Plain Text', 'HTML'].map((format) => {
              const isSelected = shareFormat === format;
              return (
                <button
                  key={format}
                  type="button"
                  onClick={() => setShareFormat(format)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs border transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${
                    isSelected 
                      ? 'border-violet-500 bg-violet-50/30 text-violet-900 font-semibold ring-1 ring-violet-500/20 outline-violet-500' 
                      : 'border-slate-100 text-slate-650 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  {format}
                </button>
              );
            })}
          </div>
        </div>

        {/* Share Link Preview (Only shows for 'friends' / copy link) */}
        {shareDestination === 'friends' && (
          <div className="mb-6 rounded-2xl border border-slate-200/50 bg-slate-50/40 p-4 transition-all duration-350 shadow-[inset_0_1px_2px_rgba(0,0,0,0.015)]">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Share link</div>
            <div className="text-xs text-slate-600 break-all font-mono font-medium">{shareLink}</div>
          </div>
        )}

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onClose()}
            className="px-4 py-2 rounded-xl text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all duration-200 active:scale-95"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleShareModalConfirm}
            className="px-4.5 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-750 text-white shadow-sm transition-all duration-200 hover:scale-[1.01] active:scale-95"
          >
            {shareDestination === 'downloads' ? `Export ${shareFormat}` : shareDestination === 'apps' ? 'Share to Apps' : 'Copy Link'}
          </button>
        </div>

      </div>
    </div>
  );
}
