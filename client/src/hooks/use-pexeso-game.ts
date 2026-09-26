import { useState, useCallback, useEffect } from 'react';
import { GameCard, GameState } from '../types/game';
import { PexesoAI } from '../lib/ai-player';
import { soundManager } from '../utils/soundManager';
import { seededShuffle } from '../lib/seededShuffle';

const CARD_SYMBOLS = [
  'saint-francis', 'saint-mary', 'saint-joseph', 'saint-anthony',
  'saint-teresa', 'saint-michael', 'saint-peter', 'saint-john',
  'saint-paul', 'saint-luke', 'saint-mark', 'saint-matthew',
  'saint-gabriel', 'saint-raphael', 'saint-thomas', 'saint-james',
  'saint-andrew', 'saint-bartholomew', 'saint-philip', 'saint-simon',
  'saint-jude', 'saint-matthias', 'saint-stephen', 'saint-lawrence',
  'saint-sebastian', 'saint-christopher', 'saint-patrick', 'saint-george',
  'saint-nicholas', 'saint-valentine', 'saint-martin', 'saint-augustine',
  'saint-jerome', 'saint-bernard', 'saint-dominic', 'saint-aquinas',
  'saint-catherine', 'saint-agnes', 'saint-clare', 'saint-cecilia',
  'saint-lucy', 'saint-barbara', 'saint-margaret', 'saint-rita',
  'saint-bernadette', 'saint-joan', 'saint-therese', 'saint-monica',
  'saint-helena', 'saint-elizabeth', 'saint-anne', 'saint-martha',
  'saint-magdalene', 'saint-veronica', 'saint-anastasia', 'saint-agatha',
  'saint-polycarp', 'saint-ignatius', 'saint-justin', 'saint-cyprian',
  'saint-ambrose', 'saint-chrysostom', 'saint-basil', 'saint-gregory'
];

export type GameMode = 8 | 16 | 32 | 48 | 64 | 96;

export interface InitializeGameOptions {
  difficulty?: number;
  mode?: GameMode;
  seed?: number;
  daily?: boolean;
}

export interface DailyResultData {
  currentStreak: number;
  longestStreak: number;
  freezesAvailable: number;
  newMilestones: number[];
  nextMilestone: number | null;
  highestMilestone: number | null;
  freezeUsed: boolean;
  alreadyCompletedToday: boolean;
}

export function usePexesoGame() {
  const [gameState, setGameState] = useState<GameState>({
    cards: [],
    playerScore: 0,
    aiScore: 0,
    currentTurn: 'player',
    flippedCards: [],
    gameStatus: 'playing',
    moves: 0,
    aiDifficulty: 1000,
    isAiThinking: false,
  });
  
  const [gameMode, setGameMode] = useState<GameMode>(16);

  const [ai] = useState(() => new PexesoAI(1000));
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [ratingChange, setRatingChange] = useState<{
    oldRating: number;
    newRating: number;
    change: number;
    tier: string;
  } | null>(null);
  const [isDailyMode, setIsDailyMode] = useState(false);
  const [dailySeed, setDailySeed] = useState<number | null>(null);
  const [dailyResult, setDailyResult] = useState<DailyResultData | null>(null);

  const initializeGame = useCallback((
    difficultyOrOptions?: number | InitializeGameOptions,
    mode?: GameMode,
  ) => {
    let difficulty: number | undefined;
    let resolvedMode: GameMode | undefined;
    let seed: number | undefined;
    let daily = false;

    if (typeof difficultyOrOptions === 'object' && difficultyOrOptions !== null) {
      difficulty = difficultyOrOptions.difficulty;
      resolvedMode = difficultyOrOptions.mode;
      seed = difficultyOrOptions.seed;
      daily = !!difficultyOrOptions.daily;
    } else {
      difficulty = difficultyOrOptions;
      resolvedMode = mode;
    }

    const newMode = resolvedMode || gameMode;
    const pairCount = newMode / 2;

    if (pairCount > CARD_SYMBOLS.length) {
      console.error(`Not enough symbols for ${newMode} cards. Maximum available: ${CARD_SYMBOLS.length * 2}`);
      return;
    }

    const symbols = CARD_SYMBOLS.slice(0, pairCount);
    const cardPairs = symbols.flatMap(symbol => [symbol, symbol]);

    let shuffled: { symbol: string; index: number }[];
    const indexed = cardPairs.map((symbol, index) => ({ symbol, index }));
    if (typeof seed === 'number') {
      shuffled = seededShuffle(indexed, seed);
    } else {
      shuffled = [...indexed].sort(() => Math.random() - 0.5);
    }

    const newCards: GameCard[] = shuffled.map((item, index) => ({
      id: index,
      symbol: item.symbol,
      isFlipped: false,
      isMatched: false,
    }));

    const newDifficulty = difficulty || gameState.aiDifficulty;
    ai.difficulty = newDifficulty;
    ai.resetMemory();

    setGameMode(newMode);
    setIsDailyMode(daily);
    setDailySeed(daily && typeof seed === 'number' ? seed : null);
    setDailyResult(null);
    setGameState({
      cards: newCards,
      playerScore: 0,
      aiScore: 0,
      currentTurn: 'player',
      flippedCards: [],
      gameStatus: 'playing',
      moves: 0,
      aiDifficulty: newDifficulty,
      isAiThinking: false,
    });
    setShowVictoryModal(false);
    setGameStartTime(Date.now());
    setRatingChange(null);
  }, [gameState.aiDifficulty, ai, gameMode]);

  const flipCard = useCallback((cardIndex: number) => {
    setGameState(prev => {
      if (prev.gameStatus !== 'playing' || 
          prev.currentTurn !== 'player' ||
          prev.isAiThinking ||
          prev.flippedCards.length >= 2) {
        return prev;
      }

      const card = prev.cards[cardIndex];
      if (!card || card.isFlipped || card.isMatched) {
        return prev;
      }

      const newCards = [...prev.cards];
      newCards[cardIndex] = { ...card, isFlipped: true };
      const newFlippedCards = [...prev.flippedCards, cardIndex];

      ai.learnFromCards(newCards);
      soundManager.playFlip();

      return {
        ...prev,
        cards: newCards,
        flippedCards: newFlippedCards,
        moves: prev.moves + 1,
      };
    });
  }, [ai]);

  const checkForMatch = useCallback(() => {
    if (gameState.flippedCards.length === 2) {
      const [first, second] = gameState.flippedCards;
      const firstCard = gameState.cards[first];
      const secondCard = gameState.cards[second];

      setTimeout(() => {
        setGameState(prev => {
          const newCards = [...prev.cards];
          let newPlayerScore = prev.playerScore;
          let newAiScore = prev.aiScore;
          
          if (firstCard.symbol === secondCard.symbol) {
            newCards[first] = { ...firstCard, isMatched: true };
            newCards[second] = { ...secondCard, isMatched: true };
            soundManager.playMatch();
            
            if (prev.currentTurn === 'player') {
              newPlayerScore++;
            } else {
              newAiScore++;
            }
          } else {
            newCards[first] = { ...firstCard, isFlipped: false };
            newCards[second] = { ...secondCard, isFlipped: false };
          }

          const allMatched = newCards.every(card => card.isMatched);
          const newGameStatus = allMatched ? 'completed' : 'playing';

          const keepTurn = firstCard.symbol === secondCard.symbol;
          const newCurrentTurn = keepTurn ? prev.currentTurn : 
            (prev.currentTurn === 'player' ? 'ai' : 'player');

          return {
            ...prev,
            cards: newCards,
            playerScore: newPlayerScore,
            aiScore: newAiScore,
            flippedCards: [],
            currentTurn: newCurrentTurn,
            gameStatus: newGameStatus,
          };
        });
      }, 1000);
    }
  }, [gameState.flippedCards, gameState.cards]);

  const makeAIMove = useCallback(async () => {
    if (gameState.currentTurn !== 'ai' || 
        gameState.gameStatus !== 'playing' ||
        gameState.flippedCards.length >= 2) {
      return;
    }

    setGameState(prev => ({ ...prev, isAiThinking: true }));

    try {
      const cardIndex = await ai.makeMove(gameState.cards, gameState);
      
      setGameState(prev => {
        const newCards = [...prev.cards];
        newCards[cardIndex] = { ...newCards[cardIndex], isFlipped: true };
        const newFlippedCards = [...prev.flippedCards, cardIndex];

        soundManager.playFlip();

        return {
          ...prev,
          cards: newCards,
          flippedCards: newFlippedCards,
          moves: prev.moves + 1,
          isAiThinking: false,
        };
      });
    } catch (error) {
      console.error('AI move failed:', error);
      setGameState(prev => ({ ...prev, isAiThinking: false }));
    }
  }, [gameState, ai]);

  const changeDifficulty = useCallback((difficulty: number) => {
    ai.difficulty = difficulty;
    setGameState(prev => ({ ...prev, aiDifficulty: difficulty }));
  }, [ai]);

  const resetGame = useCallback(() => {
    initializeGame();
  }, [initializeGame]);

  const recordGameResult = useCallback(async () => {
    if (gameState.gameStatus !== 'completed' || !gameStartTime) return;

    try {
      const duration = Math.floor((Date.now() - gameStartTime) / 1000);

      if (isDailyMode) {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        const response = await fetch('/api/daily/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            timeZone,
            playerScore: gameState.playerScore,
            aiScore: gameState.aiScore,
            moves: gameState.moves,
            duration,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          setDailyResult({
            currentStreak: result.streak.currentStreak,
            longestStreak: result.streak.longestStreak,
            freezesAvailable: result.streak.freezesAvailable,
            newMilestones: result.update.newMilestones || [],
            nextMilestone: result.streak.nextMilestone ?? null,
            highestMilestone: result.streak.highestMilestone ?? null,
            freezeUsed: !!result.update.freezeUsed,
            alreadyCompletedToday: !!result.update.alreadyCompletedToday,
          });
        }
        return;
      }

      const response = await fetch('/api/games/result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          gameMode: gameMode,
          playerScore: gameState.playerScore,
          aiScore: gameState.aiScore,
          aiDifficulty: gameState.aiDifficulty,
          moves: gameState.moves,
          duration: duration,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setRatingChange({
          oldRating: result.game.ratingBefore,
          newRating: result.game.ratingAfter,
          change: result.game.ratingChange,
          tier: result.ratingInfo.currentTier,
        });
      }
    } catch (error) {
      console.error('Failed to record game result:', error);
    }
  }, [gameState.gameStatus, gameState.playerScore, gameState.aiScore, gameState.aiDifficulty, gameState.moves, gameMode, gameStartTime, isDailyMode]);

  useEffect(() => {
    initializeGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (gameState.gameStatus === 'completed') {
      if (gameState.playerScore > gameState.aiScore) {
        soundManager.playWin();
      } else if (gameState.playerScore < gameState.aiScore) {
        soundManager.playLose();
      } else {
        soundManager.playWin();
      }
      
      recordGameResult();
      setShowVictoryModal(true);
    }
  }, [gameState.gameStatus, gameState.playerScore, gameState.aiScore, recordGameResult]);

  useEffect(() => {
    checkForMatch();
  }, [checkForMatch]);

  useEffect(() => {
    if (gameState.currentTurn === 'ai' && 
        gameState.gameStatus === 'playing' && 
        gameState.flippedCards.length < 2 &&
        !gameState.isAiThinking) {
      makeAIMove();
    }
  }, [gameState.currentTurn, gameState.gameStatus, gameState.flippedCards.length, gameState.isAiThinking, makeAIMove]);

  return {
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
    isDailyMode,
    dailySeed,
    dailyResult,
  };
}
