import { PublicPlayer } from "@/lib/types";
import { Bot, Crown } from "lucide-react";

interface PlayerSeatProps {
  player: PublicPlayer;
  isTurn: boolean;
  isSelf: boolean;
  compact?: boolean;
}

const AVATAR_COLORS = [
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-indigo-500 to-violet-600",
  "from-rose-500 to-pink-600",
];

function colorFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function PlayerSeat({ player, isTurn, isSelf, compact }: PlayerSeatProps) {
  const initials = player.name.replace(/\(Bot\)/i, "").trim().slice(0, 2).toUpperCase();

  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 backdrop-blur transition-all ${
        isTurn
          ? "border-amber-400/60 bg-amber-400/10 shadow-lg shadow-amber-500/10"
          : "border-white/10 bg-slate-900/50"
      } ${compact ? "min-w-[120px]" : "min-w-[150px]"}`}
    >
      <div className="relative shrink-0">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${colorFor(
            player.id
          )} text-xs font-bold text-white ${isTurn ? "animate-turn-pulse" : ""}`}
        >
          {player.isBot ? <Bot className="h-4 w-4" /> : initials}
        </div>
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-950 ${
            player.connected ? "bg-emerald-400" : "bg-slate-500"
          }`}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 text-sm font-medium leading-tight truncate">
          <span className="truncate">{player.name}</span>
          {isSelf && <span className="text-amber-400 text-xs shrink-0">(You)</span>}
          {player.isHost && <Crown className="h-3 w-3 text-amber-400 shrink-0" />}
        </p>
        <p className="text-xs text-slate-400">
          {player.finishedAt ? "Finished 🎉" : `${player.cardCount} cards`}
        </p>
      </div>
    </div>
  );
}
