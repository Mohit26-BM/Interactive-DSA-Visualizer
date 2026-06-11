# DSA Visualizer

An interactive step-by-step visualizer for data structures and algorithms, built with Next.js 16 App Router, React 19, TypeScript, and Tailwind CSS v4.

---

## Tech Stack

| Layer      | Technology                           |
| ---------- | ------------------------------------ |
| Framework  | Next.js 16.2.9 (App Router)          |
| UI Library | React 19                             |
| Language   | TypeScript 5 (strict mode)           |
| Styling    | Tailwind CSS v4                      |
| Animation  | Framer Motion 12                     |
| AI Feature | Groq SDK — `llama-3.3-70b-versatile` |
| Deployment | Vercel                               |

---

## How Visualization Works

### Step Engine Pattern

Every algorithm is implemented as a **pure function** that runs to completion up front and returns a `Step[]` array. Each step is a plain serializable object — a snapshot of the algorithm state at that moment (array contents, highlighted indices, current pseudocode line, phase label, explanation text, etc.).

```text
Engine function → Step[] → usePlayer → renders step[currentIndex]
```

No animation is tied to the algorithm logic itself. The engine and the renderer are completely decoupled.

### `usePlayer` Hook

`components/shared/usePlayer.ts` drives all playback across every visualizer. It manages:

- Current step index
- Play / pause / step-forward / step-backward / reset
- Speed multiplier applied as `setTimeout` interval: `1000 / speed` ms
- Auto-stop at the last step

The hook only exposes `{ step, playing, speed, play, pause, ... }` — no DOM or SVG knowledge. Each page subscribes to `steps[step]` and re-renders reactively.

### Pseudocode Sync

`components/shared/CodePanel.tsx` receives `highlightLine: number` and applies a highlight class to that line. Every step carries a `highlightLine` index that maps into the algorithm's code array (`ALGO_CODE`, `SORT_CODE`, etc.). A separate `ANNOTATIONS` record maps line numbers to tooltip text shown alongside the highlighted line.

### Graph Visualization

Graph nodes are positioned on a fixed SVG canvas. `components/graph/GraphVisualizer.tsx` renders edges and nodes from the graph state. `AlgoStep` carries `visitedNodes`, `visitedEdges`, `mstEdges`, `distances`, `previous`, and `topoOrder` — the visualizer reads whichever fields are relevant to the current algorithm and colors them accordingly (green = visited, amber = active, red = negative cycle, etc.).

### Tree Visualization

`components/tree/TreeVisualizer.tsx` and `components/avl/AVLVisualizer.tsx` use a recursive SVG layout. Each `TreeStep` carries the full tree state plus `highlightNodes: string[]` marking which nodes to highlight that frame. AVL steps additionally carry balance factors and rotation type so the visualizer can annotate the rotation in progress.

### DP Tables

`components/dp/DPVisualizer.tsx` renders HTML tables for classic DP problems. Each `DPStep` carries a 1-D or 2-D `dp` array snapshot plus a highlighted cell `[i, j]`. For Grid DP and Edit Distance the full matrix is shown; cells transition color as they fill in.

### Trie Visualization

`app/data-structures/trie/page.tsx` contains an inline SVG renderer. The trie is serialized from an internal `Map<string, InternalNode>` structure to a flat `TrieNodeData[]` + `childrenMap` per step so React can diff it efficiently. A `computeLayout` function recursively calculates subtree widths to position nodes, then draws edges and circles in SVG.

### Union-Find Visualization

`app/data-structures/union-find/page.tsx` reads the `parent[]` and `rank[]` arrays from each `UFStep` and re-derives component membership on the fly (`rootOf` walk) rather than storing it in the step. Nodes are grouped and colored by component; path compression is made visible by watching `findPath` change between steps.

### Greedy Visualizations

Each greedy page has its own inline visualizer suited to the problem shape:

- **Activity Selection** — Gantt chart built with CSS grid rows, scaled to `MAX_TIME = 12`
- **Fractional Knapsack** — items table with ratio/taken columns + a fill progress bar
- **Huffman Coding** — recursive SVG tree layout (`layoutTree`) + character code table
- **Job Sequencing** — slot boxes + job chips positioned by deadline
- **Greedy vs DP** — two side-by-side panels (amber/indigo); coin circles for greedy, dp array cells for DP; compare result box turns red when greedy is suboptimal

### Radix Sort Visualization

`app/algorithms/sorting/radix/page.tsx` is a standalone page (not the shared `SortingVisualizerClient`) because the visual requires 10 colored bucket boxes that fill and drain each pass, rather than a bar chart.

### Floyd-Warshall Visualization

`app/algorithms/graph/floyd-warshall/page.tsx` is a standalone page with an inline `MatrixVisualizer` SVG. The V×V distance matrix updates cell-by-cell; the current intermediate vertex `k` highlights its row and column in blue while the updating cell is amber.

### AI Explainer

Every visualizer exposes an **"Explain in detail"** button per step. Clicking it calls `POST /api/explain` with the algorithm name, step explanation text, step index, and total steps. The API route streams a response from Groq (`llama-3.3-70b-versatile`, max 150 tokens) via `ReadableStream`. The client reads the stream chunk-by-chunk with `ReadableStreamDefaultReader` and appends to state, producing a typewriter effect. An `AbortController` cancels the in-flight stream if the user moves to a different step before it finishes.

---

## Project Structure

```text
dsa-visualizer/
├── app/
│   ├── page.tsx                          # Home — all cards, hero stats
│   ├── layout.tsx
│   ├── api/
│   │   └── explain/route.ts              # Groq streaming API route
│   │
│   ├── algorithms/
│   │   ├── page.tsx
│   │   ├── sorting/
│   │   │   ├── page.tsx                  # Sorting hub + complexity table
│   │   │   └── bubble / selection / insertion / merge / quick / counting / heap / radix
│   │   ├── searching/
│   │   │   ├── page.tsx
│   │   │   └── linear / binary / jump
│   │   └── graph/
│   │       ├── page.tsx                  # Graph hub + comparison table
│   │       └── dijkstra / bellman-ford / kruskal / tsp / prim / topological-sort / floyd-warshall
│   │
│   ├── data-structures/
│   │   ├── union-find/page.tsx           # Node grid + component group display
│   │   └── trie/page.tsx                 # SVG tree + insert / search / startsWith
│   │
│   ├── dp/
│   │   ├── page.tsx                      # DP hub
│   │   └── fibonacci / coin-change / knapsack / lcs / lis / grid-dp / edit-distance
│   │
│   ├── greedy/
│   │   ├── page.tsx                      # Greedy hub + complexity table
│   │   └── activity-selection / fractional-knapsack / huffman / job-sequencing / greedy-vs-dp
│   │
│   ├── array / stack / queue / linked-list / tree / graph / hashmap
│   │   └── (interactive data structure pages)
│   │
│   └── globals.css
│
├── components/
│   ├── shared/
│   │   ├── usePlayer.ts                  # Playback hook — step index, play/pause/speed
│   │   ├── Controls.tsx                  # Play / pause / step / speed UI bar
│   │   ├── CodePanel.tsx                 # Pseudocode with per-line highlight
│   │   ├── AIExplainer.tsx               # Streaming AI explanation panel
│   │   ├── TypeCard.tsx                  # Algorithm / DS card with badges
│   │   └── FadeIn.tsx                    # Framer Motion entrance wrapper
│   │
│   ├── graph/
│   │   ├── AlgoVisualizerClient.tsx      # Shared client for all graph algorithms
│   │   ├── GraphVisualizer.tsx           # SVG node + edge renderer
│   │   └── GraphControls.tsx
│   │
│   ├── sorting/
│   │   ├── SortingVisualizerClient.tsx   # Shared client for bar-chart sort pages
│   │   └── SortingVisualizer.tsx
│   │
│   ├── dp/
│   │   └── DPVisualizer.tsx              # Table renderer for all DP variants
│   │
│   ├── searching/
│   │   └── SearchingVisualizerClient.tsx
│   │
│   └── array / avl / heap / linked-list / doubly-linked-list / queue / stack / tree / hashmap
│       └── (domain-specific Visualizer + Controls component pairs)
│
└── lib/
    ├── types.ts                          # Base Step interface + shared types
    ├── sorting-engine.ts                 # bubble / selection / insertion / merge / quick / counting / heap / radix → SortStep[] / RadixStep[]
    ├── searching-engine.ts               # linear / binary / jump → SearchStep[]
    ├── graph-algorithms-engine.ts        # dijkstra / bellman-ford / kruskal / tsp / prim / topoSort / floydWarshall
    ├── dp-engine.ts                      # fibonacci / coinChange / knapsack / lcs / lis / gridDP / editDistance
    ├── greedy-engine.ts                  # activitySelection / fractionalKnapsack / huffman / jobSequencing / greedyVsDP
    ├── union-find-engine.ts              # demoUnionFind → UFStep[]
    ├── trie-engine.ts                    # buildTrieFromWords / trieSearch / trieStartsWith → TrieStep[]
    ├── graph-engine.ts                   # Interactive graph state (add / remove node / edge)
    ├── tree-engine.ts                    # BST insert / delete / search → TreeStep[]
    ├── avl-engine.ts                     # AVL rotations → AVLStep[]
    ├── heap-engine.ts                    # Max-heap insert / extract → HeapStep[]
    ├── array-engine.ts
    ├── linked-list-engine.ts
    ├── doubly-linked-list-engine.ts
    ├── stack-engine.ts
    ├── queue-engine.ts
    ├── hashmap-engine.ts
    └── validation.ts                     # Input sanitization for interactive DS operations
```

---

## Environment Variables

| Variable        | Where to set                                         | Purpose                      |
| --------------- | ---------------------------------------------------- | ---------------------------- |
| `GROQ_API_KEY`  | `.env.local` (local) / Vercel dashboard (production) | AI Explainer — Groq LLM API  |

`.env.local` is excluded from git via `.env*` in `.gitignore`.

---

## Local Development

```bash
npm install
# add GROQ_API_KEY=<your_key> to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push the repo to GitHub
2. Import the repo at [vercel.com](https://vercel.com) — Next.js is auto-detected, no config needed
3. Add `GROQ_API_KEY` under **Settings → Environment Variables**
4. Deploy — every push to `master` triggers a redeploy automatically
