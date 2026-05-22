export interface OddsBet {
  id: number;
  event: string;
  team: string;
  bookmaker: string;
  market: string;
  odds: number;
  lastUpdate: string;
  live: boolean;
}