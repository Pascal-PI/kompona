import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame, Snowflake, Trophy, CheckCircle2, Calendar, Award } from 'lucide-react';

export interface DailyTodayResponse {
  challenge: {
    challengeDate: string;
    seed: number;
    boardSize: number;
    aiDifficulty: number;
  };
  completion: {
    playerScore: number;
    aiScore: number;
    won: boolean;
    moves: number;
    duration: number;
    completedAt: string;
  } | null;
  streak: {
    currentStreak: number;
    longestStreak: number;
    freezesAvailable: number;
    lastCompletedDate: string | null;
    nextMilestone: number | null;
    highestMilestone: number | null;
    earnedMilestones: number[];
  };
  milestones: number[];
}

interface DailyChallengeCardProps {
  onPlay: (seed: number, boardSize: number, aiDifficulty: number) => void;
  isPlaying?: boolean;
}

export function DailyChallengeCard({ onPlay, isPlaying }: DailyChallengeCardProps) {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const { data, isLoading } = useQuery<DailyTodayResponse>({
    queryKey: ['/api/daily/today', timeZone],
    queryFn: async () => {
      const res = await fetch(`/api/daily/today?timeZone=${encodeURIComponent(timeZone)}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch daily challenge');
      return res.json();
    },
    staleTime: 60 * 1000,
  });

  if (isLoading || !data) {
    return (
      <Card className="bg-gradient-to-br from-orange-500/20 to-red-600/20 border-orange-500/40" data-testid="card-daily-challenge">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-orange-300 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Daily Challenge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const completed = !!data.completion;
  const dateLabel = new Date(data.challenge.challengeDate + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
  });

  return (
    <Card className="bg-gradient-to-br from-orange-500/20 to-red-600/20 border-orange-500/40" data-testid="card-daily-challenge">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-orange-300 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Daily Challenge
          </CardTitle>
          <span className="text-xs text-gray-400" data-testid="text-daily-date">{dateLabel}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-orange-500/10 rounded-md" data-testid="streak-current">
            <div className="flex items-center justify-center gap-1 text-orange-400">
              <Flame className="w-3 h-3" />
              <span className="text-lg font-bold">{data.streak.currentStreak}</span>
            </div>
            <div className="text-[10px] text-gray-400 uppercase">Current</div>
          </div>
          <div className="text-center p-2 bg-yellow-500/10 rounded-md" data-testid="streak-longest">
            <div className="flex items-center justify-center gap-1 text-yellow-400">
              <Trophy className="w-3 h-3" />
              <span className="text-lg font-bold">{data.streak.longestStreak}</span>
            </div>
            <div className="text-[10px] text-gray-400 uppercase">Best</div>
          </div>
          <div className="text-center p-2 bg-blue-500/10 rounded-md" data-testid="streak-freezes">
            <div className="flex items-center justify-center gap-1 text-blue-300">
              <Snowflake className="w-3 h-3" />
              <span className="text-lg font-bold">{data.streak.freezesAvailable}</span>
            </div>
            <div className="text-[10px] text-gray-400 uppercase">Freezes</div>
          </div>
        </div>

        {data.streak.nextMilestone && (
          <div className="text-center text-xs text-gray-300" data-testid="text-next-milestone">
            <Award className="w-3 h-3 inline mr-1 text-yellow-400" />
            Next badge: {data.streak.nextMilestone}-day streak ({data.streak.nextMilestone - data.streak.currentStreak} to go)
          </div>
        )}

        {completed ? (
          <div className="bg-green-600/20 border border-green-500/40 rounded-md p-3 text-center" data-testid="status-completed">
            <CheckCircle2 className="w-6 h-6 mx-auto text-green-400 mb-1" />
            <div className="text-sm font-semibold text-green-300">
              {data.completion!.won ? 'You won today!' : data.completion!.playerScore === data.completion!.aiScore ? 'Tie today!' : 'Played today'}
            </div>
            <div className="text-xs text-gray-300 mt-1">
              {data.completion!.playerScore} - {data.completion!.aiScore} • {data.completion!.moves} moves
            </div>
            <div className="text-[10px] text-gray-400 mt-1">Come back tomorrow!</div>
          </div>
        ) : (
          <Button
            onClick={() => onPlay(data.challenge.seed, data.challenge.boardSize, data.challenge.aiDifficulty)}
            disabled={isPlaying}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
            data-testid="button-play-daily"
          >
            <Flame className="w-4 h-4 mr-2" />
            Play Today's Challenge
          </Button>
        )}

        <div className="text-[10px] text-gray-400 text-center">
          Same puzzle for all players • {data.challenge.boardSize} cards
        </div>
      </CardContent>
    </Card>
  );
}
