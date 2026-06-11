"use client";

import { useState } from "react";
import { vRange } from "@/lib/validation";

interface Props {
  onRun: (op: string, params: Record<string, number>) => void;
}

const OPS = [
  { key: "insert",     label: "Insert",          params: ["value"] },
  { key: "search",     label: "Search",          params: ["value"] },
  { key: "delete",     label: "Delete",          params: ["value"] },
  { key: "inorder",    label: "Inorder (LNR)",   params: [] },
  { key: "preorder",   label: "Preorder (NLR)",  params: [] },
  { key: "postorder",  label: "Postorder (LRN)", params: [] },
  { key: "levelOrder", label: "Level Order (BFS)",params: [] },
  { key: "findMin",    label: "Find Min",        params: [] },
  { key: "findMax",    label: "Find Max",        params: [] },
];

export default function TreeControls({ onRun }: Props) {
  const [op, setOp] = useState("insert");
  const [value, setValue] = useState("50");
  const selected = OPS.find((o) => o.key === op)!;

  const needsValue = selected.params.includes("value");
  const vr = vRange(value, "Value");
  const error = needsValue && value !== "" && !vr.ok ? vr.msg : undefined;
  const disabled = needsValue && (value.trim() === "" || !vr.ok);

  const handleRun = () => {
    if (disabled) return;
    onRun(op, { value: parseInt(value, 10) || 0 });
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
            onClick={() => setOp(o.key)}
            className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${op === o.key ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {needsValue && (
        <div className="space-y-1">
          <label htmlFor="tree-value-input" className="text-xs text-gray-500 block">Value (-9999–9999)</label>
          <input
            id="tree-value-input"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-sm text-white focus:outline-none ${
              error ? "border-red-500 focus:border-red-400" : "border-gray-700 focus:border-indigo-500"
            }`}
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
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
