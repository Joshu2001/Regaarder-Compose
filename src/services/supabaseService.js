import { supabase } from '../lib/supabaseClient';

/**
 * Service providing clean CRUD interactions for workspaces, documents, and spreadsheets.
 */
export const supabaseService = {
  // --- Health Check ---
  async testConnection() {
    try {
      const { data, error } = await supabase.from('workspaces').select('id').limit(1);
      if (error) {
        // Table might not exist yet if migration hasn't run
        return { connected: true, tablesReady: false, error: error.message };
      }
      return { connected: true, tablesReady: true, data };
    } catch (err) {
      return { connected: false, tablesReady: false, error: err.message };
    }
  },

  // --- Workspaces ---
  async getWorkspaces() {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createWorkspace(name, description = '', settings = {}) {
    const { data, error } = await supabase
      .from('workspaces')
      .insert([{ name, description, settings }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // --- Spreadsheets ---
  async getSpreadsheets(workspaceId) {
    let query = supabase.from('spreadsheets').select('*').order('updated_at', { ascending: false });
    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async saveSpreadsheet({ id, workspaceId, title, sheetsData, settings }) {
    const payload = {
      title,
      sheets_data: sheetsData,
      settings: settings || {},
      ...(workspaceId ? { workspace_id: workspaceId } : {}),
    };

    if (id) {
      const { data, error } = await supabase
        .from('spreadsheets')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('spreadsheets')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  // --- Documents ---
  async getDocuments(workspaceId) {
    let query = supabase.from('documents').select('*').order('updated_at', { ascending: false });
    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async saveDocument({ id, workspaceId, title, content, metadata }) {
    const payload = {
      title,
      content,
      metadata: metadata || {},
      ...(workspaceId ? { workspace_id: workspaceId } : {}),
    };

    if (id) {
      const { data, error } = await supabase
        .from('documents')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('documents')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  // --- Tasks ---
  async getTasks(workspaceId) {
    let query = supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (workspaceId) query = query.eq('workspace_id', workspaceId);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async saveTask(task) {
    if (task.id) {
      const { data, error } = await supabase.from('tasks').update(task).eq('id', task.id).select().single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase.from('tasks').insert([task]).select().single();
      if (error) throw error;
      return data;
    }
  },

  async deleteTask(id) {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  },

  // --- Schedule & Events ---
  async getScheduleEvents(workspaceId) {
    let query = supabase.from('schedule_events').select('*').order('start_time', { ascending: true });
    if (workspaceId) query = query.eq('workspace_id', workspaceId);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async saveScheduleEvent(event) {
    if (event.id) {
      const { data, error } = await supabase.from('schedule_events').update(event).eq('id', event.id).select().single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase.from('schedule_events').insert([event]).select().single();
      if (error) throw error;
      return data;
    }
  },

  // --- Notes & Notebooks ---
  async getNotes(workspaceId) {
    let query = supabase.from('notes').select('*').order('updated_at', { ascending: false });
    if (workspaceId) query = query.eq('workspace_id', workspaceId);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async saveNote(note) {
    if (note.id) {
      const { data, error } = await supabase.from('notes').update(note).eq('id', note.id).select().single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase.from('notes').insert([note]).select().single();
      if (error) throw error;
      return data;
    }
  },

  // --- Projects ---
  async getProjects(workspaceId) {
    let query = supabase.from('projects').select('*').order('updated_at', { ascending: false });
    if (workspaceId) query = query.eq('workspace_id', workspaceId);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async saveProject(project) {
    if (project.id) {
      const { data, error } = await supabase.from('projects').update(project).eq('id', project.id).select().single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase.from('projects').insert([project]).select().single();
      if (error) throw error;
      return data;
    }
  },

  // --- Chat & Messages ---
  async getChatConversations(workspaceId) {
    let query = supabase.from('chat_conversations').select('*').order('last_message_at', { ascending: false });
    if (workspaceId) query = query.eq('workspace_id', workspaceId);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getChatMessages(conversationId) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  async sendChatMessage(message) {
    const { data, error } = await supabase.from('chat_messages').insert([message]).select().single();
    if (error) throw error;
    return data;
  },

  // --- AI Memory & Sessions ---
  async getAiMemories(workspaceId) {
    let query = supabase.from('ai_memories').select('*').order('created_at', { ascending: false });
    if (workspaceId) query = query.eq('workspace_id', workspaceId);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async saveAiMemory(entry) {
    const { data, error } = await supabase.from('ai_memories').insert([entry]).select().single();
    if (error) throw error;
    return data;
  }
};
