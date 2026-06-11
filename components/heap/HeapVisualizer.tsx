"use client";

import { useMemo } from "react";
import { HeapState } from "@/lib/heap-engine";

interface Props {
  state: HeapState;
  highlightIndices: number[];
  phase?: string;
  heapSize?: number;
}

interface NodeLayout {
  idx: number;
  value: number;
  x: number;
  y: number;
}

const NODE_R = 22;
const LEVEL_H = 72;
const PAD = 36;

function computeHeapLayout(arr: number[], size: number): NodeLayout[] {
  const layout: NodeLayout[] = [];
  let inorderIdx = 0;

  function assign(i: number, depth: number) {
    if (i >= size) return;
    assign(2 * i + 1, depth + 1); // left
    layout.push({ idx: i, value: arr[i], x: inorderIdx++, y: depth });
    assign(2 * i + 2, depth + 1); // right
  }

  assign(0, 0);
  return layout;
}

const phaseColor = (phase?: string, isSorted?: boolean): string => {
  if (isSorted) return "fill-green-700 stroke-green-500";
  switch (phase) {
    case "insert": return "fill-green-500 stroke-green-400";
    case "found":  return "fill-emerald-500 stroke-emerald-400";
    case "delete": return "fill-red-500 stroke-red-400";
    case "error":  return "fill-red-500 stroke-red-400";
    default:       return "fill-indigo-500 stroke-indigo-400";
  }
};

export default function HeapVisualizer({ state, highlightIndices, phase, heapSize }: Props) {
  const { arr } = state;
  const effectiveHeapSize = heapSize !== undefined ? heapSize : arr.length;
  const highlightSet = new Set(highlightIndices);

  const layout = useMemo(
    () => computeHeapLayout(arr, arr.length),
    [arr]
  );

  if (arr.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-600 text-sm italic min-h-[200px]">
        Empty heap — insert values or build heap to begin
      </div>
    );
  }

  const maxX = Math.max(...layout.map((n) => n.x));
  const maxY = Math.max(...layout.map((n) => n.y));
  const xScale = Math.max(56, Math.min(90, 600 / (maxX + 1)));
  const svgW = (maxX + 1) * xScale + PAD * 2;
  const svgH = (maxY + 1) * LEVEL_H + PAD * 2;

  const posMap: Record<number, { cx: number; cy: number }> = {};
  for (const n of layout) {
    posMap[n.idx] = {
      cx: PAD + n.x * xScale + xScale / 2,
      cy: PAD + n.y * LEVEL_H + NODE_R,
    };
  }

  // Build tree edges
  const edges: { x1: number; y1: number; x2: number; y2: number; key: string }[] = [];
  for (let i = 0; i < arr.length; i++) {
    const pos = posMap[i];
    if (!pos) continue;
    for (const ci of [2 * i + 1, 2 * i + 2]) {
      if (ci >= arr.length) continue;
      const childPos = posMap[ci];
      if (!childPos) continue;
      edges.push({ x1: pos.cx, y1: pos.cy, x2: childPos.cx, y2: childPos.cy, key: `${i}-${ci}` });
    }
  }

  return (
    <div className="flex flex-col gap-6 py-4 px-2">
      {/* Tree View */}
      <div>
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-2">Tree View</div>
        <div className="overflow-auto w-full flex justify-center">
          <svg
            width={svgW}
            height={svgH}
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="max-w-full"
            style={{ minWidth: Math.min(svgW, 280) }}
          >
            {edges.map((e) => (
              <line
                key={e.key}
                x1={e.x1} y1={e.y1 + NODE_R - 3}
                x2={e.x2} y2={e.y2 - NODE_R + 3}
                stroke="#4b5563"
                strokeWidth={2}
              />
            ))}

            {layout.map((n) => {
              const pos = posMap[n.idx];
              if (!pos) return null;
              const isHl = highlightSet.has(n.idx);
              const isSorted = n.idx >= effectiveHeapSize;
              const colorClass = isHl
                ? phaseColor(phase, isSorted)
                : isSorted
                ? "fill-green-900 stroke-green-700"
                : "fill-gray-800 stroke-gray-600";

              return (
                <g key={n.idx}>
                  <circle
                    cx={pos.cx} cy={pos.cy} r={NODE_R}
                    className={`transition-all duration-300 stroke-2 ${colorClass}`}
                    style={{ filter: isHl ? "drop-shadow(0 0 8px rgba(34,197,94,0.5))" : undefined }}
                  />
                  <text
                    x={pos.cx} y={pos.cy}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-white font-bold select-none"
                    style={{ fontSize: n.value >= 100 ? 10 : 13 }}
                  >
                    {n.value}
                  </text>
                  <text
                    x={pos.cx} y={pos.cy + NODE_R + 12}
                    textAnchor="middle"
                    className="fill-gray-500 select-none"
                    style={{ fontSize: 10 }}
                  >
                    [{n.idx}]
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Array View */}
      <div>
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-2">Array View</div>
        <div className="flex flex-wrap gap-2 px-2 pb-2">
          {arr.map((val, idx) => {
            const isHl = highlightSet.has(idx);
            const isSorted = idx >= effectiveHeapSize;
            let boxClass = "bg-gray-800 border-gray-600 text-white";
            if (isSorted) boxClass = "bg-green-900 border-green-700 text-green-200";
            if (isHl && !isSorted) {
              if (phase === "insert") boxClass = "bg-green-600 border-green-400 text-white";
              else if (phase === "delete") boxClass = "bg-red-600 border-red-400 text-white";
              else if (phase === "found") boxClass = "bg-emerald-600 border-emerald-400 text-white";
              else boxClass = "bg-indigo-600 border-indigo-400 text-white";
            }
            return (
              <div key={idx} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 border rounded-lg flex items-center justify-center font-bold text-sm transition-all duration-300 ${boxClass}`}
                  style={{ filter: isHl ? "drop-shadow(0 0 6px rgba(34,197,94,0.4))" : undefined }}
                >
                  {val}
                </div>
                <span className="text-[10px] text-gray-500 mt-0.5 font-mono">[{idx}]</span>
                {isSorted && (
                  <span className="text-[9px] text-green-600 font-medium">sorted</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
