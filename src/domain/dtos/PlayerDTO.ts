export interface PlayerStatsDTO {
  nickname: string;
  wins: number;
  losses: number;
  totalBattles: number;
  winRate: number;
}

export interface RegisterResponseDTO {
  player: PlayerStatsDTO;
  isNewPlayer: boolean;
}
