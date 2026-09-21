import { supabase } from '../lib/supabaseClient';

/**
 * Universal Cloud Backup Service for Regaarder Workspace.
 * Gathers all workspace states across documents, sheets, decks, whiteboards,
 * tasks, schedules, chat/relays, Memora knowledge graph, and presets,
 * and pushes point-in-time snapshots or granular items to Supabase PostgreSQL.
 */
export const cloudBackupService = {
  /**
   * Harvests all local data from localStorage into a structured snapshot
   */
  collectLocalState() {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }

    const safeParse = (key, fallback = null) => {
      try {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : fallback;
      } catch {
        return localStorage.getItem(key) || fallback;
      }
    };

    // 1. Documents & Workspaces
    const documents = safeParse('regaarder_documents_v1', safeParse('rc.documents', []));
    const sheetsData = safeParse('regaarder_sheets_data', {});
    const customTemplates = safeParse('regaarder_custom_templates', []);
    const starredDocs = safeParse('rc.starredDocs', []);
    const pinnedDocs = safeParse('rc.pinnedDocs', []);

    // 2. Presentations & Decks
    const decks = safeParse('rc.deckSlidesData', safeParse('regaarder_decks', []));

    // 3. Whiteboards & Spatial Canvas
    const whiteboard = safeParse('regaarder_whiteboard', []);
    const whiteboardTopology = safeParse('regaarder_whiteboard_topology_v1', {});

    // 4. Tasks & Schedules
    const tasks = safeParse('rc.workspaceTasks', []);
    const scheduleEvents = safeParse('regaarder_schedule_events_v1', []);

    // 5. Notes & Notebooks
    const notebookNotes = safeParse('regaarder_notebook_notes', []);
    const defaultRuling = localStorage.getItem('regaarder_notes_default_ruling') || 'none';
    const defaultThickness = localStorage.getItem('regaarder_notes_default_thickness') || '1';

    // 6. Relay Chat & Direct Messages
    const relayConversations = safeParse('regaarder_relay_conversations_v1', safeParse('rc.relayConversations', []));
    const relayMessages = safeParse('regaarder_relay_messages_v1', safeParse('rc.relayMessages', {}));
    const aiChatSessions = safeParse('regaarder_ai_chat_sessions_v1', safeParse('rc.ai_chat_sessions', []));

    // 7. Memora & AI Memory
    const memoryInquiries = safeParse('regaarder_memory_inquiries_v1', []);
    const memoryEntries = safeParse('rc.memoryEntries', safeParse('regaarder_memory_index', []));
    const knowledgeGraph = safeParse('regaarder_knowledge_graph', {});

    // 8. Brand Rules & Personas
    const brandRules = safeParse('regaarder_workspace_brand_rules', {});
    const rawBrandMarkdown = localStorage.getItem('regaarder_raw_brand_markdown') || '';
    const personas = safeParse('regaarder_personas_list_v2', safeParse('regaarder_personas_list', []));
    const activePersona = safeParse('regaarder_active_persona_v2', safeParse('regaarder_active_persona', null));

    // 9. Presets & Dashboards
    const dropdownPresets = safeParse('regaarder_dropdown_custom_presets', []);
    const dashboardPresets = safeParse('regaarder_dashboard_presets', []);

    const snapshot = {
      timestamp: new Date().toISOString(),
      documents,
      sheetsData,
      customTemplates,
      starredDocs,
      pinnedDocs,
      decks,
      whiteboard,
      whiteboardTopology,
      tasks,
      scheduleEvents,
      notes: {
        items: notebookNotes,
        defaultRuling,
        defaultThickness,
      },
      relay: {
        conversations: relayConversations,
        messages: relayMessages,
        aiSessions: aiChatSessions,
      },
      memora: {
        inquiries: memoryInquiries,
        entries: memoryEntries,
        knowledgeGraph,
      },
      brand: {
        rules: brandRules,
        markdown: rawBrandMarkdown,
        personas,
        activePersona,
      },
      presets: {
        dropdowns: dropdownPresets,
        dashboards: dashboardPresets,
      },
    };

    const itemCounts = {
      documents: Array.isArray(documents) ? documents.length : 1,
      tasks: Array.isArray(tasks) ? tasks.length : 0,
      scheduleEvents: Array.isArray(scheduleEvents) ? scheduleEvents.length : 0,
      decks: Array.isArray(decks) ? decks.length : 0,
      relayConversations: Array.isArray(relayConversations) ? relayConversations.length : 0,
      memoraEntries: Array.isArray(memoryEntries) ? memoryEntries.length : 0,
    };

    return { snapshot, itemCounts };
  },

  /**
   * Upload a complete point-in-time workspace snapshot to Supabase PostgreSQL
   */
  async createFullBackup(label = 'Manual Cloud Backup', workspaceId = null) {
    const local = this.collectLocalState();
    if (!local) throw new Error('No local storage data available to backup.');

    const jsonString = JSON.stringify(local.snapshot);
    const byteSize = new Blob([jsonString]).size;

    const payload = {
      label,
      version: '1.0.0',
      snapshot: local.snapshot,
      item_counts: local.itemCounts,
      byte_size: byteSize,
      ...(workspaceId ? { workspace_id: workspaceId } : {}),
    };

    const { data, error } = await supabase
      .from('workspace_backups')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Retrieve list of cloud backups stored in PostgreSQL
   */
  async listBackups(workspaceId = null) {
    let query = supabase
      .from('workspace_backups')
      .select('id, label, version, item_counts, byte_size, created_at')
      .order('created_at', { ascending: false });

    if (workspaceId) query = query.eq('workspace_id', workspaceId);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Restore a backup snapshot back to browser localStorage
   */
  async restoreBackup(backupId) {
    const { data, error } = await supabase
      .from('workspace_backups')
      .select('snapshot')
      .eq('id', backupId)
      .single();

    if (error) throw error;
    if (!data?.snapshot) throw new Error('Backup snapshot is empty or not found.');

    const snap = data.snapshot;

    if (snap.documents) localStorage.setItem('regaarder_documents_v1', JSON.stringify(snap.documents));
    if (snap.sheetsData) localStorage.setItem('regaarder_sheets_data', JSON.stringify(snap.sheetsData));
    if (snap.customTemplates) localStorage.setItem('regaarder_custom_templates', JSON.stringify(snap.customTemplates));
    if (snap.starredDocs) localStorage.setItem('rc.starredDocs', JSON.stringify(snap.starredDocs));
    if (snap.pinnedDocs) localStorage.setItem('rc.pinnedDocs', JSON.stringify(snap.pinnedDocs));
    if (snap.decks) localStorage.setItem('rc.deckSlidesData', JSON.stringify(snap.decks));
    if (snap.whiteboard) localStorage.setItem('regaarder_whiteboard', JSON.stringify(snap.whiteboard));
    if (snap.whiteboardTopology) localStorage.setItem('regaarder_whiteboard_topology_v1', JSON.stringify(snap.whiteboardTopology));
    if (snap.tasks) localStorage.setItem('rc.workspaceTasks', JSON.stringify(snap.tasks));
    if (snap.scheduleEvents) localStorage.setItem('regaarder_schedule_events_v1', JSON.stringify(snap.scheduleEvents));
    if (snap.notes?.items) localStorage.setItem('regaarder_notebook_notes', JSON.stringify(snap.notes.items));
    if (snap.relay?.conversations) localStorage.setItem('regaarder_relay_conversations_v1', JSON.stringify(snap.relay.conversations));
    if (snap.relay?.messages) localStorage.setItem('regaarder_relay_messages_v1', JSON.stringify(snap.relay.messages));
    if (snap.memora?.entries) localStorage.setItem('regaarder_memory_index', JSON.stringify(snap.memora.entries));
    if (snap.brand?.rules) localStorage.setItem('regaarder_workspace_brand_rules', JSON.stringify(snap.brand.rules));
    if (snap.brand?.personas) localStorage.setItem('regaarder_personas_list_v2', JSON.stringify(snap.brand.personas));

    window.dispatchEvent(new CustomEvent('regaarder:storage-restored', { detail: { backupId } }));
    return true;
  }
};
