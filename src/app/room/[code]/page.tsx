"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Copy, LogOut, Trophy, Users } from "lucide-react";
import { getSocket } from "@/lib/socket";
import { useGameStore } from "@/store/gameStore";
import { PlayerSeat } from "@/components/PlayerSeat";
import { ChatBox } from "@/components/ChatBox";
import { PlayingCard } from "@/components/PlayingCard";
import { SoundToggle } from "@/components/SoundToggle";
import { Card, ChatMessage, PublicRoomState } from "@/lib/types";
import { playCardPlay, playChat, playError, playPass, playSelect, playWin } from "@/lib/sound";

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

  const lastStatusRef = useRef<string | null>(null);

  useEffect(() => {
    const socket = getSocket();
    const storedName =
      playerName || (typeof window !== "undefined" ? sessionStorage.getItem("playerName") ?? "" : "");

    if (typeof window !== "undefined" && storedName) {
      sessionStorage.setItem("playerName", storedName);
      sessionStorage.setItem("roomCode", code);
    }

    function onRoomState(state: PublicRoomState) {
      if (state.status === "finished" && lastStatusRef.current !== "finished") {
        playWin();
      }
      lastStatusRef.current = state.status;
      setRoom(state);
    }
    function onHandUpdate(cards: Card[]) {
      setHand(cards);
    }
    function onChatMessage(msg: ChatMessage) {
      addChat(msg);
      playChat();
    }
    function onChatSystem(text: string) {
      addChat({ name: "System", text, at: Date.now() });
    }
    function onErrorMessage(msg: string) {
      setError(msg);
      playError();
      // if we still have no room (e.g. rejoining a room that no longer
      // exists), keep the message visible instead of reverting to an
      // infinite "Connecting…" spinner, and drop the stale session so a
      // refresh doesn't just retry the same dead room
      if (useGameStore.getState().room) {
        setTimeout(() => setError(null), 4000);
      } else if (typeof window !== "undefined") {
        sessionStorage.removeItem("playerName");
        sessionStorage.removeItem("roomCode");
      }
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
    playCardPlay();
  }

  function handlePass() {
    getSocket().emit("game:pass");
    playPass();
  }

  function handlePlayKatTehCard(index: number) {
    getSocket().emit("game:playCards", [index]);
    playCardPlay();
  }

  function handlePlaySikuCard(index: number) {
    getSocket().emit("game:playCards", [index]);
    playCardPlay();
  }

  function handleSelectCard(index: number) {
    toggleSelected(index);
    playSelect();
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
    if (errorMessage) {
      return (
        <main className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg px-4 py-2.5 max-w-sm">
            {errorMessage}
          </p>
          <Link
            href="/"
            className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium hover:bg-slate-800 transition"
          >
            Back to home
          </Link>
        </main>
      );
    }
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
  const isKatTeh = room.gameType === "katteh";
  const isSiku = room.gameType === "sikukhmer";

  return (
    <main
      className={`flex-1 flex flex-col px-3 sm:px-4 py-3 sm:py-5 gap-3 sm:gap-5 max-w-5xl w-full mx-auto ${
        isKatTeh || isSiku
          ? "pb-6"
          : "pb-[calc(5.5rem+env(safe-area-inset-bottom))] landscape:pb-[calc(4.5rem+env(safe-area-inset-bottom))]"
      }`}
    >
      <header className="flex items-center justify-between gap-3 shrink-0">
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold tracking-tight truncate">
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
        <div className="flex items-center gap-2 shrink-0">
          <SoundToggle />
          <button
            onClick={handleLeave}
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-rose-400 transition"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </header>

      {errorMessage && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm px-3 py-2 animate-fade-up shrink-0">
          {errorMessage}
        </div>
      )}

      <section className="flex gap-2 sm:gap-2.5 overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap pb-1 shrink-0 [scrollbar-width:thin]">
        {room.players.map((p) => (
          <div key={p.id} className="shrink-0">
            <PlayerSeat
              player={p}
              isTurn={room.currentTurnPlayerId === p.id}
              isSelf={p.id === socketId}
              compact
              showPoints={isKatTeh || isSiku}
            />
          </div>
        ))}
      </section>

      {room.status === "lobby" && (
        <section className="flex flex-col items-center gap-4 sm:gap-5 py-8 sm:py-12 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur">
          <Users className="h-7 w-7 sm:h-8 sm:w-8 text-slate-500" />
          <div className="text-center px-4">
            <p className="font-medium text-slate-200">Waiting for players…</p>
            <p className="text-sm text-slate-500 mt-1">
              {room.players.length}/4 joined — share the room code to invite friends
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 px-4">
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

      {room.status === "playing" && isKatTeh && (
        <section className="flex flex-col gap-3 sm:gap-5 flex-1 min-h-0 pb-4">
          <div className="relative rounded-2xl sm:rounded-[2rem] border border-emerald-900/40 bg-[radial-gradient(ellipse_at_center,_#0f3a2c,_#06160f)] p-4 sm:p-6 min-h-[96px] sm:min-h-[140px] shadow-inner flex flex-col items-center justify-center shrink-0 gap-2">
            <p className="absolute top-2.5 left-3 sm:top-3 sm:left-4 text-[10px] sm:text-[11px] uppercase tracking-wider text-emerald-300/60">
              Current trick{room.leadSuit ? ` — leading suit: ${room.leadSuit}` : ""}
            </p>
            {room.currentTrick.length > 0 ? (
              <div className="flex gap-2 sm:gap-3 animate-deal-in flex-wrap justify-center">
                {room.currentTrick.map((t, i) => {
                  const p = room.players.find((pl) => pl.id === t.playerId);
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <PlayingCard card={t.card} small />
                      <span className="text-[10px] text-emerald-200/60 truncate max-w-[3.5rem]">{p?.name}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-emerald-200/50 text-sm">New trick — lead any card</p>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-xs text-slate-400 mb-2 sm:mb-2.5 flex items-center gap-1.5 px-1">
              {isMyTurn && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />}
              {isMyTurn
                ? room.leadSuit
                  ? `Your turn — follow ${room.leadSuit} if you can (tap a card to play it)`
                  : "Your turn — lead any card"
                : "Waiting for other players…"}
            </p>
            <div className="flex gap-1 sm:gap-1.5 overflow-x-auto overscroll-x-contain -mx-3 px-3 pb-2 sm:flex-wrap sm:overflow-x-visible sm:mx-0 sm:px-0 justify-start sm:justify-center [scrollbar-width:thin]">
              {hand.map((c, i) => (
                <div key={i} className="animate-deal-in shrink-0" style={{ animationDelay: `${i * 25}ms` }}>
                  <PlayingCard card={c} disabled={!isMyTurn} onClick={() => isMyTurn && handlePlayKatTehCard(i)} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {room.status === "playing" && isSiku && (
        <section className="flex flex-col gap-3 sm:gap-5 flex-1 min-h-0 pb-4">
          <div className="relative rounded-2xl sm:rounded-[2rem] border border-emerald-900/40 bg-[radial-gradient(ellipse_at_center,_#0f3a2c,_#06160f)] p-4 sm:p-6 min-h-[96px] sm:min-h-[140px] shadow-inner flex flex-col items-center justify-center shrink-0 gap-2">
            <p className="absolute top-2.5 left-3 sm:top-3 sm:left-4 text-[10px] sm:text-[11px] uppercase tracking-wider text-emerald-300/60">
              Table — {room.sikuCenterRemaining} left in center pile
            </p>
            {room.sikuTable.length > 0 ? (
              <div className="flex gap-1 sm:gap-1.5 flex-wrap justify-center animate-deal-in">
                {room.sikuTable.map((c, i) => (
                  <PlayingCard key={i} card={c} small />
                ))}
              </div>
            ) : (
              <p className="text-emerald-200/50 text-sm">No loose cards on the table yet</p>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-xs text-slate-400 mb-2 sm:mb-2.5 flex items-center gap-1.5 px-1">
              {isMyTurn && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />}
              {isMyTurn
                ? "Your turn — tap a card to drop it"
                : "Waiting for other players…"}
            </p>
            <div className="flex gap-1 sm:gap-1.5 overflow-x-auto overscroll-x-contain -mx-3 px-3 pb-2 sm:flex-wrap sm:overflow-x-visible sm:mx-0 sm:px-0 justify-start sm:justify-center [scrollbar-width:thin]">
              {hand.map((c, i) => (
                <div key={i} className="animate-deal-in shrink-0" style={{ animationDelay: `${i * 25}ms` }}>
                  <PlayingCard card={c} disabled={!isMyTurn} onClick={() => isMyTurn && handlePlaySikuCard(i)} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {room.status === "playing" && !isKatTeh && !isSiku && (
        <section className="flex flex-col gap-3 sm:gap-5 flex-1 min-h-0">
          <div className="relative rounded-2xl sm:rounded-[2rem] border border-emerald-900/40 bg-[radial-gradient(ellipse_at_center,_#0f3a2c,_#06160f)] p-4 sm:p-6 min-h-[96px] sm:min-h-[140px] shadow-inner flex items-center justify-center shrink-0">
            <p className="absolute top-2.5 left-3 sm:top-3 sm:left-4 text-[10px] sm:text-[11px] uppercase tracking-wider text-emerald-300/60">
              Last play
            </p>
            {room.lastCombo ? (
              <div className="flex gap-1 sm:gap-1.5 animate-deal-in">
                {room.lastCombo.cards.map((c, i) => (
                  <PlayingCard key={i} card={c} small />
                ))}
              </div>
            ) : (
              <p className="text-emerald-200/50 text-sm">Trick is open — play any combo</p>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-xs text-slate-400 mb-2 sm:mb-2.5 flex items-center gap-1.5 px-1">
              {isMyTurn && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />}
              {isMyTurn ? "Your turn — select cards to play" : "Waiting for other players…"}
            </p>
            <div className="flex gap-1 sm:gap-1.5 overflow-x-auto overscroll-x-contain -mx-3 px-3 pb-2 sm:flex-wrap sm:overflow-x-visible sm:mx-0 sm:px-0 justify-start sm:justify-center [scrollbar-width:thin]">
              {hand.map((c, i) => (
                <div key={i} className="animate-deal-in shrink-0" style={{ animationDelay: `${i * 25}ms` }}>
                  <PlayingCard
                    card={c}
                    selected={selectedIndices.includes(i)}
                    disabled={!isMyTurn}
                    onClick={() => isMyTurn && handleSelectCard(i)}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {room.status === "playing" && !isKatTeh && !isSiku && (
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-slate-950/90 backdrop-blur px-3 sm:px-4 py-2.5 sm:py-3 pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
          <div className="max-w-5xl mx-auto flex gap-2.5 sm:gap-3">
            <button
              onClick={handlePlay}
              disabled={!isMyTurn || selectedIndices.length === 0}
              className="flex-1 sm:flex-none rounded-xl bg-amber-500 px-6 sm:px-8 py-2.5 sm:py-3 font-semibold text-slate-950 shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:shadow-none hover:bg-amber-400 transition"
            >
              Play{selectedIndices.length > 0 ? ` (${selectedIndices.length})` : ""}
            </button>
            <button
              onClick={handlePass}
              disabled={!isMyTurn || !room.lastCombo}
              className="flex-1 sm:flex-none rounded-xl border border-slate-700 px-6 sm:px-8 py-2.5 sm:py-3 font-medium disabled:opacity-40 hover:bg-slate-800 transition"
            >
              Pass
            </button>
          </div>
        </div>
      )}

      {room.status === "finished" && (
        <section className="flex flex-col items-center gap-4 sm:gap-5 py-8 sm:py-12 rounded-2xl border border-amber-400/20 bg-slate-900/40 backdrop-blur animate-fade-up px-4">
          <Trophy className="h-9 w-9 sm:h-10 sm:w-10 text-amber-400" />
          <h2 className="text-xl sm:text-2xl font-bold">Game Over</h2>
          <ol className="flex flex-col gap-1.5 text-center">
            {room.winnerOrder.map((id, i) => {
              const p = room.players.find((pl) => pl.id === id);
              return (
                <li key={id} className={`text-sm ${i === 0 ? "text-amber-300 font-semibold text-base" : "text-slate-300"}`}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "•"} {p?.name ?? id}
                  {isKatTeh && ` — ${p?.points ?? 0} pts`}
                  {isSiku && ` — ${p?.points ?? 0} pairs`}
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
