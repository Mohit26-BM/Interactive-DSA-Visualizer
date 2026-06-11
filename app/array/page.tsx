"use client";

import { useState } from "react";
import Link from "next/link";
import ArrayVisualizer from "@/components/array/ArrayVisualizer";
import ArrayControls from "@/components/array/ArrayControls";
import Controls from "@/components/shared/Controls";
import CodePanel from "@/components/shared/CodePanel";
import { usePlayer } from "@/components/shared/usePlayer";
import AIExplainer from "@/components/shared/AIExplainer";
import {
  arrayInsert, arrayDelete, arraySearch, arrayUpdate,
  arrayBubbleSort, arraySelectionSort, arrayInsertionSort,
  ARRAY_CODE, ARRAY_ANNOTATIONS,
} from "@/lib/array-engine";
import { ArrayStep } from "@/lib/types";

const DEFAULT = [10, 25, 7, 42, 3, 18];

const complexityMap: Record<string, { time: string; space: string; note: string }> = {
  insert:       { time: "O(n)",  space: "O(1)", note: "Elements after the index must shift right." },
  delete:       { time: "O(n)",  space: "O(1)", note: "Elements after the index must shift left." },
  search:       { time: "O(n)",  space: "O(1)", note: "Linear scan — checks every element." },
  update:       { time: "O(1)",  space: "O(1)", note: "Direct index access — constant time." },
  bubbleSort:   { time: "O(n²)", space: "O(1)", note: "Nested loops compare adjacent pairs." },
  selectionSort:{ time: "O(n²)", space: "O(1)", note: "Finds minimum on each pass." },
  insertionSort:{ time: "O(n²)", space: "O(1)", note: "Best case O(n) for nearly sorted data." },
};

const phaseCaption: Record<string, string> = {
  insert: "bg-green-500/15 border-green-500/30 text-green-200",
  found:  "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
  delete: "bg-red-500/15 border-red-500/30 text-red-200",
  error:  "bg-red-500/15 border-red-500/30 text-red-200",
  default:"bg-indigo-500/15 border-indigo-500/30 text-indigo-200",
};

export default function ArrayPage() {
  const [elements, setElements] = useState(DEFAULT);
  const [steps, setSteps] = useState<ArrayStep[]>([]);
  const [currentOp, setCurrentOp] = useState("insert");
  const [customInput, setCustomInput] = useState(DEFAULT.join(", "));
  const [inputError, setInputError] = useState("");

  const { step, playing, speed, play, pause, stepForward, stepBackward, reset, setSpeed } = usePlayer(steps.length);
  const currentStep = steps[step];

  const handleRun = (op: string, params: Record<string, number>) => {
    setCurrentOp(op);
    let result: ArrayStep[] = [];
    if (op === "insert")       result = arrayInsert(elements, params.value, params.index);
    else if (op === "delete")       result = arrayDelete(elements, params.index);
    else if (op === "search")       result = arraySearch(elements, params.value);
    else if (op === "update")       result = arrayUpdate(elements, params.index, params.value);
    else if (op === "bubbleSort")   result = arrayBubbleSort(elements);
    else if (op === "selectionSort")result = arraySelectionSort(elements);
    else if (op === "insertionSort")result = arrayInsertionSort(elements);
    setSteps(result);
  };

  const handleApplyResult = () => {
    if (!currentStep) return;
    setElements(currentStep.state.elements.map((e) => e.value));
    setSteps([]);
  };

  const handleCustomInput = () => {
    const nums = customInput.split(",").map((s) => parseInt(s.trim())).filter((n) => !isNaN(n));
    if (nums.length === 0) { setInputError("Enter comma-separated numbers."); return; }
    if (nums.length > 12) { setInputError("Max 12 elements."); return; }
    setInputError("");
    setElements(nums);
    setSteps([]);
  };

  const complexity = complexityMap[currentOp];
  const annotation = currentStep ? ARRAY_ANNOTATIONS[currentOp]?.[currentStep.highlightLine] : undefined;
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
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">[]</div>
          <h1 className="text-xl font-bold">Array Visualizer</h1>
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
            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">Array Elements</label>
            <input type="text" value={customInput} onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. 10, 25, 7, 42"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500" />
            {inputError && <p className="text-xs text-red-400 mt-1">{inputError}</p>}
          </div>
          <button onClick={handleCustomInput} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors">
            Set Array
          </button>
        </div>

        {/* Visualization card — full width, caption overlay */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Visualization</span>
            <span className="text-xs text-gray-500">{elements.length} elements</span>
          </div>
          <div className="relative">
            {steps.length > 0 && currentStep
              ? <ArrayVisualizer state={currentStep.state} highlightIndices={currentStep.highlightIndices ?? []} phase={currentStep.phase} />
              : <ArrayVisualizer state={{ elements: elements.map((v, i) => ({ value: v, id: `init-${i}` })) }} highlightIndices={[]} />
            }
            {/* Caption overlay */}
            {steps.length > 0 && currentStep && (
              <div className="px-4 pb-4 space-y-2">
                <div className={`border rounded-lg px-4 py-2.5 flex items-center gap-3 transition-all duration-300 ${captionClass}`}>
                  <span className="text-base shrink-0">▶</span>
                  <span className="text-sm leading-relaxed">{currentStep.explanation}</span>
                  <span className="ml-auto text-xs opacity-50 shrink-0">step {step + 1}/{steps.length}</span>
                </div>
                <AIExplainer
                  algorithm={`Array — ${currentOp}`}
                  stepExplanation={currentStep.explanation}
                  stepIndex={step}
                  totalSteps={steps.length}
                />
              </div>
            )}
          </div>
        </div>

        {/* Playback controls */}
        {steps.length > 0 && (
          <Controls step={step} total={steps.length} playing={playing} speed={speed}
            onPlay={play} onPause={pause} onStepForward={stepForward} onStepBackward={stepBackward}
            onReset={reset} onSpeedChange={setSpeed} />
        )}

        {/* Pseudocode — full width */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800">
            <span className="text-sm font-medium text-gray-300">Pseudocode</span>
          </div>
          <div className="p-4">
            <CodePanel lines={ARRAY_CODE[currentOp] ?? []} highlightLine={currentStep?.highlightLine ?? 0} annotation={annotation} />
          </div>
        </div>

        {/* Operation controls + complexity */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <ArrayControls onRun={handleRun} arrayLength={elements.length} />
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
