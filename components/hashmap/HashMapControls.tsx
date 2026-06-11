"use client";

import { useState } from "react";
import { vKey, vRange } from "@/lib/validation";

interface Props {
  onRun: (op: string, params: { key?: string; value?: number }) => void;
}

export default function HashMapControls({ onRun }: Props) {
  const [op, setOp] = useState("set");
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");

  const needsKey   = op !== "keys" && op !== "resize";
  const needsValue = op === "set";

  const keyResult   = needsKey   ? vKey(key)                    : { ok: true };
  const valueResult = needsValue ? vRange(value, "Value", -9999, 9999) : { ok: true };

  const keyError   = needsKey   && key   !== "" && !keyResult.ok   ? keyResult.msg   : undefined;
  const valueError = needsValue && value !== "" && !valueResult.ok ? valueResult.msg : undefined;

  const disabled = (needsKey && (key.trim() === "" || !keyResult.ok)) ||
                   (needsValue && (value.trim() === "" || !valueResult.ok));

  const handleSubmit = () => {
    if (disabled) return;
    onRun(op, {
      key:   needsKey   ? key.trim()              : undefined,
      value: needsValue ? parseInt(value, 10)     : undefined,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-300">Operations</h3>

      <div className="flex flex-wrap gap-2">
        {[
          { id: "set",    label: "Set"    },
          { id: "get",    label: "Get"    },
          { id: "delete", label: "Delete" },
          { id: "has",    label: "Has"    },
          { id: "keys",   label: "Keys"   },
          { id: "resize", label: "Resize" },
        ].map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => { setOp(o.id); setKey(""); setValue(""); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              op === o.id
                ? "bg-amber-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {needsKey && (
          <div className="space-y-1">
            <label htmlFor="hm-key-input" className="text-xs text-gray-400 uppercase tracking-wider block">
              Key (max 20 chars)
            </label>
            <input
              id="hm-key-input"
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. username"
              className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none ${
                keyError ? "border-red-500 focus:border-red-400" : "border-gray-700 focus:border-amber-500"
              }`}
            />
            {keyError && <p className="text-xs text-red-400">{keyError}</p>}
          </div>
        )}

        {needsValue && (
          <div className="space-y-1">
            <label htmlFor="hm-value-input" className="text-xs text-gray-400 uppercase tracking-wider block">
              Value (integer)
            </label>
            <input
              id="hm-value-input"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="-9999–9999"
              className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none ${
                valueError ? "border-red-500 focus:border-red-400" : "border-gray-700 focus:border-amber-500"
              }`}
            />
            {valueError && <p className="text-xs text-red-400">{valueError}</p>}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={disabled}
        className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          disabled ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-amber-600 hover:bg-amber-500 text-white"
        }`}
      >
        Run {op}
      </button>

      <div className="text-xs text-gray-500 leading-relaxed">
        {op === "set"    && "Insert or update a key-value pair. O(1) average."}
        {op === "get"    && "Retrieve value by key. O(1) average."}
        {op === "delete" && "Remove a key-value pair. O(1) average."}
        {op === "has"    && "Check key existence. O(1) average."}
        {op === "keys"   && "Iterate all buckets and collect every key. O(n+k)."}
        {op === "resize" && "Double bucket count and rehash all entries."}
      </div>
    </div>
  );
}
