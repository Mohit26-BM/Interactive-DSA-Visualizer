import Link from "next/link";
import TypeCard from "@/components/shared/TypeCard";
import FadeIn from "@/components/shared/FadeIn";

export default function LinkedListPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">⇢</div>
          <h1 className="text-xl font-bold">Linked Lists</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <FadeIn from="up">
          <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
            A linked list is a linear data structure where each element (node) contains a value and one or more
            pointers to the next (and/or previous) node. Unlike arrays, nodes are not stored contiguously in memory.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6 items-start">

          {/* Table — left */}
          <FadeIn from="left" delay="delay-0">
            <div className="bg-gray-900 border border-gray-700 hover:border-gray-600 transition-colors duration-200 rounded-xl overflow-hidden shadow-lg shadow-black/20">
              <div className="px-4 py-3 border-b border-gray-800 bg-gray-950/60">
                <span className="text-sm font-semibold text-gray-200 tracking-wide">Singly vs Doubly — Key Differences</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700/80 bg-gray-950/40">
                      <th className="text-left px-4 py-2.5 text-gray-400 font-semibold">Operation</th>
                      <th className="text-left px-4 py-2.5 text-purple-400 font-semibold">Singly</th>
                      <th className="text-left px-4 py-2.5 text-violet-400 font-semibold">Doubly</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    {[
                      ["Insert at Head", "O(1)", "O(1)"],
                      ["Insert at Tail", "O(n)", "O(1) ✓"],
                      ["Delete at Head", "O(1)", "O(1)"],
                      ["Delete at Tail", "O(n)", "O(1) ✓"],
                      ["Search",         "O(n)", "O(n)"],
                      ["Memory per node","1 pointer", "2 pointers"],
                      ["Reverse traversal","Not possible","Possible ✓"],
                    ].map(([op, s, d]) => (
                      <tr key={op} className="border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors duration-150">
                        <td className="px-4 py-2.5 text-gray-400">{op}</td>
                        <td className="px-4 py-2.5 font-mono text-xs">{s}</td>
                        <td className="px-4 py-2.5 font-mono text-xs">{d}</td>
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
                href="/linked-list/singly"
                icon="→"
                color="bg-purple-600"
                title="Singly Linked List"
                subtitle="One-directional chain"
                description="Each node points to the next node. Simple and memory-efficient. Traversal is one-way (head → tail)."
                badges={["insertAtHead O(1)", "insertAtTail O(n)", "delete O(n)", "search O(n)", "reverse O(n)"]}
              />
              <TypeCard
                href="/linked-list/doubly"
                icon="⇄"
                color="bg-violet-600"
                title="Doubly Linked List"
                subtitle="Bi-directional chain"
                description="Each node has both a next and a prev pointer. Enables O(1) tail operations and backward traversal."
                badges={["insertAtTail O(1)", "deleteAtTail O(1)", "reverse O(n)", "bi-directional"]}
              />
            </div>
          </FadeIn>

        </div>
      </div>
    </div>
  );
}
