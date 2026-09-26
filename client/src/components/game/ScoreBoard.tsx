import { GameState } from '../../types/game';

interface ScoreBoardProps {
  gameState: GameState;
}

export function ScoreBoard({ gameState }: ScoreBoardProps) {
  return (
    <div className="pascal-panel rounded-[18px] p-4">
      <h3 className="text-lg font-bold mb-3 text-chess-secondary flex items-center">
         <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#e5b84c]" aria-hidden="true" />
        Score Board
      </h3>
      <div className="space-y-3">
         <div className="flex justify-between items-center p-2 bg-chess-secondary/10 rounded-lg border border-[#d8cec0]">
          <div className="flex items-center">
             <span className="mr-2 h-2 w-2 rounded-full bg-[#397c70]" aria-hidden="true" />
            <span className="font-semibold text-sm">Player</span>
          </div>
          <span className="text-xl font-bold text-chess-success">
            {gameState.playerScore}
          </span>
        </div>
         <div className="flex justify-between items-center p-2 bg-chess-accent/10 rounded-lg border border-[#d8cec0]">
          <div className="flex items-center">
             <span className="mr-2 h-2 w-2 rounded-full bg-[#d85b3f]" aria-hidden="true" />
            <span className="font-semibold text-sm">AI ({gameState.aiDifficulty})</span>
          </div>
          <span className="text-xl font-bold text-chess-accent">
            {gameState.aiScore}
          </span>
        </div>
      </div>
    </div>
  );
}
