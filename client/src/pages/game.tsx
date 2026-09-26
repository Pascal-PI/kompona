import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePexesoGame, type GameMode } from '../hooks/use-pexeso-game';
import type { Settings, User } from "@shared/schema";
import { GameBoard } from '../components/game/GameBoard';
import { DifficultySelector } from '../components/game/DifficultySelector';
import { ScoreBoard } from '../components/game/ScoreBoard';
import { GameStatus } from '../components/game/GameStatus';
import { VictoryModal } from '../components/game/VictoryModal';
import { GameModeSelector } from '../components/GameModeSelector';
import { RatingDisplay } from '../components/RatingDisplay';
import { getCardFact } from '../constants/cardFacts';

export default function Game() {
  const {
    gameState,
    gameMode,
    setGameMode,
    flipCard,
    changeDifficulty,
    resetGame,
    initializeGame,
    showVictoryModal,
    setShowVictoryModal,
    ratingChange,
  } = usePexesoGame();

  const [showModeSelector, setShowModeSelector] = useState(false);
  const [selectedCardInfo, setSelectedCardInfo] = useState<{ name: string; fact: string } | null>(null);

  // Fetch user settings to get theme preference
  const { data: settings, isLoading: settingsLoading } = useQuery<Settings>({
    queryKey: ['/api/user/settings'],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch user to get membership tier for platinum-exclusive features
  const { data: user } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    staleTime: 5 * 60 * 1000,
  });

  // Get theme from settings, default to "space" if not available or loading  
  const theme: "saints" | "animals" | "barbie" | "puppy" | "santa" | "space" | "minecraft" = (settings && (settings.theme === 'animals' || settings.theme === 'saints' || settings.theme === 'barbie' || settings.theme === 'puppy' || settings.theme === 'santa' || settings.theme === 'space' || settings.theme === 'minecraft') ? settings.theme : 'space') as "saints" | "animals" | "barbie" | "puppy" | "santa" | "space" | "minecraft";

  // React to theme changes - reinitialize the current game with the selected theme.
  useEffect(() => {
    if (settings !== undefined) {
      initializeGame(gameState.aiDifficulty, gameMode);
      setSelectedCardInfo(null);
    }
  }, [theme]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleModeSelect = (mode: GameMode) => {
    setGameMode(mode);
  };

  const handleStartGame = () => {
    initializeGame(gameState.aiDifficulty, gameMode);
    setShowModeSelector(false);
    setSelectedCardInfo(null);
  };

  const handleChangeMode = () => {
    setShowModeSelector(true);
  };

  const handleCardInfo = (symbol: string, theme: "saints" | "animals" | "barbie" | "puppy" | "santa" | "space" | "minecraft") => {
    const cardInfo = getCardFact(theme, symbol);
    setSelectedCardInfo(cardInfo);
  };

  if (showModeSelector) {
    return (
      <GameModeSelector 
        currentMode={gameMode}
        onModeSelect={handleModeSelect}
        onStartGame={handleStartGame}
      />
    );
  }

  return (
    <div className="app-shell game-page min-h-[100dvh] bg-chess-bg font-nunito text-white">
      <div className="container mx-auto px-2 py-4 max-w-7xl">
        {/* Header Section */}
        <header className="game-heading">
          <div>
            <span className="game-eyebrow">Your table</span>
            <h1>Kompana</h1>
            <p className="text-sm text-gray-300 font-roboto">
              Challenge the AI · Test your memory · {gameMode} Cards
            </p>
          </div>
          <div className="game-rating" aria-label="Current game status">
            <small>Current mode</small>
            <strong>{gameMode}</strong>
            <span>cards</span>
          </div>
        </header>

        <div className="game-stat-strip" aria-label="Game statistics">
          <div className="game-stat"><strong>{gameState.playerScore}</strong><span>Your score</span></div>
          <div className="game-stat"><strong>{gameState.aiScore}</strong><span>AI score</span></div>
          <div className="game-stat"><strong>{gameState.moves}</strong><span>Moves</span></div>
          <div className="game-stat-progress">
            <label><span>Board progress</span><span>{gameState.cards.filter(card => card.isMatched).length}/{gameState.cards.length} matched</span></label>
            <i style={{ width: `${gameState.cards.length ? (gameState.cards.filter(card => card.isMatched).length / gameState.cards.length) * 100 : 0}%` }} />
            <small>Every reveal counts</small>
          </div>
        </div>

        {/* Game Layout - Sidebar + Main */}
        <div className="game-layout grid grid-cols-1 xl:grid-cols-4 gap-4">
          {/* Left Sidebar - Controls */}
          <div className="game-sidebar xl:col-span-1 space-y-4">
            <RatingDisplay ratingChange={ratingChange} />
            <DifficultySelector
              currentDifficulty={gameState.aiDifficulty}
              onDifficultyChange={changeDifficulty}
              membershipTier={user?.membershipTier || 'free'}
            />
            <ScoreBoard gameState={gameState} />
            <GameStatus gameState={gameState} onResetGame={resetGame} />
          </div>

          {/* Main Game Area */}
          <div className="game-main xl:col-span-3">
            {/* Card Information Display - Above Game Board */}
            {selectedCardInfo && (
              <div className="bg-chess-secondary/20 rounded-xl p-4 border border-chess-accent/30 mb-4 animate-in fade-in duration-300" data-testid="card-info-panel">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-chess-accent mb-2 flex items-center">
                       <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#e5b84c]" aria-hidden="true" />
                      {selectedCardInfo.name}
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed font-roboto">
                      {selectedCardInfo.fact}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedCardInfo(null)}
                    className="text-chess-accent hover:text-chess-secondary transition-colors ml-2"
                    data-testid="button-close-card-info"
                  >
                     <span className="text-lg" aria-hidden="true">×</span>
                  </button>
                </div>
              </div>
            )}
            
            <GameBoard
              gameState={gameState}
              onCardFlip={flipCard}
              onCardInfo={handleCardInfo}
              theme={theme}
            />
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 justify-center mt-4">
                <button
                  className="px-4 py-2 bg-chess-success hover:bg-chess-success/80 rounded-lg font-semibold text-sm transition-all duration-300 hover:transform hover:scale-105"
                  onClick={resetGame}
                  data-testid="button-new-game"
                >
                  New Game
                </button>
                <button
                  className="px-4 py-2 bg-chess-primary hover:bg-chess-primary/80 rounded-lg font-semibold text-sm transition-all duration-300 hover:transform hover:scale-105"
                  onClick={handleChangeMode}
                  data-testid="button-change-mode"
                >
                  Change Mode ({gameMode} Cards)
                </button>
            </div>
          </div>
        </div>

        {/* Victory Modal */}
        <VictoryModal
          isOpen={showVictoryModal}
          onClose={() => setShowVictoryModal(false)}
          gameState={gameState}
          onPlayAgain={resetGame}
        />
      </div>
    </div>
  );
}
