"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Trophy, Medal } from "lucide-react";
import { fetchLeaderboard } from "@/lib/api";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: fetchLeaderboard,
  });

  return (
    <main className="flex-1 flex flex-col items-center px-4 sm:px-6 py-8">
      <div className="w-full max-w-2xl">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition mb-6">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>

        <div className="flex items-center gap-2 mb-6">
          <Trophy className="h-6 w-6 text-amber-400" />
          <h1 className="text-2xl font-bold">Leaderboard</h1>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur overflow-hidden">
          {isLoading && <p className="p-6 text-sm text-slate-400">Loading…</p>}
          {isError && <p className="p-6 text-sm text-rose-400">Couldn&apos;t load the leaderboard.</p>}
          {!isLoading && !isError && data?.length === 0 && (
            <p className="p-6 text-sm text-slate-400">
              No ranked games yet — finish a multiplayer game to appear here.
            </p>
          )}
          {data?.map((entry, i) => {
            const total = entry.wins + entry.losses;
            const winRate = total > 0 ? Math.round((entry.wins / total) * 100) : 0;
            return (
              <div
                key={entry.playerName}
                className={`flex items-center gap-4 px-4 sm:px-6 py-3.5 ${
                  i !== (data.length ?? 0) - 1 ? "border-b border-white/5" : ""
                }`}
              >
                <span className="w-7 text-center text-lg shrink-0">
                  {MEDALS[i] ?? <Medal className="h-4 w-4 text-slate-600 mx-auto" />}
                </span>
                <span className="flex-1 font-medium truncate">{entry.playerName}</span>
                <span className="text-sm text-slate-400 shrink-0">
                  {entry.wins}W – {entry.losses}L
                </span>
                <span className="text-sm font-semibold text-amber-400 w-12 text-right shrink-0">{winRate}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
