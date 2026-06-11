import type { Step } from "./types";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UFStep extends Step {
  parent: number[];
  rank: number[];
  n: number;
  ufHighlightNodes: number[];
  highlightEdges: [number, number][];
  findPath?: number[];
  roots?: number[];
}

// ── Engine ────────────────────────────────────────────────────────────────────

export function makeUnionFind(n: number): { parent: number[]; rank: number[] } {
  return {
    parent: Array.from({ length: n }, (_, i) => i),
    rank: new Array(n).fill(0),
  };
}

function findRoot(parent: number[], x: number): number {
  while (parent[x] !== x) x = parent[x];
  return x;
}

function snap(parent: number[], rank: number[], n: number, hl: number, expl: string, highlight: number[] = [], edges: [number, number][] = [], findPath?: number[], roots?: number[], phase?: string): UFStep {
  return {
    parent: [...parent],
    rank: [...rank],
    n,
    ufHighlightNodes: highlight,
    highlightEdges: edges,
    findPath,
    roots,
    highlightLine: hl,
    explanation: expl,
    phase,
  };
}

export function demoUnionFind(n: number, ops: Array<{ op: "union"; x: number; y: number } | { op: "find"; x: number }>): UFStep[] {
  const steps: UFStep[] = [];
  const { parent, rank } = makeUnionFind(n);

  steps.push(snap(parent, rank, n, 0, `Initialize ${n} disjoint sets. Each node is its own root: parent[i] = i.`));

  for (const operation of ops) {
    if (operation.op === "union") {
      const { x, y } = operation;
      steps.push(snap(parent, rank, n, 2, `Union(${x}, ${y}): find root of ${x} and root of ${y}.`, [x, y]));

      // Find root of x with path tracing
      const pathX: number[] = [x];
      let cx = x;
      while (parent[cx] !== cx) { cx = parent[cx]; pathX.push(cx); }
      const rx = cx;

      // Find root of y with path tracing
      const pathY: number[] = [y];
      let cy = y;
      while (parent[cy] !== cy) { cy = parent[cy]; pathY.push(cy); }
      const ry = cy;

      steps.push(snap(parent, rank, n, 3, `root(${x}) = ${rx} (path: ${pathX.join("→")}), root(${y}) = ${ry} (path: ${pathY.join("→")}).`, [...pathX, ...pathY], [], [...pathX, ...pathY], [rx, ry]));

      if (rx === ry) {
        steps.push(snap(parent, rank, n, 4, `${x} and ${y} already in same set (root = ${rx}). Nothing to union.`, [rx], [], undefined, [rx], "default"));
        continue;
      }

      // Union by rank
      if (rank[rx] < rank[ry]) {
        parent[rx] = ry;
        steps.push(snap(parent, rank, n, 5, `rank(${rx})=${rank[rx]} < rank(${ry})=${rank[ry]}: attach ${rx} under ${ry}.`, [rx, ry], [[rx, ry]], undefined, [ry], "insert"));
      } else if (rank[rx] > rank[ry]) {
        parent[ry] = rx;
        steps.push(snap(parent, rank, n, 5, `rank(${rx})=${rank[rx]} > rank(${ry})=${rank[ry]}: attach ${ry} under ${rx}.`, [rx, ry], [[ry, rx]], undefined, [rx], "insert"));
      } else {
        parent[ry] = rx;
        rank[rx]++;
        steps.push(snap(parent, rank, n, 5, `Equal ranks: attach ${ry} under ${rx}, increment rank[${rx}] → ${rank[rx]}.`, [rx, ry], [[ry, rx]], undefined, [rx], "insert"));
      }

    } else {
      const { x } = operation;
      steps.push(snap(parent, rank, n, 7, `Find(${x}): trace path to root, then compress.`, [x]));

      const path: number[] = [x];
      let cur = x;
      while (parent[cur] !== cur) { cur = parent[cur]; path.push(cur); }
      const root = cur;

      steps.push(snap(parent, rank, n, 8, `Path from ${x} to root ${root}: [${path.join(" → ")}].`, path, [], path, [root], "default"));

      // Path compression
      const compressed: [number, number][] = [];
      for (const node of path) {
        if (parent[node] !== root) {
          compressed.push([node, parent[node]]);
          parent[node] = root;
        }
      }

      if (compressed.length > 0) {
        steps.push(snap(parent, rank, n, 9, `Path compression: ${compressed.map(([n, old]) => `parent[${n}] ${old}→${root}`).join(", ")}. All nodes now point directly to root ${root}.`, path, [], path, [root], "found"));
      } else {
        steps.push(snap(parent, rank, n, 9, `No compression needed: ${x} already has root ${root} as parent.`, [x, root], [], path, [root], "found"));
      }

      steps.push(snap(parent, rank, n, 10, `Find(${x}) = ${root}.`, [root], [], undefined, [root], "found"));
    }
  }

  return steps;
}

// ── Pseudocode ────────────────────────────────────────────────────────────────

export const UF_CODE = [
  "// Initialize: parent[i] = i, rank[i] = 0",
  "",
  "function union(x, y):",
  "  rx = find(x); ry = find(y);",
  "  if rx == ry: return;  // same set",
  "  // union by rank",
  "  if rank[rx] < rank[ry]: parent[rx] = ry;",
  "  else if rank[rx] > rank[ry]: parent[ry] = rx;",
  "  else: parent[ry] = rx; rank[rx]++;",
  "",
  "function find(x):  // with path compression",
  "  if parent[x] != x:",
  "    parent[x] = find(parent[x]);  // compress",
  "  return parent[x];",
];

export const UF_ANNOTATIONS: Record<number, string> = {
  0: "Each node starts as its own root — n disjoint singleton sets.",
  3: "Find roots of both nodes. Two finds, each O(α(n)) with path compression.",
  4: "Already connected: both share the same root, nothing to do.",
  5: "Union by rank: attach smaller-rank tree under larger-rank root. Keeps tree shallow.",
  7: "Path compression: redirect every node on the path directly to root. Amortizes future finds.",
  8: "After compression, find(x) = O(1) for any subsequent call on x.",
};

export const UF_COMPLEXITY = {
  time:  "O(α(n)) per op",
  space: "O(n)",
  note:  "α(n) is the inverse Ackermann function — effectively constant for all practical n. Union-Find is used in Kruskal's MST, network connectivity, and image segmentation.",
};
