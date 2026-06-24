import { Card } from "@/lib/types";

const SUIT_SYMBOL: Record<Card["suit"], string> = {
  spades: "♠",
  clubs: "♣",
  diamonds: "♦",
  hearts: "♥",
};

const RED_SUITS = new Set(["diamonds", "hearts"]);

interface PlayingCardProps {
  card: Card;
  selected?: boolean;
  faceDown?: boolean;
  small?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function PlayingCard({ card, selected, faceDown, small, disabled, onClick }: PlayingCardProps) {
  const sizeClasses = small ? "w-9 h-[3.25rem] text-[11px]" : "w-14 sm:w-16 h-20 sm:h-[5.5rem] text-base";

  if (faceDown) {
    return (
      <div
        className={`${sizeClasses} rounded-lg bg-gradient-to-br from-blue-600 via-blue-700 to-blue-950 border border-blue-400/20 shadow-md ring-1 ring-black/20`}
      >
        <div className="h-full w-full rounded-lg border-2 border-blue-300/20 m-0.5" />
      </div>
    );
  }

  const colorClass = RED_SUITS.has(card.suit) ? "text-rose-600" : "text-slate-900";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative ${sizeClasses} rounded-lg bg-gradient-to-b from-white to-slate-50 flex flex-col items-center justify-center font-bold leading-none shadow-md transition-all duration-150 ${colorClass} ${
        selected
          ? "-translate-y-4 shadow-xl shadow-amber-500/30 ring-2 ring-amber-400"
          : disabled
            ? "opacity-60"
            : "hover:-translate-y-2 hover:shadow-lg ring-1 ring-black/5"
      } ${disabled && !selected ? "cursor-default" : "cursor-pointer"}`}
    >
      <span className="absolute top-1 left-1.5 text-[10px] sm:text-xs font-bold tracking-tight">
        {card.rank}
        <span className="ml-0.5">{SUIT_SYMBOL[card.suit]}</span>
      </span>
      <span className="text-xl sm:text-2xl">{SUIT_SYMBOL[card.suit]}</span>
    </button>
  );
}
