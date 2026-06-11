import Link from "next/link";
import HeroAnimation from "@/components/home/HeroAnimation";
import FadeIn from "@/components/shared/FadeIn";

// ─── Inline SVG concept diagrams ────────────────────────────────────────────

const ArrayDiagram = () => (
  <svg viewBox="0 0 278 52" className="w-full" aria-hidden="true">
    {[10, 25, 7, 3, 18].map((v, i) => (
      <g key={i}>
        <rect x={i * 55 + 1} y={1} width={50} height={32} rx={5} fill="#1e1b4b" stroke="#6366f1" strokeWidth={1.5} />
        <text x={i * 55 + 26} y={17} textAnchor="middle" dominantBaseline="middle" fill="#a5b4fc" fontSize={12} fontFamily="monospace" fontWeight="bold">{v}</text>
        <text x={i * 55 + 26} y={46} textAnchor="middle" fill="#374151" fontSize={10} fontFamily="monospace">{i}</text>
      </g>
    ))}
  </svg>
);

const LinkedListDiagram = () => (
  <svg viewBox="0 0 280 52" className="w-full" aria-hidden="true">
    {[42, 15, 7].map((v, i) => (
      <g key={i}>
        <circle cx={i * 82 + 26} cy={26} r={22} fill="#2e1065" stroke="#7c3aed" strokeWidth={1.5} />
        <text x={i * 82 + 26} y={26} textAnchor="middle" dominantBaseline="middle" fill="#ddd6fe" fontSize={12} fontFamily="monospace" fontWeight="bold">{v}</text>
        {i < 2 && (
          <>
            <line x1={i * 82 + 48} y1={26} x2={i * 82 + 75} y2={26} stroke="#6b7280" strokeWidth={1.5} />
            <polygon points={`${i * 82 + 73},22 ${i * 82 + 73},30 ${i * 82 + 79},26`} fill="#6b7280" />
          </>
        )}
      </g>
    ))}
    <line x1={216} y1={26} x2={245} y2={26} stroke="#6b7280" strokeWidth={1.5} />
    <text x={262} y={26} textAnchor="middle" dominantBaseline="middle" fill="#374151" fontSize={9} fontFamily="monospace">null</text>
  </svg>
);

const StackDiagram = () => (
  <svg viewBox="0 0 280 44" className="w-full" aria-hidden="true">
    {/* Horizontal stack: right = TOP */}
    {[7, 3, 8].map((v, i) => (
      <g key={i}>
        <rect x={i * 62 + 20} y={6} width={56} height={32} rx={4} fill="#431407" stroke={i === 2 ? "#f97316" : "#ea580c"} strokeWidth={i === 2 ? 2 : 1.5} />
        <text x={i * 62 + 48} y={22} textAnchor="middle" dominantBaseline="middle" fill="#fed7aa" fontSize={12} fontFamily="monospace" fontWeight="bold">{v}</text>
      </g>
    ))}
    <text x={207} y={16} fill="#f97316" fontSize={9} fontFamily="monospace">← TOP</text>
    {/* BOTTOM label */}
    <text x={48} y={42} textAnchor="middle" fill="#374151" fontSize={8} fontFamily="monospace">BOTTOM</text>
  </svg>
);

const QueueDiagram = () => (
  <svg viewBox="0 0 280 52" className="w-full" aria-hidden="true">
    {/* Arrow in from left */}
    <line x1={4} y1={22} x2={22} y2={22} stroke="#14b8a6" strokeWidth={1.5} />
    <polygon points="20,18 20,26 26,22" fill="#14b8a6" />
    {/* 4 boxes */}
    {[4, 12, 7, 9].map((v, i) => (
      <g key={i}>
        <rect x={i * 52 + 28} y={6} width={48} height={32} rx={4} fill="#0f1f1c" stroke="#14b8a6" strokeWidth={1.5} />
        <text x={i * 52 + 52} y={22} textAnchor="middle" dominantBaseline="middle" fill="#99f6e4" fontSize={12} fontFamily="monospace" fontWeight="bold">{v}</text>
      </g>
    ))}
    {/* Arrow out to right */}
    <line x1={236} y1={22} x2={254} y2={22} stroke="#14b8a6" strokeWidth={1.5} />
    <polygon points="252,18 252,26 258,22" fill="#14b8a6" />
    {/* Labels */}
    <text x={52} y={48} textAnchor="middle" fill="#0f766e" fontSize={9} fontFamily="monospace">FRONT</text>
    <text x={184} y={48} textAnchor="middle" fill="#0f766e" fontSize={9} fontFamily="monospace">REAR</text>
  </svg>
);

const TreeDiagram = () => (
  <svg viewBox="0 0 280 90" className="w-full" aria-hidden="true">
    {/* Edges */}
    <line x1={140} y1={22} x2={80} y2={58} stroke="#166534" strokeWidth={1.5} />
    <line x1={140} y1={22} x2={200} y2={58} stroke="#166534" strokeWidth={1.5} />
    <line x1={80}  y1={58} x2={46}  y2={82} stroke="#166534" strokeWidth={1.5} />
    <line x1={80}  y1={58} x2={114} y2={82} stroke="#166534" strokeWidth={1.5} />
    {/* Nodes */}
    <circle cx={140} cy={18} r={16} fill="#052e16" stroke="#22c55e" strokeWidth={2} />
    <text x={140} y={18} textAnchor="middle" dominantBaseline="middle" fill="#bbf7d0" fontSize={11} fontFamily="monospace" fontWeight="bold">50</text>
    <circle cx={80} cy={56} r={16} fill="#052e16" stroke="#22c55e" strokeWidth={1.5} />
    <text x={80} y={56} textAnchor="middle" dominantBaseline="middle" fill="#bbf7d0" fontSize={11} fontFamily="monospace" fontWeight="bold">30</text>
    <circle cx={200} cy={56} r={16} fill="#052e16" stroke="#22c55e" strokeWidth={1.5} />
    <text x={200} y={56} textAnchor="middle" dominantBaseline="middle" fill="#bbf7d0" fontSize={11} fontFamily="monospace" fontWeight="bold">70</text>
    <circle cx={46} cy={82} r={12} fill="#052e16" stroke="#16a34a" strokeWidth={1.5} />
    <text x={46} y={82} textAnchor="middle" dominantBaseline="middle" fill="#86efac" fontSize={9} fontFamily="monospace">20</text>
    <circle cx={114} cy={82} r={12} fill="#052e16" stroke="#16a34a" strokeWidth={1.5} />
    <text x={114} y={82} textAnchor="middle" dominantBaseline="middle" fill="#86efac" fontSize={9} fontFamily="monospace">40</text>
  </svg>
);

const GraphDiagram = () => (
  <svg viewBox="0 0 280 90" className="w-full" aria-hidden="true">
    {/* Edges */}
    <line x1={80}  y1={20} x2={200} y2={20} stroke="#5b21b6" strokeWidth={1.5} />
    <line x1={80}  y1={20} x2={80}  y2={70} stroke="#7c3aed" strokeWidth={2} />
    <line x1={200} y1={20} x2={200} y2={70} stroke="#5b21b6" strokeWidth={1.5} />
    <line x1={80}  y1={70} x2={200} y2={70} stroke="#5b21b6" strokeWidth={1.5} />
    <line x1={80}  y1={20} x2={200} y2={70} stroke="#4c1d95" strokeWidth={1} strokeDasharray="4,3" />
    {/* Weight labels */}
    <text x={140} y={14} textAnchor="middle" fill="#6b7280" fontSize={9} fontFamily="monospace">4</text>
    <text x={68}  y={45} textAnchor="middle" fill="#a78bfa" fontSize={9} fontFamily="monospace">2</text>
    <text x={212} y={45} textAnchor="middle" fill="#6b7280" fontSize={9} fontFamily="monospace">5</text>
    <text x={140} y={83} textAnchor="middle" fill="#6b7280" fontSize={9} fontFamily="monospace">1</text>
    {/* Nodes */}
    {[{x:80,y:20,l:"A"},{x:200,y:20,l:"B"},{x:80,y:70,l:"C"},{x:200,y:70,l:"D"}].map(({x,y,l}) => (
      <g key={l}>
        <circle cx={x} cy={y} r={16} fill="#2e1065" stroke="#7c3aed" strokeWidth={1.5} />
        <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="#ddd6fe" fontSize={12} fontFamily="monospace" fontWeight="bold">{l}</text>
      </g>
    ))}
  </svg>
);

const HashMapDiagram = () => (
  <svg viewBox="0 0 280 72" className="w-full" aria-hidden="true">
    {[
      { idx: 0, key: "name", val: "42" },
      { idx: 1, key: "age",  val: "25" },
      { idx: 2, key: null,   val: null  },
    ].map(({ idx, key, val }) => (
      <g key={idx}>
        {/* Bucket index box */}
        <rect x={8} y={idx * 24 + 2} width={22} height={20} rx={3} fill="#1c1007" stroke="#d97706" strokeWidth={1.5} />
        <text x={19} y={idx * 24 + 12} textAnchor="middle" dominantBaseline="middle" fill="#fbbf24" fontSize={10} fontFamily="monospace" fontWeight="bold">{idx}</text>
        {/* Arrow */}
        <line x1={30} y1={idx * 24 + 12} x2={48} y2={idx * 24 + 12} stroke="#6b7280" strokeWidth={1} />
        <polygon points={`${46},${idx * 24 + 9} ${46},${idx * 24 + 15} ${51},${idx * 24 + 12}`} fill="#6b7280" />
        {/* Entry or empty */}
        {key ? (
          <>
            <rect x={53} y={idx * 24 + 2} width={90} height={20} rx={3} fill="#1c1007" stroke="#d97706" strokeWidth={1} />
            <text x={98} y={idx * 24 + 12} textAnchor="middle" dominantBaseline="middle" fill="#fde68a" fontSize={9} fontFamily="monospace">{key} → {val}</text>
          </>
        ) : (
          <text x={56} y={idx * 24 + 12} dominantBaseline="middle" fill="#374151" fontSize={9} fontFamily="monospace">∅ empty</text>
        )}
      </g>
    ))}
  </svg>
);

const SortingDiagram = () => {
  const bars = [6, 3, 8, 1, 5, 7, 2, 4];
  const max = 8;
  const w = 26;
  const gap = 6;
  return (
    <svg viewBox="0 0 280 60" className="w-full" aria-hidden="true">
      {bars.map((v, i) => {
        const isComparing = i === 2 || i === 3;
        const isSorted    = i >= 6;
        const h = Math.round((v / max) * 44);
        return (
          <g key={i}>
            <rect
              x={i * (w + gap) + 10} y={52 - h} width={w} height={h}
              rx={3}
              fill={isComparing ? "#eab308" : isSorted ? "#059669" : "#4338ca"}
              stroke={isComparing ? "#fbbf24" : isSorted ? "#10b981" : "#6366f1"}
              strokeWidth={0.5}
            />
            <text x={i * (w + gap) + 23} y={58} textAnchor="middle" fill="#374151" fontSize={8} fontFamily="monospace">{v}</text>
          </g>
        );
      })}
    </svg>
  );
};

const SearchingDiagram = () => (
  <svg viewBox="0 0 280 56" className="w-full" aria-hidden="true">
    {[5, 12, 23, 41, 67].map((v, i) => {
      const isFound    = i === 3;
      const isScanning = i === 2;
      return (
        <g key={i}>
          <rect x={i * 54 + 2} y={4} width={50} height={32} rx={4}
            fill={isFound ? "#052e16" : isScanning ? "#1a1507" : "#1e1b4b"}
            stroke={isFound ? "#22c55e" : isScanning ? "#eab308" : "#6366f1"}
            strokeWidth={isFound ? 2 : 1.5}
          />
          <text x={i * 54 + 27} y={20} textAnchor="middle" dominantBaseline="middle"
            fill={isFound ? "#86efac" : isScanning ? "#fef08a" : "#a5b4fc"}
            fontSize={11} fontFamily="monospace" fontWeight="bold">{v}</text>
          {isFound && (
            <text x={i * 54 + 27} y={50} textAnchor="middle" fill="#22c55e" fontSize={12} fontFamily="monospace">↑</text>
          )}
        </g>
      );
    })}
  </svg>
);

const DPDiagram = () => (
  <svg viewBox="0 0 280 72" className="w-full" aria-hidden="true">
    {/* 4-row × 5-col DP grid */}
    {Array.from({ length: 4 }, (_, row) =>
      Array.from({ length: 5 }, (_, col) => {
        const vals = [[0,0,0,0,0],[0,1,1,1,1],[0,1,1,2,2],[0,1,2,2,3]];
        const val = vals[row]?.[col] ?? 0;
        const isActive = row === 2 && col === 3;
        const isFilled = row < 3 || (row === 3 && col < 4);
        return (
          <g key={`${row}-${col}`}>
            <rect x={col * 55 + 2} y={row * 17 + 2} width={50} height={14} rx={2}
              fill={isActive ? "#4c0519" : isFilled ? "#1c0a1a" : "#111827"}
              stroke={isActive ? "#f43f5e" : isFilled ? "#9f1239" : "#374151"}
              strokeWidth={isActive ? 2 : 1}
            />
            <text x={col * 55 + 27} y={row * 17 + 9} textAnchor="middle" dominantBaseline="middle"
              fill={isActive ? "#fb7185" : isFilled ? "#fda4af" : "#374151"}
              fontSize={8} fontFamily="monospace" fontWeight={isActive ? "bold" : "normal"}>
              {isFilled ? val : "?"}
            </text>
          </g>
        );
      })
    )}
    <text x={3} y={71} fill="#f43f5e" fontSize={7} fontFamily="monospace">filling table bottom-up →</text>
  </svg>
);

const UnionFindDiagram = () => (
  <svg viewBox="0 0 280 56" className="w-full" aria-hidden="true">
    {[0,1,2,3,4,5,6,7].map((n, i) => {
      const connected = [[0,1,2,3],[4,5,6,7]];
      const compIdx = connected[0].includes(n) ? 0 : 1;
      const stroke = compIdx === 0 ? "#6366f1" : "#10b981";
      const fill = compIdx === 0 ? "#1e1b4b" : "#052e16";
      const fill2 = compIdx === 0 ? "#a5b4fc" : "#34d399";
      return (
        <g key={n}>
          <circle cx={i * 34 + 16} cy={28} r={13} fill={fill} stroke={stroke} strokeWidth={1.5} />
          <text x={i * 34 + 16} y={28} textAnchor="middle" dominantBaseline="middle" fill={fill2} fontSize={10} fontFamily="monospace" fontWeight="bold">{n}</text>
        </g>
      );
    })}
    {[[0,1],[1,2],[2,3],[4,5],[5,6],[6,7]].map(([a,b]) => {
      const compIdx = a < 4 ? 0 : 1;
      const stroke = compIdx === 0 ? "#4338ca" : "#059669";
      return <line key={`${a}-${b}`} x1={a*34+29} y1={28} x2={b*34+3} y2={28} stroke={stroke} strokeWidth={1} />;
    })}
  </svg>
);

const TrieDiagram = () => (
  <svg viewBox="0 0 280 80" className="w-full" aria-hidden="true">
    {/* root */}
    <circle cx={140} cy={14} r={11} fill="#1e1b4b" stroke="#6b7280" strokeWidth={1.5} />
    <text x={140} y={14} textAnchor="middle" dominantBaseline="middle" fill="#6b7280" fontSize={7} fontFamily="monospace">root</text>
    {/* a branch */}
    <line x1={140} y1={25} x2={80} y2={40} stroke="#4b5563" strokeWidth={1.5} />
    <text x={108} y={33} fill="#818cf8" fontSize={9} fontFamily="monospace">a</text>
    <circle cx={80} cy={50} r={11} fill="#1e1b4b" stroke="#6366f1" strokeWidth={1.5} />
    <text x={80} y={50} textAnchor="middle" dominantBaseline="middle" fill="#a5b4fc" fontSize={10} fontFamily="monospace" fontWeight="bold">a</text>
    {/* p under a */}
    <line x1={80} y1={61} x2={60} y2={74} stroke="#4b5563" strokeWidth={1.5} />
    <text x={67} y={68} fill="#818cf8" fontSize={9} fontFamily="monospace">p</text>
    <circle cx={60} cy={76} r={8} fill="#052e16" stroke="#10b981" strokeWidth={2} />
    <text x={60} y={76} textAnchor="middle" dominantBaseline="middle" fill="#34d399" fontSize={9} fontFamily="monospace" fontWeight="bold">p</text>
    {/* b branch */}
    <line x1={140} y1={25} x2={200} y2={40} stroke="#4b5563" strokeWidth={1.5} />
    <text x={172} y={33} fill="#818cf8" fontSize={9} fontFamily="monospace">b</text>
    <circle cx={200} cy={50} r={11} fill="#1e1b4b" stroke="#6366f1" strokeWidth={1.5} />
    <text x={200} y={50} textAnchor="middle" dominantBaseline="middle" fill="#a5b4fc" fontSize={10} fontFamily="monospace" fontWeight="bold">b</text>
    {/* end dot */}
    <circle cx={209} cy={41} r={3} fill="#10b981" />
    <text x={5} y={76} fill="#4338ca" fontSize={7} fontFamily="monospace">green dot = end of word</text>
  </svg>
);

const GraphAlgoDiagram = () => (
  <svg viewBox="0 0 280 90" className="w-full" aria-hidden="true">
    {/* Highlighted shortest path A→C→D */}
    <line x1={80}  y1={20} x2={200} y2={20} stroke="#4b5563" strokeWidth={1.5} />
    <line x1={80}  y1={20} x2={80}  y2={70} stroke="#7c3aed" strokeWidth={2.5} />
    <line x1={80}  y1={70} x2={200} y2={70} stroke="#7c3aed" strokeWidth={2.5} />
    <line x1={200} y1={20} x2={200} y2={70} stroke="#4b5563" strokeWidth={1.5} />
    {/* Weights */}
    <text x={140} y={14} textAnchor="middle" fill="#6b7280" fontSize={9} fontFamily="monospace">4</text>
    <text x={66}  y={45} textAnchor="middle" fill="#a78bfa" fontSize={10} fontFamily="monospace" fontWeight="bold">2</text>
    <text x={140} y={84} textAnchor="middle" fill="#a78bfa" fontSize={10} fontFamily="monospace" fontWeight="bold">1</text>
    <text x={214} y={45} textAnchor="middle" fill="#6b7280" fontSize={9} fontFamily="monospace">3</text>
    {/* Nodes */}
    {[{x:80,y:20,l:"A",hl:true},{x:200,y:20,l:"B",hl:false},{x:80,y:70,l:"C",hl:true},{x:200,y:70,l:"D",hl:true}].map(({x,y,l,hl}) => (
      <g key={l}>
        <circle cx={x} cy={y} r={16} fill={hl ? "#2e1065" : "#1f2937"} stroke={hl ? "#7c3aed" : "#4b5563"} strokeWidth={hl ? 2 : 1.5} className={hl ? "[filter:drop-shadow(0_0_6px_#7c3aed60)]" : undefined} />
        <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill={hl ? "#ddd6fe" : "#6b7280"} fontSize={12} fontFamily="monospace" fontWeight="bold">{l}</text>
      </g>
    ))}
    {/* "shortest path" label */}
    <text x={5} y={88} fill="#7c3aed" fontSize={8} fontFamily="monospace">A→C→D shortest path</text>
  </svg>
);

// ─── Card data ────────────────────────────────────────────────────────────────

const DS_CARDS = [
  {
    href: "/array",
    icon: "[]",
    color: "bg-indigo-600",
    glow: "group-hover:shadow-indigo-500/20",
    border: "hover:border-indigo-500/40",
    title: "Arrays",
    subtitle: "Random access · O(1) index",
    description: "The fundamental building block. Insert, delete, search, update, and sort with full step-by-step animation.",
    types: ["Standard Array"],
    badge: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
    diagram: <ArrayDiagram />,
  },
  {
    href: "/linked-list",
    icon: "⇢",
    color: "bg-purple-600",
    glow: "group-hover:shadow-purple-500/20",
    border: "hover:border-purple-500/40",
    title: "Linked Lists",
    subtitle: "Dynamic nodes · pointer chains",
    description: "One-way and two-way chains. Compare singly vs doubly — see why doubly achieves O(1) tail operations.",
    types: ["Singly", "Doubly"],
    badge: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    diagram: <LinkedListDiagram />,
  },
  {
    href: "/stack",
    icon: "▤",
    color: "bg-orange-600",
    glow: "group-hover:shadow-orange-500/20",
    border: "hover:border-orange-500/40",
    title: "Stacks",
    subtitle: "LIFO · Last In First Out",
    description: "Push and pop from the top. Array-based (fixed capacity) vs Linked List (unbounded) implementations.",
    types: ["Array Stack", "LL Stack"],
    badge: "bg-orange-500/10 text-orange-300 border-orange-500/20",
    diagram: <StackDiagram />,
  },
  {
    href: "/queue",
    icon: "⇉",
    color: "bg-teal-600",
    glow: "group-hover:shadow-teal-500/20",
    border: "hover:border-teal-500/40",
    title: "Queues",
    subtitle: "FIFO · First In First Out",
    description: "Four variants: Simple, Circular (modular arithmetic), Linked List, and Deque (double-ended).",
    types: ["Simple", "Circular", "LL", "Deque"],
    badge: "bg-teal-500/10 text-teal-300 border-teal-500/20",
    diagram: <QueueDiagram />,
  },
  {
    href: "/tree",
    icon: "⌥",
    color: "bg-green-700",
    glow: "group-hover:shadow-green-500/20",
    border: "hover:border-green-500/40",
    title: "Trees",
    subtitle: "Hierarchical · O(log n) search",
    description: "BST, self-balancing AVL with rotations, and Min/Max Heap. All four traversals, heapSort, Floyd's buildHeap.",
    types: ["BST", "AVL", "Heap"],
    badge: "bg-green-500/10 text-green-300 border-green-500/20",
    diagram: <TreeDiagram />,
  },
  {
    href: "/graph",
    icon: "⬡",
    color: "bg-violet-700",
    glow: "group-hover:shadow-violet-500/20",
    border: "hover:border-violet-500/40",
    title: "Graphs",
    subtitle: "Vertices & Edges · V+E model",
    description: "Undirected and directed graphs. Visualize DFS, BFS traversals with step-by-step adjacency exploration.",
    types: ["Undirected", "Directed"],
    badge: "bg-violet-500/10 text-violet-300 border-violet-500/20",
    diagram: <GraphDiagram />,
  },
  {
    href: "/hashmap",
    icon: "{}",
    color: "bg-amber-600",
    glow: "group-hover:shadow-amber-500/20",
    border: "hover:border-amber-500/40",
    title: "Hash Map",
    subtitle: "O(1) avg · key→value store",
    description: "Separate chaining hash table. Watch the djb2 hash function route keys to buckets and handle collisions.",
    types: ["Separate Chaining"],
    badge: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    diagram: <HashMapDiagram />,
  },
  {
    href: "/data-structures/union-find",
    icon: "∪",
    color: "bg-indigo-700",
    glow: "group-hover:shadow-indigo-500/20",
    border: "hover:border-indigo-500/40",
    title: "Union-Find",
    subtitle: "DSU · path compression · union by rank",
    description: "Disjoint Set Union. Watch path compression flatten chains and union-by-rank keep trees shallow. Near-O(1) amortized per operation.",
    types: ["Path Compression", "Union by Rank"],
    badge: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
    diagram: <UnionFindDiagram />,
  },
  {
    href: "/data-structures/trie",
    icon: "T",
    color: "bg-violet-700",
    glow: "group-hover:shadow-violet-500/20",
    border: "hover:border-violet-500/40",
    title: "Trie",
    subtitle: "Prefix tree · O(m) ops",
    description: "Prefix tree where each path encodes a word. Insert, search, and startsWith all in O(m) time. Shared prefixes share nodes.",
    types: ["Insert", "Search", "startsWith"],
    badge: "bg-violet-500/10 text-violet-300 border-violet-500/20",
    diagram: <TrieDiagram />,
  },
];

const GreedyDiagram = () => (
  <svg viewBox="0 0 280 72" className="w-full" aria-hidden="true">
    {/* Activity bars */}
    {[
      { s: 0, e: 2,  sel: true  },
      { s: 1, e: 3,  sel: false },
      { s: 2, e: 4,  sel: true  },
      { s: 5, e: 7,  sel: true  },
      { s: 7, e: 9,  sel: true  },
      { s: 4, e: 8,  sel: false },
    ].map((act, i) => {
      const MAX = 10;
      const W_UNIT = 25;
      const x = act.s * W_UNIT + 8;
      const w = (act.e - act.s) * W_UNIT;
      const y = i * 11 + 4;
      return (
        <g key={i}>
          <rect x={x} y={y} width={w} height={9} rx={2}
            fill={act.sel ? "#052e16" : "#1a0a0a"}
            stroke={act.sel ? "#10b981" : "#7f1d1d"}
            strokeWidth={act.sel ? 1.5 : 1}
          />
        </g>
      );
    })}
    {/* Legend */}
    <rect x={8} y={73-14} width={8} height={8} rx={1} fill="#052e16" stroke="#10b981" strokeWidth={1.5} />
    <text x={20} y={73-8} fill="#10b981" fontSize={7} fontFamily="monospace">selected</text>
    <rect x={72} y={73-14} width={8} height={8} rx={1} fill="#1a0a0a" stroke="#7f1d1d" strokeWidth={1} />
    <text x={84} y={73-8} fill="#7f1d1d" fontSize={7} fontFamily="monospace">rejected</text>
    <text x={160} y={73-8} fill="#374151" fontSize={7} fontFamily="monospace">earliest-finish greedy</text>
  </svg>
);

const ALGO_CARDS = [
  {
    href: "/algorithms/sorting",
    icon: "↕",
    color: "bg-blue-700",
    glow: "group-hover:shadow-blue-500/20",
    border: "hover:border-blue-500/40",
    title: "Sorting",
    subtitle: "Comparison & distribution sorts",
    description: "Bubble, Selection, Insertion, Merge, Quick, Counting. Bar chart with swap/compare/sorted highlighting.",
    types: ["O(n²)", "O(n log n)", "O(n+k)"],
    badge: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    diagram: <SortingDiagram />,
  },
  {
    href: "/algorithms/searching",
    icon: "⌕",
    color: "bg-cyan-700",
    glow: "group-hover:shadow-cyan-500/20",
    border: "hover:border-cyan-500/40",
    title: "Searching",
    subtitle: "Linear, binary & jump search",
    description: "Compare O(n) linear scan vs O(log n) binary search vs O(√n) jump search with pointer visualization.",
    types: ["Linear O(n)", "Binary O(log n)", "Jump O(√n)"],
    badge: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
    diagram: <SearchingDiagram />,
  },
  {
    href: "/algorithms/graph",
    icon: "⬡",
    color: "bg-violet-700",
    glow: "group-hover:shadow-violet-500/20",
    border: "hover:border-violet-500/40",
    title: "Graph Algorithms",
    subtitle: "Shortest path · MST · TSP",
    description: "Dijkstra's weighted shortest path, Bellman-Ford with negative weights, Kruskal's MST, and Travelling Salesman.",
    types: ["Dijkstra", "Bellman-Ford", "Kruskal", "TSP"],
    badge: "bg-violet-500/10 text-violet-300 border-violet-500/20",
    diagram: <GraphAlgoDiagram />,
  },
  {
    href: "/dp",
    icon: "DP",
    color: "bg-rose-700",
    glow: "group-hover:shadow-rose-500/20",
    border: "hover:border-rose-500/40",
    title: "Dynamic Programming",
    subtitle: "Overlapping subproblems · optimal",
    description: "Fibonacci, 0/1 Knapsack, LCS, Coin Change, LIS, Grid DP, Edit Distance — watch each DP table fill bottom-up.",
    types: ["Fibonacci", "Knapsack", "LCS", "Coin Change", "LIS"],
    badge: "bg-rose-500/10 text-rose-300 border-rose-500/20",
    diagram: <DPDiagram />,
  },
  {
    href: "/greedy",
    icon: "G",
    color: "bg-emerald-700",
    glow: "group-hover:shadow-emerald-500/20",
    border: "hover:border-emerald-500/40",
    title: "Greedy Algorithms",
    subtitle: "Locally optimal · scheduling · coding",
    description: "Activity Selection, Fractional Knapsack, Huffman Coding, Prim's MST, Job Sequencing, and a Greedy vs DP comparison.",
    types: ["Activity Sel.", "Knapsack", "Huffman", "Prim's", "Greedy vs DP"],
    badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    diagram: <GreedyDiagram />,
  },
];

// ─── Card grid component ──────────────────────────────────────────────────────

type AnyCard = typeof DS_CARDS[number] | typeof ALGO_CARDS[number];

const CARD_DELAYS = ["delay-0", "delay-100", "delay-200"] as const;

function CardGrid({ cards }: { cards: AnyCard[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {cards.map((card, i) => (
        <FadeIn key={card.href} delay={CARD_DELAYS[i % 3]} className="h-full">
          <Link
            href={card.href}
            className={`group h-full bg-gray-900 border border-gray-700 ${card.border} rounded-xl p-6 flex flex-col gap-3 transition-all duration-300 hover:shadow-2xl hover:scale-[1.025] hover:-translate-y-1 active:scale-[0.99] ${card.glow}`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center text-xl font-bold shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                {card.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-white text-lg leading-tight">{card.title}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{card.subtitle}</p>
              </div>
              <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-300 group-hover:translate-x-1 transition-all duration-300 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* Concept diagram */}
            <div className="rounded-lg bg-gray-950/70 border border-gray-800/60 px-3 py-2 overflow-hidden transition-all duration-300 group-hover:border-gray-700/80 group-hover:brightness-110">
              {card.diagram}
            </div>

            <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">{card.description}</p>
            <div className="flex flex-wrap gap-1.5 mt-auto">
              {card.types.map((t) => (
                <span key={t} className={`text-[10px] border px-2 py-0.5 rounded-full font-medium ${card.badge}`}>
                  {t}
                </span>
              ))}
            </div>
          </Link>
        </FadeIn>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Hero — 2-column on desktop */}
      <div className="border-b border-gray-800 py-12">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-20 flex flex-col lg:flex-row items-center gap-10 lg:gap-14">

          {/* Left: text — 38% on desktop */}
          <FadeIn from="left" delay="delay-0" className="w-full lg:w-[38%] shrink-0">
            <div className="text-center lg:text-left space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
                Interactive DSA Visualizer
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                See Algorithms<br />Execute Live
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto lg:mx-0">
                Watch every comparison, swap, and edge relaxation happen step-by-step —
                synchronized pseudocode, adjustable speed, and annotations that explain the why.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 text-xs text-gray-500">
                <span className="bg-gray-800/80 border border-gray-700/50 px-3 py-1 rounded-full">9 data structures</span>
                <span className="bg-gray-800/80 border border-gray-700/50 px-3 py-1 rounded-full">16+ variants</span>
                <span className="bg-gray-800/80 border border-gray-700/50 px-3 py-1 rounded-full">80+ operations</span>
                <span className="bg-gray-800/80 border border-gray-700/50 px-3 py-1 rounded-full">sorting · graphs · dp · greedy</span>
                <span className="bg-gray-800/80 border border-gray-700/50 px-3 py-1 rounded-full">0.25×–3× speed</span>
              </div>
            </div>
          </FadeIn>

          {/* Right: live animation — 62% on desktop, capped so graph stays readable */}
          <FadeIn from="right" delay="delay-300" className="w-full max-w-lg mx-auto lg:flex-1 lg:max-w-[600px] lg:mx-0">
            <HeroAnimation />
          </FadeIn>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-20 py-10 space-y-14">

        {/* Data Structures */}
        <section>
          <FadeIn className="mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-white">Data Structures</h2>
              <div className="flex-1 h-px bg-gray-800" />
              <span className="text-xs text-gray-600">9 structures</span>
            </div>
          </FadeIn>
          <CardGrid cards={DS_CARDS} />
        </section>

        {/* Algorithms */}
        <section>
          <FadeIn className="mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-white">Algorithms</h2>
              <div className="flex-1 h-px bg-gray-800" />
              <span className="text-xs text-gray-600">sorting · searching · graph · dp · greedy</span>
            </div>
          </FadeIn>
          <CardGrid cards={ALGO_CARDS} />
        </section>

      </div>
    </div>
  );
}
