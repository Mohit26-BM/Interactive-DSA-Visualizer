"use client";

import { HashMapState } from "@/lib/hashmap-engine";

interface Props {
  state: HashMapState;
  highlightBuckets: number[];
  highlightKeys: string[];
  phase?: string;
  hashResult?: number;
}

const phaseEntryColor: Record<string, string> = {
  insert:  "bg-green-500/20 border-green-500/50 text-green-200",
  found:   "bg-emerald-500/20 border-emerald-500/50 text-emerald-200",
  delete:  "bg-red-500/20 border-red-500/50 text-red-200",
  error:   "bg-red-500/20 border-red-500/50 text-red-200",
  default: "bg-amber-500/20 border-amber-500/50 text-amber-200",
};

const phaseBucketGlow: Record<string, string> = {
  insert:  "border-green-500/60 shadow-green-500/20",
  found:   "border-emerald-500/60 shadow-emerald-500/20",
  delete:  "border-red-500/60 shadow-red-500/20",
  error:   "border-red-500/60 shadow-red-500/20",
  default: "border-amber-500/60 shadow-amber-500/20",
};

export default function HashMapVisualizer({ state, highlightBuckets, highlightKeys, phase, hashResult }: Props) {
  const hlBucketSet = new Set(highlightBuckets);
  const hlKeySet = new Set(highlightKeys);
  const glowClass = phaseBucketGlow[phase ?? "default"] ?? phaseBucketGlow.default;
  const entryHlClass = phaseEntryColor[phase ?? "default"] ?? phaseEntryColor.default;

  return (
    <div className="p-4 space-y-2">
      {/* Hash result badge */}
      {hashResult !== undefined && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs bg-amber-500/15 border border-amber-500/30 text-amber-300 px-3 py-1.5 rounded-lg font-mono">
            djb2(key) → Bucket [{hashResult}]
          </span>
        </div>
      )}

      {/* Bucket list */}
      <div className="space-y-1.5">
        {state.buckets.map((bucket, idx) => {
          const isHlBucket = hlBucketSet.has(idx);
          return (
            <div
              key={idx}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-all duration-300 ${
                isHlBucket
                  ? `border shadow-lg ${glowClass}`
                  : "border-gray-700 bg-gray-800/40"
              }`}
            >
              {/* Bucket index */}
              <span className={`text-xs font-mono w-8 shrink-0 font-bold ${isHlBucket ? "text-amber-400" : "text-gray-500"}`}>
                [{idx}]
              </span>

              {/* Chain */}
              <div className="flex items-center gap-1 flex-wrap">
                {bucket.entries.length === 0 ? (
                  <span className="text-xs text-gray-600 italic">empty</span>
                ) : (
                  bucket.entries.map((entry, ei) => {
                    const isHlKey = hlKeySet.has(entry.key);
                    return (
                      <div key={ei} className="flex items-center gap-1">
                        {ei > 0 && (
                          <span className="text-gray-500 text-xs font-mono mx-1">→</span>
                        )}
                        <span
                          className={`text-xs font-mono border rounded px-2 py-1 transition-all duration-300 ${
                            isHlKey
                              ? `${entryHlClass} shadow-sm`
                              : "bg-gray-700 border-gray-600 text-gray-300"
                          }`}
                        >
                          {entry.key}: {entry.value}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chain length indicator */}
              {bucket.entries.length > 1 && (
                <span className="ml-auto text-[10px] text-gray-600 shrink-0">
                  {bucket.entries.length} entries
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="flex gap-3 pt-2 border-t border-gray-800">
        <span className="text-[10px] text-gray-500">
          Buckets: <span className="text-gray-400 font-mono">{state.size}</span>
        </span>
        <span className="text-[10px] text-gray-500">
          Entries: <span className="text-gray-400 font-mono">{state.count}</span>
        </span>
        <span className="text-[10px] text-gray-500">
          Load factor: <span className="text-gray-400 font-mono">{(state.count / state.size).toFixed(2)}</span>
        </span>
      </div>
    </div>
  );
}
