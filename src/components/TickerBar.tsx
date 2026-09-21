import React from 'react';
import { ChessMatch } from '../types';
import { formatClockTime, getCountryFlag } from '../utils/chessEngine';
import { Radio } from 'lucide-react';

interface TickerBarProps {
  matches: ChessMatch[];
  selectedMatchId: string;
  onSelectMatch: (matchId: string) => void;
}

export const TickerBar: React.FC<TickerBarProps> = ({
  matches,
  selectedMatchId,
  onSelectMatch,
}) => {
  return (
    <div className="bg-slate-900 border-b border-slate-800 py-2.5 px-3 sm:px-6 overflow-x-auto">
      <div className="flex items-center gap-3 min-w-max max-w-7xl mx-auto">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider pr-2 border-r border-slate-800">
          <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          <span>Partidas</span>
        </div>

        {matches.map((match) => {
          const isSelected = match.id === selectedMatchId;
          const isLive = match.status === 'live';
          const evalVal = match.currentEval;
          const isWhiteAdvantage = evalVal > 0.3;
          const isBlackAdvantage = evalVal < -0.3;

          return (
            <button
              key={match.id}
              onClick={() => onSelectMatch(match.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-left border transition-all ${
                isSelected
                  ? 'bg-slate-800 border-emerald-500 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                  : 'bg-slate-950/70 hover:bg-slate-800/60 border-slate-800/80 text-slate-300'
              }`}
            >
              {/* Left match info */}
              <div className="flex flex-col gap-1 w-36 sm:w-44">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="truncate max-w-[100px]">{match.tournamentName}</span>
                  {isLive ? (
                    <span className="flex items-center gap-1 text-rose-400 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      J.{match.currentMoveNumber}
                    </span>
                  ) : match.status === 'finished' ? (
                    <span className="font-bold text-emerald-400">{match.result}</span>
                  ) : (
                    <span className="text-slate-400">18:30</span>
                  )}
                </div>

                {/* White player row */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-sm">{getCountryFlag(match.whitePlayer.countryCode)}</span>
                    <span className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {match.whitePlayer.name.split(' ').pop()}
                    </span>
                  </div>
                  {isLive && (
                    <span className={`font-mono text-[11px] font-bold ${
                      match.currentTurn === 'w' ? 'text-emerald-400' : 'text-slate-400'
                    }`}>
                      {formatClockTime(match.whiteTimeLeftSec)}
                    </span>
                  )}
                </div>

                {/* Black player row */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-sm">{getCountryFlag(match.blackPlayer.countryCode)}</span>
                    <span className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {match.blackPlayer.name.split(' ').pop()}
                    </span>
                  </div>
                  {isLive && (
                    <span className={`font-mono text-[11px] font-bold ${
                      match.currentTurn === 'b' ? 'text-emerald-400' : 'text-slate-400'
                    }`}>
                      {formatClockTime(match.blackTimeLeftSec)}
                    </span>
                  )}
                </div>
              </div>

              {/* Mini Eval Gauge on the card */}
              {isLive && (
                <div className="flex flex-col items-center justify-center pl-2 border-l border-slate-800/80">
                  <div className="w-2 h-10 bg-slate-950 rounded-full overflow-hidden flex flex-col justify-end border border-slate-700">
                    <div
                      className="w-full bg-white transition-all duration-300"
                      style={{
                        height: `${Math.min(95, Math.max(5, 50 + evalVal * 12))}%`,
                      }}
                    />
                  </div>
                  <span className={`text-[9px] font-mono font-bold mt-1 ${
                    isWhiteAdvantage ? 'text-emerald-400' : isBlackAdvantage ? 'text-rose-400' : 'text-slate-400'
                  }`}>
                    {evalVal > 0 ? `+${evalVal.toFixed(1)}` : evalVal.toFixed(1)}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
