import type { Step } from "./types";

// ── Activity Selection ────────────────────────────────────────────────────────

export interface Activity { id: number; start: number; end: number; name: string }

export interface ActivityStep extends Step {
  activities: Activity[];
  selected: number[];
  rejected: number[];
  current: number | null;
  lastEnd: number;
}

export function activitySelection(acts: Activity[]): ActivityStep[] {
  const steps: ActivityStep[] = [];
  const sorted = [...acts].sort((a, b) => a.end - b.end);
  const selected: number[] = [];
  const rejected: number[] = [];
  let lastEnd = 0;

  const snap = (current: number | null, hl: number, expl: string, phase?: string): ActivityStep => ({
    activities: sorted,
    selected: [...selected],
    rejected: [...rejected],
    current,
    lastEnd,
    highlightLine: hl,
    explanation: expl,
    phase,
  });

  steps.push(snap(null, 0, `Sort activities by finish time. This greedy choice guarantees maximum selection.`));

  for (let i = 0; i < sorted.length; i++) {
    const act = sorted[i];
    steps.push(snap(i, 2, `Consider ${act.name} (${act.start}–${act.end}). Last end = ${lastEnd}. Start(${act.start}) ${act.start >= lastEnd ? "≥" : "<"} lastEnd(${lastEnd}).`, "default"));

    if (act.start >= lastEnd) {
      selected.push(act.id);
      const prev = lastEnd;
      lastEnd = act.end;
      steps.push(snap(i, 3, `Select ${act.name}! start(${act.start}) ≥ lastEnd(${prev}). Update lastEnd = ${act.end}.`, "found"));
    } else {
      rejected.push(act.id);
      steps.push(snap(i, 4, `Reject ${act.name}. start(${act.start}) < lastEnd(${lastEnd}) — overlaps with last selected activity.`, "error"));
    }
  }

  steps.push(snap(null, 5, `Done! Selected ${selected.length} activities: [${sorted.filter(a => selected.includes(a.id)).map(a => a.name).join(", ")}]. This is the maximum possible.`, "found"));
  return steps;
}

export const DEFAULT_ACTIVITIES: Activity[] = [
  { id: 0, start: 0, end: 2,  name: "A" },
  { id: 1, start: 1, end: 3,  name: "B" },
  { id: 2, start: 2, end: 4,  name: "C" },
  { id: 3, start: 3, end: 5,  name: "D" },
  { id: 4, start: 0, end: 6,  name: "E" },
  { id: 5, start: 5, end: 7,  name: "F" },
  { id: 6, start: 4, end: 8,  name: "G" },
  { id: 7, start: 7, end: 9,  name: "H" },
  { id: 8, start: 9, end: 11, name: "I" },
];

// ── Fractional Knapsack ────────────────────────────────────────────────────────

export interface FKItem { id: number; name: string; weight: number; value: number; ratio: number; taken: number }

export interface FKStep extends Step {
  items: FKItem[];
  capacity: number;
  remaining: number;
  current: number | null;
  totalValue: number;
}

export function fractionalKnapsack(rawItems: { name: string; weight: number; value: number }[], capacity: number): FKStep[] {
  const steps: FKStep[] = [];
  const items: FKItem[] = rawItems
    .map((it, i) => ({ id: i, name: it.name, weight: it.weight, value: it.value, ratio: it.value / it.weight, taken: 0 }))
    .sort((a, b) => b.ratio - a.ratio);

  let remaining = capacity;
  let totalValue = 0;

  const snap = (current: number | null, hl: number, expl: string, phase?: string): FKStep => ({
    items: items.map(it => ({ ...it })),
    capacity, remaining, current, totalValue,
    highlightLine: hl, explanation: expl, phase,
  });

  steps.push(snap(null, 0, `Sort items by value/weight ratio (descending). Greedy: always take from most valuable per kg.`));

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (remaining <= 0) {
      steps.push(snap(i, 6, `Knapsack full (remaining = 0). Stop.`, "found"));
      break;
    }

    steps.push(snap(i, 2, `Consider ${item.name}: weight=${item.weight}, value=${item.value}, ratio=${item.ratio.toFixed(2)}. Remaining capacity: ${remaining.toFixed(1)}.`, "default"));

    if (item.weight <= remaining) {
      item.taken = item.weight;
      totalValue += item.value;
      remaining -= item.weight;
      steps.push(snap(i, 3, `Take all of ${item.name} (${item.weight} kg, +${item.value} value). Remaining: ${remaining.toFixed(1)}.`, "found"));
    } else {
      const fraction = remaining / item.weight;
      const gained = fraction * item.value;
      item.taken = remaining;
      totalValue += gained;
      remaining = 0;
      steps.push(snap(i, 4, `Take ${(fraction * 100).toFixed(1)}% of ${item.name} (${item.taken.toFixed(1)} kg, +${gained.toFixed(1)} value). Knapsack full!`, "insert"));
    }
  }

  steps.push(snap(null, 7, `Done! Total value = ${totalValue.toFixed(2)} (optimal for fractional knapsack).`, "found"));
  return steps;
}

export const DEFAULT_FK_ITEMS = [
  { name: "Gold",    weight: 10, value: 60  },
  { name: "Silver",  weight: 20, value: 100 },
  { name: "Bronze",  weight: 30, value: 120 },
];
export const DEFAULT_FK_CAPACITY = 50;

// ── Huffman Coding ────────────────────────────────────────────────────────────

export interface HuffNode { id: string; char: string; freq: number; left?: string; right?: string; code: string; depth: number }

export interface HuffmanStep extends Step {
  nodes: Record<string, HuffNode>;
  heap: string[];
  codes: Record<string, string>;
  root?: string;
  merging?: [string, string];
  newNode?: string;
}

let huffIdCounter = 0;
const newHuffId = () => `h${huffIdCounter++}`;

export function huffmanCoding(freqs: Record<string, number>): HuffmanStep[] {
  huffIdCounter = 0;
  const steps: HuffmanStep[] = [];
  const nodes: Record<string, HuffNode> = {};

  // Create leaf nodes
  for (const [char, freq] of Object.entries(freqs)) {
    const id = newHuffId();
    nodes[id] = { id, char, freq, code: "", depth: 0 };
  }

  let heap = Object.keys(nodes).sort((a, b) => nodes[a].freq - nodes[b].freq);

  const snap = (hl: number, expl: string, merging?: [string, string], newNode?: string, phase?: string): HuffmanStep => ({
    nodes: JSON.parse(JSON.stringify(nodes)),
    heap: [...heap],
    codes: {},
    root: heap.length === 1 ? heap[0] : undefined,
    merging, newNode,
    highlightLine: hl, explanation: expl, phase,
  });

  steps.push(snap(0, `Build min-heap from characters. Heap: [${heap.map(id => `${nodes[id].char}(${nodes[id].freq})`).join(", ")}].`));

  while (heap.length > 1) {
    const left = heap.shift()!;
    const right = heap.shift()!;
    const nl = nodes[left], nr = nodes[right];

    steps.push(snap(2, `Extract two minimums: ${nl.char}(${nl.freq}) + ${nr.char}(${nr.freq}) = ${nl.freq + nr.freq}.`, [left, right], undefined, "default"));

    const newId = newHuffId();
    const combined = nl.freq + nr.freq;
    nodes[newId] = { id: newId, char: `${nl.char}+${nr.char}`, freq: combined, left, right, code: "", depth: 0 };

    // Insert into heap in sorted position
    let inserted = false;
    for (let i = 0; i < heap.length; i++) {
      if (nodes[heap[i]].freq >= combined) {
        heap.splice(i, 0, newId);
        inserted = true;
        break;
      }
    }
    if (!inserted) heap.push(newId);

    steps.push(snap(3, `Create internal node(${combined}). Heap: [${heap.map(id => `${nodes[id].freq}`).join(", ")}].`, [left, right], newId, "insert"));
  }

  // Assign codes via DFS
  const codes: Record<string, string> = {};
  const assignCodes = (id: string, code: string) => {
    const node = nodes[id];
    node.code = code;
    if (!node.left && !node.right) {
      codes[node.char] = code || "0";
    } else {
      if (node.left)  assignCodes(node.left,  code + "0");
      if (node.right) assignCodes(node.right, code + "1");
    }
  };
  if (heap[0]) assignCodes(heap[0], "");

  const lastStep = snap(5, `Huffman tree complete! Codes: ${Object.entries(codes).map(([c, cd]) => `${c}=${cd}`).join(", ")}.`, undefined, undefined, "found");
  lastStep.codes = codes;
  lastStep.root = heap[0];
  steps.push(lastStep);

  return steps;
}

export const DEFAULT_HUFFMAN_FREQS: Record<string, number> = { a: 5, b: 9, c: 12, d: 13, e: 16, f: 45 };

// ── Job Sequencing ────────────────────────────────────────────────────────────

export interface Job { id: string; deadline: number; profit: number }

export interface JobStep extends Step {
  jobs: Job[];
  slots: (string | null)[];
  current: string | null;
  totalProfit: number;
  selectedJobs: string[];
}

export function jobSequencing(rawJobs: Job[]): JobStep[] {
  const steps: JobStep[] = [];
  const jobs = [...rawJobs].sort((a, b) => b.profit - a.profit);
  const maxDeadline = Math.max(...jobs.map(j => j.deadline));
  const slots: (string | null)[] = new Array(maxDeadline).fill(null);
  const selectedJobs: string[] = [];
  let totalProfit = 0;

  const snap = (current: string | null, hl: number, expl: string, phase?: string): JobStep => ({
    jobs, slots: [...slots], current, totalProfit, selectedJobs: [...selectedJobs],
    highlightLine: hl, explanation: expl, phase,
  });

  steps.push(snap(null, 0, `Sort jobs by profit (desc). Max deadline = ${maxDeadline} → create ${maxDeadline} time slots.`));

  for (const job of jobs) {
    steps.push(snap(job.id, 2, `Consider job ${job.id}: deadline=${job.deadline}, profit=${job.profit}. Find latest free slot ≤ deadline.`, "default"));

    let placed = false;
    for (let s = job.deadline - 1; s >= 0; s--) {
      if (!slots[s]) {
        slots[s] = job.id;
        selectedJobs.push(job.id);
        totalProfit += job.profit;
        steps.push(snap(job.id, 3, `Place ${job.id} in slot ${s + 1}. Profit += ${job.profit} = ${totalProfit}.`, "found"));
        placed = true;
        break;
      }
    }
    if (!placed) {
      steps.push(snap(job.id, 4, `No free slot for ${job.id} before deadline ${job.deadline}. Skip.`, "error"));
    }
  }

  steps.push(snap(null, 5, `Done! Schedule: [${slots.map((s, i) => `slot${i + 1}=${s ?? "–"}`).join(", ")}]. Total profit = ${totalProfit}.`, "found"));
  return steps;
}

export const DEFAULT_JOBS: Job[] = [
  { id: "J1", deadline: 2, profit: 100 },
  { id: "J2", deadline: 1, profit: 19  },
  { id: "J3", deadline: 2, profit: 27  },
  { id: "J4", deadline: 1, profit: 25  },
  { id: "J5", deadline: 3, profit: 15  },
];

// ── Greedy vs DP (Coin Change) ────────────────────────────────────────────────

export interface GreedyVsDPStep extends Step {
  coins: number[];
  target: number;
  greedyPicked: number[];
  greedyRemaining: number;
  greedyCurrent: number | null;
  dpTable: number[];
  dpI: number;
  dpJ: number;
  subPhase: "greedy" | "dp" | "compare";
}

const GV_INF = 99999;

export function greedyVsDP(coins: number[], target: number): GreedyVsDPStep[] {
  const steps: GreedyVsDPStep[] = [];
  const sortedCoins = [...coins].sort((a, b) => b - a);
  const dpTable = new Array(target + 1).fill(GV_INF);
  dpTable[0] = 0;

  let greedyPicked: number[] = [];
  let greedyRemaining = target;
  let greedyCurrent: number | null = null;
  let dpI = 0, dpJ = 0;

  const snap = (hl: number, expl: string, subPhase: GreedyVsDPStep["subPhase"], phase?: string): GreedyVsDPStep => ({
    coins: sortedCoins, target,
    greedyPicked: [...greedyPicked], greedyRemaining, greedyCurrent,
    dpTable: [...dpTable], dpI, dpJ,
    subPhase, highlightLine: hl, explanation: expl, phase,
  });

  steps.push(snap(0, `Coins: [${sortedCoins.join(", ")}], Target: ${target}. Greedy picks largest coin ≤ remaining. DP finds global optimum.`, "greedy"));

  // ── Greedy phase ──
  steps.push(snap(1, `GREEDY: Start with remaining = ${target}. Sort coins largest first: [${sortedCoins.join(", ")}].`, "greedy"));

  while (greedyRemaining > 0) {
    const coin = sortedCoins.find(c => c <= greedyRemaining);
    if (!coin) break;
    greedyCurrent = coin;
    steps.push(snap(2, `GREEDY: Pick largest coin ≤ ${greedyRemaining}: coin=${coin}. Remaining: ${greedyRemaining} → ${greedyRemaining - coin}.`, "greedy", "default"));
    greedyPicked.push(coin);
    greedyRemaining -= coin;
  }
  greedyCurrent = null;
  const greedyWorked = greedyRemaining === 0;
  steps.push(snap(3, `GREEDY done. Used ${greedyPicked.length} coins: [${greedyPicked.join(", ")}]. ${greedyWorked ? "" : "Could not reach target exactly!"}`, "greedy", greedyWorked ? "found" : "error"));

  // ── DP phase ──
  steps.push(snap(4, `DP: Fill dp[0..${target}]. dp[0]=0, all others=∞. For each amount try every coin.`, "dp"));

  for (let i = 1; i <= target; i++) {
    dpI = i;
    for (let j = 0; j < sortedCoins.length; j++) {
      dpJ = j;
      const c = sortedCoins[j];
      if (c <= i && dpTable[i - c] !== GV_INF) {
        const candidate = dpTable[i - c] + 1;
        if (candidate < dpTable[i]) {
          dpTable[i] = candidate;
          steps.push(snap(5, `DP: dp[${i}] = min(dp[${i}], dp[${i}-${c}]+1) = min(${dpTable[i]}, ${dpTable[i - c] + 1 - 1}+1) → ${candidate}. Better!`, "dp", "insert"));
        }
      }
    }
  }

  dpI = target; dpJ = -1;
  const dpResult = dpTable[target];
  steps.push(snap(6, `DP done. dp[${target}] = ${dpResult === GV_INF ? "impossible" : dpResult + " coins"}.`, "dp", "found"));

  // ── Compare phase ──
  const greedyCoins = greedyWorked ? greedyPicked.length : -1;
  const dpCoins = dpResult === GV_INF ? -1 : dpResult;
  const betterBy = greedyCoins - dpCoins;

  steps.push(snap(7, `COMPARE: Greedy = ${greedyCoins === -1 ? "failed" : greedyCoins + " coins [" + greedyPicked.join(", ") + "]"}. DP = ${dpCoins === -1 ? "impossible" : dpCoins + " coins"}. ${betterBy > 0 ? `DP uses ${betterBy} fewer coin${betterBy > 1 ? "s" : ""}!` : betterBy === 0 ? "Same result here." : "Greedy matches DP here."}`, "compare", betterBy > 0 ? "error" : "found"));

  return steps;
}

// ── Code panels ───────────────────────────────────────────────────────────────

export const GREEDY_CODE: Record<string, string[]> = {
  activitySelection: [
    "sort activities by finish time;",
    "lastEnd = 0; selected = [];",
    "for each activity a:",
    "  if a.start >= lastEnd:",
    "    selected.push(a); lastEnd = a.end;",
    "  else: reject a;",
    "return selected;",
  ],
  fractionalKnapsack: [
    "sort items by value/weight ratio (desc);",
    "remaining = capacity; value = 0;",
    "for each item i (sorted):",
    "  if i.weight <= remaining:",
    "    take all of i; value += i.value;",
    "  else: take remaining/i.weight fraction;",
    "    value += fraction*i.value; break;",
    "return value;",
  ],
  huffman: [
    "create leaf node for each char;",
    "push all into min-heap by frequency;",
    "while heap.size > 1:",
    "  left = heap.extractMin();",
    "  right = heap.extractMin();",
    "  merged = new Node(left.freq+right.freq);",
    "  merged.left=left; merged.right=right;",
    "  heap.insert(merged);",
    "root = heap.top;",
    "assignCodes(root, '');",
  ],
  jobSequencing: [
    "sort jobs by profit (desc);",
    "slots = new Array(maxDeadline).fill(null);",
    "for each job j:",
    "  for s = j.deadline-1 downto 0:",
    "    if slots[s] == null:",
    "      slots[s] = j; profit += j.profit; break;",
    "    else: skip slot;",
    "return slots, totalProfit;",
  ],
  greedyVsDP: [
    "// Both solve: min coins to make target",
    "// GREEDY: largest coin first",
    "while remaining > 0: pick max coin ≤ remaining;",
    "// GREEDY result",
    "// DP: fill table optimally",
    "dp[i] = min(dp[i], dp[i-coin]+1);",
    "// DP result",
    "// Compare: greedy can be sub-optimal!",
  ],
};

export const GREEDY_ANNOTATIONS: Record<string, Record<number, string>> = {
  activitySelection: {
    0: "Key insight: earliest-finishing activity leaves maximum room for future activities.",
    2: "Each activity is O(1) to evaluate — total O(n) after the O(n log n) sort.",
    3: "Non-overlapping condition: new activity must start after last selected one ends.",
    4: "Greedy exchange argument: any other selection cannot have more activities.",
  },
  fractionalKnapsack: {
    0: "Value density = value/weight. Taking highest density first maximizes value per unit weight.",
    3: "Greedy is optimal here because we can take fractions — unlike 0/1 knapsack.",
    4: "Fractional choice: take the most valuable remainder to fill the knapsack.",
    7: "Proof: any deviation from this greedy order yields lower total value.",
  },
  huffman: {
    1: "Min-heap gives O(log n) extract and insert. Total: O(n log n).",
    2: "Always merge the two least frequent nodes — reduces expected code length.",
    5: "Internal node frequency = sum of children. This builds the optimal prefix tree.",
    9: "Left child = 0, right child = 1. Leaf depth = code length = bits per char.",
  },
  jobSequencing: {
    0: "Greedy choice: high-profit jobs should be scheduled first.",
    3: "Assign as late as possible (just before deadline) to leave early slots for other jobs.",
    4: "No free slot before deadline: this job cannot be scheduled.",
    7: "Time complexity: O(n²) naive, O(n log n) with union-find optimization.",
  },
  greedyVsDP: {
    2: "Greedy is locally optimal but not globally optimal for arbitrary coin systems.",
    5: "DP tries all coin denominations at each amount — guaranteed global optimum.",
    7: "Greedy fails when a medium coin combination beats the greedy large-coin choice.",
  },
};

export const GREEDY_COMPLEXITY: Record<string, { time: string; space: string; note: string }> = {
  activitySelection: {
    time: "O(n log n)",
    space: "O(n)",
    note: "Sort + single scan. Greedy exchange argument proves optimality. Classic example of greedy correctness.",
  },
  fractionalKnapsack: {
    time: "O(n log n)",
    space: "O(n)",
    note: "Greedy is optimal for fractional knapsack. Fails for 0/1 knapsack — must use DP instead.",
  },
  huffman: {
    time: "O(n log n)",
    space: "O(n)",
    note: "n merges, each costing O(log n) heap ops. Produces provably optimal prefix-free code (Shannon entropy lower bound).",
  },
  jobSequencing: {
    time: "O(n²)",
    space: "O(n)",
    note: "Naive: O(n²) — for each job scan slots backward. Optimizable to O(n log n) using DSU to find nearest free slot.",
  },
  greedyVsDP: {
    time: "Greedy O(target), DP O(target·coins)",
    space: "Greedy O(1), DP O(target)",
    note: "Greedy coin change only works for canonical coin systems (e.g. 1,5,10,25). DP always finds the optimum.",
  },
};
