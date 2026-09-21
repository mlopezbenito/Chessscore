import React from 'react';
import { ChessMatch } from '../types';
import { formatClockTime, getCountryFlag } from '../utils/chessEngine';
import { Trophy, Clock, Star, Share2, AlertCircle, Sparkles } from 'lucide-react';

interface MatchHeaderProps {
  match: ChessMatch;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onOpenAiAnalysis: () => void;
}

export const MatchHeader: React.FC<MatchHeaderProps> = ({
  match,
  onToggleFavorite,
  onOpenAiAnalysis,
}) => {
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';
  const whiteInTrouble = match.whiteTimeLeftSec < 300 && isLive;
  const blackInTrouble = match.blackTimeLeftSec < 300 && isLive;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
      {/* Subtle background glow based on evaluation */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none transition-all duration-700"
        style={{
          background:
            match.currentEval > 1
              ? 'radial-gradient(circle at 20% 50%, #10b981 0%, transparent 60%)'
              : match.currentEval < -1
              ? 'radial-gradient(circle at 80% 50%, #f43f5e 0%, transparent 60%)'
              : 'radial-gradient(circle at 50% 50%, #3b82f6 0%, transparent 60%)',
        }}
      />

      {/* Top Bar: Tournament info & metadata */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-200">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span>{match.tournamentName}</span>
          </div>
          <span>•</span>
          <span>Ronda {match.round}</span>
          <span>•</span>
          <span>Mesa {match.board}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
            {match.timeControl}
          </span>
          <button
            onClick={(e) => onToggleFavorite(match.id, e)}
            className={`p-1.5 rounded-lg border transition-colors ${
              match.isFavorite
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-amber-400'
            }`}
            title="Añadir a favoritos"
          >
            <Star className={`w-4 h-4 ${match.isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Center Players & Clocks Scoreboard */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
        {/* White Player (Cols 1-3) */}
        <div className="md:col-span-3 flex items-center justify-between md:justify-start gap-3 bg-slate-950/40 md:bg-transparent p-2.5 md:p-0 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-300 text-slate-900 font-bold flex items-center justify-center text-xl shadow-md border-2 border-white/20">
                ♔
              </div>
              <span className="absolute -bottom-1 -right-1 text-base shadow-sm">
                {getCountryFlag(match.whitePlayer.countryCode)}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold tracking-wider">
                  {match.whitePlayer.fideTitle}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                  {match.whitePlayer.name}
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="font-mono">Elo: {match.whitePlayer.fideRating}</span>
                {match.whitePlayer.liveRatingDiff !== 0 && (
                  <span
                    className={`font-mono text-[11px] font-semibold ${
                      match.whitePlayer.liveRatingDiff > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    ({match.whitePlayer.liveRatingDiff > 0 ? '+' : ''}
                    {match.whitePlayer.liveRatingDiff.toFixed(1)})
                  </span>
                )}
                <span className="hidden sm:inline text-slate-600">•</span>
                <span className="hidden sm:inline text-slate-400 text-[11px]">
                  #{match.whitePlayer.worldRank} Mundial
                </span>
              </div>
            </div>
          </div>

          {/* White Clock */}
          <div
            className={`font-mono text-base sm:text-xl font-extrabold px-3 py-1.5 rounded-xl border transition-all ${
              match.currentTurn === 'w' && isLive
                ? whiteInTrouble
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse ring-2 ring-rose-500/40'
                  : 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/50'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            {formatClockTime(match.whiteTimeLeftSec)}
          </div>
        </div>

        {/* Center Status / Score Badge (Col 4) */}
        <div className="md:col-span-1 flex flex-col items-center justify-center text-center py-1">
          {isLive ? (
            <div className="flex flex-col items-center gap-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[11px] font-extrabold tracking-wider animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                EN VIVO
              </span>
              <span className="text-xs font-mono font-bold text-slate-300">
                Jugada {match.currentMoveNumber}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Turno: {match.currentTurn === 'w' ? 'Blancas' : 'Negras'}
              </span>
            </div>
          ) : isFinished ? (
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black font-mono tracking-wider text-white">
                {match.result}
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                Finalizado
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Próximo
              </span>
              <span className="text-[11px] text-slate-400">18:30 CET</span>
            </div>
          )}
        </div>

        {/* Black Player (Cols 5-7) */}
        <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-3 bg-slate-950/40 md:bg-transparent p-2.5 md:p-0 rounded-xl">
          {/* Black Clock */}
          <div
            className={`font-mono text-base sm:text-xl font-extrabold px-3 py-1.5 rounded-xl border transition-all md:order-1 ${
              match.currentTurn === 'b' && isLive
                ? blackInTrouble
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse ring-2 ring-rose-500/40'
                  : 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/50'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            {formatClockTime(match.blackTimeLeftSec)}
          </div>

          <div className="flex items-center gap-3 md:order-2">
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                  {match.blackPlayer.name}
                </h2>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold tracking-wider">
                  {match.blackPlayer.fideTitle}
                </span>
              </div>
              <div className="flex items-center justify-end gap-2 text-xs text-slate-400 mt-0.5">
                <span className="hidden sm:inline text-slate-400 text-[11px]">
                  #{match.blackPlayer.worldRank} Mundial
                </span>
                <span className="hidden sm:inline text-slate-600">•</span>
                {match.blackPlayer.liveRatingDiff !== 0 && (
                  <span
                    className={`font-mono text-[11px] font-semibold ${
                      match.blackPlayer.liveRatingDiff > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    ({match.blackPlayer.liveRatingDiff > 0 ? '+' : ''}
                    {match.blackPlayer.liveRatingDiff.toFixed(1)})
                  </span>
                )}
                <span className="font-mono">Elo: {match.blackPlayer.fideRating}</span>
              </div>
            </div>

            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-950 to-slate-800 text-white font-bold flex items-center justify-center text-xl shadow-md border-2 border-slate-700">
                ♚
              </div>
              <span className="absolute -bottom-1 -right-1 text-base shadow-sm">
                {getCountryFlag(match.blackPlayer.countryCode)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SofaScore Signature: Win Probability Gauge Bar */}
      <div className="mt-4 pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            Probabilidad de Victoria (Módulo Stockfish)
          </span>
          <div className="flex items-center gap-3 text-xs font-mono font-bold">
            <span className="text-slate-200">
              Blancas: {match.winProbability.white}%
            </span>
            <span className="text-slate-400">
              Tablas: {match.winProbability.draw}%
            </span>
            <span className="text-slate-200">
              Negras: {match.winProbability.black}%
            </span>
          </div>
        </div>

        {/* Triple Split Bar */}
        <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-slate-950 border border-slate-800">
          <div
            className="h-full bg-white transition-all duration-500 relative group"
            style={{ width: `${match.winProbability.white}%` }}
            title={`Victoria Blancas: ${match.winProbability.white}%`}
          />
          <div
            className="h-full bg-slate-600 transition-all duration-500"
            style={{ width: `${match.winProbability.draw}%` }}
            title={`Tablas: ${match.winProbability.draw}%`}
          />
          <div
            className="h-full bg-slate-900 border-l border-slate-700 transition-all duration-500"
            style={{ width: `${match.winProbability.black}%` }}
            title={`Victoria Negras: ${match.winProbability.black}%`}
          />
        </div>
      </div>
    </div>
  );
};
