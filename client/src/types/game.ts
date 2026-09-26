export interface GameCard {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
  isHighlighted?: boolean;
}

export interface GameState {
  cards: GameCard[];
  playerScore: number;
  aiScore: number;
  currentTurn: 'player' | 'ai';
  flippedCards: number[];
  gameStatus: 'playing' | 'paused' | 'completed';
  moves: number;
  aiDifficulty: number;
  isAiThinking: boolean;
}

export interface AIPlayer {
  difficulty: number;
  makeMove: (cards: GameCard[], gameState: GameState) => Promise<number>;
  learnFromCards: (cards: GameCard[]) => void;
  resetMemory: () => void;
}

export interface DifficultyLevel {
  rating: number;
  label: string;
  color: string;
  hoverColor: string;
}
