"use client";

import { useState } from "react";
import Link from "next/link";
import { GridDPVisualizer } from "@/components/dp/DPVisualizer";
import Controls from "@/components/shared/Controls";
import CodePanel from "@/components/shared/CodePanel";
import AIExplainer from "@/components/shared/AIExplainer";
import { usePlayer } from "@/components/shared/usePlayer";
import { uniquePathsDP, minPathSumDP, DP_CODE, DP_ANNOTATIONS, DP_COMPLEXITY, type GridStep } from "@/lib/dp-engine";

type Mode = "uniquePaths" | "minPathSum";

const phaseCaption: Record<string, string> = {
  insert:  "bg-indigo-500/15 border-indigo-500/30 text-indigo-200",
  found:   "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
  error:   "bg-red-500/15 border-red-500/30 text-red-200",
  default: "bg-sky-500/15 border-sky-500/30 text-sky-200",
};

const DEFAULT_GRID = [
  [1, 3, 1],
  [1, 5, 1],
  [4, 2, 1],
];

function GridInput({ grid, setGrid }: { grid: number[][], setGrid: (g: number[][]) => void }) {
  return (
    <div className="flex flex-col gap-1">
      {grid.map((row, r) => (
        <div key={r} className="flex gap-1">
          {row.map((val, c) => (
            <input
              key={c}
              type="number"
              min={0} max={9}
              value={val}
              onChange={(e) => {
                const next = grid.map((row) => [...row]);
                next[r][c] = Math.max(0, Math.min(9, parseInt(e.target.value) || 0));
                setGrid(next);
              }}
              className="w-10 h-10 bg-gray-800 border border-gray-600 rounded text-center text-sm font-mono text-white focus:outline-none focus:border-sky-500"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function GridDPPage() {
  const [mode, setMode] = useState<Mode>("uniquePaths");
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(4);
  const [minGrid, setMinGrid] = useState<number[][]>(DEFAULT_GRID);
  const [steps, setSteps] = useState<GridStep[]>([]);

  const { step, playing, speed, play, pause, stepForward, stepBackward, reset, setSpeed } = usePlayer(steps.length);
  const currentStep = steps[step] as GridStep | undefined;

  const handleRun = () => {
    if (mode === "uniquePaths") {
      setSteps(uniquePathsDP(rows, cols));
    } else {
      setSteps(minPathSumDP(minGrid));
    }
  };

  const codeKey = mode === "uniquePaths" ? "uniquePaths" : "minPathSum";
  const codeLines = DP_CODE[codeKey];
  const complexity = DP_COMPLEXITY[codeKey];
  const annotation = currentStep ? DP_ANNOTATIONS[codeKey]?.[currentStep.highlightLine] : undefined;
  const captionClass = phaseCaption[currentStep?.phase ?? "default"] ?? phaseCaption.default;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/dp" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sky-700 rounded-lg flex items-center justify-center text-sm font-bold">⊞</div>
          <h1 className="text-xl font-bold">Grid DP</h1>
          <span className="text-xs bg-sky-500/10 border border-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full">
            2-D table · move right/down only
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-4">

        {/* Mode toggle */}
        <div className="flex gap-2">
          {(["uniquePaths", "minPathSum"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setSteps([]); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m ? "bg-sky-700 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
            >
              {m === "uniquePaths" ? "Unique Paths" : "Min Path Sum"}
            </button>
          ))}
        </div>

        {/* Visualization */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Visualization</span>
            <span className="text-xs text-gray-500">amber = current cell · indigo = filled · emerald = result</span>
          </div>
          <div className="relative overflow-auto">
            <GridDPVisualizer step={currentStep} />
            {steps.length > 0 && currentStep && (
              <div className="px-4 pb-4 space-y-2">
                <div className={`border rounded-lg px-4 py-2.5 flex items-center gap-3 transition-all duration-300 ${captionClass}`}>
                  <span className="text-base shrink-0">▶</span>
                  <span className="text-sm leading-relaxed">{currentStep.explanation}</span>
                  <span className="ml-auto text-xs opacity-50 shrink-0">step {step + 1}/{steps.length}</span>
                </div>
                <AIExplainer
                  algorithm={mode === "uniquePaths" ? "Unique Paths DP" : "Min Path Sum DP"}
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
            <h3 className="text-sm font-semibold text-gray-300">Input</h3>

            {mode === "uniquePaths" ? (
              <div className="flex gap-4 items-end">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Rows (m)</label>
                  <input type="number" min={2} max={6} value={rows} onChange={(e) => { setRows(Math.max(2, Math.min(6, parseInt(e.target.value) || 3))); setSteps([]); }}
                    className="w-16 bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white text-center focus:outline-none focus:border-sky-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Cols (n)</label>
                  <input type="number" min={2} max={6} value={cols} onChange={(e) => { setCols(Math.max(2, Math.min(6, parseInt(e.target.value) || 4))); setSteps([]); }}
                    className="w-16 bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white text-center focus:outline-none focus:border-sky-500" />
                </div>
                <p className="text-xs text-gray-500">Grid: {rows}×{cols}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-gray-500">Edit the 3×3 grid values (0–9):</p>
                <GridInput grid={minGrid} setGrid={(g) => { setMinGrid(g); setSteps([]); }} />
              </div>
            )}

            <button type="button" onClick={handleRun}
              className="w-full px-4 py-2 bg-sky-700 hover:bg-sky-600 text-white rounded-lg text-sm font-medium transition-colors">
              Run {mode === "uniquePaths" ? "Unique Paths" : "Min Path Sum"}
            </button>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Complexity</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Time</div>
                <div className="text-lg font-bold text-sky-400">{complexity.time}</div>
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
