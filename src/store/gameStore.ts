import { create } from "zustand";
import { Card, ChatMessage, PublicRoomState } from "@/lib/types";

interface GameStore {
  playerName: string;
  roomCode: string | null;
  room: PublicRoomState | null;
  hand: Card[];
  selectedIndices: number[];
  chat: ChatMessage[];
  errorMessage: string | null;

  setPlayerName: (name: string) => void;
  setRoomCode: (code: string | null) => void;
  setRoom: (room: PublicRoomState | null) => void;
  setHand: (hand: Card[]) => void;
  toggleSelected: (index: number) => void;
  clearSelected: () => void;
  addChat: (msg: ChatMessage) => void;
  setError: (msg: string | null) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  playerName: "",
  roomCode: null,
  room: null,
  hand: [],
  selectedIndices: [],
  chat: [],
  errorMessage: null,

  setPlayerName: (name) => set({ playerName: name }),
  setRoomCode: (code) => set({ roomCode: code }),
  setRoom: (room) => set({ room }),
  setHand: (hand) => set({ hand, selectedIndices: [] }),
  toggleSelected: (index) =>
    set((s) => ({
      selectedIndices: s.selectedIndices.includes(index)
        ? s.selectedIndices.filter((i) => i !== index)
        : [...s.selectedIndices, index],
    })),
  clearSelected: () => set({ selectedIndices: [] }),
  addChat: (msg) => set((s) => ({ chat: [...s.chat, msg].slice(-100) })),
  setError: (msg) => set({ errorMessage: msg }),
  reset: () => set({ roomCode: null, room: null, hand: [], selectedIndices: [], chat: [] }),
}));
