"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Controls from "@/components/shared/Controls";
import CodePanel from "@/components/shared/CodePanel";
import { usePlayer } from "@/components/shared/usePlayer";
import AIExplainer from "@/components/shared/AIExplainer";
import {
  linearSearch, binarySearch, jumpSearch,
  SearchStep, SEARCH_CODE, SEARCH_ANNOTATIONS, SEARCH_COMPLEXITY,
} from "@/lib/searching-engine";

const SORTED_DEFAULT = [11, 22, 25, 34, 45, 64, 90];
const UNSORTED_DEFAULT = [64, 34, 25, 12, 22, 11, 90];

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
}

export default function SearchingVisualizerClient({ algo, title, icon, color }: Props) {
  const requiresSorted = algo === "binarySearch" || algo === "jumpSearch";
  const defaultArr = requiresSorted ? SORTED_DEFAULT : UNSORTED_DEFAULT;

  const [values] = useState<number[]>(defaultArr);
  const [target, setTarget] = useState(34);
  const [steps, setSteps] = useState<SearchStep[]>([]);

  const { step, playing, speed, play, pause, stepForward, stepBackward, reset, setSpeed } = usePlayer(steps.length);
  const currentStep = steps[step];

  const handleRun = useCallback(() => {
    let result: SearchStep[] = [];
    if (algo === "linearSearch")  result = linearSearch(values, target);
    else if (algo === "binarySearch") result = binarySearch(values, target);
    else if (algo === "jumpSearch")   result = jumpSearch(values, target);
    setSteps(result);
  }, [algo, values, target]);

  const complexity = SEARCH_COMPLEXITY[algo];
  const annotation = currentStep ? SEARCH_ANNOTATIONS[algo]?.[currentStep.highlightLine] : undefined;
  const captionClass = phaseCaption[currentStep?.phase ?? "default"] ?? phaseCaption.default;

  const max = Math.max(...values, 1);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/algorithms/searching" className="text-gray-400 hover:text-white transition-colors">
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
          {requiresSorted && (
            <span className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
              Array is sorted
            </span>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-4">
        {/* Visualization card */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Visualization</span>
            <span className="text-xs text-gray-500">Array: [{values.join(", ")}]</span>
          </div>
          <div className="relative">
            {/* Bar visualization */}
            <div className="flex items-end justify-center gap-2 px-4 pt-6 pb-2" style={{ minHeight: 200 }}>
              {values.map((val, i) => {
                const comparing = currentStep?.comparingIndices?.includes(i) ?? false;
                const isFound = currentStep?.foundIndex === i;
                const isLow = currentStep?.low === i;
                const isHigh = currentStep?.high === i;
                const isMid = currentStep?.mid === i;

                let barColor = "bg-gray-600";
                if (isFound) barColor = "bg-green-500";
                else if (isMid) barColor = "bg-yellow-500";
                else if (comparing) barColor = "bg-blue-500";

                const heightPx = Math.max(20, Math.round((val / max) * 160));

                return (
                  <div key={i} className="flex flex-col items-center gap-1" style={{ minWidth: 40 }}>
                    {/* Pointer labels */}
                    <div className="flex gap-0.5 text-[9px] font-mono h-5 items-center">
                      {isLow  && <span className="text-blue-400">L</span>}
                      {isMid  && <span className="text-yellow-400">M</span>}
                      {isHigh && <span className="text-purple-400">H</span>}
                    </div>
                    <span className="text-xs text-gray-400 font-mono">{val}</span>
                    <div
                      className={`w-full rounded-t transition-all duration-200 ${barColor}`}
                      style={{ height: heightPx }}
                    />
                    <span className="text-[9px] text-gray-600 font-mono">{i}</span>
                  </div>
                );
              })}
            </div>

            {/* Legend for binary/jump */}
            {requiresSorted && (
              <div className="flex gap-3 px-4 pb-2">
                <span className="text-[10px] text-blue-400 font-mono">L = low</span>
                <span className="text-[10px] text-yellow-400 font-mono">M = mid</span>
                <span className="text-[10px] text-purple-400 font-mono">H = high</span>
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
                  additionalContext={`Array: [${values.join(", ")}], searching for ${target}`}
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
            <CodePanel lines={SEARCH_CODE[algo] ?? []} highlightLine={currentStep?.highlightLine ?? 0} annotation={annotation} />
          </div>
        </div>

        {/* Search controls + Complexity */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-300">Search</h3>
            <div>
              <label htmlFor="search-target" className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">
                Target Value
              </label>
              <input
                id="search-target"
                type="number"
                value={target}
                onChange={(e) => { setTarget(Number(e.target.value)); setSteps([]); }}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={handleRun}
              className={`w-full px-4 py-3 ${color} hover:opacity-90 text-white rounded-lg text-sm font-medium transition-all`}
            >
              Search for {target}
            </button>
            <p className="text-xs text-gray-500">Array: [{values.join(", ")}]</p>
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
