"use client";

import { useState } from "react";
import Link from "next/link";
import { KnapsackVisualizer } from "@/components/dp/DPVisualizer";
import Controls from "@/components/shared/Controls";
import CodePanel from "@/components/shared/CodePanel";
import AIExplainer from "@/components/shared/AIExplainer";
import { usePlayer } from "@/components/shared/usePlayer";
import { knapsackDP, DP_CODE, DP_ANNOTATIONS, DP_COMPLEXITY, type KnapsackItem, type KnapsackStep } from "@/lib/dp-engine";

const phaseCaption: Record<string, string> = {
  insert:  "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
  found:   "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
  error:   "bg-red-500/15 border-red-500/30 text-red-200",
  default: "bg-rose-500/15 border-rose-500/30 text-rose-200",
};

const DEFAULT_ITEMS: KnapsackItem[] = [
  { weight: 2, value: 3 },
  { weight: 3, value: 4 },
  { weight: 4, value: 5 },
  { weight: 5, value: 6 },
];

export default function KnapsackPage() {
  const [items, setItems] = useState<KnapsackItem[]>(DEFAULT_ITEMS);
  const [capacity, setCapacity] = useState(8);
  const [capInput, setCapInput] = useState("8");
  const [steps, setSteps] = useState<KnapsackStep[]>([]);

  const { step, playing, speed, play, pause, stepForward, stepBackward, reset, setSpeed } = usePlayer(steps.length);
  const currentStep = steps[step] as KnapsackStep | undefined;

  const handleRun = () => {
    const cap = Math.max(1, Math.min(12, parseInt(capInput) || 8));
    setCapacity(cap);
    setCapInput(String(cap));
    setSteps(knapsackDP(items, cap));
  };

  const updateItem = (i: number, field: keyof KnapsackItem, val: string) => {
    const num = Math.max(1, Math.min(10, parseInt(val) || 1));
    setItems((prev) => prev.map((it, idx) => idx === i ? { ...it, [field]: num } : it));
  };

  const addItem = () => {
    if (items.length < 6) setItems((prev) => [...prev, { weight: 2, value: 3 }]);
  };

  const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const codeLines = DP_CODE.knapsack;
  const complexity = DP_COMPLEXITY.knapsack;
  const annotation = currentStep ? DP_ANNOTATIONS.knapsack[currentStep.highlightLine] : undefined;
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
          <div className="w-8 h-8 bg-rose-700 rounded-lg flex items-center justify-center text-sm font-bold">⊞</div>
          <h1 className="text-xl font-bold">0/1 Knapsack</h1>
          <span className="text-xs bg-rose-500/10 border border-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full">
            2-D DP table · take or skip
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-4">

        {/* Visualization card */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Visualization</span>
            <span className="text-xs text-gray-500">{items.length} items · capacity {capacity}</span>
          </div>
          <div className="relative overflow-auto">
            <KnapsackVisualizer step={currentStep} />
            {steps.length > 0 && currentStep && (
              <div className="px-4 pb-4 space-y-2">
                <div className={`border rounded-lg px-4 py-2.5 flex items-center gap-3 transition-all duration-300 ${captionClass}`}>
                  <span className="text-base shrink-0">▶</span>
                  <span className="text-sm leading-relaxed">{currentStep.explanation}</span>
                  <span className="ml-auto text-xs opacity-50 shrink-0">step {step + 1}/{steps.length}</span>
                </div>
                <AIExplainer
                  algorithm="0/1 Knapsack DP"
                  stepExplanation={currentStep.explanation}
                  stepIndex={step}
                  totalSteps={steps.length}
                  additionalContext={`Items: ${items.map((it, i) => `#${i+1}(w=${it.weight},v=${it.value})`).join(", ")}. Capacity: ${capacity}.`}
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
            <h3 className="text-sm font-semibold text-gray-300">Items &amp; Capacity</h3>

            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-[11px] text-gray-500 font-mono px-1">
                <span>weight (1-10)</span><span>value (1-10)</span><span></span>
              </div>
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                  <input
                    type="number" min={1} max={10} value={item.weight}
                    onChange={(e) => updateItem(i, "weight", e.target.value)}
                    className="bg-gray-800 border border-gray-600 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                  <input
                    type="number" min={1} max={10} value={item.value}
                    onChange={(e) => updateItem(i, "value", e.target.value)}
                    className="bg-gray-800 border border-gray-600 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                  <button type="button" onClick={() => removeItem(i)}
                    className="text-gray-600 hover:text-red-400 transition-colors text-lg leading-none">×</button>
                </div>
              ))}
              {items.length < 6 && (
                <button type="button" onClick={addItem}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors border border-dashed border-gray-700 hover:border-gray-500 rounded-lg px-3 py-1.5 w-full">
                  + Add item
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 pt-1">
              <label className="text-sm text-gray-400">Capacity:</label>
              <input
                type="number" min={1} max={12}
                value={capInput}
                onChange={(e) => setCapInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRun()}
                className="w-20 bg-gray-800 border border-gray-600 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-rose-500"
              />
              <span className="text-xs text-gray-600">(1 – 12)</span>
            </div>

            <button type="button" onClick={handleRun}
              className="w-full px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-lg text-sm font-medium transition-colors">
              Run Knapsack
            </button>
            {steps.length > 0 && (
              <p className="text-xs text-gray-500">
                Max value = {steps[steps.length - 1]?.table[items.length]?.[capacity] ?? "…"}
              </p>
            )}
          </div>

          {/* Complexity */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Complexity</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Time</div>
                <div className="text-lg font-bold text-rose-400">{complexity.time}</div>
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
