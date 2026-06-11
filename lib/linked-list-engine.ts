import { LinkedListStep, LinkedListState, LinkedListNode } from "./types";

let idCounter = 0;
const newId = () => `node-${idCounter++}`;

function clone(state: LinkedListState): LinkedListState {
  return {
    nodes: state.nodes.map((n) => ({ ...n })),
    head: state.head,
  };
}

function step(
  state: LinkedListState,
  explanation: string,
  highlightLine: number,
  highlightNodes: string[] = [],
  phase?: string
): LinkedListStep {
  return { state: clone(state), explanation, highlightLine, highlightNodes, phase };
}

function buildList(values: number[]): LinkedListState {
  if (values.length === 0) return { nodes: [], head: null };
  const nodes: LinkedListNode[] = values.map((v) => ({ id: newId(), value: v, next: null }));
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1].id;
  return { nodes, head: nodes[0].id };
}

export function llInsertAtHead(values: number[], value: number): LinkedListStep[] {
  const steps: LinkedListStep[] = [];
  const state = buildList(values);

  steps.push(step(state, `Insert ${value} at the head of the list.`, 1));

  const newNode: LinkedListNode = { id: newId(), value, next: state.head };
  steps.push(step({ nodes: [...state.nodes, newNode], head: state.head }, `Create new node with value ${value}.`, 2, [newNode.id], "insert"));

  state.nodes.push(newNode);
  const oldHead = state.head;
  state.head = newNode.id;

  steps.push(step(state, `Point new node's next to old head${oldHead ? ` (${state.nodes.find(n => n.id === oldHead)?.value})` : " (null)"}.`, 3, [newNode.id, ...(oldHead ? [oldHead] : [])]));
  steps.push(step(state, `Update head pointer to new node.`, 4, [newNode.id], "found"));
  steps.push(step(state, `Done. New head is ${value}.`, 5, [newNode.id]));

  return steps;
}

export function llInsertAtTail(values: number[], value: number): LinkedListStep[] {
  const steps: LinkedListStep[] = [];
  const state = buildList(values);

  steps.push(step(state, `Insert ${value} at the tail of the list.`, 1));

  const newNode: LinkedListNode = { id: newId(), value, next: null };

  if (!state.head) {
    state.nodes.push(newNode);
    state.head = newNode.id;
    steps.push(step(state, `List is empty. New node becomes the head.`, 2, [newNode.id], "insert"));
    return steps;
  }

  steps.push(step(state, `Traverse to the last node.`, 2));

  let current = state.nodes.find((n) => n.id === state.head)!;
  steps.push(step(state, `Start at head: node ${current.value}.`, 2, [current.id]));

  while (current.next) {
    const next = state.nodes.find((n) => n.id === current.next)!;
    steps.push(step(state, `Node ${current.value} has next → move to ${next.value}.`, 3, [current.id, next.id]));
    current = next;
  }

  steps.push(step(state, `Reached tail node ${current.value} (next is null).`, 4, [current.id]));

  state.nodes.push(newNode);
  current.next = newNode.id;

  steps.push(step(state, `Create new node ${value} and link tail to it.`, 5, [current.id, newNode.id], "insert"));
  steps.push(step(state, `Done. ${value} is now the new tail.`, 6, [newNode.id], "found"));

  return steps;
}

export function llInsertAtPosition(values: number[], value: number, position: number): LinkedListStep[] {
  const steps: LinkedListStep[] = [];
  const state = buildList(values);

  steps.push(step(state, `Insert ${value} at position ${position} (0-indexed).`, 1));

  if (position === 0) {
    return llInsertAtHead(values, value);
  }

  if (position < 0 || position > state.nodes.length) {
    steps.push(step(state, `Position ${position} is out of bounds.`, 2, [], "error"));
    return steps;
  }

  let current = state.nodes.find((n) => n.id === state.head)!;
  steps.push(step(state, `Start at head: node ${current.value}.`, 2, [current.id]));

  for (let i = 0; i < position - 1; i++) {
    const next = state.nodes.find((n) => n.id === current.next)!;
    steps.push(step(state, `Move to node at index ${i + 1}: ${next.value}.`, 3, [next.id]));
    current = next;
  }

  steps.push(step(state, `Stopped at node ${current.value} (index ${position - 1}). Insert after this node.`, 4, [current.id]));

  const newNode: LinkedListNode = { id: newId(), value, next: current.next };
  state.nodes.push(newNode);

  steps.push(step(state, `Create new node ${value}, point its next to ${current.next ? state.nodes.find(n => n.id === current.next)?.value : "null"}.`, 5, [newNode.id, ...(current.next ? [current.next] : [])], "insert"));

  current.next = newNode.id;

  steps.push(step(state, `Link node ${current.value} to new node ${value}.`, 6, [current.id, newNode.id]));
  steps.push(step(state, `Done. ${value} inserted at position ${position}.`, 7, [newNode.id], "found"));

  return steps;
}

export function llDeleteAtHead(values: number[]): LinkedListStep[] {
  const steps: LinkedListStep[] = [];
  const state = buildList(values);

  steps.push(step(state, `Delete the head node.`, 1));

  if (!state.head) {
    steps.push(step(state, `List is empty. Nothing to delete.`, 2, [], "error"));
    return steps;
  }

  const headNode = state.nodes.find((n) => n.id === state.head)!;
  steps.push(step(state, `Head node is ${headNode.value}.`, 2, [headNode.id], "delete"));

  state.head = headNode.next;
  state.nodes = state.nodes.filter((n) => n.id !== headNode.id);

  steps.push(step(state, `Move head pointer to next node${state.head ? ` (${state.nodes.find(n => n.id === state.head)?.value})` : " (null)"}.`, 3, state.head ? [state.head] : []));
  steps.push(step(state, `Node ${headNode.value} removed. Done.`, 4, state.head ? [state.head] : [], "found"));

  return steps;
}

export function llDeleteAtTail(values: number[]): LinkedListStep[] {
  const steps: LinkedListStep[] = [];
  const state = buildList(values);

  steps.push(step(state, `Delete the tail node.`, 1));

  if (!state.head) {
    steps.push(step(state, `List is empty. Nothing to delete.`, 2, [], "error"));
    return steps;
  }

  if (!state.nodes.find(n => n.id === state.head)!.next) {
    const onlyNode = state.nodes[0];
    steps.push(step(state, `Only one node (${onlyNode.value}). Removing it.`, 2, [onlyNode.id], "delete"));
    state.nodes = [];
    state.head = null;
    steps.push(step(state, `List is now empty.`, 3));
    return steps;
  }

  let prev: LinkedListNode | null = null;
  let current = state.nodes.find((n) => n.id === state.head)!;
  steps.push(step(state, `Start at head: ${current.value}.`, 2, [current.id]));

  while (current.next) {
    const next = state.nodes.find((n) => n.id === current.next)!;
    steps.push(step(state, `Move: prev = ${current.value}, current = ${next.value}.`, 3, [current.id, next.id]));
    prev = current;
    current = next;
  }

  steps.push(step(state, `Reached tail: ${current.value}. Previous node: ${prev?.value}.`, 4, [current.id, ...(prev ? [prev.id] : [])], "delete"));

  state.nodes = state.nodes.filter((n) => n.id !== current.id);
  if (prev) prev.next = null;

  steps.push(step(state, `Set ${prev?.value}'s next to null. Tail ${current.value} removed.`, 5, prev ? [prev.id] : [], "found"));

  return steps;
}

export function llDeleteAtPosition(values: number[], position: number): LinkedListStep[] {
  const steps: LinkedListStep[] = [];
  const state = buildList(values);

  steps.push(step(state, `Delete node at position ${position} (0-indexed).`, 1));

  if (position === 0) return llDeleteAtHead(values);

  if (position < 0 || position >= state.nodes.length) {
    steps.push(step(state, `Position ${position} is out of bounds.`, 2, [], "error"));
    return steps;
  }

  let prev = state.nodes.find((n) => n.id === state.head)!;
  steps.push(step(state, `Start at head: ${prev.value}.`, 2, [prev.id]));

  for (let i = 0; i < position - 1; i++) {
    const next = state.nodes.find((n) => n.id === prev.next)!;
    steps.push(step(state, `Move to index ${i + 1}: node ${next.value}.`, 3, [next.id]));
    prev = next;
  }

  const target = state.nodes.find((n) => n.id === prev.next)!;
  steps.push(step(state, `Node to delete: ${target.value} at position ${position}.`, 4, [target.id, prev.id], "delete"));

  prev.next = target.next;
  state.nodes = state.nodes.filter((n) => n.id !== target.id);

  steps.push(step(state, `Link ${prev.value} to ${target.next ? state.nodes.find(n => n.id === target.next)?.value : "null"}. Node ${target.value} removed.`, 5, [prev.id], "found"));

  return steps;
}

export function llSearch(values: number[], target: number): LinkedListStep[] {
  const steps: LinkedListStep[] = [];
  const state = buildList(values);

  steps.push(step(state, `Search for value ${target} in the linked list.`, 1));

  if (!state.head) {
    steps.push(step(state, `List is empty.`, 2, [], "error"));
    return steps;
  }

  let current: LinkedListNode | undefined = state.nodes.find((n) => n.id === state.head);
  let index = 0;

  while (current) {
    steps.push(step(state, `Check node at index ${index}: value ${current.value}.`, 2, [current.id]));
    if (current.value === target) {
      steps.push(step(state, `Found ${target} at index ${index}!`, 3, [current.id], "found"));
      return steps;
    }
    steps.push(step(state, `${current.value} ≠ ${target}. Move to next.`, 4, [current.id]));
    current = state.nodes.find((n) => n.id === current!.next);
    index++;
  }

  steps.push(step(state, `${target} not found in the list.`, 5, [], "error"));
  return steps;
}

export function llReverse(values: number[]): LinkedListStep[] {
  const steps: LinkedListStep[] = [];
  const state = buildList(values);

  steps.push(step(state, `Reverse the linked list.`, 1));

  if (!state.head || !state.nodes.find(n => n.id === state.head)!.next) {
    steps.push(step(state, `List has 0 or 1 nodes. Already reversed.`, 2, state.head ? [state.head] : []));
    return steps;
  }

  let prev: string | null = null;
  let current: string | null = state.head;

  steps.push(step(state, `Initialize: prev = null, current = head (${state.nodes.find(n => n.id === current)?.value}).`, 2, current ? [current] : []));

  while (current) {
    const currentNode = state.nodes.find((n) => n.id === current)!;
    const nextId = currentNode.next;

    steps.push(step(state, `Save next = ${nextId ? state.nodes.find(n => n.id === nextId)?.value : "null"}. Reverse ${currentNode.value}'s next to point to ${prev ? state.nodes.find(n => n.id === prev)?.value : "null"}.`, 3, [currentNode.id, ...(prev ? [prev] : [])]));

    currentNode.next = prev;
    prev = current;
    current = nextId;

    steps.push(step(state, `Move forward: prev = ${state.nodes.find(n => n.id === prev)?.value}, current = ${current ? state.nodes.find(n => n.id === current)?.value : "null"}.`, 4, prev ? [prev] : []));
  }

  state.head = prev;
  steps.push(step(state, `Reversal complete. New head is ${state.nodes.find(n => n.id === state.head)?.value}.`, 5, state.head ? [state.head] : [], "found"));

  return steps;
}

export const LL_ANNOTATIONS: Record<string, Record<number, string>> = {
  insertAtHead: {
    2: "Allocate a new node — O(1). In a linked list, creation is always constant time.",
    3: "Point the new node's next to the current head — this 'prepends' it.",
    4: "Move the head pointer to the new node — O(1). No shifting of other nodes needed.",
  },
  insertAtTail: {
    3: "Edge case: if the list is empty, the new node IS the head and the tail.",
    4: "Start curr at the head — we must walk to find the tail since we have no tail pointer.",
    5: "while loop: runs until curr.next is null, meaning curr is the last node. This traversal is O(n).",
    6: "Link the tail to the new node — one pointer update, O(1).",
  },
  insertAtPosition: {
    2: "pos === 0 delegates to insertAtHead — avoids duplicating that O(1) logic.",
    4: "for loop: walks pos−1 steps to land just before the insertion point.",
    5: "curr.next = curr.next advances one node forward per iteration.",
    7: "Point new node's next to whatever curr.next was — preserves the rest of the list.",
    8: "Redirect curr.next to the new node — this is the actual insertion link.",
  },
  deleteAtHead: {
    2: "Guard: empty list check prevents null-pointer errors.",
    3: "Move head to head.next — the old head node is now unreferenced and garbage collected.",
  },
  deleteAtTail: {
    2: "Guard: empty list.",
    3: "Single-node list: removing the only node empties the list.",
    5: "while loop: stops at the second-to-last node (curr.next.next == null). This O(n) traversal is unavoidable without a tail pointer.",
    7: "Break the link — the old tail becomes unreferenced.",
  },
  deleteAtPosition: {
    2: "pos === 0 delegates to deleteAtHead — O(1) special case.",
    4: "for loop: walk to the node just before the target (pos−1 steps).",
    6: "curr.next = curr.next.next skips over the target node, unlinking it in one line.",
  },
  search: {
    2: "Initialize curr at head and an index counter. No random access in linked lists — we must walk.",
    3: "while loop: runs until curr is null (end of list) — O(n) worst case.",
    4: "if condition: check each node's value. Short-circuit return when found.",
    5: "curr = curr.next advances the pointer. idx++ tracks the position for the return value.",
  },
  reverse: {
    2: "Three-pointer setup — prev tracks the reversed portion, curr is the current node.",
    3: "while loop: visits every node exactly once — O(n) total.",
    4: "Save curr.next BEFORE overwriting it — otherwise we lose access to the rest of the list.",
    5: "Reverse the pointer: curr.next now points backward instead of forward.",
    6: "Advance both pointers. prev moves forward one; curr jumps to the saved next.",
  },
};

export const LL_CODE: Record<string, string[]> = {
  insertAtHead: [
    "function insertAtHead(head, value) {",
    "  const node = new Node(value);",
    "  node.next = head;",
    "  head = node;",
    "  return head;",
    "}",
  ],
  insertAtTail: [
    "function insertAtTail(head, value) {",
    "  const node = new Node(value);",
    "  if (!head) return node;",
    "  let curr = head;",
    "  while (curr.next) curr = curr.next;",
    "  curr.next = node;",
    "  return head;",
    "}",
  ],
  insertAtPosition: [
    "function insertAt(head, value, pos) {",
    "  if (pos === 0) return insertAtHead(head, value);",
    "  let curr = head;",
    "  for (let i = 0; i < pos - 1; i++)",
    "    curr = curr.next;",
    "  const node = new Node(value);",
    "  node.next = curr.next;",
    "  curr.next = node;",
    "}",
  ],
  deleteAtHead: [
    "function deleteAtHead(head) {",
    "  if (!head) return null;",
    "  head = head.next;",
    "  return head;",
    "}",
  ],
  deleteAtTail: [
    "function deleteAtTail(head) {",
    "  if (!head) return null;",
    "  if (!head.next) return null;",
    "  let curr = head;",
    "  while (curr.next.next)",
    "    curr = curr.next;",
    "  curr.next = null;",
    "  return head;",
    "}",
  ],
  deleteAtPosition: [
    "function deleteAt(head, pos) {",
    "  if (pos === 0) return deleteAtHead(head);",
    "  let curr = head;",
    "  for (let i = 0; i < pos - 1; i++)",
    "    curr = curr.next;",
    "  curr.next = curr.next.next;",
    "  return head;",
    "}",
  ],
  search: [
    "function search(head, target) {",
    "  let curr = head, idx = 0;",
    "  while (curr) {",
    "    if (curr.value === target) return idx;",
    "    curr = curr.next; idx++;",
    "  }",
    "  return -1;",
    "}",
  ],
  reverse: [
    "function reverse(head) {",
    "  let prev = null, curr = head;",
    "  while (curr) {",
    "    const next = curr.next;",
    "    curr.next = prev;",
    "    prev = curr; curr = next;",
    "  }",
    "  return prev;",
    "}",
  ],
};
