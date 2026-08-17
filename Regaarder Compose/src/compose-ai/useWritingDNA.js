/**
 * useWritingDNA.js
 *
 * Manages the user's Writing DNA profile.
 *
 * Storage strategy (per user spec):
 *   LOCAL  — session cache: last selected mode, active profile key, cached stats
 *   SERVER — permanent profile (TODO Phase 2: POST /api/writing-dna with auth token)
 *
 * For MVP, the full profile persists to localStorage under 'rc.writing_dna'.
 * A server-sync stub is included and clearly marked for Phase 2 implementation.
 */
import { useCallback, useState } from 'react';

const STORAGE_KEY = 'rc.writing_dna';

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveToStorage = (profile) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Storage quota exceeded — non-critical, proceed without persisting
  }
};

// ── Phase 2 stub: replace with real API call when auth is available ──
const syncToServer = async (_profile, _authToken) => {
  // TODO Phase 2: POST /api/writing-dna
  // await fetch('/api/writing-dna', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
  //   body: JSON.stringify(profile),
  // });
};

export const useWritingDNA = () => {
  const [dnaProfile, setDNAProfile] = useState(loadFromStorage);
  const [dnaMode, setDNAModeState] = useState('mirror');

  /**
   * Save a freshly analyzed DNA profile.
   * Appends an evolution snapshot to track writing improvement over time.
   */
  const saveDNA = useCallback((incoming) => {
    if (!incoming || typeof incoming !== 'object') return;

    const previous = loadFromStorage();
    const evolutionEntry = {
      month:          new Date().toLocaleString('default', { month: 'short', year: '2-digit' }),
      sentenceLength: incoming.rhythm?.avgSentenceWords   ?? 18,
      passiveVoice:   incoming.style?.hedging === 'low'   ? 0.04 : 0.12,
      readability:    incoming.readingLevel               ?? 12,
    };

    const merged = {
      ...incoming,
      lastUpdated: new Date().toISOString(),
      evolution: [
        ...(previous?.evolution ?? []),
        evolutionEntry,
      ].slice(-12), // retain up to 12 months of history
    };

    setDNAProfile(merged);
    saveToStorage(merged);
    syncToServer(merged, null); // Phase 2: pass real authToken here
  }, []);

  const setDNAMode = useCallback((mode, blendConfig = null) => {
    setDNAModeState(mode);
    // Persist mode preference to session cache
    try {
      const cached = JSON.parse(localStorage.getItem('rc.session_cache') || '{}');
      localStorage.setItem('rc.session_cache', JSON.stringify({
        ...cached, dnaMode: mode, dnaBlend: blendConfig,
      }));
    } catch { /* non-critical */ }
  }, []);

  const clearDNA = useCallback(() => {
    setDNAProfile(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { dnaProfile, saveDNA, clearDNA, dnaMode, setDNAMode };
};
