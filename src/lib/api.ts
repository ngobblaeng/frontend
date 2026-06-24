export interface LeaderboardEntry {
  playerName: string;
  wins: number;
  losses: number;
}

export interface MatchSummary {
  roomCode: string;
  gameType: string;
  players: { name: string; isBot: boolean; placement: number }[];
  winnerName: string;
  startedAt: string;
  endedAt: string;
}

function apiUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000";
  return `${base}/api${path}`;
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch(apiUrl("/leaderboard"));
  if (!res.ok) throw new Error("Failed to load leaderboard");
  return res.json();
}

export async function fetchMatches(limit = 20): Promise<MatchSummary[]> {
  const res = await fetch(apiUrl(`/matches?limit=${limit}`));
  if (!res.ok) throw new Error("Failed to load match history");
  return res.json();
}
