import { Step } from "./types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HashEntry { key: string; value: number; }
export interface HashBucket { entries: HashEntry[]; }
export interface HashMapState { buckets: HashBucket[]; size: number; count: number; }
export interface HashMapStep extends Step {
  state: HashMapState;
  highlightBuckets: number[];
  highlightKeys: string[];
  hashResult?: number;
}

// ─── ID counter ───────────────────────────────────────────────────────────────

let idCounter = 0;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _newId = () => `hm-${idCounter++}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function djb2(key: string, size: number): number {
  let hash = 5381;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) + hash) + key.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % size;
}

function cloneHashMap(s: HashMapState): HashMapState {
  return {
    buckets: s.buckets.map((b) => ({ entries: b.entries.map((e) => ({ ...e })) })),
    size: s.size,
    count: s.count,
  };
}

function st(
  s: HashMapState,
  explanation: string,
  hl: number,
  hb: number[] = [],
  hk: string[] = [],
  phase?: string,
  hashResult?: number
): HashMapStep {
  return {
    state: cloneHashMap(s),
    explanation,
    highlightLine: hl,
    highlightBuckets: hb,
    highlightKeys: hk,
    phase,
    hashResult,
  };
}

// ─── Default HashMap ──────────────────────────────────────────────────────────

export function buildDefaultHashMap(): HashMapState {
  const state: HashMapState = {
    buckets: Array.from({ length: 8 }, () => ({ entries: [] })),
    size: 8,
    count: 0,
  };
  const entries: [string, number][] = [
    ["name", 42], ["age", 25], ["city", 7], ["score", 100], ["level", 3],
  ];
  for (const [key, value] of entries) {
    const idx = djb2(key, state.size);
    const existing = state.buckets[idx].entries.findIndex((e) => e.key === key);
    if (existing >= 0) {
      state.buckets[idx].entries[existing].value = value;
    } else {
      state.buckets[idx].entries.push({ key, value });
      state.count++;
    }
  }
  return state;
}

// ─── Operations ───────────────────────────────────────────────────────────────

export function hmSet(state: HashMapState, key: string, value: number): HashMapStep[] {
  const steps: HashMapStep[] = [];
  const s = cloneHashMap(state);

  steps.push(st(s, `set("${key}", ${value}): Compute djb2 hash for key "${key}".`, 1));

  const idx = djb2(key, s.size);
  steps.push(st(s, `djb2("${key}") = ${idx} → bucket index ${idx}.`, 2, [idx], [], "default", idx));

  const bucket = s.buckets[idx];
  steps.push(st(s, `Access bucket[${idx}]. It has ${bucket.entries.length} entr${bucket.entries.length === 1 ? "y" : "ies"}.`, 3, [idx], [], "default", idx));

  // Walk the chain
  for (let i = 0; i < bucket.entries.length; i++) {
    const entry = bucket.entries[i];
    steps.push(st(s, `Walk chain: check entry[${i}] key="${entry.key}" — ${entry.key === key ? "match found!" : `not "${key}", continue.`}`, 4, [idx], [entry.key], "default", idx));
    if (entry.key === key) {
      const old = entry.value;
      bucket.entries[i].value = value;
      steps.push(st(s, `Key "${key}" already exists. Update value from ${old} to ${value}.`, 5, [idx], [key], "insert", idx));
      steps.push(st(s, `set("${key}", ${value}) complete. Updated existing entry.`, 6, [idx], [key], "insert", idx));
      // Apply mutation to original state
      state.buckets[idx].entries[i].value = value;
      return steps;
    }
  }

  // Not found — insert
  bucket.entries.push({ key, value });
  s.count++;
  steps.push(st(s, `Key "${key}" not found in bucket[${idx}]. Append new entry {${key}: ${value}}.`, 5, [idx], [key], "insert", idx));
  steps.push(st(s, `set("${key}", ${value}) complete. Load factor: ${s.count}/${s.size} = ${(s.count / s.size).toFixed(2)}.`, 6, [idx], [key], "insert", idx));

  // Apply mutation to original state
  state.buckets[idx].entries.push({ key, value });
  state.count++;

  return steps;
}

export function hmGet(state: HashMapState, key: string): HashMapStep[] {
  const steps: HashMapStep[] = [];
  const s = cloneHashMap(state);

  steps.push(st(s, `get("${key}"): Compute djb2 hash.`, 1));

  const idx = djb2(key, s.size);
  steps.push(st(s, `djb2("${key}") = ${idx} → bucket[${idx}].`, 2, [idx], [], "default", idx));

  const bucket = s.buckets[idx];
  steps.push(st(s, `Access bucket[${idx}]. ${bucket.entries.length} entr${bucket.entries.length === 1 ? "y" : "ies"} in chain.`, 3, [idx], [], "default", idx));

  for (let i = 0; i < bucket.entries.length; i++) {
    const entry = bucket.entries[i];
    steps.push(st(s, `Check entry[${i}]: key="${entry.key}" — ${entry.key === key ? "match!" : `not "${key}".`}`, 4, [idx], [entry.key], "default", idx));
    if (entry.key === key) {
      steps.push(st(s, `Found! get("${key}") = ${entry.value}. O(1) average case.`, 5, [idx], [key], "found", idx));
      return steps;
    }
  }

  steps.push(st(s, `Key "${key}" not found in bucket[${idx}]. Return undefined.`, 5, [idx], [], "error", idx));
  return steps;
}

export function hmDelete(state: HashMapState, key: string): HashMapStep[] {
  const steps: HashMapStep[] = [];
  const s = cloneHashMap(state);

  steps.push(st(s, `delete("${key}"): Compute djb2 hash.`, 1));

  const idx = djb2(key, s.size);
  steps.push(st(s, `djb2("${key}") = ${idx} → bucket[${idx}].`, 2, [idx], [], "default", idx));

  const bucket = s.buckets[idx];
  steps.push(st(s, `Access bucket[${idx}]. ${bucket.entries.length} entr${bucket.entries.length === 1 ? "y" : "ies"} in chain.`, 3, [idx], [], "default", idx));

  for (let i = 0; i < bucket.entries.length; i++) {
    const entry = bucket.entries[i];
    steps.push(st(s, `Check entry[${i}]: key="${entry.key}" — ${entry.key === key ? "match, delete!" : `not "${key}".`}`, 4, [idx], [entry.key], "default", idx));
    if (entry.key === key) {
      bucket.entries.splice(i, 1);
      s.count--;
      steps.push(st(s, `Deleted entry "${key}" from bucket[${idx}]. Chain length: ${bucket.entries.length}.`, 5, [idx], [], "delete", idx));
      steps.push(st(s, `delete("${key}") complete. Map size: ${s.count}.`, 6, [], [], "delete"));

      // Apply to original state
      state.buckets[idx].entries.splice(i, 1);
      state.count--;
      return steps;
    }
  }

  steps.push(st(s, `Key "${key}" not found. Nothing to delete.`, 5, [idx], [], "error", idx));
  return steps;
}

export function hmHas(state: HashMapState, key: string): HashMapStep[] {
  const steps: HashMapStep[] = [];
  const s = cloneHashMap(state);

  steps.push(st(s, `has("${key}"): Compute djb2 hash.`, 1));

  const idx = djb2(key, s.size);
  steps.push(st(s, `djb2("${key}") = ${idx} → bucket[${idx}].`, 2, [idx], [], "default", idx));

  const bucket = s.buckets[idx];
  for (let i = 0; i < bucket.entries.length; i++) {
    const entry = bucket.entries[i];
    steps.push(st(s, `Check entry[${i}]: key="${entry.key}".`, 3, [idx], [entry.key], "default", idx));
    if (entry.key === key) {
      steps.push(st(s, `has("${key}") = true. Found in bucket[${idx}] at position ${i}.`, 4, [idx], [key], "found", idx));
      return steps;
    }
  }

  steps.push(st(s, `has("${key}") = false. Key not in map.`, 4, [idx], [], "error", idx));
  return steps;
}

export function hmKeys(state: HashMapState): HashMapStep[] {
  const steps: HashMapStep[] = [];
  const s = cloneHashMap(state);
  const keys: string[] = [];

  steps.push(st(s, `keys(): Iterate all ${s.size} buckets to collect keys.`, 1));

  for (let i = 0; i < s.size; i++) {
    const bucket = s.buckets[i];
    if (bucket.entries.length === 0) {
      steps.push(st(s, `Bucket[${i}]: empty, skip.`, 2, [i], [], "default"));
    } else {
      for (const entry of bucket.entries) {
        keys.push(entry.key);
        steps.push(st(s, `Bucket[${i}]: found key "${entry.key}". Keys so far: [${keys.join(", ")}].`, 3, [i], [entry.key], "found"));
      }
    }
  }

  steps.push(st(s, `keys() complete. All keys: [${keys.join(", ")}]. Total: ${keys.length}.`, 4, [], keys, "found"));
  return steps;
}

export function hmResize(state: HashMapState): HashMapStep[] {
  const steps: HashMapStep[] = [];
  const s = cloneHashMap(state);

  const oldSize = s.size;
  const newSize = oldSize * 2;

  steps.push(st(s, `resize(): Current size=${oldSize}, load factor=${(s.count / oldSize).toFixed(2)}. Double to ${newSize} buckets.`, 1));

  // Collect all existing entries
  const allEntries: HashEntry[] = [];
  for (const bucket of s.buckets) {
    for (const entry of bucket.entries) {
      allEntries.push({ ...entry });
    }
  }

  steps.push(st(s, `Collect all ${allEntries.length} entries before resize: [${allEntries.map((e) => e.key).join(", ")}].`, 2));

  // Create new buckets
  s.buckets = Array.from({ length: newSize }, () => ({ entries: [] }));
  s.size = newSize;

  steps.push(st(s, `Created ${newSize} empty buckets. Now rehash each entry.`, 3, Array.from({ length: newSize }, (_, i) => i)));

  for (const entry of allEntries) {
    const newIdx = djb2(entry.key, newSize);
    s.buckets[newIdx].entries.push({ ...entry });
    steps.push(st(s, `Rehash "${entry.key}": djb2("${entry.key}") mod ${newSize} = ${newIdx} → bucket[${newIdx}].`, 4, [newIdx], [entry.key], "insert", newIdx));
  }

  steps.push(st(s, `resize() complete. ${oldSize} → ${newSize} buckets. New load factor: ${(s.count / newSize).toFixed(2)}.`, 5, [], [], "insert"));

  // Apply to original state
  state.buckets = s.buckets.map((b) => ({ entries: b.entries.map((e) => ({ ...e })) }));
  state.size = newSize;

  return steps;
}

// ─── Pseudocode ───────────────────────────────────────────────────────────────

export const HASHMAP_CODE: Record<string, string[]> = {
  set: [
    "function set(key, value) {",
    "  const idx = djb2(key) % size;",
    "  const bucket = buckets[idx];",
    "  for each entry in bucket:",
    "    if entry.key === key: entry.value = value; return;",
    "  bucket.push({ key, value }); // append",
    "  count++;",
    "}",
  ],
  get: [
    "function get(key) {",
    "  const idx = djb2(key) % size;",
    "  const bucket = buckets[idx];",
    "  for each entry in bucket:",
    "    if entry.key === key: return entry.value;",
    "  return undefined; // not found",
    "}",
  ],
  delete: [
    "function delete(key) {",
    "  const idx = djb2(key) % size;",
    "  const bucket = buckets[idx];",
    "  for (let i = 0; i < bucket.length; i++)",
    "    if bucket[i].key === key:",
    "      bucket.splice(i, 1); count--;",
    "  // not found",
    "}",
  ],
  has: [
    "function has(key) {",
    "  const idx = djb2(key) % size;",
    "  const bucket = buckets[idx];",
    "  for each entry in bucket:",
    "    if entry.key === key: return true;",
    "  return false;",
    "}",
  ],
  keys: [
    "function keys() {",
    "  for (let i = 0; i < size; i++)",
    "    for each entry in buckets[i]",
    "      result.push(entry.key);",
    "  return result;",
    "}",
  ],
  resize: [
    "function resize() {",
    "  const entries = collectAll();",
    "  buckets = new Array(size * 2);",
    "  for each entry:",
    "    const idx = djb2(entry.key) % newSize;",
    "    buckets[idx].push(entry); // rehash",
    "}",
  ],
};

export const HASHMAP_ANNOTATIONS: Record<string, Record<number, string>> = {
  set: {
    2: "djb2 hash: multiply-and-add with prime 33. Distributes keys uniformly. Mod size maps to bucket index.",
    4: "Walk the chain (linked list) for collision resolution — O(1) average when load factor is low.",
    5: "Update: overwrite existing value. This makes HashMap behave like a dictionary (no duplicate keys).",
    6: "Append to chain: O(1) amortized. If chain grows too long (high load factor), resize is triggered.",
  },
  get: {
    2: "Same hash function as set — guarantees we always land on the same bucket for a given key.",
    4: "Chain walk: O(1) average (short chains), O(n) worst case (all keys hash to same bucket).",
    5: "Return undefined (or -1) as sentinel for 'not found'. No exception thrown.",
  },
  delete: {
    2: "Hash the key to find the bucket — O(1). Then scan the chain — O(chain length).",
    4: "Linear scan of chain needed since chain is unsorted. splice() removes and shifts remaining entries.",
  },
  has: {
    2: "has() is get() without returning the value — same O(1) average complexity.",
    4: "Early return on first match — avoids scanning rest of chain.",
  },
  keys: {
    2: "Iterate ALL buckets — O(n + k) where n = entries, k = bucket count.",
    3: "Each entry visited exactly once. Order is bucket-index order, not insertion order.",
  },
  resize: {
    2: "Collect all existing entries before rebuilding buckets. O(n) time.",
    3: "Double the bucket count. New load factor ≈ old_count / (2 * old_size). Halves collision probability.",
    4: "Rehash every entry — each key gets a NEW bucket index because (hash % newSize) ≠ (hash % oldSize).",
    6: "resize() is O(n) but amortized O(1) per insertion when triggered at load factor > 0.75.",
  },
};

export const HASHMAP_COMPLEXITY: Record<string, { time: string; space: string; note: string }> = {
  set:    { time: "O(1) avg", space: "O(1)", note: "O(n) worst case when all keys hash to same bucket (degenerate)." },
  get:    { time: "O(1) avg", space: "O(1)", note: "O(n) worst case. Kept near O(1) by maintaining low load factor." },
  delete: { time: "O(1) avg", space: "O(1)", note: "Same hash+walk pattern as get. Chain shortens by 1 after delete." },
  has:    { time: "O(1) avg", space: "O(1)", note: "Identical to get but returns boolean. No value allocation." },
  keys:   { time: "O(n+k)",  space: "O(n)", note: "Must visit every bucket (k) and every entry (n) — O(n+k) total." },
  resize: { time: "O(n)",    space: "O(k)", note: "Rehash all n entries into 2k buckets. Amortized O(1) per insert." },
};
