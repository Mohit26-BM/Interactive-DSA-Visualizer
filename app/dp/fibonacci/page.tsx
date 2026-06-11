"use client";

import { useState } from "react";
import Link from "next/link";
import { FibonacciVisualizer } from "@/components/dp/DPVisualizer";
import Controls from "@/components/shared/Controls";
import CodePanel from "@/components/shared/CodePanel";
import AIExplainer from "@/components/shared/AIExplainer";
import { usePlayer } from "@/components/shared/usePlayer";
import { fibonacciDP, DP_CODE, DP_ANNOTATIONS, DP_COMPLEXITY, type FibStep } from "@/lib/dp-engine";

const phaseCaption: Record<string, string> = {
  insert:  "bg-indigo-500/15 border-indigo-500/30 text-indigo-200",
  found:   "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
  error:   "bg-red-500/15 border-red-500/30 text-red-200",
  default: "bg-pink-500/15 border-pink-500/30 text-pink-200",
};

export default function FibonacciPage() {
  const [n, setN] = useState(10);
  const [inputN, setInputN] = useState("10");
  const [steps, setSteps] = useState<FibStep[]>([]);

  const { step, playing, speed, play, pause, stepForward, stepBackward, reset, setSpeed } = usePlayer(steps.length);
  const currentStep = steps[step] as FibStep | undefined;

  const handleRun = () => {
    const num = Math.max(2, Math.min(15, parseInt(inputN) || 10));
    setN(num);
    setInputN(String(num));
    setSteps(fibonacciDP(num));
  };

  const codeLines = DP_CODE.fibonacci;
  const complexity = DP_COMPLEXITY.fibonacci;
  const annotation = currentStep ? DP_ANNOTATIONS.fibonacci[currentStep.highlightLine] : undefined;
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
          <div className="w-8 h-8 bg-pink-700 rounded-lg flex items-center justify-center text-sm font-bold">ƒ</div>
          <h1 className="text-xl font-bold">Fibonacci DP</h1>
          <span className="text-xs bg-pink-500/10 border border-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full">
            1-D tabulation · f(n-1)+f(n-2)
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-4">

        {/* Visualization card */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Visualization</span>
            <span className="text-xs text-gray-500">table[0..{n}] — {n + 1} cells</span>
          </div>
          <div className="relative overflow-auto">
            <FibonacciVisualizer step={currentStep} />
            {steps.length > 0 && currentStep && (
              <div className="px-4 pb-4 space-y-2">
                <div className={`border rounded-lg px-4 py-2.5 flex items-center gap-3 transition-all duration-300 ${captionClass}`}>
                  <span className="text-base shrink-0">▶</span>
                  <span className="text-sm leading-relaxed">{currentStep.explanation}</span>
                  <span className="ml-auto text-xs opacity-50 shrink-0">step {step + 1}/{steps.length}</span>
                </div>
                <AIExplainer
                  algorithm="Fibonacci DP"
                  stepExplanation={currentStep.explanation}
                  stepIndex={step}
                  totalSteps={steps.length}
                  additionalContext={`Computing fib(${n}) using bottom-up tabulation.`}
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
            <h3 className="text-sm font-semibold text-gray-300">Input</h3>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-400">n =</label>
              <input
                type="number" min={2} max={15}
                value={inputN}
                onChange={(e) => setInputN(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRun()}
                className="w-24 bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-pink-500"
              />
              <span className="text-xs text-gray-600">(2 – 15)</span>
            </div>
            <button
              type="button" onClick={handleRun}
              className="w-full px-4 py-2 bg-pink-700 hover:bg-pink-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Compute fib({inputN || n})
            </button>
            {steps.length > 0 && (
              <p className="text-xs text-gray-500">
                fib({n}) = {steps[steps.length - 1]?.table[n] ?? "…"}
              </p>
            )}
          </div>

          {/* Complexity */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Complexity</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Time</div>
                <div className="text-lg font-bold text-pink-400">{complexity.time}</div>
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
