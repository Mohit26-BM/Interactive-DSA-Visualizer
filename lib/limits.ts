// Input limits for every engine. The pages already cap what you can type; these guards make the engines safe on their
// own too: steps are snapshots, so memory grows with the square of the input in many algorithms (a 150 x 150 edit
// distance needs gigabytes). A clear InputError is thrown instead of freezing or crashing the tab.

export class InputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InputError";
  }
}

export const MAX = {
  sort: 40,
  radix: 20,
  search: 80,
  dpArray: 20,
  dpString: 14,
  knapsackItems: 12,
  knapsackCapacity: 40,
  coins: 8,
  coinTarget: 80,
  fib: 35,
  gridSide: 8,
  tree: 40,
  heap: 40,
  list: 30,
  activities: 20,
  symbols: 12,
  jobs: 12,
  trieWords: 20,
  trieWordLength: 12,
  unionFindNodes: 16,
  unionFindOps: 30,
} as const;

export function needCount(a: { length: number }, max: number, label: string, min = 0): void {
  if (a.length < min) throw new InputError(`${label}: enter at least ${min} item${min === 1 ? "" : "s"}.`);
  if (a.length > max) throw new InputError(`${label}: at most ${max} items are supported (you gave ${a.length}).`);
}

export function needNumbers(a: unknown[], label: string, max: number): void {
  needCount(a, max, label);
  if (a.some((v) => typeof v !== "number" || !Number.isFinite(v))) throw new InputError(`${label}: every value must be a number.`);
}

export function needIntegers(a: unknown[], label: string, max: number): void {
  needNumbers(a, label, max);
  if ((a as number[]).some((v) => !Number.isInteger(v))) throw new InputError(`${label}: every value must be a whole number.`);
}

export function needRange(n: number, min: number, max: number, label: string): void {
  if (!Number.isInteger(n) || n < min || n > max) throw new InputError(`${label} must be a whole number from ${min} to ${max}.`);
}

export function needText(s: string, max: number, label: string): void {
  if (typeof s !== "string") throw new InputError(`${label} must be text.`);
  if (s.length > max) throw new InputError(`${label}: at most ${max} characters are supported (you gave ${s.length}).`);
}

export function needNonNegative(a: number[], label: string): void {
  if (a.some((v) => v < 0)) throw new InputError(`${label}: this algorithm works on non-negative whole numbers only. Remove the negative values.`);
}
