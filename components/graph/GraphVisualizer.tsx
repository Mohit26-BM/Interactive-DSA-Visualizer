"use client";

import { GraphState } from "@/lib/graph-engine";

interface Props {
  state: GraphState;
  highlightVertices: string[];
  highlightEdges: string[];
  phase?: string;
  visitedOrder?: string[];
  visitedVertices?: string[];
}

const phaseVertexColor: Record<string, string> = {
  insert:  "#22c55e",
  found:   "#f97316",  // orange = currently processing
  delete:  "#ef4444",
  error:   "#ef4444",
  default: "#6366f1",
};

// Tailwind arbitrary-value filter classes per phase (avoids inline style prop)
const phaseGlowClass: Record<string, string> = {
  insert:  "[filter:drop-shadow(0_0_8px_#22c55e80)]",
  found:   "[filter:drop-shadow(0_0_8px_#f9731680)]",
  delete:  "[filter:drop-shadow(0_0_8px_#ef444480)]",
  error:   "[filter:drop-shadow(0_0_8px_#ef444480)]",
  default: "[filter:drop-shadow(0_0_8px_#6366f180)]",
};

export default function GraphVisualizer({ state, highlightVertices, highlightEdges, phase, visitedOrder, visitedVertices }: Props) {
  const hlVertexSet = new Set(highlightVertices);
  const hlEdgeSet = new Set(highlightEdges);
  const visitedSet = new Set(visitedVertices ?? []);

  const { vertices, edges, directed, positions } = state;

  const getEdgeLabel = (fromId: string, toId: string): string => {
    const fv = vertices.find((v) => v.id === fromId);
    const tv = vertices.find((v) => v.id === toId);
    if (!fv || !tv) return "";
    return `${fv.label}-${tv.label}`;
  };

  if (vertices.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-600 text-sm italic min-h-50">
        Empty graph — add vertices and edges to begin
      </div>
    );
  }

  const highlightColor = phase ? (phaseVertexColor[phase] ?? phaseVertexColor.default) : phaseVertexColor.default;

  // For directed edges, we need to offset to avoid overlap on bidirectional pairs
  function getEdgePoints(fromId: string, toId: string): { x1: number; y1: number; x2: number; y2: number } {
    const fp = positions[fromId];
    const tp = positions[toId];
    if (!fp || !tp) return { x1: 0, y1: 0, x2: 0, y2: 0 };
    return { x1: fp.x, y1: fp.y, x2: tp.x, y2: tp.y };
  }

  // For directed graphs, shorten edge to not overlap arrowhead with node
  function getArrowPoints(fromId: string, toId: string) {
    const fp = positions[fromId];
    const tp = positions[toId];
    if (!fp || !tp) return { x1: 0, y1: 0, x2: 0, y2: 0 };
    const dx = tp.x - fp.x;
    const dy = tp.y - fp.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return { x1: fp.x, y1: fp.y, x2: tp.x, y2: tp.y };
    const nr = 24;
    return {
      x1: fp.x + (dx / dist) * nr,
      y1: fp.y + (dy / dist) * nr,
      x2: tp.x - (dx / dist) * nr,
      y2: tp.y - (dy / dist) * nr,
    };
  }

  // Deduplicate edges for undirected (show each pair once)
  const displayedEdges = directed === "undirected"
    ? edges.filter((e) => {
        const fv = vertices.find((v) => v.id === e.from);
        const tv = vertices.find((v) => v.id === e.to);
        if (!fv || !tv) return false;
        return fv.label < tv.label; // only show A-B, not B-A
      })
    : edges;

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="overflow-auto w-full flex justify-center">
        <svg
          width={600}
          height={400}
          viewBox="0 0 600 400"
          className="max-w-full min-w-80"
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
            </marker>
            <marker
              id="arrowhead-hl"
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill={highlightColor} />
            </marker>
          </defs>

          {/* Edges */}
          {displayedEdges.map((e) => {
            const edgeLabel = getEdgeLabel(e.from, e.to);
            const reverseLabel = getEdgeLabel(e.to, e.from);
            const isHl = hlEdgeSet.has(edgeLabel) || hlEdgeSet.has(reverseLabel);
            const pts = directed === "directed"
              ? getArrowPoints(e.from, e.to)
              : getEdgePoints(e.from, e.to);

            return (
              <line
                key={e.id}
                x1={pts.x1} y1={pts.y1}
                x2={pts.x2} y2={pts.y2}
                stroke={isHl ? highlightColor : "#4b5563"}
                strokeWidth={isHl ? 2.5 : 2}
                markerEnd={directed === "directed" ? (isHl ? "url(#arrowhead-hl)" : "url(#arrowhead)") : undefined}
                className="transition-all duration-300"
              />
            );
          })}

          {/* Vertices */}
          {vertices.map((v) => {
            const pos = positions[v.id];
            if (!pos) return null;
            const isHl      = hlVertexSet.has(v.id);
            const isVisited = !isHl && visitedSet.has(v.id);

            const fillColor   = isHl ? highlightColor : isVisited ? "#052e16" : "#1f2937";
            const strokeColor = isHl ? highlightColor : isVisited ? "#22c55e" : "#4b5563";
            const glowClass   = isHl
              ? (phaseGlowClass[phase ?? "default"] ?? phaseGlowClass.default)
              : isVisited
                ? "[filter:drop-shadow(0_0_6px_#22c55e40)]"
                : "";

            return (
              <g key={v.id}>
                <circle
                  cx={pos.x} cy={pos.y} r={22}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={2}
                  className={`transition-all duration-300 ${glowClass}`}
                />
                <text
                  x={pos.x} y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontWeight="bold"
                  fontSize={14}
                  className="select-none"
                >
                  {v.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Visited order strip */}
      {visitedOrder && visitedOrder.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 px-4">
          <span className="text-xs text-gray-500 mr-1">Visited:</span>
          {visitedOrder.map((label, i) => (
            <span key={i} className="text-xs bg-violet-500/20 border border-violet-500/30 text-violet-300 px-2 py-0.5 rounded-full font-mono">
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
