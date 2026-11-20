"use client";

import { useCallback, useEffect, useState } from "react";
import { HERO_PHOTOS } from "@/lib/hero-photos";

const INTERVAL_MS = 6500;

// A banner of photographs (whiteboards, notebooks, diagrams in an ink-on-paper tone) that slowly cross-fade behind
// the hero text.
// - the first photo loads straight away; the rest are added a moment later so they never delay the page
// - it advances on its own, stops while the tab is hidden, and the dots let you pick a photo yourself
// - with reduced motion switched on it shows one still photo and no dots
// - state starts at photo 0, so the first client render matches the server markup (no hydration mismatch)
export default function PhotoHero({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(0);
  const [more, setMore] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [tick, setTick] = useState(0); // bumped when you pick a photo, so the auto-advance timer starts over

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const warm = setTimeout(() => setMore(true), 1200);
    return () => clearTimeout(warm);
  }, [reduced]);

  useEffect(() => {
    if (reduced || !more) return;
    const id = setInterval(() => {
      if (!document.hidden) setActive((i) => (i + 1) % HERO_PHOTOS.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [reduced, more, tick]);

  const pick = useCallback((i: number) => {
    setActive(i);
    setTick((t) => t + 1);
  }, []);

  const photos = more && !reduced ? HERO_PHOTOS : HERO_PHOTOS.slice(0, 1);
  const shown = reduced ? 0 : active;

  return (
    <section className="relative flex min-h-[440px] items-center overflow-hidden rounded-3xl border border-gray-700 bg-gray-900">
      <div className="absolute inset-0" aria-hidden="true">
        {photos.map((p, i) => (
          // eslint-disable-next-line @next/next/no-img-element -- local, pre-sized WebP; next/image adds nothing here
          <img
            key={p.name}
            src={`/images/hero-${p.name}.webp`}
            srcSet={`/images/hero-${p.name}-sm.webp 800w, /images/hero-${p.name}.webp ${p.w}w`}
            sizes="(min-width: 1280px) 1280px, 100vw"
            alt=""
            width={p.w}
            height={p.h}
            decoding="async"
            fetchPriority={i === 0 ? "high" : "low"}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms] ease-out ${i === shown ? "opacity-70" : "opacity-0"}`}
          />
        ))}
        {/* paper wash: strongest behind the text on the left, so ink stays readable over the photo */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#f6f1e4] via-[#f6f1e4]/85 to-[#f6f1e4]/10" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f6f1e4]/80 to-transparent" />
      </div>

      <div className="relative z-10 w-full px-6 py-10 sm:px-10">{children}</div>

      {!reduced && more && (
        <div className="absolute bottom-3 right-4 z-10 flex items-center gap-2" role="group" aria-label="Hero photo">
          {HERO_PHOTOS.map((p, i) => (
            <button
              key={p.name}
              type="button"
              onClick={() => pick(i)}
              aria-label={`Show photo ${i + 1} of ${HERO_PHOTOS.length}`}
              aria-current={i === shown}
              className={`h-2 rounded-full transition-all duration-300 ${i === shown ? "w-6 bg-indigo-400" : "w-2 bg-gray-600 hover:bg-gray-400"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
