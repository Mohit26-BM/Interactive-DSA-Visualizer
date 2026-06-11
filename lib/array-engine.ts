import { ArrayStep, ArrayState } from "./types";

let idCounter = 0;
const newId = () => `el-${idCounter++}`;

function clone(state: ArrayState): ArrayState {
  return { elements: state.elements.map((e) => ({ ...e })) };
}

function step(
  state: ArrayState,
  explanation: string,
  highlightLine: number,
  highlightIndices: number[] = [],
  phase?: string
): ArrayStep {
  return { state: clone(state), explanation, highlightLine, highlightIndices, phase };
}

export function arrayInsert(elements: number[], value: number, index: number): ArrayStep[] {
  const steps: ArrayStep[] = [];
  const state: ArrayState = { elements: elements.map((v) => ({ value: v, id: newId() })) };

  steps.push(step(state, `Start: insert ${value} at index ${index}.`, 1));

  if (index < 0 || index > state.elements.length) {
    steps.push(step(state, `Index ${index} is out of bounds. Insertion aborted.`, 2, [], "error"));
    return steps;
  }

  steps.push(step(state, `Shift elements from index ${index} onwards to the right.`, 3, Array.from({ length: state.elements.length - index }, (_, i) => index + i)));

  const newEl = { value, id: newId() };
  state.elements.splice(index, 0, newEl);

  steps.push(step(state, `Insert ${value} at index ${index}.`, 4, [index], "insert"));
  steps.push(step(state, `Done. Array length is now ${state.elements.length}.`, 5, [index]));

  return steps;
}

export function arrayDelete(elements: number[], index: number): ArrayStep[] {
  const steps: ArrayStep[] = [];
  const state: ArrayState = { elements: elements.map((v) => ({ value: v, id: newId() })) };

  steps.push(step(state, `Start: delete element at index ${index}.`, 1));

  if (index < 0 || index >= state.elements.length) {
    steps.push(step(state, `Index ${index} is out of bounds. Deletion aborted.`, 2, [], "error"));
    return steps;
  }

  const val = state.elements[index].value;
  steps.push(step(state, `Found element ${val} at index ${index}. Removing it.`, 3, [index], "delete"));

  state.elements.splice(index, 1);
  steps.push(step(state, `Shift remaining elements left to fill the gap.`, 4, Array.from({ length: state.elements.length - index }, (_, i) => index + i)));
  steps.push(step(state, `Done. Array length is now ${state.elements.length}.`, 5));

  return steps;
}

export function arraySearch(elements: number[], target: number): ArrayStep[] {
  const steps: ArrayStep[] = [];
  const state: ArrayState = { elements: elements.map((v) => ({ value: v, id: newId() })) };

  steps.push(step(state, `Start linear search for value ${target}.`, 1));

  for (let i = 0; i < state.elements.length; i++) {
    steps.push(step(state, `Check index ${i}: value is ${state.elements[i].value}.`, 2, [i]));
    if (state.elements[i].value === target) {
      steps.push(step(state, `Found ${target} at index ${i}!`, 3, [i], "found"));
      return steps;
    }
    steps.push(step(state, `${state.elements[i].value} ≠ ${target}. Move to next.`, 4, [i]));
  }

  steps.push(step(state, `${target} not found in the array.`, 5, [], "error"));
  return steps;
}

export function arrayUpdate(elements: number[], index: number, value: number): ArrayStep[] {
  const steps: ArrayStep[] = [];
  const state: ArrayState = { elements: elements.map((v) => ({ value: v, id: newId() })) };

  steps.push(step(state, `Start: update index ${index} to value ${value}.`, 1));

  if (index < 0 || index >= state.elements.length) {
    steps.push(step(state, `Index ${index} is out of bounds.`, 2, [], "error"));
    return steps;
  }

  const old = state.elements[index].value;
  steps.push(step(state, `Access index ${index}. Current value: ${old}.`, 3, [index]));

  state.elements[index].value = value;
  steps.push(step(state, `Write new value ${value} at index ${index}.`, 4, [index], "insert"));
  steps.push(step(state, `Done. Index ${index} updated from ${old} to ${value}.`, 5, [index]));

  return steps;
}

export function arrayBubbleSort(elements: number[]): ArrayStep[] {
  const steps: ArrayStep[] = [];
  const state: ArrayState = { elements: elements.map((v) => ({ value: v, id: newId() })) };

  steps.push(step(state, `Start Bubble Sort on ${state.elements.length} elements.`, 1));

  const n = state.elements.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push(step(state, `Compare index ${j} (${state.elements[j].value}) and index ${j + 1} (${state.elements[j + 1].value}).`, 3, [j, j + 1]));
      if (state.elements[j].value > state.elements[j + 1].value) {
        steps.push(step(state, `${state.elements[j].value} > ${state.elements[j + 1].value} — swap them.`, 4, [j, j + 1], "insert"));
        const tmp = state.elements[j];
        state.elements[j] = state.elements[j + 1];
        state.elements[j + 1] = tmp;
        steps.push(step(state, `Swapped. Array updated.`, 4, [j, j + 1]));
      } else {
        steps.push(step(state, `${state.elements[j].value} ≤ ${state.elements[j + 1].value} — no swap needed.`, 4, [j, j + 1]));
      }
    }
    steps.push(step(state, `Pass ${i + 1} complete. Largest ${n - i - 1} elements are now sorted.`, 5, Array.from({ length: i + 1 }, (_, k) => n - 1 - k), "found"));
  }

  steps.push(step(state, `Bubble Sort complete. Array is fully sorted.`, 6, Array.from({ length: n }, (_, i) => i), "found"));
  return steps;
}

export function arraySelectionSort(elements: number[]): ArrayStep[] {
  const steps: ArrayStep[] = [];
  const state: ArrayState = { elements: elements.map((v) => ({ value: v, id: newId() })) };

  steps.push(step(state, `Start Selection Sort on ${state.elements.length} elements.`, 1));

  const n = state.elements.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    steps.push(step(state, `Pass ${i + 1}: assume minimum is at index ${i} (value ${state.elements[i].value}).`, 2, [i]));

    for (let j = i + 1; j < n; j++) {
      steps.push(step(state, `Compare index ${j} (${state.elements[j].value}) with current min at ${minIdx} (${state.elements[minIdx].value}).`, 3, [j, minIdx]));
      if (state.elements[j].value < state.elements[minIdx].value) {
        minIdx = j;
        steps.push(step(state, `New minimum found at index ${j} (value ${state.elements[j].value}).`, 4, [minIdx]));
      }
    }

    if (minIdx !== i) {
      steps.push(step(state, `Swap index ${i} (${state.elements[i].value}) with min at index ${minIdx} (${state.elements[minIdx].value}).`, 5, [i, minIdx], "insert"));
      const tmp = state.elements[i];
      state.elements[i] = state.elements[minIdx];
      state.elements[minIdx] = tmp;
      steps.push(step(state, `Swapped. Index ${i} is now sorted.`, 5, [i]));
    } else {
      steps.push(step(state, `Index ${i} already has minimum. No swap needed.`, 5, [i]));
    }
  }

  steps.push(step(state, `Selection Sort complete.`, 6, Array.from({ length: n }, (_, i) => i), "found"));
  return steps;
}

export function arrayInsertionSort(elements: number[]): ArrayStep[] {
  const steps: ArrayStep[] = [];
  const state: ArrayState = { elements: elements.map((v) => ({ value: v, id: newId() })) };

  steps.push(step(state, `Start Insertion Sort on ${state.elements.length} elements.`, 1));

  const n = state.elements.length;
  for (let i = 1; i < n; i++) {
    const key = state.elements[i];
    steps.push(step(state, `Pick element at index ${i} (value ${key.value}) as the key.`, 2, [i]));

    let j = i - 1;
    while (j >= 0 && state.elements[j].value > key.value) {
      steps.push(step(state, `${state.elements[j].value} > ${key.value} — shift ${state.elements[j].value} right.`, 3, [j, j + 1], "insert"));
      state.elements[j + 1] = state.elements[j];
      j--;
      steps.push(step(state, `Shifted. Continue comparing.`, 3, [j + 1]));
    }

    state.elements[j + 1] = key;
    steps.push(step(state, `Place key ${key.value} at index ${j + 1}. Left portion is now sorted.`, 4, [j + 1], "found"));
  }

  steps.push(step(state, `Insertion Sort complete.`, 5, Array.from({ length: n }, (_, i) => i), "found"));
  return steps;
}

// Line-level educational annotations: op → line number → explanation of the code construct
export const ARRAY_ANNOTATIONS: Record<string, Record<number, string>> = {
  insert: {
    2: "Guard clause: bounds check runs in O(1) before touching the array.",
    3: "Every element from index onward shifts right by one — this O(n) shift is why array insertion is expensive.",
    4: "splice() opens the slot and drops the value in one step.",
  },
  delete: {
    2: "Guard clause: prevents out-of-bounds access before any mutation.",
    3: "Save the value first — once we splice it's gone.",
    4: "splice() removes the element; JavaScript shifts remaining elements left automatically — O(n) work.",
  },
  search: {
    2: "for loop: visits every index from 0 to length−1. In an unsorted array there is no faster approach — O(n).",
    3: "Each iteration checks one element. If the condition is true we short-circuit and return immediately.",
    7: "Fell through the loop without finding a match — return −1 as the 'not found' sentinel.",
  },
  update: {
    2: "Bounds check: index must be within [0, length−1] for valid access.",
    3: "Direct index access arr[index] is O(1) — this is the key advantage of arrays over linked lists.",
    4: "Write the new value in-place. No shifting needed — O(1) operation.",
  },
  bubbleSort: {
    2: "Cache array length — avoids recalculating arr.length on every iteration.",
    3: "Outer for loop: n−1 passes. After pass i, the (i+1) largest elements have 'bubbled' to the end and are locked in place.",
    4: "Inner for loop: only scans up to n−i−1. The last i positions are already sorted so we skip them.",
    5: "if condition: if left > right the pair is out of order. Equal elements are left alone — this keeps bubble sort stable.",
    6: "Swap: two elements exchange positions. This is what physically moves larger values toward the end.",
  },
  selectionSort: {
    2: "Outer for loop: each iteration selects the minimum of the remaining unsorted portion and places it at position i.",
    3: "Assume the minimum is at i — we'll scan right to confirm or update this assumption.",
    4: "Inner for loop: scan everything to the right of i looking for a smaller value.",
    5: "if condition: found a new minimum — update the pointer. At the end of the inner loop minIdx holds the true minimum.",
    6: "Swap: place the minimum at position i. After this line, everything at [0..i] is in its final sorted position.",
  },
  insertionSort: {
    2: "Outer for loop: starts at index 1 — a single element on the left is trivially sorted.",
    3: "Save current element as 'key' — this is the card we're about to insert into the sorted left hand.",
    4: "j starts just before key's position and walks left through the sorted portion.",
    5: "while loop: two conditions — j ≥ 0 prevents going out of bounds; arr[j] > key stops when we find where key belongs.",
    6: "Shift arr[j] one position right. This overwrites arr[j+1] (which was either the key's old slot or a previous shift).",
    7: "Drop key into the gap — subarray [0..i] is now fully sorted.",
  },
};

export const ARRAY_CODE: Record<string, string[]> = {
  insert: [
    "function insert(arr, value, index) {",
    "  if (index < 0 || index > arr.length) return;",
    "  // shift elements right",
    "  arr.splice(index, 0, value);",
    "  // insertion complete",
    "}",
  ],
  delete: [
    "function delete(arr, index) {",
    "  if (index < 0 || index >= arr.length) return;",
    "  const val = arr[index];",
    "  arr.splice(index, 1);",
    "  // shift elements left",
    "}",
  ],
  search: [
    "function linearSearch(arr, target) {",
    "  for (let i = 0; i < arr.length; i++) {",
    "    if (arr[i] === target)",
    "      return i; // found",
    "    // not found, continue",
    "  }",
    "  return -1; // not found",
  ],
  update: [
    "function update(arr, index, value) {",
    "  if (index < 0 || index >= arr.length) return;",
    "  // access the index",
    "  arr[index] = value;",
    "  // update complete",
    "}",
  ],
  bubbleSort: [
    "function bubbleSort(arr) {",
    "  const n = arr.length;",
    "  for (let i = 0; i < n - 1; i++) {",
    "    for (let j = 0; j < n - i - 1; j++) {",
    "      if (arr[j] > arr[j+1])",
    "        swap(arr, j, j+1);",
    "    }",
    "  }",
    "}",
  ],
  selectionSort: [
    "function selectionSort(arr) {",
    "  for (let i = 0; i < arr.length - 1; i++) {",
    "    let minIdx = i;",
    "    for (let j = i+1; j < arr.length; j++)",
    "      if (arr[j] < arr[minIdx]) minIdx = j;",
    "    swap(arr, i, minIdx);",
    "    // index i is now sorted",
    "  }",
    "}",
  ],
  insertionSort: [
    "function insertionSort(arr) {",
    "  for (let i = 1; i < arr.length; i++) {",
    "    const key = arr[i];",
    "    let j = i - 1;",
    "    while (j >= 0 && arr[j] > key)",
    "      arr[j+1] = arr[j--]; // shift right",
    "    arr[j+1] = key;",
    "  }",
    "}",
  ],
};
