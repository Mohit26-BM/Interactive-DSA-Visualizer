"use client";

import { useState } from "react";
import Link from "next/link";
import Controls from "@/components/shared/Controls";
import CodePanel from "@/components/shared/CodePanel";
import AIExplainer from "@/components/shared/AIExplainer";
import { usePlayer } from "@/components/shared/usePlayer";
import {
  fractionalKnapsack, DEFAULT_FK_ITEMS, DEFAULT_FK_CAPACITY,
  GREEDY_CODE, GREEDY_ANNOTATIONS, GREEDY_COMPLEXITY, type FKStep,
} from "@/lib/greedy-engine";

const phaseCaption: Record<string, string> = {
  found:   "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
  insert:  "bg-amber-500/15 border-amber-500/30 text-amber-200",
  error:   "bg-red-500/15 border-red-500/30 text-red-200",
  default: "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
};

export default function FractionalKnapsackPage() {
  const [steps, setSteps] = useState<FKStep[]>([]);

  const { step, playing, speed, play, pause, stepForward, stepBackward, reset, setSpeed } = usePlayer(steps.length);
  const currentStep = steps[step] as FKStep | undefined;

  const handleRun = () => setSteps(fractionalKnapsack(DEFAULT_FK_ITEMS, DEFAULT_FK_CAPACITY));

  const complexity = GREEDY_COMPLEXITY.fractionalKnapsack;
  const annotation = currentStep ? GREEDY_ANNOTATIONS.fractionalKnapsack[currentStep.highlightLine] : undefined;
  const captionClass = phaseCaption[currentStep?.phase ?? "default"] ?? phaseCaption.default;

  const items = currentStep?.items ?? DEFAULT_FK_ITEMS.map((it, i) => ({ ...it, id: i, ratio: it.value / it.weight, taken: 0 })).sort((a, b) => b.ratio - a.ratio);
  const capacity = currentStep?.capacity ?? DEFAULT_FK_CAPACITY;
  const remaining = currentStep?.remaining ?? capacity;
  const totalValue = currentStep?.totalValue ?? 0;
  const fillPct = ((capacity - remaining) / capacity) * 100;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/greedy" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-700 rounded-lg flex items-center justify-center text-sm font-bold">⚖</div>
          <h1 className="text-xl font-bold">Fractional Knapsack</h1>
          <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">ratio sort · greedy optimal · O(n log n)</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-4">
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Visualization</span>
            <span className="text-xs text-gray-500">Capacity: {capacity} kg · Items sorted by value/weight ratio</span>
          </div>
          <div className="p-4 space-y-4">
            {/* Items table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left px-3 py-2 text-gray-400">Item</th>
                    <th className="text-right px-3 py-2 text-gray-400">Weight</th>
                    <th className="text-right px-3 py-2 text-gray-400">Value</th>
                    <th className="text-right px-3 py-2 text-emerald-400">Ratio</th>
                    <th className="text-right px-3 py-2 text-gray-400">Taken</th>
                    <th className="px-3 py-2 text-gray-400">Fill</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => {
                    const isCurrent = currentStep?.current === i;
                    const fillW = item.taken / item.weight;
                    return (
                      <tr key={item.id} className={`border-b border-gray-800/50 transition-colors ${isCurrent ? "bg-amber-900/20" : ""}`}>
                        <td className={`px-3 py-2.5 font-medium ${isCurrent ? "text-amber-300" : "text-gray-200"}`}>{item.name}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-xs text-gray-400">{item.weight} kg</td>
                        <td className="px-3 py-2.5 text-right font-mono text-xs text-gray-400">{item.value}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-xs text-emerald-400 font-bold">{item.ratio.toFixed(2)}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-xs text-amber-300">{item.taken > 0 ? `${item.taken.toFixed(1)} kg` : "—"}</td>
                        <td className="px-3 py-2.5">
                          <div className="w-full bg-gray-800 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full transition-all duration-300" style={{ width: `${fillW * 100}%` }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Knapsack fill */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Knapsack capacity</span>
                <span className="font-mono">{(capacity - remaining).toFixed(1)} / {capacity} kg · Value: {totalValue.toFixed(1)}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-700 to-emerald-500 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2" style={{ width: `${Math.min(fillPct, 100)}%` }}>
                  {fillPct > 20 && <span className="text-[10px] font-bold text-white">{fillPct.toFixed(0)}%</span>}
                </div>
              </div>
            </div>

            {steps.length > 0 && currentStep && (
              <div className="space-y-2">
                <div className={`border rounded-lg px-4 py-2.5 flex items-center gap-3 transition-all duration-300 ${captionClass}`}>
                  <span className="text-base shrink-0">▶</span>
                  <span className="text-sm leading-relaxed">{currentStep.explanation}</span>
                  <span className="ml-auto text-xs opacity-50 shrink-0">step {step + 1}/{steps.length}</span>
                </div>
                <AIExplainer algorithm="Fractional Knapsack" stepExplanation={currentStep.explanation} stepIndex={step} totalSteps={steps.length} />
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
          <div className="px-4 py-3 border-b border-gray-800"><span className="text-sm font-medium text-gray-300">Pseudocode</span></div>
          <div className="p-4">
            <CodePanel lines={GREEDY_CODE.fractionalKnapsack} highlightLine={currentStep?.highlightLine ?? -1} annotation={annotation} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Run Algorithm</h3>
            <button onClick={handleRun} className="w-full px-4 py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium">Run Fractional Knapsack</button>
            <p className="text-xs text-gray-500">Items: Gold(10kg,60), Silver(20kg,100), Bronze(30kg,120). Capacity: 50 kg.</p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Complexity</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded-lg p-3"><div className="text-xs text-gray-500 mb-1">Time</div><div className="text-lg font-bold text-emerald-400">{complexity.time}</div></div>
              <div className="bg-gray-800 rounded-lg p-3"><div className="text-xs text-gray-500 mb-1">Space</div><div className="text-lg font-bold text-purple-400">{complexity.space}</div></div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{complexity.note}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
