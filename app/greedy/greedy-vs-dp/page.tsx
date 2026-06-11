"use client";

import { useState } from "react";
import Link from "next/link";
import Controls from "@/components/shared/Controls";
import CodePanel from "@/components/shared/CodePanel";
import AIExplainer from "@/components/shared/AIExplainer";
import { usePlayer } from "@/components/shared/usePlayer";
import {
  greedyVsDP, GREEDY_CODE, GREEDY_ANNOTATIONS, GREEDY_COMPLEXITY, type GreedyVsDPStep,
} from "@/lib/greedy-engine";

const GV_INF = 99999;

const phaseCaption: Record<string, string> = {
  found:   "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
  error:   "bg-red-500/15 border-red-500/30 text-red-200",
  insert:  "bg-amber-500/15 border-amber-500/30 text-amber-200",
  default: "bg-amber-500/15 border-amber-500/30 text-amber-200",
};

export default function GreedyVsDPPage() {
  const [coinsInput, setCoinsInput] = useState("1, 3, 4");
  const [targetInput, setTargetInput] = useState("6");
  const [steps, setSteps] = useState<GreedyVsDPStep[]>([]);
  const [error, setError] = useState("");

  const { step, playing, speed, play, pause, stepForward, stepBackward, reset, setSpeed } = usePlayer(steps.length);
  const currentStep = steps[step] as GreedyVsDPStep | undefined;

  const handleRun = () => {
    const coins = coinsInput.split(/[,\s]+/).map(Number).filter(n => n > 0 && Number.isInteger(n));
    const target = Math.max(1, Math.min(20, parseInt(targetInput) || 6));
    if (coins.length === 0) { setError("Enter at least one coin."); return; }
    setError("");
    setSteps(greedyVsDP([...new Set(coins)].sort((a, b) => b - a), target));
  };

  const complexity = GREEDY_COMPLEXITY.greedyVsDP;
  const annotation = currentStep ? GREEDY_ANNOTATIONS.greedyVsDP[currentStep.highlightLine] : undefined;
  const captionClass = phaseCaption[currentStep?.phase ?? "default"] ?? phaseCaption.default;

  const subPhase = currentStep?.subPhase ?? "greedy";
  const coins = currentStep?.coins ?? [4, 3, 1];
  const target = currentStep?.target ?? 6;
  const greedyPicked = currentStep?.greedyPicked ?? [];
  const greedyRemaining = currentStep?.greedyRemaining ?? target;
  const dpTable = currentStep?.dpTable ?? [];
  const greedyCurrent = currentStep?.greedyCurrent;

  const lastStep = steps[steps.length - 1] as GreedyVsDPStep | undefined;
  const finalGreedy = lastStep?.greedyPicked ?? [];
  const finalDP = lastStep?.dpTable?.[lastStep?.target ?? 0] ?? -1;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/greedy" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-700 rounded-lg flex items-center justify-center text-sm font-bold">⚡</div>
          <h1 className="text-xl font-bold">Greedy vs DP</h1>
          <span className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">coin change · when greedy fails</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-4">

        {/* Input */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">Coins</label>
            <input type="text" value={coinsInput} onChange={e => setCoinsInput(e.target.value)}
              className="w-40 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">Target (1–20)</label>
            <input type="number" min={1} max={20} value={targetInput} onChange={e => setTargetInput(e.target.value)}
              className="w-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500" />
          </div>
          <button onClick={handleRun} className="px-5 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-lg text-sm font-medium">Compare</button>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        {/* Side-by-side visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Greedy */}
          <div className={`bg-gray-900 border rounded-xl overflow-hidden transition-all duration-300 ${subPhase === "greedy" ? "border-amber-600/50 shadow-lg shadow-amber-900/20" : "border-gray-700"}`}>
            <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
              <span className="text-sm font-medium text-amber-300">Greedy — Largest Coin First</span>
              {steps.length > 0 && <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${greedyRemaining === 0 ? "bg-emerald-900/40 border-emerald-700/50 text-emerald-300" : subPhase !== "greedy" ? "bg-red-900/30 border-red-700/30 text-red-400" : "bg-amber-900/30 border-amber-700/30 text-amber-300"}`}>{greedyRemaining === 0 ? `${greedyPicked.length} coins` : "..."}</span>}
            </div>
            <div className="p-4 space-y-3">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">Coins picked</div>
              <div className="flex gap-2 flex-wrap min-h-[40px]">
                {greedyPicked.map((c, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-amber-800/60 border border-amber-600/50 flex items-center justify-center text-sm font-bold font-mono text-amber-200">{c}</div>
                ))}
                {greedyCurrent && subPhase === "greedy" && (
                  <div className="w-10 h-10 rounded-full bg-amber-900/80 border-2 border-amber-400 flex items-center justify-center text-sm font-bold font-mono text-amber-300 animate-pulse">{greedyCurrent}</div>
                )}
                {greedyPicked.length === 0 && !greedyCurrent && <span className="text-gray-700 text-sm italic">none yet</span>}
              </div>
              <div className="flex gap-3 text-xs">
                <span className="text-gray-500">Remaining:</span>
                <span className="font-mono text-amber-300">{greedyRemaining}</span>
              </div>
            </div>
          </div>

          {/* DP */}
          <div className={`bg-gray-900 border rounded-xl overflow-hidden transition-all duration-300 ${subPhase === "dp" ? "border-indigo-600/50 shadow-lg shadow-indigo-900/20" : "border-gray-700"}`}>
            <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
              <span className="text-sm font-medium text-indigo-300">DP — Optimal Tabulation</span>
              {steps.length > 0 && dpTable.length > 0 && <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${dpTable[target] < GV_INF ? "bg-emerald-900/40 border-emerald-700/50 text-emerald-300" : "bg-gray-800 border-gray-700 text-gray-500"}`}>{dpTable[target] < GV_INF ? `${dpTable[target]} coins` : "..."}</span>}
            </div>
            <div className="p-4 space-y-3">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">DP table dp[0..{target}]</div>
              <div className="flex gap-1 flex-wrap">
                {dpTable.slice(0, target + 1).map((v, i) => {
                  const isHl = currentStep?.dpI === i && subPhase === "dp";
                  return (
                    <div key={i} className={`flex flex-col items-center border rounded-lg min-w-[32px] transition-all duration-200 ${isHl ? "bg-indigo-900/60 border-indigo-500/60 ring-1 ring-indigo-400/50" : v >= GV_INF ? "bg-gray-800/50 border-gray-700/50" : "bg-indigo-900/30 border-indigo-800/40"}`}>
                      <span className="text-[9px] text-gray-600 pt-1 font-mono">{i}</span>
                      <span className="text-xs font-bold font-mono py-1.5 text-indigo-200">{v >= GV_INF ? "∞" : v}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Compare result */}
        {subPhase === "compare" && lastStep && (
          <div className="bg-gray-900 border border-amber-700/40 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-amber-300">Comparison Result</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Greedy</div>
                <div className="text-lg font-bold text-amber-300 font-mono">{finalGreedy.length} coins</div>
                <div className="text-xs text-gray-500 font-mono">[{finalGreedy.join(", ")}]</div>
              </div>
              <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">DP (optimal)</div>
                <div className="text-lg font-bold text-indigo-300 font-mono">{finalDP >= GV_INF ? "impossible" : finalDP + " coins"}</div>
                <div className="text-xs text-gray-500">global minimum</div>
              </div>
            </div>
            {finalDP < finalGreedy.length && (
              <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-3 text-sm text-red-300">
                Greedy is <strong>suboptimal</strong> here: uses {finalGreedy.length - finalDP} extra coin{finalGreedy.length - finalDP > 1 ? "s" : ""}. Coins [1,3,4] for target 6 — greedy picks 4+1+1 but DP finds 3+3.
              </div>
            )}
          </div>
        )}

        {/* Caption */}
        {steps.length > 0 && currentStep && (
          <div className="space-y-2">
            <div className={`border rounded-lg px-4 py-2.5 flex items-center gap-3 transition-all duration-300 ${captionClass}`}>
              <span className="text-base shrink-0">▶</span>
              <span className="text-sm leading-relaxed">{currentStep.explanation}</span>
              <span className="ml-auto text-xs opacity-50 shrink-0">step {step + 1}/{steps.length}</span>
            </div>
            <AIExplainer algorithm="Greedy vs DP Coin Change" stepExplanation={currentStep.explanation} stepIndex={step} totalSteps={steps.length}
              additionalContext={`Coins: [${coins.join(", ")}]. Target: ${target}.`} />
          </div>
        )}

        {steps.length > 0 && (
          <Controls step={step} total={steps.length} playing={playing} speed={speed}
            onPlay={play} onPause={pause} onStepForward={stepForward} onStepBackward={stepBackward}
            onReset={reset} onSpeedChange={setSpeed} />
        )}

        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800"><span className="text-sm font-medium text-gray-300">Pseudocode</span></div>
          <div className="p-4">
            <CodePanel lines={GREEDY_CODE.greedyVsDP} highlightLine={currentStep?.highlightLine ?? -1} annotation={annotation} />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-2">
          <h3 className="text-sm font-semibold text-gray-300">Key Insight</h3>
          <p className="text-xs text-gray-400 leading-relaxed">{complexity.note}</p>
        </div>
      </div>
    </div>
  );
}
