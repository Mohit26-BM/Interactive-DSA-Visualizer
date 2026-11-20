import Link from "next/link";
import { GROUPS } from "@/lib/navigation";
import { HERO_PHOTOS } from "@/lib/hero-photos";

// A site-wide footer: what the project is, where everything lives, and the photo credits.
export default function Footer() {
  const year = new Date().getFullYear();
  const photographers = [...new Map(HERO_PHOTOS.map((p) => [p.photographer, p])).values()];
  return (
    <footer className="mt-20 border-t border-gray-700 bg-gray-900/70">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-x-6 gap-y-8 px-6 py-10 md:grid-cols-3 lg:grid-cols-7 lg:px-12">
        <div className="col-span-2 space-y-3 md:col-span-3 lg:col-span-1">
          <Link href="/" className="font-hand text-2xl text-white">
            DSA<span className="text-indigo-400">Viz</span>
          </Link>
          <p className="text-sm leading-relaxed text-gray-400">
            Step-by-step visualizers for data structures and algorithms, with pseudocode that follows along.
          </p>
        </div>
        {GROUPS.map((g) => (
          <nav key={g.label} aria-label={g.label} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">{g.label}</p>
            <ul className="space-y-1.5">
              {(g.label === "Data Structures" ? g.items.slice(0, 8) : g.items).map((it) => (
                <li key={it.href}>
                  <Link href={it.href} className="text-sm text-gray-400 hover:text-white">{it.label}</Link>
                </li>
              ))}
              {g.label === "Data Structures" && (
                <li><Link href="/" className="text-sm text-indigo-400 hover:text-white">…and {g.items.length - 8} more</Link></li>
              )}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-gray-700">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-6 py-4 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between lg:px-12">
          <p>© {year} DSA Visualizer. For learning: simplified models, small inputs.</p>
          <p>
            Home page photos from{" "}
            <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Pexels</a>:{" "}
            {photographers.map((p, i) => (
              <span key={p.photographer}>
                <a href={p.page} target="_blank" rel="noopener noreferrer" className="hover:text-white">{p.photographer}</a>
                {i < photographers.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}
