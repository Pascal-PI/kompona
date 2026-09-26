import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Trophy, BarChart3, Gamepad2, Star, Brain, Grid3x3, Crown, Palette, Users, Camera, X } from 'lucide-react';
import type { User as UserType } from '@shared/schema';
import { useRef, useState } from 'react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface UserStats {
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  totalMatches: number;
  totalMoves: number;
  avgMovesPerGame: number;
  avgGameDuration: number;
  bestStreak: number;
  currentStreak: number;
  favoriteMode: number | null;
  performanceByDifficulty: { [key: string]: { wins: number; total: number; winRate: number } };
  performanceByMode: { [key: number]: { wins: number; total: number; winRate: number } };
  recentGames: any[];
}

export default function Profile() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery<UserType>({
    queryKey: ['/api/auth/user'],
  });

  const avatarMutation = useMutation({
    mutationFn: async (avatarUrl: string | null) => {
      return apiRequest('/api/user/avatar', {
        method: 'PATCH',
        body: JSON.stringify({ avatarUrl }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been updated successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Update failed',
        description: 'Failed to update your profile picture. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 500000) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 500KB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      await avatarMutation.mutateAsync(dataUrl);
      setIsUploading(false);
    };
    reader.onerror = () => {
      toast({
        title: 'Error',
        description: 'Failed to read the image file.',
        variant: 'destructive',
      });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    await avatarMutation.mutateAsync(null);
  };

  const { data: ratingData, isLoading: ratingLoading } = useQuery<{
    rating: number;
    gamesPlayed: number;
    gamesWon: number;
    winRate: string;
    ratingInfo: {
      currentTier: string;
      minRating: number;
      maxRating: number;
    };
  }>({
    queryKey: ['/api/user/rating'],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ['/api/user/stats'],
  });

  const isLoading = userLoading || ratingLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="app-shell min-h-[100dvh] bg-chess-bg font-nunito text-white">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="app-shell min-h-[100dvh] bg-chess-bg font-nunito text-white">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-chess-secondary flex items-center gap-3">
            <User className="w-8 h-8 text-chess-primary" />
            Player Profile
          </h1>
          <p className="text-gray-300 font-roboto">View your statistics and game progress</p>
        </header>

        {/* User Info Card */}
        <Card className="bg-chess-secondary/20 border-chess-secondary/30 mb-6" data-testid="card-user-info">
          <CardHeader>
            <div className="flex items-center gap-4">
              {/* Editable Avatar */}
              <div className="relative group" data-testid="avatar-container">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                  data-testid="input-avatar-file"
                />
                <div 
                  className="w-20 h-20 rounded-full bg-chess-primary/20 border-2 border-chess-primary flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-change-avatar"
                >
                  {user?.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      data-testid="img-avatar"
                    />
                  ) : (
                    <User className="w-10 h-10 text-chess-primary" />
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <button
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-chess-primary rounded-full flex items-center justify-center hover:bg-chess-primary/80 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-upload-avatar"
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
                {user?.avatarUrl && (
                  <button
                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    onClick={handleRemoveAvatar}
                    data-testid="button-remove-avatar"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                )}
              </div>
              <div>
                <CardTitle className="text-2xl text-chess-secondary flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-chess-primary" />
                  {user?.username || 'Player'}
                  {(user?.membershipTier === 'premium' || user?.membershipTier === 'platinum') && (
                    <Badge className={`bg-gradient-to-r ${user?.membershipTier === 'platinum' ? 'from-purple-500 to-indigo-500' : 'from-yellow-500 to-orange-500'} text-white ml-2`}>
                      <Crown className="w-3 h-3 mr-1" />
                      {user?.membershipTier === 'platinum' ? 'Platinum' : 'Premium'}
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-gray-400 mt-1">Click on avatar to change</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-chess-primary/10 rounded-lg" data-testid="stat-rating">
                <div className="text-3xl font-bold text-chess-primary">{ratingData?.rating || 1200}</div>
                <div className="text-sm text-gray-400 mt-1">Rating</div>
                <div className="text-xs text-chess-secondary mt-1">{ratingData?.ratingInfo?.currentTier || 'Beginner'}</div>
              </div>
              <div className="text-center p-3 bg-chess-success/10 rounded-lg" data-testid="stat-games-played">
                <div className="text-3xl font-bold text-chess-success">{stats?.totalGames || 0}</div>
                <div className="text-sm text-gray-400 mt-1">Games Played</div>
              </div>
              <div className="text-center p-3 bg-chess-accent/10 rounded-lg" data-testid="stat-win-rate">
                <div className="text-3xl font-bold text-chess-accent">{stats?.winRate || 0}%</div>
                <div className="text-sm text-gray-400 mt-1">Win Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Owned Themes Card */}
        <Card className="bg-chess-secondary/20 border-chess-secondary/30 mb-6" data-testid="card-owned-themes">
          <CardHeader>
            <CardTitle className="text-lg text-chess-secondary flex items-center gap-2">
              <Palette className="w-5 h-5 text-chess-primary" />
              Owned Themes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['saints', 'animals', 'barbie', 'puppy'].map((theme) => {
                const ownedThemes = user?.ownedThemes || ['saints'];
                const hasMembership = user?.membershipTier === 'premium' || user?.membershipTier === 'platinum';
                const isOwned = theme === 'saints' || ownedThemes.includes(theme) || hasMembership;
                const themeInfo: Record<string, { name: string; icon: string; color: string; isFree: boolean }> = {
                  saints: { name: 'Catholic Saints', icon: 'fa-cross', color: 'text-yellow-500', isFree: true },
                  animals: { name: 'Animals', icon: 'fa-paw', color: 'text-green-500', isFree: false },
                  barbie: { name: 'Barbie', icon: 'fa-star', color: 'text-pink-500', isFree: false },
                  puppy: { name: 'Puppies', icon: 'fa-dog', color: 'text-orange-500', isFree: false },
                };
                const info = themeInfo[theme];
                return (
                  <div 
                    key={theme}
                    className={`p-4 rounded-lg text-center ${
                      isOwned 
                        ? 'bg-chess-primary/20 border-2 border-chess-primary' 
                        : 'bg-gray-700/20 border border-gray-600 opacity-50'
                    }`}
                    data-testid={`theme-${theme}`}
                  >
                    <i className={`fas ${info.icon} text-3xl ${isOwned ? info.color : 'text-gray-500'} mb-2`} />
                    <div className={`text-sm font-medium ${isOwned ? 'text-white' : 'text-gray-500'}`}>
                      {info.name}
                    </div>
                    {info.isFree ? (
                      <Badge variant="outline" className="mt-2 text-xs border-blue-500 text-blue-500">
                        Free
                      </Badge>
                    ) : isOwned ? (
                      <Badge variant="outline" className="mt-2 text-xs border-green-500 text-green-500">
                        Owned
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="mt-2 text-xs border-gray-500 text-gray-500">
                        Locked
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Win/Loss Stats */}
          <Card className="bg-chess-secondary/20 border-chess-secondary/30" data-testid="card-win-loss">
            <CardHeader>
              <CardTitle className="text-lg text-chess-secondary flex items-center gap-2">
                <i className="fas fa-chart-bar text-chess-primary"></i>
                Win / Loss
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Wins</span>
                  <span className="text-chess-success font-bold text-xl" data-testid="text-total-wins">{stats?.totalWins || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Losses</span>
                  <span className="text-red-500 font-bold text-xl" data-testid="text-total-losses">{stats?.totalLosses || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Game Metrics */}
          <Card className="bg-chess-secondary/20 border-chess-secondary/30" data-testid="card-game-metrics">
            <CardHeader>
              <CardTitle className="text-lg text-chess-secondary flex items-center gap-2">
                <i className="fas fa-gamepad text-chess-primary"></i>
                Game Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Matches</span>
                  <span className="text-white font-bold" data-testid="text-total-matches">{stats?.totalMatches || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Moves</span>
                  <span className="text-white font-bold" data-testid="text-total-moves">{stats?.totalMoves || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Avg Moves/Game</span>
                  <span className="text-white font-bold" data-testid="text-avg-moves">{stats?.avgMovesPerGame || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Avg Duration</span>
                  <span className="text-white font-bold" data-testid="text-avg-duration">
                    {stats?.avgGameDuration ? formatDuration(stats.avgGameDuration) : '0m 0s'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Favorite Mode */}
          <Card className="bg-chess-secondary/20 border-chess-secondary/30" data-testid="card-favorite-mode">
            <CardHeader>
              <CardTitle className="text-lg text-chess-secondary flex items-center gap-2">
                <i className="fas fa-star text-chess-primary"></i>
                Favorite Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-5xl font-bold text-chess-primary" data-testid="text-favorite-mode">
                  {stats?.favoriteMode || 'N/A'}
                </div>
                <div className="text-sm text-gray-400 mt-2">Cards</div>
                {stats?.favoriteMode && stats.performanceByMode[stats.favoriteMode] && (
                  <div className="mt-4 space-y-1">
                    <div className="text-sm text-gray-400">
                      {stats.performanceByMode[stats.favoriteMode].wins} / {stats.performanceByMode[stats.favoriteMode].total} wins
                    </div>
                    <div className="text-lg text-chess-success font-bold">
                      {stats.performanceByMode[stats.favoriteMode].winRate.toFixed(1)}% win rate
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance by Difficulty */}
        {stats && Object.keys(stats.performanceByDifficulty).length > 0 && (
          <Card className="bg-chess-secondary/20 border-chess-secondary/30 mb-6" data-testid="card-performance-difficulty">
            <CardHeader>
              <CardTitle className="text-lg text-chess-secondary flex items-center gap-2">
                <i className="fas fa-brain text-chess-primary"></i>
                Performance by AI Difficulty
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(stats.performanceByDifficulty).map(([range, data]) => (
                  <div key={range} className="p-3 bg-chess-primary/10 rounded-lg" data-testid={`stat-difficulty-${range}`}>
                    <div className="font-bold text-chess-secondary mb-1">{range} ELO</div>
                    <div className="text-sm text-gray-400">
                      {data.wins} / {data.total} games ({data.winRate.toFixed(1)}%)
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Performance by Mode */}
        {stats && Object.keys(stats.performanceByMode).length > 0 && (
          <Card className="bg-chess-secondary/20 border-chess-secondary/30" data-testid="card-performance-mode">
            <CardHeader>
              <CardTitle className="text-lg text-chess-secondary flex items-center gap-2">
                <i className="fas fa-th text-chess-primary"></i>
                Performance by Game Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.entries(stats.performanceByMode)
                  .sort((a, b) => Number(a[0]) - Number(b[0]))
                  .map(([mode, data]) => (
                    <div key={mode} className="p-3 bg-chess-accent/10 rounded-lg text-center" data-testid={`stat-mode-${mode}`}>
                      <div className="text-2xl font-bold text-chess-accent">{mode}</div>
                      <div className="text-xs text-gray-400 mb-1">cards</div>
                      <div className="text-sm text-white">
                        {data.wins}/{data.total}
                      </div>
                      <div className="text-xs text-chess-success">
                        {data.winRate.toFixed(1)}% win
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
