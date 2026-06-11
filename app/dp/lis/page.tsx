"use client";

import { useState } from "react";
import Link from "next/link";
import { LISVisualizer } from "@/components/dp/DPVisualizer";
import Controls from "@/components/shared/Controls";
import CodePanel from "@/components/shared/CodePanel";
import AIExplainer from "@/components/shared/AIExplainer";
import { usePlayer } from "@/components/shared/usePlayer";
import { lisDP, DP_CODE, DP_ANNOTATIONS, DP_COMPLEXITY, type LISStep } from "@/lib/dp-engine";

const phaseCaption: Record<string, string> = {
  insert:  "bg-indigo-500/15 border-indigo-500/30 text-indigo-200",
  found:   "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
  error:   "bg-red-500/15 border-red-500/30 text-red-200",
  default: "bg-amber-500/15 border-amber-500/30 text-amber-200",
};

const DEFAULT_ARR = [10, 9, 2, 5, 3, 7, 101, 18];

export default function LISPage() {
  const [arrInput, setArrInput] = useState("10, 9, 2, 5, 3, 7, 101, 18");
  const [steps, setSteps] = useState<LISStep[]>([]);
  const [error, setError] = useState("");

  const { step, playing, speed, play, pause, stepForward, stepBackward, reset, setSpeed } = usePlayer(steps.length);
  const currentStep = steps[step] as LISStep | undefined;

  const handleRun = () => {
    const arr = arrInput
      .split(/[,\s]+/)
      .map(Number)
      .filter((n) => !isNaN(n))
      .slice(0, 12);
    if (arr.length < 2) { setError("Enter at least 2 numbers."); return; }
    setError("");
    setArrInput(arr.join(", "));
    setSteps(lisDP(arr));
  };

  const handleRandomize = () => {
    const len = 8;
    const arr = Array.from({ length: len }, () => Math.floor(Math.random() * 20) + 1);
    setArrInput(arr.join(", "));
    setSteps(lisDP(arr));
  };

  const codeLines = DP_CODE.lis;
  const complexity = DP_COMPLEXITY.lis;
  const annotation = currentStep ? DP_ANNOTATIONS.lis[currentStep.highlightLine] : undefined;
  const captionClass = phaseCaption[currentStep?.phase ?? "default"] ?? phaseCaption.default;
  const lastStep = steps[steps.length - 1] as LISStep | undefined;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/dp" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-700 rounded-lg flex items-center justify-center text-sm font-bold">↗</div>
          <h1 className="text-xl font-bold">Longest Increasing Subsequence</h1>
          <span className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
            1-D DP · O(n²) · traceback
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-4">

        {/* Visualization card */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Visualization</span>
            <span className="text-xs text-gray-500">
              {lastStep?.lisIndices.length
                ? `LIS length = ${lastStep.lisIndices.length}`
                : "blue = i (current), yellow = j (comparing)"}
            </span>
          </div>
          <div className="relative overflow-auto">
            <LISVisualizer step={currentStep} />
            {steps.length > 0 && currentStep && (
              <div className="px-4 pb-4 space-y-2">
                <div className={`border rounded-lg px-4 py-2.5 flex items-center gap-3 transition-all duration-300 ${captionClass}`}>
                  <span className="text-base shrink-0">▶</span>
                  <span className="text-sm leading-relaxed">{currentStep.explanation}</span>
                  <span className="ml-auto text-xs opacity-50 shrink-0">step {step + 1}/{steps.length}</span>
                </div>
                <AIExplainer
                  algorithm="Longest Increasing Subsequence"
                  stepExplanation={currentStep.explanation}
                  stepIndex={step}
                  totalSteps={steps.length}
                  additionalContext={`Input array: [${currentStep.arr.join(", ")}].`}
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
            <CodePanel lines={codeLines} highlightLine={currentStep?.highlightLine ?? -1} annotation={annotation} />
          </div>
        </div>

        {/* Input + Complexity */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

          {/* Input */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Array Input</h3>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Numbers (comma-separated, max 12)</label>
              <input
                type="text"
                value={arrInput}
                onChange={(e) => setArrInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRun()}
                placeholder="e.g. 10, 9, 2, 5, 3, 7, 101, 18"
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-2">
              <button type="button" onClick={handleRun}
                className="flex-1 px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors">
                Find LIS
              </button>
              <button type="button" onClick={handleRandomize}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors">
                Randomize
              </button>
            </div>
            {lastStep?.lisIndices.length ? (
              <p className="text-xs text-emerald-400 font-mono">
                LIS = [{lastStep.lisIndices.map(i => lastStep.arr[i]).join(", ")}] (length {lastStep.lisIndices.length})
              </p>
            ) : null}
          </div>

          {/* Complexity */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Complexity</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Time</div>
                <div className="text-lg font-bold text-amber-400">{complexity.time}</div>
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
