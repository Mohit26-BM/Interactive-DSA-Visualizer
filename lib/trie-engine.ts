import type { Step } from "./types";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TrieNodeData {
  id: string;
  char: string;
  isEnd: boolean;
  depth: number;
  parentId: string | null;
}

export interface TrieStep extends Step {
  nodes: Record<string, TrieNodeData>;
  childrenMap: Record<string, Record<string, string>>; // nodeId -> char -> childId
  highlightPath: string[];
  word: string;
  found?: boolean;
  operation: "insert" | "search" | "startsWith" | "init";
}

// ── Internal node ─────────────────────────────────────────────────────────────

interface InternalNode {
  id: string;
  char: string;
  isEnd: boolean;
  children: Map<string, InternalNode>;
  depth: number;
  parentId: string | null;
}

let nodeIdCounter = 0;
const nextId = () => `tn-${nodeIdCounter++}`;

function makeNode(char: string, depth: number, parentId: string | null): InternalNode {
  return { id: nextId(), char, isEnd: false, children: new Map(), depth, parentId };
}

function serialize(root: InternalNode): { nodes: Record<string, TrieNodeData>; childrenMap: Record<string, Record<string, string>> } {
  const nodes: Record<string, TrieNodeData> = {};
  const childrenMap: Record<string, Record<string, string>> = {};

  const dfs = (n: InternalNode) => {
    nodes[n.id] = { id: n.id, char: n.char, isEnd: n.isEnd, depth: n.depth, parentId: n.parentId };
    childrenMap[n.id] = {};
    for (const [ch, child] of n.children) {
      childrenMap[n.id][ch] = child.id;
      dfs(child);
    }
  };
  dfs(root);
  return { nodes, childrenMap };
}

function snap(root: InternalNode, word: string, op: TrieStep["operation"], hl: number, expl: string, highlightPath: string[] = [], found?: boolean, phase?: string): TrieStep {
  const { nodes, childrenMap } = serialize(root);
  return { nodes, childrenMap, highlightPath, word, found, operation: op, highlightLine: hl, explanation: expl, phase };
}

// ── Operations ────────────────────────────────────────────────────────────────

export function buildTrieFromWords(words: string[]): { steps: TrieStep[]; root: InternalNode } {
  nodeIdCounter = 0;
  const root = makeNode("", 0, null);
  const steps: TrieStep[] = [];

  steps.push(snap(root, "", "init", 0, `Initialize empty trie. Root node is a virtual empty node.`));

  for (const word of words) {
    steps.push(snap(root, word, "insert", 0, `Insert "${word}": follow/create path for each character.`));

    let cur = root;
    const path: string[] = [root.id];
    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      if (!cur.children.has(ch)) {
        const newNode = makeNode(ch, cur.depth + 1, cur.id);
        cur.children.set(ch, newNode);
        steps.push(snap(root, word, "insert", 2, `'${ch}' not found at depth ${cur.depth + 1} — create new node.`, [...path, newNode.id], undefined, "insert"));
      } else {
        steps.push(snap(root, word, "insert", 1, `'${ch}' exists at depth ${cur.depth + 1} — follow existing node.`, [...path, cur.children.get(ch)!.id]));
      }
      cur = cur.children.get(ch)!;
      path.push(cur.id);
    }
    cur.isEnd = true;
    steps.push(snap(root, word, "insert", 3, `Mark node '${word[word.length - 1]}' as end of word "${word}".`, path, undefined, "found"));
  }

  return { steps, root };
}

export function trieSearch(root: InternalNode, word: string): TrieStep[] {
  const steps: TrieStep[] = [];

  steps.push(snap(root, word, "search", 5, `Search "${word}": follow path one character at a time.`));

  let cur: InternalNode = root;
  const path: string[] = [root.id];
  for (let i = 0; i < word.length; i++) {
    const ch = word[i];
    const child: InternalNode | undefined = cur.children.get(ch);
    if (!child) {
      steps.push(snap(root, word, "search", 6, `'${ch}' not found at depth ${cur.depth + 1}. "${word}" is NOT in the trie.`, path, false, "error"));
      return steps;
    }
    path.push(child.id);
    cur = child;
    steps.push(snap(root, word, "search", 6, `Found '${ch}' at depth ${cur.depth}. Continue.`, [...path]));
  }

  const found = cur.isEnd;
  steps.push(snap(root, word, "search", 7, found
    ? `Reached end of "${word}" and node is marked as end → FOUND!`
    : `Reached end of "${word}" but node is NOT marked as end → "${word}" is a prefix but not a word.`,
    path, found, found ? "found" : "error"));
  return steps;
}

export function trieStartsWith(root: InternalNode, prefix: string): TrieStep[] {
  const steps: TrieStep[] = [];

  steps.push(snap(root, prefix, "startsWith", 9, `startsWith("${prefix}"): check if any word starts with this prefix.`));

  let cur: InternalNode = root;
  const path: string[] = [root.id];
  for (let i = 0; i < prefix.length; i++) {
    const ch = prefix[i];
    const child: InternalNode | undefined = cur.children.get(ch);
    if (!child) {
      steps.push(snap(root, prefix, "startsWith", 10, `'${ch}' not found. No word starts with "${prefix}".`, path, false, "error"));
      return steps;
    }
    path.push(child.id);
    cur = child;
    steps.push(snap(root, prefix, "startsWith", 10, `Found '${ch}' at depth ${cur.depth}. Continue.`, [...path]));
  }

  steps.push(snap(root, prefix, "startsWith", 11, `Full prefix "${prefix}" exists in the trie → at least one word starts with "${prefix}".`, path, true, "found"));
  return steps;
}

// ── Pseudocode ────────────────────────────────────────────────────────────────

export const TRIE_CODE = [
  "// Trie: each node = one character",
  "function insert(word):",
  "  if char not in node.children: create node;",
  "  else: follow existing node;",
  "  mark last node as isEnd = true;",
  "",
  "function search(word):",
  "  for each char: follow path, return false if missing;",
  "  return node.isEnd;  // must be end of word",
  "",
  "function startsWith(prefix):",
  "  for each char: follow path, return false if missing;",
  "  return true;  // prefix exists",
];

export const TRIE_ANNOTATIONS: Record<number, string> = {
  0: "Each path from root to leaf encodes a word. Shared prefixes share nodes.",
  1: "insert: O(m) where m = word length. At most m nodes created.",
  5: "search: O(m) — follow exact characters, then check isEnd flag.",
  8: "startsWith: O(m) — same as search but doesn't require isEnd.",
  12: "Space: O(ALPHABET_SIZE × n × m) worst case. Compressed tries (radix tries) save space.",
};

export const TRIE_COMPLEXITY = {
  time:  "O(m) per op",
  space: "O(n·m·Σ)",
  note:  "m = word length, n = number of words, Σ = alphabet size. Insert/search/startsWith all O(m). Used in autocomplete, spell-check, IP routing (Patricia tries).",
};

export const DEFAULT_TRIE_WORDS = ["apple", "app", "apply", "apt", "bat", "ball", "band"];
