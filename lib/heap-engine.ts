import { Step } from "./types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type HeapType = "min" | "max";

export interface HeapState {
  arr: number[];
  heapType: HeapType;
}

export interface HeapStep extends Step {
  state: HeapState;
  highlightIndices: number[];
  heapSize?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parent(i: number): number { return Math.floor((i - 1) / 2); }
function left(i: number): number { return 2 * i + 1; }
function right(i: number): number { return 2 * i + 2; }

function cloneState(s: HeapState): HeapState {
  return { arr: [...s.arr], heapType: s.heapType };
}

function st(s: HeapState, explanation: string, hl: number, hi: number[] = [], phase?: string, heapSize?: number): HeapStep {
  return { state: cloneState(s), explanation, highlightLine: hl, highlightIndices: hi, phase, heapSize };
}

function hasHigherPriority(a: number, b: number, type: HeapType): boolean {
  return type === "min" ? a < b : a > b;
}

function siftUp(arr: number[], i: number, type: HeapType, steps: HeapStep[], state: HeapState): void {
  while (i > 0) {
    const p = parent(i);
    steps.push(st(state, `siftUp: Compare arr[${i}]=${arr[i]} with parent arr[${p}]=${arr[p]}.`, 4, [i, p]));
    if (hasHigherPriority(arr[i], arr[p], type)) {
      steps.push(st(state, `arr[${i}]=${arr[i]} has higher priority than parent arr[${p}]=${arr[p]}. Swap.`, 5, [i, p], "insert"));
      const tmp = arr[i]; arr[i] = arr[p]; arr[p] = tmp;
      state.arr = [...arr];
      steps.push(st(state, `Swapped. arr[${p}]=${arr[p]}, arr[${i}]=${arr[i]}. Move up.`, 6, [p], "insert"));
      i = p;
    } else {
      steps.push(st(state, `arr[${i}]=${arr[i]} does NOT have higher priority than parent. Heap property satisfied.`, 7, [i, p], "found"));
      break;
    }
  }
  if (i === 0) {
    steps.push(st(state, `Reached root. siftUp complete.`, 7, [0], "found"));
  }
}

function siftDown(arr: number[], i: number, size: number, type: HeapType, steps: HeapStep[], state: HeapState): void {
  while (true) {
    let target = i;
    const l = left(i);
    const r = right(i);

    if (l < size && hasHigherPriority(arr[l], arr[target], type)) target = l;
    if (r < size && hasHigherPriority(arr[r], arr[target], type)) target = r;

    if (target !== i) {
      steps.push(st(state, `siftDown: arr[${target}]=${arr[target]} has higher priority than arr[${i}]=${arr[i]}. Swap.`, 9, [i, target, l < size ? l : -1, r < size ? r : -1].filter(x => x >= 0), "delete"));
      const tmp = arr[i]; arr[i] = arr[target]; arr[target] = tmp;
      state.arr = [...arr];
      steps.push(st(state, `Swapped arr[${i}]=${arr[i]} and arr[${target}]=${arr[target]}. Continue down.`, 10, [target], "delete"));
      i = target;
    } else {
      steps.push(st(state, `arr[${i}]=${arr[i]} has higher priority than both children (or no children). Heap property satisfied.`, 11, [i], "found"));
      break;
    }
  }
}

// ─── Operations ───────────────────────────────────────────────────────────────

export function heapInsert(values: number[], value: number, type: HeapType): HeapStep[] {
  const steps: HeapStep[] = [];
  const arr = [...values];
  const state: HeapState = { arr: [...arr], heapType: type };

  steps.push(st(state, `Insert ${value} into ${type} heap. Current size: ${arr.length}.`, 1));

  arr.push(value);
  state.arr = [...arr];
  steps.push(st(state, `Append ${value} at index ${arr.length - 1} (end of array). Heap might be temporarily invalid.`, 2, [arr.length - 1], "insert"));
  steps.push(st(state, `Now siftUp from index ${arr.length - 1} to restore heap property.`, 3, [arr.length - 1]));

  siftUp(arr, arr.length - 1, type, steps, state);

  steps.push(st(state, `Insert complete. Heap size: ${arr.length}. ${type === "min" ? "Min" : "Max"} heap property restored.`, 8, [], "found"));
  return steps;
}

export function heapExtract(values: number[], type: HeapType): HeapStep[] {
  const steps: HeapStep[] = [];
  const arr = [...values];
  const state: HeapState = { arr: [...arr], heapType: type };

  steps.push(st(state, `Extract ${type === "min" ? "minimum" : "maximum"} from heap. Root is arr[0]=${arr[0]}.`, 1, [0]));

  if (arr.length === 0) {
    steps.push(st(state, `Heap is empty. Nothing to extract.`, 2, [], "error"));
    return steps;
  }

  const extracted = arr[0];
  steps.push(st(state, `Remove root arr[0]=${extracted}. Move last element arr[${arr.length - 1}]=${arr[arr.length - 1]} to root.`, 3, [0, arr.length - 1], "delete"));

  arr[0] = arr[arr.length - 1];
  arr.pop();
  state.arr = [...arr];
  steps.push(st(state, `Root is now arr[0]=${arr[0]}. Heap property may be violated. Begin siftDown.`, 4, [0]));

  if (arr.length > 0) {
    siftDown(arr, 0, arr.length, type, steps, state);
  }

  steps.push(st(state, `Extract complete. Removed ${extracted}. Remaining heap size: ${arr.length}.`, 12, [], "found"));
  return steps;
}

export function heapPeek(values: number[], type: HeapType): HeapStep[] {
  const steps: HeapStep[] = [];
  const arr = [...values];
  const state: HeapState = { arr: [...arr], heapType: type };

  steps.push(st(state, `Peek: examine the ${type === "min" ? "minimum" : "maximum"} without removing it.`, 1));

  if (arr.length === 0) {
    steps.push(st(state, `Heap is empty. Nothing to peek.`, 2, [], "error"));
    return steps;
  }

  steps.push(st(state, `Root arr[0]=${arr[0]} is always the ${type === "min" ? "minimum" : "maximum"} in a ${type} heap.`, 3, [0], "found"));
  steps.push(st(state, `Peek is O(1) — root access, no traversal needed.`, 4, [0], "found"));
  return steps;
}

export function heapBuildHeap(values: number[], type: HeapType): HeapStep[] {
  const steps: HeapStep[] = [];
  const arr = [...values];
  const state: HeapState = { arr: [...arr], heapType: type };

  steps.push(st(state, `Build ${type} heap from array of ${arr.length} elements using Floyd's algorithm.`, 1));
  steps.push(st(state, `Floyd's: start from last non-leaf (index ${Math.floor(arr.length / 2) - 1}) and siftDown each node. O(n) total.`, 2));

  const start = Math.floor(arr.length / 2) - 1;
  steps.push(st(state, `Last non-leaf index = floor(n/2) - 1 = floor(${arr.length}/2) - 1 = ${start}.`, 3, [start]));

  for (let i = start; i >= 0; i--) {
    steps.push(st(state, `Process index ${i} (value=${arr[i]}). siftDown to restore heap property for subtree rooted at ${i}.`, 4, [i]));
    siftDown(arr, i, arr.length, type, steps, state);
  }

  steps.push(st(state, `BuildHeap complete. ${type === "min" ? "Min" : "Max"} heap constructed in O(n) time.`, 5, [0], "found"));
  return steps;
}

export function heapSort(values: number[]): HeapStep[] {
  const steps: HeapStep[] = [];
  const arr = [...values];
  const state: HeapState = { arr: [...arr], heapType: "max" };

  steps.push(st(state, `HeapSort: Phase 1 — build max heap from array.`, 1, [], undefined, arr.length));

  // Phase 1: Build max heap
  const start = Math.floor(arr.length / 2) - 1;
  for (let i = start; i >= 0; i--) {
    siftDown(arr, i, arr.length, "max", steps, state);
  }

  state.arr = [...arr];
  steps.push(st(state, `Max heap built. arr[0]=${arr[0]} is maximum. Phase 2: repeatedly extract max.`, 2, [0], "found", arr.length));

  // Phase 2: Extract elements
  let heapSize = arr.length;
  while (heapSize > 1) {
    steps.push(st(state, `Swap root arr[0]=${arr[0]} with last heap element arr[${heapSize - 1}]=${arr[heapSize - 1]}. Shrink heap.`, 3, [0, heapSize - 1], "delete", heapSize));
    const tmp = arr[0]; arr[0] = arr[heapSize - 1]; arr[heapSize - 1] = tmp;
    heapSize--;
    state.arr = [...arr];
    steps.push(st(state, `arr[${heapSize}]=${arr[heapSize]} is now sorted (index ≥ heapSize). siftDown root to restore max heap.`, 4, [0], undefined, heapSize));
    siftDown(arr, 0, heapSize, "max", steps, state);
  }

  state.arr = [...arr];
  steps.push(st(state, `HeapSort complete! Array sorted ascending: [${arr.join(", ")}].`, 5, arr.map((_, i) => i), "found", 0));
  return steps;
}

// ─── Pseudocode ───────────────────────────────────────────────────────────────

export const HEAP_CODE: Record<string, string[]> = {
  insert: [
    "function insert(value) {",
    "  heap.push(value);          // add to end",
    "  i = heap.length - 1;",
    "  while (i > 0 && heap[i] has higher priority than heap[parent(i)]) {",
    "    if (needsSwap(heap[i], heap[parent(i)])) {",
    "      swap(heap[i], heap[parent(i)]);",
    "      i = parent(i);",
    "    } else break;            // heap property restored",
    "  }",
    "}",
  ],
  extract: [
    "function extract() {",
    "  if (heap.empty) return null;",
    "  root = heap[0];            // save result",
    "  heap[0] = heap[last];      // move last to root",
    "  heap.pop();                // remove last",
    "  siftDown(0);               // restore heap property",
    "  return root;",
    "  // O(log n) — siftDown height times",
    "  // siftDown: swap with higher-priority child",
    "  // until no child has higher priority",
    "  // heap stays complete binary tree",
    "  return root;",
    "}",
  ],
  peek: [
    "function peek() {",
    "  if (heap.empty) return null;",
    "  return heap[0];  // root is always min/max",
    "  // O(1) — no traversal needed",
    "}",
  ],
  buildHeap: [
    "function buildHeap(arr) {",
    "  // Floyd's O(n) algorithm — start from last non-leaf",
    "  start = floor(n/2) - 1;   // last non-leaf index",
    "  for i from start down to 0:",
    "    siftDown(i);             // fix each subtree",
    "  // Total: O(n) due to amortized siftDown depths",
    "}",
  ],
  heapSort: [
    "function heapSort(arr) {",
    "  buildMaxHeap(arr);         // Phase 1: O(n)",
    "  for i from n-1 down to 1: // Phase 2: O(n log n)",
    "    swap(arr[0], arr[i]);    // max to sorted position",
    "    heapSize--;              // shrink heap boundary",
    "    siftDown(0, heapSize);   // restore max heap",
    "  // Result: arr sorted ascending",
    "}",
  ],
};

export const HEAP_ANNOTATIONS: Record<string, Record<number, string>> = {
  insert: {
    2: "Add to end maintains complete binary tree shape — heap is always a complete binary tree stored as array.",
    4: "siftUp: bubble new element upward. Each comparison with parent moves one level up → O(log n) worst case.",
    6: "Swap with parent when new element has higher priority. Priority = smaller value (min heap) or larger value (max heap).",
    8: "Stop swapping when parent has higher-or-equal priority. Heap property is now satisfied for entire tree.",
  },
  extract: {
    3: "Root is always the min (min-heap) or max (max-heap). O(1) access — that's the key advantage of a heap.",
    4: "Move last element to root to maintain complete binary tree structure. This temporarily violates heap property.",
    6: "siftDown restores heap property in O(log n): at each level, swap with the higher-priority child.",
    9: "siftDown direction: always swap with the MORE DOMINANT child (smaller for min, larger for max).",
  },
  peek: {
    3: "Root = heap[0] is ALWAYS the min (min-heap) or max (max-heap) by the heap property definition.",
    4: "O(1) peek is the heap's primary advantage over sorted arrays for priority queue operations.",
  },
  buildHeap: {
    2: "Floyd's algorithm: bottom-up construction. Starting from leaves is wasteful — they're already valid size-1 heaps.",
    3: "Last non-leaf = floor(n/2) - 1. Indices floor(n/2) through n-1 are all leaves (no children in heap).",
    4: "Process each internal node from bottom to top. siftDown each subtree root to merge valid sub-heaps.",
    6: "O(n) total: most nodes are near leaves with short siftDown paths. Sum of heights = O(n) by geometric series.",
  },
  heapSort: {
    2: "Phase 1 BuildMaxHeap: O(n). We use max-heap so largest ends up at root, ready to place at back.",
    3: "Phase 2: n-1 iterations. Each: O(log n) siftDown → total O(n log n). In-place, no extra array needed.",
    4: "Swap root (current max) with last unsorted element → places max in its final sorted position.",
    5: "Shrink virtual heap boundary — sorted suffix grows from right. Original array stores sorted result in-place.",
  },
};

export const HEAP_COMPLEXITY: Record<string, { time: string; space: string; note: string }> = {
  insert:    { time: "O(log n)", space: "O(1)", note: "siftUp: at most log n swaps up the tree height." },
  extract:   { time: "O(log n)", space: "O(1)", note: "siftDown: at most log n swaps down to a leaf." },
  peek:      { time: "O(1)",     space: "O(1)", note: "Root is always min/max — direct array[0] access." },
  buildHeap: { time: "O(n)",     space: "O(1)", note: "Floyd's algorithm: O(n) amortized via sum-of-heights proof." },
  heapSort:  { time: "O(n log n)", space: "O(1)", note: "O(n) build + O(n log n) extractions. In-place sort." },
};
