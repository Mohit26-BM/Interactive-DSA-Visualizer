"use client";

import { useState } from "react";
import Link from "next/link";
import Controls from "@/components/shared/Controls";
import CodePanel from "@/components/shared/CodePanel";
import AIExplainer from "@/components/shared/AIExplainer";
import { usePlayer } from "@/components/shared/usePlayer";
import {
  jobSequencing, DEFAULT_JOBS,
  GREEDY_CODE, GREEDY_ANNOTATIONS, GREEDY_COMPLEXITY, type JobStep,
} from "@/lib/greedy-engine";

const phaseCaption: Record<string, string> = {
  found:   "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
  error:   "bg-red-500/15 border-red-500/30 text-red-200",
  default: "bg-lime-500/15 border-lime-500/30 text-lime-200",
};

const SLOT_COLORS = ["bg-teal-900/50 border-teal-700/50", "bg-cyan-900/50 border-cyan-700/50", "bg-sky-900/50 border-sky-700/50", "bg-indigo-900/50 border-indigo-700/50"];

export default function JobSequencingPage() {
  const [steps, setSteps] = useState<JobStep[]>([]);

  const { step, playing, speed, play, pause, stepForward, stepBackward, reset, setSpeed } = usePlayer(steps.length);
  const currentStep = steps[step] as JobStep | undefined;

  const handleRun = () => setSteps(jobSequencing(DEFAULT_JOBS));

  const complexity = GREEDY_COMPLEXITY.jobSequencing;
  const annotation = currentStep ? GREEDY_ANNOTATIONS.jobSequencing[currentStep.highlightLine] : undefined;
  const captionClass = phaseCaption[currentStep?.phase ?? "default"] ?? phaseCaption.default;

  const jobs = currentStep?.jobs ?? [...DEFAULT_JOBS].sort((a, b) => b.profit - a.profit);
  const slots = currentStep?.slots ?? new Array(Math.max(...DEFAULT_JOBS.map(j => j.deadline))).fill(null);
  const totalProfit = currentStep?.totalProfit ?? 0;
  const selectedJobs = new Set(currentStep?.selectedJobs ?? []);
  const currentJob = currentStep?.current;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/greedy" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-lime-700 rounded-lg flex items-center justify-center text-sm font-bold">📋</div>
          <h1 className="text-xl font-bold">Job Sequencing</h1>
          <span className="text-xs bg-lime-500/10 border border-lime-500/20 text-lime-300 px-2 py-0.5 rounded-full">deadline scheduling · profit max</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-4">
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Visualization</span>
            <span className="text-xs text-gray-500">Total profit: <span className="text-lime-400 font-mono">{totalProfit}</span></span>
          </div>
          <div className="p-4 space-y-4">
            {/* Time slots */}
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Time Slots</div>
              <div className="flex gap-3 flex-wrap">
                {slots.map((jobId, i) => (
                  <div key={i} className={`border rounded-xl p-4 min-w-[80px] text-center transition-all duration-300 ${jobId ? SLOT_COLORS[i % SLOT_COLORS.length] : "bg-gray-800/50 border-gray-700/50"}`}>
                    <div className="text-[10px] text-gray-500 mb-1">Slot {i + 1}</div>
                    <div className={`text-lg font-bold ${jobId ? "text-white" : "text-gray-700"}`}>{jobId ?? "—"}</div>
                    {jobId && (
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        +{DEFAULT_JOBS.find(j => j.id === jobId)?.profit ?? 0}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Job list */}
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Jobs (sorted by profit)</div>
              <div className="flex flex-wrap gap-2">
                {jobs.map((job) => {
                  const isCur = currentJob === job.id;
                  const isSel = selectedJobs.has(job.id);
                  return (
                    <div key={job.id} className={`border rounded-lg px-3 py-2 text-xs font-mono transition-all duration-300
                      ${isCur ? "bg-amber-900/50 border-amber-600/50 text-amber-200" :
                        isSel ? "bg-emerald-900/50 border-emerald-600/50 text-emerald-200" :
                        "bg-gray-800/50 border-gray-700/50 text-gray-400"}`}>
                      <div className="font-bold">{job.id}</div>
                      <div className="text-[10px] opacity-70">D:{job.deadline} P:{job.profit}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {steps.length > 0 && currentStep && (
              <div className="space-y-2">
                <div className={`border rounded-lg px-4 py-2.5 flex items-center gap-3 transition-all duration-300 ${captionClass}`}>
                  <span className="text-base shrink-0">▶</span>
                  <span className="text-sm leading-relaxed">{currentStep.explanation}</span>
                  <span className="ml-auto text-xs opacity-50 shrink-0">step {step + 1}/{steps.length}</span>
                </div>
                <AIExplainer algorithm="Job Sequencing" stepExplanation={currentStep.explanation} stepIndex={step} totalSteps={steps.length} />
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
            <CodePanel lines={GREEDY_CODE.jobSequencing} highlightLine={currentStep?.highlightLine ?? -1} annotation={annotation} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Run Algorithm</h3>
            <button onClick={handleRun} className="w-full px-4 py-3 bg-lime-700 hover:bg-lime-600 text-white rounded-lg text-sm font-medium">Run Job Sequencing</button>
            <p className="text-xs text-gray-500">Jobs: J1(d=2,p=100), J2(d=1,p=19), J3(d=2,p=27), J4(d=1,p=25), J5(d=3,p=15).</p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Complexity</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded-lg p-3"><div className="text-xs text-gray-500 mb-1">Time</div><div className="text-lg font-bold text-lime-400">{complexity.time}</div></div>
              <div className="bg-gray-800 rounded-lg p-3"><div className="text-xs text-gray-500 mb-1">Space</div><div className="text-lg font-bold text-purple-400">{complexity.space}</div></div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{complexity.note}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
