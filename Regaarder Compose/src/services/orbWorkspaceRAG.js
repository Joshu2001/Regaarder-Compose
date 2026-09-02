import { extractLiveEntitiesFromWorkspace } from './orbKnowledgeGraphService';

/**
 * Orb Workspace RAG & Agent Context Provider
 * Extracts and compiles multi-app context (Docs, Sheets, Decks, Tasks, Schedule)
 * whenever @orb or /orb is invoked in AI chat, Smart Assist, or document editing.
 */

export function buildOrbWorkspacePromptContext(liveWorkspaceContext = {}) {
  const { liveEntities = [], liveEdges = [] } = extractLiveEntitiesFromWorkspace(liveWorkspaceContext);

  if (!liveEntities || liveEntities.length === 0) {
    return '\n[ORB WORKSPACE CONTEXT: Workspace is currently empty. No documents, sheets, or tasks found.]';
  }

  const sections = [];
  sections.push('\n=== [ORB CROSS-WORKSPACE INTELLIGENCE CONTEXT] ===');
  sections.push('Ground your answer strictly using the following live workspace artifacts:\n');

  liveEntities.forEach((entity, idx) => {
    const ws = (entity.workspace || entity.type || 'app').toUpperCase();
    const title = entity.title || 'Untitled';
    const author = entity.author ? ` (Author: ${entity.author})` : '';
    const content = entity.content || entity.excerpt || '';
    
    let extraMeta = '';
    if (entity.metadata?.hasFormulas && entity.metadata.formulas?.length) {
      extraMeta = `\n  - Cell Formulas: ${entity.metadata.formulas.map(f => `${f.coord}: ${f.formula}`).join(' | ')}`;
    }
    if (entity.metadata?.priority || entity.metadata?.status) {
      extraMeta = `\n  - Priority: ${entity.metadata.priority || 'Normal'}, Status: ${entity.metadata.status || 'Active'}`;
    }
    if (entity.metadata?.time) {
      extraMeta = `\n  - Scheduled Time: ${entity.metadata.time}`;
    }

    sections.push(`[${idx + 1}] [${ws}] "${title}"${author}\n  Content / Excerpt: ${content}${extraMeta}`);
  });

  if (liveEdges && liveEdges.length > 0) {
    sections.push('\n--- DISCOVERED CROSS-ARTIFACT RELATIONSHIPS ---');
    liveEdges.slice(0, 15).forEach((edge, i) => {
      sections.push(`- (${i + 1}) ${edge.label || edge.relationType} [${edge.epistemicStatus || 'verified'}]`);
    });
  }

  sections.push('=== [END ORB WORKSPACE CONTEXT] ===\n');
  return sections.join('\n');
}

/**
 * Check if a prompt references @orb or /orb
 */
export function hasOrbMention(text) {
  if (!text || typeof text !== 'string') return false;
  return /(@orb|\/orb|\borb\b\s+intelligence|\bworkspace\s+context\b)/i.test(text);
}
