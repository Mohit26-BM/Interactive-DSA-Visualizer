import { Step } from "./types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type QueueType = "simple" | "circular" | "linkedlist" | "deque";

export interface QueueElement { value: number; id: string }

// Simple Queue (array with front pointer)
export interface SimpleQueueState {
  slots: (QueueElement | null)[];
  front: number;
  rear: number;
  size: number;
  maxSize: number;
}

// Circular Queue (same shape — front/rear wrap around)
export type CircularQueueState = SimpleQueueState;

// Linked List Queue
export interface LLQueueNode { id: string; value: number; next: string | null }
export interface LLQueueState {
  nodes: LLQueueNode[];
  head: string | null;  // front
  tail: string | null;  // rear
}

// Deque (doubly-ended; LL-based for clarity)
export interface DequeNode { id: string; value: number; prev: string | null; next: string | null }
export interface DequeState {
  nodes: DequeNode[];
  head: string | null;  // front
  tail: string | null;  // rear
}

export interface SimpleQueueStep extends Step { state: SimpleQueueState; queueType: "simple" }
export interface CircularQueueStep extends Step { state: CircularQueueState; queueType: "circular" }
export interface LLQueueStep extends Step { state: LLQueueState; queueType: "linkedlist" }
export interface DequeStep extends Step { state: DequeState; queueType: "deque" }
export type QueueStep = SimpleQueueStep | CircularQueueStep | LLQueueStep | DequeStep;

// ─── Config ───────────────────────────────────────────────────────────────────

export const QUEUE_MAX = 7;

let idCounter = 0;
const newId = () => `q-${idCounter++}`;

// ─── Clone helpers ────────────────────────────────────────────────────────────

function cloneSQ(s: SimpleQueueState): SimpleQueueState {
  return { slots: s.slots.map((e) => (e ? { ...e } : null)), front: s.front, rear: s.rear, size: s.size, maxSize: s.maxSize };
}
function cloneLL(s: LLQueueState): LLQueueState {
  return { nodes: s.nodes.map((n) => ({ ...n })), head: s.head, tail: s.tail };
}
function cloneDQ(s: DequeState): DequeState {
  return { nodes: s.nodes.map((n) => ({ ...n })), head: s.head, tail: s.tail };
}

// ─── Step factories ───────────────────────────────────────────────────────────

function sqStep(s: SimpleQueueState, explanation: string, hl: number, hi: number[] = [], phase?: string): SimpleQueueStep {
  return { state: cloneSQ(s), explanation, highlightLine: hl, highlightIndices: hi, phase, queueType: "simple" };
}
function cqStep(s: CircularQueueState, explanation: string, hl: number, hi: number[] = [], phase?: string): CircularQueueStep {
  return { state: cloneSQ(s), explanation, highlightLine: hl, highlightIndices: hi, phase, queueType: "circular" };
}
function llStep(s: LLQueueState, explanation: string, hl: number, hn: string[] = [], phase?: string): LLQueueStep {
  return { state: cloneLL(s), explanation, highlightLine: hl, highlightNodes: hn, phase, queueType: "linkedlist" };
}
function dqStep(s: DequeState, explanation: string, hl: number, hn: string[] = [], phase?: string): DequeStep {
  return { state: cloneDQ(s), explanation, highlightLine: hl, highlightNodes: hn, phase, queueType: "deque" };
}

// ─── State builders ───────────────────────────────────────────────────────────

function buildSQ(values: number[], maxSize = QUEUE_MAX): SimpleQueueState {
  const slots: (QueueElement | null)[] = Array(maxSize).fill(null);
  for (let i = 0; i < values.length && i < maxSize; i++) slots[i] = { value: values[i], id: newId() };
  return { slots, front: 0, rear: values.length - 1, size: Math.min(values.length, maxSize), maxSize };
}

function buildCQ(values: number[], maxSize = QUEUE_MAX): CircularQueueState {
  const slots: (QueueElement | null)[] = Array(maxSize).fill(null);
  for (let i = 0; i < values.length && i < maxSize; i++) slots[i] = { value: values[i], id: newId() };
  return { slots, front: 0, rear: values.length > 0 ? values.length - 1 : maxSize - 1, size: Math.min(values.length, maxSize), maxSize };
}

function buildLL(values: number[]): LLQueueState {
  if (values.length === 0) return { nodes: [], head: null, tail: null };
  const nodes: LLQueueNode[] = values.map((v) => ({ id: newId(), value: v, next: null }));
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1].id;
  return { nodes, head: nodes[0].id, tail: nodes[nodes.length - 1].id };
}

function buildDQ(values: number[]): DequeState {
  if (values.length === 0) return { nodes: [], head: null, tail: null };
  const nodes: DequeNode[] = values.map((v) => ({ id: newId(), value: v, prev: null, next: null }));
  for (let i = 0; i < nodes.length - 1; i++) { nodes[i].next = nodes[i + 1].id; nodes[i + 1].prev = nodes[i].id; }
  return { nodes, head: nodes[0].id, tail: nodes[nodes.length - 1].id };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMPLE QUEUE
// ═══════════════════════════════════════════════════════════════════════════════

export function simpleEnqueue(values: number[], value: number): SimpleQueueStep[] {
  const steps: SimpleQueueStep[] = [];
  const s = buildSQ(values);

  steps.push(sqStep(s, `Enqueue ${value}: add to the rear of the queue.`, 1));
  steps.push(sqStep(s, `Check: isFull? size = ${s.size}, max = ${s.maxSize}.`, 2));

  if (s.size >= s.maxSize) {
    steps.push(sqStep(s, `Queue Overflow! Cannot enqueue — queue is full.`, 3, [], "error"));
    return steps;
  }

  steps.push(sqStep(s, `Not full. Increment rear: ${s.rear} → ${s.rear + 1}.`, 4, [s.rear + 1]));
  s.rear++;
  s.slots[s.rear] = { value, id: newId() };
  s.size++;
  steps.push(sqStep(s, `Write ${value} at index ${s.rear}.`, 5, [s.rear], "insert"));
  steps.push(sqStep(s, `Done. Queue size: ${s.size}/${s.maxSize}.`, 6, [s.rear]));
  return steps;
}

export function simpleDequeue(values: number[]): SimpleQueueStep[] {
  const steps: SimpleQueueStep[] = [];
  const s = buildSQ(values);

  steps.push(sqStep(s, `Dequeue: remove from the front of the queue.`, 1));
  steps.push(sqStep(s, `Check: isEmpty? size = ${s.size}.`, 2));

  if (s.size === 0) {
    steps.push(sqStep(s, `Queue Underflow! Cannot dequeue — queue is empty.`, 3, [], "error"));
    return steps;
  }

  const val = s.slots[s.front]!.value;
  steps.push(sqStep(s, `Front element is ${val} at index ${s.front}.`, 4, [s.front], "delete"));
  s.slots[s.front] = null;
  s.size--;

  if (s.size === 0) {
    s.front = 0; s.rear = -1;
    steps.push(sqStep(s, `Queue is now empty. Reset front and rear.`, 5));
  } else {
    s.front++;
    steps.push(sqStep(s, `Move front pointer: ${s.front - 1} → ${s.front}.`, 5, [s.front]));
  }
  steps.push(sqStep(s, `Dequeued ${val}. Queue size: ${s.size}.`, 6, s.size > 0 ? [s.front] : [], "found"));
  return steps;
}

export function simpleFront(values: number[]): SimpleQueueStep[] {
  const s = buildSQ(values);
  if (s.size === 0) return [sqStep(s, `Queue is empty — no front element.`, 1, [], "error")];
  const val = s.slots[s.front]!.value;
  return [
    sqStep(s, `Front: peek at the front element without removing.`, 1, [s.front]),
    sqStep(s, `Front element is ${val} at index ${s.front}. Queue unchanged.`, 2, [s.front], "found"),
  ];
}

export function simpleIsEmpty(values: number[]): SimpleQueueStep[] {
  const s = buildSQ(values);
  const empty = s.size === 0;
  return [
    sqStep(s, `Check isEmpty: is size == 0?`, 1),
    sqStep(s, `size = ${s.size}. isEmpty → ${empty}.`, 2, !empty ? [s.front] : [], empty ? "found" : "insert"),
  ];
}

export function simpleIsFull(values: number[]): SimpleQueueStep[] {
  const s = buildSQ(values);
  const full = s.size >= s.maxSize;
  return [
    sqStep(s, `Check isFull: is size == maxSize (${s.maxSize})?`, 1),
    sqStep(s, `size = ${s.size}. isFull → ${full}.`, 2, full ? Array.from({ length: s.maxSize }, (_, i) => i) : [], full ? "delete" : "found"),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// CIRCULAR QUEUE
// ═══════════════════════════════════════════════════════════════════════════════

export function circularEnqueue(values: number[], value: number): CircularQueueStep[] {
  const steps: CircularQueueStep[] = [];
  const s = buildCQ(values);

  steps.push(cqStep(s, `Enqueue ${value} into the circular queue.`, 1));
  steps.push(cqStep(s, `Check isFull: size = ${s.size}, max = ${s.maxSize}.`, 2));

  if (s.size >= s.maxSize) {
    steps.push(cqStep(s, `Queue Overflow! Circular queue is full.`, 3, [], "error"));
    return steps;
  }

  const newRear = (s.rear + 1) % s.maxSize;
  steps.push(cqStep(s, `Compute new rear = (${s.rear} + 1) % ${s.maxSize} = ${newRear}.`, 4, [newRear]));
  s.rear = newRear;
  s.slots[s.rear] = { value, id: newId() };
  s.size++;
  steps.push(cqStep(s, `Write ${value} at index ${s.rear}.`, 5, [s.rear], "insert"));
  steps.push(cqStep(s, `Done. size = ${s.size}. Circular wrap at ${s.maxSize}.`, 6, [s.rear]));
  return steps;
}

export function circularDequeue(values: number[]): CircularQueueStep[] {
  const steps: CircularQueueStep[] = [];
  const s = buildCQ(values);

  steps.push(cqStep(s, `Dequeue from the circular queue.`, 1));
  steps.push(cqStep(s, `Check isEmpty: size = ${s.size}.`, 2));

  if (s.size === 0) {
    steps.push(cqStep(s, `Queue Underflow! Queue is empty.`, 3, [], "error"));
    return steps;
  }

  const val = s.slots[s.front]!.value;
  steps.push(cqStep(s, `Front element is ${val} at index ${s.front}.`, 4, [s.front], "delete"));
  s.slots[s.front] = null;
  const oldFront = s.front;
  s.front = (s.front + 1) % s.maxSize;
  s.size--;
  steps.push(cqStep(s, `Move front: (${oldFront} + 1) % ${s.maxSize} = ${s.front}.`, 5, s.size > 0 ? [s.front] : []));
  steps.push(cqStep(s, `Dequeued ${val}. size = ${s.size}.`, 6, s.size > 0 ? [s.front] : [], "found"));
  return steps;
}

export function circularFront(values: number[]): CircularQueueStep[] {
  const s = buildCQ(values);
  if (s.size === 0) return [cqStep(s, `Queue is empty.`, 1, [], "error")];
  const val = s.slots[s.front]!.value;
  return [
    cqStep(s, `Front: peek at index ${s.front}.`, 1, [s.front]),
    cqStep(s, `Front element is ${val}.`, 2, [s.front], "found"),
  ];
}

export function circularRear(values: number[]): CircularQueueStep[] {
  const s = buildCQ(values);
  if (s.size === 0) return [cqStep(s, `Queue is empty.`, 1, [], "error")];
  const val = s.slots[s.rear]!.value;
  return [
    cqStep(s, `Rear: peek at index ${s.rear}.`, 1, [s.rear]),
    cqStep(s, `Rear element is ${val}.`, 2, [s.rear], "found"),
  ];
}

export function circularIsEmpty(values: number[]): CircularQueueStep[] {
  const s = buildCQ(values);
  const empty = s.size === 0;
  return [
    cqStep(s, `isEmpty: is size == 0?`, 1),
    cqStep(s, `size = ${s.size}. isEmpty → ${empty}.`, 2, !empty ? [s.front] : [], empty ? "found" : "insert"),
  ];
}

export function circularIsFull(values: number[]): CircularQueueStep[] {
  const s = buildCQ(values);
  const full = s.size >= s.maxSize;
  return [
    cqStep(s, `isFull: is size == maxSize (${s.maxSize})?`, 1),
    cqStep(s, `size = ${s.size}. isFull → ${full}.`, 2, full ? Array.from({ length: s.maxSize }, (_, i) => i) : [], full ? "delete" : "found"),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// LINKED LIST QUEUE
// ═══════════════════════════════════════════════════════════════════════════════

export function llEnqueue(values: number[], value: number): LLQueueStep[] {
  const steps: LLQueueStep[] = [];
  const s = buildLL(values);

  steps.push(llStep(s, `Enqueue ${value}: add new node at the rear (tail).`, 1));

  const newNode: LLQueueNode = { id: newId(), value, next: null };
  s.nodes.push(newNode);

  if (!s.head) {
    s.head = newNode.id; s.tail = newNode.id;
    steps.push(llStep(s, `Queue was empty. New node is both head and tail.`, 2, [newNode.id], "insert"));
    return steps;
  }

  const oldTail = s.nodes.find((n) => n.id === s.tail)!;
  steps.push(llStep(s, `Create node(${value}).`, 2, [newNode.id], "insert"));
  oldTail.next = newNode.id;
  steps.push(llStep(s, `Link old tail (${oldTail.value}) → new node.`, 3, [oldTail.id, newNode.id]));
  s.tail = newNode.id;
  steps.push(llStep(s, `Update tail pointer to ${value}.`, 4, [newNode.id], "found"));
  return steps;
}

export function llDequeue(values: number[]): LLQueueStep[] {
  const steps: LLQueueStep[] = [];
  const s = buildLL(values);

  steps.push(llStep(s, `Dequeue: remove from the front (head).`, 1));

  if (!s.head) {
    steps.push(llStep(s, `Queue Underflow! Queue is empty.`, 2, [], "error"));
    return steps;
  }

  const headNode = s.nodes.find((n) => n.id === s.head)!;
  steps.push(llStep(s, `Front node is ${headNode.value}.`, 2, [headNode.id], "delete"));
  s.head = headNode.next;
  s.nodes = s.nodes.filter((n) => n.id !== headNode.id);
  if (!s.head) s.tail = null;
  steps.push(llStep(s, `Move head to next node${s.head ? ` (${s.nodes.find(n => n.id === s.head)?.value})` : " (null)"}.`, 3, s.head ? [s.head] : []));
  steps.push(llStep(s, `Dequeued ${headNode.value}.`, 4, s.head ? [s.head] : [], "found"));
  return steps;
}

export function llFront(values: number[]): LLQueueStep[] {
  const s = buildLL(values);
  if (!s.head) return [llStep(s, `Queue is empty.`, 1, [], "error")];
  const node = s.nodes.find((n) => n.id === s.head)!;
  return [
    llStep(s, `Front: peek at head node.`, 1, [node.id]),
    llStep(s, `Front element is ${node.value}. Queue unchanged.`, 2, [node.id], "found"),
  ];
}

export function llRear(values: number[]): LLQueueStep[] {
  const s = buildLL(values);
  if (!s.tail) return [llStep(s, `Queue is empty.`, 1, [], "error")];
  const node = s.nodes.find((n) => n.id === s.tail)!;
  return [
    llStep(s, `Rear: peek at tail node.`, 1, [node.id]),
    llStep(s, `Rear element is ${node.value}. Queue unchanged.`, 2, [node.id], "found"),
  ];
}

export function llIsEmpty(values: number[]): LLQueueStep[] {
  const s = buildLL(values);
  const empty = !s.head;
  return [
    llStep(s, `isEmpty: is head == null?`, 1),
    llStep(s, `head = ${empty ? "null" : `node(${s.nodes.find(n => n.id === s.head)?.value})`}. isEmpty → ${empty}.`, 2, s.head ? [s.head] : [], empty ? "found" : "insert"),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEQUE (Double-ended Queue)
// ═══════════════════════════════════════════════════════════════════════════════

export function dequeAddFront(values: number[], value: number): DequeStep[] {
  const steps: DequeStep[] = [];
  const s = buildDQ(values);

  steps.push(dqStep(s, `AddFront ${value}: insert at the front of the deque.`, 1));

  const newNode: DequeNode = { id: newId(), value, prev: null, next: s.head };
  s.nodes.unshift(newNode);

  if (s.head) {
    const oldHead = s.nodes.find((n) => n.id === s.head)!;
    oldHead.prev = newNode.id;
    steps.push(dqStep(s, `Create node(${value}). Link to old head (${oldHead.value}).`, 2, [newNode.id, oldHead.id], "insert"));
  } else {
    s.tail = newNode.id;
    steps.push(dqStep(s, `Deque was empty. New node is head and tail.`, 2, [newNode.id], "insert"));
  }
  s.head = newNode.id;
  steps.push(dqStep(s, `Update head pointer to ${value}.`, 3, [newNode.id], "found"));
  return steps;
}

export function dequeAddRear(values: number[], value: number): DequeStep[] {
  const steps: DequeStep[] = [];
  const s = buildDQ(values);

  steps.push(dqStep(s, `AddRear ${value}: insert at the rear of the deque.`, 1));

  const newNode: DequeNode = { id: newId(), value, prev: s.tail, next: null };
  s.nodes.push(newNode);

  if (s.tail) {
    const oldTail = s.nodes.find((n) => n.id === s.tail)!;
    oldTail.next = newNode.id;
    steps.push(dqStep(s, `Create node(${value}). Link old tail (${oldTail.value}) → new node.`, 2, [oldTail.id, newNode.id], "insert"));
  } else {
    s.head = newNode.id;
    steps.push(dqStep(s, `Deque was empty. New node is head and tail.`, 2, [newNode.id], "insert"));
  }
  s.tail = newNode.id;
  steps.push(dqStep(s, `Update tail pointer to ${value}.`, 3, [newNode.id], "found"));
  return steps;
}

export function dequeRemoveFront(values: number[]): DequeStep[] {
  const steps: DequeStep[] = [];
  const s = buildDQ(values);

  steps.push(dqStep(s, `RemoveFront: remove the front element.`, 1));

  if (!s.head) {
    steps.push(dqStep(s, `Deque is empty!`, 2, [], "error"));
    return steps;
  }

  const headNode = s.nodes.find((n) => n.id === s.head)!;
  steps.push(dqStep(s, `Front is ${headNode.value}.`, 2, [headNode.id], "delete"));
  s.head = headNode.next;
  s.nodes = s.nodes.filter((n) => n.id !== headNode.id);
  if (s.head) { const n = s.nodes.find((n) => n.id === s.head)!; n.prev = null; }
  else s.tail = null;
  steps.push(dqStep(s, `Removed ${headNode.value}. New front: ${s.head ? s.nodes.find(n => n.id === s.head)?.value : "null"}.`, 3, s.head ? [s.head] : [], "found"));
  return steps;
}

export function dequeRemoveRear(values: number[]): DequeStep[] {
  const steps: DequeStep[] = [];
  const s = buildDQ(values);

  steps.push(dqStep(s, `RemoveRear: remove the rear element.`, 1));

  if (!s.tail) {
    steps.push(dqStep(s, `Deque is empty!`, 2, [], "error"));
    return steps;
  }

  const tailNode = s.nodes.find((n) => n.id === s.tail)!;
  steps.push(dqStep(s, `Rear is ${tailNode.value}.`, 2, [tailNode.id], "delete"));
  s.tail = tailNode.prev;
  s.nodes = s.nodes.filter((n) => n.id !== tailNode.id);
  if (s.tail) { const n = s.nodes.find((n) => n.id === s.tail)!; n.next = null; }
  else s.head = null;
  steps.push(dqStep(s, `Removed ${tailNode.value}. New rear: ${s.tail ? s.nodes.find(n => n.id === s.tail)?.value : "null"}.`, 3, s.tail ? [s.tail] : [], "found"));
  return steps;
}

export function dequePeekFront(values: number[]): DequeStep[] {
  const s = buildDQ(values);
  if (!s.head) return [dqStep(s, `Deque is empty.`, 1, [], "error")];
  const node = s.nodes.find((n) => n.id === s.head)!;
  return [
    dqStep(s, `PeekFront: look at front without removing.`, 1, [node.id]),
    dqStep(s, `Front is ${node.value}.`, 2, [node.id], "found"),
  ];
}

export function dequePeekRear(values: number[]): DequeStep[] {
  const s = buildDQ(values);
  if (!s.tail) return [dqStep(s, `Deque is empty.`, 1, [], "error")];
  const node = s.nodes.find((n) => n.id === s.tail)!;
  return [
    dqStep(s, `PeekRear: look at rear without removing.`, 1, [node.id]),
    dqStep(s, `Rear is ${node.value}.`, 2, [node.id], "found"),
  ];
}

export function dequeIsEmpty(values: number[]): DequeStep[] {
  const s = buildDQ(values);
  const empty = !s.head;
  return [
    dqStep(s, `isEmpty: is head == null?`, 1),
    dqStep(s, `isEmpty → ${empty}.`, 2, s.head ? [s.head] : [], empty ? "found" : "insert"),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANNOTATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const QUEUE_ANNOTATIONS: Record<QueueType, Record<string, Record<number, string>>> = {
  simple: {
    enqueue: {
      2: "if condition: size == maxSize means every slot is occupied. Simple queue cannot wrap around — once full, it stays full.",
      3: "rear = rear + 1 moves the rear pointer right. With a simple queue this never wraps, so rear drifts rightward forever.",
      4: "Write the value at the new rear index — O(1) array write.",
      5: "Increment size to keep track of how many elements are currently in the queue.",
    },
    dequeue: {
      2: "if condition: size == 0 means the queue is empty — no elements to remove.",
      3: "Read the front value before nulling the slot.",
      4: "Null the slot to free memory (optional but clean practice).",
      5: "if condition: last element was just removed — reset both pointers to their initial state.",
      6: "else: advance front pointer right. This is an O(1) logical remove — no shifting needed.",
    },
    front:   { 2: "if condition: guard against calling front() on an empty queue.", 3: "Return queue[front] without modifying anything — O(1) read." },
    isEmpty: { 2: "size == 0 is the authoritative empty check. front and rear pointers alone can be ambiguous." },
    isFull:  { 2: "size == maxSize. In a simple queue, once full it cannot be reused without dequeuing." },
  },
  circular: {
    enqueue: {
      2: "if condition: size == maxSize — circular queue is full even though slots may appear 'empty' (previously dequeued).",
      3: "rear = (rear + 1) % maxSize — modular arithmetic wraps the rear pointer back to index 0 when it reaches the end. This is the key trick.",
      4: "Write the value at the new rear position.",
      5: "Increment size — this is how we distinguish 'full' from 'empty' when front == rear.",
    },
    dequeue: {
      2: "if condition: size == 0 check. We cannot use front == rear because that's also true when the queue is full.",
      4: "Null the dequeued slot so it can be reused on the next enqueue.",
      5: "front = (front + 1) % maxSize — same modular wrap as rear. The circular structure reuses freed slots.",
      6: "Decrement size to reflect the removal.",
    },
    front:   { 2: "Guard against empty.", 3: "O(1) read at queue[front]. No traversal needed." },
    rear:    { 2: "Guard against empty.", 3: "O(1) read at queue[rear]. Direct access via pointer." },
    isEmpty: { 2: "size == 0 is the unambiguous check — don't use front == rear (also true when full)." },
    isFull:  { 2: "size == maxSize. With a circular queue the array is fully utilized before refusing." },
  },
  linkedlist: {
    enqueue: {
      2: "Allocate new node — no capacity limit since memory is dynamic.",
      3: "if condition: empty queue — the new node becomes both the front (head) and rear (tail).",
      4: "tail.next = node links the current tail to the new node — O(1) append.",
      5: "Move tail pointer forward — O(1). We maintain a tail pointer specifically to avoid O(n) traversal.",
    },
    dequeue: {
      2: "if condition: head == null means empty queue.",
      3: "Save head.value before moving the pointer.",
      4: "head = head.next advances the front pointer — O(1) remove.",
      5: "if condition: removing the last node empties both head and tail — tail must be nulled too.",
    },
    front:   { 2: "Guard against empty.", 3: "head.value is the front. O(1) because we always track head." },
    rear:    { 2: "Guard against empty.", 3: "tail.value is the rear. O(1) because we always track tail." },
    isEmpty: { 2: "head == null — when the list is empty the head pointer is null." },
  },
  deque: {
    addFront: {
      2: "Allocate node — no capacity limit.",
      3: "node.next = head points new node forward — prepending to doubly-linked list.",
      4: "if condition: update old head's prev pointer backward to the new node — maintains doubly-linked invariant.",
      5: "head = node — new node is now the front.",
      6: "if condition: if tail was null the list was empty — new node is also the tail.",
    },
    addRear: {
      2: "Allocate node.",
      3: "node.prev = tail points new node backward — appending to doubly-linked list.",
      4: "if condition: update old tail's next to the new node.",
      5: "tail = node — new node is now the rear.",
      6: "if condition: empty list — new node is also the head.",
    },
    removeFront: {
      2: "if condition: empty deque guard.",
      4: "head = head.next advances the front — O(1).",
      5: "if condition: if new head exists, clear its backward pointer (no longer needed).",
      6: "else: removing last node — tail must also be cleared.",
    },
    removeRear: {
      2: "if condition: empty deque guard.",
      4: "tail = tail.prev moves the rear backward — O(1) because of the prev pointer.",
      5: "if condition: clear the new tail's forward pointer.",
      6: "else: removing last node — head must also be cleared.",
    },
    peekFront: { 2: "Guard against empty.", 3: "Return head.value — O(1) read." },
    peekRear:  { 2: "Guard against empty.", 3: "Return tail.value — O(1) read." },
    isEmpty:   { 2: "head == null — doubly-linked deque is empty when head is null." },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// PSEUDOCODE
// ═══════════════════════════════════════════════════════════════════════════════

export const QUEUE_CODE: Record<QueueType, Record<string, string[]>> = {
  simple: {
    enqueue: ["function enqueue(value) {", "  if (size == maxSize) throw Overflow;", "  rear = rear + 1;", "  queue[rear] = value;", "  size++;", "  // done", "}"],
    dequeue: ["function dequeue() {", "  if (size == 0) throw Underflow;", "  value = queue[front];", "  queue[front] = null;", "  if (size == 1) { front = 0; rear = -1; }", "  else front++;", "  return value;", "}"],
    front:   ["function front() {", "  if (size == 0) return null;", "  return queue[front];", "}"],
    isEmpty: ["function isEmpty() {", "  return size == 0;", "}"],
    isFull:  ["function isFull() {", "  return size == maxSize;", "}"],
  },
  circular: {
    enqueue: ["function enqueue(value) {", "  if (size == maxSize) throw Overflow;", "  rear = (rear + 1) % maxSize;", "  queue[rear] = value;", "  size++;", "  // wrap-around handled", "}"],
    dequeue: ["function dequeue() {", "  if (size == 0) throw Underflow;", "  value = queue[front];", "  queue[front] = null;", "  front = (front + 1) % maxSize;", "  size--;", "  return value;", "}"],
    front:   ["function front() {", "  if (size == 0) return null;", "  return queue[front];", "}"],
    rear:    ["function rear() {", "  if (size == 0) return null;", "  return queue[rear];", "}"],
    isEmpty: ["function isEmpty() {", "  return size == 0;", "}"],
    isFull:  ["function isFull() {", "  return size == maxSize;", "}"],
  },
  linkedlist: {
    enqueue: ["function enqueue(value) {", "  node = new Node(value);", "  if (!head) { head = tail = node; return; }", "  tail.next = node;", "  tail = node;", "}"],
    dequeue: ["function dequeue() {", "  if (!head) throw Underflow;", "  value = head.value;", "  head = head.next;", "  if (!head) tail = null;", "  return value;", "}"],
    front:   ["function front() {", "  if (!head) return null;", "  return head.value;", "}"],
    rear:    ["function rear() {", "  if (!tail) return null;", "  return tail.value;", "}"],
    isEmpty: ["function isEmpty() {", "  return head == null;", "}"],
  },
  deque: {
    addFront:     ["function addFront(value) {", "  node = new Node(value);", "  node.next = head;", "  if (head) head.prev = node;", "  head = node;", "  if (!tail) tail = node;", "}"],
    addRear:      ["function addRear(value) {", "  node = new Node(value);", "  node.prev = tail;", "  if (tail) tail.next = node;", "  tail = node;", "  if (!head) head = node;", "}"],
    removeFront:  ["function removeFront() {", "  if (!head) throw Error;", "  value = head.value;", "  head = head.next;", "  if (head) head.prev = null;", "  else tail = null;", "  return value;", "}"],
    removeRear:   ["function removeRear() {", "  if (!tail) throw Error;", "  value = tail.value;", "  tail = tail.prev;", "  if (tail) tail.next = null;", "  else head = null;", "  return value;", "}"],
    peekFront:    ["function peekFront() {", "  if (!head) return null;", "  return head.value;", "}"],
    peekRear:     ["function peekRear() {", "  if (!tail) return null;", "  return tail.value;", "}"],
    isEmpty:      ["function isEmpty() {", "  return head == null;", "}"],
  },
};

export const QUEUE_COMPLEXITY: Record<string, { time: string; space: string; note: string }> = {
  enqueue:     { time: "O(1)", space: "O(1)", note: "Append to rear — constant time for all queue types." },
  dequeue:     { time: "O(1)", space: "O(1)", note: "Remove from front — O(1) with front pointer or LL." },
  front:       { time: "O(1)", space: "O(1)", note: "Direct access to head/front pointer." },
  rear:        { time: "O(1)", space: "O(1)", note: "Direct access to tail/rear pointer." },
  isEmpty:     { time: "O(1)", space: "O(1)", note: "Single null/zero check." },
  isFull:      { time: "O(1)", space: "O(1)", note: "Compare size to capacity." },
  addFront:    { time: "O(1)", space: "O(1)", note: "Insert before head — update head pointer." },
  addRear:     { time: "O(1)", space: "O(1)", note: "Insert after tail — update tail pointer." },
  removeFront: { time: "O(1)", space: "O(1)", note: "Remove head, update prev pointers." },
  removeRear:  { time: "O(1)", space: "O(1)", note: "Remove tail, update next pointers." },
  peekFront:   { time: "O(1)", space: "O(1)", note: "Read head.value without removal." },
  peekRear:    { time: "O(1)", space: "O(1)", note: "Read tail.value without removal." },
};
