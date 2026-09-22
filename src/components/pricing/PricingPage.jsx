import React, { useEffect, useState } from 'react';
import { initializePaddle } from '@paddle/paddle-js';
import { Check, ArrowLeft, ShieldCheck, Zap } from 'lucide-react';
import { PricingTiers } from '../../constants/pricing-tier';
import { usePaddlePrices } from '../../hooks/usePaddlePrices';
import { RegaarderAiIcon } from '../RegaarderProductIcons';
import { onAuthChange } from '../../services/supabaseAuthService';

export default function PricingPage() {
  const [billingFrequency, setBillingFrequency] = useState('month'); // 'month' | 'year'
  const [paddle, setPaddle] = useState(null);
  const [paddleInitError, setPaddleInitError] = useState(null);
  const [country, setCountry] = useState(null);
  const [user, setUser] = useState(null);
  const [subscribingTier, setSubscribingTier] = useState(null);

  // 1. Listen for authenticated user session to pre-fill email
  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // 2. Fetch detected country from server headers (/api/geo)
  useEffect(() => {
    let isMounted = true;
    fetch('/api/geo')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        if (data?.country && typeof data.country === 'string' && data.country.trim().length === 2) {
          setCountry(data.country.trim().toUpperCase());
        } else {
          setCountry(null);
        }
      })
      .catch(() => {
        if (isMounted) setCountry(null);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // 3. Initialize Paddle.js with strict environment checking
  useEffect(() => {
    const clientToken =
      import.meta.env.VITE_PADDLE_CLIENT_TOKEN ||
      (paddleEnv === 'production'
        ? 'live_aec8a6a238563dc3b3285972199'
        : 'test_27ec8ae3d57fef6a0e6eacea02a');

    if (!clientToken || clientToken.includes('your_client_token')) {
      const err = new Error(
        `[Paddle Config Error] VITE_PADDLE_CLIENT_TOKEN is not configured. Please supply a valid client token in your .env file.`
      );
      console.error(err);
      setPaddleInitError(err.message);
      return;
    }

    initializePaddle({
      token: clientToken,
      environment: paddleEnv,
      ...(user?.paddleCustomerId ? { pwCustomer: { id: user.paddleCustomerId } } : {}),
    })
      .then((p) => {
        if (p) {
          setPaddle(p);
        }
      })
      .catch((err) => {
        console.error('[Paddle Initialization Failed]', err);
        setPaddleInitError(err?.message || 'Failed to initialize Paddle SDK');
      });
  }, [user]);

  // 4. Retrieve localized price strings via Paddle.PricePreview
  const { prices, loading: pricesLoading } = usePaddlePrices(paddle, country);

  // 5. Open Paddle Checkout Overlay
  const handleSubscribe = (tier) => {
    if (!paddle) {
      alert('Paddle is still initializing or client token is unconfigured. Please check environment variables.');
      return;
    }

    const priceId = tier.priceId[billingFrequency];
    if (!priceId) {
      alert(`No price configured for ${tier.name} (${billingFrequency})`);
      return;
    }

    setSubscribingTier(tier.name);

    try {
      const successUrl = `${window.location.origin}/welcome`;
      paddle.Checkout.open({
        settings: {
          displayMode: 'overlay',
          variant: 'one-page',
          theme: 'dark',
          successUrl,
        },
        ...(user?.email ? { customer: { email: user.email } } : {}),
        items: [{ priceId, quantity: 1 }],
      });
    } catch (err) {
      console.error('[Paddle Checkout Open Error]', err);
      alert(`Could not open checkout: ${err?.message || 'Unknown error'}`);
    } finally {
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
          {country && (
            <span className="text-slate-500 border-l border-slate-700 pl-2">
              Region: {country}
            </span>
          )}
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
            Country-localized rates with purchasing power parity. Choose the plan that fits your execution velocity.
          </p>

          {/* Paddle Init Warning Banner if env is missing */}
          {paddleInitError && (
            <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-left max-w-xl mx-auto">
              <div className="font-semibold flex items-center gap-2 mb-1">
                <span>Paddle Configuration Notice</span>
              </div>
              <p className="leading-relaxed">{paddleInitError}</p>
              <p className="mt-2 text-slate-400">
                To test live checkout overlay, make sure <code>VITE_PADDLE_CLIENT_TOKEN</code> is added to your <code>.env</code> file.
              </p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {PricingTiers.map((tier) => {
            const activePriceId = tier.priceId[billingFrequency];
            const formattedPrice = prices[activePriceId];
            const isFeatured = tier.featured;

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

                  {/* Price display using formatted totals from Paddle */}
                  <div className="mb-6 pb-6 border-b border-slate-800">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-extrabold text-white tracking-tight">
                        {pricesLoading || !formattedPrice ? (
                          <span className="text-slate-500 animate-pulse text-3xl font-normal">
                            {pricesLoading ? 'Calculating...' : '—'}
                          </span>
                        ) : (
                          formattedPrice
                        )}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        /{billingFrequency === 'month' ? 'month' : 'year'}
                      </span>
                    </div>

                    {tier.name === 'Pro' && (
                      <p className="mt-2 text-[11px] text-violet-400 font-medium flex items-center gap-1">
                        <span>Includes 7-day free trial</span>
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
                    <span>Subscribe to {tier.name}</span>
                  </button>

                  <div className="mt-3 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1">
                    <ShieldCheck size={12} />
                    <span>Cancel anytime • Paddle Secure Checkout</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Security & Compliance Footer */}
        <div className="mt-16 pt-8 border-t border-slate-800/80 text-center max-w-xl mx-auto">
          <p className="text-xs text-slate-500 leading-relaxed">
            Paddle is our Merchant of Record. All payments, taxes, invoices, and localized currency conversions are processed securely via Paddle.
          </p>
        </div>
      </main>
    </div>
  );
}
