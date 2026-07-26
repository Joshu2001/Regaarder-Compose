/**
 * ComposeAIStudio.jsx
 *
 * The AI Orchestrator — the central controller for the Compose AI Writing System.
 * Routes between 11 specialized agents, manages shared state (suggestions, statuses,
 * DNA), detects AI response completion, and applies inline editor highlights.
 *
 * Architecture:
 *   • Every agent routes through the existing handleAISubmit pipeline (source: 'chat')
 *   • Responses are captured by watching chatMessages + isComposing
 *   • Suggestion-type agents automatically add inline highlights to the editor
 *   • Ignored suggestions are stored in Writing DNA to personalize future responses
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Activity, Pen, CheckCircle2, Layout, Bot, BookOpen,
  Star, Users, Link, Shield, Lightbulb, Sparkles,
} from 'lucide-react';

import {
  AGENT_IDS, AGENT_REGISTRY, AGENT_HIGHLIGHT_CATEGORY,
  buildHealthPrompt, buildEditorPrompt, buildDesignerPrompt,
  buildLogicPrompt, buildResearchPrompt, buildReviewerPrompt,
  buildAudiencePrompt, buildConsistencyPrompt, buildCompliancePrompt,
  buildKnowledgeGapPrompt, buildWritingAgentPrompt, buildDNAAnalysisPrompt,
} from './agentConfig';
import { parseForAgent } from './parseAgentResponse';
import { useHighlights } from './useHighlights';
import { useWritingDNA } from './useWritingDNA';
import { DocumentHealthPanel } from './DocumentHealthPanel';
import { AgentDetailPanel } from './AgentDetailPanel';
import { WritingAgentPanel } from './WritingAgentPanel';
import { ReviewerPanel } from './ReviewerPanel';
import { AudiencePanel } from './AudiencePanel';
import { WritingDNAPanel } from './WritingDNAPanel';

// Maps icon name string (from agentConfig) → imported Lucide component
const ICON_MAP = {
  Activity, Pen, CheckCircle2, Layout, Bot, BookOpen,
  Star, Users, Link, Shield, Lightbulb, Sparkles,
};

export default function ComposeAIStudio({
  documentText,
  selectedText,
  editorRef,
  chatMessages,
  isComposing,
  onRunAgent,
  showToast,
  initialAgent,
}) {
  const [activeAgent,        setActiveAgent]        = useState(initialAgent || AGENT_IDS.HEALTH);
  const [pendingAgentId,     setPendingAgentId]     = useState(null);
  const [loadingAgentId,     setLoadingAgentId]     = useState(null);
  const [agentData,          setAgentData]          = useState({});
  const [suggestionStatuses, setSuggestionStatuses] = useState({});
  const [audienceResult,     setAudienceResult]     = useState(null);
  const [lastAudience,       setLastAudience]       = useState(null);

  const { dnaProfile, saveDNA, dnaMode, setDNAMode } = useWritingDNA();

  // Sync active agent when opened via slash command or navigation
  useEffect(() => {
    if (initialAgent && AGENT_REGISTRY.some(a => a.id === initialAgent)) {
      setActiveAgent(initialAgent);
    }
  }, [initialAgent]);
  const highlights = useHighlights(editorRef);

  // Tracks how many messages existed BEFORE we sent an agent query
  const msgCountBeforeQuery = useRef(0);
  const prevIsComposing     = useRef(false);

  // ── Capture AI response when composing finishes ────────────────
  useEffect(() => {
    const wasComposing = prevIsComposing.current;
    prevIsComposing.current = isComposing;

    if (!wasComposing || isComposing || !pendingAgentId) return;

    // Find the last AI message that was added after our query
    const newMessages = chatMessages.slice(msgCountBeforeQuery.current);
    const aiMsg = [...newMessages].reverse().find(m => m.sender !== 'user');

    if (aiMsg?.text) {
      const parsed = parseForAgent(pendingAgentId, aiMsg.text);
      setAgentData(prev => ({ ...prev, [pendingAgentId]: parsed }));

      // Audience agent: store plain-text result for panel preview
      if (pendingAgentId === AGENT_IDS.AUDIENCE && typeof parsed === 'string') {
        setAudienceResult(parsed.slice(0, 600));
      }

      // DNA agent: persist the profile
      if (pendingAgentId === AGENT_IDS.DNA && parsed) {
        saveDNA(parsed);
      }

      // Suggestion agents: inject inline highlights into editor
      const highlightCategory = AGENT_HIGHLIGHT_CATEGORY[pendingAgentId];
      if (highlightCategory && Array.isArray(parsed)) {
        parsed.forEach(sug => {
          if (sug.excerpt) highlights.addHighlight(sug.excerpt, sug.id, highlightCategory);
        });
      }
    }

    setLoadingAgentId(null);
    setPendingAgentId(null);
  }, [isComposing, pendingAgentId, chatMessages, highlights, saveDNA]);

  // ── Core run helper ────────────────────────────────────────────
  const dispatchAgent = useCallback((agentId, prompt) => {
    const hasContent = documentText || selectedText;
    if (!hasContent) {
      showToast?.('Write something first to run this agent.');
      return;
    }
    // Clear existing highlights from a prior run of this agent
    const prior = agentData[agentId];
    if (Array.isArray(prior)) prior.forEach(s => highlights.removeHighlight(s.id));
    if (prior?.suggestions) prior.suggestions.forEach(s => highlights.removeHighlight(s.id));

    msgCountBeforeQuery.current = chatMessages.length;
    setLoadingAgentId(agentId);
    setPendingAgentId(agentId);
    setActiveAgent(agentId);
    onRunAgent(prompt, { source: 'chat' });
  }, [documentText, selectedText, agentData, chatMessages.length, onRunAgent, highlights, showToast]);

  // ── Per-agent runner functions ─────────────────────────────────
  const dnaStyle = dnaProfile?.style ? JSON.stringify(dnaProfile.style) : null;
  const textToAnalyze = selectedText || documentText || '';

  const runHealth       = useCallback(() => dispatchAgent(AGENT_IDS.HEALTH,        buildHealthPrompt(documentText || textToAnalyze)), [dispatchAgent, documentText, textToAnalyze]);
  const runEditor       = useCallback(() => dispatchAgent(AGENT_IDS.EDITOR,        buildEditorPrompt(textToAnalyze, dnaStyle)),        [dispatchAgent, textToAnalyze, dnaStyle]);
  const runDesigner     = useCallback(() => dispatchAgent(AGENT_IDS.DESIGNER,      buildDesignerPrompt(documentText || textToAnalyze)), [dispatchAgent, documentText, textToAnalyze]);
  const runLogic        = useCallback(() => dispatchAgent(AGENT_IDS.LOGIC,         buildLogicPrompt(textToAnalyze)),                   [dispatchAgent, textToAnalyze]);
  const runResearch     = useCallback(() => dispatchAgent(AGENT_IDS.RESEARCH,      buildResearchPrompt(textToAnalyze)),                [dispatchAgent, textToAnalyze]);
  const runReviewer     = useCallback(() => dispatchAgent(AGENT_IDS.REVIEWER,      buildReviewerPrompt(documentText || textToAnalyze)),[dispatchAgent, documentText, textToAnalyze]);
  const runConsistency  = useCallback(() => dispatchAgent(AGENT_IDS.CONSISTENCY,   buildConsistencyPrompt(documentText || textToAnalyze)), [dispatchAgent, documentText, textToAnalyze]);
  const runCompliance   = useCallback(() => dispatchAgent(AGENT_IDS.COMPLIANCE,    buildCompliancePrompt(documentText || textToAnalyze, 'APA')), [dispatchAgent, documentText, textToAnalyze]);
  const runKnowledgeGap = useCallback(() => dispatchAgent(AGENT_IDS.KNOWLEDGE_GAP, buildKnowledgeGapPrompt(textToAnalyze)),            [dispatchAgent, textToAnalyze]);
  const runDNA          = useCallback(() => dispatchAgent(AGENT_IDS.DNA,           buildDNAAnalysisPrompt(documentText || textToAnalyze)), [dispatchAgent, documentText, textToAnalyze]);

  const runWritingAction = useCallback((action, tone) => {
    const text = selectedText || documentText;
    if (!text) { showToast?.('No content to transform.'); return; }
    msgCountBeforeQuery.current = chatMessages.length;
    setLoadingAgentId(AGENT_IDS.WRITING);
    setPendingAgentId(AGENT_IDS.WRITING);
    onRunAgent(buildWritingAgentPrompt(action, text, tone, dnaStyle), { source: 'chat' });
  }, [selectedText, documentText, dnaStyle, chatMessages.length, onRunAgent, showToast]);

  const runAudienceAdaptation = useCallback((audience) => {
    const text = selectedText || documentText?.slice(0, 1500);
    if (!text) return;
    setLastAudience(audience);
    msgCountBeforeQuery.current = chatMessages.length;
    setLoadingAgentId(AGENT_IDS.AUDIENCE);
    setPendingAgentId(AGENT_IDS.AUDIENCE);
    onRunAgent(buildAudiencePrompt(text, audience), { source: 'chat' });
  }, [selectedText, documentText, chatMessages.length, onRunAgent]);

  // ── Suggestion action handlers ─────────────────────────────────
  const handleApply = useCallback((suggestion) => {
    if (suggestion.fix) highlights.applyHighlight(suggestion.id, suggestion.fix);
    setSuggestionStatuses(prev => ({ ...prev, [suggestion.id]: 'applied' }));
    showToast?.('Change applied');
  }, [highlights, showToast]);

  const handleIgnore = useCallback((suggestion) => {
    highlights.removeHighlight(suggestion.id);
    setSuggestionStatuses(prev => ({ ...prev, [suggestion.id]: 'ignored' }));
    // Teach Writing DNA about intentional rejections
    // TODO Phase 2: store ignored suggestion category in DNA preferences
  }, [highlights]);

  // ── Agent runner map (for AgentDetailPanel) ────────────────────
  const AGENT_RUNNERS = {
    [AGENT_IDS.EDITOR]:        runEditor,
    [AGENT_IDS.DESIGNER]:      runDesigner,
    [AGENT_IDS.LOGIC]:         runLogic,
    [AGENT_IDS.RESEARCH]:      runResearch,
    [AGENT_IDS.CONSISTENCY]:   runConsistency,
    [AGENT_IDS.COMPLIANCE]:    runCompliance,
    [AGENT_IDS.KNOWLEDGE_GAP]: runKnowledgeGap,
  };

  // ── Agent selector tab ─────────────────────────────────────────
  const AgentTab = ({ agent }) => {
    const Icon    = ICON_MAP[agent.icon];
    const isActive = activeAgent === agent.id;
    return (
      <button
        type="button"
        onClick={() => setActiveAgent(agent.id)}
        title={agent.description}
        className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all shrink-0 ${
          isActive
            ? 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 shadow-2xs text-slate-800 dark:text-zinc-100'
            : 'border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60'
        }`}
        style={{ minWidth: 46 }}
      >
        {Icon && <Icon size={16} strokeWidth={1.5} />}
        <span className="text-[9px] font-semibold uppercase tracking-wide leading-none">{agent.label}</span>
      </button>
    );
  };

  // ── Active panel rendering ─────────────────────────────────────
  const renderActivePanel = () => {
    const isLoading = loadingAgentId === activeAgent;

    switch (activeAgent) {
      case AGENT_IDS.HEALTH:
        return (
          <DocumentHealthPanel
            healthData={agentData[AGENT_IDS.HEALTH]}
            isLoading={isLoading}
            onAnalyze={runHealth}
            onSelectAgent={setActiveAgent}
          />
        );
      case AGENT_IDS.WRITING:
        return (
          <WritingAgentPanel
            isLoading={isLoading}
            onRunAction={runWritingAction}
            selectedText={selectedText}
            hasDocument={Boolean(documentText)}
          />
        );
      case AGENT_IDS.REVIEWER:
        return (
          <ReviewerPanel
            reviewData={agentData[AGENT_IDS.REVIEWER]}
            isLoading={isLoading}
            onRunReview={runReviewer}
          />
        );
      case AGENT_IDS.AUDIENCE:
        return (
          <AudiencePanel
            isLoading={isLoading}
            onAdaptForAudience={runAudienceAdaptation}
            lastResult={audienceResult}
            lastAudience={lastAudience}
          />
        );
      case AGENT_IDS.DNA:
        return (
          <WritingDNAPanel
            dnaProfile={dnaProfile}
            isLoading={isLoading}
            onBuildProfile={runDNA}
            onSetMode={setDNAMode}
            currentMode={dnaMode}
          />
        );
      default:
        // All suggestion-type agents: Editor, Designer, Logic, Research,
        // Consistency, Compliance, Knowledge Gap
        return (
          <AgentDetailPanel
            agentId={activeAgent}
            agentData={agentData[activeAgent]}
            suggestionStatuses={suggestionStatuses}
            isLoading={isLoading}
            onBack={() => setActiveAgent(AGENT_IDS.HEALTH)}
            onRunAgent={AGENT_RUNNERS[activeAgent] || (() => showToast?.('Agent coming soon.'))}
            onPreview={highlights.previewHighlight}
            onCancelPreview={highlights.cancelPreview}
            onApply={handleApply}
            onIgnore={handleIgnore}
          />
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#18181b]">
      {/* Horizontal scrollable agent selector */}
      <div className="shrink-0 px-3 py-2.5 border-b border-slate-100 dark:border-zinc-800 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 min-w-max">
          {AGENT_REGISTRY.map(agent => (
            <AgentTab key={agent.id} agent={agent} />
          ))}
        </div>
      </div>

      {/* Active agent panel */}
      {renderActivePanel()}
    </div>
  );
}
