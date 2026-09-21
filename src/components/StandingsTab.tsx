import React from 'react';
import { Tournament } from '../types';
import { getCountryFlag } from '../utils/chessEngine';
import { Trophy, Award, TrendingUp } from 'lucide-react';

interface StandingsTabProps {
  tournament: Tournament | null;
  onSelectPlayer?: (playerId: string) => void;
}

export const StandingsTab: React.FC<StandingsTabProps> = ({
  tournament,
  onSelectPlayer,
}) => {
  if (!tournament) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
        No hay tabla de clasificación para este torneo.
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-white text-sm">
            {tournament.name} — Clasificación en Directo
          </h3>
        </div>
        <span className="text-slate-400 text-[11px] font-mono">
          Ronda {tournament.currentRound} de {tournament.totalRounds}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold text-[11px]">
              <th className="py-2.5 px-2 w-8 text-center">#</th>
              <th className="py-2.5 px-3">Gran Maestro</th>
              <th className="py-2.5 px-2 text-center">Elo</th>
              <th className="py-2.5 px-2 text-center">Ptos</th>
              <th className="py-2.5 px-2 text-center">PJ</th>
              <th className="py-2.5 px-2 text-center hidden sm:table-cell">G</th>
              <th className="py-2.5 px-2 text-center hidden sm:table-cell">E</th>
              <th className="py-2.5 px-2 text-center hidden sm:table-cell">P</th>
              <th className="py-2.5 px-2 text-center hidden md:table-cell">SB</th>
              <th className="py-2.5 px-2 text-center">Perf.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {tournament.standings.map((row) => {
              const isLeader = row.rank === 1;
              const isContender = row.rank <= 3;

              return (
                <tr
                  key={row.playerId}
                  onClick={() => onSelectPlayer && onSelectPlayer(row.playerId)}
                  className={`hover:bg-slate-800/60 transition-colors cursor-pointer ${
                    isLeader ? 'bg-emerald-500/5' : ''
                  }`}
                >
                  {/* Rank */}
                  <td className="py-2.5 px-2 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded font-bold text-xs ${
                        isLeader
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                          : isContender
                          ? 'bg-slate-800 text-slate-200'
                          : 'text-slate-400'
                      }`}
                    >
                      {row.rank}
                    </span>
                  </td>

                  {/* Player info */}
                  <td className="py-2.5 px-3 font-sans">
                    <div className="flex items-center gap-2">
                      <span className="text-sm shrink-0">
                        {getCountryFlag(row.player.countryCode)}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 shrink-0">
                        {row.player.fideTitle}
                      </span>
                      <span className="font-bold text-slate-100 hover:text-emerald-400 truncate max-w-[180px]">
                        {row.player.name}
                      </span>
                    </div>
                  </td>

                  {/* Elo */}
                  <td className="py-2.5 px-2 text-center text-slate-400 text-xs">
                    {row.player.fideRating}
                  </td>

                  {/* Points (Highlight) */}
                  <td className="py-2.5 px-2 text-center font-bold text-sm text-emerald-400">
                    {row.points.toFixed(1)}
                  </td>

                  {/* Played */}
                  <td className="py-2.5 px-2 text-center text-slate-300">
                    {row.played}
                  </td>

                  {/* Wins */}
                  <td className="py-2.5 px-2 text-center text-slate-300 hidden sm:table-cell">
                    {row.wins}
                  </td>

                  {/* Draws */}
                  <td className="py-2.5 px-2 text-center text-slate-400 hidden sm:table-cell">
                    {row.draws}
                  </td>

                  {/* Losses */}
                  <td className="py-2.5 px-2 text-center text-slate-400 hidden sm:table-cell">
                    {row.losses}
                  </td>

                  {/* Sonneborn-Berger */}
                  <td className="py-2.5 px-2 text-center text-slate-400 hidden md:table-cell text-[11px]">
                    {row.sonnebornBerger.toFixed(2)}
                  </td>

                  {/* Performance */}
                  <td className="py-2.5 px-2 text-center font-bold text-slate-200">
                    {row.performanceRating}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
        <span>SB = Desempate Sonneborn-Berger</span>
        <span>El 1º clasificado disputa el Campeonato del Mundo FIDE</span>
      </div>
    </div>
  );
};
