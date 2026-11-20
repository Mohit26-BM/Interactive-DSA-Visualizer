"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GROUPS, ALL_ITEMS } from "@/lib/navigation";

// A slim bar: the logo, the name of the current visualiser, and a menu listing every visualiser by group.
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [seenPath, setSeenPath] = useState<string | null>(null);
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);
  const current = ALL_ITEMS.find((i) => i.href === pathname);

  // close the menu after navigating (adjusted while rendering, not in an effect)
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onDown); };
  }, [open]);

  return (
    <nav ref={ref} className="sticky top-0 z-50 border-b border-gray-700 bg-gray-900/90 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-6 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="font-hand text-2xl leading-none text-white shrink-0">
            DSA<span className="text-indigo-400">Viz</span>
          </Link>
          {current && (
            <span className="hidden sm:flex min-w-0 items-center gap-3 text-sm">
              <span className="text-gray-600">/</span>
              <span className="truncate text-gray-300">{current.label}</span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="viz-menu"
          className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-sm text-gray-300 hover:border-indigo-400 hover:text-white"
        >
          <span aria-hidden="true">{open ? "✕" : "☰"}</span> All visualizers
        </button>
      </div>

      {open && (
        <div id="viz-menu" className="max-h-[calc(100vh-52px)] overflow-y-auto border-t border-gray-700 bg-gray-900 animate-fade-in-up">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-x-8 gap-y-6 px-6 py-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {GROUPS.map((g) => (
              <div key={g.label}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">{g.label}</p>
                <ul className="space-y-1">
                  {g.items.map((it) => (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        className={`block py-0.5 text-sm ${pathname === it.href ? "font-medium text-white" : "text-gray-400 hover:text-white"}`}
                      >
                        {it.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
