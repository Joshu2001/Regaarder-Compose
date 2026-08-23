/**
 * orbWorkspaceRAG.js
 * Cross-workspace Retrieval-Augmented Generation context builder for Regaarder Orb.
 */

export function hasOrbMention(text) {
  if (!text || typeof text !== "string") return false;
  return /\b(?:orb|@orb|\/orb|cross-workspace|all workspace|across all)\b/i.test(text);
}

export function buildOrbWorkspacePromptContext(ctx = {}) {
  if (!ctx || typeof ctx !== "object") return "";

  const sections = [];

  if (ctx.docTitle || ctx.docBodyHtml) {
    const plainDoc = (ctx.docBodyHtml || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    sections.push(`[Compose Document: "${ctx.docTitle || "Untitled"}" (ID: ${ctx.activeDocId || "active"})]\nContent: ${plainDoc.slice(0, 3000)}`);
  }

  if (ctx.sheetGrids && typeof ctx.sheetGrids === "object") {
    const activeSheet = ctx.sheetGrids[ctx.activeSheetId] || Object.values(ctx.sheetGrids)[0];
    if (activeSheet) {
      sections.push(`[Spreadsheet: "${ctx.sheetsTitle || "Sheet 1"}" (ID: ${ctx.activeSheetId || "active"})]\nData snippet: ${JSON.stringify(activeSheet).slice(0, 2500)}`);
    }
  }

  if (Array.isArray(ctx.deckSlidesData) && ctx.deckSlidesData.length > 0) {
    const slideSummary = ctx.deckSlidesData
      .slice(0, 8)
      .map((s, idx) => `Slide ${idx + 1}: ${s.title || s.headline || "Slide"} - ${s.blurb || s.subtitle || ""}`)
      .join("\n");
    sections.push(`[Deck Presentation: "${ctx.deckTitle || "Pitch Deck"}"]\n${slideSummary}`);
  }

  if (Array.isArray(ctx.tasks) && ctx.tasks.length > 0) {
    const taskSummary = ctx.tasks
      .slice(0, 10)
      .map((t) => `- [${t.completed ? "x" : " "}] ${t.title || t.text || t.name}`)
      .join("\n");
    sections.push(`[Tasks & Initiatives]\n${taskSummary}`);
  }

  if (Array.isArray(ctx.scheduleAgendaItems) && ctx.scheduleAgendaItems.length > 0) {
    const agendaSummary = ctx.scheduleAgendaItems
      .slice(0, 8)
      .map((item) => `- ${item.time || ""}: ${item.title || item.name || "Event"}`)
      .join("\n");
    sections.push(`[Schedule & Agenda]\n${agendaSummary}`);
  }

  if (sections.length === 0) return "";

  return `--- CROSS-WORKSPACE ORB CONTEXT ---\n${sections.join("\n\n")}\n--- END ORB CONTEXT ---`;
}
