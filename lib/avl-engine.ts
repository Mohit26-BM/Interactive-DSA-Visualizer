import { Step } from "./types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AVLNode {
  id: string;
  value: number;
  left: string | null;
  right: string | null;
  parent: string | null;
  height: number;
}

export interface AVLState {
  nodes: AVLNode[];
  root: string | null;
}

export interface AVLStep extends Step {
  state: AVLState;
  highlightNodes: string[];
  rotationType?: string;
  traversalOrder?: number[];
}

// ─── ID counter ───────────────────────────────────────────────────────────────

let idCounter = 0;
const newId = () => `a-${idCounter++}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clone(s: AVLState): AVLState {
  return { nodes: s.nodes.map((n) => ({ ...n })), root: s.root };
}

function st(s: AVLState, explanation: string, hl: number, hn: string[] = [], phase?: string, rotationType?: string, traversalOrder?: number[]): AVLStep {
  return { state: clone(s), explanation, highlightLine: hl, highlightNodes: hn, phase, rotationType, traversalOrder };
}

function findNode(s: AVLState, id: string | null): AVLNode | undefined {
  if (!id) return undefined;
  return s.nodes.find((n) => n.id === id);
}

export function getHeight(s: AVLState, id: string | null): number {
  if (!id) return 0;
  const node = findNode(s, id);
  return node ? node.height : 0;
}

export function getBF(s: AVLState, id: string | null): number {
  if (!id) return 0;
  const node = findNode(s, id);
  if (!node) return 0;
  return getHeight(s, node.left) - getHeight(s, node.right);
}

function updateHeight(s: AVLState, node: AVLNode): void {
  node.height = 1 + Math.max(getHeight(s, node.left), getHeight(s, node.right));
}

// ─── Rotations ────────────────────────────────────────────────────────────────

function rotateRight(s: AVLState, yId: string, steps: AVLStep[]): string {
  const y = findNode(s, yId)!;
  const xId = y.left!;
  const x = findNode(s, xId)!;
  const T2 = x.right;

  steps.push(st(s, `Right rotate at node(${y.value}): x=node(${x.value}) becomes new subtree root.`, 6, [yId, xId], undefined, "LL Rotation (Right Rotate)"));

  // x.right = y
  x.right = yId;
  // y.left = T2
  y.left = T2;
  if (T2) { const t2node = findNode(s, T2); if (t2node) t2node.parent = yId; }
  // update parents
  x.parent = y.parent;
  y.parent = xId;

  if (x.parent) {
    const xParent = findNode(s, x.parent)!;
    if (xParent.left === yId) xParent.left = xId;
    else xParent.right = xId;
  } else {
    s.root = xId;
  }

  updateHeight(s, y);
  updateHeight(s, x);

  steps.push(st(s, `Right rotate complete. node(${x.value}) is new root. Heights updated: node(${y.value}).h=${y.height}, node(${x.value}).h=${x.height}.`, 7, [xId, yId], "insert", "LL Rotation (Right Rotate)"));
  return xId;
}

function rotateLeft(s: AVLState, xId: string, steps: AVLStep[]): string {
  const x = findNode(s, xId)!;
  const yId = x.right!;
  const y = findNode(s, yId)!;
  const T2 = y.left;

  steps.push(st(s, `Left rotate at node(${x.value}): y=node(${y.value}) becomes new subtree root.`, 6, [xId, yId], undefined, "RR Rotation (Left Rotate)"));

  // y.left = x
  y.left = xId;
  // x.right = T2
  x.right = T2;
  if (T2) { const t2node = findNode(s, T2); if (t2node) t2node.parent = xId; }
  // update parents
  y.parent = x.parent;
  x.parent = yId;

  if (y.parent) {
    const yParent = findNode(s, y.parent)!;
    if (yParent.left === xId) yParent.left = yId;
    else yParent.right = yId;
  } else {
    s.root = yId;
  }

  updateHeight(s, x);
  updateHeight(s, y);

  steps.push(st(s, `Left rotate complete. node(${y.value}) is new root. Heights updated: node(${x.value}).h=${x.height}, node(${y.value}).h=${y.height}.`, 7, [yId, xId], "insert", "RR Rotation (Left Rotate)"));
  return yId;
}

function rebalance(s: AVLState, nodeId: string, steps: AVLStep[]): string {
  const node = findNode(s, nodeId)!;
  updateHeight(s, node);
  const bf = getBF(s, nodeId);

  steps.push(st(s, `Check balance at node(${node.value}): BF=${bf} (left_h=${getHeight(s, node.left)}, right_h=${getHeight(s, node.right)}).`, 8, [nodeId]));

  if (bf > 1) {
    // Left-heavy
    const leftBF = getBF(s, node.left);
    if (leftBF >= 0) {
      // LL case: left child BF >= 0 → single right rotation
      steps.push(st(s, `LL case: BF=${bf} > 1 and left child BF=${leftBF} ≥ 0. Single right rotation at node(${node.value}).`, 9, [nodeId, node.left!], undefined, "LL Rotation (Right Rotate)"));
      return rotateRight(s, nodeId, steps);
    } else {
      // LR case: left child BF < 0 → left rotate left child, then right rotate
      steps.push(st(s, `LR case: BF=${bf} > 1 and left child BF=${leftBF} < 0. Left rotate left child, then right rotate node(${node.value}).`, 9, [nodeId, node.left!], undefined, "LR Rotation (Left-Right)"));
      rotateLeft(s, node.left!, steps);
      return rotateRight(s, nodeId, steps);
    }
  }

  if (bf < -1) {
    // Right-heavy
    const rightBF = getBF(s, node.right);
    if (rightBF <= 0) {
      // RR case: right child BF <= 0 → single left rotation
      steps.push(st(s, `RR case: BF=${bf} < -1 and right child BF=${rightBF} ≤ 0. Single left rotation at node(${node.value}).`, 10, [nodeId, node.right!], undefined, "RR Rotation (Left Rotate)"));
      return rotateLeft(s, nodeId, steps);
    } else {
      // RL case: right child BF > 0 → right rotate right child, then left rotate
      steps.push(st(s, `RL case: BF=${bf} < -1 and right child BF=${rightBF} > 0. Right rotate right child, then left rotate node(${node.value}).`, 10, [nodeId, node.right!], undefined, "RL Rotation (Right-Left)"));
      rotateRight(s, node.right!, steps);
      return rotateLeft(s, nodeId, steps);
    }
  }

  if (Math.abs(bf) <= 1) {
    steps.push(st(s, `node(${node.value}) balanced (BF=${bf}). No rotation needed.`, 11, [nodeId], "found"));
  }
  return nodeId;
}

// ─── Build helper ─────────────────────────────────────────────────────────────

export function buildAVL(values: number[]): AVLState {
  const s: AVLState = { nodes: [], root: null };
  for (const v of values) {
    insertAVLIntoState(s, v);
  }
  return s;
}

function insertAVLIntoState(s: AVLState, value: number): void {
  const node: AVLNode = { id: newId(), value, left: null, right: null, parent: null, height: 1 };
  if (!s.root) {
    s.nodes.push(node);
    s.root = node.id;
    return;
  }
  let cur: string | null = s.root;
  let parentId: string | null = null;
  while (cur) {
    const curNode: AVLNode = findNode(s, cur)!;
    if (value === curNode.value) return; // duplicate
    parentId = cur;
    cur = value < curNode.value ? curNode.left : curNode.right;
  }
  node.parent = parentId;
  s.nodes.push(node);
  const pNode: AVLNode = findNode(s, parentId!)!;
  if (value < pNode.value) pNode.left = node.id;
  else pNode.right = node.id;

  // Walk up and fix heights + rebalance (silently for buildAVL)
  let walkId: string | null = node.id;
  while (walkId) {
    const wNode = findNode(s, walkId)!;
    updateHeight(s, wNode);
    const bf = getBF(s, walkId);
    if (Math.abs(bf) > 1) {
      const dummySteps: AVLStep[] = [];
      rebalance(s, walkId, dummySteps);
    }
    walkId = findNode(s, walkId)?.parent ?? null;
  }
}

// ─── Operations ───────────────────────────────────────────────────────────────

export function avlInsert(values: number[], value: number): AVLStep[] {
  const steps: AVLStep[] = [];
  const s = buildAVL(values);

  steps.push(st(s, `Insert ${value} into AVL tree. BST insert then walk up rebalancing.`, 1));

  // Check duplicate
  let checkCur: string | null = s.root;
  while (checkCur) {
    const cn = findNode(s, checkCur)!;
    if (cn.value === value) {
      steps.push(st(s, `${value} already exists. AVL tree has no duplicates.`, 2, [checkCur], "error"));
      return steps;
    }
    checkCur = value < cn.value ? cn.left : cn.right;
  }

  // BST insert
  const node: AVLNode = { id: newId(), value, left: null, right: null, parent: null, height: 1 };
  if (!s.root) {
    s.nodes.push(node);
    s.root = node.id;
    steps.push(st(s, `Tree is empty. ${value} becomes root.`, 2, [node.id], "insert"));
    return steps;
  }

  let cur: string | null = s.root;
  let parentId: string | null = null;
  while (cur) {
    const curNode: AVLNode = findNode(s, cur)!;
    steps.push(st(s, `Compare ${value} with node(${curNode.value}): go ${value < curNode.value ? "left" : "right"}.`, 3, [cur]));
    parentId = cur;
    cur = value < curNode.value ? curNode.left : curNode.right;
  }

  node.parent = parentId;
  s.nodes.push(node);
  const pNode: AVLNode = findNode(s, parentId!)!;
  if (value < pNode.value) pNode.left = node.id;
  else pNode.right = node.id;

  steps.push(st(s, `Inserted ${value} as child of node(${pNode.value}). Now walk up and rebalance.`, 4, [node.id], "insert"));

  // Walk up and rebalance
  let walkId: string | null = node.parent;
  while (walkId) {
    const wNode = findNode(s, walkId)!;
    const oldHeight = wNode.height;
    rebalance(s, walkId, steps);
    // After rebalance, walkId might have changed (rotation moved it). Find new position.
    const nowNode = findNode(s, walkId);
    walkId = nowNode?.parent ?? null;
    if (nowNode && nowNode.height === oldHeight && getBF(s, nowNode.id) === 0) break;
  }

  steps.push(st(s, `Insert ${value} complete. AVL property restored throughout.`, 12, [], "found"));
  return steps;
}

export function avlSearch(values: number[], target: number): AVLStep[] {
  const steps: AVLStep[] = [];
  const s = buildAVL(values);

  steps.push(st(s, `Search for ${target} in AVL tree.`, 1));
  if (!s.root) {
    steps.push(st(s, `Tree is empty.`, 2, [], "error"));
    return steps;
  }

  let cur: string | null = s.root;
  while (cur) {
    const curNode: AVLNode = findNode(s, cur)!;
    if (curNode.value === target) {
      steps.push(st(s, `Found ${target}! AVL guarantees O(log n) search — balanced height = ⌊log₂ n⌋.`, 5, [cur], "found"));
      return steps;
    }
    steps.push(st(s, `node(${curNode.value}): ${target} ${target < curNode.value ? "< " + curNode.value + " → go left" : "> " + curNode.value + " → go right"}.`, 3, [cur]));
    cur = target < curNode.value ? curNode.left : curNode.right;
  }

  steps.push(st(s, `${target} not found. AVL tree guaranteed height O(log n), so search is O(log n).`, 6, [], "error"));
  return steps;
}

export function avlDelete(values: number[], target: number): AVLStep[] {
  const steps: AVLStep[] = [];
  const s = buildAVL(values);

  steps.push(st(s, `Delete ${target} from AVL tree. BST delete then walk up rebalancing.`, 1));

  // Find node
  let cur: string | null = s.root;
  while (cur) {
    const cn: AVLNode = findNode(s, cur)!;
    if (cn.value === target) break;
    steps.push(st(s, `Compare ${target} with node(${cn.value}): go ${target < cn.value ? "left" : "right"}.`, 2, [cur]));
    cur = target < cn.value ? cn.left : cn.right;
  }

  if (!cur) {
    steps.push(st(s, `${target} not found in AVL tree.`, 3, [], "error"));
    return steps;
  }

  const targetNode = findNode(s, cur)!;
  steps.push(st(s, `Found node(${target}). Begin BST delete.`, 4, [cur], "delete"));

  let rebalanceStart: string | null = null;

  if (!targetNode.left && !targetNode.right) {
    // Leaf
    steps.push(st(s, `Case 1: Leaf node — remove it.`, 5, [cur], "delete"));
    rebalanceStart = targetNode.parent;
    if (targetNode.parent) {
      const p = findNode(s, targetNode.parent)!;
      if (p.left === cur) p.left = null;
      else p.right = null;
    } else {
      s.root = null;
    }
    s.nodes = s.nodes.filter((n) => n.id !== cur);
    steps.push(st(s, `Removed leaf. Walk up to rebalance.`, 6, [], "found"));
  } else if (!targetNode.left || !targetNode.right) {
    // One child
    const childId = (targetNode.left ?? targetNode.right)!;
    const child = findNode(s, childId)!;
    steps.push(st(s, `Case 2: One child — replace with child node(${child.value}).`, 7, [cur, childId], "delete"));
    rebalanceStart = targetNode.parent;
    child.parent = targetNode.parent;
    if (targetNode.parent) {
      const p = findNode(s, targetNode.parent)!;
      if (p.left === cur) p.left = childId;
      else p.right = childId;
    } else {
      s.root = childId;
    }
    s.nodes = s.nodes.filter((n) => n.id !== cur);
    steps.push(st(s, `Replaced. Walk up to rebalance.`, 8, [childId], "found"));
  } else {
    // Two children — in-order successor
    steps.push(st(s, `Case 3: Two children. Find in-order successor (min of right subtree).`, 9, [cur]));
    let succId = targetNode.right!;
    let succNode = findNode(s, succId)!;
    while (succNode.left) {
      succId = succNode.left;
      succNode = findNode(s, succId)!;
    }
    steps.push(st(s, `In-order successor: node(${succNode.value}).`, 10, [succId, cur]));
    const succValue = succNode.value;
    targetNode.value = succValue;
    steps.push(st(s, `Copy successor value ${succValue} into deleted position.`, 11, [cur], "insert"));

    rebalanceStart = succNode.parent;
    const succRight = succNode.right;
    if (succRight) findNode(s, succRight)!.parent = succNode.parent;
    if (succNode.parent) {
      const sp = findNode(s, succNode.parent)!;
      if (sp.left === succId) sp.left = succRight ?? null;
      else sp.right = succRight ?? null;
    }
    s.nodes = s.nodes.filter((n) => n.id !== succId);
    if (rebalanceStart === cur) rebalanceStart = cur;
    steps.push(st(s, `Deleted successor from original position. Walk up to rebalance.`, 12, [cur], "found"));
  }

  // Walk up and rebalance
  let walkId: string | null = rebalanceStart;
  while (walkId) {
    const wNode = findNode(s, walkId);
    if (!wNode) break;
    rebalance(s, walkId, steps);
    walkId = findNode(s, walkId)?.parent ?? null;
  }

  steps.push(st(s, `Delete ${target} complete. AVL property fully restored.`, 13, [], "found"));
  return steps;
}

// ─── Pseudocode ───────────────────────────────────────────────────────────────

export const AVL_CODE: Record<string, string[]> = {
  insert: [
    "function insert(value) {",
    "  if (duplicate) return;",
    "  bstInsert(value);          // standard BST insert",
    "  newNode.height = 1;",
    "  walk up from newNode:",
    "    updateHeight(node);",
    "    bf = height(left) - height(right);",
    "    if (bf > 1)  // left heavy",
    "      if (bf(left) >= 0) rotateRight(node);    // LL",
    "      else { rotateLeft(left); rotateRight(node); } // LR",
    "    if (bf < -1) // right heavy",
    "      if (bf(right) <= 0) rotateLeft(node);    // RR",
    "      else { rotateRight(right); rotateLeft(node); } // RL",
    "}",
  ],
  search: [
    "function search(target) {",
    "  curr = root;",
    "  while (curr != null) {",
    "    if (target == curr.value) return curr; // found",
    "    if (target < curr.value) curr = curr.left;",
    "    else curr = curr.right;",
    "  }",
    "  return null;  // not found",
    "}",
  ],
  delete: [
    "function delete(target) {",
    "  find target node;",
    "  if (not found) return;",
    "  mark = found node;",
    "  if (leaf) removeLeaf();          // Case 1",
    "  else if (oneChild) replaceWithChild(); // Case 2",
    "  else {                           // Case 3",
    "    succ = inOrderSuccessor();",
    "    node.value = succ.value;",
    "    delete(succ);",
    "    walk up from succ's parent:",
    "    updateHeight + rebalance each ancestor;",
    "  }",
    "  // AVL property restored bottom-up",
    "}",
  ],
};

export const AVL_ANNOTATIONS: Record<string, Record<number, string>> = {
  insert: {
    3: "BST insert: O(log n) descent since AVL tree is always balanced — height ≤ 1.44 log₂(n+2).",
    6: "Update height bottom-up: height = 1 + max(left.height, right.height). Must do this before checking BF.",
    7: "Balance Factor (BF) = height(left) - height(right). AVL invariant: |BF| ≤ 1 at every node.",
    8: "BF > 1: left subtree is too tall. Caused by insert into left-left or left-right position.",
    9: "LL case: BF=2 AND left child BF≥0 → inserted into left-left → single RIGHT rotation fixes it.",
    10: "LR case: BF=2 AND left child BF<0 → inserted into left-right → double rotation: left-rotate left child, then right-rotate node.",
    11: "BF < -1: right subtree is too tall. Mirror of left-heavy cases.",
    12: "RR case: BF=-2 AND right child BF≤0 → single LEFT rotation.",
    13: "RL case: BF=-2 AND right child BF>0 → double rotation: right-rotate right child, then left-rotate node.",
  },
  search: {
    3: "O(log n) guaranteed — AVL balance ensures height ≤ 1.44 log₂ n. Never degrades to O(n) like plain BST.",
    4: "Each comparison eliminates one subtree — exactly like BST search but with guaranteed O(log n) path.",
  },
  delete: {
    5: "Leaf delete: simpler — parent just loses one child. Walk up and rebalance ancestors.",
    6: "One-child delete: bypass deleted node. Child takes its place. Walk up and rebalance.",
    7: "Two-child delete: can't simply remove. Replace value with in-order successor, delete successor instead.",
    8: "In-order successor = leftmost node of right subtree. Has at most one child (right) → reduces to Case 1 or 2.",
    11: "Must rebalance ALL ancestors up to root after delete — unlike insert where rebalancing can stop early.",
  },
};

export const AVL_COMPLEXITY: Record<string, { time: string; space: string; note: string }> = {
  insert: { time: "O(log n)", space: "O(log n)", note: "Height always ≤ 1.44 log₂ n. At most 1 rotation (insert). Stack space = height." },
  search: { time: "O(log n)", space: "O(1)",     note: "Balanced height = O(log n) guaranteed. Never O(n) skew." },
  delete: { time: "O(log n)", space: "O(log n)", note: "May need O(log n) rotations walking up. Still O(log n) total." },
};
