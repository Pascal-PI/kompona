import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Flame, Trophy, Snowflake, Award, Sparkles } from 'lucide-react';
import type { DailyResultData } from '@/hooks/use-pexeso-game';

interface StreakCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  result: DailyResultData;
}

const MILESTONE_TITLES: Record<number, string> = {
  3: 'Getting Started',
  7: 'One Week Warrior',
  14: 'Two Week Champion',
  30: 'Monthly Master',
  60: 'Two Month Legend',
  100: 'Century Club',
  365: 'Year-Long Hero',
};

export function StreakCelebration({ isOpen, onClose, result }: StreakCelebrationProps) {
  const hasNewMilestone = result.newMilestones.length > 0;
  const topMilestone = hasNewMilestone ? Math.max(...result.newMilestones) : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="bg-gradient-to-br from-orange-900 to-red-900 border-orange-500 text-white max-w-md" data-testid="dialog-streak-celebration">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center text-orange-300 flex items-center justify-center gap-2">
            {hasNewMilestone ? (
              <>
                <Sparkles className="w-6 h-6 text-yellow-400" />
                Milestone Achieved!
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </>
            ) : (
              <>
                <Flame className="w-6 h-6 text-orange-400" />
                Streak Continues!
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {hasNewMilestone && topMilestone && (
            <div className="text-center bg-yellow-500/20 border-2 border-yellow-500 rounded-lg p-4" data-testid="celebration-milestone">
              <Award className="w-12 h-12 mx-auto text-yellow-300 mb-2" />
              <div className="text-3xl font-bold text-yellow-300">{topMilestone}-Day Badge</div>
              <div className="text-sm text-yellow-200 mt-1">
                {MILESTONE_TITLES[topMilestone] || 'Milestone Unlocked'}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-orange-500/20 rounded-lg" data-testid="celebration-current">
              <div className="flex items-center justify-center gap-1 text-orange-300">
                <Flame className="w-5 h-5" />
                <span className="text-3xl font-bold">{result.currentStreak}</span>
              </div>
              <div className="text-xs text-gray-300 uppercase mt-1">Current Streak</div>
            </div>
            <div className="text-center p-3 bg-yellow-500/20 rounded-lg" data-testid="celebration-longest">
              <div className="flex items-center justify-center gap-1 text-yellow-300">
                <Trophy className="w-5 h-5" />
                <span className="text-3xl font-bold">{result.longestStreak}</span>
              </div>
              <div className="text-xs text-gray-300 uppercase mt-1">Longest</div>
            </div>
          </div>

          {result.freezeUsed && (
            <div className="bg-blue-500/20 border border-blue-400 rounded-md p-3 text-center text-sm text-blue-200" data-testid="celebration-freeze-used">
              <Snowflake className="w-4 h-4 inline mr-1" />
              Freeze used to protect your streak!
            </div>
          )}

          {!hasNewMilestone && result.nextMilestone && (
            <div className="text-center text-sm text-gray-200" data-testid="celebration-next">
              <Award className="w-4 h-4 inline mr-1 text-yellow-400" />
              Next badge at {result.nextMilestone} days
              ({result.nextMilestone - result.currentStreak} more to go)
            </div>
          )}

          <Button
            onClick={onClose}
            className="w-full bg-orange-500 hover:bg-orange-600"
            data-testid="button-celebration-close"
          >
            Awesome!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
