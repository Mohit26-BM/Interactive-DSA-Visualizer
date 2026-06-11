import Link from "next/link";
import TypeCard from "@/components/shared/TypeCard";
import FadeIn from "@/components/shared/FadeIn";

export default function SortingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center text-sm font-bold">↕</div>
          <h1 className="text-xl font-bold">Sorting Algorithms</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <FadeIn from="up">
          <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
            Watch each algorithm sort an array step-by-step. Yellow = comparing, red = swapping, green = in
            final position, purple = pivot.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6 items-start">

          {/* Table — left */}
          <FadeIn from="left" delay="delay-0">
            <div className="bg-gray-900 border border-gray-700 hover:border-gray-600 transition-colors duration-200 rounded-xl overflow-hidden shadow-lg shadow-black/20">
              <div className="px-4 py-3 border-b border-gray-800 bg-gray-950/60">
                <span className="text-sm font-semibold text-gray-200 tracking-wide">Complexity Comparison</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700/80 bg-gray-950/40">
                      <th className="text-left px-4 py-2.5 text-gray-400 font-semibold">Algorithm</th>
                      <th className="text-left px-4 py-2.5 text-green-400 font-semibold">Best</th>
                      <th className="text-left px-4 py-2.5 text-gray-400 font-semibold">Average</th>
                      <th className="text-left px-4 py-2.5 text-red-400 font-semibold">Worst</th>
                      <th className="text-left px-4 py-2.5 text-gray-400 font-semibold">Space</th>
                      <th className="text-left px-4 py-2.5 text-gray-400 font-semibold">Stable</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    {[
                      ["Bubble",    "O(n)",       "O(n²)",       "O(n²)",      "O(1)",     "Yes"],
                      ["Selection", "O(n²)",      "O(n²)",       "O(n²)",      "O(1)",     "No"],
                      ["Insertion", "O(n)",       "O(n²)",       "O(n²)",      "O(1)",     "Yes"],
                      ["Merge",     "O(n log n)", "O(n log n)",  "O(n log n)", "O(n)",     "Yes"],
                      ["Quick",     "O(n log n)", "O(n log n)",  "O(n²)",      "O(log n)", "No"],
                      ["Counting",  "O(n+k)",     "O(n+k)",      "O(n+k)",     "O(k)",     "Yes"],
                      ["Heap",      "O(n log n)", "O(n log n)",  "O(n log n)", "O(1)",     "No"],
                      ["Radix",     "O(d·n)",     "O(d·n)",      "O(d·n)",     "O(n+k)",   "Yes"],
                    ].map(([name, best, avg, worst, space, stable]) => (
                      <tr key={name} className="border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors duration-150">
                        <td className="px-4 py-2.5 text-indigo-400 font-medium">{name}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-green-400">{best}</td>
                        <td className="px-4 py-2.5 font-mono text-xs">{avg}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-red-400">{worst}</td>
                        <td className="px-4 py-2.5 font-mono text-xs">{space}</td>
                        <td className="px-4 py-2.5 text-xs">{stable}</td>
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
                href="/algorithms/sorting/bubble"
                icon="↑↓"
                color="bg-orange-700"
                title="Bubble Sort"
                subtitle="Adjacent swaps · stable"
                description="Repeatedly swap adjacent elements if out of order. Largest elements bubble to the end each pass."
                badges={["O(n²) worst", "O(n) best", "O(1) space", "stable"]}
              />
              <TypeCard
                href="/algorithms/sorting/selection"
                icon="↓"
                color="bg-yellow-700"
                title="Selection Sort"
                subtitle="Find minimum · swap to front"
                description="Find the minimum element each pass and swap it to the current position. Simple but always O(n²)."
                badges={["O(n²) always", "O(1) space", "unstable", "min scans"]}
              />
              <TypeCard
                href="/algorithms/sorting/insertion"
                icon="→"
                color="bg-lime-700"
                title="Insertion Sort"
                subtitle="Build sorted prefix · shift"
                description="Insert each element into its correct position in the already-sorted prefix. Great for nearly-sorted data."
                badges={["O(n²) worst", "O(n) best", "O(1) space", "stable"]}
              />
              <TypeCard
                href="/algorithms/sorting/merge"
                icon="⇉"
                color="bg-green-700"
                title="Merge Sort"
                subtitle="Divide & conquer · stable"
                description="Recursively split array in half, sort each half, merge sorted halves. Guaranteed O(n log n)."
                badges={["O(n log n)", "O(n) space", "stable", "divide+conquer"]}
              />
              <TypeCard
                href="/algorithms/sorting/quick"
                icon="⚡"
                color="bg-teal-700"
                title="Quick Sort"
                subtitle="Pivot partition · in-place"
                description="Pick a pivot, partition around it, recurse on both sides. Fast in practice — O(n log n) average."
                badges={["O(n log n) avg", "O(n²) worst", "O(log n) space", "in-place"]}
              />
              <TypeCard
                href="/algorithms/sorting/counting"
                icon="#"
                color="bg-cyan-700"
                title="Counting Sort"
                subtitle="Non-comparison · O(n+k)"
                description="Count occurrences of each value, reconstruct sorted array. Linear time when k (range) is small."
                badges={["O(n+k) time", "O(k) space", "stable", "non-comparison"]}
              />
              <TypeCard
                href="/algorithms/sorting/heap"
                icon="△"
                color="bg-lime-700"
                title="Heap Sort"
                subtitle="Max-heap · in-place"
                description="Build a max-heap, then repeatedly extract the maximum to sorted position. Guaranteed O(n log n) with O(1) extra space."
                badges={["O(n log n)", "O(1) space", "unstable", "in-place"]}
              />
              <TypeCard
                href="/algorithms/sorting/radix"
                icon="0-9"
                color="bg-sky-700"
                title="Radix Sort"
                subtitle="Non-comparison · LSD · bucket"
                description="Sort integers digit-by-digit from least to most significant. Distributes into 10 buckets each pass. O(d·n) — beats O(n log n) for small d."
                badges={["O(d·n) time", "O(n+k) space", "stable", "non-comparison"]}
              />
            </div>
          </FadeIn>

        </div>
      </div>
    </div>
  );
}
