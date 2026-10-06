import { useTranslation } from '../../i18n';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ZoomIn, ZoomOut, Maximize2, RefreshCw, Filter, 
  Layers, ArrowRight, CornerDownRight, Info, AlertTriangle, Eye,
  Hand, Move, Network, Calendar, ChevronLeft, ChevronRight, X, Play, Pause, Clock
} from 'lucide-react';
import { RegaarderProductIcon } from '../RegaarderProductIcons';
import { ORB_LENSES, computeLensLayout } from '../../services/orbKnowledgeGraphService';

export const LENS_EMPTY_STATES = {
  timeline: {
    title: 'No Timeline Events Yet',
    desc: 'Chronological progression from assumptions to decisions and milestones will appear as dated artifacts and meetings are indexed.'
  },
  dependencies: {
    title: 'No Dependencies Connected Yet',
    desc: 'Upstream prerequisites, blocking deliverables, and formula dependencies between documents and models will be mapped here.'
  },
  decisions: {
    title: 'No Decisions Documented Yet',
    desc: 'Strategic choices, board resolutions, and rationale memos across your workspace will cluster here.'
  },
  projects: {
    title: 'No Projects Clustered Yet',
    desc: 'Artifacts grouped by initiative, workstream, or tag will organize into visual project clusters.'
  },
  people: {
    title: 'No Stakeholder Mappings Yet',
    desc: 'Document authors, assignees, meeting speakers, and collaborators will be mapped around their deliverables.'
  },
  financial: {
    title: 'No Financial Models Connected Yet',
    desc: 'Spreadsheet models, cell formulas, capex breakdowns, and revenue models will connect here.'
  },
  knowledge: {
    title: 'No Knowledge Clusters Yet',
    desc: 'Shared concepts, recurring themes, and cross-workspace terminology will emerge as you add content.'
  },
  causal: {
    title: 'No Causal Risk Chains Yet',
    desc: 'Cause-and-effect pathways, supply chain dependencies, and sensitivity triggers will be traced here.'
  },
  ai: {
    title: 'No AI Inferences Discovered Yet',
    desc: 'Orb automatically surfaces latent relationships and anomaly patterns between your workspace artifacts.'
  }
};

export default function OrbMapCanvas({
  entities = [],
  edges = [],
  activeLens = 'timeline',
  selectedEntityId,
  selectedEdgeId,
  highContrast = false,
  onSelectLens,
  onSelectEntity,
  onSelectEdge,
  onNavigateToWorkspace
}) {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 920, height: 560 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState(null);
  const [expandedNodeIds, setExpandedNodeIds] = useState(new Set());

  // Timeline Date Search & Time Scrubber State
  const [timelineDateQuery, setTimelineDateQuery] = useState('');
  const [timelinePreset, setTimelinePreset] = useState('all'); // 'all' | '7d' | '30d' | 'quarter'
  const [timelineStepIndex, setTimelineStepIndex] = useState(null);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState(false);

  const activePointersRef = useRef(new Map());
  const pinchStartDistRef = useRef(null);
  const pinchStartZoomRef = useRef(1);
  const hasDraggedRef = useRef(false);

  // Measure container size
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.max(600, rect.width),
          height: Math.max(450, rect.height)
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Compute spatial layout for the current active lens
  const { nodes, links } = useMemo(() => {
    return computeLensLayout(activeLens, entities, edges, dimensions);
  }, [activeLens, entities, edges, dimensions]);

  // Sort timeline nodes chronologically
  const sortedTimelineNodes = useMemo(() => {
    return [...nodes].sort((a, b) => new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0));
  }, [nodes]);

  // Compute active timeline nodes matching date query & horizon presets
  const timelineFilteredNodes = useMemo(() => {
    if (activeLens !== 'timeline') return nodes;

    const now = Date.now();
    return sortedTimelineNodes.filter((node, idx) => {
      // 1. Step Scrubber filter (if set, nodes after step index are hidden/dimmed)
      if (timelineStepIndex !== null && idx > timelineStepIndex) return false;

      // 2. Horizon presets filter
      if (timelinePreset === '7d') {
        const nodeTime = new Date(node.updatedAt || 0).getTime();
        if (now - nodeTime > 7 * 24 * 3600 * 1000) return false;
      } else if (timelinePreset === '30d') {
        const nodeTime = new Date(node.updatedAt || 0).getTime();
        if (now - nodeTime > 30 * 24 * 3600 * 1000) return false;
      } else if (timelinePreset === 'quarter') {
        const d = new Date(node.updatedAt || 0);
        const currentQuarter = Math.floor(new Date().getMonth() / 3);
        const nodeQuarter = Math.floor(d.getMonth() / 3);
        if (d.getFullYear() !== new Date().getFullYear() || nodeQuarter !== currentQuarter) return false;
      }

      // 3. Search Date / Text query filter
      if (timelineDateQuery && timelineDateQuery.trim()) {
        const q = timelineDateQuery.toLowerCase().trim();
        const dateStr = (node.updatedAt || '').toLowerCase();
        const titleStr = (node.title || '').toLowerCase();
        const contentStr = (node.content || '').toLowerCase();
        const tagsStr = (node.tags || []).join(' ').toLowerCase();
        const dueStr = (node.metadata?.dueDate || '').toLowerCase();
        const timeStr = (node.metadata?.time || '').toLowerCase();

        const matches = dateStr.includes(q) || titleStr.includes(q) || contentStr.includes(q) || tagsStr.includes(q) || dueStr.includes(q) || timeStr.includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [nodes, sortedTimelineNodes, activeLens, timelineStepIndex, timelinePreset, timelineDateQuery]);

  const activeTimelineNodeIds = useMemo(() => {
    if (activeLens !== 'timeline') return null;
    return new Set(timelineFilteredNodes.map(n => n.id));
  }, [activeLens, timelineFilteredNodes]);

  // Auto-advance timeline playback
  useEffect(() => {
    if (!isPlayingTimeline || activeLens !== 'timeline' || sortedTimelineNodes.length === 0) return;

    const interval = setInterval(() => {
      setTimelineStepIndex((prev) => {
        const next = (prev === null ? 0 : prev + 1);
        if (next >= sortedTimelineNodes.length) {
          setIsPlayingTimeline(false);
          return sortedTimelineNodes.length - 1;
        }
        return next;
      });
    }, 1100);

    return () => clearInterval(interval);
  }, [isPlayingTimeline, activeLens, sortedTimelineNodes.length]);

  // Non-passive wheel & trackpad listener for 2-finger swipe pan and pinch-zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        // Trackpad pinch-to-zoom or Ctrl+wheel zoom
        const zoomDelta = e.deltaY < 0 ? 1.05 : 0.95;
        setZoom((prevZoom) => {
          const nextZoom = Math.min(2.5, Math.max(0.35, prevZoom * zoomDelta));
          const rect = el.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          setPan((prevPan) => ({
            x: mouseX - (mouseX - prevPan.x) * (nextZoom / prevZoom),
            y: mouseY - (mouseY - prevPan.y) * (nextZoom / prevZoom)
          }));
          return nextZoom;
        });
      } else {
        // 2-finger trackpad swipe or mouse wheel pan
        setPan((prevPan) => ({
          x: prevPan.x - e.deltaX * 1.1,
          y: prevPan.y - e.deltaY * 1.1
        }));
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  // Pointer & Hand Gesture Down (Mouse, Touch, Stylus)
  const handlePointerDown = (e) => {
    // If clicked inside an interactive button or floating inspector, ignore canvas drag
    if (e.target.closest('[data-no-pan="true"]') || e.target.closest('button')) {
      return;
    }

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}

    hasDraggedRef.current = false;
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size === 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    } else if (activePointersRef.current.size === 2) {
      // 2-finger touch pinch gesture start
      const pts = Array.from(activePointersRef.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pinchStartDistRef.current = dist;
      pinchStartZoomRef.current = zoom;
    }
  };

  const handlePointerMove = (e) => {
    if (!activePointersRef.current.has(e.pointerId)) return;
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size === 1 && isDragging) {
      const dx = e.clientX - (dragStart.x + pan.x);
      const dy = e.clientY - (dragStart.y + pan.y);
      if (Math.hypot(dx, dy) > 3) {
        hasDraggedRef.current = true;
      }
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else if (activePointersRef.current.size === 2 && pinchStartDistRef.current) {
      hasDraggedRef.current = true;
      const pts = Array.from(activePointersRef.current.values());
      const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const ratio = currentDist / pinchStartDistRef.current;
      const nextZoom = Math.min(2.5, Math.max(0.35, pinchStartZoomRef.current * ratio));
      setZoom(nextZoom);
    }
  };

  const handlePointerUp = (e) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}
    activePointersRef.current.delete(e.pointerId);

    if (activePointersRef.current.size === 0) {
      setIsDragging(false);
      pinchStartDistRef.current = null;
    } else if (activePointersRef.current.size === 1) {
      const remainingPt = Array.from(activePointersRef.current.values())[0];
      setDragStart({ x: remainingPt.x - pan.x, y: remainingPt.y - pan.y });
    }
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Track connected nodes for focal highlighting
  const activeFocusEntityId = hoveredNodeId || selectedEntityId;
  const connectedNodeIds = useMemo(() => {
    if (!activeFocusEntityId) return null;
    const set = new Set([activeFocusEntityId]);
    links.forEach(l => {
      if (l.sourceId === activeFocusEntityId) set.add(l.targetId);
      if (l.targetId === activeFocusEntityId) set.add(l.sourceId);
    });
    return set;
  }, [activeFocusEntityId, links]);

  // Node progressive expansion toggle
  const handleNodeClick = (e, node) => {
    e.stopPropagation();
    if (hasDraggedRef.current) return;
    onSelectEntity(node);
    setExpandedNodeIds(prev => {
      const next = new Set(prev);
      if (next.has(node.id)) next.delete(node.id);
      else next.add(node.id);
      return next;
    });
  };

  const activeLensMeta = ORB_LENSES.find(l => l.id === activeLens) || ORB_LENSES[0];

  return (
    <div className="flex flex-col h-full w-full select-none overflow-hidden bg-[#16181f] dark:bg-[#0e1015] relative">
      {/* ── Top Lens Switcher Toolbar: Floating Glass Bar ── */}
      <div 
        data-no-pan="true"
        className={`flex items-center justify-between px-7 py-2.5 border-b z-20 shrink-0 ${
          highContrast
            ? 'border-slate-300 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-950'
            : 'border-white/[0.08] bg-black/[0.25] backdrop-blur-md'
        }`}
      >
        <div className="flex items-center gap-1.5 overflow-x-auto thin-scrollbar py-0.5">
          <span className={`text-[11px] uppercase tracking-widest mr-2 select-none ${
            highContrast ? 'font-black text-black dark:text-white' : 'font-bold text-slate-400 dark:text-zinc-400'
          }`}>
            {t('orb.lenses') || 'Lenses:'}
          </span>
          {ORB_LENSES.map(lens => {
            const isActive = activeLens === lens.id;
            return (
              <button
                key={lens.id}
                type="button"
                onClick={() => onSelectLens(lens.id)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? highContrast
                      ? 'border-2 border-slate-900 dark:border-white bg-white dark:bg-zinc-800 text-black dark:text-white font-extrabold shadow-sm'
                      : 'border border-slate-200/90 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-semibold shadow-2xs outline outline-1 outline-violet-500/40'
                    : highContrast
                    ? 'border-2 border-transparent bg-slate-100 dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 hover:border-slate-400 font-bold'
                    : 'border border-transparent text-slate-400 dark:text-zinc-400 hover:text-white dark:hover:text-white hover:bg-white/[0.06] font-medium'
                }`}
                title={lens.desc}
              >
                {t('orb.lens.' + lens.id) || lens.label}
              </button>
            );
          })}
        </div>

        {/* Zoom, Gesture & Canvas controls */}
        <div className="flex items-center gap-1.5 shrink-0 pl-3">
          <button
            type="button"
            onClick={() => setZoom(z => Math.max(0.35, z - 0.15))}
            className="w-7 h-7 rounded-full flex items-center justify-center border border-slate-200/80 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors shadow-2xs cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>
          <span className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300 px-1 min-w-[38px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}
            className="w-7 h-7 rounded-full flex items-center justify-center border border-slate-200/80 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors shadow-2xs cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={13} />
          </button>
          <button
            type="button"
            onClick={handleResetView}
            className="w-7 h-7 rounded-full flex items-center justify-center border border-slate-200/80 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors shadow-2xs ml-0.5 cursor-pointer"
            title="Reset Pan & Zoom"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* ── Active Lens Contextual Description Pill (Compact & Shortened) ── */}
      <div className="absolute top-16 left-7 z-10 pointer-events-none">
        <div className="px-3 py-1.5 rounded-lg bg-black/60 dark:bg-zinc-900/80 backdrop-blur-md border border-white/10 shadow-xs text-xs flex items-center gap-2 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7C5ACF]" />
          <span className="font-semibold text-white">{t('orb.lens.' + activeLensMeta.id) || activeLensMeta.label}</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-300 font-normal">{t('orb.lensDesc.' + activeLensMeta.id) || activeLensMeta.desc}</span>
        </div>
      </div>

      {/* ── Spatial Graph Canvas with Touch & Hand Gesture Support ── */}
      <div
        ref={containerRef}
        className={`flex-1 w-full h-full relative overflow-hidden touch-none select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <svg
          id="orb-canvas-bg"
          className="w-full h-full absolute inset-0"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <defs>
            {/* Subtle spatial coordinate grid pattern */}
            <pattern id="orb-grid" width="36" height="36" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.75" fill="#64748b" opacity="0.30" />
            </pattern>

            {/* Arrow marker for standard connections */}
            <marker
              id="orb-arrow"
              viewBox="0 0 10 10"
              refX="16"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#64748b" />
            </marker>
            {/* Arrow marker for AI Inferred connections */}
            <marker
              id="orb-arrow-ai"
              viewBox="0 0 10 10"
              refX="16"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#a78bfa" />
            </marker>
            {/* Arrow marker for Contradiction connections */}
            <marker
              id="orb-arrow-contra"
              viewBox="0 0 10 10"
              refX="16"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#f87171" />
            </marker>
          </defs>

          {/* Background Grid Rect */}
          <rect width="8000" height="8000" x="-3000" y="-3000" fill="url(#orb-grid)" />

          {/* Render Connection Edges with Clear Visual Semantics */}
          {links.map(link => {
            const isHovered = hoveredEdgeId === link.id;
            const isSelected = selectedEdgeId === link.id;
            const isAi = link.isAiInferred;
            const isContradiction = link.relationType === 'contradicts';
            const isFocused = activeFocusEntityId && (link.sourceId === activeFocusEntityId || link.targetId === activeFocusEntityId);
            const isDimmed = activeFocusEntityId && !isFocused;

            const sx = link.source.x || 100;
            const sy = link.source.y || 100;
            const tx = link.target.x || 300;
            const ty = link.target.y || 300;

            // Curved cubic bezier
            const dx = tx - sx;
            const dy = ty - sy;
            const mx = (sx + tx) / 2;
            const my = (sy + ty) / 2 - (dx * 0.12);

            const pathD = `M ${sx} ${sy} Q ${mx} ${my} ${tx} ${ty}`;

            return (
              <g
                key={link.id}
                className={`cursor-pointer group transition-opacity duration-200 ${isDimmed ? 'opacity-15' : 'opacity-100'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectEdge(link);
                }}
                onMouseEnter={() => setHoveredEdgeId(link.id)}
                onMouseLeave={() => setHoveredEdgeId(null)}
              >
                {/* Thick invisible hit area for easy hover/click */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={20}
                />
                
                {/* Visual line with Semantic Representation */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={
                    isSelected || (isFocused && !isContradiction)
                      ? '#c4b5fd'
                      : isContradiction
                      ? '#f87171'
                      : isAi
                      ? '#c4b5fd'
                      : isHovered
                      ? '#ffffff'
                      : highContrast
                      ? '#64748b'
                      : '#475569'
                  }
                  strokeWidth={
                    highContrast
                      ? (isSelected || isFocused ? 3.0 : isHovered ? 2.6 : isAi ? 2.2 : 1.8)
                      : (isSelected || isFocused ? 2.2 : isHovered ? 2.0 : isAi ? 1.6 : 1.2)
                  }
                  strokeOpacity={isFocused || isSelected || isHovered || highContrast ? 1.0 : 0.40}
                  strokeDasharray={isAi ? '4 4' : isContradiction ? '3 3' : undefined}
                  markerEnd={
                    isContradiction
                      ? 'url(#orb-arrow-contra)'
                      : isAi
                      ? 'url(#orb-arrow-ai)'
                      : 'url(#orb-arrow)'
                  }
                  className="transition-all duration-150"
                />

                {/* Edge Label strictly on hover or selection */}
                {(isHovered || isSelected || (isFocused && isAi) || isContradiction) && (
                  <foreignObject
                    x={mx - 95}
                    y={my - 16}
                    width={190}
                    height={32}
                    className="overflow-visible pointer-events-none"
                  >
                    <div className={`px-2.5 py-1 rounded-md text-[11px] text-center truncate shadow-lg backdrop-blur-md ${
                      isContradiction
                        ? 'bg-red-950 text-red-100 border-2 border-red-500 font-bold'
                        : isAi
                        ? 'bg-violet-950 text-violet-100 border-2 border-violet-500 font-bold'
                        : highContrast
                        ? 'bg-slate-950 text-white border-2 border-slate-400 font-bold'
                        : 'bg-slate-900/90 text-slate-200 border border-white/20 font-medium'
                    }`}>
                      {link.label || link.relationType}
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}

          {/* Render Graph Nodes (Clean Default + Rich Hover Micro-Card) */}
          {nodes.map(node => {
            const isSelected = selectedEntityId === node.id;
            const isHovered = hoveredNodeId === node.id;
            const isConnected = connectedNodeIds ? connectedNodeIds.has(node.id) : true;
            const isTimelineDimmed = activeTimelineNodeIds ? !activeTimelineNodeIds.has(node.id) : false;
            const isDimmed = (connectedNodeIds && !isConnected) || isTimelineDimmed;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className={`cursor-pointer select-none transition-all duration-200 ${isDimmed ? 'opacity-15 pointer-events-none' : 'opacity-100'}`}
                onClick={(e) => handleNodeClick(e, node)}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
              >
                {/* Selection / Hover Glow Ring */}
                {(isSelected || isHovered) && (
                  <circle
                    r={32}
                    fill={isSelected ? 'rgba(167, 139, 250, 0.25)' : 'rgba(255, 255, 255, 0.10)'}
                  />
                )}

                {/* Node Outer Circle */}
                <circle
                  r={20}
                  fill={isSelected ? '#2e1065' : highContrast ? '#1e2430' : '#1a1e2b'}
                  stroke={
                    isSelected 
                      ? '#c4b5fd' 
                      : isHovered 
                      ? '#ffffff' 
                      : isConnected && activeFocusEntityId 
                      ? '#a78bfa' 
                      : highContrast 
                      ? '#ffffff' 
                      : '#526077'
                  }
                  strokeWidth={
                    highContrast
                      ? (isSelected ? 3.5 : isHovered ? 3 : 2.5)
                      : (isSelected ? 2.2 : isHovered ? 2.0 : 1.4)
                  }
                  className="shadow-md transition-all duration-150"
                />

                {/* Regaarder Product Icon Center */}
                <foreignObject x={-10} y={-10} width={20} height={20} className="pointer-events-none">
                  <div className={`w-full h-full flex items-center justify-center ${
                    isSelected ? 'text-violet-200' : 'text-slate-300'
                  }`}>
                    <RegaarderProductIcon name={node.workspace} size={14} />
                  </div>
                </foreignObject>

                {/* Top Metric Badge if present */}
                {node.metadata?.cellValue && (
                  <foreignObject x={-40} y={-40} width={80} height={18} className="overflow-visible pointer-events-none">
                    <div className="text-[9.5px] font-mono px-1.5 py-0.2 rounded text-center truncate shadow-sm font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-600/60">
                      {node.metadata.cellValue}
                    </div>
                  </foreignObject>
                )}

                {/* ── DEFAULT MINIMAL LABEL (Keeps Graph Uncluttered) ── */}
                {!isHovered && !isSelected && (
                  <foreignObject x={-65} y={23} width={130} height={34} className="overflow-visible pointer-events-none">
                    <div className="text-center flex flex-col items-center">
                      <span className="text-[10px] font-medium text-slate-300 truncate max-w-[120px] inline-block">
                        {node.title}
                      </span>
                      {activeLens === 'timeline' && (
                        <span className="text-[8.5px] font-mono text-[#a78bfa] font-semibold mt-0.5 px-1.5 py-0.2 rounded bg-violet-950/70 border border-violet-800/40 truncate max-w-[110px]">
                          {node.lensRole || (node.updatedAt ? new Date(node.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Milestone')}
                        </span>
                      )}
                    </div>
                  </foreignObject>
                )}

                {/* ── HOVER / SELECTION RICH MICRO-CARD TOOLTIP ── */}
                {(isHovered || isSelected) && (
                  <foreignObject x={-100} y={24} width={200} height={80} className="overflow-visible pointer-events-none z-30">
                    <div className={`p-2 rounded-xl text-center shadow-xl backdrop-blur-xl border flex flex-col items-center animate-in fade-in zoom-in-95 duration-150 ${
                      isSelected
                        ? 'bg-violet-950/90 border-violet-500/80 text-white'
                        : 'bg-slate-900/90 border-white/20 text-white'
                    }`}>
                      <span className="text-[11px] font-bold truncate max-w-[180px]">
                        {node.title}
                      </span>
                      <span className="text-[9.5px] text-slate-300 truncate max-w-[170px] mt-0.5">
                        {node.author ? `${node.author} • ` : ''}{node.lensRole || node.workspace}
                      </span>
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </svg>

        {/* Bottom Floating Inspector Bar for Selected Node */}
        {selectedEntityId && (() => {
          const selectedEntity = entities.find(e => e.id === selectedEntityId);
          if (!selectedEntity) return null;
          return (
            <div 
              data-no-pan="true"
              className={`absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between p-4 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-150 ${
                highContrast
                  ? 'bg-black border-2 border-white text-white shadow-2xl'
                  : 'bg-slate-950/80 backdrop-blur-2xl border border-white/20 text-slate-100 shadow-xl'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  highContrast
                    ? 'bg-zinc-900 text-white border-2 border-white'
                    : 'bg-slate-800/80 text-white border border-slate-700'
                }`}>
                  <RegaarderProductIcon name={selectedEntity.workspace} size={18} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm truncate ${highContrast ? 'font-black text-white' : 'font-semibold text-white'}`}>
                      {selectedEntity.title}
                    </h4>
                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded ${
                      highContrast
                        ? 'font-black border-2 border-white text-white bg-zinc-900'
                        : 'font-medium border border-slate-700 text-slate-300 bg-slate-800/80'
                    }`}>
                      {selectedEntity.workspace}
                    </span>
                  </div>
                  <p className={`text-xs truncate max-w-xl mt-0.5 ${highContrast ? 'font-medium text-zinc-200' : 'font-normal text-slate-400'}`}>
                    {selectedEntity.excerpt || selectedEntity.content}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 pl-4">
                <button
                  type="button"
                  onClick={() => onNavigateToWorkspace(selectedEntity)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#7C5ACF] text-white hover:bg-[#6c48c5] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <span>Open in {selectedEntity.workspace}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          );
        })()}

        {/* ── Apple-Style Floating Timeline Date Search & Time Scrubber Toolbar ── */}
        {activeLens === 'timeline' && nodes.length > 0 && !selectedEntityId && (
          <div
            data-no-pan="true"
            className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-2xl px-4 py-2.5 rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.18)] flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${
              highContrast
                ? 'bg-black border-2 border-slate-400 text-white'
                : 'bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-slate-200/60 dark:border-zinc-800 text-slate-800 dark:text-zinc-100'
            }`}
          >
            {/* 1. Date / Query Search Field */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl shrink-0 ${
              highContrast ? 'bg-zinc-900 border border-slate-400' : 'bg-slate-100 dark:bg-zinc-800'
            }`}>
              <Calendar size={13} className="text-[#7C5ACF] dark:text-[#a78bfa]" />
              <input
                type="text"
                value={timelineDateQuery}
                onChange={(e) => setTimelineDateQuery(e.target.value)}
                placeholder="Date or quarter (e.g. Aug, Q3)..."
                className="bg-transparent text-xs text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none w-36 sm:w-44"
              />
              {timelineDateQuery && (
                <button
                  type="button"
                  onClick={() => setTimelineDateQuery('')}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* 2. Horizon Presets (All Time, 7D, 30D, Quarter) */}
            <div className="flex items-center gap-1 overflow-x-auto thin-scrollbar py-0.5">
              {[
                { id: 'all', label: 'All Time' },
                { id: '7d', label: 'Past 7D' },
                { id: '30d', label: 'Past 30D' },
                { id: 'quarter', label: 'This Quarter' }
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setTimelinePreset(p.id)}
                  className={`px-3 py-1 text-xs rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    timelinePreset === p.id
                      ? highContrast
                        ? 'bg-white text-black font-extrabold border border-white'
                        : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 font-medium'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* 3. Chronological Step Scrubber & Playback */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsPlayingTimeline(p => !p)}
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  isPlayingTimeline
                    ? 'bg-[#7C5ACF] text-white font-bold'
                    : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200'
                }`}
                title={isPlayingTimeline ? 'Pause timeline playback' : 'Play chronological progression'}
              >
                {isPlayingTimeline ? <Pause size={12} /> : <Play size={12} />}
              </button>

              <button
                type="button"
                onClick={() => setTimelineStepIndex(idx => Math.max(0, (idx === null ? sortedTimelineNodes.length - 1 : idx) - 1))}
                disabled={timelineStepIndex !== null && timelineStepIndex <= 0}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-30 transition-all text-slate-700 dark:text-zinc-200 cursor-pointer"
                title="Previous milestone"
              >
                <ChevronLeft size={13} />
              </button>

              <span className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300 px-1">
                {timelineFilteredNodes.length > 0 
                  ? `${(timelineStepIndex === null ? sortedTimelineNodes.length : timelineStepIndex + 1)} / ${sortedTimelineNodes.length}`
                  : '0 / 0'}
              </span>

              <button
                type="button"
                onClick={() => setTimelineStepIndex(idx => Math.min(sortedTimelineNodes.length - 1, (idx === null ? 0 : idx) + 1))}
                disabled={timelineStepIndex !== null && timelineStepIndex >= sortedTimelineNodes.length - 1}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-30 transition-all text-slate-700 dark:text-zinc-200 cursor-pointer"
                title="Next milestone"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* ── Contextual Empty State when no links exist for this lens ── */}
        {links.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6 z-20">
            <div className={`p-8 rounded-2xl text-center flex flex-col items-center max-w-sm pointer-events-auto shadow-xl backdrop-blur-xl ${
              highContrast
                ? 'bg-slate-950 border-2 border-slate-400 text-white'
                : 'bg-[#0e1117]/85 border border-white/[0.08] text-white'
            }`}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/[0.06] mb-3 border border-white/[0.08] text-[#a78bfa]">
                <Network size={20} strokeWidth={1.6} />
              </div>
              <h4 className={`text-sm mb-1 ${highContrast ? 'font-black text-white' : 'font-semibold text-white'}`}>
                {t('orb.empty.' + activeLens + '.title') || LENS_EMPTY_STATES[activeLens]?.title || 'No Connected Relationships Yet'}
              </h4>
              <p className={`text-xs leading-relaxed max-w-xs ${highContrast ? 'font-medium text-slate-200' : 'text-slate-400'}`}>
                {t('orb.empty.' + activeLens + '.desc') || LENS_EMPTY_STATES[activeLens]?.desc || 'Relationships and linkages will appear as you cross-reference workspace artifacts.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
