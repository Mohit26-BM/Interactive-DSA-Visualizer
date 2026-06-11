"use client";

import { useState } from "react";
import Link from "next/link";
import Controls from "@/components/shared/Controls";
import CodePanel from "@/components/shared/CodePanel";
import AIExplainer from "@/components/shared/AIExplainer";
import { usePlayer } from "@/components/shared/usePlayer";
import {
  activitySelection, DEFAULT_ACTIVITIES, GREEDY_CODE, GREEDY_ANNOTATIONS, GREEDY_COMPLEXITY,
  type ActivityStep,
} from "@/lib/greedy-engine";

const phaseCaption: Record<string, string> = {
  found:   "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
  error:   "bg-red-500/15 border-red-500/30 text-red-200",
  default: "bg-teal-500/15 border-teal-500/30 text-teal-200",
};

const MAX_TIME = 12;

export default function ActivitySelectionPage() {
  const [steps, setSteps] = useState<ActivityStep[]>([]);

  const { step, playing, speed, play, pause, stepForward, stepBackward, reset, setSpeed } = usePlayer(steps.length);
  const currentStep = steps[step] as ActivityStep | undefined;

  const handleRun = () => setSteps(activitySelection(DEFAULT_ACTIVITIES));

  const complexity = GREEDY_COMPLEXITY.activitySelection;
  const annotation = currentStep ? GREEDY_ANNOTATIONS.activitySelection[currentStep.highlightLine] : undefined;
  const captionClass = phaseCaption[currentStep?.phase ?? "default"] ?? phaseCaption.default;

  const activities = currentStep?.activities ?? DEFAULT_ACTIVITIES;
  const selected = new Set(currentStep?.selected ?? []);
  const rejected = new Set(currentStep?.rejected ?? []);
  const current = currentStep?.current;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/greedy" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-700 rounded-lg flex items-center justify-center text-sm font-bold">⏱</div>
          <h1 className="text-xl font-bold">Activity Selection</h1>
          <span className="text-xs bg-teal-500/10 border border-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full">earliest finish · greedy · O(n log n)</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-4">
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Gantt Chart</span>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-600 inline-block" />selected</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-700 inline-block" />rejected</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-600 inline-block" />current</span>
            </div>
          </div>
          <div className="p-4 overflow-x-auto">
            {/* Time axis */}
            <div className="flex mb-2 ml-20">
              {Array.from({ length: MAX_TIME + 1 }, (_, t) => (
                <div key={t} style={{ width: `${100 / MAX_TIME}%` }} className="text-[10px] text-gray-600 font-mono text-center">{t}</div>
              ))}
            </div>
            {/* Activity bars */}
            <div className="space-y-1.5">
              {activities.map((act, i) => {
                const isSel = selected.has(act.id);
                const isRej = rejected.has(act.id);
                const isCur = current === i;
                const color = isCur ? "bg-amber-700/70 border-amber-500/60" : isSel ? "bg-emerald-800/70 border-emerald-600/60" : isRej ? "bg-red-900/60 border-red-700/50" : "bg-gray-800/60 border-gray-700/50";
                return (
                  <div key={act.id} className="flex items-center gap-3">
                    <div className="w-16 text-right text-xs font-mono text-gray-400 shrink-0">{act.name}</div>
                    <div className="flex-1 relative h-7">
                      <div className="absolute inset-y-0" style={{ left: `${(act.start / MAX_TIME) * 100}%`, width: `${((act.end - act.start) / MAX_TIME) * 100}%` }}>
                        <div className={`h-full rounded border flex items-center justify-center text-[10px] font-mono font-bold transition-all duration-300 ${color} ${isCur ? "text-amber-200" : isSel ? "text-emerald-200" : isRej ? "text-red-400" : "text-gray-500"}`}>
                          {act.start}–{act.end}
                        </div>
                      </div>
                      {/* Grid lines */}
                      {Array.from({ length: MAX_TIME }, (_, t) => (
                        <div key={t} className="absolute inset-y-0 border-l border-gray-800/40" style={{ left: `${(t / MAX_TIME) * 100}%` }} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {steps.length > 0 && currentStep && (
            <div className="px-4 pb-4 space-y-2">
              <div className={`border rounded-lg px-4 py-2.5 flex items-center gap-3 transition-all duration-300 ${captionClass}`}>
                <span className="text-base shrink-0">▶</span>
                <span className="text-sm leading-relaxed">{currentStep.explanation}</span>
                <span className="ml-auto text-xs opacity-50 shrink-0">step {step + 1}/{steps.length}</span>
              </div>
              <AIExplainer algorithm="Activity Selection" stepExplanation={currentStep.explanation} stepIndex={step} totalSteps={steps.length} />
            </div>
          )}
        </div>

        {steps.length > 0 && (
          <Controls step={step} total={steps.length} playing={playing} speed={speed}
            onPlay={play} onPause={pause} onStepForward={stepForward} onStepBackward={stepBackward}
            onReset={reset} onSpeedChange={setSpeed} />
        )}

        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800"><span className="text-sm font-medium text-gray-300">Pseudocode</span></div>
          <div className="p-4">
            <CodePanel lines={GREEDY_CODE.activitySelection} highlightLine={currentStep?.highlightLine ?? -1} annotation={annotation} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Run Algorithm</h3>
            <button onClick={handleRun} className="w-full px-4 py-3 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-sm font-medium">Run Activity Selection</button>
            <p className="text-xs text-gray-500">9 activities sorted by finish time. Greedy always picks earliest-ending compatible activity.</p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Complexity</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded-lg p-3"><div className="text-xs text-gray-500 mb-1">Time</div><div className="text-lg font-bold text-teal-400">{complexity.time}</div></div>
              <div className="bg-gray-800 rounded-lg p-3"><div className="text-xs text-gray-500 mb-1">Space</div><div className="text-lg font-bold text-purple-400">{complexity.space}</div></div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{complexity.note}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
