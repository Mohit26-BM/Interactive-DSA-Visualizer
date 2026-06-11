"use client";

import { useState } from "react";
import Link from "next/link";
import TreeVisualizer from "@/components/tree/TreeVisualizer";
import TreeControls from "@/components/tree/TreeControls";
import Controls from "@/components/shared/Controls";
import CodePanel from "@/components/shared/CodePanel";
import { usePlayer } from "@/components/shared/usePlayer";
import AIExplainer from "@/components/shared/AIExplainer";
import {
  bstInsert, bstSearch, bstDelete,
  bstInorder, bstPreorder, bstPostorder, bstLevelOrder,
  bstFindMin, bstFindMax,
  buildBST,
  BST_CODE, BST_ANNOTATIONS, BST_COMPLEXITY,
  TreeStep,
} from "@/lib/tree-engine";

const DEFAULT = [50, 30, 70, 20, 40, 60, 80];

const phaseCaption: Record<string, string> = {
  insert: "bg-green-500/15 border-green-500/30 text-green-200",
  found:  "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
  delete: "bg-red-500/15 border-red-500/30 text-red-200",
  error:  "bg-red-500/15 border-red-500/30 text-red-200",
  default:"bg-indigo-500/15 border-indigo-500/30 text-indigo-200",
};

export default function BSTPage() {
  const [values, setValues] = useState(DEFAULT);
  const [steps, setSteps] = useState<TreeStep[]>([]);
  const [currentOp, setCurrentOp] = useState("insert");
  const [customInput, setCustomInput] = useState(DEFAULT.join(", "));
  const [inputError, setInputError] = useState("");

  const { step, playing, speed, play, pause, stepForward, stepBackward, reset, setSpeed } = usePlayer(steps.length);
  const currentStep = steps[step];

  const handleRun = (op: string, params: Record<string, number>) => {
    setCurrentOp(op);
    let result: TreeStep[] = [];
    if (op === "insert")     result = bstInsert(values, params.value);
    else if (op === "search")     result = bstSearch(values, params.value);
    else if (op === "delete")     result = bstDelete(values, params.value);
    else if (op === "inorder")    result = bstInorder(values);
    else if (op === "preorder")   result = bstPreorder(values);
    else if (op === "postorder")  result = bstPostorder(values);
    else if (op === "levelOrder") result = bstLevelOrder(values);
    else if (op === "findMin")    result = bstFindMin(values);
    else if (op === "findMax")    result = bstFindMax(values);
    setSteps(result);
  };

  const handleApplyResult = () => {
    if (!currentStep) return;
    const newVals = currentStep.state.nodes.map((n) => n.value);
    setValues(newVals);
    setSteps([]);
  };

  const handleCustomInput = () => {
    const nums = [...new Set(customInput.split(",").map((s) => parseInt(s.trim())).filter((n) => !isNaN(n)))];
    if (nums.length === 0) { setInputError("Enter comma-separated numbers."); return; }
    if (nums.length > 15) { setInputError("Max 15 nodes for readability."); return; }
    setInputError("");
    setValues(nums);
    setSteps([]);
  };

  const complexity = BST_COMPLEXITY[currentOp];
  const annotation = currentStep ? BST_ANNOTATIONS[currentOp]?.[currentStep.highlightLine] : undefined;
  const captionClass = phaseCaption[currentStep?.phase ?? "default"] ?? phaseCaption.default;
  const displayState = currentStep ? currentStep.state : buildBST(values);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/tree" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center text-sm font-bold">⌥</div>
          <h1 className="text-xl font-bold">Binary Search Tree</h1>
        </div>
        {steps.length > 0 && step === steps.length - 1 && (
          <button type="button" onClick={handleApplyResult} className="ml-auto px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors">
            Apply Result
          </button>
        )}
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-4">
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-60">
            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">Tree Values (inserted left→right)</label>
            <input type="text" value={customInput} onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. 50, 30, 70, 20, 40"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500" />
            {inputError && <p className="text-xs text-red-400 mt-1">{inputError}</p>}
          </div>
          <button type="button" onClick={handleCustomInput} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors">
            Build Tree
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Visualization</span>
            <span className="text-xs text-gray-500">{displayState.nodes.length} nodes · BST property: left &lt; root &lt; right</span>
          </div>
          <div className="relative overflow-auto">
            <TreeVisualizer
              state={displayState}
              highlightNodes={currentStep?.highlightNodes ?? []}
              phase={currentStep?.phase}
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
                  algorithm="Binary Search Tree"
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
            <CodePanel lines={BST_CODE[currentOp] ?? []} highlightLine={currentStep?.highlightLine ?? 0} annotation={annotation} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <TreeControls onRun={handleRun} />
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
