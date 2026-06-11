import Link from "next/link";
import TypeCard from "@/components/shared/TypeCard";

export default function AlgorithmsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center text-sm font-bold">λ</div>
          <h1 className="text-xl font-bold">Algorithms</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <p className="text-gray-400 text-sm leading-relaxed">
          Step-by-step visualization of classic algorithms — from O(n²) sorting to Dijkstra's shortest path.
          Watch every comparison, swap, and relaxation with synchronized pseudocode.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TypeCard
            href="/algorithms/sorting"
            icon="↕"
            color="bg-blue-700"
            title="Sorting Algorithms"
            subtitle="Comparison & distribution sorts"
            description="Bubble, Selection, Insertion, Merge, Quick, and Counting Sort. Bar chart animation with swap/compare highlighting."
            badges={["Bubble O(n²)", "Merge O(n log n)", "Quick O(n log n) avg", "Counting O(n+k)"]}
          />
          <TypeCard
            href="/algorithms/searching"
            icon="⌕"
            color="bg-cyan-700"
            title="Searching Algorithms"
            subtitle="Linear, binary & jump search"
            description="Find elements with different strategies. Compare O(n) linear scan vs O(log n) binary search with pointer visualization."
            badges={["Linear O(n)", "Binary O(log n)", "Jump O(√n)"]}
          />
          <TypeCard
            href="/algorithms/graph"
            icon="⬡"
            color="bg-violet-700"
            title="Graph Algorithms"
            subtitle="Shortest path · MST"
            description="Dijkstra's weighted shortest path, Bellman-Ford (handles negative weights), and Kruskal's Minimum Spanning Tree."
            badges={["Dijkstra O((V+E) log V)", "Bellman-Ford O(VE)", "Kruskal O(E log E)"]}
          />
        </div>
      </div>
    </div>
  );
}
