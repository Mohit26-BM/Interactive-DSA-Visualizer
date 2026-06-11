"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LinkedListState } from "@/lib/types";

interface LinkedListVisualizerProps {
  state: LinkedListState;
  highlightNodes: string[];
  phase?: string;
}

const phaseColor: Record<string, { node: string; text: string }> = {
  insert: { node: "bg-green-500 border-green-400 shadow-green-500/40", text: "text-white" },
  found: { node: "bg-emerald-500 border-emerald-400 shadow-emerald-500/40", text: "text-white" },
  delete: { node: "bg-red-500 border-red-400 shadow-red-500/40", text: "text-white" },
  error: { node: "bg-red-500 border-red-400 shadow-red-500/40", text: "text-white" },
  default: { node: "bg-indigo-500 border-indigo-400 shadow-indigo-500/40", text: "text-white" },
};

export default function LinkedListVisualizer({ state, highlightNodes, phase }: LinkedListVisualizerProps) {
  const highlightSet = new Set(highlightNodes);

  const orderedNodes: typeof state.nodes = [];
  let currentId: string | null = state.head;
  const visited = new Set<string>();

  while (currentId && !visited.has(currentId)) {
    const node = state.nodes.find((n) => n.id === currentId);
    if (!node) break;
    orderedNodes.push(node);
    visited.add(currentId);
    currentId = node.next;
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8 min-h-[160px]">
      {orderedNodes.length === 0 ? (
        <div className="text-gray-600 text-sm italic">Empty list</div>
      ) : (
        <div className="flex items-center flex-wrap gap-2 justify-center">
          <div className="flex flex-col items-center">
            <span className="text-xs text-indigo-400 font-mono mb-1">HEAD</span>
            <div className="w-2 h-6 flex flex-col items-center">
              <div className="w-0.5 flex-1 bg-indigo-500" />
              <div className="w-2 h-2 bg-indigo-500 rotate-45 -mt-1" />
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {orderedNodes.map((node, i) => {
              const isHighlighted = highlightSet.has(node.id);
              const colorKey = isHighlighted ? (phase && phaseColor[phase] ? phase : "default") : "";
              const colors = isHighlighted ? phaseColor[colorKey] : null;

              return (
                <motion.div
                  key={node.id}
                  layout
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: isHighlighted ? 1.08 : 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="flex items-center gap-2"
                >
                  <div
                    className={`relative flex rounded-lg border-2 overflow-hidden shadow-lg transition-colors duration-300 ${
                      isHighlighted
                        ? `${colors!.node} shadow-lg`
                        : "bg-gray-800 border-gray-600"
                    }`}
                  >
                    <div
                      className={`px-4 py-3 font-bold text-base border-r-2 ${
                        isHighlighted ? "border-white/30 text-white" : "border-gray-600 text-gray-200"
                      }`}
                    >
                      {node.value}
                    </div>
                    <div
                      className={`px-3 py-3 text-xs flex items-center font-mono ${
                        isHighlighted ? "text-white/70" : "text-gray-500"
                      }`}
                    >
                      next
                    </div>
                  </div>

                  {node.next ? (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      className="flex items-center gap-0.5"
                    >
                      <div className="w-8 h-0.5 bg-gray-500" />
                      <div className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-8 border-l-gray-500" />
                    </motion.div>
                  ) : (
                    <div className="flex items-center gap-1 ml-1">
                      <div className="w-6 h-0.5 bg-gray-600" />
                      <span className="text-xs text-gray-500 font-mono">null</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gray-700 border border-gray-600" />
          <span>Normal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-indigo-500" />
          <span>Active</span>
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
