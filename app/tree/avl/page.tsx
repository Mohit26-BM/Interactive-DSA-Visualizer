"use client";

import { useState } from "react";
import Link from "next/link";
import AVLVisualizer from "@/components/avl/AVLVisualizer";
import AVLControls from "@/components/avl/AVLControls";
import Controls from "@/components/shared/Controls";
import CodePanel from "@/components/shared/CodePanel";
import { usePlayer } from "@/components/shared/usePlayer";
import AIExplainer from "@/components/shared/AIExplainer";
import {
  avlInsert, avlSearch, avlDelete,
  buildAVL,
  AVL_CODE, AVL_ANNOTATIONS, AVL_COMPLEXITY,
  AVLStep,
} from "@/lib/avl-engine";

const DEFAULT_VALUES = [30, 20, 40, 10, 25, 35, 50];

const phaseCaption: Record<string, string> = {
  insert:  "bg-green-500/15 border-green-500/30 text-green-200",
  found:   "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
  delete:  "bg-red-500/15 border-red-500/30 text-red-200",
  error:   "bg-red-500/15 border-red-500/30 text-red-200",
  default: "bg-indigo-500/15 border-indigo-500/30 text-indigo-200",
};

export default function AVLPage() {
  const [values, setValues] = useState(DEFAULT_VALUES);
  const [steps, setSteps] = useState<AVLStep[]>([]);
  const [currentOp, setCurrentOp] = useState("insert");

  const { step, playing, speed, play, pause, stepForward, stepBackward, reset, setSpeed } = usePlayer(steps.length);
  const currentStep = steps[step] as AVLStep | undefined;

  const handleRun = (op: string, params: Record<string, number>) => {
    setCurrentOp(op);
    let result: AVLStep[] = [];
    if (op === "insert")    result = avlInsert(values, params.value);
    else if (op === "search") result = avlSearch(values, params.value);
    else if (op === "delete") result = avlDelete(values, params.value);
    setSteps(result);
  };

  const handleApplyResult = () => {
    if (!currentStep) return;
    // Extract values via inorder traversal of final state
    const finalState = currentStep.state;
    const inorder: number[] = [];
    function traverse(id: string | null) {
      if (!id) return;
      const node = finalState.nodes.find((n) => n.id === id);
      if (!node) return;
      traverse(node.left);
      inorder.push(node.value);
      traverse(node.right);
    }
    traverse(finalState.root);
    setValues(inorder);
    setSteps([]);
  };

  const complexity = AVL_COMPLEXITY[currentOp];
  const annotation = currentStep ? AVL_ANNOTATIONS[currentOp]?.[currentStep.highlightLine] : undefined;
  const captionClass = phaseCaption[currentStep?.phase ?? "default"] ?? phaseCaption.default;
  const displayState = currentStep ? currentStep.state : buildAVL(values);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/tree" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-700 rounded-lg flex items-center justify-center text-sm font-bold">↕</div>
          <h1 className="text-xl font-bold">AVL Tree</h1>
          <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
            self-balancing · O(log n) guaranteed
          </span>
        </div>
        {steps.length > 0 && step === steps.length - 1 && (
          <button type="button" onClick={handleApplyResult} className="ml-auto px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors">
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
              {displayState.nodes.length} nodes · BF = balance factor (left_h − right_h)
            </span>
          </div>
          <div className="relative overflow-auto">
            <AVLVisualizer
              state={displayState}
              highlightNodes={currentStep?.highlightNodes ?? []}
              phase={currentStep?.phase}
              rotationType={currentStep?.rotationType}
              traversalOrder={currentStep?.traversalOrder}
            />
            {steps.length > 0 && currentStep && (
              <div className="px-4 pb-4 space-y-2">
                <div className={`border rounded-lg px-4 py-2.5 flex items-center gap-3 transition-all duration-300 ${captionClass}`}>
                  <span className="text-base shrink-0">▶</span>
                  <span className="text-sm leading-relaxed">{currentStep.explanation}</span>
                  <span className="ml-auto text-xs opacity-50 shrink-0">step {step + 1}/{steps.length}</span>
                </div>
                <AIExplainer
                  algorithm="AVL Tree"
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
            <CodePanel lines={AVL_CODE[currentOp] ?? []} highlightLine={currentStep?.highlightLine ?? 0} annotation={annotation} />
          </div>
        </div>

        {/* Controls + Complexity */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <AVLControls onRun={handleRun} />
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Complexity Analysis</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Time</div>
                <div className="text-lg font-bold text-emerald-400">{complexity?.time}</div>
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
