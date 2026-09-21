import React, { useState } from 'react';
import { ChessMoveItem } from '../types';
import { TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';

interface EvalMomentumGraphProps {
  moves: ChessMoveItem[];
  whitePlayerName: string;
  blackPlayerName: string;
}

export const EvalMomentumGraph: React.FC<EvalMomentumGraphProps> = ({
  moves,
  whitePlayerName,
  blackPlayerName,
}) => {
  const [hoveredMove, setHoveredMove] = useState<ChessMoveItem | null>(null);

  if (moves.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
        Gráfica de momento disponible una vez comenzada la partida.
      </div>
    );
  }

  // Dimensions for SVG rendering
  const width = 760;
  const height = 160;
  const paddingX = 40;
  const paddingY = 20;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;
  const zeroY = paddingY + plotHeight / 2;

  // Max eval to bound graph between -4 and +4
  const maxEvalBound = 4.0;

  // Compute points for SVG path
  const points = moves.map((move, index) => {
    const x = paddingX + (index / Math.max(1, moves.length - 1)) * plotWidth;
    // Positive eval goes upwards (smaller Y in SVG coordinate)
    const clampedEval = Math.max(-maxEvalBound, Math.min(maxEvalBound, move.eval));
    const y = zeroY - (clampedEval / maxEvalBound) * (plotHeight / 2);
    return { x, y, move, eval: move.eval };
  });

  // Construct SVG paths
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Area path for White advantage (above zero line)
  const whiteAreaPath = points
    .map((p, i) => {
      const yClamped = Math.min(zeroY, p.y);
      return `${i === 0 ? 'M' : 'L'} ${p.x} ${yClamped}`;
    })
    .concat(`L ${points[points.length - 1].x} ${zeroY} L ${points[0].x} ${zeroY} Z`)
    .join(' ');

  // Area path for Black advantage (below zero line)
  const blackAreaPath = points
    .map((p, i) => {
      const yClamped = Math.max(zeroY, p.y);
      return `${i === 0 ? 'M' : 'L'} ${p.x} ${yClamped}`;
    })
    .concat(`L ${points[points.length - 1].x} ${zeroY} L ${points[0].x} ${zeroY} Z`)
    .join(' ');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">
            Momento de la Partida (Ventaja por Jugada)
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">
            Estilo SofaScore Momentum
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm" />
            <span>Ventaja {whitePlayerName.split(' ').pop()} (Blancas)</span>
          </div>
          <div className="flex items-center gap-1 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-sm" />
            <span>Ventaja {blackPlayerName.split(' ').pop()} (Negras)</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative w-full overflow-hidden bg-slate-950/80 rounded-xl border border-slate-800/80 p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-36 sm:h-44 overflow-visible"
        >
          <defs>
            {/* White advantage gradient */}
            <linearGradient id="whiteAdvGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>

            {/* Black advantage gradient */}
            <linearGradient id="blackAdvGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.0" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={zeroY}
            x2={width - paddingX}
            y2={zeroY}
            stroke="#475569"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />
          <text
            x={paddingX - 8}
            y={zeroY + 4}
            fill="#64748b"
            fontSize="10"
            textAnchor="end"
            fontFamily="monospace"
          >
            0.0
          </text>
          <text
            x={paddingX - 8}
            y={paddingY + 10}
            fill="#10b981"
            fontSize="10"
            textAnchor="end"
            fontFamily="monospace"
          >
            +4.0
          </text>
          <text
            x={paddingX - 8}
            y={height - paddingY}
            fill="#f43f5e"
            fontSize="10"
            textAnchor="end"
            fontFamily="monospace"
          >
            -4.0
          </text>

          {/* Filled Areas */}
          <path d={whiteAreaPath} fill="url(#whiteAdvGradient)" />
          <path d={blackAreaPath} fill="url(#blackAdvGradient)" />

          {/* Main Evaluation Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#f8fafc"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Key turning point dots (Brilliant or Blunder) */}
          {points.map((p, idx) => {
            const isBrilliant = p.move.quality === 'brilliant';
            const isBlunder = p.move.quality === 'blunder';
            if (!isBrilliant && !isBlunder) return null;

            return (
              <g key={idx}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="5"
                  fill={isBrilliant ? '#14b8a6' : '#ef4444'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="animate-pulse cursor-pointer"
                />
              </g>
            );
          })}

          {/* Interactive invisible hover triggers across the timeline */}
          {points.map((p, idx) => (
            <rect
              key={idx}
              x={p.x - plotWidth / (points.length * 2)}
              y={0}
              width={plotWidth / points.length}
              height={height}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredMove(p.move)}
              onMouseLeave={() => setHoveredMove(null)}
            />
          ))}
        </svg>

        {/* Floating Tooltip when hovering over a move */}
        {hoveredMove && (
          <div className="absolute top-2 right-3 bg-slate-900/95 border border-emerald-500/50 rounded-lg px-3 py-1.5 shadow-xl text-xs font-mono pointer-events-none z-10 flex items-center gap-2">
            <span className="text-slate-400">
              J.{hoveredMove.moveNumber} ({hoveredMove.color === 'w' ? 'Blancas' : 'Negras'}):
            </span>
            <strong className="text-white">{hoveredMove.notation}</strong>
            <span
              className={`font-bold ${
                hoveredMove.eval > 0
                  ? 'text-emerald-400'
                  : hoveredMove.eval < 0
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }`}
            >
              ({hoveredMove.eval > 0 ? `+${hoveredMove.eval}` : hoveredMove.eval})
            </span>
            {hoveredMove.quality && (
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-amber-300">
                {hoveredMove.quality.toUpperCase()}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer explanation */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
        <span>Apertura (Jugada 1)</span>
        <span>Medio Juego</span>
        <span>Final / Posición Actual</span>
      </div>
    </div>
  );
};
