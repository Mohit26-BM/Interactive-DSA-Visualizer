"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export function usePlayer(totalSteps: number) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    if (!playing) return;
    if (step >= totalSteps - 1) {
      setPlaying(false);
      return;
    }
    timerRef.current = setTimeout(() => {
      setStep((s) => s + 1);
    }, 1000 / speed);
    return clearTimer;
  }, [playing, step, totalSteps, speed, clearTimer]);

  useEffect(() => {
    pause();
    setStep(0);
  }, [totalSteps]);

  return { step, playing, speed, play, pause, stepForward, stepBackward, reset, setSpeed };
}
