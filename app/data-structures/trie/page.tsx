"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Controls from "@/components/shared/Controls";
import CodePanel from "@/components/shared/CodePanel";
import AIExplainer from "@/components/shared/AIExplainer";
import { usePlayer } from "@/components/shared/usePlayer";
import {
  buildTrieFromWords, trieSearch, trieStartsWith,
  TRIE_CODE, TRIE_ANNOTATIONS, TRIE_COMPLEXITY,
  DEFAULT_TRIE_WORDS, type TrieStep, type TrieNodeData,
} from "@/lib/trie-engine";

type Mode = "insert" | "search" | "startsWith";

const phaseCaption: Record<string, string> = {
  found:   "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
  insert:  "bg-indigo-500/15 border-indigo-500/30 text-indigo-200",
  error:   "bg-red-500/15 border-red-500/30 text-red-200",
  default: "bg-violet-500/15 border-violet-500/30 text-violet-200",
};

// Tree layout: compute x,y positions for each node
function computeLayout(nodes: Record<string, TrieNodeData>, childrenMap: Record<string, Record<string, string>>) {
  const positions: Record<string, { x: number; y: number }> = {};
  const LEVEL_H = 65;
  const W = 580;

  // Find root(s): nodes with no parent
  const childIds = new Set<string>();
  for (const map of Object.values(childrenMap)) for (const cid of Object.values(map)) childIds.add(cid);
  const rootIds = Object.keys(nodes).filter(id => !childIds.has(id));

  function subtreeWidth(id: string): number {
    const ch = Object.values(childrenMap[id] ?? {});
    if (ch.length === 0) return 1;
    return ch.reduce((s, cid) => s + subtreeWidth(cid), 0);
  }

  function layout(id: string, x: number, y: number) {
    positions[id] = { x, y };
    const children = Object.values(childrenMap[id] ?? {});
    if (children.length === 0) return;
    const total = subtreeWidth(id);
    let offset = x - (total * 28) / 2;
    for (const cid of children) {
      const cw = subtreeWidth(cid);
      layout(cid, offset + (cw * 28) / 2, y + LEVEL_H);
      offset += cw * 28;
    }
  }

  if (rootIds.length > 0) layout(rootIds[0], W / 2, 30);
  return positions;
}

function TrieViz({ step }: { step?: TrieStep }) {
  if (!step || Object.keys(step.nodes).length === 0) {
    return <div className="p-8 text-center text-gray-600 text-sm">Insert words to build the trie.</div>;
  }

  const { nodes, childrenMap, highlightPath } = step;
  const highlighted = new Set(highlightPath);
  const positions = computeLayout(nodes, childrenMap);

  const allIds = Object.keys(nodes);
  const maxY = Math.max(...allIds.map(id => positions[id]?.y ?? 0));
  const HEIGHT = Math.max(120, maxY + 50);
  const W = 580;

  const childIds = new Set<string>();
  for (const map of Object.values(childrenMap)) for (const cid of Object.values(map)) childIds.add(cid);
  const rootId = allIds.find(id => !childIds.has(id));

  return (
    <svg viewBox={`0 0 ${W} ${HEIGHT}`} className="w-full" style={{ maxHeight: 320 }}>
      {/* Edges */}
      {allIds.map(id => {
        const p = positions[id];
        if (!p) return null;
        return Object.entries(childrenMap[id] ?? {}).map(([ch, cid]) => {
          const cp = positions[cid];
          if (!cp) return null;
          const isHl = highlighted.has(cid);
          return (
            <g key={`${id}-${cid}`}>
              <line x1={p.x} y1={p.y + 14} x2={cp.x} y2={cp.y - 14} stroke={isHl ? "#818cf8" : "#374151"} strokeWidth={isHl ? 2 : 1.5} />
              <text x={(p.x + cp.x) / 2 + 4} y={(p.y + cp.y) / 2} fill={isHl ? "#a5b4fc" : "#4b5563"} fontSize={10} fontFamily="monospace" fontWeight="bold">{ch}</text>
            </g>
          );
        });
      })}
      {/* Nodes */}
      {allIds.map(id => {
        const node = nodes[id];
        const p = positions[id];
        if (!p || !node) return null;
        const isHl = highlighted.has(id);
        const isRoot = id === rootId;
        const isEnd = node.isEnd;
        const stroke = isHl ? "#818cf8" : isEnd ? "#10b981" : isRoot ? "#6b7280" : "#4b5563";
        const fill = isHl ? "#1e1b4b" : isEnd ? "#052e16" : "#111827";
        if (isRoot) return (
          <g key={id}>
            <circle cx={p.x} cy={p.y} r={12} fill="#111827" stroke="#4b5563" strokeWidth={1.5} />
            <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fill="#6b7280" fontSize={8} fontFamily="monospace">root</text>
          </g>
        );
        return (
          <g key={id}>
            <circle cx={p.x} cy={p.y} r={13} fill={fill} stroke={stroke} strokeWidth={isHl ? 2 : 1.5} />
            <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fill={isHl ? "#a5b4fc" : isEnd ? "#34d399" : "#9ca3af"} fontSize={11} fontFamily="monospace" fontWeight="bold">{node.char}</text>
            {isEnd && <circle cx={p.x + 9} cy={p.y - 9} r={3} fill="#10b981" />}
          </g>
        );
      })}
    </svg>
  );
}

export default function TriePage() {
  const [mode, setMode] = useState<Mode>("insert");
  const [queryInput, setQueryInput] = useState("");
  const [steps, setSteps] = useState<TrieStep[]>([]);
  const [error, setError] = useState("");

  // Keep the trie root in sync
  const [trieRoot, setTrieRoot] = useState<ReturnType<typeof buildTrieFromWords>["root"] | null>(null);
  const [insertedWords, setInsertedWords] = useState<string[]>([]);

  const { step, playing, speed, play, pause, stepForward, stepBackward, reset, setSpeed } = usePlayer(steps.length);
  const currentStep = steps[step] as TrieStep | undefined;

  const handleBuildDefault = () => {
    const { steps: s, root } = buildTrieFromWords(DEFAULT_TRIE_WORDS);
    setSteps(s);
    setTrieRoot(root);
    setInsertedWords(DEFAULT_TRIE_WORDS);
  };

  const handleQuery = () => {
    if (!trieRoot) { setError("Build the trie first."); return; }
    const q = queryInput.trim().toLowerCase().slice(0, 12);
    if (!q) { setError("Enter a word."); return; }
    setError("");
    if (mode === "search") setSteps(trieSearch(trieRoot, q));
    else setSteps(trieStartsWith(trieRoot, q));
  };

  const annotation = currentStep ? TRIE_ANNOTATIONS[currentStep.highlightLine] : undefined;
  const captionClass = phaseCaption[currentStep?.phase ?? "default"] ?? phaseCaption.default;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-violet-700 rounded-lg flex items-center justify-center text-sm font-bold">T</div>
          <h1 className="text-xl font-bold">Trie (Prefix Tree)</h1>
          <span className="text-xs bg-violet-500/10 border border-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full">
            insert · search · startsWith · O(m)
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-4">
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Trie Visualization</span>
            <span className="text-xs text-gray-500">green dot = end-of-word · blue path = current operation</span>
          </div>
          <div className="relative overflow-auto">
            <TrieViz step={currentStep} />
            {steps.length > 0 && currentStep && (
              <div className="px-4 pb-4 space-y-2">
                <div className={`border rounded-lg px-4 py-2.5 flex items-center gap-3 transition-all duration-300 ${captionClass}`}>
                  <span className="text-base shrink-0">▶</span>
                  <span className="text-sm leading-relaxed">{currentStep.explanation}</span>
                  <span className="ml-auto text-xs opacity-50 shrink-0">step {step + 1}/{steps.length}</span>
                </div>
                <AIExplainer algorithm="Trie (Prefix Tree)" stepExplanation={currentStep.explanation} stepIndex={step} totalSteps={steps.length}
                  additionalContext={insertedWords.length > 0 ? `Trie contains: [${insertedWords.join(", ")}].` : undefined} />
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
            <CodePanel lines={TRIE_CODE} highlightLine={currentStep?.highlightLine ?? -1} annotation={annotation} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Operations</h3>
            <button onClick={handleBuildDefault} className="w-full px-4 py-2.5 bg-violet-700 hover:bg-violet-600 text-white rounded-lg text-sm font-medium">
              Build Default Trie ({DEFAULT_TRIE_WORDS.length} words)
            </button>
            <p className="text-[11px] text-gray-500">Words: {DEFAULT_TRIE_WORDS.join(", ")}</p>
            <div className="flex gap-2">
              {(["search", "startsWith"] as Mode[]).map(m => (
                <button key={m} onClick={() => setMode(m)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${mode === m ? "bg-violet-700 text-white" : "bg-gray-700 text-gray-400 hover:bg-gray-600"}`}>
                  {m}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={queryInput} onChange={e => setQueryInput(e.target.value.toLowerCase())}
                onKeyDown={e => e.key === "Enter" && handleQuery()}
                placeholder={mode === "search" ? "e.g. apple" : "e.g. app"}
                className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500" />
              <button onClick={handleQuery} className="px-4 py-1.5 bg-violet-700 hover:bg-violet-600 text-white rounded-lg text-sm font-medium">{mode}</button>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Complexity</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded-lg p-3"><div className="text-xs text-gray-500 mb-1">Time</div><div className="text-lg font-bold text-violet-400">{TRIE_COMPLEXITY.time}</div></div>
              <div className="bg-gray-800 rounded-lg p-3"><div className="text-xs text-gray-500 mb-1">Space</div><div className="text-lg font-bold text-purple-400">{TRIE_COMPLEXITY.space}</div></div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{TRIE_COMPLEXITY.note}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
