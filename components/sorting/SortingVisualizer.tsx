"use client";

import { SortState } from "@/lib/sorting-engine";

interface Props {
  state: SortState;
  comparingIndices: number[];
  swappingIndices: number[];
  sortedIndices: number[];
  pivotIndex?: number;
  phase?: string;
}

export default function SortingVisualizer({
  state,
  comparingIndices,
  swappingIndices,
  sortedIndices,
  pivotIndex,
}: Props) {
  const { arr } = state;
  const n = arr.length;
  const max = Math.max(...arr, 1);

  const comparingSet = new Set(comparingIndices);
  const swappingSet = new Set(swappingIndices);
  const sortedSet = new Set(sortedIndices);

  function getBarColor(i: number): string {
    if (pivotIndex === i) return "bg-purple-500";
    if (swappingSet.has(i)) return "bg-red-500";
    if (comparingSet.has(i)) return "bg-yellow-500";
    if (sortedSet.has(i)) return "bg-green-600";
    return "bg-gray-600";
  }

  const minHeight = 20;
  const maxHeight = 200;

  return (
    <div className="flex items-end justify-center gap-1 px-4 pt-4 pb-2" style={{ minHeight: 260 }}>
      {arr.map((val, i) => {
        const heightPx = Math.max(minHeight, Math.round((val / max) * maxHeight));
        const barColor = getBarColor(i);
        const isActive = comparingSet.has(i) || swappingSet.has(i) || pivotIndex === i;

        return (
          <div
            key={i}
            className="flex flex-col items-center gap-1"
            style={{ minWidth: Math.max(20, Math.floor(320 / n)) }}
          >
            <span className="text-[10px] text-gray-400 font-mono">{val}</span>
            <div
              className={`w-full rounded-t transition-all duration-200 ${barColor} ${isActive ? "opacity-100" : "opacity-80"}`}
              style={{
                height: heightPx,
                boxShadow: isActive ? `0 0 8px var(--bar-glow, #eab308)` : undefined,
              }}
            />
            <span className="text-[9px] text-gray-600 font-mono">{i}</span>
          </div>
        );
      })}
    </div>
  );
}
