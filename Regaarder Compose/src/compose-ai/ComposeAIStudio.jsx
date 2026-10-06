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
  Star, Users, Link, Shield, Lightbulb,
  ChevronDown, Search, Plus, Check,
} from 'lucide-react';
import { AgentsIcon, RegaarderAiIcon } from '../components/RegaarderProductIcons';

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

// Maps icon name string (from agentConfig) → imported icon component
const ICON_MAP = {
  Activity, Pen, CheckCircle2, Layout, Bot, BookOpen,
  Star, Users, Link, Shield, Lightbulb,
  RegaarderAi: RegaarderAiIcon,
  Sparkles: RegaarderAiIcon, // Safe fallback
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

  const [customAgents, setCustomAgents] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rg_custom_ai_agents') || '[]'); }
    catch { return []; }
  });
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [newAgentName, setNewAgentName]       = useState('');
  const [newAgentDesc, setNewAgentDesc]       = useState('');
  const [newAgentPrompt, setNewAgentPrompt]   = useState('');
  const [newAgentIcon, setNewAgentIcon]       = useState('Bot');

  const allAgents = [...AGENT_REGISTRY, ...customAgents];

  // Save custom agent
  const handleCreateCustomAgent = (e) => {
    e.preventDefault();
    if (!newAgentName.trim() || !newAgentPrompt.trim()) {
      showToast?.('Agent name and prompt are required.');
      return;
    }
    const newAgent = {
      id: `custom-${Date.now()}`,
      label: newAgentName.trim(),
      icon: newAgentIcon,
      description: newAgentDesc.trim() || 'Custom AI Agent',
      prompt: newAgentPrompt.trim(),
      accentClass: 'text-violet-600',
      bgClass: 'bg-violet-50',
      isCustom: true,
    };

    const updated = [...customAgents, newAgent];
    setCustomAgents(updated);
    try { localStorage.setItem('rg_custom_ai_agents', JSON.stringify(updated)); } catch {}

    setActiveAgent(newAgent.id);
    setIsCreatingAgent(false);
    setNewAgentName('');
    setNewAgentDesc('');
    setNewAgentPrompt('');
    showToast?.(`Agent "${newAgent.label}" created successfully!`);
  };

  const handleDeleteCustomAgent = (agentId) => {
    const updated = customAgents.filter(a => a.id !== agentId);
    setCustomAgents(updated);
    try { localStorage.setItem('rg_custom_ai_agents', JSON.stringify(updated)); } catch {}
    if (activeAgent === agentId) setActiveAgent(AGENT_IDS.HEALTH);
    showToast?.('Custom agent deleted');
  };

  // Run custom agent helper
  const runCustomAgent = useCallback((customAgentObj) => {
    const text = selectedText || documentText || '';
    if (!text) { showToast?.('Write something first to run this agent.'); return; }
    const customPrompt = `You are a specialized AI agent named "${customAgentObj.label}".
Instructions: ${customAgentObj.prompt}

Analyze the document excerpt below and provide targeted suggestions for improvement.
Format your response as a valid JSON array of objects with keys: "id", "title", "excerpt", "fix", "reason".
Excerpt must be exact substring from text.

Document:
"""
${text}
"""`;
    dispatchAgent(customAgentObj.id, customPrompt);
  }, [selectedText, documentText, dispatchAgent, showToast]);

  // ── Agent tab selector ─────────────────────────────────────────
  const AgentTab = ({ agent }) => {
    const IconComponent = ICON_MAP[agent.icon] || Bot;
    const isActive = activeAgent === agent.id;
    return (
      <button
        type="button"
        onClick={() => setActiveAgent(agent.id)}
        title={agent.description}
        className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all shrink-0 relative group ${
          isActive
            ? 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 shadow-2xs text-slate-800 dark:text-zinc-100 font-medium'
            : 'border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60'
        }`}
        style={{ minWidth: 48 }}
      >
        <IconComponent size={16} strokeWidth={1.5} />
        <span className="text-[9px] font-semibold uppercase tracking-wide leading-none truncate max-w-[64px]">{agent.label}</span>
      </button>
    );
  };

  // ── Active panel rendering ─────────────────────────────────────
  const renderActivePanel = () => {
    const isLoading = loadingAgentId === activeAgent;
    const currentCustom = customAgents.find(a => a.id === activeAgent);

    if (currentCustom) {
      return (
        <AgentDetailPanel
          agentId={currentCustom.id}
          agentData={agentData[currentCustom.id]}
          suggestionStatuses={suggestionStatuses}
          isLoading={isLoading}
          onBack={() => setActiveAgent(AGENT_IDS.HEALTH)}
          onRunAgent={() => runCustomAgent(currentCustom)}
          onPreview={highlights.previewHighlight}
          onCancelPreview={highlights.cancelPreview}
          onApply={handleApply}
          onIgnore={handleIgnore}
          customAgent={currentCustom}
          onDeleteCustom={() => handleDeleteCustomAgent(currentCustom.id)}
        />
      );
    }

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

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('pointerdown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
    };
  }, [isDropdownOpen]);

  const activeAgentObj = allAgents.find(a => a.id === activeAgent) || allAgents[0];
  const ActiveIcon = ICON_MAP[activeAgentObj?.icon] || Bot;

  const filteredAgents = allAgents.filter(a =>
    a.label.toLowerCase().includes(dropdownSearch.toLowerCase()) ||
    (a.description && a.description.toLowerCase().includes(dropdownSearch.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#18181b] relative">
      {/* Executive Agent Dropdown Selector Header */}
      <div className="shrink-0 px-3.5 py-2.5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 relative z-20 flex items-center gap-2">
        <div className="relative flex-1" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(prev => !prev)}
            className="w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 shadow-2xs hover:border-violet-300 dark:hover:border-violet-600 transition-all text-left group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`p-1.5 rounded-lg ${activeAgentObj.bgClass || 'bg-violet-50 dark:bg-violet-950/50'} ${activeAgentObj.accentClass || 'text-violet-600 dark:text-violet-400'} shrink-0`}>
                <ActiveIcon size={16} strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-800 dark:text-zinc-100 truncate">
                    {activeAgentObj.label}
                  </span>
                  {activeAgentObj.isCustom && (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded-md bg-violet-100 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 border border-violet-200/60 dark:border-violet-800/60">
                      Custom
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                  {activeAgentObj.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-zinc-300">
              <ChevronDown size={15} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Dropdown Menu Panel */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 rounded-2xl border border-slate-200/80 dark:border-zinc-700/80 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-xl shadow-xl z-50 p-2 flex flex-col gap-1.5 max-h-[340px] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Search & New Agent Action Bar */}
              <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100 dark:border-zinc-700/60">
                <div className="relative flex-1">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                  <input
                    type="text"
                    value={dropdownSearch}
                    onChange={e => setDropdownSearch(e.target.value)}
                    placeholder="Search agents..."
                    className="w-full pl-7 pr-2.5 py-1.5 text-xs rounded-xl bg-slate-100/70 dark:bg-zinc-900/70 border border-transparent focus:border-violet-500 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none"
                    autoFocus
                  />
                </div>
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setIsDropdownOpen(false);
                    setIsCreatingAgent(true);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100 dark:hover:bg-violet-900/60 text-violet-600 dark:text-violet-300 text-[11px] font-semibold transition-colors shrink-0 border border-violet-200/60 dark:border-violet-800/60"
                  title="Create custom agent"
                >
                  <Plus size={13} />
                  <span>New</span>
                </button>
              </div>

              {/* Agent Options List */}
              <div className="flex-1 overflow-y-auto thin-scrollbar space-y-0.5 max-h-[250px] pr-0.5">
                {filteredAgents.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 dark:text-zinc-500">
                    No agents match "{dropdownSearch}"
                  </div>
                ) : (
                  filteredAgents.map(agent => {
                    const AgentIcon = ICON_MAP[agent.icon] || Bot;
                    const isSelected = activeAgent === agent.id;
                    return (
                      <button
                        key={agent.id}
                        type="button"
                        onPointerDown={(e) => {
                          e.preventDefault();
                          setActiveAgent(agent.id);
                          setIsDropdownOpen(false);
                          setDropdownSearch('');
                        }}
                        className={`w-full flex items-center justify-between gap-2.5 p-2 rounded-xl transition-all text-left ${
                          isSelected
                            ? 'bg-slate-100/80 dark:bg-zinc-700/60 ring-1 ring-slate-300 dark:ring-zinc-600 font-medium text-slate-900 dark:text-zinc-100'
                            : 'hover:bg-slate-50 dark:hover:bg-zinc-700/30 text-slate-700 dark:text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`p-1.5 rounded-lg ${agent.bgClass || 'bg-slate-100 dark:bg-zinc-700'} ${agent.accentClass || 'text-slate-600 dark:text-zinc-300'} shrink-0`}>
                            <AgentIcon size={15} strokeWidth={1.75} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold truncate">{agent.label}</span>
                              {agent.isCustom && (
                                <span className="px-1.5 py-0.2 text-[8px] font-bold uppercase rounded bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400">
                                  Custom
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate max-w-[200px]">
                              {agent.description}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <Check size={14} className="text-violet-600 dark:text-violet-400 shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            const evt = new KeyboardEvent('keydown', { key: 'D', ctrlKey: true, shiftKey: true, bubbles: true });
            window.dispatchEvent(evt);
          }}
          title="AI Tool Inspector & Harness API (Ctrl+Shift+D)"
          className="px-2.5 py-2 rounded-xl border border-slate-200/80 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 text-[10px] font-bold text-violet-600 dark:text-violet-400 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-zinc-700 transition-all flex items-center gap-1 shrink-0 shadow-2xs"
        >
          <Bot size={13} />
          <span>API</span>
        </button>
      </div>

      {/* Active agent panel */}
      {renderActivePanel()}

      {/* ── Create Custom Agent Modal / Sheet ────────────────────────── */}
      {isCreatingAgent && (
        <div className="absolute inset-0 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-4 flex flex-col animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <AgentsIcon className="text-violet-600" size={18} />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-100">Create Custom AI Agent</h3>
            </div>
            <button
              onClick={() => setIsCreatingAgent(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-xs font-medium px-2 py-1 rounded-md"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateCustomAgent} className="flex-1 flex flex-col gap-3.5 pt-3 overflow-y-auto thin-scrollbar">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Agent Name</label>
              <input
                type="text"
                value={newAgentName}
                onChange={e => setNewAgentName(e.target.value)}
                placeholder="e.g. Legal Advisor, SEO Specialist"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-violet-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
              <input
                type="text"
                value={newAgentDesc}
                onChange={e => setNewAgentDesc(e.target.value)}
                placeholder="Brief summary of what this agent analyzes"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Select Icon</label>
              <div className="flex gap-2">
                {['Bot', 'Shield', 'RegaarderAi', 'Pen', 'Star', 'CheckCircle2', 'Activity', 'BookOpen'].map(iconName => {
                  const IconComp = ICON_MAP[iconName] || Bot;
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setNewAgentIcon(iconName)}
                      className={`p-2 rounded-lg border transition-all ${
                        newAgentIcon === iconName
                          ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/60 text-violet-600'
                          : 'border-slate-200 dark:border-zinc-700 text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <IconComp size={16} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">System Instructions / Prompt</label>
              <textarea
                value={newAgentPrompt}
                onChange={e => setNewAgentPrompt(e.target.value)}
                placeholder="Instruct the AI on what to look for and how to analyze the text. E.g.: Analyze the document for compliance risks, missing disclosures, and legal terms..."
                className="flex-1 min-h-[100px] w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-violet-500 resize-none font-sans"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium text-xs shadow-md transition-colors shrink-0"
            >
              Create & Save Agent
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

