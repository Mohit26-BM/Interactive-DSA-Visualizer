import Link from "next/link";
import TypeCard from "@/components/shared/TypeCard";
import FadeIn from "@/components/shared/FadeIn";

export default function QueuePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-sm font-bold">⇉</div>
          <h1 className="text-xl font-bold">Queues</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <FadeIn from="up">
          <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
            A queue is a FIFO (First In, First Out) data structure. Elements are inserted at the rear and removed
            from the front. Several variants solve different practical problems.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6 items-start">

          {/* Table — left */}
          <FadeIn from="left" delay="delay-0">
            <div className="bg-gray-900 border border-gray-700 hover:border-gray-600 transition-colors duration-200 rounded-xl overflow-hidden shadow-lg shadow-black/20">
              <div className="px-4 py-3 border-b border-gray-800 bg-gray-950/60">
                <span className="text-sm font-semibold text-gray-200 tracking-wide">Queue Variants Comparison</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700/80 bg-gray-950/40">
                      <th className="text-left px-4 py-2.5 text-gray-400 font-semibold">Property</th>
                      <th className="text-left px-4 py-2.5 text-teal-400 font-semibold">Simple</th>
                      <th className="text-left px-4 py-2.5 text-cyan-400 font-semibold">Circular</th>
                      <th className="text-left px-4 py-2.5 text-sky-400 font-semibold">LL</th>
                      <th className="text-left px-4 py-2.5 text-blue-400 font-semibold">Deque</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    {[
                      ["Bounded",       "Yes",  "Yes",    "No",    "No"],
                      ["Reuses slots",  "No",   "Yes ✓",  "N/A",   "N/A"],
                      ["Remove rear",   "No",   "No",     "O(n)",  "O(1) ✓"],
                      ["Insert front",  "No",   "No",     "O(1)*", "O(1) ✓"],
                    ].map(([prop, ...vals]) => (
                      <tr key={prop} className="border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors duration-150">
                        <td className="px-4 py-2.5 text-gray-400">{prop}</td>
                        {vals.map((v, i) => <td key={i} className="px-4 py-2.5 font-mono text-xs">{v}</td>)}
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
                href="/queue/simple"
                icon="→"
                color="bg-teal-600"
                title="Simple Queue"
                subtitle="Basic FIFO array queue"
                description="Fixed-size array with front and rear pointers. Simple but wastes space — deleted slots cannot be reused."
                badges={["enqueue O(1)", "dequeue O(1)", "MAX=7", "no wrap-around"]}
              />
              <TypeCard
                href="/queue/circular"
                icon="↻"
                color="bg-cyan-600"
                title="Circular Queue"
                subtitle="Wrap-around array queue"
                description="Uses modular arithmetic so rear wraps to index 0 after reaching MAX. Reuses space freed by dequeue."
                badges={["enqueue O(1)", "dequeue O(1)", "(rear+1) % MAX", "space efficient"]}
              />
              <TypeCard
                href="/queue/linkedlist"
                icon="⇒"
                color="bg-sky-600"
                title="Linked List Queue"
                subtitle="Dynamic FIFO queue"
                description="Head = front (dequeue), tail = rear (enqueue). Unbounded capacity. Each element is a separate node."
                badges={["enqueue O(1)", "dequeue O(1)", "unbounded", "head=front tail=rear"]}
              />
              <TypeCard
                href="/queue/deque"
                icon="⇔"
                color="bg-blue-600"
                title="Deque"
                subtitle="Double-ended queue"
                description="Insert and remove from both ends in O(1). Generalizes both stack and queue. Doubly-linked for O(1) rear remove."
                badges={["addFront O(1)", "addRear O(1)", "removeFront O(1)", "removeRear O(1)"]}
              />
            </div>
          </FadeIn>

        </div>
      </div>
    </div>
  );
}
