"use client";

import { useState } from "react";
import { vLabel, hasErrors } from "@/lib/validation";

interface Props {
  directed: boolean;
  onRun: (op: string, params: Record<string, string | number>) => void;
}

const OPERATIONS = [
  { key: "addVertex",  label: "Add Vertex",  inputs: [{ name: "label",      type: "text",   placeholder: "e.g. F" }] },
  { key: "addEdge",    label: "Add Edge",    inputs: [{ name: "fromLabel",  type: "text",   placeholder: "From (e.g. A)" }, { name: "toLabel", type: "text", placeholder: "To (e.g. B)" }, { name: "weight", type: "number", placeholder: "Weight (opt)" }] },
  { key: "removeEdge", label: "Remove Edge", inputs: [{ name: "fromLabel",  type: "text",   placeholder: "From (e.g. A)" }, { name: "toLabel", type: "text", placeholder: "To (e.g. B)" }] },
  { key: "dfs",        label: "DFS",         inputs: [{ name: "startLabel", type: "text",   placeholder: "Start (e.g. A)" }] },
  { key: "bfs",        label: "BFS",         inputs: [{ name: "startLabel", type: "text",   placeholder: "Start (e.g. A)" }] },
];

export default function GraphControls({ directed, onRun }: Props) {
  const [selectedOp, setSelectedOp] = useState("bfs");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  const currentOp = OPERATIONS.find((o) => o.key === selectedOp)!;

  const getErrors = () => {
    const e: Record<string, string | undefined> = {};
    for (const input of currentOp.inputs) {
      if (input.type === "text") {
        const r = vLabel(fieldValues[input.name] ?? "", input.name === "weight" ? "Weight" : input.name.replace("Label", ""));
        if (!r.ok) e[input.name] = r.msg;
      }
    }
    if (selectedOp === "addEdge") {
      const from = (fieldValues.fromLabel ?? "").trim().toUpperCase();
      const to = (fieldValues.toLabel ?? "").trim().toUpperCase();
      if (from && to && from === to) e.toLabel = "From and To must differ";
    }
    return e;
  };

  const errors = getErrors();
  const disabled = hasErrors(errors);

  const handleRun = () => {
    if (disabled) return;
    const params: Record<string, string | number> = {};
    for (const input of currentOp.inputs) {
      const val = fieldValues[input.name] ?? "";
      if (input.type === "number") {
        const num = parseFloat(val);
        if (!isNaN(num)) params[input.name] = num;
      } else if (val.trim()) {
        params[input.name] = val.trim().toUpperCase();
      }
    }
    onRun(selectedOp, params);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleRun();
  };

  const setField = (name: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-300">Operations</h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {OPERATIONS.map((op) => (
          <button
            key={op.key}
            type="button"
            onClick={() => { setSelectedOp(op.key); setFieldValues({}); }}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
              selectedOp === op.key
                ? "bg-violet-700 text-white border border-violet-600"
                : "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 hover:text-white"
            }`}
          >
            {op.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {currentOp.inputs.map((input) => (
          <div key={input.name} className="space-y-1">
            <label htmlFor={`graph-${selectedOp}-${input.name}`} className="text-xs text-gray-400 capitalize">
              {input.name === "fromLabel" ? "From" : input.name === "toLabel" ? "To" : input.name === "startLabel" ? "Start vertex" : input.name === "label" ? "Label" : "Weight (optional)"}
            </label>
            <input
              id={`graph-${selectedOp}-${input.name}`}
              type={input.type}
              value={fieldValues[input.name] ?? ""}
              onChange={(e) => setField(input.name, e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={input.placeholder}
              className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none ${
                errors[input.name] ? "border-red-500 focus:border-red-400" : "border-gray-700 focus:border-violet-500"
              }`}
            />
            {errors[input.name] && <p className="text-xs text-red-400">{errors[input.name]}</p>}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleRun}
        disabled={disabled}
        className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          disabled ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-violet-700 hover:bg-violet-600 text-white"
        }`}
      >
        Run {currentOp.label}
      </button>

      <p className="text-xs text-gray-500">
        {directed ? "Directed: edges are one-way (A→B ≠ B→A)." : "Undirected: edges are bidirectional (A—B = B—A)."}
      </p>
    </div>
  );
}
