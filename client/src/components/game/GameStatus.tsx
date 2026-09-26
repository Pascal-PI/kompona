import { GameState } from '../../types/game';
import { RotateCcw } from 'lucide-react';

interface GameStatusProps {
  gameState: GameState;
  onResetGame: () => void;
}

export function GameStatus({ gameState, onResetGame }: GameStatusProps) {
  const cardsLeft = gameState.cards.filter(card => !card.isMatched).length;
  
  const getCurrentTurnText = () => {
    if (gameState.gameStatus === 'completed') {
      return 'Game Complete';
    }
    if (gameState.isAiThinking) {
      return 'AI Thinking...';
    }
    return gameState.currentTurn === 'player' ? 'Your Turn' : 'AI Turn';
  };

  const getTurnIndicatorClass = () => {
    if (gameState.gameStatus === 'completed') {
      return 'flex items-center px-3 py-1 bg-gray-600 rounded-full';
    }
    if (gameState.isAiThinking) {
      return 'flex items-center px-3 py-1 bg-chess-accent rounded-full animate-pulse-green';
    }
    return gameState.currentTurn === 'player' 
      ? 'flex items-center px-3 py-1 bg-chess-success rounded-full'
      : 'flex items-center px-3 py-1 bg-chess-accent rounded-full';
  };

  return (
    <div className="pascal-panel rounded-[18px] p-4">
      <h3 className="text-lg font-bold mb-3 text-chess-secondary flex items-center">
         <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#397c70]" aria-hidden="true" />
        Game Status
      </h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-300">Current Turn</span>
          <div className={getTurnIndicatorClass()}>
             <span className="mr-1 h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
            <span className="font-semibold text-xs">{getCurrentTurnText()}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-300">Cards Left</span>
          <span className="text-sm font-bold text-chess-secondary">{cardsLeft}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-300">Moves</span>
          <span className="text-sm font-bold text-chess-secondary">{gameState.moves}</span>
        </div>
      </div>
      <button 
        className="w-full mt-3 bg-chess-primary hover:bg-chess-primary/80 p-2 rounded-lg font-semibold text-sm transition-all duration-300 hover:transform hover:scale-105"
        onClick={onResetGame}
      >
         <RotateCcw className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
        New Game
      </button>
    </div>
  );
}
