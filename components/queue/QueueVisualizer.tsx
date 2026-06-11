"use client";

import { motion, AnimatePresence } from "framer-motion";
import { SimpleQueueState, LLQueueState, DequeState, QueueType } from "@/lib/queue-engine";

const phaseColor: Record<string, string> = {
  insert: "bg-green-500 border-green-400 text-white shadow-green-500/40",
  found:  "bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/40",
  delete: "bg-red-500 border-red-400 text-white shadow-red-500/40",
  error:  "bg-red-500 border-red-400 text-white shadow-red-500/40",
  default:"bg-indigo-500 border-indigo-400 text-white shadow-indigo-500/40",
};

// ─── Simple / Circular Queue ──────────────────────────────────────────────────

interface ArrayQueueVisualizerProps {
  state: SimpleQueueState;
  highlightIndices: number[];
  phase?: string;
  queueType: "simple" | "circular";
}

export function ArrayQueueVisualizer({ state, highlightIndices, phase, queueType }: ArrayQueueVisualizerProps) {
  const hiSet = new Set(highlightIndices);

  return (
    <div className="flex flex-col items-center gap-5 py-6">
      {queueType === "circular" && (
        <div className="text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-1.5">
          Circular — rear wraps: (rear + 1) % {state.maxSize}
        </div>
      )}

      {/* Slots row */}
      <div className="flex items-end gap-1.5">
        {state.slots.map((el, i) => {
          const isHi = hiSet.has(i);
          const isFront = i === state.front && state.size > 0;
          const isRear = i === state.rear && state.size > 0;
          const colorKey = isHi ? (phase && phaseColor[phase] ? phase : "default") : "";
          const colorClass = isHi
            ? phaseColor[colorKey]
            : el
            ? "bg-gray-700 border-gray-500 text-gray-200"
            : "bg-gray-900 border-gray-800 text-gray-700";

          return (
            <div key={i} className="flex flex-col items-center gap-1">
              {/* Front/Rear labels on top */}
              <div className="h-5 flex items-end gap-0.5">
                {isFront && <span className="text-xs font-bold text-blue-400">F</span>}
                {isRear && <span className="text-xs font-bold text-orange-400">R</span>}
              </div>
              <motion.div
                layout
                animate={{ scale: isHi ? 1.08 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`w-14 h-14 border-2 rounded-lg flex items-center justify-center font-bold text-base shadow-md transition-colors duration-300 ${colorClass}`}
              >
                <AnimatePresence mode="wait">
                  {el ? (
                    <motion.span key={el.id} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                      {el.value}
                    </motion.span>
                  ) : (
                    <span className="text-xs opacity-30">—</span>
                  )}
                </AnimatePresence>
              </motion.div>
              <span className="text-xs text-gray-600">{i}</span>
            </div>
          );
        })}
      </div>

      {/* FRONT / REAR arrows */}
      <div className="flex items-center gap-6 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-blue-500" />
          <span className="text-blue-400 font-medium">FRONT (dequeue side)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-orange-500" />
          <span className="text-orange-400 font-medium">REAR (enqueue side)</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-xs text-gray-500">
        <span>front = <span className="text-blue-400 font-mono">{state.front}</span></span>
        <span>rear = <span className="text-orange-400 font-mono">{state.rear}</span></span>
        <span>size = <span className="text-purple-400 font-mono">{state.size}/{state.maxSize}</span></span>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-gray-900 border border-gray-700" /><span>Empty</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-gray-700" /><span>Element</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-500" /><span>Enqueue</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-500" /><span>Dequeue</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-500" /><span>Found</span></div>
      </div>
    </div>
  );
}

// ─── Linked List Queue ────────────────────────────────────────────────────────

interface LLQueueVisualizerProps {
  state: LLQueueState;
  highlightNodes: string[];
  phase?: string;
}

export function LLQueueVisualizer({ state, highlightNodes, phase }: LLQueueVisualizerProps) {
  const hiSet = new Set(highlightNodes);

  const ordered: typeof state.nodes = [];
  let cur: string | null = state.head;
  const visited = new Set<string>();
  while (cur && !visited.has(cur)) {
    const n = state.nodes.find((n) => n.id === cur);
    if (!n) break;
    ordered.push(n);
    visited.add(cur);
    cur = n.next;
  }

  return (
    <div className="flex flex-col items-center gap-5 py-6">
      {ordered.length === 0 ? (
        <div className="text-gray-600 text-sm italic">Empty queue</div>
      ) : (
        <div className="flex flex-col gap-2 items-start">
          <div className="flex items-center gap-1 text-xs mb-1">
            <span className="text-blue-400 font-bold">HEAD = FRONT</span>
            <span className="text-gray-600 mx-2">→ dequeue side</span>
            <span className="text-orange-400 font-bold ml-auto">TAIL = REAR</span>
            <span className="text-gray-600 ml-1">← enqueue side</span>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <AnimatePresence mode="popLayout">
              {ordered.map((node, i) => {
                const isHi = hiSet.has(node.id);
                const isFront = node.id === state.head;
                const isRear = node.id === state.tail;
                const colorKey = isHi ? (phase && phaseColor[phase] ? phase : "default") : "";
                const colorClass = isHi ? phaseColor[colorKey] : "bg-gray-800 border-gray-600 text-gray-200";

                return (
                  <motion.div
                    key={node.id}
                    layout
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: isHi ? 1.06 : 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="flex flex-col items-center gap-0.5"
                  >
                    <div className="h-4 flex gap-1 items-end">
                      {isFront && <span className="text-xs font-bold text-blue-400">F</span>}
                      {isRear && <span className="text-xs font-bold text-orange-400">R</span>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`flex rounded-lg border-2 overflow-hidden shadow-md transition-colors duration-300 ${colorClass}`}>
                        <div className={`px-4 py-2.5 font-bold text-base border-r-2 ${isHi ? "border-white/30" : "border-gray-600"}`}>{node.value}</div>
                        <div className={`px-2 py-2.5 text-xs flex items-center font-mono ${isHi ? "opacity-70" : "text-gray-500"}`}>next</div>
                      </div>
                      {node.next ? (
                        <div className="flex items-center gap-0.5">
                          <div className="w-5 h-0.5 bg-gray-500" />
                          <div className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-6 border-l-gray-500" />
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 font-mono ml-1">null</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-gray-700 border border-gray-600" /><span>Node</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-indigo-500" /><span>Active</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-500" /><span>Enqueue</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-500" /><span>Dequeue</span></div>
      </div>
    </div>
  );
}

// ─── Deque ────────────────────────────────────────────────────────────────────

interface DequeVisualizerProps {
  state: DequeState;
  highlightNodes: string[];
  phase?: string;
}

export function DequeVisualizer({ state, highlightNodes, phase }: DequeVisualizerProps) {
  const hiSet = new Set(highlightNodes);

  const ordered: typeof state.nodes = [];
  let cur: string | null = state.head;
  const visited = new Set<string>();
  while (cur && !visited.has(cur)) {
    const n = state.nodes.find((n) => n.id === cur);
    if (!n) break;
    ordered.push(n);
    visited.add(cur);
    cur = n.next;
  }

  return (
    <div className="flex flex-col items-center gap-5 py-6">
      {/* Direction indicators */}
      <div className="flex items-center gap-3 text-xs font-medium">
        <span className="text-blue-400">← AddFront / RemoveFront</span>
        <span className="text-gray-600">|</span>
        <span className="text-orange-400">AddRear / RemoveRear →</span>
      </div>

      {ordered.length === 0 ? (
        <div className="text-gray-600 text-sm italic">Empty deque</div>
      ) : (
        <div className="flex items-center flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {ordered.map((node, i) => {
              const isHi = hiSet.has(node.id);
              const isFront = node.id === state.head;
              const isRear = node.id === state.tail;
              const colorKey = isHi ? (phase && phaseColor[phase] ? phase : "default") : "";
              const colorClass = isHi ? phaseColor[colorKey] : "bg-gray-800 border-gray-600 text-gray-200";

              return (
                <motion.div
                  key={node.id}
                  layout
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: isHi ? 1.06 : 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="flex flex-col items-center gap-0.5"
                >
                  <div className="h-4 flex gap-1 items-end">
                    {isFront && <span className="text-xs font-bold text-blue-400">FRONT</span>}
                    {isRear && <span className="text-xs font-bold text-orange-400">REAR</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    {/* prev arrow */}
                    {node.prev && (
                      <div className="flex items-center gap-0.5">
                        <div className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-6 border-r-gray-500" />
                        <div className="w-4 h-0.5 bg-gray-500" />
                      </div>
                    )}
                    <div className={`px-4 py-2.5 border-2 rounded-lg font-bold text-base shadow-md transition-colors duration-300 ${colorClass}`}>
                      {node.value}
                    </div>
                    {node.next && (
                      <div className="flex items-center gap-0.5">
                        <div className="w-4 h-0.5 bg-gray-500" />
                        <div className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-6 border-l-gray-500" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-gray-700 border border-gray-600" /><span>Node</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-indigo-500" /><span>Active</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-500" /><span>Insert</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-500" /><span>Remove</span></div>
      </div>
    </div>
  );
}
