import { supabase } from '../lib/supabaseClient';

/**
 * Checks whether Supabase credentials have been configured in the environment.
 */
export function isSupabaseConfigured() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes('placeholder') &&
    !key.includes('placeholder')
  );
}

// Backward compatibility alias for components checking auth configuration
export const isFirebaseConfigured = isSupabaseConfigured;

/**
 * Normalizes a Supabase User object into standard Regaarder user schema.
 */
export function formatSupabaseUser(user) {
  if (!user) return null;
  const meta = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email || '',
    name: meta.full_name || meta.name || (user.email ? user.email.split('@')[0] : 'User'),
    photoURL: meta.avatar_url || meta.picture || null,
    provider: user.app_metadata?.provider || 'email'
  };
}

// Backward compatibility alias
export const formatFirebaseUser = formatSupabaseUser;

/**
 * Register a new user with email and password
 */
export async function registerWithEmail(email, password, displayName) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase Auth is not configured in environment variables.');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: displayName,
        name: displayName,
      },
    },
  });

  if (error) throw error;

  return {
    user: formatSupabaseUser(data.user),
    token: data.session?.access_token || null,
  };
}

/**
 * Log in an existing user with email and password
 */
export async function loginWithEmail(email, password) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase Auth is not configured in environment variables.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return {
    user: formatSupabaseUser(data.user),
    token: data.session?.access_token || null,
  };
}

/**
 * Sign in using Google OAuth via Supabase
 */
export async function loginWithGoogle() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase Auth is not configured in environment variables.');
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Sign in using GitHub OAuth via Supabase
 */
export async function loginWithGithub() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase Auth is not configured in environment variables.');
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Log out current Supabase user
 */
export async function logoutSupabase() {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.auth.signOut();
  if (error) console.warn('[Supabase Auth] Logout error:', error);
}

// Backward compatibility alias
export const logoutFirebase = logoutSupabase;

/**
 * Retrieve fresh Supabase JWT Access Token for API requests
 */
export async function getSupabaseToken() {
  if (!isSupabaseConfigured()) return null;
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token || null;
}

// Backward compatibility alias
export const getFirebaseToken = getSupabaseToken;

/**
 * Listen to auth state transitions
 */
export function onAuthChange(callback) {
  if (!isSupabaseConfigured()) {
    callback(null, null);
    return () => {};
  }

  // Check existing session immediately
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      callback(formatSupabaseUser(session.user), session.access_token);
    } else {
      callback(null, null);
    }
  });

  // Subscribe to auth state updates
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      callback(formatSupabaseUser(session.user), session.access_token);
    } else {
      callback(null, null);
    }
  });

  return () => {
    subscription?.unsubscribe();
  };
}
