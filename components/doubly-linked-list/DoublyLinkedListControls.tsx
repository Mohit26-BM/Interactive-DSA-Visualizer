"use client";

import { useState } from "react";
import { vRange, vIndex, hasErrors } from "@/lib/validation";

interface Props {
  onRun: (op: string, params: Record<string, number>) => void;
  listLength: number;
}

const OPS = [
  { key: "insertAtHead",     label: "Insert at Head",     params: ["value"] },
  { key: "insertAtTail",     label: "Insert at Tail",     params: ["value"] },
  { key: "insertAtPosition", label: "Insert at Position", params: ["value", "position"] },
  { key: "deleteAtHead",     label: "Delete at Head",     params: [] },
  { key: "deleteAtTail",     label: "Delete at Tail",     params: [] },
  { key: "deleteAtPosition", label: "Delete at Position", params: ["position"] },
  { key: "search",           label: "Search",             params: ["value"] },
  { key: "reverse",          label: "Reverse",            params: [] },
];

export default function DoublyLinkedListControls({ onRun, listLength }: Props) {
  const [op, setOp] = useState("insertAtHead");
  const [params, setParams] = useState<Record<string, string>>({});

  const selected = OPS.find((o) => o.key === op)!;

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
      <h3 className="text-sm font-semibold text-gray-300">Operations</h3>
      <div className="grid grid-cols-2 gap-2">
        {OPS.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => { setOp(o.key); setParams({}); }}
            className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
              op === o.key ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {selected.params.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {selected.params.map((p) => (
            <div key={p} className="flex flex-col gap-1">
              <label htmlFor={`dll-${op}-${p}`} className="text-xs text-gray-500 capitalize">{p}</label>
              <input
                id={`dll-${op}-${p}`}
                type="number"
                value={params[p] ?? ""}
                onChange={(e) => setParams((prev) => ({ ...prev, [p]: e.target.value }))}
                onKeyDown={handleKeyDown}
                placeholder={p === "position" ? `0–${op === "insertAtPosition" ? listLength : Math.max(0, listLength - 1)}` : "-9999–9999"}
                className={`w-28 px-3 py-2 bg-gray-800 border rounded-lg text-sm text-white focus:outline-none ${
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
        className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
          disabled ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500 text-white"
        }`}
      >
        Run {selected.label}
      </button>
    </div>
  );
}
