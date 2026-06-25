import * as deck from "@letele/playing-cards";
import { Card } from "@/lib/types";

const SUIT_LETTER: Record<Card["suit"], string> = {
  spades: "S",
  clubs: "C",
  diamonds: "D",
  hearts: "H",
};

function rankSuffix(rank: Card["rank"]): string {
  if (rank === "A") return "a";
  if (rank === "J") return "j";
  if (rank === "Q") return "q";
  if (rank === "K") return "k";
  return rank;
}

function cardComponentName(card: Card): string {
  return `${SUIT_LETTER[card.suit]}${rankSuffix(card.rank)}`;
}

interface PlayingCardProps {
  card?: Card | null;
  selected?: boolean;
  faceDown?: boolean;
  small?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function PlayingCard({ card, selected, faceDown, small, disabled, onClick }: PlayingCardProps) {
  const sizeClasses = small ? "w-10 h-[3.75rem]" : "w-16 sm:w-[4.5rem] h-[5.7rem] sm:h-[6.5rem]";

  if (faceDown || !card) {
    const Back = deck.B1;
    return (
      <div className={`${sizeClasses} rounded-lg shadow-md ring-1 ring-black/20 overflow-hidden`}>
        <Back style={{ height: "100%", width: "100%" }} />
      </div>
    );
  }

  const Face = deck[cardComponentName(card)];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative ${sizeClasses} rounded-lg bg-white shadow-md transition-all duration-150 overflow-hidden ${
        selected
          ? "-translate-y-4 shadow-xl shadow-amber-500/30 ring-2 ring-amber-400"
          : disabled
            ? "opacity-60"
            : "hover:-translate-y-2 hover:shadow-lg ring-1 ring-black/10"
      } ${disabled && !selected ? "cursor-default" : "cursor-pointer"}`}
    >
      <Face style={{ height: "100%", width: "100%" }} />
    </button>
  );
}
