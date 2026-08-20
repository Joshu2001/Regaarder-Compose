import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ZoomIn, ZoomOut, Maximize2, RefreshCw, Filter, 
  Layers, ArrowRight, CornerDownRight, Info, AlertTriangle, Eye,
  Hand, Move
} from 'lucide-react';
import { RegaarderProductIcon } from '../RegaarderProductIcons';
import { ORB_LENSES, computeLensLayout } from '../../services/orbKnowledgeGraphService';

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
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 920, height: 560 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState(null);
  const [expandedNodeIds, setExpandedNodeIds] = useState(new Set());

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
    <div className="flex flex-col h-full w-full select-none overflow-hidden bg-[#0a0c12] relative">
      {/* ── Top Lens Switcher Toolbar: Floating Glass Bar ── */}
      <div 
        data-no-pan="true"
        className="flex items-center justify-between px-6 py-2.5 border-b border-white/20 bg-slate-950/80 backdrop-blur-xl z-20 shrink-0"
      >
        <div className="flex items-center gap-1.5 overflow-x-auto thin-scrollbar py-0.5">
          <span className="text-xs font-bold text-slate-300 mr-2 uppercase tracking-wider">
            Lenses:
          </span>
          {ORB_LENSES.map(lens => {
            const isActive = activeLens === lens.id;
            return (
              <button
                key={lens.id}
                type="button"
                onClick={() => onSelectLens(lens.id)}
                className={`px-3 py-1 text-xs rounded-lg transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-2 border-[#a78bfa] bg-white/25 text-white font-bold shadow-xs'
                    : 'border border-white/20 bg-white/10 text-slate-200 hover:text-white hover:bg-white/20 font-medium'
                }`}
                title={lens.desc}
              >
                {lens.label}
              </button>
            );
          })}
        </div>

        {/* Zoom, Gesture & Canvas controls */}
        <div className="flex items-center gap-1.5 shrink-0 pl-3">
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-slate-300 mr-1">
            <Hand size={12} className={isDragging ? 'text-violet-400 animate-pulse' : 'text-slate-400'} />
            <span>Hand Pan</span>
          </div>

          <button
            type="button"
            onClick={() => setZoom(z => Math.max(0.35, z - 0.15))}
            className="p-1.5 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>
          <span className="text-[11px] font-mono font-bold text-white px-1">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}
            className="p-1.5 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={13} />
          </button>
          <button
            type="button"
            onClick={handleResetView}
            className="p-1.5 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-white transition-colors ml-1 cursor-pointer"
            title="Reset Pan & Zoom"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* ── Active Lens Contextual Description Banner ── */}
      <div className="absolute top-14 left-6 z-10 pointer-events-none">
        <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 backdrop-blur-md border border-white/20 shadow-lg text-xs text-slate-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#a78bfa]" />
          <span className="font-bold text-white">{activeLensMeta.label} Lens:</span>
          <span className="text-slate-300 font-medium">{activeLensMeta.desc}</span>
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
              <circle cx="2" cy="2" r="0.85" fill="#475569" opacity="0.35" />
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

          {/* Render Connection Edges */}
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
                
                {/* Visual line */}
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
                      : '#334155'
                  }
                  strokeWidth={
                    highContrast
                      ? (isSelected || isFocused ? 3.2 : isHovered ? 2.6 : isAi ? 2.2 : 1.8)
                      : (isSelected || isFocused ? 2.4 : isHovered ? 2.0 : isAi ? 1.8 : 1.2)
                  }
                  strokeOpacity={isFocused || isSelected || isHovered || highContrast ? 1.0 : 0.35}
                  strokeDasharray={isAi ? '5 5' : undefined}
                  markerEnd={
                    isContradiction
                      ? 'url(#orb-arrow-contra)'
                      : isAi
                      ? 'url(#orb-arrow-ai)'
                      : 'url(#orb-arrow)'
                  }
                  className="transition-all duration-150"
                />

                {/* Edge Label on hover or selection */}
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

          {/* Render Graph Nodes */}
          {nodes.map(node => {
            const isSelected = selectedEntityId === node.id;
            const isHovered = hoveredNodeId === node.id;
            const isConnected = connectedNodeIds ? connectedNodeIds.has(node.id) : true;
            const isDimmed = connectedNodeIds && !isConnected;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className={`cursor-pointer select-none transition-opacity duration-200 ${isDimmed ? 'opacity-25' : 'opacity-100'}`}
                onClick={(e) => handleNodeClick(e, node)}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
              >
                {/* Selection / Hover Glow Ring */}
                {(isSelected || isHovered) && (
                  <circle
                    r={34}
                    fill={isSelected ? 'rgba(167, 139, 250, 0.28)' : 'rgba(255, 255, 255, 0.12)'}
                  />
                )}

                {/* Node Outer Circle */}
                <circle
                  r={22}
                  fill={isSelected ? '#2e1065' : highContrast ? '#1e2430' : '#141824'}
                  stroke={
                    isSelected 
                      ? '#c4b5fd' 
                      : isHovered 
                      ? '#ffffff' 
                      : isConnected && activeFocusEntityId 
                      ? '#a78bfa' 
                      : highContrast 
                      ? '#ffffff' 
                      : '#475569'
                  }
                  strokeWidth={
                    highContrast
                      ? (isSelected ? 3.5 : isHovered ? 3 : 2.5)
                      : (isSelected ? 2.5 : isHovered ? 2.0 : 1.5)
                  }
                  className="shadow-md transition-all duration-150"
                />

                {/* Regaarder Product Icon Center */}
                <foreignObject x={-11} y={-11} width={22} height={22} className="pointer-events-none">
                  <div className={`w-full h-full flex items-center justify-center ${
                    isSelected ? 'text-violet-200' : 'text-slate-200'
                  }`}>
                    <RegaarderProductIcon name={node.workspace} size={15} />
                  </div>
                </foreignObject>

                {/* Top Badge: Metric / Value if applicable */}
                {node.metadata?.cellValue && (
                  <foreignObject x={-45} y={-44} width={90} height={20} className="overflow-visible pointer-events-none">
                    <div className={`text-[10px] font-mono px-2 py-0.5 rounded text-center truncate shadow-sm ${
                      highContrast
                        ? 'font-black bg-emerald-950 text-emerald-100 border-2 border-emerald-400'
                        : 'font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-700/60'
                    }`}>
                      {node.metadata.cellValue}
                    </div>
                  </foreignObject>
                )}

                {/* Bottom Label: Entity Title */}
                <foreignObject x={-75} y={26} width={150} height={44} className="overflow-visible pointer-events-none">
                  <div className="flex flex-col items-center">
                    <span className={`text-[11px] text-center leading-tight truncate max-w-[140px] px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'text-violet-200 bg-violet-950/80 border border-violet-500 font-bold'
                        : highContrast
                        ? 'text-white bg-black border-2 border-white/80 font-black'
                        : 'text-slate-200 bg-slate-950/70 border border-white/10 font-medium'
                    }`}>
                      {node.title}
                    </span>
                    <span className={`text-[10px] truncate max-w-[125px] mt-0.5 ${
                      highContrast ? 'font-bold text-white' : 'font-normal text-slate-400'
                    }`}>
                      {node.lensRole || node.workspace}
                    </span>
                  </div>
                </foreignObject>
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
      </div>
    </div>
  );
}
