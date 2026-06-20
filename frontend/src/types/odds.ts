export interface OddsBet {
  id: number;
  sport: string;
  event: string;
  team: string;
  bookmaker: string;
  market: string;
  odds: number;
  lastUpdate: string;
  commenceTime: string;
  live: boolean;
}

export interface EventOdds {
  id: string;
  sportTitle: string;
  commenceTime: string;
  homeTeam: string;
  awayTeam: string;
  bookmakers: BookmakerOdds[];
}

export interface BookmakerOdds {
  title: string;
  outcomes: OutcomeOdds[];
}

export interface OutcomeOdds {
  name: string;
  price: number;
}

export interface OddsPayload {
  topOdds: OddsBet[];
  events: EventOdds[];
}