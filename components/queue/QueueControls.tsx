"use client";

import { useState } from "react";
import { QueueType } from "@/lib/queue-engine";
import { vRange } from "@/lib/validation";

interface QueueControlsProps {
  queueType: QueueType;
  onTypeChange: (t: QueueType) => void;
  onRun: (op: string, params: Record<string, number>) => void;
  hideTypeSelector?: boolean;
}

const OPS_BY_TYPE: Record<QueueType, { value: string; label: string; params: string[] }[]> = {
  simple: [
    { value: "enqueue", label: "Enqueue", params: ["value"] },
    { value: "dequeue", label: "Dequeue", params: [] },
    { value: "front",   label: "Front",   params: [] },
    { value: "isEmpty", label: "isEmpty", params: [] },
    { value: "isFull",  label: "isFull",  params: [] },
  ],
  circular: [
    { value: "enqueue", label: "Enqueue", params: ["value"] },
    { value: "dequeue", label: "Dequeue", params: [] },
    { value: "front",   label: "Front",   params: [] },
    { value: "rear",    label: "Rear",    params: [] },
    { value: "isEmpty", label: "isEmpty", params: [] },
    { value: "isFull",  label: "isFull",  params: [] },
  ],
  linkedlist: [
    { value: "enqueue", label: "Enqueue", params: ["value"] },
    { value: "dequeue", label: "Dequeue", params: [] },
    { value: "front",   label: "Front",   params: [] },
    { value: "rear",    label: "Rear",    params: [] },
    { value: "isEmpty", label: "isEmpty", params: [] },
  ],
  deque: [
    { value: "addFront",    label: "Add Front",    params: ["value"] },
    { value: "addRear",     label: "Add Rear",     params: ["value"] },
    { value: "removeFront", label: "Remove Front", params: [] },
    { value: "removeRear",  label: "Remove Rear",  params: [] },
    { value: "peekFront",   label: "Peek Front",   params: [] },
    { value: "peekRear",    label: "Peek Rear",    params: [] },
    { value: "isEmpty",     label: "isEmpty",      params: [] },
  ],
};

const TYPE_LABELS: Record<QueueType, string> = {
  simple:     "Simple Queue",
  circular:   "Circular Queue",
  linkedlist: "LL Queue",
  deque:      "Deque",
};

export default function QueueControls({ queueType, onTypeChange, onRun, hideTypeSelector }: QueueControlsProps) {
  const ops = OPS_BY_TYPE[queueType];
  const [op, setOp] = useState(ops[0].value);
  const [params, setParams] = useState<Record<string, string>>({});

  const handleTypeChange = (t: QueueType) => {
    onTypeChange(t);
    const newOps = OPS_BY_TYPE[t];
    const exists = newOps.find((o) => o.value === op);
    if (!exists) setOp(newOps[0].value);
    setParams({});
  };

  const selected = ops.find((o) => o.value === op) ?? ops[0];

  const getErrors = () => {
    const e: Record<string, string | undefined> = {};
    if (selected.params.includes("value")) {
      const r = vRange(params.value ?? "", "Value");
      if (!r.ok) e.value = r.msg;
    }
    return e;
  };

  const errors = getErrors();
  const disabled = selected.params.length > 0 && Object.values(errors).some(Boolean);

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
          <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Queue Type</label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(OPS_BY_TYPE) as QueueType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeChange(t)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  queueType === t ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
                }`}
              >
                {TYPE_LABELS[t]}
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
              <label htmlFor={`queue-${op}-${p}`} className="text-xs text-gray-400 capitalize">{p}</label>
              <input
                id={`queue-${op}-${p}`}
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
