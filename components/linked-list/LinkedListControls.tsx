"use client";

import { useState } from "react";
import { vRange, vIndex, hasErrors } from "@/lib/validation";

interface LinkedListControlsProps {
  onRun: (op: string, params: Record<string, number>) => void;
  listLength: number;
}

const operations = [
  { value: "insertAtHead",     label: "Insert at Head",     params: ["value"] },
  { value: "insertAtTail",     label: "Insert at Tail",     params: ["value"] },
  { value: "insertAtPosition", label: "Insert at Position", params: ["value", "position"] },
  { value: "deleteAtHead",     label: "Delete Head",        params: [] },
  { value: "deleteAtTail",     label: "Delete Tail",        params: [] },
  { value: "deleteAtPosition", label: "Delete at Position", params: ["position"] },
  { value: "search",           label: "Search",             params: ["value"] },
  { value: "reverse",          label: "Reverse",            params: [] },
];

export default function LinkedListControls({ onRun, listLength }: LinkedListControlsProps) {
  const [op, setOp] = useState("insertAtHead");
  const [params, setParams] = useState<Record<string, string>>({});

  const selected = operations.find((o) => o.value === op)!;

  const getErrors = () => {
    const e: Record<string, string | undefined> = {};
    if (selected.params.includes("value")) {
      const r = vRange(params.value ?? "", "Value");
      if (!r.ok) e.value = r.msg;
    }
    if (selected.params.includes("position")) {
      const insertMode = op === "insertAtPosition";
      const r = vIndex(params.position ?? "", listLength, "Position", insertMode);
      if (!r.ok) e.position = r.msg;
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
              <label htmlFor={`ll-${op}-${p}`} className="text-xs text-gray-400 capitalize">{p}</label>
              <input
                id={`ll-${op}-${p}`}
                type="number"
                value={params[p] ?? ""}
                onChange={(e) => setParams((prev) => ({ ...prev, [p]: e.target.value }))}
                onKeyDown={handleKeyDown}
                placeholder={p === "position" ? `0–${op === "insertAtPosition" ? listLength : Math.max(0, listLength - 1)}` : "-9999–9999"}
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
