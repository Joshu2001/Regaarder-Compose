import { useState, useEffect } from 'react';

const STORAGE_KEY = 'regaarder_high_contrast_accessibility';

/**
 * Reads high contrast preference from localStorage
 */
export function getHighContrastPreference() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Persists high contrast preference and dispatches cross-component event
 */
export function setHighContrastPreference(enabled) {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('regaarder:contrast-change', { detail: { enabled } }));
  } catch {}
}

/**
 * React Hook to subscribe to and toggle high-contrast visual accessibility mode
 */
export function useHighContrast() {
  const [isHighContrast, setIsHighContrast] = useState(getHighContrastPreference);

  useEffect(() => {
    const handleContrastChange = (e) => {
      if (typeof e.detail?.enabled === 'boolean') {
        setIsHighContrast(e.detail.enabled);
      } else {
        setIsHighContrast(getHighContrastPreference());
      }
    };

    window.addEventListener('regaarder:contrast-change', handleContrastChange);
    return () => window.removeEventListener('regaarder:contrast-change', handleContrastChange);
  }, []);

  const toggleHighContrast = () => {
    const next = !isHighContrast;
    setIsHighContrast(next);
    setHighContrastPreference(next);
    return next;
  };

  return [isHighContrast, toggleHighContrast, setIsHighContrast];
}
