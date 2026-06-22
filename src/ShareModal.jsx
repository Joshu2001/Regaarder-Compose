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
  setShareExpirationDate
}) {
  if (!isOpen) return null;

  return (
        <div className="fixed inset-0 z-[520] bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-[640px] max-w-[95vw] rounded-2xl bg-white border border-slate-200 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.65)] p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Share from Compose</h3>
                <p className="text-xs text-slate-500 mt-1">{shareTargetDocTitle}</p>
              </div>
              <button
                type="button"
                onClick={() => onClose()}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-5">
              {[
                { 
                  key: 'friends', 
                  label: 'Copy link', 
                  sub: 'Share instantly',
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 inline">
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 inline">
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 inline">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                  )
                },
              ].map((destination) => (
                <button
                  key={destination.key}
                  type="button"
                  onClick={() => setShareDestination(destination.key)}
                  className={`text-left rounded-xl border px-3 py-2.5 transition-colors ${shareDestination === destination.key ? 'border-violet-300 bg-violet-50/70 text-violet-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                  <div className="text-sm font-semibold flex items-center gap-1">
                    {destination.icon}
                    <span>{destination.label}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">{destination.sub}</div>
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block mb-2">Access level</label>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  {
                    level: 'Zero-Knowledge',
                    icon: (
                      <EyeOff size={12} className="mr-1 inline" />
                    )
                  },
                  {
                    level: 'Viewer',
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 inline">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    )
                  },
                  {
                    level: 'Commenter',
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 inline">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                    )
                  },
                  {
                    level: 'Editor',
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 inline">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                      </svg>
                    )
                  },
                  {
                    level: 'Full access',
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 inline">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                      </svg>
                    )
                  }
                ].map(({ level, icon }) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setShareAccess(level)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors flex items-center ${shareAccess === level ? 'bg-violet-50 border-violet-300 text-violet-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {icon}
                    <span>{level}</span>
                  </button>
                ))}
              </div>
            </div>

            {shareAccess === 'Zero-Knowledge' && (
              <div className="mb-4 rounded-2xl bg-slate-50 border border-slate-100 p-4 text-xs text-slate-700 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                    <EyeOff size={16} className="text-violet-600" />
                    <span>Protected content</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setZeroKnowledgePreviewOpen(true)} 
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-sm transition-all hover:scale-[1.02]"
                  >
                    <Eye size={13} />
                    <span>Preview Shared Version</span>
                  </button>
                </div>
                
                <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                  Collaborators cannot see protected content. Highlight text or blocks in the document to protect them directly, or add keywords below.
                </p>

                {/* Protected Chips List */}
                <div className="flex flex-wrap gap-1.5 mb-3 max-h-[120px] overflow-y-auto pr-1">
                  {zeroKnowledgeRedactions.length === 0 ? (
                    <div className="w-full text-center py-3 text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white">
                      No items protected yet.
                    </div>
                  ) : (
                    zeroKnowledgeRedactions.map(chip => (
                      <span 
                        key={chip.id} 
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-100 text-[11px] font-medium"
                      >
                        <span>🔒</span>
                        <span className="truncate max-w-[150px]" title={chip.fullText}>{chip.text}</span>
                        <button
                          type="button"
                          onClick={() => removeProtection(chip.id)}
                          className="w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-violet-200 hover:text-violet-900 transition-colors ml-0.5 text-[10px]"
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
                    placeholder="Enter keyword or phrase to redact..."
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
                    className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-violet-400 bg-white shadow-inner placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newRedactionKeyword.trim()) {
                        protectKeywordInEditor(newRedactionKeyword.trim());
                        setNewRedactionKeyword('');
                      }
                    }}
                    className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block mb-2">Advanced sharing controls</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sharePasswordProtected}
                    onChange={(e) => setSharePasswordProtected(e.target.checked)}
                    className="accent-violet-600 rounded border-slate-300"
                  />
                  <Lock size={14} className="text-slate-400" />
                  <span>Password-protected links</span>
                </label>
                {sharePasswordProtected && (
                  <div className="pl-6 space-y-2 mt-1 relative">
                    <div className="relative">
                      <input
                        type={showSharePassword ? "text" : "password"}
                        placeholder="Enter password"
                        value={sharePassword}
                        onChange={(e) => { setSharePassword(e.target.value); setIsPasswordConfirmed(false); }}
                        className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-violet-400 pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSharePassword(!showSharePassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showSharePassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showSharePassword ? "text" : "password"}
                        placeholder="Confirm password"
                        value={sharePasswordConfirm}
                        onChange={(e) => { setSharePasswordConfirm(e.target.value); setIsPasswordConfirmed(false); }}
                        className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-violet-400 pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSharePassword(!showSharePassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showSharePassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          if (sharePassword && sharePassword === sharePasswordConfirm) {
                            setIsPasswordConfirmed(true);
                            showToast('Password successfully set!');
                          } else {
                            showToast('Passwords do not match or are empty.');
                          }
                        }}
                        className="px-3 py-1.5 rounded-md bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors"
                      >
                        Set Password
                      </button>
                      {isPasswordConfirmed && <Check size={14} className="text-green-500" />}
                    </div>
                  </div>
                )}
                
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer mt-2">
                  <input
                    type="checkbox"
                    checked={shareExpiringAccess}
                    onChange={(e) => setShareExpiringAccess(e.target.checked)}
                    className="accent-violet-600 rounded border-slate-300"
                  />
                  <Clock size={14} className="text-slate-400" />
                  <span>Expiring access</span>
                </label>
                {shareExpiringAccess && (
                  <div className="pl-6 flex gap-2 mt-1 flex-col">
                    <input
                      type="datetime-local"
                      value={shareExpirationDate}
                      onChange={(e) => setShareExpirationDate(e.target.value)}
                      className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-violet-400"
                    />
                    <div className="text-[10px] text-slate-500">Access will be revoked after this date and time.</div>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block mb-2">File format</label>
              <div className="flex flex-wrap gap-2">
                {['Compose (.cmp)', 'PDF', 'DOC (Word-compatible)', 'Markdown', 'Plain Text', 'HTML'].map((format) => (
                  <button
                    key={format}
                    type="button"
                    onClick={() => setShareFormat(format)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs border transition-colors ${shareFormat === format ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>

            {shareDestination === 'friends' && (
              <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Share link</div>
                <div className="text-xs text-slate-600 break-all">{shareLink}</div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => onClose()}
                className="px-3 py-2 rounded-lg text-xs border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleShareModalConfirm}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700"
              >
                {shareDestination === 'downloads' ? `Export ${shareFormat}` : shareDestination === 'apps' ? 'Share to Apps' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>
  );
}
