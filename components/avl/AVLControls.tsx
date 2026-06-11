"use client";

import { useState } from "react";
import { vRange } from "@/lib/validation";

interface Props {
  onRun: (op: string, params: Record<string, number>) => void;
}

const OPERATIONS = [
  { key: "insert", label: "Insert" },
  { key: "search", label: "Search" },
  { key: "delete", label: "Delete" },
];

export default function AVLControls({ onRun }: Props) {
  const [selectedOp, setSelectedOp] = useState("insert");
  const [value, setValue] = useState("");

  const vr = vRange(value, "Value");
  const error = value !== "" ? (!vr.ok ? vr.msg : undefined) : undefined;
  const disabled = value.trim() === "" || !vr.ok;

  const handleRun = () => {
    if (disabled) return;
    onRun(selectedOp, { value: parseInt(value, 10) });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleRun();
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-300">Operations</h3>

      <div className="grid grid-cols-3 gap-2">
        {OPERATIONS.map((op) => (
          <button
            key={op.key}
            type="button"
            onClick={() => setSelectedOp(op.key)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              selectedOp === op.key
                ? "bg-emerald-700 text-white border border-emerald-600"
                : "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 hover:text-white"
            }`}
          >
            {op.label}
          </button>
        ))}
      </div>

      <div className="space-y-1">
        <label htmlFor="avl-value" className="text-xs text-gray-400">Value (-9999–9999)</label>
        <div className="flex gap-2">
          <input
            id="avl-value"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter value"
            className={`flex-1 px-3 py-2 bg-gray-800 border rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none ${
              error ? "border-red-500 focus:border-red-400" : "border-gray-700 focus:border-emerald-500"
            }`}
          />
          <button
            type="button"
            onClick={handleRun}
            disabled={disabled}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              disabled ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-emerald-700 hover:bg-emerald-600 text-white"
            }`}
          >
            Run
          </button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      <p className="text-xs text-gray-500">
        AVL automatically rebalances after each insert/delete via LL, RR, LR, RL rotations.
      </p>
    </div>
  );
}
