"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrayStackVisualizer } from "@/components/stack/StackVisualizer";
import StackControls from "@/components/stack/StackControls";
import Controls from "@/components/shared/Controls";
import CodePanel from "@/components/shared/CodePanel";
import { usePlayer } from "@/components/shared/usePlayer";
import AIExplainer from "@/components/shared/AIExplainer";
import {
  stackArrPush, stackArrPop, stackArrPeek, stackArrIsEmpty, stackArrIsFull, stackArrClear,
  STACK_ARR_CODE, STACK_ARR_ANNOTATIONS, STACK_COMPLEXITY,
  StackArrayStep,
} from "@/lib/stack-engine";

const DEFAULT = [10, 25, 7, 42, 3];

const phaseCaption: Record<string, string> = {
  insert: "bg-green-500/15 border-green-500/30 text-green-200",
  found:  "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
  delete: "bg-red-500/15 border-red-500/30 text-red-200",
  error:  "bg-red-500/15 border-red-500/30 text-red-200",
  default:"bg-indigo-500/15 border-indigo-500/30 text-indigo-200",
};

export default function ArrayStackPage() {
  const [arrValues, setArrValues] = useState(DEFAULT);
  const [steps, setSteps] = useState<StackArrayStep[]>([]);
  const [currentOp, setCurrentOp] = useState("push");

  const { step, playing, speed, play, pause, stepForward, stepBackward, reset, setSpeed } = usePlayer(steps.length);
  const currentStep = steps[step] as StackArrayStep | undefined;

  const handleRun = (op: string, params: Record<string, number>) => {
    setCurrentOp(op);
    let result: StackArrayStep[] = [];
    if (op === "push")    result = stackArrPush(arrValues, params.value);
    else if (op === "pop")     result = stackArrPop(arrValues);
    else if (op === "peek")    result = stackArrPeek(arrValues);
    else if (op === "isEmpty") result = stackArrIsEmpty(arrValues);
    else if (op === "isFull")  result = stackArrIsFull(arrValues);
    else if (op === "clear")   result = stackArrClear(arrValues);
    setSteps(result);
  };

  const handleApplyResult = () => {
    if (currentStep) setArrValues(currentStep.state.elements.map((e) => e.value));
    setSteps([]);
  };

  const codeLines = STACK_ARR_CODE[currentOp] ?? [];
  const annotation = currentStep ? STACK_ARR_ANNOTATIONS[currentOp]?.[currentStep.highlightLine] : undefined;
  const complexity = STACK_COMPLEXITY[currentOp];
  const captionClass = phaseCaption[currentStep?.phase ?? "default"] ?? phaseCaption.default;

  const displayState = currentStep
    ? currentStep.state
    : { elements: arrValues.map((v, i) => ({ value: v, id: `init-${i}` })), top: arrValues.length - 1, maxSize: 8 };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/stack" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-sm font-bold">▤</div>
          <h1 className="text-xl font-bold">Array Stack</h1>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">LIFO · MAX=8</span>
        </div>
        {steps.length > 0 && step === steps.length - 1 && (
          <button type="button" onClick={handleApplyResult} className="ml-auto px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors">
            Apply Result
          </button>
        )}
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-4">
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Visualization</span>
            <span className="text-xs text-gray-500">LIFO — Last In, First Out</span>
          </div>
          <div className="relative overflow-auto">
            <ArrayStackVisualizer state={displayState} highlightIndices={currentStep?.highlightIndices ?? []} phase={currentStep?.phase} />
            {steps.length > 0 && currentStep && (
              <div className="px-4 pb-4 space-y-2">
                <div className={`border rounded-lg px-4 py-2.5 flex items-center gap-3 transition-all duration-300 ${captionClass}`}>
                  <span className="text-base shrink-0">▶</span>
                  <span className="text-sm leading-relaxed">{currentStep.explanation}</span>
                  <span className="ml-auto text-xs opacity-50 shrink-0">step {step + 1}/{steps.length}</span>
                </div>
                <AIExplainer
                  algorithm="Array Stack"
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
            <CodePanel lines={codeLines} highlightLine={currentStep?.highlightLine ?? 0} annotation={annotation} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <StackControls stackType="array" onTypeChange={() => {}} onRun={handleRun} hideTypeSelector />
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
