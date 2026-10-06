import React, { useEffect, useState } from 'react';
import { initializePaddle } from '@paddle/paddle-js';
import { ShieldCheck, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { RegaarderAiIcon } from '../RegaarderProductIcons';

export default function CheckoutPage() {
  const [paddle, setPaddle] = useState(null);
  const [status, setStatus] = useState('initializing'); // 'initializing' | 'waiting_for_transaction' | 'opening_checkout' | 'error' | 'checkout_active'
  const [errorMessage, setErrorMessage] = useState(null);
  const [transactionId, setTransactionId] = useState(null);

  // 1. Parse _ptxn or transactionId from URL search params
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const ptxn = urlParams.get('_ptxn') || urlParams.get('transactionId') || urlParams.get('txn');
    if (ptxn) {
      setTransactionId(ptxn.trim());
    } else {
      setStatus('waiting_for_transaction');
    }
  }, []);

  // 2. Initialize Paddle.js with environment variables (no secret keys exposed)
  useEffect(() => {
    const paddleEnv = import.meta.env.VITE_PADDLE_ENV || 'sandbox';
    const clientToken =
      import.meta.env.VITE_PADDLE_CLIENT_TOKEN ||
      (paddleEnv === 'production'
        ? 'live_aec8a6a238563dc3b3285972199'
        : 'test_27ec8ae3d57fef6a0e6eacea02a');

    if (!clientToken || clientToken.includes('your_client_token')) {
      const err = 'Paddle client token (VITE_PADDLE_CLIENT_TOKEN) is not configured in your environment.';
      console.warn('[Regaarder Checkout]', err);
      setErrorMessage(err);
      setStatus('error');
      return;
    }

    initializePaddle({
      token: clientToken,
      environment: paddleEnv,
      eventCallback: (event) => {
        if (event.name === 'checkout.completed') {
          window.location.href = `${window.location.origin}/welcome`;
        }
      },
    })
      .then((instance) => {
        if (instance) {
          setPaddle(instance);
        }
      })
      .catch((err) => {
        console.error('[Regaarder Checkout] Failed to initialize Paddle.js:', err);
        setErrorMessage(err?.message || 'Failed to initialize payment gateway.');
        setStatus('error');
      });
  }, []);

  // 3. Automatically open checkout overlay when transaction ID and Paddle instance are ready
  useEffect(() => {
    if (!paddle || !transactionId) return;

    setStatus('opening_checkout');

    try {
      paddle.Checkout.open({
        transactionId: transactionId,
        settings: {
          displayMode: 'overlay',
          variant: 'one-page',
          theme: 'dark',
          successUrl: `${window.location.origin}/welcome`,
        },
      });
      setStatus('checkout_active');
    } catch (err) {
      console.error('[Regaarder Checkout] Error opening checkout:', err);
      setErrorMessage(err?.message || 'Failed to open checkout overlay.');
      setStatus('error');
    }
  }, [paddle, transactionId]);

  // Manual trigger if pop-up was dismissed
  const handleManualOpen = () => {
    if (!paddle || !transactionId) return;
    try {
      paddle.Checkout.open({
        transactionId: transactionId,
        settings: {
          displayMode: 'overlay',
          variant: 'one-page',
          theme: 'dark',
          successUrl: `${window.location.origin}/welcome`,
        },
      });
      setStatus('checkout_active');
    } catch (err) {
      console.error('[Regaarder Checkout] Error opening checkout:', err);
      setErrorMessage(err?.message || 'Failed to open checkout overlay.');
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 overflow-y-auto bg-slate-950 text-slate-100 flex flex-col justify-between items-center px-4 py-8 font-sans selection:bg-violet-500/30 selection:text-violet-200 z-50">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-violet-600/15 via-indigo-600/10 to-transparent blur-[130px] pointer-events-none rounded-full" />

      {/* Header */}
      <header className="w-full max-w-4xl flex items-center justify-between relative z-10">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <span>← Regaarder Workspace</span>
        </a>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <RegaarderAiIcon size={13} className="text-violet-400" />
          <span className="font-medium">Secure Payment Terminal</span>
        </div>
      </header>

      {/* Center Card */}
      <main className="relative z-10 max-w-md w-full my-auto">
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-8 backdrop-blur-xl shadow-2xl text-center">
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <RegaarderAiIcon size={26} strokeWidth={1.8} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-4">
            <ShieldCheck size={13} />
            <span>Paddle Merchant of Record</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
            Regaarder Checkout
          </h1>

          {/* Dynamic State Feedback */}
          {status === 'initializing' && (
            <div className="py-6">
              <RefreshCw size={24} className="animate-spin mx-auto text-violet-400 mb-3" />
              <p className="text-xs text-slate-400">Initializing secure checkout session...</p>
            </div>
          )}

          {status === 'opening_checkout' && (
            <div className="py-6">
              <RefreshCw size={24} className="animate-spin mx-auto text-violet-400 mb-3" />
              <p className="text-xs text-slate-400">Opening checkout for transaction {transactionId}...</p>
            </div>
          )}

          {status === 'checkout_active' && (
            <div className="py-4">
              <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                The checkout overlay is now active. Please complete your transaction in the Paddle window.
              </p>
              <button
                onClick={handleManualOpen}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-xs text-white bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700/60 cursor-pointer"
              >
                <span>Re-open Checkout Window</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {status === 'waiting_for_transaction' && (
            <div className="py-4">
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                No active transaction parameter (<code className="text-violet-300">_ptxn</code>) was detected. To choose a subscription or workspace plan, visit our pricing page.
              </p>
              <a
                href="/pricing"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-xs text-white bg-violet-600 hover:bg-violet-500 active:scale-[0.99] transition-all shadow-lg shadow-violet-600/25 cursor-pointer"
              >
                <span>Browse Pricing & Plans</span>
                <ArrowRight size={14} />
              </a>
            </div>
          )}

          {status === 'error' && (
            <div className="py-4">
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-left mb-6 flex items-start gap-2.5">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
                <div className="leading-relaxed">
                  <div className="font-semibold mb-0.5">Checkout Notice</div>
                  <div>{errorMessage}</div>
                </div>
              </div>
              <a
                href="/pricing"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer"
              >
                <span>Return to Pricing</span>
              </a>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl text-center relative z-10 pt-6">
        <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck size={12} />
          <span>Encrypted 256-bit SSL • Powered by Paddle Merchant of Record</span>
        </p>
      </footer>
    </div>
  );
}
