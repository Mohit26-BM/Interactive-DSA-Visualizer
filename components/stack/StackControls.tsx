"use client";

import { useState } from "react";
import { vRange, hasErrors } from "@/lib/validation";

type StackType = "array" | "linkedlist";

interface StackControlsProps {
  stackType: StackType;
  onTypeChange: (t: StackType) => void;
  onRun: (op: string, params: Record<string, number>) => void;
  hideTypeSelector?: boolean;
}

const ARR_OPS = [
  { value: "push",    label: "Push",    params: ["value"] },
  { value: "pop",     label: "Pop",     params: [] },
  { value: "peek",    label: "Peek",    params: [] },
  { value: "isEmpty", label: "isEmpty", params: [] },
  { value: "isFull",  label: "isFull",  params: [] },
  { value: "clear",   label: "Clear",   params: [] },
];

const LL_OPS = [
  { value: "push",    label: "Push",    params: ["value"] },
  { value: "pop",     label: "Pop",     params: [] },
  { value: "peek",    label: "Peek",    params: [] },
  { value: "isEmpty", label: "isEmpty", params: [] },
  { value: "clear",   label: "Clear",   params: [] },
];

export default function StackControls({ stackType, onTypeChange, onRun, hideTypeSelector }: StackControlsProps) {
  const ops = stackType === "array" ? ARR_OPS : LL_OPS;
  const [op, setOp] = useState(ops[0].value);
  const [params, setParams] = useState<Record<string, string>>({});

  const selected = ops.find((o) => o.value === op) ?? ops[0];

  const handleTypeChange = (t: StackType) => {
    onTypeChange(t);
    const newOps = t === "array" ? ARR_OPS : LL_OPS;
    const exists = newOps.find((o) => o.value === op);
    if (!exists) setOp(newOps[0].value);
    setParams({});
  };

  const getErrors = () => {
    const e: Record<string, string | undefined> = {};
    if (selected.params.includes("value")) {
      const r = vRange(params.value ?? "", "Value");
      if (!r.ok) e.value = r.msg;
    }
    return e;
  };

  const errors = getErrors();
  const disabled = selected.params.length > 0 && hasErrors(errors);

  const handleRun = () => {
    if (disabled) return;
    const parsed: Record<string, number> = {};
    for (const p of selected.params) {
      parsed[p] = parseInt(params[p] ?? "0", 10);
    }
    onRun(op, parsed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleRun();
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-4">
      {!hideTypeSelector && (
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Implementation</label>
          <div className="flex gap-2">
            {([["array", "Array Stack"], ["linkedlist", "Linked List Stack"]] as [StackType, string][]).map(([t, label]) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeChange(t)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  stackType === t ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Operation</label>
        <div className="flex flex-wrap gap-2">
          {ops.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => { setOp(o.value); setParams({}); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                op === o.value ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {selected.params.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {selected.params.map((p) => (
            <div key={p} className="flex flex-col gap-1">
              <label htmlFor={`stack-${op}-${p}`} className="text-xs text-gray-400 capitalize">{p}</label>
              <input
                id={`stack-${op}-${p}`}
                type="number"
                value={params[p] ?? ""}
                onChange={(e) => setParams((prev) => ({ ...prev, [p]: e.target.value }))}
                onKeyDown={handleKeyDown}
                placeholder="-9999–9999"
                className={`w-28 px-3 py-1.5 bg-gray-800 border rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none ${
                  errors[p] ? "border-red-500 focus:border-red-400" : "border-gray-700 focus:border-indigo-500"
                }`}
              />
              {errors[p] && <p className="text-xs text-red-400">{errors[p]}</p>}
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={handleRun}
        disabled={disabled}
        className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
          disabled ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500 text-white"
        }`}
      >
        Run {selected.label}
      </button>
    </div>
  );
}
