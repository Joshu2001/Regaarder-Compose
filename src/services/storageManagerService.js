/**
 * Regaarder Storage & Data Manager Service
 * Manages device storage breakdown, selective deletion, GDPR Article 17 Erasure, and Article 20 Data Portability.
 */

export const STORAGE_CATEGORIES = [
  {
    id: 'documents',
    name: 'Documents & Workspace Data',
    description: 'Compose documents, Sheets grids, Deck presentations, Whiteboards, Tasks, and custom templates.',
    icon: 'FileText',
    color: '#7c3aed'
  },
  {
    id: 'chats',
    name: 'Chats & AI Transcripts',
    description: 'AI chat dialogues, conversation histories, Room chat transcripts, and prompt logs.',
    icon: 'MessageSquare',
    color: '#3b82f6'
  },
  {
    id: 'memory',
    name: 'Memory & Knowledge Graph',
    description: 'Extracted memory entries, cross-workspace decision indexes, and connected knowledge graph entities.',
    icon: 'Brain',
    color: '#10b981'
  },
  {
    id: 'profile',
    name: 'Personal Info & Profile Data',
    description: 'User account details, authentication tokens, team profiles, and collaborative identity.',
    icon: 'User',
    color: '#ec4899'
  },
  {
    id: 'api_keys',
    name: 'AI Keys & Integration Secrets',
    description: 'Custom Google Gemini, Anthropic Claude, and third-party API credentials stored in your browser.',
    icon: 'Key',
    color: '#f59e0b'
  },
  {
    id: 'cache',
    name: 'Local Presets & Saved Assets',
    description: 'Saved emoji presets, custom chart presets, and user dropdown templates.',
    icon: 'Layers',
    color: '#64748b'
  }
];

export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + (sizes[i] || 'MB');
}

/**
 * Parses value and checks if it contains genuine user content (not empty defaults or system flags)
 */
function evaluateUserData(key, rawVal) {
  if (!rawVal || typeof rawVal !== 'string') return null;
  const trimmed = rawVal.trim();
  if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined' || trimmed === '[]' || trimmed === '{}') {
    return null;
  }

  let parsed = null;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    parsed = trimmed;
  }

  // 1. Documents & Workspaces
  if (key.startsWith('rc.savedDoc.') || key === 'rc.documents' || key === 'regaarder_documents') {
    if (typeof parsed === 'object' && parsed !== null) {
      const keys = Object.keys(parsed);
      if (keys.length > 0) {
        return { catId: 'documents', itemCount: Array.isArray(parsed) ? parsed.length : 1 };
      }
    }
    return null;
  }

  if (key === 'rc.deckSlidesData' || key === 'regaarder_decks') {
    if (Array.isArray(parsed) && parsed.length > 0) {
      return { catId: 'documents', itemCount: parsed.length };
    }
    return null;
  }

  if (key === 'regaarder_custom_templates') {
    if (Array.isArray(parsed) && parsed.length > 0) {
      return { catId: 'documents', itemCount: parsed.length };
    }
    return null;
  }

  if (key === 'regaarder_sheets_data' || key.startsWith('regaarder_sheets')) {
    if (typeof parsed === 'object' && parsed !== null && Object.keys(parsed).length > 0) {
      return { catId: 'documents', itemCount: 1 };
    }
    return null;
  }

  if (key === 'regaarder_whiteboard' || key === 'regaarder_tasks') {
    if (Array.isArray(parsed) && parsed.length > 0) {
      return { catId: 'documents', itemCount: parsed.length };
    }
    return null;
  }

  // 2. Chats & AI Conversations
  if (key === 'rc.ai_chat_messages' || key === 'rc.ai_chat_sessions' || key === 'regaarder_ai_chats' || key === 'rc.dm.messages') {
    if (Array.isArray(parsed) && parsed.length > 0) {
      return { catId: 'chats', itemCount: parsed.length };
    } else if (typeof parsed === 'object' && parsed !== null && Object.keys(parsed).length > 0) {
      return { catId: 'chats', itemCount: Object.keys(parsed).length };
    }
    return null;
  }

  if (key === 'rc.promptHistory') {
    if (Array.isArray(parsed) && parsed.length > 0) {
      return { catId: 'chats', itemCount: parsed.length };
    }
    return null;
  }

  // 3. Memory & Knowledge Graph
  if (key === 'rc.memoryEntries' || key === 'regaarder_memory_index' || key === 'rc.dm.decisions') {
    if (Array.isArray(parsed) && parsed.length > 0) {
      return { catId: 'memory', itemCount: parsed.length };
    }
    return null;
  }

  if (key === 'regaarder_knowledge_graph') {
    if (typeof parsed === 'object' && parsed !== null && Object.keys(parsed).length > 0) {
      return { catId: 'memory', itemCount: 1 };
    }
    return null;
  }

  // 4. Personal Info & User Profile
  if (key === 'rc.user' || key === 'regaarder_user_profile') {
    if (typeof parsed === 'object' && parsed !== null && (parsed.email || parsed.name || parsed.id)) {
      return { catId: 'profile', itemCount: 1 };
    }
    return null;
  }

  if (key === 'rc.token') {
    if (typeof parsed === 'string' && parsed.length > 5) {
      return { catId: 'profile', itemCount: 1 };
    }
    return null;
  }

  // 5. AI Keys & Secrets
  if (key === 'regaarder_ai_config') {
    if (typeof parsed === 'object' && parsed !== null && (parsed.geminiApiKey || parsed.claudeApiKey)) {
      let count = 0;
      if (parsed.geminiApiKey) count++;
      if (parsed.claudeApiKey) count++;
      if (count > 0) return { catId: 'api_keys', itemCount: count };
    }
    return null;
  }

  if (key === 'rc.geminiApiKey' || key === 'rc.claudeApiKey') {
    if (typeof parsed === 'string' && parsed.length > 5) {
      return { catId: 'api_keys', itemCount: 1 };
    }
    return null;
  }

  // 6. Local Presets & Saved Assets
  if (key === 'rc.savedEmojis' || key === 'regaarder_dropdown_custom_presets' || key === 'regaarder_dashboard_presets') {
    if (Array.isArray(parsed) && parsed.length > 0) {
      return { catId: 'cache', itemCount: parsed.length };
    }
    return null;
  }

  // Not a user-data storage item (system preferences, theme toggles, dev server keys, etc.)
  return null;
}

/**
 * Analyze current storage usage across categories for real user data
 */
export function getStorageBreakdown() {
  const result = {
    totalBytes: 0,
    totalItems: 0,
    categories: {}
  };

  STORAGE_CATEGORIES.forEach(cat => {
    result.categories[cat.id] = {
      ...cat,
      bytes: 0,
      itemCount: 0,
      keys: []
    };
  });

  if (typeof window === 'undefined' || !window.localStorage) {
    return result;
  }

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      
      const val = localStorage.getItem(key) || '';
      const evaluation = evaluateUserData(key, val);
      
      if (evaluation && result.categories[evaluation.catId]) {
        const itemBytes = (key.length + val.length) * 2;
        result.categories[evaluation.catId].bytes += itemBytes;
        result.categories[evaluation.catId].itemCount += evaluation.itemCount;
        result.categories[evaluation.catId].keys.push(key);
        result.totalBytes += itemBytes;
        result.totalItems += evaluation.itemCount;
      }
    }
  } catch (err) {
    console.warn('[StorageManager] Error reading localStorage:', err);
  }

  // Calculate percentages
  Object.keys(result.categories).forEach(catId => {
    const cat = result.categories[catId];
    cat.percentage = result.totalBytes > 0 
      ? Math.round((cat.bytes / result.totalBytes) * 100) 
      : 0;
    cat.formattedBytes = formatBytes(cat.bytes);
  });

  result.formattedTotalBytes = formatBytes(result.totalBytes);

  return result;
}

/**
 * Granular deletion of selected storage categories (GDPR Art. 17 Erasure)
 */
export function deleteStorageCategories(categoryIds = []) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { success: false, deletedCount: 0, freedBytes: 0 };
  }

  let deletedCount = 0;
  let freedBytes = 0;
  const deletedCategories = [...categoryIds];

  try {
    const keysToDelete = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      const val = localStorage.getItem(key) || '';
      const evaluation = evaluateUserData(key, val);

      if (evaluation && categoryIds.includes(evaluation.catId)) {
        const itemBytes = (key.length + val.length) * 2;
        keysToDelete.push({ key, bytes: itemBytes, itemCount: evaluation.itemCount });
      }
    }

    keysToDelete.forEach(({ key, bytes, itemCount }) => {
      localStorage.removeItem(key);
      deletedCount += itemCount;
      freedBytes += bytes;
    });

    // Clear session storage if cache or all is selected
    if (categoryIds.includes('cache')) {
      sessionStorage.clear();
    }

    // Dispatch global event so active components can refresh their local states
    window.dispatchEvent(new CustomEvent('regaarder:storage-cleared', {
      detail: {
        categories: deletedCategories,
        deletedCount,
        freedBytes,
        timestamp: new Date().toISOString()
      }
    }));

    return {
      success: true,
      deletedCount,
      freedBytes,
      formattedFreedBytes: formatBytes(freedBytes),
      deletedCategories
    };
  } catch (err) {
    console.error('[StorageManager] Error during selective deletion:', err);
    return { success: false, error: err.message, deletedCount, freedBytes };
  }
}

/**
 * Export all user storage data as JSON archive (GDPR Art. 20 Data Portability)
 */
export function exportUserDataArchive() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  const archive = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    platform: 'Regaarder Compose Suite',
    gdprCompliant: true,
    data: {}
  };

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const rawVal = localStorage.getItem(key);
      const evaluation = evaluateUserData(key, rawVal);
      if (evaluation) {
        try {
          archive.data[key] = JSON.parse(rawVal);
        } catch {
          archive.data[key] = rawVal;
        }
      }
    }

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(archive, null, 2));
    const downloadAnchor = document.createElement('a');
    const filename = `regaarder-data-archive-${new Date().toISOString().slice(0, 10)}.json`;
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    return true;
  } catch (err) {
    console.error('[StorageManager] Export failed:', err);
    return false;
  }
}
