import { Card, Suit, TrickPlay } from "./types";

// Mirrors the backend's rank order — used only for client-side hints
// (which cards are highlighted as legal beats); the server is authoritative.
const KATTEH_RANK_ORDER = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

export function kattehRankValue(rank: Card["rank"]): number {
  return KATTEH_RANK_ORDER.indexOf(rank);
}

export function bestOfSuit(trick: TrickPlay[], suit: Suit): Card | null {
  const ofSuit = trick.filter((t) => !t.folded && t.card && t.card.suit === suit).map((t) => t.card as Card);
  if (ofSuit.length === 0) return null;
  return ofSuit.reduce((best, c) => (kattehRankValue(c.rank) > kattehRankValue(best.rank) ? c : best));
}

export function canBeatCurrent(card: Card, leadSuit: Suit | null, trick: TrickPlay[]): boolean {
  if (!leadSuit || trick.length === 0) return true;
  if (card.suit !== leadSuit) return false;
  const best = bestOfSuit(trick, leadSuit);
  if (!best) return true;
  return kattehRankValue(card.rank) > kattehRankValue(best.rank);
}
