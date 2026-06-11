"use client";

import { useState } from "react";
import { vRange } from "@/lib/validation";
import { HeapType } from "@/lib/heap-engine";

interface Props {
  heapType: HeapType;
  onRun: (op: string, params: Record<string, number>) => void;
}

const OPERATIONS = [
  { key: "insert",    label: "Insert",       needsValue: true  },
  { key: "extract",   label: "Extract Root", needsValue: false },
  { key: "peek",      label: "Peek Root",    needsValue: false },
  { key: "buildHeap", label: "Build Heap",   needsValue: false },
  { key: "heapSort",  label: "Heap Sort",    needsValue: false },
];

export default function HeapControls({ heapType, onRun }: Props) {
  const [selectedOp, setSelectedOp] = useState("insert");
  const [value, setValue] = useState("");

  const currentOp = OPERATIONS.find((o) => o.key === selectedOp)!;
  const vr = vRange(value, "Value");
  const error = currentOp.needsValue && value !== "" ? (!vr.ok ? vr.msg : undefined) : undefined;
  const disabled = currentOp.needsValue && (value.trim() === "" || !vr.ok);

  const handleRun = () => {
    if (disabled) return;
    if (currentOp.needsValue) {
      onRun(selectedOp, { value: parseInt(value, 10) });
    } else {
      onRun(selectedOp, {});
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleRun();
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-300">Operations</h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {OPERATIONS.map((op) => (
          <button
            key={op.key}
            type="button"
            onClick={() => { setSelectedOp(op.key); setValue(""); }}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
              selectedOp === op.key
                ? "bg-lime-600 text-white border border-lime-500"
                : "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 hover:text-white"
            }`}
          >
            {op.label}
          </button>
        ))}
      </div>

      {currentOp.needsValue && (
        <div className="space-y-1">
          <label htmlFor="heap-value" className="text-xs text-gray-400">Value (-9999–9999)</label>
          <div className="flex gap-2">
            <input
              id="heap-value"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter value"
              className={`flex-1 px-3 py-2 bg-gray-800 border rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none ${
                error ? "border-red-500 focus:border-red-400" : "border-gray-700 focus:border-lime-500"
              }`}
            />
            <button
              type="button"
              onClick={handleRun}
              disabled={disabled}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                disabled ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-lime-600 hover:bg-lime-500 text-white"
              }`}
            >
              Run
            </button>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      )}

      {!currentOp.needsValue && (
        <button
          type="button"
          onClick={handleRun}
          className="w-full px-4 py-2 bg-lime-600 hover:bg-lime-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Run {currentOp.label}
        </button>
      )}

      <p className="text-xs text-gray-500">
        {heapType === "min" ? "Min heap: root is always smallest." : "Max heap: root is always largest."}
        {selectedOp === "heapSort" && " HeapSort always uses max heap internally."}
      </p>
    </div>
  );
}
