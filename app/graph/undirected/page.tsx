"use client";

import { useState } from "react";
import Link from "next/link";
import GraphVisualizer from "@/components/graph/GraphVisualizer";
import GraphControls from "@/components/graph/GraphControls";
import Controls from "@/components/shared/Controls";
import CodePanel from "@/components/shared/CodePanel";
import { usePlayer } from "@/components/shared/usePlayer";
import AIExplainer from "@/components/shared/AIExplainer";
import {
  buildDefaultGraph,
  graphAddVertex, graphAddEdge, graphRemoveEdge,
  graphDFS, graphBFS,
  GRAPH_CODE, GRAPH_ANNOTATIONS, GRAPH_COMPLEXITY,
  GraphState, GraphStep,
} from "@/lib/graph-engine";

const phaseCaption: Record<string, string> = {
  insert:  "bg-green-500/15 border-green-500/30 text-green-200",
  found:   "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
  delete:  "bg-red-500/15 border-red-500/30 text-red-200",
  error:   "bg-red-500/15 border-red-500/30 text-red-200",
  default: "bg-indigo-500/15 border-indigo-500/30 text-indigo-200",
};

export default function UndirectedGraphPage() {
  const [graphState, setGraphState] = useState<GraphState>(() => buildDefaultGraph("undirected"));
  const [steps, setSteps] = useState<GraphStep[]>([]);
  const [currentOp, setCurrentOp] = useState("bfs");

  const { step, playing, speed, play, pause, stepForward, stepBackward, reset, setSpeed } = usePlayer(steps.length);
  const currentStep = steps[step] as GraphStep | undefined;

  const handleRun = (op: string, params: Record<string, string | number>) => {
    setCurrentOp(op);
    let result: GraphStep[] = [];

    if (op === "addVertex") {
      result = graphAddVertex(graphState, String(params.label ?? ""));
    } else if (op === "addEdge") {
      result = graphAddEdge(graphState, String(params.fromLabel ?? ""), String(params.toLabel ?? ""), typeof params.weight === "number" ? params.weight : undefined);
    } else if (op === "removeEdge") {
      result = graphRemoveEdge(graphState, String(params.fromLabel ?? ""), String(params.toLabel ?? ""));
    } else if (op === "dfs") {
      result = graphDFS(graphState, String(params.startLabel ?? ""));
    } else if (op === "bfs") {
      result = graphBFS(graphState, String(params.startLabel ?? ""));
    }

    setSteps(result);

    // For structural changes, apply immediately
    if (op === "addVertex" || op === "addEdge" || op === "removeEdge") {
      if (result.length > 0) {
        const finalStep = result[result.length - 1];
        setGraphState(finalStep.state);
        setSteps([]);
      }
    }
  };

  const handleApplyResult = () => {
    if (!currentStep) return;
    setGraphState(currentStep.state);
    setSteps([]);
  };

  const complexity = GRAPH_COMPLEXITY[currentOp];
  const annotation = currentStep ? GRAPH_ANNOTATIONS[currentOp]?.[currentStep.highlightLine] : undefined;
  const captionClass = phaseCaption[currentStep?.phase ?? "default"] ?? phaseCaption.default;
  const displayState = currentStep ? currentStep.state : graphState;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/graph" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-violet-700 rounded-lg flex items-center justify-center text-sm font-bold">○—○</div>
          <h1 className="text-xl font-bold">Undirected Graph</h1>
          <span className="text-xs bg-violet-500/10 border border-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full">
            bidirectional · DFS · BFS
          </span>
        </div>
        {steps.length > 0 && step === steps.length - 1 && (
          <button type="button" onClick={handleApplyResult} className="ml-auto px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors">
            Apply Result
          </button>
        )}
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-4">
        {/* Visualization card */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Visualization</span>
            <span className="text-xs text-gray-500">
              {displayState.vertices.length} vertices · {Math.floor(displayState.edges.length / 2)} edges · undirected
            </span>
          </div>
          <div className="relative overflow-auto">
            <GraphVisualizer
              state={displayState}
              highlightVertices={currentStep?.highlightVertices ?? []}
              highlightEdges={currentStep?.highlightEdges ?? []}
              phase={currentStep?.phase}
              visitedOrder={currentStep?.visitedOrder}
            />
            {steps.length > 0 && currentStep && (
              <div className="px-4 pb-4 space-y-2">
                <div className={`border rounded-lg px-4 py-2.5 flex items-center gap-3 transition-all duration-300 ${captionClass}`}>
                  <span className="text-base shrink-0">▶</span>
                  <span className="text-sm leading-relaxed">{currentStep.explanation}</span>
                  <span className="ml-auto text-xs opacity-50 shrink-0">step {step + 1}/{steps.length}</span>
                </div>
                <AIExplainer
                  algorithm="Undirected Graph"
                  stepExplanation={currentStep.explanation}
                  stepIndex={step}
                  totalSteps={steps.length}
                />
              </div>
            )}
          </div>
        </div>

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
            <CodePanel lines={GRAPH_CODE[currentOp] ?? []} highlightLine={currentStep?.highlightLine ?? 0} annotation={annotation} />
          </div>
        </div>

        {/* Controls + Complexity */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <GraphControls directed={false} onRun={handleRun} />
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Complexity Analysis</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Time</div>
                <div className="text-lg font-bold text-violet-400">{complexity?.time}</div>
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
