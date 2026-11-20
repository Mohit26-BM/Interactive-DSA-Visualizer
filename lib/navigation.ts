// One list of every visualiser, used by the navigation menu, the footer and the home page counts.
export interface NavItem {
  label: string;
  href: string;
}
export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const GROUPS: NavGroup[] = [
  {
    label: "Data Structures",
    items: [
      { label: "Array", href: "/array" },
      { label: "Singly Linked List", href: "/linked-list/singly" },
      { label: "Doubly Linked List", href: "/linked-list/doubly" },
      { label: "Stack (array)", href: "/stack/array" },
      { label: "Stack (linked list)", href: "/stack/linkedlist" },
      { label: "Queue (simple)", href: "/queue/simple" },
      { label: "Queue (circular)", href: "/queue/circular" },
      { label: "Queue (linked list)", href: "/queue/linkedlist" },
      { label: "Deque", href: "/queue/deque" },
      { label: "Hash Map", href: "/hashmap" },
      { label: "Binary Search Tree", href: "/tree/bst" },
      { label: "AVL Tree", href: "/tree/avl" },
      { label: "Heap", href: "/tree/heap" },
      { label: "Directed Graph", href: "/graph/directed" },
      { label: "Undirected Graph", href: "/graph/undirected" },
      { label: "Trie", href: "/data-structures/trie" },
      { label: "Union-Find", href: "/data-structures/union-find" },
    ],
  },
  {
    label: "Sorting",
    items: [
      { label: "Bubble Sort", href: "/algorithms/sorting/bubble" },
      { label: "Selection Sort", href: "/algorithms/sorting/selection" },
      { label: "Insertion Sort", href: "/algorithms/sorting/insertion" },
      { label: "Merge Sort", href: "/algorithms/sorting/merge" },
      { label: "Quick Sort", href: "/algorithms/sorting/quick" },
      { label: "Heap Sort", href: "/algorithms/sorting/heap" },
      { label: "Counting Sort", href: "/algorithms/sorting/counting" },
      { label: "Radix Sort", href: "/algorithms/sorting/radix" },
    ],
  },
  {
    label: "Searching",
    items: [
      { label: "Linear Search", href: "/algorithms/searching/linear" },
      { label: "Binary Search", href: "/algorithms/searching/binary" },
      { label: "Jump Search", href: "/algorithms/searching/jump" },
    ],
  },
  {
    label: "Graph Algorithms",
    items: [
      { label: "Dijkstra", href: "/algorithms/graph/dijkstra" },
      { label: "Bellman-Ford", href: "/algorithms/graph/bellman-ford" },
      { label: "Floyd-Warshall", href: "/algorithms/graph/floyd-warshall" },
      { label: "Kruskal (MST)", href: "/algorithms/graph/kruskal" },
      { label: "Prim (MST)", href: "/algorithms/graph/prim" },
      { label: "Topological Sort", href: "/algorithms/graph/topological-sort" },
      { label: "Travelling Salesman", href: "/algorithms/graph/tsp" },
    ],
  },
  {
    label: "Dynamic Programming",
    items: [
      { label: "Fibonacci", href: "/dp/fibonacci" },
      { label: "0/1 Knapsack", href: "/dp/knapsack" },
      { label: "Longest Common Subsequence", href: "/dp/lcs" },
      { label: "Longest Increasing Subsequence", href: "/dp/lis" },
      { label: "Edit Distance", href: "/dp/edit-distance" },
      { label: "Coin Change", href: "/dp/coin-change" },
      { label: "Grid Paths", href: "/dp/grid-dp" },
    ],
  },
  {
    label: "Greedy",
    items: [
      { label: "Activity Selection", href: "/greedy/activity-selection" },
      { label: "Fractional Knapsack", href: "/greedy/fractional-knapsack" },
      { label: "Huffman Coding", href: "/greedy/huffman" },
      { label: "Job Sequencing", href: "/greedy/job-sequencing" },
      { label: "Greedy vs DP", href: "/greedy/greedy-vs-dp" },
    ],
  },
];

export const ALL_ITEMS: NavItem[] = GROUPS.flatMap((g) => g.items);
