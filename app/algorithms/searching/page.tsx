import Link from "next/link";
import TypeCard from "@/components/shared/TypeCard";
import FadeIn from "@/components/shared/FadeIn";

export default function SearchingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-700 rounded-lg flex items-center justify-center text-sm font-bold">⌕</div>
          <h1 className="text-xl font-bold">Searching Algorithms</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <FadeIn from="up">
          <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
            Find elements in arrays using different strategies. Binary and jump search require a sorted array.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6 items-start">

          {/* Table — left */}
          <FadeIn from="left" delay="delay-0">
            <div className="bg-gray-900 border border-gray-700 hover:border-gray-600 transition-colors duration-200 rounded-xl overflow-hidden shadow-lg shadow-black/20">
              <div className="px-4 py-3 border-b border-gray-800 bg-gray-950/60">
                <span className="text-sm font-semibold text-gray-200 tracking-wide">Comparison Table</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700/80 bg-gray-950/40">
                      <th className="text-left px-4 py-2.5 text-gray-400 font-semibold">Algorithm</th>
                      <th className="text-left px-4 py-2.5 text-gray-400 font-semibold">Time</th>
                      <th className="text-left px-4 py-2.5 text-gray-400 font-semibold">Space</th>
                      <th className="text-left px-4 py-2.5 text-gray-400 font-semibold">Requires sorted</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    {[
                      ["Linear", "O(n)",    "O(1)", "No"],
                      ["Binary", "O(log n)","O(1)", "Yes"],
                      ["Jump",   "O(√n)",   "O(1)", "Yes"],
                    ].map(([name, time, space, sorted]) => (
                      <tr key={name} className="border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors duration-150">
                        <td className="px-4 py-2.5 text-cyan-400 font-medium">{name}</td>
                        <td className="px-4 py-2.5 font-mono text-xs">{time}</td>
                        <td className="px-4 py-2.5 font-mono text-xs">{space}</td>
                        <td className="px-4 py-2.5 text-xs">{sorted}</td>
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
                href="/algorithms/searching/linear"
                icon="→"
                color="bg-cyan-700"
                title="Linear Search"
                subtitle="Scan every element"
                description="Check each element one by one until the target is found or the array is exhausted. Works on unsorted arrays."
                badges={["O(n) time", "O(1) space", "unsorted OK", "simple"]}
              />
              <TypeCard
                href="/algorithms/searching/binary"
                icon="⌖"
                color="bg-blue-700"
                title="Binary Search"
                subtitle="Halve search space each step"
                description="Repeatedly halve the search range using low/mid/high pointers. O(log n) — requires sorted array."
                badges={["O(log n) time", "O(1) space", "sorted required", "divide+conquer"]}
              />
              <TypeCard
                href="/algorithms/searching/jump"
                icon="⇥"
                color="bg-indigo-700"
                title="Jump Search"
                subtitle="Block jumps then linear scan"
                description="Jump ahead by √n steps to find the right block, then do a linear scan within that block."
                badges={["O(√n) time", "O(1) space", "sorted required", "block-based"]}
              />
            </div>
          </FadeIn>

        </div>
      </div>
    </div>
  );
}
