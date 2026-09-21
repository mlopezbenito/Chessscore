import React, { useState, useEffect, useRef } from 'react';
import { ChessMatch, Tournament } from './types';
import { MOCK_MATCHES, TOURNAMENTS_DATA } from './data/mockMatches';
import { Header } from './components/Header';
import { TickerBar } from './components/TickerBar';
import { MatchesList } from './components/MatchesList';
import { MatchHeader } from './components/MatchHeader';
import { ChessBoardView } from './components/ChessBoardView';
import { EvalMomentumGraph } from './components/EvalMomentumGraph';
import { MatchStatsTab } from './components/MatchStatsTab';
import { H2HTab } from './components/H2HTab';
import { StandingsTab } from './components/StandingsTab';
import { CommentaryTab } from './components/CommentaryTab';
import { AiAnalysisModal } from './components/AiAnalysisModal';
import { playMoveSound, playCaptureSound, playVictoryChime } from './utils/audio';
import {
  Layers,
  BarChart2,
  Swords,
  Trophy,
  MessageSquare,
  Sparkles,
  Radio,
  Flame,
} from 'lucide-react';

type ActiveTab = 'board' | 'stats' | 'h2h' | 'standings' | 'commentary';

export default function App() {
  const [matches, setMatches] = useState<ChessMatch[]>(MOCK_MATCHES);
  const [selectedMatchId, setSelectedMatchId] = useState<string>('match-carlsen-nakamura');
  const [activeTab, setActiveTab] = useState<ActiveTab>('board');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [liveNotification, setLiveNotification] = useState<string | null>(null);

  // Active selected match
  const selectedMatch = matches.find((m) => m.id === selectedMatchId) || matches[0];

  // Tournaments data
  const tournaments = TOURNAMENTS_DATA;
  const currentTournament =
    tournaments.find((t) => t.id === selectedMatch.tournamentId) || tournaments[0];

  // Filter matches by category & search query
  const filteredMatches = matches.filter((m) => {
    const matchesCategory =
      selectedCategory === 'Todos' || m.timeControlCategory === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      m.whitePlayer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.blackPlayer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tournamentName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Toggle favorite match
  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMatches((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isFavorite: !m.isFavorite } : m))
    );
  };

  // Live clock countdown & simulation engine
  useEffect(() => {
    if (!isSimulating) return;

    const intervalMs = 1000 / simSpeed;
    const interval = setInterval(() => {
      setMatches((prevMatches) =>
        prevMatches.map((match) => {
          if (match.status !== 'live') return match;

          // Tick down time for active player
          const isWhiteTurn = match.currentTurn === 'w';
          const newWhiteTime = isWhiteTurn
            ? Math.max(0, match.whiteTimeLeftSec - 1)
            : match.whiteTimeLeftSec;
          const newBlackTime = !isWhiteTurn
            ? Math.max(0, match.blackTimeLeftSec - 1)
            : match.blackTimeLeftSec;

          return {
            ...match,
            whiteTimeLeftSec: newWhiteTime,
            blackTimeLeftSec: newBlackTime,
          };
        })
      );
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isSimulating, simSpeed]);

  // Periodic simulated live move advance for the featured match
  useEffect(() => {
    if (!isSimulating) return;

    const moveSimTimer = setInterval(() => {
      setMatches((prevMatches) =>
        prevMatches.map((match) => {
          if (match.id === 'match-carlsen-nakamura' && match.status === 'live') {
            // Alternate turn or add move if available
            const isWhite = match.currentTurn === 'w';
            const nextTurn = isWhite ? 'b' : 'w';
            const newMoveNum = isWhite ? match.currentMoveNumber : match.currentMoveNumber + 1;

            // Trigger notification
            const playerMoving = isWhite ? match.whitePlayer.name : match.blackPlayer.name;
            setLiveNotification(`¡Nueva jugada en Mesa 1! ${playerMoving} juega en el tablero.`);
            setTimeout(() => setLiveNotification(null), 4000);

            // Audio
            playMoveSound(soundEnabled);

            return {
              ...match,
              currentTurn: nextTurn,
              currentMoveNumber: newMoveNum,
              currentEval: isWhite ? match.currentEval + 0.08 : match.currentEval - 0.05,
            };
          }
          return match;
        })
      );
    }, 28000 / simSpeed);

    return () => clearInterval(moveSimTimer);
  }, [isSimulating, simSpeed, soundEnabled]);

  const liveMatchesCount = matches.filter((m) => m.status === 'live').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <Header
        liveCount={liveMatchesCount}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        isSimulating={isSimulating}
        simSpeed={simSpeed}
        onToggleSimulation={() => setIsSimulating(!isSimulating)}
        onChangeSimSpeed={setSimSpeed}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenAiAnalysis={() => setIsAiModalOpen(true)}
      />

      {/* SofaScore-style Top Ticker Bar for quick jumping */}
      <TickerBar
        matches={filteredMatches}
        selectedMatchId={selectedMatch.id}
        onSelectMatch={setSelectedMatchId}
      />

      {/* Floating Live Move Toast Notification */}
      {liveNotification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900/95 border border-emerald-500/80 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-bottom-3 duration-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold">{liveNotification}</span>
        </div>
      )}

      {/* Main Layout Area: 2 Columns on desktop (Matches List Left, Match Center Right) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Matches List (Cols 1-4) */}
        <aside className="lg:col-span-4 h-[560px] lg:h-[calc(100vh-140px)] sticky top-24">
          <MatchesList
            matches={filteredMatches}
            selectedMatchId={selectedMatch.id}
            onSelectMatch={setSelectedMatchId}
            onToggleFavorite={handleToggleFavorite}
          />
        </aside>

        {/* Right Column: Match Center Detail (Cols 5-12) */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          {/* Match Scoreboard Marquee Header */}
          <MatchHeader
            match={selectedMatch}
            onToggleFavorite={handleToggleFavorite}
            onOpenAiAnalysis={() => setIsAiModalOpen(true)}
          />

          {/* Sub Navigation Tabs (Directo, Estadísticas, H2H, Clasificación, Comentarios) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1.5 flex items-center gap-1 overflow-x-auto text-xs shadow-sm">
            <button
              onClick={() => setActiveTab('board')}
              className={`flex items-center gap-1.5 py-2 px-3.5 rounded-lg font-bold transition-all shrink-0 ${
                activeTab === 'board'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Tablero & Directo</span>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-1.5 py-2 px-3.5 rounded-lg font-bold transition-all shrink-0 ${
                activeTab === 'stats'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Estadísticas</span>
            </button>

            <button
              onClick={() => setActiveTab('h2h')}
              className={`flex items-center gap-1.5 py-2 px-3.5 rounded-lg font-bold transition-all shrink-0 ${
                activeTab === 'h2h'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Swords className="w-4 h-4" />
              <span>Cara a Cara</span>
            </button>

            <button
              onClick={() => setActiveTab('standings')}
              className={`flex items-center gap-1.5 py-2 px-3.5 rounded-lg font-bold transition-all shrink-0 ${
                activeTab === 'standings'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Clasificación</span>
            </button>

            <button
              onClick={() => setActiveTab('commentary')}
              className={`flex items-center gap-1.5 py-2 px-3.5 rounded-lg font-bold transition-all shrink-0 ${
                activeTab === 'commentary'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Comentarios</span>
            </button>
          </div>

          {/* Active Tab Content Display */}
          <div className="space-y-4">
            {activeTab === 'board' && (
              <>
                <ChessBoardView
                  match={selectedMatch}
                  soundEnabled={soundEnabled}
                  onToggleSound={() => setSoundEnabled(!soundEnabled)}
                  onOpenAiAnalysis={() => setIsAiModalOpen(true)}
                />
                {/* SofaScore Evaluation Momentum Chart */}
                <EvalMomentumGraph
                  moves={selectedMatch.moves}
                  whitePlayerName={selectedMatch.whitePlayer.name}
                  blackPlayerName={selectedMatch.blackPlayer.name}
                />
              </>
            )}

            {activeTab === 'stats' && <MatchStatsTab match={selectedMatch} />}

            {activeTab === 'h2h' && <H2HTab match={selectedMatch} />}

            {activeTab === 'standings' && (
              <StandingsTab tournament={currentTournament} />
            )}

            {activeTab === 'commentary' && (
              <CommentaryTab
                match={selectedMatch}
                onOpenAiAnalysis={() => setIsAiModalOpen(true)}
              />
            )}
          </div>
        </section>
      </main>

      {/* AI Analysis Modal */}
      <AiAnalysisModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        match={selectedMatch}
      />
    </div>
  );
}
