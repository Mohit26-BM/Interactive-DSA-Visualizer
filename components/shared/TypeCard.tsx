"use client";

import Link from "next/link";

interface Props {
  href: string;
  icon: string;
  color: string; // Tailwind bg class
  title: string;
  subtitle: string;
  badges: string[];
  description: string;
}

export default function TypeCard({ href, icon, color, title, subtitle, badges, description }: Props) {
  return (
    <Link
      href={href}
      className="group bg-gray-900 border border-gray-700 hover:border-gray-500 rounded-xl p-6 flex flex-col gap-4 transition-all duration-300 hover:shadow-2xl hover:shadow-black/40 hover:scale-[1.025] hover:-translate-y-1 active:scale-[0.99]"
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-xl font-bold shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-base">{title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>
        <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-300 group-hover:translate-x-1 transition-all duration-300 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">{description}</p>

      <div className="flex flex-wrap gap-1.5 mt-auto">
        {badges.map((b) => (
          <span key={b} className="text-[10px] bg-gray-800 text-gray-400 border border-gray-700 px-2 py-0.5 rounded-full font-mono">
            {b}
          </span>
        ))}
      </div>
    </Link>
  );
}
