import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';

/**
 * Firebase Client Configuration
 * Loaded securely via Vite environment variables
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

/**
 * Checks whether Firebase credentials have been configured in the environment.
 * Prevents initialization errors if keys are missing or set to placeholder strings.
 */
export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    !firebaseConfig.apiKey.includes('your_') &&
    !firebaseConfig.projectId.includes('your_')
  );
}

// Lazy initialization of Firebase App & Auth
let app = null;
let auth = null;

function getFirebaseAuth() {
  if (!isFirebaseConfigured()) return null;
  if (!app) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  if (!auth) {
    auth = getAuth(app);
  }
  return auth;
}

/**
 * Normalizes a Firebase User object into standard Regaarder user schema.
 */
export function formatFirebaseUser(user) {
  if (!user) return null;
  return {
    id: user.uid,
    email: user.email || '',
    name: user.displayName || (user.email ? user.email.split('@')[0] : 'User'),
    photoURL: user.photoURL || null,
    provider: user.providerData?.[0]?.providerId || 'firebase'
  };
}

/**
 * Register a new user with email and password
 */
export async function registerWithEmail(email, password, displayName) {
  const authInstance = getFirebaseAuth();
  if (!authInstance) {
    throw new Error('Firebase Auth is not configured in environment variables.');
  }

  const credential = await createUserWithEmailAndPassword(authInstance, email, password);
  if (displayName && credential.user) {
    try {
      await updateProfile(credential.user, { displayName });
    } catch (profileErr) {
      console.warn('[Firebase] Failed to update display name:', profileErr);
    }
  }

  const token = await credential.user.getIdToken();
  return {
    user: formatFirebaseUser(credential.user),
    token
  };
}

/**
 * Log in an existing user with email and password
 */
export async function loginWithEmail(email, password) {
  const authInstance = getFirebaseAuth();
  if (!authInstance) {
    throw new Error('Firebase Auth is not configured in environment variables.');
  }

  const credential = await signInWithEmailAndPassword(authInstance, email, password);
  const token = await credential.user.getIdToken();
  return {
    user: formatFirebaseUser(credential.user),
    token
  };
}

/**
 * Sign in using Google OAuth Popup
 */
export async function loginWithGoogle() {
  const authInstance = getFirebaseAuth();
  if (!authInstance) {
    throw new Error('Firebase Auth is not configured in environment variables.');
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const credential = await signInWithPopup(authInstance, provider);
  const token = await credential.user.getIdToken();
  return {
    user: formatFirebaseUser(credential.user),
    token
  };
}

/**
 * Sign in using Apple OAuth Popup
 */
export async function loginWithApple() {
  const authInstance = getFirebaseAuth();
  if (!authInstance) {
    throw new Error('Firebase Auth is not configured in environment variables.');
  }

  const provider = new OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('name');
  const credential = await signInWithPopup(authInstance, provider);
  const token = await credential.user.getIdToken();
  return {
    user: formatFirebaseUser(credential.user),
    token
  };
}

/**
 * Log out current Firebase user
 */
export async function logoutFirebase() {
  const authInstance = getFirebaseAuth();
  if (!authInstance) return;
  await signOut(authInstance);
}

/**
 * Retrieve fresh Firebase ID Token for API requests
 */
export async function getFirebaseToken(forceRefresh = false) {
  const authInstance = getFirebaseAuth();
  if (!authInstance || !authInstance.currentUser) return null;
  return await authInstance.currentUser.getIdToken(forceRefresh);
}

/**
 * Listen to auth state transitions
 */
export function onAuthChange(callback) {
  const authInstance = getFirebaseAuth();
  if (!authInstance) {
    callback(null, null);
    return () => {};
  }

  return onAuthStateChanged(authInstance, async (user) => {
    if (user) {
      const token = await user.getIdToken();
      callback(formatFirebaseUser(user), token);
    } else {
      callback(null, null);
    }
  });
}
