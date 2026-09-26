import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Crown, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { User as UserType } from '@shared/schema';

interface LeaderboardPlayer {
  id: string;
  username: string;
  rating: number;
  gamesPlayed: number;
  gamesWon: number;
  membershipTier: string;
  avatarUrl: string | null;
  rank: number;
  tier: string;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="w-6 h-6 text-yellow-500" />;
    case 2:
      return <Medal className="w-6 h-6 text-gray-400" />;
    case 3:
      return <Medal className="w-6 h-6 text-orange-500" />;
    default:
      return <span className="w-6 h-6 flex items-center justify-center text-gray-400 font-bold">{rank}</span>;
  }
};

const getRankBgColor = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/50';
    case 2:
      return 'bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/50';
    case 3:
      return 'bg-gradient-to-r from-orange-500/20 to-orange-600/10 border-orange-500/50';
    default:
      return 'bg-chess-secondary/10 border-chess-secondary/30';
  }
};

const getTierColor = (tier: string) => {
  const tierColors: Record<string, string> = {
    'Novice': 'bg-gray-500',
    'Beginner': 'bg-green-600',
    'Intermediate': 'bg-blue-500',
    'Advanced': 'bg-purple-500',
    'Expert': 'bg-orange-500',
    'Master': 'bg-red-500',
    'Grandmaster': 'bg-yellow-500',
  };
  return tierColors[tier] || 'bg-gray-500';
};

export default function Leaderboard() {
  const { user } = useAuth();

  const { data: leaderboard, isLoading } = useQuery<LeaderboardPlayer[]>({
    queryKey: ['/api/leaderboard'],
  });

  const typedUser = user as UserType | null;

  return (
    <div className="app-shell min-h-[100dvh] bg-chess-bg font-nunito text-white">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-chess-secondary flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Leaderboard
          </h1>
          <p className="text-gray-300 font-roboto">Compete with players and climb the global ratings</p>
        </header>

        <Card className="bg-chess-secondary/20 border-chess-secondary/30">
              <CardHeader className="pb-2">
                <div className="grid grid-cols-12 text-sm text-gray-400 font-medium px-2">
                  <div className="col-span-1">Rank</div>
                  <div className="col-span-4">Player</div>
                  <div className="col-span-2 text-center">Rating</div>
                  <div className="col-span-3 text-center">Games</div>
                  <div className="col-span-2 text-center">Win%</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(8)].map((_, i) => (<Skeleton key={i} className="h-16 w-full" />))}
                  </div>
                ) : leaderboard && leaderboard.length > 0 ? (
                  leaderboard.map((player) => {
                    const isCurrentUser = typedUser && typedUser.id === player.id;
                    const winRate = player.gamesPlayed > 0
                      ? ((player.gamesWon / player.gamesPlayed) * 100).toFixed(1)
                      : '0.0';
                    return (
                      <div
                        key={player.id}
                        className={`grid grid-cols-12 items-center p-3 rounded-lg border transition-all ${getRankBgColor(player.rank)} ${isCurrentUser ? 'ring-2 ring-chess-primary' : ''}`}
                        data-testid={`leaderboard-row-${player.rank}`}
                      >
                        <div className="col-span-1 flex items-center justify-center">{getRankIcon(player.rank)}</div>
                        <div className="col-span-4 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-chess-primary/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {player.avatarUrl ? (
                              <img src={player.avatarUrl} alt={`${player.username}'s avatar`} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-4 h-4 text-chess-primary" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${isCurrentUser ? 'text-chess-primary' : 'text-white'}`}>{player.username}</span>
                              {isCurrentUser && <span className="text-xs text-chess-primary ml-1">(You)</span>}
                              {(player.membershipTier === 'premium' || player.membershipTier === 'platinum') && (
                                <Crown className="w-4 h-4 text-yellow-500" />
                              )}
                            </div>
                            <Badge className={`${getTierColor(player.tier)} text-white text-xs mt-1`}>{player.tier}</Badge>
                          </div>
                        </div>
                        <div className="col-span-2 text-center">
                          <span className="text-xl font-bold text-chess-primary">{player.rating}</span>
                        </div>
                        <div className="col-span-3 text-center text-gray-300">{player.gamesPlayed}</div>
                        <div className="col-span-2 text-center">
                          <span className={`font-medium text-sm ${parseFloat(winRate) >= 60 ? 'text-green-500' : parseFloat(winRate) >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>{winRate}%</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No players yet. Be the first to play!</p>
                  </div>
                )}
              </CardContent>
        </Card>
      </div>
    </div>
  );
}
