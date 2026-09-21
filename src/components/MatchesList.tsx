import React, { useState } from 'react';
import { ChessMatch } from '../types';
import { formatClockTime, getCountryFlag } from '../utils/chessEngine';
import { Star, Trophy, Radio, Clock, CheckCircle2 } from 'lucide-react';

interface MatchesListProps {
  matches: ChessMatch[];
  selectedMatchId: string;
  onSelectMatch: (id: string) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

type FilterTab = 'all' | 'live' | 'finished' | 'favorites';

export const MatchesList: React.FC<MatchesListProps> = ({
  matches,
  selectedMatchId,
  onSelectMatch,
  onToggleFavorite,
}) => {
  const [filterTab, setFilterTab] = useState<FilterTab>('all');

  const liveCount = matches.filter((m) => m.status === 'live').length;
  const finishedCount = matches.filter((m) => m.status === 'finished').length;
  const favCount = matches.filter((m) => m.isFavorite).length;

  const filteredMatches = matches.filter((match) => {
    if (filterTab === 'live') return match.status === 'live';
    if (filterTab === 'finished') return match.status === 'finished';
    if (filterTab === 'favorites') return match.isFavorite;
    return true;
  });

  // Group by Tournament
  const groupedTournaments = filteredMatches.reduce((acc, match) => {
    if (!acc[match.tournamentName]) {
      acc[match.tournamentName] = [];
    }
    acc[match.tournamentName].push(match);
    return acc;
  }, {} as Record<string, ChessMatch[]>);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-full shadow-sm">
      {/* Filter Tabs Bar (SofaScore Tab Header) */}
      <div className="bg-slate-950/70 p-2 border-b border-slate-800 flex items-center justify-between gap-1 text-xs">
        <button
          onClick={() => setFilterTab('all')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all ${
            filterTab === 'all'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Todos ({matches.length})
        </button>
        <button
          onClick={() => setFilterTab('live')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all ${
            filterTab === 'live'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'text-slate-400 hover:text-rose-400'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          En Vivo ({liveCount})
        </button>
        <button
          onClick={() => setFilterTab('finished')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all ${
            filterTab === 'finished'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Fin ({finishedCount})
        </button>
        <button
          onClick={() => setFilterTab('favorites')}
          className={`py-1.5 px-2.5 rounded-lg font-semibold flex items-center justify-center transition-all ${
            filterTab === 'favorites'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-amber-400'
          }`}
          title="Ver favoritos"
        >
          <Star className="w-3.5 h-3.5 fill-current" />
          {favCount > 0 && <span className="ml-1 text-[11px]">{favCount}</span>}
        </button>
      </div>

      {/* Match Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {Object.keys(groupedTournaments).length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p>No hay partidas en esta categoría.</p>
          </div>
        ) : (
          Object.entries(groupedTournaments).map(([tournamentName, tourneyMatches]) => (
            <div key={tournamentName} className="space-y-2">
              {/* Tournament Section Header */}
              <div className="flex items-center justify-between px-1 py-1 border-b border-slate-800 text-xs font-bold text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="truncate max-w-[220px]">{tournamentName}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">
                  Ronda {tourneyMatches[0]?.round}
                </span>
              </div>

              {/* Match Cards within tournament */}
              <div className="space-y-1.5">
                {tourneyMatches.map((match) => {
                  const isSelected = match.id === selectedMatchId;
                  const isLive = match.status === 'live';
                  const isFinished = match.status === 'finished';
                  const evalVal = match.currentEval;

                  return (
                    <div
                      key={match.id}
                      onClick={() => onSelectMatch(match.id)}
                      className={`relative p-3 rounded-xl border transition-all cursor-pointer group ${
                        isSelected
                          ? 'bg-slate-800 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                          : 'bg-slate-950/60 hover:bg-slate-800/70 border-slate-800/80'
                      }`}
                    >
                      {/* Top row: Board number, Time Control, Live Badge, Fav */}
                      <div className="flex items-center justify-between mb-2 text-[11px] text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-400">Mesa {match.board}</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px]">
                            {match.timeControlCategory}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isLive ? (
                            <span className="flex items-center gap-1 font-bold text-rose-400 text-[11px]">
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                              J.{match.currentMoveNumber}
                            </span>
                          ) : isFinished ? (
                            <span className="flex items-center gap-1 font-bold text-emerald-400 text-[11px]">
                              <CheckCircle2 className="w-3 h-3" />
                              FINAL
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                              <Clock className="w-3 h-3" />
                              18:30
                            </span>
                          )}

                          <button
                            onClick={(e) => onToggleFavorite(match.id, e)}
                            className="p-1 rounded hover:bg-slate-700/50 text-slate-400 hover:text-amber-400 transition-colors"
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                match.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Players & Live Clocks / Scores */}
                      <div className="space-y-1.5">
                        {/* White Player */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            {/* White piece indicator */}
                            <span className="w-3 h-3 rounded-sm bg-white border border-slate-400 shrink-0" />
                            <span className="text-sm shrink-0">
                              {getCountryFlag(match.whitePlayer.countryCode)}
                            </span>
                            <span className="text-xs font-bold text-slate-400 shrink-0">
                              {match.whitePlayer.fideTitle}
                            </span>
                            <span
                              className={`text-sm truncate font-semibold ${
                                isSelected ? 'text-white' : 'text-slate-200'
                              }`}
                            >
                              {match.whitePlayer.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({match.whitePlayer.fideRating})
                            </span>
                          </div>

                          <div className="flex items-center gap-2 pl-2 shrink-0">
                            {isLive ? (
                              <span
                                className={`font-mono text-xs px-1.5 py-0.5 rounded font-bold ${
                                  match.currentTurn === 'w'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : 'text-slate-400'
                                }`}
                              >
                                {formatClockTime(match.whiteTimeLeftSec)}
                              </span>
                            ) : isFinished ? (
                              <span className="font-mono text-sm font-extrabold text-white">
                                {match.result === '1-0' ? '1' : match.result === '1/2-1/2' ? '½' : '0'}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        {/* Black Player */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            {/* Black piece indicator */}
                            <span className="w-3 h-3 rounded-sm bg-slate-900 border border-slate-600 shrink-0" />
                            <span className="text-sm shrink-0">
                              {getCountryFlag(match.blackPlayer.countryCode)}
                            </span>
                            <span className="text-xs font-bold text-slate-400 shrink-0">
                              {match.blackPlayer.fideTitle}
                            </span>
                            <span
                              className={`text-sm truncate font-semibold ${
                                isSelected ? 'text-white' : 'text-slate-200'
                              }`}
                            >
                              {match.blackPlayer.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({match.blackPlayer.fideRating})
                            </span>
                          </div>

                          <div className="flex items-center gap-2 pl-2 shrink-0">
                            {isLive ? (
                              <span
                                className={`font-mono text-xs px-1.5 py-0.5 rounded font-bold ${
                                  match.currentTurn === 'b'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : 'text-slate-400'
                                }`}
                              >
                                {formatClockTime(match.blackTimeLeftSec)}
                              </span>
                            ) : isFinished ? (
                              <span className="font-mono text-sm font-extrabold text-white">
                                {match.result === '0-1' ? '1' : match.result === '1/2-1/2' ? '½' : '0'}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Footer on card: Opening & Mini Eval Bar */}
                      {isLive && (
                        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 truncate max-w-[180px]">
                            {match.stats.openingECO} • {match.stats.openingName}
                          </span>
                          <div className="flex items-center gap-1.5 font-mono font-bold">
                            <span className="text-[10px] text-slate-400">Eval:</span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[11px] ${
                                evalVal > 0.5
                                  ? 'bg-emerald-500/15 text-emerald-300'
                                  : evalVal < -0.5
                                  ? 'bg-rose-500/15 text-rose-300'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {evalVal > 0 ? `+${evalVal.toFixed(1)}` : evalVal.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
