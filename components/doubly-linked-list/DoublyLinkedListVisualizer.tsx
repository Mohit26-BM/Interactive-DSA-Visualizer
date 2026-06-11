"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DLLState } from "@/lib/doubly-linked-list-engine";

interface Props {
  state: DLLState;
  highlightNodes: string[];
  phase?: string;
}

const phaseColor: Record<string, string> = {
  insert: "bg-green-500 border-green-400 text-white shadow-green-500/40",
  found:  "bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/40",
  delete: "bg-red-500 border-red-400 text-white shadow-red-500/40",
  error:  "bg-red-500 border-red-400 text-white shadow-red-500/40",
  default:"bg-indigo-500 border-indigo-400 text-white shadow-indigo-500/40",
};

export default function DoublyLinkedListVisualizer({ state, highlightNodes, phase }: Props) {
  const highlightSet = new Set(highlightNodes);

  // Build ordered node list starting from head
  const ordered: typeof state.nodes = [];
  const visited = new Set<string>();
  let cur: string | null = state.head;
  while (cur && !visited.has(cur)) {
    const node = state.nodes.find((n) => n.id === cur);
    if (!node) break;
    ordered.push(node);
    visited.add(cur);
    cur = node.next;
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8 min-h-[180px] px-4 overflow-x-auto">
      {/* HEAD label + NULL on left */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {state.head && (
          <div className="flex flex-col items-center gap-1 mr-2">
            <span className="text-xs font-bold text-purple-400 bg-purple-400/10 border border-purple-400/30 px-2 py-0.5 rounded">HEAD</span>
            <div className="w-px h-4 bg-purple-400/50" />
          </div>
        )}

        {/* NULL left terminator */}
        {state.head && (
          <>
            <div className="text-gray-600 text-xs font-mono">null</div>
            <div className="flex items-center gap-0.5 text-gray-600">
              <span className="text-xs">←</span>
            </div>
          </>
        )}

        <AnimatePresence mode="popLayout">
          {ordered.map((node, i) => {
            const isHighlighted = highlightSet.has(node.id);
            const colorKey = isHighlighted ? (phase && phaseColor[phase] ? phase : "default") : "";
            const colorClass = isHighlighted ? phaseColor[colorKey] : "bg-gray-800 border-gray-600 text-gray-200";
            const isHead = node.id === state.head;
            const isTail = node.id === state.tail;

            return (
              <motion.div
                key={node.id}
                layout
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: isHighlighted ? 1.08 : 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="flex items-center gap-0.5"
              >
                {/* Backward arrow (from next node's perspective) */}
                {i > 0 && (
                  <div className="flex flex-col gap-0.5 items-center mx-0.5">
                    <span className="text-[10px] text-purple-400">←</span>
                    <span className="text-[10px] text-teal-400">→</span>
                  </div>
                )}

                <div className="flex flex-col items-center gap-0.5">
                  {/* Label */}
                  <div className="flex gap-1">
                    {isHead && <span className="text-[9px] text-purple-400 font-bold">H</span>}
                    {isTail && <span className="text-[9px] text-orange-400 font-bold">T</span>}
                  </div>

                  {/* Node box */}
                  <div className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-bold text-base shadow-lg transition-all duration-300 ${colorClass}`}>
                    {node.value}
                  </div>
                  <span className="text-[9px] text-gray-600 font-mono">{i}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* NULL right terminator */}
        {state.tail && (
          <>
            <div className="flex items-center gap-0.5 text-gray-600">
              <span className="text-xs">→</span>
            </div>
            <div className="text-gray-600 text-xs font-mono">null</div>
          </>
        )}

        {/* TAIL label */}
        {state.tail && (
          <div className="flex flex-col items-center gap-1 ml-2">
            <span className="text-xs font-bold text-orange-400 bg-orange-400/10 border border-orange-400/30 px-2 py-0.5 rounded">TAIL</span>
            <div className="w-px h-4 bg-orange-400/50" />
          </div>
        )}

        {ordered.length === 0 && (
          <div className="text-gray-600 text-sm italic">Empty list</div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="text-purple-400">←</span>
          <span>prev pointer</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-teal-400">→</span>
          <span>next pointer</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>Insert</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span>Delete</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-500" />
          <span>Found</span>
        </div>
      </div>
    </div>
  );
}
