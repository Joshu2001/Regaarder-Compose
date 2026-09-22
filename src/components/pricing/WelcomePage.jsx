import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { RegaarderAiIcon } from '../RegaarderProductIcons';

export default function WelcomePage() {
  const returnToWorkspace = () => {
    window.location.href = window.location.origin;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans selection:bg-violet-500/30 selection:text-violet-200">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-violet-600/20 via-indigo-600/10 to-transparent blur-[120px] pointer-events-none rounded-full" />

      <div className="relative z-10 max-w-md w-full bg-slate-900/90 border border-slate-800/80 rounded-2xl p-8 backdrop-blur-xl shadow-2xl text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
          <CheckCircle2 size={32} strokeWidth={2.2} />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-4">
          <RegaarderAiIcon size={12} strokeWidth={2} />
          <span>Membership Active</span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          Welcome to Regaarder Workspace
        </h1>
        <p className="text-sm text-slate-400 mb-8 leading-relaxed">
          Your checkout completed successfully. Your account tier and workspace entitlements have been provisioned and are ready for use.
        </p>

        <button
          onClick={returnToWorkspace}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium text-sm text-white bg-violet-600 hover:bg-violet-500 active:scale-[0.99] transition-all shadow-lg shadow-violet-600/25 cursor-pointer outline-none"
        >
          <span>Open Workspace</span>
          <ArrowRight size={16} strokeWidth={2} />
        </button>
      </div>

      <div className="mt-8 text-xs text-slate-500 flex items-center gap-1.5">
        <RegaarderAiIcon size={13} className="text-slate-500" />
        <span>Regaarder Intelligence Substrate</span>
      </div>
    </div>
  );
}
