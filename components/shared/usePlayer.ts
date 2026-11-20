"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export function usePlayer(totalSteps: number) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // When the number of steps changes (a new run), start again from step 0, stopped.
  // Done while rendering (React's "adjust state when a prop changes" pattern) instead of in an effect.
  const [seenTotal, setSeenTotal] = useState(totalSteps);
  if (seenTotal !== totalSteps) {
    setSeenTotal(totalSteps);
    setStep(0);
    setPlaying(false);
  }
  const atEnd = step >= totalSteps - 1;
  const isPlaying = playing && !atEnd; // reaching the last step stops playback

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const pause = useCallback(() => {
    setPlaying(false);
    clearTimer();
  }, [clearTimer]);

  const play = useCallback(() => {
    if (step >= totalSteps - 1) setStep(0);
    setPlaying(true);
  }, [step, totalSteps]);

  const stepForward = useCallback(() => {
    pause();
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  }, [pause, totalSteps]);

  const stepBackward = useCallback(() => {
    pause();
    setStep((s) => Math.max(s - 1, 0));
  }, [pause]);

  const reset = useCallback(() => {
    pause();
    setStep(0);
  }, [pause]);

  useEffect(() => {
    if (!isPlaying) return;
    timerRef.current = setTimeout(() => {
      setStep((s) => s + 1);
    }, 1000 / speed);
    return clearTimer;
  }, [isPlaying, step, speed, clearTimer]);

  return { step, playing: isPlaying, speed, play, pause, stepForward, stepBackward, reset, setSpeed };
}
