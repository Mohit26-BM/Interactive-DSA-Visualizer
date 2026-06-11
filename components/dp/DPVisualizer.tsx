"use client";

import type { FibStep, KnapsackStep, LCSStep, CoinStep, LISStep, GridStep, EditStep } from "@/lib/dp-engine";

const INF = 99999;

// ── Fibonacci ────────────────────────────────────────────────────────────────

export function FibonacciVisualizer({ step }: { step?: FibStep }) {
  if (!step) {
    return (
      <div className="p-8 text-center text-gray-600 text-sm">
        Set n and click Compute to start.
      </div>
    );
  }
  const { table, highlightCells, computingCell } = step;

  return (
    <div className="p-6 overflow-x-auto">
      <div className="flex gap-2 min-w-max">
        {table.map((val, i) => {
          const isComputing = computingCell === i;
          const isHighlight = highlightCells.includes(i);
          let border = "border-gray-700 bg-gray-800";
          if (isComputing) border = "border-indigo-500 bg-indigo-900/60 shadow-lg shadow-indigo-500/20";
          else if (isHighlight) border = "border-yellow-500/70 bg-yellow-900/40";
          else if (val !== null) border = "border-gray-600 bg-gray-800/70";

          return (
            <div key={i} className={`flex flex-col items-center border rounded-lg min-w-[52px] transition-all duration-300 ${border}`}>
              <span className="text-[10px] text-gray-500 pt-1.5 font-mono">[{i}]</span>
              <span className={`text-lg font-bold font-mono py-2.5 ${
                val === null ? "text-gray-700" : isComputing ? "text-indigo-300" : isHighlight ? "text-yellow-300" : "text-gray-200"
              }`}>
                {val === null ? "?" : val}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Knapsack ─────────────────────────────────────────────────────────────────

export function KnapsackVisualizer({ step }: { step?: KnapsackStep }) {
  if (!step) {
    return (
      <div className="p-8 text-center text-gray-600 text-sm">
        Set items and capacity, then click Run.
      </div>
    );
  }
  const { table, items, capacity, highlightCell } = step;

  return (
    <div className="p-4 space-y-3 overflow-x-auto">
      {/* Item chips */}
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span key={i} className={`text-[11px] font-mono px-2 py-1 rounded-md border transition-colors ${
            highlightCell && highlightCell[0] === i + 1
              ? "bg-indigo-900/60 border-indigo-500/70 text-indigo-300"
              : "bg-gray-800 border-gray-700 text-gray-400"
          }`}>
            #{i + 1} w={item.weight} v={item.value}
          </span>
        ))}
      </div>

      {/* DP table */}
      <div className="overflow-x-auto">
        <table className="border-collapse text-xs font-mono">
          <thead>
            <tr>
              <th className="px-3 py-2 border border-gray-700 bg-gray-950 text-gray-500 text-[11px]">items↓ cap→</th>
              {Array.from({ length: capacity + 1 }, (_, w) => (
                <th key={w} className="px-3 py-2 border border-gray-700 bg-gray-950 text-cyan-400 text-[11px] min-w-[44px]">{w}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.map((row, i) => (
              <tr key={i}>
                <td className={`px-3 py-2 border border-gray-700 text-center font-semibold text-[11px] ${
                  highlightCell && highlightCell[0] === i
                    ? "bg-indigo-950/60 text-indigo-300"
                    : "bg-gray-950/60 text-gray-400"
                }`}>
                  {i === 0 ? "∅" : `#${i}`}
                </td>
                {row.map((val, w) => {
                  const isActive = highlightCell && highlightCell[0] === i && highlightCell[1] === w;
                  return (
                    <td key={w} className={`px-3 py-2 border border-gray-700 text-center transition-all duration-200 ${
                      isActive
                        ? "bg-yellow-900/60 text-yellow-300 border-yellow-500/60 font-bold"
                        : "text-gray-300 hover:bg-gray-800/40"
                    }`}>
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── LCS ──────────────────────────────────────────────────────────────────────

export function LCSVisualizer({ step }: { step?: LCSStep }) {
  if (!step) {
    return (
      <div className="p-8 text-center text-gray-600 text-sm">
        Enter two strings and click Find LCS.
      </div>
    );
  }
  const { table, s1, s2, highlightCell, isMatch, traceback } = step;

  return (
    <div className="p-4 space-y-3 overflow-x-auto">
      {traceback && (
        <div className="text-[11px] font-mono bg-emerald-900/30 border border-emerald-600/30 text-emerald-300 px-3 py-2 rounded-lg">
          LCS: &quot;{traceback}&quot; (length {traceback.length})
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="border-collapse text-xs font-mono">
          <thead>
            <tr>
              <th className="px-3 py-2 border border-gray-700 bg-gray-950 text-gray-500 text-[11px]">dp</th>
              <th className="px-3 py-2 border border-gray-700 bg-gray-950 text-gray-500 text-[11px]">&quot;&quot;</th>
              {s2.split("").map((c, j) => (
                <th key={j} className={`px-3 py-2 border border-gray-700 bg-gray-950 min-w-[44px] text-[11px] ${
                  highlightCell && highlightCell[1] === j + 1 ? "text-cyan-400" : "text-teal-400"
                }`}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.map((row, i) => (
              <tr key={i}>
                <td className={`px-3 py-2 border border-gray-700 bg-gray-950/60 text-center font-semibold text-[11px] ${
                  i === 0 ? "text-gray-500" : highlightCell && highlightCell[0] === i ? "text-teal-400" : "text-teal-400"
                }`}>
                  {i === 0 ? '""' : s1[i - 1]}
                </td>
                {row.map((val, j) => {
                  const isActive = highlightCell && highlightCell[0] === i && highlightCell[1] === j;
                  return (
                    <td key={j} className={`px-3 py-2 border border-gray-700 text-center transition-all duration-200 ${
                      isActive && isMatch
                        ? "bg-emerald-900/60 text-emerald-300 border-emerald-500/60 font-bold"
                        : isActive
                        ? "bg-yellow-900/60 text-yellow-300 border-yellow-500/60 font-bold"
                        : "text-gray-300 hover:bg-gray-800/40"
                    }`}>
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Coin Change ──────────────────────────────────────────────────────────────

export function CoinChangeVisualizer({ step }: { step?: CoinStep }) {
  if (!step) {
    return (
      <div className="p-8 text-center text-gray-600 text-sm">
        Enter coin denominations and a target amount, then click Run.
      </div>
    );
  }
  const { table, coins, highlightCell, tryingCoin } = step;

  return (
    <div className="p-6 space-y-5 overflow-x-auto">
      {/* Coin chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-500">Coins:</span>
        {coins.map((c) => (
          <div key={c} className={`text-sm font-mono font-bold w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 ${
            tryingCoin === c
              ? "bg-yellow-900/60 border-yellow-500 text-yellow-300 shadow-lg shadow-yellow-500/20 scale-110"
              : "bg-gray-800 border-gray-700 text-gray-300"
          }`}>
            {c}
          </div>
        ))}
      </div>

      {/* DP array */}
      <div className="flex gap-2 min-w-max flex-wrap">
        {table.map((val, i) => {
          const isActive = highlightCell === i;
          const displayVal = val === null || (val as number) >= INF ? "∞" : val;
          let cls = "border-gray-700 bg-gray-800";
          if (isActive) cls = "border-indigo-500 bg-indigo-900/60 shadow-lg shadow-indigo-500/20";
          else if (val === 0) cls = "border-emerald-700/50 bg-emerald-900/30";
          else if (val !== null && (val as number) < INF) cls = "border-gray-600 bg-gray-800/70";

          return (
            <div key={i} className={`flex flex-col items-center border rounded-lg min-w-[52px] transition-all duration-300 ${cls}`}>
              <span className="text-[10px] text-gray-500 pt-1.5 font-mono">[{i}]</span>
              <span className={`text-lg font-bold font-mono py-2.5 transition-colors ${
                displayVal === "∞" ? "text-gray-700" : isActive ? "text-indigo-300" : val === 0 ? "text-emerald-400" : "text-gray-200"
              }`}>
                {displayVal}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── LIS ──────────────────────────────────────────────────────────────────────

export function LISVisualizer({ step }: { step?: LISStep }) {
  if (!step) {
    return (
      <div className="p-8 text-center text-gray-600 text-sm">
        Enter an array and click Find LIS.
      </div>
    );
  }
  const { arr, dp, highlightI, highlightJ, lisIndices } = step;

  return (
    <div className="p-6 space-y-6 overflow-x-auto">
      {/* Original array */}
      <div className="space-y-2">
        <div className="text-[11px] text-gray-500 font-mono">Input Array</div>
        <div className="flex gap-2 min-w-max">
          {arr.map((val, i) => {
            const isI = highlightI === i;
            const isJ = highlightJ === i;
            const inLIS = lisIndices.includes(i);
            let cls = "bg-gray-800 border-gray-700 text-gray-200";
            if (inLIS) cls = "bg-emerald-900/60 border-emerald-500/70 text-emerald-300";
            else if (isI) cls = "bg-indigo-900/70 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-500/20";
            else if (isJ) cls = "bg-yellow-900/60 border-yellow-500/70 text-yellow-300";

            return (
              <div key={i} className={`flex flex-col items-center border rounded-lg min-w-[48px] transition-all duration-300 ${cls}`}>
                <span className="text-[10px] text-gray-500 pt-1.5 font-mono">[{i}]</span>
                <span className="text-lg font-bold font-mono py-2">{val}</span>
                {isI && <span className="text-[9px] text-indigo-400 pb-1 font-mono">i</span>}
                {isJ && <span className="text-[9px] text-yellow-400 pb-1 font-mono">j</span>}
                {!isI && !isJ && <span className="pb-1">&nbsp;</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* DP array */}
      <div className="space-y-2">
        <div className="text-[11px] text-gray-500 font-mono">LIS length ending at each index (dp)</div>
        <div className="flex gap-2 min-w-max">
          {dp.map((val, i) => {
            const isI = highlightI === i;
            const inLIS = lisIndices.includes(i);
            let cls = "bg-gray-800/50 border-gray-700/60 text-gray-500";
            if (inLIS) cls = "bg-emerald-900/40 border-emerald-600/50 text-emerald-400";
            else if (isI) cls = "bg-indigo-900/50 border-indigo-600/50 text-indigo-300";

            return (
              <div key={i} className={`flex flex-col items-center border rounded-lg min-w-[48px] transition-all duration-300 ${cls}`}>
                <span className="text-[10px] text-gray-600 pt-1.5 font-mono">dp[{i}]</span>
                <span className="text-lg font-bold font-mono py-2">{val}</span>
                <span className="pb-1">&nbsp;</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* LIS result */}
      {lisIndices.length > 0 && (
        <div className="text-[11px] font-mono bg-emerald-900/20 border border-emerald-700/30 text-emerald-300 px-3 py-2 rounded-lg">
          LIS: [{lisIndices.map(i => arr[i]).join(", ")}] — length {lisIndices.length}
        </div>
      )}
    </div>
  );
}

// ── Grid DP ──────────────────────────────────────────────────────────────────

export function GridDPVisualizer({ step }: { step?: GridStep }) {
  if (!step) {
    return (
      <div className="p-8 text-center text-gray-600 text-sm">
        Configure grid and click Run to start.
      </div>
    );
  }

  const { dp, grid, rows, cols, highlightCell, problem } = step;
  const isHighlight = (r: number, c: number) => highlightCell?.[0] === r && highlightCell?.[1] === c;
  const isLast = (r: number, c: number) => r === rows - 1 && c === cols - 1;

  const cellColor = (r: number, c: number) => {
    if (isHighlight(r, c)) return "bg-amber-900/60 border-amber-500/70 text-amber-300 ring-1 ring-amber-400/50";
    if (isLast(r, c) && dp[r][c] > 0) return "bg-emerald-900/50 border-emerald-600/50 text-emerald-300";
    if (dp[r][c] > 0 || (r === 0 && c === 0)) return "bg-indigo-900/30 border-indigo-700/40 text-indigo-200";
    return "bg-gray-800/50 border-gray-700/50 text-gray-500";
  };

  return (
    <div className="p-6 space-y-6 overflow-x-auto">
      <div className="flex gap-8 flex-wrap">
        {/* Grid values */}
        {problem === "minPathSum" && (
          <div>
            <div className="text-[10px] text-gray-500 mb-2 uppercase tracking-wider">Input Grid</div>
            <div className="flex flex-col gap-1">
              {grid.map((row, r) => (
                <div key={r} className="flex gap-1">
                  {row.map((val, c) => (
                    <div key={c} className={`w-10 h-10 flex items-center justify-center text-sm font-bold font-mono border rounded-lg transition-all duration-300 ${isHighlight(r, c) ? "bg-amber-900/40 border-amber-600/50 text-amber-300" : "bg-gray-800 border-gray-700 text-gray-300"}`}>
                      {val}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DP table */}
        <div>
          <div className="text-[10px] text-gray-500 mb-2 uppercase tracking-wider">DP Table</div>
          <div className="flex flex-col gap-1">
            {dp.map((row, r) => (
              <div key={r} className="flex gap-1">
                {row.map((val, c) => (
                  <div key={c} className={`w-10 h-10 flex items-center justify-center text-sm font-bold font-mono border rounded-lg transition-all duration-300 ${cellColor(r, c)}`}>
                    {val > 0 || (r === 0 && c === 0) ? val : "·"}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Edit Distance ─────────────────────────────────────────────────────────────

export function EditDistanceVisualizer({ step }: { step?: EditStep }) {
  if (!step) {
    return (
      <div className="p-8 text-center text-gray-600 text-sm">
        Enter two strings and click Compute to start.
      </div>
    );
  }

  const { s1, s2, dp, highlightCell, isMatch } = step;
  const m = s1.length, n = s2.length;
  const isHl = (r: number, c: number) => highlightCell?.[0] === r && highlightCell?.[1] === c;

  const cellColor = (r: number, c: number) => {
    if (isHl(r, c)) {
      if (isMatch) return "bg-emerald-900/60 border-emerald-500/60 text-emerald-200 ring-1 ring-emerald-400/50";
      return "bg-amber-900/60 border-amber-500/60 text-amber-200 ring-1 ring-amber-400/50";
    }
    if (r === m && c === n) return "bg-emerald-900/40 border-emerald-600/40 text-emerald-300";
    if (r === 0 || c === 0) return "bg-gray-800/80 border-gray-600/50 text-gray-400";
    return "bg-gray-800/40 border-gray-700/40 text-gray-300";
  };

  return (
    <div className="p-6 overflow-x-auto">
      <div className="inline-block">
        {/* Column headers */}
        <div className="flex gap-1 mb-1 ml-12">
          <div className="w-8 h-8 flex items-center justify-center text-[10px] text-gray-500">ε</div>
          {s2.split("").map((ch, j) => (
            <div key={j} className="w-8 h-8 flex items-center justify-center text-xs font-bold text-indigo-300 font-mono">{ch}</div>
          ))}
        </div>

        {/* Rows */}
        {Array.from({ length: m + 1 }).map((_, r) => (
          <div key={r} className="flex gap-1 mb-1">
            <div className="w-8 h-8 flex items-center justify-center text-xs font-bold text-indigo-300 font-mono shrink-0 mr-4">
              {r === 0 ? "ε" : s1[r - 1]}
            </div>
            {Array.from({ length: n + 1 }).map((_, c) => (
              <div key={c} className={`w-8 h-8 flex items-center justify-center text-xs font-bold font-mono border rounded transition-all duration-200 ${cellColor(r, c)}`}>
                {dp[r]?.[c] ?? ""}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
