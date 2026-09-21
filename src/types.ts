export type MatchStatus = 'live' | 'finished' | 'upcoming';
export type MatchResult = '1-0' | '0-1' | '1/2-1/2' | '*';

export type FideTitle = 'GM' | 'IM' | 'WGM' | 'FM' | 'WIM' | 'CM';

export interface Player {
  id: string;
  name: string;
  country: string;
  countryCode: string; // ISO 2-letter, e.g. "NO", "US", "IN", "CN", "FR"
  fideTitle: FideTitle;
  fideRating: number;
  liveRatingDiff: number; // e.g. +3.4 or -2.1
  peakRating: number;
  worldRank: number;
  avatarUrl?: string;
  form: ('W' | 'D' | 'L')[];
  birthYear: number;
}

export type MoveQuality = 'brilliant' | 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' | 'book';

export interface ChessMoveItem {
  moveNumber: number;
  ply: number;
  notation: string; // e.g. "Nf3", "e4", "Bxf7+"
  color: 'w' | 'b';
  eval: number; // Evaluation after this move (positive for white, negative for black)
  evalMate?: number; // Mate in X if applicable
  quality?: MoveQuality;
  fen: string;
  clockTimeSec: number; // Remaining time after move
  timeSpentSec: number;
  comment?: string;
  arrow?: { from: string; to: string };
}

export interface MatchStats {
  whiteAccuracy: number;
  blackAccuracy: number;
  whiteBrilliant: number;
  blackBrilliant: number;
  whiteBest: number;
  blackBest: number;
  whiteInaccuracies: number;
  blackInaccuracies: number;
  whiteMistakes: number;
  blackMistakes: number;
  whiteBlunders: number;
  blackBlunders: number;
  avgTimePerMoveSec: { white: number; black: number };
  whiteTimeTrouble: boolean;
  blackTimeTrouble: boolean;
  openingECO: string;
  openingName: string;
  openingVariation?: string;
  historicalWhiteWinPct: number;
  historicalDrawPct: number;
  historicalBlackWinPct: number;
}

export interface H2HGame {
  date: string;
  event: string;
  timeControl: string;
  whitePlayerId: string;
  whitePlayerName: string;
  blackPlayerId: string;
  blackPlayerName: string;
  result: '1-0' | '0-1' | '1/2-1/2';
  opening: string;
  totalMoves: number;
}

export interface H2HSummary {
  whiteWins: number;
  draws: number;
  blackWins: number;
  totalGames: number;
  recentGames: H2HGame[];
}

export interface LiveCommentary {
  id: string;
  moveNumber: number;
  color: 'w' | 'b';
  text: string;
  type: 'tactical' | 'time' | 'opening' | 'blunder' | 'result';
  timestamp: string;
}

export interface TournamentStanding {
  rank: number;
  playerId: string;
  player: Player;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  sonnebornBerger: number;
  performanceRating: number;
}

export interface Tournament {
  id: string;
  name: string;
  location: string;
  logoEmoji: string;
  timeControlCategory: 'Clásico' | 'Rápido' | 'Blitz';
  dates: string;
  totalRounds: number;
  currentRound: number;
  standings: TournamentStanding[];
}

export interface ChessMatch {
  id: string;
  tournamentId: string;
  tournamentName: string;
  round: number | string;
  board: number;
  timeControl: string; // e.g. "90m + 30s", "15m + 10s", "3m + 2s"
  timeControlCategory: 'Clásico' | 'Rápido' | 'Blitz';
  status: MatchStatus;
  result: MatchResult;
  resultDetail?: string; // e.g. "En juego", "Por jaque mate", "Abandono de Negras", "Tablas acordadas"
  whitePlayer: Player;
  blackPlayer: Player;
  whiteTimeLeftSec: number;
  blackTimeLeftSec: number;
  currentTurn: 'w' | 'b';
  currentMoveNumber: number;
  currentPly: number;
  currentFen: string;
  initialFen: string;
  currentEval: number;
  currentEvalMate?: number;
  winProbability: {
    white: number;
    draw: number;
    black: number;
  };
  moves: ChessMoveItem[];
  stats: MatchStats;
  h2h: H2HSummary;
  commentary: LiveCommentary[];
  isFavorite?: boolean;
}
