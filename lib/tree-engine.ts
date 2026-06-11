import { Step } from "./types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TreeNode {
  id: string;
  value: number;
  left: string | null;
  right: string | null;
  parent: string | null;
}

export interface TreeState {
  nodes: TreeNode[];
  root: string | null;
}

export interface TreeStep extends Step {
  state: TreeState;
  highlightNodes: string[];
  traversalOrder?: number[]; // values visited so far in traversal
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

let idCounter = 0;
const newId = () => `t-${idCounter++}`;

function clone(s: TreeState): TreeState {
  return { nodes: s.nodes.map((n) => ({ ...n })), root: s.root };
}

function st(s: TreeState, explanation: string, hl: number, hn: string[] = [], phase?: string, traversalOrder?: number[]): TreeStep {
  return { state: clone(s), explanation, highlightLine: hl, highlightNodes: hn, phase, traversalOrder };
}

function findNode(s: TreeState, id: string | null): TreeNode | undefined {
  if (!id) return undefined;
  return s.nodes.find((n) => n.id === id);
}

function getHeight(s: TreeState, id: string | null): number {
  if (!id) return 0;
  const node = findNode(s, id);
  if (!node) return 0;
  return 1 + Math.max(getHeight(s, node.left), getHeight(s, node.right));
}

export function buildBST(values: number[]): TreeState {
  const s: TreeState = { nodes: [], root: null };
  for (const v of values) {
    insertBSTIntoState(s, v);
  }
  return s;
}

function insertBSTIntoState(s: TreeState, value: number): string | null {
  const node: TreeNode = { id: newId(), value, left: null, right: null, parent: null };
  if (!s.root) {
    s.nodes.push(node);
    s.root = node.id;
    return node.id;
  }
  let cur: string | null = s.root;
  while (cur) {
    const curNode: TreeNode = findNode(s, cur)!;
    if (value < curNode.value) {
      if (!curNode.left) {
        node.parent = cur;
        curNode.left = node.id;
        s.nodes.push(node);
        return node.id;
      }
      cur = curNode.left;
    } else if (value > curNode.value) {
      if (!curNode.right) {
        node.parent = cur;
        curNode.right = node.id;
        s.nodes.push(node);
        return node.id;
      }
      cur = curNode.right;
    } else {
      return null; // duplicate
    }
  }
  return null;
}

// ─── Operations ───────────────────────────────────────────────────────────────

export function bstInsert(values: number[], value: number): TreeStep[] {
  const steps: TreeStep[] = [];
  const s = buildBST(values);

  steps.push(st(s, `Insert ${value} into BST.`, 1));

  if (!s.root) {
    const node: TreeNode = { id: newId(), value, left: null, right: null, parent: null };
    s.nodes.push(node);
    s.root = node.id;
    steps.push(st(s, `Tree is empty. ${value} becomes root.`, 2, [node.id], "insert"));
    return steps;
  }

  let cur: string | null = s.root;
  while (cur) {
    const curNode: TreeNode = findNode(s, cur)!;
    steps.push(st(s, `Compare ${value} with node(${curNode.value}): ${value} ${value < curNode.value ? "<" : value > curNode.value ? ">" : "="} ${curNode.value} → go ${value < curNode.value ? "left" : value > curNode.value ? "right" : "duplicate"}.`, 3, [cur]));

    if (value === curNode.value) {
      steps.push(st(s, `${value} already exists. BST has no duplicates.`, 4, [cur], "error"));
      return steps;
    }

    if (value < curNode.value) {
      if (!curNode.left) {
        const node: TreeNode = { id: newId(), value, left: null, right: null, parent: cur };
        curNode.left = node.id;
        s.nodes.push(node);
        steps.push(st(s, `Left child is null. Insert ${value} as left child of ${curNode.value}.`, 5, [node.id], "insert"));
        steps.push(st(s, `Done. ${value} inserted at depth ${getHeight(s, s.root) - getHeight(s, node.id) + 1}.`, 6, [node.id], "found"));
        return steps;
      }
      cur = curNode.left;
    } else {
      if (!curNode.right) {
        const node: TreeNode = { id: newId(), value, left: null, right: null, parent: cur };
        curNode.right = node.id;
        s.nodes.push(node);
        steps.push(st(s, `Right child is null. Insert ${value} as right child of ${curNode.value}.`, 5, [node.id], "insert"));
        steps.push(st(s, `Done. ${value} inserted.`, 6, [node.id], "found"));
        return steps;
      }
      cur = curNode.right;
    }
  }
  return steps;
}

export function bstSearch(values: number[], target: number): TreeStep[] {
  const steps: TreeStep[] = [];
  const s = buildBST(values);

  steps.push(st(s, `Search for ${target} in BST.`, 1));

  if (!s.root) {
    steps.push(st(s, `Tree is empty.`, 2, [], "error"));
    return steps;
  }

  let cur: string | null = s.root;
  while (cur) {
    const curNode: TreeNode = findNode(s, cur)!;
    steps.push(st(s, `Visit node(${curNode.value}): ${target} ${target < curNode.value ? "< " + curNode.value + " → go left" : target > curNode.value ? "> " + curNode.value + " → go right" : "== " + curNode.value + " → FOUND!"}`, target === curNode.value ? 5 : 3, [cur], target === curNode.value ? "found" : undefined));

    if (target === curNode.value) {
      steps.push(st(s, `Found ${target}! BST search eliminates half the tree at each step.`, 6, [cur], "found"));
      return steps;
    }
    cur = target < curNode.value ? curNode.left : curNode.right;
  }

  steps.push(st(s, `${target} not found. Reached null — not in tree.`, 7, [], "error"));
  return steps;
}

export function bstDelete(values: number[], target: number): TreeStep[] {
  const steps: TreeStep[] = [];
  const s = buildBST(values);

  steps.push(st(s, `Delete ${target} from BST.`, 1));

  // Find the node
  let cur: string | null = s.root;
  while (cur) {
    const curNode: TreeNode = findNode(s, cur)!;
    steps.push(st(s, `Compare ${target} with node(${curNode.value}).`, 2, [cur]));
    if (target === curNode.value) break;
    cur = target < curNode.value ? curNode.left : curNode.right;
  }

  if (!cur) {
    steps.push(st(s, `${target} not found in tree. Nothing to delete.`, 3, [], "error"));
    return steps;
  }

  const targetNode = findNode(s, cur)!;
  steps.push(st(s, `Found node(${target}).`, 4, [cur], "delete"));

  // Case 1: Leaf node
  if (!targetNode.left && !targetNode.right) {
    steps.push(st(s, `Case 1: Leaf node — simply remove it.`, 5, [cur], "delete"));
    if (targetNode.parent) {
      const parent = findNode(s, targetNode.parent)!;
      if (parent.left === cur) parent.left = null;
      else parent.right = null;
    } else {
      s.root = null;
    }
    s.nodes = s.nodes.filter((n) => n.id !== cur);
    steps.push(st(s, `Removed leaf node(${target}). Done.`, 8, [], "found"));
    return steps;
  }

  // Case 2: One child
  if (!targetNode.left || !targetNode.right) {
    const childId = targetNode.left ?? targetNode.right!;
    const child = findNode(s, childId)!;
    steps.push(st(s, `Case 2: One child — replace deleted node with its only child node(${child.value}).`, 6, [cur, childId], "delete"));
    child.parent = targetNode.parent;
    if (targetNode.parent) {
      const parent = findNode(s, targetNode.parent)!;
      if (parent.left === cur) parent.left = childId;
      else parent.right = childId;
    } else {
      s.root = childId;
    }
    s.nodes = s.nodes.filter((n) => n.id !== cur);
    steps.push(st(s, `Replaced node(${target}) with child node(${child.value}). Done.`, 8, [childId], "found"));
    return steps;
  }

  // Case 3: Two children — find in-order successor (min of right subtree)
  steps.push(st(s, `Case 3: Two children — find in-order successor (min of right subtree).`, 7, [cur]));
  let succId = targetNode.right!;
  let succNode = findNode(s, succId)!;
  while (succNode.left) {
    steps.push(st(s, `Move left: node(${succNode.value}) has left child.`, 7, [succId]));
    succId = succNode.left;
    succNode = findNode(s, succId)!;
  }
  steps.push(st(s, `In-order successor is node(${succNode.value}) — leftmost node of right subtree.`, 7, [succId, cur]));

  const succValue = succNode.value;

  // Copy successor value into target node
  targetNode.value = succValue;
  steps.push(st(s, `Copy successor value (${succValue}) into deleted node's position.`, 7, [cur], "insert"));

  // Now delete the successor (it has at most one right child)
  const succParent = findNode(s, succNode.parent!);
  const succRight = succNode.right;
  if (succRight) findNode(s, succRight)!.parent = succNode.parent;
  if (succParent) {
    if (succParent.left === succId) succParent.left = succRight;
    else succParent.right = succRight;
  }
  s.nodes = s.nodes.filter((n) => n.id !== succId);

  steps.push(st(s, `Deleted successor node(${succValue}) from its original position. Done.`, 8, [cur], "found"));
  return steps;
}

export function bstInorder(values: number[]): TreeStep[] {
  const steps: TreeStep[] = [];
  const s = buildBST(values);
  const visited: number[] = [];

  steps.push(st(s, `In-order traversal: Left → Root → Right. Visits BST in sorted order.`, 1));

  function inorder(id: string | null) {
    if (!id) return;
    const node: TreeNode = findNode(s, id)!;
    steps.push(st(s, `Go LEFT from node(${node.value}).`, 2, [id]));
    inorder(node.left);
    visited.push(node.value);
    steps.push(st(s, `Visit node(${node.value}). Order so far: [${visited.join(", ")}].`, 3, [id], "found", [...visited]));
    steps.push(st(s, `Go RIGHT from node(${node.value}).`, 4, [id]));
    inorder(node.right);
  }

  inorder(s.root);
  steps.push(st(s, `In-order complete: [${visited.join(", ")}] — elements in sorted ascending order.`, 5, [], "found", [...visited]));
  return steps;
}

export function bstPreorder(values: number[]): TreeStep[] {
  const steps: TreeStep[] = [];
  const s = buildBST(values);
  const visited: number[] = [];

  steps.push(st(s, `Pre-order traversal: Root → Left → Right.`, 1));

  function preorder(id: string | null) {
    if (!id) return;
    const node: TreeNode = findNode(s, id)!;
    visited.push(node.value);
    steps.push(st(s, `Visit node(${node.value}). Order: [${visited.join(", ")}].`, 2, [id], "found", [...visited]));
    steps.push(st(s, `Go LEFT from node(${node.value}).`, 3, [id]));
    preorder(node.left);
    steps.push(st(s, `Go RIGHT from node(${node.value}).`, 4, [id]));
    preorder(node.right);
  }

  preorder(s.root);
  steps.push(st(s, `Pre-order complete: [${visited.join(", ")}].`, 5, [], "found", [...visited]));
  return steps;
}

export function bstPostorder(values: number[]): TreeStep[] {
  const steps: TreeStep[] = [];
  const s = buildBST(values);
  const visited: number[] = [];

  steps.push(st(s, `Post-order traversal: Left → Right → Root.`, 1));

  function postorder(id: string | null) {
    if (!id) return;
    const node: TreeNode = findNode(s, id)!;
    steps.push(st(s, `Go LEFT from node(${node.value}).`, 2, [id]));
    postorder(node.left);
    steps.push(st(s, `Go RIGHT from node(${node.value}).`, 3, [id]));
    postorder(node.right);
    visited.push(node.value);
    steps.push(st(s, `Visit node(${node.value}). Order: [${visited.join(", ")}].`, 4, [id], "found", [...visited]));
  }

  postorder(s.root);
  steps.push(st(s, `Post-order complete: [${visited.join(", ")}].`, 5, [], "found", [...visited]));
  return steps;
}

export function bstLevelOrder(values: number[]): TreeStep[] {
  const steps: TreeStep[] = [];
  const s = buildBST(values);
  const visited: number[] = [];

  steps.push(st(s, `Level-order (BFS): visit nodes level by level using a queue.`, 1));

  if (!s.root) {
    steps.push(st(s, `Tree is empty.`, 2, [], "error"));
    return steps;
  }

  const queue: string[] = [s.root];
  steps.push(st(s, `Enqueue root. Queue: [${s.root}].`, 2, [s.root]));

  while (queue.length > 0) {
    const id = queue.shift()!;
    const node: TreeNode = findNode(s, id)!;
    visited.push(node.value);
    steps.push(st(s, `Dequeue and visit node(${node.value}). Order: [${visited.join(", ")}].`, 3, [id], "found", [...visited]));
    if (node.left) {
      queue.push(node.left);
      steps.push(st(s, `Enqueue left child node(${findNode(s, node.left)?.value}).`, 4, [node.left]));
    }
    if (node.right) {
      queue.push(node.right);
      steps.push(st(s, `Enqueue right child node(${findNode(s, node.right)?.value}).`, 4, [node.right]));
    }
  }

  steps.push(st(s, `Level-order complete: [${visited.join(", ")}].`, 5, [], "found", [...visited]));
  return steps;
}

export function bstFindMin(values: number[]): TreeStep[] {
  const steps: TreeStep[] = [];
  const s = buildBST(values);

  steps.push(st(s, `Find minimum: go left until no left child.`, 1));
  if (!s.root) { steps.push(st(s, `Tree is empty.`, 2, [], "error")); return steps; }

  let cur: string | null = s.root;
  while (cur) {
    const node: TreeNode = findNode(s, cur)!;
    if (!node.left) {
      steps.push(st(s, `No left child. Minimum is ${node.value}.`, 3, [cur], "found"));
      break;
    }
    steps.push(st(s, `node(${node.value}) has left child — go left.`, 2, [cur]));
    cur = node.left;
  }
  return steps;
}

export function bstFindMax(values: number[]): TreeStep[] {
  const steps: TreeStep[] = [];
  const s = buildBST(values);

  steps.push(st(s, `Find maximum: go right until no right child.`, 1));
  if (!s.root) { steps.push(st(s, `Tree is empty.`, 2, [], "error")); return steps; }

  let cur: string | null = s.root;
  while (cur) {
    const node: TreeNode = findNode(s, cur)!;
    if (!node.right) {
      steps.push(st(s, `No right child. Maximum is ${node.value}.`, 3, [cur], "found"));
      break;
    }
    steps.push(st(s, `node(${node.value}) has right child — go right.`, 2, [cur]));
    cur = node.right;
  }
  return steps;
}

// ─── Pseudocode ──────────────────────────────────────────────────────────────

export const BST_CODE: Record<string, string[]> = {
  insert: [
    "function insert(value) {",
    "  if (root == null) { root = new Node(value); return; }",
    "  curr = root;",
    "  while (curr != null) {",
    "    if (value == curr.value) return; // no duplicates",
    "    if (value < curr.value) {",
    "      if (curr.left == null) { curr.left = new Node(value); return; }",
    "      curr = curr.left;",
    "    } else {",
    "      if (curr.right == null) { curr.right = new Node(value); return; }",
    "      curr = curr.right;",
    "    }",
    "  }",
    "}",
  ],
  search: [
    "function search(target) {",
    "  curr = root;",
    "  while (curr != null) {",
    "    if (target == curr.value) return curr;",
    "    if (target < curr.value) curr = curr.left;",
    "    else curr = curr.right;",
    "  }",
    "  return null;",
    "}",
  ],
  delete: [
    "function delete(target) {",
    "  curr = findNode(target);",
    "  if (curr == null) return;",
    "  found = curr;",
    "  if (no children) removeLeaf(curr);         // Case 1",
    "  else if (one child) replaceWithChild(curr); // Case 2",
    "  else { // Case 3: two children",
    "    succ = minOf(curr.right); // in-order successor",
    "    curr.value = succ.value;",
    "    delete(succ); }",
    "}",
  ],
  inorder: [
    "function inorder(node) {",
    "  if (node == null) return;",
    "  inorder(node.left);",
    "  visit(node);",
    "  inorder(node.right);",
    "}",
  ],
  preorder: [
    "function preorder(node) {",
    "  if (node == null) return;",
    "  visit(node);",
    "  preorder(node.left);",
    "  preorder(node.right);",
    "}",
  ],
  postorder: [
    "function postorder(node) {",
    "  if (node == null) return;",
    "  postorder(node.left);",
    "  postorder(node.right);",
    "  visit(node);",
    "}",
  ],
  levelOrder: [
    "function levelOrder(root) {",
    "  queue = [root];",
    "  while (queue not empty) {",
    "    node = queue.dequeue();",
    "    visit(node);",
    "    if (node.left) queue.enqueue(node.left);",
    "    if (node.right) queue.enqueue(node.right);",
    "  }",
    "}",
  ],
  findMin: [
    "function findMin(node) {",
    "  while (node.left != null)",
    "    node = node.left;",
    "  return node.value;",
    "}",
  ],
  findMax: [
    "function findMax(node) {",
    "  while (node.right != null)",
    "    node = node.right;",
    "  return node.value;",
    "}",
  ],
};

export const BST_ANNOTATIONS: Record<string, Record<number, string>> = {
  insert: {
    4: "while loop: descend the tree comparing at each node — O(h) where h is height (log n for balanced, n worst case).",
    5: "BST invariant: no duplicates. Some implementations allow them; this one follows the strict definition.",
    6: "BST property: values smaller than current go LEFT — this is what keeps the tree ordered.",
    10: "BST property: values larger than current go RIGHT.",
  },
  search: {
    3: "while loop: O(h) traversal. Each comparison halves the search space — this is why BST search beats linear scan.",
    4: "if (target < curr.value) go left — we discard the entire right subtree.",
    5: "if (target > curr.value) go right — we discard the entire left subtree.",
  },
  delete: {
    5: "Case 1 (leaf): simplest case — just remove, no re-linking needed.",
    6: "Case 2 (one child): bypass deleted node by connecting parent directly to grandchild.",
    7: "Case 3 (two children): can't simply remove — use in-order successor to preserve BST property.",
    8: "In-order successor = leftmost node of right subtree. It's the smallest value greater than deleted node.",
    9: "Copy successor value UP then delete successor (which has at most one child — back to Case 1 or 2).",
  },
  inorder: {
    3: "inorder(left) first — goes as deep left as possible before visiting.",
    4: "visit(node) in the MIDDLE — left subtree done, right subtree next. For BST this produces sorted output.",
    5: "inorder(right) last — all values to the right are greater.",
  },
  preorder: {
    2: "visit(node) FIRST — root before children. Useful for copying/serializing the tree.",
    3: "preorder(left) — explore left subtree.",
    4: "preorder(right) — explore right subtree.",
  },
  postorder: {
    3: "postorder(left) first — children before parent.",
    4: "postorder(right) next.",
    5: "visit(node) LAST — useful for deletion (delete children before parent) and expression evaluation.",
  },
  levelOrder: {
    2: "Queue enables BFS — unlike DFS (recursion/stack), queue visits all nodes at depth d before d+1.",
    4: "Enqueue children after visiting — they'll be processed in FIFO order, ensuring level-by-level traversal.",
  },
};

export const BST_COMPLEXITY: Record<string, { time: string; space: string; note: string }> = {
  insert:     { time: "O(h)", space: "O(1)", note: "h = height. Best: O(log n) balanced. Worst: O(n) skewed." },
  search:     { time: "O(h)", space: "O(1)", note: "Halves search space at each step — O(log n) average." },
  delete:     { time: "O(h)", space: "O(1)", note: "Find node O(h) + find successor O(h) = O(h) total." },
  inorder:    { time: "O(n)", space: "O(h)", note: "Visit every node once. Stack space = tree height (recursion)." },
  preorder:   { time: "O(n)", space: "O(h)", note: "Visit every node once, root first." },
  postorder:  { time: "O(n)", space: "O(h)", note: "Visit every node once, leaves first." },
  levelOrder: { time: "O(n)", space: "O(w)", note: "w = max width. Queue holds at most one full level." },
  findMin:    { time: "O(h)", space: "O(1)", note: "Always leftmost node — follow left pointers." },
  findMax:    { time: "O(h)", space: "O(1)", note: "Always rightmost node — follow right pointers." },
};
