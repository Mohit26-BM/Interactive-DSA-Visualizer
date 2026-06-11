import Link from "next/link";
import TypeCard from "@/components/shared/TypeCard";
import FadeIn from "@/components/shared/FadeIn";

export default function GraphAlgorithmsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-violet-700 rounded-lg flex items-center justify-center text-sm font-bold">⬡</div>
          <h1 className="text-xl font-bold">Graph Algorithms</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <FadeIn from="up">
          <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
            Classic algorithms on weighted graphs. Watch edge relaxations, priority queue operations, and spanning
            tree construction step-by-step.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6 items-start">

          {/* Table — left */}
          <FadeIn from="left" delay="delay-0">
            <div className="bg-gray-900 border border-gray-700 hover:border-gray-600 transition-colors duration-200 rounded-xl overflow-hidden shadow-lg shadow-black/20">
              <div className="px-4 py-3 border-b border-gray-800 bg-gray-950/60">
                <span className="text-sm font-semibold text-gray-200 tracking-wide">Algorithm Comparison</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700/80 bg-gray-950/40">
                      <th className="text-left px-4 py-2.5 text-gray-400 font-semibold">Algorithm</th>
                      <th className="text-left px-4 py-2.5 text-gray-400 font-semibold">Time</th>
                      <th className="text-left px-4 py-2.5 text-gray-400 font-semibold">Neg weights</th>
                      <th className="text-left px-4 py-2.5 text-gray-400 font-semibold">Output</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    {[
                      ["Dijkstra",       "O((V+E) log V)", "No",  "Shortest paths from source"],
                      ["Bellman-Ford",   "O(VE)",          "Yes", "Shortest paths + neg cycle detection"],
                      ["Kruskal",        "O(E log E)",     "Yes", "Minimum Spanning Tree"],
                      ["TSP (brute)",    "O(n!)",          "—",   "Optimal Hamiltonian cycle (NP-hard)"],
                      ["Prim's MST",     "O(V²)",          "Yes", "Minimum Spanning Tree (vertex-greedy)"],
                      ["Topo Sort",      "O(V+E)",         "—",   "Linear ordering of DAG vertices"],
                      ["Floyd-Warshall", "O(V³)",          "Yes", "All-pairs shortest paths"],
                    ].map(([name, time, neg, output]) => (
                      <tr key={name} className="border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors duration-150">
                        <td className="px-4 py-2.5 text-violet-400 font-medium">{name}</td>
                        <td className="px-4 py-2.5 font-mono text-xs">{time}</td>
                        <td className="px-4 py-2.5 text-xs">{neg}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-400">{output}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </FadeIn>

          {/* Cards — right */}
          <FadeIn from="right" delay="delay-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TypeCard
                href="/algorithms/graph/dijkstra"
                icon="⬡"
                color="bg-violet-700"
                title="Dijkstra's Algorithm"
                subtitle="Single-source shortest path"
                description="Greedy approach using a priority queue. Relaxes edges from the cheapest unvisited vertex. O((V+E) log V)."
                badges={["O((V+E) log V)", "non-negative weights", "greedy", "priority queue"]}
              />
              <TypeCard
                href="/algorithms/graph/bellman-ford"
                icon="↺"
                color="bg-purple-700"
                title="Bellman-Ford"
                subtitle="Handles negative weights"
                description="Relax all edges V-1 times. Slower than Dijkstra but handles negative edge weights and detects negative cycles."
                badges={["O(VE) time", "negative weights OK", "detects neg cycles", "DP-based"]}
              />
              <TypeCard
                href="/algorithms/graph/kruskal"
                icon="⌂"
                color="bg-indigo-700"
                title="Kruskal's MST"
                subtitle="Minimum spanning tree"
                description="Sort edges by weight, add each edge if it doesn't form a cycle (union-find). Builds the cheapest connected subgraph."
                badges={["O(E log E)", "union-find", "greedy", "MST"]}
              />
              <TypeCard
                href="/algorithms/graph/tsp"
                icon="✈"
                color="bg-pink-700"
                title="Travelling Salesman"
                subtitle="NP-hard · brute force"
                description="Find the shortest Hamiltonian cycle visiting all cities exactly once. Brute-forces all (n-1)! permutations on a 4-city complete graph."
                badges={["O(n!) brute force", "NP-hard", "Hamiltonian cycle", "4 cities"]}
              />
              <TypeCard
                href="/algorithms/graph/prim"
                icon="⌂"
                color="bg-emerald-700"
                title="Prim's MST"
                subtitle="Vertex-greedy spanning tree"
                description="Grow a minimum spanning tree one vertex at a time. Greedily add the cheapest edge connecting the current tree to a new vertex."
                badges={["O(V²)", "greedy MST", "vertex-centric", "dense graphs"]}
              />
              <TypeCard
                href="/algorithms/graph/topological-sort"
                icon="⊳"
                color="bg-violet-700"
                title="Topological Sort"
                subtitle="Kahn's BFS · DAG ordering"
                description="Linear ordering of a DAG where every edge u→v has u before v. Uses in-degree tracking and a BFS queue (Kahn's algorithm)."
                badges={["O(V+E)", "DAG only", "Kahn's BFS", "scheduling"]}
              />
              <TypeCard
                href="/algorithms/graph/floyd-warshall"
                icon="⊞"
                color="bg-sky-700"
                title="Floyd-Warshall"
                subtitle="All-pairs shortest paths"
                description="Compute shortest distances between every pair of vertices in one O(V³) pass. Handles negative edges (not negative cycles)."
                badges={["O(V³) time", "O(V²) space", "all-pairs", "negative edges OK"]}
              />
            </div>
          </FadeIn>

        </div>
      </div>
    </div>
  );
}
