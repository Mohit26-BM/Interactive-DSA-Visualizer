import Link from "next/link";
import TypeCard from "@/components/shared/TypeCard";
import FadeIn from "@/components/shared/FadeIn";

export default function GreedyPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-700 rounded-lg flex items-center justify-center text-sm font-bold">G</div>
          <h1 className="text-xl font-bold">Greedy Algorithms</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <FadeIn from="up">
          <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
            Greedy algorithms make the locally optimal choice at each step. Sometimes this yields a global optimum (activity selection, fractional knapsack, Huffman) — sometimes it doesn't (0/1 knapsack, arbitrary coin change).
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6 items-start">
          <FadeIn from="left" delay="delay-0">
            <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-800 bg-gray-950/60">
                <span className="text-sm font-semibold text-gray-200">Complexity Overview</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700/80 bg-gray-950/40">
                      <th className="text-left px-4 py-2.5 text-gray-400 font-semibold">Algorithm</th>
                      <th className="text-left px-4 py-2.5 text-emerald-400 font-semibold">Time</th>
                      <th className="text-left px-4 py-2.5 text-gray-400 font-semibold">Optimal?</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    {[
                      ["Activity Selection", "O(n log n)", "Yes"],
                      ["Fractional Knapsack", "O(n log n)", "Yes"],
                      ["Huffman Coding", "O(n log n)", "Yes"],
                      ["Kruskal's MST", "O(E log E)", "Yes"],
                      ["Prim's MST", "O(V²)", "Yes"],
                      ["Job Sequencing", "O(n²)", "Yes"],
                      ["Greedy Coin Change", "O(target)", "Sometimes"],
                    ].map(([name, time, opt]) => (
                      <tr key={name} className="border-b border-gray-800/50 hover:bg-gray-800/40">
                        <td className="px-4 py-2.5 text-emerald-400 font-medium">{name}</td>
                        <td className="px-4 py-2.5 font-mono text-xs">{time}</td>
                        <td className={`px-4 py-2.5 text-xs font-medium ${opt === "Yes" ? "text-emerald-400" : "text-amber-400"}`}>{opt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </FadeIn>

          <FadeIn from="right" delay="delay-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TypeCard href="/greedy/activity-selection" icon="⏱" color="bg-teal-700"
                title="Activity Selection" subtitle="Earliest finish first"
                description="Select the maximum number of non-overlapping activities. Always pick the activity with the earliest finish time."
                badges={["O(n log n)", "interval scheduling", "greedy proof", "optimal"]} />
              <TypeCard href="/greedy/fractional-knapsack" icon="⚖" color="bg-emerald-700"
                title="Fractional Knapsack" subtitle="Value/weight ratio sort"
                description="Take items by highest value density. Unlike 0/1 knapsack, fractions are allowed — greedy is optimal here."
                badges={["O(n log n)", "ratio sort", "fractional", "optimal"]} />
              <TypeCard href="/greedy/huffman" icon="⌥" color="bg-green-700"
                title="Huffman Coding" subtitle="Optimal prefix-free codes"
                description="Build a minimum-redundancy prefix code by repeatedly merging the two lowest-frequency nodes."
                badges={["O(n log n)", "min-heap", "prefix codes", "compression"]} />
              <TypeCard href="/greedy/job-sequencing" icon="📋" color="bg-lime-700"
                title="Job Sequencing" subtitle="Profit-first scheduling"
                description="Schedule deadline-constrained jobs to maximize total profit. Assign each job to the latest available slot."
                badges={["O(n²)", "deadline scheduling", "profit max", "greedy"]} />
              <TypeCard href="/algorithms/graph/prim" icon="⌂" color="bg-cyan-700"
                title="Prim's MST" subtitle="Vertex-greedy spanning tree"
                description="Grow a minimum spanning tree one vertex at a time. At each step, add the cheapest edge connecting the tree to a new vertex."
                badges={["O(V²)", "MST", "greedy", "dense graphs"]} />
              <TypeCard href="/greedy/greedy-vs-dp" icon="⚡" color="bg-amber-700"
                title="Greedy vs DP" subtitle="When greedy fails · Coin Change"
                description="See the same coin change problem solved by greedy (suboptimal) and DP (optimal) side by side. Understand when greedy breaks."
                badges={["comparison", "coin change", "greedy fails", "DP wins"]} />
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
