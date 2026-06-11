import Link from "next/link";
import TypeCard from "@/components/shared/TypeCard";
import FadeIn from "@/components/shared/FadeIn";

export default function GraphPage() {
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
          <h1 className="text-xl font-bold">Graphs</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <FadeIn from="up">
          <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
            A graph is a set of vertices (nodes) connected by edges. Unlike trees, graphs can have cycles,
            multiple paths between nodes, and disconnected components. Graphs model networks, maps, social
            connections, and more.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6 items-start">

          {/* Table — left */}
          <FadeIn from="left" delay="delay-0">
            <div className="bg-gray-900 border border-gray-700 hover:border-gray-600 transition-colors duration-200 rounded-xl overflow-hidden shadow-lg shadow-black/20">
              <div className="px-4 py-3 border-b border-gray-800 bg-gray-950/60">
                <span className="text-sm font-semibold text-gray-200 tracking-wide">Graph Representations — Quick Reference</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700/80 bg-gray-950/40">
                      <th className="text-left px-4 py-2.5 text-gray-400 font-semibold">Property</th>
                      <th className="text-left px-4 py-2.5 text-violet-400 font-semibold">Undirected</th>
                      <th className="text-left px-4 py-2.5 text-purple-400 font-semibold">Directed</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    {[
                      ["Edges",         "(u,v) = (v,u)",               "u→v ≠ v→u"],
                      ["DFS",           "finds connected components",  "finds reachability"],
                      ["BFS",           "shortest hop path",           "shortest hop path"],
                      ["Cycles",        "requires ≥ 3 nodes",          "can have self-loops"],
                      ["Applications",  "social networks, roads",      "web links, DAGs, deps"],
                    ].map(([prop, und, dir]) => (
                      <tr key={prop} className="border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors duration-150">
                        <td className="px-4 py-2.5 text-violet-400 font-medium">{prop}</td>
                        <td className="px-4 py-2.5 text-gray-400 text-xs font-mono">{und}</td>
                        <td className="px-4 py-2.5 text-gray-400 text-xs font-mono">{dir}</td>
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
                href="/graph/undirected"
                icon="○—○"
                color="bg-violet-700"
                title="Undirected Graph"
                subtitle="Symmetric edges"
                description="Edges have no direction: A—B means A connects to B and B connects to A. Models roads, friendships, cables."
                badges={["DFS", "BFS", "O(V+E)", "components"]}
              />
              <TypeCard
                href="/graph/directed"
                icon="○→○"
                color="bg-purple-700"
                title="Directed Graph"
                subtitle="Asymmetric edges (digraph)"
                description="Edges have direction: A→B does NOT imply B→A. Models web links, dependencies, control flow."
                badges={["DFS", "BFS", "DAG", "reachability"]}
              />
            </div>
          </FadeIn>

        </div>
      </div>
    </div>
  );
}
