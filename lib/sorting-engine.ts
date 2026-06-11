import { Step } from "./types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SortState { arr: number[]; }
export interface SortStep extends Step {
  state: SortState;
  comparingIndices: number[];
  swappingIndices: number[];
  sortedIndices: number[];
  pivotIndex?: number;
}

// ─── ID counter ───────────────────────────────────────────────────────────────

let idCounter = 0;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _newId = () => `sort-${idCounter++}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cloneSort(s: SortState): SortState {
  return { arr: [...s.arr] };
}

function st(
  s: SortState,
  explanation: string,
  hl: number,
  comparing: number[] = [],
  swapping: number[] = [],
  sorted: number[] = [],
  phase?: string,
  pivot?: number
): SortStep {
  return {
    state: cloneSort(s),
    explanation,
    highlightLine: hl,
    comparingIndices: comparing,
    swappingIndices: swapping,
    sortedIndices: sorted,
    pivotIndex: pivot,
    phase,
  };
}

// ─── Bubble Sort ──────────────────────────────────────────────────────────────

export function bubbleSort(arr: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const s: SortState = { arr: [...arr] };
  const n = s.arr.length;
  const sorted: number[] = [];

  steps.push(st(s, `Bubble Sort: ${n} elements. Repeatedly swap adjacent pairs until sorted.`, 1));

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push(st(s, `Compare arr[${j}]=${s.arr[j]} and arr[${j + 1}]=${s.arr[j + 1]}.`, 4, [j, j + 1], [], sorted, "default"));
      if (s.arr[j] > s.arr[j + 1]) {
        steps.push(st(s, `${s.arr[j]} > ${s.arr[j + 1]} — swap!`, 5, [], [j, j + 1], sorted, "delete"));
        [s.arr[j], s.arr[j + 1]] = [s.arr[j + 1], s.arr[j]];
        steps.push(st(s, `Swapped. arr[${j}]=${s.arr[j]}, arr[${j + 1}]=${s.arr[j + 1]}.`, 5, [j, j + 1], [], sorted, "default"));
      } else {
        steps.push(st(s, `${s.arr[j]} <= ${s.arr[j + 1]} — no swap needed.`, 5, [j, j + 1], [], sorted, "default"));
      }
    }
    sorted.unshift(n - 1 - i);
    steps.push(st(s, `Pass ${i + 1} done. Element ${s.arr[n - 1 - i]} is in final position.`, 6, [], [], [...sorted], "found"));
  }
  sorted.unshift(0);
  steps.push(st(s, `Bubble Sort complete! Array is sorted.`, 7, [], [], Array.from({ length: n }, (_, i) => i), "found"));
  return steps;
}

// ─── Selection Sort ───────────────────────────────────────────────────────────

export function selectionSort(arr: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const s: SortState = { arr: [...arr] };
  const n = s.arr.length;
  const sorted: number[] = [];

  steps.push(st(s, `Selection Sort: ${n} elements. Find minimum each pass, place at front.`, 1));

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    steps.push(st(s, `Pass ${i + 1}: assume minimum is at index ${i} (value ${s.arr[i]}).`, 3, [i], [], sorted, "default"));

    for (let j = i + 1; j < n; j++) {
      steps.push(st(s, `Compare arr[${j}]=${s.arr[j]} with current min arr[${minIdx}]=${s.arr[minIdx]}.`, 4, [j, minIdx], [], sorted, "default"));
      if (s.arr[j] < s.arr[minIdx]) {
        minIdx = j;
        steps.push(st(s, `New minimum found at index ${j} (value ${s.arr[j]}).`, 5, [minIdx], [], sorted, "default"));
      }
    }

    if (minIdx !== i) {
      steps.push(st(s, `Swap arr[${i}]=${s.arr[i]} with min arr[${minIdx}]=${s.arr[minIdx]}.`, 6, [], [i, minIdx], sorted, "delete"));
      [s.arr[i], s.arr[minIdx]] = [s.arr[minIdx], s.arr[i]];
      steps.push(st(s, `Swapped. Index ${i} now has value ${s.arr[i]}.`, 6, [i], [], sorted, "default"));
    } else {
      steps.push(st(s, `Index ${i} already has the minimum. No swap needed.`, 6, [i], [], sorted, "default"));
    }
    sorted.push(i);
    steps.push(st(s, `Index ${i} is in final position (value ${s.arr[i]}).`, 7, [], [], [...sorted], "found"));
  }
  sorted.push(n - 1);
  steps.push(st(s, `Selection Sort complete!`, 8, [], [], Array.from({ length: n }, (_, i) => i), "found"));
  return steps;
}

// ─── Insertion Sort ───────────────────────────────────────────────────────────

export function insertionSort(arr: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const s: SortState = { arr: [...arr] };
  const n = s.arr.length;

  steps.push(st(s, `Insertion Sort: ${n} elements. Build sorted prefix by inserting each element.`, 1));
  steps.push(st(s, `Index 0 (value ${s.arr[0]}) is trivially sorted.`, 2, [0], [], [0], "found"));

  for (let i = 1; i < n; i++) {
    const key = s.arr[i];
    steps.push(st(s, `Pick key = arr[${i}] = ${key}. Insert into sorted prefix [0..${i - 1}].`, 3, [i], [], Array.from({ length: i }, (_, k) => k), "default"));

    let j = i - 1;
    while (j >= 0 && s.arr[j] > key) {
      steps.push(st(s, `arr[${j}]=${s.arr[j]} > ${key} — shift right.`, 5, [j, j + 1], [], Array.from({ length: i }, (_, k) => k), "insert"));
      s.arr[j + 1] = s.arr[j];
      j--;
      steps.push(st(s, `Shifted. Continue comparing.`, 5, [j + 1], [], Array.from({ length: i }, (_, k) => k), "default"));
    }

    s.arr[j + 1] = key;
    steps.push(st(s, `Place key ${key} at index ${j + 1}. Sorted prefix [0..${i}].`, 6, [j + 1], [], Array.from({ length: i + 1 }, (_, k) => k), "found"));
  }

  steps.push(st(s, `Insertion Sort complete!`, 7, [], [], Array.from({ length: n }, (_, i) => i), "found"));
  return steps;
}

// ─── Merge Sort ───────────────────────────────────────────────────────────────

export function mergeSort(arr: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const s: SortState = { arr: [...arr] };
  const n = s.arr.length;

  steps.push(st(s, `Merge Sort: ${n} elements. Divide and conquer — split, sort halves, merge.`, 1));

  function mergeSortHelper(start: number, end: number): void {
    if (end - start <= 1) {
      if (end - start === 1) {
        steps.push(st(s, `Base case: subarray [${start}..${end - 1}] has 1 element — already sorted.`, 3, [start], [], [], "default"));
      }
      return;
    }

    const mid = Math.floor((start + end) / 2);
    steps.push(st(s, `Split [${start}..${end - 1}] into [${start}..${mid - 1}] and [${mid}..${end - 1}].`, 4, Array.from({ length: end - start }, (_, i) => start + i), [], [], "default"));

    mergeSortHelper(start, mid);
    mergeSortHelper(mid, end);

    // Merge
    const left = s.arr.slice(start, mid);
    const right = s.arr.slice(mid, end);
    steps.push(st(s, `Merge [${left.join(",")}] and [${right.join(",")}] into sorted subarray.`, 6, Array.from({ length: end - start }, (_, i) => start + i), [], [], "default"));

    let li = 0, ri = 0, wi = start;
    while (li < left.length && ri < right.length) {
      steps.push(st(s, `Compare left[${li}]=${left[li]} and right[${ri}]=${right[ri]}.`, 7, [start + li, mid + ri], [], [], "default"));
      if (left[li] <= right[ri]) {
        s.arr[wi++] = left[li++];
      } else {
        s.arr[wi++] = right[ri++];
      }
      steps.push(st(s, `Placed ${s.arr[wi - 1]} at index ${wi - 1}.`, 8, [wi - 1], [], [], "insert"));
    }
    while (li < left.length) {
      s.arr[wi++] = left[li++];
      steps.push(st(s, `Copy remaining left: ${s.arr[wi - 1]} at index ${wi - 1}.`, 9, [wi - 1], [], [], "insert"));
    }
    while (ri < right.length) {
      s.arr[wi++] = right[ri++];
      steps.push(st(s, `Copy remaining right: ${s.arr[wi - 1]} at index ${wi - 1}.`, 9, [wi - 1], [], [], "insert"));
    }

    const sortedRange = Array.from({ length: end - start }, (_, i) => start + i);
    steps.push(st(s, `Merged subarray [${start}..${end - 1}]: [${s.arr.slice(start, end).join(", ")}].`, 10, sortedRange, [], [], "found"));
  }

  mergeSortHelper(0, n);
  steps.push(st(s, `Merge Sort complete!`, 11, [], [], Array.from({ length: n }, (_, i) => i), "found"));
  return steps;
}

// ─── Quick Sort ───────────────────────────────────────────────────────────────

export function quickSort(arr: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const s: SortState = { arr: [...arr] };
  const n = s.arr.length;
  const sortedSet = new Set<number>();

  steps.push(st(s, `Quick Sort: ${n} elements. Lomuto partition: pick last element as pivot.`, 1));

  function partition(low: number, high: number): number {
    const pivot = s.arr[high];
    steps.push(st(s, `Partition [${low}..${high}]: pivot = arr[${high}] = ${pivot}.`, 3, [], [], [...sortedSet], "default", high));

    let i = low - 1;
    for (let j = low; j < high; j++) {
      steps.push(st(s, `Compare arr[${j}]=${s.arr[j]} with pivot ${pivot}.`, 4, [j, high], [], [...sortedSet], "default", high));
      if (s.arr[j] <= pivot) {
        i++;
        if (i !== j) {
          steps.push(st(s, `arr[${j}]=${s.arr[j]} <= ${pivot}. Swap arr[${i}] and arr[${j}].`, 5, [], [i, j], [...sortedSet], "delete", high));
          [s.arr[i], s.arr[j]] = [s.arr[j], s.arr[i]];
          steps.push(st(s, `Swapped. arr[${i}]=${s.arr[i]}, arr[${j}]=${s.arr[j]}.`, 5, [i, j], [], [...sortedSet], "default", high));
        } else {
          steps.push(st(s, `arr[${j}]=${s.arr[j]} <= ${pivot}. Already in place.`, 5, [j], [], [...sortedSet], "default", high));
        }
      }
    }

    const pivotFinal = i + 1;
    if (pivotFinal !== high) {
      steps.push(st(s, `Place pivot ${pivot} at its final position ${pivotFinal}.`, 6, [], [pivotFinal, high], [...sortedSet], "delete", high));
      [s.arr[pivotFinal], s.arr[high]] = [s.arr[high], s.arr[pivotFinal]];
    }
    sortedSet.add(pivotFinal);
    steps.push(st(s, `Pivot ${pivot} is now at index ${pivotFinal} — final position!`, 7, [pivotFinal], [], [...sortedSet], "found", pivotFinal));
    return pivotFinal;
  }

  function quickSortHelper(low: number, high: number): void {
    if (low >= high) {
      if (low === high) {
        sortedSet.add(low);
        steps.push(st(s, `Subarray [${low}..${high}] has 1 element — sorted.`, 8, [low], [], [...sortedSet], "found"));
      }
      return;
    }
    const pi = partition(low, high);
    quickSortHelper(low, pi - 1);
    quickSortHelper(pi + 1, high);
  }

  quickSortHelper(0, n - 1);
  steps.push(st(s, `Quick Sort complete!`, 9, [], [], Array.from({ length: n }, (_, i) => i), "found"));
  return steps;
}

// ─── Counting Sort ────────────────────────────────────────────────────────────

export function countingSort(arr: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const s: SortState = { arr: [...arr] };
  const n = s.arr.length;

  steps.push(st(s, `Counting Sort: ${n} elements (non-negative integers only). Count occurrences.`, 1));

  const max = Math.max(...s.arr);
  const min = Math.min(...s.arr);
  steps.push(st(s, `Range: min=${min}, max=${max}. Create count array of size ${max - min + 1}.`, 2));

  const k = max - min + 1;
  const count = new Array<number>(k).fill(0);

  for (let i = 0; i < n; i++) {
    count[s.arr[i] - min]++;
    steps.push(st(s, `Count arr[${i}]=${s.arr[i]}. count[${s.arr[i] - min}] = ${count[s.arr[i] - min]}.`, 3, [i], [], [], "default"));
  }

  steps.push(st(s, `Count array built: [${count.join(", ")}] for values ${min}..${max}.`, 4));

  // Reconstruct
  let wi = 0;
  for (let v = 0; v < k; v++) {
    while (count[v] > 0) {
      const val = v + min;
      s.arr[wi] = val;
      count[v]--;
      steps.push(st(s, `Place value ${val} at index ${wi}. Remaining count[${v}]=${count[v]}.`, 5, [wi], [], Array.from({ length: wi }, (_, i) => i), "insert"));
      wi++;
    }
  }

  steps.push(st(s, `Counting Sort complete! O(n+k) where k=${max - min + 1}.`, 6, [], [], Array.from({ length: n }, (_, i) => i), "found"));
  return steps;
}

// ─── Heap Sort ───────────────────────────────────────────────────────────────

export function heapSort(arr: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const s: SortState = { arr: [...arr] };
  const n = s.arr.length;
  const sorted: number[] = [];

  steps.push(st(s, `HeapSort: Phase 1 — build max heap from ${n} elements using Floyd's O(n) algorithm.`, 0, [], [], sorted));

  function siftDown(size: number, root: number) {
    while (true) {
      let largest = root;
      const l = 2 * root + 1;
      const r = 2 * root + 2;
      if (l < size && s.arr[l] > s.arr[largest]) largest = l;
      if (r < size && s.arr[r] > s.arr[largest]) largest = r;
      if (largest !== root) {
        steps.push(st(s, `siftDown: arr[${root}]=${s.arr[root]} < child arr[${largest}]=${s.arr[largest]}. Swap to restore max heap.`, 5, [root, largest], [root, largest], [...sorted], "delete"));
        [s.arr[root], s.arr[largest]] = [s.arr[largest], s.arr[root]];
        steps.push(st(s, `Swapped. Continue sifting from index ${largest}.`, 5, [largest], [], [...sorted]));
        root = largest;
      } else {
        break;
      }
    }
  }

  // Phase 1: build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    steps.push(st(s, `BuildHeap: siftDown index ${i} (value=${s.arr[i]}).`, 3, [i], [], sorted));
    siftDown(n, i);
  }
  steps.push(st(s, `Max heap built. arr[0]=${s.arr[0]} is maximum. Phase 2: extract max ${n} times.`, 1, [0], [], sorted, "found"));

  // Phase 2: extract max repeatedly into sorted suffix
  for (let i = n - 1; i > 0; i--) {
    steps.push(st(s, `Swap root (max) arr[0]=${s.arr[0]} with arr[${i}]=${s.arr[i]}. Place max at sorted position ${i}.`, 2, [], [0, i], [...sorted], "delete"));
    [s.arr[0], s.arr[i]] = [s.arr[i], s.arr[0]];
    sorted.unshift(i);
    steps.push(st(s, `arr[${i}]=${s.arr[i]} is in final position. Heap shrinks to size ${i}. siftDown root.`, 2, [i], [], [...sorted], "found"));
    siftDown(i, 0);
  }

  sorted.unshift(0);
  steps.push(st(s, `HeapSort complete! Sorted: [${s.arr.join(", ")}].`, 6, [], [], [...sorted], "found"));
  return steps;
}

// ─── Radix Sort ───────────────────────────────────────────────────────────────

export interface RadixStep extends Step {
  arr: number[];
  buckets: number[][];
  currentDigit: number;
  digitName: string;
  highlightIndex: number | null;
  pass: number;
}

export function radixSort(arr: number[]): RadixStep[] {
  const steps: RadixStep[] = [];
  const a = [...arr];
  const maxVal = Math.max(...a);
  const numPasses = maxVal > 0 ? Math.floor(Math.log10(maxVal)) + 1 : 1;

  const emptyBuckets = (): number[][] => Array.from({ length: 10 }, () => []);

  const snap = (buckets: number[][], digit: number, hl: number, expl: string, highlight: number | null = null, pass = 0, phase?: string): RadixStep => ({
    arr: [...a],
    buckets: buckets.map(b => [...b]),
    currentDigit: digit,
    digitName: digit === 1 ? "ones" : digit === 10 ? "tens" : digit === 100 ? "hundreds" : `${digit}s`,
    highlightIndex: highlight,
    pass,
    highlightLine: hl,
    explanation: expl,
    phase,
  });

  steps.push(snap(emptyBuckets(), 1, 0, `Radix Sort (LSD): process digits from ones → tens → hundreds. ${numPasses} pass${numPasses > 1 ? "es" : ""} needed for max value ${maxVal}.`));

  for (let pass = 0; pass < numPasses; pass++) {
    const digit = Math.pow(10, pass);
    const digitStr = pass === 0 ? "ones" : pass === 1 ? "tens" : pass === 2 ? "hundreds" : `10^${pass}`;
    const buckets = emptyBuckets();

    steps.push(snap(buckets, digit, 1, `Pass ${pass + 1}/${numPasses}: sort by ${digitStr} digit.`));

    // Distribute
    for (let i = 0; i < a.length; i++) {
      const d = Math.floor(a[i] / digit) % 10;
      buckets[d] = [...buckets[d], a[i]];
      steps.push(snap(buckets, digit, 2, `Element ${a[i]}: ${digitStr} digit = ${d} → bucket[${d}].`, i, pass));
    }

    // Collect
    let idx = 0;
    const before = [...a];
    for (let b = 0; b < 10; b++) {
      for (const val of buckets[b]) {
        a[idx++] = val;
      }
    }
    steps.push(snap(emptyBuckets(), digit, 3, `Collect buckets [0..9] back into array: [${a.join(", ")}].`, null, pass, "insert"));
  }

  steps.push(snap(emptyBuckets(), 0, 4, `Radix Sort complete! [${a.join(", ")}]`, null, numPasses, "found"));
  return steps;
}

// ─── Pseudocode ───────────────────────────────────────────────────────────────

export const SORT_CODE: Record<string, string[]> = {
  bubbleSort: [
    "function bubbleSort(arr) {",
    "  const n = arr.length;",
    "  for (let i = 0; i < n-1; i++) {",
    "    for (let j = 0; j < n-i-1; j++) {",
    "      if (arr[j] > arr[j+1])",
    "        swap(arr, j, j+1);",
    "    }",
    "    // arr[n-1-i] is now sorted",
    "  }",
    "}",
  ],
  selectionSort: [
    "function selectionSort(arr) {",
    "  const n = arr.length;",
    "  for (let i = 0; i < n-1; i++) {",
    "    let minIdx = i; // assume i is min",
    "    for (let j = i+1; j < n; j++)",
    "      if (arr[j] < arr[minIdx]) minIdx = j;",
    "    swap(arr, i, minIdx);",
    "    // arr[0..i] is now sorted",
    "  }",
    "}",
  ],
  insertionSort: [
    "function insertionSort(arr) {",
    "  // arr[0] is trivially sorted",
    "  for (let i = 1; i < arr.length; i++) {",
    "    const key = arr[i];",
    "    let j = i - 1;",
    "    while (j >= 0 && arr[j] > key)",
    "      arr[j+1] = arr[j--]; // shift right",
    "    arr[j+1] = key; // insert",
    "  }",
    "}",
  ],
  mergeSort: [
    "function mergeSort(arr, l, r) {",
    "  if (r - l <= 1) return; // base case",
    "  const mid = (l + r) / 2;",
    "  // split into two halves",
    "  mergeSort(arr, l, mid);",
    "  mergeSort(arr, mid, r);",
    "  merge(arr, l, mid, r);",
    "  while (li < left.len && ri < right.len)",
    "    arr[wi++] = min(left[li], right[ri]);",
    "  copy remaining left/right elements;",
    "  // subarray [l..r] is sorted",
    "  // sort complete",
  ],
  quickSort: [
    "function quickSort(arr, low, high) {",
    "  if (low >= high) return;",
    "  // Lomuto partition: pick arr[high] as pivot",
    "  let i = low - 1;",
    "  for (let j = low; j < high; j++)",
    "    if (arr[j] <= pivot) swap(arr, ++i, j);",
    "  swap(arr, i+1, high); // pivot final pos",
    "  // pivot is now in correct position",
    "  if (low === high) sorted[low] = true;",
    "  // recurse on left and right partitions",
  ],
  countingSort: [
    "function countingSort(arr) {",
    "  const max = Math.max(...arr);",
    "  const count = new Array(max+1).fill(0);",
    "  for each x in arr: count[x]++;",
    "  // reconstruct from count array",
    "  for (let v = 0; v <= max; v++)",
    "    while (count[v]-- > 0) output.push(v);",
    "}",
  ],
  radixSort: [
    "function radixSort(arr) {",
    "  for digit = ones, tens, hundreds...:",
    "    distribute arr into buckets[0..9]",
    "    by digit position;",
    "    collect buckets back into arr;",
    "  // sorted after max_digits passes",
    "}",
  ],
  heapSort: [
    "function heapSort(arr) {",
    "  buildMaxHeap(arr);          // Phase 1: O(n)",
    "  for i from n-1 down to 1:  // Phase 2: O(n log n)",
    "    // BuildMaxHeap: siftDown each non-leaf",
    "    swap(arr[0], arr[i]);     // move max to end",
    "    siftDown(arr, 0, i);      // restore max heap",
    "  // arr sorted ascending in-place",
    "}",
  ],
};

export const SORT_ANNOTATIONS: Record<string, Record<number, string>> = {
  bubbleSort: {
    3: "Outer loop: n-1 passes. After pass i, the i+1 largest elements are in their final positions.",
    4: "Inner loop: only up to n-i-1 — last i positions are already sorted, no need to check them.",
    5: "Swap condition: arr[j] > arr[j+1] means left > right — out of order. Equal elements not swapped (stable).",
    6: "Swap moves larger value one step right, 'bubbling' it toward the end.",
  },
  selectionSort: {
    3: "Outer loop: each pass finds the minimum of the remaining unsorted portion.",
    4: "Initialize minIdx = i — will update if we find anything smaller.",
    5: "Inner scan: O(n) to find minimum each pass → total O(n²).",
    6: "Place minimum at position i. After this, arr[0..i] is fully sorted.",
  },
  insertionSort: {
    3: "Outer loop starts at 1 — a single element is trivially sorted.",
    4: "Save key before shifting — like picking up a card to insert into your hand.",
    5: "Walk left through sorted portion looking for where key belongs.",
    6: "Shift right: makes room for key. Each shift is O(1) but there can be O(n) of them.",
    7: "Drop key in the gap. Left portion [0..i] is now sorted.",
  },
  mergeSort: {
    3: "Divide: split at midpoint. Recurse until subarrays of size 1 (trivially sorted).",
    7: "Merge: combine two sorted halves into one sorted array — O(n) per level.",
    8: "Two-pointer merge: always pick the smaller front element from left or right half.",
    10: "After merge, subarray [l..r] is fully sorted. Recursion unwinds bottom-up.",
  },
  quickSort: {
    3: "Lomuto partition: last element is pivot. Alternative: random pivot to avoid O(n²) on sorted input.",
    4: "i tracks the boundary: arr[low..i] will be ≤ pivot after partitioning.",
    5: "If arr[j] ≤ pivot, extend the ≤-region: increment i and swap arr[i] with arr[j].",
    6: "Place pivot at i+1 — its final sorted position! Elements left ≤ pivot, right > pivot.",
  },
  countingSort: {
    2: "Find range [min, max]. Array size = max - min + 1. Only valid for bounded non-negative integers.",
    3: "Count array: count[v] = number of times value v appears. O(n) to fill.",
    4: "Each element counted exactly once. Stable if you use prefix sums (not shown here).",
    5: "Reconstruct by emitting each value count[v] times. O(n+k) total.",
  },
  radixSort: {
    0: "LSD (Least Significant Digit) radix sort: start from ones digit, move to larger digits.",
    2: "Stable distribution: equal-digit elements keep their relative order in the bucket.",
    3: "Collect in bucket order 0→9. Stability here is why LSD radix sort works correctly.",
    4: "After d passes (d = digits of max element), array is fully sorted.",
  },
  heapSort: {
    0: "HeapSort uses the heap data structure itself — no extra array needed, in-place O(1) space.",
    1: "Phase 1: Floyd's buildMaxHeap in O(n). Root arr[0] is the maximum after this.",
    2: "Phase 2: place the root (max) at index i, shrink heap boundary by 1, restore max heap.",
    3: "siftDown each internal node bottom-up: only O(n) total work due to decreasing subtree heights.",
    5: "siftDown: swap with the larger child until the node is larger than both children.",
    6: "When heap size reaches 1, every element is in its final sorted position.",
  },
};

export const SORT_COMPLEXITY: Record<string, { time: string; space: string; note: string }> = {
  bubbleSort:    { time: "O(n²)",         space: "O(1)",      note: "Nested loops, adjacent comparisons. Simple but slow for large n." },
  selectionSort: { time: "O(n²)",         space: "O(1)",      note: "Always O(n²) — finds minimum each pass regardless of input order." },
  insertionSort: { time: "O(n²) / O(n)", space: "O(1)",      note: "O(n) best case on nearly-sorted input. Practical for small n." },
  mergeSort:     { time: "O(n log n)",    space: "O(n)",      note: "Always O(n log n). Extra O(n) buffer for merge. Stable sort." },
  quickSort:     { time: "O(n log n) avg",space: "O(log n)",  note: "O(n²) worst case (sorted input + bad pivot). O(log n) stack space." },
  countingSort:  { time: "O(n+k)",        space: "O(k)",      note: "k = value range. Faster than comparison sorts when k is small." },
  heapSort:      { time: "O(n log n)",    space: "O(1)",      note: "Phase 1: O(n) buildMaxHeap. Phase 2: n-1 extractions × O(log n) siftDown. In-place — no auxiliary array." },
  radixSort:     { time: "O(d·(n+k))",   space: "O(n+k)",    note: "d = number of digits, k = base (10). Not a comparison sort — beats O(n log n) when d is small. Stable." },
};
