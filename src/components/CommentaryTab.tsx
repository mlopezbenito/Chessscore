import React from 'react';
import { ChessMatch } from '../types';
import { MessageSquare, Flame, AlertCircle, Clock, CheckCircle, Sparkles } from 'lucide-react';

interface CommentaryTabProps {
  match: ChessMatch;
  onOpenAiAnalysis: () => void;
}

export const CommentaryTab: React.FC<CommentaryTabProps> = ({ match, onOpenAiAnalysis }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-bold text-slate-300">
        <div className="flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span>Comentarios y Retransmisión en Directo</span>
        </div>
        <button
          onClick={onOpenAiAnalysis}
          className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Preguntar al Gran Maestro IA</span>
        </button>
      </div>

      {/* Timeline items */}
      <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-800 before:pointer-events-none pl-6">
        {match.commentary.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Sin comentarios en directo por el momento.
          </div>
        ) : (
          match.commentary.map((comm) => {
            const isTactical = comm.type === 'tactical';
            const isBlunder = comm.type === 'blunder';
            const isResult = comm.type === 'result';

            return (
              <div key={comm.id} className="relative group">
                {/* Node icon on timeline */}
                <span
                  className={`absolute -left-[27px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    isBlunder
                      ? 'bg-rose-500 border-slate-900'
                      : isTactical
                      ? 'bg-emerald-500 border-slate-900'
                      : isResult
                      ? 'bg-amber-400 border-slate-900'
                      : 'bg-slate-700 border-slate-900'
                  }`}
                />

                <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-xs space-y-1 hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-400">
                        Jugada {comm.moveNumber} ({comm.color === 'w' ? 'Blancas' : 'Negras'})
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                          isBlunder
                            ? 'bg-rose-500/20 text-rose-300'
                            : isTactical
                            ? 'bg-teal-500/20 text-teal-300'
                            : isResult
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {comm.type.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-slate-400 font-mono text-[10px]">{comm.timestamp}</span>
                  </div>

                  <p className="text-slate-200 text-xs leading-relaxed">{comm.text}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
