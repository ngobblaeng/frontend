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
  onClick?: () => void;
}

export function PlayingCard({ card, selected, faceDown, small, onClick }: PlayingCardProps) {
  const sizeClasses = small ? "w-9 h-12 text-xs" : "w-14 h-20 text-base";

  if (faceDown) {
    return (
      <div
        className={`${sizeClasses} rounded-md bg-gradient-to-br from-blue-700 to-blue-900 border border-blue-950 shadow-sm`}
      />
    );
  }

  const colorClass = RED_SUITS.has(card.suit) ? "text-red-600" : "text-slate-900";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${sizeClasses} rounded-md bg-white border-2 flex flex-col items-center justify-center font-bold leading-none shadow-sm transition-transform ${colorClass} ${
        selected ? "-translate-y-3 border-amber-400 ring-2 ring-amber-300" : "border-slate-300 hover:-translate-y-1"
      }`}
    >
      <span>{card.rank}</span>
      <span className="text-lg">{SUIT_SYMBOL[card.suit]}</span>
    </button>
  );
}
