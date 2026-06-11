import { Step } from "./types";
import { GraphState, GraphVertex, GraphEdge, cloneGraph, computeCircularPositions } from "./graph-engine";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AlgoState extends GraphState {
  distances: Record<string, number>;
  previous: Record<string, string | null>;
  mstEdges?: string[];
  tourEdges?: string[];
  bestCost?: number;
  bestTour?: string[];
}

export interface AlgoStep extends Step {
  state: AlgoState;
  highlightVertices: string[];
  highlightEdges: string[];
  visitedOrder?: string[];
  visitedVertices?: string[];
}

// ─── ID counter ───────────────────────────────────────────────────────────────

let idCounter = 0;
const newId = () => `ga-${idCounter++}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cloneAlgo(s: AlgoState): AlgoState {
  return {
    ...cloneGraph(s),
    distances: { ...s.distances },
    previous: { ...s.previous },
    mstEdges: s.mstEdges ? [...s.mstEdges] : undefined,
    tourEdges: s.tourEdges ? [...s.tourEdges] : undefined,
    bestCost: s.bestCost,
    bestTour: s.bestTour ? [...s.bestTour] : undefined,
  };
}

function st(
  s: AlgoState,
  explanation: string,
  hl: number,
  hv: string[] = [],
  he: string[] = [],
  phase?: string,
  visitedOrder?: string[],
  visitedVertices?: string[]
): AlgoStep {
  return {
    state: cloneAlgo(s),
    explanation,
    highlightLine: hl,
    highlightVertices: hv,
    highlightEdges: he,
    phase,
    visitedOrder,
    visitedVertices,
  };
}

function getEdgeLabel(s: GraphState, fromId: string, toId: string): string {
  const fv = s.vertices.find((v) => v.id === fromId);
  const tv = s.vertices.find((v) => v.id === toId);
  if (!fv || !tv) return "";
  return `${fv.label}-${tv.label}`;
}

// ─── Weighted Default Graph ───────────────────────────────────────────────────

const EDGE_WEIGHTS: Record<string, number> = {
  "A-B": 4, "B-A": 4,
  "A-C": 2, "C-A": 2,
  "B-D": 5, "D-B": 5,
  "C-D": 1, "D-C": 1,
  "D-E": 3, "E-D": 3,
  "B-E": 6, "E-B": 6,
};

export function buildWeightedGraph(): AlgoState {
  const labels = ["A", "B", "C", "D", "E"];
  const positions = computeCircularPositions(5, 300, 200, 140);
  const vertices: GraphVertex[] = labels.map((label) => ({ id: newId(), label }));
  const posMap: Record<string, { x: number; y: number }> = {};
  vertices.forEach((v, i) => { posMap[v.id] = positions[i]; });

  const vByLabel = (l: string) => vertices.find((v) => v.label === l)!;

  const edgePairs: [string, string][] = [
    ["A", "B"], ["A", "C"], ["B", "D"], ["C", "D"], ["D", "E"], ["B", "E"],
  ];

  const edges: GraphEdge[] = [];
  for (const [from, to] of edgePairs) {
    const fv = vByLabel(from);
    const tv = vByLabel(to);
    const w = EDGE_WEIGHTS[`${from}-${to}`] ?? 1;
    edges.push({ id: newId(), from: fv.id, to: tv.id, weight: w });
    edges.push({ id: newId(), from: tv.id, to: fv.id, weight: w });
  }

  return {
    vertices,
    edges,
    directed: "undirected",
    positions: posMap,
    distances: {},
    previous: {},
    mstEdges: [],
  };
}

// ─── Dijkstra ─────────────────────────────────────────────────────────────────

export function dijkstra(graphState: GraphState, startLabel: string): AlgoStep[] {
  const steps: AlgoStep[] = [];
  const base = graphState as AlgoState;
  const s: AlgoState = {
    ...cloneGraph(base),
    distances: {},
    previous: {},
    mstEdges: [],
  };

  // Initialize distances
  for (const v of s.vertices) {
    s.distances[v.id] = Infinity;
    s.previous[v.id] = null;
  }

  const startV = s.vertices.find((v) => v.label === startLabel);
  if (!startV) {
    steps.push(st(s, `Vertex "${startLabel}" not found.`, 1, [], [], "error"));
    return steps;
  }

  s.distances[startV.id] = 0;
  steps.push(st(s, `Dijkstra from "${startLabel}". Set dist["${startLabel}"] = 0, all others = ∞.`, 1, [startV.id], [], "default", undefined, []));

  const visited = new Set<string>();
  const visitedOrder: string[] = [];

  // Simple priority queue simulation using array
  const unvisited = new Set<string>(s.vertices.map((v) => v.id));

  while (unvisited.size > 0) {
    // Pick unvisited vertex with minimum distance
    let u: string | null = null;
    let minDist = Infinity;
    for (const vId of unvisited) {
      if (s.distances[vId] < minDist) {
        minDist = s.distances[vId];
        u = vId;
      }
    }

    if (u === null || s.distances[u] === Infinity) {
      steps.push(st(s, `Remaining vertices are unreachable from "${startLabel}".`, 8, [], [], "default", [...visitedOrder], [...visited]));
      break;
    }

    const uVertex = s.vertices.find((v) => v.id === u)!;
    unvisited.delete(u);
    visited.add(u);
    visitedOrder.push(uVertex.label);

    // highlightVertices=[u] takes priority over visitedVertices in the renderer (current = orange)
    steps.push(st(s, `Visit "${uVertex.label}" (dist=${s.distances[u]}). Explore neighbors.`, 3, [u], [], "found", [...visitedOrder], [...visited]));

    // Get neighbors of u
    const neighbors = s.edges.filter((e) => e.from === u);
    for (const edge of neighbors) {
      if (visited.has(edge.to)) continue;
      const toVertex = s.vertices.find((v) => v.id === edge.to);
      if (!toVertex) continue;

      const w = edge.weight ?? 1;
      const newDist = s.distances[u] + w;
      const edgeLabel = getEdgeLabel(s, u, edge.to);

      steps.push(st(s, `Relax edge "${uVertex.label}→${toVertex.label}" (w=${w}). ${s.distances[u]} + ${w} = ${newDist} vs current dist[${toVertex.label}]=${s.distances[edge.to] === Infinity ? "∞" : s.distances[edge.to]}.`, 5, [u, edge.to], [edgeLabel], "default", [...visitedOrder], [...visited]));

      if (newDist < s.distances[edge.to]) {
        s.distances[edge.to] = newDist;
        s.previous[edge.to] = u;
        steps.push(st(s, `Updated dist["${toVertex.label}"] = ${newDist}. Previous = "${uVertex.label}".`, 6, [edge.to], [edgeLabel], "insert", [...visitedOrder], [...visited]));
      } else {
        steps.push(st(s, `No improvement. Keep dist["${toVertex.label}"] = ${s.distances[edge.to]}.`, 7, [edge.to], [edgeLabel], "default", [...visitedOrder], [...visited]));
      }
    }
  }

  const distSummary = s.vertices.map((v) => `${v.label}:${s.distances[v.id] === Infinity ? "∞" : s.distances[v.id]}`).join(", ");
  steps.push(st(s, `Dijkstra complete. Distances from "${startLabel}": ${distSummary}.`, 9, [], [], "found", [...visitedOrder], [...visited]));
  return steps;
}

// ─── Bellman-Ford ─────────────────────────────────────────────────────────────

export function bellmanFord(graphState: GraphState, startLabel: string): AlgoStep[] {
  const steps: AlgoStep[] = [];
  const base = graphState as AlgoState;
  const s: AlgoState = {
    ...cloneGraph(base),
    distances: {},
    previous: {},
    mstEdges: [],
  };

  for (const v of s.vertices) {
    s.distances[v.id] = Infinity;
    s.previous[v.id] = null;
  }

  const startV = s.vertices.find((v) => v.label === startLabel);
  if (!startV) {
    steps.push(st(s, `Vertex "${startLabel}" not found.`, 1, [], [], "error"));
    return steps;
  }

  s.distances[startV.id] = 0;
  const V = s.vertices.length;
  steps.push(st(s, `Bellman-Ford from "${startLabel}". V=${V} vertices. Will do V-1=${V - 1} relaxation passes.`, 1, [startV.id]));

  // V-1 relaxation passes
  for (let pass = 1; pass <= V - 1; pass++) {
    steps.push(st(s, `Pass ${pass}/${V - 1}: Relax all edges.`, 3));
    let updated = false;

    // Get unique directed edges (for undirected, both directions stored)
    const processedPairs = new Set<string>();
    for (const edge of s.edges) {
      const fromV = s.vertices.find((v) => v.id === edge.from);
      const toV = s.vertices.find((v) => v.id === edge.to);
      if (!fromV || !toV) continue;

      const pairKey = `${edge.from}-${edge.to}`;
      if (processedPairs.has(pairKey)) continue;
      processedPairs.add(pairKey);

      if (s.distances[edge.from] === Infinity) continue;

      const w = edge.weight ?? 1;
      const newDist = s.distances[edge.from] + w;
      const edgeLabel = getEdgeLabel(s, edge.from, edge.to);

      steps.push(st(s, `Pass ${pass}: Edge "${fromV.label}→${toV.label}" (w=${w}). ${s.distances[edge.from]} + ${w} = ${newDist} vs dist["${toV.label}"]=${s.distances[edge.to] === Infinity ? "∞" : s.distances[edge.to]}.`, 5, [edge.from, edge.to], [edgeLabel], "default"));

      if (newDist < s.distances[edge.to]) {
        s.distances[edge.to] = newDist;
        s.previous[edge.to] = edge.from;
        updated = true;
        steps.push(st(s, `Updated dist["${toV.label}"] = ${newDist}.`, 6, [edge.to], [edgeLabel], "insert"));
      }
    }

    if (!updated) {
      steps.push(st(s, `Pass ${pass}: No updates — algorithm converged early!`, 7, [], [], "found"));
      break;
    }
  }

  // Negative cycle detection
  steps.push(st(s, `Check for negative cycles: one more pass.`, 8));
  let hasNegCycle = false;
  for (const edge of s.edges) {
    if (s.distances[edge.from] === Infinity) continue;
    const w = edge.weight ?? 1;
    if (s.distances[edge.from] + w < s.distances[edge.to]) {
      hasNegCycle = true;
      const fromV = s.vertices.find((v) => v.id === edge.from);
      const toV = s.vertices.find((v) => v.id === edge.to);
      steps.push(st(s, `Negative cycle detected involving edge "${fromV?.label}→${toV?.label}"!`, 9, [edge.from, edge.to], [], "error"));
      break;
    }
  }

  if (!hasNegCycle) {
    const distSummary = s.vertices.map((v) => `${v.label}:${s.distances[v.id] === Infinity ? "∞" : s.distances[v.id]}`).join(", ");
    steps.push(st(s, `Bellman-Ford complete. No negative cycles. Distances: ${distSummary}.`, 10, [], [], "found"));
  }

  return steps;
}

// ─── Kruskal (Union-Find) ─────────────────────────────────────────────────────

interface UF {
  parent: Record<string, string>;
  rank: Record<string, number>;
}

function makeUF(ids: string[]): UF {
  const parent: Record<string, string> = {};
  const rank: Record<string, number> = {};
  for (const id of ids) { parent[id] = id; rank[id] = 0; }
  return { parent, rank };
}

function find(uf: UF, x: string): string {
  if (uf.parent[x] !== x) uf.parent[x] = find(uf, uf.parent[x]);
  return uf.parent[x];
}

function union(uf: UF, x: string, y: string): boolean {
  const rx = find(uf, x);
  const ry = find(uf, y);
  if (rx === ry) return false;
  if (uf.rank[rx] < uf.rank[ry]) uf.parent[rx] = ry;
  else if (uf.rank[rx] > uf.rank[ry]) uf.parent[ry] = rx;
  else { uf.parent[ry] = rx; uf.rank[rx]++; }
  return true;
}

export function kruskal(graphState: GraphState): AlgoStep[] {
  const steps: AlgoStep[] = [];
  const base = graphState as AlgoState;
  const s: AlgoState = {
    ...cloneGraph(base),
    distances: {},
    previous: {},
    mstEdges: [],
  };

  steps.push(st(s, `Kruskal's MST: ${s.vertices.length} vertices, ${s.edges.length} edges. Sort edges by weight.`, 1));

  // Collect unique edges (undirected: one per pair)
  const seenPairs = new Set<string>();
  const uniqueEdges: GraphEdge[] = [];
  for (const edge of s.edges) {
    const fv = s.vertices.find((v) => v.id === edge.from);
    const tv = s.vertices.find((v) => v.id === edge.to);
    if (!fv || !tv) continue;
    const key = fv.label < tv.label ? `${fv.label}-${tv.label}` : `${tv.label}-${fv.label}`;
    if (!seenPairs.has(key)) {
      seenPairs.add(key);
      uniqueEdges.push(edge);
    }
  }

  // Sort by weight
  uniqueEdges.sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0));
  steps.push(st(s, `Sorted edges: ${uniqueEdges.map((e) => {
    const fv = s.vertices.find((v) => v.id === e.from);
    const tv = s.vertices.find((v) => v.id === e.to);
    return `${fv?.label}-${tv?.label}(w=${e.weight})`;
  }).join(", ")}.`, 2));

  const uf = makeUF(s.vertices.map((v) => v.id));
  const mstEdges: string[] = [];
  let mstWeight = 0;

  steps.push(st(s, `Initialize Union-Find: each vertex is its own component.`, 3));

  for (const edge of uniqueEdges) {
    const fv = s.vertices.find((v) => v.id === edge.from);
    const tv = s.vertices.find((v) => v.id === edge.to);
    if (!fv || !tv) continue;

    const edgeLabel = getEdgeLabel(s, edge.from, edge.to);
    const rf = find(uf, edge.from);
    const rt = find(uf, edge.to);

    steps.push(st(s, `Consider edge "${fv.label}-${tv.label}" (w=${edge.weight}). Components: ${fv.label}→${s.vertices.find((v) => v.id === rf)?.label}, ${tv.label}→${s.vertices.find((v) => v.id === rt)?.label}.`, 5, [edge.from, edge.to], [edgeLabel], "default"));

    if (rf !== rt) {
      union(uf, edge.from, edge.to);
      mstEdges.push(edgeLabel);
      s.mstEdges = [...mstEdges];
      mstWeight += edge.weight ?? 0;
      steps.push(st(s, `Add "${fv.label}-${tv.label}" to MST. Different components — no cycle! MST weight so far: ${mstWeight}.`, 6, [edge.from, edge.to], [edgeLabel], "insert"));
    } else {
      steps.push(st(s, `Skip "${fv.label}-${tv.label}" — same component (would create a cycle).`, 7, [edge.from, edge.to], [edgeLabel], "error"));
    }

    if (mstEdges.length === s.vertices.length - 1) {
      steps.push(st(s, `MST complete! ${s.vertices.length - 1} edges added. Total weight: ${mstWeight}.`, 8, [], mstEdges, "found"));
      return steps;
    }
  }

  steps.push(st(s, `Kruskal complete. MST edges: [${mstEdges.join(", ")}]. Total weight: ${mstWeight}.`, 9, [], mstEdges, "found"));
  return steps;
}

// ─── TSP (Brute Force) ────────────────────────────────────────────────────────

function getWeightByLabels(s: GraphState, fromLabel: string, toLabel: string): number {
  const fv = s.vertices.find((v) => v.label === fromLabel);
  const tv = s.vertices.find((v) => v.label === toLabel);
  if (!fv || !tv) return Infinity;
  const edge = s.edges.find((e) => e.from === fv.id && e.to === tv.id);
  return edge?.weight ?? Infinity;
}

function permutations(arr: string[]): string[][] {
  if (arr.length <= 1) return [arr.slice()];
  const result: string[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = arr.filter((_, j) => j !== i);
    for (const p of permutations(rest)) result.push([arr[i], ...p]);
  }
  return result;
}

export function buildTSPGraph(): AlgoState {
  const labels = ["A", "B", "C", "D"];
  const positions = computeCircularPositions(4, 300, 200, 130);
  const vertices: GraphVertex[] = labels.map((label) => ({ id: newId(), label }));
  const posMap: Record<string, { x: number; y: number }> = {};
  vertices.forEach((v, i) => { posMap[v.id] = positions[i]; });

  const vByLabel = (l: string) => vertices.find((v) => v.label === l)!;
  const WEIGHTS: [string, string, number][] = [
    ["A", "B", 10], ["A", "C", 8], ["A", "D", 9],
    ["B", "C", 7],  ["B", "D", 12], ["C", "D", 6],
  ];

  const edges: GraphEdge[] = [];
  for (const [from, to, w] of WEIGHTS) {
    const fv = vByLabel(from);
    const tv = vByLabel(to);
    edges.push({ id: newId(), from: fv.id, to: tv.id, weight: w });
    edges.push({ id: newId(), from: tv.id, to: fv.id, weight: w });
  }

  return {
    vertices, edges,
    directed: "undirected",
    positions: posMap,
    distances: {}, previous: {},
    mstEdges: [],
    tourEdges: [], bestCost: Infinity, bestTour: [],
  };
}

export function tsp(graphState: AlgoState): AlgoStep[] {
  const steps: AlgoStep[] = [];
  const s: AlgoState = {
    ...cloneAlgo(graphState),
    tourEdges: [],
    bestCost: Infinity,
    bestTour: [],
  };

  const labels = s.vertices.map((v) => v.label);
  const start = labels[0];
  const others = labels.slice(1);
  const perms = permutations(others);
  const allIds = s.vertices.map((v) => v.id);

  steps.push(st(s, `TSP Brute Force: ${labels.length} cities [${labels.join(", ")}]. Fix start="${start}", permute ${others.join(", ")}. ${perms.length} tours to check ((${labels.length}-1)! = ${perms.length}).`, 2, [], [], "default"));
  steps.push(st(s, `Initialize bestCost = ∞, bestTour = null. Any valid tour beats ∞ on the first try.`, 3, [], [], "default"));

  for (let pi = 0; pi < perms.length; pi++) {
    const perm = perms[pi];
    const tour = [start, ...perm, start];
    const tourStr = tour.join(" → ");

    const costParts: number[] = [];
    for (let i = 0; i < tour.length - 1; i++) {
      costParts.push(getWeightByLabels(s, tour[i], tour[i + 1]));
    }
    const cost = costParts.reduce((a, b) => a + b, 0);

    const edgeLabels: string[] = [];
    for (let i = 0; i < tour.length - 1; i++) {
      edgeLabels.push(`${tour[i]}-${tour[i + 1]}`);
    }

    steps.push(st(s, `Tour ${pi + 1}/${perms.length}: ${tourStr} → cost: ${costParts.join("+")} = ${cost}.`, 5, [], edgeLabels, "default"));

    const prevBest = s.bestCost ?? Infinity;
    if (cost < prevBest) {
      s.bestCost = cost;
      s.bestTour = [...tour];
      s.tourEdges = [...edgeLabels];
      steps.push(st(s, `NEW BEST! ${tourStr} = ${cost} beats previous best (${prevBest === Infinity ? "∞" : prevBest}). Updated optimal tour.`, 7, allIds, edgeLabels, "insert"));
    } else {
      steps.push(st(s, `Tour ${pi + 1}: cost ${cost} ≥ current best (${s.bestCost}). Skipping.`, 6, [], edgeLabels, "default"));
    }
  }

  const bestTourStr = (s.bestTour ?? []).join(" → ");
  steps.push(st(s, `TSP complete! Optimal Hamiltonian cycle: ${bestTourStr} with total cost ${s.bestCost}. Checked all ${perms.length} permutations.`, 9, allIds, s.tourEdges ?? [], "found"));
  return steps;
}

// ─── Topological Sort (Kahn's BFS) ───────────────────────────────────────────

export function buildTopoGraph(): AlgoState {
  const labels = ["A", "B", "C", "D", "E"];
  const positions: Record<string, { x: number; y: number }> = {};
  // Manual layout: A and B on left, C and D in middle, E on right
  const layout = [
    { x: 80,  y: 100 },
    { x: 80,  y: 300 },
    { x: 280, y: 100 },
    { x: 280, y: 300 },
    { x: 480, y: 200 },
  ];
  const vertices: GraphVertex[] = labels.map((label, i) => ({ id: newId(), label }));
  vertices.forEach((v, i) => { positions[v.id] = layout[i]; });

  const vByLabel = (l: string) => vertices.find((v) => v.label === l)!;
  // DAG: A→C, A→D, B→D, B→E, C→E, D→E
  const edgePairs: [string, string][] = [["A","C"],["A","D"],["B","D"],["B","E"],["C","E"],["D","E"]];
  const edges: GraphEdge[] = edgePairs.map(([from, to]) => ({
    id: newId(), from: vByLabel(from).id, to: vByLabel(to).id,
  }));

  return { vertices, edges, directed: "directed", positions, distances: {}, previous: {}, mstEdges: [] };
}

export function topologicalSort(graphState: GraphState): AlgoStep[] {
  const steps: AlgoStep[] = [];
  const s: AlgoState = { ...cloneGraph(graphState as AlgoState), distances: {}, previous: {}, mstEdges: [] };

  // Compute in-degrees
  const inDegree: Record<string, number> = {};
  for (const v of s.vertices) inDegree[v.id] = 0;
  for (const e of s.edges) inDegree[e.to] = (inDegree[e.to] ?? 0) + 1;

  const inDegreeLabel = () =>
    s.vertices.map((v) => `${v.label}:${inDegree[v.id]}`).join(", ");

  steps.push(st(s, `Topological Sort (Kahn's). Compute in-degrees: [${inDegreeLabel()}].`, 1));

  // Queue: vertices with in-degree 0
  const queue: string[] = s.vertices.filter((v) => inDegree[v.id] === 0).map((v) => v.id);
  const queueLabels = () => queue.map((id) => s.vertices.find((v) => v.id === id)?.label ?? id).join(", ");

  steps.push(st(s, `Initial queue (in-degree 0): [${queueLabels()}]. These have no prerequisites.`, 2, [...queue], [], "default"));

  const topoOrder: string[] = [];
  const visitedVertices: string[] = [];

  while (queue.length > 0) {
    const uid = queue.shift()!;
    const uVertex = s.vertices.find((v) => v.id === uid)!;
    topoOrder.push(uVertex.label);
    visitedVertices.push(uid);

    steps.push(st(s, `Dequeue "${uVertex.label}" → add to result. Topo order so far: [${topoOrder.join(", ")}].`, 4, [uid], [], "found", [...topoOrder], [...visitedVertices]));

    const neighbors = s.edges.filter((e) => e.from === uid);
    for (const edge of neighbors) {
      const nv = s.vertices.find((v) => v.id === edge.to)!;
      inDegree[edge.to]--;
      const edgeLabel = getEdgeLabel(s, uid, edge.to);
      steps.push(st(s, `Reduce in-degree of "${nv.label}" to ${inDegree[edge.to]}${inDegree[edge.to] === 0 ? " → add to queue!" : ""}.`, 5, [edge.to], [edgeLabel], inDegree[edge.to] === 0 ? "insert" : "default", [...topoOrder], [...visitedVertices]));
      if (inDegree[edge.to] === 0) queue.push(edge.to);
    }
  }

  if (topoOrder.length !== s.vertices.length) {
    steps.push(st(s, `Cycle detected! Only processed ${topoOrder.length}/${s.vertices.length} vertices. No valid topological order exists.`, 7, [], [], "error"));
  } else {
    steps.push(st(s, `Topological sort complete! Valid ordering: [${topoOrder.join(" → ")}].`, 6, [], [], "found", [...topoOrder], [...visitedVertices]));
  }

  return steps;
}

// ─── Floyd-Warshall ───────────────────────────────────────────────────────────

export interface FWStep {
  matrix: number[][];
  labels: string[];
  k: number;
  highlightI: number;
  highlightJ: number;
  highlightLine: number;
  explanation: string;
  phase?: string;
}

const FW_INF = 999999;

export function floydWarshall(graphState: GraphState): FWStep[] {
  const steps: FWStep[] = [];
  const vertices = graphState.vertices;
  const n = vertices.length;
  const labels = vertices.map((v) => v.label);
  const idxById: Record<string, number> = {};
  vertices.forEach((v, i) => { idxById[v.id] = i; });

  // Initialize matrix
  const dist: number[][] = Array.from({ length: n }, () => new Array(n).fill(FW_INF));
  for (let i = 0; i < n; i++) dist[i][i] = 0;
  for (const e of graphState.edges) {
    const fi = idxById[e.from], ti = idxById[e.to];
    if (fi !== undefined && ti !== undefined) {
      const w = e.weight ?? 1;
      if (w < dist[fi][ti]) dist[fi][ti] = w;
    }
  }

  const snap = (k: number, i: number, j: number, line: number, expl: string, phase?: string): FWStep => ({
    matrix: dist.map((r) => [...r]),
    labels,
    k, highlightI: i, highlightJ: j,
    highlightLine: line, explanation: expl, phase,
  });

  const fmtDist = (v: number) => v >= FW_INF ? "∞" : String(v);

  steps.push(snap(-1, -1, -1, 0, `Initialize ${n}×${n} distance matrix. Direct edges set; 0 on diagonal; ∞ otherwise.`));

  for (let k = 0; k < n; k++) {
    steps.push(snap(k, -1, -1, 2, `Intermediate vertex k=${labels[k]}. Try routing every i→j path through ${labels[k]}.`));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        if (dist[i][k] >= FW_INF || dist[k][j] >= FW_INF) {
          steps.push(snap(k, i, j, 3, `dist[${labels[i]}][${labels[j]}]: route via ${labels[k]} = ${fmtDist(dist[i][k])}+${fmtDist(dist[k][j])} — unreachable, skip.`));
          continue;
        }
        const via = dist[i][k] + dist[k][j];
        if (via < dist[i][j]) {
          steps.push(snap(k, i, j, 4, `dist[${labels[i]}][${labels[j]}]: ${fmtDist(dist[i][j])} → via ${labels[k]}: ${dist[i][k]}+${dist[k][j]}=${via}. Update!`, "insert"));
          dist[i][j] = via;
        } else {
          steps.push(snap(k, i, j, 3, `dist[${labels[i]}][${labels[j]}]: via ${labels[k]}=${via} ≥ current ${fmtDist(dist[i][j])}, no update.`));
        }
      }
    }
  }

  steps.push(snap(n, -1, -1, 5, `Floyd-Warshall complete. Matrix now contains shortest distances between all pairs.`, "found"));
  return steps;
}

// ─── Prim's MST ──────────────────────────────────────────────────────────────

export function primMST(graphState: GraphState, startLabel: string): AlgoStep[] {
  const steps: AlgoStep[] = [];
  const s: AlgoState = { ...cloneGraph(graphState as AlgoState), distances: {}, previous: {}, mstEdges: [] };

  const startV = s.vertices.find((v) => v.label === startLabel) ?? s.vertices[0];

  for (const v of s.vertices) {
    s.distances[v.id] = Infinity;
    s.previous[v.id] = null;
  }
  s.distances[startV.id] = 0;

  const inMST = new Set<string>();
  const mstEdges: string[] = [];

  steps.push(st(s, `Prim's MST from "${startV.label}". Set key[${startV.label}]=0, all others=∞.`, 1, [startV.id]));

  while (inMST.size < s.vertices.length) {
    // Pick vertex with minimum key not yet in MST
    let u: typeof s.vertices[0] | null = null;
    for (const v of s.vertices) {
      if (!inMST.has(v.id) && (u === null || s.distances[v.id] < s.distances[u.id])) u = v;
    }
    if (!u || s.distances[u.id] === Infinity) break;

    inMST.add(u.id);
    if (s.previous[u.id]) {
      const prevV = s.vertices.find((v) => v.id === s.previous[u!.id])!;
      const edgeLabel = getEdgeLabel(s, s.previous[u.id]!, u.id);
      const revLabel = getEdgeLabel(s, u.id, s.previous[u.id]!);
      mstEdges.push(edgeLabel);
      mstEdges.push(revLabel);
      s.mstEdges = [...mstEdges];
      steps.push(st(s, `Add "${prevV.label}–${u.label}" (weight ${s.distances[u.id]}) to MST.`, 4, [u.id, s.previous[u.id]!], [edgeLabel, revLabel], "found", undefined, [...inMST]));
    } else {
      steps.push(st(s, `Start MST from "${u.label}" (key=0, no parent edge).`, 3, [u.id], [], "insert", undefined, [...inMST]));
    }

    // Update keys for neighbors
    const neighbors = s.edges.filter((e) => e.from === u!.id && !inMST.has(e.to));
    for (const edge of neighbors) {
      const nv = s.vertices.find((v) => v.id === edge.to)!;
      const w = edge.weight ?? 1;
      if (w < s.distances[edge.to]) {
        const old = s.distances[edge.to];
        s.distances[edge.to] = w;
        s.previous[edge.to] = u.id;
        const eLabel = getEdgeLabel(s, u.id, edge.to);
        steps.push(st(s, `Update key[${nv.label}]: ${old === Infinity ? "∞" : old} → ${w} via "${u.label}".`, 6, [edge.to, u.id], [eLabel], "default", undefined, [...inMST]));
      }
    }
  }

  const mstWeight = Array.from(inMST)
    .filter(id => s.previous[id])
    .reduce((sum, id) => sum + (s.distances[id] === Infinity ? 0 : s.distances[id]), 0);

  steps.push(st(s, `Prim's MST complete! Total weight = ${mstWeight}. MST contains ${inMST.size - 1} edges.`, 8, [], s.mstEdges ?? [], "found", undefined, [...inMST]));
  return steps;
}

// ─── Pseudocode ───────────────────────────────────────────────────────────────

export const ALGO_CODE: Record<string, string[]> = {
  dijkstra: [
    "function dijkstra(graph, start) {",
    "  dist[start] = 0; dist[rest] = Infinity;",
    "  while (unvisited not empty) {",
    "    u = vertex with min dist;",
    "    mark u visited;",
    "    for each neighbor v of u:",
    "      if dist[u] + w(u,v) < dist[v]:",
    "        dist[v] = dist[u] + w(u,v);",
    "        prev[v] = u;",
    "  }",
    "}",
  ],
  bellmanFord: [
    "function bellmanFord(graph, start) {",
    "  dist[start] = 0; dist[rest] = Infinity;",
    "  for pass = 1 to V-1:",
    "    for each edge (u,v,w):",
    "      if dist[u] + w < dist[v]:",
    "        dist[v] = dist[u] + w;",
    "        prev[v] = u;",
    "    if no update: break early;",
    "  // Negative cycle check: one more pass",
    "  if any update: negative cycle detected!",
    "}",
  ],
  kruskal: [
    "function kruskal(graph) {",
    "  sort all edges by weight;",
    "  init UnionFind (each vertex alone);",
    "  for each edge (u,v,w) in sorted order:",
    "    if find(u) != find(v):",
    "      addToMST(u,v,w);",
    "      union(u, v);",
    "    else: skip (would create cycle);",
    "    if mst.edges == V-1: done;",
    "}",
  ],
  tsp: [
    "function tsp_brute_force(cities) {",
    "  start = cities[0]; perms = permutations(rest);",
    "  bestCost = ∞; bestTour = null;",
    "  for each permutation perm:",
    "    tour = [start, ...perm, start];",
    "    cost = Σ edge_weight(tour[i], tour[i+1]);",
    "    if cost ≥ bestCost: continue;",
    "    bestCost = cost; bestTour = tour;",
    "  // checked all (n-1)! permutations",
    "  return bestTour, bestCost;",
    "}",
  ],
  prim: [
    "function primMST(graph, start) {",
    "  key[start]=0; key[rest]=∞; parent={}",
    "  while (not all vertices in MST):",
    "    u = min key vertex not in MST;",
    "    add u to MST;",
    "    if parent[u]: add edge parent[u]—u;",
    "    for each neighbor v of u:",
    "      if v not in MST and w(u,v) < key[v]:",
    "        key[v] = w(u,v); parent[v] = u;",
    "  // MST contains V-1 edges",
    "}",
  ],
  topoSort: [
    "function kahnsTopoSort(graph) {",
    "  compute in-degree for every vertex;",
    "  enqueue all vertices with in-degree = 0;",
    "  result = [];",
    "  while (queue not empty):",
    "    u = dequeue();",
    "    result.push(u);",
    "    for each neighbor v of u:",
    "      in-degree[v]--;",
    "      if in-degree[v] == 0: enqueue(v);",
    "  if result.length < V: cycle detected!",
    "  return result;",
    "}",
  ],
  floydWarshall: [
    "function floydWarshall(graph) {",
    "  init dist[i][j] = edge(i,j) or ∞;",
    "  for k = 0 to V-1:",
    "    for i = 0 to V-1:",
    "      for j = 0 to V-1:",
    "        if dist[i][k]+dist[k][j] < dist[i][j]:",
    "          dist[i][j] = dist[i][k]+dist[k][j];",
    "  // dist[][] = all-pairs shortest paths",
    "}",
  ],
};

export const ALGO_ANNOTATIONS: Record<string, Record<number, string>> = {
  dijkstra: {
    2: "Initialize: source distance = 0, all others = ∞. Cannot reach any vertex yet.",
    4: "Greedy choice: always process the closest unvisited vertex. Safe because edge weights ≥ 0.",
    6: "Relaxation: if going through u gives a shorter path to v, update dist[v].",
    7: "Triangle inequality: dist[v] ≤ dist[u] + w(u,v). Dijkstra enforces this for all edges.",
    9: "O((V+E) log V) with priority queue. O(V²) with simple array (shown here).",
  },
  bellmanFord: {
    3: "V-1 passes: a shortest path in a graph with V vertices has at most V-1 edges.",
    4: "Relax every edge each pass. Unlike Dijkstra, no greedy ordering — handles negative weights.",
    7: "Early termination: if no update in a pass, distances have converged.",
    8: "Negative cycle check: if any distance still updates after V-1 passes, a negative cycle exists.",
    10: "O(VE) time — much slower than Dijkstra but handles negative edges.",
  },
  kruskal: {
    2: "Sort by weight: O(E log E). This ensures we always consider the cheapest edge first.",
    3: "Union-Find with path compression + rank: find() and union() are nearly O(1) amortized.",
    5: "find(u) ≠ find(v): u and v are in different components — adding this edge is safe (no cycle).",
    6: "Add to MST: union the two components. MST weight increases by edge weight.",
    7: "Skip if same component: would form a cycle. Greedy proof: safe to skip via cut property.",
  },
  tsp: {
    2: "Fix one city as start: all tours are cyclic, so rotation doesn't change cost. Reduces search from n! to (n-1)!.",
    3: "bestCost = ∞: any valid tour will improve it on iteration 1. Initialize before the loop.",
    5: "Tour cost = sum of all n edge weights including the return edge back to start city.",
    7: "Update only on strict improvement. For undirected graphs, the reverse tour always has the same cost.",
    9: "O((n-1)!) = O(n!) total. n=4: 6 tours. n=10: 362,880. n=20: 1.2×10¹⁷. Inherently NP-hard.",
  },
  prim: {
    1: "key[v] = minimum edge weight to connect v to the current MST. Start vertex has key=0.",
    3: "Greedy choice: always pick the cheapest edge connecting the MST to a new vertex.",
    6: "Relaxation: if a new MST vertex exposes a cheaper path to a neighbor, update its key.",
    7: "Unlike Dijkstra (shortest path), Prim uses edge weight alone, not cumulative distance.",
    9: "O(V²) with simple array; O(E log V) with binary heap. Total MST weight = minimum possible.",
  },
  topoSort: {
    1: "In-degree = number of incoming edges. Vertices with in-degree 0 have no prerequisites — safe to process first.",
    2: "Start queue: all vertices that have no dependencies. These can be scheduled immediately.",
    5: "Dequeue a ready vertex and add to result — its dependencies are all satisfied.",
    7: "Remove the dependency edge: decrement in-degree of each neighbor.",
    8: "If in-degree drops to 0, all prerequisites are done — enqueue for processing.",
    9: "If result.length < V, a cycle exists and no valid ordering is possible.",
  },
  floydWarshall: {
    1: "Initialize: direct edge weight or ∞ if no edge. Distance to self = 0.",
    2: "Outer loop: try vertex k as an intermediate waypoint for all i→j paths.",
    5: "Relaxation: if going i→k→j is shorter than the current best i→j, update.",
    6: "Unlike Dijkstra, this handles negative edges (but not negative cycles).",
    7: "After all k iterations, dist[i][j] is the shortest path between every pair.",
  },
};

export const ALGO_COMPLEXITY: Record<string, { time: string; space: string; note: string }> = {
  dijkstra:    { time: "O((V+E) log V)", space: "O(V)", note: "Greedy shortest path. Requires non-negative weights. Binary heap gives O((V+E) log V)." },
  bellmanFord: { time: "O(VE)",          space: "O(V)", note: "Handles negative weights. V-1 passes × E edges each pass." },
  kruskal:     { time: "O(E log E)",     space: "O(V)", note: "Sort edges O(E log E) + Union-Find O(E α(V)). Produces minimum spanning tree." },
  tsp:         { time: "O(n!)",          space: "O(n)", note: "NP-hard. Brute force is exact but only feasible for n ≤ 10–12. For larger inputs use nearest neighbor O(n²), 2-opt, Held-Karp DP O(n²·2ⁿ), or branch & bound." },
  prim:        { time: "O(V²) / O(E log V)", space: "O(V)", note: "Greedy MST: always add cheapest edge connecting MST to unvisited vertex. Same output as Kruskal but vertex-centric. Better for dense graphs." },
  topoSort:    { time: "O(V+E)",         space: "O(V)", note: "Kahn's BFS: process each vertex and edge once. Only valid on directed acyclic graphs (DAGs). Used in build systems, course scheduling, and dependency resolution." },
  floydWarshall: { time: "O(V³)",        space: "O(V²)", note: "All-pairs shortest paths in one pass. Handles negative edge weights (not negative cycles). V³ makes it impractical for large sparse graphs — use Dijkstra from each source instead." },
};
