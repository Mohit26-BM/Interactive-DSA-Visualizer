"use client";

import { useMemo } from "react";
import { TreeState, TreeNode } from "@/lib/tree-engine";

interface Props {
  state: TreeState;
  highlightNodes: string[];
  phase?: string;
  traversalOrder?: number[];
}

interface NodeLayout {
  id: string;
  value: number;
  x: number;
  y: number;
}

const NODE_W = 48;
const NODE_H = 48;
const LEVEL_H = 80;

// Computes inorder positions so the tree spreads naturally
function computeLayout(state: TreeState): NodeLayout[] {
  const layout: NodeLayout[] = [];
  let inorderIdx = 0;

  function assign(id: string | null, depth: number) {
    if (!id) return;
    const node = state.nodes.find((n) => n.id === id);
    if (!node) return;
    assign(node.left, depth + 1);
    layout.push({ id, value: node.value, x: inorderIdx++, y: depth });
    assign(node.right, depth + 1);
  }

  assign(state.root, 0);
  return layout;
}

const phaseColor: Record<string, string> = {
  insert:  "fill-green-500 stroke-green-400",
  found:   "fill-emerald-500 stroke-emerald-400",
  delete:  "fill-red-500 stroke-red-400",
  error:   "fill-red-500 stroke-red-400",
  default: "fill-indigo-500 stroke-indigo-400",
};

export default function TreeVisualizer({ state, highlightNodes, phase, traversalOrder }: Props) {
  const highlightSet = new Set(highlightNodes);

  const layout = useMemo(() => computeLayout(state), [state]);

  if (layout.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-600 text-sm italic min-h-[200px]">
        Empty tree — insert values to begin
      </div>
    );
  }

  const maxX = Math.max(...layout.map((n) => n.x));
  const maxY = Math.max(...layout.map((n) => n.y));

  const padding = 40;
  const xScale = Math.max(64, Math.min(90, 600 / (maxX + 1)));
  const svgW = (maxX + 1) * xScale + padding * 2;
  const svgH = (maxY + 1) * LEVEL_H + padding * 2;

  const posMap: Record<string, { cx: number; cy: number }> = {};
  for (const n of layout) {
    posMap[n.id] = {
      cx: padding + n.x * xScale + xScale / 2,
      cy: padding + n.y * LEVEL_H + NODE_H / 2,
    };
  }

  // Build edges
  const edges: { x1: number; y1: number; x2: number; y2: number; key: string }[] = [];
  for (const node of state.nodes) {
    const pos = posMap[node.id];
    if (!pos) continue;
    for (const childId of [node.left, node.right]) {
      if (!childId) continue;
      const childPos = posMap[childId];
      if (!childPos) continue;
      edges.push({ x1: pos.cx, y1: pos.cy, x2: childPos.cx, y2: childPos.cy, key: `${node.id}-${childId}` });
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="overflow-auto w-full flex justify-center">
        <svg
          width={svgW}
          height={svgH}
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="max-w-full"
          style={{ minWidth: Math.min(svgW, 320) }}
        >
          {/* Edges */}
          {edges.map((e) => (
            <line
              key={e.key}
              x1={e.x1} y1={e.y1 + NODE_H / 2 - 4}
              x2={e.x2} y2={e.y2 - NODE_H / 2 + 4}
              stroke="#4b5563"
              strokeWidth={2}
            />
          ))}

          {/* Nodes */}
          {layout.map((n) => {
            const { cx, cy } = posMap[n.id];
            const isHl = highlightSet.has(n.id);
            const colorClass = isHl ? (phase && phaseColor[phase] ? phaseColor[phase] : phaseColor.default) : "fill-gray-800 stroke-gray-600";
            const r = NODE_W / 2 - 1;

            return (
              <g key={n.id}>
                <circle
                  cx={cx} cy={cy} r={r}
                  className={`transition-all duration-300 stroke-2 ${colorClass}`}
                  style={{ filter: isHl ? "drop-shadow(0 0 8px rgba(99,102,241,0.6))" : undefined }}
                />
                <text
                  x={cx} y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-white font-bold select-none"
                  style={{ fontSize: n.value >= 100 ? 10 : 13 }}
                >
                  {n.value}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Traversal order strip */}
      {traversalOrder && traversalOrder.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 px-4">
          <span className="text-xs text-gray-500 mr-1">Visited:</span>
          {traversalOrder.map((v, i) => (
            <span key={i} className="text-xs bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
              {v}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
