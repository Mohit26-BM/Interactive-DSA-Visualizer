import { Step } from "./types";

// ─── Array Stack ─────────────────────────────────────────────────────────────

export const STACK_MAX = 8;

export interface StackElement { value: number; id: string }

export interface StackArrayState {
  elements: StackElement[];
  top: number;         // index of top element, -1 when empty
  maxSize: number;
}

export interface StackArrayStep extends Step {
  state: StackArrayState;
  stackType: "array";
}

// ─── Linked List Stack ────────────────────────────────────────────────────────

export interface StackLLNode { id: string; value: number; next: string | null }

export interface StackLLState {
  nodes: StackLLNode[];
  top: string | null;  // id of top node (= head)
}

export interface StackLLStep extends Step {
  state: StackLLState;
  stackType: "linkedlist";
}

export type StackStep = StackArrayStep | StackLLStep;

// ─── Helpers ──────────────────────────────────────────────────────────────────

let idCounter = 0;
const newId = () => `sk-${idCounter++}`;

function cloneArr(s: StackArrayState): StackArrayState {
  return { elements: s.elements.map((e) => ({ ...e })), top: s.top, maxSize: s.maxSize };
}

function cloneLL(s: StackLLState): StackLLState {
  return { nodes: s.nodes.map((n) => ({ ...n })), top: s.top };
}

function arrStep(s: StackArrayState, explanation: string, highlightLine: number, highlightIndices: number[] = [], phase?: string): StackArrayStep {
  return { state: cloneArr(s), explanation, highlightLine, highlightIndices, phase, stackType: "array" };
}

function llStep(s: StackLLState, explanation: string, highlightLine: number, highlightNodes: string[] = [], phase?: string): StackLLStep {
  return { state: cloneLL(s), explanation, highlightLine, highlightNodes, phase, stackType: "linkedlist" };
}

function buildArrState(values: number[]): StackArrayState {
  return {
    elements: values.map((v) => ({ value: v, id: newId() })),
    top: values.length - 1,
    maxSize: STACK_MAX,
  };
}

function buildLLState(values: number[]): StackLLState {
  if (values.length === 0) return { nodes: [], top: null };
  const nodes: StackLLNode[] = values.map((v) => ({ id: newId(), value: v, next: null }));
  // top = first in values array (head), so reverse linking: values[0] is top
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1].id;
  return { nodes, top: nodes[0].id };
}

// ─── Array Stack Operations ──────────────────────────────────────────────────

export function stackArrPush(values: number[], value: number): StackArrayStep[] {
  const steps: StackArrayStep[] = [];
  const s = buildArrState(values);

  steps.push(arrStep(s, `Push ${value} onto the stack.`, 1));
  steps.push(arrStep(s, `Check: is stack full? top = ${s.top}, maxSize = ${s.maxSize}.`, 2));

  if (s.top >= s.maxSize - 1) {
    steps.push(arrStep(s, `Stack Overflow! Cannot push — stack is full (${s.maxSize}/${s.maxSize}).`, 3, [], "error"));
    return steps;
  }

  steps.push(arrStep(s, `Stack is not full. Increment top: ${s.top} → ${s.top + 1}.`, 4, [s.top + 1]));
  s.top++;
  s.elements.push({ value, id: newId() });
  steps.push(arrStep(s, `Write ${value} at top (index ${s.top}).`, 5, [s.top], "insert"));
  steps.push(arrStep(s, `Done. Stack size: ${s.elements.length}/${s.maxSize}.`, 6, [s.top]));
  return steps;
}

export function stackArrPop(values: number[]): StackArrayStep[] {
  const steps: StackArrayStep[] = [];
  const s = buildArrState(values);

  steps.push(arrStep(s, `Pop the top element from the stack.`, 1));
  steps.push(arrStep(s, `Check: is stack empty? top = ${s.top}.`, 2));

  if (s.top < 0) {
    steps.push(arrStep(s, `Stack Underflow! Cannot pop — stack is empty.`, 3, [], "error"));
    return steps;
  }

  const val = s.elements[s.top].value;
  steps.push(arrStep(s, `Top element is ${val} at index ${s.top}.`, 4, [s.top], "delete"));
  s.elements.pop();
  s.top--;
  steps.push(arrStep(s, `Remove ${val} and decrement top to ${s.top}.`, 5, s.top >= 0 ? [s.top] : []));
  steps.push(arrStep(s, `Done. Popped value: ${val}. Stack size: ${s.elements.length}.`, 6, s.top >= 0 ? [s.top] : [], "found"));
  return steps;
}

export function stackArrPeek(values: number[]): StackArrayStep[] {
  const steps: StackArrayStep[] = [];
  const s = buildArrState(values);

  steps.push(arrStep(s, `Peek: view the top element without removing it.`, 1));

  if (s.top < 0) {
    steps.push(arrStep(s, `Stack is empty — nothing to peek.`, 2, [], "error"));
    return steps;
  }

  const val = s.elements[s.top].value;
  steps.push(arrStep(s, `Access index top (${s.top}).`, 2, [s.top]));
  steps.push(arrStep(s, `Top element is ${val}. Stack is unchanged.`, 3, [s.top], "found"));
  return steps;
}

export function stackArrIsEmpty(values: number[]): StackArrayStep[] {
  const s = buildArrState(values);
  const empty = s.top < 0;
  return [
    arrStep(s, `Check isEmpty: is top == -1?`, 1),
    arrStep(s, `top = ${s.top}. isEmpty → ${empty}.`, 2, s.top >= 0 ? [s.top] : [], empty ? "found" : "insert"),
  ];
}

export function stackArrIsFull(values: number[]): StackArrayStep[] {
  const s = buildArrState(values);
  const full = s.top >= s.maxSize - 1;
  return [
    arrStep(s, `Check isFull: is top == maxSize - 1 (${s.maxSize - 1})?`, 1),
    arrStep(s, `top = ${s.top}, maxSize = ${s.maxSize}. isFull → ${full}.`, 2, s.top >= 0 ? [s.top] : [], full ? "delete" : "found"),
  ];
}

export function stackArrClear(values: number[]): StackArrayStep[] {
  const steps: StackArrayStep[] = [];
  const s = buildArrState(values);

  steps.push(arrStep(s, `Clear the stack — remove all elements.`, 1, Array.from({ length: s.elements.length }, (_, i) => i)));
  s.elements = [];
  s.top = -1;
  steps.push(arrStep(s, `Set top = -1. Stack is now empty.`, 2, [], "found"));
  return steps;
}

// ─── Linked List Stack Operations ────────────────────────────────────────────

export function stackLLPush(values: number[], value: number): StackLLStep[] {
  const steps: StackLLStep[] = [];
  const s = buildLLState(values);

  steps.push(llStep(s, `Push ${value}: create new node and make it the top (head).`, 1));

  const newNode: StackLLNode = { id: newId(), value, next: s.top };
  s.nodes.unshift(newNode);
  const oldTopVal = s.top ? s.nodes.find((n) => n.id === s.top)?.value : null;

  steps.push(llStep(s, `Create node(${value}). Point its next to old top${oldTopVal != null ? ` (${oldTopVal})` : " (null)"}.`, 2, [newNode.id], "insert"));
  s.top = newNode.id;
  steps.push(llStep(s, `Update top pointer to new node ${value}.`, 3, [newNode.id], "found"));
  steps.push(llStep(s, `Done. ${value} is now the top of the stack.`, 4, [newNode.id]));
  return steps;
}

export function stackLLPop(values: number[]): StackLLStep[] {
  const steps: StackLLStep[] = [];
  const s = buildLLState(values);

  steps.push(llStep(s, `Pop: remove the top node.`, 1));

  if (!s.top) {
    steps.push(llStep(s, `Stack Underflow! Stack is empty.`, 2, [], "error"));
    return steps;
  }

  const topNode = s.nodes.find((n) => n.id === s.top)!;
  steps.push(llStep(s, `Top node is ${topNode.value}.`, 2, [topNode.id], "delete"));
  s.top = topNode.next;
  s.nodes = s.nodes.filter((n) => n.id !== topNode.id);
  steps.push(llStep(s, `Move top to next node${s.top ? ` (${s.nodes.find(n => n.id === s.top)?.value})` : " (null)"}.`, 3, s.top ? [s.top] : []));
  steps.push(llStep(s, `Popped ${topNode.value}. Stack updated.`, 4, s.top ? [s.top] : [], "found"));
  return steps;
}

export function stackLLPeek(values: number[]): StackLLStep[] {
  const s = buildLLState(values);
  if (!s.top) return [llStep(s, `Stack is empty — nothing to peek.`, 1, [], "error")];
  const topNode = s.nodes.find((n) => n.id === s.top)!;
  return [
    llStep(s, `Peek: look at top node without removing.`, 1, [topNode.id]),
    llStep(s, `Top is ${topNode.value}. Stack is unchanged.`, 2, [topNode.id], "found"),
  ];
}

export function stackLLIsEmpty(values: number[]): StackLLStep[] {
  const s = buildLLState(values);
  const empty = !s.top;
  return [
    llStep(s, `Check isEmpty: is top == null?`, 1),
    llStep(s, `top = ${s.top ? `node(${s.nodes.find(n => n.id === s.top)?.value})` : "null"}. isEmpty → ${empty}.`, 2, s.top ? [s.top] : [], empty ? "found" : "insert"),
  ];
}

export function stackLLClear(values: number[]): StackLLStep[] {
  const s = buildLLState(values);
  const all = s.nodes.map((n) => n.id);
  const steps = [llStep(s, `Clear stack — remove all nodes.`, 1, all)];
  s.nodes = [];
  s.top = null;
  steps.push(llStep(s, `All nodes removed. Stack is empty.`, 2, [], "found"));
  return steps;
}

// ─── Annotations ─────────────────────────────────────────────────────────────

export const STACK_ARR_ANNOTATIONS: Record<string, Record<number, string>> = {
  push: {
    2: "if condition: bounds check — top == maxSize−1 means every slot is filled. Must check BEFORE incrementing.",
    3: "throw StackOverflow: pushing onto a full array stack is an error. Fixed-capacity is the array stack's key limitation vs linked list.",
    4: "Increment top first, then write — top always points to the last filled slot, never to an empty one.",
    5: "Direct index write stack[top] = value is O(1). This is why array stacks are cache-friendly.",
  },
  pop: {
    2: "if condition: top == −1 is the empty sentinel. Popping an empty stack would give garbage data.",
    3: "throw StackUnderflow: attempting pop on an empty stack.",
    4: "Read the value before decrementing — after top-- the slot is logically gone.",
    5: "Decrement top to mark the slot as empty. The data isn't erased — it's just unreachable.",
  },
  peek: {
    2: "if condition: guard against empty stack. top == −1 means no elements exist.",
    3: "Direct read stack[top] — O(1). The element stays in place, top is unchanged.",
  },
  isEmpty: {
    2: "top == −1 is the chosen sentinel for 'empty'. Using −1 means a valid stack always has top ≥ 0.",
  },
  isFull: {
    2: "top == maxSize−1 because top is 0-indexed. A stack with maxSize=8 is full when top=7.",
  },
  clear: {
    2: "Reset top to −1 — the 'forget everything' trick. Data remains in memory but is logically inaccessible.",
  },
};

export const STACK_LL_ANNOTATIONS: Record<string, Record<number, string>> = {
  push: {
    2: "Allocate a new node — heap allocation, O(1) amortized. No capacity limit unlike array stack.",
    3: "node.next = top links the new node to the current top — prepend to the chain.",
    4: "Update top to the new node — O(1) pointer update. The new node is now the top of the stack.",
  },
  pop: {
    2: "if condition: top == null means the linked list is empty — no nodes to remove.",
    4: "Read value BEFORE moving top — top.next becomes the new top so we'd lose value otherwise.",
    5: "top = top.next advances the top pointer. The old node is now unreferenced and garbage collected.",
  },
  peek: {
    2: "if condition: null check — empty stack guard.",
    3: "Return top.value without modifying top — read-only access, O(1).",
  },
  isEmpty: {
    2: "top == null because the linked list stack uses null (not −1) as the empty sentinel.",
  },
  clear: {
    2: "Setting top = null drops the reference to the entire chain. GC reclaims all nodes automatically.",
  },
};

// ─── Pseudocode ──────────────────────────────────────────────────────────────

export const STACK_ARR_CODE: Record<string, string[]> = {
  push: [
    "function push(stack, value) {",
    "  if (top == maxSize - 1)",
    "    throw StackOverflow;",
    "  top = top + 1;",
    "  stack[top] = value;",
    "  // push complete",
    "}",
  ],
  pop: [
    "function pop(stack) {",
    "  if (top == -1)",
    "    throw StackUnderflow;",
    "  value = stack[top];",
    "  top = top - 1;",
    "  return value;",
    "}",
  ],
  peek: [
    "function peek(stack) {",
    "  if (top == -1) return null;",
    "  return stack[top];",
    "}",
  ],
  isEmpty: [
    "function isEmpty(stack) {",
    "  return top == -1;",
    "}",
  ],
  isFull: [
    "function isFull(stack) {",
    "  return top == maxSize - 1;",
    "}",
  ],
  clear: [
    "function clear(stack) {",
    "  top = -1;",
    "  // elements remain but top marks empty",
    "}",
  ],
};

export const STACK_LL_CODE: Record<string, string[]> = {
  push: [
    "function push(value) {",
    "  node = new Node(value);",
    "  node.next = top;",
    "  top = node;",
    "  // node is now the top",
    "}",
  ],
  pop: [
    "function pop() {",
    "  if (top == null)",
    "    throw StackUnderflow;",
    "  value = top.value;",
    "  top = top.next;",
    "  return value;",
    "}",
  ],
  peek: [
    "function peek() {",
    "  if (top == null) return null;",
    "  return top.value;",
    "}",
  ],
  isEmpty: [
    "function isEmpty() {",
    "  return top == null;",
    "}",
  ],
  clear: [
    "function clear() {",
    "  top = null;",
    "  // GC reclaims nodes",
    "}",
  ],
};

export const STACK_COMPLEXITY: Record<string, { time: string; space: string; note: string }> = {
  push:    { time: "O(1)", space: "O(1)", note: "Array: increment top and write. LL: allocate node, update top." },
  pop:     { time: "O(1)", space: "O(1)", note: "Array: read top, decrement. LL: move top to next node." },
  peek:    { time: "O(1)", space: "O(1)", note: "Direct access to top — no traversal needed." },
  isEmpty: { time: "O(1)", space: "O(1)", note: "Single comparison against sentinel (−1 or null)." },
  isFull:  { time: "O(1)", space: "O(1)", note: "Array stack only — compare top with max capacity." },
  clear:   { time: "O(1)", space: "O(1)", note: "Array: reset top. LL: set top = null (GC cleans up)." },
};
