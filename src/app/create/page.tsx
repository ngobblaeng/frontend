"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { useGameStore } from "@/store/gameStore";

function CreateRoomForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isTraining = searchParams.get("training") === "1";
  const [name, setName] = useState("");
  const [botLevel, setBotLevel] = useState<"easy" | "medium" | "hard">("hard");
  const [error, setError] = useState<string | null>(null);
  const setPlayerName = useGameStore((s) => s.setPlayerName);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    setError(null);

    const socket = getSocket();
    setPlayerName(trimmed);

    socket.once("room:created", ({ roomCode }: { roomCode: string }) => {
      router.push(`/room/${roomCode}`);
    });
    socket.once("error:message", (msg: string) => setError(msg));
    socket.emit("room:create", { name: trimmed, isTraining, botLevel });
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-center">
          {isTraining ? "Solo Training" : "Create Room"}
        </h1>

        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          placeholder="Your display name"
          className="rounded-md bg-slate-900 border border-slate-700 px-4 py-2 outline-none focus:border-amber-400"
        />

        <label className="text-sm text-slate-400">
          Bot difficulty
          <select
            value={botLevel}
            onChange={(e) => setBotLevel(e.target.value as "easy" | "medium" | "hard")}
            className="mt-1 w-full rounded-md bg-slate-900 border border-slate-700 px-4 py-2 outline-none focus:border-amber-400"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard (default)</option>
          </select>
        </label>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          className="rounded-lg bg-amber-500 px-6 py-3 font-semibold text-slate-950 hover:bg-amber-400 transition"
        >
          {isTraining ? "Start Training" : "Create Room"}
        </button>
      </form>
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
