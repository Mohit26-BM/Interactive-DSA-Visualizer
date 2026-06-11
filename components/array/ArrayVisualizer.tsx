"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrayState } from "@/lib/types";

interface ArrayVisualizerProps {
  state: ArrayState;
  highlightIndices: number[];
  phase?: string;
}

const phaseColor: Record<string, string> = {
  insert: "bg-green-500 border-green-400 text-white shadow-green-500/30",
  found: "bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/30",
  delete: "bg-red-500 border-red-400 text-white shadow-red-500/30",
  error: "bg-red-500 border-red-400 text-white shadow-red-500/30",
  default: "bg-indigo-500 border-indigo-400 text-white shadow-indigo-500/30",
};

export default function ArrayVisualizer({ state, highlightIndices, phase }: ArrayVisualizerProps) {
  const highlightSet = new Set(highlightIndices);

  return (
    <div className="flex flex-col items-center gap-6 py-8 min-h-[160px]">
      <div className="flex items-end gap-2 flex-wrap justify-center">
        <AnimatePresence mode="popLayout">
          {state.elements.map((el, i) => {
            const isHighlighted = highlightSet.has(i);
            const colorKey = isHighlighted ? (phase && phaseColor[phase] ? phase : "default") : "";
            const colorClass = isHighlighted
              ? phaseColor[colorKey]
              : "bg-gray-800 border-gray-600 text-gray-200";

            return (
              <motion.div
                key={el.id}
                layout
                initial={{ opacity: 0, scale: 0.5, y: -20 }}
                animate={{ opacity: 1, scale: isHighlighted ? 1.1 : 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center font-bold text-lg shadow-lg transition-colors duration-300 ${colorClass}`}
                >
                  {el.value}
                </div>
                <span className="text-xs text-gray-500">{i}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {state.elements.length === 0 && (
          <div className="text-gray-600 text-sm italic">Empty array</div>
        )}
      </div>

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
