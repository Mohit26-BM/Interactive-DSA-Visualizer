// Parsing of the "type some numbers" boxes. It never drops anything silently: if an entry is not valid, the error
// names it, so "5, abc, 3" is rejected instead of quietly becoming [5, 3].

export interface ListResult {
  values: number[];
  error: string | null;
}

export interface ListOptions {
  integersOnly?: boolean;
  allowNegative?: boolean;
  min?: number; // smallest allowed list length
  max?: number; // largest allowed list length
  positiveOnly?: boolean; // every value must be > 0
  noun?: string; // "number", "coin"
}

export function parseNumberList(text: string, opts: ListOptions = {}): ListResult {
  const { integersOnly = false, allowNegative = true, min = 0, max = Infinity, positiveOnly = false, noun = "number" } = opts;
  const tokens = String(text ?? "").split(/[,\s]+/).filter((t) => t.length > 0);
  const values: number[] = [];
  for (const t of tokens) {
    if (!/^-?\d+(\.\d+)?$/.test(t)) return { values: [], error: `"${t}" is not a valid ${noun}. Use ${integersOnly ? "whole numbers" : "numbers"} separated by commas.` };
    const n = Number(t);
    if (integersOnly && !Number.isInteger(n)) return { values: [], error: `"${t}" is not a whole number.` };
    if (positiveOnly && n <= 0) return { values: [], error: `"${t}" must be greater than 0.` };
    if (!allowNegative && n < 0) return { values: [], error: `This algorithm works on non-negative whole numbers only. Remove "${t}".` };
    if (Math.abs(n) > 1e9) return { values: [], error: `"${t}" is too large.` };
    values.push(n);
  }
  if (values.length < min) return { values: [], error: `Enter at least ${min} ${noun}${min === 1 ? "" : "s"}.` };
  if (values.length > max) return { values: [], error: `At most ${max} ${noun}s are supported (you entered ${values.length}).` };
  return { values, error: null };
}
