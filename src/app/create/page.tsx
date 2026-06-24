"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, User, Bot as BotIcon } from "lucide-react";
import { getSocket } from "@/lib/socket";
import { useGameStore } from "@/store/gameStore";

const BOT_LEVELS = [
  { value: "easy", label: "Easy", desc: "Relaxed, makes mistakes" },
  { value: "medium", label: "Medium", desc: "Plays it straight" },
  { value: "hard", label: "Hard", desc: "Tracks cards, plays sharp" },
] as const;

function CreateRoomForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isTraining = searchParams.get("training") === "1";
  const [name, setName] = useState("");
  const [botLevel, setBotLevel] = useState<"easy" | "medium" | "hard">("hard");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const setPlayerName = useGameStore((s) => s.setPlayerName);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    setError(null);
    setLoading(true);

    const socket = getSocket();
    setPlayerName(trimmed);

    socket.once("room:created", ({ roomCode }: { roomCode: string }) => {
      router.push(`/room/${roomCode}`);
    });
    socket.once("error:message", (msg: string) => {
      setError(msg);
      setLoading(false);
    });
    socket.emit("room:create", { name: trimmed, isTraining, botLevel });
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm animate-fade-up">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition mb-6">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur p-6 shadow-xl"
        >
          <div>
            <h1 className="text-2xl font-bold">{isTraining ? "Solo Training" : "Create Room"}</h1>
            <p className="text-sm text-slate-400 mt-1">
              {isTraining ? "Practice against 3 bots, start instantly." : "Set up a room and invite friends."}
            </p>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-400">Your display name</span>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                placeholder="e.g. Sokha"
                className="w-full rounded-lg bg-slate-950/60 border border-slate-700 pl-9 pr-4 py-2.5 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 transition"
              />
            </div>
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <BotIcon className="h-3.5 w-3.5" />
              Bot difficulty
            </span>
            <div className="grid grid-cols-3 gap-2">
              {BOT_LEVELS.map((lvl) => (
                <button
                  key={lvl.value}
                  type="button"
                  onClick={() => setBotLevel(lvl.value)}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${
                    botLevel === lvl.value
                      ? "border-amber-400 bg-amber-400/10 text-amber-300"
                      : "border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500">{BOT_LEVELS.find((l) => l.value === botLevel)?.desc}</p>
          </div>

          {error && (
            <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-semibold text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 disabled:opacity-60 transition"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isTraining ? "Start Training" : "Create Room"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function CreateRoomPage() {
  return (
    <Suspense>
      <CreateRoomForm />
    </Suspense>
  );
}
