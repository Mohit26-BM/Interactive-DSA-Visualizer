"use client";

import { useState } from "react";
import Link from "next/link";
import { EditDistanceVisualizer } from "@/components/dp/DPVisualizer";
import Controls from "@/components/shared/Controls";
import CodePanel from "@/components/shared/CodePanel";
import AIExplainer from "@/components/shared/AIExplainer";
import { usePlayer } from "@/components/shared/usePlayer";
import { editDistanceDP, DP_CODE, DP_ANNOTATIONS, DP_COMPLEXITY, type EditStep } from "@/lib/dp-engine";

const phaseCaption: Record<string, string> = {
  insert:  "bg-amber-500/15 border-amber-500/30 text-amber-200",
  found:   "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
  error:   "bg-red-500/15 border-red-500/30 text-red-200",
  default: "bg-violet-500/15 border-violet-500/30 text-violet-200",
};

export default function EditDistancePage() {
  const [s1Input, setS1Input] = useState("HORSE");
  const [s2Input, setS2Input] = useState("ROS");
  const [steps, setSteps] = useState<EditStep[]>([]);
  const [error, setError] = useState("");

  const { step, playing, speed, play, pause, stepForward, stepBackward, reset, setSpeed } = usePlayer(steps.length);
  const currentStep = steps[step] as EditStep | undefined;

  const handleRun = () => {
    const s1 = s1Input.trim().toUpperCase().slice(0, 8);
    const s2 = s2Input.trim().toUpperCase().slice(0, 8);
    if (!s1 || !s2) { setError("Both strings required."); return; }
    setError("");
    setS1Input(s1);
    setS2Input(s2);
    setSteps(editDistanceDP(s1, s2));
  };

  const codeLines = DP_CODE.editDistance;
  const complexity = DP_COMPLEXITY.editDistance;
  const annotation = currentStep ? DP_ANNOTATIONS.editDistance?.[currentStep.highlightLine] : undefined;
  const captionClass = phaseCaption[currentStep?.phase ?? "default"] ?? phaseCaption.default;
  const lastStep = steps[steps.length - 1] as EditStep | undefined;
  const result = lastStep?.dp[lastStep.s1.length]?.[lastStep.s2.length];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/dp" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-violet-700 rounded-lg flex items-center justify-center text-sm font-bold">ED</div>
          <h1 className="text-xl font-bold">Edit Distance</h1>
          <span className="text-xs bg-violet-500/10 border border-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full">
            Levenshtein · insert / delete / substitute
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-4">

        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Visualization</span>
            <span className="text-xs text-gray-500">amber = no match · emerald = match · bottom-right = result</span>
          </div>
          <div className="relative overflow-auto">
            <EditDistanceVisualizer step={currentStep} />
            {steps.length > 0 && currentStep && (
              <div className="px-4 pb-4 space-y-2">
                <div className={`border rounded-lg px-4 py-2.5 flex items-center gap-3 transition-all duration-300 ${captionClass}`}>
                  <span className="text-base shrink-0">▶</span>
                  <span className="text-sm leading-relaxed">{currentStep.explanation}</span>
                  <span className="ml-auto text-xs opacity-50 shrink-0">step {step + 1}/{steps.length}</span>
                </div>
                <AIExplainer
                  algorithm="Edit Distance (Levenshtein)"
                  stepExplanation={currentStep.explanation}
                  stepIndex={step}
                  totalSteps={steps.length}
                  additionalContext={`Converting "${currentStep.s1}" to "${currentStep.s2}".`}
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
            <CodePanel lines={codeLines} highlightLine={currentStep?.highlightLine ?? -1} annotation={annotation} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Input Strings</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Source string (max 8)</label>
                <input
                  type="text"
                  value={s1Input}
                  onChange={(e) => setS1Input(e.target.value.toUpperCase().slice(0, 8))}
                  onKeyDown={(e) => e.key === "Enter" && handleRun()}
                  placeholder="e.g. HORSE"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-sm font-mono text-white uppercase focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Target string (max 8)</label>
                <input
                  type="text"
                  value={s2Input}
                  onChange={(e) => setS2Input(e.target.value.toUpperCase().slice(0, 8))}
                  onKeyDown={(e) => e.key === "Enter" && handleRun()}
                  placeholder="e.g. ROS"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-sm font-mono text-white uppercase focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button type="button" onClick={handleRun}
              className="w-full px-4 py-2 bg-violet-700 hover:bg-violet-600 text-white rounded-lg text-sm font-medium transition-colors">
              Compute Edit Distance
            </button>
            {result !== undefined && (
              <p className="text-xs text-violet-300 font-mono">
                Edit distance: {result} operation{result !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Complexity</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Time</div>
                <div className="text-lg font-bold text-violet-400">{complexity.time}</div>
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
