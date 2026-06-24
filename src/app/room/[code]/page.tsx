"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, LogOut, Trophy, Users } from "lucide-react";
import { getSocket } from "@/lib/socket";
import { useGameStore } from "@/store/gameStore";
import { PlayerSeat } from "@/components/PlayerSeat";
import { ChatBox } from "@/components/ChatBox";
import { PlayingCard } from "@/components/PlayingCard";
import { Card, ChatMessage, PublicRoomState } from "@/lib/types";

export default function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const {
    playerName,
    room,
    hand,
    selectedIndices,
    errorMessage,
    setRoom,
    setHand,
    toggleSelected,
    clearSelected,
    addChat,
    setError,
    reset,
  } = useGameStore();

  useEffect(() => {
    const socket = getSocket();
    const storedName =
      playerName || (typeof window !== "undefined" ? sessionStorage.getItem("playerName") ?? "" : "");

    if (typeof window !== "undefined" && storedName) {
      sessionStorage.setItem("playerName", storedName);
      sessionStorage.setItem("roomCode", code);
    }

    function onRoomState(state: PublicRoomState) {
      setRoom(state);
    }
    function onHandUpdate(cards: Card[]) {
      setHand(cards);
    }
    function onChatMessage(msg: ChatMessage) {
      addChat(msg);
    }
    function onChatSystem(text: string) {
      addChat({ name: "System", text, at: Date.now() });
    }
    function onErrorMessage(msg: string) {
      setError(msg);
      setTimeout(() => setError(null), 4000);
    }

    socket.on("room:state", onRoomState);
    socket.on("hand:update", onHandUpdate);
    socket.on("chat:message", onChatMessage);
    socket.on("chat:system", onChatSystem);
    socket.on("error:message", onErrorMessage);

    if (!room && storedName) {
      socket.emit("room:rejoin", { roomCode: code, name: storedName });
    }

    return () => {
      socket.off("room:state", onRoomState);
      socket.off("hand:update", onHandUpdate);
      socket.off("chat:message", onChatMessage);
      socket.off("chat:system", onChatSystem);
      socket.off("error:message", onErrorMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  function handleStart() {
    getSocket().emit("game:start");
  }

  function handleFillBots() {
    getSocket().emit("room:fillBots");
  }

  function handlePlay() {
    if (selectedIndices.length === 0) return;
    getSocket().emit("game:playCards", selectedIndices);
    clearSelected();
  }

  function handlePass() {
    getSocket().emit("game:pass");
  }

  function handleLeave() {
    getSocket().emit("room:leave");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("playerName");
      sessionStorage.removeItem("roomCode");
    }
    reset();
    router.push("/");
  }

  function handleCopyLink() {
    const link = `${window.location.origin}/join?code=${code}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  if (!room) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
        <p className="text-slate-400">Connecting to room {code}…</p>
      </main>
    );
  }

  const socketId = getSocket().id;
  const isHost = room.hostId === socketId;
  const isMyTurn = room.currentTurnPlayerId === socketId;

  return (
    <main className="flex-1 flex flex-col px-4 py-5 gap-5 max-w-5xl w-full mx-auto pb-28">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight">
            Room <span className="text-amber-400 font-mono">{room.roomCode}</span>
          </h1>
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition mt-0.5"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied!" : "Copy invite link"}
          </button>
        </div>
        <button
          onClick={handleLeave}
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-rose-400 transition"
        >
          <LogOut className="h-4 w-4" />
          Leave
        </button>
      </header>

      {errorMessage && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm px-3 py-2 animate-fade-up">
          {errorMessage}
        </div>
      )}

      <section className="flex flex-wrap gap-2.5">
        {room.players.map((p) => (
          <PlayerSeat key={p.id} player={p} isTurn={room.currentTurnPlayerId === p.id} isSelf={p.id === socketId} />
        ))}
      </section>

      {room.status === "lobby" && (
        <section className="flex flex-col items-center gap-5 py-12 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur">
          <Users className="h-8 w-8 text-slate-500" />
          <div className="text-center">
            <p className="font-medium text-slate-200">Waiting for players…</p>
            <p className="text-sm text-slate-500 mt-1">
              {room.players.length}/4 joined — share the room code to invite friends
            </p>
          </div>
          <div className="flex gap-3">
            {isHost && room.players.length < 4 && (
              <button
                onClick={handleFillBots}
                className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm font-medium hover:bg-slate-800 hover:border-slate-600 transition"
              >
                Fill with Bots
              </button>
            )}
            {isHost && (
              <button
                onClick={handleStart}
                disabled={room.players.length < 2}
                className="rounded-xl bg-amber-500 px-6 py-2.5 font-semibold text-slate-950 shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:shadow-none hover:bg-amber-400 transition"
              >
                Start Game
              </button>
            )}
          </div>
        </section>
      )}

      {room.status === "playing" && (
        <section className="flex flex-col gap-5">
          <div className="relative rounded-[2rem] border border-emerald-900/40 bg-[radial-gradient(ellipse_at_center,_#0f3a2c,_#06160f)] p-6 min-h-[140px] shadow-inner flex items-center justify-center">
            <p className="absolute top-3 left-4 text-[11px] uppercase tracking-wider text-emerald-300/60">
              Last play
            </p>
            {room.lastCombo ? (
              <div className="flex gap-1.5 animate-deal-in">
                {room.lastCombo.cards.map((c, i) => (
                  <PlayingCard key={i} card={c} small />
                ))}
              </div>
            ) : (
              <p className="text-emerald-200/50 text-sm">Trick is open — play any combo</p>
            )}
          </div>

          <div>
            <p className="text-xs text-slate-400 mb-2.5 flex items-center gap-1.5">
              {isMyTurn && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />}
              {isMyTurn ? "Your turn — select cards to play" : "Waiting for other players…"}
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {hand.map((c, i) => (
                <div key={i} className="animate-deal-in" style={{ animationDelay: `${i * 25}ms` }}>
                  <PlayingCard
                    card={c}
                    selected={selectedIndices.includes(i)}
                    disabled={!isMyTurn}
                    onClick={() => isMyTurn && toggleSelected(i)}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {room.status === "playing" && (
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-slate-950/90 backdrop-blur px-4 py-3">
          <div className="max-w-5xl mx-auto flex gap-3">
            <button
              onClick={handlePlay}
              disabled={!isMyTurn || selectedIndices.length === 0}
              className="flex-1 sm:flex-none rounded-xl bg-amber-500 px-8 py-3 font-semibold text-slate-950 shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:shadow-none hover:bg-amber-400 transition"
            >
              Play{selectedIndices.length > 0 ? ` (${selectedIndices.length})` : ""}
            </button>
            <button
              onClick={handlePass}
              disabled={!isMyTurn || !room.lastCombo}
              className="flex-1 sm:flex-none rounded-xl border border-slate-700 px-8 py-3 font-medium disabled:opacity-40 hover:bg-slate-800 transition"
            >
              Pass
            </button>
          </div>
        </div>
      )}

      {room.status === "finished" && (
        <section className="flex flex-col items-center gap-5 py-12 rounded-2xl border border-amber-400/20 bg-slate-900/40 backdrop-blur animate-fade-up">
          <Trophy className="h-10 w-10 text-amber-400" />
          <h2 className="text-2xl font-bold">Game Over</h2>
          <ol className="flex flex-col gap-1.5 text-center">
            {room.winnerOrder.map((id, i) => {
              const p = room.players.find((pl) => pl.id === id);
              return (
                <li key={id} className={`text-sm ${i === 0 ? "text-amber-300 font-semibold text-base" : "text-slate-300"}`}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "•"} {p?.name ?? id}
                </li>
              );
            })}
          </ol>
          {isHost && (
            <button
              onClick={handleStart}
              className="rounded-xl bg-amber-500 px-6 py-2.5 font-semibold text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition"
            >
              Play Again
            </button>
          )}
        </section>
      )}

      <ChatBox />
    </main>
  );
}
