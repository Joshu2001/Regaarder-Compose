import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Network, Layers, Sparkles, X, Maximize2, Minimize2,
  Compass, ArrowRight, CornerDownLeft, Command, HelpCircle,
  SlidersHorizontal, CheckSquare
} from 'lucide-react';
import { OrbIcon, RegaarderProductIcon } from '../RegaarderProductIcons';
import OrbSearchResultsView from './OrbSearchResultsView';
import OrbMapCanvas from './OrbMapCanvas';
import OrbUnderstandPanel from './OrbUnderstandPanel';
import OrbDecideSynthesizer from './OrbDecideSynthesizer';
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
  { id: 'decide', label: 'Decide', icon: Sparkles, shortcut: '⌘4' },
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
  const [query, setQuery] = useState(initialQuery);
  const [activeMode, setActiveMode] = useState(initialMode);
  const [activeLens, setActiveLens] = useState('timeline');
  const [workspaceFilter, setWorkspaceFilter] = useState('all');
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
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

      {/* Main Orb Container */}
      <div 
        className={`relative flex flex-col bg-white/92 dark:bg-[#16161a]/94 backdrop-blur-3xl border border-white/60 dark:border-white/10 ring-1 ring-slate-900/5 dark:ring-black/40 shadow-2xl rounded-3xl overflow-hidden transition-all duration-200 z-10 ${
          isFullscreen 
            ? 'w-full h-full max-w-none rounded-none' 
            : 'w-full max-w-5xl h-[88vh] max-h-[820px]'
        }`}
      >
        {/* ── Top Header Bar with Orb Branding, Search Input & Mode Tabs ── */}
        <div className="flex flex-col border-b border-slate-200/70 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl shrink-0">
          <div className="flex items-center justify-between px-6 pt-4 pb-3">
            {/* Orb Brand Mark */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7C5ACF] to-[#a78bfa] text-white flex items-center justify-center shadow-md shadow-[#7C5ACF]/20">
                <OrbIcon size={18} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
                    Orb
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded bg-violet-100 dark:bg-violet-950 text-[#7C5ACF] dark:text-[#a78bfa]">
                    Intelligence Layer
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                  Cross-workspace discovery & organizational reasoning
                </span>
              </div>
            </div>

            {/* 4 Mode Tabs (Strictly styled as slightly rounded rectangular outlines, no pill shapes) */}
            <div className="flex items-center gap-1 bg-slate-100/70 dark:bg-zinc-800/60 p-1 rounded-xl border border-slate-200/60 dark:border-zinc-700/60">
              {ORB_MODES.map(mode => {
                const isActive = activeMode === mode.id;
                const IconComponent = mode.icon;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setActiveMode(mode.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'border border-[#7C5ACF] dark:border-[#8B6FD1] bg-white dark:bg-zinc-800 text-[#7C5ACF] dark:text-[#a78bfa] shadow-xs'
                        : 'border border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-white/50 dark:hover:bg-zinc-700/50'
                    }`}
                  >
                    <IconComponent size={14} />
                    <span>{mode.label}</span>
                    <span className="text-[10px] opacity-50 hidden sm:inline font-mono">
                      {mode.shortcut}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                title="Close (Esc)"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Search Input Field in Search & Map modes */}
          {(activeMode === 'search' || activeMode === 'map') && (
            <div className="px-6 pb-3 pt-1">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" size={17} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search a concept, project, person, number, formula, or decision across all applications..."
                  className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-white/80 dark:bg-zinc-800/80 text-sm text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 shadow-inner"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
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
