import { supabase } from '../lib/supabaseClient';
import { isSupabaseConfigured } from './supabaseAuthService';

const SESSIONS_LOCAL_KEY = 'regaarder_sessions_telemetry';
const APP_METRICS_KEY = 'regaarder_app_metrics';

/**
 * Telemetry & Analytics Engine for Regaarder Workspace
 * Tracks app launches, session durations, active users, trial statuses, and environment health.
 */
class TelemetryService {
  constructor() {
    this.sessionStartTime = Date.now();
    this.sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    this.isInitialized = false;
  }

  /**
   * Initializes app session tracking
   */
  async trackAppLaunch(currentUser = null) {
    if (this.isInitialized) return;
    this.isInitialized = true;

    try {
      const { posthogService } = await import('./posthogService');
      posthogService.init(currentUser);
    } catch (_e) {}

    const launchData = {
      sessionId: this.sessionId,
      launchedAt: new Date().toISOString(),
      userId: currentUser?.id || 'anonymous_user',
      userEmail: currentUser?.email || 'guest@workspace.local',
      platform: typeof navigator !== 'undefined' ? (navigator.userAgent.includes('Windows') ? 'Windows' : navigator.userAgent.includes('Mac') ? 'macOS' : 'Linux') : 'Unknown',
      clientType: typeof window !== 'undefined' && (window.electronAPI?.isElectron || navigator.userAgent.includes('Electron')) ? 'desktop_electron' : 'web_browser',
      screenResolution: typeof window !== 'undefined' && window.screen ? `${window.screen.width}x${window.screen.height}` : '1920x1080',
      devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
      appVersion: 'v2.4.2 (Production)',
      trialDaysRemaining: this.getTrialDaysRemaining(currentUser),
      subscriptionTier: currentUser?.tier || 'free'
    };

    // Store in local storage
    try {
      const stored = JSON.parse(localStorage.getItem(SESSIONS_LOCAL_KEY) || '[]');
      stored.unshift(launchData);
      localStorage.setItem(SESSIONS_LOCAL_KEY, JSON.stringify(stored.slice(0, 100)));

      // Update app metrics summary
      const metrics = JSON.parse(localStorage.getItem(APP_METRICS_KEY) || '{"totalLaunches": 0, "firstSeen": null}');
      metrics.totalLaunches = (metrics.totalLaunches || 0) + 1;
      if (!metrics.firstSeen) metrics.firstSeen = new Date().toISOString();
      metrics.lastSeen = new Date().toISOString();
      localStorage.setItem(APP_METRICS_KEY, JSON.stringify(metrics));
    } catch (_e) {}

    // Record heartbeat ping on exit
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.recordSessionExit();
      });
    }
  }

  recordSessionExit() {
    try {
      const durationSeconds = Math.round((Date.now() - this.sessionStartTime) / 1000);
      const stored = JSON.parse(localStorage.getItem(SESSIONS_LOCAL_KEY) || '[]');
      if (stored.length > 0 && stored[0].sessionId === this.sessionId) {
        stored[0].sessionDurationSeconds = durationSeconds;
        stored[0].closedAt = new Date().toISOString();
        localStorage.setItem(SESSIONS_LOCAL_KEY, JSON.stringify(stored));
      }
    } catch (_e) {}
  }

  getTrialDaysRemaining(user) {
    try {
      const trialStartDate = localStorage.getItem('regaarder_trial_start') || new Date().toISOString();
      if (!localStorage.getItem('regaarder_trial_start')) {
        localStorage.setItem('regaarder_trial_start', trialStartDate);
      }
      const elapsedDays = Math.floor((Date.now() - new Date(trialStartDate).getTime()) / (1000 * 60 * 60 * 24));
      return Math.max(0, 14 - elapsedDays);
    } catch {
      return 14;
    }
  }

  /**
   * Retrieves synthesized telemetry metrics for the founder dashboard
   */
  async getTelemetryInsights() {
    let sessions = [];
    try {
      sessions = JSON.parse(localStorage.getItem(SESSIONS_LOCAL_KEY) || '[]');
    } catch {
      sessions = [];
    }

    let metrics = { totalLaunches: sessions.length, firstSeen: new Date().toISOString() };
    try {
      const m = localStorage.getItem(APP_METRICS_KEY);
      if (m) metrics = JSON.parse(m);
    } catch {}

    const totalUsers = new Set(sessions.map(s => s.userEmail)).size || 1;
    const avgDuration = sessions.length > 0
      ? Math.round(sessions.reduce((acc, s) => acc + (s.sessionDurationSeconds || 60), 0) / sessions.length)
      : 0;

    const electronCount = sessions.filter(s => s.clientType === 'desktop_electron').length;
    const browserCount = sessions.length - electronCount;

    return {
      totalLaunches: Math.max(metrics.totalLaunches || sessions.length, sessions.length, 1),
      activeUsersCount: totalUsers,
      averageSessionDuration: `${Math.floor(avgDuration / 60)}m ${avgDuration % 60}s`,
      clientDistribution: {
        electron: electronCount || 1,
        browser: browserCount
      },
      trialDaysRemaining: this.getTrialDaysRemaining(null),
      recentSessions: sessions.slice(0, 15)
    };
  }
}

export const telemetryService = new TelemetryService();
