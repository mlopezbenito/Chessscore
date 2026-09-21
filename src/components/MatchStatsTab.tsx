import React from 'react';
import { ChessMatch } from '../types';
import { BookOpen, Sparkles, CheckCircle, AlertTriangle, XCircle, Clock, Shield } from 'lucide-react';

interface MatchStatsTabProps {
  match: ChessMatch;
}

export const MatchStatsTab: React.FC<MatchStatsTabProps> = ({ match }) => {
  const { stats, whitePlayer, blackPlayer } = match;

  const statItems = [
    {
      label: 'Precisión CAPS (%)',
      whiteVal: stats.whiteAccuracy.toFixed(1),
      blackVal: stats.blackAccuracy.toFixed(1),
      whiteRaw: stats.whiteAccuracy,
      blackRaw: stats.blackAccuracy,
      icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />,
      maxVal: 100,
    },
    {
      label: 'Movimientos Brillantes (!!)',
      whiteVal: stats.whiteBrilliant,
      blackVal: stats.blackBrilliant,
      whiteRaw: stats.whiteBrilliant,
      blackRaw: stats.blackBrilliant,
      icon: <Sparkles className="w-3.5 h-3.5 text-teal-400" />,
      maxVal: Math.max(2, stats.whiteBrilliant + stats.blackBrilliant),
    },
    {
      label: 'Mejores Jugadas (!)',
      whiteVal: stats.whiteBest,
      blackVal: stats.blackBest,
      whiteRaw: stats.whiteBest,
      blackRaw: stats.blackBest,
      icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />,
      maxVal: Math.max(20, stats.whiteBest + stats.blackBest),
    },
    {
      label: 'Imprecisiones (?!)',
      whiteVal: stats.whiteInaccuracies,
      blackVal: stats.blackInaccuracies,
      whiteRaw: stats.whiteInaccuracies,
      blackRaw: stats.blackInaccuracies,
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
      maxVal: Math.max(5, stats.whiteInaccuracies + stats.blackInaccuracies),
      invertColors: true,
    },
    {
      label: 'Errores tácticos (?)',
      whiteVal: stats.whiteMistakes,
      blackVal: stats.blackMistakes,
      whiteRaw: stats.whiteMistakes,
      blackRaw: stats.blackMistakes,
      icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />,
      maxVal: Math.max(3, stats.whiteMistakes + stats.blackMistakes),
      invertColors: true,
    },
    {
      label: 'Graves Errores / Blunders (??)',
      whiteVal: stats.whiteBlunders,
      blackVal: stats.blackBlunders,
      whiteRaw: stats.whiteBlunders,
      blackRaw: stats.blackBlunders,
      icon: <XCircle className="w-3.5 h-3.5 text-rose-400" />,
      maxVal: Math.max(2, stats.whiteBlunders + stats.blackBlunders),
      invertColors: true,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Comparative Statistics Box (SofaScore hallmark stats bar) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        {/* Players Top labels */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-white" />
            <span className="text-white">{whitePlayer.name}</span>
          </div>
          <span className="text-slate-400 uppercase tracking-wider text-[11px]">
            Estadísticas Comparativas
          </span>
          <div className="flex items-center gap-2">
            <span className="text-white">{blackPlayer.name}</span>
            <span className="w-3 h-3 rounded-full bg-slate-900 border border-slate-700" />
          </div>
        </div>

        {/* Rows */}
        <div className="space-y-4">
          {statItems.map((item, idx) => {
            const total = item.whiteRaw + item.blackRaw || 1;
            const whitePct = Math.round((item.whiteRaw / total) * 100);
            const blackPct = 100 - whitePct;

            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="font-mono text-sm text-slate-200">{item.whiteVal}</span>
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  <span className="font-mono text-sm text-slate-200">{item.blackVal}</span>
                </div>

                {/* Progress Bar with Split Ratio */}
                <div className="h-2 rounded-full overflow-hidden flex bg-slate-950 border border-slate-800">
                  <div
                    className={`h-full transition-all duration-500 ${
                      item.invertColors
                        ? item.whiteRaw > item.blackRaw
                          ? 'bg-rose-500'
                          : 'bg-emerald-500'
                        : item.whiteRaw >= item.blackRaw
                        ? 'bg-emerald-500'
                        : 'bg-slate-500'
                    }`}
                    style={{ width: `${whitePct}%` }}
                  />
                  <div
                    className={`h-full transition-all duration-500 ${
                      item.invertColors
                        ? item.blackRaw > item.whiteRaw
                          ? 'bg-rose-500'
                          : 'bg-emerald-500'
                        : item.blackRaw >= item.whiteRaw
                        ? 'bg-emerald-500'
                        : 'bg-slate-500'
                    }`}
                    style={{ width: `${blackPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Clock & Time Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-800">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Tiempo medio / jugada (Blancas)
            </span>
            <span className="font-mono font-bold text-white">
              {Math.floor(stats.avgTimePerMoveSec.white / 60)}m{' '}
              {stats.avgTimePerMoveSec.white % 60}s
            </span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Tiempo medio / jugada (Negras)
            </span>
            <span className="font-mono font-bold text-white">
              {Math.floor(stats.avgTimePerMoveSec.black / 60)}m{' '}
              {stats.avgTimePerMoveSec.black % 60}s
            </span>
          </div>
        </div>
      </div>

      {/* Opening Information Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-800 text-xs font-bold text-slate-200">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>Enciclopedia de Aperturas de Ajedrez (ECO)</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs border border-emerald-500/40">
              {stats.openingECO}
            </span>
            <h4 className="text-sm font-bold text-white">
              {stats.openingName}
            </h4>
          </div>
          {stats.openingVariation && (
            <p className="text-xs text-slate-400">
              {stats.openingVariation}
            </p>
          )}

          {/* Database stats for this opening */}
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400">
                Rendimiento histórico en partidas de Grandes Maestros:
              </span>
              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="text-slate-200">1-0 ({stats.historicalWhiteWinPct}%)</span>
                <span className="text-slate-400">½-½ ({stats.historicalDrawPct}%)</span>
                <span className="text-slate-200">0-1 ({stats.historicalBlackWinPct}%)</span>
              </div>
            </div>

            <div className="h-2 rounded-full overflow-hidden flex bg-slate-950 border border-slate-800">
              <div
                className="h-full bg-white"
                style={{ width: `${stats.historicalWhiteWinPct}%` }}
                title={`Victoria Blancas: ${stats.historicalWhiteWinPct}%`}
              />
              <div
                className="h-full bg-slate-600"
                style={{ width: `${stats.historicalDrawPct}%` }}
                title={`Tablas: ${stats.historicalDrawPct}%`}
              />
              <div
                className="h-full bg-slate-900 border-l border-slate-700"
                style={{ width: `${stats.historicalBlackWinPct}%` }}
                title={`Victoria Negras: ${stats.historicalBlackWinPct}%`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
