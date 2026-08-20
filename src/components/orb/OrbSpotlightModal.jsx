import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Network, Layers, X, Maximize2, Minimize2,
  Compass, ArrowRight, CornerDownLeft, Command, HelpCircle,
  SlidersHorizontal, CheckSquare, Eye
} from 'lucide-react';
import { OrbIcon, RegaarderAiIcon, RegaarderProductIcon } from '../RegaarderProductIcons';
import OrbSearchResultsView from './OrbSearchResultsView';
import OrbMapCanvas from './OrbMapCanvas';
import OrbUnderstandPanel from './OrbUnderstandPanel';
import OrbDecideSynthesizer from './OrbDecideSynthesizer';
import { useHighContrast } from '../../services/accessibilitySettingsService';
import { 
  INITIAL_ORB_ENTITIES, 
  INITIAL_ORB_EDGES, 
  searchWorkspaceIntelligence,
  extractLiveEntitiesFromWorkspace
} from '../../services/orbKnowledgeGraphService';

export const ORB_MODES = [
  { id: 'search', label: 'Intelligence Search', icon: Search, shortcut: '⌘1' },
  { id: 'map', label: 'Map (Graph)', icon: Network, shortcut: '⌘2' },
  { id: 'understand', label: 'Understand', icon: Layers, shortcut: '⌘3' },
  { id: 'decide', label: 'Decide', icon: RegaarderAiIcon, shortcut: '⌘4' },
];

export default function OrbSpotlightModal({
  isOpen,
  onClose,
  initialQuery = '',
  initialMode = 'search',
  liveWorkspaceContext = {},
  onNavigateToEntity,
  onAddTask
}) {
  const [isHighContrast, toggleHighContrast] = useHighContrast();
  const [query, setQuery] = useState(initialQuery);
  const [activeMode, setActiveMode] = useState(initialMode);
  const [activeLens, setActiveLens] = useState('timeline');
  const [workspaceFilter, setWorkspaceFilter] = useState('all');
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const searchInputRef = useRef(null);

  // Sync initial props
  useEffect(() => {
    if (isOpen) {
      if (initialQuery) setQuery(initialQuery);
      if (initialMode) setActiveMode(initialMode);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialQuery, initialMode]);

  // Global keydown listeners for shortcuts (Esc, ⌘1-⌘4, Enter)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '1') {
        e.preventDefault();
        setActiveMode('search');
      } else if ((e.metaKey || e.ctrlKey) && e.key === '2') {
        e.preventDefault();
        setActiveMode('map');
      } else if ((e.metaKey || e.ctrlKey) && e.key === '3') {
        e.preventDefault();
        setActiveMode('understand');
      } else if ((e.metaKey || e.ctrlKey) && e.key === '4') {
        e.preventDefault();
        setActiveMode('decide');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Ingest live workspace context and merge with organizational memory
  const { allEntities, allEdges } = useMemo(() => {
    const { liveEntities, liveEdges } = extractLiveEntitiesFromWorkspace(liveWorkspaceContext);
    
    // Deduplicate by ID
    const entityMap = new Map();
    INITIAL_ORB_ENTITIES.forEach(e => entityMap.set(e.id, e));
    liveEntities.forEach(e => entityMap.set(e.id, e));

    const edgeMap = new Map();
    INITIAL_ORB_EDGES.forEach(edge => edgeMap.set(edge.id, edge));
    liveEdges.forEach(edge => edgeMap.set(edge.id, edge));

    return {
      allEntities: Array.from(entityMap.values()),
      allEdges: Array.from(edgeMap.values())
    };
  }, [liveWorkspaceContext]);

  // Run Semantic Search Query
  const searchResults = useMemo(() => {
    return searchWorkspaceIntelligence(query, {
      workspaceFilter,
      entities: allEntities,
      edges: allEdges
    });
  }, [query, workspaceFilter, allEntities, allEdges]);

  // Selected active entity and edge objects
  const selectedEntity = useMemo(() => {
    return allEntities.find(e => e.id === selectedEntityId) || null;
  }, [selectedEntityId, allEntities]);

  const selectedEdge = useMemo(() => {
    return allEdges.find(e => e.id === selectedEdgeId) || null;
  }, [selectedEdgeId, allEdges]);

  // Navigation Deep-Link handler
  const handleNavigate = (entity) => {
    if (onNavigateToEntity) {
      onNavigateToEntity(entity);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 md:p-10 animate-in fade-in duration-150"
      style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
    >
      {/* Translucent Backdrop Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Main Orb Container: Neutral Colorless Glass Shell */}
      <div 
        className={`relative flex flex-col backdrop-blur-2xl ring-1 shadow-2xl rounded-3xl overflow-hidden transition-all duration-200 z-10 ${
          isHighContrast
            ? 'bg-white dark:bg-zinc-950 border-2 border-slate-400 dark:border-zinc-500 ring-slate-400'
            : 'bg-white/80 dark:bg-[#12141a]/85 border border-black/[0.08] dark:border-white/[0.08] ring-slate-900/5 dark:ring-black/40'
        } ${
          isFullscreen 
            ? 'w-full h-full max-w-none rounded-none' 
            : 'w-full max-w-5xl h-[88vh] max-h-[820px]'
        }`}
      >
        {/* ── Top Header Bar: Darker & Recessed Luminance Hierarchy ── */}
        <div className={`flex flex-col border-b backdrop-blur-xl shrink-0 ${
          isHighContrast
            ? 'border-b-2 border-slate-300 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-950'
            : 'border-b border-black/[0.06] dark:border-white/[0.06] bg-slate-50/70 dark:bg-zinc-950/60'
        }`}>
          <div className="flex items-center justify-between px-6 pt-3.5 pb-2.5">
            {/* Orb Brand Mark */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-950 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center shadow-xs">
                <OrbIcon size={17} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className={`text-sm tracking-tight ${isHighContrast ? 'font-black text-black dark:text-white' : 'font-semibold text-slate-900 dark:text-zinc-100'}`}>
                    Orb
                  </span>
                  <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    isHighContrast
                      ? 'font-bold border-2 border-slate-500 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-slate-950 dark:text-zinc-100'
                      : 'font-medium border border-slate-200/80 dark:border-zinc-700/60 bg-white/70 dark:bg-zinc-800/40 text-slate-600 dark:text-zinc-400'
                  }`}>
                    Intelligence Layer
                  </span>
                </div>
                <span className={`text-[11px] ${isHighContrast ? 'font-bold text-slate-800 dark:text-zinc-300' : 'font-normal text-slate-500 dark:text-zinc-400'}`}>
                  Cross-workspace discovery & organizational reasoning
                </span>
              </div>
            </div>

            {/* 4 Mode Tabs (Strictly styled as slightly rounded rectangular outlines, no pill shapes) */}
            <div className={`flex items-center gap-1.5 p-1 rounded-xl ${
              isHighContrast
                ? 'bg-slate-100 dark:bg-zinc-900 border-2 border-slate-300 dark:border-zinc-700'
                : 'bg-slate-100/80 dark:bg-zinc-900/60 border border-black/[0.04] dark:border-white/[0.06]'
            }`}>
              {ORB_MODES.map(mode => {
                const isActive = activeMode === mode.id;
                const IconComponent = mode.icon;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setActiveMode(mode.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg transition-all duration-150 cursor-pointer ${
                      isActive
                        ? isHighContrast
                          ? 'border-2 border-[#7C5ACF] dark:border-[#a78bfa] bg-white dark:bg-zinc-800 text-[#7C5ACF] dark:text-[#a78bfa] font-extrabold shadow-sm'
                          : 'border-2 border-[#7C5ACF] dark:border-[#8B6FD1] bg-white dark:bg-zinc-800 text-[#7C5ACF] dark:text-[#a78bfa] font-semibold shadow-xs'
                        : isHighContrast
                        ? 'border-2 border-transparent text-slate-900 dark:text-zinc-100 hover:border-slate-400 font-bold'
                        : 'border border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-zinc-800/60 font-medium'
                    }`}
                  >
                    <IconComponent size={14} className={isActive ? 'text-[#7C5ACF] dark:text-[#a78bfa]' : 'text-slate-500'} />
                    <span>{mode.label}</span>
                    <span className="text-[10px] text-slate-400 hidden sm:inline font-mono">
                      {mode.shortcut}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1.5">
              {/* Quick Visual Disability / High Contrast Accessibility Toggle */}
              <button
                type="button"
                onClick={toggleHighContrast}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isHighContrast
                    ? 'bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border-2 border-violet-500 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-white/80 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/60 font-medium'
                }`}
                title={isHighContrast ? "Visual Disabilities Mode: ON (High Contrast & Crisp Borders)" : "Visual Disabilities Mode: OFF (Calm Neutral Glassmorphism)"}
              >
                <Eye size={14} />
                <span className="text-[10px] uppercase tracking-wider hidden sm:inline">
                  {isHighContrast ? 'A11y: ON' : 'A11y'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsFullscreen(f => !f)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-white/60 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-white/60 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer ml-1"
                title="Close (Esc)"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* ── Search Input Row (Active in Search / Find Mode) ── */}
          {activeMode === 'search' && (
            <div className="px-6 pb-3.5 pt-1">
              <div className="relative flex items-center">
                <Search size={16} className="absolute left-4 text-slate-400 dark:text-zinc-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search across docs, spreadsheets, slides, meetings, and organizational memory..."
                  className={`w-full pl-11 pr-24 py-2.5 rounded-2xl text-sm focus:outline-none transition-all ${
                    isHighContrast
                      ? 'border-2 border-slate-400 dark:border-zinc-500 bg-white dark:bg-zinc-900 text-black dark:text-white placeholder-slate-500 font-bold'
                      : 'border border-black/[0.08] dark:border-white/[0.08] bg-white/90 dark:bg-zinc-900/90 text-slate-800 dark:text-zinc-100 placeholder-slate-400 font-normal focus:ring-2 focus:ring-violet-500/15'
                  }`}
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Dynamic Main View Port ── */}
        <div className="flex-1 min-h-0 overflow-hidden relative">
          {/* Mode 1: Search & Intelligence */}
          {activeMode === 'search' && (
            <OrbSearchResultsView
              query={query}
              results={searchResults.results}
              suggestedQuestions={searchResults.suggestedQuestions}
              workspaceFilter={workspaceFilter}
              highContrast={isHighContrast}
              onSelectWorkspaceFilter={setWorkspaceFilter}
              onSelectEntity={(entity) => {
                setSelectedEntityId(entity.id);
                setActiveMode('understand');
              }}
              onSwitchToMap={(entity) => {
                setSelectedEntityId(entity.id);
                setActiveMode('map');
              }}
              onSwitchToUnderstand={(entity) => {
                setSelectedEntityId(entity.id);
                setActiveMode('understand');
              }}
              onSwitchToDecide={(question) => {
                setQuery(question);
                setActiveMode('decide');
              }}
              onNavigateToWorkspace={handleNavigate}
            />
          )}

          {/* Mode 2: Interactive Map (Knowledge Graph) */}
          {activeMode === 'map' && (
            <OrbMapCanvas
              entities={searchResults.results.map(r => r.entity)}
              edges={searchResults.matchedEdges}
              activeLens={activeLens}
              selectedEntityId={selectedEntityId}
              selectedEdgeId={selectedEdgeId}
              highContrast={isHighContrast}
              onSelectLens={setActiveLens}
              onSelectEntity={(entity) => {
                setSelectedEntityId(entity.id);
              }}
              onSelectEdge={(edge) => {
                setSelectedEdgeId(edge.id);
                setActiveMode('understand');
              }}
              onNavigateToWorkspace={handleNavigate}
            />
          )}

          {/* Mode 3: Understand (Provenance & Evidence Explorer) */}
          {activeMode === 'understand' && (
            <OrbUnderstandPanel
              selectedEdge={selectedEdge}
              selectedEntity={selectedEntity}
              entities={allEntities}
              edges={allEdges}
              highContrast={isHighContrast}
              onSelectEdge={setSelectedEdgeId}
              onSelectEntity={(entity) => setSelectedEntityId(entity.id)}
              onNavigateToWorkspace={handleNavigate}
            />
          )}

          {/* Mode 4: Decide (Strategic Decision Synthesizer) */}
          {activeMode === 'decide' && (
            <OrbDecideSynthesizer
              initialQuestion={query}
              entities={allEntities}
              edges={allEdges}
              highContrast={isHighContrast}
              onNavigateToWorkspace={handleNavigate}
              onAddActionToTasks={(act) => {
                if (onAddTask) onAddTask(act);
              }}
            />
          )}
        </div>

        {/* ── Bottom Status Bar ── */}
        <div className="flex items-center justify-between px-6 py-2 border-t border-slate-200/60 dark:border-zinc-800/80 bg-slate-50/60 dark:bg-zinc-900/60 text-[11px] text-slate-400 dark:text-zinc-500 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Unified Cross-Workspace Intelligence active</span>
            </span>
            <span>•</span>
            <span>{allEntities.length} indexed entities</span>
            <span>•</span>
            <span>{allEdges.length} semantic relationships</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-[10px] font-mono">⌘K</kbd>
              <span>Toggle Orb</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-[10px] font-mono">Esc</kbd>
              <span>Close</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
