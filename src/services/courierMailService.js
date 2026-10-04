import { supabase } from '../lib/supabaseClient';
import { isSupabaseConfigured } from './supabaseAuthService';

const LOCAL_STORAGE_COURIER_KEY = 'regaarder_courier_messages';

/**
 * Service to store and retrieve support messages and email submissions
 * Dual-layer: Supabase (cloud synced across admin machines) + LocalStorage (instant offline resilience)
 */
export const courierMailService = {
  /**
   * Save a support message to courier store
   */
  async recordInboundMessage({ from, to = 'support@regaarder.com', subject, body, html = null, source = 'in_app' }) {
    const entry = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      from,
      to,
      subject: subject || '(No Subject)',
      body: body || '',
      html: html,
      source,
      receivedAt: new Date().toISOString(),
      forwardedTo: 'regaarder@gmail.com',
      status: 'received'
    };

    // 1. LocalStorage immediate write
    try {
      const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_COURIER_KEY) || '[]');
      stored.unshift(entry);
      localStorage.setItem(LOCAL_STORAGE_COURIER_KEY, JSON.stringify(stored.slice(0, 100)));
    } catch (err) {
      console.warn('[Courier Service] Failed to write to localStorage:', err);
    }

    // 2. Supabase write if connected
    if (isSupabaseConfigured && isSupabaseConfigured()) {
      try {
        await supabase.from('support_messages').insert([
          {
            id: entry.id,
            from_email: entry.from,
            to_email: entry.to,
            subject: entry.subject,
            body: entry.body,
            received_at: entry.receivedAt,
            forwarded_to: entry.forwardedTo
          }
        ]);
      } catch (err) {
        console.warn('[Courier Service] Supabase insert error:', err);
      }
    }

    return entry;
  },

  /**
   * Fetch all messages
   */
  async getMessages() {
    let cloudMessages = [];

    if (isSupabaseConfigured && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('support_messages')
          .select('*')
          .order('received_at', { ascending: false })
          .limit(50);
        if (!error && Array.isArray(data)) {
          cloudMessages = data.map((d) => ({
            id: d.id,
            from: d.from_email || d.from,
            to: d.to_email || d.to,
            subject: d.subject,
            body: d.body,
            receivedAt: d.received_at || d.receivedAt,
            forwardedTo: d.forwarded_to || 'regaarder@gmail.com',
            status: 'received'
          }));
        }
      } catch (err) {
        console.warn('[Courier Service] Supabase read error:', err);
      }
    }

    let localMessages = [];
    try {
      localMessages = JSON.parse(localStorage.getItem(LOCAL_STORAGE_COURIER_KEY) || '[]');
    } catch {
      localMessages = [];
    }

    // Merge and deduplicate by id
    const map = new Map();
    [...cloudMessages, ...localMessages].forEach((m) => {
      if (m?.id && !map.has(m.id)) {
        map.set(m.id, m);
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
    );
  }
};
