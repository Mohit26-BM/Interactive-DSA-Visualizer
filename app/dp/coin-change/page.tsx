"use client";

import { useState } from "react";
import Link from "next/link";
import { CoinChangeVisualizer } from "@/components/dp/DPVisualizer";
import Controls from "@/components/shared/Controls";
import CodePanel from "@/components/shared/CodePanel";
import AIExplainer from "@/components/shared/AIExplainer";
import { usePlayer } from "@/components/shared/usePlayer";
import { coinChangeDP, DP_CODE, DP_ANNOTATIONS, DP_COMPLEXITY, type CoinStep } from "@/lib/dp-engine";

const phaseCaption: Record<string, string> = {
  insert:  "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
  found:   "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
  error:   "bg-red-500/15 border-red-500/30 text-red-200",
  default: "bg-orange-500/15 border-orange-500/30 text-orange-200",
};

export default function CoinChangePage() {
  const [coinsInput, setCoinsInput] = useState("1, 3, 4");
  const [targetInput, setTargetInput] = useState("6");
  const [steps, setSteps] = useState<CoinStep[]>([]);
  const [error, setError] = useState("");

  const { step, playing, speed, play, pause, stepForward, stepBackward, reset, setSpeed } = usePlayer(steps.length);
  const currentStep = steps[step] as CoinStep | undefined;

  const handleRun = () => {
    const coins = coinsInput
      .split(/[,\s]+/)
      .map(Number)
      .filter((n) => n > 0 && Number.isInteger(n))
      .slice(0, 6);
    if (coins.length === 0) { setError("Enter at least one positive coin."); return; }
    const target = Math.max(1, Math.min(20, parseInt(targetInput) || 6));
    setError("");
    setTargetInput(String(target));
    setSteps(coinChangeDP([...new Set(coins)].sort((a, b) => a - b), target));
  };

  const codeLines = DP_CODE["coin-change"];
  const complexity = DP_COMPLEXITY["coin-change"];
  const annotation = currentStep ? DP_ANNOTATIONS["coin-change"][currentStep.highlightLine] : undefined;
  const captionClass = phaseCaption[currentStep?.phase ?? "default"] ?? phaseCaption.default;
  const lastStep = steps[steps.length - 1] as CoinStep | undefined;
  const result = lastStep ? (lastStep.table[parseInt(targetInput)] as number) >= 99999 ? -1 : lastStep.table[parseInt(targetInput)] : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/dp" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-700 rounded-lg flex items-center justify-center text-sm font-bold">¢</div>
          <h1 className="text-xl font-bold">Coin Change</h1>
          <span className="text-xs bg-orange-500/10 border border-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full">
            min coins · 1-D DP table
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-4">

        {/* Visualization card */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Visualization</span>
            <span className="text-xs text-gray-500">dp[0..{targetInput}] — minimum coins to reach each amount</span>
          </div>
          <div className="relative overflow-auto">
            <CoinChangeVisualizer step={currentStep} />
            {steps.length > 0 && currentStep && (
              <div className="px-4 pb-4 space-y-2">
                <div className={`border rounded-lg px-4 py-2.5 flex items-center gap-3 transition-all duration-300 ${captionClass}`}>
                  <span className="text-base shrink-0">▶</span>
                  <span className="text-sm leading-relaxed">{currentStep.explanation}</span>
                  <span className="ml-auto text-xs opacity-50 shrink-0">step {step + 1}/{steps.length}</span>
                </div>
                <AIExplainer
                  algorithm="Coin Change DP"
                  stepExplanation={currentStep.explanation}
                  stepIndex={step}
                  totalSteps={steps.length}
                  additionalContext={`Coins: [${currentStep.coins.join(", ")}]. Target amount: ${currentStep.target}.`}
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
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Coin denominations (comma-separated)</label>
              <input
                type="text"
                value={coinsInput}
                onChange={(e) => setCoinsInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRun()}
                placeholder="e.g. 1, 3, 4"
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-400">Target amount:</label>
              <input
                type="number" min={1} max={20}
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRun()}
                className="w-20 bg-gray-800 border border-gray-600 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-orange-500"
              />
              <span className="text-xs text-gray-600">(1 – 20)</span>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button type="button" onClick={handleRun}
              className="w-full px-4 py-2 bg-orange-700 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors">
              Find Min Coins
            </button>
            {result !== null && (
              <p className="text-xs text-gray-500">
                Min coins for {targetInput} = {result === -1 ? "impossible" : result}
              </p>
            )}
          </div>

          {/* Complexity */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Complexity</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Time</div>
                <div className="text-lg font-bold text-orange-400">{complexity.time}</div>
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
