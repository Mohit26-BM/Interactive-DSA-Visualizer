import { Step } from "./types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DLLNode {
  id: string;
  value: number;
  prev: string | null;
  next: string | null;
}

export interface DLLState {
  nodes: DLLNode[];
  head: string | null;
  tail: string | null;
}

export interface DLLStep extends Step {
  state: DLLState;
  highlightNodes: string[];
  highlightArrows?: string[]; // arrow IDs like "a→b"
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

let idCounter = 0;
const newId = () => `dll-${idCounter++}`;

function clone(s: DLLState): DLLState {
  return { nodes: s.nodes.map((n) => ({ ...n })), head: s.head, tail: s.tail };
}

function st(s: DLLState, explanation: string, hl: number, hn: string[] = [], phase?: string): DLLStep {
  return { state: clone(s), explanation, highlightLine: hl, highlightNodes: hn, phase };
}

function build(values: number[]): DLLState {
  if (values.length === 0) return { nodes: [], head: null, tail: null };
  const nodes: DLLNode[] = values.map((v) => ({ id: newId(), value: v, prev: null, next: null }));
  for (let i = 0; i < nodes.length; i++) {
    if (i > 0) nodes[i].prev = nodes[i - 1].id;
    if (i < nodes.length - 1) nodes[i].next = nodes[i + 1].id;
  }
  return { nodes, head: nodes[0].id, tail: nodes[nodes.length - 1].id };
}

function nodeVal(s: DLLState, id: string | null): number | string {
  if (!id) return "null";
  return s.nodes.find((n) => n.id === id)?.value ?? "?";
}

// ─── Operations ───────────────────────────────────────────────────────────────

export function dllInsertAtHead(values: number[], value: number): DLLStep[] {
  const steps: DLLStep[] = [];
  const s = build(values);

  steps.push(st(s, `Insert ${value} at head of doubly linked list.`, 1));

  const node: DLLNode = { id: newId(), value, prev: null, next: s.head };
  s.nodes.unshift(node);

  steps.push(st(s, `Create node(${value}). Set its next → old head (${nodeVal(s, node.next)}), prev → null.`, 2, [node.id], "insert"));

  if (node.next) {
    const oldHead = s.nodes.find((n) => n.id === node.next)!;
    oldHead.prev = node.id;
    steps.push(st(s, `Set old head(${oldHead.value}).prev → new node(${value}).`, 3, [node.id, oldHead.id], "insert"));
  }

  s.head = node.id;
  if (!s.tail) s.tail = node.id;
  steps.push(st(s, `Update head pointer to node(${value}). Done.`, 4, [node.id], "found"));
  return steps;
}

export function dllInsertAtTail(values: number[], value: number): DLLStep[] {
  const steps: DLLStep[] = [];
  const s = build(values);

  steps.push(st(s, `Insert ${value} at tail of doubly linked list.`, 1));

  const node: DLLNode = { id: newId(), value, prev: s.tail, next: null };
  s.nodes.push(node);

  steps.push(st(s, `Create node(${value}). Set its prev → old tail (${nodeVal(s, node.prev)}), next → null.`, 2, [node.id], "insert"));

  if (node.prev) {
    const oldTail = s.nodes.find((n) => n.id === node.prev)!;
    oldTail.next = node.id;
    steps.push(st(s, `Set old tail(${oldTail.value}).next → new node(${value}).`, 3, [node.id, oldTail.id], "insert"));
  }

  s.tail = node.id;
  if (!s.head) s.head = node.id;
  steps.push(st(s, `Update tail pointer to node(${value}). Done.`, 4, [node.id], "found"));
  return steps;
}

export function dllInsertAtPosition(values: number[], value: number, position: number): DLLStep[] {
  const steps: DLLStep[] = [];
  const s = build(values);

  steps.push(st(s, `Insert ${value} at position ${position}.`, 1));

  if (position < 0 || position > s.nodes.length) {
    steps.push(st(s, `Position ${position} out of bounds (0–${s.nodes.length}). Abort.`, 2, [], "error"));
    return steps;
  }
  if (position === 0) return dllInsertAtHead(values, value);
  if (position === s.nodes.length) return dllInsertAtTail(values, value);

  steps.push(st(s, `Traverse to position ${position - 1}.`, 2));

  let cur = s.head;
  for (let i = 0; i < position - 1; i++) {
    const node = s.nodes.find((n) => n.id === cur)!;
    steps.push(st(s, `At index ${i}: node(${node.value}). Move forward.`, 3, [cur!]));
    cur = node.next;
  }
  const prev = s.nodes.find((n) => n.id === cur)!;
  const nextId = prev.next;
  const nextNode = s.nodes.find((n) => n.id === nextId);

  const node: DLLNode = { id: newId(), value, prev: prev.id, next: nextId };
  s.nodes.splice(position, 0, node);

  prev.next = node.id;
  if (nextNode) nextNode.prev = node.id;

  steps.push(st(s, `Insert node(${value}) between node(${prev.value}) and node(${nextNode?.value ?? "null"}).`, 4, [node.id, prev.id], "insert"));
  steps.push(st(s, `Link: prev.next → ${value}, ${value}.prev → ${prev.value}, ${value}.next → ${nextNode?.value ?? "null"}.`, 5, [node.id], "found"));
  return steps;
}

export function dllDeleteAtHead(values: number[]): DLLStep[] {
  const steps: DLLStep[] = [];
  const s = build(values);

  steps.push(st(s, `Delete head node.`, 1));

  if (!s.head) {
    steps.push(st(s, `List is empty — nothing to delete.`, 2, [], "error"));
    return steps;
  }

  const headNode = s.nodes.find((n) => n.id === s.head)!;
  steps.push(st(s, `Head is node(${headNode.value}). Mark for removal.`, 2, [headNode.id], "delete"));

  s.head = headNode.next;
  s.nodes = s.nodes.filter((n) => n.id !== headNode.id);
  if (s.head) {
    const newHead = s.nodes.find((n) => n.id === s.head)!;
    newHead.prev = null;
    steps.push(st(s, `Set new head(${newHead.value}).prev → null.`, 3, [newHead.id]));
  } else {
    s.tail = null;
  }

  steps.push(st(s, `Deleted ${headNode.value}. List updated.`, 4, s.head ? [s.head] : [], "found"));
  return steps;
}

export function dllDeleteAtTail(values: number[]): DLLStep[] {
  const steps: DLLStep[] = [];
  const s = build(values);

  steps.push(st(s, `Delete tail node.`, 1));

  if (!s.tail) {
    steps.push(st(s, `List is empty — nothing to delete.`, 2, [], "error"));
    return steps;
  }

  const tailNode = s.nodes.find((n) => n.id === s.tail)!;
  steps.push(st(s, `Tail is node(${tailNode.value}). Mark for removal.`, 2, [tailNode.id], "delete"));

  s.tail = tailNode.prev;
  s.nodes = s.nodes.filter((n) => n.id !== tailNode.id);
  if (s.tail) {
    const newTail = s.nodes.find((n) => n.id === s.tail)!;
    newTail.next = null;
    steps.push(st(s, `Set new tail(${newTail.value}).next → null.`, 3, [newTail.id]));
  } else {
    s.head = null;
  }

  steps.push(st(s, `Deleted ${tailNode.value}. List updated.`, 4, s.tail ? [s.tail] : [], "found"));
  return steps;
}

export function dllDeleteAtPosition(values: number[], position: number): DLLStep[] {
  const steps: DLLStep[] = [];
  const s = build(values);

  steps.push(st(s, `Delete node at position ${position}.`, 1));

  if (s.nodes.length === 0 || position < 0 || position >= s.nodes.length) {
    steps.push(st(s, `Position ${position} out of bounds. Abort.`, 2, [], "error"));
    return steps;
  }
  if (position === 0) return dllDeleteAtHead(values);
  if (position === s.nodes.length - 1) return dllDeleteAtTail(values);

  steps.push(st(s, `Traverse to position ${position}.`, 2));

  let cur = s.head;
  for (let i = 0; i < position; i++) {
    const n = s.nodes.find((n) => n.id === cur)!;
    steps.push(st(s, `At index ${i}: node(${n.value}). Move forward.`, 3, [cur!]));
    cur = n.next;
  }

  const target = s.nodes.find((n) => n.id === cur)!;
  steps.push(st(s, `Found node(${target.value}) at position ${position}. Unlink it.`, 4, [target.id], "delete"));

  const prevNode = s.nodes.find((n) => n.id === target.prev);
  const nextNode = s.nodes.find((n) => n.id === target.next);
  if (prevNode) prevNode.next = target.next;
  if (nextNode) nextNode.prev = target.prev;
  s.nodes = s.nodes.filter((n) => n.id !== target.id);

  const linkIds = [prevNode?.id, nextNode?.id].filter(Boolean) as string[];
  steps.push(st(s, `Set prev(${prevNode?.value}).next → ${nextNode?.value ?? "null"} and next(${nextNode?.value ?? "null"}).prev → ${prevNode?.value ?? "null"}.`, 5, linkIds, "found"));
  return steps;
}

export function dllSearch(values: number[], target: number): DLLStep[] {
  const steps: DLLStep[] = [];
  const s = build(values);

  steps.push(st(s, `Search for ${target} in doubly linked list.`, 1));

  let cur = s.head;
  let idx = 0;
  while (cur) {
    const node = s.nodes.find((n) => n.id === cur)!;
    steps.push(st(s, `Check node(${node.value}) at index ${idx}: ${node.value === target ? "MATCH!" : "not a match."}`, node.value === target ? 4 : 3, [node.id], node.value === target ? "found" : undefined));
    if (node.value === target) {
      steps.push(st(s, `Found ${target} at index ${idx}!`, 5, [node.id], "found"));
      return steps;
    }
    cur = node.next;
    idx++;
  }

  steps.push(st(s, `${target} not found in list. Traversal complete.`, 6, [], "error"));
  return steps;
}

export function dllReverse(values: number[]): DLLStep[] {
  const steps: DLLStep[] = [];
  const s = build(values);

  steps.push(st(s, `Reverse the doubly linked list.`, 1));
  steps.push(st(s, `Swap prev and next pointers for each node.`, 2));

  let cur: string | null = s.head;
  while (cur) {
    const node = s.nodes.find((n) => n.id === cur)!;
    const tmp = node.prev;
    node.prev = node.next;
    node.next = tmp;
    steps.push(st(s, `Swap node(${node.value}).prev ↔ next.`, 3, [node.id]));
    cur = node.prev; // was next before swap
  }

  const oldTail = s.tail;
  s.tail = s.head;
  s.head = oldTail;

  steps.push(st(s, `Swap head ↔ tail pointers. List is now reversed.`, 4, s.head ? [s.head] : [], "found"));
  return steps;
}

// ─── Pseudocode ──────────────────────────────────────────────────────────────

export const DLL_CODE: Record<string, string[]> = {
  insertAtHead: [
    "function insertAtHead(value) {",
    "  node = new Node(value);",
    "  node.next = head; node.prev = null;",
    "  if (head) head.prev = node;",
    "  head = node;",
    "  if (tail == null) tail = node;",
    "}",
  ],
  insertAtTail: [
    "function insertAtTail(value) {",
    "  node = new Node(value);",
    "  node.prev = tail; node.next = null;",
    "  if (tail) tail.next = node;",
    "  tail = node;",
    "  if (head == null) head = node;",
    "}",
  ],
  insertAtPosition: [
    "function insertAtPosition(value, pos) {",
    "  if (pos < 0 || pos > size) throw Error;",
    "  curr = head; i = 0;",
    "  while (i < pos - 1) { curr = curr.next; i++; }",
    "  node = new Node(value);",
    "  node.prev = curr; node.next = curr.next;",
    "  if (curr.next) curr.next.prev = node;",
    "  curr.next = node;",
    "}",
  ],
  deleteAtHead: [
    "function deleteAtHead() {",
    "  if (head == null) throw Error;",
    "  old = head; head = head.next;",
    "  if (head) head.prev = null;",
    "  else tail = null;",
    "}",
  ],
  deleteAtTail: [
    "function deleteAtTail() {",
    "  if (tail == null) throw Error;",
    "  old = tail; tail = tail.prev;",
    "  if (tail) tail.next = null;",
    "  else head = null;",
    "}",
  ],
  deleteAtPosition: [
    "function deleteAtPosition(pos) {",
    "  if (pos < 0 || pos >= size) throw Error;",
    "  curr = head; i = 0;",
    "  while (i < pos) { curr = curr.next; i++; }",
    "  curr.prev.next = curr.next;",
    "  if (curr.next) curr.next.prev = curr.prev;",
    "}",
  ],
  search: [
    "function search(target) {",
    "  curr = head; idx = 0;",
    "  while (curr != null) {",
    "    if (curr.value == target)",
    "      return idx;",
    "    curr = curr.next; idx++;",
    "  }",
    "  return -1;",
    "}",
  ],
  reverse: [
    "function reverse() {",
    "  curr = head;",
    "  while (curr != null) {",
    "    swap(curr.prev, curr.next);",
    "    curr = curr.prev; // was next",
    "  }",
    "  swap(head, tail);",
    "}",
  ],
};

export const DLL_ANNOTATIONS: Record<string, Record<number, string>> = {
  insertAtHead: {
    3: "Set next to old head (forward link) AND prev to null (back link) — both pointers set in one step, the key advantage of doubly linked.",
    4: "Must update old head's prev to point back to new node — this is the 'doubly' part that singly LL omits.",
    5: "Update head in O(1) — no traversal needed for head insertion.",
  },
  insertAtTail: {
    3: "Tail insertion mirrors head insertion. Set prev to old tail (back link), next to null.",
    4: "Update old tail's next to link forward to the new node.",
    5: "Update tail in O(1) — doubly LL can track tail easily since every node has prev.",
  },
  insertAtPosition: {
    4: "while loop: traverse to position-1. We stop BEFORE the insertion point so we have the prev node reference.",
    5: "Both prev and next are set on creation — doubly LL allocates both links simultaneously.",
    7: "Update next node's prev pointer — the backward link that singly LL doesn't have.",
  },
  deleteAtHead: {
    3: "Save old head then advance head — read before moving, or we lose the reference.",
    4: "Reset new head's prev to null — crucial to avoid a dangling backward pointer.",
  },
  deleteAtTail: {
    3: "Move tail backward using prev pointer — O(1). In singly LL, deleteAtTail is O(n) because there's no prev.",
    4: "Reset new tail's next to null — clean up the forward pointer.",
  },
  deleteAtPosition: {
    4: "while loop: traverse to exact node. Since we have prev, we don't need to stop one before like singly LL.",
    5: "curr.prev.next = curr.next — bypass the deleted node in the forward direction.",
    6: "curr.next.prev = curr.prev — bypass in the backward direction. Two pointer updates needed.",
  },
  search: {
    3: "while loop: traverse forward just like singly LL. Doubly LL can also traverse backward from tail.",
    5: "Return index on match — O(n) worst case; no better than singly LL for unsorted data.",
  },
  reverse: {
    3: "while loop: visit every node exactly once — O(n).",
    4: "swap(prev, next) on each node reverses both links in one operation — cleaner than singly LL reverse.",
    5: "curr = curr.prev (the old next) — we already swapped, so 'prev' now holds the forward direction.",
    6: "Swap head and tail — the only extra step vs singly LL reverse, because doubly LL tracks both ends.",
  },
};

export const DLL_COMPLEXITY: Record<string, { time: string; space: string; note: string }> = {
  insertAtHead:     { time: "O(1)", space: "O(1)", note: "Update head + set neighbor's prev pointer — constant time." },
  insertAtTail:     { time: "O(1)", space: "O(1)", note: "Tail pointer enables O(1) tail insert — singly LL is O(n)." },
  insertAtPosition: { time: "O(n)", space: "O(1)", note: "Traverse to position, then O(1) pointer updates." },
  deleteAtHead:     { time: "O(1)", space: "O(1)", note: "Move head, clear new head's prev — constant time." },
  deleteAtTail:     { time: "O(1)", space: "O(1)", note: "prev pointer makes tail delete O(1) — a key DLL advantage." },
  deleteAtPosition: { time: "O(n)", space: "O(1)", note: "Traverse to node, then O(1) to unlink with prev+next." },
  search:           { time: "O(n)", space: "O(1)", note: "Sequential scan — can go forward or backward." },
  reverse:          { time: "O(n)", space: "O(1)", note: "Single pass swapping all prev/next pointers." },
};
