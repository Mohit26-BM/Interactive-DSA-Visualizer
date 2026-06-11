export interface VResult { ok: boolean; msg?: string; }

export function vInteger(raw: string, label = "Value"): VResult {
  if (raw.trim() === "") return { ok: false, msg: `${label} is required` };
  if (!/^-?\d+$/.test(raw.trim())) return { ok: false, msg: `${label} must be a whole number` };
  return { ok: true };
}

export function vRange(raw: string, label = "Value", min = -9999, max = 9999): VResult {
  const base = vInteger(raw, label);
  if (!base.ok) return base;
  const n = parseInt(raw, 10);
  if (n < min || n > max) return { ok: false, msg: `${label} must be ${min}–${max}` };
  return { ok: true };
}

export function vIndex(raw: string, length: number, label = "Index", insertMode = false): VResult {
  if (length === 0 && !insertMode) return { ok: false, msg: "Structure is empty" };
  const max = insertMode ? length : length - 1;
  if (raw.trim() === "") return { ok: false, msg: `${label} is required` };
  if (!/^\d+$/.test(raw.trim())) return { ok: false, msg: `${label} must be ≥ 0` };
  const n = parseInt(raw, 10);
  if (n < 0 || n > max) return { ok: false, msg: `${label} must be 0–${max}` };
  return { ok: true };
}

export function vLabel(raw: string, label = "Label"): VResult {
  if (raw.trim() === "") return { ok: false, msg: `${label} is required` };
  if (raw.trim().length > 3) return { ok: false, msg: `${label} max 3 chars` };
  if (!/^[A-Za-z0-9]+$/.test(raw.trim())) return { ok: false, msg: `${label}: letters/digits only` };
  return { ok: true };
}

export function vKey(raw: string): VResult {
  if (raw.trim() === "") return { ok: false, msg: "Key is required" };
  if (raw.trim().length > 20) return { ok: false, msg: "Key max 20 chars" };
  return { ok: true };
}

export function hasErrors(errs: Record<string, string | undefined>): boolean {
  return Object.values(errs).some(Boolean);
}
