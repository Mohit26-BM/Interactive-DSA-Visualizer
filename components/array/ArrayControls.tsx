"use client";

import { useState } from "react";
import { vRange, vIndex, hasErrors } from "@/lib/validation";

interface ArrayControlsProps {
  onRun: (op: string, params: Record<string, number>) => void;
  arrayLength: number;
}

const operations = [
  { value: "insert",       label: "Insert",         params: ["value", "index"] },
  { value: "delete",       label: "Delete",         params: ["index"] },
  { value: "search",       label: "Search",         params: ["value"] },
  { value: "update",       label: "Update",         params: ["index", "value"] },
  { value: "bubbleSort",   label: "Bubble Sort",    params: [] },
  { value: "selectionSort",label: "Selection Sort", params: [] },
  { value: "insertionSort",label: "Insertion Sort", params: [] },
];

export default function ArrayControls({ onRun, arrayLength }: ArrayControlsProps) {
  const [op, setOp] = useState("insert");
  const [params, setParams] = useState<Record<string, string>>({});

  const selected = operations.find((o) => o.value === op)!;

  const getErrors = () => {
    const e: Record<string, string | undefined> = {};
    if (selected.params.includes("value")) {
      const r = vRange(params.value ?? "", "Value");
      if (!r.ok) e.value = r.msg;
    }
    if (selected.params.includes("index")) {
      const insertMode = op === "insert";
      const r = vIndex(params.index ?? "", arrayLength, "Index", insertMode);
      if (!r.ok) e.index = r.msg;
    }
    return e;
  };

  const errors = getErrors();
  const disabled = hasErrors(errors);

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
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Operation</label>
        <div className="flex flex-wrap gap-2">
          {operations.map((o) => (
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
              <label htmlFor={`array-${p}`} className="text-xs text-gray-400 capitalize">{p}</label>
              <input
                id={`array-${p}`}
                type="number"
                value={params[p] ?? ""}
                onChange={(e) => setParams((prev) => ({ ...prev, [p]: e.target.value }))}
                onKeyDown={handleKeyDown}
                placeholder={p === "index" ? `0–${op === "insert" ? arrayLength : Math.max(0, arrayLength - 1)}` : "-9999–9999"}
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
          disabled
            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-500 text-white"
        }`}
      >
        Run {selected.label}
      </button>
    </div>
  );
}
