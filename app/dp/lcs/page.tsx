"use client";

import { useState } from "react";
import Link from "next/link";
import { LCSVisualizer } from "@/components/dp/DPVisualizer";
import Controls from "@/components/shared/Controls";
import CodePanel from "@/components/shared/CodePanel";
import AIExplainer from "@/components/shared/AIExplainer";
import { usePlayer } from "@/components/shared/usePlayer";
import { lcsDP, DP_CODE, DP_ANNOTATIONS, DP_COMPLEXITY, type LCSStep } from "@/lib/dp-engine";

const phaseCaption: Record<string, string> = {
  found:   "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
  error:   "bg-red-500/15 border-red-500/30 text-red-200",
  default: "bg-fuchsia-500/15 border-fuchsia-500/30 text-fuchsia-200",
};

export default function LCSPage() {
  const [s1, setS1] = useState("ABCBDAB");
  const [s2, setS2] = useState("BDCAB");
  const [steps, setSteps] = useState<LCSStep[]>([]);
  const [error, setError] = useState("");

  const { step, playing, speed, play, pause, stepForward, stepBackward, reset, setSpeed } = usePlayer(steps.length);
  const currentStep = steps[step] as LCSStep | undefined;

  const handleRun = () => {
    const a = s1.trim().toUpperCase().slice(0, 9);
    const b = s2.trim().toUpperCase().slice(0, 9);
    if (!a || !b) { setError("Both strings must be non-empty."); return; }
    setError("");
    setS1(a); setS2(b);
    setSteps(lcsDP(a, b));
  };

  const codeLines = DP_CODE.lcs;
  const complexity = DP_COMPLEXITY.lcs;
  const annotation = currentStep ? DP_ANNOTATIONS.lcs[currentStep.highlightLine] : undefined;
  const captionClass = phaseCaption[currentStep?.phase ?? "default"] ?? phaseCaption.default;
  const lastStep = steps[steps.length - 1] as LCSStep | undefined;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/dp" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-fuchsia-700 rounded-lg flex items-center justify-center text-sm font-bold">⊂</div>
          <h1 className="text-xl font-bold">Longest Common Subsequence</h1>
          <span className="text-xs bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-300 px-2 py-0.5 rounded-full">
            2-D grid · match or max(↑,←)
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-4">

        {/* Visualization card */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Visualization</span>
            <span className="text-xs text-gray-500 font-mono">
              {steps.length > 0 ? `"${s1}" vs "${s2}"` : "enter two strings"}
            </span>
          </div>
          <div className="relative overflow-auto">
            <LCSVisualizer step={currentStep} />
            {steps.length > 0 && currentStep && (
              <div className="px-4 pb-4 space-y-2">
                <div className={`border rounded-lg px-4 py-2.5 flex items-center gap-3 transition-all duration-300 ${captionClass}`}>
                  <span className="text-base shrink-0">▶</span>
                  <span className="text-sm leading-relaxed">{currentStep.explanation}</span>
                  <span className="ml-auto text-xs opacity-50 shrink-0">step {step + 1}/{steps.length}</span>
                </div>
                <AIExplainer
                  algorithm="Longest Common Subsequence"
                  stepExplanation={currentStep.explanation}
                  stepIndex={step}
                  totalSteps={steps.length}
                  additionalContext={`Comparing s1="${s1}" and s2="${s2}".`}
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
            <h3 className="text-sm font-semibold text-gray-300">Strings</h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">String 1 (max 9 chars)</label>
                <input
                  type="text" maxLength={9}
                  value={s1}
                  onChange={(e) => setS1(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleRun()}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-fuchsia-500 uppercase"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">String 2 (max 9 chars)</label>
                <input
                  type="text" maxLength={9}
                  value={s2}
                  onChange={(e) => setS2(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleRun()}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-fuchsia-500 uppercase"
                />
              </div>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button type="button" onClick={handleRun}
              className="w-full px-4 py-2 bg-fuchsia-700 hover:bg-fuchsia-600 text-white rounded-lg text-sm font-medium transition-colors">
              Find LCS
            </button>
            {lastStep?.traceback && (
              <p className="text-xs text-emerald-400 font-mono">
                LCS = &quot;{lastStep.traceback}&quot; (length {lastStep.traceback.length})
              </p>
            )}
          </div>

          {/* Complexity */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Complexity</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Time</div>
                <div className="text-lg font-bold text-fuchsia-400">{complexity.time}</div>
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
