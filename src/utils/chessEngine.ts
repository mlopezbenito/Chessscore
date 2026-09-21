import { MoveQuality } from '../types';

export type PieceSymbol = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';

export interface BoardSquare {
  square: string; // e.g. "e4"
  file: number; // 0 to 7
  rank: number; // 0 to 7
  piece: {
    type: PieceSymbol;
    color: PieceColor;
  } | null;
  isLight: boolean;
}

export function parseFenToBoard(fen: string): BoardSquare[][] {
  const board: BoardSquare[][] = [];
  const parts = fen.split(' ');
  const piecePlacement = parts[0] || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
  const ranks = piecePlacement.split('/');

  for (let rankIdx = 0; rankIdx < 8; rankIdx++) {
    const rankStr = ranks[rankIdx] || '8';
    const row: BoardSquare[] = [];
    let fileIdx = 0;

    for (let charIdx = 0; charIdx < rankStr.length; charIdx++) {
      const char = rankStr[charIdx];
      const emptyCount = parseInt(char, 10);

      if (!isNaN(emptyCount)) {
        for (let e = 0; e < emptyCount; e++) {
          const fileLetter = String.fromCharCode(97 + fileIdx);
          const rankNumber = 8 - rankIdx;
          const isLight = (rankIdx + fileIdx) % 2 === 0;
          row.push({
            square: `${fileLetter}${rankNumber}`,
            file: fileIdx,
            rank: rankIdx,
            piece: null,
            isLight,
          });
          fileIdx++;
        }
      } else {
        const fileLetter = String.fromCharCode(97 + fileIdx);
        const rankNumber = 8 - rankIdx;
        const isLight = (rankIdx + fileIdx) % 2 === 0;
        const isUpper = char === char.toUpperCase();
        const color: PieceColor = isUpper ? 'w' : 'b';
        const type = char.toLowerCase() as PieceSymbol;

        row.push({
          square: `${fileLetter}${rankNumber}`,
          file: fileIdx,
          rank: rankIdx,
          piece: { type, color },
          isLight,
        });
        fileIdx++;
      }
    }
    board.push(row);
  }

  return board;
}

const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

export interface CapturedPiecesInfo {
  whiteCaptured: { type: PieceSymbol; count: number }[];
  blackCaptured: { type: PieceSymbol; count: number }[];
  whiteScore: number;
  blackScore: number;
  materialAdvantage: number; // positive = white ahead, negative = black ahead
}

export function getCapturedPieces(fen: string): CapturedPiecesInfo {
  const initialCounts: Record<PieceColor, Record<PieceSymbol, number>> = {
    w: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
    b: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
  };

  const currentCounts: Record<PieceColor, Record<PieceSymbol, number>> = {
    w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
    b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
  };

  const placement = fen.split(' ')[0] || '';
  for (const char of placement) {
    if (/[a-zA-Z]/.test(char)) {
      const color: PieceColor = char === char.toUpperCase() ? 'w' : 'b';
      const type = char.toLowerCase() as PieceSymbol;
      if (currentCounts[color][type] !== undefined) {
        currentCounts[color][type]++;
      }
    }
  }

  // Black captured = initial White pieces - current White pieces
  const blackCapturedPieces: { type: PieceSymbol; count: number }[] = [];
  // White captured = initial Black pieces - current Black pieces
  const whiteCapturedPieces: { type: PieceSymbol; count: number }[] = [];

  let whitePointsCaptured = 0;
  let blackPointsCaptured = 0;

  (['q', 'r', 'b', 'n', 'p'] as PieceSymbol[]).forEach((type) => {
    const blackCapturedCount = Math.max(0, initialCounts.w[type] - currentCounts.w[type]);
    if (blackCapturedCount > 0) {
      blackCapturedPieces.push({ type, count: blackCapturedCount });
      blackPointsCaptured += blackCapturedCount * PIECE_VALUES[type];
    }

    const whiteCapturedCount = Math.max(0, initialCounts.b[type] - currentCounts.b[type]);
    if (whiteCapturedCount > 0) {
      whiteCapturedPieces.push({ type, count: whiteCapturedCount });
      whitePointsCaptured += whiteCapturedCount * PIECE_VALUES[type];
    }
  });

  return {
    whiteCaptured: whiteCapturedPieces,
    blackCaptured: blackCapturedPieces,
    whiteScore: whitePointsCaptured,
    blackScore: blackPointsCaptured,
    materialAdvantage: whitePointsCaptured - blackPointsCaptured,
  };
}

/**
 * Standard Stockfish WDL probability estimation formula
 */
export function calculateWinProbability(evalCentiPawnsOrScore: number, isMate = false, mateIn = 0): {
  white: number;
  draw: number;
  black: number;
} {
  if (isMate) {
    if (mateIn > 0) return { white: 99, draw: 1, black: 0 };
    if (mateIn < 0) return { white: 0, draw: 1, black: 99 };
  }

  const cp = evalCentiPawnsOrScore * 100;
  // Logistic function model similar to Lichess / Chess.com win probability
  const w = 1 / (1 + Math.pow(10, -cp / 400));
  const b = 1 / (1 + Math.pow(10, cp / 400));
  const d = Math.max(0, 1 - (Math.abs(w - 0.5) * 1.6));

  const rawWhite = w * (1 - d * 0.5);
  const rawBlack = b * (1 - d * 0.5);
  const rawDraw = d;

  const total = rawWhite + rawDraw + rawBlack;
  const whitePct = Math.round((rawWhite / total) * 100);
  const blackPct = Math.round((rawBlack / total) * 100);
  const drawPct = Math.max(0, 100 - whitePct - blackPct);

  return {
    white: whitePct,
    draw: drawPct,
    black: blackPct,
  };
}

export function formatClockTime(seconds: number): string {
  if (seconds <= 0) return '00:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function getQualityBadgeInfo(quality?: MoveQuality): {
  symbol: string;
  label: string;
  bg: string;
  text: string;
  dotColor: string;
} {
  switch (quality) {
    case 'brilliant':
      return { symbol: '!!', label: 'Brillante', bg: 'bg-teal-500/20 text-teal-300 border-teal-500/40', text: 'text-teal-400', dotColor: '#14b8a6' };
    case 'best':
      return { symbol: '!', label: 'Mejor', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', text: 'text-emerald-400', dotColor: '#10b981' };
    case 'book':
      return { symbol: '📖', label: 'Teoría', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40', text: 'text-blue-400', dotColor: '#3b82f6' };
    case 'inaccuracy':
      return { symbol: '?!', label: 'Imprecisión', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40', text: 'text-amber-400', dotColor: '#f59e0b' };
    case 'mistake':
      return { symbol: '?', label: 'Error', bg: 'bg-orange-500/20 text-orange-300 border-orange-500/40', text: 'text-orange-400', dotColor: '#f97316' };
    case 'blunder':
      return { symbol: '??', label: 'Grave Error', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40', text: 'text-rose-400', dotColor: '#ef4444' };
    default:
      return { symbol: '', label: 'Buena', bg: 'bg-slate-700/30 text-slate-300 border-slate-700', text: 'text-slate-300', dotColor: '#94a3b8' };
  }
}
