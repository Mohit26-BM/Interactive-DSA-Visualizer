import { Step } from "./types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SearchState { arr: number[]; }
export interface SearchStep extends Step {
  state: SearchState;
  comparingIndices: number[];
  foundIndex?: number;
  low?: number;
  high?: number;
  mid?: number;
}

// ─── ID counter ───────────────────────────────────────────────────────────────

let idCounter = 0;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _newId = () => `search-${idCounter++}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cloneSearch(s: SearchState): SearchState {
  return { arr: [...s.arr] };
}

function st(
  s: SearchState,
  explanation: string,
  hl: number,
  comparing: number[] = [],
  phase?: string,
  foundIndex?: number,
  low?: number,
  high?: number,
  mid?: number
): SearchStep {
  return {
    state: cloneSearch(s),
    explanation,
    highlightLine: hl,
    comparingIndices: comparing,
    phase,
    foundIndex,
    low,
    high,
    mid,
  };
}

// ─── Linear Search ────────────────────────────────────────────────────────────

export function linearSearch(arr: number[], target: number): SearchStep[] {
  const steps: SearchStep[] = [];
  const s: SearchState = { arr: [...arr] };

  steps.push(st(s, `Linear Search for ${target} in array of ${arr.length} elements.`, 1));

  for (let i = 0; i < s.arr.length; i++) {
    steps.push(st(s, `Check index ${i}: arr[${i}] = ${s.arr[i]}.`, 3, [i], "default"));
    if (s.arr[i] === target) {
      steps.push(st(s, `Found ${target} at index ${i}!`, 4, [i], "found", i));
      return steps;
    }
    steps.push(st(s, `${s.arr[i]} ≠ ${target}. Move right.`, 5, [i], "default"));
  }

  steps.push(st(s, `${target} not found. Scanned all ${arr.length} elements.`, 6, [], "error"));
  return steps;
}

// ─── Binary Search ────────────────────────────────────────────────────────────

export function binarySearch(arr: number[], target: number): SearchStep[] {
  const steps: SearchStep[] = [];
  const s: SearchState = { arr: [...arr] };

  steps.push(st(s, `Binary Search for ${target}. Array must be sorted. Initial: low=0, high=${arr.length - 1}.`, 1, [], "default", undefined, 0, arr.length - 1));

  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    steps.push(st(s, `low=${low}, high=${high}, mid=${mid}. Check arr[${mid}]=${s.arr[mid]}.`, 3, [mid], "default", undefined, low, high, mid));

    if (s.arr[mid] === target) {
      steps.push(st(s, `Found ${target} at index ${mid}! Binary search: O(log n).`, 4, [mid], "found", mid, low, high, mid));
      return steps;
    } else if (s.arr[mid] < target) {
      steps.push(st(s, `arr[${mid}]=${s.arr[mid]} < ${target}. Target is in right half. Set low = ${mid + 1}.`, 5, [mid], "default", undefined, mid + 1, high, mid));
      low = mid + 1;
    } else {
      steps.push(st(s, `arr[${mid}]=${s.arr[mid]} > ${target}. Target is in left half. Set high = ${mid - 1}.`, 6, [mid], "default", undefined, low, mid - 1, mid));
      high = mid - 1;
    }
  }

  steps.push(st(s, `${target} not found. Search space exhausted (low=${low} > high=${high}).`, 7, [], "error", undefined, low, high));
  return steps;
}

// ─── Jump Search ──────────────────────────────────────────────────────────────

export function jumpSearch(arr: number[], target: number): SearchStep[] {
  const steps: SearchStep[] = [];
  const s: SearchState = { arr: [...arr] };
  const n = arr.length;
  const jumpSize = Math.floor(Math.sqrt(n));

  steps.push(st(s, `Jump Search for ${target}. Array must be sorted. Jump size = ⌊√${n}⌋ = ${jumpSize}.`, 1));

  let prev = 0;
  let curr = 0;

  // Jump phase: find the block where target might be
  while (curr < n && s.arr[Math.min(curr, n - 1)] < target) {
    steps.push(st(s, `Jump to index ${Math.min(curr, n - 1)}: arr[${Math.min(curr, n - 1)}]=${s.arr[Math.min(curr, n - 1)]} < ${target}. Jump ahead.`, 3, [Math.min(curr, n - 1)], "default"));
    prev = curr;
    curr += jumpSize;
  }

  steps.push(st(s, `Block found: search linearly from index ${prev} to ${Math.min(curr, n - 1)}.`, 5, Array.from({ length: Math.min(curr, n - 1) - prev + 1 }, (_, i) => prev + i), "default"));

  // Linear scan in the block
  for (let i = prev; i <= Math.min(curr, n - 1); i++) {
    steps.push(st(s, `Check index ${i}: arr[${i}]=${s.arr[i]}.`, 6, [i], "default"));
    if (s.arr[i] === target) {
      steps.push(st(s, `Found ${target} at index ${i}!`, 7, [i], "found", i));
      return steps;
    }
    if (s.arr[i] > target) {
      steps.push(st(s, `arr[${i}]=${s.arr[i]} > ${target}. Target not in this block.`, 8, [i], "error"));
      break;
    }
  }

  // Check if we're past the array
  if (prev >= n) {
    steps.push(st(s, `${target} not found. All blocks checked.`, 9, [], "error"));
    return steps;
  }

  steps.push(st(s, `${target} not found after linear scan of block [${prev}..${Math.min(curr, n - 1)}].`, 9, [], "error"));
  return steps;
}

// ─── Pseudocode ───────────────────────────────────────────────────────────────

export const SEARCH_CODE: Record<string, string[]> = {
  linearSearch: [
    "function linearSearch(arr, target) {",
    "  // Scan each element one by one",
    "  for (let i = 0; i < arr.length; i++) {",
    "    if (arr[i] === target)",
    "      return i; // found at index i",
    "    // continue scanning",
    "  }",
    "  return -1; // not found",
    "}",
  ],
  binarySearch: [
    "function binarySearch(arr, target) {",
    "  // Requires sorted array",
    "  let low = 0, high = arr.length - 1;",
    "  while (low <= high) {",
    "    const mid = (low + high) >> 1;",
    "    if (arr[mid] === target) return mid;",
    "    else if (arr[mid] < target) low = mid+1;",
    "    else high = mid - 1;",
    "  }",
    "  return -1; // search space exhausted",
    "}",
  ],
  jumpSearch: [
    "function jumpSearch(arr, target) {",
    "  // Requires sorted array",
    "  const step = Math.floor(Math.sqrt(n));",
    "  while (arr[min(curr,n-1)] < target)",
    "    prev = curr; curr += step;",
    "  // linear scan in block [prev..curr]",
    "  for (let i = prev; i <= min(curr,n-1); i++)",
    "    if (arr[i] === target) return i;",
    "    else if (arr[i] > target) break;",
    "  return -1;",
    "}",
  ],
};

export const SEARCH_ANNOTATIONS: Record<string, Record<number, string>> = {
  linearSearch: {
    3: "for loop visits every element from left to right — O(n) in the worst case.",
    4: "If found, return immediately. Best case O(1) when target is at index 0.",
    7: "Return -1 (sentinel for 'not found') after exhausting all elements.",
  },
  binarySearch: {
    2: "Precondition: array must be sorted. Binary search on unsorted data gives wrong results.",
    4: "Loop invariant: target, if present, is always in arr[low..high].",
    5: "mid = (low+high)>>1 is equivalent to Math.floor((low+high)/2) but avoids overflow.",
    6: "Compare mid: equal → found, less → go right, greater → go left.",
    8: "Each iteration halves the search space → O(log n) comparisons total.",
  },
  jumpSearch: {
    3: "Jump size √n balances jumping (too big = miss target) and linear scan (too small = just linear search).",
    4: "Jump phase: skip blocks until we find one that could contain the target.",
    6: "Linear phase: scan backward in the block at most √n elements → O(√n) total.",
    8: "Early termination: if arr[i] > target, target cannot be in this block (array is sorted).",
  },
};

export const SEARCH_COMPLEXITY: Record<string, { time: string; space: string; note: string }> = {
  linearSearch: { time: "O(n)",    space: "O(1)", note: "Works on unsorted arrays. Best O(1) when target is first element." },
  binarySearch: { time: "O(log n)", space: "O(1)", note: "Requires sorted array. Halves search space each step." },
  jumpSearch:   { time: "O(√n)",   space: "O(1)", note: "Between linear and binary. Optimal jump size = √n." },
};
