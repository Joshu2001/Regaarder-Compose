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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const searchInputRef = useRef(null);

  // Sync initial props
  useEffect(() => {
    if (isOpen) {
      if (initialQuery) setQuery(initialQuery);
      if (initialMode) setActiveMode(initialMode);
      setSelectedIndex(0);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialQuery, initialMode]);

  // Ingest live workspace context - strictly real data only
  const { allEntities, allEdges } = useMemo(() => {
    const { liveEntities, liveEdges } = extractLiveEntitiesFromWorkspace(liveWorkspaceContext);
    
    // Deduplicate by ID
    const entityMap = new Map();
    liveEntities.forEach(e => entityMap.set(e.id, e));

    const edgeMap = new Map();
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

  // Reset keyboard selected index on query or filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, workspaceFilter]);

  // Navigation Deep-Link handler
  const handleNavigate = (entity) => {
    if (onNavigateToEntity) {
      onNavigateToEntity(entity);
    }
    onClose();
  };

  // Global keydown listeners for shortcuts (Esc, ⌘1-⌘4, Arrows, Enter, Tab)
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

      // Keyboard-First Result Traversal (Spotlight / Raycast UX)
      if (activeMode === 'search' && searchResults.results.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => (prev === null ? 0 : Math.min(searchResults.results.length - 1, prev + 1)));
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => (prev === null || prev <= 0 ? 0 : prev - 1));
          return;
        }
        if (e.key === 'Enter') {
          if (selectedIndex !== null && searchResults.results[selectedIndex]) {
            e.preventDefault();
            handleNavigate(searchResults.results[selectedIndex].entity);
            return;
          }
        }
        if (e.key === 'Tab') {
          if (selectedIndex !== null && searchResults.results[selectedIndex]) {
            e.preventDefault();
            setSelectedEntityId(searchResults.results[selectedIndex].entity.id);
            setActiveMode('understand');
            return;
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, activeMode, searchResults.results, selectedIndex, handleNavigate]);

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

      {/* Main Orb Container: Restrained Apple-tier Glass Surface Shell */}
      <div 
        className={`relative flex flex-col backdrop-blur-2xl shadow-2xl rounded-2xl overflow-hidden transition-all duration-200 z-10 ${
          isHighContrast
            ? 'bg-white dark:bg-zinc-950 border-2 border-slate-400 dark:border-zinc-500 ring-slate-400'
            : 'bg-white/94 dark:bg-[#12141a]/94 border border-black/[0.08] dark:border-white/[0.08] shadow-[0_24px_70px_rgba(0,0,0,0.18)]'
        } ${
          isFullscreen 
            ? 'w-[98vw] h-[96vh] max-w-none' 
            : 'w-[96vw] max-w-7xl h-[90vh] max-h-[880px]'
        }`}
      >
        {/* ── Top Header Bar: Clean, Integrated & Minimal ── */}
        <div className={`flex flex-col border-b shrink-0 ${
          isHighContrast
            ? 'border-b-2 border-slate-300 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-950'
            : 'border-b border-black/[0.04] dark:border-white/[0.05] bg-white/40 dark:bg-zinc-950/40'
        }`}>
          <div className="flex items-center justify-between px-6 pt-3.5 pb-2.5">
            {/* Orb Brand Mark */}
            <div className="flex items-center gap-2.5">
              <div className="w-8.5 h-8.5 rounded-xl bg-violet-50/90 dark:bg-violet-950/60 text-[#7C5ACF] dark:text-[#a78bfa] border border-violet-100/90 dark:border-violet-800/60 flex items-center justify-center shadow-2xs">
                <OrbIcon size={19} />
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm tracking-tight ${isHighContrast ? 'font-black text-black dark:text-white' : 'font-semibold text-slate-900 dark:text-zinc-100'}`}>
                  Orb
                </span>
                <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  isHighContrast
                    ? 'font-bold border-2 border-slate-500 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-slate-950 dark:text-zinc-100'
                    : 'font-semibold bg-slate-100/80 dark:bg-zinc-800/80 text-slate-500 dark:text-zinc-400 border border-slate-200/50 dark:border-zinc-700/50'
                }`}>
                  Intelligence Layer
                </span>
              </div>
            </div>

            {/* 4 Mode Tabs (Flat slightly rounded rectangular outlines, no pills) */}
            <div className="flex items-center gap-1 p-0.5">
              {ORB_MODES.map(mode => {
                const isActive = activeMode === mode.id;
                const IconComponent = mode.icon;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setActiveMode(mode.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all duration-150 cursor-pointer ${
                      isActive
                        ? isHighContrast
                          ? 'border-2 border-slate-900 bg-white dark:bg-zinc-800 text-black dark:text-white font-extrabold shadow-sm'
                          : 'border border-slate-200/90 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-semibold shadow-2xs'
                        : isHighContrast
                        ? 'border border-transparent text-slate-900 dark:text-zinc-100 hover:border-slate-400 font-bold'
                        : 'border border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04] font-medium'
                    }`}
                  >
                    <IconComponent size={13} className={isActive ? 'text-slate-900 dark:text-zinc-100' : 'text-slate-400'} />
                    <span>{mode.label}</span>
                    <span className="text-[10px] text-slate-400/80 hidden sm:inline font-mono">
                      {mode.shortcut}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleHighContrast}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  isHighContrast
                    ? 'bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border-2 border-violet-500 font-extrabold'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                }`}
                title={isHighContrast ? "Visual Disabilities Mode: ON" : "Visual Disabilities Mode: OFF"}
              >
                <Eye size={14} />
              </button>

              <button
                type="button"
                onClick={() => setIsFullscreen(f => !f)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* ── Search Input: Integrated & Clean ── */}
          {activeMode === 'search' && (
            <div className="px-6 pt-0.5 pb-3">
              <div className="relative flex items-center">
                <Search size={15} className="absolute left-3 text-slate-400 dark:text-zinc-500 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search across documents, spreadsheets, slides, and tasks..."
                  className={`w-full pl-9 pr-8 py-2 rounded-xl text-[13.5px] focus:outline-none transition-all ${
                    isHighContrast
                      ? 'bg-white dark:bg-zinc-950 border-2 border-slate-400 dark:border-zinc-600 focus:border-slate-600 text-black dark:text-white font-bold'
                      : 'bg-slate-100/60 dark:bg-zinc-800/40 border border-black/[0.04] dark:border-white/[0.05] focus:border-slate-300 dark:focus:border-zinc-600 focus:bg-white dark:focus:bg-zinc-900 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400/80'
                  }`}
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-2.5 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Dynamic Main View Port ── */}
        <div className="flex-1 min-h-0 overflow-hidden relative">
          {activeMode === 'search' && (
            <OrbSearchResultsView
              query={query}
              results={searchResults.results}
              suggestedQuestions={searchResults.suggestedQuestions}
              workspaceFilter={workspaceFilter}
              highContrast={isHighContrast}
              selectedIndex={selectedIndex}
              onSelectIndex={setSelectedIndex}
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

        {/* ── Bottom Status Bar: Minimal & Readable ── */}
        <div className="flex items-center justify-between px-6 py-2.5 border-t border-black/[0.04] dark:border-white/[0.05] text-xs text-slate-500 dark:text-zinc-400 bg-slate-50/50 dark:bg-zinc-900/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="font-semibold text-slate-700 dark:text-zinc-300">Orb Active</span>
            </span>
            <span>•</span>
            <span>{allEntities.length} entities</span>
            <span>•</span>
            <span>{allEdges.length} relationships</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            {activeMode === 'search' && searchResults.results.length > 0 && (
              <>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-black/[0.05] dark:bg-white/[0.08] text-slate-600 dark:text-zinc-300 font-semibold border border-black/[0.04] dark:border-white/[0.06]">↑↓</kbd>
                  <span>Navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-black/[0.05] dark:bg-white/[0.08] text-slate-600 dark:text-zinc-300 font-semibold border border-black/[0.04] dark:border-white/[0.06]">↵</kbd>
                  <span>Open</span>
                </span>
                <span>•</span>
              </>
            )}
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-black/[0.05] dark:bg-white/[0.08] text-slate-600 dark:text-zinc-300 font-semibold border border-black/[0.04] dark:border-white/[0.06]">⌘1-4</kbd>
              <span>Modes</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-black/[0.05] dark:bg-white/[0.08] text-slate-600 dark:text-zinc-300 font-semibold border border-black/[0.04] dark:border-white/[0.06]">Esc</kbd>
              <span>Close</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
