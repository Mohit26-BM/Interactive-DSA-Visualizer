"use client";

import { useState } from "react";
import Link from "next/link";
import Controls from "@/components/shared/Controls";
import CodePanel from "@/components/shared/CodePanel";
import AIExplainer from "@/components/shared/AIExplainer";
import { usePlayer } from "@/components/shared/usePlayer";
import { radixSort, SORT_CODE, SORT_ANNOTATIONS, SORT_COMPLEXITY, type RadixStep } from "@/lib/sorting-engine";

const BUCKET_COLORS = [
  "bg-blue-900/40 border-blue-700/40",
  "bg-indigo-900/40 border-indigo-700/40",
  "bg-violet-900/40 border-violet-700/40",
  "bg-purple-900/40 border-purple-700/40",
  "bg-pink-900/40 border-pink-700/40",
  "bg-rose-900/40 border-rose-700/40",
  "bg-orange-900/40 border-orange-700/40",
  "bg-amber-900/40 border-amber-700/40",
  "bg-yellow-900/40 border-yellow-700/40",
  "bg-lime-900/40 border-lime-700/40",
];

const phaseCaption: Record<string, string> = {
  insert:  "bg-indigo-500/15 border-indigo-500/30 text-indigo-200",
  found:   "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
  default: "bg-sky-500/15 border-sky-500/30 text-sky-200",
};

function randomArray(n = 8): number[] {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 900) + 10);
}

const DEFAULT_ARR = [170, 45, 75, 90, 802, 24, 2, 66];

export default function RadixSortPage() {
  const [values, setValues] = useState<number[]>(DEFAULT_ARR);
  const [customInput, setCustomInput] = useState(DEFAULT_ARR.join(", "));
  const [inputError, setInputError] = useState("");
  const [steps, setSteps] = useState<RadixStep[]>([]);

  const { step, playing, speed, play, pause, stepForward, stepBackward, reset, setSpeed } = usePlayer(steps.length);
  const currentStep = steps[step] as RadixStep | undefined;

  const handleRun = () => setSteps(radixSort(values));

  const handleCustomInput = () => {
    const nums = customInput.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n >= 0);
    if (nums.length < 2) { setInputError("Enter at least 2 non-negative integers."); return; }
    if (nums.length > 10) { setInputError("Max 10 elements."); return; }
    setInputError("");
    setValues(nums);
    setSteps([]);
  };

  const complexity = SORT_COMPLEXITY.radixSort;
  const annotation = currentStep ? SORT_ANNOTATIONS.radixSort?.[currentStep.highlightLine] : undefined;
  const captionClass = phaseCaption[currentStep?.phase ?? "default"] ?? phaseCaption.default;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/algorithms/sorting" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sky-700 rounded-lg flex items-center justify-center text-sm font-bold">0-9</div>
          <h1 className="text-xl font-bold">Radix Sort</h1>
          <span className="text-xs bg-gray-800 border border-gray-700 text-gray-400 px-2 py-0.5 rounded-full font-mono">
            {complexity.time} · {complexity.space} space
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-4">
        {/* Input */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-60">
            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-1.5">Array Elements (non-negative integers)</label>
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. 170, 45, 75, 90, 802, 24, 2, 66"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-sky-500"
            />
            {inputError && <p className="text-xs text-red-400 mt-1">{inputError}</p>}
          </div>
          <button onClick={handleCustomInput} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium">Set Array</button>
          <button onClick={() => { const a = randomArray(); setValues(a); setCustomInput(a.join(", ")); setSteps([]); }} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium">Randomize</button>
        </div>

        {/* Visualization */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Bucket Visualization</span>
            <span className="text-xs text-gray-500">
              {currentStep ? `Pass ${currentStep.pass + 1} · ${currentStep.digitName} digit` : "LSD radix sort — buckets 0–9"}
            </span>
          </div>
          <div className="p-4 space-y-4">
            {/* Current array */}
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Current Array</div>
              <div className="flex gap-1 flex-wrap">
                {(currentStep?.arr ?? values).map((v, i) => (
                  <div key={i} className={`min-w-[44px] h-10 flex items-center justify-center text-sm font-bold font-mono border rounded-lg transition-all duration-200
                    ${currentStep?.highlightIndex === i ? "bg-amber-900/60 border-amber-500/60 text-amber-200 ring-1 ring-amber-400/50" : "bg-gray-800 border-gray-700 text-gray-200"}`}>
                    {v}
                  </div>
                ))}
              </div>
            </div>

            {/* Buckets */}
            {steps.length > 0 && currentStep && (
              <div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Buckets (digit {currentStep.digitName})</div>
                <div className="grid grid-cols-5 xl:grid-cols-10 gap-2">
                  {currentStep.buckets.map((bucket, bi) => (
                    <div key={bi} className={`border rounded-lg p-2 min-h-[60px] ${BUCKET_COLORS[bi]}`}>
                      <div className="text-[10px] font-bold text-gray-400 mb-1 text-center">[{bi}]</div>
                      {bucket.map((v, j) => (
                        <div key={j} className="text-xs font-mono font-bold text-white text-center py-0.5">{v}</div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {steps.length > 0 && currentStep && (
              <div className="space-y-2">
                <div className={`border rounded-lg px-4 py-2.5 flex items-center gap-3 transition-all duration-300 ${captionClass}`}>
                  <span className="text-base shrink-0">▶</span>
                  <span className="text-sm leading-relaxed">{currentStep.explanation}</span>
                  <span className="ml-auto text-xs opacity-50 shrink-0">step {step + 1}/{steps.length}</span>
                </div>
                <AIExplainer
                  algorithm="Radix Sort"
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
          <div className="px-4 py-3 border-b border-gray-800"><span className="text-sm font-medium text-gray-300">Pseudocode</span></div>
          <div className="p-4">
            <CodePanel lines={SORT_CODE.radixSort} highlightLine={currentStep?.highlightLine ?? -1} annotation={annotation} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Run Sorting</h3>
            <button onClick={handleRun} className="w-full px-4 py-3 bg-sky-700 hover:bg-sky-600 text-white rounded-lg text-sm font-medium transition-all">Sort Array</button>
            <p className="text-xs text-gray-500">Works on non-negative integers. Colored buckets 0–9 show digit-by-digit distribution. LSD order: ones → tens → hundreds.</p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Complexity Analysis</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded-lg p-3"><div className="text-xs text-gray-500 mb-1">Time</div><div className="text-lg font-bold text-sky-400">{complexity.time}</div></div>
              <div className="bg-gray-800 rounded-lg p-3"><div className="text-xs text-gray-500 mb-1">Space</div><div className="text-lg font-bold text-purple-400">{complexity.space}</div></div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{complexity.note}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
