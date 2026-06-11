"use client";

import { useState } from "react";
import Link from "next/link";
import Controls from "@/components/shared/Controls";
import CodePanel from "@/components/shared/CodePanel";
import AIExplainer from "@/components/shared/AIExplainer";
import { usePlayer } from "@/components/shared/usePlayer";
import {
  floydWarshall, buildWeightedGraph,
  ALGO_CODE, ALGO_ANNOTATIONS, ALGO_COMPLEXITY,
  type FWStep,
} from "@/lib/graph-algorithms-engine";

const FW_INF = 999999;

const phaseCaption: Record<string, string> = {
  insert:  "bg-amber-500/15 border-amber-500/30 text-amber-200",
  found:   "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
  error:   "bg-red-500/15 border-red-500/30 text-red-200",
  default: "bg-indigo-500/15 border-indigo-500/30 text-indigo-200",
};

function MatrixVisualizer({ step }: { step?: FWStep }) {
  if (!step) {
    return (
      <div className="p-8 text-center text-gray-600 text-sm">
        Click Run to start Floyd-Warshall on the default graph.
      </div>
    );
  }
  const { matrix, labels, k, highlightI, highlightJ } = step;
  const n = labels.length;

  const cellColor = (r: number, c: number) => {
    if (r === highlightI && c === highlightJ) return "bg-amber-900/70 border-amber-500/60 text-amber-200 ring-1 ring-amber-400/50";
    if (r === highlightI || c === highlightJ) return "bg-amber-900/20 border-amber-800/30 text-amber-300/70";
    if (k >= 0 && (r === k || c === k)) return "bg-indigo-900/30 border-indigo-700/30 text-indigo-300";
    if (r === c) return "bg-gray-700/40 border-gray-600/40 text-gray-400";
    return "bg-gray-800/50 border-gray-700/40 text-gray-300";
  };

  return (
    <div className="p-6 overflow-x-auto">
      <div className="inline-block">
        <div className="flex gap-1 mb-1 ml-10">
          {labels.map((l, j) => (
            <div key={j} className={`w-12 h-8 flex items-center justify-center text-xs font-bold font-mono ${k >= 0 && j === k ? "text-indigo-300" : "text-gray-400"}`}>{l}</div>
          ))}
        </div>
        {matrix.map((row, r) => (
          <div key={r} className="flex gap-1 mb-1">
            <div className={`w-8 h-12 flex items-center justify-center text-xs font-bold font-mono shrink-0 mr-2 ${k >= 0 && r === k ? "text-indigo-300" : "text-gray-400"}`}>{labels[r]}</div>
            {row.map((val, c) => (
              <div key={c} className={`w-12 h-12 flex items-center justify-center text-sm font-bold font-mono border rounded-lg transition-all duration-200 ${cellColor(r, c)}`}>
                {val >= FW_INF ? "∞" : val}
              </div>
            ))}
          </div>
        ))}
      </div>
      {k >= 0 && k < labels.length && (
        <div className="mt-3 text-xs text-indigo-300/70 font-mono">
          k = {labels[k]} (intermediate vertex — blue column/row)
        </div>
      )}
    </div>
  );
}

export default function FloydWarshallPage() {
  const [graphState] = useState(() => buildWeightedGraph());
  const [steps, setSteps] = useState<FWStep[]>([]);

  const { step, playing, speed, play, pause, stepForward, stepBackward, reset, setSpeed } = usePlayer(steps.length);
  const currentStep = steps[step] as FWStep | undefined;

  const handleRun = () => setSteps(floydWarshall(graphState));

  const codeLines = ALGO_CODE.floydWarshall;
  const complexity = ALGO_COMPLEXITY.floydWarshall;
  const annotation = currentStep ? ALGO_ANNOTATIONS.floydWarshall[currentStep.highlightLine] : undefined;
  const captionClass = phaseCaption[currentStep?.phase ?? "default"] ?? phaseCaption.default;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/algorithms/graph" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sky-700 rounded-lg flex items-center justify-center text-sm font-bold">⊞</div>
          <h1 className="text-xl font-bold">Floyd-Warshall</h1>
          <span className="text-xs bg-sky-500/10 border border-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full">
            all-pairs shortest paths · O(V³)
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-4">

        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Distance Matrix</span>
            <span className="text-xs text-gray-500">Graph: A—B(4), A—C(2), B—D(5), C—D(1), D—E(3), B—E(6)</span>
          </div>
          <div className="relative">
            <MatrixVisualizer step={currentStep} />
            {steps.length > 0 && currentStep && (
              <div className="px-4 pb-4 space-y-2">
                <div className={`border rounded-lg px-4 py-2.5 flex items-center gap-3 transition-all duration-300 ${captionClass}`}>
                  <span className="text-base shrink-0">▶</span>
                  <span className="text-sm leading-relaxed">{currentStep.explanation}</span>
                  <span className="ml-auto text-xs opacity-50 shrink-0">step {step + 1}/{steps.length}</span>
                </div>
                <AIExplainer
                  algorithm="Floyd-Warshall"
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

        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800">
            <span className="text-sm font-medium text-gray-300">Pseudocode</span>
          </div>
          <div className="p-4">
            <CodePanel lines={codeLines} highlightLine={currentStep?.highlightLine ?? -1} annotation={annotation} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Run Algorithm</h3>
            <button type="button" onClick={handleRun}
              className="w-full px-4 py-3 bg-sky-700 hover:bg-sky-600 text-white rounded-lg text-sm font-medium transition-all">
              Run Floyd-Warshall
            </button>
            <p className="text-xs text-gray-500">
              Uses the default weighted graph: A—B(4), A—C(2), B—D(5), C—D(1), D—E(3), B—E(6).
              Blue column/row = current intermediate vertex k.
              Amber = cell being updated.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Complexity Analysis</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Time</div>
                <div className="text-lg font-bold text-indigo-400">{complexity.time}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Space</div>
                <div className="text-lg font-bold text-purple-400">{complexity.space}</div>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{complexity.note}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
