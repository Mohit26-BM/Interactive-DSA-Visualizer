"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import SortingVisualizer from "./SortingVisualizer";
import Controls from "@/components/shared/Controls";
import CodePanel from "@/components/shared/CodePanel";
import { usePlayer } from "@/components/shared/usePlayer";
import AIExplainer from "@/components/shared/AIExplainer";
import {
  bubbleSort, selectionSort, insertionSort, mergeSort, quickSort, countingSort, heapSort,
  SortStep, SORT_CODE, SORT_ANNOTATIONS, SORT_COMPLEXITY,
} from "@/lib/sorting-engine";

const DEFAULT_VALUES = [64, 34, 25, 12, 22, 11, 90, 45];

const phaseCaption: Record<string, string> = {
  insert:  "bg-green-500/15 border-green-500/30 text-green-200",
  found:   "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
  delete:  "bg-red-500/15 border-red-500/30 text-red-200",
  error:   "bg-red-500/15 border-red-500/30 text-red-200",
  default: "bg-indigo-500/15 border-indigo-500/30 text-indigo-200",
};

function randomArray(n = 8): number[] {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 90) + 10);
}

interface Props {
  algo: string;
  title: string;
  icon: string;
  color: string;
}

export default function SortingVisualizerClient({ algo, title, icon, color }: Props) {
  const [values, setValues] = useState<number[]>(DEFAULT_VALUES);
  const [steps, setSteps] = useState<SortStep[]>([]);
  const [customInput, setCustomInput] = useState(DEFAULT_VALUES.join(", "));
  const [inputError, setInputError] = useState("");

  const { step, playing, speed, play, pause, stepForward, stepBackward, reset, setSpeed } = usePlayer(steps.length);
  const currentStep = steps[step];

  const handleRun = useCallback(() => {
    let result: SortStep[] = [];
    if (algo === "bubbleSort")    result = bubbleSort(values);
    else if (algo === "selectionSort") result = selectionSort(values);
    else if (algo === "insertionSort") result = insertionSort(values);
    else if (algo === "mergeSort")     result = mergeSort(values);
    else if (algo === "quickSort")     result = quickSort(values);
    else if (algo === "countingSort")  result = countingSort(values);
    else if (algo === "heapSort")      result = heapSort(values);
    setSteps(result);
  }, [algo, values]);

  const handleApplyResult = () => {
    if (!currentStep) return;
    setValues(currentStep.state.arr);
    setSteps([]);
  };

  const handleRandomize = () => {
    const arr = randomArray(8 + Math.floor(Math.random() * 3));
    setValues(arr);
    setCustomInput(arr.join(", "));
    setSteps([]);
  };

  const handleCustomInput = () => {
    const nums = customInput.split(",").map((s) => parseInt(s.trim())).filter((n) => !isNaN(n));
    if (nums.length < 2) { setInputError("Enter at least 2 numbers."); return; }
    if (nums.length > 14) { setInputError("Max 14 elements."); return; }
    if (algo === "countingSort" && nums.some((n) => n < 0)) {
      setInputError("Counting sort requires non-negative integers.");
      return;
    }
    setInputError("");
    setValues(nums);
    setSteps([]);
  };

  const complexity = SORT_COMPLEXITY[algo];
  const annotation = currentStep ? SORT_ANNOTATIONS[algo]?.[currentStep.highlightLine] : undefined;
  const captionClass = phaseCaption[currentStep?.phase ?? "default"] ?? phaseCaption.default;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/algorithms/sorting" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center text-sm font-bold`}>{icon}</div>
          <h1 className="text-xl font-bold">{title}</h1>
          <span className="text-xs bg-gray-800 border border-gray-700 text-gray-400 px-2 py-0.5 rounded-full font-mono">
            {complexity?.time} · {complexity?.space} space
          </span>
        </div>
        {steps.length > 0 && step === steps.length - 1 && (
          <button onClick={handleApplyResult} className="ml-auto px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors">
            Apply Result
          </button>
        )}
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-4">
        {/* Array input */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-60">
            <label htmlFor="sort-custom-input" className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">Array Elements</label>
            <input
              id="sort-custom-input"
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. 64, 34, 25, 12"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
            />
            {inputError && <p className="text-xs text-red-400 mt-1">{inputError}</p>}
          </div>
          <button onClick={handleCustomInput} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors">
            Set Array
          </button>
          <button onClick={handleRandomize} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors">
            Randomize
          </button>
        </div>

        {/* Visualization card */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Visualization</span>
            <span className="text-xs text-gray-500">{values.length} elements</span>
          </div>
          <div className="relative">
            {steps.length > 0 && currentStep ? (
              <SortingVisualizer
                state={currentStep.state}
                comparingIndices={currentStep.comparingIndices}
                swappingIndices={currentStep.swappingIndices}
                sortedIndices={currentStep.sortedIndices}
                pivotIndex={currentStep.pivotIndex}
                phase={currentStep.phase}
              />
            ) : (
              <SortingVisualizer
                state={{ arr: values }}
                comparingIndices={[]}
                swappingIndices={[]}
                sortedIndices={[]}
              />
            )}
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
            <CodePanel lines={SORT_CODE[algo] ?? []} highlightLine={currentStep?.highlightLine ?? 0} annotation={annotation} />
          </div>
        </div>

        {/* Controls + Complexity */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Run Sorting</h3>
            <button
              onClick={handleRun}
              className={`w-full px-4 py-3 ${color} hover:opacity-90 text-white rounded-lg text-sm font-medium transition-all`}
            >
              Sort Array
            </button>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="text-center bg-gray-800 rounded-lg p-2">
                <div className="text-[10px] text-gray-500 mb-0.5">Comparing</div>
                <div className="w-4 h-4 bg-yellow-500 rounded mx-auto" />
              </div>
              <div className="text-center bg-gray-800 rounded-lg p-2">
                <div className="text-[10px] text-gray-500 mb-0.5">Swapping</div>
                <div className="w-4 h-4 bg-red-500 rounded mx-auto" />
              </div>
              <div className="text-center bg-gray-800 rounded-lg p-2">
                <div className="text-[10px] text-gray-500 mb-0.5">Sorted</div>
                <div className="w-4 h-4 bg-green-600 rounded mx-auto" />
              </div>
            </div>
            {algo === "quickSort" && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500 rounded shrink-0" />
                <span className="text-xs text-gray-400">Pivot element</span>
              </div>
            )}
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
