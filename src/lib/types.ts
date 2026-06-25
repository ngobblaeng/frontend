export type Suit = "spades" | "clubs" | "diamonds" | "hearts";
export type Rank =
  | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10"
  | "J" | "Q" | "K" | "A" | "2";

export interface Card {
  rank: Rank;
  suit: Suit;
  value: number;
}

export type ComboType =
  | "single"
  | "pair"
  | "triple"
  | "straight"
  | "fourOfAKind"
  | "threeConsecutivePairs"
  | "fourConsecutivePairs";

export interface Combo {
  type: ComboType;
  cards: Card[];
  power: number;
  length: number;
}

export type RoomStatus = "lobby" | "playing" | "finished";

export type GameType = "tienlen" | "katteh" | "sikukhmer";

export interface TrickPlay {
  playerId: string;
  card: Card;
}

export interface PublicPlayer {
  id: string;
  name: string;
  isBot: boolean;
  isHost: boolean;
  connected: boolean;
  cardCount: number;
  finishedAt: number | null;
  points?: number;
}

export interface PublicRoomState {
  roomCode: string;
  gameType: GameType;
  status: RoomStatus;
  hostId: string;
  players: PublicPlayer[];
  turnIndex: number;
  currentTurnPlayerId: string | null;
  lastCombo: Combo | null;
  lastPlayerId: string | null;
  playedHistory: { playerId: string; cards: Card[] }[];
  winnerOrder: string[];
  isTraining: boolean;
  currentTrick: TrickPlay[];
  leadSuit: Suit | null;
  sikuTable: Card[];
  sikuCenterRemaining: number;
}

export interface ChatMessage {
  name: string;
  text: string;
  at: number;
}
