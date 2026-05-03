export interface LeaderboardRow {
  rank: number;
  userId: string;
  username: string;
  score: number;
}

export interface RecentWin {
  id: string;
  username: string;
  winAmount: string;
  multiplier: string;
  createdAt: string;
}

export interface LeaderboardResponse {
  leaders: LeaderboardRow[];
  recentWins: RecentWin[];
}
