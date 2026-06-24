"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, History, Crown } from "lucide-react";
import { fetchMatches } from "@/lib/api";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["matches"],
    queryFn: () => fetchMatches(30),
  });

  return (
    <main className="flex-1 flex flex-col items-center px-4 sm:px-6 py-8">
      <div className="w-full max-w-2xl">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition mb-6">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>

        <div className="flex items-center gap-2 mb-6">
          <History className="h-6 w-6 text-amber-400" />
          <h1 className="text-2xl font-bold">Match History</h1>
        </div>

        <div className="flex flex-col gap-3">
          {isLoading && <p className="text-sm text-slate-400">Loading…</p>}
          {isError && <p className="text-sm text-rose-400">Couldn&apos;t load match history.</p>}
          {!isLoading && !isError && data?.length === 0 && (
            <p className="text-sm text-slate-400">No completed games yet.</p>
          )}
          {data?.map((m, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/10 bg-slate-900/40 backdrop-blur px-4 sm:px-5 py-3.5"
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-300">
                  <Crown className="h-4 w-4" />
                  {m.winnerName}
                </span>
                <span className="text-xs text-slate-500 shrink-0">{formatDate(m.endedAt)}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[...m.players]
                  .sort((a, b) => a.placement - b.placement)
                  .map((p) => (
                    <span
                      key={p.name}
                      className={`text-xs rounded-full px-2.5 py-1 border ${
                        p.placement === 1
                          ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
                          : "border-white/10 bg-slate-950/40 text-slate-400"
                      }`}
                    >
                      #{p.placement} {p.name}
                    </span>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
