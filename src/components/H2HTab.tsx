import React from 'react';
import { ChessMatch } from '../types';
import { getCountryFlag } from '../utils/chessEngine';
import { Swords, Calendar, Award, TrendingUp, CheckCircle, MinusCircle, XCircle } from 'lucide-react';

interface H2HTabProps {
  match: ChessMatch;
}

export const H2HTab: React.FC<H2HTabProps> = ({ match }) => {
  const { whitePlayer, blackPlayer, h2h } = match;

  const total = h2h.totalGames || 1;
  const whitePct = Math.round((h2h.whiteWins / total) * 100);
  const drawPct = Math.round((h2h.draws / total) * 100);
  const blackPct = 100 - whitePct - drawPct;

  return (
    <div className="space-y-5">
      {/* Head to Head Record Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-xs font-bold text-slate-300">
          <div className="flex items-center gap-1.5">
            <Swords className="w-4 h-4 text-emerald-400" />
            <span>Historial Directo (Cara a Cara)</span>
          </div>
          <span className="text-slate-400 font-mono">
            {h2h.totalGames} partidas registradas
          </span>
        </div>

        {/* Big Record Counters */}
        <div className="grid grid-cols-3 gap-2 items-center text-center my-3">
          <div>
            <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-400">
              {h2h.whiteWins}
            </div>
            <div className="text-xs font-bold text-slate-300 mt-1 truncate">
              {whitePlayer.name.split(' ').pop()}
            </div>
            <div className="text-[10px] text-slate-400">Victorias Blancas</div>
          </div>

          <div className="border-x border-slate-800 px-2">
            <div className="text-3xl sm:text-4xl font-black font-mono text-slate-300">
              {h2h.draws}
            </div>
            <div className="text-xs font-bold text-slate-400 mt-1">
              Tablas
            </div>
            <div className="text-[10px] text-slate-400">Empates</div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-black font-mono text-rose-400">
              {h2h.blackWins}
            </div>
            <div className="text-xs font-bold text-slate-300 mt-1 truncate">
              {blackPlayer.name.split(' ').pop()}
            </div>
            <div className="text-[10px] text-slate-400">Victorias Negras</div>
          </div>
        </div>

        {/* Split progress bar */}
        <div className="mt-4 pt-2">
          <div className="h-2.5 rounded-full overflow-hidden flex bg-slate-950 border border-slate-800">
            <div
              className="h-full bg-emerald-500"
              style={{ width: `${whitePct}%` }}
              title={`${whitePlayer.name}: ${whitePct}%`}
            />
            <div
              className="h-full bg-slate-600"
              style={{ width: `${drawPct}%` }}
              title={`Tablas: ${drawPct}%`}
            />
            <div
              className="h-full bg-rose-500"
              style={{ width: `${blackPct}%` }}
              title={`${blackPlayer.name}: ${blackPct}%`}
            />
          </div>
        </div>
      </div>

      {/* Form Guide (Recent 5 games for each player) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* White Player Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold mb-3 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <span>{getCountryFlag(whitePlayer.countryCode)}</span>
              <span className="text-white">{whitePlayer.name}</span>
            </div>
            <span className="text-slate-400 text-[11px]">Racha Reciente</span>
          </div>

          <div className="flex items-center gap-2">
            {whitePlayer.form.map((res, i) => (
              <span
                key={i}
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                  res === 'W'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : res === 'D'
                    ? 'bg-slate-700/40 text-slate-300 border border-slate-700'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
                title={res === 'W' ? 'Victoria' : res === 'D' ? 'Tablas' : 'Derrota'}
              >
                {res}
              </span>
            ))}
          </div>

          <div className="mt-3 text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Elo Máximo Histórico:</span>
              <strong className="text-slate-200 font-mono">{whitePlayer.peakRating}</strong>
            </div>
            <div className="flex justify-between">
              <span>Ranking Mundial FIDE:</span>
              <strong className="text-slate-200 font-mono">#{whitePlayer.worldRank}</strong>
            </div>
          </div>
        </div>

        {/* Black Player Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold mb-3 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <span>{getCountryFlag(blackPlayer.countryCode)}</span>
              <span className="text-white">{blackPlayer.name}</span>
            </div>
            <span className="text-slate-400 text-[11px]">Racha Reciente</span>
          </div>

          <div className="flex items-center gap-2">
            {blackPlayer.form.map((res, i) => (
              <span
                key={i}
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                  res === 'W'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : res === 'D'
                    ? 'bg-slate-700/40 text-slate-300 border border-slate-700'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
                title={res === 'W' ? 'Victoria' : res === 'D' ? 'Tablas' : 'Derrota'}
              >
                {res}
              </span>
            ))}
          </div>

          <div className="mt-3 text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Elo Máximo Histórico:</span>
              <strong className="text-slate-200 font-mono">{blackPlayer.peakRating}</strong>
            </div>
            <div className="flex justify-between">
              <span>Ranking Mundial FIDE:</span>
              <strong className="text-slate-200 font-mono">#{blackPlayer.worldRank}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Previous Encounters Table */}
      {h2h.recentGames.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-800 text-xs font-bold text-slate-200">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Últimos Enfrentamientos</span>
          </div>

          <div className="space-y-2">
            {h2h.recentGames.map((game, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-200">{game.event}</span>
                  <span className="text-[11px] text-slate-400">
                    {game.date} • {game.opening} ({game.totalMoves} jugadas)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-[11px]">
                    <div className="text-slate-300">{game.whitePlayerName} (Blancas)</div>
                    <div className="text-slate-400">{game.blackPlayerName} (Negras)</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 font-mono font-bold text-emerald-400 border border-slate-700">
                    {game.result}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
