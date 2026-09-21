import React from 'react';
import { Volume2, VolumeX, Play, Pause, Search, Flame, Trophy, Clock, Sparkles } from 'lucide-react';

interface HeaderProps {
  liveCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isSimulating: boolean;
  simSpeed: number;
  onToggleSimulation: () => void;
  onChangeSimSpeed: (speed: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenAiAnalysis: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  liveCount,
  soundEnabled,
  onToggleSound,
  isSimulating,
  simSpeed,
  onToggleSimulation,
  onChangeSimSpeed,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onOpenAiAnalysis,
}) => {
  const categories = ['Todos', 'Clásico', 'Rápido', 'Blitz'];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md">
      {/* Main Top Nav */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Live Pill */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold text-xl">
              ♟
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-white">
                  Chess<span className="text-emerald-400">Score</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block -mt-1">
                Marcador & Partidas en Directo
              </p>
            </div>
          </div>

          {/* Live Indicator Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>{liveCount} EN VIVO</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xs items-center relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar GM (Carlsen, Gukesh...)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
        </div>

        {/* Right Controls: Sim Speed, AI Grandmaster, Sound */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* AI GM Analysis Button */}
          <button
            onClick={onOpenAiAnalysis}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-all hover:scale-105"
            title="Análisis táctico con IA"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
            <span className="hidden sm:inline">Análisis IA</span>
          </button>

          {/* Simulation Ticker Controls */}
          <div className="flex items-center bg-slate-800/90 border border-slate-700/80 rounded-lg p-1 text-xs">
            <button
              onClick={onToggleSimulation}
              className={`px-2 py-1 rounded flex items-center gap-1 font-medium transition-colors ${
                isSimulating
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={isSimulating ? 'Pausar simulación en vivo' : 'Iniciar simulación en vivo'}
            >
              {isSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span className="hidden sm:inline">{isSimulating ? 'En Vivo' : 'Pausado'}</span>
            </button>
            <button
              onClick={() => onChangeSimSpeed(simSpeed === 1 ? 2 : simSpeed === 2 ? 5 : 1)}
              className="px-2 py-1 text-slate-300 hover:text-white font-mono text-[11px] font-semibold"
              title="Velocidad del reloj y jugadas"
            >
              {simSpeed}x
            </button>
          </div>

          {/* Audio toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-lg border transition-colors ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700'
                : 'bg-slate-800/50 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title={soundEnabled ? 'Silenciar sonidos de tablero' : 'Activar sonidos de tablero'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Category Pills Bar (Sub-navigation like SofaScore sports bar) */}
      <div className="bg-slate-950/60 border-t border-slate-800/70 px-3 sm:px-6 py-1.5 flex items-center justify-between overflow-x-auto text-xs">
        <div className="flex items-center gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 text-slate-400 text-[11px] shrink-0">
          <span className="flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-400" /> Candidatos 2026
          </span>
          <span className="hidden md:flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-400" /> Relojes Oficiales FIDE
          </span>
        </div>
      </div>
    </header>
  );
};
