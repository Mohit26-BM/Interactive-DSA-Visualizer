"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  algorithm: string;
  stepExplanation: string;
  stepIndex: number;
  totalSteps: number;
  additionalContext?: string;
}

export default function AIExplainer({
  algorithm,
  stepExplanation,
  stepIndex,
  totalSteps,
  additionalContext,
}: Props) {
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamDone, setStreamDone] = useState(false);
  const [open, setOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Clear whenever the step changes
  useEffect(() => {
    setAiText("");
    setOpen(false);
    setStreamDone(false);
    abortRef.current?.abort();
  }, [stepIndex]);

  const handleExplain = async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setOpen(true);
    setLoading(true);
    setAiText("");
    setStreamDone(false);

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ algorithm, stepExplanation, stepIndex, totalSteps, additionalContext }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        setAiText("Could not reach AI. Check your GROQ_API_KEY in .env.local.");
        setLoading(false);
        setStreamDone(true);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      setLoading(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setAiText((prev) => prev + decoder.decode(value, { stream: true }));
      }
      setStreamDone(true);
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setAiText("Something went wrong. Try again.");
        setLoading(false);
        setStreamDone(true);
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
    setAiText("");
    setStreamDone(false);
    abortRef.current?.abort();
  };

  if (!stepExplanation) return null;

  return (
    <div>
      {!open ? (
        <button
          type="button"
          onClick={handleExplain}
          className="flex items-center gap-1.5 text-xs text-indigo-400/70 hover:text-indigo-300 transition-colors duration-200 font-medium py-0.5 group"
        >
          <svg className="w-3 h-3 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          <span>Explain in detail</span>
        </button>
      ) : (
        <div className="bg-indigo-950/50 border border-indigo-500/20 rounded-lg px-4 py-3 relative">
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-2.5 right-3 text-indigo-400/40 hover:text-indigo-400 transition-colors text-xs leading-none"
            aria-label="Close explanation"
          >
            ✕
          </button>

          <div className="flex items-center gap-1.5 mb-2">
            <svg className="w-3 h-3 text-indigo-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">AI Tutor</span>
          </div>

          {loading ? (
            <p className="text-sm text-indigo-300/50 animate-pulse">Thinking…</p>
          ) : (
            <p className="text-sm text-indigo-100/90 leading-relaxed pr-5">
              {aiText}
              {!streamDone && (
                <span className="inline-block w-0.5 h-[13px] bg-indigo-400/70 ml-0.5 animate-pulse align-middle" />
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
