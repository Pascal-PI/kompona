import { GameState } from '../../types/game';
import { Dialog, DialogContent } from '../ui/dialog';

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onPlayAgain: () => void;
}

export function VictoryModal({ isOpen, onClose, gameState, onPlayAgain }: VictoryModalProps) {
  const winner = gameState.playerScore > gameState.aiScore ? 'Player' : 
                gameState.aiScore > gameState.playerScore ? 'AI' : 'Tie';
  
  const winnerText = winner === 'Player' ? 'Player Wins!' :
                    winner === 'AI' ? 'AI Wins!' : 'It\'s a Tie!';

  const handlePlayAgain = () => {
    onPlayAgain();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-chess-bg border border-chess-primary rounded-2xl p-8 max-w-md text-center">
        <div className="mb-6">
          <i className="fas fa-trophy text-6xl text-chess-success mb-4"></i>
          <h2 className="text-3xl font-bold text-chess-secondary mb-2">Game Complete!</h2>
          <p className="text-lg text-gray-300">Congratulations on the match!</p>
        </div>
        
        <div className="bg-chess-primary/20 rounded-xl p-4 mb-6">
          <div className="text-2xl font-bold text-chess-success mb-2">{winnerText}</div>
          <div className="text-sm text-gray-300">
            Final Score: <span className="text-chess-secondary font-semibold">
              Player {gameState.playerScore} - AI {gameState.aiScore}
            </span>
          </div>
          <div className="text-sm text-gray-300">
            Total Moves: <span className="text-chess-secondary font-semibold">{gameState.moves}</span>
          </div>
          <div className="text-sm text-gray-300">
            AI Rating: <span className="text-chess-accent font-semibold">{gameState.aiDifficulty}</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            className="flex-1 px-6 py-3 bg-chess-success hover:bg-chess-success/80 rounded-lg font-semibold transition-all duration-300"
            onClick={handlePlayAgain}
          >
            <i className="fas fa-redo mr-2"></i>
            Play Again
          </button>
          <button 
            className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg font-semibold transition-all duration-300"
            onClick={onClose}
          >
            <i className="fas fa-times mr-2"></i>
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
