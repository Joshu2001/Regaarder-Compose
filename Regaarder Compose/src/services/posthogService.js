import posthog from 'posthog-js';

const POSTHOG_STORAGE_KEY = 'regaarder_posthog_settings';

/**
 * Default PostHog configuration with Apple-tier privacy & masking
 */
const DEFAULT_CONFIG = {
  enabled: true,
  maskAllInputs: true,
  maskTextSelector: '[data-private], .sensitive, input[type="password"]',
  recordCanvas: false,
  sampleRate: 1.0, // 100% of sessions
  apiHost: import.meta?.env?.VITE_POSTHOG_HOST || 'https://us.i.posthog.com'
};

class PostHogService {
  constructor() {
    this.isInitialized = false;
    this.client = posthog;
    this.sessionRecordings = [];
    this.settings = this.loadSettings();
  }

  loadSettings() {
    try {
      const stored = localStorage.getItem(POSTHOG_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch (_e) {}
    return { ...DEFAULT_CONFIG };
  }

  saveSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    try {
      localStorage.setItem(POSTHOG_STORAGE_KEY, JSON.stringify(this.settings));
    } catch (_e) {}

    // Dynamic runtime update if PostHog is active
    if (this.isInitialized && typeof window !== 'undefined') {
      if (newSettings.enabled === false) {
        this.client.stopSessionRecording();
      } else if (newSettings.enabled === true) {
        this.client.startSessionRecording();
      }
    }
  }

  /**
   * Initializes PostHog with Session Replay and PII privacy safeguards
   */
  init(currentUser = null) {
    if (typeof window === 'undefined') return;

    const apiKey = import.meta?.env?.VITE_POSTHOG_KEY || this.settings.customApiKey || '';
    const apiHost = import.meta?.env?.VITE_POSTHOG_HOST || this.settings.apiHost || 'https://us.i.posthog.com';

    if (!apiKey) {
      // Running in simulation/local staging mode
      this.isInitialized = true;
      this.recordLocalSessionSummary(currentUser, false);
      return;
    }

    try {
      this.client.init(apiKey, {
        api_host: apiHost,
        autocapture: true,
        capture_pageview: true,
        disable_session_recording: !this.settings.enabled,
        session_recording: {
          maskAllInputs: this.settings.maskAllInputs,
          maskTextSelector: this.settings.maskTextSelector,
          recordCanvas: this.settings.recordCanvas,
          sampling: {
            canvas: 0,
            network: 1
          }
        },
        loaded: (ph) => {
          this.isInitialized = true;
          if (currentUser?.id) {
            ph.identify(currentUser.id, {
              email: currentUser.email || 'guest@workspace.local',
              name: currentUser.name || currentUser.displayName || 'Workspace User',
              tier: currentUser.tier || 'free'
            });
          }
          this.recordLocalSessionSummary(currentUser, true);
        }
      });
    } catch (err) {
      console.warn('[PostHog] Initialization warning:', err);
    }
  }

  /**
   * Stores a local trace of session metadata for the admin replay inspector
   */
  recordLocalSessionSummary(currentUser, isLive = false) {
    try {
      const sessionId = this.getSessionId() || `ph_sess_${Date.now()}`;
      const recordingUrl = this.getReplayUrl(sessionId);

      const sessionMeta = {
        sessionId,
        recordingUrl,
        userEmail: currentUser?.email || 'guest@workspace.local',
        userId: currentUser?.id || 'guest',
        startedAt: new Date().toISOString(),
        isLive,
        status: isLive ? 'Recording Active' : 'Staged (Add VITE_POSTHOG_KEY to stream)'
      };

      const SESSIONS_KEY = 'regaarder_posthog_recent_sessions';
      const stored = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
      const filtered = stored.filter(s => s.sessionId !== sessionId);
      filtered.unshift(sessionMeta);
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(filtered.slice(0, 30)));
    } catch (_e) {}
  }

  /**
   * Returns current active session ID
   */
  getSessionId() {
    try {
      if (this.client && typeof this.client.get_session_id === 'function') {
        const id = this.client.get_session_id();
        if (id) return id;
      }
    } catch (_e) {}
    return null;
  }

  /**
   * Generates direct link to watch the session replay in PostHog Web Console
   */
  getReplayUrl(sessionId) {
    const id = sessionId || this.getSessionId();
    if (!id) return null;
    const host = this.settings.apiHost || 'https://us.i.posthog.com';
    const baseUrl = host.replace('https://us.i.', 'https://us.').replace('https://eu.i.', 'https://eu.');
    return `${baseUrl}/replay/${id}`;
  }

  /**
   * Retrieve list of recent sessions for the admin panel
   */
  getRecentSessions() {
    try {
      const SESSIONS_KEY = 'regaarder_posthog_recent_sessions';
      return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
    } catch (_e) {
      return [];
    }
  }

  /**
   * Capture custom in-app event with active recording attached
   */
  capture(eventName, properties = {}) {
    try {
      if (this.client && typeof this.client.capture === 'function') {
        this.client.capture(eventName, {
          ...properties,
          timestamp: new Date().toISOString()
        });
      }
    } catch (_e) {}
  }
}

export const posthogService = new PostHogService();
export default posthogService;
