/**
 * RelayAuthGate
 *
 * Premium Apple-style authentication modal for the Relay messaging workspace.
 * Shown in-place of ExecutiveDirectMessages when no Relay session exists.
 *
 * Supports:
 *   - Email + password register / login toggle
 *   - Google OAuth
 *   - Apple OAuth
 *
 * On success, calls onAuthenticated(relayUser).
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, X } from 'lucide-react';
import {
  relayRegister,
  relayLogin,
  relayLoginWithGoogle,
  relayLoginWithApple,
  generateHandle,
} from '../../services/relayAccountService';
import { isFirebaseConfigured } from '../../services/firebaseAuthService';

// ─── Google wordmark SVG (inline, no external dep) ──────────────────────────

function GoogleIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// ─── Apple wordmark SVG ──────────────────────────────────────────────────────

function AppleIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

// ─── Relay Brand Lock-up ─────────────────────────────────────────────────────

function RelayBrandLockup() {
  return (
    <div className="flex flex-col items-center gap-3 mb-6">
      {/* Relay icon — two overlapping message bubbles */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #7C6FCD 0%, #5B8DEF 100%)' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 4h10a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H9l-4 3V6a2 2 0 0 1-2-2z"
            fill="white"
            fillOpacity="0.85"
          />
          <path
            d="M10 10h8a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-3l-3 2.5V14"
            fill="white"
          />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-[13px] font-bold text-slate-900 tracking-tight">Sign in to Relay</p>
        <p className="text-[11.5px] text-slate-500 mt-0.5">Your team's direct messaging workspace</p>
      </div>
    </div>
  );
}

// ─── Input Field ─────────────────────────────────────────────────────────────

function AuthInput({ icon: Icon, type = 'text', value, onChange, placeholder, autoFocus = false, rightAction }) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        <Icon size={14} />
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        className="w-full pl-8 pr-9 py-2.5 rounded-xl bg-black/[0.03] border border-black/[0.08] text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-colors"
      />
      {rightAction && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {rightAction}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RelayAuthGate({ onAuthenticated, onDismiss }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [oauthLoading, setOauthLoading] = useState(null); // 'google' | 'apple'

  const firebaseReady = isFirebaseConfigured();

  // Derived @handle preview shown during registration
  const handlePreview = displayName.trim()
    ? generateHandle(displayName)
    : null;

  const clearError = useCallback(() => setError(''), []);

  // ── Email / Password Submit ────────────────────────────────────────────────

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (loading || oauthLoading) return;

    setError('');
    setLoading(true);

    try {
      let user;
      if (mode === 'register') {
        if (!displayName.trim()) {
          setError('Please enter your display name.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        user = await relayRegister({ email: email.trim(), password, displayName: displayName.trim(), bio: bio.trim() });
      } else {
        user = await relayLogin({ email: email.trim(), password });
      }
      onAuthenticated(user);
    } catch (err) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Incorrect email or password. Please try again.');
      } else if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Sign in instead.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 6 characters.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a moment and try again.');
      } else {
        setError(err?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [mode, email, password, displayName, bio, loading, oauthLoading, onAuthenticated]);

  // ── OAuth handlers ─────────────────────────────────────────────────────────

  const handleOAuth = useCallback(async (provider) => {
    if (loading || oauthLoading) return;
    setError('');
    setOauthLoading(provider);
    try {
      const fn = provider === 'google' ? relayLoginWithGoogle : relayLoginWithApple;
      const user = await fn();
      onAuthenticated(user);
    } catch (err) {
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        setError(err?.message || 'Sign-in failed. Please try again.');
      }
    } finally {
      setOauthLoading(null);
    }
  }, [loading, oauthLoading, onAuthenticated]);

  const switchMode = useCallback(() => {
    setMode(m => m === 'login' ? 'register' : 'login');
    setError('');
    setPassword('');
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="h-full w-full flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(160deg, #f8f7fb 0%, #eff0f8 100%)' }}
    >
      <div
        className="w-full max-w-sm bg-white rounded-3xl shadow-[0_8px_48px_-12px_rgba(15,23,42,0.12)] border border-black/[0.06] p-7 relative"
        style={{ animation: 'fadeSlideUp 220ms ease-out both' }}
      >
        {/* Dismiss — only if parent provides a handler */}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-black/[0.04] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        )}

        <RelayBrandLockup />

        {/* ── Error Banner ─────────────────────────────────────────────────── */}
        {error && (
          <div
            className="mb-4 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-[12px] text-red-700 font-medium flex items-start gap-2 leading-snug"
            role="alert"
          >
            <span className="mt-px shrink-0 w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Form ─────────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          {mode === 'register' && (
            <>
              <div className="space-y-1">
                <AuthInput
                  icon={User}
                  value={displayName}
                  onChange={(e) => { setDisplayName(e.target.value); clearError(); }}
                  placeholder="Your full name"
                  autoFocus
                />
                {handlePreview && (
                  <p className="text-[11px] text-slate-400 pl-1 font-mono">
                    Your handle: <span className="text-violet-500 font-semibold">{handlePreview}</span>
                  </p>
                )}
              </div>

              <AuthInput
                icon={Mail}
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                placeholder="Email address"
              />

              <div className="space-y-1">
                <AuthInput
                  icon={Lock}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); }}
                  placeholder="Password (min 6 chars)"
                  rightAction={
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  }
                />
              </div>

              <AuthInput
                icon={User}
                value={bio}
                onChange={(e) => { setBio(e.target.value); clearError(); }}
                placeholder="Role / bio (optional)"
              />
            </>
          )}

          {mode === 'login' && (
            <>
              <AuthInput
                icon={Mail}
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                placeholder="Email address"
                autoFocus
              />
              <AuthInput
                icon={Lock}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError(); }}
                placeholder="Password"
                rightAction={
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                }
              />
            </>
          )}

          <button
            type="submit"
            disabled={loading || !!oauthLoading || !email.trim() || !password.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-[13px] text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #7C6FCD 0%, #5B8DEF 100%)' }}
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to Relay' : 'Create Account'}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* ── OAuth Divider ─────────────────────────────────────────────────── */}
        {firebaseReady && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/[0.06]" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-[11px] text-slate-400 font-medium">or continue with</span>
              </div>
            </div>

            {/* ── OAuth Buttons ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                disabled={loading || !!oauthLoading}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-black/[0.08] bg-white hover:bg-slate-50 text-[12.5px] font-semibold text-slate-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {oauthLoading === 'google' ? (
                  <Loader2 size={14} className="animate-spin text-slate-500" />
                ) : (
                  <GoogleIcon size={15} />
                )}
                Google
              </button>
              <button
                type="button"
                onClick={() => handleOAuth('apple')}
                disabled={loading || !!oauthLoading}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-black/[0.08] bg-white hover:bg-slate-50 text-[12.5px] font-semibold text-slate-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {oauthLoading === 'apple' ? (
                  <Loader2 size={14} className="animate-spin text-slate-500" />
                ) : (
                  <AppleIcon size={14} />
                )}
                Apple
              </button>
            </div>
          </>
        )}

        {/* ── Mode toggle ───────────────────────────────────────────────────── */}
        <p className="text-center text-[11.5px] text-slate-500 mt-4">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          {' '}
          <button
            type="button"
            onClick={switchMode}
            className="font-bold text-violet-600 hover:text-violet-700 cursor-pointer"
          >
            {mode === 'login' ? 'Create one' : 'Sign in'}
          </button>
        </p>

        {/* ── Privacy note ─────────────────────────────────────────────────── */}
        <p className="text-center text-[10.5px] text-slate-400 mt-2 leading-relaxed">
          By continuing, you agree that your profile will be discoverable<br />
          by other Relay users in your workspace network.
        </p>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  );
}
