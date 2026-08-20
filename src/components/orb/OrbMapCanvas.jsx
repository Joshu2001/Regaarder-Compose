import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ZoomIn, ZoomOut, Maximize2, RefreshCw, Filter, Sparkles, 
  Layers, ArrowRight, CornerDownRight, Info, AlertTriangle, Eye
} from 'lucide-react';
import { RegaarderProductIcon } from '../RegaarderProductIcons';
import { ORB_LENSES, computeLensLayout } from '../../services/orbKnowledgeGraphService';

export default function OrbMapCanvas({
  entities = [],
  edges = [],
  activeLens = 'timeline',
  selectedEntityId,
  selectedEdgeId,
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

  // Handle pan & dragging
  const handlePointerDown = (e) => {
    // Only initiate canvas drag if clicked on background svg
    if (e.target.tagName === 'svg' || e.target.id === 'orb-canvas-bg') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handlePointerMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Node progressive expansion toggle
  const handleNodeClick = (e, node) => {
    e.stopPropagation();
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
    <div className="flex flex-col h-full w-full select-none overflow-hidden bg-slate-900/5 dark:bg-black/20 relative">
      {/* ── Top Lens Switcher Toolbar (Slightly rounded rectangular outlines) ── */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-200/60 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl z-20 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto thin-scrollbar py-0.5">
          <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 mr-2 uppercase tracking-wider">
            Lenses:
          </span>
          {ORB_LENSES.map(lens => {
            const isActive = activeLens === lens.id;
            return (
              <button
                key={lens.id}
                type="button"
                onClick={() => onSelectLens(lens.id)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border border-[#7C5ACF] dark:border-[#8B6FD1] bg-[#7C5ACF]/[0.09] dark:bg-[#7C5ACF]/[0.22] text-[#7C5ACF] dark:text-[#a78bfa] shadow-xs'
                    : 'border border-slate-200/90 dark:border-zinc-700/80 bg-white/80 dark:bg-zinc-800/70 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-700/60'
                }`}
                title={lens.desc}
              >
                {lens.label}
              </button>
            );
          })}
        </div>

        {/* Zoom & Canvas controls */}
        <div className="flex items-center gap-1 shrink-0 pl-3">
          <button
            type="button"
            onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>
          <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 px-1">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom(z => Math.min(2.2, z + 0.15))}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={13} />
          </button>
          <button
            type="button"
            onClick={handleResetView}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors ml-1"
            title="Reset View"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* ── Active Lens Contextual Description Banner ── */}
      <div className="absolute top-14 left-6 z-10 pointer-events-none">
        <div className="px-3.5 py-1.5 rounded-xl bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 shadow-sm text-xs text-slate-600 dark:text-zinc-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
          <span className="font-semibold text-slate-800 dark:text-zinc-100">{activeLensMeta.label} Lens:</span>
          <span>{activeLensMeta.desc}</span>
        </div>
      </div>

      {/* ── Spatial Graph Canvas ── */}
      <div
        ref={containerRef}
        className="flex-1 w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
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
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#94a3b8" />
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
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#7C5ACF" />
            </marker>
          </defs>

          {/* Render Connection Edges */}
          {links.map(link => {
            const isHovered = hoveredEdgeId === link.id;
            const isSelected = selectedEdgeId === link.id;
            const isAi = link.isAiInferred;
            const isContradiction = link.relationType === 'contradicts';

            const sx = link.source.x || 100;
            const sy = link.source.y || 100;
            const tx = link.target.x || 300;
            const ty = link.target.y || 300;

            // Curved cubic bezier
            const dx = tx - sx;
            const dy = ty - sy;
            const mx = (sx + tx) / 2;
            const my = (sy + ty) / 2 - (dx * 0.15);

            const pathD = `M ${sx} ${sy} Q ${mx} ${my} ${tx} ${ty}`;

            return (
              <g
                key={link.id}
                className="cursor-pointer group"
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
                  strokeWidth={18}
                />
                
                {/* Visual line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={
                    isSelected
                      ? '#7C5ACF'
                      : isContradiction
                      ? '#ef4444'
                      : isAi
                      ? '#8B6FD1'
                      : isHovered
                      ? '#64748b'
                      : '#cbd5e1'
                  }
                  strokeWidth={isSelected ? 2.5 : isHovered ? 2.2 : isAi ? 1.8 : 1.4}
                  strokeDasharray={isAi ? '4 4' : undefined}
                  markerEnd={isAi ? 'url(#orb-arrow-ai)' : 'url(#orb-arrow)'}
                  className="transition-colors duration-150"
                />

                {/* Edge Label on hover or selection */}
                {(isHovered || isSelected || isAi || isContradiction) && (
                  <foreignObject
                    x={mx - 90}
                    y={my - 16}
                    width={180}
                    height={32}
                    className="overflow-visible pointer-events-none"
                  >
                    <div className={`px-2 py-0.5 rounded-md text-[10.5px] font-medium text-center truncate border shadow-xs ${
                      isContradiction
                        ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/80 dark:text-red-300 dark:border-red-800'
                        : isAi
                        ? 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/80 dark:text-violet-300 dark:border-violet-800'
                        : 'bg-white/95 text-slate-700 border-slate-200 dark:bg-zinc-800/95 dark:text-zinc-200 dark:border-zinc-700'
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
            const isExpanded = expandedNodeIds.has(node.id);

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer select-none"
                onClick={(e) => handleNodeClick(e, node)}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
              >
                {/* Selection / Hover Glow Ring */}
                {(isSelected || isHovered) && (
                  <circle
                    r={34}
                    fill={isSelected ? 'rgba(124, 58, 237, 0.12)' : 'rgba(148, 163, 184, 0.14)'}
                    className="animate-pulse"
                  />
                )}

                {/* Node Outer Circle */}
                <circle
                  r={22}
                  fill="white"
                  stroke={isSelected ? '#7C5ACF' : isHovered ? '#8B6FD1' : '#e2e8f0'}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  className="shadow-sm transition-all duration-150 dark:fill-zinc-900 dark:stroke-zinc-700"
                />

                {/* Regaarder Product Icon Center */}
                <foreignObject x={-11} y={-11} width={22} height={22} className="pointer-events-none">
                  <div className={`w-full h-full flex items-center justify-center ${
                    isSelected ? 'text-[#7C5ACF]' : 'text-slate-600 dark:text-zinc-300'
                  }`}>
                    <RegaarderProductIcon name={node.workspace} size={15} />
                  </div>
                </foreignObject>

                {/* Top Badge: Metric / Value if applicable */}
                {node.metadata?.cellValue && (
                  <foreignObject x={-40} y={-42} width={80} height={18} className="overflow-visible pointer-events-none">
                    <div className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 text-center truncate">
                      {node.metadata.cellValue}
                    </div>
                  </foreignObject>
                )}

                {/* Bottom Label: Entity Title */}
                <foreignObject x={-80} y={26} width={160} height={40} className="overflow-visible pointer-events-none">
                  <div className="flex flex-col items-center">
                    <span className={`text-[11.5px] font-semibold text-center leading-tight truncate max-w-[150px] px-1 rounded ${
                      isSelected
                        ? 'text-violet-700 dark:text-violet-300 font-bold'
                        : 'text-slate-800 dark:text-zinc-200'
                    }`}>
                      {node.title}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 truncate max-w-[130px]">
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
            <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between p-4 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-zinc-800 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 border border-violet-100 dark:border-violet-900">
                  <RegaarderProductIcon name={selectedEntity.workspace} size={18} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                      {selectedEntity.title}
                    </h4>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700 text-slate-500 bg-slate-50 dark:bg-zinc-800">
                      {selectedEntity.workspace}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 truncate max-w-xl">
                    {selectedEntity.excerpt || selectedEntity.content}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 pl-4">
                <button
                  type="button"
                  onClick={() => onNavigateToWorkspace(selectedEntity)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#7C5ACF] text-white hover:bg-[#6c48c5] transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-xs"
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
