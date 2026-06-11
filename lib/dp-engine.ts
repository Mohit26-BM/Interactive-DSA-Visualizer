import type { Step } from "./types";

// ── Types ────────────────────────────────────────────────────────────────────

export interface FibStep extends Step {
  table: (number | null)[];
  highlightCells: number[];
  computingCell: number | null;
}

export interface KnapsackItem { weight: number; value: number }

export interface KnapsackStep extends Step {
  table: number[][];
  items: KnapsackItem[];
  capacity: number;
  highlightCell: [number, number] | null;
}

export interface LCSStep extends Step {
  table: number[][];
  s1: string;
  s2: string;
  highlightCell: [number, number] | null;
  isMatch: boolean;
  traceback: string;
}

export interface CoinStep extends Step {
  table: (number | null)[];
  coins: number[];
  target: number;
  highlightCell: number | null;
  tryingCoin: number | null;
}

export interface LISStep extends Step {
  arr: number[];
  dp: number[];
  highlightI: number | null;
  highlightJ: number | null;
  lisIndices: number[];
}

// ── Constants ────────────────────────────────────────────────────────────────

const INF = 99999;

// ── Fibonacci ────────────────────────────────────────────────────────────────

export function fibonacciDP(n: number): FibStep[] {
  const steps: FibStep[] = [];
  const t: (number | null)[] = new Array(n + 1).fill(null);

  const push = (
    cells: number[], computing: number | null,
    line: number, expl: string, phase?: string
  ) => steps.push({ table: [...t], highlightCells: cells, computingCell: computing, highlightLine: line, explanation: expl, phase });

  push([], null, 0, `Create table[0..${n}] — each cell starts as null (uncomputed).`);
  t[0] = 0;
  push([0], 0, 2, "Base case: table[0] = 0.", "insert");
  if (n >= 1) { t[1] = 1; push([1], 1, 3, "Base case: table[1] = 1.", "insert"); }

  for (let i = 2; i <= n; i++) {
    push([i - 1, i - 2], i, 4, `Compute table[${i}] = table[${i-1}](${t[i-1]}) + table[${i-2}](${t[i-2]}).`);
    t[i] = t[i - 1]! + t[i - 2]!;
    push([i], null, 5, `table[${i}] = ${t[i]} stored.`, "insert");
  }

  push([n], null, 6, `Done! fib(${n}) = ${t[n]}.`, "found");
  return steps;
}

// ── Knapsack ─────────────────────────────────────────────────────────────────

export function knapsackDP(items: KnapsackItem[], capacity: number): KnapsackStep[] {
  const steps: KnapsackStep[] = [];
  const n = items.length;
  const tbl: number[][] = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));

  const push = (cell: [number, number] | null, line: number, expl: string, phase?: string) =>
    steps.push({ table: tbl.map(r => [...r]), items, capacity, highlightCell: cell, highlightLine: line, explanation: expl, phase });

  push(null, 0, `Initialize ${n + 1}×${capacity + 1} DP table with zeros (no items selected baseline).`);

  for (let i = 1; i <= n; i++) {
    const { weight, value } = items[i - 1];
    for (let w = 0; w <= capacity; w++) {
      if (weight <= w) {
        const withItem = tbl[i - 1][w - weight] + value;
        const without = tbl[i - 1][w];
        tbl[i][w] = Math.max(without, withItem);
        push([i, w], withItem >= without ? 5 : 8,
          `Item ${i} (w=${weight}, v=${value}), cap=${w}: take=${withItem} vs skip=${without} → best=${tbl[i][w]}.`,
          withItem >= without ? "insert" : "default");
      } else {
        tbl[i][w] = tbl[i - 1][w];
        push([i, w], 8, `Item ${i} (w=${weight}) too heavy for cap=${w} → carry forward ${tbl[i][w]}.`, "default");
      }
    }
  }

  push([n, capacity], 9, `Max value with ${n} items and capacity ${capacity} = ${tbl[n][capacity]}.`, "found");
  return steps;
}

// ── LCS ──────────────────────────────────────────────────────────────────────

export function lcsDP(s1: string, s2: string): LCSStep[] {
  const steps: LCSStep[] = [];
  const m = s1.length, n = s2.length;
  const tbl: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  let traceback = "";

  const push = (
    cell: [number, number] | null, match: boolean,
    line: number, expl: string, phase?: string, tb?: string
  ) => steps.push({ table: tbl.map(r => [...r]), s1, s2, highlightCell: cell, isMatch: match, highlightLine: line, explanation: expl, phase, traceback: tb ?? traceback });

  push(null, false, 0, `Initialize (${m + 1})×(${n + 1}) DP table with zeros — empty prefix produces LCS of length 0.`);

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        tbl[i][j] = tbl[i - 1][j - 1] + 1;
        push([i, j], true, 4, `'${s1[i-1]}' == '${s2[j-1]}' → match! dp[${i}][${j}] = dp[${i-1}][${j-1}]+1 = ${tbl[i][j]}.`, "found");
      } else {
        tbl[i][j] = Math.max(tbl[i - 1][j], tbl[i][j - 1]);
        push([i, j], false, 6, `'${s1[i-1]}' ≠ '${s2[j-1]}' → dp[${i}][${j}] = max(↑${tbl[i-1][j]}, ←${tbl[i][j-1]}) = ${tbl[i][j]}.`, "default");
      }
    }
  }

  // Traceback to recover the LCS string
  let bi = m, bj = n, result = "";
  while (bi > 0 && bj > 0) {
    if (s1[bi - 1] === s2[bj - 1]) { result = s1[bi - 1] + result; bi--; bj--; }
    else if (tbl[bi - 1][bj] > tbl[bi][bj - 1]) bi--;
    else bj--;
  }
  traceback = result;

  push(null, false, 8, `LCS length = ${tbl[m][n]}. Actual LCS = "${result}".`, "found", result);
  return steps;
}

// ── Coin Change ──────────────────────────────────────────────────────────────

export function coinChangeDP(coins: number[], target: number): CoinStep[] {
  const steps: CoinStep[] = [];
  const tbl: (number | null)[] = [0, ...new Array(target).fill(INF)];

  const push = (cell: number | null, coin: number | null, line: number, expl: string, phase?: string) =>
    steps.push({ table: [...tbl], coins, target, highlightCell: cell, tryingCoin: coin, highlightLine: line, explanation: expl, phase });

  push(0, null, 1, "Base case: dp[0] = 0 — zero coins needed to make amount 0.", "insert");

  for (let i = 1; i <= target; i++) {
    push(i, null, 3, `Computing dp[${i}]: minimum coins to reach amount ${i}.`);
    for (const coin of coins) {
      if (coin <= i) {
        const prev = tbl[i - coin] as number;
        if (prev !== INF && prev + 1 < (tbl[i] as number)) {
          tbl[i] = prev + 1;
          push(i, coin, 6, `Coin ${coin}: dp[${i - coin}]+1 = ${tbl[i]} improves current → dp[${i}] = ${tbl[i]}.`, "insert");
        } else {
          push(i, coin, 6, `Coin ${coin}: dp[${i - coin}]+1 = ${prev >= INF ? "∞" : prev + 1} — no improvement.`);
        }
      }
    }
  }

  const ans = (tbl[target] as number) >= INF ? -1 : tbl[target];
  push(target, null, 7, `dp[${target}] = ${ans === -1 ? "impossible (−1)" : ans} min coins.`, ans === -1 ? "error" : "found");
  return steps;
}

// ── LIS ──────────────────────────────────────────────────────────────────────

export function lisDP(arr: number[]): LISStep[] {
  const steps: LISStep[] = [];
  const n = arr.length;
  const dp = new Array(n).fill(1);
  const parent = new Array(n).fill(-1);

  const push = (hi: number | null, hj: number | null, lis: number[], line: number, expl: string, phase?: string) =>
    steps.push({ arr: [...arr], dp: [...dp], highlightI: hi, highlightJ: hj, lisIndices: lis, highlightLine: line, explanation: expl, phase });

  push(null, null, [], 1, "Initialize dp[i] = 1 for all i — every single element is a subsequence of length 1 by itself.");

  for (let i = 1; i < n; i++) {
    push(i, null, [], 2, `Processing arr[${i}] = ${arr[i]} — checking which previous elements can extend a sequence.`);
    for (let j = 0; j < i; j++) {
      if (arr[j] < arr[i]) {
        const newLen = Math.max(dp[i], dp[j] + 1);
        push(i, j, [], 4, `arr[${j}]=${arr[j]} < arr[${i}]=${arr[i]}: dp[${i}] = max(${dp[i]}, dp[${j}]+1) = max(${dp[i]}, ${dp[j]+1}) = ${newLen}.`, "insert");
        if (dp[j] + 1 > dp[i]) { dp[i] = dp[j] + 1; parent[i] = j; }
      } else {
        push(i, j, [], 3, `arr[${j}]=${arr[j]} ≥ arr[${i}]=${arr[i]}: not strictly increasing — skip.`);
      }
    }
  }

  // Reconstruct LIS path via parent pointers
  let maxLen = 1, endIdx = 0;
  for (let i = 0; i < n; i++) if (dp[i] > maxLen) { maxLen = dp[i]; endIdx = i; }
  const lisPath: number[] = [];
  let cur = endIdx;
  while (cur !== -1) { lisPath.unshift(cur); cur = parent[cur]; }

  push(null, null, lisPath, 6, `LIS length = ${maxLen}. One valid LIS: [${lisPath.map(i => arr[i]).join(", ")}].`, "found");
  return steps;
}

// ── Code panels ──────────────────────────────────────────────────────────────

export const DP_CODE: Record<string, string[]> = {
  fibonacci: [
    "function fibonacci(n):",
    "  table = new Array(n+1).fill(null)",
    "  table[0] = 0",
    "  table[1] = 1",
    "  for i = 2 to n:",
    "    table[i] = table[i-1] + table[i-2]",
    "  return table[n]",
  ],
  knapsack: [
    "function knapsack(items, W):",
    "  dp[0..n][0..W] = 0",
    "  for i = 1 to n:",
    "    for w = 0 to W:",
    "      if items[i-1].weight <= w:",
    "        dp[i][w] = max(dp[i-1][w],",
    "          dp[i-1][w-weight] + value)",
    "      else:",
    "        dp[i][w] = dp[i-1][w]",
    "  return dp[n][W]",
  ],
  lcs: [
    "function lcs(s1, s2):",
    "  dp[0..m][0..n] = 0",
    "  for i = 1 to m:",
    "    for j = 1 to n:",
    "      if s1[i-1] == s2[j-1]:",
    "        dp[i][j] = dp[i-1][j-1] + 1",
    "      else:",
    "        dp[i][j] = max(dp[i-1][j],",
    "                       dp[i][j-1])",
    "  return dp[m][n]",
  ],
  "coin-change": [
    "function coinChange(coins, amount):",
    "  dp[0] = 0",
    "  dp[1..amount] = Infinity",
    "  for i = 1 to amount:",
    "    for coin in coins:",
    "      if coin <= i:",
    "        dp[i] = min(dp[i], dp[i-coin]+1)",
    "  return dp[amount] == ∞ ? -1 : dp[amount]",
  ],
  lis: [
    "function lis(arr):",
    "  dp[i] = 1 for all i",
    "  for i = 1 to n-1:",
    "    for j = 0 to i-1:",
    "      if arr[j] < arr[i]:",
    "        dp[i] = max(dp[i], dp[j]+1)",
    "  return max(dp)",
  ],
  uniquePaths: [
    "function uniquePaths(m, n):",
    "  dp[0][j] = 1 for all j  // top row",
    "  dp[i][0] = 1 for all i  // left col",
    "  for i = 1 to m-1:",
    "    for j = 1 to n-1:",
    "      dp[i][j] = dp[i-1][j] + dp[i][j-1]",
    "  return dp[m-1][n-1]",
  ],
  minPathSum: [
    "function minPathSum(grid):",
    "  dp[0][0] = grid[0][0]",
    "  dp[0][j] = dp[0][j-1] + grid[0][j]  // top row",
    "  dp[i][0] = dp[i-1][0] + grid[i][0]  // left col",
    "  for i = 1 to m-1:",
    "    for j = 1 to n-1:",
    "      dp[i][j] = min(dp[i-1][j], dp[i][j-1]) + grid[i][j]",
    "  return dp[m-1][n-1]",
  ],
  editDistance: [
    "function editDistance(s1, s2):",
    "  dp[i][0] = i  // delete i chars from s1",
    "  dp[0][j] = j  // insert j chars to reach s2",
    "  for i = 1 to m:",
    "    for j = 1 to n:",
    "      if s1[i-1] == s2[j-1]:  dp[i][j] = dp[i-1][j-1]",
    "      else: dp[i][j] = 1 + min(insert, delete, substitute)",
    "  return dp[m][n]",
  ],
};

export const DP_ANNOTATIONS: Record<string, Record<number, string>> = {
  fibonacci: {
    2: "base cases seed the recurrence — cannot recurse below 0 or 1",
    3: "fib(1)=1 is the second base case",
    4: "bottom-up: solve small subproblems before large ones",
    5: "O(1) per cell — total O(n) time",
    6: "answer is already in the table",
  },
  knapsack: {
    0: "O(n·W) time and space",
    4: "can we even fit this item at capacity w?",
    5: "take item: add its value, use remaining capacity at row above",
    8: "too heavy: copy value directly from row above (skip item)",
    9: "bottom-right cell holds the global optimum",
  },
  lcs: {
    0: "O(m·n) time and space",
    4: "chars match → diagonal + 1 (extend common prefix)",
    6: "no match → take max of up or left (discard one char)",
    8: "traceback from dp[m][n] to recover the actual string",
  },
  "coin-change": {
    1: "dp[i] = minimum coins to make exactly amount i",
    3: "fill with ∞ = 'impossible' sentinel",
    5: "try each coin denomination",
    6: "greedy minimum: take best option across all coins",
    7: "∞ means amount is unreachable with given coins",
  },
  lis: {
    1: "every element alone forms an IS of length 1",
    3: "strictly increasing: equal elements do not extend",
    4: "extend the best sequence ending at j by appending arr[i]",
    5: "keep the maximum length found so far",
    6: "scan full dp array; O(n) to find the global maximum",
  },
  uniquePaths: {
    1: "top row: only one way to reach each cell (all right moves)",
    2: "left column: only one way to reach each cell (all down moves)",
    5: "recurrence: paths to (i,j) = paths from above + paths from left",
    6: "answer is at the bottom-right corner",
  },
  minPathSum: {
    1: "starting cell: cost equals grid value itself",
    2: "top row: must move right — cumulative sum",
    3: "left column: must move down — cumulative sum",
    6: "take cheaper of top vs left neighbor, add current cell cost",
    7: "bottom-right holds the minimum path cost",
  },
  editDistance: {
    1: "deleting all i chars from s1 to reach empty string",
    2: "inserting all j chars of s2 from empty string",
    5: "characters match: no operation needed — inherit diagonal",
    6: "min of 3 operations: insert (left+1), delete (top+1), substitute (diag+1)",
    7: "dp[m][n] is the minimum edit distance between the full strings",
  },
};

// ── Grid DP ──────────────────────────────────────────────────────────────────

export interface GridStep extends Step {
  grid: number[][];
  dp: number[][];
  rows: number;
  cols: number;
  highlightCell: [number, number] | null;
  problem: "uniquePaths" | "minPathSum";
}

export function uniquePathsDP(m: number, n: number): GridStep[] {
  const steps: GridStep[] = [];
  const dp: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));
  const grid: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));

  const snap = (r: number, c: number, hl: number, expl: string, phase?: string): GridStep => ({
    grid: grid.map((row) => [...row]),
    dp: dp.map((row) => [...row]),
    rows: m, cols: n,
    highlightCell: r >= 0 ? [r, c] : null,
    highlightLine: hl,
    explanation: expl,
    phase,
    problem: "uniquePaths",
  });

  steps.push(snap(-1, -1, 0, `Unique Paths: find how many ways to reach bottom-right of a ${m}×${n} grid moving only right or down.`));

  for (let c = 0; c < n; c++) {
    dp[0][c] = 1;
    steps.push(snap(0, c, 1, `dp[0][${c}] = 1 — only one way to reach any cell in the top row (all right moves).`, "insert"));
  }
  for (let r = 1; r < m; r++) {
    dp[r][0] = 1;
    steps.push(snap(r, 0, 2, `dp[${r}][0] = 1 — only one way to reach any cell in the leftmost column (all down moves).`, "insert"));
  }

  for (let r = 1; r < m; r++) {
    for (let c = 1; c < n; c++) {
      dp[r][c] = dp[r - 1][c] + dp[r][c - 1];
      steps.push(snap(r, c, 3, `dp[${r}][${c}] = dp[${r - 1}][${c}](${dp[r - 1][c]}) + dp[${r}][${c - 1}](${dp[r][c - 1]}) = ${dp[r][c]}.`, "insert"));
    }
  }

  steps.push(snap(m - 1, n - 1, 4, `Done! Total unique paths = dp[${m - 1}][${n - 1}] = ${dp[m - 1][n - 1]}.`, "found"));
  return steps;
}

export function minPathSumDP(inputGrid: number[][]): GridStep[] {
  const steps: GridStep[] = [];
  const m = inputGrid.length;
  const n = inputGrid[0].length;
  const dp: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));
  const grid = inputGrid.map((r) => [...r]);

  const snap = (r: number, c: number, hl: number, expl: string, phase?: string): GridStep => ({
    grid: grid.map((row) => [...row]),
    dp: dp.map((row) => [...row]),
    rows: m, cols: n,
    highlightCell: r >= 0 ? [r, c] : null,
    highlightLine: hl,
    explanation: expl,
    phase,
    problem: "minPathSum",
  });

  steps.push(snap(-1, -1, 0, `Min Path Sum: find path from top-left to bottom-right with minimum sum, moving only right or down.`));

  dp[0][0] = grid[0][0];
  steps.push(snap(0, 0, 1, `dp[0][0] = grid[0][0] = ${grid[0][0]}. Starting point.`, "insert"));

  for (let c = 1; c < n; c++) {
    dp[0][c] = dp[0][c - 1] + grid[0][c];
    steps.push(snap(0, c, 2, `dp[0][${c}] = dp[0][${c - 1}](${dp[0][c - 1]}) + grid[0][${c}](${grid[0][c]}) = ${dp[0][c]}.`, "insert"));
  }
  for (let r = 1; r < m; r++) {
    dp[r][0] = dp[r - 1][0] + grid[r][0];
    steps.push(snap(r, 0, 3, `dp[${r}][0] = dp[${r - 1}][0](${dp[r - 1][0]}) + grid[${r}][0](${grid[r][0]}) = ${dp[r][0]}.`, "insert"));
  }

  for (let r = 1; r < m; r++) {
    for (let c = 1; c < n; c++) {
      const fromTop = dp[r - 1][c];
      const fromLeft = dp[r][c - 1];
      dp[r][c] = Math.min(fromTop, fromLeft) + grid[r][c];
      const via = fromTop <= fromLeft ? `top(${fromTop})` : `left(${fromLeft})`;
      steps.push(snap(r, c, 4, `dp[${r}][${c}] = min(top=${fromTop}, left=${fromLeft}) + grid=${grid[r][c]} = ${dp[r][c]}. Via ${via}.`, "insert"));
    }
  }

  steps.push(snap(m - 1, n - 1, 5, `Done! Min path sum = ${dp[m - 1][n - 1]}.`, "found"));
  return steps;
}

// ── Edit Distance ─────────────────────────────────────────────────────────────

export interface EditStep extends Step {
  s1: string;
  s2: string;
  dp: number[][];
  highlightCell: [number, number] | null;
  isMatch: boolean;
}

export function editDistanceDP(s1: string, s2: string): EditStep[] {
  const steps: EditStep[] = [];
  const m = s1.length, n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  const snap = (r: number, c: number, hl: number, expl: string, phase?: string, match = false): EditStep => ({
    s1, s2,
    dp: dp.map((row) => [...row]),
    highlightCell: r >= 0 ? [r, c] : null,
    highlightLine: hl,
    explanation: expl,
    phase,
    isMatch: match,
  });

  steps.push(snap(-1, -1, 0, `Edit Distance: min insertions/deletions/substitutions to convert "${s1}" → "${s2}". Grid is (${m + 1})×(${n + 1}).`));

  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
    steps.push(snap(i, 0, 1, `dp[${i}][0] = ${i} — converting first ${i} chars of s1 to empty string needs ${i} deletions.`, "insert"));
  }
  for (let j = 1; j <= n; j++) {
    dp[0][j] = j;
    steps.push(snap(0, j, 2, `dp[0][${j}] = ${j} — converting empty string to first ${j} chars of s2 needs ${j} insertions.`, "insert"));
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const match = s1[i - 1] === s2[j - 1];
      if (match) {
        dp[i][j] = dp[i - 1][j - 1];
        steps.push(snap(i, j, 3, `s1[${i - 1}]="${s1[i - 1]}" == s2[${j - 1}]="${s2[j - 1]}" ✓ match! dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = ${dp[i][j]}.`, "found", true));
      } else {
        const ins = dp[i][j - 1];
        const del = dp[i - 1][j];
        const sub = dp[i - 1][j - 1];
        dp[i][j] = 1 + Math.min(ins, del, sub);
        const best = ins <= del && ins <= sub ? "insert" : del <= sub ? "delete" : "substitute";
        steps.push(snap(i, j, 4, `s1[${i - 1}]="${s1[i - 1]}" ≠ s2[${j - 1}]="${s2[j - 1]}". dp[${i}][${j}] = 1+min(ins=${ins},del=${del},sub=${sub}) = ${dp[i][j]}. Best: ${best}.`, "insert", false));
      }
    }
  }

  steps.push(snap(m, n, 5, `Edit distance = ${dp[m][n]}. Minimum operations to convert "${s1}" into "${s2}".`, "found"));
  return steps;
}

export const DP_COMPLEXITY: Record<string, { time: string; space: string; note: string }> = {
  fibonacci: {
    time: "O(n)",
    space: "O(n)",
    note: "Tabulation fills n+1 cells each in O(1). Space can be reduced to O(1) using just two variables.",
  },
  knapsack: {
    time: "O(n·W)",
    space: "O(n·W)",
    note: "n = items, W = capacity. Each cell computed once in O(1). Space reducible to O(W) with a rolling 1-D array.",
  },
  lcs: {
    time: "O(m·n)",
    space: "O(m·n)",
    note: "m, n = lengths of input strings. Reducible to O(min(m, n)) space using two-row technique.",
  },
  "coin-change": {
    time: "O(amount × |coins|)",
    space: "O(amount)",
    note: "For each amount 1..target, try every coin. 1-D dp array — no 2-D table needed.",
  },
  lis: {
    time: "O(n²)",
    space: "O(n)",
    note: "Naive DP: two nested loops. Can be reduced to O(n log n) with patience sorting and binary search.",
  },
  uniquePaths: {
    time: "O(m·n)",
    space: "O(m·n)",
    note: "Fill every cell once. Space reducible to O(n) using a single row (each row only needs the previous row).",
  },
  minPathSum: {
    time: "O(m·n)",
    space: "O(m·n)",
    note: "Each cell computed once using min(top, left) + cell cost. Space reducible to O(n) with 1-D rolling array.",
  },
  editDistance: {
    time: "O(m·n)",
    space: "O(m·n)",
    note: "Levenshtein distance. Each cell uses 3 neighbors (insert, delete, substitute). Space reducible to O(min(m,n)).",
  },
};
