import { GameCard } from './GameCard';
import { GameState } from '../../types/game';

interface GameBoardProps {
  gameState: GameState;
  onCardFlip: (index: number) => void;
  onCardInfo?: (symbol: string, theme: "saints" | "animals" | "barbie" | "puppy" | "santa" | "space" | "minecraft") => void;
  theme?: "saints" | "animals" | "barbie" | "puppy" | "santa" | "space" | "minecraft";
}

export function GameBoard({ gameState, onCardFlip, onCardInfo, theme = "saints" }: GameBoardProps) {
  const isPlayerTurn = gameState.currentTurn === 'player';
  const canFlip = isPlayerTurn && gameState.gameStatus === 'playing' && !gameState.isAiThinking;
  
  // Determine grid layout based on number of cards
  const cardCount = gameState.cards.length;
  const getGridConfig = () => {
    switch (cardCount) {
      case 8: return { cols: 'grid-cols-4', maxWidth: 'max-w-md', gap: 'gap-3' };
      case 16: return { cols: 'grid-cols-4', maxWidth: 'max-w-lg', gap: 'gap-2' };
      case 32: return { cols: 'grid-cols-8', maxWidth: 'max-w-4xl', gap: 'gap-2' };
      case 48: return { cols: 'grid-cols-8', maxWidth: 'max-w-5xl', gap: 'gap-1' };
      case 64: return { cols: 'grid-cols-8', maxWidth: 'max-w-6xl', gap: 'gap-1' };
      case 96: return { cols: 'grid-cols-12', maxWidth: 'max-w-7xl', gap: 'gap-1' };
      case 128: return { cols: 'grid-cols-16', maxWidth: 'max-w-full', gap: 'gap-1' };
      default: return { cols: 'grid-cols-4', maxWidth: 'max-w-lg', gap: 'gap-2' };
    }
  };
  
  const { cols, maxWidth, gap } = getGridConfig();

  return (
    <div className="game-board-shell mb-4 rounded-[22px] p-3 sm:p-5">
      <div className={`grid ${cols} ${gap} ${maxWidth} mx-auto`}>
        {gameState.cards.map((card, index) => (
          <GameCard
            key={card.id}
            card={card}
            index={index}
            onFlip={onCardFlip}
            onCardInfo={onCardInfo}
            disabled={!canFlip}
            theme={theme}
          />
        ))}
      </div>
    </div>
  );
}
