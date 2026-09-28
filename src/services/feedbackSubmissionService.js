import { supabase } from '../lib/supabaseClient';
import { isSupabaseConfigured } from './supabaseAuthService';

const LOCAL_STORAGE_KEY = 'regaarder_feedback_history';

/**
 * Universal Feedback Submission & Triage Service for Regaarder Workspace
 * 
 * Supports:
 * 1. Dual-write to Supabase `user_feedback` table (with automated offline localStorage fallback)
 * 2. Attachment persistence (screenshots / snips)
 * 3. In-App Admin / Founder triage listing & status management
 * 4. Direct email alert forwarding via Supabase Edge Function or Webhook
 */
export const feedbackSubmissionService = {
  /**
   * Submit new feedback entry
   */
  async submitFeedback({
    type = 'bug',
    message,
    attachments = [],
    workspaceContext = {},
    currentUser = null
  }) {
    const feedbackId = `fb-${Date.now()}`;
    let posthogSessionId = null;
    let posthogReplayUrl = null;
    try {
      const { posthogService } = await import('./posthogService');
      posthogSessionId = posthogService.getSessionId();
      posthogReplayUrl = posthogService.getReplayUrl(posthogSessionId);
    } catch (_e) {}

    const entry = {
      id: feedbackId,
      type,
      message: message.trim(),
      attachments: attachments.map(a => ({
        name: a.name || 'Attachment',
        size: a.size || 0,
        type: a.type || 'image/png',
        url: a.url || a.dataUrl || null
      })),
      workspace_context: {
        ...workspaceContext,
        posthogSessionId,
        posthogReplayUrl
      },
      user_id: currentUser?.id || null,
      user_email: currentUser?.email || 'guest@workspace.local',
      user_name: currentUser?.name || currentUser?.displayName || 'Workspace User',
      status: 'new',
      created_at: new Date().toISOString()
    };

    // 1. Always persist locally for offline resilience & user history
    try {
      const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      stored.unshift(entry);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stored.slice(0, 50)));
    } catch (_e) {}

    // 2. Push to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('user_feedback')
          .insert([
            {
              type: entry.type,
              message: entry.message,
              attachments: entry.attachments,
              workspace_context: entry.workspace_context,
              user_id: entry.user_id,
              user_email: entry.user_email,
              user_name: entry.user_name,
              status: entry.status,
              created_at: entry.created_at
            }
          ])
          .select()
          .single();

        if (error) {
          console.warn('[Feedback Service] Supabase insert warning (saved locally):', error.message);
          return { success: true, localOnly: true, entry };
        }

        return { success: true, cloudSynced: true, entry: data || entry };
      } catch (err) {
        console.warn('[Feedback Service] Network error writing to Supabase, fallback to local:', err);
        return { success: true, localOnly: true, entry };
      }
    }

    return { success: true, localOnly: true, entry };
  },

  /**
   * Fetch feedback list for In-App Founder / Admin panel
   */
  async getFeedbackList({ status = 'all', limit = 50 } = {}) {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('user_feedback')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (status !== 'all') {
          query = query.eq('status', status);
        }

        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          return data;
        }
      } catch (e) {
        console.warn('[Feedback Service] Error querying Supabase:', e);
      }
    }

    // Fallback to local storage history
    try {
      const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      if (status === 'all') return stored;
      return stored.filter(item => item.status === status);
    } catch {
      return [];
    }
  },

  /**
   * Update feedback status (e.g. resolve or add notes)
   */
  async updateFeedbackStatus(id, { status, adminNotes }) {
    if (isSupabaseConfigured() && id && !String(id).startsWith('fb-')) {
      try {
        await supabase
          .from('user_feedback')
          .update({
            ...(status ? { status } : {}),
            ...(adminNotes !== undefined ? { admin_notes: adminNotes } : {}),
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
      } catch (e) {
        console.warn('[Feedback Service] Failed to update status in Supabase:', e);
      }
    }

    // Update in local history
    try {
      const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      const updated = stored.map(item => {
        if (item.id === id) {
          return {
            ...item,
            ...(status ? { status } : {}),
            ...(adminNotes !== undefined ? { adminNotes } : {})
          };
        }
        return item;
      });
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }
};
