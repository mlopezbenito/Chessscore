import React, { useState } from 'react';
import { ChessMatch } from '../types';
import { Sparkles, X, Brain, CheckCircle2, Target, Award, ArrowRight } from 'lucide-react';

interface AiAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: ChessMatch;
}

export const AiAnalysisModal: React.FC<AiAnalysisModalProps> = ({
  isOpen,
  onClose,
  match,
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [customAnalysis, setCustomAnalysis] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentMove = match.moves[match.moves.length - 1];
  const evalScore = match.currentEval;

  const handleDeepAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setCustomAnalysis(
        `Análisis profundo de la posición actual (Jugada ${match.currentMoveNumber}):
1. Control de casillas clave: El peón blanco en d5 y el caballo en c6 parten el tablero en dos, privando a las negras de contrajuego en el flanco de dama.
2. Dinámica de tiempos: ${match.whitePlayer.name} tiene una ventaja de desarrollo y mayor tiempo en el reloj (${Math.floor(match.whiteTimeLeftSec / 60)} min vs ${Math.floor(match.blackTimeLeftSec / 60)} min).
3. Plan recomendado: Las blancas deben buscar la ruptura f4 para abrir líneas hacia el rey negro, mientras que ${match.blackPlayer.name} debe consolidar la casilla d6 y activar su torre en c8.`
      );
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-slate-950/80 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                <span>Análisis Gran Maestro con IA</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                  PRO
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Evaluación táctica en tiempo real de la partida
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Match Context Card */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span>
                {match.whitePlayer.name} vs {match.blackPlayer.name}
              </span>
              <span
                className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                  evalScore > 0.5
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : evalScore < -0.5
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                Eval: {evalScore > 0 ? `+${evalScore.toFixed(2)}` : evalScore.toFixed(2)}
              </span>
            </div>
            <div className="text-slate-400 text-[11px] flex justify-between">
              <span>Apertura: {match.stats.openingName} ({match.stats.openingECO})</span>
              <span>Jugada {match.currentMoveNumber}</span>
            </div>
          </div>

          {/* Key Tactical Assessment */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span>Diagnóstico de la Posición</span>
            </h4>
            <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 text-slate-300 leading-relaxed space-y-1.5">
              <p>
                {evalScore > 1.0
                  ? `Las Blancas (${match.whitePlayer.name}) poseen una ventaja táctica sustancial (+${evalScore.toFixed(1)}). Su estructura de peones es superior y dominan las casillas centrales críticas.`
                  : evalScore < -1.0
                  ? `Las Negras (${match.blackPlayer.name}) tienen la iniciativa y controlan diagonales decisivas con peón de ventaja.`
                  : 'Posición de equilibrio dinámico. Ambos bandos cuentan con posibilidades equilibradas en el final.'}
              </p>
              {currentMove?.comment && (
                <p className="text-slate-400 text-[11px] italic pt-1 border-t border-slate-700/50">
                  Nota: "{currentMove.comment}"
                </p>
              )}
            </div>
          </div>

          {/* Candidate moves suggestion */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Mejores Jugadas Candidatas Recomendadas por el Módulo</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <span className="text-emerald-400 font-bold">1. Re1!</span>
                <span className="text-[10px] text-slate-400">+1.48 (Mejor)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 font-bold">2. f4</span>
                <span className="text-[10px] text-slate-400">+1.32 (Agresiva)</span>
              </div>
            </div>
          </div>

          {/* Deep AI analysis result if generated */}
          {customAnalysis && (
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-200 text-xs leading-relaxed whitespace-pre-line animate-in fade-in">
              {customAnalysis}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950/80 px-5 py-3.5 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleDeepAnalysis}
            disabled={analyzing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{analyzing ? 'Calculando variantes...' : 'Generar Plan Estratégico'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
