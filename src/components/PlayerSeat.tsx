import { PublicPlayer } from "@/lib/types";

interface PlayerSeatProps {
  player: PublicPlayer;
  isTurn: boolean;
  isSelf: boolean;
}

export function PlayerSeat({ player, isTurn, isSelf }: PlayerSeatProps) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 flex items-center gap-2 min-w-[140px] ${
        isTurn ? "border-amber-400 bg-amber-400/10" : "border-slate-700 bg-slate-900"
      }`}
    >
      <div className={`h-2 w-2 rounded-full ${player.connected ? "bg-emerald-400" : "bg-slate-600"}`} />
      <div className="flex-1">
        <p className="text-sm font-medium leading-tight">
          {player.name}
          {isSelf && " (You)"}
          {player.isHost && " 👑"}
        </p>
        <p className="text-xs text-slate-400">
          {player.finishedAt ? "Finished" : `${player.cardCount} cards`}
        </p>
      </div>
    </div>
  );
}
