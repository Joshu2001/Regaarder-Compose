import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2 } from 'lucide-react';
import RegaarderBrandIcon from '../RegaarderBrandIcon';
import {
  isFirebaseConfigured,
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  loginWithApple
} from '../../services/firebaseAuthService';

/**
 * Compact, Apple-style Authentication Popover Dropdown
 * Anchors directly beneath the "Sign in" trigger button.
 */
export default function AuthPopoverDropdown({
  isOpen,
  onClose,
  onSuccess,
  apiBaseUrl = '',
  className = 'right-0 top-9'
}) {
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'register'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setAuthError('');
      setAuthLoading(false);
    }
  }, [isOpen]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      setAuthError('Email and password are required.');
      return;
    }
    if (authTab === 'register' && !authName) {
      setAuthError('Name is required for registration.');
      return;
    }

    setAuthError('');
    setAuthLoading(true);

    try {
      let token = null;
      let user = null;

      if (isFirebaseConfigured()) {
        const result = authTab === 'login'
          ? await loginWithEmail(authEmail, authPassword)
          : await registerWithEmail(authEmail, authPassword, authName);
        token = result.token;
        user = result.user;

        // Sync with backend if available
        try {
          const syncUrl = apiBaseUrl ? `${apiBaseUrl}/api/auth/firebase-sync` : '/api/auth/firebase-sync';
          await fetch(syncUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ token, user })
          });
        } catch (syncErr) {
          console.warn('[Auth] Background sync warning:', syncErr);
        }
      } else {
        const endpoint = authTab === 'login' ? '/api/auth/login' : '/api/auth/register';
        const targetUrl = apiBaseUrl ? `${apiBaseUrl}${endpoint}` : endpoint;
        const body = authTab === 'login'
          ? { email: authEmail, password: authPassword }
          : { email: authEmail, password: authPassword, name: authName };

        const res = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Authentication failed.');
        }

        token = data.token;
        user = data.user;
      }

      localStorage.setItem('rc.token', token);
      localStorage.setItem('rc.user', JSON.stringify(user));
      onSuccess?.(user);
      onClose?.();
    } catch (err) {
      setAuthError(err.message || 'Authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSocialAuth = async (provider) => {
    setAuthError('');
    setAuthLoading(true);

    try {
      let token = null;
      let user = null;

      if (isFirebaseConfigured()) {
        const result = provider === 'google'
          ? await loginWithGoogle()
          : await loginWithApple();
        token = result.token;
        user = result.user;

        try {
          const syncUrl = apiBaseUrl ? `${apiBaseUrl}/api/auth/firebase-sync` : '/api/auth/firebase-sync';
          await fetch(syncUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ token, user })
          });
        } catch (syncErr) {
          console.warn('[Auth] Background sync warning:', syncErr);
        }
      } else {
        let deviceId = localStorage.getItem('rc.device_id');
        if (!deviceId) {
          deviceId = 'dev_' + Math.random().toString(36).substring(2, 11);
          localStorage.setItem('rc.device_id', deviceId);
        }

        const targetEmail = authEmail && authEmail.includes('@')
          ? authEmail.trim().toLowerCase()
          : `social_${provider}_${deviceId}@regaarder.local`;
        const targetName = authName ? authName.trim() : (provider === 'google' ? 'Google User' : 'Apple User');

        const targetUrl = apiBaseUrl ? `${apiBaseUrl}/api/auth/social` : '/api/auth/social';
        const res = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider,
            email: targetEmail,
            name: targetName
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Social sign-in failed.');
        }

        token = data.token;
        user = data.user;
      }

      localStorage.setItem('rc.token', token);
      localStorage.setItem('rc.user', JSON.stringify(user));
      onSuccess?.(user);
      onClose?.();
    } catch (err) {
      setAuthError(err.message || 'Social sign-in failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <>
      {/* Lightweight non-intrusive backdrop for outside-click dismissal */}
      <div
        className="fixed inset-0 z-40 bg-black/10 dark:bg-black/30"
        onMouseDown={onClose}
        aria-hidden="true"
      />

      {/* Compact Popover Dropdown Container */}
      <div
        ref={containerRef}
        onMouseDown={(e) => e.stopPropagation()}
        className={`absolute ${className} z-50 w-[320px] rounded-xl bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.04)] dark:shadow-[0_16px_36px_-8px_rgba(0,0,0,0.6)] p-4 flex flex-col gap-3 font-sans animate-in fade-in zoom-in-95 duration-150`}
      >
        {/* Header with Title and Close Button */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-zinc-100 tracking-[-0.01em]">
              <span className="text-slate-500 dark:text-zinc-400 font-medium">Welcome to</span>
              <span className="inline-flex items-center gap-1 text-slate-900 dark:text-white font-bold tracking-tight">
                <RegaarderBrandIcon size={12} className="text-slate-900 dark:text-white" />
                <span>Regaarder</span>
              </span>
            </div>
            <div className="text-[10.5px] text-slate-400 dark:text-zinc-500">Sign in to sync your workspace</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sign-in dropdown"
            className="w-5 h-5 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={13} />
          </button>
        </div>

        {/* Social Buttons */}
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => handleSocialAuth('google')}
            disabled={authLoading}
            className="w-full h-8 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 dark:bg-zinc-800 dark:hover:bg-zinc-750 border border-slate-200/90 dark:border-zinc-700 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-200 transition-all active:scale-[0.99] cursor-pointer shadow-2xs"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
          <button
            type="button"
            onClick={() => handleSocialAuth('apple')}
            disabled={authLoading}
            className="w-full h-8 flex items-center justify-center gap-2 bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-medium transition-all active:scale-[0.99] cursor-pointer shadow-2xs"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.5-.62.71-1.16 1.85-1.01 2.96 1.12.09 2.26-.59 2.94-1.4"/>
            </svg>
            Continue with Apple
          </button>
        </div>

        {/* Hairline Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-slate-100 dark:border-zinc-800" />
          <span className="absolute px-2 bg-white dark:bg-[#1c1c1e] text-[10px] text-slate-400 dark:text-zinc-500">
            or with email
          </span>
        </div>

        {/* Tab Switcher - Styled as slightly rounded rectangle (never pill-shaped) */}
        <div className="grid grid-cols-2 p-0.5 bg-slate-100 dark:bg-zinc-850 rounded-lg border border-slate-200/50 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => { setAuthTab('login'); setAuthError(''); }}
            className={`py-1 text-[11px] font-medium rounded-md transition-all ${
              authTab === 'login'
                ? 'bg-white dark:bg-zinc-700 text-slate-800 dark:text-white shadow-2xs font-semibold'
                : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthTab('register'); setAuthError(''); }}
            className={`py-1 text-[11px] font-medium rounded-md transition-all ${
              authTab === 'register'
                ? 'bg-white dark:bg-zinc-700 text-slate-800 dark:text-white shadow-2xs font-semibold'
                : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error message */}
        {authError && (
          <div className="p-2 bg-rose-50 border border-rose-200/60 dark:bg-rose-950/30 dark:border-rose-900/40 rounded-lg text-rose-600 dark:text-rose-400 text-[10.5px] leading-snug">
            {authError}
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          {authTab === 'register' && (
            <div>
              <input
                type="text"
                placeholder="Full Name"
                value={authName}
                onChange={(e) => setAuthName(e.target.value)}
                disabled={authLoading}
                className="w-full h-8 px-2.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white dark:bg-zinc-850 dark:hover:bg-zinc-800 dark:focus:bg-zinc-850 border border-slate-200 dark:border-zinc-750 focus:border-slate-400 dark:focus:border-zinc-500 rounded-lg outline-none transition-colors text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                required
              />
            </div>
          )}
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              disabled={authLoading}
              className="w-full h-8 px-2.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white dark:bg-zinc-850 dark:hover:bg-zinc-800 dark:focus:bg-zinc-850 border border-slate-200 dark:border-zinc-750 focus:border-slate-400 dark:focus:border-zinc-500 rounded-lg outline-none transition-colors text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              disabled={authLoading}
              className="w-full h-8 px-2.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white dark:bg-zinc-850 dark:hover:bg-zinc-800 dark:focus:bg-zinc-850 border border-slate-200 dark:border-zinc-750 focus:border-slate-400 dark:focus:border-zinc-500 rounded-lg outline-none transition-colors text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full h-8 mt-1 rounded-lg bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
          >
            {authLoading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : authTab === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      </div>
    </>
  );
}
