import React, { useState } from 'react';
import { X, Check, ArrowRight, ShieldCheck, Zap, Sparkles, Building2, ChevronRight } from 'lucide-react';
import { useEntitlements } from '../../context/EntitlementContext';
import { PLANS, PLAN_IDS } from '../../services/entitlements';
import { RegaarderAiIcon } from '../RegaarderProductIcons';

export const RegaarderPaywallModal = ({ isOpen, onClose, defaultPlan = PLAN_IDS.PRO_ANNUAL }) => {
  const { currentPlan, changePlan } = useEntitlements();
  
  // Customer-facing navigation selector: 'annual', 'monthly', 'founder', 'team'
  const [selectedCycle, setSelectedCycle] = useState('annual');
  // Plan candidate for founder selection (3-Year vs Lifetime)
  const [selectedFounderTier, setSelectedFounderTier] = useState(PLAN_IDS.PRO_THREE_YEAR);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSelectCycle = (cycle) => {
    setSelectedCycle(cycle);
  };

  const getEffectiveTargetPlanId = () => {
    if (selectedCycle === 'annual') return PLAN_IDS.PRO_ANNUAL;
    if (selectedCycle === 'monthly') return PLAN_IDS.PRO_MONTHLY;
    if (selectedCycle === 'founder') return selectedFounderTier;
    if (selectedCycle === 'team') return PLAN_IDS.TEAM;
    return PLAN_IDS.PRO_ANNUAL;
  };

  const currentTargetPlanId = getEffectiveTargetPlanId();

  const handleUpgrade = (planId) => {
    setIsProcessing(true);
    setTimeout(() => {
      changePlan(planId);
      setIsProcessing(false);
      setSuccessMessage('Successfully switched to ' + (PLANS[planId]?.name || 'new plan') + '!');
      setTimeout(() => {
        setSuccessMessage('');
        onClose?.();
      }, 1200);
    }, 450);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 select-none animate-in fade-in duration-200"
    >
      {/* Frosted backdrop scrim - very light blur + dimming preserving clear workspace recognition */}
      <div
        className="absolute inset-0 bg-slate-900/25 dark:bg-black/50 backdrop-blur-[2.5px] transition-opacity"
        onClick={onClose}
      />

      {/* Main Apple-Grade Modal Container with restrained Regaarder purple/indigo atmosphere */}
      <div
        className="relative w-full max-w-[920px] bg-gradient-to-b from-[#fbfaff] via-[#fdfdff] to-[#f8f7fc] dark:from-[#171622] dark:via-[#14141d] dark:to-[#111116] border border-violet-100/70 dark:border-violet-900/30 rounded-2xl shadow-[0_20px_60px_-15px_rgba(79,70,229,0.12)] overflow-hidden flex flex-col z-10 transition-all font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient atmospheric lighting - soft subtle Regaarder indigo/violet glow in upper region */}
        <div 
          className="absolute -top-24 right-10 w-[460px] h-[220px] bg-gradient-to-br from-violet-500/12 via-indigo-500/8 to-transparent rounded-full blur-3xl pointer-events-none" 
          aria-hidden="true" 
        />
        <div 
          className="absolute top-1/2 -left-20 w-[300px] h-[200px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" 
          aria-hidden="true" 
        />

        {/* Header Ribbon & Close - restored generous executive breathing room */}
        <div className="relative pt-6 pb-4 px-8 border-b border-violet-100/60 dark:border-white/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-xs">
              <RegaarderAiIcon size={18} strokeWidth={2.0} />
            </div>
            <div>
              <h2 className="text-[16.5px] font-semibold text-slate-900 dark:text-zinc-100 tracking-tight leading-snug">
                Turn your workspace into an intelligent work partner
              </h2>
              <p className="text-[12px] text-slate-500 dark:text-zinc-400 mt-0.5">
                Core document creation is unlimited forever. Upgrade anytime to unlock deeper reasoning across your workspace.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer outline-none focus:outline-none"
            aria-label="Close paywall"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Cycle Switcher - Cleaned up without badge clutter */}
        <div className="px-8 pt-4.5 pb-2 flex items-center justify-between flex-wrap gap-2.5">
          <div className="inline-flex p-0.5 rounded-lg border border-slate-200/80 dark:border-white/10 bg-slate-100/70 dark:bg-zinc-900/70 shadow-2xs">
            <button
              type="button"
              onClick={() => handleSelectCycle('annual')}
              className={`px-3 py-1.2 rounded-md text-[11.5px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCycle === 'annual'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white border border-slate-200/90 dark:border-white/15 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <span>Annual</span>
              <span className="text-[9.5px] px-1.5 py-0.2 rounded font-semibold bg-violet-100/90 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300">
                33% off
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectCycle('monthly')}
              className={`px-3 py-1.2 rounded-md text-[11.5px] font-semibold transition-all cursor-pointer ${
                selectedCycle === 'monthly'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white border border-slate-200/90 dark:border-white/15 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              Monthly
            </button>

            <button
              type="button"
              onClick={() => handleSelectCycle('founder')}
              className={`px-3 py-1.2 rounded-md text-[11.5px] font-semibold transition-all cursor-pointer ${
                selectedCycle === 'founder'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white border border-slate-200/90 dark:border-white/15 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              Founder
            </button>

            <button
              type="button"
              onClick={() => handleSelectCycle('team')}
              className={`px-3 py-1.2 rounded-md text-[11.5px] font-semibold transition-all cursor-pointer ${
                selectedCycle === 'team'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white border border-slate-200/90 dark:border-white/15 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              Team & Org
            </button>
          </div>

          <div className="text-[11.5px] text-slate-500 dark:text-zinc-400">
            Current Plan:{' '}
            <span className="font-semibold text-slate-800 dark:text-zinc-200">
              {PLANS[currentPlan]?.name || 'Free'}
            </span>
          </div>
        </div>

        {/* Cards Stage: Comparative side-by-side layout with balanced padding */}
        <div className="px-8 pt-3 pb-5 grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
          {/* Left Card: Free Plan - visually quieter, calm & dignified */}
          <div className="flex flex-col justify-between p-5 rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-white/50 dark:bg-zinc-900/25">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Everyday Productivity
                </span>
              </div>

              <h3 className="text-[18px] font-bold text-slate-800 dark:text-zinc-200">
                Free
              </h3>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-bold tracking-tight text-slate-800 dark:text-zinc-200">
                  $0
                </span>
                <span className="text-xs text-slate-400 dark:text-zinc-500">
                  forever
                </span>
              </div>
              <p className="text-[11.5px] leading-relaxed text-slate-500 dark:text-zinc-400 mt-1">
                Unlimited docs, sheets, decks, and whiteboards with zero feature walls.
              </p>

              <div className="my-3 border-t border-slate-200/50 dark:border-white/[0.05]" />

              <ul className="space-y-2 text-[11.5px] text-slate-500 dark:text-zinc-400">
                <li className="flex items-start gap-2">
                  <Check size={13.5} className="text-slate-400 dark:text-zinc-500 shrink-0 mt-0.5" />
                  <span>Unlimited Docs, Sheets, Deck & Whiteboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={13.5} className="text-slate-400 dark:text-zinc-500 shrink-0 mt-0.5" />
                  <span>Unlimited local documents & storage</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={13.5} className="text-slate-400 dark:text-zinc-500 shrink-0 mt-0.5" />
                  <span>Tasks, schedule, and workspace search</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={13.5} className="text-slate-400 dark:text-zinc-500 shrink-0 mt-0.5" />
                  <span>25 AI responses / day for quick writing</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={13.5} className="text-slate-400 dark:text-zinc-500 shrink-0 mt-0.5" />
                  <span>5 deep Orb reasoning sessions / day</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              disabled={currentPlan === PLAN_IDS.FREE}
              onClick={() => handleUpgrade(PLAN_IDS.FREE)}
              className={`mt-4 w-full py-2 px-3.5 rounded-lg text-[11.5px] font-medium transition-all border outline-none ${
                currentPlan === PLAN_IDS.FREE
                  ? 'border-slate-200/60 dark:border-white/10 text-slate-400 dark:text-zinc-600 cursor-default bg-transparent'
                  : 'border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer'
              }`}
            >
              {currentPlan === PLAN_IDS.FREE ? 'Current Plan' : 'Downgrade to Free'}
            </button>
          </div>

          {/* Right Card: Dynamic Premium Option - refined purple tint, elevation & prominent presence */}
          <div className="relative flex flex-col justify-between p-5 rounded-xl border-2 border-slate-900/90 dark:border-violet-400/80 bg-gradient-to-b from-white via-[#fcfbff] to-[#f7f5fd] dark:from-[#1b1926] dark:via-[#171622] dark:to-[#13121d] shadow-[0_8px_24px_-4px_rgba(124,58,237,0.12)] dark:shadow-[0_8px_24px_-4px_rgba(139,92,246,0.16)] overflow-hidden">
            {/* Soft inner glow on Pro card */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-violet-500/10 dark:bg-violet-400/10 rounded-full blur-2xl pointer-events-none" aria-hidden="true" />

            {/* Top Badge - only Recommended for annual */}
            <div className="relative flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                <RegaarderAiIcon size={13.5} strokeWidth={2.0} />
                <span>Intelligent Workspace</span>
              </div>
              {selectedCycle === 'annual' && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-600 text-white dark:bg-emerald-500 shadow-2xs">
                  Recommended
                </span>
              )}
            </div>

            {/* Dynamic Plan Title & Subscriptions */}
            <div>
              {selectedCycle === 'annual' && (
                <div>
                  <h3 className="text-[18px] font-bold text-slate-900 dark:text-zinc-100">
                    Pro Annual
                  </h3>
                  <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                      $120
                    </span>
                    <span className="text-xs text-slate-500 dark:text-zinc-400">
                      / year
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                      •
                    </span>
                    <span className="text-[11.5px] font-medium text-slate-600 dark:text-zinc-300">
                      $10 / month
                    </span>
                  </div>
                  <p className="text-[11.5px] leading-relaxed text-slate-500 dark:text-zinc-400 mt-1">
                    Turns your documents, sheets, and slides into an active thinking collaborator.
                  </p>
                </div>
              )}

              {selectedCycle === 'monthly' && (
                <div>
                  <h3 className="text-[18px] font-bold text-slate-900 dark:text-zinc-100">
                    Pro Monthly
                  </h3>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                      $15
                    </span>
                    <span className="text-xs text-slate-500 dark:text-zinc-400">
                      / month
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500 ml-1">
                      billed monthly
                    </span>
                  </div>
                  <p className="text-[11.5px] leading-relaxed text-slate-500 dark:text-zinc-400 mt-1">
                    Full access to workspace intelligence with complete freedom to pause anytime.
                  </p>
                </div>
              )}

              {selectedCycle === 'founder' && (
                <div>
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setSelectedFounderTier(PLAN_IDS.PRO_THREE_YEAR)}
                      className={`flex-1 p-1.5 rounded-lg border text-left cursor-pointer transition-all ${
                        selectedFounderTier === PLAN_IDS.PRO_THREE_YEAR
                          ? 'border-violet-600 dark:border-violet-400 bg-violet-50/70 dark:bg-violet-950/40 shadow-2xs'
                          : 'border-slate-200 dark:border-white/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="text-[11.5px] font-bold text-slate-900 dark:text-white">Founder 3-Year</div>
                      <div className="text-[10.5px] text-slate-500 dark:text-zinc-400">$249 (~$6.92/mo)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedFounderTier(PLAN_IDS.FOUNDER_LIFETIME)}
                      className={`flex-1 p-1.5 rounded-lg border text-left cursor-pointer transition-all ${
                        selectedFounderTier === PLAN_IDS.FOUNDER_LIFETIME
                          ? 'border-violet-600 dark:border-violet-400 bg-violet-50/70 dark:bg-violet-950/40 shadow-2xs'
                          : 'border-slate-200 dark:border-white/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="text-[11.5px] font-bold text-slate-900 dark:text-white">Founder Lifetime</div>
                      <div className="text-[10.5px] text-slate-500 dark:text-zinc-400">$499 launch offer</div>
                    </button>
                  </div>

                  <p className="text-[11.5px] leading-relaxed text-slate-500 dark:text-zinc-400">
                    {selectedFounderTier === PLAN_IDS.FOUNDER_LIFETIME
                      ? 'Permanent Pro status with founder badge and priority compute.'
                      : 'Lock in 36 months of full Pro intelligence with a single upfront payment.'}
                  </p>
                </div>
              )}

              {selectedCycle === 'team' && (
                <div>
                  <h3 className="text-[18px] font-bold text-slate-900 dark:text-zinc-100">
                    Team & Org
                  </h3>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                      $20
                    </span>
                    <span className="text-xs text-slate-500 dark:text-zinc-400">
                      / user / mo
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500 ml-1">
                      billed annually
                    </span>
                  </div>
                  <p className="text-[11.5px] leading-relaxed text-slate-500 dark:text-zinc-400 mt-1">
                    Shared intelligence for organizations with Memora team brain and collaborative workflows.
                  </p>
                </div>
              )}

              <div className="my-3 border-t border-slate-200/60 dark:border-white/[0.06]" />

              {/* 4-5 Strongest Outcome-based benefits */}
              <ul className="space-y-2 text-[11.5px] text-slate-700 dark:text-zinc-200">
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 text-violet-600 dark:text-violet-400 shrink-0">
                    <RegaarderAiIcon size={13.5} strokeWidth={2.0} />
                  </div>
                  <span className="font-semibold text-violet-950 dark:text-violet-200">
                    Deeper Orb reasoning across your workspace
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={13.5} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>Memora contextual memory that understands your work</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={13.5} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>Autonomous research and browser intelligence</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={13.5} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>Cross-workspace reasoning across Docs, Sheets, and Deck</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={13.5} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    {selectedCycle === 'team'
                      ? 'Shared team workspaces and role governance'
                      : 'AI-powered document automation and generation'}
                  </span>
                </li>
              </ul>
            </div>

            {/* Action Button */}
            <div className="mt-4 space-y-1.5">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleUpgrade(currentTargetPlanId)}
                className="w-full py-2.5 px-4 rounded-lg text-[12px] font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-black dark:hover:bg-zinc-100 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm outline-none focus:outline-none"
              >
                {isProcessing ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>
                      {currentTargetPlanId === currentPlan
                        ? 'Current Plan'
                        : PLANS[currentTargetPlanId]?.ctaText || 'Upgrade Now'}
                    </span>
                    <ArrowRight size={13.5} strokeWidth={2} />
                  </>
                )}
              </button>

              {successMessage && (
                <div className="text-center text-[11px] font-medium text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                  {successMessage}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer info & Enterprise banner */}
        <div className="px-8 py-3 bg-slate-50/80 dark:bg-zinc-900/60 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between flex-wrap gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <ShieldCheck size={13} className="text-slate-400" />
            <span>Secure checkout • Cancel or switch subscriptions anytime</span>
          </div>
          <button
            type="button"
            onClick={() => handleUpgrade(PLAN_IDS.ENTERPRISE)}
            className="hover:text-slate-800 dark:hover:text-zinc-200 underline cursor-pointer"
          >
            Need custom Enterprise controls or bespoke SLA? Contact sales
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegaarderPaywallModal;
