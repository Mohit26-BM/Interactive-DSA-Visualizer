import { Step } from "./types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type GraphType = "undirected" | "directed";

export interface GraphVertex {
  id: string;
  label: string;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  weight?: number;
}

export interface GraphState {
  vertices: GraphVertex[];
  edges: GraphEdge[];
  directed: GraphType;
  positions: Record<string, { x: number; y: number }>;
}

export interface GraphStep extends Step {
  state: GraphState;
  highlightVertices: string[];
  highlightEdges: string[];
  visitedOrder?: string[];
}

// ─── ID counter ───────────────────────────────────────────────────────────────

let idCounter = 0;
const newId = () => `g-${idCounter++}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function cloneGraph(s: GraphState): GraphState {
  return {
    vertices: s.vertices.map((v) => ({ ...v })),
    edges: s.edges.map((e) => ({ ...e })),
    directed: s.directed,
    positions: Object.fromEntries(Object.entries(s.positions).map(([k, v]) => [k, { ...v }])),
  };
}

export function findVertex(s: GraphState, label: string): GraphVertex | undefined {
  return s.vertices.find((v) => v.label === label);
}

export function computeCircularPositions(
  count: number,
  cx: number,
  cy: number,
  r: number
): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    positions.push({
      x: Math.round(cx + r * Math.cos(angle)),
      y: Math.round(cy + r * Math.sin(angle)),
    });
  }
  return positions;
}

function st(
  s: GraphState,
  explanation: string,
  hl: number,
  hv: string[] = [],
  he: string[] = [],
  phase?: string,
  visitedOrder?: string[]
): GraphStep {
  return {
    state: cloneGraph(s),
    explanation,
    highlightLine: hl,
    highlightVertices: hv,
    highlightEdges: he,
    phase,
    visitedOrder,
  };
}

function getNeighbors(s: GraphState, vertexId: string): string[] {
  const neighbors: string[] = [];
  for (const e of s.edges) {
    if (e.from === vertexId) neighbors.push(e.to);
    else if (s.directed === "undirected" && e.to === vertexId) neighbors.push(e.from);
  }
  return neighbors;
}

// ─── Default graph ────────────────────────────────────────────────────────────

export function buildDefaultGraph(directed: GraphType): GraphState {
  const labels = ["A", "B", "C", "D", "E"];
  const positions = computeCircularPositions(5, 300, 200, 140);
  const vertices: GraphVertex[] = labels.map((label, i) => ({ id: newId(), label }));
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
    edges.push({ id: newId(), from: fv.id, to: tv.id });
    if (directed === "undirected") {
      edges.push({ id: newId(), from: tv.id, to: fv.id });
    }
  }

  return { vertices, edges, directed, positions: posMap };
}

// ─── Operations ───────────────────────────────────────────────────────────────

export function graphAddVertex(state: GraphState, label: string): GraphStep[] {
  const steps: GraphStep[] = [];
  const s = cloneGraph(state);

  steps.push(st(s, `Add vertex "${label}" to the graph.`, 1));

  if (findVertex(s, label)) {
    steps.push(st(s, `Vertex "${label}" already exists.`, 2, [], [], "error"));
    return steps;
  }

  const id = newId();
  s.vertices.push({ id, label });

  // Position on circle with existing vertices
  const count = s.vertices.length;
  const newPositions = computeCircularPositions(count, 300, 200, 140);
  s.vertices.forEach((v, i) => { s.positions[v.id] = newPositions[i]; });

  steps.push(st(s, `Vertex "${label}" added. Repositioned all vertices on circle.`, 3, [id], [], "insert"));
  return steps;
}

export function graphAddEdge(
  state: GraphState,
  fromLabel: string,
  toLabel: string,
  weight?: number
): GraphStep[] {
  const steps: GraphStep[] = [];
  const s = cloneGraph(state);

  steps.push(st(s, `Add edge from "${fromLabel}" to "${toLabel}"${weight !== undefined ? ` (weight ${weight})` : ""}.`, 1));

  const fv = findVertex(s, fromLabel);
  const tv = findVertex(s, toLabel);

  if (!fv) {
    steps.push(st(s, `Vertex "${fromLabel}" not found.`, 2, [], [], "error"));
    return steps;
  }
  if (!tv) {
    steps.push(st(s, `Vertex "${toLabel}" not found.`, 2, [], [], "error"));
    return steps;
  }

  // Check if edge already exists
  const exists = s.edges.some((e) => e.from === fv.id && e.to === tv.id);
  if (exists) {
    steps.push(st(s, `Edge "${fromLabel}→${toLabel}" already exists.`, 3, [fv.id, tv.id], [], "error"));
    return steps;
  }

  const edgeId = newId();
  s.edges.push({ id: edgeId, from: fv.id, to: tv.id, weight });

  if (s.directed === "undirected") {
    const reverseId = newId();
    s.edges.push({ id: reverseId, from: tv.id, to: fv.id, weight });
  }

  const edgeLabel = `${fromLabel}-${toLabel}`;
  steps.push(st(s, `Edge "${fromLabel}${s.directed === "directed" ? "→" : "—"}${toLabel}" added.`, 4, [fv.id, tv.id], [edgeLabel], "insert"));
  return steps;
}

export function graphRemoveEdge(
  state: GraphState,
  fromLabel: string,
  toLabel: string
): GraphStep[] {
  const steps: GraphStep[] = [];
  const s = cloneGraph(state);

  steps.push(st(s, `Remove edge from "${fromLabel}" to "${toLabel}".`, 1));

  const fv = findVertex(s, fromLabel);
  const tv = findVertex(s, toLabel);

  if (!fv || !tv) {
    steps.push(st(s, `Vertex "${!fv ? fromLabel : toLabel}" not found.`, 2, [], [], "error"));
    return steps;
  }

  const before = s.edges.length;
  s.edges = s.edges.filter((e) => !(e.from === fv.id && e.to === tv.id));
  if (s.directed === "undirected") {
    s.edges = s.edges.filter((e) => !(e.from === tv.id && e.to === fv.id));
  }

  if (s.edges.length === before) {
    steps.push(st(s, `Edge "${fromLabel}→${toLabel}" not found.`, 3, [fv.id, tv.id], [], "error"));
    return steps;
  }

  steps.push(st(s, `Edge "${fromLabel}${s.directed === "directed" ? "→" : "—"}${toLabel}" removed.`, 4, [fv.id, tv.id], [], "delete"));
  return steps;
}

export function graphDFS(state: GraphState, startLabel: string): GraphStep[] {
  const steps: GraphStep[] = [];
  const s = cloneGraph(state);

  steps.push(st(s, `DFS from "${startLabel}". Uses a stack (implicit via recursion). Explores deeply first.`, 1));

  const startV = findVertex(s, startLabel);
  if (!startV) {
    steps.push(st(s, `Vertex "${startLabel}" not found.`, 2, [], [], "error"));
    return steps;
  }

  const visited = new Set<string>();
  const visitedOrder: string[] = [];

  function dfs(vertexId: string): void {
    visited.add(vertexId);
    const vertex = s.vertices.find((v) => v.id === vertexId)!;
    visitedOrder.push(vertex.label);
    steps.push(st(s, `DFS: Visit "${vertex.label}". Visited order: [${visitedOrder.join(", ")}].`, 3, [vertexId], [], "found", [...visitedOrder]));

    const neighbors = getNeighbors(s, vertexId);
    for (const nId of neighbors) {
      const nv = s.vertices.find((v) => v.id === nId)!;
      const edgeLabel = `${vertex.label}-${nv.label}`;
      if (!visited.has(nId)) {
        steps.push(st(s, `DFS: Explore edge "${vertex.label}→${nv.label}". "${nv.label}" not visited yet.`, 4, [vertexId, nId], [edgeLabel], undefined, [...visitedOrder]));
        dfs(nId);
        steps.push(st(s, `DFS: Backtrack to "${vertex.label}" after exploring "${nv.label}".`, 5, [vertexId], [], undefined, [...visitedOrder]));
      } else {
        steps.push(st(s, `DFS: "${nv.label}" already visited. Skip.`, 6, [vertexId, nId], [edgeLabel], undefined, [...visitedOrder]));
      }
    }
  }

  dfs(startV.id);
  steps.push(st(s, `DFS complete. Visited order: [${visitedOrder.join(", ")}]. Total: ${visitedOrder.length} vertices.`, 7, [], [], "found", [...visitedOrder]));
  return steps;
}

export function graphBFS(state: GraphState, startLabel: string): GraphStep[] {
  const steps: GraphStep[] = [];
  const s = cloneGraph(state);

  steps.push(st(s, `BFS from "${startLabel}". Uses a queue. Explores level by level (shortest hop path).`, 1));

  const startV = findVertex(s, startLabel);
  if (!startV) {
    steps.push(st(s, `Vertex "${startLabel}" not found.`, 2, [], [], "error"));
    return steps;
  }

  const visited = new Set<string>();
  const visitedOrder: string[] = [];
  const queue: string[] = [startV.id];
  visited.add(startV.id);

  steps.push(st(s, `Enqueue start vertex "${startLabel}". Queue: ["${startLabel}"].`, 2, [startV.id], [], undefined, []));

  while (queue.length > 0) {
    const vertexId = queue.shift()!;
    const vertex = s.vertices.find((v) => v.id === vertexId)!;
    visitedOrder.push(vertex.label);
    steps.push(st(s, `BFS: Dequeue and visit "${vertex.label}". Visited: [${visitedOrder.join(", ")}].`, 3, [vertexId], [], "found", [...visitedOrder]));

    const neighbors = getNeighbors(s, vertexId);
    for (const nId of neighbors) {
      const nv = s.vertices.find((v) => v.id === nId)!;
      const edgeLabel = `${vertex.label}-${nv.label}`;
      if (!visited.has(nId)) {
        visited.add(nId);
        queue.push(nId);
        steps.push(st(s, `BFS: Enqueue "${nv.label}" (neighbor of "${vertex.label}"). Queue: [${queue.map((id) => s.vertices.find((v) => v.id === id)!.label).join(", ")}].`, 4, [vertexId, nId], [edgeLabel], undefined, [...visitedOrder]));
      } else {
        steps.push(st(s, `BFS: "${nv.label}" already visited/queued. Skip.`, 5, [vertexId, nId], [edgeLabel], undefined, [...visitedOrder]));
      }
    }
  }

  steps.push(st(s, `BFS complete. Visited order: [${visitedOrder.join(", ")}]. BFS gives shortest hop distances from "${startLabel}".`, 6, [], [], "found", [...visitedOrder]));
  return steps;
}

// ─── Pseudocode ───────────────────────────────────────────────────────────────

export const GRAPH_CODE: Record<string, string[]> = {
  addVertex: [
    "function addVertex(label) {",
    "  if (exists(label)) return; // no duplicates",
    "  vertices.push({ id, label });",
    "  // Reposition all on circle",
    "}",
  ],
  addEdge: [
    "function addEdge(from, to, weight?) {",
    "  if (!exists(from) || !exists(to)) return;",
    "  if (edgeExists(from, to)) return;",
    "  edges.push({ from, to, weight });",
    "  if (undirected) edges.push({ from: to, to: from }); // reverse",
    "}",
  ],
  removeEdge: [
    "function removeEdge(from, to) {",
    "  if (!exists(from) || !exists(to)) return;",
    "  edges = edges.filter(e => e.from != from || e.to != to);",
    "  if (undirected) also remove reverse edge;",
    "}",
  ],
  dfs: [
    "function dfs(start) {",
    "  if (!exists(start)) return;",
    "  visit(start); // mark visited",
    "  for each neighbor of start:",
    "    if (!visited[neighbor]) dfs(neighbor); // recurse",
    "  backtrack; // all neighbors explored",
    "  // skip already-visited neighbors",
    "  // done when all reachable vertices visited",
    "}",
  ],
  bfs: [
    "function bfs(start) {",
    "  if (!exists(start)) return;",
    "  queue = [start]; visited = {start};",
    "  while (queue not empty):",
    "    v = queue.dequeue(); visit(v);",
    "    for each neighbor of v:",
    "      if (!visited) queue.enqueue(neighbor);",
    "  // guarantees shortest hop path",
    "}",
  ],
};

export const GRAPH_ANNOTATIONS: Record<string, Record<number, string>> = {
  dfs: {
    3: "DFS visits a vertex and immediately recurses into its first unvisited neighbor — goes DEEP before going wide.",
    4: "Implicit stack via recursion. Call stack depth = longest path from start, up to O(V) in worst case.",
    5: "Backtracking: when all neighbors of a vertex are visited, return to its caller (the previous vertex in path).",
    6: "Skip visited vertices to avoid infinite loops in graphs with cycles.",
    7: "DFS: O(V+E) time, O(V) space for visited set + call stack. Used for: cycle detection, topological sort, connected components.",
  },
  bfs: {
    2: "Queue enables level-by-level traversal — vertices at distance d are all processed before distance d+1.",
    3: "Dequeue → process. FIFO order guarantees we visit all vertices at current distance before going farther.",
    4: "Enqueue unvisited neighbors — they'll be processed after ALL vertices at current distance.",
    5: "Skip already-queued/visited vertices. Without this check, could enqueue the same vertex multiple times.",
    6: "BFS finds shortest path in unweighted graphs: first time BFS reaches a vertex = fewest hops from start.",
  },
  addEdge: {
    4: "For undirected graphs, every edge is stored twice: A→B and B→A. Adjacency list representation.",
  },
};

export const GRAPH_COMPLEXITY: Record<string, { time: string; space: string; note: string }> = {
  addVertex:  { time: "O(V)",    space: "O(1)", note: "O(V) to recompute circular positions for all vertices." },
  addEdge:    { time: "O(1)",    space: "O(1)", note: "Append to edge list. O(E) total storage for all edges." },
  removeEdge: { time: "O(E)",    space: "O(1)", note: "Linear scan of edge list to find and remove the edge." },
  dfs:        { time: "O(V+E)", space: "O(V)", note: "Visit each vertex once (O(V)) + scan each edge once (O(E))." },
  bfs:        { time: "O(V+E)", space: "O(V)", note: "Queue holds up to O(V) vertices. Edges scanned once each." },
};
