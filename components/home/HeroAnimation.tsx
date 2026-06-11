"use client";
import { useEffect, useState } from "react";

const VBW = 360;
const VBH = 200;
const R = 19;

const NODES = [
  { id: "A", x: 55,  y: 100 },
  { id: "B", x: 165, y: 32  },
  { id: "C", x: 165, y: 168 },
  { id: "D", x: 265, y: 100 },
  { id: "E", x: 330, y: 40  },
] as const;

const EDGES = [
  { id: "AB", from: "A", to: "B", w: 4 },
  { id: "AC", from: "A", to: "C", w: 2 },
  { id: "BD", from: "B", to: "D", w: 5 },
  { id: "BE", from: "B", to: "E", w: 6 },
  { id: "CD", from: "C", to: "D", w: 1 },
  { id: "DE", from: "D", to: "E", w: 3 },
] as const;

const POS: Record<string, { x: number; y: number }> = Object.fromEntries(
  NODES.map((n) => [n.id, { x: n.x, y: n.y }])
);

type NS = "default" | "source" | "current" | "visited" | "candidate";
type ES = "default" | "relaxed";

interface DStep {
  caption: string;
  ns: Record<string, NS>;
  es: Record<string, ES>;
  dist: Record<string, number | null>;
  pause?: boolean;
}

const X = null;
const ND: Record<string, NS> = { A: "default", B: "default", C: "default", D: "default", E: "default" };
const ED: Record<string, ES> = { AB: "default", AC: "default", BD: "default", BE: "default", CD: "default", DE: "default" };

const STEPS: DStep[] = [
  { caption: "Dijkstra's Algorithm", pause: true, ns: { ...ND }, es: { ...ED }, dist: { A:X,B:X,C:X,D:X,E:X } },
  { caption: "Set d[A]=0, all others=∞",
    ns: { A:"source",B:"default",C:"default",D:"default",E:"default" }, es: { ...ED },
    dist: { A:0,B:X,C:X,D:X,E:X } },
  { caption: "Relax A→B: d[B] = 4",
    ns: { A:"source",B:"candidate",C:"default",D:"default",E:"default" },
    es: { AB:"relaxed",AC:"default",BD:"default",BE:"default",CD:"default",DE:"default" },
    dist: { A:0,B:4,C:X,D:X,E:X } },
  { caption: "Relax A→C: d[C] = 2",
    ns: { A:"source",B:"candidate",C:"candidate",D:"default",E:"default" },
    es: { AB:"relaxed",AC:"relaxed",BD:"default",BE:"default",CD:"default",DE:"default" },
    dist: { A:0,B:4,C:2,D:X,E:X } },
  { caption: "Visit C — nearest unvisited (d=2)",
    ns: { A:"visited",B:"candidate",C:"current",D:"default",E:"default" },
    es: { AB:"relaxed",AC:"relaxed",BD:"default",BE:"default",CD:"default",DE:"default" },
    dist: { A:0,B:4,C:2,D:X,E:X } },
  { caption: "Relax C→D: d[D] = 3",
    ns: { A:"visited",B:"candidate",C:"current",D:"candidate",E:"default" },
    es: { AB:"relaxed",AC:"relaxed",BD:"default",BE:"default",CD:"relaxed",DE:"default" },
    dist: { A:0,B:4,C:2,D:3,E:X } },
  { caption: "Visit D — nearest unvisited (d=3)",
    ns: { A:"visited",B:"candidate",C:"visited",D:"current",E:"default" },
    es: { AB:"relaxed",AC:"relaxed",BD:"default",BE:"default",CD:"relaxed",DE:"default" },
    dist: { A:0,B:4,C:2,D:3,E:X } },
  { caption: "Relax D→E: d[E] = 6",
    ns: { A:"visited",B:"candidate",C:"visited",D:"current",E:"candidate" },
    es: { AB:"relaxed",AC:"relaxed",BD:"default",BE:"default",CD:"relaxed",DE:"relaxed" },
    dist: { A:0,B:4,C:2,D:3,E:6 } },
  { caption: "Visit B — nearest unvisited (d=4)",
    ns: { A:"visited",B:"current",C:"visited",D:"visited",E:"candidate" },
    es: { AB:"relaxed",AC:"relaxed",BD:"default",BE:"default",CD:"relaxed",DE:"relaxed" },
    dist: { A:0,B:4,C:2,D:3,E:6 } },
  { caption: "Visit E — all nodes reached (d=6)",
    ns: { A:"visited",B:"visited",C:"visited",D:"visited",E:"current" },
    es: { AB:"relaxed",AC:"relaxed",BD:"default",BE:"default",CD:"relaxed",DE:"relaxed" },
    dist: { A:0,B:4,C:2,D:3,E:6 } },
  { caption: "Shortest paths from A found!", pause: true,
    ns: { A:"visited",B:"visited",C:"visited",D:"visited",E:"visited" },
    es: { AB:"relaxed",AC:"relaxed",BD:"default",BE:"default",CD:"relaxed",DE:"relaxed" },
    dist: { A:0,B:4,C:2,D:3,E:6 } },
  { caption: "Restarting…", pause: true, ns: { ...ND }, es: { ...ED }, dist: { A:X,B:X,C:X,D:X,E:X } },
];

const NC: Record<NS, { fill: string; stroke: string; text: string; glow: string }> = {
  default:   { fill: "#111827", stroke: "#374151", text: "#6b7280", glow: "transparent" },
  source:    { fill: "#1e1b4b", stroke: "#818cf8", text: "#c7d2fe", glow: "#818cf820" },
  current:   { fill: "#431407", stroke: "#fb923c", text: "#fed7aa", glow: "#fb923c30" },
  visited:   { fill: "#052e16", stroke: "#4ade80", text: "#bbf7d0", glow: "#4ade8020" },
  candidate: { fill: "#0c1a3a", stroke: "#60a5fa", text: "#bfdbfe", glow: "#60a5fa15" },
};

const EC: Record<ES, { stroke: string; width: number }> = {
  default: { stroke: "#1f2937", width: 1.5 },
  relaxed: { stroke: "#3b82f6", width: 2.5 },
};

// Tailwind classes per node state — used in distance table and legend
const NS_TEXT: Record<NS, string> = {
  default:   "text-gray-600",
  source:    "text-indigo-400",
  current:   "text-orange-400",
  visited:   "text-green-400",
  candidate: "text-blue-400",
};

const LEGEND: [string, string][] = [
  ["source",  "bg-indigo-400"],
  ["current", "bg-orange-400"],
  ["visited", "bg-green-400"],
  ["queued",  "bg-blue-400"],
];

export default function HeroAnimation() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const step = STEPS[idx];
    const t = setTimeout(() => setIdx((p) => (p + 1) % STEPS.length), step.pause ? 1200 : 520);
    return () => clearTimeout(t);
  }, [idx]);

  const step = STEPS[idx];

  const captionClass =
    step.caption.includes("found")    ? "text-green-400" :
    step.caption.includes("Restart")  ? "text-gray-700"  :
    step.caption.includes("Dijkstra") ? "text-gray-500"  :
    "text-slate-400";

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden w-full shadow-2xl shadow-violet-500/10">

      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800 bg-gray-950/60">
        <span className="text-xs text-gray-400 font-medium tracking-wide">Shortest Path Visualization</span>
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
        </div>
      </div>

      {/* Graph SVG — max-h prevents nodes from ballooning on wide containers */}
      <div className="px-3 pt-3 pb-1">
        <svg viewBox={`0 0 ${VBW} ${VBH}`} className="w-full max-h-55" aria-label="Dijkstra visualization">
          {/* Edges + weight labels */}
          {EDGES.map((e) => {
            const fp = POS[e.from];
            const tp = POS[e.to];
            const ec = EC[step.es[e.id]];
            const mx = (fp.x + tp.x) / 2;
            const my = (fp.y + tp.y) / 2;
            // Push label away from graph center
            const lx = mx + (mx < VBW / 2 ? -9 : 9);
            const ly = my + (my < VBH / 2 ? -8 : 8);
            const isRelaxed = step.es[e.id] === "relaxed";
            return (
              <g key={e.id}>
                <line x1={fp.x} y1={fp.y} x2={tp.x} y2={tp.y}
                  stroke={ec.stroke} strokeWidth={ec.width}
                />
                <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
                  fill={isRelaxed ? "#60a5fa" : "#4b5563"}
                  fontSize={9} fontFamily="monospace" fontWeight={isRelaxed ? "bold" : "normal"}
                >
                  {e.w}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {NODES.map((n) => {
            const nc = NC[step.ns[n.id]];
            return (
              <g key={n.id}>
                {/* Glow halo */}
                <circle cx={n.x} cy={n.y} r={R + 7} fill={nc.glow} />
                {/* Node circle */}
                <circle cx={n.x} cy={n.y} r={R}
                  fill={nc.fill} stroke={nc.stroke} strokeWidth={2}
                />
                {/* Label */}
                <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central"
                  fill={nc.text} fontSize={13} fontWeight="bold" fontFamily="monospace"
                >
                  {n.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Distance table */}
      <div className="flex justify-center gap-4 px-4 pb-2">
        {NODES.map((n) => {
          const d = step.dist[n.id];
          return (
            <div key={n.id} className="flex flex-col items-center gap-0.5">
              <span className={`text-[9px] font-mono ${NS_TEXT[step.ns[n.id]]}`}>{n.id}</span>
              <span className="text-[11px] font-mono font-bold text-white">{d === null ? "∞" : d}</span>
            </div>
          );
        })}
      </div>

      {/* Caption */}
      <div className="border-t border-gray-800 px-4 py-2 min-h-[30px] flex items-center">
        <span className={`text-[11px] font-mono ${captionClass}`}>{step.caption}</span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center px-4 pb-3">
        {LEGEND.map(([label, cls]) => (
          <div key={label} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${cls}`} />
            <span className="text-[9px] text-gray-500 font-mono">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
