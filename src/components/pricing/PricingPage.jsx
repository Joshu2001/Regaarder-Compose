import React, { useEffect, useState } from 'react';
import { Check, ArrowLeft, ShieldCheck, Mail, X, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { PricingTiers, CREEM_CATALOG } from '../../constants/pricing-tier';
import { RegaarderAiIcon } from '../RegaarderProductIcons';
import RegaarderBrandIcon from '../RegaarderBrandIcon';
import { onAuthChange } from '../../services/supabaseAuthService';
import { courierMailService } from '../../services/courierMailService';
import { creemService } from '../../services/creemService';

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
    <div className="fixed inset-0 overflow-y-auto bg-[#fafafa] dark:bg-[#111113] text-zinc-900 dark:text-zinc-100 selection:bg-zinc-200 dark:selection:bg-zinc-800 font-sans z-50 [scrollbar-gutter:stable]">
      <header className="max-w-6xl mx-auto px-6 pt-8 pb-4 flex items-center justify-between relative z-10">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Workspace</span>
        </a>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-[#1a1a1e] border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs text-xs text-zinc-700 dark:text-zinc-300">
          <RegaarderBrandIcon size={14} className="text-zinc-900 dark:text-zinc-100" />
          <span className="font-semibold tracking-tight">Regaarder</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 sm:py-12 relative z-10">
        {/* Title Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide uppercase bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/60 mb-5">
            <span>Regaarder Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-zinc-950 dark:text-white mb-3">
            Tools built for your best work
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
            Flexible subscriptions and lifetime passes for thinkers, creators, and operators.
          </p>

          {checkoutError && (
            <div className="mt-6 p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs text-left max-w-lg mx-auto flex items-center justify-between">
              <span>{checkoutError}</span>
              <button onClick={() => setCheckoutError(null)} className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-200">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Monthly / Annual Toggle — Segmented Apple/Claude Style */}
          <div className="mt-8 flex flex-col items-center gap-2">
            <div className="inline-flex items-center p-1 rounded-lg bg-zinc-200/60 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 shadow-2xs">
              <button
                onClick={() => setBillingFrequency('month')}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                  billingFrequency === 'month'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingFrequency('year')}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold tracking-tight transition-all flex items-center gap-1.5 cursor-pointer ${
                  billingFrequency === 'year'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <span>Annual</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white shadow-2xs">
                  Save 20%
                </span>
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
              Save more with annual billing. Cancel anytime.
            </p>
          </div>
        </div>

        {/* 3-Tier Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch max-w-5xl mx-auto mb-14">
          {PricingTiers.map((tier) => {
            const isFeatured = tier.featured;
            const priceDisplay = tier.fallbackPrice[billingFrequency];

            return (
              <div
                key={tier.name}
                className={`relative flex flex-col justify-between rounded-xl p-7 transition-all ${
                  isFeatured
                    ? 'bg-white dark:bg-[#18181b] border-2 border-zinc-900 dark:border-zinc-200 shadow-lg shadow-black/[0.04] dark:shadow-none'
                    : 'bg-white/80 dark:bg-[#161619] border border-zinc-200/90 dark:border-zinc-800 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                {isFeatured && (
                  <div className="absolute -top-3 left-6 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-2xs flex items-center gap-1">
                    <RegaarderAiIcon size={11} strokeWidth={2} />
                    <span>Most Popular</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-bold text-zinc-950 dark:text-white tracking-tight">{tier.name}</h2>
                    {isFeatured && (
                      <span className="text-zinc-900 dark:text-zinc-100">
                        <RegaarderBrandIcon size={15} />
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 min-h-[34px] leading-relaxed">
                    {tier.description}
                  </p>

                  {/* Price display */}
                  <div className="mb-6 pb-6 border-b border-zinc-100 dark:border-zinc-800/80">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-bold text-zinc-950 dark:text-white tracking-tight">
                        {priceDisplay}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        /{billingFrequency === 'month' ? 'month' : 'year'}
                      </span>
                    </div>

                    {tier.name === 'Starter' && billingFrequency === 'year' && (
                      <p className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Billed annually at $115/yr
                      </p>
                    )}
                    {tier.name === 'Pro' && (
                      <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                        {billingFrequency === 'year' ? 'Billed annually at $278/yr' : 'Billed monthly. Includes full AI models'}
                      </p>
                    )}
                    {tier.name === 'Advanced' && (
                      <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                        {billingFrequency === 'year' ? 'Billed annually at $758/yr' : 'Billed monthly. Enterprise throughput'}
                      </p>
                    )}
                  </div>

                  {/* Feature checklist */}
                  <div className="space-y-3 mb-8">
                    <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      Included capabilities
                    </p>
                    <ul className="space-y-2.5">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                          <Check
                            size={14}
                            className="shrink-0 mt-0.5 text-zinc-900 dark:text-zinc-100"
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
                    className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isFeatured
                        ? 'bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 shadow-2xs active:scale-[0.99]'
                        : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white border border-zinc-200/80 dark:border-zinc-700/60 active:scale-[0.99]'
                    }`}
                  >
                    {subscribingTier === tier.name ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Opening Checkout...</span>
                      </>
                    ) : (
                      <span>Get {tier.name}</span>
                    )}
                  </button>

                  <div className="mt-3 text-center text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center justify-center gap-1">
                    <ShieldCheck size={12} />
                    <span>Cancel anytime • No lock-in</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Lifetime & Multi-Year Passes Section */}
        <div className="max-w-4xl mx-auto rounded-xl bg-white dark:bg-[#161619] border border-zinc-200/90 dark:border-zinc-800 p-7 shadow-2xs">
          <div className="text-center mb-6">
            <h3 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white tracking-tight">Executive Long-Term Passes</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">One-time payment passes for long-term power users and operators</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* 3-Year Pass */}
            <div className="p-5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-zinc-950 dark:text-white">3-Year Executive Pass</h4>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">3 Years</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
                  3-Year full access pass to Regaarder Pro with all intelligence updates included.
                </p>
                <div className="text-2xl font-bold text-zinc-950 dark:text-white mb-4">$199 <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">one-time</span></div>
              </div>
              <button
                onClick={() => handlePassCheckout('threeYear', '3-Year Executive Pass')}
                disabled={subscribingTier === '3-Year Executive Pass'}
                className="w-full py-2 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {subscribingTier === '3-Year Executive Pass' ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : null}
                <span>Get 3-Year Pass</span>
              </button>
            </div>

            {/* Lifetime Founder Pass */}
            <div className="p-5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-300 dark:border-zinc-700 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/50">
                Founder Edition
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-zinc-950 dark:text-white">Lifetime Founder Pass</h4>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
                  Lifetime access to Regaarder Advanced suite with permanent Orb Intelligence.
                </p>
                <div className="text-2xl font-bold text-zinc-950 dark:text-white mb-4">$349 <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">one-time</span></div>
              </div>
              <button
                onClick={() => handlePassCheckout('lifetime', 'Lifetime Founder Pass')}
                disabled={subscribingTier === 'Lifetime Founder Pass'}
                className="w-full py-2 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 transition-colors cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
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
        <div className="mt-14 pt-6 border-t border-zinc-200 dark:border-zinc-800/80 text-center max-w-xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Need assistance or custom invoicing? Contact us at{' '}
              <a href="mailto:support@regaarder.com" className="text-zinc-900 dark:text-zinc-200 hover:underline font-medium">
                support@regaarder.com
              </a>
            </p>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <button
              onClick={() => {
                setSupportEmail(user?.email || '');
                setIsSupportModalOpen(true);
              }}
              className="text-xs text-zinc-900 dark:text-zinc-200 hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <Mail size={12} />
              <span>Contact Support</span>
            </button>
          </div>

          {/* Public Legal Links (Required by Creem Compliance) */}
          <div className="flex items-center justify-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <a href="/privacy" className="hover:text-zinc-900 dark:hover:text-white underline transition-colors">
              Privacy Policy
            </a>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <a href="/terms" className="hover:text-zinc-900 dark:hover:text-white underline transition-colors">
              Terms of Service
            </a>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <a href="/refund" className="hover:text-zinc-900 dark:hover:text-white underline transition-colors">
              Refund Policy
            </a>
          </div>

          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-relaxed">
            All payments, taxes, and localized currency conversions are processed securely via Creem.io.
          </p>
        </div>
      </main>

      {/* Support Inquiry Modal (Direct write to Courier Mailbox) */}
      {isSupportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden p-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                  <Mail size={15} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">Contact Regaarder Support</h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Routes to support@regaarder.com</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsSupportModalOpen(false);
                  setSupportSentSuccess(false);
                }}
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {supportSentSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Message Dispatched!</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
                  Your message has been delivered to <span className="text-zinc-900 dark:text-white font-mono">support@regaarder.com</span>.
                </p>
                <button
                  onClick={() => {
                    setIsSupportModalOpen(false);
                    setSupportSentSuccess(false);
                  }}
                  className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 transition-colors"
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
                  <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                    Your Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full text-xs px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-white outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={supportSubject}
                    onChange={(e) => setSupportSubject(e.target.value)}
                    placeholder="e.g. Question about Pro plan"
                    className="w-full text-xs px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-white outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                    How can we help?
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="Write your questions or issue details..."
                    className="w-full text-xs p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-white outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSupportModalOpen(false)}
                    className="px-3 py-2 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingSupport}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 flex items-center gap-1.5 transition-colors disabled:opacity-50"
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
