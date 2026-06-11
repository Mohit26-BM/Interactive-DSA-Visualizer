import Link from "next/link";
import TypeCard from "@/components/shared/TypeCard";
import FadeIn from "@/components/shared/FadeIn";

export default function TreePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center text-sm font-bold">⌥</div>
          <h1 className="text-xl font-bold">Trees</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <FadeIn from="up">
          <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
            A tree is a hierarchical data structure with a root node and subtrees of children forming a
            parent-child relationship. Trees power databases, file systems, compilers, and search algorithms.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6 items-start">

          {/* Table — left */}
          <FadeIn from="left" delay="delay-0">
            <div className="bg-gray-900 border border-gray-700 hover:border-gray-600 transition-colors duration-200 rounded-xl overflow-hidden shadow-lg shadow-black/20">
              <div className="px-4 py-3 border-b border-gray-800 bg-gray-950/60">
                <span className="text-sm font-semibold text-gray-200 tracking-wide">BST Traversals — Quick Reference</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700/80 bg-gray-950/40">
                      <th className="text-left px-4 py-2.5 text-gray-400 font-semibold">Traversal</th>
                      <th className="text-left px-4 py-2.5 text-gray-400 font-semibold">Order</th>
                      <th className="text-left px-4 py-2.5 text-gray-400 font-semibold">Use case</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    {[
                      ["Inorder",     "L → N → R",    "Sorted output from BST"],
                      ["Preorder",    "N → L → R",    "Copy/serialize tree"],
                      ["Postorder",   "L → R → N",    "Delete tree, expression eval"],
                      ["Level Order", "Level by level","BFS, shortest path in unweighted tree"],
                    ].map(([t, o, u]) => (
                      <tr key={t} className="border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors duration-150">
                        <td className="px-4 py-2.5 text-green-400 font-medium">{t}</td>
                        <td className="px-4 py-2.5 font-mono text-xs">{o}</td>
                        <td className="px-4 py-2.5 text-gray-400 text-xs">{u}</td>
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
                href="/tree/bst"
                icon="⌥"
                color="bg-green-700"
                title="Binary Search Tree"
                subtitle="Ordered binary tree"
                description="Each node: left subtree has smaller values, right has larger. Enables O(log n) search, insert, delete on balanced trees."
                badges={["insert O(h)", "search O(h)", "delete O(h)", "inorder = sorted", "h = log n avg"]}
              />
              <TypeCard
                href="/tree/avl"
                icon="↕"
                color="bg-emerald-700"
                title="AVL Tree"
                subtitle="Self-balancing BST"
                description="Guarantees O(log n) height via LL/RR/LR/RL rotations. Every insert/delete rebalances automatically."
                badges={["insert O(log n)", "delete O(log n)", "search O(log n)", "4 rotation types"]}
              />
              <TypeCard
                href="/tree/heap"
                icon="△"
                color="bg-lime-700"
                title="Heap"
                subtitle="Min/Max Heap"
                description="Complete binary tree with heap property. O(log n) insert/extract. O(n) buildHeap (Floyd's). Foundation for priority queues."
                badges={["insert O(log n)", "extract O(log n)", "buildHeap O(n)", "heapSort O(n log n)"]}
              />
            </div>
          </FadeIn>

        </div>
      </div>
    </div>
  );
}
