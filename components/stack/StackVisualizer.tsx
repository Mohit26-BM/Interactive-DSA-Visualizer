"use client";

import { motion, AnimatePresence } from "framer-motion";
import { StackArrayState, StackLLState, STACK_MAX } from "@/lib/stack-engine";

const phaseColor: Record<string, string> = {
  insert: "bg-green-500 border-green-400 text-white shadow-green-500/40",
  found:  "bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/40",
  delete: "bg-red-500 border-red-400 text-white shadow-red-500/40",
  error:  "bg-red-500 border-red-400 text-white shadow-red-500/40",
  default:"bg-indigo-500 border-indigo-400 text-white shadow-indigo-500/40",
};

// ─── Array Stack ──────────────────────────────────────────────────────────────

interface ArrayStackVisualizerProps {
  state: StackArrayState;
  highlightIndices: number[];
  phase?: string;
}

export function ArrayStackVisualizer({ state, highlightIndices, phase }: ArrayStackVisualizerProps) {
  const hiSet = new Set(highlightIndices);
  const slots = Array.from({ length: state.maxSize }, (_, i) => ({
    el: state.elements[i] ?? null,
    idx: i,
  }));
  // render bottom-to-top (index 0 at bottom, top at top)
  const reversed = [...slots].reverse();

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="flex gap-6 items-end">
        {/* Stack column */}
        <div className="flex flex-col-reverse gap-1 items-center">
          {reversed.map(({ el, idx }) => {
            const isTop = idx === state.top;
            const isHi = hiSet.has(idx) && el;
            const colorKey = isHi ? (phase && phaseColor[phase] ? phase : "default") : "";
            const colorClass = isHi ? phaseColor[colorKey] : el ? "bg-gray-700 border-gray-500 text-gray-200" : "bg-gray-900 border-gray-800 text-gray-700";

            return (
              <div key={idx} className="flex items-center gap-2">
                {isTop && el && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-400 whitespace-nowrap"
                  >
                    TOP ▶
                  </motion.div>
                )}
                {!isTop && <div className="w-14" />}
                <motion.div
                  layout
                  initial={el ? { opacity: 0, scale: 0.7 } : false}
                  animate={{ opacity: 1, scale: isHi ? 1.06 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className={`w-20 h-12 border-2 rounded-lg flex items-center justify-center font-bold text-base shadow-md transition-colors duration-300 ${colorClass}`}
                >
                  <AnimatePresence mode="wait">
                    {el ? (
                      <motion.span key={el.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {el.value}
                      </motion.span>
                    ) : (
                      <span className="text-xs opacity-40">—</span>
                    )}
                  </AnimatePresence>
                </motion.div>
                <span className="text-xs text-gray-600 w-4">{idx}</span>
              </div>
            );
          })}
        </div>

        {/* Metadata column */}
        <div className="flex flex-col gap-2 text-xs text-gray-500 pb-1 self-end">
          <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 space-y-1">
            <div className="flex gap-2"><span className="text-gray-400">top</span><span className="text-indigo-400 font-mono">{state.top}</span></div>
            <div className="flex gap-2"><span className="text-gray-400">size</span><span className="text-purple-400 font-mono">{state.elements.length}/{state.maxSize}</span></div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-gray-700 border border-gray-600" /><span>Empty slot</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-gray-600" /><span>Element</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-indigo-500" /><span>Active</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-500" /><span>Push</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-500" /><span>Pop</span></div>
      </div>
    </div>
  );
}

// ─── Linked List Stack ────────────────────────────────────────────────────────

interface LLStackVisualizerProps {
  state: StackLLState;
  highlightNodes: string[];
  phase?: string;
}

export function LLStackVisualizer({ state, highlightNodes, phase }: LLStackVisualizerProps) {
  const hiSet = new Set(highlightNodes);

  // Build ordered list from top (head) downward
  const ordered: typeof state.nodes = [];
  let cur: string | null = state.top;
  const visited = new Set<string>();
  while (cur && !visited.has(cur)) {
    const n = state.nodes.find((n) => n.id === cur);
    if (!n) break;
    ordered.push(n);
    visited.add(cur);
    cur = n.next;
  }

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="flex flex-col items-center gap-1">
        {state.top && (
          <div className="text-xs font-bold text-indigo-400 mb-1">TOP (head)</div>
        )}
        {ordered.length === 0 && <div className="text-gray-600 text-sm italic">Empty stack</div>}
        <AnimatePresence mode="popLayout">
          {ordered.map((node, i) => {
            const isHi = hiSet.has(node.id);
            const colorKey = isHi ? (phase && phaseColor[phase] ? phase : "default") : "";
            const colorClass = isHi ? phaseColor[colorKey] : "bg-gray-800 border-gray-600 text-gray-200";

            return (
              <motion.div
                key={node.id}
                layout
                initial={{ opacity: 0, scale: 0.6, y: -20 }}
                animate={{ opacity: 1, scale: isHi ? 1.06 : 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="flex flex-col items-center"
              >
                <div className={`w-24 h-12 border-2 rounded-lg flex items-center justify-between px-3 font-bold shadow-md transition-colors duration-300 ${colorClass}`}>
                  <span className="text-base">{node.value}</span>
                  <span className={`text-xs font-normal font-mono ${isHi ? "opacity-70" : "text-gray-500"}`}>next</span>
                </div>
                {node.next && (
                  <div className="flex flex-col items-center my-0.5">
                    <div className="w-0.5 h-3 bg-gray-600" />
                    <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-6 border-t-gray-600" />
                  </div>
                )}
                {!node.next && <div className="text-xs text-gray-600 mt-1 font-mono">null</div>}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-gray-700 border border-gray-600" /><span>Node</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-indigo-500" /><span>Active</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-500" /><span>Push</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-500" /><span>Pop</span></div>
      </div>
    </div>
  );
}
