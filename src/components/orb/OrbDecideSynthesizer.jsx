import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  AlertTriangle, CheckCircle2, Clock, ArrowRight,
  TrendingUp, HelpCircle, FileText, Table, Presentation, Video,
  CheckSquare, ShieldAlert, Plus, Layers, Search, SlidersHorizontal,
  GitBranch, Check, Compass, ShieldCheck, Loader2, ChevronDown,
  Settings, Server, Cpu, Sparkles, Wifi, WifiOff, X, Key, RefreshCw,
  ExternalLink, Eye, Maximize2, Minimize2, Network, Shield, Scale,
  BookOpen, Target, Activity, AlertCircle, ArrowUpRight, Zap, MessageSquare
} from 'lucide-react';
import { RegaarderProductIcon, RegaarderAiIcon } from '../RegaarderProductIcons';
import OrbDecideSelectionPill from './OrbDecideSelectionPill';
import { synthesizeStrategicDecision } from '../../services/orbKnowledgeGraphService';
import { 
  generateOrbDecisionSynthesis, 
  getSavedAiConfig, 
  saveAiConfig, 
  detectLocalLLMServers, 
  CLOUD_AI_MODELS, 
  DEFAULT_AI_CONFIG 
} from '../../services/orbAiService';

export default function OrbDecideSynthesizer({
  initialQuestion = '',
  entities = [],
  edges = [],
  highContrast = false,
  onNavigateToWorkspace,
  onAddActionToTasks
}) {
  const [question, setQuestion] = useState(initialQuestion || '');
  const [activeQuery, setActiveQuery] = useState(initialQuestion || '');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisStepText, setSynthesisStepText] = useState('');
  const [addedTaskIds, setAddedTaskIds] = useState(new Set());
  const [liveSynthesis, setLiveSynthesis] = useState(null);
  
  // Progressive disclosure tab selection
  // 'none' (default prose + key findings only) | 'evidence' | 'contradictions' | 'blindspots' | 'challenge' | 'lenses' | 'changeView' | 'visualize' | 'actions'
  const [activeDisclosureSection, setActiveDisclosureSection] = useState('none');
  const [selectedVisualNode, setSelectedVisualNode] = useState(null);
  const [visualMode, setVisualMode] = useState('contradiction_map');

  // Multi-provider & Local LLM state
  const [aiConfig, setAiConfig] = useState(getSavedAiConfig);
  const [localServers, setLocalServers] = useState([]);
  const [isDetectingServers, setIsDetectingServers] = useState(false);
  const [isModelPickerOpen, setIsModelPickerOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [showConfidenceExplainer, setShowConfidenceExplainer] = useState(false);

  // Text selection & Quote Reply state
  const [selectionState, setSelectionState] = useState(null);
  const [activeQuoteContext, setActiveQuoteContext] = useState(null);
  
  const timerRef = useRef(null);
  const modelPickerRef = useRef(null);
  const decideContainerRef = useRef(null);
  const queryInputRef = useRef(null);

  // Probe local inference servers (Ollama, LM Studio) on mount
  const refreshLocalServers = async () => {
    setIsDetectingServers(true);
    try {
      const servers = await detectLocalLLMServers();
      setLocalServers(servers);
    } catch (e) {
      console.warn('Failed to detect local LLMs:', e);
    } finally {
      setIsDetectingServers(false);
    }
  };

  useEffect(() => {
    refreshLocalServers();
  }, []);

  // Dismiss model picker on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modelPickerRef.current && !modelPickerRef.current.contains(e.target)) {
        setIsModelPickerOpen(false);
      }
    };
    if (isModelPickerOpen) {
      document.addEventListener('pointerdown', handleOutsideClick);
      return () => document.removeEventListener('pointerdown', handleOutsideClick);
    }
  }, [isModelPickerOpen]);

  // Sync external question if provided
  useEffect(() => {
    if (initialQuestion && initialQuestion.trim() && initialQuestion !== activeQuery) {
      setQuestion(initialQuestion.trim());
      triggerSynthesize(initialQuestion.trim());
    }
  }, [initialQuestion]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // ── Highlight / Text Selection Detection ──
  useEffect(() => {
    const handleSelectionCheck = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        return;
      }
      const text = selection.toString().trim();
      if (text.length < 2) {
        setSelectionState(null);
        return;
      }

      // Ensure selection originated within the reasoning canvas
      const anchorNode = selection.anchorNode;
      if (!decideContainerRef.current || !anchorNode || !decideContainerRef.current.contains(anchorNode)) {
        return;
      }

      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;

        const centerX = rect.left + rect.width / 2;
        const isFlipped = rect.top < 120;
        const targetY = isFlipped ? rect.bottom : rect.top;
        const clampedX = Math.max(190, Math.min(window.innerWidth - 190, centerX));

        setSelectionState({
          text,
          x: clampedX,
          y: targetY,
          isFlipped
        });
      } catch (err) {
        console.warn('Failed to calculate selection position:', err);
      }
    };

    const handleMouseUp = () => {
      setTimeout(handleSelectionCheck, 30);
    };

    const handleDocPointerDown = (e) => {
      // If clicking outside and selection is collapsed
      const selection = window.getSelection();
      if (selection && selection.isCollapsed) {
        setSelectionState(null);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('pointerup', handleMouseUp);
    document.addEventListener('pointerdown', handleDocPointerDown);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('pointerup', handleMouseUp);
      document.removeEventListener('pointerdown', handleDocPointerDown);
    };
  }, []);

  // Selection Action Handlers
  const handleSelectionReply = (quoteText) => {
    setActiveQuoteContext(quoteText);
    setSelectionState(null);
    window.getSelection()?.removeAllRanges();
    setTimeout(() => {
      queryInputRef.current?.focus();
    }, 50);
  };

  const handleSelectionExplain = (quoteText) => {
    setActiveQuoteContext(quoteText);
    setSelectionState(null);
    window.getSelection()?.removeAllRanges();
    const prompt = `Explain the strategic significance, context, and implications of: "${quoteText}"`;
    setQuestion(prompt);
    triggerSynthesize(prompt);
  };

  const handleSelectionChallenge = (quoteText) => {
    setActiveQuoteContext(quoteText);
    setSelectionState(null);
    window.getSelection()?.removeAllRanges();
    const prompt = `Challenge this claim, stress-test the underlying assumptions, and evaluate counter-evidence for: "${quoteText}"`;
    setQuestion(prompt);
    triggerSynthesize(prompt);
  };

  const handleSelectionAskQuestion = (inquiryPrompt, quoteText) => {
    setActiveQuoteContext(quoteText);
    setSelectionState(null);
    window.getSelection()?.removeAllRanges();
    const combinedPrompt = `[Regarding "${quoteText}"]: ${inquiryPrompt}`;
    setQuestion(inquiryPrompt);
    triggerSynthesize(combinedPrompt);
  };

  const synthesis = useMemo(() => {
    if (liveSynthesis) return liveSynthesis;
    if (!activeQuery) return null;
    return synthesizeStrategicDecision(activeQuery, { entities, edges });
  }, [liveSynthesis, activeQuery, entities, edges]);

  // Multi-stage animated synthesis execution with real AI integration
  const triggerSynthesize = async (targetQuery) => {
    const queryText = (targetQuery || question).trim();
    if (!queryText) return;

    setIsSynthesizing(true);
    const activeModelName = aiConfig.activeModel || aiConfig.geminiModel || aiConfig.provider;
    setSynthesisStepText(`Retrieving and normalizing workspace claims (${activeModelName})...`);

    setTimeout(() => {
      setSynthesisStepText('Reconciling cross-artifact evidence & evaluating materiality...');
    }, 200);

    setTimeout(() => {
      setSynthesisStepText(`Synthesizing strategic reasoning via ${aiConfig.provider.toUpperCase()}...`);
    }, 450);

    try {
      const result = await generateOrbDecisionSynthesis({
        question: queryText,
        entities,
        edges,
        customConfig: aiConfig
      });
      setLiveSynthesis(result);
      setActiveQuery(queryText);
      if (result?.visualReasoning?.visualType) {
        setVisualMode(result.visualReasoning.visualType);
      }
    } catch (err) {
      console.warn('Live AI synthesis failed, falling back to deterministic reasoning:', err);
      const fallback = synthesizeStrategicDecision(queryText, { entities, edges });
      setLiveSynthesis(fallback);
      setActiveQuery(queryText);
    } finally {
      setIsSynthesizing(false);
      setSynthesisStepText('');
    }
  };

  const handleQuerySubmit = (e) => {
    e?.preventDefault();
    if (!question.trim()) return;
    const finalQuery = activeQuoteContext 
      ? `[Regarding "${activeQuoteContext}"]: ${question.trim()}`
      : question.trim();
    triggerSynthesize(finalQuery);
  };

  // Derive genuine inquiries from workspace entities
  const liveInquiries = useMemo(() => {
    const inquiries = [];
    const docEntities = entities.filter(e => e.type === 'document' || e.workspace === 'compose');
    const sheetEntities = entities.filter(e => e.type === 'sheet' || e.workspace === 'sheets');
    const taskEntities = entities.filter(e => e.type === 'task');

    if (docEntities.length > 0) {
      const activeDoc = docEntities[0];
      inquiries.push(`What strategic insights or risks emerge from "${activeDoc.title || 'Active Strategy'}"?`);
    }

    if (sheetEntities.length > 0) {
      const activeSheet = sheetEntities[0];
      inquiries.push(`Reconcile financial assumptions and budget allocations in "${activeSheet.title || 'Financial Model'}"`);
    }

    if (taskEntities.length > 0) {
      inquiries.push('What critical bottlenecks or unassigned deliverables gate our Q4 roadmap?');
    }

    if (inquiries.length < 4) {
      inquiries.push(
        'What cross-workspace contradictions exist across active strategy memos and sheets?',
        'Challenge our growth strategy and stress-test required conversion assumptions'
      );
    }

    return inquiries.slice(0, 4);
  }, [entities]);

  // Active Model Label
  const currentModelLabel = useMemo(() => {
    if (aiConfig.provider === 'ollama') {
      return `Ollama (${aiConfig.ollamaModel || 'Local'})`;
    }
    if (aiConfig.provider === 'lmstudio') {
      return `LM Studio (${aiConfig.lmstudioModel || 'Local'})`;
    }
    if (aiConfig.provider === 'custom') {
      return `Custom LLM (${aiConfig.customModel || 'Local'})`;
    }
    const found = CLOUD_AI_MODELS.find(m => m.id === (aiConfig.activeModel || aiConfig.geminiModel));
    return found ? found.name : 'Gemini 1.5 Pro';
  }, [aiConfig]);

  const isLocalActive = ['ollama', 'lmstudio', 'custom'].includes(aiConfig.provider);

  // Helper to open source document
  const handleOpenSource = (sourceTitle, entityId) => {
    if (!onNavigateToWorkspace) return;
    const matched = entities.find(e => e.id === entityId || e.title === sourceTitle);
    if (matched) {
      onNavigateToWorkspace({ workspace: matched.workspace || matched.type || 'compose', entityId: matched.id });
    } else {
      onNavigateToWorkspace({ workspace: 'compose' });
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-transparent">
      {/* ── Query Bar Header: Airy & Floating with Model Selector ── */}
      <div className="px-7 py-3.5 border-b border-black/[0.04] dark:border-white/[0.05] bg-white/35 dark:bg-zinc-950/35 backdrop-blur-md shrink-0 relative z-30">
        <form onSubmit={handleQuerySubmit} className="flex flex-col gap-2 max-w-4xl mx-auto">
          {/* Active Quoted Selection Context Pill */}
          {activeQuoteContext && (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-violet-50/90 dark:bg-violet-950/60 border border-violet-200/80 dark:border-violet-800/60 text-xs text-violet-950 dark:text-violet-200 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7C5ACF] dark:bg-[#a78bfa] shrink-0" />
                <span className="font-semibold text-[10.5px] uppercase tracking-wider text-[#7C5ACF] dark:text-[#a78bfa] shrink-0">
                  Replying to Selection:
                </span>
                <span className="truncate italic text-[11.5px] text-slate-700 dark:text-zinc-300">
                  "{activeQuoteContext}"
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveQuoteContext(null)}
                className="p-1 rounded-lg hover:bg-violet-200/60 dark:hover:bg-violet-900/60 text-violet-600 dark:text-violet-400 transition-colors cursor-pointer shrink-0 ml-2"
                title="Remove quoted selection"
              >
                <X size={12} />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2.5">
            {/* Main Inquiry Input */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
              <input
                ref={queryInputRef}
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={activeQuoteContext ? "Ask a follow-up inquiry about this selection..." : "Ask an executive question or evaluate strategy..."}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-[#7C5ACF] dark:focus:border-[#a78bfa] focus:shadow-[0_4px_16px_rgba(124,90,207,0.06)] transition-all"
              />
            </div>

          {/* Model Selector Pill */}
          <div className="relative shrink-0" ref={modelPickerRef}>
            <button
              type="button"
              onClick={() => setIsModelPickerOpen(!isModelPickerOpen)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-xs font-medium cursor-pointer select-none ${
                isModelPickerOpen
                  ? 'border-[#7C5ACF] bg-white dark:bg-zinc-900 ring-2 ring-[#7C5ACF]/20 text-[#7C5ACF] dark:text-[#a78bfa]'
                  : 'border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 hover:border-slate-300 dark:hover:border-zinc-700'
              }`}
              title="Select AI Model or Local Inference Engine"
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${isLocalActive ? 'bg-emerald-500 animate-pulse' : 'bg-[#7C5ACF]'}`} />
              <span className="truncate max-w-[130px] font-semibold">{currentModelLabel}</span>
              <ChevronDown size={12} className={`text-slate-400 transition-transform ${isModelPickerOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Model Picker Menu */}
            {isModelPickerOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-[0_12px_36px_rgba(0,0,0,0.12)] p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between px-2.5 py-1.5 mb-1 border-b border-black/[0.04] dark:border-white/[0.04]">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-zinc-500">
                    Inference Engine
                  </span>
                  <button
                    type="button"
                    onClick={refreshLocalServers}
                    disabled={isDetectingServers}
                    className="flex items-center gap-1 text-[10.5px] text-[#7C5ACF] dark:text-[#a78bfa] hover:underline cursor-pointer"
                  >
                    <RefreshCw size={11} className={isDetectingServers ? 'animate-spin' : ''} />
                    <span>Scan Local</span>
                  </button>
                </div>

                {/* Local Servers */}
                <div className="space-y-1 my-1.5">
                  <span className="text-[9.5px] uppercase font-bold text-slate-400 dark:text-zinc-500 px-2">Local On-Device</span>
                  {localServers.length === 0 ? (
                    <div className="px-2 py-1.5 text-[11px] text-slate-400 dark:text-zinc-500 italic">
                      No local servers detected (Ollama / LM Studio)
                    </div>
                  ) : (
                    localServers.map((srv, idx) => (
                      <div key={idx} className="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-zinc-200">
                          <span>{srv.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded ${srv.isOnline ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'}`}>
                            {srv.isOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                        {srv.models?.map((m, mIdx) => (
                          <button
                            key={mIdx}
                            type="button"
                            onClick={() => {
                              const updated = saveAiConfig({ provider: srv.provider, ollamaModel: m.id, activeModel: m.id });
                              setAiConfig(updated);
                              setIsModelPickerOpen(false);
                            }}
                            className="w-full mt-1 text-left px-2 py-1 rounded text-[11.5px] hover:bg-violet-50 dark:hover:bg-violet-950/40 text-slate-600 dark:text-zinc-300 flex items-center justify-between"
                          >
                            <span className="truncate">{m.name}</span>
                            {aiConfig.activeModel === m.id && <Check size={12} className="text-[#7C5ACF]" />}
                          </button>
                        ))}
                      </div>
                    ))
                  )}
                </div>

                {/* Cloud Providers */}
                <div className="space-y-0.5 mt-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.04]">
                  <span className="text-[9.5px] uppercase font-bold text-slate-400 dark:text-zinc-500 px-2">Cloud Models</span>
                  {CLOUD_AI_MODELS.slice(0, 5).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        const updated = saveAiConfig({ provider: m.provider, activeModel: m.id, [m.provider + 'Model']: m.id });
                        setAiConfig(updated);
                        setIsModelPickerOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs text-slate-700 dark:text-zinc-200 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold block leading-none">{m.name}</span>
                        <span className="text-[10px] text-slate-400">{m.providerName} • {m.tier}</span>
                      </div>
                      {(aiConfig.activeModel === m.id || (!aiConfig.activeModel && m.id === 'gemini-1.5-pro')) && (
                        <Check size={13} className="text-[#7C5ACF]" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Footer settings trigger */}
                <div className="pt-2 mt-2 border-t border-black/[0.04] dark:border-white/[0.04]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModelPickerOpen(false);
                      setIsConfigModalOpen(true);
                    }}
                    className="w-full py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200/80 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Settings size={12} />
                    <span>Configure API Keys & Endpoints</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Synthesize CTA Button */}
          <button
            type="submit"
            disabled={isSynthesizing || !question.trim()}
            className={`px-4 py-2.5 rounded-xl bg-[#7C5ACF] hover:bg-[#6b47c0] text-white text-xs font-semibold active:scale-[0.98] transition-all shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs ${
              isSynthesizing ? 'opacity-90 cursor-wait' : ''
            }`}
            title="Synthesize strategic decision briefing"
          >
            {isSynthesizing ? (
              <>
                <RegaarderAiIcon size={13} className="animate-spin text-white shrink-0" />
                <span>Reasoning...</span>
              </>
            ) : (
              <>
                <span>Synthesize</span>
                <ArrowRight size={12} />
              </>
            )}
          </button>
        </div>
      </form>

        {/* Quick Sample Prompts */}
        <div className="flex items-center gap-2 mt-2.5 max-w-4xl mx-auto overflow-x-auto thin-scrollbar pb-0.5">
          <span className="text-[10.5px] uppercase tracking-wider font-semibold text-slate-400 dark:text-zinc-500 shrink-0">
            Inquiries:
          </span>
          {liveInquiries.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuestion(prompt);
                triggerSynthesize(prompt);
              }}
              className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100/80 dark:bg-zinc-800/60 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-zinc-700/70 whitespace-nowrap transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Executive Reasoning Canvas ── */}
      <div ref={decideContainerRef} className="flex-1 overflow-y-auto px-7 py-6 thin-scrollbar">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Active Synthesis Progress Indicator */}
          {isSynthesizing && (
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-violet-200 dark:border-violet-900/60 shadow-xs flex items-center justify-between gap-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-[#7C5ACF] dark:text-[#a78bfa] flex items-center justify-center shrink-0">
                  <RegaarderAiIcon size={16} className="animate-spin" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <span>Strategic Reasoning in Progress</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7C5ACF] animate-pulse" />
                  </div>
                  <p className="text-[11.5px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    {synthesisStepText || 'Synthesizing cross-workspace evidence...'}
                  </p>
                </div>
              </div>
              <div className="w-20 h-1 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                <div className="h-full bg-[#7C5ACF] rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          )}

          {/* Empty State */}
          {!activeQuery && !isSynthesizing && (
            <div className="flex flex-col items-center justify-center py-16 px-6 rounded-3xl bg-white dark:bg-zinc-900 border border-black/[0.04] dark:border-white/[0.05] text-center shadow-2xs">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-violet-50 dark:bg-violet-950/50 text-[#7C5ACF] dark:text-[#a78bfa] mb-3.5 border border-violet-100 dark:border-violet-900/40">
                <Compass size={22} strokeWidth={1.8} />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100 mb-1">
                Strategic Reasoning System
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md leading-relaxed mb-6">
                Direct prose answers, cross-document contradiction reconciliation, missing assumption analysis, counterargument stress tests, and actionable operational conclusions.
              </p>

              <div className="w-full max-w-md space-y-2 text-left">
                {liveInquiries.slice(0, 3).map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuestion(prompt);
                      triggerSynthesize(prompt);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60 transition-all text-xs font-medium text-slate-700 dark:text-zinc-200 cursor-pointer"
                  >
                    <span>{prompt}</span>
                    <ArrowRight size={12} className="text-[#7C5ACF] shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Genuine Synthesis Result */}
          {synthesis && !isSynthesizing && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* ── 1. DOMINANT DIRECT PROSE CONCLUSION (Executive Hero) ── */}
              <div className="p-7 rounded-[22px] bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/90 shadow-[0_2px_14px_rgba(0,0,0,0.02)] space-y-5">
                {/* Epistemic Status & Confidence Header */}
                <div className="flex items-center justify-between gap-4 border-b border-black/[0.04] dark:border-white/[0.04] pb-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                      Strategic Conclusion
                    </span>
                  </div>

                  {/* Dual Confidence Pills */}
                  <div className="flex items-center gap-2">
                    {/* Support Quality */}
                    {synthesis.confidence?.supportQuality && (
                      <span className={`text-[10.5px] font-semibold px-2.5 py-0.8 rounded-lg ${
                        synthesis.confidence.supportQuality === 'STRONGLY_EVIDENCED'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : synthesis.confidence.supportQuality === 'PARTIALLY_EVIDENCED'
                          ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}>
                        {synthesis.confidence.supportQuality.replace('_', ' ')}
                      </span>
                    )}

                    {/* Evidence Confidence */}
                    <div 
                      className="relative cursor-pointer"
                      onClick={() => setShowConfidenceExplainer(!showConfidenceExplainer)}
                      title="Click to inspect epistemic confidence breakdown"
                    >
                      <span className="text-[10.5px] font-semibold px-2.5 py-0.8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 transition-colors flex items-center gap-1">
                        <span>Confidence:</span>
                        <strong className="text-[#7C5ACF] dark:text-[#a78bfa]">
                          {synthesis.confidence?.conclusionConfidence || 'MEDIUM'}
                        </strong>
                      </span>

                      {/* Confidence Explainer Dropdown */}
                      {showConfidenceExplainer && (
                        <div className="absolute right-0 top-full mt-2 w-72 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 shadow-xl z-50 text-xs space-y-2">
                          <div className="font-semibold text-slate-900 dark:text-zinc-100 flex items-center justify-between">
                            <span>Epistemic Confidence Rationale</span>
                            <X size={12} className="cursor-pointer text-slate-400" onClick={() => setShowConfidenceExplainer(false)} />
                          </div>
                          <div className="text-[11.5px] text-slate-600 dark:text-zinc-300 leading-relaxed">
                            {synthesis.confidence?.rationale || 'Distinguishes verified source evidence from unvalidated strategic execution assumptions.'}
                          </div>
                          <div className="pt-1.5 border-t border-black/[0.04] dark:border-white/[0.04] text-[10.5px] text-slate-500 flex justify-between">
                            <span>Evidence Record: <strong>{synthesis.confidence?.evidenceConfidence || 'HIGH'}</strong></span>
                            <span>Strategy Feasibility: <strong>{synthesis.confidence?.conclusionConfidence || 'MEDIUM'}</strong></span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Natural Executive Prose Answer */}
                <div className="prose prose-slate dark:prose-invert max-w-none text-[14.5px] leading-relaxed text-slate-800 dark:text-zinc-100 font-normal space-y-3 whitespace-pre-line">
                  {synthesis.directAnswer || synthesis.recommendedCourse}
                </div>
              </div>

              {/* ── 2. KEY FINDINGS WITH CLAIM PROVENANCE ── */}
              {synthesis.keyFindings?.length > 0 && (
                <div className="p-6 rounded-[22px] bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/90 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                      <Target size={13} className="text-[#7C5ACF]" />
                      <span>Key Material Findings ({synthesis.keyFindings.length})</span>
                    </h4>
                  </div>

                  <div className="space-y-3">
                    {synthesis.keyFindings.map((finding, idx) => (
                      <div 
                        key={finding.id || idx}
                        className="p-3.5 rounded-xl bg-slate-50/90 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-700/50 space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-md bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-bold text-[10.5px] text-[#7C5ACF] dark:text-[#a78bfa] flex items-center justify-center shrink-0 mt-0.5">
                              0{idx + 1}
                            </span>
                            <div className="space-y-1">
                              <p className="font-semibold text-slate-900 dark:text-zinc-100 leading-snug">
                                {finding.statement}
                              </p>
                              {finding.materialityRationale && (
                                <p className="text-[11.5px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                                  <span className="font-medium text-slate-700 dark:text-zinc-300">Impact: </span>
                                  {finding.materialityRationale}
                                </p>
                              )}
                            </div>
                          </div>

                          <span className={`text-[9.5px] font-bold uppercase px-2 py-0.5 rounded shrink-0 ${
                            finding.materiality === 'HIGH'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60'
                              : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                          }`}>
                            {finding.materiality || 'Material'}
                          </span>
                        </div>

                        {/* Provenance Badge */}
                        {finding.provenance && (
                          <div className="flex items-center justify-between pt-2 border-t border-black/[0.03] dark:border-white/[0.03] text-[11px] text-slate-500 dark:text-zinc-400">
                            <span className="truncate">Source: <strong className="text-slate-700 dark:text-zinc-200">{finding.provenance.source}</strong></span>
                            <button
                              type="button"
                              onClick={() => handleOpenSource(finding.provenance.source, finding.provenance.entityId)}
                              className="text-[#7C5ACF] dark:text-[#a78bfa] hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
                            >
                              <span>Open artifact</span>
                              <ArrowUpRight size={11} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── 3. PROGRESSIVE DISCLOSURE TOOLBAR (Apple-style Segmented Controls) ── */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 dark:text-zinc-500">
                    Reasoning Instruments
                  </span>
                  {activeDisclosureSection !== 'none' && (
                    <button
                      type="button"
                      onClick={() => setActiveDisclosureSection('none')}
                      className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors"
                    >
                      Collapse instruments
                    </button>
                  )}
                </div>

                {/* Instrument Buttons */}
                <div className="flex items-center gap-2 overflow-x-auto thin-scrollbar pb-1">
                  {[
                    { id: 'evidence', label: 'Evidence & Epistemics', icon: BookOpen, count: synthesis.epistemicEvidence?.length },
                    { id: 'contradictions', label: 'Discrepancies', icon: AlertTriangle, count: synthesis.contradictions?.length, alert: (synthesis.contradictions?.length || 0) > 0 },
                    { id: 'blindspots', label: 'Missing Assumptions', icon: HelpCircle, count: synthesis.missingAssumptions?.length },
                    { id: 'challenge', label: 'Challenge & Counterargument', icon: Scale },
                    { id: 'lenses', label: 'Analytical Lenses', icon: Eye },
                    { id: 'changeView', label: 'Pivot Triggers', icon: SlidersHorizontal },
                    { id: 'visualize', label: 'Visualize Reasoning', icon: Network, highlight: synthesis.visualReasoning?.enabled },
                    { id: 'actions', label: 'Actions', icon: CheckSquare, count: synthesis.actionableConclusions?.length }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeDisclosureSection === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveDisclosureSection(isActive ? 'none' : tab.id)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer select-none border ${
                          isActive
                            ? 'bg-[#7C5ACF] text-white border-[#7C5ACF] shadow-xs'
                            : tab.alert
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-900/60 hover:border-rose-300'
                            : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 shadow-2xs'
                        }`}
                      >
                        <Icon size={13} className={isActive ? 'text-white' : tab.alert ? 'text-rose-600' : 'text-slate-500'} />
                        <span>{tab.label}</span>
                        {typeof tab.count === 'number' && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                          }`}>
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* ── 4. EXPANDED REASONING INSTRUMENT PANELS ── */}
                
                {/* A. Evidence & Epistemic Classification */}
                {activeDisclosureSection === 'evidence' && (
                  <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.04] pb-2.5">
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                        Epistemic Evidence Classification
                      </h4>
                      <span className="text-[11px] text-slate-400">Strictly distinguishes facts from assumptions</span>
                    </div>

                    <div className="space-y-2.5">
                      {synthesis.epistemicEvidence?.map((item, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-700/50 text-xs space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              item.type === 'FACT'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60'
                                : item.type === 'INFERENCE'
                                ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-200/60'
                                : item.type === 'ASSUMPTION'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60'
                                : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                            }`}>
                              {item.type}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                              Source: <strong className="text-slate-700 dark:text-zinc-200">{item.source}</strong>
                            </span>
                          </div>
                          <p className="text-slate-800 dark:text-zinc-200 leading-relaxed font-medium">
                            {item.statement}
                          </p>
                          {item.quoteOrDetail && (
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 italic">
                              "{item.quoteOrDetail}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* B. Cross-Artifact Contradictions & Discrepancies */}
                {activeDisclosureSection === 'contradictions' && (
                  <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.04] pb-2.5">
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                        <AlertTriangle size={13} className="text-rose-500" />
                        <span>Detected Contradictions & Discrepancies</span>
                      </h4>
                      <span className="text-[11px] text-slate-400">Reconciled cross-workspace differences</span>
                    </div>

                    {synthesis.contradictions?.length === 0 ? (
                      <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300">
                        No material contradictions identified in the available evidence.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {synthesis.contradictions?.map((contra, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/50 space-y-3 text-xs">
                            <div className="flex items-center justify-between">
                              <h5 className="font-bold text-rose-900 dark:text-rose-200 text-sm">
                                {contra.title}
                              </h5>
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200">
                                {contra.severity} Materiality
                              </span>
                            </div>

                            {/* Side by side comparison */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <div className="p-3 rounded-lg bg-white/90 dark:bg-zinc-900/80 border border-rose-100 dark:border-zinc-800">
                                <span className="text-[10.5px] uppercase font-bold text-slate-500 block mb-1">
                                  {contra.docA.title}
                                </span>
                                <p className="text-slate-800 dark:text-zinc-200 leading-snug">{contra.docA.claim}</p>
                              </div>
                              <div className="p-3 rounded-lg bg-white/90 dark:bg-zinc-900/80 border border-rose-100 dark:border-zinc-800">
                                <span className="text-[10.5px] uppercase font-bold text-slate-500 block mb-1">
                                  {contra.docB.title}
                                </span>
                                <p className="text-slate-800 dark:text-zinc-200 leading-snug">{contra.docB.claim}</p>
                              </div>
                            </div>

                            <div className="space-y-1.5 pt-1">
                              <p className="text-slate-700 dark:text-zinc-300">
                                <strong>Why it matters: </strong>{contra.impact}
                              </p>
                              <div className="p-2.5 rounded-lg bg-rose-100/50 dark:bg-rose-900/30 text-rose-900 dark:text-rose-200 text-[11.5px]">
                                <strong>Resolution Action: </strong>{contra.verificationStep}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* C. Missing Assumptions & Blindspots */}
                {activeDisclosureSection === 'blindspots' && (
                  <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.04] pb-2.5">
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                        <HelpCircle size={13} className="text-amber-500" />
                        <span>Missing Assumptions & Sales Economics</span>
                      </h4>
                      <span className="text-[11px] text-slate-400">Critical unknowns unstated by documents</span>
                    </div>

                    <div className="space-y-3">
                      {synthesis.missingAssumptions?.map((item, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs space-y-1.5">
                          <div className="font-bold text-amber-900 dark:text-amber-200">
                            {item.topic}
                          </div>
                          <p className="text-slate-800 dark:text-zinc-200 font-medium leading-relaxed">
                            {item.unknownDetails}
                          </p>
                          <p className="text-[11.5px] text-amber-800 dark:text-amber-300">
                            <strong>Strategic Risk: </strong>{item.strategicImpact}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* D. Counterargument Engine (Stress Test) */}
                {activeDisclosureSection === 'challenge' && synthesis.counterargumentEngine && (
                  <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.04] pb-2.5">
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                        <Scale size={13} className="text-[#7C5ACF]" />
                        <span>Counterargument Engine & Stress Test</span>
                      </h4>
                      <span className="text-[11px] text-slate-400">Challenges conclusion before final synthesis</span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-700/50">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">01. Initial Baseline Conclusion</span>
                        <p className="text-slate-800 dark:text-zinc-200 font-medium">{synthesis.counterargumentEngine.initialConclusion}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40">
                        <span className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-300 block mb-1">02. Strongest Counterargument</span>
                        <p className="text-rose-900 dark:text-rose-200 font-medium">{synthesis.counterargumentEngine.strongestCounterargument}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                        <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300 block mb-1">03. Stress Test (What if objection holds true?)</span>
                        <p className="text-amber-900 dark:text-amber-200 font-medium">{synthesis.counterargumentEngine.stressTest}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-violet-50/60 dark:bg-violet-950/30 border border-violet-200/70 dark:border-violet-900/50">
                        <span className="text-[10px] uppercase font-bold text-[#7C5ACF] dark:text-[#a78bfa] block mb-1">04. Final Gated Synthesis</span>
                        <p className="text-slate-900 dark:text-zinc-100 font-semibold leading-relaxed">{synthesis.counterargumentEngine.synthesis}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* E. Dynamic Analytical Lenses */}
                {activeDisclosureSection === 'lenses' && synthesis.domainLenses && (
                  <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.04] pb-2.5">
                      <div>
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                          Analytical Domain: {synthesis.domainLenses.domain}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{synthesis.domainLenses.selectionRationale}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {synthesis.domainLenses.selectedLenses?.map((lens, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-700/50 space-y-2 text-xs">
                          <span className="font-bold text-[#7C5ACF] dark:text-[#a78bfa] block">
                            {lens.lensName}
                          </span>
                          <p className="text-slate-700 dark:text-zinc-300 leading-snug">
                            {lens.perspective}
                          </p>
                          <div className="pt-2 border-t border-black/[0.03] dark:border-white/[0.03] text-[11px] text-rose-700 dark:text-rose-400">
                            <strong>Key Risk: </strong>{lens.keyConcern}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3.5 rounded-xl bg-violet-50/60 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40 text-xs">
                      <span className="text-[10.5px] uppercase font-bold text-[#7C5ACF] block mb-1">Integrated Lens Synthesis</span>
                      <p className="text-slate-800 dark:text-zinc-200 leading-relaxed">{synthesis.domainLenses.multiLensSynthesis}</p>
                    </div>
                  </div>
                )}

                {/* F. What Would Change My View */}
                {activeDisclosureSection === 'changeView' && synthesis.whatWouldChangeMyView?.length > 0 && (
                  <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-4 animate-in fade-in duration-150">
                    <div className="border-b border-black/[0.04] dark:border-white/[0.04] pb-2.5">
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                        What Would Change Orb's Conclusion?
                      </h4>
                      <p className="text-[11.5px] text-slate-500 mt-0.5">
                        Concrete inflection points, metric triggers, and milestones that would reverse the recommendation.
                      </p>
                    </div>

                    <div className="space-y-2 text-xs">
                      {synthesis.whatWouldChangeMyView.map((trigger, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-700/50 flex items-start gap-2.5">
                          <span className="w-4 h-4 rounded-full bg-violet-100 dark:bg-violet-950 text-[#7C5ACF] dark:text-[#a78bfa] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-slate-800 dark:text-zinc-200 font-medium leading-relaxed">
                            {trigger}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* G. Native Interactive Visual Reasoning Whiteboard */}
                {activeDisclosureSection === 'visualize' && synthesis.visualReasoning && (
                  <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.04] pb-2.5">
                      <div>
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                          <Network size={13} className="text-[#7C5ACF]" />
                          <span>Native Reasoning Whiteboard</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {synthesis.visualReasoning.rationale || 'Spatial mapping of cross-artifact relationships'}
                        </p>
                      </div>

                      {/* Visual Mode Switcher */}
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl text-[11px]">
                        {['contradiction_map', 'dependency_graph', 'evidence_map'].map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setVisualMode(mode)}
                            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                              visualMode === mode
                                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs'
                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                            }`}
                          >
                            {mode.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Interactive Node Graph Canvas */}
                    <div className="relative w-full h-80 rounded-xl bg-slate-50/90 dark:bg-zinc-950/60 border border-slate-200/60 dark:border-zinc-800/80 p-4 overflow-hidden flex flex-col justify-between">
                      {/* SVG Canvas for Edges */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <defs>
                          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
                          </marker>
                        </defs>
                        {/* Connecting Lines between nodes */}
                        <line x1="20%" y1="30%" x2="50%" y2="30%" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4" />
                        <line x1="50%" y1="30%" x2="80%" y2="40%" stroke="#7c5acf" strokeWidth="2" markerEnd="url(#arrow)" />
                        <line x1="20%" y1="70%" x2="50%" y2="70%" stroke="#e11d48" strokeWidth="2" strokeDasharray="4" />
                        <line x1="50%" y1="70%" x2="80%" y2="50%" stroke="#7c5acf" strokeWidth="2" markerEnd="url(#arrow)" />
                      </svg>

                      {/* Render Nodes */}
                      <div className="relative z-10 grid grid-cols-3 gap-6 h-full items-center">
                        {/* Column 1: Source Claims */}
                        <div className="space-y-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Source Artifacts</span>
                          {synthesis.visualReasoning.nodes?.slice(0, 2).map((n, i) => (
                            <div
                              key={n.id || i}
                              onClick={() => setSelectedVisualNode(n)}
                              className={`p-3 rounded-xl bg-white dark:bg-zinc-900 border text-xs shadow-2xs transition-all cursor-pointer hover:border-[#7C5ACF] ${
                                n.status === 'conflict'
                                  ? 'border-rose-300 dark:border-rose-800/80'
                                  : 'border-slate-200/80 dark:border-zinc-800'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-slate-800 dark:text-zinc-200">{n.label}</span>
                                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500">{n.type}</span>
                              </div>
                              <span className="text-[10.5px] text-slate-400 truncate block">{n.source}</span>
                            </div>
                          ))}
                        </div>

                        {/* Column 2: Reconciled Discrepancies */}
                        <div className="space-y-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Reconciliation Layer</span>
                          {synthesis.visualReasoning.nodes?.slice(2, 4).map((n, i) => (
                            <div
                              key={n.id || i}
                              onClick={() => setSelectedVisualNode(n)}
                              className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-xs shadow-2xs transition-all cursor-pointer hover:border-[#7C5ACF]"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-slate-800 dark:text-zinc-200">{n.label}</span>
                                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-50 text-amber-700">{n.status}</span>
                              </div>
                              <span className="text-[10.5px] text-slate-400 truncate block">{n.source}</span>
                            </div>
                          ))}
                        </div>

                        {/* Column 3: Strategic Outcomes & Gated Roadmap */}
                        <div className="space-y-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C5ACF] block mb-1">Gated Execution</span>
                          {synthesis.visualReasoning.nodes?.slice(4, 6).map((n, i) => (
                            <div
                              key={n.id || i}
                              onClick={() => setSelectedVisualNode(n)}
                              className="p-3 rounded-xl bg-violet-50/80 dark:bg-violet-950/40 border border-violet-200/80 dark:border-violet-900/60 text-xs shadow-2xs transition-all cursor-pointer hover:border-[#7C5ACF]"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-violet-950 dark:text-violet-200">{n.label}</span>
                                <CheckCircle2 size={12} className="text-[#7C5ACF]" />
                              </div>
                              <span className="text-[10.5px] text-[#7C5ACF] truncate block">{n.source}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Footer node inspector prompt */}
                      <div className="relative z-10 pt-2 border-t border-black/[0.04] dark:border-white/[0.04] text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Click any node to inspect provenance and jump to workspace source.</span>
                        {selectedVisualNode && (
                          <button
                            type="button"
                            onClick={() => handleOpenSource(selectedVisualNode.source)}
                            className="text-[#7C5ACF] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>Open {selectedVisualNode.label}</span>
                            <ArrowUpRight size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* H. Actionable Conclusions (Executable Operations) */}
                {activeDisclosureSection === 'actions' && synthesis.actionableConclusions?.length > 0 && (
                  <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.04] pb-2.5">
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                        <CheckSquare size={13} className="text-[#7C5ACF]" />
                        <span>Executable Strategic Next Steps</span>
                      </h4>
                    </div>

                    <div className="space-y-3">
                      {synthesis.actionableConclusions.map((act) => {
                        const isAdded = addedTaskIds.has(act.id);
                        return (
                          <div 
                            key={act.id}
                            className="p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[9.5px] uppercase font-bold px-2 py-0.5 rounded ${
                                  act.urgency === 'Urgent' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300'
                                }`}>
                                  {act.urgency}
                                </span>
                                <h5 className="font-bold text-slate-900 dark:text-zinc-100 truncate">
                                  {act.title}
                                </h5>
                              </div>
                              <p className="text-[11.5px] text-slate-600 dark:text-zinc-400 leading-snug">
                                {act.operationalRequirement}
                              </p>
                              <div className="text-[10.5px] text-slate-400">
                                Owner: <strong>{act.owner}</strong> • Completion milestone: <em>{act.completionCondition}</em>
                              </div>
                            </div>

                            {/* Executable Triggers */}
                            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                              <button
                                type="button"
                                onClick={() => handleOpenSource(act.targetSource, act.targetEntityId)}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-zinc-700 flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <span>Inspect Source</span>
                                <ArrowUpRight size={12} />
                              </button>

                              <button
                                type="button"
                                disabled={isAdded}
                                onClick={() => {
                                  setAddedTaskIds(prev => new Set([...prev, act.id]));
                                  if (onAddActionToTasks) onAddActionToTasks(act);
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                  isAdded
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 cursor-default'
                                    : 'bg-[#7C5ACF] text-white hover:bg-[#6c48c5] shadow-2xs'
                                }`}
                              >
                                {isAdded ? (
                                  <>
                                    <Check size={12} />
                                    <span>Added</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus size={12} />
                                    <span>Add to Tasks</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── AI Configuration & Local LLM Endpoints Modal ── */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.05] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-[#7C5ACF] dark:text-[#a78bfa] flex items-center justify-center">
                  <Key size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    AI Providers & Local LLM Setup
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Configure Cloud API keys and local on-device inference endpoints
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto thin-scrollbar pr-1 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Server size={12} className="text-emerald-600" />
                  <span>Ollama Local Endpoint</span>
                </label>
                <input
                  type="text"
                  value={aiConfig.ollamaEndpoint || ''}
                  onChange={(e) => setAiConfig(prev => ({ ...prev, ollamaEndpoint: e.target.value }))}
                  placeholder="http://localhost:11434"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-[#7C5ACF]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Cpu size={12} className="text-sky-600" />
                  <span>LM Studio / LocalAI Endpoint</span>
                </label>
                <input
                  type="text"
                  value={aiConfig.lmstudioEndpoint || ''}
                  onChange={(e) => setAiConfig(prev => ({ ...prev, lmstudioEndpoint: e.target.value }))}
                  placeholder="http://localhost:1234/v1"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-[#7C5ACF]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-800 dark:text-zinc-200 block">
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  value={aiConfig.geminiApiKey || ''}
                  onChange={(e) => setAiConfig(prev => ({ ...prev, geminiApiKey: e.target.value }))}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-[#7C5ACF]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-800 dark:text-zinc-200 block">
                  Anthropic Claude API Key
                </label>
                <input
                  type="password"
                  value={aiConfig.claudeApiKey || ''}
                  onChange={(e) => setAiConfig(prev => ({ ...prev, claudeApiKey: e.target.value }))}
                  placeholder="sk-ant-..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-[#7C5ACF]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-800 dark:text-zinc-200 block">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={aiConfig.openaiApiKey || ''}
                  onChange={(e) => setAiConfig(prev => ({ ...prev, openaiApiKey: e.target.value }))}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-[#7C5ACF]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-black/[0.04] dark:border-white/[0.05]">
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  saveAiConfig(aiConfig);
                  refreshLocalServers();
                  setIsConfigModalOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-[#7C5ACF] hover:bg-[#6c48c5] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Apple-Style Floating Selection Action Pill ── */}
      <OrbDecideSelectionPill
        selectionState={selectionState}
        onReply={handleSelectionReply}
        onExplain={handleSelectionExplain}
        onChallenge={handleSelectionChallenge}
        onAskQuestion={handleSelectionAskQuestion}
        onDismiss={() => {
          setSelectionState(null);
          window.getSelection()?.removeAllRanges();
        }}
      />
    </div>
  );
}
