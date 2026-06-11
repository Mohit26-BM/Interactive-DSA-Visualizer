"use client";
import { useEffect, useRef, useState } from "react";

type Delay =
  | "delay-0" | "delay-75" | "delay-100" | "delay-150"
  | "delay-200" | "delay-300" | "delay-500";

type From = "up" | "left" | "right";

interface Props {
  children: React.ReactNode;
  className?: string;
  delay?: Delay;
  from?: From;
}

const HIDDEN: Record<From, string> = {
  up:    "opacity-0 translate-y-6",
  left:  "opacity-0 -translate-x-6",
  right: "opacity-0 translate-x-6",
};

export default function FadeIn({
  children,
  className = "",
  delay = "delay-0",
  from = "up",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${delay} ${
        visible ? "opacity-100 translate-y-0 translate-x-0" : HIDDEN[from]
      } ${className}`}
    >
      {children}
    </div>
  );
}
