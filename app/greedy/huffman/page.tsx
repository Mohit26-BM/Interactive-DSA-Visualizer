"use client";

import { useState } from "react";
import Link from "next/link";
import Controls from "@/components/shared/Controls";
import CodePanel from "@/components/shared/CodePanel";
import AIExplainer from "@/components/shared/AIExplainer";
import { usePlayer } from "@/components/shared/usePlayer";
import {
  huffmanCoding, DEFAULT_HUFFMAN_FREQS,
  GREEDY_CODE, GREEDY_ANNOTATIONS, GREEDY_COMPLEXITY, type HuffmanStep, type HuffNode,
} from "@/lib/greedy-engine";

const phaseCaption: Record<string, string> = {
  found:   "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
  insert:  "bg-amber-500/15 border-amber-500/30 text-amber-200",
  default: "bg-green-500/15 border-green-500/30 text-green-200",
};

function HuffmanTreeViz({ step }: { step?: HuffmanStep }) {
  if (!step || Object.keys(step.nodes).length === 0) {
    return <div className="p-8 text-center text-gray-600 text-sm">Click Run to build the Huffman tree.</div>;
  }

  const { nodes, heap, merging, newNode } = step;

  // Find root (in heap[0] when done, or nodes not referenced as children)
  const allIds = Object.keys(nodes);
  const childIds = new Set<string>();
  for (const n of Object.values(nodes)) {
    if (n.left) childIds.add(n.left);
    if (n.right) childIds.add(n.right);
  }
  const rootIds = allIds.filter(id => !childIds.has(id));

  // Layout: BFS, assign x positions
  const positions: Record<string, { x: number; y: number }> = {};
  const W = 560, ROW_H = 70;

  function layoutTree(rootId: string, x: number, y: number, spread: number) {
    positions[rootId] = { x, y };
    const n = nodes[rootId];
    if (n.left) layoutTree(n.left, x - spread, y + ROW_H, spread / 2);
    if (n.right) layoutTree(n.right, x + spread, y + ROW_H, spread / 2);
  }

  for (const rid of rootIds) layoutTree(rid, W / 2 / rootIds.length + (rootIds.indexOf(rid) * W / rootIds.length), 40, 100 / rootIds.length);

  const HEIGHT = Math.max(160, (Math.max(...Object.values(positions).map(p => p.y)) + 50));

  return (
    <svg viewBox={`0 0 ${W} ${HEIGHT}`} className="w-full" style={{ maxHeight: 280 }}>
      {/* Edges */}
      {Object.values(nodes).map(n => {
        const p = positions[n.id];
        if (!p) return null;
        const edges = [];
        for (const [side, childId] of [[0, n.left], [1, n.right]] as const) {
          const cp = positions[childId ?? ""];
          if (!childId || !cp) continue;
          edges.push(
            <g key={`${n.id}-${childId}`}>
              <line x1={p.x} y1={p.y + 16} x2={cp.x} y2={cp.y - 16} stroke="#374151" strokeWidth={1.5} />
              <text x={(p.x + cp.x) / 2 - 6} y={(p.y + cp.y) / 2} fill={side === 0 ? "#60a5fa" : "#f472b6"} fontSize={10} fontFamily="monospace">{side === 0 ? "0" : "1"}</text>
            </g>
          );
        }
        return edges;
      })}
      {/* Nodes */}
      {Object.values(nodes).map(n => {
        const p = positions[n.id];
        if (!p) return null;
        const isMerging = merging?.includes(n.id);
        const isNew = newNode === n.id;
        const isLeaf = !n.left && !n.right;
        const stroke = isMerging ? "#f59e0b" : isNew ? "#10b981" : isLeaf ? "#6366f1" : "#4b5563";
        const fill = isMerging ? "#451a03" : isNew ? "#052e16" : isLeaf ? "#1e1b4b" : "#111827";
        return (
          <g key={n.id}>
            <circle cx={p.x} cy={p.y} r={16} fill={fill} stroke={stroke} strokeWidth={isMerging || isNew ? 2 : 1.5} />
            <text x={p.x} y={p.y - 3} textAnchor="middle" fill={isLeaf ? "#a5b4fc" : "#9ca3af"} fontSize={isLeaf ? 10 : 9} fontFamily="monospace" fontWeight="bold">
              {isLeaf ? n.char : ""}
            </text>
            <text x={p.x} y={p.y + (isLeaf ? 7 : 4)} textAnchor="middle" fill={isMerging ? "#fbbf24" : isNew ? "#34d399" : "#6b7280"} fontSize={9} fontFamily="monospace">
              {n.freq}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function HuffmanPage() {
  const [steps, setSteps] = useState<HuffmanStep[]>([]);

  const { step, playing, speed, play, pause, stepForward, stepBackward, reset, setSpeed } = usePlayer(steps.length);
  const currentStep = steps[step] as HuffmanStep | undefined;

  const handleRun = () => setSteps(huffmanCoding(DEFAULT_HUFFMAN_FREQS));

  const complexity = GREEDY_COMPLEXITY.huffman;
  const annotation = currentStep ? GREEDY_ANNOTATIONS.huffman[currentStep.highlightLine] : undefined;
  const captionClass = phaseCaption[currentStep?.phase ?? "default"] ?? phaseCaption.default;

  const codes = currentStep?.codes ?? {};
  const heap = currentStep?.heap ?? [];
  const nodes = currentStep?.nodes ?? {};

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/greedy" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center text-sm font-bold">⌥</div>
          <h1 className="text-xl font-bold">Huffman Coding</h1>
          <span className="text-xs bg-green-500/10 border border-green-500/20 text-green-300 px-2 py-0.5 rounded-full">optimal prefix codes · min-heap · O(n log n)</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-4">
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Huffman Tree</span>
            <span className="text-xs text-gray-500">gold = merging · green = new internal node · blue label = 0-edge · pink = 1-edge</span>
          </div>
          <div className="p-4 space-y-3">
            <HuffmanTreeViz step={currentStep} />

            {/* Heap state */}
            {heap.length > 0 && (
              <div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Min-Heap (sorted by frequency)</div>
                <div className="flex gap-2 flex-wrap">
                  {heap.map((id, i) => {
                    const n = nodes[id];
                    if (!n) return null;
                    const isMerge = currentStep?.merging?.includes(id);
                    return (
                      <div key={id} className={`border rounded-lg px-3 py-1.5 text-xs font-mono transition-all ${isMerge ? "bg-amber-900/50 border-amber-600/50 text-amber-200" : "bg-gray-800 border-gray-700 text-gray-300"}`}>
                        {n.char.length <= 3 ? n.char : "•"}<span className="text-gray-500 ml-1">({n.freq})</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Codes */}
            {Object.keys(codes).length > 0 && (
              <div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Character Codes</div>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(codes).sort((a, b) => a[1].length - b[1].length).map(([ch, code]) => (
                    <div key={ch} className="bg-indigo-900/30 border border-indigo-700/40 rounded-lg px-3 py-1.5 text-xs font-mono">
                      <span className="text-indigo-300 font-bold">{ch}</span>
                      <span className="text-gray-500 mx-1">=</span>
                      <span className="text-emerald-300">{code}</span>
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
                <AIExplainer algorithm="Huffman Coding" stepExplanation={currentStep.explanation} stepIndex={step} totalSteps={steps.length} />
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
            <CodePanel lines={GREEDY_CODE.huffman} highlightLine={currentStep?.highlightLine ?? -1} annotation={annotation} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Run Algorithm</h3>
            <button onClick={handleRun} className="w-full px-4 py-3 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm font-medium">Build Huffman Tree</button>
            <p className="text-xs text-gray-500">Characters: a(5), b(9), c(12), d(13), e(16), f(45). Frequent chars get shorter codes.</p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Complexity</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded-lg p-3"><div className="text-xs text-gray-500 mb-1">Time</div><div className="text-lg font-bold text-green-400">{complexity.time}</div></div>
              <div className="bg-gray-800 rounded-lg p-3"><div className="text-xs text-gray-500 mb-1">Space</div><div className="text-lg font-bold text-purple-400">{complexity.space}</div></div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{complexity.note}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
