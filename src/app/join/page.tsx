"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, User, KeyRound } from "lucide-react";
import { getSocket } from "@/lib/socket";
import { useGameStore } from "@/store/gameStore";

function JoinRoomForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState(searchParams.get("code") ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const setPlayerName = useGameStore((s) => s.setPlayerName);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedCode = roomCode.trim().toUpperCase();
    if (trimmedName.length < 2) return setError("Name must be at least 2 characters");
    if (!/^[A-Z0-9]{4,8}$/.test(trimmedCode)) return setError("Enter a valid room code");
    setError(null);
    setLoading(true);

    const socket = getSocket();
    setPlayerName(trimmedName);

    socket.once("room:joined", ({ roomCode: code }: { roomCode: string }) => {
      router.push(`/room/${code}`);
    });
    socket.once("error:message", (msg: string) => {
      setError(msg);
      setLoading(false);
    });
    socket.emit("room:join", { roomCode: trimmedCode, name: trimmedName });
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
            <h1 className="text-2xl font-bold">Join Room</h1>
            <p className="text-sm text-slate-400 mt-1">Enter a room code shared by your host.</p>
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

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-400">Room code</span>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={8}
                placeholder="ABC123"
                className="w-full rounded-lg bg-slate-950/60 border border-slate-700 pl-9 pr-4 py-2.5 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 transition tracking-widest uppercase font-mono"
              />
            </div>
          </label>

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
            Join Room
          </button>
        </form>
      </div>
    </main>
  );
}

export default function JoinRoomPage() {
  return (
    <Suspense>
      <JoinRoomForm />
    </Suspense>
  );
}
