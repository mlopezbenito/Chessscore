import React, { useState, useEffect } from 'react';
import { ChessMatch, ChessMoveItem } from '../types';
import { parseFenToBoard, getCapturedPieces, PieceColor, PieceSymbol } from '../utils/chessEngine';
import { playMoveSound, playCaptureSound } from '../utils/audio';
import {
  ChevronFirst,
  ChevronLeft,
  ChevronRight,
  ChevronLast,
  RotateCcw,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  Layers,
} from 'lucide-react';

interface ChessBoardViewProps {
  match: ChessMatch;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenAiAnalysis: () => void;
}

// Crisp SVGs for chess pieces
const CHESS_PIECE_SVGS: Record<string, string> = {
  wp: '♙',
  wn: '♘',
  wb: '♗',
  wr: '♖',
  wq: '♕',
  wk: '♔',
  bp: '♟',
  bn: '♞',
  bb: '♝',
  br: '♜',
  bq: '♛',
  bk: '♚',
};

export const ChessBoardView: React.FC<ChessBoardViewProps> = ({
  match,
  soundEnabled,
  onToggleSound,
  onOpenAiAnalysis,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeMoveIndex, setActiveMoveIndex] = useState<number>(match.moves.length - 1);
  const [isPlayingReplay, setIsPlayingReplay] = useState(false);

  // Sync activeMoveIndex when new moves arrive in the live match
  useEffect(() => {
    if (!isPlayingReplay) {
      setActiveMoveIndex(match.moves.length - 1);
    }
  }, [match.moves.length, isPlayingReplay]);

  // Handle auto-replay loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlayingReplay) {
      timer = setInterval(() => {
        setActiveMoveIndex((prev) => {
          if (prev >= match.moves.length - 1) {
            setIsPlayingReplay(false);
            return prev;
          }
          const nextIdx = prev + 1;
          const move = match.moves[nextIdx];
          if (move) {
            if (move.notation.includes('x')) {
              playCaptureSound(soundEnabled);
            } else {
              playMoveSound(soundEnabled);
            }
          }
          return nextIdx;
        });
      }, 1200);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlayingReplay, match.moves, soundEnabled]);

  // Current displayed FEN
  const currentMove = match.moves[activeMoveIndex];
  const displayFen = currentMove ? currentMove.fen : match.currentFen;
  const board = parseFenToBoard(displayFen);
  const captured = getCapturedPieces(displayFen);

  // Current displayed evaluation
  const displayedEval = currentMove ? currentMove.eval : match.currentEval;

  // Calculate Eval Bar Percentage (Stockfish range -10 to +10 mapped smoothly)
  const evalClamped = Math.max(-8, Math.min(8, displayedEval));
  // At 0 eval, white is 50%. At +8, white is 95%. At -8, white is 5%.
  const whiteHeightPct = Math.round(50 + (evalClamped / 8) * 45);

  // Calculate last move squares for highlighting
  const lastMoveNotation = currentMove?.notation || '';

  // Jump to specific move
  const handleJumpToMove = (index: number) => {
    setIsPlayingReplay(false);
    setActiveMoveIndex(index);
    const move = match.moves[index];
    if (move) {
      if (move.notation.includes('x')) {
        playCaptureSound(soundEnabled);
      } else {
        playMoveSound(soundEnabled);
      }
    }
  };

  const handlePrev = () => {
    setIsPlayingReplay(false);
    if (activeMoveIndex > 0) {
      handleJumpToMove(activeMoveIndex - 1);
    }
  };

  const handleNext = () => {
    setIsPlayingReplay(false);
    if (activeMoveIndex < match.moves.length - 1) {
      handleJumpToMove(activeMoveIndex + 1);
    }
  };

  const handleFirst = () => {
    setIsPlayingReplay(false);
    handleJumpToMove(0);
  };

  const handleLast = () => {
    setIsPlayingReplay(false);
    handleJumpToMove(match.moves.length - 1);
  };

  // Render square files and ranks considering flip
  const displayBoard = isFlipped
    ? [...board].reverse().map((row) => [...row].reverse())
    : board;

  const fileLabels = isFlipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const rankLabels = isFlipped ? ['1', '2', '3', '4', '5', '6', '7', '8'] : ['8', '7', '6', '5', '4', '3', '2', '1'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* Left / Center: The Chessboard and Eval Bar (Cols 1-7) */}
      <div className="lg:col-span-7 flex flex-col gap-3">
        {/* Top Player (Black by default, White if flipped) */}
        <div className="flex items-center justify-between px-2 py-1 bg-slate-950/60 rounded-lg border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-3.5 h-3.5 rounded-sm border ${
              isFlipped ? 'bg-white border-slate-300 text-black' : 'bg-slate-900 border-slate-700 text-white'
            } flex items-center justify-center text-[10px] font-bold`}>
              {isFlipped ? '♔' : '♚'}
            </span>
            <span className="font-bold text-slate-200">
              {isFlipped ? match.whitePlayer.name : match.blackPlayer.name}
            </span>
            <span className="text-slate-400 font-mono">
              ({isFlipped ? match.whitePlayer.fideRating : match.blackPlayer.fideRating})
            </span>
          </div>

          {/* Captured pieces by top player */}
          <div className="flex items-center gap-1 font-mono text-sm">
            {(isFlipped ? captured.blackCaptured : captured.whiteCaptured).map((item, idx) => (
              <span key={idx} className="text-slate-300 select-none">
                {CHESS_PIECE_SVGS[`${isFlipped ? 'w' : 'b'}${item.type}`].repeat(item.count)}
              </span>
            ))}
            {(isFlipped ? captured.materialAdvantage < 0 : captured.materialAdvantage > 0) && (
              <span className="text-xs font-bold text-emerald-400 ml-1">
                +{Math.abs(captured.materialAdvantage)}
              </span>
            )}
          </div>
        </div>

        {/* Board & Eval Bar Container */}
        <div className="flex items-stretch gap-2 sm:gap-3 justify-center">
          {/* Stockfish Live Evaluation Bar */}
          <div className="flex flex-col items-center w-8 sm:w-9 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-md relative select-none">
            {/* Black Advantage Fill (Top) */}
            <div
              className="w-full bg-slate-900 transition-all duration-300 relative flex items-start justify-center pt-1"
              style={{ height: `${100 - whiteHeightPct}%` }}
            >
              {displayedEval < 0 && (
                <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-300">
                  {Math.abs(displayedEval).toFixed(1)}
                </span>
              )}
            </div>

            {/* White Advantage Fill (Bottom) */}
            <div
              className="w-full bg-white transition-all duration-300 relative flex items-end justify-center pb-1"
              style={{ height: `${whiteHeightPct}%` }}
            >
              {displayedEval >= 0 && (
                <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-900">
                  +{displayedEval.toFixed(1)}
                </span>
              )}
            </div>
          </div>

          {/* 8x8 Board Container */}
          <div className="relative aspect-square w-full max-w-[480px] rounded-xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-slate-950 select-none">
            <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
              {displayBoard.map((row, rowIdx) =>
                row.map((sq, colIdx) => {
                  const isLight = sq.isLight;
                  const piece = sq.piece;
                  const pieceKey = piece ? `${piece.color}${piece.type}` : null;
                  const isLastMoveSquare =
                    lastMoveNotation &&
                    (sq.square === lastMoveNotation.replace(/[+#x?!]/g, '').slice(-2));

                  return (
                    <div
                      key={sq.square}
                      className={`relative flex items-center justify-center cursor-pointer transition-colors duration-150 ${
                        isLight
                          ? 'bg-[#e2d6b5] text-slate-900'
                          : 'bg-[#b88b4a] text-slate-900'
                      } ${isLastMoveSquare ? 'ring-inset ring-4 ring-emerald-500/70 bg-emerald-400/30' : ''}`}
                    >
                      {/* Rank label on left column */}
                      {colIdx === 0 && (
                        <span
                          className={`absolute top-0.5 left-1 text-[10px] font-bold pointer-events-none select-none ${
                            isLight ? 'text-[#b88b4a]' : 'text-[#e2d6b5]'
                          }`}
                        >
                          {rankLabels[rowIdx]}
                        </span>
                      )}

                      {/* File label on bottom row */}
                      {rowIdx === 7 && (
                        <span
                          className={`absolute bottom-0.5 right-1 text-[10px] font-bold pointer-events-none select-none ${
                            isLight ? 'text-[#b88b4a]' : 'text-[#e2d6b5]'
                          }`}
                        >
                          {fileLabels[colIdx]}
                        </span>
                      )}

                      {/* Chess Piece */}
                      {piece && pieceKey && (
                        <span
                          className={`text-3xl sm:text-4xl select-none transform transition-transform duration-150 hover:scale-110 drop-shadow-md ${
                            piece.color === 'w'
                              ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                              : 'text-slate-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.4)]'
                          }`}
                        >
                          {CHESS_PIECE_SVGS[pieceKey]}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Bottom Player (White by default, Black if flipped) */}
        <div className="flex items-center justify-between px-2 py-1 bg-slate-950/60 rounded-lg border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-3.5 h-3.5 rounded-sm border ${
              isFlipped ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-black'
            } flex items-center justify-center text-[10px] font-bold`}>
              {isFlipped ? '♚' : '♔'}
            </span>
            <span className="font-bold text-slate-200">
              {isFlipped ? match.blackPlayer.name : match.whitePlayer.name}
            </span>
            <span className="text-slate-400 font-mono">
              ({isFlipped ? match.blackPlayer.fideRating : match.whitePlayer.fideRating})
            </span>
          </div>

          {/* Captured pieces by bottom player */}
          <div className="flex items-center gap-1 font-mono text-sm">
            {(isFlipped ? captured.whiteCaptured : captured.blackCaptured).map((item, idx) => (
              <span key={idx} className="text-slate-300 select-none">
                {CHESS_PIECE_SVGS[`${isFlipped ? 'b' : 'w'}${item.type}`].repeat(item.count)}
              </span>
            ))}
            {(isFlipped ? captured.materialAdvantage > 0 : captured.materialAdvantage < 0) && (
              <span className="text-xs font-bold text-emerald-400 ml-1">
                +{Math.abs(captured.materialAdvantage)}
              </span>
            )}
          </div>
        </div>

        {/* Board Playback Controls Bar */}
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={handleFirst}
              disabled={activeMoveIndex <= 0}
              className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-30 text-slate-300"
              title="Inicio de la partida"
            >
              <ChevronFirst className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrev}
              disabled={activeMoveIndex <= 0}
              className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-30 text-slate-300"
              title="Jugada anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPlayingReplay(!isPlayingReplay)}
              className="p-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              title={isPlayingReplay ? 'Pausar reproducción' : 'Reproducir jugadas'}
            >
              {isPlayingReplay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={handleNext}
              disabled={activeMoveIndex >= match.moves.length - 1}
              className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-30 text-slate-300"
              title="Jugada siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleLast}
              disabled={activeMoveIndex >= match.moves.length - 1}
              className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-30 text-slate-300"
              title="Última jugada / En directo"
            >
              <ChevronLast className="w-4 h-4" />
            </button>
          </div>

          {/* Center Info: Move Indicator */}
          <div className="font-mono text-slate-300 text-xs">
            {currentMove ? (
              <span>
                Jugada {currentMove.moveNumber} ({currentMove.color === 'w' ? 'Blancas' : 'Negras'}):{' '}
                <strong className="text-emerald-400">{currentMove.notation}</strong>
              </span>
            ) : (
              <span>Posición Inicial</span>
            )}
          </div>

          {/* Right Tools: Flip Board & Sound */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-300 flex items-center gap-1"
              title="Girar tablero 180°"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Girar</span>
            </button>
            <button
              onClick={onToggleSound}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-300"
              title={soundEnabled ? 'Silenciar' : 'Activar sonido'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Right: Move Notation Sheet (Cols 8-12) */}
      <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col h-[520px] shadow-sm">
        {/* Notation Header */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-bold text-slate-300">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Planilla de Jugadas (PGN)</span>
          </div>
          <button
            onClick={onOpenAiAnalysis}
            className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold"
          >
            <Sparkles className="w-3 h-3" />
            <span>Analizar Posición</span>
          </button>
        </div>

        {/* Moves Table */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-1 text-xs font-mono">
          {match.moves.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              Partida aún no iniciada.
            </div>
          ) : (
            // Group moves by moveNumber (pair white & black)
            Array.from(new Set(match.moves.map((m) => m.moveNumber))).map((moveNum) => {
              const whiteMoveIdx = match.moves.findIndex(
                (m) => m.moveNumber === moveNum && m.color === 'w'
              );
              const blackMoveIdx = match.moves.findIndex(
                (m) => m.moveNumber === moveNum && m.color === 'b'
              );

              const whiteMove = whiteMoveIdx !== -1 ? match.moves[whiteMoveIdx] : null;
              const blackMove = blackMoveIdx !== -1 ? match.moves[blackMoveIdx] : null;

              const isWhiteActive = whiteMoveIdx === activeMoveIndex;
              const isBlackActive = blackMoveIdx === activeMoveIndex;

              return (
                <div
                  key={moveNum}
                  className="flex items-center rounded-lg hover:bg-slate-800/60 py-1 px-1.5 transition-colors text-xs"
                >
                  {/* Move Number */}
                  <span className="w-8 text-slate-400 shrink-0">{moveNum}.</span>

                  {/* White Move */}
                  <button
                    onClick={() => whiteMoveIdx !== -1 && handleJumpToMove(whiteMoveIdx)}
                    disabled={!whiteMove}
                    className={`flex-1 flex items-center justify-between px-2 py-1 rounded text-left transition-all ${
                      isWhiteActive
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                        : 'text-slate-200 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <span>{whiteMove?.notation || '-'}</span>
                    {whiteMove?.eval !== undefined && (
                      <span className="text-[10px] text-slate-400 ml-1">
                        {whiteMove.eval > 0 ? `+${whiteMove.eval}` : whiteMove.eval}
                      </span>
                    )}
                  </button>

                  {/* Black Move */}
                  <button
                    onClick={() => blackMoveIdx !== -1 && handleJumpToMove(blackMoveIdx)}
                    disabled={!blackMove}
                    className={`flex-1 flex items-center justify-between px-2 py-1 rounded text-left transition-all ml-1 ${
                      isBlackActive
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                        : 'text-slate-200 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <span>{blackMove?.notation || '-'}</span>
                    {blackMove?.eval !== undefined && (
                      <span className="text-[10px] text-slate-400 ml-1">
                        {blackMove.eval > 0 ? `+${blackMove.eval}` : blackMove.eval}
                      </span>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Current Position Summary */}
        <div className="pt-2.5 mt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Apertura: {match.stats.openingECO}</span>
          <span className="font-mono text-emerald-400 font-bold">
            Eval actual: {match.currentEval > 0 ? `+${match.currentEval}` : match.currentEval}
          </span>
        </div>
      </div>
    </div>
  );
};
