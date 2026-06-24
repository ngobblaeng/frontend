"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { useGameStore } from "@/store/gameStore";

function JoinRoomForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState(searchParams.get("code") ?? "");
  const [error, setError] = useState<string | null>(null);
  const setPlayerName = useGameStore((s) => s.setPlayerName);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedCode = roomCode.trim().toUpperCase();
    if (trimmedName.length < 2) return setError("Name must be at least 2 characters");
    if (!/^[A-Z0-9]{4,8}$/.test(trimmedCode)) return setError("Enter a valid room code");
    setError(null);

    const socket = getSocket();
    setPlayerName(trimmedName);

    socket.once("room:joined", ({ roomCode: code }: { roomCode: string }) => {
      router.push(`/room/${code}`);
    });
    socket.once("error:message", (msg: string) => setError(msg));
    socket.emit("room:join", { roomCode: trimmedCode, name: trimmedName });
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-center">Join Room</h1>

        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          placeholder="Your display name"
          className="rounded-md bg-slate-900 border border-slate-700 px-4 py-2 outline-none focus:border-amber-400"
        />

        <input
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          maxLength={8}
          placeholder="Room code"
          className="rounded-md bg-slate-900 border border-slate-700 px-4 py-2 outline-none focus:border-amber-400 tracking-widest uppercase"
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          className="rounded-lg bg-amber-500 px-6 py-3 font-semibold text-slate-950 hover:bg-amber-400 transition"
        >
          Join Room
        </button>
      </form>
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
