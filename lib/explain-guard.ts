// Input validation and rate limiting for the optional AI-explanation route.
// Pure functions (no Next.js imports) so they can be checked from a plain script.

export const LIMITS = { topic: 80, explanation: 1200, context: 1500, steps: 10_000 } as const;

export interface ExplainInput {
  algorithm: string;
  stepExplanation: string;
  stepIndex: number;
  totalSteps: number;
  additionalContext?: string;
}

export type ParseResult = { ok: true; value: ExplainInput } | { ok: false; error: string };

function cleanText(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  // replace control characters (keep newline) so they cannot disturb the prompt layout
  const t = v.replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, " ").trim();
  if (t.length === 0 || t.length > max) return null;
  return t;
}

export function parseExplainRequest(body: unknown): ParseResult {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: "Body must be a JSON object" };
  }
  const b = body as Record<string, unknown>;
  const algorithm = cleanText(b.algorithm, LIMITS.topic);
  if (!algorithm) return { ok: false, error: "algorithm is required (max 80 characters)" };
  const stepExplanation = cleanText(b.stepExplanation, LIMITS.explanation);
  if (!stepExplanation) return { ok: false, error: "stepExplanation is required (max 1200 characters)" };

  const { stepIndex, totalSteps } = b;
  if (!Number.isInteger(stepIndex) || !Number.isInteger(totalSteps)) {
    return { ok: false, error: "stepIndex and totalSteps must be integers" };
  }
  const si = stepIndex as number;
  const ts = totalSteps as number;
  if (ts < 1 || ts > LIMITS.steps || si < 0 || si >= ts) {
    return { ok: false, error: "stepIndex must be within 0..totalSteps-1" };
  }

  let additionalContext: string | undefined;
  if (b.additionalContext !== undefined && b.additionalContext !== null && b.additionalContext !== "") {
    const c = cleanText(b.additionalContext, LIMITS.context);
    if (!c) return { ok: false, error: "additionalContext is too long or not text" };
    additionalContext = c;
  }
  return { ok: true, value: { algorithm, stepExplanation, stepIndex: si, totalSteps: ts, additionalContext } };
}

/** Fixed-window counter per key. Memory is bounded: old windows are swept. */
export class RateLimiter {
  private hits = new Map<string, { start: number; count: number }>();
  constructor(
    private max: number,
    private windowMs: number,
    private maxKeys = 5000,
  ) {}

  /** Returns 0 when allowed, otherwise the seconds to wait. */
  check(key: string, now = Date.now()): number {
    if (this.hits.size >= this.maxKeys) {
      for (const [k, v] of this.hits) if (now - v.start >= this.windowMs) this.hits.delete(k);
      if (this.hits.size >= this.maxKeys) this.hits.clear();
    }
    const cur = this.hits.get(key);
    if (!cur || now - cur.start >= this.windowMs) {
      this.hits.set(key, { start: now, count: 1 });
      return 0;
    }
    if (cur.count >= this.max) return Math.max(1, Math.ceil((cur.start + this.windowMs - now) / 1000));
    cur.count += 1;
    return 0;
  }
}

/**
 * Client address from X-Forwarded-For, trusting only `hops` proxies in front of the app
 * (0 = ignore the header entirely, as when the server is exposed directly).
 */
export function clientKey(forwardedFor: string | null, hops: number): string {
  if (hops <= 0 || !forwardedFor) return "direct";
  const parts = forwardedFor
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return "direct";
  const idx = Math.max(0, parts.length - hops);
  return parts[idx].slice(0, 64);
}
