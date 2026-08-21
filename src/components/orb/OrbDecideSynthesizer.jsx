import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  AlertTriangle, CheckCircle2, Clock, ArrowRight,
  TrendingUp, HelpCircle, FileText, Table, Presentation, Video,
  CheckSquare, ShieldAlert, Plus, Layers, Search, SlidersHorizontal,
  GitBranch, Check, Compass, ShieldCheck, Loader2
} from 'lucide-react';
import { RegaarderProductIcon, RegaarderAiIcon } from '../RegaarderProductIcons';
import { synthesizeStrategicDecision } from '../../services/orbKnowledgeGraphService';
import { generateOrbDecisionSynthesis } from '../../services/orbAiService';

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
  const timerRef = useRef(null);

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
    setSynthesisStepText('Accessing live workspace intelligence...');

    setTimeout(() => {
      setSynthesisStepText('Extracting spreadsheet formulas, documents & task dependencies...');
    }, 200);

    setTimeout(() => {
      setSynthesisStepText('Synthesizing executive recommendation with AI reasoning model...');
    }, 450);

    try {
      const result = await generateOrbDecisionSynthesis({
        question: queryText,
        entities,
        edges
      });
      setLiveSynthesis(result);
      setActiveQuery(queryText);
    } catch (err) {
      console.warn('Live AI synthesis failed, falling back to deterministic synthesis:', err);
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
    triggerSynthesize(question);
  };

  // Derive real live strategic inquiries dynamically from connected workspace entities
  const liveInquiries = useMemo(() => {
    const inquiries = [];
    
    // Categorize live entities from workspace
    const docEntities = entities.filter(e => e.type === 'document' || e.workspace === 'compose');
    const sheetEntities = entities.filter(e => e.type === 'sheet' || e.workspace === 'sheets');
    const deckEntities = entities.filter(e => e.type === 'slide' || e.workspace === 'decks');
    const taskEntities = entities.filter(e => e.type === 'task');

    // 1. Live document insights
    if (docEntities.length > 0) {
      const activeDoc = docEntities[0];
      inquiries.push(`What strategic insights or risks emerge from "${activeDoc.title || 'Untitled Document'}"?`);
    }

    // 2. Live sheet calculations & revenue trends
    if (sheetEntities.length > 0) {
      const activeSheet = sheetEntities[0];
      inquiries.push(`Analyze financial calculations and trends in "${activeSheet.title || 'Active Sheet'}"`);
    }

    // 3. Live presentation messaging & executive alignment
    if (deckEntities.length > 0) {
      const activeDeck = deckEntities[0];
      inquiries.push(`Evaluate executive alignment and key points in "${activeDeck.title || 'Active Deck'}"`);
    }

    // 4. Live task blockers & deliverables
    if (taskEntities.length > 0) {
      inquiries.push('What critical blockers or unassigned tasks require immediate executive action?');
    }

    // Intelligent fallbacks derived from cross-workspace context
    if (inquiries.length < 4) {
      inquiries.push(
        'What cross-workspace dependencies connect our active documents, sheets, and tasks?',
        'Synthesize key business risks and required conditions for our active roadmap'
      );
    }

    return inquiries.slice(0, 4);
  }, [entities]);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-slate-100/30 dark:bg-zinc-950/20">
      {/* ── Query Bar Header ── */}
      <div className="p-5 border-b border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/70 dark:bg-zinc-900/70 backdrop-blur-xl shrink-0">
        <form onSubmit={handleQuerySubmit} className="flex gap-2 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <RegaarderAiIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask an executive decision question..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/90 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/15 focus:border-slate-400 dark:focus:border-zinc-500 shadow-xs"
            />
          </div>
          <button
            type="submit"
            disabled={isSynthesizing || !question.trim()}
            className={`px-5 py-2.5 rounded-xl bg-[#7C5ACF] text-white text-xs font-semibold hover:bg-[#6c48c5] active:scale-[0.98] transition-all shrink-0 shadow-xs flex items-center gap-2 cursor-pointer ${
              isSynthesizing ? 'opacity-90 cursor-wait' : ''
            }`}
            title="Synthesize strategic decision briefing"
          >
            {isSynthesizing ? (
              <>
                <RegaarderAiIcon size={14} className="animate-spin text-white shrink-0" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <span>Synthesize</span>
                <ArrowRight size={13} />
              </>
            )}
          </button>
        </form>

        {/* Quick Sample Prompts */}
        <div className="flex items-center gap-2 mt-3 max-w-4xl mx-auto overflow-x-auto thin-scrollbar pb-1">
          <span className={`text-[11px] uppercase tracking-wider shrink-0 ${
            highContrast ? 'font-bold text-slate-800 dark:text-zinc-200' : 'font-medium text-slate-500 dark:text-zinc-400'
          }`}>
            Quick Inquiries:
          </span>
          {liveInquiries.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuestion(prompt);
                triggerSynthesize(prompt);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-colors cursor-pointer ${
                highContrast
                  ? 'font-bold border-2 border-slate-400 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-black dark:text-white hover:border-violet-500'
                  : 'font-medium border border-slate-200/80 dark:border-zinc-700/80 bg-white/70 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-zinc-700'
              }`}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* ── Synthesis Content Dashboard or Empty State ── */}
      <div className="flex-1 overflow-y-auto p-8 thin-scrollbar">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Real-time Synthesis Progress Indicator */}
          {isSynthesizing && (
            <div className={`p-4 rounded-2xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-1 duration-200 ${
              highContrast
                ? 'bg-white dark:bg-zinc-950 border-2 border-violet-500 shadow-md'
                : 'bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-violet-300/80 dark:border-violet-700/80 shadow-xs'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  highContrast
                    ? 'bg-violet-100 dark:bg-violet-950 text-[#7C5ACF] dark:text-[#a78bfa] border-2 border-violet-500'
                    : 'bg-violet-50 dark:bg-violet-950/50 text-[#7C5ACF] dark:text-[#a78bfa] border border-violet-200 dark:border-violet-800'
                }`}>
                  <RegaarderAiIcon size={16} className="animate-spin" />
                </div>
                <div>
                  <div className={`text-xs flex items-center gap-2 ${
                    highContrast ? 'font-black text-black dark:text-white' : 'font-semibold text-slate-900 dark:text-zinc-100'
                  }`}>
                    <span>Synthesizing Strategic Intelligence</span>
                    <span className="w-2 h-2 rounded-full bg-[#7C5ACF] dark:bg-[#a78bfa] animate-pulse" />
                  </div>
                  <p className={`text-[11px] mt-0.5 ${
                    highContrast ? 'font-bold text-slate-800 dark:text-zinc-200' : 'font-normal text-slate-500 dark:text-zinc-400'
                  }`}>
                    {synthesisStepText || 'Reasoning across cross-workspace artifacts...'}
                  </p>
                </div>
              </div>
              <div className="w-24 h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden shrink-0">
                <div className="h-full bg-[#7C5ACF] dark:bg-[#a78bfa] rounded-full animate-pulse w-4/5" />
              </div>
            </div>
          )}

          {/* ── Empty State when no query is active ── */}
          {!activeQuery && !isSynthesizing && (
            <div className={`flex flex-col items-center justify-center py-16 px-6 rounded-3xl text-center ${
              highContrast
                ? 'bg-white dark:bg-zinc-950 border-2 border-slate-400 dark:border-zinc-600'
                : 'bg-white/60 dark:bg-zinc-900/50 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08]'
            }`}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-violet-100 dark:bg-violet-950/60 text-[#7C5ACF] dark:text-[#a78bfa] mb-4 border border-violet-200/80 dark:border-violet-800/60">
                <Compass size={24} strokeWidth={1.8} />
              </div>
              <h3 className={`text-base font-semibold mb-1.5 ${
                highContrast ? 'text-black dark:text-white font-extrabold' : 'text-slate-900 dark:text-zinc-100'
              }`}>
                Strategic Decision Synthesizer
              </h3>
              <p className={`text-xs max-w-md leading-relaxed mb-6 ${
                highContrast ? 'text-slate-800 dark:text-zinc-300 font-medium' : 'text-slate-500 dark:text-zinc-400'
              }`}>
                Synthesize cross-workspace reasoning, evaluate critical constraints, and uncover required decision conditions across all connected models and transcripts.
              </p>

              <div className="w-full max-w-lg space-y-2 text-left">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-zinc-500 block text-center mb-2">
                  Select a strategic inquiry to synthesize
                </span>
                {liveInquiries.slice(0, 3).map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuestion(prompt);
                      triggerSynthesize(prompt);
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all cursor-pointer ${
                      highContrast
                        ? 'bg-slate-100 dark:bg-zinc-900 border-2 border-slate-300 hover:border-violet-500 font-bold text-black dark:text-white'
                        : 'bg-white/80 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 hover:border-violet-300 text-slate-800 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span className="text-xs font-medium">{prompt}</span>
                    <ArrowRight size={13} className="text-[#7C5ACF] dark:text-[#a78bfa] shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Synthesis Briefing */}
          {synthesis && !isSynthesizing && (
            <>

          {/* Executive Strategic Decision Briefing Card */}
          <div className={`p-6 rounded-3xl space-y-4 ${
            highContrast
              ? 'bg-white dark:bg-zinc-950 border-2 border-slate-400 dark:border-zinc-600 shadow-sm'
              : 'bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] shadow-xs'
          }`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className={`flex items-center gap-2 text-xs uppercase tracking-wider mb-1 ${
                  highContrast ? 'font-bold text-slate-900 dark:text-zinc-200' : 'font-medium text-slate-500 dark:text-zinc-400'
                }`}>
                  <Compass size={14} className="text-[#7C5ACF] dark:text-[#a78bfa]" />
                  <span>Strategic Decision Briefing</span>
                </div>
                <h2 className={`text-xl ${
                  highContrast ? 'font-black text-black dark:text-white' : 'font-semibold text-slate-900 dark:text-zinc-100'
                }`}>
                  {synthesis.topic}
                </h2>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className={`text-xs px-2.5 py-1 rounded-full shadow-2xs ${
                  highContrast
                    ? 'font-extrabold bg-violet-100 dark:bg-violet-950 text-violet-950 dark:text-violet-200 border-2 border-violet-500'
                    : 'font-semibold bg-violet-50 dark:bg-violet-950/40 text-[#7C5ACF] dark:text-[#a78bfa] border border-violet-200 dark:border-violet-800/60'
                }`}>
                  {synthesis.status || 'AI Recommendation • Pending Review'}
                </span>
                <span className={`text-[10px] font-mono mt-1 ${
                  highContrast ? 'font-bold text-slate-900 dark:text-zinc-100' : 'font-medium text-slate-500'
                }`}>
                  {Math.round((synthesis.confidenceScore || 0.94) * 100)}% Cross-Workspace Alignment
                </span>
              </div>
            </div>

            {/* ── Structured Reasoning & Recommendation Architecture ── */}
            <div className={`p-5 rounded-2xl space-y-3.5 ${
              highContrast
                ? 'bg-slate-100 dark:bg-zinc-900 border-2 border-slate-300 dark:border-zinc-700'
                : 'bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-700/60'
            }`}>
              {/* 1. Recommended Course */}
              <div>
                <div className="text-[10.5px] uppercase tracking-wider font-bold text-[#7C5ACF] dark:text-[#a78bfa] mb-1">
                  Recommended Course
                </div>
                <p className={`text-sm leading-snug ${
                  highContrast ? 'font-black text-black dark:text-white' : 'font-semibold text-slate-900 dark:text-zinc-100'
                }`}>
                  {synthesis.recommendedCourse || synthesis.coreRecommendation || 'Proceed with the Blackwell allocation, contingent on securing secondary packaging capacity.'}
                </p>
              </div>

              {/* 2. Structured Sub-points: Why • Critical Constraint • Required Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200/60 dark:border-zinc-700/50">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">
                    Evidence / Why
                  </span>
                  <p className={`text-xs leading-relaxed ${
                    highContrast ? 'font-bold text-slate-900 dark:text-zinc-100' : 'font-medium text-slate-700 dark:text-zinc-300'
                  }`}>
                    {synthesis.why || '+28% demand growth supports expansion.'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block">
                    Critical Constraint
                  </span>
                  <p className={`text-xs leading-relaxed ${
                    highContrast ? 'font-bold text-slate-900 dark:text-zinc-100' : 'font-medium text-slate-700 dark:text-zinc-300'
                  }`}>
                    {synthesis.criticalConstraint || 'TSMC packaging concentration creates a potential $6.7B exposure.'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-violet-700 dark:text-violet-400 block">
                    Required Condition
                  </span>
                  <p className={`text-xs leading-relaxed ${
                    highContrast ? 'font-bold text-slate-900 dark:text-zinc-100' : 'font-medium text-slate-700 dark:text-zinc-300'
                  }`}>
                    {synthesis.requiredCondition || 'Secure secondary ASE capacity before September 10.'}
                  </p>
                </div>
              </div>
            </div>

            <p className={`text-xs leading-relaxed ${
              highContrast ? 'font-medium text-slate-900 dark:text-zinc-200' : 'font-normal text-slate-600 dark:text-zinc-400'
            }`}>
              {synthesis.executiveSummary}
            </p>
          </div>

          {/* 2-Column Grid: Key Supporting Evidence & Contradictions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Supporting Evidence */}
            <div className={`p-5 rounded-2xl flex flex-col ${
              highContrast
                ? 'bg-white dark:bg-zinc-950 border-2 border-slate-400 dark:border-zinc-600 shadow-sm'
                : 'bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] shadow-xs'
            }`}>
              <div className={`flex items-center gap-2 text-xs uppercase tracking-wider mb-3 ${
                highContrast ? 'font-black text-black dark:text-white' : 'font-semibold text-slate-800 dark:text-zinc-200'
              }`}>
                <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>Supporting Evidence Across Workspaces</span>
              </div>

              <div className="space-y-3 flex-1">
                {synthesis.keyEvidence.map((item, idx) => (
                  <div key={idx} className={`p-3.5 rounded-xl text-xs ${
                    highContrast
                      ? 'bg-slate-100 dark:bg-zinc-900 border-2 border-slate-300 dark:border-zinc-700'
                      : 'bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-700/60'
                  }`}>
                    <div className={`flex items-center gap-2 mb-1 ${
                      highContrast ? 'font-black text-black dark:text-white' : 'font-semibold text-slate-800 dark:text-zinc-200'
                    }`}>
                      <div className={`w-5 h-5 rounded flex items-center justify-center ${
                        highContrast
                          ? 'bg-white dark:bg-zinc-800 text-black dark:text-white border border-slate-400'
                          : 'bg-slate-100 dark:bg-zinc-700/80 text-slate-700 dark:text-zinc-300 border border-slate-200'
                      }`}>
                        <RegaarderProductIcon name={item.type} size={11} />
                      </div>
                      <span className="truncate">{item.source}</span>
                    </div>
                    <p className={`leading-relaxed pl-7 ${
                      highContrast ? 'font-medium text-slate-900 dark:text-zinc-200' : 'font-normal text-slate-600 dark:text-zinc-400'
                    }`}>
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contradictions & Discrepancies */}
            <div className={`p-5 rounded-2xl flex flex-col ${
              highContrast
                ? 'bg-white dark:bg-zinc-950 border-2 border-slate-400 dark:border-zinc-600 shadow-sm'
                : 'bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] shadow-xs'
            }`}>
              <div className={`flex items-center gap-2 text-xs uppercase tracking-wider mb-3 ${
                highContrast ? 'font-black text-amber-950 dark:text-amber-200' : 'font-semibold text-amber-700 dark:text-amber-300'
              }`}>
                <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400" />
                <span>Detected Contradictions & Discrepancies</span>
              </div>

              <div className="space-y-3 flex-1">
                {synthesis.contradictions.map((contra, idx) => (
                  <div key={idx} className={`p-3.5 rounded-xl text-xs ${
                    highContrast
                      ? 'bg-amber-100/70 dark:bg-amber-950/60 border-2 border-amber-400 dark:border-amber-700'
                      : 'bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-bold ${highContrast ? 'text-amber-950 dark:text-amber-100' : 'text-amber-800 dark:text-amber-200'}`}>
                        {contra.title}
                      </span>
                      <span className={`text-[10px] uppercase px-2 py-0.5 rounded ${
                        highContrast
                          ? 'font-extrabold bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-100 border border-amber-400'
                          : 'font-semibold bg-amber-100/70 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 border border-amber-200'
                      }`}>
                        {contra.severity}
                      </span>
                    </div>
                    <p className={`mb-2 leading-relaxed ${
                      highContrast ? 'font-medium text-slate-900 dark:text-zinc-200' : 'font-normal text-slate-600 dark:text-zinc-400'
                    }`}>
                      {contra.description}
                    </p>
                    <div className={`text-[11px] p-2.5 rounded-lg border ${
                      highContrast
                        ? 'font-bold text-amber-950 dark:text-amber-100 bg-amber-200/60 dark:bg-amber-900/50 border-amber-400'
                        : 'font-medium text-amber-800 dark:text-amber-200 bg-amber-100/50 dark:bg-amber-900/30 border-amber-200/80'
                    }`}>
                      <span className="font-bold">Recommended Resolution: </span>
                      {contra.resolution}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── WHAT EVIDENCE WOULD CHANGE THIS RECOMMENDATION ── */}
          {synthesis.evidenceToChangeRecommendation?.length > 0 && (
            <div className={`p-6 rounded-3xl space-y-4 ${
              highContrast
                ? 'bg-white dark:bg-zinc-950 border-2 border-slate-400 dark:border-zinc-600 shadow-sm'
                : 'bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] shadow-xs'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className={`flex items-center gap-2 text-xs uppercase tracking-wider ${
                    highContrast ? 'font-black text-black dark:text-white' : 'font-semibold text-slate-800 dark:text-zinc-200'
                  }`}>
                    <SlidersHorizontal size={14} className="text-[#7C5ACF] dark:text-[#a78bfa]" />
                    <span>What Evidence Would Change This Recommendation?</span>
                  </div>
                  <p className={`text-[11.5px] mt-1 ${
                    highContrast ? 'font-bold text-slate-800 dark:text-zinc-300' : 'font-normal text-slate-500 dark:text-zinc-400'
                  }`}>
                    Sensitivity triggers, inflection points, and counter-evidence that would require an operational pivot.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {synthesis.evidenceToChangeRecommendation.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-2xl flex flex-col justify-between space-y-3 ${
                      highContrast
                        ? 'bg-slate-100 dark:bg-zinc-900 border-2 border-slate-300 dark:border-zinc-700'
                        : 'bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-700/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#7C5ACF] dark:text-[#a78bfa] mb-1.5">
                        <GitBranch size={11} />
                        <span>Trigger Condition #{idx + 1}</span>
                      </div>
                      <h4 className={`text-xs mb-2 leading-snug ${
                        highContrast ? 'font-black text-black dark:text-white' : 'font-semibold text-slate-900 dark:text-zinc-100'
                      }`}>
                        {item.trigger}
                      </h4>
                      <p className={`text-[11.5px] leading-relaxed mb-2 ${
                        highContrast ? 'font-medium text-slate-900 dark:text-zinc-200' : 'font-normal text-slate-600 dark:text-zinc-400'
                      }`}>
                        <span className={highContrast ? 'font-bold text-black dark:text-white' : 'font-semibold text-slate-800 dark:text-zinc-200'}>Counter-Evidence: </span>
                        {item.counterEvidence}
                      </p>
                    </div>

                    <div className={`p-2.5 rounded-xl text-[11px] ${
                      highContrast
                        ? 'bg-white dark:bg-zinc-950 border-2 border-slate-300 dark:border-zinc-700 text-black dark:text-white'
                        : 'bg-white/80 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-700/80 text-slate-700 dark:text-zinc-300'
                    }`}>
                      <span className="font-bold text-[#7C5ACF] dark:text-[#a78bfa] block mb-0.5">Contingent Pivot:</span>
                      <span>{item.contingentAction}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3-Column Grid: Dependencies, Trends & Blindspots */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Dependencies */}
            <div className={`p-4 rounded-2xl text-xs ${
              highContrast
                ? 'bg-white dark:bg-zinc-950 border-2 border-slate-400 dark:border-zinc-600'
                : 'bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08]'
            }`}>
              <div className={`flex items-center gap-1.5 uppercase tracking-wider mb-2.5 ${
                highContrast ? 'font-black text-black dark:text-white' : 'font-semibold text-slate-800 dark:text-zinc-200'
              }`}>
                <Clock size={13} className="text-slate-500" />
                <span>Critical Path Dependencies</span>
              </div>
              <ul className="space-y-2">
                {synthesis.dependencies.map((dep, idx) => (
                  <li key={idx} className={`p-2.5 rounded-lg ${
                    highContrast
                      ? 'bg-slate-100 dark:bg-zinc-900 border-2 border-slate-300'
                      : 'bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200/60'
                  }`}>
                    <div className={highContrast ? 'font-black text-black dark:text-white' : 'font-semibold text-slate-800 dark:text-zinc-200'}>{dep.item}</div>
                    <div className={`text-[11px] mt-0.5 ${highContrast ? 'font-bold text-slate-800' : 'font-normal text-slate-500'}`}>{dep.owner} • {dep.status}</div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Emerging Trends */}
            <div className={`p-4 rounded-2xl text-xs ${
              highContrast
                ? 'bg-white dark:bg-zinc-950 border-2 border-slate-400 dark:border-zinc-600'
                : 'bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08]'
            }`}>
              <div className={`flex items-center gap-1.5 uppercase tracking-wider mb-2.5 ${
                highContrast ? 'font-black text-black dark:text-white' : 'font-semibold text-slate-800 dark:text-zinc-200'
              }`}>
                <TrendingUp size={13} className="text-slate-500" />
                <span>Signals & Velocity</span>
              </div>
              <ul className="space-y-2">
                {synthesis.emergingTrends.map((trend, idx) => (
                  <li key={idx} className={`p-2.5 rounded-lg leading-relaxed ${
                    highContrast
                      ? 'bg-slate-100 dark:bg-zinc-900 border-2 border-slate-300 font-medium text-black dark:text-white'
                      : 'bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200/60 font-normal text-slate-600 dark:text-zinc-400'
                  }`}>
                    {trend}
                  </li>
                ))}
              </ul>
            </div>

            {/* Missing Information */}
            <div className={`p-4 rounded-2xl text-xs ${
              highContrast
                ? 'bg-white dark:bg-zinc-950 border-2 border-slate-400 dark:border-zinc-600'
                : 'bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08]'
            }`}>
              <div className={`flex items-center gap-1.5 uppercase tracking-wider mb-2.5 ${
                highContrast ? 'font-black text-black dark:text-white' : 'font-semibold text-slate-800 dark:text-zinc-200'
              }`}>
                <HelpCircle size={13} className="text-slate-500" />
                <span>Missing Blindspots</span>
              </div>
              <ul className="space-y-2">
                {synthesis.missingInformation.map((info, idx) => (
                  <li key={idx} className={`p-2.5 rounded-lg leading-relaxed ${
                    highContrast
                      ? 'bg-slate-100 dark:bg-zinc-900 border-2 border-slate-300 font-medium text-black dark:text-white'
                      : 'bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200/60 font-normal text-slate-600 dark:text-zinc-400'
                  }`}>
                    {info}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Actionable Next Steps ── */}
          <div className={`p-5 rounded-2xl ${
            highContrast
              ? 'bg-white dark:bg-zinc-950 border-2 border-slate-400 dark:border-zinc-600 shadow-sm'
              : 'bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] shadow-xs'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`flex items-center gap-2 text-xs uppercase tracking-wider ${
                highContrast ? 'font-black text-black dark:text-white' : 'font-semibold text-slate-800 dark:text-zinc-200'
              }`}>
                <CheckSquare size={14} className="text-slate-500" />
                <span>Recommended Action Items</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {synthesis.recommendedActions.map((act) => (
                <div
                  key={act.id}
                  className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                    highContrast
                      ? 'bg-slate-100 dark:bg-zinc-900 border-2 border-slate-300 dark:border-zinc-700'
                      : 'bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-700/60 hover:bg-white dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded ${
                      highContrast
                        ? 'font-bold bg-slate-200 dark:bg-zinc-700 text-black dark:text-white border border-slate-400'
                        : 'font-semibold bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-200'
                    }`}>
                      {act.priority}
                    </span>
                    <span className={`text-xs truncate ${
                      highContrast ? 'font-black text-black dark:text-white' : 'font-semibold text-slate-800 dark:text-zinc-200'
                    }`}>
                      {act.title}
                    </span>
                    <span className={`text-[11px] truncate ${
                      highContrast ? 'font-bold text-slate-700' : 'font-normal text-slate-500'
                    }`}>
                      (Assignee: {act.assignee})
                    </span>
                  </div>

                  {(() => {
                    const isAdded = addedTaskIds.has(act.id);
                    return (
                      <button
                        type="button"
                        disabled={isAdded}
                        onClick={() => {
                          setAddedTaskIds(prev => new Set([...prev, act.id]));
                          if (onAddActionToTasks) onAddActionToTasks(act);
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                          isAdded
                            ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-200 border-emerald-400 dark:border-emerald-700 cursor-default'
                            : highContrast
                            ? 'bg-white dark:bg-zinc-900 border-2 border-slate-400 dark:border-zinc-600 text-black dark:text-white font-bold'
                            : 'bg-white/80 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 text-slate-700 dark:text-zinc-300'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check size={12} className="text-emerald-700 dark:text-emerald-300" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <Plus size={12} />
                            <span>Add to Tasks</span>
                          </>
                        )}
                      </button>
                    );
                  })()}
                </div>
              ))}
            </div>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

