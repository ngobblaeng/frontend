"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { useGameStore } from "@/store/gameStore";
import { PlayerSeat } from "@/components/PlayerSeat";
import { ChatBox } from "@/components/ChatBox";
import { PlayingCard } from "@/components/PlayingCard";
import { Card, ChatMessage, PublicRoomState } from "@/lib/types";

export default function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
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

    // if we land here directly (e.g. page refresh) without an active room
    // in the store, try to rejoin using the name saved for this session
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

  if (!room) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-slate-400">Connecting to room {code}…</p>
      </main>
    );
  }

  const socketId = getSocket().id;
  const isHost = room.hostId === socketId;
  const isMyTurn = room.currentTurnPlayerId === socketId;

  return (
    <main className="flex-1 flex flex-col px-4 py-6 gap-6 max-w-5xl w-full mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Room {room.roomCode}</h1>
          <p className="text-xs text-slate-400">
            Invite link: {typeof window !== "undefined" ? `${window.location.origin}/join?code=${room.roomCode}` : room.roomCode}
          </p>
        </div>
        <button onClick={handleLeave} className="text-sm text-slate-400 hover:text-red-400">
          Leave Room
        </button>
      </header>

      {errorMessage && (
        <div className="rounded-md bg-red-500/10 border border-red-500/40 text-red-300 text-sm px-3 py-2">
          {errorMessage}
        </div>
      )}

      <section className="flex flex-wrap gap-3">
        {room.players.map((p) => (
          <PlayerSeat key={p.id} player={p} isTurn={room.currentTurnPlayerId === p.id} isSelf={p.id === socketId} />
        ))}
      </section>

      {room.status === "lobby" && (
        <section className="flex flex-col items-center gap-4 py-10">
          <p className="text-slate-400">Waiting for players…</p>
          <div className="flex gap-3">
            {isHost && room.players.length < 4 && (
              <button onClick={handleFillBots} className="rounded-md border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800">
                Fill with Bots
              </button>
            )}
            {isHost && (
              <button
                onClick={handleStart}
                disabled={room.players.length < 2}
                className="rounded-md bg-amber-500 px-6 py-2 font-semibold text-slate-950 disabled:opacity-40 hover:bg-amber-400"
              >
                Start Game
              </button>
            )}
          </div>
        </section>
      )}

      {room.status === "playing" && (
        <section className="flex flex-col gap-4">
          <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4 min-h-[100px]">
            <p className="text-xs text-slate-500 mb-2">Last play</p>
            <div className="flex gap-1">
              {room.lastCombo?.cards.map((c, i) => (
                <PlayingCard key={i} card={c} small />
              ))}
              {!room.lastCombo && <p className="text-slate-500 text-sm">Trick is open — play any combo</p>}
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-2">
              {isMyTurn ? "Your turn — select cards to play" : "Waiting for other players…"}
            </p>
            <div className="flex gap-1 flex-wrap">
              {hand.map((c, i) => (
                <PlayingCard
                  key={i}
                  card={c}
                  selected={selectedIndices.includes(i)}
                  onClick={() => isMyTurn && toggleSelected(i)}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handlePlay}
              disabled={!isMyTurn || selectedIndices.length === 0}
              className="rounded-md bg-amber-500 px-6 py-2 font-semibold text-slate-950 disabled:opacity-40 hover:bg-amber-400"
            >
              Play
            </button>
            <button
              onClick={handlePass}
              disabled={!isMyTurn || !room.lastCombo}
              className="rounded-md border border-slate-600 px-6 py-2 disabled:opacity-40 hover:bg-slate-800"
            >
              Pass
            </button>
          </div>
        </section>
      )}

      {room.status === "finished" && (
        <section className="flex flex-col items-center gap-4 py-10">
          <h2 className="text-2xl font-bold">Game Over</h2>
          <ol className="text-slate-300">
            {room.winnerOrder.map((id, i) => {
              const p = room.players.find((pl) => pl.id === id);
              return (
                <li key={id}>
                  {i + 1}. {p?.name ?? id}
                </li>
              );
            })}
          </ol>
          {isHost && (
            <button onClick={handleStart} className="rounded-md bg-amber-500 px-6 py-2 font-semibold text-slate-950 hover:bg-amber-400">
              Play Again
            </button>
          )}
        </section>
      )}

      <ChatBox />
    </main>
  );
}
