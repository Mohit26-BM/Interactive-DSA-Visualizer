"use client";

import { useState } from "react";
import Link from "next/link";
import Controls from "@/components/shared/Controls";
import CodePanel from "@/components/shared/CodePanel";
import AIExplainer from "@/components/shared/AIExplainer";
import { usePlayer } from "@/components/shared/usePlayer";
import { demoUnionFind, UF_CODE, UF_ANNOTATIONS, UF_COMPLEXITY, type UFStep } from "@/lib/union-find-engine";

const N = 8;

const COMPONENT_COLORS = [
  "bg-indigo-900/60 border-indigo-600/60 text-indigo-200",
  "bg-violet-900/60 border-violet-600/60 text-violet-200",
  "bg-emerald-900/60 border-emerald-600/60 text-emerald-200",
  "bg-amber-900/60 border-amber-600/60 text-amber-200",
  "bg-pink-900/60 border-pink-600/60 text-pink-200",
  "bg-cyan-900/60 border-cyan-600/60 text-cyan-200",
  "bg-orange-900/60 border-orange-600/60 text-orange-200",
  "bg-teal-900/60 border-teal-600/60 text-teal-200",
];

const phaseCaption: Record<string, string> = {
  found:   "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
  insert:  "bg-indigo-500/15 border-indigo-500/30 text-indigo-200",
  error:   "bg-red-500/15 border-red-500/30 text-red-200",
  default: "bg-indigo-500/15 border-indigo-500/30 text-indigo-200",
};

const DEFAULT_OPS: Array<{ op: "union"; x: number; y: number } | { op: "find"; x: number }> = [
  { op: "union", x: 0, y: 1 },
  { op: "union", x: 2, y: 3 },
  { op: "union", x: 4, y: 5 },
  { op: "union", x: 6, y: 7 },
  { op: "union", x: 0, y: 2 },
  { op: "union", x: 4, y: 6 },
  { op: "find",  x: 3        },
  { op: "union", x: 1, y: 5 },
  { op: "find",  x: 7        },
];

function UFVisualizer({ step }: { step?: UFStep }) {
  if (!step) {
    return <div className="p-8 text-center text-gray-600 text-sm">Click Run to start Union-Find demo.</div>;
  }

  const { parent, rank, n, ufHighlightNodes, findPath, roots } = step;
  const highlighted = new Set(ufHighlightNodes);
  const pathSet = new Set(findPath ?? []);
  const rootSet = new Set(roots ?? []);

  // Compute components (group by root)
  const rootOf = (x: number): number => {
    let cur = x;
    while (parent[cur] !== cur) cur = parent[cur];
    return cur;
  };
  const compMap = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const r = rootOf(i);
    if (!compMap.has(r)) compMap.set(r, []);
    compMap.get(r)!.push(i);
  }
  const rootOrder = Array.from(compMap.keys()).sort((a, b) => a - b);
  const nodeComp = new Map<number, number>();
  rootOrder.forEach((r, ci) => compMap.get(r)!.forEach(node => nodeComp.set(node, ci)));

  return (
    <div className="p-6 space-y-6 overflow-x-auto">
      {/* Node grid */}
      <div className="flex gap-3 flex-wrap">
        {Array.from({ length: n }, (_, i) => {
          const compIdx = nodeComp.get(i) ?? 0;
          const isHighlight = highlighted.has(i);
          const isPath = pathSet.has(i);
          const isRoot = parent[i] === i;
          const isRootHl = rootSet.has(i);
          const cls = isRootHl ? "ring-2 ring-emerald-400" : isHighlight ? "ring-2 ring-amber-400" : isPath ? "ring-1 ring-indigo-400" : "";
          const colorCls = COMPONENT_COLORS[compIdx % COMPONENT_COLORS.length];

          return (
            <div key={i} className="flex flex-col items-center gap-1">
              {/* Parent arrow */}
              <div className="text-[10px] text-gray-600 h-5 flex items-center font-mono">
                {isRoot ? "root" : `↑${parent[i]}`}
              </div>
              {/* Node circle */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold font-mono border-2 transition-all duration-300 ${colorCls} ${cls}`}>
                {i}
              </div>
              {/* Rank */}
              <div className="text-[10px] text-gray-500 font-mono">r={rank[i]}</div>
            </div>
          );
        })}
      </div>

      {/* Component groups */}
      <div className="space-y-1.5">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider">Components ({compMap.size})</div>
        <div className="flex gap-2 flex-wrap">
          {rootOrder.map((r, ci) => (
            <div key={r} className={`border rounded-lg px-3 py-1.5 text-xs font-mono ${COMPONENT_COLORS[ci % COMPONENT_COLORS.length]}`}>
              {"{" + compMap.get(r)!.join(", ") + "}"}
            </div>
          ))}
        </div>
      </div>

      {/* Find path highlight */}
      {findPath && findPath.length > 1 && (
        <div className="text-xs text-indigo-300 font-mono bg-indigo-900/20 border border-indigo-700/30 rounded-lg px-3 py-2">
          Path: {findPath.join(" → ")}
        </div>
      )}
    </div>
  );
}

export default function UnionFindPage() {
  const [steps, setSteps] = useState<UFStep[]>([]);

  const { step, playing, speed, play, pause, stepForward, stepBackward, reset, setSpeed } = usePlayer(steps.length);
  const currentStep = steps[step] as UFStep | undefined;

  const handleRun = () => setSteps(demoUnionFind(N, DEFAULT_OPS));

  const annotation = currentStep ? UF_ANNOTATIONS[currentStep.highlightLine] : undefined;
  const captionClass = phaseCaption[currentStep?.phase ?? "default"] ?? phaseCaption.default;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-700 rounded-lg flex items-center justify-center text-sm font-bold">∪</div>
          <h1 className="text-xl font-bold">Union-Find (DSU)</h1>
          <span className="text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">
            path compression · union by rank · O(α(n))
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-4">
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Visualization</span>
            <span className="text-xs text-gray-500">color = component · "root" = self-parent · r = rank · ring = highlighted node</span>
          </div>
          <div className="relative">
            <UFVisualizer step={currentStep} />
            {steps.length > 0 && currentStep && (
              <div className="px-4 pb-4 space-y-2">
                <div className={`border rounded-lg px-4 py-2.5 flex items-center gap-3 transition-all duration-300 ${captionClass}`}>
                  <span className="text-base shrink-0">▶</span>
                  <span className="text-sm leading-relaxed">{currentStep.explanation}</span>
                  <span className="ml-auto text-xs opacity-50 shrink-0">step {step + 1}/{steps.length}</span>
                </div>
                <AIExplainer algorithm="Union-Find (DSU)" stepExplanation={currentStep.explanation} stepIndex={step} totalSteps={steps.length} />
              </div>
            )}
          </div>
        </div>

        {steps.length > 0 && (
          <Controls step={step} total={steps.length} playing={playing} speed={speed}
            onPlay={play} onPause={pause} onStepForward={stepForward} onStepBackward={stepBackward}
            onReset={reset} onSpeedChange={setSpeed} />
        )}

        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800"><span className="text-sm font-medium text-gray-300">Pseudocode</span></div>
          <div className="p-4">
            <CodePanel lines={UF_CODE} highlightLine={currentStep?.highlightLine ?? -1} annotation={annotation} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Run Demo</h3>
            <button onClick={handleRun} className="w-full px-4 py-3 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium">Run Demo (8 nodes)</button>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Operations: union(0,1) union(2,3) union(4,5) union(6,7) union(0,2) union(4,6)</p>
              <p>then find(3) — see path compression! — then union(1,5) find(7)</p>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Complexity</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded-lg p-3"><div className="text-xs text-gray-500 mb-1">Time</div><div className="text-lg font-bold text-indigo-400">{UF_COMPLEXITY.time}</div></div>
              <div className="bg-gray-800 rounded-lg p-3"><div className="text-xs text-gray-500 mb-1">Space</div><div className="text-lg font-bold text-purple-400">{UF_COMPLEXITY.space}</div></div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{UF_COMPLEXITY.note}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
