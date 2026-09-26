import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, Target, Award } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface RatingInfo {
  rating: number;
  gamesPlayed: number;
  gamesWon: number;
  winRate: string;
  ratingInfo: {
    tier: string;
    color: string;
    currentTier: string;
    nextTier: string | null;
    progress: number;
    pointsNeeded: number;
  };
}

interface RatingDisplayProps {
  ratingChange?: {
    oldRating: number;
    newRating: number;
    change: number;
    tier: string;
  } | null;
}

export function RatingDisplay({ ratingChange }: RatingDisplayProps) {
  const { isAuthenticated } = useAuth();
  const [ratingInfo, setRatingInfo] = useState<RatingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchRatingInfo = async () => {
      try {
        const response = await fetch('/api/user/rating');
        if (response.ok) {
          const data = await response.json();
          setRatingInfo(data);
        }
      } catch (error) {
        console.error('Failed to fetch rating info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRatingInfo();
  }, [isAuthenticated, ratingChange]);

  if (!isAuthenticated || isLoading) {
    return null;
  }

  if (!ratingInfo) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <p className="text-gray-600">Rating information unavailable</p>
        </CardContent>
      </Card>
    );
  }

  const getTierColor = (tier: string) => {
    const colors: { [key: string]: string } = {
      'Learning': 'text-gray-600 bg-gray-100',
      'Beginner': 'text-green-600 bg-green-100',
      'Novice': 'text-green-600 bg-green-100',
      'Improving': 'text-blue-600 bg-blue-100',
      'Intermediate': 'text-yellow-600 bg-yellow-100',
      'Advanced': 'text-orange-600 bg-orange-100',
      'Expert': 'text-red-600 bg-red-100',
      'Master': 'text-purple-600 bg-purple-100',
      'Grandmaster': 'text-purple-700 bg-purple-200',
    };
    return colors[tier] || 'text-gray-600 bg-gray-100';
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-[#769656]/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-[#769656]">
          <Trophy className="w-5 h-5" />
          Your Rating
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Rating */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-[#769656]">
              {ratingInfo.rating}
              {ratingChange && (
                <span className={`ml-2 text-lg ${ratingChange.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {ratingChange.change >= 0 ? '+' : ''}{ratingChange.change}
                </span>
              )}
            </div>
            <Badge className={getTierColor(ratingInfo.ratingInfo.currentTier)}>
              {ratingInfo.ratingInfo.currentTier}
            </Badge>
          </div>
          <Award className="w-8 h-8 text-[#769656]/60" />
        </div>

        {/* Progress to next tier */}
        {ratingInfo.ratingInfo.nextTier && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Progress to {ratingInfo.ratingInfo.nextTier}
              </span>
              <span className="text-gray-600">
                {ratingInfo.ratingInfo.pointsNeeded} points needed
              </span>
            </div>
            <Progress 
              value={ratingInfo.ratingInfo.progress} 
              className="h-2"
            />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-[#769656]">
              {ratingInfo.gamesPlayed}
            </div>
            <div className="text-xs text-gray-600">Games</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-[#769656]">
              {ratingInfo.gamesWon}
            </div>
            <div className="text-xs text-gray-600">Wins</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-[#769656]">
              {ratingInfo.winRate}%
            </div>
            <div className="text-xs text-gray-600">Win Rate</div>
          </div>
        </div>

        {/* Rating change display */}
        {ratingChange && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium">Last Game:</span>
              <span className="text-gray-600">
                {ratingChange.oldRating} → {ratingChange.newRating}
              </span>
              <span className={`font-semibold ${ratingChange.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {ratingChange.change >= 0 ? '+' : ''}{ratingChange.change}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}