import Link from "next/link";
import TypeCard from "@/components/shared/TypeCard";
import FadeIn from "@/components/shared/FadeIn";

export default function StackPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-sm font-bold">▤</div>
          <h1 className="text-xl font-bold">Stacks</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <FadeIn from="up">
          <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
            A stack is a LIFO (Last In, First Out) data structure. Elements are inserted and removed from the same end
            called the top. It can be implemented using an array or a linked list.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6 items-start">

          {/* Table — left */}
          <FadeIn from="left" delay="delay-0">
            <div className="bg-gray-900 border border-gray-700 hover:border-gray-600 transition-colors duration-200 rounded-xl overflow-hidden shadow-lg shadow-black/20">
              <div className="px-4 py-3 border-b border-gray-800 bg-gray-950/60">
                <span className="text-sm font-semibold text-gray-200 tracking-wide">Array vs Linked List Stack</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700/80 bg-gray-950/40">
                      <th className="text-left px-4 py-2.5 text-gray-400 font-semibold">Property</th>
                      <th className="text-left px-4 py-2.5 text-orange-400 font-semibold">Array</th>
                      <th className="text-left px-4 py-2.5 text-amber-400 font-semibold">Linked List</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    {[
                      ["Push",              "O(1)",               "O(1)"],
                      ["Pop",               "O(1)",               "O(1)"],
                      ["Peek",              "O(1)",               "O(1)"],
                      ["isFull check",      "Yes (bounded)",      "No (unbounded)"],
                      ["Memory",            "Pre-allocated",      "Per-node allocation"],
                      ["Cache performance", "Better (contiguous)","Worse (scattered)"],
                      ["Overflow possible", "Yes",                "No (heap limit)"],
                    ].map(([prop, a, ll]) => (
                      <tr key={prop} className="border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors duration-150">
                        <td className="px-4 py-2.5 text-gray-400">{prop}</td>
                        <td className="px-4 py-2.5 font-mono text-xs">{a}</td>
                        <td className="px-4 py-2.5 font-mono text-xs">{ll}</td>
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
                href="/stack/array"
                icon="▤"
                color="bg-orange-600"
                title="Array Stack"
                subtitle="Fixed-capacity implementation"
                description="Uses a fixed-size array with a top pointer. Memory-efficient, cache-friendly, but limited by MAX_SIZE."
                badges={["push O(1)", "pop O(1)", "peek O(1)", "isFull O(1)", "STACK_MAX=8"]}
              />
              <TypeCard
                href="/stack/linkedlist"
                icon="⇡"
                color="bg-amber-600"
                title="Linked List Stack"
                subtitle="Dynamic implementation"
                description="Each push allocates a new node. No size limit (beyond heap memory). Slightly more memory per element."
                badges={["push O(1)", "pop O(1)", "peek O(1)", "no capacity limit"]}
              />
            </div>
          </FadeIn>

        </div>
      </div>
    </div>
  );
}
