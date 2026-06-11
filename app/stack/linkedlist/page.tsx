"use client";

import { useState } from "react";
import Link from "next/link";
import { LLStackVisualizer } from "@/components/stack/StackVisualizer";
import StackControls from "@/components/stack/StackControls";
import Controls from "@/components/shared/Controls";
import CodePanel from "@/components/shared/CodePanel";
import { usePlayer } from "@/components/shared/usePlayer";
import AIExplainer from "@/components/shared/AIExplainer";
import {
  stackLLPush, stackLLPop, stackLLPeek, stackLLIsEmpty, stackLLClear,
  STACK_LL_CODE, STACK_LL_ANNOTATIONS, STACK_COMPLEXITY,
  StackLLStep,
} from "@/lib/stack-engine";

const DEFAULT = [10, 25, 7, 42, 3];

const phaseCaption: Record<string, string> = {
  insert: "bg-green-500/15 border-green-500/30 text-green-200",
  found:  "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
  delete: "bg-red-500/15 border-red-500/30 text-red-200",
  error:  "bg-red-500/15 border-red-500/30 text-red-200",
  default:"bg-indigo-500/15 border-indigo-500/30 text-indigo-200",
};

export default function LLStackPage() {
  const [llValues, setLLValues] = useState(DEFAULT);
  const [steps, setSteps] = useState<StackLLStep[]>([]);
  const [currentOp, setCurrentOp] = useState("push");

  const { step, playing, speed, play, pause, stepForward, stepBackward, reset, setSpeed } = usePlayer(steps.length);
  const currentStep = steps[step] as StackLLStep | undefined;

  const handleRun = (op: string, params: Record<string, number>) => {
    setCurrentOp(op);
    let result: StackLLStep[] = [];
    if (op === "push")    result = stackLLPush(llValues, params.value);
    else if (op === "pop")     result = stackLLPop(llValues);
    else if (op === "peek")    result = stackLLPeek(llValues);
    else if (op === "isEmpty") result = stackLLIsEmpty(llValues);
    else if (op === "clear")   result = stackLLClear(llValues);
    setSteps(result);
  };

  const handleApplyResult = () => {
    if (!currentStep) return;
    const ordered: number[] = [];
    let cur = currentStep.state.top;
    const visited = new Set<string>();
    while (cur && !visited.has(cur)) {
      const n = currentStep.state.nodes.find((n) => n.id === cur);
      if (!n) break;
      ordered.push(n.value);
      visited.add(cur);
      cur = n.next;
    }
    setLLValues(ordered);
    setSteps([]);
  };

  const codeLines = STACK_LL_CODE[currentOp] ?? [];
  const annotation = currentStep ? STACK_LL_ANNOTATIONS[currentOp]?.[currentStep.highlightLine] : undefined;
  const complexity = STACK_COMPLEXITY[currentOp];
  const captionClass = phaseCaption[currentStep?.phase ?? "default"] ?? phaseCaption.default;

  const displayState = currentStep
    ? currentStep.state
    : {
        nodes: llValues.map((v, i) => ({ id: `init-${i}`, value: v, next: i < llValues.length - 1 ? `init-${i + 1}` : null })),
        top: llValues.length > 0 ? "init-0" : null,
      };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/stack" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center text-sm font-bold">⇡</div>
          <h1 className="text-xl font-bold">Linked List Stack</h1>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">LIFO · unbounded</span>
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
            <LLStackVisualizer state={displayState} highlightNodes={currentStep?.highlightNodes ?? []} phase={currentStep?.phase} />
            {steps.length > 0 && currentStep && (
              <div className="px-4 pb-4 space-y-2">
                <div className={`border rounded-lg px-4 py-2.5 flex items-center gap-3 transition-all duration-300 ${captionClass}`}>
                  <span className="text-base shrink-0">▶</span>
                  <span className="text-sm leading-relaxed">{currentStep.explanation}</span>
                  <span className="ml-auto text-xs opacity-50 shrink-0">step {step + 1}/{steps.length}</span>
                </div>
                <AIExplainer
                  algorithm="Linked List Stack"
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
          <StackControls stackType="linkedlist" onTypeChange={() => {}} onRun={handleRun} hideTypeSelector />
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
