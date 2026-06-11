"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrayQueueVisualizer, LLQueueVisualizer, DequeVisualizer } from "@/components/queue/QueueVisualizer";
import QueueControls from "@/components/queue/QueueControls";
import Controls from "@/components/shared/Controls";
import CodePanel from "@/components/shared/CodePanel";
import { usePlayer } from "@/components/shared/usePlayer";
import AIExplainer from "@/components/shared/AIExplainer";
import {
  QueueType, QueueStep, SimpleQueueStep, CircularQueueStep, LLQueueStep, DequeStep,
  simpleEnqueue, simpleDequeue, simpleFront, simpleIsEmpty, simpleIsFull,
  circularEnqueue, circularDequeue, circularFront, circularRear, circularIsEmpty, circularIsFull,
  llEnqueue, llDequeue, llFront, llRear, llIsEmpty,
  dequeAddFront, dequeAddRear, dequeRemoveFront, dequeRemoveRear, dequePeekFront, dequePeekRear, dequeIsEmpty,
  QUEUE_CODE, QUEUE_COMPLEXITY, QUEUE_ANNOTATIONS,
} from "@/lib/queue-engine";

function isSQ(s: QueueStep): s is SimpleQueueStep    { return s.queueType === "simple"; }
function isCQ(s: QueueStep): s is CircularQueueStep  { return s.queueType === "circular"; }
function isLL(s: QueueStep): s is LLQueueStep        { return s.queueType === "linkedlist"; }
function isDQ(s: QueueStep): s is DequeStep          { return s.queueType === "deque"; }

const QUEUE_DESC: Record<QueueType, string> = {
  simple:     "FIFO — First In, First Out",
  circular:   "FIFO with wrap-around · (rear+1) % MAX",
  linkedlist: "FIFO using dynamic node allocation",
  deque:      "Double-ended — insert/remove from both ends",
};

const phaseCaption: Record<string, string> = {
  insert: "bg-green-500/15 border-green-500/30 text-green-200",
  found:  "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
  delete: "bg-red-500/15 border-red-500/30 text-red-200",
  error:  "bg-red-500/15 border-red-500/30 text-red-200",
  default:"bg-indigo-500/15 border-indigo-500/30 text-indigo-200",
};

const DEFAULT = [10, 20, 30, 40];

interface Props { queueType: QueueType; title: string; icon: string; color: string }

export default function QueueVisualizerClient({ queueType, title, icon, color }: Props) {
  const [values, setValues] = useState(DEFAULT);
  const [steps, setSteps] = useState<QueueStep[]>([]);
  const [currentOp, setCurrentOp] = useState("enqueue");

  const { step, playing, speed, play, pause, stepForward, stepBackward, reset, setSpeed } = usePlayer(steps.length);
  const currentStep = steps[step] as QueueStep | undefined;

  const handleRun = (op: string, params: Record<string, number>) => {
    setCurrentOp(op);
    let result: QueueStep[] = [];
    if (queueType === "simple") {
      if (op === "enqueue") result = simpleEnqueue(values, params.value);
      else if (op === "dequeue") result = simpleDequeue(values);
      else if (op === "front")   result = simpleFront(values);
      else if (op === "isEmpty") result = simpleIsEmpty(values);
      else if (op === "isFull")  result = simpleIsFull(values);
    } else if (queueType === "circular") {
      if (op === "enqueue") result = circularEnqueue(values, params.value);
      else if (op === "dequeue") result = circularDequeue(values);
      else if (op === "front")   result = circularFront(values);
      else if (op === "rear")    result = circularRear(values);
      else if (op === "isEmpty") result = circularIsEmpty(values);
      else if (op === "isFull")  result = circularIsFull(values);
    } else if (queueType === "linkedlist") {
      if (op === "enqueue") result = llEnqueue(values, params.value);
      else if (op === "dequeue") result = llDequeue(values);
      else if (op === "front")   result = llFront(values);
      else if (op === "rear")    result = llRear(values);
      else if (op === "isEmpty") result = llIsEmpty(values);
    } else if (queueType === "deque") {
      if (op === "addFront")    result = dequeAddFront(values, params.value);
      else if (op === "addRear")     result = dequeAddRear(values, params.value);
      else if (op === "removeFront") result = dequeRemoveFront(values);
      else if (op === "removeRear")  result = dequeRemoveRear(values);
      else if (op === "peekFront")   result = dequePeekFront(values);
      else if (op === "peekRear")    result = dequePeekRear(values);
      else if (op === "isEmpty")     result = dequeIsEmpty(values);
    }
    setSteps(result);
  };

  const handleApplyResult = () => {
    if (!currentStep) return;
    if (isSQ(currentStep) || isCQ(currentStep)) {
      setValues(currentStep.state.slots.filter(Boolean).map((e) => e!.value));
    } else if (isLL(currentStep)) {
      const ordered: number[] = [];
      let cur = currentStep.state.head;
      const visited = new Set<string>();
      while (cur && !visited.has(cur)) {
        const n = currentStep.state.nodes.find((n) => n.id === cur);
        if (!n) break;
        ordered.push(n.value);
        visited.add(cur);
        cur = n.next;
      }
      setValues(ordered);
    } else if (isDQ(currentStep)) {
      const ordered: number[] = [];
      let cur = currentStep.state.head;
      const visited = new Set<string>();
      while (cur && !visited.has(cur)) {
        const n = currentStep.state.nodes.find((n) => n.id === cur);
        if (!n) break;
        ordered.push(n.value);
        visited.add(cur);
        cur = n.next;
      }
      setValues(ordered);
    }
    setSteps([]);
  };

  const renderVisualizer = (s: QueueStep | undefined) => {
    if (!s) {
      if (queueType === "simple") {
        const slots = Array(7).fill(null);
        values.forEach((v, i) => { slots[i] = { value: v, id: `init-${i}` }; });
        return <ArrayQueueVisualizer state={{ slots, front: 0, rear: values.length - 1, size: values.length, maxSize: 7 }} highlightIndices={[]} queueType="simple" />;
      }
      if (queueType === "circular") {
        const slots = Array(7).fill(null);
        values.forEach((v, i) => { slots[i] = { value: v, id: `init-${i}` }; });
        return <ArrayQueueVisualizer state={{ slots, front: 0, rear: values.length > 0 ? values.length - 1 : 6, size: values.length, maxSize: 7 }} highlightIndices={[]} queueType="circular" />;
      }
      if (queueType === "linkedlist") {
        const nodes = values.map((v, i) => ({ id: `init-${i}`, value: v, next: i < values.length - 1 ? `init-${i + 1}` : null }));
        return <LLQueueVisualizer state={{ nodes, head: values.length > 0 ? "init-0" : null, tail: values.length > 0 ? `init-${values.length - 1}` : null }} highlightNodes={[]} />;
      }
      if (queueType === "deque") {
        const nodes = values.map((v, i) => ({ id: `init-${i}`, value: v, prev: i > 0 ? `init-${i - 1}` : null, next: i < values.length - 1 ? `init-${i + 1}` : null }));
        return <DequeVisualizer state={{ nodes, head: values.length > 0 ? "init-0" : null, tail: values.length > 0 ? `init-${values.length - 1}` : null }} highlightNodes={[]} />;
      }
      return null;
    }
    if (isSQ(s)) return <ArrayQueueVisualizer state={s.state} highlightIndices={s.highlightIndices ?? []} phase={s.phase} queueType="simple" />;
    if (isCQ(s)) return <ArrayQueueVisualizer state={s.state} highlightIndices={s.highlightIndices ?? []} phase={s.phase} queueType="circular" />;
    if (isLL(s)) return <LLQueueVisualizer state={s.state} highlightNodes={s.highlightNodes ?? []} phase={s.phase} />;
    if (isDQ(s)) return <DequeVisualizer state={s.state} highlightNodes={s.highlightNodes ?? []} phase={s.phase} />;
    return null;
  };

  const codeLines = QUEUE_CODE[queueType]?.[currentOp] ?? [];
  const complexity = QUEUE_COMPLEXITY[currentOp];
  const annotation = currentStep ? QUEUE_ANNOTATIONS[queueType]?.[currentOp]?.[currentStep.highlightLine] : undefined;
  const captionClass = phaseCaption[currentStep?.phase ?? "default"] ?? phaseCaption.default;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/queue" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center text-sm font-bold`}>{icon}</div>
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
        {steps.length > 0 && step === steps.length - 1 && (
          <button type="button" onClick={handleApplyResult} className="ml-auto px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors">
            Apply Result
          </button>
        )}
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-4">
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Visualization</span>
            <span className="text-xs text-gray-500">{QUEUE_DESC[queueType]}</span>
          </div>
          <div className="relative overflow-auto">
            {renderVisualizer(currentStep)}
            {steps.length > 0 && currentStep && (
              <div className="px-4 pb-4 space-y-2">
                <div className={`border rounded-lg px-4 py-2.5 flex items-center gap-3 transition-all duration-300 ${captionClass}`}>
                  <span className="text-base shrink-0">▶</span>
                  <span className="text-sm leading-relaxed">{currentStep.explanation}</span>
                  <span className="ml-auto text-xs opacity-50 shrink-0">step {step + 1}/{steps.length}</span>
                </div>
                <AIExplainer
                  algorithm={title}
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
          <div className="px-4 py-3 border-b border-gray-800">
            <span className="text-sm font-medium text-gray-300">Pseudocode</span>
          </div>
          <div className="p-4">
            <CodePanel lines={codeLines} highlightLine={currentStep?.highlightLine ?? 0} annotation={annotation} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <QueueControls queueType={queueType} onTypeChange={() => {}} onRun={handleRun} hideTypeSelector />
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Complexity Analysis</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Time</div>
                <div className="text-lg font-bold text-indigo-400">{complexity?.time ?? "O(1)"}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Space</div>
                <div className="text-lg font-bold text-purple-400">{complexity?.space ?? "O(1)"}</div>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{complexity?.note ?? ""}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
