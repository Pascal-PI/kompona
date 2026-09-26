import { DifficultyLevel } from '../../types/game';
import { cn } from '../../lib/utils';
import { Lock, Crown } from 'lucide-react';

interface DifficultySelectorProps {
  currentDifficulty: number;
  onDifficultyChange: (difficulty: number) => void;
  membershipTier?: string;
}

interface ExtendedDifficultyLevel extends DifficultyLevel {
  isPlatinumExclusive?: boolean;
}

const standardDifficultyLevels: ExtendedDifficultyLevel[] = [
  { rating: 100, label: 'Beginner', color: 'bg-green-600', hoverColor: 'hover:bg-green-500' },
  { rating: 500, label: 'Novice', color: 'bg-blue-600', hoverColor: 'hover:bg-blue-500' },
  { rating: 1000, label: 'Intermediate', color: 'bg-chess-primary', hoverColor: 'hover:bg-chess-primary/80' },
  { rating: 1500, label: 'Advanced', color: 'bg-orange-600', hoverColor: 'hover:bg-orange-500' },
  { rating: 2000, label: 'Expert', color: 'bg-red-600', hoverColor: 'hover:bg-red-500' },
  { rating: 2500, label: 'Master', color: 'bg-purple-600', hoverColor: 'hover:bg-purple-500' },
];

const platinumExclusiveLevels: ExtendedDifficultyLevel[] = [
  { rating: 250, label: 'Easy+', color: 'bg-gradient-to-r from-green-500 to-blue-500', hoverColor: 'hover:opacity-90', isPlatinumExclusive: true },
  { rating: 750, label: 'Rising', color: 'bg-gradient-to-r from-blue-500 to-cyan-500', hoverColor: 'hover:opacity-90', isPlatinumExclusive: true },
  { rating: 1250, label: 'Skilled', color: 'bg-gradient-to-r from-cyan-500 to-yellow-500', hoverColor: 'hover:opacity-90', isPlatinumExclusive: true },
  { rating: 1750, label: 'Elite', color: 'bg-gradient-to-r from-orange-500 to-red-500', hoverColor: 'hover:opacity-90', isPlatinumExclusive: true },
  { rating: 2250, label: 'Champion', color: 'bg-gradient-to-r from-red-500 to-purple-500', hoverColor: 'hover:opacity-90', isPlatinumExclusive: true },
  { rating: 3000, label: 'Legendary', color: 'bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400', hoverColor: 'hover:opacity-90', isPlatinumExclusive: true },
];

export function DifficultySelector({ currentDifficulty, onDifficultyChange, membershipTier = 'free' }: DifficultySelectorProps) {
  const isPlatinum = membershipTier === 'platinum';
  
  const allLevels = isPlatinum 
    ? [...standardDifficultyLevels, ...platinumExclusiveLevels].sort((a, b) => a.rating - b.rating)
    : standardDifficultyLevels;

  return (
    <div className="pascal-panel rounded-[18px] p-4">
      <h3 className="text-lg font-bold mb-3 text-chess-secondary flex items-center">
        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#d85b3f]" aria-hidden="true" />
        AI Difficulty
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {allLevels.map((level) => (
          <button
            key={level.rating}
            className={cn(
              "difficulty-badge p-2 rounded-lg text-center transition-all duration-300 relative",
              "bg-[#fffaf1] text-[#192434] hover:bg-[#edf1eb] border border-[#d8cec0]",
               currentDifficulty === level.rating && "selected ring-2 ring-[#397c70]",
               level.isPlatinumExclusive && "ring-1 ring-[#e5b84c]/60"
            )}
            onClick={() => onDifficultyChange(level.rating)}
            data-testid={`button-difficulty-${level.rating}`}
          >
            {level.isPlatinumExclusive && (
             <Crown className="w-3 h-3 absolute top-1 right-1 text-[#e5b84c]" />
            )}
            <div className="font-bold text-sm">
              {level.rating === 2500 ? '2500+' : level.rating === 3000 ? '3000+' : level.rating}
            </div>
            <div className="text-xs opacity-80">{level.label}</div>
          </button>
        ))}
      </div>
      
      {!isPlatinum && (
        <div className="mt-3 p-2 bg-purple-600/20 rounded-lg border border-purple-500/30">
           <div className="flex items-center gap-2 text-xs text-[#24594f]">
            <Lock className="w-3 h-3" />
            <span>6 more difficulty levels with Platinum</span>
          </div>
        </div>
      )}
    </div>
  );
}
