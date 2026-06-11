"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import GraphVisualizer from "./GraphVisualizer";
import Controls from "@/components/shared/Controls";
import CodePanel from "@/components/shared/CodePanel";
import { usePlayer } from "@/components/shared/usePlayer";
import AIExplainer from "@/components/shared/AIExplainer";
import {
  dijkstra, bellmanFord, kruskal, tsp, topologicalSort, primMST,
  buildWeightedGraph, buildTSPGraph, buildTopoGraph,
  AlgoStep, AlgoState,
  ALGO_CODE, ALGO_ANNOTATIONS, ALGO_COMPLEXITY,
} from "@/lib/graph-algorithms-engine";

const phaseCaption: Record<string, string> = {
  insert:  "bg-green-500/15 border-green-500/30 text-green-200",
  found:   "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
  delete:  "bg-red-500/15 border-red-500/30 text-red-200",
  error:   "bg-red-500/15 border-red-500/30 text-red-200",
  default: "bg-indigo-500/15 border-indigo-500/30 text-indigo-200",
};

interface Props {
  algo: string;
  title: string;
  icon: string;
  color: string;
  directed: boolean;
}

export default function AlgoVisualizerClient({ algo, title, icon, color }: Props) {
  const [graphState] = useState<AlgoState>(() =>
    algo === "tsp" ? buildTSPGraph() :
    algo === "topoSort" ? buildTopoGraph() :
    buildWeightedGraph()
  );
  const [startVertex, setStartVertex] = useState("A");
  const [steps, setSteps] = useState<AlgoStep[]>([]);

  const { step, playing, speed, play, pause, stepForward, stepBackward, reset, setSpeed } = usePlayer(steps.length);
  const currentStep = steps[step];

  const handleRun = useCallback(() => {
    let result: AlgoStep[] = [];
    if (algo === "dijkstra")         result = dijkstra(graphState, startVertex);
    else if (algo === "bellmanFord") result = bellmanFord(graphState, startVertex);
    else if (algo === "kruskal")     result = kruskal(graphState);
    else if (algo === "tsp")         result = tsp(graphState);
    else if (algo === "topoSort")    result = topologicalSort(graphState);
    else if (algo === "prim")        result = primMST(graphState, startVertex);
    setSteps(result);
  }, [algo, graphState, startVertex]);

  const complexity = ALGO_COMPLEXITY[algo];
  const annotation = currentStep ? ALGO_ANNOTATIONS[algo]?.[currentStep.highlightLine] : undefined;
  const captionClass = phaseCaption[currentStep?.phase ?? "default"] ?? phaseCaption.default;

  // Get distances from current step for label overlay
  const displayState = currentStep?.state ?? graphState;
  const distances: Record<string, number> = (currentStep?.state as AlgoState | undefined)?.distances ?? {};
  const mstEdges: string[] = (currentStep?.state as AlgoState | undefined)?.mstEdges ?? [];

  const needsStart = algo !== "kruskal" && algo !== "tsp" && algo !== "topoSort" && algo !== "prim" || algo === "prim";

  // Look up edge weight by "FromLabel-ToLabel" string
  const getEdgeWeight = (label: string): number | undefined => {
    const dash = label.indexOf("-");
    if (dash === -1) return undefined;
    const fromLabel = label.slice(0, dash);
    const toLabel = label.slice(dash + 1);
    const fv = displayState.vertices.find((v) => v.label === fromLabel);
    const tv = displayState.vertices.find((v) => v.label === toLabel);
    if (!fv || !tv) return undefined;
    return displayState.edges.find((e) => e.from === fv.id && e.to === tv.id)?.weight;
  };

  // TSP best-tour cost breakdown string: "10+7+6+9 = 32"
  const tspBreakdown = (() => {
    const algoState = currentStep?.state as AlgoState | undefined;
    const tour = algoState?.bestTour;
    if (!tour || tour.length < 2) return null;
    const parts: number[] = [];
    for (let i = 0; i < tour.length - 1; i++) {
      const w = getEdgeWeight(`${tour[i]}-${tour[i + 1]}`);
      if (w === undefined) return null;
      parts.push(w);
    }
    return { parts, total: algoState!.bestCost ?? parts.reduce((a, b) => a + b, 0) };
  })();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/algorithms/graph" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center text-sm font-bold`}>{icon}</div>
          <h1 className="text-xl font-bold">{title}</h1>
          <span className="text-xs bg-gray-800 border border-gray-700 text-gray-400 px-2 py-0.5 rounded-full font-mono">
            {complexity?.time}
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-4">
        {/* Visualization card */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Visualization</span>
            <span className="text-xs text-gray-500">
              {algo === "tsp" ? "Complete undirected graph · 4 cities · 6 edges" : algo === "topoSort" ? "Directed acyclic graph · 5 vertices · 6 edges" : "Weighted undirected graph · 5 vertices · 6 edges"}
            </span>
          </div>
          <div className="relative">
            {/* Graph + distance labels overlay */}
            <div className="relative">
              <GraphVisualizer
                state={displayState}
                highlightVertices={currentStep?.highlightVertices ?? []}
                highlightEdges={currentStep ? [...currentStep.highlightEdges, ...mstEdges] : []}
                phase={currentStep?.phase}
                visitedOrder={currentStep?.visitedOrder}
                visitedVertices={currentStep?.visitedVertices}
              />

              {/* Distance labels overlay (Dijkstra / Bellman-Ford) */}
              {Object.keys(distances).length > 0 && (
                <div className="absolute inset-0 pointer-events-none">
                  <svg width="100%" height="100%" viewBox="0 0 600 400" className="absolute inset-0">
                    {displayState.vertices.map((v) => {
                      const pos = displayState.positions[v.id];
                      if (!pos) return null;
                      const dist = distances[v.id];
                      const label = dist === undefined ? "" : dist === Infinity ? "∞" : String(dist);
                      return (
                        <text
                          key={v.id}
                          x={pos.x + 18}
                          y={pos.y - 18}
                          fill="#fbbf24"
                          fontSize={11}
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {label}
                        </text>
                      );
                    })}
                  </svg>
                </div>
              )}

              {/* Edge weight labels */}
              <div className="absolute inset-0 pointer-events-none">
                <svg width="100%" height="100%" viewBox="0 0 600 400" className="absolute inset-0">
                  {displayState.edges
                    .filter((e) => {
                      // Only show one direction for undirected
                      const fv = displayState.vertices.find((v) => v.id === e.from);
                      const tv = displayState.vertices.find((v) => v.id === e.to);
                      if (!fv || !tv) return false;
                      return fv.label < tv.label;
                    })
                    .map((e) => {
                      const fp = displayState.positions[e.from];
                      const tp = displayState.positions[e.to];
                      if (!fp || !tp) return null;
                      const mx = (fp.x + tp.x) / 2;
                      const my = (fp.y + tp.y) / 2;
                      return (
                        <text
                          key={e.id}
                          x={mx}
                          y={my - 6}
                          fill="#9ca3af"
                          fontSize={10}
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          {e.weight}
                        </text>
                      );
                    })}
                </svg>
              </div>
            </div>

            {/* Distance table for Dijkstra/Bellman-Ford */}
            {Object.keys(distances).length > 0 && (
              <div className="px-4 pb-2">
                <div className="flex gap-2 flex-wrap">
                  {displayState.vertices.map((v) => {
                    const dist = distances[v.id];
                    const label = dist === undefined ? "?" : dist === Infinity ? "∞" : String(dist);
                    return (
                      <span key={v.id} className="text-xs font-mono bg-gray-800 border border-gray-700 px-2 py-1 rounded">
                        <span className="text-gray-400">{v.label}: </span>
                        <span className="text-amber-400">{label}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MST edges indicator for Kruskal */}
            {algo === "kruskal" && mstEdges.length > 0 && (
              <div className="px-4 pb-2 space-y-1.5">
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-xs text-gray-400">MST edges:</span>
                  {mstEdges.map((e) => {
                    const w = getEdgeWeight(e);
                    return (
                      <span key={e} className="text-xs font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                        {e}{w !== undefined ? ` (${w})` : ""}
                      </span>
                    );
                  })}
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  Total weight: <span className="text-emerald-400">
                    {mstEdges.map((e) => getEdgeWeight(e) ?? 0).join("+")} = {mstEdges.reduce((sum, e) => sum + (getEdgeWeight(e) ?? 0), 0)}
                  </span>
                </div>
              </div>
            )}

            {/* Topo sort order display */}
            {algo === "topoSort" && currentStep?.visitedOrder && currentStep.visitedOrder.length > 0 && (
              <div className="px-4 pb-2 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-400">Topo order so far:</span>
                  <span className="text-xs font-mono text-violet-300">
                    {currentStep.visitedOrder.join(" → ")}
                  </span>
                </div>
              </div>
            )}

            {/* TSP best tour indicator */}
            {algo === "tsp" && (
              <div className="px-4 pb-2 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-400">Best tour so far:</span>
                  {(currentStep?.state as AlgoState | undefined)?.bestTour?.length ? (
                    <span className="text-xs font-mono text-pink-300">
                      {(currentStep!.state as AlgoState).bestTour!.join(" → ")}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500 font-mono italic">none yet — click Run</span>
                  )}
                </div>
                {tspBreakdown && (
                  <div className="text-xs text-gray-500 font-mono">
                    Minimum Cost: <span className="text-pink-400">{tspBreakdown.parts.join("+")} = {tspBreakdown.total}</span>
                  </div>
                )}
              </div>
            )}

            {/* Caption */}
            {steps.length > 0 && currentStep && (
              <div className="px-4 pb-4 space-y-2">
                <div className={`border rounded-lg px-4 py-2.5 flex items-center gap-3 transition-all duration-300 ${captionClass}`}>
                  <span className="text-base shrink-0">▶</span>
                  <span className="text-sm leading-relaxed">{currentStep.explanation}</span>
                  <span className="ml-auto text-xs opacity-50 shrink-0">step {step + 1}/{steps.length}</span>
                </div>
                <AIExplainer
                  algorithm={title}
                  stepExplanation={currentStep.explanation}
                  stepIndex={step}
                  totalSteps={steps.length}
                />
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        {steps.length > 0 && (
          <Controls step={step} total={steps.length} playing={playing} speed={speed}
            onPlay={play} onPause={pause} onStepForward={stepForward} onStepBackward={stepBackward}
            onReset={reset} onSpeedChange={setSpeed} />
        )}

        {/* Pseudocode */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800">
            <span className="text-sm font-medium text-gray-300">Pseudocode</span>
          </div>
          <div className="p-4">
            <CodePanel lines={ALGO_CODE[algo] ?? []} highlightLine={currentStep?.highlightLine ?? 0} annotation={annotation} />
          </div>
        </div>

        {/* Run controls + Complexity */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-300">Run Algorithm</h3>
            {needsStart && (
              <div>
                <label htmlFor="algo-start-vertex" className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">
                  Start Vertex
                </label>
                <input
                  id="algo-start-vertex"
                  type="text"
                  value={startVertex}
                  onChange={(e) => { setStartVertex(e.target.value.toUpperCase()); setSteps([]); }}
                  placeholder="e.g. A"
                  maxLength={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
            <button
              type="button"
              onClick={handleRun}
              className={`w-full px-4 py-3 ${color} hover:opacity-90 text-white rounded-lg text-sm font-medium transition-all`}
            >
              Run {title}
            </button>
            <div className="text-xs text-gray-500 space-y-1">
              {algo !== "tsp" && algo !== "topoSort" && <p>Graph: A—B(4), A—C(2), B—D(5), C—D(1), D—E(3), B—E(6)</p>}
              {algo === "prim" && <p className="text-emerald-400/70">Highlighted edges form Prim's minimum spanning tree.</p>}
              {algo === "topoSort" && <p>DAG: A→C, A→D, B→D, B→E, C→E, D→E</p>}
              {algo === "tsp" && <p>Cities: A—B(10), A—C(8), A—D(9), B—C(7), B—D(12), C—D(6)</p>}
              {(algo === "dijkstra" || algo === "bellmanFord") && (
                <p className="text-amber-400/70">Yellow labels show shortest distances from start.</p>
              )}
              {algo === "kruskal" && (
                <p className="text-emerald-400/70">Highlighted edges form the minimum spanning tree.</p>
              )}
              {algo === "tsp" && (
                <p className="text-pink-400/70">Pink text shows the best Hamiltonian cycle found so far.</p>
              )}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Complexity Analysis</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Time</div>
                <div className="text-lg font-bold text-indigo-400">{complexity?.time}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Space</div>
                <div className="text-lg font-bold text-purple-400">{complexity?.space}</div>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{complexity?.note}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
