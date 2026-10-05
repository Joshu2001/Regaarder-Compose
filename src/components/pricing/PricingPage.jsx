import React, { useEffect, useState } from 'react';
import { Check, ArrowLeft, ShieldCheck, Zap, Mail, X, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { PricingTiers, CREEM_CATALOG } from '../../constants/pricing-tier';
import { RegaarderAiIcon } from '../RegaarderProductIcons';
import { onAuthChange } from '../../services/supabaseAuthService';
import { courierMailService } from '../../services/courierMailService';
import { creemService, CREEM_CONFIG } from '../../services/creemService';

export default function PricingPage() {
  const [billingFrequency, setBillingFrequency] = useState('month'); // 'month' | 'year'
  const [user, setUser] = useState(null);
  const [subscribingTier, setSubscribingTier] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);

  // Support inquiry modal state
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [supportEmail, setSupportEmail] = useState('');
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSentSuccess, setSupportSentSuccess] = useState(false);
  const [isSendingSupport, setIsSendingSupport] = useState(false);

  // Listen for authenticated user session to pre-fill email
  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Creem Checkout Handler
  const handleSubscribe = async (tier) => {
    setSubscribingTier(tier.name);
    setCheckoutError(null);

    const creemProductId = tier.creemProductId;
    if (!creemProductId) {
      setCheckoutError(`Product ID for ${tier.name} is not configured.`);
      setSubscribingTier(null);
      return;
    }

    try {
      const session = await creemService.createCheckoutSession({
        productId: creemProductId,
        customerEmail: user?.email || undefined,
        metadata: { tier: tier.name, billingFrequency }
      });

      const checkoutUrl = session?.checkout_url || session?.url;
      if (checkoutUrl) {
        if (window.electronAPI?.openExternal) {
          window.electronAPI.openExternal(checkoutUrl);
        } else {
          window.location.href = checkoutUrl;
        }
        setSubscribingTier(null);
        return;
      }

      throw new Error('No checkout URL returned from payment provider.');
    } catch (err) {
      console.error('[Creem Checkout Error]', err);
      setCheckoutError(err.message || 'Unable to open checkout. Please try again.');
      setSubscribingTier(null);
    }
  };

  // One-time pass checkout handler
  const handlePassCheckout = async (passKey, passName) => {
    setSubscribingTier(passName);
    setCheckoutError(null);

    const pass = CREEM_CATALOG[passKey];
    if (!pass?.productId) {
      setCheckoutError(`Product for ${passName} is unavailable.`);
      setSubscribingTier(null);
      return;
    }

    try {
      const session = await creemService.createCheckoutSession({
        productId: pass.productId,
        customerEmail: user?.email || undefined,
        metadata: { pass: passName, type: 'onetime_pass' }
      });

      const checkoutUrl = session?.checkout_url || session?.url;
      if (checkoutUrl) {
        if (window.electronAPI?.openExternal) {
          window.electronAPI.openExternal(checkoutUrl);
        } else {
          window.location.href = checkoutUrl;
        }
        setSubscribingTier(null);
        return;
      }

      throw new Error('No checkout URL returned from payment provider.');
    } catch (err) {
      console.error('[Creem Pass Checkout Error]', err);
      setCheckoutError(err.message || 'Unable to open checkout. Please try again.');
      setSubscribingTier(null);
    }
  };

  return (
    <div className="fixed inset-0 overflow-y-auto bg-slate-950 text-slate-100 selection:bg-violet-500/30 selection:text-violet-200 font-sans z-50">
      {/* Background ambient gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-violet-600/15 via-indigo-600/5 to-transparent blur-[140px] pointer-events-none rounded-full" />

      <header className="max-w-7xl mx-auto px-6 pt-10 pb-6 flex items-center justify-between relative z-10">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Workspace</span>
        </a>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <RegaarderAiIcon size={14} className="text-violet-400" />
          <span className="font-medium">Regaarder Workspace</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-5">
            <RegaarderAiIcon size={13} strokeWidth={2} />
            <span>Executive Intelligence Substrate</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Predictable pricing for sovereign thinking
          </h1>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            Direct, transparent pricing backed by Creem Merchant of Record. Choose the plan that fits your execution velocity.
          </p>

          {checkoutError && (
            <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-left max-w-xl mx-auto flex items-center justify-between">
              <span>{checkoutError}</span>
              <button onClick={() => setCheckoutError(null)} className="text-slate-400 hover:text-white">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Monthly / Annual Toggle */}
          <div className="mt-10 inline-flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 shadow-inner">
            <button
              onClick={() => setBillingFrequency('month')}
              className={`px-5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                billingFrequency === 'month'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingFrequency('year')}
              className={`px-5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-2 cursor-pointer ${
                billingFrequency === 'year'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Save ~20%
              </span>
            </button>
          </div>
        </div>

        {/* 3-Tier Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto mb-16">
          {PricingTiers.map((tier) => {
            const isFeatured = tier.featured;
            const priceDisplay = tier.fallbackPrice[billingFrequency];

            return (
              <div
                key={tier.name}
                className={`relative flex flex-col justify-between rounded-2xl p-8 transition-all backdrop-blur-md ${
                  isFeatured
                    ? 'bg-slate-900/90 border-2 border-violet-500/70 shadow-2xl shadow-violet-500/10'
                    : 'bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/80'
                }`}
              >
                {isFeatured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-violet-600 text-white text-[11px] font-bold tracking-wider uppercase shadow-lg shadow-violet-600/30 flex items-center gap-1">
                    <RegaarderAiIcon size={12} strokeWidth={2} />
                    <span>Most Popular</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-white tracking-tight">{tier.name}</h2>
                    {isFeatured && <Zap size={18} className="text-violet-400" />}
                  </div>

                  <p className="text-xs text-slate-400 mb-6 min-h-[36px] leading-relaxed">
                    {tier.description}
                  </p>

                  {/* Price display */}
                  <div className="mb-6 pb-6 border-b border-slate-800">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-extrabold text-white tracking-tight">
                        {priceDisplay}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        /{billingFrequency === 'month' ? 'month' : 'year'}
                      </span>
                    </div>

                    {tier.name === 'Starter' && billingFrequency === 'year' && (
                      <p className="mt-2 text-[11px] text-emerald-400 font-medium">
                        Billed annually at $115/yr
                      </p>
                    )}
                    {tier.name === 'Pro' && (
                      <p className="mt-2 text-[11px] text-violet-400 font-medium">
                        Billed at $29/mo with full intelligence updates
                      </p>
                    )}
                    {tier.name === 'Advanced' && (
                      <p className="mt-2 text-[11px] text-violet-400 font-medium">
                        Enterprise throughput & dedicated concierge
                      </p>
                    )}
                  </div>

                  {/* Feature checklist */}
                  <div className="space-y-3 mb-8">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Included capabilities
                    </p>
                    <ul className="space-y-2.5">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <Check
                            size={14}
                            className={`shrink-0 mt-0.5 ${
                              isFeatured ? 'text-violet-400' : 'text-slate-400'
                            }`}
                            strokeWidth={2.5}
                          />
                          <span className="leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Subscribe CTA Button */}
                <div>
                  <button
                    onClick={() => handleSubscribe(tier)}
                    disabled={subscribingTier === tier.name}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isFeatured
                        ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/25 active:scale-[0.99]'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white active:scale-[0.99]'
                    }`}
                  >
                    {subscribingTier === tier.name ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Opening Checkout...</span>
                      </>
                    ) : (
                      <span>Subscribe to {tier.name}</span>
                    )}
                  </button>

                  <div className="mt-3 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1">
                    <ShieldCheck size={12} />
                    <span>Cancel anytime • Secure checkout by Creem</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Lifetime & Multi-Year Passes Section */}
        <div className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-r from-violet-950/40 via-slate-900/60 to-slate-900/40 border border-violet-500/20 p-8 shadow-xl">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white tracking-tight">Executive Long-Term Passes</h3>
            <p className="text-xs text-slate-400 mt-1">One-time payment passes for sovereign operators and early founders</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* 3-Year Pass */}
            <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-white">3-Year Executive Pass</h4>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-violet-500/20 text-violet-300">3 Years</span>
                </div>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  3-Year full access pass to Regaarder Pro with all intelligence updates included.
                </p>
                <div className="text-2xl font-extrabold text-white mb-4">$199 <span className="text-xs font-normal text-slate-400">one-time</span></div>
              </div>
              <button
                onClick={() => handlePassCheckout('threeYear', '3-Year Executive Pass')}
                disabled={subscribingTier === '3-Year Executive Pass'}
                className="w-full py-2.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {subscribingTier === '3-Year Executive Pass' ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : null}
                <span>Get 3-Year Pass</span>
              </button>
            </div>

            {/* Lifetime Founder Pass */}
            <div className="p-6 rounded-xl bg-slate-950/60 border border-violet-500/40 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Founder Edition
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-white">Lifetime Founder Pass</h4>
                </div>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Lifetime access to Regaarder Advanced suite with permanent Circle AI intelligence.
                </p>
                <div className="text-2xl font-extrabold text-white mb-4">$349 <span className="text-xs font-normal text-slate-400">one-time</span></div>
              </div>
              <button
                onClick={() => handlePassCheckout('lifetime', 'Lifetime Founder Pass')}
                disabled={subscribingTier === 'Lifetime Founder Pass'}
                className="w-full py-2.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors cursor-pointer shadow-md shadow-violet-600/20 flex items-center justify-center gap-1.5"
              >
                {subscribingTier === 'Lifetime Founder Pass' ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : null}
                <span>Get Lifetime Pass</span>
              </button>
            </div>
          </div>
        </div>

        {/* Global Security & Compliance Footer */}
        <div className="mt-16 pt-8 border-t border-slate-800/80 text-center max-w-xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2">
            <p className="text-xs text-slate-400 leading-relaxed">
              Need assistance or have billing questions? Contact us at{' '}
              <a href="mailto:support@regaarder.com" className="text-violet-400 hover:text-violet-300 underline font-medium">
                support@regaarder.com
              </a>
            </p>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => {
                setSupportEmail(user?.email || '');
                setIsSupportModalOpen(true);
              }}
              className="text-xs text-violet-400 hover:text-violet-300 font-medium underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Mail size={12} />
              <span>Contact Support</span>
            </button>
          </div>

          {/* Public Legal Links (Required by Creem Compliance) */}
          <div className="flex items-center justify-center gap-4 text-xs text-slate-400 font-medium">
            <a href="/privacy" className="hover:text-white underline transition-colors">
              Privacy Policy
            </a>
            <span className="text-slate-700">•</span>
            <a href="/terms" className="hover:text-white underline transition-colors">
              Terms of Service
            </a>
            <span className="text-slate-700">•</span>
            <a href="/refund" className="hover:text-white underline transition-colors">
              Refund Policy
            </a>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            All payments, taxes, invoices, and localized currency conversions are processed securely via our Merchant of Record, Creem.io.
          </p>
        </div>
      </main>

      {/* Support Inquiry Modal (Direct write to Courier Mailbox) */}
      {isSupportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-violet-600/20 text-violet-400 flex items-center justify-center border border-violet-500/30">
                  <Mail size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Contact Regaarder Support</h3>
                  <p className="text-[11px] text-slate-400">Routes to support@regaarder.com</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsSupportModalOpen(false);
                  setSupportSentSuccess(false);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {supportSentSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="text-sm font-bold text-white">Message Dispatched!</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Your message has been delivered to <span className="text-violet-400 font-mono">support@regaarder.com</span> and logged in our admin support courier.
                </p>
                <button
                  onClick={() => {
                    setIsSupportModalOpen(false);
                    setSupportSentSuccess(false);
                  }}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!supportEmail.trim() || !supportMessage.trim()) return;
                  setIsSendingSupport(true);
                  try {
                    await courierMailService.recordInboundMessage({
                      from: supportEmail.trim(),
                      to: 'support@regaarder.com',
                      subject: supportSubject.trim() || 'Pricing & Account Support Inquiry',
                      body: supportMessage.trim(),
                      source: 'web_pricing_contact'
                    });
                    setSupportSentSuccess(true);
                    setSupportSubject('');
                    setSupportMessage('');
                  } catch (err) {
                    console.error('Failed to send support inquiry:', err);
                  } finally {
                    setIsSendingSupport(false);
                  }
                }}
                className="pt-4 space-y-3"
              >
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Your Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={supportSubject}
                    onChange={(e) => setSupportSubject(e.target.value)}
                    placeholder="e.g. Question about Pro plan"
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    How can we help?
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="Write your questions or issue details..."
                    className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-violet-500 transition-colors resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSupportModalOpen(false)}
                    className="px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingSupport}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Send size={12} />
                    <span>{isSendingSupport ? 'Sending...' : 'Send Message'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
