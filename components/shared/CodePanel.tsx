"use client";

interface CodePanelProps {
  lines: string[];
  highlightLine: number;
  annotation?: string;
}

export default function CodePanel({ lines, highlightLine, annotation }: CodePanelProps) {
  return (
    <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 border-b border-gray-800">
        <div className="w-3 h-3 rounded-full bg-red-500/60" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
        <div className="w-3 h-3 rounded-full bg-green-500/60" />
        <span className="ml-2 text-xs text-gray-500 font-mono">pseudocode</span>
      </div>
      <div className="p-4 font-mono text-sm">
        {lines.map((line, i) => {
          const lineNum = i + 1;
          const isActive = highlightLine === lineNum;
          return (
            <div
              key={i}
              className={`flex gap-4 px-2 py-0.5 rounded transition-colors duration-200 ${
                isActive ? "bg-indigo-500/20" : "hover:bg-gray-800/40"
              }`}
            >
              <span className={`select-none w-4 text-right shrink-0 ${isActive ? "text-indigo-400" : "text-gray-600"}`}>
                {lineNum}
              </span>
              <span className={`${isActive ? "text-indigo-200" : "text-gray-400"} whitespace-pre`}>
                {isActive && <span className="text-indigo-400 mr-1">▶</span>}
                {line}
              </span>
            </div>
          );
        })}
      </div>

      {annotation && (
        <div className="border-t border-indigo-500/20 bg-indigo-500/5 px-4 py-3 flex items-start gap-2.5">
          <span className="text-indigo-400 text-sm shrink-0 mt-0.5">💡</span>
          <p className="text-xs text-indigo-200/80 leading-relaxed">{annotation}</p>
        </div>
      )}
    </div>
  );
}
