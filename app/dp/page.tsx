import Link from "next/link";
import TypeCard from "@/components/shared/TypeCard";
import FadeIn from "@/components/shared/FadeIn";

export default function DPPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-rose-700 rounded-lg flex items-center justify-center text-sm font-bold">DP</div>
          <h1 className="text-xl font-bold">Dynamic Programming</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <FadeIn from="up">
          <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
            Dynamic programming solves problems by breaking them into overlapping subproblems and reusing computed results.
            Watch each cell fill bottom-up — yellow = current cell being computed, green = match/optimal choice.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6 items-start">

          {/* Table — left */}
          <FadeIn from="left" delay="delay-0">
            <div className="bg-gray-900 border border-gray-700 hover:border-gray-600 transition-colors duration-200 rounded-xl overflow-hidden shadow-lg shadow-black/20">
              <div className="px-4 py-3 border-b border-gray-800 bg-gray-950/60">
                <span className="text-sm font-semibold text-gray-200 tracking-wide">Complexity Overview</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700/80 bg-gray-950/40">
                      <th className="text-left px-4 py-2.5 text-gray-400 font-semibold">Problem</th>
                      <th className="text-left px-4 py-2.5 text-yellow-400 font-semibold">Time</th>
                      <th className="text-left px-4 py-2.5 text-gray-400 font-semibold">Space</th>
                      <th className="text-left px-4 py-2.5 text-rose-400 font-semibold">Recurrence</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    {[
                      ["Fibonacci",     "O(n)",       "O(n)",    "f(n-1)+f(n-2)"],
                      ["Knapsack",      "O(n·W)",     "O(n·W)",  "max(take, skip)"],
                      ["LCS",           "O(m·n)",     "O(m·n)",  "match+1 or max(↑,←)"],
                      ["Coin Change",   "O(A·|C|)",   "O(A)",    "min(dp[i-c]+1)"],
                      ["LIS",           "O(n²)",      "O(n)",    "max(dp[j]+1)"],
                      ["Unique Paths",  "O(m·n)",     "O(m·n)",  "dp[i-1][j]+dp[i][j-1]"],
                      ["Min Path Sum",  "O(m·n)",     "O(m·n)",  "min(↑,←)+grid[i][j]"],
                      ["Edit Distance", "O(m·n)",     "O(m·n)",  "match or 1+min(ins,del,sub)"],
                    ].map(([name, time, space, rec]) => (
                      <tr key={name} className="border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors duration-150">
                        <td className="px-4 py-2.5 text-rose-400 font-medium">{name}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-yellow-400">{time}</td>
                        <td className="px-4 py-2.5 font-mono text-xs">{space}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{rec}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </FadeIn>

          {/* Cards — right */}
          <FadeIn from="right" delay="delay-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TypeCard
                href="/dp/fibonacci"
                icon="ƒ"
                color="bg-pink-700"
                title="Fibonacci"
                subtitle="1-D tabulation · two base cases"
                description="Classic DP intro. Fill a 1-D table from base cases upward — each cell references just the two previous cells."
                badges={["O(n) time", "O(n) space", "1-D table", "bottom-up"]}
              />
              <TypeCard
                href="/dp/knapsack"
                icon="⊞"
                color="bg-rose-700"
                title="0/1 Knapsack"
                subtitle="2-D table · take or skip"
                description="For each item and each capacity, choose to take or skip. The 2-D table makes the decision tree visual."
                badges={["O(n·W) time", "O(n·W) space", "2-D table", "classic"]}
              />
              <TypeCard
                href="/dp/lcs"
                icon="⊂"
                color="bg-fuchsia-700"
                title="LCS"
                subtitle="Longest Common Subsequence"
                description="Match characters across two strings. Diagonal fills on match; take max of up/left on mismatch."
                badges={["O(m·n) time", "2-D grid", "string DP", "traceback"]}
              />
              <TypeCard
                href="/dp/coin-change"
                icon="¢"
                color="bg-orange-700"
                title="Coin Change"
                subtitle="Min coins · 1-D table"
                description="Find the minimum number of coins to reach a target amount. Try each coin at every amount from 1 to target."
                badges={["O(A·C) time", "O(A) space", "1-D table", "unbounded"]}
              />
              <TypeCard
                href="/dp/lis"
                icon="↗"
                color="bg-amber-700"
                title="LIS"
                subtitle="Longest Increasing Subsequence"
                description="Find the longest strictly increasing subsequence. Each dp[i] stores the best length ending at index i."
                badges={["O(n²) time", "O(n) space", "1-D dp", "traceback"]}
              />
              <TypeCard
                href="/dp/grid-dp"
                icon="⊞"
                color="bg-sky-700"
                title="Grid DP"
                subtitle="Unique Paths · Min Path Sum"
                description="Two classic 2-D grid problems: count paths in a grid, or find the path with the minimum cost. Move right or down only."
                badges={["O(m·n) time", "2-D grid", "path counting", "path sum"]}
              />
              <TypeCard
                href="/dp/edit-distance"
                icon="ED"
                color="bg-violet-700"
                title="Edit Distance"
                subtitle="Levenshtein · insert/delete/sub"
                description="Minimum number of single-character edits (insert, delete, substitute) to transform one string into another."
                badges={["O(m·n) time", "2-D table", "string DP", "Levenshtein"]}
              />
            </div>
          </FadeIn>

        </div>
      </div>
    </div>
  );
}
